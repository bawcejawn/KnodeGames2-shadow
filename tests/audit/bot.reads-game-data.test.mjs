// The bot's tick must start from the question files and state on the game-data branch (docs/DATA.md). main has no
// question files any more; a tick without them would void every live question as "unknown" and post the day's questions
// again. Found by the KnodeGames2-shadow dry run on Wed 18 Nov 2026, before cutover.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import yaml from "yaml";

const y = yaml.parse(fs.readFileSync(".github/workflows/bot.yml", "utf8"));
const steps = y.jobs.tick.steps;
const at = (pred) => steps.findIndex(pred);

test("tick: the start step reads game-data (no token), refuses to go on without it, and runs before the bot", () => {
  const i = at((s) => s.id === "start"), bot = at((s) => /npm run bot -- tick/.test(s.run || ""));
  assert.ok(i >= 0 && bot > i, "the start step comes before Run the bot");
  const s = steps[i];
  assert.equal(s.env.DATA_REF, "game-data");
  assert.match(s.run, /fetch -q --depth 1 "https:\/\/github\.com\/\$\{GITHUB_REPOSITORY\}\.git" "\$DATA_REF"/, "read without a token");
  assert.doesNotMatch(s.run, /secrets\.|GH_TOKEN|x-access-token/);
  for (const p of ["questions", "index.json", "state.json", "bot-state.json"]) assert.ok(s.run.includes(p), p);
  assert.match(s.run, /exit 1/, "a missing branch or file stops the run");
  assert.match(s.run, /echo "sha=\$\(git -C "\$d" rev-parse FETCH_HEAD\)" >> "\$GITHUB_OUTPUT"/, "start = the data branch head");
  assert.equal(y.jobs.publish.steps.find((x) => /DATA_REF/.test(JSON.stringify(x.env || {})))?.env.DATA_REF, "game-data", "publish pushes to the same branch");
});
