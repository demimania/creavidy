'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, ChevronDown, Palette, Mic, Clock, Plus, ArrowRight,
  Upload, Film, Layers
} from 'lucide-react'
import Link from 'next/link'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import {
  useEditorStore,
  VISUAL_STYLES,
  PRESET_NARRATORS,
  DURATIONS,
  ASPECT_RATIOS,
} from '@/lib/stores/editor-store'

// Inspiration prompts
const INSPIRATIONS = [
  { title: 'Rooftop sunset timelapse', prompt: 'A cinematic timelapse of a city skyline at sunset, warm golden light fading to deep blue, with ambient electronic music and smooth camera movement' },
  { title: 'SaaS product demo', prompt: 'A sleek, modern product demo video for a design tool, showing UI interactions with smooth transitions and a professional narrator' },
  { title: 'Social media ad', prompt: 'A 15-second vertical ad for a fitness app, fast-paced cuts between workout scenes, bold text overlays, and energetic background music' },
  { title: 'Brand story', prompt: 'A 60-second brand story for a sustainable fashion startup, showing the journey from raw materials to finished product with warm, earthy tones' },
]

export default function CreatePage() {
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { summary, updateSummary, setNarrator } = useEditorStore()

  const [script, setScript] = useState('')
  const [showStylePopup, setShowStylePopup] = useState(false)
  const [showVoicePopup, setShowVoicePopup] = useState(false)
  const [showSettingsPopup, setShowSettingsPopup] = useState(false)
  const [activeTab, setActiveTab] = useState<'trend' | 'templates' | 'styles' | 'avatars'>('trend')

  const closeAllPopups = () => {
    setShowStylePopup(false)
    setShowVoicePopup(false)
    setShowSettingsPopup(false)
  }

  const handleGenerate = () => {
    if (!script.trim()) return
    // Store the script in editor store and navigate to editor
    updateSummary({ script: script.trim() })
    const params = new URLSearchParams({
      script: script.trim(),
      style: summary.visualStyle,
      narrator: summary.narrator?.id || '',
      duration: String(summary.duration),
      aspect: summary.aspectRatio,
    })
    router.push(`/editor/new?${params.toString()}`)
  }

  const selectedStyle = VISUAL_STYLES.find(s => s.label === summary.visualStyle) || VISUAL_STYLES[4]

  return (
    <div className="relative min-h-screen w-full bg-[#0F051D] text-white font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 z-[9999] w-full border-b border-white/5 bg-[#0F051D]/80 backdrop-blur-md">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Creavidy" className="h-7" />
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-16 max-w-3xl mx-auto px-4">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold mb-2">AI Video Generator</h1>
          <p className="text-sm text-zinc-500">Paste your script or describe your video idea</p>
        </motion.div>

        {/* Script Input Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden"
        >
          {/* Textarea */}
          <div className="p-4 pb-0">
            <textarea
              ref={textareaRef}
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="The Last Fence&#10;&#10;Sarah was not a patient person. She knew this about herself the way you know the color of your own eyes — as a fact, not a judgment..."
              rows={10}
              maxLength={10000}
              className="w-full bg-transparent text-white placeholder:text-zinc-600 text-sm leading-relaxed resize-none focus:outline-none min-h-[200px]"
            />
            <div className="flex justify-end">
              <span className="text-[10px] text-zinc-600">{script.length}/10000</span>
            </div>
          </div>

          {/* Inline Toolbar */}
          <div className="flex items-center gap-1.5 px-4 py-3 border-t border-white/5">
            {/* Add/Upload */}
            <button className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all">
              <Plus className="w-4 h-4" />
            </button>

            {/* Style Selector */}
            <div className="relative">
              <button
                onClick={() => { closeAllPopups(); setShowStylePopup(!showStylePopup) }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-zinc-400 hover:text-white hover:border-white/20 transition-all"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>{selectedStyle.emoji} {selectedStyle.label}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              <AnimatePresence>
                {showStylePopup && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute bottom-full mb-2 left-0 bg-[#1a1025] border border-white/10 rounded-2xl p-3 z-50 w-72 shadow-2xl"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2 px-1">Visual Style</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {VISUAL_STYLES.map(s => (
                        <button
                          key={s.id}
                          onClick={() => { updateSummary({ visualStyle: s.label }); setShowStylePopup(false) }}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                            summary.visualStyle === s.label
                              ? 'bg-[#0ea5e9]/15 border border-[#0ea5e9]/40 text-white'
                              : 'bg-white/5 border border-transparent text-zinc-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <span className="text-base">{s.emoji}</span>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Voice Selector */}
            <div className="relative">
              <button
                onClick={() => { closeAllPopups(); setShowVoicePopup(!showVoicePopup) }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-zinc-400 hover:text-white hover:border-white/20 transition-all"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{summary.narrator?.name || 'Voice'}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              <AnimatePresence>
                {showVoicePopup && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute bottom-full mb-2 left-0 bg-[#1a1025] border border-white/10 rounded-2xl p-3 z-50 w-64 shadow-2xl"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2 px-1">Narrator</p>
                    <div className="space-y-1">
                      {PRESET_NARRATORS.map(n => (
                        <button
                          key={n.id}
                          onClick={() => { setNarrator(n); setShowVoicePopup(false) }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                            summary.narrator?.id === n.id
                              ? 'bg-[#0ea5e9]/15 border border-[#0ea5e9]/40 text-white'
                              : 'bg-white/5 border border-transparent text-zinc-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                            {n.name.charAt(0)}
                          </div>
                          <div className="text-left">
                            <span className="block">{n.name}</span>
                            <span className="text-[10px] text-zinc-600">{n.gender} · {n.accent}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Duration / Aspect Ratio */}
            <div className="relative">
              <button
                onClick={() => { closeAllPopups(); setShowSettingsPopup(!showSettingsPopup) }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-zinc-400 hover:text-white hover:border-white/20 transition-all"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{summary.duration >= 60 ? `${Math.floor(summary.duration / 60)} min` : `${summary.duration}s`} · {summary.aspectRatio}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              <AnimatePresence>
                {showSettingsPopup && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute bottom-full mb-2 right-0 bg-[#1a1025] border border-white/10 rounded-2xl p-4 z-50 w-64 shadow-2xl space-y-4"
                  >
                    {/* Duration */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Duration</p>
                      <div className="flex gap-1.5">
                        {DURATIONS.map(d => (
                          <button
                            key={d.value}
                            onClick={() => updateSummary({ duration: d.value })}
                            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                              summary.duration === d.value
                                ? 'bg-[#0ea5e9] text-white'
                                : 'bg-white/5 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Aspect Ratio */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Aspect Ratio</p>
                      <div className="flex gap-1.5">
                        {ASPECT_RATIOS.map(r => (
                          <button
                            key={r.value}
                            onClick={() => updateSummary({ aspectRatio: r.value })}
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
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!script.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0ea5e9] text-white text-sm font-semibold hover:bg-[#0c96d4] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4" />
              Generate
            </button>
          </div>
        </motion.div>

        {/* Inspiration Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-white/5 backdrop-blur rounded-full p-1 w-fit mb-4">
            {([
              { key: 'trend', label: 'Trend' },
              { key: 'templates', label: 'Templates' },
              { key: 'styles', label: 'Styles' },
              { key: 'avatars', label: 'Avatars' },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-white/10 text-white'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'trend' && (
              <motion.div
                key="trend"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-2"
              >
                {INSPIRATIONS.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => { setScript(item.prompt); textareaRef.current?.focus() }}
                    className="text-left p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-[#0ea5e9]/30 hover:bg-white/[0.06] transition-all group"
                  >
                    <p className="text-xs font-semibold text-white mb-0.5">{item.title}</p>
                    <p className="text-[11px] text-zinc-500 line-clamp-2 group-hover:text-zinc-400 transition-colors">{item.prompt}</p>
                  </button>
                ))}
              </motion.div>
            )}
            {activeTab === 'templates' && (
              <motion.div key="templates" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
                <Layers className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-zinc-500 text-xs">Templates coming soon</p>
              </motion.div>
            )}
            {activeTab === 'styles' && (
              <motion.div key="styles" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {VISUAL_STYLES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => updateSummary({ visualStyle: s.label })}
                      className={`p-3 rounded-xl text-center transition-all ${
                        summary.visualStyle === s.label
                          ? 'bg-[#0ea5e9]/15 border border-[#0ea5e9]/40'
                          : 'bg-white/[0.03] border border-white/5 hover:border-white/15'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{s.emoji}</span>
                      <span className="text-[11px] text-zinc-400">{s.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
            {activeTab === 'avatars' && (
              <motion.div key="avatars" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRESET_NARRATORS.map(n => (
                    <button
                      key={n.id}
                      onClick={() => setNarrator(n)}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                        summary.narrator?.id === n.id
                          ? 'bg-[#0ea5e9]/15 border border-[#0ea5e9]/40'
                          : 'bg-white/[0.03] border border-white/5 hover:border-white/15'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {n.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <span className="text-xs font-medium text-white block">{n.name}</span>
                        <span className="text-[10px] text-zinc-500">{n.gender} · {n.accent}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Click outside to close popups */}
      {(showStylePopup || showVoicePopup || showSettingsPopup) && (
        <div className="fixed inset-0 z-40" onClick={closeAllPopups} />
      )}
    </div>
  )
}
