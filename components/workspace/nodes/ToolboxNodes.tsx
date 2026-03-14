'use client'

import { memo, useState, useCallback } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import {
  Loader2, Check, X, Clock, Play, Download,
  Sliders, Crop, Maximize2, Droplets, FlipHorizontal2,
  Layers, Film, Scissors, Search, AlignJustify, Video, ArrowUpDown
} from 'lucide-react'
import { useWorkspaceStore, type NodeData, type NodeStatus } from '@/lib/stores/workspace-store'
import { toast } from 'sonner'

// ── Status icon ───────────────────────────────────────────────────────────────
function StatusIcon({ status }: { status: NodeStatus }) {
  if (status === 'processing') return <Loader2 className="w-3 h-3 text-[#0ea5e9] animate-spin" />
  if (status === 'ready')      return <Check className="w-3 h-3 text-[#D1FE17]" />
  if (status === 'failed')     return <X className="w-3 h-3 text-red-400" />
  return <Clock className="w-3 h-3 text-zinc-500" />
}

// ── Toolbox meta definitions ──────────────────────────────────────────────────
const TOOLBOX_META: Record<string, {
  label: string
  icon: React.ReactNode
  color: string
  category: 'editing' | 'matte'
  isAI: boolean
  creditCost: number
  hint: string
}> = {
  levels:         { label: 'Levels',         icon: <Sliders className="w-3.5 h-3.5" />,         color: '#6366f1', category: 'editing', isAI: false, creditCost: 0,  hint: 'Parlaklık · Kontrast · Gamma' },
  crop:           { label: 'Crop',           icon: <Crop className="w-3.5 h-3.5" />,             color: '#f97316', category: 'editing', isAI: false, creditCost: 0,  hint: 'Görsel kırpma' },
  resize:         { label: 'Resize',         icon: <Maximize2 className="w-3.5 h-3.5" />,        color: '#10b981', category: 'editing', isAI: false, creditCost: 0,  hint: 'Boyut değiştirme' },
  blur:           { label: 'Blur',           icon: <Droplets className="w-3.5 h-3.5" />,         color: '#0ea5e9', category: 'editing', isAI: false, creditCost: 0,  hint: 'Gaussian bulanıklaştırma' },
  invert:         { label: 'Invert',         icon: <FlipHorizontal2 className="w-3.5 h-3.5" />,  color: '#a78bfa', category: 'editing', isAI: false, creditCost: 0,  hint: 'Renk tersine çevirme' },
  channels:       { label: 'Channels',       icon: <Layers className="w-3.5 h-3.5" />,           color: '#f472b6', category: 'editing', isAI: false, creditCost: 0,  hint: 'RGB / Alpha kanal izolasyonu' },
  compositor:     { label: 'Compositor',     icon: <Film className="w-3.5 h-3.5" />,             color: '#e879f9', category: 'editing', isAI: false, creditCost: 0,  hint: 'Katmanları birleştir' },
  extractFrame:   { label: 'Extract Frame',  icon: <Scissors className="w-3.5 h-3.5" />,         color: '#fbbf24', category: 'editing', isAI: false, creditCost: 0,  hint: 'Videodan kare çıkarma' },
  maskExtractor:  { label: 'Mask Extractor', icon: <Search className="w-3.5 h-3.5" />,           color: '#8b5cf6', category: 'matte',   isAI: true,  creditCost: 6,  hint: 'Otomatik nesne maskesi (BiRefNet)' },
  maskByText:     { label: 'Mask by Text',   icon: <AlignJustify className="w-3.5 h-3.5" />,     color: '#a78bfa', category: 'matte',   isAI: true,  creditCost: 8,  hint: 'Metin prompt ile maske (SAM2)' },
  matteGrowShrink:{ label: 'Grow/Shrink',    icon: <ArrowUpDown className="w-3.5 h-3.5" />,      color: '#6366f1', category: 'matte',   isAI: false, creditCost: 0,  hint: 'Maske kenar genişlet / daralt' },
  mergeAlpha:     { label: 'Merge Alpha',    icon: <Layers className="w-3.5 h-3.5" />,           color: '#8b5cf6', category: 'matte',   isAI: false, creditCost: 0,  hint: 'Maske → Alfa kanalına uygula' },
  videoMatte:     { label: 'Video Matte',    icon: <Video className="w-3.5 h-3.5" />,            color: '#6366f1', category: 'matte',   isAI: true,  creditCost: 12, hint: 'Video için maske çıkarma (BiRefNet)' },
}

