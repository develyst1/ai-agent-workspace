# REQ-005: Standalone teacher management (remove the ops teacher-sync dependency)
- Status: READY_FOR_SA
- Priority: HIGH
- Requested: 2026-07-20 by stakeholder (via Sober→Porter, DRAFT) — **re-scoped + promoted 2026-07-27**
- Deadline: **before the REQ-006 (ops-retired backoffice) re-deploy** — pre-deploy blocker
- Source: reworks REQ-003 (teacher onboarding/offboarding sync, currently ON HOLD) minus the
  cross-system ops sync. Trigger: REQ-006/TASK-027 retired the backoffice `ops` routes.

## Problem / Goal
Teacher management in the frontoffice — **add / edit / change-type / archive / reactivate** —
currently makes a **blocking** call to the backoffice `ops` teacher-sync API as part of each
operation. REQ-006/TASK-027 (2026-07-27) **retired all `ops` routes** (the backoffice now serves
only `/auth` + `/bo` on the shared `smart_scheduler` DB). As a result, every teacher operation now
hits a dead `/internal/teacher-sync/*` route → the call throws → the whole operation returns **502
and rolls back**. So once the ops-retired backoffice is deployed, **teacher management breaks**.

Goal: make teacher management **stand alone** — it must work without any dependency on the
backoffice ops teacher-sync, so staff can add/edit/archive/reactivate/change-type teachers reliably
with the new backoffice deployed (or the ops endpoints gone entirely).

## Requirement
1. Teacher **add / edit / change-type / archive / reactivate** must **succeed without depending on
   the backoffice ops teacher-sync** — no call that can hard-fail (502) or roll back the teacher
   operation because an ops endpoint is missing/unreachable.
2. The obsolete ops teacher-sync coupling must be **removed or made truly non-blocking** (a failure/
   absence must never surface as an error to the user or abort the DB transaction).
3. All **existing teacher behaviors must be preserved** exactly as built (REQ-003 / TASK-016): the
   "setup-incomplete" gate, not-bookable-until-money-is-set, archive-blocked-when-future-bookings-exist,
   change-type effective-dating, soft-archive keeps history + is reactivatable. Only the ops leg is removed.
4. **No orphaned / half-created records** in any failure path.
5. The result must work with the **backoffice offline / ops routes gone** (the target state after REQ-006).

## Acceptance Criteria
- [ ] With the ops-retired backoffice deployed (or ops unreachable / `OPS_API_URL` unset), teacher
      **add, edit, change-type, archive, reactivate** all succeed — **no 502, no rollback caused by ops**.
- [ ] The "setup-incomplete → not bookable", archive-blocked-when-future-bookings, and change-type
      effective-dating behaviors still work as before (no regression).
- [ ] No orphaned/partial teacher records after any operation.
- [ ] `GET /teachers/reconcile` (the ops drift report) either is removed/guarded or no longer 502s
      the caller when ops is gone (it must not throw an unhandled error).

## Constraints
- **Pre-deploy blocker** for the REQ-006 re-deploy — this must land first, or teacher management 502s.
- Verified break (Porter read-only code-check 2026-07-27): `createTeacher`/`updateTeacher`/
  `archiveTeacher`/`reactivateTeacher` at `smart-scheduler-back/src/services/scheduler.service.ts`
  ~lines 941 / 974 / 1003 / 1015 call `opsSyncOr502` → `/internal/teacher-sync/*`; `opsTeacherSync`
  in `src/lib/ops-client.ts:171` **throws even when `OPS_API_URL` is unset**, so blanking the env
  does NOT rescue it. `GET /teachers/reconcile` (`scheduler.service.ts` ~1100) 502s similarly.
- Under the new architecture the ops teacher-sync is **obsolete, not merely deferred**: freelance
  money is now a **local `bo.item`** in the shared `smart_scheduler` DB keyed by teacher id
  (REQ-006/TASK-024), so a separate ops "party" sync is no longer needed. (SA to confirm technically.)
- Backend stays source of truth; do not change unrelated teacher logic. HOW (delete vs feature-flag
  vs best-effort no-op) is the SA's design call.

## Production evidence (CONFIRMED 2026-07-28 — stakeholder deployed early + ran acceptance)
The build shipped to prod before this fix. Confirmed broken LIVE:
- `POST /api/teachers/:id/archive` → **502** (Cloudflare `origin_bad_gateway` — origin failed to
  respond, consistent with the dead ops teacher-sync call).
- **Switch active/inactive** → `PATCH /api/teachers/availability` → **500 INTERNAL** (`{code:"INTERNAL"}`).
  May share the ops root cause or be a separate bug — SA to diagnose; **both must be fixed**.
- `create` + `edit` teacher still work; core booking/freelance cap works; backoffice works.
⇒ Teacher **archive + activate/deactivate are broken in production right now** — this REQ is a **live
hotfix**, not merely a pre-deploy blocker.

