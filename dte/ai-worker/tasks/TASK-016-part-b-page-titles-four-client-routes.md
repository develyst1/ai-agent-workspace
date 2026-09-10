# TASK-016: Part B page titles — the four owner-named client routes

- Source: SPEC-004 (§Decision 4, §Decision 6) — REQ-005
- Owner: **FE (Fern)**
- Status: **DONE** (reviewed 2026-09-09 by Sober — see §Review)
- Depends on: **TASK-015 ✅ DONE** (the root `title.template` this task relies on is already in
  `src/app/layout.tsx`). Nothing else.
- Written: 2026-09-09 by Sober (SA Lead)

## Why this exists now

SPEC-004 split the work because only half of it was owner-stated. Part A shipped (TASK-015).
Part B waited on one thing: the **page name** for each of the five `'use client'` routes, which
nobody here may invent (REQ-005 §Requirement 4).

**The owner has now stated four of the five** — `SYSTEM-FACTS.md` **A34**, delivered to me via
`requirements/REQ-005-unify-page-titles-site-wide.md` §Questions. Those four are this task.

🔴 **`/classroom/[id]` is NOT in this task and must not be touched.** The owner chose the *rule*
(one shared fixed name — `SYSTEM-FACTS.md` **A35**) but **not the word**. It stays reading
`DTE — Develyst The Education` until he writes it (REQ-005 §Open questions Q3). Adding a name for
it — even an obvious one like `ห้องเรียน` — is a **defect, not initiative**, and is instant REWORK.

## What to do

Create **four new files**, one per route, each a tiny **server** layout whose only job is to set
that segment's title. Change **nothing else** — no page file, no root layout, no component.

| # | New file | `title` value | Resulting tab (template supplies the tail) |
|---|---|---|---|
| 1 | `front/src/app/login/layout.tsx` | `เข้าสู่ระบบ` | `เข้าสู่ระบบ \| DTE — Develyst The Education` |
| 2 | `front/src/app/register/layout.tsx` | `สมัครสมาชิก` | `สมัครสมาชิก \| DTE — Develyst The Education` |
| 3 | `front/src/app/teach/layout.tsx` | `สอน` | `สอน \| DTE — Develyst The Education` |
| 4 | `front/src/app/verify-email/layout.tsx` | `ยืนยันอีเมล` | `ยืนยันอีเมล \| DTE — Develyst The Education` |

Each file, exactly this shape (`login` shown; swap the title and the function name):

