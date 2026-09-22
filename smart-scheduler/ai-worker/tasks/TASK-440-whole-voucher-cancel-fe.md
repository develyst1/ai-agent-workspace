# TASK-440 — `REQ-103` FE (SPEC-089 B): the voucher card's `Cancel voucher` door (key `bookings.course-cancel`) with the preview dialog, the `ENDED · Nh left` chip, the book door hidden on an ENDED voucher

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-22) · **Size S.** Against TASK-439's contract once CONFIRMED (I paste the final lines into §0). Pure parts now; wire after Jason's report. After TASK-438.

## §0 The contract — CONFIRMED 2026-09-22 (TASK-439)
`GET /vouchers` items gain `status: "ACTIVE"|"EXHAUSTED"|"EXPIRED"|"ENDED"`, `endedAt`, `endReason` (`remaining` frozen, still a number — the card reads `ENDED · Nh left` from `status` + `remaining`). `POST /api/vouchers/:id/cancel/preview {}` ⇒ `{ alreadyEnded, removedSessions, sessions: [{ date, time, teacher }], student, program, remaining }` — the COURSE preview's shape + `remaining` (one dialog component for both); `POST /api/vouchers/:id/cancel { reason, note? }` — the course cancel's body byte-for-byte ⇒ `{ cancelled, removedSessions, voucher }`; `409 ALREADY_ENDED`; a draw on an ENDED voucher ⇒ `409 VOUCHER_ENDED` (the picker/SOM already exclude it). Key `action:bookings.course-cancel` (existing).

