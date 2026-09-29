# TASK-020: FE — the result page in three directions + the first IMG request batch
- Source: SPEC-010 §Approach (REQ-009)
- Owner: FE (Fern)
- Status: DONE
- Depends on: Q-1..Q-3

## What to do
Read SPEC-010 in full, then REQ-009. **This is not the site — it is one screen, three ways, so the owner can point at one.** Time-box it: this should be days, not a week.
1. Hidden route `/preview/directions` — not linked anywhere, no auth, no API calls, static sample data. It renders the **result page** three times (A quiet luminous · B warm editorial · C cinematic, SPEC-010 §Approach), each labelled A/B/C only, with a language toggle and the same real strings (REQ-007 W-1..W-3, W-10, REQ-003 axis labels, the discount line). Desktop and 375 px must both be worth looking at.
2. Use **one tier per direction is not enough** — each direction shows at least two tiers (one low, one high) so the owner can see how the five stages differentiate in that treatment (REQ-009 AC-4).
3. Image slots: every direction has at least one, with a neutral placeholder of the exact final size and a designed fallback (REQ-009 R4). Screenshot each page with the placeholder in place — that screenshot is a required field of the IMG request.
4. Write the **first IMG request batch** in REQ-009's format (one per slot, all fields). Send them to me in the TASK's §Questions or a note — I check completeness before they reach Porter. Do not send a trickle; send the batch.
5. Do not touch the live pages, the theme tokens the live site uses, or any behaviour. If a direction needs different tokens, scope them to the preview route.

## Definition of Done
- [ ] `/preview/directions` builds and renders A, B, C — screenshots of each, desktop + 375, TH + EN, under `ai-worker/tests/harness/task-020/`.
- [ ] Each direction shows ≥ 2 tiers — say which, and how a viewer tells them apart in that treatment.
- [ ] Contrast measured on the render for body text in each direction, including any text over a placeholder image (≥ 4.5:1) — paste the ratios.
- [ ] The IMG request batch, complete per REQ-009's format, with the screenshot path filled in for every request.
- [ ] `npm run build` clean; the route table shows `/preview/directions`; **no change to any live page** — paste a one-line summary of files touched.
- [ ] One paragraph from you, as the designer: what each direction is betting on, and which one you would ship. Your opinion is wanted on the record — you have looked at this product longer than anyone.

## Implementation Notes

(Fern, 2026-09-26)

### Item 0 — Reference study (all three loaded for me; methods noted honestly)

**taskforge-saas.webflow.io** (rendered fine; CSS + DOM + screenshots in `ref-taskforge-*.png`):
- Palette: near-black neutrals `#111 #161616 #1f2020 #38393a`, greys `#8d8d8d #c7c7c7`, ONE warm accent family `#e47831 / #f07c30`, signal accents only as tiny data-glows (`#a2f865 #36cdff #ff88be`).
- Type: **Geist** + **Geist Mono** (mono for code chips/labels). h1 40→58 px, h2 38→46, body ~16; letter-spacing tokens on eyebrows.
- Rhythm: many short sections, vertical side-labels ("PROGRESS SECTION // 02"), step-rows with dashed connectors, dark cards, 5–10 px radii, hairline borders.
- Imagery: no photos — code/terminal chips, icon tiles, dot-grid hero texture; everything drawn.
- Motion: **GSAP SplitText headline stagger** (`y:50, opacity:0, stagger 0.1, 0.6 s, power3.out`) on entrance AND on scroll (ScrollTrigger); the hero was caught mid-stagger in `ref-taskforge-hero-stagger.png`. 51 transition rules in CSS.

**flowlink-um.webflow.io** (rendered fine):
- Palette: light — `#f9fafb` paper, neutrals `#0a0d14…#cecfd0`, primary blue `#0566ea`, purple `#d15cfe`, warm `#f9a603`; hero = big blue→purple→orange gradient cooling into white.
- Type: **Plus Jakarta Sans** only; h1 36→64 px, h2 30→52, body 16; weight does the hierarchy.
- Rhythm: floating pill nav turning solid on scroll; 2-up then 3-up soft feature cards (12 px radius) with small colourful CSS-drawn icon motifs; generous white space.
- Imagery: CSS/SVG glyphs only, pastel rings — no photos.
- Motion: GSAP + ScrollTrigger (120 `data-w-id` hooks) — entrances on scroll, once.

