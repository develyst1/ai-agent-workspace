# SIZING — REQ-111, Team B pile (A · B · D · H) — @Silver, 2026-10-02
**This file only sizes the work.** 🚫 No TASK has been cut, nothing has started and there is no SPEC. Porter's rule is that nothing is cut until the owner rules on these sizes.
📌 **I read the code for every item.** Repos are `smart-scheduler-back` and `smart-scheduler-front` on `develop` (`dong` is the same commit in both, checked 2026-10-02). Every fact cites `file:line`.

## The table
| # | What | Side | Size | Who | Inside Team B's claim? |
|---|---|---|---|---|---|
| A | The list of every notification message, for Fern | **A document.** One read-only generator script; no product code changes | **S** | Bob | ✅ (read-only on the dictionaries, plus one new script file) |
| B | "Confirmation results" shows booking ids instead of names | **FE only** | **XS** | Fanta | ✅ `partials/Bookings/BookingsTable.tsx` |
| D | A blocked day shows on the grid cells | **FE only** | **S** | Fanta | ⚠️ **Needs two more files** (see D, Q5) |
| H | Freelance drawn/refunded rows move behind a permission | **BE only** | **XS** | Bob | ✅ the history route only. **No edit to `scheduler.service.ts`** |

None of the four depends on another. They can run in parallel, one BE pile (A, H) and one FE pile (B, D).

---

## A — Fern's list of notification messages · **S · a document, not a change**
**What exists (back, `src/lib/`):**
- LINE is the only channel. There is no email or SMS code (`line-2fa.ts:40`).
- **The wording is NOT in one place.** About 90% of it is in one TH/EN dictionary, `line-i18n.ts` (`TABLE` at `:236–771`): 243 strings, 223 of them with EN.
- **The shape of a push is in `line-message.ts`:** `formatOutboxMessage` at `:143` has **31 notification kinds**.
- **Field order is in `line-message-fields.ts`:** `TEMPLATE_FIELDS` at `:104` has 10 templates.
  - `TYPE_OMITS` (`:132`) drops fields by booking type.
  - When a field is empty, it prints `(-)` (`TEMPLATE_NONE`, `:47`) or the line is dropped (`:243`).
- **Some wording is hard-coded outside the dictionary:** a TH/EN leave-refusal sentence in `leave-notice.ts:45-50`, and the class-line formats in `line-v2-lines.ts`.
- **6 kinds have no wording of their own yet.** They are `student_registered` and four `*_asked_for_admin` kinds, and they fall back to `ob_default`, marked "BLOCKED ON COPY" in code.
- **By audience, roughly:** about 14 parent kinds, about 17 teacher kinds and about 7 admin kinds.
- **Language:** each push goes out in the recipient's language only.

**How it would be produced:**
- One read-only script walks the same structures the bot uses, so the list cannot drift from the code:
  - `allChatStrings()` (`line-i18n.ts:774`), which already enumerates the dictionary
  - `TEMPLATE_FIELDS` and `TYPE_OMITS`
  - the kinds in `formatOutboxMessage`
- It outputs one row per message with these columns: audience · when it is sent · title · ordered fields · empty rule · TH text · EN text · a sample with example values.
- **Hard-coded strings and the 6 kinds with no wording are listed and flagged, not hidden.**
- No wording is edited.

**Does it make REQ-086 cheaper or redundant? Cheaper, not redundant.**
- The generator's catalogue (key → audience → fields → TH/EN) is exactly the list REQ-086's editor needs.
- Producing the list also exposes the hard-coded strings that REQ-086 would have to bring into the dictionary anyway.
- **But the list is a one-time snapshot.** Fern revises the wording once and we apply it by hand, which falls to Team A because Team A holds the copy write.
- If revisions will keep coming, REQ-086 is still the durable fix.

## B — Confirmation results shows booking ids · **FE only · XS**
**Porter's question: is the name simply missing from what the call returns?**
- Yes, it is missing: `BulkConfirmResult` is `{ id, outcome, reason? }` (front `types/api/contract.ts:829`).
- **But that is not the cause, and it is not a DTO omission.** The FE was designed to look the name up itself:
  - `bookingName = rows.find(b => b.id === id)?.displayName ?? id` (`BookingsTable.tsx:151`).
  - Note: `rows` is the list currently on screen.

**What happens:**
1. `useBulkConfirm` has `onSuccess: invalidateAll` (`hooks/scheduler/useScheduler.ts:514-519`), so the list reloads right after the confirm.
2. The confirmed rows no longer match the list's filter. The lookup misses and the dialog falls back to the raw id.
3. The SKIPPED rows did not change status, so they are still in the list and keep their names. That is exactly the screenshot.
4. The server returns the same ids it was sent (`scheduler.service.ts`, `bulkConfirm` at `:4043`), so the ids are not the problem.

📌 **The code path above is certain. Which filter she had on is inferred:** her table shows only EXTENDED rows, which suggests a status filter.

