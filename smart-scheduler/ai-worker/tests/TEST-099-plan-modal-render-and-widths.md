# TEST-099: course/voucher plan modal — live render + STANDING-RULE 4-width measurement
- Source REQ: REQ-030 (SPEC-028) · Task under test: TASK-099
- Status: **TEST_PASSED** (2026-08-04, second round — behaviour verified on `sid`). First round was TEST_FAILED on the 375 px case; the owner has since ruled phone widths out of scope, so DEF-1 is MINOR/backlog.
- Environments: round 1 local+mock; **round 2 = `sid` (som.develyst.online), authenticated via TASK-090 `mint-session.mjs`**
- Tested: 2026-08-04 by Tanya

## Scope

What Porter routed to me: the live render of the shared plan modal and the STANDING-RULE
measurement at 1600 / 1280 / 768 / 375 — **especially the voucher table's new "Manage" column at 375** —
plus a sanity check of edit/move, mark-absence, insert, and that refusals show the server's reason.

**What I could actually run, and where.** `sid` is unreachable to me today (see `## Blocked`), so I did
**not** get the live-on-`sid` render. Instead I ran the FE **locally** in a **real compositing Chrome**
(playwright `channel:"chrome"`, headless) against `next dev` on `localhost:3016` in **mock mode**
(`NEXT_PUBLIC_USE_MOCK=true`, `AUTH_URL=http://localhost:3016/api/auth`). In mock mode the NextAuth
Credentials provider accepts any local input (`src/auth.ts`, `useMock` branch) — **no real environment
and no real credential is involved**, and nothing was written anywhere.

**This is enough for layout and enough for render — it is NOT enough for behaviour.** The mock
`applyPlanChange` resolves unconditionally and the mock `getEntitlementPlan` returns a **course** DTO for
every id, so the voucher plan shape and every server refusal are **untested**, not passed.

Harnesses (re-runnable, committed): `tests/harness/plan-modal-widths.mjs`,
`tests/harness/voucher-manage-375.mjs`. Evidence: `../project-docs/qa-2026-08-04/*.png`.

## The 4-width measurement (STANDING RULE)

### A. Voucher table — the new "Manage" column (`VoucherPanel.tsx:108`)

| Viewport | th widths (Student · Total · Usage · Expiry · Status · **Manage**) | Manage button | Table scrollWidth | Card clientWidth | Overflow-x | Button hit-testable? |
|---|---|---|---|---|---|---|
| **1600** | 178 · 198 · 287 · 188 · 184 · **260** | 113 px @ x=1331 | 1294 | 1294 | hidden | ✅ yes |
| **1280** | 134 · 149 · 216 · 142 · 138 · **195** | 113 px @ x=1076 | 974 | 974 | hidden | ✅ yes |
| **768** | 99 · 109 · 160 · 104 · 101 · **145** | 113 px @ x=614 | 718 | 718 | hidden | ✅ yes |
| **375** | 87 · 72 · 160 · 82 · 76 · **145** | 113 px @ **x=512–625** | **624** | **341** | **hidden** | 🔴 **NO** |

At 375 the table is **283 px wider than the card that clips it** (624 vs 341), the card is
`overflow-x: hidden`, and the page itself has **no horizontal scroll**
(`documentElement.scrollWidth == clientWidth == 375`). `document.elementFromPoint()` at the Manage
button's centre returns **`null`** — the button is not merely ugly at 375, it is **off the painted
surface and unreachable**. The screenshot confirms it: the table is cut mid-"Expiry"; Status and Manage
are simply not there (`../project-docs/qa-2026-08-04/voucher-table-375.png`).

> Note on one contrary signal: a playwright *trial* click at 375 passes actionability, because
> `scrollIntoViewIfNeeded` can scroll an `overflow:hidden` container **programmatically**. A person
> cannot. The hit-test and the screenshot are the truth here.

### B. Course card "Manage plan" button (`CoursePackagePanel.tsx:165`)

| Viewport | 1600 | 1280 | 768 | 375 |
|---|---|---|---|---|
| Button width | 379 | 273 | 310 | **301** |
| Card width | 421 | 315 | 352 | 343 |

Full-width inside its card at every breakpoint, never collapsed. ✅ PASS.

### C. Plan-modal session table + its action row (`PlanModal.tsx:218`)

| Viewport | Modal width | Table scrollWidth | Scroller clientWidth | overflow-x | Action cell | Buttons (Edit / Mark absence) | Row wraps? |
|---|---|---|---|---|---|---|---|
| 1600 | 780 | 748 | 748 | auto | 266 | 58 / 117 | no |
| 1280 | 780 | 748 | 748 | auto | 266 | 58 / 117 | no |
| 768 | 691 | 659 | 659 | auto | 235 | 58 / 117 | no |
| **375** | 338 | 560 | **306** | **auto** | 200 | 58 / 117 | no |

