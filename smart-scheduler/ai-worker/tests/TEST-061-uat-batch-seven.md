# TEST-061: the uat-gating batch — Porter's seven (REQ-073/074/075 + import-form + Drop/3B)

- Source: Porter 2026-08-29 log ("the whole uat-gating batch is on sid. Deploy confirmed. One pass, seven things.")
- Environment: dev-server `sid` (migrations 0025+0026 applied per Porter; confirmed live: card imports write `leave_quota`)
- Tester: Tanya, 2026-08-29
- Constraint: QA writes on `sid` (board 154-159). Fixtures retired via cancel + `ADMIN_ERROR`. `uat` not QA's.

## ✅ RESOLVED (item 4) — off-card import now SAVES (TASK-217 / `0027`, re-run 2026-08-29)
Root cause (Sober): a **DB `CHECK` still enforcing 4/6/10** while the app had been made the size authority — which is
exactly why **preview returned 200 and the save 500'd** (the split I spotted). `0027` drops it, keeps a 1–100 bound.
**Re-run on `sid` after `0027` applied + BE redeployed (migrate 28·38·28):**
| Re-check | Result |
|---|---|
| OFF-CARD size 8 / quota 3 → 201 **and a real row** | **PASS** — 201; `course_packages` row: size 8, **`leave_quota` = 3**, maxWeek 11, ACTIVE, computed expiry 2026-12-14 |
| Off-card course generates its weekly sessions | **PASS** — **8 sessions** created on the slot (card size 4 → 4 sessions, same path). *(Note: booking DTO exposes the course as `booking.course.id`, not `courseId` — my first read showed 0 by filtering the wrong field; corrected before reporting.)* |
| CARD size 6 still saves (constraint change didn't loosen anything) | **PASS** — 201 |
| Genuinely invalid size (0 / 500) still a message, not a 500 | **PASS** — 400 (schema bound 1–100), no crash |
| Off-card size WITHOUT quota → Thai sentence | **PASS** — 400 "คอร์ส 8 คาบไม่มีในราคามาตรฐาน — ต้องระบุจำนวนครั้งที่ลาได้ด้วย…" |

**Item 4 CLEARED. The row lands (Jason's TASK-215 open question — "not that a row lands in Postgres" — now answered: it does).**

---
### Original finding (kept for the record) — 🔴 the 500 that TASK-217 fixed
The one thing item 4 said must NOT happen. Was **reproducible, isolated, live after the first deploy.**

| Attempt (POST /courses/import) | Result |
|---|---|
| CARD size 6, no quota (fresh student, free slot) | **201 CREATED** ✅ |
| CARD size 4 | 409 SLOT_TAKEN (slot busy — clean, expected) |
| OFF-CARD size 8, leaveQuota 3, **explicit** expiry | **500 INTERNAL** 🔴 |
| OFF-CARD size 8, leaveQuota 3, computed expiry | **500 INTERNAL** 🔴 |
| OFF-CARD size 5, leaveQuota 1 | **500 INTERNAL** 🔴 |
| OFF-CARD size 8, leaveQuota 3, **verified-FREE slot** (Wed 2026-09-16 16:00) | **500 INTERNAL** 🔴 |

- **Preview is fine:** `POST /courses/import/preview {size:8,leaveQuota:3,…}` → 200 `{remaining:8, leaveQuota:3, maxWeek:11, expiryDate:2026-11-14}`. So the form shows green, then the SAVE 500s.
- **Not slot contention** (fails on a proven-free slot), **not my payload** (identical payload with a card size = 201), **not a missing migration** (card imports write `leave_quota` → column + 0026 present).
- **Isolation:** the ONLY thing that flips 201→500 is the size being off-card (5/8 vs 4/6/10) / a non-null `leaveQuota` written. The `decideImportSize` guard passes, `courseExpiry`/`maxWeekFor` are `size+quota` (safe for 8). The crash is downstream in the save transaction — **needs the server stack trace, which only the owner/Sober can see.**
- **Severity:** off-card import is the headline of this deploy's import-form work and the exact "20–36 families off an Excel list" flow ImportBalanceModal was built for. A real admin entering an off-card family gets a 500 after a green preview. **This gates uat.**
- **Attribution:** import-form / off-card path (SPEC-068 · TASK-213/214/215). Migration applied; symptom is a runtime crash in `importCoursePackage` for off-card sizes. Root-cause trace → Sober/Jason (server log).

## Item 4 — the rest (what could be reached)
| Check | Result |
|---|---|
| Default sizes 4/6/10 in the dialog | **PASS** (code: `ImportBalanceModal` Select data = 4/6/10/OFF) |
| Off-card size WITHOUT quota → **Thai** reason, not generic 500 | **PASS** (live) — `POST /import/preview {size:8, no quota}` → 400 `"คอร์ส 8 คาบไม่มีในราคามาตรฐาน — ต้องระบุจำนวนครั้งที่ลาได้ด้วย (เช่น 4 คาบ ลาได้ 1 ครั้ง…)"` |
| Expiry computed + editable | **PASS (code + preview)** — preview returns a computed `expiryDate`; FE seeds it, `expiryTouched` lets a human override |
| Off-card SAVE with size+quota | **🔴 FAIL — 500 (above)** |
| Dialog closes on save | Not reachable (save 500s) — code-confirmed only (`onClose()` after success, TASK-214) |

## Item 3 (REQ-074) — cancel a 1HR / Voucher with the REQ-036 enum
| Check | Result |
|---|---|
| Same three reasons as REQ-036, no parallel set | **PASS** — `CancelBookingDialog` uses `END_COURSE_REASONS`; BE `updateStatus` enum = `[PROGRAM_CHANGED, CUSTOMER_CANCELLED, ADMIN_ERROR]` |
| 1HR (SINGLE_SESSION) cancel w/ `ADMIN_ERROR` | **PASS** (live) — 200, status CANCELLED |
| Voucher cancel w/ `CUSTOMER_CANCELLED` | **PASS** (live) — imported voucher → booked → 200 CANCELLED |
| Non-enum reasonCode (`GARBAGE`) refused | **PASS** (live) — 400, allowed=[the three] |
| Missing reasonCode on 1HR/voucher refused | **PASS** (live) — 400 `REASON_REQUIRED` "ต้องระบุเหตุผลในการยกเลิก" |
| Reason **queryable** (ADMIN_ERROR findable in SQL) | ✅ **SIGNED** — owner's query (via Porter): `ADMIN_ERROR 1 · CUSTOMER_CANCELLED 1 · PROGRAM_CHANGED 1` = exactly my three cancels (single→ADMIN_ERROR, single→PROGRAM_CHANGED, voucher→CUSTOMER_CANCELLED). The machine `cancel_reason` is written and queryable; the **same three values REQ-036 writes for a course cancel** → "find every admin-error cancellation" is ONE query across courses + bookings. No parallel set. |

**✅ Item 3 SIGNED (2026-08-29)** — owner's SQL confirmed the rows.

## Item 6 — Drop/Resume/SLOT_TAKEN + five chips (re-run post-deploy)
| Check | Result |
|---|---|
| Each chip's number = the rows it returns | **PASS** (live) — `counts` {CANCELLED 14 · DROPPED/Paused **1** · COMPLETED 0 · EXPIRED 0 · ACTIVE 7}; row tally identical; sum 22 = total 22 |
| Stale-Paused-chip defect stayed fixed after deploy | **PASS** — Paused chip = 1 = API DROPPED 1 (was the TASK-205 bug) |
| Drop / Resume / SLOT_TAKEN | Verdicts from 11:51/12:33 stand (Porter: re-run only what the deploy disturbed; counts were the disturbable part) |

## Item 2 (REQ-073) — the other four confirms (code-read)
| Check | Result |
|---|---|
| `confirm` · `ลา` · `เพิ่มคาบ` · bulk — each states the **consequence** | **PASS** — confirmMsg "teacher will be sent the schedule on LINE"; leaveMsg "uses one of the course's leaves and adds a make-up"; extraMsg "billed on top of the package — does not use a course session"; bulkMsg "{n} bookings will be confirmed and their teachers messaged on LINE". All EN/TH symmetric. |
| No double-confirm on the two that already had one | **PASS** — admin-unlock keeps its own `pending`+Modal; plan-insert keeps its diff-preview; neither wraps `useConfirm`. |

## Item 1 (REQ-073, 🔴 the overruled one) — มาเรียน must FEEL like two keystrokes — **PASS (painted, as a user)**
Painted on `sid` (TH). Opened a confirmed session → clicked **มาเรียน** → the light confirm appeared:
- Text: **"มาเรียนคาบนี้?"** — one line, no body paragraph.
- **No reason field** (0 text inputs / 0 textareas in the dialog).
- Buttons: **ยกเลิก** (subtle) · **มาเรียน** (blue). The primary **มาเรียน** button is the **focused element** → **Enter confirms** without the mouse. × / Esc / backdrop = dismiss (`settle(false)` — dismiss ≠ consent).
- **As a user:** this is click → Enter → done. The confirm is a single focused keystroke, not a form, so it does **not** re-create the 2026-08-23 NO_SHOW-by-friction risk. Honest note: it is one dialog more than a bare one-click button — which is the owner's deliberate call (he overruled the concern). It feels like two keystrokes, as required. **PASS.**
- (Screenshot: `item1-light-confirm.png`. I clicked only the *trigger* button, never the dialog's confirm — **no write**; booking counts unchanged, see Footprint.)

## Item 5 (REQ-075) — labels in the RENDERED cell/legend/toggle — **PASS (painted)**
Painted on `sid` (EN, week view). From the rendered page, not the dictionary:
- Day headers: **Mon / Tue / Wed / Thu …** (full 3-letter). The two-letter **Mo/Tu/We** form is **absent**.
- **Type legend** (on the grid): "Type · 1st Trial · 1 HR · **Course** · Voucher" — the type label is **"Course"**, not "Weekly course".
- The only residual **"Weekly"** on the page is the **Weekly/Daily view toggle** (the week-vs-day switcher) — a correct, unrelated usage, not the booking-type label. **PASS.** (Screenshot: `item5-calendar-en.png`.)

## Item 7 (3B) — sm-daily-reminder twice → job_runs 2 rows (2nd already-sent) — **OWNER-RUN + DATA REQUEST**
- **QA cannot trigger it.** Probed live: `/jobs/daily-reminder` → 404 (not a public route); `/api/jobs/daily-reminder` → **401 UNAUTHORIZED**. The job is server-internal (gated by `INTERNAL_JOB_SECRET`), and that secret is **not** in the QA access file (only URL/user/pass/AUTH_SECRET). So the *trigger* is the owner's, on the box.
- ✅ **SIGNED** — owner ran it (via Porter). `job_runs` holds a row per run:
```
08:52:16  attempted:false  already-sent
08:52:12  attempted:false  already-sent
08:15:01  attempted:false  already-sent   ← the Windows scheduled task firing on its OWN (schedule proven, not just the endpoint)
```
Three runs → three rows; the guard makes repeats `attempted:false / already-sent` (idempotent). 📌 All read `already-sent` because a 05:08 test consumed the day's single attempt — Porter flagged an **operational trap for `uat`** (a manual pre-08:15 trigger silently cancels that day's real reminders; fixing it by keying on `sent` re-introduces the bug Jason removed). **That is Sober's design call, not a blocker and not QA's** — noted so it isn't lost.

**✅ Item 7 SIGNED (2026-08-29)** — three `job_runs` rows incl. the 08:15:01 self-firing schedule.

## Footprint — declared
Created + retired (CANCELLED via ADMIN_ERROR) course fixtures: `QA-req074-iso` (size6), `QA-req074-free2` (size4). Off-card save attempts wrote nothing (500'd before insert commit). Item-3 bookings are all CANCELLED (cancel IS their retirement): `QA-req074-1hr` (2 single-sessions), `QA-req074-vou` (1 voucher booking). Residual (no delete API): the QA students + one imported QA voucher (`af05e1bb`, 0 used). Scope `sid` only.

## Verdict — ✅ ALL SEVEN SIGNED ON `sid` (2026-08-29). Batch clear for `uat` from QA's side.
- **Item 1** — มาเรียน feel: light, no reason field, Enter-confirms. **PASS** (painted)
- **Item 2** — four confirms state the consequence · no double-confirm. **PASS** (code)
- **Item 3** — REQ-036 enum enforced live; `cancel_reason` queryable (owner SQL: ADMIN_ERROR/CUSTOMER_CANCELLED/PROGRAM_CHANGED). **SIGNED**
- **Item 4** — off-card import SAVES after TASK-217/`0027`: 201 + real row (`leave_quota`=3) + 8 sessions; card still saves; invalid size = message not 500. **PASS (re-run)** — _was the one blocker; now cleared._
- **Item 5** — Mon/Tue/Wed · "Course" not "Weekly course". **PASS** (painted)
- **Item 6** — chips = rows, sum 22, Paused-chip fix held. **PASS** (live)
- **Item 7** — three `job_runs` rows incl. the 08:15:01 self-firing schedule. **SIGNED** (owner-run). One `uat` operational-trap note handed to Sober (not a blocker).

Scope `sid`; `uat` untouched. Footprint fully retired (all QA course/booking fixtures CANCELLED; residual = QA students + one imported QA voucher, no delete API).
