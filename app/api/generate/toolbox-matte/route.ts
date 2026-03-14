import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { extractMask, maskByText, videoMatte } from '@/lib/ai/fal-client'
import { deductCredit, checkBalance } from '@/lib/services/credits'

const COSTS: Record<string, number> = {
  'mask-extractor':  6,
  'mask-by-text':    8,
  'video-matte':    12,
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { matteType, imageUrl, videoUrl, text } = body

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
    const cost = COSTS[matteType] ?? 6
    let result: { url: string; requestId: string }

    switch (matteType) {
      case 'mask-extractor': {
        if (!imageUrl) return NextResponse.json({ error: 'imageUrl gerekli' }, { status: 400 })
        const r = await extractMask({ imageUrl })
        result = { url: r.maskUrl, requestId: r.requestId }
        break
      }
      case 'mask-by-text': {
        if (!imageUrl || !text) return NextResponse.json({ error: 'imageUrl ve text gerekli' }, { status: 400 })
        const r = await maskByText({ imageUrl, text })
        result = { url: r.maskUrl, requestId: r.requestId }
        break
      }
      case 'video-matte': {
        if (!videoUrl) return NextResponse.json({ error: 'videoUrl gerekli' }, { status: 400 })
        const r = await videoMatte({ videoUrl })
        result = { url: r.matteUrl, requestId: r.requestId }
        break
      }
      default:
        return NextResponse.json({ error: `Bilinmeyen matteType: ${matteType}` }, { status: 400 })
    }

    if (!result.url) return NextResponse.json({ error: 'Sonuç üretilemedi' }, { status: 500 })

    let creditsUsed = 0
    if (userId) {
      const balance = await checkBalance(userId, cost)
      if (balance.ok) {
        await deductCredit({ userId, amount: cost, description: `Toolbox Matte: ${matteType}` })
        creditsUsed = cost
      }
    }

    return NextResponse.json({ url: result.url, requestId: result.requestId, creditsUsed })

  } catch (err: any) {
    console.error('[toolbox-matte]', err)
    return NextResponse.json({ error: err.message || 'Sunucu hatası' }, { status: 500 })
  }
}
