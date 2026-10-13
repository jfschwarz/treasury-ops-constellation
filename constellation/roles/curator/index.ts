export { default as permissions } from "./permissions";

// The same role key on every vault's Roles mod makes this one policy in
// Zodiac, active on each vault. Members are set per vault (see ../../index.ts)
// so a vault can be run by the whole curator team or by a dedicated specialist.
export const policy = "Treasury Curator";
export const description =
  "Swap, lend, provide liquidity and rebalance a client vault's assets. Cannot move funds into or out of the vault.";
