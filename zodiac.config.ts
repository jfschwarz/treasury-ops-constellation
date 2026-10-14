import { defineConfig } from "@zodiaceco/sdk/cli/config";

export default defineConfig({
  contracts: {
    arb1: {
      usdc: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      morpho: {
        // What the Morpho app deposits and withdraws through.
        vault_bundles_v1: "0x5afab0b2414e30c92a708234ea1b383ce6317ed5",
        bitget_steakhouse_usdc: "0xbeeff1D5dE8F79ff37a151681100B039661da518",
      },
    },
  },
});
