# REQ-001: Generate a readable dev-work report from a git repository
- Status: IN_SPEC
- Priority: HIGH
- Requested: 2026-08-20 by human stakeholder
- Deadline: none (confirmed by the human 2026-08-20 — "ยังไม่กำหนด")

## Problem / Goal

Today, explaining "what the dev team actually did" for a given period means
reading raw git commits. Commit messages are short, inconsistent, and mean
nothing to anyone who does not already know the codebase, so the work is either
under-reported or written up by hand every time.

We want a web tool where a user points at a git repository, picks a period, and
gets back a written explanation of the work done in that period — written with
real understanding of the codebase's context, not a reworded commit list.

This REQ covers connecting to a repo, understanding it, analysing commits, and
**showing** the report on screen. Emailing the report is deliberately split out
(see Out of Scope).

## Requirement

1. The system must accept a git repository from the user.
   1. For a **public** repo, the repository address alone must be enough.
   2. For a **private** repo, the user must be able to supply a personal access
      token (PAT) so the system can read the codebase. Without a valid token the
      system must fail with a clear message, not a blank/technical error.
2. The system must analyse the codebase itself — not only commits — to build an
   understanding of what the project is and how it is structured, and use that
   understanding when it writes the report.
3. As part of that analysis, the system must automatically look for and read
   Markdown (`.md`) files in the project (README and other docs) and use them as
   project context.
4. The system must analyse git commits, and the user must be able to choose which
   commits are covered:
   1. a single day,
   2. a date range,
   3. a specific **author** (report the work of one person),
   4. a specific **branch**. In practice the branches asked for are the main ones
      (`main`, `production`, `develop`); other/feature branches are used rarely
      but must still be selectable.
   These selections must be combinable (e.g. one author on `develop` last week).
   5. The chosen day / date range is counted in the **Asia/Bangkok** timezone,
      regardless of the timezone recorded on each commit (answer to Q-SA-1).
   6. The author and the branch are **typed in by the user as free text**; the
      tool is not required to offer lists discovered from the repository
      (answer to Q-SA-2).
5. The system must let the user supply **extra context** in their own words —
   free-form text typed or pasted in (e.g. background the code does not show,
   what the sprint was about, internal terminology) — and must take that context
   into account when writing the report.
6. The output must be a written explanation a reader can understand: it explains
   *what was done and why it matters in this project's context*, not a raw list
   of commit messages.
7. The system must display the finished report to the user on screen, in a form
   they can read directly in the browser.
8. Analysis must run through the stakeholder's **AI API CENTER** (his own API in
   front of several AI providers). Per the stakeholder, it may be called in
   several chained steps so the analysis is a multi-stage reasoning process
   rather than one shot.
9. The report must be produced in **Thai or English**, and the user must be able
   to choose/switch the language (answer to Q1).
10. The tool is **internal, behind a login** — only the CEO, SA and PM use it; an
    anonymous visitor must not be able to run a report (answer to Q2).
    1. All logged-in users have **exactly the same permissions**; there is no
       role that sees or does more than another (answer to Q6). "CEO / SA / PM"
       are descriptions of who the people are, not permission levels.
    2. There is **no self sign-up**. Accounts are created for the users by the
       stakeholder (answer to Q7); a visitor cannot register themselves.
    3. The user accounts are **put in place once, at installation/setup time**
       (answer to Q9). The tool therefore does **not** need a user-management
       screen: there is no page inside the tool for creating, editing or
       deleting users. Adding or removing a person later is handled outside the
       tool, when the stakeholder asks for it.
    4. **Passwords are handled entirely outside the tool** (answer to Q10). The
       stakeholder resets a password himself, from outside the system. The tool
       therefore has **no "change my password" screen and no "forgot password"
       flow** — a logged-in user cannot change their own password inside the
       tool, and there is no self-service reset by email or otherwise.
11. A user's PAT must be used **for that run only and never stored** — not in the
    database, not in logs (answer to Q3).
12. A finished report is **kept** — there is no required expiry or automatic
    deletion — but the tool offers **no report-history screen**: a user cannot
    browse or re-open previous runs from the interface (answer to Q-SA-3).
13. When the selected period contains no commits, the tool shows the following
    approved note instead of a report (answer to Q-SA-4 — the stakeholder
    accepted the proposed wording as the default, so it is now stakeholder
    copy, not invented text):
    - th: `ไม่พบการทำงานในช่วงวันที่ที่เลือก (<from> – <to>) สำหรับ <repo>`
    - en: `No commits were found for the selected period (<from> – <to>) in <repo>.`
    Branch and author are appended to the note when the user supplied them.
14. The **product name shown on screen is `KnowCode`** (answer to the copy-bundle
    question 1, 2026-08-20). This replaces the placeholder "Code Report" the
    frontend currently displays, which was taken literally from the project code
    rather than chosen by the stakeholder. **Q12 answered 2026-08-20 — "ใช่
    KnowCode แค่ชื่อในCode เท่านั้น ไม่ใช่เปลี่ยนชื่อrepo": the name lives inside
    the product only.** The project folder and both repositories keep their
    current names (`code-report`, `code-report-back`, `code-report-front`) as
    internal identifiers — **no rename is in scope anywhere**. The string shown is
    the Latin `KnowCode` in both UI languages (no Thai rendering was given, and
    none is to be invented; it rides along with the deferred wording review).
15. Dates rendered on screen use the **`20/Aug/26` form** — two-digit day, an
    **English three-letter month abbreviation in both UI languages**, and a
    **two-digit Gregorian (คริสต์ศักราช) year** (answer to Q-FE-2, 2026-08-20 —
    the human wrote the example himself). No Thai month names and no Buddhist-era
    year anywhere on screen. This confirms the existing implementation, so it is
    a stated requirement now rather than a default.
    - **Scope of this rule, answered 2026-08-20 (Q-SA-10 — "ยอมรับได้"):** it
      governs every date the tool *renders*. The **native date picker** draws its
      own text from the operating system's locale, so on a Thai-locale machine it
      can show a Buddhist-era year inside the input box; the stakeholder has
      accepted that as acceptable. It is not a defect against this requirement
      and no work falls out of it.
16. The date shown and stored **per commit** is the **committer** date — the same
    date that decides whether a commit falls inside the chosen period (answer to
    Q13, 2026-08-20; Q-SA-9 had already settled selection). A report is therefore
    internally consistent: no commit inside a report prints a date outside the
    reported period, including after a rebase, cherry-pick or amend.
17. A **linked image inside a report is not fetched or displayed** (answer to
    Q-FE-7, 2026-08-20 — "ข้อความ"). Where the report text contains an image, the
    tool shows it **as text** — the image's own description text and its address —
    so the reader's browser never makes a request to an address that an analysed
    repository chose. Links themselves are unaffected.
18. From a **finished** report (including a "no work in this period" result) the
    user must have a way, on that same screen, to go and start a **new** report
    (answer to Q-FE-8, 2026-08-20 — "มี"). Today only a *failed* run offers a way
    back and there is no history screen, so a finished report is a dead end. The
    **label/wording** of that control is copy and rides along with the deferred
    wording review; only its existence is settled here.

## Acceptance Criteria

- [ ] A user can run a report on a **public** repo with no token and get a report.
- [ ] A user can run a report on a **private** repo by supplying a PAT, and gets
      the same quality of report.
- [ ] A wrong/expired/missing token produces a clear, human-readable error.
- [ ] The user can pick a single day and get a report covering only that day's
      commits; the user can pick a date range and get a report covering it.
- [ ] A period with no commits produces a clear "no work in this period" result,
      not an empty page or an error.
- [ ] The report demonstrably reflects project context: for a repo with a README,
      the report uses the project's own vocabulary/purpose rather than generic
      wording.
- [ ] The user can add free-text extra context, and its effect is visible in the
      resulting report.
- [ ] The finished report is displayed on screen and is readable end-to-end
      without downloading anything.
- [ ] The same run can be produced in Thai and in English, and the user chooses
      which.
- [ ] The user can restrict a report to one author, and to one branch (verified
      on `main` and on `develop`), and to both at once.
- [ ] A visitor who is not logged in cannot run a report.
- [ ] Any two logged-in users can do exactly the same things in the tool — there
      is no screen or action available to one of them and not the other.
- [ ] There is no way for a visitor to create an account for themselves.
- [ ] The tool contains no user-management screen; the accounts that exist are
      the ones put in place at setup, and a logged-in user cannot add, edit or
      delete users from inside the tool.
- [ ] The tool offers no way to change or reset a password: a logged-in user
      finds no "change my password" screen, and the login page offers no
      "forgot password" link or self-service reset.
- [ ] The acceptance run is performed against
      `https://github.com/develyst1/smart-scheduler-front.git` **with no token**,
      as a public repo.
