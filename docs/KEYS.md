# Keys and handover

This is the runbook for the five live contracts. It tells you which key does what, and the order to move power to a cold wallet. It does not send a transaction. You do that yourself, later, from your own computer, with a wallet you control.

Never paste a private key or recovery words into GitHub, email, or a chat.

## The words

| Word | Meaning |
|---|---|
| Owner key | Changes rules and can start an upgrade. Should be a cold wallet: offline, not on the PC that runs the nodes, not in GitHub. |
| Operator key | The bot. Posts questions, posts scores, seals. Cannot withdraw player stakes. May live in GitHub's `bot` environment. |
| Contract key | The contract's own address. Used once, to upload. After that it should stay offline. The sponsor is the exception: its own key is also its admin key. |
| Treasury | The only address the Swap Desk can pay. It should only receive. It must not be the owner. |
| Cold | A wallet whose words are on paper or a hardware wallet, not in a file on the node PC. |

The address named as the current owner in the old records is `1635QUrBNDp7WqmFkRvrkGwjJXTtFvH717`. The cold owner that Race already uses is `1LMV8EcRFLFGRMFSC7rKw3eQ3PSzLRRFmd`. Confirm both on chain before you trust this paragraph. A read-only check is `npm run bot -- chain-check` and `npm run desk -- status`. Those commands do not spend.

## The five contracts

### 1. Vault — `1Mpmf2ERhjYpX7CCiM11WERuM4j17uT1sr`

Holds the stakes. Also the Knode Games Pool producer.

| Key | What it may do | Wait |
|---|---|---|
| Owner | Pause deposits, set the operator, register the pool's producer key, propose a game, correct a result inside the window, schedule an upgrade, propose a new owner. | Upgrade and a new game wait 48 hours. A new owner waits about a day (28,800 blocks). There is no cancel for a proposed owner: propose your own address again to replace it. |
| Operator | Post and resolve questions. Post, seal, and finalize game results. | None. It cannot move stakes. |
| Contract's own key | `init`, once. | — |
| Player | Deposit, withdraw, claim, answer. | None for withdraw. |
| Anyone | Settle, compound, close a week, finalize a week that is already due. | They only advance the clock. |

Live build to expect: `11043e1fde1d8d7dbac75e9e5e788d058a7116b0dab6149fc09ecdc7b1c4258b`.

Withdrawals-only build, pinned for an emergency: `04c27c1acde570b97a430dea403d41aab47e083ae30115353ee5f89932dad0bb`.

**Handover.** From the current owner wallet: `npm run bot -- admin propose_owner new_owner=<cold address> --as owner --send` only when you mean it, with `CONFIRM_MAINNET=yes`. Then wait. From the cold wallet: accept. Accepting clears a pending upgrade. Do the upgrade first, or do the handover first, not both at once.

The owner key stays off GitHub and off the node PC.

### 2. Swap Desk — `1FKTpXBhhHEbu5vVchM8UsVbAvPArJsRmR`

Swaps VHP for KOIN. Pays out only to the treasury.

| Key | What it may do | Wait |
|---|---|---|
| Owner | Fee, limits, pause, node key, withdrawals (they go to the treasury), schedule a new treasury, schedule an upgrade, propose a new owner. | A lower fee, a higher cap, a new node key, a new treasury, an upgrade, and a new owner wait 48 hours, then must be applied within 7 days. A higher fee or a lower cap applies at once. |
| Contract's own key | Upload, once. | — |
| Treasury | Receives. It cannot sign desk actions unless it is also the owner, which is the situation we are leaving. | — |

Live build to expect: `309506ccfaadd3427e937aa88cd34c9ea2a9e6088e49e51f014d546489dd5f35`.

**Separate treasury.** Make a new wallet that you will not play with and will not use as owner. Write its address down.

1. `npm run desk -- treasury schedule <that address>` and read the dry run.
2. Add `--send` only when the address is right.
3. Wait 48 hours. You can cancel with `npm run desk -- treasury cancel --send` during the wait.
4. `npm run desk -- treasury apply --send`.
5. `npm run desk -- status` and check the treasury line is the new address, and the owner line is not.

A future deploy of a new desk refuses to start if `DESK_TREASURY` is missing or equal to the owner. The live desk is not redeployed by this repository.

**Owner handover.** `npm run desk -- owner propose <cold address> --send`, wait 48 hours, accept from the cold wallet with `NEW_OWNER_WIF` in `.env` for that one command, then remove it. Accepting clears a pending treasury change, so finish the treasury first.

### 3. Picks — `1LmgqBGctL9F2YkyjTXgieTXwnYHh8Y6Pm`

Stores Block X picks (and, later, other pick games). Does not hold the pot.

| Key | What it may do | Wait |
|---|---|---|
| Owner | Announce a game, pause a game, schedule an upgrade, propose a new owner. | A game and an upgrade wait 48 hours. A handover kills pending announcements, so do not hand over in the middle of one. |
| Player | Pick. | — |

Live build to expect: `700c296a1064b904299c156061d6caf8fcabd0b1765968903f29d89d2426c594`.

**Handover.** The owner commands are `npm run picks -- owner-propose`, then `owner-accept` after 48 hours, or `owner-cancel`. Read `npm run picks -- status` first.

### 4. Race picks — `1EN7xU8R9tQXjHvrX79qZvvvGkkKWVnB5K`

Stores race picks. The old records say the owner is already the cold address `1LMV8EcRFLFGRMFSC7rKw3eQ3PSzLRRFmd`. Confirm with `npm run racepicks -- status`.

| Key | What it may do | Wait |
|---|---|---|
| Owner | Turn the game on or off, set picks per day, set the owner. | **None.** A wrong owner address loses the contract at once. Use `npm run racepicks -- owner` so it asks twice. |
| Contract's own key | Code uploads. There is no timelock on the code. Keep this key offline. | — |
| Player | Pick. | — |

Live build to expect: `9993581baf822cd070331008441c5ad974f5c0b134520dfb7422b9efd1873864`.

### 5. Mana sponsor — `1ByDDSBUzy5zkRceELc54Jh8i41yNRoKt8`

Pays Mana for player actions, inside caps.

| Key | What it may do | Wait |
|---|---|---|
| Its own key | Change caps, turn on or off, upload new code. | **None.** This key is the whole admin. It does not belong on the node PC or in GitHub. |
| Owner of the other contracts | Nothing here, unless you have made them the same key, which you should not. | — |

Live build to expect: `b84e1add3ffa14a7d1933d5ce5a4ad33caa4bca887a489f87f710b3c121c83a6`.

## Where each key should sit

| Key | Where |
|---|---|
| Cold owner | Paper or a hardware wallet. Signs a handover or an upgrade, then goes away. |
| Desk treasury | A different cold wallet. It only receives. |
| Operator | GitHub environment `bot`, deployment branch rule: only `main`. Not a repository secret that every branch can read. |
| Vault / desk / picks / race contract keys | Offline, after the contract is uploaded. |
| Sponsor key | Offline, in the same place as the cold owner, but not the same words. |
| Node producer keys | On the PC that produces blocks. They cannot move funds. Do not delete a node's `block_producer` folder. |

## If a key leaks

1. If it is the operator: set a new operator on the vault (`set_operator`) from the cold owner, and delete the GitHub secret.
2. If it is the owner: propose the cold owner at once, if you still can, and watch for a scheduled upgrade. Cancel an upgrade you did not make.
3. If it is the sponsor: upload nothing, set the caps to the smallest numbers you can accept, and move the KOIN it holds out only by the contract's own rules.
4. If it is a node key: register the previous producer key again. The node key cannot take the stake.
