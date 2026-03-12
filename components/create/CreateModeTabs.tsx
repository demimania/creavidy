'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Film, Image, FileText, UserCircle } from 'lucide-react'

type CreationMode = 'video' | 'image' | 'script' | 'avatar'

interface CreateModeTabsProps {
  activeMode: CreationMode
  onModeChange: (mode: CreationMode) => void
}

const MODES: { id: CreationMode; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'video', label: 'Video', icon: Film, color: '#D1FE17' },
  { id: 'image', label: 'Image', icon: Image, color: '#FF2D78' },
  { id: 'script', label: 'Script', icon: FileText, color: '#FFE744' },
  { id: 'avatar', label: 'Avatar', icon: UserCircle, color: '#a78bfa' },
]

export function CreateModeTabs({ activeMode, onModeChange }: CreateModeTabsProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {MODES.map((mode) => {
        const isActive = activeMode === mode.id
        const Icon = mode.icon
        return (
          <motion.button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'text-black shadow-lg'
                : 'text-zinc-400 hover:text-white bg-white/[0.04] border border-white/10 hover:border-white/20'
            }`}
            style={isActive ? { backgroundColor: mode.color } : undefined}
          >
            <Icon className="w-4 h-4" />
            {mode.label}
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-xl -z-10"
                style={{ backgroundColor: mode.color }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

export type { CreationMode }
