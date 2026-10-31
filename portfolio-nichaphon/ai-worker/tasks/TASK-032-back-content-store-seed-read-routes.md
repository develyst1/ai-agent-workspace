# TASK-032: `back/` content store — SQLite migrations, seed from the front constants, public read routes
- Source: SPEC-010 (D1, D2, D3, D4 back half, D9 read side; §Data Model; §API rows 1–4)
- Status: **DONE** (2026-11-01, Sober — see §Review; one carry → TASK-033 step 7. Was REVIEW 2026-11-01, Fern)
- Depends on: none (starts from the current tree: `D1` @ `b068fba` + uncommitted TASK-029/031 — leave those files as they are)
- Owner: Fern (FE)

**Zero real calls. No admin/write route in this TASK. No front change. No git write.**

## What to do

Read SPEC-010 first (Overview, D1–D4, D9, §Data Model, §API). Then:

1. **`back/src/config.ts`** — add `DATA_DIR` (default `<back>/data`, resolved from the module dir like `KNOWLEDGE_DIR`). Nothing else.
2. **`back/src/store/db.ts` (new)** — `openStore(dir = config.DATA_DIR)`: creates `dir` and `dir/media` if missing, opens
   `site.db` with `bun:sqlite`, `PRAGMA journal_mode = WAL`, runs migrations, returns the `Database`.
3. **`back/src/store/migrations.ts` (new)** — ordered array of functions; migration 1 = SPEC-010 §Data Model SQL verbatim;
   apply each whose index ≥ `PRAGMA user_version`, inside a transaction, then set `user_version`. Idempotent on re-open.
4. **`back/src/store/content.ts` (new)** — `getDocuments(db)` → `{ etag, documents }` (etag = sha256 of the documents JSON,
   hex, first 16 chars) · `listPublishedPosts(db)` (newest `published_at` first, no `body_md`) · `getPublishedPost(db, slug)` ·
   `putDocument(db, key, value)` (used by the seed only in this TASK). Keys are the 15 in SPEC-010 §Data Model (14 + `copy`
   + `ai_profile`; see step 6 for what goes in `copy`/`ai_profile`). JSON field casing exactly as the TypeScript interfaces.
5. **`back/src/index.ts`** — register `GET /content`, `GET /content/posts`, `GET /content/posts/:slug`, `GET /media/:file`
   per SPEC-010 §API (404 bodies as written there). `/media/:file`: serve only a name that is a row in `media` **and** has no
   `/` or `..` (path traversal → 404); the bytes come from `DATA_DIR/media/<file>` or, for a seeded row whose `url` starts
   with `/images/`, from `front/public<url>`. `GET /health` gains `"store": { "documents": <n>, "posts": <n> }`. Open the
   store once at start; a store that cannot open → startup error line + `/content*` answer `503 { error: "store_unavailable" }`,
   the WS chain still runs.
