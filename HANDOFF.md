# Handoff

This file is the source of truth for the next builder and for Carl. If another doc disagrees with this one, follow this one and fix the other doc.

Read next, in this order:

1. [docs/REMAINING-WORK.md](docs/REMAINING-WORK.md) — the short leftover list.
2. [docs/GO-LIVE.md](docs/GO-LIVE.md) — numbered cutover. Do not start it until the checklist below is done.
3. [docs/KEYS.md](docs/KEYS.md) — how the five contracts' keys should be held. Do not send those transactions.

Old code (read only): <https://github.com/bawcejawn/KnodeGames> at commit `7a93c92d`. This repo: <https://github.com/bawcejawn/KnodeGames2>. Live site today: <https://knodegames.com>, still served from the old repo.

## Purpose

Knode Games is a set of prediction games on the Koinos blockchain. Players stake VHP, pick block producers, and share a weekly pot. Five contracts already hold or control the money. They stay as they are. This repository is a clean rebuild of the code around them so the same games keep working, and two new games can be added without copying the old mess.

## Current state

**Ported and checked in this pull request**

- Folders exist: `web/`, `contracts/`, `bot/`, `kit/`, `games/`, `questions/`, `ruler/`, `ops/`, `tools/`, `tests/`, `docs/`.
- Home page loads `web/early-view.js` before `styles.css` (the tag that was dropped in old commit `a85e65ea`).
- Public fairness page: `web/fairness.html`.
- Question files are not on `main`. `bot.yml` publish is aimed at branch `game-data`. That branch does not exist yet.
- A future desk deploy refuses a treasury that is missing or equal to the owner. The live desk was not touched.
- The hourly workflows have the old repository's timers (cutover, D-240; list in `docs/WORKFLOWS.md`), each behind its `*_ENABLED` switch. Only CI and the full test suite run on a pull request. Website publish stays off until Carl sets `KG_ENABLE_PAGES` to `true`.
- `.ai/` is not in this repo. `/site/` redirects are gone. One-off fund scripts and finished v6 rehearsals are gone. See [docs/DROPPED.md](docs/DROPPED.md).
- Contract builds: CI rebuilds all five (`npm run test:hashes`) against `contracts/hashes.json`. Vault, desk, race and sponsor match the live code. Picks builds `92d555d0…`, the planned Picks v2; live v1 is `700c296a…`.
- `npm test` passes **51** tests: question scorer, early-view, desk treasury rule, workflow guard, no timers, VHP-swing wording, Inter font, static page checks. `npm run lint` passes. `npm audit --audit-level=high` is clean (moderate findings remain).

**Copied, not verified**

- The rest of `tests/` (the old audit suite). Many still expect old paths or a timer. They are not the CI gate.
- Game recorders other than Fantasy. Fantasy already used `kit/`. The others still use `bot/games/` and `bot/race.ts`.

**Not started**

- Data branch contents. Bot split. Games onto the kit. Page script split. The two new games. Any chain transaction. Pages cutover.

## Layout

| Path | Was in the old repo | What it is |
|---|---|---|
| `web/` | root `*.html`, `*.js`, `*.css`, `media/`, `vendor/` | The only thing that may be published. |
| `web/js/lib/config.js` | (new) | Data-branch settings. `web/data-source.js` has the same defaults. |
| `contracts/vault/` | `game/` | Vault. Address `1Mpmf2ERhjYpX7CCiM11WERuM4j17uT1sr`. |
| `contracts/desk/` | `desk/` | Swap Desk. `1FKTpXBhhHEbu5vVchM8UsVbAvPArJsRmR`. |
| `contracts/picks/` | `picks/` | Picks. `1LmgqBGctL9F2YkyjTXgieTXwnYHh8Y6Pm`. |
| `contracts/race/` | `race/` | Race picks. `1EN7xU8R9tQXjHvrX79qZvvvGkkKWVnB5K`. |
| `contracts/sponsor/` | `sponsor/` | Mana sponsor. `1ByDDSBUzy5zkRceELc54Jh8i41yNRoKt8`. |
| `bot/` | `bot/` | Operator bot and owner commands. `bot/bot.ts` is still one file. |
| `kit/` | `kit/` | Shared game kit. New games go here. |
| `games/` | `games/` | Fantasy and Questions kit modules. Other games' page math is still `web/*-math.js`. |
| `questions/` | root `generator.ts`, `resolver.ts`, `common.ts`, `backtest.ts`, `export-blocks.ts` | Daily Questions. |
| `ruler/` | root `vhp-ruler.js`, `vhp-data.js`, `vhp_ruler.py`, `sims/` | Shared producer measure. One-off sims are in `ruler/sims/archive/`. |
| `ops/node/`, `ops/admin/`, `ops/cloudflare/`, `ops/testnet/` | `node/`, `admin/`, `tools/cloudflare/`, testnet pages | Not published. |
| `game-data/deployment.json` | `game-data/deployment.json` | Contract register. Stays on `main`. Hourly question files do not. |
| `docs/KEYS.md` | `.ai/platform/KEYS_AND_ROLES.md` (rewritten) | Key handover. |
| `docs/ops/ALERTS.md`, `docs/standards/`, `docs/games/` | parts of `.ai/` the tests still read | Operational text only. Not the chat archive. |

