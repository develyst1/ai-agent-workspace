# TASK-012: Product-name rename in `back/` (7 occurrences, 6 files)
- Source: SPEC-002
- Owner: BE (Jason)
- Status: **DONE** — reviewed 2026-09-08, Sober, no rework (TODO -> IN_PROGRESS -> REVIEW 2026-09-08, Jason; evidence in §Implementation Notes, verdict in §Review)
- Depends on: none. Runs in parallel with TASK-011 (`front/`, Fern) — the two never touch the
  same file and there is no contract change between them.

## Context in one paragraph

The product's name is **Develyst The Education** (`SYSTEM-FACTS.md` A6). The superseded name
**"Disrupt Thai Education"** still ships in `back/` — including two places users and integrators
actually see: the Swagger page at `/docs` and the Thai AI system prompt. Sober enumerated every
occurrence in the repo first; the full list and the exact command are in
`specs/SPEC-002-product-name-rename.md` §The enumeration. Yours is the `back/` bucket. `front/`
is Fern's; do not open it.

## What to do

**One rule, applied seven times: Rule N — replace only the substring `Disrupt Thai Education`
with `Develyst The Education`, and leave every character around it exactly as it is.** No page
`<title>` exists in `back/`, so Rule T never applies here.

| # | File:line | Now | After |
|---|---|---|---|
| 1 | `back/db/schema.sql:2` | `--  DTE — Disrupt Thai Education` | `--  DTE — Develyst The Education` |
| 2 | `back/db/seed.sql:2` | `--  DTE — Disrupt Thai Education` | `--  DTE — Develyst The Education` |
| 3 | `back/package.json:4` | `"description": "DTE (Disrupt Thai Education) Backend API — …"` | `…(Develyst The Education)…` |
| 4 | `back/README.md:1` | `# DTE Backend — Disrupt Thai Education API` | `# DTE Backend — Develyst The Education API` |
| 5 | `back/src/index.ts:47` | `title: 'DTE API — Disrupt Thai Education',` (Swagger `info.title`) | `title: 'DTE API — Develyst The Education',` |
| 6 | `back/src/index.ts:111` | the boxed console banner line | same line, name swapped |
| 7 | `back/src/routes/ai.ts:73` | `…แพลตฟอร์ม DTE (Disrupt Thai Education)` (AI system prompt) | `…แพลตฟอร์ม DTE (Develyst The Education)` |

Read these before typing:

- **#1 and #2 are SQL comments on line 2 — banner text, not DDL.** No schema change, no migration,
  no database is touched by this task, and existing rows are unaffected (SPEC-002 §Data Model).
  **Do not run any migration and do not connect to any database** (PROTOCOL.md — the human alone
  touches real databases).
- **#6, the console banner, is inside a fixed-width box.** `Disrupt Thai Education` and
  `Develyst The Education` are **both exactly 22 characters**, so a straight substring swap keeps
  the `║` aligned. Do not add or remove a single space, and **leave the `🎓` alone** — the no-emoji
  rule is a `front/` convention from TASK-002 and does not apply to `back/`.
- **#3 changes the `description` field only.** The package `name`, version, scripts and every
  dependency stay untouched — renaming identifiers or packages is explicitly out of scope
  (REQ-004 C5). Do not let an editor reformat the file or reorder keys.
- **#7 is inside a Thai AI system prompt** sent to the `develyst-ai` gateway. Change the name and
  nothing else in that prompt — not a word of the Thai, not the template literal's shape.
- **#5 is the Swagger `info.title` served at `/docs`.** Its `—` is already an em dash; it stays.
- Do not touch `back/README.md` beyond line 1, and do not touch the repo-root `README.md` or
  `DTE.md` at all — those are not yours (SPEC-002 §The enumeration).

## Definition of Done

- [x] The seven edits above are in place and no other `back/` file is modified.
      Prove it: `git status --short back/` (reading git state is fine; **never commit**).
- [x] The old name is gone from `back/`. Exact command and its actual output pasted below:
      `grep -rIn --exclude-dir=node_modules -i "disrupt" back/` → **no output**.
- [x] The new name is present seven times:
      `grep -rIn --exclude-dir=node_modules "Develyst The Education" back/` — paste the 7 lines.
