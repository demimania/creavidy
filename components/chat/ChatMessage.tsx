'use client'

import { motion } from 'framer-motion'
import { Bot, User, Copy, Check } from 'lucide-react'
import { useState } from 'react'

export type ChatMessageRole = 'user' | 'assistant' | 'system'

export interface ChatMessageData {
  id: string
  role: ChatMessageRole
  content: string
  created_at?: string
}

interface ChatMessageProps {
  message: ChatMessageData
  isStreaming?: boolean
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
