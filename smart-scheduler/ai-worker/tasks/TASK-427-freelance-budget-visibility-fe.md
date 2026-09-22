# TASK-427 — `REQ-102` (narrowed), FE: the budget figures render `—` when null; the budget doors hide without the key; the Roles matrix shows the 57th key

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-21) · **Size S.** Against TASK-426's contract once CONFIRMED (I paste the final lines into §0). Pure parts now; wire after Jason's report. `sid`.

## §0 The contract — CONFIRMED 2026-09-21 (TASK-426)
Key `action:teachers.budget-view` (57th, area `teachers`). Without it EVERY teacher DTO (the Teachers page, the calendar's `teachers[]`, the budget routes' responses) reads `hourlyRate · budgetMinor · remainingMinor · reorderMinor = null` (the shape kept) while `overLimit · setupIncomplete · limitOverride` stay — render `—` for a null figure, keep the not-bookable rule. `PUT /teachers/:id/budget` + `/topup` need BOTH `teachers.budget` AND `teachers.budget-view` (403 otherwise). A linked (teacher) account always reads nulls. The dashboard's `freelance_near_cap` attention label comes without the hours number for a user without the key (the item stays) — render the label as given. Nothing else masked.

## §1
- **Teachers page:** the budget column/card renders `—` when the figure is null (never `฿0`, never blank); the near-cap / over-limit badge still renders from the booleans. The `Set budget` / `Top up` doors show only with BOTH keys (`can()` twice — hidden, never disabled).
- **Anywhere else a teacher's budget prints** (the calendar's teacher header? the booking modal's "budget left" hint?) — walk the FE for `budgetMinor` / `remainingMinor` readers and give each the `—` rule (one pure `moneyOrDash(minor)` helper, value-tested).
- **Roles / Users matrix:** the 57th key appears in the `teachers` area with its labels (from `/permissions`, as every key). Snapshot 56 → 57 with the reason.
- 🚫 No client masking (the server nulls the fields; the FE only draws `—`). Copy both languages, counted.

## Definition of Done
- [ ] Suite, **count** · tsc · build ok · `moneyOrDash` by value · the doors need both keys · the snapshot 57 = 57 · 🔑 Break-and-watch, `finally`, CHECKSUM · report here + `inbox/SA.md` + log.


---

## §2 ✅ IMPLEMENTED — Fern, 2026-09-21. **Budget figures draw `—` when the server nulls them (one `moneyOrDash`), the budget doors need both keys, the 57th key in the snapshot.**

```
bunx tsc --noEmit → exit 0
bun test          →  521 pass / 0 fail   (was 516; +5 — new lib/scheduler/money-or-dash.test.ts)
bun run build     → ok
git status        →  4 source modified (TeachersContent · FreelanceBudgetStrip · FreelanceBudgetControls · rbac/actions.ts) · 11 tests re-pinned (56 → 57; the sweep +1) · 2 new
```
Built to §0 + @Jason's final lines in TASK-426 (2670/0). **Snapshot 56 → 57** — `action:teachers.budget-view` right after
`teachers.budget` (the BE's slot in `lib/permissions.ts`, asserted by position). 🚫 No deploy asked.

### `§1` — what was built
- **Pure (`lib/scheduler/money-or-dash.ts`), value-tested:** `moneyOrDash(baht)` ⇒ `฿1,234` (th-TH grouping, whole
  baht) / `—` for null, undefined, NaN (mutation 1); **ZERO is a figure — `฿0`, not a dash** (mutation 2);
  `minorOrDash(satang)` the same for the DTO's `*Minor` fields.
- **The walk:** every `src/components` file is scanned — a `฿{… remainingMinor|budgetMinor|reorderMinor|hourlyRate … ?? 0}`
  print (the ฿0-where-—-belongs bug) fails the suite. Readers found and routed: (1) the Teachers card's **rate line**
  (`฿{thb(hourlyRate ?? 0)}` → `moneyOrDash(hourlyRate)`; mutation 4), (2) its **remaining / budget line**
  (`฿{bahtOfSatang(remaining ?? 0)} / …` → `minorOrDash` × 2; mutation 5), (3) the calendar's **freelance strip**
  (mutation 8). `TeacherRowActions`' type-change warning already guards on `remainingMinor != null` (no print when
  masked); the budget dialogs prefill only behind both keys (the figures are present then). The dashboard's near-cap
  item renders the label as given (no FE number composed — verified: the FE only maps the item's type to its heading).
- **The Teachers card:** the budget block shows for **every FREELANCER** — masked ⇒ `— / —`, never hidden (mutation 3),
  never ฿0; a non-freelancer has no budget and no block, as before. The progress bar reads 0 with no figures. The
  over-limit badge renders from `overLimit` (a boolean the server keeps), and the override switch too:
  `reached = rawOver || overLimit` (mutation 6 — the boolean forgotten — fails). 🚫 Nothing here nulls anything on
  the key (asserted).
- **The calendar strip:** masked figures ⇒ a grey **`— / —`** strip (`data-budget-tone="masked"`; mutation 7 — the
  strip vanishing — fails), so a column reads the same shape for everyone; live figures ⇒ the tone + the numbers as
  before (rendered both ways); a full-timer ⇒ nothing.
- **The doors:** `Set budget` / `Top up` render only with BOTH `teachers.budget` AND `teachers.budget-view`
  (`can()` twice — hidden, never disabled; mutation 9). The not-bookable rule is untouched (booleans only, pinned).
- **The matrix:** the 57th key arrives from `/permissions` with its labels like every key — no FE list (the snapshot is
  the test's mirror). No new copy needed (`—` is not a word).

### 🔑 Break-and-watch — ten, each in `try/finally`, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | null draws ฿0 | **1 fail** |
| 2 | zero draws a dash | **1 fail** |
| 3 | the card's block hides when masked | **1 fail** |
| 4 | the rate line prints ฿0 when masked | **1 fail** |
| 5 | the remaining line prints ฿0 when masked | **2 fail** |
| 6 | the override switch forgets the boolean | **1 fail** |
| 7 | the strip vanishes when masked | **1 fail** |
| 8 | the strip prints ฿0 when masked | **2 fail** |
| 9 | the doors ask one key only | **3 fail** |
| 10 | the 57th lands before `teachers.budget` | **1 fail** |
None slipped. `md5` identical on the five mutated files. Pins moved with the reason: the snapshot 56 → 57 in eleven
tests, the sweep 90 → 91 (the second `can()` on the doors).

### Definition of Done
- [x] **521 / 0** · `tsc` 0 · build ok
- [x] `moneyOrDash` by value (incl. zero) · the doors need both keys · 57 = 57 by position
- [x] 🔑 Break-and-watch — ten, `finally`, checksum

### ⚠️ Not seen on a screen
The grey `— / —` pill in a narrow teacher header; the card's empty progress bar under `— / —`. For @Tanya on `sid`
(the super admin grants `ดูงบ/เพดานค่าจ้างครู` to one role only): as a user WITHOUT it — the Teachers page's freelancer
cards read `—/hr` and `— / —` with an empty bar, an over-cap freelancer still wears the red badge and is still absent
from the grid, no `Set budget`/`Top up` buttons even with `ตั้ง/เติมงบครู` granted; the calendar's freelance columns
wear a grey `— / —` pill; the dashboard's near-cap line reads `<nickname> · ใกล้เต็มเพดาน` without a number. With the
key — everything as yesterday, and a freelancer with a ฿0 remaining reads `฿0`, not `—`.
