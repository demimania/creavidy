// POST /api/generate/video — Generate video via fal.ai
import { NextRequest, NextResponse } from 'next/server'
import { generateVideo } from '@/lib/ai/fal-client'
import { deductCredit } from '@/lib/services/credits'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { model, prompt, duration, resolution, fps, imageUrl } = body
    if (!prompt) return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })

    const result = await generateVideo({
      model: model || 'kling-3.0-standard-t2v',
      prompt,
      duration: duration || 5,
      resolution: resolution || '1080p',
      fps: fps || 24,
      imageUrl,
    })

    // FAZ 1: UX-first — deduct silently, don't block on insufficient credits
    await deductCredit({ userId: user.id, amount: result.cost, description: 'Video generation', modelId: model }).catch(() => {})

    return NextResponse.json({ success: true, videoUrl: result.videoUrl, requestId: result.requestId, creditsUsed: result.cost })
  } catch (error: any) {
    console.error('[/api/generate/video]', error)
    return NextResponse.json({ error: error.message || 'Video generation failed' }, { status: 500 })
  }
}
