import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchAllSalesData } from '../data/sheetsApi.js';

// Data changes only a handful of times a day, so poll hourly. For an immediate update
// after a sheet edit, use the manual refresh (Imeco logo) which clears the cache and refetches.
const REFRESH_MS = 60 * 60 * 1000;
const MAX_FAILURES = 12; // ~12 hours of consecutive failures → reload page

export function useSalesData() {
  const [data, setData] = useState(null);
  const [syncing, setSyncing] = useState(true);
  const [error, setError] = useState(null);
  const failureCount = useRef(0);
  const lastGoodData = useRef(null);

  const load = useCallback(async () => {
    setSyncing(true);
    try {
      const result = await fetchAllSalesData();
      lastGoodData.current = result;
      setData(result);
      setError(null);
      failureCount.current = 0;
    } catch (err) {
      console.error('[SalesData]', err.message);
      setError(err.message);
      failureCount.current += 1;
      if (failureCount.current >= MAX_FAILURES) window.location.reload();
      // Fall back to last known good data so the dashboard stays visible
      if (lastGoodData.current) setData(lastGoodData.current);
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  return { data, syncing, error, refresh: load };
}
