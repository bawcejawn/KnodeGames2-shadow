# game-data

`deployment.json` and `game.json` stay here. They are the contract register (addresses and the build that is live), not the hourly bot output.

The bot's question files, `index.json`, `state.json`, and `bot-state.json` do **not** belong on `main`. They are published to the `game-data` branch. See `docs/DATA.md`.

Do not commit a dump of question files back onto `main`.
