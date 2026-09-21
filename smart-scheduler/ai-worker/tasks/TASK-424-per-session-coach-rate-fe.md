# TASK-424 — Coach rate PER SESSION, FE (`REQ-095 §13.3`): the session popup edits THIS session's rate (relabelled), the course card edits the default, the effective rate shown · the Bookings table shows `A & B`

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-21) · **Size S.** Builds against TASK-423's contract once CONFIRMED (I paste the final lines into §0). ⏳ Pure parts now; wire after Jason's report. `sid`; the `uat` deploy waits for this.

## §0 The contract — CONFIRMED 2026-09-21 (TASK-423)
A booking row carries `rate: { effectiveMinor, overrideMinor, defaultMinor } | null` — **non-null on COURSE_PACKAGE rows only** (OTHER/GROUP rows keep their `other.teacherRates` / `group` facts and read `rate: null`); `PATCH /api/bookings/:id { classRateMinor: n | null }` writes THIS session's override (`null` clears — back to the default; a non-course row ⇒ `400 NOT_A_COURSE_SESSION`); `PATCH /api/courses/:id { classRateMinor }` writes the course default for ANY course (no `NOT_DUO`). `displayName = "A & B"` on a DUO row on EVERY surface now (the DTO's rule was the one that lacked it — your `studentLabel` and the server's string must agree; pin it); `GET /bookings` rows carry `coStudent` and its `q` matches either child. A make-up of a substituted session is born with the DEFAULT (the override stays on the substituted row).

## §1
- **The session popup / Move-session rate box:** relabel to *"ค่าสอนคาบนี้ / This session's rate"* with the hint *"leave blank = the course's default (฿X)"*; sends `classRateMinor` for THIS session only when changed; a `Clear` sends `null`. The box shows the effective rate with a small *(default)* or *(override)* tag from the server's three facts — no arithmetic on the FE (pinned: the FE never computes `override ?? default`).
- **The course card:** the rate box edits the default, labelled *"ค่าสอนเริ่มต้น / Default coach rate"*; shown for any course (not only DUO).
- **The Bookings table:** the student column reads `displayName` from the row (already `A & B` server-side) — remove any single-name fallback that ignored `coStudent`.
- Copy both languages, counted. Snapshot unchanged. 🚫 No client rate arithmetic.

## Definition of Done
- [ ] Suite, **count** · tsc · build ok · the two bodies (session vs course) by value · the labels · the `(default)/(override)` tag from the facts · the table's names · 🔑 Break-and-watch, `finally`, CHECKSUM · report here + `inbox/SA.md` + log.


---

## §2 ✅ IMPLEMENTED — Fern, 2026-09-21. **The session popup edits THIS session's rate (relabelled, the (default)/(override) tag from the server's facts, `Clear` ⇒ null) · the course card edits the DEFAULT for any course · `displayName` carried straight through (the server joins `A & B`).**

```
bunx tsc --noEmit → exit 0
bun test          →  516 pass / 0 fail   (was 515; +1 — duo.test.ts: TASK-421's three superseded cases rewritten to §13.3 + one pure case)
bun run build     → ok
git status        →  9 source modified (duo.ts · mappers.ts · BookingModal · CoursePackagePanel · DuoRateLine · scheduler.service · contract.ts · scheduler types · dictionaries) · 0 new
```
Built to §0 + @Jason's final lines in TASK-423 (2647/0). **Snapshot unchanged (56).** 🚫 No deploy asked.

### `§1` — what was built
- **Both names, the server's:** `dtoToBooking.displayName = dto.displayName` again — TASK-421's FE join is gone (it
  would now read `A & B & B`; mutation 5 fails). **`studentLabel` and the server's string agree**, pinned by value
  (`studentLabel(callName(student), coStudent) === "A & B"`); the course view and the plan title still use it (the
  course DTO has no displayName). The Bookings table reads `{b.displayName}` (pinned; no single-name fallback).
