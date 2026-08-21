# REQ-003: Frontend UI quality + folder-structure overhaul (KnowCode web app)
- Status: READY_FOR_SA
- Priority: HIGH — *derived from his Q19 answer "รื้อ frontend ก่อน" (do the
  frontend rework first), not from a priority word he used. It means this work
  is wanted **before** TASK-009's acceptance run; **ordering the TASKs is still
  Sober's call**, this only records which outcome the stakeholder wants sooner.*
- Requested: 2026-08-21 by human stakeholder
- Deadline: none stated

> **Numbering note.** `requirements/` holds only REQ-001, but the board has
> published **REQ-002 as reserved** for the "email the finished report" REQ
> (REQ-001's Out of Scope). Numbers are never reused, so this REQ takes **003**
> and 002 stays reserved rather than being quietly re-pointed at a different
> subject.

> **~~Status is DRAFT on purpose~~ — SUPERSEDED 2026-08-21: the human answered
> Q16, Q17, Q18 and Q19, and the REQ is now `READY_FOR_SA`.** The original
> reason for holding it is kept for the record: he opened with "อยากคุยด้วยหน่อย"
> and "มีหลายอย่างอยากให้แก้" **without naming a single one of the several
> things**, and a rework REQ whose defect list is "several things" is not
> testable. **Q16 removed that objection in the widest possible way** — he chose
> "รื้อทุกหน้าด้วย hallmark" (redo *every* page with `hallmark`), so there is no
> defect list to guess at: the scope is all three screens and the acceptance is
> his own judgement. See `## Questions` for all four answers verbatim.

## Problem / Goal

The frontend of KnowCode (`code-report-front`) is built and its three screens
are `DONE` (TASK-006 login/shell, TASK-007 new-report form, TASK-008 report
view). The stakeholder has now looked at it and is **not satisfied on two
separate axes**:

1. **The UI itself** — appearance/interaction quality. He wants "several things"
   changed; he has not yet said which.
2. **The folder structure** of the frontend repository — he wants it rebuilt to
   follow a pattern he names, rather than the layout it grew into.

He also names the tools he wants used to fix both. This REQ exists to capture
that as a stakeholder requirement so the work reaches the engineer as a TASK
from Sober, and not as an ad-hoc rewrite.

## The human's words (verbatim, 2026-08-21)

> "เรื่อง front end อยากคุยด้วยหน่อย มีหลายอย่างอยากให้แก้
> ทั้งเรื่อง ui ทั้ง เรื่อง folder structure
> อยากให้ใช้ สกิล /anthropic-skills:nextjs-pattern-generator และ ใช้ ui components base mantine UI เป็นหลัก
> และ โครงสร้าง folder structure ก็ เรียนรู้ และทำจากในสกิลเลย
> C:\Users\Admin\develyst\code-report\code-report-front\.agent\skills
> และใช้สกิลนี้ในการdesign"

## Requirement

Only statements he actually made are numbered here.

1. **Every screen of the frontend must be redesigned using the `hallmark`
   skill** — not a list of point fixes. *(Settled by Q16, 2026-08-21:
   "รื้อทุกหน้าด้วย hallmark".)* "Every screen" is today's three: **login /
   app shell, new-report form, report view** (TASK-006, 007, 008). This
   deliberately supersedes the accepted *visual* result of those three TASKs —
   he has looked at them and wants them redone — while their **behaviour** is
   protected by Requirement 6 below.
2. The frontend's **folder structure must be reworked** to follow the pattern
   produced by the skill `/anthropic-skills:nextjs-pattern-generator`.
   *(Settled by Q17, 2026-08-21: "ใช่" — confirming the reading **folder
   structure from `nextjs-pattern-generator`, design from `hallmark`**. There is
   no second, unseen skill to wait for.)*
3. Both pieces of work must be produced **using the skill
   `/anthropic-skills:nextjs-pattern-generator`** — the stakeholder named this
   tool explicitly. Recorded as a **constraint on how the work is done**, not as
   a design decision.
4. **Mantine UI is the starting point for everything; Tailwind stays, but only
   for customising components.** *(Settled by Q18, 2026-08-21: "คงไว้ทั้งคู่ แต่
   tailwind มีไว้แค่ทำ customize component แต่เริ่มต้น ให้ ใช้ mantine UI
   ทั้งหมด".)* Concretely, as the stakeholder stated it:
   - **Both dependencies are kept** — `@mantine/core` / `@mantine/hooks` v9 and
     `tailwindcss` v3 both stay. **Nothing is removed from the repo.**
   - **Start from Mantine for all UI**: a screen is built out of Mantine
     components first, not out of hand-rolled Tailwind markup.
   - **Tailwind's remaining job is customising those components**, not being a
     second, parallel UI base.
   - *Fact recorded for whoever specs this:* `FRONTEND-STANDARD.md` §1 calls
     mixing two colour systems "our biggest sin". His answer keeps both tools, so
     **how the two are kept from becoming two design systems is a technical
     decision for Sober** — it is not a stakeholder question and is not asked of
     him again.
5. The **design** work must use the skill installed at
   `C:\Users\Admin\develyst\code-report\code-report-front\.agent\skills`
   ("และใช้สกิลนี้ในการdesign"). That directory currently contains exactly one
   skill: **`hallmark`** (an anti-AI-slop design skill, `audit` / `redesign` /
   `study` verbs).
   - *Consistency note, in our favour:* the workspace-wide `FRONTEND-STANDARD.md`
     §1 **already names `hallmark` as the design foundation** every FE
     deliverable is reviewed against. This requirement therefore reinforces an
     existing standard rather than replacing it.
6. Whatever is rebuilt, the **behaviour already accepted under REQ-001 must
   survive** — this is a UI and structure rework, not a re-specification of the
   product. Requirements 1–18 of REQ-001, and the copy closed by Q14, still hold.

## Acceptance Criteria

- [ ] **All three screens** (login/shell, new-report form, report view) have been
      redesigned through `hallmark`, and the redesign is evidenced the way
      `FRONTEND-STANDARD.md` §3 already requires of FE deliverables.
- [ ] The frontend repository's folder layout matches the pattern produced by
      `/anthropic-skills:nextjs-pattern-generator`, and a reader can point at the
      rule each top-level folder comes from.
- [ ] **Both** `@mantine/core` and `tailwindcss` are still dependencies, every
      screen is composed from Mantine components, and Tailwind appears only where
      a Mantine component is being customised.
- [ ] User-visible behaviour accepted under REQ-001 is unchanged by the rework:
      login, the new-report form (all fields incl. author/branch/extra context/
      language), the report view with its progress stages, the `NO_COMMITS` note,
      the date format `20/Aug/26`, and the sanitized-Markdown rules still behave
      as accepted.
- [ ] The stakeholder looks at the reworked screens and says they are acceptable.
      *(Stated plainly because that is the real test here: the trigger for this
      REQ was his own judgement of the UI, not a measurable failure.)*

## Constraints

- **Tooling mandated by the stakeholder** (recorded as constraints, per PM rules
  — these are his instructions about *how*, and Sober owns turning them into
  technical decisions):
  - skill `/anthropic-skills:nextjs-pattern-generator` for the Next.js patterns
    and the folder structure;
  - **Mantine UI** as the base every screen starts from, with **Tailwind kept
    but confined to customising components** (Q18, 2026-08-21);
  - the skill(s) under `code-report-front/.agent/skills` (today: `hallmark`) for
    the design work.
- `FRONTEND-STANDARD.md` (workspace root) continues to apply; §1 already names
  `hallmark`.
- **Nothing is renamed** (REQ-001 Requirement 14 / Q12): the repository stays
  `code-report-front`; the on-screen product name stays `KnowCode`.
- This REQ **changes no backend behaviour** and does not touch `code-report-back`.

## Out of Scope

- Any change to the API contract in SPEC-001. If the rework wants one, that is a
  new question up the chain, not a decision inside this REQ.
- New product features. Requirements 16, 17 and 18 of REQ-001 are **separate,
  already-approved work** still sitting in Sober's queue as unwritten TASK lines;
  they are not folded in here, and this REQ neither replaces nor blocks them.
- Renaming the repository, folders as *identifiers*, or the package.
- Backend, deployment, hosting.

## Questions

### Q16 — ANSWERED 2026-08-21 — "รื้อทุกหน้าด้วย hallmark" (redo every page)

> answer (2026-08-21, human, verbatim): "รื้อทุกหน้าด้วย hallmark"

- **He picked the wider of the two readings the question offered**: not a defect
  list, but *redesign all of them with `hallmark` and I will judge the result*.
  So there is nothing left to guess — the scope is **every screen the frontend
  has today** (login/shell, new-report form, report view) and it is written into
  Requirement 1.
- **What this costs, recorded plainly rather than buried:** the *visual* result
  of TASK-006 / 007 / 008 — all three `DONE` and all three passed a
  `FRONTEND-STANDARD` §3 review — is deliberately being thrown away by the
  stakeholder's own instruction. Their **behaviour** is not (Requirement 6).
- **What the answer does NOT say, and is therefore still Sober's to decide:**
  whether "รื้อ" is one TASK or three, and in what order. That is TASK ordering,
  which is his call, not Porter's and not the human's.
- ~~Original question text below.~~ He said "มีหลายอย่างอยากให้แก้ ... เรื่อง ui" and named no single item. The
  frontend has three screens (login, new report, report view).
- **Asked in Thai:** which screens, and what specifically is wrong with each —
  even roughly ("the report page looks plain", "the form is cramped")? Or is the
  instruction simply *"redesign all three with `hallmark`, my judgement at the
  end"*?
- **Not guessed, and the reason is concrete:** "redesign everything" and "fix
  these four things" are different amounts of work on screens that are already
  `DONE` and already passed a `FRONTEND-STANDARD` §3 review. Guessing the first
  when he meant the second throws away accepted work; guessing the second when
  he meant the first delivers a rework he rejects again.
- **Blocking scope:** this REQ only. Nothing currently in flight waits on it.

### Q17 — ANSWERED 2026-08-21 — "ใช่" (yes, the reading is correct)

> answer (2026-08-21, human, verbatim): "ใช่"

- **Confirmed: folder structure from `/anthropic-skills:nextjs-pattern-generator`,
  design from `hallmark`.** He was answering the yes/no the question put to him,
  and the alternative it named — "or did you mean another skill we have not seen
  yet?" — is therefore **closed: there is no unseen skill to wait for**, and
  `.agent/skills` holding only `hallmark` is the expected state, not a gap.
- Written into Requirement 2. Nothing else in the REQ moves.
- ~~Original question text below.~~ He gave two sources in one sentence: use
  `/anthropic-skills:nextjs-pattern-generator`, **and** "โครงสร้าง folder
  structure ก็ เรียนรู้ และทำจากในสกิลเลย" pointing at
  `code-report-front\.agent\skills`.
- **The two are not the same thing.** The skill installed at that path is
  `hallmark`, which is a **design** skill — its own description is about visual
  structure, themes and anti-slop rules; it does not define a Next.js folder
  layout. The folder-structure authority in his sentence is
  `nextjs-pattern-generator`.
- **Asked in Thai:** is the reading "**folder structure from
  `nextjs-pattern-generator`, design from `hallmark`**" correct — or did he mean
  to install another skill into `.agent/skills` that we have not seen yet?
- **Not guessed** because the reading is *probable but not certain*, and the cost
  of being wrong is a repo-wide file move done twice.
- **Blocking scope:** this REQ only.

### Q18 — ANSWERED 2026-08-21 — keep both; Mantine first, Tailwind only for customising

> answer (2026-08-21, human, verbatim): "คงไว้ทั้งคู่ แต่ tailwind มีไว้แค่ทำ
> customize component แต่เริ่มต้น ให้ ใช้mantine UI ทั้งหมด"

- **Neither of the two options as posed — he gave a third, narrower one**, and it
  is written verbatim into Requirement 4: **both stay** (nothing is uninstalled,
  so there is no repo-wide removal), **Mantine is where every screen starts**,
  and **Tailwind's only remaining job is customising Mantine components**.
- **The one thing his answer leaves to the team, stated so it is not read as a
  stakeholder decision:** `FRONTEND-STANDARD.md` §1 calls two coexisting colour
  systems "our biggest sin", and he has just kept both tools. **How the two are
  prevented from becoming two design systems (tokens, theme, where Tailwind may
  touch colour at all) is a technical decision and belongs to Sober** — it is not
  asked of the human again.
- ~~Original question text below.~~ `code-report-front` today ships **both** `@mantine/core` v9 and `tailwindcss`
  v3, and `FRONTEND-STANDARD.md` §1 explicitly calls mixing two colour systems
  "our biggest sin".
- **Asked in Thai:** "เป็นหลัก" — does Mantine become the **only** UI/styling
  base (Tailwind removed), or does it stay primary with Tailwind kept for layout
  utilities?
- Zero work if the answer is "keep both"; a repo-wide change if it is "remove
  Tailwind". Not guessed for exactly that reason.

### Q19 — ANSWERED 2026-08-21 — "รื้อ frontend ก่อน" (the frontend rework goes first)

> answer (2026-08-21, human, verbatim): "รื้อ frontend ก่อน"

- **The stakeholder wants this rework done BEFORE TASK-009's acceptance run.**
  His reasoning is the one the question put to him: an acceptance run against a
  frontend that is about to be redesigned would have to be repeated.
- **This is recorded as the stakeholder's preferred order, and it is NOT Porter
  moving a TASK.** TASK-009 is `TODO` and stays `TODO`; its assignees, its status
  and its three runs are untouched by me. **@Sober owns what the engineers do
  next** — this answer is an input to his ordering, not a replacement for it.
- One consequence worth naming because it is not free: **TASK-009 is joint
  Jason + Fern**, so putting the frontend first parks the *backend* half of the
  only open TASK too, unless Sober splits it. That is his call, and it is exactly
  the kind of call the middle hop exists for.
- ~~Original question text below.~~ **TASK-009 (the end-to-end acceptance run, th + en, on the public sample repo)
  is the only open TASK on SPEC-001 and it is joint Jason + Fern** — it became
  unblocked today.
- If the frontend is about to be restructured and redesigned, an acceptance run
  performed against the current frontend may have to be repeated.
- **Asked in Thai:** does the frontend rework come **first**, or does TASK-009
  run first and the rework follow?
- **Porter is not deciding this.** *Ordering the TASKs is Sober's*, but *which
  outcome the stakeholder wants sooner* is his, and the two answers are worth
  real time either way.

### Q15 — ANSWERED 2026-08-21 — "admin เริ่มต้นก่อน ให้ Tanya ใช้ test ได้ด้วย"

> answer (2026-08-21, human, verbatim): "admin เริ่มต้นก่อน ให้Tanya ใช้test ได้ด้วย"

- **The half that is settled:** the single seeded **`admin`** account is the
  intended starting arrangement. Separate per-person accounts for the CEO / SA /
  PM are **not** needed now. REQ-001 Requirement 10 is unchanged (identical
  permissions, no user-management screen, accounts seeded at installation) — this
  only settles *how many* exist today. **Zero code change**, exactly as Q15 said.
- **The half that is NOT settled, and is not guessed → Q20 below:** "ให้ Tanya
  ใช้ test ได้ด้วย". `code-report`'s team is Porter, Sober, Jason, Fern — there
  is **no QA role on this project**; Tanya (QA) is the workspace's Tester role,
  trialled on `smart-scheduler`. So this sentence could mean (a) simply "the
  `admin` login may also be used for testing", (b) "seed a second account for
  Tanya" — which is his own seed file to write, no code change either, or
  (c) "Tanya joins this project as QA", which is a team change and by far the
  largest reading.

### Q20 — ANSWERED 2026-08-21 — "ค" = option (c): **Tanya joins `code-report` as QA**

> answer (2026-08-21, human, verbatim): "ค, ไปเลย"

- He chose the **largest** of the three readings: not "Tanya borrows the `admin`
  login" and not "seed her an account" — **Tanya joins this project as the QA
  role.** This is a **team and chain change**, not a code change:
  - the chain gains a branch: **Human ↔ Porter ↔ Tanya (QA)**, alongside
    Human ↔ Porter ↔ Sober ↔ (Jason, Fern);
  - QA hangs off the **PM**, so Tanya's only contact is Porter — she never `@`s
    Sober or the engineers, never fixes code, and never tests production
    (workspace `CLAUDE.md` rule 2, the `smart-scheduler` arrangement);
  - `code-report` becomes the **second** project running the trialled Tester
    role.
- **Zero code change falls out of this, and no REQ.** It changes who is on the
  team, not what the product does. It is recorded here only because Q20 was
  raised here, as the unanswered half of Q15.
- **What it does NOT settle, and is not guessed → Q21 below:** the plumbing.
  This project has no `ai-worker/QA.md`, its `PROTOCOL.md` team table lists three
  roles and does not mention QA at all, and the DISPATCHER has no QA role to
  spawn. Somebody must write those, and **it is not obvious that it is Porter** —
  the PM's hard-boundary card lets me write `requirements/` and board rows, and
  `PROTOCOL.md` is not a REQ.

### Q21 — ANSWERED 2026-08-21 — "เขียนเลย" = Porter writes the QA plumbing

> answer (2026-08-21, human, verbatim): "เขียนเลย"

- **Porter is authorised to write the two files**, and did so on 2026-08-21:
  - **`ai-worker/QA.md`** — Tanya's charter, copied from the `smart-scheduler`
    arrangement where the role is trialled, with this project's facts edited in.
  - **`ai-worker/PROTOCOL.md`** — amended in four places only: the team table
    gains the QA row, the chain table gains `Porter ↔ Tanya`, the REQ status line
    gains the `IN_TEST` → `TEST_PASSED` | `TEST_FAILED` leg (with QA as the only
    role that may move it), and the data rule states QA's routing.
  - `ai-worker/tests/` created (empty, `.gitkeep`) so TEST files have a home.
- **Three limits I put on my own edit rather than taking the widest reading of
  "เขียนเลย":**
  1. **Local only.** `smart-scheduler`'s QA charter grants the Tester a **dev
     server** with read+write test data. `code-report` **has no deployed
     environment** — no deployment TASK exists and the cookie-`Secure` note is
     still parked — so I did **not** copy that grant. Tanya is local-only here,
     and the no-SQL / no-real-database standing rule is explicitly **not**
     relaxed for her. If a dev server is ever deployed, that is an amendment
     then, with the human's word, not an assumption now.
  2. **No retro-testing.** Adding the `IN_TEST` leg does not silently reopen
     REQs that already passed `SPEC_DONE`. Whether an already-built REQ gets a
     test round is written as Porter's call **with the human**.
  3. **I did not add Fern to the team table** in the same edit — see Q22.
- **No code change, no REQ, and nothing in flight moved.** REQ-003 stays
  `IN_SPEC`; no TASK status was touched; nothing has been handed to Tanya yet.
- ~~Original question text below.~~ OPEN 2026-08-21 (**NON-BLOCKING**)

- Q20(c) is answered and approved ("ไปเลย"), but acting on it means creating
  `code-report/ai-worker/QA.md` and amending this project's `PROTOCOL.md` team
  table + chain table so Tanya has a charter and the chain is written down — plus
  the DISPATCHER knowing a QA role exists here.
- **Asked in Thai:** may Porter write those two files (copying the
  `smart-scheduler` QA arrangement), or does the human set the role up himself /
  hand it to whoever owns `PROTOCOL.md`?
- **Not guessed, and the reason is the boundary itself:** `PROTOCOL.md` is the
  file that *defines* what each role may touch. A PM quietly rewriting it to add
  a role — even a role the stakeholder just approved — is precisely the move the
  chain rules exist to prevent. One line from him settles it.
- **Blocks nothing.** REQ-003 is `READY_FOR_SA` regardless, and no QA work is
  waiting: nothing has been handed to Tanya and nothing will be until she has a
  charter.

### Q22 — ANSWERED 2026-08-21 — "เพิ่มเลย" = Porter adds the FE row

> answer (2026-08-21, human, verbatim): "เพิ่มเลย"

- **Executed the same day, and kept to exactly what was asked: the two tables.**
  `ai-worker/PROTOCOL.md` now has a **team-table row** (`Frontend Engineer |
  Fern | SA Lead | code + updates in tasks/TASK-*.md`, and Sober's "Talks to"
  cell now reads `PM + BE + FE`) and a **chain-table pair**
  (`Sober (SA) ↔ Fern (FE)`). The interim note next to the team table was
  rewritten to record the authorisation instead of pointing at an open question.
- **Pure bookkeeping — zero behaviour change.** Fern has been working as
  SA-Lead's engineer all along (TASK-006/007/008 `DONE`, TASK-010…013); the file
  simply never said so. No TASK, status, owner or dependency moved.
- **Two limits I put on my own edit rather than reading "เพิ่มเลย" wide:**
  1. **Tables only.** The prose bullets under the chain table ("Jason never
     writes `@Porter`…") and the one-line "Chain of command: Human → PM → SA
     Lead → BE" sentence still name BE only. They are illustrative text, not the
     normative tables, and he authorised the *row*. **Residual, NON-BLOCKING,
     recorded here rather than fixed unasked** — one line from him closes it if
     he wants the prose to match.
  2. Nothing else in `PROTOCOL.md` was touched.
- ~~Original question text below.~~ **Found while executing Q21, and deliberately not fixed in the same edit.**
  `code-report/ai-worker/PROTOCOL.md`'s team table and chain table list **three**
  roles — PM, SA Lead, BE — and have **never** mentioned the frontend engineer,
  even though Fern has `FE.md`, is on the board's team line, and owns
  TASK-006/007/008 (all `DONE`) and TASK-010…013. The workspace-root `CLAUDE.md`
  does name her. So the omission is a **documentation desync that predates this
  amendment**, not something the QA change caused.
- **Asked in Thai:** may Porter add the FE row to the team + chain tables in the
  same shape as BE (`Sober (SA) ↔ Fern (FE)`), as pure bookkeeping?
- **Not done unasked, and the reason is the same one that produced Q21:**
  `PROTOCOL.md` defines what every role may touch. Q21 authorised me to write in
  **the QA role**; it did not authorise me to keep editing that file for other
  things I happen to notice while I am in it. One line from him settles it.
- **Blocks nothing.** Fern is working today under `FE.md` and Sober's TASKs; a
  missing table row changes no behaviour. An interim note is written next to the
  team table pointing at this question.

### Q-SA-12 — ANSWERED 2026-08-21 — "เอาแค่โครง" = the folder layout only

> answer (2026-08-21, human, verbatim): "เอาแค่โครง"

- Raised by **Sober** in SPEC-002: `nextjs-pattern-generator` publishes **two
  separable things** — a folder/naming/layering convention **and** a base stack
  (React Query, NextAuth, Axios, dayjs). He built to the narrow reading and asked
  rather than assumed.
- **The narrow reading is confirmed: take the skeleton — the folder structure —
  and not the stack.** So SPEC-002 needs no change; the additive "yes, adopt the
  stack too" branch is now **closed**, and with it the risk that NextAuth would
  have replaced REQ-001's accepted cookie login and changed an API contract
  REQ-003 itself puts out of scope.
- **Recorded here, not in SPEC-002, because Porter may not write in `specs/`.**
  @Sober transcribes it into SPEC-002 `## Questions` — the answer is his to file.
- **Nothing was blocked and nothing is unblocked.** TASK-010 was built to exactly
  this reading.

### Q-SA-13 — ANSWERED 2026-08-21 — "screenshot" = screenshots in the TASK

> answer (2026-08-21, human, verbatim): "screenshot, ไปเลย"

- Raised by **Sober** in SPEC-002: REQ-003's final acceptance criterion is *the
  stakeholder looks at the reworked screens and says they are acceptable*, and no
  TASK can tick that box for him — so how does he want to look? Screenshots
  captured into the TASK, or does he run `npm run dev` himself?
- **He chose screenshots.** So the evidence for that criterion is **captured
  images**, and looking at the running app himself is not what he is committing
  to. **@Sober owns what that means as a DoD line** (which screens, which states,
  where the files live) — Porter is not writing evidence rules into a TASK.
- **One thing his one word does NOT settle, flagged rather than assumed:** *where*
  the images go. Precedent on this project is that human-supplied evidence lives
  in `../project-docs/`, but these are produced by the team, not by him. That is a
  file-placement decision inside a TASK, so it is **Sober's**, not a new question
  to the human.
- **Recorded here, not in SPEC-002, because Porter may not write in `specs/`.**
  @Sober transcribes it into SPEC-002 `## Questions`.
- **Nothing is blocked.** The criterion comes due when TASK-013 lands.

### Q-SA-11 — ANSWERED 2026-08-21 — "ข้อความใหม่" = option (b), a new sentence

> answer (2026-08-21, human, verbatim): "ข้อความใหม่, ไปเลย"

- Raised by **Sober** at the TASK-005 review: a repo URL that carries a
  username/password is now rejected as `INVALID_URL`, whose shipped sentence
  ("Must be a valid http or https address." / "ต้องเป็นที่อยู่ http หรือ https
  ที่ถูกต้อง") is wrong-footed for that case — the address *is* valid; the fault
  is the secret in it, and the message never points the user at the access-token
  field.
- **He chose (b): the message gets its own new sentence.** So it is a th/en
  string pair plus one `ValidationIssue` value — **a TASK line Sober writes**,
  not something Porter or an engineer invents on their own initiative.
- **The security behaviour does not change either way** — the credentialed URL
  was already rejected and stays rejected. Nothing was blocked and nothing is
  unblocked; this only authorises the wording work.
- **What his answer does not include, recorded rather than assumed: the sentence
  itself.** He authorised a new message; he did not write one. Q14 closed the
  copy bundle by approving existing wording **as authored**, and explicitly did
  **not** cover strings that did not exist yet — this is one of those. The
  precedent that fits is Q-SA-4: the team authors the th/en pair, and it comes
  back to him for a yes/no. That is stated here so nobody reads "ข้อความใหม่" as
  pre-approval of whatever we write.

### Q-SA-14 — ANSWERED 2026-08-21 — "ขึ้นข้อความ" = show the session-expired line

> answer (2026-08-21, human, verbatim): "ขึ้นข้อความ"

- Raised by **Sober** in SPEC-002 out of the TASK-010 review: when a session
  expires mid-use the app redirects to `/login` **silently** — the 401 handler's
  `/login?expired=1` loses its flag to `RequireAuth`'s bare `/login` in the same
  tick. Fern measured it on **both** the pre-move and post-move builds, so it is
  the behaviour REQ-001 shipped, not a regression.
- **He wants the line shown.** That is therefore **approved NEW behaviour**, and
  it is the one place SPEC-002's 10-item behaviour freeze is deliberately
  released — freeze item 2 protected the silent redirect, and the stakeholder has
  now replaced it.
- **@Sober owns what it costs and where it lands: a TASK line, and its ordering
  against everything already parked, is his.** SPEC-002 already records that it
  needs **no new user-facing string** (`login.sessionExpired` exists and was
  approved under Q14, so the copy bundle stays closed) — I am relaying that, not
  deciding it.
- **What the answer does NOT say, so nobody reads it wider:** he approved the
  *outcome* (the reader sees why they were logged out). He did not say which
  mechanism wins the race, nor that it must land inside TASK-012/013 — those are
  technical and sequencing calls.
- **Recorded here, not in SPEC-002, because Porter may not write in `specs/`.**
  @Sober transcribes it into SPEC-002 `## Questions`.
- **Nothing was blocked and nothing is unblocked.** TASK-012 and TASK-013 keep
  today's outcome unless Sober says otherwise.

### Q-SA-15 — ANSWERED 2026-08-21 — "ก" = the team sends him a URL; he looks/captures himself

> answer (2026-08-21, human, verbatim): "ก ส่ง URL มา"

- Raised by **Sober** in SPEC-002: Q-SA-13 said "screenshot", and it then turned
  out that **no role here can produce one** (Fern's session has no displayable
  browser), so REQ-003's final acceptance criterion — his own eyes — had no
  mechanism.
- **He chose option (ก): the team hands over a URL and he opens it and captures
  it himself.** So the missing owner is found: **the stakeholder is the one who
  looks; the team's job is to make something openable.** REQ-003's final
  criterion is no longer ownerless.
- **What this changes about Q-SA-13, stated plainly:** captured images are still
  the form of the evidence, but **he captures them, we do not**. No TASK will
  carry a "paste screenshots here" DoD line.
- **What his answer does NOT settle, and I did not assume → Q23 below:** *which*
  URL. This project has **no deployed environment**, and PROTOCOL forbids the
  team deploying one, so the only openable thing is a server running on his own
  machine.
- **@Sober owns the DoD line that falls out of this** (what the engineer must
  leave behind so a URL is openable, and at which point in TASK-012/013 it is
  due). I wrote no evidence rule into any TASK.
- **Recorded here, not in SPEC-002, because Porter may not write in `specs/`.**
  @Sober transcribes it into SPEC-002 `## Questions`.
- **Still NON-BLOCKING for TASK-012/013**; it no longer blocks REQ-003's
  acceptance in principle, only in mechanism (Q23).

### Q23 — ANSWERED 2026-08-21 — "localhost" = he opens it on his own machine

> answer (2026-08-21, human, verbatim): "Q23=localhost"

- **He picked the cheap reading: `localhost` on his own machine.** So the team
  hands over a **local URL plus how to start it and which page to open**, and he
  runs it and captures what he wants to see.
- **What this closes:** **no deployment.** "A link that works from anywhere" is
  ruled out, so REQ-003 pulls in **no deployment TASK**, and the parked
  cookie-`Secure` note stays parked exactly where it is. REQ-003's Out of Scope
  needs no change — this confirms it rather than widening it.
- **What it does NOT settle, and I am not inventing it — it is @Sober's DoD
  line** (already his, from Q-SA-15): *which* command, *which* port and *which*
  pages/states the engineer must leave openable, and at what point in TASK-013 it
  is due. I wrote no evidence rule into any TASK and named no port.
- **Recorded here, not in SPEC-002, because Porter may not write in `specs/`.**
  @Sober transcribes it into SPEC-002 `## Questions` with Q-SA-12/13/14/15.
- **Blocked nothing and unblocks nothing.** It comes due when TASK-013 lands.
  With it, **REQ-003's final acceptance criterion now has both an owner (him,
  Q-SA-15) and a mechanism (localhost, Q23)** — the gap that started at Q-SA-13
  is closed end to end.

### ~~Q23 original~~ (kept for the record) — which URL does the team hand over?

- **Falls straight out of Q-SA-15's answer and is not the same question.** He
  said "ส่ง URL มา". `code-report` has **no deployed environment** — no
  deployment TASK exists, the cookie-`Secure` note is still parked, and the team
  is forbidden to stand up a real environment. What *does* exist is a `next dev`
  server already running on **his own machine** (port 3000, observed at the
  TASK-010 session), proxying `/api` to a backend on 8080.
- **Asked in Thai:** "URL ที่จะส่งให้ — หมายถึงให้พี่เปิด `localhost` บนเครื่อง
  ตัวเอง (ทีมบอกวิธีสั่งรัน/บอกว่าเปิดหน้าไหน) ใช่ไหมครับ หรืออยากได้ลิงก์ที่
  เปิดจากที่ไหนก็ได้ (ซึ่งต้อง deploy ก่อน — ยังไม่มีใน scope)?"
- **Not guessed, and the cost of guessing is concrete:** reading it as
  "localhost, he runs it" is free; reading it as "a link that works from
  anywhere" means **deployment**, which is out of REQ-003's scope, has no TASK,
  and would pull in the parked cookie-`Secure` item. Assuming the cheap one and
  being wrong reproduces exactly the ownerless-criterion problem Q-SA-15 just
  solved.
- **Blocks nothing.** TASK-012 and TASK-013 are built and reviewed against
  `FRONTEND-STANDARD` §3 either way; this decides only how he gets his look, and
  it comes due when TASK-013 lands.

### Q-SA-17 — ANSWERED 2026-08-21 — "ก" = he starts the backend himself

> answer (2026-08-21, human, verbatim): "Q-SA-17=ก"

Raised by **Sober** in TASK-016 `## Questions` (BLOCKING that TASK) and routed to
the human by Porter. Recorded **here** because **Porter may not write in
`tasks/`** — **@Sober transcribes it into TASK-016 `## Questions`** and moves the
TASK's status, exactly as with Q-SA-16 → TASK-014.

- **He chose (ก): he starts the backend as well**, so all **three** reworked
  screens are openable on his machine — not just the one that needs no session.
  Option (ข), the fake-data stub, is **closed**: nothing fabricated gets built.
- **What this settles:** TASK-016's block is gone. The hand-over covers the login
  screen, the new-report form and the report view, all on `localhost` (Q23), run
  by him (Q-SA-15).
- **What it does NOT settle, and Porter is not deciding it:** what the hand-over
  must contain for a backend as well as a frontend — commands, ports, the order
  to start them, and which TASK-016 DoD rows change — is Sober's to write. Porter
  moved no TASK status.
- **No credential was asked for or given.** He runs it; the team never connects,
  exactly as Q-SA-16 established.

### REQ-003's verdict after Q30 (2026-08-21) — narrowed, still open

Recorded here because REQ-004's Q30 answer lands on *this* REQ's acceptance
criterion. His words: **"โค้ดล่าสุด เห็นและว่าใช้mantine แต่ การทำงานก็ตามที่ฉัน
แจ้งไป"** (REQ-004 `## Questions`, Q30).

- **The redesign is NOT rejected.** He was on the latest code and can see it is
  Mantine; his complaints are about **how it works**, and those are carried by
  **REQ-004**, not by a rework of TASK-010/011/012/013. Those four stay `DONE`.
- **The redesign is NOT accepted either, and Porter is not recording it as such.**
  REQ-003's final criterion is that he **opens the reworked screens and says they
  are acceptable**. "I have seen the latest code" is not that sentence, and it is
  not established that he ran all three screens. **REQ-003 stays `IN_SPEC`.**
- **The path to the verdict is now clear:** TASK-015, then TASK-016 (unblocked by
  Q-SA-17 above) — the hand-over *is* the criterion. Whether REQ-004's changes
  should land before he is asked to give that verdict is a sequencing call for
  **@Sober**, and Porter has not pre-empted it.
