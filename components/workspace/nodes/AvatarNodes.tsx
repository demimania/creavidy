'use client'

import { memo, useState, useCallback, useRef } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import {
  Loader2, Play, Download, Upload, Check, X, Clock,
  User, Mic, FileText, ChevronDown,
} from 'lucide-react'
import { useWorkspaceStore, type NodeData, type NodeStatus } from '@/lib/stores/workspace-store'
import { toast } from 'sonner'

// ── Node config per ID ────────────────────────────────────────────────────────
type AvatarProvider = 'heygen' | 'hedra' | 'runway'
type AvatarInputMode = 'photo+script' | 'script-only' | 'photo+audio' | 'photo+script+audio'

const AVATAR_NODE_MAP: Record<string, {
  provider: AvatarProvider
  color: string
  creditCost: number
  inputMode: AvatarInputMode
  description: string
}> = {
  heygenTalkingPhotoNode: {
    provider: 'heygen', color: '#3b82f6', creditCost: 20,
    inputMode: 'photo+script',
    description: 'Fotoğraftan konuşan avatar',
  },
  heygenVideoAvatarNode: {
    provider: 'heygen', color: '#60a5fa', creditCost: 30,
    inputMode: 'script-only',
    description: 'Hazır avatar + script',
  },
  hedraCharacterNode: {
    provider: 'hedra', color: '#a855f7', creditCost: 25,
    inputMode: 'photo+audio',
    description: 'Görsel + ses → karakter',
  },
  hedraLipSyncNode: {
    provider: 'hedra', color: '#c084fc', creditCost: 20,
    inputMode: 'photo+script',
    description: 'Fotoğraf + metin lip sync',
  },
  runwayActTwoAvatarNode: {
    provider: 'runway', color: '#f43f5e', creditCost: 35,
    inputMode: 'photo+audio',
    description: 'Portre + ses → animasyon',
  },
  runwayAvatarPortraitNode: {
    provider: 'runway', color: '#fb7185', creditCost: 30,
    inputMode: 'photo+script',
    description: 'Portre + prompt → avatar video',
  },
}

const PROVIDER_LABELS: Record<AvatarProvider, string> = {
  heygen: 'HeyGen',
  hedra: 'Hedra',
  runway: 'Runway',
}

const PROVIDER_BADGE_COLORS: Record<AvatarProvider, string> = {
  heygen: '#3b82f6',
  hedra: '#a855f7',
  runway: '#f43f5e',
}

// ── HeyGen preset avatars (sample list) ──────────────────────────────────────
const HEYGEN_PRESET_AVATARS = [
  { id: 'Angela-inblackskirt-20220820', label: 'Angela' },
  { id: 'Daisy-inskirt-20220818', label: 'Daisy' },
  { id: 'Tyler-incasualsuit-20220722', label: 'Tyler' },
  { id: 'Lina-in-brown-dress', label: 'Lina' },
  { id: 'Anna-in-beige-dress', label: 'Anna' },
  { id: 'Daniel-in-blue-shirt', label: 'Daniel' },
]

const HEYGEN_VOICES = [
  { id: '2d5b0e6cf36f460aa7fc47e3eee4ba54', label: 'Sarah (Female EN)' },
  { id: '077ab11b14f04ce0b49b5f6e5cc20979', label: 'Michael (Male EN)' },
  { id: '64135dbc72f340fe9a3428bb5e16a19e', label: 'Emma (Female EN)' },
  { id: 'b2d5b0e6cf36f460aa7fc47e3eee4ba5', label: 'Adam (Male EN)' },
]

// ── Status icon ───────────────────────────────────────────────────────────────
function StatusIcon({ status }: { status: NodeStatus }) {
  if (status === 'processing') return <Loader2 className="w-3 h-3 text-[#0ea5e9] animate-spin" />
  if (status === 'ready')      return <Check className="w-3 h-3 text-[#D1FE17]" />
  if (status === 'failed')     return <X className="w-3 h-3 text-red-400" />
  return <Clock className="w-3 h-3 text-zinc-500" />
}