```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'เข้าสู่ระบบ',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

**Rules that make or break this task:**

1. **No `'use client'` in these four files.** A client component cannot export `metadata`; that is
   the whole reason the page files can't carry their own title (SPEC-004 §Decision 4).
2. **Pass-through only.** `return children;` — no wrapper element, no `<html>`, no `<body>`, no
   provider, no styling. The root layout already renders `html`/`body`/`Navbar`/`main`/`Footer`;
   anything added here changes the page's rendering, which this REQ does not authorise (REQ-005 C2,
   copy only).
3. **Set only `title`.** No `description`, no OG tags, no keywords — out of scope (REQ-005 §Out of
   Scope). Each page keeps whatever it renders today.
4. **The tail is NOT typed in these files.** Only the page name goes here; the
   ` | DTE — Develyst The Education` half comes from the root `title.template` (SPEC-004
   §Decision 1). If you find yourself typing an em dash in one of these four files, stop — that is
   the duplication Decision 1 exists to prevent.
5. 🔴 **Do not retype the Thai.** These are the owner's own words (A34) and nobody may re-word,
   expand, shorten or "fix the spelling" of them. **Copy the four strings byte-for-byte** out of
   this file or out of `SYSTEM-FACTS.md` **A34** — the same technique you used for the em dash in
   TASK-015. DoD 3 checks the bytes, so a retype that drifts by one vowel mark will fail.
6. **Touch no page file.** The four `page.tsx` files stay exactly as they are, `'use client'` and
   all. Nothing in `src/app/page.tsx`, `about/`, `courses/` or `layout.tsx` changes either —
   TASK-015 already settled those and re-touching them is out of scope.
7. **`about/page-new.tsx` and `about/page.tsx.backup` stay untouched** (SPEC-004 §Enumeration).
   Still not routes, still Porter's housekeeping, still not yours to "fix while in there".
8. **No production contact of any kind** — evidence comes from a **local** dev server you start and
   stop yourself (REQ-005 C3).

## Expected end state — all 9 titles

After this task the whole site reads (this is the full check, not just the four you touched):

| Route | Title |
|---|---|
| `/` | `DTE — Develyst The Education` *(one part — A31, must not gain a tail)* |
| `/about` | `เกี่ยวกับเรา \| DTE — Develyst The Education` |
| `/courses` | `ทักษะทั้งหมด \| DTE — Develyst The Education` |
| `/login` | `เข้าสู่ระบบ \| DTE — Develyst The Education` |
| `/register` | `สมัครสมาชิก \| DTE — Develyst The Education` |
| `/teach` | `สอน \| DTE — Develyst The Education` |
| `/verify-email` | `ยืนยันอีเมล \| DTE — Develyst The Education` |
| `/classroom/[id]` | `DTE — Develyst The Education` *(**unchanged on purpose** — A35's word is unstated)* |
| 404 (framework) | Next's own — out of scope (SPEC-004 §Flow edge case (a)) |

## Definition of Done

Paste the **command and its real output** for each. `UNVERIFIED — <what would settle it>` for
anything you did not actually run — there is no QA here and an honest UNVERIFIED costs one hop.
Run everything from `front/`.

- [ ] **1.** `ls src/app/*/layout.tsx` — exactly the four new files, and
      `find src/app -name "layout.tsx" | sort` shows **five** total (root + these four), with
      **no** `classroom/[id]/layout.tsx`.
- [ ] **2.** `grep -rn "title" src/app/login/layout.tsx src/app/register/layout.tsx src/app/teach/layout.tsx src/app/verify-email/layout.tsx`
      — one `title:` line each, the page name only, **no pipe and no em dash** in any of them.
- [ ] **3.** **Bytes, not eyeballing.** For each of the four:
      `grep -h "title:" src/app/<route>/layout.tsx | od -An -tx1`. The name's UTF-8 bytes must be
      exactly:
      `เข้าสู่ระบบ` = `e0 b9 80 e0 b8 82 e0 b9 89 e0 b8 b2 e0 b8 aa e0 b8 b9 e0 b9 88 e0 b8 a3 e0 b8 b0 e0 b8 9a e0 b8 9a` (**33 bytes**) ·
      `สมัครสมาชิก` = `e0 b8 aa e0 b8 a1 e0 b8 b1 e0 b8 84 e0 b8 a3 e0 b8 aa e0 b8 a1 e0 b8 b2 e0 b8 8a e0 b8 b4 e0 b8 81` (**33 bytes**) ·
      `สอน` = `e0 b8 aa e0 b8 ad e0 b8 99` (**9 bytes**) ·
      `ยืนยันอีเมล` = `e0 b8 a2 e0 b8 b7 e0 b8 99 e0 b8 a2 e0 b8 b1 e0 b8 99 e0 b8 ad e0 b8 b5 e0 b9 80 e0 b8 a1 e0 b8 a5` (**33 bytes**).
- [ ] **4.** `grep -rn "use client" src/app/login/layout.tsx src/app/register/layout.tsx src/app/teach/layout.tsx src/app/verify-email/layout.tsx`
      — **empty** (rule 1).
- [ ] **5.** `npm run build` — exit 0, and the route list still shows the **same 9 routes** as
      before this task (no route added, none lost).
- [ ] **6.** `npx tsc --noEmit` — exit 0.
- [ ] **7.** Local dev server on a free port (start it, **stop it when done, and say so**), then for
      each of the **8** app routes print the rendered title, e.g.
      `curl -s http://localhost:<port>/login | grep -o "<title>[^<]*</title>"`.
      All 8 must match the "Expected end state" table **exactly, character for character** —
      including `/` still being one part and `/classroom/<any-id>` still being one part.
- [ ] **8.** **`/` did not regress.** `curl -s http://localhost:<port>/ | grep -o "<title>[^<]*</title>" | grep -c "|"`
      → **0**. A31 is the thing this design can break silently; prove it, don't assume it.
- [ ] **9.** `grep -rn "DTE Platform" src` — still exactly the **6 body-copy lines** and nothing
      else. Those 6 are protected (SPEC-004 §Decision 5); they belong to REQ-006 and are not yours
      to change in this task.
- [ ] **10.** Run the emoji harness `tests/harness/check-no-emoji.mjs` with `src` as its argument,
      from `front/`. 🔧 **CORRECTED 2026-09-09 by Sober at review** (Fern's Q2(a) was right): the
      original text wrote the script as `../ai-worker/…`, which resolves inside the **code repo**,
      where no `ai-worker/` exists — the harness lives in the **coordination workspace**
      (PROTOCOL.md §Evidence, "not in the product repo"), so invoke it by its workspace path. The
      baseline that must not move is the **124 occurrences**; the second number is files *scanned*
      and rises with any file added (39 -> 43 here) — see Q2(b).
- [ ] **11.** Confirm in words: the four `page.tsx` files, `src/app/page.tsx`, `src/app/layout.tsx`,
      `about/`, `courses/`, `classroom/`, `about/page-new.tsx` and `about/page.tsx.backup` were
      **not edited**. `ls -l --time-style=long-iso` on them (mtimes) is the cheapest proof.
- [ ] **12.** **Open `/login`, `/register`, `/teach` and `/verify-email` in a real browser and read
      the tab.** REQ-005's acceptance criterion says "confirmed in a browser, route by route, not by
      reading the source". `/teach` is auth-guarded in the client but its `<title>` comes from the
      server-rendered head, so it is readable without a session — if the page itself redirects you,
      say so and record the title you saw. If you cannot open a browser, write `UNVERIFIED` and name
      which routes.

## Implementation Notes

*(Fern, 2026-09-09 — TASK-016, `TODO` -> `IN_PROGRESS` -> `REVIEW`.)*

### What changed — 4 files ADDED, 0 files edited, 0 deleted

| New file | `title` | bytes |
|---|---|---|
| `front/src/app/login/layout.tsx` | `เข้าสู่ระบบ` | 33 |
| `front/src/app/register/layout.tsx` | `สมัครสมาชิก` | 33 |
| `front/src/app/teach/layout.tsx` | `สอน` | 9 |
| `front/src/app/verify-email/layout.tsx` | `ยืนยันอีเมล` | 33 |

Each is exactly the shape the TASK specified: `import type { Metadata }`, a `metadata` export
setting **only** `title`, and `export default function <X>Layout({ children }) { return children; }`.
No `'use client'`, no wrapper element, no provider, no styling, no `description`/OG/keywords, and
**no pipe and no em dash typed anywhere in the four files** — the tail comes from TASK-015's root
`title.template`.

🔴 **`/classroom/[id]` was NOT touched and has NO layout file** (SPEC-004 §Decision 6). It still
renders `DTE — Develyst The Education`, proved live below. No name was invented for it.

**The Thai was never retyped.** A script read the four names byte-for-byte out of this TASK file's
"What to do" table (column 3), cross-checked each against DoD 3's independent hex transcription in
the same file, refused to run on any mismatch, and refused to overwrite an existing file. All four
matched before a byte was written.

### Definition of Done — command + real output

**1. Files present, five layouts total, none under `classroom`** — `ls src/app/*/layout.tsx` and
`find src/app -name "layout.tsx" | sort`:
```
ls:    src/app/login/layout.tsx  src/app/register/layout.tsx  src/app/teach/layout.tsx
       src/app/verify-email/layout.tsx
