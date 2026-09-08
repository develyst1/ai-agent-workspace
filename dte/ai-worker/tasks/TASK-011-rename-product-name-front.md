# TASK-011: Product-name rename in `front/` (3 occurrences, 2 files)
- Source: SPEC-002
- Owner: FE (Fern)
- Status: **DONE** — reviewed 2026-09-08, Sober (TODO -> REVIEW 2026-09-08, Fern; no rework)
- Depends on: none. (Independent of TASK-003 and of every SPEC-001 screen task — it touches only
  `metadata`, no component, no layout, no theme.)

## Context in one paragraph

The product's name is **Develyst The Education** (`SYSTEM-FACTS.md` A6). The superseded name
**"Disrupt Thai Education"** still ships in `front/`'s page metadata, so real users see it in the
browser tab today. Sober enumerated every occurrence in the repo first — the full list and the
exact command are in `specs/SPEC-002-product-name-rename.md` §The enumeration. Yours is the
`front/` bucket, three lines in two files. `back/` is Jason's (TASK-012); do not open it.

## What to do

Exactly three line edits. Nothing else in `front/` changes.

**1. `front/src/app/layout.tsx:22` — Rule T (page `<title>`).** Replace the whole title value:

```
- title: "DTE - Disrupt Thai Education | เรียนอะไรก็ได้ตามใจชอบ",
+ title: "DTE — Develyst The Education",
```

**2. `front/src/app/page.tsx:18` — Rule T (page `<title>`).** Replace the whole title value:

```
- title: 'DTE - Disrupt Thai Education | เรียนรู้อย่างอิสระด้วย AI',
+ title: 'DTE — Develyst The Education',
```

**3. `front/src/app/layout.tsx:26` — Rule N (not a title: substring only).**

```
- creator: "DTE - Disrupt Thai Education",
+ creator: "DTE - Develyst The Education",
```

Read these three carefully before typing:

- The title string is **`DTE — Develyst The Education`**, character for character (owner's own
  words, `SYSTEM-FACTS.md` A19). The separator is an **em dash `—` (U+2014)** with a space each
  side — **not** the hyphen `-` that is there today. Copy-paste it; do not retype it.
- **The Thai taglines are deleted on purpose** in edits 1 and 2. REQ-004 §Requirement 2: "No
  tagline, no suffix, no site-name separator, no per-page template." This is the requirement's
  instruction, not your call and not mine. **CONFIRMED by the owner 2026-09-08 — "ตัดได้", he
  approves cutting both Thai taglines (`SYSTEM-FACTS.md` A25).** Rule T is unchanged, this TASK is
  unchanged, and the follow-up it once warned about will not come. Nothing here waits on anyone.
- Edit 3 is **Rule N**: change only the name substring. Its `-` stays a hyphen. Do not "tidy" it
  into an em dash.
- Leave `description`, `keywords`, `authors`, `publisher` and every other metadata field exactly
  as they are — they contain no occurrence of the old name.
- Do not touch `favicon.ico`, any SVG, any component, or `README.md` anywhere. No logo work, no
  visual change (REQ-004 C5).

## Definition of Done

- [ ] The three edits above are in place, and no other `front/` file is modified.
      Prove it: `git status --short front/` (reading git state is fine; **never commit**).
- [ ] The old name is gone from `front/`. Exact command and its actual output pasted below:
      `grep -rIn --exclude-dir=node_modules --exclude-dir=.next -i "disrupt" front/` → **no output**.
- [ ] The new title is exactly right, verified as bytes not by eye — paste the output of:
      `grep -n "Develyst The Education" front/src/app/layout.tsx front/src/app/page.tsx`
      and confirm the two `title:` lines contain the em dash (e.g. `grep -c "DTE — Develyst" …`).
- [ ] `npm run build` in `front/` is green — paste the tail of the real output.
- [ ] `npx tsc --noEmit` exits 0 — paste the exit code.
- [ ] The no-emoji harness still passes at its TASK-002 baseline — run it and paste the count.
- [ ] **In a real browser** (`npm run dev`), the tab on `/` reads exactly
      `DTE — Develyst The Education`. Say what you actually saw. REQ-004 AC 3 requires a browser,
      not a source read; if you genuinely cannot open one, write
      `UNVERIFIED — the rendered browser tab on /` and say so out loud in your handoff.
