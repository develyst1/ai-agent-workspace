# TASK-132: Voucher booking — let staff choose the session time
- Source: SPEC-040 (REQ-048)
- Status: DONE (code — SA-reviewed Sober 2026-08-16); visual pass → @Tanya; Q1 copy + Q2 seed → @Porter
- Assignee: @Fern (FE)
- Depends on: none (shares BookingModal.tsx with TASK-131/133 — sequence to avoid merge churn)

## Context (why)
On the New-booking modal (`smart-scheduler-front/.../Calendar/Modal/BookingModal.tsx`, `CreateForm`)
the voucher tab has **no time control** — it shows a read-only Alert and the payload's `startTime` is
pinned to the clicked cell (`createSlot.time`). Staff want to choose the voucher session time. The
backend already accepts any in-schema `HH:mm` time for a voucher — this is FE-only.

## What to do
In the `isVoucher` branch of `CreateForm`:
1. Replace the read-only time `<Alert>` (~L870-878) with the **same** time `<Select>` the course branch
   uses (~L891-898): `label={t("booking.time")}`, `data={TIME_SLOTS.map((s) => ({ value: s, label: s }))}`,
   `value={startTime}`, `onChange={(v) => setStartTime(v ?? "")}`, `allowDeselect={false}`, `searchable`.
   Reuse the existing control; **do not** use a free-text time input (the `TIME_SLOTS` Select keeps
   voucher times within 09:00–18:00, which the BE does not enforce).
2. Keep the voucher's teacher as the clicked column (`createSlot.teacherId`) — no teacher Select (domain
   rule: voucher can't pick a teacher). Keep the short info line that there's no teacher choice; only
   the time becomes selectable.
3. Read the chosen time in the voucher payload + validity:
   - `startTime: createSlot.time` → `startTime` (~L686)
   - validity `!!createSlot.time` → `!!startTime` (~L677)
4. `startTime` state already exists (~L572) and resets in `changeTab` (~L646) — reuse it.

