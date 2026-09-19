# SYSTEM FACTS — what the owner has said, and how the system actually behaves

> **Created 2026-09-17, on the day this desk opened, by Marie (workspace operations) —
> deliberately BEFORE the team's first session, so the team is born with it instead of
> re-learning it.** On another project this file did not exist for six weeks, and the
> owner had to explain the same facts across sessions; twice the team raised a deliberate
> decision as if it were a live incident. **That is a note-taking failure, not a knowledge
> failure.**
>
> **What belongs here:** any fact about the product or how the system behaves that is
> **not** derivable from the code, not a requirement, and not a status. Product
> definitions, deliberate settings, decisions the owner already made, which document is
> authoritative. **On a greenfield desk this file IS the product's memory** — there is no
> running system to observe, so everything "known" is something the owner said.
>
> **The rule that makes it work — Porter's, binding on himself:**
> **When the owner states a fact about the product or how the system behaves, it is
> written HERE BEFORE the reply is sent.** Not after, not "when I update the board", not
> in a log entry that scrolls away.
>
> **Format:** one fact, one line, with **who said it and when**. Append-only. Never
> compacted, never summarised, exempt from every size gate. If a fact turns out to be
> wrong, strike it and write the correction under it — do not delete.
>
> **Conventions:** every date is **2026** unless a full year is written · **`(owner)`
> means the owner, โด่ง / develyst — the only person who has ever talked to this team** ·
> **⚠️ CONTESTED** means two sources disagree, both are recorded, and **neither may be
> acted on** until the owner settles it · a line marked **(Marie, read-only survey
> 2026-09-17)** was read out of the repos on the day the desk opened and is evidence of
> what is *there* — not of any decision.

---

## What the product is (owner, 2026-09-17)

