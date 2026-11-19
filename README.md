# Knode Games

Prediction games on the Koinos blockchain. People stake VHP, pick block producers, and share a weekly pot. The website is [knodegames.com](https://knodegames.com). The contracts that hold the money are already live. This repository is a clean rebuild of the code. It does not replace the live site until you follow [docs/GO-LIVE.md](docs/GO-LIVE.md).

Nothing here deploys, spends, or starts a timer by itself.

The handoff for the next builder, and for Carl, is [HANDOFF.md](HANDOFF.md).

## What is where

| Folder | What it is |
|---|---|
| `web/` | The website. The only thing that may be published. |
| `contracts/` | The five contracts: vault, desk, sponsor, picks, race. The source matches the live builds. |
| `bot/` | The operator bot and the owner commands. |
| `kit/` | The shared game kit. New games should be built on this. |
| `games/` | One folder per game that already uses the kit. Page math that the browser loads still lives in `web/` so the page addresses do not change. |
| `questions/` | Daily Questions: make them, score them, check them. |
| `ruler/` | The shared way every game measures producers. |
| `ops/` | The owner's PC scripts, the Cloudflare worker, the admin page, and testnet pages. Not published. |
| `tools/` | Dev tools and the scripts CI runs. |
| `tests/` | The regression tests. |
| `docs/` | The guides, including the go-live checklist and the key handover. |

Bot-written question files are not on `main`. See [docs/DATA.md](docs/DATA.md).

## Day to day

From this folder, with Node 22:

```bash
npm ci --ignore-scripts
npm test
npm run lint
node tools/ci/assemble-site.mjs
```

`npm test` runs the question scorer and the audit suite. It does not touch a chain.

`npm run test:contracts` builds and tests the five contracts. That is slower. CI runs it on every pull request.

`node tools/ci/assemble-site.mjs` writes `dist-site/`, which is the website and nothing else. Do not commit `dist-site/`.

Useful commands, all dry until you add `--send` (and, on mainnet, `CONFIRM_MAINNET=yes` in a local `.env` that is never committed):

```bash
npm run bot -- chain-check
npm run desk -- status
npm run picks -- status
```

Do not run `keys`. That command creates new wallets.

## Read next

1. [docs/GO-LIVE.md](docs/GO-LIVE.md) — the numbered cutover, when you are ready.
2. [docs/KEYS.md](docs/KEYS.md) — the five contracts, the owner key, and the operator key.
3. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — how the pieces connect.
4. [SECURITY.md](SECURITY.md) — how to report a problem, and the risks that are still open.
5. [docs/WORKFLOWS.md](docs/WORKFLOWS.md) — how to turn a GitHub Action on. They are all off.
6. [docs/NEXT-GAMES.md](docs/NEXT-GAMES.md) — the two games that come next.
7. [docs/DROPPED.md](docs/DROPPED.md) — what was left in the old repository on purpose.
8. [docs/REMAINING-WORK.md](docs/REMAINING-WORK.md) — what this first pull request does not finish.

The old public repository is the one that is live today. Do not push to it from this project.

## How the VHP-swing rule is applied

A question can be voided on purpose, late in its window, by moving VHP. The producer the question is about can move its own VHP. Anyone else can do it too: a third party can send or burn VHP to that producer, or swap VHP into the Knode Swap desk when the desk is a subject. That is part of an open network. The last hourly reading can land near the end of the window, when most of the window is already public. A reading after the window's last block never voids. The numbers are saved with the question. The full rule is in `questions/resolver.ts`.