6. **`back/scripts/seed.ts` (new) + `package.json` script `"seed": "bun run scripts/seed.ts"`** — imports the constants the way
   `scripts/build-projects-md.ts` does and writes:
   - one document per export: `site`←`SITE`, `quotes`←`QUOTES`, `projects`←`PROJECTS`, `services`←`SERVICES`,
     `process_steps`←`PROCESS_STEPS`, `capabilities`←`CAPABILITIES`, `experience`←`EXPERIENCE`, `skill_groups`←`SKILL_GROUPS`,
     `career_stats`←`CAREER_STATS`, `values`←`VALUES`, `certificates`←`CERTIFICATES`, `testimonials`←`TESTIMONIALS`,
     `contact_channels`←`CONTACT_CHANNELS`, `faq`←`FAQ_ITEMS`;
   - `copy` = `{ home: {…}, about: {…}, services: {…}, portfolio: {…}, blog: {…}, contact: {…} }` holding, per page, the
     exports of its `*.config.ts` **that SQ44a's default counts as content**: `HOME_LEAD`, `CAPABILITIES_EYEBROW/TITLE/LEAD`,
     `ABOUT_INTRO` + the five `*_HEADING`s, `SERVICES_INTRO`, `PROCESS_HEADING`, `SERVICES_CTA`, `PORTFOLIO_INTRO`, `NO_PUBLIC_DEMO`,
     `BLOG_INTRO`, `CONTACT_INTRO`, `CHANNELS_HEADING`, `FAQ_HEADING`, plus each page's `metadata.title/description` from
     `front/src/app/**/page.tsx` and `layout.tsx` (copy those strings into the seed **by import if exported, else as a literal
     with a `// from <file>:<line>` comment** — list which in your notes). **Not** in `copy`: `HERO_CTA_*`, `FILTER_LABEL`,
     `EMPTY_MESSAGE`, `FORM_COPY`, everything in `Ask.config.ts` (machinery — SQ44a);
   - `ai_profile` = `{ markdown: <back/knowledge/PROFILE.md file text> }`;
   - `posts` ← the six `BLOG_POSTS`: `post_key`←`id`, `slug`←`slug`, `title`, `category`, `excerpt`, `author`,
     `read_time`←`readTime`, `published_at`←`publishedAt` (`YYYY-MM-DD` as stored), `status: 'published'`, `body_md: ''`
     (today's posts have no body — that is the truth, not a gap you fill). The API maps back to `BlogPost` casing (SPEC-010 §API);
   - `media` ← one row per file under `front/public/images/**`, `url` = `/images/<sub>/<name>`, mime from the extension.
   Refuses a non-empty store (any document row) unless `--force`; prints counts at the end.
7. **Root `.gitignore`** — add `/back/data/` under the existing back lines. Only that line.
8. **Tests** (`back/test/store.test.ts`, new; temp `DATA_DIR` per test, removed after):
   (a) migrations: fresh → `user_version` 1, re-open → still 1, tables exist;
   (b) **seed round-trip = AC-a at data level**: seed into a temp dir, `GET /content` via `app.request` → for every key,
       `documents[key]` deep-equals the imported constant (and `copy` equals the object the seed built); `/content/posts` has
       6 posts, newest `publishedAt` first, and each deep-equals its `BLOG_POSTS` entry plus `cover: null`; `/content/posts/<a real slug>` 200, `/content/posts/nope` 404;
   (c) seed twice without `--force` → refuses, store unchanged;
   (d) `/media/../../etc/passwd`-style and an unknown name → 404; a seeded certificate → 200 with its mime;
   (e) `.gitignore` contains `/back/data/`.

Do NOT touch: `front/` (TASK-033), `back/src/chain/**`, `back/knowledge/*` (still the Home AI's input until TASK-038),
`docker-compose.yml`, `back/package.json` other than the one script line, the REQ-009 files beyond leaving them as they are.

## Definition of Done

Paste command + the relevant output in §Implementation Notes.

- [ ] 1. Before any edit: `cd back && GATEWAY_BASE_URL=http://127.0.0.1:1 bun test` → paste (base Sober 2026-11-01: `54 pass / 0 fail / 212 expect() calls / Ran 54 tests across 7 files`). After: all green, 54 + yours.
- [ ] 2. `cd back && bunx tsc --noEmit` → exit 0.
- [ ] 3. `cd back && DATA_DIR=<a temp dir> bun run seed` → its count line; again without `--force` → the refusal line.
- [ ] 4. `DATA_DIR=<same temp dir> GATEWAY_BASE_URL=http://127.0.0.1:1 PORT=4099 bun run start`, then
      `curl -s localhost:4099/health` (store counts) · `curl -s localhost:4099/content | head -c 300` ·
      `curl -s localhost:4099/content/posts` (6) · `curl -s -o /dev/null -w "%{http_code}" localhost:4099/admin/api/documents/site` → `404`.
- [ ] 5. `grep -rn "ADMIN_ENABLED\|/admin" back/src` → 0 hits (no write side yet).
- [ ] 6. `git status --short` → the REQ-009 set unchanged + your files only (list them); `back/data/` **not** listed; no file under `front/` changed.
- [ ] 7. Zero real calls; the temp dir deleted; 4099 free.

## Implementation Notes
(Fern, 2026-11-01.) `D1` @ `b068fba` + the uncommitted REQ-009 set (left as it was). **Zero real calls**: tests never reach a gateway, and the live run pinned
`GATEWAY_BASE_URL=http://127.0.0.1:1`. No admin/write route, no front change, no git write. All touched/new files are uniform CRLF (counted).

**Files:** modified `back/src/config.ts` (+`DATA_DIR`), `back/src/index.ts` (4 read routes, `/health.store`, store open/close),
`back/package.json` (`seed` script; the line above gains its comma, which is unavoidable), root `.gitignore` (`/back/data/` under `/back/dist`).
New: `back/src/store/{db,migrations,content}.ts`, `back/scripts/seed.ts`, `back/test/store.test.ts`.

**Decisions I took — accept or overrule:**
1. **16 keys, not 15.** The TASK says "the 15", but its own list (14 + `copy` + `ai_profile`) and SPEC-010 §Data Model both give 16. I followed the list.
2. **`copy` shape:** `copy.<page>.<EXPORT_NAME>` with the export names verbatim (e.g. `copy.home.HOME_LEAD`), plus `copy.<page>.metadata = { title, description }`.
   **All six `metadata` blocks are literals** with `// from <file>:<line>` comments. The pages do export `metadata`, but importing a `page.tsx`/`layout.tsx`
   pulls in components, CSS and `next/font`, which Bun cannot load. Sources: home ← `layout.tsx:34` (title = `${SITE.name} — ${SITE.role}`, built from SITE as the layout builds it)
   + `:38` · about `page.tsx:5/7` · services `:5/7` · portfolio `:6/8` · blog `:6/8` · contact `:5/7`. Left out: the layout's `title.template`, `keywords`, `authors`.
3. ⚠️ **`SERVICES_CTA` is stored whole, including `action: "Start a conversation"`.** That is a button label, which SQ44a's default calls machinery. The TASK names the export, so it is in.
   Drop the field if SQ44a wins.
4. ⚠️ **`media` has 10 rows = 4 certificates + 5 review PNGs + `reviews/README.md`** (`text/markdown`), because the instruction is "one row per file". It is now also served at
   `/media/README.md`. The same file is already public at `/images/reviews/README.md`, so nothing new is exposed. Say if it should be skipped.
5. `cover` = the raw `cover_media` value (`null` for every seeded post). What a non-null cover looks like (a file name or a `/media/…` URL) is stage 2's decision.
6. **The store opens in the `import.meta.main` block, not when the module loads.** Every existing test imports `app`, and opening on load would create `back/data/` during `bun test`.
   `openAppStore(dir?)` / `closeAppStore()` are exported for tests. A failed open prints `[back] store unavailable at <dir>: <error>`, and the server still starts.
   Not open → `/content*` **and `/media/*`** → `503 {error:"store_unavailable"}`, and `/health.store` = `null`.
7. `/media/:file` also refuses `\` (a Windows path separator) besides `/` and `..`. Unknown name or missing bytes → `404 {"error":"not_found"}`.
8. `seed --force` empties `documents`, `posts` and `media`, then seeds, all in one transaction. A refusal exits with code 1. Posts with the same date are ordered by `id ASC`.
9. FYI for deploy day (rides with SQ46): the path to `front/public` is resolved from `import.meta.dir` like `KNOWLEDGE_DIR`, so the `--compile` binary would not find the seeded pictures.
   Not in scope, and nothing is deployed.

**DoD evidence**
1. Before: `GATEWAY_BASE_URL=http://127.0.0.1:1 bun test` → `54 pass / 0 fail / 212 expect() calls / Ran 54 tests across 7 files`.
   After: `62 pass / 0 fail / 272 expect() calls / Ran 62 tests across 8 files` (54 + 8 in `store.test.ts`: (a) 1, (b) 3 incl. `/health`, (c) 1, (d) 2 incl. 503, (e) 1). `bun test` created no `back/data/`.
2. `bunx tsc --noEmit` → exit 0.
3. `DATA_DIR=<scratch>/t032-data bun run seed` → `[seed] wrote 16 documents, 6 posts, 10 media → …\t032-data\site.db`, exit 0. Again → `[seed] refused: the store in … already has 16 documents — nothing written; rerun with --force to replace everything`, exit 1.
4. `DATA_DIR=<same> GATEWAY_BASE_URL=http://127.0.0.1:1 PORT=4099 bun run start`:
   - `/health` → `{"ok":true,"service":"portfolio-back","version":"0.1.0","knowledge":{"profile":true,"projects":true},"store":{"documents":16,"posts":6}}`
   - `/content | head -c 300` → `{"etag":"cec45ba8a0fb6985","documents":{"ai_profile":{"markdown":"# Nichaphon Sayvav\r\n\r\n## Identity…`
   - `/content/posts` → 6 posts, first `"id":"nextjs-typescript" … "publishedAt":"2025-01-15"`
   - `/admin/api/documents/site` → `404`. Extra probes: `/media/devlab-certificate.png` → `200 image/png`; `/media/..%2F..%2Fetc%2Fpasswd` → `404`.
5. `grep -rn "ADMIN_ENABLED\|/admin" back/src` → 0 hits.
6. `git status --short` → the REQ-009 set unchanged + mine: ` M .gitignore`, ` M back/package.json`, ` M back/src/config.ts`, ` M back/src/index.ts`, `?? back/scripts/seed.ts`,
   `?? back/src/store/`, `?? back/test/store.test.ts`. `back/data/` is not listed and does not exist. No file under `front/` changed.
7. Zero real calls. The temp store is deleted, and I stopped the `back/` I started (bun PID 13248); 4099 is free.

Not run: `/impeccable audit` (no UI in this TASK).

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review

**Verdict: DONE** (Sober, 2026-11-01). Zero real calls in review. Re-run by me, not read:
- `GATEWAY_BASE_URL=http://127.0.0.1:1 bun test` → `62 pass / 0 fail / 272 expect() calls / Ran 62 tests across 8 files`; `bunx tsc --noEmit` → 0;
  no `back/data/` created by the suite.
- Seed into a scratch dir → `wrote 16 documents, 6 posts, 10 media`; again → refused, exit 1. Seeded `back/` on 4098: `/health.store` 16/6;
  `/content` keys = the 16 of SPEC-010 + `copy` has the six pages; `/content/posts/<real slug>` 200, `/nope` 404; `/media/..%5C..%5Cx` 404;
  `/admin/api/documents/site` 404. Server stopped, 4098 free, scratch deleted. Read every new store file + the `index.ts`/`config.ts`/`.gitignore`/`package.json` diffs.
- Line endings: working copies uniform CRLF (`package.json` 21/21; its HEAD blob already CRLF) — git's notice is autocrlf.

Your nine calls:
1. **16 keys — accepted;** "the 15" in my TASK was my miscount (SPEC's list is 16). 2. `copy.<page>.<EXPORT>` + literal metadata with
   `// from` comments — **accepted** (importing `page.tsx` into Bun is not possible; right call). 3. ⚠️ `SERVICES_CTA` stored whole incl.
   `action` — **accepted** `[SA-decided: one CTA block = heading + lead + its button; SQ44a's "buttons are machinery" means the site's
   generic controls, not a call-to-action he writes]`; if the owner's SQ44a says otherwise, one field drops. 4. ⚠️ `reviews/README.md` as a
   media row — **overruled:** `media` is pictures only. It is harmless (a 26-line note already public at `/images/reviews/README.md`), so
   this is **not** REWORK — **carried into TASK-033** (which re-touches `seed.ts` anyway): seed registers only `jpg|jpeg|png|webp|gif|svg`,
   test asserts 9 rows. 5. `cover` raw/null — accepted; stage 2 decides the shape. 6. store opened under `import.meta.main` + exported
   open/close, 503 on `/media` too — **accepted, better than my TASK**. 7. `\` refused too — accepted. 8. `--force` in one transaction,
   exit 1 on refusal, `id ASC` tiebreak — accepted. 9. compiled binary cannot find `front/public` — **accepted as a real deploy-day
   gap** → added to SQ46 in SPEC-010.
