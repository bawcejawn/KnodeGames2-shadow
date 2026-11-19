# Where the bot's files go

`main` is for code. The bot writes question files every hour. Those files go to a branch named `game-data`, not to `main`.

Other games already work this way: `games-data`, `race-data`, `names-data`, `stats-data`, `blocks-data`, `vhp-data`.

## What stays on main

`game-data/deployment.json` and `game-data/game.json`. They name the contracts and the build that is live. A person commits them. The bot's publish job is not allowed to change them.

## What goes on the `game-data` branch

- `game-data/questions/Wnnn-Dnn.json`
- `game-data/index.json`
- `game-data/state.json`
- `game-data/bot-state.json`

The folder name stays `game-data/` on that branch, because the publish script only copies that folder and refuses anything else. The raw address of a file is:

`https://raw.githubusercontent.com/bawcejawn/KnodeGames2/game-data/game-data/questions/W004-D1.json`

The `game-data` in the middle is the branch. The second `game-data` is the folder.

## How the website reads them

`web/data-source.js` turns a page's request for `game-data/questions/…` or `game-data/index.json` into that raw address. `deployment.json` is still loaded from the website itself, because it ships with the site.

The defaults are also written in `web/js/lib/config.js`.

Until you create the branch and copy today's files onto it, a site built from this repository will not list questions. The live site is still the old repository. Do not switch DNS before [GO-LIVE.md](GO-LIVE.md) step 4.

## How the bot publishes them

`.github/workflows/bot.yml` sets `DATA_REF` to `game-data`. The publish job pushes only the four paths above, and only to that branch. A test that replays the script without `DATA_REF` still uses whatever branch name the test supplies, so the old safety checks still run.

The job does not run unless you start it by hand and the repository variable `BOT_ENABLED` is `true`.

## Creating the branch, once

Do this once, from a computer you trust, when you are ready. It does not copy the whole history of question files. Copy the current files from the old repository's `game-data/` folder (questions, index, state, bot-state) onto the new branch. Leave `deployment.json` on `main` here.

Do not create the branch by the hundred. One branch, one copy.
