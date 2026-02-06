import Redis from "ioredis";

// Initialize Redis client (optional, falls back to in-memory cache if unavailable)
let redis: Redis | null = null;
let cacheRedis: Redis | null = null;

const hasRedisConfig =
  (process.env.REDIS_URL && process.env.REDIS_URL.trim() !== "") ||
  (process.env.REDIS_HOST && process.env.REDIS_HOST.trim() !== "");

try {
  if (hasRedisConfig) {
    const commonOpts = {
      maxRetriesPerRequest: null as number | null,
      lazyConnect: true,
      retryStrategy: () => null as number | null,
    };
    if (process.env.REDIS_URL) {
      redis = new Redis(process.env.REDIS_URL, { ...commonOpts });
      cacheRedis = new Redis(process.env.REDIS_URL, {
        ...commonOpts,
        maxRetriesPerRequest: 3,
      });
    } else {
      const hostOpts = {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379"),
        ...commonOpts,
      };
      redis = new Redis(hostOpts);
      cacheRedis = new Redis({ ...hostOpts, maxRetriesPerRequest: 3 });
    }
  }
} catch (err) {
  console.warn("[Cache] Redis unavailable, using in-memory fallback");
}

// Export Redis connection for BullMQ (may be null)
export function getRedisConnection() {
  return redis;
}

if (redis) {
  redis.on("error", err => {
    console.error("[Cache] Redis error:", err);
  });
  redis.on("connect", () => {
    console.log("[Cache] Redis connected");
  });
}

if (cacheRedis) {
  cacheRedis.on("error", err => {
    console.error("[Cache] Redis error:", err);
  });
  cacheRedis.on("connect", () => {
    console.log("[Cache] Redis connected");
  });
}

/**
 * Cache key prefixes for different data types
 */
export const CachePrefix = {
  JOB_LISTING: "job:",
  COMPANY_PROFILE: "company:",
  ACHIEVEMENT_ANALYSIS: "achievement:",
  RESUME_GENERATION: "resume:",
  JD_ANALYSIS: "jd:",
  SKILL_EXTRACTION: "skill:",
  LLM_RESPONSE: "llm:",
} as const;

/**
 * Default TTL values (in seconds)
 */
export const CacheTTL = {
  JOB_LISTING: 24 * 60 * 60, // 24 hours
  COMPANY_PROFILE: 7 * 24 * 60 * 60, // 7 days
  ACHIEVEMENT_ANALYSIS: 30 * 24 * 60 * 60, // 30 days
  RESUME_GENERATION: 60 * 60, // 1 hour
  JD_ANALYSIS: 7 * 24 * 60 * 60, // 7 days
  SKILL_EXTRACTION: 30 * 24 * 60 * 60, // 30 days
  LLM_RESPONSE: 24 * 60 * 60, // 24 hours
} as const;

/**
 * Get cached value
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    if (!redis) return null;
    const value = await redis.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch (error) {
    console.error("Cache get error:", error);
    return null;
  }
}

/**
 * Set cached value with TTL
 */
export async function cacheSet(
  key: string,
  value: any,
  ttl: number = CacheTTL.LLM_RESPONSE
): Promise<boolean> {
  try {
    if (!redis) return false;
    await redis.setex(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error("Cache set error:", error);
    return false;
  }
}

/**
 * Delete cached value
 */
export async function cacheDel(key: string): Promise<boolean> {
  try {
    if (!redis) return false;
    await redis.del(key);
    return true;
  } catch (error) {
    console.error("Cache delete error:", error);
    return false;
  }
}

/**
 * Delete all keys matching pattern
 */
export async function cacheDelPattern(pattern: string): Promise<number> {
  try {
    if (!redis) return 0;
    const keys = await redis.keys(pattern);
    if (keys.length === 0) return 0;
    await redis.del(...keys);
    return keys.length;
  } catch (error) {
    console.error("Cache delete pattern error:", error);
    return 0;
  }
}

/**
 * Check if key exists
 */
export async function cacheExists(key: string): Promise<boolean> {
  try {
    if (!redis) return false;
    const exists = await redis.exists(key);
    return exists === 1;
  } catch (error) {
    console.error("Cache exists error:", error);
    return false;
  }
}

/**
 * Get or set cached value (cache-aside pattern)
 */
export async function cacheGetOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = CacheTTL.LLM_RESPONSE
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    return cached;
  }

  const value = await fetcher();
  await cacheSet(key, value, ttl);
  return value;
}

/**
 * Increment counter
 */
export async function cacheIncr(key: string, ttl?: number): Promise<number> {
  try {
    if (!redis) return 0;
    const value = await redis.incr(key);
    if (ttl && value === 1) {
      await redis.expire(key, ttl);
    }
    return value;
  } catch (error) {
    console.error("Cache incr error:", error);
    return 0;
  }
}

/**
 * Get multiple keys at once
 */
export async function cacheGetMulti<T>(keys: string[]): Promise<(T | null)[]> {
  try {
    if (!redis) return keys.map(() => null);
    if (keys.length === 0) return [];
    const values = await redis.mget(...keys);
    return values.map(v => (v ? JSON.parse(v) : null));
  } catch (error) {
    console.error("Cache get multi error:", error);
    return keys.map(() => null);
  }
}

/**
 * Set multiple keys at once
 */
export async function cacheSetMulti(
  entries: Array<{ key: string; value: any; ttl?: number }>
): Promise<boolean> {
  try {
    if (!redis) return false;
    const pipeline = redis.pipeline();
    for (const { key, value, ttl } of entries) {
      if (ttl) {
        pipeline.setex(key, ttl, JSON.stringify(value));
      } else {
        pipeline.set(key, JSON.stringify(value));
      }
    }
    await pipeline.exec();
    return true;
  } catch (error) {
    console.error("Cache set multi error:", error);
    return false;
  }
}

/**
 * Generate cache key with prefix and params
 */
export function cacheKey(
  prefix: string,
  ...params: (string | number)[]
): string {
  return `${prefix}${params.join(":")}`;
}

export { redis };
