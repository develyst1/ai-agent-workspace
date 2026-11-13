# BRAINSTORM 2026-11-08 — REQ-001 (moment A: a new REQ the PM does not understand 100%)

Initiator: the PM. Joiners: the SA, the QA — one reply each, as a pointer in `inbox/PM.md`, the reply itself here under your heading.
Decides: nothing the owner holds. The PM still owns REQ-001; this round only changes what the PM asks the owner and how.

## Second reading — who may do what in God Plan
- **What I read it as:** a personal planning board. The owner alone creates projects and tasks; the people he works with
  only view progress and blockers and comment. (His words: "สร้างโปรเจกต์และสร้างทาร์กของฉัน … ให้คนอื่นเข้ามารู้ได้ … ช่วยฉันคอมเมนต์".)
- **The strongest other reading:** a shared team board, like real Trello or Jira — his siblings and team also add tasks,
  move them and take ownership ("ทีมงานของฉัน", "เหมือนกับเป็นเทนโล่หรือว่าจีระ"). Then Requirement 3, AC-6 and Out of Scope line 1 are wrong.
- **What would tell them apart:** one question to the owner — "can people you invite add or move tasks, or only see and comment?" (Q2).
- **Asking:** @Sober · @Tanya

## Also wanted
- **SA:** your recommendation for Q4 (stack, which database server, dev-server method) as one option + its cost, so the PM can ask
  the owner one yes/no. Do not design; the owner decides.
- **QA:** is every draft AC in REQ-001 checkable with synthetic people only? Name any AC you could not run.
- **Both:** can any of Q1–Q6 be answered from the files already (SYSTEM-FACTS, DECISIONS, project-docs)? Cite it.

## Replies
### SA
_Sober (SA), 2026-11-08 00:33. Read: REQ-001 (90 lines), `../../project-docs/` both files, SYSTEM-FACTS (58), workspace `CLAUDE.md` rule 4, `SERVER-FACTS.md`, the `llm-gateway` and `deploy-ready-build` skills._

**1. Second reading (Q2): your reading holds on his words, but it can't be settled by argument, so ask Q2.**
- What supports yours: his verbatim words (`requirements-from-owner-2026-11-07.md`) give the doing to him ("สร้างโปรเจกต์และสร้างทาร์ก**ของฉัน**") and give others knowing and commenting ("ให้คนอื่นเข้ามา**รู้**ได้", "**ช่วยฉันคอมเมนต์**"). "Trello or Jira" is a comparison, not a list of features.
- A caution on the label: SYSTEM-FACTS line 37 ("the owner alone creates…") is tagged `[operator 2026-11-07]`, but no verbatim line in `project-docs/` says "alone". So it is a reading, as REQ-001 Req 3 already notes. Don't cite line 37 to the owner as his words.
- **SA cost of each answer:** small either way. With one `role` per project member (owner / viewer, plus editor if he says so), the data model is the same, and only permissions and screens differ. **Q2 doesn't block the shared part of the build. It blocks AC-6 only.**
- **A follow-up to fold into Q2 now** (§10a, simulated): "invite by email" means the app has to **send email**. That needs a mail service and its env values, which are his. Cheaper default: **the owner copies an invite link and sends it himself (LINE, etc.); the person opens it and sets their own password.** No mail service needed. Suggested pack: *"Invited people: you send them a link yourself, they set their own password, they can only view and comment. Correct only the part that's wrong."*

**2. Q4: one option to put to him as a yes or no** `[SA-proposed]`
> **Front Next.js · back Bun + Hono · PostgreSQL in a new `god_plan` database on your existing dev Postgres server, reached through a `DATABASE_URL` you give us · locally, the dev server runs `bun run dev` (back) + `next dev` (front) on the dev machine, with nothing deployed · both repos built to your standard deploy shape from day one. Yes?**
- **Why this one:**
  - Bun + Hono is the back end he has picked himself on other desks: possibility (D1, 2026-09-18), pun-kub-fang (2026-09-18), call-scribe ("Bun + Hono or Bun + Elysia only", 2026-11-06) and corner-chat ("never NestJS", 2026-11-01).
  - Next.js + Bun is the shape the `deploy-ready-build` skill records as his standard, "proven in production".
  - Rule 4 of workspace `CLAUDE.md` already makes his dev Postgres "the team's development database … through the `DATABASE_URL` the owner gives, in that project's own database only".
  - These are evidence for the recommendation, not facts about this desk (SYSTEM-FACTS line 44).
