# TASK-015: Note-summary UI (OPTIONAL — "may also")
- Source: SPEC-003
- Status: DONE
- Assignee: Fern (FE)
- Depends on: TASK-013 (summary endpoint), TASK-014 (advisor panel pattern)

## What to do
In `manager-gold-front`, on the person profile page, add a small "Summarize notes" action near the
Notes/profile: on click → `POST /api/people/:id/summary` (add `getSummary` to `lib/people.ts`) →
render the returned summary text with a loading state; `502`/failure → the same friendly
"AI unavailable" message as TASK-014; if the person has no notes the backend returns 400 → show
"Add some notes first."

Optional "may also" tier — build only if TASK-013 is in and the deadline allows.

## Definition of Done
- [x] Clicking "Summarize notes" renders the returned text; loading state wired (`Button loading`).
      Verified vs the real backend → local stub (Alice/has-notes → 200 card + `stub · stub-1`).
- [x] No-notes → "Add some notes first." (NoNotes Ned → backend 400); simulated `502` (stub killed)
      → friendly "AI service is unavailable…", page intact (no crash), console clean. Verified.
- [x] `bun run build` clean. Walkthrough below.

## Implementation Notes
Implemented by Fern, 2026-07-28 in `manager-gold-front` (branch `dong`, commit `bb2e74d`).

**Files (new unless noted):**
- `lib/people.ts` (mod) — `getSummary(id)` → `POST /api/people/:id/summary` (no body). Typed
  `SummaryResult`: `{ok,summary}` on 200; failure `{ok:false, kind:"unavailable"|"no_notes"|"error", message}`
  (`502`→unavailable, `400`→no_notes). `Summary` = same shape as `Advice`.
- `components/NoteSummarySection.tsx` — "Summarize notes" button → `getSummary`; loading; renders
  `summary.content` (**same pre-wrap style as the advisor card**, per Sober — no markdown rendering)
  with `provider·model` dimmed; no-notes → "Add some notes first." (yellow); 502/failure → the shared
  friendly "AI service is unavailable right now — please try again." (red).
- `app/people/[id]/page.tsx` (mod) — renders `<NoteSummarySection>` just below the fields card.

**Verification (evidence) — my own backend on :4020 pointed at a local stub :4099 + real browser (§7):**
- Backend→stub confirmed; API-level: Alice(has notes)→200, NoNotes Ned→400.
- Browser: Alice profile → "Summarize notes" → **summary card** rendered (content + `stub · stub-1`),
  console clean.
- No-notes person → "Summarize notes" → **"Add some notes first."** (no card).
- Killed the stub → summary endpoint `502` → clicking showed the **friendly unavailable error**,
  profile intact, **console clean**.
- `bun run build` clean. Ports free pre-launch (mine); stopped only my instances — all released.

**For Sober:** kept the card consistent with the advisor's pre-wrap style as you asked (no markdown).
This is the last task of SPEC-003's optional tier — with it, every SPEC-003 task is done.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review
**Verdict: DONE** — Sober, 2026-07-28 (commit `bb2e74d` on `dong`). Read `lib/people.ts`
(`getSummary`/`Summary`/`SummaryResult`), `components/NoteSummarySection.tsx`, and the page render:
- `getSummary` maps `502`→`kind:"unavailable"`, `400`→`kind:"no_notes"`, else `error` — matches the
  TASK-013 contract.
- `NoteSummarySection`: "Summarize notes" button + loading; renders `summary.content` in the **same
  pre-wrap style as the advisor card** (per my directive — no unilateral markdown change);
  `provider · model` dimmed; no-notes → "Add some notes first." (yellow); unavailable/error → the
  shared friendly red message. Rendered below the fields card.
- DoD all 3 met; stub-verified 200/400/502 + browser; build clean. Consistent with TASK-014.

Accepted. **This is the last task of SPEC-003's optional tier — every SPEC-003 task (012–015) is DONE.**