✅ PASS. At 375 the table overflows (560 > 306) but sits in `Table.ScrollContainer minWidth={560}` with
`overflow-x: auto`, so it **scrolls** and both buttons stay reachable — visible scrollbar in
`plan-modal-375.png`. **This is exactly the wrapper the voucher panel table is missing**, which is why
one clips and the other doesn't.

## Cases

| # | Case | Type | Steps | Expected | Actual | Result |
|---|---|---|---|---|---|---|
| 1 | Bookings page loads with the plan entry points | happy | login → `/scheduler/bookings` | Courses + Vouchers tabs render, Manage entry points present | Both render; "Manage plan" on course cards, "Manage" on voucher rows | **PASS** (local) |
| 2 | Course "Manage plan" opens the plan modal | happy | Courses tab → Manage plan | Modal with summary bar + session table | Opens: `COURSE · 10-session course · Leave 1/3 · 7 OWED · Ends 6 Oct 26`, 3 session rows | **PASS** (local) |
| 3 | Delivered rows read-only | edge | inspect rows | delivered → "locked", no buttons | Not exercised — mock fixture has no ATTENDED/NO_SHOW row | **NOT TESTED** |
| 4 | Per-session **edit/move** editor opens | happy | row → Edit | Date/Time/Teacher/Subject + availability view | All four Selects render; "Who's free at this slot" badge row renders | **PASS** (render only) |
| 5 | Edit/move **applies** and reconciles | happy | editor → Save | server applies, plan refetches | Mock resolves unconditionally — proves nothing | **NOT TESTED** |
| 6 | **Mark absence** | happy | row → Mark absence | absence marked, make-up appended | Button present on every live course row; mock no-ops | **NOT TESTED** |
| 7 | **Insert** make-up | happy | "Insert make-up" → pick slot → Save | inserted into chosen slot, owed count drops | Button present, owed hint reads "7 session(s) still owed"; mock no-ops | **NOT TESTED** |
| 8 | **Refusals show the server's exact reason** | negative | force a clash / ceiling / late teacher change | red alert with the server message | Mock never refuses; no path to a real 4xx locally | **NOT TESTED** |
| 9 | Availability view shows BOOKED / NO_BUDGET + clash owner | negative | open editor on a taken slot | red/orange badges + "booked by X" | Mock returns `available:true` for every teacher — only the green state was ever painted | **NOT TESTED** |
| 10 | **Voucher** row → plan modal renders the **voucher** shape | happy | Vouchers tab → Manage | `VOUCHER` badge, hours left, voucher note, **no** insert/mark-absence | Modal opened but rendered the **COURSE** shape ("4-session course", "Insert make-up") — the mock returns a course DTO for every id (`scheduler.mock.service.ts:600`) | **NOT TESTED** (mock artifact, not a product verdict) |
| 11 | Voucher "Manage" reachable at 375 | edge | 375 → Vouchers tab | button visible & clickable | Clipped, `elementFromPoint` → null, no page h-scroll | 🔴 **FAIL** → DEF-1 |
| 12 | 4-width measurement of every new/resized shared row | edge | see tables above | numbers reported | Reported | **PASS** (measurement done) |
| 13 | Console clean on the bookings page | regression | watch console | no errors | One `404 (Not Found)` for a static asset on the login route; **no React/page errors** on `/scheduler/bookings` | **PASS** (with note) |

## Defects

### DEF-1 — Voucher table's new "Manage" column is clipped and unreachable at 375 px — **MAJOR**
- Environment: local (`localhost:3016`, mock) — **layout only, so it will reproduce identically on `sid`**:
  the widths come from the same CSS, and the STANDING RULE exists because this class of defect is
  measurable without paint.
- Repro (clean state): 1. open `/scheduler/bookings` 2. Vouchers tab 3. set the viewport to 375 px wide.
- Expected: the "Manage" button is visible, or the table scrolls horizontally to reach it.
- Actual: the table (`scrollWidth 624`) is clipped by its `Card` (`clientWidth 341`, `overflow-x: hidden`);
  the page does not scroll horizontally; the Manage button occupies x=512–625, entirely outside the
  visible area; `document.elementFromPoint()` at its centre returns `null`. **The Status column is lost
  the same way.** The plan modal's own table does not have this problem because it is wrapped in
  `Table.ScrollContainer` — the voucher panel table (`VoucherPanel.tsx:65`) is not.
- Impact: at mobile width the **only** entry point to the voucher plan modal cannot be reached, so the
  voucher half of TASK-099 is unusable there.
- Evidence: `../project-docs/qa-2026-08-04/voucher-table-375.png`, `vouchers-375.png`; numbers above.
- (Not my call how to fix — reporting what breaks and how to see it.)