- [ ] One more route renders unchanged (any route that loads without auth) — a live site, no QA
      role, so state what you looked at.

## Implementation Notes

Done by Fern, 2026-09-08. Exactly the three specified line edits; nothing else in `front/` touched.
Every command below was actually run in `H:\dte\dte` (repo root) or `front/`; output is verbatim.

**DoD 1 — only the two files changed.** `git status --short front/` (read-only; nothing committed):

```
 M front/src/app/layout.tsx
 M front/src/app/page.tsx
```

Baseline before the edits was empty output, so these two modifications are entirely mine.

**DoD 2 — the old name is gone from `front/`.**

```
$ grep -rIn --exclude-dir=node_modules --exclude-dir=.next -i "disrupt" front/
(no output; exit status 1 = no match)
```

**DoD 3 — the new strings, verified as bytes, not by eye.**

```
$ grep -n "Develyst The Education" front/src/app/layout.tsx front/src/app/page.tsx
front/src/app/layout.tsx:22:  title: "DTE — Develyst The Education",
front/src/app/layout.tsx:26:  creator: "DTE - Develyst The Education",
front/src/app/page.tsx:18:  title: 'DTE — Develyst The Education',

$ grep -c "DTE — Develyst The Education" front/src/app/layout.tsx front/src/app/page.tsx
front/src/app/layout.tsx:1
front/src/app/page.tsx:1
```

`grep -c` alone only proves *a* dash matched, so each line was also dumped byte for byte with
`sed -n '<N>p' <file> | od -c`:

- `layout.tsx:22` → `t i t l e :   " D T E   342 200 224   D e v e l y s t …` — `342 200 224`
  is octal for `E2 80 94` = **U+2014 EM DASH**. Rule T satisfied.
- `page.tsx:18` → same three bytes `342 200 224` in the same position. Rule T satisfied.
- `layout.tsx:26` → `c r e a t o r :   " D T E   -   D e v e l y s t …` — a plain ASCII
  `-` (0x2D), **not** an em dash. Rule N satisfied; the hyphen was deliberately left alone.

Both Thai taglines are deleted, per Rule T / REQ-004 §Requirement 2 / owner's "ตัดได้" (A25).
`description`, `keywords`, `authors`, `publisher` and every other metadata field are byte-identical
to before. No component, layout, theme, icon, SVG or README was opened.

**DoD 4 — `npm run build` is green.** Tail of the real output (`front/`, Next 16.2.9 + Turbopack),
exit code **0**:

```
✓ Generating static pages using 11 workers (14/14) in 548ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /about
├ ○ /blog
├ ƒ /classroom/[id]
├ ○ /contact
├ ○ /courses
├ ○ /login
├ ○ /portfolio
├ ○ /register
├ ○ /services
├ ○ /teach
└ ○ /verify-email
BUILD_EXIT=0
```

All 13 routes still build; the route table is unchanged from TASK-003's.

**DoD 5 — `npx tsc --noEmit`.** No diagnostics printed; `TSC_EXIT=0`.

**DoD 6 — the no-emoji harness is still at its TASK-002 baseline.**

```
$ node ai-worker/tests/harness/check-no-emoji.mjs front/src
…
124 occurrence(s) in 45 file(s) scanned.
HARNESS_EXIT=1
```

**124 occurrences — identical to the TASK-002 baseline of 124** (TASK-002 §Review). The *scanned*
file count moved 39 → 45 because TASK-003 added `ui/` wrappers, not because of this TASK; the
offending-occurrence number, which is the baseline, is unchanged. Filtering the hit list for my two
files shows the harness flags only pre-existing emoji (`page.tsx:76-79`, `:152`) and **neither of
the two new em dashes** — U+2014 is not in the harness's ruleset, so Rule T does not regress it.

**DoD 7 — the browser tab on `/`. VERIFIED in a real browser.** One caveat about *how*, stated
plainly rather than glossed: `npm run dev` would not come up. Port 3000 was already held by a
leftover `next dev` for this same directory (PID 8400, not started by me this session), and Next 16
refuses a second dev server in the same dir ("Another next dev server is already running"), so the
instance I started on 3001 exited. Rather than kill a process I did not start, I served the build
I had just made — `npx next start -p 3005` — and drove a real browser at it. This exercises the
same `metadata` export through the same renderer, on the built output rather than the dev one.

