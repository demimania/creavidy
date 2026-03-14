import { describe, it, expect } from 'vitest'
import type { JobStatus, JobPayload, JobResult } from '@/lib/jobs/job-types'

describe('Job types', () => {
  it('JobStatus covers all fal.ai states', () => {
    const validStatuses: JobStatus[] = ['pending', 'processing', 'completed', 'failed']
    expect(validStatuses).toHaveLength(4)
  })

  it('JobPayload requires endpoint and input', () => {
    const payload: JobPayload = {
      endpoint: 'fal-ai/kling-video/v3/standard/text-to-video',
      input: { prompt: 'A beautiful sunset', duration: 5 },
      label: 'Video Generation',
    }
    expect(payload.endpoint).toContain('fal-ai/')
    expect(payload.input).toBeDefined()
  })

  it('JobResult can represent all states', () => {
    const pending: JobResult = { jobId: 'abc123', requestId: 'abc123', status: 'pending' }
    const completed: JobResult = {
      jobId: 'abc123',
      requestId: 'abc123',
      status: 'completed',
      outputUrl: 'https://fal.media/files/video.mp4',
      creditsUsed: 35,
    }
    const failed: JobResult = {
      jobId: 'abc123',
      requestId: 'abc123',
      status: 'failed',
      error: 'Rate limit exceeded',
    }
    expect(pending.status).toBe('pending')
    expect(completed.outputUrl).toBeDefined()
    expect(failed.error).toBeDefined()
  })
})
