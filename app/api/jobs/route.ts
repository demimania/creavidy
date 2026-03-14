// POST /api/jobs — Submit a long-running AI job to fal.ai queue.
// Returns immediately with { jobId } so the client can poll.
import { NextRequest, NextResponse } from 'next/server'
import { fal } from '@/lib/ai/fal-client'
import type { JobPayload } from '@/lib/jobs/job-types'

export async function POST(req: NextRequest) {
  try {
    const body: JobPayload = await req.json()
    const { endpoint, input } = body

    if (!endpoint || !input) {
      return NextResponse.json({ error: 'endpoint ve input gerekli' }, { status: 400 })
    }

    // Submit to fal.ai queue — returns requestId immediately (no waiting)
    const { request_id: requestId } = await fal.queue.submit(endpoint, {
      input: input as any,
    })

    return NextResponse.json({ jobId: requestId, requestId, status: 'pending' })

  } catch (err: any) {
    console.error('[POST /api/jobs]', err)
    return NextResponse.json({ error: err.message || 'Job başlatılamadı' }, { status: 500 })
  }
}
