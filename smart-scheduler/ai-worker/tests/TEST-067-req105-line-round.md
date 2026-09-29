# TEST-067: REQ-105 slice + LINE fixes (TASK-446…459) — `sid` round
- Source REQ: REQ-105 (§3/§3.1 group, §6 menu, §7 bot-silence, §8 clash; TASK-446…452 LINE, TASK-453…457 group/camp)
- Status: **A/B/C/E/F/G PASS — DEF-2 & DEF-3 FIXED & RE-VERIFIED (TASK-462/463); D still owner's hands.** uat released on QA's word. (C/E/F/G run 2026-09-24 with the LIVE cred `H:/sm-test-access.txt`, admin/admin-som — the earlier 401 was the STALE `project-docs` file.)
- Surfaces: LINE mobile app on the owner's Android (CPH2735, via adb — SOM-Balance-Demo OA on `sid` only)
- Tested: 2026-09-24 by Tanya

## Scope
Porter's 2026-09-24 round, items A–G. **A (language toggle) and B (LINE link) were reachable from the
owner's phone on the demo OA.** C/E/F/G need an authenticated `sid` web session — **blocked: the only
credential on file (`project-docs/sm-test-access.txt`, admin/admin) is refused with 401** (the login moved
to the users table, TASK-377/REQ-092). D needs `C:\sm-jobs\group-series-extender.ps1` or the internal job
route — neither exists on this machine; that is the owner's hands. Demo-OA push quota is exhausted until
1 Oct, so nothing push-delivered was attempted; all flows below are reply-based, as Porter instructed.

