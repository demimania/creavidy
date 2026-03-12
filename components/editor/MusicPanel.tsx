'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Search, SlidersHorizontal, Play, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEditorStore } from '@/lib/stores/editor-store'

const MUSIC_CATEGORIES = [
  'Recommend', 'Pop', 'R&B', 'Promising', 'Marketing', 'Travel',
  'Vlog', 'Fresh', 'Healing', 'Warm', 'Hi-Tempo', 'Love',
]

const TRENDING_TAGS = ['background music', 'phonk', 'Happy New Year', 'tiktok']

const SAMPLE_TRACKS = [
  { id: '1', name: 'Hope. City pop.', artist: '(1145157)', duration: '02:11', category: 'table_1' },
  { id: '2', name: 'PHONK!', artist: '', duration: '01:00', category: 'D254' },
  { id: '3', name: 'Hip Hop Background', artist: '(8142...)', duration: '02:30', category: '' },
  { id: '4', name: 'Emotional Piano', artist: '', duration: '03:15', category: 'Healing' },
]

interface MusicPanelProps {
  onClose: () => void
}

export function MusicPanel({ onClose }: MusicPanelProps) {
  const { updateSummary } = useEditorStore()
  const [search, setSearch] = useState('')
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [showCategories, setShowCategories] = useState(false)
  const [volumeTrackId, setVolumeTrackId] = useState<string | null>(null)

  const handleSelectTrack = (track: typeof SAMPLE_TRACKS[0]) => {
    updateSummary({ musicMood: track.name })
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="absolute top-0 right-0 w-[320px] h-full bg-white dark:bg-[#1a1025] border-l border-zinc-200 dark:border-white/10 shadow-2xl z-50 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-white/10">
        <h3 className="text-base font-semibold text-black dark:text-white">Music</h3>
        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 pt-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search music"
              className="w-full pl-8 pr-3 py-2 rounded-lg bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#0ea5e9]"
            />
          </div>
          <button className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Trending tags */}
      <div className="flex items-center gap-1.5 px-4 pt-2 pb-1 overflow-x-auto">
        {TRENDING_TAGS.map(tag => (
          <button
            key={tag}
            className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-white/5 text-[10px] text-zinc-500 hover:text-zinc-700 dark:hover:text-white whitespace-nowrap transition-colors"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Categories */}
      <div className="px-4 pt-2">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-black dark:text-white">Category</p>
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="text-[10px] text-[#0ea5e9] hover:underline"
          >
            {showCategories ? 'Show less' : 'Show all'}
          </button>
        </div>
        <div className={`grid grid-cols-3 gap-1.5 ${showCategories ? '' : 'max-h-[80px] overflow-hidden'}`}>
          {MUSIC_CATEGORIES.map(cat => (
            <button
              key={cat}
              className="relative rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/5 overflow-hidden h-10 flex items-center justify-center"
            >
              <span className="text-[9px] font-bold text-white uppercase tracking-wider">{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      <div className="flex-1 overflow-y-auto px-4 pt-3">
        <p className="text-xs font-semibold text-black dark:text-white mb-2">Suggestions</p>
        <div className="space-y-1">
          {SAMPLE_TRACKS.map(track => (
            <div key={track.id} className="group relative">
              <button
                onClick={() => handleSelectTrack(track)}
                className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
              >
                {/* Album art placeholder */}
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500/30 to-purple-500/30 flex items-center justify-center flex-shrink-0 relative">
                  {playingId === track.id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-xs font-medium text-black dark:text-white truncate">{track.name}</p>
                  <p className="text-[10px] text-zinc-400">{track.duration} · {track.category}</p>
                </div>
                {/* Add button */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); setVolumeTrackId(volumeTrackId === track.id ? null : track.id) }}
                    className="w-6 h-6 rounded-md bg-zinc-200 dark:bg-white/10 flex items-center justify-center text-zinc-500 hover:text-zinc-700 dark:hover:text-white"
                  >
                    <SlidersHorizontal className="w-3 h-3" />
                  </button>
                  <button className="w-6 h-6 rounded-full bg-[#0ea5e9] flex items-center justify-center text-white">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </button>

              {/* Volume control */}
              {volumeTrackId === track.id && (
                <div className="mx-2 mb-2 p-2 rounded-lg bg-zinc-100 dark:bg-white/5">
                  <p className="text-[10px] text-zinc-500 mb-1">Set volume level</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="-30"
                      max="0"
                      defaultValue="-18"
                      className="flex-1 h-1 accent-[#0ea5e9]"
                    />
                    <span className="text-[10px] text-zinc-400 w-12 text-right">-18.4dB</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
