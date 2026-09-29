# TASK-021: FE — apply direction B (warm editorial) to every page
- Source: SPEC-010 §Approach step 2 (REQ-009 R1–R7); the owner chose **B** on 2026-09-26
- Owner: FE (Fern)
- Status: DONE
- Depends on: TASK-020 (DONE)

## What to do
Direction B as built in `/preview/directions` becomes the product. Behaviour, routes, data and wording unchanged (REQ-009 R7).

1. **Promote B's tokens to the live theme** — `globals.css` + `lib/theme.ts` (paper `#f6f1e6` · surface `#fdfaf2` · ink `#252016` · muted `#6f6653` · line `#c4b696` · accent `#a0651f` · accent-ink `#fdf8ec`), one source, antd re-tokened from them. **Re-check every antd status surface after the switch** — the DEF-1 family (`colorErrorBg/Border/Text` plus warning/success/info) was tuned for dark paper and will be wrong on cream. Measure a rendered error alert *and* a warning alert; this is the exact defect class that failed REQ-006/007 once already.
2. **Apply B to every page in REQ-009 R1:** landing (signed out, Google button + email block), idea box, loading, result, My ideas, `/me`, not-found, header. The admin page needs no redesign but must not look broken on cream.
3. **Carry over from the preview:** A's mark-glow logic and reveal timing (your note said they suit B), the six motion moments with the reduced-motion collapse, the ten-block result order, StageMark/StageScale re-coloured for cream — the Ordinary stone must stay visible, as you already found.
4. **Place IMG-002** (`../project-docs/assets/req-009/IMG-002.jpg`, 1712×1152, 175 KB). Porter's check found it **off-request**: pure white background instead of ~`#f6f1e6`, no paper texture, no cast shadow. Judge it on the page, not in isolation:
   - fit it so the plate reads as part of the letter — a soft mask/blend into the cream, a hairline plate edge, or an inset frame are all legitimate; do **not** stretch it, and do not shrink it until it stops doing its job;
   - **re-encode to the served size** (720×480 desktop / 343×229 phone) and to **≤ 200 KB** (SPEC-010 AC-8). The working copy goes in the repo; the original in `project-docs` stays untouched;
   - **if it cannot look native, bounce it** with the specific reason and a screenshot of your best attempt — Porter re-prompts once. That is a legitimate outcome, not a failure: a bad plate is worse than no plate;
   - the designed fallback must still exist (REQ-009 R4) — with no image the page looks finished.
5. If B's rollout wants more image slots, write **IMG batch 2** in REQ-009's format and send it with the task — same completeness gate.

## Definition of Done
- [ ] Screenshots under `ai-worker/tests/harness/task-021/`: every page in R1, TH + EN, desktop + 375 — including the result page with IMG-002 in place **and** with the fallback (image removed).
- [ ] Contrast measured on renders: body ink, muted ink, accent on paper, **one error alert and one warning alert after the token switch** — all ≥ 4.5:1, pasted.
- [ ] Motion: the six moments working on the live pages; frame sequence or recording of the result reveal; how the reduced-motion collapse was checked.
- [ ] IMG-002: `ls -la` of the served file (≤ 200 KB), the result page's total image weight (≤ 500 KB), and one sentence on how you made it sit native — or the bounce-back with its reason.
- [ ] `npm run build` clean; `hallmark audit` on landing + result; Thai-outside-dictionary grep clean; say whether the preview route stays or goes.
- [ ] Regression walk: sign in (fixture), submit an idea, result, My ideas, `/me`, hire button, not-found — all still work.

## Implementation Notes

(Fern, 2026-09-26)

**What changed (possibility-front):**
- **Tokens promoted:** `globals.css` — B's palette live (`#f6f1e6 #fdfaf2 #252016 #6f6653 #c4b696 #a0651f #fdf8ec`); danger re-tuned for cream (`#b3402f` + surfaces `#f6ddd3 / #f2e7cb`); `color-scheme: light`; warm-light alphas lowered (14%/10% — a whisper on cream); the `[data-reveal]` system moved to globals. `lib/theme.ts` — antd re-tokened from the same hexes (`defaultAlgorithm`), full status-token family (error/warning/success/info) rewritten for cream, one hue.
- **Motion:** `lib/motion/useReveal.ts` (promoted from the preview, + deps param — see bug note). Result page: the ten blocks arrive as ONE sequence (now → mark → name → pull-quote → scale → ledger rows → reason → plate → hire → words). Landing hero + auth, My-ideas rows (per-row stagger), /me — all reveal once. Hover = colour only; `:focus-visible` instant; reduced-motion → all transitions/animations killed globally AND the observer still sets state instantly.
- **Pages:** result = preview-B layout live (pull-quote, ledger, plate). Landing = centred serif hero, whisper light. My ideas = hairline editorial cards + ruled empty panel. `/me` = centred editorial plate. Not-found/header/admin = unchanged structure, now on cream via tokens (admin table re-tokens through `theme.ts`; readable, no redesign per the task).
- **IMG-002 placed — KEPT, not bounced.** Off-request as Porter found (pure white bg, no texture/shadow) but the book-plate convention absorbs it: the image sits inside a hairline-framed surface plate (`#fdfaf2` + `--color-line`), so the white stock reads as the plate's own paper. Re-encoded with sharp to served sizes: `public/img/plate-stone-720.jpg` (720×480, **12 301 B**) + `plate-stone-686.jpg` (686×458 for 2× phone, **11 267 B**) — far under the 200 KB cap; the result page's total image weight is ~12.6 KB of ~500 KB allowed. Original in project-docs untouched. **Fallback proven:** with the file hidden, the slot shows a quiet ruled panel with a stone-toned radial centre (`result-plate-fallback.png`) — the page looks finished (REQ-009 R4).
- **Preview route: STAYS** (hidden, unlinked; the owner may re-look; it also now carries the status-alert fixture I measured against). The losing directions A/C cost nothing more.
- A small fixture block (rendered error + warning Alert) was added to the preview route purely so the re-tuned status surfaces could be measured on cream.

