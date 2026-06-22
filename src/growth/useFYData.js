import { useState, useEffect, useRef } from 'react';
import { fetchFYPerformance } from './growthApi.js';

// Same polling cadence as useGrowthData — a new completed month tab is picked up automatically.
const REFRESH_MS = 30 * 60 * 1000;

export function useFYData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const lastGood = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await fetchFYPerformance();
        if (cancelled) return;
        lastGood.current = result;
        setData(result);
        setError(null);
      } catch (err) {
        console.error('[FYData]', err.message);
        if (cancelled) return;
        setError(err.message);
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
