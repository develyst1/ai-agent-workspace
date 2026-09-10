# REQ-006: A `back/` service (Bun + Hono) that calls the owner's LLM gateway
- Status: **READY_FOR_SA** — unblocked 2026-09-09 by the owner's answers to Q33 / Q34 / Q35 /
  Q36 (recorded in §Owner decisions below). Q44 is answered too. Q43 keeps its default;
  one NON-blocking call is new: Q49.
- Priority: HIGH
- Requested: 2026-09-09 by the owner (Nichaphon)
- Deadline: none stated

## Problem / Goal

The owner's words:

> "และก็ทำ BackEnd Bun hono folder back/ ทำมาเพื่อนำมาเขียนหลักการ call api ของฉัน
> เป็น llm gateway ลองอ่าน docs ทำความเข้าใจ การใช้งานและ ยิงทดสอบ สักครั้ง
> เพื่อเข้าใจจริงว่ามันทำงานยังไง"

He wants a server of his own in this repo whose job is to **call his LLM gateway** — and he
wants the team to actually **read the gateway's docs and fire one real test call** before
writing anything on top of it, so the calling logic is built on observed behaviour instead of
a guess. This REQ is that foundation. The visitor-facing feature rides on it in REQ-007.

**This is a scope change the owner has made, and it is recorded as his, not as a team
improvisation:** `board.md` and `PROTOCOL.md` both state that this project has *no backend
and no database*. From this REQ onward the project has a backend. Whether it also gains a
database is Q44 and still open.

## What the gateway is (read 2026-09-09 from the owner's own repo — facts, not design)

Read-only, from `develyst-ai` (logical name; path in workspace-root `machine.local.md`) —
its `CLAUDE.md` and its Bruno collection `bruno/`:

- It is itself a **Bun + Hono** server, name `AI Develyst`, default port **3009**.
- Endpoints: `GET /` (service info + supported models), `GET /models`,
  **`POST /chat`** (one model), **`POST /chat/multi`** (several models in parallel).
- `POST /chat` takes `{ messages: [{role, content}], provider?, model?, temperature?,
  max_tokens? }`. Omit `provider` and it walks a **cost-tier fallback chain**
  (documented in Bruno as `deepseek → xai → gemini → openai`; the resume words it
  `DeepSeek → Kimi → xAI → Gemini → GPT`).
- Every provider returns **one normalised shape**:
  `{ success, data: { provider, model, content, usage{prompt_tokens, completion_tokens,
  total_tokens}, latency_ms } }`; all-providers-failed is a `500` with
  `{ success:false, error }`.
- `POST /chat/multi` takes `{ configs: [ …one chat request per entry… ] }` and returns an
  array in the same order; one provider failing does not affect the others.
- Environments in the collection: **local `http://localhost:3009`**, **production
  `https://ai.develyst.online`**. Every request in the collection is declared `auth: none`.
- Provider API keys live in that server's `.env` and, per its own docs, "never leave the
  server". **No role has opened that `.env` and no role may.**

## Owner decisions — 2026-09-09

| Q | His answer | What it settles |
|---|---|---|
| **Q33** | *"ใช่"* | **Confirmed:** `back/` is the empty folder already at the root of the portfolio repo, beside `front/`. Same repo, not a new one. |
| **Q34** | *"เรียกของเดิม"* — call the existing one | **Option (a).** `back/` is a **client** of his running gateway. It holds **no provider keys**; `develyst-ai` stays the one place keys live, and the portfolio becomes a live demo of the gateway that is the first line of his resume. |
| **Q35** | *"ตาม bruno path ที่ส่งให้ เลยใช้url production ได้เลย ไม่มี auth"* | Target = the Bruno collection's **production** environment, **`https://ai.develyst.online`**. **No auth header, no key.** |
| **Q36** | *"ข 5ครั้ง"* | **Option (b)** — fire at production, **not** a locally-started gateway. **Budget: 5 calls**, total. |
| **Q44** | *"ต้องมี postgres อีกเหรอ ไว้คราวหลัง"* (inside his Q38 answer) | **No database this round** — deferred, in his own words, to later. The board's "no database" line stands. |
| **Q43** | *(not answered)* | Default stands: **local only**, nothing deployed. |

**What Q35 means and does not mean.** He has confirmed the gateway is open — Bruno's
`auth: none` is true in production, not a collection oversight. He has **not** said whether
the gateway rate-limits itself; nobody has read that, so the team must treat it as
**unknown** rather than assume either way. Combined with REQ-007's Q38 (*no cap this round*),
the honest statement of today's posture is: **once the Home feature is public, nothing known
to this team stands between a stranger with a script and his provider bill.** That is his
call, made with the exposure written down in front of him — it is recorded here, not argued.

**What the 5 calls buy.** Enough for AC-b, which needs one real round-trip, with four spare
for a retry and for the failure modes that a real call is the only way to see. It is **not**
enough to also test REQ-007's chain, where a single visitor question is three-plus calls —
see **Q49**. Cheap alternatives that spend nothing, for whoever plans the work: an unknown
model name, a bad path and an unreachable base URL each exercise a failure mode without a
provider ever being touched.

