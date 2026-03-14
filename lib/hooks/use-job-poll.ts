'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { JobResult, JobStatus } from '@/lib/jobs/job-types'

interface UseJobPollOptions {
  /** fal.ai endpoint — needed for status checks */
  endpoint: string
  /** Poll interval in ms (default 3000) */
  interval?: number
  /** Stop polling after this many ms (default 5 min) */
  timeout?: number
  onCompleted?: (result: JobResult) => void
  onFailed?: (error: string) => void
}

interface UseJobPollReturn {
  status: JobStatus | null
  outputUrl: string | null
  error: string | null
  progress: number | null
  /** Submit a new job — returns jobId */
  submit: (falEndpoint: string, input: Record<string, unknown>) => Promise<string>
  /** Cancel polling */
  cancel: () => void
}

/**
 * React hook for submitting long-running AI jobs and polling their status.
 *
 * Usage:
 * ```tsx
 * const { submit, status, outputUrl } = useJobPoll({
 *   endpoint: 'fal-ai/kling-video/...',
 *   onCompleted: (r) => updateNodeOutput(id, r.outputUrl!)
 * })
 * await submit(endpoint, input)
 * ```
 */
export function useJobPoll({
  endpoint,
  interval = 3000,
  timeout = 5 * 60 * 1000,
  onCompleted,
  onFailed,
}: UseJobPollOptions): UseJobPollReturn {
  const [status, setStatus] = useState<JobStatus | null>(null)
  const [outputUrl, setOutputUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<number | null>(null)

  const jobIdRef = useRef<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startedAtRef = useRef<number>(0)

  const stopPolling = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const poll = useCallback(async () => {
    const jobId = jobIdRef.current
    if (!jobId) return

    // Timeout guard
    if (Date.now() - startedAtRef.current > timeout) {
      stopPolling()
      setStatus('failed')
      setError('Zaman aşımı — işlem çok uzun sürdü')
      onFailed?.('Zaman aşımı — işlem çok uzun sürdü')
      return
    }

    try {
      const res = await fetch(`/api/jobs/${jobId}?endpoint=${encodeURIComponent(endpoint)}`)
      const data: JobResult = await res.json()

      setStatus(data.status)
      if (data.progress != null) setProgress(data.progress)

      if (data.status === 'completed') {
        stopPolling()
        setOutputUrl(data.outputUrl ?? null)
        onCompleted?.(data)
      } else if (data.status === 'failed') {
        stopPolling()
        setError(data.error ?? 'İşlem başarısız')
        onFailed?.(data.error ?? 'İşlem başarısız')
      }
    } catch (err: any) {
      // Network errors: keep polling (might be transient)
      console.warn('[useJobPoll] poll error:', err.message)
    }
  }, [endpoint, timeout, stopPolling, onCompleted, onFailed])

  const submit = useCallback(async (
    falEndpoint: string,
    input: Record<string, unknown>
  ): Promise<string> => {
    stopPolling()
    setStatus('pending')
    setOutputUrl(null)
    setError(null)
    setProgress(null)

    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: falEndpoint, input }),
    })
    const data = await res.json()
    if (!res.ok || data.error) throw new Error(data.error || 'Job başlatılamadı')

    jobIdRef.current = data.jobId
    startedAtRef.current = Date.now()

    // Start polling
    timerRef.current = setInterval(poll, interval)

    return data.jobId
  }, [interval, stopPolling, poll])

  const cancel = useCallback(() => {
    stopPolling()
    jobIdRef.current = null
    setStatus(null)
  }, [stopPolling])

  // Cleanup on unmount
  useEffect(() => () => stopPolling(), [stopPolling])

  return { status, outputUrl, error, progress, submit, cancel }
}
