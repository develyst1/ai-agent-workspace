# SPEC-005: Replace the leftover `DTE Platform` body copy with `DTE`
- Source: REQ-006
- Status: **DONE** — 2026-09-09. Its only unit **TASK-018** was reviewed `DONE` (no rework) by Sober
  on 2026-09-09; evidence in `tasks/TASK-018-replace-dte-platform-body-copy.md` §Review. **REQ-006 is
  therefore `SPEC_DONE`** and waits on Porter's acceptance check. Nothing here is blocked; three
  `UNVERIFIED` are carried up (live site · the owner's own eyes on the shortened wordmark ·
  `สอนกับ DTE` behind `withAuth`).
- Written: 2026-09-09 by Sober (SA Lead)

## Overview

Five lines of **visible on-screen copy** in `front/` still read `DTE Platform`. The owner has
stated both halves of the decision himself: the replacement is the short **`DTE`**
(`SYSTEM-FACTS.md` **A38**, `Q2=ข`), and the `src/services/api.ts:1` **source comment is excluded**
(**A39**, `ไม่ต้องเอาคอมเมนต์`). So there is nothing to design here except *exactly which lines* and
*how the change is proved not to spill*.

**Approach: five literal substring replacements, `DTE Platform` → `DTE`, and nothing else.** No
component, no layout, no route, no metadata, no dependency (REQ-006 **C1**). The rejected
alternative was a repo-wide `sed` over `front/src`: it would hit the two stray About files and
`api.ts:1`, all three of which are explicitly out of scope, and it would have to be un-done rather
than never done. Five named lines in four named files is smaller and provable.

**Single-side change: `front/` only, one owner (Fern).** Nothing in `back/` is touched, so **this
SPEC declares no BE↔FE contract** — no HTTP surface, no field casing to settle.

## Decision 1 — the in-scope list, enumerated from the code, not carried over as a count

REQ-006 §Requirement 1 / AC 1 forbids reusing the "six" from my own earlier report. I re-ran the
search against the real repo on `develop` (repo path from the workspace-root `machine.local.md`;
never written into a committed file):

```
$ cd <front>
$ grep -rn "DTE Platform" . --exclude-dir=node_modules --exclude-dir=.next | sort
```

**14 matching lines.** Split three ways:

**IN SCOPE — 5 lines, 4 files** (visible copy on live routes):

| # | File | Line | The sentence it sits in | Kind |
|---|------|------|--------------------------|------|
| 1 | `src/app/about/page.tsx` | 45 | `description="DTE Platform คือการเรียนรู้ส่วนตัวที่ขับเคลื่อนด้วย AI …"` (a `FeatureCard` prop) | Thai sentence, opens with it |
| 2 | `src/app/about/page.tsx` | 128 | `<th className="text-left p-6 text-sky-600 font-bold">DTE Platform</th>` | comparison-table column header |
| 3 | `src/app/login/page.tsx` | 86 | the text node inside the page's `<h1 className="text-4xl font-bold bg-gradient-to-r …">` | page heading / wordmark |
| 4 | `src/app/register/page.tsx` | 193 | the text node inside the same-shaped `<h1>` | page heading / wordmark |
| 5 | `src/app/teach/page.tsx` | 104 | `<span>สอนกับ DTE Platform</span>` (the pill above the hero) | Thai phrase, ends with it |

**OUT OF SCOPE — 1 line, owner-excluded (A39):** `src/services/api.ts:1`,
`// API Service Layer for DTE Platform`. It **keeps** its wording. Editing it is a defect.

**OUT OF SCOPE — 8 lines in the 2 stray About files** (`src/app/about/page-new.tsx` ×3,
`src/app/about/page.tsx.backup` ×5). They are **not routes** — Porter carries them as housekeeping
(SPEC-003 §Questions Q2) — and REQ-006 §Out of Scope says a scan that finds them **reports**, never
edits. **Reported here, and that is the whole action.** Their mtimes are `2026-09-06 20:50`; the
TASK makes Fern prove they are still that.

5 + 1 + 8 = 14 ✔. The count matches my earlier "six" once A39's comment is removed from it, but the
list above comes from the code, not from that number.

## Decision 2 — `DTE` fits all five sentences; no per-place exception is reported

REQ-006 §Requirement 3 makes me judge each occurrence **in its sentence** and report — never
reword — any sentence the owner's one string does not fit. I read all five:

1. `DTE คือการเรียนรู้ส่วนตัวที่ขับเคลื่อนด้วย AI …` — grammatical; `DTE` is the subject either way.
2. table header `DTE` — the `<h3>` **eight lines above it already reads `DTE แตกต่างจากคอร์สทั่วไปยังไง?`**
   (line 120), so the header becomes *more* consistent with its own section, not less.
3. / 4. the `<h1>` on `/login` and `/register` — it is a wordmark under a `Link href="/"`, and the
   site's own name is `DTE`. It shortens from 12 characters to 3 inside a `text-4xl` gradient
   heading — a **visual** consequence, not a grammatical one.
5. `สอนกับ DTE` — grammatical.

**So: no sentence is reported back as not fitting, and no sentence is reworded.** Item 3/4's
visual consequence is not mine to settle either — it is exactly what REQ-006 **AC 6** (the owner's
own eyes) exists for, and it is written into the TASK as an explicit thing for Porter to put in
front of him, not as a reason to add words he did not say.