## Requirement

1. The system must gain a service at **`back/`** in the portfolio repo, written with
   **Bun + Hono** (owner-mandated stack), that is the only thing in this project allowed to
   talk to the LLM gateway.
2. Before any calling logic is written, the team must **run one real request against
   `https://ai.develyst.online` and record the actual response** (status, body shape, latency,
   token usage) in the TASK. Reading the docs is not evidence; the owner asked for a live
   shot. **No more than 5 real calls may be spent on this REQ** (Q36).
3. The service must expose the gateway to the rest of this project as a **single internal
   operation** — "ask the model these messages, get back text + which provider answered" —
   so REQ-007 can chain several calls without knowing about providers. **That one operation
   must be callable from a long-lived WebSocket connection as well as from a plain HTTP
   handler**, because REQ-007's transport is now WebSocket by the owner's own decision
   (REQ-007 Q37b) — it must not be built as something only a request/response cycle can use.
4. The service must **never expose provider keys or the raw gateway URL to the browser**.
   Anything the frontend can see, an abuser can see.
5. Failures must be **visible, not silent**: gateway down, quota exhausted, timeout and
   unknown-model must each produce a distinguishable, logged outcome.
6. The service must run locally with a single documented command, and must not require the
   owner to change anything on his droplet in order for the team to work.

## Acceptance Criteria

- [ ] AC-a: `back/` runs locally on Bun + Hono and answers a health check.
- [ ] AC-b: A recorded, real gateway round-trip against **`https://ai.develyst.online`**
      exists in the TASK — the request sent, the response received, the provider that
      answered, the token usage and the latency, with the date stated. **The running total of
      real calls spent is written down** and stays within the 5 the owner allowed.
- [ ] AC-c: One internal operation covers "ask the gateway", and the four failure modes in
      R5 are each demonstrated or explicitly declared untestable.
- [ ] AC-d: No key and no gateway URL reaches the browser bundle. **Provider *names* are
      deliberately exempt** — REQ-007 idea D (owner-approved) puts "answered by DeepSeek in
      812 ms" on the page on purpose; that is the demo. The **base URL** must still never
      appear, or the browser can be pointed straight at his open gateway.
- [ ] AC-e: The repo-root `README.md` (already stale — it still claims NestJS + Prisma) is
      not made *more* wrong by this REQ; what `back/` is gets written down where the next
      person will look.
- [ ] AC-f: Nothing was deployed, no `pm2`, no ssh, no git write — the owner's hands only.

## Constraints

- Owner-mandated: **Bun + Hono**, folder **`back/`** at the portfolio repo root (Q33).
- Owner-mandated: `back/` is a **client** of `https://ai.develyst.online`, holds no provider
  keys, and sends **no auth header** (Q34, Q35).
- The gateway is the owner's **live, cost-bearing** service. Every test call spends real
  money on a real provider account. **Hard ceiling for this REQ: 5 real calls** (Q36).
- `PROTOCOL.md`: no role deploys, ssh's, runs `pm2`, or writes git. Local only.
- The team may **read** `develyst-ai` but may not edit it — it is a different repo with its
  own history and its own `CLAUDE.md`.

## Out of Scope

- The visitor-facing chat, the multi-step reasoning chain and any UI — that is REQ-007.
- Changing, forking or improving the `develyst-ai` gateway itself.
- Deployment of `back/` anywhere (Q43).
- Any database (Q44).

## Questions

**~~Q33~~ ~~Q34~~ ~~Q35~~ ~~Q36~~ ~~Q44~~ ALL ANSWERED 2026-09-09** — his exact words and what
each settles are in **§Owner decisions** at the top of this file. In one line: `back/` at the
repo root, a **client** of `https://ai.develyst.online` with **no auth**, **5 real calls** of
budget, **no database** this round.

**Q43 (still open, NON-blocking) — deployment.** Unanswered, so the default holds: **local
only**, nothing deployed, no `pm2`, no nginx, no ssh. Deploying is his hands whenever he wants
it. **One thing he should know before that day comes:** REQ-007's transport is now a real
WebSocket (his Q37b), and a WebSocket does not survive a default nginx site — it needs the
connection-upgrade headers added to that location block. That is a five-line change he (or
whoever holds the droplet) makes once; it is named here so it is not discovered at deploy time.

**Q49 (NEW 2026-09-09, NON-blocking for THIS REQ, blocking for REQ-007's testing) — the
second budget.** The 5 calls of Q36 are sized for this REQ, where one round-trip proves the
contract. REQ-007 is a different order of magnitude: **one visitor question is three-plus
calls**, so a single end-to-end test costs what a whole day of this REQ costs, and QA's
acceptance round (an honest "not covered" answer, a failure picture, a phone check) needs
several. **Porter is not inventing a number for his money.** When REQ-007 reaches build,
he needs to name one — Porter's suggestion, for a figure to react to rather than a decision:
**30 calls ≈ 10 real questions.** Reminder of the free alternative he passed over in Q36:
running his own gateway locally on :3009 costs nothing per call and would remove this
question entirely.
