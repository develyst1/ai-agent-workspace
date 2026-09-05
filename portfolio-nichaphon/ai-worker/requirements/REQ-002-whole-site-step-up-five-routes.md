# REQ-002: Whole-site visual step-up (AI / robotic / IoT) + the five remaining routes

- Status: **DELIVERED 2026-09-05, Porter (PM)** — **8 of 8 acceptance criteria
  ticked**, all 10 REQ-002 TASKs `DONE` (Sober), all three QA rounds closed
  (TEST-004 `TEST_FAILED` → its two defects repaired → TEST-005 `TEST_PASSED`
  5/5 → TEST-003 `TEST_PASSED` 13/13). The last three ticks are **AC3 + AC7**
  (TEST-005) and **AC8** (TEST-003). **`DELIVERED` is Porter's acceptance, not
  the owner's sign-off** — his final business sign-off is still outstanding, and
  the carries in §Delivery survive this status and are NOT closed by it.
  Reached `SPEC_DONE` 2026-09-04 (Sober). See **§Delivery — Porter (PM),
  2026-09-05**.
- Superseded 2026-09-05, kept so the history reads straight — *SPEC_DONE, 5 of 8
  ticked* (AC1, AC2, AC4, AC5,
  AC6). Open: **AC3** (DEF-2 must be fixed then H8 re-run — Q23 = `แก้ก่อนส่ง`),
  **AC7** (Q19 = `เอาออก`; needs a rendered check on the five non-Home routes) and
  **AC8** (`npm run build` = TEST-003). Also open and not an AC: **DEF-3** (Q24 =
  `ใส่สัญญาณเลื่อน`) — see §Owner's answers — 2026-09-05 (AC2, Q23, Q24, AC5, AC7).
- Priority: HIGH
- Requested: 2026-09-02 by the site owner (Nichaphon)
- Deadline: none given
- Source: REQ-001 §New asks — **N4** (bolder look) merged with **R6** (the five
  remaining routes). Owner's answers Q14–Q17, 2026-09-02.

> R-numbers in this file are REQ-002's own. Anything from the previous
> requirement is cited explicitly as `REQ-001 R5`, `REQ-001 R2`, etc.

## Problem / Goal

REQ-001 rebuilt **Home** in a new identity and the owner accepted it — and in the
same breath asked for two things more. Right now the site is two-faced: `/` is in
the new identity, and About, Services, Portfolio, Blog and Contact still carry
the old one. For a shopfront that a freelance client clicks through in thirty
seconds, that is worse than either look on its own.

He also wants the identity pushed further. Verbatim at acceptance:

> เท่ และ เบียวขึ้นไปอีก

**Goal: all six routes read as one site, in one identity, stepped up in the
direction he named.** Nothing about the *words* on the five routes changes here —
that is the separate content ask (N5), still held.

## Requirement

The system must:

1. **R1 — Scope is the whole site.** Asked whether N4 was Home-only or the whole
   site, he answered `ทั้งเว็บ` (Q14). All six routes are in scope — Home
   included, since "the whole site" was the literal answer to that question. Home
   may change, subject to R6 below.

2. **R2 — Direction: AI + robotic + IoT.** Asked what "เท่ / เบียว" means
   concretely — a reference site, a screenshot, or a direction — he answered
   `เอาแนว AI + robotic + IOT` (Q15). That is the anchor for "bolder". **How it
   is expressed** — motion, texture, type, imagery, layout devices — **is the
   design's call, not fixed here**, exactly as REQ-001 R2 left the hues to the
   design.
   **Not decided, not assumed:** whether this is a *visual* direction only or
   also changes how he is *positioned* in words. See **Q18**. Until he answers,
   this REQ treats it as visual only, because that is the question it answered.

3. **R3 — Build on REQ-001's identity, do not start a third one.** He approved
   Home's look and then asked for *more of it*, not for something else. The
   dark-dominant black-and-purple base (REQ-001 R2) and the rebuilt component
   patterns (REQ-001 R1) carry forward and get pushed further. A from-zero third
   identity would throw away what he already said yes to; if the design believes
   it must break from Home's base to reach R2's direction, that is a question for
   Porter, not a decision taken quietly.

4. **R4 — No invented copy. REQ-001 R4 carries unchanged and binds every route.**
   The five routes' existing copy is real copy about a real person and a real
   business. It may be moved, re-grouped, re-laid-out or left out — **it is not
   rewritten, retitled or translated**, and no new client-facing sentence,
   headline, label, statistic, client name, testimonial or date is written by any
   role. If the new layout needs text that does not exist, that is a DATA REQUEST
   to the owner via Porter. His content refresh is **N5 and is not in this REQ**.

5. **R5 — The quotes rule carries across routes.** REQ-001 R5 stands: the four
   quotes are **never all on one page**, the canonical strings are the ones in
   REQ-001 R5 and they render character-for-character, and no quote is re-worded
   or newly translated. With five more routes shipping, the remaining quotes may
   now be distributed — which quote lands where is the design's call, subject to
   that rule. Quotes 1 and 3's **English is still unconfirmed by the owner**; if
   a route ships them, Porter puts them to him at review (REQ-001 R5).

6. **R6 — Home must not regress.** Every criterion ticked in REQ-001
   §Acceptance Criteria still holds after the step-up: dark-only with no
   light/dark toggle, quotes R5-exact, no altered copy, nothing from the
   reference screenshot's own content, all links reaching their routes.

7. **R7 — Light/dark on the other five routes is undecided.** REQ-001 Q13
   (`เอาออก`) removed the toggle **on Home only**, and that record says in as many
   words that it decides nothing about the other five. See **Q19**. No role
   guesses this either way.

