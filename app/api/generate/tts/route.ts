// POST /api/generate/tts — Generate speech from text
import { NextRequest, NextResponse } from 'next/server'
import { generateTTS } from '@/lib/ai/fal-client'
import { deductCredit } from '@/lib/services/credits'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { engine, text, voiceId, speed } = body
    if (!text) return NextResponse.json({ error: 'Text is required' }, { status: 400 })

    const result = await generateTTS({ engine: engine || 'openai-tts', text, voiceId, speed: speed || 1.0 })

    // FAZ 1: UX-first — deduct silently, don't block on insufficient credits
    await deductCredit({ userId: user.id, amount: result.cost, description: 'TTS generation', modelId: engine }).catch(() => {})

    return NextResponse.json({ success: true, audioUrl: result.audioUrl, creditsUsed: result.cost })
  } catch (error: any) {
    console.error('[/api/generate/tts]', error)
    return NextResponse.json({ error: error.message || 'TTS generation failed' }, { status: 500 })
  }
}
