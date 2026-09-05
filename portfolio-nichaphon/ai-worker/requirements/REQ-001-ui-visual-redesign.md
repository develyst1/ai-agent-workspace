# REQ-001: Visual identity rebuild — Home page first

- Status: DELIVERED (2026-09-02)
- Priority: HIGH
- Requested: 2026-08-30 by the human (stakeholder / site owner)
- Deadline: none given
- History (consolidated 2026-09-02 in a PM housekeeping hop; the pre-consolidation
  copy of this file is verbatim in
  `../archive/REQ-001-ui-visual-redesign-2026-09-02-preconsolidation.md`):
  opened 2026-08-30 as DRAFT/BLOCKED with six open questions, titled then
  "Full UI visual redesign — remove the Claude-like look". The owner answered
  Q1–Q6 the same day and his answers narrowed the first deliverable to the Home
  route, so the title now names that. Q7–Q13 followed on 2026-08-30 and are all
  closed — see §Questions; their outcomes live in R1–R10, and R5 carries the
  settled quote strings. Status ran DRAFT/BLOCKED → READY_FOR_SA → IN_SPEC
  (SPEC-001 active) → SPEC_DONE. On **2026-09-02** the owner answered **AC1
  (yes)**, **AC2 (`อนุมัติ`)** and **Q4** (the page's Thai for quote 2 is
  canonical, because he wrote it himself), closing both blocking items; the
  eleventh criterion was ticked the same day by QA's confirm-tick round, so
  **all 11 acceptance criteria are ticked** and the REQ moved to **DELIVERED on
  2026-09-02** — see §Delivery. Two forward asks from him are parked in
  §New asks — they are not part of this REQ.

## Problem / Goal

The site owner judged that the live site (`portfolio.develyst.online`) reads as
a copy of Claude's / Anthropic's look rather than as his own brand. For a
personal portfolio that is a direct business problem: the site is his shopfront
to freelance clients, and a borrowed look undercuts the impression of an
independent professional.

His answers on 2026-08-30 turned "not like Claude" into a positive direction:
he wants a portfolio **that is unlike anyone else's and that reads as
egoist** — self-assured, opinionated, a personality on the page rather than a
neutral template. Verbatim:

> อยากได้ เว็บPortfolio ที่ไม่เหมือนใคร ที่เป็นegoist

Goal for this REQ: **the Home route is rebuilt in that new identity, and the
design language it establishes is reusable for the other five routes.**

## Requirement

The system must:

1. **R1 — Replace the visual identity wholesale, component patterns included.**
   The owner's answer to "which part feels like Claude" was `ทุกอย่าง รวมทั้ง
   pattern component` — *everything, including the component patterns*. So
   colours, typography, spacing, and the shape/behaviour of the recurring
   components (cards, chips, section headings, buttons, header/footer) must all
   change. Re-colouring the existing components is **not** sufficient.

2. **R2 — Base palette: black mixed with purple.** Owner's words: `ดำปนม่วง`.
   Dark-dominant with purple as the identity colour. Exact hues, ramps and any
   secondary/accent colours are the design's call, not fixed here.

3. **R3 — Rebuild, not re-skin.** Owner's answer to Q4 was `รื้อใหม่`. The Home
   page's sections may be re-laid-out, merged, added or dropped. This permission
   is about **structure and layout**, not about words — see R4.

4. **R4 — No invented copy.** Existing real copy (about a real person and a real
   business) may be moved, re-grouped or left out, but no role rewrites it or
   writes new client-facing text. If the new layout needs a headline, label or
   section that has no existing copy, that is a **DATA REQUEST to the owner via
   Porter**, not a plausible-sounding placeholder. The four quotes in R5 are the
   only new copy supplied so far.

5. **R5 — Carry the owner's quotes, distributed, never all in one place.**
   Owner's words: `มีquoteให้หลายอันเลย เอาไปแยกหน้าได้ หรือแยกใส่หลายๆส่วนใน
   แต่ละหน้าได้ แต่ไม่ควรใส่หมดเลยหน้าเดียว` — the quotes may live on their own
   page, or be spread across sections of several pages, but **not all of them on
   a single page**. The four quotes, verbatim as given on 2026-08-30:

   1. `นักพนันที่เก่งมากๆไม่ได้เล่นแค่ตาที่ตัวเองไพ่ดี`
   2. `ผมไม่ได้ทำงาน"ให้"ใคร ผมทำงาน "ร่วม" กับใคร`
   3. `จุดอ่อนและจุดแข็งของผมคือ "ไม่สนใจอย่างอื่นเลยนอกจากการแก้ไขปัญหาที่สำคัญที่สุดขององค์กร"`
   4. `Dont say why me Say Try me`

   Which quote(s) land on Home, and how they are presented, is the design's
   call — subject to the "not all on one page" rule.

   **Rendering, settled 2026-08-30 (Q7, Q8):**
   - Quote 4 renders as `Don't say why me. Say try me.` — the owner authorised
     the punctuation fix (`แก้ช่วยได้เลย`); this exact string is the form he
     approved, and it is now the canonical wording. No further wording changes.
   - **Quotes 1–3, Thai — settled 2026-08-30 (Q10).** The owner asked for them to
     be corrected (`แก้ช่วยได้เลย ทั้งหมด`), then handed the correcting to Porter:
     `ก็นายคิดให้ไปเลย`. That instruction, and only that instruction, lifts R4 for
     these three strings — **and only for punctuation and spacing. Not one word
     was added, removed or replaced.** The owner confirmed that scope on
     2026-08-30 (`แค่วรรคตอนพอ`, Q12), so the three strings below are **FINAL** —
     no re-wording, and no confirmation of them is outstanding at the Home review.
     Canonical Thai:

     1. `นักพนันที่เก่งมากๆ ไม่ได้เล่นแค่ตาที่ตัวเองไพ่ดี`
     2. `ผมไม่ทำงาน "ให้" ใคร ผมทำงาน "ร่วม" กับใคร`
        (**superseded 2026-09-02 by the owner — Q4.** Was
        `ผมไม่ได้ทำงาน "ให้" ใคร ผมทำงาน "ร่วม" กับใคร` (45 chars) until then.
        QA found the page rendering a 42-char string without the word `ได้`;
        the owner ruled `เอาตามเว็บ เพราะนั่นฉันแก้เองกับมือ` — the page wins,
        because he edited it himself. R5 now **records** what he wrote; the
        code is not changed and no one re-words it. The adopted string is
        character-identical to what QA measured on local `/` on 2026-09-02,
        node `PullQuote_primary`, `lang="th"` — see
        `tests/TEST-001-req001-home-acceptance.md` §R5 difference.)
     3. `จุดอ่อนและจุดแข็งของผมคือ "ไม่สนใจอย่างอื่นเลย นอกจากการแก้ไขปัญหาที่สำคัญที่สุดขององค์กร"`

     Every edit, listed so he can check them one by one at review:
     - Quote 1 — one space added at the clause break, after `มากๆ`. `มากๆ` kept
       the way he writes it (not respaced to `มาก ๆ`): that is his register, not
       an error.
     - Quote 2 — the two halves now space their quote marks the same way. He
       wrote `ทำงาน"ให้"ใคร` tight and `ทำงาน "ร่วม" กับใคร` spaced; the spaced
       form is his own, so both halves use it. Straight `"` kept as typed.
       (History only — the wording itself was superseded by the owner on
       2026-09-02, see the note on canonical Thai #2 above.)
     - Quote 3 — one space added before `นอกจาก`. Nothing else; it was already
       well-formed.

     The English strings below are unaffected — no meaning changed, so the pairs
     still match.
   - **English wording — authorised 2026-08-30 (Q11).** The owner answered
     `แปลมาเลย` ("just translate them"). That instruction, and only that
     instruction, lifts R4 for these three strings. Canonical English, translated
     by Porter, to be confirmed by the owner at the Home review:

     1. `A truly great gambler doesn't only play the hands where his own cards are good.`
     2. `I don't work "for" anyone. I work "with" them.`
     3. `My weakness and my strength are the same thing: "I care about nothing but solving the most important problem of the organisation."`

     Quote 4 is already English (`Don't say why me. Say try me.`); no Thai
     version exists and none is invented.
     Translator's note for the owner, so he can check the two places wording was
     added rather than mirrored: quote 1 uses "truly great" for `เก่งมากๆ`, and
     quote 3 adds "are the same thing" as the connective that Thai carries
     without a word. If either reads wrong, his replacement string wins.
   - **English for quote 2 — CONFIRMED by the owner 2026-09-02** (`อนุมัติ`,
     AC2). `I don't work "for" anyone. I work "with" them.` is final and is not
     re-opened by the Thai change above: he approved it on the same day, looking
     at the page that already rendered his own Thai. Quotes 1 and 3 stay
     unconfirmed until a route that shows them ships. (This is the answer to
     TEST-001 Q5 — the pair re-check folds into AC2 and is not a separate ask.)
   - **Bilingual presentation is the design's call.** Both languages are wanted
     (`เอาทั้งคู่ไปเลย`); whether they appear paired, stacked, toggled, or one
     language per section is a design decision, not a business rule. A Thai
     string later changed under Q10 must have its English pair re-checked.

6. **R6 — Home first, then approval.** Owner's answer to Q6 was `Home ก่อนก็ได้`.
   Only the Home route (`/`) ships under this REQ. The owner reviews Home
   locally and approves the direction before the remaining five routes are
   requested as a follow-up REQ.

7. **R7 — The build must stay clean.** Whatever the redesign does to the UI
   library (see Constraints), `npm run build` must succeed and `npm run dev`
   must run with no version conflicts or console errors. Owner's words:
   `ต้องทำให้version match กันไม่error`.

8. **R8 — The site keeps doing what it does.** Navigation to all six routes,
   the contact form, and the existing behaviours on Home keep working; no route
   404s as a side effect of the rebuild.

9. **R9 — Reference: the owner's screenshot is on disk.**
   `project-docs/image-1788033178719.webp` (supplied 2026-08-30 as his answer to
   Q2). It is the only concrete evidence of the look he wants and it is now the
   anchor for the visual direction. Factual observations only — how far to
   follow it is the design's call: near-black page, large purple/violet-to-blue
   gradient shapes bleeding across the hero, an oversized display wordmark as
   the main visual event, a thin minimal top nav, translucent "glass" stat
   cards, a plain underlined text link as the call to action.
   **The reference's own content is not ours.** Its brand name, its filler
   paragraph and its metrics (`150+ Win Awards`, `12Years Experience`) belong to
   the sample — putting any of them on this site would be invented copy, which
   R4 forbids.

10. **R10 — Home is dark-only; the light/dark toggle is removed.** The SA raised
    this as decision notice SQ1 (the rebuilt Home ships one dark scheme, so the
    toggle leaves the header). Porter put it to the owner on 2026-08-30 and he
    answered `เอาออก` — take it out. Recorded as **Q13** below. The owner is
    therefore not losing a visible control by surprise: he chose to drop it. If
    he ever wants light mode back, that is a second designed colour scheme and a
    new REQ, not a re-enabled toggle.

## Acceptance Criteria

> Ticks dated 2026-09-02. AC1/AC2 are ticked by the owner's own words (see
> §Home acceptance review); the rest by QA evidence in
> `tests/TEST-001-req001-home-acceptance.md`. **All 11 boxes are ticked as of
> 2026-09-02** — no box is open. This is what DELIVERED rests on (§Delivery).

