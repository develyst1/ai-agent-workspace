# TASK-017: Part B's fifth route — the `/classroom/[id]` page title

- Source: SPEC-004 (§Decision 4, §Decision 6) — REQ-005
- Owner: **FE (Fern)**
- Status: **DONE** — reviewed 2026-09-09 by Sober, no rework
- Depends on: **TASK-015 ✅ DONE** (the root `title.template` in `src/app/layout.tsx` supplies the
  tail) and **TASK-016 ✅ DONE** (the four sibling files whose shape you copy). Nothing else.
- Written: 2026-09-09 by Sober (SA Lead)

## Why this exists now

TASK-016 deliberately built **four** of Part B's **five** routes. `/classroom/[id]` was excluded for
exactly one reason: the owner had chosen the *rule* (one shared fixed name — `SYSTEM-FACTS.md`
**A35**) but not the *word*, and REQ-005 §Requirement 4 forbids anyone here inventing it. You
respected that in TASK-016 — correctly, and it was checked three ways at review.

**The word has now arrived from the owner: `ห้องเรียน` (`SYSTEM-FACTS.md` A37, `Q1=ก`).** `เรียน`
and `บทเรียน` were the rejected options; the per-course title stays rejected (A35). So this is a
**fifth file of the identical shape** — no new mechanism, no `generateMetadata`, no re-design, and
nothing already `DONE` is reopened. It is the last unit of SPEC-004.

## What to do

Create **one new file**. Change **nothing else** — no page file, no root layout, no component, no
other route's layout.

| New file | `title` value | Resulting tab (template supplies the tail) |
|---|---|---|
| `front/src/app/classroom/[id]/layout.tsx` | `ห้องเรียน` | `ห้องเรียน \| DTE — Develyst The Education` |

I verified against the repo on 2026-09-09: `src/app/classroom/[id]/` contains **only** `page.tsx`
today, so this is a genuinely new file and nothing is overwritten.

Its shape is the one TASK-016 established and that I re-verified at its review — copy it from
`front/src/app/login/layout.tsx` and change only the `title` string and the function name:

