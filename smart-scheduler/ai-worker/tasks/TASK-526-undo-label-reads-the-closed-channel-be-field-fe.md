# TASK-526 — the Undo label should read `checkinChannel` (the closed set) instead of guessing from `checkinSource` — FE, XS

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-27) · **Size XS.** Your own note in TASK-518.

## §0 Why now rather than later
Your label picks **`ย้อนการเช็คอิน`** when the row's source is one of a **closed set you hard-coded** (`shopfront-qr` · `checkin-qr` · `line`), because **`checkinSource` is open-ended — a staff check-in carries a USERNAME.** You wrote: *"TASK-488's `checkinChannel` is exactly the closed set this wants; when it lands the guess disappears."*
🔑 **It has landed** — migration 0057 split that column into **a channel (a closed set) and an actor (free text)**, precisely because one column holding both is what nearly put an admin's username in a parent's reply. **So the guess can go today.**

## §1 Build
- **Read `checkinChannel`.** The channel is the closed set; **the label's decision becomes a fact rather than a guess about strings.**
- 🔑 **Keep your safe default:** anything you do not recognise still reads as the general **attendance** wording. **Both labels lead to the same act, so the general word is the right fallback** — that reasoning was correct and survives the change.
- 🚫 **Do not read `checkinActor`.** It is a person's username, it has no business on a label, and TASK-488 exists to keep the two apart.
- **Remove the hard-coded channel list** if nothing else needs it; if something does, **say what.**
- 📌 **`checkinSource` is still sent** (the old columns were deliberately kept). **Say whether anything else in the FE still reads it** — if the answer is "only this", that is worth knowing for the day the BE drops it.

## Definition of Done
- [ ] The label decided from **`checkinChannel`**, by value for each channel · the unrecognised case still reading as **attendance**, pinned · 🚫 `checkinActor` unread (assert it) · the hard-coded list removed or its other use named · whether anything else reads `checkinSource`, stated · suite **count** · tsc · build ok · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation reading `checkinActor` and one that makes an unknown channel read as a check-in · report here + `inbox/SA.md` + log.


---

## §2 ✅ IMPLEMENTED — Fern, 2026-09-27. **The guess is gone: the label reads the closed channel.**

```
bunx tsc --noEmit → exit 0
bun test          →  622 pass / 0 fail   (was 620; +2)
bun run build     → ok
git status        →  5 source modified (contract · scheduler types · mappers · lib/scheduler/undo.ts · a PlanModal comment) · 1 test extended
```
🚫 No BE change. 🚫 No deploy asked.

### `§1` — what changed
- **The contract gained the pair:** `checkinChannel?: CheckinChannel | null` and `checkinActor?: string | null`, beside the
  **deprecated** `checkinSource` (kept until the BE drops it). `CHECKIN_CHANNELS` mirrors the BE's `lib/checkin-channel.ts`
  — `checkin-qr · line · shopfront-qr · staff · end-of-day` — and is pinned equal to those five (mutation 6).
- **`undoKind` reads the channel.** Pinned **by value for every channel of the closed set**: the three scans ⇒ *check-in*;
  `staff` and `end-of-day` ⇒ *attendance* (mutation 4 promotes `staff` to a scan and fails). The type makes a typo a
  compile error, which the old string guess could not.
- 🔑 **The safe default survives**, as you asked: an unknown channel, a mis-cased one (`SHOPFRONT-QR`), an underscored one,
  or none at all still reads as the general **attendance** wording (mutation 2 fails). Both labels lead to the same act,
  so **a mislabel is cosmetic while a missing control would not be.**
- 🚫 **`checkinActor` is never read** — asserted absent from the lib's **code** and from the control. 📌 The pin reads the
  comment-stripped source deliberately: the prose is allowed to say *"the actor is never read"* while the code may not do
  it — my first version of the pin read the raw file and failed on its own explanation.
- **The mapper carries both as sent**; an absent channel stays absent (mutation 7 substitutes `"staff"` and fails) —
  inventing one would make an unscanned row read as a scan.

### 📌 The hard-coded list: not removed, CHANGED KIND — and why
You asked me to remove it "if nothing else needs it, and say what if something does". **The list stays, and this is the
honest reason:** `SCAN_CHANNELS` no longer guesses which strings might be channels — that part is gone. What it now says
is **which of the server's five channels mean a FAMILY SCANNED**, which is a product question the BE does not answer (its
set is complete and flat: `staff` and `end-of-day` are channels too). So it is a typed **subset** —
`readonly CheckinChannel[]` — and both halves are pinned: every member must be in `CHECKIN_CHANNELS` (mutation 3 adds a
channel that does not exist and fails) and the membership itself is pinned by value.

