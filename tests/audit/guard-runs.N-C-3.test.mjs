// tests/audit/guard-runs.N-C-3.test.mjs
// N-C-3: a workflow-only change must still run the trigger/permission guard (site.ci-deps).
// KnodeGames2: workflow-guard.yml is manual only (no workflow starts on a push here). The guard now runs in CI, which
// starts on every pull request with no path filter, so a change to .github/workflows/** alone still runs it.
import { test } from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url";
const ROOT = fileURLToPath(new URL("../..", import.meta.url));
test("N-C-3: a workflow-only change runs the CI guard (site.ci-deps)", () => {
  const ci = fs.readFileSync(path.join(ROOT, ".github/workflows/ci.yml"), "utf8");
  assert.match(ci, /^on:\n {2}pull_request:\n/m, "CI starts on every pull request");
  assert.doesNotMatch(ci, /^ {4}paths(-ignore)?:/m, "CI has no path filter, so workflow-only changes run it too");
  assert.match(ci, /^ {6}- run: npm test$/m, "CI runs npm test");
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
  assert.match(pkg.scripts.test, /tests\/audit\/site\.ci-deps\.test\.mjs/, "npm test runs the issue/trigger/permission guard");
  const g = fs.readFileSync(path.join(ROOT, ".github/workflows/workflow-guard.yml"), "utf8");
  assert.match(g, /site\.ci-deps\.test\.mjs/, "workflow-guard.yml (manual) still runs it too");
});
