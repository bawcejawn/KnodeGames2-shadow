# The next two games

Do not build these until CI is green and the games that exist today still pass their tests. The kit is the place they go. Each one is a folder `games/<slug>/` with `game.json`, `math.js`, `recorder.ts`, and `tests/`, then `npm run kit:render`. The page is a file in `web/` that loads the same `math.js`.

Neither game is wired into a workflow in this repository.

## Over / Under

A player picks, for each block producer, whether that producer will sign more blocks than the ruler says, or fewer, over the day.

- The ruler is `ruler/vhp_ruler.py` and `ruler/vhp-ruler.js`. They must keep agreeing. The pick is against the ruler's expected count for that producer, not against a number the operator types in.
- One round per producer per day. The kit's round list is that set.
- Scoring is inside `math.js`, pure, so the page and the recorder cannot drift.
- The vault game id is a new id, announced 48 hours ahead with `propose_game` / `apply_game`, the same as the games that exist. Do not reuse an id.
- Picks can live on the Picks contract once it has a type for a yes/no per producer, or on a small new contract that only stores picks. The pot stays in the vault. Do not give the new contract a balance.

## Knode Games VS

Every day the Knode Games pool node is paired with every other producer that the ruler counts. A player picks the winner of each pair: who signs more blocks that day, after the ruler's handicap, using the same ruler as the other games.

- The pool node is the vault address `1Mpmf2ERhjYpX7CCiM11WERuM4j17uT1sr`. Say that on the page. The fairness page already says the project runs that node.
- The record is two tables, published on the `games-data` branch, not on `main`: all-time against the field, and all-time against each producer. Append a day. Never rewrite an old day.
- A day the ruler marks void is not a win and not a loss. It is absent.
- The kit recorder reads two nodes, writes a pending file, then a final file, and holds the day if they disagree. That is the same rule as Race and Block X.
- The long-term tables are derived from the final day files only, so anyone can rebuild them.

## What the kit already gives you

`kit/recorder/` has the clock, the two-node read, the week files, and the vault file. `npm run game:new` copies `templates/game/`. `npm run game:check` tells you what is still a placeholder. `npm run kit:render` writes the workflow jobs, and those jobs stay manual until you add a schedule on purpose.

Do not copy `bot/games/blockx.ts` as the starting point. It is the old shape. The new games should make that file unnecessary, not longer.
