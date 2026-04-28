import { useState, useEffect, useRef } from 'react';
import { fetchAllSalesData } from '../data/sheetsApi.js';

const REFRESH_MS = 5 * 60 * 1000;
const MAX_FAILURES = 12; // ~1 hour of consecutive failures → reload page

export function useSalesData() {
  const [data, setData] = useState(null);
  const [syncing, setSyncing] = useState(true);
  const [error, setError] = useState(null);
  const failureCount = useRef(0);
  const lastGoodData = useRef(null);

  async function load() {
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
  }

  useEffect(() => {
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  return { data, syncing, error };
}
