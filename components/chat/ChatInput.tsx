'use client'

import { useRef, useState, KeyboardEvent } from 'react'
import { Send, Loader2, Square } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export interface SuggestedAction {
  label: string
  prompt: string
  icon?: string
}

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading?: boolean
  onStop?: () => void
  placeholder?: string
  disabled?: boolean
  suggestedActions?: SuggestedAction[]
}

export function ChatInput({
  onSend,
  isLoading,
  onStop,
  placeholder = 'Type a message...',
  disabled,
  suggestedActions,
}: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || isLoading || disabled) return
    onSend(trimmed)
    setValue('')
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  return (
    <div className="border-t border-white/10 bg-black/20 backdrop-blur-xl p-4">
      {/* Suggested actions */}
      {suggestedActions && suggestedActions.length > 0 && !isLoading && (
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {suggestedActions.map((action, i) => (
            <button
              key={i}
              onClick={() => onSend(action.prompt)}
              disabled={disabled}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/[0.04] border border-white/10 text-zinc-400 hover:text-white hover:border-[#a78bfa]/40 hover:bg-[#a78bfa]/10 transition-all disabled:opacity-30"
            >
              {action.icon && <span className="text-[10px]">{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-end gap-3 bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 focus-within:border-[#a78bfa]/50 transition-colors">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent text-white placeholder:text-zinc-600 text-sm leading-relaxed resize-none focus:outline-none min-h-[24px] max-h-[160px] disabled:opacity-50"
        />

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.button
              key="stop"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={onStop}
              className="flex-shrink-0 w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 flex items-center justify-center transition-colors"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </motion.button>
          ) : (
            <motion.button
              key="send"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={handleSend}
              disabled={!value.trim() || disabled}
              className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-[#a78bfa] to-[#06d6a0] text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
            >
              <Send className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <p className="text-[10px] text-zinc-600 text-center mt-2">
        Press <kbd className="px-1 py-0.5 rounded bg-white/10 text-zinc-400 font-mono text-[9px]">Enter</kbd> to send,{' '}
        <kbd className="px-1 py-0.5 rounded bg-white/10 text-zinc-400 font-mono text-[9px]">Shift+Enter</kbd> for new line
      </p>
    </div>
  )
}