## §1
- **The voucher card (the Bookings page's editor):** `Cancel voucher / ยกเลิกบัตรชั่วโมงทั้งใบ` shown only with `can("action:bookings.course-cancel")` (hidden, never disabled) and only while not ENDED; click ⇒ the preview dialog (the course-cancel dialog's pattern — reuse its component if it takes `{ doomed }`, say so): the doomed draws listed (date · time · coach), the frozen `remaining` shown as *"Nh left — kept for the customer"*, the reason radios from the closed `END_REASONS` + a note; confirm ⇒ the cancel; the 409s as the server's sentence.
- **The chip:** `ENDED · Nh left` on an ENDED voucher (the same chip family as the course's `CANCELLED`); the `Book` door hidden on ENDED; the voucher still listed (history).
- **Pure (`lib/scheduler/voucher.ts`), value-tested:** `voucherDoors(grants, voucher)` (cancel: key + not ENDED; book: not ENDED/EXHAUSTED/EXPIRED — mirror the existing book rule, say where it lives); `endedLabel(voucher)` ⇒ `ENDED · 7h left`.
- 🚫 No client status derivation (the server's `status` is the source; the FE never computes ENDED from `endedAt`). Copy both languages, counted.

## Definition of Done
- [ ] Suite, **count** · tsc · build ok · `voucherDoors`/`endedLabel` by value · the dialog's body by value · no client derivation (asserted) · 🔑 Break-and-watch, `finally`, CHECKSUM · report here + `inbox/SA.md` + log.


---

## §2 ✅ IMPLEMENTED — Fern, 2026-09-22. **The voucher card's `Cancel voucher` door (the course's key) → the ONE cancel dialog (course + voucher), the `Ended · Nh left` chip from the server's `status`, no client derivation.**

```
bunx tsc --noEmit → exit 0
bun test          →  543 pass / 0 fail   (was 536; +7 — new lib/scheduler/voucher-end.test.ts)
bun run build     → ok
git status        →  9 source modified (contract.ts · scheduler types · scheduler.service · scheduler.mock.service · useScheduler · dictionaries · EndCourseDialog · PlanModal · VoucherPanel) · 2 new (lib/scheduler/voucher.ts + test) · 1 pin moved (action-gate sweep 96/36 → 97/37)
```
Built to §0 (TASK-439). No new key (`action:bookings.course-cancel`). 🚫 No deploy asked.

### `§1` — what was built
- **Pure (`lib/scheduler/voucher.ts`), value-tested:** `voucherDoors(grants, v)` — `cancel` = the key AND `status !== "ENDED"`;
  `book` = exactly `ACTIVE` (an older payload without `status` reads bookable/cancellable — the server decides).
  `endedLabel(v)` ⇒ `{ key: "voucher.endedChip", args: { n: remaining } }` — *Ended · 7h left* / *ยกเลิกแล้ว · เหลือ 7 ชม.*
  `voucherChip(v)` — ENDED (danger) · EXPIRED (the existing `course.status.EXPIRED`, muted) · EXHAUSTED (danger) ·
  ACTIVE (success); no `status` ⇒ the pre-REQ-103 `remaining === 0` rule, never ENDED. An ENDED voucher with hours
  left reads ENDED — the server's precedence, read, not recomputed (mutation 4).
- **Where the book rule lives (you asked me to say):** the BE `lib/voucher.ts` `voucherUsable` (not ended · hours
  left · not expired), reached by the creator, the eligible picker and the SOM. **On the FE the voucher card has NO
  book door** — a draw is booked from the calendar's create form, whose picker is the server's `/students/eligible`
  list (Jason's line: it already omits an ENDED voucher; `EligibleStudentSelect` filters nothing client-side). So
  `voucherDoors.book` mirrors `voucherUsable` and is pinned by value for the day a card door exists; there was
  nothing on the card to hide. Manage stays on every row — the voucher is listed as history.
- **The card (`VoucherPanel`):** `Cancel voucher / ยกเลิกบัตรชั่วโมงทั้งใบ` (red light, `Ban`) beside Manage, rendered by
  `voucherDoors({ cancel: can("action:bookings.course-cancel") }, v).cancel` — hidden, never disabled (mutations 1, 2,
  6); the status column is `voucherChip` (the `RemainingBadge` client rule retired — mutation 5 derives from
  `endedAt` and fails). The table's min width 640 → 760 for the second button (still scrolls at 375).
- **ONE dialog — `EndCourseDialog` (file name kept: teacher-scope §6 pins it) takes `target: { kind, id } | null`.**
  The voucher picks `usePreviewEndVoucher` / `useEndVoucher`, the course its pair (mutation 7); the copy table
  `COPY[kind]` swaps five keys; the voucher face adds the doomed draws (date · time · coach) and *Nh left — kept for
  the customer* from the preview's `remaining` (mutation 8: a client subtraction fails). Reasons = the closed
  `END_COURSE_REASONS`; submit hidden without the key; `alreadyEnded` ⇒ the orange notice, no button; the 409s
  (`ALREADY_ENDED`) and 400s reach the same `ApiClientError` path — the server's sentence. `PlanModal` passes
  `{ kind: "course", id }` — the course path unchanged in behaviour.
- **The pair (`scheduler.service.ts`):** `previewEndVoucher` — `POST /vouchers/:id/cancel/preview {}` ⇒
  `EndCoursePreview` (+ `remaining?`); `endVoucher` — `POST /vouchers/:id/cancel { reason, note }` — the course
  cancel's body **byte-for-byte, pinned equal** (mutation 9: `reasonCode` fails). Hooks invalidate all (the voucher
  list, the calendar, the draws). Mock stand-ins stamp the fixture ENDED so the card re-reads offline.
- **Contract:** `VoucherSummary.status? · endedAt? · endReason?` + `VoucherStatus` (optional — an older payload);
  `EndCoursePreview.remaining?`. 🚫 No client status derivation — the lib and the card never read `endedAt`, never
  compare `expiryDate`, never assign a client ENDED (asserted).
- **Copy +8, both languages** (`voucher.endedChip · cancel · endTitle · endLine · endKept · endAlready · endConfirm ·
  endDone`; EN = TH key count pinned). 📖 **One word for Porter:** the door says **บัตรชั่วโมง** as this TASK wrote it,
  while the panel elsewhere says **วอยเชอร์** (and the BE's fixed note says วอยเชอร์). I kept the TASK's word on all
  eight new strings so the dialog is consistent with its door; if the owner wants วอยเชอร์, it is a one-line change.

### 🔑 Break-and-watch — nine, each in `try/finally`, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | the cancel door ignores ENDED | **1 fail** |
| 2 | the cancel door ignores the key | **1 fail** |
| 3 | `book` lets an EXHAUSTED voucher through | **1 fail** |
| 4 | ENDED reads usable when hours remain (a client precedence) | **1 fail** |
| 5 | the card derives ENDED from `endedAt` | **2 fail** |
| 6 | the door rendered `disabled` instead of hidden | **1 fail** |
| 7 | the dialog always calls the course pair | **1 fail** |
| 8 | the kept line subtracts on the client | **1 fail** |
| 9 | the voucher cancel body drifts from the course's (`reasonCode`) | **1 fail** |
None slipped. `md5` identical on the four mutated files. Pin moved: the action-gate sweep 96/36 → 97/37 (the card's door).

### Definition of Done
- [x] **543 / 0** · `tsc` 0 · build ok
- [x] `voucherDoors` / `endedLabel` / `voucherChip` by value · the dialog's body by value (equal to the course's) · no client derivation (asserted)
- [x] 🔑 Break-and-watch — nine, `finally`, checksum

### ⚠️ Not seen on a screen
For @Tanya on `sid` (after `0051` — 52): Bookings → Vouchers ⇒ an ACTIVE voucher shows `Manage` + `Cancel voucher`
(only with `bookings.course-cancel`; a role without it sees Manage alone); click ⇒ the dialog lists the upcoming
draws and *Nh left — kept for the customer*; pick a reason ⇒ confirm ⇒ toast, the row reads **Ended · Nh left** (red),
the Cancel button gone, Manage still there; the calendar's future draws of that voucher are CANCELLED; the create
form's Voucher picker no longer lists that student's voucher; re-opening the dialog on an ended voucher (another tab)
⇒ the orange "already cancelled" notice. A used-up voucher (0 left) keeps `Cancel voucher` (not ENDED) — the server
accepts it; expected. The course's own cancel dialog: unchanged words and behaviour.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-22)
Re-run by me on the final tree: **543 pass / 0 fail** · tsc 0 · `src/app/(admin)/scheduler/other` absent · no `seriesHref` / route reference in `src` · no name rule on a subject in `src` · `OtherSeriesModal.tsx` present. Fern's calls accepted: one BookingModal instance (the series modal closes first — no modal-over-modal); the create toast's link dropped; the voucher card has no book door to hide (the calendar's eligible picker already omits ENDED).
