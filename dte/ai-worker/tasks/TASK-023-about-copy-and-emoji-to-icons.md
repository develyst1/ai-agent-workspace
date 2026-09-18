# TASK-023: `/about` — paste the SPEC-008 copy, emoji → lucide icons, drop the numbers block
- Source: SPEC-008
- Owner: FE (Fern)
- Status: DONE (reviewed 2026-09-13, Sober — see §Review)
- Depends on: none (do it after TASK-022 — both are small; keep the diffs separate)

## What to do

**Edit `front/src/app/about/page.tsx` only.** Three kinds of change, all enumerated in SPEC-008:

1. **Strings** — apply SPEC-008 §Copy rows #1, #4 (a new `<p>`), #9, #12, #16, #18–#21, #23 exactly as
   written there. Every other string in the file stays byte-for-byte (rows marked *unchanged*). Row #7,
   the founder line, is the owner's own words — do not touch a character.
2. **Icons** — add `import { Eye, Target, CheckCircle, Bot, BookOpen, Lightbulb, Rocket } from
   'lucide-react';` and replace the 10 emoji `<span>`s per SPEC-008 §Icons (classes as given there,
   `aria-hidden="true"` on each). Delete the 8 table-cell emoji with their preceding space — no icon.
   **Leave the `@heroicons/react/24/outline` import and its 5 `FeatureCard` icons as they are.**
3. **Remove** the whole `<section className="mx-auto max-w-5xl">` holding `ตัวเลขที่น่าสนใจ` (today's
   lines 183–208), including its wrapper. The section above it (`ค่านิยมหลัก`) keeps its `mb-20`.

**Do not:** edit any class string outside the replaced spans; touch `ui/FeatureCard`, `ui/AnimatedBackground`
or anything in `ui/`/`common/`; touch `about/page-new.tsx` or `about/page.tsx.backup`; change `metadata`;
create `partials/About/`; convert the Heroicons; add any word not in SPEC-008 §Copy. If a string you need
is missing from the SPEC, stop and ask in §Questions — never write one.

## Definition of Done

Run each command yourself and paste the **real output** into §Implementation Notes. A claim with no
output is `REWORK`. Your real-Chrome Playwright harness (`playwright-core` + `executablePath` against
`npx next start`) is the instrument for DoD 6–8; nothing here assumes the Chrome extension.

- [ ] 1. `npm run build` in `front/` — exit 0, route table still **9 routes**. Paste the table.
- [ ] 2. `npx tsc --noEmit` in `front/` — exit 0, no output.
- [ ] 3. `node <harness>/check-no-emoji.mjs src/app/about/page.tsx` from `front/` — **0 occurrence(s)**;
  and `node <harness>/check-no-emoji.mjs src` — **93** (was 110; the 17 are all from this file).
  Do not re-baseline anything. Paste both totals.
- [ ] 4. The checker misses `⏰` (U+23F0). Also run, from `front/`:
  `grep -nP "[\x{2300}-\x{23FF}]" src/app/about/page.tsx` — **no match**, exit code 1. Paste it.
- [ ] 5. `grep -n "Disrupt Thai Education\|DTE Platform\|About DTE\|Feature<\|AI Innovation\|ตัวเลขที่น่าสนใจ\|1,000+\|1-3 วัน" src/app/about/page.tsx`
  — **no match**. Then `grep -c "Develyst The Education\|ผู้ก่อตั้ง DTE จบแค่ ปวส. แต่กลายเป็น Senior Developer อันดับ 1 เพราะมีทักษะจริง\|ต้องรอครูตอบคำถาม\|มุ่งเป้าที่ทักษะจริง\|นวัตกรรม AI\|วิสัยทัศน์\|พันธกิจ" src/app/about/page.tsx`
  — paste the count (expected **7** or more; the point is each string is present — check each once).
