# TASK-421 — DUO = ONE course, TWO kids, FE (`REQ-095 §13`, `SPEC-087`): the New-course Private / DUO toggle (second-child picker + rate box) · both names everywhere a session or course shows a child · the rate box on Move-session · `Create group` loses DUO

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-21) · **Size M–L.** Builds against TASK-420's contract once CONFIRMED (I paste the final lines into §0). ⏳ Pure parts (the two-name label, the body builder) now; wire after Jason's report. `sid`.

## §0 The contract — CONFIRMED 2026-09-21 (TASK-420)
`POST /api/courses { …, duo?: { coStudentId, classRateMinor } }` (the DUO price applies server-side; one sale; `duo` with a `groupKey` ⇒ 400 — the DUO form never offers a group) · `PATCH /api/courses/:id { classRateMinor }` (a Private ⇒ 400) · `PATCH /api/bookings/:id { …, classRateMinor? }` (the move writes the COURSE's rate) · **DTOs:** a course carries `courseKind: "PRIVATE" | "DUO"`, `coStudent: { id, name, nickname } | null`, `classRateMinor`; a session row carries `coStudent` (the same `studentRef` shape as `student`) · the eligible picker lists a DUO course under BOTH children · `GET /sellable-packages` unchanged (`balance-duo` already listed) · `POST /bookings/group-series` accepts `groupKind: "GROUP"` only. The LIFF leave flow (server-side) now lets child 2's family take leave on a DUO session — no FE work there.

## §1
- **New course:** a `Private / DUO` segmented toggle at the top of the course form (default Private); DUO ⇒ a second-child picker (the same student search; the two must differ — the server's rule mirrored as a hint, the server the judge) + a `ค่าสอน` rate box (baht; satang via the ONE `bahtToMinor`); the price line reads the DUO card (`balance-duo` — from the server's sellable packages as TASK-400 taught: pick by the returned `priceGroup`, never a constant).
- **Both names:** wherever a session or course names a child — the calendar cell, the booking modal, the Bookings table, People's course cards (listed under BOTH children; the co-child's card says *DUO with X*), the LIFF views if they read the same DTO — render `A & B` through ONE pure `studentLabel(row)` (value-tested; a Private renders the one name unchanged). A `DUO` tag beside the course chip.
- **Move-session dialog:** a `ค่าสอน` box shown for a DUO session, prefilled from the course, sent only when changed.
- **Course edit:** the rate editable there too (same field).
- **`Create group`:** the kind picker offers Group only (DUO gone; the cap 3–12); existing DUO groups still render with their tag.
- Copy both languages, counted. Snapshot unchanged (no key). 🚫 No client pool/leave logic (the server's).

## Definition of Done
- [ ] Suite, **count** · tsc · build ok · `studentLabel` by value · the create body (`duo` only when the toggle is on; both fields) · the move body's `classRateMinor` only when changed · the group creator's kinds · 🔑 Break-and-watch, `finally`, CHECKSUM · report here + `inbox/SA.md` + log.


---

## §2 ✅ IMPLEMENTED — Fern, 2026-09-21. **DUO = ONE course, TWO kids: the Private/DUO toggle (second child + rate), `A & B` everywhere through ONE pure label in the ONE mapper, the rate box on Move-session and the course card, `Create group` = Group only.**

```
bunx tsc --noEmit → exit 0
bun test          →  515 pass / 0 fail   (was 505; +10 — new lib/scheduler/duo.test.ts)
bun run build     → ok
git status        →  12 source modified · 1 test re-pinned · 3 new (lib/scheduler/duo.ts · Bookings/DuoRateLine.tsx · lib/scheduler/duo.test.ts)
```
Built to §0 + @Jason's final lines in TASK-420 (2630/0, 49 = 49). **Snapshot unchanged (56, no key — asserted).** 🚫 No deploy asked.

### 📌 Two readings of §1, stated
1. **"People's course cards"** — the People page has no course cards (families · children only); the course cards live on
   the Bookings page's course panel, ONE list the server searches by either child's name (Jason's `GET /courses?q`).
   So a DUO course is found under both children by SEARCH, and its card reads `A & B` + the `DUO` tag — there is no
   second card to say *DUO with X*. If the owner wants a per-child card, that is a People-page feature, not built here.
2. **The plan title** reads `coStudent` through the same `studentLabel` IF the plan reader (`GET /entitlements/:id/plan`)
   sends it — Jason's "every course reader" line covers list/view/create/PATCH/confirm; the plan endpoint is not named,
   so the field is optional on the FE and the title falls back to the one name. @Jason can confirm in one line.

### `§1` — what was built
- **Pure (`lib/scheduler/duo.ts`), value-tested:** `callName` (nickname, else name; a blank nickname ⇒ name);
  **`studentLabel(first, coStudent)`** — a Private byte-identical (mutation 1), a DUO `first & <co's call name>`
  (mutation 2); `duoBody` — the create's `duo` block ONLY when the toggle is on AND both fields are filled, the rate in
  satang via the ONE `bahtToMinor` (mutations 3, 4); `duoReady` (the same-child hint — the server's `DUO_SAME_CHILD`
  judges; mutation 5); `rateChange` — `classRateMinor` only when the typed baht differs from the course's satang
  (mutation 6); `DUO_PRICE_GROUP = "balance-duo"` + `priceGroupFor(duo, subjectGroup)` (mutation 7; no price number
  anywhere in the file — asserted); `CREATABLE_GROUP_KINDS = ["GROUP"]` (mutation 8).
- **Both names, in ONE place:** the mapper — `dtoToBooking.displayName = studentLabel(dto.displayName, dto.coStudent)`
  (the one deliberate exception to "carried straight through", documented beside TASK-227's rule; a Private is
  byte-identical, value-tested; mutation 9) and `dtoToCourseView.studentName = studentLabel(row.student.name,
  row.coStudent)` (mutation 10). So both grids, the Bookings table, the modal header, the trays and the course card all
  show `A & B` with NO call-site edit (the three readers pinned to still read `displayName`). The plan title through
  the same function. Types: `BookingDTO/Booking.coStudent`, `Booking.classRateMinor` (from the row's course embed —
  the move box's prefill), `CourseSummary/CoursePackage.courseKind · coStudent · classRateMinor`, `EntitlementPlan.coStudent?`.
- **New course (`CreatePlanFlow`):** a `Private / DUO` segmented control at the top (default Private; NOT rendered
  inside a group — a DUO never has a `groupKey`) ⇒ under DUO a second `StudentSelect` (`Second child`) + a `ค่าสอน`
  baht box; the same-child orange hint; `valid` needs the DUO half (mutation 12); the sizes and the price from **the
  DUO card by its group name** (`packageForGroup(card, "balance-duo", size)` — TASK-400's lookup; mutation 13), the
  existing discount block applies to it; the body's `duo` block only when on, and `undefined` inside a group
  (mutation 11). The service sends `duo` by presence.
- **Move-session:** `isDuo = !!booking.coStudent` ⇒ a `ค่าสอน` box prefilled from the course's rate (satang → baht),
  `classRateMinor` merged into the PATCH only when it differs (mutations 14, 15; alone it is a body — the "no change"
  notice still fires when nothing differs).
- **The course card:** a teal `DUO` tag + `DuoRateLine` (`Rate n ฿ / session`, rendered; a pencil by
  `bookings.course-edit` ⇒ the same baht box ⇒ `PATCH /courses/:id { classRateMinor }` only when changed — mutations
  17–19); a Private renders neither (two gates, pinned). `useUpdateCourseRate` re-reads the lists.
- **`Create group`:** the kind picker offers Group only, default Group (mutation 16); `GROUP_KINDS` keeps DUO so
  existing DUO series render with their tag (asserted).
- **Copy:** `course` +11, both languages, counted.

### 🔑 Break-and-watch — nineteen, each in `try/finally`, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | a Private gets a stray suffix | **5 fail** |
| 2 | the label ignores the nickname | **3 fail** |
| 3 | the `duo` block rides with the toggle off | **1 fail** |
| 4 | the rate rides in baht | **1 fail** |
| 5 | the same child passes | **1 fail** |
| 6 | the rate always rides on a move | **1 fail** |
| 7 | the DUO card is the subject's group | **1 fail** |
| 8 | `Create group` offers DUO again | **1 fail** |
| 9 | the mapper carries `displayName` raw (no `A & B`) | **1 fail** |
| 10 | the course view names one child | **1 fail** |
| 11 | the form sends `duo` beside a `groupKey` | **1 fail** |
| 12 | the form's `valid` ignores the DUO half | **1 fail** |
| 13 | the DUO prices by the program | **2 fail** |
| 14 | the move box shows on a Private | **1 fail** |
| 15 | the move never sends the rate | **1 fail** |
| 16 | the group creator defaults to DUO | **1 fail** |
| 17 | the rate line on every course | **1 fail** (📌 slipped first — the tag's gate satisfied a one-occurrence pin; now two gates + the line's own) |
| 18 | the rate line saves an unchanged rate | **1 fail** |
| 19 | the course rate posts elsewhere | **1 fail** |
`md5` identical on the eight mutated files. Pin moved with the reason: TASK-400's two card lines in `group-walkin.test.ts`
(the DUO branch sits between the group's and the program's; the group branch byte-unchanged).

### Definition of Done
- [x] **515 / 0** · `tsc` 0 · build ok
- [x] `studentLabel` by value · the create body (`duo` only when on; both fields; never beside a groupKey) · the move body's `classRateMinor` only when changed · the group creator's kinds
- [x] Copy counted, both languages · snapshot unchanged
- [x] 🔑 Break-and-watch — nineteen, `finally`, checksum

### ⚠️ Not seen on a screen
The segmented control above the student picker in the `lg` modal; the second picker + the rate box appearing under
it; `A & B` truncating in a narrow week cell (the name span truncates as before). For @Tanya on `sid` (after
`db:migrate` ⇒ 49): New course ⇒ DUO ⇒ pick A, pick A again ⇒ the orange hint, Save disabled; pick B, rate 500 ⇒ the
size list reads the DUO prices (6,800 / 9,360 / 14,200 — from the card); create ⇒ the grid cells read `A & B` with the
course stripe, the Bookings table too, the course card `A & B` + `DUO` + `Rate 500 ฿ / session`; search the course
list by B ⇒ the course is found; open a session ⇒ the header `A & B`; Move ⇒ the rate box reads 500, change nothing
else, set 600 ⇒ the move goes through with the rate alone, the card reads 600; on the card's pencil set 600 again ⇒
no call; a Private course shows no rate line and no tag; `Create group` ⇒ the kind list has Group only; an existing
DUO group cell still wears its `DUO` tag.
