'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MoreHorizontal, RefreshCw, Scissors, Trash2, GripVertical,
  Sparkles, Music, Download, Edit3, Grid3x3
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
    } else if (action === 'replace') {
      const actions = (window as any).__editorActions
      if (actions?.regenerateSceneImage) {
        actions.regenerateSceneImage(sceneId)
      }
    }
    // cut will be handled later
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
              <img
                src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${scene.narratorName}`}
                alt={scene.narratorName}
                className="w-4 h-4 rounded-full"
              />
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
          <span className="absolute bottom-0.5 right-0.5 text-[8px] text-white bg-black/60 px-1 rounded">
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
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">Film Strip 1</span>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const actions = (window as any).__editorActions
              if (actions?.setShowExport) actions.setShowExport(true)
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0ea5e9] text-white text-xs font-medium hover:bg-[#0c96d4] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs font-medium hover:bg-white/10 transition-colors">
            <Edit3 className="w-3.5 h-3.5 inline mr-1" />
            Edit more
          </button>
          <button
            onClick={() => {
              const actions = (window as any).__editorActions
              if (actions?.setShowMusic) actions.setShowMusic(true)
            }}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs font-medium hover:bg-white/10 transition-colors"
          >
            <Music className="w-3.5 h-3.5 inline mr-1" />
            Add music
          </button>
          <button className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors" title="Elements">
            <Grid3x3 className="w-3.5 h-3.5" />
          </button>
        </div>
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

      {/* Bottom: Timeline Graph */}
      {scenes.length > 0 && (
        <div className="flex-shrink-0 px-4 py-3 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-zinc-500">Timeline</span>
            <span className="text-[10px] text-zinc-500">Scenes {scenes.length}</span>
          </div>
          <div className="relative h-16 rounded-lg bg-black/30 border border-white/5 overflow-hidden">
            {/* Simple timeline visualization */}
            <svg className="w-full h-full" viewBox="0 0 400 60" preserveAspectRatio="none">
              {/* Curve path */}
              <path
                d="M 0 40 Q 100 20, 200 30 T 400 25"
                stroke="rgba(14, 165, 233, 0.3)"
                strokeWidth="2"
                fill="none"
                strokeDasharray="4 4"
              />
              {/* Scene dots */}
              {scenes.map((scene, i) => {
                const x = (i / (scenes.length - 1 || 1)) * 380 + 10
                const y = 30 + Math.sin(i * 0.5) * 10
                return (
                  <circle
                    key={scene.id}
                    cx={x}
                    cy={y}
                    r="4"
                    fill={scene.status === 'ready' ? '#10b981' : scene.status === 'generating' ? '#f59e0b' : '#6b7280'}
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="1"
                  />
                )
              })}
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}
