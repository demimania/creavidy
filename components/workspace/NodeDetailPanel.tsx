'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Play, Trash2, Upload, ChevronDown, Coins, Download, ExternalLink } from 'lucide-react'
import {
  useWorkspaceStore,
  NODE_COLORS,
  type NodeData,
  type ScriptConfig,
  type VoiceConfig,
  type ImageGenConfig,
  type VideoGenConfig,
  type CaptionConfig,
  type ExportConfig,
} from '@/lib/stores/workspace-store'
import type { Node } from 'reactflow'
import { executeSingleNode } from '@/lib/ai/execution-engine'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

// ── Credit costs per model ───────────────────────────────────────────────────
const CREDIT_COSTS: Record<string, number> = {
  // Script
  'gpt-4o': 5, 'gemini-2.0': 4, 'claude-3.5': 5,
  // Image
  'flux-schnell': 5, 'flux-pro': 12, 'flux-kontext': 15, 'recraft-v4': 10, 'sd-3.5': 8,
  'nano-banana-2': 8, 'dall-e-3': 20, 'midjourney': 25, 'imagine-art': 10,
  // Video
  'kling-2.5-turbo': 25, 'kling-2.0-master': 30, 'veo-3': 50, 'veo-3.1': 55,
  'ltx-2.3': 20, 'ltx-2-19b': 22, 'minimax-hailuo': 28, 'luma-dream': 35,
  'hunyuan': 20, 'mochi-1': 15,
  // Voice
  'elevenlabs': 5, 'openai-tts': 3, 'fal-tts': 2,
}

function creditCost(model: string): number {
  return CREDIT_COSTS[model] || 10
}

// ── Shared UI ────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1.5">{children}</label>
}

