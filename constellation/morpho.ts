import { custom } from "@zodiaceco/sdk/actions";

// Morpho vaults on Arbitrum. DeFi Kit's Morpho preset only knows the direct
// ERC-4626 calls, while the Morpho app deposits and withdraws through
// VaultBundlesV1. This covers both.
//
// VaultBundlesV1 (verified source on Sourcify) only ever pulls from, deposits
// for, redeems from and pays out to `msg.sender` — here the vault Safe — so
// approving it is safe. The one exception is a referral fee it can split off
// to any address, which is why `referralFeePct` and `referralFeeRecipient` are
// pinned to zero.

type AssetKit = AllowKit["arb1"]["usdc"];
type VaultKit = AllowKit["arb1"]["morpho"]["bitget_steakhouse_usdc"];

type Vault = {
  address: `0x${string}`;
  kit: VaultKit;
};

type MorphoVaultsParams = {
  label: string;
  /** The token every vault below takes deposits in. */
  asset: AssetKit;
  vaults: readonly [Vault, ...Vault[]];
};

const VAULT_BUNDLES_V1: `0x${string}` =
  "0x5afab0b2414e30c92a708234ea1b383ce6317ed5";

const ZERO: `0x${string}` = "0x0000000000000000000000000000000000000000";

const bundles = allow.arb1.morpho.vault_bundles_v1;

/** Deposit into and withdraw from Morpho vaults that share one asset. */
export const morphoVaults = ({ label, asset, vaults }: MorphoVaultsParams) => {
  const vault = oneOf(vaults.map(({ address }) => address));

  return custom({
    label,
    permissions: [
      asset.approve(oneOf([VAULT_BUNDLES_V1, ...vaults.map((v) => v.address)])),

      // The Morpho app's route
      bundles.vaultBundlesV1Deposit(
        vault,
        undefined, // assets
        undefined, // maxSharePriceE27
        undefined, // assetPermit
        0, // referralFeePct
        ZERO, // referralFeeRecipient
      ),
      bundles.vaultBundlesV1Withdraw(
        vault,
        undefined, // assets
        undefined, // shares
        undefined, // sharesPermit
        0, // referralFeePct
        ZERO, // referralFeeRecipient
      ),

      // Straight into the vaults
      ...vaults.flatMap(({ kit }) => [
        kit.approve(VAULT_BUNDLES_V1),
        kit.deposit(undefined, c.avatar),
        kit.mint(undefined, c.avatar),
        kit.withdraw(undefined, c.avatar, c.avatar),
        kit.redeem(undefined, c.avatar, c.avatar),
      ]),
    ],
  });
};

const oneOf = (addresses: readonly `0x${string}`[]) =>
  addresses.length === 1
    ? addresses[0]!
    : c.or(
        ...(addresses as [`0x${string}`, `0x${string}`, ...`0x${string}`[]]),
      );