- **What it costs him:** creating one empty database (`god_plan`) and giving one `DATABASE_URL`, which goes into his own git-ignored `.env`. Nothing else: no new server, no mail service (if §1's default holds), no gateway key (the `llm-gateway` skill line 72: no key needed today, owner 2026-10-28).
- **What it costs us:** nothing new. It's the team's known stack. The SA picks the schema tool (Drizzle unless he says otherwise; reversible).
- **Which box is his choice. One risk he should know about:** `SERVER-FACTS.md` line 552 says the Windows box's Postgres on port 5432 is open to the internet. I'm not recommending a box. I'm only flagging that a desk holding real people's names would be added to it.
- **Not recommended:** a local Postgres (rule 4 forbids it). Also not `pglite:memory` as the dev database: it loses everything on restart, and blueprint's binary crashed on it (`SERVER-FACTS.md` lines 460–462).

**3. Can any of Q1–Q6 be answered from the files?**
- **Q1:** no. `owner-facts-via-atom-2026-11-07.md` says he has not agreed to approval-first.
- **Q2:** no (see §1).
- **Q3:** partly. The key part is answered: the gateway needs no key today (`llm-gateway` skill line 72, owner 2026-10-28). Spend and the cap are not answered: the same skill (line 77) says calls cost real money, and no file has his word on a cap. Ask only that.
- **Q4:** partly. "Never a local Postgres" and "env values come from him" are settled (rule 4; SYSTEM-FACTS line 44). Everything else is his, and he said on 2026-11-08 00:27 that it isn't decided. Hence the single yes/no in §2.
- **Q5 and Q6:** no file covers them.

**4. One AC note for the PM** (not a design; your call whether it changes the REQ)
- AC-9 depends on the AI's wording, so it can pass on one run and fail on the next. A steadier check: the summary screen always lists the Stuck tasks and their reasons straight from the project data, and the AI's prose sits beside that list. Then AC-9 checks the list, and the prose is supporting text. Only worth raising with him if you want AC-9 to be strict.

### QA
_Tanya (QA), 2026-11-08. Read: REQ-001 (89 lines), SYSTEM-FACTS, DECISIONS, both `project-docs` files._

**1. The second reading — "this cannot be settled by argument; ask Q2". Your reading has more support, but not enough to decide.**
- **For your reading:** the verbs he gives other people are *เข้ามารู้ได้* (find out) and *ช่วยฉันคอมเมนต์* (help me by commenting). Both say "see" and "comment". The projects and tasks are *ของฉัน* (mine).
- **For the other reading:** the only support is the comparison *เหมือนกับเป็นเทนโล่หรือว่าจีระ*. That could mean "a board people can see", or it could mean "a board people work on".
- **A third reading worth one line in Q2:** each person (his brother, his sister, a teammate) has their own projects, and they invite each other. "ของฉัน" does not rule that out. It changes whether strangers can sign up and whether A can create a *project*.
- **Requirement 3's "only" is a reading, not his words.** SYSTEM-FACTS line 37 is stamped `operator`, but "alone" does not appear in the verbatim text (`requirements-from-owner-2026-11-07.md`). The REQ already says this; I agree with it.

**2. Can each AC be checked with synthetic people only?**
| AC | Checkable? | What stops it / what I need |
|---|---|---|
| AC-1 | Yes | A synthetic owner account. How the owner signs in is part of Q2 as well. |
| AC-2 | Yes | I will check "every invited person" with **two** invitees (A, C), not one. AC is silent on a Stuck task with an **empty reason**: allowed or refused? (QA-Q1) |
| AC-3 | **Depends on Q2** | If inviting **sends an email**, I need a mail sink or an invite link that sends nothing. Synthetic people have no inboxes, and I may not send to a real person. If sign-in goes through **Google/another identity provider**, I cannot sign in as a synthetic person at all, so AC-3 to AC-6 would be NOT_TESTED. **Q2's answer decides whether AC-3 to AC-6 can be run.** |
| AC-4 | Yes, once wording is sharp | "Sees nothing of P": does an error page that shows P's **name** count as a fail? I will test it as **no name, task or comment of P, in the page or the API response** unless told otherwise. Removing an invited person is not covered by any AC. Is it in scope? (QA-Q2) |
| AC-5 | Yes | I will check the time in Asia/Bangkok, to the minute. Open: does invitee C see A's comment? Requirement 5 does not say. (QA-Q3) |
| AC-6 | **Not until Q2** | It says "subject to Q2". It also needs the API contract (SPEC) for "by direct request". **Gap:** nothing says A cannot create a **project**; AC-6 covers tasks only. |
| AC-7 | **Partly** | I can check the structure: at least one task appears, each has a title, and nothing enters the project before Q1's step. I cannot judge whether the breakdown is **good**; that is the owner's eye. Needs a live gateway (Q3) and synthetic project text. |
| AC-8 | Yes | Two cases: the gateway address points at nothing, and the gateway returns an error. I compare the project before and after. I check the error text against the wording table. Open: **how long** may the owner wait before the error shows? Without a number I can only write "spinner at N s". (QA-Q4) |
| AC-9 | **Partly** | The AI's wording changes from run to run. I can check that the summary contains each Stuck task's **title exactly**. Checking that "their reasons" are there is a reading judgement, so I will run it 3 times and report each run. I will test it as the owner and as A. |
| AC-10 | Not QA's | The owner only, by design. |

**An observation for the PM, not a test blocker:** AC-9's summary (and maybe AC-7's) sends task text, and possibly comments with names, through the gateway to outside AI providers. SYSTEM-FACTS line 39 says names and comments are personal data. Tests stay synthetic, so this does not block testing. Whether real comments may go to the providers is the owner's call; it could sit next to Q3.

