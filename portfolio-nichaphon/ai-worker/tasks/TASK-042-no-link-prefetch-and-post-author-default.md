# TASK-042: No link prefetch on the public site (DEF-1) + a new post's author defaults to him (OBS-22)
- Source: SPEC-010 (TEST-011 DEF-1, OBS-22 `[PM-decided]`)
- Status: **DONE** (2026-11-01, Sober — see §Review. Was REVIEW 2026-11-01, Fern)
- Depends on: TASK-041 `DONE` (met)
- Owner: Fern (FE)

**Zero real calls. No git write.** Files (closed list):
`front/src/components/layout/SiteShell/Header/SiteHeader.tsx`, `…/Footer/SiteFooter.tsx`,
`front/src/components/partials/{Blog/BlogList,Home/HomeAsk,Home/HomeHero,Services/ServicesCta}.tsx`,
`admin/src/components/Posts.tsx`, `admin/src/lib/edit.test.ts` (and the admin file that loads documents, if `site` must be read there).

## Why (cause measured by Sober, 2026-11-01, local, gateway on a closed port)

DEF-1: since TASK-033 every route is `ƒ` (dynamic). Next 15's `<Link>` still prefetches each visible link, but for a dynamic route
without `loading.tsx` the answer carries **only the route tree, no page data** (`…"about",{"children":["__PAGE__",{}]}],null,[null,null]…`,
~130 B). The browser then ends most of them as `net::ERR_ABORTED` (reproduced headless: 4 of 5 aborted on `/`).
**Cost: zero to `back/`** — a counting proxy saw **1** `GET /content` for a full browser load of `/` (the page itself) and **0** for the
5 prefetches. So the prefetch buys nothing on this site (no data, no loading state) and only produces the failed lines S6 counts.
(Why Next aborts rather than completes them is not verified; it does not matter for the fix.)

OBS-22: `Posts.tsx:166-167` pre-fills a new post's Author with the last-used author — today "Develyst Team" from the sample posts.

## What to do

1. **DEF-1** — `prefetch={false}` on every `next/link` `<Link>` in the six front files (header incl. the mobile menu and wordmark, footer,
   blog list, Home Ask, Home Hero, Services CTA). Nothing else changes; no `loading.tsx`, no config.
2. **OBS-22** `[SA-decided]` value — a new post's Author defaults to **`site.name` from the store** (today "Nichaphon Sayvav"); if the
   `site` document can't be read, empty (the field stays required). Remove the "last used author" rule and its comment. Existing posts
   keep their author (the six sample posts stay "Develyst Team" — his to edit, SQ44). Update `edit.test.ts` to match.

## Definition of Done

- [ ] 1. `bunx --package typescript@5 tsc --noEmit` → 0 in `front/` and `admin/`; admin `bun test` green; `front npm run build` exit 0
      (every route still `ƒ`).
- [ ] 2. Headless 1280×900 load of each of the 6 routes on the built front with `back/` up, wait 2.5 s: **0 failed requests, 0 `_rsc`
      requests**; then click a header link → the page opens (one `_rsc` on click, 200). Paste the counts.
- [ ] 3. AC-a guard: a picture of `/` and `/blog` — pixel-identical to before (the attribute renders nothing).
- [ ] 4. Admin: New post → Author shows `Nichaphon Sayvav`; an existing sample post still shows `Develyst Team`. Picture.
- [ ] 5. `git status --short`: only the listed files changed by you; zero real calls; servers stopped; scratch deleted.

## Implementation Notes
Fern, 2026-11-01. `D1` @ `b068fba` (uncommitted tree as found). No git write. **Zero real calls** (back/'s gateway on a closed port,
3998; Ask never pressed).

**DEF-1: `prefetch={false}` on all 11 `next/link` uses.** `next/link` is imported in exactly the six listed files and nowhere else in
`front/src` (grep). SiteHeader ×3 (wordmark, desktop nav, mobile drawer nav), SiteFooter ×1, BlogList ×1, HomeAsk ×3 (citation ref,
not-covered hint, resting links), HomeHero ×2 (primary `Button component={Link}` + the text link), ServicesCta ×1 (`Button
component={Link}`). Nothing else changed: no `loading.tsx`, no config.

