# TASK-036: `admin/` — blog posts (write, draft, publish, delete) and pictures (upload, pick)
- Source: SPEC-010 (D6; TASK-034 §Contract posts + media rows; REQ-010 R2, AC-c)
- Status: **DONE** (2026-11-01, Sober — rework 1 verified, see §Review; list timing → TASK-040. Was REVIEW (rework 1) 2026-11-01, Fern)
- Depends on: TASK-035 `DONE`
- Owner: Fern (FE)

**Zero real calls. No git write. `admin/` only, plus ONE front file `front/src/app/media/[file]/route.ts` (added 2026-11-01 by
Sober — FQ56)** (no other `back/` or `front/` change; a contract gap → §Questions).

## What to do

1. **Blog → Posts** in the TASK-035 shell: a list (title, status badge, `publishedAt`, `updatedAt`), newest-updated first; "New post".
2. **Post editor** (`AdminPost`): title; slug (auto from the title while the slug is untouched, then free; shows the contract's
   pattern error inline); category (free text with suggestions from existing posts); excerpt; author (default = the last used
   author, else empty); read time; `publishedAt` (date, optional); cover (picture picker, step 4); `bodyMd` as a tall textarea with a
   **Preview** tab rendered by `react-markdown` (raw HTML off, same as the public page); status Draft/Published.
   Save = `POST` (new) / `PUT` (existing, id fixed — TASK-034 call 1). `409 {field}` and `400 {path}` → inline on that field.
   Delete = confirm dialog → `DELETE`.
3. **Pictures:** a Media page — grid of `GET /admin/api/media` with each URL copyable; **Upload** (`multipart/form-data`, field `file`)
   with the contract's limits shown up front ("JPG, PNG or WebP, up to 5 MB") and `400 bad_media {reason}` turned into a plain sentence.
4. **Picker:** replace TASK-035's plain `image` text inputs (certificates `imageUrl`, testimonials `image`, post cover) with a picker =
   the media grid in a modal + "Upload new". Picking writes the URL into the field; the document is saved by its own Save.

## Definition of Done

- [ ] 1. `cd admin && npx tsc --noEmit` → 0.
- [ ] 2. **AC-c path:** write a post with a heading, a list and a link in `bodyMd`, save as Draft → not on public `/blog`; Publish → on
      `/blog` within 60 s and opens at `/blog/<slug>` with the body rendered. Pictures in `../project-docs/fe-task036-2026-11-01/`.
- [ ] 3. Upload a real PNG → appears in the grid → pick it as that post's cover and as one certificate's picture → both visible publicly.
      Upload a `.png`-named text file → the plain-sentence error, nothing added.
- [ ] 4. Duplicate slug → the 409 shown on the slug field. Delete the post → gone from `/blog` within 60 s; `/blog/<slug>` → 404.
- [ ] 5. `git status --short` only `admin/**`; zero real calls; servers stopped; scratch store deleted.

## Implementation Notes
Fern, 2026-11-01. Repo `portfolio-nichaphon-web`, `D1` @ `b068fba` + the uncommitted TASK-029…035 tree. **Zero real calls** (gateway
pinned to dead `127.0.0.1:3999`). No git write. Evidence: `../project-docs/fe-task036-2026-11-01/` (9 pictures + 5 text files).

**Files.** New in `admin/`: `src/components/{Posts,Media}.tsx`. Changed in `admin/`: `src/lib/api.ts` (posts + media calls, `conflict` /
`bad_media` results, `previewSrc`), `src/lib/edit.ts` + `edit.test.ts` (`slugify`, `isSlug`, `newPost`, `postField`; 9 → 13 tests),
`src/schema.ts` (`PageEntry`; Blog → Posts + "Pictures (all pages)"), `src/components/{AdminApp,FieldInput}.tsx` (page entries; `image`
fields → picker), `package.json` + `bun.lock` (`react-markdown@^10.1.0`, same major as front). Front, per FQ56/FQ58:
`front/src/app/media/[file]/route.ts` (new) and the word `export` on `front/src/lib/content.ts:130`, nothing else.

**DoD**
1. `bunx tsc --noEmit` in admin → 0; `bun test` 13 / 0; front `npx tsc --noEmit` → 0; back `bun test` 85 / 0 (`dod1-5-checks.txt`).
2. **AC-c:** post with `## A heading`, a 2-item list and a link saved as **Draft** 19:45:19Z → `/blog` 0 hits, `/blog/<slug>` 404, back
   404. **Published** 19:45:31Z → `/blog/<slug>` 200 at once with `<h2>A heading</h2>`, `<li>first item</li>`, the `<a href>`;
   `/blog` lists it at 19:46:30 (**59 s**: my 19:45:23 draft check had cached the list for 60 s). Pictures `05`, `06`; `acc-poll.log`.
