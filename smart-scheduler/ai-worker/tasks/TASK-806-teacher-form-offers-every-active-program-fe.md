# TASK-806 — FE: **the teacher form's Subjects picker reads `GET /api/subjects`, so a program nobody teaches can be ticked** (REQ-121, LIVE) — @Fern (S ≈ 0.5 day incl. +10 percent)
**From @Sober to @Fern, 2026-10-15.** Source: `requirements/REQ-121-teacher-form-cannot-offer-an-unassigned-program-duo.md`. Pair: `TASK-805` (Jason, the route). **HOLD until @Porter grants the claim below — I will say GO in your inbox.** You may build against the contract below before 805 lands; the shape is fixed.

## The mechanism (confirmed by me)
`partials/Teachers/TeachersContent.tsx:61-67` builds `subjectCatalog` as the **union of `subjectOptions` across the roster**. A program on no teacher (uat: both DUO programs; sid: "Duo SURFSKATE") is never offered, so the admin cannot assign it, so New course → DUO → Program stays disabled.

## Contract (TASK-805)
`GET /api/subjects` → `{ subjects: { id: string; name: string; kind: "PRIVATE" | "DUO" }[] }` — active programs only, by name. Access: the Teachers menu.

## Build
1. A query hook (beside `useSellablePackages` in `hooks/scheduler/`, or its own file) for `GET /subjects`.
2. `TeachersContent.tsx`: `subjectCatalog` = that list → `{ value: id, label: name }`. **Remove the union and its comment.** Both Add and Edit get the same catalog (one prop, `TeacherFormModal.tsx:139`).
3. While the list loads or fails, the form must not silently save a shortened selection — the Edit seed (`TeacherFormModal.tsx:42`) is the teacher's own `subjectOptions`, so ticked values stay; just make sure an unloaded catalog does not drop them from the MultiSelect (Mantine drops values not in `data`). If it does, union the teacher's own options into `data`.
4. The mock layer (`lib/mock/…`) answers the route if the app runs on mocks.

## 🚫 Not this task
- No change to any course / DUO picker (`subjectsFor`, `CreatePlanFlow`, `CreateCourseModal`, `ImportBalanceModal`, `PlanModal`, `BookingModal`) — §13.4a stays: other pickers still hide DUO.
- **No new copy.** The hint *"Pick from existing subjects"* stays as is (approved strings are never improved). If you think it now misleads, tell me; do not change it.
- Never against sid/uat; live proof is Tanya's.

## ✅ Done means
- Tests: the picker offers a program assigned to **no** teacher (a DUO one); an existing teacher's ticked programs stay ticked while the list is loading; after the list loads, saving sends exactly the ticked ids.
- A mutation set (`…task806.mutations.json`, with `tests` or say the `--tests` file): at least — revert to the roster union · drop the loading guard. **Each must bite.**
- `npx tsc --noEmit` 0 · `bun test` counts · `bun run build` green · `unhandled-between-tests: N`.
- `git diff` touches only the claimed files. Nothing committed.

## ✅ Claim (Team A, pending @Porter's grant)
front `src/components/partials/Teachers/TeachersContent.tsx` · `TeacherFormModal.tsx` (only if step 3 needs it) · one hook in `src/hooks/scheduler/` · `src/lib/api/…` client/mapper line for the route · `src/lib/mock/…` (only if mocks need it) · new tests · the mutation set.

