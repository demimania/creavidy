// ============================================================================
// fal.ai Client Configuration
// ============================================================================
import { fal } from '@fal-ai/client'

// Configure fal.ai with API key from environment
fal.config({
  credentials: process.env.FAL_KEY || '',
})

// ── Model IDs mapping (our internal names → fal.ai endpoint IDs) ────────────
export const FAL_IMAGE_MODELS: Record<string, string> = {
  'flux-schnell':      'fal-ai/flux/schnell',
  'flux-pro':          'fal-ai/flux-pro/v1.1',
  'flux-2-pro':        'fal-ai/flux-2-pro',
  'flux-kontext':      'fal-ai/flux-pro/kontext',
  'recraft-v4':        'fal-ai/recraft-v3',          // v4 uses same endpoint
  'sd-3.5':            'fal-ai/stable-diffusion-v35-large',
  'nano-banana-2':     'fal-ai/imagen3',             // Google Imagen via fal
  'imagine-art':       'fal-ai/imagineart/v1.5',
  'seedream-5.0-lite': 'fal-ai/bytedance/seedream/v5/lite/text-to-image',
  'ideogram-v3':       'fal-ai/ideogram/v3',
}

export const FAL_VIDEO_MODELS: Record<string, string> = {
  'kling-2.5-turbo':         'fal-ai/kling-video/v2.5/turbo/image-to-video',
  'kling-2.0-master':        'fal-ai/kling-video/v2/master/text-to-video',
  'kling-3.0-standard-t2v':  'fal-ai/kling-video/v3/standard/text-to-video',
  'kling-3.0-standard-i2v':  'fal-ai/kling-video/v3/standard/image-to-video',
  'kling-3.0-pro-t2v':       'fal-ai/kling-video/v3/pro/text-to-video',
  'veo-3':                   'fal-ai/veo3',
  'veo-3.1':                 'fal-ai/veo3',               // same endpoint, version param
  'ltx-2.3':                 'fal-ai/ltx-video/v2.3',
  'ltx-2-19b':               'fal-ai/ltx-video/v2-19b',
  'minimax-hailuo':          'fal-ai/minimax/video-01-live',
  'luma-dream':              'fal-ai/luma-dream-machine',
  'hunyuan':                 'fal-ai/hunyuan-video',
  'mochi-1':                 'fal-ai/mochi-v1',
  'sora-2-pro':              'fal-ai/sora-2-pro/text-to-video',
  'wan-2.6-t2v':             'fal-ai/wan/v2.6/text-to-video',
  'wan-2.6-i2v':             'fal-ai/wan/v2.6/image-to-video',
  'seedance-1.5-pro-t2v':    'fal-ai/bytedance/seedance/v1.5/pro/text-to-video',
  'seedance-1.5-pro-i2v':    'fal-ai/bytedance/seedance/v1.5/pro/image-to-video',
  'seedance-1.0-lite':       'fal-ai/bytedance/seedance/v1/lite/text-to-video',
}

export const FAL_TTS_MODELS: Record<string, string> = {
  'fal-tts':    'fal-ai/f5-tts',
}

