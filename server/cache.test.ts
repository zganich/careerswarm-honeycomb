import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  cacheGet,
  cacheSet,
  cacheDel,
  cacheExists,
  cacheGetOrSet,
  cacheIncr,
  cacheKey,
  CachePrefix,
  redis,
} from "./cache";

describe.skip("Cache Layer (requires Redis)", () => {
  beforeAll(async () => {
    // Wait for Redis connection
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    // Clean up test keys
    await redis.flushdb();
    await redis.quit();
  });

  it("should set and get cached values", async () => {
    const key = cacheKey(CachePrefix.LLM_RESPONSE, "test", "1");
    const value = { result: "test data" };

    await cacheSet(key, value, 60);
    const retrieved = await cacheGet(key);

    expect(retrieved).toEqual(value);
  });

  it("should return null for non-existent keys", async () => {
    const key = cacheKey(CachePrefix.LLM_RESPONSE, "nonexistent");
    const result = await cacheGet(key);

    expect(result).toBeNull();
  });

  it("should delete cached values", async () => {
    const key = cacheKey(CachePrefix.JOB_LISTING, "test", "delete");
    await cacheSet(key, { data: "to delete" }, 60);

    const exists1 = await cacheExists(key);
    expect(exists1).toBe(true);

    await cacheDel(key);

    const exists2 = await cacheExists(key);
    expect(exists2).toBe(false);
  });

  it("should implement cache-aside pattern with getOrSet", async () => {
    const key = cacheKey(CachePrefix.COMPANY_PROFILE, "test", "company");
    let fetchCount = 0;

    const fetcher = async () => {
      fetchCount++;
      return { name: "Test Company", industry: "Tech" };
    };

    // First call should fetch
    const result1 = await cacheGetOrSet(key, fetcher, 60);
    expect(fetchCount).toBe(1);
    expect(result1.name).toBe("Test Company");

    // Second call should use cache
    const result2 = await cacheGetOrSet(key, fetcher, 60);
    expect(fetchCount).toBe(1); // Still 1, not fetched again
    expect(result2.name).toBe("Test Company");
  });

  it("should increment counters", async () => {
    const key = cacheKey("counter", "test");

    const val1 = await cacheIncr(key, 60);
    expect(val1).toBe(1);

    const val2 = await cacheIncr(key, 60);
    expect(val2).toBe(2);

    const val3 = await cacheIncr(key, 60);
    expect(val3).toBe(3);
  });

  it("should generate cache keys with prefix", () => {
    const key1 = cacheKey(CachePrefix.JOB_LISTING, "123");
    expect(key1).toBe("job:123");

    const key2 = cacheKey(
      CachePrefix.ACHIEVEMENT_ANALYSIS,
      "user",
      "456",
      "achievement",
      "789"
    );
    expect(key2).toBe("achievement:user:456:achievement:789");
  });

  it("should respect TTL values", async () => {
    const key = cacheKey(CachePrefix.LLM_RESPONSE, "ttl", "test");
    await cacheSet(key, { data: "expires soon" }, 1); // 1 second TTL

    const exists1 = await cacheExists(key);
    expect(exists1).toBe(true);

    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 1500));

    const exists2 = await cacheExists(key);
    expect(exists2).toBe(false);
  }, 10000);
});
