import { curator } from "./roles";

const arb = constellation({
  workspace: "Default workspace",
  label: "Client vaults",
  chain: 42161, // arbitrum
});

// The curator team, by their personal Safes. In this test setup Jan and
// Johannes from Zodiac stand in as curators. Next, the real curators are
// invited to the demo organisation and take their place here, so they can
// play through execution themselves (re-run `bun pull-org` once they've joined).
const CURATORS = {
  jan_felix: arb.user["Jan-Felix Schwarz"],
  johannes: arb.user["Johannes Moormann"],
};

// Each client's own two signers. PLACEHOLDERS: nobody holds a key for these.
// With 2 of 3, the curator can't sign anything alone, so the vault couldn't
// change its owners or modules until the real addresses are in place. Replace
// them before deploying.
const CLIENT_SIGNERS = {
  client1: [
    "0x00000000000000000000000000000000000c1e11",
    "0x00000000000000000000000000000000000c1e12",
  ],
  client2: [
    "0x00000000000000000000000000000000000c1e21",
    "0x00000000000000000000000000000000000c1e22",
  ],
} as const;

// One Safe per client, each with its own Roles mod carrying the curator
// policy. To add a client, copy a block with a new label and nonce, pick its
// owners and the curators that run it, and export both nodes.
//
// Owners can do anything, including moving funds in and out, so it takes 2 of
// 3: a curator and the client's two signers. Our side never acts alone; the
// client can, with both of its signers. The curators' day-to-day work goes
// through the Roles mod and needs none of them.

// Client 1 — run by the whole curator team with equal privileges.
const client1Vault = arb.safe["Client 1 Vault"]({
  nonce: 0n,
  vault: true,
  threshold: 2,
  owners: [CURATORS.jan_felix, ...CLIENT_SIGNERS.client1],
  modules: [arb.roles["Client 1 Roles"]],
});

// Bound to the mod on chain. An earlier deployment left a second, unused mod
// (0xc1e5…59eb) behind, so the address is spelled out rather than predicted.
const client1Roles = arb.roles["Client 1 Roles"]({
  address: "0x6b181236d70ad7d4e9104d9a0f88dea06defcd4b",
  target: client1Vault,
  owner: client1Vault,
  avatar: client1Vault,
  roles: {
    curator: { ...curator, members: Object.values(CURATORS) },
  },
});

// Client 2 — the same policy and curator team. A client run by a dedicated
// specialist would use `members: [CURATORS.<specialist>]` instead.
const client2Vault = arb.safe["Client 2 Vault"]({
  nonce: 1n,
  vault: true,
  threshold: 2,
  owners: [CURATORS.jan_felix, ...CLIENT_SIGNERS.client2],
  modules: [arb.roles["Client 2 Roles"]],
});

const client2Roles = arb.roles["Client 2 Roles"]({
  nonce: 0n,
  target: client2Vault,
  owner: client2Vault,
  avatar: client2Vault,
  roles: {
    curator: { ...curator, members: Object.values(CURATORS) },
  },
});

export { client1Vault, client1Roles, client2Vault, client2Roles };
