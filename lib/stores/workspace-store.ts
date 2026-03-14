// ============================================================================
// Workspace Store — Node canvas state, connection rules, node configs,
// agent conversation, brief management, storyboard state
// ============================================================================
import { create } from 'zustand'
import type { Node, Edge } from 'reactflow'
import type { ChatMessageData } from '@/components/chat/ChatMessage'
import type { StoryboardData, ToolCallName, ToolCallStatus } from '@/lib/ai/tool-call-types'

// ── Node colors ──────────────────────────────────────────────────────────────
export const NODE_COLORS: Record<string, string> = {
  script: '#FF2D78',
  voice: '#a78bfa',
  imageGen: '#FFE744',
  videoGen: '#D1FE17',
  caption: '#0ea5e9',
  export: '#D1FE17',
  llm: '#f43f5e',
  array: '#3b82f6',
  router: '#f59e0b',
  textIterator: '#10b981',
  systemPrompt: '#8b5cf6',
  videoBrief: '#3b82f6',
  filmStrip: '#f59e0b',
  imageEdit: '#f43f5e',
  videoEdit: '#22d3ee',
}

// ── Connection rules: which source types can connect to which targets ────────
export const CONNECTION_RULES: Record<string, string[]> = {
  script: ['voice', 'imageGen', 'videoGen', 'llm', 'textIterator', 'array', 'router'],
  voice: ['videoGen', 'export'],
  imageGen: ['videoGen', 'llm', 'imageEdit'],
  videoGen: ['caption', 'export'],
  caption: ['export'],
  export: [],
  llm: ['script', 'voice', 'imageGen', 'videoGen', 'array', 'router', 'textIterator'],
  array: ['textIterator', 'llm', 'script', 'router'],
  router: ['llm', 'script', 'voice', 'imageGen', 'videoGen'],
  textIterator: ['llm', 'script', 'imageGen'],
  systemPrompt: ['llm', 'script'],
  videoBrief: ['filmStrip'],
  filmStrip: ['export', 'caption', 'array', 'router'],
  imageEdit: ['videoGen', 'imageGen', 'export'],
}

export type NodeStatus = 'idle' | 'pending' | 'processing' | 'ready' | 'failed'

// ── Per-node configuration schemas ──────────────────────────────────────────
export interface ScriptConfig {
  model: 'gpt-4o' | 'gemini-2.0' | 'claude-3.5'
  language: string
  sceneCount: number
  prompt?: string;
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

// ── CapCut-style nodes ────────────────────────────
export interface VideoBriefConfig {
  prompt: string;
  theme: string;
  purpose: string;
  audience: string;
  visualStyle: string;
  narrator: string;
  character: string;
  characterImageUrls: Record<string, string>;
  music: string;
  captions: string;
  sceneMedia: string;
  duration: string;
  aspect: string;
  platform: string;
  outline: string[];
  autoGenerate?: boolean;
  cachedScenes?: any[];
}

export interface FilmStripConfig {
  scenes: {
    id: string;
    description: string;
    duration: number;
    script?: string;
    imageUrl?: string;
    audioUrl?: string;
    videoUrl?: string;
    status?: string;
  }[];
  narratorVoiceId?: string;
  visualStyle?: string;
  generationPhase?: 'idle' | 'tts' | 'images' | 'exporting' | 'done';
  generationProgress?: number;
  captionsEnabled?: boolean;
  captionStyle?: string;
  musicTrack?: string;
  exportedVideoUrl?: string;
}

export type AnyNodeConfig = ScriptConfig | VoiceConfig | ImageGenConfig | VideoGenConfig | CaptionConfig | ExportConfig | LLMConfig | ArrayConfig | RouterConfig | TextIteratorConfig | SystemPromptConfig | VideoBriefConfig | FilmStripConfig | ImageEditConfig | VideoEditConfig

export interface NodeData {
  label: string
  type: string
  status: NodeStatus
  config: AnyNodeConfig
  outputUrl?: string
  error?: string
  creditsCost?: number
}

// ── Agent (conversation) state ────────────────────────────────────────────────
export interface AgentState {
  messages: ChatMessageData[]
  isStreaming: boolean
  currentToolCall: { name: ToolCallName; status: ToolCallStatus } | null
}

// ── Brief management (per-node brief data) ──────────────────────────────────
export interface BriefEntry {
  nodeId: string
  data: VideoBriefConfig
  storyboard: StoryboardData | null
  videoUrl: string | null
  createdAt: number
  updatedAt: number
}

interface WorkspaceState {
  projectId: string | null
  projectTitle: string
  nodes: Node<NodeData>[]
  edges: Edge[]
  selectedNodeId: string | null
  highlightedNodeId: string | null

