// ============================================================================
// Simple in-process rate limiter for API routes.
// Uses a sliding window counter per key (userId or IP).
// No external dependencies — works on Vercel serverless (per-instance).
//
// For multi-instance production use, replace the Map with Upstash Redis:
//   https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
// ============================================================================

interface WindowEntry {
  count: number
  windowStart: number
}

// In-memory store — shared within one serverless instance
const windows = new Map<string, WindowEntry>()

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetInMs: number
}

/**
 * Check rate limit for a given key.
 *
 * @param key       Unique identifier (userId, IP address, etc.)
 * @param limit     Max requests allowed in the window
 * @param windowMs  Time window in milliseconds (default 60_000 = 1 minute)
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs = 60_000
): RateLimitResult {
  const now = Date.now()
  const entry = windows.get(key)

  // No entry or window expired → reset
  if (!entry || now - entry.windowStart >= windowMs) {
    windows.set(key, { count: 1, windowStart: now })
    return { allowed: true, remaining: limit - 1, resetInMs: windowMs }
  }

  if (entry.count >= limit) {
    const resetInMs = windowMs - (now - entry.windowStart)
    return { allowed: false, remaining: 0, resetInMs }
  }

  entry.count++
  return {
    allowed: true,
    remaining: limit - entry.count,
    resetInMs: windowMs - (now - entry.windowStart),
  }
}

/**
 * Preset limits for common route types.
 * Adjust these based on average operation cost.
 */
export const RATE_LIMITS = {
  /** Heavy AI video generation */
  videoGen:    { limit: 10,  windowMs: 60_000 },  // 10/min
  /** Image generation */
  imageGen:    { limit: 30,  windowMs: 60_000 },  // 30/min
  /** Community nodes */
  community:   { limit: 20,  windowMs: 60_000 },  // 20/min
  /** General API calls */
  general:     { limit: 60,  windowMs: 60_000 },  // 60/min
  /** Script/LLM calls */
  llm:         { limit: 15,  windowMs: 60_000 },  // 15/min
} as const
