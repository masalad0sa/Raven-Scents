import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | null = null;
let redisDisabledReason: string | null = null;

if (redisUrl && redisToken) {
  redis = new Redis({
    url: redisUrl,
    token: redisToken,
  });
} else {
  redisDisabledReason = "missing Upstash Redis environment variables";
}

export const CACHE_TTL = {
  PRODUCTS_LIST: 300, // 5 minutes
  PRODUCT_DETAIL: 600, // 10 minutes
  FEATURED: 600, // 10 minutes
};

export async function getOrSet<T>(
  key: string,
  ttl: number,
  fetchFn: () => Promise<T>,
): Promise<T> {
  if (!redis) {
    return fetchFn();
  }

  try {
    const cached = await redis.get<T>(key);
    if (cached !== null) {
      console.log(`✅ Cache HIT: ${key}`);
      return cached;
    }
    console.log(`❌ Cache MISS: ${key}`);
    const data = await fetchFn();
    await redis.setex(key, ttl, data);
    return data;
  } catch (err) {
    // If Redis fails, fallback to direct DB
    redisDisabledReason =
      err instanceof Error ? err.message : "unknown Redis failure";
    redis = null;
    console.warn(
      "Redis cache disabled, falling back to DB:",
      redisDisabledReason,
    );
    return fetchFn();
  }
}

export async function invalidatePattern(pattern: string) {
  const cache = redis;

  if (!cache) {
    return;
  }

  try {
    const keys = await cache.keys(pattern);
    if (keys.length > 0) {
      await Promise.all(keys.map((k) => cache.del(k)));
      console.log(
        `🗑 Invalidated ${keys.length} cache keys matching: ${pattern}`,
      );
    }
  } catch (err) {
    redisDisabledReason =
      err instanceof Error ? err.message : "unknown Redis failure";
    redis = null;
    console.warn("Cache invalidation disabled:", redisDisabledReason);
  }
}
