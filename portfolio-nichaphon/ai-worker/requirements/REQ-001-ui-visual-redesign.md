# REQ-001: Visual identity rebuild — Home page first

- Status: SPEC_DONE
- Priority: HIGH
- Requested: 2026-08-30 by the human (stakeholder / site owner)
- Deadline: none given
- History: opened 2026-08-30 as DRAFT/BLOCKED with six open questions (title
  then: "Full UI visual redesign — remove the Claude-like look"). The owner
  answered all six the same day; the answers narrowed the first deliverable to
  the Home route, so the title now names that. Q1–Q6 answers are recorded in
  `## Questions` below. Updated again 2026-08-30 with the Q7–Q9 answers and the
  reference screenshot (R9); the visual direction is no longer blocked. Updated
  again 2026-08-30 with the Q10–Q11 answers: English wording for quotes 1–3 now
  exists in R5 (owner authorised translation); Q10 stayed open because "yes"
  arrived without the changed Thai strings. Updated again 2026-08-30 — Q10
  closed: the owner told Porter to make the corrections himself, so R5 now
  carries settled Thai for quotes 1–3. Updated again 2026-08-30 — the owner
  answered the Q10 scope note with a bare `ใช่`; that is now **Q12**, open and
  non-blocking. Updated again 2026-08-30 — **Q12 is CLOSED**: the owner answered
  `แค่วรรคตอนพอ` ("punctuation is enough"), i.e. reading (B). R5's Thai is final;
  no quote is re-worded. Same update opens and closes **Q13** (the owner's answer
  to the SA's SQ1: the light/dark toggle is removed from Home). Status moved to
  IN_SPEC to match the board — SPEC-001 is active. **R5 is unchanged in wording
  and nothing in this REQ is blocked.**

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
     2. `ผมไม่ได้ทำงาน "ให้" ใคร ผมทำงาน "ร่วม" กับใคร`
     3. `จุดอ่อนและจุดแข็งของผมคือ "ไม่สนใจอย่างอื่นเลย นอกจากการแก้ไขปัญหาที่สำคัญที่สุดขององค์กร"`

     Every edit, listed so he can check them one by one at review:
     - Quote 1 — one space added at the clause break, after `มากๆ`. `มากๆ` kept
       the way he writes it (not respaced to `มาก ๆ`): that is his register, not
       an error.
     - Quote 2 — the two halves now space their quote marks the same way. He
       wrote `ทำงาน"ให้"ใคร` tight and `ทำงาน "ร่วม" กับใคร` spaced; the spaced
       form is his own, so both halves use it. Straight `"` kept as typed.
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

- [ ] Viewing `/` locally, the owner states the page no longer reads as "like
      Claude" and reads as his own.
- [ ] The page is dark-dominant with purple as its identity colour (R2).
- [ ] The recurring components on Home are visibly different in shape/style, not
      just recoloured versions of the current ones (R1).
- [ ] At least one, and not all four, of the quotes in R5 appears on Home.
- [ ] Any quote shown matches R5 character-for-character — Thai quotes 1–3 as
      settled in R5, quote 4 as `Don't say why me. Say try me.`, and any English
      rendering of quotes 1–3 exactly as listed in R5 (no re-translation).
- [ ] At the Home review the owner confirms **Porter's English** for quotes 1–3;
      his replacement string wins. (The Thai is settled — Q12 closed 2026-08-30.)
- [ ] Home has no light/dark toggle in the header and renders dark-only (R10).
- [ ] No client-facing wording on Home is new or altered, except the quotes (R4).
- [ ] Nothing from the reference screenshot's own content appears on the page —
      no `150+`, no `12Years`, no filler paragraph, no other brand's name (R9).
- [ ] `npm run build` completes with no errors; `npm run dev` serves `/` with no
      console errors (R7).
- [ ] Every navigation link still reaches its route; the other five routes still
      render (they may still look old — that is expected at this stage) (R8).

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

### Answered 2026-08-30 by the owner

- **Q1.** Which part of the current look feels most like Claude?
  > answer: `ทุกอย่าง รวมทั้งpattern component` — everything, component patterns
  > included. Folded into R1.
- **Q2.** Is there a site/brand/design you want it to feel like?
  > answer: one reference screenshot, saved by the owner on 2026-08-30 to
  > `project-docs/image-1788033178719.webp`. DATA REQUEST closed. Folded into R9.
- **Q3.** If no reference: which mood?
  > answer: `ดำปนม่วง` — black mixed with purple. Folded into R2.
- **Q4.** Re-skin or rebuild?
  > answer: `รื้อใหม่` — rebuild. Folded into R3.
- **Q5.** May the UI library change?
  > answer: `เปลี่ยนได้ แต่จะเปลี่ยนเป็นอะไร ต้องทำให้version match กันไม่error`
  > — permitted, with compatibility mandatory. Folded into R7 + Constraints.
- **Q6.** Deadline / all six routes at once or Home first?
  > answer: `Home ก่อนก็ได้` — Home first. No deadline given. Folded into R6.

- **Q7.** Quote 4 `Dont say why me Say Try me` — render exactly, or as
  `Don't say why me. Say try me.`?
  > answer: `แก้ช่วยได้เลย ทั้งหมด` — correct it. Quote 4's canonical wording is
  > now `Don't say why me. Say try me.` (the form offered in the question, so
  > that is the form he approved). `ทั้งหมด` extends the permission to the Thai
  > quotes, but see Q10 — nothing Thai is touched without his exact string.
- **Q8.** Do the quotes render in the language given, or translated?
  > answer: `เอาทั้งคู่ไปเลย` — both. Bilingual is what he wants; the English
  > wording for quotes 1–3 has to be his, not ours. See Q11. Folded into R5.
- **Q9.** Does the owner want to approve a UI-library change?
  > answer: `ให้ทีมตัดสินเอง` — the team decides, R7 still binds. Folded into
  > Constraints.

- **Q11 — DATA REQUEST, closed 2026-08-30.** Asked for the owner's own English
  wording for quotes 1–3.
  > answer: `แปลมาเลย` — he does not want to write them; the team translates.
  > Porter's three English strings are now canonical in R5, flagged there for
  > his confirmation at the Home review. Bilingual quotes are unblocked.

- **Q10 — closed 2026-08-30.** Asked him to paste the exact final Thai string
  for each of quotes 1–3, after his earlier `yes`.
  > answer: `ก็นายคิดให้ไปเลย` — "you do it for me, go ahead." He declined to
  > write them and delegated the correcting, the same way he delegated the
  > English in Q11. The three corrected strings are now in R5, with every edit
  > itemised there for him to check at the Home review.
  >
  > **Scope Porter applied, stated so he can overrule it:** Q10 was a
  > *punctuation-and-spacing* question — it descends from Q7's `แก้ช่วยได้เลย`
  > about `Dont say why me` — so the corrections are punctuation and spacing
  > only. No word of his was rewritten. If what he actually meant was "rewrite
  > the wording of my quotes", that is a different and larger permission and he
  > has to say so; R5 stands until he does.

### Answered 2026-08-30 — second round

- **Q12 — opened 2026-08-30, CLOSED 2026-08-30.** Was non-blocking throughout.
  Q10 closed with a scope note saying that if the owner meant "rewrite the
  *wording* of my quotes" — not just punctuation and spacing — that is a larger
  permission he has to grant explicitly. Porter put that to him as a yes/no
  question in chat. **The question's exact Thai text was not written to a file
  before the session ended** (process gap, now fixed by this entry); it was, in
  substance: *"the corrections I made are punctuation and spacing only — no word
  of yours was changed. If what you meant was for me to re-word the quotes
  themselves, say so."*
  > answer received 2026-08-30, verbatim: `ใช่`
  >
  > **Porter did not act on it, on purpose.** A bare `ใช่` against a question
  > whose text is not on disk has two opposite readings, and Porter cannot tell
  > which from the files:
  > - **(A)** yes — go ahead and re-word the quotes themselves; or
  > - **(B)** yes — punctuation-and-spacing only is correct, that is what I meant.
  >
  > Reading (A) means Porter writes new personal quotes for a real person on his
  > client-facing shopfront. That is the one thing R4 exists to prevent, and a
  > one-word answer with an unverifiable antecedent is not the explicit
  > permission R4 requires. Reading (B) means doing nothing. Doing nothing is
  > therefore correct under (B) and merely *deferred* under (A) — the quotes in
  > R5 are already safe to build with, and a wording swap later is a one-line
  > copy edit on strings the design treats as content.
  >
  > **R5 is unchanged and stays canonical.** Nothing in this REQ is blocked.
  >
  > **What unblocks Q12 — one line from the owner, either:**
  > - `แค่วรรคตอนพอ` / "punctuation only is right" → Porter closes Q12, R5 final; or
  > - the **new Thai wording he wants**, quote by quote → the only form of (A)
  >   Porter can act on without inventing his voice for him. If he again
  >   delegates the wording itself (`นายคิดให้`), Porter will draft it and mark
  >   every rewritten quote for his line-by-line approval at the Home review
  >   before it can ship — a rewrite is never confirmed by silence.
  >
  > **Resolution, 2026-08-30, verbatim: `แค่วรรคตอนพอ`** — "punctuation is
  > enough." That is the first of the two unblocking lines above, i.e. reading
  > **(B)**: punctuation-and-spacing only was the right scope, no word of his is
  > re-written. **Q12 is CLOSED and R5's Thai for quotes 1–3 is FINAL.** No
  > re-wording happens under this REQ; a future wording change would be a new
  > request from him. The Thai strings no longer need his confirmation at the
  > Home review — only Porter's English (Q11) still does.

- **Q13 — opened and CLOSED 2026-08-30 (the SA's SQ1, relayed by Porter).**
  SPEC-001 §Questions SQ1 notified the owner that the rebuilt Home ships a single
  dark scheme and the light/dark toggle therefore leaves the header — a control
  he can see on the live site today. Porter put that to him rather than let him
  find it at review.
  > answer, verbatim: `เอาออก` — take it out. The toggle is removed with his
  > agreement. Folded into **R10** and into the acceptance criteria. SPEC-001's
  > dark-only decision stands; Sober keeps the SQ1 answer in his own file — Porter
  > does not write to `specs/`.
  >
  > Not asked, not assumed: this says nothing about the other five routes, which
  > are out of scope here. Whether they keep a toggle while Home has none is a
  > question for the follow-up REQ, not something decided by this answer.

### Open — owner must answer (Porter asks; nobody guesses)

- None. Everything the owner owes this REQ is answered; the only item still
  needing him is his **confirmation of Porter's English** for quotes 1–3, which
  happens at the Home review (see Acceptance Criteria), not before.

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
  > answer:
- **AC2 — Porter's English for quote 2**, the only translated quote rendered on
  Home: `I don't work "for" anyone. I work "with" them.` Approve it, or paste his
  replacement string (his wins). Quotes 1 and 3 are not on Home; their English
  stays unconfirmed until a route that shows them ships. The **Thai** is settled
  (Q12) and is not reopened here.
  > answer:

**Owner-eye observations (A–E). None has been "fixed" by the team, and none is
presumed a defect until he says so. Updated 2026-09-02: QA ran A and E for real
and both PASS — they are closed below and do not come back to him. B, C and D
remain his: C now with QA's evidence attached, B and D untouched.**

- **A — reduced motion (check 16).** OS reduced-motion switch ON, load `/`: the
  hero should not animate in and nothing should move. The CSS rule coverage is
  proven; the *look* was never run — the flag is not emulable in the team's
  environment.
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

## QA round — brief for Tanya, issued 2026-08-30 by Porter

The project now has a QA role. The owner's words on 2026-08-30, verbatim:
`ok ลองดูมี QA ละ` — "ok, let's try it, we have QA now." That is an instruction to
put this REQ through an independent QA round, not a change to the requirement.
Nothing below is new scope: every item is already an acceptance criterion or an
already-issued review item in this file.

**Why an independent round when TASK-005 already swept.** TASK-005 was the
builder's own evidence run, reviewed by the SA. QA is the first pass by someone
who did not build it and does not read the diff to decide. Tanya re-runs the
browser checks herself; the team's earlier results are context, not evidence she
may tick from.

**Scope: Home (`/`) only, local only** (`cd front && npm run dev`). Production is
the owner's alone. The five out-of-scope routes are checked for regression only
(R8) — they may look old, they may not be broken.

**QA verifies (objective — these are REQ §Acceptance Criteria):**

- Dark-only render and **no light/dark toggle in the header** (R10).
- Any quote rendered on Home matches R5 **character-for-character**, and **at
  least one but not all four** quotes appear (R5).
- **Nothing from the reference screenshot's own content** is on the page — no
  `150+`, no `12Years`, no filler paragraph, no other brand's name (R9).
- Recurring components are visibly different in shape/style, not recoloured
  (R1) — reported as observation + screenshot, not as a verdict on taste.
- `npm run build` clean; `/` served with **no console errors** (R7).
- **Regression (R8):** all six routes reachable from header and footer, mobile
  drawer included; no 404; nothing on the five old routes renders broken
  (invisible text, white-on-white, missing border).
- Desktop **and** mobile viewports, with screenshots for each.

**Three items are moved off the owner's list to QA — attempt them, and if the
environment genuinely cannot run one, the verdict is `NOT TESTED` and it goes
straight back to him.** Do not tick any of them from a code read:

- **A — reduced motion.** With the OS/browser reduced-motion preference on, `/`
  must not animate in and nothing may move. Previously marked not-runnable by
  the team; QA attempts it.
- **C — hero at a short desktop window (1280x600).** Capture what falls below the
  fold at 1280x600 **and** at 360x740. **The accept/reject call stays the
  owner's** — QA supplies the picture so he decides from evidence, not from
  resizing his own window.
- **E — skip-link by keyboard.** On `/`, press Tab once then Enter; report where
  focus lands. `Enter` specifically could not be dispatched before.

**QA does NOT decide these — they stay with the owner, unchanged:**

- **AC1** (does `/` read as his own) and **AC2** (Porter's English for quote 2):
  business/taste calls, his alone.
- **B** (is the 1px top band objectionable): measured already; the judgment is his.
- **D** (`/contact` real send): fires his mail client. QA must not send one.
- **F** and **G**: scope questions, not defects.

**Deliverables to Porter:** `tests/TEST-NNN-*.md` per the QA template, screenshots
saved under `../project-docs/` and referenced by path, one verdict
(`TEST_PASSED` / `TEST_FAILED` / partial stated as partial), and the first
`tests/REGRESSION.md`. Defects are reported, never fixed — a `TEST_FAILED`
routes to Sober as a REQ-level concern, never to the engineer.

**Gate:** a QA verdict does not replace the owner's sign-off. REQ-001 goes
`DELIVERED` only when AC1 + AC2 are answered by him **and** QA is not failing.

## Owner's own change after the QA round — recorded 2026-09-02 by Porter

**Fact, not an interpretation.** After Tanya's QA round finished (her screenshots
are timestamped 12:05 on 2026-08-30), the owner edited and committed code on
`portfolio-nichaphon-web` himself. HEAD is now `76ad68e`, message
`fix: correct Thai translation in quotes and adjust max-width for lead and band
styles`, authored by him; the working tree is clean. Files newer than the QA run:
`front/src/constant/content/quotes.ts`, `PullQuote.tsx`, `PullQuote.module.css`,
`HomeStatement.tsx`, `HomeStatement.module.css`. No team member touched any of
these — git writes are his alone.

His message to Porter, verbatim: `ตอนนี้ฉันแก้ไข ok แล้ว`.

**Porter is not guessing what that sentence closes.** It could mean the code is
now the way he wants it, or that some of the open acceptance items are settled by
his own edit, or both. Nothing on his list (AC1, AC2, B, C, D, F, G, H) is being
ticked off it — an acceptance criterion is ticked by his answer to that criterion,
never inferred from a commit message.

**Two consequences that are facts, and are open:**

1. **R5's canonical Thai may no longer match what ships.** R5 fixes the Thai of
   quotes 1–3 as FINAL (Q10/Q12: punctuation and spacing only). His commit says it
   corrected the Thai in `quotes.ts`. His words always win over Porter's edits, so
   the REQ is the thing that is now possibly stale — but Porter will not copy new
   strings out of code into a requirement. **He supplies the strings, or QA
   compares code against R5 and reports the difference.**
2. **QA's evidence is now partly stale.** TEST-001 verified the quote strings
   character-for-character and measured the hero/fold against R5 and item C on the
   pre-`76ad68e` build. `PullQuote` and `HomeStatement` — the components carrying
   the quote and the hero lead — have changed since. TEST-001 stays a true record
   of the build it ran on; it is not evidence about HEAD.

**Open — the owner answers; nobody re-runs or re-writes anything until he does:**

- **N1 — what does `แก้ไข ok แล้ว` close?** Just the code, or does it also answer
  any of AC1 / AC2 / B / C / D / F / G / H in §Home acceptance review? Name
  them; silence closes none.
  > **WITHDRAWN 2026-09-02 — not answered, and not re-asked.** See §Standing rule
  > below. Nothing on the A–H / AC1 / AC2 list is ticked by this; every one of
  > them is still owed by him as an answer to that criterion.
- **N2 — the corrected Thai of quotes 1–3.** Paste the three strings as they now
  stand, so R5 records his wording rather than Porter's. If he would rather QA
  read them out of the build and report the diff to Porter, say so and that is
  what happens instead.
  > **WITHDRAWN 2026-09-02 as a question to him.** The fallback already written
  > into this bullet is what happens instead: **QA reads the strings out of the
  > build and reports the diff against R5 to Porter.** R5's wording is NOT edited
  > by anyone until he rules on the diff.
- **N3 — re-verify HEAD?** His edit changed the two components QA measured. Should
  Tanya re-run the affected part of TEST-001 against `76ad68e` (quote strings, the
  hero fold at 1280×600 / 360×740, clean build, no console errors) before REQ-001
  is signed off?
  > **WITHDRAWN 2026-09-02 as a question to him — Porter decides it, and did.**
  > Re-verifying is inside the QA leg Porter already owns, and re-running existing
  > cases from TEST-001 is not new scope. **Tanya re-runs the affected part of
  > TEST-001 against the working tree as it now stands.** Reason stated without
  > reference to how the tree changed: TEST-001's evidence is older than the
  > current build of `PullQuote` and `HomeStatement`.

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
- **This changes nothing about acceptance.** AC1 and AC2 are still blocking and
  still owed by him; B, C, D, F, G and H are still his non-blocking calls. Those
  are questions about the product, not about his commits, so they stay open and
  Porter will keep asking for them.
- **The two consequences recorded above stay true and stay handled** — but by QA,
  not by him: R5's canonical Thai versus what renders is a QA report to Porter,
  and TEST-001's staleness is closed by a QA re-run, not by an answer from him.
  If the diff turns out to be real, the resulting question to him is a product
  question ("does the Thai on the page stand as final, so R5 records it?") and it
  is asked as such.

## QA re-verify round — issued 2026-09-02 by Porter

**Why:** TEST-001's evidence is older than the current build of `PullQuote` and
`HomeStatement` — the two components carrying the Home quote and the hero lead.
TEST-001 stays a true record of the build it ran on; it is not evidence about
what is on disk now. No new scope: every case below is already in TEST-001 and
already an acceptance criterion in this REQ.

**Scope: Home (`/`) only, local only** (`cd front && npm run dev`). Re-run these
cases against the working tree as it now stands, and nothing else:

1. **R5 character-for-character.** Every quote rendered on Home, compared to R5's
   canonical Thai in this file. If they differ, **report the difference to Porter
   — do not tick, do not fail it as a defect, and do not edit anything.** R5 is
   Porter's file and only the owner rules on the wording. State both strings.
2. **R5 count** — at least one but not all four quotes appear.
3. **Item C, the hero fold** at **1280×600** and **360×740**: what falls below the
   fold, and whether the lead paragraph is cut mid-sentence. Fresh screenshots.
   The accept/reject call remains the owner's; QA supplies the picture only.
4. **R7** — `npm run build` clean, and `/` served with no console errors.

**Explicitly not re-run:** A and E (closed by QA, they do not come back), the R8
six-route regression (unaffected), and everything already passing in TEST-001 and
untouched by these two components. If QA judges a fifth case genuinely affected,
name it to Porter first rather than widening the round.

**Standing rule applies** (see §Standing rule above): report what the page
renders. Do not inspect git, do not quote commits, do not mention authorship.

**Deliverable:** append the re-verify result to `tests/TEST-001-...md` as a dated
section (do not overwrite the original round), screenshots under
`../project-docs/`, and one verdict for the re-run. `TEST_FAILED` routes to
Porter, never to the engineer.
