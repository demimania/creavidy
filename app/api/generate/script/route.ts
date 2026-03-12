// POST /api/generate/script — Generate video script via LLM
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
    const { model, prompt, sceneCount, language } = body
    if (!prompt) return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })

    const result = await generateScript({ model: model || 'gpt-4o', prompt, sceneCount: sceneCount || 5, language: language || 'English' })

    // FAZ 1: UX-first — deduct silently, don't block on insufficient credits
    await deductCredit({ userId: user.id, amount: result.cost, description: 'Script generation', modelId: model }).catch(() => {})

    return NextResponse.json({ success: true, script: result.script, characters: result.characters, creditsUsed: result.cost })
  } catch (error: any) {
    console.error('[/api/generate/script]', error)
    return NextResponse.json({ error: error.message || 'Script generation failed' }, { status: 500 })
  }
}
