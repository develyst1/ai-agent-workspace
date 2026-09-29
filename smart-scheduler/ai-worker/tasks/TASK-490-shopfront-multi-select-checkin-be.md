# TASK-490 — the shop QR checks in 2+ children in one go — BE, S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-26) · Round item 3, owner-approved (Khwan's ask). FE is TASK-491. 💰 **This multiplies a credit-consuming act — read §2 before anything else.**

## §0 The ask
Today the shop-front page checks in **one** child per visit. A parent with two or three children in the same session block has to repeat the whole flow. Khwan wants **checkboxes and one Check-in button**.

## §1 What must NOT change (this is most of the task)
The shop-front guards were argued into place one at a time and each of them is load-bearing:
- the **rate limit** on lookups;
- the **window** (including K5's late minutes and the settle rule);
- **only children with a check-in-able session right now** — never the whole family;
- the **four indistinguishable "nothing" cases** (unknown number · nothing now · suspended · a child with an empty list) — one phase, one sentence, no names, no count. 🔑 **A multi-select must not become a fifth way to learn something about a family** — for example by a count, by a partial list, or by one child's row behaving differently from another's.
- 💰 **What a check-in consumes and what it announces to the parent are unchanged.** This is a new way to ask, not a new act.

## §2 🔴 The rule the FE cannot fix and the BE must get right: PARTIAL FAILURE
Three boxes are ticked; one of the three fails (its window closed in the seconds since the list was drawn, it is already ATTENDED, its household is suspended, the row moved).
- 🚫 **Never all-or-nothing.** Refusing two good check-ins because the third failed sends a parent back to a counter queue for no reason.
- 🚫 **Never one green tick for "done".** A parent who ticks three and is told "checked in" will walk away believing three children are checked in.
- 🔑 **The response says, per child, what happened** — succeeded, already, or refused with that child's own reason — and the FE renders it per child (TASK-491).
📌 **This is the lesson of TASK-483 applied before the fact rather than after:** on the camp page a perfectly correct refusal was rendered as a success and would have sent a nanny in with an absent child. **Here the risk is the same and larger, because one action now covers several children.**

## §3 Build
- **One endpoint takes several sessions** (the ids the page already holds from its lookup) and returns **one result row per requested child**, in the order asked.
- 🔑 **Each child is decided INDEPENDENTLY and by the same code path as today's single check-in.** 🚫 Do not fork the act: one child failing must not alter another child's outcome, and a batch must not be able to do anything a single check-in cannot. **Say how you guaranteed that** — reuse, not a parallel implementation.
- **Ordering and atomicity:** each child's check-in is its own transaction. A batch is **not** a transaction; there is no meaningful "undo the other two" here, and pretending otherwise would be worse.
- **The rate limit applies to the batch as a batch** — say what you chose and why. ⚠️ A batch endpoint is a cheap way to defeat a per-request limit, and I would rather you name the reasoning than pick a number silently.
- **A batch of one behaves exactly like today's single check-in** (pin it) — the FE will use one endpoint for both, and I do not want two behaviours.
- **Bounded:** a sane maximum per request, stated. The page can only ever offer what the lookup returned.

## §4 What I have NOT decided, and want from you first if it is not obvious in the code
**Whether the parent receives one message or one per child.** Today a check-in announces itself to the parent. Three at once could be three notifications in three seconds.
- **My inclination is one message per child**, because that is what the existing code does and because a child's attendance is the unit a parent cares about — but **if the code makes one combined message natural, say so and recommend it.** Do not build both.
- 🚫 **Whatever you choose, no message may be lost**: a parent must not learn about two of three children.

## Definition of Done
- [ ] One endpoint, **one result per requested child, in order**, each decided independently through the **same** code path as the single check-in (say how) · **partial success is normal and reported per child**, never all-or-nothing and never one green tick · a batch of one is byte-identical to today (pinned) · the rate limit's treatment of a batch **named and reasoned** · a stated maximum · 💰 nothing about consumption or the four indistinguishable nothings moved (pin them) · the notification question answered from the code · suite **count** · tsc 0 · 58 = 58 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation that makes one failure abort the batch, one that reports a single overall outcome, and one that lets a batch check in a child the single path would refuse · report here + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason → @Sober (2026-09-26) — `POST /api/checkin/shopfront/batch`: one result per item, in order, each exactly what the single call answers. 3197 pass / 0 fail · tsc 0 · 58 = 58 · 6/6 mutations bite

**Numbers:** `bun test` **3197 pass / 0 fail**, twice (+16 over 3181: the new file) · `tsc` **0** · **58 = 58** (no migration).

## The contract (for @Fern / TASK-491)
`POST /api/checkin/shopfront/batch` `{ phone, items: [{ bookingId } | { campDayId }, …] }`, with **1 to 10 items**.
- **200** `{ results: [{ bookingId | campDayId, status, body }, …] }`: **one row per item, in the order asked.**
  - `status` + `body` are **exactly what `POST /api/checkin/shopfront` answers for that one item**. A success is today's body (`{ already, booking, … }` / camp's `{ already, day, credit }`); a refusal is today's `{ error: { code, message } }` with today's status (400 too late, 409 NOT_CHECKINABLE, 429 RATE_LIMITED, 500 INTERNAL).
  - ⚠️ **The request answering 200 means "I read your list", never "they are checked in".** The FE decides per row from `status` (200 = checked in, or `already`); anything else is that child's own refusal.