```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ห้องเรียน',
};

export default function ClassroomLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

**Rules that make or break this task** (the same ones that governed TASK-016 — they did not loosen
because this is one file instead of four):

1. **No `'use client'` in this file.** A client component cannot export `metadata`; that is the
   whole reason `page.tsx` can't carry its own title (SPEC-004 §Decision 4).
2. **Pass-through only.** `return children;` — no wrapper element, no `<html>`, no `<body>`, no
   provider, no styling. The root layout already renders `html`/`body`/`Navbar`/`main`/`Footer`.
   The classroom page is auth-guarded via `withAuth` inside `page.tsx`; **this layout must not
   touch, wrap, duplicate or "improve" that guard** — a layout that rendered anything of its own
   would change a live, auth-carrying page to achieve a copy fix, which REQ-005 **C2** forbids.
3. **Set only `title`.** No `description`, no OG tags, no keywords — out of scope (REQ-005 §Out of
   Scope).
4. **The tail is NOT typed in this file.** Only the page name goes here; the
   ` | DTE — Develyst The Education` half comes from the root `title.template` (SPEC-004
   §Decision 1). If you find yourself typing a pipe or an em dash in this file, stop.
5. 🔴 **Do not retype the Thai.** `ห้องเรียน` is the owner's own word (A37) and nobody may re-word,
   expand, shorten or per-course-ify it. **Copy the string byte-for-byte** out of this file's table
   above or out of `SYSTEM-FACTS.md` **A37** — the technique you used in TASK-016. DoD 3 checks the
   bytes, so a retype that drifts by one vowel mark or tone mark will fail.
6. 🔴 **One name for every classroom — never per-course.** Do **not** add `generateMetadata`, do
   **not** read the course from `params`, do **not** fetch the course title. A35 rejected the
   per-course tab explicitly and A37 did not reopen it. Adding it is a **defect, not initiative**,
   and is instant REWORK.
7. **Touch no page file.** `src/app/classroom/[id]/page.tsx` stays exactly as it is, `'use client'`
   and all. Nothing in `src/app/page.tsx`, `src/app/layout.tsx`, `about/`, `courses/`, or the four
   TASK-016 layouts changes either — re-touching them is out of scope.
8. **`about/page-new.tsx` and `about/page.tsx.backup` stay untouched** (SPEC-004 §Enumeration).
   Still not routes, still Porter's housekeeping, still not yours to "fix while in there".
9. **The surviving `DTE Platform` occurrences are not yours in this task.** They belong to
   **REQ-006** (the owner answered: they become the short `DTE`, A38 — and the
   `src/services/api.ts:1` comment is **excluded**, A39). That SPEC is not written yet. Leave every
   one of them alone.
10. **No production contact of any kind** — evidence comes from a **local** dev server you start
    and stop yourself (REQ-005 C3).

## Expected end state — all 9 titles

After this task **every route on the site is two-part except `/`**, which is the finished state
REQ-005 asked for. This is the full check, not just the route you touched:

| Route | Title |
|---|---|
| `/` | `DTE — Develyst The Education` *(one part — A31, must not gain a tail)* |
| `/about` | `เกี่ยวกับเรา \| DTE — Develyst The Education` |
| `/courses` | `ทักษะทั้งหมด \| DTE — Develyst The Education` |
| `/login` | `เข้าสู่ระบบ \| DTE — Develyst The Education` |
| `/register` | `สมัครสมาชิก \| DTE — Develyst The Education` |
| `/teach` | `สอน \| DTE — Develyst The Education` |
| `/verify-email` | `ยืนยันอีเมล \| DTE — Develyst The Education` |
| `/classroom/[id]` | `ห้องเรียน \| DTE — Develyst The Education` **← this task, identical for every id** |
| 404 (framework) | Next's own — out of scope (SPEC-004 §Flow edge case (a)) |

## Definition of Done

Paste the **command and its real output** for each. `UNVERIFIED — <what would settle it>` for
anything you did not actually run — there is no QA here and an honest UNVERIFIED costs one hop.
Run everything from `front/`.

- [ ] **1.** `find src/app -name "layout.tsx" | sort` — **six** files total: the root, the four from
      TASK-016, and the new `src/app/classroom/[id]/layout.tsx`. Nothing else appeared.
- [ ] **2.** `grep -rn "title" "src/app/classroom/[id]/layout.tsx"` — exactly **one** `title:` line,
      the page name only. `grep -c "|"` and `grep -c "—"` on the file → **0** and **0** (rule 4).
- [ ] **3.** **Bytes, not eyeballing.** `grep -h "title:" "src/app/classroom/[id]/layout.tsx" | od -An -tx1`
      — the name's UTF-8 bytes between the two `27` quote characters must be exactly
      `e0 b8 ab e0 b9 89 e0 b8 ad e0 b8 87 e0 b9 80 e0 b8 a3 e0 b8 b5 e0 b8 a2 e0 b8 99`
      (**27 bytes**, 9 Thai code points). Any other byte string is a retype, not a copy.
- [ ] **4.** `grep -rn "use client" "src/app/classroom/[id]/layout.tsx"` — **empty** (rule 1).
- [ ] **5.** `grep -rn "generateMetadata\|useParams\|params" "src/app/classroom/[id]/layout.tsx"` —
      **empty**. This is the check that proves rule 6: the title does not depend on the id.
- [ ] **6.** `npm run build` — exit 0, and the route list still shows the **same 9 routes** as before
      this task (no route added, none lost). `/classroom/[id]` must still be listed as a **dynamic**
      route — adding a layout must not change how it renders.
- [ ] **7.** `npx tsc --noEmit` — exit 0.
- [ ] **8.** Local dev server on a free port (start it, **stop it when done, and say so**), then for
      each of the **8** app routes print the rendered title, e.g.
      `curl -s http://localhost:<port>/classroom/7 | grep -o "<title>[^<]*</title>"`.
      All 8 must match the "Expected end state" table **exactly, character for character**.
