import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/projects — Create a new project when user submits a prompt
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      initial_prompt,
      title,
      style = 'cinematic',
      voice_id,
      duration_seconds = 30,
      aspect_ratio = '16:9',
      workflow_data,
    } = body

    const prompt = initial_prompt?.trim() || title?.trim()
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt or title is required' }, { status: 400 })
    }

    const insertData: Record<string, unknown> = {
      user_id: user.id,
      initial_prompt: prompt,
      title: title?.trim() || prompt,
      style,
      voice_id: voice_id || null,
      duration_seconds,
      aspect_ratio,
      status: 'draft',
    }
    if (workflow_data) insertData.workflow_data = workflow_data

    const { data: project, error } = await supabase
      .from('projects')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('[/api/projects POST]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ project }, { status: 201 })
  } catch (err) {
    console.error('[/api/projects POST] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/projects — List user's projects
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(Number(searchParams.get('limit') || 20), 50)
    const offset = Number(searchParams.get('offset') || 0)

    const { data: projects, error, count } = await supabase
      .from('projects')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ projects, total: count })
  } catch (err) {
    console.error('[/api/projects GET] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
