# TASK-008: Align server default port to 3009

- Source: SPEC-005
- Status: DONE
- Depends on: none

## What to do

Make **3009** the consistent default port everywhere in the repo. Port-value
alignment only — do not touch auth, providers, or web-search logic.

1. **`src/index.ts`** — change `Number(process.env.PORT) || 3002` → `|| 3009`.
2. **`.env.example`** — `PORT=3002` → `PORT=3009`.
3. **`README.md`** — update every `3002` (overview/quickstart `curl`/the "Port"
   note) → `3009`.
4. **`docs/consumer-guide.md`** — update the base-URL line and every `curl`
   example `localhost:3002` → `localhost:3009`.
5. **`CLAUDE.md`** (repo) — update the PORT row to state the default is **3009**
   (drop the 3002 wording added under REQ-004).
6. **Bruno** — confirm `bruno/environments/local.bru` `baseUrl` is `:3009` (leave
   if already correct); check `production.bru`/others for stray `3002`.
7. **Sweep:** `grep -rn "3002"` across the repo (excluding `node_modules`) and
   align any remaining in-repo reference. There should be no lingering `3002`.

## Definition of Done

- [ ] With no `PORT` in `.env`, `bun run dev` logs/serves on **3009**
      (temporarily rename/unset `PORT` to prove the *default*, since the local
      `.env` also sets 3009). Paste the startup line / a `curl :3009` 200.
- [ ] `.env.example` shows `PORT=3009`.
- [ ] `grep -rn "3002" .` (excluding `node_modules`) returns **no in-repo hits**
      (docs, code, Bruno all say 3009). Paste the grep result.
- [ ] A docs quickstart example runs against `:3009` and returns `200` (authed
      `/chat` with a valid project key). Paste the (key-free) output.
- [ ] `bunx tsc --noEmit` — no new errors.
- [ ] No auth/provider/web-search code changed; no secret values anywhere.

## Implementation Notes

### Files changed (port value only — no logic touched)
- **`src/index.ts`** — `Number(process.env.PORT) || 3002` → `|| 3009`.
- **`.env.example`** — `PORT=3002` → `PORT=3009`.
- **`README.md`** — all `3002` → `3009` (overview/quickstart note, quickstart
  `curl`, the "Port" note).
- **`docs/consumer-guide.md`** — base-URL line + every `curl` example
  `localhost:3002` → `localhost:3009`.
- **`CLAUDE.md`** — PORT row rewritten to `default **3009**` (dropped the 3002
  wording added under REQ-004; now matches code).
- **Bruno** — `bruno/environments/local.bru` already `:3009` (left as-is);
  `production.bru` has no `3002`.
- No auth/provider/web-search code touched.

### Verification
- **No lingering 3002:** `grep -rn "3002" . --exclude-dir=node_modules
  --exclude-dir=dist` → **no hits** ✅ (`dist/` is a gitignored build artifact;
  its minified copy isn't a source reference).
- **Code default is 3009:** ran `src/index.ts` from `/tmp` (no `.env` loaded, so
  `PORT` is unset) → startup line **`🚀 AI Develyst server running on
  http://localhost:3009`** — proves the `|| 3009` fallback, independent of the
  local `.env`. ✅
- **Authed quickstart on :3009:** `POST /chat` (valid key, gemini) →
  `200 {"success":true,"data":{"provider":"gemini","model":"gemini-2.5-flash-lite",
  "content":"Hello there, friend!",…,"latency_ms":1594}}` ✅
- `bunx tsc --noEmit` → no errors in `src/**` ✅. No secret values anywhere.

## Questions

(Jason asks; Sober answers as `> answer: ...`)

## Review

**Verdict: DONE** — 2026-07-21, Sober.

Verified independently: `src/index.ts` line 47 is `Number(process.env.PORT) || 3009`;
a repo-wide `grep` (ts/md/json/bru/example, excl. node_modules) returns **no 3002**;
Jason proved the *default* by running with `PORT` unset → startup on `:3009`, and an
authed `/chat` on `:3009` → 200. `.env.example`/README/consumer-guide/CLAUDE.md all
3009. No logic touched, tsc clean, no secrets. Meets SPEC-005 → REQ-005 SPEC_DONE.