- [ ] **9.** **Same name for every id** — the point of A35/A37. Fetch the title for **at least three
      different ids**, including a non-numeric one, e.g. `/classroom/1`, `/classroom/7`,
      `/classroom/abc`. All three must render the **identical** two-part title. If a non-numeric id
      errors before rendering a head, say so and record exactly what it did — that is information,
      not a failure of this task.
- [ ] **10.** **`/` did not regress.** `curl -s http://localhost:<port>/ | grep -o "<title>[^<]*</title>" | grep -c "|"`
      → **0**. A31 is the thing this design can break silently; prove it, don't assume it.
- [ ] **11.** `grep -rn "DTE Platform" src | wc -l` — still **14** lines: the **6** occurrences
      REQ-006 is about (`about/page.tsx` ×2, `login/page.tsx`, `register/page.tsx`,
      `teach/page.tsx`, `services/api.ts`) **plus 8 in the two stray About files**
      (`page-new.tsx` ×3, `page.tsx.backup` ×5). All 14 are protected in this task (rules 8, 9).
- [ ] **12.** Run the emoji harness from `front/`, giving `src` as its argument and invoking the
      script by its **workspace** path (`ai-worker/tests/harness/check-no-emoji.mjs` — it lives in
      the coordination workspace, **not** in the code repo; the corrected invocation you worked out
      in TASK-016 Q2(a)). The baseline that must not move is **124 occurrences**; the second number
      is files *scanned* and legitimately rises by one with the file you add.
- [ ] **13.** Confirm in words: `src/app/classroom/[id]/page.tsx`, `src/app/page.tsx`,
      `src/app/layout.tsx`, the four TASK-016 layouts, `about/`, `courses/`, `about/page-new.tsx`
      and `about/page.tsx.backup` were **not edited**. `ls -l --time-style=long-iso` on them
      (mtimes) is the cheapest proof.
- [ ] **14.** **Open `/classroom/<some id>` in a real browser and read the tab.** REQ-005's
      acceptance criterion says "confirmed in a browser, route by route, not by reading the source".
      The page is auth-guarded in the client (`withAuth`), but its `<title>` comes from the
      server-rendered head, so it is readable without a session — **if the page redirects you to
      `/login`, that is expected; record the title you saw on arrival and say that it redirected**,
      the way you did for `/teach` in TASK-016. If you cannot open a browser, write `UNVERIFIED`.

## Implementation Notes

*(Fern, 2026-09-09)*

**Changed: exactly one file — created `front/src/app/classroom/[id]/layout.tsx` (227 bytes).** No other
file in the repo was edited (DoD 13 mtimes below). The Thai name was **not retyped**: I extracted it
programmatically from `SYSTEM-FACTS.md` line 798 (A37) with `sed` and shell-piped those bytes into the
file — the same technique as TASK-016.

```
NAME=$(sed -n '798p' SYSTEM-FACTS.md | sed 's/.*is `//; s/`.*//')
printf '%s' "$NAME" | od -An -tx1
 e0 b8 ab e0 b9 89 e0 b8 ad e0 b8 87 e0 b9 80 e0
 b8 a3 e0 b8 b5 e0 b8 a2 e0 b8 99
printf '%s' "$NAME" | wc -c   ->  27
```

File as written:

```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ห้องเรียน',
};

export default function ClassroomLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

### DoD evidence (all run from `front/`)

**1. Six layouts, nothing else appeared** — `find src/app -name "layout.tsx" | sort`
```
src/app/classroom/[id]/layout.tsx
src/app/layout.tsx
src/app/login/layout.tsx
src/app/register/layout.tsx
src/app/teach/layout.tsx
src/app/verify-email/layout.tsx
```

**2. One `title:` line, no pipe, no em dash** — `grep -rn "title" "src/app/classroom/[id]/layout.tsx"`
```
4:  title: 'ห้องเรียน',
grep -c "|"  -> 0        grep -c "—"  -> 0
```

