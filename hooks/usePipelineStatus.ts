'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

export type PipelineStep = 'queued' | 'script' | 'image' | 'video' | 'tts' | 'complete' | 'error'

export interface PipelineStatus {
  id: string
  status: string
  current_step: PipelineStep | null
  script_output?: string | null
  image_url?: string | null
  video_url?: string | null
  audio_url?: string | null
  error_message?: string | null
  total_credits_used: number
  updated_at: string
}

const STEP_LABELS: Record<string, string> = {
  queued: 'Kuyrukta bekliyor...',
  script: 'Script yazılıyor...',
  image: 'Görsel oluşturuluyor...',
  video: 'Video üretiliyor...',
  tts: 'Seslendirme yapılıyor...',
  complete: 'Tamamlandı',
  error: 'Hata oluştu',
}

export function usePipelineStatus(pipelineId: string | null, pollInterval = 3000) {
  const [status, setStatus] = useState<PipelineStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeRef = useRef(false)

  const poll = useCallback(async () => {
    if (!pipelineId || !activeRef.current) return

    try {
      const res = await fetch(`/api/pipeline/status/${pipelineId}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: PipelineStatus = await res.json()
      setStatus(data)

      // Terminal states: stop polling
      if (data.status === 'complete' || data.status === 'error') {
        activeRef.current = false
        setLoading(false)
        return
      }
    } catch (e: any) {
      setError(e.message)
    }

    if (activeRef.current) {
      timerRef.current = setTimeout(poll, pollInterval)
    }
  }, [pipelineId, pollInterval])

  useEffect(() => {
    if (!pipelineId) return
    activeRef.current = true
    setLoading(true)
    setError(null)
    poll()

    return () => {
      activeRef.current = false
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [pipelineId, poll])

  const stepLabel = status?.current_step ? (STEP_LABELS[status.current_step] ?? status.current_step) : null
  const isDone = status?.status === 'complete'
  const isFailed = status?.status === 'error'

  return { status, loading, error, stepLabel, isDone, isFailed }
}
