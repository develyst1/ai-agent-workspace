# Board — code-report

> Single source of truth for CURRENT state. Update me at the end of every session
> (see PROTOCOL.md). **File discipline (workspace-root `DISPATCHER.md`, binds all
> roles):** detail lives in the TASK/REQ file; a board cell is ONE line (status +
> date + owner + pointer); a log entry is ≤ 15 lines. Never paste evidence or
> keep old text here. Full pre-compaction board:
> `archive/board-2026-08-21-pre-compaction.md`.

## Project info

- Description: web tool that takes a git repository (public, or private via PAT),
  analyses the codebase + commits for a chosen day/date range, accepts extra
  free-text context, and produces a readable written dev-work summary — on
  screen, later optionally emailed. Stakeholder infrastructure: AI API CENTER
  (his multi-provider AI API), PostgreSQL, SMTP.
- Product name on screen: `KnowCode` (REQ-001 Req 14; repos/folders NOT renamed).
- Repos: `C:\Users\Admin\develyst\code-report\code-report-back` (Jason) ·
  `C:\Users\Admin\develyst\code-report\code-report-front` (Fern).
- Team: Porter (PM) · Sober (SA Lead) · Jason (BE) · Fern (FE) · Tanya (QA) —
  QA now OPERATIONAL 2026-08-21 (Q20 = c, Q21 = "เขียนเลย"): `ai-worker/QA.md`
  written, PROTOCOL.md amended (chain `Porter ↔ Tanya`, REQ leg `IN_TEST` →
  `TEST_PASSED`/`TEST_FAILED`), `ai-worker/tests/` created. Tanya is **local-only
  here** (this project has no deployed environment) and the no-SQL rule is not
  relaxed for her. Nothing handed to her yet. **PROTOCOL.md's team + chain
  tables now also list Fern (FE)** — Q22 "เพิ่มเลย", 2026-08-21, bookkeeping only.
- 🧪 Trial ground for the DISPATCHER (workspace-root `DISPATCHER.md`): one
  session spawns the roles as subagents. Files remain the only channel;
  PROTOCOL unchanged.
- Standing rules still live: no SQL / real environments for the team (human is
  the data source, via DATA REQUEST); copy bundle CLOSED by Q14 (new strings
  need a TASK line + human yes/no); dates rendered `DD/MMM/YY` per Req 15.

## Requirements

