'use client'

import { useRef, useState, KeyboardEvent } from 'react'
import { ArrowUp, Square } from 'lucide-react'
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
  placeholder = 'Type a message…',
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
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`
  }

  const hasValue = value.trim().length > 0

  return (
    <div className="border-t border-white/[0.05] px-3 pt-3 pb-3 flex-shrink-0">

      {/* Suggested action chips */}
      {suggestedActions && suggestedActions.length > 0 && !isLoading && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {suggestedActions.map((action, i) => (
            <button
              key={i}
              onClick={() => onSend(action.prompt)}
              disabled={disabled}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]
                bg-white/[0.03] border border-white/[0.07] text-zinc-600
                hover:text-white/60 hover:border-white/12 hover:bg-white/[0.06]
                transition-all disabled:opacity-30"
            >
              {action.icon && <span className="text-[9px]">{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2 bg-white/[0.04] border border-white/[0.07]
        rounded-xl px-3 py-2.5 focus-within:border-white/12 transition-colors">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent text-[12px] text-white/75 placeholder:text-zinc-700
            leading-relaxed resize-none focus:outline-none min-h-[20px] max-h-[140px]
            disabled:opacity-40"
        />

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.button
              key="stop"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={onStop}
              className="flex-shrink-0 w-6 h-6 rounded-lg bg-white/[0.06] border border-white/10
                text-white/30 hover:text-white/60 hover:bg-white/10
                flex items-center justify-center transition-colors"
            >
              <Square className="w-2.5 h-2.5 fill-current" />
            </motion.button>
          ) : (
            <motion.button
              key="send"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={handleSend}
              disabled={!hasValue || disabled}
              className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all
                disabled:opacity-20 disabled:cursor-not-allowed"
              style={{
                background: hasValue ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <ArrowUp className="w-3 h-3 text-white/60" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
