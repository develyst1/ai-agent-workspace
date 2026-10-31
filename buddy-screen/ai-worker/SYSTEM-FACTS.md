# SYSTEM FACTS — what the owner has said, and how the system actually behaves

> **Created 2026-10-28, on the day this desk opened, by Marie (workspace operations) —
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
> means the `operator` seat — โด่ง (harness `CLAUDE.md` §2)** ·
> **⚠️ CONTESTED** means two sources disagree, both are recorded, and **neither may be
> acted on** until the owner settles it · a line marked **(Marie, read-only survey
> 2026-10-28)** was read out of the repos on the day the desk opened and is evidence of what
> is *there* — not of any decision.

---

## 🔴 Children's data — the privacy line (owner via Atlas, ORDER 37, 2026-10-28)

- The product handles children's **faces, voices and names**. **No real child data in any desk
  file, test fixture or log. Synthetic data only.** Same rule as the owner's ORDER 36 on the SOM
  fork. Full wording: `PROTOCOL.md` § Hard boundaries. (owner via Atlas, 2026-10-28)

## What the product is (owner, 2026-10-28)

- One line: *"AI for Kids V1 — แอปบนจอทีวี + กล้อง ให้ AI คุยและชวนเด็กทำกิจกรรม"* (owner, via
  Atlas's ORDER 37 answers, confirmed with "ไปเลย" 2026-10-28).
- It is the owner's **own product**; there is no customer yet, so nothing on this desk is ever
  `customer-validated`. (owner, 2026-10-28)
- The full V1 requirement is the owner's own document, filed **verbatim** as
  `requirements/REQ-001-ai-for-kids-v1.md` — that file is the authoritative source for what the
  product does; this file does not restate it. (owner via Atom, 2026-10-28 14:36: *"มีงานใหม่
  ต้องเปิดโต๊ะใหม่ก่อน"*)
- First work: *"อ่าน requirement V1 + spec repo แล้วให้ SA เสนอ stack/สถาปัตยกรรม (role-sa §4.0)
  ก่อนเขียนโค้ด"* (owner, 2026-10-28)

## Repos and environments

- Repos by logical name: `buddy-screen-spec` (the owner's requirement repo — **read-only for every
  role**) · `buddy-screen-front` · `buddy-screen-back`. Paths only in the workspace-root
  `machine.local.md`. (owner, 2026-10-28)
- `buddy-screen-back` is **later**: not cloned on this machine. Until it is, the team has **no BE
  codebase**; the BE seat stays idle and the SA designs the API contract only. (owner via Atom,
  2026-10-28 14:40: *"เอา specกับ frontลงก่อน"*)
- `buddy-screen-spec`: one branch, `main`; HEAD `0e6e911` "Initial commit" (2026-10-28, author
  `D1`); one file, `README.md`, whose whole content is `# buddy-screen-spec`. (Marie, read-only
  survey 2026-10-28)
- `buddy-screen-front`: one branch, `main`; HEAD `8a3280c` "Initial commit" (2026-10-28, author
  `D1`); one file, `README.md`, whose whole content is `# buddy-screen-front`. (Marie, read-only
  survey 2026-10-28)
- Working branch: **not named by the owner** — undecided; the clones sit on `main`. (Marie,
  2026-10-28)
- Working branch decided: *"ใช้ main ไปก่อนเลย"* — `main` for now. Scope: `DECISIONS.md` 2026-10-28 17:04. (owner via Atom, 2026-10-28 17:04)
- Stack: **TBD — the SA proposes in `SPEC-001`**; the owner decides. (owner, 2026-10-28)
- Stack decided: Next.js (TV + LIFF) · Bun + Hono · PostgreSQL + pgvector · Drizzle. Scope: `DECISIONS.md` 2026-10-28 16:43. (owner via Atom, 2026-10-28 16:43)
- Environments: **this machine only** — no dev server, no production. Deploy and design approval
  are the owner's duties. (owner, 2026-10-28)
- Git: per `CLAUDE.md` §6 — the SA types only the owner's three commands, relayed by the PM.
  (owner, 2026-10-28)

## Team (owner, 2026-10-28)

- One team: Porter (PM + BA) · Tanya (QA) · Sober (SA) · Jason (BE, idle until
  `buddy-screen-back` exists) · Fern (FE + designer). Sessions `<Name>-BUD`. Roster:
  `TEAMS.md`. (owner, 2026-10-28)
- Mode: **manual** — one interactive Claude CLI session per role in tmux, **never `claude -p`**.
  (owner, 2026-10-28)

## Costs (owner)

- Server cost: *"ค่า server ต่อเดือน ใช้ร่วมกันทุกลูกค้า 1200บาท — 8 vCPU, 150GB SSD, RAM 24GB"* — one server shared by all customers, 1,200 THB/month. Stated as a cost for D0; it does not say the server exists yet or that the backend will be hosted there (D8 still open). (owner via Atom, 2026-10-28 16:04)
- AI budget: *"ถ้า AI เราใช้ kimi / chatgpt / deepseek API (1 ครอบครัวแล้วแต่สถานการณ์) งบเดือนละ 1000 (ต่อครอบครัว) สำหรับเรา"* — 1,000 THB per family per month for AI; provider (Kimi / ChatGPT / DeepSeek API) chosen per family by situation. Asked as a what-if for break-even; D0 not chosen yet. (owner via Atom, 2026-10-28 16:13)
- No GPU; the product uses AI providers' API keys. Calls go through the owner's own LLM gateway (its docs are being made shared knowledge by Atlas — not yet in this desk). (owner via Atom, 2026-10-28 16:13)
- The owner's LLM gateway "AI Develyst" is now the `llm-gateway` skill (owner via Atom 2026-10-28, from his Bruno collection): endpoints `GET /`, `GET /models`, `POST /chat`, `POST /chat/multi` — text chat only, no speech-to-text / text-to-speech endpoint listed; providers openai · gemini · xai · deepseek, **no Kimi listed**; no provider ⇒ fallback deepseek → xai → gemini → openai; `usage` may be missing. ⚠️ The owner named Kimi at 16:13 but the gateway lists no Kimi — not settled; ask the owner when D2 comes up. (PM read the skill, 2026-10-28)

- Gift budget changed: *"500 ต่อเดือน ก็ได้"* — 500 THB per family per month (was 500 THB every 2 weeks in REQ-001). Delivery cadence not decided. Scope: `DECISIONS.md` 2026-10-28 16:19. (owner via Atom, 2026-10-28 16:19)
- Server plan: *"ตอนลูกค้าเรายังน้อย เราจะไป server เล็กกว่านี้ ราคา 500-750 ต่อเดือนก่อน"* — start on a smaller server at 500–750 THB/month while customers are few; the 1,200 THB one later. Its spec not stated. With margin 500/family (DECISIONS 16:19): break-even at 1 family (500) or 2 families (750). (owner via Atom, 2026-10-28 16:22; break-even PM-computed)
- Future direction, not V1: *"ในอนาคต หากเรามีลูกค้าเยอะๆ เราจะซื้อการ์ดจอ RTX Pro 6000 Blackwell มาเพื่อรัน local AI ไปตอบเอา"* — at scale, buy an RTX Pro 6000 Blackwell GPU and answer with self-hosted local AI. The design must let the AI provider be swapped for a local one. (owner via Atom, 2026-10-28 16:24)

## Time counting (owner)

- Owner's model: *"การนับเวลา ก็คือตอนที่เปิด event ต่างๆ ที่ไม่ใช่ sleep — มี sleep / idle / active"* — three states: sleep, idle, active; time is counted while an event is open and the state is not sleep. ⚠️ **CONTESTED until the owner answers:** read literally, idle is counted; REQ-001 verbatim says *"นับเฉพาะช่วงที่กำลังทำกิจกรรมจริง"* and *"คืนโควต้า…เมื่อไม่ได้ทำกิจกรรม"*. Asked 17:11. The thresholds (SA's 10 s / 20 s, ≤ 1 min error per hour) are not approved. (owner via Atom, 2026-10-28 17:10)
  - Settled: *"นับ"* — **idle IS counted.** Time counts in active + idle, not in sleep. This supersedes the literal reading of REQ-001's *"นับเฉพาะช่วงที่กำลังทำกิจกรรมจริง"*: quota is returned only in sleep. Thresholds still not approved. (owner via Atom, 2026-10-28 17:13)

## Open questions for the owner — asked by the PM, answered here

*(none yet)*
