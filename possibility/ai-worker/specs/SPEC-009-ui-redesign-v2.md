# SPEC-009: UI redesign v2 — design first, no photographs
- Source: REQ-008 (R1–R7, AC-1..8); SYSTEM-FACTS §Visual direction v2 (supersedes §Visual design), §Purpose; SPEC-008 (what stays), FRONTEND-STANDARD §1
- Status: ACTIVE
- Author: Sober (SA), 2026-09-23

## Overview
The owner rejected the photographic look and set the order himself: **design first, images only on
request afterwards.** So this SPEC removes every photograph and replaces the job each one did with
something drawn in code. Nothing else changes: same routes, same behaviour, same wording, same
dark / warm-gold / serif language, same dictionaries.

**What each removed photo was doing, and what replaces it** — this is the whole design problem:

| Was | Job it did | Replacement (drawn, no photo) |
|---|---|---|
| hero photo | "this place is about something bigger than a form" | a **light**: one warm radial gradient low behind the headline, on paper; the serif W-1 becomes the hero |
| 5 tier photos | "which stage am I at" | the **stage mark + journey scale** below |
| spark (loading) | "something is happening, calmly" | the same light, breathing, W-4 beneath |
| My-ideas thumbnails | scanning aid | the stage mark at list size |

## The stage system (REQ-008 R3/R4 — the core of this redesign)
Two drawn components, both pure SVG/CSS, both fed by the tier name only (no new API field):

- **`StageMark`** — one mark whose *form* advances with the stage, not merely its colour:
  1. `Ordinary` — a filled circle, muted, no glow (a closed stone).
  2. `Seeker` — the same circle with one gold hairline crack across it.
  3. `Raw Diamond` — the circle with an angular facet cut out, faint gold glow inside.
  4. `Visionary` — half circle / half faceted gem, gold glow at half strength.
  5. `The Possibility` — a full faceted gem, gold, widest glow.
  Sizes 160 px (result, `/me`), 40 px (My-ideas row), 24 px (optional, header badge). Implemented
  once in `components/common/StageMark/`; the tier → geometry map lives there and nowhere else
  (it replaces `tierImage`, which is deleted).
- **`StageScale`** — the five marks in a row at 20 px: the user's stage filled/gold, later stages
  as empty outlines, a hairline connecting them. This is what makes "there is somewhere further to
  go" visible (AC-3) without a word from us. Caption: Porter's, see §Questions Q-1; until it lands
  the scale ships captionless.
- **Colour temperature per stage** (AC-2): the glow's alpha only — 0 / 0.15 / 0.3 / 0.5 / 0.8 of the
  gold. One hue, five intensities; no second colour, no per-tier palette.

## Pages (the order stays exactly as SPEC-008 §Pages; only the visual anchors change)
1. **Landing:** paper + the warm light low-centre behind W-1 (serif, hero scale) → W-2 → Google
   button (`outline`) → REQ-006 divider → email block (lazy). No image element at all. The light is
   a CSS radial-gradient layer; static (motion only in the loading state).
2. **`/ideas/new`:** unchanged from SPEC-008 §2.
3. **Loading:** the light breathing (opacity 0.6→1, scale 0.98→1.02, ~3 s, `prefers-reduced-motion`
   → static) + W-4. No spinner, no image.
4. **Result:** "This is where you are now" → **StageMark 160** → tier name (serif) → W-3 line →
   **StageScale** → three score bars → reason quote → discount line → hire block (TASK-009) →
   collapsed "What you told us". The image block becomes the mark and the scale is added after the
   tier line, so Tanya's DOM-order check moves from nine blocks to **ten**.
5. **My ideas:** rows with StageMark 40 in place of the thumbnail; date, tier, preview. Empty state:
   the light, small, + the REQ-007 empty line.
6. **`/me`:** StageMark 160, name, tier name, W-3 line, StageScale, discount line, link.
7. **Header / 8. Admin / 9. Not-found:** unchanged (no imagery there anyway).

## Non-functional
- **AC-8 (no dead weight):** remove `public/img/` and every reference; prove with a production
  build — no `/img/*` in the output or any page payload. The originals stay in
  `../project-docs/assets/grok-2026-09-22/` (the owner's, untouched).
- Lighthouse mobile on the landing should now **exceed** the 74 baseline (the hero image is gone) —
  record it; if it does not improve, say so rather than tuning blind.
- Contrast unchanged (AC-5): the DEF-1 status tokens from TASK-014 must survive this refactor —
  re-measure one rendered error alert after the change.
- `hallmark audit` on landing + result; a drawn mark must not read as clip-art: no drop shadows, no
  gradient other than the one light, no emoji.

## Tasks
- TASK-015: FE — remove all photographs, build `StageMark` + `StageScale` + the light, apply to
  landing / loading / result / My ideas / `/me`, drop the image assets from the bundle, `--radius`
  token, W-2-on-409 tweak (TASK-009 Q-2) — owner: FE

## Questions
- **Q-1 @Porter (copy, not blocking):** the StageScale caption — a short line telling the user where
  they are in the journey ("ขั้นที่ 3 จาก 5" / "Stage 3 of 5", or something warmer in the product's
  voice). Until Porter answers, the scale ships without a caption; the marks alone carry it.
- **Q-2 @Porter (process, FYI):** REQ-008 R6 — no image request goes up from this SPEC; the design is
  complete without photographs by construction. If Fern finds a spot that genuinely needs one after
  building, it comes to me as a TASK question and I route it to you.
