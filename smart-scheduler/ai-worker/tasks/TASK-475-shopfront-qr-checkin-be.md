# TASK-475 — `REQ-108`: the shop-front QR self check-in — phone → the children with a check-in-able session RIGHT NOW → the class → checked in — BE, M, **CONTRACT FIRST**

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-25) · **Size M.** No migration expected (see §3). After TASK-474 (it uses K5's window). Ships in the **same `uat` release as REQ-107**.

## §0 The owner's ruling on the credential, and WHY — record it, because the reason matters more than the choice
**The owner rejected identifying the parent through LINE — which was my recommendation — and he is right for a reason I had not considered: the person at the counter is often a NANNY or a DRIVER**, who has no access to the parent's LINE. Identity-by-LINE would have locked out exactly the people who most often do the drop-off, and a code pushed to the parent's phone fails for the same reason. **The flow is phone-based, as Khwan drew it.** My analysis was wrong on its premise — it assumed the parent is the one scanning — and it should be read that way in SPEC-093 from now on.
**The four approved guards, all of which are the build:**
1. **Today's sessions only, inside the check-in window** — K5's late minutes included, and the day-end settle rule from TASK-474 (a settled session is never re-opened).
2. 🔴 **After the phone is entered, list ONLY children with a check-in-able session right now — never the whole family.** If there is none: a neutral *"no class to check in right now"* and **no names at all**. This is the guard that keeps a wrong number from becoming a list of somebody's children.
3. **The parent's LINE notice fires at once** — the same act as every other path, so misuse is visible within seconds.
4. **Rate-limit phone lookups per device/IP.**

## §1 My two answers to Porter's questions
**(a) How an admin reverses a check-in — it already exists and needs no new door:** cancelling a DELIVERED session (attended or no-show) is allowed precisely to undo a mis-marked attendance, and it **requires a non-empty reason which is audited into the note** (`scheduler.service.ts:3569`, SPEC-028 §11.2 / TASK-105). So the answer to guard 3 is: the parent's notice arrives, the admin cancels with a reason, and the reason is on the record. **Confirm that path also returns the consumed credit** — say what you find; if it does not, that is worth its own line to Porter rather than a surprise later.
**(b) A family with NO linked LINE — I agree with Porter's proposal, with one addition that I think is the point.** The check-in works and there is simply no notice. **But note what that means: guard 3 — the one that makes misuse visible — does not exist for an unlinked family.** So for exactly those families, phone-only has no safety net at all.
⇒ 🔑 **Record WHERE each check-in came from.** A check-in already carries an actor; make the shop-front path record itself distinctly (`shopfront-qr` alongside today's `checkin-qr` / the admin's id), so that when a parent says *"we were not there"*, an admin can see in one glance that it came from the wall QR rather than from staff — **notice or no notice**. That is cheap, it is the only evidence an unlinked family will ever have, and it costs one string.

## §2 Build
- **One public page's worth of endpoints**, rate-limited: `POST` phone ⇒ the **check-in-able sessions right now**, grouped by child (guard 2 — nothing when there are none, and no names); `POST` the chosen session ⇒ the check-in.
- 🔑 **The check-in itself must be the SAME ACT as every other path** — the existing attend path, its credit consumption, its parent notice, its camp equivalent for a camp day. **A second implementation of "attend" is the one thing I will refuse.** Pin by source that this path calls the same function the LINE check-in does.
- **Camp days included**, under camp's own rules (REQ-104): a camp day appears in the list like a class and consumes camp credit, not a session.
- **The window is `isWithinCheckinWindow` with the live settings** (early + K5's late) — not a second copy of the rule.
- **The rate limit:** per device/IP, on the phone lookup. Say what you chose and why; it must not be defeated by a page refresh, and it must not lock out a genuine front desk with several families arriving at once. ⚠️ A limit that punishes the busy five minutes before class is a limit that gets turned off.
- **No PII before a match:** a phone with no session now, or no family at all, must be **indistinguishable** — same words, same timing as far as is reasonable. A different answer for "unknown number" tells a stranger which numbers are customers.

## §3 ❓ for you, before code
1. The rate-limit's shape and store (in-memory is honest for one PM2 process — say it, and say what happens if that changes).
2. Whether the provenance string (§1b) fits today's actor field or wants a column (I expect the former — no migration).
3. Anything in the existing attend path that assumes an authenticated admin or a LINE user, which a public caller would break.

## Definition of Done
- [ ] Contract confirmed BEFORE code · the four guards by value (window incl. late + settled · only check-in-able children, none ⇒ neutral, no names · notice fires · rate limit) · **the same attend act, pinned by source** · camp by value · the unknown-number answer indistinguishable · the provenance recorded · the reversal path confirmed (and whether it returns the credit) · suite **count** · tsc 0 · 56 = 56 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM · contract lines for @Fern · report here + `inbox/SA.md` + log.

---

# 📐 CONTRACT — @Jason → @Sober (2026-09-25) — read from the code; NO code written. Four findings change your picture; four ❓ for you (and the owner through Porter)

## §A What I found (facts, each read in the code)
1. **The SAME act exists, and it's two calls.** Today's LINE check-in is `getCheckinQr(bookingId)` → `checkinByToken(token)` (`line-webhook.service.ts`, `doCheckinBooking`). `checkinByToken` is already the public `POST /checkin`, with no JWT.
   - It runs the window with the live early + late settings (TASK-474) and the settled rule (NO_SHOW ⇒ "too late", ATTENDED ⇒ "already").
   - It calls `updateBookingStatus(id, "attend")`, which consumes the course session or voucher hour and enqueues the parent notice in the same transaction. It also awards the CRM on-time points.
   - ⇒ **The shop-front path calls exactly those two functions for a session.** For a camp day it calls `getDayCheckinQr(dayId)` → `checkinCampByToken(token)` (→ `markDay`, camp credit). No second "attend" anywhere, pinned by source.
2. 🔴 **Guard 3 has holes. The "notice within seconds" is only true for SOME sessions.**
   - The only message an attend sends is the **COURSE DEDUCTION** notice, and `updateBookingStatus` fires it **only when the booking has a course or a voucher**. A **trial / single / OTHER session with neither sends NO notice at all**, LINE-linked or not.
   - **Camp:** the `camp_deduction` notice goes out **at DAY-END only** (the owner's ruling, TASK-443), so misuse on a camp day is visible hours later, not seconds.
   - ⇒ Guard 3 as the owner approved it holds for **course/voucher sessions of a LINE-linked family**, and for no one else.
3. 🔴 **Provenance: a session has NO actor field, and there is no audit table.** Your premise ("a check-in already carries an actor") is true **only for camp** (`camp_days.marked_by`, which the QR scan writes as `checkin-qr`). `bookings` has no who/where-from column, and `updateBookingStatus` records nothing about the caller.
4. **The reversal (your §1a) — it DOES return the credit, with two side effects nobody has named.**
   - Cancelling an ATTENDED session with a reason returns the unit (`returnsConsumedUnit` = `status === "ATTENDED"` ⇒ `usedSessions` / `usedHours` − 1, floor 0), and the reason is written to `note`. ✅
   - ⚠️ But it (a) leaves the row **CANCELLED**, not CONFIRMED, and (b) **sends the "class cancelled" message to the teacher AND the families** (`sendClassCancelledToTeacher` / `…ToFamilies`). Undoing a false check-in therefore tells the coach and the parent that the class was cancelled, which is not what happened.
   - The other existing door is **sick-leave on an ATTENDED row**: it also returns the unit, the row becomes SICK_LEAVE, and it sends no cancellation message. It is a different meaning, so that is the owner's pick, via Porter.
   - Camp has its own audited undo (`undoReason`).
   - 📌 Worth its own line to Porter, as you said.
5. **A public caller breaks nothing in the attend path:** `checkinByToken` is public already. ⚠️ **But the public token page does NOT refuse a SUSPENDED household** (the LINE path does, `isSuspendedLineParent`), so the shop-front would inherit that gap. My proposal is in ❓4.
6. Phone match is exact on digits (`findParentByPhone`, `normalizePhone`): `+66 92…` does not find `092…`. That is the same as the LINE door today. I'm flagging it, not changing it.

## §B Your three ❓, answered
1. **Rate limit.** Nothing exists in the repo. Proposal:
   - **In-memory, per client IP** (the first `X-Forwarded-For` hop, the way `routes/webhooks.ts` reads it).
   - 🔑 **Count MISSES, not lookups:** 5 lookups that match no check-in-able session, per IP per 10 minutes ⇒ 429 for the rest of that window, with a neutral "please try again shortly / ask the front desk".
   - Plus a hard ceiling of 60 lookups per IP per 10 minutes, whatever they return.
   - **Why misses:** a busy front desk is real families whose phones MATCH, so they cost nothing. A guesser generates misses. Shop Wi-Fi (every family behind one IP) is therefore safe except for repeated typos.
   - **Refresh-proof:** it is kept on the server, by IP, not in the page or a cookie.
   - **Honest limits:** it lives in one process's memory, so a restart or deploy resets it (acceptable for this purpose). If PM2 ever runs this app in **cluster mode with N processes, every limit silently becomes N×**, and the store must move to a table. And the IP is only trustworthy if **nginx is the only way in**: if the app port is reachable directly, `X-Forwarded-For` is the caller's to write.
2. **Provenance does NOT fit an existing field, so it needs a column** (my recommendation):
   - `bookings.checkin_source text NULL`, **migration 0056 (56 → 57)**, written only on the attend transition.
   - Values: `shopfront-qr` · `checkin-qr` (the token link and the LINE button both run `checkinByToken`; I propose passing `line` from the bot so the three are told apart) · the staff actor on the admin route · `end-of-day` from the day-end's own write.
   - It is **kept** on a later cancel: it is the evidence the reversal refers to.
   - **Rejected:**
     - `note`: it is the status-reason field, and the admin's cancel reason **overwrites it**, erasing the provenance at exactly the moment it is needed.
     - The notice's outbox payload: there is no notice row at all for trial/single sessions (§A2).
   - **Camp needs no migration:** `markDay(…, "shopfront-qr")` → `camp_days.marked_by`, by parameterising the string `checkinCampByToken` passes today.
3. **What a public caller would break:** nothing structural (§A5). What it INHERITS, and that you should rule on: CRM on-time points are awarded (it is the same act); a check-in on an **ended course** is refused by `assertCourseWritable` with its own message; and **suspension is not checked** (❓4).

## §C The contract — for @Fern (proposed; nothing built)
Both routes sit on the same public router as `POST /checkin`, with no JWT, rate-limited per §B1.
- **`POST /checkin/shopfront/lookup`** `{ phone: string }`
  - → `200 { children: Array<{ name: string, items: Item[] }> }`, where `name` follows the ONE name rule (nickname-first; a DUO row reads `Feen & Pun` and appears once).
  - `Item` is one of:
    - `{ kind: "session", bookingId, date, startTime: "HH:MM", endTime: "HH:MM", program, teacher: "Teacher <name>" }`
    - `{ kind: "camp", campDayId, date, half }`
  - Only items check-in-able **right now**: sessions inside `isWithinCheckinWindow` with the live early + late settings and status CONFIRMED; camp days dated today and PLANNED (❓3).
  - 🔴 **Unknown phone · archived holder · suspended (❓4) · a family with nothing now ⇒ the SAME `200 { children: [] }`**, the same body, and the same queries run (the session read runs even with no family). The page shows one neutral sentence and **no names**.
  - `400` only for a body that is not phone-shaped (`isPhoneShaped`). That reveals nothing about customers.
  - `429 { code: "RATE_LIMITED" }`.
- **`POST /checkin/shopfront`** `{ phone, bookingId } | { phone, campDayId }`
  - The server **re-runs the lookup** and requires the id to be in the phone's CURRENT list. A `bookingId` alone can never check anything in, and every guard is re-applied at the moment of the act.
  - → **the same response as today's `POST /checkin` / `POST /checkin/camp`** (`already` / `booking` / `remaining`, or camp's `day` / `credit`), because it IS that act.
  - An id that is not in the list ⇒ `409 { code: "NOT_CHECKINABLE" }` with the neutral sentence (no names).
  - Counts as a miss for the rate limit.
- **The QR** is a fixed front URL (`/checkin/shop`) with no token. It is the page's, not mine.

## §D ❓ before code — for you (the last two need the owner via Porter)
1. **The column** `bookings.checkin_source` (migration 56 → 57), with the values in §B2. Yes / no?
2. **Guard 3's holes (§A2):** accept them (provenance is then the only evidence for trial/single sessions and until day-end for camp), or add a **check-in notice** on the shop-front path for bookings that send none? That is a NEW message, so the owner's copy would be needed. My recommendation: accept for this release, with provenance recorded.
3. **Camp items: PLANNED only, or also ABSENT?** Camp's own scan turns ABSENT → ATTENDED ("the child turned up"). From an unauthenticated wall QR I would list **PLANNED only**, so a staff-marked absence is never overturned by a phone number.
4. **Suspended household:** the lookup answers it with the neutral empty list (as the LINE path refuses it)? I recommend yes. 📌 Separately, the token page's gap (§A5) is a pre-existing hole; that's your call whether to cut it.
Plus a line for Porter, as you asked: the **reversal returns the credit, but announces a CANCELLATION** to the coach and the family (§A4).

⏸️ **Stopped here: contract first.** No code until you confirm §D.

---

# ✅ CONFIRMED — @Sober → @Jason (2026-09-25) — build §C; four answers, and two of your findings go to the owner because they change what he approved
**Your §A2 and §A4 are corrections to the ruling itself, not details. They are going to Porter in words today** — an owner who approved "the notice makes misuse visible within seconds" should not learn later that it covers course and voucher sessions only, nor that the remedy he was promised announces a cancellation. Thank you for reading the guard instead of implementing it.
1. **❓1 The column — YES.** `bookings.checkin_source`, migration **0056 ⇒ 57**, written on the attend transition, kept through a later cancel. **Your rejection of `note` is the decisive argument and I want it in the file:** the admin's cancel reason *overwrites* `note`, so the provenance would be erased at precisely the moment it is needed as evidence. Camp stays on `marked_by` with no migration. Usual migration rules — the witness is the column, said in the header, and `0056` must not be a number I have gone stale on: check it is free before you write it.
2. **❓2 Guard 3's holes — ACCEPT for this release, with provenance, as you recommend.** A new check-in message is the owner's copy and his decision, and inventing one to patch a guard he has not been told is leaky would be the wrong order. **But the leak is recorded in the task and reported to him now.**
3. **❓3 Camp: PLANNED only — agreed, and your reason is the ruling:** an unauthenticated wall QR must never overturn a staff-marked absence. A child marked absent by staff who then turns up is a human conversation at the desk, not a phone number's decision.
4. **❓4 Suspended household ⇒ the neutral empty list — yes.** And the pre-existing gap you found on the public token page (it does not refuse a suspended household, while the LINE path does) is **real, live today, and not yours to smuggle into a new feature**: I am cutting it as its own task so it is fixed visibly rather than folded in. 🚫 Do not touch it here.
5. **§B1 the rate limit — take it as proposed**, and the two honest limits go in the code's own words: it is one process's memory (a deploy resets it — acceptable), and **the IP is only trustworthy while nginx is the only way in**. If the app port is ever directly reachable, the header is the caller's to write and the limit is decorative. Counting **misses** rather than lookups is the right shape — it is the guesser who is rate-limited, not the busy front desk.
6. **§A6 the exact-digit phone match** (`+66 92…` ≠ `092…`) — **leave it**, same as the LINE door. It is one rule in one place and changing it belongs everywhere at once, not inside a new feature. Flagged for Tanya's round; if a parent trips on it we normalise once, globally.
Everything in §C as written — including that the act re-runs the lookup so a `bookingId` alone can never check anything in, and that an unknown phone, an archived holder, a suspended household and a family with nothing now are **indistinguishable**.

---

# ✅ CODE DONE — @Jason → @Sober (2026-09-25) — §C built as confirmed; migration 0056; 3079 pass / 0 fail; 12/12 mutations bite (one gap found by mutation J, pinned — and one FALSE bite of mine caught, §6)

**Numbers:** `bun test` **3079 pass / 0 fail** (+21; new `src/services/shopfront-checkin-req108.test.ts`) · `tsc` **0** · **migration `0056` ⇒ 57 = 57** (files and journal tags), 57 witnesses · 🚫 `/register`, the day-end's rules, the window rules and `note` untouched.

## §1 What was built
- **`drizzle/0056_booking_checkin_source.sql`**: `ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "checkin_source" text;`
  - Counted before writing: 56 files, newest `0055`. Catalog-only (nullable, no default).
  - The header says why it isn't `note`, in your words: *the admin's cancel reason OVERWRITES it*.
  - The journal entry is idx 56. The witness is the column, the file's only object.
- **Provenance, on every attend path:**
  - `updateBookingStatus` gets a 6th optional argument `checkinSource`, written **only** in the attend write (`set({ status: "ATTENDED", checkinSource })`) and not touched by cancel, so it survives the reversal.
  - `checkinByToken(token, source = "checkin-qr")`: the token page is unchanged, the LINE button passes `line`, the wall passes `shopfront-qr`.
  - The admin status route passes `actorOf(c)`, and the day-end writes `end-of-day`.
  - Camp: `checkinCampByToken(token, source = "checkin-qr")` → `markDay(…, source)` → `marked_by` (no migration).
- **`src/services/shopfront-checkin.service.ts`:**
  - `shopfrontLookup(phone)` returns `{ children: [{ name, items }] }`. Names go through the ONE rule, so a DUO row reads `Feen & Pun` and appears once.
  - Sessions: today, CONFIRMED, not a derived camp hour, the family's rows (`familyRowsWhere`), filtered by `isWithinCheckinWindow` with the **live early + late settings**.
  - Camp: today, **PLANNED only** (❓3).
  - `shopfrontCheckin({ phone, bookingId | campDayId })` **re-runs the lookup** and requires the id to be in that list, then calls `getCheckinQr` → `checkinByToken(…, "shopfront-qr")`, or `getDayCheckinQr` → `checkinCampByToken(…, "shopfront-qr")`. **No attend of its own** (pinned by source: no `updateBookingStatus`, `markDay` or write in the file).
- **`src/lib/shopfront-rate-limit.ts`** as proposed: per IP (first `X-Forwarded-For` hop, as `routes/webhooks.ts`), **5 misses** or **60 lookups** per 10 minutes ⇒ 429. It is bounded in memory, and the two honest limits are written in the file's header, in your words.
- **Routes** (public router, beside `POST /checkin`, so `/api/…`): `POST /checkin/shopfront/lookup` and `POST /checkin/shopfront`.
  - A body that is not phone-shaped is a 400.
  - An id not in the phone's list is `409 NOT_CHECKINABLE` with the neutral sentence, and counts as a miss.
  - The error envelope is the app's own `{ error: { code, message } }`.

## §2 The four guards, by value (through the ROOT app)
1. **Window:** a class that ended 10 minutes ago is not listed at late 0, and is listed at late 30. This goes through the **real `getSetting`**, with the DB fake answering only the key asked for. Only CONFIRMED is asked for, so an ATTENDED or NO_SHOW row is never offered.
2. **Only the check-in-able children:** Feen (in the window) is listed; Pun (this evening) is not, and **"Pun" appears nowhere in the response**.
   - 🔴 **Indistinguishable:** an unknown number, a family with nothing now, a **suspended** household and an **archived** holder all return **byte-identical `{"children":[]}`**, with **the same three reads in the same order** (students, bookings, campDays).
3. **Notice:** whatever the same act sends. It is not re-implemented; the gaps are §A2 of the contract, now with the owner.
4. **Rate limit:**
   - 5 misses from one IP ⇒ the 6th lookup is 429, while another IP is unaffected.
   - **12 matching lookups from one IP are all 200** (a busy desk on shop Wi-Fi).
   - The pure limiter is tested for the sliding window and the 60 ceiling.
   - The IP is the first hop.
- **The act:** a session in the list ⇒ exactly `[getCheckinQr(id), checkinByToken(tok, "shopfront-qr")]`, and its answer is returned unchanged. A camp day ⇒ camp's pair. **A bookingId NOT in the list ⇒ 409 and NO call at all.**
- **Provenance:** `checkinByToken(tok, "shopfront-qr")` hands the source to `updateBookingStatus` (arguments by value); by source, the four other writers.

## §3 Pins moved
- **Migration census 56 ⇒ 57** in 35 suites. Every changed line was printed and is a count of `drizzle/*.sql`, the journal's tags/entries or the witnesses; none is anything else.
- Three source pins on lines changed on purpose:
  - camp's scan now passes `source` to `markDay`, and the default is pinned;
  - the day-end's ATTENDED write carries `checkinSource: "end-of-day"`;
  - the router's `actorOf(c)` count is 19 → 20 (the status route).

## §4 For @Fern — the contract as BUILT
Public routes, no JWT:
- **`POST /api/checkin/shopfront/lookup`** `{ phone }`
  - → `200 { children: Array<{ name, items: Array<{ kind: "session", bookingId, date, startTime "HH:MM", endTime "HH:MM", program, teacher: "Teacher <name>" } | { kind: "camp", campDayId, date, half }> }> }`
  - `{ children: [] }` ⇒ show ONE neutral sentence and **no names**.
  - `400` = not phone-shaped.
  - `429` `{ error: { code: "RATE_LIMITED", message } }`.
- **`POST /api/checkin/shopfront`** `{ phone, bookingId } | { phone, campDayId }` (exactly one of the two ids)
  - → **the same body as `POST /api/checkin` / `POST /api/checkin/camp`**, and every error those return too (e.g. the window's "too late").
  - `409 { error: { code: "NOT_CHECKINABLE" } }` = not in this phone's list right now.
  - `429` as above.
- **Send the phone again on the check-in call**: the server keeps no state between the two calls.
- The page lives at a fixed URL (`/checkin/shop`) for the wall QR, with no token.

## §5 Break-and-watch: `mut475.mjs`, 12 mutations, **12 bite**
`finally` + sha-256 restore, byte-identical each time. **CHECKSUM over `git diff` + every untracked file** (the new files are untracked, so a diff alone would not see them), `14c89f7b…`, identical before and after. `BASELINE=72` read off the run on 4 suites.
- A 🔴 the act skips the phone's list
- B 🔴 a second attend
- C 🔴 a suspended household listed
- D 🔴 an unknown number answers fast (distinguishable)
- E 🔴 the whole family listed
- F late minutes ignored
- G 🔴 camp lists ABSENT
- H 🔴 provenance dropped
- I 🔴 the wall records itself as `checkin-qr`
- J 🔴 the limit counts every lookup (the busy desk refused)
- K the limit keyed on the last hop
- L 🔴 no limit at all

📌 **J PASSED on the first run:** nothing pinned, through the route, that a MATCHING lookup is not a miss. Pinned (12 matching lookups from one IP ⇒ all 200), and it bites.

## §6 📌 A FALSE bite of mine, caught before it was reported
When I re-ran J after "adding" that test, it said **BITES**. But my edit had been **refused** (the file had changed since I read it), so the test did not exist. The run had 71 tests against my `BASELINE=72`, and the lower count **manufactured** the bite. That is TASK-466's lesson exactly, repeated by me. I caught it because the same output showed `0 fail`. I added the test for real, read `BASELINE=72` off an actual run, and re-ran all twelve; J now bites with a real failing test.
- The rule I'm now following: **a bite with 0 fail is not a bite until the baseline is re-read.**

⛔ Only you mark this DONE. ▶️ TASK-476 (the token page's suspended gap) is next when you say.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-25)
Re-run by me, twice: **3087 pass / 0 fail** both times · tsc 0 · **57 = 57** (`0056`, 57 witnesses).
Built exactly to the contract, and three things are worth naming:
1. 🔑 **"The four kinds of nothing return byte-identical `{"children":[]}` with the same reads."** Not merely the same body — **the same queries run**, so an unknown number, an archived holder, a suspended household and a family with nothing on today cannot be told apart by what comes back *or by how long it takes*. That is the guard actually working, rather than four branches that happen to print the same sentence.
2. **The act re-validates against the phone's own list and then calls the existing pair** — a `bookingId` on its own can never check anything in, and there is no second "attend" anywhere, pinned by source. That was the one thing I said I would refuse to see forked, and it is not forked.
3. **`note`'s rejection is written into the migration header**, where the next person to think "we could just put it in the note" will meet it — the reason being that the admin's cancel reason overwrites exactly the evidence the cancel refers to.
📦 Fern's contract is in §4 of the file; the page is the next piece.
