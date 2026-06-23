import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchChannelGrowth } from './growthApi.js';

// Re-fetch hourly so a newly added month tab / month rollover is picked up automatically.
// Month boundaries are slow; for an instant update use the manual refresh (Imeco logo).
const REFRESH_MS = 60 * 60 * 1000;

export function useGrowthData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const lastGood = useRef(null);

  const load = useCallback(async () => {
    try {
      const result = await fetchChannelGrowth();
      lastGood.current = result;
      setData(result);
      setError(null);
    } catch (err) {
      console.error('[GrowthData]', err.message);
      setError(err.message);
      // Keep showing the last good data instead of blanking out.
      if (lastGood.current) setData(lastGood.current);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  return { data, loading, error, refresh: load };
}
