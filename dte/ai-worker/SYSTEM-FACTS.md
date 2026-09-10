# SYSTEM FACTS — how this system actually behaves

> **Created 2026-09-06, on the day this desk opened, by Marie (workspace operations) —
> deliberately BEFORE the team's first session, so the team is born with it instead of
> re-learning it.** On another project this file did not exist for six weeks, and the
> owner had to explain the same operational facts across sessions; twice the team raised
> a deliberate configuration as if it were a live incident. **That is a note-taking
> failure, not a knowledge failure.**
>
> **What belongs here:** any fact about how the running system behaves that is **not**
> derivable from the code, not a requirement, and not a status. Limits, deliberate
> settings, platform behaviour, which document is authoritative, decisions the owner
> already made.
>
> **The rule that makes it work — Porter's, binding on himself:**
> **When the owner states a fact about how the system behaves, it is written HERE BEFORE
> the reply is sent.** Not after, not "when I update the board", not in a log entry that
> scrolls away.
>
> **Format:** one fact, one line, with **who said it and when**. Append-only. Never
> compacted, never summarised, exempt from every size gate. If a fact turns out to be
> wrong, strike it and write the correction under it — do not delete.
>
> **Conventions:** every date is **2026** unless a full year is written · **`(owner)`
> means the owner, develyst** · **⚠️ CONTESTED** means two sources disagree, both are
> recorded, and **neither may be acted on** until the owner settles it · a line marked
> **(Marie, read-only survey 2026-09-06)** was read out of the repo on the day the desk
> opened and is evidence of what the *code* says — not of what production runs.

---

## 🔴 Which document is authoritative — read this before quoting any README

- 🔴 **`README.md` at the repo root is STALE and must not be trusted** (owner, 2026-09-06).
  It describes **NestJS + TypeScript + Prisma ORM** and deploy scripts
  (`deploy-quick.sh`, `deploy-backend.sh`, `deploy-frontend.sh`). **None of that exists.**
  The backend is Bun + ElysiaJS + raw SQL, and those three scripts are not in the repo
  (Marie, read-only survey 2026-09-06).
- ✅ **`back/README.md` is the accurate backend document** (owner, 2026-09-06) — stack,
  endpoint tables, project structure and the AI-Teacher flow all match the code.
- **`DTE.md` (938 lines, Thai) is the owner's own product-vision document** — vision,
  target audience, positioning. It is background and intent, **not a requirement**. Porter
  still writes every REQ from the owner's words, never from `DTE.md` (Marie, 2026-09-06).
- ⚠️ **`back/README.md` says the API runs on port 4002; the code defaults to 3001**
  (`back/src/index.ts:19`, and its own header comment says 3001). Root `.env.example` also
  says `PORT=3001`, while `front/src/services/api.ts:4` defaults to **4002**. So the two
  halves disagree **out of the box** unless `PORT` / `NEXT_PUBLIC_API_URL` are set.
  **Unsettled — do not "fix" either side without the owner** (Marie, read-only survey
  2026-09-06).

## The stack, as it actually is

- **One repo, two apps: `back/` and `front/`** (owner, 2026-09-06).
- **`back/` = Bun + ElysiaJS + PostgreSQL with RAW SQL — no ORM** (owner, 2026-09-06).
  Confirmed: `postgres` (postgres.js) is the only DB dependency; there is no Prisma
  anywhere; the schema lives in **`back/db/schema.sql`** and is applied by
  `back/src/db/migrate.ts` (Marie, read-only survey 2026-09-06).
- **`front/` = Next.js 15 App Router + React 19 + Tailwind** (owner, 2026-09-06).
  Confirmed `next 15.5.4` · `react 19.2.3` · `tailwindcss 3.4.17` · Headless UI +
  Heroicons + lucide-react · `axios` · **Turbopack for both `dev` and `build`**
  (Marie, read-only survey 2026-09-06).
- **`develyst-ai` is the AI gateway** (owner, 2026-09-06) — the AI Teacher and AI search
  do not call a model vendor directly. `back/src/routes/ai.ts:11` calls
  `AI_API_URL ?? 'https://r1.develyst.online/ai'`. `develyst-ai` is a **separate project
  with its own desk in this workspace** — a change needed there is a scope question for
  the owner, never an edit made from this desk (Marie, 2026-09-06).
- **Brownfield, and it is live.** This is old code being picked back up, and
  **`dte.develyst.online` serves real users** (owner, 2026-09-06).

## Branches, releases and who may run them

- **`develop` is the working branch** (owner, 2026-09-06). All team work is handed off as
  edited files on `develop`; no agent ever commits.
- **The owner's stated flow is `develop` → `main` → `production`**, driven by
  `merge-workflow.sh` and `release-workflow.sh` (owner, 2026-09-06).
- ⚠️ **CONTESTED — the scripts do not implement that flow.** `release-workflow.sh` merges
  **`develop` → `production` directly** and pushes; `main` is never touched by either
  script. Git state on 2026-09-06 agrees with the scripts, not the description:
  `develop` = `origin/develop` = `origin/production` = `origin/D1` all at `253eeda`
  (2026-04-07), while **`main` sits at `f678d0a` (2025-12-06), ten commits BEHIND
  `develop`** — even though `origin/HEAD` still points at `main`.
  ⇒ **Either `main` is abandoned, or two releases have bypassed it.** Nobody may act on
  either reading until the owner says which (Marie, read-only survey 2026-09-06).
- **Both workflow scripts push to `origin` and `release-workflow.sh` writes `production`.
  They are the human's hands, always** — no agent runs either one, for any reason
  (workspace rule + PROTOCOL.md "Environments").
- **The repo has been dormant since 2026-04-07** — that is the newest commit on `develop`,
  and the working tree was clean when the desk opened (Marie, read-only survey 2026-09-06).
- 🔴 **READ A23 BEFORE USING ANY LINE IN THIS SECTION.** On 2026-09-07 the owner ruled the whole
  subject — git state, branches, commit hashes, which branch production runs, what is merged or
  committed — **out of the team's scope**: *"เลิก ยุ่งกับการ commit หรือgit ของฉัน ทำงาน code  กันไป"*.
  The lines above stay on the record as history; **none of them may be raised as a question, a
  finding or a blocker.** What is unchanged: no agent commits, pushes, merges, deploys or touches
  production, and work is handed off as edited files on `develop` (Porter, 2026-09-07).

## Production — what it is and who may touch it

- **`dte.develyst.online` is production with real users** (owner, 2026-09-06).
- 🔴 **No agent touches it. Ever.** Not a deploy, not `pm2`, not ssh, not an API call, not
  a GET. Not the production database either. This is absolute and predates any task
  (owner, 2026-09-06; PROTOCOL.md "Environments").
- 🔴 **The absence of a technical guard is NOT permission.** Nothing in this repo stops an
  agent from curl-ing production or ssh-ing to the server — the written rule is the only
  control that exists. On another project this exact gap left a customer's money UI
  unprotected for weeks because everyone assumed a guard existed (Marie, 2026-09-04).
- The root `README.md` prints a server IP and an `ssh root@…` line. **Reading it is not
  authorisation**, and a credential or address found in a repo is never a grant
  (Marie, 2026-09-06).

## The product, as the code has it (survey facts — verify before depending on one)

> These were read out of `develop` at `253eeda` on 2026-09-06 and are **evidence of what
> the code says, not proof of what production runs.** Anything that must be true of the
> live system is a DATA REQUEST for the owner.

- **API surface: 5 route modules** — `auth`, `users`, `courses`, `ai`, `categories`
  (`back/src/routes/`), with Swagger served at `/docs`.
- **Schema: 16 tables + 9 enum types**, in `back/db/schema.sql` — `users`, `courses`,
  `lessons`, `course_contents`, `enrollments`, `lesson_progress`, `ai_teacher_configs`,
  `chat_messages`, `course_reviews`, `follows`, `categories`, `teacher_verifications`,
  `email_verification_tokens`, `course_payments`, `teacher_payouts`, `platform_settings`.
  Two triggers maintain derived state: `after_review_upsert` and `after_enrollment_change`.
- **The AI Teacher is per-course and configurable** — `ai_teacher_configs` carries
  `system_prompt`, `knowledge_base`, `provider`, `model`, `temperature`; a chat loads the
  last 10 messages as context, then calls the gateway (`back/README.md` + `routes/ai.ts`).
- **Payments are in the SCHEMA but not in the API** — `course_payments` and
  `teacher_payouts` exist as tables, and `.env.example` carries Omise + Stripe keys, but
  **no payment route exists in `back/src/routes/`**. ⇒ Payment is designed, not built.
  Do not describe it as working (Marie, read-only survey 2026-09-06).
- **`front/` `/courses` renders `src/lib/mockData.ts`, not the API.** Only `login`,
  `register`, `verify-email`, `classroom/[id]`, `AIChat` and `SearchAI` call
  `services/api.ts`. ⇒ Parts of the site are still a mock-up
  (Marie, read-only survey 2026-09-06).
- ⚠️ **`front/` carries routes that look inherited from a different site** — `/portfolio`,
  `/services`, `/contact`, `/about`, `/blog`, plus `src/constants/portfolio.ts` and
  `services.ts`, and leftovers `about/page-new.tsx` and `about/page.tsx.backup`.
  **Whether these belong to DTE is the owner's call, not an engineer's cleanup decision**
  (Marie, read-only survey 2026-09-06).

## Open questions for the owner (nobody may answer these by inference)

> Move an answer OUT of this list and INTO a fact line above, with the owner's words and
> the date, the moment he settles it.

- ~~**Q1 — `main`:** is it abandoned, or is `release-workflow.sh` skipping a step it
  shouldn't? (see ⚠️ under Branches)~~ **ANSWERED 2026-09-07 — ruled OUT OF THE TEAM'S SCOPE by
  the owner ("ไม่ต้องยุ่ง"); see §"Owner's answers to the 6 standing questions" A1. Do not ask again.**
- ~~**Q2 — the port:** is the API 3001 or 4002, and which of the four places that state it
  is the one to correct? (see ⚠️ under authoritative documents)~~ **ANSWERED 2026-09-07 — it is
  neither: the owner says `4013`; see A2. Which files get corrected stays a Sober decision.**
