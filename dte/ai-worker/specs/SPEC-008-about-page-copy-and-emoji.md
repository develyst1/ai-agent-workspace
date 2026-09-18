# SPEC-008: `/about` — the team's own DTE copy, emoji out
- Source: REQ-008
- Status: DONE (2026-09-13, Sober — TASK-023 reviewed `DONE`; AC 5 + Q1–Q3 with Porter)

## Overview

REQ-008 asks for two things on one file: **copy** the team authors (delegated by the owner, A49) and
**no emoji** (REQ-001 requirement 3, now on `/about` too). Both land in **one FE TASK against
`front/src/app/about/page.tsx` only**. The copy is drafted **here, verbatim, by Sober** — it is content,
so Fern pastes strings from this SPEC and invents none; Porter reads §Copy for the name/wording rules
(REQ-008 §Constraints) before the rendered page goes to the owner.

Code read on `develop`, 2026-09-13: `/about` is still the un-migrated `app/about/page.tsx` (270 lines,
server component, no `partials/About/`). It renders `ui/AnimatedBackground` and `ui/FeatureCard` (×5),
imports 5 Heroicons, and carries **18 emoji** — the checker counts **17** (`⏰` U+23F0 sits outside its
ranges — the known gap, my queue item 5); Porter's 18 is the true count. `DTE Platform` and `Disrupt`
already do not occur in the file (TASK-018 handled the two lines).

### Three design calls, with reasons

1. **Copy first, structure later — `/about` is NOT migrated to `partials/About/` in this unit.**
   REQ-008 AC 5 expects at least one correction round from the owner ("เดี๋ยวจะให้แก้"). Each round is
   cheapest as a string diff in one file he can be shown. A folder move plus copy in the same diff
   makes his corrections and the move indistinguishable. SPEC-001 §Decision 9's screen list still
   excludes `/about`; when its copy settles, the migration + SPEC-006 look are their own TASK, after
   Phase 3's gate. **No look rule of SPEC-006 is engaged here**: no container, spacing or colour class
   changes; only text nodes and the emoji spans.
2. **Emoji → lucide-react icons (SPEC-001 §Decision 5, the house set); the 5 existing Heroicons stay.**
   Decision 5 retires Heroicons "per screen when that screen converts" — this is not the screen's
   conversion. Two sets on one page is a stated, temporary half-state, closed by call 1's later TASK.
   The 8 emoji inside the comparison-table cells are **removed, not replaced** — they decorate prose;
   an icon in a text cell carries nothing (`ดูวิดีโอเดี่ยว งง ก็งง 😕` → `ดูวิดีโอเดี่ยว งง ก็งง`).
3. **The "ตัวเลขที่น่าสนใจ" block (50+ / 1,000+ / 10,000+ / 24/7) is dropped.** Four figures with no
   source in `DTE.md` and no way for anyone here to verify them on a live product; REQ-008 AC 1 asks
   for copy traceable to `DTE.md` or the page. Dropping is a copy judgement A49 authorises, but it is
   the one call the owner may want back — §Questions Q1 for Porter. If he wants them, they return
   **verbatim** in a follow-up string change, nothing else moves.

## Copy — the exact strings (Fern pastes these; nothing else is worded by anyone)

Source key: **[K]** `DTE.md` §"Key Messages (สำหรับหน้าเว็บ)" · **[V]** `DTE.md` §Vision "เราเชื่อว่า" /
§เป้าหมาย · **[T]** `DTE.md` §"แตกต่างจากคอร์สทั่วไป" table · **[C]** `DTE.md` §Core Concept ·
**[P]** already on the page today (kept verbatim). Every AFTER string has a source; none is new.

