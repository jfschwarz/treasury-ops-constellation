# Treasury Ops Constellation

DeFi treasury operations on behalf of our investors: one Safe vault per client on
Arbitrum, run by curators who can swap, lend, provide liquidity and rebalance,
but never move funds into or out of a vault.

This is an initial test setup and a basis for discussion and for refining the
policy together. See [Open questions](#open-questions).

## What it sets up

On Arbitrum One (`constellation/index.ts`), per client:

- **Client N Vault**: a Safe holding the client's funds. Owned 2-of-3 by a
  curator and two signers of the client's. Our side can never move funds or
  change the setup alone; the client can, with both of its signers.
- **Client N Roles**: a Roles mod on the vault. It holds the curator policy and
  is owned by the vault itself, so only the vault's owners can change it.

There are two clients, both run by the whole curator team. The **Treasury
Curator policy** (`constellation/roles/curator/`) is the same on every vault,
with the curators set per vault. A vault can be run by the whole team with
equal privileges, or by a dedicated specialist. To add a client, copy a client
block with a new label and nonce.

Assets: ETH, WETH, USDC (native), WBTC and XAUt0 (`constellation/tokens.ts`).

## Who's who in this test setup

Jan and Johannes from Zodiac stand in as curators, and Jan also as the
curator-side vault owner. The client signers are placeholder addresses that
nobody holds a key for.

Next, we invite your curators to the demo organisation in Zodiac and make them
curators, so they can play through executing transactions themselves. For that
we need each curator's **wallet address and email**.

## What curators can do

Every receiver is pinned to the vault, so funds can only move between the
vault's own positions.

| Protocol   | Allowed                                                      |
| ---------- | ------------------------------------------------------------ |
| CoW Swap   | Swap between all treasury assets                             |
| WETH       | Wrap and unwrap ETH                                          |
| Aave v3    | Supply ETH, WETH, USDC, WBTC                                 |
| Morpho     | Deposit into and withdraw from Bitget x Steakhouse USDC      |
| Fluid      | Supply ETH, WETH, USDC                                       |
| Uniswap v3 | Provide WETH/USDC/WBTC liquidity in the 0.05% and 0.3% pools |

The permissions are in `constellation/roles/curator/permissions.ts`.

## Open questions

**GMX.** GMX v2 liquidity (GM pools and GLV vaults) isn't in this first
iteration. Scoping it tightly enough takes a bit more time, and it will follow
in the next one.

**Pendle.** Pendle's only active markets on Arbitrum are USDai and sUSDai, none
of which match our assets, so Pendle is left out. Pendle markets also expire,
so their permissions would need replacing every epoch. Options:

- Skip Pendle for now (current state).
- Accept USDai / sUSDai exposure on Arbitrum.
- Run Pendle positions on Ethereum, which would mean a second vault per client
  on another chain.

**Gold.** XAUt0 was picked over PAXG because it has far more supply on
Arbitrum (about 130.7 vs 15.7 tokens). Neither Aave nor Fluid lists gold on
Arbitrum, so gold can only be swapped, not lent. Is that enough?

**Morpho.** For now only Bitget x Steakhouse USDC. Curators can use it both
directly and through the Morpho app. Do we want more vaults?

**Borrowing.** Curators can supply but not borrow. Borrowing on Aave and Morpho
can be added if we want leverage or looping strategies.

**Uniswap.** Curators can provide liquidity on Uniswap, but not swap there
directly. Swaps go through CoW, which routes through Uniswap liquidity anyway.
Is providing liquidity on Uniswap wanted at all, given the active management it
needs?

**Spending limits.** Nothing caps how much curators can move within a vault per
day or week. Per-period limits on swap volume, for example, would bound what a
compromised or mistaken curator account could do. Do we want them, and at what
levels?

**Vault ownership.** Owners can do anything, including withdrawing, so each
vault is 2-of-3: one curator plus two client signers. Open points:

- The clients' real signer addresses.
- The client can act without us (both of its signers), including moving funds
  out or removing the curator policy. Is that intended, since it's the client's
  money, or should every owner action need a curator?
- One named curator holds the curator seat. Should any one curator be able to
  co-sign instead? Adding more curators as owners at the same threshold
  wouldn't do it: two curators could then act without the client. The curator
  seat would have to be a curator Safe (itself 1-of-n over the curators).

**Specialists.** How do we assign dedicated specialists to future clients?

## Deployment status

- **Client 1** is live: vault `0x22a2…6839` with its Roles mod `0x6b18…cd4b`.
  On chain it's still owned 1-of-1 by Jan; the 2-of-3 ownership and Client 2
  aren't deployed yet.
- **Don't push the 2-of-3 ownership until the client signers are real.** With
  both client signers being placeholders, Jan alone can't reach 2 of 3, so the
  vault could never change its owners or setup again.
- Before relying on the Morpho permissions, test a small deposit and
  withdrawal.

---

The rest of this README is the constellation template's guide to working with
this repository.

## What's a Zodiac constellation?

A **constellation** is a declarative description of an organisation's smart account graph: which Safes you operate, what roles each one delegates, who's allowed to do what, and how the pieces are wired together.

You write the desired state in TypeScript. Zodiac figures out the diff against what's currently onchain, plans the most efficient set of transactions, and gives you a UI to review and sign them. Anyone with access to the workspace sees the same plan and the same audit trail.

## Why manage your accounts as code?

Treat your smart account graph the way you treat infrastructure: declare it as code, version it in git, ship it like software. AI-assisted edits, branch + PR review, CI dry runs, and a safe path to onchain via Zodiac's review and signing UI.

## Getting started

1. `bun install`.
2. `bun pull` — on first run, opens a browser to authorize this directory and mint a Zodiac API key (written to `.env`). Then fetches your org's users and accounts and generates typed codegen. (If you don't have a Zodiac account yet, the browser walks you through sign-up first.)
   > `.env` is already in `.gitignore` — don't commit your API key.