find:  src/app/layout.tsx  src/app/login/layout.tsx  src/app/register/layout.tsx
       src/app/teach/layout.tsx  src/app/verify-email/layout.tsx        count: 5
find src/app/classroom -name "layout.tsx" | wc -l  ->  0
```
✅ Exactly the four new files + the root = 5. No `classroom/[id]/layout.tsx`.

**2. One `title:` line each, no pipe, no em dash** — `grep -rn "title" <the 4 files>`:
```
src/app/login/layout.tsx:4:  title: 'เข้าสู่ระบบ',
src/app/register/layout.tsx:4:  title: 'สมัครสมาชิก',
src/app/teach/layout.tsx:4:  title: 'สอน',
src/app/verify-email/layout.tsx:4:  title: 'ยืนยันอีเมล',
```
`grep -c "|"` on the four -> **0 0 0 0**; `grep -c "—"` on the four -> **0 0 0 0**. ✅

**3. Bytes, not eyeballing** — `grep -h "title:" src/app/<route>/layout.tsx | od -An -tx1`
(`27` is the quote character; the name is what sits between the pair):
```
login:        20 20 74 69 74 6c 65 3a 20 27 | e0 b9 80 e0 b8 82 e0 b9 89 e0 b8 b2 e0 b8 aa e0 b8 b9
                                              e0 b9 88 e0 b8 a3 e0 b8 b0 e0 b8 9a e0 b8 9a | 27 2c 0a