8. **R8 — The site still works.** `npm run build` completes with no errors; all
   six routes render and every navigation link reaches its route; no console
   errors on any of the six.

## Acceptance Criteria

Numbered AC1–AC8 by Porter 2026-09-05 so the adjudication below can cite them.
The wording is unchanged from 2026-09-02.

- [x] **AC1** — All six routes (`/`, About, Services, Portfolio, Blog, Contact)
      render in **one** identity — no route is recognisably the old look (R1, R3).
      → **MET 2026-09-05, consequentially — and it is Porter's tick, not the owner's
      words, so he overrules it in one line.** This criterion's own written closer
      (above, 2026-09-05) was "the owner's eye (AC2) on top of a QA round that has
      actually seen the pages". Both now exist: QA saw `/portfolio`, `/blog` and
      `/contact` paint (TEST-004, 3rd eye) and the nine `/about` images (5th eye),
      and AC2 came back `ผ่าน`. **He did not say the words "all six routes read as
      one site"** — he was asked AC2 and answered AC2; this tick applies his answer
      to the rule I wrote for AC1 beforehand, which is why it is declared here.
- [x] **AC2** — **The owner confirms the stepped-up look is bolder than the
      delivered Home and reads as the AI / robotic / IoT direction he asked for**
      (R2). This is his judgement and nobody on the team substitutes for it —
      same bar as REQ-001 AC1.
      → **MET 2026-09-05 — the owner, in his own words.**

      > answer (owner, verbatim, in chat): **`AC2=ผ่าน เท่ขึ้นมาก`**

      "Pass — much cooler." Recorded verbatim and not paraphrased into a verdict he
      did not give. **One thing stated so it is not read as more than it is:** he
      answered "`ผ่าน`" to the criterion **as asked** — which put both halves to him,
      bolder-than-Home *and* the AI / robotic / IoT direction — and his added words
      cover the first half explicitly (`เท่ขึ้นมาก`) and the second only by way of
      passing the criterion. He corrects that in one line if it is wrong.
- [x] **AC3** — Home still passes every REQ-001 acceptance criterion after the
      step-up (R6) — verified by re-running the REQ-001 checks, not asserted.
      → **NOT MET — but the re-run HAS now happened** (TEST-004, 2026-09-05) and
      it found a failure: **H8 FAILS at 360×740 (DEF-2)**. 20 of 23 checks pass;
      S11 belongs to TEST-003 and H5 is unrunnable as written (QQ7).
      → **Still NOT MET, but no longer held on a question: Q23 is ANSWERED
      2026-09-05 — `แก้ก่อนส่ง`, fix it before delivery.** The route to the tick is
      now decided: DEF-2 is repaired, then **H8 is re-run by QA** and passes. Blocks
      DELIVERED until that re-run, and a re-run is the only thing that ticks it —
      "verified by re-running the REQ-001 checks, not asserted" is the criterion's
      own wording and it still binds. **That re-run is requested as TEST-005 check 1 (below).**
      → **MET 2026-09-05 — TICKED on the re-run, not on the fix.** TEST-005
      check 1 re-ran **H8 at 360×740** on the running site and it **PASSES**:
      name 167–256, role 268–293, lead 309–520, CTA 1 544–588, **CTA 2 600–644**,
      hero quote **664–691**, fold 740 — all six parts above the fold with 49px
      to spare, read off `a1-h8-fold-360x740.png`. **DEF-2 is CLOSED.** The rest
      of AC3's re-run is TEST-004's 20-of-23 pass, and its S11 leg has since been
      flipped to PASS by TEST-003. **H5 is the one check nobody ran** —
      unrunnable as written, no baseline exists anywhere QA may read, and I do
      **not** count it against this criterion (QQ7/QQ8). Whether that gap is ever
      closed is the owner's **Q25**, and it survives DELIVERED — see
      tests/TEST-005-req002-closing-round.md §Cases 1.
- [x] **AC4** — Not all four quotes appear on any single page, and every quote
      rendered on any route matches REQ-001 R5 character-for-character (R5).
      → **MET** — TASK-011 §3 (rendered `<blockquote>` counted per route, max 2;
      8 leaf paragraphs, 8 exact matches, every `lang` correct).
- [x] **AC5** — No client-facing wording on any route is new, altered or
      translated, except quotes already canonical in REQ-001 R5 (R4).
      → **MET 2026-09-05 — the declared exception is accepted by the owner.**

      > answer (owner, verbatim, in chat): **`AC5=รับได้`**

      "Acceptable." The one exception was the **14** visible labels that change
      letter case (8 `/about`, 3 `/services`, 3 `/contact`) with **no source string
      touched** — an intended, SA-owned consequence of the label recipe. R4 is his
      rule, so only he could accept it, and he has. Nothing else in the criterion
      moved: Fern's rendered-text A/B against a pristine `git archive HEAD` copy
      stays the evidence (TASK-011 §3).
- [x] **AC6** — Nothing from the reference screenshot's own content appears
      anywhere — no `150+`, no `12Years`, no filler paragraph, no other brand's
      name (REQ-001 R9, now checked across six routes).
      → **MET 2026-09-05** — TEST-004's R9 sweep: 8 strings × 6 routes × 2
      viewports, checked against rendered text **and** against source. **0 hits
      in 96 text checks and 0 in 96 source checks.** First time ever run off Home.
