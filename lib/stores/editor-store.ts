// ============================================================================
// Editor Store — CapCut-style 3-panel editor state management
// ============================================================================
import { create } from 'zustand'

// ── Types ───────────────────────────────────────────────────────────────────

export interface EditorScene {
  id: string
  order: number
  timestamp: string        // e.g. "00:04"
  duration: number         // seconds
  narratorId: string
  narratorName: string
  narratorAvatar?: string
  script: string
  imageUrl?: string
  videoUrl?: string
  audioUrl?: string
  status: 'idle' | 'generating' | 'ready' | 'failed'
}

export interface EditorCharacter {
  id: string
  name: string
  avatar?: string
  description?: string
}

export interface EditorNarrator {
  id: string
  name: string
  type: 'voice' | 'avatar'
  avatar?: string
  gender?: string
  accent?: string
  voiceId: string          // maps to TTS voice ID
  isFavorite?: boolean
  category?: 'favorites' | 'trend' | 'narration'
}

export interface VideoSummaryData {
  visualStyle: string
  narrator: EditorNarrator | null
  characters: EditorCharacter[]
  musicMood: string
  sceneMediaType: 'images' | 'video'
  duration: number         // total seconds
  aspectRatio: string
  platform: string
  script: string           // full narration text
}

export type EditorPhase = 'idle' | 'generating-script' | 'generating-media' | 'building-filmstrip' | 'ready' | 'exporting'

export interface GenerationProgress {
  phase: string
  percent: number
  estimatedMinutes: number
  message: string
}

// ── Popup states ────────────────────────────────────────────────────────────

export type ActivePopup = null | 'style' | 'narrator' | 'sceneMedia' | 'duration' | 'aspectRatio' | 'platform' | 'music'

// ── Scene action menu ───────────────────────────────────────────────────────

export interface SceneActionMenu {
  sceneId: string
  x: number
  y: number
}

// ── Main State ──────────────────────────────────────────────────────────────

interface EditorState {
  // Project
  projectId: string | null
  projectTitle: string

  // Summary data (left panel)
  summary: VideoSummaryData

  // Scenes (center panel - film strip)
  scenes: EditorScene[]
  selectedSceneId: string | null

  // Editor phase
  phase: EditorPhase
  progress: GenerationProgress | null

  // UI state
  activePopup: ActivePopup
  sceneActionMenu: SceneActionMenu | null
  narratorApplyMode: 'selected' | 'all'
  narratorTab: 'voice' | 'avatar'

  // Chat messages
  chatMessages: Array<{ id: string; role: 'user' | 'assistant'; content: string }>
  isChatLoading: boolean

  // Actions — Project
  setProjectId: (id: string | null) => void
  setProjectTitle: (title: string) => void

  // Actions — Summary
  updateSummary: (partial: Partial<VideoSummaryData>) => void
  setNarrator: (narrator: EditorNarrator | null) => void

  // Actions — Scenes
  setScenes: (scenes: EditorScene[]) => void
  addScene: (scene: EditorScene) => void
  updateScene: (sceneId: string, partial: Partial<EditorScene>) => void
  removeScene: (sceneId: string) => void
  selectScene: (sceneId: string | null) => void
  reorderScene: (sceneId: string, newOrder: number) => void

  // Actions — Phase
  setPhase: (phase: EditorPhase) => void
  setProgress: (progress: GenerationProgress | null) => void

  // Actions — UI
  setActivePopup: (popup: ActivePopup) => void
  setSceneActionMenu: (menu: SceneActionMenu | null) => void
  setNarratorApplyMode: (mode: 'selected' | 'all') => void
  setNarratorTab: (tab: 'voice' | 'avatar') => void

  // Actions — Chat
  addChatMessage: (msg: { id: string; role: 'user' | 'assistant'; content: string }) => void
  setChatLoading: (loading: boolean) => void

  // Reset
  resetEditor: () => void
}

// ── Initial State ───────────────────────────────────────────────────────────

const initialSummary: VideoSummaryData = {
  visualStyle: 'Cartoon 3D',
  narrator: null,
  characters: [],
  musicMood: 'Gentle, emotional, instrumental',
  sceneMediaType: 'images',
  duration: 60,
  aspectRatio: '16:9',
  platform: 'YouTube',
  script: '',
}

const initialState = {
  projectId: null as string | null,
  projectTitle: 'Untitled Project',
  summary: { ...initialSummary },
  scenes: [] as EditorScene[],
  selectedSceneId: null as string | null,
  phase: 'idle' as EditorPhase,
  progress: null as GenerationProgress | null,
  activePopup: null as ActivePopup,
  sceneActionMenu: null as SceneActionMenu | null,
  narratorApplyMode: 'all' as const,
  narratorTab: 'voice' as const,
  chatMessages: [] as Array<{ id: string; role: 'user' | 'assistant'; content: string }>,
  isChatLoading: false,
}

