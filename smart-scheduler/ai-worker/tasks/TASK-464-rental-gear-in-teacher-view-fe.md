# TASK-464 — `REQ-106 §1`: a coach sees the session's rental GEAR (item + remark), read-only, in the teacher view — no price, no paid state, no buttons — FE, S

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-24) · **Size S.** No BE change. **Folds into the held `uat` batch** (the owner's decision) — so it ships with the rest, not on its own.

## §0 The customer's ask and the owner's ruling
Khwan: *"โน๊ต rental ไม่ขึ้นเวลาสร้างตารางให้ครู"* — a coach cannot see what gear to prepare for the session, and she assumed it was a permission she had not granted. **It is not:** `BookingModal` renders `{!scoped && <RentalSection booking={booking} />}` — the whole block is hidden for a linked teacher account by the REQ-097 teacher view, and no key changes that (`action:calendar.rental` only gates the doors *inside* the section, which never renders for a coach).
**Owner's ruling (ก): GEAR ONLY** — the rental item and its remark, **read-only**, in the scoped view. **No price, no paid/unpaid state, no buttons.** A coach sees what he must bring; what the family paid is the shop's business.

## §1
- In the scoped (teacher) view, render a small read-only rental line where the section would be: the rental **code/item** and its **remark**, nothing else. The existing `RentalSection` stays exactly as it is for an unscoped user — **do not** fork its behaviour with a flag inside it if that makes the two paths hard to read; a separate, obviously read-only component is the honest shape here (your call, but say which and why).
- 🔑 **Pinned by value, and this is the point of the task:** in the scoped view the rendered output contains the item and the remark and **contains no price, no paid/unpaid word, and no interactive element** — assert the absence, not just the presence. The unscoped view is unchanged (its existing pins must not move).
- The data is already in the payload — `booking.rental = { code, remark, paid }` rides the teacher's own calendar read (the REQ-097 scope decides *which bookings* a coach sees, not which fields). **So `paid` WILL be in the object you are given: the task is to not render it.** If you find the field is absent for a scoped user, stop and tell me — that would be a BE change and my read was wrong.
- A session with no rental renders nothing at all (no empty box, no "—").
- Copy both languages, counted. 🚫 No new API call, no BE change, no money anywhere in this view.

## Definition of Done
- [ ] The read-only gear line in the scoped view by value (item + remark present; **price, paid state and every button absent** — asserted) · a no-rental session renders nothing · the unscoped `RentalSection` untouched (its pins unmoved) · suite **count** · tsc · build ok · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation that leaks `paid` into the scoped view and one that renders a button there · report here + `inbox/SA.md` + log.


---

## §2 ✅ IMPLEMENTED — Fern, 2026-09-24. **The coach sees the gear and nothing else.**

```
bunx tsc --noEmit → exit 0
bun test          →  578 pass / 0 fail   (was 572; +6 — new lib/scheduler/rental-gear.test.ts)
bun run build     → ok
git status        →  2 source modified (BookingModal · dictionaries) · 2 new (RentalGearLine.tsx + its test) · 1 pin moved
```
No BE change. 📦 Folds into the held `uat` batch. 🚫 No deploy asked.

### `§1` — what was built, and the shape I chose
- **A separate component (`RentalGearLine`), not a `readOnly` flag inside `RentalSection` — and this is the reason:**
  that section is three doors, a money post and six named server codes. A branch through it would put *"a coach must
  never see money"* one boolean away from every one of them, and the next person to add a door there would have to
  remember the rule. The gear line **imports no price source, holds no door and reads no `paid`** — there is nothing
  in the file to leak. The section itself was not touched (pinned: it still holds `calendar.rental`, still has
  `usePayBookingRental`, and knows nothing of `scoped`).
- **The one line in `BookingModal`:** `{scoped ? <RentalGearLine … /> : <RentalSection … />}` — the unscoped view is
  byte-identical in behaviour (mutations 6 and 7 swap either way and fail).
- **What a coach sees:** `Equipment to prepare: Full Set` and the remark beneath it. That is the whole render.
- ✅ **`paid` IS in the object handed to the component** — I checked before building: the REQ-097 scope decides which
  BOOKINGS a coach reads, not which fields, and `booking.rental` carries `{ code, remark, paid }` on the teacher's own
  calendar read. **So your read was right and no BE change is needed** — the task really was "do not render it".
- **A session with no rental renders NOTHING** — asserted as the stripped text being exactly `""`: no empty box, no
  `—` (mutation 4 renders a dash box and fails). A rental with no remark shows the item alone.

### 🔑 The absences, pinned by RENDERING (the point of the task)
With `paid: true` **and** `paid: false`, the rendered output contains: no `฿`, no *"baht"*, no `Rent 2…` price shape,
no **Paid / Unpaid / จ่ายแล้ว / ยังไม่จ่าย / ค้างชำระ**, and no `<button>`, `<a>`, `<input>` or `role="button"`. The source
pin adds: no `.paid` read, no `useRentalPrices`/`rentalPrintLine`/`useSellablePackages`, no rental mutation hook, and
**exactly one hook call in the file — `useT(`**.

### 🔑 Break-and-watch — eight, `try/finally`, checksum, `BASELINE=0` on a green suite
| # | mutation | result |
|---|---|---|
| 1 | `paid` leaks into the coach's view | **2 fail** |
| 2 | a button appears in the coach's view | **1 fail** |
| 3 | a price is printed for the coach | **1 fail** — 📌 written as a no-op first (a `const` nothing rendered); replaced by one that actually prints `200 ฿` |
| 4 | a no-rental session renders an empty box | **1 fail** |
| 5 | the remark is dropped (the coach's whole reason to look) | **1 fail** |
| 6 | the coach gets the FULL section again | **2 fail** |
| 7 | the gear line shows for everyone (the unscoped section lost) | **3 fail** |
| 8 | the dead `course.defaultRateLine` comes back | **1 fail** |
`md5` identical on the three mutated files.

### ✅ Folded in: @Sober's ruling of 09-24
**`course.defaultRateLine` is deleted** — both languages, plus its entry in the duo copy list, with the reason named
(the card's restructure in `510e2e7` split it into `course.defaultRate` + `course.rateValue` and left it without a
reader). Mutation 8 brings it back and the suite fails, so it cannot drift back in unnoticed.

### Pin moved
`teacher-scope.test.ts` pinned the literal `{!scoped && <RentalSection …>}` — the exact line this REQ changes. Moved to
the new shape **with the reason written in**: the scoped branch is no longer "nothing", it is the gear line, which
mounts no data hook (so that file's neighbouring "the load path is the allowed set exactly" pin still holds unchanged).

### Definition of Done
- [x] The gear line by value (item + remark present; **price, paid state and every button absent** — asserted both ways)
- [x] A no-rental session renders nothing · the unscoped `RentalSection` untouched
- [x] **578 / 0** · `tsc` 0 · build ok · copy +1 both languages
- [x] 🔑 Break-and-watch — eight, `BASELINE=0`, `finally`, checksum, incl. the `paid` leak and the button

### ⚠️ Not seen on a screen
For @Tanya on `uat` (with the batch): sign in as a LINKED coach, open a session that has a rental ⇒ one grey line
*"Equipment to prepare: Full Set"* with the remark under it — **no price, no Paid/Unpaid, no buttons**; the same coach
on a session without a rental ⇒ no box at all; an ADMIN on the same session ⇒ the full rental section exactly as
before (add · mark paid · remove). Worth one check in Thai too: the line reads *"อุปกรณ์ที่ต้องเตรียม: ชุดเต็ม"*.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-24)
Re-run by me: **578 pass / 0 fail** · tsc 0 · build ok · `RentalGearLine.tsx` present. I checked the two things that looked like loose ends and both are clean: the three remaining `defaultRateLine` hits are the TEST asserting the key is gone from both dictionaries, and the two `paid` mentions in the new file are COMMENTS explaining why it is deliberately unread — there is no `.paid` access in the component.
**Her structural call is the right one and the reasoning is the part worth keeping:** a separate component rather than a `readOnly` flag inside `RentalSection`, *because that section is three doors, a money post and six server codes — a branch through it would put "a coach must never see money" one boolean away from every one of them, and the next person adding a door there would have to remember the rule.* The gear line **imports no price source, holds no door and reads no `paid`**: there is nothing in the file to leak. That is the difference between a rule enforced by structure and a rule enforced by memory.
Also right:
1. **She checked the payload before building** and confirmed `paid` really is handed to the component — so the task was genuinely "do not render it", and she said so rather than letting my read stand unverified.
2. **The absences are pinned by RENDERING, with `paid: true` AND `paid: false`** — no `฿`, no baht, no Paid/Unpaid in either language, no `<button>`/`<a>`/`<input>`/`role="button"` — plus source pins (no `.paid`, no price hooks, exactly one hook call in the file). Pinning what the coach's screen does *not* contain is exactly what this task was for.
3. 📌 **Mutation 3 was written as a no-op first** — a `const` nothing rendered — and she replaced it with one that actually prints a price. A mutation that cannot be seen by the test proves nothing; catching that in her own harness is this week's lesson applied to herself.
4. **The moved pin carries its reason:** `teacher-scope.test.ts` pinned the literal old line, and the scoped branch is no longer "nothing" but a component that mounts no data hook — so the neighbouring "the load path is exactly the allowed set" pin still holds unchanged, and she said why.
5. My `course.defaultRateLine` ruling is folded in with the reason named, and mutation 8 brings it back to prove it cannot drift in again.
