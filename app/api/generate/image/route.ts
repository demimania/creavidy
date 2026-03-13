// POST /api/generate/image — Generate image via fal.ai
import { NextRequest, NextResponse } from 'next/server'
import { generateImage } from '@/lib/ai/fal-client'
import { deductCredit } from '@/lib/services/credits'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    // Auth optional for dev/testing — deduct credits only if logged in
    let userId: string | null = null
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id || null
    } catch {}

    const body = await req.json()
    const { model, prompt, width, height, style } = body
    if (!prompt) return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })

    const result = await generateImage({
      model: model || 'flux-schnell',
      prompt,
      width: width || 1024,
      height: height || 1024,
      style,
    })

    // FAZ 1: UX-first — deduct silently, don't block on insufficient credits
    if (userId) {
      await deductCredit({ userId, amount: result.cost, description: 'Image generation', modelId: model }).catch(() => {})
    }

    return NextResponse.json({ success: true, imageUrl: result.imageUrl, requestId: result.requestId, creditsUsed: result.cost })
  } catch (error: any) {
    console.error('[/api/generate/image]', error)
    return NextResponse.json({ error: error.message || 'Image generation failed' }, { status: 500 })
  }
}
