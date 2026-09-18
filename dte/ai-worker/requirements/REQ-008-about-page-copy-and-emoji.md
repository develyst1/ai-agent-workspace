# REQ-008: `/about` — DTE's own About-page copy, authored by the team, with the emoji removed
- Status: READY_FOR_SA
- Priority: LOW — Porter's call, unstated by him (see §Questions)
- Requested: 2026-09-13 by the owner
- Deadline: none

## Problem / Goal

`/about` **stays** as DTE's own About page (`SYSTEM-FACTS.md` **A10**, 2026-09-07), but the owner
had never supplied its text, so since 2026-09-07 it has been an open **content DATA REQUEST** and
the page was deliberately left **out** of SPEC-001's screen migration ("its content is unsettled").

On 2026-09-13 he settled it the other way round — **"E=คิดเองและทำได้เลย เดี๋ยวจะให้แก้เดี๋ยวบอกทีหลังเอง
เอาอิโมจิออกด้วย"** (`SYSTEM-FACTS.md` **A49**): *think it up yourselves and just do it; I'll tell
you what to fix later; take the emoji out too.* So the team is now **authorised to author** the
About copy, he **reviews afterwards**, and the page's emoji go.

## Requirement

1. `/about` must present **DTE — Develyst The Education** in Thai, in the team's own words:
   what DTE is, whom it is for, and what makes it different — a per-course **AI Teacher**, learning
   at one's own pace, real skills over paper qualifications. The **source of what to say** is the
   owner's own vision document `DTE.md` at the repo root (its §"Key Messages (สำหรับหน้าเว็บ)" is
   literally headed *"for the website"*) and the DTE-specific copy already on the page today; nobody
   invents claims that are in neither.
2. The page must contain **no emoji** — the same "icons, not emoji" rule as REQ-001 requirement 3,
   now applied to `/about` too. (Porter's count 2026-09-13: **18** emoji characters in
   `front/src/app/about/page.tsx`, e.g. 🌟 ✅ 🎯 🤖 📚 💡 🚀 — the rule, not the count, is binding.)
3. The name and wording rules already ruled by the owner bind this copy: the product is **DTE —
   Develyst The Education** (A6, A22); **"Disrupt Thai Education"** is superseded and must not
   appear even though `DTE.md`'s first line still carries it; **"DTE Platform"** is gone (REQ-006,
   A38); the page title stays `เกี่ยวกับเรา | DTE — Develyst The Education` (REQ-005).
4. The result is shown to the owner **before** anyone calls it delivered — he said he will send
   corrections, so this REQ expects at least one review round from him.

## Acceptance Criteria

- [ ] AC 1 — `/about` renders Thai copy that describes DTE (not the inherited agency, not a
      placeholder), traceable to `DTE.md` and/or the existing DTE copy on the page.
- [ ] AC 2 — The repeatable no-emoji check (REQ-001 AC, `check-no-emoji.mjs`) reports **0** for
      `front/src/app/about/page.tsx`; engineer evidence = the command and its output.
- [ ] AC 3 — None of the forbidden strings appears on the page: "Disrupt Thai Education",
      "DTE Platform". (Checkable: a search of the page file.)
- [ ] AC 4 — The page still builds and renders in both themes; nothing on any other route changes
      because of this REQ (shared components are a whole-site cost — SPEC-006's rule, Sober's call).
- [ ] AC 5 — **The owner's own eyes on `/about`**, and his corrections (he promised some) are
      applied, until he says it passes. No QA role here; only he closes this one.

## Constraints

- Frontend only (`front/`); no `back/`, no database, no `develyst-ai`.
- The copy is **content the owner delegated**, not a design: whoever drafts it (Sober's routing —
  Porter names no engineer) drafts from the sources in requirement 1. Porter reads the draft in
  Thai for name/wording rules **before** it goes to the owner; that is acceptance, not authorship.
- Whether `/about` also gets the SPEC-001 migration / SPEC-006 look while its copy is touched is
  **Sober's design call**, explicitly not decided here. The owner asked for copy and no emoji.
- Standing rules unchanged: no agent commits, deploys, or touches production (A23, PROTOCOL.md
  §Environments). `DELIVERED` ≠ deployed; he ships it.

## Out of Scope

- New claims, numbers, testimonials or founder biography that are not in `DTE.md` or on the page
  today (the existing "ผู้ก่อตั้ง DTE จบแค่ ปวส. …" line is on the page today and may stay or go —
  a copy judgement, not a scope one; if kept it must stay exactly as he wrote it).
