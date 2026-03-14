'use client'

import { memo, useState, useRef, useEffect } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { motion } from 'framer-motion'
import {
  FileText, Mic, Paintbrush, Film, Subtitles, Download, Loader2, Check, X, Clock, MoreHorizontal, Plus, Play, ChevronLeft, ChevronRight, Terminal, ListTree, ArrowRightLeft, Repeat, Settings, Copy, ExternalLink
} from 'lucide-react'
import { useWorkspaceStore, NODE_COLORS, type NodeData, type NodeStatus, type ScriptConfig, type ImageGenConfig, type VideoGenConfig } from '@/lib/stores/workspace-store'
import { executeSingleNode } from '@/lib/ai/execution-engine'
import { toast } from 'sonner'
import { VideoBriefNodeContent, FilmStripNodeContent } from './CapCutNodes'
import { ImageEditNodeContent, SoonNodeContent } from './ImageEditNodes'
import { MultiModelVideoNodeContent } from './MultiModelVideoNode'
import { LipSyncNodeContent, VideoToVideoNodeContent, VideoUpscaleNodeContent, VideoEnhanceNodeContent } from './VideoEditNodes'
import { SetVariableNodeContent, GetVariableNodeContent, TextFormatterNodeContent } from './VariableNodes'
import { PromptVariableEditor } from './PromptVariableEditor'
import { TextIteratorNodeContent as IteratorTextNodeContent, ImageIteratorNodeContent, TaskManagerNodeContent } from './IteratorNodes'
import { ThreeDNodeContent, AudioGenNodeContent, VoiceCloneNodeContent } from './SpecialNodes'
import { ImageI2INodeContent } from './ImageI2INodes'
import { ToolboxNodeContent } from './ToolboxNodes'

// Highlight ring class for card badge navigation
function useNodeHighlight(id: string) {
  return useWorkspaceStore((s) => s.highlightedNodeId === id)
}
function highlightClasses(isHighlighted: boolean) {
  return isHighlighted ? 'animate-pulse ring-2 ring-[#a78bfa] ring-offset-2 ring-offset-[#0F051D]' : ''
}

const STATUS_ICONS: Record<NodeStatus, React.ReactNode> = {
  idle:       <Clock className="w-3 h-3 text-zinc-500" />,
  pending:    <Clock className="w-3 h-3 text-[#FFE744]" />,
  processing: <Loader2 className="w-3 h-3 text-[#0ea5e9] animate-spin" />,
  ready:      <Check className="w-3 h-3 text-[#D1FE17]" />,
  failed:     <X className="w-3 h-3 text-red-400" />,
}

const OUTPUT_LABELS: Record<string, string> = {
  script: 'Script',
  voice: 'Audio',
  imageGen: 'Image',
  videoGen: 'Video',
  caption: 'Captioned',
  export: 'File',
}

// ── Node context menu wrapper (handles click-outside) ───────────────────────
function NodeMenuWrapper({ nodeId }: { nodeId: string }) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const { removeNode, duplicateNode } = useWorkspaceStore()

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return
      if (btnRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(v => !v)}
        className="text-zinc-500 hover:text-white transition-colors"
      >
        <MoreHorizontal className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div ref={menuRef} className="absolute top-8 right-2 z-50 w-40 py-1 rounded-lg bg-[#1a0d2e] border border-white/15 shadow-2xl">
          <button type="button"
            className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] text-zinc-300 hover:bg-white/5"
            onClick={() => { duplicateNode(nodeId); setOpen(false) }}
          >
            Duplicate <span className="text-zinc-600 text-[9px]">⌘D</span>
          </button>
          <button type="button" className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] text-zinc-300 hover:bg-white/5" onClick={() => setOpen(false)}>
            Rename
          </button>
          <button type="button" className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] text-zinc-300 hover:bg-white/5" onClick={() => setOpen(false)}>
            Lock
          </button>
          <div className="h-px bg-white/10 my-0.5" />
          <button type="button"
            className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] text-red-400 hover:bg-red-500/10"
            onClick={() => { removeNode(nodeId); setOpen(false) }}
          >
            Delete <span className="text-zinc-600 text-[9px]">⌫</span>
          </button>
        </div>
      )}
    </>
  )
}

// ── Script node ─────────────────────────────────────────────────────────────

const ScriptNodeContent = memo(({ id, data, selected }: NodeProps<NodeData>) => {
  const color = NODE_COLORS.script
  const updateNodeConfig = useWorkspaceStore((s) => s.updateNodeConfig)
  const config = data.config as ScriptConfig
  const isHighlighted = useNodeHighlight(id)

  return (
    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className={`relative w-[280px] rounded-xl border transition-all ${selected ? 'ring-2 ring-offset-2 ring-offset-[#0F051D]' : 'hover:shadow-lg'} ${highlightClasses(isHighlighted)}`}
      style={{ border: `1px solid ${selected ? color : isHighlighted ? '#a78bfa' : color + '40'}`, borderLeft: `3px solid ${selected ? color : isHighlighted ? '#a78bfa' : color + 'CC'}`, boxShadow: selected ? `0 0 30px ${color}35` : isHighlighted ? '0 0 40px rgba(167,139,250,0.3)' : `0 0 16px ${color}18` }}>

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-t-xl" style={{ background: `linear-gradient(135deg, ${color}38 0%, ${color}18 100%)` }}>
        <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: `${color}40` }}>
          <FileText className="w-3 h-3" style={{ color }} />
        </div>
        <span className="flex-1 text-[11px] font-semibold text-white">Prompt</span>
        {STATUS_ICONS[data.status as keyof typeof STATUS_ICONS]}
        <NodeMenuWrapper nodeId={id} />
      </div>

      {/* Content — editable textarea with variable highlight */}
      <div className="bg-[#0F051D]/90 backdrop-blur-xl">
        <div className="mx-3 my-2 bg-[#1a1025] border border-white/8 rounded-lg overflow-hidden focus-within:border-[#a78bfa] transition-colors">
          <PromptVariableEditor
            value={config.prompt || ''}
            onChange={(val) => updateNodeConfig(id, { prompt: val })}
            placeholder="Type your script or prompt here... Use {variable} for dynamic values"
            rows={5}
          />
        </div>

        {/* Script Output — only when ready */}
        {data.status === 'ready' && data.outputUrl && (
          <div className="mx-3 mb-2 rounded-lg border border-[#FF2D78]/30 overflow-hidden">
            <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#FF2D78]/8 border-b border-[#FF2D78]/15">
              <span className="text-[9px] text-[#FF2D78] font-semibold uppercase tracking-wider">Generated Script</span>
              <button
                onClick={() => { navigator.clipboard.writeText(data.outputUrl || ''); toast.success('Script copied!') }}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <Copy className="w-2.5 h-2.5" />Copy
              </button>
            </div>
            <div className="p-2.5 max-h-[120px] overflow-y-auto custom-scrollbar bg-[#0a0314]">
              <p className="text-[10px] text-zinc-300 whitespace-pre-wrap leading-relaxed">{data.outputUrl}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-white/5">
          <div className="flex gap-1">
            <span className="px-1.5 py-0.5 bg-[#FFE744]/10 text-[#FFE744] text-[8px] rounded font-medium">{config.sceneCount} scenes</span>
            <span className="px-1.5 py-0.5 bg-white/5 text-zinc-500 text-[8px] rounded">{config.model}</span>
          </div>
          <button
            onClick={async () => {
              try {
                const res = await executeSingleNode(id)
                if (res.success) toast.success('Script generated')
                else toast.error(res.error)
              } catch (e: any) { toast.error(e.message) }
            }}
            disabled={data.status === 'processing'}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/8 border border-white/10 text-[10px] text-zinc-300 hover:bg-white/15 transition-all disabled:opacity-50"
          >
            {data.status === 'processing' ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Play className="w-2.5 h-2.5" />}
            {data.status === 'processing' ? 'Running' : 'Run Model'}
          </button>
        </div>
      </div>

      {/* Output handle */}
      <Handle type="source" position={Position.Right} id="script-out"
        className="!w-3 !h-3 !rounded-full !border-2 !border-[#0F051D]" style={{ backgroundColor: color }} />
      <div className="absolute right-0 top-1/2 translate-x-[calc(100%+8px)] -translate-y-1/2 flex flex-col items-start pointer-events-none">
        <span className="text-[8px] text-white/50 uppercase tracking-widest leading-none mb-0.5">Output</span>
        <span className="text-[9px] font-medium leading-none" style={{ color }}>{OUTPUT_LABELS.script}</span>
      </div>
    </motion.div>
  )
})
ScriptNodeContent.displayName = 'ScriptNode'