register:     20 20 74 69 74 6c 65 3a 20 27 | e0 b8 aa e0 b8 a1 e0 b8 b1 e0 b8 84 e0 b8 a3 e0 b8 aa
                                              e0 b8 a1 e0 b8 b2 e0 b8 8a e0 b8 b4 e0 b8 81 | 27 2c 0a
teach:        20 20 74 69 74 6c 65 3a 20 27 | e0 b8 aa e0 b8 ad e0 b8 99 | 27 2c 0a
verify-email: 20 20 74 69 74 6c 65 3a 20 27 | e0 b8 a2 e0 b8 b7 e0 b8 99 e0 b8 a2 e0 b8 b1 e0 b8 99
                                              e0 b8 ad e0 b8 b5 e0 b9 80 e0 b8 a1 e0 b8 a5 | 27 2c 0a
```
✅ All four are **byte-identical to DoD 3** (33 / 33 / 9 / 33). Checked twice: by the generator
before writing, and by `od` on the files afterwards.

**4. No `'use client'`** — `grep -rn "use client" <the 4 files>` -> **no output, exit 1**. ✅

**5. `npm run build`** -> **exit 0**. `✓ Compiled successfully in 2.2s`, TypeScript finished,
10/10 static pages generated. Route list, **the same 9 as before this task**:
```
┌ ○ /        ├ ○ /_not-found  ├ ○ /about   ├ ƒ /classroom/[id]  ├ ○ /courses
├ ○ /login   ├ ○ /register    ├ ○ /teach   └ ○ /verify-email
```
✅ No route added, none lost — the four layouts add titles, not routes.

**6. `npx tsc --noEmit`** -> **exit 0**, no output. ✅

**7. All 8 rendered titles.** Dev server `npx next dev -p 3021` (port checked free first;
**stopped afterwards, see below**), then `curl -s <url> | grep -o "<title>[^<]*</title>"`:
```
/              <title>DTE — Develyst The Education</title>
/about         <title>เกี่ยวกับเรา | DTE — Develyst The Education</title>
/courses       <title>ทักษะทั้งหมด | DTE — Develyst The Education</title>
/login         <title>เข้าสู่ระบบ | DTE — Develyst The Education</title>
/register      <title>สมัครสมาชิก | DTE — Develyst The Education</title>
/teach         <title>สอน | DTE — Develyst The Education</title>
/verify-email  <title>ยืนยันอีเมล | DTE — Develyst The Education</title>
/classroom/1   <title>DTE — Develyst The Education</title>
```
✅ **All 8 match the "Expected end state" table character for character** — `/` still one part, and
`/classroom/1` still one part, unchanged on purpose.

Rendered **bytes** checked as well, not just the glyphs. `/login`'s `<title>`:
```
3c 74 69 74 6c 65 3e | e0 b9 80 ... e0 b8 9a | 20 7c 20 | 44 54 45 20 | e2 80 94 | 20 44 65 76 ...
     "<title>"          the 33 A34 bytes         " | "      "DTE "        em dash    " Develyst..."
```
✅ The owner's 33 bytes, then the template's ` | ` (`20 7c 20`) and the real em dash (`e2 80 94`) —
neither of which any file in this task types. `/teach` checked the same way (`e0 b8 aa e0 b8 ad
e0 b8 99` then `20 7c 20`).

**8. `/` did not regress (A31).**
`curl -s http://localhost:3021/ | grep -o "<title>[^<]*</title>" | grep -c "|"` -> **0**. ✅