### 📌 What else reads `checkinSource` — the answer is: exactly one thing
**The TASK-482 wall-QR chip** (`lib/scheduler/checkin-source.ts` → `CheckinSourceChip`, on the Bookings roster and the
booking detail). Nothing else in `src` reads the field. ⚠️ **TASK-488 §78 says that chip should read
`checkinChannel === "shopfront-qr"` too** — the closed field it always wanted — but that is outside this task, so **I did
not touch it.** Two things follow, for you to rule on:
1. It is a one-line change in `checkin-source.ts` plus its pins; I am happy to do it in a task of its own.
2. **Until it moves, the BE cannot drop `checkinSource`** — the chip is the last reader, and dropping the column while it
   reads it would silence the chip without failing a single test on either side. Worth knowing before that drop is
   scheduled.

### 🔑 Break-and-watch — seven, `try/finally`, checksum, `BASELINE=0` on a GREEN suite
| # | mutation | result |
|---|---|---|
| 1 | the label reads `checkinActor` (a person's username) | **2 fail** |
| 2 | an UNKNOWN channel reads as a check-in (the safe default lost) | **1 fail** |
| 3 | the scan list drifts from the closed set (a channel that does not exist) | **1 fail** |
| 4 | `staff` counts as a scan | **1 fail** |
| 5 | the label goes back to the deprecated open-ended source | **2 fail** |
| 6 | the closed set drifts from the BE's five | **1 fail** |
| 7 | the mapper invents a channel when none was sent | **1 fail** |
`md5` identical on the three mutated files.

### Definition of Done
- [x] The label decided from **`checkinChannel`**, by value for each channel · the unrecognised case still **attendance**, pinned
- [x] 🚫 `checkinActor` unread (asserted) · the hard-coded list's other use **named** (it changed kind; the reason is above)
- [x] Whether anything else reads `checkinSource` — **stated: only the TASK-482 chip**, and what that means for the drop
- [x] **622 / 0** · `tsc` 0 · build ok · 🔑 seven mutations, `BASELINE=0`, `finally`, checksum

### ⚠️ Not seen on a screen
Nothing moved visually — the same three labels, decided from a better field. For @Tanya it is one check: an ATTENDED row
checked in **from the shop QR** still reads **ย้อนการเช็คอิน**, and one a **member of staff** marked still reads
**ย้อนการเข้าเรียน** (before this change a staff attend could have read either way, depending on what the old column held).

---

# ✅ DONE — REVIEWED by @Sober (2026-09-27)
Verified: **622 pass / 0 fail** · tsc 0 · build ok.

🔑 **"The hard-coded list did not disappear, it CHANGED KIND" — and that is the honest answer, not a smaller one.** The part that **guessed which strings might be channels** is gone. What remains says **which of the five channels mean a family SCANNED** — and she is right that **my set does not answer that**: `staff` and `end-of-day` are channels too. ⇒ **a typed SUBSET, every member required to exist in the channel set, drift failing, membership pinned by value.**
📌 **I asked her to remove a list; she established that two different lists were hiding inside it** — one a guess about the data's shape, the other **a product judgement about what "a family checked in" means.** **Deleting the second along with the first would have been the tidy answer and the wrong one.**
✅ **And the safe default survives with the reason restated: a mislabel is cosmetic, a missing control would not be.** That is the right way round for a control whose absence is the serious failure.

🔑 **The pin detail is the best small thing in this report: her first version asserted `checkinActor` is never read, and FAILED ON ITS OWN EXPLANATION** — the comment naming the rule tripped the check looking for the rule being used. It now reads the **comment-stripped** code. 📌 *The prose may name the rule while the code may not do it* — **and a pin that cannot tell its own documentation from its subject will eventually be "fixed" by deleting the comment.**

## 🔴 Her finding, and it is a live trap for someone else's task
**Exactly one thing still reads `checkinSource`: the TASK-482 wall-QR chip** — and she deliberately did not touch it (out of scope, correctly).
⚠️ **So `checkinSource` cannot be dropped while that chip is its last reader — and dropping it would silence the chip WITHOUT FAILING A SINGLE TEST ON EITHER SIDE.**
🔑 **That is precisely the shape of thing that gets discovered by a customer:** the column's drop is a BE task, the chip is an FE file, and **nothing in either repo objects.** The chip is the only evidence an unlinked family will ever have that a wall-QR check-in happened (REQ-108 §5), so **its silence would be invisible and expensive.** ⇒ **TASK-527, cut now rather than waiting for the drop to be scheduled.**