// ── Map node ID → toolbox type ────────────────────────────────────────────────
export const NODE_ID_TO_TOOLBOX: Record<string, string> = {
  levelsNode:           'levels',
  cropNode:             'crop',
  resizeNode:           'resize',
  blurNode:             'blur',
  invertNode:           'invert',
  channelsNode:         'channels',
  compositorNode:       'compositor',
  extractVideoFrameNode:'extractFrame',
  maskExtractorNode:    'maskExtractor',
  maskByTextNode:       'maskByText',
  matteGrowShrinkNode:  'matteGrowShrink',
  mergeAlphaNode:       'mergeAlpha',
  videoMatteNode:       'videoMatte',
}

// ── Generic toolbox node component ───────────────────────────────────────────
export const ToolboxNodeContent = memo(function ToolboxNodeContent({ id, data }: NodeProps<NodeData>) {
  const { updateNodeConfig, updateNodeStatus, updateNodeOutput, updateNodeError } = useWorkspaceStore()
  const config = data.config as any

  const nodeDefId = id.replace(/-\d+.*$/, '')
  const toolboxType: string = config?.toolboxType || NODE_ID_TO_TOOLBOX[nodeDefId] || 'levels'
  const meta = TOOLBOX_META[toolboxType] || TOOLBOX_META.levels

  // Params state
  const [brightness, setBrightness] = useState<number>(config?.brightness ?? 0)
  const [contrast, setContrast]     = useState<number>(config?.contrast ?? 0)
  const [gamma, setGamma]           = useState<number>(config?.gamma ?? 1)
  const [cropX, setCropX]           = useState<number>(config?.cropX ?? 0)
  const [cropY, setCropY]           = useState<number>(config?.cropY ?? 0)
  const [cropW, setCropW]           = useState<number>(config?.cropW ?? 512)
  const [cropH, setCropH]           = useState<number>(config?.cropH ?? 512)
  const [resizeW, setResizeW]       = useState<number>(config?.resizeW ?? 1024)
  const [resizeH, setResizeH]       = useState<number>(config?.resizeH ?? 1024)
  const [blurRadius, setBlurRadius] = useState<number>(config?.blurRadius ?? 4)
  const [channel, setChannel]       = useState<string>(config?.channel ?? 'rgb')
  const [blendMode, setBlendMode]   = useState<string>(config?.blendMode ?? 'source-over')
  const [timestamp, setTimestamp]   = useState<number>(config?.timestamp ?? 0)
  const [textPrompt, setTextPrompt] = useState<string>(config?.textPrompt ?? '')
  const [growAmount, setGrowAmount] = useState<number>(config?.growAmount ?? 5)

  // Get upstream image/video
  const getUpstreamAsset = useCallback((type: 'image' | 'video' | 'mask' | 'any' = 'any') => {
    const { nodes, edges } = useWorkspaceStore.getState()
    const upEdges = edges.filter(e => e.target === id)
    for (const edge of upEdges) {
      const upNode = nodes.find(n => n.id === edge.source)
      if (upNode?.data.outputUrl) return upNode.data.outputUrl
    }
    return config?.imageUrl || config?.videoUrl || config?.maskUrl || null
  }, [id, config])

  const handleExecute = useCallback(async () => {
    const inputUrl = getUpstreamAsset()
    if (!inputUrl) {
      toast.error('Önce bir görsel/video bağlayın')
      return
    }

    updateNodeStatus(id, 'processing')

    try {
      let outputUrl = ''

      if (!meta.isAI) {
        // Client-side processing — dynamic import to avoid SSR
        const proc = await import('@/lib/utils/image-processor')

        switch (toolboxType) {
          case 'levels':
            outputUrl = await proc.applyLevels(inputUrl, { brightness, contrast, gamma })
            break
          case 'crop':
            outputUrl = await proc.cropImage(inputUrl, { x: cropX, y: cropY, width: cropW, height: cropH })
            break
          case 'resize':
            outputUrl = await proc.resizeImage(inputUrl, { width: resizeW, height: resizeH })
            break
          case 'blur':
            outputUrl = await proc.blurImage(inputUrl, { radius: blurRadius })
            break
          case 'invert':
            outputUrl = await proc.invertImage(inputUrl)
            break
          case 'channels':
            outputUrl = await proc.isolateChannel(inputUrl, { channel: channel as any })
            break
          case 'compositor': {
            const { nodes, edges } = useWorkspaceStore.getState()
            const upUrls = edges
              .filter(e => e.target === id)
              .map(e => nodes.find(n => n.id === e.source)?.data.outputUrl)
              .filter(Boolean) as string[]
            outputUrl = await proc.compositeImages(upUrls.length > 0 ? upUrls : [inputUrl], { blendMode: blendMode as any })
            break
          }
          case 'extractFrame':
            outputUrl = await proc.extractVideoFrame(inputUrl, timestamp)
            break
          case 'matteGrowShrink':
            outputUrl = await proc.matteGrowShrink(inputUrl, { amount: growAmount })
            break
          case 'mergeAlpha': {
            // Second input = mask
            const { nodes, edges } = useWorkspaceStore.getState()
            const maskEdge = edges.filter(e => e.target === id)[1]
            const maskUrl = maskEdge ? nodes.find(n => n.id === maskEdge.source)?.data.outputUrl || '' : ''
            if (!maskUrl) { toast.error('Maske bağlantısı gerekli (2. port)'); updateNodeStatus(id, 'idle'); return }
            outputUrl = await proc.mergeAlpha(inputUrl, maskUrl)
            break
          }
          default:
            throw new Error(`Client-side işlem desteklenmiyor: ${toolboxType}`)
        }
      } else {
        // AI-powered — call API
        const payload: Record<string, unknown> = { matteType: toolboxType }
        if (toolboxType === 'video-matte' || toolboxType === 'videoMatte') {
          payload.videoUrl = inputUrl
        } else {
          payload.imageUrl = inputUrl
          if (toolboxType === 'maskByText') payload.text = textPrompt
        }

        const res = await fetch('/api/generate/toolbox-matte', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const resData = await res.json()
        if (!res.ok || resData.error) throw new Error(resData.error || 'İşlem başarısız')
        outputUrl = resData.url
        toast.success(`${meta.label} tamamlandı · ${resData.creditsUsed} kredi`)
      }

      updateNodeOutput(id, outputUrl)
      if (!meta.isAI) toast.success(`${meta.label} tamamlandı`)

    } catch (err: any) {
      updateNodeError(id, err.message)
      toast.error(err.message)
    }
  }, [
    id, toolboxType, meta, getUpstreamAsset,
    brightness, contrast, gamma,
    cropX, cropY, cropW, cropH,
    resizeW, resizeH, blurRadius, channel, blendMode, timestamp,
    textPrompt, growAmount,
    updateNodeStatus, updateNodeOutput, updateNodeError,
  ])

  const renderParams = () => {
    switch (toolboxType) {
      case 'levels':
        return (
          <div className="space-y-1.5">
            {[
              { label: 'Brightness', value: brightness, set: setBrightness, min: -100, max: 100, step: 1 },
              { label: 'Contrast',   value: contrast,   set: setContrast,   min: -100, max: 100, step: 1 },
              { label: 'Gamma',      value: gamma,       set: setGamma,     min: 0.1,  max: 3,   step: 0.1 },
            ].map(({ label, value, set, min, max, step }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-[9px] text-zinc-500 w-16 shrink-0">{label} {value}</span>
                <input type="range" min={min} max={max} step={step} value={value}
                  onChange={e => set(parseFloat(e.target.value))}
                  className="flex-1 h-1 nodrag" style={{ accentColor: meta.color }} />
              </div>
            ))}
          </div>
        )
      case 'crop':
        return (
          <div className="grid grid-cols-2 gap-1">
            {([['X', cropX, setCropX], ['Y', cropY, setCropY], ['W', cropW, setCropW], ['H', cropH, setCropH]] as [string, number, (v: number) => void][]).map(([label, val, setter]) => (
              <div key={label} className="flex items-center gap-1">
                <span className="text-[9px] text-zinc-500 w-3">{label}</span>
                <input type="number" value={val} onChange={e => setter(parseInt(e.target.value) || 0)}
                  className="flex-1 text-[10px] bg-white/5 border border-white/8 rounded px-1.5 py-0.5 text-zinc-300 outline-none nodrag w-16" />
              </div>
            ))}
          </div>
        )
      case 'resize':
        return (
          <div className="flex gap-2">
            {([['W', resizeW, setResizeW], ['H', resizeH, setResizeH]] as [string, number, (v: number) => void][]).map(([label, val, setter]) => (
              <div key={label} className="flex items-center gap-1 flex-1">
                <span className="text-[9px] text-zinc-500">{label}</span>
                <input type="number" value={val} onChange={e => setter(parseInt(e.target.value) || 512)}
                  className="flex-1 text-[10px] bg-white/5 border border-white/8 rounded px-1.5 py-0.5 text-zinc-300 outline-none nodrag" />
              </div>
            ))}
          </div>
        )
      case 'blur':
        return (
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-zinc-500 shrink-0">Radius {blurRadius}px</span>
            <input type="range" min={1} max={30} step={1} value={blurRadius}
              onChange={e => setBlurRadius(parseInt(e.target.value))}
              className="flex-1 h-1 nodrag" style={{ accentColor: meta.color }} />
          </div>
        )
      case 'channels':
        return (
          <select value={channel} onChange={e => setChannel(e.target.value)}
            className="w-full text-[10px] bg-white/5 border border-white/8 rounded-lg px-2 py-1 text-zinc-300 outline-none nodrag">
            <option value="rgb">RGB (tümü)</option>
            <option value="r">Kırmızı (R)</option>
            <option value="g">Yeşil (G)</option>
            <option value="b">Mavi (B)</option>
            <option value="a">Alpha (A)</option>
          </select>
        )
      case 'compositor':
        return (
          <select value={blendMode} onChange={e => setBlendMode(e.target.value)}
            className="w-full text-[10px] bg-white/5 border border-white/8 rounded-lg px-2 py-1 text-zinc-300 outline-none nodrag">
            <option value="source-over">Normal</option>
            <option value="multiply">Multiply</option>
            <option value="screen">Screen</option>
            <option value="overlay">Overlay</option>
            <option value="hard-light">Hard Light</option>
            <option value="soft-light">Soft Light</option>
            <option value="difference">Difference</option>
            <option value="exclusion">Exclusion</option>
          </select>
        )
      case 'extractFrame':
        return (
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-zinc-500 shrink-0">Saniye</span>
            <input type="number" value={timestamp} min={0} step={0.1}
              onChange={e => setTimestamp(parseFloat(e.target.value) || 0)}
              className="flex-1 text-[10px] bg-white/5 border border-white/8 rounded-lg px-2 py-1 text-zinc-300 outline-none nodrag" />
          </div>
        )
      case 'maskByText':
        return (
          <input type="text" value={textPrompt} onChange={e => setTextPrompt(e.target.value)}
            placeholder="Nesne adı (örn: insan, araba)..."
            className="w-full text-[10px] bg-white/5 border border-white/8 rounded-lg px-2 py-1 text-zinc-300 placeholder-zinc-600 outline-none nodrag" />
        )
      case 'matteGrowShrink':
        return (
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-zinc-500 shrink-0">{growAmount > 0 ? `+${growAmount}` : growAmount}px</span>
            <input type="range" min={-20} max={20} step={1} value={growAmount}
              onChange={e => setGrowAmount(parseInt(e.target.value))}
              className="flex-1 h-1 nodrag" style={{ accentColor: meta.color }} />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div
      className="min-w-[220px] max-w-[260px] rounded-xl bg-[#0F051D]/95 overflow-hidden"
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
        <div className="flex items-center gap-1.5">
          {!meta.isAI && (
            <span className="text-[8px] px-1 rounded bg-[#D1FE17]/10 text-[#D1FE17]/70 border border-[#D1FE17]/20 font-bold">FREE</span>
          )}
          <StatusIcon status={data.status} />
        </div>
      </div>

      <div className="px-3 py-2 space-y-2">
        {/* Output preview */}
        {data.outputUrl && (
          <div className="relative rounded-lg overflow-hidden bg-[#1a1025] border border-white/8">
            {toolboxType === 'extractFrame' || toolboxType === 'videoMatte' ? (
              <img src={data.outputUrl} className="w-full h-20 object-cover" alt="output" />
            ) : (
              <img src={data.outputUrl} className="w-full h-20 object-cover" alt="output" />
            )}
          </div>
        )}

        {/* Params */}
        {renderParams()}

        {/* Hint if no params and no output */}
        {!data.outputUrl && !renderParams() && (
          <p className="text-[10px] text-zinc-600 text-center py-1">{meta.hint}</p>
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
            <a href={data.outputUrl} download
              className="p-1.5 rounded-lg bg-white/5 border border-white/8 text-zinc-400 hover:text-white transition-colors"
              title="İndir">
              <Download className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[9px] text-zinc-600">{meta.hint}</span>
          {meta.creditCost > 0
            ? <span className="text-[9px] text-[#D1FE17]/50 font-mono">⚡ {meta.creditCost}cr</span>
            : <span className="text-[9px] text-[#D1FE17]/50 font-mono">0 cr</span>
          }
        </div>

        {data.error && (
          <p className="text-[10px] text-red-400 bg-red-500/10 rounded px-2 py-1">{data.error}</p>
        )}
      </div>

      {/* Handles */}
      <Handle type="target" position={Position.Left} id="in"
        className="!w-3 !h-3 !border-2" style={{ background: meta.color, borderColor: '#0F051D' }} />
      {(toolboxType === 'mergeAlpha' || toolboxType === 'compositor') && (
        <Handle type="target" position={Position.Left} id="in2"
          className="!w-3 !h-3 !border-2" style={{ background: meta.color, borderColor: '#0F051D', top: '70%' }} />
      )}
      <Handle type="source" position={Position.Right} id="out"
        className="!w-3 !h-3 !border-2" style={{ background: meta.color, borderColor: '#0F051D' }} />
    </div>
  )
})
