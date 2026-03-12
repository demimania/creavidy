'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, ChevronDown, Play, Pause, Volume2 } from 'lucide-react'

interface Voice {
  id: string
  name: string
  language: string
  gender: 'male' | 'female'
  accent: string
}

const VOICES: Voice[] = [
  { id: 'rachel', name: 'Rachel', language: 'English', gender: 'female', accent: 'American' },
  { id: 'adam', name: 'Adam', language: 'English', gender: 'male', accent: 'American' },
  { id: 'bella', name: 'Bella', language: 'English', gender: 'female', accent: 'British' },
  { id: 'arda', name: 'Arda', language: 'Turkish', gender: 'male', accent: 'Turkish' },
  { id: 'elif', name: 'Elif', language: 'Turkish', gender: 'female', accent: 'Turkish' },
  { id: 'hans', name: 'Hans', language: 'German', gender: 'male', accent: 'German' },
]

interface VoiceSelectorProps {
  selectedVoice: string
  onVoiceChange: (voiceId: string) => void
}

export function VoiceSelector({ selectedVoice, onVoiceChange }: VoiceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selected = VOICES.find(v => v.id === selectedVoice) || VOICES[0]

  return (
    <div className="relative">
      <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2 block">Voice</label>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-colors text-left"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF2D78] to-[#a78bfa] flex items-center justify-center flex-shrink-0">
          <Mic className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-white">{selected.name}</p>
          <p className="text-[10px] text-zinc-500">{selected.language} · {selected.accent}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1.5 rounded-xl bg-[#1a0d2e] border border-white/15 shadow-2xl overflow-hidden"
          >
            {VOICES.map(voice => (
              <button
                key={voice.id}
                onClick={() => { onVoiceChange(voice.id); setIsOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/[0.06] transition-colors ${
                  selectedVoice === voice.id ? 'bg-white/[0.08]' : ''
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                  voice.gender === 'female'
                    ? 'bg-[#FF2D78]/20 text-[#FF2D78]'
                    : 'bg-[#0ea5e9]/20 text-[#0ea5e9]'
                }`}>
                  {voice.gender === 'female' ? '♀' : '♂'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white">{voice.name}</p>
                  <p className="text-[10px] text-zinc-500">{voice.language} · {voice.accent}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); /* TODO: play voice sample */ }}
                  className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <Volume2 className="w-3 h-3 text-zinc-400" />
                </button>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
