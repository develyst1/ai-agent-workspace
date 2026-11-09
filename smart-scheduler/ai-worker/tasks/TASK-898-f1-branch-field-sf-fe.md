# TASK-898: F1 Branch field in the front office (SF)
- Source: SPEC-099 §9 · DECISIONS row 20 · REQ-120 §5 F1 · final UI `pages/a/frontoffice/Branch.tsx` (*"the booking dialog gains a Branch field (default Bravo); the branch where the class happens, not a branch move"*) · Silver's REQ-5010 #7 answer (picked at create; a one-off in Move session; a whole course next to Change teacher) · REQ-5010 #7 wording **"Branch for Booking"**
- Owner: FE (Flash, Team C) · SA: Sector · Status: REVIEW (Flash, 2026-11-09; `BRANCH_LIVE = true` for the one SB+SF deploy; flag kept for rollback) · Depends on: none to build. SB already **accepts** an optional `branch` on create-course / create-voucher / create-booking / move / update-course (TASK-889 half 1, in the tree). It **stores** it only after TASK-889 half 2 + its migration, so until then a sent value is ignored and the DTO says BRAVO.
- Repo: `smart-scheduler-front` (SF). **Edit nothing until Porter's claim names these files for Team C** (requested 2026-11-09).
- **Base:** `node node_modules/typescript/bin/tsc --noEmit -p .` and the SF suite. Paste both first.
- Files (closed list; the shared ones are one block each):
  - `src/components/partials/Branch/**` (new: `BranchSelect` + labels);
  - `src/components/partials/Calendar/Modal/BookingModal.tsx` (the create form, and Move session if it lives there; say in step 0);
  - `src/components/partials/Bookings/CreatePlanFlow.tsx` (course/voucher sale);
  - `src/components/partials/Bookings/PlanModal.tsx` (a whole-course branch change, next to Change teacher);
  - `src/lib/i18n/dictionaries.ts` (one appended block);
  - the SF service/type files that build those bodies (name them in step 0).
- Git writes: none.

## What to do
0. **Step 0 (Implementation Notes, file:line):** where each of the four actions builds its request body (create booking, sale, move session, course edit), and where the DTO's `branch` can be shown.
1. **One `BranchSelect`:** "Branch" (EN) / "สาขา" (TH); options **Bravo** / **Other** (codes BRAVO / OTHER); default Bravo.
   - Thai for "Other": **ask me** (it goes to Porter). Use an English placeholder marked `PENDING (Porter)` until then.
2. **Where it appears:**
   - the booking create form (trial / 1 HR / OTHER);
   - the course and voucher sale;
   - **Move session** (this booking only);
   - **next to Change teacher** in the course plan (the whole course + its not-yet-attended sessions; SB decides which).
   - Each sends `branch` only when it differs from the current value (create: always).
