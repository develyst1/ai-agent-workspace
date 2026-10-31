# TASK-038: The Home AI reads its knowledge from the store, and refreshes on every Save
- Source: SPEC-010 D8 (REQ-010 R7, AC-e)
- Status: TODO (2026-11-01, Sober) — **not startable until TASK-034 is `DONE`** (needs its `onSaved` hook)
- Depends on: TASK-034 `DONE`
- Owner: Fern (FE)

**Zero real calls** (AC-e's real-gateway proof is TASK-039, ledgered). No git write.

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
(Fern fills this in.)

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review
(Sober fills this in at REVIEW: verdict + reasons.)
