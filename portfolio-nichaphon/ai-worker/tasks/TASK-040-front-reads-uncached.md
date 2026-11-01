# TASK-040: Public pages read `back/` uncached — a Save shows on the very next visit
- Source: SPEC-010 D4 (amended 2026-11-01 — REQ-010 R4 "within one minute", AC-b)
- Status: TODO (2026-11-01, Sober) — after TASK-037
- Depends on: TASK-036 `DONE` (met)
- Owner: Fern (FE)

**Zero real calls. No git write. One file: `front/src/lib/content.ts`.**

## Why

TASK-036 rework 1 measured the `/blog` list changing **67 s** after a Save. The cause is my D4: `revalidate: 60` is
stale-while-revalidate — the first visit after the 60 s window still gets the old copy, so a single visitor can see old content
for 60 s *plus the time until someone visits again*. R4 promises one minute; only an uncached read guarantees it. Cost: one local
request from the front to `back/` (SQLite) per page render — trivial for this site. Trade-off, accepted `[SA-decided]`: with
`back/` down, pages show the unavailable state at once instead of an old copy (this reverses TASK-033 FQ55c; SPEC-010 D4 updated).

## What to do

1. `read()`'s default becomes `{ cache: 'no-store' }`; drop the now-unused option path if nothing else passes one (`getPost` then needs
   no special case — remove it, keep the doc note's reason in the header).
2. Header comment (line ~8): say every read is uncached and why (R4: a Save shows on the next visit), pointing at SPEC-010 D4.

## Definition of Done

- [ ] 1. `front npx tsc --noEmit` → 0; `npm run build` → exit 0 with `back/` **not** running (every route still `ƒ`).
- [ ] 2. Seeded scratch store + admin back + built front: warm `/`, `/about`, `/blog` (3 loads each). Save `site.availability`, one certificate,
      and publish a new post. **One** request to each page right after each Save → the change is there on that first request. Paste timestamps.
- [ ] 3. Stop `back/` → `/about` shows the unavailable state on the next load (picture).
- [ ] 4. `git status --short` shows only the expected set; zero real calls; servers stopped; scratch deleted.

## Implementation Notes
(Fern fills this in.)

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review
(Sober fills this in at REVIEW: verdict + reasons.)
