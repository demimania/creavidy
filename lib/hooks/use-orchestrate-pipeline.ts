'use client'

import { useCallback, useRef, useState } from 'react'
import type { ChatMessageData } from '@/components/chat/ChatMessage'
import type { OrchestratorEvent } from '@/lib/ai/tool-call-types'
import type { VideoBriefConfig } from '@/lib/stores/workspace-store'
import { withRetry, isRetryableError } from '@/lib/utils/retry'

export interface PipelineParams {
  briefConfig: VideoBriefConfig
  briefNodeId: string
}

export interface PipelineState {
  isRunning: boolean
  currentStep: string | null
  progress: number // 0-100
  completedSteps: number
  totalSteps: number
}

/**
 * Hook to run the 9-step orchestrate pipeline via SSE,
 * with in-place tool call updates (running → success/error).
 */
export function useOrchestratePipeline(
  onMessages: (msgs: ChatMessageData[]) => void,
  onUpdateMessage?: (id: string, updates: Partial<ChatMessageData>) => void,
  onSceneUpdate?: (sceneIndex: number, data: { image_url?: string; audio_url?: string }) => void,
  onComplete?: (totalCredits: number) => void,
) {
  const [state, setState] = useState<PipelineState>({
    isRunning: false,
    currentStep: null,
    progress: 0,
    completedSteps: 0,
    totalSteps: 9,
  })
  const abortRef = useRef<AbortController | null>(null)

  const STEP_COUNT = 9

  const run = useCallback(async (params: PipelineParams) => {
    if (state.isRunning) return

    const { briefConfig, briefNodeId } = params
    setState({ isRunning: true, currentStep: 'create_card', progress: 0, completedSteps: 0, totalSteps: STEP_COUNT })
    abortRef.current = new AbortController()

    // Track tool call message IDs for in-place updates
    const toolCallMessageIds = new Map<string, string>() // toolName → messageId

    const requestBody = JSON.stringify({
      script: briefConfig.prompt || briefConfig.theme || 'Create a video',
      title: briefConfig.theme || 'Video Brief',
      visual_style: briefConfig.visualStyle || 'Cartoon 3D',
      narrator: briefConfig.narrator || 'Lady Holiday',
      narrator_voice_id: 'alloy',
      characters: briefConfig.character ? [briefConfig.character] : [],
      music: briefConfig.music || 'Deep background',
      scene_media: briefConfig.sceneMedia === 'Video clips' ? 'video' : 'images',
      duration: parseInt(briefConfig.duration) || 30,
      aspect_ratio: briefConfig.aspect || '16:9',
      platform: briefConfig.platform || 'YouTube',
      image_model: 'flux-schnell',
      tts_engine: 'openai-tts',
      script_model: 'gpt-4o',
    })

    try {
      // Retry SSE connection up to 3 times on server/network errors
      const res = await withRetry(
        async () => {
          const response = await fetch('/api/chat/orchestrate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: abortRef.current!.signal,
            body: requestBody,
          })
          if (!response.ok) throw new Error(`Pipeline error: ${response.status}`)
          return response
        },
        {
          maxRetries: 2,
          initialDelay: 2000,
          shouldRetry: isRetryableError,
          onRetry: (attempt, error) => {
            onMessages([{
              id: `retry-${Date.now()}`,
              role: 'assistant',
              content: `Connection issue, retrying... (attempt ${attempt}/2)`,
            }])
          },
        },
      )

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let stepIndex = 0

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(l => l.startsWith('data:'))

        for (const line of lines) {
          const raw = line.slice(5).trim()
          if (raw === '[DONE]') break

          let event: OrchestratorEvent
          try {
            event = JSON.parse(raw)
          } catch {
            continue
          }

          const ts = Date.now()

          if (event.type === 'tool_call') {
            const toolName = event.name

            if (event.status === 'running') {
              stepIndex++
              setState(prev => ({
                ...prev,
                currentStep: toolName,
                progress: Math.round((stepIndex / STEP_COUNT) * 100),
                completedSteps: stepIndex - 1,
              }))

              // Create new tool call message
              const msgId = `tc-${toolName}-${ts}`
              toolCallMessageIds.set(toolName, msgId)
              onMessages([{
                id: msgId,
                role: 'assistant',
                content: '',
                msg_type: 'tool_call',
                tool_name: toolName,
                tool_status: 'running',
                tool_label: event.label,
              }])
            }

            if (event.status === 'success' || event.status === 'error') {
              // In-place update: find existing message and update it
              const existingMsgId = toolCallMessageIds.get(toolName)
              if (existingMsgId && onUpdateMessage) {
                onUpdateMessage(existingMsgId, {
                  tool_status: event.status,
                  tool_data: event.data,
                  content: event.error || '',
                })
              } else {
                // Fallback: add as new message
                onMessages([{
                  id: `tc-${toolName}-${event.status}-${ts}`,
                  role: 'assistant',
                  content: event.error || '',
                  msg_type: 'tool_call',
                  tool_name: toolName,
                  tool_status: event.status,
                  tool_label: event.label,
                  tool_data: event.data,
                }])
              }

              setState(prev => ({
                ...prev,
                completedSteps: stepIndex,
              }))

              // Extract scene media URLs from tool data
              if (toolName === 'generate_scene_media' && event.status === 'success' && event.data?.scenes) {
                const scenesData = event.data.scenes as Array<{ index: number; image_url?: string }>
                scenesData.forEach(s => {
                  if (s.image_url) onSceneUpdate?.(s.index - 1, { image_url: s.image_url })
                })
              }
              if (toolName === 'generate_voiceover' && event.status === 'success' && event.data?.scenes) {
                const scenesData = event.data.scenes as Array<{ index: number; audio_url?: string }>
                scenesData.forEach(s => {
                  if (s.audio_url) onSceneUpdate?.(s.index - 1, { audio_url: s.audio_url })
                })
              }
            }
          }

          if (event.type === 'message') {
            onMessages([{
              id: `msg-${ts}`,
              role: 'assistant',
              content: event.content,
            }])
          }

          if (event.type === 'card_badge') {
            onMessages([{
              id: `badge-${ts}`,
              role: 'assistant',
              content: '',
              msg_type: 'card_badge',
              card_id: briefNodeId,
              card_title: event.title,
              card_subtitle: event.subtitle,
            }])
          }

          if (event.type === 'done') {
            onMessages([{
              id: `done-${ts}`,
              role: 'assistant',
              content: '',
              msg_type: 'done',
              total_credits: event.total_credits,
              brief_id: event.brief_id,
            }])
            onComplete?.(event.total_credits)
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      onMessages([{
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Pipeline error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      }])
    } finally {
      setState({ isRunning: false, currentStep: null, progress: 100, completedSteps: STEP_COUNT, totalSteps: STEP_COUNT })
      abortRef.current = null
    }
  }, [state.isRunning, onMessages, onUpdateMessage, onSceneUpdate, onComplete])

  const stop = useCallback(() => {
    abortRef.current?.abort()
    setState({ isRunning: false, currentStep: null, progress: 0, completedSteps: 0, totalSteps: STEP_COUNT })
  }, [])

  return { state, run, stop }
}
