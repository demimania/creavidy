'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { ChatMessage, type ChatMessageData } from './ChatMessage'
import { ChatInput, type SuggestedAction } from './ChatInput'
import { Bot } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PipelineState } from '@/lib/hooks/use-orchestrate-pipeline'

export interface Scene {
  scene_order: number
  title: string
  script: string
  visual_prompt: string
  duration_seconds: number
  recommended_model: string
  notes?: string
}

export interface ScenePlan {
  title: string
  summary: string
  total_duration_seconds: number
  scenes: Scene[]
}

function extractScenePlan(text: string): ScenePlan | null {
  const match = text.match(/```json\s*([\s\S]*?)```/)
  if (!match) return null
  try {
    const parsed = JSON.parse(match[1])
    if (parsed.scenes && Array.isArray(parsed.scenes)) return parsed as ScenePlan
  } catch { /* ignore */ }
  return null
}

/** Extract partial brief field updates from ```brief_update blocks */
function extractBriefUpdate(text: string): Record<string, unknown> | null {
  const match = text.match(/```brief_update\s*([\s\S]*?)```/)
  if (!match) return null
  try {
    const parsed = JSON.parse(match[1])
    if (typeof parsed === 'object' && parsed !== null) return parsed
  } catch { /* ignore */ }
  return null
}

interface ChatPanelProps {
  projectId?: string
  initialPrompt?: string
  style?: string
  durationSeconds?: number
  aspectRatio?: string
  onScenesDetected?: (plan: ScenePlan) => void
  onCardBadgeClick?: (cardId: string) => void
  injectedMessages?: ChatMessageData[]
  onInjectedConsumed?: () => void
  briefContext?: Record<string, unknown> | null
  onBriefUpdate?: (updates: Record<string, unknown>) => void
  suggestedActions?: SuggestedAction[]
  onGenerateNow?: () => void
  pipelineState?: PipelineState
  messageUpdates?: Map<string, Partial<ChatMessageData>>
}

const WELCOME_MESSAGE: ChatMessageData = {
  id: 'welcome',
  role: 'assistant',
  content: `Hi! I'm your AI Video Director.\n\nTell me what kind of video you want to create — I'll turn it into a scene-by-scene plan. 🎬`,
}

export function ChatPanel({
  projectId,
  initialPrompt,
  style = 'cinematic',
  durationSeconds = 30,
  aspectRatio = '16:9',
  onScenesDetected,
  onCardBadgeClick,
  injectedMessages,
  onInjectedConsumed,
  briefContext,
  onBriefUpdate,
  suggestedActions,
  onGenerateNow,
  pipelineState,
  messageUpdates,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessageData[]>([WELCOME_MESSAGE])
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const abortRef = useRef<AbortController | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (injectedMessages && injectedMessages.length > 0) {
      setMessages(prev => [...prev, ...injectedMessages])
      onInjectedConsumed?.()
    }
  }, [injectedMessages, onInjectedConsumed])
  const initialPromptSent = useRef(false)

  const displayMessages = useMemo(() => {
    if (!messageUpdates || messageUpdates.size === 0) return messages
    return messages.map(msg => {
      const updates = messageUpdates.get(msg.id)
      if (!updates) return msg
      return { ...msg, ...updates }
    })
  }, [messages, messageUpdates])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  useEffect(() => {
    if (initialPrompt && !initialPromptSent.current) {
      initialPromptSent.current = true
      setTimeout(() => sendMessage(initialPrompt), 600)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt])

  const sendMessage = useCallback(async (content: string) => {
    if (content === '__GENERATE_NOW__') {
      onGenerateNow?.()
      return
    }
    if (isLoading) return

    const userMessage: ChatMessageData = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setStreamingContent('')

    abortRef.current = new AbortController()

    try {
      const history = [...messages, userMessage]
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          project_id: projectId,
          messages: history,
          style,
          duration_seconds: durationSeconds,
          aspect_ratio: aspectRatio,
          brief_context: briefContext || undefined,
        }),
      })

      if (!response.ok) throw new Error(`API error: ${response.status}`)

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      if (!reader) throw new Error('No response body')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(l => l.startsWith('data:'))

        for (const line of lines) {
          const data = line.slice(5).trim()
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            if (parsed.content) {
              accumulated += parsed.content
              setStreamingContent(accumulated)
            }
          } catch { /* ignore */ }
        }
      }

      const assistantMessage: ChatMessageData = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: accumulated || 'Sorry, I could not generate a response.',
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, assistantMessage])
      setStreamingContent('')

      const plan = extractScenePlan(accumulated)
      if (plan && onScenesDetected) {
        onScenesDetected(plan)
      } else {
        const briefUpdate = extractBriefUpdate(accumulated)
        if (briefUpdate && onBriefUpdate) {
          onBriefUpdate(briefUpdate)
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '⚠️ Something went wrong. Please try again.',
      }])
      setStreamingContent('')
    } finally {
      setIsLoading(false)
      abortRef.current = null
    }
  }, [messages, isLoading, projectId, style, durationSeconds, aspectRatio, onScenesDetected, briefContext, onBriefUpdate, onGenerateNow])

  const handleStop = () => {
    abortRef.current?.abort()
    setIsLoading(false)
    if (streamingContent) {
      setMessages(prev => [...prev, {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: streamingContent + ' _(stopped)_',
      }])
      setStreamingContent('')
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#080112]">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.06] flex-shrink-0">
        <div className="w-6 h-6 rounded-lg bg-white/[0.06] flex items-center justify-center">
          <Bot className="w-3.5 h-3.5 text-white/40" />
        </div>
        <span className="flex-1 text-[12px] font-medium text-white/60 tracking-tight">
          AI Video Director
        </span>
        <div className="flex items-center gap-1.5">
          <span className={`w-1 h-1 rounded-full transition-colors ${isLoading ? 'bg-[#a78bfa]/60 animate-pulse' : 'bg-white/15'}`} />
          <span className="text-[10px] text-zinc-700">GPT-4o</span>
        </div>
      </div>

      {/* ── Pipeline progress ───────────────────────────────── */}
      {pipelineState?.isRunning && (
        <div className="px-4 py-2 border-b border-white/[0.04] flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-zinc-500">
              {pipelineState.currentStep?.replace(/_/g, ' ') || 'Starting…'}
            </span>
            <span className="text-[10px] text-zinc-700">
              {pipelineState.completedSteps}/{pipelineState.totalSteps}
            </span>
          </div>
          <div className="h-[1px] bg-white/[0.05] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white/20 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pipelineState.progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* ── Messages ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3 custom-scrollbar">
        <AnimatePresence>
          {displayMessages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} onCardBadgeClick={onCardBadgeClick} />
          ))}
          {streamingContent && (
            <ChatMessage
              key="streaming"
              message={{ id: 'streaming', role: 'assistant', content: streamingContent }}
              isStreaming
            />
          )}
          {isLoading && !streamingContent && (
            <motion.div
              key="typing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1 pl-1 pt-1"
            >
              {[0, 0.12, 0.24].map((delay, i) => (
                <motion.span
                  key={i}
                  className="w-1 h-1 rounded-full bg-white/20"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* ── Input ───────────────────────────────────────────── */}
      <ChatInput
        onSend={sendMessage}
        isLoading={isLoading}
        onStop={handleStop}
        placeholder="Describe your video idea…"
        suggestedActions={suggestedActions}
      />
    </div>
  )
}
