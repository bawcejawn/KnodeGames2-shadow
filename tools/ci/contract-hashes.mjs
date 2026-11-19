// Builds each contract's release wasm from its own folder and lockfile, then checks its sha256 against
// contracts/hashes.json ("source"). It also says whether that is the code on chain ("live"), and rebuilds the pinned
// emergency builds ("emergency", e.g. the vault's withdrawals-only build). No chain call, no upload, no key.
// Usage: node tools/ci/contract-hashes.mjs [vault desk ...]      (Linux, macOS and Windows)
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../..", import.meta.url));
const hashes = JSON.parse(fs.readFileSync(path.join(root, "contracts/hashes.json"), "utf8"));
const contracts = Object.keys(hashes).filter((k) => k !== "_" && k !== "emergency");
const names = process.argv.slice(2).length ? process.argv.slice(2) : contracts;
const win = process.platform === "win32";
const shim = path.join(root, "tools/ci/protoc-stdin-shim.cjs");

// Each contract is installed on its own (not as a workspace): the contract builder runs its helpers from
// ./node_modules/.bin in the contract folder, and each folder pins its own toolchain in package-lock.json.
// Windows needs a shell to run npm.cmd (Repo Lens #L-3 L3-2); the arguments are fixed strings, never user input.
const run = (cwd, args) => spawnSync("npm", [...args, "--workspaces=false"], { cwd, shell: win, stdio: ["ignore", "pipe", "pipe"], encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
const sha = (file) => createHash("sha256").update(fs.readFileSync(file)).digest("hex");

// Repo Lens #L-3 I-1: run the builder's protoc plugins through the stdin shim (no retries needed). The wrapper calls
// each plugin's own, unchanged bin file.
const PLUGINS = ["koinos-abi-proto-gen", "as-proto-gen", "koinos-as-gen"];
function useShim(dir) {
  const bin = path.join(dir, "node_modules/.bin");
  for (const p of PLUGINS) {
    const link = path.join(bin, p);
    const real = fs.realpathSync(link); // node_modules/@koinos/<package>/bin/<p>
    const wrapper = `#!/usr/bin/env node\nrequire(${JSON.stringify(shim)}).run(${JSON.stringify(real)});\n`;
    fs.rmSync(link, { force: true });
    fs.writeFileSync(link, wrapper, { mode: 0o755 });
    if (win) { const js = path.join(bin, `${p}.shim.cjs`); fs.writeFileSync(js, wrapper); fs.writeFileSync(`${link}.cmd`, `@node "${js}" %*\r\n`); }
  }
}

let failed = 0;
const rows = [];
const fail = (msg) => { console.error(msg); failed++; };
for (const name of names) {
  const want = hashes[name];
  if (!want || !contracts.includes(name)) { fail(`unknown contract "${name}"`); continue; }
  const dir = path.join(root, "contracts", name);
  if (!fs.existsSync(path.join(dir, "package-lock.json"))) { fail(`${name}: contracts/${name}/package-lock.json is missing`); continue; }
  const ci = run(dir, ["ci", "--ignore-scripts", "--no-audit", "--no-fund"]);
  if (ci.status !== 0) { fail(`${name}: npm ci failed\n${(ci.stderr ?? "").slice(-2000)}`); continue; }
  useShim(dir);
  const b = run(dir, ["run", "build"]);
  if (b.status !== 0) { fail(`${name}: build failed\n${((b.stdout ?? "") + (b.stderr ?? "")).slice(-3000)}`); continue; }
  const got = sha(path.join(dir, "build/release/contract.wasm"));
  const ok = got === want.source;
  if (!ok) failed++;
  rows.push(`${ok ? "OK  " : "FAIL"} ${name.padEnd(13)} ${got}  ${ok ? (got === want.live ? "= live on chain" : `planned upgrade (live is ${want.live.slice(0, 8)}…)`) : `expected ${want.source}`}`);

  // Repo Lens #L-3 I-2: the pinned emergency build of the same source.
  const em = hashes.emergency?.[name];
  if (em) {
    const s = run(dir, ["run", em.script]);
    if (s.status !== 0) { fail(`${name}: ${em.script} failed\n${((s.stdout ?? "") + (s.stderr ?? "")).slice(-3000)}`); continue; }
    const e = sha(path.join(dir, em.file));
    if (e !== em.sha256) failed++;
    rows.push(`${e === em.sha256 ? "OK  " : "FAIL"} ${`${name} (${em.script})`.padEnd(13)} ${e}  ${e === em.sha256 ? "= pinned emergency build" : `expected ${em.sha256}`}`);
  }
}
console.log(rows.join("\n"));
process.exit(failed ? 1 : 0);