// ── Voice TTS node ──────────────────────────────────────────────────────────

const VoiceNodeContent = memo(({ id, data, selected }: NodeProps<NodeData>) => {
  const color = NODE_COLORS.voice
  const isHighlighted = useNodeHighlight(id)

  return (
    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className={`relative w-[260px] rounded-xl border transition-all ${selected ? 'ring-2 ring-offset-2 ring-offset-[#0F051D]' : 'hover:shadow-lg'} ${highlightClasses(isHighlighted)}`}
      style={{ border: `1px solid ${selected ? color : isHighlighted ? '#a78bfa' : color + '40'}`, borderLeft: `3px solid ${selected ? color : isHighlighted ? '#a78bfa' : color + 'CC'}`, boxShadow: selected ? `0 0 30px ${color}35` : isHighlighted ? '0 0 40px rgba(167,139,250,0.3)' : `0 0 16px ${color}18` }}>

      <Handle type="target" position={Position.Left} id="voice-in"
        className="!w-3 !h-3 !rounded-full !border-2 !border-[#0F051D]" style={{ backgroundColor: color }} />
      <div className="absolute left-0 top-1/2 -translate-x-[calc(100%+8px)] -translate-y-1/2 flex flex-col items-end pointer-events-none">
        <span className="text-[9px] font-medium leading-none" style={{ color }}>Script</span>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-t-xl" style={{ background: `linear-gradient(135deg, ${color}38 0%, ${color}18 100%)` }}>
        <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: `${color}40` }}>
          <Mic className="w-3 h-3" style={{ color }} />
        </div>
        <span className="flex-1 text-[11px] font-semibold text-white">{data.label}</span>
        {STATUS_ICONS[data.status as keyof typeof STATUS_ICONS]}
        <NodeMenuWrapper nodeId={id} />
      </div>

      <div className="bg-[#0F051D]/90 backdrop-blur-xl px-3 py-2 space-y-2">
        {/* Audio player or waveform preview */}
        {data.outputUrl ? (
          <div className="rounded-lg bg-[#1a1025] border border-[#a78bfa]/30 p-2 space-y-1.5">
            <audio src={data.outputUrl} controls className="w-full h-7 [&::-webkit-media-controls-panel]:bg-transparent" />
            <div className="flex gap-1.5 items-center justify-between">
              <span className="text-[9px] text-[#a78bfa] font-medium">Audio ready</span>
              <a href={data.outputUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] text-zinc-400 hover:text-white hover:bg-white/5 transition-all">
                <Download className="w-2.5 h-2.5" />Save
              </a>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-[#1a1025] border border-white/8">
            <button className="w-6 h-6 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: `${color}25` }}>
              <Play className="w-2.5 h-2.5" style={{ color }} />
            </button>
            <div className="flex-1 flex items-end gap-[1px] h-6 cursor-pointer">
              {[3,5,8,12,7,15,10,8,12,6,9,14,8,5,11,7,13,6,10,8,5,12,9,7,4,8,11,6,9,5].map((h,i) => (
                <div key={i} className="flex-1 rounded-full transition-all hover:opacity-80" style={{
                  height: `${h}px`, backgroundColor: i < 18 ? color : `${color}30`
                }} />
              ))}
            </div>
            <span className="text-[9px] text-zinc-500 ml-1">0:42</span>
          </div>
        )}

        {/* Voice info */}
        <div className="flex gap-1">
          <span className="px-1.5 py-0.5 text-[8px] rounded font-medium" style={{ backgroundColor: `${color}15`, color }}>♀ Rachel</span>
          <span className="px-1.5 py-0.5 bg-white/5 text-zinc-500 text-[8px] rounded">1.0x</span>
          <span className="px-1.5 py-0.5 bg-white/5 text-zinc-500 text-[8px] rounded">ElevenLabs</span>
        </div>

        <div className="flex items-center justify-end pt-1 border-t border-white/5">
          <button
            onClick={async () => {
              try {
                const res = await executeSingleNode(id)
                if (res.success) toast.success('Audio generated')
                else toast.error(res.error)
              } catch (e: any) { toast.error(e.message) }
            }}
            disabled={data.status === 'processing'}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/8 border border-white/10 text-[10px] text-zinc-300 hover:bg-white/15 transition-all disabled:opacity-50"
          >
            {data.status === 'processing' ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Play className="w-2.5 h-2.5" />}
            {data.status === 'processing' ? 'Running' : 'Run Model'}
          </button>
        </div>
      </div>

      <Handle type="source" position={Position.Right} id="voice-out"
        className="!w-3 !h-3 !rounded-full !border-2 !border-[#0F051D]" style={{ backgroundColor: color }} />
      <div className="absolute right-0 top-1/2 translate-x-[calc(100%+8px)] -translate-y-1/2 flex flex-col items-start pointer-events-none">
        <span className="text-[9px] font-medium leading-none" style={{ color }}>{OUTPUT_LABELS.voice}</span>
      </div>
    </motion.div>
  )
})
VoiceNodeContent.displayName = 'VoiceNode'

// ── Image Generation node ───────────────────────────────────────────────────

const IMAGE_MODEL_OPTIONS = [
  { value: 'flux-schnell',      label: 'Flux Schnell',       credits: 5  },
  { value: 'flux-pro',          label: 'Flux Pro v1.1',      credits: 12 },
  { value: 'flux-2-pro',        label: 'Flux 2 Pro',         credits: 22 },
  { value: 'flux-kontext',      label: 'Flux Kontext',       credits: 15 },
  { value: 'recraft-v4',        label: 'Recraft v4',         credits: 10 },
  { value: 'sd-3.5',            label: 'SD 3.5 Large',       credits: 8  },
  { value: 'imagine-art',       label: 'Imagine Art v1.5',   credits: 10 },
  { value: 'seedream-5.0-lite', label: 'Seedream 5.0 Lite',  credits: 18 },
  { value: 'ideogram-v3',       label: 'Ideogram V3',        credits: 10 },
]

