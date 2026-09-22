# TASK-436 — 🔴🔴 REGRESSION on `uat` (customer): the coach's `📤 คาบสอนนี้ถูกย้ายออกจากตารางของคุณแล้ว` (`teacher_unassigned`) STOPPED arriving on a teacher reassignment — BE debug FIRST, cause before fix — S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-22) · **Size S (debug).** Real coaches affected on `uat` (deployed 09-21 = TASK-406…425). The cause decides hotfix vs batch.

## §0 What I already read (do not redo; extend)
- The ONLY producer of `teacher_unassigned`/`teacher_assigned` in `scheduler.service.ts` is `applyPlanChange` (`:3231`) on an ACTUAL teacher change — intact; `git log -S teacher_unassigned` shows one commit ever (0c0facb) and no removal since; commits 3897a25 (TASK-423), d027ef1 (TASK-425), b72f88b (TASK-406) removed no `enqueueLine`. `moveBooking` (`PATCH /bookings/:id`) never sent it (Finding A). The renderer (`line-message.ts:652`) is unchanged in shape.
- The customer's screenshot: a Private session, `นักเรียน: พอ ชิตวร · วิชา: Private SURFSKATE · เวลา: 27-09-2026 11:00-12:00` DID arrive before 09-21.

## §1 Find it — three suspects, in order
1. **Delivery, not enqueue (TASK-425's fold):** run the REAL worker path (`outbox.service` `bookingContext` → `line-message` render) for a `teacher_unassigned` row on a Private course session with a coach who has a `lineUserId` — through the root app or the worker's own test seam — and on a DUO one. Does `studentNamesOf`/`bookingContext` throw or return a context the `teacher_*` case renders empty/undefined (a thrown render ⇒ the row `FAILED` with an error, the coach silent)? Compare `git show d027ef1 -- src/services/outbox.service.ts src/lib/line-message.ts` against the `teacher_*` case's inputs (`ctx.date/startTime/endTime/studentName/subject`).
2. **The gate before the enqueue:** `teacher_change_notice_days` (`TEACHER_CHANGE_TOO_LATE`) — a refused change sends nothing; and `change.override` — the FE's plan editor sends `override: true` now? (If the FE started sending `override`, the notice STILL fires — `teacherChanged` is independent of override; confirm by reading, and pin it.)
3. **The door:** the customer may now reassign via the Move-session popup (`PATCH /bookings/:id { teacherId }`, which never told the coach) instead of the plan editor. If 1 and 2 are clean, say so plainly — then the fix is the one Finding A deferred: `moveBooking` on a teacher change enqueues `teacher_unassigned` (old) + `teacher_assigned` (new), the same pair as the plan edit, one place — build it in this task (S), pinned by value (a date/time-only move still silent, the §5 ruling).

## §2 DoD
- [ ] The cause named with evidence (which of 1/2/3) · the fix + pins · suite **count** · tsc 0 · 50 = 50 · **hotfix-vs-batch recommendation** (if 1: a hotfix on `uat` is warranted — say the smallest cherry-pick; if 3: rides the batch) · 🔑 Break-and-watch, `finally`, CHECKSUM · report here + `inbox/SA.md` + log. 🚫 No `uat` access — the outbox rows are the owner's DATA REQUEST (asked via Porter).

---

# 🔎 CAUSE + ✅ FIX — @Jason → @Sober (2026-09-22) — suspects 1 and 2 are CLEAN by value; the DOOR (3) is the cause; the pair now rides `moveBooking` through ONE helper; 2718 pass / 0 fail; 8/8 mutations bite

**Numbers:** `bun test` **2718 pass / 0 fail** (+7: `src/lib/teacher-reassigned-notice-req097.test.ts`) · `tsc --noEmit` **0** · 50 = 50 · the product diff is ONE file (`scheduler.service.ts`, +20/−24: the plan edit's inline pair lifted into `sendTeacherReassigned`, the move calls it).

## §1 The evidence, in your order
1. **Delivery — CLEAN.** I ran the REAL worker path (`processOutboxOnce` → `bookingContext` with TASK-425's `coStudent` fold → the `teacher_*` renderer → `pushMessage`) on a `teacher_unassigned` row for the customer's exact shape (a Private course session, `นักเรียน: พอ ชิตวร · วิชา: Private SURFSKATE · เวลา: 27-09-2026 11:00-12:00`): `{ sent: 1, failed: 0 }`, the row marked SENT, the pushed bytes byte-equal to the pre-09-21 screenshot's format — and for a DUO session (`พอ ชิตวร & Prao`). The drizzle relational query with `coStudent` BUILDS (checked `toSQL()` — 5 kB, the join present); nothing in `d027ef1` touches the `teacher_*` case's inputs. One thing worth knowing while I was there (NOT the cause, pinned as a fact): `bookingContext` + the render sit OUTSIDE the per-row try — a throwing render would stall the whole batch, every kind; the outbox rows (your DATA REQUEST) would show ALL kinds stuck, not one.
2. **The gate — CLEAN.** `teacherChanged = change.teacherId !== undefined && change.teacherId !== b.teacherId` — independent of `override`; a too-late change throws `TEACHER_CHANGE_TOO_LATE` BEFORE the write (the admin sees the 409, nothing moves, nothing to notify); `override: true` skips only the days gate, the pair still fires. Pinned by source.
3. **The door — THE CAUSE.** `moveBooking` (`PATCH /bookings/:id` — the Move-session popup, which TASK-424 made the everyday place to touch a session) wrote the new teacher + reconciled the holds and told nobody; only the course-plan editor's `applyPlanChange` ever sent the pair. A reassignment through the popup ⇒ silence — exactly the customer's report. (What the outbox rows will show: NO `teacher_unassigned` row for that session at all — not FAILED, not SKIPPED; absence, not failure.)

## §2 The fix
- **`sendTeacherReassigned(tx, bookingId, oldTeacherId, newTeacherId)`** — ONE helper: the old coach's `teacher_unassigned` + the new coach's `teacher_assigned`, on the row, in the write's tx; an unlinked coach gets the SKIPPED row `enqueueLine` writes. The plan edit now calls it (its inline pair lifted, byte-equal kinds), and **`moveBooking` calls it when `patch.teacherId` differs from the row's** — a date / time / note / rate-only move stays silent (REQ-101 §5 ruling B), the same teacher re-sent ⇒ nothing. By value through a fake tx (the pair's recipients, order, row id; the silent cases) and by source (3 references = the definition + both doors; `kind: "teacher_unassigned"` spelled once in the service; the series swap keeps its own per-row pair).
- ⚠️ **One difference between the doors, said plainly, NOT changed here:** the plan edit gates a teacher change by `teacher_change_notice_days` (409 `TEACHER_CHANGE_TOO_LATE` unless `override`); `moveBooking` has never had that gate — the popup can reassign for tomorrow with no notice. Pre-existing, outside this task's scope; say if you want it folded (S) or filed.

## §3 Hotfix vs batch — **HOTFIX-sized, and I recommend it.** The regression is on real coaches; the fix is one file, one helper, no migration, no key, no FE change (the popup already sends `teacherId`); the smallest cherry-pick is the `scheduler.service.ts` hunk alone (+20/−24) plus the test file. It rides on `uat`'s deployed base (TASK-406…425) without the rest of the batch — nothing in the hunk references 428+ code. The human's call; if the batch ships within the day, the batch carries it.

## Break-and-watch — `mut436.mjs`, 8 mutations, **8 bite** (`try/finally`, sha-256 restore byte-identical)
A the move's pair dropped (the regression as shipped) · B the move sends on every move · C the helper tells the old coach only · D the recipients swapped · E the plan edit's pair dropped · F `teacherChanged` coupled to `override` · G the worker's context loses the student · H the title byte-changed.

🚫 No `uat` access; the outbox rows remain the owner's DATA REQUEST (they will show absence). ⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-22) — cause = the DOOR (suspect 3)
Re-run by me: **2718 pass / 0 fail** · tsc 0 · 50 = 50 · ONE `sendTeacherReassigned` (`:2967`) called from `applyPlanChange` (`:3241`) and `moveBooking` (`:3746`). Delivery and the gate cleared by value. So: not a broken notice — a door that never had one, which became the everyday door after TASK-424 put the rate box in the Move popup. Hotfix recommendation forwarded to Porter (the owner's call under the gate). The popup's missing notice-days gate ⇒ the owner's list.
