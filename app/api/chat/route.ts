import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

// ============================================================================
// VIDEO DIRECTOR SYSTEM PROMPT
// The AI acts as an expert video director who collaborates with the user
// ============================================================================
const SYSTEM_PROMPT = `You are Creavidy's AI Video Director — an expert in crafting compelling video narratives.

Your role is to collaborate with the user to turn their idea into a structured, scene-by-scene video plan.

## HOW TO RESPOND

**If the prompt is vague or missing key details**, ask up to 3 targeted clarifying questions. Be concise.

**If the prompt has enough detail**, immediately produce a Scene Plan in the following JSON format wrapped in a markdown code block:

\`\`\`json
{
  "title": "Short project title",
  "summary": "One-sentence description of the video",
  "total_duration_seconds": 30,
  "scenes": [
    {
      "scene_order": 1,
      "title": "Scene title",
      "script": "Voiceover/narration text for this scene",
      "visual_prompt": "Detailed image/video generation prompt for this scene",
      "duration_seconds": 8,
      "recommended_model": "flux | midjourney | kling | runway | pika",
      "notes": "Optional director notes"
    }
  ]
}
\`\`\`

## RULES
- Always respond in the SAME language the user writes in
- Keep scripts natural and conversational — they will be spoken aloud
- Visual prompts must be descriptive and model-ready (include style, lighting, camera angle)
- Aim for 3-8 scenes per video depending on duration
- Be creative but stay true to the user's vision
- Never mention competitor platforms or tools by name
- If asked about pricing or credits, say: "Check the Creavidy pricing page for the latest rates"
`

// ============================================================================
// POST /api/chat — Streaming AI response endpoint
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!openaiClient) {
      return NextResponse.json(
        { error: 'AI service not configured. Please add OPENAI_API_KEY.' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { project_id, messages, style, duration_seconds, aspect_ratio } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 })
    }

    // Inject style context into system prompt
    const contextualSystem = SYSTEM_PROMPT + (style
      ? `\n\n## CURRENT PROJECT SETTINGS\n- Style: ${style}\n- Duration: ${duration_seconds}s\n- Aspect Ratio: ${aspect_ratio}`
      : '')

    const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: contextualSystem },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ]

    // Stream the response
    const stream = await openaiClient.chat.completions.create({
      model: 'gpt-4o',
      messages: openaiMessages,
      stream: true,
      max_tokens: 2000,
      temperature: 0.8,
    })

    const encoder = new TextEncoder()
    let fullContent = ''
    let inputTokens = 0
    let outputTokens = 0

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content || ''
            if (delta) {
              fullContent += delta
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`))
            }

            // Capture usage from final chunk
            if (chunk.usage) {
              inputTokens = chunk.usage.prompt_tokens
              outputTokens = chunk.usage.completion_tokens
            }
          }

          // Save assistant message to DB if project_id is provided
          if (project_id && fullContent) {
            await supabase.from('chat_messages').insert({
              project_id,
              user_id: user.id,
              role: 'assistant',
              content: fullContent,
              input_tokens: inputTokens,
              output_tokens: outputTokens,
              model_used: 'gpt-4o',
            })
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (err) {
          console.error('[/api/chat stream error]', err)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`))
          controller.close()
        }
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
  } catch (err) {
    console.error('[/api/chat POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