const ImageGenNodeContent = memo(({ id, data, selected }: NodeProps<NodeData>) => {
  const [currentImg, setCurrentImg] = useState(0)
  const updateNodeConfig = useWorkspaceStore((s) => s.updateNodeConfig)
  const color = NODE_COLORS.imageGen
  const imgConfig = data.config as ImageGenConfig
  const extraInputCount = Math.min((imgConfig as any).extraInputCount || 0, 3)
  const isHighlighted = useNodeHighlight(id)

  return (
    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className={`relative w-[280px] rounded-xl border transition-all ${selected ? 'ring-2 ring-offset-2 ring-offset-[#0F051D]' : 'hover:shadow-lg'} ${highlightClasses(isHighlighted)}`}
      style={{ border: `1px solid ${selected ? color : isHighlighted ? '#a78bfa' : color + '40'}`, borderLeft: `3px solid ${selected ? color : isHighlighted ? '#a78bfa' : color + 'CC'}`, boxShadow: selected ? `0 0 30px ${color}35` : isHighlighted ? '0 0 40px rgba(167,139,250,0.3)' : `0 0 16px ${color}18` }}>

      {/* Main prompt handle */}
      <Handle type="target" position={Position.Left} id="img-in-prompt"
        className="!w-3 !h-3 !rounded-full !border-2 !border-[#0F051D]" style={{ backgroundColor: '#FFE744', top: '40%' }} />
      <div className="absolute left-0 pr-2 flex flex-col items-end pointer-events-none" style={{ top: '40%', transform: 'translateX(calc(-100% - 8px)) translateY(-50%)' }}>
        <span className="text-[9px] font-medium leading-none text-[#FFE744]">Prompt</span>
      </div>
      {Array.from({ length: extraInputCount }, (_, i) => (
        <Handle key={`handle-extra-${i}`} type="target" position={Position.Left} id={`img-in-extra-${i}`}
          className="!w-3 !h-3 !rounded-full !border-2 !border-[#0F051D]" style={{ backgroundColor: '#a78bfa', top: `${58 + i * 14}%` }} />
      ))}
      {Array.from({ length: extraInputCount }, (_, i) => (
        <div key={`label-extra-${i}`} className="absolute left-0 pr-2 flex flex-col items-end pointer-events-none" style={{ top: `${58 + i * 14}%`, transform: 'translateX(calc(-100% - 8px)) translateY(-50%)' }}>
          <span className="text-[9px] font-medium leading-none text-[#a78bfa]">Image {i + 2}</span>
        </div>
      ))}

      <div className="flex items-center gap-2 px-3 py-2 rounded-t-xl" style={{ background: `linear-gradient(135deg, ${color}38 0%, ${color}18 100%)` }}>
        <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: `${color}40` }}>
          <Paintbrush className="w-3 h-3" style={{ color }} />
        </div>
        <span className="flex-1 text-[11px] font-semibold text-white truncate">{IMAGE_MODEL_OPTIONS.find(m => m.value === imgConfig.model)?.label || data.label}</span>
        {STATUS_ICONS[data.status as keyof typeof STATUS_ICONS]}
        <NodeMenuWrapper nodeId={id} />
      </div>

      <div className="bg-[#0F051D]/90 backdrop-blur-xl">
        {/* Image gallery with navigation */}
        <div className="relative mx-3 mt-2 rounded-lg overflow-hidden bg-[#1a1025] border border-white/8 group">
          {data.outputUrl ? (
            <div className="aspect-[4/3] bg-[#0F051D] relative">
              <img src={data.outputUrl} alt="Generated output" className="w-full h-full object-contain" />
              {/* Download/open overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <a href={data.outputUrl} download="generated-image.png"
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/70 text-[10px] text-white hover:bg-black/90 transition-all border border-white/10">
                  <Download className="w-3 h-3" />Save
                </a>
                <a href={data.outputUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/70 text-[10px] text-white hover:bg-black/90 transition-all border border-white/10">
                  <ExternalLink className="w-3 h-3" />Open
                </a>
              </div>
            </div>
          ) : (
            <div className="aspect-[4/3] bg-gradient-to-br from-[#FFE744]/20 via-[#FF2D78]/15 to-[#a78bfa]/20 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
              <div className="w-full h-full relative opacity-50 block mix-blend-overlay">
                <img src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800" alt="Mock AI Output" className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                <span className="text-2xl drop-shadow-md">✨</span>
              </div>
            </div>
          )}

          {/* Image counter and navigation */}
          {!data.outputUrl && (
            <div className="absolute top-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/5">
                <button onClick={() => setCurrentImg(Math.max(0, currentImg - 1))} className="text-white/60 hover:text-white transition-colors">
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <span className="text-[10px] text-white font-semibold tabular-nums">{currentImg + 1}</span>
                <button onClick={() => setCurrentImg(currentImg + 1)} className="text-white/60 hover:text-white transition-colors">
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <span className="text-[8px] text-white/50 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded border border-white/5">1024×1024</span>
            </div>
          )}
        </div>

        {/* Add input + Run */}
        <div className="flex items-center justify-between px-3 py-2">
          {extraInputCount < 3 && (
            <button type="button" onClick={() => updateNodeConfig(id, { extraInputCount: extraInputCount + 1 })} className="flex items-center gap-1 text-[9px] text-zinc-500 hover:text-zinc-300 transition-colors">
              <Plus className="w-3 h-3" /> Add another image input
            </button>
          )}
          <button
            onClick={async () => {
              try {
                const res = await executeSingleNode(id)
                if (res.success) toast.success('Image generated')
                else toast.error(res.error)
              } catch (e: any) { toast.error(e.message) }
            }}
            disabled={data.status === 'processing'}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/8 border border-white/10 text-[10px] text-zinc-300 hover:bg-[#D1FE17] hover:text-black hover:border-transparent transition-all font-medium disabled:opacity-50 disabled:hover:bg-white/8 disabled:hover:text-zinc-300"
          >
            {data.status === 'processing' ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Play className="w-2.5 h-2.5" />}
            {data.status === 'processing' ? 'Running' : 'Run Model'}
          </button>
        </div>

        {/* Model info + credits */}
        <div className="flex items-center justify-between px-3 py-1.5 border-t border-white/5">
          <span className="px-1.5 py-0.5 text-[8px] rounded font-medium" style={{ backgroundColor: `${color}15`, color }}>{IMAGE_MODEL_OPTIONS.find(m => m.value === imgConfig.model)?.label || imgConfig.model}</span>
          <span className="text-[8px] font-medium text-[#D1FE17]">⚡ {IMAGE_MODEL_OPTIONS.find(m => m.value === imgConfig.model)?.credits ?? 5} credits</span>
        </div>
      </div>

      <Handle type="source" position={Position.Right} id="img-out"
        className="!w-3 !h-3 !rounded-full !border-2 !border-[#0F051D]" style={{ backgroundColor: color }} />
      <div className="absolute right-0 top-1/2 translate-x-[calc(100%+8px)] -translate-y-1/2 flex flex-col items-start pointer-events-none">
        <span className="text-[9px] font-medium leading-none" style={{ color }}>{OUTPUT_LABELS.imageGen}</span>
      </div>
    </motion.div>
  )
})
ImageGenNodeContent.displayName = 'ImageGenNode'

// ── Video Generation node ───────────────────────────────────────────────────

const VIDEO_MODEL_OPTIONS = [
  { value: 'kling-2.5-turbo',        label: 'Kling 2.5 Turbo',          credits: 25 },
  { value: 'kling-2.0-master',       label: 'Kling 2.0 Master',          credits: 30 },
  { value: 'kling-3.0-standard-t2v', label: 'Kling 3.0 Standard (T2V)',  credits: 35 },
  { value: 'kling-3.0-standard-i2v', label: 'Kling 3.0 Standard (I2V)',  credits: 35 },
  { value: 'kling-3.0-pro-t2v',      label: 'Kling 3.0 Pro (T2V)',       credits: 45 },
  { value: 'sora-2-pro',             label: 'Sora 2 Pro',                credits: 60 },
  { value: 'wan-2.6-t2v',            label: 'Wan 2.6 (T2V)',             credits: 22 },
  { value: 'wan-2.6-i2v',            label: 'Wan 2.6 (I2V)',             credits: 22 },
  { value: 'seedance-1.5-pro-t2v',   label: 'Seedance 1.5 Pro (T2V)',    credits: 28 },
  { value: 'seedance-1.5-pro-i2v',   label: 'Seedance 1.5 Pro (I2V)',    credits: 28 },
  { value: 'seedance-1.0-lite',      label: 'Seedance 1.0 Lite',         credits: 15 },
  { value: 'veo-3',                  label: 'Veo 3',                     credits: 50 },
  { value: 'veo-3.1',               label: 'Veo 3.1',                   credits: 55 },
  { value: 'ltx-2.3',               label: 'LTX Video 2.3',             credits: 20 },
  { value: 'ltx-2-19b',             label: 'LTX Video 2 19B',           credits: 22 },
  { value: 'minimax-hailuo',         label: 'Minimax Hailuo',            credits: 28 },
  { value: 'luma-dream',             label: 'Luma Dream Machine',        credits: 35 },
  { value: 'hunyuan',               label: 'HunyuanVideo',              credits: 20 },
  { value: 'mochi-1',               label: 'Mochi 1',                   credits: 15 },
]

const VideoGenNodeContent = memo(({ id, data, selected }: NodeProps<NodeData>) => {
  const color = NODE_COLORS.videoGen
  const vidConfig = data.config as VideoGenConfig

  return (
    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className={`relative w-[280px] rounded-xl border transition-all ${selected ? 'ring-2 ring-offset-2 ring-offset-[#0F051D]' : 'hover:shadow-lg'}`}
      style={{ border: `1px solid ${selected ? color : color + '40'}`, borderLeft: `3px solid ${selected ? color : color + 'CC'}`, boxShadow: selected ? `0 0 30px ${color}35` : `0 0 16px ${color}18` }}>

      {/* Multiple input handles — Prompt + Image + Voice */}
      <Handle type="target" position={Position.Left} id="vid-in-prompt"
        className="!w-3 !h-3 !rounded-full !border-2 !border-[#0F051D]" style={{ backgroundColor: '#FFE744', top: '25%' }} />
      <div className="absolute left-0 pr-2 flex flex-col items-end pointer-events-none" style={{ top: '25%', transform: 'translateX(calc(-100% - 8px)) translateY(-50%)' }}>
        <span className="text-[9px] font-medium leading-none text-[#FFE744]">Prompt</span>
      </div>

      <Handle type="target" position={Position.Left} id="vid-in-image"
        className="!w-3 !h-3 !rounded-full !border-2 !border-[#0F051D]" style={{ backgroundColor: '#FF2D78', top: '50%' }} />
      <div className="absolute left-0 pr-2 flex flex-col items-end pointer-events-none" style={{ top: '50%', transform: 'translateX(calc(-100% - 8px)) translateY(-50%)' }}>
        <span className="text-[9px] font-medium leading-none text-[#FF2D78]">Image</span>
      </div>

      <Handle type="target" position={Position.Left} id="vid-in-voice"
        className="!w-3 !h-3 !rounded-full !border-2 !border-[#0F051D]" style={{ backgroundColor: '#a78bfa', top: '75%' }} />
      <div className="absolute left-0 pr-2 flex flex-col items-end pointer-events-none" style={{ top: '75%', transform: 'translateX(calc(-100% - 8px)) translateY(-50%)' }}>
        <span className="text-[9px] font-medium leading-none text-[#a78bfa]">Voice</span>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-t-xl" style={{ background: `linear-gradient(135deg, ${color}38 0%, ${color}18 100%)` }}>
        <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: `${color}40` }}>
          <Film className="w-3 h-3" style={{ color }} />
        </div>
        <span className="flex-1 text-[11px] font-semibold text-white truncate">{VIDEO_MODEL_OPTIONS.find(m => m.value === vidConfig.model)?.label || data.label}</span>
        {STATUS_ICONS[data.status as keyof typeof STATUS_ICONS]}
        <NodeMenuWrapper nodeId={id} />
      </div>

      <div className="bg-[#0F051D]/90 backdrop-blur-xl">
        {/* Video preview */}
        <div className="relative mx-3 mt-2 rounded-lg overflow-hidden bg-[#1a1025] border border-white/8 group cursor-pointer">
          {data.outputUrl ? (
            <div className="aspect-video bg-black relative">
              <video src={data.outputUrl} controls playsInline className="w-full h-full object-contain focus:outline-none" />
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <a href={data.outputUrl} download="generated-video.mp4"
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/70 text-[10px] text-white hover:bg-black/90 transition-all border border-white/10">
                  <Download className="w-3 h-3" />Save
                </a>
                <a href={data.outputUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/70 text-[10px] text-white hover:bg-black/90 transition-all border border-white/10">
                  <ExternalLink className="w-3 h-3" />Open
                </a>
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-gradient-to-br from-[#D1FE17]/15 via-[#0ea5e9]/10 to-[#a78bfa]/15 flex items-center justify-center relative transition-transform duration-700 group-hover:scale-105">
              <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:bg-[#FF2D78]/20 group-hover:border-[#FF2D78]/50 transition-colors shadow-xl">
                <Play className="w-4 h-4 text-white ml-0.5 group-hover:text-[#FF2D78] transition-colors" />
              </div>
              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                <div className="h-full w-[65%] rounded-r-full shadow-[0_0_10px_currentColor] transition-all" style={{ backgroundColor: color }} />
              </div>
            </div>
          )}
          {/* Video info overlay */}
          {!data.outputUrl && (
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <span className="text-[8px] text-white/80 bg-black/50 backdrop-blur-md px-1.5 py-0.5 rounded border border-white/10 font-medium">1080p</span>
              <span className="text-[8px] text-white/80 bg-black/50 backdrop-blur-md px-1.5 py-0.5 rounded border border-white/10 font-medium">5s</span>
            </div>
          )}
        </div>

        {/* Settings summary */}
        <div className="flex items-center justify-end px-3 py-2">
          <button
            onClick={async () => {
              try {
                const res = await executeSingleNode(id)
                if (res.success) toast.success('Video generated')
                else toast.error(res.error)
              } catch (e: any) { toast.error(e.message) }
            }}
            disabled={data.status === 'processing'}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/8 border border-white/10 text-[10px] text-zinc-300 hover:bg-[#D1FE17] hover:text-black hover:border-transparent transition-all font-medium disabled:opacity-50 disabled:hover:bg-white/8 disabled:hover:text-zinc-300"
          >
            {data.status === 'processing' ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Play className="w-2.5 h-2.5" />}
            {data.status === 'processing' ? 'Running' : 'Run Model'}
          </button>
        </div>

        <div className="flex items-center justify-between px-3 py-1.5 border-t border-white/5">
          <span className="text-[8px] text-zinc-400 font-medium">3 clips generated</span>
          <span className="text-[8px] font-medium text-[#D1FE17]">⚡ {VIDEO_MODEL_OPTIONS.find(m => m.value === vidConfig.model)?.credits ?? 25} credits</span>
        </div>
      </div>

      <Handle type="source" position={Position.Right} id="vid-out"
        className="!w-3 !h-3 !rounded-full !border-2 !border-[#0F051D]" style={{ backgroundColor: color }} />
      <div className="absolute right-0 top-1/2 translate-x-[calc(100%+8px)] -translate-y-1/2 flex flex-col items-start pointer-events-none">
        <span className="text-[9px] font-medium leading-none" style={{ color }}>{OUTPUT_LABELS.videoGen}</span>
      </div>
    </motion.div>
  )
})
VideoGenNodeContent.displayName = 'VideoGenNode'

// ── Caption node ────────────────────────────────────────────────────────────

const CaptionNodeContent = memo(({ id, data, selected }: NodeProps<NodeData>) => {
  const color = NODE_COLORS.caption

  return (
    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className={`relative w-[240px] rounded-xl border transition-all ${selected ? 'ring-2 ring-offset-2 ring-offset-[#0F051D]' : 'hover:shadow-lg'}`}
      style={{ border: `1px solid ${selected ? color : color + '40'}`, borderLeft: `3px solid ${selected ? color : color + 'CC'}`, boxShadow: selected ? `0 0 30px ${color}35` : `0 0 16px ${color}18` }}>

      <Handle type="target" position={Position.Left} id="cap-in"
        className="!w-3 !h-3 !rounded-full !border-2 !border-[#0F051D]" style={{ backgroundColor: color }} />
      <div className="absolute left-0 top-1/2 -translate-x-[calc(100%+8px)] -translate-y-1/2 flex flex-col items-end pointer-events-none">
        <span className="text-[9px] font-medium leading-none" style={{ color }}>Video</span>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-t-xl" style={{ background: `linear-gradient(135deg, ${color}38 0%, ${color}18 100%)` }}>
        <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: `${color}40` }}>
          <Subtitles className="w-3 h-3" style={{ color }} />
        </div>
        <span className="flex-1 text-[11px] font-semibold text-white">{data.label}</span>
        {STATUS_ICONS[data.status as keyof typeof STATUS_ICONS]}
        <NodeMenuWrapper nodeId={id} />
      </div>

      <div className="bg-[#0F051D]/90 backdrop-blur-xl px-3 py-2 space-y-2">
        {/* Caption preview */}
        <div className="rounded-lg bg-[#1a1025] border border-white/8 p-2 space-y-1.5 group hover:border-[#a78bfa]/30 transition-colors">
          <div className="text-center py-2 bg-black/40 rounded border border-white/5">
            <p className="text-[10px] text-white font-medium drop-shadow-md">Welcome to the future of AI</p>
          </div>
          <div className="flex gap-1">
            <span className="px-1.5 py-0.5 text-[8px] rounded font-medium" style={{ backgroundColor: `${color}15`, color }}>Bold</span>
            <span className="px-1.5 py-0.5 bg-white/5 text-zinc-500 text-[8px] rounded">Bottom</span>
          </div>
        </div>

        <div className="flex items-center justify-end pt-1 border-t border-white/5">
          <button
            onClick={async () => {
              try {
                const res = await executeSingleNode(id)
                if (res.success) toast.success('Captions added')
                else toast.error(res.error)
              } catch (e: any) { toast.error(e.message) }
            }}
            disabled={data.status === 'processing'}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/8 border border-white/10 text-[10px] text-zinc-300 hover:bg-[#D1FE17] hover:text-black hover:border-transparent transition-all font-medium disabled:opacity-50 disabled:hover:bg-white/8 disabled:hover:text-zinc-300"
          >
            {data.status === 'processing' ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Play className="w-2.5 h-2.5" />}
            {data.status === 'processing' ? 'Running' : 'Run Model'}
          </button>
        </div>
      </div>

      <Handle type="source" position={Position.Right} id="cap-out"
        className="!w-3 !h-3 !rounded-full !border-2 !border-[#0F051D]" style={{ backgroundColor: color }} />
      <div className="absolute right-0 top-1/2 translate-x-[calc(100%+8px)] -translate-y-1/2 flex flex-col items-start pointer-events-none">
        <span className="text-[9px] font-medium leading-none" style={{ color }}>{OUTPUT_LABELS.caption}</span>
      </div>
    </motion.div>
  )
})
CaptionNodeContent.displayName = 'CaptionNode'

// ── Export node ─────────────────────────────────────────────────────────────

const ExportNodeContent = memo(({ id, data, selected }: NodeProps<NodeData>) => {
  const color = NODE_COLORS.export

  return (
    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className={`relative w-[240px] rounded-xl border transition-all ${selected ? 'ring-2 ring-offset-2 ring-offset-[#0F051D]' : 'hover:shadow-lg'}`}
      style={{ border: `1px solid ${selected ? color : color + '40'}`, borderLeft: `3px solid ${selected ? color : color + 'CC'}`, boxShadow: selected ? `0 0 30px ${color}35` : `0 0 16px ${color}18` }}>

      <Handle type="target" position={Position.Left} id="export-in"
        className="!w-3 !h-3 !rounded-full !border-2 !border-[#0F051D]" style={{ backgroundColor: color }} />
      <div className="absolute left-0 top-1/2 -translate-x-[calc(100%+8px)] -translate-y-1/2 flex flex-col items-end pointer-events-none">
        <span className="text-[8px] text-white/50 uppercase tracking-widest leading-none mb-0.5">Input</span>
        <span className="text-[9px] font-medium leading-none" style={{ color }}>Video</span>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-t-xl" style={{ background: `linear-gradient(135deg, ${color}38 0%, ${color}18 100%)` }}>
        <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: `${color}40` }}>
          <Download className="w-3 h-3" style={{ color }} />
        </div>
        <span className="flex-1 text-[11px] font-semibold text-white">{data.label}</span>
        {STATUS_ICONS[data.status as keyof typeof STATUS_ICONS]}
        <NodeMenuWrapper nodeId={id} />
      </div>

      <div className="bg-[#0F051D]/90 backdrop-blur-xl px-3 py-2 space-y-2">
        {/* Export file info */}
        <div className="flex items-center gap-3 p-2 rounded-lg bg-[#1a1025] border border-white/8 hover:border-white/20 transition-colors">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-inner" style={{ backgroundColor: `${color}15` }}>
            <Download className="w-4 h-4" style={{ color }} />
          </div>
          <div>
            <p className="text-[10px] text-white font-medium">final_video.mp4</p>
            <p className="text-[8px] text-zinc-500 mt-0.5">1080p · MP4 · ~12.4 MB</p>
          </div>
        </div>

        <div className="flex gap-1">
          <span className="px-1.5 py-0.5 bg-[#D1FE17]/10 text-[#D1FE17] text-[8px] rounded font-medium border border-[#D1FE17]/20">🔊 Audio</span>
          <span className="px-1.5 py-0.5 bg-[#0ea5e9]/10 text-[#0ea5e9] text-[8px] rounded font-medium border border-[#0ea5e9]/20">📝 Captions</span>
        </div>

        <div className="flex items-center justify-end pt-1 border-t border-white/5">
          <button
            onClick={async () => {
              try {
                const res = await executeSingleNode(id)
                if (res.success && res.outputUrl) {
                  toast.success('Export completed! Downloading...')
                  window.open(res.outputUrl, '_blank')
                } else if (res.success) {
                  toast.success('Export completed!')
                } else {
                  toast.error(res.error || 'Export failed')
                }
              } catch (e: any) { toast.error(e.message) }
            }}
            disabled={data.status === 'processing'}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-[10px] font-semibold text-black transition-all hover:brightness-110 active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50"
            style={{ backgroundColor: color }}
          >
            {data.status === 'processing' ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Download className="w-2.5 h-2.5" />}
            {data.status === 'processing' ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </motion.div>
  )
})
ExportNodeContent.displayName = 'ExportNode'



const GenericLogicalNode = ({ data, selected, icon: Icon, color, inputs, outputs }: any) => {
  return (
    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className={`relative min-w-[200px] rounded-xl border transition-all ${selected ? 'ring-2 ring-offset-2 ring-offset-[#0F051D]' : 'hover:shadow-lg'}`}
      style={{ border: `1px solid ${selected ? color : color + '40'}`, borderLeft: `3px solid ${selected ? color : color + 'CC'}`, boxShadow: selected ? `0 0 30px ${color}35` : `0 0 16px ${color}18` }}>
      
      {inputs.map((inp: any, i: number) => (
        <div key={inp.id} className="absolute left-0 pr-2 flex flex-col items-end pointer-events-none" style={{ top: `${(i+1)*100/(inputs.length+1)}%`, transform: 'translateX(calc(-100% - 8px)) translateY(-50%)' }}>
          <span className="text-[9px] font-medium leading-none" style={{ color: inp.color || color }}>{inp.label}</span>
          <Handle type="target" position={Position.Left} id={inp.id} className="!w-3 !h-3 !rounded-full !border-2 !border-[#0F051D]" style={{ backgroundColor: inp.color || color, top: '50%', transform: 'translate(calc(100% + 12px), -50%)' }} />
        </div>
      ))}

      <div className="flex items-center gap-2 px-3 py-2 rounded-t-xl" style={{ background: `linear-gradient(135deg, ${color}38 0%, ${color}18 100%)` }}>
        <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: `${color}40` }}>
          <Icon className="w-3 h-3" style={{ color }} />
        </div>
        <span className="flex-1 text-[11px] font-semibold text-white">{data.label}</span>
        {STATUS_ICONS[data.status as keyof typeof STATUS_ICONS]}
      </div>

      <div className="bg-[#0F051D]/90 backdrop-blur-xl px-3 py-3 rounded-b-xl border-t border-white/5">
        <p className="text-[10px] text-zinc-500">Node functionality configurable in details panel.</p>
      </div>

      {outputs.map((out: any, i: number) => (
        <div key={out.id} className="absolute right-0 pl-2 flex flex-col items-start pointer-events-none" style={{ top: `${(i+1)*100/(outputs.length+1)}%`, transform: 'translateX(calc(100% + 8px)) translateY(-50%)' }}>
          <span className="text-[9px] font-medium leading-none" style={{ color: out.color || color }}>{out.label}</span>
          <Handle type="source" position={Position.Right} id={out.id} className="!w-3 !h-3 !rounded-full !border-2 !border-[#0F051D]" style={{ backgroundColor: out.color || color, top: '50%', transform: 'translate(calc(-100% - 12px), -50%)' }} />
        </div>
      ))}
    </motion.div>
  )
}

