'use client'
import { useState, useCallback } from 'react'
import { Handle, Position } from 'reactflow'
import { Play, Loader2, Video, ArrowUpCircle, Sparkles, Mic } from 'lucide-react'
import type { NodeData } from '@/lib/stores/workspace-store'

const EDIT_META = {
  lipsync:  { label: 'Lip Sync',       icon: Mic,           color: '#f472b6', endpoint: 'lipsync' },
  v2v:      { label: 'Video to Video', icon: Sparkles,      color: '#a78bfa', endpoint: 'v2v' },
  upscale:  { label: 'Video Upscale',  icon: ArrowUpCircle, color: '#34d399', endpoint: 'upscale' },
  enhance:  { label: 'Video Enhance',  icon: Video,         color: '#60a5fa', endpoint: 'enhance' },
} as const

type EditType = keyof typeof EDIT_META

export function VideoEditNodeContent({ data }: { data: NodeData; selected?: boolean }) {
  const editType = ((data.config as any)?.editType as EditType) || 'lipsync'
  const meta = EDIT_META[editType] || EDIT_META.lipsync
  const Icon = meta.icon

  const [videoUrl, setVideoUrl] = useState((data.config as any)?.videoUrl || '')
  const [audioUrl, setAudioUrl] = useState((data.config as any)?.audioUrl || '')
  const [prompt, setPrompt] = useState((data.config as any)?.prompt || '')
  const [outputUrl, setOutputUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleExecute = useCallback(async () => {
    if (!videoUrl) { setError('Video URL gerekli'); return }
    setLoading(true); setError(''); setOutputUrl('')
    try {
      const res = await fetch('/api/generate/video-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editType: meta.endpoint, videoUrl, audioUrl, prompt }),
      })
      const d = await res.json()
      if (d.error) throw new Error(d.error)
      setOutputUrl(d.videoUrl)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [videoUrl, audioUrl, prompt, meta.endpoint])

  return (
    <div className="relative bg-[#0F051D]/95 border border-white/10 rounded-xl p-3 min-w-[220px] max-w-[260px]">
      <Handle type="target" position={Position.Left} id="video-in" style={{ background: '#22d3ee', top: '35%' }} />
      {editType === 'lipsync' && (
        <Handle type="target" position={Position.Left} id="audio-in" style={{ background: '#f472b6', top: '65%' }} />
      )}
      <Handle type="source" position={Position.Right} id="video-out" style={{ background: '#22d3ee' }} />

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${meta.color}20` }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
        </div>
        <div>
          <p className="text-xs font-semibold text-zinc-200">{meta.label}</p>
          <p className="text-[9px] text-zinc-500">Video Edit</p>
        </div>
      </div>

      {/* Video URL */}
      <div className="mb-2">
        <label className="text-[9px] text-zinc-500 uppercase tracking-wide mb-1 block">Video URL</label>
        <input
          value={videoUrl}
          onChange={e => setVideoUrl(e.target.value)}
          placeholder="https://..."
          className="w-full bg-white/5 border border-white/[0.08] rounded-lg px-2 py-1 text-[10px] text-zinc-300 outline-none focus:border-white/20"
        />
      </div>

      {/* Audio URL (lipsync only) */}
      {editType === 'lipsync' && (
        <div className="mb-2">
          <label className="text-[9px] text-zinc-500 uppercase tracking-wide mb-1 block">Audio URL</label>
          <input
            value={audioUrl}
            onChange={e => setAudioUrl(e.target.value)}
            placeholder="https://..."
            className="w-full bg-white/5 border border-white/[0.08] rounded-lg px-2 py-1 text-[10px] text-zinc-300 outline-none focus:border-white/20"
          />
        </div>
      )}

      {/* Prompt (v2v only) */}
      {editType === 'v2v' && (
        <div className="mb-2">
          <label className="text-[9px] text-zinc-500 uppercase tracking-wide mb-1 block">Prompt</label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={2}
            className="w-full bg-white/5 border border-white/[0.08] rounded-lg px-2 py-1 text-[10px] text-zinc-300 outline-none focus:border-white/20 resize-none"
          />
        </div>
      )}

      {/* Execute button */}
      <button
        onClick={handleExecute}
        disabled={loading}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
        style={{
          background: loading ? 'rgba(255,255,255,0.05)' : `${meta.color}20`,
          color: loading ? '#666' : meta.color,
          border: `1px solid ${meta.color}30`,
        }}
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
        {loading ? 'Processing...' : 'Run'}
      </button>

      {/* Error */}
      {error && <p className="text-[9px] text-red-400 mt-1.5 text-center">{error}</p>}

      {/* Output preview */}
      {outputUrl && (
        <div className="mt-2 rounded-lg overflow-hidden border border-white/[0.08]">
          <video src={outputUrl} controls className="w-full max-h-24 object-cover" />
        </div>
      )}
    </div>
  )
}

// Variants for each edit type
export function LipSyncNodeContent({ data, selected }: { data: NodeData; selected?: boolean }) {
  return <VideoEditNodeContent data={{ ...data, config: { ...(data.config as any), editType: 'lipsync' } }} selected={selected} />
}
export function VideoToVideoNodeContent({ data, selected }: { data: NodeData; selected?: boolean }) {
  return <VideoEditNodeContent data={{ ...data, config: { ...(data.config as any), editType: 'v2v' } }} selected={selected} />
}
export function VideoUpscaleNodeContent({ data, selected }: { data: NodeData; selected?: boolean }) {
  return <VideoEditNodeContent data={{ ...data, config: { ...(data.config as any), editType: 'upscale' } }} selected={selected} />
}
export function VideoEnhanceNodeContent({ data, selected }: { data: NodeData; selected?: boolean }) {
  return <VideoEditNodeContent data={{ ...data, config: { ...(data.config as any), editType: 'enhance' } }} selected={selected} />
}
