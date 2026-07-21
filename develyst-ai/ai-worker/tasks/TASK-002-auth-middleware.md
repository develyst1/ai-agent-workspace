# TASK-002: Auth middleware, wiring, generic 401, attribution log, docs

- Source: SPEC-001
- Status: REVIEW
- Depends on: TASK-001

## What to do

Wire the key store from TASK-001 into request handling as a Hono middleware.

1. **`src/auth/authMiddleware.ts`** — new file. Export a Hono middleware handler:
   - Read the `Authorization` header. Accept only `Bearer <token>` (trim, split
     on the first space, case-insensitive scheme). Missing/malformed → respond
     `c.json({ success: false, error: "unauthorized" }, 401)`.
   - `const project = lookupProject(token)`. If `null` → same 401 body (do NOT
     reveal unknown-vs-disabled).
   - On success: `c.set("project", project)`, log exactly one line
     `console.log(\`[auth] project=${project} ${c.req.method} ${c.req.path}\`)`,
     then `await next()`.
   - Never log the token.
2. **Wire it in `src/index.ts`** — apply the middleware to the AI routes only,
   BEFORE the route is handled. Use `app.use("/chat/*", authMiddleware)` placed
   after the existing `logger()`/`cors()` and before/around `app.route("/chat", chat)`.
   Leave `GET /`, `/models`, `/tiers` unprotected (per SPEC-001).
3. **Context typing:** so `c.set("project", ...)` type-checks, declare the Hono
   `Variables` generic (e.g. `new Hono<{ Variables: { project: string } }>()`)
   where needed, or use a shared typed `Hono` instance. Keep it minimal — do not
   refactor unrelated code.
4. **Docs & Bruno:**
   - Update the repo `README.md` and `CLAUDE.md` with a short "Authentication"
     note: every `/chat*` call needs `Authorization: Bearer <project-key>`; keys
     live in gitignored `api-keys.json` (shape in `api-keys.example.json`);
     revoke by setting `disabled: true` or removing the entry (hot-reloaded).
   - Update the Bruno requests in `bruno/` that hit `/chat` and `/chat/multi` to
     send an `Authorization: Bearer {{apiKey}}` header, and add an `apiKey`
     variable to the `local` Bruno environment (dummy value, real one supplied
     locally by the human).
   - Add `.env` / docs note only if needed; no new `.env` var is required by this
     design (keys are in `api-keys.json`, not `.env`).

Surgical changes only — do not alter provider logic, model tiers, or the success
response shape.

## Definition of Done

- [ ] `bun run dev` starts; then, against `http://localhost:<PORT>`:
  - [ ] `curl -s -X POST .../chat -H 'Content-Type: application/json' -d '{"messages":[{"role":"user","content":"hi"}]}'`
        (no auth header) → HTTP 401, body `{"success":false,"error":"unauthorized"}`,
        and **no provider was called** (no provider latency/usage in logs).
  - [ ] Same request with `-H 'Authorization: Bearer <valid-enabled-key>'` → 200,
        `{ success: true, data: ... }`, and server logs `[auth] project=<name> POST /chat`.
  - [ ] Same request with a **disabled** key → 401 identical body; a different
        project's enabled key still returns 200 (revoke isolation).
  - [ ] Unknown/garbage key → 401 identical body (indistinguishable from disabled).
  - [ ] `/chat/multi` behaves the same (401 without a valid key, 200 + one
        attribution line with a valid key).
- [ ] `GET /`, `/models`, `/tiers` still work without any auth header.
- [ ] `git check-ignore api-keys.json` still passes (no real keys committed).
- [ ] `bunx tsc --noEmit` reports no new errors.
- [ ] No key value appears in any log line or response.

## Implementation Notes

### Files changed
- **`src/auth/authMiddleware.ts`** (new) — exports `authMiddleware`, a typed Hono
  `MiddlewareHandler<{ Variables: { project: string } }>`. Reads `Authorization`,
  trims, splits on first space, case-insensitive `bearer` scheme; missing/malformed
  or empty token → `c.json({ success:false, error:"unauthorized" }, 401)`.
  `lookupProject(token)` `null` → same 401 (no unknown-vs-disabled leak). Success →
  `c.set("project", project)`, logs exactly `[auth] project=${project} ${method} ${path}`,
  then `await next()`. Token value is never logged.
