// ============================================================================
// AI MODEL PRICING & CREDIT COSTS
// Creavidy Platform — Model-to-Credit Mapping
// ============================================================================

export type AIModel = {
  id: string
  name: string
  category: 'image' | 'video' | 'audio' | 'llm'
  provider: string
  creditsPerUnit: number
  unitLabel: string // e.g. "per image", "per second", "per 1k tokens"
  description: string
  recommended?: boolean
}

// Credit costs for all supported AI models
export const AI_MODELS: Record<string, AIModel> = {
  // ── LLM (Chat / Script) ───────────────────────────────────────────────────
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    category: 'llm',
    provider: 'OpenAI',
    creditsPerUnit: 0,  // Included in all plans (chat is free)
    unitLabel: 'per message',
    description: 'High-quality video script & planning',
    recommended: true,
  },
  'gemini-2.0-flash': {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    category: 'llm',
    provider: 'Google',
    creditsPerUnit: 0,
    unitLabel: 'per message',
    description: 'Fast, creative video planning',
  },

  // ── Image Generation ──────────────────────────────────────────────────────
  'flux-schnell': {
    id: 'flux-schnell',
    name: 'Flux Schnell',
    category: 'image',
    provider: 'Black Forest Labs',
    creditsPerUnit: 5,
    unitLabel: 'per image',
    description: 'Fast, high-quality images',
    recommended: true,
  },
  'flux-pro': {
    id: 'flux-pro',
    name: 'Flux Pro v1.1',
    category: 'image',
    provider: 'Black Forest Labs',
    creditsPerUnit: 12,
    unitLabel: 'per image',
    description: 'Premium quality, photorealistic',
  },
  'flux-2-pro': {
    id: 'flux-2-pro',
    name: 'Flux 2 Pro',
    category: 'image',
    provider: 'Black Forest Labs',
    creditsPerUnit: 22,
    unitLabel: 'per image',
    description: 'Latest generation, highest fidelity',
  },
  'flux-kontext': {
    id: 'flux-kontext',
    name: 'Flux Kontext',
    category: 'image',
    provider: 'Black Forest Labs',
    creditsPerUnit: 15,
    unitLabel: 'per image',
    description: 'Context-aware image editing',
  },
  'recraft-v4': {
    id: 'recraft-v4',
    name: 'Recraft v4',
    category: 'image',
    provider: 'Recraft',
    creditsPerUnit: 10,
    unitLabel: 'per image',
    description: 'Design-focused, brand-consistent',
  },
  'seedream-5.0-lite': {
    id: 'seedream-5.0-lite',
    name: 'Seedream 5.0 Lite',
    category: 'image',
    provider: 'ByteDance',
    creditsPerUnit: 18,
    unitLabel: 'per image',
    description: 'High-quality text-to-image generation',
  },
  'ideogram-v3': {
    id: 'ideogram-v3',
    name: 'Ideogram V3',
    category: 'image',
    provider: 'Ideogram',
    creditsPerUnit: 10,
    unitLabel: 'per image',
    description: 'Typography-accurate image generation',
  },
  'midjourney-v6': {
    id: 'midjourney-v6',
    name: 'Midjourney v6',
    category: 'image',
    provider: 'Midjourney',
    creditsPerUnit: 25,
    unitLabel: 'per image',
    description: 'Artistic, painterly styles',
  },
  'dalle-3': {
    id: 'dalle-3',
    name: 'DALL-E 3',
    category: 'image',
    provider: 'OpenAI',
    creditsPerUnit: 20,
    unitLabel: 'per image',
    description: 'Prompt-accurate, clean output',
  },
  'imagine-art': {
    id: 'imagine-art',
    name: 'Imagine Art v1.5',
    category: 'image',
    provider: 'ImagineArt',
    creditsPerUnit: 10,
    unitLabel: 'per image',
    description: 'Creative AI art generation',
  },

  // ── Video Generation ──────────────────────────────────────────────────────
  'kling-2.5-turbo': {
    id: 'kling-2.5-turbo',
    name: 'Kling 2.5 Turbo',
    category: 'video',
    provider: 'Kuaishou',
    creditsPerUnit: 25,
    unitLabel: 'per clip',
    description: 'Fast image-to-video generation',
    recommended: true,
  },
  'kling-2.0-master': {
    id: 'kling-2.0-master',
    name: 'Kling 2.0 Master',
    category: 'video',
    provider: 'Kuaishou',
    creditsPerUnit: 30,
    unitLabel: 'per clip',
    description: 'High-quality text-to-video',
  },
  'kling-3.0-standard-t2v': {
    id: 'kling-3.0-standard-t2v',
    name: 'Kling 3.0 Standard (T2V)',
    category: 'video',
    provider: 'Kuaishou',
    creditsPerUnit: 35,
    unitLabel: 'per clip',
    description: 'Latest Kling, text-to-video standard tier',
  },
  'kling-3.0-standard-i2v': {
    id: 'kling-3.0-standard-i2v',
    name: 'Kling 3.0 Standard (I2V)',
    category: 'video',
    provider: 'Kuaishou',
    creditsPerUnit: 35,
    unitLabel: 'per clip',
    description: 'Latest Kling, image-to-video standard tier',
  },
  'kling-3.0-pro-t2v': {
    id: 'kling-3.0-pro-t2v',
    name: 'Kling 3.0 Pro (T2V)',
    category: 'video',
    provider: 'Kuaishou',
    creditsPerUnit: 45,
    unitLabel: 'per clip',
    description: 'Latest Kling, text-to-video pro tier',
  },
  'veo-3': {
    id: 'veo-3',
    name: 'Veo 3',
    category: 'video',
    provider: 'Google',
    creditsPerUnit: 50,
    unitLabel: 'per clip',
    description: 'Cinematic, physics-aware video generation',
  },
  'veo-3.1': {
    id: 'veo-3.1',
    name: 'Veo 3.1',
    category: 'video',
    provider: 'Google',
    creditsPerUnit: 55,
    unitLabel: 'per clip',
    description: 'Enhanced Veo generation, highest quality',
  },
  'sora-2-pro': {
    id: 'sora-2-pro',
    name: 'Sora 2 Pro',
    category: 'video',
    provider: 'OpenAI',
    creditsPerUnit: 60,
    unitLabel: 'per clip',
    description: 'Highest quality, physics-aware video',
  },
  'wan-2.6-t2v': {
    id: 'wan-2.6-t2v',
    name: 'Wan 2.6 (T2V)',
    category: 'video',
    provider: 'Alibaba',
    creditsPerUnit: 22,
    unitLabel: 'per clip',
    description: 'Open-source text-to-video model',
  },
  'wan-2.6-i2v': {
    id: 'wan-2.6-i2v',
    name: 'Wan 2.6 (I2V)',
    category: 'video',
    provider: 'Alibaba',
    creditsPerUnit: 22,
    unitLabel: 'per clip',
    description: 'Open-source image-to-video model',
  },
  'seedance-1.5-pro-t2v': {
    id: 'seedance-1.5-pro-t2v',
    name: 'Seedance 1.5 Pro (T2V)',
    category: 'video',
    provider: 'ByteDance',
    creditsPerUnit: 28,
    unitLabel: 'per clip',
    description: 'ByteDance pro text-to-video',
  },
  'seedance-1.5-pro-i2v': {
    id: 'seedance-1.5-pro-i2v',
    name: 'Seedance 1.5 Pro (I2V)',
    category: 'video',
    provider: 'ByteDance',
    creditsPerUnit: 28,
    unitLabel: 'per clip',
    description: 'ByteDance pro image-to-video',
  },
  'seedance-1.0-lite': {
    id: 'seedance-1.0-lite',
    name: 'Seedance 1.0 Lite',
    category: 'video',
    provider: 'ByteDance',
    creditsPerUnit: 15,
    unitLabel: 'per clip',
    description: 'Fast, affordable ByteDance video model',
  },
  'ltx-2.3': {
    id: 'ltx-2.3',
    name: 'LTX Video 2.3',
    category: 'video',
    provider: 'Lightricks',
    creditsPerUnit: 20,
    unitLabel: 'per clip',
    description: 'Real-time capable video generation',
  },
  'ltx-2-19b': {
    id: 'ltx-2-19b',
    name: 'LTX Video 2 19B',
    category: 'video',
    provider: 'Lightricks',
    creditsPerUnit: 22,
    unitLabel: 'per clip',
    description: 'Large LTX model, high fidelity',
  },
  'minimax-hailuo': {
    id: 'minimax-hailuo',
    name: 'Minimax Hailuo',
    category: 'video',
    provider: 'Minimax',
    creditsPerUnit: 28,
    unitLabel: 'per clip',
    description: 'Smooth motion, high coherence',
  },
  'luma-dream': {
    id: 'luma-dream',
    name: 'Luma Dream Machine',
    category: 'video',
    provider: 'Luma AI',
    creditsPerUnit: 35,
    unitLabel: 'per clip',
    description: 'Photorealistic, dreamlike video',
  },
  'hunyuan': {
    id: 'hunyuan',
    name: 'HunyuanVideo',
    category: 'video',
    provider: 'Tencent',
    creditsPerUnit: 20,
    unitLabel: 'per clip',
    description: 'Open-source, high-quality video',
  },
  'mochi-1': {
    id: 'mochi-1',
    name: 'Mochi 1',
    category: 'video',
    provider: 'Genmo',
    creditsPerUnit: 15,
    unitLabel: 'per clip',
    description: 'Smooth, fluid motion generation',
  },

  // ── Audio / Voice ─────────────────────────────────────────────────────────
  'elevenlabs-tts': {
    id: 'elevenlabs-tts',
    name: 'ElevenLabs TTS',
    category: 'audio',
    provider: 'ElevenLabs',
    creditsPerUnit: 1,
    unitLabel: 'per 100 chars',
    description: 'Natural voice synthesis',
    recommended: true,
  },
}

// ── Plan Monthly Credit Allocations ─────────────────────────────────────────
export const PLAN_CREDITS: Record<string, number> = {
  starter: 50,    // 50 credits/month (free)
  pro: 500,       // 500 credits/month
  agency: 2500,   // 2500 credits/month
}

// ── Helper: Calculate cost for a scene ──────────────────────────────────────
export function calculateSceneCost(
  modelId: string,
  quantity: number   // seconds for video, count for images, chars for audio
): number {
  const model = AI_MODELS[modelId]
  if (!model) return 0
  return Math.ceil(model.creditsPerUnit * quantity)
}

// ── Helper: Estimate total project cost ─────────────────────────────────────
export function estimateProjectCost(sceneCount: number, _avgDurationPerScene = 5): {
  imageOnly: number
  videoStandard: number
  videoPremium: number
} {
  return {
    imageOnly: sceneCount * AI_MODELS['flux-schnell'].creditsPerUnit,
    videoStandard: sceneCount * AI_MODELS['kling-3.0-standard-t2v'].creditsPerUnit,
    videoPremium: sceneCount * AI_MODELS['sora-2-pro'].creditsPerUnit,
  }
}
