// GET /api/jobs/[jobId]?endpoint=<fal-endpoint> — Poll job status from fal.ai queue.
import { NextRequest, NextResponse } from 'next/server'
import { fal } from '@/lib/ai/fal-client'
import type { JobResult } from '@/lib/jobs/job-types'

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const { jobId } = params
  const endpoint = req.nextUrl.searchParams.get('endpoint')

  if (!jobId || !endpoint) {
    return NextResponse.json({ error: 'jobId ve endpoint gerekli' }, { status: 400 })
  }

  try {
    const statusRes = await fal.queue.status(endpoint, {
      requestId: jobId,
      logs: false,
    })

    const status = statusRes.status  // 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED'

    if (status === 'COMPLETED') {
      // Fetch the actual result
      const result = await fal.queue.result(endpoint, { requestId: jobId }) as any

      // Try common output URL paths
      const outputUrl: string =
        result?.data?.video?.url ||
        result?.data?.images?.[0]?.url ||
        result?.data?.image?.url ||
        result?.data?.output?.url ||
        result?.data?.audio?.url ||
        ''

      const jobResult: JobResult = {
        jobId,
        requestId: jobId,
        status: 'completed',
        outputUrl: outputUrl || undefined,
      }
      return NextResponse.json(jobResult)
    }

    if (status === 'IN_PROGRESS' || status === 'IN_QUEUE') {
      const jobResult: JobResult = {
        jobId,
        requestId: jobId,
        status: status === 'IN_PROGRESS' ? 'processing' : 'pending',
        // fal.ai sometimes returns logs with progress info
        progress: (statusRes as any).progress ?? undefined,
      }
      return NextResponse.json(jobResult)
    }

    // FAILED or unknown
    return NextResponse.json({
      jobId,
      requestId: jobId,
      status: 'failed',
      error: (statusRes as any).error || 'İşlem başarısız',
    } satisfies JobResult)

  } catch (err: any) {
    console.error(`[GET /api/jobs/${jobId}]`, err)
    return NextResponse.json({
      jobId,
      requestId: jobId,
      status: 'failed',
      error: err.message || 'Durum alınamadı',
    } satisfies JobResult, { status: 500 })
  }
}
