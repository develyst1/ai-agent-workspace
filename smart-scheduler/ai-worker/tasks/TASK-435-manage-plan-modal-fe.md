# TASK-435 — `REQ-101 §6` (owner re-spec): Manage plan becomes a MODAL on the calendar; the `/scheduler/other/[key]` page, `seriesHref` and the `ROUTE_ALIASES` entry are RETIRED — FE, S–M

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-22) · **Size S–M** (a move of what exists, no new logic; no API change). Supersedes the page half of TASK-429 and the 502 chase (TASK-433). The held batch.

## §0 Owner's ruling (Porter 09-22, REQ-101 §6)
One modal (the BookingModal/OtherSeriesDialog pattern) holding exactly what `OtherSeriesContent` renders today — header · rows · the doors (Confirm all · Cancel all [key 58] · Add/Remove/Swap teacher · Add dates · Edit header); a row opens the ordinary BookingModal. **Two entry points, one modal:** (1) the OTHER-block BookingModal's `Manage plan` button opens it (no navigation); (2) a `Series in range` row click opens the SAME modal. **Retire** `src/app/(admin)/scheduler/other/[key]/page.tsx`, `seriesHref` and its navigation, the `ROUTE_ALIASES` `/scheduler/other` entry. The create toast's link becomes "open Manage plan" (opens the modal) or is dropped — your call, say which.

## §1
- `OtherSeriesContent` becomes the modal's body (`OtherSeriesModal`, `seriesKey` + `opened/onClose`); the dialogs unchanged; the hooks unchanged (`GET /other-series/:key` feeds it). A modal over a modal (BookingModal → Manage plan → a row's BookingModal): keep ONE BookingModal instance — the row click closes the series modal or stacks per the existing Mantine pattern in the codebase (say which; no z-index hacks).
- `seriesDoors`/`statusCounts` untouched; `seriesHref` deleted with its test (the link condition `otherSeriesKey != null` now gates the BUTTON — pinned).
- The `Series in range` rows become buttons opening the modal (pinned).
- The guard: the alias entry removed; the nav-item pins back to their pre-429 shape (say the count moved back).
- 🚫 No API change; no new copy beyond the button label if needed; key 58/59 gating as today.

## Definition of Done
- [ ] Suite, **count** · tsc · build ok (`/scheduler/other/[key]` ABSENT from the build output — say it) · the two entry points by value · the page/alias/`seriesHref` gone by absence · 🔑 Break-and-watch, `finally`, CHECKSUM · report here + `inbox/SA.md` + log.


---

## §2 ✅ IMPLEMENTED — Fern, 2026-09-22. **Manage plan is a MODAL on the calendar — two entry points, one instance; the page, `seriesHref`, the alias and the toast link retired.**

```
bunx tsc --noEmit → exit 0
bun test          →  533 pass / 0 fail   (was 533: the seriesHref cases went, the two-entry-point cases came)
bun run build     → ok — the route list has NO `/scheduler/other/[key]` line
git status        →  7 source modified · OtherSeriesContent.tsx → OtherSeriesModal.tsx · app/(admin)/scheduler/other/[key]/page.tsx deleted · 3 tests re-pinned
```
No API change. 🚫 No deploy asked.

### `§1` — what was built (a move, no new logic)
- **`OtherSeriesModal`** (`seriesKey · opened · onClose · onOpenBooking`): a Mantine `Modal` (`xl`) holding exactly what
  the page rendered — header · rows · the doors; the dialogs and hooks untouched (`GET /other-series/:key` feeds it).
- **One `BookingModal` instance — the calendar's.** A row click inside the series modal does `onClose(); onOpenBooking(b)`
  — it CLOSES the series modal and hands the booking to the calendar's single `BookingModal` (`openView`), so there is
  never a modal over a modal and no z-index work (my call between the two options offered; pinned by the handler's own
  sequence — mutation 6). The series modal no longer mounts a `BookingModal` (asserted); the calendar mounts exactly one.
- **Entry (1) — the OTHER block's `Manage plan`:** a BUTTON now (no navigation), rendered only when the server sent
  `otherSeriesKey` (a legacy row before the backfill shows nothing — mutation 1) AND the host offers the modal
  (`onManagePlan`; absent ⇒ no button — mutation 2); it closes the booking modal first, then opens the series modal
  (mutation 3). The calendar passes `onManagePlan={setSeriesKey}` (mutation 7).
- **Entry (2) — a `Series in range` row:** a BUTTON (`onOpen(key)`) opening the same modal (mutation 4 — an `<a href>` —
  fails). Fetched only while the strip is open, as before.
- **Retired:** the route `app/(admin)/scheduler/other/[key]` (absent from the build; asserted by `existsSync`),
  `seriesHref` (+ its four value cases), the `ROUTE_ALIASES` entry — `navItemForPath` is byte-identical to its pre-429
  body; **the nav-item pins never moved in TASK-429** (it added an alias, not an item — the `menuKey = menu:<segment>`
  and 13-menus pins were untouched), so there is nothing to move back; `navItemForPath("/scheduler/other/…")` is now
  `undefined` (nothing to guard). **The create toast's link — dropped**, my call: there is no page to link; the modal
  lives on the calendar where the create happens, and the new series appears at once in `Series in range` and on its
  rows' OTHER block. (An "open Manage plan" toast action would need a toast → calendar-state channel; not worth a
  second mechanism for one click.)

### 🔑 Break-and-watch — seven, each in `try/finally`, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | the button shows without a key | **1 fail** |
| 2 | the button shows without a host | **1 fail** |
| 3 | the button keeps the booking modal open (two modals) | **1 fail** |
| 4 | a strip row navigates instead | **1 fail** |
| 5 | the calendar mounts a second `BookingModal` | **1 fail** |
| 6 | a series row opens without closing (nested) | **1 fail** (📌 slipped first — an `indexOf` close-before-open pin was satisfied by an earlier `onClose()`; now the handler's own `if (!b) return; onClose(); onOpenBooking(b)`) |
| 7 | the OTHER block's button loses its host prop | **1 fail** |
`md5` identical on the four mutated files. Pins moved with the reason: TASK-429's link/toast/alias cases → the two entry
points + the retirements; TASK-432's test re-pointed to the renamed file; the create toast line in TASK-395's test.

### Definition of Done
- [x] **533 / 0** · `tsc` 0 · build ok — `/scheduler/other/[key]` absent from the output
- [x] The two entry points by value (source) · the page / alias / `seriesHref` gone by absence
- [x] 🔑 Break-and-watch — seven, `finally`, checksum

### ⚠️ Not seen on a screen
The `xl` series modal over the calendar; the hand-off (series modal closes, the booking modal opens) — a one-frame
swap. For @Tanya on `sid`: open an OTHER row ⇒ `Manage plan` ⇒ the booking modal closes and the series modal opens
(the URL does not change); click a row ⇒ the series modal closes, the ordinary booking modal opens for that date;
`Series in range` ⇒ a row ⇒ the same modal; a bookmarked `/scheduler/other/<key>` ⇒ 404 (the page is gone).

---

# ✅ DONE — REVIEWED by @Sober (2026-09-22)
Re-run by me on the final tree: **543 pass / 0 fail** · tsc 0 · `src/app/(admin)/scheduler/other` absent · no `seriesHref` / route reference in `src` · no name rule on a subject in `src` · `OtherSeriesModal.tsx` present. Fern's calls accepted: one BookingModal instance (the series modal closes first — no modal-over-modal); the create toast's link dropped; the voucher card has no book door to hide (the calendar's eligible picker already omits ENDED).
