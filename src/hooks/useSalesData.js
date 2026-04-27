import { useState, useEffect } from 'react';
import { fetchAllSalesData } from '../data/sheetsApi.js';
import {
  monthlyData as staticMonthlyData,
  channelData as staticChannelData,
  aprDailyData as staticDailyData,
  APRIL_MTD, APRIL_TARGET, APRIL_DAYS_DONE, APRIL_TOTAL_DAYS,
  CURRENT_MRR,
} from '../data/salesData.js';

const STATIC_FALLBACK = {
  monthlyData: staticMonthlyData,
  channelData: staticChannelData,
  dailyData: staticDailyData,
  currentMTD: APRIL_MTD,
  currentTarget: APRIL_TARGET,
  daysDone: APRIL_DAYS_DONE,
  totalDays: APRIL_TOTAL_DAYS,
  dailyTarget: Math.round(APRIL_TARGET / APRIL_TOTAL_DAYS),
  currentMRR: CURRENT_MRR,
  currentMonthLabel: "Apr '26",
};

const REFRESH_MS = 5 * 60 * 1000;

export function useSalesData() {
  const [data, setData] = useState(STATIC_FALLBACK);
  const [syncing, setSyncing] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setSyncing(true);
    try {
      const result = await fetchAllSalesData();
      setData(result);
      setError(null);
    } catch (err) {
      console.error('[SalesData]', err.message);
      setError(err.message);
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
