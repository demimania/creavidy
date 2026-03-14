// ============================================================================
// Retry utility — Exponential backoff with configurable retries
// ============================================================================

export interface RetryOptions {
  /** Max number of retry attempts (default: 3) */
  maxRetries?: number
  /** Initial delay in ms before first retry (default: 1000) */
  initialDelay?: number
  /** Multiplier for exponential backoff (default: 2) */
  backoffMultiplier?: number
  /** Max delay cap in ms (default: 10000) */
  maxDelay?: number
  /** Called on each retry with attempt number and error */
  onRetry?: (attempt: number, error: Error) => void
  /** Return false to abort retrying for specific errors */
  shouldRetry?: (error: Error) => boolean
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'onRetry' | 'shouldRetry'>> = {
  maxRetries: 3,
  initialDelay: 1000,
  backoffMultiplier: 2,
  maxDelay: 10000,
}

// Errors that should NOT be retried (client-side issues, auth, etc.)
const NON_RETRYABLE_PATTERNS = [
  /unauthorized/i,
  /forbidden/i,
  /invalid.*key/i,
  /insufficient.*credits/i,
  /bad request/i,
  /validation/i,
  /not found/i,
  /content policy/i,
]

/** Check if an error is retryable (server errors, timeouts, rate limits) */
export function isRetryableError(error: Error): boolean {
  const message = error.message || ''

  // Non-retryable patterns
  if (NON_RETRYABLE_PATTERNS.some(p => p.test(message))) return false

  // Retryable: network errors, timeouts, 5xx, rate limits
  if (/timeout/i.test(message)) return true
  if (/network/i.test(message)) return true
  if (/fetch failed/i.test(message)) return true
  if (/ECONNRESET/i.test(message)) return true
  if (/429/i.test(message)) return true // Rate limit
  if (/50[0-9]/i.test(message)) return true // 5xx errors
  if (/pipeline error/i.test(message)) return true

  // Default: retry for unknown errors
  return true
}

/**
 * Execute an async function with retry logic and exponential backoff.
 *
 * @example
 * const result = await withRetry(() => fetch('/api/generate'), {
 *   maxRetries: 3,
 *   onRetry: (attempt, err) => console.log(`Retry ${attempt}: ${err.message}`),
 * })
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxRetries,
    initialDelay,
    backoffMultiplier,
    maxDelay,
  } = { ...DEFAULT_OPTIONS, ...options }

  let lastError: Error = new Error('Unknown error')

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Check if we should retry
      const shouldRetry = options.shouldRetry ?? isRetryableError
      if (!shouldRetry(lastError)) {
        throw lastError
      }

      // Last attempt — don't retry, throw
      if (attempt === maxRetries) {
        throw lastError
      }

      // Calculate delay with exponential backoff + jitter
      const baseDelay = initialDelay * Math.pow(backoffMultiplier, attempt)
      const jitter = Math.random() * 0.3 * baseDelay // ±30% jitter
      const delay = Math.min(baseDelay + jitter, maxDelay)

      options.onRetry?.(attempt + 1, lastError)

      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

/**
 * Execute a fetch with retry, checking response status.
 */
export async function fetchWithRetry(
  url: string,
  init?: RequestInit,
  retryOptions?: RetryOptions,
): Promise<Response> {
  return withRetry(async () => {
    const response = await fetch(url, init)
    if (!response.ok && response.status >= 500) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    if (response.status === 429) {
      throw new Error(`HTTP 429: Rate limited`)
    }
    return response
  }, retryOptions)
}
