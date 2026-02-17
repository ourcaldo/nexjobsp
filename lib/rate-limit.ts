/**
 * In-memory sliding window rate limiter for Edge/Node.js runtime.
 * 
 * Uses a Map to track request timestamps per IP.
 * Automatically cleans up expired entries to prevent memory leaks.
 * 
 * LIMITATION: In-memory store is per-process. In PM2 cluster mode (multiple workers),
 * each worker has its own rate limit state — effective limits are multiplied by worker count.
 * For strict rate limiting in cluster mode, use Nginx `limit_req` or an external store (Redis).
 * The ecosystem.config.js uses `instances: 1` to avoid this issue.
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
 * 
 * Priority (most trustworthy first when behind Nginx):
 * 1. X-Real-IP — set directly by Nginx from $remote_addr (cannot be spoofed)
 * 2. X-Forwarded-For — use the RIGHTMOST entry (added by the closest trusted proxy),
 *    NOT the leftmost (which is client-supplied and easily spoofed)
 * 3. Falls back to 'anonymous'
 */
export function getClientIp(request: Request): string {
  // Prefer X-Real-IP (set by Nginx, most reliable)
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  // Fallback: rightmost X-Forwarded-For entry (added by trusted reverse proxy)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const ips = forwarded.split(',').map(ip => ip.trim()).filter(Boolean);
    // Rightmost IP is the one added by the closest trusted proxy (Nginx)
    const lastIp = ips[ips.length - 1];
    if (lastIp) return lastIp;
  }

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
