// Build the folder GitHub Pages is allowed to publish. Everything else stays off the website.
//   node tools/ci/assemble-site.mjs
// Writes dist-site/. That folder is gitignored.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const out = path.join(root, "dist-site");
fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(path.join(root, "web"), out, { recursive: true });

function copy(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

// The pages still ask for these URLs. The files live with the contracts, not in web/.
copy(path.join(root, "contracts/vault/abi/kpred.koilib.json"), path.join(out, "game/abi/kpred.koilib.json"));
copy(path.join(root, "contracts/vault/abi/kpred-v6.koilib.json"), path.join(out, "game/abi/kpred-v6.koilib.json"));
// The Picks, Race and Desk pages ask for their ABI at its own path in this repo (contracts/<name>/abi/...).
for (const f of ["contracts/picks/abi/picks.koilib.json", "contracts/race/abi/race.koilib.json", "contracts/desk/abi/desk.koilib.json"]) {
  copy(path.join(root, f), path.join(out, f));
}
// The pages read each contract's address from its deployment file (combo, bracket, blockx, fantasy, race, swap, trust).
for (const dir of ["picks-data", "race-data", "desk-data"]) copy(path.join(root, dir, "deployment.json"), path.join(out, dir, "deployment.json"));

for (const name of ["deployment.json", "game.json"]) {
  const src = path.join(root, "game-data", name);
  if (fs.existsSync(src)) copy(src, path.join(out, "game-data", name));
}

const banned = [];
function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|mjs|py|yml)$/.test(name) || name.startsWith(".ai")) banned.push(path.relative(out, p));
  }
}
walk(out);
if (banned.length) {
  console.error("assemble-site refused:\n" + banned.join("\n"));
  process.exit(1);
}
console.log("assemble-site: wrote dist-site");
