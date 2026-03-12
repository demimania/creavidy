import { createClient } from '@/lib/supabase/server'
import { calculateSceneCost } from '@/lib/constants/pricing'

// ============================================================================
// CREDIT SERVICE
// Manages balance checks and credit deductions for AI model usage
// ============================================================================

export type CreditCheckResult =
  | { ok: true; currentBalance: number }
  | { ok: false; currentBalance: number; required: number; shortfall: number }

/**
 * Check if a user has enough credits before starting an AI generation.
 */
export async function checkBalance(
  userId: string,
  requiredCredits: number
): Promise<CreditCheckResult> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('credits_balance')
    .eq('user_id', userId)
    .single()

  const currentBalance = Number(profile?.credits_balance ?? 0)

  if (currentBalance >= requiredCredits) {
    return { ok: true, currentBalance }
  }

  return {
    ok: false,
    currentBalance,
    required: requiredCredits,
    shortfall: requiredCredits - currentBalance,
  }
}

/**
 * Deduct credits from a user's balance after a successful generation.
 * Logs the transaction in credit_transactions table.
 */
export async function deductCredit(params: {
  userId: string
  amount: number
  description: string
  orderId?: string
  modelId?: string
}): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  const { userId, amount, description, orderId, modelId } = params
  const supabase = await createClient()

  // Fetch current balance
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('credits_balance')
    .eq('user_id', userId)
    .single()

  if (fetchError || !profile) {
    return { success: false, error: 'Could not fetch user profile' }
  }

  const currentBalance = Number(profile.credits_balance)
  if (currentBalance < amount) {
    return { success: false, error: 'Insufficient credits', newBalance: currentBalance }
  }

  const newBalance = currentBalance - amount

  // Deduct from profile
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ credits_balance: newBalance })
    .eq('user_id', userId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  // Log transaction
  await supabase.from('credit_transactions').insert({
    user_id: userId,
    type: 'usage',
    amount_minutes: amount,
    description: modelId ? `${description} [${modelId}]` : description,
    order_id: orderId || null,
    balance_after: newBalance,
  })

  return { success: true, newBalance }
}

/**
 * Add bonus or purchase credits to a user's account.
 */
export async function addCredits(params: {
  userId: string
  amount: number
  type: 'purchase' | 'bonus' | 'refund'
  description: string
  orderId?: string
}): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  const { userId, amount, type, description, orderId } = params
  const supabase = await createClient()

  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('credits_balance')
    .eq('user_id', userId)
    .single()

  if (fetchError || !profile) {
    return { success: false, error: 'Profile not found' }
  }

  const newBalance = Number(profile.credits_balance) + amount

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ credits_balance: newBalance })
    .eq('user_id', userId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  await supabase.from('credit_transactions').insert({
    user_id: userId,
    type,
    amount_minutes: amount,
    description,
    order_id: orderId || null,
    balance_after: newBalance,
  })

  return { success: true, newBalance }
}

export { calculateSceneCost }
