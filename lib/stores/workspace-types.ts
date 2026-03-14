// ============================================================================
// Workspace Store — Type definitions (extracted for reusability)
// Import from here in components; workspace-store.ts re-exports these.
// ============================================================================

export type NodeStatus = 'idle' | 'pending' | 'processing' | 'ready' | 'failed'

// ── Per-node configuration schemas ──────────────────────────────────────────

export interface ScriptConfig {
  model: 'gpt-4o' | 'gemini-2.0' | 'claude-3.5'
  language: string
  sceneCount: number
  prompt?: string
}

export interface VoiceConfig {
  source: 'preset' | 'upload'
  voiceId: string
  voiceName: string
  uploadUrl?: string
  speed: number
  language: string
  engine: 'openai-tts' | 'elevenlabs' | 'fal-tts'
  text?: string
}

export interface ImageGenConfig {
  model: string
  resolution: '512x512' | '768x768' | '1024x1024' | '1024x1792' | 'custom'
  style: string
  prompt?: string
}

export interface VideoGenConfig {
  model: string
  resolution: '720p' | '1080p' | '4k'
  duration: 5 | 10 | 15
  fps: 24 | 30
  prompt?: string
}

export interface CaptionConfig {
  language: string
  style: 'minimal' | 'bold' | 'subtitle' | 'karaoke'
  position: 'bottom' | 'top' | 'center'
}

export interface ExportConfig {
  format: 'mp4' | 'webm' | 'mov'
  quality: '720p' | '1080p' | '4k'
  includeAudio: boolean
  includeCaptions: boolean
}

// ── Logical Nodes ─────────────────────────────────
export interface LLMConfig { model: string; systemPrompt?: string }
export interface ArrayConfig { items: string[] }
export interface RouterConfig { rules: string[] }
export interface TextIteratorConfig { batchSize: number }
export interface SystemPromptConfig { content: string }

// ── Iterator Nodes ────────────────────────────────
export interface IteratorConfig {
  items?: string
  prompts?: string
  model?: string
  tasks?: Array<{ id: string; label: string; status: string; credits?: number }>
}

// ── Image Edit Nodes ──────────────────────────────
export interface ImageEditConfig {
  editType: 'kontext' | 'remove-bg' | 'upscale' | 'inpaint'
  imageUrl?: string
  prompt?: string
  maskUrl?: string
  scale?: number
}

// ── Video Edit Nodes ──────────────────────────────
export interface VideoEditConfig {
  editType: 'lipsync' | 'v2v' | 'upscale' | 'enhance'
  videoUrl?: string
  audioUrl?: string
  prompt?: string
  strength?: number
  scale?: number
}

// ── Special Nodes (3D, Audio, Voice Clone) ─────────
export interface SpecialNodeConfig {
  model?: string
  prompt?: string
  imageUrl?: string
  type?: string
  style?: string
  duration?: number
  provider?: string
  text?: string
  referenceAudioUrl?: string
  voiceId?: string
}

// ── Video Studio nodes ────────────────────────────
export interface VideoBriefConfig {
  prompt: string
  theme: string
  purpose: string
  audience: string
  visualStyle: string
  narrator: string
  character: string
  characterImageUrls: Record<string, string>
  music: string
  captions: string
  sceneMedia: string
  duration: string
  aspect: string
  platform: string
  outline: string[]
  autoGenerate?: boolean
  cachedScenes?: FilmStripScene[]
}

export interface FilmStripScene {
  id: string
  description: string
  duration: number
  script?: string
  imageUrl?: string
  audioUrl?: string
  videoUrl?: string
  status?: string
}

export interface FilmStripConfig {
  scenes: FilmStripScene[]
  narratorVoiceId?: string
  visualStyle?: string
  generationPhase?: 'idle' | 'tts' | 'images' | 'exporting' | 'done'
  generationProgress?: number
  captionsEnabled?: boolean
  captionStyle?: string
  musicTrack?: string
  exportedVideoUrl?: string
}

export type AnyNodeConfig =
  | ScriptConfig
  | VoiceConfig
  | ImageGenConfig
  | VideoGenConfig
  | CaptionConfig
  | ExportConfig
  | LLMConfig
  | ArrayConfig
  | RouterConfig
  | TextIteratorConfig
  | SystemPromptConfig
  | VideoBriefConfig
  | FilmStripConfig
  | ImageEditConfig
  | VideoEditConfig
  | IteratorConfig
  | SpecialNodeConfig

export interface NodeData {
  label: string
  type: string
  status: NodeStatus
  config: AnyNodeConfig
  outputUrl?: string
  error?: string
  creditsCost?: number
}