- **Q3 — the inherited routes:** do `/portfolio`, `/services`, `/contact`, `/blog` stay,
  or are they leftovers to remove? **STILL OPEN 2026-09-07 — he answered on a mistaken premise
  (that they belong to another project); they verifiably exist in this repo. Re-asked with the
  evidence; see A3.**
- ~~**Q4 — production vs `develop`:** the tip of `develop` is from 2026-04-07 and equals
  `origin/production`. Is what runs at `dte.develyst.online` actually that commit?
  Only he can answer — no agent may check.~~ **ANSWERED 2026-09-07 — "yes"; see A4.**

## Product identity, business model and UI standards (owner, 2026-09-06 — session 2)

> Added by Porter from the owner's own words on 2026-09-06. His Thai is quoted as evidence
> of intent. Anything he left ambiguous is marked ⚠️ and is **unactionable** until he settles it.

- **DTE is an education / knowledge platform where a user is BOTH learner and teacher —
  "เหมือนกับ youtube เลย เป็นได้ทั้งคนดู content และคนสร้าง"** (owner, 2026-09-06). One account,
  two capacities; there is no separate "teacher account" in his description.
- **Courses are free or paid; a learner enrols by clicking into the course** — "มันจะมีทั้งแบบ
  ที่เขาทำฟรี และ แบบทำคิดตังค์" (owner, 2026-09-06).
- **Learning happens WITH the course's AI, not from video alone** — the learner can ask it
  questions and request tests/quizzes, and that AI holds the course's knowledge:
  "ได้เรียนเรื่องนั้นๆ กับเอไอ ถามได้ ขอแบบทดสอบ ได้ ที่มีข้อมูล ของคอร์สอยู่เต็มเปี่ยม" (owner, 2026-09-06).
- **A teacher creates a course by TRAINING its AI, and the teacher-side AI interrogates the
  teacher** — the teacher sets course name, description and goal, then "เอไอก็จะถามเราจนกว่าจะเข้าใจ";
  when the AI judges it understands, course creation can end (owner, 2026-09-06).
- **The AI must prove it understands before a course may close: it writes its own questions and
  answers them, and must be 100% correct.** If it is wrong the teacher tells it why; the teacher
  may also pose questions and award points for a correct answer, the point value being set by the
  teacher when asking (owner, 2026-09-06). ⚠️ The **pass rule, the point scale and what happens on
  failure are NOT settled** — "100%" is his word, the mechanics are not. Unactionable until he says.
- **Revenue: free courses are charged nothing; on paid courses the platform takes 2%** —
  "รายได้ เรา จะเอาจาก ค่า เปิด คอร์ส คอร์สฟรี ไม่เก็บ เก็บคอร์ส เสียตังค์ เราเอาแค่2%" (owner, 2026-09-06).
- ⚠️ **CONTESTED / AMBIGUOUS — what "ค่าเปิดคอร์ส" is.** His sentence reads two ways: (a) 2% is the
  whole of it, taken per paid-course transaction, or (b) there is a separate course-**opening** fee
  *and* a 2% cut. **Neither reading may be built.** A price is a fact only when the owner states it
  (Porter, 2026-09-06 — asked, awaiting answer). Also unstated: 2% **of what** (gross sale price? per
  transaction? net of the payment gateway's own fee?), and who absorbs the gateway fee.
- ⚠️ **The product's own NAME is unsettled by the owner himself** — "โปรเจคนี้คือ dte disrupt thai
  education มั้ง จำชื่อไม่ได้เหมือนกัน" (owner, 2026-09-06). `board.md` carries *Disrupt Thai Education /
  Develyst The Education*. Nobody may print an expansion of "DTE" in user-facing copy until he says
  which (Porter, 2026-09-06).
- **UI STANDARD — no emoji in the UI; use an icon set instead.** "UI BASE อย่า ใช้ emoji ให้ใช้ icon แทน"
  (owner, 2026-09-06). Standing rule for all frontend work from this date, not a one-off cleanup.
- **UI STANDARD — the frontend must sit on a real component library**, chosen to fit an education
  product: "UI base on lib component สักตัวที่เข้ากันได้ดี กับเนื้อหาของโปรเจค อาจจะเป็น mantine , antd , หรืออื่นๆ"
  (owner, 2026-09-06). He named Mantine and Ant Design **as examples and left the final pick open**
  ("หรืออื่นๆ") — the pick is a design recommendation, and he confirms it before migration.
- **MANDATED TOOL — the frontend folder structure must follow the `nextjs pattern generator` skill's
  house pattern** (owner, 2026-09-06): "ช่วยใช้ skill nextjs pattern generator เพื่อสร้างให้เป็น structure folder
  แบบนั่น". Recorded as a stakeholder constraint, not as a design decision.
- **Fact confirmed to the owner:** `front/` **is** Next.js + TypeScript — `next 15.5.4`,
  `react 19.2.3`, `typescript 5`, Tailwind 3.4.17, Headless UI + Heroicons + lucide-react
  (Marie, read-only survey 2026-09-06 §3 — this answers his question "front เป็น next js typescript ใช่มั้ย").
- ⚠️ **Version gap the owner has not been asked about yet:** the house pattern skills target
  **Next.js 16 + React 19**, while the repo is on **Next.js 15.5.4**. Whether adopting the pattern
  also means a Next 16 upgrade is **his call plus a technical assessment** — unactionable until
  answered (Porter, 2026-09-06).

## Owner's answers to REQ-001 Q1–Q3 (owner, 2026-09-06 — session 3)

> Added by Porter from the owner's own words, verbatim Thai, BEFORE replying. These are
> decisions he has made; they lift part of the REQ-001 §Constraints C5 gate. What his
> words do **not** settle is marked ⚠️ and stays unactionable.

- **DECISION — the component library is Sober's to PROPOSE, not to impose** — "ให้ Sober เสนอ"
  (owner, 2026-09-06, answering REQ-001 Q1). Sober recommends one library with written
  rationale; the owner's word "เสนอ" (propose) is read as: the proposal comes back to him and
  he confirms it before any migration begins. He did **not** say "เลือกเลย" (pick outright).
  ⚠️ If he meant to delegate the pick outright, he can say so in one line — until then the
  confirmation step stands (Porter, 2026-09-06).
- **DECISION — migration is INCREMENTAL, screen by screen** — "ค่อยย้ายทีละหน้า" (owner,
  2026-09-06, answering REQ-001 Q2). No big-bang restructure/re-skin of every screen. This
  settles REQ-001 requirement 5's shape: an ordered per-screen plan, live site protected.
- **DECISION (delegated, with a stated lean) — the Next.js version choice is Sober's, and the
  owner leans toward upgrading** — "อะไรดีกว่าเอาอันนั้น น่าจะ อัปๆ ไปเลย" (owner, 2026-09-06,
  answering REQ-001 Q3): *take whichever is better; probably just upgrade*. So: Sober decides
  15-vs-16 on technical merit and states the reasoning; "probably upgrade" is a preference, not
  an instruction to upgrade regardless of risk.
  ⚠️ **Not settled by this answer:** a Next 15 → 16 upgrade on a LIVE site is its own risk item.
  The owner has not been told what an upgrade would cost or break, because nobody has assessed
  it yet. He approved the *direction*, not an unbounded upgrade — the assessment must come back
  to him before the upgrade is executed (Porter, 2026-09-06).
- **Still unanswered from session 2:** SYSTEM-FACTS Q1–Q4 (main / the port / the inherited
  routes / production-vs-`develop`), the ⚠️ CONTESTED "ค่าเปิดคอร์ส" vs 2% reading, the product's
  own name, and all 7 REQ-002 questions.

## Owner's answers on the two REQ-001 ⚠️ items (owner, 2026-09-06 — session 4)

> Added by Porter from the owner's own words, verbatim Thai, BEFORE replying. These settle the two
> ⚠️ items Porter recorded at 22:35 and rewrite the C5 gate again. What they do **not** settle is
> marked ⚠️ and stays unactionable.

- **DECISION — the library confirmation step STANDS; the owner approves the pick himself** —
  **"เสนอแล้วผมเคาะ"** (owner, 2026-09-06): *propose it and I'll make the call.* This closes the
  earlier ⚠️ "did 'เสนอ' delegate the pick outright?" — it did **not**. Sober proposes one library
  with written rationale; **no migration onto any library begins before the owner says yes.**
  C5(a) is now his stated rule, not Porter's cautious reading.
- **DECISION — the Next.js 15 → 16 upgrade is APPROVED and in scope** — **"อัปไปเลย"** (owner,
  2026-09-06): *just upgrade.* This lifts the earlier ⚠️ that "probably upgrade" was only a
  preference — he has now stated it as a decision. Sober's 15-vs-16 technical assessment still
  gets written down (REQ-001 AC), but the direction is settled by the owner.
- **Correction on the record (owner, 2026-09-06):** he first sent **"Q2=ทำบน 15 ก่อน"** (*do it on
  15 first*) and immediately corrected himself to **"Q2=อัปไปเลย"**. The **second message is his
  answer**; the first is superseded. Recorded per append-only discipline so the change of mind is
  visible and nobody re-litigates it from a stale quote.
- ⚠️ **NOT settled by "อัปไปเลย": whether he wants to see the upgrade's risk/rollback plan before
  it is executed on the LIVE site.** He approved the upgrade; he did not say "run it without
  showing me". Until he answers, Porter's conservative default holds: the upgrade is its **own
  sequenced TASK** (not folded into a page migration), and Porter shows him the plan before it
  runs. **This default is Porter's, not the owner's words** (Porter, 2026-09-06 — asked, awaiting
  answer).
- **Still unanswered:** SYSTEM-FACTS Q1–Q4 (main / the port / the inherited routes /
  production-vs-`develop`), the ⚠️ CONTESTED "ค่าเปิดคอร์ส" vs 2% reading, the product's own name,
  and all 7 REQ-002 questions.

## Owner's answer on the Next 16 upgrade plan (owner, 2026-09-06 — session 5)

> Added by Porter from the owner's own words, verbatim Thai, BEFORE replying. This settles the last
> ⚠️ left open at 23:xx on REQ-001 C5(b).

- **DECISION — the owner wants to SEE the Next 15 → 16 upgrade plan before it is executed** —
  **"เอามาให้ดูก่อน"** (owner, 2026-09-06, answering "does 'อัปไปเลย' mean run it without showing you?"):
  *bring it to me to look at first.* This **closes** the ⚠️ recorded at REQ-001 §Constraints C5(b):
  what was **Porter's conservative default is now the owner's stated rule.** The upgrade remains
  APPROVED in direction ("อัปไปเลย"); it is executed only after he has seen the plan and said go.
  Porter carries the plan to him — the same route as the library proposal.
- **Consequence, stated so nobody re-derives it:** the Next 16 upgrade stays its **own sequenced
  TASK** with a written rollback, never folded into a page-migration TASK. That was engineering
  hygiene at 23:xx; it is now backed by the owner's own instruction to review it first.
- **"ไปเลย" in the same message is a bare nudge**, not new scope (PROTOCOL.md "Nudges") — recorded
  so a later session does not read business content into it (Porter, 2026-09-06).
- **Still unanswered:** SYSTEM-FACTS Q1–Q4 (main / the port / the inherited routes /
  production-vs-`develop`), the ⚠️ CONTESTED "ค่าเปิดคอร์ส" vs 2% reading, the product's own name,
  and all 7 REQ-002 questions.

## Owner's answers to the 6 standing questions (owner, 2026-09-07 — session 6)

> Added by Porter from the owner's own words, verbatim Thai, BEFORE replying. These are the
> answers to the list that had stood since 2026-09-06: SYSTEM-FACTS Q1–Q4, the ⚠️ CONTESTED
> "ค่าเปิดคอร์ส" vs 2% reading, and the product's name. **Path rule:** where his words contained an
> absolute path it is written below as `<the dte path in machine.local.md>` — committed files
> never carry a machine path (PROTOCOL.md "Repo layout").

- **A1 — `main` is NOT the team's business; work happens on the branch he assigns, and that is
  `develop`** — **"ไม่ต้องยุ่ง มีหน้าที่ทำงานบน branch ที่ฉันเลือกให้ ก็ทำไปซะ ไม่ต้องสนใจ commit ที่ฉันยังไม่กด
  ไม่ต้องสนใจ มีหน้าที่ทำ คุยงาน และ ทำ เทส ก็ทำกันไป ตามหน้าที่"** (owner, 2026-09-07, answering Q1).
  This **closes SYSTEM-FACTS Q1** — not by resolving whether `main` is abandoned, but by ruling the
  question **out of the team's scope**. The ⚠️ CONTESTED line under "Branches" about `main` vs the
  workflow scripts **stays on the record as unresolved**; nobody acts on it, and nobody asks again.
  He also instructs the team to **ignore uncommitted / unpushed work of his** and to get on with
  the job (discussing work and testing). No agent commits, as before.
- **A2 — the API port is `4013`** — **"4013"** (owner, 2026-09-07, answering Q2). This is his stated
  fact and it **overrides every value currently written in the repo**: `back/README.md` (4002),
  `back/src/index.ts:19` default (3001), root `.env.example` `PORT=3001`, and
  `front/src/services/api.ts:4` default (4002) are **all wrong**. **This closes SYSTEM-FACTS Q2 as a
  fact but opens work**: which of those four places get corrected, and how, is a technical decision
  for Sober — Porter does not decide it (Porter, 2026-09-07). ⚠️ **Not stated by him:** whether 4013
  is the port in **production**, in **local dev**, or both. Do not assume it is all three.
- **A3 — the owner says the `/portfolio`, `/services`, `/contact`, `/blog` pages are NOT DTE's; he
  believes they belong to the `portfolio-nichaphon` project** — **"แก ไปเอามาจากไหนวะ ฉันว่าแก หลง
  project ละ นั่นมัน nichaphon project นี่ `<the dte path in machine.local.md>` คนละอันกัน"** (owner,
  2026-09-07, answering Q3).
  ⚠️ **CONTESTED — his premise does not match the disk.** Porter re-checked, read-only, on
  2026-09-07 at exactly the path `machine.local.md` records for the logical repo `dte` (the same
  path he named in his own answer): `front/src/app/` **does contain** `portfolio/`, `services/`,
  `contact/`, `blog/`, `about/`, and `front/src/constants/` contains `portfolio.ts` and
  `services.ts`. So the desk is on the **right** repo and these routes **are** in it. The most
  likely reading — **not a fact, and not to be acted on** — is that they were copied in from the
  portfolio project and he does not consider them part of DTE. **Whether they stay or are removed
  is still his call and remains OPEN** (Porter, 2026-09-07 — evidence given back to him, re-asked).
