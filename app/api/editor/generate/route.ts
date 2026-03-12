// POST /api/editor/generate — Generate scene breakdown, images, and TTS for editor
import { NextRequest, NextResponse } from 'next/server'
import { generateImage, generateTTS, generateScript } from '@/lib/ai/fal-client'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 300 // 5 min timeout for long generations

interface SceneInput {
  id: string
  script: string
  order: number
}

// ── Scene breakdown from full script ────────────────────────────────────────
async function breakdownScript(script: string, style: string, duration: number): Promise<{
  scenes: Array<{ timestamp: string; duration: number; script: string; visual_prompt: string }>
  characters: string[]
}> {
  const targetScenes = Math.max(3, Math.min(15, Math.ceil(duration / 20)))

  const result = await generateScript({
    model: 'gemini-2.0',
    prompt: `Break this script/story into exactly ${targetScenes} scenes for a ${style} style video.

For each scene provide:
- scene_number
- narration: the voiceover text for this scene
- visual_description: a detailed image generation prompt for this scene in "${style}" style. Include composition, lighting, mood, camera angle.
- duration_seconds: how long this scene should last

Also extract all character names mentioned in the script.

Script:
${script.substring(0, 4000)}`,
    sceneCount: targetScenes,
    language: 'English',
  })

  // Parse the result
  const parsed = JSON.parse(result.script)
  let timestamp = 0

  const scenes = parsed.map((s: any, i: number) => {
    const dur = s.duration_seconds || s.duration || 4
    const ts = `${String(Math.floor(timestamp / 60)).padStart(2, '0')}:${String(timestamp % 60).padStart(2, '0')}`
    timestamp += dur
    return {
      timestamp: ts,
      duration: dur,
      script: s.narration || s.script || s.text || '',
      visual_prompt: s.visual_description || s.visual_prompt || s.prompt || s.narration || '',
    }
  })

  return { scenes, characters: result.characters || [] }
}

// ── Generate image for a single scene ───────────────────────────────────────
async function generateSceneImage(
  visualPrompt: string,
  style: string,
  aspectRatio: string
): Promise<string> {
  // Map aspect ratio to dimensions
  const dims: Record<string, { w: number; h: number }> = {
    '16:9': { w: 1024, h: 576 },
    '9:16': { w: 576, h: 1024 },
    '1:1': { w: 1024, h: 1024 },
    '4:5': { w: 896, h: 1120 },
  }
  const { w, h } = dims[aspectRatio] || dims['16:9']

  const result = await generateImage({
    model: 'flux-schnell',
    prompt: `${style} style illustration: ${visualPrompt}`,
    width: w,
    height: h,
  })

  return result.imageUrl
}

// ── Generate TTS for a single scene ─────────────────────────────────────────
async function generateSceneTTS(
  text: string,
  voiceId: string,
  engine: string = 'openai-tts'
): Promise<string> {
  const result = await generateTTS({
    engine,
    text,
    voiceId,
    speed: 1.0,
  })
  return result.audioUrl
}

// ── Main handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const {
      action,           // 'breakdown' | 'generate-media' | 'generate-scene-image' | 'generate-scene-tts'
      script,           // for breakdown
      style,            // visual style
      duration,         // target duration in seconds
      aspectRatio,      // '16:9' etc
      scenes,           // for generate-media: array of scenes
      voiceId,          // for TTS
      engine,           // TTS engine
      sceneId,          // for single scene operations
      visualPrompt,     // for single scene image
      text,             // for single scene TTS
    } = body

    // ── Action: Breakdown script into scenes ──
    if (action === 'breakdown') {
      if (!script) return NextResponse.json({ error: 'Script is required' }, { status: 400 })

      const result = await breakdownScript(script, style || 'Cartoon 3D', duration || 60)
      return NextResponse.json({ success: true, ...result })
    }

    // ── Action: Generate media for all scenes (images + TTS) ──
    if (action === 'generate-media') {
      if (!scenes || !Array.isArray(scenes)) {
        return NextResponse.json({ error: 'Scenes array is required' }, { status: 400 })
      }

      // Use streaming response to send progress updates
      const encoder = new TextEncoder()
      const readable = new ReadableStream({
        async start(controller) {
          const totalSteps = scenes.length * 2 // image + tts per scene
          let completedSteps = 0

          const sendProgress = (message: string) => {
            completedSteps++
            const percent = Math.round((completedSteps / totalSteps) * 100)
            controller.enqueue(encoder.encode(
              `data: ${JSON.stringify({ type: 'progress', percent, message, completedSteps, totalSteps })}\n\n`
            ))
          }

          const results: Array<{
            sceneId: string
            imageUrl?: string
            audioUrl?: string
            error?: string
          }> = []

          for (const scene of scenes as SceneInput[]) {
            // Generate image
            try {
              sendProgress(`Generating image for scene ${scene.order + 1}...`)
              const imageUrl = await generateSceneImage(
                scene.script,
                style || 'Cartoon 3D',
                aspectRatio || '16:9'
              )
              results.push({ sceneId: scene.id, imageUrl })

              // Send individual scene update
              controller.enqueue(encoder.encode(
                `data: ${JSON.stringify({ type: 'scene-image', sceneId: scene.id, imageUrl })}\n\n`
              ))
            } catch (err: any) {
              console.error(`[editor/generate] Image failed for scene ${scene.id}:`, err.message)
              results.push({ sceneId: scene.id, error: err.message })
              sendProgress(`Image failed for scene ${scene.order + 1}`)
            }

            // Generate TTS
            try {
              sendProgress(`Generating narration for scene ${scene.order + 1}...`)
              const audioUrl = await generateSceneTTS(
                scene.script,
                voiceId || 'shimmer',
                engine || 'openai-tts'
              )

              // Update existing result
              const existing = results.find(r => r.sceneId === scene.id)
              if (existing) existing.audioUrl = audioUrl

              controller.enqueue(encoder.encode(
                `data: ${JSON.stringify({ type: 'scene-audio', sceneId: scene.id, audioUrl })}\n\n`
              ))
            } catch (err: any) {
              console.error(`[editor/generate] TTS failed for scene ${scene.id}:`, err.message)
              sendProgress(`TTS failed for scene ${scene.order + 1}`)
            }
          }

          // Final result
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({ type: 'complete', results })}\n\n`
          ))
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        },
      })

      return new NextResponse(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      })
    }

    // ── Action: Generate image for a single scene ──
    if (action === 'generate-scene-image') {
      if (!visualPrompt) return NextResponse.json({ error: 'visualPrompt is required' }, { status: 400 })

      const imageUrl = await generateSceneImage(visualPrompt, style || 'Cartoon 3D', aspectRatio || '16:9')
      return NextResponse.json({ success: true, sceneId, imageUrl })
    }

    // ── Action: Generate TTS for a single scene ──
    if (action === 'generate-scene-tts') {
      if (!text) return NextResponse.json({ error: 'text is required' }, { status: 400 })

      const audioUrl = await generateSceneTTS(text, voiceId || 'shimmer', engine || 'openai-tts')
      return NextResponse.json({ success: true, sceneId, audioUrl })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('[/api/editor/generate]', error)
    return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 })
  }
}
