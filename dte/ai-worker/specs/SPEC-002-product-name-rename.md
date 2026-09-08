# SPEC-002: Product-name rename — "Disrupt Thai Education" → "Develyst The Education"
- Source: REQ-004
- Status: **DONE** — closed 2026-09-08, Sober. **All three TASKs (011, 012, 013) are DONE, reviewed,
  no rework.** All five questions are answered and closed: Q1–Q3 by the owner (A24–A26),
  **Q4** by Porter (routing), **Q5** by the owner (A27 — *"ให้เหมือนกันทั้งเว็บ"*), which became
  **REQ-005** and changed **nothing** in this SPEC. REQ-004 is `SPEC_DONE`; the acceptance check is
  Porter's. *(History: written 2026-09-08 · A24–A26 folded in · TASK-011/012 reviewed · TASK-013
  assigned and reviewed — all 2026-09-08.)*

## Overview

A pure copy change across the single `dte` repo. The superseded product name **"Disrupt Thai
Education"** is replaced by the settled name (`SYSTEM-FACTS.md` A6) in **two, and only two,
forms** (REQ-004 §Requirement 2):

- **Rule T — page `<title>` only.** The value becomes the exact string
  `DTE — Develyst The Education`, character for character: `DTE`, space, **em dash `—`**
  (U+2014, not a hyphen), space, `Develyst The Education`. The whole title value is replaced —
  no tagline, no ` | …` suffix, no per-page variant (A19 + REQ-004 §Requirement 2).
- **Rule N — everywhere else.** Replace **only the substring** `Disrupt Thai Education` with
  `Develyst The Education`; every character around it stays exactly as it is (A22).

**Rule S — the one sentence the owner ruled on separately** (added 2026-09-08 from `SYSTEM-FACTS.md`
**A24**, answering Q1 below). `README.md:3` does not contain the old name as a name — it reads
"Disrupt**ing** Thai Education", a verb phrase inside a tagline sentence — so the owner was asked
and answered **"เปลี่ยนทั้งประโยค"**: the **whole tagline sentence on that line** (the English verb
phrase *and* the Thai descriptor after the dash) is replaced by the bare settled name
**`Develyst The Education`**. This is **not a third naming form** — the resulting string is exactly
the A22 form of Rule N; what differs is only how much of the line it replaces. No new tagline is
invented to take the deleted descriptor's place. Rule S applies to `README.md:3` and to nothing
else in this repo.

No identifier, package name, folder, env var, DB value, domain, logo or icon changes (REQ-004 C5).
`front/src/app/favicon.ico` is an image, not copy — out of scope by C5.

Why a SPEC of its own rather than an addition to SPEC-001 (**answers REQ-004 §Questions Q1**):
the rename now spans `back/` as well as `front/`, and SPEC-001 §Non-functional says "No backend
change. `back/` is untouched by every TASK in this SPEC." Folding a BE task into SPEC-001 would
break that. SPEC-001's `TASK-0NN (page-<title> rename)` placeholder is hereby **superseded by this
SPEC** — the `front/` half is TASK-011 below.

**Task numbering:** SPEC-001 §Tasks reserves **TASK-004…010** for its per-screen units. This SPEC
therefore starts at **TASK-011** so no number is ever reused (PROTOCOL.md §Artifact numbering).

## The enumeration (REQ-004 §Requirement 3 — done before anything is edited)

Repeatable command, run by Sober on 2026-09-08 against the `dte` repo working tree:

```
grep -rIn --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next -i "disrupt" .
```

Actual output — **14 lines, 9 files** (verbatim, paths relative to the repo root):