const LLMNodeContent = memo((props: NodeProps<NodeData>) => (
  <GenericLogicalNode {...props} icon={Terminal} color={NODE_COLORS.llm} inputs={[{ id: 'prompt', label: 'Prompt' }, { id: 'sys', label: 'System' }]} outputs={[{ id: 'out', label: 'Result' }]} />
))
LLMNodeContent.displayName = 'LLMNode'

const ArrayNodeContent = memo(({ id, data, selected }: NodeProps<NodeData>) => {
  const updateNodeConfig = useWorkspaceStore((s) => s.updateNodeConfig)
  const color = NODE_COLORS.array
  const config = data.config as { items: string[] }
  const items: string[] = config.items || []

  const updateItem = (idx: number, val: string) => {
    const next = [...items]; next[idx] = val
    updateNodeConfig(id, { items: next })
  }
  const addItem = () => updateNodeConfig(id, { items: [...items, ''] })
  const removeItem = (idx: number) => updateNodeConfig(id, { items: items.filter((_, i) => i !== idx) })

  return (
    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className={`relative w-[280px] rounded-xl border transition-all ${selected ? 'ring-2 ring-offset-2 ring-offset-[#0F051D]' : 'hover:shadow-lg'}`}
      style={{ border: `1px solid ${selected ? color : color + '40'}`, borderLeft: `3px solid ${selected ? color : color + 'CC'}`, boxShadow: selected ? `0 0 30px ${color}35` : `0 0 16px ${color}18` }}>

      <Handle type="target" position={Position.Left} id="arr-in"
        className="!w-3 !h-3 !rounded-full !border-2 !border-[#0F051D]" style={{ backgroundColor: color }} />
      <div className="absolute left-0 top-1/2 -translate-x-[calc(100%+8px)] -translate-y-1/2 pointer-events-none">
        <span className="text-[9px] font-medium" style={{ color }}>Data</span>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-t-xl" style={{ background: `linear-gradient(135deg, ${color}38 0%, ${color}18 100%)` }}>
        <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: `${color}40` }}>
          <ListTree className="w-3 h-3" style={{ color }} />
        </div>
        <span className="flex-1 text-[11px] font-semibold text-white">{data.label}</span>
        {STATUS_ICONS[data.status as keyof typeof STATUS_ICONS]}
        <NodeMenuWrapper nodeId={id} />
      </div>

      <div className="bg-[#0F051D]/90 backdrop-blur-xl px-3 py-2 space-y-1.5">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <span className="text-[9px] text-zinc-600 w-4 shrink-0">{idx + 1}.</span>
            <input
              value={item}
              onChange={(e) => updateItem(idx, e.target.value)}
              placeholder={`Item ${idx + 1}`}
              className="flex-1 bg-[#1a1025] border border-white/8 rounded px-2 py-1 text-[10px] text-zinc-300 placeholder:text-zinc-600 outline-none focus:border-white/20 min-w-0"
            />
            <button onClick={() => removeItem(idx)} className="text-zinc-600 hover:text-red-400 transition-colors shrink-0">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <button onClick={addItem}
          className="flex items-center gap-1 text-[9px] text-zinc-500 hover:text-zinc-300 transition-colors pt-1">
          <Plus className="w-3 h-3" /> Add item
        </button>
        <div className="flex justify-between items-center pt-1 border-t border-white/5">
          <span className="text-[9px] text-zinc-600">{items.length} items</span>
        </div>
      </div>

      <Handle type="source" position={Position.Right} id="arr-out"
        className="!w-3 !h-3 !rounded-full !border-2 !border-[#0F051D]" style={{ backgroundColor: color }} />
      <div className="absolute right-0 top-1/2 translate-x-[calc(100%+8px)] -translate-y-1/2 pointer-events-none">
        <span className="text-[9px] font-medium" style={{ color }}>Array</span>
      </div>
    </motion.div>
  )
})
ArrayNodeContent.displayName = 'ArrayNode'

