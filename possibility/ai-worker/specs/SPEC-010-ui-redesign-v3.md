# SPEC-010: UI redesign v3 — choose a direction first, then build it
- Source: REQ-009 (R1–R7, AC-1..8); SYSTEM-FACTS §Visual direction v3, §Purpose; supersedes SPEC-008 and SPEC-009 as the live visual spec
- Status: ACTIVE — Q-1..Q-3 settled 2026-09-26 (see §Amendment): references given, animation expected, method is Sober's call and stays three-directions-first.
- Author: Sober (SA), 2026-09-25

## Why this attempt is shaped differently
Two redesigns were rejected, and both failed the same way, not for the same reason:
REQ-007 put photographs into a layout; REQ-008 took every photograph out. Opposite
decisions, identical outcome — *"ไม่สวยเลย"*, then *"ยังห่วยเหมือนเดิม"*.

That is not a coincidence about photos. It is the shape of the loop: **we build an entire
site, deploy it, and the only feedback the owner can give is one bit — yes or ugly.** Each
round costs days and teaches us almost nothing, because "ugly" does not say *which* thing is
ugly. A third full build gambles the same way and has no better odds.

So this SPEC changes two things before it changes a single pixel:
1. **Ask what he already finds beautiful.** Nobody has ever asked. One reference — a site, an
   app, a poster he likes — tells us more than three specs of ours (Q-1).
2. **Let him choose a direction from something he can see, before the site is built.** One
   screen, three genuinely different treatments, on SIT at a hidden route. He points at one;
   *then* we build that one everywhere (§Approach).

Everything in REQ-009 still holds — every page redone, images requested during the design,
wording and behaviour untouched. This just puts a cheap decision in front of the expensive work.

## Approach — step 1 is one screen, not the site
**Step 1 (TASK-020, days not weeks): the result page in three directions.**
The result page is the right screen to decide on: it is the moment the product exists for
(the visitor learns what they are), it contains every element type the rest of the site uses
(heading, tier name, a body line, numbers, a quote, a call to action, an image slot), and it
is the screen the owner looks at when he judges "beautiful".

Built as a **hidden preview route** (`/preview/directions`, not linked from anywhere, not in
the nav, no behaviour attached — static sample data, both languages, desktop + 375). One
deploy, one URL, the owner scrolls three versions of the same real content and says which one
(or which parts of which). Placeholders stand in for images with the IMG requests already
written — so the moment he picks, the image batch is ready to go to him.

**The three directions must be genuinely different bets, not three skins of the same idea.**
Fern owns the craft; the SPEC fixes only what each direction must prove:

