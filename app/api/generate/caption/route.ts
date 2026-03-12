// POST /api/generate/caption — Video altyazı üretimi (henüz aktif değil)
import { NextRequest, NextResponse } from 'next/server'

export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { error: 'Caption generation is not yet available', comingSoon: true },
    { status: 501 }
  )
}
