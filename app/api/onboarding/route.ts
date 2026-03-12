import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { displayName, niche, plan } = await req.json()

    const assignedPlan = plan || 'free'
    const initialCredits: Record<string, number> = { free: 2000, creator: 2000, agency: 5000 }

    // Check if profile already exists to avoid overwriting credits
    const { data: existing } = await supabase
      .from('profiles')
      .select('credits_balance')
      .eq('user_id', user.id)
      .single()

    await supabase.from('profiles').upsert({
      user_id: user.id,
      display_name: displayName,
      niche,
      plan: assignedPlan,
      onboarding_completed: true,
      // Only set initial credits if not already set (don't overwrite existing balance)
      credits_balance: existing?.credits_balance ?? initialCredits[assignedPlan] ?? 50,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