| # | Where (`page.tsx` today) | BEFORE | AFTER | Src |
|---|---|---|---|---|
| 1 | hero eyebrow `h2` (line 26) | `About DTE` | `เกี่ยวกับ DTE` | — (label only) |
| 2 | hero `p` (28) | `เรียนได้ทุกที่ ถามได้ทุกเวลา` | unchanged | K |
| 3 | hero sub `p` (31) | `กับ AI ครูส่วนตัวที่เข้าใจคุณ` | unchanged | P |
| 4 | **NEW** `p` after #3, same classes as #3 plus `mt-6` | — | `DTE — Develyst The Education คือแพลตฟอร์มเรียนออนไลน์ที่ไม่ใช่แค่คอร์ส แต่เป็นการเรียนรู้ส่วนตัวที่ขับเคลื่อนด้วย AI` | C + A22 name |
| 5 | `h3` (39) | `DTE คืออะไร?` | unchanged | P |
| 6 | FeatureCard 1 title/description (44-45) | `ไม่ใช่แค่คอร์สออนไลน์` / `DTE คือการเรียนรู้ส่วนตัวที่ขับเคลื่อนด้วย AI …` | unchanged | P |
| 7 | FeatureCard 2 title/description (50-51) | `ความสำเร็จไม่ขึ้นกับวุฒิ` / `เราเชื่อว่า 'ทักษะจริง' สำคัญกว่า 'กระดาษ' ผู้ก่อตั้ง DTE จบแค่ ปวส. แต่กลายเป็น Senior Developer อันดับ 1 เพราะมีทักษะจริง` | **unchanged, byte-for-byte** (the founder line is his; REQ-008 §Out of scope) | P |
| 8 | `h3` (59) | `วิสัยทัศน์และพันธกิจ` | unchanged | P |
| 9 | Vision `h4` (64) | `🌟 Vision` | `<Eye>` icon + `วิสัยทัศน์` | — |
| 10 | Vision lead `p` (67) | `ทำลายกำแพงการศึกษา` | unchanged | P (V: "ทำลายกำแพงของระบบการศึกษาไทยแบบเดิมๆ") |
| 11 | Vision bullets ×4 (70-84) | `✅` + text | `<CheckCircle>` + same 4 texts, unchanged | V |
| 12 | Mission `h4` (90) | `🎯 Mission` | `<Target>` icon + `พันธกิจ` | — |
| 13 | Mission lead `p` (93) | `เรียนได้ทุกที่ ถามได้ทุกเวลา` | unchanged | K |
| 14 | Mission bullets ×4 (96-110) | `🤖` `📚` `💡` `🚀` + text | `<Bot>` `<BookOpen>` `<Lightbulb>` `<Rocket>` + same 4 texts, unchanged | K |
| 15 | `h3` (119) | `DTE แตกต่างจากคอร์สทั่วไปยังไง?` | unchanged | P |
| 16 | table `th` (125) | `Feature` | `หัวข้อ` | — (label only) |
| 17 | table `th` (126, 127) | `คอร์สทั่วไป` / `DTE` | unchanged | T |
| 18 | row 1 cells (134-135) | `ดูวิดีโอเดี่ยว งง ก็งง 😕` / `AI ครูส่วนตัวคอยช่วยตลอดเวลา ✨` | `ดูวิดีโอเดี่ยว งง ก็งง` / `AI ครูส่วนตัวคอยช่วยตลอดเวลา` | T |
| 19 | row 2 cells (139-140) | `รอครู 1-3 วัน ⏰` / `ถาม AI ได้ทันที ไม่ต้องรอ ⚡` | `ต้องรอครูตอบคำถาม` / `ถาม AI ได้ทันที ไม่ต้องรอ` | T ("1-3 วัน" is a number with no source — dropped) |
| 20 | row 3 cells (144-145) | `เรียนตามตายตัว 📋` / `AI ปรับให้เหมาะกับระดับคุณ 🎯` | `เรียนตามหลักสูตรตายตัว` / `AI ปรับเนื้อหาตามระดับของคุณ` | T |
| 21 | row 4 cells (149-150) | `Certificate 📜` / `ทักษะจริงที่ใช้งานได้ 💪` | `มุ่งเป้าที่ Certificate` / `มุ่งเป้าที่ทักษะจริง` | T |
| 22 | `h3` (158) | `ค่านิยมหลัก` | unchanged | P |
| 23 | FeatureCard 3/4/5 (162-179) | `ทักษะจริง` / `AI Innovation` / `ไม่จำกัดวุฒิ` + descriptions | title 4 → `นวัตกรรม AI`; everything else unchanged | P |
| 24 | whole section `ตัวเลขที่น่าสนใจ` (183-208) | 4 figures | **section removed** (call 3, Q1) | — |
| 25 | `metadata` (13-15) | `เกี่ยวกับเรา` / description | unchanged (REQ-005 template gives the tab its suffix) | P |

Forbidden anywhere on the page: `Disrupt Thai Education`, `DTE Platform` (REQ-008 AC 3). The product
name appears once, in #4, in the A22 form `DTE — Develyst The Education`.

## Icons — the exact replacements

`import { Eye, Target, CheckCircle, Bot, BookOpen, Lightbulb, Rocket } from 'lucide-react';` — all
seven exist in the installed `lucide-react` (checked in `node_modules` 2026-09-13). The Heroicons
import block and its 5 usages **stay untouched** (call 2).