// ── Credit costs per model ──────────────────────────────────────────────────
export const CREDIT_COSTS: Record<string, number> = {
  // Script (LLM)
  'gpt-4o': 5, 'gemini-2.0': 4, 'claude-3.5': 5,
  // Image
  'flux-schnell': 5, 'flux-pro': 12, 'flux-2-pro': 22, 'flux-kontext': 15,
  'recraft-v4': 10, 'sd-3.5': 8, 'nano-banana-2': 8, 'dall-e-3': 20,
  'midjourney': 25, 'imagine-art': 10, 'seedream-5.0-lite': 18, 'ideogram-v3': 10,
  // Video
  'kling-2.5-turbo': 25, 'kling-2.0-master': 30,
  'kling-3.0-standard-t2v': 35, 'kling-3.0-standard-i2v': 35, 'kling-3.0-pro-t2v': 45,
  'veo-3': 50, 'veo-3.1': 55,
  'ltx-2.3': 20, 'ltx-2-19b': 22, 'minimax-hailuo': 28, 'luma-dream': 35,
  'hunyuan': 20, 'mochi-1': 15,
  'sora-2-pro': 60, 'wan-2.6-t2v': 22, 'wan-2.6-i2v': 22,
  'seedance-1.5-pro-t2v': 28, 'seedance-1.5-pro-i2v': 28, 'seedance-1.0-lite': 15,
  // Voice
  'elevenlabs': 5, 'openai-tts': 3, 'fal-tts': 2,
  // Image Edit
  'flux-kontext-edit': 15, 'remove-bg': 3, 'upscale-esrgan': 5, 'flux-fill-pro': 12,
  // Video Edit
  'fal-ai/latentsync': 20, 'fal-ai/wan/v2v': 25, 'fal-ai/video-upscaler': 10, 'fal-ai/rife-v4.6-video': 8,
  // New video providers (Faz 7)
  'fal-ai/runway-gen4/turbo/text-to-video': 30,
  'fal-ai/veo3': 50,
  'fal-ai/luma-dream-machine/ray-2/text-to-video': 20,
  'fal-ai/minimax/video-01-live': 25,
  'fal-ai/wan-pro/v2.2/t2v': 20,
  // 3D generation (Faz 8)
  'fal-ai/triposr': 15,
  'fal-ai/hyper3d/rodin': 25,
  // Audio generation (Faz 8)
  'fal-ai/stable-audio': 8,
  'fal-ai/suno-ai/chirp-v4': 12,
  // Voice clone (Faz 8)
  'fal-ai/fish-speech-1.5': 5,
  'fal-ai/elevenlabs/tts': 6,
}

export function getCreditCost(model: string): number {
  return CREDIT_COSTS[model] || 10
}

// ── Helper to generate image ────────────────────────────────────────────────
export async function generateImage(params: {
  model: string
  prompt: string
  width?: number
  height?: number
  style?: string
}) {
  const endpointId = FAL_IMAGE_MODELS[params.model]
  if (!endpointId) throw new Error(`Unknown image model: ${params.model}`)

  const result = await fal.subscribe(endpointId, {
    input: {
      prompt: params.prompt,
      image_size: {
        width: params.width || 1024,
        height: params.height || 1024,
      },
      num_images: 1,
      ...(params.style && params.style !== 'none' ? { style: params.style } : {}),
    },
  })

  console.log('[generateImage] result.data:', JSON.stringify(result.data).slice(0, 500))
  return {
    imageUrl: (result.data as any)?.images?.[0]?.url || '',
    requestId: result.requestId,
    cost: getCreditCost(params.model),
  }
}

// ── Helper to generate video ────────────────────────────────────────────────
export async function generateVideo(params: {
  model: string
  prompt: string
  duration?: number
  resolution?: string
  fps?: number
  imageUrl?: string
}) {
  const endpointId = FAL_VIDEO_MODELS[params.model]
  if (!endpointId) throw new Error(`Unknown video model: ${params.model}`)

  const input: Record<string, unknown> = {
    prompt: params.prompt,
    ...(params.duration ? { duration: `${params.duration}` } : {}),
    ...(params.imageUrl ? { image_url: params.imageUrl } : {}),
  }

  // Model-specific param mapping
  if (params.model.startsWith('kling')) {
    input.aspect_ratio = params.resolution === '720p' ? '16:9' : '16:9'
  }

  const result = await fal.subscribe(endpointId, { input })

  return {
    videoUrl: (result.data as any)?.video?.url || '',
    requestId: result.requestId,
    cost: getCreditCost(params.model),
  }
}

