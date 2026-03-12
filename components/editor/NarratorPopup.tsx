'use client'

import { motion } from 'framer-motion'
import { X, Mic, Star } from 'lucide-react'
import {
  useEditorStore,
  PRESET_NARRATORS,
  type EditorNarrator,
} from '@/lib/stores/editor-store'

export function NarratorPopup({ onClose }: { onClose: () => void }) {
  const {
    summary,
    setNarrator,
    narratorTab,
    setNarratorTab,
    narratorApplyMode,
    setNarratorApplyMode,
    scenes,
    updateScene,
  } = useEditorStore()

  const categories = ['favorites', 'trend', 'narration'] as const
  const [activeCategory, setActiveCategory] = [
    'trend' as typeof categories[number],
    (cat: typeof categories[number]) => {},
  ]

  const handleApply = (narrator: EditorNarrator) => {
    setNarrator(narrator)

    if (narratorApplyMode === 'all') {
      scenes.forEach(s => {
        updateScene(s.id, {
          narratorId: narrator.id,
          narratorName: narrator.name,
        })
      })
    }

    onClose()
  }

  const filteredNarrators = PRESET_NARRATORS

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute top-0 left-full ml-2 w-[300px] bg-[#1a1025] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <span className="text-sm font-semibold text-white">Narrator</span>
        <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs: Voice / Avatar */}
      <div className="flex px-4 pt-3">
        <div className="flex gap-1 bg-white/5 rounded-lg p-0.5 w-full">
          <button
            onClick={() => setNarratorTab('voice')}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
              narratorTab === 'voice' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Voice
          </button>
          <button
            onClick={() => setNarratorTab('avatar')}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
              narratorTab === 'avatar' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Avatar
          </button>
        </div>
      </div>

      {/* Custom voice CTA */}
      <div className="mx-4 mt-3 p-3 rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-center">
        <p className="text-[11px] text-zinc-500 mb-1">Create your custom voice</p>
        <button className="text-xs text-[#0ea5e9] font-medium hover:underline">
          Start
        </button>
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-1.5 px-4 mt-3">
        <p className="text-[10px] text-zinc-500 mr-1">Recommended</p>
        {(['Favorites', 'Trend', 'Narration'] as const).map((cat) => (
          <button
            key={cat}
            className="px-2 py-1 rounded-full text-[10px] font-medium bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Narrator List */}
      <div className="px-4 py-3 space-y-1 max-h-[300px] overflow-y-auto">
        {filteredNarrators.map(n => (
          <button
            key={n.id}
            onClick={() => handleApply(n)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
              summary.narrator?.id === n.id
                ? 'bg-[#0ea5e9]/15 border border-[#0ea5e9]/40 text-white'
                : 'bg-white/[0.03] border border-transparent text-zinc-400 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {n.name.charAt(0)}
            </div>
            <div className="text-left flex-1 min-w-0">
              <span className="block font-medium truncate">{n.name}</span>
              <span className="text-[10px] text-zinc-600">{n.gender} · {n.accent}</span>
            </div>
            {n.isFavorite && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
          </button>
        ))}
      </div>

      {/* Apply options */}
      <div className="px-4 py-3 border-t border-white/10 space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={narratorApplyMode === 'all'}
            onChange={(e) => setNarratorApplyMode(e.target.checked ? 'all' : 'selected')}
            className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#0ea5e9] focus:ring-[#0ea5e9]"
          />
          <span className="text-[11px] text-zinc-400">Apply to all scenes</span>
        </label>

        <button
          onClick={() => {
            if (summary.narrator) handleApply(summary.narrator)
            else onClose()
          }}
          className="w-full py-2.5 rounded-xl bg-[#0ea5e9] text-white text-xs font-semibold hover:bg-[#0c96d4] transition-colors"
        >
          Apply ({narratorApplyMode === 'all' ? scenes.length : 1})
        </button>
      </div>
    </motion.div>
  )
}
