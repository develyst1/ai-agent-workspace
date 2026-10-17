# TASK-805 — BE: **`GET /api/subjects` — every ACTIVE program, so the teacher form can offer one nobody teaches yet** (REQ-121, LIVE) — @Jason (S ≈ 0.5 day incl. +10 percent)
**From @Sober to @Jason, 2026-10-15.** Source: `requirements/REQ-121-teacher-form-cannot-offer-an-unassigned-program-duo.md`. Pair: `TASK-806` (Fern, front). **HOLD until @Porter grants the claim below — I will say GO in your inbox.**

## The mechanism (confirmed by me, read-only, back `be2b34f` / front `89774a9`)
- The teacher form's Subjects picker is the **union of subjects already on some teacher** (front `partials/Teachers/TeachersContent.tsx:61-67`). A program on nobody is never offered ⇒ the admin cannot assign it ⇒ DUO's Program dropdown (`lib/scheduler/duo.ts`, `CreatePlanFlow.tsx:99,458`) stays empty.
- **The back serves no all-programs list.** The nearest is `GET /sellable-packages` (`scheduler.service.ts:2121`), and it is the wrong source:
  - gated `read(CAL_BOOK)` (`route-access.ts:133`) — an admin with the Teachers menu but not the booking menus gets 403;
  - it lists programs **per price package**; `unpricedSubjects` carries no `kind`. It answers "what can be sold", not "what can be taught".
- **Saving is already fine:** `updateTeacher` / `createTeacher` (`scheduler.service.ts:4744-4815`) insert whatever ids are sent, and keep inactive links the client cannot see (TASK-173). **No change there.**

## Build
1. **Service:** `listSubjects()` beside `getSellablePackages` → `{ subjects: { id, name, kind }[] }`, **`active = true` only**, ordered by name. `kind` = `s.kind ?? "PRIVATE"` as `getSellablePackages` does (TASK-437).
2. **Route:** `GET /subjects` in `routes/api.ts` (read-only, no body/query).
3. **Access:** `"GET /subjects": read(TEACHERS)` in `lib/route-access.ts` — the Teachers menu only. Do not widen it to other menus.
4. **Contract:** the response type in `types/contract.ts`; `openapi/document.ts` only if the route-coverage tests require it (say which).

## 🚫 Not this task
- No change to `updateTeacher` / `createTeacher`, `GET /teachers`, `mappers.ts`, `getSellablePackages`, or any DUO / course picker.
- **No data fix, no seed, no script** (owner: *"ไม่เอา ให้เขาไปใส่เองสิ"* — the customer ticks it herself).
- Never against sid/uat; live proof is Tanya's.

## ✅ Done means
- Tests: the route returns **all active** programs incl. one assigned to **no** teacher and both DUO kinds; an **inactive** program is absent; `kind` is right; a viewer with only `menu:teachers` gets 200, one without it 403.
- A mutation set (`scripts/mutation/…task805.mutations.json` with its `tests` list): at least — drop the `active` filter · drop `kind` · widen/narrow the access line · return only assigned subjects. **Each must bite.**
- tsc 0 · full suite DB-unreachable, every setting blanked (the SAFE line) · **counts** · `unhandled-between-tests: N`.
- `git diff` touches only the claimed files. Nothing committed.

## ✅ Claim (Team A, pending @Porter's grant)
back `src/services/scheduler.service.ts` (one new function) · `src/routes/api.ts` (one route) · `src/lib/route-access.ts` (one line) · `src/types/contract.ts` (one type) · `src/openapi/document.ts` (only if required) · new `src/…task805*.test.ts` · `scripts/mutation/…task805.mutations.json`.

---
## ⏸️ 2026-10-15 — Jason (BE) → @Sober: TASK-805 BUILT — ONE existing pin turns red and it is OUTSIDE my claim. I stopped; need your grant for 1 line.
**Built (inside the claim; back base `be2b34f`, nothing committed):**
- `src/services/scheduler.service.ts` — `listSubjects()` beside `getSellablePackages`: `select {id,name,kind} from subjects where active = true order by name asc` → `{ subjects: [{ id, name, kind: kind ?? "PRIVATE" }] }` (no teacher join ⇒ a program nobody teaches is included).
- `src/routes/api.ts` — `GET /subjects` (read-only, no body/query). `src/lib/route-access.ts` — `"GET /subjects": read(TEACHERS)` (Teachers menu only).
- `src/types/contract.ts` — `SubjectListItemDTO { id; name; kind: "PRIVATE" | "DUO" }` + `SubjectListResponse { subjects }`. **Shape exactly as written for Fern.** `openapi/document.ts` NOT touched: no route-coverage test needed it (it carries neither `/sellable-packages` nor `/catalog-items`).
- NEW `src/lib/subjects-list-task805.test.ts` (6) + `…mutations.json` beside it (the repo keeps every set beside its test; the brief's `scripts/mutation/…` path is where only the runner lives).
**Proof:** the answer incl. an unassigned DUO program, null kind→PRIVATE, inactive absent, name order · at the QUERY (the condition rendered: `"subjects"."active" = $1` params `[true]`; order `name asc`; only id/name/kind selected) · the door by value through the root app: only `menu:teachers` ⇒ 200, booking menus only ⇒ 403, nothing ⇒ 403. **Mutation set 7/7 BITE** (active filter · kind · door→booking · door widened · only-assigned (the bug) · order · route gone), checksum identical. tsc 0 · migrations 70=70.
**Suite: 4,709 pass / 1 fail.** The 1 = `subject-kind-req095-13-4a.test.ts:82` (TASK-437): *"no third reader: the `{ id, name, kind: … ?? "PRIVATE" }` subject shape is built in exactly these two places"* counts that literal in `scheduler.service.ts` and expects **1**; `listSubjects` is a deliberate second one there (by design — it IS a new reader of programs) ⇒ **2**.
- **Ask (outside my claim):** grant me `src/lib/subject-kind-req095-13-4a.test.ts` line 82 only: `toBe(1)` → `toBe(2)`, and its comment to name TASK-805's `listSubjects` as the third reader (the pin's intent — no UNLISTED reader — stays). I will not touch it until you say so. *(Alternative if you prefer: I reshape `listSubjects` to avoid the literal — I advise against; that dodges the pin instead of answering it.)*
▶️ **Ball: Sober — grant (or refuse) the 1-line re-aim; then I finish with the full-suite counts.**

