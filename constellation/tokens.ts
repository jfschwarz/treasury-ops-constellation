// Treasury assets on Arbitrum One. The zero address stands for native ETH in
// `swap` entries.
export const ETH = "0x0000000000000000000000000000000000000000";
export const WETH = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
export const USDC = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"; // native USDC, not USDC.e
export const WBTC = "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f";
// Tether Gold's omnichain token. Far more supply on Arbitrum than the bridged
// PAXG (0xfEb4DfC8C4Cf7Ed305bb08065D08eC6ee6728429).
export const XAUT0 = "0x40461291347e1eCbb09499F3371D3f17f10d7159";

export const TREASURY_ASSETS = [ETH, WETH, USDC, WBTC, XAUT0] as const;