| # | Direction | Thesis it tests | Must show |
|---|---|---|---|
| **A** | **Quiet luminous** — dark, one warm light, restrained (v2's family, but executed as a designer would: real type scale, real spacing, one moment of drama) | "the last one failed on execution, not on the idea" | that dark can feel expensive rather than empty |
| **B** | **Warm editorial** — light warm paper, ink type, generous margins, the tier line set like a pull-quote, a single image as a plate | "the product is a letter to the person, and letters are on paper" | that we are not afraid of light, and that type alone can carry beauty |
| **C** | **Cinematic** — a full-bleed image as the page, text living on top of it, the tier as a title card | "the feeling comes from the picture, and the layout gets out of its way" | how far the owner's own generated images can carry the design |

Each direction uses the **same real strings** (REQ-007 W-1..W-3, W-10, REQ-003 axis labels) and
the same five tiers, so he is comparing design, not content.

**Step 2 (after he picks): TASK-021** — apply the chosen direction to every page in REQ-009 R1,
with the image batch already in flight.

## Rules that hold in every direction (these are not negotiable by taste)
- **Wording, behaviour, routes, data: unchanged** (REQ-009 R7). No new user-visible string
  without Porter.
- **Tier names** are the owner's exact strings, never translated; the five stages must stay
  distinguishable and show that there is further to go (REQ-009 AC-4 — the StageMark/StageScale
  from TASK-015 may be reused, re-drawn or replaced, but the *job* survives).
- **Contrast ≥ 4.5:1 for all body text, including text over images** (AC-5). A dark scrim or a
  calm zone in the image is part of the image's job, not an afterthought — say so in the IMG
  request.
- **Ant Design + its tokens only.** One styling system, one token file mirrored in `theme.ts`.
- **Image weight (AC-8, the limit REQ-009 asks me to set):** **≤ 200 KB per image**, and
  **≤ 500 KB of images per page** at the size actually served; phone variants sized for phone.
  Anything heavier comes back as a re-crop, not a shipped page.
- **Every slot has a designed fallback** (REQ-009 R4): with no image the page must still look
  finished, not broken.
- `hallmark audit` on the chosen direction before REVIEW; DEF-1's error-alert contrast
  re-measured on the render after any theme change.

## Image requests — my gate before they reach Porter
Fern writes each IMG request in REQ-009's format; **I check it is complete and answerable
before it goes up**, because a vague request wastes the owner's generation and his patience.
A request is rejected back to Fern if any of these is true:
- the **Job** line describes a picture instead of an effect ("a diamond" — no; "the moment the
  visitor realises the thing in their hands is worth something" — yes);
- **Overlay** does not say what sits on top and where, so nobody knows which area must stay calm;
- **Size & aspect** is missing either the desktop or the 375 px number;
- **Palette** does not carry the actual hexes of the surroundings;
- there is **no screenshot with the placeholder in place** (REQ-009 R5);
- it is tier-specific but does not list all five variants.
Batches, not trickles: the first batch goes up as soon as the three directions exist, so the
owner generates against a real layout (REQ-009 R5).

## Tasks
- TASK-020: FE — the result page in three directions at `/preview/directions` + the first IMG request batch — owner: FE (depends on: Q-1..Q-3 answered)
- TASK-021: FE — apply the chosen direction to every page in REQ-009 R1 — owner: FE (depends on: the owner's choice)

## Questions
- **Q-1 @Porter → owner (the highest-value question on this desk, and it has never been asked): name one or two things you find beautiful** — a website, an app, a poster, a game menu, anything, even unrelated to this product. A link or a screenshot. Two failed redesigns say we are guessing at his taste; one reference ends the guessing. *Sober's view: without this, direction three is another coin flip.*
- **Q-2 @Porter → owner (approach): is it acceptable that he sees ONE screen in three treatments first (a hidden preview URL on SIT), picks one, and only then we rebuild the site in it?** It is far less work than a third full redesign and he decides earlier. If he would rather see a whole finished site again, say so and I spec it that way — but then we should expect the same one-bit answer.
- **Q-3 @Porter → owner (palette, REQ-009 R7): dark/warm-gold is no longer mandatory — direction B is deliberately light.** Any colour he does *not* want to see is worth knowing now; otherwise Fern chooses per direction.
  > answer (Porter 2026-09-26) Q-1: the owner's references — **https://taskforge-saas.webflow.io/ · https://flowlink-um.webflow.io/ · https://corexa-template.webflow.io/** (SYSTEM-FACTS §Visual references). Porter could not load them from his session to annotate; please have the FE study all three and name in the SPEC what they share (palette, type, spacing, sectioning, imagery, motion) — that list is what the three directions must be built from. Q-2 and Q-3 being asked next, one at a time.
  > answer (Porter 2026-09-26) — owner clarified the references: *a quality bar, not a template* — "don't copy 100%, but make it as valuable and interesting as these: colour, animation, images that fit" (SYSTEM-FACTS). **Animation is now an explicit expectation** (the v1/v2 builds were nearly static — REQ-007 put animation out of scope; that is lifted). Q-2: he did not choose; I leave the method to you — do the 3-direction preview if you judge it faster to his "yes", but it must not become another round of questions to him; I will show him whatever you tell me is ready. Q-3: no colour ruled out.

## Amendment 2026-09-26 — the owner's answers: references, animation, and my method decision
**Q-1 answered:** three reference sites — `taskforge-saas.webflow.io`, `flowlink-um.webflow.io`, `corexa-template.webflow.io` — and he clarified they are a **quality bar, not a template**: match their value and interest in **colour, animation and image fit**; do not copy. **Q-2/Q-3: he declined to choose — the method is mine, no colour is ruled out, and there are no more question rounds on the look. The next thing he sees is a screen plus the first IMG batch.**

**My method decision (stated so it is not re-litigated): we still show one screen in three directions first.** It satisfies what he asked for — the next thing he sees *is* a screen, with the IMG batch beside it — and it is the only way a "still ugly" answer tells us something, because he will be pointing at one of three rather than at everything. One deploy, days of work, and the losing two directions cost nothing further.

**Reference study — a deliverable, not an assumption (TASK-020 item 0).** Porter could not load the three sites from his session; **neither could I** — the browser pane in my session stalled on all three (recorded so nobody later reads my silence as agreement with a guess). So the study is Fern's, with a named output: for each site, the **palette with hexes**, the **type** (families, the h1/body size ratio, weights, letter-spacing), **section rhythm** (how many sections, their vertical padding, how they alternate), **imagery** (what kind, how it is cropped, how it meets the background), and **motion** (what animates, on what trigger, how long, what easing). Then one short paragraph: *what the three share* — that shared core is our bar. No copying: we take the level, not the layout.

**Animation is now a first-class requirement** (REQ-007's "no motion beyond the loading breathe" is lifted). Each direction must animate these moments, and nothing else, so motion stays intentional:
1. **Page entrance** — one orchestrated reveal, not every element flying in.
2. **Scroll reveal** — content arriving as the visitor scrolls the result page, once per element, never re-triggering.
3. **The result reveal** — the one moment that deserves drama: the stage mark / tier name / scores arriving in sequence after the analysis. This is the emotional payoff of the whole product; it is currently a static page appearing.
4. **The five-stage scale** filling to the user's stage.
5. **Hover / focus** on the interactive elements (button, cards, language switch) — and `:focus-visible` still instant, never transitioned.
6. The loading breathe (already built).
Rules: durations 150–400 ms for UI, up to ~900 ms for the result sequence; ease-out for entrances; **`prefers-reduced-motion: reduce` turns every one of these into an instant state change** (not a shorter animation); no parallax on text; nothing animates more than once unless the user acts.

**Colour is open** (Q-3): each direction states its palette with hexes in the TASK, and the contrast floor (4.5:1 body text, including over images) is unchanged.

## Amendment 2026-09-26 (evening) — the owner chose B; the live look is warm editorial
- **Direction B (warm editorial) is the product's look** (owner, 2026-09-26, after the `/preview/directions` deploy). A and C are closed; IMG-001 and IMG-003 were never generated.
- **Live tokens become B's** (paper `#f6f1e6` · surface `#fdfaf2` · ink `#252016` · muted `#6f6653` · line `#c4b696` · accent `#a0651f` · accent-ink `#fdf8ec`). This is the first light theme the product has had, so every rule tuned for dark paper is now suspect — in particular **antd's status surfaces (the DEF-1 family) must be re-measured on cream, not assumed to carry over**.
- **Why B was the right pick, recorded so the next redesign does not re-litigate it:** it is the only direction whose *structure* enacts the purpose line the owner wrote himself — the site speaks TO the person — and the reference study showed that darkness was never his bar (two of his three references are dark, one is light; the shared trait is discipline: one accent on a quiet field, ~3:1 display/body with tight tracking, alternating rhythm, drawn imagery, constant short motion).
- **Image handling rule, general from now on:** a delivered image is judged **in its slot, on the page**, never in isolation; fitting it (mask, blend, plate edge, inset) is the FE's craft, but stretching it or shrinking it until it stops doing its job is not fitting. If it cannot look native, it is **bounced with the specific reason plus a screenshot of the best attempt**, and Porter re-prompts once — a bad image placed badly costs more than an empty slot, because every slot has a designed fallback (REQ-009 R4).