const RouterNodeContent = memo((props: NodeProps<NodeData>) => (
  <GenericLogicalNode {...props} icon={ArrowRightLeft} color={NODE_COLORS.router} inputs={[{ id: 'in', label: 'Input' }]} outputs={[{ id: 'true', label: 'If True', color: '#06d6a0' }, { id: 'false', label: 'Fallback', color: '#ef4444' }]} />
))
RouterNodeContent.displayName = 'RouterNode'

const TextIteratorNodeContent = memo((props: NodeProps<NodeData>) => (
  <GenericLogicalNode {...props} icon={Repeat} color={NODE_COLORS.textIterator} inputs={[{ id: 'in-arr', label: 'Array' }]} outputs={[{ id: 'item', label: 'Item' }]} />
))
TextIteratorNodeContent.displayName = 'TextIteratorNode'

const SystemPromptNodeContent = memo(({ id, data, selected }: NodeProps<NodeData>) => {
  const updateNodeConfig = useWorkspaceStore((s) => s.updateNodeConfig)
  const color = NODE_COLORS.systemPrompt
  const config = data.config as { content: string }

  return (
    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className={`relative w-[280px] rounded-xl border transition-all ${selected ? 'ring-2 ring-offset-2 ring-offset-[#0F051D]' : 'hover:shadow-lg'}`}
      style={{ border: `1px solid ${selected ? color : color + '40'}`, borderLeft: `3px solid ${selected ? color : color + 'CC'}`, boxShadow: selected ? `0 0 30px ${color}35` : `0 0 16px ${color}18` }}>

      <div className="flex items-center gap-2 px-3 py-2 rounded-t-xl" style={{ background: `linear-gradient(135deg, ${color}38 0%, ${color}18 100%)` }}>
        <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: `${color}40` }}>
          <Settings className="w-3 h-3" style={{ color }} />
        </div>
        <span className="flex-1 text-[11px] font-semibold text-white">System Prompt</span>
        {STATUS_ICONS[data.status as keyof typeof STATUS_ICONS]}
        <NodeMenuWrapper nodeId={id} />
      </div>

      <div className="bg-[#0F051D]/90 backdrop-blur-xl">
        <div className="mx-3 my-2 bg-[#1a1025] border border-white/8 rounded-lg overflow-hidden focus-within:border-[#8b5cf6] transition-colors">
          <textarea
            className="w-full h-[100px] p-2.5 bg-transparent text-[11px] text-zinc-300 resize-none outline-none custom-scrollbar"
            placeholder="You are a helpful assistant..."
            value={config.content || ''}
            onChange={(e) => updateNodeConfig(id, { content: e.target.value })}
          />
        </div>
        <div className="flex items-center justify-between px-3 py-2 border-t border-white/5">
          <span className="px-1.5 py-0.5 text-[8px] rounded font-medium" style={{ backgroundColor: `${color}15`, color }}>System</span>
        </div>
      </div>

      <Handle type="source" position={Position.Right} id="sys-out"
        className="!w-3 !h-3 !rounded-full !border-2 !border-[#0F051D]" style={{ backgroundColor: color }} />
      <div className="absolute right-0 top-1/2 translate-x-[calc(100%+8px)] -translate-y-1/2 pointer-events-none">
        <span className="text-[9px] font-medium" style={{ color }}>System</span>
      </div>
    </motion.div>
  )
})
SystemPromptNodeContent.displayName = 'SystemPromptNode'

