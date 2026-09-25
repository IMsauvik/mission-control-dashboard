// FY targets (₹ Crore). The Google Sheet is the source of truth: every month whose DSR
// tab exists and has a "Target" row uses that sheet target. The typed plans below are
// only a FALLBACK for months that don't have a tab (or a target) yet — e.g. Oct→Mar
// early in the year. As each month's tab is added, its sheet target replaces the plan.
//
// Plans are keyed by the FY's start year (2026 = FY 26-27). For a new FY, add an entry;
// if none exists the dashboard simply runs on sheet targets alone.

export const FY_MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

const TYPED_PLANS = {
  2026: {
    // Month-wise plan, Apr → Mar. Sum = 50 Cr.
    monthlyCr: {
      Apr: 1.73, May: 2, Jun: 2.2, Jul: 2.5, Aug: 3.57, Sep: 4.25,
      Oct: 4.5, Nov: 4.75, Dec: 5.25, Jan: 5.75, Feb: 6.5, Mar: 7,
    },
    // Channel-wise plan. Keys align with growthApi CHANNELS plus a synthetic "Others"
    // bucket. Used as each channel's SHARE of a plan month (Blinkit 15/50 = 30%).
    channelCr: { Flipkart: 10, Amazon: 10, Blinkit: 15, Meesho: 5, Cred: 5, Others: 5 },
  },
};

// Financial year runs Apr → Mar; `month` is 0-based (Jan = 0).
export function fyStartYearOf(month, year) {
  return month >= 3 ? year : year - 1;
}

export function fyLabel(startYear) {
  const yy = (y) => String(y).slice(-2);
  return `FY ${yy(startYear)}-${yy(startYear + 1)}`;
}

// Resolve the year's targets month by month: sheet first, typed plan second.
//   sheetMonths = [{ month: 'Apr', targetCr, channelTargetCr?: { Blinkit: cr, … } }]
//                 for every FY month whose DSR tab exists.
// Returns per-month targets (with their source), the annual total and per-channel FY totals.
export function resolveFYPlan(startYear, sheetMonths = []) {
  const typed = TYPED_PLANS[startYear] || null;
  const typedChannelTotal = typed
    ? Object.values(typed.channelCr).reduce((s, v) => s + v, 0)
    : 0;
  const sheetByMonth = new Map(
    sheetMonths.filter((m) => m.targetCr > 0).map((m) => [m.month, m])
  );

  const monthly = FY_MONTHS.map((month) => {
    const sheet = sheetByMonth.get(month);
    if (sheet) {
      return { month, cr: sheet.targetCr, source: 'sheet', channelCr: sheet.channelTargetCr || null };
    }
    const planCr = typed?.monthlyCr[month];
    if (planCr != null) {
      const channelCr = {};
      for (const [key, cr] of Object.entries(typed.channelCr)) {
        channelCr[key] = typedChannelTotal > 0 ? (cr / typedChannelTotal) * planCr : 0;
      }
      return { month, cr: planCr, source: 'plan', channelCr };
    }
    return { month, cr: null, source: null, channelCr: null };
  });

  const channelCr = {};
  for (const m of monthly) {
    for (const [key, cr] of Object.entries(m.channelCr || {})) {
      channelCr[key] = (channelCr[key] || 0) + cr;
    }
  }

  const yy = (y) => String(y).slice(-2);
  return {
    startYear,
    label: fyLabel(startYear),
    rangeLabel: `Apr '${yy(startYear)} — Mar '${yy(startYear + 1)}`,
    monthly,
    annualCr: monthly.reduce((s, m) => s + (m.cr || 0), 0),
    channelCr,
    sheetMonths: monthly.filter((m) => m.source === 'sheet').length,
    planMonths: monthly.filter((m) => m.source === 'plan').length,
  };
}

// Display order + colors for the channel bars. Mapped channels reuse the CHANNELS colors;
// "Others" gets a neutral slate.
export const FY_CHANNEL_ORDER = ['Blinkit', 'Flipkart', 'Amazon', 'Meesho', 'Cred', 'Others'];
export const OTHERS_COLOR = '#64748b';