3. Upload of a `.png`-named text file → "That file is not a JPG, PNG or WebP picture. Nothing was added." Grid stays at 9 (`01`).
   Real PNG (generated stripes) → `/media/7f293f302ced.png`, grid 10 (`02`). Picked as certificate 01's picture (`03`, saved) and as
   the post's cover (`04` picker). Public `/about` shows it through `next/image` → the new route (`07`). Cover **stored**:
   `GET /content/posts/<slug>` → `"cover":"/media/7f293f302ced.png"` (`dod3-cover-stored.txt`, FQ57).
   **3a:** `curl -sI /media/7f293f302ced.png` → `200`, `content-type: image/png`, `cache-control: public, max-age=300`;
   `/media/..%2Fx` → 404; `/media/nope.png` → 404; `back/` stopped → **502, 0 bytes** (`dod3a-route.txt`). `next/image` accepted the
   route; no fallback was needed.
4. Duplicate slug (`building-scalable-web-apps-nextjs-typescript`) → `409 field=slug`, shown on the Slug field (`08`). Delete →
   confirm dialog (`09`), focus on Keep → deleted 19:48:07Z; `/blog` drops it by 19:48:18. ❌ **`/blog/<slug>` still 200 at 19:50:43,
   2.5 min later**, while back answers 404 → **FQ59**.
5. `git status`: `admin/**`, `front/src/app/media/[file]/route.ts`, `front/src/lib/content.ts` (untracked since TASK-033, so git shows the
   whole file as new; my change is one word), `.gitignore` (TASK-035). No `back/data`, no npm lockfile. Servers 4014/4015/3072
   stopped. Scratch store, logs and test files deleted. The 7 `[admin]` lines are content-free (`back-admin-log.txt`).

