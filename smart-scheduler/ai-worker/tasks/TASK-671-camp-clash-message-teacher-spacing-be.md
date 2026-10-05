# TASK-671 — the camp clash refusal writes `ครู {ชื่อ}` with a space (owner ruling) — BE, XS
- Source: owner ruling 2026-10-06 (relayed by Porter): **"a space ALWAYS, every site, no helper that decides by script"** ⇒ `ครู {ชื่อ}`. @Sober has the other five sites; **this one is Team B's** (`camp.service.ts`).
- Status: BLOCKED (waiting: @Silver → Porter — one more pin file, see Questions) — ▶️ GO (Porter assigned it to Team B; XS)
- Repo: `smart-scheduler-back` · Assignee: @Bob · From: @Silver (2026-10-06)
- **Claim:** `src/services/camp.service.ts` **line 284 only** · `src/lib/camp-on-grid-req095-11.test.ts` **the one line that pins this sentence** (`:177`, the TASK-666 template).
  - 🚫 Nothing else.
  - 🚫 **No helper or function that decides spacing by script** (the owner ruled against it): a literal space.

## What to do
1. `camp.service.ts:284`: `` `วันที่ ${d.date} ${hour} ครู${coachName…} มีคาบแล้ว — …` `` → **`ครู ${coachName…}`**. One space, nothing else in the sentence changes.
2. `camp-on-grid-req095-11.test.ts:177` pins that sentence word for word (`ครูเอก`) ⇒ re-pin it to **`ครู เอก`**, with a `🔻 TASK-671` note. It must still assert the whole sentence, not a fragment.

## Definition of Done
- [ ] The pinned test is green with the space. **Break it and watch:** remove the space and the test goes red.
- [ ] Grep: no `ครู${` left in `camp.service.ts`.
- [ ] The suite with **no reachable database**, plus `tsc`. State Team A's work in the tree. Nothing committed.

## Implementation Notes

## Questions
- **Q1 (Bob → Silver, 2026-10-06): the sentence is pinned in a SECOND file the claim does not list. Nothing edited yet.**
  - `src/lib/camp-week-500-family-dedupe-req104.test.ts` quotes it twice: `:73` (`วันที่ ${TODAY} 11:00 ครูเอก มีคาบแล้ว — ไม่ได้บันทึกอะไร`) and `:95` (the HTTP body, `13:00 ครูเอก …`).
  - It is green today (7/0) and clean of Team A work. Changing `camp.service.ts:284` alone turns those 2 assertions red.
  - Also: the pin in `camp-on-grid-req095-11.test.ts` is now at **`:186`**, not `:177` (TASK-666 added lines above it).
  - **Ask:** may I re-pin `:73` and `:95` of that file to `ครู เอก`, the same one-space change, each still asserting the whole sentence, with a `🔻 TASK-671` note? Together with `camp.service.ts:284` and `camp-on-grid:186`, that is every pin of this sentence (`grep -rln "มีคาบแล้ว — ไม่ได้บันทึกอะไร" src` → exactly these three files).
  - I'm doing TASK-668 meanwhile and will finish 671 in minutes once you answer.

## Review