// ── Helper for TTS ──────────────────────────────────────────────────────────
export async function generateTTS(params: {
  engine: string
  text: string
  voiceId?: string
  speed?: number
}) {
  // For fal.ai TTS
  if (params.engine === 'fal-tts') {
    const result = await fal.subscribe('fal-ai/f5-tts', {
      input: {
        gen_text: params.text,
        ref_audio_url: 'https://github.com/SWivid/F5-TTS/raw/main/tests/ref_audio/test_en_1_ref_short.wav',
        model_type: 'F5-TTS' as const,
        ...(params.speed ? { speed: params.speed } : {}),
      },
    })
    return {
      audioUrl: (result.data as any)?.audio_url?.url || '',
      requestId: result.requestId,
      cost: getCreditCost('fal-tts'),
    }
  }

  // For OpenAI TTS
  if (params.engine === 'openai-tts') {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: params.text,
        voice: params.voiceId || 'alloy',
        speed: params.speed || 1.0,
      }),
    })
    if (!response.ok) throw new Error(`OpenAI TTS error: ${response.statusText}`)
    // Convert to base64 data URL or upload to storage
    const buffer = await response.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    return {
      audioUrl: `data:audio/mp3;base64,${base64}`,
      cost: getCreditCost('openai-tts'),
    }
  }

  // For ElevenLabs TTS
  if (params.engine === 'elevenlabs') {
    const voiceId = params.voiceId || '21m00Tcm4TlvDq8ikWAM' // Rachel
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: params.text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    })
    if (!response.ok) throw new Error(`ElevenLabs error: ${response.statusText}`)
    const buffer = await response.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    return {
      audioUrl: `data:audio/mp3;base64,${base64}`,
      cost: getCreditCost('elevenlabs'),
    }
  }

  throw new Error(`Unknown TTS engine: ${params.engine}`)
}

// ── Helper for LLM script generation ────────────────────────────────────────
export async function generateScript(params: {
  model: string
  prompt: string
  sceneCount: number
  language: string
}) {
  // Default to gemini if no model specified or unknown model
  if (!params.model || params.model === 'gemini-2.0' || !['gpt-4o', 'claude-3.5'].includes(params.model)) {
    params = { ...params, model: 'gemini-2.0' }
  }

  // Normalize parsed response to an array of scenes
  function extractScenesArray(parsed: unknown): unknown[] {
    if (Array.isArray(parsed)) return parsed
    if (parsed && typeof parsed === 'object') {
      const obj = parsed as Record<string, unknown>
      // Try common wrapper keys
      for (const key of ['scenes', 'script', 'data', 'video_script', 'result']) {
        if (Array.isArray(obj[key])) return obj[key] as unknown[]
      }
      // Fallback: first array-valued key
      for (const val of Object.values(obj)) {
        if (Array.isArray(val)) return val as unknown[]
      }
    }
    return []
  }

  // Use OpenAI for gpt-4o
  if (params.model === 'gpt-4o') {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a professional video script writer. Generate a video script with exactly ${params.sceneCount} scenes covering the first 30 seconds of the story in ${params.language}. Each scene must have: scene_number, visual_description, narration, duration_seconds (each ~10s).

CRITICAL RULES for visual_description:
- Describe characters by APPEARANCE (hair color, clothing, body type), not just name — so image generation can recreate them consistently
- Maintain story coherence: same characters must look the SAME across all scenes (same outfit, same features)
- Include setting details: location, lighting, time of day, camera angle
- Use the SAME art style keywords in every scene for visual consistency

Return a JSON object with a "scenes" key containing the array, and a "characters" key containing an array of strings (max 5) of the character names EXPLICITLY mentioned in the user's prompt — do NOT invent new characters that are not in the prompt.`
          },
          { role: 'user', content: params.prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    })
    if (!response.ok) throw new Error(`OpenAI error: ${response.statusText}`)
    const data = await response.json()
    const parsed = JSON.parse(data.choices[0].message.content)
    const scenes = extractScenesArray(parsed)
    return {
      script: JSON.stringify(scenes),
      characters: Array.isArray(parsed.characters) ? parsed.characters : [],
      cost: getCreditCost('gpt-4o'),
    }
  }

  // Use Gemini
  if (params.model === 'gemini-2.0') {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a professional video script writer. Generate a video script with exactly ${params.sceneCount} scenes covering the first 30 seconds of the story in ${params.language}. Each scene: scene_number, visual_description, narration, duration_seconds (each ~10s).

CRITICAL RULES for visual_description:
- Describe characters by APPEARANCE (hair color, clothing, body type), not just name — so image generation can recreate them consistently
- Maintain story coherence: same characters must look the SAME across all scenes (same outfit, same features)
- Include setting details: location, lighting, time of day, camera angle
- Use the SAME art style keywords in every scene for visual consistency

Return a JSON object with a "scenes" key containing the array, and a "characters" key containing an array of strings (max 5) of the character names EXPLICITLY mentioned in the user's prompt — do NOT invent new characters that are not in the prompt.\n\nPrompt: ${params.prompt}`
          }]
        }],
        generationConfig: { temperature: 0.7, responseMimeType: 'application/json' },
      }),
    })

    // Rate limit veya Gemini hatası → GPT-4o'ya otomatik fallback
    if (!response.ok) {
      if (response.status === 429 || response.status === 503) {
        console.warn(`[fal-client] Gemini rate limited (${response.status}), falling back to GPT-4o`)
        return generateScript({ ...params, model: 'gpt-4o' })
      }
      throw new Error(`Gemini error: ${response.statusText}`)
    }

    const data = await response.json()
    const rawText = data.candidates[0].content.parts[0].text
    const parsed = JSON.parse(rawText)
    const scenes = extractScenesArray(parsed)
    return {
      script: JSON.stringify(scenes),
      characters: Array.isArray(parsed.characters) ? parsed.characters : [],
      cost: getCreditCost('gemini-2.0'),
    }
  }

  throw new Error(`Unknown script model: ${params.model}`)
}

