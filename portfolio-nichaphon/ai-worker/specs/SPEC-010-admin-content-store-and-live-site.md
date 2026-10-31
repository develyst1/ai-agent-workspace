# SPEC-010: Admin — a content store in `back/`, a live-reading public site, a local-only admin app, AI drafting
- Source: REQ-010 (R1–R8, AC-a…g)
- Status: **ACTIVE** (2026-11-01, Sober — stage 1 cut: TASK-032, TASK-033; stage 2 (admin app, AI draft, Home AI from the store) is cut when TASK-032 is `DONE` — see §Tasks)
- Read 2026-11-01, repo `portfolio-nichaphon-web`, branch `D1`, HEAD `b068fba` + uncommitted REQ-009 work (TASK-029/031):
  `front/src/constant/{site.ts,content/*.ts}` (15 content exports incl. `SITE` and `BLOG_POSTS`, 720 lines by `wc -l`), the 7 `*.config.ts` copy files (202 lines),
  `front/src/types/app/content/index.ts` (13 interfaces), `front/src/app/**/page.tsx`, `front/next.config.ts` (`output: 'standalone'`),
  `front/public/images/{certificates,reviews}` (10 files), `back/package.json` (deps: `hono` only), `back/scripts/build-projects-md.ts`,
  `back/src/knowledge/load.ts`, `ContactForm.tsx:35` (a `mailto:` — the public site has **no** writable endpoint today). Bun 1.3.14.
  Importers of content/copy: 31 files (`grep -rln "constant/content\|constant/site\|\.config'" front/src`).

## Overview

Today all content is TypeScript constants compiled into the front, and the Home AI reads two Markdown files. REQ-010 wants one
place he edits, a site that shows the edit within a minute without a build, and the Home AI answering from the same place.

Shape, in three seams:

1. **The store lives in `back/`** — SQLite through Bun's built-in `bun:sqlite` (D1). `back/` already runs, already talks to the
   gateway, and is the only server process we have. One file on disk, no database server to run — the owner's own reluctance
   (*"ต้องมี postgres อีกเหรอ"*, Q44 2026-09-09) is respected while (c) "a database now" is met.
2. **The public site reads from `back/` at request time** with a 60-second data cache (D4). No rebuild on Save; ≤ 60 s to show.
3. **The admin is a separate local-only app** (`admin/`) that talks to write routes which **do not exist** unless `back/` was
   started with `ADMIN_ENABLED=1`, and which answer only loopback callers (D5). Two independent locks, so the public site
   carries no admin link, no admin page and no writable route (AC-f). Login (Q2) later replaces the loopback lock — one function.

**The honest limit, stated up front (→ SQ45):** while Q2 is open, the admin runs on his machine against his local `back/`.
Saves change the **local** site. **`portfolio.develyst.online` does not change until Q2 opens a way in.** The build is complete
and testable locally (REQ-010 Q2 says exactly this); the stale-site pain on production is solved only on Q2.

## Decisions this SPEC makes (SA's own, reversible, recorded)

- **D1 — Storage: SQLite file via `bun:sqlite`.** `back/data/site.db` (WAL mode) + uploaded files in `back/data/media/`.
  `back/data/` is git-ignored (root `.gitignore`), never committed, never shipped by the build. New env `DATA_DIR`
  (default `back/data`); tests use a temp dir. Schema versioned by `PRAGMA user_version` with ordered migration functions in
  `back/src/store/migrations.ts` — no ORM, no new dependency.
