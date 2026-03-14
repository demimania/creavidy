// POST /api/generate/avatar — AI Avatar generation
// Supports HeyGen (Talking Photo + Video Avatar), Hedra (Character), Runway (Act-Two)
// Long-running jobs return { mode: 'async', jobId } for client-side polling.
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deductCredit } from '@/lib/services/credits'
import { checkRateLimit, RATE_LIMITS } from '@/lib/services/rate-limit'

// ── Credit costs per node ─────────────────────────────────────────────────────
const AVATAR_COSTS: Record<string, number> = {
  heygenTalkingPhotoNode:  20,
  heygenVideoAvatarNode:   30,
  hedraCharacterNode:      25,
  hedraLipSyncNode:        20,
  runwayActTwoAvatarNode:  35,
}

// ── HeyGen ────────────────────────────────────────────────────────────────────
async function heygenTalkingPhoto(params: {
  portraitUrl: string
  script: string
  voiceId: string
}): Promise<{ videoId: string }> {
  const { portraitUrl, script, voiceId } = params
  const apiKey = process.env.HEYGEN_API_KEY
  if (!apiKey) throw new Error('HEYGEN_API_KEY eksik — .env.local dosyasına ekleyin')

  // Step 1: Upload portrait to get talking_photo_id
  const uploadRes = await fetch('https://upload.heygen.com/v1/talking_photo', {
    method: 'POST',
    headers: { 'X-Api-Key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_url: portraitUrl }),
  })
  const uploadData = await uploadRes.json()
  if (!uploadRes.ok) throw new Error(uploadData.message || 'HeyGen fotoğraf yükleme başarısız')

  const talkingPhotoId: string = uploadData.data?.talking_photo_id
  if (!talkingPhotoId) throw new Error('HeyGen: talking_photo_id alınamadı')

  // Step 2: Generate video
  const genRes = await fetch('https://api.heygen.com/v2/video/generate', {
    method: 'POST',
    headers: { 'X-Api-Key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      video_inputs: [{
        character: {
          type: 'talking_photo',
          talking_photo_id: talkingPhotoId,
          talking_style: 'expressive',
        },
        voice: {
          type: 'text',
          input_text: script,
          voice_id: voiceId || '2d5b0e6cf36f460aa7fc47e3eee4ba54',
        },
      }],
      dimension: { width: 1280, height: 720 },
      aspect_ratio: '16:9',
    }),
  })
  const genData = await genRes.json()
  if (!genRes.ok) throw new Error(genData.message || 'HeyGen video üretim başarısız')

  const videoId: string = genData.data?.video_id
  if (!videoId) throw new Error('HeyGen: video_id alınamadı')

  return { videoId }
}

async function heygenVideoAvatar(params: {
  script: string
  avatarId: string
  voiceId: string
}): Promise<{ videoId: string }> {
  const { script, avatarId, voiceId } = params
  const apiKey = process.env.HEYGEN_API_KEY
  if (!apiKey) throw new Error('HEYGEN_API_KEY eksik — .env.local dosyasına ekleyin')

  const res = await fetch('https://api.heygen.com/v2/video/generate', {
    method: 'POST',
    headers: { 'X-Api-Key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      video_inputs: [{
        character: { type: 'avatar', avatar_id: avatarId, avatar_style: 'normal' },
        voice: { type: 'text', input_text: script, voice_id: voiceId },
      }],
      dimension: { width: 1280, height: 720 },
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'HeyGen video üretim başarısız')

  const videoId: string = data.data?.video_id
  if (!videoId) throw new Error('HeyGen: video_id alınamadı')
  return { videoId }
}

async function heygenPollVideoStatus(videoId: string): Promise<string | null> {
  const apiKey = process.env.HEYGEN_API_KEY!
  const res = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
    headers: { 'X-Api-Key': apiKey },
  })
  const data = await res.json()
  const status = data.data?.status
  if (status === 'completed') return data.data?.video_url || null
  if (status === 'failed') throw new Error('HeyGen: video üretim başarısız')
  return null // still processing
}

