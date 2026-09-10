- Status: **SPEC_DONE** — 2026-09-09 (set by Sober when SPEC-005 closed). Porter's acceptance check
  ran 2026-09-09: **AC 1-5 MET on evidence, AC 6 NOT MET** — it is the owner's own eyes and nobody
  on this team can meet it. **NOT `DELIVERED`**, by REQ-004's precedent (A33): asked as §Questions
  **Q1**. See §"Porter's acceptance check (2026-09-09)" below.

- Status: **READY_FOR_SA** — 2026-09-09, Porter. The owner said **`เปลี่ยน`** (*change them*,
  `SYSTEM-FACTS.md` **A36**) and has now stated **what they change to**: the short **`DTE`**
  (**A38**), with the `src/services/api.ts:1` **source comment excluded** (**A39**). §Open
  questions Q1 is **ANSWERED** and nothing on this REQ is open with the owner.
- Priority: LOW — cosmetic on-screen copy on pages that work today. It blocks nothing.
- Requested: 2026-09-09 by the owner (develyst).
- Deadline: none stated.

## Problem / Goal

After the product-name rename (REQ-004) and while unifying the browser tab titles (REQ-005), Sober
found that the string **`DTE Platform`** survives as **visible on-screen copy** — not as a page
title — in six places in `front/`. So once TASK-015 ships, a user sees the tab read
`DTE — Develyst The Education` while the heading under it still reads `DTE Platform`.

This is **not a defect and not a reopening of REQ-004**: `DTE Platform` is not the superseded name
(`Disrupt Thai Education`), so REQ-004's rename correctly never touched it, and REQ-005 is page
titles only. Sober reported it as an observation, Porter carried it to the owner, and he answered:

> **"เปลี่ยน"** — *change (them)* (2026-09-09; `SYSTEM-FACTS.md` **A36**, answering
> `specs/SPEC-004-unify-page-titles.md` §Questions **Q2**)

It is therefore a **new REQ by SPEC-004's own framing** — it widens neither REQ-005 nor SPEC-004
nor TASK-015, all of which stay exactly on the scope they were written for.

## Requirement

1. The six occurrences must be **enumerated from the code first and the list written down**, with
   the exact current on-screen wording of each, before anything is edited — the same discipline
   REQ-004 §Requirement 3 and REQ-005 §Requirement 2 imposed, for the same reason: the owner sees
   what is about to change on a live site.
2. The replacement wording is **the owner's to state, not anyone's to derive** — see §Open
   questions Q1. Nothing may be substituted from A19, from a tab title, or from the surrounding
   copy's "feel".
3. Each occurrence must be judged **in its sentence**, because they are not all the same kind of
   text: a comparison-table header, three page headings, and one source comment read differently
   and one replacement string may not fit all six. Where the owner's answer does not fit a
   sentence, that is reported to him — never patched by rewording the sentence.
4. After the change, no `DTE Platform` remains as visible copy in `front/`, and the browser titles
   REQ-005 settled are **unchanged** by this work.

## Acceptance Criteria

- [x] A written enumeration of all six occurrences with file, line, and the sentence each sits in,
      produced by a repeatable search over `front/` on `develop` (command and actual output).
- [x] The replacement wording is recorded verbatim from the owner's own words before any edit.
- [x] After the change, a repeat of the same search returns **nothing** in `front/` page copy. The
      `src/services/api.ts:1` comment is **expected to still match** and that is correct, not a miss
      (**A39**) — the check is "no *visible* `DTE Platform` left", with that one line named as the
      known and deliberate survivor.
- [x] `front/` builds and every touched page still renders — the engineer's own command output.
- [x] The titles A30/A31 settled still read exactly as REQ-005 left them — checked, not assumed.
- [ ] The owner has **looked** at the changed pages himself and says the new wording reads right.
      There is no QA role here; anything not opened by a human is written `UNVERIFIED`.

## Constraints

- **C1 — `front/` only, copy only.** No layout, component, routing or design change is authorised.
- **C2 — brownfield and LIVE.** `dte.develyst.online` serves real users. No agent deploys, ssh-es,
  or contacts production for any reason (PROTOCOL.md §Environments).
- **C3 — REQ-004 stays closed.** `DTE Platform` is not the superseded name; this REQ does not
  reopen REQ-004's acceptance and must not reintroduce `Disrupt Thai Education` anywhere.
