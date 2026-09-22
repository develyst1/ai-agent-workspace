# TASK-013: FE — visual redesign (dark theme, imagery, result-page order, new tier wording)
- Source: SPEC-008 (REQ-007)
- Owner: FE (Fern)
- Status: DONE
- Depends on: TASK-012 (soft)

## What to do
Read SPEC-008 in full, then REQ-007 §Wording and REQ-003 §Wording (W-8, W-9). Look, layout, wording only — no behaviour changes.
1. Tokens: rework `globals.css` + `lib/theme.ts` to the dark/gold system in SPEC-008 §Design system; verify contrast ≥ 4.5:1 for ink and muted ink and paste the ratios.
2. Images: copy the 14 files from `../project-docs/assets/grok-2026-09-22/` into `public/img/`, re-encode (≤ 250 KB each), `tierImage()` helper, `<picture>` wide/tall.
3. Dictionaries: replace `tier.desc.*` values with REQ-007 W-3; add hero W-1/W-2, "This is where you are now", the discount line, the new My-ideas empty state, the collapsed-text heading "สิ่งที่คุณเล่าให้เราฟัง" / "What you told us" with toggle "ดูข้อความ"/"Show" · "ซ่อน"/"Hide" (Porter 2026-09-22, REQ-007 §Wording), W-8 not-found, W-9 date format (`lib/format.ts`: TH "21 ก.ย. 2026", EN "21 Sep 2026").
4. Pages per SPEC-008 §Pages 1–9, in that order. Loading = breathing spark, no spinner. Result page element order exactly as listed.
5. Header per §7 (badge hidden < 600 px — closes TASK-010 item 0's first half).
6. `hallmark audit` on landing + result; Lighthouse mobile on landing.

## Definition of Done
- [ ] Screenshots under `ai-worker/tests/harness/task-013/`: landing (desktop + 375), idea box, loading, result for at least two different tiers, My ideas (filled + empty), /me, not-found — each TH and EN.
- [ ] Contrast ratios for ink/paper and muted/paper pasted (tool + values).
- [ ] Result page: paste the DOM order of the nine blocks (e.g. from `document.querySelectorAll('main > *')`) matching SPEC-008 §Pages 4.
- [ ] `ls -la public/img` with sizes, all ≤ 250 KB.
- [ ] Lighthouse mobile performance score on the landing — paste.
- [ ] `hallmark audit` verdicts — paste.
- [ ] Regression: sign in (fixture cookie), submit an idea, open result, My ideas, /me — all still work; `npm run build` clean; tier-name grep in i18n shows only `tier.desc.*`.

## Implementation Notes
_Fern, 2026-09-22. Repo `possibility-front`, paths relative to it. Look/layout/wording only — no route, API call or guard changed._

**1. Tokens** — `src/app/globals.css` (OKLCH, one hue 85) mirrored in `src/lib/theme.ts` (hex + antd `darkAlgorithm`, `colorPrimary/Info/Link` = gold, `Button.primaryColor` = accent-ink, `Progress` re-tokened, `motion: false`). Type scale vars (hero 40/56, h1 28/36, body 16, meta 14), `--measure: 720px`, `overflow-x: clip`, `@keyframes breathe` + `prefers-reduced-motion` kill-switch. Contrast (WCAG 2.x relative-luminance formula, own script `oklch → sRGB → ratio`; values also pasted as comments next to each token):
```
paper   oklch(16% 0.012 85)  #100d08
ink     oklch(93% 0.010 85)  #ebe7e0   ink/paper      15.80 : 1
muted   oklch(72% 0.014 85)  #a9a49b   muted/paper     7.82 : 1   muted/surface 7.14 : 1
accent  oklch(78% 0.140 85)  #e0af3b   accent/paper    9.61 : 1   accent-ink/accent 9.32 : 1
danger  oklch(72% 0.170 28)  #fd7466   danger/paper    7.28 : 1
```
**2. Images** — `public/img/` (14 files) re-encoded with `sharp` (JPEG q78 mozjpeg, ≤ 1600 px): `ls -la public/img`
```
 57738 hero-glowing-stone-tall.jpg      31410 hero-glowing-stone-wide.jpg
 61710 ordinary-hands-stone-tall.jpg    54947 ordinary-hands-stone-wide.jpg
144553 raw-diamond-hands-tall.jpg      122356 raw-diamond-hands-wide.jpg
114157 seeker-crack-hands-tall.jpg      97240 seeker-crack-hands-wide.jpg
  9829 spark-tall.jpg                   10585 spark-wide.jpg
 61107 the-possibility-diamond-tall.jpg 52783 the-possibility-diamond-wide.jpg
 85550 visionary-half-hands-tall.jpg   103130 visionary-half-hands-wide.jpg
```
All ≤ 145 KB (limit 250). `src/lib/tier-image.ts` — `tierImage(subject, orientation)`, the only mapping (hero/spark/5 tiers → files, per SPEC-008). `src/components/common/TierPicture.tsx` — art-directed `<picture>` (tall < 768 px, wide ≥ 768) built on `next/image`'s `getImageProps` so both sources go through the optimizer; `priority` → `fetchpriority=high` + eager (hero only), everything else lazy.
**3. Dictionaries** — `tier.desc.*` = REQ-007 W-3 (same keys); new `hero.title/sub` (W-1/W-2), `result.nowHeading`, `result.discountLine` (`{discount}`), `result.yourWords/show/hide` (W-4), `notFound.title/body/link` (W-8), `ideas.empty` replaced (REQ-007). `src/lib/format.ts` → `formatDate(iso, lang)` per W-9: TH `22 ก.ย. 2026` (standard Thai abbreviations ม.ค.…ธ.ค., CE year), EN `22 Sep 2026`; **date only** — W-9 shows no time, so the earlier `HH:mm` is gone (Q-3).
**4–9. Pages** — Landing: `Hero.tsx` (new) + `LandingContent.tsx` (hero → Google → REQ-006 divider → email block); `HomeContent.tsx` now renders the hero in the first HTML before the auth state is known (LCP; see Lighthouse). `/ideas/new`: dark card, borderless TextArea, gold W-5; pending → spark breathing (`animation: breathe 3s`) + W-4, no `.ant-spin` anywhere. Result: nine blocks (order below), thin gold bars as plain divs, reason as `<blockquote>` serif with a gold hairline, discount line, empty `hireSlot`, collapsed "What you told us" (`aria-expanded`, Show/Hide). My ideas: cards with 48×72 tall thumbnail, W-9 date, tier (serif), preview; empty = REQ-007 line + small spark. `/me`: large tier image, name, email, tier name, W-3 line, badge, discount line, link. Header: wordmark, badge (gold outline; hidden < 600 px — TASK-010 item 0 first half done), name+email → `/me`, sign-out as a text button, small Segmented; wraps to two rows on phones when needed. Not-found: `NotFound/` partial with W-8 (replaces the bare `404`).

**Result page DOM order** (`[...document.querySelectorAll('main > *')]`, live):
```
p.now · picture.picture · h2.tierName · p.tierLine · dl.scores · blockquote.reason · p.discount · div.hireSlot · section.words
```
= SPEC-008 §Pages 4 items 1–9.

**Screenshots** — `tests/harness/task-013/*.png`, 28 files: `{landing, idea-box, my-ideas, me, not-found, result-visionary, result-ordinary} × {th, en} × {desktop 1280, 375}`, captured by `tests/harness/task-013/capture.mjs` (Playwright module from the `smart-scheduler-front` checkout via `PLAYWRIGHT_DIR`, driving system Chrome; read-only, fixture cookie for `dev-fern-a`). Loading state has no file (transient) — seen live: spark breathing (`animationName: …breathe`, no `.ant-spin`), W-4 beneath. Two tiers only exist for my fixture (Visionary, Ordinary); Seeker/Raw Diamond/The Possibility images are proven only by the mapping helper + `/me`-style rendering path (same component) — **UNVERIFIED on screen** until an idea lands in those tiers.

**Lighthouse** (v12, mobile, simulated throttling, performance only, production `standalone` build on :3001, API base pointed at local):
```
run 1: perf 71 — FCP 0.9 s · LCP 6.1 s · SI 1.8 s · TBT 310 ms · CLS 0.006
run 2: perf 74 — FCP 0.9 s · LCP 5.4 s · SI 1.6 s · TBT 310 ms · CLS 0.006
```
**Below the ≥ 80 target.** Observed (unthrottled) LCP breakdown is 137 ms total; the simulated LCP is dominated by the JS on the landing — the 344 KB antd chunk (Lighthouse: ~500 KB unused on this page) + the GIS client (70 KB). Two fixes already in: the hero was client-gated on `/auth/me` (first run on dev: LCP 13.7 s → now in the first HTML), and `fetchpriority=high` on the hero img. The remaining lever is antd's weight on a page that uses Form/Input/Button/Divider/Alert/Segmented — not a change I make unasked (Q-1). Before the re-pin/hero fixes, dev-server score was 59.

**hallmark audit** (self-run against `references/anti-patterns.md`, landing + result): no critical hit — no purple gradient, no Inter-everywhere (Noto Serif + Noto Sans Thai, roman), no 3-column grid, no card-in-card, no pure black/white, no aurora/orb, hero not full-viewport-centred (bottom-left text, ≤ 78 vh). Major/minor: one eyebrow on the result ("This is where you are now" is the spec'd line, kept); no italic, no hover-only, `tabular-nums` on every number, no invented metric, no token improvisation, no re-drawn chrome, no `transition-all`, single `breathe` motion with reduced-motion off-switch. Found and fixed during the audit: (a) wordmark wrapped mid-word at 375 px (global `overflow-wrap: anywhere` on headings) → `nowrap`; (b) header actions overlapped the wordmark at 375 px → header wraps; (c) Thai W-1 broke as "ความเป็น | ไปได้" (`max-width: 14ch`) → 22ch; (d) the GIS iframe painted a **white box** on the dark page (Chrome paints an iframe opaque when its `color-scheme` differs from its document's) → container `color-scheme: light`. Verdict after fixes: *close, fix the minors* → fixed.

**Regression (2026-09-22, FE :3000 dev + BE :4019, real gateway + SIT DB, fixture `dev-fern-a`):** sign-in via minted cookie → header badge/name; submitted a 3rd idea (barber-shop queue, TH) → spark → `/ideas/b4ce1cde-…` Visionary 85/80/80, badge unchanged (upward-only); result page order as above; Show/Hide toggle; My ideas 3 cards newest first with W-9 dates; `/me`; not-found page for a foreign id; TH ↔ EN on every page. Fixture footprint now 3 ideas + 15 steps under `dev-fern-a` (declared). `npm run build` clean (owner's standalone script, `[postbuild] copied .next/static + public/`); token grep zero hits; tier-name grep in `lib/i18n/` shows only `tier.desc.*`. Browser signed out; all my servers stopped.

## Questions
- Q-1 (Sober): Lighthouse mobile is **71–74, not ≥ 80**; the remaining cost is antd's JS on the landing (~500 KB unused per Lighthouse). Options: (a) accept for now and revisit when TASK-009/010 are in; (b) a follow-up TASK to replace antd on the landing with plain tokened inputs/buttons (Google button + email form are the only controls there) — roughly a half-day; (c) lazy-load the email block below the fold. Your call; I did none of them.
- Q-2 (Sober): SPEC-008 asks for a **gold, filled** Google button — Google Identity Services only renders its own `outline` / `filled_blue` / `filled_black` and forbids custom styling. Shipped `filled_black` (dark button, white text/G) as the closest; `outline` (white) is the more *dominant* one on the dark paper if you prefer that reading of REQ-006 AC-1. One word.
- Q-3 (Sober → Porter, FYI): W-9 shows a **date only** (`22 ก.ย. 2026`) — the `HH:mm` from TASK-006 is gone everywhere. If a time is wanted on My ideas, it is one line in `lib/format.ts` plus Porter's format.
- Q-4 (Sober): header keeps **name + email** (REQ-002 R4/AC-2, tested and DELIVERED) although SPEC-008 §7 lists only "name"; the email is hidden below 600 px. Say if the SPEC meant to drop it.
- Q-5 (Sober, FYI): `possibility-front/.env.local` on this machine now has `NEXT_PUBLIC_API_BASE_URL=https://possibility.develyst.online` (the owner's edit). All my dev/prod runs override it to local via the shell; one Lighthouse run before I noticed made a single `GET /auth/me` (401) against SIT — read-only, no state touched. Noting it so the "local only" rule is visibly kept.

## Review
**Verdict: DONE** (Sober, 2026-09-22 04:05). Tokens with pasted contrast ratios (all ≥ 7:1), 14 images ≤ 145 KB through one mapping helper, all nine page specs, result-page DOM order exactly §Pages 4, 28 screenshots, hallmark fixes (incl. the GIS white-box `color-scheme` trap — good find), regression run on the real gateway. Lighthouse 71–74 is below the SPEC's 80 and is recorded as the accepted baseline (see Q-1). Seeker / Raw Diamond / The Possibility renders are UNVERIFIED on screen until ideas land in those tiers — Tanya forces them via fixtures (REQ-007 AC-2), not you.
Answers: **Q-1** (c) now — lazy-load the email block below the fold (small, do it inside TASK-009 as item 0) and accept 74 as the baseline; (b) becomes TASK-014 only if the owner or Tanya raise speed. SPEC-008 §Non-functional amended. **Q-2** use Google's `outline` (white) — most visible on dark paper; "the one gold element" on the landing is therefore none of the buttons (SPEC-008 §Pages 1 amended). **Q-3** → Porter (time on My ideas or date only). **Q-4** keep name + email (REQ-002 DELIVERED wins; SPEC-008 §7 amended). **Q-5** correctly handled — the `.env.local` now points at SIT by the owner's hand; every local run must override, as you did; Porter told.