// ── Image Editing functions ──────────────────────────────────────────────────

// FAL endpoint IDs for image editing
export const FAL_IMAGE_EDIT_MODELS: Record<string, string> = {
  'flux-kontext':    'fal-ai/flux-pro/kontext',
  'flux-fill-pro':   'fal-ai/flux/inpainting',
  'remove-bg':       'fal-ai/birefnet',
  'upscale-esrgan':  'fal-ai/esrgan',
  'upscale-aura':    'fal-ai/aura-sr',
}

export async function editImageKontext(params: {
  imageUrl: string
  prompt: string
}) {
  const result = await fal.subscribe('fal-ai/flux-pro/kontext', {
    input: {
      image_url: params.imageUrl,
      prompt: params.prompt,
    },
  })
  return {
    imageUrl: (result.data as any)?.images?.[0]?.url || '',
    requestId: result.requestId,
    cost: 15,
  }
}

export async function removeBackground(params: {
  imageUrl: string
}) {
  const result = await fal.subscribe('fal-ai/birefnet', {
    input: {
      image_url: params.imageUrl,
      model: 'General Use (Light)',
      operating_resolution: '1024x1024',
    },
  })
  return {
    imageUrl: (result.data as any)?.image?.url || '',
    requestId: result.requestId,
    cost: 3,
  }
}

export async function upscaleImage(params: {
  imageUrl: string
  scale?: number
}) {
  const result = await fal.subscribe('fal-ai/esrgan', {
    input: {
      image_url: params.imageUrl,
      scale: params.scale || 2,
    },
  })
  return {
    imageUrl: (result.data as any)?.image?.url || (result.data as any)?.images?.[0]?.url || '',
    requestId: result.requestId,
    cost: 5,
  }
}

export async function inpaintImage(params: {
  imageUrl: string
  maskUrl: string
  prompt: string
}) {
  const result = await fal.subscribe('fal-ai/flux/inpainting', {
    input: {
      image_url: params.imageUrl,
      mask_url: params.maskUrl,
      prompt: params.prompt,
    },
  })
  return {
    imageUrl: (result.data as any)?.images?.[0]?.url || '',
    requestId: result.requestId,
    cost: 12,
  }
}

// ── New video generation functions (Faz 7) ──────────────────────────────────

// Runway Gen-4
export async function generateVideoRunway(params: { prompt: string; imageUrl?: string; duration?: number }): Promise<{ videoUrl: string; requestId: string }> {
  const input: Record<string, unknown> = { prompt: params.prompt, duration: params.duration ?? 5 }
  const result = await fal.subscribe('fal-ai/runway-gen4/turbo/text-to-video', {
    input: input as any,
    pollInterval: 3000,
  }) as any
  return { videoUrl: result.data?.video?.url || result.data?.output?.video?.url || '', requestId: String(result.requestId || '') }
}

