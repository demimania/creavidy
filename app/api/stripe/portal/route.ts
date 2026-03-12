// GET /api/stripe/portal — Redirect to Stripe Customer Portal
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Find Stripe customer ID from subscriptions table
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!sub?.stripe_customer_id) {
      // No subscription — redirect to pricing
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/pricing`)
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    })

    return NextResponse.redirect(session.url)
  } catch (err: any) {
    console.error('[/api/stripe/portal]', err)
    return NextResponse.json({ error: err.message || 'Portal error' }, { status: 500 })
  }
}
