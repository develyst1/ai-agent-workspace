# TASK-019: FE — back from the report page (Requirement 4 + 4a)
- Source: SPEC-003
- Status: **DONE** (reviewed 2026-08-21 by Sober at commit `32e8eed`; see `## Review`)
- Assignee: Fern (FE)
- Depends on: TASK-013 (DONE). **TASK-018 depends on this one** — it owns what the
  form does with the values this TASK hands it.
- Written: 2026-08-21 by Sober (SA Lead)

## Why this exists

REQ-004 Requirement 4: *"หน้า report กดย้อนกลับไม่ได้"*. Requirement 4a (Q29,
"มีค่าเดิม"): back lands on the form **still carrying the values that produced the
report**, not a clean form.

**This is first of SPEC-003's four TASKs on purpose:** it is the smallest, it
needs no backend, and most of it is one word.

## What is actually happening today (read 2026-08-21 at `1f90b87`)

- `src/components/partials/NewReport/NewReportContent.tsx:169` —
  `router.replace(reportPath(jobId))`. **`replace` overwrites the form's history
  entry**, so the browser's own Back button cannot return to it. That single call
  is the whole cause; nothing is missing from the router config.
- `src/components/partials/ReportView/ReportViewContent.tsx:62` — `handleTryAgain`
  already does the right thing for the FAILED case: it writes the
  `retryParams` handoff from `job.params` and `router.push(HOME_PATH)`. It is
  only reachable from a failed run (`ReportResult`).
- `src/lib/storage/retryParams.ts` — one-hop `sessionStorage` handoff, written on
  click, **removed as it is read** (`takeRetryParams`). Its payload type
  (`RetryParams`, `src/types/app/reports/index.ts`) has **no `pat` key**.

## What to do

Three changes, and nothing else on these screens.

1. **`replace` → `push`** in `NewReportContent.tsx:169`. Nothing else about the
   submit path changes; the button still stays disabled through `success`.
2. **An explicit back control on the report page**, in **every** state — QUEUED,
   RUNNING, DONE, NO_COMMITS and FAILED. It goes to `HOME_PATH`
   (`/reports/new`). His complaint is about that page being a dead end; answering
   it with "the browser has a Back button" is not an answer, and during a RUNNING
   run there is no other way off the screen at all.
   - On a FAILED run the existing **"ลองอีกครั้ง / Try again"** control stays
     exactly as it is. Two controls, two meanings — do not merge them and do not
     move "try again".
3. **Both ways back must land on the form carrying the run's values** (4a).

### The 4a constraint, stated because it is the part that can quietly fail

`push` gives the browser Back button back — and browser Back **remounts the form
fresh**, so on its own it produces an *empty* form, which is exactly what Q29
refused. The requirement is about *going back*, not about which affordance was
used: **the browser Back button and the on-screen control must produce the same
filled form.**

- **The constraint, not the mechanism:** the values must be available to the form
  on **any** return from a report page, without depending on which navigation the
  user chose or on which component unmounts first.
- **My preferred shape, offered so you can falsify it rather than obey it:** write
  the `retryParams` handoff **when the report page has the job**, not on the click
  — then every path back reads the same handoff, and `takeRetryParams` still
  removes it as it is read. `handleTryAgain` then only navigates.
- If you find something simpler and equally path-independent, take it and say why
  in `## Implementation Notes`. I review the outcome, not my suggestion.
- **The PAT is not restored and `RetryParams` gains no `pat` key.** SPEC-002
  freeze item 6 and REQ-001's PAT rules hold. **Consequence, stated so it is not
  reported as a bug:** going back to a *private* repository's form means entering
  the token again. That is Q27 ∩ the PAT rule, not a new decision.
- **`sessionStorage` only.** No query string: the repository URL and a committer's
  e-mail address must not enter the address bar, history or a shared link
  (the reason already written into `retryParams.ts`).

## New user-facing string (Q-SA-19)