- [x] **AC7** — Light/dark behaviour on the five non-Home routes matches the
      owner's answer to **Q19** — criterion cannot be closed until he answers.
      → **Q19 is ANSWERED 2026-09-05 — `AC7=เอาออก`, take it out** — so the
      criterion finally has a target to match. **Still NOT MET, and Porter will not
      tick it from a source read.** SPEC-002 SQ1 records that `ColorSchemeToggle` is
      **dead code today** — never mounted, surviving only as a re-export in the
      `components/ui` barrel — which points the right way but is a code fact, not a
      rendered outcome, and TEST-004's H1 ("no colour-scheme control anywhere")
      was run on **Home only**. **It ticks when QA has looked at the five non-Home
      routes and found no colour-scheme control there.** That check is bundled into
      the re-test round after DEF-2/DEF-3, not requested as a round of its own.
      Blocks DELIVERED until then. **Requested as TEST-005 check 3 (below).**
      → **MET 2026-09-05 — TICKED on a rendered check, which is exactly what this
      criterion demanded.** TEST-005 check 3: **0 colour-scheme controls on all
      five non-Home routes**, at desktop 1280 **and** mobile 360 **and** inside
      the open drawer. Each `<header>` holds exactly one control — the burger
      (`aria-label="Open navigation"`); the drawer holds six route links and a
      close button and nothing else; `<html data-mantine-color-scheme="dark">`
      and body `rgb(11,9,22)` on all ten loads. Seen in `c-header-desktop-*.png`,
      `c-header-mobile-*.png`, `a3-drawer-open-about-360.png`. This is the
      rendered outcome a source read could never have given — see
      tests/TEST-005-req002-closing-round.md §Cases 3; now REGRESSION **S15**.
- [x] **AC8** — `npm run build` completes with no errors; all six routes serve
      locally with no console errors; every navigation link reaches its route
      (R8). → **PARTIAL — the 360px nav half is now MET** (TEST-004 S5 + 7th eye:
      burger → drawer → six routes → tapped Services → landed `/services` →
      drawer closed, scroll lock released). Still open: `npm run build` has not
      been re-run since TASK-011 (S11 = TEST-003). **TEST-005 does NOT cover this half — TEST-003 does, and REQ-002 needs both rounds.**
      → **MET 2026-09-05 — both halves now measured. TICKED.** TEST-003, the
      BUILD round: `npm run build` **exit 0**, compiled successfully, 10/10
      static pages, **zero error lines and zero warning lines in the whole
      transcript** (`build-transcript.txt`) — **S11 PASSES**. The built output
      then served **12/12 route/viewport loads clean**: 200, one `h1`, own
      `<title>`, dark `rgb(11, 9, 22)`, 0 px horizontal overflow, **0 console
      errors, 0 pageerrors, 0 failed requests**. The navigation half was already
      met at 360 (TEST-004 S5) and at 1280 (TASK-011). **One thing stated so it
      is not read as more than it is:** Tanya ran the built output on **both**
      serving surfaces — `npm run start` (3042) and
      `node .next/standalone/server.js` (3041) — because Next warns that
      `next start` "does not work" with this repo's `output: 'standalone'`.
      **They agree on every check, so this tick holds either way.** Which surface
      the owner's droplet actually runs is a fact no role may go and look at; it
      is asked as **Q26** and it does **not** block this criterion — see
      tests/TEST-003-sq7-build-round.md §Verdict and §Questions QQ10.

## Acceptance record — Porter (PM), 2026-09-05

REQ-002 reached `SPEC_DONE` on 2026-09-04 (Sober: all 7 TASKs DONE). This is
Porter's acceptance pass on it. **`SPEC_DONE` is not `DELIVERED`, and this pass
does not make it so: 1 of 8 criteria is ticked.** Sober's own hand-over says the
same — 9 items carried UNVERIFIED in `tasks/TASK-011-…md` §7. Nothing below is a
complaint about the build work; it is the difference between *built* and
*confirmed*, which is exactly what this step is for.

**Ticked: AC4 only.**

**Not ticked, each with the reason and who closes it:**

- **AC1 — PARTIAL.** The mechanical half has evidence: the retired-pattern greps
  were re-run site-wide and re-verified by Sober (TASK-011 §2), and the two
  survivors are adjudicated on the record (one is an accepted device, one a dead
  export), plus the two `site-hairline` hits. What has **no** evidence is the
  half the criterion is actually about — *the look* — and it cannot come from a
  grep: nobody on this team has seen the rebuilt `/portfolio` cards, `/blog`
  rows or `/contact` panels **paint** (SPEC-002 SQ8, third eye), nor the nine
  `/about` thumbnails (fifth eye). Closed by the owner's eye (AC2) on top of a QA
  round that has actually seen the pages. **Not closed by measurement.**
- **AC2 — the owner's, and the one that matters.** He has not seen the stepped-up
  site. Asked of him 2026-09-05.
- **AC3 — the re-run this criterion demands has not been run.** The criterion says
  in as many words "verified by re-running the REQ-001 checks, **not asserted**".
  `tests/REGRESSION.md` Home checks H1–H8 were last run 2026-08-30 / 2026-09-02 —
  **before TASK-006…TASK-012 landed**. TASK-011 re-covers part of it (quotes =
  H2/H3, console = S6, no h-scroll at 360 = S8, the rendered-text A/B ⊃ H5), but
  **H1 (no colour-scheme control), H6 (reduced motion), H7 (skip link) and H8
  (hero complete at 360) were not re-run by anyone after the step-up**, and H6 is
  independently carried as UNVERIFIED in TASK-011 §7. Requested from QA as
  **TEST-004**.
