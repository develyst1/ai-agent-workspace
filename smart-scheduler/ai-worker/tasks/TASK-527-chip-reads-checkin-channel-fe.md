# TASK-527 — the wall-QR chip is the last reader of `checkinSource`, and dropping that column would silence it without failing a test — FE, XS

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-27) · **Size XS.** Your finding at the end of TASK-526.

## §0 Why now and not when the drop is scheduled
TASK-488 split the provenance into **a channel and an actor** and **deliberately kept the old columns**, to be dropped later. You established that **the TASK-482 wall-QR chip is now the only thing reading `checkinSource`.**
🔴 **If that column is dropped while the chip reads it, the chip goes silent — and NOTHING fails, on either side.** The drop is a BE task; the chip is an FE file; **neither repo objects.**
🔑 **And the chip is not decoration: it is the only evidence an unlinked family will ever have that a wall-QR check-in happened** (REQ-108 §5, the gap the owner accepted). **Its silence would be invisible and expensive** — which is exactly the shape of defect a customer finds for us.

## §1 Build
- **The chip reads `checkinChannel === "shopfront-qr"`.** 🔑 **Only that channel gets a chip**, unchanged — the other four render nothing, as ruled in TASK-482.
- 🚫 **`checkinActor` unread**, asserted — and use the **comment-stripped** assertion you built in TASK-526, for the same reason.
- **The other absences stay pinned:** an unknown or absent channel renders **nothing and throws nothing**.
- 🔑 **Then say whether ANYTHING in the FE still reads `checkinSource`.** If the answer is "nothing", **say it plainly** — that sentence is what makes the column's drop safe, and it is the deliverable as much as the chip is.
- 📌 **And tell me whether a test would now FAIL if the field vanished.** If the honest answer is "no, the chip would just render nothing", **say so** — I would rather know that the safety net is my review than believe it is a test.

## Definition of Done
- [ ] The chip reading `checkinChannel`, `shopfront-qr` only, by value · the other four and unknown/absent rendering nothing (asserted) · `checkinActor` unread, asserted on comment-stripped code · **whether anything in the FE still reads `checkinSource`, stated plainly** · **whether a test would fail if the field vanished, answered honestly** · suite **count** · tsc · build ok · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation chipping every channel and one reading `checkinActor` · report here + `inbox/SA.md` + log.


---

## §2 ✅ IMPLEMENTED — Fern, 2026-09-27. **The chip reads the closed channel; `checkinSource` has no reader left in the FE.**

```
bunx tsc --noEmit → exit 0
bun test          →  623 pass / 0 fail   (was 622; +1)
bun run build     → ok
git status        →  4 source modified (lib/scheduler/checkin-source.ts · BookingBadges · BookingsTable · BookingModal) · 1 test rewritten
```
🚫 No BE change. 🚫 No deploy asked.

### `§1` — the chip
- `checkinChannelLabelKey(channel)` replaces the source lookup; `SHOPFRONT_CHANNEL` is typed `CheckinChannel`, so a typo
  is a compile error. **Every channel of the closed set is decided by value:** `shopfront-qr` has words, the other four
  (`checkin-qr` · `line` · `staff` · `end-of-day`) render **nothing** — as TASK-482 ruled — and so do an unknown channel,
  a mis-cased one, `""`, `null` and `undefined`, **pinned by RENDERING** (the stripped output is exactly `""`).
- The component takes `channel` now (`data-checkin-channel` on the badge), and both sites pass `b.checkinChannel` /
  `booking.checkinChannel`.
- 🚫 **`checkinActor` is never read**, asserted on the **comment-stripped** code — TASK-526's lesson applied on purpose:
  the prose may name the rule while the code may not do it.
- 📌 **I kept the null-prototype map and `Object.hasOwn`** even though the channel is a closed set and the `toString`
  hazard is gone with it: the guard costs nothing at runtime, and the map is one `as unknown as` away from being fed free
  text again if a later task widens the field. A map whose keys come from outside stays a null-prototype map (mutation 6).

### ✅ Answer 1 — **nothing in the FE reads `checkinSource` any more**
Said plainly, because this sentence is what makes the column's drop safe. A walk of `src` leaves exactly three mentions,
none of them a reader:
1. `lib/api/mappers.ts` — `checkinSource: dto.checkinSource ?? null`, a **passthrough** onto the app type. Nothing
   consumes the property.
2. `types/api/contract.ts` + `types/app/scheduler/index.ts` — the **optional, deprecated** field declarations.
3. `lib/scheduler/checkin-source.ts` — the dictionary **key name** `"checkinSource.shopfrontQr"` (a copy path, not a
   payload field) and the file's own name/comments.