### OBS-1 — Edit dialog opens with **Subject empty** on an existing session — needs a real-data re-check — **UNCONFIRMED**
On Edit, Date/Time/Teacher seed from the row but the Subject Select shows the placeholder "Choose
subject" even though the row shows a subject. Locally this is explainable as a mock artifact (the mock
subject id `mock-subj` is not in the teacher's `subjectOptions`). On real data it depends on whether the
session's subject id is always present in the selected teacher's options. **Flagging, not claiming** —
it needs one look on `sid`, and if it reproduces there it is a real defect (a save could silently drop
the subject).

### OBS-2 — cosmetic, pre-existing, not TASK-099
The course card's "LOCKED" badge truncates to "LOCK…" at 1280 (`plan-modal-1280.png`, card behind the
modal). Not introduced by this task; noting so it isn't discovered as new later.

## Blocked

🔴 **Everything on `sid` is blocked this session: the access file is not on this machine.**
`H:\sm-test-access.txt` (dev URL + staff login + `AUTH_SECRET`, per Porter 2026-08-02) is unreachable —
**drive `H:` is not mounted; the only filesystem drive present is `C:`.** I did not go looking for
credentials anywhere else, and I have not tried to work around the login.

Consequences, precisely:
- No staff login ⇒ **no backend token** ⇒ TASK-090 `scripts/mint-session.mjs` cannot run (it requires a
  real `BACKEND_TOKEN`; a blank one is designed to exit 1, and forging one would produce a session with
  no authority — the exact failure Sober guarded against).
- ⇒ the **live-on-`sid` render** of TASK-099 and every behavioural case above stay **NOT TESTED**.
- ⇒ **the whole batch acceptance (REQ-009 / 020 / 022 / 023 / 024 + the painted-UI checks: REQ-022
  expired-voucher red alert, REQ-024 collapsed date input, REQ-026 nav) could not be started.** Nothing
  is rounded up to a pass.

`sid` itself is up and reachable from here: `GET /scheduler/bookings` → **302** to login,
`GET /api/health` → **401**. So the block is **credentials, not connectivity**.

One thing I did establish without logging in: the deployed sid bundle's dictionary chunk contains the
full `plan.*` copy ("Manage plan", "Insert make-up", "Mark absence", "Who's free at this slot", "Voucher
sessions", "no live sessions"). That means **TASK-099's FE looks deployed on `sid`** — useful for
planning the next round, but it is a bundle read, **not a test**, and it carries no verdict.

## Test data created

| What | Where | Removed? |
|------|-------|----------|
| — nothing | — | n/a — all work was local + mock; **no writes to `sid`, no writes to any DB** |
| local `next dev` on :3016 (mock mode) | this machine | ✅ stopped at end of session |
| screenshots | `../project-docs/qa-2026-08-04/` | kept deliberately as evidence |

## Verdict

**`TEST_FAILED`** — on DEF-1 alone: the voucher plan modal's only entry point is unreachable at 375 px,
which is precisely the case the STANDING RULE was written to catch, and precisely the one Fern flagged as
unmeasurable and asked to have measured.

**And read the failure narrowly.** What passed is *layout and render*, locally, on mock data. Everything
that makes TASK-099 a plan **editor** — move, mark-absence, insert, the voucher shape, the availability
and clash states, and "refusals show the server reason" — is **NOT TESTED**, because mock data cannot
refuse anything. TASK-099 must not be read as accepted on the strength of this round.

## Questions

1. **@Porter — access.** `H:` is not mounted on this machine, so the sid URL / staff login / `AUTH_SECRET`
   are unavailable. Can the owner make `H:\sm-test-access.txt` reachable again (or place it somewhere on
   `C:` that you nominate)? Until then I cannot run *anything* on `sid` — not TASK-099's behaviour and not
   the batch acceptance. This is the single blocking item.
2. **@Porter — is a 375 px viewport in scope for the bookings page at all?** DEF-1 is unambiguous as a
   measurement; its *severity* depends on whether staff use this page on a phone. If the answer is
   "desktop only", DEF-1 drops to MINOR and I will re-file it as such — but the STANDING RULE says
   measure and report, so I am not deciding that myself.
3. **@Porter → SA/FE (your routing, not mine):** OBS-1 (Subject empty on Edit) needs one look on real
   data before anyone can call it a mock artifact.

---

# ROUND 2 — 2026-08-04 (later the same day): the behavioural pass, on `sid`

Access was restored (`C:\Users\Admin\sm-test-access.txt`), so everything round 1 had to leave
`NOT TESTED` was run for real: authenticated through TASK-090's `mint-session.mjs` (backend token from
`POST /api/auth/login`, cookie minted in memory, injected into a real Chrome — **no token, cookie or
secret was written to disk or printed**). Harnesses: `tests/harness/sid-session.mjs`,
`sid-task099-behaviour.mjs`, `sid-task099-refusal-and-delivered.mjs`, `sid-task099-delivered-only.mjs`,
`sid-task099-insert.mjs`, `sid-painted-checks.mjs`.

