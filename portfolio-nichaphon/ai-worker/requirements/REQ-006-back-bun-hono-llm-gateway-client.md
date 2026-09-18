# REQ-006: A `back/` service (Bun + Hono) that calls the owner's LLM gateway
- Status: **DELIVERED 2026-09-13 (Porter) — 6/6 acceptance criteria ticked**, see §Delivery. SPEC-006
  DONE, TASK-022 + TASK-023 DONE; **3 of the 5 real calls spent, 2 unspent.** Not signed off, not
  deployed (Q43 default: local only). Q49 ANSWERED 2026-09-13 (30 — recorded in REQ-007). Open for
  the owner, non-blocking: SQ30 / SQ31 / SQ32 / SQ33 (SPEC-006 §Questions), Q43.
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

- [x] AC-a: `back/` runs locally on Bun + Hono and answers a health check.
- [x] AC-b: A recorded, real gateway round-trip against **`https://ai.develyst.online`**
      exists in the TASK — the request sent, the response received, the provider that
      answered, the token usage and the latency, with the date stated. **The running total of
      real calls spent is written down** and stays within the 5 the owner allowed.
- [x] AC-c: One internal operation covers "ask the gateway", and the four failure modes in
      R5 are each demonstrated or explicitly declared untestable.
- [x] AC-d: No key and no gateway URL reaches the browser bundle. **Provider *names* are
      deliberately exempt** — REQ-007 idea D (owner-approved) puts "answered by DeepSeek in
      812 ms" on the page on purpose; that is the demo. The **base URL** must still never
      appear, or the browser can be pointed straight at his open gateway.
- [x] AC-e: The repo-root `README.md` (already stale — it still claims NestJS + Prisma) is
      not made *more* wrong by this REQ; what `back/` is gets written down where the next
      person will look.
- [x] AC-f: Nothing was deployed, no `pm2`, no ssh, no git write — the owner's hands only.

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

**~~Q49~~ ANSWERED 2026-09-13 — his word `Q49=30`: the REQ-007 budget is 30 real calls.** Recorded
in REQ-007 §Owner decisions, where the ledger that spends it lives (SPEC-007). Separate from this
REQ's 5 (3 spent, 2 unspent — SQ31 still asks whether the provider-free `GET /` counted).
Original text kept below.
**Q49 (2026-09-09) — the second budget.** The 5 calls of Q36 are sized for this REQ, where one round-trip proves the
contract. REQ-007 is a different order of magnitude: **one visitor question is three-plus
calls**, so a single end-to-end test costs what a whole day of this REQ costs, and QA's
acceptance round (an honest "not covered" answer, a failure picture, a phone check) needs
several. **Porter is not inventing a number for his money.** When REQ-007 reaches build,
he needs to name one — Porter's suggestion, for a figure to react to rather than a decision:
**30 calls ≈ 10 real questions.** Reminder of the free alternative he passed over in Q36:
running his own gateway locally on :3009 costs nothing per call and would remove this
question entirely.

## Delivery — Porter (PM), 2026-09-13

**REQ-006 is `DELIVERED`. All 6 acceptance criteria are ticked.** SPEC-006 `DONE`, TASK-022 +
TASK-023 `DONE`, each reviewed by Sober with every DoD line re-run on his own machine with the
gateway pinned to a dead port (zero real calls in either review). **Real calls spent: 3 of the 5
the owner allowed (Q36), 2 unspent** — SPEC-006 §Call ledger.

| AC | Evidence I read — and what I re-checked myself, read-only, 2026-09-13 |
|---|---|
| AC-a | `/health` 200 on Fern's run (TASK-022 §Implementation Notes) **and** on Sober's own run on a different port (TASK-022 §Review, again in TASK-023 §Review). Two independent runs; no QA eye — see decision 1. |
| AC-b | TASK-023 §Implementation Notes: request 2026-09-13 13:17:26 +0700, response body verbatim (200, `deepseek` / `deepseek-flash`, usage 18/1/19, latency 568 ms, wall 989 ms), the log line, and the running total **3 / 5** in SPEC-006 §Call ledger row 3. Fired exactly once — "about to fire" line written before, follow-up after. |
| AC-c | One operation, `askGateway()` (SPEC-006 D1). R5's four modes mapped test-by-test in TASK-023 step 6: unreachable + timeout demonstrated structurally on the stub; **quota + unknown-model stub-demonstrated only and declared not reproduced on production** — the "explicitly declared untestable" the AC allows. Sober checked the mapping against `ask.test.ts`. |
| AC-d | Both greps empty on Fern's and Sober's runs. **Re-run by me:** `ai.develyst.online` in `front/.next` → none · in `front/src` → none · in `back/src` → `config.ts:48` only. No key exists anywhere in `back/` (no `.env*`, TASK-022). |
| AC-e | **Re-run by me:** `git diff --stat 1dcc9b8 -- README.md` → empty (root README byte-identical to the human's last commit); `back/README.md` exists. The root README is still stale — not made more wrong; rewriting it is SQ33, his call. |
| AC-f | **Re-run by me:** `git status --short` = `?? back/` only, branch `D1` at `1dcc9b8`. No deploy, no pm2, no ssh, no commit by any role. |

**Three things I record rather than smooth over:**

1. **No QA round was requested for this REQ — a PM decision, overrulable by the owner.** REQ-006
   has no visible surface (nothing under `front/` changed — the AC-d greps and `git status` prove
   it); every AC is either a file fact I re-read myself or a runtime fact Sober reproduced
   independently of Fern; a third stub run would be a third copy of the same 18 green tests. The
   one thing a QA leg could add that nobody has — a failure picture against the **real** gateway —
   spends his money, which is not mine to spend. If he wants Tanya's eye on `back/`, one word does
   it and it costs zero calls (`cd back && bun test` + the stub round-trip).
2. **Two of his five calls are unspent** (ledger rows 4-5). Their disposition is his — fold them into
   REQ-007's 30 (Q49, answered 2026-09-13) or leave them. **SQ31** (does the provider-free `GET /`
   count as one of the 5? Sober counted it) stays open, non-blocking.
3. **Not signed off, not deployed** (Q43 default: local only). Carried to him, none blocking:
   **SQ30** (his readable gateway checkout is v1.0.0, production answers v1.1.0 — sync?) · **SQ32**
   (~60 s worst-case wait when every provider fails; only the last provider's error is visible) ·
   **SQ33** (rewrite the stale root README?) — SPEC-006 §Questions.