- **C4 — REQ-005 stays untouched.** Page titles are settled by A30/A31 and are not in scope here.

## Out of Scope

- 🔴 **The `src/services/api.ts:1` source comment** — the owner excluded it in his own words,
  **`ไม่ต้องเอาคอมเมนต์`** (`SYSTEM-FACTS.md` **A39**). It keeps its `DTE Platform` wording; no
  agent edits it, not even "while I was in there". It is code, not copy.
- Every browser page title (that is REQ-005 / SPEC-004, including Part B's five client routes).
- `back/`, the Swagger `/docs` title, and anything outside `front/`.
- The two stray About files (`about/page-new.tsx`, `about/page.tsx.backup`) — not routes, carried
  by Porter as housekeeping (SPEC-003 §Questions Q2). If a scan finds `DTE Platform` in them, that
  is reported, not silently edited.
- The `/about` page's Thai copy rewrite — still a separate open DATA REQUEST (`SYSTEM-FACTS.md` A10).

## Open questions

**Q1 → the owner (asked 2026-09-09 by Porter, in Thai). BLOCKING this whole REQ.**
`เปลี่ยน` says the six should change; it does not say **what they change to**, and the answer is
different text on four visible pages. Sober's report (SPEC-004 §Decision 5) locates them as:
`/about` ×2 (one of them a **comparison-table header**), `/login:86`, `/register:193`, `/teach:104`,
plus a **source comment** in `src/services/api.ts:1` (invisible to users). Candidates, his to pick
or overwrite:

- **(ก)** the full site name `DTE — Develyst The Education` (A19) everywhere.
- **(ข)** the short `DTE` everywhere (a table header and a heading are narrow).
- **(ค)** the Thai `แพลตฟอร์ม DTE`.
- **(ง)** his own wording, written exactly as he wants it on screen — and if one place needs
  different words from the others, he says which.

He is also asked, in the same line, whether the **source comment** in `api.ts:1` counts (it is code,
not user-visible; it can be changed with the rest or deliberately left).

⚠️ Not the SA Lead's, the engineers' or Porter's to settle (PM.md: a copy rule is a fact only when
the owner states it). Until Q1 is answered this REQ stays `DRAFT` and **nothing is edited**.

> **answer (owner, 2026-09-09): (ข) plus an exclusion — `Q2=ข`, `ไม่ต้องเอาคอมเมนต์`. This REQ is
> now unblocked and `READY_FOR_SA`.**
> **The replacement wording is the short `DTE`** — verbatim in `SYSTEM-FACTS.md` **A38**. (ก) the
> full `DTE — Develyst The Education` and (ค) the Thai `แพลตฟอร์ม DTE` are **rejected**. One
> string for every in-scope occurrence; he named **no per-place exception**, so §Requirement 3
> still stands — if a sentence does not read right with `DTE` in it, that is **reported back to
> him**, never patched by rewording the sentence around it.
> **The `src/services/api.ts:1` source comment is EXCLUDED** — **A39**, his words
> `ไม่ต้องเอาคอมเมนต์`. It keeps `DTE Platform` and is now in §Out of Scope. Scope is therefore the
> **visible on-screen copy only**; the exact in-scope list is still **enumerated from the code
> first** (§Requirement 1 / AC 1) and never carried over as a count from Sober's report.
> **Nothing on REQ-006 is open with the owner.**

## Questions

*(SA Lead asks here; Porter answers as `> answer: ...`)* — Sober asked nothing on this REQ.

**Q1 → the owner (asked 2026-09-09 by Porter, in Thai). This is REQ-006 AC 6, and it is the ONLY
thing keeping this REQ out of `DELIVERED`.**
The words are changed and every machine check passes, but **no person has looked at the pages** —
there is no QA role here, so this one is his and cannot be delegated. Three things to look at:

1. **`/login` and `/register`** — the big heading is now the three characters **`DTE`** where it
   used to read `DTE Platform` (12 characters). Same size, same gradient: **nothing was re-styled to
   compensate**, because that was not authorised. Does it read right, or does it want different
   words / a smaller size? (Either would be a NEW REQ, never a patch onto this one.)
2. **`/about`** — the opening sentence now starts `DTE คือการเรียนรู้ส่วนตัว…`, and the
   comparison-table column header is now just `DTE`.
