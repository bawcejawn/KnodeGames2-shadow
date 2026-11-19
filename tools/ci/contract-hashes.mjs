// Builds each contract's release wasm from its own folder and lockfile, then checks its sha256 against
// contracts/hashes.json ("source"). It also says whether that is the code on chain ("live").
// No network call to a chain, no upload, no key. Usage: node tools/ci/contract-hashes.mjs [vault desk ...]
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const hashes = JSON.parse(fs.readFileSync(path.join(root, "contracts/hashes.json"), "utf8"));
const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(hashes).filter((k) => k !== "_");

// Each contract is installed on its own (not as a workspace): the contract builder runs its helpers from
// ./node_modules/.bin in the contract folder, and each folder pins its own toolchain in package-lock.json.
const run = (cwd, args) => spawnSync("npm", [...args, "--workspaces=false"], { cwd, stdio: ["ignore", "pipe", "pipe"], encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

let failed = 0;
const rows = [];
for (const name of names) {
  const want = hashes[name];
  if (!want) { console.error(`unknown contract "${name}"`); failed++; continue; }
  const dir = path.join(root, "contracts", name);
  if (!fs.existsSync(path.join(dir, "package-lock.json"))) { console.error(`${name}: contracts/${name}/package-lock.json is missing`); failed++; continue; }
  const ci = run(dir, ["ci", "--ignore-scripts", "--no-audit", "--no-fund"]);
  if (ci.status !== 0) { console.error(`${name}: npm ci failed\n${ci.stderr.slice(-2000)}`); failed++; continue; }
  // The ABI step (protoc plugin) can fail at random reading its input on some machines (EAGAIN). A real build
  // error fails all three tries.
  let b;
  for (let i = 1; i <= 3; i++) { b = run(dir, ["run", "build"]); if (b.status === 0) break; console.log(`${name}: build try ${i} failed, retrying`); }
  if (b.status !== 0) { console.error(`${name}: build failed\n${(b.stdout + b.stderr).slice(-3000)}`); failed++; continue; }
  const got = createHash("sha256").update(fs.readFileSync(path.join(dir, "build/release/contract.wasm"))).digest("hex");
  const ok = got === want.source;
  if (!ok) failed++;
  rows.push(`${ok ? "OK  " : "FAIL"} ${name.padEnd(8)} ${got}  ${ok ? (got === want.live ? "= live on chain" : `planned upgrade (live is ${want.live.slice(0, 8)}…)`) : `expected ${want.source}`}`);
}
console.log(rows.join("\n"));
process.exit(failed ? 1 : 0);
