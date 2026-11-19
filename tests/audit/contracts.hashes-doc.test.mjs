// HANDOFF item 2: contracts/hashes.json (what CI builds against) must agree with the live hashes in HANDOFF.md
// and docs/KEYS.md, and with the five addresses. The build itself runs in CI: npm run test:hashes.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (f) => fs.readFileSync(new URL(`../../${f}`, import.meta.url), "utf8");
const hashes = JSON.parse(read("contracts/hashes.json"));
const handoff = read("HANDOFF.md"), keys = read("docs/KEYS.md");
const names = ["vault", "desk", "picks", "race", "sponsor"];

test("contracts/hashes.json lists the five contracts with full sha256 values", () => {
  assert.deepEqual(Object.keys(hashes).filter((k) => k !== "_").sort(), [...names].sort());
  for (const n of names) for (const k of ["live", "source"]) assert.match(hashes[n][k], /^[0-9a-f]{64}$/, `${n}.${k}`);
});

test("every live hash and address is the one HANDOFF.md and docs/KEYS.md name", () => {
  for (const n of names) {
    assert.ok(handoff.includes(hashes[n].live), `HANDOFF.md lacks ${n} ${hashes[n].live}`);
    assert.ok(keys.includes(hashes[n].live), `docs/KEYS.md lacks ${n} ${hashes[n].live}`);
    assert.ok(handoff.includes(hashes[n].address), `HANDOFF.md lacks ${n} address`);
  }
});

test("a source hash that differs from live says why", () => {
  for (const n of names) if (hashes[n].source !== hashes[n].live) assert.ok((hashes[n].note ?? "").length > 10, `${n} needs a note`);
});

test("CI runs the contract build check", () => {
  assert.match(read(".github/workflows/ci.yml"), /npm run test:hashes/);
  assert.match(JSON.parse(read("package.json")).scripts["test:hashes"], /tools\/ci\/contract-hashes\.mjs/);
});

// The same supply-chain rules as the root lockfile guard (site.ci-deps), for each contract's own lockfile.
test("each contract has its own lockfile: exact versions, entries from npmjs with sha512, matching package.json", () => {
  const bad = [];
  for (const n of names) {
    const p = JSON.parse(read(`contracts/${n}/package.json`));
    const lock = JSON.parse(read(`contracts/${n}/package-lock.json`));
    assert.ok(lock.lockfileVersion >= 2 && lock.packages?.[""], `${n}: lockfile v2+`);
    for (const sec of ["dependencies", "devDependencies", "optionalDependencies"]) {
      for (const [d, v] of Object.entries(p[sec] || {})) if (!/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(String(v))) bad.push(`${n}: ${d}@${v} is not exact`);
      assert.deepEqual(lock.packages[""][sec] || {}, p[sec] || {}, `${n}: lock ${sec} differs from package.json`);
    }
    for (const [k, e] of Object.entries(lock.packages)) {
      if (!k || e.link || e.inBundle || !e.resolved) continue;
      if (!e.resolved.startsWith("https://registry.npmjs.org/")) bad.push(`${n} ${k}: resolved ${e.resolved}`);
      if (!e.integrity?.startsWith("sha512-")) bad.push(`${n} ${k}: integrity ${e.integrity}`);
    }
  }
  assert.deepEqual(bad, []);
});

test("the contracts are not root workspaces (one root lockfile; each contract builds from its own)", () => {
  const ws = JSON.parse(read("package.json")).workspaces ?? [];
  assert.deepEqual(ws.filter((w) => String(w).startsWith("contracts/")), []);
});
