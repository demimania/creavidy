// POST /api/generate/video — Generate video via fal.ai
import { NextRequest, NextResponse } from 'next/server'
import {
  generateVideo,
  generateVideoRunway,
  generateVideoVeo31,
  generateVideoLuma,
  generateVideoMinimax,
  generateVideoWan,
} from '@/lib/ai/fal-client'
import { deductCredit } from '@/lib/services/credits'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { model, prompt, duration, resolution, fps, imageUrl, aspectRatio } = body
    if (!prompt) return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })

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
