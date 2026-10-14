import { defikit } from "@zodiaceco/sdk/actions";
import type { PermissionEntry } from "@zodiaceco/sdk/actions";
import type { allow } from "defi-kit/arb1";

type Arb1Kit = typeof allow;

/**
 * The SDK's `defikit`, typed against DeFi Kit's Arbitrum kit instead of the
 * Ethereum one. Same entries at runtime; only the parameter types differ, so
 * protocols that exist only on Arbitrum type-check, and Arbitrum-only
 * parameter shapes (Aave without a `market`, Arbitrum Morpho vaults) are
 * checked against the right lists.
 */
export const arb1 = defikit as unknown as {
  readonly [P in keyof Arb1Kit]: {
    readonly [V in keyof Arb1Kit[P]]: Arb1Kit[P][V] extends (
      params: infer Params,
    ) => unknown
      ? (params: Params & { label: string }) => PermissionEntry
      : never;
  };
};
