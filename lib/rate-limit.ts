interface RateLimitRecord {
  count: number;
  expiresAt: number;
}

const store = new Map<string, RateLimitRecord>();

// Periodic cleanup of expired rate limit entries every 2 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    if (record.expiresAt < now) {
      store.delete(key);
    }
  }
}, 2 * 60 * 1000).unref?.();

/**
 * Fast in-memory sliding window rate-limiter for API routes.
 */
export function checkRateLimit(
  identifier: string,
  maxHits: number = 10,
  windowMs: number = 60 * 1000
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const record = store.get(identifier);

  if (!record || record.expiresAt < now) {
    const newRecord = {
      count: 1,
      expiresAt: now + windowMs,
    };
    store.set(identifier, newRecord);
    return { success: true, remaining: maxHits - 1, reset: newRecord.expiresAt };
  }

  if (record.count >= maxHits) {
    return { success: false, remaining: 0, reset: record.expiresAt };
  }

  record.count += 1;
  return { success: true, remaining: maxHits - record.count, reset: record.expiresAt };
}
