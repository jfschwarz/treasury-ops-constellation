import { custom, swap } from "@zodiaceco/sdk/actions";
import { arb1 } from "../../defikit";
import { TREASURY_ASSETS } from "../../tokens";

// Everything here keeps funds inside the vault: DeFi Kit presets and CoW
// orders pin every receiver / onBehalfOf to the vault itself, so a curator
// can rebalance between positions but never withdraw to an outside address.
export default [
  // Swap & rebalance
  swap({
    label: "Swap between treasury assets on CoW",
    sell: [...TREASURY_ASSETS],
    buy: [...TREASURY_ASSETS],
  }),

  custom({
    label: "Wrap and unwrap ETH",
    permissions: [
      allow.arb1.weth.deposit({ send: true }),
      allow.arb1.weth.withdraw(),
    ],
  }),

  // Lend
  arb1.aave_v3.deposit({
    label: "Supply ETH, WETH, USDC and WBTC to Aave v3",
    targets: ["ETH", "WETH", "USDC", "WBTC"],
  }),

  arb1.morphoVaults.deposit({
    label: "Deposit USDC into Morpho vaults",
    targets: [
      "0x5c0C306Aaa9F877de636f4d5822cA9F2E81563BA", // Steakhouse High Yield USDC
      "0x7e97fa6893871A2751B5fE961978DCCb2c201E65", // Gauntlet USDC Core
    ],
  }),

  arb1.fluid.deposit({
    label: "Supply ETH, WETH and USDC to Fluid",
    targets: ["ETH", "WETH", "USDC"],
  }),

  // Provide liquidity
  arb1.uniswap_v3.deposit({
    label: "Provide WETH, USDC and WBTC liquidity on Uniswap v3",
    tokens: ["WETH", "USDC", "WBTC"],
    fees: ["0.05%", "0.3%"],
  }),
] satisfies Permissions;