One key, authored here for the single yes/no round SPEC-003 §Questions describes.
Adding a key is **not** a rewording of the Q14 bundle; freeze item 10 is not
touched.

| Key | th | en |
|-----|----|----|
| `reports.view.back` | `กลับไปหน้าฟอร์ม` | `Back to the form` |

- Add it to **both** dictionaries in `src/constant/text/dictionaries.ts`, in the
  `reports.view.*` block. **Change no existing string.**
- If you want different wording, propose it in `## Questions` — do not ship a
  third variant silently, because this is the pair that goes to the stakeholder.

## Boundaries

- **No redesign.** TASK-013 shipped this screen and was reviewed. The back control
  is a Mantine control in the cobalt register the screen already speaks; it does
  not restructure the run dossier.
- **No new dependency** (SPEC-002 Decision 3.4 as amended).
- **No backend change**, no API-contract change, nothing in `code-report-back`.
- **Freeze:** item 1 is released **for this one clause only** (`replace` → `push`).
  Paths and redirect rules are untouched — no route is added, removed or renamed.
  Items 2, 3, 5–10 stay frozen; item 6 ("try again" prefills everything except the
  PAT) must still hold afterwards.
- **No report-history screen** (REQ-001 §12). Back is one hop to the form.
- Do not touch the form's fields — that is TASK-018 and it lands after you.

## Definition of Done
- [x] `npm run typecheck` exit 0.
- [x] `npm run build` green, listing **the same four routes**.
- [x] Repo-wide SPEC-002 gate still a real zero: **0 Tailwind colour utilities,
      0 font-family utilities** outside `globals.css`.
- [x] **Measured, not reasoned**, on a production build (the TASK-013/TASK-015
      method; a throwaway local fake backend is fine — stop and delete it before
      you report, and say so):
      - [x] submit → report page, then the **browser Back button** → the form is
            shown **with repoUrl, branch, author, dates and report language
            filled** and **the PAT empty**;
      - [x] the **on-screen back control** from a RUNNING run → same filled form;
      - [x] the back control is present and works in all five states
            (QUEUED, RUNNING, DONE, NO_COMMITS, FAILED);
      - [x] "try again" on a FAILED run still behaves exactly as before.
- [x] `git status --porcelain` empty at the reported commit, and the hash in
      `## Implementation Notes`.
- [x] Name the files you changed and state which freeze items they could possibly
      affect.
- [x] Standing FE proxy rule honoured: set `API_PROXY_TARGET` **before**
      `npm run build`, and restore the env afterwards.

## Implementation Notes

**Commit `32e8eed`, tree clean. Three files, `+83 / −14`:**

| File | What changed | Freeze items it could touch |
|------|--------------|-----------------------------|
| `src/components/partials/NewReport/NewReportContent.tsx` | `router.replace` → `router.push`; one `writeRetryParams` call before that navigation; one stale comment corrected (`router.replace` → `router.push` in the "stays disabled through success" note, which describes the very call I changed) | item 1 (**released for this clause**), item 6 (re-measured, holds) |
| `src/components/partials/ReportView/ReportViewContent.tsx` | the handoff moved off the click into an effect; `handleTryAgain` now only navigates; the back control added | items 5, 6 (re-measured), item 10 (no string reworded) |
| `src/constant/text/dictionaries.ts` | **one key added to each dictionary**, `reports.view.back`, exactly the pair authored in this TASK | item 10 — nothing existing changed; `git diff` on this file is `+1 / −0` per dictionary |

**Nothing else was touched.** `package.json`, `theme.ts`, `tailwind.config.ts`,
`globals.css`, `ReportResult.tsx`, `ReportProgress.tsx`, `retryParams.ts`,
`useReportJob.ts`, `SessionProvider.tsx` and every form field are untouched — no
new dependency, no route added/removed/renamed, no backend change, nothing in
`code-report-back`.

### 1. The mechanism, and where I departed from your preferred shape

I took your shape — **write the handoff when the report page has the job** —
and **added one second writer**: the form writes the same six values right
before it navigates. The reason is a window your shape does not cover, and I
measured it rather than argued it.

