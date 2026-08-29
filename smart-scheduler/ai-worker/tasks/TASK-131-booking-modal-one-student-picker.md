# TASK-131: Booking modal — unify the Course/Voucher student picker into one Combobox field
- Source: SPEC-039 (REQ-043)
- Status: DONE (code — SA-reviewed Sober 2026-08-16); visual/interaction pass (AC-1/AC-5 render, 375/768/960, hallmark) → @Tanya via Porter
- Assignee: @Fern (FE)
- Depends on: none

## Context (why)
On the New-booking modal (`smart-scheduler-front/.../Calendar/Modal/BookingModal.tsx`, `CreateForm`)
the student picker looks like two different screens: Trial/Single = one `<StudentSelect>` combobox
(search + add-new); Course/Voucher = a `<TextInput>` server-search **above** a separate `<Select>`.
Owner wants **one control, same on all four tabs** (REQ-043 — the unfinished half of REQ-029 item 3).
Presentation only; **no BE change, no behaviour change**.

## What to do
1. **New component `src/components/common/EligibleStudentSelect.tsx`** — mirror `StudentSelect.tsx`'s
   single Mantine `Combobox` shape (one input, type-to-filter, results in the same field), but:
   - Props: `{ type: "COURSE_PACKAGE" | "VOUCHER"; value: string | null; onChange: (entKey: string | null) => void; label?; required?; }`
     — `value` is the **entitlement key** (`courseId`/`voucherId`), not a student id.
   - Typing → `useDebouncedValue` → `useEligibleStudents(type, /*enabled*/ true, q)` (the **server**
     search — this is what matches parent phone; do NOT use client-side `searchable`).
   - Options = eligible rows mapped with the **existing** `entKey(e)` (value) and `eligibleLabel(e)`
     (label). **Lift `entKey` + `eligibleLabel` out of `CreateForm`** into a shared spot (e.g.
     `src/lib/scheduler/eligible.ts`) and use them from both places — one definition, so AC-3's
     multi-course label (subject · used/size · expiry, TASK-121/125) can't drift.
   - **No add-new option** (out of scope — a student with no entitlement can't be booked here).
   - Explicit states: loading; **no match** → `No matching student`; **nobody eligible** →
     `No student has a course yet` / `No student has a voucher yet`. Never a silently blank dropdown.
2. **In `CreateForm`**, in the `usesEligible` branch, replace the `<TextInput>` (eligibleSearch) +
   `<Select>` (entitlement list) pair with a single
   `<EligibleStudentSelect type={isCourse ? "COURSE_PACKAGE" : "VOUCHER"} value={entitlementId} onChange={setEntitlementId} required />`.
   - Keep everything else in that branch unchanged: the voucher **program** `Select`, the `ContextCard`s,
     the teacher/time row, badges.
   - Remove the now-orphaned `eligibleSearch` / `debouncedEligible` state **only after grepping** that
     nothing else reads them (the eligible query's `q` now comes from the new component). If `CreateForm`
     still needs the selected row for the ContextCard, keep deriving `selectedEligible` from
     `entitlementId` as it does today.
3. **Trial/Single branch:** do not restructure — `StudentSelect` is already the target pattern. Only
   align the visible label/placeholder wording so both read as the same control.
4. **Wording** via `t(...)` (add to `dictionaries.ts`; reuse existing keys if present):
   - Course/Voucher placeholder: TH `พิมพ์ชื่อ ชื่อเล่น หรือเบอร์ผู้ปกครอง` / EN `Search by name, nickname or parent phone`
   - Trial/Single placeholder: TH `พิมพ์ชื่อ ชื่อเล่น หรือเบอร์ผู้ปกครอง / เพิ่มนักเรียนใหม่` / EN `Search by name, nickname or parent phone / add new`
   - No match: TH `ไม่พบนักเรียนที่ตรงกัน` / EN `No matching student`
   - Nobody eligible (course): TH `ยังไม่มีนักเรียนที่มีคอร์ส` / EN `No student has a course yet`
   - Nobody eligible (voucher): TH `ยังไม่มีนักเรียนที่มีบัตร` / EN `No student has a voucher yet`
   Any *new* user-facing string beyond these → back to Porter first.

## Definition of Done
- [ ] All four tabs present the student picker as **one field** (type-to-filter, pick fills it); no tab
      shows a separate search box stacked above a separate list. (AC-1)
- [ ] Course/Voucher search still matches **name · nickname · parent phone** (server-side via
      `useEligibleStudents` `q`) — verified a parent-phone query still returns the student. (AC-2, no REQ-024 regression)
- [ ] A student with **2** courses still shows **distinguishable** rows (subject · used/size · expiry)
      and booking the second books the second. (AC-3)
- [ ] Trial/Single **add-new inline** still works. (AC-4)
- [ ] A tab with nobody eligible shows the empty-state wording, not a blank dropdown. (AC-5)
- [ ] Booking end-to-end on all four tabs writes the **same** payload as before (voucher program/subject
      included) — check the `input` objects are unchanged. (AC-6)
- [ ] `bunx tsc --noEmit` = 0 · `bun run build` ok · no orphaned state/imports left by the swap.
- [ ] FRONTEND-STANDARD holds (no inline hex / `transition-all`; one token source; instant focus ring).
- [ ] Self-run `hallmark audit` on the modal; paste the verdict + a note on each AC into Implementation Notes.

## Implementation Notes
**Fern 2026-08-18 — repo `smart-scheduler-front@dong`, uncommitted (5 files).**

### What changed
| File | Change |
|---|---|
| `src/lib/scheduler/eligible.ts` | 🆕 the lifted `entKey(e, type)` + `eligibleLabel(e, type, all)` — **one** definition, shared by the new component and `CreateForm`'s selected-row lookup. The TASK-121/125 comments moved with the code. `all` (the list the row came from) is what tells the label a student is multi-course. |
| `src/lib/scheduler/eligible.test.ts` | 🆕 8 pure tests pinning the label rules — see AC-3 below. |
| `src/components/common/EligibleStudentSelect.tsx` | 🆕 the one-Combobox picker: `useDebouncedValue(300)` → `useEligibleStudents(type, true, q)` (**server** search), options = `entKey`/`eligibleLabel`, no add-new, explicit loading / no-match / nobody-eligible states. |
| `…/Calendar/Modal/BookingModal.tsx` | the `usesEligible` branch's `<TextInput>`+`<Select>` pair → one `<EligibleStudentSelect>`. Removed `eligibleSearch`/`debouncedEligible` state, the local `entKey`/`eligibleLabel`, `eligiblePlaceholder`, and the now-unused `TextInput`/`Search`/`useDebouncedValue` imports. **−45 lines net.** |
| `src/lib/i18n/dictionaries.ts` | `noMatchStudent` added (EN+TH); `noCourseStudents`/`noVoucherStudents`/`eligibleSearchPlaceholder`/`student.searchPlaceholder` re-worded to REQ-043's owner-approved copy; the now-orphaned `pickCourseStudent`/`pickVoucherStudent` deleted from both dicts. No string invented beyond the REQ's list. |

### One design decision worth your eye (the only place I deviated from the task's letter)
The task offered "keep deriving `selectedEligible` from `entitlementId` as it does today" — I did, which means **two
queries** now: the component holds the *searched* one (`q`), `CreateForm` keeps an *unsearched* one purely as the
superset it resolves the selected row from (ContextCard + payload). **I checked that this is safe rather than assuming
it:** `GET /students/eligible` is **unpaged by design** — `smart-scheduler-back/src/services/scheduler.service.ts:502`
says paging it "would silently truncate". So a row found by search is always present in the unsearched list. Had it
been paged, this shape would have silently produced a `null` payload on a searched pick, so it is written into the code
as a comment. The alternative (component hands the row back through `onChange`) would widen the prop contract you
specced — say the word and I'll switch.

### DoD — what I verified, and what I could not
- ✅ **AC-3 (distinguishable rows) — executable proof.** `bun test src/lib/scheduler/` → **15 pass / 0 fail** (8 new).
  Pinned: single-course label stays clean (`Pole · Surfskate (1/4)`), the **same** student with 2 courses gets the
  expiry appended on **both** rows and they are asserted `not.toBe` each other, two **different** students each with
  one course get **no** expiry, a subject-less course omits the subject rather than inventing one, voucher rows stay
  name-only, nickname preferred over name.
- ✅ **AC-6 (same payload).** The payload block is **untouched** — `selectedEligible` still feeds `studentId`/
  `studentName`/`courseId`/`voucherId` exactly as before; the diff in that region is zero. Verified by reading the
  diff, not by inference.
- ✅ **AC-2 (server-side search preserved).** The component drives `useEligibleStudents`'s `q` — no Mantine local
  `searchable` anywhere in it. ⚠️ **The parent-phone half is not provable locally**: the mock has no phone column
  (`scheduler.mock.service.ts:261` matches name+nickname only, flagged there by whoever wrote it). Phone search needs
  the real API — a QA line, same as previous rounds.
- ✅ **AC-4 (Trial/Single add-new).** `StudentSelect` untouched; only its placeholder string changed.
- ✅ `bunx tsc --noEmit` = **0** · `bun run build` **ok** (16 routes, standalone copied) · no orphaned state or imports
  (greps in the table above).
- ✅ **FRONTEND-STANDARD §3.5** on all three changed/new source files: inline hex **0** · `transition-all` **0** ·
  `font-family` **0** · arbitrary `z-[` **0**. Focus ring is Mantine `InputBase` — the same control the shipped
  `StudentSelect` uses, so §3.3 is inherited, not re-introduced.
- 🔴 **AC-1 · AC-5 · responsive 375/768/960 · `hallmark audit` verdict — NOT verified. I could not mount the modal.**
  I ran the app **locally in mock mode** (`NEXT_PUBLIC_USE_MOCK=true`, API forced to a dead port), logged in, and the
  calendar rendered — but the New-booking modal **never mounts**: `.mantine-Modal-root` exists with **empty**
  `innerHTML`. The browser pane here is not displayed, so no frames composite and Mantine's `Transition` (rAF-driven)
  never completes. **Same limitation Fern reported on 2026-08-01 and 2026-08-04** — it is the harness, not the code.
  I did a **code-level** hallmark pass instead (no card-in-card, no hover-only affordance, no new colour/type language
  — the change strictly *removes* a control and reuses a shipped pattern), but **a code-level pass is not the audit the
  DoD asks for and I am not going to write a verdict I did not see.** Q1 below.

### ⚠️ Environment hazard found while doing this (not part of the task, reporting because it is dangerous)
`smart-scheduler-front/.env.local` on this machine has `NEXT_PUBLIC_API_URL` **and** `AUTH_URL` pointing at
**`https://frontoffice.develyst.online`** — the customer-facing box. Starting the dev server and hitting a protected
route **redirected my browser onto the production login page**. I entered nothing and submitted nothing, navigated away
immediately, and re-ran with all three URLs overridden to localhost for the rest of the session. Flagging it because
anyone doing local FE work here will silently point at prod, which the PROTOCOL forbids; the file is the owner's, so I
did not edit it.

## Questions
- **Q1 (blocking the last 3 DoD boxes, not the code):** the `hallmark audit` + responsive 375/768/960 + AC-1/AC-5
  empty-state checks all need the modal **rendered**, which I cannot do from this session (above). Do you want to
  (a) accept the code review now and route the visual/interaction pass to **@Tanya** via Porter as a QA line, or
  (b) hold TASK-131 in REVIEW until someone can drive it in a composited browser? I'd rather you choose than have me
  quietly tick three boxes on a code read.
- **Q2 (non-blocking):** I deleted `booking.pickCourseStudent` / `booking.pickVoucherStudent` — they were the old
  `Select`'s placeholders and have no remaining reader. Say if you'd rather keep dictionary keys around.
- **Q3 (sequencing, yours):** you told me to run 131 → 132 → 133 on the shared `BookingModal.tsx`. 131 is now in your
  hands; do I start **TASK-132** (voucher time Select) on top of this uncommitted working tree, or wait for your
  review so 132 doesn't build on something you may send back?
  > **answer (Sober): proceed with TASK-132 on top of this tree.** 131's code is accepted (below) — I'm not sending it
  > back; the only thing outstanding is a rendered pass I can't do either, so 132 won't be building on shifting sand.
  > 132 touches the **voucher branch** (different region of `CreateForm` than 131's picker swap) → no conflict. Then
  > **TASK-133** (PlanModal — a different file, independent). Keep it all uncommitted on `dong`; commit on the owner's
  > word (same as TASK-130), so one review-passed batch lands together.

## Review
**PASS ✅ (code — Sober 2026-08-16). Final REVIEW→DONE rides @Tanya's rendered pass.** Reviewed against SPEC-039 + DoD;
reproduced, not trusted.
- **Reproduced:** `bunx tsc --noEmit` = **0** · `bun test src/lib/scheduler/eligible.test.ts` = **8/0** · FE-standard
  greps (`bg-[#` / `transition-all` / `font-family`) on all 3 changed/new files = **0** · orphan grep
  (`eligibleSearch`/`debouncedEligible`/`pickCourseStudent`/`pickVoucherStudent` in BookingModal) = **none** (clean removal).
- **Faithful to the spec:** `entKey`/`eligibleLabel` lifted to `lib/scheduler/eligible.ts` (one definition; TASK-121/125
  multi-course logic preserved and unit-pinned — AC-3). `EligibleStudentSelect` mirrors `StudentSelect`'s single
  Combobox, drives `useEligibleStudents`'s **server** `q` (no local `searchable` — AC-2 parent-phone path intact),
  no add-new, and distinguishes **loading / no-match / nobody-eligible** (AC-5 logic present). Payload block untouched
  (AC-6). `StudentSelect` only re-worded (AC-4).
- **The two-query design decision: accepted.** Fern kept `CreateForm`'s unsearched `useEligibleStudents` to resolve
  `selectedEligible` for the ContextCard/payload, and **verified** (not assumed) that `GET /students/eligible` is
  unpaged by design (`scheduler.service.ts:502` "would silently truncate"), so a searched pick is always in the
  superset — written as a code comment. Sound; the minor cost (a second query) is worth not widening the prop contract.
- **Q2 (deleted orphaned dict keys):** approved — they had no remaining reader.
- 🔴 **Not verified, and correctly NOT ticked (AC-1 one-field render · AC-5 empty-state render · 375/768/960 · hallmark
  verdict):** these need the modal composited, which this headless session can't mount (the known 08-01/08-04 harness
  limit — Mantine `Transition` needs frames). Good call refusing to write a verdict you didn't see. **Routing to @Tanya
  via Porter** for the rendered pass — same pattern as TASK-128's visual confirm. Code is done; the interaction/visual
  gate is QA's.

**Verdict: code DONE. REQ-043 closes when Tanya's rendered pass confirms AC-1/AC-5 + the hallmark verdict.**

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-131 | scheduler-front (FE): unify the Course/Voucher student picker into ONE `Combobox` field (new `EligibleStudentSelect` → `useEligibleStudents(type,enabled,q)`; replace the two-box TextInput+Select; lift `entKey`/`eligibleLabel` to shared; empty/no-match states; wording keys) — presentation only, no BE, no payload change | SPEC-039 (REQ-043) | ✅ **DONE (code — SA-reviewed Sober 2026-08-16)** · visual/interaction pass → @Tanya. Reproduced: tsc 0 · `bun test src/lib/scheduler/` 15/0 · §3.5 greps 0 · orphan-removal clean. Faithful to SPEC-039 (lifted `entKey`/`eligibleLabel`, server `q`, no add-new, empty/no-match/loading states, payload untouched). Two-query design accepted (eligible endpoint is unpaged by design → searched pick always in superset; verified not assumed). 🔴 **AC-1/AC-5 render · 375/768/960 · hallmark NOT verifiable headless** (modal won't composite) → **routed to @Tanya via Porter** (same as TASK-128). Q3 answered: Fern proceeds TASK-132 then 133 on this tree; commit `dong` on owner's word. · _prior:_ 🖥️ REVIEW (Fern 2026-08-18 — 5 files, uncommitted on `dong`. New `EligibleStudentSelect` (one Combobox → **server** `useEligibleStudents` `q`, no local `searchable`); `entKey`/`eligibleLabel` lifted to `lib/scheduler/eligible.ts` + **8 new pure tests** pinning AC-3 (same student ×2 courses → expiry appended on both, asserted distinguishable; different students → no expiry; subject-less course omits rather than invents). Payload block **untouched** (AC-6 = zero diff there). `bunx tsc --noEmit` **0** · `bun run build` ok · `bun test src/lib/scheduler/` **15/0** · §3.5 greps 0/0/0/0. Orphaned `eligibleSearch`/`debouncedEligible`/`eligiblePlaceholder` + `TextInput`/`Search`/`useDebouncedValue` imports removed; `pickCourse/VoucherStudent` keys deleted. 🔴 **AC-1 · AC-5 · responsive · hallmark verdict NOT verified** — the modal will not mount in this session's hidden browser pane (`.mantine-Modal-root` empty; rAF transition needs compositing), the same limitation reported 2026-08-01/08-04. **Q1 to Sober: accept the code review + route the visual pass to QA, or hold?** Q3: start TASK-132 on this tree or wait?) | Fern | — |
```
