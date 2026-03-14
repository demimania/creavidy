'use client'

import { memo, useState, useCallback } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { motion } from 'framer-motion'
import { Loader2, Check, X, Clock, Play, Download, ArrowLeftRight, Wand2, Scissors, ZoomIn, Paintbrush } from 'lucide-react'
import { useWorkspaceStore, type NodeData, type NodeStatus } from '@/lib/stores/workspace-store'
import { toast } from 'sonner'

// ── Generic "Soon" node for unimplemented types ──────────────────────────────
export const SoonNodeContent = memo(function SoonNodeContent({ data }: NodeProps<NodeData>) {
  return (
    <div className="min-w-[200px] rounded-xl border border-white/10 bg-[#1a0d2e]/80 backdrop-blur-sm overflow-hidden opacity-60">
      <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border-b border-white/10">
        <span className="text-sm">🔧</span>
        <span className="text-xs font-semibold text-zinc-300 flex-1 truncate">{data.label}</span>
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-400 font-bold">SOON</span>
      </div>
      <div className="px-3 py-3 text-center">
        <p className="text-[10px] text-zinc-500">Bu node yakında aktif olacak</p>
      </div>
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-zinc-600 !border-zinc-500" />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-zinc-600 !border-zinc-500" />
    </div>
  )
})

// ── Icon & label per edit type ────────────────────────────────────────────────
const EDIT_META: Record<string, { icon: React.ReactNode; label: string; color: string; hasPrompt: boolean; hasMask: boolean }> = {
  kontext:    { icon: <Wand2 className="w-3.5 h-3.5" />,    label: 'Flux Kontext',   color: '#f43f5e', hasPrompt: true,  hasMask: false },
  'remove-bg':{ icon: <Scissors className="w-3.5 h-3.5" />,  label: 'Remove BG',     color: '#10b981', hasPrompt: false, hasMask: false },
  upscale:    { icon: <ZoomIn className="w-3.5 h-3.5" />,    label: 'Upscale',       color: '#0ea5e9', hasPrompt: false, hasMask: false },
  inpaint:    { icon: <Paintbrush className="w-3.5 h-3.5" />, label: 'Inpaint',      color: '#a78bfa', hasPrompt: true,  hasMask: true  },
}

// ── Status icon ───────────────────────────────────────────────────────────────
function StatusIcon({ status }: { status: NodeStatus }) {
  if (status === 'processing') return <Loader2 className="w-3 h-3 text-[#0ea5e9] animate-spin" />
  if (status === 'ready')      return <Check className="w-3 h-3 text-[#D1FE17]" />
  if (status === 'failed')     return <X className="w-3 h-3 text-red-400" />
  return <Clock className="w-3 h-3 text-zinc-500" />
}

