# SPEC-010: Admin — a content store in `back/`, a live-reading public site, a local-only admin app, AI drafting
- Source: REQ-010 (R1–R8, AC-a…g)
- Status: **DONE** (2026-11-01, Sober — TASK-032…038, 040, 041 all DONE; REQ-010 → SPEC_DONE; QA round next — see §Tasks)
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
  how the site went stale). *Amended 2026-11-01 (TASK-033 FQ55c):* unreachable **with nothing cached** → that state; with a
  cached answer (Next's data cache keeps the last good response while revalidation fails) → that answer until `back/` returns.
  *Amended 2026-11-01 (TASK-036 FQ59):* the single-post read (`getPost`) is **uncached** (`no-store`) so a deleted or unpublished
  post is a 404 at once; lists and documents keep the 60 s cache.
  *Amended again 2026-11-01 (TASK-036 rework 1 → TASK-040):* `revalidate: 60` is stale-while-revalidate — the first visit after the
  window still gets the old copy, so R4's "within one minute" was never guaranteed (measured 67 s). **Every read is now `no-store`**:
  a Save shows on the next visit; with `back/` down the unavailable state shows at once (reverses FQ55c — the honest trade for R4).
- **D5 — The write side does not exist on the public build.** `back/src/admin/` registers `/admin/api/*` **only when
  `ADMIN_ENABLED=1`** at startup; every admin route goes through one guard `requireAdmin(c)` which today allows only a loopback
  remote address (`127.0.0.1` / `::1`) and refuses everything else with 403 — **the single point Q2's login replaces**. The
  admin UI is a separate Next.js app `admin/` (Mantine, dev server on 4015, imports the front's theme via a path alias the way
  `back/` imports front types) that is never part of `front/`'s build. → AC-f has two independent locks, both checkable by grep
  and by a probe.
  **Amended 2026-11-01 (TASK-034 review — my defect):** loopback alone is not a lock. Proven on a scratch store: a cross-site
  `text/plain` POST from `Origin: http://evil.test` published a post (CSRF); `Host: evil.test` (DNS rebinding) and
  `X-Forwarded-For` (a reverse proxy on the same host) both passed. `requireAdmin` now checks, in order: no proxy headers
  (`Forwarded`/`X-Forwarded-For`/`X-Real-IP`) · loopback socket · `Host` is `localhost`/`127.0.0.1`/`[::1]` · for writes, `Origin`
  absent or exactly `ADMIN_ORIGIN` · JSON routes require `application/json`, media requires `multipart/form-data` (415 otherwise).
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
| `GET /media/:file` | public | → file bytes with its mime; unknown → 404. **The browser reaches it through the front** (added 2026-11-01, TASK-036 FQ56 — my gap): `front/src/app/media/[file]/route.ts` proxies to `${CONTENT_API_URL}/media/<file>` at request time (not a build-time rewrite), same name rule, `back/` down → 502 |
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

TASK-033 **DONE** · TASK-034 **DONE 2026-11-01** after one REWORK (guard hardening — my contract's defect, D5 amended).

Stage 2b — **cut 2026-11-01** at TASK-034 `DONE`:
- **TASK-035**: `admin/` app — local-only shell (`next dev -H 127.0.0.1 -p 4015`) + one field-map-driven editor per document (depends on: TASK-034)
- **TASK-036**: posts (draft/publish/delete, Markdown preview) + pictures (upload, picker) (depends on: TASK-035)
- **TASK-037**: AI draft route + "Draft with AI" button, never saves; **one** ledgered real call (depends on: TASK-035/036)
- ~~TASK-039~~ folded away: TASK-037 carries the one engineer real call; AC-d/AC-e real proofs are QA's round on this ledger.
- **TASK-040** (added 2026-11-01): all front reads `no-store` — R4 guaranteed (depends on: TASK-036) — **DONE 2026-11-01**
- **TASK-041** (added 2026-11-01): admin polish — Save contrast, Draft button only on prose fields (depends on: TASK-037) — **DONE 2026-11-01** (rework 1: none on `quotes`)

**All TASKs DONE 2026-11-01 → REQ-010 `SPEC_DONE`, handed to Porter for the QA round** (ledger 1 / 15; QA row cap 13 on Porter's ask).
- **TASK-042** (added 2026-11-01, after TEST-011 `TEST_FAILED` on DEF-1 only): `prefetch={false}` on the public site's links (DEF-1 —
  dynamic-route prefetch carries no data, costs `back/` nothing, only makes S6's aborted lines) + new post Author = `site.name` (OBS-22)
  (depends on: TASK-041). Zero real calls; re-test is no-call. — **DONE 2026-11-01**
- **OBS-23 (grid band stops part-way down `/blog/<post>`) — no TASK: a full-page-screenshot artifact, not on screen** (Sober, 2026-11-01,
  measured). The grid is `MachineGround` (`position: fixed; inset: 0; z-index: -1`, mounted once in `SiteShell`): it always fills the
  visible screen and stays put while the page scrolls. A full-page capture paints a fixed layer over the first viewport only, so the
  seam lands exactly at the capture's viewport height (900 px in TEST-011, 500 px in my probe). Scrolled to the bottom in a real
  viewport, the grid layer measured top 0 / bottom 500 and covers the whole screen. Pictures: `project-docs/sa-obs23-2026-11-01/`
  (`obs23-fullpage.png` seam vs `obs23-scrolled-bottom-viewport.png` none). Every long page has the same artifact in full-page shots;
  sections with their own background hide it. QA's picture check should use viewport shots after scrolling, not `fullPage`.
Engineer order (one engineer): **038 → 035 → 036 → 037 → 040 → 041**, then REQ-010 `SPEC_DONE` → Porter → QA.

AC map: AC-a → TASK-032 (data) + QA · AC-b → TASK-033/034/035 + QA · AC-c → TASK-033/036 + QA · AC-d → TASK-037/039 + QA ·
AC-e → TASK-038/039 + QA · AC-f → D5 (TASK-034) + QA probe · AC-g → TASK-033 + QA REGRESSION.

## Call ledger — REQ-010 (budget **15**, `[SA-decided]` — REQ-010 AC-d/e: "inside a call ledger the SA writes first"; his money, → SQ48)

Counted per call; a row is written **before** any fire; only Sober writes here.

| # | Date | Who | Request | Result | Running total |
|---|------|-----|---------|--------|---------------|
| — | 2026-11-01 | Sober | **Budget 15. Allocation: TASK-037 rows 1–2 (planned 1, cap 2) · QA round cap 13 (AC-d one or two drafts; AC-e one Home AI question after adding a project, 3–5 calls; plus a Home AI regression question), row written on Porter's ask.** Stages 1–2a fired nothing. | — | 0 / 15 |
| 1–2 | 2026-11-01 | Fern (TASK-037 step 5) — written BEFORE any fire | ONE "Draft with AI" on `projects[].summary`, the Thai note in TASK-037 verbatim, `back/` on defaults; planned 1, cap 2 (2 only if the first is a technical failure); "Use this" NOT pressed | **actual 1** (row 1; row 2 released) — `deepseek / deepseek-flash`, tokens 333/264/597, English, nothing added beyond the note (Fern's reading; AC-d is QA's) — TASK-037 §Implementation Notes | **1 / 15** |
| — | 2026-11-01 | Sober (TASK-037 review) | **Row 2 released. Spent 1. 14 unallocated — QA round row (cap 13) written on Porter's ask.** Fired nothing in review. | — | **1 / 15** |
| **2–14** | 2026-11-01 | **Tanya (REQ-010 QA round)** — row written by Sober BEFORE any fire, on Porter's ask | Local only, on a **copy of the seeded store** (never his content): `back/` = working tree on `D1`, real gateway, `ADMIN_ENABLED=1`; built `front/` with `NEXT_PUBLIC_ASK_WS_URL=ws://localhost:4014/ws` (SQ40 still open — per-run env, say it in the TEST file); `admin/` on 127.0.0.1:4015. Count = gateway calls from `back/`'s log (`[admin] draft …` = 1 each; one Home AI question = up to 3). **Presses, one each, in this order:** **AC-d** (2 calls) — (1) Draft on `projects[].summary` with a Thai note of yours; (2) Draft on a post body (`posts[].bodyMd`) with a Thai note; check English, editable, nothing new invented, and the public page unchanged until "Use this" + Save · **AC-e** (≤ 6) — add a test project with a unique made-up marker (e.g. a project name only you know) + Save, then ask the Home AI (a) in English and (b) in Thai about it; the answer must use the new fact · **AC-g regression** (≤ 3) — one Home AI chip question, answered normally. **Planned ≤ 11, hard cap 13.** A technical failure is the result: record it, **no re-press**; at 13 stop whatever is left. Never "Use this" + Save into anything but the copy. | **actual 11** (rows 2–12; 13–14 released) — 2 drafts + 3 Home AI questions × `calls=3`, 0 failures, 0 retries — TEST-011 §Results — real-call leg | **12 / 15** |
| — | 2026-11-01 | Sober (TEST-011 read) | **Rows 13–14 released. Spent 12 of 15; 3 unallocated.** Any re-test after TASK-042 needs **no** real call (DEF-1 + OBS-22 are no-call lines). | — | **12 / 15** |

**SQ48 (to Porter → owner, FYI, non-blocking) — REQ-010 budget.** 15 real calls `[SA-decided]`: 1–2 for the engineer's one draft,
up to 13 for Tanya's AC-d/AC-e round. A different number, or drawing from REQ-009's 11 unallocated, is one line.

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
so on a server the seeded pictures are found only if that folder sits beside it — to be designed with Q2/deploy, not now;
(e) `ADMIN_ENABLED=1` must never be set on a server until Q2 — the guard now refuses proxied requests, but the flag is the first lock.

**SQ47 (to Porter → owner, non-blocking, default taken) — the new article page.** `/blog/<post>` shows the post title in the same
large heading the other pages use; a 10-word title fills most of the first screen at desktop width (picture:
`../project-docs/fe-task033-2026-11-01/blog-slug-1280.png`). Default: keep. If he wants a smaller article heading, one TASK.
FYI in the same message: when `back/` cannot be reached and nothing is cached, pages say "Content is unavailable right now." (SA wording, a status line).

**SQ49 (to Porter → owner, non-blocking, default taken) — blog post cover pictures.** The admin can attach a picture to a post (it is
stored), but no REQ asked to show one, so the public `/blog` pages do **not** show covers (TASK-036 FQ57). Default: not shown. If he
wants them: where (on the `/blog` cards, at the top of the post, or both) — then one TASK.