**3. Bytes, not eyeballing** — `grep -h "title:" "src/app/classroom/[id]/layout.tsx" | od -An -tx1`
```
 20 20 74 69 74 6c 65 3a 20 27 e0 b8 ab e0 b9 89
 e0 b8 ad e0 b8 87 e0 b9 80 e0 b8 a3 e0 b8 b5 e0
 b8 a2 e0 b8 99 27 2c 0a
```
Between the two `27` quote bytes: `e0 b8 ab e0 b9 89 e0 b8 ad e0 b8 87 e0 b9 80 e0 b8 a3 e0 b8 b5 e0 b8
a2 e0 b8 99` — **27 bytes, 9 Thai code points, exactly the string DoD 3 specifies.**

**4. No `'use client'`** — `grep -rn "use client" "src/app/classroom/[id]/layout.tsx"` -> no output, exit 1 (empty).

**5. No `generateMetadata` / `useParams` / `params`** — same grep form -> no output, exit 1 (empty).
The title structurally cannot depend on the id (rule 6 / A35).

**6. `npm run build` -> exit 0**, same 9 route entries as before, `/classroom/[id]` still **ƒ Dynamic**:
```
✓ Compiled successfully in 3.0s
Route (app)
┌ ○ /               ├ ○ /_not-found    ├ ○ /about         ├ ƒ /classroom/[id]
├ ○ /courses        ├ ○ /login         ├ ○ /register      ├ ○ /teach          └ ○ /verify-email
BUILD_EXIT=0
```

**7. `npx tsc --noEmit` -> `TSC_EXIT=0`.**

**8. All 8 app routes, live, character for character** — dev server `npx next dev -p 3024`, started by me
and **stopped by me** (see "Server stopped" below):
```
/             <title>DTE — Develyst The Education</title>
/about        <title>เกี่ยวกับเรา | DTE — Develyst The Education</title>
/courses      <title>ทักษะทั้งหมด | DTE — Develyst The Education</title>
/login        <title>เข้าสู่ระบบ | DTE — Develyst The Education</title>
/register     <title>สมัครสมาชิก | DTE — Develyst The Education</title>
/teach        <title>สอน | DTE — Develyst The Education</title>
/verify-email <title>ยืนยันอีเมล | DTE — Develyst The Education</title>
/classroom/7  <title>ห้องเรียน | DTE — Develyst The Education</title>
```
All 8 match §Expected end state. The rendered classroom title in bytes shows the **seam** — my 27 bytes,
then ` | ` (`20 7c 20`) and the em dash (`e2 80 94`) supplied by TASK-015's `title.template`, neither of
which is typed in my file:
```
 3c 74 69 74 6c 65 3e e0 b8 ab e0 b9 89 e0 b8 ad e0 b8 87 e0 b9 80 e0 b8 a3 e0 b8 b5 e0 b8 a2 e0 b8 99
 20 7c 20 44 54 45 20 e2 80 94 20 44 65 76 65 6c 79 73 74 20 54 68 65 20 45 64 75 63 61 74 69 6f 6e
 3c 2f 74 69 74 6c 65 3e
```

**9. Same name for every id (A35/A37)** — three ids, one non-numeric; **no id errored**, all HTTP 200:
```
/classroom/1    HTTP 200  <title>ห้องเรียน | DTE — Develyst The Education</title>
/classroom/7    HTTP 200  <title>ห้องเรียน | DTE — Develyst The Education</title>
/classroom/abc  HTTP 200  <title>ห้องเรียน | DTE — Develyst The Education</title>
```
Identical, character for character.

**10. `/` did not regress (A31)** — `curl -s http://localhost:3024/ | grep -o "<title>[^<]*</title>" | grep -c "|"` -> **0**.

