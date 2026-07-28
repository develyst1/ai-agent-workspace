# TASK-016: Shared XSS-safe markdown renderer for the AI cards
- Source: SPEC-004
- Status: DONE
- Assignee: Fern (FE)
- Depends on: none (edits the REQ-003 cards; both already DONE)

## What to do
In `manager-gold-front`:
- Add **`components/Markdown.tsx`** — a small reusable `<Markdown>{content}</Markdown>` built on
  **`react-markdown`** (add the dep). It renders markdown to React elements — **no
  `dangerouslySetInnerHTML`, and do NOT add `rehype-raw`** (that's the XSS-safety guarantee: raw
  HTML in the AI text stays inert literal text). Keep react-markdown's default URL sanitization
  (strips `javascript:` etc.). Restrict to a safe subset via `allowedElements` (headings h3–h6,
  `p`, `strong`, `em`, `ul`/`ol`/`li`, `code`, `br`) so oversized headings can't blow out the card.
  Style once (Mantine `TypographyStylesProvider` or a scoped style block) so both cards match.
- **Swap it into both cards** — in `components/AdvisorSection.tsx` and
  `components/NoteSummarySection.tsx`, replace the `<Text style={{whiteSpace:"pre-wrap"}}>{…content}</Text>`
  with `<Markdown>{…content}</Markdown>`. Change nothing else (loading, 502 error, no-notes,
  save-to-interactions, the `provider · model` line all stay).

## Definition of Done
- [x] Advisor card: stub markdown (`### Tone`, `**Warm**`, a `- list`) renders as real
      `<h3>/<strong>/<li>` — no literal `**`. Browser-verified.
- [x] Note-summary card renders markdown the same way (same `<Markdown>` component) — **consistent**
      with the advisor card. Browser-verified (both `.mg-md` cards have `<h3>/<strong>/<li>`).
- [x] **XSS check:** stubbed content `<img src=x onerror=alert(1)> / [click](javascript:alert(2)) /
      <script>alert(3)</script>` rendered **inert** — `window.alert` trap never fired; no real
      `<img>`/`<script>` element; no `javascript:` anchor (link neutralized); the tags show as literal
      text; layout intact; console clean.
- [x] Loading, 502 friendly "AI unavailable" (killed stub → verified), no-notes, and
      save-to-interactions paths untouched by the swap and still work.
- [x] `bun run build` clean. Browser walkthrough (incl. XSS) below.
- [x] `react-markdown@^10.1.0` committed; **no `rehype-raw`, no `dangerouslySetInnerHTML`** (grep:
      the only matches are the explanatory comment in `Markdown.tsx` saying we avoid them).

## Implementation Notes
Implemented by Fern, 2026-07-28 in `manager-gold-front` (branch `dong`, commit `ded3086`).

**Files:**
- `components/Markdown.tsx` (new) — `<Markdown>{content}</Markdown>` on **`react-markdown@10.1.0`**.
  `allowedElements` = `h3–h6/p/strong/em/ul/ol/li/code/br` + `unwrapDisallowed`. **No `rehype-raw`,
  no `dangerouslySetInnerHTML`** → raw HTML in the AI text stays inert literal text; react-markdown's
  default `urlTransform` neutralizes `javascript:` URLs; `a`/`img` aren't allowed, so model links/
  images can't inject. Styled via a scoped `.mg-md` `<style>` block (Mantine v9 removed
  `TypographyStylesProvider`, which the SPEC listed as an alternative) so both cards match.
- `components/AdvisorSection.tsx` + `components/NoteSummarySection.tsx` (mod) — swapped the
  `<Text pre-wrap>{content}</Text>` for `<Markdown>{content}</Markdown>`. Nothing else changed
  (loading / 502 / no-notes / save-to-interactions / `provider·model` line all intact).

**Verification (evidence) — my own backend on :4020 → local stub :4099 + real browser (§7):**
- Stub returns markdown normally; the XSS payload when the prompt contains `XSSTEST`.
- **Summary card:** "Summarize notes" → rendered `<h3>`, `<strong>`, `<li>`; no literal `**`.
- **Advisor card:** normal topic → same real bold/heading/list. Two `.mg-md` cards, consistent.
- **XSS:** advisor topic `XSSTEST` → payload rendered inert — alert trap never fired; `querySelector('img'|'script')`
  null; no `javascript:` anchor; `<img …>`/`<script>` shown as text; layout intact; console clean.
- **Regression:** killed the stub → advisor `502` → the friendly "AI service is unavailable" still
  shows, page intact. (no-notes/save paths untouched by the swap.)
- `bun run build` clean. Ports free pre-launch (mine); stopped only my instances — all released.

**For Sober:** used a scoped `.mg-md` style block instead of `TypographyStylesProvider` (removed in
Mantine 9) — the SPEC allowed either. Both cards share the one `<Markdown>` component (fixes the
consistency point). Nothing on the REQ-003 behaviour changed.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review
**Verdict: DONE** — Sober, 2026-07-28 (commit `ded3086` on `dong`). Read `components/Markdown.tsx`
and both card call sites; grepped the repo for the forbidden patterns.
- **XSS-safe (the headline): confirmed.** `react-markdown` renders to React elements; **no
  `rehype-raw`** and **no `dangerouslySetInnerHTML`** anywhere (repo grep = only the explanatory
  comment) → raw HTML in the untrusted AI text is inert literal text. `allowedElements` **excludes
  `a` and `img`** entirely (+ `unwrapDisallowed`), so model links/images can't inject at all —
  stronger than my spec (which relied on URL sanitization). The `<style>` is a static constant, not
  content. Browser evidence: `<img onerror>` / `[x](javascript:)` / `<script>` payload rendered
  inert (alert never fired; no img/script element; no `javascript:` anchor; layout intact).
- **Consistency + surgical:** both `AdvisorSection` (l.93) and `NoteSummarySection` (l.53) use the
  one `<Markdown>` component; only the `<Text pre-wrap>`→`<Markdown>` swap changed — loading, 502
  friendly error, no-notes, save-to-interactions, and the `provider·model` line are untouched.
- Markdown renders (`### Tone`→h3, `**Warm**`→strong, `- list`→li; no literal `**`); 502 regression
  verified; `bun run build` clean; `react-markdown@^10.1.0` committed. `TypographyStylesProvider`
  swapped for a scoped `.mg-md` block (Mantine 9 removed it) — my SPEC allowed either.

DoD: all 6 met. **This is the only task of SPEC-004 — REQ-004 complete.**