## Definition of Done
- [ ] On the Voucher tab, staff can pick the session time from the standard slots; the booking is
      created at the chosen time (not forced to the clicked row). (AC: the REQ's core)
- [ ] Voucher **program** pick (SPEC-026) still required and unchanged; voucher **exclusions**
      (REQ-027) still applied; expiry/remaining still enforced (BE) — all untouched.
- [ ] A taken slot is refused with the **existing** `SLOT_TAKEN` message (reuse the `detect` pre-check /
      existing wording — no second phrasing).
- [ ] Teacher still = the clicked column (no teacher Select added to the voucher branch).
- [ ] `bunx tsc --noEmit` = 0 · `bun run build` ok · no orphaned state/imports.
- [ ] FRONTEND-STANDARD holds; self-run `hallmark audit`, paste verdict + AC notes into Implementation Notes.

## Implementation Notes
**Fern 2026-08-18 — `smart-scheduler-front@dong`, uncommitted (stacked on TASK-131's tree, per your Q3 answer).**

### What changed (one file + 2 dict keys)
1. **`BookingModal.tsx`, `isVoucher` render branch** — the read-only `<Alert>` became an Alert **+** the standard
   time `<Select>`: `label={t("booking.time")}`, `placeholder={t("booking.pickTime")}`, `data={TIME_SLOTS…}`,
   `value={startTime}`, `onChange`, `allowDeselect={false}`, `searchable`, `required`. **The same control the course
   and trial branches use** (AC-6) — no free-text input, so voucher times stay inside 09:00–18:00 (the BE does not
   enforce that window; the `TIME_SLOTS` Select is what does).
2. **Payload** — `startTime: createSlot.time` → `startTime`.
3. **Validity** — `!!createSlot.time` → `!!startTime`.
4. **Teacher untouched** — still `createSlot.teacherId`, no teacher Select added. The domain rule is "a voucher can't
   pick a **teacher**"; it never said anything about the time, and that reasoning is now a comment in the file.
5. `startTime` state + its `changeTab` reset were already there and are reused — no new state.

### DoD / AC
- ✅ **AC-2 (clash refused with the EXISTING wording).** Traced `handleSubmit`: the `detect` pre-check reads
  `input.teacherId/date/**startTime**` — so it now checks the *chosen* time, and a hit renders the existing
  `booking.blockedTitle/blockedDesc` block. **No second phrasing introduced.** Verified by reading the call site,
  not assumed.
- ✅ **AC-3/AC-4/AC-5 (regressions).** The voucher **program** `Select` (SPEC-026), the `voucherAllowsSubject`
  exclusion filter (REQ-027/TASK-106) and the `ContextCard` remaining/expiry line are **byte-for-byte untouched** —
  the diff in that region is zero. Economics/expiry are BE, unchanged.
- ✅ **AC-6 (same control as other tabs)** — literally the same `Select` shape; the only difference is the added
  `placeholder` REQ-048 asked for.
- ✅ `bunx tsc --noEmit` **0** · `bun run build` **ok** · `bun test src/lib/scheduler/` **15/0** · §3.5 greps on the
  file: hex **0** · `transition-all` **0** · `font-family` **0** · `z-[` **0** · no orphaned key (`voucherNoSlot` has
  zero readers left and was removed from both dictionaries).
- 🔴 **AC-1 rendered + responsive + `hallmark audit` — NOT verified, same blocker as TASK-131**: the modal will not
  mount in this session's non-compositing browser pane. Wiring is verifiable by code; "staff can actually pick 11:00
  and the booking lands at 11:00" is a **rendered** claim and I'm not ticking it on a read. Rolls into the same
  @Tanya visual pass you routed for 131.

### 🔴 One thing I could not do without writing copy — please route Q1
`booking.voucherNoSlot` read *"A voucher booking doesn't pick a teacher **or fixed time** — it uses this slot:
{teacher} · {time}."* After this change that sentence is **false on screen** — the time is now a choice. REQ-048
supplies the field label and placeholder but **no replacement for the teacher line**, and SPEC-040 says only "keep the
informational line that a voucher has no teacher pick". Leaving the old string would ship a lie; so I wrote a **draft**
and am flagging it rather than quietly shipping copy:
- EN `A voucher booking doesn't pick a teacher — this session is with {teacher}.`
- TH `การจองด้วยวอยเชอร์ไม่เลือกครู — คาบนี้จะเรียนกับครู {teacher}`
(new key `booking.voucherNoTeacherPick`; `pickTime` = REQ-048's own `Select a time` / `เลือกเวลา`.)

## Questions
- **Q1 (needs Porter, via you):** approve or replace the two draft sentences above. It is a *replacement* for copy that
  this change made untrue, not new decoration — but it is still user-facing copy and per SPEC-039/§ wording rules that
  is Porter's, not mine. The build ships the draft in the meantime.
- **Q2 (a real tension between REQ and SPEC — your call, I followed the SPEC):** REQ-048 Requirement 4 says Porter
  *"would rather have an empty, deliberate choice"*, while SPEC-040 says **keep the seed** (`startTime` starts at the
  clicked cell's time) "for fewer clicks unless Fern finds it confusing". I kept the seed as specced. I don't find it
  confusing — but it means a voucher saved without touching the field still lands on the clicked row, which is
  *exactly* the behaviour the owner complained about, just now editable. If Porter's lean wins, it's a one-line change
  (`useState("")` for the voucher path) — tell me and I'll do it.
- **Q3 (scope, not asked but worth stating):** REQ-048 Requirement 2 wants clashing slots **"not offered, or refused
  with a reason"**. SPEC-040 chose *refused* (the existing `detect`), so the Select lists all nine slots including
  taken ones. That satisfies the REQ as written; if the owner expects taken slots to be *greyed out*, that is a
  different (and bigger) change — flagging so nobody discovers it at acceptance.
  > answer (Sober): **as-specced is accepted** — refused-on-submit satisfies REQ-048 R2. Greying out taken slots needs
  > per-teacher/per-day availability in the Select (a bigger change) → I've flagged it to Porter as a *possible*
  > follow-up so it isn't a surprise at acceptance; not building it now.

## Review
**PASS ✅ (code — Sober 2026-08-16). Visual pass rolls into @Tanya's TASK-131 render pass.** Reproduced, not trusted.
- **Reproduced:** `bunx tsc --noEmit` **0** · `bun test src/lib/scheduler/` **15/0** · §3.5 greps on BookingModal
  **0** · `voucherNoSlot` fully removed (no orphan). Confirmed the code by reading it: voucher branch now renders the
  standard `TIME_SLOTS` `<Select>`; payload `startTime: startTime` (was `createSlot.time`), validity `!!startTime`
  (`:649/:661`); teacher untouched (`createSlot.teacherId`). Faithful to SPEC-040.
- **AC-2 verified at the call site** (not assumed): `detect` reads the chosen `startTime`, and a hit renders the
  existing `blockedTitle/blockedDesc` — no second phrasing. AC-3/4/5 regions byte-for-byte untouched. AC-6 = same control.
- 🔴 **AC-1 rendered / responsive / hallmark not verifiable headless** (same modal-won't-composite limit) → @Tanya.
- **Q1 (voucherNoTeacherPick copy) → @Porter.** The old string became false (it claimed "or fixed time"); Fern wrote a
  faithful **draft replacement** and shipped it rather than a lie — the right call. It IS user-facing copy, so Porter
  approves/replaces the final wording (UX-writer hat). Good catch; not a code defect.
- **Q2 (seed vs empty) → @Porter, non-blocking, my rec = keep the seed.** Real REQ-vs-SPEC tension Fern surfaced
  honestly: REQ-048 R4 leans empty-deliberate; SPEC-040 kept the seed. My reasoning: a *default* to the clicked cell is
  not the old *pin* — the field is now editable, and staff clicked that exact slot deliberately, so seeding it is lower
  friction. But it's Porter's UX lean on record, so his call; the build ships the seed meanwhile and flipping it is one
  line. **Verdict: code DONE**; final wording (Q1) + the seed decision (Q2) are Porter's, neither blocks the merge.
