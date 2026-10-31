# TASK-133: blueprint-front — an `api` part whose path is a full URL renders readably in the 4 themes (REQ-114)
- Source: SPEC-111 (Consumers)
- Owner: FE (Fern)
- Status: DONE — released 2026-10-30 09:3x (TASK-132 DONE)
- Depends on: TASK-132 DONE · REQ-110 committed (**b041cbd** ✓, blueprint-front `atom`, 2026-10-30 08:5x)

## What to do
After SPEC-111, an `api` part's `path` may be `http://127.0.0.1:4200/health`. The front prints `path` as text, so **no code change is expected**. Check it on the real page.
1. Run the stack the way TASK-127 did (stub back, `pglite:memory`). Create a project holding one API part with `method GET` and `path http://127.0.0.1:4500/health`, plus one with a long URL (≥ 80 characters, e.g. `https://status.example-company.internal/services/blueprint-api/v1/health?verbose=true`).
2. Open the API page in default, clean-blue, luxury-gold and minimal-mono at 1280 px and 390 px. The whole URL must be readable: no clipping, no horizontal page scroll. Take 8 screenshots into `tests/harness/task-133/`.
3. **Only if** a theme clips or overflows: add `overflow-wrap: anywhere` to that theme's existing path rule (`clean-blue` `.path`, `minimal-mono` `.path`, `luxury-gold` `.lg-path`, default `<code>` in `pages.tsx:304`'s stylesheet) and nothing else. Say which ones.

Closed file list: none expected. Only if step 3 applies: the path rule of the theme(s) that overflow. No git.

## Definition of Done
- [ ] 1. 8 screenshots (4 themes × 2 widths), each showing the full URL (base: n/a — new: no API part with a URL path can be stored before TASK-132)
- [ ] 2. `document.documentElement.scrollWidth <= innerWidth` at 390 px on the 4 API pages → true (base: n/a — new, same reason)
- [ ] 3. `bun run typecheck` → exit 0 · `bun test src` → 0 fail (base: exit 0 · `235 pass / 0 fail`, Sober 00:4x, TASK-131 § Review)
- [ ] 4. `git status --short` → the tree as left by REQ-110's commit, plus only the step-3 CSS lines if any (base: n/a — new: depends on that commit)

## Implementation Notes
Fern, 2026-10-30 ~09:5x. `blueprint-front`, branch `atom`, HEAD `b041cbd`; `git status --short` before and after: empty. **No product code changed — step 3 did not apply.** No git write run.

**Run (steps 1–2):** back end from blueprint-back's working tree (`DATABASE_URL=pglite:memory CAW_NOTIFY_URL= PORT=4299`, no gateway, `BLUEPRINT_GATEWAY_LIVE` unset); front = existing `.next` build, `bun run start -- -p 3101` with `BLUEPRINT_API_URL=http://127.0.0.1:4299`. Script `tests/harness/walk-133.ts` stores, per theme, two api parts through `POST /v1/projects/{id}/change-sets` (cause `operator`): `GET http://127.0.0.1:4500/health` and `GET https://status.example-company.internal/services/blueprint-api/v1/health?verbose=true` (84 chars). All 4 change-sets → `201` (`API-001`, `API-002`).

**DoD:**
- 1. 8 screenshots in `tests/harness/task-133/<theme>-<1280|390>-api-url.png` (default, clean-blue, luxury-gold, minimal-mono). I opened `luxury-gold-390` and `minimal-mono-390` and read them: the long URL wraps onto 2–4 lines and ends `…health?verbose=true`, nothing cut. The other 6 are checked by the DOM measurements below, not read by eye — UNVERIFIED by eye: open any of them to settle it. ✓
- 2. `scrollWidth <= innerWidth` on all 8 pages (1280/1280 and 390/390 in every theme), run output `ALL OK: true`. Both URLs present in the page text in all 8; each URL's `<code>` box right edge ≤ viewport (largest at 390: 349 of 390), no ellipsis, no `overflow` set. ✓
- 3. `bun run typecheck` → exit 0 · `bun test src` → `235 pass / 0 fail`, `Ran 235 tests across 10 files. [6.26s]` ✓
- 4. `git status --short` → empty (the tree as left by `b041cbd`; no step-3 CSS) ✓

**Footprint:** projects `url default|clean-blue|luxury-gold|minimal-mono` exist only in the in-memory pglite DB, gone with the back end. My back end (pid 368613, :4299) and front (pid 368621, :3101) stopped by pid; `ss -ltn` for 3100–3103 / 4290–4299 → no listeners. `/impeccable audit` not run: no CSS or layout change. Slip recorded: FAILURES F-032 (a `pkill -f` by name, refused by the hook, never ran).

## Questions

## Review
Sober (SA, A), 2026-10-30 09:5x — **DONE.** No product code changed (`git status` empty, as is right). I opened 2 of the 6 screenshots Fern had not read: `clean-blue-390` and `default-390` show both URLs whole. The 84-character one wraps over 3 lines and ends `…health?verbose=true`, with no clipping. The other 4 rest on Fern's DOM check (`scrollWidth <= innerWidth`, `ALL OK: true` on all 8) plus her own reading of `luxury-gold-390` and `minimal-mono-390`. typecheck 0 and 235/0 accepted from the evidence. F-032 noted (a hook-blocked `pkill`, nothing ran).
