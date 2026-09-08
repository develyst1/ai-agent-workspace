# TASK-013: Product-name rename in the repo-root `README.md` (1 occurrence, 1 file)
- Source: SPEC-002 (Rule S)
- Owner: **Jason (BE)** — assigned 2026-09-08 by Sober, on Porter's routing answer to SPEC-002
  §Questions Q4. **Read §Scope of this assignment below before you start** — this is a one-off for
  this single line and it does NOT widen your ownership.
- Status: **DONE** — reviewed 2026-09-08 by Sober, **no rework**. Verdict and the checks I re-ran
  myself: §Review. (Was `REVIEW`, executed 2026-09-08 by Jason; before that `TODO`, assigned
  2026-09-08.) This was the **last open TASK of SPEC-002**.
- Depends on: none. (Q4 is answered — see §Scope of this assignment.)

## Scope of this assignment (read first — added 2026-09-08 when Q4 was answered)

`README.md` is at the **repo root**, and `PROTOCOL.md` §"Repo layout & ownership" grants `back/` to
Jason and `front/` to Fern — the root is in neither. I would not pick a reading of that rule by
assumption, so I asked Porter (SPEC-002 §Questions **Q4**). His answer, in full with the reasoning:
`requirements/REQ-004-product-name-rename-everywhere.md` §"Porter → Sober: SPEC-002 §Questions Q4
ANSWERED". Short form, binding on this TASK:

- **Jason (BE) takes it**, as a **one-off for this one line**. Reasons given: he already made the
  identical Rule-N edit to `back/README.md:1` in TASK-012 (same rule, same kind of file), and Fern is
  on REQ-001's critical path.
- **This is NOT a rule change.** `PROTOCOL.md` is **not** amended, Jason's ownership is **not**
  extended beyond `back/`, and **no repo-root precedent is created** — the next root-level file is a
  fresh routing question, not something to cite this TASK for. The boundary the PROTOCOL sentence
  protects — neither engineer enters the *other engineer's* directory — is untouched.
- **The exact literal is CONFIRMED unchanged.** I asked Porter to contradict me if he read A24
  differently; he does not. `> **Develyst The Education**` stands — blockquote and bold preserved,
  Thai descriptor deleted. The edit specified below is exactly what it was when written.
- The owner was told this routing decision in Thai on 2026-09-08 so he can overturn it. If he does,
  it changes the Owner line above and nothing else in this TASK.

## Context in one paragraph

The product's name is **Develyst The Education** (`SYSTEM-FACTS.md` A6). Line 3 of the repo-root
`README.md` still carries the superseded one — but **not as a name**: it reads "Disrupt**ing** Thai
Education", a verb phrase inside a tagline sentence, so neither of REQ-004's two replacement forms
fits it as a substring swap. Sober asked the owner rather than guessing; he answered
**"เปลี่ยนทั้งประโยค"** — *change the whole sentence* (`SYSTEM-FACTS.md` **A24**). That is SPEC-002's
**Rule S**, and it applies to this one line and to nothing else in the repo.

## What to do

Exactly one line edit. Nothing else in `README.md`, and no other file at all.

**`README.md:3` — Rule S (whole sentence, decoration preserved).**

```
- > **Disrupting Thai Education** - Platform การเรียนรู้ออนไลน์สำหรับประเทศไทย
+ > **Develyst The Education**
```

Read these before typing:

- The replacement string is the bare name **`Develyst The Education`** (A22 form) — **no em dash,
  no `DTE —` prefix**. The `DTE — Develyst The Education` form is Rule T and belongs to page
  `<title>`s only; using it here would be wrong.
- **The `> ` blockquote and the `**bold**` stay.** The owner ruled on the copy, not on the
  Markdown decoration, and A24 says decoration is nobody's to redesign — so it is preserved
  exactly, not dropped and not added to.
- **The Thai descriptor ` - Platform การเรียนรู้ออนไลน์สำหรับประเทศไทย` is deleted on purpose**, and
  **no new tagline is invented** to replace it. That is "เปลี่ยนทั้งประโยค" as stated; it is not
  your call and not mine.
- **Do not fix anything else in this file.** `README.md` is known-stale — it describes a NestJS +
  Prisma backend that does not exist (`SYSTEM-FACTS.md` A2). Renaming the product inside it is in
  scope; **fixing its stale content is explicitly OUT of scope** (REQ-004 **C4**). Leave the `🚀`
  on line 1, every URL, every heading and every wrong sentence exactly as they are. The no-emoji
  harness is a `front/` rule (TASK-002) and does not reach this file.
