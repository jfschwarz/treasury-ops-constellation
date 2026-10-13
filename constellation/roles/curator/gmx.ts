import { custom } from "@zodiaceco/sdk/actions";
import { USDC, WBTC, WETH } from "../../tokens";

// GMX v2 liquidity (GM pools and GLV vaults) on Arbitrum. DeFi Kit has no
// GMX preset, so these are written by hand.
//
// GMX deposits and withdrawals are two-step: the account transfers tokens into
// a GMX vault contract, then creates a request that a keeper executes later.
// The vault credits a request with whatever balance it received since the last
// one, so a token sent on its own would be claimable by the next caller. Each
// permission therefore only allows the whole `multicall` the GMX app sends —
// `sendWnt` (execution fee), `sendTokens`, `create…` — with every token sent
// being one the request names, and the receiver pinned to the vault.

const SYNTHETICS_ROUTER: `0x${string}` =
  "0x7452c558d45f8afC8c83dAe62C3f8A5BE19c71f6"; // pulls approved tokens
const DEPOSIT_VAULT: `0x${string}` =
  "0xF89e77e8Dc11691C9e8757e84aaFbCD8A67d7A55";
const WITHDRAWAL_VAULT: `0x${string}` =
  "0x0628D46b5D145f183AdB6Ef1f2c97eD1C4701C55";
const GLV_VAULT: `0x${string}` = "0x393053B58f9678C9c28c2cE941fF6cac49C3F8f9";

const ZERO: `0x${string}` = "0x0000000000000000000000000000000000000000";
// The UI fee receiver the GMX app sets. Nobody holds its key, so nobody can
// give it a fee factor.
const GMX_UI_FEE_RECEIVER: `0x${string}` =
  "0xff00000000000000000000000000000000000001";

type Pool = {
  market: `0x${string}`;
  long: `0x${string}`;
  short: `0x${string}`;
};

const ETH_USD: Pool = {
  market: "0x70d95587d40A2caf56bd97485aB3Eec10Bee6336", // GM ETH/USD [WETH-USDC]
  long: WETH,
  short: USDC,
};
const BTC_USD: Pool = {
  market: "0x47c031236e19d024b42f8AE6780E44A573170703", // GM BTC/USD [WBTC-USDC]
  long: WBTC,
  short: USDC,
};
const POOLS = [ETH_USD, BTC_USD];

const GLVS = [
  { glv: "0x528A5bac7E746C9A509A1f4F6dF58A03d44279F9", via: ETH_USD }, // GLV [WETH-USDC]
  { glv: "0xdF03EEd325b82bC1d4Db8b49c30ecc9E05104b96", via: BTC_USD }, // GLV [WBTC-USDC]
] as const;

const exchange = allow.arb1.gmx.exchange_router;
const glvRouter = allow.arb1.gmx.glv_router;

const oneOf = <T>(values: readonly T[]) =>
  values.length === 1 ? values[0]! : c.or(...(values as [T, T, ...T[]]));

const call = c.calldataMatches;

// Swap paths route through GMX markets inside the request. Empty is what the
// app sends; anything else stays within the pools we already allow.
// (`c.every` is typed for mutable arrays, the allow kit's for readonly ones.)
const swapPath = c.every(oneOf(POOLS.map((p) => p.market))) as any;

const requestAddresses = {
  receiver: c.avatar,
  callbackContract: ZERO,
  uiFeeReceiver: oneOf([ZERO, GMX_UI_FEE_RECEIVER]),
  longTokenSwapPath: swapPath,
  shortTokenSwapPath: swapPath,
};

/**
 * The deposit shapes for one pool: either or both of its tokens sent with
 * `sendTokens`, or — for a WETH pool — native ETH riding along in `sendWnt`.
 */
const depositShapes = (
  router: typeof exchange | typeof glvRouter,
  vault: `0x${string}`,
  pool: Pool,
  create: ReturnType<typeof call>,
) => {
  const fee = call(router.sendWnt(vault));
  const send = (token: `0x${string}`) => call(router.sendTokens(token, vault));
  const shapes = [
    c.matches([fee, send(pool.long), create]),
    c.matches([fee, send(pool.short), create]),
    c.matches([fee, send(pool.long), send(pool.short), create]),
  ];
  if (pool.long === WETH) shapes.push(c.matches([fee, create]));
  return shapes;
};

const gmDeposit = (pool: Pool) =>
  depositShapes(
    exchange,
    DEPOSIT_VAULT,
    pool,
    call(
      exchange.createDeposit({
        addresses: {
          ...requestAddresses,
          market: pool.market,
          initialLongToken: pool.long,
          initialShortToken: pool.short,
        },
      }),
    ),
  );

const gmWithdrawal = (pool: Pool) =>
  c.matches([
    call(exchange.sendWnt(WITHDRAWAL_VAULT)),
    call(exchange.sendTokens(pool.market, WITHDRAWAL_VAULT)), // the GM token is the market
    call(
      exchange.createWithdrawal({
        addresses: { ...requestAddresses, market: pool.market },
      }),
    ),
  ]);

const glvDeposit = ({ glv, via }: (typeof GLVS)[number]) =>
  depositShapes(
    glvRouter,
    GLV_VAULT,
    via,
    call(
      glvRouter.createGlvDeposit({
        addresses: {
          ...requestAddresses,
          glv,
          market: via.market,
          initialLongToken: via.long,
          initialShortToken: via.short,
        },
        isMarketTokenDeposit: false,
      }),
    ),
  );

const glvWithdrawal = ({ glv, via }: (typeof GLVS)[number]) =>
  c.matches([
    call(glvRouter.sendWnt(GLV_VAULT)),
    call(glvRouter.sendTokens(glv, GLV_VAULT)),
    call(
      glvRouter.createGlvWithdrawal({
        addresses: { ...requestAddresses, glv, market: via.market },
      }),
    ),
  ]);

const approveRouter = (token: `0x${string}`) => ({
  targetAddress: token,
  signature: "approve(address,uint256)",
  condition: c.calldataMatches([SYNTHETICS_ROUTER], ["address", "uint256"]),
});

const gmShapes = POOLS.flatMap((pool) => [
  ...gmDeposit(pool),
  gmWithdrawal(pool),
]);
const glvShapes = GLVS.flatMap((g) => [...glvDeposit(g), glvWithdrawal(g)]);

export default [
  custom({
    label: "Provide ETH and BTC liquidity on GMX (GM pools and GLV vaults)",
    permissions: [
      ...([WETH, USDC, WBTC] as const).map(approveRouter),
      ...POOLS.map((p) => approveRouter(p.market)),
      ...GLVS.map((g) => approveRouter(g.glv)),

      exchange.multicall(oneOf(gmShapes), { send: true }),
      glvRouter.multicall(oneOf(glvShapes), { send: true }),

      // Pending requests can only be cancelled by their own account, and
      // refund to it.
      exchange.cancelDeposit(),
      exchange.cancelWithdrawal(),
      glvRouter.cancelGlvDeposit(),
      glvRouter.cancelGlvWithdrawal(),
    ],
  }),
] satisfies Permissions;
