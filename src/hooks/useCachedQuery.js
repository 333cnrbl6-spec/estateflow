/**
 * useCachedQuery — React Query wrapper with automatic caching
 * Reduces redundant API calls, especially for expensive operations
 */

import { useQuery } from '@tanstack/react-query';
import { globalCache } from '@/lib/queryCache';

export function useCachedQuery({
  queryKey,
  queryFn,
  cacheTTL = 300000, // 5 minutes default
  ...options
}) {
  const cacheKey = JSON.stringify(queryKey);

  const wrappedQueryFn = async () => {
    // Check if cached
    const cached = globalCache.get(cacheKey);
    if (cached !== null) {
      console.log(`[Cache Hit] ${cacheKey}`);
      return cached;
    }

    // Fetch fresh data
    console.log(`[Cache Miss] ${cacheKey}`);
    const data = await queryFn();

    // Store in cache
    globalCache.set(cacheKey, data, cacheTTL);
    return data;
  };

  return useQuery({
    queryKey,
    queryFn: wrappedQueryFn,
    ...options,
  });
}

// Hook to manually invalidate cache
export function useInvalidateCache() {
  return {
    invalidate: (key) => {
      const cacheKey = JSON.stringify(key);
      globalCache.delete(cacheKey);
    },
    invalidateAll: () => {
      globalCache.clear();
    },
  };
}