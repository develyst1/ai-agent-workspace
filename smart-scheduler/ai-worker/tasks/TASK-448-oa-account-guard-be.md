# TASK-448 — 🔴 SAFETY: every OA-writing script must REFUSE unless the token's account is the one the operator named (`--account` / an allow-list) — the relink dry-run resolved to the CUSTOMER'S REAL OA from a local `.env` — BE, S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-23) · **Size S.** No migration.

## §0 What happened (owner → @Porter → me, 09-23)
The owner ran `bun run line:relink-menus` locally; the header read **`LINE account: SOM.BALANCE.SCHOOL (@427ybeky)`** — the customer's REAL OA (201 real teachers/parents, all `linked none`). Nothing was written (dry run, and Porter stopped the `--apply`). The local `.env` was pointing at the real account. **The printed header was the only guard, and a header is something a human can skim past.** The owner has since repointed his `.env`; the guard is still owed — the same slip will happen again.

## §1 Build
1. **`lib/oa-guard.ts` (pure decision + one IO caller):** `assertAccount(actual: { displayName, basicId }, requested: string | undefined, allow: string[])` ⇒ `ok` | `refuse(reason)`. Match on `basicId` (`@125vuzsj`) primarily, the display name secondarily, case-insensitive; **an unreadable identity refuses** (a tool that cannot name the account must not write to it). The allow-list is an env/setting listing the accounts this checkout may WRITE to (e.g. `LINE_OA_WRITE_ALLOW=@125vuzsj`), empty ⇒ nothing is writable without `--account`.
2. **Every write-capable OA script asks it before the FIRST write:** `line:relink-menus --apply`, `line:publish-menus`, `line:remove-menus --apply`, and any other script that POSTs/DELETEs to the Messaging API (list them in your report). The operator must pass `--account @xxxx`; it must MATCH the token's real account AND be on the allow-list, else the script prints both names and exits non-zero **before any call that writes**. Read-only paths (dry-runs, `line:inspect-menus`) keep working and keep printing the account — they write nothing.
3. **The refusal text names both sides** — `token points at SOM.BALANCE.SCHOOL (@427ybeky); you asked for @125vuzsj — refusing` — so the slip is visible in one line.
4. Pins: match · mismatch · missing `--account` · unreadable identity · not on the allow-list — all by value on the pure function; by source, that each write script calls it before its first writing call (a scan pin, like the census pins: a new OA-writing script without the guard fails the suite).
- 🚫 No change to what the scripts do once allowed; no new env for read-only tools.

## Definition of Done
- [ ] The five decisions by value · the scan pin (every OA-writing script guarded) · the refusal text · suite **count** · tsc 0 · 53 = 53 · 🔑 Break-and-watch, `finally`, CHECKSUM · report here + `inbox/SA.md` + log. Deploy note for the human: set `LINE_OA_WRITE_ALLOW` per machine.

---

# ✅ CODE DONE — @Jason → @Sober (2026-09-23) — the guard built; the census found a FIFTH writer (the one that messages a real person); 2811 pass / 0 fail; 15/15 mutations bite

**Numbers:** `bun test` **2811 pass / 0 fail**, 216 files (+1: `src/lib/oa-write-guard-req105.test.ts`, 11 tests) · `tsc --noEmit` **0** · 53 = 53 (no migration) · no pins moved.

## §1 The census you asked for — every script, and what it can do to an account
| script | reaches the Messaging API to WRITE | verdict |
|---|---|---|
| `line:publish-menus` | `createRichMenu` · `uploadRichMenuImage` · `setDefaultRichMenu` | 🔒 **guarded** |
| `line:remove-menus --apply` | `clearDefaultRichMenu` · `deleteRichMenu` | 🔒 **guarded** (after the plan print, after the `--apply` exit) |
| `line:relink-menus --apply` | `linkRichMenuToUser` | 🔒 **guarded** (same place) |
| **`scripts/line-push.ts`** | **`pushMessage` — it SENDS A LINE MESSAGE TO A REAL PERSON** | 🔒 **guarded** — 🔴 the one your §1.2 list did not name, and the worst of the four: the relink slip would have re-linked strangers' menus; this one writes into a stranger's chat |
| `line:inspect-menus` | none | read-only — **and it now prints the account it is reading** (it did not; the slip began as a report about the wrong OA, and a reader who cannot see the account cannot see that either) |
| `line:adopt-menus` | none (`storeMenuIds` writes OUR `app_settings`) | read-only toward the OA — unguarded, by design |
| `line-webhook-test.ts` | none (it POSTs a signed fake event to OUR OWN webhook) | unguarded, by design |