- [x] **The banner box still lines up.** Run the server (`bun run dev`) and paste the banner
      **verbatim** from your terminal, so the `║` column is visibly straight.
      **Qualified:** my line's width is *unchanged* (49 codepoints before and after, measured
      against `HEAD`) and the banner is pasted verbatim — but the box was **already** ragged
      before this task (the `Running on` line overruns, `🎓` is double-width). Not introduced
      here, not fixed here. See the ⚠️ in §Implementation Notes and §Questions Q1.
- [x] **Swagger shows the new title.** Open `/docs` in a browser and say what the page heading
      reads. If you genuinely cannot open a browser, write
      `UNVERIFIED — the rendered /docs title` and say so out loud in your handoff.
- [x] The server starts clean and at least one existing route still answers — paste the request
      you made and the status you got back. Local only; **never production, not even a GET**.
- [x] `back/package.json` is still valid JSON — paste the output of a parse check
      (e.g. `bun -e "JSON.parse(require('fs').readFileSync('back/package.json','utf8'));console.log('ok')"`).

## Implementation Notes

*(Jason, BE — 2026-09-08. Every command below was actually run; its real output is pasted.)*

**Files changed — exactly the 6 in the table, 7 substrings, nothing else.** One rule applied
mechanically: `sed -i 's/Disrupt Thai Education/Develyst The Education/g'` over those 6 paths only.
No reformatting, no key reordering, no other line touched (see the diff evidence below).

```
$ git status --short back/
 M back/README.md
 M back/db/schema.sql
 M back/db/seed.sql
 M back/package.json
 M back/src/index.ts
 M back/src/routes/ai.ts

$ git diff --stat back/
 back/README.md        | 2 +-
 back/db/schema.sql    | 2 +-
 back/db/seed.sql      | 2 +-
 back/package.json     | 2 +-
 back/src/index.ts     | 4 ++--
 back/src/routes/ai.ts | 2 +-
 6 files changed, 7 insertions(+), 7 deletions(-)
```

`git diff back/` is 7 changed lines and 7 only — one per row of the table (`index.ts` supplies
rows 5 and 6). `package.json`'s `name`, `version`, `scripts` and dependencies are untouched;
`ai.ts`'s Thai prompt is byte-identical apart from the name; the `—` em dashes were never in the
matched substring, so they are unchanged (verified as bytes, below).

**Old name gone from `back/`:**

```
$ grep -rIn --exclude-dir=node_modules -i "disrupt" back/
(no output; exit status 1)
```

**New name present 7 times:**

```
$ grep -rIn --exclude-dir=node_modules "Develyst The Education" back/
back/db/schema.sql:2:--  DTE — Develyst The Education
back/db/seed.sql:2:--  DTE — Develyst The Education
back/package.json:4:  "description": "DTE (Develyst The Education) Backend API — Bun + ElysiaJS + PostgreSQL",
back/README.md:1:# DTE Backend — Develyst The Education API
back/src/index.ts:47:        title: 'DTE API — Develyst The Education',
back/src/index.ts:111:║   🎓  DTE API  —  Develyst The Education       ║
back/src/routes/ai.ts:73:      const systemPrompt = `คุณเป็น AI ช่วยค้นหาหลักสูตรและความรู้บนแพลตฟอร์ม DTE (Develyst The Education)
```

**Em dash on the Swagger title read as bytes, not by eye** (`342 200 224` = U+2014):

```
$ sed -n '47p' back/src/index.ts | od -c | head -3
0000000                                   t   i   t   l   e   :       '
0000020   D   T   E       A   P   I     342 200 224       D   e   v   e
0000040   l   y   s   t       T   h   e       E   d   u   c   a   t   i
```

**`back/package.json` still parses:**

```
$ bun -e "JSON.parse(require('fs').readFileSync('back/package.json','utf8'));console.log('ok')"
ok
```

**The banner box — measured, then run.** Codepoint width of every box line, HEAD vs working tree
(`git show HEAD:back/src/index.ts` compared against the file, counting with `[...line].length`):

```
110 before cp=49 | after cp=49
111 before cp=49 | after cp=49      <- the renamed line
112 before cp=54 | after cp=54
113 before cp=53 | after cp=53
114 before cp=49 | after cp=49
```

The renamed line is the same width it was — 22 characters in, 22 characters out, as the TASK said.
Server run, banner pasted verbatim from the terminal:

```
$ cd back && DATABASE_URL=postgresql://dte_user:dte_password@localhost:5432/dte_db PORT=3001 bun run src/index.ts

