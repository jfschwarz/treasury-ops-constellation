import { curator } from "./roles";

const arb = constellation({
  workspace: "Default workspace",
  label: "Client vaults",
  chain: 42161, // arbitrum
});

// The curator team, by their personal Safes. Julia joins once she has a
// personal Safe in Zodiac (re-run `bun pull-org` afterwards).
const CURATORS = {
  jan_felix: arb.user["Jan-Felix Schwarz"],
  johannes: arb.user["Johannes Moormann"],
};

// One Safe per client, each with its own Roles mod carrying the curator
// policy. To add a client, copy this block with a new label and nonce, pick
// the curators that run it, and export both nodes.

// Client 1 — run by the whole curator team with equal privileges.
const client1Vault = arb.safe["Client 1 Vault"]({
  nonce: 0n,
  vault: true,
  // Owners can do anything, including moving funds in and out, so ownership
  // stays separate from the curators' day-to-day role. For this test setup
  // it's Jan alone; a production vault would add the client and/or the firm's
  // other signers and raise the threshold.
  threshold: 1,
  owners: [arb.user["Jan-Felix Schwarz"]],
  modules: [arb.roles["Client 1 Roles"]],
});

const client1Roles = arb.roles["Client 1 Roles"]({
  nonce: 0n,
  target: client1Vault,
  owner: client1Vault,
  avatar: client1Vault,
  roles: {
    curator: { ...curator, members: Object.values(CURATORS) },
  },
});

// A client run by a dedicated specialist looks the same, with
// `members: [CURATORS.<specialist>]`.

export { client1Vault, client1Roles };
