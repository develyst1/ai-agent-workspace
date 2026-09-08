# REQ-004: Replace the superseded product name "Disrupt Thai Education" everywhere

- Status: **SPEC_DONE** — 2026-09-08. SPEC-002 is closed (all 3 TASKs DONE, no rework) and
  **Porter's acceptance check is done: 5 of the 6 acceptance criteria are MET on recorded
  evidence; the 6th (AC 5) is met on its engineer-evidence half and outstanding only on its
  "owner's own eyes" half** — see §"Porter's acceptance check (2026-09-08)" at the end of this
  file. **Deliberately NOT `DELIVERED` yet:** AC 5 names the owner's own eyes as part of "done",
  he was asked in Thai on 2026-09-08, and one word from him closes it. Nothing on this REQ waits
  on Sober or on an engineer. All four parts of the rename remain owner-stated: the exact
  `<title>` string (A19), the `front/` scope (A20), the outside-`front/` scope (A21), the form
  used elsewhere (A22).
- Priority: MEDIUM — user-facing copy on a live site; not blocking REQ-001 and not blocked by it.
- Requested: 2026-09-07 by the owner (develyst), across four answers on 2026-09-06/07.
- Deadline: none stated.

## Problem / Goal

The product is named **"Develyst The Education"** (`SYSTEM-FACTS.md` A6, settled 2026-09-07). The
earlier name **"Disrupt Thai Education"** is superseded but still shipped — it was found in
`front/`'s page `<title>`, and the owner has since said the rename applies beyond `front/` as well.
Real users see the old name today.

The owner's own words, in the order he said them:

> **"เปลี่ยน"** — *change it* (2026-09-07, on the page `<title>`; A17)
> **"DTE — Develyst The Education"** — the exact title string (2026-09-07; A19)
> **"ทุกที่"** — *everywhere*, first for `front/` (A20), then again for outside `front/` (A21)
> **"Develyst The Education"** — the form used where it is not the page `<title>` (2026-09-07; A22)

This REQ exists as its own item because the rename now spans **`back/` and repo documents as well
as `front/`**, which is explicitly out of scope for REQ-001 ("Backend work of any kind"). It is a
whole-product copy change, not part of the frontend foundation.

## Requirement

1. Every occurrence of the superseded name **"Disrupt Thai Education"** in the `dte` repo on
   `develop` must be replaced with the settled name — in `front/`, in `back/`, and in repo
   documents. The owner enumerated `back/`, `README.md`, `DTE.md`, deploy config and the live site
   in the question he answered "ทุกที่" to (A21).
2. **Exactly two replacement forms exist, and no third is to be invented:**
   - the page `<title>` takes the exact string **`DTE — Develyst The Education`** — character for
     character, including `DTE`, the spaced em dash `—` (not a hyphen), and the capitalisation
     (A19);
   - **every other occurrence** takes the bare name **`Develyst The Education`** (A22).
   No tagline, no suffix, no site-name separator, no per-page template, no abbreviation-only
   variant.
3. The occurrences must be **enumerated from the code first, and the list written down**, before
   anything is edited — so the owner can see what is about to change on a live site.
4. Occurrences that an agent may not touch — anything living in production, the production
   database, or the deployed site on `dte.develyst.online` — must be **listed for the owner to
   change himself**, not edited and not silently dropped (see C2).

## Acceptance Criteria

- [x] A written, complete list of every place the superseded name appears, produced by a
      repeatable search over the repo on `develop` (the exact command and its output recorded),
      split into: `front/` · `back/` · repo docs · **owner-only (production / deploy / DB)**.
- [x] After the change, the same repeatable search over the repo returns **zero** occurrences of
      "Disrupt Thai Education" — with the command and its actual output recorded, not a claim.
- [x] The page `<title>` reads exactly `DTE — Develyst The Education`, confirmed in a browser, not
      by reading the source.
- [x] Every other changed occurrence reads exactly `Develyst The Education`.
- [~] `front/` builds and every touched route still renders — engineer's own run output, plus the
      owner's own eyes. There is no QA role here; anything not actually run is written `UNVERIFIED`.
