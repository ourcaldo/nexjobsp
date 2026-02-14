/**
 * In-memory sliding window rate limiter for Edge/Node.js runtime.
 * 
 * Uses a Map to track request timestamps per IP.
 * Automatically cleans up expired entries to prevent memory leaks.
 */

interface RateLimitEntry {
  timestamps: number[];
  blockedUntil?: number;
}

interface RateLimitConfig {
  /** Maximum requests allowed within the window (default: 100) */
  maxRequests: number;
  /** Time window in seconds (default: 60) */
  windowSeconds: number;
  /** Cleanup interval in milliseconds (default: 60000) */
  cleanupIntervalMs: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  windowSeconds: parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS || '60'),
  cleanupIntervalMs: 60_000,
};

const store = new Map<string, RateLimitEntry>();
let lastCleanup = Date.now();

/**
 * Remove expired entries from the store to prevent memory leaks.
 */
function cleanup(windowMs: number): void {
  const now = Date.now();
  for (const [key, entry] of store) {
    // Remove entries with no recent timestamps and no active block
    const recentTimestamps = entry.timestamps.filter(t => now - t < windowMs);
    if (recentTimestamps.length === 0 && (!entry.blockedUntil || entry.blockedUntil < now)) {
      store.delete(key);
    }
  }
  lastCleanup = now;
}

/**
 * Extract client IP from request headers.
 * Checks X-Forwarded-For first (first IP), then X-Real-IP, then falls back to 'anonymous'.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  return 'anonymous';
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  retryAfter?: number;
}

/**
 * Check if a request should be rate limited.
 * Returns rate limit status and headers info.
 */
export function checkRateLimit(
  ip: string,
  config: Partial<RateLimitConfig> = {}
): RateLimitResult {
  const { maxRequests, windowSeconds, cleanupIntervalMs } = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  const windowMs = windowSeconds * 1000;
  const now = Date.now();

  // Periodic cleanup
  if (now - lastCleanup > cleanupIntervalMs) {
    cleanup(windowMs);
  }

  let entry = store.get(ip);

  if (!entry) {
    entry = { timestamps: [] };
    store.set(ip, entry);
  }

  // Check if currently blocked
  if (entry.blockedUntil && entry.blockedUntil > now) {
    const retryAfter = Math.ceil((entry.blockedUntil - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      limit: maxRequests,
      retryAfter,
    };
  }

  // Remove timestamps outside the current window
  entry.timestamps = entry.timestamps.filter(t => now - t < windowMs);

  if (entry.timestamps.length >= maxRequests) {
    // Block for the remainder of the window
    const oldestInWindow = entry.timestamps[0];
    const retryAfter = Math.ceil((oldestInWindow + windowMs - now) / 1000);
    entry.blockedUntil = now + retryAfter * 1000;

    return {
      allowed: false,
      remaining: 0,
      limit: maxRequests,
      retryAfter,
    };
  }

  // Record this request
  entry.timestamps.push(now);

  return {
    allowed: true,
    remaining: maxRequests - entry.timestamps.length,
    limit: maxRequests,
  };
}
