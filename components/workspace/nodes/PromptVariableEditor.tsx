'use client'

import { useRef, useEffect, useCallback } from 'react'

// ============================================================================
// PromptVariableEditor — textarea with {variable} highlight overlay
// Uses the overlay approach: transparent textarea on top, highlight div below.
// ============================================================================

interface PromptVariableEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  rows?: number
  variables?: Record<string, string>
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function highlightVariables(text: string): string {
  return escapeHtml(text).replace(
    /\{([^}]+)\}/g,
    '<mark style="background:#D1FE17;color:#000;border-radius:3px;padding:0 2px;font-weight:600">$&</mark>'
  )
}

export function PromptVariableEditor({
  value,
  onChange,
  placeholder,
  className,
  rows = 5,
  variables,
}: PromptVariableEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)

  // Sync scroll between textarea and highlight layer
  const syncScroll = useCallback(() => {
    if (!textareaRef.current || !highlightRef.current) return
    highlightRef.current.scrollTop = textareaRef.current.scrollTop
    highlightRef.current.scrollLeft = textareaRef.current.scrollLeft
  }, [])

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.addEventListener('scroll', syncScroll)
    return () => ta.removeEventListener('scroll', syncScroll)
  }, [syncScroll])

  const highlightedHtml = highlightVariables(value)

  return (
    <div className={`relative font-mono text-xs leading-relaxed ${className ?? ''}`}>
      {/* Highlight layer (underneath) */}
      <div
        ref={highlightRef}
        aria-hidden
        className="absolute inset-0 pointer-events-none overflow-hidden whitespace-pre-wrap break-words"
        style={{
          padding: '6px 10px',
          // text is transparent so it doesn't show — marks provide colour
          color: 'transparent',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
        }}
        dangerouslySetInnerHTML={{ __html: highlightedHtml + '\n' }}
      />

      {/* Actual textarea (on top, transparent background, real text colour) */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        placeholder={placeholder}
        rows={rows}
        className="relative w-full bg-transparent resize-none outline-none"
        style={{
          padding: '6px 10px',
          color: 'rgba(228,228,231,1)',
          caretColor: 'white',
          lineHeight: 'inherit',
        }}
        spellCheck={false}
      />
    </div>
  )
}

export default PromptVariableEditor
