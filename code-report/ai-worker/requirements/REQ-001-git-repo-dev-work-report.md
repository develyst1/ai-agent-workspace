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

> **Consolidated 2026-08-25 (PM housekeeping).** Every question ever raised on
> REQ-001 (Q1–Q15, Q24, Q33, Q-SA-1…Q-SA-10, Q-SA-16, Q-SA-18, Q-SA-21, Q11–Q14,
> Q39, Q40, Q-BE-1, Q-FE-2, Q-FE-6…Q-FE-9, DATA REQUESTS 1–3) is ANSWERED or
> CLOSED, and each answer is already folded into the numbered Requirement /
> Constraints / Out of Scope text above. The full verbatim Q&A trail (human's
> Thai answers included) is preserved in
> `archive/REQ-001-2026-08-25-pre-consolidation.md` and in the daily logs.
> Requirement numbering (Req 1–18) is UNCHANGED by this consolidation.

Settled working arrangements recorded elsewhere (pointers, not re-stated):
- TASK-009 runs 1–11: team writes the click-through script, the stakeholder runs
  them himself (Q24 closed by Porter 2026-08-21; reversible). Detail: archive + board TASK-009 row.
- TASK-014 evidence: the stakeholder runs the two jobs himself (Q-SA-16 = "ค");
  Bruno runbook ruling (Q-SA-18/Q33/Q-SA-21 "ไทยหลัก อังกฤษรอง") lives in TASK-014 §Questions.
- Language line (Q39): Thai-primary for everything the stakeholder reads;
  team-internal artifacts stay English. UI reword pass = REQ-007 (Q40 = "แก้เลย").

### Q41 (to the human) — OPEN, NON-BLOCKING (raised 2026-08-24)

Now that the team does the reword (Q40): do the reworded Thai-primary strings
still come back to you for a yes/no before they ship (the standing Q14 process),
or does "แก้เลย" mean go ahead and ship the "ไทยหลัก อังกฤษรอง" version without a
per-string sign-off? Working default until you answer: they come back to you for
yes/no. Nothing waits on this — the team can draft either way.
Thai, ready to send:
> "เรื่องแก้ UI เป็นไทยนำ — ให้ทีมแก้เสร็จแล้วส่งให้พี่ดู yes/no ก่อนขึ้นจริงไหมครับ
> หรือ 'แก้เลย' คือให้ทีมแก้แล้วขึ้นได้เลยไม่ต้องส่งกลับ? ตอนนี้ผมตั้ง default ไว้ว่า
> ส่งให้พี่ดูก่อนครับ"

**Current 2026-08-25: Q41 is the only open question on REQ-001, and it is
NON-BLOCKING.** No data request is open on REQ-001.