- [x] The owner-only list has been handed to the owner (via Porter) as a plain list of places he
      must change himself.

## Constraints

- **C1 — two repos' worth of ownership in one repo.** `front/` is Fern's, `back/` is Jason's, and
  neither crosses the line (PROTOCOL.md). If the rename touches both, that is **two TASKs**, not
  one — how it is split is the SA Lead's call.
- **C2 — brownfield and LIVE, and the hard environment line.** `dte.develyst.online` serves real
  users. No agent deploys, ssh-es, or contacts production or the production database for any
  reason, including to check whether the old name appears there. The owner's "ทุกที่" puts those
  occurrences **in scope of the rename**; it does **not** authorise an agent to touch them
  (`SYSTEM-FACTS.md` A21 ⚠️).
- **C3 — `DTE.md` is the owner's own document.** It is his product-vision text, not a team
  artifact. A rename inside it is shown to him rather than assumed — flag it, do not quietly edit.
- **C4 — `README.md` at the repo root is stale** and describes a backend that does not exist
  (`SYSTEM-FACTS.md`). Renaming the product inside it is in scope; **fixing its stale content is
  not** — that is a separate problem, not to be swept in here.
- **C5 — copy only.** This REQ changes the product's displayed name and nothing else. It is not a
  rebrand, not a logo change, not a visual redesign, and it does not rename identifiers, packages,
  directories, environment variables, database values, or domains.

## Out of Scope

- Any product feature, and any part of REQ-001's folder/component-library foundation.
- Renaming code identifiers, package names, folders, env vars, DB values, or the domain (C5).
- Fixing the stale content of `README.md` (C4).
- Anything executed against production or the production database (C2) — those occurrences are
  listed for the owner, never changed by an agent.
- The DTE `/about` page Thai copy — a separate open DATA REQUEST (`SYSTEM-FACTS.md` A10).

## Questions

**For the owner — none open.** All four parts of the rename are answered: A19 (exact title
string), A20 (`front/` scope), A21 (outside `front/`), A22 (the form elsewhere). Their verbatim
Thai is in `SYSTEM-FACTS.md` §"Owner's answers to the two page-title rename questions" and
§"Owner's answers to the two rename-scope questions".

⚠️ One thing is **deliberately not stated and must not be guessed by anyone**: *which files
actually contain the old name outside `front/`*. Enumerating that from the code is the SA Lead's
work (requirement 3), not a Porter assumption. If the enumeration turns up an occurrence whose
replacement is not obviously one of the two forms in requirement 2 — for example the name embedded
in a sentence, a legal line, an email template, or an external service's configured value — that is
a **new question for the owner via Porter**, not a decision to be taken in the SPEC.

**For the SA Lead** (Sober answers here as `> answer: ...`):

- **Q1** — Does this land as its own SPEC, or as an addition to an existing one? Sober had already
  called the `front/` half "its own TASK, not folded into TASK-001/002" (log 2026-09-07); REQ-004
  now widens that beyond `front/`. The call is Sober's.
  > answer (Sober, 2026-09-08): **its own SPEC — `specs/SPEC-002-product-name-rename.md`.**
  > Folding it into SPEC-001 was not possible: SPEC-001 §Non-functional states "No backend change —
  > `back/` is untouched by every TASK in this SPEC", and the rename now has a real `back/` half.
  > SPEC-001's `TASK-0NN (page-<title> rename)` placeholder is superseded by SPEC-002.

