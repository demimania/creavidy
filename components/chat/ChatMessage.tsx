'use client'

import { motion } from 'framer-motion'
import { Copy, Check, Loader2, CheckCircle2, XCircle, FileText, Clapperboard, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import type { ToolCallName, ToolCallStatus } from '@/lib/ai/tool-call-types'

export type ChatMessageRole = 'user' | 'assistant' | 'system'

export interface ChatMessageData {
  id: string
  role: ChatMessageRole
  content: string
  created_at?: string
  msg_type?: 'text' | 'tool_call' | 'card_badge' | 'done'
  tool_name?: ToolCallName
  tool_status?: ToolCallStatus
  tool_label?: string
  tool_data?: Record<string, unknown>
  card_id?: string
  card_title?: string
  card_subtitle?: string
  total_credits?: number
  brief_id?: string
}

interface ChatMessageProps {
  message: ChatMessageData
  isStreaming?: boolean
  onCardBadgeClick?: (cardId: string) => void
}

// ── Tool Call Icons ──────────────────────────────────────────────────────────
const TOOL_ICONS: Partial<Record<ToolCallName, React.ReactNode>> = {
  create_card: <Clapperboard className="w-2.5 h-2.5" />,
  generate_text: <FileText className="w-2.5 h-2.5" />,
  generate_voiceover: <span className="text-[9px]">🎙</span>,
  generate_scene_media: <span className="text-[9px]">🎨</span>,
  split_lines_to_scenes: <span className="text-[9px]">📐</span>,
  select_resources: <span className="text-[9px]">🎵</span>,
  read_card_details: <span className="text-[9px]">📋</span>,
  update_storyboard: <span className="text-[9px]">📊</span>,
}

// ── Tool Call ─────────────────────────────────────────────────────────────────
function ToolCallBubble({ message }: { message: ChatMessageData }) {
  const { tool_name, tool_status = 'pending', tool_label, tool_data, content } = message

  const statusClasses = {
    pending: 'text-zinc-600',
    running: 'text-[#a78bfa]/70',
    success: 'text-zinc-500',
    error: 'text-red-400/80',
  }[tool_status]

  return (
    <motion.div
      className="flex items-center gap-2 py-0.5"
      animate={tool_status === 'success' ? { opacity: [1, 0.6, 1] } : undefined}
      transition={{ duration: 0.4 }}
    >
      <span className={`flex-shrink-0 ${statusClasses}`}>
        {tool_status === 'running' && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
        {tool_status === 'success' && <CheckCircle2 className="w-2.5 h-2.5 text-white/20" />}
        {tool_status === 'error'   && <XCircle className="w-2.5 h-2.5" />}
        {tool_status === 'pending' && <span className="w-2.5 h-2.5 rounded-full border border-zinc-700 inline-block" />}
      </span>
      <span className={`flex items-center gap-1 text-[10px] ${statusClasses}`}>
        {tool_name && TOOL_ICONS[tool_name]}
        {tool_label || tool_name || 'Processing'}
      </span>
      {tool_data && (tool_data.scene_count || tool_data.total_credits !== undefined) && (
        <span className="ml-auto text-[9px] text-zinc-700">
          {tool_data.scene_count ? `${tool_data.scene_count} scenes` : null}
          {tool_data.total_credits !== undefined ? `${tool_data.total_credits} cr` : null}
        </span>
      )}
      {tool_status === 'error' && content && (
        <span className="text-[9px] text-red-400/70 ml-1">{content}</span>
      )}
    </motion.div>
  )
}

// ── Card Badge ────────────────────────────────────────────────────────────────
function CardBadgeBubble({ message, onClick }: { message: ChatMessageData; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03]
        px-3 py-2.5 hover:bg-white/[0.06] hover:border-white/10 transition-all text-left group"
    >
      <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
        <Clapperboard className="w-3.5 h-3.5 text-white/40" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium text-white/70 truncate">{message.card_title || 'Video Brief'}</p>
        <p className="text-[9px] text-zinc-600 truncate">{message.card_subtitle || 'Click to find on canvas'}</p>
      </div>
      <ChevronRight className="w-3 h-3 text-zinc-700 group-hover:text-white/40 transition-colors flex-shrink-0" />
    </button>
  )
}

// ── Done Badge ────────────────────────────────────────────────────────────────
function DoneBubble({ message }: { message: ChatMessageData }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <CheckCircle2 className="w-3 h-3 text-white/25 flex-shrink-0" />
      <span className="text-[10px] text-zinc-600">
        Pipeline complete
        {message.total_credits !== undefined && ` · ${message.total_credits} credits`}
      </span>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export function ChatMessage({ message, isStreaming, onCardBadgeClick }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const msgType = message.msg_type || 'text'

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Tool call — inline, no avatar
  if (msgType === 'tool_call') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
      >
        <ToolCallBubble message={message} />
      </motion.div>
    )
  }

  // Card badge
  if (msgType === 'card_badge') {
    return (
      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <CardBadgeBubble
          message={message}
          onClick={() => message.card_id && onCardBadgeClick?.(message.card_id)}
        />
      </motion.div>
    )
  }

  // Done
  if (msgType === 'done') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
        <DoneBubble message={message} />
      </motion.div>
    )
  }

  // User message
  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex justify-end"
      >
        <div className="max-w-[78%] px-3 py-2 rounded-2xl rounded-tr-sm
          bg-white/[0.07] border border-white/[0.08]
          text-[12px] text-white/80 leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
      </motion.div>
    )
  }

  // Assistant message
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="group"
    >
      <div className="text-[12px] text-zinc-400 leading-relaxed whitespace-pre-wrap">
        {message.content}
        {isStreaming && (
          <span className="inline-block ml-0.5 w-1.5 h-3.5 bg-white/20 rounded-sm animate-pulse align-middle" />
        )}
      </div>

      {!isUser && !isStreaming && message.content && (
        <button
          onClick={handleCopy}
          className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[9px] text-zinc-700 hover:text-zinc-500"
        >
          {copied ? <Check className="w-2.5 h-2.5 text-white/30" /> : <Copy className="w-2.5 h-2.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      )}
    </motion.div>
  )
}