- **Pure (`lib/scheduler/duo.ts`):** `SessionRate` (the three facts); `rateTag(rate)` — `override` when
  `overrideMinor != null`, else `default`; an override EQUAL to the default is still an override (mutation 1 — a
  tag from `effective !== default` — fails); `sessionRateChange(typedBaht, rate, clear)` — `{ classRateMinor: n }`
  only when the typed baht ≠ the EFFECTIVE (mutation 2 — comparing against the default — fails), `{ classRateMinor:
  null }` on `Clear` only when an override is set (mutation 3), blank typed = leave as is, 0 is a rate (mutation
  4), a non-course row ⇒ nothing. `rateChange` (the course default) unchanged and never null. 🚫 **No
  `override ?? default` / no rate arithmetic anywhere** (asserted on the lib and the modal).
- **The session popup (Move-session):** the box on ANY course row (`rate` non-null — no longer a DUO thing; mutation
  8), relabelled **"This session's rate / ค่าสอนคาบนี้"** with the **(default) / (override)** tag beside the label
  (from `rateTag`; mutation 9) and the hint *"Leave blank = the course's default (฿X)"* (X = `defaultMinor`);
  prefilled from `effectiveMinor` (mutation 7; ฿0 renders as 0, not blank); **`Clear`** shown only on an override
  (mutation 10) ⇒ `classRateMinor: null`; the body through `sessionRateChange`, merged before the "no change" check,
  alone a valid body. `MoveBookingInput.classRateMinor?: number | null`.
- **The course card:** `DuoRateLine` on ANY course now (mutation 11), relabelled **"Default coach rate / ค่าสอน
  เริ่มต้น"**, the pencil by `bookings.course-edit` ⇒ `PATCH /courses/:id { classRateMinor }` only when changed and
  **never null** (no Clear on the card — mutation 12; the default is set, not cleared — Jason's line); the `DUO` tag
  stays DUO-only (one gate, asserted).
- **Types:** `BookingDTO/Booking.rate?: { effectiveMinor, overrideMinor, defaultMinor } | null` (the mapper carries it;
  mutation 6); `Booking.classRateMinor` retired (the facts replace it). Copy `course` +7, both languages.

### 🔑 Break-and-watch — twelve, each in `try/finally`, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | the tag computes from `effective !== default` | **1 fail** (📌 slipped first — the fixtures let the two rules coincide; now an override EQUAL to the default is pinned as `override`) |
| 2 | the session body compares against the default | **1 fail** (📌 slipped first — same fixtures; now a typed value = the default but ≠ the effective is pinned as a body) |
| 3 | `Clear` sends null with no override | **1 fail** |
| 4 | zero is blank | **1 fail** |
| 5 | the mapper joins the names again (`A & B & B`) | **1 fail** |
| 6 | the mapper drops the facts | **1 fail** |
| 7 | the box prefills from the default | **1 fail** |
| 8 | the box shows on a DUO row only | **1 fail** |
| 9 | the tag is not rendered | **1 fail** |
| 10 | `Clear` shows on a default too | **1 fail** |
| 11 | the card gates the rate on DUO again | **1 fail** |
| 12 | the card can clear the default | **1 fail** |
`md5` identical on the five mutated files.

### Definition of Done
- [x] **516 / 0** · `tsc` 0 · build ok
- [x] The two bodies by value (session: n / null / nothing; course: n / nothing) · the labels · the tag from the facts (value + rendered attribute) · the table's names (`displayName`, the server's)
- [x] Copy counted, both languages · snapshot unchanged
- [x] 🔑 Break-and-watch — twelve, `finally`, checksum

### ⚠️ Not seen on a screen
The label with its small grey tag wrapping in the move form's grid; the `Clear` chip beside the box. For @Tanya on
`sid`: open a course session ⇒ Move ⇒ the box reads the course default with *(default)*, no Clear; set 600 ⇒ the
session shows `฿600` on the reminder and the box reads *(override)* + Clear; a make-up of it is born at the default;
Clear ⇒ back to *(default)*; a 1HR session shows no box; the course card reads *Default coach rate 500 ฿ / session*
on a Private too, pencil ⇒ 550 ⇒ the card and every un-overridden session follow, the overridden one keeps 600; the
Bookings table's student column reads `A & B` on a DUO row and searching by B finds it.
