# REQ-004: The "Open live project" button must be reachable without scrolling on a phone

- Status: **DELIVERED — 2026-09-05, Porter. 7 of 7 AC ticked** (AC-e + AC-f on
  the diff earlier today; **AC-a / AC-b / AC-c / AC-d / AC-g ticked now on
  TEST-007**, `TEST_PASSED`, 12/12, 0 defects, run on the *built* surface).
  **`DELIVERED` is the team's word, not the owner's** — his sign-off, and the
  deploy, are still his and are not given. Nothing has shipped: the one edited
  file is unstaged on `D1`, `main` / `production` do not carry the work.
  (Was **SPEC_DONE — 2026-09-05, Sober**; before that **READY_FOR_SA —
  2026-09-05, Porter**, created straight from the owner's one-word answer to
  **OBS-8**.) **Q30 / Q31 / Q32 stay open and NON-blocking**, each with a written
  default; **SQ18-SQ21 and the new OBS-9 ride to him at sign-off.** See §His
  answer, §Questions, §Acceptance pass and §Delivery.
- Priority: MEDIUM (a real usability fix on the two entries he approved himself,
  but nothing is broken — QA proved the button reachable today)
- Requested: 2026-09-05 by the site owner (Nichaphon)
- Deadline: none given
- Source: **OBS-8**, raised by Tanya (QA) in `../tests/TEST-006-req003-acd-portfolio-modal-pictures.md`
  §Observations, recorded as REQ-003 §Observation 8 and put to the owner as a
  one-line call: *leave it, or raise the button on phones in a later REQ.*
  **He chose "raise it."** This is that later REQ.

## His answer — verbatim

> **`ยกปุ่มขึ้น`**  — the owner, 2026-09-05, answering OBS-8

Two words: *raise the button up*. It is a direct pick of the second of the two
options he was offered, so the goal is not inferred — the option's own wording
was "raise the button on phones". **What he did not say** is how far up, on which
entries, and whether it may change where the button sits in the modal's reading
order. Those are **Q30 / Q31 / Q32** below, each with a declared default, none of
them blocking.

## Problem / Goal

On a **360x740 phone**, opening a project's detail modal on `/portfolio` puts the
**"Open live project"** button roughly **600 px below the modal's own fold**. The
visitor sees the title, the summary, the bullets and the chips, and has to scroll
the modal to discover that the project has a live site at all. The link is the
single most valuable thing in that modal — it is the owner's own shipped product
— and on the phone it is the one thing that is hidden.