## Out of Scope
- Any NEW teacher-management features (subjects-admin, new fields) — this REQ only removes the ops dependency.
- The REQ-006 backoffice re-deploy itself and TASK-028 (freelance drawdown idempotency) — separate items.
- Re-enabling REQ-003's cross-system sync (the whole point is to drop it).

## Questions
(SA Lead asks here; Porter answers as `> answer: ...`. Per stakeholder standing rule: if anything
is unclear or a business/scope question arises, write it here and route `@Porter` before building —
do NOT guess or decide it yourself.)

---
## ⚠️ REQ-005 "booking type OTHER (อื่นๆ)" — SA questions-first (Sober 2026-08-29)
> Note: the owner's actual 2026-08-29 request is **"การจองลงตาราง แบบ other (อื่นๆ)"** — a new booking type. (Filed
> here as the nearest REQ number Porter routed; Porter to confirm the canonical REQ id.)

**Grounded from code (what a new `OTHER` type would touch):**
- `booking_type` is a pg enum `FIRST_TRIAL · SINGLE_SESSION · COURSE_PACKAGE · VOUCHER` (`schema.ts:40`) — **no OTHER**.
  Adding it = a **migration** (enum alter) + a label (both dicts) + a cell colour/icon (REQ-052 token set).
- `createBooking` requires `courseId` for COURSE_PACKAGE and `voucherId` for VOUCHER; FIRST_TRIAL/SINGLE_SESSION are
  standalone. An OTHER would presumably be **standalone** (no entitlement) — but confirm.
- Day-end (`jobs.service`): FIRST_TRIAL/SINGLE_SESSION auto-attend + **post revenue at ATTENDED** (REQ-063/070). Whether
  OTHER posts revenue is the biggest unknown.
- Confirm sends a teacher LINE; an OTHER on the calendar would presumably show + notify — confirm.

**🔴 Owner questions (route via @Porter — do NOT invent a price or a rule, Porter's instruction):**
1. **What IS "other"?** A non-teaching block (meeting/holiday/maintenance)? A walk-in lesson with no package? A
   placeholder? The intent shapes every answer below.
2. **Charged?** Does OTHER post revenue at day-end when attended (like SINGLE_SESSION), or is it free / no-revenue? If
   charged, at what price (there is no card price for "other") — his number, not ours.
3. **Consumes an entitlement?** Standalone (like SINGLE_SESSION), or draws on a course/voucher?
4. **On the teacher's LINE schedule + a confirm LINE?** Or an internal-only calendar block?
5. **Day-end:** does auto-attend touch it (mark ATTENDED / consume quota), or is it inert?

**Until #1–#5 are answered, this stays a spec, not a build** — the answers decide the enum's behaviour, the migration,
and whether it's a revenue path (which we never guess). SA will cut BE+FE tasks once the owner responds.

### ✅ Owner's answers + PARK (Porter, 2026-08-29 — written into this file 2026-08-30)

> ⏸️ **PARKED by the owner**, not dropped: *"งานขนาดระดับนึง ก็ปล่อยไปก่อน มา deploy เรื่องนั้นก่อน"*
> These answers were only in `log/2026-08-29.md` until now. **They must not be re-asked.**

- **Q1 — what IS "other":** a **flexible booking the admin configures per instance** — charged **or not**,
  consumes a course/voucher **or not**, **with or without a student**.
- **Q3 (consumes) / Q2 (charged):** both are **per-instance choices**, not a fixed property of the type.
- **Q5 — day-end:** the **same rule as everything else** — unmarked ⇒ auto-attend at 23:30.
- **Q4 — teacher LINE:** not separately answered; follows from Q1 once the studentless-label answer below lands.

**🔴 Still owed by the owner, and blocking the build — do NOT invent either:**
- **(a) If charged, what price** — a typed amount, or a catalogue item? (There is no card price for "other".)
- **(b) What names the cell and the teacher's LINE line when there is no student.**
  *Porter's lean (his call, not mine): a short required title — "ประชุมทีม", "ปิดปรับปรุงลาน".*

**Canonical REQ id (@Sober asked):** while parked it **stays here, in REQ-005 §"booking type OTHER"**.
Renumbering a parked item costs board space for nothing; it gets its own REQ number the day he unparks it.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| REQ-005 | Standalone teacher management (rework REQ-003 minus ops sync) | **HIGH** | ✅ **DELIVERED** | **Live acceptance PASSED 2026-07-28** (stakeholder ran, Porter verified): teacher **archive** + **switch active/inactive** now return **200** (were 502/500); create/edit/reactivate OK. SPEC-007 / TASK-029 DONE & Sober-verified, deployed — teacher management is standalone (ops teacher-sync removed; availability routing fixed). |
```
