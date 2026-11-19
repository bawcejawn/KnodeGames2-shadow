# Security

Knode Games holds player stakes in contracts on Koinos. Reports are welcome.

## Reporting a problem

Do not open a public issue for anything that could put funds at risk.

Use GitHub: **Security → Report a vulnerability** on this repository. Say what you found, how to show it, and what it could affect. Please give us time to fix it before you share it publicly.

## What is in scope

- The contracts: vault `1Mpmf2ERhjYpX7CCiM11WERuM4j17uT1sr`, Swap Desk `1FKTpXBhhHEbu5vVchM8UsVbAvPArJsRmR`, Picks `1LmgqBGctL9F2YkyjTXgieTXwnYHh8Y6Pm`, Race picks `1EN7xU8R9tQXjHvrX79qZvvvGkkKWVnB5K`, Mana sponsor `1ByDDSBUzy5zkRceELc54Jh8i41yNRoKt8`.
- The bot, the recorders, and the workflows.
- The website, including guest wallets in the browser.

## How funds are protected

- A player withdraws their own stake. Pause stops new deposits. It does not trap a withdrawal.
- The vault checks, after a payout, that it still holds enough to pay everyone else.
- Owner changes and code upgrades are announced on chain and wait.
- The operator key can post and seal. It cannot withdraw player stakes.
- Recorders read two nodes. If they disagree, the week is held.
- The owner has a correction window after a seal, and not after finalizing starts.
- This repository's Actions do not start on a timer, and the website is not deployed until you turn that on. See [docs/WORKFLOWS.md](docs/WORKFLOWS.md).
- Pages, when enabled, publish `dist-site/` only. Tests, admin, and testnet pages are not on that origin.
- Installs in CI use `npm ci --ignore-scripts`. Actions are pinned to a commit. Workflows do not use `pull_request_target`.

## Risks that are still open

These are not fixed by moving files.

1. **The operator key decides the scores** of the games that are not Daily Questions. The contract checks that the player was staked and that the points are in range. It does not replay the week. Safety is the two-node check, the published files, and the correction window. You should get an email or text when a result is sealed, so you can use that window.
2. **The project runs block producers** and games about producers. Anyone who runs a node, including us, can turn it off. That is stated on the public [fairness page](../web/fairness.html).
3. **One owner key still does too much** until the cold-key handover is confirmed on chain, and until the desk treasury is a different wallet. Steps are in [docs/KEYS.md](docs/KEYS.md). This rebuild does not send those transactions.
4. **Guest keys live in the browser.** They are meant to be empty. A script injected into the page could read them. The pages send a Content-Security-Policy. It still allows `unsafe-eval` because the Koinos library needs it.
5. **Build tools used to pull in known bugs.** They run on a developer machine and in CI, not in the website and not in the contracts. `package.json` `overrides` forces patched versions, including a current npm so the abandoned `request` package is not installed. `npm audit` should report no critical and no high issues. Moderate issues can remain inside the contract compiler's test tools. Do not "fix" those by downgrading `@koinos/sdk-as` to 0.4.0. That would change how contracts build.

## Keys

Private keys do not belong in git, in a chat, or in an email. `.env` is ignored. The operator key, if you put it in GitHub, belongs in an environment named `bot` that only `main` can use. The owner key does not belong in GitHub at all. See [docs/KEYS.md](docs/KEYS.md).
