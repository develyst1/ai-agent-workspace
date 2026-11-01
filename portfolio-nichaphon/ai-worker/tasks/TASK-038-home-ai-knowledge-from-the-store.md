# TASK-038: The Home AI reads its knowledge from the store, and refreshes on every Save
- Source: SPEC-010 D8 (REQ-010 R7, AC-e)
- Status: **DONE** (2026-11-01, Sober — see §Review. Was REVIEW 2026-11-01, Fern)
- Depends on: TASK-034 `DONE`
- Owner: Fern (FE)

**Zero real calls** (AC-e's real-gateway proof is QA's round, ledgered in SPEC-010 — TASK-039 was folded away 2026-11-01). No git write.

## What to do

1. **`back/src/knowledge/store.ts` (new)** — `knowledgeFromStore(db): Knowledge | null`: `projects` = `renderProjectsMd(<the
   projects document>)` (reuse the existing function — it already takes the list as a parameter), `profile` = `ai_profile.markdown`.
   Returns `null` when either document is missing (store not seeded).
2. **One live knowledge holder** — `back/src/knowledge/current.ts` (new): `getKnowledge()` / `setKnowledge(k)`. At start:
   store seeded → `knowledgeFromStore`; else → today's `loadKnowledge()` from files (so an unseeded checkout behaves exactly as
   today). `index.ts` and `ws.ts` read `getKnowledge()` **per question** (today they capture one object at start — change the
   capture, not the chain). `/health.knowledge` gains `"source": "store" | "files"`.
3. **Refresh on Save** — the `onSaved(key)` passed to `registerAdmin` rebuilds and sets knowledge when `key` is `projects` or
   `ai_profile`. A rebuild failure keeps the previous knowledge and logs `[knowledge] refresh failed key=<k>` (no content).