- **Q2** — Does the `back/` side have any occurrence at all? If the enumeration finds none, say so
  in writing and this becomes a `front/`-plus-docs job with no BE TASK.
  > answer (Sober, 2026-09-08): **yes — 7 occurrences in 6 `back/` files**, including two the
  > outside world sees (the Swagger `info.title` at `/docs`, and the Thai AI system prompt in
  > `src/routes/ai.ts`). There is a real BE TASK: **TASK-012 (Jason)**. The `front/` half is
  > **TASK-011 (Fern)** — 3 occurrences in 2 files. Full enumeration, the exact command and its
  > verbatim output: `specs/SPEC-002-product-name-rename.md` §The enumeration (14 lines, 9 files).
  > Two of the enumerated lines are **not** for any engineer: the repo-root `README.md:3` tagline
  > reads "Disrupt**ing** Thai Education" (a verb phrase, not the name — SPEC-002 §Questions Q1,
  > for the owner), and the three `DTE.md` lines are his own document (C3, owner-only list).

### Porter → the owner's answers to SPEC-002 §Questions Q1–Q3 (2026-09-08)

Asked in Sober's order, answered by the owner on 2026-09-08. Verbatim Thai and the full reading of
each is in `SYSTEM-FACTS.md` §"Owner's answers to SPEC-002's three rename questions" (**A24–A26**).
Short form, so Sober can act without re-asking:

- **Q1 — `README.md:3` "Disrupt*ing*" tagline → "เปลี่ยนทั้งประโยค"** = option **(a)**: the whole
  tagline sentence on that line (the English verb phrase **and** the Thai descriptor after the
  dash) is replaced by the bare name **`Develyst The Education`**. Not a substring swap; no new
  tagline invented. ⚠️ He ruled on the copy, **not** on the line's Markdown decoration (`> `,
  `**…**`) — decoration is not copy (C5); if the exact literal is not obvious, ask Porter.
- **Q2 — deleting the two Thai page-title taglines → "ตัดได้"** = approved. **Rule T is unchanged**;
  the browser tab reads only `DTE — Develyst The Education` on both routes. TASK-011 needs no edit
  on this account.
- **Q3 — the owner-only list → "เดี๋ยวจัดการเอง"** = he does them himself: `DTE.md` ×3 (C3) plus
  everything outside the repo (C2). Handed over and accepted → **§Acceptance Criteria item 6 is
  MET**. Nobody edits them and nobody chases him for them.

**Consequence for §Acceptance Criteria item 2, recorded so no one reports it as a failure:** with
`DTE.md` owner-only, a search over the *whole* repo cannot return zero while he has not yet made
his own edits. **AC 2 is scored over the team-owned surface — `front/` + `back/` + `README.md` —
and `DTE.md` still carrying the old name is EXPECTED, not a defect.** Everything else in AC 2
(repeatable command, actual output recorded, not a claim) stands unchanged.

**Nothing on REQ-004 is waiting on the owner any more.**

### Porter → Sober: SPEC-002 §Questions **Q4 ANSWERED** (routing, 2026-09-08)

Q4 asked who edits the repo-root `README.md:3` (TASK-013), because `PROTOCOL.md` §"Repo layout &
ownership" grants `back/` to Jason and `front/` to Fern and the repo root sits in neither. This is a
**management call, not an owner question and not a rule change** — the owner has already put this
line inside the team's surface (A21 "ทุกที่"; A26 keeps only `DTE.md` + everything *outside* the repo
for himself), so it is ours to do and pushing it back to him would be asking him to run the team.

- **Answer: TASK-013 goes to Jason (BE)** — as a **one-off assignment for this single line**, made
  by me, effective when Sober assigns it. Sober owns the assignment and the status; I neither move
  the TASK nor address the engineer.
- **Why Jason and not Fern**, in PM terms and not by reading a rule off a document:
  1. **Precedent, not interpretation** — Jason has already made the *identical* Rule-N edit to the
     other README in this repo (`back/README.md:1`, TASK-012, reviewed DONE 2026-09-08). Same rule,
     same kind of file, same hands = the smallest chance of a fresh interpretation error.
  2. **Load** — Fern is on REQ-001's critical path (TASK-004 `/login` is the next unit there);
     Jason has no queued work. One line should not sit behind a screen.
- **What this explicitly does NOT do:** it does not amend `PROTOCOL.md`, does not extend Jason's
  ownership, and does not create a standing rule for repo-root files. The boundary that the
  PROTOCOL sentence exists to protect — **neither engineer enters the other engineer's directory** —
  is untouched, because the repo root is in neither directory. The next root-level file is a fresh
  routing question, not a precedent to be cited.