// ── File upload helper ────────────────────────────────────────────────────────
function UploadButton({
  label, accept, onUpload, currentUrl, color,
}: {
  label: string
  accept: string
  onUpload: (url: string) => void
  currentUrl?: string
  color: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const d = await res.json()
      if (d.url) { onUpload(d.url); toast.success(`${label} yüklendi`) }
      else throw new Error(d.error || 'Yükleme başarısız')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleFile} />
      <button
        onClick={() => inputRef.current?.click()}
        className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] transition-colors nodrag"
        style={{
          background: currentUrl ? `${color}15` : 'rgba(255,255,255,0.04)',
          border: `1px solid ${currentUrl ? color + '40' : 'rgba(255,255,255,0.08)'}`,
          color: currentUrl ? '#d4d4d8' : '#71717a',
        }}
      >
        {uploading
          ? <Loader2 className="w-3 h-3 animate-spin" />
          : currentUrl
            ? <Check className="w-3 h-3" style={{ color }} />
            : <Upload className="w-3 h-3" />
        }
        <span className="truncate flex-1 text-left">
          {uploading ? 'Yükleniyor...' : currentUrl ? label + ' ✓' : label + ' yükle'}
        </span>
      </button>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export const AvatarNodeContent = memo(function AvatarNodeContent({ id, data }: NodeProps<NodeData>) {
  const { updateNodeConfig, updateNodeStatus, updateNodeOutput, updateNodeError } = useWorkspaceStore()
  const config = data.config as any

  const nodeDefId = id.replace(/-\d+.*$/, '')
  const nodeCfg = AVATAR_NODE_MAP[nodeDefId] || AVATAR_NODE_MAP.heygenTalkingPhotoNode
  const { provider, color, creditCost, inputMode } = nodeCfg

  // Form state
  const [script, setScript]           = useState<string>(config?.script || '')
  const [portraitUrl, setPortraitUrl] = useState<string>(config?.portraitUrl || '')
  const [audioUrl, setAudioUrl]       = useState<string>(config?.audioUrl || '')
  const [avatarId, setAvatarId]       = useState<string>(config?.avatarId || HEYGEN_PRESET_AVATARS[0].id)
  const [voiceId, setVoiceId]         = useState<string>(config?.voiceId || HEYGEN_VOICES[0].id)
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [pollTimer, setPollTimer]     = useState<ReturnType<typeof setInterval> | null>(null)

  const needsPortrait = inputMode !== 'script-only'
  const needsAudio    = inputMode === 'photo+audio' || inputMode === 'photo+script+audio'
  const needsScript   = inputMode !== 'photo+audio'

  // ── Polling helper for async job IDs ─────────────────────────────────────
  const startPolling = useCallback((jobId: string, endpoint: string) => {
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}?endpoint=${encodeURIComponent(endpoint)}`)
        const d = await res.json()
        if (d.status === 'completed') {
          clearInterval(timer)
          updateNodeOutput(id, d.outputUrl)
          toast.success(`${data.label} hazır · ${creditCost} kredi`)
        } else if (d.status === 'failed') {
          clearInterval(timer)
          updateNodeError(id, d.error || 'İşlem başarısız')
          toast.error(d.error || 'Avatar üretimi başarısız')
        }
      } catch {
        // network hiccup — keep polling
      }
    }, 3000)
    setPollTimer(timer)
  }, [id, data.label, creditCost, updateNodeOutput, updateNodeError])

  // ── Execute ───────────────────────────────────────────────────────────────
  const handleExecute = useCallback(async () => {
    if (needsPortrait && !portraitUrl) { toast.error('Portre fotoğrafı gerekli'); return }
    if (needsScript && !script.trim()) { toast.error('Script metni gerekli'); return }
    if (needsAudio && !audioUrl)       { toast.error('Ses dosyası gerekli'); return }

    if (pollTimer) clearInterval(pollTimer)
    updateNodeStatus(id, 'processing')
    updateNodeConfig(id, { ...config, script, portraitUrl, audioUrl, avatarId, voiceId })

    try {
      const res = await fetch('/api/generate/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeId: nodeDefId,
          provider,
          script: script || undefined,
          portraitUrl: portraitUrl || undefined,
          audioUrl: audioUrl || undefined,
          avatarId: provider === 'heygen' ? avatarId : undefined,
          voiceId:  provider === 'heygen' ? voiceId : undefined,
        }),
      })
      const d = await res.json()
      if (!res.ok || d.error) throw new Error(d.error || 'API hatası')

      if (d.mode === 'async' && d.jobId) {
        // Async: start polling
        startPolling(d.jobId, d.endpoint || '')
      } else if (d.outputUrl) {
        updateNodeOutput(id, d.outputUrl)
        toast.success(`${data.label} tamamlandı · ${d.creditsUsed ?? creditCost} kredi`)
      }
    } catch (err: any) {
      updateNodeError(id, err.message)
      toast.error(err.message)
    }
  }, [
    id, nodeDefId, provider, creditCost, inputMode,
    needsPortrait, needsScript, needsAudio,
    script, portraitUrl, audioUrl, avatarId, voiceId,
    config, data.label, pollTimer,
    updateNodeStatus, updateNodeConfig, updateNodeOutput, updateNodeError,
    startPolling,
  ])

  const providerLabel = PROVIDER_LABELS[provider]
  const providerColor = PROVIDER_BADGE_COLORS[provider]

  return (
    <div
      className="min-w-[230px] max-w-[270px] rounded-xl bg-[#0F051D]/95 overflow-hidden"
      style={{
        border: `1px solid ${color}40`,
        borderLeft: `3px solid ${color}CC`,
        boxShadow: `0 0 16px ${color}18`,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b border-white/8"
        style={{ background: `linear-gradient(135deg, ${color}35 0%, ${color}15 100%)` }}
      >
        <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: `${color}30` }}>
          <User className="w-3 h-3" style={{ color }} />
        </div>
        <span className="flex-1 text-[11px] font-semibold text-white truncate">{data.label}</span>
        <StatusIcon status={data.status} />
      </div>

      <div className="px-3 py-2.5 space-y-2">

        {/* Provider badge */}
        <div className="flex items-center gap-1.5">
          <span
            className="text-[8px] px-1.5 py-0.5 rounded font-bold tracking-wide"
            style={{ background: `${providerColor}20`, color: providerColor, border: `1px solid ${providerColor}30` }}
          >
            {providerLabel.toUpperCase()}
          </span>
          <span className="text-[9px] text-zinc-600">{nodeCfg.description}</span>
        </div>

        {/* Output / input preview */}
        {data.outputUrl ? (
          <div className="relative rounded-lg overflow-hidden bg-[#1a1025] border border-white/8 group">
            <video src={data.outputUrl} className="w-full h-24 object-cover" controls />
            <a
              href={data.outputUrl} download
              className="absolute top-1 right-1 p-1 rounded bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Download className="w-3 h-3 text-white" />
            </a>
          </div>
        ) : (
          <div className="h-10 rounded-lg bg-[#1a1025] border border-white/8 flex items-center justify-center">
            <p className="text-[9px] text-zinc-600">Avatar video çıkışı</p>
          </div>
        )}

        {/* Portrait upload */}
        {needsPortrait && (
          <UploadButton
            label="Portre fotoğrafı"
            accept="image/*"
            currentUrl={portraitUrl}
            onUpload={setPortraitUrl}
            color={color}
          />
        )}

        {/* Audio upload */}
        {needsAudio && (
          <UploadButton
            label="Ses dosyası"
            accept="audio/*"
            currentUrl={audioUrl}
            onUpload={setAudioUrl}
            color={color}
          />
        )}

        {/* Script textarea */}
        {needsScript && (
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <FileText className="w-2.5 h-2.5 text-zinc-600" />
              <span className="text-[9px] text-zinc-500">Script</span>
            </div>
            <textarea
              value={script}
              onChange={e => setScript(e.target.value)}
              placeholder="Avatar'ın okumasını istediğiniz metni yazın..."
              rows={3}
              className="w-full text-[10px] bg-white/5 border border-white/8 rounded-lg px-2 py-1.5 text-zinc-200 placeholder-zinc-600 resize-none outline-none focus:border-white/20 nodrag"
            />
          </div>
        )}

        {/* HeyGen avatar selector */}
        {provider === 'heygen' && inputMode === 'script-only' && (
          <div className="space-y-1">
            <span className="text-[9px] text-zinc-500">Avatar seç</span>
            <div className="relative">
              <button
                onClick={() => setShowAvatarPicker(v => !v)}
                className="w-full flex items-center justify-between px-2 py-1.5 bg-white/5 border border-white/8 rounded-lg nodrag"
              >
                <span className="text-[10px] text-zinc-300">
                  {HEYGEN_PRESET_AVATARS.find(a => a.id === avatarId)?.label || 'Seçin'}
                </span>
                <ChevronDown className="w-3 h-3 text-zinc-600" />
              </button>
              {showAvatarPicker && (
                <div className="absolute top-full left-0 right-0 mt-0.5 z-50 bg-[#0F051D] border border-white/10 rounded-lg overflow-hidden shadow-xl">
                  {HEYGEN_PRESET_AVATARS.map(a => (
                    <button
                      key={a.id}
                      onClick={() => { setAvatarId(a.id); setShowAvatarPicker(false) }}
                      className={`w-full px-2.5 py-1.5 text-left text-[10px] hover:bg-white/5 transition-colors ${avatarId === a.id ? 'text-white bg-white/8' : 'text-zinc-400'}`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* HeyGen voice selector */}
        {provider === 'heygen' && (
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Mic className="w-2.5 h-2.5 text-zinc-600" />
              <span className="text-[9px] text-zinc-500">Ses (Voice)</span>
            </div>
            <select
              value={voiceId}
              onChange={e => setVoiceId(e.target.value)}
              className="w-full text-[10px] bg-white/5 border border-white/8 rounded-lg px-2 py-1 text-zinc-300 outline-none nodrag"
            >
              {HEYGEN_VOICES.map(v => (
                <option key={v.id} value={v.id}>{v.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Processing indicator */}
        {data.status === 'processing' && (
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[#0ea5e9]/10 border border-[#0ea5e9]/20">
            <Loader2 className="w-3 h-3 text-[#0ea5e9] animate-spin shrink-0" />
            <span className="text-[9px] text-[#0ea5e9]">Avatar üretiliyor, lütfen bekleyin...</span>
          </div>
        )}

        {/* Execute button */}
        <button
          onClick={handleExecute}
          disabled={data.status === 'processing'}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all disabled:opacity-50"
          style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
        >
          {data.status === 'processing'
            ? <><Loader2 className="w-3 h-3 animate-spin" /> Üretiliyor...</>
            : <><Play className="w-3 h-3" /> Üret</>
          }
        </button>

        {/* Footer info */}
        <div className="flex items-center justify-between">
          <span
            className="text-[8px] px-1.5 py-0.5 rounded font-medium"
            style={{ background: `${providerColor}15`, color: providerColor, border: `1px solid ${providerColor}25` }}
          >
            ai-avatar
          </span>
          <span className="text-[9px] text-[#D1FE17]/50 font-mono">⚡ {creditCost}cr</span>
        </div>

        {/* Error */}
        {data.error && (
          <p className="text-[10px] text-red-400 bg-red-500/10 rounded px-2 py-1">{data.error}</p>
        )}
      </div>

      {/* Handles */}
      {needsPortrait && (
        <Handle type="target" position={Position.Left} id="portrait-in"
          className="!w-3 !h-3 !border-2"
          style={{ background: color, borderColor: '#0F051D', top: '35%' }} />
      )}
      {needsAudio && (
        <Handle type="target" position={Position.Left} id="audio-in"
          className="!w-3 !h-3 !border-2"
          style={{ background: '#ec4899', borderColor: '#0F051D', top: '65%' }} />
      )}
      {needsScript && !needsPortrait && (
        <Handle type="target" position={Position.Left} id="script-in"
          className="!w-3 !h-3 !border-2"
          style={{ background: '#a78bfa', borderColor: '#0F051D', opacity: 0 }} />
      )}
      <Handle type="source" position={Position.Right} id="video-out"
        className="!w-3 !h-3 !border-2"
        style={{ background: color, borderColor: '#0F051D' }} />
    </div>
  )
})
