'use client'

import { memo, useState, useCallback } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { Loader2, Check, X, Clock, Play, Download, ArrowLeftRight, Shuffle, Ruler, Layers, PenLine, SlidersHorizontal } from 'lucide-react'
import { useWorkspaceStore, type NodeData, type NodeStatus } from '@/lib/stores/workspace-store'
import { toast } from 'sonner'

// ── Node metadata per i2i type ────────────────────────────────────────────────
const I2I_META: Record<string, {
  icon: React.ReactNode
  label: string
  color: string
  hasPrompt: boolean
  promptRequired: boolean
  hasStrength: boolean
  hasNegative: boolean
  hasControlType: boolean
  i2iType: string
  creditCost: number
  hint: string
}> = {
  'flux-redux': {
    icon: <Shuffle className="w-3.5 h-3.5" />,
    label: 'Flux Dev Redux',
    color: '#f97316',
    hasPrompt: true, promptRequired: false,
    hasStrength: true, hasNegative: false, hasControlType: false,
    i2iType: 'flux-redux', creditCost: 8,
    hint: 'Görselin varyasyonlarını üretir',
  },
  'flux-canny': {
    icon: <Ruler className="w-3.5 h-3.5" />,
    label: 'Flux Canny Pro',
    color: '#06b6d4',
    hasPrompt: true, promptRequired: true,
    hasStrength: true, hasNegative: false, hasControlType: false,
    i2iType: 'flux-canny', creditCost: 12,
    hint: 'Kenar tespiti ile kontrollü üretim',
  },
  'flux-depth': {
    icon: <Layers className="w-3.5 h-3.5" />,
    label: 'Flux Depth Pro',
    color: '#8b5cf6',
    hasPrompt: true, promptRequired: true,
    hasStrength: true, hasNegative: false, hasControlType: false,
    i2iType: 'flux-depth', creditCost: 12,
    hint: 'Derinlik haritası ile kontrollü üretim',
  },
  'sd-img2img': {
    icon: <ArrowLeftRight className="w-3.5 h-3.5" />,
    label: 'SD img2img',
    color: '#10b981',
    hasPrompt: true, promptRequired: true,
    hasStrength: true, hasNegative: true, hasControlType: false,
    i2iType: 'sd-img2img', creditCost: 8,
    hint: 'Stable Diffusion görsel dönüşümü',
  },
  'sd-controlnets': {
    icon: <SlidersHorizontal className="w-3.5 h-3.5" />,
    label: 'SD ControlNets',
    color: '#e879f9',
    hasPrompt: true, promptRequired: true,
    hasStrength: true, hasNegative: false, hasControlType: true,
    i2iType: 'sd-controlnets', creditCost: 10,
    hint: 'SDXL ControlNet ile yapısal kontrol',
  },
  'sketch-to-image': {
    icon: <PenLine className="w-3.5 h-3.5" />,
    label: 'Sketch to Image',
    color: '#f59e0b',
    hasPrompt: true, promptRequired: true,
    hasStrength: true, hasNegative: false, hasControlType: false,
    i2iType: 'sketch-to-image', creditCost: 10,
    hint: 'Çizimden gerçekçi görsel üret',
  },
}

// ── Map node ID → i2iType ─────────────────────────────────────────────────────
export const NODE_ID_TO_I2I: Record<string, string> = {
  fluxDevReduxNode:        'flux-redux',
  fluxCannyProNode:        'flux-canny',
  fluxDepthProNode:        'flux-depth',
  img2ImgSdNode:           'sd-img2img',
  sdControlNetsNode:       'sd-controlnets',
  sketchToImageNode:       'sketch-to-image',
}

// ── Status icon ───────────────────────────────────────────────────────────────
function StatusIcon({ status }: { status: NodeStatus }) {
  if (status === 'processing') return <Loader2 className="w-3 h-3 text-[#0ea5e9] animate-spin" />
  if (status === 'ready')      return <Check className="w-3 h-3 text-[#D1FE17]" />
  if (status === 'failed')     return <X className="w-3 h-3 text-red-400" />
  return <Clock className="w-3 h-3 text-zinc-500" />
}

