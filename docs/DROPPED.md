# What was not brought across

The old repository at commit `7a93c92d` is still the place to find these. They were left there on purpose.

| Left behind | Why |
|---|---|
| `.ai/` | Agent notes. They are not part of the product and must not be published. The alert catalogue and the standards the tests still read were copied to `docs/ops/` and `docs/standards/`. The game notes were copied to `docs/games/`. |
| `site/` | Old `/site/...` redirect pages. They had not changed since 28 Oct 2026. Bookmarks to `/site/` will 404 on the new site. The real pages are at the top level (`/race.html`, not `/site/race.html`). |
| `bot/testnet-v6.ts`, `testnet-v61-d8.ts`, `testnet-v61-sponsor.ts`, `rehearse-v6.ts` and its test | One-off rehearsals for the vault upgrade that is already live (`upgradedAt` 10 Nov 2026). |
| `tools/sweep-old-bot.ts` | A one-off that can send KOIN. The operator rotation it was for is finished. |
| `tools/sim/bracket/` and `data/bracket-vhp-sample.json.gz` | Bracket research. Nothing in CI imported it. |
| Generated Race files (`assembly/index.ts`, `Race.boilerplate.ts`, `proto/race.ts`, `race.pb`, `abi/race.abi`, `abi/race-abi.json`) | The Race build regenerates them. `race.koilib.json` and `race.proto` stayed. |
| Duplicate `kpred-v6.koilib.json` | Kept, because it is byte-identical to `kpred.koilib.json` and several tests and pages still name it. Safe to delete when those names are updated. |
| Git history | This repository starts clean. The old history stays in the old repository. |

Testnet pages and tools were kept, under `ops/testnet/`, and are not in `web/`.

The one-off ruler experiments are in `ruler/sims/archive/`. The simulations the tests run stayed in `ruler/sims/`.
