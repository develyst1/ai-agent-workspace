# TASK-014: Remove the four inherited routes, their data files and their links; add the redirects
- Source: SPEC-003
- Owner: FE (Fern)
- Status: DONE
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

Filled by Fern, 2026-09-08. Everything below is real pasted output; anything not run is marked
`UNVERIFIED`.

### Files changed (all under `front/`; nothing in `back/`)

Deleted (6): `src/app/portfolio/page.tsx` + its dir · `src/app/services/page.tsx` + its dir ·
`src/app/contact/page.tsx` + its dir · `src/app/blog/page.tsx` + its dir ·
`src/constants/portfolio.ts` · `src/constants/services.ts`

Edited (3): `src/components/layout/Footer.tsx` (the 3 `<Link>` blocks removed; wrapper,
`/about` link and copyright byte-identical, `Link` import kept) · `src/app/verify-email/page.tsx`
(the whole `{/* Help Text */}` block removed, `Link` import kept) · `next.config.ts`
(`redirects()` added verbatim — all four `permanent: false`).

Not touched, per §"What you must NOT touch": `src/services/` (the API client), the 4 Thai-copy
"Portfolio" strings, everything under `src/app/about/` (both strays included), `Navbar.tsx`,
`src/constants/theme-tokens.ts`, all of `back/`.

### DoD evidence

**1. Deletes.** `ls src/app | sort`:
```
about
classroom
courses
favicon.ico
globals.css
layout.tsx
login
page.tsx
register
teach
verify-email
```
`ls src/constants` → `theme-tokens.ts`

**2. `npm run build` → exit 0.** Route table:
```
Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /about
├ ƒ /classroom/[id]
├ ○ /courses
├ ○ /login
├ ○ /register
├ ○ /teach
└ ○ /verify-email
```
No `/portfolio`, `/services`, `/contact` or `/blog`.

⚠️ **One snag, and exactly what I did about it — please read this at review.** The FIRST
`npm run build` (exit 1) and `npx tsc --noEmit` (exit 2) both failed with 8 × `TS2307 Cannot find
module '../../src/app/blog/page.js'` (and `contact`, `portfolio`, `services`) inside Next's own
generated `.next/types/validator.ts` **and** `.next/dev/types/validator.ts` — stale route-type
validators from the pre-delete tree. `next build` regenerates `.next/types/…` but **not**
`.next/dev/types/…` (that one belongs to `next dev`), so the stale dev copy kept failing the
build's type-check. I deleted the one generated file `front/.next/dev/types/validator.ts` — build
output, not source, outside `src/`, regenerated by the next `next dev`. **No source file was
changed to make the build green**; both commands passed immediately afterwards. Worth knowing:
a stale `.next` makes this change look broken on any machine that had the old routes open in dev.

**3. `npx tsc --noEmit` → exit 0** (no output).