Read out of the live DOM at `http://localhost:3005/`:

```
document.title = "DTE — Develyst The Education"
codepoints    = 44 54 45 20 2014 20 44 65 76 65 6c 79 73 74 20 54 68 65 20 45 64 75 63 61 74 69 6f 6e
```

`2014` is the em dash, in the rendered tab, confirmed as a codepoint and not by squinting at a
glyph. The browser tab label itself read **`DTE — Develyst The Education`**. That is the whole
title — no Thai tagline, no `|` suffix.

*(Honest scope of this evidence: it is `next start` on the production build, not `next dev`. If
Sober wants the dev-server variant specifically, it needs the stale PID 8400 stopped first, which
is the human's process to stop, not mine.)*

**DoD 8 — one more unauthenticated route renders unchanged.** `/courses` (public; renders
`src/lib/mockData.ts`, no auth, no API). Loaded in the same browser:

- Its `<title>` is `ทักษะทั้งหมด | DTE Platform` — **its own** metadata, untouched by this TASK and
  correctly containing no occurrence of the old name.
- `<h1>` reads `สำรวจทักษะและความรู้`; the page body renders 6204 characters of text, the navbar,
  hero, the category filter row (Web Development / Programming / Artificial Intelligence / Design /
  Business / Language / Finance & Investment) and the "ทักษะทั้งหมด (30 ทักษะ)" list heading. A
  screenshot of the loaded page shows the styled dark-theme layout intact.
- Nothing about it changed: this TASK touched no shared component and no global metadata field that
  `/courses` consumes (it overrides `title` itself).

**Not run, and deliberately so:** no bundle measurement, no antd change (Sober's inbox message of
2026-09-08 said explicitly not to), no `back/`, no `README.md`, no git write of any kind.

## Questions

**Q1 (Fern → Sober, non-blocking; TASK-011 is complete either way — do NOT hold review for it).**
While doing DoD 8 I noticed that other routes carry their own page titles in a *different* shape
from the one Rule T just imposed — `/courses` renders `ทักษะทั้งหมด | DTE Platform`. It contains no
occurrence of the old name, so it is correctly outside SPEC-002's enumeration and I did not touch
it. But REQ-004 §Requirement 2's wording ("No tagline, no suffix, no site-name separator, no
per-page template") reads like a statement about the product's title *form*, and if that is how the
owner meant it, then `| DTE Platform` on the per-route titles is inconsistent with the form we just
shipped on `/`. I am not guessing which reading is right and I have changed nothing: **is the
`| DTE Platform` suffix on the other routes in scope for a later TASK, or is Requirement 2 only
about the two lines that held the old name?** This is a copy/scope decision, so it is yours (and
possibly Porter's), not mine.

> **answer (Sober, 2026-09-08): OUT OF SCOPE for SPEC-002 — and you were right to raise it
> rather than "tidy" it. Requirement 2's wording is doing two different jobs and they must not be
> conflated:**
>
> 1. **What REQ-004 commissions is a RENAME.** Its reach is fixed by the owner's own words — A20 /
>    A21, *"ทุกที่"* = replace the superseded name **wherever it appears**. The `| DTE Platform`
>    suffix on `/courses` and friends **contains no occurrence of the old name**, so nothing the
>    owner has said reaches it. It is correctly outside the enumeration and correctly untouched.
> 2. **Requirement 2's "no tagline, no suffix, no site-name separator, no per-page template" binds
>    the STRING THAT REPLACES the old name** — it is the operative reading of A19 (use his string
>    character for character; do not decorate it). Read instead as a site-wide statement about every
>    page title's form, it would commission a second, larger change to titles that were never part
>    of this REQ, and **I will not read it that way by assumption.**
>
> So: **no edit, no follow-up TASK out of TASK-011, and nothing here is a defect.** Whether the
> whole site's page titles should be unified to one form is a genuine new copy decision, and it is
> the owner's — not mine and not yours. I have put it to Porter as **SPEC-002 §Questions Q5**. If it
> comes back "unify", it arrives as its own TASK with its own enumeration first, never as a
> widening of this one. **TASK-011 is complete as delivered.**

*(Fern asks here; Sober answers as `> answer: ...`. Do not decide a copy question yourself —
the two replacement forms are the owner's words and there is no third form.)*

## Review

**Verdict: DONE — no rework.** Reviewed by Sober, 2026-09-08, against SPEC-002 Rules T and N and
REQ-004 §Acceptance Criteria. I re-ran the decisive checks myself on the working tree instead of
reading the notes; below separates what I reproduced from what I accepted on Fern's evidence.

**Re-verified by me, on the tree:**
- **The three edits are exactly the specified ones.** `layout.tsx:22` = `title: "DTE — Develyst The
  Education",` · `page.tsx:18` = `title: 'DTE — Develyst The Education',` · `layout.tsx:26` =
  `creator: "DTE - Develyst The Education",`.
- **Rule T's em dash read as bytes, not by eye.** `od -c` on both title lines shows `342 200 224`
  (= `E2 80 94`, **U+2014**) in the separator position; `layout.tsx:26` shows a plain `-` (0x2D),
  so **Rule N's hyphen was correctly left alone.** This was the easiest thing on the TASK to get
  wrong and it is right in all three places.
- **Rule T replaced the WHOLE title value.** Both Thai taglines are gone and no `| …` suffix
  survives — that is REQ-004 §Requirement 2, and the owner has explicitly approved the deletion
  (**"ตัดได้"**, `SYSTEM-FACTS.md` **A25**). Not a defect and not a copy loss to report upward.
- **Blast radius.** `description`, `keywords`, `authors`, `publisher` and the `formatDetection`
  block read as before; no component, theme, icon or SVG is involved. The full-repo enumeration
  (`grep -rIn --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next -i "disrupt" .`)
  returns **zero hits anywhere in `front/`**.
- **`npx tsc --noEmit` in `front/` → exit 0**, re-run by me.
- **No-emoji harness re-run by me → `124 occurrence(s) in 45 file(s) scanned`** — the TASK-002
  baseline of **124 reproduced exactly**, and U+2014 is not in the harness ruleset, so Rule T
  regresses nothing. Fern's reading of the 39 → 45 *scanned*-file move (TASK-003's `ui/` wrappers,
  not this TASK) is correct.

**Accepted on Fern's evidence, not re-run by me:** `npm run build` green with the same 13-route
table, and the browser check itself. Both were pasted with real output.

**On the browser caveat — accepted, and the reasoning belongs on the record.** REQ-004 AC 3 demands
the tab be seen in a browser rather than read from source, and it was: `document.title` read out of
the live DOM as `DTE — Develyst The Education`, separator confirmed as codepoint `2014`. It was
served with `next start` on the production build rather than `next dev`, because a leftover
`next dev` that Fern did not start held port 3000. **That is stronger evidence, not weaker** — it
exercises the built output through the same `metadata` export. Declining to kill a process he did
not start was the right call, and writing the caveat out plainly instead of quietly claiming
"verified in a browser" is exactly the honesty this project has no QA role to supply.
**Nothing on this TASK is owed to the owner's eyes.**

**One documentation nit, explicitly NOT rework:** DoD 6 pastes the harness command as
`node ai-worker/tests/harness/check-no-emoji.mjs front/src` run from the code repo — the harness
lives in the coordination repo, not in `dte`, so that literal line does not run as written. The
*result* is sound: I ran the harness from its real location against `front/src` and got the same
`124 / 45`. Nothing to change in the code; recorded so the next reader does not chase a broken
command.

**Acceptance criteria touched:** REQ-004 AC 1 (`front/` enumerated before editing) ✅ · AC 2 for the
`front/` bucket — zero occurrences ✅ · AC 3 (rendered tab confirmed in a browser) ✅ · AC 5 / C5 (no
identifier, package, icon or visual change) ✅.

**Q1 answered above** — the `| DTE Platform` suffix is out of scope for SPEC-002 and becomes an
owner question (SPEC-002 §Questions **Q5** → Porter), never a widening of this TASK.

Status `REVIEW` → **DONE**.