**corexa-template.webflow.io** (loaded, but the page **never reaches a static frame** — continuous marquees/loops; my screenshot path could not capture a still — the same wall Sober hit. Facts below are from its CSS + DOM, stated as such):
- Palette: dark neutrals `#141414 #1f1f1f #2c2c2c`, blue `#06f` + `#3385ff`, neon green `#0dffc9`, off-whites `#f3f4f6`.
- Type: **Poppins**; display 50→128 px with tight negative tracking (-1.92 to -5 px); body 16–18; 8 px radius everywhere.
- Motion: continuous loops + scroll bindings — the busiest of the three.
- Note: this URL is a template-store preview page; the transferable facts are palette/type/rhythm, not layout.

**What the three share (the bar):** a locked token system with ONE dominant accent on a quiet neutral field (two dark + one light — darkness is not the bar, discipline is); a display face with a clear h1/body ratio (~3:1) and tight tracking on the biggest lines; generous alternating section rhythm with hairline dividers; imagery that is drawn or CSS-built, never stock; and **constant, confident motion** — staggered headline reveals on entrance, once-per-element scroll reveals, hover micro-states — all short (≤0.6 s) and ease-out. Nothing on these pages is static, and nothing moves twice.

### The three directions (each shows Ordinary + The Possibility via its switch)

**A — Quiet luminous.** Paper `#0d0c0a` · surface `#161411` · ink `#f0ece3` · muted `#a8a196` · line `#2c2820` · accent `#e3b23c` · accent-ink `#171205`. 680 px column, 88 px rhythm, the warm light, mark 160, tier name clamp 40→56 px, thin gold bars, gold-ruled quote. Bets v2 failed on execution (scale, spacing, ONE drama moment), not concept. Tiers differ by mark (glowing full gem vs dark stone) + scale state.

**B — Warm editorial.** Paper `#f6f1e6` · surface `#fdfaf2` · ink `#252016` · muted `#6f6653` · line `#c4b696` · accent `#a0651f` · accent-ink `#fdf8ec`. Serif everywhere, centred tier name clamp 44→64 px, W-3 as a ruled pull-quote, scores as an ink-ruled ledger, rust stage marks, black slab CTA. Bets the product is a letter to the person. (Fixed during evidence: the Ordinary stone vanished on cream — line deepened to `#c4b696`.)

**C — Cinematic.** Over backdrop: ink `#f4f1ea` · muted `#c9c2b4` · accent `#ffd267` · accent-ink `#1c1503` · scrim base `#0b0a08`; backdrop placeholder = cold dusk `#16202e → #0b0a08` with one warm band low. 100svh, title card clamp 48→88 px, end-credit scores, chapter-dot scale, gold pill CTA. Bets the owner's images can carry the page when the layout steps aside. Scrim keeps text ≥ 4.5:1 (measured).

### Motion — the six moments (same design in all three)
1. **Page entrance:** the result sequence IS the entrance — mark → name → line → scale → scores, stagger 100–120 ms, 0.5–0.7 s, ease-out cubic-bezier(0.22,1,0.36,1).
2. **Scroll reveal:** later blocks fade/rise once via one IntersectionObserver per direction (`data-reveal` → `data-reveal-state="in"`, then `unobserve` — never re-triggers).
3. **Result reveal:** = moment 1, the payoff, ≤ ~1.2 s. Frame sequence: `motion-frame-1-now-line.png` → `motion-frame-2-mark-arriving.png` → the settled shots.
4. **StageScale fill:** dots fill within the scale's own reveal block (`--reveal-i` stagger).
5. **Hover/focus:** colour shift only, 0.2 s (A outline→fill · B slab→outline · C fill→outline); `:focus-visible` untouched = instant.
6. **Loading breathe:** unchanged, already live — nothing to do in this preview.
**Reduced-motion:** every direction's CSS has `@media (prefers-reduced-motion: reduce)` killing its transitions (globals already kills animations); the observer still sets the state instantly, so changes are immediate — **verified by construction + code, NOT device-verified** (the preview browser has no reduced-motion toggle) — Tanya can confirm on a real device.
**Envelope check:** 0.2 s hover · 0.5–0.7 s entrances · 0.9 s bar fill — inside the SPEC's UI/sequence allowances.

### Contrast (measured on renders, `tests/harness/contrast-region.js`)
A: tierLine 16.47:1 · now-line 7.03:1 — B: pull-quote 14.38:1 · caption 13.02:1 — C over backdrop: tierLine 16.48:1 · muted 9.69:1. All ≥ 4.5:1 ✓.

