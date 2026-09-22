# TASK-014: FE — fix DEF-1 (error Alert unreadable on dark) and DEF-2 (Thai hero headline mid-word break)
- Source: SPEC-008 (REQ-007 AC-6, REQ-006 W-4, REQ-003 W-6); defects from TEST-004 / TEST-005 via Porter
- Owner: FE (Fern)
- Status: DONE
- Depends on: none

## Attribution (PROTOCOL: the mistake, by name)
- DEF-1 — TASK-013 (Fern) re-tokened `colorPrimary/Info/Link`, `Progress` and the base colours but not antd's **status-variant tokens** (`colorErrorBg`, `colorErrorBorder`, `colorErrorText`, and the warning/success/info siblings); `Alert type="error"` therefore kept antd's light pink background under off-white text (1.14:1). Sober's review (TASK-013) checked contrast on ink/muted/accent only and accepted the hallmark pass without asking for a contrast reading on a rendered error state — the check was of the tokens, not of the render.
- DEF-2 — TASK-013 (Fern) fixed the Thai W-1 break by widening `max-width` to 22ch; that only moved the break point. Thai has no spaces, so a headline needs explicit break opportunities or `keep-all`.

## What to do
1. **DEF-1:** in `lib/theme.ts` set the dark-theme status tokens so every `Alert`/`Form` error renders readably: `colorErrorBg`, `colorErrorBorder`, `colorErrorText` (and `colorWarning*`, `colorSuccess*`, `colorInfo*` for completeness) as dark surfaces with the ink/danger tokens from `globals.css` — e.g. error bg = paper lightened one step with a danger hairline, text = ink. Do **not** reintroduce a blue/green hue: warning/success may reuse muted/gold. Verify with a real contrast reading on the rendered W-4 and W-6 alerts (computed `color` vs `background-color`), both languages, desktop + 375.
2. **DEF-2:** hero title `word-break: keep-all; overflow-wrap: normal;` and remove the `ch` cap; if Chrome still breaks inside a Thai word, insert U+200B (zero-width space) at the word boundaries of the TH W-1 string in `th.ts` — `คุณคือ​ความเป็นไปได้` — this is an invisible break hint, not a wording change (Porter informed). Check 320/375/414 widths.
3. Also grep the app for any other antd status colour that could surface (Form `validateStatus`, `Alert type="warning"`, notifications) and confirm they read ≥ 4.5:1.

## Definition of Done
- [ ] Computed-style contrast for W-4 (landing) and W-6 (idea box, dead-port BE) — paste text colour, background, ratio (≥ 4.5:1), TH + EN, desktop + 375.
- [ ] Screenshots of both alerts, saved under `ai-worker/tests/harness/task-014/`.
- [ ] Hero W-1 at 320 / 375 / 414: no mid-word break — screenshots; state whether ZWSP was needed.
- [ ] `npm run build` clean; token grep clean; no new hue (paste the theme token diff).

## Implementation Notes
_Fern, 2026-09-22. Attribution accepted — both defects are mine (TASK-013). Repo `possibility-front`._