**11. `grep -rn "DTE Platform" src | wc -l` -> **14**, unchanged** (REQ-006's, not mine):
```
3 about/page-new.tsx · 2 about/page.tsx · 5 about/page.tsx.backup
1 login/page.tsx · 1 register/page.tsx · 1 teach/page.tsx · 1 services/api.ts
```

**12. Emoji harness**, invoked by its **workspace** path with `src` as the argument, from `front/`
(`node <workspace>/dte/ai-worker/tests/harness/check-no-emoji.mjs src`):
```
124 occurrence(s) in 44 file(s) scanned.
```
Baseline **124 held**; files scanned rose 43 -> 44 — exactly the one file I added, which contributes no
occurrence of its own. The harness's exit code is 1 because the baseline is non-empty (see Q2).

**13. Nothing else edited** — `ls -l --time-style=long-iso`; only the new file carries a later mtime:
```
2026-09-09 03:55  src/app/classroom/[id]/layout.tsx    <- the only file I wrote
2026-09-06 20:54  src/app/classroom/[id]/page.tsx      <- the withAuth guard file, untouched
2026-09-09 00:11  src/app/page.tsx · src/app/layout.tsx · about/page.tsx · courses/page.tsx   (TASK-015)
2026-09-09 00:34  login/ register/ teach/ verify-email layout.tsx                              (TASK-016)
2026-09-06 20:50  about/page-new.tsx · about/page.tsx.backup                                   (strays)
```

**14. Real browser** — opened `http://localhost:3024/classroom/99` in a Chrome tab. The tab title **on
arrival** read `ห้องเรียน | DTE — Develyst The Education`; the client `withAuth` guard then redirected to
`/login?redirect=%2Fclassroom%2F99`, whose tab read `เข้าสู่ระบบ | DTE — Develyst The Education`.
**The redirect is expected** and the classroom title was visible before it fired.

**Server stopped.** `npx kill-port 3024` -> "Process on port 3024 killed"; a follow-up curl returned
`HTTP 000`, exit 7 (connection refused). Browser tab closed. **No production contact of any kind** —
localhost only; no deploy, no ssh, no git write, no DB.

### UNVERIFIED (carried honestly)

- **UNVERIFIED — the live site.** All evidence is a local dev server; nothing here says anything about
  `dte.develyst.online`. Only the owner's eyes on the deployed site settle that.
- **UNVERIFIED — a person's eyes on the tab.** DoD 14 was read by an automated browser (tab title +
  `document.title`), not by a human looking at a tab strip. Same carry as TASK-016.
- **UNVERIFIED — the classroom tab while authenticated.** The guard redirected, so the tab was never
  observed *staying* on the classroom page with a session. The `<title>` is server-rendered so it is
  unaffected in principle. What would settle it: anyone with a session opening a real course and reading
  the tab.
- **UNVERIFIED — ids beyond the three tested.** `1`, `7`, `abc` were actually fetched; id-independence is
  structural (no `params` in the file), but only three ids were exercised.

## Questions

*(Fern asks here; Sober answers as `> answer: ...`)*

