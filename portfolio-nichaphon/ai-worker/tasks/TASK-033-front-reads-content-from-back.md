# TASK-033: `front/` reads its content from `back/` — `lib/content.ts`, props from pages, `/blog/[slug]`, unavailable state
- Source: SPEC-010 (D4 front half, D6 page, §API rows 1–3; AC-g regression)
- Status: **DONE** (2026-11-01, Sober — see §Review. Was REVIEW 2026-11-01, Fern: 12/12 route pictures 0-pixel diff)
- Depends on: TASK-032 `DONE` (its seed + read routes are this TASK's only data source)
- Owner: Fern (FE)

**Zero real calls** (the Home AI is untouched here). No git write. No admin, no write route.
**TASK-028 is still open on SQ40** — do not touch `front/src/constant/ask.ts` or `front/README.md`.

## What to do

Read SPEC-010 D4 + D6 + §API. The visual result must be **identical** to today on all six routes — this TASK moves where the
words come from, not how they look.

1. **`front/src/lib/content.ts` (new, server-only — first line `import 'server-only'` if the package is present; if not, say so
   and rely on it being imported only from server components)** — `CONTENT_API_URL` (server env, default
   `http://localhost:4014`); `getDocuments()`, `getPosts()`, `getPost(slug)` using
   `fetch(url, { next: { revalidate: 60 } })`; types re-used from `@/types/app/content`; a `copy` type matching TASK-032's
   `copy` document. Network error or non-200 → throw `ContentUnavailableError`.
2. **Every route** (`app/page.tsx`, `about`, `services`, `portfolio`, `blog`, `contact`, and `layout.tsx` for header/footer/SITE):
   `export const dynamic = 'force-dynamic'`; fetch once in the page (or layout for `SITE`), pass data **as props** down.
   `metadata` → `generateMetadata()` reading `copy.<page>.title/description`. Today's **visible output must not change**.
3. **Components** — every file in the importer list (31 files: `grep -rln "constant/content\|constant/site\|\.config'" front/src`
   — paste your own run of it before you start) stops importing **content** and takes props instead. **Machinery stays where it
   is**: `NAV_LINKS`/`FOOTER_LINKS`, `HERO_CTA_*`, `FILTER_LABEL`, `EMPTY_MESSAGE`, `FORM_COPY`, everything in `Ask.config.ts`
   (SPEC-010 §Data Model "Stays in code"). Client components (`BlogContent`, `BlogFilter`, the modal, …) get plain serialisable props.
   `ContactForm`'s `mailto:` reads the email from the `site` prop.
4. **Delete the content constants that moved**: `front/src/constant/content/{about,contact,posts,projects,quotes,services}.ts`,
   and the content exports listed in TASK-032 step 6 from each `*.config.ts` (keep the machinery exports). `SITE` leaves
   `constant/site.ts` (keep `NavLink`, `NAV_LINKS`, `FOOTER_LINKS`). **Before deleting, check** `back/scripts/seed.ts` and
   `back/scripts/build-projects-md.ts` import these files — **they do**: copy each deleted constant verbatim into
   `back/seed/front-content-2026-11-01.ts` (new, one file, a header saying "frozen copy of front/src/constant/content as of
   2026-11-01 — seed input only") and point both scripts there; `bun run build:projects` output must be byte-identical (its test).
5. **`/blog`** — list from `getPosts()`; categories derived from the posts (`'All'` stays a machinery constant); each card links to
   `/blog/<slug>`. **`front/src/app/blog/[slug]/page.tsx` (new)** — `getPost(slug)` → title, author, date, read time, category,
   excerpt, then `bodyMd` rendered with `react-markdown` (new dependency, raw HTML off = its default); `404` → Next `notFound()`.
   An empty `bodyMd` renders the header and excerpt only — no placeholder text.
6. **Unavailable state** — `ContentUnavailableError` on any page → a short message in the page body using existing UI pieces
   (`GlassPanel` + text), header and footer still render from a minimal fallback (name only, from `NAV_LINKS` + the literal site
   name already in `layout.tsx` metadata). No crash, no constant content.

7. **Carried from TASK-032 review (call 4):** `back/scripts/seed.ts` registers only picture files in `media`
   (`jpg|jpeg|png|webp|gif|svg`, case-insensitive) — `reviews/README.md` is no longer a row; `store.test.ts` asserts 9 media rows
   and that `/media/README.md` → 404. `copy` keys are `copy.<page>.<EXPORT_NAME>` + `copy.<page>.metadata` (TASK-032 call 2) — read
   `seed.ts` for the exact shape; `SERVICES_CTA` is stored whole including `action` (call 3) — render it from `copy`.

Do NOT touch: anything under `back/src/`, the Ask section's behaviour, theme, CSS values, `ask.ts`, READMEs, `next.config.ts`
(unless the build demands it — then ask first in §Questions).

## Definition of Done

- [ ] 1. Before edits: `cd front && npx tsc --noEmit` → exit 0, `npm run build` → exit 0 (paste both); `cd back && bun test` summary.
- [ ] 2. After: `npx tsc --noEmit` 0 · `npm run build` exit 0, **with `back/` not running** (proves D4: build needs no content) — paste the route table (every content route `ƒ`).
- [ ] 3. `grep -rn "constant/content" front/src` → 0 · `grep -rn "SITE\b" front/src/constant/site.ts` → 0.
- [ ] 4. Seeded `back/` (TASK-032 recipe, temp `DATA_DIR`, `GATEWAY_BASE_URL` dead port, `PORT=4099`) + `CONTENT_API_URL=http://localhost:4099 npm run start` (port of your choice):
      **pictures of all six routes at 1280 and 360**, side by side with the same routes built from `b068fba`'s constants
      (build that once in a scratch copy, outside the repo). Any visible difference = a defect to list, not to explain away.
- [ ] 5. `/blog/<a seeded slug>` 200 with header + excerpt; `/blog/nope` 404 page.
- [ ] 6. Stop `back/`, reload `/about` → the unavailable state (picture), no stack trace in the page.
- [ ] 7. `cd back && bun test` green (incl. `projects-md.test.ts` byte-identical) · `bunx tsc --noEmit` 0.
- [ ] 8. `git status --short` + `git diff --stat` pasted; zero real calls; every server you started stopped.

## Implementation Notes
(Fern, 2026-11-01.) `D1` @ `b068fba`; the front tree was identical to `b068fba` at start (`git diff --stat b068fba -- front` empty).
**Zero real calls** (the Home AI was never touched; `back/` ran with `GATEWAY_BASE_URL=http://127.0.0.1:1`). No git write, no admin/write route,
nothing under `back/src/` touched by this TASK. `ask.ts`, `front/README.md`, `next.config.ts` and theme/CSS values were not touched.

Importer list, my own run of `grep -rln "constant/content\|constant/site\|\.config'" front/src` → **31 files** (as SPEC-010 said). Of those,
`HomeAsk.tsx` and `useAskSocket.ts` import only Ask machinery and are unchanged.

**What changed**
- New `front/src/lib/content.ts`: `CONTENT_API_URL` (default `http://localhost:4014`), `getDocuments` / `tryGetDocuments` / `getPosts` / `getPost` / `findQuote`,
  `ContentUnavailableError`, and the `SiteInfo` / `SiteCopy` / `SiteContent` types matching `seed.ts`'s documents. **`server-only` is not installed**, so the module
  has no `import 'server-only'`. It holds because only server files import it, as the TASK allows.
- All six routes + `layout.tsx`: `dynamic = 'force-dynamic'`, `generateMetadata()` from `copy.<page>.metadata` (the layout keeps today's `title.default` /
  `%s — <name>` template / description, with `keywords` as a literal there), and content passed down as props.
  The **layout reads `site` for the header/footer**, and every page reads `getDocuments()` itself (the same request; Next dedupes the fetch).
- Components take props; machinery stays in code (`NAV_LINKS`/`FOOTER_LINKS`, `HERO_CTA_*`, `FILTER_LABEL`, `EMPTY_MESSAGE`, `FORM_COPY`, `Ask.config.ts`).
  `ALL_CATEGORIES` moved into `Blog.config.ts` as machinery. Categories are now derived in `BlogContent` from the posts (`BLOG_CATEGORIES` is gone).
  `ContactForm`'s `mailto:` reads the `email` prop.
- Deleted: `constant/content/{about,contact,posts,projects,quotes,services}.ts`, `About.config.ts`, `Services.config.ts`, `Portfolio.config.ts` (every export
  in them was content), plus the content exports of `Home/Blog/Contact.config.ts`. `SITE` left `constant/site.ts`.
- **Frozen copy:** `back/seed/front-content-2026-11-01.ts` (814 lines). It was built by a script that slices each source file between asserted first/last lines,
  then checked by importing both sides: **36 exports compared, 0 differ**. `seed.ts`, `build-projects-md.ts`, **`projects-md.test.ts` and `store.test.ts`**
  (the last two also imported the deleted files) now point there. `build-projects-md.ts` keeps `SOURCE = "front/src/constant/content/projects.ts"`,
  because that string is printed into `PROJECTS.md`. `bun run build:projects` → `git diff knowledge/PROJECTS.md` **empty (byte-identical)**.
- Step 7: `seed.ts` registers only `jpg|jpeg|png|webp|gif|svg` → **9 media**. `store.test.ts` asserts `media: 9` and `/media/README.md` → 404.
- `/blog/[slug]` (new): `RouteHero` (category / title / excerpt) + a meta line (`formatDate` · read time · author, Mantine `Text dimmed`) + `react-markdown`
  only when `bodyMd` is non-empty; 404 → `notFound()`. `/blog` cards: the title is now a `next/link` to `/blog/<slug>`, styled `color: inherit; no underline`
  (underline on hover; focus uses the global `:focus-visible` ring). That needed a `.titleLink` rule in `BlogList.module.css`, a file outside the importer list.
- `ContentUnavailable` (new, `components/ui/`): `PageSection` + `GlassPanel` + one sentence. Header/footer fallback = the name (layout literal
  `FALLBACK_SITE_NAME`) + nav links, with no role, location, email or copyright.

**Decisions I took — accept or overrule**
1. **`PullQuote` takes `quote` (not `id`) and renders nothing when it is missing.** It used to throw "programmer error". The quotes are editable now, and a throw would
   take the page down. As a consequence, `HomeStatement.tsx` (not in the 31) had to change too: it renders `PullQuote`.
2. `react-markdown@10.1.0` was added with **bun** (`front/bun.lock` updated). ⚠️ I first ran `npm install`, which wrote a `package-lock.json`. I deleted it
   (the repo locks with `bun.lock`) and re-synced with `bun install`, so no npm lockfile remains.
3. DoD 4 used the standalone `server.js` on **both** sides (the repo builds `output: standalone`), not `npm run start`, so the two sides are the same kind of server.

**DoD evidence**
1. Before: front `npx tsc --noEmit` → exit 0. `npm run build` → exit 0, every route `○` static (`/` 7.25 kB … `/services` 2.5 kB). Back `bun test` → `62 pass / 0 fail`.
2. After, with **no `back/` running** (4014/4099 checked): `npx tsc --noEmit` 0. `npm run build` exit 0. Route table: `ƒ /` 7.23 kB · `ƒ /_not-found` · `ƒ /about` 2.65 kB ·
   `ƒ /blog` 4.64 kB · `ƒ /blog/[slug]` 2.23 kB · `ƒ /contact` 3.8 kB · `ƒ /portfolio` 4.63 kB · `ƒ /services` 2.5 kB — **every route `ƒ`**.
3. `grep -rn "constant/content" front/src` → **0** · `grep -rn "SITE\b" front/src/constant/site.ts` → **0**.
4. Seeded temp store (`16 documents, 6 posts, 9 media`), `back/` on 4099 (dead gateway); BEFORE = the pre-change standalone build on 3101, AFTER = new build on 3102
   with `CONTENT_API_URL=http://localhost:4099`. A headless Playwright script took full-page shots, with reduced motion, of the six routes at 1280×900 and 360×740 on both,
   and **counted differing pixels in-browser**:
   **12 / 12 pairs: 0 differing pixels**, identical page size, identical `<title>`, identical `<main>` text, HTTP 200/200.
   24 pictures: `../project-docs/fe-task033-2026-11-01/<route>-<1280|360>-<before|after>.png`. **No visible difference → no defect to list.**
5. `/blog/building-scalable-web-apps-nextjs-typescript` → **200**, title `Building Scalable Web Applications with Next.js and TypeScript — Nichaphon Sayvav`, main = category,
   title, excerpt, `15/Jan/25 · 8 min read · Develyst Team`, no body (as seeded). `/blog/nope` → **404** (Next's 404 page). Pictures: `blog-slug-1280.png`, `blog-slug-360.png`, `blog-nope-1280.png`.
   `/blog` links: all six `href="/blog/<slug>"`.
6. `back/` stopped → **`/about` still showed the content** (200, full page). The cause is Next's 60 s data cache: it kept serving the last good `/content` response, and a failed
   background revalidation does not drop it. I then stopped the AFTER server, cleared its `.next/standalone/.next/cache/fetch-cache` (runtime output of my own run; 3 entries),
   and restarted it with `back/` still down → `/about` = **"Content is unavailable right now."**, title `Nichaphon Sayvav`, header = name + nav, footer = name + links,
   `stack-trace-in-page: false`, HTTP 200. Pictures: `about-unavailable-1280.png`, `about-unavailable-360.png`.
7. `cd back && GATEWAY_BASE_URL=http://127.0.0.1:1 bun test` → `62 pass / 0 fail / 273 expect() calls / Ran 62 tests across 8 files` (incl. `projects-md.test.ts`) · `bunx tsc --noEmit` 0.
8. `git status --short`: REQ-009/TASK-032 set + this TASK. Front: 61 ` M`/` D` + `?? front/src/{lib/content.ts, app/blog/[slug]/, components/ui/ContentUnavailable/}`.
   Back: ` M back/scripts/build-projects-md.ts`, ` M back/test/projects-md.test.ts`, `?? back/seed/` (plus `seed.ts`/`store.test.ts`, already untracked).
   `git diff --stat` → `68 files changed, 803 insertions(+), 1126 deletions(-)` (against HEAD, includes REQ-009/TASK-032). Zero real calls. I stopped every server
   I started (bun 19264, node 30476, 12040, 31756); 3101/3102/4099 are free. The temp store and the BEFORE build copy are deleted. No `back/data/`.

**Line endings (FYI, not changed):** 31 of the touched files are now **uniformly LF** in the working copy (none mixed). That includes `back/src/store/db.ts`, which I counted
as CRLF at TASK-032 and which was last written at 01:05, after that count; I did not find out what rewrote it. `core.autocrlf=true` converts on commit, so the committed content is unaffected.

Not run: `/impeccable audit`. The TASK moves data and orders no visual change, and the 0-pixel diff is stronger evidence than an audit for "unchanged".
The two new surfaces (`/blog/[slug]`, the unavailable state) are not audited; see FQ55.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

**FQ55 (non-blocking — to Sober; visible, so it goes up rather than being my call).** Three things a visitor would see, each built with a default:
(a) **The unavailable sentence** "Content is unavailable right now." is SPEC-010 D4's own phrase, made into a sentence. It is site copy nobody approved → owner's words via Porter?
(b) **`/blog/[slug]` puts the post title in `RouteHero`'s display type**: a 10-word title fills most of the first screen at 1280 (`blog-slug-1280.png`). The TASK gave
no visual direction. Keep it, or give articles a smaller heading (a design call, so it needs a TASK)?
(c) **The outage behaviour (DoD 6):** once a page has been served, Next's data cache keeps showing the last good content when `back/` is down. The unavailable state
appears only when nothing is cached (cold start, or a cache older than the process). That fits D4's "never stale *constants*" (it is the store's own last answer),
but D4 says "unreachable → unavailable state". Accept it as the behaviour, or should an outage show the unavailable state even when cached copy exists?

> answer (Sober, 2026-11-01): (a) **Keep the sentence; no approval needed** `[SA-decided]` — a status message, the same class as the
> Ask section's failure sentences (machinery under SQ44a's default); it states nothing about him. FYI to Porter.
> (b) **Keep it for now** `[SA-decided, reversible]` — no REQ asks for an article layout; it rides to the owner as **SQ47** with your
> picture; a smaller article heading is a one-TASK change if he wants it. (c) **Accepted as the behaviour** — the store's own last
> good answer during an outage serves a visitor better than an error and is not a second source of truth. SPEC-010 D4 amended:
> *unreachable with nothing cached → unavailable state; with a cached answer → that answer until `back/` returns*.

## Review

**Verdict: DONE** (Sober, 2026-11-01). Zero real calls in review.
- Evidence reviewed: the 0-pixel diff method (in-browser pixel count, both sides standalone, same viewport, reduced motion) is a
  stronger check than I asked for; 29 pictures present in `../project-docs/fe-task033-2026-11-01/`; I opened `about-unavailable-1280.png`
  (header + nav + one-sentence panel + footer, no trace).
- Re-run by me: `grep -rn "constant/content" front/src` → 0; no `front/package-lock.json`; `front npx tsc --noEmit` → 0;
  `back bun test` → `75 pass / 0 fail` (incl. TASK-034's); `back bunx tsc` → 0; `knowledge/PROJECTS.md` diff empty after the repoint.
- Carry from TASK-032 done (9 picture rows, README 404). Your three calls — **accepted**: `PullQuote` renders nothing instead of
  throwing (right now that quotes are editable; `HomeStatement.tsx` outside the list is the necessary consequence); bun lockfile kept,
  the stray npm lockfile removed; standalone on both sides of the diff.
- Line endings: 31 touched files now uniformly LF in the working copy, none mixed; `core.autocrlf=true` normalises on commit, so no
  action. Who rewrote `db.ts` to LF is unknown — not chased, harmless.
- FQ55 answered above (a keep · b → SQ47 · c accepted, D4 amended).
