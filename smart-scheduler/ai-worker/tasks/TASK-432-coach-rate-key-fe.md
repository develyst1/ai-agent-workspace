# TASK-432 — `REQ-102 §6/§7` FE: the §13.3 rate box / course default line / the (default|override) tag render ONLY with key 59; the Roles matrix shows the 59th key

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-22) · **Size S.** Against TASK-431's contract once CONFIRMED (I paste the final lines into §0). Pure parts now; wire after Jason's report. `sid`.

## §0 The contract — CONFIRMED 2026-09-22 (TASK-431)
Key `action:bookings.coach-rate` (59th, area `bookings`, TH `ดูและแก้ค่าสอน`). Without it the server sends `rate: null` on every booking row and `classRateMinor: null` on every course (a response mask; the shape kept); any body carrying `classRateMinor` ⇒ `403 ไม่มีสิทธิ์แก้ค่าสอน`; **a DUO create needs the key** (the rate is required at create — hide the DUO create door without 59, or show it with the rate field absent? NO: hide the whole DUO create without the key — no see-only state; the owner may later make the rate optional). Key 59 in `/api/me` `actions`. Independent of `teachers.budget-view`.

## §1
- The Move-session popup's *This session's rate* box + its tag + `Clear`; the course card's *Default coach rate* line + pencil; the DUO create form's rate field — each rendered ONLY with `can("action:bookings.coach-rate")` (hidden, never disabled; no `—` — the customer wants it ABSENT, not dashed). `sessionRateChange` never produces a body without the key (pinned: the key absent ⇒ no `classRateMinor` in any body).
- No client masking: the server nulls; the FE hides by the key. `rate: null` on a course row with the key ⇒ the box still shows (blank = default) — distinguish "no key" from "no rate" by the KEY, not the null.
- Roles matrix: the 59th arrives from `/permissions`. Snapshot 58 → 59 by position.
- Copy both languages, counted.

## Definition of Done
- [ ] Suite, **count** · tsc · build ok · the doors by the key (by value) · no body without the key · snapshot 59 = 59 · 🔑 Break-and-watch, `finally`, CHECKSUM · report here + `inbox/SA.md` + log.

## §0b AMENDED — REQ-102 §8 (owner 09-22) — read before wiring
1. **The DUO/course create door is NOT hidden** without key 59 — only the rate FIELD is absent; the create body carries no `classRateMinor` (the rate is optional at create now; a key-59 holder sets the default on the card later). Supersedes §0's "hide the whole DUO create".
2. **Key 59 also gates the ECA/Group per-teacher rates:** the OTHER create/edit dialogs' per-teacher rate inputs, the Manage-plan header's rates + the Add-teacher dialog's rate + Edit-header rates, the group series' rates — ABSENT without 59; the server sends `teacherRates: null` without the key (read null as "no key", never as ฿0). No `teacherRates`/`rateMinor` in any body without the key (pinned).
3. 57 and 59 independent — the budget `—` rule is 57's, the rate absence 59's; pinned they never read each other's key.
Wire against TASK-431 + TASK-434's lines (434 in flight — the field set is final as above).


---

## §2 ✅ IMPLEMENTED — Fern, 2026-09-22 (to §0b). **Every coach-rate surface renders ONLY with key 59 (absent, not dashed); no rate field in any body without it (one pure guard); the DUO create door stays; 57 and 59 independent.**

