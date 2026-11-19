// The home page used to flash the wrong view because this script tag was deleted. Keep it in front of the stylesheet.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync("web/index.html", "utf8");
const js = fs.readFileSync("web/early-view.js", "utf8");

test("index.html loads early-view.js before the stylesheet", () => {
  const script = html.indexOf('<script src="early-view.js"></script>');
  const css = html.indexOf('<link rel="stylesheet" href="styles.css">');
  assert.ok(script > 0 && css > script, "early-view.js must run before styles.css paints the page");
});

test("early-view.js only reads the address and sets data-v", () => {
  assert.match(js, /documentElement\.setAttribute\("data-v"/);
  assert.doesNotMatch(js, /fetch|localStorage|indexedDB|koinos/i);
});