3. **`/teach`** — the pill should read `สอนกับ DTE`. 🔴 **Nobody on this team has ever seen it**: the
   page sits behind the login guard, so an agent without an account cannot render it. He is the only
   one who can confirm this one.

Known and correct, so neither is a miss: `src/services/api.ts:1` still says `DTE Platform` (**A39**,
his own exclusion), and the two stray About files still hold 8 more (not routes, §Out of Scope).

🔴 **The point that matters most: `DONE` is not deployed.** The live `dte.develyst.online` still
shows the old `DTE Platform` wording until he ships it himself. Nothing here reached production.

> *(awaiting the owner's answer — `ผ่าน` / `ไม่ผ่าน` + which of the three)*

## Porter's acceptance check (2026-09-09)

I scored this against the **recorded evidence** in `tasks/TASK-018-replace-dte-platform-body-copy.md`
§Implementation Notes and §Review. **I ran no command myself** — a claim is scored as a claim. What
raises my confidence is that Sober **re-ran all 14 DoD himself**, on his own dev server (3041) with a
varied input (classroom id 42, not Fern's 1), instead of reading her paste.

- **AC 1 — MET.** The list was **enumerated from the code before any edit**, not carried over as
  Sober's earlier count of "six": `grep -rn "DTE Platform" .` gave **14** lines, split **5 in scope /
  1 owner-excluded (`api.ts:1`) / 8 in the two stray About files**. File, line and the sentence each
  sits in are written into the TASK-018 table. This is the discipline REQ-004 §Requirement 3 and
  REQ-005 §Requirement 2 imposed, and it held here without being re-argued.
- **AC 2 — MET.** `DTE` is the owner's own answer, recorded verbatim as **A38** on 2026-09-09
  **before** SPEC-005 or TASK-018 existed. §Requirement 3 held in the direction that matters too:
  each of the 5 was judged in its own sentence and **nothing was reworded** to make `DTE` fit.
- **AC 3 — MET.** Scoped grep over the four files → **no output, exit 1**. Repo-wide **9** survivors,
  each named and deliberate: `api.ts:1` (**A39**) plus 8 in the two strays (not routes, §Out of
  Scope). 14 before, 9 after, 5 gone. No *visible* `DTE Platform` is left.
- **AC 4 — MET.** `npm run build` **exit 0** with the **same 9 routes**, `npx tsc --noEmit` **exit 0**,
  and all four touched pages **HTTP 200** on a local dev server that was started and **stopped**.
- **AC 5 — MET, and this was the real risk.** `about/page.tsx` carries REQ-005's
  `title: 'เกี่ยวกับเรา'` in the *same file* that was edited twice. All **8** titles were re-read
  live and are character-exact, and `/`'s rendered title still has a **pipe count of 0** (**A31** —
  the one failure that would have been silent). REQ-005 is unharmed; **C4 held**.
- **AC 6 — NOT MET, and nobody on this team can meet it.** It asks for the owner's own eyes; only an
  automated Chrome has looked. Asked as §Questions **Q1** above.

**Also checked, because they are constraints and not ACs:** **C1** — 4 files, 5 lines, 0 added,
0 deleted, proved by full-ISO mtimes (exactly four files at `08:14:49`); no class list, component,
route or dependency changed. **C2** — no production contact by anyone. **C3** —
`grep -rn "Disrupt Thai" src` → **0**, so REQ-004 stays closed.

**3 `UNVERIFIED` carried up, not laundered:**
1. **The live site still shows `DTE Platform`.** `DONE` is not deployed; the owner ships.
2. The `/login` + `/register` 3-character wordmark has been seen only by an automated browser.
3. **`สอนกับ DTE` on `/teach` has never been seen rendered by anybody**, and structurally cannot be
   without a session (`'use client'` + `withAuth`). Not a defect of the edit — the source line is
   proved at 47 bytes — but it is the owner's to confirm.

**One process note, to the team's credit:** Fern's `sed -i` silently converted all four files
CRLF→LF; **she caught it herself by a file-size delta and repaired it**, and Sober verified the
repair independently (`\r` count == line count on all four). It is now `SYSTEM-FACTS.md` **A40**, so
the next byte-exact job does not have to rediscover it.

