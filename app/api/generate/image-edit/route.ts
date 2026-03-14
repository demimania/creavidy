import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { editImageKontext, removeBackground, upscaleImage, inpaintImage } from '@/lib/ai/fal-client'
import { deductCredit, checkBalance } from '@/lib/services/credits'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { editType, imageUrl, prompt, maskUrl, scale } = body

  if (!imageUrl) return NextResponse.json({ error: 'imageUrl required' }, { status: 400 })

  // Auth check (optional — deduct credits if logged in)
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
    let result: { imageUrl: string; requestId?: string; cost: number }

    switch (editType) {
      case 'kontext':
        if (!prompt) return NextResponse.json({ error: 'prompt required for kontext' }, { status: 400 })
        result = await editImageKontext({ imageUrl, prompt })
        break
      case 'remove-bg':
        result = await removeBackground({ imageUrl })
        break
      case 'upscale':
        result = await upscaleImage({ imageUrl, scale: scale || 2 })
        break
      case 'inpaint':
        if (!prompt || !maskUrl) return NextResponse.json({ error: 'prompt and maskUrl required' }, { status: 400 })
        result = await inpaintImage({ imageUrl, maskUrl, prompt })
        break
      default:
        return NextResponse.json({ error: `Unknown editType: ${editType}` }, { status: 400 })
    }

    // Deduct credits if authenticated
    let creditsUsed = 0
    if (userId) {
      const balance = await checkBalance(userId, result.cost)
      if (balance.ok) {
        await deductCredit({ userId, amount: result.cost, description: `Image Edit: ${editType}` })
        creditsUsed = result.cost
      }
    }

    return NextResponse.json({
      imageUrl: result.imageUrl,
      requestId: result.requestId,
      creditsUsed,
    })
  } catch (error: any) {
    console.error('[image-edit]', error)
    return NextResponse.json({ error: error.message || 'Image edit failed' }, { status: 500 })
  }
}