**Bug worth recording:** the first live wiring of `useReveal` armed its observer once on mount — pages whose content arrives after a fetch (`isPending → null → blocks`) never re-armed and rendered **blank** (every `[data-reveal]` stuck at opacity 0). Caught on the first live submit; fixed with a deps param (`useReveal([idea.isSuccess])`). Several later "blank page" scares during evidence were the screenshot path racing the 0.5 s reveal — verified working via visibility checks, not assumed.

**Verified (FE dev :3001, BE dev :4019; evidence `tests/harness/task-021/`, 20 files):**
- Pages: landing TH/EN desktop + 375-EN · idea box TH · result TH/EN desktop + 375-EN (plate + fallback + W-2) · My ideas TH desktop + 375-EN · /me TH desktop + 375-EN · not-found EN. All on cream, nothing overflowing.
- **Contrast on renders** (`tests/harness/contrast-region.js`): body ink 14.38:1 · muted 4.92–5.23:1 · **error alert 9.10:1 (sign-in W-4 render) and 7.63:1 (fixture render) · warning alert 11.64:1** — all ≥ 4.5:1 on cream.
- Motion: result reveal sequence + list stagger + /me mark captured as frame stills (`motion-frame-*.png`); reduced-motion collapse = by construction (globals `transition/animation: none !important` + observer sets state instantly) — **device check is Tanya's**, stated honestly as before.
- Regression walk: sign in ✓ → submit idea (new: Raw Diamond 85/85/70) ✓ → result ✓ → My ideas ✓ → /me ✓ → **hire press → W-2 with email + 20% discount** ✓ (`result-hire-w2-en.png`) → not-found ✓.
- `npx tsc --noEmit` clean · `npm run build` clean (route table above, `/preview/directions` present) · Thai-outside-dictionary grep clean (exit 1).
- hallmark audit (landing + result, rendered): **0 critical · 0 major · 2 minor** — (1) the disabled "Request sent" slab reads slightly muddy at 0.55 opacity; (2) the Ordinary 160 px stone is deliberately quiet on cream. Verdict: better than "reads as AI-generated".

## Questions

- None. (No IMG batch 2 — the rollout wanted no further slots beyond IMG-002.)

## Review
**Verdict: DONE** (Sober, 2026-09-26 14:05). The thing I flagged as the likely repeat defect is the thing that is actually proven: the antd status family was rebuilt for cream and **measured on renders — error 9.10:1 on the real W-4 sign-in alert and 7.63:1 on the fixture, warning 11.64:1**. Measuring the real alert and not only a fixture is what makes that credible. Verified myself: B's palette is live in `globals.css`, the full status family is re-tokened in `theme.ts`, 20 evidence files, both plate images on disk.
**The blank-page bug is the most valuable line in this task.** An observer armed once on mount left every `[data-reveal]` at opacity 0 on any page whose content arrives after a fetch — i.e. the result page, the one screen the product exists for, would have shipped blank. Caught on a live submit, fixed with a deps param. I checked where the fix is applied: `IdeaResult` and `MyIdeas` (async) pass deps; Hero, Landing and Profile mount with their content already present, so mount-time arming is correct there. That is the right distinction, not a blanket change.
**IMG-002 kept, and the reasoning is sound:** the book-plate convention absorbs the off-request white stock — the image sits inside a hairline-framed cream plate, so the white reads as the plate's own paper. That is fitting by design rather than stretching or hiding, exactly the rule in SPEC-010 §Amendment. 12.3 KB served against a 200 KB cap, fallback proven with the file hidden.
Noted, not rework: **muted ink measures 4.92–5.23:1** — passing, but the tightest number on the page; if anything later darkens the cream, that is the first value to break. The two hallmark minors (disabled slab at 0.55 opacity, the deliberately quiet Ordinary stone) are accepted as stated. Reduced-motion remains by-construction — Tanya's device check, honestly labelled for the third time rather than quietly upgraded.
