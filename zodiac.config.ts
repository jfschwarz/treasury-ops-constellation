import { defineConfig } from "@zodiaceco/sdk/cli/config";

export default defineConfig({
  contracts: {
    arb1: {
      weth: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
    },
    eth: {
      weth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      uniswap: {
        positions_nft: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
      },
    },
    megaeth: {
      usdm: "0xfafddbb3fc7688494971a79cc65dca3ef82079e7",
      CompositeExchange: "0x5e3Ae52EbA0F9740364Bd5dd39738e1336086A8b",
    },
  },
});