## Decision 3 — a literal substring replacement, so the surrounding Thai cannot drift

Two of the five lines carry long Thai sentences (#1, #5) whose bytes are the owner's product copy.
The edit is defined as: **replace the 12-byte ASCII substring `DTE Platform` with the 3-byte ASCII
`DTE`; every other byte on the line, and every other line in the file, is unchanged.** Each edited
line must therefore be exactly **9 bytes shorter** than before, and the TASK proves it that way
rather than by eyeballing Thai text. This is the same discipline A34/A37 got, applied in reverse:
there the owner's word had to be copied, here it must be *left alone*.

🔴 **Added 2026-09-09 after TASK-018 — the trap this mechanism actually has on this machine.** A
line-addressed `sed -i` here rewrites the **whole file** from CRLF to LF (`core.autocrlf=true`, no
`.gitattributes`), so every byte in the file changes even though the diff looks like one line, and
`git diff` **hides it**. Fern hit it, caught it by file-size delta (`login` fell 245 bytes, not 9)
and repaired it with `perl -i -pe 's/
/
/'`; I re-verified the repair
(`tr -cd '' | wc -c` == `tr -cd '
' | wc -c` on all four files). **Any future byte-exact TASK
must pin file SIZE and the CR==LF count, not only the per-line byte length** — the per-line check
alone passes straight through this failure. Routed to Porter as a candidate `SYSTEM-FACTS.md` entry;
recorded here so it survives regardless.

## Decision 4 — REQ-005's titles are protected, and one of them shares a file

`src/app/about/page.tsx` holds both an in-scope copy line (45, 128) **and** the
`export const metadata = { title: 'เกี่ยวกับเรา' }` that SPEC-004 set (line 13). REQ-006 **C4** says
the titles are untouched, and this is the one place where a careless edit could take one out. The
TASK therefore re-proves **all 8 titles live** after the change, including `/`'s pipe count of `0`
(A31 — the failure that is silent), not just `/about`'s.

`/login`, `/register` and `/teach` are `'use client'` pages whose titles come from the
pass-through `layout.tsx` files TASK-016 added; those layouts are **not touched** by this work and
the TASK checks their mtimes.

## API / Interface Design

**None.** No endpoint, request, response or field casing is created, changed or read by this SPEC.
`back/` is untouched (REQ-006 C1).

## Data Model

**None.** No table, column, enum, index or migration. `back/db/schema.sql` is not opened, and no
database — local or otherwise — is contacted (PROTOCOL.md §Environments).

## Flow

1. Fern re-runs the enumeration herself and confirms the same 14/5/1/8 split (a stale list is a
   stale edit — TASK-014's `/blog/` lesson).
2. She replaces the substring on the 5 lines named in Decision 1, and no other line.
3. `next build` and `tsc --noEmit` both exit 0, with the same 9 routes as before.
4. On her own dev server: `/about`, `/login`, `/register`, `/teach` all return 200 and the rendered
   HTML of each contains `DTE` where `DTE Platform` used to be and **no** `DTE Platform`.
5. The scoped grep over the four route files returns **nothing** (exit 1); the repo-wide grep
   returns **9** — the 8 strays plus `api.ts:1`, the known and deliberate survivors (REQ-006 AC 3).
6. All 8 titles are re-read live and are character-identical to what REQ-005 left.

**Edge cases**
- (a) 🔴 **CORRECTED 2026-09-09 by Sober at TASK-018's review — the original text of this bullet was
  wrong and TASK-018 DoD 9 inherited the error.** It said the `/teach` pill "is readable on arrival";
  that is true of the **title** and false of the **pill**. The title comes from the pass-through
  server `layout.tsx` TASK-016 added, so it renders for anyone. The pill at `teach/page.tsx:104`
  sits inside a `'use client'` component wrapped in `withAuth(TeachPage)` (line 415), so an
  unauthenticated request renders only the `animate-spin` shell and the string is **not in the HTML
  at all** — verified by me, `grep` exits 1. `สอนกับ DTE` rendering on screen is therefore
  **unprovable by any evidence this team is allowed to produce** and is a permanent `UNVERIFIED` for
  the owner's eyes (REQ-006 AC 6), not an engineer's gap. The source line's 47 bytes (DoD 3) plus
  HTTP 200 plus `0 × "DTE Platform"` are the evidence that exists, and they are sufficient.
- (b) The two stray About files are *inside* `src/app/about/`, next to the file being edited. A
  glob-based edit will hit them. They must end the session with their `2026-09-06 20:50` mtimes.
- (c) `DTE Platform` appears **nowhere else in `front/` in any other casing** — a case-insensitive
  search returns the same 14 lines — so there is no lowercase variant to argue about.

## Non-functional

Nothing required. No auth, validation, logging, performance or bundle-size consequence: five text
nodes get shorter. The antd shared-chunk item (SPEC-001 §Decision 6) is unrelated and untouched.

## Tasks

- **TASK-018**: Replace `DTE Platform` with `DTE` on 5 body-copy lines in 4 files — owner: **FE
  (Fern)** (depends on: —). This is the SPEC's only unit; when it is `DONE`, REQ-006 is
  `SPEC_DONE`.

## Questions

*(Engineers ask here; I answer as `> answer: ...`)* — none yet.
