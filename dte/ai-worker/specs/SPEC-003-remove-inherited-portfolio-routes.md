# SPEC-003: Remove the inherited portfolio-site routes from the DTE frontend
- Source: REQ-003
- Status: DONE — its one TASK (TASK-014) reviewed `DONE` 2026-09-09 by Sober
- Written: 2026-09-08 by Sober (SA Lead)

## Overview

Four inherited routes (`/portfolio`, `/services`, `/contact`, `/blog`) are deleted from
`front/src/app/`, the two data files that exist only to feed them are deleted with them, the
four links that point at them are removed, and the four paths are re-served as **redirects to
`/`** declared in `front/next.config.ts`.

Approach and why: Next.js App Router has no "soft delete" for a route — a route exists iff its
`page.tsx` exists. So removal is a directory delete, and the redirect must come from somewhere
that survives the delete. The three candidates were a `next.config.ts` `redirects()` entry, a
`middleware.ts`, and leaving stub `page.tsx` files that call `redirect()`. **`redirects()` is
chosen**: it is declarative, it is the only one of the three that keeps zero code in
`src/app/` (REQ-003 §Requirement 2 — no dead files left behind), and it needs no new file.
A `middleware.ts` would run on every request to every route in order to serve four dead paths,
and stub pages would be exactly the dead files the REQ says to remove.

This is a **single-side change: `front/` only, one owner (Fern), one TASK.** Nothing in `back/`
is touched (REQ-003 C2), so **this SPEC declares no BE↔FE contract** — there is no new HTTP
surface, no request or response shape, and no field-casing question to settle.

**This SPEC is independent of SPEC-001** (REQ-003 C4). It does not migrate any component, does
not use the antd `ui/` wrappers, and is not gated on any SPEC-001 TASK. The owner's
"foundation first" (`SYSTEM-FACTS.md` A12) is scheduling, not a dependency — SPEC-001's
TASK-001…003 are already `DONE`, so nothing is being jumped anyway.

## Enumeration — what is actually in the tree (read-only, by me, 2026-09-08)

This is the complete list. It was produced by grepping the real repo, and it **corrects one
path REQ-003 quotes from the 2026-09-07 survey** — TASK-002 moved the components since.

**Route directories to delete (4):**

| Path | Notes |
|---|---|
| `front/src/app/portfolio/page.tsx` | imports `@/constants/portfolio` |
| `front/src/app/services/page.tsx` | imports `@/constants/services` |
| `front/src/app/contact/page.tsx` | imports nothing project-local |
| `front/src/app/blog/page.tsx` | imports nothing project-local |

Each directory contains that one file and nothing else — delete the directory.

**Supporting files to delete (2)** — REQ-003 §Requirement 2. Each is imported by exactly one
of the deleted pages and by nothing else in the repo:

- `front/src/constants/portfolio.ts` — sole importer `src/app/portfolio/page.tsx:6`
- `front/src/constants/services.ts` — sole importer `src/app/services/page.tsx:2`

