import { NextRequest, NextResponse } from 'next/server'
import { cloneVoiceFishAudio, cloneVoiceElevenLabs } from '@/lib/ai/fal-client'

export async function POST(req: NextRequest) {
  const { provider, text, referenceAudioUrl, voiceId } = await req.json()
  try {
    let result: { audioUrl: string; requestId: string }
    let creditsUsed = 0
    switch (provider) {
      case 'fish-audio':
        result = await cloneVoiceFishAudio({ text, referenceAudioUrl })
        creditsUsed = 5
        break
      case 'elevenlabs':
      default:
        result = await cloneVoiceElevenLabs({ text, voiceId })
        creditsUsed = 6
    }
    return NextResponse.json({ audioUrl: result.audioUrl, requestId: result.requestId, creditsUsed })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
