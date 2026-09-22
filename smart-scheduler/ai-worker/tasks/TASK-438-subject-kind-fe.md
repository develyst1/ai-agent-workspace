# TASK-438 — `REQ-095 §13.4a` FE (SPEC-089 A): the DUO Program dropdown lists `kind === 'DUO'` subjects only; the Private dropdown hides them; the two 400s rendered

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-22) · **Size S.** Against TASK-437's contract once CONFIRMED (I paste the final lines into §0). Pure parts now; wire after Jason's report. After TASK-435.

## §0 The contract — CONFIRMED 2026-09-22 (TASK-437)
`teacher.subjectOptions[]` (the ONE mapper every program picker renders) and `GET /sellable-packages`'s `subjects[]` gain `kind: "PRIVATE" | "DUO"`. The DUO create's Program dropdown = `kind === "DUO"` only; every OTHER course picker = `kind !== "DUO"`; single-session / trial pickers UNCHANGED (a walk-in DUO hour is a designed sale — the rule is about courses). The server answers `400 NOT_A_DUO_SUBJECT` / `400 DUO_SUBJECT` on a course-create mismatch (envelope, Thai message). No RBAC change; no name-prefix rule anywhere.

## §1
- **Pure (`lib/scheduler/duo.ts`), value-tested:** `subjectsFor(subjects, duoOn)` — `duoOn` ⇒ only `kind === 'DUO'`; else only `kind !== 'DUO'` (a subject without `kind` — an older payload — counts as PRIVATE).
- **The create flow (`CreatePlanFlow`):** the Program dropdown reads `subjectsFor`; toggling DUO on/off clears a selection that is no longer in the list (pinned); the DUO card pricing unchanged (`priceGroupFor(true)`).
- **Anywhere else a subject is picked for a COURSE** (the course edit? the search filters?) — walk and say; the Bookings-page filters keep showing every subject (they filter, they don't create).
- The two 400s render the server's sentence (no code-switching), copy both languages if a client hint is added, counted.
- 🚫 No name rule anywhere (pinned by scan: no `startsWith("Duo")`/`/duo/i` on a subject name in `src`).

## Definition of Done
- [ ] Suite, **count** · tsc · build ok · `subjectsFor` by value (both modes; the missing-`kind` case) · the toggle clears · the scan pin · 🔑 Break-and-watch, `finally`, CHECKSUM · report here + `inbox/SA.md` + log.


---

## §2 ✅ IMPLEMENTED — Fern, 2026-09-22. **The DUO create's Program dropdown lists DUO subjects only; every other COURSE picker hides them; one pure `subjectsFor`; no name rule (scan-pinned).**

```
bunx tsc --noEmit → exit 0
bun test          →  536 pass / 0 fail   (was 533; +3 — new lib/scheduler/duo-subjects.test.ts)
bun run build     → ok
git status        →  6 source modified (duo.ts · scheduler types · contract.ts · CreatePlanFlow · ImportBalanceModal · CreateCourseModal) · 1 new
```
Built to §0 (TASK-437). No key. 🚫 No deploy asked.

- **Pure (`lib/scheduler/duo.ts`):** `subjectsFor(subjects, duoOn)` — `duoOn` ⇒ `kind === "DUO"` only; else the rest; a
  subject without `kind` counts as PRIVATE (mutation 2); order kept; a DUO-*named* PRIVATE subject stays private —
  the kind decides, never the name (mutation 3). Types: `SubjectOption.kind?`, `SubjectRef.kind?` (optional — older
  payloads); the ONE mapper (`subjectOptions: dto.subjects`) carries it unchanged.
- **`CreatePlanFlow`:** the Program dropdown reads `subjectsFor(…, !group && duo.on)` (inside a group the toggle is
  absent ⇒ the Private list; mutation 4); an effect clears a selection that is no longer in the list when the toggle
  flips (mutation 5); the DUO card pricing (`priceGroupFor(true)`) untouched.
- **The walk — every other place a subject is picked for a COURSE:** `ImportBalanceModal` (an import is a Private
  course ⇒ DUO hidden; mutation 6) and `CreateCourseModal` (unmounted since the plan flow replaced it — kept in step
  so a revival is not a regression). NOT touched, deliberately: the calendar create form's picker (single-session ·
  voucher · trial — not a course picker; asserted no `subjectsFor` in `BookingModal`), the Bookings-page filters (they
  filter, they don't create), the move form (no subject), the resume dialog (no subject choice).
- **The 400s** (`NOT_A_DUO_SUBJECT` / `DUO_SUBJECT`) reach the create flow's existing refusal path — the server's sentence
  in the dialog, as every refusal; no code-switching, no client hint, no new copy.
- **🚫 No name rule:** a scan over every `src` file pins no `name.startsWith/includes/match("duo…")` and no `/duo/i.test(`.

### 🔑 Break-and-watch — six, each in `try/finally`, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | the filter ignores the toggle | **1 fail** |
| 2 | a missing `kind` counts as DUO | **1 fail** |
| 3 | a name rule sneaks in | **1 fail** |
| 4 | the New-course list ignores the toggle | **1 fail** |
| 5 | the toggle keeps a stale selection | **1 fail** |
| 6 | the import picker shows DUO subjects | **1 fail** |
None slipped. `md5` identical on the three mutated files. No pins moved elsewhere.

### Definition of Done
- [x] **536 / 0** · `tsc` 0 · build ok
- [x] `subjectsFor` by value (both modes; the missing-`kind` case) · the toggle clears · the scan pin
- [x] 🔑 Break-and-watch — six, `finally`, checksum

### ⚠️ Not seen on a screen
For @Tanya on `sid` (after the owner marks a subject DUO): New course ⇒ Private ⇒ the Program list without the DUO
subject; flip to DUO ⇒ only the DUO subject(s), a Private selection made before the flip is cleared; a teacher with no
DUO subject ⇒ the DUO list is empty and the size list stays empty (the server's card); the calendar's 1HR / trial
picker still lists every subject incl. DUO ones; Import balance ⇒ no DUO subject.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-22)
Re-run by me on the final tree: **543 pass / 0 fail** · tsc 0 · `src/app/(admin)/scheduler/other` absent · no `seriesHref` / route reference in `src` · no name rule on a subject in `src` · `OtherSeriesModal.tsx` present. Fern's calls accepted: one BookingModal instance (the series modal closes first — no modal-over-modal); the create toast's link dropped; the voucher card has no book door to hide (the calendar's eligible picker already omits ENDED).