- **`src/index.ts`** — added `import { authMiddleware }` and
  `app.use("/chat/*", authMiddleware)`, placed after `logger()`/`cors()` and before
  `app.route("/chat", chat)`. `GET /`, `/models`, `/tiers` left unprotected. No other
  code touched (provider logic / tiers / success shape unchanged).
- **`README.md`** — added an "Authentication" section (Bearer header, gitignored
  `api-keys.json`, revoke via `disabled:true`/removal + hot-reload, fail-closed).
- **`CLAUDE.md`** (repo) — added an "Authentication" subsection + the two
  `src/auth/*` files to the Key files table.
- **Bruno** — added `headers { Authorization: Bearer {{apiKey}} }` to all six
  `/chat` + `/chat/multi` requests (Default, DeepSeek, Gemini, OpenAI, xAI, Multi);
  added `apiKey: dvl_local_dummy_key_replace_me` to `bruno/environments/local.bru`
  (dummy — human swaps in a real key locally, same as `baseUrl`).

No new `.env` var required (keys live in `api-keys.json`, per SPEC-001).

### Verification (live, `bun run src/index.ts` on :3009, keys from local `api-keys.json`)
- bare `POST /chat`, no auth → **401** `{"success":false,"error":"unauthorized"}` ✅
  (confirms Hono `/chat/*` also matches the bare `/chat` — I checked this
  explicitly since I wasn't sure it would).
- `POST /chat/multi`, no auth → **401**, identical body ✅
- disabled key (`project-beta`) → **401** ✅ ; unknown/garbage key → **401** ✅ ;
  malformed header (no `Bearer`) → **401** ✅ — all identical bodies.
- valid **enabled** key (`project-alpha`) → passes auth, sets project, and server
  logs exactly `[auth] project=project-alpha POST /chat` (**no key value**), request
  reaches the unchanged handler ✅.
- `GET /`, `/models`, `/tiers` → **200** without any auth header ✅.
- Server re-boots cleanly after all edits ✅. `git status` → `api-keys.json` absent;
  `git check-ignore api-keys.json` prints the path ✅. `bunx tsc --noEmit` → no
  errors in `src/**` (only pre-existing `bun-types/ffi.d.ts` lib noise).

### One evidence gap — needs your call (see Questions)
The DoD's "valid key → **200 `{success:true,data:...}`**" cannot be shown
end-to-end locally: **all four provider keys in `.env` are empty**, so a valid
request passes auth and then 500s at the provider layer
(`OPENAI_API_KEY is not set`). Auth is proven transparent up to the handler (the
`[auth]` line prints and control reaches the route unchanged; I touched neither
the handler nor the success shape), but the final provider 200 needs a working key.

### Notes for review
- Surgical: only `index.ts` changed in `src` besides the new middleware file.
  Response shape, provider logic, and model tiers untouched.
- Typed the middleware's `Variables` on the handler itself (minimal) rather than
  retyping the whole `Hono` instance in `index.ts` — `c.set("project", ...)`
  type-checks and `index.ts` stays clean. Say if you'd prefer a shared typed
  `Hono<{ Variables }>` instance instead.

## Questions

(Jason asks; Sober answers as `> answer: ...`)

- **DATA REQUEST (non-blocking for auth review):** to demonstrate the DoD's
  "valid enabled key → 200 `{success:true,data:...}`" end-to-end, the local `.env`
  needs at least one working provider key — currently `OPENAI_API_KEY`,
  `GEMINI_API_KEY`, `XAI_API_KEY`, `DEEPSEEK_API_KEY` are all empty, so a valid
  authed request 500s at the provider layer. The auth logic itself is fully
  verified (all 401 paths + the `[auth]` attribution line on the success path).
  @Sober: do you want to route this key request to Porter → human so I can attach
  a true 200 trace, or is the "auth transparent up to the handler" evidence enough
  to review against? I did **not** mark the task BLOCKED, since nothing in the auth
  code is waiting on it — only the one end-to-end screenshot is.

## Review

(Sober fills this in at REVIEW: verdict + reasons.)
