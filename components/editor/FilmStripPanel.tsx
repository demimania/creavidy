'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MoreHorizontal, RefreshCw, Scissors, Trash2, GripVertical,
  Sparkles, Music, CheckCircle2
} from 'lucide-react'
import { useEditorStore } from '@/lib/stores/editor-store'

function SceneCard({ sceneId }: { sceneId: string }) {
  const { scenes, selectedSceneId, selectScene, updateScene, removeScene, sceneActionMenu, setSceneActionMenu } = useEditorStore()
  const scene = scenes.find(s => s.id === sceneId)
  if (!scene) return null

  const isSelected = selectedSceneId === sceneId
  const showMenu = sceneActionMenu?.sceneId === sceneId

  const handleAction = (action: 'replace' | 'cut' | 'delete') => {
    setSceneActionMenu(null)
    if (action === 'delete') {
      removeScene(sceneId)
    }
    // replace and cut will be handled by media generation flow
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative group rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? 'border-[#0ea5e9]/50 bg-[#0ea5e9]/5'
          : 'border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
      }`}
      onClick={() => selectScene(sceneId)}
    >
      <div className="flex items-start gap-3 p-3">
        {/* Drag Handle */}
        <div className="pt-1 opacity-0 group-hover:opacity-50 transition-opacity cursor-grab">
          <GripVertical className="w-3.5 h-3.5 text-zinc-500" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header: timestamp + narrator */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] text-zinc-500 font-mono">{scene.timestamp}</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-[7px] text-white font-bold">
                {scene.narratorName.charAt(0)}
              </div>
              <span className="text-[10px] text-zinc-400">{scene.narratorName}</span>
            </div>
          </div>

          {/* Script text */}
          <p className="text-xs text-white leading-relaxed line-clamp-3">{scene.script}</p>
        </div>

        {/* Thumbnail */}
        <div className="w-20 h-14 rounded-lg bg-zinc-800/50 border border-white/5 overflow-hidden flex-shrink-0 relative">
          {scene.imageUrl ? (
            <img src={scene.imageUrl} alt="" className="w-full h-full object-cover" />
          ) : scene.videoUrl ? (
            <video src={scene.videoUrl} className="w-full h-full object-cover" muted />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-[10px] text-zinc-600">No media</span>
            </div>
          )}
          {/* Duration badge */}
          <span className="absolute bottom-0.5 left-0.5 text-[8px] text-white bg-black/60 px-1 rounded">
            0:{String(scene.duration).padStart(2, '0')}
          </span>

          {/* Status indicator */}
          {scene.status === 'generating' && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* More button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setSceneActionMenu(showMenu ? null : { sceneId, x: e.clientX, y: e.clientY })
          }}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-md bg-black/60 flex items-center justify-center hover:bg-black/80"
        >
          <MoreHorizontal className="w-3.5 h-3.5 text-white" />
        </button>
      </div>

      {/* Action Menu */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-2 right-8 bg-[#1a1025] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => handleAction('replace')}
              className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-white/10 hover:text-white w-full transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Replace
            </button>
            <button
              onClick={() => handleAction('cut')}
              className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-white/10 hover:text-white w-full transition-colors"
            >
              <Scissors className="w-3.5 h-3.5" />
              Cut
            </button>
            <button
              onClick={() => handleAction('delete')}
              className="flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function FilmStripPanel() {
  const { scenes, phase, progress, setSceneActionMenu } = useEditorStore()

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden"
      onClick={() => setSceneActionMenu(null)}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 flex-shrink-0">
        <span className="text-sm font-semibold text-white">Film Strip 1</span>
        <button className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <AnimatePresence>
        {progress && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2 bg-[#0ea5e9]/5 border-b border-[#0ea5e9]/20"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#0ea5e9] animate-pulse" />
                <span className="text-[11px] text-[#0ea5e9] font-medium">{progress.message}</span>
              </div>
              <span className="text-[10px] text-zinc-500">~{progress.estimatedMinutes} min</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#0ea5e9] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress.percent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scene List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {scenes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6 text-zinc-600" />
            </div>
            <p className="text-sm text-zinc-500 mb-1">No scenes yet</p>
            <p className="text-[11px] text-zinc-600">Generate from your script to see scenes here</p>
          </div>
        ) : (
          scenes.map(scene => (
            <SceneCard key={scene.id} sceneId={scene.id} />
          ))
        )}
      </div>

      {/* Bottom Actions */}
      {scenes.length > 0 && (
        <div className="flex items-center justify-center gap-2 px-4 py-3 border-t border-white/10">
          <button className="px-4 py-2 rounded-xl bg-[#0ea5e9] text-white text-xs font-semibold hover:bg-[#0c96d4] transition-colors">
            Export
          </button>
          <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-medium hover:bg-white/10 transition-colors">
            Edit More
          </button>
          <div className="w-px h-5 bg-white/10 mx-1" />
          <button className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors" title="Duplicate">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
          <button className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-red-400 transition-colors" title="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
