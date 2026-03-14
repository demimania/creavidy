import { describe, it, expect, beforeEach, vi } from 'vitest'
import { checkRateLimit, RATE_LIMITS } from '@/lib/services/rate-limit'

// Reset the module between tests to clear the in-memory Map
beforeEach(() => {
  vi.resetModules()
})

describe('checkRateLimit', () => {
  it('allows first request', () => {
    const result = checkRateLimit('user:test-1', 5, 60_000)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it('counts up correctly within window', () => {
    const key = 'user:test-2'
    checkRateLimit(key, 5, 60_000)
    checkRateLimit(key, 5, 60_000)
    const third = checkRateLimit(key, 5, 60_000)
    expect(third.allowed).toBe(true)
    expect(third.remaining).toBe(2)
  })

  it('blocks when limit is reached', () => {
    const key = 'user:test-3'
    for (let i = 0; i < 3; i++) checkRateLimit(key, 3, 60_000)
    const blocked = checkRateLimit(key, 3, 60_000)
    expect(blocked.allowed).toBe(false)
    expect(blocked.remaining).toBe(0)
    expect(blocked.resetInMs).toBeGreaterThan(0)
  })

  it('resets after window expires', () => {
    const key = 'user:test-4'
    // Fill the limit
    for (let i = 0; i < 2; i++) checkRateLimit(key, 2, 1) // 1ms window
    // Wait for window to expire
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const result = checkRateLimit(key, 2, 1)
        expect(result.allowed).toBe(true)
        expect(result.remaining).toBe(1)
        resolve()
      }, 5)
    })
  })

  it('provides resetInMs for blocked requests', () => {
    const key = 'user:test-5'
    checkRateLimit(key, 1, 60_000)
    const blocked = checkRateLimit(key, 1, 60_000)
    expect(blocked.allowed).toBe(false)
    expect(blocked.resetInMs).toBeGreaterThan(0)
    expect(blocked.resetInMs).toBeLessThanOrEqual(60_000)
  })

  it('isolates different keys', () => {
    checkRateLimit('user:A', 1, 60_000)
    const resultA = checkRateLimit('user:A', 1, 60_000)
    const resultB = checkRateLimit('user:B', 1, 60_000)
    expect(resultA.allowed).toBe(false)
    expect(resultB.allowed).toBe(true)
  })
})

describe('RATE_LIMITS presets', () => {
  it('has reasonable limits for all categories', () => {
    expect(RATE_LIMITS.videoGen.limit).toBeGreaterThanOrEqual(5)
    expect(RATE_LIMITS.imageGen.limit).toBeGreaterThanOrEqual(10)
    expect(RATE_LIMITS.community.limit).toBeGreaterThanOrEqual(10)
    expect(RATE_LIMITS.general.limit).toBeGreaterThanOrEqual(30)
    expect(RATE_LIMITS.llm.limit).toBeGreaterThanOrEqual(5)
  })

  it('all windows are positive', () => {
    for (const preset of Object.values(RATE_LIMITS)) {
      expect(preset.windowMs).toBeGreaterThan(0)
    }
  })
})