Measured by QA on 2026-09-05, fresh production build, viewport 360x740
(TEST-006 case 9; modal box 324x666 at (18,37), so the modal's fold is ~y=703):

| Entry | Button top on open | After ordinary scrolling |
|-------|--------------------|--------------------------|
| Learning Curve | **y = 1255** | y = 634, in viewport, nothing covering it |
| Ong Match | **y = 1293** | y = 634, in viewport, nothing covering it |

Desktop **1280x900 is not affected** — the button is already inside the viewport
on open (Learning Curve 165x44 at (285,735); Ong Match at (285,760)).

**For whom:** a visitor on a phone — which is how most people will meet this
site — and the owner, whose live products are what the button leads to.

## Requirement

1. **The system must show the "Open live project" button inside the viewport when
   a project's detail modal opens on a 360x740 phone**, without the visitor
   scrolling the modal or the page.
2. **The button must stay a real link, unchanged in what it does.** Same `href`,
   same `target="_blank"`, same `rel="noopener noreferrer"` — this REQ moves
   where it is, never what it points at.
3. **No approved word may change.** The Learning Curve and Ong Match entries were
   approved by the owner character-exact (24/24, TASK-017 §Review). This REQ
   changes placement/layout only; if any shipped string would have to change to
   achieve it, that is a finding to raise, **not** a licence to edit his copy.
4. **Desktop must not regress.** At 1280x900 the button must still be visible on
   open and the modal must still read the way it does today.
5. **The modal must keep behaving as it does today** — opens, paints, closes on
   `Escape`, releases the scroll lock, zero console errors.

## Acceptance Criteria

- [x] **AC-a — Learning Curve, 360x740.** The modal opens and the "Open live
      project" button is **fully inside the viewport with no scrolling** — seen as
      a picture *and* measured (bounding box reported), not inferred from the DOM.
      **TICKED 2026-09-05, Porter** on TEST-007 case 1 — `a01-learning-curve-360.png`,
      box **634 → 678**, modal `scrollTop 0` from a fresh reload — see §Delivery.
- [x] **AC-b — Ong Match, 360x740.** The same, seen and measured the same way.
      **TICKED 2026-09-05, Porter** on TEST-007 case 2 — `a02-ong-match-360.png`,
      box **634 → 678**, `scrollTop 0` — see §Delivery.
- [x] **AC-c — the other entries' modals, 360x740.** Every other `/portfolio`
      entry whose modal shows an "Open live project" button meets AC-a's bar, or
      this REQ **names each exception and why**. Silence about an entry is not
      coverage. (Scope default = all of them; see **Q31**.)
      **TICKED 2026-09-05, Porter** on TEST-007 cases 3-8 — the other **five**
      linked modals shot and measured (all inside the fold), and the **four**
      exceptions (RAG Chatbot · Enterprise Backend Optimisation · Develyst AI
      Gateway · R1-BEV) each shown holding the no-demo note in the same bar, with
      the reason already named in SPEC-004 §Coverage: *there is no button to
      raise*. **11 of 11 entries accounted for, none silent** — see §Delivery.
- [x] **AC-d — no desktop regression.** At 1280x900 both new modals still show
      the button on open, seen as pictures, and the modal is still readable.
      **TICKED 2026-09-05, Porter** on TEST-007 cases 9-10 — `c01-…`/`c02-…`,
      scrollport **705/705** and **756/756**, i.e. sticky provably **inert** on
      desktop; button 734.69 → 778.69 and 760.19 → 804.19 — see §Delivery.
- [x] **AC-e — the link itself is untouched.** For every entry checked, the
      anchor's `href` / `target` / `rel` are **identical** to the values TEST-006
      recorded (`https://learning.develyst.online/`,
      `https://ong.develyst.online/`, `_blank`, `noopener noreferrer`). Read off
      the DOM — **never clicked**; those are the owner's own live products.
      **TICKED 2026-09-05, Porter** — see §Acceptance pass.
- [x] **AC-f — his approved copy is byte-identical.** The two approved entries'
      strings are unchanged; a re-derivation shows 0 diffs against DRAFT-001.
      **TICKED 2026-09-05, Porter** — see §Acceptance pass.
- [x] **AC-g — the modal still behaves.** Open, paint, `Escape` closes, scroll
      lock released, and **0 console errors / pageerrors / failed requests** on
      the round, at both viewports.
      **TICKED 2026-09-05, Porter** on TEST-007 case 11 — **13/13 opens painted**
      a titled dialog, **`Escape` closed 13/13**, scroll lock released 13/13, and
      over the whole run **0 console errors · 0 pageerrors · 0 failed requests ·
      0 non-local requests**. The one thing that kept this open — that Fern's
      round ran on `npm run dev` — is gone: **QA served the production build**
      (`BUILD_ID nl80q9MCSEUqycpY3q5Id`) and checked the built CSS carries the
      sticky rule before serving it. See §Delivery.

Deliberately absent: any criterion asserting the new placement *looks good*.
That is the owner's eye at sign-off, not a test the team can run for him.

## Constraints

1. **REQ-003's R5 ("content only, does not restyle anything") does NOT bind this
   REQ.** R5 was written for a content refresh and is exactly why OBS-8 was
   recorded rather than fixed on the spot. The owner has now asked for the
   change, so touching the project modal's layout is **sanctioned here and only
   here** — REQ-003's R5 still stands over REQ-003.
2. **The visual identity of REQ-001 + REQ-002 stands.** This is a placement fix
   inside one component, not a redesign of the modal, the cards or the route.
3. **Nobody deploys, nobody writes git.** Work leaves the team as edited files on
   `develop`; `main` / `production` and the live droplet are the owner's hands
   alone. Current state: `ca5c097` sits on `D1` = `origin/D1` = `develop` =
   `origin/develop`; `main` and `production` do not carry it.
4. **The owner's live URLs are never opened by the team or by QA.** They are read
   off the DOM and looked at, never clicked (standing rule from TEST-006).

## Out of Scope

- **SQ13 / OBS-5** — the `/services` phone-height question. Different route,
  different component; it stays the owner's own separate call.
- Any change to the eleven entries' text, ordering, chips or bullets.
- Adding images or screenshots to the modal (`Project` has no image slot — SQ14).
- Deploying any of this, and the sign-offs still open on REQ-001/002/003.
- The other carries the owner holds (Q22-b, Q29, Q18, Q25, Q26, the SQ-series) —
  untouched by this REQ and **not** closed by it.

## Questions

> **All three are NEW on 2026-09-05, all NON-blocking, each with a default that
> is written down.** A default is **Porter's reading, not the owner's word** — one
> line from him overrules any of them, and the team must not report a default as
> settled.

- **Q30 — does "ยกปุ่มขึ้น" mean "visible on open, with no scrolling at all"?**
  **Default (written into Requirement 1 and AC-a): yes.** He picked the option
  "raise the button on phones", which was offered against the fact "it starts
  below the modal's fold" — so the fold is the bar. If he only meant "put it
  higher up, still fine if a short scroll is needed", the AC softens and the work
  shrinks. Asked in Thai; not waited on.
- **Q31 — all eleven entries' modals, or only the two new ones?** OBS-8 was
  observed on Learning Curve and Ong Match, because those are the two QA opened.
  **Default (AC-c): all of them** — the modal is one surface, a visitor cannot
  tell which entry is "new", and REGRESSION P2 already claims the button for every
  entry that carries a link. Narrowing it to two would be the guess, not widening
  it. Longer entries may need more work; that is Sober's to size, not a reason to
  drop them silently.
- **Q32 — may the button change position in the modal's reading order?** Raising
  it may mean it no longer sits last, after the bullets and the chips.
  **Default: yes — placement inside the modal is the team's design call**, so long
  as no approved *string* changes (Requirement 3) and the link is untouched
  (Requirement 2). If he wants the button to stay last and the modal solved some
  other way, one line changes it.

## Evidence on disk (read-only, already captured — no new QA round needed to start)

- `../tests/TEST-006-req003-acd-portfolio-modal-pictures.md` — case 9 has the
  numbers above; §Observations has OBS-8 in QA's own words.
- `../../project-docs/qa-test006-2026-09-05/` — the pictures, including
  `m-learning-curve-modal-foot-wheel-mobile-360.png` and the Ong Match twin.
- `../tests/REGRESSION.md` **P2** — the standing check for this button. Its note
  currently *records* OBS-8 as expected behaviour ("At 360 the button starts below
  the modal's fold and has to be scrolled to"). **That note becomes wrong the day
  this REQ ships** — flagged for QA, not edited by Porter.
- `requirements/REQ-003-portfolio-content-refresh.md` §Observation 8 — where OBS-8
  was put to the owner. **That file is ~50 bytes from the 45 KB hygiene cap, so
  the answer to OBS-8 is recorded HERE and on the board, not appended there.**

## Acceptance pass — Porter (PM), 2026-09-05

**REQ-004 stays `SPEC_DONE`. 2 of the 7 acceptance criteria are ticked (AC-e,
AC-f); the other five are held open, and every one of them is held for the same
reason: it asks to be SEEN.** TASK-018 is `DONE` and reviewed by Sober, who
re-ran the scope, `tsc`, `npm run build` and the built CSS himself rather than
agreeing with Fern's claim. Nothing here is a complaint about the work — the
implementation is measured, narrow (1 file / 15 insertions / 0 deletions) and
provably neutral on desktop. What is missing is an independent eye.

### The two that closed

| AC | Closed on | The evidence, named |
|----|-----------|---------------------|
| AC-e | Porter 2026-09-05 | **The link is untouched, and the diff proves it before any DOM read does.** `git diff --stat` = one path, `ProjectModal.module.css`; `projects.ts` (where every `href` lives) and `ProjectModal.tsx` (where `target` / `rel` are written) **do not appear in the diff at all**, and 15 insertions / 0 deletions means nothing was removed from the CSS either — scope re-verified first-hand by Sober, not taken from Fern. TASK-018 step 7 then read all seven anchors off the live DOM: `target="_blank"` and `rel="noopener noreferrer"` on 7/7, and the two entries TEST-006 recorded match its values character-for-character. **Never clicked, and provably so** — the round's whole network log contains only `localhost:3055`, zero requests to any live host (Constraint 4 held). See tasks/TASK-018-pin-project-modal-footer.md §Step 7 + §Step 9 |
| AC-f | Porter 2026-09-05 | **His approved copy is byte-identical by construction, which is stronger than a re-derivation.** AC-f asks for 0 diffs against DRAFT-001; the strings were already proven **24/24 character-exact** at TASK-017 §Review (Sober re-derived them from the evaluated module himself), and this REQ's entire diff is one CSS rule in one CSS Module. `projects.ts` is not in the diff, so there is no path by which a string could have moved. A fresh re-derivation would be re-proving an unchanged file — see §What QA is deliberately NOT asked |

**One thing recorded rather than smoothed, so nobody later reads it as a content
edit:** on the five *older* entries, `a.href` read off the DOM comes back with a
trailing `/` that the source literal in `projects.ts` does not have
(`https://dte.develyst.online` becomes `https://dte.develyst.online/`). That is
the `a.href` IDL property normalising a bare origin — the browser's report, not
a changed string — and `projects.ts` is provably untouched. Fern flagged it
himself instead of letting it pass; it is not a defect and it is not a finding.

### The five that are open — and why each one is open

| AC | Why it is not ticked |
|----|----------------------|
| **AC-a** — Learning Curve at 360x740 | The AC's own words are *"seen as a picture **and** measured"*. The measurement exists and is good — button box **634 / 678** inside a modal whose fold is 703, `scrollTop` 0, no scrolling — but it is **the implementer's own number on his own change**, and no one has seen the picture. Same rule that kept REQ-003's AC-d open on TASK-017 |
| **AC-b** — Ong Match at 360x740 | Identical position, identical reason: measured **634 / 678**, unseen |
| **AC-c** — the other entries | **Half of this one is already settled and QA does not need to redo it:** SPEC-004 §Coverage enumerates all eleven entries from `projects.ts` and names the **four with no `link`** (RAG Chatbot for CRM Sales, Enterprise Backend Optimisation, Develyst AI Gateway, R1-BEV Voice Command Robot) as AC-c's exceptions, each with the reason *there is no button to raise*. That is a fact read from a file and I accept it (SQ18). **The other half — that the remaining five linked modals meet AC-a's bar — is measured (7/7 pass) but unseen**, so AC-c stays open with AC-a |
| **AC-d** — no desktop regression | The measurement here is the strongest in the whole task and I want it on the record: at 1280x900 `scrollHeight` is **705 → 705** and **756 → 756**, the content rects are identical, and **the button did not move by one pixel** (734.69 / 778.69 and 760.19 / 804.19, before = after). Sticky is provably **inert** on desktop. But AC-d says *"seen as pictures"*, and it is not my place to tick a word the REQ chose deliberately |
| **AC-g** — the modal still behaves | Fern's round is clean — **0 console errors, 0 pageerrors, 0 failed requests**, 46 requests all 200, `Escape` closes on a real key press, scroll lock releases — and he disclosed two earlier errors that were his own synthetic `KeyboardEvent`, not the product. Two things keep it open anyway: the AC contains the word **"paint"**, which is a seeing word, and the round ran on **`npm run dev` (port 3055) through the Claude Browser pane, not on the built surface and not on Playwright** — Fern declared that himself. REQ-002's AC8 set the precedent: the behaviour claim on the built output is QA's round (TEST-003), not the implementer's |

### What is being asked of QA — one round, TEST-007

Requested from Tanya via `inbox/QA.md`. **The owner's two wants drive it: he
wants to see that the phone button is now visible, and that the pinned bar is
not intrusive.** Everything below is a picture unless it says otherwise.

1. **AC-a + AC-b** — Learning Curve and Ong Match at **360x740**, each modal
   opened fresh, `scrollTop` 0, **no scrolling of any kind**: a picture showing
   the "Open live project" button on screen, with its bounding box reported next
   to the picture.
2. **AC-c** — the same bar, same evidence, for the other five linked entries:
   **DTE Platform · Develyst Company Website · Laichill · YodBarber Queue
   Booking · AI Voice Avatar**. Seven modals in total carry a button.
3. **AC-c's exceptions, one picture each** — the four link-less entries, to show
   the pinned bar holding the `Internal project — no public demo available.`
   note instead of a button. **This is not re-checking SPEC-004's enumeration**
   (that is settled); it is the only way the owner ever sees what SQ19 warned
   about on those four.
4. **AC-d** — both new modals at **1280x900**, as pictures: button visible on
   open, modal still readable.
5. **AC-g** — open, paint, `Escape` closes, scroll lock releases, and the
   **counts**: console errors / pageerrors / failed requests, at both viewports.
6. **SQ19 — the owner's "is it intrusive?" picture. Not an AC; do not tick
   anything with it.** At 360x740, one modal **scrolled to a middle position**,
   so the pinned bar is seen sitting over the content it covers, plus (a) the
   bar's measured height — Fern measures **~89px**, `612.9 → 701.9` — and (b) a
   picture at **full scroll** showing the bar un-pinned with the last chip and
   last bullet uncovered (Fern's step 6 checked this with `elementFromPoint`;
   this is the seen half). This is the material the owner is shown at sign-off.

**Standing constraints she already knows, repeated because they bind this
round:** never open or click the live URLs — read them off the DOM (Constraint
4); name the surface the round ran on; and **`front/.next` currently holds a
production build Sober re-ran at 18:47**, so it is `next start` or clear `.next`
first, never `npm run dev` on top of it.

**A fact she must be given, not left to discover — SQ21:** the fix actually
moved **5 of the 7**. Develyst Company Website (`scrollHeight` 661 = 661) and
Laichill (600 = 600) **never overflowed at 360**, so their buttons were already
on screen before the change. All seven still meet AC-c's bar and all seven should
still be shot — but the honest number for "what changed" is five, and neither QA
nor the owner should be left believing seven were broken.

**Also hers, not mine:** `tests/REGRESSION.md` **P2**'s note records today's
behaviour (*"At 360 the button starts below the modal's fold and has to be
scrolled to"*). That note becomes **wrong** the day this ships. Her file, her
edit — I have not touched it.

### What QA is deliberately NOT asked

- **No re-derivation of the approved strings against DRAFT-001.** AC-f is ticked
  on the diff: `projects.ts` is not in it. Re-running a string comparison on a
  file that provably did not change adds nothing and reads as distrust of a
  check Sober did properly.
- **No re-audit of SPEC-004's eleven-entry coverage table.** It is a read of
  `projects.ts`, already adjudicated here (SQ18).
- **No full REGRESSION re-run.** This change is one CSS rule inside one
  component; REQ-002's site-wide round and TEST-006 closed the surrounding
  questions days ago. P1 / P2 ride along with the modals she opens anyway.
- **No judgement of whether the new placement looks good.** That is the owner's
  eye at sign-off — the REQ says so itself under §Acceptance Criteria — and QA
  supplying the picture is not QA supplying the verdict.

### What `SPEC_DONE` means right now, precisely

- **The acceptance pass has run and found one gap, and that gap is a QA round.**
  REQ-004 is **not** `DELIVERED`, **not** the owner's sign-off, **not** a deploy.
- **Nothing has shipped anywhere.** The one edited file is unstaged on branch
  `D1`; zero git writes by any role. `ca5c097` sits on `D1` = `origin/D1` =
  `develop` = `origin/develop`; `main` and `production` still do not carry the
  team's work, and moving it there is the owner's hand.
- **Q30 / Q31 / Q32 are untouched by this pass and stay open, non-blocking.**
  Their defaults were used where SPEC-004 says they were used — and **Q32's
  default was NOT consumed** (SQ20: the button is still last in the DOM and last
  in the reading order), so nothing is being held for Q32's answer.
- **SQ18 / SQ19 / SQ20 / SQ21 all survive this pass.** SQ19 in particular is not
  a question I can close: *the pinned bar changes how the modal looks, on a modal
  whose look the owner has never seen* (SQ7 is still open). It goes to him with
  the pictures, not before them.

## Delivery — Porter (PM), 2026-09-05

**REQ-004 is `DELIVERED`. All 7 acceptance criteria are ticked.** The five that
were held open this morning are closed now for exactly the reason they were held:
they asked to be **seen**, and an independent eye has now seen them.
**TEST-007 — `TEST_PASSED`, 12 of 12 cases, 0 defects** —
see `../tests/TEST-007-req004-pinned-footer-picture-round.md`, evidence
`../../project-docs/qa-test007-2026-09-05/` (18 pictures + the raw run + every
measured box as JSON).

### What closed the five, in one table

| AC | What was missing this morning | What TEST-007 supplied |
|----|-------------------------------|------------------------|
| AC-a / AC-b | the implementer's own number on his own change, no picture | `a01` + `a02` at 360x740, **fresh reload before each modal**, modal `scrollTop` asserted **0** before measuring, button **634 → 678** against a fold of 703; `elementFromPoint` at the button centre returns the button's own label, so nothing covers it |
| AC-c | five linked modals measured but unseen; the four exceptions never shown | all **11** entries shot: 7 buttons inside the viewport, the 4 link-less ones holding `Internal project — no public demo available.` in the same pinned bar. Nothing silent |
| AC-d | "seen as pictures" is a word the REQ chose deliberately | `c01` + `c02` at 1280x900; scrollport **705/705** and **756/756** — no overflow, **sticky inert**, modal reads as before |
| AC-g | "paint" is a seeing word, and Fern's round ran on `npm run dev` | 13/13 painted, `Escape` closed 13/13, lock released 13/13, **0/0/0/0** counts — and run on the **served production build**, not dev. This is REQ-002 AC8's precedent honoured, not waived |

**Two things I record rather than smooth over, because they are the honest shape
of this delivery:**

1. **The fix moved 5 of the 7, not 7** (SQ21, reproduced independently by QA as
   OBS-10): Develyst Company Website (661/661) and Laichill (600/600) never
   overflowed at 360, so their buttons were already on screen. All seven meet
   AC-a's bar today; only five were ever broken. Nobody — QA, SA or the owner —
   is to be left believing seven were.
2. **QA declared her surface and left it as found.** Sober's build served on
   `:3071`, `.next` untouched, port 3000 not taken, server stopped and verified
   gone, zero git writes, zero product-code edits, production never opened, the
   seven live `href`s read off the DOM and **never clicked** (Constraint 4 held —
   the whole network log is `127.0.0.1:3071` and nothing else).

### QQ13 — ANSWERED: OBS-9 rides **with** the SQ19 pictures, as one question

Tanya asked whether OBS-9 goes to the owner attached to the SQ19 pictures, or on
its own line the way OBS-8 did. **It rides with SQ19, as one single question.**
Reasons, so this is a decision and not a preference:

- **OBS-9 *is* SQ19's answer.** SQ19 asked "the pinned bar changes how the modal
  looks — is that acceptable?"; OBS-9 is what the bar covers, measured. Splitting
  the cost away from the question it answers would hand the owner a worry with no
  picture and a picture with no worry.
- **This is the same rule I applied to QQ9** (OBS-5 rides inside SQ13): *one
  fact, one owner, one question.*
- **OBS-8 was different and stays different** — it was a standalone finding on a
  REQ that had already closed, with no open question to attach to. It earned its
  own line. OBS-9 has a home.
- The owner is therefore asked **one** thing about the bar, with the pictures in
  front of him, not three.

### OBS-9, in the owner's terms — what he is actually being asked

**Not a defect and not an AC failure.** The pinned bar costs **89px = 13.4%** of
the 664px phone scrollport, on all eleven modals. At the moment a modal opens on
a phone:

- **Learning Curve** and **Ong Match** — the last thing visible above the bar is
  the heading **"What it does"**; **none of its five bullets shows until he
  scrolls.** These are the two entries he approved word-for-word.
- **DTE Platform** — a bullet is sliced mid-word; **YodBarber**, **AI Voice
  Avatar**, **Develyst AI Gateway** — the `Stack` chip row is sliced;
  **R1-BEV** — the fifth bullet is sliced.
- **Develyst Company Website** and **Laichill** show none of it (they never
  overflow), and **desktop shows none of it** (sticky inert).

So the trade he is being shown is plain: **the button is now always on screen;
the price is 89px of reading area and a clipped first screen on 7 of 11 modals.**
Both halves are in pictures. **Nobody on the team judges the look** — QA declined
it explicitly, the REQ excludes it by design, and I am not substituting my eye
for his.

### What is NOT closed by this delivery

- **His sign-off and the deploy.** `DELIVERED` is the team's word. `ca5c097`
  sits on `D1` = `origin/D1` = `develop` = `origin/develop`; `main` (`d30dfea`)
  and `production` (`ed2eb5d`) do **not** carry it, and moving it is his hand.
  TASK-018's one edited file is still **unstaged** on `D1`.
- **Q30 / Q31 / Q32** — all three still open, all NON-blocking, each still
  carrying a written default that is *my* reading and not his word. **Q32's
  default was never consumed** (SQ20: the button is still last in the DOM and
  last in the reading order), so nothing waits on it.
- **SQ18 / SQ19 / SQ20 / SQ21** — all four survive delivery and go to him at
  sign-off, with SQ19 now carrying OBS-9 and the pictures per QQ13 above.
- **SQ7** is still open: he has still never told us the modal *look* is right.
  OBS-9 lands inside that same unanswered space, which is why it is his call and
  not ours.
