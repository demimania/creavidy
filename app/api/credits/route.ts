// GET /api/credits — Get current user's credit balance
// POST /api/credits — Deduct credits after generation
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const PLAN_TOTAL_CREDITS: Record<string, number> = {
  free: 50,
  creator: 500,   // Starter plan ($19/mo)
  agency: 2000,   // Pro plan ($49/mo)
  // legacy aliases
  starter: 500,
  pro: 2000,
  team: 5000,
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('credits_balance, plan, display_name')
      .eq('user_id', user.id)
      .single()

    const plan = profile?.plan || 'free'
    const storedBalance = Number(profile?.credits_balance ?? 0)
    // If balance was never properly initialized (0 or null), default to 2000
    const isDefaulted = storedBalance <= 0
    const remaining = isDefaulted ? 2000 : storedBalance
    const total = isDefaulted ? 2000 : (PLAN_TOTAL_CREDITS[plan] ?? 2000)

    return NextResponse.json({
      remaining,
      total,
      used: Math.max(0, total - remaining),
      plan,
      email: user.email,
      display_name: profile?.display_name || null,
    })
  } catch (error: any) {
    console.error('[/api/credits]', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get credits' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount, description } = await req.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // Fetch current balance
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits_balance, plan')
      .eq('user_id', user.id)
      .single()

    const currentBalance = Number(profile?.credits_balance ?? 0)
    if (currentBalance < amount) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
    }

    const newBalance = currentBalance - amount

    await supabase
      .from('profiles')
      .update({ credits_balance: newBalance })
      .eq('user_id', user.id)

    await supabase.from('credit_transactions').insert({
      user_id: user.id,
      type: 'usage',
      amount_minutes: amount,
      description,
      balance_after: newBalance,
    })

    const plan = profile?.plan || 'free'
    const total = PLAN_TOTAL_CREDITS[plan] ?? 50

    return NextResponse.json({
      success: true,
      remaining: newBalance,
      total,
      used: Math.max(0, total - newBalance),
      plan,
    })
  } catch (error: any) {
    console.error('[/api/credits POST]', error)
    return NextResponse.json(
      { error: error.message || 'Failed to deduct credits' },
      { status: 500 }
    )
  }
}