- [x] Viewing `/` locally, the owner states the page no longer reads as "like
      Claude" and reads as his own. — **2026-09-02, AC1: `ใช่ ไม่เหมือน claude
      แล้ว`.** His "but" (make it bolder, and update the portfolio content) is
      new scope, not a defect — see §New asks below.
- [x] The page is dark-dominant with purple as its identity colour (R2).
      — QA case 1; and covered by AC1's yes.
- [x] The recurring components on Home are visibly different in shape/style, not
      just recoloured versions of the current ones (R1). — AC1's yes; QA case 17
      is the observation behind it.
- [x] At least one, and not all four, of the quotes in R5 appears on Home.
      — QA re-verify R2: two of four.
- [x] Any quote shown matches R5 character-for-character — Thai quotes 1–3 as
      settled in R5, quote 4 as `Don't say why me. Say try me.`, and any English
      rendering of quotes 1–3 exactly as listed in R5 (no re-translation).
      — **ticked by QA 2026-09-02** in the confirm-tick round (§QA rounds, round
      3; Porter would not tick his own R5 edit). All three strings rendered on
      `/` are R5-exact: quote 4
      (29), quote 2 Thai (42), quote 2 English (46). Evidence and the node table:
      `tests/TEST-001-req001-home-acceptance.md` §Confirm-tick round.
- [x] At the Home review the owner confirms **Porter's English** for quotes 1–3;
      his replacement string wins. — **2026-09-02, AC2: `อนุมัติ`**, for quote 2,
      the only one on Home. Quotes 1 and 3 stay unconfirmed until a route shows
      them; that is not this REQ's bar.
- [x] Home has no light/dark toggle in the header and renders dark-only (R10).
      — QA cases 1, 2.
- [x] No client-facing wording on Home is new or altered, except the quotes (R4).
      — QA case 6.
- [x] Nothing from the reference screenshot's own content appears on the page —
      no `150+`, no `12Years`, no filler paragraph, no other brand's name (R9).
      — QA case 5, zero hits.
- [x] `npm run build` completes with no errors; `npm run dev` serves `/` with no
      console errors (R7). — QA re-verify R4, on the current build.
- [x] Every navigation link still reaches its route; the other five routes still
      render (they may still look old — that is expected at this stage) (R8).
      — QA cases 9–12.

## Constraints

- **Brownfield, live site.** Work lands on `develop` as edited files. The human
  alone merges, releases and deploys. No role runs git writes, `pm2`, ssh, or
  the release/merge scripts.
- **UI library: change permitted, compatibility mandatory.** The owner's answer
  to Q5 was `เปลี่ยนได้ แต่จะเปลี่ยนเป็นอะไร ต้องทำให้version match กันไม่error`
  — the team **may** move off Mantine 8, but whatever it moves to must be
  version-compatible with the existing Next 15.5 / React 19 app and must build
  clean. Whether to actually change it is a technical decision for the SA, not a
  business requirement. Note the survey's paid-for gotcha: Mantine 9 breaks on
  Next 15. **Settled 2026-08-30 (Q9): the choice is the team's, no owner
  sign-off needed** (`ให้ทีมตัดสินเอง`) — R7 still binds, and the owner is told
  what was chosen when Home is handed to him for review.
- **Content is real.** No invented client names, testimonials, certificates,
  dates or metrics (R4) — including anything read off the reference (R9).
- **Reference material: received 2026-08-30**, `project-docs/image-1788033178719.webp`.
  The earlier DATA REQUEST is closed and the visual direction is unblocked (R9).

