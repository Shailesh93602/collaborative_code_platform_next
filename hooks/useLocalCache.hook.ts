import { useState, useEffect, useCallback } from 'react';

interface CacheOptions {
  expirationTime?: number; // in milliseconds
}

export function useLocalCache<T>(
  key: string,
  fetchData: () => Promise<T>,
  options: CacheOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAndCacheData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedData = await fetchData();
      setData(fetchedData);
      localStorage.setItem(
        key,
        JSON.stringify({
          data: fetchedData,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setLoading(false);
    }
  }, [key, fetchData]);

  const invalidateCache = useCallback(() => {
    localStorage.removeItem(key);
    fetchAndCacheData();
  }, [key, fetchAndCacheData]);

  useEffect(() => {
    const cachedData = localStorage.getItem(key);
    if (cachedData) {
      const { data: storedData, timestamp } = JSON.parse(cachedData);
      if (!options.expirationTime || Date.now() - timestamp < options.expirationTime) {
        setData(storedData);
        setLoading(false);
        return;
      }
    }
    fetchAndCacheData();
  }, [key, options.expirationTime, fetchAndCacheData]);

  return { data, loading, error, invalidateCache };
}