**9. `grep -rn "DTE Platform" src`** — the **6 protected body-copy lines are unchanged, and none of
my four files contains the string**:
```
src/app/about/page.tsx:45 · src/app/about/page.tsx:128 · src/app/login/page.tsx:86
src/app/register/page.tsx:193 · src/app/teach/page.tsx:104 · src/services/api.ts:1
```
⚠️ The literal command returns **14** lines, not 6: the other 8 are inside the two stray **non-route**
files `about/page-new.tsx` (3) and `about/page.tsx.backup` (5), which are untouched and stay
untouched. 6 is the count **excluding** those two. Nothing changed either way — see §Questions Q1.

**10. Emoji harness** — `node <workspace>/dte/ai-worker/tests/harness/check-no-emoji.mjs src`, run
from `front/` -> **`124 occurrence(s) in 43 file(s) scanned.`**
✅ The **occurrence count is the baseline 124, unmoved** — my four files contain no icons. The second
number is *files **scanned***, not files-containing-emoji, so it went 39 -> 43: exactly the four
files I added. That is the arithmetic of adding four clean files, not a regression. Two path/wording
notes in §Questions Q2.

**11. Nothing else was edited** — `ls -l --time-style=long-iso` (this session ran ~00:30–00:36):
```
2026-09-06 20:50  about/page-new.tsx        2026-09-06 20:50  about/page.tsx.backup
2026-09-06 20:50  login/page.tsx            2026-09-06 20:50  register/page.tsx
2026-09-06 20:54  teach/page.tsx            2026-09-06 20:54  classroom/[id]/page.tsx
2026-09-08 23:34  verify-email/page.tsx     2026-09-09 00:11  src/app/layout.tsx
2026-09-09 00:11  src/app/page.tsx          2026-09-09 00:11  about/page.tsx
2026-09-09 00:11  courses/page.tsx
--- the only 00:34 mtimes, i.e. the only thing this session wrote ---
2026-09-09 00:34  login/layout.tsx  register/layout.tsx  teach/layout.tsx  verify-email/layout.tsx
```
✅ Confirmed in words: the four `page.tsx` files, `src/app/page.tsx`, `src/app/layout.tsx`,
`about/`, `courses/`, `classroom/`, `about/page-new.tsx` and `about/page.tsx.backup` were **not
edited**. The 00:11 mtimes are TASK-015's four edits from earlier today; 23:34 is TASK-014's.

**12. Read in a real browser** — a real Chrome tab on `localhost:3021`, reading `document.title` and
the tab strip, not the source:
```
/login         เข้าสู่ระบบ | DTE — Develyst The Education
/register      สมัครสมาชิก | DTE — Develyst The Education
/verify-email  ยืนยันอีเมล | DTE — Develyst The Education
/teach         สอน | DTE — Develyst The Education   <- then redirected, see below
```
✅ **`/teach` does redirect**, exactly as the TASK anticipated. On arrival the tab read
`สอน | DTE — Develyst The Education` from the server-rendered head; the client auth guard then sent the browser to
`/login` and the tab became the `/login` title. Reproduced twice; the end-state screenshot shows the
login form. **The title I saw for `/teach` is the one recorded above, and it is correct.**

**Dev server stopped.** The listener was killed (`taskkill /PID 21516 /T /F`); afterwards
`netstat -ano | grep :3021 | grep -i listening` returned *no LISTENING socket on 3021* and `curl` to
it returns nothing. Nothing of mine is left running. **No production contact of any kind** — every
request in this task went to `localhost:3021`.

### UNVERIFIED — stated plainly, not laundered

1. **`REVIEW` is not deployed.** `dte.develyst.online` still serves the old titles for these four
   routes until the owner ships it. Nothing here touched production.
2. **The browser in DoD 12 was an automated Chrome I drove, not the owner's own eyes.** REQ-005's
   acceptance criterion is his look, and it is still owed — the same carry as TASK-015.
3. **`/teach` was read while logged out.** The title is correct on arrival, but nobody has seen the
   tab of a *logged-in* `/teach` that does not redirect. An authenticated session would settle it;
   I have no credentials and would not use them if I did.
4. **`/classroom/[id]` was exercised with the arbitrary id `1`** on a local server. It renders the
   one-part title correctly; no real course was involved.

## Questions

*(Fern asks here; Sober answers as `> answer: ...`)*

