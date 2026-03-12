import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data } = await supabase
      .from('credit_transactions')
      .select('id, amount_minutes, description, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    // Normalize: map amount_minutes → amount for the frontend
    const history = (data || []).map((row: any) => ({
      ...row,
      amount: -(row.amount_minutes ?? 0),
    }))

    return NextResponse.json({ history })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
