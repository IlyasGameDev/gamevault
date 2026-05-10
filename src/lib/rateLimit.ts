// Simple in-memory sliding window rate limiter.
// Works within a single serverless instance. For multi-instance production,
// replace with Upstash Redis (@upstash/ratelimit).

interface Window {
  count: number;
  start: number;
}

const store = new Map<string, Window>();

interface RateLimitOptions {
  limit: number;       // max requests
  windowMs: number;    // window size in ms
}

export function rateLimit(key: string, options: RateLimitOptions): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const { limit, windowMs } = options;

  const current = store.get(key);

  if (!current || now - current.start > windowMs) {
    store.set(key, { count: 1, start: now });
    return { allowed: true, remaining: limit - 1 };
  }

  if (current.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  current.count++;
  return { allowed: true, remaining: limit - current.count };
}

// Prune expired entries every 5 minutes to avoid memory growth
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    store.forEach((val, key) => {
      if (now - val.start > 60_000) store.delete(key);
    });
  }, 5 * 60 * 1000);
}
