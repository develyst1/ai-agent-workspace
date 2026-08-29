# TASK-080: scheduler-front (FE) — "this course is already part-way through"
- Source: SPEC-025 (REQ-025)
- Status: DONE  (reviewed 2026-08-01 by Sober — import endpoints only and zero price references, both verified by grep; she found the `StudentSelect` stale-text bug **by saving and looking at the next entry**; 10 bought/4 used → exactly 6 bookings and none for the 4 taught; tsc 0 / build ok)
- Depends on: **TASK-079**
- Assignee: @Fern (smart-scheduler-front, port 3016)

## What to do
On 20 August an admin sits down with a list of ~20–36 families who are mid-course in Excel and enters them.
**That person is the design target** — not a developer, and not someone who will do this twice.

Add a way to register a course that is **already part-way through**:
- the usual student / program / size,
- **sessions already used**,
- an **explicit expiry date** (the original purchase's — not computed),
- teacher / day / time for the **remaining** sessions.

Same for a **part-used voucher** (hours used + expiry).

It posts to **`POST /courses/import`** / **`POST /vouchers/import`** — **not** the normal create endpoints.
**No revenue is recorded**, and the screen should say so in one plain line, because the person entering 30
families needs to know they are not re-charging anyone.

### What makes this good rather than merely present
- **Show the consequence before saving**: *"6 sessions remaining, first on Tue 26 Aug"*. Entering `used` is the
  one field with no everyday meaning, and a wrong number is only obvious as a session count.
- **Make repetition cheap.** Thirty families in a sitting: keep the teacher/day/time where sensible, land the
  cursor somewhere useful, don't force a full re-navigation between entries.
- Off-card sizes are **allowed** here (TASK-079 permits them deliberately) — the family already bought it,
  whatever today's card says. **Don't reuse TASK-078's sellable-package restriction on this form.**

## Definition of Done
- [ ] Staff can register a course with sessions already used and an explicit expiry; the remaining count and
      first session are shown **before** saving.
- [ ] It calls the **import** endpoints, never the sale ones.
- [ ] The screen states plainly that no payment is recorded.
- [ ] A part-used voucher can be entered the same way.
- [ ] Entering several families in a row is not tedious — say what you did to make it so.
- [ ] Normal course/voucher **selling** is completely unchanged.
- [ ] `bunx tsc --noEmit` clean; `bun run build` succeeds — **and exercise it in a browser**: enter
      "10 sessions, 4 used", and say what you saw for the remaining count and first session.

## Implementation Notes — Fern 2026-08-01

### Shape: one modal, both kinds, opened by an explicit secondary button
**`ImportBalanceModal`** — a **Course | Voucher** segmented control inside one modal, reached from a
**"Already in progress" / "เรียนอยู่แล้ว (ย้ายข้อมูล)"** button sitting *beside* the primary sell button on both
the Courses and Vouchers tabs. Selling stays the filled primary; this is a `variant="default"` secondary.
**Nobody can slip into it** — it's a separate button and a separate modal; the sell modal is untouched.

One modal rather than two because the 20 August admin works off a **mixed** list: some families have a course,
some a voucher. Making them close one form and open another between rows is the tedium the task warns about.

### Making 30 families cheap — what I actually did
- **The modal does not close on save.** The primary button reads **"Save and enter another"**; a separate
  **"Done"** dismisses it.
- **Between entries, only what changes is cleared** — the student and the used count. **Teacher, program,
  session count, day, time and expiry all persist**, which matches how the list is actually shaped (families
  cluster on the same slot and package).
- **A running count** — "2 entered" — sits in the modal title, so the admin can reconcile against their Excel
  row count without leaving.
- ⚠️ **One thing I had to fix after testing:** clearing `student` to `null` was **not enough** — `StudentSelect`
  keeps its own search text, so the previous family's name stayed visible in the box while the value underneath
  was empty. Saving was correctly blocked, but it reads as "it didn't save". Fixed by keying `StudentSelect` on
  the saved-count so it genuinely remounts empty. **Found only by saving and looking at the next entry** — the
  kind of thing a single-shot test never surfaces.

### Showing the consequence before saving
A live preview under the form: **"6 sessions remaining, first on Sat 8 Aug 2026"** plus **"Last session Sat 12
Sep 2026"**, from a pure helper (`lib/scheduler/import-preview.ts`) that mirrors the server's
`remainingSessions` and weekly `courseSessionDates`. Voucher mode shows **"9 hours remaining"**.
**`used > bought` turns the preview into a red error and disables save** — nothing would be scheduled, so the
form refuses rather than posting a no-op.

### The two non-negotiables
- **Import endpoints only:** `POST /courses/import` and `POST /vouchers/import` via new
  `importCoursePackage` / `importVoucher` in the service. The sale endpoints are not reachable from this modal.
- **It never looks like a sale:** a permanent blue line at the top — *"For students who already bought and
  started. This records the remaining balance only — no payment is taken and no revenue is recorded."* — plus
  the same sentence echoed in the success toast. **No price is shown anywhere on this form.**
- **Off-card sizes allowed, as instructed:** `size` is a free `NumberInput` (1–100), **not** TASK-078's
  sellable-package Select. A family who bought an 8-session package last year is importable.

### Browser check — mock, localhost verified first
1. **The DoD case, "10 sessions, 4 used":** preview read **"เหลืออีก 6 ครั้ง คาบแรก เสาร์ 8 ส.ค. 2569"** with
   **"คาบสุดท้าย เสาร์ 12 ก.ย. 2569"** — 6 weekly sessions from 8 Aug, arithmetic correct.
2. **Guard:** set used = 12 against 10 bought → preview became the red *"จำนวนที่ใช้ไปต้องไม่เกินจำนวนที่ซื้อ"*
   and **Save went `disabled=true`**.
3. **Saved a course** (น้องกล้า · แอน · Skate · 10 bought / 4 used · resume 8 Aug 10:00 · expiry 1 Nov) →
   searched the all-bookings tab for that student: **"พบ 6 รายการ"**, dated **2026-08-08, 08-15, 08-22, 08-29,
   09-05, 09-12**, all 10:00–11:00 with แอน. **Exactly the 6 remaining — no bookings for the 4 already taught**,
   which is the server's deliberate behaviour and now visibly matches the preview.
4. **Repetition:** after saving, the modal stayed open, the badge read **"บันทึกแล้ว 1 ราย"**, the **student box
   was empty**, and **teacher / program / size / time were still set**.
5. **Saved a voucher** (น้องปาล์ม · 15 bought / 6 used · expiry 1 Nov) → preview **"เหลืออีก 9 ชั่วโมง"**;
   the Vouchers tab now lists **น้องปาล์ม · 15 ชม. · ใช้ 6 · เหลือ 9 · 2026-11-01 · ใช้ได้**. Counter reached
   **"บันทึกแล้ว 2 ราย"** across both kinds without reopening.
6. **Selling unchanged:** the "สมัครคอร์ส" modal still shows its sellable-driven `ขนาดคอร์ส` Select and none of
   the import fields.
7. **TH and EN both render fully**, including the no-payment line and both previews.

### Limits
- **Mock only** — I have not posted to the real import endpoints. I built against `api.ts` +
  `validation.ts` (`importCoursePackage` / `importVoucher`), and the field names and types match, but a live
  round-trip is deploy smoke. Worth one import on sid before 20 August, not on the day.
- The **`SLOT_TAKEN` conflict** Jason raises (a clashing week aborts the import) surfaces as the API's own
  message in the red alert; I could not force a real clash offline.

`bunx tsc --noEmit` **clean**; `bun run build` **succeeded**.

## Questions
(Fern asks; Sober answers as `> answer: ...`)
- Placement is yours. The two non-negotiables: it uses the **import** endpoints, and it never looks like a sale.
- If the form would be clearer as a mode of the existing create modal than a separate screen, that's your call —
  as long as choosing "already in progress" is **explicit**, never a default anyone can slip into.

## Review
(Sober fills at REVIEW.)
**Verdict: DONE ✅ (Sober, 2026-08-01).** `tsc` 0 (my run). Verified the two non-negotiables directly: the modal
calls **only** `useImportCourse`/`useImportVoucher` → `/courses/import` and `/vouchers/import`, and **`฿` and
`priceMinor` appear zero times in the file.** No price, no sale path.

### The thing you found by using it, which no test would have caught
> *"clearing `student` to `null` was not enough — `StudentSelect` keeps its own search text, so the previous
> family's name stayed visible while the value underneath was empty."*

Saving was correctly blocked, so the **logic** was right and the **screen lied**. On 20 August that's an admin
on family #7 wondering why the button stopped working. **You found it by saving and looking at the next
entry** — the one thing a single-shot test never does, and exactly the muscle this whole task needed.

### Designing for the person, not the feature
- **The modal doesn't close on save** ("Save and enter another"), **only the student and used-count clear**, and
  teacher/program/size/day/time persist — because families cluster on the same slot and package. You read the
  shape of the actual list, not the shape of the form.
- **A running count in the title** so the admin can reconcile against their Excel row count without leaving.
- **One modal with a Course|Voucher toggle** rather than two, because the 20 August list is *mixed* — making
  someone close one form and open another between rows is precisely the tedium the task warned about.

### The guards
- **Live preview before saving** — "6 sessions remaining, first on Sat 8 Aug" — from a pure helper mirroring the
  server's `courseSessionDates`. `used > bought` turns it red and **disables save**: nothing would be scheduled,
  so refusing beats posting a no-op.
- **Explicit entry point**, secondary styling beside the primary sell button, permanent "no payment is taken and
  no revenue is recorded" line, echoed in the success toast. **Nobody slips into it**, which was the requirement.
- **Off-card sizes allowed** via a free `NumberInput` rather than TASK-078's sellable Select — correct, and you
  cited why: the family already bought it.

**Your check #3 is the one that proves the feature**: 10 bought / 4 used → the all-bookings tab showed **exactly
6 bookings**, weekly from 8 Aug, **and none for the 4 already taught**. That's the server's "balance, not
history" rule visible from the UI — the two halves agreeing, verified end to end rather than assumed.

**Limits correctly stated:** mock-only, no live round-trip, and `SLOT_TAKEN` unforced offline. **One import on
`sid` before 20 August, not on the day** — that's the right instinct and it's in the deploy steps.

**TASK-080 → DONE. REQ-025 is complete** (TASK-079 + TASK-080) — **and that is the last build item on the
go-live list.**

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-080 | scheduler-front (FE): the "already part-way through" import form | SPEC-025 | ✅ **DONE** (Sober 2026-08-01 — **import endpoints only** and **zero price references**, both grep-verified. She found by *using* it what no test would catch: clearing `student` to null left `StudentSelect`'s own search text on screen, so the logic was right and **the screen lied** — an admin on family #7 wondering why save stopped working. Modal stays open, only student+used clear, running count in the title, live preview with save disabled when `used > bought`. **Verified end to end: 10 bought / 4 used → exactly 6 bookings, none for the 4 already taught** — "balance, not history" visible from the UI; tsc 0 / build ok) | Fern | TASK-079 |
```
