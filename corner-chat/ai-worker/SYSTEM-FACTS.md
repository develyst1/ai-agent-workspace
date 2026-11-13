# SYSTEM FACTS — what the owner has said, and how the system actually behaves

> **Created 2026-11-01, on the day this desk opened, by Marie (workspace operations) —
> deliberately BEFORE the team's first session, so the team is born with it instead of
> re-learning it.** On another project this file did not exist for six weeks, and the
> owner had to explain the same facts across sessions; twice the team raised a deliberate
> decision as if it were a live incident. **That is a note-taking failure, not a knowledge
> failure.**
>
> **What belongs here:** any fact about the product or how the system behaves that is
> **not** derivable from the code, not a requirement, and not a status. Product
> definitions, deliberate settings, decisions the owner already made, which document is
> authoritative, environment facts.
>
> **The rule that makes it work — the PM's, binding on the PM:**
> **When the owner states a fact about the product or how the system behaves, it is
> written HERE BEFORE the reply is sent.** Not after, not "when I update the board", not
> in a log entry that scrolls away.
>
> **Format:** one fact, one line, with **who said it and when**. Append-only. Never
> compacted, never summarised, exempt from every size gate (`check-hygiene.mjs` exempts
> this file by name). If a fact turns out to be wrong, strike it and write the correction
> under it — do not delete.
>
> **Conventions:** every date is **2026** unless a full year is written · **`(owner)`
> means the `operator` seat — the workspace owner, โด่ง (harness `CLAUDE.md` §2)** ·
> **⚠️ CONTESTED** means two sources disagree, both are recorded, and **neither may be
> acted on** until the owner settles it · a line marked **(Marie, read-only survey
> 2026-11-01)** was read out of the repos on the day the desk opened and is evidence of what
> is *there* — not of any decision.
>
> **Where the owner's words came from:** he said them to Atlas on 2026-11-01; Atlas wrote them
> into `MARIE.md` → ORDER 48, and Marie copied them here.

---

## What the product is (owner, 2026-11-01)

- `[operator 2026-11-01]` *"อยากเปิดโต๊ะใหม่อ่ะทำเป็นแหล่งรวมแชตอ่ะจะส่งรีควอร์เมนต์ให้"* — a unified
  inbox: messages from several platforms in one place, with AI as a guard before they reach people.
- `[operator 2026-11-01]` The requirement he pasted is kept verbatim in
  `../project-docs/requirements-from-owner-2026-11-01.md` (Unified Inbox with AI Guard). It is the
  source for the first REQ. Its §6 line "NestJS + TypeORM" is **overridden** — see Stack below.
- `[operator 2026-11-01]` *"ขอแอปชื่อว่า corner-chat แทนแล้วกัน"* — the app is called **corner-chat**.
- `[operator 2026-11-01, to the PM]` What it is for, first: *"เกิดมา เพื่อรวม และ กรอง ตามกฏ กติกาที่เราตั้งไว้ เอไอ
  ทำการกรองช่วย แค่นั้นก่อน"* — gather messages in one place and filter them by rules the team sets, with AI helping
  the filtering; "แค่นั้นก่อน" = that is the first scope. (Whether auto-reply is inside "แค่นั้นก่อน" is asked
  separately — `../project-docs/requirement-understanding-2026-11-01.md` Q1b.)
- `[operator 2026-11-01, to the PM]` Replying to the sender (understanding doc Q1): *"แบบ ข คืออยากได้ ดูก่อนว่ายากมากมั้ย
  ถ้า ยากมากให้ เอาแบบ แรกก่อน"* — he **wants two-way** (staff reply from corner-chat and it is sent back on the
  sender's channel), **if it is not very hard**; if it is very hard, **one-way first** (corner-chat notifies,
  staff reply in the original app). How hard it is = the SA's assessment, asked 2026-11-01.