- **400 before anything runs:** more than 10 items, an empty list, a duplicate item, an item with both or neither id, or a phone that isn't phone-shaped.
- **The single route is unchanged** and still works. The page can use the batch for one child too; a batch of one is the same answer (pinned below).

## 🔑 How "the same path" is guaranteed: reuse by construction, not a parallel copy
- **`shopfrontCheckinOne(ip, input)`** (`routes/checkin.ts`) is **today's single route body, lifted into a function**: ask the limiter → `shopfront.shopfrontCheckin` (re-runs the lookup, requires the id in the phone's CURRENT list, then `getCheckinQr` → `checkinByToken(…, "shopfront-qr")` or camp's pair) → tell the limiter.
  - **The single route is now one line that calls it; the batch calls it once per item.** Nothing else in the batch checks anything in.
  - A **source pin** forbids the batch route from naming `checkinByToken`, `checkinCampByToken`, `shopfront.shopfrontCheckin`, `updateBookingStatus`, `markDay` or `Promise.all`.
- **Refusals go through the app's ONE error envelope.** `app.onError`'s mapping moved **unchanged** into `errorEnvelope(err)` (`lib/http.ts`); `onError` now calls it, and so does the batch for each failed item. A child's refusal row therefore **cannot** differ from what the single call returns.
- **Independent, in order, and not a transaction.** The items run **sequentially** (not in parallel), each inside its own try/catch. Each act commits in its **own** transaction, exactly as today (`updateBookingStatus` / `markDay` open their own). There is no batch transaction and no "undo the other two". One child's failure is caught and recorded on that row, and the loop continues.

## ⚠️ The rate limit: a batch costs exactly N single requests
**Every item goes through the limiter exactly as a single request would:** asked before, recorded after, and a NOT_CHECKINABLE item counts as a miss.
- **Why per item:** a per-request limit would let one request carry up to 10 guesses. Per item means the 5-misses-per-10-minutes budget is spent at the same rate however the guesses are packaged.
- **Past the limit, the rest of the batch is refused ITEM BY ITEM with today's 429 row**, not silently dropped. Pinned: 7 strangers in one batch give `[409×5, 429, 429]`, and that IP's next single check-in and next lookup are both 429.
- **The busy desk still costs nothing**, because matches are not misses. Pinned: three full batches of 4 good items from one IP, all 200.
- **Why not "a batch = 1"?** It would make a batch a cheap way round the limit, which is exactly what you warned about. **Why not "refuse the whole batch if the budget can't cover it"?** That would be all-or-nothing by another name, and a family would be refused good children because of their own earlier typos. **Per item is the only rule under which a batch can do nothing that N single requests can't.**
- **The maximum is `SHOPFRONT_BATCH_MAX = 10`**, a stated, exported constant. The page can only offer what the lookup returned: this family's children with a session or camp half-day now. 10 is well above any real family and bounds one request's work to 10 lookups + 10 acts.

## 🔴 Partial failure, by value (`src/services/shopfront-batch-req108.test.ts`, 16 tests)
- **Three ticked, the middle one too late** ⇒ `[200, 400 CHECKIN_TOO_LATE (its own words), 200]`, and **the third was still attempted**.
- **The first fails** ⇒ `[400, 200, 200]`, and all three are attempted.
- **An unexpected error on one child** ⇒ that row is the app's own `500 INTERNAL`; the rows before AND after are reported.
- **Order:** reversed in gives reversed out; sessions and camp days mix.
- **The batch can't do what the single path refuses:**
  - an id from **another family** between two good ones ⇒ that row is `409 NOT_CHECKINABLE`, and **it never reaches the act**;
  - a class **not in its window** ⇒ 409, nothing checked in.
- **The four nothings, unchanged.** An unknown number, a suspended household, a family with nothing now, and a listed family asking for ids it doesn't hold **all give the byte-same batch body**, with no name and no id beyond what was sent. A per-item result gives a guesser nothing a single call didn't; the only new thing a batch carries is the items the caller sent.
- **A batch of ONE equals the single call**, pinned for five cases: a success, a refusal from the act, a miss, an unknown number, and a camp day. `results[0]` is `{ ...item, status: <single's status>, body: <single's body> }`.
- **Bounds:** 11 items, an empty list, a duplicate, or both ids ⇒ 400, and **nothing runs**.

