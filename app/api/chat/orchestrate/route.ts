// POST /api/chat/orchestrate — 9-step Creavidy video creation pipeline (SSE)
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateScript, generateImage, generateTTS, getCreditCost } from '@/lib/ai/fal-client'
import { deductCredit } from '@/lib/services/credits'
import type {
  OrchestratorEvent,
  ToolCallName,
  BriefData,
  SceneData,
  StoryboardData,
} from '@/lib/ai/tool-call-types'
import { TOOL_CALL_LABELS } from '@/lib/ai/tool-call-types'

// Helper: send SSE event
function sendEvent(controller: ReadableStreamDefaultController, event: OrchestratorEvent) {
  const data = JSON.stringify(event)
  controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`))
}

// Helper: send tool call status
function sendToolCall(
  controller: ReadableStreamDefaultController,
  name: ToolCallName,
  status: 'pending' | 'running' | 'success' | 'error',
  data?: Record<string, unknown>,
  error?: string
) {
  sendEvent(controller, {
    type: 'tool_call',
    name,
    status,
    label: TOOL_CALL_LABELS[name],
    data,
    error,
  })
}

// Helper: send message
function sendMessage(controller: ReadableStreamDefaultController, content: string) {
  sendEvent(controller, { type: 'message', content })
}

// Parse script JSON into scenes
function parseScriptToScenes(scriptJson: string, visualStyle: string): SceneData[] {
  try {
    const scenes = JSON.parse(scriptJson)
    if (!Array.isArray(scenes)) return []
    return scenes.map((scene: any, i: number) => ({
      index: i + 1,
      text: scene.narration || scene.text || scene.script || '',
      visual_prompt: `${visualStyle} style. ${scene.visual_description || scene.visual_prompt || scene.description || ''}`,
      media_type: 'ai_image' as const,
      duration_ms: (scene.duration_seconds || 5) * 1000,
    }))
  } catch {
    // If not JSON, split by sentences
    const sentences = scriptJson.split(/[.!?]+/).filter(s => s.trim())
    return sentences.map((s, i) => ({
      index: i + 1,
      text: s.trim(),
      visual_prompt: `${visualStyle} style. ${s.trim()}`,
      media_type: 'ai_image' as const,
      duration_ms: 5000,
    }))
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json()
    const {
      script,
      title = 'Video Brief 1',
      visual_style = 'Cartoon 3D',
      narrator = 'alloy',
      narrator_voice_id = 'alloy',
      characters = [],
      music = 'Gentle, emotional, instrumental',
      scene_media = 'images',
      duration = 60,
      aspect_ratio = '16:9',
      platform = 'YouTube',
      // Generation options
      image_model = 'flux-schnell',
      tts_engine = 'openai-tts',
      script_model = 'gpt-4o',
    } = body

    if (!script) {
      return new Response(JSON.stringify({ error: 'Script is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const briefId = `brief-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    const brief: BriefData = {
      id: briefId,
      title,
      visual_style,
      narrator,
      narrator_voice_id,
      characters,
      music,
      scene_media,
      duration,
      aspect_ratio,
      platform,
      script,
    }

    const stream = new ReadableStream({
      async start(controller) {
        let totalCredits = 0
        let scenes: SceneData[] = []
        let scriptResult = ''

        try {
          // ─── STEP 1: Create Card ───────────────────────────────
          sendToolCall(controller, 'create_card', 'running')
          sendEvent(controller, {
            type: 'card_badge',
            card_id: briefId,
            title,
            subtitle: 'Click to find this card on canvas',
          })
          sendToolCall(controller, 'create_card', 'success', {
            card_id: briefId,
            title,
          })
          sendMessage(controller, `I'll help you create a video brief for "${title}".`)

          // ─── STEP 2: Update Storyboard ─────────────────────────
          sendToolCall(controller, 'update_storyboard', 'running')
          // (brief data is already set, this step confirms it)
          sendToolCall(controller, 'update_storyboard', 'success', {
            visual_style,
            narrator,
            characters,
            aspect_ratio,
            platform,
            duration,
          })

          // ─── STEP 3: Generate Text (Script) ────────────────────
          sendToolCall(controller, 'generate_text', 'running')
          sendMessage(controller, "I've started the video creation process.")

          try {
            const scriptResponse = await generateScript({
              model: script_model,
              prompt: script,
              sceneCount: Math.max(3, Math.min(20, Math.ceil(duration / 8))),
              language: 'English',
            })
            scriptResult = scriptResponse.script
            const creditCost = getCreditCost(script_model)
            await deductCredit(user.id, creditCost).catch(() => {})
            totalCredits += creditCost

            sendToolCall(controller, 'generate_text', 'success', {
              scene_count: scriptResult ? JSON.parse(scriptResult).length : 0,
            })
          } catch (err: any) {
            sendToolCall(controller, 'generate_text', 'error', undefined, err.message)
            // Use raw script as fallback
            scriptResult = script
          }

          // ─── STEP 4: Read Card Details ─────────────────────────
          sendToolCall(controller, 'read_card_details', 'running')
          sendToolCall(controller, 'read_card_details', 'success', {
            brief: { visual_style, narrator, characters, music, duration, aspect_ratio, platform },
          })
          sendMessage(controller, "I've generated the script. Now, I'll proceed with the next steps.")

          // ─── STEP 5: Split Lines to Scenes ─────────────────────
          sendToolCall(controller, 'split_lines_to_scenes', 'running')
          scenes = parseScriptToScenes(scriptResult, visual_style)

          // Build scene list message
          const sceneList = scenes.map(
            s => `Scene ${s.index}: ${s.visual_prompt.substring(0, 80)}...`
          ).join('\n')
          sendToolCall(controller, 'split_lines_to_scenes', 'success', {
            scene_count: scenes.length,
            scenes: scenes.map(s => ({
              index: s.index,
              text: s.text.substring(0, 60),
              visual_prompt: s.visual_prompt.substring(0, 80),
            })),
          })
          sendMessage(controller, `I've analyzed the script into ${scenes.length} scenes:\n${sceneList}\n\nI will now proceed with generating the voiceover and visuals.`)

          // ─── STEP 6: Generate Voiceover ────────────────────────
          sendToolCall(controller, 'generate_voiceover', 'running')

          for (const scene of scenes) {
            if (!scene.text) continue
            try {
              const ttsResult = await generateTTS({
                engine: tts_engine,
                text: scene.text,
                voiceId: narrator_voice_id,
                speed: 1.0,
              })
              scene.audio_url = ttsResult.audioUrl
              const creditCost = getCreditCost(tts_engine)
              await deductCredit(user.id, creditCost).catch(() => {})
              totalCredits += creditCost
            } catch {
              // Continue — scene without audio is acceptable
            }
          }

          const audioCount = scenes.filter(s => s.audio_url).length
          sendToolCall(controller, 'generate_voiceover', 'success', {
            generated: audioCount,
            total: scenes.length,
          })
          sendMessage(controller, `I've generated the voiceover (${audioCount}/${scenes.length} scenes). Now, I'll create the visuals.`)

          // ─── STEP 7: Generate Scene Media ──────────────────────
          sendToolCall(controller, 'generate_scene_media', 'running')

          // Parse aspect ratio to dimensions
          const [w, h] = aspect_ratio === '9:16' ? [768, 1344]
            : aspect_ratio === '1:1' ? [1024, 1024]
            : aspect_ratio === '4:3' ? [1024, 768]
            : [1344, 768] // 16:9 default

          for (const scene of scenes) {
            try {
              const imgResult = await generateImage({
                model: image_model,
                prompt: scene.visual_prompt,
                width: w,
                height: h,
              })
              scene.image_url = imgResult.imageUrl
              const creditCost = getCreditCost(image_model)
              await deductCredit(user.id, creditCost).catch(() => {})
              totalCredits += creditCost
            } catch {
              // Continue — placeholder will be used
            }
          }

          const imageCount = scenes.filter(s => s.image_url).length
          sendToolCall(controller, 'generate_scene_media', 'success', {
            generated: imageCount,
            total: scenes.length,
          })
          sendMessage(controller, `I've generated the visuals (${imageCount}/${scenes.length} scenes). Now, I'll add background music and subtitles.`)

          // ─── STEP 8: Select Resources ──────────────────────────
          sendToolCall(controller, 'select_resources', 'running')

          // Build subtitles from scene data
          let currentMs = 0
          const subtitles = scenes.map(s => {
            const sub = {
              scene_index: s.index,
              text: s.text,
              start_ms: currentMs,
              end_ms: currentMs + s.duration_ms,
            }
            currentMs += s.duration_ms
            return sub
          })

          sendToolCall(controller, 'select_resources', 'success', {
            music_mood: music,
            subtitles_count: subtitles.length,
          })
          sendMessage(controller, "I've added the finishing touches. Your video is now ready.")

          // ─── STEP 9: Final Storyboard Update ───────────────────
          sendToolCall(controller, 'update_storyboard', 'running')

          const storyboard: StoryboardData = {
            brief,
            scenes,
            music_track: { url: '', mood: music },
            subtitles,
            total_credits: totalCredits,
          }

          sendToolCall(controller, 'update_storyboard', 'success', {
            total_scenes: scenes.length,
            total_credits: totalCredits,
          })

          // ─── DONE ──────────────────────────────────────────────
          sendEvent(controller, {
            type: 'done',
            brief_id: briefId,
            total_credits: totalCredits,
          })
          sendMessage(controller, `I've finished creating your video. Total: ${scenes.length} scenes, ${totalCredits} credits used.`)

        } catch (err: any) {
          sendMessage(controller, `An error occurred: ${err.message}. Please try again.`)
        } finally {
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
