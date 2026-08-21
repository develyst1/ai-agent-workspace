# SPEC-003: New-report form usability (loaded branch + committer lists, one date range) + back from the report page
- Source: REQ-004
- Status: ACTIVE
- Written: 2026-08-21 by Sober (SA Lead)

## Overview

REQ-004 is the first requirement on this project that **cannot be built in the
frontend alone**. Three of its seven requirements (1, 1a, 6) ask the tool to
*read a repository before a job is submitted*, and the tool has never contacted
a repository outside the worker. So this SPEC has two halves:

1. **Backend — a new read-only "repository inspection" surface**
   (`POST /api/repos/branches`, `POST /api/repos/committers`). No new table, no
   job row, no AI call, no persistence of any kind.
2. **Frontend — the form is re-shaped around those lists** (branch chosen from a
   list, committer chosen from a list, one date range, today → today), plus a
   way back from the report page that lands on the form with the submitted
   values still in it.

REQ-004 Requirement 7 (the wide "find and fix usability yourselves" licence,
widened by Q31 to every screen and to behaviour) is carried as its **own, last**
TASK and is deliberately **not** used to release anything else in SPEC-002's
freeze — see "What this SPEC releases from SPEC-002's freeze", below.

## Ground truth — measured 2026-08-21, not assumed

Read from the real code: `code-report-back` at `4101551`, `code-report-front` at
`1f90b87`, both clean.

- **The backend has no endpoint that reaches a repository.** `src/index.ts`
  mounts exactly `GET /api/health`, `/api/auth/*` and the two `/api/reports`
  routes. Everything git happens inside `src/reports/worker.ts`, after a job row
  exists.
- **The git layer already has the pieces this needs, and they are safe by
  construction:** `assertSafeRepoUrl` (scheme + userinfo + private-host gates),
  `buildCloneArgs` (`credential.helper=`, `core.askPass=`, the PAT as
  `http.extraHeader`, never in the URL), `runGit`'s redactor, and
  `readCommits(..., { includeDiffs: false })`, which already returns
  `authorName` / `authorEmail` per commit without any `git show`.
- **There is no `git ls-remote` wrapper today.** `src/git/` has `clone`,
  `commits`, `tree`, `markdown`, `redact`, `run`, `cleanup`, `urlSafety`.
- **`POST /api/reports` accepts `branch` and `author` as optional free text**
  (`src/reports/validate.ts`) and `--author` is matched with
  `--fixed-strings --regexp-ignore-case` against name *or* email
  (`commitLogArgs`). **The wire contract therefore does not have to change at
  all** for Requirements 1 and 6 — what changes is how the frontend obtains the
  two values it already sends.
- **The cause of "หน้า report กดย้อนกลับไม่ได้" is one line, and it is ours:**
  `NewReportContent.tsx:169` navigates with **`router.replace(reportPath(jobId))`**,
  which *overwrites* the form's history entry, so the browser's own Back button
  cannot return to it. `ReportViewContent.tsx:62` already uses `router.push` for
  "try again". Requirement 4 is not a missing feature so much as a `replace`
  that should be a `push` plus a visible control.
- **The "back with my values" mechanism already exists**:
  `lib/storage/retryParams.ts` — a one-hop `sessionStorage` handoff written on
  click and removed as it is read, whose payload type **has no `pat` key**.
- The form's date fields are two `TextInput type="date"` controls; the repo has
  **no date-picker dependency** and SPEC-002 Decision 3.4 authorises **none**.

## Decision 1 — the branch list is `git ls-remote`, not a clone

`POST /api/repos/branches` runs **`git ls-remote --symref --heads <url>`** with
the same argv discipline as the clone, and **never creates a directory**.

- It is the only way to enumerate branches without downloading history; a clone
  to list branch names would cost minutes for a result the user needs in seconds.
