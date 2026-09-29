# TASK-482 — the chip that makes the wall QR visible: "เช็คอินจาก QR หน้าร้าน / Shop QR" — FE, XS

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-25) · **Size XS.** Rides this `uat` release. **Needs TASK-481's field** — start when it lands; if the field is absent on your read, stop and tell me rather than deriving it.

## §0 What it is for (please read this before choosing a shape)
The owner accepted a gap in REQ-108: **a family with no linked LINE gets no notice when someone checks their child in.** For that family this chip is the *entire* safety net — the only way anyone will ever know a check-in came from the wall QR rather than from a member of staff who looked at the person in front of them. So it is read **after** something has gone wrong, by an admin scanning a list for the odd one out.
⇒ It should be **quiet and unmissable at the same time**: not an alarm (most shop-QR check-ins are perfectly normal), but never something the eye slides over on a busy roster.

## §1 Build
- On the **session roster row** and the **booking detail**, where the ATTENDED state is shown: a small chip reading **`เช็คอินจาก QR หน้าร้าน` / `Shop QR`** when `checkinSource === "shopfront-qr"`.
- 🔑 **Only that value gets a chip.** `checkin-qr`, `end-of-day`, `staff` and `null` render **nothing** — this release. A chip on every row is a chip nobody reads, and the one we care about disappears into it. (If you think one of the others earns a chip, say so; do not add it.)
- **The mapping lives in exactly one place**, value → label, both languages. The next source we invent must have one obvious place to be named.
- **By value, and assert the ABSENCES:** `shopfront-qr` ⇒ the chip's text present on the row; each of the other four ⇒ the rendered output contains **no chip and no stray label**; an unknown/new source string ⇒ **nothing rendered and nothing thrown** (a box that says `undefined` in front of the customer is worse than no box).
- 🚫 No new API call, no BE change, nothing added to a teacher's view. Copy counted, both languages.

## Definition of Done
- [ ] The chip on both surfaces by value · the other four sources render nothing (asserted) · an unknown value is safe · the mapping in one place · suite **count** · tsc · build ok · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation that chips every source and one that prints a raw/`undefined` value · report here + `inbox/SA.md` + log.


---

## §2 ✅ IMPLEMENTED — Fern, 2026-09-26. **One value has words; everything else is silence.**

```
bunx tsc --noEmit → exit 0
bun test          →  591 pass / 0 fail   (was 586; +5 — new lib/scheduler/checkin-source.test.ts)
bun run build     → ok
git status        →  2 new (lib/scheduler/checkin-source.ts + test) · 6 source modified
```
Built to TASK-481 §2 (the field is live — I read it before building). No BE change. 📦 Rides this `uat` release. 🚫 No deploy asked.

### `§1` — the chip
- **ONE map, one component.** `lib/scheduler/checkin-source.ts` holds `SHOPFRONT_SOURCE`, the source → copy-key map and
  `checkinSourceLabelKey`; `CheckinSourceChip` (beside the other badges) renders whatever that key says and **returns
  `null` when it says nothing**. The chip contains no source literal of its own (mutation 5 makes it decide and fails).
- **`shopfront-qr` only.** `checkin-qr`, `end-of-day`, `staff`, an admin's USERNAME (`admin.somchai`), `""`, a
  differently-cased `SHOPFRONT-QR`, an underscored `shopfront_qr`, `null` and `undefined` — ten values — all render
  **nothing**: pinned by RENDERING (the stripped output is exactly `""`), and the raw value never reaches the screen
  (mutations 1, 2, 3).
- **Both surfaces, from the same component:** the Bookings roster row (beside the status chip it belongs to) and the
  booking detail's header (beside status + type). Mutation 6 drops the roster one and fails.
- **Quiet and unmissable,** as §0 asked: an **outlined amber** chip — not a red alarm, because most shop-QR check-ins
  are perfectly ordinary — with a title line saying *"Checked in by the family at the shop-front QR, not by staff"* for
  the admin who hovers it while scanning a roster.
- 🚫 **A coach's `null` is the server's decision and is not re-implemented:** asserted that neither the lib, the chip nor
  either surface mentions `scoped`/`teacher` near this field. **If a coach ever sees a chip, that is a BE defect and I
  will report it rather than patch the view.**
- **The mapper carries the field as sent** — absent ⇒ `null`, never a guess (mutation 7 substitutes `"staff"` and fails).
- **I did not add the other four chips** (your ruling, and I agree): a chip on every row is a chip nobody reads, and the
  one that matters would vanish into it. Nothing to say about them.

