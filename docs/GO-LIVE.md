# Go live

Do these in order. Each step is safe to stop after. The old site keeps running until step 8.

You are not deploying a contract in this list. The contracts are already live. This list points the new code at them.

1. **Read the keys.** On your PC, in this folder, `npm ci --ignore-scripts`, then `npm run bot -- chain-check` and `npm run desk -- status`. Write down the owner and the treasury you see. Compare them with [KEYS.md](KEYS.md). If the vault owner is still `1635QUrBNDp7WqmFkRvrkGwjJXTtFvH717` and you have a cold wallet, do the vault handover in KEYS.md before you rely on this repository. If the desk treasury equals the owner, do the treasury steps in KEYS.md. Stop if a command wants `--send` and you have not read the line it will send.

2. **Protect `main`.** On GitHub: Settings → Branches → Add rule → branch name `main`. Require a pull request. Require the status check named `ci` (the job in the workflow named CI). It appears in the list after this pull request has been merged and CI has run once on `main`. Do not allow force pushes. You can still press the merge button yourself.

3. **Make the data branch.** Follow [DATA.md](DATA.md). Copy the current question files from the old repository onto a branch named `game-data` in this repository. Do not copy them onto `main`.

4. **Check the website on your own computer.** `node tools/ci/assemble-site.mjs`. Open `dist-site/index.html`. The home page should not flash the wrong tab. Open `fairness.html`. Questions will load only after step 3, and only if the page can reach GitHub.

5. **Run the bot once, by hand, still publishing only to the data branch.** Set the `bot` environment and `BOT_ENABLED` as in [WORKFLOWS.md](WORKFLOWS.md). Actions → Knode Games bot → Run workflow. Read the log. It must not say it pushed to `main`. If it errors because the branch is missing, go back to step 3.

6. **Publish the website to a preview, not the real domain.** Set `KG_ENABLE_PAGES` and Pages source to GitHub Actions ([WORKFLOWS.md](WORKFLOWS.md)). Run "Publish the website". Open the `github.io` address GitHub gives you. Click Daily Questions, Race, Block X, Bracket, Golf, Fantasy, Combo, Swap, and Stake. Each page should load. `https://<that address>/.ai/` and `/tests/` and `/ops/` should be missing.

7. **Watch one real day.** Leave the timers off. Press Run on the bot once an hour, or a few times across the day. Compare the question file on the `game-data` branch with the file the old site published. They should match. If they do not, stop and do not do step 8.

8. **Point the domain.** In the DNS for knodegames.com, point the site at this repository's Pages. Keep the old repository's Pages until this one has answered for a day. Then turn the old repository's Pages off so two sites are not fighting over the name.

9. **Turn timers on one at a time.** First the bot, then one game recorder, then the next. Each one is a small pull request that adds that file's `schedule:` and nothing else. See [WORKFLOWS.md](WORKFLOWS.md).

10. **Archive the old repository.** After a week of this site and this bot matching the old ones, archive the old GitHub repository so nobody pushes to it. Do not delete it. The history stays readable.

If any step looks wrong, stop. The old site is still the live one until step 8.