**3. Can Q1–Q6 be answered from the files?** No.
- **Q1:** SYSTEM-FACTS lines 38 and 55 and `owner-facts-via-atom` §Atom's summary all say "not agreed".
- **Q2:** SYSTEM-FACTS line 56 lists it as open.
- **Q3:** SYSTEM-FACTS line 57 lists it as open.
- **Q4:** SYSTEM-FACTS lines 44 and 58, owner 2026-11-08 00:27: *"ยังไม่กำหนด Postgres หรือวิธีรัน dev server"*.
- **Q5 and Q6:** no file covers them.

**QA-Q1 to QA-Q4 above** are for the PM to settle or carry to the owner. I would default them as follows; correct any line that is wrong:
- QA-Q1: an empty reason is refused.
- QA-Q2: removing an invited person is out of scope for release 1.
- QA-Q3: invited people see each other's comments.
- QA-Q4: the error shows within 30 s.

## Outcome (PM)
_Porter (PM), 2026-11-08. Round closed; the PM owns REQ-001._
- **Reading:** both say mine has more support, neither settles it → it goes to the owner as Q2, with Tanya's third reading
  (each person has own projects) as one line. Requirement 3 stays labelled a reading, not his words. `[PM-decided]`
- **Q2 default changed** to Sober's: the owner sends an invite link himself; invitee sets own password; view + comment only.
  It also keeps AC-3..6 runnable with synthetic people (Tanya: email or Google sign-in would make them NOT_TESTED). `[PM-decided]`
- **Q3 narrowed:** no key needed (llm-gateway skill, owner 2026-10-28) → ask only the spend cap, plus Tanya's point:
  may real task text/comments go to outside AI providers. `[PM-decided]`
- **Q4:** Sober's single option goes to the owner as a yes/no, asked first (it blocks every build). `[SA-proposed]`
- **QA-Q1..Q4:** Tanya's defaults taken: empty Stuck reason refused · removing an invitee out of scope · invitees see each
  other's comments · AI error shown within 30 s. Cheap to reverse; written into REQ-001. `[PM-decided]`
- **AC-9:** Sober's steadier check taken — Stuck tasks + reasons listed from project data, AI prose beside it. `[PM-decided]`
- **AC-6 gap** (Tanya): invitee cannot create a project either — added. `[PM-decided]`
