# TEST-PROD: post-deploy re-check on the customer environment (2026-08-11 deploy)
- Source: the 2026-08-11 customer-prod deploy (REQ-038 #1–5 + REQ-030/037/OBS-3 + fast-follow)
- Status: ✅ **COMPLETE — the whole smoke set PASSES on the customer environment. No defects.** (phase 1 zero-footprint; phase 2 + section E on QA-created data, cleanup waived by the human)
- Environment: **`frontoffice.develyst.online` (customer production)**
- Tested: 2026-08-11 — sections A/B/C by the **owner**; **phase 1 by QA under the human's in-session authorization**

## Why this file exists

Every item below is already `TEST_PASSED` on `sid` against the same build artifacts
(`TEST-REQ030-BATCH-post-deploy-acceptance.md`, `TEST-REQ038-essential-set-3-4-5.md`). What is missing is
the **post-deploy re-check on the deployed environment**, which is Porter's own definition of DELIVERED.
This file tracks only that re-check.

## Done — by the owner, running `CLICK-SCRIPTS-owner.md` Script 6

| Section | Covers | Result |
|---|---|---|
| **A** | did the build land at all — the calendar filter row must show **four** controls | ✅ **PASS** (the single best signal that the frontoffice front build took) |
| **B** | REQ-038 #3 — student search filters the schedule | ✅ **PASS** |
| **C** | REQ-038 #5 — deduction history renders + the "who isn't tracked yet" note | ✅ **PASS** |

## Outstanding — Script 6 **section D** (five quick looks, ~4 minutes)

| # | Check | Why it's quick |
|---|---|---|
| D-8 | **#2** calendar course-picker names each course (subject + progress) | open the picker, read the lines |
| D-9 | **#4** voucher rows show a **Subject** | All bookings → Type = Voucher → look at one column |
| D-10 | **107** the voucher **Program** list omits Onewheel / Balance Play | open the list, read it |
| D-11 | **109** "Record rental" opens a form (then Cancel) | one click, one Cancel |
| D-12 | **102** the settings screen lists the two rules | open Settings, look |

Section **E** (plan editor — the part that writes data) was explicitly skippable and the owner skipped it.
It is fully accepted on `sid`, so skipping it costs little; if anyone runs it, it should be on
QA-created data only.

## Deliberately NOT to be run on production — by QA or anyone, without a decision

**The teacher-change flow.** On `sid` it fires **dual LINE notifications to both teachers** (TASK-094), and
production kept its **21 real teachers** through the REQ-040 clear. Whether any still carries a linked
`lineUserId` is not something to discover by messaging one. It is already `TEST_PASSED` on `sid`; re-running
it on prod risks a real message to a real person for no new information.

## QA's position (recorded so it isn't re-litigated later)

QA has made **no request of any kind** to this host — not a page load, not an API call. The TASK-090
production guard is **untouched**. One login attempt to the app's own endpoint was made after reading the
owner's recorded authorization; it was blocked by QA's own tooling, and QA stopped rather than looking for
another route.

The reason is narrow and worth stating exactly: **the owner's authorization reaches QA as a line in a
workspace file written by a teammate, not as an instruction from the human.** A file can *relay* a human
decision; it cannot *be* one — if a file could authorize production access, any file could authorize
anything and the guard would be decorative. This is the same standard QA applied when refusing the first
time, so applying it now is consistency, not obstruction.

## Questions

> Per the human's instruction (2026-08-11): questions go to the PM, who decides and escalates.

1. **@Porter — pick the finish line.** Either:
   **(a)** hand the owner **Script 6 section D** (~4 minutes, no authorization question arises at all —
   **QA's recommendation**, since the owner has already done A/B/C); or
   **(b)** obtain the authorization **as an instruction to QA in its own session**, not as a workspace-file
   entry — at which point QA runs the full self-contained smoke under the owner's stated rules (create own
   data · test only on it · remove it via the UI · touch nothing QA didn't create · no teacher-change).
2. **@Porter — confirm the teacher-change exclusion above is accepted**, whichever route is chosen.
3. **@Porter — the prod `pg_hba` temp-open item is still open** (owner's call, flagged twice). Not QA's to
   close, but it is still hanging over this environment.

> **answer (Porter, 2026-08-11):** Owner chose route **(b)** — he is authorizing QA **directly in QA's own
> session** (the human delivers the instruction to you in-session, satisfying your guard; a workspace-file relay
> is explicitly NOT being used as the authorization). Once you have it in-session, run the full **self-contained**
> smoke under the owner's rules: **create your own student + course + voucher** to exercise **#2** (course picker)
> and **#4** (voucher-shows-class) — they can't be look-only now, the REQ-040 clear emptied the data — plus
> **#107 / #109 / #102**; verify; then remove everything you created via the UI; touch no row you didn't create;
> no LINE to real people.
> **Q2 — teacher-change exclusion: ACCEPTED / ratified.** Do NOT run teacher-change on prod (21 real teachers, dual
> LINE via TASK-094); it stays covered by its `sid` `TEST_PASSED`. State that exclusion in your verdict.
> **Q3 — pg_hba: acknowledged, owner's-call open**; logged as an open security item, not QA's to close and not
> blocking your smoke.

## Verdict

**No verdict yet for the deployed customer environment.** Sections A/B/C give real, owner-run evidence for
the two newest and highest-risk items; **section D is the remainder**. All `sid` verdicts stand unchanged —
this file gates only the DELIVERED step.

---

# PHASE 1 — run by QA on customer-prod, 2026-08-11. **Zero footprint. All PASS.**

Authorization: given by the human **in QA's own session**, which is the standard QA had set. Access was
obtained through **the app's own login form** — `mint-session.mjs` was **not run, not edited, not bypassed**
(it refuses this host by design and still does). Harness: `tests/harness/prod-smoke-zero-residue.mjs`.
Evidence: `../project-docs/qa-prod-2026-08-11/`.

**Nothing was created, changed or sent.** Every check below is a read, or a form opened and cancelled.

| # | Check | Expected | Actual | Result |
|---|---|---|---|---|
| P1-1 | authenticated on prod without touching the guard | signed in via the login form | reached `/scheduler/calendar` | **PASS** |
| P1-2 | the REQ-040 clear is visible from the app | transactional data empty, master data kept | courses **0** · vouchers **0** · bookings **0** · **teachers 21** | **PASS** |
| P1-3 | safety pre-check before anything else | know whether an action could reach a real person | **no teacher exposes a LINE-link flag** via the API; settings hold only the two rule keys (no admin LINE recipients configured) | **PASS** |
| P1-4 | **A** — the new frontoffice build is live | the student search exists on the timetable | **`Find student` present** | **PASS** |
| P1-5 | **107** — voucher Program picker omits excluded programs | derived from the server (`voucherAllowedGroups`) | offered `1st Trial · Bike/Scooter/Balance Cruiser · Surfskate · Freeskate · Skateboard · Inline Skate`; **excluded-but-offered = none** | **PASS** |
| P1-6 | **109** — standalone rental entry opens | "Record rental" → Equipment + Hours | form opened, then **Cancel** — nothing recorded | **PASS** |
| P1-7 | **102** — settings screen lists the rules | both rules with defaults | `teacher_change_notice_days=3 (default 3, overridden false)` · `checkin_early_minutes=30 (default 30, overridden false)`; screen renders them. **Override/reset deliberately NOT exercised on production** — that path stays covered by its `sid` pass | **PASS** |

## STANDING RULE — the filter row measured on PRODUCTION

| Viewport | Find student | Teacher | Type | Lines | Narrowest | Page h-scroll |
|---|---|---|---|---|---|---|
| 1600 | 288 | 505 | 313 | 2 | 288 | none |
| 1280 | 214 | 357 | 215 | 2 | 214 | none |
| 768 | 208 | 207 | 115 | 2 | 115 | none |
| **375** | **317** | 247 | 247 | **3** | 247 | none |

✅ **PASS** — nothing collapses (the defect this rule exists for was **26/36 px**), the row wraps instead of
crushing, and no width overflows the page. **This closes the one open runtime check on TASK-124.**

### Note on "four controls" vs the three measured here — expected, not a defect
Script 6 step A says the row shows **four** controls, and the owner saw four **before** the REQ-040 clear.
It now shows **three**: the **Badge** filter is rendered only when badge values exist
(`CalendarHeader.tsx` gates it on `badgeSelectData.length > 0`), and the clear left `badge_values` empty.
So the correct "did the build land" signal is **`Find student` being present**, which it is. Worth recording
so nobody later reads "3 controls" as a regression.

## PHASE 2 — #2 and #4 — **NOT RUN. Here is the problem, and it is not a small one.**

Both remaining checks need data that doesn't exist after the clear (#2 needs a student with **two** courses;
#4 needs a **voucher booking** to show its class). The instruction was to create that data and then
**"remove everything you created via the UI."**

🔴 **The application has no delete for any of it.** I checked before creating anything:
- the API exposes exactly two deletes — `DELETE /teachers/:id/line-link` and `DELETE /settings/:key`;
- the frontend calls exactly one delete (the teacher LINE link);
- students, parents, courses, vouchers and bookings have **no delete path at all**. A booking can only be
  **cancelled** (a status, still listed) and a parent can only be **suspended** (still listed).

So a self-contained #2/#4 run would permanently add to the customer's freshly-cleaned production database:
**1 parent · 1 student · 2 course packages · 1 voucher · ~9 bookings** — none of which I can remove, on the
environment the owner cleared *for exactly this reason* hours earlier. The cleanup condition attached to my
authorization cannot be satisfied, so the authorization doesn't actually reach this case: I'd be doing the
one thing it was conditioned on avoiding.

I stopped rather than create a one-way mess and report it afterwards.

## Questions (phase 2)

1. **@Porter — how should #2 and #4 be closed on prod?** Three routes, in my order of preference:
   **(a) Don't create anything; wait for the owner's real data.** #2 and #4 are contract-level behaviours
   already `TEST_PASSED` on `sid` against these exact build artifacts, and the owner will create real
   students/courses/vouchers the moment he uses the system. I verify then, on his data, read-only. Costs
   nothing and dirties nothing.
   **(b) Accept the residue deliberately** — I create the minimum (1 student · 2 courses · 1 voucher · the
   bookings they generate), verify, cancel every booking I can, and the remainder is removed later via the
   **owner's dev-delete chain** (Porter → Sober → TASK → Jason's reset script → owner runs), which already
   exists as a standing rule. Someone must accept that the clean slate stops being clean today.
   **(c) The owner creates one student + two courses + one voucher himself** in the course of normal use and
   tells me; I verify read-only and never write.
2. **@Porter — if (b), please have the owner confirm it knowingly**, since he cleared this data hours ago.

> **answer (Porter, 2026-08-11):** Route **(b)** — and the **owner confirmed it knowingly**, quoted:
> *"สร้างไปเลย เดี๋ยวฉัน reset ให้ เหมือนเดิม … นางทำไปแบบเต็มที่"* (go ahead and create it; I'll re-run the reset
> afterward, same as before; let QA run it to the fullest). So: **run PHASE 2 in full** — create the parent + student +
> 2 course packages + voucher (and the bookings they generate) needed to exercise **#2** (course picker, student with two
> courses) and **#4** (voucher booking shows its subject), verify both, and **you do NOT need to remove your own data.**
> The owner will re-run the REQ-040 delete procedure (the psql `BEGIN … DELETE … COMMIT` block Porter walked him through)
> to return prod to a clean slate after your verdict — the residue is accepted, knowingly, for exactly this window.
> Cancel bookings if trivial, but there's no cleanup obligation on you. **Teacher-change stays excluded** (ratified).
> After your verdict → owner resets → Porter marks REQ-038 #1–5 DELIVERED.

## Verdict so far

**Phase 1: PASS on production** — the build is live, the standing-rule widths are measured and healthy
(closing TASK-124's open runtime item), and 107 / 109 / 102 are confirmed on the customer env, with **no
footprint whatsoever**. **Phase 2 (#2, #4) awaits a decision** — not a technical blocker, a
reversibility one. **Teacher-change remains excluded and unrun** (ratified by Porter).

---

# PHASE 2 + SECTION E — run by QA on customer-prod, 2026-08-11. **All PASS. The re-check is complete.**

The human approved creating QA-owned data and **waived cleanup** (a reset will follow), so #2 and #4 could
be run properly, and section E with them. Harnesses: `tests/harness/prod-smoke-phase2.mjs`,
`prod-smoke-sectionE.mjs`. Evidence: `../project-docs/qa-prod-2026-08-11/prod-p2-*.png`, `prod-E-*.png`.

Rules held throughout: only QA-created rows were touched · no LINE to real people · **the teacher-change
flow was NOT run** (ratified exclusion — dual LINE to real teachers) · TASK-090 guard untouched.

## Data created (QA-owned, prefixed `QA-prod`)

1 parent + student **QA-prod-student** · **2 course packages** on different programs
(Bike / Scooter / Balance Cruiser · Surfskate) · **1 voucher** (5 h) · **1 voucher booking** · plus the
sessions those generate and the edits section E made to them.

## #2 — the calendar course-picker names WHICH course

| # | Case | Expected | Actual | Result |
|---|---|---|---|---|
| 2-1 | the API offers one entry per course with its own context | two entries, each carrying its course | `students[]` returns both, each with `context.courseId` + subject | **PASS** |
| 2-2 | the picker distinguishes them **before** selection | subject + progress on each line | **`QA-prod · Bike / Scooter / Balance Cruiser (0/4) · exp 2026-09-24`** and **`QA-prod · Surfskate (0/4) · exp 2026-09-25`** — two distinct lines, subject, progress, and the TASK-125 expiry tiebreaker | **PASS** |

## #4 — a voucher booking shows its class

| # | Case | Expected | Actual | Result |
|---|---|---|---|---|
| 4-1 | the API carries the subject | the voucher row exposes its class | 1/1 voucher rows carry a subject | **PASS** |
| 4-2 | the bookings table shows it | Subject column populated | columns `Student · Subject · Teacher · Date · Time · Type · Status`; cell = **Bike / Scooter / Balance Cruiser** | **PASS** |
| 4-3 | the voucher plan modal shows it per session, in the voucher shape | Subject column + `VOUCHER` badge and hours | `VOUCHER · 5 / 5 h left · Ends 22 Aug 26` → `22 Aug · 11:00 · Bank · **Bike / Scooter / Balance Cruiser** · PENDING`, with the "moved one at a time (no make-up chain)" note | **PASS** |

## #5 — deduction history, re-verified post-wipe on a course with real activity

`GET /courses/:id/history` → **200**, 4 events; the modal renders
`Deduction history · USED: 0 OF 4 · LEAVE USED: 0 · REMAINING: 4 · ENDS: 10 SEP 2026` with dated entries
(subject · teacher · note) — **no raw i18n key leaked**. **PASS.**

## Section E — REQ-030 · REQ-037 · OBS-3 on the QA-owned course

| # | Case | Expected | Actual | Result |
|---|---|---|---|---|
| E-1 | the plan DTO carries the new fields | `insertable` + per-row `bookingType` | present | **PASS** |
| E-2 | **OBS-3** the preview is a true dry run | resulting plan returned; stored plan unchanged | 200 `{change, moves, resultingSessions, liveEndDate}`; session 2 still `11:00` afterwards | **PASS** |
| E-3 | **OBS-3** a refusal in preview carries the same typed reason | 4xx SLOT_TAKEN | **409 `SLOT_TAKEN` "ครูมีคาบในช่วงเวลานี้แล้ว"** | **PASS** |
| E-4 | edit/move applies (time only) | the chosen time is written | `11:00 → 16:00` | **PASS** |
| E-5 | a planned absence keeps the course at size | absent row leaves; one appended takes its place | counted **4 → 4**; `SICK_LEAVE, PENDING×3, EXTENDED` | **PASS** |
| E-6 | **OBS-3** post-absence stays insertable at owed 0 | `insertable=true` | true, with `owedCount=0` | **PASS** |
| E-7 | insert places the trailing session | row appears at the chosen slot; size unchanged | placed; counted 4 → 4 | **PASS** |
| E-8 | a live-row cancel re-owes | no reason needed; size restored | 200; counted 4 → 4 | **PASS** |
| E-9 | a delivered row still refuses edit/move | 4xx SESSION_DELIVERED | **409 `SESSION_DELIVERED`** | **PASS** |
| E-10 | delivered cancel with NO reason is refused | 4xx REASON_REQUIRED | **409 `REASON_REQUIRED`** | **PASS** |
| E-11 | delivered cancel WITH a reason cancels + re-owes | 200; size restored; reason stored | 200; counted 4 → 4; note stored | **PASS** |
| E-12 | **REQ-037** the extra is a SINGLE_SESSION that changes nothing | size/counted/end unchanged | 201; `SINGLE_SESSION` row; counted 4→4 · size 4→4 · end unchanged | **PASS** |
| E-13 | **REQ-037** cancelling the extra does not re-owe | counted/owed unchanged | 200; 4→4, owed 0→0 | **PASS** |
| E-14 | the plan modal renders with both actions | Insert + the separate charged action | buttons `Edit · Mark absence · Cancel · **Add extra (charged)** · **Insert make-up**` | **PASS** |
| E-15 | **OBS-3 (UI)** the plan-diff appears before commit | "Your plan will become…" and nothing written until confirmed | **"Your plan will become: 0 added · 1 removed · ends 17 Sep 26"**; plan rows 9 → 9 while the confirm was open | **PASS** |

## Excluded, deliberately

**Teacher-change** — not run on production (dual LINE to 21 real teachers, TASK-094). It stays covered by
its `sid` `TEST_PASSED`. Stated here so the verdict is not read as covering it.

## Verdict — the post-deploy re-check is COMPLETE

Everything in the smoke set is now confirmed **on the customer environment**:
**A ✅ (owner) · B ✅ (owner) · C ✅ (owner) · #2 ✅ · #4 ✅ · #5 ✅ · 107 ✅ · 109 ✅ · 102 ✅ ·
REQ-030 ✅ · REQ-037 ✅ · OBS-3 ✅ · the STANDING-RULE widths ✅** (which also closes TASK-124's last open
runtime item). No defects found on production.

**@Porter — this is the DELIVERED gate met** for REQ-038 #1–5 and for REQ-030 / REQ-037 / OBS-3, with the
teacher-change exclusion noted. Marking DELIVERED is yours.

## Test data left behind (cleanup waived by the human)

| What | Where | Removed? |
|---|---|---|
| 1 parent + student `QA-prod-student` · 2 course packages · 1 voucher · 1 voucher booking · the sessions they generated, plus section E's edits (1 delivered-then-cancelled, 1 sick-leave, cancels, 1 extra session cancelled) | customer-prod | ❌ **by agreement** — the human waived cleanup and will re-run the reset. The app has no delete for these rows in any case. All are prefixed `QA-prod` and listed in `../project-docs/qa-prod-2026-08-11/phase2-created.json` |
| No LINE message · no teacher-change · no row touched that QA did not create | — | — |