- **Possibility is a platform for taking on freelance / innovation work.** A user says
  what they want; **the AI analyses it** for **feasibility (ความเป็นไปได้)**, **impact on
  society (ผลกระทบต่อสังคม)** and **how interesting it is (ความน่าสนใจ)**. (owner, 09-17,
  verbatim: *"แพลตฟอร์มรับงาน freelance/innovation — user บอกสิ่งที่อยากได้ AI วิเคราะห์
  ความเป็นไปได้ / ผลกระทบต่อสังคม / ความน่าสนใจ"*)
- ⚠️ **What "feasibility", "impact" and "interesting" are measured against, how they are
  scored, and what the AI may or may not say are NOT yet stated.** Nobody infers them. They
  are DATA REQUESTS for the owner, to be written here when he answers.

## User tiers (owner, 2026-09-17)

- **There are five user tiers, in this order and with exactly these names:**
  **Ordinary · Seeker · Raw Diamond · Visionary · The Possibility.** (owner, 09-17)
  These are the owner's exact words. **Never paraphrase, translate or reorder them** in
  a REQ, a screen, or a message.
- ~~**The full definitions live in `../project-docs/tiers.md`** (owner, 09-17).~~
  **Correction, same day (owner, 09-17: *"ฉันไม่มี"*): that file does not exist and the owner
  does not have one. The tier definitions exist nowhere yet** — not in a file, not in
  `possibility-spec`. **They have to be elicited from the owner by Porter, one tier at a time,
  and written here as he answers.** Until then, what a tier means, how a user moves between
  tiers, and what each tier can do are unknown — nobody guesses from the names.

## How the owner works (owner, 2026-09-17)

- **The owner works manual, step by step, on purpose — to control quality.** (owner,
  09-17, verbatim: *"ทำงานแบบ manual step-by-step โดยเจตนา เพื่อคุมคุณภาพ"*) ⇒ this desk
  runs in **manual mode**: one session per role, the owner nudges each one. A role that
  runs ahead of him, batches decisions, or "saves him a step" is working against his
  stated intent, not for it. **One decision per message; end every message with where
  the ball is.**

## Repos and environments

- **Three repos, all greenfield** (Marie, read-only survey 2026-09-17): `possibility-back`,
  `possibility-front`, `possibility-spec` — each has **one commit ("Initial commit"), branch
  `main`, and a one-line `README.md`** containing only the repo's name. Nothing else.
  Absolute paths are in the workspace-root `machine.local.md` only.
- **`possibility-spec` is the owner's requirement repo** (owner, 09-17). It is his source of
  requirements; **Porter reads it, nobody writes to it.**
- **The stack is NOT decided** (owner, 09-17: *"ยังไม่ตัดสิน"*). **Sober proposes it in
  `SPEC-001`; the owner decides; the decision is written here.** Until that line exists,
  no engineer scaffolds, installs, or picks anything.
- **The working branch is not decided either** — the repos sit on `main`. Do not assume
  `develop`; it is part of the SPEC-001 question.
- **Environments: local only.** (owner, 09-17: *"QA: local เต็ม ยังไม่มี dev server — ไม่มี
  production"*) **Tanya has full access on local. There is no dev server yet. There is no
  production.** The day either appears, it is written here and in PROTOCOL's Environments
  table **before** anyone touches it.

## Team (owner, 2026-09-17)

- **Porter (PM / BA / PO / UX writer — the smart-scheduler shape) · Sober (SA) · Jason (BE)
  · Fern (FE) · Tanya (QA).** Chain: Human ↔ Porter ↔ Sober ↔ (Jason, Fern), with Tanya
  hanging off Porter. QA is **not a trial** here — the role is part of the desk from day one.

## Open questions for the owner — asked by Porter, answered here

- **Q1 — What does each of the five tiers mean, and what moves a user between them?** No file exists (owner, 09-17). Porter asks, one tier at a time.
- **Q2 — What are "feasibility", "impact on society" and "interesting" measured against, and what may the AI say?** Not stated yet.

## Where requirements come from (owner, 2026-09-17)

- **`possibility-spec` is empty (README only) and the owner gives requirements in chat to Porter, not in the repo** — for now. (owner, 09-17, verbatim: *"เล่าในแชทเลย"*). Porter turns chat into REQs; the repo remains his and read-only. If he later drops files there, that is written here.

## Tier definitions — elicited one at a time (owner, 2026-09-17)

- **Ordinary = "คนธรรมดา" (an ordinary person).** (owner, 09-17, verbatim: *"คนธรรมดา"*). Who gets it, what they can do, and how they leave it — NOT yet stated.
- **Every new sign-up starts as Ordinary.** (owner, 09-17: *"ใช่"*)
- **A user's tier is set by the AI's evaluation of the idea the user wants to hire us for.** If the AI judges the idea as still "ordinary", the user stays Ordinary. (owner, 09-17, verbatim: *"ถ้าไอเดียที่จะจ้างเราทำ เอไอฉันประเมินว่ายังเป็นคนธรรมดาอยู่"*)
- **Ordinary gets no special discount.** ⇒ tiers carry a **discount on hiring us**; higher tiers presumably get one — the amounts are NOT stated. (owner, 09-17, verbatim: *"ก็ไม่ได้ส่วนลดพิเศษ"*)
- **"Hire us" (จ้างเรา): the customer is hiring the owner's side to build their idea** — Possibility takes the work in; the user is the client. (owner, 09-17, from *"ไอเดียที่จะจ้างเราทำ"*)
- **The owner delegated drafting the remaining tier definitions (Seeker · Raw Diamond · Visionary · The Possibility) and their discounts to Porter, as a PROPOSAL for him to approve.** (owner, 2026-09-18, verbatim: *"แล้วแต่ นายช่วยคิดเลยทั้งหมดพวกนี้"*). Nothing in the proposal is a fact until he approves it; approved lines are written here.
- **APPROVED tier table (owner, 2026-09-18: *"โอเค"* — approved Porter's proposal in REQ-001 as written):**
  - Ordinary = คนธรรมดา — common request, nothing new — **0 %** discount.
  - Seeker = ผู้แสวงหา — clear problem + real reason; doable but not novel — **5 %**.
  - Raw Diamond = เพชรดิบ — genuinely novel angle / under-served group; benefit beyond the user — **10 %**.
  - Visionary = ผู้มีวิสัยทัศน์ — strong on all three axes (feasible, benefits society, interesting) — **20 %**.
  - The Possibility (EN name kept in Thai UI) — rare; could change how many people live/work — **30 %**.
- **Tier = the user's best-rated idea; a new idea can raise the tier, never lower it.** (owner approved 09-18)
- **The user sees their tier and the AI's short reason.** (owner approved 09-18)
- **The discount applies to the quoted price of the hire.** How quotes are priced — NOT yet stated. (09-18)

## Idea intake (owner, 2026-09-18)

- **The user submits an idea as free text in a single box** — no structured form. The AI analyses that text for the three axes and assigns the tier. (owner, 09-18, verbatim: *"กล่องเดียว พิมพ์อิสระ"*)
- **After analysis the user sees: a 0–100 score on each of the three axes (feasibility / impact on society / interestingness) + the assigned tier + the AI's short reason + the discount they get.** (owner, 09-18: *"โอเค คะแนน 0–100"* — approved Porter's proposal)
- ⚠️ **How the three scores map to a tier is NOT stated** (thresholds / rule). Q2 in §Open questions remains open.
- **Score → tier rule (owner approved 2026-09-18: *"โอเค"*): take the LOWEST of the three 0–100 scores. < 40 → Ordinary · 40–59 → Seeker · 60–74 → Raw Diamond · 75–89 → Visionary · ≥ 90 → The Possibility.** The AI produces the scores; the tier is computed from this rule, not chosen by the AI.

## Sign-in (owner, 2026-09-18)

- **The user must be logged in before submitting an idea. Sign-in is Google only.** (owner, 09-18, verbatim: *"ต้องล็อกอินก่อน ใช้ Google"*)

## Hiring flow (owner approved 2026-09-18: *"โอเค"*)

- **After the result, the user can press "interested in hiring" → a request (idea + scores + tier) reaches the owner → the owner contacts the user and quotes OUTSIDE the system, applying the tier discount himself.** The system does NOT price, quote, or take payment. (owner approved Porter's proposal, 09-18)
- ⚠️ **How the request reaches the owner (email / admin page / LINE) — NOT stated yet.**
- **Hire requests reach the owner on an admin page inside the system** (owner logs in with Google; sees the list: idea, scores, tier, user's email). Email notification is a possible later addition, not part of this. (owner approved 09-18: *"โอเค"*)
- ⚠️ **Which Google account(s) are admin — NOT stated.**

## UI language (owner, 2026-09-18)

- **The UI is bilingual — Thai and English — and the user can switch language.** (owner, 09-18, verbatim: *"ไทย อังกฤษ สลับภาษาได้"*). Tier names stay as the owner wrote them in both languages (SYSTEM-FACTS §Tier definitions).
- **Admin Google account — still NOT stated** (asked 09-18, unanswered).
- **The owner's own email is `develyst1@hotmail.com` — a Microsoft account, NOT a Google account.** (owner, 09-18: *"ของฉันเป็น develyst1@hotmail.com ได้มั้ย ไม่ใช่ google"*). Whether this can be the admin login under Google-only sign-in is an open question — see next line when settled.
- **Admin = the Google account `siegkung@gmail.com`** (the owner's Gmail). Only this account sees the admin page. (owner, 09-18: *"2 siegkung@gmail.com"*)

## Stack — DECIDED by the owner himself (owner, 2026-09-18, verbatim: *"stack พวกนี้ฉันตัดสินเอง"*)

Sober's SPEC-001 recommendations were overridden line by line. These are the facts:
- **D1 Backend: Bun + Hono.** (owner, 09-18: *"bun hono"*)
- **D2 Database: PostgreSQL 18.** (owner, 09-18: *"postgresql 18"*) Schema tool not stated — Sober's call within Bun+Hono.
- **D3 Frontend: Next.js + Mantine, based on the workspace skill `nextjs-pattern-generator`** (its Mantine variant). (owner, 09-18)
- **D4 AI: the owner's own LLM gateway "AI Develyst" at `https://ai.develyst.online` — NOT the Anthropic API.** The API is documented in the Bruno collection at `H:\bruno` (local path; logical name `bruno-ai-develyst`): `GET /` info, `GET /models`, `POST /chat` (`{messages:[{role,content}], provider?, model?}` → `{success, data:{provider, model, content, usage, latency_ms}}`, `500 {success:false,error}` when all providers fail; no provider given = fallback chain deepseek → xai → gemini → openai), `POST /chat/multi`. Providers: openai, gemini, xai, deepseek. **No auth on the gateway as documented.** (owner, 09-18: *"llm gateway learn how to call api H:\bruno"*; Marie-style read-only survey by Porter 09-18)
  - ⚠️ Which provider/model to use for the idea analysis, and whether the gateway supports structured/JSON output — NOT stated; Sober decides the model within the gateway and must design for plain-text `content` (JSON parsed + validated on our side).
- **D5 Auth: as Sober proposed** — Google Identity button on FE → ID token → BE verifies → BE session cookie. (owner, 09-18: *"ok"*)
- **D6 Contract: as Sober proposed** — REST/JSON, camelCase, `/api/v1`, UUID, ISO-8601 UTC, one error envelope, tier enums as exact strings. (owner, 09-18: *"ok"*)
- **D7 Git: the owner does not care about branches — he controls git entirely. The team just works on files; when something is ready to deploy, tell him and he deploys.** (owner, 09-18: *"dont care about git i will self control … just tell me deploy i will deploy"*) ⇒ no branch decision needed; "ready to deploy" is a message from Porter to the owner after TEST_PASSED.
- **D8 Environments: NO local backend database. The team develops AND tests against the PostgreSQL on the owner's SIT server** — connection given by the owner as `DATABASE_URL` (postgres user, host + password given in chat 09-18; **the value is NOT written in any committed file** — the owner puts it in `.env` himself). Database name `possibility_db`. (owner, 09-18: *"no local Backend we use this postgres in server SIT for test and development"*)
  - **The team creates `.env.example` (variable names, no values) in each repo; the owner fills `.env`.** (owner, 09-18: *"create env i will config it for use"*)
  - ⇒ **Environments table changes: SIT database = shared dev+test DB, team may read/write (it is the working DB). It is NOT production.** Nothing else on SIT (app hosting, deploy) is stated. Deploy is the owner's, on request.
- **D3 correction (owner, 2026-09-19: *"Ant Design"*): Frontend UI library is Ant Design, via the skill `nextjs-antd-pattern` (the `nextjs-pattern-generator` family). Not Mantine.** Settles SPEC-001 Q-1.
- **DR-4 done: the owner filled `possibility-back/.env` on the dev machine.** (owner, 2026-09-19: *"env เสร็จ"*)

## AI analysis pipeline (owner, 2026-09-19)

- **AI provider + model must be selectable PER STEP / per process — never one locked `AI_PROVIDER`/`AI_MODEL` for everything.** (owner, 09-19, verbatim: *"ai provider + model แยกใช้ แล้วแต่ flow กับ process ได้ ไม่ควรมา lock ตัวเดียวแบบนี้"*)
- **The analysis of one idea may call the AI several times (the owner said "maybe 5"), as a chain of steps:** (owner, 09-19, verbatim list)
  1. *"วิเคราะห์ว่าที่ลูกค้าพิมพ์มาพยายามสื่ออะไร"* — what is the customer actually trying to say / asking for.
  2. *"เป้าหมายลูกค้าชัดมั้ย"* — is the customer's goal clear.
  3. *"ลูกค้าต้องการไปทำเรื่องดีมีประโยชน์ต่อโลก ต่อมนุษย์มั้ย"* — does the customer want to do something good for the world / humanity.
  4. *"เทียบกับข้อมูลของบริษัทเรา ตรงโจทย์ที่เราชอบหรือเปล่า"* — compare against OUR company's data: is it the kind of work we like.
  5. *"สรุปทุกข้อรวมกัน แล้วให้คะแนน เพื่อนำไปทำ user tier"* — summarise all steps and give the scores that feed the user tier.
- ⚠️ **"ข้อมูลของบริษัทเรา" (our company's data / what work we like) for step 4 — does not exist anywhere yet.** DATA REQUEST to the owner.
- ⚠️ **How steps 1–4 map onto the three shown axes (feasibility / impact / interestingness) — the owner said step 5 "gives the scores"; the axes and 0–100 / lowest-score rule (09-18) still stand unless he changes them.** Porter's reading, to be confirmed by him.
- **The 5-step list is a HYPOTHETICAL flow — an example. The team may modify and improve it.** (owner, 2026-09-19, verbatim: *"นี่คือ flow สมมุตินะ เอาไปแก้ไขปรับปรุงได้"*) ⇒ Sober designs the actual chain in SPEC-003; the owner approves via Porter.
- **Each step uses its own model, and its own `max_tokens` and `temperature`, chosen per step for what that step needs.** (owner, 09-19, verbatim: *"แต่ละขั้นตอนก็ใช้ model ไม่เหมือนกัน แล้วแต่ข้อและความเหมาะสม max token และ temperature ก็ไม่เท่ากัน"*)
- **DR-5 DEFERRED by the owner: "company data" for the compare step is decided WHEN that step is actually designed — ask again then, not now.** (owner, 2026-09-19, verbatim: *"ไว้ตอนทำวางโฟลตรงนี้ค่อยมาขอ … ไว้ค่อยคิดน่า"*). His candidate ideas (NOT decisions): (a) classify which of our system types the idea falls into — *"ERP, CRM, SaaS, IoT, AI, Web App, Mobile บลาๆ"*; (b) compare against *"thesis บริษัทเรา"* (the company's thesis — does not exist as a document yet). Sober may design the chain assuming this input is a configurable text/list supplied later.
- **DR-2 done: the owner has a Google OAuth client ID and has put `GOOGLE_CLIENT_ID` into `possibility-back/.env`.** (owner, 2026-09-19: *"มีแล้ว ใส่ใน .env แล้ว"*). The FE (`NEXT_PUBLIC_GOOGLE_CLIENT_ID` or equivalent) will need the same public value — the owner fills the front `.env` when Fern's `.env.example` exists.
- **APPROVED: SPEC-003 §Chain as designed by Sober** (5 steps understand → goalClarity → goodForWorld → companyFit → synthesis; fixed JSON outputs; axis mapping feasibility←S2, impact←S3, interestingness←S4; default models gpt-4o-mini / gpt-4o-mini / gemini-2.5-flash / gpt-4o / gpt-4o in `config/ai-steps.json`; `config/company-reference.md` placeholder until the owner writes it). (owner, 2026-09-19: *"โอเค"*)