## Out of Scope

- The other five routes (About, Services, Portfolio, Blog, Contact) — they
  follow as a separate REQ after the owner approves Home (R6).
- A dedicated quotes page, if one is wanted — the owner allowed it (`เอาไปแยก
  หน้าได้`) but Home is this REQ's only route; a quotes page is a follow-up.
- Rewriting or translating any existing copy (R4).
- The survey's known gaps (missing `/blog/[slug]`, posts authored as "Develyst
  Team") and repo hygiene items (stale root `README.md`, credentials in
  `SERVER_MAINTENANCE.md`, committed `.DS_Store`).
- Deployment.

## Questions

Every question raised under this REQ is **closed**. Their answers are folded into
the requirement text above; this section is the index — question → the owner's
verbatim answer → where the answer now lives — plus the two decision records that
exist nowhere else (Q10's scope note and Q12's unrecorded-question gap).

### Closed 2026-08-30 — first round (Q1–Q9)

| Q | Asked | Owner's answer (verbatim) | Folded into |
|---|---|---|---|
| Q1 | Which part of the current look feels most like Claude? | `ทุกอย่าง รวมทั้งpattern component` — everything, component patterns included | R1 |
| Q2 | Is there a site/brand/design it should feel like? | one reference screenshot, saved by him 2026-08-30 to `project-docs/image-1788033178719.webp`; DATA REQUEST closed | R9 + Constraints |
| Q3 | If no reference: which mood? | `ดำปนม่วง` — black mixed with purple | R2 |
| Q4 | Re-skin or rebuild? | `รื้อใหม่` — rebuild | R3 |
| Q5 | May the UI library change? | `เปลี่ยนได้ แต่จะเปลี่ยนเป็นอะไร ต้องทำให้version match กันไม่error` | R7 + Constraints |
| Q6 | Deadline / all six routes at once or Home first? | `Home ก่อนก็ได้` — Home first, no deadline given | R6 |
| Q7 | Quote 4 rendered exactly as typed, or as `Don't say why me. Say try me.`? | `แก้ช่วยได้เลย ทั้งหมด` — correct it; the form offered in the question is the form he approved, and `ทั้งหมด` extends the permission to the Thai quotes (but see Q10 — nothing Thai is touched without his instruction) | R5 |
| Q8 | Do the quotes render in the language given, or translated? | `เอาทั้งคู่ไปเลย` — both | R5 |
| Q9 | Does he want to approve a UI-library change? | `ให้ทีมตัดสินเอง` — the team decides; R7 still binds | Constraints |

### Closed 2026-08-30 — second round (Q10–Q13)

- **Q10 — DATA REQUEST, closed 2026-08-30.** Asked him to paste the exact final
  Thai string for each of quotes 1–3, after his earlier `แก้ช่วยได้เลย ทั้งหมด`.
  > answer: `ก็นายคิดให้ไปเลย` — "you do it for me, go ahead." He declined to
  > write them and delegated the correcting, the same way he delegated the
  > English in Q11. The three corrected strings, and every individual edit, are
  > itemised in R5 for him to check.
  >
  > **Scope Porter applied, stated so he can overrule it:** Q10 was a
  > *punctuation-and-spacing* question — it descends from Q7's `แก้ช่วยได้เลย`
  > about `Dont say why me` — so the corrections are punctuation and spacing
  > only. No word of his was rewritten. If what he actually meant was "rewrite
  > the wording of my quotes", that is a different and larger permission and he
  > has to say so; R5 stands until he does.
- **Q11 — DATA REQUEST, closed 2026-08-30.** Asked for the owner's own English
  wording for quotes 1–3.
  > answer: `แปลมาเลย` — he does not want to write them; the team translates.
  > Porter's three English strings are canonical in R5. Quote 2's was approved by
  > him at acceptance (AC2); quotes 1 and 3 stay unconfirmed until a route that
  > shows them ships.