Between `router.push` and the first `GET /api/reports/:jobId` response the report
page holds **`job === null`**, so it has no `params` to write from. A reader who
goes back inside that window gets an empty form — the exact thing Q29 refused.
**Falsified, not assumed:** with the fake backend's `GET` delayed 4 s, I built
the tree **without** the form-side write (commit `a3a848f`, this TASK's first
build) and ran the same script — the form came back
`{"repoUrl":"","branch":"","author":"","dateFrom":"","dateTo":"<absent>","mode":"day","reportLanguage":"en"}`,
i.e. completely empty. With the form-side write, the same script under the same
4 s delay returns every field. So the second writer earns its place; it is not
belt-and-braces for its own sake.

Both writers write the **same six keys** and `takeRetryParams` still removes the
payload as it is read, so there is one payload and one reader, not two
mechanisms. **Your shape is still what makes it path-independent** — the
form-side write alone would be consumed by the first return and leave a second
return (forward, then the back control) empty.

Two details worth your eye:

- The effect depends on the **six values**, not on `job`. Polling replaces the
  job object every 2 s while `params` never changes, so this writes **once per
  run** instead of once per poll.
- `handleTryAgain` no longer takes the `failed` job; `ReportResult`'s
  `onTryAgain` prop type is **unchanged** (a zero-arg function is assignable),
  so no other file moved.

### 2. The back control

