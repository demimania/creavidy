'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Music as MusicIcon, Image as ImageIcon, Film, Sparkles, Coins, X } from 'lucide-react'
import {
  useEditorStore,
  VISUAL_STYLES,
  PRESET_NARRATORS,
  PLATFORMS,
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
  const { summary, updateSummary, setNarrator, setActivePopup, scenes } = useEditorStore()
  const [newCharacterName, setNewCharacterName] = useState('')

  // Calculate estimated credit cost
  const calculateCost = () => {
    if (scenes.length === 0) return 0
    // Script breakdown: 4 credits (already done if scenes exist)
    // Each scene: 5 (image) + 3 (TTS) = 8 credits
    const sceneCost = scenes.length * 8
    return sceneCost
  }

  const estimatedCost = calculateCost()

  const handleAddCharacter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newCharacterName.trim()) {
      const newChar = {
        id: `char-${Date.now()}`,
        name: newCharacterName.trim(),
      }
      updateSummary({
        characters: [...summary.characters, newChar],
      })
      setNewCharacterName('')
      setActivePopup(null)
    }
  }

  const handleRemoveCharacter = (charId: string) => {
    updateSummary({
      characters: summary.characters.filter(c => c.id !== charId),
    })
  }

  return (
    <div className="w-[340px] flex-shrink-0 border-r border-white/10 overflow-y-auto bg-black/20">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <span className="text-sm font-semibold text-white">Video brief 1</span>
      </div>

      <div className="px-4 py-4 space-y-1">
        <p className="text-xs font-semibold text-white mb-3">Key elements</p>

        {/* Visual Style */}
        <SummaryDropdown
          label="Visual style"
          value={summary.visualStyle}
          icon={
            VISUAL_STYLES.find(s => s.label === summary.visualStyle)?.emoji ? (
              <span className="text-base">{VISUAL_STYLES.find(s => s.label === summary.visualStyle)?.emoji}</span>
            ) : (
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0" />
            )
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
              <img
                src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${summary.narrator.name}`}
                alt={summary.narrator.name}
                className="w-5 h-5 rounded-full flex-shrink-0"
              />
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
                <img
                  src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${n.name}`}
                  alt={n.name}
                  className="w-7 h-7 rounded-full flex-shrink-0"
                />
                <div className="text-left">
                  <span className="block text-xs">{n.name}</span>
                  <span className="text-[10px] text-zinc-600">{n.gender} · {n.accent}</span>
                </div>
              </button>
            ))}
          </div>
        </SummaryDropdown>

        {/* Characters */}
        <SummaryDropdown
          label="Character"
          value={
            summary.characters.length > 0
              ? `${summary.characters.length} character${summary.characters.length > 1 ? 's' : ''}`
              : 'No characters'
          }
          popupId="characters"
        >
          <div className="space-y-2">
            {/* Character list */}
            {summary.characters.length > 0 ? (
              <div className="space-y-1.5 mb-2">
                {summary.characters.map(c => (
                  <div
                    key={c.id}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5"
                  >
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-pink-400 to-orange-400 flex items-center justify-center text-[8px] text-white font-bold flex-shrink-0">
                      {c.name.charAt(0)}
                    </div>
                    <span className="text-xs text-white flex-1">{c.name}</span>
                    <button
                      onClick={() => handleRemoveCharacter(c.id)}
                      className="w-4 h-4 rounded flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                      <X className="w-3 h-3 text-zinc-500" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 text-center py-2">No characters found.</p>
            )}

            {/* Add character input */}
            <input
              type="text"
              placeholder="Add character (Type & Enter)"
              value={newCharacterName}
              onChange={(e) => setNewCharacterName(e.target.value)}
              onKeyDown={handleAddCharacter}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-[#0ea5e9]/40 transition-colors"
            />
          </div>
        </SummaryDropdown>

        {/* Music */}
        <SummaryDropdown
          label="Music"
          value={summary.musicMood || 'Select music'}
          icon={<MusicIcon className="w-3.5 h-3.5 text-emerald-400" />}
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

        {/* Captions */}
        <div className="flex items-center gap-2 py-1.5">
          <span className="text-xs text-zinc-500 min-w-[80px]">Captions</span>
          <span className="flex items-center gap-1.5 text-sm text-white font-medium">
            <span className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 text-[10px] font-mono">TXT</span>
            THE QUICK
          </span>
        </div>

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
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={summary.duration}
              onChange={(e) => updateSummary({ duration: parseInt(e.target.value) || 0 })}
              className="w-16 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-[#0ea5e9]/40 transition-colors text-center"
            />
            <span className="text-sm text-zinc-500">s</span>
          </div>
        </div>

        {/* Aspect Ratio */}
        <SummaryDropdown
          label="Aspect ratio"
          value={summary.aspectRatio}
          icon={<span className="text-xs">📐</span>}
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
        <p className="text-xs font-semibold text-white mb-2">Outline / Narrative</p>
        <div className="text-xs text-zinc-400 leading-relaxed max-h-[300px] overflow-y-auto pr-1 p-3 rounded-lg bg-white/5 border border-white/5">
          {summary.script || <span className="text-zinc-600 italic">Script will appear here after generation...</span>}
        </div>
      </div>

      {/* Generate Node Button */}
      <div className="px-4 py-3 border-t border-white/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-zinc-400">Cost:</span>
            <span className="text-xs font-semibold text-white">{estimatedCost} Credits</span>
          </div>
        </div>
        <button
          onClick={() => {
            const actions = (window as any).__editorActions
            if (actions?.generateMediaForScenes) {
              actions.generateMediaForScenes()
            }
          }}
          disabled={scenes.length === 0}
          className="w-full px-4 py-2.5 rounded-xl bg-[#3b82f6] text-white text-sm font-semibold hover:bg-[#2563eb] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Generate Node
        </button>
      </div>
    </div>
  )
}
