# SPEC-004: Render markdown in the AI cards
- Source: REQ-004
- Status: DONE (TASK-016 accepted 2026-07-28; REQ-004 → SPEC_DONE, pending Porter acceptance)
- Baseline: `../architecture-baseline.md`. FE-only polish on the REQ-003 AI cards.

## Overview
The advisor card (TASK-014) and note-summary card (TASK-015) currently render the AI
`content` as plain pre-wrap text, so markdown like `**Tone:**` shows literal `**`. Replace
that with a **single reusable, XSS-safe markdown renderer** used by BOTH cards — this fixes
the polish and guarantees the two cards stay consistent (one family). No backend change; the
prompt and API contracts are untouched.

**Security is the headline:** the `content` comes from the external AI Center and is
**untrusted**. Rendering must never allow HTML/script injection.

## Design decisions (Sober)
- **Use `react-markdown`** (renders markdown to React elements — it does NOT use
  `dangerouslySetInnerHTML` for the content, so embedded raw HTML like `<img onerror>` /
  `<script>` is treated as inert literal text). **This is the XSS-safety mechanism.**
- **Do NOT add `rehype-raw`** (it would parse raw HTML → unsafe). **Never** pass the AI content
  through `dangerouslySetInnerHTML`. Keep `react-markdown`'s default URL sanitization (it strips
  `javascript:`/other dangerous link protocols) — do not override it with an unsafe transform.
- Restrict to a **safe, sufficient subset** (headings, `strong`/`em`, `ul`/`ol`/`li`, `p`,
  line breaks, inline `code`) via `allowedElements`/`disallowedElements` — defense in depth,
  and avoids oversized headings blowing out the card.
- **One component** (e.g. `components/Markdown.tsx` → `<Markdown>{content}</Markdown>`), styled
  once (Mantine `TypographyStylesProvider` or a small style block) so both cards match. Swap it
  into `AdvisorSection` and `NoteSummarySection` in place of the current `<Text pre-wrap>`.
- If a maintained React-element markdown renderer other than `react-markdown` is preferred, it's
  fine **only if** it never injects raw HTML for untrusted content and sanitizes link URLs.

## Scope of change (surgical)
- New: `components/Markdown.tsx` (the shared renderer).
- Edit: `components/AdvisorSection.tsx` and `components/NoteSummarySection.tsx` — replace the
  `advice.content` / `summary.content` `<Text style={{whiteSpace:"pre-wrap"}}>` with `<Markdown>`.
- Everything else (loading, 502 friendly error, no-notes state, save-to-interactions,
  `provider · model` line) stays exactly as-is.

## Non-functional
- **XSS:** untrusted AI content rendered without raw-HTML parsing and without
  `dangerouslySetInnerHTML`; dangerous link protocols stripped. Layout cannot be broken by the content.
- No new backend; no API/prompt change. New FE dependency (`react-markdown`) committed to `dong`.

## Tasks
- TASK-016: FE — shared `<Markdown>` renderer (react-markdown, XSS-safe subset) + swap it into the
  advisor and note-summary cards; verify markdown renders + a malicious payload is inert (depends: —)

## Questions
(Fern asks here; Sober answers as `> answer: ...`)
