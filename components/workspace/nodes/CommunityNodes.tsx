'use client'

import { memo, useState, useCallback } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { Loader2, Check, X, Clock, Play, Download, Globe } from 'lucide-react'
import { useWorkspaceStore, type NodeData, type NodeStatus } from '@/lib/stores/workspace-store'
import { toast } from 'sonner'

// ── Node type config (what inputs does each node need) ────────────────────────
type CommunityNodeType = 't2i' | 'i2i' | 'img-only' | 'face-swap' | 'i2v' | 'v2v' | 'vid-only' | 'client'

const NODE_TYPE_MAP: Record<string, { type: CommunityNodeType; color: string; creditCost: number }> = {
  // Text → Image
  dreamshaperNode:            { type: 't2i',       color: '#f97316', creditCost: 5 },
  dreamshaperV8Node:          { type: 't2i',       color: '#fb923c', creditCost: 5 },
  sdxlLightning4StepNode:     { type: 't2i',       color: '#fbbf24', creditCost: 3 },
  realisticVisionNode:        { type: 't2i',       color: '#84cc16', creditCost: 5 },
  sd3ExplorerNode:            { type: 't2i',       color: '#22d3ee', creditCost: 6 },
  dynavisionNode:             { type: 't2i',       color: '#a78bfa', creditCost: 4 },
  // Image + Prompt → Image
  sd3ControlNetsNode:         { type: 'i2i',       color: '#6366f1', creditCost: 10 },
  ipAdapterSdxlNode:          { type: 'i2i',       color: '#8b5cf6', creditCost: 10 },
  sdxlControlNetNode:         { type: 'i2i',       color: '#7c3aed', creditCost: 8  },
  controlLcmNode:             { type: 'i2i',       color: '#06b6d4', creditCost: 3  },
  sdxlConsistentCharNode:     { type: 'i2i',       color: '#0ea5e9', creditCost: 10 },
  sdxlMultiControlNetLoraNode:{ type: 'i2i',       color: '#2563eb', creditCost: 12 },
  xlabsFluxDevNode:           { type: 'i2i',       color: '#3b82f6', creditCost: 10 },
  fluxReduxControlNetNode:    { type: 'i2i',       color: '#f43f5e', creditCost: 12 },
  idPreservationFluxNode:     { type: 'i2i',       color: '#ec4899', creditCost: 12 },
  // Image → Image (no prompt)
  realEsrganUpscaleNode:      { type: 'img-only',  color: '#10b981', creditCost: 3  },
  recraftCreativeUpscaleNode: { type: 'img-only',  color: '#34d399', creditCost: 10 },
  clarityUpscaleNode:         { type: 'img-only',  color: '#6ee7b7', creditCost: 8  },
  ultimateSdUpscaleNode:      { type: 'img-only',  color: '#a7f3d0', creditCost: 8  },
  faceAlignNode:              { type: 'img-only',  color: '#fbbf24', creditCost: 3  },
  zDepthExtractorNode:        { type: 'img-only',  color: '#0ea5e9', creditCost: 3  },
  expressionEditorNode:       { type: 'img-only',  color: '#f472b6', creditCost: 10 },
  gfpganVideoNode:            { type: 'img-only',  color: '#34d399', creditCost: 8  },
  // Face Swap (image + image)
  faceSwapNode:               { type: 'face-swap', color: '#f43f5e', creditCost: 8  },
  // Image + Prompt → Video
  animatedDiffNode:           { type: 'i2v',       color: '#8b5cf6', creditCost: 10 },
  // Video → Video
  wan21WithLoraNode:          { type: 'i2v',       color: '#6366f1', creditCost: 20 },
  wan211Vid2VidNode:          { type: 'v2v',       color: '#7c3aed', creditCost: 15 },
  tooncrafterNode:            { type: 'v2v',       color: '#a78bfa', creditCost: 15 },
  robustVideoMattingNode:     { type: 'vid-only',  color: '#0ea5e9', creditCost: 8  },
  increaseFrameRateNode:      { type: 'vid-only',  color: '#22d3ee', creditCost: 8  },
  videoSmootherCommunityNode: { type: 'vid-only',  color: '#67e8f9', creditCost: 5  },
  klingLipSyncCommunityNode:  { type: 'v2v',       color: '#f97316', creditCost: 15 },
}

