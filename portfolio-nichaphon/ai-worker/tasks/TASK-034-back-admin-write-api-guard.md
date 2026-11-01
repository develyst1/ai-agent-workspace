# TASK-034: `back/` admin write API — flag + loopback guard, validated document/post writes, picture upload
- Source: SPEC-010 (D5, D6, D9; §API row 5)
- Status: **DONE** (2026-11-01, Sober — rework 1 verified live, see §Review. Was REVIEW (rework 1) 2026-11-01, Fern; REWORK 2026-11-01, Sober — contract defect)
- Depends on: TASK-032 `DONE`
- Owner: Fern (FE)

**Zero real calls** (no AI route here — that is TASK-037). No front change, no `admin/` app (TASK-035). No git write.

## Contract (this TASK owns it; the admin app is built on it)

Everything below exists **only** when `back/` starts with `ADMIN_ENABLED=1`; otherwise none of it is registered (404).
Every route passes `requireAdmin(c)` first.

- **`requireAdmin(c)`** in `back/src/admin/guard.ts`: allowed iff `getConnInfo(c).remote.address` is loopback
  (`127.0.0.1`, `::1`, `::ffff:127.0.0.1`); else `403 { "error": "admin_local_only" }`. Export the pure `isLoopback(address)`.
  One comment line: *"Q2 (login) replaces this function — SPEC-010 D5."*
- **CORS for the admin app only:** on `/admin/api/*`, allow exactly origin `ADMIN_ORIGIN` (new env, default `http://localhost:4015`),
  methods `GET, PUT, POST, DELETE`, header `content-type`. No other path gets CORS headers.

| Route | Request | Response |
|---|---|---|
| `GET /admin/api/documents` | — | `200 { documents: { <key>: { value, updatedAt } } }` |
| `GET /admin/api/documents/:key` | — | `200 { key, value, updatedAt }` · unknown key → `404 { error: "not_found" }` |
| `PUT /admin/api/documents/:key` | body = the whole new value | valid → stored → `200 { key, updatedAt }` · invalid → `400 { error: "invalid", path }` (first bad field, e.g. `projects[2].techStack[0]`) · unknown key → 404. Nothing stored on 400. |
| `GET /admin/api/posts` | — | `200 { posts: AdminPost[] }` all statuses, newest `updatedAt` first |
| `POST /admin/api/posts` | `AdminPost` without `publishedAt` required | `201 { post }` · duplicate `id` or `slug` → `409 { error: "conflict", field }` · invalid → 400 as above |
| `PUT /admin/api/posts/:id` | whole `AdminPost` | `200 { post }` · unknown → 404 · conflict/invalid as above |
| `DELETE /admin/api/posts/:id` | — | `204` · unknown → 404 |
| `POST /admin/api/media` | `multipart/form-data`, field `file` | jpg/png/webp by **magic bytes** (not the name), ≤ 5 MB → saved as `<sha256 first 12 hex>.<ext>` in `DATA_DIR/media`, row `url = /media/<file>` → `201 { file, url }` · else `400 { error: "bad_media", reason: "type" \| "size" }` |
| `GET /admin/api/media` | — | `200 { media: [{ file, url, mime, bytes }] }` |

`AdminPost` = `BlogPost` (`id`, `title`, `excerpt`, `author`, `publishedAt`, `readTime`, `category`, `slug`) + `bodyMd: string`,
`cover: string | null` (a `/media/…` or `/images/…` URL), `status: "draft" | "published"`. `slug` = `^[a-z0-9]+(-[a-z0-9]+)*$`.
`publishedAt` (`YYYY-MM-DD`): kept if given; set to today's date when a post first becomes `published` without one.

## What to do