## §2 What was built
- **`src/lib/oa-guard.ts`** — the decision is pure and exhaustive: `decideOaWrite(actual, requested, allow)` ⇒ `{ ok, account }` or a refusal with a `reason` and the sentence to print. **The order is the point:** `unreadable` → `not-requested` → `mismatch` → `not-allowed`. Matching is on `basicId` first, the display name second, case-insensitive and `@`-insensitive (` @125VUZSJ ` = `125vuzsj` = `SOM-Balance-Demo`), on BOTH the operator's `--account` and the allow-list. `oaWriteAllowList()` reads `LINE_OA_WRITE_ALLOW` (comma-separated); **empty ⇒ nothing is writable** (pinned — a permissive default would be this defect with extra steps). `accountArg(argv)` takes `--account @x` and `--account=@x`. `getBotIdentity()` is the one IO (`GET /v2/bot/info`) and returns **null on any failure**, which the decision reads as "refuse" — a tool that cannot name the account must not write to it.
- **`guardOaWriteOrExit()`** — the ONE line each write script runs before its first write: on a refusal it prints the sentence and **exits 1** (it does not throw — a script cannot swallow it by accident); on success it prints `✓ writing to <account> (named with --account, on the allow-list)`.
- **The refusal names both sides, in one line:** `✗ refusing to write: token points at SOM.BALANCE.SCHOOL (@427ybeky); you asked for @125vuzsj — refusing.` (the exact bytes of the slip, pinned as a value).
- **Read-only paths keep working, untouched:** both sweeps print their plan and exit on a dry run **before** the guard is reached (pinned: the guard sits after the plan print, after the `--apply` exit, before the confirmation prompt — a mutation that moves it above the dry-run exit bites).

## 🔑 The scan pin (the load-bearing one)
A test walks **every** file in `scripts/`, detects calls to a closed list of ten OA-writing functions, and asserts each such script calls `guardOaWriteOrExit` **before its first writing call** — plus that the guarded set is exactly those four. ⇒ **a new OA-writing script added without the guard fails the suite**, which is what makes this a rule rather than a habit. The scan also pins that the three read-only tools call no writer at all.

## Break-and-watch — `mut448.mjs`, 15 mutations, **15 bite** (`try/finally`, sha-256 restore byte-identical)
A an unreadable identity allowed · B a missing `--account` allowed · C the mismatch check dropped (THE SLIP returns) · D the allow-list ignored · E an empty allow-list means everything · F the refusal names only one side · G matching made case-sensitive · H a failed `GET /info` invents an identity · I the guard logs and continues · J/K/L/M/N each of the four scripts loses its guard (or runs it too late) · O the guard moved above the dry-run exit.

## 📦 Deploy note for the human (per machine, no migration)
Set **`LINE_OA_WRITE_ALLOW`** in each `.env` to the account THAT machine may write to — e.g. the demo box `LINE_OA_WRITE_ALLOW=@125vuzsj`, the production box `@427ybeky`. Then every write run must also name it: `bun run line:relink-menus --apply --account @125vuzsj`. A box with the variable unset can still run every dry-run and every read-only tool, and can write nothing at all. 🚫 No deploy request from me. ⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-23)
Re-run by me: **2811 pass / 0 fail** · tsc 0 · 53 = 53 · `lib/oa-guard.ts` present · the guard called in exactly the four writing scripts (`publish-menus`, `push`, `relink-menus`, `remove-menus`). **His census beat my list:** `scripts/line-push.ts` sends a LINE message to a real person and I had not named it — the worst of the four, and now guarded. The empty allow-list meaning "nothing is writable" and the refusal printing BOTH account names are the right defaults; the scan pin (a new OA-writing script without the guard fails the suite) is what makes this a rule rather than a habit.