// ── Custom scrollbar CSS (injected via style) ───────────────────────────────
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
  `
  if (!document.querySelector('[data-custom-scrollbar]')) {
    style.setAttribute('data-custom-scrollbar', 'true')
    document.head.appendChild(style)
  }
}

// ── Export ───────────────────────────────────────────────────────────────────

export const ScriptNode = ScriptNodeContent
export const VoiceNode = VoiceNodeContent
export const ImageGenNode = ImageGenNodeContent
export const VideoGenNode = VideoGenNodeContent
export const CaptionNode = CaptionNodeContent
export const ExportNode = ExportNodeContent

export const nodeTypes = {
  scriptNode: ScriptNodeContent,
  voiceNode: VoiceNodeContent,
  imageGenNode: ImageGenNodeContent,
  videoGenNode: VideoGenNodeContent,
  captionNode: CaptionNodeContent,
  exportNode: ExportNodeContent,
  llmNode: LLMNodeContent,
  arrayNode: ArrayNodeContent,
  routerNode: RouterNodeContent,
  textIteratorNode: (props: any) => <IteratorTextNodeContent data={props.data} selected={props.selected} />,
  imageIteratorNode: (props: any) => <ImageIteratorNodeContent data={props.data} selected={props.selected} />,
  taskManagerNode: (props: any) => <TaskManagerNodeContent data={props.data} selected={props.selected} />,
  systemPromptNode: SystemPromptNodeContent,
  videoBriefNode: VideoBriefNodeContent,
  filmStripNode: FilmStripNodeContent,
  // Image Edit nodes (active/beta)
  fluxKontextNode: (props: any) => <ImageEditNodeContent {...props} data={{ ...props.data, config: { ...(props.data.config || {}), editType: 'kontext' } }} />,
  briaRemoveBgNode: (props: any) => <ImageEditNodeContent {...props} data={{ ...props.data, config: { ...(props.data.config || {}), editType: 'remove-bg' } }} />,
  upscaleNode: (props: any) => <ImageEditNodeContent {...props} data={{ ...props.data, config: { ...(props.data.config || {}), editType: 'upscale' } }} />,
  fluxFillProNode: (props: any) => <ImageEditNodeContent {...props} data={{ ...props.data, config: { ...(props.data.config || {}), editType: 'inpaint' } }} />,
  imageEditNode: ImageEditNodeContent,
  // Variable nodes (active)
  setVariableNode: SetVariableNodeContent,
  getVariableNode: GetVariableNodeContent,
  textFormatterNode: TextFormatterNodeContent,
  // Generic "soon" fallback for all other library nodes
  promptNode: SoonNodeContent,
  promptConcatNode: SoonNodeContent,
  promptEnhancerNode: SoonNodeContent,
  imageDescriberNode: SoonNodeContent,
  videoDescriberNode: SoonNodeContent,
  numberNode: SoonNodeContent,
  textValueNode: SoonNodeContent,
  toggleNode: SoonNodeContent,
  listSelectorNode: SoonNodeContent,
  seedNode: SoonNodeContent,
  // imageIteratorNode handled above
  videoIteratorNode: SoonNodeContent,
  importNode: SoonNodeContent,
  previewNode: SoonNodeContent,
  importModelNode: SoonNodeContent,
  importLoraNode: SoonNodeContent,
  importMultiLoraNode: SoonNodeContent,
  outputNode: SoonNodeContent,
  stickyNoteNode: SoonNodeContent,
  depthAnythingV2Node: SoonNodeContent,
  compareNode: SoonNodeContent,
  klingElementNode: SoonNodeContent,
  painterNode: SoonNodeContent,          // complex interactive tool
  videoConcatenatorNode: SoonNodeContent, // requires ffmpeg
  videoMaskByTextNode: SoonNodeContent,   // SAM2 video (soon)
  // Image gen soon nodes
  flux2DevLoraNode: SoonNodeContent,
  flux2ProNode: SoonNodeContent,
  flux2FlexNode: SoonNodeContent,
  reveNode: SoonNodeContent,
  higgsFieldImageNode: SoonNodeContent,
  gptImage15Node: SoonNodeContent,
  imagen4Node: SoonNodeContent,
  imagen3Node: SoonNodeContent,
  imagen3FastNode: SoonNodeContent,
  fluxPro11UltraNode: SoonNodeContent,
  fluxPro11Node: SoonNodeContent,
  fluxFastNode: SoonNodeContent,
  fluxDevLoraNode: SoonNodeContent,
  recraftV4Node: SoonNodeContent,
  recraftV3Node: SoonNodeContent,
  mysticNode: SoonNodeContent,
  ideogramV3CharNode: SoonNodeContent,
  sd35Node: SoonNodeContent,
  minimaxImage01Node: SoonNodeContent,
  briaNode: SoonNodeContent,
  lumaPhotonNode: SoonNodeContent,
  nvidiaStaticNode: SoonNodeContent,
  seedream5LiteNode: SoonNodeContent,
  // Image vector soon
  recraftVectorizerNode: SoonNodeContent,
  vectorizerNode: SoonNodeContent,
  recraftV3SvgNode: SoonNodeContent,
  textToVectorNode: SoonNodeContent,
  // Image edit soon
  nanoBanana2Node: SoonNodeContent,
  flux2MaxNode: SoonNodeContent,
  seedreamV45EditNode: SoonNodeContent,
  seedreamV5EditNode: SoonNodeContent,
  nanoBananaProNode: SoonNodeContent,
  qwenImageEditPlusNode: SoonNodeContent,
  reveEditNode: SoonNodeContent,
  nanoBananaNode: SoonNodeContent,
  runwayGen4ImageNode: SoonNodeContent,
  fluxKontextLoraNode: SoonNodeContent,
  gptImage15EditNode: SoonNodeContent,
  fluxKontextMultiNode: SoonNodeContent,
  seedEdit30Node: SoonNodeContent,
  flux2InpaintNode: SoonNodeContent,
  fluxDevLoraInpaintNode: SoonNodeContent,
  ideogramV3InpaintNode: SoonNodeContent,
  ideogramV2InpaintNode: SoonNodeContent,
  sd3InpaintNode: SoonNodeContent,
  briaInpaintNode: SoonNodeContent,
  fluxProOutpaintNode: SoonNodeContent,
  sd3OutpaintNode: SoonNodeContent,
  sd3RemoveBgNode: SoonNodeContent,
  sd3ContentFillNode: SoonNodeContent,
  briaContentFillNode: SoonNodeContent,
  kolorsVirtualTryOnNode: SoonNodeContent,
  replaceBgNode: SoonNodeContent,
  briaReplaceBgNode: SoonNodeContent,
  relight20Node: SoonNodeContent,
  qwenImageEdit2511Node: SoonNodeContent,
  // Image i2i — qwen & controlnet-lora still soon
  qwenMultiAngleNode: SoonNodeContent,
  fluxControlNetLoraNode: SoonNodeContent,
  // Image enhance soon
  topazImageUpscaleNode: SoonNodeContent,
  topazSharpenNode: SoonNodeContent,
  magnificSkinNode: SoonNodeContent,
  magnificUpscaleNode: SoonNodeContent,
  magnificPrecisionV2Node: SoonNodeContent,
  magnificPrecisionNode: SoonNodeContent,
  enhancorUpscaleNode: SoonNodeContent,
  enhancorSkinNode: SoonNodeContent,
  recraftCrispUpscaleNode: SoonNodeContent,
  // Video gen — active multi-model nodes (Faz 7)
  runwayGen4TurboNode: (props: any) => <MultiModelVideoNodeContent data={{ ...props.data, config: { ...(props.data.config || {}), model: 'runway-gen4' } }} selected={props.selected} />,
  veo31T2VNode: (props: any) => <MultiModelVideoNodeContent data={{ ...props.data, config: { ...(props.data.config || {}), model: 'veo3' } }} selected={props.selected} />,
  minimaxHailuo02Node: (props: any) => <MultiModelVideoNodeContent data={{ ...props.data, config: { ...(props.data.config || {}), model: 'minimax' } }} selected={props.selected} />,
  lumaRay2Node: (props: any) => <MultiModelVideoNodeContent data={{ ...props.data, config: { ...(props.data.config || {}), model: 'luma' } }} selected={props.selected} />,
  wanVideoNode: (props: any) => <MultiModelVideoNodeContent data={{ ...props.data, config: { ...(props.data.config || {}), model: 'wan' } }} selected={props.selected} />,
  // Video gen soon
  grokVideoNode: SoonNodeContent,
  veo31I2VNode: SoonNodeContent,
  seedanceV15ProNode: SoonNodeContent,
  sora2Node: SoonNodeContent,
  ltx2VideoNode: SoonNodeContent,
  higgsFieldVideoNode: SoonNodeContent,
  wan25Node: SoonNodeContent,
  wan22Node: SoonNodeContent,
  moonvalleyNode: SoonNodeContent,
  seedanceV10Node: SoonNodeContent,
  pixverseV45Node: SoonNodeContent,
  runwayGen4Node: SoonNodeContent,
  runwayGen45Node: SoonNodeContent,
  runwayGen3TurboNode: SoonNodeContent,
  kling3Node: SoonNodeContent,
  kling16Node: SoonNodeContent,
  klingVideoNode: SoonNodeContent,
  klingFirstLastNode: SoonNodeContent,
  veo2Node: SoonNodeContent,
  minimaxVideoDirectorNode: SoonNodeContent,
  minimaxVideo01Node: SoonNodeContent,
  lumaRay2FlashNode: SoonNodeContent,
  hunyuanVideoNode: SoonNodeContent,
  // Video v2v soon
  grokVideoEditNode: SoonNodeContent,
  ltx2V2VNode: SoonNodeContent,
  klingo3EditNode: SoonNodeContent,
  klingMotionNode: SoonNodeContent,
  klingo1EditNode: SoonNodeContent,
  klingo1ReferenceNode: SoonNodeContent,
  klingo1RefV2VNode: SoonNodeContent,
  runwayAlephNode: SoonNodeContent,
  runwayActTwoNode: SoonNodeContent,
  lumaReframeNode: SoonNodeContent,
  lumaModifyNode: SoonNodeContent,
  wan22AnimateReplaceNode: SoonNodeContent,
  wan22AnimateMoveNode: SoonNodeContent,
  wanVaceDepthNode: SoonNodeContent,
  wanVacePoseNode: SoonNodeContent,
  wanVaceReframeNode: SoonNodeContent,
  wanVaceOutpaintNode: SoonNodeContent,
  hunyuanV2VNode: SoonNodeContent,
  // Lipsync soon
  omnihumanV15Node: SoonNodeContent,
  sync2ProNode: SoonNodeContent,
  klingAiAvatarNode: SoonNodeContent,
  pixverseLipsyncNode: SoonNodeContent,
  // Video Edit — active nodes (fal.ai)
  lipSyncLatentSyncNode: LipSyncNodeContent,
  videoToVideoWanNode: VideoToVideoNodeContent,
  videoUpscaleNode: VideoUpscaleNodeContent,
  videoEnhanceRifeNode: VideoEnhanceNodeContent,
  // Video enhance soon
  topazVideoUpscaleNode: SoonNodeContent,
  briaVideoUpscaleNode: SoonNodeContent,
  realEsrganVideoNode: SoonNodeContent,
  videoSmootherNode: SoonNodeContent,
  // 3D soon
  meshyV6Node: SoonNodeContent,
  sam3DObjectsNode: SoonNodeContent,
  rodinV2Node: SoonNodeContent,
  rodinNode: SoonNodeContent,
  hunyuan3DV3Node: SoonNodeContent,
  hunyuan3DV21Node: SoonNodeContent,
  hunyuan3DV20Node: SoonNodeContent,
  trellis3DV2Node: SoonNodeContent,
  trellisNode: SoonNodeContent,
  // Community soon
  wan21WithLoraNode: SoonNodeContent,
  sd3ControlNetsNode: SoonNodeContent,
  ipAdapterSdxlNode: SoonNodeContent,
  wan211Vid2VidNode: SoonNodeContent,
  dreamshaperNode: SoonNodeContent,
  videoUtilitiesNode: SoonNodeContent,
  dreamshaperV8Node: SoonNodeContent,
  sdxlLightning4StepNode: SoonNodeContent,
  realEsrganUpscaleNode: SoonNodeContent,
  faceAlignNode: SoonNodeContent,
  dynavisionNode: SoonNodeContent,
  sdxlControlNetNode: SoonNodeContent,
  addLogoNode: SoonNodeContent,
  elevenLabsVoiceChangerNode: SoonNodeContent,
  controlLcmNode: SoonNodeContent,
  gfpganVideoNode: SoonNodeContent,
  expressionEditorNode: SoonNodeContent,
  robustVideoMattingNode: SoonNodeContent,
  realisticVisionNode: SoonNodeContent,
  sd3ExplorerNode: SoonNodeContent,
  recraftCreativeUpscaleNode: SoonNodeContent,
  zDepthExtractorNode: SoonNodeContent,
  animatedDiffNode: SoonNodeContent,
  tooncrafterNode: SoonNodeContent,
  tripoSRNode: ThreeDNodeContent,
  // 3D active nodes — Faz 8
  triposrNode: ThreeDNodeContent,
  hyper3dNode: ThreeDNodeContent,
  // Audio generation — Faz 8
  stableAudioNode: AudioGenNodeContent,
  sunoNode: AudioGenNodeContent,
  // Voice clone — Faz 8
  fishAudioCloneNode: VoiceCloneNodeContent,
  elevenLabsCloneNode: VoiceCloneNodeContent,
  // Image I2I — Faz A
  fluxDevReduxNode: ImageI2INodeContent,
  fluxCannyProNode: ImageI2INodeContent,
  fluxDepthProNode: ImageI2INodeContent,
  img2ImgSdNode: ImageI2INodeContent,
  sdControlNetsNode: ImageI2INodeContent,
  sketchToImageNode: ImageI2INodeContent,
  // Toolbox Editing — Faz A-2
  levelsNode: ToolboxNodeContent,
  cropNode: ToolboxNodeContent,
  resizeNode: ToolboxNodeContent,
  blurNode: ToolboxNodeContent,
  invertNode: ToolboxNodeContent,
  channelsNode: ToolboxNodeContent,
  compositorNode: ToolboxNodeContent,
  extractVideoFrameNode: ToolboxNodeContent,
  // Toolbox Matte — Faz A-2
  maskExtractorNode: ToolboxNodeContent,
  maskByTextNode: ToolboxNodeContent,
  matteGrowShrinkNode: ToolboxNodeContent,
  mergeAlphaNode: ToolboxNodeContent,
  videoMatteNode: ToolboxNodeContent,
  fluxReduxControlNetNode: SoonNodeContent,
  sdxlConsistentCharNode: SoonNodeContent,
  sdxlMultiControlNetLoraNode: SoonNodeContent,
  xlabsFluxDevNode: SoonNodeContent,
  klingLipSyncCommunityNode: SoonNodeContent,
  ultimateSdUpscaleNode: SoonNodeContent,
  faceSwapNode: SoonNodeContent,
  mergeAudioVideoNode: SoonNodeContent,
  clarityUpscaleNode: SoonNodeContent,
  idPreservationFluxNode: SoonNodeContent,
  videoToAudioNode: SoonNodeContent,
  increaseFrameRateNode: SoonNodeContent,
  videoSmootherCommunityNode: SoonNodeContent,
}
