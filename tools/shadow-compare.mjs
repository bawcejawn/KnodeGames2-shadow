// Shadow compare (KnodeGames2-shadow only). Compares each data branch the shadow wrote with the same branch of the live
// repository (bawcejawn/KnodeGames), file by file. Read-only on both sides; writes one report (Markdown + JSON).
//   node tools/shadow-compare.mjs <live-checkouts-dir> <shadow-checkouts-dir> <out-dir>
// Each checkouts dir holds one folder per branch name (games-data, race-data, ...). For the questions, the live side
// is the old repository's main:game-data/ and the shadow side is its game-data branch.
// A file counts as SAME when the bytes match, or NEAR when they match once time-of-run fields are removed
// (updated, generatedAt, ...). Anything else is a DIFF and is listed with its first differing key path.
import fs from "node:fs";
import path from "node:path";

const [liveDir, shadowDir, outDir] = process.argv.slice(2);
if (!liveDir || !shadowDir || !outDir) { console.error("usage: shadow-compare.mjs LIVE SHADOW OUT"); process.exit(2); }
const BRANCHES = ["games-data", "race-data", "blocks-data", "vhp-data", "names-data", "stats-data", "prize-settings", "race-samples", "game-data"];
const TIME_KEY = /^(updated|updatedAt|generated|generatedAt|asOf|checkedAt|ranAt|runAt|now|builtAt|lastRun|fetchedAt)$/i;

const walk = (root, rel = "") => {
  const d = path.join(root, rel);
  if (!fs.existsSync(d)) return [];
  return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    if (e.name === ".git") return [];
    const r = rel ? `${rel}/${e.name}` : e.name;
    return e.isDirectory() ? walk(root, r) : [r];
  });
};
const strip = (v) => Array.isArray(v) ? v.map(strip)
  : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).filter(([k]) => !TIME_KEY.test(k)).map(([k, x]) => [k, strip(x)])) : v;
const firstDiff = (a, b, at = "") => {
  if (JSON.stringify(a) === JSON.stringify(b)) return null;
  if (a && b && typeof a === "object" && typeof b === "object") {
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) { const d = firstDiff(a[k], b[k], `${at}/${k}`); if (d) return d; }
  }
  return at || "/";
};

const report = { at: new Date().toISOString(), branches: {} };
let diffs = 0;
for (const b of BRANCHES) {
  const L = path.join(liveDir, b), S = path.join(shadowDir, b);
  const lf = new Set(walk(L)), sf = new Set(walk(S));
  const r = { same: 0, near: 0, diff: [], onlyLive: [], onlyShadow: [] };
  for (const f of lf) {
    if (!sf.has(f)) { r.onlyLive.push(f); continue; }
    const a = fs.readFileSync(path.join(L, f)), c = fs.readFileSync(path.join(S, f));
    if (a.equals(c)) { r.same++; continue; }
    if (f.endsWith(".json")) {
      try {
        const ja = strip(JSON.parse(a)), jc = strip(JSON.parse(c));
        const d = firstDiff(ja, jc);
        if (!d) { r.near++; continue; }
        r.diff.push(`${f} (first difference at ${d})`); continue;
      } catch { /* not JSON: a plain diff */ }
    }
    r.diff.push(f);
  }
  for (const f of sf) if (!lf.has(f)) r.onlyShadow.push(f);
  diffs += r.diff.length;
  report.branches[b] = r;
}
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(report, null, 1) + "\n");
const md = [`# Shadow compare, ${report.at}`, "", "| Branch | Same | Same but time | Different | Only live | Only shadow |", "|---|---|---|---|---|---|",
  ...BRANCHES.map((b) => { const r = report.branches[b]; return `| ${b} | ${r.same} | ${r.near} | ${r.diff.length} | ${r.onlyLive.length} | ${r.onlyShadow.length} |`; }), ""];
for (const b of BRANCHES) {
  const r = report.branches[b];
  if (r.diff.length) md.push(`## ${b}: different`, ...r.diff.slice(0, 60).map((x) => `- ${x}`), "");
  if (r.onlyLive.length) md.push(`## ${b}: only on live`, ...r.onlyLive.slice(0, 30).map((x) => `- ${x}`), "");
  if (r.onlyShadow.length) md.push(`## ${b}: only in shadow`, ...r.onlyShadow.slice(0, 30).map((x) => `- ${x}`), "");
}
fs.writeFileSync(path.join(outDir, "report.md"), md.join("\n") + "\n");
console.log(md.slice(0, 4 + BRANCHES.length).join("\n"));
console.log(diffs ? `${diffs} different files (see report.md)` : "no differences");
