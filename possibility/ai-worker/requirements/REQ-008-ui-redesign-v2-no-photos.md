# REQ-008: UI redesign v2 — design first, no photographs
- Status: READY_FOR_SA
- Priority: HIGH (the owner rejected the REQ-007 result; this replaces its look)
- Requested: 2026-09-23 by the owner
- Deadline: none
- Source: chat 2026-09-23; SYSTEM-FACTS.md §Visual direction v2, §Purpose

## Problem / Goal
The owner looked at the delivered redesign and said *"ไม่สวยเลย — redesign UI มาใหม่เลยดีกว่า"*.
His diagnosis: the photographic hero/tier renders were dropped into the layout and do not
work together with it. **The design must be built first, on its own, and any image must be
requested afterwards to fit that design** (his sequence: FE → Sober → Porter → prompt →
owner generates → back down).

The product's purpose is unchanged and still governs every screen: **make everyone dare to
dream — the visitor is the possibility, seen and encouraged, never graded**
(SYSTEM-FACTS §Purpose).

## Requirement
1. **Remove every photographic image** from the product UI: hero, the five tier photos,
   the spark, thumbnails in My ideas, `/me`. Nothing in `public/img` is referenced by a page.
   (The files stay in the repo/assets folder; they are simply unused. REQ-007 R2 is void.)
2. The design is carried by **layout, type, space, colour and motion only** — no
   photography, no stock illustration. Simple geometric/abstract marks drawn in code
   (SVG/CSS: a line, a gradient, a light, a shape) are allowed and preferred where a tier
   or a state needs a visual anchor.
3. **A tier must still be instantly distinguishable** without a photo — through its name,
   its W-3 line, and a per-tier visual treatment the FE designs (e.g. colour temperature,
   a drawn mark, a progression indicator showing which of the five stages the user is at).
4. **The five stages must read as a journey**: the user can see where they are and that
   there is somewhere further to go.
5. Keep: dark theme, one warm-gold accent, serif headlines, TH/EN typography, all wording
   from REQ-002/003/004/006/007 (W-1..W-9 and the W-3 tier lines).
6. **Image requests, when the design genuinely needs one:** the FE states what the image
   must do and where it sits → Sober → Porter. Porter writes the prompt, the owner
   generates it, and it comes back the same way. **No image is added without that round
   trip**, and no work waits on it — the design must be complete and shippable without any
   photograph.
7. Every existing behaviour (REQ-001..006 ACs) is unchanged; this is look and layout only.

## Acceptance Criteria
- [ ] AC-1 — **Given** any page of the product (landing, idea box, loading, result, My ideas, /me, not-found) **When** it renders on desktop and at 375 px **Then** no photographic image is shown anywhere, and no broken image or empty gap is left where one used to be.
- [ ] AC-2 — **Given** the five tiers **When** their result pages and `/me` are compared **Then** each tier is visually distinct without any photo, and the tier name + W-3 line are the most prominent elements after the page heading.
- [ ] AC-3 — **Given** a result page **When** the user looks at it **Then** they can see which of the five stages they are at and that further stages exist (R4), in both languages.
- [ ] AC-4 — **Given** an analysis in progress **When** the loading state shows **Then** there is a calm, non-photographic waiting state with W-4 — no spinner-only, no blank screen.
- [ ] AC-5 — contrast: all body text passes 4.5:1; error/warning alerts stay readable (REQ-006 DEF-1 regression).
- [ ] AC-6 — **Given** a language switch on any page **Then** the layout does not shift and no Thai text remains in EN or vice versa (REQ-005 regression).
- [ ] AC-7 — regression: REQ-001/002/003/006 smoke lines in `tests/REGRESSION.md` still pass.
- [ ] AC-8 — **Given** the repo after this change **When** the FE bundle is inspected **Then** the removed photographs are not shipped to the browser (no dead weight).

## User-facing wording (Porter as UX writer)
- Unchanged from REQ-002/003/004/006/007. If the new design needs a label that does not
  exist yet (e.g. for the stage indicator in R4), the FE asks via Sober and Porter writes
  it — engineers do not invent user-visible words.

## Constraints
- Ant Design + its tokens (owner's stack). No second styling system.
- Tier names are the owner's exact words.
- The owner reviews the result himself before it is called done; his reaction is the real
  acceptance, alongside Tanya's ACs.

## Out of Scope
- Changing any behaviour, wording, scoring, tiers or discounts.
- Adding photographs (see R6 — a separate, later round trip).

## Questions
- Porter 2026-09-23 answering Sober's Q-1 — **stage-scale caption (W-10):** "ตอนนี้คุณอยู่ขั้นที่ {n} จาก 5 — ยังมีต่อ" / "You're at stage {n} of 5 — there's further to go." For `The Possibility` (n = 5) instead: "คุณมาถึงขั้นสุดท้ายแล้ว" / "You've reached the last stage." Short form beside the marks if space is tight: "ขั้นที่ {n} จาก 5" / "Stage {n} of 5".