**FE decisions (internal; say if any is wrong):**
1. **No `updatedAt` column.** The TASK asks for it, but TASK-034's `AdminPost` has none (`toAdminPost` drops `updated_at`). The list
   shows Title · Status · Published · Category, ordered newest-updated (back's order). Adding the field = a `back/` change → yours.
2. New post id = its slug at creation. It is shown read-only under the form; renaming the slug later keeps the id (TASK-034 call 1).
   A 409 on `id` is shown on Slug.
3. Slug follows the title until he types in Slug. A Thai title gives an empty slug, so Save stays disabled until he types one.
   Pattern error inline, same regex as `back/`.
4. "Last used author" = the author of the newest-updated post. Published date is a native date input; empty = `null`, so the store
   fills today on first publish.
5. The picker previews every picture via `back/` `/media/<file>`, which serves both uploaded and seeded `/images/…` rows. Upload from
   inside the picker also picks it. The URL stays typeable.
6. Preview = `react-markdown` with no plugins, as on the public page. Styling is Mantine's `TypographyStylesProvider`, not the
   site's article CSS, so headings look bigger in the admin than on `/blog/<slug>` (compare `05` / `06`). Same renderer, different
   look; matching the look means importing front article CSS, not asked.
7. `/media` route sets `cache-control` only on a 2xx, so a 404 can't hide a just-uploaded file for 5 minutes. FQ56 said "add" it
   without a condition; one-line revert if you want it always.
8. The uploaded test PNG went in as 1 615 bytes (the in-page copy I built). Still a valid PNG: decoded in the grid and on `/about`.

**Audit** (impeccable product checks, same as TASK-035). Fixed: "Delete post" was a filled red button whose white text sits ~2.3:1 on
the dark-scheme red fill → `light` variant, measured **11.75:1** composited. Media URLs showed a stray trailing `/` (`truncate="start"`
is RTL) → inner `dir="ltr"`. The Copy button was clipped → `flexShrink: 0`. Errors use `red-text` as in TASK-035. Modal focus lands on
Keep (verified). Note: modals open slowly in the browser pane (it throttles animation frames); the real clicks work.

**Rework 1 (Fern, 2026-11-01) — FQ59.** `front/src/lib/content.ts` only: `read()` takes an optional `init`, default unchanged
`{ next: { revalidate: 60 } }`; `getPost` alone passes `{ cache: 'no-store' }` (+ a 2-line doc note on why). `getPosts` and the
documents keep the 60 s cache. Front rebuilt; `npx tsc --noEmit` → 0.
DoD 4 re-run (`rework1-dod4.log`): two posts published through the admin API (the same calls the UI makes; the UI delete path was proven
in round 1), each post page warmed 3× (cached 200), then:
- `19:56:26.461` DELETE `rework-delete-036` → 204 · `19:56:26.577` `/blog/rework-delete-036` → **404** (first poll, 116 ms).
- `19:56:26.608` PUT `rework-unpublish-036` status=draft → 200 · `19:56:26.744` `/blog/rework-unpublish-036` → **404** (136 ms).
- `/blog` list: both still listed until 19:57:28, gone at **19:57:33 = 67 s** after the change. ⚠️ Over the 60 s you wrote. Cause
  (inferred from the timings, same as TASK-035's 43 s): the list keeps `revalidate: 60`, and Next serves the stale copy to the first
  request after expiry while it refreshes. My warm-up at ~19:56:25 started the clock, so the worst case = 60 s + the gap to the next
  visit. A strict ≤ 60 s for the list needs a shorter revalidate or no-store on `getPosts` — your call, not in this rework.
- Note: `content.ts:8`'s header comment ("Every read goes through … revalidate: 60") is now slightly untrue for `getPost`. I left it
  because "nothing else in the file"; say if you want the one line updated.
Footprint: servers stopped, scratch store + logs deleted, no `back/data`; `git status` = 21 paths (`admin/**`, the route,
`content.ts`, `.gitignore`) — `rework1-checks.txt`. Zero real calls.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

**FQ56 (Fern, 2026-11-01) — an uploaded picture cannot show on the public site; blocks only DoD 3's "visible publicly".** Upload returns
`url: "/media/<hash>.png"` (TASK-034). The front passes `imageUrl`/`image` straight into `src` (`AboutCertificates.tsx:17`,
`AboutTestimonials.tsx:16`), so the browser asks the **front's** host for `/media/…` — the front has no such route and `next.config.ts`
no rewrite → broken image. Seeded `/images/…` rows work only because those files sit in `front/public`. A fix needs a `front/` file,
outside my closed list. Proposal: one rewrite in `front/next.config.ts` — `/media/:file` → `${CONTENT_API_URL}/media/:file` (no
component change; also what a deploy would need). Checked: SPEC-010 D1/§Routes, TASK-033 — not covered.

**FQ57 (Fern, 2026-11-01) — the front never renders a post `cover`; blocks only DoD 3's "post cover visible publicly".** `grep cover
front/src` → only the type (`lib/content.ts:120`); `/blog` and `/blog/[slug]` ignore it (SPEC-010 §Routes: "`cover` (null today)").
Showing it is a new visual on public pages (where, what size, alt text) — a design call, not mine. Proposal: DoD 3 proves the cover
is **stored** (`GET /content/posts/<slug>` → `cover: "/media/…"`) and the public half moves to a later TASK, or you name the placement.

I am building everything else meanwhile (admin only); the picker writes the URL either way.

> answer FQ56 (Sober, 2026-11-01): **Right — my SPEC's gap** (D4 served `/media/*` from `back/` and never said how the front's pages reach
> it). Fixed in this TASK, **but not with a `next.config.ts` rewrite**: a rewrite's destination is evaluated at **build** time, so
> `CONTENT_API_URL` would be baked into the build — exactly what D4 avoided. Instead, **one new front file is added to your closed list:**
> `front/src/app/media/[file]/route.ts` — `GET` only: refuse a name containing `/`, `\` or `..` (404, same rule as `back/`); `fetch`
> `${CONTENT_API_URL}/media/<file>` **at request time** (reuse the URL helper from `front/src/lib/content.ts`, do not re-read the env
> another way); pass through status, `content-type` and the body stream; add `cache-control: public, max-age=300`; `back/` unreachable
> → 502 with no body text. No component changes (`src` already receives `/media/…`). If `next/image` in `ImageLightbox` refuses the
> route for any reason, say so in §Implementation Notes and use the plain `<img>` it falls back to — do not touch `next.config.ts`.
> **New DoD 3a:** `curl -sI http://localhost:<front>/media/<uploaded file>` → `200` + the picture's mime; `/media/..%2Fx` → `404`;
> with `back/` stopped → `502`. Then the certificate picture shows publicly (DoD 3's public half).
>
> answer FQ57 (Sober, 2026-11-01): **Your proposal, taken.** No REQ asks for post cover pictures — `cover` was my addition (D6), so
> showing it is a new public visual I will not invent. **DoD 3 for the cover = stored only:** `GET /content/posts/<slug>` →
> `cover: "/media/…"`. Whether and where covers appear on `/blog` goes to the owner as **SQ49** (default: not shown). The admin picker
> for covers stays — it costs nothing and is ready if he says yes.

**FQ58 (Fern, 2026-11-01) — the helper FQ56 says to reuse is private.** `front/src/lib/content.ts:130` is `const apiBase = () => …`
(not exported), so `route.ts` can only reuse it if `content.ts` gains `export` — a second front file outside the list. Options:
(a) add the one word `export` to `content.ts:130` (my pick: one source for the env + default); (b) `route.ts` reads
`process.env.CONTENT_API_URL || 'http://localhost:4014'` itself (your answer says not to). Which? Everything else proceeds.

> answer (Sober, 2026-11-01): **(a).** `front/src/lib/content.ts` is added to your closed list for **exactly one change**: the word
> `export` on line 130 (`export const apiBase = …`). Nothing else in that file. DoD 5's `git status` will then show it as ` M` — expected.

**FQ59 (Fern, 2026-11-01) — a deleted post stays readable at `/blog/<slug>`; DoD 4's second half FAILS, not in my files.** After the
delete (19:48:07Z): back `GET /content/posts/<slug>` → **404**; the front's `/blog/<slug>` → **200 with the old body** at every poll
until 19:50:43 (`acc-poll.log`). `/blog` itself dropped it in ≤ 11 s. Before publishing, the same URL was 404, so a 404 is not
cached. **Inferred, not proven:** `getPost` reads with `next: { revalidate: 60 }`; when the background revalidation gets a non-2xx,
Next seems to keep serving the last good entry instead of storing the 404. Unpublishing a post would hit the same path. The fix is in
`front/src/lib/content.ts` `read()`/`getPost` (e.g. `cache: 'no-store'` for the one-post read), which is outside my one-word
permission. Also a public-content issue: a post he deletes stays reachable to anyone with the link. Yours to cut or rule on.

> answer FQ59 (Sober, 2026-11-01): **Real, and my SPEC's gap** — D4 gave every read the same 60 s cache and never said what a
> delete/unpublish must do. A post he removes must disappear from its own address. Your inferred cause (the cache keeps the last good
> entry when the refresh gets a 404) is labelled **inferred**; the fix is cut either way and proven on your same recipe.
> **`front/src/lib/content.ts` joins your list for this:** `read()` takes an optional fetch-options argument (default unchanged:
> `{ next: { revalidate: 60 } }`), and **`getPost` alone** passes `{ cache: 'no-store' }`. Nothing else in the file; the list
> (`getPosts`) and documents keep the 60 s cache. Cost: one local request to `back/` per post view — fine.

## Review

**Verdict: REWORK** (Sober, 2026-11-01) — **only for FQ59, whose fix sits in a file I had not given you.** Everything else is accepted.
- Re-run: `admin bunx tsc` → 0, admin `bun test` → 13 pass; `front npx tsc` → 0. Read `front/src/app/media/[file]/route.ts` whole: name
  rule, request-time fetch via `apiBase()`, 502 on unreachable, `cache-control` only on 2xx — exactly FQ56's answer (your call 7: **accepted**,
  a cached 404 would hide a fresh upload).
- AC-c path (draft hidden, publish shows with heading/list/link), upload refusal sentence, picker → certificate visible publicly, cover
  stored, DoD 3a (200 / 404 / 404 / 502) — all evidenced in `../project-docs/fe-task036-2026-11-01/`.
- Your 8 calls — **all accepted**. #1 no `updatedAt` in the list: my TASK asked for a column the TASK-034 contract never carried —
  my mismatch; the list is still ordered by it, and showing it is not worth a `back/` change now. #6 preview styled by Mantine not the
  site's article CSS — accepted (same renderer; the public page is the truth).
- **To finish:** the FQ59 change above, then re-run **DoD 4 on the same recipe** — delete a published post → `/blog/<slug>` → **404 within
  5 s** (poll every second, paste timestamps); also **unpublish** one (Published → Draft) → 404 the same way; `/blog` still drops it ≤ 60 s.
  Plus `front npx tsc` 0 and the `git status` line.

**Rework 1 verdict: DONE** (Sober, 2026-11-01). Read `content.ts:133-175`: `read()` default unchanged, `getPost` alone `no-store`. Your
recipe: deleted and unpublished post pages → 404 at 116 ms / 136 ms after the change, warmed caches and all. FQ59 closed.
**Your ⚠️ (list at 67 s) is correct, and it is a flaw in my D4, not in this TASK:** with `revalidate: 60` Next serves the *stale* copy to
the first visit after expiry, so a single visitor can see old content for 60 s **plus however long until the next visit** — R4's
"within one minute" is not actually guaranteed on any page (TASK-035's 43 s was luck of timing). Fixed in a new small **TASK-040**
(all reads `no-store`; header comment updated there — leave it now). Not yours to fix inside 036.
