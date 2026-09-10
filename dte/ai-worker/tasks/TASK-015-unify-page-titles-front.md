# TASK-015: Unify the page titles in `front/` — root template + 3 routes
- Source: SPEC-004
- Owner: **FE (Fern)**
- Status: **DONE**
- Depends on: none
- Written: 2026-09-09 by Sober (SA Lead)

## What to do

Four edits, in `front/` only. **No new file, no deleted file, no dependency, no route change.**
The exact strings below are owner-stated (`SYSTEM-FACTS.md` **A19/A29/A30/A31**) — do not
re-derive, re-word or "improve" any of them.

**1. `front/src/app/layout.tsx` (line 22) — replace the string title with the object form:**

```ts
  title: {
    default: "DTE — Develyst The Education",
    template: "%s | DTE — Develyst The Education",
  },
```

The dash inside the site part is the **em dash U+2014** (bytes `e2 80 94`) — the same character
already on that line today; the separator before it is an **ASCII pipe `|`** (byte `7c`). Copy the
existing character rather than typing a new one. `description` on line 23 is unchanged.

**2. `front/src/app/page.tsx` — DELETE the whole `title:` line (line 18).**
Not "change it", not `absolute:` — delete the key so `/` falls through to `default`. Keep
`description` (line 19) and keep the `metadata` export itself. **Reason (SPEC-004 §Decision 2):**
Next applies the root `template` to the home page too, so leaving that line renders
`DTE — Develyst The Education | DTE — Develyst The Education`, which breaks A31.

**3. `front/src/app/about/page.tsx` (line 13)** — `title: 'เกี่ยวกับเรา | DTE Platform',`
→ `title: 'เกี่ยวกับเรา',`

**4. `front/src/app/courses/page.tsx` (line 14)** — `title: 'ทักษะทั้งหมด | DTE Platform',`
→ `title: 'ทักษะทั้งหมด',`

**Do NOT touch, even though they match a grep:**
`front/src/app/about/page-new.tsx` and `front/src/app/about/page.tsx.backup` (not routes — Porter's
housekeeping), the six body-copy occurrences of `DTE Platform` (SPEC-004 §Decision 5), and the five
`'use client'` routes `/login` `/register` `/teach` `/verify-email` `/classroom/[id]` — they are
**Part B, blocked on the owner** (SPEC-004 §Questions Q1). Leaving them reading
`DTE — Develyst The Education` is the correct result of this task, not an omission.

## Expected titles after the change (all 8 routes)

| Route | Expected `<title>` |
|---|---|
| `/` | `DTE — Develyst The Education` (**unchanged** — altering it is a defect) |
| `/about` | `เกี่ยวกับเรา \| DTE — Develyst The Education` |
| `/courses` | `ทักษะทั้งหมด \| DTE — Develyst The Education` |
| `/login` `/register` `/teach` `/verify-email` `/classroom/[id]` | `DTE — Develyst The Education` (unchanged — Part B) |

## Definition of Done

Paste the **command and its real output** for each. `UNVERIFIED — <what would settle it>` for
anything you did not actually run — there is no QA here and an honest UNVERIFIED costs one hop.

- [ ] **1.** `grep -n -A3 "title:" src/app/layout.tsx` — shows `default` + `template`, both with
      the full site string.
- [ ] **2.** `sed -n '15,22p' src/app/page.tsx` — **no `title:` line**, `description` still there.
- [ ] **3.** `grep -rn "DTE Platform" src/app/about/page.tsx src/app/courses/page.tsx` — the two
      **`title:`** lines no longer match (the `/about` body-copy lines 45 and 128 still do, and
      **must** — Decision 5).
- [ ] **4.** `npm run build` — exit 0, and the route list still shows the same routes as before.
- [ ] **5.** `npx tsc --noEmit` — exit 0.
- [ ] **6.** Local dev server on a free port (start it, **stop it when done**), then for each of
      the 8 routes fetch the page and print its `<title>`, e.g.
      `curl -s http://localhost:<port>/about | grep -o "<title>[^<]*</title>"`.
      All 8 must match the table above **exactly**, character for character.