// ── Status icon ───────────────────────────────────────────────────────────────
function StatusIcon({ status }: { status: NodeStatus }) {
  if (status === 'processing') return <Loader2 className="w-3 h-3 text-[#0ea5e9] animate-spin" />
  if (status === 'ready')      return <Check className="w-3 h-3 text-[#D1FE17]" />
  if (status === 'failed')     return <X className="w-3 h-3 text-red-400" />
  return <Clock className="w-3 h-3 text-zinc-500" />
}

// ── Main Component ─────────────────────────────────────────────────────────────
export const CommunityNodeContent = memo(function CommunityNodeContent({ id, data }: NodeProps<NodeData>) {
  const { updateNodeConfig, updateNodeStatus, updateNodeOutput, updateNodeError } = useWorkspaceStore()
  const config = data.config as any

  const nodeDefId = id.replace(/-\d+.*$/, '')
  const nodeCfg = NODE_TYPE_MAP[nodeDefId] || { type: 't2i' as CommunityNodeType, color: '#6366f1', creditCost: 5 }
  const { type, color, creditCost } = nodeCfg

  const [prompt, setPrompt]       = useState<string>(config?.prompt || '')
  const [negPrompt, setNegPrompt] = useState<string>(config?.negativePrompt || '')
  const [strength, setStrength]   = useState<number>(config?.strength ?? 0.7)
  const [expression, setExpression] = useState<string>(config?.expression || 'smile')

  const needsPrompt  = ['t2i', 'i2i', 'i2v', 'v2v'].includes(type)
  const needsImage   = ['i2i', 'img-only', 'face-swap', 'i2v'].includes(type)
  const needsVideo   = ['v2v', 'vid-only'].includes(type)
  const needsSecondImage = type === 'face-swap'
  const hasStrength  = ['i2i'].includes(type)
  const isExpression = nodeDefId === 'expressionEditorNode'

  // Get upstream asset
  const getUpstream = useCallback((slot: 'first' | 'second' = 'first') => {
    const { nodes, edges } = useWorkspaceStore.getState()
    const upEdges = edges.filter(e => e.target === id)
    const edge = slot === 'first' ? upEdges[0] : upEdges[1]
    if (!edge) return null
    const upNode = nodes.find(n => n.id === edge.source)
    return upNode?.data.outputUrl || null
  }, [id])

  const handleExecute = useCallback(async () => {
    const firstUrl = getUpstream('first') || config?.imageUrl || config?.videoUrl
    const secondUrl = needsSecondImage ? (getUpstream('second') || config?.secondImageUrl) : undefined

    if ((needsImage || needsVideo) && !firstUrl) {
      toast.error(`Önce bir ${needsVideo ? 'video' : 'görsel'} bağlayın`)
      return
    }
    if (type === 't2i' && !prompt.trim()) {
      toast.error('Prompt gerekli')
      return
    }

    updateNodeStatus(id, 'processing')
    updateNodeConfig(id, { ...config, prompt, negativePrompt: negPrompt, strength, expression, imageUrl: firstUrl, secondImageUrl: secondUrl })

    try {
      const payload: Record<string, unknown> = {
        nodeId: nodeDefId,
        prompt: prompt || undefined,
        negativePrompt: negPrompt || undefined,
        strength,
        expression,
      }
      if (needsImage)  payload.imageUrl = firstUrl
      if (needsVideo)  payload.videoUrl = firstUrl
      if (needsSecondImage) payload.secondImageUrl = secondUrl

      const res = await fetch('/api/generate/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const resData = await res.json()
      if (!res.ok || resData.error) throw new Error(resData.error || 'İşlem başarısız')

      updateNodeOutput(id, resData.outputUrl)
      toast.success(`${data.label} tamamlandı · ${resData.creditsUsed} kredi`)

    } catch (err: any) {
      updateNodeError(id, err.message)
      toast.error(err.message)
    }
  }, [id, nodeDefId, type, needsImage, needsVideo, needsSecondImage, prompt, negPrompt, strength, expression, config, data.label, getUpstream, updateNodeStatus, updateNodeConfig, updateNodeOutput, updateNodeError])

  return (
    <div
      className="min-w-[220px] max-w-[260px] rounded-xl bg-[#0F051D]/95 overflow-hidden"
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
          <Globe className="w-3 h-3" style={{ color }} />
        </div>
        <span className="flex-1 text-[11px] font-semibold text-white truncate">{data.label}</span>
        <StatusIcon status={data.status} />
      </div>

      <div className="px-3 py-2 space-y-2">
        {/* Output / Input preview */}
        {(data.outputUrl || config?.imageUrl || config?.videoUrl) && (
          <div className="relative rounded-lg overflow-hidden bg-[#1a1025] border border-white/8">
            {data.outputUrl ? (
              needsVideo || type === 'v2v' || type === 'vid-only'
                ? <video src={data.outputUrl} className="w-full h-20 object-cover" />
                : <img src={data.outputUrl} className="w-full h-20 object-cover" alt="output" />
            ) : (
              <div className="h-12 flex items-center justify-center">
                <p className="text-[9px] text-zinc-600">Görsel/video bağlayın...</p>
              </div>
            )}
          </div>
        )}

        {/* Prompt */}
        {needsPrompt && (
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Prompt..."
            rows={2}
            className="w-full text-[11px] bg-white/5 border border-white/8 rounded-lg px-2 py-1.5 text-zinc-200 placeholder-zinc-600 resize-none outline-none focus:border-white/20 nodrag"
          />
        )}

        {/* Expression (for expression editor) */}
        {isExpression && (
          <select value={expression} onChange={e => setExpression(e.target.value)}
            className="w-full text-[10px] bg-white/5 border border-white/8 rounded-lg px-2 py-1 text-zinc-300 outline-none nodrag">
            <option value="smile">Gülümseme</option>
            <option value="surprise">Şaşkınlık</option>
            <option value="sad">Üzgün</option>
            <option value="angry">Öfkeli</option>
            <option value="wink">Göz kırpma</option>
          </select>
        )}

        {/* Strength slider for i2i */}
        {hasStrength && (
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-zinc-500 w-14 shrink-0">Güç {Math.round(strength * 100)}%</span>
            <input type="range" min="0.1" max="1.0" step="0.05" value={strength}
              onChange={e => setStrength(parseFloat(e.target.value))}
              className="flex-1 h-1 nodrag" style={{ accentColor: color }} />
          </div>
        )}

        {/* Execute */}
        <div className="flex gap-1.5">
          <button
            onClick={handleExecute}
            disabled={data.status === 'processing'}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all disabled:opacity-50"
            style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
          >
            {data.status === 'processing'
              ? <><Loader2 className="w-3 h-3 animate-spin" /> İşleniyor...</>
              : <><Play className="w-3 h-3" /> Çalıştır</>
            }
          </button>
          {data.outputUrl && (
            <a href={data.outputUrl} download
              className="p-1.5 rounded-lg bg-white/5 border border-white/8 text-zinc-400 hover:text-white transition-colors" title="İndir">
              <Download className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[8px] px-1 py-0.5 rounded bg-white/5 text-zinc-500 border border-white/8">community</span>
          <span className="text-[9px] text-[#D1FE17]/50 font-mono">⚡ {creditCost}cr</span>
        </div>

        {data.error && (
          <p className="text-[10px] text-red-400 bg-red-500/10 rounded px-2 py-1">{data.error}</p>
        )}
      </div>

      {/* Handles */}
      {(needsImage || needsVideo || needsSecondImage) && (
        <Handle type="target" position={Position.Left} id="in"
          className="!w-3 !h-3 !border-2" style={{ background: color, borderColor: '#0F051D' }} />
      )}
      {needsSecondImage && (
        <Handle type="target" position={Position.Left} id="in2"
          className="!w-3 !h-3 !border-2" style={{ background: color, borderColor: '#0F051D', top: '65%' }} />
      )}
      {type === 't2i' && (
        <Handle type="target" position={Position.Left} id="text-in"
          className="!w-3 !h-3 !border-2" style={{ background: color, borderColor: '#0F051D', opacity: 0 }} />
      )}
      <Handle type="source" position={Position.Right} id="out"
        className="!w-3 !h-3 !border-2" style={{ background: color, borderColor: '#0F051D' }} />
    </div>
  )
})