A Mantine `Button variant="subtle" color="accent"` with a lucide `ArrowLeft` —
**the same control object the shell header's logout already is**, so no new
visual idea enters the run dossier and the theme is consumed, not re-picked.
It sits above the `h1`, optically flush with the content edge (`-ml-3` offsets
the subtle button's own padding). It is rendered by `ReportViewContent`, above
the `job ? … : null` branch, so it does **not** depend on the job and is present
in every state including "no job yet".

"Try again" is untouched: same component, same words, same position, same
behaviour. On a FAILED run the DOM carries **both** controls
(`["Log out","Back to the form","Try again"]`).

### 3. How it was measured

Production build (`npm run build`) served by `npx next start -p 3099`, driven by
headless Chrome (`puppeteer-core`), against a **throwaway fake of the SPEC-001
contract** on port 8099. Everything lived in `C:\Users\Admin\develyst\fern-probe`
— **outside both repos** — and **is deleted**; both ports were killed and
`netstat` shows nothing listening on 3099/8099.

**Standing FE proxy rule honoured in the amended form:** `API_PROXY_TARGET` was
set in `.env.production.local` **before** `npm run build`, and I confirmed the
baked value rather than the env — `.next/routes-manifest.json` read
`http://localhost:8099/api/:path*` before the first browser request, and the
first `GET /api/auth/me` came back as my fake's `{"error":{"code":"UNAUTHORIZED"...}}`
rather than the live 8080's Thai envelope. Afterwards `.env.production.local`
was deleted and the tree **rebuilt**; the manifest now reads
`http://localhost:8080/api/:path*` again. **No request of mine reached 8080.**

**15/15 checks passed** in the main script:

```
PASS submit navigated to the report page :: /reports/job1
PASS browser Back landed on the form
  before:    {"repoUrl":"https://github.com/probe/repo.git","branch":"feature/x","author":"dev@example.com","dateFrom":"2026-08-01","dateTo":"2026-08-10","mode":"range","reportLanguage":"th","patMounted":false,"privateChecked":false}
  afterBack: {"repoUrl":"https://github.com/probe/repo.git","branch":"feature/x","author":"dev@example.com","dateFrom":"2026-08-01","dateTo":"2026-08-10","mode":"range","reportLanguage":"th","patMounted":false,"privateChecked":false}
PASS browser Back: every field restored, PAT not mounted
PASS back control present and clickable during RUNNING
PASS back control landed on the form
PASS back control: every field restored, PAT not mounted
PASS QUEUED / RUNNING / DONE / NO_COMMITS / FAILED: back control present
PASS FAILED: two controls, both present, not merged :: ["Log out","Back to the form","Try again"]
PASS try again: still lands on the filled form, PAT not mounted
== 15/15 checks passed ==
```

Note the comparison is `before` vs `afterBack` on the **same run**, so "restored"
is a diff of measured states, not a list of strings I expected.

**The pre-first-poll window (backend `GET` delayed 4 s), final build: 4/4.**
The script asserts the run sheet has **not** rendered (job is null) before
pressing Back, so it is genuinely inside the window:

```
PASS slow backend: submit reached the report page with no job yet
PASS slow backend: the run sheet has not rendered yet (job is null)
  afterEarlyBack: {"repoUrl":"https://github.com/probe/slow.git","branch":"feature/x",...,"patMounted":false}
PASS browser Back BEFORE the first poll: form still filled
```

**Freeze item 6 / the PAT, re-measured on a private run** (`private` toggled on,
a `ghp_…` shaped token typed in):

```
report url               : http://localhost:3099/reports/job8      (no query string)
sessionStorage keys      : cr.retryParams
cr.retryParams           : {"repoUrl":"https://github.com/probe/private.git","branch":"main","author":"someone@example.com","dateFrom":"2026-08-01","dateTo":"2026-08-02","language":"en"}
localStorage             : {"cr.uiLanguage":"en"}
token anywhere in storage: no
'pat' key in the handoff : no
token in any request URL : no
POST /api/reports count  : 1
after back               : {"url":".../reports/new","repoUrl":"https://github.com/probe/private.git","branch":"main","patMounted":false,"privateChecked":false}
```

The fake backend logged the received body's **keys** (never the value):
`keys=repoUrl,dateFrom,dateTo,language,pat,branch,author hasPat=true` for that
one private run and `hasPat=false` for every public one. So the token still
travels in exactly one request body, is not in storage, is not in the URL, and
back returns with the PAT field **not mounted** and the private toggle off — a
private repository asks for its token again, which is Q27 ∩ the PAT rule as the
TASK says.

### 4. Gates

- `npm run typecheck` → exit **0**.
- `npm run build` → green, same four routes: `/`, `/_not-found`, `/login`,
  `ƒ /reports/[jobId]`, `/reports/new`.
- Repo-wide token gate: **0 colour utilities**; the font grep returns **9**, and
  they are the **same nine false positives TASK-013 named and Sober re-opened**
  (six `--font-*` var references in `app/layout.tsx:22,60`, three in
  `lib/theme.ts:78,79,81`). None is in a file this commit touched.
- `git status --porcelain` → empty at `32e8eed`. `git worktree list` shows only
  the main tree.

### 5. One consequence, stated rather than discovered at review

The handoff is now written on **every** submit and on **every** report-page
render that has a job, and it is consumed by the **next mount of the form**,
whatever brought the reader there. Within "going back" that is exactly
Requirement 4a. Outside it, it means a form reached later in the same tab by a
route that is not "back" also opens prefilled. That is Q-FE-21 below — asked,
not decided, because clearing it would mean touching `SessionProvider`, which
freeze item 2 protects.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

**Q-FE-20 (NON-BLOCKING) — do you keep the second writer?**
You offered your shape "so you can falsify it rather than obey it". I did not
replace it; I added one `writeRetryParams` call in the form, immediately before
`router.push`, because your shape alone leaves the pre-first-poll window empty
(measured above: an entirely blank form under a 4 s `GET` delay, at commit
`a3a848f`). The cost is that the payload has **two writers of the same six
keys**. If you would rather have one writer and accept the window, deleting the
form-side call is a five-line revert and I have the falsification script's
method written down. **Nothing waits on this** — what is shipped satisfies 4a in
both windows.

**Q-FE-21 (NON-BLOCKING) — how long may the handoff live?**
`takeRetryParams` removes the payload as it is read, so it lives until *some*
mount of the form consumes it. **Measured:** it is present in `sessionStorage`
while the reader is on the report page. **Inferred, not measured:** a reader who
leaves the report page by a route other than "back" — logging out and back in
being the obvious one, since `sessionStorage` survives that — meets a prefilled
form on their next visit to `/reports/new`. It is one tab only, it contains no
PAT, and TASK-018 will re-shape those fields anyway. I did **not** clear it on
logout: that is `SessionProvider`, which freeze item 2 still protects except for
the one clause TASK-015 releases, and "back keeps his values" (Q29) does not
say "and nothing else ever prefills". One line from you either way.

**Q-FE-22 (NOTED, no answer owed)** — `ReportResult`'s `onTryAgain` prop still
has the signature `(failed: ReportJob) => void` while the handler I pass now
takes no argument. It type-checks and I left the prop alone rather than edit a
component this TASK does not own; if you want the signature narrowed it belongs
in whatever TASK next opens `ReportResult.tsx`.

> **answer (Sober, 2026-08-21, at the review) — Q-FE-20: KEEP the second writer.**
> You did what the TASK asked for — you falsified my shape instead of obeying it,
> and you did it with a measurement (`a3a848f`, 4 s `GET` delay, a wholly empty
> form) rather than an argument. My shape is wrong on its own: it cannot write
> what the page does not yet have. What ships is one payload, six keys, two
> writers and **one** reader (`takeRetryParams` still removes it as it is read),
> so there is no second mechanism to keep in step — and both writers are in the
> two files this TASK owns. **Bound of this ruling:** it authorises the writer in
> the submit path, not a general licence to write the handoff from anywhere else.

> **answer (Sober, 2026-08-21) — Q-FE-21: the handoff may live until the next
> mount of the form consumes it. Change nothing, and do NOT touch
> `SessionProvider`.** You were right that clearing it on logout is freeze item 2,
> which this TASK does not release. Ruled on what the payload actually is: six
> non-secret values the same user typed in the same tab, no `pat`, one tab only,
> and one read. Q29 said "back keeps his values"; it did not say "and nothing
> else may ever prefill", so a later non-back arrival at a prefilled form is an
> accepted consequence, recorded in §5 rather than discovered. **Two limits so it
> is not read wider:** (1) if the payload ever gains a field that is not the
> user's own input, this ruling stops applying and the lifetime becomes a
> question again; (2) TASK-018 must tolerate a handoff whose branch no longer
> exists on the remote — it already does, as a *pending selection* applied after
> the list loads (SPEC-003 Decision 4a ∩ 1a), which is the case this makes real.

> **answer (Sober, 2026-08-21) — Q-FE-22: noted, no change, and you were right
> not to edit `ReportResult.tsx`.** Narrowing `onTryAgain` to `() => void` is
> cosmetic — a zero-arg function is assignable and nothing reads the argument.
> Carried as a one-line note into **TASK-020**, which is the next TASK that opens
> that screen. It is not a parked queue item of mine; it costs one line whenever
> that file is next open.

## Review

**Verdict: `DONE` at commit `32e8eed`.** Reviewed 2026-08-21 by Sober. I wrote no
code, ran no SQL, touched no database and started no server; I re-ran the gates in
the real repository and read the real diff.

### 1. Every gate re-run by me, not read from the notes

- `git log --oneline -3` → HEAD is `32e8eed`; `git status --porcelain` **empty**.
- `npm run typecheck` → exit **0**.
- `npm run build` → green, and the route list is the **same four** (plus
  `/_not-found`): `/`, `/_not-found`, `/login`, `ƒ /reports/[jobId]`,
  `/reports/new`.
- Repo-wide SPEC-002 token gate: **0 colour utilities**; the font grep returns
  **9**, all of them the known `--font-*` variable references
  (`app/layout.tsx:22,60`, `lib/theme.ts:78,79,81`) — **no file this commit
  touched appears in either result**. The raw-colour grep outside `globals.css`
  returns **2**, both of them *comment text* in `lib/theme.ts` (`#fff`/`#000`
  named in prose), unchanged by this commit.
- `git show --numstat` → `21/3`, `60/11`, `2/0` = **+83 / −14**, three files.

### 2. Two checks the DoD did not ask for

- **Every deleted line, opened.** `git show | grep '^-[^-]'` returns exactly 14
  lines and each is accounted for: the widened import, `router.replace`, the
  stale `router.replace` comment, the two widened imports in `ReportViewContent`,
  and the nine lines of the old click-time `handleTryAgain`. **No behaviour was
  removed that was not moved.**
- **The "untouched" claim is proof, not a word.** `git diff 1f90b87 32e8eed --`
  over `package.json`, `lib/theme.ts`, `tailwind.config.ts`, `globals.css`,
  `ReportResult.tsx`, `ReportProgress.tsx`, `lib/storage/retryParams.ts`,
  `hooks/useReportJob.ts` and `context/session` prints **nothing** — so freeze
  item 5 (polling) could not have regressed, and the handoff module itself is
  byte-identical.
- **Freeze item 10 measured on the file that carries it:** `dictionaries.ts` is
  `+2 / −0` — one key per dictionary, **zero deletions**, so no existing string
  could have been reworded. The pair shipped is character-for-character the pair
  authored in this TASK (`กลับไปหน้าฟอร์ม` / `Back to the form`), which is one of
  the 13 the human approved **as authored** on Q-SA-19 (answer verbatim in
  REQ-004 `## Questions`; its formal transcription into SPEC-003 is a separate SA
  unit and does not gate this verdict).

### 3. What I verified structurally rather than trusting the harness

I have no display and did not re-run her browser script; instead I checked the
two claims that a script could accidentally satisfy:

- **"Present in every state" is structural, not sampled.** `ReportViewContent`
  has **no early return** — the only `return`s before the JSX are the two guards
  inside the effect. The `Button` is rendered as the first child of the top-level
  `<Box>`, *above* the `job ? <RunSheet …/> : null` branch and outside every
  `loadError` / `offline` branch. So it is present with no job at all, which is
  strictly stronger than the five states the DoD names.
- **The handoff cannot carry the token.** `RetryParams` has no `pat` key, the
  form's writer is built from `body` (whose `pat` is omitted, and which is wiped
  before the call), and the page's writer is built from `job.params`, which
  SPEC-001 defines as never carrying `pat`. Item 6 holds by construction as well
  as by her measurement.

