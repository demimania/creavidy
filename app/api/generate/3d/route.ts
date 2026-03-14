import { NextRequest, NextResponse } from 'next/server'
import { generate3DTripo, generate3DHyper } from '@/lib/ai/fal-client'

export async function POST(req: NextRequest) {
  const { model, prompt, imageUrl } = await req.json()
  try {
    let result: { modelUrl: string; requestId: string }
    let creditsUsed = 0
    switch (model) {
      case 'triposr':
        result = await generate3DTripo({ prompt, imageUrl })
        creditsUsed = 15
        break
      case 'hyper3d':
        result = await generate3DHyper({ prompt, imageUrl })
        creditsUsed = 25
        break
      default:
        result = await generate3DTripo({ prompt, imageUrl })
        creditsUsed = 15
    }
    return NextResponse.json({ modelUrl: result.modelUrl, requestId: result.requestId, creditsUsed })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
