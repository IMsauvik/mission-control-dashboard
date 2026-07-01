// Hardcoded FY 26-27 annual plan (₹ Crore). Targets are fixed for the year; the
// "achieved" figures are read live from the DSR tabs (see fetchFYPerformance in growthApi.js).
// These targets reconcile with each DSR tab's "Target" row total (e.g. Apr = ₹1.73 Cr).

export const FY_LABEL = 'FY 26-27';

// Annual monthly target plan, Apr → Mar. Sum = 50 Cr.
export const FY_MONTHLY_TARGETS = [
  { month: 'Apr', cr: 1.73 },
  { month: 'May', cr: 2 },
  { month: 'Jun', cr: 2.2 },
  { month: 'Jul', cr: 2.5 },
  { month: 'Aug', cr: 3.57 },
  { month: 'Sep', cr: 4.25 },
  { month: 'Oct', cr: 4.5 },
  { month: 'Nov', cr: 4.75 },
  { month: 'Dec', cr: 5.25 },
  { month: 'Jan', cr: 5.75 },
  { month: 'Feb', cr: 6.5 },
  { month: 'Mar', cr: 7 },
];

export const FY_ANNUAL_TARGET_CR = FY_MONTHLY_TARGETS.reduce((s, m) => s + m.cr, 0); // 50

// Channel-wise FY target (₹ Crore). Keys align with growthApi CHANNELS, plus a synthetic
// "Others" bucket (everything not mapped to a named channel). Sum = 50 Cr.
export const FY_CHANNEL_TARGETS = {
  Flipkart: 10,
  Amazon: 10,
  Blinkit: 15,
  Meesho: 5,
  Cred: 5,
  Others: 5,
};

// Display order + colors for the channel bars. Mapped channels reuse the CHANNELS colors;
// "Others" gets a neutral slate.
export const FY_CHANNEL_ORDER = ['Blinkit', 'Flipkart', 'Amazon', 'Meesho', 'Cred', 'Others'];
export const OTHERS_COLOR = '#64748b';
