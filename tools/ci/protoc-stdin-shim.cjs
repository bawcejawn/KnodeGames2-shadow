// Repo Lens #L-3 I-1: the contract builder's three protoc plugins (@koinos/abi-proto-gen, as-proto-gen, as-gen)
// read their input with fs.readFileSync(process.stdin.fd). Touching process.stdin makes Node switch the pipe to non-blocking, so on a busy
// machine that read can stop with EAGAIN. This shim reads fd 0 to the end first (waiting on EAGAIN), then runs the
// unchanged plugin with readFileSync(stdin) answered from that buffer. The plugins get the same input and run the
// same code, so their output is the same: npm run test:hashes proves the wasm hashes are unchanged.
// Used as: require(<this file>).run(<the plugin's own bin file>), from the wrapper contract-hashes.mjs writes.
"use strict";
const fs = require("fs");
const path = require("path");

exports.run = (plugin) => {
const chunks = [];
const buf = Buffer.alloc(1 << 16);
const pause = new Int32Array(new SharedArrayBuffer(4));
for (;;) {
  let n;
  try { n = fs.readSync(0, buf, 0, buf.length, null); }
  catch (e) { if (e.code === "EAGAIN") { Atomics.wait(pause, 0, 0, 5); continue; } if (e.code === "EOF") break; throw e; }
  if (n === 0) break;
  chunks.push(Buffer.from(buf.subarray(0, n)));
}
const input = Buffer.concat(chunks);

const readFileSync = fs.readFileSync;
fs.readFileSync = function (file, ...rest) {
  return file === 0 ? Buffer.from(input) : readFileSync.call(this, file, ...rest);
};
require(path.resolve(plugin));
};
