# TASK-017: Front — config/env, no hidden fallbacks, the owner's pattern layout (no behaviour change)
- Source: SPEC-003 §Findings F1–F7, §Rule, §Environment keys, §Proof · DECISIONS 2026-11-09 14:59 · the `nextjs-heroui-pattern` skill §Folder Structure / §Data Flow / §Naming / §Key Rules (stay on the HeroUI **v3** API)
- Owner: FE (Fern)
- Status: DONE (2026-11-09, SA review; one AC-8 timing result carried to QA's regression with the stall detector). Earlier: REVIEW (Fern)
- Depends on: none (runs in parallel with TASK-016; the HTTP contract is untouched)
- Git: none by you.

## What to do
1. `src/config/env.server.ts` (server only): `BACK_ORIGIN` **required** (the proxy route answers `502 UPSTREAM_UNAVAILABLE` and logs once
   `BACK_ORIGIN is not set` if missing; never a hardcoded address), `API_PROXY_TIMEOUT_MS` (default 27000, validated). `src/config/env.client.ts`:
   `NEXT_PUBLIC_API_TIMEOUT_MS` (default 28000, build-time). No other file reads `process.env`.
2. Move `src/lib/limits.ts` → `src/config/limits.ts` (same values).
3. Split `src/lib/api.ts` per the skill's data flow: `src/lib/api/client.ts` (`call()` with its bounded timeout, unchanged logic),
   `src/lib/api/api-main.ts` (endpoint functions; SPEC-002 field names unchanged), `src/lib/api/errors.ts` (`ApiError`, `messageFor`,
   `aiMessageFor`, unchanged mappings), `src/lib/api/http-status.ts` (named statuses + helpers such as `isNotFound(err)`),
   `src/types/api/main/*.ts` (the shapes). An `index.ts` barrel in each new directory.
4. `src/hooks/common/useLoad.ts`: the repeated page-load pattern (load → data / missing / fatal; 401 already redirects). Use it in every page
   that repeats it today. Same visible behaviour.
5. Components: `src/components/partials/<Feature>/` (PascalCase dirs and files, `index.ts` barrels). `components/ui/` only if a thin HeroUI
   wrapper is actually reused. `@/` imports only, with no relative imports across features. Pages stay thin.
6. `.env.example`: `BACK_ORIGIN` (required), `API_PROXY_TIMEOUT_MS`, `NEXT_PUBLIC_API_TIMEOUT_MS`, each with one comment line and its default.
   **Not added:** NextAuth, axios, React Query (SPEC-003 §"Not taken from the skill").

## Definition of Done
- [ ] `task-007.mjs`, `task-008.mjs`, `task-009.mjs` against `back-pglite` + `gateway-stub` → all pass, same counts as before. Paste the summary lines.
- [ ] `bun run build` passes. `bunx tsc --noEmit` clean. The md5 of `src/strings.th.ts` is unchanged. Paste.
- [ ] `grep -rn "process.env" src | grep -v src/config/` → none · `grep -rn "127.0.0.1\|localhost" src` → none · `grep -rnE "=== (401|403|404|409|410)" src | grep -v http-status` → none. Paste.
- [ ] With `BACK_ORIGIN` unset, `curl -s localhost:4300/api/health` → `502 {"error":{"code":"UPSTREAM_UNAVAILABLE"}}`. Paste.
- [ ] `git status --short` + the new tree (`find src -type d`). Servers stopped by PID.

## Implementation Notes
**Fern, 2026-11-09.** Repo `god-plan-front`, branch `atom`, HEAD `a41cbd0` before and after (no git by me). No behaviour change intended; `src/strings.th.ts` md5 `e2bcebf3952fb7905ef2832424b2aaef` **before and after**.

**What changed, by TASK step**
1. **Config.** `src/config/env.server.ts` (server only): `BACK_ORIGIN` **required** (no default; trailing `/` trimmed), `API_PROXY_TIMEOUT_MS` (default 27000, must be a positive whole number or it throws naming the key), read at run time by `serverEnv()`. `src/config/env.client.ts`: `NEXT_PUBLIC_API_TIMEOUT_MS` (default 28000, build-time, validated the same way) exported as `API_TIMEOUT_MS`. `src/config/index.ts` is a browser-safe barrel (`LIMITS`, `API_TIMEOUT_MS`). The proxy route now reads only `serverEnv()` and `HTTP`: with `BACK_ORIGIN` unset it answers `502 {"error":{"code":"UPSTREAM_UNAVAILABLE"}}` and logs once `[api-proxy] BACK_ORIGIN is not set`.
2. **Limits** moved `src/lib/limits.ts` → `src/config/limits.ts` (same values).
3. **`src/lib/api.ts` split** (the file is gone): `lib/api/client.ts` (`call()`, logic unchanged, uses `API_TIMEOUT_MS` and a `SIGN_IN_PATH` constant), `lib/api/api-main.ts` (the `api` object, SPEC-002 names), `lib/api/errors.ts` (`ApiError`, `messageFor`, `aiMessageFor`, mappings unchanged), `lib/api/http-status.ts` (`HTTP` constants and `isNotFound / isForbidden / isConflict / isGone / isUnauthorized / isNotFoundOrForbidden / isLinkInvalid`), `lib/api/index.ts` barrel; shapes in `src/types/api/main/{user,project,task,comment,member,summary}.ts` + barrel.
4. **`src/hooks/common/useLoad.ts`**: the repeated load → data / missing / fatal pattern (a 401 is ignored because the client already redirects; options `isMissing` and `throwOnError`). Used by the projects list, the board, members, summary, invite, reset and the comment thread (which passes `throwOnError: false` so a failed comment load still leaves the page up, as before). `useMe` moved to `hooks/common/useMe.ts` unchanged. Barrel `hooks/common/index.ts`.
5. **Components** in the pattern layout: `components/ui/{Field,Status,NotFoundView}/` (thin shared pieces: the labelled input, the status chip + menu, the not-found view that three pages repeated) and `components/partials/{AppHeader,ProjectBoard,Thread,AiPanel,Members,Summary,Projects,SignIn,Invite,Reset}/` (PascalCase, `index.ts` in every directory). **Pages are thin**: each `app/**/page.tsx` is a 4-line server component that awaits `params` and renders its `*Content` partial. `@/` imports everywhere; the only relative imports are between files of the same partial (`./result`, `./TaskCard`, `./LinkBox`).
6. **`.env.example`**: `BACK_ORIGIN` (required), `API_PROXY_TIMEOUT_MS`, `NEXT_PUBLIC_API_TIMEOUT_MS`, each with a comment line, its default, and the timeout chain (25 < 27 < 28 < 30). **Not added:** NextAuth, axios, React Query.

**Small things you did not list, so you can veto them:** `README.md` updated (layout and the required key); `http-status.ts` also names `502/504/204/205/304`, which `route.ts` and `client.ts` now use instead of numbers; `useLoad` exposes `reload()` (the members page refetches after an invite is made, as before); the invite page's dead `?? S.linkUsed` after `messageFor` (which always returns a string) was dropped.

**Evidence (all run by me)**
- **Walks against a fresh `back-pglite` + `gateway-stub`, front under `next dev` with `BACK_ORIGIN` set:** `task-007.mjs` → **31/31 passed** · `task-008.mjs` → **31/31 passed** · `task-009.mjs` → **37/37 passed** (a clean re-run) and **37/37 passed** again (second re-run). The same counts as before the refactor.
- 🔴 **One failure, reported not hidden.** In the first chain run, `task-009.mjs` printed `FAIL AC-8: summary press with the gateway hanging → the AI error within 30 s — 48592 ms` (`36/37`). It did not repeat in two further fresh runs with `tests/harness/timer-stall-detector.mjs` beside them (37/37 both times). That detector logged two freezes of the machine (204 s and 162 s) during the re-runs, and TASK-014 found 15 such freezes in about 80 minutes, so I read the 48.6 s as a freeze, **but I had no detector running during that first run, so I cannot prove it.** If you want it settled, run `task-009.mjs` a few times with the detector beside it. (A second slip of mine in that chain, found and fixed: the walks' runner left each back's `bun` child alive after `kill`, so the next back could not bind 4310 and 008/009 ran against the previous run's data; the 37/37 re-runs were each on a freshly started back, checked by `ss` before the run.)
- `bunx tsc --noEmit` → `TSC_OK` (also after the build). `bun run build` → passes; routes `/ · /_not-found · /api/[...path] · /invite/[token] · /projects/[id] · /projects/[id]/members · /projects/[id]/summary · /reset/[token] · /sign-in`; `ls -l .next/standalone/server.js` → `6798 B`; `ls .next/standalone/.next/static` → `chunks  media  VaoMt31Da92LG8ugcVKTy`.
- **Greps, all clean:** `grep -rn "process.env" src | grep -v src/config/` → none · `grep -rn "127.0.0.1\|localhost" src` → none · `grep -rnE "=== (401|403|404|409|410)" src | grep -v http-status` → none (also no `status === <digit>` anywhere else) · `grep -rnP "[\x{0E00}-\x{0E7F}]" src --include=*.tsx` → none · `grep -rn dangerouslySetInnerHTML src` → none · no `#hex` in `src`.
- **`BACK_ORIGIN` unset** (front started with `env -u BACK_ORIGIN`): `curl -s -i localhost:4300/api/health` → `HTTP/1.1 502 Bad Gateway`, `content-type: application/json`, body `{"error":{"code":"UPSTREAM_UNAVAILABLE"}}`; after three calls the front log has `[api-proxy] BACK_ORIGIN is not set` **once** (`grep -c` → 1); the page `/sign-in` still serves 200.
- **Checksums:** `next.config.ts`, `package.json`, `error.tsx`, `globals.css`, `layout.tsx`, `not-found.tsx`, `format.ts` and `strings.th.ts` are byte-identical to before; every other `src` file is new, moved or rewritten (the list is in the new tree below). `git status --short` is the same list as before (` M README.md` + the untracked scaffold; the repo has no commits of its own to diff).
- **New tree** (`find src -type d`): `app, app/api/[...path], app/invite/[token], app/projects/[id], app/projects/[id]/members, app/projects/[id]/summary, app/reset/[token], app/sign-in, components, components/partials/{AiPanel,AppHeader,Invite,Members,ProjectBoard,Projects,Reset,SignIn,Summary,Thread}, components/ui/{Field,NotFoundView,Status}, config, hooks, hooks/common, lib, lib/api, types, types/api, types/api/main`.
- All my servers (the front, the back, the gateway stand-in, the stall detector) are stopped by pid; nothing listens on 4300, 4310 or 4399; `gateway-stub/mode.txt` is `ok`.

**Not done / UNVERIFIED**
- `src/lib/` has no `index.ts` of its own (it holds `format.ts` and the `api/` directory, which has its barrel); say if you want one.
- A bad `API_PROXY_TIMEOUT_MS` / `NEXT_PUBLIC_API_TIMEOUT_MS` (not a positive whole number) makes the config throw naming the key; I did not exercise that path in a running server.
- `components/ui/` only holds three pieces that are really reused; I did not create thin wrappers of single HeroUI components.
- `/impeccable`, real phone, keyboard pass: as before.

## Questions
- None.

## Review
**DONE — Sober (SA), 2026-11-09.** SPEC-003 F1–F7 are met. One timing result is carried to QA, not waved through.
- Re-ran myself: `bunx tsc --noEmit` → `TSC_OK` · `process.env` outside `src/config/` → 0 · `127.0.0.1|localhost` in `src` → 0 · raw `=== 401…410` outside
  `http-status` → 0 · `strings.th.ts` md5 `e2bcebf3…` (unchanged) · the new dirs `src/config/`, `src/lib/api/` (client, api-main, errors, http-status, index),
  `src/hooks/common/` exist.
- Accepted: walks 31/31 · 31/31 · 37/37 (×2) on a fresh real back + stub. `BACK_ORIGIN` unset → 502 `UPSTREAM_UNAVAILABLE` with one log line. The build. The
  checksums of the unchanged files. The thin pages + `partials/` + `ui/` layout. Your extras are accepted (README, more named statuses, `reload()`,
  dropping the dead fallback). No `lib/index.ts` is needed. Not wrapping single HeroUI components is right.
- 🔴 **Carried, not closed:** the one `task-009` AC-8 summary press at **48.6 s** in the first run (no detector then). Two re-runs with the detector were
  37/37, and the detector logged freezes of 204 s and 162 s in that window. A freeze is the likely reading, **but it is unproven.** The PM's QA
  regression on this tree must run AC-8 with `timer-stall-detector.mjs` beside it (Q-F6's method). A late AC-8 with the detector quiet reopens this TASK.
- Also good: you found and fixed your runner leaving `bun` children alive (stale data on 008/009), and re-ran on fresh backs. That's the right instinct.
