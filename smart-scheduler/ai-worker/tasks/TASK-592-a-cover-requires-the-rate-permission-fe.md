# TASK-592 — a cover REQUIRES the rate permission, and the screen says so — FE, XS/S

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-30) · 🔴 **The owner ruled (a). This is small and it is folding into the deploy — tell me the moment it is green.**

## §0 The ruling
**A cover REQUIRES the rate permission (key 59).** ⇒ **An admin without it must be TOLD, not left in front of a control that cannot work.**
✅ **The server already refuses it** (TASK-584 put the existing guard on that door) — 🔑 **so this is the screen catching up with a rule that is already true, not a new rule.**

## §1 The work
- **An admin WITHOUT key 59 opening the cover door sees WHY they cannot, in words.** 🚫 **Not a hidden control and not a dead one** — *a control that does nothing is the dead end we spent this round removing.*
- ✅ **Use your HELD drafts, reworded for (a)** — **they were written for exactly this answer.** 📋 **File them as `§T-592`, both languages, shape-pinned.** 🔑 **The sentence must name the PERMISSION, not blame the coach or the rate.**
- ⚠️ **Say what an admin WITH the key sees, unchanged** — **and pin that this did not narrow anything for them.** 🔑 *A permission message is a fine place to accidentally gate someone who was fine before.*
- ⚠️ **And derive whether any OTHER cover entry point exists** that would still show a dead box. 🔑 **One door told and another silent is worse than neither.**

## §2 The proof
🔑 **Clicked, both identities: without the key ⇒ the sentence, no rate box, and NO request · with the key ⇒ exactly what TASK-577 built, unchanged.**

## §3 Not in scope
🚫 The server (already refuses) · 🚫 changing who may cover · 🚫 Palm's items.

## Definition of Done
- [ ] Without the key: **the reason in words**, no dead control, **no request** · with the key: **unchanged and pinned** · every cover entry point **derived** · drafts filed as `§T-592` · 🔑 clicked on both identities, asserting the requests · front repo re-read and said · suite **count** · tsc · build ok · Break-and-watch, CHECKSUM · report + `inbox/SA.md` + log · ⚠️ **tell me the moment it is green — @Porter is holding a deploy for it.**

---

# 📤 REPORT — @Fern → @Sober (2026-09-30) — 🟢 **GREEN, and @Porter can have the deploy**

## §0 ✅ Front repo re-read first
Tip still `ffa8e9f`. I read the swap door as TASK-577 left it, `duo.ts`'s key and `withoutRates`, and **@Jason's TASK-584 guard** before touching anything. 🚫 Palm's items 4, 9, 11 untouched.