- **The exact literal is CONFIRMED, TASK-013 needs no change.** Sober asked me to contradict him if
  I read A24 otherwise: I do not. `> **Develyst The Education**` is right — A24 ruled on the copy
  and says the Markdown decoration is nobody's to redesign, so the `> ` blockquote and the `**bold**`
  stay and the Thai descriptor goes. Nothing else in `README.md` is touched (C4).
- **⚠️ Told to the owner, in Thai, on 2026-09-08**, so he can overturn it in one word if he wants
  the root file handled differently. It is a decision made openly, not a silent one; if he
  overturns it the change is one line here and one in TASK-013.

**SPEC-002 §Questions Q5** (the other routes' `… | DTE Platform` titles — unify or leave) was
**carried to the owner on 2026-09-08** and is the only REQ-004-adjacent item now waiting on him. It
blocks nothing: those titles hold no occurrence of the superseded name, so AC 2 does not score them,
and if he answers "unify" that is a **new REQ**, never a widening of SPEC-002.

### Porter → Sober: SPEC-002 §Questions **Q5 ANSWERED by the owner** (2026-09-08)

- **Answer: "ให้เหมือนกันทั้งเว็บ"** — *make them the same across the whole site*
  (`SYSTEM-FACTS.md` **A27**). He chose **unify**.
- **Therefore, exactly as the question was framed to him: this is a NEW requirement —
  `requirements/REQ-005-unify-page-titles-site-wide.md` — and NOT a widening of SPEC-002.** SPEC-002
  closes on its own scope. Q5 is settled and needs no further work inside it beyond marking it
  ANSWERED with this pointer; **no TASK in SPEC-002 changes, and TASK-013's review is untouched.**
- **REQ-004 is unaffected in every respect.** Those titles hold no occurrence of the superseded
  name, so §Acceptance Criteria item 2 does not score them, and neither TASK-011 nor TASK-013 was
  wrong to leave them. Nothing here reopens.
- ⚠️ **REQ-005 is DRAFT, not READY_FOR_SA**, because he stated that the titles must *match* and not
  what they must match *to* (one string everywhere, or per-page name + one unified tail). That one
  question is asked of him in REQ-005 §Open questions Q1; until he answers, nobody enumerates,
  specs or edits a title.
- **The Q4 routing was also put to him and he did not overturn it: "โอเค"** (`SYSTEM-FACTS.md`
  **A28**). TASK-013 → Jason stands as an accepted one-off; `PROTOCOL.md` is still not amended,
  Jason's ownership is still `back/` only, and no repo-root precedent exists.

**Nothing on REQ-004 waits on the owner, on Porter, or on anyone but Sober's review of TASK-013.**

## Porter's acceptance check (2026-09-08)

Done on the handover Sober made when he closed SPEC-002. **This check reads recorded evidence; it
runs nothing.** Porter writes no code and opens no terminal on the repo — every verdict below is
scored against a command and its actual output already written into a SPEC or TASK file, and where
the only evidence is somebody's claim it is scored as a claim. Verdicts, in the order the criteria
are written above:

| # | Acceptance criterion | Verdict | Where the evidence is |
|---|---|---|---|
| 1 | Written, complete, repeatable enumeration, split into 4 buckets | **MET** | `specs/SPEC-002-product-name-rename.md` §The enumeration — the exact `grep -rIn` command and its verbatim output, **14 lines / 9 files**, split `front/` 3 · `back/` 7 · repo docs 1 · owner-only 3. Written **before** any edit, as §Requirement 3 demands. |
| 2 | The same search afterwards returns zero, with actual output | **MET** | Re-run **by Sober at the closing review** (SPEC-002 §Flow step 3 + §Status): **zero** hits in `front/`, `back/` and `README.md`. Each engineer also recorded a scoped re-run returning no output (TASK-011/012/013 §Implementation Notes). The three remaining `DTE.md` hits are **owner-only and EXPECTED** (A26) — scored out by the rule written into §Questions on 2026-09-08, not a defect and never to be reported as one. |
| 3 | The page `<title>` reads exactly `DTE — Develyst The Education`, confirmed in a browser | **MET** | TASK-011 — Fern read the rendered `/` tab in a browser and read codepoint `2014` (the em dash) **from the live DOM**, not from source; she served the production build with `next start` after `npm run dev` refused a held port, which Sober judged **stronger** evidence, not weaker. Independently, TASK-012 — Jason confirmed the Swagger `/docs` title in a browser. |
| 4 | Every other changed occurrence reads exactly `Develyst The Education` | **MET** | Sober re-verified **on the tree, not from the notes** (TASK-011/012/013 §Review): all 7 `back/` Rule-N substitutions, `layout.tsx:26` `creator` keeping its hyphen, the banner line still 49 codepoints inside its borders, and `README.md:3` read as bytes = `> **Develyst The Education**` — Rule S, blockquote and bold preserved, no em dash. |
| 5 | `front/` builds and every touched route still renders — engineer output **plus the owner's eyes** | **PARTLY MET — engineer half MET, owner half OUTSTANDING** | Engineer half: `npm run build` exit **0** (13 routes), `npx tsc --noEmit` exit **0**, no-emoji harness **124** = the TASK-002 baseline, `/` and `/courses` both loaded (TASK-011); `back/` ran locally with `GET /health` = **200** (TASK-012); TASK-013 built nothing by its own DoD — a Markdown line — which is **not** an UNVERIFIED. Owner half: **he has not looked yet.** Asked in Thai 2026-09-08. |
| 6 | The owner-only list handed to the owner as a plain list | **MET** | Handed over and accepted on 2026-09-08 — **"เดี๋ยวจัดการเอง"** (`SYSTEM-FACTS.md` **A26**): `DTE.md` ×3 plus everything outside the repo are his. Nobody edits them and nobody chases him. |

**Verdict: the rename itself is complete and evidenced. REQ-004 stays `SPEC_DONE`, not `DELIVERED`,
for exactly one reason — AC 5 names the owner's own eyes as part of "done" and he has not looked.**
There is no QA role here, so that half cannot be substituted by anyone on this team, and Porter will
not tick it on somebody's behalf. It is one word from him; when he confirms, the status moves to
`DELIVERED` with no other work.

⚠️ **What he is being asked to look at, stated exactly so nobody over-claims:** on the code as it
stands on `develop` — running it himself, or after he ships it, which is his alone — **confirm the
browser tab reads `DTE — Develyst The Education` and the pages still render.** One word closes it.
The change lives in the repo on `develop` — **no agent deployed anything and nothing here is on the
live site**, so
`dte.develyst.online` still shows the old name until he ships it himself. `DELIVERED` in this
project means the criteria are met with evidence in the files; it has never meant deployed
(PROTOCOL.md §Statuses).

**Deliberately NOT counted as failures of this REQ**, recorded so a later session does not reopen them:

- The three `DTE.md` lines still carrying the old name — owner-only (C3 / A26), expected (AC 2 rule).
- `README.md:5` and `:157` carrying a **U+FFFD** (corrupted emoji) — pre-existing in the committed
  file, **no product name in either line**, and repairing the stale README's content is explicitly
  out of scope (**C4**). Raised by Jason, answered by Sober with no TASK and no invented REQ; if the
  owner ever wants it fixed that is a new REQ of his own.
- The other routes' `… | DTE Platform` titles — they never held the superseded name, so AC 2 never
  scored them; the owner chose to unify them (A27) and that is **REQ-005**, not this REQ.
- Jason's `UNVERIFIED — any route that actually queries PostgreSQL` — Sober ruled it does **not**
  travel to the owner, because nothing queryable changed (the two SQL hits are line-2 comments and
  no database was touched). Porter does not carry it either.

**Nothing on REQ-004 waits on Sober, on Jason or on Fern.** The only open item is the owner's eyes.
