# SPEC-008: Visual redesign — "you are the possibility"
- Source: REQ-007 (brief, R1–R11, AC-1..7, wording W-1..W-3 + result/discount/empty lines); SYSTEM-FACTS §Purpose, §Visual design; `FRONTEND-STANDARD.md` §1; SPEC-004/006 (badge, i18n rules)
- Status: ACTIVE
- Author: Sober (SA), 2026-09-22

## Overview
Look, layout and wording only — every behaviour, route, API call and AC of REQ-001..006 stays.
The change is one theme (dark, one warm light), one image set, and a re-ordering of the result
page. It is one FE task (TASK-013) so the whole site changes at once, not page by page.
The tier *descriptions* (REQ-001 table, keys `tier.desc.*`) are **replaced** by REQ-007 W-3 —
same keys, new values; the tier *names* stay the exact strings.

## Design system (binding — Fern fills the numbers, these are the constraints)
- **Tokens** (`globals.css` + mirrored `lib/theme.ts`, one source, as today): paper = near-black with a warm tint (OKLCH L≈0.14–0.18, low chroma, hue = the gold's); ink = warm off-white (L≈0.92); muted ink (L≈0.70); line (L≈0.28); **accent = one warm gold** (OKLCH ~ L0.78 C0.14 h85) used only for: primary CTA, focus ring, score bars, tier-badge outline, links. `--color-danger` stays for W-2/counter. No pure `#000/#fff`, no second hue (FRONTEND-STANDARD §1).
- **Type:** display serif (Noto Serif Thai, already loaded) for W-1, page headings, the tier name and "Possibility" wordmark — roman, never italic; body sans (Noto Sans Thai). Scale: hero 40/56 px (phone/desktop), h1 28/36, body 16, meta 14. Line-height ≥ 1.5 for Thai.
- **Contrast:** body ink on paper ≥ 4.5:1, muted ≥ 4.5:1 too (REQ-007 AC-6) — pick L values that pass, verify with a contrast tool before REVIEW.
- **Space:** 4-pt scale; sections separated by 48/80 px; one column, max width 720 px for text, images full-bleed.
- **Ant Design:** theme via `ConfigProvider` tokens only (`colorBgBase`, `colorTextBase`, `colorPrimary`, `colorBorder`, `borderRadius`, font families, `Progress` colours). Components used: Button, Input/TextArea, Form, Alert, Progress (as thin bars), Table (admin only), Segmented (lang). Anything AntD paints blue by default must be re-tokened (Fern found `Progress` already).
- **Motion:** only the loading "breathe" (opacity 0.6→1→0.6, ~3 s, `prefers-reduced-motion` → static). No hover scale, no transition-all.
- **Images:** `next/image`, from `public/img/` copied from `../project-docs/assets/grok-2026-09-22/` (wide 3:2 for ≥ 768 px, tall 2:3 below, via `<picture>`/`sizes`); `alt` is the tier name or "" for decorative hero; `priority` on the hero only. Total image weight: re-encode to ≤ 250 KB each (JPEG q≈78, max 1600 px wide) — record sizes in the TASK.
- **Mapping (REQ-007 R2):** hero → `hero-glowing-stone`; Ordinary → `ordinary-hands-stone`; Seeker → `seeker-crack-hands`; Raw Diamond → `raw-diamond-hands`; Visionary → `visionary-half-hands`; The Possibility → `the-possibility-diamond`; loading + empty → `spark`. One helper `tierImage(tier, orientation)` — the only place the mapping exists.

## Pages (order of elements is the contract Tanya checks)
1. **Landing (signed out):** hero full-bleed (tall on phone) with a dark gradient scrim bottom-up; over it W-1 (serif) then W-2; below the fold edge: Google button — **Google's own `outline` style (white on dark), the most visible control; GIS forbids custom colours so no button on the landing is gold** (amended 2026-09-22) — then W-1 divider of REQ-006, email block (TASK-012 — plain, lazy-loaded below the fold). Language switch top-right, small. Header shows only the wordmark + switch when signed out.
2. **`/ideas/new`:** W-7 heading (serif); the TextArea on a slightly lighter dark card; counter muted; W-5 button gold; W-2/W-3/W-6 as today.
3. **Loading:** replaces the form area: `spark` (tall on phone) breathing, W-4 beneath in muted ink. No AntD spinner anywhere on this path.
4. **Result (`/ideas/[id]`), in this order:** REQ-007 "This is where you are now" line (muted, small) → tier image large (wide/tall) → tier name (serif, ink) → W-3 tier line → three scores as thin gold bars (label left, number right, `tabular-nums`; `Progress` re-tokened or a plain div) → the AI reason as a quote block (serif, larger, a gold hairline left) → the discount line with `{discount}` → hire button slot (TASK-009 fills; gold outline, secondary to nothing else) → the submitted text, collapsed under a muted "your words" disclosure (heading "What you told us" / "สิ่งที่คุณเล่าให้เราฟัง", toggle Show/Hide — Porter 2026-09-22).
5. **My ideas:** cards (dark, hairline border): tier thumbnail (tall, 72 px) left; right: date per W-9, tier name, preview. Empty state = REQ-007 line + `spark` small.
6. **`/me`:** tier image large, name, tier name (serif), W-3 line, discount line, link "My ideas".
7. **Header:** wordmark "Possibility" (serif) left; right: tier badge (gold outline, text ink; hidden < 600 px per SPEC-004), name + email (email hidden < 600 px; REQ-002 AC-2 keeps both — amended 2026-09-22), sign-out (text button), switch. No nav.
8. **Admin (TASK-009):** functional dark theme only — the Table re-tokened; no imagery.
9. **Not-found:** W-8 (REQ-003 §Wording) on paper, no image.

## Non-functional
- Lighthouse performance on the landing ≥ 80 on a throttled mobile profile — **measured 71–74 (TASK-013); accepted baseline 2026-09-22; cost is antd JS, not images. Lazy-load of the email block in TASK-009; a plain-control landing (TASK-014) only if the owner or QA raise speed.**
- `hallmark audit` on landing + result before REVIEW; verdict better than "reads as AI-generated".
- REQ-005 regression: every new string is a dictionary key (SPEC-006); tier names untouched.

## Tasks
- TASK-013: FE — theme tokens, images, all pages per §Pages, W-3 tier lines + REQ-007 strings, W-8/W-9 (REQ-003 §Wording) — owner: FE (depends on: TASK-012 landing block exists; else the email block is stubbed and TASK-012 lands into the new landing)

## Questions
- @Porter (copy, not blocking): a small heading for the collapsed submitted text on the result page ("your words" / "สิ่งที่คุณเล่า"?) — Sober uses no heading until given.
  > answer (Porter 2026-09-22) copy for the collapsed submitted-text block on the result page: heading "สิ่งที่คุณเล่าให้เราฟัง" / "What you told us" (expand/collapse toggle: "ดูข้อความ" / "Show" · "ซ่อน" / "Hide"). Added to REQ-007 §Wording.
