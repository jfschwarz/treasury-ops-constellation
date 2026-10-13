# Zodiac Constellation — agent notes

This repo is a **Zodiac constellation**: a TypeScript description of an org's smart-account graph (Safes, mods, users, permissions). `bun push` sends the spec to Zodiac, which diffs it against onchain state and gives a UI to review + sign the transactions.

User-facing docs are in `README.md` — read it before suggesting edits to `constellation/`.

## Project map

- `constellation/index.ts` — entrypoint. **Only exported values get pushed.**
- `constellation/roles/<role>/` — `members.ts` (addresses) + `permissions.ts`
  (a list of entries: `custom`, `defikit`, `swap`, `transfer` from
  `@zodiaceco/sdk/actions`, or a bare `allow` kit permission).
- `constellation/allowances/` — reusable Roles allowance objects (key, refill, period, ...).
  A permission draws on one by naming its key: `c.withinAllowance("usdm_user_payouts")`.
- `zodiac.config.ts` — contracts the `allow` kit should know about.
- `.zodiac/` — generated codegen; **never edit by hand**. Re-run `bun pull` (or `bun pull-org` / `bun pull-contracts`) to refresh.
- `.lib/` — internal helpers (push script, type plumbing, globals).

## Conventions

- Entries **describe, they never compile**. `defikit` stores a protocol, verb
  and parameters; `swap` stores its token lists. The permissions are built when
  the constellation is deployed, so a stored revision never carries a copy of
  what a preset meant on the day it was written.

- `constellation`, `allow`, `c`, `ref` are **globals** (set up in `.lib/globals.ts`). Don't import them.
- After editing `zodiac.config.ts` (contracts) or anything that changes referenced accounts/users, run `bun pull` so the generated types match.
- Use Bun: `bun install`, `bun run <script>`, `bun <file.ts>`. Bun auto-loads `.env`.