// ── Image Edit Node ───────────────────────────────────────────────────────────
export const ImageEditNodeContent = memo(function ImageEditNodeContent({ id, data }: NodeProps<NodeData>) {
  const { updateNodeConfig, updateNodeStatus, updateNodeOutput, updateNodeError } = useWorkspaceStore()
  const config = data.config as any
  const editType: string = config?.editType || 'kontext'
  const meta = EDIT_META[editType] || EDIT_META.kontext

  const [prompt, setPrompt] = useState<string>(config?.prompt || '')
  const [showCompare, setShowCompare] = useState(false)

  // Get upstream image from connected nodes
  const getUpstreamImage = useCallback(() => {
    const { nodes, edges } = useWorkspaceStore.getState()
    const upEdge = edges.find(e => e.target === id)
    if (!upEdge) return null
    const upNode = nodes.find(n => n.id === upEdge.source)
    return upNode?.data.outputUrl || null
  }, [id])

  const handleExecute = useCallback(async () => {
    const inputImageUrl = getUpstreamImage() || config?.imageUrl
    if (!inputImageUrl) {
      toast.error('Önce bir görsel bağlayın (sol port)')
      return
    }

    updateNodeStatus(id, 'processing')
    updateNodeConfig(id, { ...config, prompt, imageUrl: inputImageUrl })

    try {
      const res = await fetch('/api/generate/image-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          editType,
          imageUrl: inputImageUrl,
          prompt: prompt || undefined,
          maskUrl: config?.maskUrl || undefined,
          scale: config?.scale || 2,
        }),
      })
      const data2 = await res.json()
      if (!res.ok || data2.error) throw new Error(data2.error || 'Edit failed')
      updateNodeOutput(id, data2.imageUrl)
      toast.success(`${meta.label} tamamlandı · ${data2.creditsUsed} kredi`)
    } catch (err: any) {
      updateNodeError(id, err.message)
      toast.error(err.message)
    }
  }, [id, config, prompt, editType, meta.label, getUpstreamImage, updateNodeStatus, updateNodeConfig, updateNodeOutput, updateNodeError])

  return (
    <div className="min-w-[220px] rounded-xl border border-white/10 bg-[#1a0d2e]/90 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b border-white/10"
        style={{ background: `${meta.color}18` }}
      >
        <span style={{ color: meta.color }}>{meta.icon}</span>
        <span className="text-xs font-semibold text-zinc-200 flex-1">{data.label || meta.label}</span>
        <StatusIcon status={data.status} />
      </div>

      {/* Preview area */}
      <div className="px-3 py-2 space-y-2">
        {(data.outputUrl || config?.imageUrl) && (
          <div className="relative rounded-lg overflow-hidden bg-black/30">
            {showCompare && config?.imageUrl ? (
              <div className="flex gap-0.5">
                <div className="flex-1">
                  <img src={config.imageUrl} className="w-full h-20 object-cover" alt="before" />
                  <p className="text-[9px] text-center text-zinc-500 py-0.5">Before</p>
                </div>
                <div className="flex-1">
                  <img src={data.outputUrl} className="w-full h-20 object-cover" alt="after" />
                  <p className="text-[9px] text-center text-zinc-500 py-0.5">After</p>
                </div>
              </div>
            ) : (
              <img
                src={data.outputUrl || config?.imageUrl}
                className="w-full h-28 object-cover"
                alt="result"
              />
            )}
            {data.outputUrl && config?.imageUrl && (
              <button
                onClick={() => setShowCompare(s => !s)}
                className="absolute top-1 right-1 p-1 rounded bg-black/60 hover:bg-black/80 transition-colors"
                title="Compare before/after"
              >
                <ArrowLeftRight className="w-3 h-3 text-zinc-300" />
              </button>
            )}
          </div>
        )}

        {/* Prompt input (for kontext / inpaint) */}
        {meta.hasPrompt && (
          <textarea
            value={prompt}
            onChange={e => {
              setPrompt(e.target.value)
              updateNodeConfig(id, { ...config, prompt: e.target.value })
            }}
            placeholder="Düzenleme talimatı..."
            rows={2}
            className="w-full text-[11px] bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-zinc-200 placeholder-zinc-500 resize-none outline-none focus:border-white/20 nodrag"
          />
        )}

        {/* Execute + Download */}
        <div className="flex gap-1.5">
          <button
            onClick={handleExecute}
            disabled={data.status === 'processing'}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all disabled:opacity-50"
            style={{ background: `${meta.color}20`, color: meta.color, border: `1px solid ${meta.color}40` }}
          >
            {data.status === 'processing'
              ? <><Loader2 className="w-3 h-3 animate-spin" /> İşleniyor...</>
              : <><Play className="w-3 h-3" /> Çalıştır</>
            }
          </button>
          {data.outputUrl && (
            <a
              href={data.outputUrl}
              download
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-colors"
              title="İndir"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {data.error && (
          <p className="text-[10px] text-red-400 bg-red-500/10 rounded px-2 py-1">{data.error}</p>
        )}
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !border-2"
        style={{ background: '#FFE744', borderColor: '#1a0d2e' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !border-2"
        style={{ background: '#FFE744', borderColor: '#1a0d2e' }}
      />
    </div>
  )
})
