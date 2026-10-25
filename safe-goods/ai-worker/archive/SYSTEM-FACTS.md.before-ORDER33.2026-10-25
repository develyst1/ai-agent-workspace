# SYSTEM FACTS — what the owner has said, and how the system actually behaves

> **Created 2026-09-20, on the day this desk opened, by Marie (workspace operations) —
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
> compacted, never summarised, exempt from every size gate (`check-hygiene.mjs` exempts
> this file by name). If a fact turns out to be wrong, strike it and write the correction
> under it — do not delete.
>
> **Conventions:** every date is **2026** unless a full year is written · **`(owner)`
> means the owner, โด่ง / develyst — the only person who has ever talked to this team** ·
> **⚠️ CONTESTED** means two sources disagree, both are recorded, and **neither may be
> acted on** until the owner settles it · a line marked **(Marie, read-only survey
> 2026-09-20)** was read out of the repos on the day the desk opened and is evidence of what
> is *there* — not of any decision.

---

## What the product is

- ⚠️ **NOT STATED.** The owner opened this desk with repos, a team and working rules — and
  **no description of what safe-goods is.** The name is all there is. `safe-goods-spec`, his
  requirement repo, holds only a one-line README (Marie, read-only survey 2026-09-20).
  **Nobody infers the product from the name.** Porter's first job is to ask; what he answers
  is written here, verbatim, before anything else moves.

## How the owner works (owner, 2026-09-20)

- **The owner works manual, step by step, on purpose — to control quality.** (owner,
  09-20, verbatim: *"owner ทำงาน manual step-by-step โดยเจตนา เพื่อคุมคุณภาพ"*) ⇒ this desk
  runs in **manual mode**: one session per role, the owner nudges each one. A role that
  runs ahead of him, batches decisions, or "saves him a step" is working against his
  stated intent, not for it. **One decision per message; end every message with where
  the ball is.**

## Repos and environments

- **Three repos, all greenfield** (Marie, read-only survey 2026-09-20): `safe-goods-back`,
  `safe-goods-front`, `safe-goods-spec` — each has **one commit ("Initial commit"), branch
  `main`, and a one-line `README.md`** containing only the repo's name. Nothing else.
  Absolute paths are in the workspace-root `machine.local.md` only.
- **`safe-goods-spec` is the owner's requirement repo** (owner, 09-20). It is his source of
  requirements; **Porter reads it, nobody writes to it.** It is empty today.
- ~~**The stack is NOT decided** (owner, 09-20: *"TBD — ให้ Sober เสนอใน SPEC แรก"*). **Sober
  proposes it in `SPEC-001`; the owner decides; the decision is written here.** Until that
  line exists, no engineer scaffolds, installs, or picks anything.~~
  **Superseded 09-20 (owner, later the same evening, to Porter):** the owner stated the stack
  himself — see "Stack (owner, 2026-09-20)" below. SPEC-001 now *applies* it, not proposes it.
  Still open: versions, component library choice, working branch.
- ~~**The working branch is not decided either** — the repos sit on `main`. Do not assume
  `develop`; it is part of the SPEC-001 question.~~
  **Answered 09-20 (owner, Q12: *"ก"*): the working branch is `main` in all three repos.** No `develop`. Git writes remain the owner's alone.
