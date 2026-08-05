# TASK-099: scheduler-front (FE) — the SHARED plan-modal component (used by both create & after-purchase)
- Source: SPEC-028 §6, §7, §8 (REQ-030 Req 6 & 8)
- Status: REVIEW (Fern 2026-08-03 — built against the DONE 097/093/095 contracts; see Implementation Notes)
- Depends on: TASK-097 (DTO), TASK-093 (`applyPlanChange`), TASK-095 (`GET /slots/availability`)
- Assignee: @Fern (smart-scheduler-front)

## What to build — ONE component, two modes (owner: "same modal, create vs update")
This is the **bulk** of the FE work and is reused by the purchase flow (TASK-098, create mode). Build it as a
single plan-modal component driven by a `mode: "create" | "edit"` prop:
- **The plan table** — rows of date·time·teacher·subject·status; the **derived end date** updates live.
- **Per-session editing** — change teacher/day/time; each edit shows the **availability + clash view** from
  `GET /slots/availability` (who's free at that slot, whose booking clashes) — needed in *both* modes.
- **mark planned absence** (extends), **insert a make-up** (contracts); attended sessions read-only.
- **Voucher variant** — no append/contract; sessions booked against hours + hours remaining.
- Every action (edit mode) calls the shared `applyPlanChange` (TASK-093). **On refusal, show the server's exact
  reason** (busy teacher, ceiling full, too-late teacher change, over-ceiling extend) — never silently drop it.

**Edit mode** entry point: the Bookings ▸ Courses + leave card → open one child's entitlement (course or voucher).

## Definition of Done
- [ ] Component renders + edits a plan (course and voucher) in **edit** mode from the entitlement card.
- [ ] The availability/clash view works at slot selection and is the same code the create flow will use.
- [ ] mark-absence extends, insert contracts, derived end updates; attended rows read-only; refusals show reasons.
- [ ] Cleanly exposes a **create** mode (renders a passed-in generated plan, confirm hook overridable) so TASK-098
      is a thin wrapper, not a second modal.
- [ ] tsc clean; build ok. Measure new shared-row controls at 1600/1280/768/375 (board STANDING RULE).

## Implementation Notes
Repo: `smart-scheduler-front` (port 3016; tree current — synced 2026-08-03). Built the ONE shared plan-modal
(`mode:"edit"|"create"`) against the DONE contracts (097 DTO · 093 `applyPlanChange` · 095 availability),
confirming exact wire shapes from the backend before writing.

**Data layer**
- `types/app/scheduler/index.ts` — `EntitlementPlan`/`PlanSession`/`Course|VoucherPlanSummary`/`SlotAvailability`/
  `PlanChange` (1:1 with backend) + `isDeliveredStatus` (ATTENDED/NO_SHOW → read-only).
- `services/scheduler.service.ts` + `scheduler.mock.service.ts` — `getEntitlementPlan` (`GET /entitlements/:id/plan`),
  `applyPlanChange` (`POST /courses/:id/plan`), `getSlotAvailability` (`GET /slots/availability`) + mock stubs.
- `hooks/scheduler/useScheduler.ts` — `useEntitlementPlan`, `useApplyPlanChange` (→ `invalidateAll`),
  `useSlotAvailability` (gated until date+time chosen). i18n `plan.*` (en + th).

**Component** `components/partials/Bookings/PlanModal.tsx`
- Summary bar: course size/leave/owed OR voucher hours-remaining, + the server-derived `liveEndDate` (updates
  live via refetch — no client re-derivation). Session table: date·time·teacher·subject·`StatusChip`;
  **delivered (ATTENDED/NO_SHOW) rows read-only**. Per-row **Edit** (move) + **Mark absence** (course only);
  **Insert** make-up (course only).
- **`SessionEditor`** (the surface create reuses): date/time/teacher/subject + the **availability+clash view**
  (`useSlotAvailability`: free / NO_BUDGET / BOOKED-with-owner). Submit routes **course move/insert/mark-absence
  → `applyPlanChange`**; **voucher move → existing `moveBooking`** (voucher is course-less; `/courses/:id/plan`
  runs course reconcile, so a voucher session move is the plain per-session move — no append/contract, per §7).
  **Refusals show the server's exact reason** in a red Alert.
- **Create mode**: renders a passed `initialPlan` + overridable `onConfirm(sessions)` → TASK-098 is a thin wrapper.
- Entry point: **"Manage plan"** on each course card (`CoursePackagePanel`) + a Manage column on the voucher table
  (`VoucherPanel`); `BookingsContent` lifts `planId` and renders `<PlanModal>`.

**Verification**
- `bunx tsc --noEmit` → **exit 0**; `bun run build` → **exit 0** (`/scheduler/bookings` prerenders).
- ⚠️ **Live render + the 4-width STANDING-RULE measurement NOT executed** — `/scheduler/bookings` is NextAuth-
  gated and redirects to the **sid server** login (`som.develyst.online`, a real env); mock mode doesn't bypass
  NextAuth and I won't log into a real environment. **Did not authenticate.** Reflow-safe patterns used (editor
  selects `Group grow wrap="wrap"`; plan table `Table.ScrollContainer minWidth={560}`). 🔴 **The one real
  shared-row change to measure is the voucher table's new "Manage" column at 375** — please fold into acceptance,
  or tell me how to reach the page locally (e.g. the TASK-090 QA cookie) and I'll produce the numbers.