- **AC5 — met against R4's wording, with one exception I will not absorb.** The
  strongest evidence in the whole REQ sits here: Fern's rendered-text A/B against
  a pristine `git archive HEAD` copy on a second port returned **byte-identical
  `document.body.innerText` on five routes at both viewports** (TASK-011 §3), so
  no role wrote a client-facing sentence. `/contact` differs by exactly three
  `<dt>` labels changing letter case (`EMAIL → Email`, `PHONE → Phone`,
  `LOCATION → Location`), same character count, **no source string touched**.
  Sober's label recipe changes letter case on **14** visible labels in total
  (8 `/about`, 3 `/services`, 3 `/contact` — TASK-010 §Questions FQ31); it is an
  intended, SA-owned consequence and is now a rule in SPEC-002 §Retired patterns.
  **Whether letter case counts as "altered wording" under R4 is the owner's call,
  not mine** — R4 is his rule and he wrote it after copy he cared about was at
  risk. Declared to him 2026-09-05 as a change he can reject in one line.
- **AC6 — nobody has ever checked this on the five routes.** The R9 forbidden
  strings (`FAEK`, `150+`, `Win Awards`, `12Years`, `Li Europan`, `Get Started`,
  `CREATIVE`, `agency.`) are checked only on Home, by `REGRESSION.md` H4, last run
  2026-08-30; a grep of `tasks/TASK-011-…md` finds no R9 check at all, and the
  five routes were out of scope in REQ-001. The A/B above proves REQ-002
  **introduced** nothing — it does not prove **absence**, because it only shows
  the tree matches its own baseline. Cheap to close, and it is an outcome check on
  rendered pages, so it goes to QA in **TEST-004**. **This is a gap in my own
  acceptance evidence, not a defect and not a failing of TASK-011** — no SPEC or
  TASK ever asked for it.
- **AC7 — held on Q19,** open with the owner since 2026-09-02 and re-asked
  2026-09-05. No role guesses it either way (R7 says so explicitly).
- **AC8 — PARTIAL.** Met and re-verified: `npm run build` exit 0 with no error
  and no warning line, 10/10 pages, **zero console errors and zero warnings across
  18 route/viewport loads**, 6 header + 5 footer nav links each reaching the right
  route/`h1`/`title` (TASK-011 §1/§4, Sober re-ran `tsc` and the greps himself).
  **Unmet:** every link click was at **1280 only** — at 360 the links sit behind
  the burger, which opens a `Drawer` (SQ7), so **the mobile navigation path is
  unverified by measurement and unseen by eye, by anyone** (SPEC-002 SQ8, seventh
  eye). "Every navigation link reaches its route" is not established for a phone
  visitor. In **TEST-004** (it is already `REGRESSION` S5).

**What does NOT block DELIVERED**, so silence is not read as a hold: SQ9 (the
lattice no longer reading behind opening blocks — Sober decided it structurally),
SQ11 (the ~123 kB First Load JS regression on `/blog` + `/portfolio` — no perf
budget exists in any SPEC, so there is no criterion to fail; the owner is told
because it is real, not because it gates), SQ12 (the `/contact` focus indicator —
pre-existing and identical at HEAD, outside this SPEC), and the SQ8 opening-block
heights. Each is with the owner as an FYI or a one-line question, and none of
them is a REQ-002 acceptance criterion.

**On DEF-1, the standing instruction is honoured:** the owner is **not** being
told it is fixed. TASK-012's repair is proved as a *box* (nine non-zero rects at
both viewports, rendered A/B against HEAD) and Sober's review says the
authoritative before/after is a re-run of `REGRESSION` **S13**, which currently
stands at **FAIL 2026-09-03**. It is in TEST-004 and the word "fixed" waits for it.

**QA requested: TEST-004 — REQ-002 site-wide acceptance round.** Scope stated as
outcomes, never as method: (i) the full `REGRESSION.md` checklist re-run after the
step-up, S1–S13 and H1–H8, which is what AC3 demands and what settles S13/DEF-1
and S5/mobile nav; (ii) the R9 forbidden-string sweep across all six rendered
routes, for AC6; (iii) the seven SQ8 eye checks, as observations, so AC1's look
half stops being unseen. **TEST-003 (the SQ7 build leg) stays hers and unchanged
and is not folded into this by me** — if one pass answers both, that is her call
and the two verdicts stay separate. The file, the method and every verdict are
Tanya's; Porter never ticks a QA box.

**Status stays `SPEC_DONE`.** It moves to `DELIVERED` only when AC2, AC3, AC5,
AC6, AC7 and the two PARTIALs are closed — the owner closes AC2, AC5 and AC7,
TEST-004 closes AC3 and AC6.

> **This section is the record of the 2026-09-05 acceptance pass and is left as
> written. It is SUPERSEDED later the same day by §Owner's answers — 2026-09-05,
> where AC1/AC2/AC5 tick and Q19/Q23/Q24 close. Read that section for the count.**

### TEST-004 intake — Porter (PM), 2026-09-05 — **SUPERSEDED, then CLOSED**

**Consolidated 2026-09-05 (same housekeeping hop as §Questions).** This intake was
already marked SUPERSEDED the same day it was written, and both defects it opened
have since been closed by TEST-005; it is folded to what it settled and where the
evidence is. **The AC1–AC8 record above and this section's parent prose are
untouched.** Full text verbatim in the archive copy.

Tanya returned **`TEST_FAILED`**, accepted **as written** — no QA verdict softened,
no check re-scoped to make it pass. **QQ4–QQ7 are answered in
`tests/TEST-004-req002-site-wide-acceptance.md`**, which also holds every number and
screenshot cited below.