- **Environments: local only.** (owner, 09-20: *"Tanya (QA, local เต็ม ยังไม่มี dev server)
  … ไม่มี production · ห้ามแตะ DB จริง"*) **Tanya has full access on local. There is no dev
  server yet. There is no production. No real database may be touched by anyone.** The day
  a dev server appears, it is written here and in PROTOCOL's Environments table **before**
  anyone touches it.

## Team (owner, 2026-09-20)

- **Five roles, exactly the template's: Porter (PM / BA / PO / UX writer) · Sober (SA) ·
  Jason (BE) · Fern (FE) · Tanya (QA).** (owner, 09-20: *"ทีม 5 คนตาม template"*) Chain:
  Human ↔ Porter ↔ Sober ↔ (Jason, Fern), with Tanya hanging off Porter.

## Open questions for the owner — asked by Porter, answered here

- **Q1 — What is safe-goods? Who is it for, and what does it do?** Nothing stated; the spec
  repo is empty. Porter asks first, before any REQ.
- **Q2 — Stack** — Sober proposes in SPEC-001; the owner decides. → **Answered 09-20** by the owner directly (see §Stack below); Q11/Q12 remain.

## Stack (owner, 2026-09-20, to Porter — verbatim: *"frontend = next js template generator , UI base on component lib / use skill frontend-design + impeccable / backend = bun hono"*)

- **Backend: Bun + Hono.** (owner, 09-20)
- **Frontend: Next.js, generated from the house "template generator" pattern; UI built on a component library.** (owner, 09-20) ~~Which component library is **not stated** — open question Q11 (the house pattern skills offer Ant Design / HeroUI / shadcn / MUI / Chakra / PrimeReact).~~ **Answered 09-20 (owner, Q11: *"ก"*): component library = Ant Design, via the house `nextjs-antd-pattern` skill.**
- **Frontend design work uses the `frontend-design` + `impeccable` skills.** (owner, 09-20) — a working-method fact for Fern, via Sober.
- **Working branch: `main`.** (owner, 09-20, Q12)

## What the product is (owner, 2026-09-20, to Porter — his words kept verbatim where quoted)

- **safe-goods is an escrow / middleman website ("เว็บกลาง"): buyers and sellers exchange through us, and the goal is a fair exchange.** (owner, 09-20: *"ฉันต้องการทำเว็บกลาง … เราคือเว็บกลางของ คนซื้อ กับคนขาย จะแลกเปลี่ยนกันที่เรา และต้องการให้ ได้การแลกเปลี่ยนที่เป็นธรรม"*)
- **Language: Thai first; English only where necessary.** (owner, 09-20: *"เน้นไทย เป็นหลัก Eng เป็นรอง เมื่อจำเป็นเท่านั้น"*)
- ~~⚠️ **Site name — unclear.** Owner wrote *"ชื่อเว็บ ชื่อเว็บกลาง เว็บ"* — could mean the name is literally "เว็บกลาง", or that the name is still to be chosen. Open question Q4.~~
  **Answered 09-20 (owner, Q4: *"ก"*):** **the site's user-facing name is literally "เว็บกลาง".** "safe-goods" stays the repo / project name only.
- **Example goods: in-game items.** (owner, 09-20: *"อย่างเช่น item ในเกม"*) ~~Whether the product is limited to game items or covers any goods is **not stated** — open question Q5.~~
  **Answered 09-20 (owner, Q5, verbatim: *"มีหมวดหมู่แยก มีทั้งในเกม มีทั้งแบบส่งของจริงๆ"*):** **goods are split into categories; both in-game (digital) goods and physical goods that are shipped are in scope from the start.** (Owner declined Porter's "digital-only first" proposal.) Category list itself: not stated — a REQ detail.
- **Every room shows guidance text for the buyer and for the seller.** (owner, 09-20: *"ในห้องต้องมีคำแนะนำสำหรับผู้ซื้อและขาย"*)
  - **Seller guidance (owner's words):** *"ระวังโดนเรียกร้อง its not ok มั่วซั่ว ต้องแนบหลักฐานแน่นหนา"* — beware of baseless "it's not ok" claims; attach solid evidence.
  - **Buyer guidance (owner's words):** *"ต้องติดกล้องวงจรปิด, ระวังโดนเล่นเรื่อง เบอร์ ขนส่ง ดูและ ติดตามสถานะพัสดุ ตลอด"* — record on camera (CCTV) when receiving; beware tricks around the courier / tracking number; keep tracking the parcel status throughout.
  - Final wording is Porter's (UX writer) and will be in the REQ; the owner's lines above are the source of intent.
- ~~⚠️ Porter's open point (not a fact): the 3-day timers were stated with game items in mind; whether physical-goods rooms need a longer "waiting for parcel" window is **not stated** — Q5b.~~
  **Answered 09-20 (owner, Q5b: *"ก"*):** **in a physical-goods room, the 3-day auto-release clock starts when the parcel reaches "delivered" status — not when the seller presses ready.** The seller enters the tracking number at the ready step; delivered status is confirmed by admin or buyer (exact mechanism = REQ detail). In-game rooms keep "3 days from ready".
- **Buyer pays money into the site first, before the seller delivers.** (owner, 09-20: *"คนเป็นคนซื้อ เราจ่ายเงิน ลงไปในเว็บแล้ว"*)
- **Money in: the buyer transfers (bank / PromptPay) and attaches the slip; an admin confirms receipt manually. No payment gateway.** (owner, 09-20, Q8: *"1 แนบสลิป แอดมินยืนยัน"*)
- **Money out: an admin transfers to the seller manually and records it. No in-site wallet, no self-service withdraw.** (owner, 09-20, Q8: *"2 แอดมินโอนเอง"*)
- **A deal takes place in a "room" (ห้อง)** — the owner's own unit of one transaction. (owner, 09-20, from *"ตอนเปิดห้อง"*, *"status ห้องนี้"*)
- **No marketplace / listings. Buyer and seller meet elsewhere (Facebook, LINE, Discord…) and come to เว็บกลาง only to run the deal: one side opens a room and shares a link / code, the other joins. The site is purely the escrow tool.** (owner, 09-20, Q13: *"ก"*)

### Fee ("ค่ากลาง")
- **Fee: 20% with a minimum of 20 baht; both numbers must be editable (admin-configurable).** (owner, 09-20: *"เราจะเก็บค่ากลาง 20% ขั้นต่ำ 20บาท (แก้ไขได้)"*)
- ~~⚠️ **CONTESTED — base fee 20% or 10%?** The same message later says, when admin is called, *"ต้องจ่ายกันเพิ่มคนละ 10% เป็น 20%"* — which reads as base 10% → 20% after escalation. The two lines disagree. **Not actionable until the owner settles it** (Porter asked 09-20, Q3).~~
  **Settled 09-20 (owner, Q3 answer, verbatim: *"ก ปกติ 20% เรียกแอดมินแล้วเป็น 40%"*):** **base fee is 20% of the price. When admin is called, the total fee becomes 40%** — i.e. each side pays an extra 10% of the price on top (2 × 10% = +20%). The earlier "เป็น 20%" was a slip; "คนละ 10%" stands.
- **Who pays the fee — three options per room: (1) seller pays, (2) buyer pays, (3) split equally.** (owner, 09-20: *"การกลาง เราจะมีให้เลือก 1 คนขายจ่าย 2 คนซื้อจ่าย 3 หารเท่า"*)
- **Price entry — two modes: (a) enter a price and the fee is added on top; (b) the fee is already included in the entered price.** (owner, 09-20: *"ใส่ แล้วบวก ค่ากลางเข้าไป และ อีกแบบ คือ ค่ากลาง อยู่ในราคานั้นแล้ว"*)

### Deal close & "credit"
- ~~**Every completed deal has both sides giving each other "credit" before the deal closes — always.** (owner, 09-20: *"ทุกการจบการซื้อขาย มีการให้เครดิตกันก่อนปิดดีลเสมอ"*) What "credit" is exactly (rating? reputation score?) is **not stated** — open question Q7.~~
  **Corrected by the owner 09-20 (Q9.3, verbatim: *"แก้ไข ไม่ต้องมีการให้เครดิตกัน เพราะ การปิดดีลได้ดี กับ ปิดดีล แบบไม่ดี มันจะเป็น credit เอง"*):** **there is NO manual credit-giving step. "Credit" is derived automatically from how a deal closed — a good close vs. a bad close is the credit itself.** (Q7 therefore becomes: what exactly counts as good/bad, and how is it shown — still open.)
- **Credit formula (owner, 09-20, Q7 — confirmed Porter's proposal with one edit, verbatim):**
  - *"ปิดดีลดี โดยไม่ต้องเรียก admin → ทั้งคู่ +1"* — **good close without admin (buyer pressed "ได้รับของแล้ว", or auto-release with no dispute) → both sides +1.**
  - *"มีคนกด not ok แล้วถอนเอง → ไม่เป็นไร นับตอนปิดดีล"* — **a press that is withdrawn has no effect; credit is counted at deal close as usual.**
  - *"เข้าห้องแอดมิน → ฝ่ายที่แอดมินตัดสินว่าผิด −1, อีกฝ่ายไม่นับ"* — **admin room: the side admin rules against gets −1; the other side gets nothing.**
  - *"เงียบจนโดนตัดสินแพ้อัตโนมัติ (3 วัน) → ฝ่ายที่เงียบ −1"* — **silent side that loses by 3-day timeout gets −1.**
  - How credit is *displayed* to the other party was proposed by Porter ("ปิดดีลดี X / มีปัญหา Y ครั้ง") and **not explicitly confirmed** — treat as Porter's UX draft, to be settled in the REQ.
- **Happy-path close (owner, 09-20, Q9): the buyer presses "ได้รับของแล้ว" to release the money to the seller.** (owner: *"1 ได้รับของแล้ว"* — accepting Porter's proposed button label)
- **If the buyer does nothing after the seller pressed ready → money is auto-released to the seller after 3 days.** (owner, 09-20: *"2 3 วัน"*)
- **The seller can press "ready" (delivered) only after attaching evidence — evidence is attached from the start.** (owner, 09-20: *"ผู้ขายไปแล้วจริง แนบหลักฐาน ตั้งแต่เริ่มแรก ถึงจะกด ready ได้"*)

### "It's not ok" (dispute) mechanism
- **Both buyer and seller have an "it's not ok" button.** Pressing it means "I think this is unfair to me"; it gives the other side time to fix things or decide, before money is pulled back. (owner, 09-20: *"จะมีเวลาอีกฝ่ายแก้ตัว หรือ ตัดสินใจก่อน ดึงเงินกลับ"*)
- **Buyer scenario:** buyer paid, seller says delivered, but buyer does not see the item ⇒ buyer may press "it's not ok". (owner, 09-20)
- **Seller scenario:** seller really delivered (evidence attached, pressed ready), buyer falsely claims non-receipt and presses "it's not ok" to pull the money back ⇒ seller presses "it's not ok" too, so the money cannot be pulled back. (owner, 09-20)
- **The system records who pressed first and who pressed second.** (owner, 09-20: *"จะมี เก็บข้อมูล ว่าใครก่อนหลังด้วย"*)
- ~~⚠️ **Owner's sentence cut off:** *"แล้วเมื่อกดฝ่ายเดียว"* — what happens when only ONE side presses (how long the other side has, what happens at timeout) is **not stated**. Open question Q6.~~
  **Answered 09-20 (owner, Q6, verbatim: *"1 ให้ 3 วัน 2 เงินคืนผู้ซื้ออัตโนมัติเลย 3 ถอนได้"*), asked with the buyer-presses-alone example:**
  - **One-sided "it's not ok": the other side gets 3 days** to fix things or press too. (owner, 09-20)
  - **If the 3 days expire and the other side does nothing → money is refunded to the buyer automatically.** (owner, 09-20)
  - **The side that pressed can withdraw its press** while waiting. (owner, 09-20)
  - ~~⚠️ Porter's doubt, not a fact: the answer was given for the *buyer*-presses-alone case. Whether "auto-refund to buyer" also applies when the *seller* presses alone and the buyer stays silent is **not stated** — Q6b.~~
    **Answered 09-20 (owner, Q6b: *"ข"*):** **if the SELLER presses alone and the buyer stays silent for 3 days → money is released to the seller automatically** (seller has evidence attached from the ready step). So the one-sided timeout rule is: **silent side loses** — buyer presses alone → refund buyer; seller presses alone → pay seller.
- **When BOTH sides have pressed, the room's status becomes "it's not ok room" and an admin is called automatically.** (owner, 09-20)
- **When admin comes in, each side pays an extra 10% — both sides, regardless of the fee-split chosen at room opening, even if the room was set to one side paying.** (owner, 09-20: *"ถ้า admin มาต้องจ่ายกันเพิ่มคนละ 10% เป็น 20% แต่ 10% นี้ ต้องเข้าทั้งคู่ แม้ว่าตอนเปิดห้อง จะเป็น 10% ของใครสักคน โดยไม่หารก็ตาม"*) — see the ⚠️ CONTESTED fee line for the 10%/20% base.
- **Admin resolution (owner, 09-20, Q10, verbatim: *"1. จบได้ทุกแบบ 2. ค่ากลางไม่มีคืน 3. ไม่ใช่แอดมินไม่ตัดสิน แอดมินดูคนคุยกันไม่ลงตัวในเวลา ริบเงินทั้งหมด"*):**
  - **Admin can close the room any way: full refund to buyer, full release to seller, or a partial split.** (owner: *"จบได้ทุกแบบ"*)
  - **The fee (ค่ากลาง) is never refunded — not the 20% base, not the +10% admin surcharge — whatever the outcome.** (owner: *"ค่ากลางไม่มีคืน"*)
  - **If the two sides fail to reach agreement within the admin window (3 days, or as extended), the admin confiscates the entire amount** — neither side gets the money. (owner: *"แอดมินดูคนคุยกันไม่ลงตัวในเวลา ริบเงินทั้งหมด"*) The admin window is not "admin's deadline to rule"; it is the parties' deadline to settle.
- **After admin joins, the two sides have 3 days to negotiate / prove their case; admin may extend at their discretion.** (owner, 09-20: *"จะมีเวลาให้ ต่อรอง พิสูจน์ ตัวเองกัน แค่ สามวัน หรืออาจจะ ต่อเวลาแล้วแต่แอดมินเห็นชอบ"*)

### How the owner wants Porter to work (owner, 2026-09-20)
- **Porter is invited to think along, propose, doubt and ask.** (owner, 09-20: *"ช่วยฉันคิดได้ เสนอได้ สงสัย ถาม"*)

## Open questions for the owner — round 2 (Porter, 2026-09-20; asked one at a time, answers written above)

- **Q3 — Base fee: 20% or 10%?** → **Answered 09-20:** base 20%, admin-called 40% total (+10% each side). See §Fee.
- **Q4 — Site name:** → **Answered 09-20:** "เว็บกลาง" (user-facing); safe-goods = repo name only.
- **Q5 — Scope of goods:** → **Answered 09-20:** categories; both in-game and physical (shipped) goods; room shows buyer/seller guidance. **Q5b answered 09-20:** physical rooms count 3 days from parcel "delivered", seller enters tracking no. at ready.
- **Q6 — One-sided "it's not ok":** → **Answered 09-20:** 3 days; timeout → auto-refund buyer; press is withdrawable. **Q6b answered 09-20:** seller presses alone + buyer silent 3 days → auto-release to seller.
- **Q7 — What is "credit"?** → **Answered 09-20:** formula in §Deal close (+1 both on good close; −1 for the side ruled against or silent). Display format = Porter draft, settle in REQ.
- **Q8 — Money in/out:** → **Answered 09-20:** in = slip upload + admin confirms; out = admin transfers manually. No gateway, no wallet.
- **Q9 — Normal happy-path close:** → **Answered 09-20:** buyer presses "ได้รับของแล้ว"; silent buyer → auto-release after 3 days; no credit step.
- **Q10 — Admin resolution outcomes:** → **Answered 09-20:** any outcome (full/full/partial); fee never refunded; no agreement within the window → admin confiscates all.
- **Q11 — Component library** → **Answered 09-20:** Ant Design (`nextjs-antd-pattern`).
- **Q12 — Working branch** → **Answered 09-20:** `main`.
- **Q13 — Where do buyer and seller meet?** → **Answered 09-20:** outside; site is escrow tool only (open room → share link/code). No marketplace.
- **REQ slicing agreed (owner, 09-20: *"ตกลง"*):** REQ-001 = normal deal room (no dispute) · REQ-002 = "it's not ok" + admin room · REQ-003 = admin back-office. Porter's PO call, owner confirmed.
- **Fee model confirmed (owner, 09-20, REQ-001 Q-A: *"ถูก"*):** fee = max(20% × goods price B, 20 THB), rounded up to whole baht; who-pays sets the buyer's share (0 / F / F÷2); "fee included" mode = the entered number is the buyer's total, system derives B. Worked table in `requirements/REQ-001-deal-room-happy-path.md` §Fee model.

## Frontend working method (owner, 2026-09-21, to Porter — originally said to Sober directly on 09-21, re-routed via Porter; verbatim)

- *"ให้เฟิร์นใช้ skill frontend-design + impeccable ด้วย บอกเขา ให้ใช้สกิล ด้วยนะ"* — **Fern MUST use the `frontend-design` + `impeccable` skills** when building the frontend. (owner, 09-21) Restates the 09-20 line; now explicit and mandatory.
- *"nextjs pattern generator เอา structure และ การใช้ component lib"* — **the house Next.js pattern generator is for the project structure and the way a component library is wired in** — not a visual template to copy. (owner, 09-21)
- *"base ui เลือก เลยเอาที่เหมาะกับโปรเจคนี้ ไม่ใช่เอาที่ง่าย"* — **the base UI / component library must be the one that fits THIS project, not the easiest one.** (owner, 09-21)
  - ⚠️ Porter's note, not a fact: this may revise Q11 (Ant Design, chosen 09-20 from Porter's shortlist). Whether Ant Design still stands, or the team should choose on fit, is **not yet stated** — Q14, asked 09-21.
- *"skill frontend-design + impeccable ให้หน่อยทำ frontend ใหม่ UI ใหม่ สวยๆ"* — **the frontend UI is to be designed fresh and beautiful, using those two skills** — not a default-looking admin template. (owner, 09-21)
- **Q14 answered (owner, 09-21: *"ก"*): Ant Design STANDS (Q11 unchanged).** "Fits, not easy" means: do not ship a raw AntD-template look — design the UI fresh with `frontend-design` + `impeccable` on top of Ant Design.
- ⚠️ **Q15 (Porter → owner, 09-21): the `frontend-design` skill is NOT installed on this machine** (Fern could not invoke it; Sober confirmed). The owner made it mandatory on 09-21. Options put to the owner: (ก) owner installs it, Fern re-runs a design pass; (ข) `impeccable` alone satisfies the mandate. **Not stated yet.** TASK-006..009 were built with `impeccable` + `nextjs-antd-pattern`.
- **Q15 answered (owner, 09-21: *"ข"*): `impeccable` alone satisfies the frontend-skill mandate.** `frontend-design` is not required while it is not installed; the "fresh, not template" bar stays. Supersedes the "must use frontend-design + impeccable" wording above to: **must use `impeccable` (+ `frontend-design` if/when installed).**
- **Tanya's Thai name is "ธัญญ่า"** (owner, 09-21: *"tanya = ธัญญ่า"*). Porter had been writing "แทนย่า" — use ธัญญ่า in Thai messages.

## Database (owner, 2026-09-21, to Porter)

- **The database is PostgreSQL, not the local SQLite the team built REQ-001 on.** (owner, 09-21: *"ใช้อันนี้แทน db ที่ใช้อยู่"*) He gave a `DATABASE_URL=postgresql://…:5432/safe-goods_db` on a remote host. **The URL with its password is NOT written here or in any committed file** — it goes into each role's git-ignored `.env` / the workspace `machine.local.md`, placed by the owner.
- ⚠️ **Q16 (Porter → owner, 09-21) — what IS that Postgres box?** Not stated. Until answered it is treated as a **real environment: nobody connects, migrates, seeds or tests against it** (PROTOCOL §Environments: "the absence of a technical guard is not permission"). Needed: (a) is it a dev/test DB the team may migrate + seed + let Tanya write test data on, or is it real; (b) may Sober/engineers run the schema migration on it, or does the owner run it.
- **Q16 answered (owner, 09-21: *"ก ทำเลย ตอนจะเทส ฉันจะแก้ env ให้"*): the Postgres box is a dev/test database.** The team may run migrations, seed, and Tanya may write test data on it. **The owner himself puts the `DATABASE_URL` into the `.env` when it is time to test** — engineers build against a local Postgres / their own connection until then; nobody asks him for the password in a file. Recorded in PROTOCOL §Environments as "Dev DB (Postgres)".
- **REQ numbering note (Porter, 09-21):** the Postgres switch takes the next number, **REQ-002**; the agreed slices shift: dispute + admin room → **REQ-003**, admin back-office → **REQ-004**.
- **`bun test` in `safe-goods-back` TRUNCATES every table of the database named by `TEST_DATABASE_URL`.** (Sober, 09-21, from TASK-012) ⇒ `TEST_DATABASE_URL` must **never** point at the owner's dev DB — a throwaway local Postgres only. Tanya and every engineer: check before running tests.
- **The owner set `PORT=4018` in `safe-goods-back/.env`** (observed by Sober 09-21 — the owner's local choice, not a decision recorded by him). The FE default API URL is :3001; whoever runs both must align `NEXT_PUBLIC_API_URL`. Porter has not asked the owner to confirm; treat 4018 as "what is on his machine".

## Testing environment change (owner, 2026-09-21, verbatim: *"ไม่ต้องเทสอะไรบน local เลย ทำให้เสร็จ แล้ว ฉันจะ deploy ไปแล้ว ให้เทสบน server sit"*)

- **QA testing is NOT done on local any more. The owner deploys the build to a SIT server himself; Tanya tests on SIT.** (owner, 09-21) Engineers still run their own code locally for build evidence (that is not "testing" in the owner's sense); Tanya's TEST verdicts come from SIT only.
- **Deploys are the owner's alone** — no agent deploys (PROTOCOL rule unchanged). The team's job ends at SPEC_DONE + "ready to deploy" notes; the owner deploys, then tells Porter, then Tanya tests.
- ⚠️ **Q17 (Porter → owner, 09-21): SIT details not stated** — FE URL, API URL, whether the dev Postgres (§Database) is SIT's database, admin login on SIT, and whether Tanya may create test users/rooms/slips there. Until answered, SIT is recorded in PROTOCOL §Environments as "exists, details pending" and nobody touches it.
- TEST-002 (REQ-002 on Postgres) is **on hold**: Tanya does not test it locally; it will be tested on SIT after the owner deploys.
- **Remove the test-database env (`TEST_DATABASE_URL`).** (owner, 09-21, verbatim: *"เอา env test database ออกละ"*) One `DATABASE_URL` only. Consequence for the team: `bun test` may no longer truncate any configured database; how tests get a throwaway DB is Sober's design, not an env the owner has to set.
- **`safe-goods-back/.env` on this machine now holds the remote dev-DB URL** (placed by the owner; observed by Sober 09-21). ⇒ a plain `bun run dev` here runs against the dev DB (the auto-release sweep writes there). Engineers pass a local `DATABASE_URL` on the command line for evidence runs; nobody "cleans up" the dev DB.
- **`bun test` uses an embedded PostgreSQL (PGlite) — zero env, cannot reach `DATABASE_URL` by construction.** (Sober, 09-21, REQ-002 Change 1) Supersedes the 09-21 "bun test truncates TEST_DATABASE_URL" line above — that env no longer exists.
- **SIT is deployed: `https://klang.develyst.online/`** (owner, 09-21: *"deploy แล้ว sit url https://klang.develyst.online/"*). Q17 partly answered: FE URL known. **API URL, SIT admin login, and SIT's DB are not stated** — Porter's working assumptions until corrected: API = whatever the deployed FE's `NEXT_PUBLIC_API_URL` points at (Tanya reads it from the page); admin = the seeded `admin@local.test` unless the owner set `ADMIN_EMAIL/PASSWORD` differently; SIT DB = the dev Postgres. **Tanya may create test users/rooms/slips on SIT** — testing there is what the owner asked for; she declares her footprint in TEST files.
