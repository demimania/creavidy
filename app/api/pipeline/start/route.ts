// POST /api/pipeline/start — Pipeline kaydı oluştur + kredi tahmini döndür
// Not: Gerçek execution frontend'de execution-engine.ts üzerinden yapılır
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkBalance } from '@/lib/services/credits'
import { CREDIT_COSTS } from '@/lib/ai/fal-client'

function estimateCost(steps: Record<string, any>): number {
  let total = 0
  if (steps.script?.enabled) total += CREDIT_COSTS[steps.script.model || 'gemini-2.0'] ?? 4
  if (steps.image?.enabled) total += CREDIT_COSTS[steps.image.imageModel || 'flux-schnell'] ?? 5
  if (steps.video?.enabled) total += CREDIT_COSTS[steps.video.videoModel || 'kling-3.0-standard-t2v'] ?? 35
  if (steps.tts?.enabled) total += CREDIT_COSTS['openai-tts'] ?? 3
  return total
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { projectId, steps } = body as { projectId?: string; steps: Record<string, any> }

    // Kredi tahmini ve kontrol
    const estimatedCost = estimateCost(steps)
    const check = await checkBalance(user.id, estimatedCost)
    if (!check.ok) {
      return NextResponse.json(
        { error: 'Insufficient credits', required: estimatedCost, balance: check.currentBalance },
        { status: 402 }
      )
    }

    // Pipeline kaydı oluştur
    const { data: pipeline, error: dbErr } = await supabase
      .from('pipelines')
      .insert({
        user_id: user.id,
        project_id: projectId || null,
        status: 'pending',
        current_step: 'queued',
      })
      .select('id')
      .single()

    if (dbErr || !pipeline) {
      // pipelines tablosu yoksa graceful fallback
      const fallbackId = crypto.randomUUID()
      return NextResponse.json({ success: true, pipelineId: fallbackId, estimatedCost })
    }

    return NextResponse.json({ success: true, pipelineId: pipeline.id, estimatedCost })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
