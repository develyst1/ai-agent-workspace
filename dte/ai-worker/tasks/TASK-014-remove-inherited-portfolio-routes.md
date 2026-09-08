# TASK-014: Remove the four inherited routes, their data files and their links; add the redirects
- Source: SPEC-003
- Owner: FE (Fern)
- Status: IN_PROGRESS
- Depends on: none

## What to do

Delete four inherited routes from `front/`, delete the two data files that only feed them,
remove the four links that point at them, and make the four paths redirect to `/`.

**Read `specs/SPEC-003-remove-inherited-portfolio-routes.md` first** — especially
**§Enumeration → Traps**. Three things in the tree look like they are in scope and are not; one
of them (`src/services/`) breaks site-wide login if you touch it.

`front/` only. Nothing in `back/`. No commit, no deploy, no production — leave the edited files
on `develop` (PROTOCOL.md §Environments).

### Step 1 — delete the four route directories

```
front/src/app/portfolio/     (contains only page.tsx)
front/src/app/services/      (contains only page.tsx)
front/src/app/contact/       (contains only page.tsx)
front/src/app/blog/          (contains only page.tsx)
```

### Step 2 — delete the two supporting data files

```
front/src/constants/portfolio.ts
front/src/constants/services.ts
```

Each is imported by exactly one of the pages you just deleted and by nothing else in the repo
(SPEC-003 §Enumeration). **Do NOT delete `front/src/constants/theme-tokens.ts`** — that is
SPEC-001's and unrelated.

### Step 3 — `front/src/components/layout/Footer.tsx`

Delete three `<Link>` elements — currently lines 14–19 (`/services`), 20–25 (`/portfolio`),
26–31 (`/contact`). Keep everything else byte-identical: the `<footer>`, the
`<div className="flex justify-center space-x-6 md:order-2">` wrapper, the `/about` `<Link>`
with its exact `className`, and the copyright line. The file still imports `Link` (About uses
it), so the import stays.

Do not add a replacement link, label, or nav entry — SPEC-003 §Decision 2 explains why that is
not ours to invent.

### Step 4 — `front/src/app/verify-email/page.tsx`

Delete the whole `{/* Help Text */}` block — currently lines 148–155, the
`<div className="text-center mt-6">` containing `มีปัญหา?` and the
`<Link href="/contact">ติดต่อฝ่ายสนับสนุน</Link>`. Delete the entire block, including its
comment; do not leave the sentence with a dead link and do not invent a new destination
(SPEC-003 §Decision 3).

⚠️ `Link` is still used elsewhere in this file (the "กลับไปหน้าเข้าสู่ระบบ" link) — **keep the
import.** Removing it will fail step 6's build.

### Step 5 — `front/next.config.ts`

Add this, verbatim, inside the existing `nextConfig` object (alongside `output` and `images`):

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

⚠️ **`permanent: false` on all four — this is not a style choice.** `true` emits 308, which the
visitor's browser caches forever and which we cannot undo for real users. The reasoning is in
SPEC-003 §Decision 1. If you think it should be 308, ask in §Questions; do not change it.

### What you must NOT touch

- **`front/src/services/`** — that is the API client (`api.ts`, `aiChat.ts`), not the
  `/services` route. Login, register, verify-email and the classroom all import it.
- The word **"Portfolio" in Thai marketing copy** at `src/app/page.tsx:112`,
  `src/app/about/page.tsx:165`, `src/app/about/page-new.tsx:165`, `src/lib/mockData.ts:163` —
  prose, not links. Leave them.
- `front/src/app/about/` — anything in it, including the strays `page-new.tsx` and
  `page.tsx.backup`. REQ-003 keeps `/about` and does not touch its content.
- `src/components/layout/Navbar.tsx` — already clean, nothing to do.
- Anything in `back/`.

## Definition of Done

Run each command from `front/` and paste the **actual output** (PROTOCOL.md §Evidence — a claim
without output is `REWORK`).

- [ ] The 4 directories and 2 files of Steps 1–2 no longer exist. Prove it:
      `ls src/app | sort` and `ls src/constants` — paste both.
- [ ] `npm run build` exits 0. Paste the exit code and the route table; the table must **not**
      list `/portfolio`, `/services`, `/contact` or `/blog`.
- [ ] `npx tsc --noEmit` exits 0. Paste the exit code.
- [ ] With `npm run dev` running, each removed path answers **307** with `location: /`:

      ```
      for p in /portfolio /services /contact /blog; do curl -s -o /dev/null -D - "http://localhost:3000$p" | head -3; done
      ```

      Paste the output. Also request **`/blog/`** (trailing slash) once and paste its status.
- [ ] With the same dev server, every kept route answers **200**:

      ```
      for p in / /about /courses /teach /login /register /verify-email; do echo -n "$p "; curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000$p"; done
      ```

      Paste the output. (`/classroom/[id]` is auth-guarded — see §Implementation Notes below.)
- [ ] The link grep returns nothing:

      ```
      grep -rn "href=\"/portfolio\"\|href=\"/services\"\|href=\"/contact\"\|href=\"/blog\"" src/ ; echo "exit=$?"
      ```

      Paste the output and the exit code (expected `exit=1`, no lines).
- [ ] The no-emoji harness has not got worse. Baseline is **124 occurrences in 45 files**:

      ```
      node <coordination-repo>/ai-worker/tests/harness/check-no-emoji.mjs <dte>/front/src
      ```

      Paste the count. It must be **≤ 124** — this TASK deletes files and adds none.
- [ ] `/about` is untouched: state that no file under `src/app/about/` was edited, and paste
      `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/about`.

## Implementation Notes

(You fill this in: what changed, how it was verified, the real output. Anything you did not
actually run is `UNVERIFIED — <what would settle it>` — write it, do not hide it.)

Two things I already expect to come back as `UNVERIFIED`, and that is fine — say so explicitly
rather than guessing:

- **`/classroom/[id]`** needs a real course id and a logged-in session. If you cannot produce
  one locally, write `UNVERIFIED — /classroom/[id] not exercised, no local session`. Do not
  invent an id, and do not call any real environment to get one.
- **The live site.** Nothing here is deployed. Production still serves the four inherited pages
  until the owner ships it himself — never write that the pages "are gone" without that caveat.

## Questions

(Ask here and set the TASK `BLOCKED` on the board if you cannot proceed; I answer as
`> answer: ...`. Anything about *what the product should say or do* is mine to fetch from
Porter — never guess it, and never ask the owner.)

## Review

(Sober fills this in at REVIEW: verdict + reasons.)
