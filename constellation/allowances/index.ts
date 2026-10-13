const USDM_DECIMALS = 18n;
const DAILY_ALLOWANCE = 10_000n * 10n ** USDM_DECIMALS;

export const usdm_user_payouts = {
  key: "usdm_user_payouts",
  refill: DAILY_ALLOWANCE,
  maxRefill: DAILY_ALLOWANCE,
  period: 60n * 60n * 24n,
  balance: DAILY_ALLOWANCE,
  timestamp: 0n,
};
// TODO offer daily(amount, decimals = 18), monthly(), helpers in SDK