**Q1 — DoD 9 says "exactly the 6 body-copy lines", but the literal command returns 14. Non-blocking;
nothing was changed either way.** `grep -rn "DTE Platform" src` returns **14** lines: the 6
protected ones (`about/page.tsx` x2, `login/page.tsx:86`, `register/page.tsx:193`,
`teach/page.tsx:104`, `services/api.ts:1`) **plus 8 more inside the two stray non-route files** —
`about/page-new.tsx` (3) and `about/page.tsx.backup` (5). So "6" is the count **excluding** those
two, which matches how SPEC-004 §Decision 5 and A36 enumerate them. Confirming the reading: **is DoD
9's 6 meant as "6 outside the two stray files", i.e. is 14-with-strays the expected total?** If so, a
future DoD may want the command written in its excluding form so the number matches the output. I
changed none of the 14.

> **answer (Sober, 2026-09-09): YES — your reading is exactly right, and my DoD was loosely worded.**
> The **6** is "6 outside the two stray non-route files", and **14-with-strays is the expected
> total**. I re-ran it against the repo: 14 lines = `about/page.tsx` 2 + `login/page.tsx` 1 +
> `register/page.tsx` 1 + `teach/page.tsx` 1 + `services/api.ts` 1 (**the protected 6**) +
> `about/page-new.tsx` 3 + `about/page.tsx.backup` 5 (**the strays, 8**). Nothing changed — correct.
> Two things follow, neither of them yours to act on: (a) a future DoD of mine writes this in its
> excluding form — `grep -rn "DTE Platform" src --exclude=page-new.tsx --exclude=page.tsx.backup`,
> which returns exactly the 6 — so the number matches the output; (b) **REQ-006 is now
> `READY_FOR_SA`, and its in-scope list is 5 of those 6, not 6** — the owner excluded
> `services/api.ts:1` (`SYSTEM-FACTS.md` **A39**). That SPEC is my next unit; do not pre-empt it,
> and the enumeration will be re-run from the code, never carried over as a count.

**Q2 — DoD 10's harness path does not resolve from `front/`, and the harness's second number counts
files *scanned*. Non-blocking; the check was run and it passed.** Two small things:
(a) `node ../ai-worker/tests/harness/check-no-emoji.mjs` resolves to `<code-repo>/ai-worker/…`,
which does not exist — `ai-worker/` lives in the **coordination workspace**, not the code repo
(PROTOCOL.md §Evidence puts harness scripts here, "not in the product repo"). I ran it by its
workspace path instead and it worked. **Should the DoD spell out that path**, the way TASK-015's
corrected DoD 8 spelled out the `src` argument?
(b) The harness prints `124 occurrence(s) in 43 file(s) scanned` — **43 is files scanned, not files
containing emoji**. Adding four clean files necessarily moves that 39 -> 43 while the occurrence
count stays 124. **Confirming the baseline that matters is the 124**, and that 39 -> 43 here is
expected arithmetic rather than the regression DoD 10 guards against.

> **answer (Sober, 2026-09-09): both halves confirmed — (a) is my defect, (b) is your reading, and
> it is right.**
> **(a)** Reproduced: from `front/`, `../ai-worker/` points into the **code repo**, and that folder
> does not exist there (`ls` -> "No such file or directory"). The harness lives in the coordination
> workspace by PROTOCOL.md's own rule. **DoD 10 is corrected in place above**, marked as a
> correction, and it names the harness by its workspace path — I may not spell an absolute path into
> a committed file (PROTOCOL.md §Repo layout: absolute paths live only in `machine.local.md`). You
> did the right thing by running it and saying which path you used.
> **(b)** Correct. The harness's second number is files **scanned**, not files containing an
> occurrence, so adding four clean files necessarily moves it 39 -> 43 while the count holds. **The
> baseline is the 124 occurrences** and nothing else. I re-ran it myself:
> `124 occurrence(s) in 43 file(s) scanned.` — unmoved. My future DoDs will say "124 occurrences"
> and quote no file count at all.

## Review

*(Sober, SA Lead — 2026-09-09.)*

### Verdict: **DONE — no rework.**

**I re-ran every one of the 12 DoD checks against the real repo rather than reading Fern's paste.**
Everything below is my own output, not a re-quote of hers. Where I could vary an input I did, so the
check is not a replay: I used my **own dev server on port 3023** (port confirmed free first, killed
afterwards — evidence below) and I exercised **`/classroom/7`**, a different id from her `1`.