// ── Main Component ─────────────────────────────────────────────────────────────
export const ImageI2INodeContent = memo(function ImageI2INodeContent({ id, data }: NodeProps<NodeData>) {
  const { updateNodeConfig, updateNodeStatus, updateNodeOutput, updateNodeError } = useWorkspaceStore()
  const config = data.config as any

  // Determine i2iType from config or node type mapping
  // data.type is set by workspace as nodeDefId.replace('Node',''), e.g. 'fluxDevRedux'
  // id pattern: 'fluxDevReduxNode-...'
  const nodeDefId = id.replace(/-\d+.*$/, '') // e.g. 'fluxDevReduxNode'
  const i2iType: string = config?.i2iType || NODE_ID_TO_I2I[nodeDefId] || 'flux-redux'
  const meta = I2I_META[i2iType] || I2I_META['flux-redux']

  const [prompt, setPrompt] = useState<string>(config?.prompt || '')
  const [negativePrompt, setNegativePrompt] = useState<string>(config?.negativePrompt || '')
  const [strength, setStrength] = useState<number>(config?.strength ?? 0.75)
  const [controlType, setControlType] = useState<string>(config?.controlType || 'canny')
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
    if (meta.promptRequired && !prompt.trim()) {
      toast.error('Prompt gerekli')
      return
    }

    updateNodeStatus(id, 'processing')
    updateNodeConfig(id, { ...config, prompt, strength, negativePrompt, controlType, imageUrl: inputImageUrl })

    try {
      const res = await fetch('/api/generate/image-i2i', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          i2iType,
          imageUrl: inputImageUrl,
          prompt: prompt || undefined,
          strength,
          negativePrompt: negativePrompt || undefined,
          controlType,
        }),
      })
      const resData = await res.json()
      if (!res.ok || resData.error) throw new Error(resData.error || 'İşlem başarısız')
      updateNodeOutput(id, resData.imageUrl)
      toast.success(`${meta.label} tamamlandı · ${resData.creditsUsed} kredi`)
    } catch (err: any) {
      updateNodeError(id, err.message)
      toast.error(err.message)
    }
  }, [id, config, prompt, strength, negativePrompt, controlType, i2iType, meta, getUpstreamImage, updateNodeStatus, updateNodeConfig, updateNodeOutput, updateNodeError])

  return (
    <div
      className="min-w-[230px] max-w-[260px] rounded-xl bg-[#0F051D]/95 backdrop-blur-sm overflow-hidden"
      style={{
        border: `1px solid ${meta.color}40`,
        borderLeft: `3px solid ${meta.color}CC`,
        boxShadow: `0 0 16px ${meta.color}18`,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b border-white/8"
        style={{ background: `linear-gradient(135deg, ${meta.color}35 0%, ${meta.color}15 100%)` }}
      >
        <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: `${meta.color}30` }}>
          <span style={{ color: meta.color }}>{meta.icon}</span>
        </div>
        <span className="flex-1 text-[11px] font-semibold text-white truncate">{data.label || meta.label}</span>
        <StatusIcon status={data.status} />
      </div>

      <div className="px-3 py-2 space-y-2">
        {/* Input image preview or placeholder */}
        <div className="relative rounded-lg overflow-hidden bg-[#1a1025] border border-white/8 min-h-[72px] flex items-center justify-center">
          {data.outputUrl || config?.imageUrl ? (
            <>
              {showCompare && config?.imageUrl && data.outputUrl ? (
                <div className="flex w-full gap-px">
                  <div className="flex-1">
                    <img src={config.imageUrl} className="w-full h-20 object-cover" alt="input" />
                    <p className="text-[8px] text-center text-zinc-500 py-0.5">Input</p>
                  </div>
                  <div className="flex-1">
                    <img src={data.outputUrl} className="w-full h-20 object-cover" alt="output" />
                    <p className="text-[8px] text-center text-zinc-500 py-0.5">Output</p>
                  </div>
                </div>
              ) : (
                <img
                  src={data.outputUrl || config?.imageUrl}
                  className="w-full h-24 object-cover"
                  alt="preview"
                />
              )}
              {data.outputUrl && config?.imageUrl && (
                <button
                  onClick={() => setShowCompare(s => !s)}
                  className="absolute top-1 right-1 p-1 rounded bg-black/60 hover:bg-black/80 transition-colors"
                  title="Karşılaştır"
                >
                  <ArrowLeftRight className="w-3 h-3 text-zinc-300" />
                </button>
              )}
            </>
          ) : (
            <p className="text-[10px] text-zinc-600 text-center px-2">{meta.hint}</p>
          )}
        </div>

        {/* Prompt */}
        {meta.hasPrompt && (
          <textarea
            value={prompt}
            onChange={e => { setPrompt(e.target.value); updateNodeConfig(id, { ...config, prompt: e.target.value }) }}
            placeholder={meta.promptRequired ? 'Prompt zorunlu...' : 'Prompt (opsiyonel)...'}
            rows={2}
            className="w-full text-[11px] bg-white/5 border border-white/8 rounded-lg px-2 py-1.5 text-zinc-200 placeholder-zinc-600 resize-none outline-none focus:border-white/20 nodrag"
          />
        )}

        {/* Negative Prompt */}
        {meta.hasNegative && (
          <input
            type="text"
            value={negativePrompt}
            onChange={e => { setNegativePrompt(e.target.value); updateNodeConfig(id, { ...config, negativePrompt: e.target.value }) }}
            placeholder="Negative prompt..."
            className="w-full text-[11px] bg-white/5 border border-white/8 rounded-lg px-2 py-1 text-zinc-200 placeholder-zinc-600 outline-none focus:border-white/20 nodrag"
          />
        )}

        {/* Control Type (for SD ControlNets) */}
        {meta.hasControlType && (
          <select
            value={controlType}
            onChange={e => { setControlType(e.target.value); updateNodeConfig(id, { ...config, controlType: e.target.value }) }}
            className="w-full text-[10px] bg-white/5 border border-white/8 rounded-lg px-2 py-1 text-zinc-300 outline-none nodrag"
          >
            <option value="canny">Canny (Kenar)</option>
            <option value="depth">Depth (Derinlik)</option>
            <option value="pose">Pose (Poz)</option>
            <option value="scribble">Scribble (Çizim)</option>
          </select>
        )}

        {/* Strength Slider */}
        {meta.hasStrength && (
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-zinc-500 w-12 shrink-0">Güç {Math.round(strength * 100)}%</span>
            <input
              type="range"
              min="0.1" max="1.0" step="0.05"
              value={strength}
              onChange={e => { const v = parseFloat(e.target.value); setStrength(v); updateNodeConfig(id, { ...config, strength: v }) }}
              className="flex-1 h-1 nodrag accent-[var(--node-color)]"
              style={{ accentColor: meta.color }}
            />
          </div>
        )}

        {/* Actions */}
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
              className="p-1.5 rounded-lg bg-white/5 border border-white/8 text-zinc-400 hover:text-white transition-colors"
              title="İndir"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Credit cost badge */}
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-zinc-600">{meta.hint}</span>
          <span className="text-[9px] text-[#D1FE17]/50 font-mono">⚡ {meta.creditCost}cr</span>
        </div>

        {data.error && (
          <p className="text-[10px] text-red-400 bg-red-500/10 rounded px-2 py-1">{data.error}</p>
        )}
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="image-in"
        className="!w-3 !h-3 !border-2"
        style={{ background: meta.color, borderColor: '#0F051D' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="image-out"
        className="!w-3 !h-3 !border-2"
        style={{ background: meta.color, borderColor: '#0F051D' }}
      />
    </div>
  )
})