function Dropdown({ label, value, options, onChange, color }: {
  label: string; value: string; options: { value: string; label: string; credits?: number }[]; onChange: (v: string) => void; color: string
}) {
  const [open, setOpen] = useState(false)
  const selected = options.find(o => o.value === value)

  return (
    <div className="relative">
      <SectionLabel>{label}</SectionLabel>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white hover:border-white/20 transition-all">
        <span>{selected?.label || value}</span>
        <div className="flex items-center gap-1.5">
          {selected?.credits !== undefined && selected.credits > 0 && (
            <span className="text-[9px] text-[#D1FE17] font-medium">{selected.credits}cr</span>
          )}
          <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-lg bg-[#1a0d2e] border border-white/15 shadow-xl z-50 py-1 max-h-[220px] overflow-y-auto">
          {options.map(opt => (
            <button key={opt.value} onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`w-full flex items-center justify-between px-3 py-2 text-[11px] transition-all ${value === opt.value ? 'font-semibold' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
              style={value === opt.value ? { color, backgroundColor: `${color}10` } : undefined}>
              <span>{opt.label}</span>
              {opt.credits !== undefined && opt.credits > 0 && (
                <span className="text-[9px] flex items-center gap-0.5" style={{ color: value === opt.value ? color : '#D1FE17' }}>
                  <Coins className="w-2.5 h-2.5" />{opt.credits}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer py-1">
      <span className="text-xs text-zinc-300">{label}</span>
      <div className={`w-8 h-[18px] p-0.5 rounded-full transition-colors cursor-pointer ${checked ? 'bg-[#D1FE17]' : 'bg-white/10'}`} onClick={() => onChange(!checked)}>
        <div className={`w-[14px] h-[14px] rounded-full transition-transform ${checked ? 'translate-x-[14px] bg-black' : 'bg-zinc-500'}`} />
      </div>
    </label>
  )
}

// ── Script Settings ──────────────────────────────────────────────────────────

function ScriptSettings({ node }: { node: Node<NodeData> }) {
  const { updateNodeConfig } = useWorkspaceStore()
  const config = node.data.config as ScriptConfig

  return (
    <>
      <div>
        <SectionLabel>Script Prompt</SectionLabel>
        <textarea
          className="w-full h-20 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-xs text-white resize-none focus:outline-none focus:border-[#FF2D78]/40 placeholder:text-zinc-600"
          placeholder="Describe your video topic..."
          value={config.prompt || ''}
          onChange={(e) => updateNodeConfig(node.id, { prompt: e.target.value })}
        />
      </div>
      <Dropdown label="AI Model" value={config.model} color={NODE_COLORS.script}
        options={[
          { value: 'gpt-4o', label: 'GPT-4o', credits: 5 },
          { value: 'gemini-2.0', label: 'Gemini 2.0', credits: 4 },
          { value: 'claude-3.5', label: 'Claude 3.5', credits: 5 },
        ]}
        onChange={(v) => updateNodeConfig(node.id, { model: v })} />
      <Dropdown label="Language" value={config.language} color={NODE_COLORS.script}
        options={[{ value: 'English', label: '🇺🇸 English' }, { value: 'Turkish', label: '🇹🇷 Turkish' }, { value: 'German', label: '🇩🇪 German' }, { value: 'Spanish', label: '🇪🇸 Spanish' }]}
        onChange={(v) => updateNodeConfig(node.id, { language: v })} />
      <Dropdown label="Scene Count" value={String(config.sceneCount)} color={NODE_COLORS.script}
        options={[{ value: '3', label: '3 scenes' }, { value: '5', label: '5 scenes' }, { value: '8', label: '8 scenes' }, { value: '12', label: '12 scenes' }]}
        onChange={(v) => updateNodeConfig(node.id, { sceneCount: Number(v) })} />
    </>
  )
}

// ── Voice Settings ───────────────────────────────────────────────────────────

function VoiceSettings({ node }: { node: Node<NodeData> }) {
  const { updateNodeConfig } = useWorkspaceStore()
  const config = node.data.config as VoiceConfig
  const fileInput = useRef<HTMLInputElement>(null)

  return (
    <>
      <Dropdown label="Source" value={config.source} color={NODE_COLORS.voice}
        options={[{ value: 'preset', label: '🎙 Character Preset' }, { value: 'upload', label: '📤 Upload Your Voice' }]}
        onChange={(v) => updateNodeConfig(node.id, { source: v })} />

      {config.source === 'preset' ? (
        <Dropdown label="Character" value={config.voiceId} color={NODE_COLORS.voice}
          options={[
            { value: 'rachel', label: '♀ Rachel (EN)', credits: 5 },
            { value: 'adam', label: '♂ Adam (EN)', credits: 5 },
            { value: 'arda', label: '♂ Arda (TR)', credits: 5 },
            { value: 'elif', label: '♀ Elif (TR)', credits: 5 },
            { value: 'nova', label: '♀ Nova (EN)', credits: 3 },
            { value: 'echo', label: '♂ Echo (EN)', credits: 3 },
          ]}
          onChange={(v) => {
            const names: Record<string, string> = { rachel: 'Rachel', adam: 'Adam', arda: 'Arda', elif: 'Elif', nova: 'Nova', echo: 'Echo' }
            updateNodeConfig(node.id, { voiceId: v, voiceName: names[v] || v })
          }} />
      ) : (
        <div>
          <SectionLabel>Upload Audio</SectionLabel>
          <input
            ref={fileInput}
            type="file"
            accept=".mp3,.wav,.m4a,.ogg"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                updateNodeConfig(node.id, { voiceName: file.name, source: 'upload' })
              }
            }}
          />
          <button
            onClick={() => fileInput.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-5 rounded-xl border-2 border-dashed border-white/10 text-xs text-zinc-500 hover:border-[#a78bfa]/40 hover:text-[#a78bfa] transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />Drop or click to upload .mp3 / .wav
          </button>
          {config.voiceName && config.source === 'upload' && (
            <p className="text-[10px] text-[#a78bfa] mt-1.5">📎 {config.voiceName}</p>
          )}
        </div>
      )}

      <Dropdown label="TTS Engine" value={config.engine || 'openai-tts'} color={NODE_COLORS.voice}
        options={[
          { value: 'openai-tts', label: 'OpenAI TTS', credits: 3 },
          { value: 'elevenlabs', label: 'ElevenLabs', credits: 5 },
          { value: 'fal-tts', label: 'fal TTS', credits: 2 },
        ]}
        onChange={(v) => updateNodeConfig(node.id, { engine: v })} />

      <Dropdown label="Speed" value={String(config.speed)} color={NODE_COLORS.voice}
        options={[{ value: '0.8', label: '0.8x Slow' }, { value: '1', label: '1x Normal' }, { value: '1.2', label: '1.2x Fast' }, { value: '1.5', label: '1.5x Rapid' }]}
        onChange={(v) => updateNodeConfig(node.id, { speed: Number(v) })} />

      <div>
        <SectionLabel>Standalone Text (no input connected)</SectionLabel>
        <textarea
          className="w-full h-16 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-300 resize-none focus:outline-none focus:border-[#a78bfa]/40 placeholder:text-zinc-600"
          placeholder="Text to convert to speech..."
          value={config.text || ''}
          onChange={(e) => updateNodeConfig(node.id, { text: e.target.value })}
        />
      </div>
    </>
  )
}

// ── Image Gen Settings ───────────────────────────────────────────────────────

function ImageGenSettings({ node }: { node: Node<NodeData> }) {
  const { updateNodeConfig } = useWorkspaceStore()
  const config = node.data.config as ImageGenConfig

  return (
    <>
      <div>
        <SectionLabel>Image Prompt</SectionLabel>
        <textarea
          className="w-full h-20 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-300 resize-none focus:outline-none focus:border-[#FFE744]/40 placeholder:text-zinc-600"
          placeholder="Describe the image to generate..."
          value={config.prompt || ''}
          onChange={(e) => updateNodeConfig(node.id, { prompt: e.target.value })}
        />
      </div>
      <Dropdown label="AI Model" value={config.model} color={NODE_COLORS.imageGen}
        options={[
          { value: 'flux-schnell', label: 'Flux Schnell (Fast)', credits: 5 },
          { value: 'flux-pro', label: 'Flux Pro v1.1', credits: 12 },
          { value: 'flux-2-pro', label: 'Flux 2 Pro', credits: 22 },
          { value: 'flux-kontext', label: 'Flux Kontext', credits: 15 },
          { value: 'recraft-v4', label: 'Recraft V4', credits: 10 },
          { value: 'sd-3.5', label: 'Stable Diffusion 3.5', credits: 8 },
          { value: 'imagine-art', label: 'ImagineArt 1.5', credits: 10 },
          { value: 'seedream-5.0-lite', label: 'Seedream 5.0 Lite', credits: 18 },
          { value: 'ideogram-v3', label: 'Ideogram V3', credits: 10 },
        ]}
        onChange={(v) => updateNodeConfig(node.id, { model: v })} />
      <Dropdown label="Resolution" value={config.resolution} color={NODE_COLORS.imageGen}
        options={[
          { value: '512x512', label: '512×512' },
          { value: '768x768', label: '768×768' },
          { value: '1024x1024', label: '1024×1024' },
          { value: '1024x1792', label: '1024×1792 (Portrait)' },
        ]}
        onChange={(v) => updateNodeConfig(node.id, { resolution: v })} />
    </>
  )
}

// ── Video Gen Settings ───────────────────────────────────────────────────────

function VideoGenSettings({ node }: { node: Node<NodeData> }) {
  const { updateNodeConfig } = useWorkspaceStore()
  const config = node.data.config as VideoGenConfig

  return (
    <>
      <div>
        <SectionLabel>Video Prompt</SectionLabel>
        <textarea
          className="w-full h-20 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-300 resize-none focus:outline-none focus:border-[#D1FE17]/40 placeholder:text-zinc-600"
          placeholder="Describe the video to generate..."
          value={config.prompt || ''}
          onChange={(e) => updateNodeConfig(node.id, { prompt: e.target.value })}
        />
      </div>
      <Dropdown label="AI Model" value={config.model} color={NODE_COLORS.videoGen}
        options={[
          { value: 'kling-3.0-standard-t2v', label: 'Kling 3.0 Standard (T2V)', credits: 35 },
          { value: 'kling-3.0-standard-i2v', label: 'Kling 3.0 Standard (I2V)', credits: 35 },
          { value: 'kling-3.0-pro-t2v', label: 'Kling 3.0 Pro (T2V)', credits: 45 },
          { value: 'kling-2.5-turbo', label: 'Kling 2.5 Turbo (I2V)', credits: 25 },
          { value: 'kling-2.0-master', label: 'Kling 2.0 Master (T2V)', credits: 30 },
          { value: 'wan-2.6-t2v', label: 'Wan 2.6 (T2V)', credits: 22 },
          { value: 'wan-2.6-i2v', label: 'Wan 2.6 (I2V)', credits: 22 },
          { value: 'seedance-1.5-pro-t2v', label: 'Seedance 1.5 Pro (T2V)', credits: 28 },
          { value: 'ltx-2.3', label: 'LTX 2.3 (Fast)', credits: 20 },
          { value: 'ltx-2-19b', label: 'LTX 2 19B', credits: 22 },
          { value: 'minimax-hailuo', label: 'MiniMax Hailuo', credits: 28 },
          { value: 'luma-dream', label: 'Luma Dream Machine', credits: 35 },
          { value: 'hunyuan', label: 'Hunyuan Video', credits: 20 },
          { value: 'mochi-1', label: 'Mochi 1', credits: 15 },
          { value: 'sora-2-pro', label: 'Sora 2 Pro', credits: 60 },
          { value: 'veo-3', label: 'Veo 3 (Google)', credits: 50 },
        ]}
        onChange={(v) => updateNodeConfig(node.id, { model: v })} />
      <Dropdown label="Duration" value={String(config.duration)} color={NODE_COLORS.videoGen}
        options={[{ value: '5', label: '5 seconds' }, { value: '10', label: '10 seconds' }, { value: '15', label: '15 seconds' }]}
        onChange={(v) => updateNodeConfig(node.id, { duration: Number(v) })} />
      <Dropdown label="Frame Rate" value={String(config.fps)} color={NODE_COLORS.videoGen}
        options={[{ value: '24', label: '24 fps (Cinema)' }, { value: '30', label: '30 fps (Standard)' }]}
        onChange={(v) => updateNodeConfig(node.id, { fps: Number(v) })} />
    </>
  )
}

// ── Caption Settings ─────────────────────────────────────────────────────────

function CaptionSettings({ node }: { node: Node<NodeData> }) {
  const { updateNodeConfig } = useWorkspaceStore()
  const config = node.data.config as CaptionConfig
  return (
    <>
      <Dropdown label="Caption Style" value={config.style} color={NODE_COLORS.caption}
        options={[{ value: 'minimal', label: 'Minimal' }, { value: 'bold', label: 'Bold' }, { value: 'subtitle', label: 'Classic Subtitle' }, { value: 'karaoke', label: 'Karaoke' }]}
        onChange={(v) => updateNodeConfig(node.id, { style: v })} />
      <Dropdown label="Position" value={config.position} color={NODE_COLORS.caption}
        options={[{ value: 'bottom', label: 'Bottom' }, { value: 'top', label: 'Top' }, { value: 'center', label: 'Center' }]}
        onChange={(v) => updateNodeConfig(node.id, { position: v })} />
    </>
  )
}

// ── Export Settings ──────────────────────────────────────────────────────────

function ExportSettings({ node }: { node: Node<NodeData> }) {
  const { updateNodeConfig } = useWorkspaceStore()
  const config = node.data.config as ExportConfig
  return (
    <>
      <Dropdown label="Format" value={config.format} color={NODE_COLORS.export}
        options={[{ value: 'mp4', label: 'MP4' }, { value: 'webm', label: 'WebM' }, { value: 'mov', label: 'MOV (Apple)' }]}
        onChange={(v) => updateNodeConfig(node.id, { format: v })} />
      <Dropdown label="Quality" value={config.quality} color={NODE_COLORS.export}
        options={[{ value: '720p', label: '720p' }, { value: '1080p', label: '1080p' }, { value: '4k', label: '4K' }]}
        onChange={(v) => updateNodeConfig(node.id, { quality: v })} />
      <div className="space-y-1">
        <SectionLabel>Include</SectionLabel>
        <Toggle label="🔊 Audio track" checked={config.includeAudio} onChange={(v) => updateNodeConfig(node.id, { includeAudio: v })} />
        <Toggle label="📝 Captions" checked={config.includeCaptions} onChange={(v) => updateNodeConfig(node.id, { includeCaptions: v })} />
      </div>
    </>
  )
}

// ── Output Preview ────────────────────────────────────────────────────────────

function OutputPreview({ node, color }: { node: Node<NodeData>; color: string }) {
  const { outputUrl, type, error } = node.data

  if (error) {
    return (
      <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
        <p className="text-[10px] text-red-400 font-medium mb-1">Error</p>
        <p className="text-[10px] text-red-300 break-words">{error}</p>
      </div>
    )
  }

  if (!outputUrl) return null

  const isImage = type === 'imageGen'
  const isVideo = type === 'videoGen' || type === 'export'
  const isAudio = type === 'voice'
  const isScript = type === 'script'

  return (
    <div className="rounded-xl overflow-hidden border border-white/10 bg-black/30">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/8">
        <span className="text-[10px] font-medium" style={{ color }}>Output</span>
        <div className="flex items-center gap-1.5">
          <a
            href={isAudio && outputUrl.startsWith('data:') ? undefined : outputUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded hover:bg-white/10 transition-colors text-zinc-500 hover:text-white"
            title="Open in new tab"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href={outputUrl}
            download={`creavidy-${type}-output`}
            className="p-1 rounded hover:bg-white/10 transition-colors text-zinc-500 hover:text-white"
            title="Download"
          >
            <Download className="w-3 h-3" />
          </a>
        </div>
      </div>

      {isImage && (
        <img
          src={outputUrl}
          alt="Generated output"
          className="w-full object-cover max-h-48"
        />
      )}

      {isVideo && (
        <video
          src={outputUrl}
          controls
          className="w-full max-h-40"
          preload="metadata"
        />
      )}

      {isAudio && (
        <div className="p-3">
          <audio src={outputUrl} controls className="w-full h-8" style={{ height: '32px' }} />
        </div>
      )}

      {isScript && (
        <div className="p-3 max-h-36 overflow-y-auto">
          <pre className="text-[10px] text-zinc-300 whitespace-pre-wrap break-words font-mono">
            {(() => {
              try { return JSON.stringify(JSON.parse(outputUrl), null, 2) }
              catch { return outputUrl }
            })()}
          </pre>
        </div>
      )}

      {!isImage && !isVideo && !isAudio && !isScript && outputUrl && (
        <div className="p-3">
          <p className="text-[10px] text-zinc-400 break-all">{outputUrl.substring(0, 100)}{outputUrl.length > 100 ? '...' : ''}</p>
        </div>
      )}
    </div>
  )
}

// ── Settings Router ──────────────────────────────────────────────────────────

const SETTINGS_MAP: Record<string, React.ComponentType<{ node: Node<NodeData> }>> = {
  script: ScriptSettings, voice: VoiceSettings, imageGen: ImageGenSettings,
  videoGen: VideoGenSettings, caption: CaptionSettings, export: ExportSettings,
}

// ── Credit estimation ────────────────────────────────────────────────────────

function getNodeCredit(node: Node<NodeData>): number {
  const config = node.data.config as any
  if (!config) return 0
  if (config.model) return creditCost(config.model)
  return 0
}

// ── Main Panel ───────────────────────────────────────────────────────────────

export function NodeDetailPanel() {
  const { nodes, selectedNodeId, removeNode } = useWorkspaceStore()
  const selectedNode = nodes.find(n => n.id === selectedNodeId)

  if (!selectedNode) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <p className="text-xs text-zinc-600 text-center">Click a node on the canvas to see its settings</p>
      </div>
    )
  }

  const color = NODE_COLORS[selectedNode.data.type] || '#a78bfa'
  const SettingsComponent = SETTINGS_MAP[selectedNode.data.type]
  const estimatedCredits = getNodeCredit(selectedNode)

  return (
    <motion.div key={selectedNode.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex-1 overflow-y-auto">
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">{selectedNode.data.label}</h3>
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
        </div>

        {/* Credit cost estimate */}
        {estimatedCredits > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#D1FE17]/5 border border-[#D1FE17]/15">
            <Coins className="w-3.5 h-3.5 text-[#D1FE17]" />
            <span className="text-[11px] text-[#D1FE17] font-medium">~{estimatedCredits} credits per run</span>
          </div>
        )}

        <div>
          <SectionLabel>Status</SectionLabel>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${
            selectedNode.data.status === 'ready' ? 'bg-[#D1FE17]/15 text-[#D1FE17]' :
            selectedNode.data.status === 'processing' ? 'bg-[#0ea5e9]/15 text-[#0ea5e9]' :
            selectedNode.data.status === 'failed' ? 'bg-red-500/15 text-red-400' :
            'bg-white/5 text-zinc-500'
          }`}>{selectedNode.data.status}</span>
        </div>

        {/* Output preview — shown when node has run */}
        {(selectedNode.data.outputUrl || selectedNode.data.error) && (
          <OutputPreview node={selectedNode} color={color} />
        )}

        <div className="h-px bg-white/8" />

        {SettingsComponent && <SettingsComponent node={selectedNode} />}

        <div className="h-px bg-white/8" />

        <button onClick={async () => {
            if (selectedNode.data.status === 'processing') return
            try {
              const res = await executeSingleNode(selectedNode.id)
              if (res.success) toast.success(`${selectedNode.data.label} executed successfully`)
              else toast.error(`Execution failed: ${res.error}`)
            } catch (err: any) {
              toast.error(err.message || 'Execution error')
            }
          }}
          disabled={selectedNode.data.status === 'processing'}
          className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
          {selectedNode.data.status === 'processing' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
          {selectedNode.data.status === 'processing' ? 'Processing...' : 'Execute Node'}
          {estimatedCredits > 0 && selectedNode.data.status !== 'processing' && <span className="text-[9px] opacity-70">({estimatedCredits} cr)</span>}
        </button>

        <button onClick={() => removeNode(selectedNode.id)}
          className="w-full py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors">
          <Trash2 className="w-3 h-3" />Delete Node
        </button>
      </div>
    </motion.div>
  )
}