### Files touched (this task — NEW files only)
`src/app/preview/directions/page.tsx` · `src/components/preview/directions/{sample.ts, bits.tsx, shared.module.css, useReveal.ts, A.tsx+A.module.css, B.tsx+B.module.css, C.tsx+C.module.css}`. **No live page, token, dictionary or behaviour touched** (the `M` files in git status are TASK-019's separate diff). `npm run build` clean; route table shows `/preview/directions`.

### IMG request batch (screenshots in tests/harness/task-020/)

```
IMG-001
- Page / slot: /ideas/[id] (direction A) — beneath the discount line, above the hire button
- Job: make the visitor feel the thing in their hands is starting to be worth something — a quiet "oh" before the call to action
- Subject: abstract macro of rough dark stone with one thin vein of warm light, low-key, edges out of focus
- Must NOT contain: text, faces, hands, logos, recognisable objects, product-shine
- Size & aspect: 680×453 px desktop / 343×229 px at 375 — 3:2 both
- Background: full-bleed JPEG, fades into #0d0c0a at all edges
- Overlay: none
- Palette: #0d0c0a · #161411 · #f0ece3 · #e3b23c
- Style: photo-real macro abstract — gallery spot-lit mineral in the dark, not gemstone advertising
- Screenshot: ai-worker/tests/harness/task-020/A-possibility-th-375.png
- Tier-specific?: no
```

```
IMG-002
- Page / slot: /ideas/[id] (direction B) — between the score ledger and the AI reason, as a book "plate"
- Job: give the letter one physical object to hold on to — the pause a full-page picture creates in a book
- Subject: still-life of a single rough stone on warm paper in soft window light, large negative space
- Must NOT contain: text, faces, hands, logos, colour casts
- Size & aspect: 720×480 px desktop / 343×229 px at 375 — 3:2 both
- Background: full-bleed JPEG; the image's own background should sit close to #f6f1e6 so the plate edge is quiet
- Overlay: none
- Palette: #f6f1e6 · #252016 · #a0651f
- Style: editorial still-life photo, soft matte daylight — book-plate, not product photo
- Screenshot: ai-worker/tests/harness/task-020/B-possibility-th-375.png
- Tier-specific?: no
```

```
IMG-003
- Page / slot: /ideas/[id] (direction C) — the full-bleed backdrop of the whole viewport
- Job: carry the feeling of the tier the visitor just became — the page IS the picture; the layout steps aside
- Subject: one landscape at dusk or dawn with a single warm light low on the horizon and a large calm dark sky — same composition per tier, different light
- Must NOT contain: text, faces, hands, logos, cities/roads/people, busy detail in the lower two-thirds
- Size & aspect: 1600×1067 px desktop / 800×1200 px at 375 (horizon kept low-centre so both crops work)
- Background: full-bleed; our scrim (#0b0a08, 0.15–0.72) sits on top — the lower two-thirds must stay visually quiet
- Overlay: tier name, tier line, scale, scores, reason, discount, CTA — left-aligned, lower two-thirds
- Palette: #0b0a08 · #f4f1ea · #ffd267
- Style: cinematic landscape photo, low-key long-exposure calm — film still, not travel brochure
- Screenshot: ai-worker/tests/harness/task-020/C-possibility-th-desktop.png
- Tier-specific?: yes → 5 variants, same scene five lights (Ordinary: cold dark sky, no glow · Seeker: first thin crack of light · Raw Diamond: glow breaking low cloud · Visionary: half the sky lit · The Possibility: brightest, widest glow)
```

### My paragraph as the designer (required deliverable)
A bets restraint can read as expensive when the craft is exact — the safest option: dark is what the product has worn, the stage system was built for it, and it ships with the least risk. B bets the product is a letter — and it is the one I keep looking at: the pull-quote and ledger make the tier feel written TO the person, which is exactly the owner's stated purpose; it is also the only direction proving we are not afraid of light, and Thai serif on cream is genuinely beautiful. C is the most dramatic but makes every result page depend on image quality we do not control yet, with a permanent text-over-image tax. **I would ship B**, keeping A's mark glow logic and reveal timing (they suit B as-is). If the owner wants drama, A is the safe second; C only once IMG-003 lands and proves itself.

## Questions

- None open. The IMG batch above is ready for your completeness gate (SPEC-010 §Image requests).

## Added 2026-09-26 — the owner answered; this task is now UNBLOCKED
**Status note:** Q-1..Q-3 are settled (SPEC-010 §Amendment 2026-09-26). Method confirmed: three directions on one screen, then the site. No more questions go to the owner about the look — the next thing he sees is this preview plus the IMG batch.

0. **Reference study first (required deliverable, before you design).** The owner's bar: `taskforge-saas.webflow.io` · `flowlink-um.webflow.io` · `corexa-template.webflow.io` — *quality bar, not template; match their value and interest in colour, animation, image fit; do not copy.* Neither Porter nor I could load them (my browser pane stalled on all three) — you have the tooling, so this is yours. For **each** site record: palette (hexes), type (families, h1/body size ratio, weights, letter-spacing), section rhythm (count, vertical padding, how sections alternate), imagery (kind, crop, how it meets the background), motion (what animates, trigger, duration, easing). Then **one paragraph: what the three share** — that is the bar we are matching. If a site will not load for you either, say so plainly; do not infer a palette you did not see.
9. **Animation** per SPEC-010 §Amendment: the six moments listed there, nothing else, with the reduced-motion rule. The **result reveal** (mark → tier name → scores in sequence) is the moment that matters most — a static page appearing is what we are replacing.
10. Each direction states its **palette with hexes** in the notes; colour is open, contrast floor unchanged.

## Added DoD lines (2026-09-26)
- [ ] The reference study, in the shape above, for all three sites + the shared-core paragraph.
- [ ] Motion: for each direction, list the six moments and what you did for each; include a short screen recording **or** a frame sequence (3–4 stills) of the result reveal — a still image cannot show motion, so do not claim it works from a screenshot.
- [ ] `prefers-reduced-motion` on: every one of the six becomes an instant state change — state how you verified it.
- [ ] Each direction's palette hexes pasted.

## Review
**Verdict: DONE** (Sober, 2026-09-26 13:00). This is the first time in three attempts that the look rests on measured facts instead of taste: three reference sites studied with hexes, type ratios, rhythm and actual motion parameters, and an honest note that corexa never reaches a static frame (the same wall I hit — stating it rather than inferring a palette is exactly right). The shared-core paragraph is the useful output: **one dominant accent on a quiet neutral field, ~3:1 display/body ratio with tight tracking, alternating rhythm with hairlines, drawn imagery, and constant short confident motion.** Note what that kills: "dark" was never the bar — discipline was. Two of the three references are dark, one is light, so REQ-007/008's darkness was never what he was asking for.
Checked myself: 10 files under `components/preview/directions`, `prefers-reduced-motion` present in three of the direction stylesheets, 18 evidence files including the reference shots and the motion frame sequence, no live page/token/dictionary touched. Contrast 7.03–16.48:1 across all three, measured on renders. Motion envelope inside the SPEC's allowances, observers unobserve so nothing re-triggers.
Accepted UNVERIFIED, correctly stated rather than claimed: reduced-motion is proven **by construction and code, not on a device** — Tanya confirms on a real one. Corexa's layout facts are CSS/DOM only.
**Your recommendation is on the record and I am carrying it as the recommendation, not burying it:** ship **B (warm editorial)**, A as the safe second, C only once IMG-003 exists. I agree, and for one reason beyond taste — the purpose line the owner wrote himself is *"the site speaks TO the person"*, and B is the only direction whose structure does that (a letter with a pull-quote and a ledger). C's risk is also real and worth saying out loud to him: it is the one direction whose quality we do not control, and in the preview it is judged on a placeholder.
**IMG batch: gated and approved** — see §Image gate below. Going to Porter with the preview deploy in one message, as promised.

## Image gate (Sober, 2026-09-26) — SPEC-010 §Image requests
IMG-001, IMG-002, IMG-003 **pass**: every Job line describes an effect rather than a picture; overlay stated (none / the full text stack for C); both desktop and 375 sizes present; palettes carry the real surrounding hexes; each has a screenshot with the placeholder in place; IMG-003 lists all five tier variants.
**One instruction added by me before it goes up, to protect the owner's effort:** each request belongs to exactly one direction, and only one direction will be built. So the batch goes to him **with the preview**, and the ask is: *look at A/B/C, pick one, and generate only that direction's image(s).* IMG-003 alone is five generations — nobody should spend that on a direction that loses. That keeps REQ-009 R5 (images generated against a real layout, requests sent early) without wasting four fifths of the work.