## 💰 Consumption and messages: unchanged, and answered from the code
- **Nothing about what a check-in consumes moved.** Each item is today's act; the batch adds a loop and nothing else.
- **§4, one message or one per child: ONE PER SESSION, which is what the code already does. I recommend keeping it, and I built nothing new.** The parent's message is `notifyCourseDeduction(tx, …)`, enqueued in the outbox **inside the same transaction as the deduction** (`scheduler.service.ts`, the `attend` branch; TASK-254: "tied to the write that caused it").
  - 🔑 **That is why "no message lost" already holds per child:** a child whose check-in committed has its message in the outbox, atomically, and a child whose check-in failed has none.
  - **A combined message is NOT natural here.** It would need a second message built after all N transactions, detached from the writes that justify it. A crash between the commits and that send would lose the message for children who ARE checked in, which is exactly the failure you ruled out. It would also need de-duplicating against the per-session ones.
  - **Two things to know for the page and the owner:**
    - A **DUO** row is one session and one message, as today.
    - **Camp days announce at the day-end, not at the scan** (TASK-475 §A2, unchanged). So three ticked children could be two messages now and one this evening.

## Moved pin (narrowed with its reason, not weakened)
- `delete-student-req089.route.test.ts` › "the restrict error (23503) … `onError` would render it 400 VALIDATION" read the 23503 → 400 mapping **in `index.ts`'s source**. The mapping moved, unchanged, into `errorEnvelope`.
- The pin now reads it **where it lives** (`lib/http.ts`), pins that `onError` calls `errorEnvelope`, and adds a **by-value** check: `errorEnvelope({ cause: { code: "23503" } })` gives `400 VALIDATION`. The comment says why it moved.

## Break-and-watch: `mut490.mjs`, 6 mutations, **6 bite**
`BASELINE=56` (the batch file, the shop-front file, the delete-student pin, the validation envelope), read off a real run. `finally` + sha-256 restore, byte-identical every time. **CHECKSUM `3dffe278…` identical before and after.**
- **A — one failure ABORTS the batch** (the catch rethrows): **bites, 11 fail**.
- **B — a SINGLE overall outcome** (one row for the batch): **bites, 8 fail**.
- **C — the batch checks in a child the single path would refuse** (its own act, skipping the phone's list): **bites, 7 fail** (by value, since another family's class gets checked in, and by source).
- **D — the batch goes round the rate limit** (the act without the limiter): **bites, 2 fail**.
- **E — a batch of one not the single call** (every refusal flattened to 400): **bites, 8 fail**.
- **F — the maximum lifted**: **bites, 1 fail**.

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-26)
Re-run by me, twice: **3197 pass / 0 fail** both times · tsc 0 · 58 = 58 · `SHOPFRONT_BATCH_MAX = 10` at `routes/checkin.ts:27`, `errorEnvelope` at `lib/http.ts:31`.

🔑 **"The same code path" is not asserted here, it is made structurally true.** Today's single-route body became **`shopfrontCheckinOne`**; the single route calls it once and the batch calls it once per item. ⇒ **A batch cannot do anything a single check-in cannot, because there is only one implementation of the act.** That is the difference between a claim in a report and a property of the code, and it is what I was asking for when I wrote "reuse, not a parallel implementation".
✅ **And the refusals go through `errorEnvelope` — the app's own `onError` mapping, MOVED rather than re-created.** A batch row's error body is therefore identical to the single route's by construction, not by a second translation table that would drift the first time someone adds an error code. 📌 **Moving a mapping into a library beats copying it, even when copying is three lines.**

✅ **The rate limit: per item, with the reasoning stated — accepted.** *A batch costs exactly N single requests; misses count; past the limit the remaining rows are 429 row by row.* That closes the hole I was worried about (a batch endpoint as a cheap way to defeat a per-request limit) **without punishing the busy desk**, which is the case that actually happens forty times a day.
✅ **Each item its own transaction, no batch transaction** — as ruled, and for the right reason: there is no meaningful "undo the other two".

## §4 — his answer is better than my inclination, and the reason is the good part
I leaned toward one message per child "because that is what the code does". **He gave the real reason: the message is enqueued in the SAME transaction as the deduction.** So *"no message may be lost"* is not a rule we have to enforce — it is already a property of the write. ⇒ **A combined message would have to be detached from those writes, which is exactly the loss I ruled out.** My instinct was right; his justification is the one worth keeping, because it says *why* it cannot be otherwise. ✅ **One message per session stays.** (And camp announces at the day-end, not the scan — noted.)

✅ **Pinned where it counts:** partial failure in the middle, at the start, and on a 500 · the order · **another family's id never reaching the act** · the four "nothing" cases byte-same · **a batch of one identical to the single call, across five cases** · the bounds. The moved pin (`23503` mapping now read from `lib/http.ts`) is narrowed **and** gains a by-value check, so the move did not cost coverage.

**REQ-108's multi-select is complete on the BE. ▶️ TASK-491 is Fern's.**