---
## ✅ 2026-10-15 — Jason (BE) → @Sober: TASK-805 DONE — the pin re-aimed (granted), B8 proves it still guards `kind`. Nothing committed.
- **The re-aim (`src/lib/subject-kind-req095-13-4a.test.ts`, nothing else in it):** the `scheduler.service.ts` builder count `toBe(1)` → `toBe(2)`; the comment now names `GET /subjects` (`listSubjects`, TASK-805) as the LISTED third reader and says a builder that drops `kind` falls out of the count; the describe title names the three readers (picker mapper · /sellable-packages · GET /subjects) and "no unlisted subject reader". The mapper count (1) and every by-value assertion untouched.
- **Porter's condition proved — B8** (in the 805 set, whose `tests` now lists this pin file too): drops the `kind` key from `listSubjects`. Run **against the TASK-437 pin ALONE** (a one-off set, deleted after): `B8 BITES (10 pass / 1 fail vs baseline 11)` — so the pin itself goes red; in the full set B8 fails 2 (the pin + my own test).
- **Set 805: 8/8 BITE** (B1 active filter · B2 kind constant · B3 door→booking · B4 door widened · B5 only-assigned (the bug) · B6 order · B7 route gone · B8 kind key dropped), baseline 17, CHECKSUM identical.
- **SAFE suite (DB unreachable, every setting blanked): 4,710 pass / 0 fail, 349 files · unhandled-between-tests: 0 · tsc 0 · migrations 70 = 70.**
- **`git status --short -uall` (back):** ` M src/lib/route-access.ts` · ` M src/lib/subject-kind-req095-13-4a.test.ts` · ` M src/routes/api.ts` · ` M src/services/scheduler.service.ts` · ` M src/types/contract.ts` · `?? src/lib/subjects-list-task805.mutations.json` · `?? src/lib/subjects-list-task805.test.ts` — exactly the claim + the granted pin; `openapi/document.ts` untouched.
- Contract for Fern, unchanged: `GET /api/subjects` → `{ subjects: [{ id, name, kind: "PRIVATE" | "DUO" }] }`, active only, by name, Teachers menu only.
▶️ **Ball: Sober — verify → owner commit. Live proof is Tanya's, not mine.**

---
## ✅ 2026-10-15 — @Sober: TASK-805 VERIFIED (one cosmetic fix requested, see below)
**My own run on a clean copy:** `be2b34f` (git archive) + the 7 changed files (`git status --short -uall`), node_modules junction, own git.
- **tsc 0.**
- **SAFE suite 4,710 pass / 0 fail**, 349 files, `unhandled-between-tests: 0`.
- **Set 805: 8/8 BITE**, baseline 17, every restore byte-identical.
- **Porter's condition, proven by hand:**
  - B8 applied alone (`kind` dropped from `listSubjects`), then only `subject-kind-req095-13-4a.test.ts` run: **10 pass / 1 fail**, line 83 *Expected 2, Received 1*.
  - So the TASK-437 pin still fails when either builder drops `kind`.
- **Diff read:** the claim files + the granted pin only; `openapi/document.ts` untouched.
- **🔧 Cosmetic, before commit:**
  - in `src/types/contract.ts` the two new interfaces sit **between** `TeacherTypeOrderResponse`'s JSDoc ("GET/PATCH /api/teachers/type-order …") and that interface;
  - so the doc comment now attaches to `SubjectListItemDTO`;
  - fix: move the 3 new lines **above** that JSDoc block. Types only, so tsc is the re-check.
**Boundary:** unit level, DB unreachable. The route has not been seen against a real DB or on sid; that is Tanya's after the deploy.

---
## ✅ 2026-10-15 — Jason (BE) → @Sober: TASK-805 doc-comment fix done — my two interfaces moved above `TeacherTypeOrderResponse`'s doc comment in `contract.ts` (nothing else); tsc 0, 805 test 6/6.

## ✅ 2026-10-15 — @Sober: the cosmetic fix is checked
The two interfaces now sit above the `TeacherTypeOrderResponse` JSDoc (diff read) · tsc 0 · `git status` = the same 7 files. **TASK-805 is fully VERIFIED.**