// ── Store ───────────────────────────────────────────────────────────────────

export const useEditorStore = create<EditorState>((set) => ({
  ...initialState,

  // Project
  setProjectId: (id) => set({ projectId: id }),
  setProjectTitle: (title) => set({ projectTitle: title }),

  // Summary
  updateSummary: (partial) => set((s) => ({
    summary: { ...s.summary, ...partial },
  })),
  setNarrator: (narrator) => set((s) => ({
    summary: { ...s.summary, narrator },
  })),

  // Scenes
  setScenes: (scenes) => set({ scenes }),
  addScene: (scene) => set((s) => ({
    scenes: [...s.scenes, scene],
  })),
  updateScene: (sceneId, partial) => set((s) => ({
    scenes: s.scenes.map((sc) =>
      sc.id === sceneId ? { ...sc, ...partial } : sc
    ),
  })),
  removeScene: (sceneId) => set((s) => ({
    scenes: s.scenes.filter((sc) => sc.id !== sceneId),
    selectedSceneId: s.selectedSceneId === sceneId ? null : s.selectedSceneId,
  })),
  selectScene: (sceneId) => set({ selectedSceneId: sceneId }),
  reorderScene: (sceneId, newOrder) => set((s) => {
    const scenes = [...s.scenes]
    const idx = scenes.findIndex((sc) => sc.id === sceneId)
    if (idx === -1) return s
    const [scene] = scenes.splice(idx, 1)
    scenes.splice(newOrder, 0, scene)
    return { scenes: scenes.map((sc, i) => ({ ...sc, order: i })) }
  }),

  // Phase
  setPhase: (phase) => set({ phase }),
  setProgress: (progress) => set({ progress }),

  // UI
  setActivePopup: (popup) => set({ activePopup: popup }),
  setSceneActionMenu: (menu) => set({ sceneActionMenu: menu }),
  setNarratorApplyMode: (mode) => set({ narratorApplyMode: mode }),
  setNarratorTab: (tab) => set({ narratorTab: tab }),

  // Chat
  addChatMessage: (msg) => set((s) => ({
    chatMessages: [...s.chatMessages, msg],
  })),
  setChatLoading: (loading) => set({ isChatLoading: loading }),

  // Reset
  resetEditor: () => set(initialState),
}))

// ── Preset data ─────────────────────────────────────────────────────────────

export const VISUAL_STYLES = [
  { id: 'comic', label: 'Comic', emoji: '🖼️' },
  { id: 'fairy-tale', label: 'Fairy Tale', emoji: '🧚' },
  { id: 'oil-paint', label: 'Oil Paint', emoji: '🎨' },
  { id: 'dark', label: 'Dark', emoji: '🌑' },
  { id: 'cartoon-3d', label: 'Cartoon 3D', emoji: '🧊' },
  { id: 'realistic', label: 'Realistic Film', emoji: '🎬' },
  { id: 'anime', label: 'Anime', emoji: '🌸' },
  { id: 'watercolor', label: 'Watercolor', emoji: '💧' },
  { id: 'pixel-art', label: 'Pixel Art', emoji: '👾' },
  { id: 'photograph', label: 'Photograph', emoji: '📷' },
]

export const PRESET_NARRATORS: EditorNarrator[] = [
  { id: 'alloy', name: 'Jolly Yapper', type: 'voice', voiceId: 'alloy', gender: 'Neutral', accent: 'American', category: 'trend' },
  { id: 'echo', name: 'Happy Dino', type: 'voice', voiceId: 'echo', gender: 'Male', accent: 'American', category: 'narration' },
  { id: 'fable', name: 'Ms. Labebe', type: 'voice', voiceId: 'fable', gender: 'Male', accent: 'British', category: 'trend' },
  { id: 'nova', name: 'Lady Holiday', type: 'voice', voiceId: 'nova', gender: 'Female', accent: 'American', category: 'narration' },
  { id: 'shimmer', name: 'Rayo', type: 'voice', voiceId: 'shimmer', gender: 'Female', accent: 'American', category: 'trend' },
  { id: 'onyx', name: 'Mr. Deep', type: 'voice', voiceId: 'onyx', gender: 'Male', accent: 'American', category: 'narration' },
]

export const PLATFORMS = [
  { id: 'youtube', label: 'YouTube', icon: '🔴' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵' },
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'twitter', label: 'X / Twitter', icon: '𝕏' },
]

export const DURATIONS = [
  { value: 60, label: '1 min' },
  { value: 180, label: '3 min' },
  { value: 300, label: '5 min' },
  { value: 600, label: '10 min' },
]

export const ASPECT_RATIOS = [
  { value: '16:9', label: '16:9' },
  { value: '9:16', label: '9:16' },
  { value: '1:1', label: '1:1' },
  { value: '4:5', label: '4:5' },
]