- [ ] After a run on a private repo, the supplied PAT is not present in the
      database or in any log.
- [ ] A day chosen by the user covers exactly that day in Asia/Bangkok: a commit
      whose own timestamp falls just inside that Bangkok day is included, and one
      just outside it is not.
- [ ] The author and branch inputs accept typed free text and a report can be
      produced without the tool first listing the repo's authors or branches.
- [ ] There is no report-history screen: a logged-in user finds no list of past
      runs and no way to re-open a previous report from the interface.
- [ ] A period with no commits shows exactly the approved note (Requirement 13)
      in the language the user chose, with the repo and the period filled in,
      and with branch/author appended when they were supplied.
- [ ] The product name displayed on screen reads `KnowCode`, in both the Thai and
      the English UI, and the string "Code Report" appears nowhere a user can see.
- [ ] A date shown on screen for 2026-08-20 reads `20/Aug/26` in both the Thai
      and the English UI — English month abbreviation, Gregorian year — and no
      screen shows a Thai month name or a Buddhist-era year. *(The native date
      picker's own OS-drawn text is excluded — accepted by the stakeholder,
      Q-SA-10.)*
- [ ] Every commit date shown in a report is the commit's **committer** date, and
      a commit that was rebased (author date on an earlier day) is reported with
      the date on which it landed — so no commit in a report prints a date outside
      the reported period.
- [ ] A report whose text contains an image causes **no image request** from the
      reader's browser: the image appears as its description text plus its
      address, as ordinary text.
- [ ] From a finished report — and from a "no work in this period" result — the
      user can start a new report from that same screen without using the
      browser's Back button.

## Constraints

Stakeholder-provided infrastructure (recorded as constraints, not as design —
technical choices belong to Sober):

- **AI API CENTER** — the stakeholder's own API fronting multiple AI providers;
  all AI analysis goes through it. Connection details **received** — see
  `../project-docs/ai-api-center-bruno/` (Bruno collection provided by the
  stakeholder) and the summary note `../project-docs/AI-API-CENTER.md`.
  Stakeholder's words: **"no auth now"** — the API currently requires no
  authentication.
