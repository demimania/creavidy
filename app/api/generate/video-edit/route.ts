import { NextRequest, NextResponse } from 'next/server'
import { lipSyncVideo, videoToVideo, upscaleVideo, enhanceVideo } from '@/lib/ai/fal-client'

export async function POST(req: NextRequest) {
  const { editType, videoUrl, audioUrl, prompt, strength, scale } = await req.json()

  try {
    let result: { videoUrl: string; requestId: string }
    let creditsUsed = 0

    switch (editType) {
      case 'lipsync':
        result = await lipSyncVideo({ videoUrl, audioUrl })
        creditsUsed = 20
        break
      case 'v2v':
        result = await videoToVideo({ videoUrl, prompt, strength })
        creditsUsed = 25
        break
      case 'upscale':
        result = await upscaleVideo({ videoUrl, scale })
        creditsUsed = 10
        break
      case 'enhance':
        result = await enhanceVideo({ videoUrl })
        creditsUsed = 8
        break
      default:
        return NextResponse.json({ error: 'Invalid editType' }, { status: 400 })
    }

    return NextResponse.json({ videoUrl: result.videoUrl, requestId: result.requestId, creditsUsed })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
