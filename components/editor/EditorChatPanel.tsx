'use client'

import { useState, useRef, useCallback } from 'react'
import { Send, Plus, Square, Sparkles, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEditorStore } from '@/lib/stores/editor-store'

export function EditorChatPanel() {
  const { chatMessages, isChatLoading, addChatMessage, setChatLoading, phase } = useEditorStore()
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(async () => {
    const trimmed = value.trim()
    if (!trimmed || isChatLoading) return

    addChatMessage({
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    })
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    setChatLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: trimmed }],
        }),
      })

      if (!response.ok) throw new Error('Chat failed')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      if (reader) {
        while (true) {
          const { done, value: chunk } = await reader.read()
          if (done) break
          const text = decoder.decode(chunk, { stream: true })
          const lines = text.split('\n').filter(l => l.startsWith('data:'))
          for (const line of lines) {
            const data = line.slice(5).trim()
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              if (parsed.content) accumulated += parsed.content
            } catch { /* skip */ }
          }
        }
      }

      addChatMessage({
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: accumulated || 'I could not generate a response.',
      })
    } catch {
      addChatMessage({
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Something went wrong. Please try again.',
      })
    } finally {
      setChatLoading(false)
    }
  }, [value, isChatLoading, addChatMessage, setChatLoading])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Status message based on phase
  const statusMessage = (() => {
    switch (phase) {
      case 'generating-script': return 'Generating script...'
      case 'generating-media': return 'Generating media for scenes...'
      case 'building-filmstrip': return 'Building film strip...'
      case 'ready': return 'Film strip settings updated'
      default: return null
    }
  })()

  return (
    <div className="border-t border-white/10 bg-black/30 backdrop-blur-xl">
      {/* Status line */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2 flex items-center gap-2"
          >
            {phase === 'ready' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0ea5e9]" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-[#0ea5e9] animate-pulse" />
            )}
            <span className="text-[11px] text-[#0ea5e9]">{statusMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat action button */}
      {phase === 'ready' && (
        <div className="px-4 pb-2">
          <button className="flex items-center gap-2 text-xs text-[#0ea5e9] hover:text-[#0ea5e9]/80 transition-colors">
            <Sparkles className="w-3.5 h-3.5" />
            Generate media for scenes
          </button>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3">
        <div className="flex items-end gap-2 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-[#0ea5e9]/50 transition-colors">
          <button className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
            <Plus className="w-4 h-4" />
          </button>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={() => {
              const el = textareaRef.current
              if (!el) return
              el.style.height = 'auto'
              el.style.height = `${Math.min(el.scrollHeight, 120)}px`
            }}
            placeholder="Enter your ideas"
            rows={1}
            className="flex-1 bg-transparent text-white placeholder:text-zinc-600 text-sm leading-relaxed resize-none focus:outline-none min-h-[28px] max-h-[120px]"
          />

          <AnimatePresence mode="wait">
            {isChatLoading ? (
              <motion.button
                key="stop"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex-shrink-0 w-7 h-7 rounded-lg bg-zinc-700 flex items-center justify-center text-white"
              >
                <Square className="w-3 h-3 fill-current" />
              </motion.button>
            ) : (
              <motion.button
                key="send"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={handleSend}
                disabled={!value.trim()}
                className="flex-shrink-0 w-7 h-7 rounded-lg bg-[#0ea5e9] flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
              >
                <Send className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
