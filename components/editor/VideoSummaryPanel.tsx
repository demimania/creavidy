'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Music, Image as ImageIcon, Film, Sparkles } from 'lucide-react'
import {
  useEditorStore,
  VISUAL_STYLES,
  PRESET_NARRATORS,
  PLATFORMS,
  DURATIONS,
  ASPECT_RATIOS,
  type ActivePopup,
} from '@/lib/stores/editor-store'

function SummaryDropdown({
  label,
  value,
  icon,
  popupId,
  children,
}: {
  label: string
  value: React.ReactNode
  icon?: React.ReactNode
  popupId: ActivePopup
  children: React.ReactNode
}) {
  const { activePopup, setActivePopup } = useEditorStore()
  const isOpen = activePopup === popupId

  return (
    <div className="relative">
      <button
        onClick={() => setActivePopup(isOpen ? null : popupId)}
        className="flex items-center gap-2 w-full text-left group"
      >
        <span className="text-xs text-zinc-500 min-w-[80px]">{label}</span>
        <span className="flex items-center gap-1.5 text-sm text-white font-medium">
          {icon}
          {value}
          <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 bg-[#1a1025] border border-white/10 rounded-xl p-3 z-50 min-w-[240px] shadow-2xl"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function VideoSummaryPanel() {
  const { summary, updateSummary, setNarrator, setActivePopup } = useEditorStore()

  return (
    <div className="w-[340px] flex-shrink-0 border-r border-white/10 overflow-y-auto bg-black/20">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <span className="text-sm font-semibold text-white">Video Summary 1</span>
      </div>

      <div className="px-4 py-4 space-y-1">
        <p className="text-xs font-semibold text-white mb-3">Key Elements</p>

        {/* Visual Style */}
        <SummaryDropdown
          label="Visual style"
          value={summary.visualStyle}
          icon={
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0" />
          }
          popupId="style"
        >
          <div className="grid grid-cols-2 gap-1.5">
            {VISUAL_STYLES.map(s => (
              <button
                key={s.id}
                onClick={() => { updateSummary({ visualStyle: s.label }); setActivePopup(null) }}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all ${
                  summary.visualStyle === s.label
                    ? 'bg-[#0ea5e9]/15 border border-[#0ea5e9]/40 text-white'
                    : 'bg-white/5 border border-transparent text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{s.emoji}</span>
                {s.label}
              </button>
            ))}
          </div>
        </SummaryDropdown>

        {/* Narrator */}
        <SummaryDropdown
          label="Narrator"
          value={summary.narrator?.name || 'Select'}
          icon={
            summary.narrator ? (
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-[8px] text-white font-bold flex-shrink-0">
                {summary.narrator.name.charAt(0)}
              </div>
            ) : undefined
          }
          popupId="narrator"
        >
          <div className="space-y-1">
            {PRESET_NARRATORS.map(n => (
              <button
                key={n.id}
                onClick={() => { setNarrator(n); setActivePopup(null) }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-all ${
                  summary.narrator?.id === n.id
                    ? 'bg-[#0ea5e9]/15 border border-[#0ea5e9]/40 text-white'
                    : 'bg-white/5 border border-transparent text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0">
                  {n.name.charAt(0)}
                </div>
                <div className="text-left">
                  <span className="block text-xs">{n.name}</span>
                  <span className="text-[10px] text-zinc-600">{n.gender} · {n.accent}</span>
                </div>
              </button>
            ))}
          </div>
        </SummaryDropdown>

        {/* Characters */}
        <div className="flex items-center gap-2 py-1.5">
          <span className="text-xs text-zinc-500 min-w-[80px]">Character</span>
          <div className="flex items-center gap-1">
            {summary.characters.length > 0 ? (
              summary.characters.map(c => (
                <span key={c.id} className="flex items-center gap-1 text-sm text-white font-medium">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-pink-400 to-orange-400 flex items-center justify-center text-[8px] text-white font-bold">
                    {c.name.charAt(0)}
                  </div>
                  {c.name}
                </span>
              ))
            ) : (
              <span className="text-sm text-zinc-500">Auto-detected</span>
            )}
          </div>
        </div>

        {/* Music */}
        <SummaryDropdown
          label="Music"
          value={summary.musicMood || 'Select'}
          popupId="music"
        >
          <div className="space-y-1">
            {['Gentle, emotional, instrumental', 'Upbeat, energetic', 'Dark, cinematic', 'Lo-fi, chill', 'Epic, orchestral'].map(m => (
              <button
                key={m}
                onClick={() => { updateSummary({ musicMood: m }); setActivePopup(null) }}
                className={`w-full px-2.5 py-2 rounded-lg text-xs text-left transition-all ${
                  summary.musicMood === m
                    ? 'bg-[#0ea5e9]/15 border border-[#0ea5e9]/40 text-white'
                    : 'bg-white/5 border border-transparent text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </SummaryDropdown>

        {/* Scene Media */}
        <SummaryDropdown
          label="Scene media"
          value={summary.sceneMediaType === 'images' ? 'Images' : 'Video clips'}
          icon={summary.sceneMediaType === 'images' ? <ImageIcon className="w-3.5 h-3.5" /> : <Film className="w-3.5 h-3.5" />}
          popupId="sceneMedia"
        >
          <div className="flex gap-1.5">
            {(['images', 'video'] as const).map(t => (
              <button
                key={t}
                onClick={() => { updateSummary({ sceneMediaType: t }); setActivePopup(null) }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  summary.sceneMediaType === t
                    ? 'bg-[#0ea5e9]/15 border border-[#0ea5e9]/40 text-white'
                    : 'bg-white/5 border border-transparent text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {t === 'images' ? <ImageIcon className="w-3.5 h-3.5" /> : <Film className="w-3.5 h-3.5" />}
                {t === 'images' ? 'Images' : 'Video clips'}
              </button>
            ))}
          </div>
        </SummaryDropdown>

        {/* Duration */}
        <div className="flex items-center gap-2 py-1.5">
          <span className="text-xs text-zinc-500 min-w-[80px]">Duration</span>
          <span className="text-sm text-white font-medium">{summary.duration} s</span>
        </div>

        {/* Aspect Ratio */}
        <SummaryDropdown
          label="Aspect ratio"
          value={summary.aspectRatio}
          popupId="aspectRatio"
        >
          <div className="flex gap-1.5">
            {ASPECT_RATIOS.map(r => (
              <button
                key={r.value}
                onClick={() => { updateSummary({ aspectRatio: r.value }); setActivePopup(null) }}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                  summary.aspectRatio === r.value
                    ? 'bg-[#0ea5e9] text-white'
                    : 'bg-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                {r.value}
              </button>
            ))}
          </div>
        </SummaryDropdown>

        {/* Platform */}
        <SummaryDropdown
          label="Platform"
          value={summary.platform}
          icon={<span>{PLATFORMS.find(p => p.label === summary.platform)?.icon || '🔴'}</span>}
          popupId="platform"
        >
          <div className="space-y-1">
            {PLATFORMS.map(p => (
              <button
                key={p.id}
                onClick={() => { updateSummary({ platform: p.label }); setActivePopup(null) }}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all ${
                  summary.platform === p.label
                    ? 'bg-[#0ea5e9]/15 border border-[#0ea5e9]/40 text-white'
                    : 'bg-white/5 border border-transparent text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{p.icon}</span>
                {p.label}
              </button>
            ))}
          </div>
        </SummaryDropdown>
      </div>

      {/* Script / Narration Text */}
      <div className="px-4 py-3 border-t border-white/10">
        <p className="text-xs font-semibold text-white mb-2">Narration</p>
        <div className="text-xs text-zinc-400 leading-relaxed max-h-[300px] overflow-y-auto pr-1">
          {summary.script || <span className="text-zinc-600 italic">Script will appear here after generation...</span>}
        </div>
      </div>

      {/* Generate Media Button */}
      <div className="px-4 py-3 border-t border-white/10">
        <button
          onClick={() => {
            const actions = (window as any).__editorActions
            if (actions?.generateMediaForScenes) {
              actions.generateMediaForScenes()
            }
          }}
          className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#0c96d4] text-white text-sm font-semibold hover:from-[#0c96d4] hover:to-[#0a7fb8] transition-all shadow-lg shadow-[#0ea5e9]/20 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Generate All Media
        </button>
        <p className="text-[10px] text-zinc-600 text-center mt-2">
          Generates images and narration for all scenes
        </p>
      </div>
    </div>
  )
}