Owner address recorded in the old repo: `1635QUrBNDp7WqmFkRvrkGwjJXTtFvH717`. Cold owner already used by Race: `1LMV8EcRFLFGRMFSC7rKw3eQ3PSzLRRFmd`. Confirm on chain before trusting either. Do it read-only.

## Install, test, CI

Node 22. From the repo root:

```bash
npm ci --ignore-scripts
npm test
npm run lint
npm audit --audit-level=high
node tools/ci/assemble-site.mjs
```

`npm test` is the CI set (51 tests). The full old suite is `npm run test:audit`. It is not green. Do not make CI run it until the path fixes in the checklist are done.

`assemble-site` writes `dist-site/` (gitignored): `web/` plus the ABIs the pages still request at `game/abi/…`. That folder is the only thing Pages may upload.

CI is `.github/workflows/ci.yml`. It runs on `pull_request` and `workflow_dispatch` only. One job. **The status check name Carl should require is `ci`.** Workflow name is also `CI`.

`npm run test:hashes` builds the five contracts, each from its own folder and `package-lock.json` (they are not workspaces: the contract builder needs its tools inside the contract folder), and checks each wasm sha256 against `contracts/hashes.json`, plus the vault's pinned withdrawals-only build (`04c27c1a…`). It runs on Linux and Windows (on your PC: `npm run test:hashes`; it needs yarn, sends nothing). CI runs it. `npm run test:contracts` runs each contract's own unit tests (as-pect). They stop at start-up today (a `binaryen` RuntimeError, on Node 20 and 22), and the old repo's CI never ran them either. Get them running before the v6.2 vault change. Neither command touches a chain.

## Remaining work

Do these in order. Each item is done only when its acceptance line is true. Do not start the next game work until 1–4 are green.

1. **Make the old tests pass, or retire the ones that only pin old paths.** Map: tests that read `app.js`, `index.html`, `race-math.js` now need `web/…`. Tests that read `game/`, `desk/`, `picks/`, `race/`, `sponsor/` now need `contracts/vault|desk|picks|race|sponsor/`. Tests that read `node/` need `ops/node/`. Tests that require a `cron:` must instead require no timer. Acceptance: `npm run test:audit` exits 0, or each skipped file is listed in `docs/REMAINING-WORK.md` with the reason, and CI still passes.
2. **Rebuild each contract and compare the wasm sha256 to the live build. Do not upload.** Vault `11043e1fde1d8d7dbac75e9e5e788d058a7116b0dab6149fc09ecdc7b1c4258b`. Desk `309506ccfaadd3427e937aa88cd34c9ea2a9e6088e49e51f014d546489dd5f35`. Picks `700c296a1064b904299c156061d6caf8fcabd0b1765968903f29d89d2426c594`. Race `9993581baf822cd070331008441c5ad974f5c0b134520dfb7422b9efd1873864`. Sponsor `b84e1add3ffa14a7d1933d5ce5a4ad33caa4bca887a489f87f710b3c121c83a6`. Acceptance: a test prints those hashes from a local release build, and CI runs that test. No transaction.
3. **Create the `game-data` branch once, with today's question files copied from the old repo.** Layout is in [docs/DATA.md](docs/DATA.md). Do not commit those files to `main`. Acceptance: `https://raw.githubusercontent.com/bawcejawn/KnodeGames2/game-data/game-data/index.json` returns the current index, and `main` still has only `deployment.json` and `game.json` under `game-data/`.
4. **Split `bot/bot.ts` into `bot/cli.ts`, `bot/commands/`, `bot/lib/` without changing what a dry run would send.** Acceptance: existing bot tests that still apply pass, and a dry-run tick on the simulated chain matches the pre-split planned calls.
5. **Move Golf, Bracket, Combo, Block X, Race, then Questions onto `kit/`, one at a time.** Old recorders: `bot/games/golf.ts`, `bracket.ts`, `combo.ts`, `blockx.ts`, `bot/race.ts`. Acceptance for each: replay of past weeks matches the published board, then Carl runs two shadow weeks with zero differences, then the workflow switches. Keep the old recorder until that switch.
6. **Split page scripts into `web/js/lib` and `web/js/pages` without changing what the browser does.** Acceptance: `node tools/ci/assemble-site.mjs` still serves the same URLs (`app.js` may move only if every page and the assembler agree).
7. **Build the two new games** (specs below) after 1–4 are green, in parallel with item 5 (owner decision D-217, 18 Nov 2026). Acceptance: each has `games/<slug>/game.json`, `math.js`, `recorder.ts`, tests, a page in `web/`, and a manual workflow rendered by `npm run kit:render`. No schedule until Carl asks.