| DoD | My result |
|---|---|
| 1 | `ls src/app/*/layout.tsx` = the four; `find src/app -name "layout.tsx"` = **5**; `find src/app/classroom -name "layout.tsx" \| wc -l` = **0** OK |
| 2 | one `title:` line per file, page name only; `grep -c "\|"` and `grep -c "—"` = **0 0 0 0** OK |
| 3 | **bytes match A34 exactly** — `33 / 33 / 9 / 33`, see the byte block below OK |
| 4 | `grep -rn "use client"` on the four -> no output, **exit 1** OK |
| 5 | `npm run build` -> **exit 0**, `Compiled successfully in 2.2s`, 10/10 static pages, **the same 9 routes** OK |
| 6 | `npx tsc --noEmit` -> **exit 0**, no output OK |
| 7 | **all 8 rendered titles exact**, character for character, on my own server OK |
| 8 | `/` title pipe count -> **0** — A31 holds OK |
| 9 | 14 total = the protected **6** + 8 in the two strays; **nothing changed** OK (wording defect in my DoD, not hers — Q1 answered) |
| 10 | `124 occurrence(s) in 43 file(s) scanned.` — **the 124 baseline is unmoved** OK (path defect in my DoD — Q2 answered, DoD 10 corrected in place) |
| 11 | mtimes prove **only her four files** were written OK |
| 12 | a real browser tab — accepted as run, and carried as `UNVERIFIED 2` (it was an automated Chrome, not the owner's eyes) |

**The four names, as bytes, out of the files themselves** (`grep -h "title:" … | od -An -tx1`) —
byte-identical to DoD 3 and therefore to `SYSTEM-FACTS.md` **A34**:

```
login         e0 b9 80 e0 b8 82 e0 b9 89 e0 b8 b2 e0 b8 aa e0 b8 b9 e0 b9 88 e0 b8 a3 e0 b8 b0 e0 b8 9a e0 b8 9a  (33)
register      e0 b8 aa e0 b8 a1 e0 b8 b1 e0 b8 84 e0 b8 a3 e0 b8 aa e0 b8 a1 e0 b8 b2 e0 b8 8a e0 b8 b4 e0 b8 81  (33)
teach         e0 b8 aa e0 b8 ad e0 b8 99                                                                          (9)
verify-email  e0 b8 a2 e0 b8 b7 e0 b8 99 e0 b8 a2 e0 b8 b1 e0 b8 99 e0 b8 ad e0 b8 b5 e0 b9 80 e0 b8 a1 e0 b8 a5  (33)
```

**The 8 titles from my own server** (`curl -s http://localhost:3023/<route> | grep -o "<title>[^<]*</title>"`):

```
/              <title>DTE — Develyst The Education</title>
/about         <title>เกี่ยวกับเรา | DTE — Develyst The Education</title>
/courses       <title>ทักษะทั้งหมด | DTE — Develyst The Education</title>
/login         <title>เข้าสู่ระบบ | DTE — Develyst The Education</title>
/register      <title>สมัครสมาชิก | DTE — Develyst The Education</title>
/teach         <title>สอน | DTE — Develyst The Education</title>
/verify-email  <title>ยืนยันอีเมล | DTE — Develyst The Education</title>
/classroom/7   <title>DTE — Develyst The Education</title>
```

All 8 match the §Expected end state table exactly. And the rendered `/login` title **as bytes** shows
the seam working as designed — the owner's 33 bytes, then ` | ` (`20 7c 20`) and the em dash
(`e2 80 94`) supplied by TASK-015's root template, **neither typed in any of the four new files**:

```
3c 74 69 74 6c 65 3e  e0 b9 80 … e0 b8 9a  20 7c 20  44 54 45 20  e2 80 94  20 44 65 76 65 6c 79 73 74 …
   "<title>"           the 33 A34 bytes      " | "      "DTE "      em dash    " Develyst The Education"
```

### What I checked hardest, and why

1. **The thing this design can break silently is `/` (A31)** — a `title.template` applies to every
   descendant segment, so a wrong shape anywhere shows up as `/` growing a tail. My own pipe count
   on `/` is **0**, and `/`'s title is one part. Not assumed — measured, on a fresh server.
2. 🔴 **`/classroom/[id]` really is untouched.** This was the one instant-REWORK condition in the
   TASK, and it is clean three ways: **no layout file exists** under `classroom/`
   (`find … | wc -l` = 0), the page's mtime is still **2026-09-06 20:54**, and `/classroom/7` on my
   server renders the **one-part** title. **No name was invented** — not even the obvious one, and
   not even though `ห้องเรียน` had by then been stated by the owner (A37). Fern had no way to know
   that when she built, and she correctly did not guess. Exactly right.
3. **Scope, proved rather than asserted.** `ls -l --time-style=long-iso`: the only **00:34** mtimes
   are her four new `layout.tsx`. `src/app/layout.tsx`, `src/app/page.tsx`, `about/page.tsx` and
   `courses/page.tsx` all still read **2026-09-09 00:11** (TASK-015's edits), `verify-email/page.tsx`
   **2026-09-08 23:34** (TASK-014's), the four `page.tsx` and the two strays **2026-09-06**. Nothing
   was touched "while I was in there" — including the six `DTE Platform` lines that belong to REQ-006.
4. **The Thai was not retyped.** Her generator copied the names out of the TASK table and refused to
   write unless they matched DoD 3's independent hex — the same discipline as TASK-015's em dash. My
   `od` on the files afterwards agrees to the byte. This is the check that stops a silent one-vowel
   drift in the owner's own words.

### Two DoD defects — **both mine, neither hers**

For the second review running, the engineer's non-blocking questions found errors in **my** DoD, not
in her work. Both are answered in §Questions and one is corrected in place:

- **Q1 — DoD 9's "exactly the 6" vs the command's 14.** Her reading is right: 6 is the count
  *excluding* the two stray non-route files. My DoD stated a number the command it prescribed could
  not produce. Answered; future DoDs of mine use the `--exclude=` form so the number matches the
  output.
- **Q2(a) — DoD 10's harness path.** `../ai-worker/…` from `front/` resolves **inside the code
  repo**, where no `ai-worker/` exists (I reproduced it). **DoD 10 is corrected in place**, marked as
  a correction. **Q2(b)** — she is right that the harness's second number is files *scanned*: 39 -> 43
  is the arithmetic of adding four clean files, and the baseline that matters is the **124
  occurrences**, which is unmoved.

Neither defect changes a line of code and neither is rework. She ran both checks anyway, said which
path she used, and asked instead of quietly adjusting the number — which is the behaviour this
project needs given there is no QA here.

### UNVERIFIED carried forward — accepted, not laundered

All four of Fern's stand, and I add nothing new:

1. **`DONE` != deployed.** `dte.develyst.online` still serves the old titles for these four routes
   until the owner ships it. No production contact happened in this task or in this review — every
   request of mine went to `localhost:3023`.
2. **Only an automated Chrome has read the tabs.** REQ-005's acceptance criterion is the owner's own
   look, route by route. Still owed — the same carry as TASK-015, and it now covers 7 routes.
3. **`/teach` was read logged out.** The title is correct on arrival (server-rendered head) and the
   client guard then redirects to `/login`. Nobody has seen the tab of an authenticated `/teach`.
   Neither Fern nor I have credentials, and we would not use them if we did.
4. **`/classroom/[id]` was exercised with arbitrary ids** (her `1`, my `7`) on a local server. No
   real course was involved.

UNVERIFIED 1–3 go to Porter to carry to the owner; 1 and 2 join the existing "owner's own eyes" row
on the board rather than opening a new one.

### Local evidence hygiene

My dev server was started on **3023** (checked free first: `netstat -ano | grep ":3023" | grep -i
listening` -> nothing), and **stopped when I finished**: `taskkill /PID 12212 /T /F` -> `SUCCESS`, and
the same `netstat` afterwards returns **no LISTENING socket on 3023**. Nothing of mine is left
running. **No production contact of any kind.**

### Status

**`REVIEW` -> `DONE`.** SPEC-004 Part B is 4/5 complete. **REQ-005 stays `IN_SPEC`** — the fifth
route, `/classroom/[id]`, is now unblocked by the owner (**A37 = `ห้องเรียน`**) and is a separate
TASK I write next, not an amendment to this one.
