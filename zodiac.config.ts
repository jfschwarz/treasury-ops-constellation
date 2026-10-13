import { defineConfig } from "@zodiaceco/sdk/cli/config";

export default defineConfig({
  contracts: {
    arb1: {
      weth: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
      gmx: {
        // GMX redeploys its routers on upgrades. Check these against
        // https://github.com/gmx-io/gmx-interface/blob/release/sdk/src/configs/contracts.ts
        // and re-run `bun pull-contracts` when they change.
        exchange_router: "0x7dE39FF2e232A2203196788d37e234cF8F1b83f1",
        glv_router: "0x167540D2DFF14120365CfDDF2F86e3045D4fa712",
      },
    },
  },
});