- `[operator 2026-11-01, to the PM]` Auto-reply (understanding doc Q1b — "auto-reply such as out-of-hours or keyword
  replies is not in the first round, later?"): *"ใช่ ไว้ทีหลัง"* — **auto-reply is out of the first scope; later.**
- `[operator 2026-11-01, to the PM]` Correcting the PM's 6-step flow (understanding doc §Q0), verbatim, per step:
  - on "ทีม": *"ทีมตรงนี้หมายถึงอะไร ฉันหมายถึงผู้ใช้ corner-chat แล้วแต่คนจะตั้งเงื่อนไขตามสไตล์ตัวเอง"* — there is
    **no "team"**: it is **each corner-chat user**, and **each user sets their own filter conditions** in their own style.
    ⇒ every "staff" / "team" in the lines above means **the corner-chat user** (PM's correction of its own wording).
  - on "กลุ่ม LINE": *"ไม่ใช่กลุ่มไลน์ LINE OA 1 on 1 กับผู้ใช้แต่ละคน"* — passed messages reach the user **1-on-1
    from a LINE OA, to each user**, not into a LINE group.
  - on "Web Chat": *"ถ้าสุดท้าย ไลน์ เต็มจริงๆ ให้ส่ง เข้า app เราเป็น app มือถือ มี notification"* — if LINE is really
    full in the end, send into **our app, a mobile app with notifications**.
    ~~⚠️ **CONTESTED** with his own requirement doc §8 *"Out of Scope (ตอนนี้) … Mobile App"* — unactionable until he
    settles whether the mobile app is in the first scope or a later fallback.~~ **Settled 2026-11-01** — see the
    "ทำแอปด้วย" line below: the mobile app is **in the first round**; doc §8's "Mobile App" out-of-scope is overridden.
  - on reply: *"ใช่ ผู้ใช้สามารถตอบกลับ คนที่ทักเขามากลับไปทางเดิมได้ แต่ถ้ามันยาก ก็ตามที่บอก คือทำแค่เป็นฝ่ายรับข้อความเพื่อรับบรู้
    อย่างเดียวก่อนได้"* — the user can reply to whoever messaged them, back the same way; if hard, receive-only first.
  - on held messages: *"จะอยู่ในแอปเรา คือข้อความที่ไม่เข้าเงื่อนไขคุณ"* — messages that did not meet **your** conditions
    stay in our app.
  - and: *"req ฉันอาจจะ เขียนมาไม่ครบ หรือผิดก็ได้ นะ นายเข้าใจว่าไง"* — **the requirement doc may be incomplete or
    wrong**; his later words win over it where they differ, and the PM confirms each difference with him.
- `[operator 2026-11-01, to the PM]` On reading v2 item 2 (a personal LINE chat cannot be read by any system):
  *"เออใช่ว่ะ อาจจะ ต้องสร้าง LINE OA ของ corner-chat แล้วให้ดึงไปเข้ากลุ่มไลน์ของ ผู้ใช้ แล้วให้คอยสังเกตุว่าข้อความไหน
  ส่งถึงผู้ใช้ หรือtag all ก็ให้นำมา เข้าเช็คเงื่อนไขกรอง แล้วส่งให้ผู้ใช้ ผ่าน LINE OA corner chat"* — agrees personal
  LINE cannot be read; **his proposed shape ("อาจจะ" = a proposal, feasibility not yet checked):** corner-chat has its own
  LINE OA; users add it into their LINE groups; it watches for messages **addressed to the user or tagging all**, runs
  them through that user's filter conditions, and sends the passed ones to the user via the corner-chat LINE OA.
  He commented on item 2 only; items 1, 3–7 of v2 drew no objection `[PM-interpreted, not approved]`.
- `[operator 2026-11-01, to the PM]` Confirmed by example: *"ถูก"* — to the PM's example: the user adds the corner-chat
  LINE OA as a friend and pulls it into their LINE group; a message in the group that **tags the user or replies to the
  user's message** → checked against that user's conditions → if passed, the corner-chat OA sends it to the user 1-on-1;
  **@All** → the same; **every other group message is not taken in at all.** (Feasibility: SA, §Q2-SA.)
- `[operator 2026-11-01, to the PM]` LINE allows only ONE Official Account per group (SA, from LINE's group-chats doc),
  so a group that already holds another OA cannot add corner-chat and its messages never reach corner-chat — asked
  "รับได้ไหม": *"รับได้"* — **accepted.**
- `[operator 2026-11-01, to the PM]` Who can use corner-chat (asked ก = only people the owner adds, no open sign-up,
  first round · ข = anyone signs up): *"ใช่ เฉพาะคนที่เพิ่ม"* — **first round: only people the owner adds; no open
  sign-up.** (Open sign-up later = the PM's default, not his words.)
- `[operator 2026-11-01, to the PM]` Mail providers (asked: Zimbra with password first, or Gmail/Outlook too):
  *"Zimbra ก่อน"* — **first round: Zimbra only**; Gmail / Outlook later.
- `[operator 2026-11-01, to the PM]` LINE quota / mobile app (asked: first round LINE notifications only, no mobile app,
  decide at the quota limit — or build the app too): *"ทำแอปด้วย"* — **the mobile app with notifications is in the
  first round.** Overrides requirement doc §8 "Mobile App" out of scope.
- `[operator 2026-11-01, to the PM]` What the app does (asked: users do everything in the mobile app — see passed and
  held messages, set conditions, connect Zimbra and LINE groups, reply; the web is only the owner's page to add users,
  normal users never use the web): *"ใช่"* — **users do everything in the mobile app; the web is the owner's admin page
  only.** (Replaces the requirement doc's §4.6 web "Dashboard" for users.)
- `[operator 2026-11-01, to the PM]` Phones (asked: iPhone and Android both in the first round, or Android first):
  ~~*"ทั้งสอง"* — **iPhone and Android both, first round.**~~
  **Corrected by him the same exchange, 2026-11-01:** *"Android ก่อน IOS ทีหลัง"* — **Android first; iOS later.**
- `[operator 2026-11-01, to the PM]` Replying into LINE groups (asked: a reply from the app would show in the group as the
  corner-chat bot, seen by everyone; first round LINE groups receive-only, the user replies in LINE from the
  notification; Zimbra mail can be answered from the app, sent from the user's own address): *"ใช่ รับอย่างเดียว"* —
  **first round: LINE groups receive-only; Zimbra mail two-way.**
- `[operator 2026-11-01, to the PM]` What a user's condition looks like (asked: two kinds used together — fixed rules,
  e.g. from this person → always notify, contains "ใบเสนอราคา" → always notify, from this group → don't notify; and a few
  plain sentences the AI reads, e.g. "แจ้งเฉพาะเรื่องงานที่ต้องตอบ ไม่เอาโฆษณา ไม่เอาข่าวทั่วไป"; fixed rules win when
  they and the AI disagree): *"ใช่ ทั้งสอง"* — **both kinds; fixed rules win over the AI.**
- `[operator 2026-11-01, to the PM]` Notify timing (asked: every passed message notified by LINE and in the app both,
  every time — or LINE first, the app only when the LINE quota is full): *"ทั้งสองทุกครั้ง"* — **both, every time.**
- `[operator 2026-11-01, to the PM]` Replies in LINE groups (asked: to know a group reply answers the user's own message,
  corner-chat must note the **id only, no text** of every message the user writes in the group; slightly against "every
  other group message is not taken in at all"; without it, only tags are caught): *"ได้ เก็บเลข"* — **allowed: keep the
  id only, never the text, of a linked user's own group messages.**
- `[operator 2026-11-01, to the PM]` AI providers (asked: message content goes through his gateway to outside AI
  providers, fallback deepseek → xai → gemini → openai — OK?): *"ได้ และเอไอ เลือกใช้ได้หลายตัวด้วย แล้วแต่เหตุการณ์ ที่ใช้
  เลย แล้วใช้หลายขั้นได้ เพื่อเป็นตัวกรอง ทางความคิด เพื่อ คิดหลายขั้น"* — **OK to send content to outside providers;
  several AI models may be used, chosen by the situation; and the filter may run in several AI steps ("คิดหลายขั้น").**
  What a "situation" and a "step" are is the PM's reading, being confirmed by example (understanding doc Q15).
- `[operator 2026-11-01, to the PM]` Correcting the PM's two-step example, verbatim: *"ฉันหมายถึง ชั้นแรก วิเคราะห์ ก่อน ว่า
  ข้อความที่เข้ามานี่ ถึงเรามั้ยวะ มีชื่อเรามั้ย ถึงแม้ไม่ได้แท็ก แล้วความหมายมันคืออะไรกันนะข้อความนี้ สรุปออกมา แล้ว เอามาทั้งข้อความ
  เพียวๆ และข้อความที่สรุปได้มา ตั้งคำถามว่า มันเข้าเงื่อนไข ของผู้ใช้มั้ยวะ เข้ากี่% ถ้าเข้าเกณ ก็ ส่งข้อความนั้นให้ผู้ใช้ พร้อมบอกด้วย
  เขาทักมาเเกี่ยวกับ อะไร"* then *"แต่แล้วแต่นาย ไปรวมหัวคิดกัน เอาว่าเอาแบบไหน"* — his idea: **layer 1** analyses whether
  the message is addressed to the user / has the user's name **even without a tag**, what it means, and summarises it;
  **layer 2** takes the raw message + the summary and asks whether it meets the user's conditions and **by how many %**;
  above the bar → send the message to the user **with a line saying what it is about**. **The final shape is delegated to
  the team** ("แล้วแต่นาย ไปรวมหัวคิดกัน") `[operator-delegated 2026-11-01]`.
  ~~⚠️ **CONTESTED** with his confirmed example above (*"ถูก"*: in a LINE group, "every other group message is not taken in
  at all"): catching the user's **name without a tag** means every group message must be read. Unactionable until he
  settles it; the PM brings it back after the team round.~~ **Settled 2026-11-01** — next line.
- `[operator 2026-11-01, to the PM]` Asked: catch the user's name when nobody tags them, which means scanning the text
  of every group message (plain match, nothing kept that does not match)? *"เอาแล้ว แต่นาย กับ ทีมนายตัดสินใจเลย"* —
  **he wants it ("เอาแล้ว"), and delegates how to the PM and team** `[operator-delegated 2026-11-01]`. How: `DECISIONS.md`.

## How the owner wants the desk to work from now (owner, 2026-11-01)

- `[operator 2026-11-01, to the PM]` *"ต่อจากนี้ ไม่ต้องถามฉันแล้ว ทำงานกันได้ เลย ทำให้ได้ ตามเป้าหมายไปเลย เป้าคือ ทำให้เสร็จใช้งานได้
  หากมีคำถามให้ รวมหัวกันคิด แล้วตัดสินใจไปก่อน แล้ว ลิสต์ ไว้ ว่า มีต้องการตัดสินใจอะไรจากฉัน ที่ตัดสินใจไปกันเอง ก่อนเลือกอะไร
  และ ทำไปจนกว่่าจะติดไปต่อไม่ได้จริงๆ"* — **standing instruction:** stop asking him; the goal is **done and usable**;
  a question is settled by the team (a round, `team-brainstorm.md`), decided, and **listed** for his later review with
  what was chosen — `../project-docs/decisions-for-owner-review.md`; keep going **until truly blocked**.
  **What it does not change** `[PM-interpreted]`: the hard lines in `CLAUDE.md` and `PROTOCOL.md` stay — git only on his
  own command; nothing sent to or changed on a real system without his go; no production. Those are "truly blocked"
  points, not questions.
- `[operator 2026-11-01, to the PM]` *"ฉันทำแบบนี้เพื่อให้นายหัดตัดสินใจ และหากนายและทีมตัดสินใจ ได้ไม่ตรงใจกับฉัน เราก็แค่ ไปปรับจูนกัน
  แต่อย่าทำการ deploy นะ แค่พัฒนาไปจนสุดท้ายก็พอ"* — the purpose is for the team to **learn to decide**; a decision that
  misses his intent is simply tuned later. **No deploy** — develop all the way to the end, locally; nothing goes on a
  server.
- `[operator 2026-11-01, to the PM]` On the app's stack (asked whether React Native would be easier than Flutter):
  *"หรือ อะไรก็ได้ ง่ายๆ ที่แค่ ลงเครื่อง android ได้ก่อนก็พอ"* — **any simple stack is fine; what matters first is an app
  that installs on an Android phone.** The choice is delegated (PM decided to keep Flutter — `DECISIONS.md`).
- `[operator 2026-11-01, to the PM]` *"ฉันไม่ชอบflutter ดิ เวลาเทสมันยากมั้ยวะ สมมุตจ ะทำสคริปเทส"* — **he does not like
  Flutter**, and he cares that the app is **easy to test with scripts**. (Supersedes the PM's keep-Flutter decision.)
- `[operator 2026-11-01, to the PM]` To the PM's recommendation (a React/TypeScript web app wrapped as an Android app):
  *"ดีเลย ทำเป็นแค่เว็บ ที่ทำเป็นแอป ได้ เนาะ"* — **the app is a web app that can be turned into an app** (installable on
  Android). Which wrapper is the SA's call.

## Repos and environments

- `[operator 2026-11-01]` Two repos: `corner-chat-back` and `corner-chat-front` (absolute paths only in the
  workspace-root `machine.local.md`).
- (Marie, read-only survey 2026-11-01) Both repos are empty: one commit "Initial commit" holding only
  `README.md`; ~~branch `main` only (local and `origin/main`), no `develop`~~ (superseded the same day —
  next line); origin `github.com/develyst1/corner-chat-back` and `github.com/develyst1/corner-chat-front`.
  ⇒ **greenfield.**
- `[operator 2026-11-01, via Atlas]` **Branches:** the owner created `atom`, `develop`, `sit`, `uat` and
  `production` on both repos, all from `main`, pushed to origin. The repos are still checked out on
  `main`. (Marie re-read both repos 2026-11-01: all six branches at the initial commit, each tracking
  its `origin/` twin — back `d1152f1`, front `0f8c0bc`.)
- `[operator 2026-11-01, to the PM]` A third repo for the Android app (asked: create `corner-chat-app` or share
  `corner-chat-front`): *"done"* + its path — **`corner-chat-app`**, created by the owner (absolute path in
  `machine.local.md`). (Porter read it 2026-11-01: README only, one commit `f5e060d`, checked out on `main`, branches
  `atom`, `develop`, `sit`, `uat`, `production`, origin `github.com/develyst1/corner-chat-app`.) Who on the teams writes in
  it is not yet set — `PROTOCOL.md`'s repo table names only back (BE) and front (FE).
- (Atlas, 2026-11-01 — `REQUEST-marie-to-atlas-2026-11-01-corner-chat-app.md` § "Atlas's answer") **`corner-chat-app` is
  written by the FE, of either team**, under the PM's batch claims; **the BE never writes in it**; the app's stack is the
  SA's call in SPEC-001. FE owns `corner-chat-front` + `corner-chat-app`; BE owns `corner-chat-back`. Now in
  `PROTOCOL.md`, `FE.md`, `BE.md`, `TEAMS.md` (2026-11-01).
- **The team's working branch is UNDECIDED** — a new own branch like smart-scheduler's `dong`, or
  `atom`. The PM settles it with the owner before the first `ขึ้น git` (board → Blocked / waiting).
- `[operator 2026-11-01]` **Stack — back:** *"back ไม่ใช้ nest ใช้ bun hono หรือ bun elysia เท่านั้น"* —
  **Bun + Hono or Bun + Elysia only, never NestJS**, with Postgres. Atlas recommends Hono; **the choice is
  the SA's, in SPEC-001.**
- `[operator 2026-11-01]` **Stack — front:** Dashboard + Web Chat; its stack is decided in SPEC-001.
- `[operator 2026-11-01]` **AI:** through the owner's LLM gateway (the `llm-gateway` skill), as the
  requirement says ("ใช้ LLM Gateway ที่มีอยู่แล้วของทีม").
- `[operator 2026-11-01]` **Real systems:** *"ใช่ แต่ก็แตะของจริงได้บ้าง หากจำเป็น"* — **reading** a real
  system is allowed when needed. **Sending or changing anything real** (a LINE message, an email to a
  real person, a real Discord post, the real Zimbra mailbox on the owner's mail host) **needs the
  owner's go each time**, by DATA REQUEST through the PM. Build and test against test accounts by default.
- `[operator 2026-11-01]` **Secrets:** LINE, Discord and gateway tokens and the Zimbra password live only
  in each repo's `.env`, never in git.

## Team (owner, 2026-11-01)

- `[operator 2026-11-01]` *"น่าจะต้องมีทีม engineer สองทีม เทสเตอร์สองคน"* — two engineer teams, two
  testers. Who is who: `TEAMS.md`.
- `[operator 2026-11-01]` *"ทำไมจะทำrepo ด้วยกันไม่ได้ smart scheduler ยังทำได้เลย TESTER tefany"* —
  **both teams share both repos**, as smart-scheduler does, split by file area through the PM's batch
  claims (`board.md` → `## Batch claims`). Team B's tester is Tefany.
- `[operator 2026-11-01]` Mode: **manual** — one session per role (`DECISIONS.md`).

## Open questions for the owner — asked by the PM, answered here

- ~~**Branches (open, the owner's):** the repos have only `main` and no `develop`, while the git commands
  (`CLAUDE.md` §6 — `รวมโค้ด`, `release code`) assume `develop` plus `merge-workflow.sh`. Branch
  creation is the owner's; no role creates a branch.~~ **Answered 2026-11-01:** the owner created
  `develop` (and `atom`, `sit`, `uat`, `production`) — see Repos above. Still open: **which branch the
  team works on** (the PM asks the owner before the first `ขึ้น git`). No role creates a branch.

## Owner's answers to the B list (operator, 2026-11-01, verbatim)
- B2 mailboxes: *"1 ไม่เข้าใจเอา เมล ทำงานฉัน กับเมลส่วนตัวฉันได้มั้ย"*. He offers his own work mail and his personal mail as the test boxes; still open which of them is on Zimbra.
- B1 test LINE OA: *"2 มี"*. He has one.
- B3 Firebase: *"3 ไม่อยากใช้ firebase ใช้ทำอะไร ต้องการอะไร database? มี server ที่ลง postgres ไว้ สามารถ เอามาใส่ db_url ให้ไปสร้าง database ใช้ได้"*. **He does not want Firebase.** He also offers his server's Postgres through a `DB_URL`.
- B6 branch: *"4 สร้างเลย ชื่อ D1"*. The working branch is **`D1`**. He said "create it"; `CLAUDE.md` §6 says no role creates a branch, so the PM gives him the command and does not create it.

## Owner, 2026-11-01 evening (verbatim): env keys and the database
- *"ใส่แล้ว ลองดูดิ้ ทีมนายทำ example env ไม่ครบนะ มันทำให้ ทำงานยากมาก ไม่มี เมล A เมลB ไปดูด้วยว่าฉันทำถูกมั้ย"*. `.env.example` lacked `TEST_MAIL_*`.
  The PM's check of `corner-chat-back/.env` (names and shapes only, no values): the LINE secret and token are set; `TEST_MAIL_A_EMAIL` is set (entronica.in.th); `TEST_MAIL_B_EMAIL` is set (hotmail.com); **`TEST_MAIL_A_PASSWORD` is empty**.
- *"พวก env ต่างๆ ถ้าต้องการ บอกฉัน ฉันมี server ที่ลง postgres ไว้ให้ใช้แล้ว มันง่ายกว่าเบาเครื่องนี้กว่าอย่าหาทำอีก โน้ตไว้ เลยว่านี่คือข้อมูลของผู้ใช้ชื่อโด่ง ไปบอก ATLAS ด้วย หลายครั้งแล้ว ไอ พยายามลงหรือเปิด Local postgres เนี่ย"*.
  **Standing rule (owner's): never install or start a local Postgres. Use the owner's Postgres server. When an env value is needed, ask him for it.** Workspace-wide → told to Atlas.
- *"DATABASE_URL=postgresql://postgres:xxxxx@154.197.124.206:5432/db เนี่ย เอาไปลง เดี๋ยวฉันเปลี่ยนpass ให้"*. The owner's Postgres is at **154.197.124.206:5432**. He will change the password. The real URL lives only in the git-ignored `.env`, never in a desk file.
- Owner, 2026-11-01 ~21:50: *"ใส่ env ให้ละ"*. The PM's shape check (no values read out): `DATABASE_URL` = postgresql, user postgres, host 154.197.124.206:5432, database **corner_chat**, password set (12 chars, already URL-encoded); `TEST_MAIL_A_PASSWORD` set (14 chars). He said earlier the team may create its databases there (*"ให้ไปสร้าง database ใช้ได้"*).
- Owner, 2026-11-01 ~22:10, his answer to "how should the real-mail test go, given the DB has no SSL?": *"Unencrypted is fine"*. **The REQ-002 live check with his real work mail may run over the unencrypted connection to his Postgres.** Scope: this dev server and this live check; SSL was not turned on.
- Owner, 2026-11-01 ~23:35, about the LINE OA LifeStyle-Shop (@183qrfme), which ran a shop bot before: *"ไม่ใช้ ใช้ไปเลย นี่ใช้ทดสอบ"*. **It is a test OA; the old shop bot is not in use.** corner-chat may use it freely, and restoring the old webhook URL is not required.
- Owner, 2026-11-02: *"created D1"*. The PM checked: branch **D1** exists and is checked out in corner-chat-back, -front and -app; all the work is still uncommitted there. It is the working branch (B6). No `ขึ้น git` has been given yet.
- Owner, 2026-11-02: *"ขึ้น git"*. Relayed by the PM to SA Sober for all 3 repos on D1.
- Owner, 2026-11-02, on Q-GIT-1 (the commit-message convention, CONVENTIONS.md § Git): *"Use it"*. Approved as proposed: `<type>: <summary> (TASK-<ID>[, …])` with type feat/fix/test/chore and an English summary of ≤ 72 chars; the first push to D1 is one commit per repo; later pushes go per TASK; `ai-worker/` is never committed.
- Owner, 2026-11-02, with a screenshot of Sober's session showing a question box addressed to him (Q-GIT-1): *"ทำไม sober ถามฉัน อันนี้ผิด chain นะ"*. **The SA must never put a question to the owner, not even in his own session's next-step or question box. Owner questions go only through the PM.**
- Owner, 2026-11-02, after round 1 was done and pushed: *"ส่งรายละเอียดไปบอก otto หน่อยว่ามีแอป อยาก deploy"*. **He now wants corner-chat deployed.** This lifts the earlier "no deploy" (2026-11-01) for the next step. Otto (Release & Platform) owns it; the PM sent him the details in REQUEST-porter-to-otto-2026-11-02-corner-chat-deploy.md.
- Owner, 2026-11-02, to Otto (relayed in the root file REQUEST-otto-to-porter-2026-11-02-corner-chat-deploy-plan.md § Update 2026-11-02): on the proposed names, *"ตามนั้นก็ได้"*. **Names are final: API `cornerchat-api-sit.develyst.online`, admin web `cornerchat-sit.develyst.online`.** The release APK uses `VITE_API_BASE=https://cornerchat-api-sit.develyst.online/api/v1`. Where the signing key lives is still open.
- Owner, 2026-11-02, to Otto (same file): *"ฉันไม่เอาส่งออก ฉันเอา ขาเข้ามา…"*, then *"forward"*, then *"gmail ก็ gmail"*. **On SIT, mail is incoming only:** the entronica mailbox forwards to one Gmail box, and the server's IMAP/SMTP hosts point at Gmail. No code change for the desk. Replies from the app are out of scope on SIT; the SIT QA checks that a mail sent to the entronica address shows up in the app with its original sender.
- Owner, 2026-11-02, to Otto (root REQUEST-otto-to-porter-2026-11-02-corner-chat-deploy-plan.md § Update): on the APK signing key, *"เครื่องนี้ + สำรอง"*. **The `.jks` lives on the owner's PC in a folder outside every repo; its path is written only in `machine.local.md`, never in a committed file. The owner makes the off-PC backup himself.** Also decided there: the DB without SSL is accepted for now; LINE on SIT = the test OA LifeStyle-Shop; the back's CI runs typecheck/lint/build only (no DB secret in GitHub), so **the desk keeps running the back tests locally before every release**.
- PM, 2026-11-02 ~23:30 [PM-decided, from Tanya's TEST-006 Q1]: **SIT is a listed environment** (PROTOCOL.md → Environments). The team may use it with QA leading: read anything; write only QA's own `qa-sit-` rows; never the owner account or others' rows; no restart, redeploy or config (that is Otto's). It shares the `corner_chat` DB with local, so local backs run with `MAIL_POLL_SECONDS=0`.
- Owner, 2026-11-03 ~00:15: *"เปลี่ยนเว็บฮุกไลน์ฺแล้ว"*. **The test OA's LINE webhook now points at SIT** (`https://cornerchat-api-sit.develyst.online/api/v1/webhooks/line`). So local backs no longer receive real LINE events. TEST-006 row 9 is unblocked.
- Owner, 2026-11-03 ~01:00: *"saved"* · *"dong0364@gmail.com private mail"*. **The entronica work mailbox now forwards a copy to the owner's PRIVATE Gmail** (the local copy is kept). He has an App Password for it, which he keeps himself. The PM had advised a dedicated box; the owner kept his private one. Consequence: once he connects it in the app, every NEW personal mail goes through the AI filter and is stored on SIT. Nothing older than the connect time is taken in (`last_uid` starts at the connect time; `poller.ts:10`, `routes.ts:34`, checked by the PM).