- **A4 — production runs the tip of `develop`** — **"yes"** (owner, 2026-09-07, answering Q4:
  *is what runs at `dte.develyst.online` actually `develop`'s tip, `253eeda` of 2026-04-07?*).
  **Closes SYSTEM-FACTS Q4.** Consequence: the code the team reads on `develop` is the code real
  users are running — every change is a change to a live product. (Read with A1: he may hold
  unpushed work of his own; that is his and is not the team's to reason about.)
  - **Status as of 2026-09-07 — CLOSED AND NOT RE-OPENABLE (see A23).** A4 stands exactly as he
    stated it; the later observation that `origin/production` sat one commit behind `develop` is
    **out of the team's scope** and is not a finding, not a question and not a blocker. Nobody
    re-verifies, re-derives or re-asks A4, and nobody reports a git/branch discrepancy again.
- **A5 — ⚠️ UNBINDABLE, re-asked: he answered "yes" to the 2% / "ค่าเปิดคอร์ส" question, but that
  question was an EITHER/OR and "yes" does not pick a side** (owner, 2026-09-07). The two readings
  on the record are (a) 2% is the whole of it, taken per paid-course transaction, or (b) a separate
  course-**opening** fee *and* a 2% cut. Worse: **the verbatim wording Porter put to him was never
  written into a file**, so there is no text to bind "yes" to. Per "a price is a fact only when the
  owner states it", the ⚠️ CONTESTED line under "Product identity" **stands unchanged and remains
  unactionable**; Porter re-asks it as a one-line either/or (Porter, 2026-09-07).
  **Lesson recorded for Porter's own discipline:** questions put to the owner go into the file
  verbatim *before* they are asked, or his answer cannot be attached to anything.
- **A6 — the product's name is "Develyst The Education"** — **"Develyst The Education"** (owner,
  2026-09-07, answering Q6). This **closes the ⚠️ "the product's own NAME is unsettled"** line under
  "Product identity". **DTE = Develyst The Education.** The alternative expansion *"Disrupt Thai
  Education"* — which he himself floated on 2026-09-06 with "จำชื่อไม่ได้เหมือนกัน" — is **superseded**
  and must not appear in user-facing copy or in team documents. `board.md` "Project info" corrected
  the same session.
- **Still unanswered after this session:** the "ค่าเปิดคอร์ส" vs 2% reading (A5 above), whether the
  inherited routes stay or go now that he has the evidence (A3 above), whether 4013 is prod / local
  / both (A2 above), the REQ-001 library pick, and all 7 REQ-002 questions.

## Owner's answers to the three re-asked questions (owner, 2026-09-07 — session 7)

> Added by Porter from the owner's own words, verbatim Thai, BEFORE replying. He answered the
> three questions left open by session 6, **in the order Porter asked them**: (1) the scope of the
> `4013` port fix, (2) the inherited `/portfolio`,`/services`,`/contact`,`/blog` routes, (3) the
> revenue model ก/ข. Each answer is bound below to the exact question it answers.

- **A7 — `4013` is the API port in BOTH production and local dev** — **"ทั้งคู่"** (owner,
  2026-09-07, answering *"4013 นี่คือพอร์ตของ production, ของ local dev, หรือทั้งคู่?"*). This closes the
  ⚠️ left open in A2. Consequence, stated so nobody re-derives it: **all four places in the repo
  that state a port are wrong in both environments** — `back/README.md` (4002),
  `back/src/index.ts:19` default (3001), root `.env.example` `PORT=3001`, `front/src/services/api.ts:4`
  default (4002). **Which files are corrected and how remains Sober's technical decision**; Porter
  does not decide it and has not tasked it (Porter, 2026-09-07). ⚠️ Still not stated by him: nothing
  further — the fact is complete for this question.
- **A8 — the inherited routes are to be REMOVED** — **"ลบ"** (owner, 2026-09-07, answering
  *"`/portfolio`, `/services`, `/contact`, `/blog` มีอยู่จริงใน repo dte — จะให้เก็บไว้ หรือ ลบทิ้ง?"*).
  This **closes SYSTEM-FACTS Q3**, which had stood open since 2026-09-06 and had been re-asked with
  read-only evidence after his mistaken-premise answer in A3. The ⚠️ CONTESTED marker on A3 is
  hereby **resolved**: the routes are in this repo (disk evidence), and the owner's decision is to
  delete them. Captured as `requirements/REQ-003-remove-inherited-portfolio-routes.md`.
  ⚠️ **Not settled by "ลบ" — do not assume:** (a) the `/about` route, which also exists in
  `front/src/app/` but was **not** named in the question he answered; (b) whether the removed pages
  need redirects or may simply 404 for real users on the live site. Both are asked in REQ-003
  §Questions (Porter, 2026-09-07).
- **A9 — the revenue model is (ก): the platform takes 2% of paid-course sales and nothing else** —
  **"ก"** (owner, 2026-09-07, answering the verbatim either/or written into
  `requirements/REQ-002-course-creation-ai-training-loop.md` §Open questions Q1 *before* it was
  asked: *"(ก) เก็บ 2% จากยอดขายคอร์สที่เก็บเงิน แค่นั้น ไม่มีค่าอื่น หรือ (ข) มีค่าเปิดคอร์สแยกต่างหาก + เก็บ 2% ด้วย"*).
  This **resolves the ⚠️ CONTESTED "ค่าเปิดคอร์ส" line** under "Product identity, business model and
  UI standards": reading (b) — a separate course-opening fee — is **superseded and must not be
  built**. There is **no course-opening fee**; free courses are charged nothing; paid courses are
  charged 2%. His earlier bare **"yes"** of 2026-09-07 (A5) remains unbindable and is superseded by
  this "ก".
  ⚠️ **Still open, and deliberately asked only now that ก is settled:** **2% of what** (gross sale
  price? per transaction? net of the payment gateway's fee?) and **who absorbs the payment gateway's
  own fee**. Recorded in REQ-002 §Open questions Q1 as sub-questions; unactionable until answered
  (Porter, 2026-09-07).
- **Still unanswered after this session:** the REQ-001 library pick (Sober proposes, owner approves),
  the two 2% sub-questions above, REQ-002 Q2–Q7, and the two new REQ-003 questions (`/about`, and
  redirect-vs-404).

---

## Owner's answers to the five questions left open by session 8 (2026-09-07)

> Added by Porter from the owner's own words, verbatim, BEFORE replying. He answered **in the
> order Porter asked**: (1) `/about`, (2) old links after removal, (3) REQ-003 vs REQ-001 order,
> (4) what the 2% is of, (5) who pays the payment-gateway fee. Each answer is bound below to the
> exact question text it answers.

- **A10 — `/about` STAYS, as DTE's own About page** — **"about for DTE"** (owner, 2026-09-07,
  answering *"อีกหน้าหนึ่งที่ผมไม่ได้ถามไปคือ `/about` ครับ — จะให้ลบด้วย หรือเก็บไว้เป็นหน้า About ของ DTE?"*).
  This closes the ⚠️ (a) left open under A8: `/about` is **not** part of the deletion. It must be
  DTE's About page, not the inherited agency one. ⚠️ **Not stated by him and not to be invented:**
  the actual Thai copy for a DTE About page. Until he supplies it, nobody writes About-page text —
  that is a content DATA REQUEST, tracked in `requirements/REQ-003-…md` §Out of Scope (Porter, 2026-09-07).
- **A11 — removed routes REDIRECT, they do not 404** — **"redirect"** (owner, 2026-09-07, answering
  *"หน้าที่ลบไปแล้ว ถ้ามีคนกดลิงก์เก่าเข้ามา จะให้ขึ้น 404 ไปเลย หรือให้ redirect กลับหน้าแรกครับ?"*).
  Because the question offered exactly one redirect target, the answer binds to it: old links to
  `/portfolio`, `/services`, `/contact`, `/blog` **redirect to the home page `/`**. This closes the
  ⚠️ (b) left open under A8. *(How — Next.js config redirect vs. route handler, and permanent vs.
  temporary — is Sober's technical call, not the owner's.)*
- **A12 — REQ-001 (frontend foundation) comes BEFORE REQ-003 (route removal)** — **"foundation
  first"** (owner, 2026-09-07, answering *"งานลบหน้าพวกนี้ จะให้ทำก่อน หรือหลัง งาน frontend foundation
  (REQ-001) ครับ?"*). Ordering only; it does not gate REQ-003's SPEC and does not merge the two.
- **A13 — the 2% is taken on the FULL SALE PRICE** — **"ราคาขายเต็ม"** (owner, 2026-09-07, answering
  *"2% นี่คิดจากอะไรครับ — ราคาขายเต็ม, ต่อ transaction, หรือหลังหักค่าธรรมเนียม gateway แล้ว?"*).
  So the platform's cut is 2% of the course's gross sale price — **not** of the amount left after
  the payment gateway's fee.
- **A14 — the PLATFORM absorbs the payment-gateway fee** — **"platform"** (owner, 2026-09-07,
  answering *"ค่าธรรมเนียม payment gateway ใครเป็นคนจ่ายครับ — แพลตฟอร์ม, ผู้สอน, หรือผู้เรียน?"*).
  The gateway's fee is not passed to the teacher and not added on top of the learner's price.
  Together A13+A14 close REQ-002 §Open questions Q1 completely: **2% of gross sale price, no
  course-opening fee, gateway fee borne by the platform.**
- **Still unanswered after this session:** the REQ-001 library pick (Sober proposes, owner
  approves), REQ-002 Q2–Q7, the About-page copy (A10), and the `4013` port fix has a fact but
  still no REQ.

---

## Owner's answers to the SPEC-001 gates and the housekeeping rule (2026-09-07)

> Added by Porter from the owner's own words, verbatim, BEFORE replying. Three of these answer
> Sober's SPEC-001 questions, which reached the owner through Porter; the fourth answers Porter's
> own housekeeping question. Each answer is bound below to the exact question text it answers.

- **A15 — the component library is ANT DESIGN** — **"antd"** (owner, 2026-09-07, answering Sober's
  SPEC-001 §Questions Q1 / REQ-001 §Constraints **C5(a)**: *"Ant Design v6 is proposed with
  rationale, runner-up HeroUI. Does he approve antd?"*). This **CLOSES the C5(a) gate** that has
  stood open since 2026-09-06 — the one gate REQ-001 was waiting on. Migration onto a library may
  now begin. The proposal he approved is `specs/SPEC-001-frontend-foundation.md` §Decision 1, so the
  approval carries what that section states: Ant Design **v6**, Mantine ruled out (no house pattern
  skill — the C1 tension), HeroUI the runner-up. ⚠️ **Not stated by him, do not read in:** he did not
  approve a schedule, and he did not lift REQ-001 Q2 ("ค่อยย้ายทีละหน้า") — the migration stays
  **screen by screen**, in SPEC-001's stated order.
- **A16 — the Next 16 + Tailwind 4 upgrade is CLEARED TO RUN** — **"รันเลย"** (*just run it* —
  owner, 2026-09-07, answering REQ-001 §Constraints **C5(b)**: he had required
  **"เอามาให้ดูก่อน"** (2026-09-06), the plan was written as `tasks/TASK-001-next16-tailwind4-upgrade.md`
  with rollback and blast radius, and Porter carried it to him). This **CLOSES C5(b)**: he has now
  seen the plan and said go. TASK-001 is no longer blocked on the owner. ⚠️ **Not changed by this:**
  the deployment line — running the upgrade means running it **locally**, on `develop`, with the
  engineer's own evidence; `dte.develyst.online` and the production database stay the owner's alone
  (PROTOCOL.md "Environments"). ⚠️ Moving the TASK-001 status is Sober's/the engineer's act, not
  Porter's — Porter routes the clearance, he does not set the task status.
- **A17 — the superseded product name in the page title is to be CHANGED** — **"เปลี่ยน"**
  (owner, 2026-09-07, answering Sober's SPEC-001 §Questions Q3, carried by Porter: *"`layout.tsx`
  still ships the superseded product name 'Disrupt Thai Education' in the page `<title>` — user-facing
  copy, so Sober did not touch it"*). This is the owner's word on user-facing copy, which is what was
  missing. Read together with **A6**, the replacement product name is **"Develyst The Education"** —
  A6 settled the name, and this answer settles that the title must use it.
  ⚠️ **NOT stated by him and NOT to be invented:** (a) the **exact `<title>` string** — whether it is
  the bare name, `DTE — Develyst The Education`, or a name-plus-tagline — nobody writes a title
  string beyond the settled name until he says; (b) whether "เปลี่ยน" covers **every other place in
  `front/` that still carries the old name** (metadata description, OG tags, headers, footer) or only
  the page `<title>` he was asked about. Both are asked back to him (Porter, 2026-09-07).
- **A18 — housekeeping MAY edit the append-only files** — **"housekeeping แก้ได้"** (owner,
  2026-09-07, answering Porter's question: *"PROTOCOL.md calls `log/` and `dispatcher-state.md`
  append-only, and `check-hygiene.mjs` says logs are never rewritten by housekeeping — but the
  housekeeping hop told me to trim one. May housekeeping edit them, or not?"*). **Standing rule
  from 2026-09-07:** a housekeeping hop **may** rewrite `log/*.md` and `dispatcher-state.md`; the
  append-only rule binds ordinary role sessions, not housekeeping. Every such edit stays marked
  inside the file it touched, as the 2026-09-07 hop did. This retro-authorises that hop's log trim
  and its `dispatcher-state.md` rotation.
  ⚠️ **Scope note, dispatcher-stated and NOT owner-stated:** the workspace-root `DISPATCHER.md`
  says a housekeeping hop fixes exactly the hygiene gate's **FAIL** lines — the WARN line about the
  oversized log entry was put into that hop's instruction by the dispatcher's own mistake, which it
  says it will not repeat. That FAIL-only scoping is the dispatcher's rule; the owner said only
  "housekeeping แก้ได้" and did not scope it. Do not attribute the FAIL/WARN split to him.
- **Still unanswered after this session:** the exact page-`<title>` string and the other-occurrences
  scope (A17 ⚠️ a/b), REQ-002 Q2–Q7, the DTE About-page Thai copy (A10), and the `4013` port fix
  still has a fact (A7) but no REQ.

---

## Owner's answers to the two page-title rename questions (2026-09-07)

> Added by Porter from the owner's own words, verbatim, BEFORE replying. These are the two ⚠️
> items left open under **A17** — (a) the exact `<title>` string, (b) how far the rename goes.
> Each answer is bound below to the exact question text it answers.

- **A19 — the exact page-`<title>` string is `DTE — Develyst The Education`** — **"DTE — Develyst
  The Education"** (owner, 2026-09-07, answering Porter's *"ขอ string ของ `<title>` แบบเป๊ะๆ ครับ — จะเอา
  ชื่อเปล่า `Develyst The Education`, หรือ `DTE — Develyst The Education`, หรือมี tagline ต่อท้าย?"*).
  This **CLOSES A17 ⚠️(a)**. The string is to be used **character for character as he wrote it**,
  including `DTE`, the spaced **em dash `—`** (not a hyphen), and the capitalisation of
  *Develyst The Education*. Nobody adds a tagline, a suffix, a site-name separator, or a
  per-page template around it beyond what he wrote — that would be inventing copy.
- **A20 — the rename applies EVERYWHERE the old name appears** — **"ทุกที่"** (*everywhere* —
  owner, 2026-09-07, answering Porter's *"คำว่า 'เปลี่ยน' ครอบคลุมแค่ `<title>` หรือรวมทุกที่ที่ยังมีชื่อเก่า
  ('Disrupt Thai Education') อยู่ใน `front/` ด้วยครับ — metadata description, OG tags, header, footer?"*).
  This **CLOSES A17 ⚠️(b)**: the superseded name **"Disrupt Thai Education"** is to be replaced
  wherever it still appears — the question he answered enumerated `<title>`, metadata description,
  OG tags, header and footer **in `front/`**, so the answer binds at least to all of those.
  ⚠️ **Not stated by him, do not read in:** whether "ทุกที่" reaches **outside `front/`** (e.g.
  `back/`, repo docs, `README.md`, `DTE.md`, deploy config, the database, or anything on
  `dte.develyst.online` he manages himself). The question he was answering was scoped to `front/`.
  Anything beyond `front/` is a **separate question, asked back to him** (Porter, 2026-09-07).
  ⚠️ Also not stated: whether the **replacement text everywhere** is the full `<title>` string
  (A19) or just the bare name **"Develyst The Education"** — A19 settles the page `<title>` only.
  Prose/heading occurrences take the settled product name (A6); nobody invents a new phrasing.
- **Still unanswered after this session:** whether the rename reaches outside `front/` and which
  form the name takes in non-`<title>` places (both above), REQ-002 Q2–Q7, the DTE About-page Thai
  copy (A10), and the `4013` port fix still has a fact (A7) but no REQ.

---

## Owner's answers to the two rename-scope questions (2026-09-07)

> Added by Porter from the owner's own words, verbatim, BEFORE replying. These are the two ⚠️
> items left open under **A20**. Each answer is bound below to the exact question it answers.

- **A21 — the rename DOES reach outside `front/`** — **"ทุกที่"** (*everywhere* — owner,
  2026-09-07, answering Porter's *"คำว่า 'ทุกที่' เมื่อวานนี้ครอบคลุมแค่ใน `front/` หรือรวมนอก `front/` ด้วยครับ —
  `back/`, เอกสารใน repo (`README.md`, `DTE.md`), deploy config, และตัวเว็บ live?"*).
  This **CLOSES A20 ⚠️(a)**. The superseded name **"Disrupt Thai Education"** is to be replaced
  **wherever it appears, not only in `front/`** — the question he answered enumerated `back/`,
  repo docs (`README.md`, `DTE.md`), deploy config and the live site, so the answer binds to all
  of those. He said it twice now (A20 for `front/`, A21 for the rest); it is a whole-product
  rename, not a frontend copy tweak.
  ⚠️ **Boundary, protocol-stated and NOT a narrowing of his answer:** an agent may change only
  files in the repo on `develop`. Occurrences that live in **production, the production database,
  or anything deployed on `dte.develyst.online`** are still the owner's own hand alone
  (PROTOCOL.md "Environments") — his "ทุกที่" tells us they are in scope of the *rename*, it does
  not authorise an agent to touch them. Those are listed for him, never executed by us.
  ⚠️ **Not stated and not to be invented:** which files actually contain the old name outside
  `front/`. Nobody guesses the list — enumerating it from the code is the SA Lead's work, and
  `DTE.md` is the owner's own document, so a change there is shown to him rather than assumed.
- **A22 — outside the page `<title>`, the name is the bare "Develyst The Education"** —
  **"Develyst The Education"** (owner, 2026-09-07, answering Porter's *"ที่ที่ไม่ใช่ `<title>` ของหน้า
  (metadata description, OG tags, header, footer, prose, เอกสาร) ให้ใช้ชื่อแบบไหนครับ — string เต็ม
  `DTE — Develyst The Education` หรือชื่อเปล่า `Develyst The Education`?"*).
  This **CLOSES A20 ⚠️(b)**. Two forms, and only two: the page `<title>` uses the exact A19 string
  **`DTE — Develyst The Education`**; **every other occurrence uses the bare name
  `Develyst The Education`**, character for character as he wrote it. Nobody invents a third form,
  a tagline, an abbreviation-only variant, or a per-place phrasing. This agrees with **A6** (the
  settled product name).
- **Still unanswered after this session:** REQ-002 Q2–Q7, the DTE About-page Thai copy (A10), and
  the `4013` port fix still has a fact (A7) but no REQ. **The rename is now fully specified** —
  string (A19), `front/` scope (A20), outside-`front/` scope (A21), non-title form (A22).

---

## Owner's STANDING RULING — git is his, not the team's business (2026-09-07)

> Added by Porter from the owner's own words, verbatim, BEFORE replying. This answers the
> question Sober raised on 2026-09-07 (board Blocked row: *"⚠️ `origin/production` is one commit
> BEHIND `develop` — does `SYSTEM-FACTS.md` A4 still hold? `origin/production` = `253eeda`,
> `develop` = `origin/develop` = `d466ba4`"*). His answer is **not scoped to that one question**
> — it is a ruling on the whole subject. Read it together with **A1**, which said the same thing
> about `main` and about work he has not yet committed.

- **A23 — the team stops concerning itself with the owner's git and commits; it works on the
  code** — **"เลิก ยุ่งกับการ commit หรือgit ของฉัน ทำงาน code  กันไป"** (owner, 2026-09-07).
  **STANDING RULE, binding on every role from this date, and it closes the subject permanently:**
  git state, branches, commit hashes, which branch `origin/production` (or any remote) sits at,
  which branch production runs, and whether something has been merged, committed, pushed or is
  still uncommitted are **the owner's own business and outside the team's scope**. The team
  **does not ask about them, does not report on them, does not raise a discrepancy in one as a
  finding, and does not gate, block or delay any work on them.** Nobody re-opens this — not as a
  question to him, not as a Blocked row, not as a ⚠️ in a REQ/SPEC/TASK. This **extends A1** from
  `main` to the entire subject.
  - **What is UNCHANGED and stays absolute:** 🔴 **no agent ever commits, pushes, branches,
    merges, runs `merge-workflow.sh` / `release-workflow.sh`, deploys, or touches production or
    the production database** (PROTOCOL.md "Environments", "Repo layout"). His ruling removes the
    subject from our *conversation*, not the guard from our *hands*. Work is still handed off as
    **edited files on the branch he assigned, `develop`** (A1). Read-only `git status` to describe
    which files a role changed remains ordinary work evidence — reporting on *his* commits,
    branches or remotes does not.
  - **Consequently CLOSED, and none of them is to be raised again:** the `origin/production`-vs-
    `develop` discrepancy (Sober, 2026-09-07) · the question *"does A4 still hold?"* — **A4 stands
    on the record exactly as he stated it on 2026-09-07 ("yes"), and it is no longer a live
    question for anyone; nobody re-verifies, re-derives or re-asks it** · the ⚠️ CONTESTED
    `main`-vs-the-workflow-scripts line under §"Branches, releases and who may run them", which
    A1 already left unresolved-and-unactionable and which now also becomes **unaskable**.
  - **⚠️ Not stated by him and not to be read in:** nothing here changes what the team may edit,
    where work is handed off, or the no-touch rule on production. This ruling is about the
    *subject of git*, not about the code (Porter, 2026-09-07).
- **Still unanswered after this session** (nothing git-related remains): REQ-002 Q2–Q7 · the DTE
  About-page Thai copy (A10) · the `4013` port fix has a fact (A7) but still no REQ · SYSTEM-FACTS
  Q3 / A3, the inherited `/portfolio` `/services` `/contact` `/blog` routes — his call, re-asked
  with the evidence and still open.

---

## Owner's answers to SPEC-002's three rename questions (2026-09-08)

> Added by Porter from the owner's own words, verbatim, BEFORE replying. These answer the three
> questions Sober raised in `specs/SPEC-002-product-name-rename.md` §Questions Q1–Q3 on
> 2026-09-08, asked and answered **in that order**. They close the last open items on REQ-004.

- **A24 — the repo-root `README.md:3` tagline: replace the WHOLE sentence** — **"เปลี่ยนทั้งประโยค"**
  (*change the whole sentence* — owner, 2026-09-08, answering SPEC-002 §Questions **Q1**: the line
  `> **Disrupting Thai Education** - Platform การเรียนรู้ออนไลน์สำหรับประเทศไทย` uses
  "Disrupt**ing**", a verb phrase rather than the product name, so neither Rule T nor Rule N fit;
  the two offered answers were *(a)* replace the whole tagline with `Develyst The Education`, or
  *(b)* leave it as prose). His answer selects **(a)**: the whole tagline sentence on that line —
  the English verb phrase **and** the Thai descriptor after the dash — is replaced by the bare
  settled name **`Develyst The Education`** (A22 form). It is **not** a substring swap on that
  line, and no new tagline is invented to take its place.
  ⚠️ **Not stated and not to be invented:** he ruled on the *copy*, not on the line's Markdown
  decoration (`> ` blockquote, `**bold**`). Decoration is not copy (REQ-004 C5) and is nobody's to
  redesign; if the exact resulting literal is not obvious to the SA Lead, that is a question back
  to Porter, not a SPEC decision. **Renaming inside `README.md` remains in scope; fixing its stale
  content does not** (REQ-004 C4 — the file is still the stale one, A2).
- **A25 — cutting the two Thai taglines out of the page titles is APPROVED** — **"ตัดได้"**
  (*they can be cut* — owner, 2026-09-08, answering SPEC-002 §Questions **Q2**: applying REQ-004
  §Requirement 2 to `front/src/app/layout.tsx:22` and `front/src/app/page.tsx:18` **deletes** the
  Thai taglines he wrote, leaving the browser tab reading only `DTE — Develyst The Education`).
  **Rule T stands exactly as written** — the whole title value is replaced by the exact A19 string,
  no tagline kept, no ` | …` suffix, no per-page variant. This was flagged because it removes copy
  rather than renaming it; he has now seen that and accepted it.
- **A26 — the owner-only occurrences are his, and he will do them himself** — **"เดี๋ยวจัดการเอง"**
  (*I'll handle it myself* — owner, 2026-09-08, answering SPEC-002 §Questions **Q3**: the
  owner-only list = his own `DTE.md` ×3 (`:1` heading, `:936` quoted slogan, `:938` the
  `#DisruptThaiEducation` hashtag — REQ-004 C3) **plus** everything outside the repo: the deployed
  site `dte.develyst.online`, the production database, deploy/server config, and social/marketing
  surfaces — REQ-004 C2). **No agent edits any of them, and nobody chases him for them or treats
  them as a gate.** The list has been handed over and accepted, which satisfies REQ-004 §Acceptance
  Criteria item 6. `DTE.md` therefore keeps the old name in the repo until he changes it — that is
  **expected, not a defect**, and it is why the "zero occurrences" search in REQ-004 AC 2 is scored
  over `front/` + `back/` + `README.md`, not over `DTE.md`.
- **Still unanswered after this session:** REQ-002 Q2–Q7 · the DTE About-page Thai copy (A10) ·
  the `4013` port fix has a fact (A7) but still no REQ · SYSTEM-FACTS Q3 / A3, the inherited
  `/portfolio` `/services` `/contact` `/blog` routes. **REQ-004 now has nothing open with him.**

---

## Owner's answers to the site-wide page-title question and the TASK-013 routing (2026-09-08)

> Added by Porter from the owner's own words, verbatim, BEFORE replying. Asked and answered **in
> this order**: (1) `specs/SPEC-002-product-name-rename.md` §Questions **Q5** — the other routes'
> `… | DTE Platform` titles, unify or leave; (2) the optional veto on Porter's Q4 routing call
> (TASK-013 → Jason). His reply was `Q1=ให้เหมือนกันทั้งเว็บ, Q2=โอเค`.

- **A27 — the page titles are to be THE SAME ACROSS THE WHOLE SITE** — **"ให้เหมือนกันทั้งเว็บ"**
  (*make them the same across the whole site* — owner, 2026-09-08, answering SPEC-002 §Questions
  **Q5**, whose two offered answers were *leave the other routes' `… | DTE Platform` titles as they
  are* or *unify them to the new form*). He chose **unify**. Consequences, all of them already
  stated to him before he answered and none of them inferred here:
  - This is a **NEW requirement — `requirements/REQ-005-unify-page-titles-site-wide.md`** — and
    **never a widening of SPEC-002**, exactly as Porter framed the question when he asked it.
    SPEC-002 is closing on its own scope; nothing in it reopens.
  - It is **not a defect and nothing is broken**: none of those titles contains the superseded name,
    so REQ-004 AC 2 does not score them and neither TASK-011 nor TASK-013 was wrong to leave them.
  - ⚠️ **What he did NOT state, and what nobody may invent:** *the shape* of the unified title —
    whether every page's tab reads exactly the A19 string `DTE — Develyst The Education`, or whether
    each page keeps its own page name plus one unified site part (today `/courses` reads
    `ทักษะทั้งหมด | DTE Platform`). "เหมือนกัน" settles that they must match; it does not settle what
    they match *to*, and the two readings produce different tabs on every route. **This is asked of
    him in REQ-005 §Open questions and nothing is enumerated, specced or edited until he answers**
    (REQ-004 C5 and PM.md: a copy rule is a fact only when the owner states it).
- **A28 — Porter's TASK-013 routing stands; the owner did not overturn it** — **"โอเค"** (*okay* —
  owner, 2026-09-08, on being told that Porter had routed the repo-root `README.md` one-liner to
  **Jason (BE)** as a one-off and could reverse it in one word). This is an **acceptance of a
  management call, not a new rule**: `PROTOCOL.md` is still not amended, Jason's ownership is still
  `back/` only, and **no repo-root precedent exists** — the next root-level file is a fresh routing
  question. TASK-013 was already executed under that routing and is at `REVIEW`.
- **Still unanswered after this session:** REQ-002 Q2–Q7 · the DTE About-page Thai copy (A10) · the
  `4013` port fix has a fact (A7) but still no REQ · SYSTEM-FACTS Q3 / A3, the inherited
  `/portfolio` `/services` `/contact` `/blog` routes · **NEW: REQ-005's title shape (A27 ⚠️).**

---

## Owner's answer on the SHAPE of the unified page title (2026-09-08)

> Added by Porter from the owner's own words, verbatim, BEFORE replying. This answers
> `requirements/REQ-005-unify-page-titles-site-wide.md` §Open questions **Q1**, the ⚠️ that A27 left
> open. He wrote `Q2=ข` — "Q2" was that question's number in the digest he was reading; it is
> REQ-005's only open question, and `ข` is the second of the two options Porter offered him.

- **A29 — the unified title keeps each page's own name and shares ONE common tail** — **`Q2=ข`**
  (owner, 2026-09-08, choosing option **(ข)** of the two offered: *(ก)* every route's tab reads
  exactly the A19 string `DTE — Develyst The Education`, or *(ข)* each route keeps its own page name
  plus one unified site part, e.g. `ทักษะทั้งหมด — DTE — Develyst The Education` in place of today's
  `ทักษะทั้งหมด | DTE Platform`). He chose **(ข)**. What this settles:
  - The title has **two parts on every route**: the page's own name, then one site part that is
    identical everywhere. A single fixed string on every tab — option (ก) — is **rejected**.
  - **A19 is untouched as a string.** It remains the exact page-`<title>` text established for `/`;
    (ข) does not rewrite it and REQ-004 stays closed on its own scope.
- ⚠️ **What A29 does NOT settle, and nobody may invent** (Porter said when asking that (ข) would
  need one more line from him, and he did not give it):
  1. **The exact separator and word order** of the two parts — `—` vs `|` vs `·`, and whether the
     site part is the full `DTE — Develyst The Education` or a shorter `DTE`. The example in the
     question was written "e.g.", not as an offered string, so it is **not** an answer.
  2. **What `/` (the home route) reads** under (ข) — it has no page name of its own distinct from
     the site, so it either stays exactly A19 or gains a name. Porter's option-(ข) text said `/`
     stays exactly A19, but the owner answered with one letter and did not restate it, so it is
     **confirmed with him, not assumed**.
  Both are asked of him in REQ-005 §Open questions **Q2**. **REQ-005 stays `DRAFT`** — no
  enumeration is specced into edits and no title is changed until he answers (PM.md: a copy rule is
  a fact only when the owner states it).
- **Still unanswered after this session:** REQ-005 **Q2** (separator + word order + what `/` reads)
  · REQ-002 Q2–Q7 · the DTE About-page Thai copy (A10) · the `4013` port fix has a fact (A7) but
  still no REQ · SYSTEM-FACTS Q3 / A3, the inherited `/portfolio` `/services` `/contact` `/blog`
  routes · the owner's own eyes on REQ-004 AC 5, TASK-001 and TASK-002.

---

## Owner's answers on the REQ-005 title string, the support contact, and REQ-004 AC 5 (2026-09-08)

> Added by Porter from the owner's own words, verbatim, BEFORE replying. Four answers, in the order
> they appeared in the digest he was reading: `Q1=ข`, `Q2=คงเดิม`, `Q3=ไม่ต้อง`, `Q4=ผ่าน`. His
> numbering is the digest's, not any file's — the mapping to the artifacts is written on each line.

- **A30 — the unified page title is `<page name> | DTE — Develyst The Education`** — **`Q1=ข`**
  (owner, 2026-09-08, answering `requirements/REQ-005-unify-page-titles-site-wide.md` §Open
  questions **Q2.1**, whose four offered options were *(ก)* em dash + full tail, *(ข)* `|` + full
  tail, *(ค)* em dash + short `DTE` tail, *(ง)* his own wording). He chose **(ข)**: the separator is
  the **pipe `|`** (today's separator, kept) and the site part is the **full A19 string
  `DTE — Develyst The Education`** — not the short `DTE`. Example as offered to him:
  `ทักษะทั้งหมด | DTE — Develyst The Education` replaces today's `ทักษะทั้งหมด | DTE Platform`.
  The em dash inside the site part is the A19 em dash (U+2014); the separator between the two parts
  is `|`. Together with **A29** (two-part shape) the title rule is now fully owner-stated and
  nothing about it is inferred.
- **A31 — the home route `/` keeps exactly the A19 string, unchanged** — **`Q2=คงเดิม`** (*keep it
  as it is* — owner, 2026-09-08, answering REQ-005 §Open questions **Q2.2**, which asked him to
  confirm or overwrite Porter's option-(ข) text that `/` would stay `DTE — Develyst The Education`).
  He **confirmed**: `/` gains no page name and is the one route with a one-part title. This closes
  REQ-005 AC "A19 is not altered on `/`" as an owner-stated rule rather than an assumption, and
  keeps REQ-004 closed on its own scope.
- **A32 — DTE does NOT want a support-contact affordance added back after `/contact` is removed** —
  **`Q3=ไม่ต้อง`** (*not needed* — owner, 2026-09-08, answering the question Sober raised in
  `specs/SPEC-003-remove-inherited-portfolio-routes.md` §Questions **Q1** and Porter relayed:
  deleting `/contact` and its "ติดต่อฝ่ายสนับสนุน" link leaves a user stuck in email verification
  with no contact route on the site). He does **not** want one. Consequences: **no new REQ is
  opened**, the verify-email Help Text stays removed as TASK-014 built it, and **nobody re-raises
  this** — it is a deliberate decision, not a gap. If he ever wants a support contact, he states the
  channel and the copy himself and it is a fresh REQ.
- **A33 — the owner has looked at the rename and it passes** — **`Q4=ผ่าน`** (*passes* — owner,
  2026-09-08, answering `requirements/REQ-004-product-name-rename-everywhere.md` §Acceptance
  Criteria **AC 5**'s owner half: on the code as it stands on `develop`, the browser tab reads
  `DTE — Develyst The Education` and the pages still render). This is the **only** thing REQ-004 was
  held for; with it, all 6 acceptance criteria are met and REQ-004 moves to **`DELIVERED`**.
  ⚠️ `DELIVERED` here means the criteria are met with evidence in the files — **it has never meant
  deployed** (PROTOCOL.md §Statuses). `dte.develyst.online` still shows the old name until the owner
  ships it himself; no agent deployed anything.
- **Still unanswered after this session:** REQ-002 Q2–Q7 · the DTE About-page Thai copy (A10) · the
  `4013` port fix has a fact (A7) but still no REQ · the owner's own eyes on TASK-001 and TASK-002
  (the Next 16 / Tailwind 4 upgrade and the folder moves — separate from A33, which covers the
  rename only). **REQ-004 and REQ-005 now have NOTHING open with him.**

---

## Owner answers — 2026-09-09, the three SPEC-004 questions

> Added by Porter from the owner's own words, verbatim, BEFORE replying. Three answers, in the
> order they were asked: `Q1=เข้าสู่ระบบ, สมัครสมาชิก, สอน, ยืนยันอีเมล`, `Q2=ชื่อกลาง`, `Q3=เปลี่ยน`.
> His numbering is the digest's, not any file's — the mapping to the artifacts is on each line.

- **A34 — the four Thai page names for the nameless client routes** — **`Q1=เข้าสู่ระบบ,
  สมัครสมาชิก, สอน, ยืนยันอีเมล`** (owner, 2026-09-09, answering
  `specs/SPEC-004-unify-page-titles.md` §Questions **Q1**, first half, which listed the four routes
  in this exact order). Mapped **positionally, in the order the question listed them**:
  **`/login` → `เข้าสู่ระบบ`** · **`/register` → `สมัครสมาชิก`** · **`/teach` → `สอน`** ·
  **`/verify-email` → `ยืนยันอีเมล`**. With **A30** each of those four tabs therefore reads
  `<that name> | DTE — Develyst The Education`. These are his words, not anyone's translation, and
  nobody may re-word, expand or shorten them (REQ-005 §Requirement 4).
- **A35 — `/classroom/[id]` gets ONE shared fixed name, not the course's own title** —
  **`Q2=ชื่อกลาง`** (*a common/central name* — owner, 2026-09-09, answering SPEC-004 §Questions
  **Q1**, second half, which offered exactly two branches: all classrooms share one fixed name, or
  the tab shows each course's own title). He chose the **shared fixed name**; the per-course title —
  which would need `generateMetadata` and is the metadata redesign REQ-005 C2 forbids — is
  **rejected and not to be built**. ⚠️ **The name itself is still unstated**: "ชื่อกลาง" names the
  *rule*, not the *word*. Nobody may invent it (REQ-005 §Requirement 4) — Porter asked him for the
  exact word on 2026-09-09, see `requirements/REQ-005-unify-page-titles-site-wide.md` §Open
  questions **Q3**.
- **A36 — the six surviving `DTE Platform` body-copy occurrences are to be CHANGED** —
  **`Q3=เปลี่ยน`** (*change (them)* — owner, 2026-09-09, answering SPEC-004 §Questions **Q2**, which
  reported that `DTE Platform` survives as **visible on-screen copy** in six places: `/about` ×2
  incl. a table header, `/login:86`, `/register:193`, `/teach:104`, and a comment in
  `src/services/api.ts:1`). This is **outside REQ-005** by SPEC-004's own framing, so it becomes a
  **new REQ (REQ-006)** and widens nothing already in flight. ⚠️ **What they change TO is still
  unstated** — the full A19 string, the short `DTE`, or other wording is a copy decision only he
  makes; Porter asked on 2026-09-09, see `requirements/REQ-006-replace-dte-platform-body-copy.md`
  §Open questions **Q1**.
- **Still unanswered after this session:** REQ-002 Q2–Q7 · the DTE About-page Thai copy (A10) · the
  `4013` port fix has a fact (A7) but still no REQ · the owner's own eyes on TASK-001, TASK-002 and
  on TASK-014's Footer / `/verify-email` · **new:** the `/classroom/[id]` shared name (A35) and the
  replacement wording for the six body-copy occurrences (A36).

---

## Owner answers — 2026-09-09, round 2: the two half-answers closed

> Added by Porter from the owner's own words, verbatim, BEFORE replying. Two answers plus one
> exclusion, in the order they were asked: `Q1=ก`, `Q2=ข`, `ไม่ต้องเอาคอมเมนต์`. His `Q1`/`Q2` are
> the digest's numbering, not any file's — the mapping is on each line below. These close the two
> ⚠️ half-answers left by **A35** and **A36**.

- **A37 — the shared page name for `/classroom/[id]` is `ห้องเรียน`** — **`Q1=ก`** (owner,
  2026-09-09, answering `requirements/REQ-005-unify-page-titles-site-wide.md` §Open questions
  **Q3**, whose option **(ก)** was `ห้องเรียน`; (ข) `เรียน` and (ค) `บทเรียน` are **rejected**).
  This is the *word* that **A35** left unstated — one shared fixed name for every classroom, the
  same on every course. With **A30** the tab therefore reads
  **`ห้องเรียน | DTE — Develyst The Education`** on every `/classroom/<id>`. Nobody may re-word,
  expand, shorten or per-course-ify it (REQ-005 §Requirement 4); the per-course title stays
  rejected (A35). **REQ-005 now has NOTHING open with the owner.**
- **A38 — the `DTE Platform` body copy is replaced by the short `DTE`** — **`Q2=ข`** (owner,
  2026-09-09, answering `requirements/REQ-006-replace-dte-platform-body-copy.md` §Open questions
  **Q1**, whose option **(ข)** was *the short `DTE` everywhere*; (ก) the full A19 string and (ค) the
  Thai `แพลตฟอร์ม DTE` are **rejected**). One replacement string, `DTE`, for every in-scope
  occurrence — he named no per-place exception, so if a sentence does not read right with it that
  is reported back to him, never patched by rewording the sentence (REQ-006 §Requirement 3).
- **A39 — the `src/services/api.ts:1` source comment is EXCLUDED from that change** —
  **`ไม่ต้องเอาคอมเมนต์`** (*don't include the comment* — owner, 2026-09-09, answering the second
  half of the same REQ-006 **Q1** line, which asked whether the invisible source comment counts).
  It is code, not user-visible; it **keeps** its `DTE Platform` wording and no agent edits it,
  including "while I was in there". REQ-006's scope is therefore the **visible on-screen copy
  only** — the six occurrences Sober reported **minus** this one; the exact in-scope list is still
  enumerated from the code first (REQ-006 §Requirement 1 / AC 1), not carried over as a count.
- **Still unanswered after this session:** REQ-002 Q2–Q7 · the DTE About-page Thai copy (A10) · the
  `4013` port fix has a fact (A7) but still no REQ · the owner's own eyes on TASK-001, TASK-002,
  on TASK-014's Footer / `/verify-email`, and on TASK-015's three unified tabs.
  **REQ-004, REQ-005 and REQ-006 now have NOTHING open with him.**

---

## Environment fact — this machine's tooling (NOT owner-stated; Porter's judgement call)

> Appended by Porter 2026-09-09, on Sober's routed recommendation in `inbox/PM.md`, in Fern's own
> words. 🔴 **This is NOT an owner statement** — it is an observed, reproduced and repaired
> behaviour of the tooling on this machine, which is exactly what this file's header admits as
> "how the running system actually behaves". It is **not** a requirement and **not** a copy rule;
> nobody may cite it as the owner's word. If the owner later contradicts it, his line wins.

- **A40 — `sed -i` on this machine silently rewrites a whole file CRLF→LF, and `git diff` hides it**
  (Fern, 2026-09-09, hit + caught + repaired in `tasks/TASK-018-replace-dte-platform-body-copy.md`
  §Implementation Notes; routed to me by Sober, who also recorded it in
  `specs/SPEC-005-replace-dte-platform-body-copy.md` §Decision 3). Cause as she found it:
  `core.autocrlf=true` with no `.gitattributes`. It was detected by a **file-size delta** (`login`
  fell 245 bytes instead of 9 = 236 × `\r` + 9) and repaired with `perl -i -pe 's/\n/\r\n/'` on
  exactly the four files. Consequence for future work: a byte-exact edit here must pin **file size**
  and **`tr -cd '\r' | wc -c` == `wc -l`**, not per-line byte lengths alone — Sober has already
  changed his own TASK checklists to do so. No production, database or git write was involved.

---

## Owner's answer, 2026-09-09 — the scope of visible UI change during the antd migration

> Appended by Porter 2026-09-09 **before the reply was sent**. Verbatim, in his own words, in
> answer to the visual question Fern raised as `tasks/TASK-004-login-screen-migration.md`
> §Questions **Q1** — a ruling the other six SPEC-001 screens will copy.

- 🔴 ~~**A41 — during the antd migration the LOOK does not change; the only visible change is emoji → icons**~~
  **STRUCK 2026-09-09 by Porter — WRONG READING, corrected by the owner himself. The correction is
  A42 in the section below; read that, never this. Every line of A41 is kept verbatim underneath,
  never deleted (PROTOCOL.md §SYSTEM-FACTS rule 3), as the record of the mistake — the mistake was
  Porter's reading of "re UI", not anything the owner said.**
  — **"re UI เอง และ แค่ เอา emojiออก ใช้icon"** (owner, 2026-09-09, verbatim, sent with the pace
  nudge "ไปเลย ทำให้เสร็จได้แล้ว"). Read against TASK-004 §Questions Q1, which offered **(a)** accept
  antd's control metrics as the new house look — inputs 50→40 px, the sky→cyan gradient submit
  replaced by a flat antd primary, social buttons ≈50→40 px — or **(b)** preserve today's look:
  **his answer is (b)**. The migration is a substrate change, not a re-skin; **REQ-001 §Out of
  Scope "Visual redesign / rebranding" therefore stands unchanged and now has his word behind it,
  not just Porter's reading.** The one visible change he does want is REQ-001 §Requirement 3, which
  he restated here: **emoji out, icons in.**
  🔴 **Porter states plainly what this fact does NOT decide:** *how* today's look is preserved is a
  technical design call and is **Sober's alone** — Q1's option (b) sketches wrapper-level changes
  (`size="large"` / a height / a gradient variant on `ui/`), but the owner named no mechanism and
  Porter proposes none. Nor does this fact touch Q2, Q3 or Q4 of that TASK; they remain open with
  Sober and are not answered by silence.
- **Confidence, stated rather than hidden:** Porter reads "แค่" (*only*) as the operative word —
  only the emoji change is wanted. He was told exactly this reading in Thai in the same reply, so
  he can overturn it in one word if it is wrong.
  > 🔴 **He did overturn it, in the very next message — see A42 below. The "confidence" bullet above
  > is exactly why: the reading was told to him in Thai, and he corrected it. Nothing in this A41
  > block is actionable any more.**

---

## Owner's CORRECTION, 2026-09-09 — A41 was misread: the NEW look stays and should get BETTER

> Appended by Porter 2026-09-09 **before the reply was sent**. This is the owner correcting
> **Porter's reading**, unprompted, in his own words. A41 above is struck, not deleted.

- **A42 — "re UI" did NOT mean go back to the old look; it means make the NEW look BETTER, and only
  take the emoji out in favour of icons** — **"re UI ไม่ได้หมายถึง ให้ ย้อนเป็น หน้าตาเดิม หมายถึงให้ทำ
  หน้าตาใหม่ให้ดีขึ้น และ แค่ เอา emojiออก ใช้icon"** (owner, 2026-09-09, verbatim, sent with the pace
  nudge "ไปเลย ทำให้เสร็จได้แล้ว"; the trailing `N=8` is dispatcher routing, not content, and is ignored).
  What he settles here — his word, not Porter's reading:
  1. **Reverting to today's / the legacy look is NOT what he asked for.** A41's "his answer is (b)"
     is wrong. TASK-004 §Questions **Q1 option (b) is NOT his answer**, and a rework whose purpose
     is visual restoration is not what he wants.
  2. **The look MAY change, and he wants it changed for the better** — "ทำหน้าตาใหม่ให้ดีขึ้น".
     The new appearance the antd substrate brought is not a defect to be undone.
  3. **emoji → icons stands** (REQ-001 §Requirement 3) — he has now restated it three times.
  🔴 **What A42 does NOT decide — stated rather than guessed:** *how far* "ให้ดีขึ้น" (*better*) goes.
  Whether antd's own default appearance already satisfies "better", or whether he wants a deliberate
  visual-improvement pass with something to look at first, is **not settled by this sentence**, and
  Porter proposes nothing. Asked back to him as **REQ-001 §Questions Q7** — non-blocking, because
  item 1 above (stop the restoration) is unambiguous and actionable on its own. Equally untouched:
  **how** any of it is built is Sober's design call alone, and A42 answers none of TASK-004's Q2/Q3/Q4.
  🔴 **Consequence Porter must state, read from the artefacts and not from a summary:** acting on the
  struck A41, Sober returned TASK-004 as `REWORK` for visual restoration and wrote
  `specs/SPEC-001-frontend-foundation.md` **§Decision 7** ("the `ui/` wrapper's DEFAULT look IS
  today's look") — and **Fern has already RUN that rework**: `tasks/TASK-004-login-screen-migration.md`
  is `REVIEW` with R1–R7 evidenced in §Rework Implementation Notes. So the restoration is already in
  the code, not merely planned. Both the SPEC decision and the REWORK verdict are **Sober's files and
  Sober's alone to reverse**; Porter routed A42 to him via `inbox/SA.md` and touched neither, nor any
  code.

---

## Owner's answer to REQ-001 §Q7, 2026-09-09 — (ข): a deliberate visual pass, home page FIRST

> Appended by Porter 2026-09-09 **before the reply was sent**. This closes the question A42 left
> open and is the owner's own word, not Porter's reading.

- **A43 — "ทำหน้าตาใหม่ให้ดีขึ้น" = a DELIBERATE visual-improvement pass (Q7 option ข), starting with
  the HOME page then the COURSES page, shown to him before the rest follow; what "better" means to
  him is SPACING and COLOUR, looking MODERN** — **"ข ทำ /หน้าแรกเลย และ หน้าคอร์สต่อ ให้ดูก่อน เน้นระยะห่าง
  กับสีให้ดูโมเดิร์น"** (owner, 2026-09-09, verbatim). Read against REQ-001 §Questions **Q7**, which
  offered **(ก)** antd's default appearance already IS the "better" he means, team stops at
  emoji → icons — or **(ข)** a deliberate visual-improvement pass with one screen shown to him
  first. What he settles:
  1. **His answer is (ข).** antd's defaults on their own are NOT the finish line; the new look is
     designed on purpose.
  2. **He changed which screen goes first.** Q7's (ข) proposed `/login`; he did not take it. The
     order he states is **the home page first (`/หน้าแรก`), the courses page second**, and he
     **sees those before the remaining screens copy the result** ("ให้ดูก่อน").
  3. **He gave the taste criteria Q7 asked him for, unprompted:** **ระยะห่าง (spacing) and สี
     (colour)**, aiming at **โมเดิร์น (modern)**. These are his words and the only stated criteria —
     nobody here adds "his taste" beyond them.
  🔴 **What A43 does NOT decide — stated rather than guessed:**
  - **Which page "หน้าคอร์ส" is** — the course LIST (`/courses`) or a course DETAIL page. Porter does
    not pick; asked back as REQ-001 §Questions **Q8**, non-blocking because the first screen (the
    home page) is unambiguous and can start now.
  - **What happens to `/login` (TASK-004)** and the order of the remaining SPEC-001 screens. He named
    a starting order, not a re-plan; **how the seven screens are sequenced and how any of this is
    built stays Sober's design call alone**, and Porter proposes no mechanism.
  - **A43 does not widen REQ-001 into a rebranding.** Requirement 3 (emoji → icons) is untouched and
    still stands; the product surface is still out of scope.

---

## Owner's answers of 2026-09-09 (third round) — REQ-001 §Q8, REQ-001 §Q6, and ONE UNLABELLED word

> Appended by Porter 2026-09-09 **before the reply was sent.** His whole message, verbatim, was
> exactly one line: **`Q1=ก, Q2=ตัดลิงก์ทิ้ง, ผ่าน`** — answering a digest that put **five** labelled
> items to him (its Q1 = which page is "หน้าคอร์ส"; Q2 = the `/forgot-password` 404; Q3 = REQ-003's
> owner-eyes check; Q4 = REQ-006's owner-eyes check; Q5 = the Thai copy for `/about`) **and** asked
> him to open the redesigned home page locally and say whether it passes. Digest numbering ≠ the REQ
> question numbers; the mapping is written out under each fact below so nobody re-derives it.

- **A44 — "หน้าคอร์ส" in A43 means the course LIST page (`/courses`), not a course detail page** —
  **"Q1=ก"** (owner, 2026-09-09, verbatim), answering the digest's Q1 = `requirements/REQ-001-frontend-pattern-and-ui-foundation.md`
  §Questions **Q8**, whose options were **(ก)** the course **list** page `/courses` · **(ข)** a course
  **detail** page · **(ค)** both, list first. **His answer is (ก): the list page only.** So SPEC-006
  Phase 2 = `/courses`, and a course **detail** page is **not** part of the visual pass he named.
  🔴 **What A44 does NOT decide:** anything about **how** Phase 2 is built or **when** it is
  sequenced against the remaining SPEC-001 screens — that stays Sober's design call alone, and
  Porter proposes no mechanism. It also does not say a detail page is out of scope *forever*; it
  says he did not put one in this pass, and nobody widens it for him.

- **A45 — the dead `/forgot-password` link is to be REMOVED, not built** — **"Q2=ตัดลิงก์ทิ้ง"**
  (owner, 2026-09-09, verbatim; *"cut the link out"*), answering the digest's Q2 =
  `requirements/REQ-001…md` §Questions **Q6**, which offered **build the forgotten-password flow**
  or **drop the link**. **He chose dropping it.** So: **no forgotten-password feature is being
  built**, there is **no backend work** in this, and the change is the removal of the link that
  `front/src/app/login/page.tsx:151` renders at `/forgot-password`. Per the framing of the question
  he answered, this is its **own new requirement** — `requirements/REQ-007-remove-dead-forgot-password-link.md`
  — and **not** a widening of REQ-001 (foundation, no product surface).
  ⚠️ Still **UNVERIFIED** and carried, not laundered: nobody here may open the live site
  (PROTOCOL.md §Environments), so the 404 remains Sober's read of the code, not an observed
  response. That does not weaken A45 — he answered the question as asked.

- **A46 ⚠️ AMBIGUOUS — the bare trailing "ผ่าน" is NOT attributed to anything, and stays
  UNACTIONABLE until he says which item it covers.** He wrote **"ผ่าน"** (*"it passes"*) with **no
  label**, after two labelled answers, while **four** pass/fail-shaped things were open with him at
  once: **(1)** the redesigned **home page** he was asked to open locally (SPEC-006 Phase 1, the A43
  "ให้ดูก่อน" gate); **(2)** the digest's **Q3** = REQ-003 §Questions **Q4**, his eyes on the four
  removed routes + the Footer + `/verify-email` (REQ-003 **AC 7**); **(3)** the digest's **Q4** =
  REQ-006 §Questions **Q1**, his eyes on the shortened `DTE` body copy (REQ-006 **AC 6**); **(4)**
  the digest's **Q5**, the Thai copy for `/about` — which is not a pass/fail item at all and cannot
  be what "ผ่าน" answers, but is also still unanswered.
  🔴 **Porter did NOT pick one.** Reading a labelled "ผ่าน" onto an unlabelled one is exactly the
  class of mistake A41 was (Porter's reading recorded as the owner's word, then struck by him). One
  "ผ่าน" cannot be spent on three gates, and guessing wrong would mark a REQ `DELIVERED` on an
  approval he never gave. **Consequence, stated not guessed:** REQ-003 stays `SPEC_DONE` (AC 7
  open), REQ-006 stays `SPEC_DONE` (AC 6 open), and the SPEC-006 Phase-1 gate stays open-and-unmet.
  Re-asked in Porter's reply of 2026-09-09 as three separately-labelled yes/no items; the moment he
  labels it, the fact becomes A47+ and the affected REQs move in one hop.
