'use client'
import { useState, useCallback } from 'react'
import { Handle, Position } from 'reactflow'
import { Play, Loader2, Film, ChevronDown } from 'lucide-react'
import type { NodeData } from '@/lib/stores/workspace-store'

const VIDEO_MODELS = [
  { id: 'kling-3-std',  label: 'Kling 3.0 Standard', credits: 35, color: '#a78bfa' },
  { id: 'kling-3-pro',  label: 'Kling 3.0 Pro',      credits: 50, color: '#a78bfa' },
  { id: 'runway-gen4',  label: 'Runway Gen-4',         credits: 30, color: '#f472b6' },
  { id: 'veo3',         label: 'Veo 3.1',              credits: 50, color: '#34d399' },
  { id: 'luma',         label: 'Luma Dream Machine',   credits: 20, color: '#60a5fa' },
  { id: 'minimax',      label: 'Minimax Hailuo',       credits: 25, color: '#fb923c' },
  { id: 'wan',          label: 'Wan 2.6',              credits: 20, color: '#e879f9' },
] as const

export function MultiModelVideoNodeContent({ data }: { data: NodeData; selected?: boolean }) {
  const cfg = data.config as any
  const [model, setModel] = useState<string>(cfg?.model || 'kling-3-std')
  const [prompt, setPrompt] = useState<string>(cfg?.prompt || '')
  const [duration, setDuration] = useState<number>(cfg?.duration || 5)
  const [aspectRatio, setAspectRatio] = useState<string>(cfg?.aspectRatio || '16:9')
  const [outputUrl, setOutputUrl] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [showModelPicker, setShowModelPicker] = useState<boolean>(false)

  const selectedModel = VIDEO_MODELS.find(m => m.id === model) || VIDEO_MODELS[0]

  const handleRun = useCallback(async () => {
    if (!prompt.trim()) { setError('Prompt gerekli'); return }
    setLoading(true); setError(''); setOutputUrl('')
    try {
      const res = await fetch('/api/generate/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt, duration, aspectRatio }),
      })
      const d = await res.json()
      if (d.error) throw new Error(d.error)
      setOutputUrl(d.videoUrl)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [model, prompt, duration, aspectRatio])

  return (
    <div className="relative bg-[#0F051D]/95 border border-white/10 rounded-xl p-3 min-w-[240px] max-w-[280px]">
      <Handle type="target" position={Position.Left} id="text-in" style={{ background: '#a78bfa', top: '30%' }} />
      <Handle type="target" position={Position.Left} id="image-in" style={{ background: '#FFE744', top: '60%' }} />
      <Handle type="source" position={Position.Right} id="video-out" style={{ background: '#22d3ee' }} />

      {/* Header */}
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${selectedModel.color}20` }}>
          <Film className="w-3.5 h-3.5" style={{ color: selectedModel.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-zinc-200 truncate">{data.label || 'Video Generator'}</p>
          <p className="text-[9px] text-zinc-500">Text / Image to Video</p>
        </div>
      </div>

      {/* Model Picker */}
      <div className="mb-2 relative">
        <label className="text-[9px] text-zinc-500 uppercase tracking-wide mb-1 block">Model</label>
        <button
          onClick={() => setShowModelPicker(v => !v)}
          className="w-full flex items-center justify-between px-2 py-1.5 bg-white/5 border border-white/8 rounded-lg hover:border-white/15 transition-colors"
        >
          <span className="text-[10px] text-zinc-300 font-medium">{selectedModel.label}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono" style={{ color: selectedModel.color }}>{selectedModel.credits}cr</span>
            <ChevronDown className="w-3 h-3 text-zinc-600" />
          </div>
        </button>

        {showModelPicker && (
          <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-[#0F051D] border border-white/10 rounded-lg overflow-hidden shadow-xl">
            {VIDEO_MODELS.map(m => (
              <button
                key={m.id}
                onClick={() => { setModel(m.id); setShowModelPicker(false) }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-left hover:bg-white/5 transition-colors ${model === m.id ? 'bg-white/8' : ''}`}
              >
                <span className="text-[10px] text-zinc-300">{m.label}</span>
                <span className="text-[9px] font-mono" style={{ color: m.color }}>{m.credits}cr</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Prompt */}
      <div className="mb-2">
        <label className="text-[9px] text-zinc-500 uppercase tracking-wide mb-1 block">Prompt</label>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Describe the video..."
          rows={3}
          className="w-full bg-white/5 border border-white/8 rounded-lg px-2 py-1.5 text-[10px] text-zinc-300 outline-none focus:border-white/20 resize-none"
        />
      </div>

      {/* Duration + Aspect */}
      <div className="flex gap-2 mb-2.5">
        <div className="flex-1">
          <label className="text-[9px] text-zinc-500 uppercase tracking-wide mb-1 block">Duration (s)</label>
          <input
            type="number"
            value={duration}
            onChange={e => setDuration(Number(e.target.value))}
            min={2} max={30}
            className="w-full bg-white/5 border border-white/8 rounded-lg px-2 py-1 text-[10px] text-zinc-300 outline-none focus:border-white/20"
          />
        </div>
        <div className="flex-1">
          <label className="text-[9px] text-zinc-500 uppercase tracking-wide mb-1 block">Aspect</label>
          <select
            value={aspectRatio}
            onChange={e => setAspectRatio(e.target.value)}
            className="w-full bg-white/5 border border-white/8 rounded-lg px-2 py-1 text-[10px] text-zinc-300 outline-none focus:border-white/20"
          >
            <option value="16:9">16:9</option>
            <option value="9:16">9:16</option>
            <option value="1:1">1:1</option>
            <option value="4:3">4:3</option>
          </select>
        </div>
      </div>

      {/* Run button */}
      <button
        onClick={handleRun}
        disabled={loading}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
        style={{
          background: loading ? 'rgba(255,255,255,0.04)' : `${selectedModel.color}18`,
          color: loading ? '#555' : selectedModel.color,
          border: `1px solid ${selectedModel.color}28`,
        }}
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
        {loading ? 'Generating...' : `Generate · ${selectedModel.credits}cr`}
      </button>

      {error && <p className="text-[9px] text-red-400 mt-1.5 text-center">{error}</p>}

      {outputUrl && (
        <div className="mt-2 rounded-lg overflow-hidden border border-white/8">
          <video src={outputUrl} controls className="w-full max-h-32 object-cover" />
        </div>
      )}
    </div>
  )
}