## Two new games

Do not build them in a drive-by. Specs also live in [docs/NEXT-GAMES.md](docs/NEXT-GAMES.md).

**Over/Under.** For each producer, the player picks whether that producer will sign more blocks than the ruler projects, or fewer, that day. The line is `ruler/` (`vhp_ruler.py` and `vhp-ruler.js` must agree), not a number the operator types. One round per producer per day. Scoring is pure `math.js` shared by the page and the recorder. New vault game id, announced 48 hours ahead. The pot stays in the vault. A picks store must not hold a balance.

**Knode Games VS.** Every day the Knode Games pool node (the vault address `1Mpmf2ERhjYpX7CCiM11WERuM4j17uT1sr`) is paired with every other producer the ruler counts. Players pick the winner of each pair after the same handicap. The page must say the project runs that node. Publish two tables on the `games-data` branch, not on `main`: all-time vs the field, and all-time vs each producer. Append a day. Never rewrite an old day. A ruler void is neither a win nor a loss. Two nodes, pending then final, hold on disagreement. Tables are rebuildable from the final day files.

## Carl's decisions

Already made. Do not re-ask.

- Fresh git history. The old repo is archived only after this one is live.
- Work lands through pull requests. `main` got one bootstrap commit (README, license, gitignore) and nothing else.
- Bot-written data stays off `main`.
- Dead one-offs are deleted or left in the old repo. Testnet pages are off the public site (`ops/testnet/`). `/site/` redirects are gone.
- `.ai/` is not public and is not in this repo.
- Only the website is published.
- All games should end on one kit. Not done yet. Do it one game at a time.
- Desk treasury must be a different wallet from the owner. Designed, not executed on chain.
- Cold owner key and a separate operator key everywhere. Designed in `docs/KEYS.md`. Not executed.
- A public fairness page about the producer conflict. Done: `web/fairness.html`.
- Two new games, after the foundation is green. Specs above.

## Hard safety rules

- Never touch live chains, wallets, or keys. No deploys, no contract uploads, no transactions, no real secrets. Testnet or local simulation only with throwaway keys you generate.
- Do not deploy, upgrade, or call any contract. Read-only `chain-check` is allowed when Carl asks.
- Workflows stay without timers and without auto-deploy until Carl turns one on, using [docs/WORKFLOWS.md](docs/WORKFLOWS.md). One workflow per pull request. Least privilege. Actions stay pinned to a commit SHA. `npm ci --ignore-scripts`.
- Carl's GitHub account was once suspended for mass actions. No mass branch create or delete. No bursts of API calls. No hundreds of tiny commits. A few commits and one or a few PRs.
- Never push, comment, open issues, or change settings on `bawcejawn/KnodeGames`. Clone it read-only if you need a file.
- Do not put `.ai/` back. Do not publish tests, admin, ops, or bot.
- Do not downgrade `@koinos/sdk-as` to 0.4.0 to silence audit. That changes contract builds.
- `npm run bot -- keys` creates wallets. Do not run it.

## Known risks and open questions

- The operator key still decides scores for games other than Daily Questions. The contract checks the player was staked and the points are in range. It does not replay the week.
- The project runs block producers and games about producers. Said in public on the fairness page. A node, including ours, can be switched off by whoever runs it.
- It is not confirmed on chain that the vault owner and the desk treasury have moved to cold, separate wallets. Check read-only before go-live.
- Guest keys sit in browser storage. CSP still allows `unsafe-eval` because koilib needs it.
- This GitHub repo was created **public** (`private: false` on the API) while Carl asked for a private repo. Confirm with Carl before any more source lands. Only the website should be public.
- Moderate npm audit findings remain in contract test tools. They do not ship to players.
- Duplicate `contracts/vault/abi/kpred-v6.koilib.json` is byte-identical to `kpred.koilib.json` and still named by tests. Drop it when those names are updated.
- Race generated files (`assembly/index.ts`, boilerplate, `proto/race.ts`, `race.pb`) are not committed. The Race build regenerates them. That regeneration was not run here.

## Done means go-live

The cutover is done only when every numbered step in [docs/GO-LIVE.md](docs/GO-LIVE.md) has been done by Carl, in order, and:

- `ci` is required on `main`.
- The `game-data` branch exists and the site reads questions from it.
- One manual bot run published only to that branch and matched the old site's question file.
- The Pages artifact is `dist-site/` only. `/.ai/`, `/tests/`, `/bot/`, `/ops/` 404.
- The domain points here only after a day of matching the old site.
- Timers are added one workflow per pull request, after that.
- The old repository is archived, not deleted, and never written to again.
