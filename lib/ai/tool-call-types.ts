// Creavidy 9-step tool call chain types

export type ToolCallName =
  | 'create_card'
  | 'update_storyboard'
  | 'generate_text'
  | 'read_card_details'
  | 'split_lines_to_scenes'
  | 'generate_voiceover'
  | 'generate_scene_media'
  | 'select_resources'

export type ToolCallStatus = 'pending' | 'running' | 'success' | 'error'

export interface ToolCallEvent {
  type: 'tool_call'
  name: ToolCallName
  status: ToolCallStatus
  label: string
  data?: Record<string, unknown>
  error?: string
}

export interface MessageEvent {
  type: 'message'
  content: string
}

export interface CardBadgeEvent {
  type: 'card_badge'
  card_id: string
  title: string
  subtitle: string
}

export interface DoneEvent {
  type: 'done'
  brief_id: string
  total_credits: number
}

export type OrchestratorEvent = ToolCallEvent | MessageEvent | CardBadgeEvent | DoneEvent

// Brief data that flows through the pipeline
export interface BriefData {
  id: string
  title: string
  visual_style: string
  narrator: string
  narrator_voice_id: string
  characters: string[]
  music: string
  scene_media: 'images' | 'video' | 'mixed'
  duration: number
  aspect_ratio: '16:9' | '9:16' | '1:1' | '4:3'
  platform: string
  script: string
}

export interface SceneData {
  index: number
  text: string
  visual_prompt: string
  media_type: 'ai_image' | 'ai_video'
  duration_ms: number
  image_url?: string
  audio_url?: string
  video_url?: string
}

export interface StoryboardData {
  brief: BriefData
  scenes: SceneData[]
  music_track?: { url: string; mood: string }
  subtitles?: { scene_index: number; text: string; start_ms: number; end_ms: number }[]
  total_credits: number
}

// Tool call labels (for chat UI display)
export const TOOL_CALL_LABELS: Record<ToolCallName, string> = {
  create_card: 'Create card',
  update_storyboard: 'Update storyboard settings',
  generate_text: 'Generate text',
  read_card_details: 'Read card details',
  split_lines_to_scenes: 'Split lines to scenes',
  generate_voiceover: 'Generate voiceover',
  generate_scene_media: 'Generate scene media',
  select_resources: 'Select resources',
}

// Order of tool calls in the pipeline
export const TOOL_CALL_ORDER: ToolCallName[] = [
  'create_card',
  'update_storyboard',
  'generate_text',
  'read_card_details',
  'split_lines_to_scenes',
  'generate_voiceover',
  'generate_scene_media',
  'select_resources',
  // update_storyboard runs again as final step (handled in orchestrator)
]