## §1 What the screen now does
**An admin WITHOUT key 59 choosing *"this session only"* on a swap sees the reason, in words, where the rate box would be.**
- 🔑 **The sentence names the PERMISSION** — 🚫 not the coach (*they are fine*), 🚫 not the rate (*it is not wrong*) — says **why** it is needed (a cover is paid at the covering coach's rate) and **what to do next.** *A reason with no next step is a dead end with a caption.*
- 🚫 **The door is neither hidden nor dead:** they can see the cover exists, read why they cannot do it, and go to someone who can. *A control that does nothing is exactly what this round was spent removing.*
- 🔴 **Two guards, as ever:** the Save is shut **and** `submit` returns before the request. **We never send a body we already know the server refuses.**
- ✅ **And it is the screen catching up with a rule that is already true** — the server refuses it either way.

## §2 ⚠️ What it must NOT have narrowed — and the pin that proves it
**An admin WITH the key sees exactly what TASK-577 built: the rate box, its own required-guard, and nothing else.** ⇒ **pinned at the source** (the box's condition and its guard are asserted verbatim) **and clicked** in the existing DOM file, which runs as the all-keys identity.
🔑 **The block is `needRate && !canRate` — the narrowest thing that can be true:** a rate is required **only** on a swap scoped to one session, so
- **the whole-series swap** is untouched (no rate is written there at all) — **clicked: the body is `{from, fromDate, to}` and saves normally**;
- **add-a-coach on one session** is untouched (a JOIN pays each coach their own rate; its rate box was always the optional one) — **clicked: `{onDate, teacherId}`**.
📌 **Both of those are mutations too (K4, K5), because "it did not narrow anyone" is the claim most likely to be false later.**

## §3 ⚠️ Every cover entry point — derived
🔑 **There is exactly ONE, and that is a derivation, not a glance:**
1. **`onDate` + `rateMinor` are sent from one place in the whole app** — `TeacherDialog`'s swap branch (grepped across components, hooks and services).
2. **`GroupSwapDialog` has neither** — a group swap delegates on the BE and has no cover path at all (pinned by absence).
3. **`TeacherDialog` is mounted once**, from `OtherSeriesModal` (pinned by count).
⇒ **No other door can show a dead box.** *One door told and another silent would have been worse than neither.*

## §4 The proof — 🔑 clicked, on BOTH identities
**A new file for the identity that lacks the key** (`cover-needs-key.dom.test.tsx`), because **`mock.module` is global to the process**: an identity without the key cannot live in the file that mocks `useCan` to grant everything. *The alternative was a mutable mock, and a test whose identity depends on execution order is not a test of an identity.*
- **without the key:** the sentence names the permission · 🚫 no rate box · **the Save is shut and pressing it sends NOTHING** · the whole-series swap still saves · add-on-one-session still saves;
- **with the key:** the existing 7 clicked tests are unchanged and still green — *the rate box, the two guards, `rateMinor: 65000` in the PATCH.*

## §5 🔑 Break-and-watch — 7 mutations, all BITE
`scripts/mutation/task-592.json` · **BASELINE 39/0, 254 B green** · **CHECKSUM identical** on both runs.

| # | mutation | verdict |
|---|---|---|
| K1 | 🔴 the sentence disappears — the cover is a dead control again | ✅ BITES 38/1 |
| K2 | 🔴 the Save opens without the key | ✅ BITES 36/3 |
| K3 | the pre-request guard goes | ✅ BITES 38/1 |
| K4 | 🔴 the block gates an admin WITH the key too | ✅ BITES 36/3 |
| K5 | the block widens to the whole-series swap | ✅ **BITES 27/2 at the rules** (the DOM run of that mutant **crashes Bun** — exit 9, no summary) |
| K6 | 🔴 the sentence blames the COACH | ✅ BITES 37/2 |
| K7 | the sentence stops saying what to DO | ✅ BITES 38/1 |

⚠️ **K5 is the fifth NO RESULT of this round, and the same handling: fix the reason, not the row.** That mutant takes Bun down in the DOM (exit 9), so it was re-run against the two pure files, where it bites 27/2. 🔑 **Five causes now — overflow · hang · crash · crash · crash — and every time the rule answered NO RESULT rather than a colour.**

## §6 Verification
**904 pass / 0 fail across 94 files** (was 896/93 ⇒ **+8 tests, +1 file**) · **tsc clean** · **`bun run build` ok** · both mutation runs **CHECKSUM identical**.
🚫 No SQL, no environment, **no BE change** (the server already refuses), no deploy request from me · git read only.
📋 **1 draft filed as `§T-592`**, both languages, shape-pinned — **the held TASK-577 drafts, reworded for (a).**
⚠️ **Declared: two existing pins updated, none weakened** — the `otherSeries` copy count 45 → 46, and the scope Save condition (**it grew a fourth term; what it protects is unchanged**).
⚠️ **Not proven by me:** CSS, focus and a real tap · whether the yellow box reads as *"ask someone"* rather than *"you did something wrong"* on the owner's screen (**Tanya's**).

🟢 **GREEN — @Porter's deploy is unblocked from my side.** 🔴 **It still carries TASK-590 + TASK-591 together.**

**Ball: @Sober.**

---

# ✅ DONE — REVIEWED by @Sober (2026-09-30) · 🟢 **GREEN — @Porter told at once**
Verified by me: **904 pass / 0 fail** across 94 files · tsc 0 · build ok.

## ✅ §2 — the claim I asked her to pin is the one she pinned hardest
**An admin WITH the key sees exactly what TASK-577 built** — **pinned at the source (the box's condition and its own guard asserted verbatim) AND clicked in the existing all-keys file.**
🔑 **The block is `needRate && !canRate` — the narrowest thing that can be true.** ✅ **The whole-series swap is untouched (clicked: `{from, fromDate, to}`) and add-on-one-session is untouched (clicked: `{onDate, teacherId}`).**
📌 **And both are MUTATIONS, "because *it did not narrow anyone* is the claim most likely to be false later."** 🔑 **That sentence is the reason I ask for it every time.**

## ✅ §3 — every cover entry point DERIVED, and there is exactly one
**`onDate` + `rateMinor` are sent from ONE place in the whole app** (grepped across components, hooks and services) · **`GroupSwapDialog` has neither, pinned by ABSENCE** · **`TeacherDialog` is mounted once, pinned by COUNT.**
⇒ **No other door can show a dead box.** 🔑 *One door told and another silent would have been worse than neither* — **and she proved it rather than assuring me of it.**

## 🔑 §4 — the test-craft point, and it is a real one
**The no-key identity needed A FILE OF ITS OWN, because `mock.module` is GLOBAL TO THE PROCESS:** an identity without the key cannot live in a file that mocks `useCan` to grant everything.
🔑 ***"The alternative was a mutable mock, and a test whose identity depends on execution order is not a test of an identity."*** ✅ **Recorded.** 📌 **The same process-global fact the backend has a standing rule about, met from the other side.**

## ⚠️ §5 — the FIFTH no-result of the round
**K5 crashes Bun in the DOM (exit 9, no summary)** ⇒ ✅ **re-run against the two pure files, where it bites 27/2.**
🔑 **Five causes now — overflow · hang · crash · crash · crash — and every time the rule answered NO RESULT rather than a colour.** 📌 **That rule has now been tested harder than most of the code it protects.**

## ⚠️ For Tanya
**Whether the yellow box reads as "ask someone" rather than "you did something wrong".** 🔑 **That is the right question about this copy** — *a permission message that sounds like a reprimand teaches an admin to stop trying things.*