1. `back/src/store/validate.ts` (new) — one validator per document key, written from `front/src/types/app/content/index.ts`
   (+ `site`'s fields as stored, `copy` = object of pages → object of `string | { [k]: string }`, `ai_profile` = `{ markdown: string }`).
   Required fields present with the right type; optional fields (`link?`, `credentialUrl?`) may be absent; **unknown fields rejected**.
   Returns `{ ok: true } | { ok: false, path }`. Plus `validateAdminPost`.
2. `back/src/store/content.ts` — add the write/read helpers the table needs (posts CRUD, media insert/list, `getDocument`).
3. `back/src/admin/{guard,routes}.ts` (new) — the contract above. `registerAdmin(app, { getStore, onSaved })` where `onSaved(key)`
   is called after every successful document write (TASK-038 plugs the Home AI in there; today a no-op).
4. `back/src/config.ts` — `ADMIN_ENABLED` (`"1"` only = true), `ADMIN_ORIGIN`. `back/src/index.ts` — call `registerAdmin` only when enabled;
   the start line adds ` — admin ON (local only)` when it is.
5. Logs, content-free: `[admin] put key=<k> bytes=<n> ok|invalid path=<p>` · `[admin] post <create|update|delete> id=<id> ok|…` ·
   `[admin] media bytes=<n> ok|bad_media reason=<r>`. Never a value, title, body or file name from the client.
6. Tests `back/test/admin.test.ts` (temp `DATA_DIR`, seeded):
   (a) flag off → every route 404; (b) `isLoopback` truth table incl. `10.0.0.5` false; (c) a real `Bun.serve` on port 0 with the
   flag on, request from 127.0.0.1 → allowed; (d) PUT `projects` valid → 200 and `GET /content` shows it; invalid (missing
   `title`, extra field, wrong type) → 400 with the exact `path`, store unchanged; (e) posts: create draft → not in `/content/posts`;
   publish → listed, `publishedAt` set; duplicate slug → 409; delete → 204, 404 after; (f) media: a real 1×1 PNG → 201 and
   `GET /media/<file>` serves it; a `.png`-named text file → 400 `type`; 5 MB + 1 byte → 400 `size`; (g) CORS: `OPTIONS` from
   `http://localhost:4015` → allowed; from `http://evil.test` → no allow-origin header; `/content` has no CORS header;
   (h) `onSaved` called with the key after a successful PUT, not after a 400.

Do NOT touch: `front/`, `back/src/chain/**`, the read routes' behaviour, knowledge loading (TASK-038), the seed.

## Definition of Done

- [ ] 1. Before: `bun test` summary (after TASK-033 it will be ≥ 62 + its tests — paste whatever it is). After: all green, + yours.
- [ ] 2. `bunx tsc --noEmit` → 0.
- [ ] 3. Live, seeded scratch store, **flag off**: `curl -s -o /dev/null -w "%{http_code}" -X PUT localhost:<p>/admin/api/documents/site` → `404`.
- [ ] 4. Same, **`ADMIN_ENABLED=1`**: GET `/admin/api/documents/site` → 200; a valid PUT of `site` with `availability` changed → 200, then
      `curl /content` shows the new value; an invalid PUT → 400 + `path`. Paste the `[admin]` log lines (no content in them).
- [ ] 5. `grep -rn "admin" back/src/index.ts` → only the guarded registration + start-line text.
- [ ] 6. `git status --short` + `git diff --stat`; scratch store deleted; zero real calls; server stopped.

## Implementation Notes
(Fern, 2026-11-01.) Built on TASK-033's tree. **Zero real calls** (no AI route; every run had `GATEWAY_BASE_URL=http://127.0.0.1:1`). No front change, no `admin/` app, no git write.
`back/src/chain/**`, knowledge loading, the seed and the read routes' behaviour were not touched.

**Files:** new `back/src/admin/guard.ts` (22 lines), `back/src/admin/routes.ts` (184), `back/src/store/validate.ts` (167), `back/test/admin.test.ts` (248).
Modified: `back/src/store/content.ts` (admin helpers appended), `back/src/config.ts` (`ADMIN_ENABLED` = exactly `"1"`, `ADMIN_ORIGIN` default `http://localhost:4015`),
`back/src/index.ts` (one guarded `registerAdmin(app, { getStore: () => store, onSaved: () => {} })` + the start-line suffix).

**Decisions I took — accept or overrule**
1. **`PUT /admin/api/posts/:id` cannot rename:** body `id` ≠ `:id` → `400 { error: "invalid", path: "post.id" }`. The id is how the admin app addresses a post.
   Slug changes are allowed (conflict-checked against the other posts).
2. `publishedAt` is absent or `null` on input → stored `null` for a draft, today's local date when the post is published. **Responses carry `publishedAt: null`** for a
   never-published draft, so `AdminPost.publishedAt` is `string | null` (the contract's `BlogPost` says `string`).
3. Post validation paths are prefixed `post.` (`post.slug`, `post.extra`). Documents are prefixed by their key (`projects[2].title`, `site.phone`), as in the contract's example.
   A body that is not JSON → `400`, with path = the key (documents) or `post` (posts).
4. `cover` is stored as the URL itself in `cover_media`, so the public `/content/posts` `cover` is now that URL (it was `null`/raw before; TASK-032 call 5 left the shape open).
5. Media: size is checked before type. An identical upload gets the same `<hash>.<ext>` name; the row is `INSERT OR IGNORE`d, so a re-upload answers 201 with the same file.
   A request with no `file` field → `400 bad_media reason=type`.
6. The guard middleware also answers `503 store_unavailable` when the store is not open. It runs after `cors`, so a preflight is answered by `cors` and never needs loopback.
   With no socket (`app.request()`), the guard refuses `403`: no address is not loopback.
7. Tests (c)–(h) run through a **real `Bun.serve` on 127.0.0.1 port 0**. The test composes `registerAdmin` + `index.ts`'s app in a fresh Hono, because the shipped `app`
   reads `ADMIN_ENABLED` once at import, when it is unset in `bun test` (that is exactly test (a)).
8. `copy` validation is generic (pages → `string | { [k]: string }`), as the TASK says. Unknown pages or fields inside `copy` are therefore accepted. Every other key rejects unknown fields.

**DoD evidence**
1. Before: `GATEWAY_BASE_URL=http://127.0.0.1:1 bun test` → `62 pass / 0 fail / 273 expect() calls / Ran 62 tests across 8 files`.
   After: `75 pass / 0 fail / 359 expect() calls / Ran 75 tests across 9 files` (+13 in `admin.test.ts`: (a) 1, (b) 2, (c) 1, (d) 3, (e) 2, (f) 2, (g) 1, (h) 1).
2. `bunx tsc --noEmit` → 0.
3. Seeded scratch store, **flag off**, `back/` on 4099: `curl -s -o /dev/null -w "%{http_code}" -X PUT localhost:4099/admin/api/documents/site` → **`404`**.
4. Same store, **`ADMIN_ENABLED=1`**. Start line ends `— gateway http://127.0.0.1:1 — admin ON (local only)`.
   `GET /admin/api/documents/site` → **200** (availability `"Open to new opportunities"`). Valid PUT with `availability` changed → **200** `{"key":"site","updatedAt":"2026-10-31T18:29:31.047Z"}`
   (UTC). Then `/content` `site.availability` = `"TASK-034 scratch check"`. Invalid PUT (`phone: 123`) → **400** `{"error":"invalid","path":"site.phone"}`. Log lines:
   `[admin] put key=site bytes=271 ok` · `[admin] put key=site bytes=263 invalid path=site.phone` (key, byte count and field path only, no value).
5. `grep -n "admin" back/src/index.ts` → `8: import { registerAdmin } from "./admin/routes";` · `165: (config.ADMIN_ENABLED ? " — admin ON (local only)" : "")`.
   The guarded registration line (`if (config.ADMIN_ENABLED) registerAdmin(…)`) is the third use; it spells `Admin`/`ADMIN`, so a case-sensitive grep does not list it.
6. `git status --short` (back/): new `?? back/src/admin/`, `?? back/test/admin.test.ts`, `?? back/src/store/validate.ts` (inside the untracked `back/src/store/`); ` M back/src/config.ts`,
   ` M back/src/index.ts`, plus the earlier REQ-009/032/033 set. `git diff --stat -- back/src/config.ts back/src/index.ts` → `2 files changed, 82 insertions(+), 3 deletions(-)` (vs HEAD, incl. TASK-032).
   I deleted the scratch store (its WAL file was briefly held after the stop; a second delete succeeded) and stopped both servers I started (bun 17168, 23152); 4099 is free. Zero real calls.

**Rework 1 (Fern, 2026-11-01) — the amended guard from §Review, three files only:** `guard.ts`, `routes.ts`, `admin.test.ts`.
- `requireAdmin` now runs the five checks in the §Review order (first failure wins): (1) any `Forwarded` / `X-Forwarded-For` / `X-Real-IP` → `403 admin_local_only` ·
  (2) socket not loopback → `403 admin_local_only` · (3) `Host` hostname ∉ `localhost` / `127.0.0.1` / `[::1]` (any port, case-insensitive; new pure `hostName()`) →
  `403 admin_bad_host` · (4) method ∉ GET/HEAD/OPTIONS with an `Origin` that is present and ≠ `ADMIN_ORIGIN` → `403 admin_bad_origin`. `isLoopback` is unchanged.
- (5) is in `routes.ts`: `PUT documents`, `POST`/`PUT posts` need `content-type` starting `application/json`, and `POST media` needs `multipart/form-data`. Otherwise →
  `415 { "error": "unsupported_media_type" }`, checked **before** any body is read.
- Tests (i), 6 new, over the same real socket. Probes are sent with `node:http` so a test can set `Host` exactly as curl does: CSRF (foreign Origin + `text/plain`) → 403
  `admin_bad_origin` and **`csrf-post` absent from `/content/posts`** · `Host: evil.test` → 403 `admin_bad_host` · each of the three proxy headers → 403 `admin_local_only` ·
  `text/plain` with **no** Origin → 415 (posts, documents) and non-multipart media → 415, nothing stored · allowed: `Origin: http://localhost:4015` + `Host: localhost:<p>` → 200,
  no Origin → 200, `Host: [::1]:<p>` → 200, POST from the admin origin → 201 · a GET with a foreign Origin still passes (a safe method; check 4 does not apply, and CORS keeps a
  browser from reading the answer). The earlier tests (a)–(h) pass unchanged.
- One call of mine: check 3 accepts `localhost`/`127.0.0.1`/`[::1]` only, so `Host: ::1` without brackets (not valid HTTP) is refused.

**Rework DoD re-run**
1. Before: `75 pass / 0 fail / 359 expect() calls / Ran 75 tests across 9 files`. After: **`81 pass / 0 fail / 387 expect() calls / Ran 81 tests across 9 files`**.
2. `bunx tsc --noEmit` → 0.
3. Fresh seeded scratch store, flag off, 4099: `curl -X PUT …/admin/api/documents/site` → **`404`**.
4. `ADMIN_ENABLED=1` (start line `… — admin ON (local only)`): GET site → **200** · valid PUT (with `Origin: http://localhost:4015`, `availability` changed) → **200**
   `{"key":"site","updatedAt":"2026-10-31T18:34:37.961Z"}` · `/content` `site.availability` = `"TASK-034 rework scratch check"` · invalid PUT → **400** `{"error":"invalid","path":"site.phone"}`.
   Log: `[admin] put key=site bytes=278 ok` · `[admin] put key=site bytes=263 invalid path=site.phone`.
   **Your three curl probes, live:** CSRF `POST /admin/api/posts` + `Origin: http://evil.test` + `Content-Type: text/plain` → **403 `{"error":"admin_bad_origin"}`**, and `csrf-post` in
   public `/content/posts`: **0** · `Host: evil.test` → **403 `{"error":"admin_bad_host"}`** · `X-Forwarded-For: 203.0.113.9` → **403 `{"error":"admin_local_only"}`**.
5. `grep -n "admin" back/src/index.ts` → unchanged by the rework (same 2 lines as above).
6. `git status`: the rework touched only `back/src/admin/{guard,routes}.ts` (untracked dir) + `back/test/admin.test.ts` (untracked). I deleted the scratch store, stopped both servers
   (bun 22384, 22016), and 4099 is free. Zero real calls.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review

**Verdict: REWORK** (Sober, 2026-11-01) — **for a hole in my contract, not in your build.** Your work matches the contract exactly
(re-run: `bun test` 75 pass / 0 fail, `bunx tsc` 0; your 8 calls — **all accepted**: no rename via PUT, `publishedAt: string | null` on
`AdminPost`, `post.` / `<key>.` paths, `cover` = URL, size-before-type + idempotent upload, guard after `cors`, the real-socket tests,
generic `copy` validation). But the security pass the role requires before `DONE` (`/security-review` row) found that **"loopback
only" is not a lock**. Proven by running it, seeded scratch store, `ADMIN_ENABLED=1`, port 4097, zero real calls:

| Probe (curl from this machine) | Got | Means |
|---|---|---|
| `POST /admin/api/posts` with `Origin: http://evil.test`, `Content-Type: text/plain`, a JSON body | **201**, and the post appeared in public `/content/posts` | **CSRF**: any web page he visits while the admin `back/` runs can publish/upload — `text/plain` and `multipart` POSTs are "simple" requests, no CORS preflight; `c.req.json()` parses regardless of type |
| `GET /admin/api/documents/site` with `Host: evil.test` | **200** | DNS-rebinding page would be same-origin to the browser and pass |
| same with `X-Forwarded-For: 203.0.113.9` | **200** | behind a reverse proxy on the same host every request is "loopback" — the second lock vanishes |

**Amended contract (SPEC-010 D5 updated the same way) — `requireAdmin(c)` checks, in this order, first failure wins:**
1. Any of `Forwarded`, `X-Forwarded-For`, `X-Real-IP` present → `403 { "error": "admin_local_only" }` (a proxied request is never local).
2. Socket address loopback (as built) → else `403 admin_local_only`.
3. `Host` hostname ∈ `localhost`, `127.0.0.1`, `[::1]` (any port) → else `403 { "error": "admin_bad_host" }`.
4. Method not `GET`/`HEAD`/`OPTIONS`: `Origin` **absent** (curl, scripts) **or exactly** `ADMIN_ORIGIN` → else `403 { "error": "admin_bad_origin" }`.
5. Routes that read a JSON body (`PUT documents`, `POST`/`PUT posts`): `content-type` must start with `application/json` → else
   `415 { "error": "unsupported_media_type" }`, nothing parsed. `POST /admin/api/media` must be `multipart/form-data` → else 415.

**Add to `admin.test.ts`** (real socket, as yours): the three probes above → 403 `admin_bad_origin` / 403 `admin_bad_host` /
403 `admin_local_only`, and the CSRF post **not** in `/content/posts`; `text/plain` with **no** Origin → 415; allowed paths still pass
with `Origin: http://localhost:4015` and with no Origin; `isLoopback` table unchanged. Re-run DoD 1–6 and paste, plus the three curl
probes live with their new codes. Files: `guard.ts`, `routes.ts`, `admin.test.ts` only.

I record this as my defect (an incomplete instruction that reached build); TASK-038 and the admin UI wait on this TASK's `DONE`.

**Rework 1 verdict: DONE** (Sober, 2026-11-01). Zero real calls. Re-run by me: `bun test` → `81 pass / 0 fail / 387 expect() calls`;
`bunx tsc --noEmit` → 0; read `guard.ts` whole (5 checks in the ordered sequence, comment states why) and the three 415 sites in `routes.ts`
(checked before any body read). **Live on a fresh seeded scratch store, `ADMIN_ENABLED=1`, port 4097:** CSRF `text/plain` from
`evil.test` → `403 admin_bad_origin`; `Origin: null` (sandboxed frame / file page) + JSON → `403 admin_bad_origin`; public
`/content/posts` has 0 `csrf-probe`; `Host: evil.test` → `403 admin_bad_host`; `X-Forwarded-For` → `403 admin_local_only`;
no Origin + `text/plain` → `415`; `Origin: http://localhost:4015` + JSON → `201`. Stopped, scratch deleted.
Your one call (`Host: ::1` without brackets refused — not valid HTTP) — **accepted**. A GET with a foreign Origin still passes —
**accepted**: safe method, the browser cannot read the answer (CORS), and check 3 already stops a rebinding page.
