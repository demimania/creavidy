import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import {
  fluxDevRedux,
  fluxCannyPro,
  fluxDepthPro,
  img2ImgSD,
  sdControlNets,
  sketchToImage,
} from '@/lib/ai/fal-client'
import { deductCredit, checkBalance } from '@/lib/services/credits'

const COSTS: Record<string, number> = {
  'flux-redux':       8,
  'flux-canny':      12,
  'flux-depth':      12,
  'sd-img2img':       8,
  'sd-controlnets':  10,
  'sketch-to-image': 10,
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { i2iType, imageUrl, prompt, strength, negativePrompt, controlType } = body

  if (!imageUrl) return NextResponse.json({ error: 'imageUrl gerekli' }, { status: 400 })

  // Auth check
  const authHeader = req.headers.get('authorization')
  let userId: string | null = null
  if (authHeader?.startsWith('Bearer ')) {
    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )
    const { data } = await supabaseAdmin.auth.getUser(authHeader.slice(7))
    userId = data.user?.id || null
  }

  try {
    let result: { imageUrl: string; requestId: string }
    const cost = COSTS[i2iType] ?? 8

    switch (i2iType) {
      case 'flux-redux':
        result = await fluxDevRedux({ imageUrl, prompt, strength })
        break
      case 'flux-canny':
        if (!prompt) return NextResponse.json({ error: 'Prompt gerekli' }, { status: 400 })
        result = await fluxCannyPro({ imageUrl, prompt, strength })
        break
      case 'flux-depth':
        if (!prompt) return NextResponse.json({ error: 'Prompt gerekli' }, { status: 400 })
        result = await fluxDepthPro({ imageUrl, prompt, strength })
        break
      case 'sd-img2img':
        if (!prompt) return NextResponse.json({ error: 'Prompt gerekli' }, { status: 400 })
        result = await img2ImgSD({ imageUrl, prompt, strength, negativePrompt })
        break
      case 'sd-controlnets':
        if (!prompt) return NextResponse.json({ error: 'Prompt gerekli' }, { status: 400 })
        result = await sdControlNets({ imageUrl, prompt, strength, controlType })
        break
      case 'sketch-to-image':
        if (!prompt) return NextResponse.json({ error: 'Prompt gerekli' }, { status: 400 })
        result = await sketchToImage({ imageUrl, prompt, strength })
        break
      default:
        return NextResponse.json({ error: `Bilinmeyen i2i tipi: ${i2iType}` }, { status: 400 })
    }

    if (!result.imageUrl) return NextResponse.json({ error: 'Görsel üretilemedi' }, { status: 500 })

    // Deduct credits if authenticated
    let creditsUsed = 0
    if (userId) {
      const balance = await checkBalance(userId, cost)
      if (balance.ok) {
        await deductCredit({ userId, amount: cost, description: `Image I2I: ${i2iType}` })
        creditsUsed = cost
      }
    }

    return NextResponse.json({ imageUrl: result.imageUrl, requestId: result.requestId, creditsUsed })

  } catch (err: any) {
    console.error('[image-i2i]', err)
    return NextResponse.json({ error: err.message || 'Sunucu hatası' }, { status: 500 })
  }
}