3. **Show it:** the booking and course detail show the branch the DTO returns, read-only, where the final UI's `Branch.tsx` shows it. Show it only when it is not BRAVO, so today's screens don't change.
4. **Label (REQ-5010 #7):** the settings/explanation page title is "Branch for Booking" if SF has such a page. If it has none, nothing to do; say so.

## Definition of Done
- [ ] tsc 0 and the SF suite with no new fails (paste both).
- [ ] Screenshots of each of the four places with the select, Bravo by default; and one with Other chosen.
- [ ] **No sid write run:** creating a booking or course on sid is Tanya's (it can queue LINE). After TASK-889 half 2 deploys, her round covers it.
- [ ] `git status --porcelain`: only the listed files.

## Implementation Notes
**Step 0 DONE (Flash, 2026-11-09), read-only: nothing edited.** SF `dong` @ `d8f800c`; `git status --porcelain` shows only my own uncommitted `Payments/config.ts` + its test (TASK-876's live flip). SB `dong` @ `976cf33` read for the contract. `partials/Branch/` does not exist yet.

**What SB accepts (read from `smart-scheduler-back/src/validation.ts`, optional `BRANCH` = `BRAVO | OTHER`):** `createBooking` (l.214) · `createCoursePackage` (l.357) · `createVoucher` (l.444) · `moveBooking` (l.641, "THIS booking's branch only") · `updateCourse` (l.702, "the whole course + its not-yet-attended sessions"). DTOs carry it additively: `db/mappers.ts:217` (booking), `:331` (course), `:358` (voucher), each `branchOf(...)` = BRAVO | OTHER. So **today an SF value is accepted and ignored; the DTO says BRAVO**, as the TASK says.

**Where each action builds its body in SF (file:line):**
1. **Create booking** (trial / 1 HR / OTHER, and course/voucher single sessions): the body literal is `services/scheduler.service.ts:702` `api.post("/bookings", { … })` from `createBooking` (input type `CreateBookingInput`, `scheduler.service.ts:607`). The form is `components/partials/Calendar/Modal/BookingModal.tsx`: input assembled just above `handleSubmit` (`:1440–1450`), sent at **`:1466`** `create.mutateAsync(input)`. ⚠️ That literal is an explicit allow-list (the TASK-170 comment in it says so): a `branch` added to the type but not to the literal is silently dropped at the wire. (A second `CreateBookingInput` exists in `scheduler.mock.service.ts:400` for `NEXT_PUBLIC_USE_MOCK`.)
2. **Sale:** *course* = `scheduler.service.ts:927` `api.post("/courses", { … })` from `createCoursePackage` (`CreateCourseInput`, `:886`), built in `Bookings/CreatePlanFlow.tsx` `submitCreate` (`create.mutateAsync({ … })`, ~`:262–316`; where I already put the payment select). *Voucher* = `scheduler.service.ts:1002` `api.post("/vouchers", { … })` (`CreateVoucherInput`, `:987`), built in **`Bookings/CreateVoucherModal.tsx:79`** `create.mutateAsync({`. ⚠️ **The voucher sale is its own modal, not `CreatePlanFlow`.**
3. **Move session (this booking only):** `scheduler.service.ts:812` `api.patch("/bookings/:id", patch)` from `moveBooking` (`MoveBookingInput`, `:797`). It is built in **two** places: `Calendar/Modal/BookingModal.tsx:1042–1056` (`const patch: MoveBookingInput = {}` … `move.mutateAsync({ id: booking.id, patch })`), and `Bookings/PlanModal.tsx:955` (`useMoveBooking`) → `:1063` `move.mutateAsync({ id: target.session.id, patch: { teacherId: … } })` inside the plan editor's session-move dialog.
4. **Whole-course change (next to Change teacher):** the button is `PlanModal.tsx:499–504` (`t("plan.changeRest")`, `setChangeRestOpen(true)`; the dialog mounts at `:671`, file `Bookings/ChangeTeacherTimeDialog.tsx`, which posts `/courses/:id/change-teacher-time`). The branch is **not** part of that route: SB's `updateCourse` is `PATCH /courses/:id` with `{ branch }`, and SF already has a caller for that route with a different field (`scheduler.service.ts:957` `updateCourseRate` → `{ classRateMinor }`). So the whole-course change needs **one new service function** (`updateCourseBranch`, same route) and a small control next to the Change button.

**Where the DTO's `branch` is read (show it):** nowhere yet. `types/api/contract.ts` has no `branch` on `BookingDTO` (`:227`), `CourseSummary` (`:125`) or `VoucherSummary` (`:692`), and `lib/api/mappers.ts:11` `dtoToBooking` does not map it (its own comment: *"a field on the DTO reaches the UI only if it is mapped"*). So showing it needs: the field on those three DTO types, one mapped line in `dtoToBooking` (and the app `Booking` type), then a read-only line in the booking dialog (`BookingModal`) and the plan summary (`PlanModal` `SummaryBar`), only when not BRAVO.

**Files I would touch (names for the closed list):** new `partials/Branch/{BranchSelect.tsx,labels}`; `Calendar/Modal/BookingModal.tsx` (create form + Move session, **one block each**); `Bookings/CreatePlanFlow.tsx`; **`Bookings/CreateVoucherModal.tsx` (not in your list)**; `Bookings/PlanModal.tsx` (the Change-branch control next to Change teacher, and its session-move dialog if you want Move there too); `services/scheduler.service.ts` (`branch` in `CreateBookingInput` + its literal, `CreateCourseInput`, `CreateVoucherInput`, `MoveBookingInput`; new `updateCourseBranch`) ; `types/api/contract.ts` + `lib/api/mappers.ts` + `types/app/scheduler/index.ts` (the DTO field and its mapping); `lib/i18n/dictionaries.ts` (one appended block); `hooks/scheduler/useScheduler.ts` only if a new mutation hook is needed. **`scheduler.service.ts`, `contract.ts`, `useScheduler.ts` and `dictionaries.ts` are shared with other teams (`contract.ts` and `useScheduler.ts` and `scheduler.service.ts` were `M` in the dirty tree on 11-08)**: re-read each on disk right before editing and touch only my lines.

**REQ-5010 #7 label "Branch for Booking":** SF has **no** settings/explanation page with that title (grep for `branch for booking` / `สาขา` finds only Overview and its hook, and the dictionary, none a Branch page). Nothing to do; the final UI's `Branch.tsx` is the booking dialog with the new field, which is what the Branch select is.

**🟢 FLAG FLIPPED (Flash, 2026-11-09, on the plan change "one deploy with F1 whole"): `partials/Branch/config.ts:6` `export const BRANCH_LIVE = true;` (kept as the one-line rollback).**
- **Flag ON:** `tsc` → `tsc error TS: 0`; whole SF suite → **`1460 pass · 0 fail · 158 files`** (the 3 camp failures I saw an hour earlier are gone: Fanta's TASK-901 work settled). My two gate-pinning tests were updated to the new state (the "tree ships" test now expects `true`; the gate-off test passes `live: false`, i.e. a rollback). Nothing else changed.
- **One run with the flag OFF, today's screens unchanged** (`evidence/TASK-898/shoot-flag-off.mjs`; same real components + mock services, built with `BRANCH_LIVE = false`; `off-<w>-1-create-booking` · `-2-course-sale` · `-3-voucher-sale` · `-4-move-session` · `-5-plan`, 1280 and 375): the count of a "Branch" / "สาขา" label plus any `data-course-branch` / `data-branch-line` element was **`0` in all four places at both widths**, the plan modal still shows its Change-teacher button (`changeTeacherVisible: true`), `pageErrors: []`. The request bodies with the flag off are pinned by `branch-body-task898.test.ts` ("no branch given ⇒ nothing on the wire") and the callers send `undefined` when off. (The earlier whole-suite run with the flag OFF was `1449 pass · 1 fail`, the one fail being another seat's camp keys while they edited; the 5 fails you named were mine and are fixed, see below.)
- **Shots with the flag ON:** the four places, Bravo by default, plus one with Other chosen, at 1280 and 375, are the `1280-*` / `375-*` files listed below; still no sid write.
- ⚠️ **One place I did NOT follow your answer 2 (Move in both places):** the PlanModal session-move dialog. Evidence: for a **course** session that dialog sends the move through the plan-change route (`onPreviewApply` → `POST /courses/:id/plan`), and SB's schema for it takes no `branch` (only `moveBooking` and `updateCourse` do, `validation.ts:641/702`), so a select there would send a value SB ignores or refuses; its **voucher**-session branch (`move.mutateAsync`, `PlanModal.tsx:1063`) does reach `moveBooking`. The calendar's Move session (`BookingModal`) covers any booking, course sessions included. **Default I kept: Move session = `BookingModal` only. Say if you want the select on the plan editor's voucher-session move too (one block), or a plan-route `branch` from Brew (Question 8).**

**BUILT (Flash, 2026-11-09, after Porter's claim; Thai from the TASK). First built behind `BRANCH_LIVE = false`, then flipped (above).**
- **Base (before I edited):** `tsc` → `tsc base exit 0 errors: 0`; SF suite → `1435 pass · 0 fail · 155 files`. `git status --porcelain` before: only my own `Payments/config.ts` + its test (TASK-876's flip).
- **New:** `partials/Branch/{config.ts,BranchSelect.tsx,BranchLine.tsx,CourseBranchControl.tsx,api-sentence.ts}`, tests `Branch/branch-task898.dom.test.tsx` (9) and `services/branch-body-task898.test.ts` (7).
- **Shared edits (all small; `git diff --numstat`):** `CreatePlanFlow.tsx` `12 0` · `CreateVoucherModal.tsx` `11 1` · `PlanModal.tsx` `6 0` · `BookingModal.tsx` `19 1` · `useScheduler.ts` `7 1` · `mappers.ts` `2 0` · `scheduler.mock.service.ts` `4 0` · `scheduler.service.ts` `22 0` · `types/app/scheduler/index.ts` `7 1` · `types/api/contract.ts` (the `Branch` type + `BookingDTO.branch?`) · `dictionaries.ts` (one appended `branch` block: EN Branch / Bravo / Other, TH สาขา / Bravo / อื่นๆ, Porter's words). The "1 deleted" lines are import lines I extended.
- **Where it goes, per action:** (1) *create booking* → `BookingModal` create form: one select before the note, `branch` added to the body at `create.mutateAsync(BRANCH_LIVE ? { ...input, branch } : input)` (one place instead of the four `input` branches) and to the service literal (`scheduler.service.ts`, the TASK-170 trap). (2) *sale* → `CreatePlanFlow` (course; `branch` in `submitCreate`'s literal) and **`CreateVoucherModal`** (voucher). (3) *Move session* → `BookingModal` move form: select starts at the booking's own branch, `branch` is put in the patch **only when it differs**. (4) *whole course* → `CourseBranchControl` beside Change teacher in `PlanModal` (a select + Save, nothing fires on choosing; new `updateCourseBranch` = `PATCH /courses/:id { branch }`, new hook `useUpdateCourseBranch`; behind the existing `canPlan` key, no new `action:` literal). (5) *show it:* `Field "Branch" = Other` in the booking detail and `BranchLine` under the plan summary, both only when not BRAVO.
- **Gate off (the tree's state):** `BranchSelect` / `BranchLine` / `CourseBranchControl` render nothing; every body gets `branch: undefined` (create) or no key (move), so requests are byte-identical to before; nothing shown.
- **Checks, real output:**
  - `tsc` → `tsc error TS: 0`.
  - The files and guards that cover mine: `bun test src/lib/rbac src/lib/scheduler/wire-names.test.ts src/lib/api src/lib/i18n src/components/partials/Branch src/components/partials/Bookings src/services` → `198 pass · 0 fail · 25 files`.
  - **Whole suite → `1457 pass · 3 fail · 158 files`, and all 3 are another seat's in-progress camp work (TASK-901), not mine:** `camp-confirm-task901.dom.test.tsx` hands DOM nodes to matchers (TASK-596 guard, lines 103/111/115/132), a camp copy test (`camp 60 · nav.camp`), and an `action:` site-list sweep that moved while their files changed (it passes when I run it alone). They landed during my session (`CampConfirm/`, `Camp/`, `useCamp.ts`, `camp.service.ts`, `contract.ts` are `M`/`??` and not mine).
  - **Five repo guards failed on my first version and I fixed my code, not the guards:** (a) `mapper-drops.test.ts` pins the exact `CourseSummary` field set (16) and `dtoToBooking`'s declared drops → I removed the `branch` I had put on `CourseSummary` and `VoucherSummary` (nothing read them); (b) the `action:` site list (action-gate) → I reuse `canPlan` instead of a new `can("action:…")` literal; (c) `wire-names.test.ts` §A/§B parse the form/service literals and read a trailing comment `// TASK-898 (F1)` as a key `898`, hiding `note` → my comments in those two literals are now on their own lines.
  - **Mutation:** I deleted `branch: input.branch` from `createBooking`'s body literal and `POST /bookings … carries it` went red (`6 pass · 1 fail`); restored.
- **Screenshots in `evidence/TASK-898/`** (`shoot.mjs`; 1280 and 375; `<w>-1-create-booking` · `-2-course-sale` · `-2b-course-sale-other-chosen` · `-3-voucher-sale` · `-4-move-session` · `-5-plan-whole-course`): the REAL components in a scratch bun bundle outside the repo, the repo's mock services (`NEXT_PUBLIC_USE_MOCK=true` at build), `BRANCH_LIVE = true` **for this run only** (restored: `config.ts:6` `false`; junction removed). Results: `create.default`, `sale.default`, `voucher.default`, `move.default` all **`Bravo`**; sale after picking → **`Other`**; plan: Save disabled at start, a `Change teacher / time for the rest` button present, Save enabled after picking Other; `pageErrors: []`. Nothing was sent anywhere (no sid write; creating a booking or course on sid is Tanya's, after TASK-889 half 2).
- ⚠️ Scratch-page caveats: the mock plan has no `status`, so the plan demo seeds `status: "ACTIVE"` into the plan query (a real active course carries it) to make the action row appear; the Payment card in that screenshot shows a 404 because the scratch page has no payments back end (TASK-876's real service).
- `UNVERIFIED`: that SB stores/returns the branch (TASK-889 half 2); keyboard walk, hit targets, reduced-motion, `/impeccable audit` (not run); a real round trip.

**Decided differently from step 0 (evidence, internal):**
1. **Move session lives only in `BookingModal`.** The plan editor's session move (`PlanModal.tsx:1063`) sends a course session through the plan-change route (`/courses/:id/plan`), which SB's schema does not give a `branch` (only `moveBooking` and `updateCourse` do); and a calendar Move on any booking, course sessions included, already goes through `PATCH /bookings/:id`. So adding it to the plan editor would send a field SB refuses or ignores.
2. **`branch` is typed on `BookingDTO` only** (plus the optional field on the two plan summaries), not on `CourseSummary` / `VoucherSummary`: see guard (a).
3. **The whole-course control cannot read the course's current branch from the plan today** (SB's plan summary does not send `branch`; `plan.summary.branch` is typed optional and read when present). So its select starts empty and Save is open for any choice, and the read-only line under the plan summary shows nothing until SB sends it (Question 7).

## Questions
1. **`CreateVoucherModal.tsx` is not in the closed list, but it is the voucher sale.** `CreatePlanFlow` only sells courses. Default: I add the Branch select to `CreateVoucherModal.tsx` too (one block), and the claim needs that file.
2. **Move session is in two places** (`BookingModal` for a calendar booking, `PlanModal` for a course session). Default: **both**, because a one-off move of a course session happens in the plan editor. Say if only the calendar one is wanted.
3. **Showing the branch needs the DTO field mapped** (above): three types in `contract.ts`, `dtoToBooking`, the app `Booking` type — shared files. Default: add them, additions only, and show the branch read-only only when it is not BRAVO.
4. **Whole-course change:** default = a small "Branch" control beside Change teacher in `PlanModal`, calling `PATCH /courses/:id { branch }` (new `updateCourseBranch`). SB says it moves the course's not-yet-attended sessions; the screen says nothing more than the field.
5. **Thai for "Other"** (TASK step 1: ask). Until Porter answers: `PENDING (Porter)`, English placeholder "Other" in the Thai dictionary. ("Bravo" has no translation: a name.)
8. **NEW — Move session in the plan editor** (see the ⚠️ above): `BookingModal` only, or also the plan editor's voucher-session move, or a `branch` on SB's plan-change body? Default: `BookingModal` only.
7. **NEW — SB's plan summary does not carry `branch`.** `getEntitlementPlan` (course and voucher plans) has no `branch` (SB sends it on `toCourseWithStudent` / the booking and voucher DTOs, `db/mappers.ts:217/331/358`). Without it the plan modal can neither show a non-Bravo course's branch nor preselect the whole-course control. **Default: I read `plan.summary.branch` when present (typed optional). Ask Brew to add `branch` to the course and voucher plan summaries (one field each) so both start working at the flip.**
6. **Gate.** Like TASK-876, SB only *stores* a branch after TASK-889 half 2 + its migration, and until then a sent value is ignored and the DTO says BRAVO. So a Branch select that shows on a screen but does nothing would mislead the admin. Default: ship it behind a one-line `BRANCH_LIVE = false` in `partials/Branch/config.ts` (select hidden, nothing sent), and flip it with the deploy, the same way as `PAYMENTS_LIVE`. Tell me if you would rather it shows from the start.

## Review

## Review

**Claim GRANTED (Porter, 2026-11-09; board line written). Start now.** No other team is editing SF right now. Re-read each shared file on disk first anyway.
**Thai (Porter, PM wording):** "Branch" = **สาขา** · "Other" = **อื่นๆ** (the app already uses อื่นๆ for the other-type booking) · "Bravo" stays **Bravo** (the branch's proper name). No `PENDING` placeholder is needed.

**Answers (Sector, 2026-11-09 01:10). They're your defaults, kept.**
1. Yes, add `CreateVoucherModal.tsx` (one block). I've asked Porter to add it to the claim.
2. Move goes in **both** places: `BookingModal` and the `PlanModal` session-move dialog.
3. Yes: the DTO `branch` field goes in `contract.ts`, `dtoToBooking` and the app `Booking` type, additions only. Show it read-only, and only when it isn't BRAVO. The service/type files (`scheduler.service.ts`, `contract.ts`, `lib/api/mappers.ts`, `types/app/scheduler/index.ts`, plus `useScheduler.ts` if you need a hook) are going onto the claim with Porter. Touch only your own lines.
4. Yes: a small Branch control beside Change teacher, and a new `updateCourseBranch` that calls `PATCH /courses/:id { branch }`.
5. Answered above (สาขา · อื่นๆ · Bravo).
6. **Yes, and it's now the deploy plan.** Put `BRANCH_LIVE = false` in `partials/Branch/config.ts`. With it off:
   - no select is shown;
   - no `branch` goes into any body;
   - the read-only display stays hidden.

   SF then deploys **today** with Am.3 + 875 + 876, before Bob's 889 half 2. The flag flips when 889 half 2 plus its migration deploy.

**🔴 FIRST, before anything else on 898: make the SF tree green with the flag off, within about 1 hour.**
- The SF suite is at 1430/5 fails (the mappers / CreateVoucher form-key checks). Fix or finish whichever of your hunks cause them.
- Paste the suite (0 new fails over your base) and `tsc` 0.
- Show that with `BRANCH_LIVE = false`, the four screens look exactly as they did before.
- Then report to me. The deploy waits on that report. The screenshots with the flag on can come after it.

**Claim additions GRANTED (Porter, 2026-11-09; additions only; board line updated):** `Bookings/CreateVoucherModal.tsx` (one block) · `services/scheduler.service.ts` · `types/api/contract.ts` · `lib/api/mappers.ts` · `types/app/scheduler/index.ts` · `hooks/scheduler/useScheduler.ts` (if needed). Re-read each on disk first; touch only your own lines.

**🔀 Deploy plan changed (Porter, 2026-11-09): one SB+SF deploy, after 889 half 2.** 889 half 2 is accepted and 0076 is on sid, so F1 is whole on the SB side. **Decision [SA-decided]: `BRANCH_LIVE = true` in this deploy.**
- Keep the flag in `partials/Branch/config.ts`, so a rollback is a one-line flip.
- Your report needs:
  - the SF suite with 0 new fails and tsc 0, **with the flag ON**;
  - plus one run with the flag OFF, showing today's four screens unchanged.
- Screenshots: the four places (Bravo by default) plus one with Other chosen, at 1280 and 375. Use the fake/mocks; still no sid write run.

## Review (Sector, 2026-11-09): ✅ DONE
- **Re-run by me** (the SF tree as it will ship, Fanta's 901 included): **1460 pass · 0 fail**; `tsc` 0. `Branch/config.ts:6` reads `BRANCH_LIVE = true`.
- The four places, read-only display only when not BRAVO, and the voucher sale in `CreateVoucherModal`, are all as the answers asked. The flag-OFF run shows today's screens unchanged, which makes it a real one-line rollback. Shots at 1280 and 375. The five repo guards were satisfied by fixing the code, not the guards. Good.
- **Q8 accepted: Move session stays in `BookingModal` only.** The plan editor's course-session move goes through `/courses/:id/plan`, which takes no branch, and the calendar Move covers every booking.
- **Q7: next round (deploy freeze).** Adding `branch` to SB's course/voucher plan summaries is an SB change. Until then the whole-course control starts empty and the plan line shows nothing, which is acceptable for this deploy. I'll cut it after the deploy.
- Security review: a closed enum in the request body, existing `canPlan` gate, no new route, no personal data. **None.**
