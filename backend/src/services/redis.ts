import { Redis } from '@upstash/redis';

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('Missing Upstash Redis environment variables');
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const CACHE_TTL = {
  PRODUCTS_LIST: 300,    // 5 minutes
  PRODUCT_DETAIL: 600,   // 10 minutes
  FEATURED: 600,         // 10 minutes
};

export async function getOrSet<T>(
  key: string,
  ttl: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  try {
    const cached = await redis.get<T>(key);
    if (cached !== null) {
      console.log(`✅ Cache HIT: ${key}`);
      return cached;
    }
    console.log(`❌ Cache MISS: ${key}`);
    const data = await fetchFn();
    await redis.setex(key, ttl, JSON.stringify(data));
    return data;
  } catch (err) {
    // If Redis fails, fallback to direct DB
    console.error('Redis error, falling back to DB:', err);
    return fetchFn();
  }
}

export async function invalidatePattern(pattern: string) {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await Promise.all(keys.map(k => redis.del(k)));
      console.log(`🗑 Invalidated ${keys.length} cache keys matching: ${pattern}`);
    }
  } catch (err) {
    console.error('Cache invalidation error:', err);
  }
}
