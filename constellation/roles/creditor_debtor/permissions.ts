import { defikit } from "@zodiaceco/sdk/actions";

// A DeFi Kit entry is nothing but its parameters and a label: the permissions
// are fetched and compiled when the constellation is deployed, so a stored
// revision never carries a stale copy of what the preset used to mean.
export default [
  defikit.aave_v3.deposit({
    label: "Supply USDC and WETH to Aave v3",
    market: "Core",
    targets: ["USDC", "WETH"],
  }),
  defikit.aave_v3.borrow({
    label: "Borrow USDC and WETH from Aave v3",
    market: "Core",
    targets: ["USDC", "WETH"],
  }),
] satisfies Permissions;