- **Q1 (non-blocking, for the record — DoD 9's non-numeric id).** `/classroom/abc` did **not** error: it
  returned HTTP 200 with the identical title, so DoD 9's "if it errors, record what it did" branch never
  fired. Noting the opposite outcome here so §Review need not re-derive it: **no id errored, all three
  returned 200.** Nothing needed from you unless you want it reflected in SPEC-004 §Flow.
- **Q2 (non-blocking — harness exit code).** DoD 12's harness exits **1**, not 0, because the
  124-occurrence baseline is non-empty (same as TASK-016). I read the **count** as the check, not the exit
  code. Confirm that is what you intend, or have the DoD name the count explicitly next time.

> **answer (Sober, 2026-09-09) — Q1: correct, and I have reflected it in the SPEC.** I re-ran the
> three ids myself against my own dev server (port 3037) and got the same result: `1`, `7` and
> `abc` all **HTTP 200** with the byte-identical title. The reason is structural and worth writing
> down once: `[id]` is a plain *string* segment — nothing in the route parses it as a number, and
> your layout never reads `params` at all — so a non-numeric id is not an error case **for the
> title**. (What the page *body* does with `abc` is a different question and not REQ-005's.)
> **SPEC-004 §Flow edge case (c) now records this**, so no future unit re-derives it.

> **answer (Sober, 2026-09-09) — Q2: yes — the COUNT is the check, never the exit code, and you
> read it right.** The harness exits 1 whenever the baseline is non-empty; since the agreed
> baseline **is** 124, exit 1 is the expected state and an exit 0 would itself mean something
> moved. The DoD wording was mine and it leaned on the number without saying "the exit code is not
> the signal" — **my defect, not yours.** Every harness check in the TASKs I write from now on
> names the count explicitly *and* says the exit code is ignored. Nothing changes in your work.

## Review

**Verdict: `DONE` — 2026-09-09, Sober (SA Lead). No rework.** This is SPEC-004's last unit; with it
every route on the site is two-part except `/`, which is exactly the end state REQ-005 asked for.

**I re-ran the evidence rather than reading the claim** (PROTOCOL §"Evidence and the missing QA
role"). All 14 DoD checks re-executed by me against the real repo, from `front/`:

- **1** — six `layout.tsx`, the six expected, nothing else appeared. **2** — one `title:` line;
  `grep -c "|"` → 0, `grep -c "—"` → 0. **4/5** — `use client`, `generateMetadata`, `useParams`,
  `params` all grep-empty (exit 1).
- **3 — the byte check, done twice and cross-referenced.** The written line is
  `20 20 74 69 74 6c 65 3a 20 27` · `e0 b8 ab e0 b9 89 e0 b8 ad e0 b8 87 e0 b9 80 e0 b8 a3 e0 b8 b5
  e0 b8 a2 e0 b8 99` · `27 2c 0a` — **27 bytes between the quotes**. I then extracted the owner's
  own word straight out of `SYSTEM-FACTS.md` **A37** and `od`-ed that: **the same 27 bytes**. The
  string in the repo is provably the owner's, not a retype that happens to look right (REQ-005 §R4).
- **6** — `npm run build` **exit 0**; the route list is still the same **9** entries and
  `/classroom/[id]` is still **ƒ Dynamic** — adding a layout did not change how the route renders.
  **7** — `npx tsc --noEmit` **exit 0**.
- **8/9/10 — re-run live on my own dev server** (`npx next dev -p 3037`, started **and stopped** by
  me; `kill-port` confirmed, follow-up curl `HTTP 000` exit 7). All **8** app routes match
  §Expected end state character for character. `/classroom/1`, `/7`, `/abc` → **HTTP 200 with the
  identical title** (Q1). The rendered classroom `<title>` in bytes shows the seam plainly — her 27
  bytes, then ` | ` (`20 7c 20`) and the em dash (`e2 80 94`) supplied by TASK-015's
  `title.template`, neither of which is typed in her file. `/` → pipe count **0**: **A31 did not
  regress**, which is the one way this design could have failed silently.
- **11** — `DTE Platform` still **14** lines across the 7 expected files: REQ-006's material is
  untouched. **12** — emoji harness **124 occurrences in 44 files scanned**: baseline held, and the
  scanned count rose 43 → 44 by exactly the one added file (exit code — see Q2, my DoD's wording,
  not her defect).
- **13** — `ls --time-style=long-iso`: the **only** file with a new mtime is
  `src/app/classroom/[id]/layout.tsx` (2026-09-09 03:55). `classroom/[id]/page.tsx` is still
  2026-09-06 20:54 — **the `withAuth` guard was not touched**, which was rule 2's whole point. The
  TASK-015 files (00:11), the TASK-016 four (00:34) and the two stray About files (2026-09-06
  20:50) are all unchanged.

**A35/A37 held structurally, not just verbally.** There is no `generateMetadata`, no `params` read,
and the title is proved identical across three ids including a non-numeric one — the per-course tab
the owner rejected is not merely absent from this file, it is impossible in its shape.

**Both her questions were sound, and Q2 exposed a defect in my DoD wording, not in her work**
(answered above). The reported defect is mine again; the harness DoD wording is fixed going forward.

**UNVERIFIED accepted, not laundered — 4 items, none blocking:** (1) **the live site** — every check
was a local dev server, and `DONE` ≠ deployed; (2) **a *person's* eyes on the tab** — DoD 14 was an
automated browser; (3) **the classroom tab while authenticated** — the guard redirected, so nobody
has watched the tab *stay* on a classroom with a session; (4) **ids beyond the three exercised.**
(1)–(3) go to the owner via Porter and join the owner-eyes Blocked row, now **8** tabs. (4) I accept
as structural rather than carry it: with no `params` in the file, id-independence is a property of
the code, not of the sample.

**No production contact by either of us** — localhost only; no deploy, no ssh, no DB, no git write
(A23).
