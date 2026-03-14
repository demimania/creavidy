import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { deductCredit, checkBalance } from '@/lib/services/credits'
import { fal } from '@/lib/ai/fal-client'
import { checkRateLimit, RATE_LIMITS } from '@/lib/services/rate-limit'

// ── Community node → fal.ai endpoint + config ────────────────────────────────
const COMMUNITY_ENDPOINTS: Record<string, {
  endpoint: string
  cost: number
  buildInput: (p: Record<string, unknown>) => Record<string, unknown>
  getOutput: (r: unknown) => string
}> = {
  // ── Text → Image ───────────────────────────────────────────────────────────
  dreamshaperNode: {
    endpoint: 'fal-ai/dreamshaper-xl-v2-turbo',
    cost: 5,
    buildInput: (p) => ({ prompt: p.prompt, negative_prompt: p.negativePrompt || 'blurry, low quality', num_images: 1 }),
    getOutput: (r: any) => r.data?.images?.[0]?.url || '',
  },
  dreamshaperV8Node: {
    endpoint: 'fal-ai/dreamshaper-xl-v2-turbo',
    cost: 5,
    buildInput: (p) => ({ prompt: p.prompt, negative_prompt: p.negativePrompt || '', num_images: 1 }),
    getOutput: (r: any) => r.data?.images?.[0]?.url || '',
  },
  sdxlLightning4StepNode: {
    endpoint: 'fal-ai/fast-lightning-sdxl',
    cost: 3,
    buildInput: (p) => ({ prompt: p.prompt, num_inference_steps: 4, num_images: 1 }),
    getOutput: (r: any) => r.data?.images?.[0]?.url || '',
  },
  realisticVisionNode: {
    endpoint: 'fal-ai/realistic-vision-v51',
    cost: 5,
    buildInput: (p) => ({ prompt: p.prompt, negative_prompt: p.negativePrompt || 'cartoon, painting', num_images: 1 }),
    getOutput: (r: any) => r.data?.images?.[0]?.url || '',
  },
  sd3ExplorerNode: {
    endpoint: 'fal-ai/stable-diffusion-v3-medium',
    cost: 6,
    buildInput: (p) => ({ prompt: p.prompt, num_images: 1 }),
    getOutput: (r: any) => r.data?.images?.[0]?.url || '',
  },
  dynavisionNode: {
    endpoint: 'fal-ai/fast-sdxl',
    cost: 4,
    buildInput: (p) => ({ prompt: p.prompt, negative_prompt: 'blurry', num_images: 1 }),
    getOutput: (r: any) => r.data?.images?.[0]?.url || '',
  },
  // ── Image + Prompt → Image ─────────────────────────────────────────────────
  sd3ControlNetsNode: {
    endpoint: 'fal-ai/controlnet-sdxl',
    cost: 10,
    buildInput: (p) => ({ image_url: p.imageUrl, prompt: p.prompt, control_type: p.controlType || 'canny' }),
    getOutput: (r: any) => r.data?.images?.[0]?.url || '',
  },
  ipAdapterSdxlNode: {
    endpoint: 'fal-ai/ip-adapter-face-id-plus',
    cost: 10,
    buildInput: (p) => ({ face_image_url: p.imageUrl, prompt: p.prompt }),
    getOutput: (r: any) => r.data?.images?.[0]?.url || '',
  },
  sdxlControlNetNode: {
    endpoint: 'fal-ai/controlnet-sdxl',
    cost: 8,
    buildInput: (p) => ({ image_url: p.imageUrl, prompt: p.prompt, control_type: p.controlType || 'depth' }),
    getOutput: (r: any) => r.data?.images?.[0]?.url || '',
  },
  controlLcmNode: {
    endpoint: 'fal-ai/lcm-sd15-i2i',
    cost: 3,
    buildInput: (p) => ({ image_url: p.imageUrl, prompt: p.prompt, strength: p.strength ?? 0.7 }),
    getOutput: (r: any) => r.data?.images?.[0]?.url || '',
  },
  sdxlConsistentCharNode: {
    endpoint: 'fal-ai/ip-adapter-face-id-plus',
    cost: 10,
    buildInput: (p) => ({ face_image_url: p.imageUrl, prompt: p.prompt }),
    getOutput: (r: any) => r.data?.images?.[0]?.url || '',
  },
  sdxlMultiControlNetLoraNode: {
    endpoint: 'fal-ai/flux-lora-controlnet',
    cost: 12,
    buildInput: (p) => ({ control_image_url: p.imageUrl, prompt: p.prompt }),
    getOutput: (r: any) => r.data?.images?.[0]?.url || '',
  },
  xlabsFluxDevNode: {
    endpoint: 'fal-ai/flux-lora-controlnet',
    cost: 10,
    buildInput: (p) => ({ control_image_url: p.imageUrl, prompt: p.prompt }),
    getOutput: (r: any) => r.data?.images?.[0]?.url || '',
  },
  fluxReduxControlNetNode: {
    endpoint: 'fal-ai/flux/dev/redux',
    cost: 12,
    buildInput: (p) => ({ image_url: p.imageUrl, prompt: p.prompt || '' }),
    getOutput: (r: any) => r.data?.images?.[0]?.url || '',
  },
  idPreservationFluxNode: {
    endpoint: 'fal-ai/flux-pulid',
    cost: 12,
    buildInput: (p) => ({ reference_image_url: p.imageUrl, prompt: p.prompt }),
    getOutput: (r: any) => r.data?.images?.[0]?.url || '',
  },
  // ── Image → Image (no prompt) ──────────────────────────────────────────────
  realEsrganUpscaleNode: {
    endpoint: 'fal-ai/esrgan',
    cost: 3,
    buildInput: (p) => ({ image_url: p.imageUrl, scale: 2 }),
    getOutput: (r: any) => r.data?.image?.url || r.data?.images?.[0]?.url || '',
  },
  recraftCreativeUpscaleNode: {
    endpoint: 'fal-ai/clarity-upscaler',
    cost: 10,
    buildInput: (p) => ({ image_url: p.imageUrl, scale: 2 }),
    getOutput: (r: any) => r.data?.image?.url || '',
  },
  clarityUpscaleNode: {
    endpoint: 'fal-ai/clarity-upscaler',
    cost: 8,
    buildInput: (p) => ({ image_url: p.imageUrl, scale: 2 }),
    getOutput: (r: any) => r.data?.image?.url || '',
  },
  ultimateSdUpscaleNode: {
    endpoint: 'fal-ai/aura-sr',
    cost: 8,
    buildInput: (p) => ({ image_url: p.imageUrl }),
    getOutput: (r: any) => r.data?.image?.url || '',
  },
  faceAlignNode: {
    endpoint: 'fal-ai/gfpgan',
    cost: 3,
    buildInput: (p) => ({ image_url: p.imageUrl }),
    getOutput: (r: any) => r.data?.image?.url || r.data?.output?.url || '',
  },
  zDepthExtractorNode: {
    endpoint: 'fal-ai/depth-anything-v2',
    cost: 3,
    buildInput: (p) => ({ image_url: p.imageUrl }),
    getOutput: (r: any) => r.data?.image?.url || r.data?.depth?.url || '',
  },
  // ── Face Swap (image + image) ──────────────────────────────────────────────
  faceSwapNode: {
    endpoint: 'fal-ai/inswapper',
    cost: 8,
    buildInput: (p) => ({ target_image_url: p.imageUrl, swap_image_url: p.secondImageUrl }),
    getOutput: (r: any) => r.data?.image?.url || '',
  },
  // ── Image + Prompt → Video ─────────────────────────────────────────────────
  animatedDiffNode: {
    endpoint: 'fal-ai/fast-animatediff/turbo',
    cost: 10,
    buildInput: (p) => ({ image_url: p.imageUrl, prompt: p.prompt }),
    getOutput: (r: any) => r.data?.video?.url || r.data?.output?.url || '',
  },
  // ── Video → Video ──────────────────────────────────────────────────────────
  wan21WithLoraNode: {
    endpoint: 'fal-ai/wan-video/image-to-video',
    cost: 20,
    buildInput: (p) => ({ image_url: p.imageUrl, prompt: p.prompt || '', num_frames: 81 }),
    getOutput: (r: any) => r.data?.video?.url || '',
  },
  wan211Vid2VidNode: {
    endpoint: 'fal-ai/wan-video/v2v',
    cost: 15,
    buildInput: (p) => ({ video_url: p.videoUrl, prompt: p.prompt || '' }),
    getOutput: (r: any) => r.data?.video?.url || '',
  },
  tooncrafterNode: {
    endpoint: 'fal-ai/tooncrafter',
    cost: 15,
    buildInput: (p) => ({ video_url: p.videoUrl, prompt: p.prompt || '' }),
    getOutput: (r: any) => r.data?.video?.url || '',
  },
  gfpganVideoNode: {
    endpoint: 'fal-ai/gfpgan',
    cost: 8,
    buildInput: (p) => ({ image_url: p.imageUrl || p.videoUrl }),
    getOutput: (r: any) => r.data?.image?.url || r.data?.output?.url || '',
  },
  expressionEditorNode: {
    endpoint: 'fal-ai/expression-editor',
    cost: 10,
    buildInput: (p) => ({ image_url: p.imageUrl, expression: p.expression || 'smile' }),
    getOutput: (r: any) => r.data?.image?.url || '',
  },
  robustVideoMattingNode: {
    endpoint: 'fal-ai/birefnet/video',
    cost: 8,
    buildInput: (p) => ({ video_url: p.videoUrl }),
    getOutput: (r: any) => r.data?.video?.url || '',
  },
  increaseFrameRateNode: {
    endpoint: 'fal-ai/rife-v4-6',
    cost: 8,
    buildInput: (p) => ({ video_url: p.videoUrl, multiplier: p.multiplier ?? 2 }),
    getOutput: (r: any) => r.data?.video?.url || '',
  },
  videoSmootherCommunityNode: {
    endpoint: 'fal-ai/video-upscaler',
    cost: 5,
    buildInput: (p) => ({ video_url: p.videoUrl }),
    getOutput: (r: any) => r.data?.video?.url || '',
  },
  klingLipSyncCommunityNode: {
    endpoint: 'fal-ai/kling-video/v1.6/standard/lip-sync',
    cost: 15,
    buildInput: (p) => ({ video_url: p.videoUrl, audio_url: p.audioUrl }),
    getOutput: (r: any) => r.data?.video?.url || '',
  },
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { nodeId, imageUrl, secondImageUrl, videoUrl, audioUrl, prompt, negativePrompt, strength, controlType, expression, multiplier } = body

  if (!nodeId) return NextResponse.json({ error: 'nodeId gerekli' }, { status: 400 })

  const cfg = COMMUNITY_ENDPOINTS[nodeId]
  if (!cfg) return NextResponse.json({ error: `Bilinmeyen community node: ${nodeId}` }, { status: 400 })

  // Auth
  const authHeader = req.headers.get('authorization')
  let userId: string | null = null
  if (authHeader?.startsWith('Bearer ')) {
    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )
    const { data } = await supabaseAdmin.auth.getUser(authHeader.slice(7))
    userId = data.user?.id || null
  }

  // Rate limit
  const rlKey = userId ? `community:${userId}` : `community:${req.headers.get('x-forwarded-for') || 'anon'}`
  const rl = checkRateLimit(rlKey, RATE_LIMITS.community.limit, RATE_LIMITS.community.windowMs)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Çok fazla istek. ${Math.ceil(rl.resetInMs / 1000)}s sonra tekrar dene.` },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.resetInMs / 1000)) } }
    )
  }

  try {
    const input = cfg.buildInput({ imageUrl, secondImageUrl, videoUrl, audioUrl, prompt, negativePrompt, strength, controlType, expression, multiplier })

    const result = await fal.subscribe(cfg.endpoint, {
      input: input as any,
      pollInterval: 3000,
    }) as unknown

    const outputUrl = cfg.getOutput(result)
    if (!outputUrl) return NextResponse.json({ error: 'Çıktı URL alınamadı' }, { status: 500 })

    let creditsUsed = 0
    if (userId) {
      const balance = await checkBalance(userId, cfg.cost)
      if (balance.ok) {
        await deductCredit({ userId, amount: cfg.cost, description: `Community: ${nodeId}` })
        creditsUsed = cfg.cost
      }
    }

    return NextResponse.json({ outputUrl, creditsUsed })

  } catch (err: any) {
    console.error(`[community/${nodeId}]`, err)
    return NextResponse.json({ error: err.message || 'Sunucu hatası' }, { status: 500 })
  }
}