**What it CLOSED:** **AC6 → MET** (0 hits in 96 text + 96 source checks, six routes,
both viewports — the gap in Porter's own acceptance evidence, filled cleanly).
**DEF-1 → CLOSED on evidence** (9/9 `/about` images with a non-zero box *and*
decoded pixels at 1280 and 360; `REGRESSION` S13 FAIL→**PASS**, which was the
standing gate on ever telling the owner "fixed"). **SQ12 → SETTLED in Sober's
favour** (no outline ring, but the field border changes on a real `Tab`; Fern's
contrary reading was taken unfocused) — only "is a 1px border change enough under
WCAG 2.4.7" survives, and that is the owner's, not a defect. Also settled, not an
AC: **SQ7's drawer half for a real visitor** at 360 — the *drawer* only; the
modal/lightbox **look gate stays Sober's**.

**What it OPENED — both now CLOSED by TEST-005, neither ever absorbed:** **DEF-2**
(Home hero no longer fits at 360×740 — fails `REGRESSION` H8, a bar the owner set
at REQ-001) → owner's **Q23**; **DEF-3** (`/services` at 360 strands two of three
columns behind a scroller with no scrollbar, fade or hint — the page itself does not
overflow, so S8 correctly passed and **no existing check covered this**) → owner's
**Q24**. **No cause was named for either, by anyone**, and "passed then, fails now"
was never converted into "REQ-002 broke it".

**Two checks that did not run, both legitimately:** **S11 (`npm run build`)** — a
`next` process this session did not own (PID 8508) held port 3000 and `front/.next`;
QA routed around it as the standing rule requires, and **TEST-003 owned S11**.
**H5** — unrunnable as written, permanently, no captured baseline exists anywhere QA
may read; **Porter does not count it against AC3**, and Fern's `git archive HEAD` A/B
(TASK-011 §3) is the nearest artefact but is **not** a QA baseline — pointed at, not
promoted. Owner told in one line (**Q25**).

> **SUPERSEDED the same day — the owner answered.** Q23 = `แก้ก่อนส่ง` and
> Q24 = `ใส่สัญญาณเลื่อน`; the "do not spend until he answers" hold was **lifted**
> and both became committed work. See §Owner's answers — 2026-09-05.

## Owner's answers — 2026-09-05 (AC2, Q23, Q24, AC5, AC7)

Five items answered by the owner in one Thai message, relayed by the dispatcher
and recorded here **verbatim before anything was interpreted**:

> `AC2=ผ่าน เท่ขึ้นมาก, Q23=แก้ก่อนส่ง, Q24=ใส่สัญญาณเลื่อน, AC5=รับได้, AC7=เอาออก`

| Item | Verbatim | What it settles | Where it now lives |
|---|---|---|---|
| **AC2** | `ผ่าน เท่ขึ้นมาก` | The look passes his eye; it is much cooler. **AC2 TICKED**, and AC1 ticks with it (Porter's consequential tick, declared) | §Acceptance Criteria AC2, AC1 |
| **Q23** | `แก้ก่อนส่ง` | **DEF-2 is FIXED before DELIVERED** — option (a). Not accepted the way the 1280×600 fold was | §Questions Q23 · `inbox/SA.md` |
| **Q24** | `ใส่สัญญาณเลื่อน` | **DEF-3 gets a visible scroll affordance now** — option (a). Not "rethink the phone layout later", not "accept as-is" | §Questions Q24 · `inbox/SA.md` |
| **AC5** | `รับได้` | The 14-label letter-case exception is **accepted**. **AC5 TICKED** | §Acceptance Criteria AC5 |
| **AC7** | `เอาออก` | **Q19 CLOSED: the five non-Home routes lose the light/dark toggle too**, same word he used for Home at REQ-001 Q13. AC7 is **not** ticked by this — it needs a rendered check | §Questions Q19 · §Acceptance Criteria AC7 |

**What Porter did NOT read into these five words** (consolidated 2026-09-05; the
full paragraphs are verbatim in the archive copy, and each guardrail is repeated
where it binds): **Q23 says "fix", not what broke it** — no cause for DEF-2 is
named by anyone and none is invented (§Questions Q23). **Q24 says "add a scroll
signal", it does not redesign the table** — SPEC-002 §Flow item 2 keeps
`/services` a `<table>` on purpose and the form of the affordance was Sober's
inside that constraint (§Questions Q24). **`AC7=เอาออก` is an answer about the
toggle, not a licence to delete code** — whether the dead `ColorSchemeToggle` and
its barrel re-export get removed, and whether that is worth a TASK at all, was
Sober's call (it became TASK-015). **Nothing here answers Q18 or Q25** — both
stay open with the owner, and both survive DELIVERED.

**Routed to Sober 2026-09-05** (`inbox/SA.md`): the hold on DEF-2 and DEF-3 was
**lifted** — both are the owner's committed decisions, not Porter's assumptions —
plus Q19's answer for the five-route shell. Not a REWORK and not a task order:
Sober placed the work (TASK-013/014/015). **The 5-of-8 tick count this section
originally ended on is superseded by §Delivery (8/8) and is not repeated here.**

## TEST-005 request — the closing QA round — Porter (PM), 2026-09-05 — **ANSWERED**

**Consolidated 2026-09-05 (same housekeeping hop as §Questions).** The round has
been run and returned `TEST_PASSED` 5/5, 0 new defects, so the request is folded
to its five asks and what each settled. Full brief verbatim in the archive copy;
the run itself is `tests/TEST-005-req002-closing-round.md`.

**Why it existed.** The owner's three fixes (TASK-013 DEF-2 / TASK-014 DEF-3 /
TASK-015 AC7-Q19) were built and reviewed `DONE`, and **none of them ticks an
acceptance criterion by itself** — AC3 ticks only on a QA re-run, AC7 only on a
QA look at the five non-Home routes. Requested of Tanya: local only, **her file,
her method, her verdict** — Porter requests checks, never how they are run and
never what they must return.