**4. Removed paths** (dev server on port 3000 — see §Port note):
```
== /portfolio
HTTP/1.1 307 Temporary Redirect
location: /
== /services
HTTP/1.1 307 Temporary Redirect
location: /
== /contact
HTTP/1.1 307 Temporary Redirect
location: /
== /blog
HTTP/1.1 307 Temporary Redirect
location: /
```
**`/blog/` (trailing slash)** — the one place reality differs from SPEC-003 §Flow's wording, so
raw output rather than a paraphrase:
```
HTTP/1.1 308 Permanent Redirect
location: /blog
Refresh: 0;url=/blog
```
following the chain: `final_url=http://localhost:3000/ final_code=200 hops=2`.
So `/blog/` **does** land on `/`, in **two** hops: Next's own built-in trailing-slash
normalisation answers **308 → `/blog`** first (that 308 is Next's, not our `redirects()`), then our
**307 → `/`** fires. Every entry we wrote emits 307, so Decision 1 holds as written — but a visitor
who types the trailing slash still gets one cached 308, and it points at `/blog`, which remains a
temporary redirect we can change. I changed nothing over this; flagging it because the SPEC said
"Next normalises it before matching" and the observable truth is "normalises with an extra 308 hop".

**5. Kept routes** (same dev server):
```
/ 200
/about 200
/courses 200
/teach 200
/login 200
/register 200
/verify-email 200
```

**6. Link grep:**
```
grep -rn "href=\"/portfolio\"\|href=\"/services\"\|href=\"/contact\"\|href=\"/blog\"" src/ ; echo "exit=$?"
exit=1
```
No lines. (A wider grep for `constants/portfolio`, `constants/services`, `/blog`, `/portfolio` in
`src/` also returned nothing.)

**7. No-emoji harness:**
```
node <coordination-repo>/ai-worker/tests/harness/check-no-emoji.mjs <dte>/front/src
124 occurrence(s) in 39 file(s) scanned.
```
**124 = the baseline exactly, not above it.** The scanned-file count fell 45 → 39 because this TASK
deletes 6 files; none of them held any of the 124, so the count is unchanged and nothing was added.

**8. `/about` untouched.** No file under `src/app/about/` was edited or deleted — the strays
`page-new.tsx` and `page.tsx.backup` are still on disk. `curl -s -o /dev/null -w "%{http_code}\n"
http://localhost:3000/about` → `200`.

### Port note, and one local process I stopped (declared, per §Environments)

Port 3000 was already held by an **orphaned `next dev` started 2026-09-07 22:31** (PID 8400, same
`front/` directory; its log ends in repeated `uncaughtException: EPIPE broken pipe`). It accepted
TCP connections but answered nothing — every `curl` to it timed out at 25 s with 0 bytes. Next 16
**refuses to start a second dev server for the same directory**, so another port was not a way
around it: my attempts on 3001 and 3007 both exited with "Another next dev server is already
running". I therefore **stopped that orphaned local process** and started a clean `npm run dev`,
which came up on 3000 and produced every result above; I stopped mine afterwards, so no dev server
of mine is left running. Local developer-machine process only (PROTOCOL.md §Environments — local
`front` dev is the team's). **No production, no ssh, no deploy, no DB, no git write, no `back/`
file.** Declared in case that server was somebody's on purpose.

### UNVERIFIED — stated, not hidden

- **`UNVERIFIED — /classroom/[id] not exercised, no local session.`** It needs a real course id and
  a logged-in session; I invented no id and called no real environment. It appears as `ƒ (Dynamic)`
  in the build table and imports nothing I touched.
- **`UNVERIFIED — the live site.`** Nothing here is deployed. `dte.develyst.online` **still serves
  the four inherited pages** and will until the owner ships it himself. Every 307/200 above comes
  from a local dev server; the removal is not true for real users yet.
- **`UNVERIFIED — how the Footer and the verify-email screen LOOK after the removals.`** Both routes
  build and answer 200, but nobody has looked: the Footer now holds a single "About" link inside a
  `justify-center space-x-6` row that was built for four, and `/verify-email` lost a block from the
  bottom of its card. Only the owner's eyes settle whether either now reads as wrong.

## Questions

(Ask here and set the TASK `BLOCKED` on the board if you cannot proceed; I answer as
`> answer: ...`. Anything about *what the product should say or do* is mine to fetch from
Porter — never guess it, and never ask the owner.)

- **Q1 (Fern, 2026-09-08 — NOT blocking, nothing is waiting on it).** SPEC-003 §Flow says a
  trailing slash is normalised "before matching, so the redirect fires". Measured, it fires after
  an extra hop: `/blog/` → **308 `location: /blog`** (Next's own trailing-slash normalisation) →
  our **307 `location: /`** → `/` 200. Our four config entries are all 307 as specified and I
  changed nothing. Do you want SPEC-003 §Flow's wording corrected to the two-hop reality, and is
  the one built-in 308 (which points at `/blog`, itself still a temporary redirect) acceptable
  under Decision 1's "no permanent redirect a visitor's browser caches"? Evidence in
  §Implementation Notes item 4.

  > **answer (Sober 2026-09-09): both parts YES, and neither costs you any rework.**
  > **(a) The SPEC wording is wrong and I have corrected it** — SPEC-003 §Flow "A trailing slash
  > (`/blog/`) — Next normalises it before matching, so the redirect fires" now records the measured
  > two-hop reality, credited to your evidence. The defect was mine, in the SPEC, not yours in the
  > build. **(b) The built-in 308 is acceptable under Decision 1, which is unchanged.** Decision 1
  > forbids *us* emitting a permanent redirect to a destination we could not later change; all four
  > of our entries are `permanent: false` (307) and I re-measured them myself. The 308 is Next's own
  > trailing-slash normalisation — it is emitted for every path on this site with or without our
  > change, we cannot switch it off from `redirects()`, and what it caches is only `/blog/` → `/blog`,
  > a path we still fully control. A browser holding that cached 308 still follows our 307 afterwards,
  > so if we ever repoint or restore `/blog` the visitor gets the new behaviour. **Nothing to change
  > in the code. Q1 CLOSED.**

## Review

**Verdict: DONE** — reviewed by Sober (SA Lead) 2026-09-09. No rework. All 8 DoD checks were
re-run by me against the real repo, not read off your paste.

**What I re-ran myself (my own output, `front/`):**

1. `ls src/app | sort` → the 11 entries you pasted, byte-for-byte; `/portfolio`, `/services`,
   `/contact`, `/blog` gone. `ls src/constants` → `theme-tokens.ts` only (SPEC-001's file
   correctly kept).
2. `npm run build` → **exit 0**, route table identical to yours — 9 routes, none of the four.
3. `npx tsc --noEmit` → **exit 0**, no output. Your `.next/dev/types/validator.ts` snag did not
   reproduce: the file is present again and clean, i.e. `next dev` regenerated it exactly as you
   said it would. Your handling was right — deleting one generated file outside `src/` rather
   than bending a source file to make a build go green is the correct call, and you declared it.
4. Fresh `npm run dev` on **port 3011** (mine, stopped afterwards): `/portfolio`, `/services`,
   `/contact`, `/blog` each **307** with `location: /`; `/blog/` **308 → `/blog`** then our 307,
   `final=http://localhost:3011/ code=200 hops=2` — your Q1 finding reproduces exactly.
5. Kept routes `/ /about /courses /teach /login /register /verify-email` → **200** each.
6. The link grep → no lines, `exit=1`. I also ran three wider greps you did not have to:
   `ติดต่อฝ่ายสนับสนุน|Help Text`, `constants/portfolio|constants/services`, and
   `/portfolio|/blog|href="/contact"` across `src/` — all three empty. No dead reference survives.
7. `check-no-emoji.mjs` → **124 occurrence(s) in 39 file(s)** — the baseline exactly, not above.
   Your explanation of 45 → 39 files holds: the 6 deleted files held none of the 124.
8. `/about` → **200**; nothing under `src/app/about/` edited, both strays still on disk.

**Spec conformance, checked line by line:** `next.config.ts` carries the block verbatim with all
four `permanent: false` (Decision 1). `Footer.tsx` keeps only the `/about` `<Link>` inside the
untouched `justify-center space-x-6 md:order-2` wrapper, copyright line and `Link` import intact
(Decision 2 — no replacement label invented). `verify-email/page.tsx` has no Help Text block and
still imports and uses `Link` (Decision 3). All three §Traps respected: `src/services/`
(`api.ts`, `aiChat.ts`) is untouched, the four Thai-copy "Portfolio" strings are untouched, and
`about/page-new.tsx` + `about/page.tsx.backup` are untouched. I also checked file mtimes: the
only `front/src` files changed for this TASK are `Footer.tsx` and `verify-email/page.tsx`, and
**no `back/` file was touched by it** — no scope creep in either direction.

**The three `UNVERIFIED` items are ACCEPTED as written and carried up to Porter** — none is a
defect, none could be settled here, and I am not laundering any of them into "verified":
`/classroom/[id]` (needs a real session and a real course id — correctly not invented), the live
site (`dte.develyst.online` still serves all four inherited pages until the owner ships it
himself — `DONE` is not deployed), and how the Footer and the `/verify-email` card now **look**
after losing three links and a block. That last one is the one the owner actually has to look at:
a single "About" link sitting in a row built for four is a layout question no build exit code can
answer.

**Your declared local process stop is fine and correctly declared.** An orphaned `next dev` from
2026-09-07 holding port 3000 and answering nothing is a local developer-machine process
(PROTOCOL.md §Environments — local `front` dev is the team's), and Next 16 refusing a second dev
server for the same directory left you no other route to evidence. No production, no ssh, no DB,
no `back/` file, nothing deployed. Declaring it rather than quietly killing it is exactly right.

**Two things you did that I want on the record**, because both are the habit this project has no
QA to replace: pasting the raw `/blog/` output instead of paraphrasing it into agreement with my
SPEC, and asking Q1 rather than "fixing" the SPEC's claim by changing the config to match. The
one wrong statement in this unit was mine, in SPEC-003 §Flow, and it is corrected there now.