// ── Hedra ─────────────────────────────────────────────────────────────────────
async function hedraCharacter(params: {
  portraitUrl: string
  audioUrl?: string
  script?: string
}): Promise<{ projectId: string }> {
  const { portraitUrl, audioUrl, script } = params
  const apiKey = process.env.HEDRA_API_KEY
  if (!apiKey) throw new Error('HEDRA_API_KEY eksik — .env.local dosyasına ekleyin')

  // Build request — Hedra accepts image + audio or image + text
  const body: Record<string, unknown> = {
    avatar_image_input: { url: portraitUrl },
    aspect_ratio: '16:9',
  }

  if (audioUrl) {
    body.audio_source = 'audio_upload'
    body.audio_input = { url: audioUrl }
  } else if (script) {
    body.audio_source = 'tts'
    body.text = script
    body.voice_id = 'default'
  }

  const res = await fetch('https://api.hedra.com/web-app/public/v1/characters', {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || data.error || 'Hedra karakter üretim başarısız')

  const projectId: string = data.project_id || data.id
  if (!projectId) throw new Error('Hedra: project_id alınamadı')
  return { projectId }
}

async function hedraPollProjectStatus(projectId: string): Promise<string | null> {
  const apiKey = process.env.HEDRA_API_KEY!
  const res = await fetch(`https://api.hedra.com/web-app/public/v1/projects/${projectId}`, {
    headers: { 'X-API-Key': apiKey },
  })
  const data = await res.json()
  const status: string = data.status
  if (status === 'Completed' || status === 'completed') return data.video_url || data.url || null
  if (status === 'Failed' || status === 'failed') throw new Error('Hedra: üretim başarısız')
  return null // still processing
}

// ── Runway Act-Two ────────────────────────────────────────────────────────────
async function runwayActTwo(params: {
  portraitUrl: string
  audioUrl: string
}): Promise<{ taskId: string }> {
  const { portraitUrl, audioUrl } = params
  const apiKey = process.env.RUNWAYML_API_SECRET
  if (!apiKey) throw new Error('RUNWAYML_API_SECRET eksik — .env.local dosyasına ekleyin')

  const res = await fetch('https://api.runwayml.com/v1/act-two', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-Runway-Version': '2024-11-06',
    },
    body: JSON.stringify({
      model: 'act-two',
      promptImage: portraitUrl,
      promptAudio: audioUrl,
      duration: 10,
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || data.error || 'Runway Act-Two başarısız')

  const taskId: string = data.id
  if (!taskId) throw new Error('Runway: task ID alınamadı')
  return { taskId }
}

async function runwayPollTaskStatus(taskId: string): Promise<string | null> {
  const apiKey = process.env.RUNWAYML_API_SECRET!
  const res = await fetch(`https://api.runwayml.com/v1/tasks/${taskId}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'X-Runway-Version': '2024-11-06',
    },
  })
  const data = await res.json()
  const status: string = data.status
  if (status === 'SUCCEEDED') return data.output?.[0] || null
  if (status === 'FAILED') throw new Error('Runway: görev başarısız')
  return null // RUNNING / PENDING
}

// ── Background polling (server-side, max 5 min) ───────────────────────────────
async function pollUntilDone(
  pollFn: () => Promise<string | null>,
  maxWaitMs = 300_000,
  intervalMs = 4000
): Promise<string> {
  const deadline = Date.now() + maxWaitMs
  while (Date.now() < deadline) {
    const url = await pollFn()
    if (url) return url
    await new Promise(r => setTimeout(r, intervalMs))
  }
  throw new Error('Zaman aşımı — avatar üretimi çok uzun sürdü')
}

// ── Route Handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Rate limit: 10 avatar requests per minute
    const rl = checkRateLimit(`avatar:${user.id}`, 10, 60_000)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Çok fazla istek. ${Math.ceil(rl.resetInMs / 1000)}s sonra tekrar dene.` },
        { status: 429 }
      )
    }

    const body = await req.json()
    const { nodeId, provider, script, portraitUrl, audioUrl, avatarId, voiceId } = body

    if (!nodeId) return NextResponse.json({ error: 'nodeId gerekli' }, { status: 400 })
    if (!provider) return NextResponse.json({ error: 'provider gerekli' }, { status: 400 })

    const cost = AVATAR_COSTS[nodeId] ?? 20
    let outputUrl: string

    // ── HeyGen ───────────────────────────────────────────────────────────────
    if (provider === 'heygen') {
      if (!script) return NextResponse.json({ error: 'Script gerekli' }, { status: 400 })

      let videoId: string

      if (nodeId === 'heygenTalkingPhotoNode') {
        if (!portraitUrl) return NextResponse.json({ error: 'Portre fotoğrafı gerekli' }, { status: 400 })
        const r = await heygenTalkingPhoto({ portraitUrl, script, voiceId: voiceId || '' })
        videoId = r.videoId
      } else {
        const r = await heygenVideoAvatar({ script, avatarId: avatarId || '', voiceId: voiceId || '' })
        videoId = r.videoId
      }

      // Poll for completion (HeyGen takes 1–3 min)
      outputUrl = await pollUntilDone(() => heygenPollVideoStatus(videoId))
    }

    // ── Hedra ─────────────────────────────────────────────────────────────────
    else if (provider === 'hedra') {
      if (!portraitUrl) return NextResponse.json({ error: 'Portre fotoğrafı gerekli' }, { status: 400 })

      const { projectId } = await hedraCharacter({ portraitUrl, audioUrl, script })
      outputUrl = await pollUntilDone(() => hedraPollProjectStatus(projectId))
    }

    // ── Runway Act-Two ────────────────────────────────────────────────────────
    else if (provider === 'runway') {
      if (!portraitUrl) return NextResponse.json({ error: 'Portre fotoğrafı gerekli' }, { status: 400 })
      if (!audioUrl)    return NextResponse.json({ error: 'Ses dosyası gerekli' }, { status: 400 })

      const { taskId } = await runwayActTwo({ portraitUrl, audioUrl })
      outputUrl = await pollUntilDone(() => runwayPollTaskStatus(taskId))
    }

    else {
      return NextResponse.json({ error: `Bilinmeyen provider: ${provider}` }, { status: 400 })
    }

    if (!outputUrl!) return NextResponse.json({ error: 'Çıktı URL alınamadı' }, { status: 500 })

    // Deduct credits
    await deductCredit({ userId: user.id, amount: cost, description: `AI Avatar: ${nodeId}` }).catch(() => {})

    return NextResponse.json({ outputUrl, creditsUsed: cost })

  } catch (err: any) {
    console.error('[/api/generate/avatar]', err)
    return NextResponse.json({ error: err.message || 'Avatar üretim hatası' }, { status: 500 })
  }
}
