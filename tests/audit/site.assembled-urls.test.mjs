// The built site (dist-site/, made by tools/ci/assemble-site.mjs) must hold every JSON file the pages ask for by a
// relative address: contract addresses (…-data/deployment.json) and ABIs. KnodeGames2 found six pages asking for files
// the build didn't contain (Picks, Race and Desk ABIs and deployment files), so picks, races and swaps would have failed
// after cutover. Testnet-only files (testnet/…) are served by tools/testnet-site.mjs, not the website.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));

test("every relative JSON file a page script asks for is in the assembled site", () => {
  const r = spawnSync(process.execPath, [path.join(ROOT, "tools/ci/assemble-site.mjs")], { cwd: ROOT, encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  const asked = new Set();
  for (const f of fs.readdirSync(path.join(ROOT, "web")).filter((n) => n.endsWith(".js"))) {
    const src = fs.readFileSync(path.join(ROOT, "web", f), "utf8");
    for (const m of src.matchAll(/(?:new URL\(|fetchJson\(|fetchJsonAt\(|BASE \+ )"([a-z0-9][a-z0-9/._-]*\.json)"/g)) {
      if (!m[1].startsWith("testnet/")) asked.add(`${m[1]}  (${f})`);
    }
  }
  assert.ok(asked.size >= 8, `found only ${asked.size} requests: the pattern no longer matches the pages`);
  const missing = [...asked].filter((a) => !fs.existsSync(path.join(ROOT, "dist-site", a.split("  ")[0])));
  assert.deepEqual(missing, [], "files the pages ask for but dist-site/ doesn't contain");
});