### 📌 A real defect my own test caught — the source is free text used as a MAP KEY
For a staff check-in the value is an **admin's USERNAME**, so this is open-ended text reaching `LABELS[source]`. With a
plain object, `checkinSourceLabelKey("toString")` returned **`Object.prototype.toString` — a FUNCTION** — which the chip
would have rendered in front of a customer. Fixed: a **frozen null-prototype map** plus `Object.hasOwn`. And because the
first version of the pin only checked the RESULT, a mutation that restored the plain lookup passed while the map was
still safe — so **both halves are pinned now**: the prototype and the freeze by value, the `hasOwn` by source.
⚠️ **Stated as a limit:** with a null-prototype map the two lookup shapes are behaviourally identical, so that half
cannot be pinned by value at all — the pair is what is guarded, and touching either half now fails a test.

### 🔑 Break-and-watch — eight, `try/finally`, checksum, `BASELINE=0` on a GREEN suite
| # | mutation | result |
|---|---|---|
| 1 | every source gets a chip | **2 fail** |
| 2 | an unknown source prints the RAW value | **2 fail** |
| 3 | an unknown source prints `undefined` | **1 fail** |
| 4 | the map goes back to a plain object (inherited keys can answer) | **1 fail** |
| 4b | the lookup goes back to the truthy plain read | **1 fail** (by the source pin — see the limit above) |
| 5 | the chip decides the value itself instead of the ONE map | **2 fail** |
| 6 | the roster row loses the chip | **1 fail** |
| 7 | the mapper invents a source when the payload has none | **1 fail** |
`md5` identical on the four mutated files.

### Definition of Done
- [x] The chip on both surfaces by value · the other four sources render nothing (asserted) · an unknown value is safe
- [x] The mapping in one place · copy +2 both languages · **591 / 0** · `tsc` 0 · build ok
- [x] 🔑 Break-and-watch — eight, `BASELINE=0`, `finally`, checksum, incl. chipping every source and printing a raw/`undefined` value

### ⚠️ Not seen on a screen
For @Tanya on `uat`: check a child in from the wall QR, then open **Bookings** ⇒ that row shows an amber
**เช็คอินจาก QR หน้าร้าน** beside ATTENDED (hover it for the sentence); open the same booking on the calendar ⇒ the same
chip in the header. Then check someone in as staff (or from the LINE link) ⇒ **no chip at all** on either surface — that
is the whole point. And as a linked COACH: no chip anywhere, on any row (if one appears, it is a BE defect — tell
@Porter rather than me).

---

# ✅ DONE — REVIEWED by @Sober (2026-09-26)
Re-run by me: **591 pass / 0 fail** · tsc 0 · build ok · `src/lib/scheduler/checkin-source.ts` is one frozen, null-prototype map with one entry and one lookup, read by `BookingBadges`.

🔴 **Her find is a real security defect, and she found it in her own test rather than in the task.** The stored value is an **admin username** — free text from outside — and it was being used as a **map key**. On a plain object, `checkinSourceLabelKey("toString")` returned `Object.prototype.toString`: **a FUNCTION, handed to the chip to render in front of a customer.** The fix is a null-prototype frozen map plus `Object.hasOwn`, own keys only.
📌 **Worth naming precisely, because it is a class of bug and not an incident:** the moment a value crosses from *a word from a list* to *free text a human typed*, every place it is used as a key, a lookup or a property name changes meaning. Nothing in my task said so, and nothing in Jason's DTO change said so either — **the fact that made it dangerous (a staff attend stores a username) was discovered two tasks upstream and its consequence landed three files away.** That is the thing to carry: when a value's *kind* changes, the search is for every place it is used as a name, not every place it is displayed.
✅ And the limit she states is the honest one: with a null-prototype map, `Object.hasOwn` and a plain `in` are **behaviourally identical**, so the prototype and the freeze are pinned by value and the `hasOwn` by source. She says that rather than implying the source pin proves behaviour it cannot.

**The rule is built as ruled:** `shopfront-qr` alone gets a chip; **ten values** — the other sources, an admin username, `""`, a mis-cased and an underscored variant, `null`, `undefined` — render **nothing**, pinned by RENDERING as an empty stripped output, and the raw value never reaches the screen. One map, one component, both surfaces.
🚫 **The coach's `null` stays the server's rule** — no `scoped` or `teacher` anywhere near the field, and she says she would **report** a chip reaching a coach as a BE defect rather than patch the view. That is exactly right: a rule enforced in two places is a rule that will disagree with itself.
**Outlined amber with a hover sentence** — quiet, not an alarm. That matches what it is for: most shop-QR check-ins are ordinary, and this is read by an admin scanning for the odd row.

**REQ-108 is now complete on both sides, and the release is code-complete.**
