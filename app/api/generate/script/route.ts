// POST /api/generate/script — Generate video script via LLM
import { NextRequest, NextResponse } from 'next/server'
import { generateScript } from '@/lib/ai/fal-client'
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
    const { model, prompt, sceneCount, language } = body
    if (!prompt) return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })

    const result = await generateScript({ model: model || 'gpt-4o', prompt, sceneCount: sceneCount || 5, language: language || 'English' })

    // FAZ 1: UX-first — deduct silently, don't block on insufficient credits
    if (userId) {
      await deductCredit({ userId, amount: result.cost, description: 'Script generation', modelId: model }).catch(() => {})
    }

    console.log('[/api/generate/script] characters:', JSON.stringify(result.characters))
    return NextResponse.json({ success: true, script: result.script, characters: result.characters, creditsUsed: result.cost })
  } catch (error: any) {
    console.error('[/api/generate/script]', error)
    return NextResponse.json({ error: error.message || 'Script generation failed' }, { status: 500 })
  }
}
