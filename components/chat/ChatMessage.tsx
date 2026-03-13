'use client'

import { motion } from 'framer-motion'
import { Bot, User, Copy, Check, Loader2, CheckCircle2, XCircle, FileText, Clapperboard, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import type { ToolCallName, ToolCallStatus } from '@/lib/ai/tool-call-types'

export type ChatMessageRole = 'user' | 'assistant' | 'system'

// Extended message data — supports text, tool_call, card_badge, done
export interface ChatMessageData {
  id: string
  role: ChatMessageRole
  content: string
  created_at?: string
  // Tool call fields (when role = 'assistant' and type = 'tool_call')
  msg_type?: 'text' | 'tool_call' | 'card_badge' | 'done'
  tool_name?: ToolCallName
  tool_status?: ToolCallStatus
  tool_label?: string
  tool_data?: Record<string, unknown>
  // Card badge fields
  card_id?: string
  card_title?: string
  card_subtitle?: string
  // Done fields
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
  create_card: <Clapperboard className="w-3 h-3" />,
  generate_text: <FileText className="w-3 h-3" />,
  generate_voiceover: <span className="text-[10px]">🎙</span>,
  generate_scene_media: <span className="text-[10px]">🎨</span>,
  split_lines_to_scenes: <span className="text-[10px]">📐</span>,
  select_resources: <span className="text-[10px]">🎵</span>,
  read_card_details: <span className="text-[10px]">📋</span>,
  update_storyboard: <span className="text-[10px]">📊</span>,
}

// ── Tool Call Status Indicator ───────────────────────────────────────────────
function ToolCallStatusIcon({ status }: { status: ToolCallStatus }) {
  switch (status) {
    case 'running':
      return <Loader2 className="w-3 h-3 animate-spin text-[#a78bfa]" />
    case 'success':
      return <CheckCircle2 className="w-3 h-3 text-[#06d6a0]" />
    case 'error':
      return <XCircle className="w-3 h-3 text-red-400" />
    default:
      return <div className="w-3 h-3 rounded-full border border-zinc-600" />
  }
}

// ── Tool Call Message ─────────────────────────────────────────────────────────
function ToolCallBubble({ message }: { message: ChatMessageData }) {
  const { tool_name, tool_status = 'pending', tool_label, tool_data, content } = message

  const statusColor = {
    pending: 'border-zinc-700 bg-white/[0.02]',
    running: 'border-[#a78bfa]/30 bg-[#a78bfa]/5',
    success: 'border-[#06d6a0]/20 bg-[#06d6a0]/5',
    error: 'border-red-500/20 bg-red-500/5',
  }[tool_status]

  return (
    <motion.div
      className={`rounded-xl border px-3 py-2 ${statusColor} transition-colors duration-300`}
      animate={tool_status === 'success' ? { scale: [1, 1.02, 1] } : undefined}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2">
        <ToolCallStatusIcon status={tool_status} />
        <span className="flex items-center gap-1.5 text-[11px] text-zinc-300 font-medium">
          {tool_name && TOOL_ICONS[tool_name]}
          {tool_label || tool_name || 'Processing'}
        </span>
        {tool_status === 'success' && tool_data && (
          <motion.span
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="ml-auto text-[9px] text-zinc-500"
          >
            {tool_data.scene_count ? `${tool_data.scene_count} scenes` : null}
            {tool_data.generated !== undefined ? `${tool_data.generated}/${tool_data.total}` : null}
            {tool_data.total_credits !== undefined ? `${tool_data.total_credits} credits` : null}
          </motion.span>
        )}
      </div>
      {tool_status === 'error' && content && (
        <p className="mt-1.5 text-[10px] text-red-400">{content}</p>
      )}
    </motion.div>
  )
}

// ── Card Badge ────────────────────────────────────────────────────────────────
function CardBadgeBubble({ message, onClick }: { message: ChatMessageData; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 rounded-xl border border-[#a78bfa]/20 bg-[#a78bfa]/5 px-3 py-2.5 hover:bg-[#a78bfa]/10 transition-colors text-left group"
    >
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#a78bfa] to-[#06d6a0] flex items-center justify-center flex-shrink-0">
        <Clapperboard className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white truncate">{message.card_title || 'Video Brief'}</p>
        <p className="text-[10px] text-zinc-500 truncate">{message.card_subtitle || 'Click to find on canvas'}</p>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-[#a78bfa] transition-colors flex-shrink-0" />
    </button>
  )
}

// ── Done Badge ────────────────────────────────────────────────────────────────
function DoneBubble({ message }: { message: ChatMessageData }) {
  return (
    <div className="rounded-xl border border-[#06d6a0]/20 bg-[#06d6a0]/5 px-3 py-2.5">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-[#06d6a0]" />
        <span className="text-xs font-semibold text-[#06d6a0]">Pipeline Complete</span>
      </div>
      {message.total_credits !== undefined && (
        <p className="mt-1 text-[10px] text-zinc-500 ml-6">
          Total: {message.total_credits} credits used
        </p>
      )}
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────
export function ChatMessage({ message, isStreaming, onCardBadgeClick }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const msgType = message.msg_type || 'text'

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Tool call messages — compact, no avatar
  if (msgType === 'tool_call') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="ml-11"
      >
        <ToolCallBubble message={message} />
      </motion.div>
    )
  }

  // Card badge — compact, no avatar
  if (msgType === 'card_badge') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="ml-11"
      >
        <CardBadgeBubble
          message={message}
          onClick={() => message.card_id && onCardBadgeClick?.(message.card_id)}
        />
      </motion.div>
    )
  }

  // Done badge — compact, no avatar
  if (msgType === 'done') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="ml-11"
      >
        <DoneBubble message={message} />
      </motion.div>
    )
  }

  // Standard text message (user / assistant)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 group ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm ${
        isUser
          ? 'bg-gradient-to-br from-[#D1FE17] to-[#a8d911] text-black font-bold'
          : 'bg-gradient-to-br from-[#a78bfa] to-[#06d6a0] text-white'
      }`}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Bubble */}
      <div className={`relative max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-gradient-to-br from-[#D1FE17]/15 to-[#a8d911]/10 border border-[#D1FE17]/20 text-white rounded-tr-sm'
            : 'bg-white/[0.05] border border-white/10 text-zinc-100 rounded-tl-sm'
        }`}>
          {message.content}
          {isStreaming && (
            <span className="inline-block ml-1 w-2 h-4 bg-[#a78bfa] rounded-sm animate-pulse" />
          )}
        </div>

        {/* Copy button — shown on hover */}
        {!isUser && !isStreaming && (
          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 px-1"
          >
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>
    </motion.div>
  )
}
