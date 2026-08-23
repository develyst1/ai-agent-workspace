# SPEC-060: Imported course plan is responsible only for its remaining sessions (REQ-064)

- Source: REQ-064 (🔴 HIGHEST — live on `uat`, 16 imported courses; the first leave on any invents free sessions)
- Author: Sober (SA) 2026-08-22
- Status: READY — TASK-165 (BE core) + TASK-166 (AC-7 report) + TASK-167 (AC-8 modal) cut. **AC-3/AC-4 (label/quota)
  deliberately NOT cut — the premise is not grounded; see the challenge below.**

## The confirmed defect (symptoms #2 & #3) — grounded in code

`importCoursePackage` correctly stores `size=10, usedSessions=4` and creates **only the 6 remaining** bookings
(its comment explains why inventing past attendance would poison the reports — that decision stays). The bug is the
reconciler measuring the plan against the **whole purchase**:
- `reconcileCoursePlan` (`:1546`) → `planCourseMoves(rows, course.size)` with `rows`=6, `size`=10 ⇒ `need=4` ⇒
  appends 4 phantoms **on top of** the real leave's make-up = **5** (symptom #2).
- `owedCount: Math.max(0, course.size − current)` (`:1277`) = 10−6 = **4** phantom debt (symptom #3).
- `insertable: canInsert(planSessions, course.size)` (`:1270`) — same wrong baseline.

## Q1 — how to separate "taught before import" from "attended since" (the trap)

Both live in `usedSessions` today, and `usedSessions` **moves** as remaining sessions are attended — so any derived
formula is right once and wrong after the next attendance (Porter's trap: `size − usedSessions` would make a SALE
course **cancel** real sessions). **The honest fix is a migration** (Porter expected one; confirmed):

**New immutable column `coursePackages.priorSessions` (int, NOT NULL, default 0)** = sessions taught **before**
import. Set once by `importCoursePackage` (`priorSessions = the usedSessions it's given`); **0 for every SALE
course**. It never changes after creation.

**The plan-responsibility quantity is `planSize = size − priorSessions`** — fixed at import, attendance-invariant.
Replace `course.size` with `planSize` in the three plan-responsibility sites (**and only those**):
- `reconcileCoursePlan` → `planCourseMoves(rows, planSize)`,
- `owedCount: Math.max(0, planSize − current)`,
- `insertable: canInsert(planSessions, planSize)`.

**Keep `course.size` for quota, labelling and expiry** — those are about the purchase and are already correct.

**Why this is safe (AC-5, the regression that matters most):** a SALE course has `priorSessions = 0` ⇒
`planSize = size`; all `size` bookings exist ⇒ `current = size = planSize` ⇒ `planCourseMoves` returns no moves —
**nothing appended, nothing cancelled**, ever. An imported 10/4: `planSize = 6 = current` ⇒ no phantom; a leave
creates exactly one make-up (AC-1). AC-2's owedCount = 6−6 = 0.

## 🔴 The cancel guard — requirement 6 (do not auto-delete a family's sessions)

An **already-affected** import (a leave taken before this fix ⇒ 5 phantoms already scheduled) has `current > planSize`
after the fix. `planCourseMoves`'s `current > size` branch would **cancel** them. **It must not** — requirement 6:
nothing is removed from a family's plan without the owner. So: **the reconciler must never auto-cancel pre-existing
COURSE_PACKAGE sessions to shrink a plan to `planSize`.** New imports never reach this state; existing affected ones
are surfaced by the AC-7 report and the owner decides per course. (SALE courses never hit it — `current ≤ planSize`.)

## Backfill (existing 16 imports)

- SALE courses: `priorSessions = 0` (column default). Done.
- IMPORT courses: `priorSessions = usedSessions` — **correct for every import where no remaining session has been
  attended since import** (a leave does not change `usedSessions`; only attendance does). The AC-7 report flags any
  course where `live COURSE_PACKAGE count ≠ size − priorSessions` — i.e. already carries phantoms **or** has drifted
  — for the owner to assess. **No plan is rewritten by the migration.**

## 🔻 AC-3 / AC-4 (label & quota) — premise CHALLENGED, not built

REQ-064 requirements 4/5 assume the course is *labelled/quota'd by the remaining count* (symptom #1: "6-session,
0/6, Used 0/2"). **Grounding says otherwise:** `CoursePackagePanel.tsx` reads **`c.size` / `c.leaveQuota` /
`c.usedSessions` straight from the DTO** (`:103,132,136,147,153`), and the BE computes `leaveQuota(c.size)`
(`leave.ts:35`). ⇒ **a course stored `size=10, usedSessions=4` already displays `4/10` and quota `0/3`.** The "6 /
0/2" the owner saw (quota 2 = `leaveQuota(6)`) is only possible if **`size=6` was stored** — which is *inconsistent*
with symptoms #2/#3 (those require `size=10` for the reconciler to append 4). The two cannot both be true for one
course under one stored size.

⇒ **Do not build a label/quota fix on this — it would be inventing a cause from a screen (the REQ-044/056 mistake).**
**Q to owner via Porter (DATA REQUEST — give the query, do not run):** for the exact course the owner tested, report
`SELECT size, used_sessions, source` **and** what the card showed. Three possibilities: (a) the "Already in progress"
import **form captured remaining-as-size** (stored 6/0) — a real but *different* bug in the import entry; (b) a
display path we haven't found; (c) a misread / two different courses. **The fix for AC-3/AC-4 depends on which — so
it waits for the data.** The reconciler fix (TASK-165) is independent and proceeds now.

## Tasks
- **TASK-165 (BE):** `priorSessions` migration + set at import + `planSize` in the 3 sites + the cancel guard +
  backfill + AC-1/2/5/6 tests.
- **TASK-166 (BE, read-only):** AC-7 / Q2 — list IMPORT courses where `live count ≠ size − priorSessions`.
- **TASK-167 (FE):** AC-8 — the "Already in progress" modal helper-text row alignment (what the owner actually
  pointed at).
- **AC-3/AC-4:** held pending the DATA REQUEST above.

## Out of scope
Creating already-taught bookings (forbidden — fictional attendance). Plan-editor redesign (REQ-030). Changing import
entry — **unless** the DATA REQUEST shows the form stores remaining-as-size, which would be its own REQ.