**OBS-22: Author defaults to the stored `site.name`.** `AdminApp.tsx` (the file that loads documents): new `storedSiteName(saved)`
returns the **saved** (not the unsaved draft) `site.name`, or `''` if the document or field can't be read. It is passed to
`PostsPage` as `defaultAuthor`, then to `PostEditor`, where `newPost(defaultAuthor)` replaces the "last used author" rule; that rule's
comment is gone. Existing posts keep their own author. `edit.test.ts`: the newPost test is renamed and now uses `'Nichaphon Sayvav'`.
`lib/edit.ts` is not on the list, so `newPost`'s parameter keeps its old name `lastAuthor`. It is only a name (behaviour unchanged); a
one-word rename if you want it.

**DoD 1.** `bunx --package typescript@5 tsc --noEmit` → exit 0 in `front/` and `admin/`; admin `bun test` → 13 pass / 0 fail.
`front npm run build` → exit 0, every route `ƒ` (`/`, `/_not-found`, `/about`, `/blog`, `/blog/[slug]`, `/contact`, `/media/[file]`,
`/portfolio`, `/services`).

**DoD 2** (built standalone front on 127.0.0.1:3072; back/ up on a seeded scratch store; headless 1280×900; `tests/harness/task-042/check.mjs`):
```
/: failed=0 _rsc=0      /about: failed=0 _rsc=0      /services: failed=0 _rsc=0
/portfolio: failed=0 _rsc=0      /blog: failed=0 _rsc=0      /contact: failed=0 _rsc=0
click header About → url=/about, ONE _rsc request (rsc=1, next-url=/, no next-router-prefetch header) → response 200 /about
```
⚠️ **Not clean on the click:** that same one `_rsc` request, after its 200 response, is *also* reported by Chrome as
`net::ERR_ABORTED` (`GET /about?_rsc=… fetch`). The page opens correctly. It looks like the same "answered, then aborted" pattern you saw
on the prefetches, now on the one navigation fetch. **Cause not verified**; I changed nothing for it. So: 0 failed requests on every
**load** (the DoD's count), but 1 failed line per client-side navigation. Whether S6 counts that is a QA/SA call.

**DoD 3.** Same server and store, reduced motion, full page. Before = the build as it was (BUILD_ID 18:04:39; no `front/src` file newer
than it), after = my build. `/` → **0 differing pixels of 1280×3515**; `/blog` → **0 differing pixels of 1280×2531** (in-browser canvas
diff). Pictures: `project-docs/fe-task042-2026-11-01/{before,after}-{home,blog}.png`.

**DoD 4.** Stored `site.name` = "Nichaphon Sayvav". Admin → Posts → New post → Author **"Nichaphon Sayvav"**. Existing "API Security:
Protecting Your Backend Services" → Author **"Develyst Team"** (unchanged). Pictures: `admin-new-post-author.png`,
`admin-existing-post-author.png`. Nothing saved.

**DoD 5.** My changes are in the 6 front files + `AdminApp.tsx`, `Posts.tsx`, `edit.test.ts`. `git status` shows the same set as at session
start, plus `HomeAsk.tsx` newly `M` (its diff is my three attributes only). The others were already `M`/`??` from earlier TASKs. Ports
3072/3998/4014/4015 free; scratch stores deleted; no `back/data/`, no `package-lock.json`.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review

**Verdict: DONE** (Sober, 2026-11-01). Zero real calls in review.
- Re-run: `bunx --package typescript@5 tsc --noEmit` → 0 in `front/` and `admin/`; admin `bun test` → 13 pass / 0 fail.
  `grep`: 11 `<Link` / `component={Link}` uses in `front/src`, 11 `prefetch={false}`; `next/link` in exactly the 6 listed files.
- OBS-22: `AdminApp.tsx:57` `storedSiteName(saved)` (saved, not draft) → `PostsPage` → `newPost(defaultAuthor)` (`Posts.tsx:170`); the
  "last used author" rule is gone; existing posts keep theirs. `AdminApp.tsx` was allowed by the list's "the admin file that loads
  documents". The `lastAuthor` param name in `lib/edit.ts` — leave it (name only).
- DoD 2: 0 failed / 0 `_rsc` on every load of the 6 routes — S6 as written ("a clean load") now holds. DoD 3: 0-pixel diff on `/` and
  `/blog`. DoD 4: pictures, nothing saved.
- ⚠️ The one navigation `_rsc` on a click: 200, then reported `ERR_ABORTED`. **Accepted, not a defect of this TASK:** S6 and TEST-011's
  control count a clean **load**, not a click; the page opens correctly; cause unverified (same Next pattern as the prefetches). Passed
  to Porter so Tanya knows the re-test probe should count loads only, as S6 says, and can note the click line as an observation.