- `--symref` also yields `HEAD`'s target, which gives the form a **default
  selection** for free (the repository's own default branch) instead of making
  the user hunt for `main` in a list of two hundred.
- **Failure mapping reuses `classifyCloneFailure` unchanged** — the stderr
  shapes are the same ones (`authentication failed`, `not found`, `403`, `does
  not appear to be a git repository`). **No new error code and no new backend
  string.** A 404 stays `REPO_AUTH_FAILED` (Q-BE-5, Q-BE-13).
- **Timeout: 30 s** (`LS_REMOTE_TIMEOUT_MS`), not the clone's 10 minutes. A form
  field may not hang for ten minutes; the existing `CLONE_TIMEOUT` code and
  message ("too large or too slow") describe the outcome correctly, so this too
  needs no new code.
- An empty result (a repository with no branches) is **not** an error at the
  transport level: `200 { branches: [], defaultBranch: null }`. The *form* then
  refuses to continue, per Requirement 1a — that is a screen rule, not an HTTP
  one.

## Decision 2 — the committer list is a metadata-only clone, on demand, scoped to the chosen range

`POST /api/repos/committers` clones exactly as the worker does
(`--filter=blob:none --single-branch --branch <branch>`), runs
`readCommits(dir, { …, includeDiffs: false })` over the **selected window**, and
deletes the directory in a `finally` (`withClone`). It returns the distinct
committers with a commit count each.

Four judgements, with their reasons, because each of them is reversible and none
of them is in REQ-004:

1. **Scoped to the chosen date range, not to the whole branch.** The report is
   range-scoped, so a whole-history list would offer people who produced nothing
   in the period and hand the user a guaranteed `NO_COMMITS` run. The cost is
   that changing the dates invalidates the list.
2. **Loaded on demand, never automatically.** The clone is the expensive part of
   a report run, and Requirement 3/5 say this screen must get *easier*; a form
   that silently spends a minute cloning before it will let you type is worse
   than the one he is complaining about. The committer field therefore opens on
   **"everyone"** — which is exactly REQ-001's accepted empty-`author` behaviour
   — and only fetches when the user asks for the list. Requirement 6 is "he picks
   instead of typing", and it is honoured by the picker existing, not by it being
   pre-warmed.
3. **The value sent as `author` is the committer's e-mail when there is one,
   else the name.** `--author` is `--fixed-strings`, so an e-mail is the
   narrowest unambiguous needle; two humans share a display name far more often
   than an address.
4. **Timeout 120 s** (`INSPECT_CLONE_TIMEOUT_MS`), again mapped to the existing
   `CLONE_TIMEOUT`. The worker's 10-minute budget belongs to a run the user is
   already watching a progress bar for; a form control does not get ten minutes.

**Rejected alternative, recorded so it is not re-proposed:** reading committers
from the GitHub/GitLab REST API. It is provider-specific, it is a second
authentication surface for the PAT, and this project contacts exactly one
external service by design (AI API CENTER). A `git` clone we already know how to
do safely beats an integration nobody asked for.

**Deliberately NOT invented: a cache.** Nothing in REQ-004 asks for one, no
requirement names a response time, and a cache keyed by repository is a store of
who-works-on-what that would outlive the request. If the wall-clock cost turns
out to bite in real use, that is a new requirement with evidence behind it.

## API / Interface Design

Both endpoints sit **behind the existing session gate**: `src/index.ts` gains
`app.use("/api/repos", requireSession)` and `app.use("/api/repos/*",
requireSession)` **before** the routes are mounted, exactly as TASK-002 did for
`/api/reports`. Envelope, `Accept-Language` handling and error text are
SPEC-001's, unchanged — the frontend never composes error text from a code.

### `POST /api/repos/branches`

```
Request   { "repoUrl": "https://…", "pat": "…"? }
200       { "branches": ["main", "develop", …], "defaultBranch": "main" | null }
400       VALIDATION_ERROR  { fields: { repoUrl: "…" } }
401       AUTH_REQUIRED
502       REPO_AUTH_FAILED | REPO_NOT_FOUND | CLONE_FAILED | CLONE_TIMEOUT
```

- `branches` are short names (`refs/heads/` stripped), in git's own order, no
  de-duplication needed.
- `repoUrl` is validated by the **same** `parseRepoUrl` the report body uses, so
  a URL carrying userinfo is rejected here too (TASK-005's fix inherits).
- **502** is the status for "the remote answered badly"; it is the same shape and
  the same codes SPEC-001 already stores on a failed run, so the frontend renders
  `error.message` verbatim with no new mapping.

### `POST /api/repos/committers`

```
Request   { "repoUrl": "…", "pat": "…"?, "branch": "main",
            "dateFrom": "YYYY-MM-DD", "dateTo": "YYYY-MM-DD" }
200       { "committers": [ { "name": "…", "email": "…", "commits": 12 }, … ] }
400       VALIDATION_ERROR   — same field rules and the same ≤366-day span
401       AUTH_REQUIRED
502       BRANCH_NOT_FOUND | REPO_AUTH_FAILED | REPO_NOT_FOUND | CLONE_FAILED | CLONE_TIMEOUT
```

- `branch`, `dateFrom`, `dateTo` are **required** here (unlike `POST
  /api/reports`, where `branch` is optional): the list has no meaning without
  them.
- **The span and date rules are the report's, re-used, not re-implemented** —
  `parseCalendarDate`, `DATE_ORDER`, `SPAN_TOO_LONG` at 366. A second copy of
  the bound is how two bounds drift apart.
- Sorted by `commits` descending, then `name` ascending — a stable order the
  user can rely on, and the person who did the most work first.
- **`email` is always present and always a string (added 2026-08-21, Q-BE-19).**
  A commit with no author e-mail yields **`email: ""`** — never an omitted key
  and never `null`, so a consumer has one shape and one test. Those commits are
  grouped by `name` instead, and the value the form then sends as `author` is
  `email === "" ? name : email` (Decision 2.3, unchanged).
- **Merges are excluded**, because `commitLogArgs` passes `--no-merges` and this
  list must contain exactly the people the report can then find.

### `POST /api/reports` — unchanged

No field is added, removed or re-typed. `branch` and `author` keep their current
optional free-text contract; the frontend simply now fills them from a list.
**This is the whole reason REQ-004 needs no SPEC-001 contract change.**

## Data Model

**No migration. No new table, no new column, nothing written.** The inspection
endpoints read a remote, answer, and delete their temp directory. `report_jobs`
is untouched.

## Non-functional

- **PAT handling (SPEC-001 §"PAT handling", all 7 rules) applies verbatim to both
  new endpoints**, and each is honoured the same way it is in the worker: body
  only (rule 1), request-lifetime memory only (2), never persisted (3),
  `http.extraHeader` never the URL (4), redactor on every line of git output (5),
  **request-body logging off for `/api/repos/*`** (6). Rule 7's acceptance grep
  covers these paths too.
- **One observable consequence, stated rather than discovered:** the token now
  crosses the wire **once per list load** as well as once per submit. This is not
  a change to any rule REQ-001 named — it is the direct consequence of **Q27**
  ("no list, no continuing"), which makes a private repository unusable until the
  token is entered *before* submit. The token is held in the form's React state
  only, is never written to `sessionStorage`, and is still never prefilled
  (SPEC-002 freeze item 6 holds).
- Both endpoints inherit `ALLOW_PRIVATE_GIT_HOSTS` and the DNS gate. No config
  key is added.
- Backend gates unchanged: `bun run typecheck` exit 0, `bun test` green, clean
  tree at the reported commit. New tests come with the new module.
- Frontend gates unchanged: SPEC-002's Decision 3 rules (Mantine-first, zero
  Tailwind colour/font utilities, `globals.css` is the token block),
  `FRONTEND-STANDARD` §3, `hallmark audit` pasted before `REVIEW`, **and no new
  dependency** (SPEC-002 Decision 3.4 — so the date range is built from
  `@mantine/core` + `TextInput type="date"`, not from `@mantine/dates`).

## Flow — the re-shaped form

Field order and gating (Requirement 1a is a *screen* rule and this is it):

1. **Repository URL** — always enabled.
2. **Private repository toggle + access token** — as today; the token is what
   makes step 3 possible for a private repo.
3. **Load branches** — an explicit action, not a fetch on every keystroke.
   - success → the branch `Select` fills, **pre-selected to `defaultBranch`**,
     and steps 4–7 unlock;
   - failure → the server's own message is shown and **steps 4–7 stay locked**;
     there is no typed-branch escape hatch (Requirement 1a, Q27);
   - empty list → the same locked state with its own line.
4. **Branch** — a `Select`. Not editable, not creatable.
5. **Period** — **one** date-range control, pre-filled **today → today**
   (Requirement 2a), two `TextInput type="date"` inputs presented as one range,
   plus a small row of relative presets. The ≤366-day rule and the `YYYY-MM-DD`
   wire values are **unchanged**; the client-side bound must stay *exactly* the
   server's exclusive one (366 accepted, 367 rejected).
   **The single-day / range switch is deleted outright** (Requirement 2).
6. **Committer** — a `Select` defaulting to "everyone", with a "load the list"
   action (Decision 2.2). Leaving it on "everyone" sends **no `author` key**,
   which is REQ-001's accepted behaviour, untouched.
7. **Extra context, report language, submit** — unchanged.

**Submit is disabled until a branch has been chosen from a loaded list.**

## Flow — back from the report page

- `NewReportContent` navigates with **`router.push`**, not `router.replace`, so
  the browser's own Back button works. *(This alone is most of Requirement 4.)*
- The report page carries an explicit **back control** as well — his sentence is
  about the report page, and relying on the browser chrome on a screen he called
  hard to use would be answering a usability complaint with a keyboard shortcut.
- **Back lands on the form carrying the values that produced the report**
  (Requirement 4a, Q29). Mechanism: the **existing** `retryParams` handoff,
  written from `job.params` on the way back — the same path "try again" already
  uses, so there is one prefill mechanism on this screen and not two.
  - **Clarified 2026-08-21 while writing TASK-019, because it is the part that
    can quietly fail:** `push` restores the *browser's* Back button, and browser
    Back remounts the form fresh — so a handoff written only on the on-screen
    control's click would give an empty form on the very affordance he
    complained about. **Both ways back must produce the same filled form**;
    the handoff must therefore not depend on which navigation was used. The
    mechanism is Fern's to choose (TASK-019), the outcome is not.
- **The extra-context box comes back too (Requirement 4b, Q-SA-20 = "เก็บด้วย",
  2026-08-21).** The handoff carries **seven** values, not six. **Measured
  constraint, not a preference:** the API's `params` has six keys and
  `extraContext` is not one of them, so **only the form-side writer can produce
  this value** and the report-page writer must not overwrite it away. Full
  reasoning and the ruling: `## Questions` → Q-SA-20. Lands in **TASK-018**.
- **The PAT is not restored** — `RetryParams` has no `pat` key and gains none
  (SPEC-002 freeze item 6, REQ-001's PAT rules). **Consequence, stated:** going
  back to a *private* repository's form means entering the token again before the
  branch list will reload. That is the intersection of two rules he approved
  separately (Q27 and the PAT rule), not a new decision of mine.
- **No report-history screen** (REQ-001 §12, REQ-004 Out of Scope). Back is one
  hop to the form, nothing more.

## What this SPEC releases from SPEC-002's behaviour freeze

**Bookkeeping correction first, because it is repeated in three places:** the
board and REQ-004 both call the form-fields freeze "item 3". In SPEC-002 the
form fields are **item 4**; item 3 is `RequireAuth`. This SPEC releases **item
4**, and item 3 stays frozen.

Released, and only this far:

- **Item 4, three clauses only** — (a) the **branch** becomes a loaded list
  instead of free text; (b) the **author/committer** becomes a loaded list
  instead of free text; (c) the two date fields become **one range control
  pre-filled today → today**, and the single-day / range switch is removed.
  **NOT released within item 4:** the ≤366-day span, the `YYYY-MM-DD` wire
  values, the PAT field's rules, and the report-language field.
- **Item 4, a fourth clause added 2026-08-21 by Q-SA-20 = "เก็บด้วย"** — (d) the
  **extra-context field's value is restored on the way back** from the report
  page. **This releases the field's *value on back* and nothing else about it:**
  its optionality, its 8000-character bound, its wire key and its label are
  unchanged and stay frozen. Released on the same basis items 2 and 4 were — an
  answer on file, not a judgement of mine.
- **Item 1, one clause only** — the transition into the report page changes from
  `replace` to `push`. **Routes and redirect rules are unchanged**; no path is
  added, removed or renamed.

~~**Everything else in the freeze stays frozen — including the items Q31 puts "in
reach".** The reason is written down rather than assumed: **Q32 is open**, and
REQ-004 Requirement 7c holds that behaviour REQ-001 explicitly named changes only
with the stakeholder's yes/no.~~ **STALE as of 2026-08-21 — Q32 is ANSWERED**
("ใช่หากมันดีขึ้นต่อการใช้งานก็จัดการเลย"), Requirement 7c is released → **7d**,
and the premise of the paragraph above no longer holds. Corrected here as a
statement of fact.

**What has NOT changed yet, stated so the correction is not read as a release:**
this SPEC still releases only item 4 (four clauses) and item 1 (one clause).
**How much further the freeze opens under 7d — and in what order — is one SA unit
of its own and is not done here**, because it is a design decision about
TASK-020's ceiling, not a transcription. Until it is written, TASK-018's
`## Boundaries` stand exactly as they are, and **TASK-020 has no new licence in
its file yet**. Two limits already fixed by Porter and carried forward whatever
that unit decides: **Requirement 7e** holds the **Markdown sanitizer** (freeze
item 7) and the **PAT rules** outside 7d, and **copy (item 10 / Q14) is
untouched** — Q32 authorised behaviour, not wording.

Everything else in the freeze therefore stays frozen for now — items 2, 3, 5
(polling), 6, 7 (sanitizer), 8 (`DD/MMM/YY`), 9 (th/en) and 10 (copy). If
TASK-018 finds something in those, it is still a question to me, the same way
freeze items 2 and 4 were released — by an answer on file.

## Tasks

**All four files are WRITTEN 2026-08-21** (`tasks/TASK-017…020`); the shapes below
are what they carry. **TASK-019 is deliberately first**: it is independent of the
backend, it is the smallest of the four, and it is the one complaint of his that
is currently a one-word fix.

- **TASK-019: FE — back from the report page** (depends on: TASK-013, `DONE`).
  `push` instead of `replace`, an explicit back control on the report page, and
  the `retryParams` prefill on the way back. Carries Requirement 4 + 4a.
- **TASK-017: BE — repository inspection endpoints** (depends on: —).
  `src/git/lsRemote.ts` + `src/repos/{routes,validate}.ts`, the session gate in
  `index.ts`, both endpoints above, tests for: userinfo rejected, PAT never in
  argv-URL and never logged, `classifyCloneFailure` reuse, the 366 bound, the
  temp directory deleted on success **and** on throw.
- **TASK-018: FE — the re-shaped form** (depends on: TASK-017, TASK-019).
  Branch `Select` + load action + gating, committer `Select` + on-demand load,
  one date range pre-filled today → today, switch deleted. Carries Requirements
  1, 1a, 2, 2a, 3, 6.
- **TASK-020: FE — Requirement 7 usability pass, every screen** (depends on:
  TASK-018). **Last on purpose.** ~~bounded by 7c: it may change what REQ-001
  never named, and it raises a question for anything REQ-001 did.~~ **7c is
  released → 7d (Q32, 2026-08-21):** REQ-001-named behaviour may now be changed
  **when the change makes the app easier to use, with that reason written in the
  TASK**. **The TASK-020 file has not been rewritten for this yet** — that edit
  is its own SA unit (see the freeze section). Its acceptance is the
  stakeholder's own eyes, like REQ-003's.

**Ordering against what is already in flight:** TASK-015 (Fern) and TASK-014
Phase A/B (Jason) keep their places — TASK-019 does not touch the login screen
and TASK-017 does not touch the report pipeline. **TASK-016's hand-over is
unaffected and should not wait for this SPEC**: it produces REQ-003's verdict on
screens this SPEC will then change again, which is exactly why it goes first.

## Questions

### Q-SA-19 — ANSWERED 2026-08-21 — "ok" = the 13 strings are approved AS AUTHORED

> answer (2026-08-21, human, via Porter, verbatim): "Q-SA-19 - ok"
>
> (Recorded in REQ-004 `## Questions` first, because Porter may not write in
> `specs/`; transcribed here by Sober 2026-08-21.)

- **What is approved:** the **13 user-facing strings** authored th/en in
  **TASK-018 (12)** and **TASK-019 (1)** — the branch load/loading/select/locked/
  empty lines, the three date presets, the "everyone" committer option with its
  load/loading/empty lines, and `reports.view.back` — **exactly as they are
  written in those two TASK files**. He read them and said ok.
- **What it does NOT do, so it is not read wider:** it does **not** re-open the
  Q14 copy bundle, and it does **not** pre-approve a string that does not exist
  yet. A new or reworded string appearing later still comes back for a yes/no
  (the Q-SA-4 / Q-SA-11 precedent, third use).
- **Consequence for the build: none, and that is by design** — nothing waited on
  it. TASK-018/019 keep the wording they carry. The one bookkeeping effect:
  **TASK-018's string table is now approved copy, so its wording is not an open
  `[~]` at review — it is an `[x]`**, and changing any of those 12 strings while
  building is a `## Questions` line, not a judgement call.
- **Still true and unchanged by this answer:** TASK-018's two *false* hints
  (`reports.new.branch.hint`, `reports.new.author.hint`) are **not** covered —
  they are existing approved strings, and *replacing* their text is still a
  reword under freeze item 10. Delete-if-redundant or ask; do not rewrite.

### ~~Q-SA-19 (original)~~ → Porter → the human (NON-BLOCKING for the build; BLOCKS acceptance of the wording)

**Copy, not design.** Q14 closed the copy bundle by approving every string **as
authored**, and this REQ unavoidably needs strings that did not exist then — the
branch list's load action and its "could not load, you cannot continue" line
(Q27's own consequence), the empty-branch-list line, the date presets, the
"everyone" committer option and its load action, and the back control's label.
There is no way to build Requirements 1a, 2, 3, 4 and 6 without new user-facing
text.

- **The precedent is Q-SA-4 / Q-SA-11:** the team authors the th/en pair, and it
  comes back to him for a **yes/no**, one round, not a discussion.
- **Ask him (in Thai, one line):** "ข้อความใหม่บนหน้าฟอร์ม (ปุ่มโหลด branch,
  ข้อความตอนโหลดไม่ได้, ตัวเลือกช่วงวันสำเร็จรูป, ตัวเลือก 'ทุกคน', ปุ่มย้อนกลับ) —
  ให้ทีมร่างมาให้พี่กด ok/ไม่ ok ทีเดียวตอนงานเสร็จ ใช่ไหมครับ?"
- **Why it does not block:** TASK-017/018/019 are built and reviewed against this
  SPEC either way; the strings are authored in the TASKs and the yes/no round
  happens when there is something to read.

### Q-SA-20 — ANSWERED 2026-08-21 — "เก็บด้วย" = YES, the extra-context box comes back too

> answer (2026-08-21, human, via Porter, verbatim): "Q-SA-20=เก็บด้วย"
>
> (Recorded in REQ-004 `## Questions` first — Porter may not write in `specs/`;
> transcribed here by Sober 2026-08-21, together with the design consequence,
> which is mine and not his.)

- **What it settles:** Q29's "มีค่าเดิม" **includes** the free-text extra-context
  field (REQ-001 Requirement 4.5). REQ-004 gains **Requirement 4b** and its
  acceptance criterion now names the box. Going back from a report must land on a
  form that still carries what the reader typed there.
- **What it does NOT authorise, held as Porter held it:** one field only. The
  **PAT** is untouched (never prefilled, sent once — REQ-004 Requirement 7e),
  **no new user-facing string** (Q14's bundle is not re-opened), and **no API
  contract changes**.

**My costing at the TASK-019 review was wrong, and the correction is the whole
technical content of this answer.** I wrote "one key in `RetryParams`, one line in
each of the two writers, one `setState`". Measured 2026-08-21 in the real code
(`code-report-back` `src/reports/jobs.ts:282` `jobResponse`, `code-report-front`
`src/types/api/main/report.ts:59` `ReportParams`):

- **`GET /api/reports/:jobId` returns `params` with exactly six keys** — `repoUrl`,
  `branch`, `author`, `dateFrom`, `dateTo`, `language` — and `extraContext` is
  **not** one of them. It is stored (`report_jobs.extra_context`) and used by the
  AI stages, but it never reaches the wire.
- Therefore **the report-page writer cannot source this value at all.**
  `ReportViewContent.tsx:81` builds its payload from `job.params`; there is
  nothing in `job.params` to build it from.
- And because that writer calls `writeRetryParams` with a **whole** payload,
  `sessionStorage.setItem` **overwrites** what the form-side writer stored — so a
  naive "add the key to the form-side writer only" ships a value that is silently
  destroyed by the next poll-driven rewrite. This is exactly the failure Q-FE-20's
  second writer exists to prevent, now working against us.

**The ruling, so nobody has to re-derive it:**

1. **`RetryParams` gains one key, `extraContext: string`.** No `pat`, still.
2. **Only the form-side writer can populate it** (`NewReportContent`, from the
   submitted body, immediately before `router.push`).
3. **The report-page writer must not destroy it.** The *outcome* is binding — a
   payload rewritten from `job.params` still carries whatever extra context the
   form put there — and the **mechanism is Fern's to choose**, the same way
   TASK-019's handoff mechanism was hers. (A read-merge-write, or a writer that
   only touches the six keys it owns, both satisfy it; I am not naming which.)
4. **Adding `extraContext` to the API's `params` is explicitly NOT the answer.**
   It would be a SPEC-001 contract change, which Q-SA-20 does not authorise, and
   it would put an 8000-character free-text field on every poll response.
5. **The reader tolerates its absence.** `takeRetryParams` already coerces a
   missing string key to `""`, so a payload written before this change (or by a
   tab that never had the field) restores an empty box rather than failing.

- **Where it lands: TASK-018**, which already opens the form — §5 "Coming back
  from a report", plus one DoD row. **Nothing was blocked and nothing is
  unblocked**: TASK-018 was startable before this answer and is startable now.
- **Bound worth stating once:** the handoff now carries up to
  `MAX_EXTRA_CONTEXT_CHARS` = 8000 UTF-16 code units of user text in
  `sessionStorage`. Same tab, same origin, removed as it is read, non-secret by
  definition (it is prose the user wrote for the report). `writeRetryParams`
  already swallows a quota failure and opens an empty form.

### ~~Q-SA-20 (original)~~ → Porter → the human (NON-BLOCKING — raised 2026-08-21 at the TASK-019 review)

**Does "back keeps his values" (Q29, "มีค่าเดิม") include the free-text context
box?**

- **The measured fact:** the handoff carries **six** values — repository URL,
  branch, committer, both dates and the report language. The form's free-text
  extra-context field (REQ-001 Requirement 4.5) is **not** in it, so going back
  from a report loses whatever the reader typed there. This is not a defect Fern
  introduced: the payload shape predates REQ-004 (it was TASK-008's "try again"
  handoff) and **TASK-019's own DoD enumerated exactly the five fields she
  restored** — the gap is in what I specified.
- **Why it is a question and not my decision:** Q29's answer is one Thai phrase
  about *values*. Reading it as "the whole form" and reading it as "the run's
  parameters" are both honest readings, and free text is the single most
  expensive thing on that form to retype — so guessing costs the stakeholder
  either work he did not ask for or a re-typed paragraph.
- **Ask him (in Thai, one line):** "ตอนกดย้อนกลับจากหน้ารายงาน ให้เก็บ 'ข้อมูล
  เพิ่มเติม' (ช่องพิมพ์ข้อความยาว) กลับมาด้วยไหมครับ — ตอนนี้เก็บให้เฉพาะ URL,
  branch, ผู้เขียน, ช่วงวันที่ และภาษารายงาน"
- **Cost of a "yes":** one key in `RetryParams`, one line in each of the two
  writers, one `setState` in the form's mount effect. **No new string, no API
  change, no new dependency.** It lands in **TASK-018**, which already opens the
  form; nothing waits on the answer, because TASK-018 is startable and its other
  work is unaffected.
- **Cost of a "no":** zero — what is shipped is already the "no" answer.

*(Jason/Fern ask here; Sober answers as `> answer: ...`.)*