  // Context menu
  contextMenu: { x: number; y: number; canvasX: number; canvasY: number } | null

  // Agent conversation state
  agent: AgentState

  // Brief store (nodeId → BriefEntry)
  briefs: Record<string, BriefEntry>

  // Variable store
  variables: Record<string, string>
  setVariable: (name: string, value: string) => void
  getVariable: (name: string) => string | undefined

  setProjectId: (id: string) => void
  setProjectTitle: (title: string) => void
  setNodes: (nodes: Node<NodeData>[]) => void
  setEdges: (edges: Edge[]) => void
  selectNode: (id: string | null) => void
  highlightNode: (id: string | null) => void
  updateNodeConfig: (nodeId: string, config: Record<string, unknown>) => void
  updateNodeStatus: (nodeId: string, status: NodeStatus) => void
  updateNodeOutput: (nodeId: string, outputUrl: string) => void
  updateNodeError: (nodeId: string, error: string) => void
  addNode: (node: Node<NodeData>) => void
  removeNode: (nodeId: string) => void
  duplicateNode: (nodeId: string) => void
  setContextMenu: (menu: { x: number; y: number; canvasX: number; canvasY: number } | null) => void

  // Agent actions
  setAgentMessages: (messages: ChatMessageData[]) => void
  addAgentMessage: (message: ChatMessageData) => void
  updateAgentMessage: (id: string, updates: Partial<ChatMessageData>) => void
  setAgentStreaming: (isStreaming: boolean) => void
  setCurrentToolCall: (toolCall: { name: ToolCallName; status: ToolCallStatus } | null) => void

  // Brief actions
  createBrief: (nodeId: string, data: VideoBriefConfig) => void
  updateBriefField: (nodeId: string, field: string, value: unknown) => void
  setBriefStoryboard: (nodeId: string, storyboard: StoryboardData) => void
  setBriefVideoUrl: (nodeId: string, videoUrl: string) => void
  getBrief: (nodeId: string) => BriefEntry | undefined

