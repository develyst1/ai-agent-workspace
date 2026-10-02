# TASK-577 — 🔴 D10 (blocker) + F-E: the cover dead-ends, and the duplicate warning shows twice — FE, S/M

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-30) · Tanya, TEST-076 on sid. 🔴 **D10 is a blocker.**

## §0 ⚠️ First
**Re-read the front repo and say so.** 🚫 **Palm's items 4, 9, 11.**

## §1 🔴 D10 — a one-session cover cannot be saved
**Save returns `400 RATE_REQUIRED`; the Swap dialog has NO rate box.** **The API works when `rateMinor` is sent.** **The series rate list refuses coaches who are not on it, and Swap offers only those coaches** ⇒ 🔑 **Khwan's exact case — teacher A covering for B — always fails.**
**The owner's ruling: the COVERING coach's rate is paid.**
- **The screen must be able to carry or enter A's rate.** ⚠️ **Which of the two, and why, is yours to decide and state in one line** — *carrying a rate A already has is better than asking for one, if A has one.*
- 🔑 **Derive the whole failing path before you fix a symptom:** **who Swap OFFERS, what the series list ACCEPTS, and what the save REQUIRES.** ⚠️ **If those three disagree in more than this one way, name every way.** *A rate box that fixes one dead end while the offer list still excludes the right coach is not a fix.*
- 🔴 **If the honest fix needs the server** (a rate the FE cannot know, or a list the FE cannot widen), **STOP and tell me** — 🚫 **do not invent a rate.**

## §2 🟠 F-E — two duplicate-name boxes
**The new "real name" box AND the old "surname or nickname" box both render.** **The owner ruled a REWORD ⇒ there must be ONE.**
⚠️ **Say which one you removed and why it was the right one to remove.** 🔑 **The surviving box must be the one the owner approved** — *keeping the old words and hiding the new box would satisfy the screenshot and not the ruling.*

## §3 The proof
🔑 **D10: clicked, end to end — choose a covering coach, save, and assert the PATCH carries the rate and succeeds.** ⚠️ **A test that only proves the box renders is exactly what let this reach Tanya.**
✅ **F-E: assert ONE box, by count, in both languages.**

## Definition of Done
- [ ] D10 saveable end to end, **the three-way disagreement fully named** (or STOPPED if the server is needed) · the rate choice justified in one line · F-E one box, asserted **by count**, the right one kept · front repo re-read and said · suite **count** · tsc · build ok · Break-and-watch through `scripts/mutation/` equivalent, CHECKSUM · report + `inbox/SA.md` + log.

---

# 📤 REPORT — @Fern → @Sober (2026-09-30)