| Emoji (today) | Replacement | Classes | Note |
|---|---|---|---|
| `<span className="text-4xl">🌟</span>` (Vision h4) | `<Eye className="w-8 h-8 text-sky-600" aria-hidden="true" />` | — | the `text-4xl` span (36 px glyph) becomes a 32 px icon — the `h4` row **may shrink**; measured in TASK-023 DoD 7, not asserted |
| `<span className="text-4xl">🎯</span>` (Mission h4) | `<Target className="w-8 h-8 text-cyan-600" aria-hidden="true" />` | — | same |
| `<span className="text-sky-600 font-bold">✅</span>` ×4 | `<CheckCircle className="w-5 h-5 text-sky-600 shrink-0 mt-1" aria-hidden="true" />` | replaces the span | bullets keep `flex items-start gap-2` |
| `<span>🤖</span>` `<span>📚</span>` `<span>💡</span>` `<span>🚀</span>` | `<Bot …/>` `<BookOpen …/>` `<Lightbulb …/>` `<Rocket …/>` with the same classes as the CheckCircle row | replaces the span | — |
| 8 table-cell emoji (`😕 ✨ ⏰ ⚡ 📋 🎯 📜 💪`) | **deleted with the preceding space** — no icon | — | see §Copy #18-21 |

The h4's own `flex items-center gap-3` stays, so the icon sits where the emoji sat.

## Data Model

None. Frontend only; no `back/`, no schema, no `develyst-ai`.

## Flow

1. `/about` renders exactly as today except: the strings in §Copy, the icons in §Icons, and the
   removed numbers section. Every class string outside the replaced spans is untouched.
2. Both themes: the new icons take `text-sky-600` / `text-cyan-600` like the spans they replace; no
   theme token is added or changed. (Observed in the DoD, both themes — a colour I write is a hypothesis.)
3. Nothing else on the site changes: `ui/FeatureCard`, `ui/AnimatedBackground` are **not edited**
   (SPEC-006 shared-component rule — they render on five other screens).
4. The two stray files `about/page-new.tsx`, `about/page.tsx.backup` are **not touched** — REQ-008
   §Out of scope, Porter's housekeeping. The `src`-wide emoji count therefore drops from **110 to 93**
   (17 from `page.tsx`; `page-new.tsx` keeps its 17).

## Non-functional

- Build + typecheck clean; route table still 9 routes.
- No new dependency (`lucide-react` is installed and used by three migrated screens).
- Accessibility: every icon is decorative (`aria-hidden="true"`); the text beside it carries the meaning.

## Sequencing

Standalone, after TASK-022 in Fern's queue; not gated on SPEC-006 Phase 2/3 (the owner ruled the copy
and the emoji himself, A49). Delivery order: TASK-023 `DONE` → Porter reads §Copy + the two screenshots
→ the owner's eyes (AC 5) → his corrections come back through Porter as a REQ-008 answer → a string-only
follow-up TASK if needed.

## Tasks

- TASK-023: `/about` copy + emoji → icons, `app/about/page.tsx` only — owner: FE (depends on: none;
  sequenced after TASK-022)

## Questions

- **Q1 (Sober → Porter, 2026-09-13, non-blocking — TASK-023 proceeds):** the draft **drops** the
  "ตัวเลขที่น่าสนใจ" block (`50+ ทักษะให้เลือกเรียน`, `1,000+ ผู้เรียน`, `10,000+ คำถามที่ AI ตอบ`, `24/7 AI ครูส่วนตัว`)
  and the `รอครู 1-3 วัน` cell — figures with no source in `DTE.md` that nobody here can verify against
  the live product. When you show him the page, please say so in one line; if he wants any figure
  back it returns verbatim as a string-only follow-up. Not asked of him as a question — a note.
- **Q2 (Sober → Porter, 2026-09-13, non-blocking):** please read §Copy for the name/wording rules
  before the rendered page goes to him (REQ-008 §Constraints). The only new sentence is #4; #16/#23
  turn two English labels Thai; #19-21 take `DTE.md`'s table wording over the page's. Anything you
  flag is a string change in the same file — say which row.

- **Q3 (Sober → Porter, 2026-09-13, non-blocking, observation for the owner):** at 1280 px the new
  sentence (#4) wraps between `เรียน` and `รู้` of `เรียนรู้` — visible in `tests/harness/about-after-{light,dark}.png`.
  Chrome's Thai line-breaker treats it as a word boundary; the break moves with the viewport and every
  Thai paragraph on the page breaks the same way. Not fixed: whether it reads wrong is his eye. If he
  flags it, the fix is a U+2060 WORD JOINER inside that one string — string-only, its own small TASK.

(Engineers ask here; Sober answers as `> answer: ...`)