## Questions
(Fern asks; Sober answers as `> answer: ...`)
- **Voucher edit path — confirm.** `POST /courses/:id/plan` is course-scoped, so voucher session moves go through
  the existing **`moveBooking` (`PATCH /bookings/:id`)** — the plain move §7 describes ("no append/contract"). Is
  that the intended voucher path, or is there a voucher plan endpoint?
- **Layout measurement** couldn't run here (auth gate to sid). Point me at a supported local path and I'll produce
  the 1600/1280/768/375 numbers for the new voucher column before acceptance.
- **NO_SHOW label** — the FE `BookingStatus`/`bookingStatus.*` dict may omit `NO_SHOW`; `StatusChip` would show
  the raw key (rows are read-only regardless). Add `NO_SHOW` to the enum+color+dict as a small follow-up?
- Built against 097/093/095 — all DONE now (095's rework verified 2026-08-04); started per your "099 is a go".

## Questions — answered
- **Voucher edit path** → **✅ YES, `moveBooking` (PATCH /bookings/:id) is the intended voucher path.** SPEC-028 §7:
  a voucher has no recurrence, so a session move is a plain per-session move — **no append/contract**. There is no
  voucher plan endpoint by design; `/courses/:id/plan` is course-scoped (runs the size reconcile) and correctly is
  NOT used for vouchers. Confirmed in your code (`PlanModal.tsx:322-324`, the `else` branch). Correct.
- **Layout measurement (auth gate to sid)** → **not your blocker; routes to @Tanya's acceptance.** You're right not
  to log into a real env. The one shared-row change — the voucher table's new **"Manage" column at 375** — goes to
  Tanya via her dev-session-cookie (TASK-090), the only role wired to reach the painted page. Your reflow-safe
  patterns (`Table.ScrollContainer minWidth={560}`, `Group grow wrap`) are the right mitigation. Flagged to @Porter
  for the acceptance round; not held.
- **NO_SHOW label** → **✅ yes, add it** — `NO_SHOW` is now a real status shown in the plan table (and TASK-105 made
  cancel/no-show visible), so the raw-key fallback would show. Small: add `NO_SHOW` to the FE `BookingStatus`
  enum + color + `bookingStatus.*` dict. Fold into this task before ship, or a tiny follow-up — your call; it's
  cosmetic (rows read-only) but visible, so please don't let it ship as a raw key.

## Review
**Verdict: DONE ✅ (code/contract level) — one small polish (NO_SHOW label) + layout-measure routed to QA.**
Sober, 2026-08-04. Read `PlanModal.tsx` + the service/hook wiring; ran **`bunx tsc --noEmit` → exit 0** myself
(build 0 per Fern).
- **One shared component, `mode:"edit"|"create"`** — create mode renders a passed `initialPlan` + overridable
  `onConfirm`, so TASK-098 is a thin wrapper (not a second modal). ✅ Matches the "same modal, create vs update".
- **Course** move/insert/mark-absence → `applyPlanChange` (the atomic gate); **voucher** move → `moveBooking` (plain,
  no reconcile) — the §7 distinction, correct. **`planned:true`** on mark-absence (`:210`).
- **Delivered (ATTENDED/NO_SHOW) rows read-only** via `isDeliveredStatus`; **refusals show the server's exact
  reason** (`ApiClientError.message` in a red Alert) — no dead buttons.
- **`liveEndDate` comes from the server** and refetches live — no client re-derivation (SPEC-028 §4). Summary bar
  branches course (size/leave/owed) vs voucher (hours-remaining).
- Entry points wired on the course card + voucher table; `BookingsContent` lifts `planId`.
**This unblocks TASK-098** (the create wrapper). Solid work — it's the FE long pole and it lands clean.

## Post-review polish (Fern 2026-08-04 — the 3 small opens from Sober's DONE + Tanya's TEST_PASSED)
- **NO_SHOW label** (Sober's "before ship") — added `NO_SHOW` to the FE `BookingStatus` (app **and** contract,
  kept in lockstep), `BOOKING_STATUS_COLOR` (danger), and `bookingStatus.NO_SHOW` (en "No-show" / th "ไม่มาเรียน").
  `StatusChip` now renders it instead of the raw key.
- **OBS-4 (raw `13:00:00`)** — plan table time now `s.startTime.slice(0,5)` → `13:00`.
- **DEF-1 (voucher "Manage" column unreachable at 375)** — wrapped `VoucherPanel`'s table in
  `Table.ScrollContainer minWidth={640}` → it scrolls instead of clipping, so the Manage button (the only
  phone-width entry to the plan modal) is reachable; **also fixes the pre-existing Status-column clip Tanya noted**.
- Verified: `bunx tsc --noEmit` 0 · `bun run build` 0. ⚠️ The 375 re-measure is still @Tanya's (auth gate); this
  is the fix she should see reproduce as *reachable*. OBS-3 (insert@owed=0) stays @Porter's call (BE behaviour).
