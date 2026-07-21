# TASK-002: Auth middleware, wiring, generic 401, attribution log, docs

- Source: SPEC-001
- Status: DONE
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

### Gap now closed — real 200 end-to-end trace (2026-07-21, `.env` keys SET)
Re-ran with the human-populated `.env` (confirmed all four provider keys read SET,
presence only — values never printed). Valid enabled key (`project-alpha`) on
`POST /chat`, explicit provider + tiny prompt (one smoke call per provider):

```
POST /chat  (Authorization: Bearer <project-alpha enabled key>)
body: {"provider":"gemini","tier":"small","max_tokens":16,
       "messages":[{"role":"user","content":"Reply: hello"}]}

HTTP 200
{"success":true,"data":{"provider":"gemini","model":"gemini-2.5-flash-lite",
 "content":"Hi there! How can I help you today?",
 "usage":{"prompt_tokens":4,"completion_tokens":10,"total_tokens":14},
 "latency_ms":1757}}

server log (exactly one attribution line, no key value):
[auth] project=project-alpha POST /chat
```

- Success envelope `{success:true,data:AIResponse}` is **unchanged** — auth is
  transparent on the happy path (`c.set("project")` + `await next()` don't alter
  the response). Confirmed on **three** providers independently: `gemini` (above),
  `deepseek`, and `xai` all returned `200 {"success":true,...}`, each preceded by
  its own single `[auth] project=project-alpha POST /chat` line.
- Note: the `openai` endpoint specifically returned a connect error in this
  environment (network/endpoint, **not** auth — the `[auth]` line still logged and
  control still reached the handler). Since gemini/deepseek/xai prove the 200 path,
  this doesn't affect the auth verification; flagging it only for transparency.
- No key value appears in any 200 body or log line. `git check-ignore api-keys.json`
  still passes; `bunx tsc --noEmit` still clean in `src/**`.

Status flipped REWORK → **REVIEW**: the only outstanding item (the real 200 trace)
is now attached, per Sober's answer in Questions.

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

  > answer (Sober, 2026-07-21): The key request is resolved — Porter relayed that
  > the human has populated the repo `.env`; I confirmed all four provider keys
  > (`OPENAI/GEMINI/XAI/DEEPSEEK_API_KEY`) now read as SET (checked by presence
  > only, values never printed). Please **run the real end-to-end trace** — it's
  > worth doing, not ceremony: it proves the auth change doesn't break the happy
  > path (that `c.set("project")` + `await next()` still yield an unmodified
  > `{success:true,data:...}` 200). Prefer `bun run demo`/a single Bruno call to
  > keep provider spend to one smoke call. Paste the 200 body + the matching
  > `[auth] project=... POST /chat` line into Implementation Notes, then flip back
  > to REVIEW. See Review below — this is the *only* thing outstanding.

## Review

**Verdict: code APPROVED; one verification step remains → status REWORK
(verification-only, NOT a code change).** 2026-07-21, Sober.

I reviewed the real code (`src/auth/authMiddleware.ts`, `src/index.ts`) against
SPEC-001, not just the diff. **The implementation is correct and I am not asking
for any code change.**

- **Auth logic meets spec.** Bearer scheme case-insensitive; missing/malformed/
  empty-token → 401; unknown and disabled → the *same* 401 body (no
  unknown-vs-disabled leak); success sets `project`, logs exactly one
  `[auth] project=… METHOD path` line, never logs the token. Middleware typed via
  its own `Variables` generic — minimal, `index.ts` stays clean. Good call.
- **Wiring is correct and the critical security point holds.** `app.use("/chat/*",
  authMiddleware)` sits before `app.route`, and your live test confirms the
  wildcard also covers bare `POST /chat` (returns 401 pre-provider) — that was the
  one thing that had to be true, and you verified it empirically. Info endpoints
  correctly left open per SPEC.
- **No regressions / no leaks.** Success response shape untouched; provider logic
  and tiers untouched; Hono `logger()` logs method/path/status only (no header),
  so it can't leak the token. `api-keys.json` stays gitignored.
- **All 401-path ACs verified** by your live run (no/malformed/unknown/disabled →
  identical body; isolation between projects; GET info endpoints still 200).

**Why not DONE yet:** the DoD's "valid enabled key → 200 `{success:true,data:...}`
end-to-end" is still unproven — earlier only because `.env` was empty. That's now
fixed (keys SET), and the human explicitly asked for the re-run. Marking DONE
without that evidence would violate our evidence-before-completion rule, so I'm
sending it back for the single trace only (see my answer in Questions). Expect to
flip straight to DONE once the 200 trace is attached — no code rework anticipated.

---

**Verdict: DONE** — 2026-07-21, Sober (2nd pass, after the real 200 trace).

The one outstanding item is now closed. Reviewed the attached trace: valid enabled
key → **HTTP 200 `{success:true,data:AIResponse}`** with exactly one
`[auth] project=project-alpha POST /chat` line and no key value, confirmed
independently on **three** providers (gemini/deepseek/xai). Success envelope
unchanged — auth is transparent on the happy path (`c.set` + `await next()` don't
touch the response). The `openai` connect error is an environment network/endpoint
issue, **not** auth (the `[auth]` line still logged and control still reached the
handler) — the other three providers fully prove the 200 path, so it doesn't affect
this verdict. All 401 paths, isolation, and open info-endpoints were already
verified in pass 1. `api-keys.json` still gitignored, `tsc` clean.

TASK-002 meets SPEC-001 and its DoD in full. **DONE.** With TASK-001 also DONE,
every SPEC-001 task is complete → REQ-001 → SPEC_DONE (see board + log to Porter).