## §0 ✅ Front repo re-read first — and it had moved
🚫 Not from memory. **A new commit had landed since my last task** (`ffa8e9f` — the series scope and voucher expiry work, through the owner's git), so I read the current `develop`: the swap door, `series-scope.ts`, the FE service and hook types, **and @Jason's TASK-562 backend** — the route, `swapOtherSeriesTeacher`, `voucherExpiryDecision`'s neighbour `seriesRateOf`, `assertRatesOnBooking` and the route-access table. 🚫 Palm's items 4, 9, 11 untouched.

## §1 🔴 D10 — the whole failing path, derived before anything was fixed
**It is not one missing box. It is a closed loop between three rules that each look right alone:**
| | rule | where |
|---|---|---|
| **Who Swap OFFERS** | `bookable && NOT already on the row` | this dialog, `choices` |
| **What a rate may be SET for** | only a teacher **already on the row** — `assertRatesOnBooking`, else `400 VALIDATION` | `updateOtherSeries` |
| **What the save REQUIRES** | with `onDate`: `rateMinor ?? seriesRateOf(rows, to)`, and **null is refused** | `swapOtherSeriesTeacher` |
🔑 **So the coaches the door offers are exactly the coaches who cannot yet have a rate, the rate list refuses to give them one in advance, and the save refuses without one.** ⇒ **Khwan's case always failed, and no amount of retrying could have worked.** **The only exit is `rateMinor` in the swap body** — which this door deliberately never sent, with a comment explaining why (*"a field that could contradict the scope is worse than none"*), written before the cover path existed.

### ⚠️ The disagreements, named — there are FIVE, not one
1. 🔴 **Offer vs rate source** (above): disjoint **by construction**, not by accident.
2. ⚠️ **What the FE can SEE is narrower than what the server FALLS BACK to.** `series.teacherRates` is built from the **header row's** primary and extras; `seriesRateOf` scans **every** row. ⇒ **the FE cannot tell whether the server's fallback would have succeeded** (a coach who covered an earlier session has a rate the DTO never shows).
3. ⚠️ **Scope coupling:** `rateMinor` is written **only** on `onDate`. Over the rest of the series the server writes no rate at all ⇒ a box there offers a number that goes nowhere. **Answered by showing it only in the scope where it means something**, which is what the old comment's fear deserved instead of silence.
4. 🔴 **The KEY vs a REQUIRED field — and this one I cannot close.** `withoutRates` strips `rateMinor` for an admin without **key 59** (`COACH_RATE_KEY`), because the server answers **403** for a rate sent without it. But a cover **requires** a rate. ⇒ **An admin who lacks key 59 cannot save a cover for a fresh coach at all: the FE must not send the field, and the server will not accept the save without it.** 🚫 **I did not invent a rate, and I did not send one without the key.** ⇒ **§4 is a question for you.**
5. 📌 **The type was narrower than the body already being sent:** `swapOtherSeriesTeacher`'s type named `fromDate` only, while the door had been sending `onDate` since TASK-564. *A body wider than its type is how a required field goes missing without a compile error.* Both the service and the hook now name `onDate` and `rateMinor`.

## §2 The fix — and the one-line justification you asked for
⚖️ **ENTERED, not carried** — and not as a preference: **the only rates this screen can see belong to coaches already on the row, which are exactly the coaches Swap does not offer, so there is never a rate to carry.** (`knownSeriesRate` stays anyway, pinned: if the DTO ever carries earlier rows' rates, the box fills itself.)
- **The box appears only for a COVER** (swap + *this session only*), **only with key 59**, is **required**, and is labelled with the covering coach's name (*"บี's rate for this session"*) so it cannot be read as the covered coach's.
- **Two guards:** the Save is disabled, **and** `submit` returns before the request. 🔑 *A 400 the screen could have prevented is a dead end — which is exactly what D10 was.*
- **`rateMinor` rides only on `onDate`, and only through `withoutRates`** — so it can never contradict the scope and can never be sent without the key.

## §3 🟠 F-E — one box, and it is the owner's
**Two boxes were rendering for one refusal:** the **red page-top** `FailureAlert` (the owner's **approved reword** — COPY-REVIEW §8) *and* an **orange field-level** alert showing `register.dupDetailHint` (**the LINE chat's old sentence**, *"add a surname or nickname"*).
✅ **Removed: the OLD WORDS, not the box.** The surviving box is **at the field**, where the parent has to act, and it now renders **`register.code.NAME_DUPLICATE_NEEDS_DETAIL`** — the approved reword. The refusal no longer also raises the page-top alert (`setFailure(null); return;`).
🔑 **`dupDetailHint` is DELETED from both dictionaries, not left unused** — *keeping the old words and hiding the other box would have satisfied the screenshot and not the ruling.* ⚠️ **The LINE chat keeps its own copy of the old sentence; COPY-REVIEW §8 already asks whether it should match.** **Asserted by count:** the page mentions the code twice (the branch, and the one box), and `dupDetailHint` is gone from the page and from both dictionaries.

## §4 🔴 STOP — the one thing I cannot honestly fix
**An admin WITHOUT key 59 still has no way to save a cover for a coach with no rate in the series.** The screen cannot send a rate (403), and the server cannot accept the save without one (400).
**Three ways out, all yours (or the owner's):** (a) **the cover door requires key 59** — say so on screen and hide it otherwise; (b) **the server accepts a cover without a rate for a rate-less admin** — 🚫 which contradicts *"never the covered teacher's rate by default"*; (c) **a rate can be set for a coach before they are on the row** (loosen `assertRatesOnBooking`), so the fallback has something to find.
🚫 **I did not pick one.** Today the door simply shows no box to those admins, which is the pre-existing behaviour — **not a fix, and not hidden.**

## §5 The proof — 🔑 clicked, end to end
**The old clicked test asserted the dead end** — it read *"no rate on a swap … this door offers no rate box"* and **passed**, while every save it described came back `400` on sid. 📌 **The pin was faithful to the code, and the code was wrong.** *That is what a test can do when it asserts a decision instead of an outcome.*
✅ **Rewritten as the whole act:** choose the covering coach · choose *this session only* · 🔴 **the door is SHUT and pressing it sends NOTHING** · enter the rate (`fireEvent.change` — a masked `NumberInput`, TASK-559) · **the PATCH carries `{ from, onDate, rateMinor, to }` with `rateMinor: 65000`** — satang, the covering coach's.
✅ **And the twin:** over the REST of the series there is **no box and no `rateMinor`**, because the server writes none.
📌 **TASK-567's sweep caught its own new sibling the same hour:** this file now types into a masked input, so the sweep pulled it into scope and demanded a request assertion — **which it already had.** The in-scope list is updated and still pinned.

## §6 🔑 Break-and-watch — 9 mutations, and one of them crashes Bun
`scripts/mutation/task-577.json` · **BASELINE 120/0, 253 B green** · **CHECKSUM identical** on both runs.

| # | mutation | verdict |
|---|---|---|
| C1 | 🔴 the cover's rate stops riding the body (**D10 itself**) | ✅ BITES 119/1 |
| C2 | 🔴 the rate rides on a WHOLE-SERIES swap too | ⚠️ **NO RESULT (the runner crashed)** → ✅ **BITES 112/1 at the rule** |
| C3 | the pre-request guard removed | ✅ BITES 119/1 |
| C4 | the Save opens on a cover with no rate | ✅ BITES 118/2 |
| C5 | 🔴 the rate box disappears | ✅ BITES 119/1 |
| C6 | baht sent as baht, not satang | ✅ BITES 119/1 |
| C7 | 🔴 F-E: the OLD words come back in the surviving box | ✅ BITES 119/1 |
| C8 | 🔴 F-E: the second box comes back | ✅ BITES 119/1 |
| C9 | a rate rides without the key (403) | ✅ BITES 118/2 |

### 🔴 C2 — a FOURTH way a run yields no counts: the test runner itself dies
**With that mutation the DOM run produced no summary at all — and it was not a timeout, an overflow or a signal: Bun CRASHED.** `0xC0000409` (STATUS_STACK_BUFFER_OVERRUN) on one run, exit 9 on the next; 122 bytes of output, no failure, no kill signal.
✅ **The rule held without being asked to** — NO RESULT, never a colour. ✅ **And I fixed the REASON rather than the row:** the verdict now names the exit status, because *"NO SUMMARY" sends the reader looking for a missing print; "the test runner exited 0xC0000409" sends them to the crash.*
🔑 **Then I proved the rule where it lives** — `coverRateRequired` is now pinned as a unit (`swap+this` true; `swap+rest`, `add+this`, `remove`, and no-scope all false), and **C2 bites 112/1 there.** 📌 *A rule whose only proof is a run that can crash is a rule with no proof on the days it crashes.*
⚠️ **C3 also survived at first — and for the reason I keep meeting:** with the button still disabled, removing the pre-request return changes nothing a click can see. ✅ **Two guards need two proofs;** the guard is now pinned at the source and C3 bites.

## §7 Verification
**853 pass / 0 fail across 90 files** (was 850/90) · **tsc clean** · **`bun run build` ok** · **`bun run mutation:prove`: all five cases still hold** after the verdict change · both mutation runs ended **CHECKSUM identical**.
🚫 No SQL, no database, no environment · **no BE change made** (§4 is a question, not a patch) · no deploy request · git read only.
📋 **2 drafts** (`coverRate`, `coverRateHint`), both languages, `DRAFT (Fern, TASK-577)` — **they go in the copy file with §4's answer**, since the label may have to say *"you need the rate permission"* instead. **1 string DELETED** (`dupDetailHint`, both languages).
⚠️ **Declared: five existing pins updated, none weakened** — the scope Save condition (it grew), the two swap-body pins (now `withoutRates(… …rateOnCover)`, and the GROUP `{ to }`-alone rule they exist for is unchanged), the `otherSeries` copy count 43 → 45, and the AC-9 duplicate pin (now: the approved key, one box by count, and the deleted key asserted absent from both dictionaries).
⚠️ **Not proven by me:** CSS, focus and a real tap · the server's own cover arithmetic · **and whether a rate-less admin should be able to save a cover at all, which is §4.**

**Ball: @Sober — 🔴 with §4 open.**

---

# ✅ DONE — REVIEWED by @Sober (2026-09-30) · ⛔ **§4 ruled below; one half goes to the owner**
Verified by me: **853 pass / 0 fail** across 90 files · tsc 0 · build ok. ✅ **And she re-read the repo first — a new commit had landed through the owner's git.**

## 🔑 D10 was a CLOSED LOOP, not a missing box
**Swap offers `bookable && NOT on the row` · a rate may be set only for a teacher ALREADY on the row · the save REQUIRES a rate and refuses null** ⇒ **the coaches the door offers are exactly the coaches who cannot yet have a rate.**
🔑 **"Khwan's case always failed, and no retry could ever have worked."** 📌 **Three rules that each look right alone. That is why I asked for the path and not the symptom.**
**Five disagreements, and (5) is the keeper:** 🔴 **the TYPE was narrower than the body already being sent** (`swapOtherSeriesTeacher` named only `fromDate` while the door had sent `onDate` since TASK-564) ⇒ 🔑 **"a body wider than its type is how a required field goes missing without a compile error."** ✅ **And (2) is the subtle one: `series.teacherRates` is the HEADER ROW's while `seriesRateOf` scans every row — so the screen cannot tell whether the server's fallback would have succeeded.**

## ✅ §2 and §3
**ENTERED, not carried — and not as a preference: there is never a rate to carry**, because the only visible rates belong to coaches Swap does not offer. ✅ **Cover only, key 59 only, required, labelled with the COVERING coach's name so it cannot be read as the other's. Two guards. `rateMinor` rides only on `onDate`.**
✅ **F-E: she removed the OLD WORDS, not the box** — the survivor is **at the field, where the parent must act, carrying the APPROVED sentence** — and 🔑 **`dupDetailHint` is DELETED from both dictionaries, not left unused.** *Keeping the old words and hiding the other box would have satisfied the screenshot and not the ruling.*

## ⚖️ §4 — **(c) for the mechanism. The permission half is the owner's.**
**An admin WITHOUT key 59 still cannot save a cover for a coach with no series rate: the screen must not send a rate (403), the server will not accept the save without one (400).**
⚖️ **Ruled: (c) — a rate may be set for a coach as they are put on the row.** 🔑 **The loop's cause is an ORDERING assumption, not a business rule: in a cover, the assignment and the rate arrive in the same act.** ⇒ **(c) removes the dead end at its cause.**
🚫 **(b) is out: it would pay the covered coach's rate by default, which the owner explicitly ruled against.** 🚫 **(a) is not mine to choose — it is a gate on who may cover a session.**
⛔ **The one question up the chain: may an admin WITHOUT the rate permission perform a cover at all?** **Yes ⇒ whose rate. No ⇒ the door must SAY so rather than showing a dead box.**
✅ **She was right to hold the two drafts** — *if the answer is (a), the label has to say "you need the rate permission" instead.* **Keep them held.**

## 🔑 §5 — the deepest finding in this round
**The OLD test asserted the dead end: *"no rate on a swap — this door offers no rate box"* PASSED, while every save it described came back 400 on sid.**
🔑 **"The pin was faithful to the code and the code was wrong."** 📌 **A pin proves the code does what it does. It cannot tell you that what it does is useless** — **and a confident pin on a broken path is how a defect survives a green suite for weeks.** **Recorded.**

## 🔴 §6 — a FOURTH way a run yields no counts
**Bun itself CRASHED (`0xC0000409`, exit 9), 122 bytes, no summary.** ✅ **The rule held unprompted: NO RESULT, never a colour.**
✅ **And she fixed the REASON rather than the row** — the verdict now names the exit status, because *"NO SUMMARY" sends the reader looking for a missing print; "the runner exited 0xC0000409" sends them to the crash.*
🔑 **Then she proved the rule WHERE IT LIVES: `coverRateRequired` pinned as a unit, C2 biting 112/1.** ⇒ ***"A rule whose only proof is a run that can crash is a rule with no proof on the days it crashes."*** **Recorded.**
⚠️ **C3 survived at first, same family as before: with the button still disabled, removing the pre-request return changes nothing a click can see.** ✅ **Two guards need two proofs.**
