import { useState, useEffect, useRef } from 'react';
import { fetchChannelGrowth } from './growthApi.js';

// Re-fetch periodically so a newly added month tab / month rollover is picked up
// automatically without a manual reload. Month boundaries are slow, so 30 min is plenty.
const REFRESH_MS = 30 * 60 * 1000;

export function useGrowthData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const lastGood = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await fetchChannelGrowth();
        if (cancelled) return;
        lastGood.current = result;
        setData(result);
        setError(null);
      } catch (err) {
        console.error('[GrowthData]', err.message);
        if (cancelled) return;
        setError(err.message);
        // Keep showing the last good data instead of blanking out.
        if (lastGood.current) setData(lastGood.current);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const id = setInterval(load, REFRESH_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  return { data, loading, error };
}