╔═══════════════════════════════════════════════╗
║   🎓  DTE API  —  Develyst The Education       ║
║   Running on  http://localhost:3001             ║
║   Swagger:    http://localhost:3001/docs       ║
╚═══════════════════════════════════════════════╝
```

⚠️ **Observation for Sober, NOT caused by this task:** the box is already ragged at runtime —
`Running on` overruns the right `║` by ~2 columns and `🎓` is a double-width glyph, so the border
never lined up before this change either. The measurement above proves my line's width is
**unchanged**; I did not "fix" the pre-existing raggedness, because that is copy/layout outside
TASK-012's one rule. Raise it as its own item if it should be straightened.

**Swagger `/docs` — VERIFIED in a real browser**, not inferred from the source:

```
$ curl -s http://localhost:3001/docs/json | head -c 160
{"openapi":"3.0.3","info":{"title":"DTE API — Develyst The Education","description":"Backend API for DTE Platform: Auth, Courses, AI Teacher, Follow System","version":"1.0.0"}...
```

Opened `http://localhost:3001/docs` in a browser and read the live DOM:
`document.title` = `DTE API — Develyst The Education`, and the page's first heading renders
`DTE API — Develyst The Education`. **The rendered `/docs` heading is VERIFIED.**

**Server starts clean and an existing route still answers** (local only, never production):

```
$ curl -s -w "status=%{http_code}\n" http://localhost:3001/health
status=200
{"status":"ok","service":"DTE API","version":"1.0.0","timestamp":"2026-09-07T20:20:08.300Z"}
```

No error output on startup. (`GET /` is a 404 by design — the app defines no root route; `/health`
is the existing route I exercised.)

**Footprint of running it, so review can account for it:** `bun install --frozen-lockfile` was
needed (`back/node_modules` was absent). It installed 42 packages and **did not change
`bun.lock`** — `git status --short back/` after the install still lists exactly the 6 edited
files. `node_modules/` is git-ignored. No `.env` file was created: `DATABASE_URL` and `PORT` were
passed inline on the command line for the one run, so the repo has no new file. The process was
stopped after the checks.

**No database was touched.** No migration, no `db:migrate`, no `db:seed`, no SQL run anywhere.
The `DATABASE_URL` above points at a non-existent local database and `postgres.js` connects
lazily, so nothing ever dialled out; only `/health` (which runs no query) was called.
Consequently: `UNVERIFIED — any route that actually queries PostgreSQL`. That is out of TASK-012's
scope (rows 1 and 2 are line-2 SQL *comments*), but stated rather than implied.

## Questions

*(Jason asks here; Sober answers as `> answer: ...`. Do not decide a copy question yourself —
the replacement form is the owner's word and there is no second form in `back/`.)*

**Q1 (Jason, 2026-09-08) — non-blocking, raised not decided.** The console banner box in
`back/src/index.ts:110-114` does not line up at runtime, and did not before TASK-012 either:
`║   Running on  http://localhost:3001             ║` overruns the right border, and `🎓` renders
double-width so the renamed line sits one column wide too. TASK-012's rule is a substring swap and
nothing else, so **I changed nothing about it** and my line is byte-for-byte the same width it was.
Is straightening that box in scope for anyone, and if so as what? I did not touch it and will not
without a TASK.

> **answer (Sober, 2026-09-08): not in scope for SPEC-002, no TASK now, and you were right on all
> three counts — right that it is pre-existing, right not to fix it, right to raise it instead of
> staying silent.** Taking the parts separately:
>
> - **It is not a defect of yours and it is not a regression.** Your codepoint measurement settles
>   that: line 111 is 49 codepoints before and after, identical to the border lines 110 and 114. I
>   re-measured on the tree and got the same 49 / 49 / 54 / 53 / 49. The rename is width-neutral, as
>   the TASK predicted (both names are 22 characters).
> - **The raggedness is real but it is not a copy question, so it never goes to the owner.** The two
>   long lines interpolate `${PORT}` — their rendered width depends on the port at runtime, so the
>   box can only ever line up for one port length — and `🎓` is an East-Asian-wide glyph that most
>   terminals render two columns wide while `[...line].length` counts it as one. A box that is
>   correct in the source is therefore still ragged on screen. That is a developer-facing console
>   cosmetic in `back/`, seen by nobody but us; no business content is involved and there is
>   nothing here for Porter to carry.
> - **My call: no TASK, and not because it is unfixable — because it is not worth an engineer's
>   session against REQ-004's live queue.** If it is ever done it is a BE TASK of its own, and
>   whoever writes it must decide the intended rendered width **with** the double-width glyph and
>   with a variable-length port, rather than padding until it looks right on one machine. Recorded
>   here so the next person finds the analysis instead of re-deriving it.
>
> **Nothing about TASK-012 waits on this**, and you correctly did not touch it.

## Review

**Verdict: DONE — no rework.** Reviewed by Sober, 2026-09-08, against SPEC-002 Rule N and REQ-004
§Acceptance Criteria. As with TASK-011 I re-ran the decisive checks on the working tree rather than
trusting the notes; what I reproduced and what I accepted are separated below.

**Re-verified by me, on the tree — all 7 substitutions, one at a time:**
- `back/db/schema.sql:2` and `back/db/seed.sql:2` → `--  DTE — Develyst The Education`, still
  **line-2 SQL comments**, with the file's leading `-- ===` banner and the following lines intact.
- `back/package.json:4` → `description` only; `name` (`dte-backend`), `version`, `scripts` and the
  dependency blocks are unchanged, key order untouched, and **`JSON.parse` on the file returns ok**
  (re-run by me).
- `back/README.md:1` → `# DTE Backend — Develyst The Education API`, line 3's stack line untouched.
- `back/src/index.ts:47` → the Swagger `info.title`; the sibling `version` and `description` fields
  are byte-identical, so the rename did not leak into the rest of the `documentation` block.
- `back/src/index.ts:111` → the banner line, name swapped, **`🎓` correctly left alone** (the
  no-emoji harness is a `front/` convention from TASK-002 and does not reach `back/` — Jason read
  that right).
- `back/src/routes/ai.ts:73` → the Thai AI system prompt. I read the whole template literal
  (lines 73–79): the name inside the parentheses changed and **not one word of Thai around it**;
  the numbered instructions, the platform list and the closing line are unchanged.
- **Rule N held everywhere: only the 22-character name substring moved.** The surrounding em dashes
  were never inside the match, and `od -c` on line 47 confirms `342 200 224` (U+2014) still in
  place. No hyphen was "tidied" into an em dash anywhere — Rule T does not apply in `back/` and was
  correctly never applied.
- **Blast radius / AC 2.** The full-repo enumeration
  (`grep -rIn --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next -i "disrupt" .`)
  returns **zero hits anywhere in `back/`**, and the new-name search returns exactly the 7 expected
  `back/` lines and no eighth.
- **Banner width re-measured by me** (codepoints per line, 110–114): `49 / 49 / 54 / 53 / 49` —
  the renamed line matches the border lines exactly. Width-neutral, as claimed.

**Accepted on Jason's evidence, not re-run by me:** the local server run and its verbatim banner,
`GET /health` = **200**, the `/docs/json` payload, and the browser read of `/docs` where both
`document.title` and the rendered heading gave `DTE API — Develyst The Education`. That last one is
the externally-visible string in this bucket and it was confirmed **in a browser**, which is what
REQ-004 AC 3 asks for — not inferred from source.

**What I specifically checked for and did not find:** any database contact. There was none — no
migration, no `db:migrate`, no `db:seed`, no SQL. Correct, and required: rows 1 and 2 are line-2
comments, SPEC-002 §Data Model says no database is touched, and PROTOCOL reserves every real
database to the human. Jason's `UNVERIFIED — any route that actually queries PostgreSQL` is
**accepted as carried, not as a gap**: this TASK changes no query, no column and no response field,
so there is no query behaviour for it to have broken. It does not travel to the owner.

**Footprint accounted for and clean:** `bun install --frozen-lockfile` was needed because
`back/node_modules` was absent; it left `bun.lock` unchanged and `node_modules/` is ignored. No
`.env` file was created — `DATABASE_URL`/`PORT` were passed inline for one run and the process was
stopped. Nothing was left behind in the repo.

**Acceptance criteria touched:** REQ-004 AC 1 (`back/` enumerated before editing) ✅ · AC 2 for the
`back/` bucket — zero occurrences ✅ · AC 3 (the externally-visible `/docs` title confirmed in a
browser) ✅ · AC 4 / C5 (no identifier, package name, schema, column or row change) ✅.

**Q1 answered above** — the ragged console banner is pre-existing, developer-facing, not copy, and
gets no TASK now; the analysis is recorded there so nobody re-derives it.

Status `REVIEW` → **DONE**.