- [ ] 6. Against `npx next start` (state the port; stop it after): `GET /about` → **200**; in the DOM,
  `document.body.innerText` contains `DTE — Develyst The Education คือแพลตฟอร์มเรียนออนไลน์` and does
  **not** contain `ตัวเลขที่น่าสนใจ`; `/\p{Extended_Pictographic}/u.test(document.body.innerText)` is
  **false**; `document.querySelectorAll('svg.lucide').length` — paste the number (expected **10**).
- [ ] 7. **Geometry, both themes, same viewport, BEFORE and AFTER** (BEFORE on the unedited file — a copy
  is fine): `getBoundingClientRect().height` of the two `h4` headings (`วิสัยทัศน์` / `พันธกิจ` — today
  `🌟 Vision` / `🎯 Mission`) and of one Vision bullet `p`. Paste the numbers. SPEC-008 §Icons says the
  h4 **may shrink** — that is a hypothesis; report what you measure, do not compensate with classes.
- [ ] 8. Screenshots of the full `/about` AFTER, light and dark, saved under `tests/harness/` with the
  filenames stated (`about-after-light.png`, `about-after-dark.png`) — Porter hands them to the owner for
  REQ-008 AC 5. Also confirm in words that `FeatureCard` interiors look as before (they were not edited).
- [ ] 9. `git diff --stat` (read-only git use, allowed) — **1 file**, `src/app/about/page.tsx` only.
  Paste it. If any other file shows, revert it before `REVIEW`.

Then set this TASK `REVIEW` on the board, and `@Sober` in `inbox/SA.md`.

## Implementation Notes

**Fern, 2026-09-13.** One file edited: `front/src/app/about/page.tsx`. Applied SPEC-008 §Copy rows
#1, #4 (new `<p>`, #3's classes + `mt-6`), #9, #12, #16, #18–#21, #23; §Icons: the 7-name lucide import
added after the Heroicons block, 10 spans → icons with the exact classes + `aria-hidden="true"`, the 8
table-cell emoji deleted with their preceding space; the whole `ตัวเลขที่น่าสนใจ` section removed (old
lines 183–208). Heroicons import + 5 usages, `metadata`, `ui/`, the 2 stray `about/` files: untouched.
No class string outside the replaced spans changed. Edits by a Node exact-match script (each pattern
asserted to match exactly once); CRLF **211 → 189, 0 bare LF** before and after (no `sed -i`, A40).
Instrument: new throwaway `ai-worker/tests/harness/measure-about.mjs` (real Chrome via `playwright-core`
from a scratch dir; nothing added to `front/`). BEFORE built + served + measured on the unedited file
first, then the edit, then AFTER. Server: `npx next start -p 3063`, stopped after each run
(`taskkill … SUCCESS`, PIDs 26396 / 16964). No backend runs here and none was pointed at.

### DoD 1 — `npm run build` — exit 0, 9 routes
```
Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /about
├ ƒ /classroom/[id]
├ ○ /courses
├ ○ /login
├ ○ /register
├ ○ /teach
└ ○ /verify-email
build exit=0
```

### DoD 2 — `npx tsc --noEmit` — exit 0, no output
```
tsc exit=0
```

### DoD 3 — emoji checker
```
$ node <harness>/check-no-emoji.mjs src/app/about/page.tsx
OK — 0 emoji in 1 files scanned          (exit 0)
$ node <harness>/check-no-emoji.mjs src | tail -1
93 occurrence(s) in 52 file(s) scanned.  (was 110; nothing re-baselined)
```

### DoD 4 — U+2300–23FF grep
Needs `LC_ALL=C.UTF-8` in this Git Bash — without it `grep -P` errors "character value in \x{} is too
large" (exit 2). Control run first on the unedited HEAD copy to prove the instrument sees `⏰`:
```
$ git show HEAD:front/src/app/about/page.tsx | grep -nP "[\x{2300}-\x{23FF}]"
139:                  <td className="p-6">รอครู 1-3 วัน ⏰</td>            exit=0
$ grep -nP "[\x{2300}-\x{23FF}]" src/app/about/page.tsx
(no output)                                                                exit=1
```

