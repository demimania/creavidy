import { NextRequest, NextResponse } from 'next/server'
import { generateAudio, generateSunoMusic } from '@/lib/ai/fal-client'

export async function POST(req: NextRequest) {
  const { type, prompt, style, duration, steps } = await req.json()
  try {
    let result: { audioUrl: string; requestId: string }
    let creditsUsed = 0
    switch (type) {
      case 'suno':
        result = await generateSunoMusic({ prompt, style, duration })
        creditsUsed = 12
        break
      case 'stable-audio':
      default:
        result = await generateAudio({ prompt, duration, steps })
        creditsUsed = 8
    }
    return NextResponse.json({ audioUrl: result.audioUrl, requestId: result.requestId, creditsUsed })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