- **D2 — Content model = today's types, stored as documents.** One table `documents(key TEXT PRIMARY KEY, json TEXT NOT NULL,
  updated_at TEXT NOT NULL)`. **One key per content export that exists today**, shape = the existing interface in
  `front/src/types/app/content/index.ts` (keys and the initial list in §Data Model). Blog posts get their own table (they have
  their own pages and a lifecycle): `posts`. Pictures: `media`. A key-per-export store means SQ44's answers only add or drop
  keys — nothing built has to be torn down.
- **D3 — Day one = a seed, not hand entry (R8, AC-a).** `bun run seed` imports every in-scope export **from the front's own
  constants** (the way `build-projects-md.ts` already imports `projects.ts`), writes each as its document, imports the six
  `BLOG_POSTS` into `posts` (published — SQ44c), and registers `front/public/images/**` in `media` **keeping their existing
  `/images/...` paths** (no file moves, no URL changes). It refuses to run on a non-empty store unless `--force`. A test
  proves seed → `GET /content` deep-equals the constants (AC-a at data level, before any eye looks).
- **D4 — Public read path.** `back/` serves `GET /content` (every document as one JSON object, plus `etag`), `GET /content/posts`
  (published, newest first, no body), `GET /content/posts/:slug` (one, with body), `GET /media/:file`. Read routes are public
  and read-only. The front fetches **server-side only** through one module `front/src/lib/content.ts`
  (`CONTENT_API_URL`, server env, default `http://localhost:4014`) with `fetch(..., { next: { revalidate: 60 } })`, and every
  content route gets `export const dynamic = 'force-dynamic'` so `next build` never needs `back/` running. Components receive
  content **as props** from their page; no component imports `constant/content/*` any more. `back/` unreachable at request time
  → the page renders a short "content is unavailable" state, never a crash, never stale constants (a second source of truth is
  how the site went stale).
- **D5 — The write side does not exist on the public build.** `back/src/admin/` registers `/admin/api/*` **only when
  `ADMIN_ENABLED=1`** at startup; every admin route goes through one guard `requireAdmin(c)` which today allows only a loopback
  remote address (`127.0.0.1` / `::1`) and refuses everything else with 403 — **the single point Q2's login replaces**. The
  admin UI is a separate Next.js app `admin/` (Mantine, dev server on 4015, imports the front's theme via a path alias the way
  `back/` imports front types) that is never part of `front/`'s build. → AC-f has two independent locks, both checkable by grep
  and by a probe.
- **D6 — Blog posts.** Table `posts` (§Data Model) carries every `BlogPost` field shown today (`author`, `readTime` included)
  plus `body_md`, `cover_media`, `status`. Body is Markdown, rendered on the new page `front/src/app/blog/[slug]/page.tsx`
  with `react-markdown` (raw HTML **off**, its default) — the one new front dependency. Categories are derived from published
  posts (today's `BLOG_CATEGORIES` constant goes away).
- **D7 — AI drafting (R5, R6) is one admin route.** `POST /admin/api/draft { note, field, current? }` → one `askGateway` call →
  `{ draft }`. Output is **always English** (R6) whatever the note's language; the draft is returned, **never written**. Only
  the admin's Save writes. Every real draft call is a ledgered call during testing (§Call ledger).
- **D8 — The Home AI reads the store (R7).** Knowledge stops being two files: `back/src/knowledge/` builds the same two texts
  (PROFILE, PROJECTS) **from the store** — PROJECTS from the `projects` document (today's `renderProjectsMd`, reused), PROFILE
  from the `ai_profile` document (SQ44d) — and rebuilds them in memory on every admin Save. `back/knowledge/*.md` become seed
  inputs only. Citations keep pointing at `/about` and `/portfolio`.
- **D9 — Validation.** Every write is checked against the key's shape before it is stored (hand-written validators beside the
  documents, like `chain/parse.ts`; no new dependency) → `400 { error, path }` naming the first bad field. A failed write
  changes nothing.

## Data Model

```sql
-- migration 1 (user_version 0 → 1)
CREATE TABLE documents (key TEXT PRIMARY KEY, json TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE posts (
  id INTEGER PRIMARY KEY, post_key TEXT NOT NULL UNIQUE, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL, category TEXT NOT NULL,
  excerpt TEXT NOT NULL, author TEXT NOT NULL, read_time TEXT NOT NULL, body_md TEXT NOT NULL DEFAULT '', cover_media TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft','published')), published_at TEXT, updated_at TEXT NOT NULL);
-- post_key = BlogPost.id; slug = BlogPost.slug; published_at = BlogPost.publishedAt ('YYYY-MM-DD'); author/read_time as shown today
CREATE TABLE media (file TEXT PRIMARY KEY, url TEXT NOT NULL, mime TEXT NOT NULL, bytes INTEGER NOT NULL, created_at TEXT NOT NULL);
```
Existing rows: none — the store is new; the seed fills it. Nothing real is touched; the file is on the machine that runs `back/`.

**Document keys, stage 1** (each = one export today; shape = its interface):
`site` (SITE) · `quotes` · `projects` · `services` · `process_steps` · `capabilities` · `experience` · `skill_groups` ·
`career_stats` · `values` · `certificates` · `testimonials` · `contact_channels` · `faq` · `copy` (the page-content strings in
the 7 `*.config.ts` files, grouped by page — **which strings are in is SQ44a**) · `ai_profile` (SQ44d).
**Stays in code (not content):** `NAV_LINKS`/`FOOTER_LINKS` (routes), `ASK_WS_URL`, every Ask-section status/failure string,
form labels/validation text — default of SQ44a.

## API (`back/`)

| Route | Who | Request → Response |
|---|---|---|
| `GET /content` | public | → `200 { etag, documents: { <key>: <json> } }` |
| `GET /content/posts` | public | → `200 { posts: BlogPost[] }` — exactly today's `BlogPost` fields (`id`, `title`, `excerpt`, `author`, `publishedAt`, `readTime`, `category`, `slug`) + `cover` (null today); published only, newest `publishedAt` first |
| `GET /content/posts/:slug` | public | → `200 { post: BlogPost & { cover, bodyMd } }` · unknown/draft → `404 { error: "not_found" }` |
| `GET /media/:file` | public | → file bytes with its mime; unknown → 404 |
| `/admin/api/*` | **only if `ADMIN_ENABLED=1`; loopback only** | stage 2 (TASK-034+): `GET/PUT /admin/api/documents/:key`, posts CRUD, `POST /admin/api/media` (jpg/png/webp ≤ 5 MB), `POST /admin/api/draft`. Non-loopback → `403 { error: "admin_local_only" }`; flag off → route absent → 404 |

Field casing in JSON = the TypeScript interfaces exactly (camelCase as today, e.g. `techStack`).

## Non-functional

- No auth exists (Q2 open); D5's two locks are the whole protection and are **local-only by design**. Nothing is deployed by the team.
- `back/data/` never in git; a test asserts `.gitignore` covers it.
- Logs stay content-free (SPEC-006 D9): admin writes log `key`, byte length and result — never the text.
- Phone and visual look of the six pages: unchanged — same components, data now via props (REGRESSION list = AC-g).

## Tasks

Stage 1 — cut 2026-11-01:
- **TASK-032**: `back/` content store — migrations, seed from the front constants, public read routes, tests (depends on: —)
- **TASK-033**: `front/` reads content from `back/` — `lib/content.ts`, pages pass props, `/blog/[slug]`, unavailable state (depends on: TASK-032 `DONE`)

TASK-032 **DONE 2026-11-01** (16 documents / 6 posts / 10 media — one carry, picture-only media, into TASK-033).

Stage 2a — the back-end contracts, **cut 2026-11-01** at TASK-032 `DONE`:
- **TASK-034**: `back/` admin write API — flag + loopback guard, validators, posts CRUD, picture upload, CORS for the admin origin (depends on: TASK-032)
- **TASK-038**: the Home AI reads the store and refreshes on Save (depends on: TASK-034's `onSaved`)

Stage 2b — **cut when TASK-034 is `DONE`** (restaged 2026-11-01: the admin UI is built on the *write* contract, so it waits for
that contract to be proven, the same reason stage 2 waited for the seed): TASK-035 `admin/` app shell + document editors ·
TASK-036 posts + pictures in the admin · TASK-037 AI draft (`back/` route + admin button) · TASK-039 ledgered real-gateway checks (AC-d, AC-e).
Engineer order (one engineer): 033 → 034 → 038 → stage 2b.

AC map: AC-a → TASK-032 (data) + QA · AC-b → TASK-033/034/035 + QA · AC-c → TASK-033/036 + QA · AC-d → TASK-037/039 + QA ·
AC-e → TASK-038/039 + QA · AC-f → D5 (TASK-034) + QA probe · AC-g → TASK-033 + QA REGRESSION.

## Call ledger — REQ-010 (none opened yet)

Stage 1 makes **zero** real calls. The ledger opens with TASK-037/039; its size goes to the owner via Porter then.

## Questions

(SA notices to Porter continue at SQ44.)

**SQ44 (to Porter → owner, decision pack, defaults taken — NON-blocking for TASK-032/033; each line only adds or drops a key).**
Checked: REQ-010 R2/R7/R8 + §Owner decisions (Q1 b–f), REQ-005 §Owner decisions (Q51 `ไม่แสดง` = profile-only facts),
SQ28 (`เก็บทั้งหมด`). Not covered: where "every text" ends, what happens to the 6 sample posts on day one, PROFILE.md's place.
Correct only the wrong line:
- (a) **"Every text"** = page content: headlines, intros, section headings and leads, project/service/certificate/testimonial
  text, contact details, FAQ, quotes, page titles + descriptions for search engines. **Not** editable: menu names, buttons,
  form labels, the Ask section's status and error messages (they are the site's machinery, not his content).
- (b) **Pictures**: today's 10 pictures keep their addresses; new ones he uploads are jpg/png/webp up to 5 MB each.
- (c) **The 6 sample blog posts** move in **as they are and stay published** on day one (R8: nothing disappears at the switch);
  he deletes or replaces them in the admin when he wants. (R2 said they are "replaced by whatever he writes" — this reads that as
  *his* action, not the migration's.)
- (d) **The Home AI's extra profile** (`back/knowledge/PROFILE.md` — the facts he chose to keep off the pages, e.g. Q51) becomes
  one editable text in the admin called "What the AI knows beyond the pages". Without it, the AI would keep answering from a file
  he can no longer edit.
- (e) Blog posts are written in Markdown-style text (headings, lists, links); the AI draft helps with that too.

**SQ45 (to Porter → owner, FYI, rides with Q2) — production does not change until login is decided.** The admin and its saves are
local-only while Q2 is open (R1). So the live site stays as it is today until Q2 opens a way for him to reach his server's
`back/` — the build itself is not blocked.

**SQ46 (to Porter → owner, FYI for deploy day) — three server facts.** (a) `back/data/` (the database file + uploaded pictures)
must live on a disk that survives redeploys and be backed up — it is now his content; (b) the front server must reach `back/`
server-side (`CONTENT_API_URL`); (c) `next build` no longer needs content at build time — pages render on request with a 60 s cache;
(d) added 2026-11-01 (TASK-032 call 9): the compiled `back/` binary (`bun run build`) resolves `front/public` from its own location,
so on a server the seeded pictures are found only if that folder sits beside it — to be designed with Q2/deploy, not now.