```
bunx tsc --noEmit → exit 0
bun test          →  533 pass / 0 fail   (was 528; +5 — new lib/scheduler/coach-rate-key.test.ts)
bun run build     → ok
git status        →  12 source modified · 15 tests re-pinned · 1 new
```
Built to §0 + **§0b** (the owner's amendment; TASK-431 + TASK-434's lines). **Snapshot 58 → 59** — `action:bookings.coach-rate`
right after `teachers.budget-view` (the BE's slot in `lib/permissions.ts`, asserted by position). 🚫 No deploy asked.

### `§1` — what was built
- **ONE pure guard (`lib/scheduler/duo.ts`), value-tested:** `COACH_RATE_KEY`; **`withoutRates(body, canRate)`** — with
  the key the body is untouched; without it exactly `classRateMinor` · `teacherRates` · `rateMinor` are stripped (a
  `classRateMinor: null` Clear too — mutations 1, 2). Applied at the SEVEN body sites: the OTHER series create, the
  Group series create, the OTHER details edit (`otherSchedulePatch` wrapped), the Manage-plan Add-teacher (`rateMinor`)
  and Edit-header (`teacherRates`), the Move-session PATCH (`sessionRateChange` wrapped), and the DUO create through
  `duoBody(d, canRate)` (mutations 3, 6–8; the move 9–10). Pinned line by line.
- **§0b — the DUO create door STAYS:** the Private/DUO toggle is not gated; only the rate FIELD is absent without the key
  (mutation 12); `duoReady(d, primary, canRate)` no longer demands the rate without it (mutation 4); the body carries
  `duo: { coStudentId }` alone (the service's `classRateMinor` is optional now) — a key-59 holder sets the default on
  the card later. Blank rate WITH the key ⇒ the child alone rides too (the rate is optional at create per §8).
- **Every rate surface behind `can(COACH_RATE_KEY)` — absent, never dashed (asserted: no `—` fallback on a rate surface):**
  · the shared **`OtherScheduleFields`** per-teacher rate inputs — ONE place, so the OTHER create, the OTHER/Group details
    editor, the group series create and the Manage-plan Edit-header all lose the inputs together (mutation 5);
  · the Manage-plan **header rates** (`series.teacherRates` is `null` without the key — read as absent, never ฿0) and the
    **Add-teacher** dialog's optional rate box (mutation 13);
  · the Move-session **box + (default|override) tag + Clear** — `rate` is read only with the key (`rate: null` from the
    server without it — the KEY decides, not the null; mutations 9, 10);
  · the course card's **Default coach rate** line + pencil (mutation 11);
  · the DUO create's **rate field** (mutation 12).
- **57 and 59 independent (§0b.3):** pinned that no rate surface reads `budget-view` and no budget surface reads
  `coach-rate` (mutation 15 — the card reading 57 — fails). The Roles matrix shows the 59th from `/permissions` as every
  key. No new copy (absence needs no word).

### 🔑 Break-and-watch — fifteen, each in `try/finally`, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | the guard strips nothing | **2 fail** |
| 2 | the guard forgets `rateMinor` | **1 fail** |
| 3 | the DUO body sends the rate without the key | **2 fail** |
| 4 | `duoReady` demands a rate without the key | **2 fail** |
| 5 | the shared rate inputs render without the key | **1 fail** |
| 6 | the OTHER create body skips the guard | **1 fail** |
| 7 | the Group create body skips the guard | **1 fail** |
| 8 | the OTHER edit body skips the guard | **1 fail** |
| 9 | the move box shows without the key | **2 fail** |
| 10 | the move reads `rate` without the key | **2 fail** |
| 11 | the course line shows without the key | **1 fail** |
| 12 | the DUO field shows without the key | **1 fail** |
| 13 | the Add-teacher rate box shows without the key | **1 fail** |
| 14 | the 59th lands before `budget-view` | **1 fail** |
| 15 | the course line reads `budget-view` instead | **3 fail** |
None slipped. `md5` identical on the ten mutated files. Pins moved with the reason: the snapshot 58 → 59 in twelve tests,
the sweep 95 → 96, TASK-421/424's shape lines (`duoBody(duo, canRate)`, `duoReady(…, canRate)`, the move's guarded
assign, `{canRate && rate && (`, the service's optional `classRateMinor`, the OTHER edit's wrapped patch), and TASK-421's
`duoBody` value case (a blank rate now rides the child alone — §8).

### Definition of Done
- [x] **533 / 0** · `tsc` 0 · build ok
- [x] The doors by the key (by value + source) · no body without the key (the guard by value at every site) · 59 = 59 by position · 57 ≠ 59
- [x] 🔑 Break-and-watch — fifteen, `finally`, checksum

### ⚠️ Not seen on a screen
The DUO create with the rate field gone (the second-child picker alone under the toggle); the Manage-plan header without
its `· ฿n` suffixes. For @Tanya on `sid` (the super admin grants `ดูและแก้ค่าสอน` to one role only): WITHOUT it —
open a course session ⇒ Move ⇒ no rate box at all (not `—`); the course card ⇒ no *Default coach rate* line; New course
⇒ DUO ⇒ the second child but NO rate field, create ⇒ 201 and the card shows no rate line; the OTHER create/edit and the
group create ⇒ no per-teacher rate inputs; the Manage-plan page ⇒ teachers without `฿`, Add teacher ⇒ no rate box; a user
WITH the key but WITHOUT `budget-view` still sees every rate and `—` on the freelance figures (independent). WITH the
key — everything as yesterday.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-22)
Re-run by me: **533 pass / 0 fail** · tsc 0 · key 59 in the snapshot. One `withoutRates` guard at every body site and the shared `OtherScheduleFields` as the one rate-input place are the right seams. The batch is complete on both sides.
