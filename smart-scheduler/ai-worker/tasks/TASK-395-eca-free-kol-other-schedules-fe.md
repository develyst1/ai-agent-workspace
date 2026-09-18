# TASK-395 — ECA · Free/KOL "Other" schedules, FE: the kind/head-count/rate fields on the `OTHER` form, a series creator (pick dates), the calendar legend by kind (`REQ-095` Stage 1, `SPEC-080`)

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-18)
**Contract (proposed to @Jason, TASK-394; confirmation via me):** `OTHER` bookings gain `otherKind` (`ECA`/`FREE`/`KOL`), `headCount`, `teacherRateMinor`, `additionalTeachers[].rateMinor` on create/edit/DTO · `POST /bookings/other-series { title, otherKind, headCount, note?, teacherId, additionalTeachers?, startTime, endTime, dates[] }` ⇒ `{ created, bookingIds }` | `409 SLOT_TAKEN` naming the date (all or nothing) · key `action:calendar.other-series` (49th).
**Size M.** Ships with TASK-394 (`sid`; joins the held `uat` cutover).

## §1
- The existing `OTHER` create/edit form: a `Kind` select (ECA / Free / KOL, labels both languages), `Head count` (number), and a `Rate (฿)` per teacher row (primary + each additional) — the rate field says *"stored for the backoffice; not posted here"* as its hint. Edit sends only changed fields.
- **Series:** a `Create series` door on the `OTHER` form (by the 49th key): the same fields + a multi-date picker (a calendar with ticks; the count shown) ⇒ one call; on `409` the sentence names the date — the picker keeps the ticks so the admin un-ticks and retries.
- The calendar legend gains the three kinds (a small tag on the `OTHER` cell: `ECA` / `Free` / `KOL`); nothing else on the grid changes.
- 🚫 No client rules; the snapshot goes 48 → 49 with the reason.

## Definition of Done
- [ ] Suite, **count** · tsc · build ok · shapes asserted (single + series; edit sends changes only) · keys counted · 🔑 Break-and-watch, `finally`, CHECKSUM

---

## §2 ✅ IMPLEMENTED — Fern, 2026-09-18. **Kind / Head count / Rate per teacher on the `OTHER` form (stored, not posted — the hint says so), a `Create series` door with a multi-date picker (one call, all or nothing, the 409 names the date and the ticks stay), a details editor through its OWN route, the kind tag on the cell and the legend.**

```
bunx tsc --noEmit → exit 0
bun test          →  435 pass / 0 fail   (was 429; +6 — new lib/scheduler/other-schedule.test.ts)
bun run build     → ok
git status        →  15 modified · 5 new (lib/scheduler/other-schedule.ts + test · Calendar/Modal/{OtherScheduleFields,OtherSeriesDialog,OtherDetailsDialog}.tsx)
```
Built against @Jason's CONFIRMED contract as it arrived via you (`teacherRates` ONE map · `PATCH /bookings/:id/other` ·
`other-series { title, otherKind, headCount, note?, teacherId, additionalTeacherIds?, teacherRates?, startTime, dates[] }` ·
DTO `other { kind, headCount, teacherRates, ratePostedAt } | null`) — 📌 the TASK's own contract line (`teacherRateMinor`,
`additionalTeachers[].rateMinor`, `endTime`) is the PROPOSED one; the confirmed shapes won where they differ. The
snapshot is 49 — **equal to the BE's `ACTION_KEYS` by script (49 = 49, in order)**.

### `§1` — the form, the series, the editor, the legend
- **`lib/scheduler/other-schedule.ts` (pure, value-tested):** the draft holds the human units (kind · head count ·
  `ratesBaht` per teacher, `""` = untouched); `otherScheduleFacts` puts each field on the wire only when set —
  head count `0` IS a value (mutation 2 fails) — and the rates map only when at least one rate was typed, **satang
  via the ONE `bahtToMinor`** (mutation 1 — a hand-written `× 100` — fails two tests), only for teachers on the
  booking; `otherSchedulePatch` = ONLY what changed against the server's `other` (the map rides whole when any rate
  differs; unchanged ⇒ `{}` and nothing is sent; mutation 3 fails).