**DEF-1 — `src/lib/theme.ts` + `src/app/globals.css`.** Two new surface tokens, same hues as the existing danger (28) and gold (85) — no new hue:
```
--color-danger-surface: oklch(22% 0.03 28)   #271513   ink 14.2:1 · danger 6.5:1
--color-accent-surface: oklch(22% 0.025 85)  #201a0d   ink 14.1:1 · accent 8.6:1 · muted 7.0:1
```
`theme.ts` now sets **every** antd status-variant token for error / warning / success / info — `*Bg`, `*BgHover`, `*Border`, `*BorderHover`, `*Text`, `*TextActive`, `*TextHover`, `*Active`, `*Hover` — error → danger + danger-surface, the other three → gold + accent-surface (so antd's own blue/green/orange can never surface); `colorSuccess`/`colorWarning` themselves = gold; `Alert.colorText/colorTextHeading` = ink. Theme diff hex census: the only values not already in the file are `#271513` and `#201a0d`.
**DEF-2 — `Hero.tsx`, `Landing.module.css`, `th.ts`.** `word-break: keep-all` has no effect on Thai (it is CJK-only; Chrome's ICU dictionary still broke `เป็นไป|ได้` — measured: 2 lines, 315 + 41 px at 375). So the U+200B route: `hero.title` (TH) is `คุณคือ​ความเป็นไปได้` (invisible, not a wording change); `Hero` splits on U+200B and renders each segment in a `white-space: nowrap` span with a U+200B between them → the headline can wrap **only** at the hint. Strings without a hint (EN) render untouched and wrap at spaces. The `22ch` cap is gone (`max-width: 100%`, `overflow-wrap: normal`). **ZWSP was needed.**
**Also applied (Sober's TASK-013 Q-2 answer, SPEC-008 amended):** Google button → GIS `outline`.
**Item 3 sweep** — all antd status surfaces in the app: `Alert type="error"` ×4 (W-4, W-6 ×3), `Alert type="warning"` ×1 (REQ-002 W-3), `Form.Item validateStatus="error"` ×2 (W-3/W-5), `TextArea status="error"` ×1. Alerts: measured below. Form/Input error text is `colorError` = danger on paper → 7.28:1 (TASK-013 table); the warning Alert uses the same token path as the measured error Alert with the accent surface (ink 14.1:1) — same mechanism, not separately rendered (W-3 needs a real Google dismiss).

**DoD evidence (2026-09-22; FE `next dev` on :3000 pointed at a BE on :4001 with `AI_GATEWAY_URL` dead → `POST /ideas` 502; harness `tests/harness/task-014/capture.mjs`, Playwright + system Chrome, computed `color` vs `background-color`):**
```
W-4 th desktop: "อีเมลหรือรหัสผ่านไม่ถูกต้อง"        rgb(235,231,224) on rgb(39,21,19) → 14.16:1  border rgb(253,116,102)
W-6 th desktop: "วิเคราะห์ไม่สำเร็จ ลองอีกครั้ง"       rgb(235,231,224) on rgb(39,21,19) → 14.16:1
W-4 en desktop: "Incorrect email or password."        rgb(235,231,224) on rgb(39,21,19) → 14.16:1
W-6 en desktop: "Analysis failed — please try again." rgb(235,231,224) on rgb(39,21,19) → 14.16:1
W-4 th 375 / W-6 th 375 / W-4 en 375 / W-6 en 375:    same colours → 14.16:1 each
"Try again" inside W-6: rgba(235,231,224,.88) on rgb(27,24,17) → ≈ 12:1
hero th 320px: คุณคือ|ความเป็นไปได้ → 2 lines, break at the hint only (tops 339 / 385), no h-scroll
hero th 375px: 2 lines, break at the hint only (440 / 486), no h-scroll
hero th 414px: 1 line, no h-scroll
```
Screenshots (19): `tests/harness/task-014/w4-{th,en}-{desktop,375}.png`, `w6-…` (alert crops) + `w4-page-…`/`w6-page-…` (full pages) + `hero-th-{320,375,414}.png`. `npm run build` clean; token grep zero hits. Observed on the way: the BE's per-(IP, email) login rate limit (10 / 15 min, in-memory) hits after repeated W-4 tries — the harness signs in for W-6 with Jason's `dev-jason-pw1` fixture and the limit resets on BE restart; note for Tanya's re-run. Servers stopped, browser signed out.

## Questions
- Q-1 (Sober → Porter, FYI): the TH W-1 string in `th.ts` now carries one invisible U+200B after `คุณคือ` — the only allowed wrap point. If Porter ever changes W-1, the hint has to be placed again (comment in `th.ts` says so).

## Review
**Verdict: DONE** (Sober, 2026-09-22 10:45). Evidence is of the render, not the tokens: computed colour/background on the real W-4 and W-6 alerts → 14.16:1 in TH/EN at desktop and 375, with the screenshots on disk; every antd status variant re-tokened (verified in `theme.ts`, 40 status entries, two new surfaces on existing hues); Thai hero wraps only at the U+200B hint (measured line tops at 320/375, one line at 414). Good call finding that `keep-all` is CJK-only. Rate-limit note for Tanya passed on. Q-1 → Porter.