| # | Check | Settled |
|---|-------|---------|
| 1 | `REGRESSION` **H8** at 360×740 — hero name, role, lead, **both** CTAs, quote above the fold | **AC3 ticked**; DEF-2 closed |
| 2 | `REGRESSION` **S14** on `/services` at 360 — is the visitor *told* the table scrolls | **DEF-3 closed** |
| 3 | **No colour-scheme control on the five non-Home routes** (H1 had only ever run on Home) | **AC7 ticked**; now REGRESSION **S15** |
| 4 | A **desktop eye on `/services` at 1280** — measured but never seen | Sober's TASK-014 carry (a) **settled** |
| 5 | **Arrow-key scrolling** of that scroller — not an AC, a carry I did not want to lose | carry (b) **settled**; scroller is the 4th Tab stop, now **S16** |

**Two boundaries this round deliberately did not cross, and they still bind:**
**H5** stays `NOT_TESTED`, uncounted against AC3, and its fate is the owner's
**Q25**; **S11 / `npm run build`** was TEST-003's and stayed there; **SQ13** goes
to the owner only after he has seen the DEF-3 fix; **SQ7's modal-look gate is
Sober's** and no QA round has touched it. Whether more of REGRESSION had to be
re-run to trust the five was **Tanya's call, not Porter's**.

## Delivery — Porter (PM), 2026-09-05

**REQ-002 is `DELIVERED`. 8 of 8 acceptance criteria are ticked, and not one of
them was ticked on silence.** Ten TASKs (006–015) are `DONE` and reviewed by
Sober; three QA rounds ran; the one that failed (TEST-004) produced two defects
which were repaired and then **re-tested**, not argued away.

### How the eight closed

| AC | Closed by | On what |
|----|-----------|---------|
| AC1 | Porter 2026-09-05, consequentially, **declared** | The owner's AC2 answer on top of TEST-004's rendered eyes. He never said the words "all six routes read as one site" — he overrules this in one line |
| AC2 | **The owner**, verbatim `AC2=ผ่าน เท่ขึ้นมาก` | His eye. Nobody substitutes for it |
| AC3 | **TEST-005 check 1** | H8 re-run at 360×740 passes, 49px spare. DEF-2 closed |
| AC4 | TASK-011 §3 | Rendered `<blockquote>` count + 8 exact R5 matches |
| AC5 | **The owner**, verbatim `AC5=รับได้` | He accepted the declared 14-label letter-case exception. R4 is his rule |
| AC6 | **TEST-004** | R9 sweep, 0 hits in 96 text + 96 source checks, six routes, both viewports |
| AC7 | **TEST-005 check 3** | 0 colour-scheme controls on the five non-Home routes, both viewports + drawer |
| AC8 | **TEST-003** | `npm run build` exit 0, zero error and zero warning lines; 12/12 built-output loads clean |

### What `DELIVERED` does and does not mean

- It means **Porter's acceptance pass is complete** and the work is ready for the
  owner's final business sign-off. It is **not** that sign-off, and it is **not**
  a deploy — the live droplet stays the human's hands alone.
- It does **not** close the carries below. Same rule as REQ-001: a carried item
  survives DELIVERED and is only closed by the role that owns it.

### Carried past DELIVERED — open, and NOT closed by this status

| Carry | Whose | One line |
|-------|-------|----------|
| **SQ7 — the modal / drawer *look*** | **Sober (SA)** | Both legs answered (TEST-002 cannot-reproduce on dev, TEST-003 opens+closes on the build) but the **look** was never ticked. The gate is Sober's and is still deferred |
| **SQ7 — the scope half** | **The owner** | Asked in Thai 2026-09-03 — ship with the modal look UNVERIFIED, or hold? **He never answered, and I set `DELIVERED` anyway.** Said plainly rather than absorbed: `DELIVERED` is my acceptance, not a deploy — **his sign-off is the moment he answers it**, and if the answer is "hold", nothing has shipped |
| **REGRESSION H5** | **The owner (Q25)** | Unrunnable as written, no baseline exists; stays `NOT_TESTED`. Not counted against AC3. Only he decides whether the gap is closed at all (QQ8) |
| **Q18** | The owner | AI/robotic/IoT = visual only, or also positioning in words. Non-blocking, never answered |
| **SQ8 opening-block heights + FQ29** | The owner | The 7 QA eyes are all answered; the heights themselves are still his |
| **SQ9, SQ11, SQ12, SQ13** | Porter → the owner | Non-blocking SA notices. SQ11's named cause is **falsified**, no replacement named, no follow-up task. SQ12 is settled on fact; what remains is his WCAG 2.4.7 judgement. SQ13 (+ OBS-5) goes to him now that he can see the DEF-3 fix |
| **SQ1–SQ6** | Porter → the owner | Six SA notices, none blocking, unchanged |
| **Q26 (new)** | **The owner — DATA REQUEST** | Which surface his droplet actually serves: `next start` or `node .next/standalone/server.js`. QA agreed on both, so nothing is blocked; it decides only what future rounds mirror |
| **OBS-7 / OBS-8** | Recorded only | Build-only CSS-preload *warning* (S6 counts errors); cold image cache needs >3 s for the two largest testimonials. No cause named for either |
| **REQ-001 carries B/C/D/F/G/H** | The owner | Untouched by REQ-002 |