- Do not open `front/`, `back/`, or `DTE.md`. `DTE.md` is the owner's own document and he is doing
  it himself (A26) — touching it is a defect, not helpfulness.

## Definition of Done

- [ ] The one edit above is in place and **no other file is modified**. Prove it:
      `git status --short` (reading git state is fine; **never commit**).
- [ ] Line 3 reads exactly `> **Develyst The Education**` — paste `sed -n '3p' README.md`.
- [ ] The old name is gone from this file: `grep -n -i "disrupt" README.md` → **no output**
      (paste the actual output, not a claim).
- [ ] The rest of the file is untouched — paste `git diff --stat README.md`; it must show a single
      file with **1 insertion, 1 deletion**.
- [ ] Nothing was built or run, and nothing needed to be: this file is documentation, not code.
      If you believe otherwise, stop and ask in §Questions instead of running anything.

## Implementation Notes

Executed 2026-09-08 by Jason (BE). One line edit in the repo-root `README.md`, nothing else opened.
`front/`, `back/` and `DTE.md` were not touched.

**Before I typed anything** — the working tree was clean and line 3 matched the TASK's `-` line
byte-for-byte (LF endings, ASCII hyphen, no trailing whitespace):

```
$ git status --short
(no output)

$ sed -n '1,3p' README.md | cat -A
# M-pM-^_M-^ZM-^@ DTE Platform - Quick Reference$
$
> **Disrupting Thai Education** - Platform M-`M-8M-^AM-`M-8M-2 ... M-8M-^WM-`M-8M-"$
```

**The edit** — line 3 only, `> ` blockquote and `**bold**` preserved, Thai descriptor deleted, no
new tagline invented, no `DTE —` prefix and no em dash (Rule S, not Rule T).

### Definition of Done — commands and their real output

```
$ git status --short
 M README.md

$ sed -n '3p' README.md
> **Develyst The Education**

$ sed -n '3p' README.md | cat -A
> **Develyst The Education**$          <- no trailing whitespace, LF ending

$ grep -n -i "disrupt" README.md
(no output; exit 1)

$ git diff --stat README.md
 README.md | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

$ git diff README.md
@@ -1,6 +1,6 @@
 # 🚀 DTE Platform - Quick Reference

-> **Disrupting Thai Education** - Platform การเรียนรู้ออนไลน์สำหรับประเทศไทย
+> **Develyst The Education**

 ## � URLs
```

- **One file, one line.** `git status --short` shows only `README.md`; `git diff --stat` shows
  1 insertion / 1 deletion. The `🚀` on line 1, the URLs, headings and every stale sentence are
  untouched — the stale NestJS/Prisma content is out of scope (REQ-004 C4) and I left it alone.
- **Nothing was built or run.** This file is documentation; the DoD says so and I agreed.
- Note, not a change I made: `git diff` prints `warning: in the working copy of 'README.md', LF will
  be replaced by CRLF the next time Git touches it` — that is this machine's `core.autocrlf`
  speaking about a future checkout. The file **on disk is still LF**, proven by `cat -A` above
  showing `$` with no `^M`. I changed no line endings and touched no git config.
- The `?` in the diff's `## ? URLs` context line is **not** a rendering artefact: line 5 of
  `README.md` really contains the bytes `EF BF BD` (U+FFFD REPLACEMENT CHARACTER) where an emoji
  once was — read as bytes with `cat -A` (`M-oM-?M-=`), and it was there **before** this task.
  It is a context line, outside the hunk, and I left it exactly as it is: pre-existing damage in a
  known-stale file is out of scope here (REQ-004 C4). See §Questions Q1 — it is not a copy call I
  will make on my own.

## Questions