**Fix:** keep the names of the selected rows at the moment of the click, and have the dialog read that copy.
- No BE change. Nobody needs to be asked anything.
- **Click test:** set the status filter to Extended, confirm several rows, and check that every row in the dialog shows a name.

## D — A blocked day shows on the grid itself · **FE only · S**
**What exists (front):**
- The orange strip is `partials/Calendar/LeaveDayBanner.tsx`. Its data is `useLeaveDays`, which calls `GET /teacher-leave-days`. That read is **already loaded in the parent of both grids** (`CalendarContent.tsx:67-68`).
  - **No new endpoint and no BE work.**
- A block is **a whole day, for one teacher** (`teacher_leave_days`, unique on `(teacher_id, date)`, back `db/schema.ts:1246-1257`).
- Today the cells on that teacher's day still show `+`, and the backend refuses with `TEACHER_ON_LEAVE`. That refusal is the moment Khwan described.
- **There is already a precedent in the code:** the week grid already greys a teacher's non-working day and hides its `+` (`CalendarWeekGrid.tsx:120-126`, `:204`).

**Work needed:**
- One prop, a set of `teacherId|date` keys, added to `CalendarGrid.tsx` (and its `Row`) and `CalendarWeekGrid.tsx`.
- That prop passed in at the two call sites in `CalendarContent.tsx`.
- One small helper beside `leaveMarkersFor` in `lib/scheduler/teacher-scope.ts`.
- ⚠️ `lib/camp/grid.test.ts` checks the grids' source lines word for word, so it will need updating together with the change.

**⚠️ Two files are outside our claim:** `CalendarContent.tsx` (two call-site lines) and `lib/scheduler/teacher-scope.ts` (one new helper). → **Q5.**
📌 **One more point for Porter.** The claim gives Team A "dialogs under `partials/Schedule/`", but **that folder does not exist**. The leave dialogs are under `partials/Calendar/Modal/`. If Team A's item C adds an "admin records leave" button, it may land in `CalendarContent.tsx` too. That is the collision to settle before either team starts.

## H — Freelance rows behind the permission · **BE only · XS**
**What exists (back):**
- The rows come from the freelance coach's hour-ceiling ledger. `getCourseHistory` (`scheduler.service.ts:2546`) mixes them into the course timeline.
- The route `GET /courses/:id/history` (`routes/api.ts:457`) passes no viewer, so **anyone with the Bookings menu sees them.**
- A mask for these figures already exists: `canSeeBudget(viewer)` in `lib/budget-visibility.ts:20`.
  - It requires `action:teachers.budget-view`, and a linked teacher account never sees them.
  - **By default nobody holds that key.**

**Fix:**
- In the route, take `viewerOf(c)` and drop the `freelance-drawn` / `freelance-refunded` events when `!canSeeBudget(viewer)`.
- **This is done in the route, so Team A's `scheduler.service.ts` is not touched.**
- The FE needs no change, because `CourseHistoryModal.tsx` renders whatever arrives.
- Tests cover three viewers: with the key, without it, and a linked account.
- This item carries the board's TASK-607 ruling.

---

## Questions — all of them, in one place
- **Q1 (A, scope):** Fern asked for "ข้อความแจ้งเตือนทั้งหมด". Should the list cover **the push notifications only** (about 37 kinds, the ones the system sends by itself), or **also the chat replies** (about 170 strings: the bot answering a tap or a typed message, plus 20 registration screens)?
  - *My proposal:* notifications as the main sheet, replies as a second sheet. It costs the same script.
- **Q2 (A, form):** what form should it reach Fern in? A **spreadsheet** with one row per message and TH/EN side by side, or a **document**?
  - *My proposal:* a spreadsheet, so she can write her revision in a column next to each message.
  - Either way, the owner reviews it before it goes to her.
- **Q3 (D, what the user sees):** these change what Khwan sees.
  1. An empty cell on a teacher's blocked day: grey, with no `+`, the same way a non-working day already looks in the week view?
  2. A class that already exists on that day: drawn as today plus a small "on leave" mark, and still clickable?
  3. In the day view: keep the teacher's column, greyed, rather than dropping it the way a non-working day is dropped?
  - *My proposal: yes to all three.* The label reuses the wording already approved for the strip, so it needs no new copy.
- **Q4 (H, which key):** "coach-pay" could mean either of two keys.
  - `action:teachers.budget-view` covers the freelance ceiling, and **these rows are that ceiling.**
  - `action:bookings.coach-rate` covers the per-course coach rate.
  - *My proposal:* `teachers.budget-view`.
  - ⚠️ Because nobody holds that key by default, **Khwan's admin login stops seeing these rows until the key is granted to her.** Is that intended?
- **Q5 (D, file claim):** may Team B also touch `front/src/components/partials/Calendar/CalendarContent.tsx` (two call-site lines) and `front/src/lib/scheduler/teacher-scope.ts` (one new helper)?
  - If Team A's item C needs `CalendarContent.tsx`, D can wait for it, or C's entry point goes elsewhere. That is your call.
