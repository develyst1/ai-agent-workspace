# TASK-020: Restyle person profile + AI cards + states
- Source: SPEC-005
- Status: DONE
- Assignee: Fern (FE)
- Depends on: TASK-018 (theme + shell)

## What to do
Apply the TASK-018 theme to the profile area in `manager-gold-front` — restyle only, no behaviour change:
- **Person profile** (`/people/:id`): tidy the header (name/nickname + Back + Edit), the grouped
  **fields card**, and the three sections — **feelings** (current-sentiment badge + timeline),
  **interactions** (add form + list + delete), **tags** (`TagsInput` + save).
- **AI cards:** restyle the **Approach Advisor** panel and the **note-summary** panel consistently
  (topic input, buttons, the rendered `<Markdown>` card, `provider·model` line, Save-to-interactions).
  **Do not touch `components/Markdown.tsx` safety** (no `rehype-raw`, no `dangerouslySetInnerHTML`) —
  styling only; keep both AI cards looking like one family.
- **States:** loading spinners, the friendly 502 "AI unavailable", "add some notes first", the
  not-found state — all styled consistently. Polished in light + dark.

## Definition of Done
- [x] Profile (header + sentiment badge, fields card, feelings/interactions/tags), both AI cards, and
      states restyled — light + dark verified. **Both AI cards use one shared `AiResultCard`** → identical
      (same bg `rgb(248,249,250)` light / `rgb(59,59,59)` dark, same markdown + provider·model footer).
- [x] `components/Markdown.tsx` XSS safety unchanged (grep: **no** `rehype-raw`/`dangerouslySetInnerHTML`
      usage — only the safety comment; `react-markdown` still present). I did not touch the file.
- [x] Responsive at 375px: `scrollWidth == clientWidth`, no horizontal scroll (profile w/ both AI cards).
- [x] No regression — advice + summary render; **save-to-interactions** works ("Saved ✓" → "Advice:" in
      the log); feelings/interactions/tags sections + handlers unchanged (byte-identical logic).
- [x] `bun run build` clean. Browser walkthrough below.

## Implementation Notes
Implemented by Fern, 2026-07-29 in `manager-gold-front` (branch `dong`, commit `9298ae6`).
Restyle only — no behaviour/API changes; `Markdown.tsx` untouched (safety intact).

**Files:**
- `components/AiResultCard.tsx` (new) — the shared "AI result" card (safe `<Markdown>` + dimmed
  `provider·model` footer + optional action slot). **Both AI cards render through it → one family.**
- `components/AdvisorSection.tsx` + `components/NoteSummarySection.tsx` (mod) — render results via
  `AiResultCard` (advisor passes the Save-to-interactions button as the footer action). Same
  loading/502/no-notes/save logic.
- `app/people/[id]/page.tsx` (mod) — header shows the current-sentiment `Badge`; loader `Center`ed;
  the two AI cards grouped at the end (order only). Same handlers.
- `components/FeelingsSection.tsx` (mod) — sentiment color `green`→`teal` to match the list + header.

**Verification (evidence) — real browser on :3020 (§7, mock backend for a pure-visual task):**
- Profile `/people/p1`: 6 section cards; header sentiment `Badge`; feelings ("Current: positive"),
  interaction ("Kickoff"), tags ("vip") all shown.
- AI cards: generated **advice** + **summary** → **two `AiResultCard`s, identical** (same bg, markdown
  `<strong>`, `stub · stub-1` footer). **Dark:** AI card `rgb(59,59,59)` + text `rgb(201,201,201)` (legible).
- **Save-to-interactions** (restyled advisor): "Saved ✓" → "Advice:" appears in the Interactions log.
- Not-found `/people/does-not-exist`: friendly "Person not found" + Back link, no crash.
- Mobile 375: `scrollWidth == clientWidth`, no h-scroll. `bun run build` clean. Only console msg is the
  known ColorSchemeScript dev warning (TASK-018). Ports freed.

**Note:** verified against a throwaway mock backend (auth + people + advice/summary) — same as TASK-019,
since the real backend is now on Postgres (TASK-017) and not a one-command run here. Pure-visual change;
a real-API reconfirm is trivial once a runnable local-PG backend is standard. This is the last REQ-005
engineering task (criterion 5 = stakeholder visual sign-off via Porter).

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review
**Verdict: DONE** — Sober, 2026-07-29 (commit `9298ae6` on `dong`). Read `AiResultCard.tsx` (new),
`AdvisorSection.tsx`, and grepped the repo:
- **XSS-safety preserved:** `AiResultCard` renders through the same safe `<Markdown>` component —
  no `dangerouslySetInnerHTML`/`rehype-raw` anywhere (grep = only the Markdown.tsx comment).
  `Markdown.tsx` untouched.
- **Consistency locked in:** both AI cards now render via the one `AiResultCard` → guaranteed identical
  (fixes the earlier consistency concern structurally, not just by eye).
- **Restyle-only, no regression:** `AdvisorSection` run/save/error logic is byte-identical (advice,
  `unavailable`→friendly message, save-to-interactions via the `action` slot). Profile page/sections
  keep their handlers; `FeelingsSection` green→teal is a cosmetic color match. "Saved to interactions ✓"
  → "Saved ✓" is a harmless wording trim.
- Responsive 375px + light/dark verified; build clean; mock-backend verification accepted (pure-visual).

DoD: all 5 met. **Last engineering task of SPEC-005 — REQ-005 criteria 1–4 complete.**
