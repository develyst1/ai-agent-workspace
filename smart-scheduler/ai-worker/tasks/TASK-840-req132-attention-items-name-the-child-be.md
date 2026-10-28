# TASK-840 — BE: **REQ-132 every Attention item of "ใกล้ใช้ครบ" and "ใกล้หมดอายุ" names the child** (+ a link target for the front) — @Jason, ≈ 0.35 d incl. +10%
**From @Sober, 2026-10-27.** GO by Porter; the owner: *"B"* (names + links; the LINE digest unchanged). Front half = TASK-841 (Fern). **Git: on the owner's word only.**

## Today (my read, REQ-132 "answers 1–3")
The items are labelled with no child (`lib/attention.ts`):
- `nearly_finished_courses` (`:278-289`): `course <size> · เหลือ <n>`;
- `expiring_entitlements` (`:259-275`): `course <size> · <expiry>` and `voucher <hours>h · <expiry>`.

## Do
1. **The label leads with the child:** `<child> · course <size> · เหลือ <n>` · `<child> · course <size> · <expiry>` · `<child> · voucher <hours>h · <expiry>`.
   - **The child = the existing ONE name rule** (`studentNamesOf` in `db/mappers.ts:193`, or whichever helper the course / voucher row already feeds). **A DUO course names both children**, as every notice does.
   - Load the student with the rows if `getCourses()` / the voucher loader don't already carry it. **No N+1:** one read per check.
   - A row with no student shows the label as today.
2. **A link target on each item of these two checks:** `link: { kind: "course" | "voucher", id }`. **Other checks: no `link` key** (byte-identical).
3. **No new words.** "course", "เหลือ", "voucher" are already on the screen.
4. **The LINE digest stays counts-only, unchanged** (the owner: no longer LINE message; and names stay behind the login). **Test it.**
5. **Who sees the Attention page is unchanged** (`menu:attention`).

## Tests by value
- A course with 2 left for "น้องเอ" ⇒ `น้องเอ · course 10 · เหลือ 2`.
- A DUO course ⇒ both names.
- An expiring course and an expiring voucher ⇒ both lead with the child.
- `link` is right for a course and for a voucher.
- **The digest text for these two checks is byte-identical** (counts only).
- Another check's items have no `link` and are unchanged.

## Mutations
- The name dropped.
- DUO shows one child.
- The digest gains names.
- `link.kind` wrong for a voucher.

## Done means
- tests by value + the set (each bite shown);
- tsc 0 · the SAFE suite;
- `unhandled-between-tests: N`;
- `git status` in full;
- **write the item shape (incl. `link`) in your report, for Fern.**

**List every pin first.** Other teams' files in the tree: leave them alone; list only yours.


## Jason (BE) 2026-10-27 — TASK-840 BE (REQ-132): the Attention items name the child + a `link` — GREEN

**Built (back):**
- `lib/attention.ts`: a `childLead(row)` helper on THE one name rule (`studentNamesOf` — a DUO course names both children, `A & B`). The labels of the two checks now lead with it: `nearly_finished_courses` → `<child> · course <size> · เหลือ <n>`; `expiring_entitlements` → `<child> · course <size> · <expiry>` and `<child> · voucher <hours>h · <expiry>`. A row with no student keeps its old label (no leading separator).
- **No extra read, no N+1:** `getCourses()` already loads `student` + `coStudent` with each course and `getVouchers()` loads `student` with each voucher — the checks just read them.
- `AttentionItem` (+ `attention.service.ts`'s item type) gains an optional `link`; only these two checks set it. Every other check: **no `link` key**, labels byte-identical.
- **The LINE digest is unchanged and counts-only for these two checks** (`namesPeopleInDigest` stays unset; names stay behind the login). Who sees the page is unchanged (`menu:attention`; the mask keeps `link` through).
- No new words; no migration; no kind; no pin touched (suite 0 red).

**Item shape — for @Fern (`GET` the attention checks; each item of the two checks):**
```
{ "id": "<course|voucher id>",
  "label": "น้องเอ · course 10 · เหลือ 2",            // nearly_finished_courses
  "link": { "kind": "course", "id": "<course id>" } }

{ "id": "…", "label": "น้องเอ & น้องบี · course 10 · 2026-08-10", "link": { "kind": "course",  "id": "<course id>"  } }   // expiring_entitlements — a course (DUO: both names)
{ "id": "…", "label": "น้องบี · voucher 10h · 2026-08-10",       "link": { "kind": "voucher", "id": "<voucher id>" } }   // expiring_entitlements — a voucher
```
`link.kind` ∈ `"course" | "voucher"`; `link.id` = the item's `id`. Other checks' items: `{ id, label, hint? }` exactly as before — no `link` key. The label's date part is still the raw `expiryDate` (ISO) as before — I did not change its format (REQ-132 is about the name); say if the front should format it.

**Tests (new `src/lib/attention-names-the-child-task840.test.ts`, 11, by value):** course with 2 left for «น้องเอ» ⇒ `น้องเอ · course 10 · เหลือ 2` + link course · DUO ⇒ `น้องเอ & น้องบี · …` · no student ⇒ the old label · a nickname-less child reads by name · expiring course AND voucher ⇒ both lead with the child, link kind right for each · studentless voucher keeps its label · **the LINE digest is BYTE-IDENTICAL (TH and EN) with or without names, and contains no child name** · both checks' `namesPeopleInDigest` unset · `unconfirmed_bookings` / `teachers_without_line` unchanged, no `link` · source pin (one helper on `studentNamesOf`, exactly 3 `link` sites).
**Set `attention-names-the-child-task840.mutations.json`: 7/7 BITE, 0 survivors, checksum identical** — C1 name dropped · C2 DUO shows one child · C3 the digest gains names · C4 `link.kind` wrong for a voucher · C5 the link missing on nearly-finished · C6 another check gains a `link` · C7 a voucher not led by the child.

**Verified:** tsc 0 · full suite **5,224 pass / 0 fail (372 files)**, unhandled 0 (TASK-749's earlier reds are gone from the tree). `git status` (all mine): `src/lib/attention.ts`, `src/services/attention.service.ts` (modified); `attention-names-the-child-task840.test.ts` + `.mutations.json` (new). Saved: `GIT-STATUS-back-840-2026-10-27.txt`. My run had `.env` present; your no-.env room is yours.

Ball: Sober.

## ✅ 2026-10-27 — @Sober: TASK-840 BE VERIFIED
- **No-`.env` clean room** of `f4aeb39` + 4 files: tsc 0 · SAFE suite **5,224 / 0**, 372 files · unhandled 0 · 73 = 73 · set 840 **7/7**, checksum identical.
- The item shape (above) is Fern's contract for TASK-841.
- **The raw ISO date in the expiring label:** left as is. It was already shown that way, and REQ-132 is about the name. Noted to Porter as a possible follow-up, not built.
- 🧊 The back tree is frozen (4 files); it ships with Fern's 841.