- **Q12 — opened and CLOSED 2026-08-30, non-blocking throughout.** Porter put it
  to him in chat: the corrections are punctuation and spacing only, no word of
  yours was changed — if you meant re-wording the quotes themselves, say so.
  **The question's exact Thai text was never written to a file before that
  session ended** (process gap, recorded here so the record is honest).
  > first answer, verbatim: `ใช่`
  >
  > **Porter did not act on it, on purpose.** A bare `ใช่` against a question
  > whose text is not on disk has two opposite readings — **(A)** yes, re-word
  > the quotes themselves, or **(B)** yes, punctuation-and-spacing only is what I
  > meant — and Porter cannot tell which from the files. Reading (A) would mean
  > Porter writing new personal quotes for a real person on his client-facing
  > shopfront, which is the one thing R4 exists to prevent; a one-word answer with
  > an unverifiable antecedent is not the explicit permission R4 requires. Doing
  > nothing was therefore correct under (B) and merely deferred under (A).
  >
  > **Resolution, 2026-08-30, verbatim: `แค่วรรคตอนพอ`** — "punctuation is
  > enough", i.e. reading **(B)**. **Q12 CLOSED and R5's Thai for quotes 1–3 is
  > FINAL**; no word of his is re-written under this REQ, and a future wording
  > change would be a new request from him, never confirmed by silence. (Quote
  > 2's Thai was later superseded by his own hand — Q4 below — not by a re-word.)
- **Q13 — opened and CLOSED 2026-08-30** (the SA's SQ1, relayed by Porter).
  SPEC-001 §Questions SQ1 notified the owner that the rebuilt Home ships a single
  dark scheme and the light/dark toggle therefore leaves the header — a control he
  can see on the live site today. Porter put it to him rather than let him find it
  at review.
  > answer, verbatim: `เอาออก` — take it out. Folded into **R10** and into the
  > acceptance criteria. SPEC-001's dark-only decision stands; Sober keeps the SQ1
  > answer in his own file — Porter does not write to `specs/`.
  >
  > Not asked, not assumed: this says nothing about the other five routes, which
  > are out of scope here. Whether they keep a toggle while Home has none is a
  > question for the follow-up REQ, not something decided by this answer.

### Closed 2026-09-02 — Q4 (raised by QA in TEST-001; distinct from first-round Q4)

- **Q4.** QA's re-verify round found `/` rendering a 42-character Thai for quote 2
  without the word `ได้`, differing from R5's then-canonical 45-character string.
  Porter asked which is canonical — he did not copy code into the requirement.
  > answer, verbatim: `เอาตามเว็บ เพราะนั่นฉันแก้เองกับมือ` — the **page** wins,
  > because he edited it himself. R5 now *records* his string; **no code was
  > changed and no one re-words it.** See R5 and §Owner's answers 2026-09-02.

### Open — owner must answer (Porter asks; nobody guesses)

- **None.** Everything this REQ needed from him is answered — AC1, AC2 and Q4 all
  closed on 2026-09-02. His **non-blocking** calls B, C, D, F, G and H in §Home
  acceptance review are still outstanding; they map to no acceptance criterion and
  travel with him, not with this REQ's status (§Delivery).

## Home acceptance review — issued 2026-08-30 by Porter

The five TASKs of SPEC-001 are DONE and the SA handed over an owner-eye package
(items A–G in `tasks/TASK-005-acceptance-sweep.md` §Review). Porter put the list
to the owner **in Thai, in chat**, on 2026-08-30. Nothing here is decided by the
team; each line is answered by the owner and recorded below as `> answer: ...`.
Until every blocking item is answered, REQ-001 stays `SPEC_DONE` — **not**
`DELIVERED`.

How he looks at it: the work is on `develop` in `portfolio-nichaphon-web`
(absolute path: workspace-root `machine.local.md`), run `cd front && npm run dev`
→ http://localhost:3000. The human has already committed this REQ's work
(`566d466` and earlier) — no team member commits, deploys or runs `pm2`.

**Blocking — an acceptance criterion cannot be ticked without it:**

- **AC1 — the identity call.** Does `/` no longer read as "like Claude", and does
  it read as his own? (Acceptance criteria 1–3.) One word is enough; if "no", the
  reason is the next REQ's starting point.
  > **answer (2026-09-02, verbatim):** `ใช่ ไม่เหมือน claude แล้ว แต่อยากพัฒนา
  > ให้มันเท่ และ เบียวขึ้นไปอีก และยังต้องมาอัปเดต portfolio ด้วย เพราะ นั่นมันของเก่า
  > มีอีกหลายอย่างที่เกิดขึ้นมา`
  > — **AC1 is a YES.** The identity criteria (1–3) are ticked. The rest of his
  > sentence is a **forward ask, not a rejection and not a defect**: push the
  > look further ("เท่ / เบียว"), and update the portfolio content because it is
  > out of date. Neither is in REQ-001's scope and neither is specified enough to
  > become a REQ yet — both are carried to §New asks below with the questions
  > Porter must put to him first. Nothing here reopens a ticked criterion.
- **AC2 — Porter's English for quote 2**, the only translated quote rendered on
  Home: `I don't work "for" anyone. I work "with" them.` Approve it, or paste his
  replacement string (his wins). Quotes 1 and 3 are not on Home; their English
  stays unconfirmed until a route that shows them ships. The **Thai** is settled
  (Q12) and is not reopened here.
  > **answer (2026-09-02, verbatim):** `อนุมัติ` — approved as written. The
  > string `I don't work "for" anyone. I work "with" them.` is final. He approved
  > it on the same day the page was rendering his own hand-edited Thai, so the
  > pair is confirmed as it ships and TEST-001 Q5 needs no separate round.

**Owner-eye observations (A–E). None has been "fixed" by the team, and none is
presumed a defect until he says so. Updated 2026-09-02: QA ran A and E for real
and both PASS — they are closed below and do not come back to him. B, C and D
remain his: C now with QA's evidence attached, B and D untouched.**

- **A — reduced motion (check 16).** OS reduced-motion switch ON, load `/`: the
  hero should not animate in and nothing should move.
  > **CLOSED 2026-09-02 by QA — off the owner's list, does not come back.** Tanya
  > ran it for real (TEST-001 case 14): `getAnimations()` empty at first paint,
  > two settled frames byte-identical, hero fully visible (not stuck at the
  > animation start), and a `no-preference` control run *did* show the 520ms rise
  > — so the check can fail and didn't. No answer owed.
- **B — the 1px band (check 20(b)).** At scroll 0, is a thin dark rule visible
  along the very top edge, at 1280px and at 360px? Measured, so it is really
  there: contrast step 1.15–1.43:1. Whether it is *objectionable* is his call. If
  it is, the remedy is a SPEC decision for Sober, not a one-off `+1px`.
  > answer:
- **C — the hero in a short desktop window (check 20(a)).** At 1280×600 both CTAs
  and the hero quote fall below the fold and the lead paragraph cuts mid-sentence.
  **On a phone (360×740) they do not** — that half of the original premise was
  wrong and was corrected. Acceptable, or should the hero shrink at short heights?
  > **Evidence supplied 2026-09-02 by QA — the call is still yours, nothing was
  > changed.** TEST-001 §C, independent run: at **1280×600** the lead paragraph is
  > cut mid-sentence (last words visible "…by an average of 40"), and both CTAs
  > plus the hero quote sit entirely below the fold. At **360×740** nothing is cut
  > and everything is above the fold. Shots `07` and `08` in
  > `../project-docs/qa-req001-2026-08-30/`. Look at the two shots, then answer.
  > answer:
- **D — `/contact` real send (check 4).** The team deliberately did **not** fire a
  valid submit: it sets `window.location.href = mailto:…` and would launch his
  mail client. The code is unchanged by this REQ (empty diff). Only he can send
  one for real and confirm it still works.
  > answer:
- **E — skip-link by keyboard (check 13).** Focus ring, tab order and pointer
  activation are verified; `Enter` specifically could not be dispatched through
  the automation layer. One keystroke for him: Tab once on `/`, press Enter, does
  focus land on the main content?
  > **CLOSED 2026-09-02 by QA — off the owner's list, does not come back.** Tanya
  > dispatched the keystrokes (TEST-001 case 15): Tab #1 focuses `Skip to content`
  > with a visible ring; Enter sets `#main` and scrolls; the **next** Tab lands on
  > `View my work`, inside `<main>`, while the control run without Enter lands on
  > the header wordmark instead. The skip link does skip. No answer owed.

**Scope questions — business calls, not defects (F–G). Both were caused by this
REQ and both are outside its Home-only scope, so neither was changed:**

- **F — `/contact` required-field asterisk is 4.37:1** (three instances; Mantine's
  default red on the new dark ground). No acceptance bar in this REQ is broken.
  Fold it into the five-routes REQ, or raise it as its own small REQ now?
  > answer:
- **G — the display `h1` now applies to all five out-of-scope routes** (`/about`
  renders ~136px). Intentional groundwork from the global token layer. Leave it as
  the preview of the new identity, or contain it to Home until those routes are
  rebuilt? Containing it is a SPEC change plus a five-route re-verify — real work,
  so it is his call, not a tidy-up.
  > answer:
- **H — the footer year reads `© 2025`** (added 2026-09-02, raised by QA as
  TEST-001 Q1). The string **predates this REQ** and R4 forbids the team touching
  it, so nothing was changed. Whether the year is meant to be the current one is a
  fact only he has. **Not blocking** — it does not affect any acceptance criterion.
  > answer:

**Not asked, on purpose:** nothing about the other five routes' design, and no
new scope. Home approval (R6) is the gate to the follow-up REQ; that REQ is
written only after AC1 is answered.

## Standing rule — the team does not track the owner's code changes (2026-09-02)

His instruction to Porter, verbatim: `เลิกสนใจการ commmit code ของฉันตั้งใจทำงานกันไป`
— stop paying attention to my code commits, get on with the work.

From now on, and until he says otherwise:

- **No role inspects, reports on, or asks about his commits, HEAD, authorship or
  git history.** No commit hash is quoted at him and no question is raised
  *because* something was committed.
- **The build as it stands is the only thing the team looks at.** When the team
  needs to know what ships, QA runs it and reports what renders — never a diff
  read against his authorship.
- **This changes nothing about acceptance.** The acceptance criteria are answered
  by him, criterion by criterion — never inferred from a code change. (AC1 and
  AC2 were both answered by him later the same day; B, C, D, F, G and H remain
  his non-blocking calls and Porter keeps asking for them. Those are questions
  about the product, not about his commits, so they stay open.)
- **The two consequences of his own edit stay true and stay handled** — by QA,
  not by him: R5's canonical Thai versus what renders was a QA report to Porter
  (which became **Q4**), and TEST-001's staleness was closed by a QA re-run
  (§QA rounds, round 2). The resulting question to him was a product question
  ("does the Thai on the page stand as final, so R5 records it?") and was asked
  as such.

## QA rounds — the record (2026-08-30 → 2026-09-02)

Three QA rounds ran under this REQ; all are complete. The per-case evidence lives
in `tests/TEST-001-req001-home-acceptance.md` (verdict `TEST_PASSED`) and
`tests/REGRESSION.md`, and the outcomes are ticked in §Acceptance Criteria — none
of that is repeated here. What follows is what each round was for, and the rules
that governed all three.

**Standing rules for every QA round on this REQ:**

- Scope is Home (`/`) only, **local only** (`cd front && npm run dev`). Production
  is the owner's alone. The five out-of-scope routes are checked for regression
  only (R8) — they may look old, they may not be broken.
- QA re-runs the browser checks itself. The team's earlier results are context,
  never evidence to tick from, and **nothing is ticked from a code read**. If the
  environment genuinely cannot run a case, the verdict is `NOT TESTED` and the
  case goes straight back to the owner.
- **Defects are reported, never fixed.** A `TEST_FAILED` routes to Sober as a
  REQ-level concern, never to the engineer. R5 is Porter's file: a difference
  between the page and R5 is reported to Porter — no tick, no defect, nothing
  edited; only the owner rules on wording.
- **A QA verdict does not replace the owner's sign-off.** REQ-001 could go
  `DELIVERED` only when AC1 + AC2 were answered by him **and** QA was not failing.
- **QA does not decide** AC1, AC2, B, D, F or G — business and taste calls, his
  alone. Deliverables each round: a dated section in `tests/TEST-NNN-*.md`,
  screenshots under `../project-docs/` referenced by path, and one verdict.

**Round 1 — full Home round, 2026-08-30.** Opened on the owner's instruction
`ok ลองดูมี QA ละ` ("ok, let's try it, we have QA now") — an instruction to put
this REQ through an independent round, not a change to the requirement. It is the
first pass by someone who did not build it and does not read the diff to decide
(TASK-005 was the builder's own evidence run, reviewed by the SA). It covered
every acceptance criterion above on desktop and mobile viewports, plus the R8
six-route regression including the mobile drawer, and produced the first
`tests/REGRESSION.md`. Three items were moved off the owner's list for QA to
attempt: **A** (reduced motion), **C** (hero at 1280×600 and 360×740) and **E**
(skip-link by keyboard). A and E came back PASS and are **closed off his list**;
C's picture was supplied and the accept/reject call stays his.

**Round 2 — re-verify, 2026-09-02.** The owner changed the site's code himself
after round 1 and told Porter `ตอนนี้ฉันแก้ไข ok แล้ว`. Porter ticked **nothing**
off his list from that sentence. Two facts followed, both handled by QA rather
than by him: the components carrying the Home quote and the hero lead
(`PullQuote`, `HomeStatement`) had changed since round 1, so TEST-001 remained a
true record of the build it ran on but was not evidence about what was on disk;
and R5's canonical Thai might therefore no longer match what shipped. Round 2
re-ran exactly four cases against the working tree as it stood — R5
character-for-character, the R5 quote count (at least one, not all four), item C's
fold at 1280×600 and 360×740 with fresh screenshots, and R7's clean build with no
console errors — and **explicitly did not** re-run A and E (closed) or the R8
regression (unaffected). Its R5 finding became **Q4**, which the owner answered.

Three questions Porter had drafted for the owner about that edit were **withdrawn
on 2026-09-02, unasked**: **N1** ("what does `แก้ไข ok แล้ว` close?") and **N2**
("paste the corrected Thai for quotes 1–3") by the standing rule above — QA reads
what renders and reports the diff to Porter, the owner is not questioned about his
own code — and **N3** ("re-verify the current build?") because Porter decided it
himself: re-running existing TEST-001 cases sits inside the QA leg he already
owns and is not new scope. Nothing on the AC1 / AC2 / B–H list was ticked by any
of this.

**Round 3 — confirm tick, 2026-09-02.** One case. Porter had changed R5's
canonical Thai for quote 2 to record what renders (Q4), and he does not tick a
"matches character-for-character" criterion from his own edit. QA compared every
quote rendered on `/` to R5 as it then stood, by exact string equality: all
matched — quote 4 (29 chars), quote 2 Thai (42), quote 2 English (46) — so the
eleventh criterion was ticked and `REGRESSION.md` H3 got its baseline (R5 as of
2026-09-02).

## Owner's answers — 2026-09-02 (AC1, AC2, Q4)

Three answers arrived from the owner in chat on 2026-09-02. Recorded verbatim
where they were asked (AC1 and AC2 in §Home acceptance review above, Q4 in
`tests/TEST-001-req001-home-acceptance.md` §Questions). What they change:

1. **AC1 = yes.** The identity is accepted; acceptance criteria 1–3 are ticked.
   His follow-on wishes are new scope — §New asks below.
2. **AC2 = `อนุมัติ`.** Porter's English for quote 2 is final; TEST-001 Q5 folds
   into this answer and needs no separate round.
3. **Q4 = `เอาตามเว็บ เพราะนั่นฉันแก้เองกับมือ`.** The **page** is canonical for
   quote 2's Thai, because he wrote it himself. R5 has been updated to record
   the string QA measured; **no code is changed and no one re-words it.**

**Both blocking items are now answered**, so the only thing between REQ-001 and
`DELIVERED` was the one unticked criterion — closed the same day by QA's
confirm-tick round (§QA rounds, round 3). Still outstanding from him and
**still non-blocking**: B, C, D, F, G, H in §Home acceptance review.

## New asks raised at acceptance — NOT part of REQ-001 (2026-09-02)

> **Consolidated 2026-09-05** (hygiene: REQ-001 was 45.3KB > the 45.0KB gate).
> The full original text of this section — the N4/N5 wording, the Q14–Q17
> reasoning, the Q17 material table, the link-typo note, the read-only boundary
> and Q20/Q21 as first written — is kept byte-for-byte in
> `../archive/REQ-001-ui-visual-redesign-2026-09-05-preconsolidation.md`.
> Nothing below is new and nothing was dropped: every detail now lives in the
> REQ that owns it, checked file-by-file before this was shortened. REQ-001 is
> unaffected and stays DELIVERED.

AC1's answer carried two forward wishes, both **out of REQ-001's scope** — this
REQ is closed by its own criteria:

- **N4 — `เท่ และ เบียวขึ้นไปอีก`** (bolder / more dramatic). Not a defect in the
  delivered Home; he accepted Home in the same breath.
- **N5 — `อัปเดต portfolio ... นั่นมันของเก่า มีอีกหลายอย่างที่เกิดขึ้นมา`**. A
  **content** ask, and R4 binds: the new facts exist only with him.

Porter asked Q14–Q17 in Thai in chat on 2026-09-02; the owner closed all four
the same day. **Q14–Q17 CLOSED:**

| Q | Owner's answer (verbatim) | What it settles |
|---|---|---|
| Q14 | `ทั้งเว็บ` | N4's scope = the **whole site**, not Home only. → REQ-002 R1 |
| Q15 | `เอาแนว AI + robotic + IOT` | The anchor for "เท่ / เบียว" = an **AI + robotic + IoT** direction. → REQ-002 R2 |
| Q16 | `ทั้งเว็บ` | N5's scope = his content **across the site**, not `/portfolio` only. |
| Q17 | `พวกนายสามารถสามารถดูcode บน github ได้มั้ย มีgithub กับ domain url`, plus two of his real projects | Material for N5 arrives as **source repos + live URLs**, not finished copy. Answer to his question: **yes** — all four repos and every branch he named are reachable read-only (checked 2026-09-02). |

**Where each ask lives now — this section is a pointer, not the record:**

- **N4 → `REQ-002-whole-site-step-up-five-routes.md`**, opened 2026-09-02,
  merged with R6's five-route rebuild. Q14's unanswered sequencing half, and
  Porter's applied-but-overrulable "one merged REQ" scope, are recorded there.
- **N5 → `REQ-003-portfolio-content-refresh.md`**, opened 2026-09-05 after he
  re-raised it, status `DRAFT — BLOCKED`. It carries the Q17 material table
  (both live URLs, all four repos with branches), the 2026-09-02 link typo now
  **CLOSED by his own message**, the read-only / no-credentials boundary as its
  own R4, and the open **Q20** (permission to publish), **Q21** (who writes the
  copy) and **Q22** (DATA REQUEST: role, dates, client, results per project).

## Delivery — REQ-001 set DELIVERED 2026-09-02 by Porter

**What DELIVERED rests on, verified first-hand before the status moved:**

1. All **11 acceptance criteria** in §Acceptance Criteria are ticked — counted in
   the file, 11 `[x]` and 0 `[ ]`. AC1 and AC2 are ticked by the owner's own
   words (§Owner's answers 2026-09-02); the other nine by QA evidence.
2. All **five TASKs of SPEC-001 are DONE** (board §Tasks, reviewed by Sober).
3. **TEST-001 is `TEST_PASSED`** — the partial closed by the confirm-tick round;
   `tests/REGRESSION.md` H3 is baselined (R5 as of 2026-09-02) and PASS.
4. This REQ's own gate is met: "Until every blocking item is answered, REQ-001
   stays `SPEC_DONE` — not `DELIVERED`" (§Home acceptance review). Both blocking
   items — AC1 and AC2 — are answered.

**What DELIVERED does NOT close.** These are carried forward as-is; DELIVERED is
not a decision on any of them and none was changed by the team:

- **B, C, D, F, G, H** in §Home acceptance review — still the owner's calls,
  still unanswered, all explicitly non-blocking (none maps to an acceptance
  criterion). **D** in particular is a check only he can run (`/contact` real
  send). They travel with him, not with this REQ's status.
- **N4 and N5** in §New asks, with **Q14–Q17** — no REQ-002 exists until he
  answers, and **R6's five-route REQ stays held** for the same reason.
- Quotes 1 and 3's English stays unconfirmed (no route shows them yet).

**Scope of the delivery:** the Home route (`/`) only, on `develop`, as edited
files. Nothing was deployed, merged or committed by any role. Final business
sign-off remains the owner's; Porter reports this delivery to him in Thai.
