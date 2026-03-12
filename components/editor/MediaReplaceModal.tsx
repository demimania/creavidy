'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Search, Image as ImageIcon, Film, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEditorStore, VISUAL_STYLES, ASPECT_RATIOS } from '@/lib/stores/editor-store'

type TabId = 'your-media' | 'stock' | 'ai'

const STOCK_CATEGORIES = [
  'Recommend', 'Pop', 'R&B', 'Healing', 'Warm', 'Marketing',
  'Travel', 'Vlog', 'Fresh', 'Love', 'Promising',
]

interface MediaReplaceModalProps {
  sceneId: string
  onClose: () => void
}

export function MediaReplaceModal({ sceneId, onClose }: MediaReplaceModalProps) {
  const { scenes, updateScene, summary } = useEditorStore()
  const scene = scenes.find(s => s.id === sceneId)
  const [activeTab, setActiveTab] = useState<TabId>('ai')
  const [aiPrompt, setAiPrompt] = useState(scene?.script || '')
  const [selectedStyle, setSelectedStyle] = useState(summary.visualStyle)
  const [mediaType, setMediaType] = useState<'images' | 'video'>(summary.sceneMediaType)
  const [aspectRatio, setAspectRatio] = useState(summary.aspectRatio)

  const tabs: { id: TabId; label: string }[] = [
    { id: 'your-media', label: 'Your Media' },
    { id: 'stock', label: 'Stock Media' },
    { id: 'ai', label: 'AI Media' },
  ]

  const handleGenerate = () => {
    // Call the editor's regenerateSceneImage function
    const actions = (window as any).__editorActions
    if (actions?.regenerateSceneImage) {
      actions.regenerateSceneImage(sceneId)
    }
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[#f8f8f8] dark:bg-[#1a1025] rounded-2xl w-full max-w-[900px] max-h-[80vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Tabs */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-6">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`text-base font-semibold transition-colors ${
                  activeTab === t.id
                    ? 'text-black dark:text-white'
                    : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <AnimatePresence mode="wait">
            {/* Your Media Tab */}
            {activeTab === 'your-media' && (
              <motion.div key="your-media" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="grid grid-cols-4 gap-3 mt-3">
                  {/* Upload button */}
                  <button className="aspect-video rounded-xl border-2 border-dashed border-zinc-300 dark:border-white/10 flex flex-col items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-white hover:border-zinc-400 dark:hover:border-white/20 transition-all">
                    <Upload className="w-6 h-6 mb-1" />
                    <span className="text-xs">Media</span>
                  </button>
                  {/* Placeholder for user uploads */}
                  <div className="aspect-video rounded-xl bg-zinc-200 dark:bg-white/5 flex items-center justify-center">
                    <span className="text-xs text-zinc-400">No media yet</span>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400 mt-4 flex items-center gap-1">
                  <span className="inline-block w-3.5 h-3.5 rounded-full border border-zinc-300 dark:border-white/20 flex items-center justify-center text-[8px]">i</span>
                  Closing this window will continue upload and save to your media area.
                </p>
              </motion.div>
            )}

            {/* Stock Media Tab */}
            {activeTab === 'stock' && (
              <motion.div key="stock" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Search */}
                <div className="relative mt-2 mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder={`Suggested: ${scene?.script?.substring(0, 60) || 'Search media...'}`}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-sm text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#0ea5e9]"
                  />
                </div>
                {/* Categories */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3">
                  {STOCK_CATEGORIES.map((cat, i) => (
                    <button
                      key={cat}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                        i === 0
                          ? 'bg-[#0ea5e9] text-white'
                          : 'bg-zinc-100 dark:bg-white/5 text-zinc-500 hover:text-zinc-700 dark:hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                {/* Placeholder grid */}
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="aspect-video rounded-lg bg-zinc-200 dark:bg-white/5 flex items-center justify-center">
                      <span className="text-[10px] text-zinc-400">Stock {i + 1}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* AI Media Tab */}
            {activeTab === 'ai' && (
              <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex gap-6 mt-3">
                  {/* Left: AI controls */}
                  <div className="w-[280px] flex-shrink-0 space-y-4">
                    {/* Prompt */}
                    <div>
                      <p className="text-xs font-semibold text-black dark:text-white mb-1.5">Description</p>
                      <div className="relative">
                        <textarea
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          maxLength={1500}
                          rows={4}
                          className="w-full rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-3 py-2.5 text-sm text-black dark:text-white placeholder:text-zinc-400 resize-none focus:outline-none focus:border-[#0ea5e9]"
                        />
                        <span className="absolute bottom-2 right-2.5 text-[10px] text-zinc-400">{aiPrompt.length}/1500</span>
                      </div>
                    </div>

                    {/* Style */}
                    <div>
                      <p className="text-xs font-semibold text-black dark:text-white mb-1.5">Style</p>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {VISUAL_STYLES.slice(0, 4).map(s => (
                          <button
                            key={s.id}
                            onClick={() => setSelectedStyle(s.label)}
                            className={`flex flex-col items-center gap-1 flex-shrink-0 ${
                              selectedStyle === s.label ? 'opacity-100' : 'opacity-60 hover:opacity-80'
                            }`}
                          >
                            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 border-2 transition-all flex items-center justify-center text-2xl ${
                              selectedStyle === s.label ? 'border-[#0ea5e9]' : 'border-transparent'
                            }`}>
                              {s.emoji}
                            </div>
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{s.label}</span>
                          </button>
                        ))}
                        <button className="w-8 h-16 rounded-xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-400">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Scene media type */}
                    <div>
                      <p className="text-xs font-semibold text-black dark:text-white mb-1.5">Scene media</p>
                      <div className="flex gap-2">
                        {(['images', 'video'] as const).map(t => (
                          <button
                            key={t}
                            onClick={() => setMediaType(t)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                              mediaType === t
                                ? 'bg-[#0ea5e9]/10 border border-[#0ea5e9]/30 text-[#0ea5e9]'
                                : 'bg-zinc-100 dark:bg-white/5 border border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-white'
                            }`}
                          >
                            {t === 'images' ? <ImageIcon className="w-3.5 h-3.5" /> : <Film className="w-3.5 h-3.5" />}
                            {t === 'images' ? 'Images' : 'Video clips'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Aspect ratio */}
                    <div>
                      <p className="text-xs font-semibold text-black dark:text-white mb-1.5">Aspect ratio</p>
                      <div className="flex gap-2">
                        {ASPECT_RATIOS.slice(0, 2).map(r => (
                          <button
                            key={r.value}
                            onClick={() => setAspectRatio(r.value)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                              aspectRatio === r.value
                                ? 'bg-[#0ea5e9]/10 border border-[#0ea5e9]/30 text-[#0ea5e9]'
                                : 'bg-zinc-100 dark:bg-white/5 border border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-white'
                            }`}
                          >
                            {r.value}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Generate button */}
                    <button
                      onClick={handleGenerate}
                      className="w-full py-3 rounded-xl bg-[#0ea5e9] text-white text-sm font-semibold hover:bg-[#0c96d4] transition-colors"
                    >
                      Generate
                    </button>
                  </div>

                  {/* Right: Preview */}
                  <div className="flex-1">
                    <div className="w-full aspect-[16/10] rounded-xl bg-zinc-200 dark:bg-white/5 border border-zinc-200 dark:border-white/10 overflow-hidden relative flex items-center justify-center">
                      {scene?.imageUrl ? (
                        <>
                          <img src={scene.imageUrl} alt="" className="w-full h-full object-cover" />
                          <span className="absolute top-3 right-3 px-2 py-1 rounded-md bg-black/50 text-white text-[10px]">
                            Added
                          </span>
                        </>
                      ) : (
                        <p className="text-sm text-zinc-400">Preview will appear here</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