4. **Tests** (`back/test/knowledge-store.test.ts`): (a) seeded store → `knowledgeFromStore` texts equal today's files'
   texts byte-for-byte **after** normalising line endings (the seed's PROJECTS render = `PROJECTS.md`; `ai_profile` = `PROFILE.md`);
   (b) unseeded → `source: "files"`; (c) admin PUT of `projects` with one project title changed → the next chain run (injected
   `deps.ask`) gets that new title in its step-2 user message; PUT of `copy` → knowledge object unchanged (same reference);
   (d) the chain test suite still green with `getKnowledge()`.

Do NOT touch: prompts, parse, the chain's steps, `back/knowledge/*.md` (they stay as seed inputs / the unseeded fallback), front.

## Definition of Done

- [ ] 1. `bun test` before/after summaries; all green. `bunx tsc --noEmit` → 0.
- [ ] 2. Seeded scratch store, `ADMIN_ENABLED=1`, stub gateway on 3999: `/health` shows `source:"store"`; PUT `projects` with a test title
      appended to one project's `highlights`; then `ASK_WS_URL=… bun run ws-client "stub:none what projects?"` → frames end `done`
      (stub ⇒ zero real calls). Paste the `/health` line and the `[admin] put … ok` line.
- [ ] 3. Unseeded (empty `DATA_DIR`) start → `/health` `source:"files"`, Home AI still answers on the stub.
- [ ] 4. `git status --short`; zero real calls; servers stopped; scratch deleted.

## Implementation Notes
(Fern, 2026-11-01.) Built on TASK-034 `DONE`. **Zero real calls**: tests use an injected `deps.ask`, and the live runs pointed `GATEWAY_BASE_URL` at the stub on 3999. No git write.
Prompts, parse, the chain's steps, `back/knowledge/*.md` and the front were not touched.

**What changed**
- New `back/src/knowledge/store.ts`: `knowledgeFromStore(db)` → `{ profile: ai_profile.markdown, projects: renderProjectsMd(<projects document>), missing: [] }`, or `null` if either document is missing.
- New `back/src/knowledge/current.ts`: the one holder. `getKnowledge()`, `knowledgeSource()`, `setKnowledge()`, `initKnowledge(db | null)` (seeded store → `store`, else
  `loadKnowledge()` → `files`), and `refreshKnowledge(db, key)`, which keeps the previous knowledge and logs `[knowledge] refresh failed key=<k>` on any failure.
  If nothing has opened a store yet, the first `getKnowledge()` loads the files (same as the old read-at-import).
- `back/src/index.ts`: the read-once `export const knowledge = loadKnowledge()` is gone. `openAppStore` calls `initKnowledge(db)`; a failed open or `closeAppStore` calls `initKnowledge(null)`.
  New exported `onDocumentSaved(key)` is passed as `registerAdmin`'s `onSaved` and refreshes only for `projects` / `ai_profile`. `/health.knowledge` gains `source`. `/ws` passes `getKnowledge`.
- `back/src/ws.ts`: `wsEvents(c, getKnowledge: () => Knowledge)`, read **per question** at `runChain(…, { knowledge: getKnowledge(), id }, …)`. Only the capture changed, not the chain.
  As a consequence `back/test/ws.test.ts` changes one line (`wsEvents(c, () => loadKnowledge(FIXTURES))`).

**Decisions I took — accept or overrule**
1. The knowledge source is picked **when the store opens**, not at import: `index.ts` no longer reads the files at import. In production `openAppStore()` runs before `Bun.serve`, so the start-time behaviour is unchanged.
   The `[knowledge] missing …` warning now prints when the files are first read.
2. `src/knowledge/store.ts` imports `renderProjectsMd` from `back/scripts/build-projects-md.ts`, as the TASK says ("reuse the existing function"). As a side effect, that script's import of
   the frozen seed file now enters `src`'s module graph (and the compiled binary), which is harmless but adds weight. Moving `renderProjectsMd` into `src/` would avoid it; not done, since it is a file the TASK did not name.
3. `closeAppStore()` returns knowledge to the files. That keeps test files from leaking a deleted temp store's texts into each other.

**DoD evidence**
1. Before: `GATEWAY_BASE_URL=http://127.0.0.1:1 bun test` → `81 pass / 0 fail / 387 expect() calls / Ran 81 tests across 9 files`. After: **`85 pass / 0 fail / 403 expect() calls / Ran 85 tests across 10 files`**
   (+4 in `knowledge-store.test.ts`: (a) store texts = `PROJECTS.md` / `PROFILE.md` after LF-normalising, plus empty store → null · (b) seeded → `store`, empty `DATA_DIR` → `files`, `/health` both ways ·
   (c) PUT `projects` with a new title → the next `runChain` on `getKnowledge()` has `## <new title>` in its step-2 user message; PUT `copy` → `getKnowledge()` is the **same object** (`toBe`)).
   (d) Chain + ws suites green unchanged. `bunx tsc --noEmit` → 0.
2. Seeded scratch store, `ADMIN_ENABLED=1`, stub on 3999, `back/` on 4099:
   `/health` → `{"ok":true,"service":"portfolio-back","version":"0.1.0","knowledge":{"profile":true,"projects":true,"source":"store"},"store":{"documents":16,"posts":6}}`.
   PUT `projects` (`"TASK-038 test highlight"` appended to project 1's `highlights`) → 200, `[admin] put key=projects bytes=7429 ok`.
   `ws-client "stub:none what projects?"` → frames `accepted`, 6× `step`, `answer`, `done`; `[chain] … end coverage=none calls=3`. No `[knowledge] refresh failed` line.
3. Empty `DATA_DIR`, same stub: `/health` → `"knowledge":{"profile":true,"projects":true,"source":"files"},"store":{"documents":0,"posts":0}`.
   `ws-client "Which realtime work is listed?"` → `answer`, `coverage:"covered"`, `calls:3`, `done`.
4. `git status --short` (this TASK): ` M back/src/index.ts`, ` M back/src/ws.ts`, ` M back/test/ws.test.ts`, `?? back/src/knowledge/{current,store}.ts`, `?? back/test/knowledge-store.test.ts`.
   `back/knowledge/` is untouched. Zero real calls. Both scratch stores are deleted, and I stopped the stub and both `back/` runs (bun 30944, 31384, 14688); 3999/4099 are free.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review

**Verdict: DONE** (Sober, 2026-11-01). Zero real calls in review.
- Re-run: `GATEWAY_BASE_URL=http://127.0.0.1:1 bun test` → `85 pass / 0 fail / 403 expect() calls / Ran 85 tests across 10 files`;
  `bunx tsc --noEmit` → 0; `back/knowledge/` untouched (`git status` empty for it). Read `knowledge/current.ts` whole: one holder,
  store → files fallback, refresh keeps the old knowledge on failure with a content-free line.
- Test (c) is the AC-e mechanism on the stub: a Save of `projects` reaches the very next question's step-2 input; a Save of `copy` does
  not rebuild (same object). The real-gateway half of AC-e stays QA's.
- Your three calls — **accepted**: (1) source chosen when the store opens — same start-time behaviour in production; (2) importing
  `renderProjectsMd` from `scripts/` — checked: the script's write is under `import.meta.main`, so the import has no side effect; the
  frozen seed file riding into the binary is weight, not risk — moving the function into `src/` is a tidy-up for whenever deploy is
  designed (noted with SQ46), not now; (3) `closeAppStore()` back to files — right for test isolation.
