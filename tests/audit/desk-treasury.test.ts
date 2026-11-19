import { test } from "node:test";
import assert from "node:assert/strict";
import { deskTreasury } from "../../bot/desk.ts";

const owner = "1635QUrBNDp7WqmFkRvrkGwjJXTtFvH717";
const treasury = "1LMV8EcRFLFGRMFSC7rKw3eQ3PSzLRRFmd";
const desk = "1FKTpXBhhHEbu5vVchM8UsVbAvPArJsRmR";

test("a new desk deploy requires a treasury that is not the owner and not the contract", () => {
  assert.equal(deskTreasury(owner, treasury, desk), treasury);
  assert.throws(() => deskTreasury(owner, undefined, desk), /DESK_TREASURY is missing/);
  assert.throws(() => deskTreasury(owner, owner, desk), /same address as the owner/);
  assert.throws(() => deskTreasury(owner, desk, desk), /desk's own address/);
});