- [ ] **7.** Em dash proof, not eyeballing: `sed -n '22,24p' src/app/layout.tsx | od -An -tx1`
      contains `e2 80 94`, and the separator is `7c`. Same check on one rendered title from step 6.
- [ ] **8.** `node ../ai-worker/tests/harness/check-no-emoji.mjs src` (run from `front/`) — still
      the **124 in 39 files** baseline, unchanged.
      *(Corrected 2026-09-09 by Sober at review: the `src` argument was missing when this DoD was
      written — without it the script prints `usage:` and scans nothing. Fern's Q1, confirmed.)*
- [ ] **9.** `git status --short` is **not** part of this DoD — git is out of the team's scope
      (`SYSTEM-FACTS.md` A23). Instead: confirm in words that `about/page-new.tsx` and
      `about/page.tsx.backup` were not edited.
- [ ] **10.** **Open `/`, `/about` and `/courses` in a real browser and read the tab.** REQ-005's
      acceptance criterion says "confirmed in a browser, route by route, not by reading the
      source". If you cannot, write `UNVERIFIED` and say which routes.

## Enumeration evidence (produced by Sober, 2026-09-09, read-only on `develop`)

Recorded here so REQ-005 AC 1 ("a repeatable search, command and its actual output recorded") is
met before anything is edited. Re-run any of these to reproduce the before-state.

```
$ find . -path ./node_modules -prune -o \( -name "page.tsx" -o -name "layout.tsx" \
    -o -name "not-found.tsx" -o -name "error.tsx" \) -print | sort
./src/app/about/page.tsx
./src/app/classroom/[id]/page.tsx
./src/app/courses/page.tsx
./src/app/layout.tsx
./src/app/login/page.tsx
./src/app/page.tsx
./src/app/register/page.tsx
./src/app/teach/page.tsx
./src/app/verify-email/page.tsx

$ grep -rn --include=*.tsx --include=*.ts "title:" src/app     # metadata titles only, extracts
src/app/about/page-new.tsx:13:  title: 'เกี่ยวกับเรา | DTE Platform',   <- NOT a route, do not edit
src/app/about/page.tsx:13:      title: 'เกี่ยวกับเรา | DTE Platform',
src/app/courses/page.tsx:14:    title: 'ทักษะทั้งหมด | DTE Platform',
src/app/layout.tsx:22:          title: "DTE — Develyst The Education",
src/app/page.tsx:18:            title: 'DTE — Develyst The Education',

$ grep -rln "^'use client'" src/app
src/app/classroom/[id]/page.tsx
src/app/login/page.tsx
src/app/register/page.tsx
src/app/teach/page.tsx
src/app/verify-email/page.tsx          # <- the 5 with no title of their own (Part B)

$ grep -rn "generateMetadata" src
(none)

$ sed -n '22p' src/app/layout.tsx | od -An -tx1
  ... 44 54 45 20 e2 80 94 20 44 65 76 ...        # "DTE <U+2014> Devel..."  em dash confirmed
```

## Implementation Notes

Done by Fern, 2026-09-09. **4 edits, `front/` only. No file created, none deleted, no dependency,
no route change.** The em dash was never typed: a small node script **reused the existing site
string from `layout.tsx:22` verbatim** and built `default` + `template` from it, so the U+2014
bytes are the same ones already on disk. All four files are CRLF and stayed CRLF.

Files changed (4):
- `front/src/app/layout.tsx` — line 22 string title -> object form (`default` + `template`).
- `front/src/app/page.tsx` — the `title:` line **deleted** (`description` and the `metadata` export kept).
- `front/src/app/about/page.tsx` — line 13 -> `title: 'เกี่ยวกับเรา',`
- `front/src/app/courses/page.tsx` — line 14 -> `title: 'ทักษะทั้งหมด',`

### DoD 1 — `grep -n -A3 "title:" src/app/layout.tsx`
```
22:  title: {
23-    default: "DTE — Develyst The Education",
24-    template: "%s | DTE — Develyst The Education",
25-  },
```

### DoD 2 — `sed -n '15,22p' src/app/page.tsx`
```
import CategoryCard from '@/components/ui/CategoryCard';

export const metadata: Metadata = {
  description: 'แพลตฟอร์มเรียนรู้ออนไลน์ที่ให้อิสระในการเรียนรู้ ไม่จำกัดด้วยวุฒิการศึกษา พร้อม AI ครูส่วนตัว 24/7',
};

export default function Home() {
  return (
```
No `title:` line; `description` still there. The deleted line was `  title: 'DTE — Develyst The Education',`.

### DoD 3 — `grep -rn "DTE Platform" src/app/about/page.tsx src/app/courses/page.tsx`
```
src/app/about/page.tsx:45:              description="DTE Platform คือการเรียนรู้ส่วนตัว..."
src/app/about/page.tsx:128:                  <th className="text-left p-6 text-sky-600 font-bold">DTE Platform</th>
```
Neither `title:` line matches any more; `courses/page.tsx` has **no** match at all. Lines 45 and 128
are the body copy that **must** stay (SPEC-004 §Decision 5) — untouched.

### DoD 4 — `npm run build` -> **exit 0**
```
✓ Compiled successfully in 3.3s
  Finished TypeScript in 4.2s ...
✓ Generating static pages using 11 workers (10/10) in 445ms
Route (app)
┌ ○ /   ├ ○ /_not-found   ├ ○ /about   ├ ƒ /classroom/[id]
├ ○ /courses   ├ ○ /login   ├ ○ /register   ├ ○ /teach   └ ○ /verify-email
BUILD_EXIT=0
```
The same 9 routes as TASK-014's post-state — nothing added or removed.

### DoD 5 — `npx tsc --noEmit` -> `TSC_EXIT=0`, no output.

### DoD 6 — local dev server on **port 3017** (`npx next dev -p 3017`), **stopped afterwards**
(`Stop-Process` on the listener pid, re-checked: `port 3017 free`). All 8 routes, character for
character as the table requires:
```
/                   ==>  <title>DTE — Develyst The Education</title>
/about              ==>  <title>เกี่ยวกับเรา | DTE — Develyst The Education</title>
/courses            ==>  <title>ทักษะทั้งหมด | DTE — Develyst The Education</title>
/login              ==>  <title>DTE — Develyst The Education</title>
/register           ==>  <title>DTE — Develyst The Education</title>
/teach              ==>  <title>DTE — Develyst The Education</title>
/verify-email       ==>  <title>DTE — Develyst The Education</title>
/classroom/abc123   ==>  <title>DTE — Develyst The Education</title>
```

### DoD 7 — em dash as bytes, in the source AND in a rendered title
`sed -n '22,26p' src/app/layout.tsx | od -An -tx1` (head):
```
 20 20 74 69 74 6c 65 3a 20 7b 0a 20 20 20 20 64
 65 66 61 75 6c 74 3a 20 22 44 54 45 20 e2 80 94
 20 44 65 76 65 6c 79 73 74 20 54 68 65 20 45 64
 75 63 61 74 69 6f 6e 22 2c 0a 20 20 20 20 74 65
 6d 70 6c 61 74 65 3a 20 22 25 73 20 7c 20 44 54
 45 20 e2 80 94 20 44 65 76 65 6c 79 73 74 20 54
```
`e2 80 94` is present in both literals; the template's separator is `20 7c 20` = space `|` space.

Rendered `/about` title, `curl -s … | grep -o "<title>[^<]*</title>" | od -An -tx1` (site part):
```
 b8 9a e0 b9 80 e0 b8 a3 e0 b8 b2 20 7c 20 44 54
 45 20 e2 80 94 20 44 65 76 65 6c 79 73 74 20 54
 68 65 20 45 64 75 63 61 74 69 6f 6e 3c 2f 74 69
```
= `…เรา` + `20 7c 20` + `DTE` + `e2 80 94` + `Develyst The Education`. Rendered `/` likewise carries
`e2 80 94` and **no** `7c` — A31 held.

### DoD 8 — emoji harness, unchanged baseline
`node ../ai-worker/tests/harness/check-no-emoji.mjs src` (the script needs the path argument — same
invocation as TASK-014):
```
124 occurrence(s) in 39 file(s) scanned.
```
**124 in 39 files** = the baseline, unchanged.

### DoD 9 — the two stray About files were NOT edited
Confirmed in words and by mtime: `src/app/about/page-new.tsx` and `src/app/about/page.tsx.backup`
both still show **2026-09-06 20:50:12**, while the 4 files I changed show **2026-09-09 00:11:22**.
Both still contain `title: 'เกี่ยวกับเรา | DTE Platform'` — deliberately left; they are not routes.
No `git` command was run (A23).

### DoD 10 — read in a real browser, tab by tab
Opened `http://localhost:3017/`, `/about`, `/courses` in an actual Chrome tab and read the tab title
(`document.title` and the browser's own tab label):
```
/         ->  DTE — Develyst The Education
/about    ->  เกี่ยวกับเรา | DTE — Develyst The Education
/courses  ->  ทักษะทั้งหมด | DTE — Develyst The Education
```
Tab closed afterwards.

### UNVERIFIED — stated plainly, not laundered
1. **UNVERIFIED — the live site.** Nothing here is deployed; `dte.develyst.online` still serves the
   old titles until the owner ships it. Settled by: the owner deploying and looking.
2. **UNVERIFIED — the owner's own eyes.** DoD 10 ran in an automated Chrome, not a person's. It
   proves the browser renders the string; it does not replace REQ-005's "confirmed in a browser" by
   the owner. Settled by: the owner opening the 3 tabs.
3. **UNVERIFIED — Part B's interim state.** The 5 client routes correctly still read
   `DTE — Develyst The Education`; whether that is acceptable as an interim state is the owner's
   call, not mine. Settled by: SPEC-004 §Questions Q1 being answered.

## Questions

**Q1 -> Sober. NOT blocking — TASK-015 is complete either way. A harness note for the record.**
DoD 8 as written is `node ../ai-worker/tests/harness/check-no-emoji.mjs` with no argument. Run that
way the script prints `usage: node check-no-emoji.mjs <path-to-scan>` and exits without scanning. I
ran `… check-no-emoji.mjs src` from `front/`, the same invocation as TASK-014, which gives the
124/39 baseline. Flagging only so a future TASK's DoD line carries the argument.

> answer (Sober, 2026-09-09): **Correct, and it was my DoD that was wrong — thank you for flagging
> it rather than silently substituting.** I reproduced both halves: with no argument the script
> prints `usage: node check-no-emoji.mjs <path-to-scan>` and scans nothing; run as
> `node ../ai-worker/tests/harness/check-no-emoji.mjs src` from `front/` it gives
> `124 occurrence(s) in 39 file(s) scanned.` — the baseline. Your substitution was the right call
> and the evidence stands. I have **corrected DoD 8 above** (marked as a correction) and every
> future TASK of mine will carry the `<path>` argument. Non-blocking, as you said; nothing in
> this task changes.

*(Fern asks here; Sober answers as `> answer: ...`)*

## Review

**Verdict: `DONE` — no rework.** Reviewed by Sober (SA Lead), 2026-09-09.

**I re-ran all 10 DoD checks myself against the real repo on `develop`, not against Fern's paste.**
Every one reproduced. My own commands and output:

- **DoD 1-3 (the 4 edits).** `sed -n '18,28p' src/app/layout.tsx` shows the object form with
  `default` + `template`; `sed -n '12,24p' src/app/page.tsx` shows `export const metadata` with
  `description` and **no `title:` line** — Decision 2's trap avoided; `/about:13` is
  `title: 'เกี่ยวกับเรา',` and `/courses:14` is `title: 'ทักษะทั้งหมด',`. A full
  `grep -rn "title:" src/app` returns only those, plus `page-new.tsx:13` (not a route) and three
  unrelated non-metadata hits (`classroom/[id]:27,56`, `teach:23,155`) — nothing else was touched.
- **DoD 4 `npm run build` -> exit 0**, route list identical: `/ · /_not-found · /about ·
  /classroom/[id] · /courses · /login · /register · /teach · /verify-email`.
  **DoD 5 `npx tsc --noEmit` -> exit 0**, no output.
- **DoD 6 — the decisive one. My own dev server on port 3019** (started by me, **stopped
  afterwards**: no `LISTENING` socket on 3019 remains, only my own curls' `TIME_WAIT`). All **8
  routes match the expected table character for character**, including `/` unchanged and the five
  Part B routes still one-part:
  ```
  /                 ==> <title>DTE — Develyst The Education</title>
  /about            ==> <title>เกี่ยวกับเรา | DTE — Develyst The Education</title>
  /courses          ==> <title>ทักษะทั้งหมด | DTE — Develyst The Education</title>
  /login /register /teach /verify-email /classroom/abc123
                    ==> <title>DTE — Develyst The Education</title>   (x5)
  ```
- **DoD 7 — em dash proved as bytes twice, by me.** Source
  `sed -n '22,25p' src/app/layout.tsx | od -An -tx1` carries `e2 80 94` in **both** literals and
  `20 7c 20` as the template separator. The rendered `/about` title likewise:
  `… 20 7c 20 44 54 45 20 e2 80 94 20 …`. And the rendered `/` title is
  `3c 74 69 74 6c 65 3e 44 54 45 20 e2 80 94 …` with a **pipe count of 0** — **A31 holds**, which
  was the single highest-risk thing in this design.
- **DoD 8** -> `124 occurrence(s) in 39 file(s) scanned.` = the baseline. (My DoD line was missing
  its argument — see §Questions Q1; corrected above.)
- **DoD 9 — scope held, and I checked it the hard way.** `src/app/about/page-new.tsx` and
  `page.tsx.backup` both still show mtime **2026-09-06 20:50:12** and still contain the old
  `เกี่ยวกับเรา | DTE Platform` title, while the four edited files show **2026-09-09 00:11:22**.
  A repo-wide `grep -rn "DTE Platform" src` returns exactly the **6 body-copy occurrences**
  Decision 5 protects (`about:45`, `about:128`, `login:86`, `register:193`, `teach:104`,
  `services/api.ts:1`) plus those two stray files — **nothing was "fixed while in there"**, which
  is the failure mode this task was written to prevent.
- **DoD 10** — Fern read three tabs in a real Chrome; I did not repeat the browser step, because
  DoD 6 + 7 prove the exact bytes the browser is served. It stays UNVERIFIED for the owner's eyes
  (below) — which is what REQ-005's acceptance criterion actually asks for.

**The 3 UNVERIFIED are accepted, not laundered**, and carried forward exactly as written:
(1) the **live site is unchanged** — `DONE` is not deployed, `dte.develyst.online` still serves the
old titles until the owner ships it; (2) **the owner's own eyes** — an automated Chrome is not the
person REQ-005 names, so this is now a Blocked row for him via Porter; (3) **Part B's interim
state** — the five client routes correctly still read the one-part title, and whether that is an
acceptable interim is his call, not ours.

**Nothing to rework.** The work matched the SPEC line for line, the one deliberate deviation
(DoD 8's argument) was flagged instead of hidden, and the untouched-on-purpose list was proved by
mtime and grep rather than asserted.

**What this does NOT close.** SPEC-004 stays `ACTIVE` and REQ-005 stays `IN_SPEC`: **Part B is
still unwritten.** Four of its five names are now owner-stated (`SYSTEM-FACTS.md` **A34**) and are
taskable; `/classroom/[id]`'s shared word is still with the owner (**A35**). Writing that task is
my next unit — it is not a defect of TASK-015.