3. Add the contracts you want to permission to `zodiac.config.ts`, keyed by chain prefix:
   ```ts
   export default defineConfig({
     contracts: {
       eth: {
         weth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
         uniswap: {
           positions_nft: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
         },
       },
     },
   });
   ```
4. Re-run `bun pull` to fetch the new contract ABIs and regenerate the `allow` kit.
   > **VS Code tip:** if `allow.eth.weth.*` (or whatever you just added) doesn't autocomplete after the pull, restart the TypeScript server: `Cmd+Shift+P` → "TypeScript: Restart TS Server".
5. Edit `constellation/index.ts` — plus the role files under `constellation/roles/<role>/` and any reusable allowances under `constellation/allowances/` — to describe the state you want onchain.
6. `bun push` — sends the spec to Zodiac and opens a browser tab where you review the diff and sign the transactions.

Day-to-day loop after the initial setup: edit the constellation → `bun push`. Whenever you reference a new contract in `zodiac.config.ts` re-run `bun pull` so the `allow` kit knows about it.

## Project layout

```
.
├── constellation/
│   ├── index.ts            # entrypoint — what gets pushed
│   ├── allowances/         # reusable Roles-allowance objects
│   └── roles/<role>/       # one folder per role
│       ├── index.ts
│       ├── members.ts      # addresses allowed to assume the role
│       └── permissions.ts  # what the role can call
├── zodiac.config.ts        # contracts the `allow` kit should know about
├── abis/                   # generated by `bun pull` (or `bun pull-contracts`)
├── .zodiac/                # generated codegen (git-ignored)
└── .env                    # ZODIAC_API_KEY for this directory (git-ignored)
```

## Defining a constellation

`constellation/index.ts` is what gets pushed to Zodiac. Start by scoping a constellation to a single workspace and chain — `constellation()` is a global, no import needed:

```ts
const eth = constellation({
  workspace: "Default workspace",
  label: "Backend Operator",
  chain: 1, // ethereum
});
```

`bun pull-org` regenerates type-level info for your workspace, so workspace name, chain id, account labels, role labels, and user handles all autocomplete.

### Existing vs new nodes

Bracket access on `.safe`, `.roles`, and `.user` is your editor for both **existing** accounts (vaults already in your workspace + anything previously pushed via a constellation) and **new** ones you're declaring for the first time.

```ts
// Reference an existing Safe verbatim — no invocation
const treasury = eth.safe["GG Treasury"];

// Tweak an existing Safe — invoke with overrides; all fields are optional
export const tweaked = eth.safe["GG Treasury"]({ threshold: 4 });

// Declare a new Safe — required fields are enforced at compile time
export const backendSafe = eth.safe["Backend Safe"]({
  nonce: 0n,
  threshold: 2,
  owners: ["0xcAF075b4102d96CdF9Bc5A2cEDb170a8b69697E8", eth.user["alice"]],
  modules: [eth.roles["Backend Operator"]],
});
```

For Safes the required fields are `nonce`, `threshold`, `owners`. For Roles mods, `nonce` (plus `owner`, `target`, `avatar` if you want anything other than the wired-up defaults). The SDK injects no runtime defaults — missing required fields surface as TypeScript errors.

#### Binding to an existing Roles mod by address

Bracket access only knows about accounts in your workspace codegen. To configure a Roles mod that's already deployed on-chain but **not** in your workspace, bind it by `address` instead of declaring a `nonce`. Zodiac diffs your spec against the live mod and updates only what changed:

```ts
const arb = constellation({
  workspace: "Default workspace",
  label: "Backend Operator",
  chain: 42161, // arbitrum
});

export const ops = arb.roles["Existing roles mod"]({
  address: "0x88A51CcB262d04B334065Ad425928dF79c4CB7d7",
  roles: { backend_operator },
});
```

A roles node therefore takes **either** `nonce` (deploy a new mod) **or** `address` (bind an existing one) — never both.

### Forward references between new nodes

New nodes can reference each other before either has been invoked — the uninvoked factory works as a forward reference. Both sides just need to be exported so `push()` resolves them by name:

```ts
export const backendSafe = eth.safe["Backend Safe"]({
  nonce: 0n,
  threshold: 2,
  owners: ["0x1234567890123456789012345678901234567890"],
  modules: [eth.roles["Backend Operator"]], // forward ref — not invoked yet
});

export const backendRoles = eth.roles["Backend Operator"]({
  nonce: 0n,
  target: backendSafe,
  owner: backendSafe,
  avatar: backendSafe,
  roles: { backend_operator },
  allowances: { usdm_user_payouts },
});
```

### Users

`eth.user["Alice Example"]` resolves to the user's personal Safe address on the constellation's chain. Useful in owner lists and role-member arrays without hardcoding addresses.

### Pushing

Only the values you `export` end up in the constellation.

`bun push` runs `pull-org` first (via the `prepush` hook), walks your exports, sends the spec to Zodiac, and opens your browser to review the diff and sign the transactions.

### Roles and permissions

Each role lives in its own folder under `constellation/roles/`:

```
constellation/roles/backend_operator/
├── index.ts          # combines members + permissions
├── members.ts        # who can act as this role
└── permissions.ts    # what the role can call
```

Members are an array of addresses, user accessors, or node references — anything that resolves to an address is accepted:

```ts
export default [
  "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  eth.user["alice"],
  eth.safe["Trading Bot"],
] satisfies Members;
```

A role's `permissions` is a list of **entries**. Each entry is one thing the role may do, and each carries a `label` that names it as a single card in the Zodiac UI — labels never reach the chain.

```ts
import { custom, defikit, swap, transfer } from "@zodiaceco/sdk/actions";

export default [
  // A labelled bag of `allow`-kit permissions, for anything the
  // other entries don't cover.
  custom({
    label: "Wrap and unwrap ETH",
    permissions: [
      allow.eth.weth.deposit({ send: true }),
      allow.eth.weth.withdraw(),
    ],
  }),

  // A DeFi Kit preset, by protocol and verb.
  defikit.aave_v3.deposit({
    label: "Supply WETH to Aave v3",
    market: "Core",
    targets: ["WETH"],
  }),

  // Sign CoW orders selling any of `sell` for any of `buy`.
  swap({
    label: "Rebalance stables",
    sell: [USDC, DAI],
    buy: [USDC, DAI],
  }),

  // Send tokens to fixed recipients, optionally bridged over Across.
  transfer({
    label: "Payouts",
    tokens: [USDC],
    to: [eth.safe["Payouts"]],
    allowance: usdc_payouts,
  }),
] satisfies Permissions;
```

A bare `allow`-kit permission is still a valid entry — it just shows up unlabelled:

```ts
export default [allow.eth.weth.withdraw()] satisfies Permissions;
```

**Entries describe, they never compile.** A `defikit` entry stores its protocol, verb and parameters; a `swap` stores its token lists. The permissions are built when the constellation is deployed, so a stored revision always compiles through the current compilers instead of replaying a copy made when it was pushed. A compiled `PermissionSet` — what calling `defi-kit` directly returns — is therefore not an entry; reach for `defikit` instead.

#### Allowances

An allowance is a refilling budget the Roles modifier tracks on-chain. Define it once under `constellation/allowances/`, hand it to the roles node, and reference it from any permission that should draw on it:

```ts
// constellation/allowances/index.ts
export const usdm_user_payouts = {
  key: "usdm_user_payouts",
  refill: 10_000n * 10n ** 18n, // added each period
  maxRefill: 10_000n * 10n ** 18n, // cap the balance refills to
  period: 60n * 60n * 24n, // seconds
  balance: 10_000n * 10n ** 18n, // starting balance
  timestamp: 0n,
};
```

```ts
// constellation/roles/<role>/permissions.ts
allow.megaeth.usdm.transfer(undefined, c.withinAllowance("usdm_user_payouts"));
```

A `key` is at most 31 bytes.

#### Adding contracts

The `allow` kit only knows about contracts listed in `zodiac.config.ts`. Add the address under the right chain prefix (see [Getting started](#getting-started) for an example), then run `bun pull`. If a contract isn't verified on the explorer, the CLI prints the path where you should drop the ABI JSON by hand and re-run.

#### Overloaded functions

The `allow` kit names each member after its ABI function, so a contract that
overloads a name — say sUSDS, with both `deposit(uint256,address)` and
`deposit(uint256,address,uint16)` — has no single member that could mean either.
Address the one you want by its full signature:

```ts
allow.eth.susds["deposit(uint256,address)"](
  c.withinAllowance("sky_savings"),
  c.avatar,
);
```

## Commands

| Command              | What it does                                                                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun pull`           | Refresh codegen — both org data and contract ABIs. On first run, also authorizes this directory (mints an API key, writes `.env`) and scaffolds `zodiac.config.ts`. |
| `bun pull-org`       | Just the org data (users, accounts)                                                                                                                                 |
| `bun pull-contracts` | Just the contract ABIs and `allow` kit types — run this after you add a contract to `zodiac.config.ts`                                                              |
| `bun push`           | Send the constellation to Zodiac and open the review URL. Runs `pull-org` first so you push against fresh org state.                                                |
| `bun format`         | Prettier across the repo                                                                                                                                            |