### DoD 5 — forbidden / required strings
```
$ grep -n "Disrupt Thai Education\|DTE Platform\|About DTE\|Feature<\|AI Innovation\|ตัวเลขที่น่าสนใจ\|1,000+\|1-3 วัน" src/app/about/page.tsx
(no output)  exit=1
$ grep -c "<the 7 required strings, as in the DoD>" src/app/about/page.tsx
8
each, once: Develyst The Education=1 · founder line=1 · ต้องรอครูตอบคำถาม=1 · มุ่งเป้าที่ทักษะจริง=1 ·
นวัตกรรม AI=1 · วิสัยทัศน์=2 (h3 + h4) · พันธกิจ=2 (h3 + h4)
```

### DoD 6 — DOM against `npx next start -p 3063` (real Chrome, 1280×1050) — light and dark identical
```
GET /about -> 200
innerText includes 'DTE — Develyst The Education คือแพลตฟอร์มเรียนออนไลน์' = true
innerText includes 'ตัวเลขที่น่าสนใจ'                                  = false
document.querySelectorAll('svg.lucide').length                    = 10
/\p{Extended_Pictographic}/u.test(document.body.innerText)        = TRUE   <- see note
```
**Note on the `true`:** enumerated by a one-off tree walk, the only matching character on the page is
`©` **U+00A9** in the shared Footer's `© 2025 Develyst. All rights reserved.` — Unicode puts the copyright
sign in Extended_Pictographic. Not an emoji, not in this file, and the Footer is outside the TASK — not
touched. The same test on `document.querySelector('main').innerText` (the page's own content) = **false**.
Read literally, DoD 6 fails; I report the measurement as-is (§Questions Q2).

### DoD 7 — geometry, 1280×1050, both themes, BEFORE vs AFTER (light = dark in every number)
```
                                        BEFORE    AFTER
h4 Vision   (🌟 Vision  -> วิสัยทัศน์)     40 px     32 px
h4 Mission  (🎯 Mission -> พันธกิจ)       40 px     32 px
Vision bullet p (first)                 24 px     24 px
```
SPEC-008 §Icons' hypothesis (the h4 **may shrink**) is **confirmed by measurement**: −8 px each — the
`text-4xl` glyph's 40 px line box is gone and the row is now the 32 px icon. Bullets unchanged. No class
added to compensate.

### DoD 8 — screenshots
`tests/harness/about-after-light.png`, `about-after-dark.png` (full page, 1280 wide; the
`about-before-{light,dark}.png` pair is kept alongside for comparison). Looked at both: the 5
`FeatureCard`s (2 under `DTE คืออะไร?`, 3 under `ค่านิยมหลัก`) look as before — same Heroicon tile,
title, description, only card 4's title now reads `นวัตกรรม AI`. The new icons take `text-sky-600` /
`text-cyan-600` in both themes, as the SPEC expected.

### DoD 9 — `git diff --stat` (read-only git)
```
 front/src/app/about/page.tsx                       | 72 ++++++++--------------
 .../src/components/partials/Login/LoginContent.tsx |  3 -
```
The second file is **TASK-022's 3-line deletion, in `REVIEW` with you** — still uncommitted on `develop`
because git is the owner's alone (A23). **Not reverted**: reverting it would destroy TASK-022. Scoped:
`git diff --stat -- src/app/about/page.tsx` → **1 file changed, 25 insertions(+), 47 deletions(-)**.

UNVERIFIED — the owner's own eyes (REQ-008 AC 5); only an automated Chrome has looked.

## Questions

- **Q1 (Fern → Sober, 2026-09-13, observation, non-blocking):** at 1280 px the new #4 sentence wraps
  **inside the word `เรียนรู้`** — line 1 ends `…แต่เป็นการเรียน`, line 2 starts `รู้ส่วนตัว…`, both themes
  (visible in the AFTER screenshots). It is Chrome's Thai line-breaking on the untouched `max-w-3xl`
  container; I changed no class and no string, as the TASK says. Porter may want to know before the
  owner sees it; whether to fix (a width, a no-break, or a re-worded sentence) is your call, not mine.
  > answer (Sober, 2026-09-13): **Not a TASK-023 defect; no fix now.** Seen in the AFTER screenshot. `เรียน|รู้`
  > is a dictionary word boundary Chrome's Thai line-breaker is allowed to use (`เรียน` + `รู้` are both words);
  > every Thai paragraph on this page already breaks the same way (the FeatureCard descriptions do, at
  > `…แค่ดู / วิดีโอ…`), and the break point moves with the viewport. Whether it reads wrong is the owner's
  > eye, not ours — it goes to Porter as an observation (SPEC-008 §Q3). If he flags it, the fix is one
  > U+2060 WORD JOINER between `เรียน` and `รู้` in that string — string-only, same file, own TASK.
- **Q2 (Fern → Sober, 2026-09-13):** DoD 6's `Extended_Pictographic` test is `true` solely because of
  the Footer's `©` (U+00A9). Please rule whether the DoD reads "on `main`" (passes) or literally (fails on
  a shared component outside scope). Nothing in `front/` was changed to make it pass.
  > answer (Sober, 2026-09-13): **Reads "on `main`" — PASSES.** The DoD's intent was the page's own content;
  > `©` U+00A9 is not an emoji and the Footer is outside the TASK. **The over-broad wording is my defect**
  > (Sober: wrote `document.body` where I meant `main`), not Fern's — she measured, reported the literal
  > `true` and did not bend the code to the DoD, which is exactly right. Next time I write that test on `main`.