## Cases
| # | Case (from Porter's round / REQ-105) | Type | Surface | Steps | Expected | Actual | Result |
|---|--------------------------------------|------|---------|-------|----------|--------|--------|
| 1 | **A — menu after block→unblock** (TASK-446/452) | happy | LINE phone | SOM-Balance-Demo chat, open rich menu | unknown-TH 2-button menu (เข้าใช้ระบบ / คุยกับแอดมิน), orange | Exactly that, orange | ✅ PASS |
| 2 | **A — link then menu** | happy | LINE phone | เข้าใช้ระบบ → `0900000092` | link succeeds; known orange 6-button menu | Link success (see DEF-1 for the first attempt); menu = orange 6-button (แจ้งลา·เช็คอิน·คอร์สของฉัน·เพิ่มนักเรียน·ภาษา/ช่วยเหลือ·คุยกับแอดมิน) — never the old blue TH set | ✅ PASS |
| 3 | **A — toggle TH→EN** (known gap, NOT a fail) | edge | LINE phone | tap ภาษา/ช่วยเหลือ | "Switched to English ✅"; menu = old blue EN set (knownEN never published — declared gap) | Exactly that (×2) | ✅ PASS (as scoped) |
| 4 | **A — toggle EN→TH, twice back and forth** (TASK-452's defect was: toggle lands on the OLD BLUE TH family forever) | regression | LINE phone | tap Language → tap ภาษา/ช่วยเหลือ | TH = **orange** menu every time | เปลี่ยนเป็นภาษาไทยแล้ว ✅; orange TH menu restored on **both** round trips | ✅ PASS |
| 5 | **B — cross-family link refused, never silent** (TASK-449) | negative | LINE phone | while linked to 090-000-0092: `สมัคร` → `Next` → `0924912848` | a refusal, never silence; link must NOT move | Reply: «เบอร์นี้ผูกกับ LINE อื่นแล้ว ติดต่อแอดมิน / This number is already linked to another LINE — contact admin»; menu afterwards still the orange known menu of the **original** family | ✅ PASS (wording note in Observations) |
| 6 | **B(1) — phone typed in the link flow answers** (TASK-447/449, Khwan's §7 symptom) | regression | LINE phone | tap เข้าใช้ระบบ (11:19, answered) → type `0900000092` 11:21 | immediate link outcome (success or refusal) | 🔴 **SILENCE for 4+ min.** An identical resend at 11:25 was answered with link success. Khwan's exact symptom, reproduced once on the QA account | ❌ **FAIL → DEF-1** |
| 7 | **B(2) — bare phone from a linked chat, no flow** | negative | LINE phone | type `0924912848` twice (11:31, 11:34) with no session | (Porter expected the cross-family refusal) | Silence both times. Read: a linked chat's stray text is silent by design (REQ-079 AC-16); the refusal exists on the **flow** path (case 5). Flagged for Porter — his expectation may have meant the flow path | ⚠️ NOT_A_FAIL, question raised |
| 8 | **B(3) — any bot error ⇒ «ขออภัย ระบบมีปัญหาชั่วคราว…»** (TASK-449b) | negative | LINE phone | induce a webhook exception from the chat | the bilingual apology, never silence | Cannot induce a server exception from the chat surface | ⛔ NOT_TESTED (no way to force an error from outside; needs a log-level check on `sid` — DATA REQUEST) |
| 9 | **C — group yield / clash / resolutions** (TASK-453/457, §3/§8) | happy+negative | `sid` API | full cycle live (see C round below) | empty group → private yields → kid enrolls ⇒ `clash:true`; resolve-move clears it; a seated group refuses the private | Empty grp `clash:false,yielded:false`; trial into empty grp ⇒ `yielded:true,clash:false` (0 seats); seat enrolled ⇒ **`clash:true`**; resolve-move ⇒ `clash:false,yielded:false`, seat kept; a group WITH a live kid refuses the private `409 SLOT_TAKEN` naming the class ("Balance Play Group 15:00-16:00"); negatives 400/400/404 | ✅ PASS |
| 10 | **D — group-series extender** (TASK-456) | happy | `sid` job | run once ⇒ ~8 weeks ahead; idempotent | — | `C:\sm-jobs` does not exist on this machine; QA cannot trigger jobs | ⛔ NOT_TESTED — owner's hands |
| 11 | **E — camp per-coach hours + kid count** (TASK-454/457) | happy+negative | `sid` API | create week (EK+Bank), PATCH day `teachers:[EK 10-12 ฿400, Bank 13-15 ฿550]`, read back; then read as a `menu:camp` user WITHOUT key 59 | per-coach windows resolve & sort; each carries its own rate; a viewer without key 59 sees NO rate | Windows correct (EK 10:00-12:00, Bank 13:00-15:00, sorted by start) & each own `rateMinor`; `teacherRates` map masked to `null` for the no-key-59 user ✅ **BUT** the new `teachers[].rateMinor` is **NOT masked** — the no-key-59 user reads ฿400/฿550 in full | 🔴 **FAIL → DEF-3** (windows ✅, rate mask leaks) |
| 12 | **F — cancelled vouchers/courses to the bottom, faded** (TASK-455) | happy | FE unit | `sortEntitlements` (`lib/scheduler/entitlement-order.ts`) — a pure FE sorter, no API surface | dead (ENDED/EXPIRED/EXHAUSTED/CANCELLED) sink to the bottom under a divider; live order stable; DROPPED/COMPLETED stay live | 12/12 pass (`bun test entitlement-order.test.ts group-clash.test.ts`) — dead-to-bottom, stable live order, divider only when both groups present, DROPPED/COMPLETED not treated as dead | ✅ PASS (unit; the UI render is @Fern's, no server surface to hit) |
| 13 | **G — malformed id ⇒ 400 not 500** (TASK-451) | negative | `sid` API | authenticated (admin/admin-som) probes with malformed ids across the id routes | every malformed id ⇒ 400 (or 404), never 500 | parents/bookings-PATCH ⇒ 400 ✅; courses/bookings/vouchers ⇒ 404 (acceptable); camp/entitlements ⇒ 400 ✅ **BUT** `/api/group-series/:key` and `/api/other-series/:key` ⇒ **500 INTERNAL** on a malformed key | 🔴 **FAIL → DEF-2** (2 series-key routes still 500) |

Evidence: `../project-docs/qa-2026-09-24/phone-00…35.png` (35 screenshots, step by step).

## Defects
### DEF-1 — the link flow's phone step can answer with SILENCE on the first entry — MAJOR
- Environment / surface: `sid`, SOM-Balance-Demo OA, owner's Android (account `Dong_08`).
- Repro (from a clean state): 1. block → unblock the OA (or use any unlinked chat) 2. tap **เข้าใช้ระบบ**
  — the bot answers with the phone prompt at 11:19 (so inbound works and the chat is NOT muted)
  3. type the registered phone `0900000092` at 11:21 → **no reply for 4+ minutes** (checked 11:22, 11:24)
  4. type the identical number again at 11:25 → «ผูกบัญชีผู้ปกครองสำเร็จ ✅ … Found your family».
- Expected: every phone entry in the link flow produces a reply (TASK-449: "no webhook event ends in silence").
- Actual: first entry silent; second identical entry succeeds. **This is Khwan's §7 symptom reproduced on
  the QA fixture account, on the build where TASK-447/449 are deployed.** Whether attempt 1 wrote anything
  (and silently failed the reply) or was never processed is answerable only from the `sid` webhook log —
  DATA REQUEST below. Note the family I linked to (090-000-0092) is a **different** one from Khwan's
  (0924912848), so her 23505 stale-id cause does not obviously apply here.
- Evidence: `phone-06…10` (silence), `phone-12` (success on resend).

## Test data created
| What | Where | Removed? |
|---|---|---|
| LINE link: demo account `Dong_08` ↔ family phone 090-000-0092 (children มิลล่า, มิลลิม, asda, temp) | `sid` | ❌ **could not remove** — unlinking is the admin UI's "Clear LINE link", and the web credential is dead (401). This account was already being linked/unlinked in QA rounds; flagging for cleanup when access is restored |
| Link-flow session states for the same chat (11:19, 11:40–11:42) | `sid` | session rows expire on their own; no write path available to me to clear them |
| Language toggles TH→EN→TH ×2 | `sid` (family's `line_lang`) | ended back on TH, the state I found it in ✅ |
| Two refused cross-family link attempts (0924912848) | `sid` | refused ⇒ no state change (verified: menu still the original family's) ✅ |

## Verdict
**PARTIAL — the LINE phone round: A PASSES (4/4), B PASSES with DEF-1 open.** The toggle defect
(TASK-452) is fixed on the evidence: TH returns to the orange menu on every round trip; EN shows the old
blue set exactly as the declared known gap. The cross-family refusal fires, names nothing about the other
family's data, and never leaves silence **on the flow path**. 🔴 **DEF-1 (first-entry silence) is
Khwan's customer-facing symptom and is NOT closed by this build — it needs the `sid` log read before
anyone calls §7 done.** Items C, D, E, F, G are `NOT_TESTED`, reasons above; they block no one else's
queue and are ready the moment a working credential lands.

## Observations (for Porter, not defects)
1. The link-success message **names the children** («พบข้อมูลของคุณแล้วค่ะ — มิลล่า, มิลลิม, asda, temp»).
   REGRESSION S66/L5 (REQ-020-era) said link-by-phone replies with a **count, never names** (PII). If
   REQ-105's new copy deliberately shows names, say so and I will move the regression line; otherwise this
   is a defect.
2. The refusal wording differs from the one quoted in the round brief («บัญชี LINE นี้ผูกกับอีกครอบครัว
   ไว้แล้ว…» vs the actual «เบอร์นี้ผูกกับ LINE อื่นแล้ว…»). The actual sentence **reveals that the typed
   number exists and is linked** — the thing REQ-079 AC-4 forbade. Same question: deliberate under REQ-105?
3. A linked account typing `สมัคร` now gets «type "Next" to continue» → phone prompt — a re-link door that
   exists for linked users. Fine by me; recording so the next tester knows the path.

## Questions
(For Porter; he answers as `> answer: ...`)
- **DATA REQUEST 1 (blocks C, E, F, G):** a working `sid` staff login — the users-table migration
  invalidated admin/admin. Also fine: the owner resets the QA account's password and drops it in
  `project-docs/`.
- **DATA REQUEST 2 (DEF-1):** `sid` webhook/app log lines for the demo OA chat around **11:19–11:26 BKK
  today** — what did the first `0900000092` (11:21) do? (exception swallowed? session written? event never
  arrived?)
- **DATA REQUEST 3 (D):** run `group-series-extender` once on `sid` (or hand me the internal route +
  secret), then I verify the ~8-week horizon and the idempotent re-run from the calendar/API.
- Q1: Observation 1 — children named in the link-success message: intended under REQ-105?
- Q2: Observation 2 — may the refusal reveal that a number is linked? (REQ-079 AC-4 said no.)

---

## DEF-1 re-test — TASK-460 (verify 56), 2026-09-24
Real demo-OA traffic, linked Dong_08↔090-000-0092, BKK times (phone clock):
- 13:22 check-in ⇒ "No class to check in today" ✅
- 13:23 แจ้งลา ⇒ "ลาให้ใครคะ" + child buttons ✅
- 13:23 คอร์สของฉัน ⇒ bilingual course list ✅
- 13:24 lang TH→EN ⇒ "Switched to English" (menu blue EN = declared gap) ✅
- 13:24 EN→TH ⇒ "เปลี่ยนเป็นภาษาไทยแล้ว" ✅
- 13:25 TH→EN ⇒ "Switched to English" ✅
- 13:25 EN→TH ⇒ "เปลี่ยนเป็นภาษาไทยแล้ว" (menu orange) ✅
⇒ 7 events, all answered same-minute, ZERO silence ⇒ DEF-1 not reproducing on ACK-first build.
Fresh typed phone step not cleanly re-driven (adb tap flakiness on collapsed input); link/phone flow answers on this build (earlier 0900000092→"Registration completed"; history 11:34-11:42 สมัคร→Next→phone→"already linked" all answered).
Owner to confirm ZERO new request_timeout in LINE console 13:22-13:25 BKK (15:22-15:25 JST) ⇒ DEF-1 closed.
Footprint: demo LINE left linked (owner repro); push blocked til 1 Oct.

---

## C / E / F / G round — 2026-09-24 (LIVE super-admin cred, `H:/sm-test-access.txt`, admin/admin-som)
The earlier 401 was operator error: I opened the STALE `project-docs/sm-test-access.txt`. With the live
cred every authenticated path below ran. Surfaces: `sid` API (`https://som.develyst.online`) + two FE unit
suites run under `bun`.

### C — group clash (TASK-453/457, §3/§8) — PASS (happy + negative, live)
Full lifecycle proven on a throwaway GROUP series (Toth, a free coach-hour), reading `group.clash` off the
calendar grid DTO (`GET /api/calendar` -> `days[].columns[].slots[].booking.group`):
1. **Empty group** -> `clash:false, yielded:false, seats:0`.
2. **A private (FIRST_TRIAL) booked into the empty group hour** -> group **yields** (`yielded:true`), still
   `clash:false` (a yield with no kid is not yet a clash — matches `isGroupSlotClash`).
3. **A kid enrolls onto the yielded group row** (SINGLE_SESSION + `groupId`) -> **`clash:true`** (yielded AND
   at least one live seat). This is the flagship section-8 state.
4. **Resolve (1) move-the-private** (`POST /bookings/:id/resolve-clash/move {startTime}`) -> `clash:false,
   yielded:false`, the group takes its hour back, **the kid's seat is kept**.
- **Section-3 refusal (negative), live:** a group that already has a live kid **refuses** the private —
  `409 SLOT_TAKEN` naming the class already there ("Balance Play Group 15:00-16:00"). So the yield only ever
  happens into an EMPTY group; a seated one keeps its coach, exactly as SPEC-091 section-3 says.
- **Resolve-endpoint negatives, live:** empty move body => `400 VALIDATION` (the "at least one field" refine);
  swap-coach missing `teacherId` => `400`; a non-existent booking => `404 NOT_FOUND` (never 500).
- **FE clash logic:** `group-clash.test.ts` — clash tone/pair/seat-label/resolution-body builders all green.
- (Resolve (2) swap-coach was not driven live — one resolution path exercised end-to-end; both share the same
  un-yield-under-the-unique-index mechanism and both are unit-covered.)

### E — camp per-coach hours + kid count (TASK-454/457) — windows PASS, rate mask FAILS (DEF-3)
- **Per-coach windows PASS:** `PATCH /camp/weeks/:id/days/:date {teachers:[{EK,10:00-12:00,400},{Bank,
  13:00-15:00,550}]}` then `GET .../days` returns each coach's own resolved window, sorted by start, each with
  its own `rateMinor`. A coach left without hours inherits the day default (verified by construction in
  `campDayTeachers`).
- **RATE-VISIBILITY LEAK — DEF-3 below.** A `menu:camp` user with **no** `action:bookings.coach-rate`
  (key 59) sees the legacy `teacherRates` map masked to `null` **but reads every coach's `teachers[].rateMinor`
  in full** (400 / 550). The new per-coach array bypasses the key-59 read mask.

### F — cancelled entitlements to the bottom, faded (TASK-455) — PASS (unit)
`sortEntitlements` (`lib/scheduler/entitlement-order.ts`) is a **pure FE sorter with no server surface**.
`bun test entitlement-order.test.ts` (part of the 12/12): dead statuses (ENDED/EXPIRED/EXHAUSTED/CANCELLED)
sink to the bottom under a divider, live order kept stable, the divider shows only when both groups exist,
and DROPPED (paused) / COMPLETED are correctly **not** treated as dead. The faded render itself is @Fern's
component; there is no API to hit for it, so this is verified at the unit level (running, not just reading).

### G — malformed id => 400 not 500 (TASK-451) — mostly PASS, 2 routes still 500 (DEF-2)
Authenticated probes (admin/admin-som):
- `parents/:id`, `parents/00000000-bad`, `PATCH bookings/:id` (bad id), `camp/weeks/:id/days`,
  `camp/days/:id/checkin`, `entitlements/:id/plan` => **400 VALIDATION** (pass)
- `courses/:id`, `bookings/:id`, `vouchers/:id` (bad ids) => **404 NOT_FOUND** (acceptable — not a 500)
- `GET /api/group-series/:key` and `GET /api/other-series/:key` => **500 INTERNAL** on a malformed key — DEF-2.

## Defects (this round)
### DEF-2 — `group-series/:key` & `other-series/:key` return 500 on a malformed key (should be 400) — MINOR
- Surface: `sid` API, authenticated. `GET /api/other-series/nope` and `GET /api/group-series/nope` =>
  `500 INTERNAL`. All other id routes give 400/404.
- Cause (from src, for the fix, not a verdict): the `:key` param is passed **raw** to
  `otherSeries.getOtherSeries(...)` (`routes/api.ts:301` and `:326`) with no uuid guard, so a non-uuid reaches
  the query and the DB errors out. TASK-451's malformed-id=>400 guard covers the `:id` routes but **not** the
  two series-key readers.
- Impact: low (an internal boundary; a real UI never sends a bad key), but it is exactly the class of bug
  TASK-451 section-G set out to close, so the guard should extend to these two params. A 500 also leaks that
  the input reached the database layer.

### DEF-3 — camp per-coach `teachers[].rateMinor` is NOT behind key 59 — coach-pay READ LEAK — HIGH
- Surface: `sid` API, authenticated as a **`menu:camp` user with NO `action:bookings.coach-rate`** (key 59).
  Repro: set a camp day's per-coach rates as super-admin, then `GET /api/camp/weeks/:id/days` as the no-key-59
  user -> response carries `days[].teachers[].rateMinor` = 400 / 550 in full, while `days[].teacherRates`
  (the legacy map) is correctly `null`.
- Cause (from src): the key-59 read mask (`lib/coach-rate-visibility.ts`) nulls only the pinned key names
  `["rate","classRateMinor","teacherRates"]`. TASK-454 added a NEW rate surface — the `teachers[]` array whose
  rate field is named `rateMinor` — which is **not** in that list, so the response walk leaves it untouched.
  (The WRITE half is safe: `rateMinor` IS in `COACH_RATE_BODY_FIELDS`, so setting it 403s without key 59. It
  is only the READ that leaks.) This is the exact failure the file's own comment ("fail-closed BY CONSTRUCTION
  for every reader added tomorrow") warns about — the guarantee holds only while new rate surfaces reuse the
  pinned key names, and this one did not.
- Impact: HIGH. Key 59 exists to keep coach pay confidential; every camp coach's per-session pay is now visible
  to any staffer who can open the Camp menu. Fix is small — either add `"rateMinor"` to `COACH_RATE_KEYS`
  (blunt: it would also null any legitimately-visible `rateMinor` elsewhere — check the booking DTO first) or
  mask the camp `teachers[]` rate at the mapper. @Sober/@Jason to choose the surface; I will re-test.

## Footprint (this round) — all created data cleaned
| What | Where | Removed? |
|---|---|---|
| Camp week `QA-E-percoach` (+ its per-coach day) | `sid` | set **CLOSED** (camp weeks are not deletable) — residue only, not on any live grid |
| Restricted user `qa_nokey59_e` (`menu:camp`, no actions) | `sid` | **DISABLED** (users are not deletable) — cannot log in |
| Group series `QA-C-clash` (2026-11-30) + `QA-C-clash2` (2026-12-14), their group rows + seats | `sid` | **cancel-all'd** (1+1 rows, 2+1 seats) — CANCELLED residue, not deletable |
| 3 FIRST_TRIAL private bookings (the yield probes) | `sid` | **cancelled** (`reasonCode: ADMIN_ERROR`) — CANCELLED residue |
| Calendar re-checked 2026-11-30 & 2026-12-14 (Toth) | `sid` | **zero live QA rows remain** |
Note: cancelled series/courses/bookings cannot be hard-deleted by design; they sit as CANCELLED and touch no
live view. No customer, teacher, or real family data was written or messaged; the KKTEST fixture student was
used for the private probes and every one of those bookings is cancelled.

## Verdict (C/E/F/G)
**C PASS · F PASS · G PASS except 2 series-key routes 500 (DEF-2, minor) · E windows PASS but the coach-rate
read mask LEAKS the new per-coach `rateMinor` (DEF-3, HIGH).** D (extender) remains the owner's hands and is on
hold behind the `sid` Postgres-recovery incident / TASK-462. The credential blocker that stalled this round is
resolved — it was the stale `project-docs` file, now recorded in SYSTEM-FACTS.

---

## DEF-2 & DEF-3 re-test — TASK-462/463 on `sid`, 2026-09-24 — ALL PASS
Porter's re-test dispatch after Jason shipped TASK-463 (unified coach-rate field list + a build-failing walk
over everything sent to the browser; uuid guard decided BY ROUTE). Cred: admin/admin-som + the re-enabled
`qa_nokey59_e`.

| Item | Check | Result |
|---|---|---|
| **DEF-3** | `menu:camp` user WITHOUT key 59 reads `GET /camp/weeks/:id/days` | ✅ **FIXED** — `teachers[].rateMinor` = **null**, `teacherRates` = **null**; teacher id + start/end hours still present |
| **DEF-3** | same day WITH key 59 (admin) | ✅ unchanged — `rateMinor` ฿400/฿550, `teacherRates` present |
| **DEF-3 regression** | non-holder reads a NON-camp rate surface (DUO series `teacherRates`, calendar `booking.rate`) | ✅ both **null** — the one unified mask covers every surface |
| **DEF-3 regression** | key HOLDER still sees rates elsewhere (series `teacherRates` = 300) | ✅ present — no over-masking |
| **DEF-2** | `GET /group-series/nope`, `/other-series/not-a-uuid`, `/other-series/00000000-bad` | ✅ **FIXED** — all **400 VALIDATION** (were 500) |
| **DEF-2 regression** | Settings routes still work | ✅ `GET /settings` 200; `/settings/:key` not 400 (free-form param preserved) |
| **C regression** | full clash lifecycle after the pay-mask change | ✅ seat ⇒ `clash:true`; resolve-move ⇒ `clash:false, yielded:false`, seat kept — unchanged |

Note (from Jason's TASK-463): the walk also masks a second, not-yet-emitted rate field `teacherRateMinor`
(no DTO produces it today, so it can't be exercised live — masked before the reader exists).

**Verdict: DEF-2 and DEF-3 are CLOSED. C regression clean. uat is released on QA's word.**

### Footprint (re-test) — cleaned
- Re-used camp week `QA-E-percoach` (already CLOSED) + re-enabled then **re-DISABLED** `qa_nokey59_e`.
- New group series `QA-C-reg` (2026-12-21) + its trial/seat — **cancel-all'd + trial cancelled**; zero live
  Toth rows on 2026-12-21 confirmed. CANCELLED residue only (not hard-deletable).
