'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ChatMessage, type ChatMessageData } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { Bot, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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

interface ChatPanelProps {
  projectId?: string
  initialPrompt?: string
  style?: string
  durationSeconds?: number
  aspectRatio?: string
  onScenesDetected?: (plan: ScenePlan) => void
}

const WELCOME_MESSAGE: ChatMessageData = {
  id: 'welcome',
  role: 'assistant',
  content: `👋 Hi! I'm your AI Video Director.\n\nI'll help you transform your idea into a scene-by-scene video plan. Tell me what kind of video you want to create, and I'll ask a few quick questions to get the details right.\n\nYou can also adjust the style, duration, and voice settings on the right panel. Let's make something great! 🎬`,
}

export function ChatPanel({
  projectId,
  initialPrompt,
  style = 'cinematic',
  durationSeconds = 30,
  aspectRatio = '16:9',
  onScenesDetected,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessageData[]>([WELCOME_MESSAGE])
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const abortRef = useRef<AbortController | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const initialPromptSent = useRef(false)

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

      // Parse scene plan and emit to parent
      const plan = extractScenePlan(accumulated)
      if (plan && onScenesDetected) {
        onScenesDetected(plan)
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
  }, [messages, isLoading, projectId, style, durationSeconds, aspectRatio, onScenesDetected])

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
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-black/20 backdrop-blur-xl flex-shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#a78bfa] to-[#06d6a0] flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">AI Video Director</p>
          <p className="text-[10px] text-zinc-500 flex items-center gap-1">
            {isLoading ? (
              <>
                <span className="w-1.5 h-1.5 bg-[#D1FE17] rounded-full animate-pulse" />
                Thinking...
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                Online
              </>
            )}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1 text-[10px] text-zinc-500">
          <Sparkles className="w-3 h-3" />
          GPT-4o
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
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
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#a78bfa] to-[#06d6a0] flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white/[0.05] border border-white/10 flex items-center gap-1.5">
                {[0, 0.15, 0.3].map((delay, i) => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 bg-[#a78bfa] rounded-full"
                    animate={{ y: ['0%', '-50%', '0%'] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <ChatInput
        onSend={sendMessage}
        isLoading={isLoading}
        onStop={handleStop}
        placeholder="Describe your next scene idea or ask a question..."
      />
    </div>
  )
}