## Review

**Sober, 2026-09-13 — verdict: `DONE`.** Reviewed the evidence, not the claim; re-ran what can be re-run
from a code read on `develop` (no browser opened by me — Fern's harness is the instrument):

- DoD 3 re-run by me: `check-no-emoji.mjs src/app/about/page.tsx` → `OK — 0 emoji`; `src` → **93**. DoD 4
  re-run: U+2300–23FF grep → no match, exit 1. DoD 5 re-run: the forbidden grep → exit 1; each required
  string present once (`วิสัยทัศน์`/`พันธกิจ` twice, h3 + h4 — as expected). Added checks of my own: rows #1
  (`เกี่ยวกับ DTE`), #16 (`หัวข้อ`), #20, #21, #4 (full sentence) each = 1; founder line byte-identical.
- §Icons: the 7-name lucide import + 10 usages with the exact classes, 10 × `aria-hidden="true"`; the
  Heroicons import untouched. Table cells read exactly SPEC-008 #18-21. Scoped diff 1 file, +25/−47.
- DoD 7: the h4 shrink was a hypothesis in SPEC-008 §Icons and is now a measurement (40 → 32 px); accepted
  as-is, nothing compensated — correct.
- DoD 6 literal `true`: ruled in §Q2 — passes on `main`; the wording was mine. DoD 9's second file is
  TASK-022 (reviewed `DONE` this same session) — not a scope leak.
- DoD 8: looked at `about-after-light.png` — the 5 FeatureCards unchanged, numbers section gone, icons
  in sky/cyan. **Q1's mid-word wrap is real and visible** — carried to Porter, not fixed (reason in §Q1).
- **UNVERIFIED, carried up:** the owner's eyes (REQ-008 AC 5) and whether the copy in SPEC-008 §Copy is
  the wording he wants — that is the correction round REQ-008 itself expects.

REQ-008 → `SPEC_DONE`; Porter carries AC 5 with the two AFTER screenshots, §Q1/§Q2/§Q3 of SPEC-008.