## Cases — round 2 (all on `sid`, against a course I created for my own QA student)

| # | Case (AC) | Expected | Actual | Result |
|---|---|---|---|---|
| R2-1 | `GET /entitlements/:id/plan` | 200, `kind`-discriminated DTO, derived `liveEndDate` | 200 · `kind=course` · 4 sessions · `liveEndDate=2026-09-01` | **PASS** |
| R2-2 | Plan modal renders the real plan | rows + summary (size/leave/owed/end) | 4 rows · `COURSE · 4-session course · Leave 0/1 · Ends 1 Sep 26` | **PASS** |
| R2-3 | **Edit/move applies** | the chosen time is written | 14:00 → 09:00 → 10:00 across runs; server confirms each | **PASS** |
| R2-4 | Server refuses a clashing move | 4xx + typed reason | **409 `SLOT_TAKEN` "ครูมีคาบในช่วงเวลานี้แล้ว"** | **PASS** |
| R2-5 | 🔴 **The modal shows the SERVER's exact reason** | red alert carrying that text; move not applied | alert rendered with **"ครูมีคาบในช่วงเวลานี้แล้ว"**; the session stayed at 2026-08-25 13:00 | **PASS** |
| R2-6 | Availability view: BOOKED / NO_BUDGET + clash owner | real states, not all-green | **`BANK · BOOKED · QA-EXPV`** (red, names the clash owner) + 11 × `· NO BUDGET` (orange) + green free teachers | **PASS** |
| R2-7 | **Mark absence** keeps the course at size | absent session leaves the plan, one appended takes its place | `PENDING×4` → `SICK_LEAVE, PENDING×3, EXTENDED` — counted sessions still 4 | **PASS** |
| R2-8 | **Insert** places a session in the chosen slot | a session appears at the chosen date/time | inserted at 2026-08-25 11:00 as requested; invariant held (counted = 4) | **PASS** (see OBS-3) |
| R2-9 | **Delivered rows are read-only** | ATTENDED row shows "locked", no Edit / Mark absence | row read `1 Aug · 09:00:00 · Bank · … · ATTENDED · Attended — locked` — no action buttons | **PASS** |
| R2-10 | Server blocks moving a delivered session | 4xx SESSION_DELIVERED | **409 `SESSION_DELIVERED` "คาบที่เรียนไปแล้ว แก้ไขไม่ได้"** | **PASS** |
| R2-11 | Voucher plan shape (`kind=voucher`) | hours-based summary, no insert/mark-absence | **not exercised** — the only vouchers on `sid` are other people's rows, and my own QA voucher is the expired one | **NOT TESTED** |
| R2-12 | DEF-1 re-measured on the **deployed** page | same numbers as local | 375: table 627 vs card 341, `overflow-x: hidden`, hit-test false · 768/1280/1600: reachable ✅ | **CONFIRMED** |

## Observations added in round 2

### OBS-1 — RESOLVED: not a defect
On real data the Edit dialog seeds **Subject correctly** ("Bike / Scooter / Balance Cruiser") and Time
correctly. The empty Subject in round 1 was a mock artifact, as suspected. Closed.

### OBS-3 — Insert with **nothing owed** is accepted, and silently cancels the trailing session — **question for Porter**
With `owedCount = 0` I expected the documented `NO_OWED_SESSION` refusal. Instead
`POST /courses/:id/plan {kind:"insert"}` returned **200** with
`{"appended":[],"cancelled":["df9016be…"]}` — it placed the new session at my chosen slot and
**cancelled the trailing planned one**. The size invariant is preserved (counted sessions stayed 4), and
this is arguably SPEC-028's own model ("an insert *moves* the trailing session"). **But** from the
staff side: pressing "Insert make-up" while the modal itself says *"0 session(s) still owed"* silently
moves a family's last booked session with no confirmation. Intent question, not a verdict — **@Porter**.

### OBS-4 — cosmetic: the plan table prints raw DB times
The Time column shows **`13:00:00`**, while the rest of the app shows `10:00-11:00`. Cosmetic only.

### Deploy note (not a defect)
The build on `sid` predates TASK-104/105/106: cancelling a course session did **not** re-owe a make-up
(`owedCount` stayed 0). Consistent with those tasks being built today and not yet deployed.

## Verdict — round 2

**`TEST_PASSED`.** Every behavioural AC of TASK-099 passes on `sid`, including the one this project keeps
re-learning — **a refusal reaches the user with the server's own words**. Remaining, and stated plainly:
the **voucher** plan shape (R2-11) is still unexercised, and DEF-1 stands as a **MINOR** backlog item at
375 px per the owner's desktop-only ruling.
