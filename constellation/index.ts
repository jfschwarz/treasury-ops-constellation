import { curator } from "./roles";
import { CURATORS, VAULT_OWNERS } from "./team";

const arb = constellation({
  workspace: "Default workspace",
  label: "Client vaults",
  chain: 42161, // arbitrum
});

// One Safe per client, each with its own Roles mod carrying the curator
// policy. To add a client, copy this block with a new label and nonce, pick
// the curators that run it, and export both nodes.

// Client 1 — run by the whole curator team with equal privileges.
const client1Vault = arb.safe["Client 1 Vault"]({
  nonce: 0n,
  vault: true,
  threshold: 2,
  owners: [...VAULT_OWNERS],
  modules: [arb.roles["Client 1 Roles"]],
});

const client1Roles = arb.roles["Client 1 Roles"]({
  nonce: 0n,
  target: client1Vault,
  owner: client1Vault,
  avatar: client1Vault,
  roles: {
    curator: { ...curator, members: [CURATORS.jan_felix, CURATORS.julia] },
  },
});

// A future client run by a dedicated specialist would look the same, with
// `members: [CURATORS.<specialist>]`.

export { client1Vault, client1Roles };
