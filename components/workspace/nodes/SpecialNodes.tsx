'use client'
import { useState, useCallback } from 'react'
import { Handle, Position } from 'reactflow'
import { Play, Loader2, Box, Music, Mic2 } from 'lucide-react'
import type { NodeData } from '@/lib/stores/workspace-store'

// ─── 3D Generation Node ───────────────────────────────────────────────────────
export function ThreeDNodeContent({ data }: { data: NodeData; selected?: boolean }) {
  const [prompt, setPrompt] = useState((data.config as any)?.prompt || '')
  const [imageUrl, setImageUrl] = useState((data.config as any)?.imageUrl || '')
  const [model, setModel] = useState((data.config as any)?.model || 'triposr')
  const [outputUrl, setOutputUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRun = useCallback(async () => {
    if (!prompt && !imageUrl) { setError('Prompt veya görsel gerekli'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/generate/3d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt, imageUrl }),
      })
      const d = await res.json()
      if (d.error) throw new Error(d.error)
      setOutputUrl(d.modelUrl)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }, [model, prompt, imageUrl])

  return (
    <div className="bg-[#0F051D]/95 border border-white/10 rounded-xl p-3 min-w-[220px] max-w-[260px]">
      <Handle type="target" position={Position.Left} id="image-in" style={{ background: '#FFE744', top: '40%' }} />
      <Handle type="target" position={Position.Left} id="text-in" style={{ background: '#a78bfa', top: '60%' }} />
      <Handle type="source" position={Position.Right} id="3d-out" style={{ background: '#34d399' }} />

      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-7 h-7 rounded-lg bg-[#34d399]/15 flex items-center justify-center">
          <Box className="w-3.5 h-3.5 text-[#34d399]" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-zinc-200">{data.label || '3D Generator'}</p>
          <p className="text-[9px] text-zinc-500">Text / Image → 3D</p>
        </div>
      </div>

      <div className="mb-2">
        <label className="text-[9px] text-zinc-500 uppercase tracking-wide mb-1 block">Model</label>
        <select value={model} onChange={e => setModel(e.target.value)}
          className="w-full bg-white/5 border border-white/8 rounded-lg px-2 py-1 text-[10px] text-zinc-300 outline-none">
          <option value="triposr">TripoSR · 15cr</option>
          <option value="hyper3d">Hyper3D Rodin · 25cr</option>
        </select>
      </div>

      <div className="mb-2">
        <label className="text-[9px] text-zinc-500 uppercase tracking-wide mb-1 block">Prompt</label>
        <input value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="a wooden chair..."
          className="w-full bg-white/5 border border-white/8 rounded-lg px-2 py-1 text-[10px] text-zinc-300 outline-none focus:border-white/20" />
      </div>
      <div className="mb-2.5">
        <label className="text-[9px] text-zinc-500 uppercase tracking-wide mb-1 block">Image URL (optional)</label>
        <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..."
          className="w-full bg-white/5 border border-white/8 rounded-lg px-2 py-1 text-[10px] text-zinc-300 outline-none focus:border-white/20" />
      </div>

      <button onClick={handleRun} disabled={loading}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-semibold bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/20 hover:bg-[#34d399]/20 transition-colors disabled:opacity-40">
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
        {loading ? 'Generating...' : 'Generate 3D'}
      </button>
      {error && <p className="text-[9px] text-red-400 mt-1.5 text-center">{error}</p>}
      {outputUrl && (
        <div className="mt-2 p-2 rounded-lg bg-white/5 border border-white/8">
          <p className="text-[9px] text-[#34d399] break-all">{outputUrl}</p>
          <a href={outputUrl} target="_blank" rel="noopener noreferrer"
            className="text-[9px] text-zinc-500 hover:text-white mt-1 block">Download model →</a>
        </div>
      )}
    </div>
  )
}

// ─── Audio Generation Node ────────────────────────────────────────────────────
export function AudioGenNodeContent({ data }: { data: NodeData; selected?: boolean }) {
  const [type, setType] = useState((data.config as any)?.type || 'stable-audio')
  const [prompt, setPrompt] = useState((data.config as any)?.prompt || '')
  const [style, setStyle] = useState((data.config as any)?.style || 'cinematic')
  const [duration, setDuration] = useState((data.config as any)?.duration || 30)
  const [outputUrl, setOutputUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRun = useCallback(async () => {
    if (!prompt) { setError('Prompt gerekli'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/generate/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, prompt, style, duration }),
      })
      const d = await res.json()
      if (d.error) throw new Error(d.error)
      setOutputUrl(d.audioUrl)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }, [type, prompt, style, duration])

  return (
    <div className="bg-[#0F051D]/95 border border-white/10 rounded-xl p-3 min-w-[220px] max-w-[260px]">
      <Handle type="target" position={Position.Left} id="text-in" style={{ background: '#a78bfa' }} />
      <Handle type="source" position={Position.Right} id="audio-out" style={{ background: '#f472b6' }} />

      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-7 h-7 rounded-lg bg-[#f472b6]/15 flex items-center justify-center">
          <Music className="w-3.5 h-3.5 text-[#f472b6]" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-zinc-200">{data.label || 'Audio Generator'}</p>
          <p className="text-[9px] text-zinc-500">AI Music & SFX</p>
        </div>
      </div>

      <div className="mb-2">
        <label className="text-[9px] text-zinc-500 uppercase tracking-wide mb-1 block">Engine</label>
        <select value={type} onChange={e => setType(e.target.value)}
          className="w-full bg-white/5 border border-white/8 rounded-lg px-2 py-1 text-[10px] text-zinc-300 outline-none">
          <option value="stable-audio">Stable Audio · 8cr</option>
          <option value="suno">Suno v4 · 12cr</option>
        </select>
      </div>

      <div className="mb-2">
        <label className="text-[9px] text-zinc-500 uppercase tracking-wide mb-1 block">Prompt</label>
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
          placeholder="upbeat cinematic soundtrack..." rows={2}
          className="w-full bg-white/5 border border-white/8 rounded-lg px-2 py-1.5 text-[10px] text-zinc-300 outline-none focus:border-white/20 resize-none" />
      </div>

      {type === 'suno' && (
        <div className="mb-2">
          <label className="text-[9px] text-zinc-500 uppercase tracking-wide mb-1 block">Style</label>
          <input value={style} onChange={e => setStyle(e.target.value)} placeholder="pop, cinematic, jazz..."
            className="w-full bg-white/5 border border-white/8 rounded-lg px-2 py-1 text-[10px] text-zinc-300 outline-none focus:border-white/20" />
        </div>
      )}

      <div className="mb-2.5">
        <label className="text-[9px] text-zinc-500 uppercase tracking-wide mb-1 block">Duration (s): {duration}</label>
        <input type="range" value={duration} onChange={e => setDuration(Number(e.target.value))}
          min={5} max={60} step={5}
          className="w-full accent-[#f472b6]" />
      </div>

      <button onClick={handleRun} disabled={loading}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-semibold bg-[#f472b6]/10 text-[#f472b6] border border-[#f472b6]/20 hover:bg-[#f472b6]/20 transition-colors disabled:opacity-40">
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
        {loading ? 'Generating...' : 'Generate Audio'}
      </button>
      {error && <p className="text-[9px] text-red-400 mt-1.5 text-center">{error}</p>}
      {outputUrl && (
        <div className="mt-2">
          <audio src={outputUrl} controls className="w-full h-8" />
        </div>
      )}
    </div>
  )
}

// ─── Voice Clone Node ─────────────────────────────────────────────────────────
export function VoiceCloneNodeContent({ data }: { data: NodeData; selected?: boolean }) {
  const [provider, setProvider] = useState((data.config as any)?.provider || 'fish-audio')
  const [text, setText] = useState((data.config as any)?.text || '')
  const [referenceAudioUrl, setReferenceAudioUrl] = useState((data.config as any)?.referenceAudioUrl || '')
  const [voiceId, setVoiceId] = useState((data.config as any)?.voiceId || '')
  const [outputUrl, setOutputUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRun = useCallback(async () => {
    if (!text) { setError('Text gerekli'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/generate/voice-clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, text, referenceAudioUrl, voiceId }),
      })
      const d = await res.json()
      if (d.error) throw new Error(d.error)
      setOutputUrl(d.audioUrl)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }, [provider, text, referenceAudioUrl, voiceId])

  return (
    <div className="bg-[#0F051D]/95 border border-white/10 rounded-xl p-3 min-w-[220px] max-w-[260px]">
      <Handle type="target" position={Position.Left} id="audio-in" style={{ background: '#f472b6', top: '35%' }} />
      <Handle type="target" position={Position.Left} id="text-in" style={{ background: '#a78bfa', top: '65%' }} />
      <Handle type="source" position={Position.Right} id="audio-out" style={{ background: '#f472b6' }} />

      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-7 h-7 rounded-lg bg-[#fb923c]/15 flex items-center justify-center">
          <Mic2 className="w-3.5 h-3.5 text-[#fb923c]" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-zinc-200">{data.label || 'Voice Clone'}</p>
          <p className="text-[9px] text-zinc-500">AI Voice Cloning</p>
        </div>
      </div>

      <div className="mb-2">
        <label className="text-[9px] text-zinc-500 uppercase tracking-wide mb-1 block">Provider</label>
        <select value={provider} onChange={e => setProvider(e.target.value)}
          className="w-full bg-white/5 border border-white/8 rounded-lg px-2 py-1 text-[10px] text-zinc-300 outline-none">
          <option value="fish-audio">Fish Audio · 5cr</option>
          <option value="elevenlabs">ElevenLabs · 6cr</option>
        </select>
      </div>

      <div className="mb-2">
        <label className="text-[9px] text-zinc-500 uppercase tracking-wide mb-1 block">Text to Speak</label>
        <textarea value={text} onChange={e => setText(e.target.value)}
          placeholder="Enter text to synthesize..." rows={2}
          className="w-full bg-white/5 border border-white/8 rounded-lg px-2 py-1.5 text-[10px] text-zinc-300 outline-none focus:border-white/20 resize-none" />
      </div>

      {provider === 'fish-audio' ? (
        <div className="mb-2.5">
          <label className="text-[9px] text-zinc-500 uppercase tracking-wide mb-1 block">Reference Audio URL</label>
          <input value={referenceAudioUrl} onChange={e => setReferenceAudioUrl(e.target.value)}
            placeholder="https://... (your voice sample)"
            className="w-full bg-white/5 border border-white/8 rounded-lg px-2 py-1 text-[10px] text-zinc-300 outline-none focus:border-white/20" />
        </div>
      ) : (
        <div className="mb-2.5">
          <label className="text-[9px] text-zinc-500 uppercase tracking-wide mb-1 block">Voice ID (optional)</label>
          <input value={voiceId} onChange={e => setVoiceId(e.target.value)}
            placeholder="ElevenLabs voice ID"
            className="w-full bg-white/5 border border-white/8 rounded-lg px-2 py-1 text-[10px] text-zinc-300 outline-none focus:border-white/20" />
        </div>
      )}

      <button onClick={handleRun} disabled={loading}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-semibold bg-[#fb923c]/10 text-[#fb923c] border border-[#fb923c]/20 hover:bg-[#fb923c]/20 transition-colors disabled:opacity-40">
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
        {loading ? 'Cloning...' : 'Clone Voice'}
      </button>
      {error && <p className="text-[9px] text-red-400 mt-1.5 text-center">{error}</p>}
      {outputUrl && (
        <div className="mt-2">
          <audio src={outputUrl} controls className="w-full h-8" />
        </div>
      )}
    </div>
  )
}