🔑 **So the pin names the FIELD ACCESS** (`/\.checkinSource\b/` over the lib, the chip and both sites) **rather than the
string**: renaming the copy key later is not a regression, while pointing the chip back at the column is (mutation 3).
📌 I deliberately did **not** delete the mapper line or the type fields: the BE kept those columns on purpose for its
deprecation window, and removing the passthrough now would only make the FE disagree with a payload that still carries the
field. **One line when the drop lands, and it is the smallest possible change** — say the word and I will do it in the
same task that meets the drop.

### ✅ Answer 2 — **would a test fail if the field vanished? Honestly: no — and that is now the right answer**
- **Today: no test fails**, because nothing reads it. The mapper yields `null`, no render changes, and no assertion
  touches the value. Its disappearance is invisible **by design** rather than by luck.
- **Before this task the same "no" was the danger:** the chip read it, so a drop would have silenced the only evidence an
  unlinked family gets of a wall-QR check-in — and nothing, on either side, would have objected.
- 🔑 **What fails now is the regression, not the drop:** pointing the chip (or anything in these four files) back at
  `checkinSource` fails, and so does chipping a channel that should be silent. **The net is a test, not your review** —
  but the net is around *"do not read the deprecated column"*, not around *"the column still exists"*, and I would rather
  say that precisely than let it read as broader than it is.

### 🔑 Break-and-watch — seven, `try/finally`, checksum, `BASELINE=0` on a GREEN suite
| # | mutation | result |
|---|---|---|
| 1 | every channel gets a chip | **2 fail** |
| 2 | the chip reads `checkinActor` (a person's username) | **2 fail** |
| 3 | the chip goes back to the deprecated `checkinSource` | **2 fail** |
| 4 | `staff` gets the wall-QR chip | **2 fail** |
| 5 | an unknown channel prints the RAW value | **2 fail** |
| 6 | the map goes back to a plain object (inherited keys can answer) | **1 fail** |
| 7 | the mapper invents a channel when none was sent | **2 fail** |
`md5` identical on the four mutated files.

### Definition of Done
- [x] The chip reading `checkinChannel`, `shopfront-qr` only, by value · the other four and unknown/absent rendering nothing (asserted)
- [x] `checkinActor` unread, asserted on comment-stripped code
- [x] **Whether anything in the FE still reads `checkinSource`: nothing does** — the three remaining mentions named above
- [x] **Whether a test would fail if the field vanished: no, and why that is now safe** — the net is around reading it again
- [x] **623 / 0** · `tsc` 0 · build ok · 🔑 seven mutations, `BASELINE=0`, `finally`, checksum

### ⚠️ Not seen on a screen
Nothing moved visually. For @Tanya it is the same one check as before: a row checked in from **the poster's QR** still
wears the amber **เช็คอินจาก QR หน้าร้าน** chip on the Bookings roster and in the booking detail, and a row checked in by
**staff**, from the **LINE link**, or by the **day-end** still wears **no chip at all**.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-27). **Both repos are clear.**
Verified: **FE 623 / 0** · tsc 0 · build ok · **BE 3407 / 0** in the same tree.

## 🔑 Answer 2 is the best thing in this report, and it is a "no"
I asked *"would a test fail if the field vanished?"* and said **no was an acceptable answer**. She answered **no — and then explained why the same "no" means the opposite of what it meant yesterday**:
> **Before this task the "no" was the danger** — the chip read the column, so a drop would have silenced an unlinked family's only evidence of a wall-QR check-in **with neither repo objecting.** **Now nothing reads it, so its disappearance is invisible by design.**
> **What fails now is the regression, not the drop:** re-pointing the chip at `checkinSource`, or chipping a channel that should be silent.
📌 **"So the net is a test — but it is around *do not read the deprecated column*, not around *the column still exists*, and I would rather state that precisely than let it sound broader than it is."**
🔑 **That is the standard I want quoted the next time anyone reports a safety net.** The honest answer was available in two forms — *"yes, it's covered"* (false in the useful sense) and *"no, and here is what IS covered instead"* — **and she gave the second one unprompted.** A green suite that protects the wrong property is how a team ends up trusting nothing in particular.

## The rest
✅ **Answer 1 precise too:** nothing reads it; the three remaining mentions are **a passthrough, two deprecated optional type fields, and a dictionary KEY NAME** — and 🔑 **the pin names the FIELD ACCESS rather than the string**, so *"renaming the copy key later is not a regression, while pointing the chip back at the column is."* **A pin aimed at the thing that would actually be wrong.**
✅ **She kept the passthrough and the deprecated fields deliberately** — *the deprecation window still sends the field, and removing them now would make the FE disagree with a live payload* — and offered the one line **for the task that meets the drop.** Correct: the FE must not lead the contract.
✅ **She kept the null-prototype map and `Object.hasOwn` even though the `toString` hazard left with the open-ended field** — *the guard costs nothing and the map is one `as unknown as` away from being fed free text again.* **Keeping a cheap guard after its known threat retires is right**; the threat we know about is rarely the last one.
✅ `checkinActor` unread, asserted on comment-stripped code — **her own lesson from the previous task, applied deliberately rather than remembered.**
