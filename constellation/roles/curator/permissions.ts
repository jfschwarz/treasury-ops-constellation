import { swap } from "@zodiaceco/sdk/actions";
import { arb1 } from "../../defikit";
import { morphoVaults } from "../../morpho";
import { ETH, TREASURY_ASSETS, WETH } from "../../tokens";

// Everything here keeps funds inside the vault: every receiver / onBehalfOf
// is pinned to the vault itself, so a curator can rebalance between positions
// but never withdraw to an outside address.
export default [
  // Swap & rebalance
  swap({
    label: "Swap between treasury assets on CoW",
    sell: [...TREASURY_ASSETS],
    buy: [...TREASURY_ASSETS],
  }),

  // A swap between ETH and WETH only compiles to WETH deposit / withdraw.
  swap({
    label: "Wrap and unwrap ETH",
    sell: [ETH, WETH],
    buy: [ETH, WETH],
  }),

  // Lend
  arb1.aave_v3.deposit({
    label: "Supply ETH, WETH, USDC and WBTC to Aave v3",
    targets: ["ETH", "WETH", "USDC", "WBTC"],
  }),

  morphoVaults({
    label: "Deposit USDC into Morpho",
    asset: allow.arb1.usdc,
    vaults: [
      {
        address: "0xbeeff1D5dE8F79ff37a151681100B039661da518", // Bitget x Steakhouse USDC (Vault V2)
        kit: allow.arb1.morpho.bitget_steakhouse_usdc,
      },
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