---
## 📋 @Fern REPORT — 2026-10-15 — 🔨 BUILT, ready for @Sober (claim granted; nothing outside it touched)
(Re-read the front repo first: `TeachersContent.tsx:61-67`, `TeacherFormModal.tsx`, `hooks/scheduler/usePricing.ts` for the pattern.)
**Built (contract = `GET /subjects` → `{ subjects: { id, name, kind: "PRIVATE"|"DUO" }[] }`, as fixed in the TASK):**
1. NEW `src/hooks/scheduler/useSubjects.ts` — `useSubjects()` (cached 5 min) + `getSubjects` (the `api.get("/subjects")` and, on mocks, `MOCK_SUBJECTS`). **Said plainly:** the claim named "one hook" and a "`lib/api` client/mapper line"; the response needs no mapping, so the fetch sits in the hook file beside the query (no `services/` file added, nothing in `lib/api`). Imported directly from `@/hooks/scheduler/useSubjects` — I did NOT touch the barrel `index.ts`.
2. `TeachersContent.tsx` — `subjectCatalog` = the list → `{ value: id, label: name }`; **the roster union and its comment are removed.** Add and Edit get the same one prop (`TeacherFormModal`'s `subjectCatalog`).
3. `TeacherFormModal.tsx` — **step 3 needed a change:** Mantine's MultiSelect drops a value that is not in `data`, so while the catalog loads (or fails) an Edit would have shown NO ticks. The teacher's OWN `subjectOptions` are now always merged into `data`; the ticks live in `subjectIds` (seeded from them) and that is what Save sends, so a still-loading list neither hides nor drops them.
4. `lib/mock/data.ts` — `MOCK_SUBJECTS` (all mock programs + one DUO, `Duo Surfskate`, that no mock teacher has).
**Words:** none touched. The hint *"Pick from existing subjects"* stays; it is still true (every ACTIVE program is "existing"), so I don't think it misleads — your call, I did not change it.
**Tests** `Teachers/teacher-form-subjects-task806.dom.test.tsx` (4, clicked on the real Teachers page): ADD offers the DUO program assigned to NO teacher (exactly Bike · Skate · Duo SURFSKATE) · EDIT offers the same list · EDIT with the catalog **still loading**: both own programs shown ticked and Save sends exactly `[s1,s2]` · EDIT after load, ticking the DUO one too: Save sends exactly `[s1,s2,s9]`.
**Mutations** `scripts/mutation/task-806.json` (`{tests, mutations}`, tests = that file, baseline 4/0, CHECKSUM identical): J1 revert to the roster union — **BITES** 1/3 · J2 loading guard dropped (own programs not kept in `data`) — **BITES** 3/1 · J3 DUO filtered out of the catalog — **BITES** 1/3 · J4 Edit not seeded from the teacher (Save would wipe them) — **BITES** 2/2.
**Verification:** tsc 0 · `bun test` **1174 pass / 0 fail, 133 files** · **unhandled-between-tests: 0** · build 0. `git status`: 3 modified (`TeacherFormModal.tsx`, `TeachersContent.tsx`, `lib/mock/data.ts`) + 3 new (the hook, the test, the set). Nothing committed; nothing run against sid/uat.
⚠️ **Until Jason's TASK-805 route is live** the real build gets a 404 from `/subjects`: the picker would offer only each Edit teacher's own programs (and nothing on Add). Ship the two together.
**BALL: @Sober.**

---
## ✅ 2026-10-15 — @Sober: TASK-806 VERIFIED
**My own run on a clean copy:** `89774a9` (git archive) + the 6 changed files, node_modules junction, own git.
- **tsc 0.**
- **`bun test` 1,174 pass / 0 fail**, 133 files, `unhandled-between-tests: 0`.
- **Set `task-806`: J1–J4 4/4 BITE.** J1 is the roster union (the bug itself); J3 is DUO filtered out, which would leak the §13.4a rule into this form.
- **`bun run build`: exit 0**, run in the real front tree, because Turbopack refuses a junctioned `node_modules` (see SYSTEM-FACTS). `git status` was identical before and after.
- **Diff read:** within the claim. `TeacherFormModal.tsx` was needed for step 3, as the TASK allowed. Hooks are called before the page's early return. The other pickers are untouched. No copy changed.
- **The hint stays.** I agree with Fern: *"Pick from existing subjects"* is still true.
**Boundary:** DOM tests only, on mocks. The two halves have not been seen together against a real back; that is sid, with Tanya.