- Any change to the other routes' look or copy. `/about`'s **visual** pass is SPEC-006's business.
- The two stray files beside the page (`about/page-new.tsx`, `about/page.tsx.backup`) — housekeeping
  Porter carries from SPEC-003 §Q2; **nothing is deleted** under this REQ unless Sober rules
  otherwise in the SPEC.

## Questions

- **Priority note (Porter's call, not the owner's word).** He gave no deadline and no priority.
  `LOW` is Porter's sequencing judgement: a marketing page behind the `/courses` fix he is actively
  waiting on (A48). **One word from him overturns it.** Sequencing is Sober's.

- **⚠️ Not said by the owner and not guessed:** whether "เดี๋ยวจะให้แก้" means he wants to see a draft
  in Thai first (text only) or the rendered page. Porter's reading is the **rendered page** (he said
  "ทำได้เลย" — *just do it*) and will show him that; if he wants text first he will say so.

- **Q1 — for the owner (asked in Thai 2026-09-13 by Porter): AC 5, his eyes on `/about` and his
  corrections.** Reference: `tests/harness/about-after-{light,dark}.png`; the exact strings are in
  `specs/SPEC-008-about-page-copy-and-emoji.md` §Copy (25 rows, BEFORE→AFTER). He promised corrections
  (A49) — any wording he wants changed comes back here as `> answer:` and becomes a string-only follow-up.
  Three things he is told up front, not hidden (from SPEC-008 §Q1–Q3):
  1. The **"ตัวเลขที่น่าสนใจ" block was dropped** (`50+ ทักษะ`, `1,000+ ผู้เรียน`, `10,000+ คำถาม`, `24/7`)
     and `รอครู 1-3 วัน` became `ต้องรอครูตอบคำถาม` — figures with no source that nobody here can verify.
     Any figure he wants back returns verbatim.
  2. The one **new sentence** (hero, row #4): `DTE — Develyst The Education คือแพลตฟอร์มเรียนออนไลน์ที่ไม่ใช่แค่คอร์ส
     แต่เป็นการเรียนรู้ส่วนตัวที่ขับเคลื่อนด้วย AI`; two English labels turned Thai (`About DTE`→`เกี่ยวกับ DTE`,
     `Feature`→`หัวข้อ`, `AI Innovation`→`นวัตกรรม AI`); `Vision/Mission`→`วิสัยทัศน์/พันธกิจ`; the table's
     right column reworded from `DTE.md`. Everything else, including the founder line, is byte-identical.
  3. At 1280 px that new sentence **wraps in the middle of `เรียนรู้`** (`เรียน|รู้`) — Chrome's Thai
     line-breaking, the same on every Thai paragraph. If it bothers him, the fix is a one-string change.
  Answer `ผ่าน` / `แก้: …` with the label **REQ-008**.

(SA Lead adds questions here as new bullets; Porter answers as `> answer: ...`)

## Porter's acceptance check (2026-09-13)

Status stays **`SPEC_DONE`** — not `DELIVERED` — because AC 5 (his eyes + his correction round) is open.

- **AC 1 MET on evidence + Porter's read** — every AFTER string in SPEC-008 §Copy carries a source
  (`DTE.md` §Key Messages / §Vision / the comparison table / §Core Concept, or the page as it was); the
  only new sentence (#4) is a paraphrase of `DTE.md` §Core Concept with the A22 name. Nothing invented.
- **AC 2 MET on evidence** — `check-no-emoji.mjs src/app/about/page.tsx` → `0` (Fern; re-run by Sober);
  `src`-wide 110 → 93 (the 17 left are the untouched stray `about/page-new.tsx`, out of scope); the
  checker's known gap `⏰` U+23F0 was grepped separately → none.
- **AC 3 MET on evidence + Porter's read of §Copy (the constraint's "Porter reads the draft")** — no
  `Disrupt Thai Education`, no `DTE Platform`; the product name appears once, as `DTE — Develyst The
  Education` (A22 form); short `DTE` elsewhere (A38); tab title untouched (REQ-005). **Nothing flagged.**
- **AC 4 MET on evidence** — build 9 routes, tsc clean, 1-file diff, shared `ui/` components untouched,
  both themes screenshotted. Side observation, not a defect: the Vision/Mission heading rows are 8 px
  shorter (36 px emoji → 32 px icon), measured, accepted by Sober.
- **AC 5 OPEN** — his eyes and his corrections; asked as §Questions Q1 above with the three
  disclosures. Porter looked at the light screenshot: reads as DTE, no emoji, the `เรียน|รู้` wrap is
  visible in the hero — but Porter's eyes are not the AC.
- `/about` is still the un-migrated `app/about/page.tsx` — Sober's deliberate call (SPEC-008 call 1):
  copy first, migration later, so his corrections stay a cheap string diff. `DELIVERED` ≠ deployed.