| ID | Title | Priority | Status | Owner of next step |
|----|-------|----------|--------|--------------------|
| REQ-001 | Generate a readable dev-work report from a git repository | HIGH | IN_SPEC — Reqs 16/17/18 added 2026-08-20, TASK lines still unwritten (Sober's queue) | Sober (queue) + engineers on open TASKs; see Tasks |
| REQ-002 | *(planned, number RESERVED — see parked facts: ID desync)* Email the finished report | — | not written yet | Porter (PM) |
| REQ-003 | Frontend UI quality + folder-structure overhaul (`code-report-front`) | HIGH | IN_SPEC — TASK-015 open, TASK-016's block is GONE (Q-SA-17 = "ก", answer in REQ-003 §Questions for Sober to transcribe + move). **Q30 narrows the verdict: redesign NOT rejected, not accepted either** — REQ-003 §Questions | Sober (transcribe Q-SA-17, move TASK-016) · Fern (TASK-015) |
| REQ-004 | New-report form usability (branch list, committer, dates) + back from the report page | HIGH | **IN_SPEC 2026-08-21 — SPEC-003 ACTIVE**; 017 + 018 + 019 all `DONE` (Reqs 1/1a/2/2a/3/4a/4b/6 built and SA-verified); only **TASK-020** is left, and Q32/Req 7d's freeze widening is still unwritten | Fern (TASK-020) · Sober (the 7d widening) |

## Specs

| ID | Title | Source | Status | Owner of next step |
|----|-------|--------|--------|--------------------|
| SPEC-001 | Git-repo dev-work report — API, data model, git + AI pipeline | REQ-001 | ACTIVE | engineers via TASK rows; amendments queued (Sober) |
| SPEC-002 | Frontend UI redesign + folder-structure rebuild | REQ-003 | ACTIVE — Decision 3.4 stays WITHDRAWN (no new dependency); **freeze items 1 + 4 now PARTIALLY RELEASED 2026-08-21 for SPEC-003 only** (item 4 = the board's "item 3"; see the annotations in SPEC-002) | Fern (TASK-015) |
| SPEC-003 | New-report form usability (loaded branch + committer lists, one date range) + back from the report page | REQ-004 | **ACTIVE 2026-08-21** — 2 new read-only BE endpoints, no schema/contract change; **017 + 018 + 019 all `DONE`**, only 020 open; all four freeze-item-4 clauses built **and SA-verified**; how much further 7d opens the freeze is still unwritten | Fern (TASK-020) · Sober (freeze widening) |

## Tasks

| ID | Title | Source | Status | Assignee | Depends on |
|----|-------|--------|--------|----------|------------|
| TASK-001 | BE — skeleton, config, Postgres schema + migration, seed | SPEC-001 | IN_PROGRESS — code complete; migrate/seed evidence in `../project-docs/` (2026-08-20/21), DoD close is Sober's review call (queue item 3) | Jason (BE) | none |
| TASK-002 | BE — auth: login/logout/me, sessions | SPEC-001 | DONE — reviewed 2026-08-20, evidence in TASK-002 §Review | Jason (BE) | TASK-001 |
| TASK-003 | BE — git layer: clone, tree, commits, PAT redactor | SPEC-001 | DONE — rework reviewed 2026-08-20, commit `2e441bf`, evidence in TASK-003 §Review | Jason (BE) | TASK-001 |
| TASK-004 | BE — AI API CENTER client + 3-stage pipeline | SPEC-001 | DONE — rework reviewed 2026-08-20, commit `e3453a8`, evidence in TASK-004 §Review | Jason (BE) | TASK-001 |
| TASK-005 | BE — report endpoints + worker + statuses | SPEC-001 | DONE — rework reviewed 2026-08-21, commit `4101551`, evidence in TASK-005 §Review | Jason (BE) | 002, 003, 004 |
| TASK-006 | FE — app shell, login, session, i18n scaffold | SPEC-001 | DONE — reviewed 2026-08-20, evidence in TASK-006 §Review | Fern (FE) | none |
| TASK-007 | FE — new-report form | SPEC-001 | DONE — reviewed 2026-08-20, evidence in TASK-007 §Review | Fern (FE) | TASK-006 |
| TASK-008 | FE — report view: polling, progress, sanitized Markdown | SPEC-001 | DONE — rework reviewed 2026-08-20, commit `f00e78d`, evidence in TASK-008 §Review | Fern (FE) | TASK-006 |
| TASK-009 | BE+FE — acceptance run, th + en; carries runs 1–11 | SPEC-001 | TODO — pause lifted; **Q24 answered by delegation 2026-08-21** ("เอาตามที่แนะนำ"): working answer = team writes the click-through script, he runs the eleven UI runs. Re-scoping is Sober's; reversible by one line | Jason + Fern | 005, 008 (DONE) |
| TASK-010 | FE — folder-structure rebuild, no visual change | SPEC-002 | DONE — reviewed 2026-08-21, commit `9b6345c`, gates re-run by Sober; evidence in TASK-010 §Review | Fern (FE) | none |
| TASK-011 | FE — shell + login, Mantine-first + `hallmark redesign` (picks theme; folds in `KnowCode` name) | SPEC-002 | DONE — reviewed 2026-08-21 by Sober at `0b63dec`, gates re-run + contrast re-derived from tokens; theme = hallmark `cobalt`; evidence in TASK-011 §Review | Fern (FE) | TASK-010 (DONE) |
| TASK-012 | FE — new-report form, Mantine-first + `hallmark redesign` | SPEC-002 | DONE — reviewed 2026-08-21 by Sober at `8cac881`; all gates re-run, `globals.css` deletions proved safe by a defined-vs-used class inventory; all 3 `[~]` lines ruled; evidence in TASK-012 §Review | Fern (FE) | TASK-011 (DONE) |
| TASK-013 | FE — report view, Mantine-first + `hallmark redesign` | SPEC-002 | DONE — reviewed 2026-08-21 by Sober at `1f90b87`; all gates re-run, repo-wide token gate verified **0 colour + 0 font**, token block proved unchanged (38 = 38, none added/changed), Q-FE-19 ruled; evidence in TASK-013 §Review | Fern (FE) | TASK-011, TASK-012 (both DONE) |
| TASK-015 | FE — show the session-expired line (Q-SA-14, the one release of freeze item 2) | SPEC-002 | TODO — written 2026-08-21; behaviour only, no new string, no redesign, no dependency | Fern (FE) | TASK-013 (DONE) |
| TASK-016 | FE — local acceptance hand-over: the URL + steps the stakeholder opens (Q-SA-15 + Q23) | SPEC-002 | BLOCKED on paper only — **Q-SA-17 ANSWERED 2026-08-21 "ก" (he starts the backend too, all 3 screens)**; only Sober may move the status and re-scope the hand-over | Fern (FE), via Sober | TASK-015 |
| TASK-019 | FE — back from the report page (`replace`→`push`, explicit control, filled form both ways) | SPEC-003 | **DONE — reviewed 2026-08-21 by Sober at `32e8eed`**; all gates re-run, every deleted line opened, Q-FE-20/21/22 ruled; one finding = Sober's own DoD gap (`extraContext` not restored → Q-SA-20); evidence in TASK-019 §Review | Fern (FE) | TASK-013 (DONE) |
| TASK-017 | BE — repository inspection endpoints (`/api/repos/branches`, `/api/repos/committers`) | SPEC-003 | **DONE — reviewed 2026-08-21 by Sober at `d1f0993`**; all gates re-run + behaviour re-measured outside his suite, Q-BE-17/18/19/20 all ruled; evidence in TASK-017 §Review | Jason (BE) | none |
| TASK-018 | FE — the re-shaped form (branch list + gate, one range today→today, committer list) | SPEC-003 | **DONE — reviewed 2026-08-21 by Sober at `f70fb02`**; all gates re-run, contract re-derived from the real backend, Q-FE-23/24/25/26 all ruled; 2 named gaps carried into TASK-020; evidence in TASK-018 §Review | Fern (FE) | TASK-017, TASK-019 (both DONE) |
| TASK-020 | FE — Requirement 7 usability pass, every screen | SPEC-003 | **TODO — STARTABLE 2026-08-21** (018 `DONE`); **last SPEC-003 TASK**; ceiling still Req 7c until Sober writes the 7d widening; 2 carried-in gaps in its file | Fern (FE) | TASK-018 (DONE) |
| TASK-014 | BE — one real API-driven job: prove the PostgreSQL path (ex-run 13) + record the AI tier (ex-run 12) | SPEC-001 | **REWORK (Phase A) 2026-08-21 — reviewed by Sober; content re-verified against `4101551` and accepted, but 2 lines make the sheet unfollowable on his machine (D1 wrong `project-docs` path, D2 `server-output.txt` never created). Q-BE-13/14/15/16 all ANSWERED, none changes the sheet.** Phase B still not startable | Jason (BE) | TASK-005 (DONE) |

**Next (2026-08-21, SA unit): TASK-018 is reviewed → `DONE` at `f70fb02`. SPEC-003
is three-quarters built and @Fern owns the last TASK — TASK-020 is STARTABLE.**
Every gate re-run by Sober (typecheck 0, build green with the same four routes,
**0 colour utilities** + the same nine known `--font-*` false positives with **no
touched file among them**, clean tree, the declared 12-file `+773/−183`) plus
three checks the DoD did not ask for: the **frozen/untouched diff prints nothing**
over `hooks/reports`, `context/session`, `globals.css`, `package.json`,
`package-lock.json`, `report.service.ts`, `types/api/main/report.ts` and `app/`
— so freeze item 5's polling is byte-identical, `SessionProvider` was not opened
and "no new dependency" is proof; the **six dictionary deletions are safe by
construction** (`MessageKey` is derived from `th` and `en` is
`Record<MessageKey, string>`, so a surviving reader or a one-sided key is a *type
error* — typecheck 0 proves both dictionaries still match key-for-key); and the
**client contract was re-derived from TASK-017's real code, not from her fake
server** — both response shapes match `types/api/main/repos.ts` exactly, and the
≤366 bound is the *same number and the same comparison* on both sides
(`span > 366` client, `(to−from)/MS_PER_DAY > 366` server), so 366-accepted /
367-rejected is agreement rather than coincidence. Read structurally: the gate is
one expression that reaches every control, `disabled` on submit **and** an early
`return` in `handleSubmit`, so the **Enter key cannot pass it either**; the branch
`Select` is `searchable={false}`, so "nowhere to type a branch" is a property of
the control; `invalidateBranches()` fires on all three of URL, private toggle and
token and itself invalidates the committers. **Q-SA-20 accepted and her mechanism
beats the one I would have named** — `RunRetryParams = Omit<RetryParams,
"extraContext">` makes "the report page must not write that key" a compile error.
**All four questions ruled, none escalated: Q-FE-23 → my own instruction conflict,
item 3 is SUPERSEDED by §5, keep the code where it is; Q-FE-24 → keep the
deferred committer** (auto-loading is a clone nobody asked for, a synthetic option
would put an `author` on the wire that matches nobody) **→ carried into TASK-020**;
**Q-FE-25 → nothing is wrong**: the hint describes how commits are *counted*, and
that really is `REPORT_TIMEZONE` = `Asia/Bangkok` (`config.ts:81`,
`commits.ts:103`), while §2's "today" is only the pre-filled *default* — they
diverge only on a browser outside Asia/Bangkok, and only in a default;
**Q-FE-26 → keep `back: 0/6/29`**, presets are inclusive of today. **Two named
gaps, both mine and both accepted rather than reworked, both carried into
TASK-020:** the committer's deferred restore, and the **second round trip**
(form → report → Back → Forward → Back) losing the extra-context box, which is the
price of take-and-remove (Q-FE-21) plus the API's missing field (Q-SA-20).
**Fern's port-8080 disclosure is CLOSED with no action** — one unauthenticated
request, rejected, nothing written, nothing to undo. **@Jason: nothing new is
yours** — TASK-014 Phase A's D1/D2 rework is still your next unit. **@Porter:
nothing needs you; no question goes up.**
**Previous (2026-08-21, FE unit): TASK-018 was BUILT and `REVIEW` at `f70fb02`.** `+773/−183` over 12 files
(2 new: `types/api/main/repos.ts`, `services/repo.service.ts`). **Every DoD row
measured on a production build** against a throwaway fake backend that lived
outside the repo and **is stopped and deleted** (both ports free). The gate is
real: with no branch list, the period, committer, extra context, language and
submit are all `disabled`, a failed load shows the **server's own message** and
leaves nothing to type a branch into, and `branches: []` locks with its own
line. Presets, `366 accepted / 367 rejected`, `YYYY-MM-DD` on the wire, no
`author` key on "everyone", `author` = the e-mail when there is one, date-change
invalidation, and **no mode switch anywhere in either language** — all measured,
evidence in TASK-018 §Implementation Notes. **Q-SA-20's mechanism, which is the
part that could quietly fail:** the writer is split in two —
`writeRetryParams` (form side, seven keys) and `writeRunRetryParams` (report
side, six keys, read-merge-write) — and `RunRetryParams = Omit<RetryParams,
"extraContext">` makes "the report page must not write that key" a **type
error**. Proved by sentinel: all six job-sourced keys were overwritten from
`job.params` while `extraContext` survived. `RetryParams` gained **exactly one**
key and no `pat`; storage after a private run holds only `cr.retryParams` with
no token, and the token appears in **three request bodies** and nowhere else.
Dictionary: **+12 ×2, −6 ×2, nothing reworded** (the two typing hints were
removed, not replaced). **Four questions, ALL NON-BLOCKING and all for Sober:**
**Q-FE-23** — carried-in item 3 says "change no code in `retryParams.ts`" but §5
requires exactly that, so I followed the later, more specific §5 and am naming
the conflict; **Q-FE-24** — Back leaves the *committer* on "everyone" until that
list is loaded (the literal instruction, but Req 4a says "filled");
**Q-FE-25** — `reports.new.date.hint` says Asia/Bangkok while §2 defines "today"
as the browser's local day, and I changed neither (approved copy vs your §2);
**Q-FE-26** — "last 7 days" is built inclusive of today. **One disclosure:**
something not mine is listening on `localhost:8080`; before I noticed, my server's
first start sent it **one** unauthenticated request, which it rejected. I moved
to 8099 and never connected to any database or ran any SQL. **@Sober: TASK-018 is
ready for review; TASK-020 stays blocked on it and TASK-015 is still mine.**
**Previous (2026-08-21, SA unit): Q-SA-19 + Q-SA-20 are TRANSCRIBED — and Q-SA-20
turned out NOT to be the two-line change I costed.** Both answers are now in
SPEC-003 §Questions with their consequences, and Q-SA-20's work is written into
**TASK-018 §5** (plus one DoD row and a `RetryParams` diff row). **@Fern: read
TASK-018 §5 before you start — the shape changed, not just the scope.**
**Measured in the real code rather than assumed:** `GET /api/reports/:jobId`
returns `params` with **exactly six keys** and `extraContext` is not one of them
(`jobResponse`, `src/reports/jobs.ts`), so **the report-page writer cannot source
that value at all** — and because it rewrites the *whole* payload from
`job.params`, a naive "add it to the form-side writer" ships a value the next
poll silently wipes. **Ruling: `RetryParams` gains one key, only the form-side
writer populates it, the report-side writer must not destroy it (mechanism is
Fern's), and adding the field to the API is explicitly NOT the answer** — that is
a SPEC-001 contract change Q-SA-20 does not authorise. **Q-SA-19 = "ok" recorded
as approving the 12 TASK-018 strings + `reports.view.back` AS AUTHORED**: they
are an `[x]` at review, changing one is now a question, and the two *false* hints
are still NOT covered (replacing approved text is a reword, freeze item 10).
**Freeze item 4 gains a fourth clause** (extra context's *value on back* only —
its bound, wire key, optionality and label stay frozen). **One stale fact
corrected while in the file:** SPEC-003's freeze section still asserted "Q32 is
open"; it is answered, so 7c → 7d — **but the widening itself is deliberately NOT
done here**, because deciding how far the freeze opens is a design unit about
TASK-020's ceiling, not a transcription. Until it is written, TASK-018's
boundaries stand and TASK-020 has no new licence in its file. **@Jason: nothing
new is yours** — TASK-014 Phase A's D1/D2 rework is still your next unit.
**@Porter: nothing needs you; no question goes up.**
**Previous (2026-08-21, SA unit): TASK-019 is reviewed → `DONE` at `32e8eed`, and
TASK-018 is now STARTABLE — @Fern, it is yours.** Every gate re-run by Sober
(typecheck 0, build green with the same four routes, **0 colour utilities** and
the same nine known `--font-*` false positives, none in a touched file, clean
tree, `+83/−14` over three files) plus three checks the DoD did not ask for:
**all 14 deleted lines opened** and each accounted for as moved-not-removed; the
nine-path "untouched" diff prints **nothing** (so freeze item 5's polling and
`retryParams.ts` itself are byte-identical); and `dictionaries.ts` is `+2/−0`, so
freeze item 10 could not have been touched — the pair shipped is the one Q-SA-19
approved as authored. **Verified structurally rather than trusting her harness:**
`ReportViewContent` has **no early return**, so the back control is above the
`job ? … : null` branch and present even with no job — stronger than the five
states the DoD names; and the handoff cannot carry the token by construction
(`RetryParams` has no `pat`, one writer builds from a wiped `body`, the other
from `job.params`). **All three questions ruled, none escalated: Q-FE-20 → KEEP
the second writer** (my preferred shape was falsified by measurement, and it
cannot write what the page does not yet have), **Q-FE-21 → the handoff may live
until the next form mount consumes it; do NOT touch `SessionProvider`** (bounded:
if the payload ever gains a non-user-input field the lifetime becomes a question
again), **Q-FE-22 → noted, carried into TASK-020 as a one-line tidy.**
**One finding, and it is MY DoD's gap rather than her defect: `extraContext` does
not come back** — the handoff carries six values and the free-text box is not one
of them, while Q29 said "มีค่าเดิม". Not resolved by assumption → **Q-SA-20 to
Porter, NON-BLOCKING** (SPEC-003 §Questions); a "yes" is one key plus two lines
and lands in TASK-018. **Also recorded: commit `42b396e` (`.gitignore` += `.agent/`)
is named by no TASK** — harmless, nothing to undo, but @Fern should mention such
commits in the TASK. **@Jason: nothing new is yours** — TASK-014 Phase A's D1/D2
rework is still your next unit.
**Previous (2026-08-21, FE unit): TASK-019 is BUILT and `REVIEW` at `32e8eed` — the
ball is @Sober's.** `replace`→`push`, an explicit back control in all five
states, and both ways back land on a filled form. Three files, `+83/−14`;
`reports.view.back` added to both dictionaries and **no existing string
touched**. Measured on a production build against a throwaway fake (deleted,
ports dead, `.env.production.local` deleted and the manifest rebuilt back to
8080): **15/15**, `before` vs `afterBack` compared as measured states.
**One departure from the preferred shape, falsified rather than argued:** the
report page writes the handoff when it has the job (Sober's shape) **and** the
form writes it once before navigating — because between `push` and the first
poll the page has no `params`, and at `a3a848f` (no form-side write, `GET`
delayed 4 s) browser Back produced a **completely empty form**. With it, 4/4.
**Freeze item 6 re-measured on a private run:** token in exactly one request
body, absent from storage and URL, back returns with the PAT field not mounted.
**Q-FE-20** (keep the second writer?), **Q-FE-21** (how long may the handoff
live — a form reached later by a non-back route also opens prefilled; not
cleared on logout because that is frozen `SessionProvider`) and **Q-FE-22**
(noted only) are **all NON-BLOCKING**. **TASK-018 needs this review plus
TASK-017 (`DONE`) before it is startable; TASK-015 is still Fern's and untouched.**
**Previous (2026-08-21, SA unit): TASK-017 is reviewed → `DONE` at `d1f0993`, and
`POST /api/repos/*` is now built, gated and proved.** Every gate re-run by Sober
(typecheck 0, `bun test` 230/0, clean tree, the 10-file `+1268/−24` stat) plus two
checks the DoD did not ask for: the `test/` diff is **721 insertions and zero
deleted lines**, so "31 added, none removed" is proof rather than arithmetic, and
the six-file "untouched" diff prints **nothing**. Behaviour re-measured outside
Jason's suite (PAT only in `http.extraHeader`, `parseLsRemote` edge cases, the
four failure mappings, 366 accepted / 367 rejected through the *same* function,
`groupCommitters` order). **All four questions ruled, none escalated: Q-BE-17 and
Q-BE-18 keep what he shipped** (reuse beats tidiness; the duplicate holds no
bound) and both become **one parked tidy-up**; **Q-BE-19 → `email` is always a
string, `""` when the commit has none** — a wire shape, so Sober's call, not the
human's, and it is written into **SPEC-003 §API + TASK-018** so Fern reads it
where she works. **One finding, and it is Sober's own SPEC gap, not a defect:**
the committers clone runs with **no concurrency bound** while the worker's runs
behind `MAX_CONCURRENT_JOBS` — parked as a SPEC-003 decision (queue item 14),
blocks nobody. **@Fern: TASK-019 is now the only thing between TASK-018 and
startable.** **@Jason: nothing new is yours** — TASK-014 Phase A's D1/D2 rework
is still your next unit.
**Previous (2026-08-21, PM unit): the four outstanding answers came back and are
TRANSCRIBED — this project has ZERO questions open with the human.** **Q32 =
"ใช่หากมันดีขึ้นต่อการใช้งานก็จัดการเลย"** → REQ-004 Req **7c released → 7d**:
REQ-001-named behaviour (366-day cap, `DD/MMM/YY`, th/en, PAT rules,
`NO_COMMITS`, polling) is the team's to change **when the change improves
usability**, with that reason written in the TASK — **@Sober, TASK-020's ceiling
has moved and how much of SPEC-002's freeze that releases is yours to write.**
**Q-SA-19 = "ok"** → the 13 th/en strings approved **as authored**; answer is in
**REQ-004 §Questions** for @Sober to transcribe into SPEC-003. **Q33 = the docs
live INSIDE the `.bru` files** (verified: all 8 carry a Thai `docs { … }` block)
→ joins Q-SA-18 in the TASK-014 transcription; curl-vs-Bruno is still Sober's
call. **Q24 is CLOSED by Porter, not re-asked**: he has now twice said he does
not understand it, so Porter withdrew his own question and the existing
reversible arrangement stands — it commits nothing today and grants no database.
**Two limits Porter refused to smooth over: Req 7e** — Q32's wording never named
the **sanitizer**, and the **PAT rules** are safety rather than usability, so 7d
is not read as authorising either (blocks nobody; one question if a TASK ever
wants one) — and Q-SA-19 is recorded as approving **only** the strings that exist
today, not the Q14 bundle re-opening. Porter moved no TASK status, wrote nothing
in `specs/`/`tasks/`/code, ran no SQL and addressed no engineer.
**Previous (2026-08-21, BE unit): TASK-017 is BUILT and `REVIEW` at `d1f0993` — the
ball is @Sober's.** Both endpoints exist behind the session gate, mounted before
the routes. No new error code, string, config key, table or migration, and
`POST /api/reports` is unchanged (proved by an empty `git diff --stat` over
`errors/messages.ts`, `config.ts`, `db/`, `reports/{routes,worker,jobs}.ts`).
Reused rather than re-derived, as instructed: `credentialSecrets` (now exported
from `clone.ts`), `classifyCloneFailure`, `parseRepoUrl`/`assertSafeRepoUrl`,
`withClone`+`jobTempDir`, `readCommits`, and the report's date rules — the date
block was **moved verbatim** out of `validateCreateReport` as
`applyDateWindowRules` (the three named re-exports are `applyDateWindowRules`,
`optionalText`, `requiredText`). **TASK-018 still needs TASK-019 as well, and
neither is DONE.** Three questions for Sober, all NON-BLOCKING: **Q-BE-17**
(importing `classifyRunFailure` from `reports/worker.ts`), **Q-BE-18** (a
`renderIssues` duplicated because the DoD forbids touching `reports/routes.ts`),
**Q-BE-19** (`email: ""` for a commit with no author e-mail — TASK-018 branches
on that value, so it is asked, not decided). Q-BE-20 is a noted fact, no answer
owed. **TASK-014 Phase A's D1/D2 rework is still open and is Jason's next unit**
unless Sober's Q-SA-18 transcription changes the sheet first.
**Previous (2026-08-21, latest SA unit): SPEC-003's four TASK files are WRITTEN, and
two of them are startable right now — @Jason TASK-017, @Fern TASK-019.** Order is
019 → 017 → 018 → 020 by dependency, but 017 and 019 touch nothing in common, so
both engineers have work at the same time. **TASK-018 is explicitly not startable
until 017 and 019 are `DONE`.** Three things were decided while writing, all
recorded in the files rather than left to be discovered: (1) **`push` alone does
not satisfy Requirement 4a** — the browser's Back button remounts the form empty,
so *both* ways back must land on a filled form, and the handoff must not depend on
which affordance was used (SPEC-003's back section annotated; mechanism left to
Fern); (2) **4a ∩ 1a**: a restored branch/author string is not evidence the branch
still exists, so it is applied as a *pending selection* after the list loads and
submit stays gated on a loaded list; (3) **the two false hints and the dead
`mode`/`date.day` keys** — deleting a key with no reader is not a reword, but
*replacing* hint text is, so it is a question, not a decision. **13 new user-facing
strings are authored across TASK-018/019 with their th/en pairs** for the one
Q-SA-19 yes/no round — nothing waits on it. No code written, no SQL, no
environment touched, no artifact of another role edited.
**Previous (2026-08-21, SA unit): REQ-004 `IN_SPEC`, `SPEC-003` written + `ACTIVE`.**
Two **read-only** endpoints (`/api/repos/branches` = `git ls-remote --symref
--heads`, no clone; `/api/repos/committers` = metadata-only clone, range-scoped,
on demand), **no new table, error code or config key and no `POST /api/reports`
contract change**. Requirement 4 traced to `NewReportContent.tsx:169`
(`router.replace`). SPEC-002 freeze released narrowly: item 4 (three clauses) +
item 1 (`replace`→`push`); **everything Q31 puts "in reach" stays frozen** (Q32
open, Req 7c). Bookkeeping: the "freeze item 3" everyone cites is **item 4**.
**Q-SA-19 raised, NON-BLOCKING.**
**Previous (2026-08-21, PM unit): the last two open questions came back and are
TRANSCRIBED — nothing on this project waits on a human answer.** **Q31 =
"ทุกหน้า แก้พฤติกรรมได้ด้วย"** → REQ-004 Requirement 7a's narrow hold is RELEASED
and becomes **7b: every screen, behaviour as well as usability**. REQ-004 stays
`READY_FOR_SA`; Requirements 1–6 are untouched. **@Sober: the consequence is
yours to write** — SPEC-002's behaviour freeze now has to be released much wider
than freeze item 3 alone. **Q-SA-18 = Bruno**, with a verified path
(`C:\Users\Admin\Downloads\bruno\bruno` — an AI API CENTER collection, 8 `.bru` +
`bruno.json` + `environments\`); the answer is in **REQ-001 §Questions** for
@Sober to transcribe into TASK-014, and whether it is a re-format or a
replacement of Jason's `curl` sheet is his call. **Two residuals Porter refused to
close by assumption, both NON-BLOCKING: Q32** (does "แก้พฤติกรรมได้" reach
behaviour REQ-001 itself specified? — Req 7c holds the conservative line) and
**Q33** (which "docs" — that path contains none). Porter moved no TASK status,
wrote nothing in `specs/`/`tasks/`/code, ran no SQL and addressed no engineer.
**Previous (2026-08-21, latest SA unit): TASK-014 Phase A reviewed → `REWORK`, and
the evidence hand-over does NOT leave for Porter yet.** Every fact in Jason's
runbook was re-derived from the real code by Sober and held (config loader,
routes, cookie, validate bounds, both log-line shapes key-for-key, the three
no-secrets claims) — but **two lines make it unfollowable on the stakeholder's
machine**: **D1** Step 5 sends the evidence to `../project-docs/`, which from his
shell resolves to `C:\Users\Admin\develyst\code-report\project-docs` — **verified
not to exist** (the real folder is under `ai-agent-workspace\code-report\`), and
**D2** Step 5 greps `server-output.txt`, which Step 1 never creates. Both are
one-line fixes; nothing else in the sheet is to be touched. **All four questions
ANSWERED and none changes the sheet:** Q-BE-13 keep `REPO_AUTH_FAILED` (the TASK
text was Sober's error, corrected in §4; the unresolvable-host alternative is
refused as cosmetics over coverage), **Q-BE-14 ruled (b) — indirect proof, and
bounded**: a Postgres `UPDATE` fails whole, so `status: DONE` proves `finishDone`
and a returned `error_code` proves `finishFailed`, but **`finishNoCommits` stays
unproven**; (c) refused — no field goes on the wire for a tidier evidence line.
Q-BE-15 accepted, Phase B DoD amended to "every AI call, grouped by stage" plus a
**tier-stability-across-batches** verdict. Q-BE-16 noted; if Run A needs a PAT
that settles REQ-001 Q8 as a side effect. **New parked candidate: should
`finished_at` be readable through the API at all** (application writes it on
every terminal transition; no consumer can see it).
**Previous (2026-08-21, SA unit): Q-SA-16 is transcribed and TASK-014 is
re-scoped and `TODO` — Jason has work again for the first time since the split.**
Under "ค" the keyboard is the stakeholder's, so TASK-014 is now **Phase A** (Jason
authors the runbook the stakeholder executes — quoted from the real config
loader, routes and log lines; `curl` form) and **Phase B** (Jason reads the pasted
evidence). The DoD is split to match, and Phase A is ticked without any
environment. **Sober did not write the runbook himself** — it is engineer work out
of the real code, and writing it would have been implementation. **One new
NON-BLOCKING question, Q-SA-18** (curl or Bruno). **The evidence hand-over is now
recorded as gated on Phase A**: Porter's ask told him *what* to paste, nothing on
file tells him *how*, and `../project-docs/` is still empty of it.
**Previous (2026-08-21, PM unit): the whole outstanding answer set came back in
one round and is TRANSCRIBED — `REQ-004` is `READY_FOR_SA`.** Q25 = "ค" (committer
becomes a **loaded list**, field NOT removed → Req 6), Q26 = "ก" (team's own
judgement, his eyes are the test → Req 7), Q27 = "ไปต่อไม่ได้เลย" (no branch list,
no continuing → Req 1a), Q28 = today→today + the 366-day cap stays (Req 2a),
Q29 = "มีค่าเดิม" (back keeps his values → Req 4a). **Q30 = "โค้ดล่าสุด": he was on
the reworked build and can see it is Mantine — the redesign is NOT what he
rejected, so TASK-010/011/012/013 stand; but he did not say the screens are
acceptable either, so REQ-003 stays `IN_SPEC` and TASK-016 still produces that
verdict.** **Q-SA-17 = "ก" — he starts the backend too, so all three screens are
openable; TASK-016's cause of blocking is gone and only @Sober may move it.**
**Q24 was answered by delegation** ("คืออะไร เอาตามที่แนะนำ") — Porter explained it
back in Thai and recorded a reversible recommendation; the TASK-009 re-scope is
still Sober's. **Two things Porter refused to smooth over:** Q26's second half
(how far "และอีกหลายอย่าง" reaches) was never answered → **Q31**, non-blocking,
with REQ-004 Req 7a holding the scope to the two screens he named meanwhile; and
REQ-003 is recorded as *neither* accepted *nor* rejected rather than being read
as delivered. **@Sober: REQ-004 is yours now** — and SPEC-002's freeze item 3
still has to be released for it, which is yours to write, not Porter's.
**Previous (2026-08-21, PM): NEW stakeholder feedback on the running app
→ `REQ-004` written, `DRAFT`.** He wants the branch **loaded as a list** after the
git URL (reversing REQ-001 Req 4.6 / Q-SA-2), **one date-range control** with the
single-day mode removed (merging REQ-001 Req 4.1 + 4.2), an **easier** period
picker, and a **way back from the report page** — all now carried by the
`READY_FOR_SA` REQ above.
**Previous (2026-08-21, latest SA unit):** **the six-answer backlog is cleared and
REQ-003's two missing TASK lines exist.** Q-SA-12/13/14/15/**Q23** are
transcribed into SPEC-002 `## Questions` with their consequences, **freeze item 2
is partially released** (the *silent* redirect only — everything else stays
frozen), and two TASKs are written: **TASK-015** (show the session-expired line —
`TODO`, Fern's, startable now) and **TASK-016** (the localhost hand-over —
`BLOCKED`). **Q-SA-16 → TASK-014 is the one transcription NOT done here**: it
carries a second decision (what TASK-014 becomes for Jason once the evidence
lands) and is the next SA unit. **New question Q-SA-17 (human via Porter,
BLOCKS TASK-016 only):** Q23 settled `localhost` but not what runs behind it —
with the frontend alone he can open **one** of the three reworked screens, since
`/reports/*` need an authenticated session. Not guessed: option (ข) is real FE
work that shows fabricated data, and Q-SA-16's "เดี๋ยวรันเอง" was about two API
jobs, not about running a server to look at screens. **Ordering 015 → 016 is
deliberate** — 015 changes a screen he will open. REQ-003 stays `IN_SPEC`.
Older state, kept because it is still current:
**TASK-013 is `DONE` at `1f90b87` (reviewed 2026-08-21) — the whole
SPEC-002 redesign (010/011/012/013) is now built and SA-reviewed, and no TASK is
in anyone's court.** Every gate was re-run by Sober: typecheck 0, build green
with the same four routes, repo-wide Decision 3 gate a real **0 colour + 0 font**
with all nine font hits opened and confirmed as `--font-*` references, the
`cr-*` inventory reproducing at 29 = 29, and two checks the DoD did not ask for
— the **token block proved unchanged as values (38 = 38, none added or
changed)** and **freeze item 5's polling shown to be untouched code**
(`useReportJob.ts` is not among the commit's five files), so the tiers and stops
could not have regressed. Q-FE-19 was **ruled, not escalated**: derived,
language-invariant, `aria-hidden` numerals are design, not copy.
**Two consequences, both stated rather than smoothed over:** (1) **TASK-009's
pause is LIFTED but it is still not startable** — Q24 (who performs the eleven UI
runs) is now DUE with Porter, and the team hits the same real-environment wall
that produced Q-SA-16; (2) **REQ-003 is deliberately NOT `SPEC_DONE`** — every
SPEC-002 TASK is DONE, but **Q-SA-14** (session-expired line, approved NEW
behaviour) and the **Q-SA-15/Q23 acceptance-URL DoD line** still have no TASK,
and REQ-003's final criterion is that URL. **Both lines are now written
(TASK-015 / TASK-016) and five of the six transcriptions are done — see "Next"
above.**
The earlier TASK-012 review changed one thing beyond the verdict: **SPEC-002 Decision
3.4's `@mantine/dates` authorisation is withdrawn** — its stated premise ("rule 2
cannot otherwise be honoured") was Sober's and was false, and the package cannot
be installed without `dayjs`, which Q-SA-12 declined. The SPEC now authorises no
new dependency at all. **The TASK-009
split is DONE — and it did NOT unpark Jason, which is the finding of that
session:** TASK-014 exists, is BE-only and is free of the FE rework, but runs 12
and 13 are by definition a *real-database* run and **no database is authorised
for the team** (the stakeholder ran `migrate`/`seed:users` himself for exactly
that reason). **Q-SA-16 is now ANSWERED 2026-08-21 — "ค เดี๋ยวรันเอง": the
stakeholder runs TASK-014's two jobs himself and pastes the output into
`../project-docs/`; the team never connects and the `admin` password is not
needed. Nothing on this project is blocked on a human answer any more.**
**TASK-014's row still reads BLOCKED because only Sober may move a TASK status** —
its cause is gone, and what TASK-014 becomes for Jason (evidence review vs.
rewritten instructions) is Sober's call. **Of the six answers that waited on Sober, five are
transcribed 2026-08-21 (Q-SA-12/13/14/15/Q23 → SPEC-002); only **Q-SA-16** →
TASK-014 remains.** **Q23 = "localhost"**, so with Q-SA-15 the
stakeholder opens a **local** URL and captures himself — the DoD line is about
leaving something openable on his own machine, **not** pasting images and **not**
deploying. Porter carries **Q24** (whether he also runs TASK-009's eleven UI runs
himself) — **now DUE, since TASK-013 has landed**.
Q-SA-14 ("ขึ้นข้อความ") is still approved NEW behaviour needing a TASK line of
his. QA (Tanya) has a charter but no work.

## Blocked / waiting

| Item | Waiting on | Question (short) |
|------|-----------|------------------|
| ~~FE probe reached port 8080~~ CLOSED 2026-08-21 at the TASK-010 review | closed — Porter informed, no action | Nothing written, so nothing to undo; standing FE rule added (confirm the proxy target before a harness's first request). Detail: TASK-010 §Review |
| ~~Q-FE-10~~ ANSWERED 2026-08-21 — not TASK-010's, and not Sober's to decide | escalated as Q-SA-14 | Detail: TASK-010 §Questions |
| ~~Q-FE-11~~ ANSWERED 2026-08-21 "no barrels under `src/app/`" | closed — SPEC-002 Decision 2 reworded | Fern's reading upheld; no files to add. Detail: TASK-010 §Questions |
| ~~Q-SA-14~~ TRANSCRIBED + TASKED 2026-08-21 | closed — TASK-015 written (`TODO`, Fern) | Freeze item 2 partially released in SPEC-002; no new string. Detail: SPEC-002 §Questions + TASK-015 |
| ~~Q-SA-12~~ TRANSCRIBED 2026-08-21 | closed — no SPEC change; Decision 1 stands | Also the reason `dayjs`/`@mantine/dates` stay unauthorised. Detail: SPEC-002 §Questions |
| ~~Q-SA-13~~ TRANSCRIBED 2026-08-21 | closed — folded into the Q-SA-15/Q23 hand-over | He captures, we do not; no "paste screenshots" DoD line anywhere. Detail: SPEC-002 §Questions |
| ~~Q21~~ ANSWERED 2026-08-21 "เขียนเลย" — Porter wrote `QA.md` + PROTOCOL amendment | closed | Three self-imposed limits recorded (local-only, no retro-testing, FE row left alone). Detail: REQ-003 §Questions |
| ~~Q22~~ ANSWERED 2026-08-21 "เพิ่มเลย" — Porter added the FE row + chain pair | closed | Tables only (prose bullets + the one-line chain sentence still say BE — residual, NON-BLOCKING). Detail: REQ-003 §Questions |
| ~~Q-FE-12~~ ANSWERED 2026-08-21 "no toggle, and it does not go up" | closed — `TextInput type=password` stands | A reveal is behaviour SPEC-002 lacks; escalating it would invent scope. Cost if ever asked: SPEC line + th/en pair + human yes/no. Detail: TASK-011 §Questions |
| ~~Q-FE-13~~ ANSWERED 2026-08-21 — reading (b), and the DoD was Sober's to fix | closed — TASK-012 rescoped, TASK-013 owns repo-wide zero | Residual re-measured independently: 29 colour + 10 font, all in `partials/NewReport` + `partials/ReportView`. Detail: TASK-011 §Questions |
| ~~Q-FE-15~~ ANSWERED 2026-08-21 — derivation accepted, `cobalt` stands | closed — no separate mood question goes up | Folded into Q-SA-15's conversation as FYI; a theme change is ~20 token values. Detail: TASK-011 §Questions |
| ~~Q-SA-15~~ TRANSCRIBED + TASKED 2026-08-21 | closed — TASK-016 written | Owner of the final criterion = him. Detail: SPEC-002 §Questions + TASK-016 |
| ~~Q23~~ TRANSCRIBED + TASKED 2026-08-21 | closed — TASK-016 owns command/port/pages | No deployment; cookie-`Secure` stays parked. Detail: SPEC-002 §Questions + TASK-016 |
| ~~Q-SA-17~~ ANSWERED 2026-08-21 — **"ก" = he starts the backend too**, all three reworked screens openable; (ข) fake-data stub CLOSED | @Sober, to transcribe into TASK-016 §Questions + move its status and re-scope the hand-over (Porter may not write in `tasks/`) | No credential asked for or given — he runs it, the team never connects. Detail: REQ-003 §Questions |
| ~~Q-SA-16~~ TRANSCRIBED + TASK RE-SCOPED 2026-08-21 | closed — TASK-014 is `TODO` (Phase A), Jason's now | Answer "ค" verbatim in TASK-014 §Questions; two-phase DoD written. Detail: TASK-014 |
| ~~Q-SA-18~~ ANSWERED 2026-08-21 — **Bruno**, with the path `C:\Users\Admin\Downloads\bruno\bruno` (verified: `bruno.json` + `environments\` + 8 `.bru`, an AI API CENTER collection) + "อ่านdocs ก่อน" | @Sober, to transcribe into TASK-014 §Questions (Porter may not write in `tasks/`); re-format vs replace is his call | Answer verbatim in **REQ-001 §Questions**. Lands on a sheet already in `REWORK` for D1/D2. Detail: REQ-001 §Questions |
| ~~Q-SA-19~~ TRANSCRIBED 2026-08-21 into SPEC-003 §Questions + TASK-018 | closed — wording is an `[x]` at review, not an open `[~]` | Approved AS AUTHORED: changing one of the 12 is now a question. The two *false* hints are NOT covered (replacing approved text is still a reword). Detail: SPEC-003 §Questions |
| ~~Q33~~ ANSWERED 2026-08-21 — **"เปิด ดูไฟล์ .bru ก่อน จะเห็น docs ข้างใน"**: the docs are INSIDE the `.bru` files, not on Bruno's website | @Sober, to transcribe into TASK-014 §Questions alongside Q-SA-18 | **Verified, not relayed:** all 8 `.bru` carry a `docs { … }` block, written in Thai. No internet fetch is asked for. Detail: REQ-001 §Questions |
| ~~Q32~~ ANSWERED 2026-08-21 — **"ใช่หากมันดีขึ้นต่อการใช้งานก็จัดการเลย"**: yes, **conditional on usability** | closed — REQ-004 Req 7c hold RELEASED → **7d**; **@Sober: TASK-020's ceiling moved and the freeze may be released wider** | Condition carried, not dropped: the TASK that changes a REQ-001-named behaviour writes down **why it is easier to use**. Two things NOT read into it (Req 7e, held, blocks nobody): the **sanitizer** (not named in the question he answered) and the **PAT rules** (safety, not usability). Detail: REQ-004 §Questions |
| EVIDENCE HAND-OVER (open) — TASK-014 Run A + Run B output pasted into the real `project-docs/` | human; Porter relays. **RE-GATED 2026-08-21 at the Phase A review: the sheet does not leave until D1/D2 are fixed** — as written it names a folder that does not exist | Blocks TASK-014 Phase B only. Detail: TASK-014 §Review |
| ~~Q-BE-14~~ ANSWERED 2026-08-21 — **ruled (b), indirect proof, BOUNDED** | closed — Phase B DoD amended; `finished_at` stays off the wire | Proves `finishDone` + `finishFailed`; **`finishNoCommits` unproven**. (c) refused as invented scope → parked candidate 12. Detail: TASK-014 §Questions |
| ~~Q-BE-13~~ ANSWERED 2026-08-21 — **keep `REPO_AUTH_FAILED`; the TASK text was Sober's error and is corrected** | closed — sheet unchanged | Unresolvable-host alternative refused: it swaps real coverage for a literal string. Detail: TASK-014 §Questions |
| ~~Q-BE-15~~ ANSWERED 2026-08-21 — accepted; DoD line was Sober's to fix and is fixed | closed — sheet unchanged | Phase B now also judges **tier stability across `AI_COMMITS` batches**. Detail: TASK-014 §Questions |
| ~~Q-BE-16~~ NOTED 2026-08-21 — no answer owed | closed | No new scope (`pat` is already optional). If Run A needs a PAT, that settles REQ-001 Q8 as a side effect. Detail: TASK-014 §Questions |
| ~~Q24~~ **CLOSED BY PORTER 2026-08-21** — "ไม่เข้าใจเลยมันคืออะไรวะ ตัวนี้" (second time he has said so) | closed — no third round goes to the human; @Sober still owns the TASK-009 re-scope | Porter withdrew his own question rather than re-word it again: it is about an internal artifact he has never been shown. Working arrangement stands (team writes the click-through script, he runs the eleven UI runs, no team database) — commits nothing today, grants no database, reversible by one line. Detail: REQ-001 §Questions |
| ~~Q-FE-16~~ ANSWERED 2026-08-21 — ruling **(a)**: what Fern shipped stands, `@mantine/dates` is NOT installed | closed — **SPEC-002 Decision 3.4 withdrawn instead** | Peer dep `dayjs: '>=1.0.0'` re-verified by Sober with `npm view`; `dayjs` is one of the four Q-SA-12 declined. The SPEC's premise was Sober's and was false. Detail: TASK-012 §Review |
| ~~Q-FE-17~~ ANSWERED 2026-08-21 — not a TASK-012 defect, gate 3 `[~]` accepted; Fern was right not to patch a shared rule | closed as a TASK-012 item → **Sober's parked queue item 11** | Sober read Mantine's own stylesheet: the error rule (0-4-0) outranks the default (0-3-0) and no app rule overrides it, so the cascade is sound on paper → weight shifts to "measurement artefact". Falsification method written into TASK-013 as optional. Detail: TASK-012 §Review |
| ~~Q-FE-18~~ NOTED 2026-08-21 — no answer owed | closed | Position for TASK-013 stated: measure everything, capture nothing; do not spend time on `screenshot`. Detail: TASK-012 §Review |
| ~~Q-FE-19~~ ANSWERED 2026-08-21 at the TASK-013 review — **design, not copy; numerals stay, nothing goes to the human** | closed — ruled from written rules, not escalated | Q14/freeze-10 govern strings (added/removed/reworded); a derived, language-invariant, `aria-hidden` numeral is none of those, and Q16 authorised the redesign whose acceptance is his own eyes (Q-SA-15/Q23). Scope of the ruling bounded in the answer. Detail: TASK-013 §Questions |
| ~~Q-FE-17 artefact hypothesis~~ FALSIFIED 2026-08-21 by TASK-013's free probe | @Sober — parked item 11 stays open, now with a next probe | Same node: `--input-bd` = danger, painted border = `rule-strong`. Not a wrong-element error. Unscanned: the logical-property longhands. No fix shipped. Detail: TASK-013 §9 |
| ~~STANDING FE RULE amendment~~ ADOPTED 2026-08-21 at the TASK-013 review — Fern is right | closed — rule now reads: set `API_PROXY_TARGET` **before `npm run build`**, and re-confirm through Next before the first request | Next bakes `rewrites()` into `.next/routes-manifest.json` at BUILD time, so confirming before `next start` is already too late. Manifest verified back at `localhost:8080`, `.env.production.local` deleted. Detail: TASK-013 §4 + §Review |
| ~~Q25~~ ANSWERED 2026-08-21 — **"ค" = committer becomes a loaded list too**, field NOT removed | closed — REQ-004 Requirement 6; REQ-001 Req 4.3 survives | Reverses the second half of REQ-001 Req 4.6. Where the list comes from is Sober's design call. Detail: REQ-004 §Questions |
| ~~Q26~~ ANSWERED 2026-08-21 — **"ก" = team's own judgement, his eyes are the test** | closed as asked → REQ-004 Requirement 7; the unanswered half re-asked as **Q31** | Same arrangement as Q16. Scope held to the two named screens meanwhile (Req 7a). Detail: REQ-004 §Questions |
| ~~Q27~~ ANSWERED 2026-08-21 — **"ไปต่อไม่ได้เลย"**: no list, no continuing; no typed fallback | closed — REQ-004 Requirement 1a | Private repo is unusable until the token is entered — that is what he asked for. New wording still needs his yes/no (Q14). Detail: REQ-004 §Questions |
| ~~Q28~~ ANSWERED 2026-08-21 — **`today → today`, 366-day cap stays** | closed — REQ-004 Requirement 2a | Detail: REQ-004 §Questions |
| ~~Q29~~ ANSWERED 2026-08-21 — **"มีค่าเดิม"**: back keeps the submitted values | closed — REQ-004 Requirement 4a | Still no report-history screen (REQ-001 Req 12) — read narrowly. Detail: REQ-004 §Questions |
| ~~Q30~~ ANSWERED 2026-08-21 — **"โค้ดล่าสุด … แต่การทำงานก็ตามที่ฉันแจ้งไป"** | closed — **redesign NOT rejected; also NOT accepted**, REQ-003 stays `IN_SPEC` | He described code he has seen, not a verdict on the screens; TASK-016 still produces that verdict. Detail: REQ-004 + REQ-003 §Questions |
| ~~Q31~~ ANSWERED 2026-08-21 — **"ทุกหน้า แก้พฤติกรรมได้ด้วย"**: every screen, behaviour too | closed — REQ-004 Req 7a hold released → Req 7b; **@Sober: this widens what SPEC-002's freeze must release** (items 1/4/5/6/7/8 now in reach, not just item 3) | Copy unchanged (Q14 stands); "every screen" = the screens that exist, not new ones. Detail: REQ-004 §Questions |
| ~~Q-BE-19~~ ANSWERED 2026-08-21 at the TASK-017 review — **`email` is always present and always a string; `""` when the commit has none** | closed — recorded in **SPEC-003 §API + TASK-018** so Fern reads it in her own files | A wire shape, not copy → Sober's call, not the human's. Consequence stated: e-mail-less commits group by **name**, so two same-named people with no e-mail merge into one row. Q-BE-17 + Q-BE-18 both ruled "keep what was shipped" → one parked tidy-up. Detail: TASK-017 §Questions + §Review |
| ~~Q-FE-20~~ ANSWERED 2026-08-21 at the TASK-019 review — **KEEP the second writer** | closed — nothing to revert | Sober's preferred shape cannot write what the page does not yet have; her falsification stands. Bounded: authorises the submit-path writer only. Detail: TASK-019 §Questions |
| ~~Q-FE-21~~ ANSWERED 2026-08-21 — **the handoff lives until the next form mount consumes it; `SessionProvider` stays untouched** | closed — no change shipped | Six non-secret user-typed values, one tab, one reader, no PAT. Two limits written into the answer (a non-user-input field re-opens it; TASK-018 must treat a restored branch as a *pending* selection). Detail: TASK-019 §Questions |
| ~~Q-FE-22~~ NOTED 2026-08-21 — no answer owed | closed → carried into TASK-020 | `onTryAgain`'s `(failed: ReportJob) => void` signature is cosmetic; not a reason to open `ReportResult.tsx`. Detail: TASK-019 §Questions |
| ~~Q-SA-20~~ TRANSCRIBED + RULED 2026-08-21 into SPEC-003 §Questions + TASK-018 §5 | closed — Fern's to build inside TASK-018 | **My costing was wrong:** the API's `params` has six keys and `extraContext` is not one, so only the form-side writer can produce it and the report-side rewrite must not destroy it (mechanism = Fern's). Adding it to the API is NOT the answer. Freeze item 4 gains a 4th clause. Detail: SPEC-003 §Questions |
| ~~Q-FE-23~~ ANSWERED 2026-08-21 at the TASK-018 review — **the conflict is mine; carried-in item 3 is SUPERSEDED by §5** | closed — nothing to move | Her `Omit<>`-based mechanism is kept as shipped. One consequence recorded: a **second round trip** (Back → Forward → Back) empties the extra-context box — accepted, carried into TASK-020. Detail: TASK-018 §Questions |
| ~~Q-FE-24~~ ANSWERED 2026-08-21 — **keep the deferred committer**; both "fixes" examined and refused | closed → carried into TASK-020 under Req 7d | Auto-loading is a clone nobody asked for (Decision 2.2); a synthetic option ships an `author` matching nobody. Named as a deliberate gap against Req 4a. Detail: TASK-018 §Questions |
| ~~Q-FE-25~~ ANSWERED 2026-08-21 — **neither string nor code is wrong; nothing changes** | closed → parked queue item 16 | The hint describes *counting* (`REPORT_TIMEZONE` = Asia/Bangkok, verified in the backend); §2's "today" is the pre-filled *default* only. Divergence is one day, in a default, on a browser nobody here uses. Detail: TASK-018 §Questions |
| ~~Q-FE-26~~ ANSWERED 2026-08-21 — **keep `back: 0/6/29`**; presets are inclusive of today | closed — decision recorded | The label carries a number, so the range must contain that many days. Detail: TASK-018 §Questions |
| ~~FE probe reached port 8080 (2nd occurrence, TASK-018)~~ CLOSED 2026-08-21 at the review | closed — no action | One unauthenticated `POST /api/repos/branches`, rejected `AUTH_REQUIRED`; no database, no SQL, nothing written, nothing to undo. Standing FE proxy rule was honoured and the env restored. Detail: TASK-018 §7.1 + §Review |
| DEPLOYMENT NOTE — cookie `Secure` needs https + `NODE_ENV=production` | whichever TASK first deploys | No deployment TASK exists yet; parked so it is not lost. Origin: Q-BE-3 answer in TASK-002 |

## Sober's parked queue (state, one unit per session; detail at the pointers)

0. ~~TASK-009 split~~ · ~~SPEC-002 transcriptions + the two missing TASK lines~~ ·
   ~~Q-SA-16 → TASK-014~~ **all CLOSED 2026-08-21** (TASK-014 re-scoped into
   Phase A/B and moved to `TODO`). ~~**REQ-004 → `IN_SPEC` + SPEC-003**~~
   **CLOSED 2026-08-21** — SPEC-003 is `ACTIVE` and SPEC-002 freeze items 1 + 4
   are released for it. ~~**write TASK-017…020**~~ **CLOSED 2026-08-21 — all four
   files written, 017 + 019 startable.**
   ~~**review TASK-019**~~ **CLOSED 2026-08-21 — `DONE` at `32e8eed`, TASK-018 startable.**
   ~~**Q-SA-19 + Q-SA-20 → SPEC-003**~~ **CLOSED 2026-08-21 — both transcribed,
   ruled, and Q-SA-20's work written into TASK-018 §5 + DoD.**
   ~~**review TASK-018**~~ **CLOSED 2026-08-21 — `DONE` at `f70fb02`; TASK-020 is
   startable and is the last SPEC-003 TASK.**
   **New TOP: Q-SA-18 → TASK-014** (Bruno + Q33's "docs are inside
   the `.bru` files"; verbatim in REQ-001 §Questions; re-format vs
   replace is mine), then **Q-SA-17 → TASK-016**
   (transcribe + move + re-scope the hand-over, now that he starts the backend
   too), then **the Q32/Req 7d freeze widening → TASK-020** (added 2026-08-21:
   7c is released, so how much further SPEC-002's freeze opens and what TASK-020
   is allowed to change is an unwritten design unit; 7e keeps the sanitizer and
   the PAT rules out of it and Q14 keeps copy out of it — nothing is blocked,
   TASK-018 comes first anyway), then **TASK-009's re-scope** on Q24's recorded
   recommendation.
1. TASK line for the flaky auth test (1-in-20 tampered-token false pass).
   Evidence: TASK-003 §Review — rework pass.
2. Decide if the two swallowed git-layer failure paths get SPEC-001 error codes
   (worker-side rule already bound into TASK-005 item 6). Origin: TASK-003 review.
3. TASK-001 DoD review call — migrate/seed evidence in
   `../project-docs/db-migrate-seed-run-2026-08-20.md` and
   `../project-docs/seed-users-run-2026-08-21.md` (caveats: no exit code printed;
   `updated`, not `created`).
4. Whether TASK-005's dummy-token PAT-grep evidence uses that same database.
5. ~~KnowCode TASK line~~ CLOSED 2026-08-21 — folded into TASK-011 by SPEC-002
   (name only; nothing else reworded, Q14).
6. Query-string secret in repo URL (`?token=…` stored/echoed/written to
   `.git/config`) — SPEC-001 line before TASK line. Origin: TASK-005 review 2026-08-21.
7. Q-SA-11 answered (b): distinct th/en sentence for credentialed-URL
   `INVALID_URL` — one string pair + `ValidationIssue`; wording comes back to the
   human for yes/no (Q-SA-4 precedent).
8. TASK lines for Reqs 16/17/18 (16 = BE, also adds the "reproduce dates exactly"
   rule to `stage2System` per TASK-004 review; 17/18 = FE).
9. One SPEC-001 error-table amendment covering Q-BE-10 (`REPORT_NOT_FOUND`) +
   Q-BE-12 (refused private host row) + the implementing BE TASK line.
10. Candidate (ranked last): per-run nonce delimiter for `REPO_CLOSE` blocks.
    Origin: TASK-004 review.
11. **(Q-FE-17) — the artefact hypothesis is FALSIFIED 2026-08-21**, so this is a
    real rendering question, not a mis-read element: the same node carries
    `--input-bd: danger` and paints `rule-strong`. **Next probe, named by Fern
    and not yet run:** his scan matched rules declaring `border` / `border-color`
    / `border-top-color` and **not** the logical-property longhands
    (`border-block-start-color`, `border-inline-*`) — a rule using one would be
    invisible to it and would explain everything. Still ranks below the SPEC-002
    transcriptions and the two missing TASK lines: nothing is blocked, and the
    error is already carried by icon + words + `aria-invalid`, never by colour
    alone. Origin: TASK-012 review; evidence TASK-013 §9.
12. **(Q-BE-14, candidate) Should `finished_at` be readable through
    `GET /api/reports/:jobId` at all?** The application writes it on all three
    terminal transitions (`finishDone`/`finishNoCommits`/`finishFailed`,
    `src/reports/jobs.ts`) and the column exists in `001_init.sql`, but it is in
    no `SELECT`, no type and no wire shape — so no consumer can ever see it.
    **Nothing is blocked and nothing asks for it** (REQ-001/SPEC-001 never
    request a finish time), which is exactly why it is a candidate and not work:
    adding it now would be scope invented to tidy an evidence line. Ranks below
    everything above it. Origin: TASK-014 Phase A review 2026-08-21.
13. **Standing lesson from the same review, cheaper than a rule:** `../project-docs/`
    is workspace shorthand that is correct between roles and **wrong the moment
    it is handed to someone standing in a different directory**. Any future
    artifact meant for the stakeholder's own hands carries **absolute paths**.
14. **(TASK-017 review) The inspection clone is UNBOUNDED — a SPEC-003 decision
    before it is a TASK line.** `POST /api/repos/committers` does a full
    metadata-only clone per request with **no semaphore**, while the worker's
    clones run behind `Semaphore(config.MAX_CONCURRENT_JOBS)` (default 2). N
    authenticated requests = N `git` processes + N temp dirs. **The gap is mine:
    SPEC-003 never named a limit**, and the fix is a choice between three
    answers (share the worker's semaphore / a separate inspection bound / a new
    config key — which TASK-017 forbade), so it is not a one-line rework.
    Nothing is blocked; every request still cleans up after itself. Ranks below
    anything that unblocks a person, above item 15.
15. **(Q-BE-17 + Q-BE-18, one candidate, ranked last) Relocate
    `classifyRunFailure` (out of `reports/worker.ts`) and the duplicated
    `renderIssues` into `src/errors/`,** in one TASK that owns both files.
    Cosmetic by measurement: neither holds a bound, and the duplicate delegates
    every word to `fieldMessage`. Origin: TASK-017 review 2026-08-21.
16. **(Q-FE-25, candidate, ranked last) Which day should the period pre-fill on a
    browser that is not on the Asia/Bangkok day?** The form's default is the
    **browser's** calendar day (`todayIso()`), while the dates are **counted**
    in `REPORT_TIMEZONE` = `Asia/Bangkok` (`config.ts:81`, `commits.ts:103-107`)
    — which is what the approved `reports.new.date.hint` says, truthfully. So the
    two can disagree by one day, in the **default value only**; the two dates go
    on the wire exactly as shown, so no submission is ever wrong. **Nobody on this
    project is on such a browser**, which is why this is a candidate and not work
    — and the fix would be a question to the human, not a decision of mine.
    Origin: TASK-018 review 2026-08-21.

## Facts parked during compaction 2026-08-21

- **ID desync (bookkeeping, numbering stays as-is):** REQ-002 is
  reserved-but-unwritten (email feature) and **SPEC-002 pairs with REQ-003**,
  not REQ-002. Recorded here to prevent future confusion; no renumbering.
- Everything removed in this compaction (session narratives, answered-question
  histories, review evidence prose) exists verbatim in
  `archive/board-2026-08-21-pre-compaction.md`, in the daily logs, and in the
  TASK/REQ/SPEC files' own sections.