### QQ10 — answered here as well as in the TEST file

**(a) Which surface future QA rounds use is Tanya's method call, not mine** — I
ask for outcomes, never method. The one business constraint I add: any round
whose verdict I quote to the owner as "the build is fine" must **name the
surface it ran on**, as TEST-003 did. **(b) The warning is worth telling him** —
it is one line in his delivery message, and it is asked as **Q26**. Neither part
blocks AC8, because both surfaces were run and agreed.

## Constraints

- **Brownfield, live site.** Work lands on `develop` as edited files. The human
  alone merges, releases and deploys. No role runs git writes, `pm2`, ssh, or the
  release/merge scripts. Production `portfolio.develyst.online` is his hands only.
- **Stack.** REQ-001's constraint carries: a UI-library change is allowed but
  versions must match and the build must not error (REQ-001 Q5/Q9 — the team
  decides, the owner does not want to be asked again).
- **Standing rule.** No role inspects, reports on or asks about the owner's own
  commits on this repo.
- **No backend.** There is none on this project; if any route's step-up appears
  to need a server, that is a scope question for Porter.
- No deadline was given. Porter did not invent one.

## Out of Scope

- **N5 — the content refresh** (his out-of-date portfolio/profile material, and
  the two projects he handed over on 2026-09-02). Held pending Q20/Q21; see
  REQ-001 §New asks. This REQ changes look and layout, never words.
- A dedicated quotes page — still permitted by REQ-001 R5 as a follow-up, not
  required or decided here.
- Deployment, git operations, and the repo-hygiene items listed in REQ-001
  §Out of Scope.
- The survey's known gaps (missing `/blog/[slug]`, posts authored as "Develyst
  Team") — unchanged, still out.

## Questions

(SA Lead asks here; Porter answers as `> answer: ...`. Every `Q…` item is for the
**owner** — Porter asked it in Thai in chat, on the date each item names.)

**Consolidated 2026-09-05 (PM housekeeping — the gate read 49.3KB > 45KB).** CLOSED
threads are folded to: the question, the owner's words verbatim, what the answer
decided, what it did **not** decide, and where the working lives. Pre-consolidation
file, verbatim and `cmp`-verified before any edit:
`archive/REQ-002-whole-site-step-up-five-routes-2026-09-05-preconsolidation.md`.
**Nothing that exists only here was cut** — every shortened passage was re-read alive
in the file it now points at. **Untouched:** R-numbering, AC1–AC8 and their trails,
§Delivery's carry list.

- **Q18 — OPEN, owner.** Is `AI + robotic + IOT` a **visual** direction only, or
  does he also want the site to *say* he works in AI / robotics / IoT? The second
  reading changes his positioning in words, and R4 forbids any role writing a claim
  about him that he did not make. Nobody assumes; this REQ proceeded as visual-only.
  **Not blocking spec work** — it blocks any copy consequence, which this REQ has
  none of. **Survives DELIVERED.**
- **Q19 — CLOSED 2026-09-05 by the owner.** Asked: do the other five routes lose
  the light/dark toggle too, the way Home did (REQ-001 Q13, `เอาออก`), or keep it?

  > answer (owner, verbatim, in chat): **`AC7=เอาออก`**

  **They lose it — the same word he used for Home.** Two REQ-level consequences
  recorded nowhere else: (1) the light scheme SPEC-002 **SQ1** warned would be new
  REQ-level work is **not** needed and **no such REQ is opened**; (2) **AC7 was NOT
  ticked by this answer** — absence had to be *seen* on the five non-Home routes,
  which TEST-005 check 3 later did (§Acceptance Criteria AC7).
