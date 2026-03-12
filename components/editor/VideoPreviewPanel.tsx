'use client'

import { useState } from 'react'
import { Play, Pause, Maximize2, Music } from 'lucide-react'
import { useEditorStore } from '@/lib/stores/editor-store'

export function VideoPreviewPanel() {
  const { scenes, selectedSceneId, summary } = useEditorStore()
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeTab, setActiveTab] = useState<'style' | 'elements'>('style')

  const selectedScene = scenes.find(s => s.id === selectedSceneId)
  const previewUrl = selectedScene?.imageUrl || selectedScene?.videoUrl || null

  // Calculate total duration
  const totalDuration = scenes.reduce((acc, s) => acc + s.duration, 0)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}:00`
  }

  return (
    <div className="w-[380px] flex-shrink-0 border-l border-white/10 flex flex-col bg-black/20">
      {/* Tab bar */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-white/10">
        {/* Music add */}
        <button className="flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-white transition-colors">
          <Music className="w-3.5 h-3.5" />
          Add Music
        </button>
        <div className="flex-1" />
        {/* Style / Elements tabs */}
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
          <button
            onClick={() => setActiveTab('style')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              activeTab === 'style' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {summary.visualStyle.substring(0, 12)}...
          </button>
          <button
            onClick={() => setActiveTab('elements')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 ${
              activeTab === 'elements' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Elements
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full aspect-video bg-zinc-900/50 rounded-xl border border-white/5 overflow-hidden relative">
          {previewUrl ? (
            selectedScene?.videoUrl ? (
              <video
                src={previewUrl}
                className="w-full h-full object-cover"
                muted
                autoPlay={isPlaying}
                loop
              />
            ) : (
              <img src={previewUrl} alt="" className="w-full h-full object-cover" />
            )
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
                <Play className="w-8 h-8 text-zinc-600" />
              </div>
              <p className="text-xs text-zinc-600">Preview will appear here</p>
            </div>
          )}

          {/* Overlay text */}
          {selectedScene && previewUrl && (
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <p className="text-sm text-white font-medium drop-shadow-lg line-clamp-2">
                {selectedScene.script.substring(0, 60)}...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Player Controls */}
      <div className="px-4 pb-4">
        {/* Progress bar */}
        <div className="w-full h-1 bg-white/5 rounded-full mb-2 overflow-hidden">
          <div className="h-full bg-white/20 rounded-full" style={{ width: '0%' }} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <span className="text-[11px] text-zinc-500 font-mono">
              {formatTime(0)} | {formatTime(totalDuration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-500 bg-white/5 px-2 py-0.5 rounded">
              {summary.aspectRatio}
            </span>
            <button className="text-zinc-400 hover:text-white transition-colors">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
