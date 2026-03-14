// ============================================================================
// Background Job Types
// Long-running AI operations (video gen, etc.) use fal.ai queue.
// Pattern: POST /api/jobs → {jobId}  then  GET /api/jobs/{jobId} → status
// ============================================================================

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface JobPayload {
  endpoint: string
  input: Record<string, unknown>
  /** User-facing label for toasts */
  label?: string
}

export interface JobResult {
  jobId: string
  requestId: string
  status: JobStatus
  outputUrl?: string
  error?: string
  progress?: number  // 0-100
  creditsUsed?: number
}
