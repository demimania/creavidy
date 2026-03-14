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
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] transition-all disabled:opacity-30"
              style={{
                background: 'rgba(124,58,237,0.08)',
                border: '1px solid rgba(124,58,237,0.18)',
                color: 'rgba(167,139,250,0.7)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(124,58,237,0.18)'
                e.currentTarget.style.color = '#a78bfa'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(124,58,237,0.08)'
                e.currentTarget.style.color = 'rgba(167,139,250,0.7)'
              }}
            >
              {action.icon && <span className="text-[9px]">{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2 rounded-xl px-3 py-2.5 transition-colors"
        style={{ background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.18)' }}
        onFocus={() => {}} /* focus-within handled via CSS below */
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent text-[12px] leading-relaxed resize-none focus:outline-none min-h-[20px] max-h-[140px] disabled:opacity-40 placeholder:text-[#7c3aed]/35"
          style={{ color: 'rgba(255,255,255,0.8)', caretColor: '#a78bfa' }}
        />

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.button
              key="stop"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={onStop}
              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: 'rgba(252,165,165,0.8)' }}
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
              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-25 disabled:cursor-not-allowed active:scale-95"
              style={hasValue ? {
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                boxShadow: '0 0 14px rgba(124,58,237,0.5)',
                border: '1px solid rgba(124,58,237,0.5)',
              } : {
                background: 'rgba(124,58,237,0.08)',
                border: '1px solid rgba(124,58,237,0.12)',
              }}
            >
              <ArrowUp className="w-3 h-3 text-white" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