```
./back/db/schema.sql:2:--  DTE — Disrupt Thai Education
./back/db/seed.sql:2:--  DTE — Disrupt Thai Education
./back/package.json:4:  "description": "DTE (Disrupt Thai Education) Backend API — Bun + ElysiaJS + PostgreSQL",
./back/README.md:1:# DTE Backend — Disrupt Thai Education API
./back/src/index.ts:47:        title: 'DTE API — Disrupt Thai Education',
./back/src/index.ts:111:║   🎓  DTE API  —  Disrupt Thai Education       ║
./back/src/routes/ai.ts:73:      const systemPrompt = `คุณเป็น AI ช่วยค้นหาหลักสูตรและความรู้บนแพลตฟอร์ม DTE (Disrupt Thai Education)
./DTE.md:1:# DTE - Disrupt Thai Education
./DTE.md:936:> "ถึงเวลาแล้วที่จะ **Disrupt Thai Education** 🚀"
./DTE.md:938:**#DisruptThaiEducation #DevelystTheEducation #AI #Edtech #Thailand #NextJS #NestJS #BuildInPublic**
./front/src/app/layout.tsx:22:  title: "DTE - Disrupt Thai Education | เรียนอะไรก็ได้ตามใจชอบ",
./front/src/app/layout.tsx:26:  creator: "DTE - Disrupt Thai Education",
./front/src/app/page.tsx:18:  title: 'DTE - Disrupt Thai Education | เรียนรู้อย่างอิสระด้วย AI',
./README.md:3:> **Disrupting Thai Education** - Platform การเรียนรู้ออนไลน์สำหรับประเทศไทย
```

Split as REQ-004's first acceptance criterion requires:

| Bucket | Occurrences | Who changes them |
|---|---|---|
| **`front/`** | `src/app/layout.tsx:22` (Rule T), `:26` (Rule N), `src/app/page.tsx:18` (Rule T) | **TASK-011 — Fern (FE)** |
| **`back/`** | `db/schema.sql:2`, `db/seed.sql:2`, `package.json:4`, `README.md:1`, `src/index.ts:47`, `src/index.ts:111`, `src/routes/ai.ts:73` | **TASK-012 — Jason (BE)** |
| **repo docs** | `README.md:3` — not the exact old name ("Disrupt**ing** Thai Education", a verb phrase inside a Thai sentence) → **Rule S**, answered by the owner 2026-09-08 (A24) | **TASK-013** — written, but its **assignee is not yet settled**: `README.md` sits at the repo root, which PROTOCOL gives to neither engineer. See **Q4** below |
| **owner-only** | `DTE.md:1`, `:936`, `:938` (his own document, REQ-004 C3) · the production site, the production DB, and any deploy/DNS/social/marketing surface outside this repo (C2) | **the owner himself** |

**Answers REQ-004 §Questions Q2: yes, `back/` does contain the old name — 7 occurrences in 6
files.** This is not a `front/`-plus-docs job; there is a real BE TASK.

**No deploy config exists in the repo** to rename: the only infra-ish files are
`.env.example` · `back/.env.example` · `front/.env.example` · `front/Dockerfile`, and the
command above returns **zero** hits in all four. `front/public/` holds only the five stock
Next.js SVGs. Anything the owner has *outside* the repo (server config, nginx, PM2, OG images,
social profiles) is unknowable from here and belongs to the owner-only bucket by C2.

## Data Model

**None.** No table, column, enum or row changes. `back/db/schema.sql:2` and `db/seed.sql:2` are
**SQL comments on line 2 of each file** — banner text, not DDL. Nothing is applied to any
database by this SPEC, and no migration is needed: the change is invisible to an already-migrated
database, and a future `db:migrate` run replays a comment. **Existing rows: untouched.**

## API / Interface Design

**No contract change.** Nothing crosses the BE↔FE seam here: no path, method, field, casing or
status code moves. The two TASKs are independent and may run in either order or in parallel.

Two `back/` strings are nevertheless **externally visible** and belong to Jason alone:
- `src/index.ts:47` — the **Swagger `info.title`** served at `/docs`. Rule N → `DTE API — Develyst
  The Education`. (The `—` there is already an em dash in the source; it stays.)
- `src/routes/ai.ts:73` — inside the **Thai AI system prompt** sent to the `develyst-ai` gateway.
  Rule N → `แพลตฟอร์ม DTE (Develyst The Education)`. It is product copy the AI repeats to users, so
  it is in scope; nothing else in that prompt is touched.

## Flow

1. Both TASKs replace their own occurrences using Rules T and N. **No file outside the bucket
   assigned to that engineer is opened** (REQ-004 C1 / PROTOCOL.md ownership).
2. Each engineer re-runs the enumeration command scoped to their own directory and records the
   **actual output**, which must be empty for their bucket.
3. Sober re-runs the full-repo command at review. **Scoring rule (REQ-004 §Questions, 2026-09-08):
   AC 2's "zero occurrences" is scored over the team-owned surface — `front/` + `back/` +
   `README.md`.** The three `DTE.md` lines are owner-only (C3/A26) and **still carrying the old
   name there is EXPECTED, not a defect**; nobody reports it as a failure and nobody chases him.
   **Scored at the closing review, 2026-09-08 (Sober): the team-owned surface returns ZERO hits** —
   `front/`, `back/` and `README.md` are all clean, TASK-013 having run. **AC 2 is MET.** The three
   `DTE.md` lines still carry the old name and that is EXPECTED (A26). *(Superseded wording: while
   Q4 was open, `README.md:3` was to be reported as "PENDING Q4"; Q4 is answered and TASK-013 is
   DONE, so nothing is pending.)*
4. The owner-only list is already handed over and accepted — **REQ-004 §AC 6 is MET** (A26).
   Nothing further is owed to the owner on this REQ.

### Edge cases already resolved, so nobody has to think at the keyboard

- **`back/src/index.ts:111` — the boxed console banner.** `Disrupt Thai Education` and
  `Develyst The Education` are **both exactly 22 characters**, so a straight substring swap keeps
  the box aligned. Do not add or remove a space. The `🎓` on that line is **not** touched (it is
  `back/`; the no-emoji harness is a `front/` rule from TASK-002).
- **`front/src/app/layout.tsx:22` and `page.tsx:18` are both Rule T** — the entire `title` value
  becomes `DTE — Develyst The Education`. That **deletes the two Thai taglines**
  (`| เรียนอะไรก็ได้ตามใจชอบ` and `| เรียนรู้อย่างอิสระด้วย AI`) from the browser tab, because
  REQ-004 §Requirement 2 states "No tagline, no suffix, no site-name separator, no per-page
  template". This is the REQ's instruction, not the engineer's choice — see Q2 below, which asks
  the owner to confirm the deletion. `front/` keeps only these two titles; nothing else in
  `layout.tsx`'s metadata (`description`, `keywords`, `authors`, `publisher`) contains the old name.
- **`front/src/app/layout.tsx:26`, the `creator` field**, is metadata, not a `<title>`: **Rule N**,
  so it becomes `DTE - Develyst The Education` (its hyphen stays a hyphen — Rule N changes only the
  name substring).
- **`README.md:3` — the exact resulting literal, decided 2026-09-08.** The line today is, byte for
  byte:

  ```
  > **Disrupting Thai Education** - Platform การเรียนรู้ออนไลน์สำหรับประเทศไทย
  ```

  Rule S replaces the **copy**. A24 is explicit that the owner ruled on the copy and **not** on the
  line's Markdown decoration (the `> ` blockquote marker, the `**…**` bold), that decoration is not
  copy (REQ-004 C5), and that **nobody may redesign it**. Preserving the decoration exactly and
  swapping only the copy therefore leaves exactly one literal:

  ```
  > **Develyst The Education**
  ```

  Reasoning, written down so it can be checked rather than trusted: the blockquote marker and the
  bold wrapper both survive because removing either would be *changing* decoration, which A24
  forbids; the trailing ` - Platform การเรียนรู้ออนไลน์สำหรับประเทศไทย` is **copy**, not decoration, and
  goes because "เปลี่ยนทั้งประโยค" is the whole sentence. Nothing else in `README.md` is touched —
  its stale content stays stale (REQ-004 **C4**), including the `🚀` on line 1 and every URL below.
  **If Porter reads A24 differently, this is a one-line change to TASK-013 and to this bullet** —
  it is flagged in Q4 rather than left silent.

## Non-functional

- **Live site, no QA role.** Neither TASK deploys anything. Evidence is the engineer's own local
  run output; the `<title>` must be confirmed **in a browser tab**, not by reading source
  (REQ-004 AC 3). Anything not actually run is written `UNVERIFIED — <what would settle it>`.
- **No behaviour change** is expected anywhere. If a build, a test or a route breaks, the change
  was not copy-only — stop and ask in §Questions.

## Tasks

- **TASK-011**: Rename in `front/` (3 occurrences, 2 files) — owner: **FE (Fern)** — depends on: none.
  **DONE — reviewed 2026-09-08 by Sober, no rework.** Rules T and N both satisfied, em dash verified
  as bytes, rendered tab confirmed in a browser. See `tasks/TASK-011-…md` §Review.
- **TASK-012**: Rename in `back/` (7 occurrences, 6 files) — owner: **BE (Jason)** — depends on: none.
  **DONE — reviewed 2026-09-08 by Sober, no rework.** All 7 Rule-N substitutions verified on the
  tree, `/docs` title confirmed in a browser, no database touched. See `tasks/TASK-012-…md` §Review.
- **TASK-013**: Rule S on `README.md:3` (1 occurrence, 1 file) — owner: **BE (Jason)**, a one-off per
  Q4 — depends on: none. **DONE — reviewed 2026-09-08 by Sober, no rework.** The literal
  `> **Develyst The Education**` verified as bytes, blockquote + bold preserved, no em dash, one line
  changed and no other file touched. See `tasks/TASK-013-…md` §Review.

**All three TASKs are DONE. SPEC-002 is closed** — the full-repo enumeration re-run at review returns
**zero** old-name hits in `front/`, `back/` and `README.md`; the only remaining hits are the three
owner-only `DTE.md` lines, which are EXPECTED (A26).
- *(`DTE.md`: no TASK, ever — owner-only, A26.)*

## Questions

**Q1, Q2 and Q3 are all ANSWERED by the owner (2026-09-08).** Verbatim Thai and the full reading:
`SYSTEM-FACTS.md` **A24–A26**. Short form, then the original questions kept below for the record:

- **Q1 → ANSWERED "เปลี่ยนทั้งประโยค"** = option **(a)**. `README.md:3`'s whole tagline sentence
  becomes the bare `Develyst The Education` → now **Rule S** in §Overview, with the exact literal
  `> **Develyst The Education**` fixed in §Edge cases, executed by **TASK-013**.
- **Q2 → ANSWERED "ตัดได้"** = cutting the two Thai page-title taglines is approved. **Rule T is
  unchanged and TASK-011 needs no edit**; Fern has been told so — the "one-line follow-up" that
  TASK-011 warned about will not come.
- **Q3 → ANSWERED "เดี๋ยวจัดการเอง"** = the owner does the owner-only occurrences himself
  (`DTE.md` ×3 + everything outside the repo). **REQ-004 §AC 6 is MET.** No agent edits them, nobody
  chases him, and `DTE.md` keeping the old name is expected — see §Flow step 3.

- **Q4 → ANSWERED by Porter 2026-09-08 — `TASK-013` goes to **Jason (BE)**, a one-off for that one
  line.** `PROTOCOL.md` is **not** amended, Jason's ownership is **not** extended, and **no
  repo-root precedent** is created; the next root-level file is a fresh routing question. The exact
  literal `> **Develyst The Education**` is **confirmed** — Porter does not contradict my reading of
  A24, so TASK-013 needed no edit to its instruction. Full reasoning:
  `requirements/REQ-004-product-name-rename-everywhere.md` §"Porter → Sober: SPEC-002 §Questions Q4
  ANSWERED". **Acted on 2026-09-08, Sober:** TASK-013 assigned to Jason and moved `BLOCKED` → `TODO`;
  the routing and its limits are copied into that TASK's new §"Scope of this assignment" so the
  engineer reads them before touching the file. The owner was told in Thai and can overturn it in one
  word. *The question as originally asked is kept below.*

- **Q4 (as asked, for the record) → Porter (NEW, 2026-09-08 — the one thing A24 did not settle).
  Who edits the repo-root `README.md`?** The rename of `README.md:3` is squarely team-owned — REQ-004 §Questions scores
  AC 2 over `front/` + `back/` + **`README.md`**, and A26's owner-only list is `DTE.md` plus
  everything *outside* the repo, so this line is not his. But `PROTOCOL.md` §"Repo layout &
  ownership" says **"Jason owns `back/` only. Fern owns `front/` only. Neither crosses the line,
  ever"**, and `README.md` sits at the repo root, in neither directory. Two readings of that rule
  both survive — that the line only forbids entering the *other engineer's* directory, or that it
  confines each engineer to his own directory and nothing else — and I will not pick one by
  assumption. The SA Lead writes no repo files, so I cannot absorb it either.
  **One-line answer needed:** does **TASK-013** go to **Fern**, to **Jason**, or somewhere else?
  Everything else about it is decided and written; nothing else in SPEC-002 waits on this, and
  **TASK-011 and TASK-012 are not blocked by it.**
  *(Second, smaller item in the same breath, per A24's own instruction to ask if the literal is not
  obvious: I judged it obvious and wrote `> **Develyst The Education**` — blockquote and bold
  preserved because changing them would be redesigning decoration, which A24 forbids. If Porter
  reads A24 as also dropping the bold, say so and TASK-013 changes by one line.)*

- **Q5 → ANSWERED by the owner 2026-09-08 — "ให้เหมือนกันทั้งเว็บ" (`SYSTEM-FACTS.md` A27) = UNIFY.**
  He chose the second of the two offered answers: the other routes' `… | DTE Platform` titles are
  **not** to stay as they are. **Consequence, recorded exactly as the question was framed: that is a
  NEW REQ — `REQ-005` (`requirements/REQ-005-unify-page-titles-site-wide.md`, Porter, `DRAFT`) — and
  NEVER a widening of SPEC-002.** Nothing in this SPEC changes: **no TASK is edited, no TASK is
  added, no rule is amended, and neither TASK-011 nor TASK-012 was wrong** — those titles never
  contained the superseded name, so AC 2 never scored them and REQ-004 is untouched by this. SPEC-002
  closes as written. REQ-005 is **not mine yet**: it stays `DRAFT` with one owner question still open
  (what the titles unify *to* — one string on every route, or page name + one unified tail), which
  Porter has asked and which blocks only REQ-005. When he sets it `READY_FOR_SA` it gets **its own
  SPEC with its own enumeration first**, as this question's own wording requires.
  *The question as originally asked is kept below.*

- **Q5 (as asked, for the record) → Porter → the owner (2026-09-08, raised out of TASK-011
  §Questions Q1 — a copy decision, NOT a blocker for anything).** With Rule T applied, `/` now shows the bare
  `DTE — Develyst The Education`. Fern noticed while checking a second route that the site's *other*
  page titles are a different shape — `/courses` renders `ทักษะทั้งหมด | DTE Platform`. **None of them
  contains the superseded name**, so the rename the owner ordered (A20/A21, *"ทุกที่"*) does not reach
  them, and neither TASK touched them; that is settled and correct. What is *not* settled is whether
  he wants one title form across the whole site. REQ-004 §Requirement 2's phrase "no tagline, no
  suffix, no site-name separator, no per-page template" can be read either as (a) a rule about the
  string that replaces the old name — which is how this SPEC reads it, and how both TASKs shipped —
  or as (b) a statement about how *every* page title on the site should look, which would commission
  a separate, larger copy change to routes that were never in REQ-004's enumeration. **I will not
  pick (b) by assumption and no agent has changed anything on this account.**
  **One-line answer needed from the owner:** should the other routes' `… | DTE Platform` titles stay
  as they are, or be unified to the new form? If he says unify, that is a **new REQ or a new SPEC
  with its own enumeration first** — never a widening of SPEC-002, which is closing.
  *(For Porter's framing, in his own words to the owner: this is not a bug and nothing is broken —
  the old name is gone from every page; it is only asking whether the tab text on the other pages
  should match the front page's.)*

### The original Q1–Q3 as asked, kept for the record

- **Q1 → Porter → the owner.** `README.md:3` reads
  `> **Disrupting Thai Education** - Platform การเรียนรู้ออนไลน์สำหรับประเทศไทย`. That is
  **"Disrupt*ing*"** — a verb phrase in a tagline sentence, not the product name, so neither Rule T
  nor Rule N fits it (REQ-004 §Questions flags exactly this case as an owner question, not a SPEC
  decision). **Nobody edits that line until he answers.** Two one-word answers work:
  *(a)* replace the whole tagline with `Develyst The Education`, or *(b)* leave it as prose.
- **Q2 → Porter → the owner (confirmation, not a blocker).** Applying REQ-004 §Requirement 2 to
  `layout.tsx:22` and `page.tsx:18` **removes the Thai taglines** from the two page titles, so the
  browser tab on the live site will read only `DTE — Develyst The Education`. That follows the REQ
  as written; it is flagged because it deletes copy the owner wrote rather than renaming it. If he
  wants a tagline kept, that is a one-line change to Rule T here and to TASK-011.
- **Q3 → Porter → the owner (the owner-only list, REQ-004 AC 6).** Three `DTE.md` lines
  (`:1` heading, `:936` the quoted slogan, `:938` the `#DisruptThaiEducation` hashtag) are his own
  document (C3) — flagged, not edited. Beyond the repo, anything on `dte.develyst.online`, the
  production database, deploy/server config, or social/marketing surfaces is his alone (C2); this
  team cannot see any of it and does not guess at it.

*(Engineers ask here; Sober answers as `> answer: ...`)*