// Veo 3.1 Text to Video
export async function generateVideoVeo31(params: { prompt: string; duration?: number; aspectRatio?: string }): Promise<{ videoUrl: string; requestId: string }> {
  const input: Record<string, unknown> = { prompt: params.prompt, duration: params.duration ?? 8, aspect_ratio: params.aspectRatio ?? '16:9' }
  const result = await fal.subscribe('fal-ai/veo3', {
    input: input as any,
    pollInterval: 5000,
  }) as any
  return { videoUrl: result.data?.video?.url || result.data?.output?.video?.url || '', requestId: String(result.requestId || '') }
}

// Luma Dream Machine Ray 2
export async function generateVideoLuma(params: { prompt: string; imageUrl?: string; duration?: number }): Promise<{ videoUrl: string; requestId: string }> {
  const input: Record<string, unknown> = { prompt: params.prompt, duration: params.duration ?? 5 }
  const result = await fal.subscribe('fal-ai/luma-dream-machine/ray-2/text-to-video', {
    input: input as any,
    pollInterval: 3000,
  }) as any
  return { videoUrl: result.data?.video?.url || result.data?.output?.video?.url || '', requestId: String(result.requestId || '') }
}

// Minimax Hailuo
export async function generateVideoMinimax(params: { prompt: string; duration?: number }): Promise<{ videoUrl: string; requestId: string }> {
  const input: Record<string, unknown> = { prompt: params.prompt }
  const result = await fal.subscribe('fal-ai/minimax/video-01-live', {
    input: input as any,
    pollInterval: 3000,
  }) as any
  return { videoUrl: result.data?.video?.url || result.data?.output?.video?.url || '', requestId: String(result.requestId || '') }
}

// Wan 2.6 Pro
export async function generateVideoWan(params: { prompt: string; duration?: number; aspectRatio?: string }): Promise<{ videoUrl: string; requestId: string }> {
  const input: Record<string, unknown> = { prompt: params.prompt, duration: params.duration ?? 5, aspect_ratio: params.aspectRatio ?? '16:9' }
  const result = await fal.subscribe('fal-ai/wan-pro/v2.2/t2v', {
    input: input as any,
    pollInterval: 3000,
  }) as any
  return { videoUrl: result.data?.video?.url || result.data?.output?.video?.url || '', requestId: String(result.requestId || '') }
}

// ── Video Editing functions ──────────────────────────────────────────────────

// Lip Sync
export async function lipSyncVideo(params: { videoUrl: string; audioUrl: string }): Promise<{ videoUrl: string; requestId: string }> {
  const result = await fal.subscribe('fal-ai/latentsync', {
    input: { video_url: params.videoUrl, audio_url: params.audioUrl },
    pollInterval: 3000,
  }) as any
  return { videoUrl: result.data?.video?.url || result.data?.output?.video_url || '', requestId: String(result.requestId || '') }
}

// Video to Video
export async function videoToVideo(params: { videoUrl: string; prompt: string; strength?: number }): Promise<{ videoUrl: string; requestId: string }> {
  const result = await fal.subscribe('fal-ai/wan/v2v', {
    input: { video_url: params.videoUrl, prompt: params.prompt, strength: params.strength ?? 0.7 },
    pollInterval: 3000,
  }) as any
  return { videoUrl: result.data?.video?.url || result.data?.output?.video_url || '', requestId: String(result.requestId || '') }
}

// Video Upscale
export async function upscaleVideo(params: { videoUrl: string; scale?: number }): Promise<{ videoUrl: string; requestId: string }> {
  const result = await fal.subscribe('fal-ai/video-upscaler', {
    input: { video_url: params.videoUrl, scale: params.scale ?? 2 },
    pollInterval: 3000,
  }) as any
  return { videoUrl: result.data?.video?.url || result.data?.output?.video_url || '', requestId: String(result.requestId || '') }
}