- **Live AI API CENTER endpoint for the acceptance run** — the stakeholder
  authorised `https://ai.develyst.online` on 2026-08-20 (answer to Q-SA-6), and
  asked that we **start with the lower-tier / cheaper models** ("ลองใช้ model
  ต่ำๆ ไปก่อน"). Real AI calls against that endpoint are therefore permitted for
  the acceptance run. He stated **no volume or token cap** — see the open
  non-blocking follow-ups in `## Questions`.
- **Deployment shape** — the tool is served from **one address (same origin)**,
  with `/api/*` reaching the backend; the frontend and the API do **not** sit on
  separate hostnames (answer to Q-SA-5 — the stakeholder accepted the default).
- **AI model tiering and spend** (answers to Q-SA-7 + Q-SA-8, 2026-08-20).
  **There is no token or call ceiling** — "ไม่มีเพดาน". The model is chosen **per
  step, by how hard the step is**, and the stakeholder is explicit that a heavy
  step may use a heavier model: the code-reading / codebase-understanding steps
  may use a **mid-tier** model (he named `gpt-4.1` and "gpt5" as examples of that
  tier), while simple procedural/orchestration steps should use a **cheap** model
  (he named `gpt4.1-nano` / `mini` as examples). "Start with low models" from
  Q-SA-6 therefore means *default low, spend where it matters*, not *low
  everywhere*. Which concrete model ids exist is a technical fact of AI API
  CENTER and is Sober's call, not a stakeholder statement — the names above are
  the human's own words, typed informally, and were not verified against
  `GET /models`.
- **PostgreSQL** — available as the database. The local instance created for this
  team is fully specified as of 2026-08-20 (answers to Q-BE-1 + Q11):
  `postgresql://postgres:smart2026@127.0.0.1:5432/code_report`. The human
  confirmed he has created the database. No Docker.
- **SMTP mail sender** — available (used by the follow-up email REQ, not here).
- Repositories may be public or private; private access is via PAT only.

## Out of Scope

- **Emailing the report** to a chosen address — will be raised as a separate REQ
  once this one is specified.
- Report export formats (PDF/Word/etc.) — not requested.
- Writing to, or changing anything in, the analysed repository. The system is
  read-only towards the customer's code.
- Any hosting/CI/deployment concerns.
- Scheduled/automatic report runs — not requested.
- A **report-history screen** (browsing or re-opening past runs) and any
  automatic expiry/deletion of stored reports — confirmed out of scope by the
  human (answer to Q-SA-3).
- Author/branch **dropdowns** discovered by inspecting the repository — confirmed
  out of scope by the human (answer to Q-SA-2).

## Questions

Q1–Q10 and both data requests were **answered by the human on 2026-08-20**
(answers verbatim below, with what they mean for the requirement). **No question
is open on REQ-001 any more.**

- **Q1 (report language):** should the report be written in Thai, in English, or
  should the user choose per run?
  > answer (2026-08-20, human): "ไทย/eng ปรับได้" — both Thai and English, and the
  > user can switch. Folded into Requirement 9.
- **Q2 (users & access):** who uses this tool — is it internal-only with a login,
  or can anyone who opens the page run a report?
  > answer (2026-08-20, human): "CEO/SA/PM/ต้อง login" — internal only, behind a
  > login; the users are the CEO, the SA and the PM. Folded into Requirement 10.
  > Follow-up raised as Q6 (roles vs. permissions) and Q7 (how accounts are made).
- **Q3 (PAT handling):** should a user's PAT be saved for reuse across runs, or
  used once for the run and never stored?
  > answer (2026-08-20, human): "ไม่เก็บ ใช้เป็นครั้งๆ" — not stored, used per run
  > only. Folded into Requirement 11.
- **Q4 (commit selection):** besides a single day and a date range, what else did
  "หรือต่าง ๆ ได้" mean — e.g. per author, per branch, last N commits?
  > answer (2026-08-20, human): "แยกตามคนและ branch ด้วย ส่วนใหญ่จะใช้ดู branch
  > หลักๆ เช่น main - production - develop มีไม่บ่อยที่จะดู branch dev" — split by
  > person (author) and by branch; mostly the main branches, feature branches
  > rarely. Folded into Requirement 4.3–4.4. "Last N commits" was **not** asked
  > for and stays out of scope.
- **Q5 (priority/deadline):** is there a target date, or is this open-ended?
  > answer (2026-08-20, human): "ยังไม่กำหนด" — no deadline set yet. Deadline
  > stays "none"; priority stays HIGH.
- **DATA REQUEST 1:** AI API CENTER — base URL, how to authenticate, and any doc
  or example call.
  > answer (2026-08-20, human): Bruno collection supplied and copied to
  > `../project-docs/ai-api-center-bruno/`; summary in
  > `../project-docs/AI-API-CENTER.md`. Human's words: "API AI CENTER how to use
  > / no auth now" — no authentication at the moment.
- **DATA REQUEST 2:** one sample repository we may use as the reference case for
  acceptance.
  > answer (2026-08-20, human): `https://github.com/develyst1/smart-scheduler-front.git`.
  > Follow-up raised as Q8 (is it public, or is a PAT needed to read it).

- **Q6 (roles vs. permissions):** CEO, SA and PM all log in — do the three roles
  see/do exactly the same thing, or does one of them get something the others do
  not?
  > answer (2026-08-20, human): "เท่ากันหมด" — all the same. Everyone who can log
  > in has identical permissions; there are no privilege levels. Folded into
  > Requirement 10.1.
- **Q7 (accounts):** how does someone get an account — do you create the users by
  hand, is there an existing system/directory we log in against, or should the
  tool have its own sign-up?
  > answer (2026-08-20, human): "ผมสร้างให้" — the stakeholder creates the
  > accounts himself. No self sign-up, and no external directory to log in
  > against. Folded into Requirement 10.2. *What this does not yet settle:* by
  > what means he creates them — raised as Q9.
- **Q8 (sample repo access):** is `develyst1/smart-scheduler-front` public or
  private?
  > answer (2026-08-20, human): "public" — it is public, so it can be read with
  > no token and serves as the public-repo acceptance reference. No PAT data
  > request is needed for it. Added to the acceptance criteria.

- **Q9 (how accounts get created in practice):** you said you will create the
  accounts yourself — do you want to do that **inside the tool** (a page where an
  existing user adds another user), or is it acceptable that the accounts are put
  in place for you once at setup and you tell us when a person must be added or
  removed?
  > answer (2026-08-20, human): "ใส่บัญชีให้ตอนติดตั้ง" — put the accounts in
  > place at installation time. So: **no user-management screen** in the tool;
  > accounts are provisioned once at setup and changed outside the tool on
  > request. Folded into Requirement 10.3.

- **Q10 (passwords for the setup accounts):** once the accounts are put in at
  installation, may a logged-in user change their own password inside the tool,
  or is every password change/reset done by you outside the tool?
  > answer (2026-08-20, human): "ผมรีเซ็ตให้จากนอกระบบ" — the stakeholder resets
  > passwords himself, from outside the system. So the tool needs **no
  > change-password screen and no forgot-password / self-service reset flow**.
  > Folded into Requirement 10.4.

### Answered 2026-08-20 — Q-SA-1, Q-SA-2, Q-SA-3

Raised by **Sober (SA)** on 2026-08-20 while writing SPEC-001, each with a
working default. Put to the human as A/B/C and **all three confirmed in one
answer**:

> answer (2026-08-20, human, verbatim): "A/B/C ถูกหมด, ไปเลย" — all three
> defaults are correct, go ahead.

Each default therefore becomes a settled requirement:

- **Q-SA-1 (date boundaries / timezone):** when the user picks a day such as
  "2026-08-07", in whose timezone is that day counted? Commits carry the
  author's own timezone. SPEC-001 default: **Asia/Bangkok**.
  > **Confirmed.** The chosen day / date range is counted in **Asia/Bangkok**.
  > Folded into Requirement 4.5.
- **Q-SA-2 (how author and branch are chosen):** Requirement 4.3–4.4 says the
  user can pick an author and a branch, but not how. SPEC-001 default:
  **free-text fields** (author matched as a case-insensitive substring of name
  or email).
  > **Confirmed.** Author and branch are **typed in as free text**; the tool
  > does not have to inspect the repo first to offer dropdowns. Folded into
  > Requirement 4.6. Dropdowns stay out of scope.
- **Q-SA-3 (retention & report history):** a finished report is stored so the
  browser can poll for it. Nothing in REQ-001 said whether a user may re-open a
  **past** run, or for how long runs are kept. SPEC-001 default: kept
  indefinitely, **no history screen**.
  > **Confirmed.** Finished runs are **kept** (no expiry required) and the tool
  > has **no history screen** — a user cannot browse or re-open past runs from
  > the UI. Folded into Requirement 12 and Out of Scope.

### Answered 2026-08-20 — Q-SA-4, Q-SA-5, Q-SA-6

Three gaps found while turning SPEC-001 into engineer-ready tasks. Sober will
not invent an answer for any of them. **Q-SA-4 and Q-SA-5 are NON-BLOCKING** —
each TASK carries a stated default and Jason/Fern can build against it.
**Q-SA-6 blocks TASK-009 only** (the end-to-end acceptance run); TASK-001…008
are unaffected because they run against a fake AI client and a fixture repo.

- **Q-SA-4 (wording of the "no work in this period" note) — NON-BLOCKING.**
  When a period has no commits, the tool shows a short note instead of a report
  (Requirement / AC "a period with no commits produces a clear result"). That
  note is stakeholder-facing copy, so Sober is not treating an invented sentence
  as final. Default written into TASK-004, kept in one file so a change is a
  one-line edit:
  - th: `ไม่พบการทำงานในช่วงวันที่ที่เลือก (<from> – <to>) สำหรับ <repo>` (+ branch / author when given)
  - en: `No commits were found for the selected period (<from> – <to>) in <repo>.` (+ branch / author when given)

  **Question for the human:** is that wording acceptable, or does he want his
  own sentence in each language?
  > answer (2026-08-20, human, verbatim): "A/B ใช้ default" — A = Q-SA-4. The
  > proposed wording is **accepted as-is**; he does not want his own sentence.
  > The two sentences are therefore stakeholder-approved copy, folded into
  > **Requirement 13** with a matching acceptance criterion. TASK-004's default
  > needs no change.

- **Q-SA-5 (how the frontend reaches the backend in his deployment) — NON-BLOCKING.**
  The session is a cookie. If the finished tool is served with the frontend and
  backend on **different sites** (e.g. `app.x.co.th` + `api.x.co.th`), the
  cookie's `SameSite` setting and a CORS configuration both have to change.
  Sober has no real-world fact about how he intends to host it, and will not
  assume. Default built to: **same origin, `/api/*` proxied to the backend**,
  base URL behind one env var.
  **Question for the human:** will the tool be served from one address, or will
  the frontend and the API sit on separate hostnames?
  > answer (2026-08-20, human, verbatim): "A/B ใช้ default" — B = Q-SA-5. The
  > default stands: **one address, same origin, `/api/*` proxied to the
  > backend**. No split hostnames, so no cross-site cookie and no CORS
  > configuration is needed. Recorded under `## Constraints` (deployment shape).
  > TASK-006's default needs no change.

- **Q-SA-6 (permission to call the live AI API CENTER) — BLOCKS TASK-009 ONLY.**
  The acceptance run must produce real reports, which means real calls to the
  stakeholder's own AI API CENTER. PROTOCOL forbids this team from touching a
  real environment on its own initiative, and real calls spend real tokens.
  **Questions for the human:** (1) which endpoint may we use for the acceptance
  run — a local `http://localhost:3009` he starts for us, or
  `https://ai.develyst.online`? (2) is he happy for real AI calls to be made
  against it, and is there a volume limit we should stay under?
  > answer (2026-08-20, human, verbatim): "Q-SA-6=https://ai.develyst.online
  > ใช้ได้ แต่ ลองใช้model ต่ำๆไปก่อน" — **use `https://ai.develyst.online`; it is
  > fine, but start with the lower-tier models.** So: (1) the endpoint is the
  > production one, not a local instance he starts for us; (2) real AI calls are
  > authorised, with a stated preference for cheaper/lower-tier models first.
  > Recorded under `## Constraints`. **TASK-009 is unblocked.**
  > *What this does not settle* — two non-blocking follow-ups below (Q-SA-7,
  > Q-SA-8); neither stops TASK-009, they only tighten the cost guard rails.

### Answered 2026-08-20 — Q-SA-7, Q-SA-8 (model tier + spend ceiling)

> answer (2026-08-20, human, verbatim): "ไม่มีเพดาน แต่ medel ต่ำๆ ก็แล้วแต่
> สถานการณ์ อันไหนจำเป็นต้องใช้หนักก็ได้ เช่นตอน ดูโค้ด และ ทำความเข้าใจ อันนั้นก็
> ใช้ ตัวกลางๆได้ เช่น gpt-4.1 gpt5อะไรงี้ แต่พวกงานคิดขั้นตอนกระบวนการง่ายๆ ก็
> gpt4.1-nano mini บลาๆ"

- **Q-SA-8 → there is no ceiling.** No per-day call limit and no token limit to
  stay under.
- **Q-SA-7 → he named no single model; he named a rule.** Pick the model per
  step: **mid-tier** for the steps that read code and build understanding
  (examples he gave: `gpt-4.1`, "gpt5"), **cheap/nano-or-mini** for simple
  procedural steps (example: `gpt4.1-nano`, "mini"). Recorded under
  `## Constraints`. This *loosens* Q-SA-6's "start with low models": low is the
  default, not a cap.
- *What it does not settle:* whether those exact model ids exist on AI API
  CENTER. He typed them informally as examples of a tier, not as a list to
  copy. Mapping "mid-tier"/"cheap" onto real model ids from `GET /models` is a
  technical decision inside SA authority — Porter did not turn the examples into
  a configuration.

### Answered 2026-08-20 — Q11 (database username + port)

> answer (2026-08-20, human, verbatim): "username postgres port 5432 สร้าง db ให้ละ"

- Username **`postgres`**, port **`5432`**, and the database has **already been
  created** for the team. Combined with the Q-BE-1 facts, the connection string
  is fully determined:
  `postgresql://postgres:smart2026@127.0.0.1:5432/code_report`.
- **Q11 is closed.** The two TASK-001 Definition-of-Done items it blocked
  (`bun run migrate`, `bun run seed:users`) now have a real database to run
  against, authorised by the human. Nothing on REQ-001 is blocked any more.

### Answered 2026-08-20 (partly) — the COPY BUNDLE (Q-FE-1 + Q-BE-2) and Q-FE-2

Routed to Porter by Sober as one bundle so the human would see the product's
whole voice at once. Three things were put to him; he settled two.

> answer (2026-08-20, human, verbatim): "1.ชื่อ KnowCode / 2.เดี๋ยวดู /
> 3.เอา 20/Aug/26"

- **1 — the product name: `KnowCode`.** The on-screen name is his decision now,
  not a placeholder lifted from the project code. Folded into **Requirement 14**
  with an acceptance criterion. Follow-up **Q12** below: he named the product,
  not the repositories.
- **2 — the th/en wording (Fern's `dictionaries.ts` + Jason's `messages.ts`):
  "เดี๋ยวดู" = he will look at it later. This is a DEFER, not an approval.**
  The strings therefore stay **exactly as the engineers authored them**,
  provisional, and **nobody rewords anything on their own judgement** until he
  comes back. Still open and still NON-BLOCKING — every string is one line in
  one module per repo.
  **→ SUPERSEDED 2026-08-20: he came back. "Q14=ทั้งระบบ" approves the whole
  system's wording as authored — see the Q14 answer below. This half of the
  bundle is CLOSED and no string is provisional any more.**
- **3 — Q-FE-2, the bilingual date format: `20/Aug/26`.** He wrote the example
  himself: English month abbreviation in both languages, **Gregorian** two-digit
  year, no Buddhist era. That is the literal `DD/MMM/YY` reading already
  implemented in `format.ts`, so the answer confirms the existing code rather
  than changing it. Folded into **Requirement 15** with an acceptance criterion.
  Wire format (`YYYY-MM-DD` Gregorian) unaffected, as Sober said.

### Answered 2026-08-20 — Q12 (how far the name `KnowCode` reaches)

> answer (2026-08-20, human, verbatim): "1.ใช่ KnowCode แค่ชื่อในCode เท่านั้น
> ไม่ใช่เปลี่ยนชื่อrepo"

- **(a) — settled: nothing is renamed.** `KnowCode` is the name **inside the
  product** only. The project folder and both git repositories keep their
  current names (`code-report`, `code-report-back`, `code-report-front`) as
  internal identifiers. **No rename work exists on this project**, and nobody is
  to rename a repository, a folder or a package name off the back of
  Requirement 14.
- **(b) — the Thai/Latin half: not answered in his own words.** He gave one
  Latin string and called it the name in the code; he did not say a Thai
  rendering exists. The recorded reading therefore stays exactly what
  Requirement 14 and its acceptance criterion already say — the literal Latin
  string `KnowCode` in **both** the Thai and the English UI. **Porter is not
  inventing a Thai form**, and this is not re-opened as a separate question:
  the product name is part of the th/en wording bundle he has deferred
  ("เดี๋ยวดู"), so if he wants a Thai rendering it comes back with that review.

### ~~Open (NON-BLOCKING)~~ CLOSED 2026-08-20 — Q12, the original wording (kept for the record)

- **Q12 (how far the name `KnowCode` reaches) — ANSWERED above. NON-BLOCKING; nothing waited.**
  He answered "the product is called KnowCode", which settles the name a user
  reads on screen (Requirement 14). It does not say: (a) whether the project and
  its two git repositories (`code-report`, `code-report-back`,
  `code-report-front`) are renamed too, or keep their current names as internal
  identifiers; (b) whether the Thai UI shows the same Latin string `KnowCode` or
  a Thai rendering. Porter is not guessing either — renaming repositories is real
  work and a transliteration is invented copy. Asked in Thai; on the board.

### ~~Open (NON-BLOCKING)~~ CLOSED 2026-08-20 — the Q-SA-7 / Q-SA-8 originals

*(Both answered above — kept for the record. Do not treat as open.)*

Per the human's standing instruction ("skip non-blocking questions and keep
moving"), these are recorded, not treated as a stop. Nothing waits on them:
TASK-009 proceeds using whatever `GET /models` reports as the cheapest model per
provider, and Sober owns that technical pick.

- **Q-SA-7 (which model counts as "ต่ำๆ") — NON-BLOCKING.** The human asked for
  lower-tier models but did not name one, and the team may not call `GET
  /models` on a real environment to find out on its own initiative. Working
  approach: Sober picks the cheapest model advertised for the default fallback
  chain, from the model lists in the Bruno collection docs.
  **Question for the human:** is there a specific model name he wants us to use
  for the acceptance run, or is "cheapest advertised" fine?

- **Q-SA-8 (spend guard rail) — NON-BLOCKING.** He authorised real calls but
  named no ceiling. The acceptance run is a handful of runs (th + en on one
  public repo), so spend is small either way.
  **Question for the human:** is there a per-day call/token limit we must stay
  under on `https://ai.develyst.online`?

### Answered 2026-08-20 — Q-BE-1 (DATA REQUEST: a database to run migrate/seed against)

Raised by **Jason (BE)** via **Sober**, recorded in TASK-001 `## Questions`: two
Definition-of-Done items of TASK-001 require actually running `bun run migrate`
and `bun run seed:users`, and the BE machine had no disposable Postgres (Docker
daemon down; the only Postgres present is the human's own service, which
PROTOCOL forbids the team connecting to or guessing credentials for). Jason
offered three ways out: (1) start Docker, (2) give a scratch `DATABASE_URL`,
(3) let TASK-001 go to `REVIEW` with those two items deferred.

> answer (2026-08-20, human, verbatim): "ทำไมต้องใช้docker ไม่จำเป็นมั้ง
> database สร้างให้ ที่ local แล้ว เอาไปทำที่local ก่อน 127.0.0.1 pass smart2026
> db: code_report"

What this settles — the human chose route (2) and explicitly rejected Docker:

- **Docker is not required and is not to be treated as a prerequisite** for this
  project. Nobody should ask for the Docker daemon again on this account.
- A **local database has been created for the team** and work is to be done
  against local first. The facts he gave, verbatim and unmodified:
  - host: `127.0.0.1`
  - database: `code_report`
  - password: `smart2026`
- This is a **real environment fact supplied by the human**, so it satisfies the
  DATA REQUEST: the team is permitted to use this local database for the
  `migrate` / `seed:users` evidence. It replaces the "disposable Postgres"
  wording in TASK-001's DoD — the human decided what we run against.

*What it does not settle* — see **Q11** below. He gave a host, a password and a
database name but **no username and no port**, and a Postgres connection string
cannot be formed without a username. Porter is not guessing one (`postgres` is
merely the common default, not a fact), and PROTOCOL forbids probing a real
environment to find out.

### ~~Open — Q11~~ CLOSED 2026-08-20 (the original wording, kept for the record)

- **Q11 (missing connection fields) — ANSWERED, see above; no longer blocks
  anything.** The local database
  answer gives host `127.0.0.1`, password `smart2026`, database `code_report`,
  but no **username** and no **port**.
  **Question for the human (asked in Thai in chat):** what is the database
  **username**, and is the port the standard **5432**? A single line in the form
  `postgresql://<user>:smart2026@127.0.0.1:<port>/code_report` answers both.

### Answered 2026-08-20 — Q-SA-9 (which date puts a commit in the chosen day)

Raised by **Sober** in SPEC-001 `## Questions` and routed to Porter. The answer
is recorded there as well, next to his question, so he reads it in his own file.

> answer (2026-08-20, human, verbatim): "2.commiter date"

- **A commit is counted by the COMMITTER date** — when it landed, not when it was
  written. `git log --since/--until` already select on exactly that, so **this
  confirms the current behaviour and no code changes because of it**. It is now a
  stated decision instead of Sober's working default.
- **What it does not settle, and Porter is not stretching it to cover:** the date
  the tool collects, stores and *prints* per commit is still the **author** date
  (`%ad`). He answered which date decides membership of the day, not which date is
  shown. See **Q13** below.

### Answered 2026-08-20 (later session) — Q-SA-10, Q13, Q-FE-6, Q-FE-7, Q-FE-8, Q-FE-9

Six answers arrived in one line from the human, verbatim:

> "Q-SA-10=ยอมรับได้, Q13=committer, Q-FE-6=ได้, Q-FE-7=ข้อความ, Q-FE-8=มี,
> Q-FE-9=ใช้ได้, ไปเลย"

Four of them (Q-FE-6…Q-FE-9) were raised by **Fern** in TASK-008 `## Questions`
and are routed **Fern → Sober**; Porter records the answers here and relays them
to Sober in the log. **Porter writes nothing in `tasks/` or `specs/`** — turning
any of these into work is Sober's, as a TASK line.

- **Q-SA-10 → "ยอมรับได้" = acceptable.** The native date picker drawing a
  Buddhist-era year from the OS locale **is accepted**; Requirement 15's
  acceptance criterion still counts as met. This is option (a): **zero work, what
  ships today stands.** Written into Requirement 15 as a scope note and into the
  matching acceptance criterion. No controlled-picker TASK line is needed.
- **Q13 → "committer".** He named the option, not a sentence: the date the tool
  stores and prints per commit becomes the **committer** date — reading (a). Now
  **Requirement 16** with its own acceptance criterion. This one **does** change
  code (the collected field is `%ad` today); it is a later TASK line and Sober
  writes it. Nothing in flight changes because of it.
- **Q-FE-6 → "ได้" = fine/go ahead.** The question offered the shipped working
  default — **GFM on** (tables render) — as the forgiving direction, so this reads
  as: **the working default is confirmed, keep GFM.** No REQ requirement falls out
  of it; what Fern asked for is a **one-line binding in SPEC-001** so Jason's
  prompt and her renderer agree by specification instead of by luck, and that
  binding is **Sober's to write**.
- **Q-FE-7 → "ข้อความ" = text.** Of the three options — render the image, show
  the description text plus the address, render nothing — "text" is the middle
  one: **images are not fetched; they appear as text.** Now **Requirement 17**
  with an acceptance criterion. The privacy point behind the question (an
  untrusted repository choosing an address the reader's browser calls) is
  therefore closed in the safe direction.
- **Q-FE-8 → "มี" = there is one / have one.** A finished report must offer a way
  to start a new report from that same screen. Now **Requirement 18** with an
  acceptance criterion. Only the *existence* is settled — the control's **label
  is copy** and stays inside the deferred wording review, so nobody invents
  wording for it. It reaches Fern as a TASK line from Sober and no other way.
- **Q-FE-9 → "ใช้ได้" = usable / they'll do.** The **22 provisional strings ×
  2 languages** added by TASK-008 are **accepted as authored**. Porter is reading
  this **narrowly, as Q-FE-9 was asked** — it covers TASK-008's strings, not the
  whole copy bundle. **Whether it also releases the rest of the deferred wording
  (Q-FE-1 `dictionaries.ts` + Q-BE-2 `messages.ts`, answered "เดี๋ยวดู") is not
  something Porter will assume: see Q14 below.** Until he says so, every other
  string stays provisional and **no engineer rewords anything on their own
  judgement**.

### Answered 2026-08-20 — Q14, and with it the COPY BUNDLE is fully closed

> answer (2026-08-20, human, verbatim): "Q14=ทั้งระบบ, ไปเลย"

- **"ทั้งระบบ" = the whole system.** The approval Q-FE-9 gave to TASK-008's 22
  strings reaches **all** of the user-facing wording, not just that slice:
  Fern's th/en UI strings in `dictionaries.ts` **and** Jason's th/en error
  strings in `messages.ts` are **accepted as authored**.
- **The COPY BUNDLE (Q-FE-1 + Q-BE-2) is therefore CLOSED.** "เดี๋ยวดู" was a
  defer; this is the answer that ends it. Every string the two engineers wrote
  stands as written — nothing is provisional any more, and **no rewording work
  falls out of this answer**. Zero code changes, zero TASK lines.
- **What this does NOT change — read this before touching any string:**
  - **Requirement 14 still stands unchanged.** The on-screen product name is
    **`KnowCode`**; the frontend's current "Code Report" is a placeholder he
    already replaced by naming the product, and Q12 confirmed it. A blanket
    approval of the copy **as authored** is not a decision to keep a placeholder
    he has separately overruled — the specific requirement wins over the general
    approval. The `KnowCode` TASK line is still Sober's to write, exactly as
    before, and its wording is now settled rather than deferred.
  - **Q12(b) is now closed by consequence.** The Thai rendering of the name was
    parked with the wording review ("if he wants one it comes back with that
    review"); the review has come back with everything approved as authored, so
    the literal Latin `KnowCode` in both UI languages is **confirmed**, not
    assumed. Nobody invents a Thai form.
  - **The standing "no engineer rewords anything on their own judgement" rule
    still holds.** It is no longer a hold pending his read-through — it now means
    the copy is approved and changing it needs a TASK line like any other work.
  - Labels for **not-yet-built** UI (e.g. Requirement 18's "start a new report"
    control) are **not** covered: they do not exist yet, so there was nothing for
    him to approve. Whoever writes that TASK line authors the label and it is
    subject to the same rule as any other new string.
- **Nothing was blocked by Q14 and nothing is unblocked by it.** No status moves.

### ~~Open (NON-BLOCKING)~~ ANSWERED 2026-08-20 — Q14 (original wording, kept for the record)

- **Q14 (how far "ใช้ได้" reaches) — NON-BLOCKING; nothing waits.** Q-FE-9 asked
  only about the 22 new strings TASK-008 introduced, and "ใช้ได้" answers exactly
  that. It does **not** state whether the rest of the user-facing wording — the
  th/en UI strings in the frontend's `dictionaries.ts` and the th/en error
  messages in the backend's `messages.ts`, both parked since he answered
  "เดี๋ยวดู" — is now approved too, or is still waiting for his read-through.
  Porter is not deciding that by inference: an approval he did not give would
  freeze wording he still wants to change, and treating it as still-deferred
  costs nothing. **Working default = the rest of the copy bundle stays deferred
  and untouched.** Asked in Thai; on the board.

### ~~Open (NON-BLOCKING)~~ ANSWERED 2026-08-20 — Q13 (original wording, kept for the record)

- **Q13 (the date shown next to a commit) — NON-BLOCKING; nothing waits.**
  Selection is now settled as the **committer** date, while the date stored and
  displayed per commit is the **author** date. They are identical until someone
  rebases, cherry-picks or amends — after which a report can correctly include a
  commit whose printed date falls outside the reported period. Two defensible
  readings and Porter is picking neither: (a) show/store the committer date too,
  so a report is internally consistent with its own period; (b) keep the author
  date deliberately, because "when the developer did the work" is what a work
  report is about, and accept the occasional outside-looking date.
  **Working default = current behaviour (author date displayed), unchanged until
  he answers.** Either way it becomes a later TASK line, not a change to anything
  in flight. Asked in Thai; on the board.
  > answer (2026-08-20, human, verbatim): "Q13=committer" — reading **(a)**. Now
  > **Requirement 16**. See the answered section above.

### Answered 2026-08-20 (partly) — the human ran `migrate` / `seed:users` himself

The board item "TASK-001 `migrate` / `seed:users` evidence — NOT Jason's to run"
was with the human, because running commands against a real database is outside
BE's hard boundaries. He ran both commands and pasted the console output.

**Verbatim output stored at `../project-docs/db-migrate-seed-run-2026-08-20.md`**
(two runs, unedited). What it establishes:

- **`bun run migrate` succeeded against the authorised database**
  (`postgresql://postgres:smart2026@127.0.0.1:5432/code_report`): `001_init.sql`
  applied on the first run; the second run skipped it as already applied. That
  is real evidence for one of the two outstanding TASK-001 DoD items — **whether
  it closes that item is Sober's call at review, not Porter's**.
- **`bun run seed:users` did not run at all.** It exits 1 immediately with
  `SEED_USERS_FILE is not set`. So the second DoD item is **still open**, and it
  is open on **missing stakeholder data**, not on code: see DATA REQUEST 3.

### DATA REQUEST 3 — CLOSED 2026-08-21: the console output arrived

- **The human supplied the verbatim console output** of his `bun run seed:users`
  run, stored unedited at **`../project-docs/seed-users-run-2026-08-21.md`**.
  **DATA REQUEST 3 is now closed in both halves** — the accounts were always his
  (2026-08-20 18:34) and the evidence of the run now exists in the workspace.
- **What the output says:** `[seed:users] updated admin` and
  `[seed:users] done — 1 account(s) processed`. So the command **reached its own
  completion line** and did **not** hit the `SEED_USERS_FILE is not set` exit
  that both 2026-08-20 runs hit, and `bun run` printed none of the
  `error: script "seed:users" exited with code 1` line those runs printed.
- **What the output does not say, recorded rather than smoothed over:** the exit
  code is not printed, so "exited 0" is an inference from a missing error line,
  not a recorded fact; and the word is **`updated`, not `created`**, so the
  `admin` row already existed from a run this workspace has no record of. The
  end state — an existing account with a password only the stakeholder knows —
  is what the DoD item is about, but the record must not be read as "this run
  created the account".
- **Whether this closes the TASK-001 DoD item is Sober's call at review, not
  Porter's.** Porter's job was to get the evidence into the workspace in the
  shape the precedent set (`../project-docs/db-migrate-seed-run-2026-08-20.md`);
  it is there. Nothing else on the project was waiting on this.
- **No credential material entered the workspace**: only the console output was
  pasted, the accounts JSON stays outside both repositories, and no password
  appears in any file, log or REQ.

### Q15 — ANSWERED 2026-08-21 — "admin เริ่มต้นก่อน ให้ Tanya ใช้ test ได้ด้วย"

> answer (2026-08-21, human, verbatim): "admin เริ่มต้นก่อน ให้Tanya ใช้test ได้ด้วย"

- **Settled: the single `admin` account is the intended starting arrangement.**
  Separate per-person logins for the CEO / SA / PM are not needed now. Nothing in
  Requirement 10 changes — permissions stay identical, there is still no
  user-management screen, and accounts are still seeded at installation; this
  answer only settles *how many accounts exist today*. **Zero code change**, as
  the question already said. The `admin` account that the 2026-08-21 seed run
  processed is therefore the account TASK-009's acceptance run uses.
- **The second half of his sentence is NOT settled and is not being guessed** —
  "ให้ Tanya ใช้ test ได้ด้วย". This project's team is Porter, Sober, Jason and
  Fern; there is **no QA role on `code-report`** (Tanya is the workspace Tester
  role being trialled on `smart-scheduler`). It could mean the `admin` login is
  simply also used for testing, or that a second account is seeded for her, or
  that Tanya joins this project as QA — the last being a team/chain change.
  **Carried to REQ-003 as Q20 (NON-BLOCKING)**, where the rest of today's open
  questions live.

### ~~Q15 original~~ (kept for the record) — one `admin` account, or one per person?

- **Where it comes from:** the `seed:users` output above processed **1 account**,
  named `admin`. **Requirement 10** describes the users as **the CEO, the SA and
  the PM** — three people, with deliberately identical permissions — and
  Requirement 10.3 says accounts are put in place once, at installation, with no
  user-management screen inside the tool. So a person added later needs the
  stakeholder to run the seed again.
- **The question, asked in Thai and answerable in one line:** is one shared
  `admin` login the intended arrangement for all three people, or are separate
  accounts per person still to be seeded?
- **Why it is not guessed:** either answer is defensible and neither is a
  technical decision. One shared login is a legitimate choice for an internal
  three-person tool; separate logins is what Requirement 10's own wording
  suggests. The difference is visible in the product — the report screen greets
  the logged-in `displayName` — so inventing an answer would put an invented
  name on screen.
- **Blocking scope: none.** No TASK, no engineer and no review depends on how
  many accounts exist; the login flow behaves identically either way, and
  TASK-009's acceptance run needs exactly one working account, which now exists.
  If the answer is "separate accounts", it costs **no code change** — it is the
  stakeholder re-running the same seed with a longer JSON file.

### Original text — DATA REQUEST 3 — ANSWERED IN PART 2026-08-20 18:34: the accounts exist, the evidence does not

- **The human's verbatim answer:** "ฉันสร้างแล้ว รันไปแล้ว" — he created the
  accounts JSON file himself and ran the command. **The stakeholder-data half of
  DATA REQUEST 3 is therefore closed**: the accounts are his, nobody on the team
  invented a username or a password, and the file stays outside this workspace
  exactly as asked.
- **The evidence half is still open, and it is a smaller ask than the original.**
  He sent no console output with that message, so the workspace holds **no record
  of what the command actually did** — not whether `seed:users` exited 0, not how
  many accounts it created, not whether it hit the same
  `SEED_USERS_FILE is not set` exit as both runs on 2026-08-20. "He ran it" and
  "it succeeded" are two different facts and Porter is recording only the one he
  was given.
- **Why the output is still needed and is not bureaucracy:** TASK-001's DoD item
  is *evidence of a successful `seed:users` run*, and **whether any run closes it
  is Sober's call at review**. Sober cannot make that call against a sentence in
  a chat; the precedent for how this lands is the existing
  `../project-docs/db-migrate-seed-run-2026-08-20.md`. Asked in Thai: paste the
  console output of the run into `project-docs/`.
- **Stated in the ask, because the previous half of this request was about
  exactly this:** he pastes **only the console output**, never the JSON file and
  never a password. If the output prints the usernames it created, that is fine
  and he need not redact it; if he would rather redact, the count of accounts
  created is enough.
- **Blocking scope, unchanged and still the narrowest on the board: exactly one
  TASK-001 DoD item.** It blocks no other TASK, no engineer, and neither of the
  two reviews in Sober's queue.

### Original text — Open — DATA REQUEST 3 (the accounts to seed), raised by Porter 2026-08-20

- **DATA REQUEST 3 — the list of login accounts.** `bun run seed:users` reads a
  JSON file whose path is given in `SEED_USERS_FILE`, in the shape documented in
  `code-report-back/.env.example`:
  `[{ "username": "...", "displayName": "...", "password": "..." }]`.
  **Nobody on the team may invent usernames or passwords** — REQ-001 Requirement
  10.2 says the stakeholder creates the accounts, and passwords are real-world
  credentials that only he supplies (PROTOCOL "Missing knowledge & real-world
  data"). **Asked in Thai in chat:** he writes that JSON file himself, outside
  both repositories, and re-runs the command with the variable set; the file is
  his to keep and delete afterwards, and its contents are never to be pasted
  into any file in this workspace, this log or a REQ.
- **Blocking scope: exactly one TASK-001 DoD item** (`seed:users` evidence), the
  same item that was already sitting with the human. It blocks nothing else on
  the project — no other TASK, and no other role.

### Q-SA-16 — ANSWERED 2026-08-21 — "ค" = he runs the two jobs himself

> answer (2026-08-21, human, verbatim): "Q-SA-16=ค เดี๋ยวรันเอง"

Raised by **Sober** in TASK-014 `## Questions` (BLOCKING) and routed to the human
by Porter. Recorded **here** because **Porter may not write in `tasks/`** —
**@Sober transcribes it into TASK-014 `## Questions`**, exactly as he did with
Q-SA-6 (the same precedent, same file).

- **He chose option (ค): the stakeholder runs the two jobs himself** and pastes
  the evidence into `../project-docs/` — "เดี๋ยวรันเอง" = he will run it shortly.
  **The team never connects to a database at all.** This is the same arrangement
  he already used for `migrate` / `seed:users`, and it is the reading that keeps
  PROTOCOL's no-real-environment rule intact rather than relaxing it.
- **What this settles:** options (ก) and (ข) are **closed** — the team does **not**
  point `DATABASE_URL` at his `code_report`, and **no throwaway database will be
  created**. It also makes the trailing half of Q-SA-16 moot: **the `admin`
  password is not needed and must not be asked for again**, because nobody on the
  team logs in.
- **What it does NOT settle, and I am not deciding it — it is squarely Sober's:**
  TASK-014 is written as work for *Jason* (start the server, submit two jobs, read
  the fields back). Under (ค) the person at the keyboard is the stakeholder, so
  **what TASK-014 now is** — an evidence-review task for Jason, a rewritten
  instruction sheet, or something else — and **when its DoD lines count as met**
  are TASK decisions. Porter moved no TASK status and wrote nothing in `tasks/`.
- **Porter's half of the loop is running:** the ask went to the human in Thai,
  pointing at TASK-014's Run A / Run B and naming exactly what to paste (the two
  `GET /api/reports/:jobId` bodies and the provider/model log lines for the three
  AI stages), with the standing rule that **no secret** — session cookie, DB
  password, AI token — goes into `../project-docs/`. When the file lands, Porter
  points the Question at it; **whether it closes TASK-014's DoD is Sober's call.**
- **Blocking scope: this removes the block on TASK-014.** Jason is no longer
  parked on a human answer — but he is not automatically started either; that is
  Sober's move. TASK-009's runs 1–11 are a *different* question → **Q24** below.

### Q24 — CLOSED BY PORTER 2026-08-21 — asked twice, not understood twice; the recommendation stands and Q24 goes away

> answer (2026-08-21, human, verbatim): "Q24 -  ไม่เข้าใจเลยมันคืออะไรวะ ตัวนี้"

- **This is the second time he has told me he does not know what Q24 is** (the
  first was "คืออะไร เอาตามที่แนะนำเลยแล้วกัน", below). Asking a third time would
  buy nothing: the reason the question is unintelligible to him is that **it is
  about an internal artifact — TASK-009's eleven acceptance runs — that he has
  never been shown and has no reason to carry in his head.** A question the
  stakeholder cannot answer is a question Porter should not be holding open.
- **So Porter closes it, which is within Porter's own authority: it was Porter's
  question to the human, and Porter withdraws it.** The recommendation already on
  file (below) becomes the settled working arrangement — **the team writes the
  eleven runs as an exact click-through script; he runs them once himself**, the
  same way he already runs `migrate` / `seed:users` and TASK-014's two jobs.
- **Why this is safe to close rather than escalate, stated instead of assumed:**
  (1) it commits **nothing** today — TASK-009 is `TODO` and not startable, so
  nobody's time is being spent on the strength of it; (2) the arrangement it
  records is the one **already in use** on this project three times over, not a
  new permission; (3) the alternative — the team running them — would require a
  **database connection he has declined twice** (Q-BE-1, Q-SA-16), so closing it
  this way cannot quietly grant anything; (4) it is **reversible by one line** the
  day the script is actually in front of him and the question means something.
- **What Porter did NOT do:** treat "ไม่เข้าใจ" as a yes, and re-word the same
  question a third time. He was told plainly, in Thai, what it was about — twice —
  and the honest conclusion is that the question was mis-aimed, not that he is
  refusing to answer it.
- **Still not Porter's to schedule. @Sober: the TASK-009 re-scope is unchanged and
  is yours** — this closes a question, not a TASK. Porter wrote nothing in
  `tasks/` and moved no TASK status.

### ~~Q24~~ (kept for the record) — ANSWERED 2026-08-21 BY DELEGATION — "คืออะไร เอาตามที่แนะนำเลยแล้วกัน"

> answer (2026-08-21, human, verbatim): "Q24=คืออะไร เอาตามที่แนะนำเลยแล้วกัน"

- **Two things arrived in one line, and they are not the same thing.** He asked
  **what the question even is** ("คืออะไร"), and then **delegated the choice**
  ("เอาตามที่แนะนำเลยแล้วกัน" — go with whatever you recommend). A delegation
  given without the question being understood is not a decision about the eleven
  runs; it is permission for Porter to propose one. **Porter therefore explained
  it back to him in Thai in the same reply, and records the recommendation here
  so it is reversible by one line rather than buried.**
- **Porter's recommendation, recorded as the working answer:** the team writes
  the eleven runs as an exact click-through script (which screen, which language,
  what to look at), and **he runs them himself once**, the same way he ran
  `migrate` / `seed:users` and TASK-014's two jobs. Everything in TASK-009 that
  can be checked **without** a real database, the team keeps doing itself.
- **Why that and not the alternative:** runs 1–11 are the UI acceptance run in
  th + en and they need a running app on a **real database**. He has now declined
  a team database connection twice (Q-BE-1, Q-SA-16), and **Q-SA-17 = "ก"** has
  him starting the backend on his own machine anyway — so the cheapest honest
  arrangement is the one already working, not a new permission.
- **Explicitly reversible:** if he would rather the team run them, one line
  changes it — and that line would be a *database permission*, which is the part
  Porter will not assume in either direction.
- **Still not Porter's to schedule.** **Re-scoping TASK-009 on this is @Sober's**
  — Porter wrote nothing in `tasks/` and moved no TASK status. It also does not
  make TASK-009 startable by itself.

### ~~Q24 original~~ (kept for the record) — does "ค" also cover TASK-009's runs 1–11? — OPEN 2026-08-21 (**NON-BLOCKING**)

- **Falls out of Q-SA-16 and is not the same question.** Q-SA-16 asked about
  **two** jobs submitted over the API with no browser. TASK-009's runs 1–11 are
  the **UI** acceptance run (th + en, three screens, someone clicking through) and
  they need the same real database. "เดี๋ยวรันเอง" was said about the two jobs; it
  does not state that he also wants to sit through eleven UI runs himself.
- **Asked in Thai:** "รัน 12/13 พี่รันเองแล้ว — ส่วน TASK-009 อีก 11 รอบที่เป็นการ
  กดผ่านหน้าจอ (ไทย+อังกฤษ) พี่จะรันเองด้วยไหมครับ หรือค่อยคุยกันตอนถึงจริง ๆ?"
- **Not guessed, and the cost is concrete:** assuming he will do eleven manual UI
  runs commits his time without asking; assuming the team may run them instead
  quietly re-opens the database permission he just declined twice.
- **Blocks nothing.** TASK-009 is `TODO` and **PAUSED until TASK-013 is DONE**
  (Q19 ordering), so this comes due only when the frontend rework lands. Recorded
  now so it is not rediscovered as a surprise then.

### Q-SA-18 — ANSWERED 2026-08-21 — "Bruno" + a path + "อ่าน docs ก่อน"

> answer (2026-08-21, human, verbatim): "Q-SA-18= C:\Users\Admin\Downloads\bruno\bruno  อ่านdocs ก่อน"

**@Sober — this is your question and TASK-014 is your file; recorded here because
Porter may not write in `tasks/`. Please transcribe it into TASK-014
`## Questions`.** Porter names no DoD line, no format detail and no work.

- **The choice is made: Bruno, not `curl`.** He answered with a Bruno collection
  path rather than picking the option in words, and he had already worked with
  Bruno (`ai-api-center-bruno/`), so the runbook Jason wrote as `curl` is to be
  re-formatted. **Whether that is a re-format, a replacement, or both forms side
  by side is Sober's call, not Porter's** — Jason's `curl` sheet is currently in
  `REWORK` for D1/D2, so the two changes land in the same neighbourhood.
- **The path is verified, not relayed on trust** (the D1 lesson from the same
  review — absolute paths, checked). `C:\Users\Admin\Downloads\bruno\bruno`
  **exists** and is a Bruno collection: `bruno.json`, an `environments\` folder,
  and eight `.bru` files (`GET Info`, `GET Models`, five `POST Chat - …`, and
  `POST Chat Multi (4 models parallel)`). It is an **AI API CENTER** collection —
  i.e. an example of the shape he expects, not a collection for `code-report`.
- **What is NOT established, and Porter is not filling in: which "docs".** There
  is **no `docs` file or folder anywhere under that path** (checked to depth 3).
  So "อ่านdocs ก่อน" is either "read Bruno's own documentation before writing one"
  or "read the collection at this path first as the reference". → **Q33,
  NON-BLOCKING.** Meanwhile the safe reading is the one that needs nothing from
  outside the machine: the collection at the given path is the reference.

### Q33 — ANSWERED 2026-08-21 — the docs are **inside** the `.bru` files

> answer (2026-08-21, human, verbatim): "Q33 - เปิด ดูไฟล์ .bru ก่อน จะเห็น docs ข้างใน"

- **Settled, and it is the reading that needs nothing from outside this machine.**
  "อ่านdocs ก่อน" = open the `.bru` files at
  `C:\Users\Admin\Downloads\bruno\bruno` and read the documentation **written
  inside each request**. It is **not** Bruno's website documentation, and no
  internet fetch is being asked for.
- **Verified before relaying, not taken on trust** (the D1 lesson): every one of
  the eight `.bru` files carries a **`docs { … }` block** alongside its `meta` /
  request / `tests` blocks, and those blocks are written **in Thai** — e.g.
  `GET Info.bru` documents "ผลลัพธ์ที่คาดว่าจะได้ (200 OK)" with the expected JSON
  body. So the collection is not just a set of requests: it is **the house style
  for how a request is documented**, which is what he wants copied.
- **@Sober — this joins Q-SA-18 in your TASK-014 transcription, and it makes that
  question smaller, not bigger.** What it settles is *where to look*; **whether
  Jason's runbook becomes a Bruno collection, keeps `curl`, or carries both is
  still your call**, and so is whether a `docs` block per request becomes a DoD
  line. Porter names none of that.
- **Blocks nothing.** TASK-014 Phase A is in `REWORK` for D1/D2, both unrelated.

> **Sober, 2026-08-24 — both Q-SA-18 and Q33 are now TRANSCRIBED into TASK-014
> `## Questions` and RULED; nothing on this REQ waits on me for them any more.**
> The ruling in one line: **Bruno takes Steps 2–4 only**, `curl` survives verbatim
> as a labelled fallback, the collection is authored **inside the TASK file**
> (not on disk) with an absolute destination path for him, and a `docs { … }`
> block per request became a DoD row. It landed as **D3** on the existing D1/D2
> return trip — one trip, not two. **One new NON-BLOCKING question goes up to
> @Porter: Q-SA-21** — English or Thai for those `docs` blocks. I ruled English
> and Phase A proceeds either way; it is asked because a `.bru` file reaches him
> *verbatim* with no relay step, and his own eight are documented in Thai.

### Q-SA-21 — ANSWERED 2026-08-24 by the human — **"ไทยหลัก อังกฤษรอง"**

> answer (2026-08-24, human, verbatim): "ไทยหลัก อังกฤษรอง"

- **Thai is primary, English secondary.** This reverses Sober's English ruling
  for the `docs { … }` blocks, and it costs a translation pass on content that
  Jason has already written in English (TASK-014 §Implementation Notes item 7).
- **@Sober — the ruling is yours to rewrite, not mine.** Whether "อังกฤษรอง"
  means Thai text with an English line beside it, or Thai text with the English
  kept only where a term has no Thai equivalent, is a wording decision inside
  *your* TASK; I am not naming a format, and I am not touching `tasks/`.
- **Scope read NARROWLY, on purpose:** the question he answered was about the
  Bruno `docs` blocks, so that is all this answer changes. **PROTOCOL's "team
  artifacts are English" is untouched** — REQ/SPEC/TASK files, board and log
  stay English until he says otherwise. Whether he meant something wider is
  **Q39**, non-blocking; nothing waits on it.
- Consistent with his Q37 answer the same day (mixing English into Thai is fine
  and he counts such words as Thai), which is why "Thai first, English where it
  is needed" is a coherent instruction rather than a contradiction.

### Q39 — ANSWERED 2026-08-24 — **"anything I have to read" (stakeholder-facing, not team-internal)**

> answer (2026-08-24, human, verbatim): "แค่เอกสารที่ฉันต้องอ่าน หรือ UI หรือ
> อะไรก็ตามที่ฉันต้องอ่าน"

- **The dividing line is the READER, not the file type.** "ไทยหลัก อังกฤษรอง"
  applies to **everything the stakeholder himself reads** — the product UI, and
  any document or output produced *for him* (the Bruno runbook he runs, report
  output, hand-over docs). His word "แค่" (only) is a **limit**: it does **not**
  reach the internal artifacts only the team reads.
- **Therefore, ruled clearly:**
  - **Team-internal, English stays** — REQ/SPEC/TASK prose, `board.md`, the log.
    He does not read these; PROTOCOL's "team artifacts are English" is intact.
    (Verbatim human evidence and product strings may be quoted in them as before.)
  - **Stakeholder-facing, Thai-primary/English-secondary** — the UI he reads and
    any doc/output written for him.
- **The one thing Porter will NOT decide by assumption → Q40.** He named "UI",
  but on 2026-08-24 Q37 also said **he edits Thai copy himself** and the Q14 copy
  bundle is CLOSED (no team reword without a yes/no + TASK line). So this answer
  states a **principle** for stakeholder-facing language; whether it also
  **authorises the team to go reword existing approved UI strings** to be
  Thai-primary — or is forward-only with him still owning Thai copy — is a scope
  question, not a design one, and it is **Q40**. Read forward-only until answered;
  no existing UI string is reworded on the strength of Q39 alone.

### Q40 — ANSWERED 2026-08-24 — **"แก้เลย" = the team does the reword pass**

> answer (2026-08-24, human, verbatim): "แก้เลย"

- **Option A chosen: the team goes and rewords the EXISTING UI strings** to be
  Thai-primary/English-secondary ("ไทยหลัก อังกฤษรอง", per Q-SA-21/Q39). Q40's
  binary was "team does the reword pass" vs "forward-only principle he applies
  himself"; "แก้เลย" ("just fix it") is the first.
- **This OVERRIDES Q37 for this work.** Q37 (2026-08-24) said *he* edits Thai
  copy himself; his direct "แก้เลย" to "อยากให้ทีมไล่แก้…ไหม" hands that reword
  work to the **team** instead. Recorded as an override, not treated as still
  binding.
- **This is now real, actionable scope, so it becomes its own deliverable:**
  **REQ-007** (reword existing UI strings to Thai-primary), `READY_FOR_SA`,
  handed to @Sober. Without a REQ the reword "does not exist" (PROTOCOL); with
  it, Sober can spec and the engineers can draft.
- **What "แก้เลย" does NOT clearly settle, and Porter will not guess → Q41.**
  Q40's option A was worded "*a reword pass, which needs his yes/no per Q14*". So
  the plain reading keeps the standing **Q14 gate**: reworded strings return to
  him for yes/no before they ship. But "แก้เลย" could equally be an impatient
  "just fix it, don't send each string back". **Working default = Q14 stands (the
  safe, reversible direction — an approval he did not clearly waive is not
  assumed waived; no un-approved Thai copy reaches the screen).** The waiver
  question is **Q41**, NON-BLOCKING — drafting can start regardless; only the
  final sign-off gate is in question.
- **What "แก้เลย" does NOT touch:** the product name stays the Latin `KnowCode`
  (Req 14); on-screen dates stay `DD/MMM/YY` (Req 15); team-internal artifacts
  stay English (Q39). The concrete FORM of "อังกฤษรอง" (Thai with an English line
  beside it, vs English kept only where a term has no Thai equivalent) is a
  wording/design decision for @Sober — the same open point he named on Q-SA-21 —
  **not named here.**

### Q41 (to the human) — NEW 2026-08-24, NON-BLOCKING

Now that the team does the reword (Q40): do the reworded Thai-primary strings
still come back to you for a yes/no before they ship (the standing Q14 process),
or does "แก้เลย" mean go ahead and ship the "ไทยหลัก อังกฤษรอง" version without a
per-string sign-off? Working default until you answer: they come back to you for
yes/no. Nothing waits on this — the team can draft either way.
Thai, ready to send:
> "เรื่องแก้ UI เป็นไทยนำ — ให้ทีมแก้เสร็จแล้วส่งให้พี่ดู yes/no ก่อนขึ้นจริงไหมครับ
> หรือ 'แก้เลย' คือให้ทีมแก้แล้วขึ้นได้เลยไม่ต้องส่งกลับ? ตอนนี้ผมตั้ง default ไว้ว่า
> ส่งให้พี่ดูก่อนครับ"

### ~~Q40 original~~ (kept for the record)

**Q40 (to the human) — NON-BLOCKING.**
Q39 says the Thai-primary rule covers the UI he reads. Q37 (same day) says he
edits Thai copy himself and the copy bundle is closed. So: does he want the
**team** to now go through the existing UI and make current strings Thai-primary
(a reword pass, which needs his yes/no per Q14), or is Q39 a going-forward
principle he applies himself when he edits Thai copy? Nothing waits on this —
no UI-language TASK is written meanwhile.
Thai, ready to send:
> "ต่อเรื่อง 'ไทยหลัก อังกฤษรอง' ที่รวม UI ด้วย — อยากให้ทีมไล่แก้ข้อความใน UI
> ที่มีอยู่ตอนนี้ให้เป็นไทยนำเลยไหมครับ หรือถือเป็นแนวทางไว้ แล้วพี่แก้คำไทยเอง
> ตามที่เคยบอก? (ผมยังไม่สั่งแก้ UI จนกว่าจะได้คำตอบครับ)"

### ~~Q39 original~~ (kept for the record)

**Q39 (to the human) — NON-BLOCKING.**
Does "ไทยหลัก อังกฤษรอง" apply only to the Bruno `docs` blocks he was asked
about, or to everything the team writes for him? Read narrowly until answered.
Thai, ready to send:
> "เรื่องภาษา 'ไทยหลัก อังกฤษรอง' — ที่ตอบมา หมายถึงเฉพาะ docs ใน .bru ที่ถามไป
> ใช่ไหมครับ หรืออยากให้เอกสารของทีมทั้งหมด (REQ/SPEC/TASK, board, log)
> เป็นไทยนำด้วย? ตอนนี้ผมตีความแบบแคบไว้ก่อน คือเฉพาะ docs ใน .bru ครับ"

### ~~Q33 original~~ (kept for the record) — which "docs" should be read first?

- **Falls out of Q-SA-18.** He wrote "อ่านdocs ก่อน" next to a path that contains
  no docs of its own.
- **Asked in Thai:** "ที่บอกว่าอ่าน docs ก่อน — หมายถึงเอกสารของ Bruno เอง
  (เว็บ docs.usebruno.com) หรือหมายถึงให้ดู collection ที่พี่ให้ path มาเป็นตัวอย่าง
  ครับ? (ในโฟลเดอร์นั้นไม่มีไฟล์ docs อยู่)"
- **Not guessed:** the two readings send the work to different places — one is
  reading a folder that is already on this machine, the other is fetching
  documentation from the internet, which is not something this team has been
  asked to do before. **Cheap to ask, awkward to undo.**
- **Blocks nothing:** TASK-014 Phase A is in `REWORK` for two unrelated one-line
  fixes (D1/D2), and the collection on disk is enough to model a `.bru` file on.

**No data request is open on REQ-001 as of 2026-08-21** — DATA REQUEST 3 was the
last one and it is closed in both halves (see above). **Q15 is now ANSWERED
(`admin` first)**; its unanswered half ("ให้ Tanya ใช้ test ได้ด้วย") was carried
as **REQ-003 Q20** and is answered there.

**Current 2026-08-21: NO question is open on REQ-001.** Q33 is **ANSWERED** (the
docs live inside the `.bru` files, verified) and Q24 is **CLOSED by Porter** (see
above). **Two answers now wait for @Sober to transcribe into TASK-014 — Q-SA-18
(Bruno) and Q33 (where its documentation lives).**

**Superseded 2026-08-21 (this session): one question is open on REQ-001 — Q33
(NON-BLOCKING, above), and Q-SA-18 is ANSWERED (Bruno) and waits for @Sober to
transcribe into TASK-014.**

**Superseded 2026-08-21 (earlier session): no question is open on REQ-001.** Q24 is
**answered by delegation** (above) with Porter's recommendation recorded and
reversible; re-scoping TASK-009 on it is @Sober's. The paragraph below is kept
as it was written.

**Superseded 2026-08-21 (earlier session):** one question is now open on REQ-001 —
**Q24**, NON-BLOCKING, above. **Q-SA-16 is ANSWERED (ค)**, which unblocks
TASK-014, and one **evidence hand-over is in flight**: the stakeholder runs
TASK-014's two jobs himself and pastes the output into `../project-docs/`
(the DATA REQUEST loop, Porter's, tracked on the board). **Nothing on this
project is blocked** on a human answer any more.