*(Asked here; Sober answers as `> answer: ...`. Do not decide a copy question yourself — the
replacement string is the owner's own word and there is no second form for this line.)*

**Q1 (Jason, 2026-09-08) — non-blocking, nothing changed, no rework needed on this TASK.**
Two lines of the repo-root `README.md` carry a **U+FFFD REPLACEMENT CHARACTER** — a corrupted emoji,
byte-for-byte damage, not a typo:

```
$ grep -n $'\xef\xbf\xbd' README.md | cat -A
5:## M-oM-?M-= URLs$
157:## M-oM-?M-= Environment Variables$

$ git show HEAD:README.md | sed -n '5p' | cat -A
## M-oM-?M-= URLs$                       <- present before this task; not mine
```

I did **not** touch them: my TASK is one line, the file is known-stale, and REQ-004 **C4** puts
fixing its content out of scope. Flagging rather than silently shipping or silently fixing. It holds
**no** product name, so AC 2 is unaffected either way. If it is worth repairing, that is a new
routing/scope call for you — it is a root file, and my ownership is `back/` only.

> **answer (Sober, 2026-09-08) — you were right to flag it and right not to touch it. No rework, no
> TASK, nothing in this TASK changes.** I re-read both lines as bytes myself and confirmed they are
> **pre-existing**: `EF BF BD` (U+FFFD) is there in the committed version of the file as well as in
> the working tree, so nothing you did produced them. Three separate reasons they stay:
> **(1)** REQ-004 **C4** puts repairing `README.md`'s content out of scope — the file is known-stale
> (`SYSTEM-FACTS.md` A2) and the rename is the only thing REQ-004 sends anyone into it for.
> **(2)** Neither line holds a product name, so **AC 2 is unaffected** — this is not a defect against
> anything we were asked to deliver. **(3)** What the right replacement would be (which emoji, or
> none) is a **copy** question, therefore the owner's and not mine; and `README.md` is a repo-root
> file, so *who* would edit it is a fresh routing question every time — SPEC-002 §Questions Q4
> settled **this one line only, with no precedent** (see §Scope of this assignment).
> I am therefore **not** inventing a REQ for it. It is recorded here so it is findable if the owner
> ever asks for the stale root `README.md` to be repaired; until he does, it is not work.
> Flagging instead of silently fixing — or silently shipping — was exactly the right call.

## Review

**Verdict: DONE — no rework.** Reviewed 2026-09-08 by Sober. Rule S is satisfied exactly as
specified, and the limits in §Scope of this assignment were honoured.

**What I re-verified on the working tree myself, not from the notes above:**

- **The literal, read as bytes.** `sed -n '3p' README.md | od -c` →
  `> * * D e v e l y s t   T h e   E d u c a t i o n * * \n`. The `> ` blockquote and the `**` bold
  are **preserved**, the Thai descriptor is gone, and there is **no em dash and no `DTE —` prefix**
  (this is Rule S's A22 form, not Rule T's). No trailing whitespace; LF ending. That is
  character-for-character the literal SPEC-002 §Edge cases fixed and Porter confirmed.
- **The full-repo enumeration re-run** — the same command as SPEC-002 §The enumeration:
  `grep -rIn --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next -i "disrupt" .`
  → **3 lines, all in `DTE.md` (`:1`, `:936`, `:938`)**. Zero hits in `front/`, zero in `back/`,
  zero in `README.md`. Per SPEC-002 §Flow step 3, AC 2 is scored over `front/` + `back/` +
  `README.md` → **AC 2 is MET**. The three `DTE.md` lines are the owner's own (A26) and are
  **EXPECTED, not a defect** — nobody reports them and nobody chases him.
- **Nothing else in `README.md` moved.** Line 1's `🚀`, line 5 and everything below are identical to
  the committed version; exactly one line differs. The stale NestJS/Prisma content is untouched,
  which is correct (REQ-004 **C4**).
- **No other file in the repo was modified** by this task.
- **The U+FFFD on lines 5 and 157 is genuinely pre-existing** — present in the committed file too.
  Confirmed independently of the claim, and answered in §Questions Q1 as **no TASK**.

**Accepted as written, no re-run needed:** "nothing was built or run". That is this TASK's own DoD:
the file is documentation, no code path reads it, and a build would prove nothing about a Markdown
line. This is **not** an `UNVERIFIED` and **nothing here travels to the owner** — the change is fully
verified by reading the bytes, which I did.

**The line-endings note needs nothing added:** the file on disk is LF (`cat -A` shows no `^M`) and no
line endings or tooling config were changed. Per the standing owner ruling (`SYSTEM-FACTS.md`
**A23**) git is outside this team's scope; I read the tree only to confirm file *content*, and no
git state is reported here or anywhere else.

**Consequence:** TASK-013 was the last open TASK in SPEC-002 → **SPEC-002 is DONE** and **REQ-004
moves to `SPEC_DONE`**. The acceptance check is Porter's.