// Video Enhance (frame interpolation / denoise)
export async function enhanceVideo(params: { videoUrl: string; enhanceType?: string }): Promise<{ videoUrl: string; requestId: string }> {
  const result = await fal.subscribe('fal-ai/rife-v4.6-video', {
    input: { video_url: params.videoUrl },
    pollInterval: 3000,
  }) as any
  return { videoUrl: result.data?.video?.url || result.data?.output?.video_url || '', requestId: String(result.requestId || '') }
}

// ── 3D Generation (Faz 8) ────────────────────────────────────────────────────

// Tripo3D — text/image → 3D mesh
export async function generate3DTripo(params: { prompt?: string; imageUrl?: string }): Promise<{ modelUrl: string; requestId: string }> {
  const input: Record<string, unknown> = {}
  if (params.imageUrl) {
    input.image_url = params.imageUrl
  } else {
    input.prompt = params.prompt
  }
  const result = await fal.subscribe('fal-ai/triposr', {
    input: input as any,
    pollInterval: 3000,
  }) as any
  return {
    modelUrl: result.model_mesh?.url || result.output?.model_url || '',
    requestId: String(result.requestId || ''),
  }
}

// Hyper3D — higher quality 3D
export async function generate3DHyper(params: { prompt?: string; imageUrl?: string }): Promise<{ modelUrl: string; requestId: string }> {
  const input: Record<string, unknown> = {}
  if (params.imageUrl) {
    input.image_url = params.imageUrl
  } else {
    input.prompt = params.prompt
  }
  const result = await fal.subscribe('fal-ai/hyper3d/rodin', {
    input,
    pollInterval: 4000,
  }) as any
  return {
    modelUrl: result.model?.url || result.output?.model_url || '',
    requestId: String(result.requestId || ''),
  }
}

// ── Audio Generation (Faz 8) ─────────────────────────────────────────────────

// Stable Audio — text → music/sfx
export async function generateAudio(params: { prompt: string; duration?: number; steps?: number }): Promise<{ audioUrl: string; requestId: string }> {
  const result = await fal.subscribe('fal-ai/stable-audio', {
    input: {
      prompt: params.prompt,
      seconds_total: params.duration ?? 30,
      steps: params.steps ?? 100,
    },
    pollInterval: 3000,
  }) as any
  return {
    audioUrl: result.audio_file?.url || result.output?.audio_url || '',
    requestId: String(result.requestId || ''),
  }
}

// Suno — AI music generation
export async function generateSunoMusic(params: { prompt: string; style?: string; duration?: number }): Promise<{ audioUrl: string; requestId: string }> {
  const result = await fal.subscribe('fal-ai/suno-ai/chirp-v4', {
    input: {
      prompt: params.prompt,
      style: params.style || 'pop',
      duration: params.duration ?? 30,
    },
    pollInterval: 5000,
  }) as any
  return {
    audioUrl: result.audio?.url || result.output?.audio_url || '',
    requestId: String(result.requestId || ''),
  }
}

// ── Voice Clone (Faz 8) ──────────────────────────────────────────────────────

// Fish Audio — voice cloning (fal.ai üzerinden)
export async function cloneVoiceFishAudio(params: { text: string; referenceAudioUrl: string; voiceId?: string }): Promise<{ audioUrl: string; requestId: string }> {
  const result = await fal.subscribe('fal-ai/fish-speech-1.5', {
    input: {
      text: params.text,
      reference_audio_url: params.referenceAudioUrl,
    },
    pollInterval: 2000,
  }) as any
  return {
    audioUrl: result.audio?.url || result.output?.audio_url || '',
    requestId: String(result.requestId || ''),
  }
}

// ElevenLabs voice clone (fal.ai üzerinden)
export async function cloneVoiceElevenLabs(params: { text: string; voiceId?: string }): Promise<{ audioUrl: string; requestId: string }> {
  const result = await fal.subscribe('fal-ai/elevenlabs/tts', {
    input: {
      text: params.text,
      voice_id: params.voiceId || 'pNInz6obpgDQGcFmaJgB',
    },
    pollInterval: 2000,
  }) as any
  return {
    audioUrl: result.audio?.url || result.output?.audio_url || '',
    requestId: String(result.requestId || ''),
  }
}

export { fal }
