// POST /api/generate/video — Generate video via fal.ai
// Supports `mode: 'queue'` for long-running jobs: returns {jobId} immediately.
// Client polls GET /api/jobs/[jobId]?endpoint=... for result.
import { NextRequest, NextResponse } from 'next/server'
import {
  generateVideo,
  generateVideoRunway,
  generateVideoVeo31,
  generateVideoLuma,
  generateVideoMinimax,
  generateVideoWan,
  FAL_VIDEO_MODELS,
  fal,
} from '@/lib/ai/fal-client'
import { deductCredit } from '@/lib/services/credits'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, RATE_LIMITS } from '@/lib/services/rate-limit'

// Models that are known to take >30s — always use queue
const LONG_RUNNING_MODELS = new Set([
  'veo-3', 'veo-3.1', 'sora-2-pro', 'wan-2.6-t2v', 'hunyuan',
  'luma-dream', 'minimax-hailuo', 'kling-2.0-master',
  'kling-3.0-standard-t2v', 'kling-3.0-standard-i2v',
  'kling-3.0-pro-t2v', 'kling-2.5-turbo',
])

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // ── Rate limit ────────────────────────────────────────────────────────────
    const rl = checkRateLimit(`video:${user.id}`, RATE_LIMITS.videoGen.limit, RATE_LIMITS.videoGen.windowMs)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Çok fazla istek. ${Math.ceil(rl.resetInMs / 1000)}s sonra tekrar dene.` },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.resetInMs / 1000)) } }
      )
    }

    const body = await req.json()
    const { model, prompt, duration, resolution, fps, imageUrl, aspectRatio, mode } = body
    if (!prompt) return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })

    // ── QUEUE MODE: submit to fal.ai queue, return jobId immediately ──────────
    const useQueue = mode === 'queue' || LONG_RUNNING_MODELS.has(model)
    if (useQueue) {
      const endpoint = FAL_VIDEO_MODELS[model] || FAL_VIDEO_MODELS['kling-3.0-standard-t2v']
      const input: Record<string, unknown> = { prompt, duration: duration || 5 }
      if (imageUrl) input.image_url = imageUrl
      if (aspectRatio) input.aspect_ratio = aspectRatio

      const { request_id: requestId } = await fal.queue.submit(endpoint, { input: input as any })
      return NextResponse.json({ mode: 'queue', jobId: requestId, endpoint, status: 'pending' })
    }
    // ── SYNC MODE (short operations) ─────────────────────────────────────────

    let videoUrl: string
    let requestId: string
    let creditsUsed: number

    // Route to model-specific functions for new providers
    switch (model) {
      case 'runway-gen4':
        { const r = await generateVideoRunway({ prompt, imageUrl, duration }); videoUrl = r.videoUrl; requestId = r.requestId; creditsUsed = 30; break }
      case 'veo3':
        { const r = await generateVideoVeo31({ prompt, duration, aspectRatio }); videoUrl = r.videoUrl; requestId = r.requestId; creditsUsed = 50; break }
      case 'luma':
        { const r = await generateVideoLuma({ prompt, imageUrl, duration }); videoUrl = r.videoUrl; requestId = r.requestId; creditsUsed = 20; break }
      case 'minimax':
        { const r = await generateVideoMinimax({ prompt, duration }); videoUrl = r.videoUrl; requestId = r.requestId; creditsUsed = 25; break }
      case 'wan':
        { const r = await generateVideoWan({ prompt, duration, aspectRatio }); videoUrl = r.videoUrl; requestId = r.requestId; creditsUsed = 20; break }
      default: {
        // Existing Kling / LTX / etc. models via generateVideo
        const result = await generateVideo({
          model: model || 'kling-3.0-standard-t2v',
          prompt,
          duration: duration || 5,
          resolution: resolution || '1080p',
          fps: fps || 24,
          imageUrl,
        })
        videoUrl = result.videoUrl
        requestId = String(result.requestId || '')
        creditsUsed = result.cost
      }
    }

    // FAZ 1: UX-first — deduct silently, don't block on insufficient credits
    await deductCredit({ userId: user.id, amount: creditsUsed, description: 'Video generation', modelId: model }).catch(() => {})

    return NextResponse.json({ success: true, videoUrl, requestId, creditsUsed })
  } catch (error: any) {
    console.error('[/api/generate/video]', error)
    return NextResponse.json({ error: error.message || 'Video generation failed' }, { status: 500 })
  }
}
