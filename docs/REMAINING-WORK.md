# Still to do

This pull request is the first slice. The live games are copied into the new folders. They are not all re-tested here. Do not point knodegames.com at this repository until [GO-LIVE.md](GO-LIVE.md) is done.

The single source of truth for the next builder is [../HANDOFF.md](../HANDOFF.md).

## In this pull request

- The folders: `web/`, `contracts/`, `bot/`, `kit/`, `games/`, `questions/`, `ruler/`, `ops/`, `tools/`, `tests/`, `docs/`.
- The home page loads `early-view.js` again, before the stylesheet.
- A public fairness page (`web/fairness.html`).
- Question files are not on `main`. The bot publish job is aimed at a branch named `game-data`. That branch is not created yet. See [DATA.md](DATA.md).
- A new desk deploy refuses to use the owner address as the treasury. The live desk is not changed.
- Workflows have no timer and do not run on a pull request, except CI. The website publish job stays off until `KG_ENABLE_PAGES` is `true`.
- Agent notes (`.ai/`) are not in this repository. Old `/site/` redirects are gone. Finished one-off fund-moving and v6 rehearsal scripts are gone. See [DROPPED.md](DROPPED.md).
- CI job name: **`ci`**. That is the check to require on `main`.

## Not done yet

1. **Done (HANDOFF item 1): the old test suite passes.** `npm run test:audit` exits 0. No test was skipped or retired. The failing files only looked for the old paths and were pointed at `web/`, `ruler/`, `ops/node/`, `ops/testnet/` and `contracts/`. Three checks moved on purpose:
   - `guard-runs.N-C-3`: `workflow-guard.yml` is manual here, so the test now checks that CI (every pull request, no path filter) runs the trigger guard.
   - `open-network` (docs): the full "Open network" section moved from the old README to `docs/QUESTIONS.md`, unchanged.
   - The CSP checks (`site.extras`, `site.games`) accept the one new host, `raw.githubusercontent.com/bawcejawn/KnodeGames2/`, which `web/data-source.js` uses for the `game-data` branch.

   The suite found real bugs, fixed in the same pull request: the built site was missing the Picks, Race and Desk ABIs and their `deployment.json` files, so picks and swaps would have failed after cutover (`tools/ci/assemble-site.mjs`; guarded by the new `site.assembled-urls` test in `npm test`). `tools/vhp-ruler-shadow-compare.mjs` and `tools/testnet-site.mjs` still read the old root layout.

   How it runs: on every pull request, CI (`ci`) runs the fast set (`npm test`) and **Full test suite** (`test-audit.yml`, check `test-audit`, 30–50 minutes) runs the whole suite by itself. `test-audit` must be green on the current head before any bot, kit or payout PR merges.

   Still outside both: the bot's own tests in `bot/*.test.ts`. Two in `bot/workflow.test.ts` expect the old hourly timers. HANDOFF item 4 (the bot split) handles them.
2. **Contract builds are in CI** (`npm run test:hashes`, `contracts/hashes.json`). Four match the chain. Picks source is v2, not yet live: after its upload, set `picks.live` to `source`. Any contract change updates `source` in the same PR. The contracts' own unit tests (`npm run test:contracts`) stop at start-up (`binaryen` RuntimeError, Node 20 and 22): fix that before v6.2.
3. **The bot is still one large file** (`bot/bot.ts`). It is not split into commands yet.
4. **Games are not on the shared kit yet**, except Fantasy, which already was. Golf, Bracket, Combo, Block X, Race, and Questions still use their old recorders.
5. **The two new games are not built.** The shape is in [NEXT-GAMES.md](NEXT-GAMES.md): Over/Under, and Knode Games VS.
6. **Page scripts are not split** into `web/js/lib` and `web/js/pages`. They sit in `web/` with the same names the pages already use. `web/js/lib/config.js` is only the data-branch setting.
7. **The data branch has no files.** Create it once, as [DATA.md](DATA.md) says, before any bot run.
8. **Keys are not moved.** [KEYS.md](KEYS.md) is the runbook. Nothing in this pull request sends a transaction.
9. **GitHub Pages is not switched on.** [WORKFLOWS.md](WORKFLOWS.md) says how.
10. **Moderate `npm audit` findings remain** in the contract test tools. Critical and high are cleared. Do not downgrade `@koinos/sdk-as` to clear the rest.

## Later phases (from the audit plan)

Shared site helpers, one contract toolchain (the folders are moved; the five copies of protobuf files are not merged), workflows with no embedded copies, split the bot, move each game onto the kit with a shadow week, then clean the tests so they check behaviour rather than file paths.