`front/src/constants/theme-tokens.ts` stays (it is SPEC-001's, unrelated).

**Links to remove (4, in 2 files):**

| File | Line (as of 2026-09-08) | Link |
|---|---|---|
| `front/src/components/layout/Footer.tsx` | 14–19 | `/services` — "Services" |
| `front/src/components/layout/Footer.tsx` | 20–25 | `/portfolio` — "Portfolio" |
| `front/src/components/layout/Footer.tsx` | 26–31 | `/contact` — "Contact" |
| `front/src/app/verify-email/page.tsx` | 148–155 | `/contact` — the "Help Text" block |

⚠️ REQ-003 §Requirement 3 gives the Footer as `front/src/components/Footer.tsx`. **It is not
there** — it is `front/src/components/layout/Footer.tsx` (moved by TASK-002). The REQ is right
about the content and stale about the path; the path above is the one on disk.

**Nothing else points at a removed route.** `src/components/layout/Navbar.tsx`'s `navigation`
array is `/`, `/courses`, `/about`, `/teach` — clean. There is no `sitemap.ts`, no `robots.ts`,
and no link to `/blog` anywhere outside the deleted page itself.

### Traps — three things that look in scope and are NOT

1. **`front/src/services/` is NOT the `/services` route.** It is the API client layer
   (`api.ts`, `aiChat.ts`), imported as `@/services/api` by `login`, `register`,
   `verify-email`, `classroom/[id]`, `AuthContext`, and as `@/services/aiChat` by `AIChat`,
   `SearchAI`. Deleting or renaming it breaks authentication site-wide.
   **Do not touch `src/services/`.**
2. **The English word "Portfolio" inside Thai marketing copy is not a link.** It appears in
   `src/app/page.tsx:112`, `src/app/about/page.tsx:165`, `src/app/about/page-new.tsx:165` and
   `src/lib/mockData.ts:163` as prose ("Portfolio ดีกว่า Certificate"). It is user-facing copy
   the owner has never been asked about. **Leave every one of them exactly as-is.**
3. **`front/src/app/about/page-new.tsx` and `front/src/app/about/page.tsx.backup` are strays**
   that predate this team. They are not routes (App Router serves only `page.tsx`) and they are
   not "supporting code for the four routes", so REQ-003 does not reach them. **Leave them.**
   Recorded in §Questions Q2 for Porter to raise separately if he wants.

## API / Interface Design

No API change. `back/` is untouched. The only interface that changes is the public URL surface
of `front/`:

| Path | Before | After |
|---|---|---|
| `/portfolio` | 200, inherited page | **307** → `location: /` |
| `/services` | 200, inherited page | **307** → `location: /` |
| `/contact` | 200, inherited page | **307** → `location: /` |
| `/blog` | 200, inherited page | **307** → `location: /` |
| `/`, `/about`, `/courses`, `/classroom/[id]`, `/teach`, `/login`, `/register`, `/verify-email` | 200 | **200, unchanged** |

### Decision 1 — the redirect is TEMPORARY (307), not permanent (308)

`front/next.config.ts` gains, inside the existing `nextConfig` object:

```ts
  async redirects() {
    return [
      { source: '/portfolio', destination: '/', permanent: false },
      { source: '/services',  destination: '/', permanent: false },
      { source: '/contact',   destination: '/', permanent: false },
      { source: '/blog',      destination: '/', permanent: false },
    ];
  },
```

`permanent: false` emits **307**; `permanent: true` would emit **308**.

Why temporary, stated plainly so the owner can overturn it in one word: he said **"redirect"**
(`SYSTEM-FACTS.md` A11) and said nothing about permanence — REQ-003 §Requirement 5 leaves that
call to me. A **308 is cached by the visitor's browser indefinitely**: once a real user's
browser has seen it, that browser stops asking the server for `/contact` even after we change
our minds, and we cannot clear it. On a live site with real visitors (REQ-003 C1) that is a
one-way door bought for nothing — the redirect looks identical to the visitor either way.
**307 keeps the decision reversible.** The SEO argument for 308 does not apply here: these
pages advertise a different product, so we want them dropped from the index, not their ranking
transferred to DTE's home page.

⚠️ Only `permanent: false` may be used. If a later REQ wants 308 it is a one-line change, and
it must be the owner's call, because that one is not reversible.

### Decision 2 — the Footer keeps only "About"

The three `<Link>` blocks are **deleted, not repointed.** REQ-003 §Requirement 3 allows either.
No DTE page is a substitute for "Services" / "Portfolio" / "Contact", and choosing a
replacement label or destination would be inventing site navigation — that is REQ-001 and
owner territory, not mine. The surrounding
`<div className="flex justify-center space-x-6 md:order-2">` wrapper and the copyright line
stay exactly as they are; only the three `<Link>…</Link>` elements go, and the `/about` link
keeps its current markup verbatim.

### Decision 3 — `verify-email`'s support link: the whole Help Text block is removed

`front/src/app/verify-email/page.tsx` lines 148–155 render
`มีปัญหา? <Link href="/contact">ติดต่อฝ่ายสนับสนุน</Link>`. Repointing "contact support" at
`/about` would tell the user something untrue, and inventing a support address or a `/support`
route is user-facing content nobody here may write. **The whole `{/* Help Text */}` `<div>` is
deleted** — that removes the link without inventing a word.

⚠️ **A consequence the owner must be told about** (not a blocker, not a defect): after this
change, a user whose verification email fails has **no contact affordance anywhere on the DTE
site**. Whether DTE should have a support contact — and what it is — is his copy call, not
mine. Routed to Porter as §Questions Q1; **it blocks neither this SPEC nor TASK-014.**

## Data Model

**None.** No table, no column, no SQL, no migration, no seed. Nothing in `back/db/schema.sql`
is read or written by this SPEC, and no existing row is affected anywhere. Frontend-only
(REQ-003 C2). Nothing here needs the human to run anything against a database.

## Flow

1. Fern deletes the 4 route directories and the 2 constants files (§Enumeration).
2. Fern removes the 3 Footer `<Link>` blocks and the `verify-email` Help Text block.
3. Fern adds the `redirects()` block to `front/next.config.ts` (Decision 1, verbatim).
4. `npm run build` — must exit 0, and its route table must no longer list the four paths.
   A missed import of a deleted file fails here; that is the point of running it.
5. `npx tsc --noEmit` — must exit 0.
6. With `npm run dev` running, each of the four paths is requested with `curl` and must answer
   **307** with `location: /`; each kept route is requested and must answer **200**.
7. The link grep (§Non-functional) must return no hit.

**Error and edge cases**

- **A deleted file still imported somewhere.** The enumeration says there is no such importer,
  but the build in step 4 is the proof, not the enumeration. If it fails, the fix belongs in
  the importing file — and if that importer is a route DTE actually uses, **stop and ask me in
  §Questions**; do not delete a live route to make a build go green.
- **A query string** (`/contact?utm=x`) — Next carries the query through the redirect; the
  visitor lands on `/`. No special handling.
- **A trailing slash** (`/blog/`) — the visitor still lands on `/`, but in **two hops**, not one.
  ⚠️ **Corrected 2026-09-09 by Sober** — this bullet originally read "Next normalises it before
  matching, so the redirect fires", which is **wrong** and was written without measuring. Measured
  twice (Fern in TASK-014 §Implementation Notes item 4, and me again at review):
  `/blog/` → **308 `location: /blog`** (Next's own built-in trailing-slash normalisation, not our
  `redirects()`) → our **307 `location: /`** → `/` **200**, `hops=2`. Decision 1 is unaffected:
  all four of *our* entries emit 307, the extra 308 is Next's, it is emitted with or without this
  change, it cannot be switched off from `redirects()`, and it caches only `/blog/` → `/blog` — a
  path we still control, so the outcome stays reversible. No code changes because of this.
- **Port 3000 already taken** — then the dev server on 3000 is not this change's server. Note
  the port actually used in the evidence rather than writing 3000 by habit.

## Non-functional

- **Auth:** unchanged. None of the four deleted routes was auth-guarded, and
  `src/services/api.ts` (the auth client) is untouched — §Enumeration Trap 1.
- **Validation / performance / logging:** nothing required. `redirects()` adds one route-match
  entry; no `middleware.ts` is introduced, so no per-request cost is added to live routes.
- **The no-emoji standard (SPEC-001 §"The no-emoji check") still binds.** Baseline is
  **124 occurrences in 45 files**. This change deletes files and adds none, so the count may
  **fall or stay equal — it must not rise.**
- **The link grep**, run from `front/`:

  ```
  grep -rn "href=\"/portfolio\"\|href=\"/services\"\|href=\"/contact\"\|href=\"/blog\"" src/
  ```

  Expected after the change: **no output** (exit 1). `@/services/api` imports do not match this
  pattern and must not be "fixed" (Trap 1).

## Tasks

- TASK-014: Remove the four inherited routes, their two data files and their four links; add
  the `redirects()` block — owner: **FE (Fern)** (depends on: —)

One TASK, not two: this is a single-side change, and splitting the delete from the redirect
would leave the live site answering 404 on four real URLs between the halves.

> Numbering: TASK-004…010 stay reserved for SPEC-001's per-screen units; SPEC-002 took 011–013;
> this SPEC starts at 014 (PROTOCOL.md §Artifact numbering — numbers are never reused).

## Questions

(Engineers ask here; I answer as `> answer: ...`. Items marked **for Porter** are mine to him.)

- **Q1 — for Porter (NOT blocking).** Decision 3 removes the site's only
  "ติดต่อฝ่ายสนับสนุน" link along with `/contact`. The owner should be told that after this
  change a user stuck in email verification has no contact route, and asked whether DTE wants a
  support contact and what it is. **I am not waiting for an answer before TASK-014 runs** —
  REQ-003 is not blocked by it, and no agent may invent that copy either way. If he wants one,
  it is a new REQ.

  > **answer (Porter 2026-09-08, from the owner): NO — he does not want one. `Q3=ไม่ต้อง`**
  > (*not needed*). Put to him in Thai exactly as you framed it (removing `/contact` leaves a user
  > stuck in email verification with no contact route at all); recorded verbatim in
  > `SYSTEM-FACTS.md` **A32**. Consequences: **no new REQ is opened**, the verify-email Help Text
  > stays removed as TASK-014 built it, and **nobody re-raises this** — it is a deliberate owner
  > decision, not a gap in the site. If he ever wants a support contact he states the channel and
  > the copy himself, and that is a fresh REQ. **Q1 is CLOSED and changes nothing in TASK-014.**

- **Q2 — for Porter (NOT blocking, housekeeping).** `front/src/app/about/page-new.tsx` and
  `front/src/app/about/page.tsx.backup` are stray duplicates of the About page that predate
  this team. They serve no route, and REQ-003 does not cover them (§Enumeration Trap 3), so I
  left them alone. If the owner wants the tree clean, that is a separate REQ.

  > **answer (Porter 2026-09-08): received, and you were right to leave them.** This was **not**
  > put to the owner in this round — his 2026-09-08 digest carried the four items that were
  > blocking work, and a dead file that serves no route blocks nothing. **No REQ is opened and
  > nothing is deleted**: `front/src/app/about/page-new.tsx` and `about/page.tsx.backup` stay
  > exactly as they are, out of REQ-003's reach (§Enumeration Trap 3). I carry it as a
  > housekeeping item to raise the next time I have his attention. **Q2 is CLOSED for SPEC-003 —
  > it changes nothing in TASK-014 and is not a gate on anything.**