  _history: Array<{ nodes: Node<NodeData>[], edges: Edge[] }>
  _historyFuture: Array<{ nodes: Node<NodeData>[], edges: Edge[] }>
  _pushHistory: () => void
  undo: () => void
  redo: () => void
}

// ── Default configs per node type ────────────────────────────────────────────
export const DEFAULT_CONFIGS: Record<string, AnyNodeConfig> = {
  script: { model: 'gpt-4o', language: 'English', sceneCount: 5 } as ScriptConfig,
  voice: { source: 'preset', voiceId: 'alloy', voiceName: 'Alloy', speed: 1, language: 'English', engine: 'openai-tts' } as VoiceConfig,
  imageGen: { model: 'flux-schnell', resolution: '1024x1024', style: 'cinematic' } as ImageGenConfig,
  videoGen: { model: 'kling-3.0-standard-t2v', resolution: '1080p', duration: 5, fps: 24 } as VideoGenConfig,
  caption: { language: 'auto', style: 'bold', position: 'bottom' } as CaptionConfig,
  export: { format: 'mp4', quality: '1080p', includeAudio: true, includeCaptions: true } as ExportConfig,
  llm: { model: 'gpt-4o' } as LLMConfig,
  array: { items: ['Item 1'] } as ArrayConfig,
  router: { rules: [] } as RouterConfig,
  textIterator: { batchSize: 1 } as TextIteratorConfig,
  systemPrompt: { content: 'You are a helpful assistant.' } as SystemPromptConfig,
  videoBrief: {
    prompt: '',
    theme: 'A joyful adventure of a cute pink rabbit running around.',
    purpose: 'To provide a pleasant and entertaining visual experience for the audience.',
    audience: 'Children and fans of cute animations.',
    visualStyle: 'Cartoon 3D',
    narrator: 'Lady Holiday',
    character: '',
    characterImageUrls: {},
    music: 'Deep background',
    captions: 'Vlog',
    sceneMedia: 'Images',
    duration: '15',
    aspect: '16:9',
    platform: 'YouTube',
    outline: []
  } as VideoBriefConfig,
  filmStrip: { scenes: [] } as FilmStripConfig,
}

// ── Default starter nodes ────────────────────────────────────────────────────
export const DEFAULT_NODES: Node<NodeData>[] = [
  {
    id: 'script-1',
    type: 'scriptNode',
    position: { x: 80, y: 220 },
    data: { label: 'AI Script Writer', type: 'script', status: 'idle', config: { ...DEFAULT_CONFIGS.script } as ScriptConfig },
  },
  {
    id: 'voice-1',
    type: 'voiceNode',
    position: { x: 380, y: 80 },
    data: { label: 'Voice TTS', type: 'voice', status: 'idle', config: { ...DEFAULT_CONFIGS.voice } as VoiceConfig },
  },
  {
    id: 'image-1',
    type: 'imageGenNode',
    position: { x: 380, y: 340 },
    data: { label: 'Image Generator', type: 'imageGen', status: 'idle', config: { ...DEFAULT_CONFIGS.imageGen } as ImageGenConfig },
  },
  {
    id: 'video-1',
    type: 'videoGenNode',
    position: { x: 680, y: 220 },
    data: { label: 'Video Generator', type: 'videoGen', status: 'idle', config: { model: 'kling-3.0-standard-t2v', resolution: '1080p', duration: 5, fps: 24 } as VideoGenConfig },
  },
  {
    id: 'export-1',
    type: 'exportNode',
    position: { x: 980, y: 220 },
    data: { label: 'Export Video', type: 'export', status: 'idle', config: { ...DEFAULT_CONFIGS.export } as ExportConfig },
  },
]

export const DEFAULT_EDGES: Edge[] = [
  { id: 'e-script-voice', source: 'script-1', target: 'voice-1', type: 'labeled', style: { stroke: NODE_COLORS.script, strokeWidth: 2 }, animated: true, data: { label: 'Script' } },
  { id: 'e-script-image', source: 'script-1', target: 'image-1', type: 'labeled', style: { stroke: NODE_COLORS.script, strokeWidth: 2 }, animated: true, data: { label: 'Prompt' } },
  { id: 'e-voice-video', source: 'voice-1', target: 'video-1', type: 'labeled', style: { stroke: NODE_COLORS.voice, strokeWidth: 2 }, animated: true, data: { label: 'Audio' } },
  { id: 'e-image-video', source: 'image-1', target: 'video-1', type: 'labeled', style: { stroke: NODE_COLORS.imageGen, strokeWidth: 2 }, animated: true, data: { label: 'Image' } },
  { id: 'e-video-export', source: 'video-1', target: 'export-1', type: 'labeled', style: { stroke: NODE_COLORS.videoGen, strokeWidth: 2 }, animated: true, data: { label: 'Video' } },
]

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  projectId: null,
  projectTitle: 'Untitled Project',
  nodes: DEFAULT_NODES,
  edges: DEFAULT_EDGES,
  selectedNodeId: null,
  highlightedNodeId: null,
  contextMenu: null,

  // Agent conversation state
  agent: {
    messages: [],
    isStreaming: false,
    currentToolCall: null,
  },

  // Brief store
  briefs: {},

  // Variable store
  variables: {},
  setVariable: (name, value) => set((state) => ({ variables: { ...state.variables, [name]: value } })),
  getVariable: (name) => get().variables[name],

  _history: [],
  _historyFuture: [],

  setProjectId: (id) => set({ projectId: id }),
  setProjectTitle: (title) => set({ projectTitle: title }),
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  selectNode: (id) => set({ selectedNodeId: id }),
  highlightNode: (id) => set({ highlightedNodeId: id }),
  setContextMenu: (menu) => set({ contextMenu: menu }),

  _pushHistory: () => set((state) => ({
    _history: [...state._history.slice(-29), {
      nodes: JSON.parse(JSON.stringify(state.nodes)),
      edges: JSON.parse(JSON.stringify(state.edges)),
    }],
    _historyFuture: [],
  })),

  undo: () => set((state) => {
    if (state._history.length === 0) return state
    const prev = state._history[state._history.length - 1]
    const current = {
      nodes: JSON.parse(JSON.stringify(state.nodes)),
      edges: JSON.parse(JSON.stringify(state.edges)),
    }
    return {
      nodes: prev.nodes,
      edges: prev.edges,
      _history: state._history.slice(0, -1),
      _historyFuture: [current, ...state._historyFuture.slice(0, 29)],
    }
  }),

  redo: () => set((state) => {
    if (state._historyFuture.length === 0) return state
    const next = state._historyFuture[0]
    const current = {
      nodes: JSON.parse(JSON.stringify(state.nodes)),
      edges: JSON.parse(JSON.stringify(state.edges)),
    }
    return {
      nodes: next.nodes,
      edges: next.edges,
      _history: [...state._history.slice(-29), current],
      _historyFuture: state._historyFuture.slice(1),
    }
  }),