- **The `OTHER` create form:** after the title, ONE shared `OtherScheduleFields` — a `Kind` Select (ECA / Free / KOL,
  both languages), `Head count`, and a `Rate (฿)` per teacher row (the primary marked, then each additional) whose
  hint reads *"Stored for the backoffice; not posted here."* (pinned both languages). The facts spread into the
  SAME payload literal as the other อื่นๆ fields (mutation 4 fails) and the service gates them on the type exactly
  as the four existing ones (`isOther ? … : undefined`; mutation 5 fails); reset with the rest of the draft.
- **The series:** a `Create series` button on the OTHER form behind **`can("action:calendar.other-series")`**
  (mutation 6 fails three tests) ⇒ `OtherSeriesDialog`, seeded from what is typed (title, teachers, time, the
  clicked date, the three facts) + a Mantine `DatePicker type="multiple"` (two months, the tick count shown) ⇒
  **ONE `POST /bookings/other-series`** with the confirmed body — `dates` sorted, `additionalTeacherIds` /
  `teacherRates` / `note` only when present, **no `endTime`** (the server's +1h; mutation 7 fails). On `409
  SLOT_TAKEN` the server's sentence (naming the date) shows and **the ticks stay** (asserted: the catch touches no
  `setDates`; mutation 8 fails); on `201` the notice names `created`. The title is required by the server (a series
  has no student to name it) — the button waits for a title, a kind, a head count, a teacher, a time and ≥1 tick;
  🚫 no other client rule (mutation 13 — a `≤ 60` check — fails; that ceiling is the server's).
- **The details editor:** an OTHER booking's view shows *Kind · Head count* from the server's `other` (null on a
  lesson ⇒ nothing) with a pencil behind `calendar.booking-edit` ⇒ `OtherDetailsDialog` ⇒ **`PATCH
  /bookings/:id/other`** — its OWN route, not the move (mutation 9 — the move route — fails), the body from
  `otherSchedulePatch`, the Save disabled until something changed (mutation 10 fails). The same invalidation as
  every calendar write.
- **The cell + legend:** `OtherKindTag` on the name row of BOTH grids (beside `Last` / `R`), from `other.kind` only
  and only on `OTHER` (mutation 11 — on a lesson — fails); the legend gains the three tags with their words.
- Copy: `booking.*` +19 · `calendar.otherKindTag_*` 3 — both languages, counted.

### 🔑 Break-and-watch — thirteen mutations, each in `try/finally`, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | a second baht→satang by hand | **2 fail** |
| 2 | head count `0` dropped as untouched | **1 fail** |
| 3 | the patch sends every field | **1 fail** |
| 4 | the facts leave the create payload | **1 fail** |
| 5 | the service sends the facts on a lesson type | **1 fail** |
| 6 | the series door ignores the key | **3 fail** |
| 7 | the series sends `endTime` itself | **1 fail** |
| 8 | a 409 clears the ticks | **1 fail** |
| 9 | the editor goes through the MOVE route | **1 fail** |
| 10 | the editor saves with nothing changed | **1 fail** |
| 11 | the tag shows on a lesson booking | **1 fail** |
| 12 | the snapshot loses the 49th key | **2 fail** |
| 13 | a client rule on the dates (`≤ 60`) | **1 fail** (📌 slipped the first run — the negative missed `<=`; tightened) |
`md5` identical on all seven mutated files. Two count pins moved with the reason (the snapshot 48 → 49, the sweep
71 → 73 / 30 files).

### ⚠️ Not seen on a screen
The multi-date picker at phone width (two columns ⇒ Mantine stacks them); the tag beside `Last`+`R` on a crowded name
row. For @Tanya on `sid`: an OTHER booking with kind KOL, 12 heads, ฿500 on the primary ⇒ the DTO carries
`other { kind: "KOL", headCount: 12, teacherRates: { <primary>: 50000 }, ratePostedAt: null }`, the cell shows `KOL`,
the ledger is untouched; `Create series` ⇒ tick 3 dates, one already taken ⇒ the sentence names it, the ticks stay,
un-tick, retry ⇒ `2 schedules created`; edit details ⇒ change only the head count ⇒ the PATCH body is `{ headCount }`
and no teacher LINE goes out; without `other-series` the door is absent; a lesson booking shows no tag and no pencil.
