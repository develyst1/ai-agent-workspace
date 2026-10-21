# DEPLOY — front: TASK-828 F3 + TASK-830 (EN area names) — sid, then uat WITH EVERYTHING — @Sober, 2026-10-21
**For @Porter → the owner.** Agents commit nothing. **Front only.** The back is already committed (`fa1a04c`, tree clean).

## 0 · What is in it
- **F3 (TEST-111 re-check):** on a teacher's own SAME-DAY leave, every before-save line (cancel n · co-taught n · the D4 sentence) counts only the TICKED classes, as the server acts on them. An advance day still covers the whole day. No new words.
- **TASK-830 (REQ-118 follow-up, Khwan 10-21):**
  - on the **EN** page, the province / district / sub-district pickers (the register link + the admin parent form) and the register confirm row show **English names from our dataset** (TASK-803's corrections included);
  - a missing English name falls back to the Thai;
  - **the TH page is unchanged; what is SAVED is unchanged** (the codes + the Thai address line, identical from both pages);
  - no new words.

## 1 · Verified by me on a clean copy of the whole front tree
| | result |
|---|---|
| **front** `99d27a5` + 12 files | tsc 0 · `bun test` **1,348 / 0**, 143 files · unhandled 0 · **build 0** (the tree unchanged by it) |
| sets, one at a time | 830 **10/10** · 580 8/8 (explicit test list) · 801 12/12 · 828 **30/30** · 829 17/17 · 828-o1 13/13 · 818 25/25 · 820 22/22 · 822 18/18. 0 survivors, checksums identical |

**Not proven yet:** a real browser, and the real back serving `nameEn` (the tests fake it at the wire; the back has served it since TASK-800/803). That is sid, with Tanya.

## 2 · Commit list: `smart-scheduler-front` (12 entries, `git status --short -uall` taken by me, the tree frozen)
```
    M scripts/mutation/task-580.json
     M scripts/mutation/task-818.json
     M scripts/mutation/task-828.json
     M src/components/partials/Calendar/Modal/LeaveWillDo.tsx
     M src/components/partials/Calendar/Modal/leave-co-taught-task828.dom.test.tsx
     M src/components/partials/People/AreaPicker.tsx
     M src/components/partials/Register/RegisterContent.tsx
     M src/lib/register/entry.test.ts
     M src/lib/register/entry.ts
     M src/lib/register/register-page.test.ts
    ?? scripts/mutation/task-830.json
    ?? src/components/partials/Register/address-english-task830.dom.test.tsx
```

## 3 · Deploy
1. **sid:** the front build + restart. The back on sid is already `fa1a04c`; no migration, env, script or menu step for this front.
2. **Tanya on sid:** §4.
3. **uat, with everything** (your release shape): back `fa1a04c` + **`db:migrate` 0071** (journal 72) + this front.

## 4 · Tanya's gate on sid (then uat read-only)
- **F3:** a teacher's own same-day leave on a day with a sole class + co-taught classes + a D4 class:
  - tick only the sole class → "cancels 1", **no** co-taught line, **no** D4 sentence;
  - tick them all → the full numbers;
  - save → the server touched only the ticked ones.
- **830, register link (LIFF), EN:**
  - the three pickers list English names; typing English finds them;
  - e.g. the sub-district that used to be garbled ("Khnong Tntnai") reads correctly;
  - the confirm row shows English;
  - after Save, the parent's stored address is the **Thai** line + codes, the same as a TH-page registration of the same picks.
- **830, TH:** exactly as before.
- **830, admin parent form:** EN → English options; TH → Thai. The parent card in EN still shows the English address.
