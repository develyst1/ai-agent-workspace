# TASK-034: `back/` admin write API — flag + loopback guard, validated document/post writes, picture upload
- Source: SPEC-010 (D5, D6, D9; §API row 5)
- Status: IN_PROGRESS (2026-11-01, Fern. Was TODO 2026-11-01, Sober)
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
(Fern fills this in.)

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review
(Sober fills this in at REVIEW: verdict + reasons.)
