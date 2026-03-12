// POST /api/generate/video-brief — Generate structured scene plan from a video brief
import { NextRequest, NextResponse } from 'next/server'
import { generateScript } from '@/lib/ai/fal-client'
import { deductCredit } from '@/lib/services/credits'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const {
      prompt,
      theme,
      visualStyle,
      narrator,
      duration,   // '30s' | '60s' | '3min'
      aspect,     // '9:16' | '16:9' | '1:1'
      sceneCount,
      language = 'English',
    } = body

    if (!prompt) return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })

    // Determine scene count from duration
    const durationMap: Record<string, number> = { '30s': 3, '60s': 5, '3min': 10 }
    const numScenes = sceneCount || durationMap[duration] || 3

    // Build enriched prompt with style context
    const enrichedPrompt = [
      prompt,
      theme ? `Theme: ${theme}` : '',
      visualStyle ? `Visual style: ${visualStyle}` : '',
      narrator ? `Narrator personality: ${narrator}` : '',
      aspect ? `Aspect ratio: ${aspect}` : '',
    ].filter(Boolean).join('. ')

    const result = await generateScript({
      model: 'gemini-2.0',
      prompt: enrichedPrompt,
      sceneCount: numScenes,
      language,
    })

    await deductCredit({
      userId: user.id,
      amount: result.cost,
      description: 'Video brief scene plan',
      modelId: 'gemini-2.0',
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      script: result.script,   // JSON array string of scenes
      characters: result.characters,
      creditsUsed: result.cost,
    })
  } catch (error: any) {
    console.error('[/api/generate/video-brief]', error)
    return NextResponse.json({ error: error.message || 'Video brief generation failed' }, { status: 500 })
  }
}