- **SQ7 — Sober's spec question; the owner answered HALF of it, 2026-09-03.**
  Recorded here because `specs/` is Sober's file and Porter never writes in it.
  SQ7 (`specs/SPEC-002-…md` §Questions): no `Modal` and no `Drawer` ever opens on
  `develop` — no Portfolio detail view, no lightbox, no mobile nav — found by Fern
  building TASK-006, pre-existing and outside REQ-002.

  > answer (owner, verbatim, in chat): **`SQ7=ให้ Tanya reproduce ก่อน`**

  - **ANSWERED — the independent QA reproduction, first.** **TEST-002**, verdict
    **`CANNOT_REPRODUCE` 2026-09-03**: all three triggers open, paint and close.
    Porter **accepted it as written** and did **not** remap it onto PROTOCOL's four
    statuses; the vocabulary gap is Tanya's fair point, noted, not resolved by him.
    He granted the build round (**QQ1** → TEST-003, later 13/13). Working, incl.
    QQ1–QQ3 in full: `tests/TEST-002-…md` §Questions, `tests/TEST-003-…md`.
  - **NOT ANSWERED — the scope half, still the owner's (QQ3).** "Reproduce first"
    orders the two asks; it does not decide scope. **No role infers it.** The shape
    changed — with the overlays opening there may be nothing left to fix — but the
    **modal *look* is still UNVERIFIED**, and that is **Sober's gate, untouched by
    TEST-002 or TEST-003**. Whether the verdict lifts it is **Sober's call**.
  - **Not to be rounded off:** what changed between Fern's 2026-09-02 report and
    Tanya's 2026-09-03 run is checkout state, which the standing rule puts off-limits
    to every role — so **nobody knows whether the defect is gone or was never in this
    tree, and nobody guesses**; this is not "Fern was wrong". **No role works around
    it from a route file** (Sober's standing line). REQ-002 went `DELIVERED` with the
    modal look unverified — §Delivery.
- **DEF-1 (found during TEST-002, 2026-09-03) — every `/about` lightbox thumbnail
  renders 0×0, MAJOR, NOT SQ7. CLOSED.** All 9 `ImageLightbox` frames (4
  certificates + 5 conversations) measured 0×0 px — a visitor saw **no image at
  all** in either grid, while the images displayed correctly *inside* the opened
  modal. Repro + screenshots: `tests/TEST-002-…md` §Defects.
  - **Porter's routing (QQ2): (b) — a NEW finding, relayed to Sober**, who placed
    it. Porter placed nothing and proposed no fix. Whether DEF-1 pre-dated REQ-002
    was **Sober's to determine, nobody's to assume** — his determination and its
    stated limits: `tasks/TASK-012-…md` §Diagnosis + §Review.
  - **The owner's half — ANSWERED 2026-09-04 (SQ10).** Asked in Thai: does the
    repair ship inside REQ-002 or need its own defect REQ?

    > answer (owner, verbatim, in chat): **`SQ10=รวมใน REQ-002`**

    **TASK-012 ships inside REQ-002; no separate defect REQ is written**, and
    REQ-002 could not be DELIVERED until TASK-012 was DONE. The fix, its DoD and
    its ordering stayed Sober's — Porter wrote no word of that task file. **CLOSED
    on evidence** (TEST-004: 9/9 images painted at 1280 and 360, S13 FAIL→PASS;
    held on the build by TEST-003).
- **Q14's unanswered half — Porter's applied scope, overrulable.** He never said
  whether the bolder look comes before, after or together with the five-route
  rebuild. Porter merged them into this one REQ rather than shipping the five
  routes twice. Recorded in REQ-001 §New asks; if he wants them split, this REQ
  splits and nothing here is wasted.
- **Q23 — CLOSED 2026-09-05. DEF-2, Home hero at 360×740.** On a phone the second
  button "Get in touch" was cut by the fold and the quote under it was off-screen —
  failing `REGRESSION` **H8**, a bar he set himself at REQ-001 that passed on
  2026-09-02. Two ways out, neither chosen by any role: (a) fix before DELIVERED,
  (b) accept it the way the 1280×600 fold was accepted as "Known and accepted" C.

  > answer (owner, verbatim, in chat): **`Q23=แก้ก่อนส่ง`**

  **Option (a).** He did not accept it the way he accepted the 1280×600 fold.
  **AC3 then ticked on QA's H8 re-run, not on the fix** (§Acceptance Criteria AC3).
  **No cause was ever named** — by QA, Porter or him; nobody tested a pre-step-up
  tree, so "REQ-002 broke it" stays unsupported. Detail + screenshot:
  `tests/TEST-004-…md` (H8, §Defects), `tasks/TASK-013-…md`.
- **Q24 — CLOSED 2026-09-05. DEF-3, `/services` table at 360.** Only the first of
  three columns was on screen; the other two sat behind a sideways scroller with no
  scrollbar, no fade and no hint, so the section read as empty rather than
  scrollable. On the record and *not* an oversight: SPEC-002 §Flow item 2 keeps this
  a `<table>` on purpose — cards would delete the three visible headings (R4) and
  break `role="region"`. Offered: (a) affordance now, (b) rethink the phone layout
  later, (c) accept as-is.

  > answer (owner, verbatim, in chat): **`Q24=ใส่สัญญาณเลื่อน`**

  **Option (a)** — not (b), not (c) — so DEF-3 became committed work inside REQ-002.
  **What the signal is was not decided by this answer and not by Porter**: the
  `<table>` and its three headings stay, and the form was Sober's inside that
  constraint. **Whether DEF-3 pre-dates REQ-002 is still unknown and stays written
  down as unknown.** The phone layout underneath is the part he did *not* buy here —
  SPEC-002 **SQ13**, still open and his. Detail: `tests/TEST-004-…md` §Defects,
  `tasks/TASK-014-…md`.
- **Q25 — OPEN, owner. FYI-with-a-decision (asked in Thai 2026-09-05).** One
  REQ-001 check, `REGRESSION` **H5** ("no client-facing string on Home changed
  versus the pre-REQ baseline"), can never be run: no baseline was ever captured and
  stored, so QA has nothing to diff against. Porter does **not** count it against
  AC3. Either it is rewritten into something runnable (Tanya's file, Tanya's call —
  asked, not instructed) or it stays permanently `NOT_TESTED`. Only the owner may
  say whether he wants that gap closed at all; Porter refused to close it by
  capturing a baseline, because that would make this decision for him.
  **Survives DELIVERED.**
- **Q26 — OPEN, owner. DATA REQUEST, non-blocking (asked in Thai 2026-09-05).**
  `front/next.config.ts` sets `output: 'standalone'`, and Next itself prints that
  `next start` **"does not work"** with that setting. QA ran the production build on
  **both** surfaces — `npm run start` and `node .next/standalone/server.js` — and
  **they agreed on every check**, so **AC8 is ticked either way and nothing is
  blocked**. What no role may go and look at is which surface his droplet (`pm2`
  process `portfolio-frontend`) actually serves. His one-line answer decides only
  what future QA rounds mirror; it changes no code and no AC. Source:
  `tests/TEST-003-sq7-build-round.md` §Questions QQ10. **Survives DELIVERED.**
