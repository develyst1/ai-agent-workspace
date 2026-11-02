# TASK-040: Public pages read `back/` uncached — a Save shows on the very next visit
- Source: SPEC-010 D4 (amended 2026-11-01 — REQ-010 R4 "within one minute", AC-b)
- Status: **DONE** (2026-11-01, Sober — see §Review. Was REVIEW 2026-11-01, Fern)
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
Fern, 2026-11-01. Repo `portfolio-nichaphon-web`, `D1` @ `b068fba` (uncommitted tree as found). No git write. **Zero real calls**
(back/'s gateway pointed at a closed port, 3998, for the whole run; no AI route touched).

**One file: `front/src/lib/content.ts`.** `read(path, allowNotFound)` always fetches with `{ cache: 'no-store' }`; the `init` parameter
is gone (nothing else passed one). `getPost` lost its special case and its FQ59 doc line; that reason now sits in the header, next to
R4 and the stale-while-revalidate explanation, pointing at SPEC-010 D4. `grep revalidate|no-store front/src`: the only other
`no-store` is the `/media` proxy (unchanged); no `revalidate` left anywhere.

**DoD 1.** `bunx --package typescript@5 tsc --noEmit` in `front/` → exit 0. `npm run build` with nothing on 4014 → exit 0, every route
`ƒ` (`/`, `/about`, `/blog`, `/blog/[slug]`, `/contact`, `/media/[file]`, `/portfolio`, `/services`), postbuild copy ran.
`front/.env.production` sets only `NEXT_PUBLIC_ASK_WS_URL`, so the built front read `http://localhost:4014` (the default).

**DoD 2** (seeded scratch store; back/ `ADMIN_ENABLED=1` on 4014; the built standalone front on 127.0.0.1:3072;
`tests/harness/task-040/run.mjs`; times UTC):
```
10:50:33.437–.701  warm /, /about, /blog × 3 each (25–70 ms per load)
10:50:33.727 save site.availability → 200 · 10:50:33.763 first GET / contains "Available from test MVXPLD9H": true
10:50:33.792 save certificates[0].title → 200 · 10:50:33.833 first GET /about contains "TEST certificate MVXPLD9H": true
10:50:33.846 save new published post → 201 · 10:50:33.868 first GET /blog contains "TEST post MVXPLD9H": true
RESULT 3/3 changes on the first request
```
**DoD 3.** back/ stopped at 17:50:45 local (= 10:50:45 UTC) → one headless load of `/about` at 10:50:47.919 UTC: HTTP 200, `main` text
"Content is unavailable right now." — picture `project-docs/fe-task040-2026-11-01/about-back-stopped-1280.png` (header and footer
still render; only the content area shows the unavailable state).

**DoD 4.** `git status --short front`: same set as before I started; `front/src/lib/content.ts` stays `??` (untracked since TASK-033),
nothing new. No `package-lock.json`, no `back/data/`. Ports 3072/4014/3998 free; scratch store (incl. the TEST post/cert/availability)
deleted with it.

**FE notes:** nothing internal needed deciding. The HTTP 200 on the unavailable page is how TASK-033 built it (the shell renders,
the content area says so); unchanged here, and I'm only reporting it.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review

**Verdict: DONE** (Sober, 2026-11-01). Zero real calls in review.
- Read `front/src/lib/content.ts`: `read()` always `{ cache: 'no-store' }`, `init` param gone, `getPost` special case gone, header states
  R4 + the stale-while-revalidate reason + FQ59, pointing at SPEC-010 D4. Contract met, one file.
- Re-run: `front bunx --package typescript@5 tsc --noEmit` → exit 0. `grep revalidate|no-store|force-dynamic front/src` → no
  `revalidate` anywhere; `no-store` only here and the `/media` proxy; every page + layout `force-dynamic` (TASK-033) — so nothing caches.
- DoD 2 accepted on your harness timestamps: 3/3 Saves visible on the first request after each (≤ 41 ms later). R4 now holds by
  construction, not by timing. DoD 3: unavailable state at once with `back/` stopped — the accepted trade-off.
- HTTP 200 on the unavailable page: noted, TASK-033's design, unchanged; not a defect for this TASK (QA may weigh it in the round).
- Build re-run not repeated by me (your `npm run build` exit 0 with nothing on 4014 accepted).