  updateNodeConfig: (nodeId, partialConfig) => set((state) => ({
    nodes: state.nodes.map(n =>
      n.id === nodeId
        ? { ...n, data: { ...n.data, config: { ...n.data.config, ...partialConfig } as unknown as AnyNodeConfig } }
        : n
    ),
  })),

  updateNodeStatus: (nodeId, status) => set((state) => ({
    nodes: state.nodes.map(n => n.id === nodeId ? { ...n, data: { ...n.data, status } } : n),
  })),

  updateNodeOutput: (nodeId, outputUrl) => set((state) => ({
    nodes: state.nodes.map(n => n.id === nodeId ? { ...n, data: { ...n.data, outputUrl, status: 'ready' as NodeStatus } } : n),
  })),

  updateNodeError: (nodeId, error) => set((state) => ({
    nodes: state.nodes.map(n => n.id === nodeId ? { ...n, data: { ...n.data, error, status: 'failed' as NodeStatus } } : n),
  })),

  addNode: (node) => set((state) => {
    const snapshot = {
      nodes: JSON.parse(JSON.stringify(state.nodes)),
      edges: JSON.parse(JSON.stringify(state.edges)),
    }
    return {
      nodes: [...state.nodes, node],
      _history: [...state._history.slice(-29), snapshot],
      _historyFuture: [],
    }
  }),
  removeNode: (nodeId) => set((state) => {
    const snapshot = {
      nodes: JSON.parse(JSON.stringify(state.nodes)),
      edges: JSON.parse(JSON.stringify(state.edges)),
    }
    return {
      nodes: state.nodes.filter(n => n.id !== nodeId),
      edges: state.edges.filter(e => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
      _history: [...state._history.slice(-29), snapshot],
      _historyFuture: [],
    }
  }),
  duplicateNode: (nodeId) => set((state) => {
    const nodeToDuplicate = state.nodes.find(n => n.id === nodeId)
    if (!nodeToDuplicate) return state
    const newNodeId = `${nodeToDuplicate.type}-${Date.now()}`
    const newNode: Node<NodeData> = {
      ...nodeToDuplicate,
      id: newNodeId,
      position: { x: nodeToDuplicate.position.x + 50, y: nodeToDuplicate.position.y + 50 },
      data: { ...nodeToDuplicate.data, status: 'idle', outputUrl: undefined, error: undefined },
      selected: false
    }
    return { nodes: [...state.nodes, newNode], selectedNodeId: newNodeId }
  }),

  // ── Agent actions ───────────────────────────────────────────────────────────
  setAgentMessages: (messages) => set((state) => ({
    agent: { ...state.agent, messages },
  })),

  addAgentMessage: (message) => set((state) => ({
    agent: { ...state.agent, messages: [...state.agent.messages, message] },
  })),

  updateAgentMessage: (id, updates) => set((state) => ({
    agent: {
      ...state.agent,
      messages: state.agent.messages.map(m =>
        m.id === id ? { ...m, ...updates } : m
      ),
    },
  })),

  setAgentStreaming: (isStreaming) => set((state) => ({
    agent: { ...state.agent, isStreaming },
  })),

  setCurrentToolCall: (toolCall) => set((state) => ({
    agent: { ...state.agent, currentToolCall: toolCall },
  })),

  // ── Brief actions ──────────────────────────────────────────────────────────
  createBrief: (nodeId, data) => set((state) => ({
    briefs: {
      ...state.briefs,
      [nodeId]: {
        nodeId,
        data,
        storyboard: null,
        videoUrl: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    },
  })),

  updateBriefField: (nodeId, field, value) => set((state) => {
    const existing = state.briefs[nodeId]
    if (!existing) return state
    return {
      briefs: {
        ...state.briefs,
        [nodeId]: {
          ...existing,
          data: { ...existing.data, [field]: value } as VideoBriefConfig,
          updatedAt: Date.now(),
        },
      },
    }
  }),

  setBriefStoryboard: (nodeId, storyboard) => set((state) => {
    const existing = state.briefs[nodeId]
    if (!existing) return state
    return {
      briefs: {
        ...state.briefs,
        [nodeId]: { ...existing, storyboard, updatedAt: Date.now() },
      },
    }
  }),

  setBriefVideoUrl: (nodeId, videoUrl) => set((state) => {
    const existing = state.briefs[nodeId]
    if (!existing) return state
    return {
      briefs: {
        ...state.briefs,
        [nodeId]: { ...existing, videoUrl, updatedAt: Date.now() },
      },
    }
  }),

  getBrief: (nodeId) => get().briefs[nodeId],
}))