### 4. One finding, and it is MY DoD's gap, not her defect

**`extraContext` does not come back.** The handoff carries six values; the form's
free-text context field (REQ-001) is not one of them, so going back loses
whatever the reader typed there. This TASK's DoD enumerated exactly the five
fields she restored, and the payload shape predates her — **she built what I
specified.** But Q29's answer was "มีค่าเดิม", and free text is the most
expensive thing on that form to retype. Whether "his values" includes it is a
reading of the requirement, not a technical choice, so **it is not resolved here
and not silently added**: raised as **Q-SA-20** in SPEC-003 `## Questions`,
NON-BLOCKING. If the answer is "yes", it is one key in `RetryParams` plus one
line in each writer and belongs in TASK-018, which already opens the form.

### 5. Two small things recorded, neither a rework item

- **A now-stale doc comment.** `src/lib/storage/retryParams.ts`'s header still
  says the handoff is "written on the click, read once on the form's next
  mount" — after this TASK neither writer is on a click. She was right not to
  open a file this TASK does not own. Carried into TASK-018 as a **comment-only**
  correction.
- **An out-of-TASK commit exists in the repo:** `42b396e` ("FE — add `.agent/` to
  `.gitignore`", one line) sits between `1f90b87` and `32e8eed` and is named by no
  TASK. It is harmless and it removes the `?? .agent/` noise every FE session has
  been reporting, so I am not asking for anything to be undone — but a commit
  that no TASK asked for is exactly the kind of change that later reads as
  unexplained. **@Fern: mention it in the TASK next time, even when it is one
  line in a file nobody reads.**
