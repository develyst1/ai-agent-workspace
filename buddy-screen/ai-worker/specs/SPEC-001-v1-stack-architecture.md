# SPEC-001: AI for Kids V1 — stack & architecture proposal
- Source: REQ-001 (§ PM hand-off, AC-1..AC-7)
- Status: DRAFT — a proposal for the owner's decision; **no TASK is cut and no code is written until the owner decides (§9)**
- Author: the SA, 2026-10-28 · every choice here is `[SA-proposed]` — nothing is owner-approved yet
- 🔴 Children's data: synthetic only. This SPEC contains no real child data; every example name is invented.

## 0. What I read (evidence)

- `requirements/REQ-001-ai-for-kids-v1.md` (112 lines, read 2026-10-28) — the PM hand-off and the owner's verbatim text.
- `buddy-screen-spec` — branch `main`, HEAD `0e6e911` "Initial commit", one file `README.md` (`# buddy-screen-spec`); read 2026-10-28. **It holds no spec yet**, so this proposal rests on REQ-001 alone.
- `buddy-screen-front` — branch `main`, HEAD `8a3280c`, one file `README.md`; read 2026-10-28. Greenfield: no existing code constrains the stack.
- `SYSTEM-FACTS.md`, `DECISIONS.md` (2026-10-28): systems = this machine only; `buddy-screen-back` later; the owner approves design and deploys.
- Web checks, 2026-10-28 (vendor facts move fast; each is marked where used):
  Gemini Live API: ephemeral tokens for browser clients and audio + video-frame streaming over WebSocket are documented (ai.google.dev/gemini-api/docs/live-api/ephemeral-tokens). **Thai support was NOT confirmed** by that search.
  OpenAI Realtime: short-lived client secrets for browser/WebRTC are documented (developers.openai.com … realtime/client_secrets). **Image input and Thai were NOT confirmed** by that search.
  Thai payment gateways and the PDPA: secondary sources only — §8 marks them `UNVERIFIED`.

## 1. The finding that shapes everything: the cost per hour (AC-1, risk R1)

Arithmetic from REQ-001's own numbers (`inferred`: every input except FX comes from the owner's text):

| Item | From REQ-001 | Per month |
|---|---|---|
| Revenue | 2,000 THB/month | 2,000 THB |
| Gifts | ≤ 500 THB every 2 weeks, in the fee | up to ~1,083 THB (500 × 52/24) |
| Left for AI + servers + LINE + payment fees | | **≥ ~917 THB** |
| Maximum usage | 40 h/week | ~173 h (40 × 52/12) |
| **Budget per active hour, worst case** | | **≈ 5.3 THB/h (≈ US$0.15/h; FX not verified)** |
| Shared server (owner, SYSTEM-FACTS § Costs, 2026-10-28 16:04) | 1,200 THB/month for all customers | 1,200 ÷ N per customer |
| **Budget per active hour, server included** | (916.67 − 1,200/N) ÷ 173.33 | N=1 → −1.63 · 5 → 3.90 · 10 → 4.60 · 100 → 5.22 THB/h (the PM's figures, re-checked by the SA 2026-10-28) |

| AI budget (owner's what-if, SYSTEM-FACTS § Costs, 2026-10-28 16:13) | 1,000 THB per family per month | **5.77 THB per active hour at full quota** — the hard ceiling every provider choice in §3.2 must fit under |

**D0 decided — owner 2026-10-28 16:19 (`DECISIONS.md`):** gift budget **500 THB/family/month** (it was 500 THB every 2 weeks); fee and quota unchanged. Per family: 2,000 − AI 1,000 − gifts 500 = 500 THB margin ⇒ the 1,200 THB server breaks even at 3 families. The design direction above stands; the AI ceiling stays **5.77 THB/h** (1,000 ÷ 173.33). Gift cadence (monthly, or 250 every 2 weeks) is open, for the rewards REQ.
Break-even on gifts vs margin: the PM's table in REQ-001 § PM hand-off (Break-even). That is a business decision (D0), not an architecture one.
Payment fees are still not counted (D5). Below ~10 paying customers the server cost dominates. At scale, the ceiling stays ≈ 5.2 THB/h.
The owner's server has **no GPU listed** (8 vCPU, 24 GB RAM, 150 GB SSD). So self-hosting a speech/vision model on it is not an option (`inferred — a GPU-less CPU box cannot run real-time speech-to-speech for many children at once; P1 would only confirm it`). The real-time AI stays a cloud API; the server runs the backend, PostgreSQL and the batch jobs. That load is sized well within 8 vCPU / 24 GB for V1 (`inferred`).

A cloud real-time speech-to-speech model streaming audio **and** video for a full hour very likely costs
**several times that** (`UNVERIFIED — the probe in §10 measures it`). If so, a family that uses the full quota
loses money on every hour. So **the architecture must not keep a premium real-time model open for every
counted minute.** The design below therefore:

- runs everything that can be run cheaply **on the device**: who is present, poses, motion, voice activity, rep counting;
- opens the real-time AI **only while it is talking**, and sends camera frames to it only at a low rate and only when they are needed;
- runs scripted parts of activities (exercise counting, instructions) from **pre-generated audio** where possible;
- puts every AI provider behind one seam (§3.2), so the owner can switch providers or tiers when prices change.

The owner may still decide the price, the quota or the gift budget differently. That is decision D0 (§9), and it is the first one.

## 2. Architecture at a glance

```
 ┌────────────── TV / large screen (customer's device + USB camera/mic) ───────────────┐
 │  buddy-screen-front  (web app, full-screen)                                          │
 │   ├─ Perception (on device): face detect + face-embedding match · pose/gesture ·     │
 │   │   VAD · motion · rep counter  → emits signals, never stores images/audio         │
 │   ├─ Engagement state machine (on device) — ACTIVE / PAUSED / SLEEP (§5)              │
 │   ├─ Conversation client ──(ephemeral token)──►  Real-time AI provider (§3.2)         │
 │   └─ Activity player (scripts + pre-generated audio)                                  │
 └───────────────┬─────────────────────────────────────────────────────────────────────┘
                 │ HTTPS + WebSocket — the API contract (§4), the only seam to the backend
 ┌───────────────▼──────────────── buddy-screen-back (contract only; repo later) ───────┐
 │  Device & auth · Session/time ledger (authoritative) · Quota & overage rules ·        │
 │  Buddy Memory service (separate module, own API — §6) · Goals & reports ·             │
 │  Rewards · Billing · LINE gateway (webhook + push) · AI token minting                 │
 │  PostgreSQL (+ pgvector for memory search) · job queue for reports/summaries          │
 └───────┬───────────────────────────────┬──────────────────────────────┬───────────────┘
         │ Messaging API (push, Flex     │ LIFF web pages (settings,     │ payment gateway
         ▼ buttons, postback webhook)    ▼ goals, gifts, consent)        ▼ (cards/PromptPay)
      Parent's LINE                    Parent's LINE in-app browser    Payment provider
```

## 3. Layer by layer — choice, reason, cost (AC-1)

### 3.1 The TV app (screen + the family's camera + mic) — costly to reverse, 3 options

| Option | For | Against |
|---|---|---|
| **A. Web app (TypeScript + React + Vite), full-screen in Chromium on whatever box drives the TV (mini-PC, laptop, Android TV box)** — **recommended** | Camera/mic through standard browser APIs (`getUserMedia`); on-device ML runs in the browser (MediaPipe Tasks for web, ONNX Runtime Web); one language with the backend (D3); fastest to iterate; can be wrapped for Android TV later | Needs a device that runs a modern Chromium and accepts a USB camera; sustained ML inference needs a modest GPU/CPU (sized by the probe) |
| B. Native Android TV app (Kotlin) | Best device integration and performance; Play Store distribution | Android-only; a second language; slower iteration; still needs a USB camera that the TV box supports |
| C. Flutter (Android TV + desktop) | One codebase for several native targets | Camera + on-device ML plugins on TV/desktop are thin; a third language |

**Framework inside option A — reworked for the owner's preference (DECISIONS 2026-10-28 16:38: front = Next.js), `[SA-proposed]`:**
**Next.js (TypeScript)** fits. One app in `buddy-screen-front` would hold two surfaces:
- the **TV screen**, as client-only routes: camera, mic and the on-device ML run only in the browser, so those components load with SSR off (`"use client"` + dynamic import);
- the **parents' LIFF pages** (consent, settings, goals, gifts), where Next.js routing and server rendering earn their keep.

The one caveat: server rendering gives the TV screen nothing. If the TV app is ever wrapped for Android TV (R3a), the TV routes need a static export or a hosted URL (`inferred`). React + Vite stays the fallback only if Next.js gets in the way of the camera/ML pages in P2.
Cost: A is the cheapest to build. Switching A → B later means rewriting the client, **but not the backend
or the memory**, because both sit behind the contract (§4).
**Open point the owner must answer (D1):** many smart TVs do not give apps a USB camera at all
(`inferred — not verified per brand`). "กล้องที่มีอยู่แล้ว" probably means a webcam or a laptop. Which device does a family actually plug in?

### 3.2 Real-time voice + vision AI — costly to reverse, 3 options behind one seam

The client talks to an internal **Conversation Gateway** interface (`start(session) · sendAudio · sendFrame ·
onSpeech · onToolCall · stop`). Providers are adapters behind it. The backend mints a short-lived token per
session, so the long-lived API key never reaches the device.

| Option | For | Against |
|---|---|---|
| **A. Gemini Live API (speech-to-speech + video frames over WebSocket; ephemeral tokens documented)** — **recommended as the first adapter, to be confirmed by the probe** | Audio and video in one stream: the "eyes" come without a second pipeline | Thai and child-speech quality `UNVERIFIED`; cost/h `UNVERIFIED`; preview-model churn (the docs name preview models being retired) |
| B. OpenAI Realtime API (speech-to-speech; WebRTC; client secrets documented) | Low-latency browser path; mature tool calling | Image input and Thai `UNVERIFIED`; cost/h `UNVERIFIED` |
| C. Cascade: speech-to-text → text LLM (e.g. Claude) → text-to-speech | Cheapest per hour; any best model per step; full control and logging of what the AI says to a child (safety) | Higher latency (turn-taking feels slower); three vendors to run |

**Update 2026-10-28 16:13 — owner fact (SYSTEM-FACTS § Costs):** the product uses **Kimi / ChatGPT / DeepSeek APIs**, chosen per family by situation, **through the owner's own LLM gateway**; 1,000 THB/family/month for AI; no GPU. What the SA proposes for this layer in response (`[SA-proposed]`, **undecided until the owner decides D2**; owner's standing rule, DECISIONS 2026-10-28 16:37):
- **Proposed: option C (cascade) as the base design:** on-device or API speech-to-text → **text LLM through the owner's gateway** (Kimi / ChatGPT / DeepSeek, per family) → text-to-speech. The Conversation Gateway seam (above) wraps the owner's LLM gateway; it does not replace it.
- Gemini Live (option A): **proposed to drop**, because it is not on the owner's list. OpenAI Realtime (option B) remains only as an optional premium adapter, **if** the owner's gateway can carry it (unknown).
- **"Eyes" without a vision model on every turn:** on-device perception turns the camera into a **short text scene note** (`buddyPresent`, `friendsPresent`, `pose`, `motion`, `activityStep`) sent with each LLM turn. A camera snapshot goes to a vision-capable model only on an explicit need ("show me your drawing"). This is cheaper and keeps frames off the cloud by default (§7). Which of the three providers accept image input is `UNVERIFIED`.
- **Not covered by the owner's list: Thai speech-to-text and text-to-speech.** Kimi and DeepSeek are text/vision LLM APIs, as far as I know (`inferred — verify`); OpenAI has speech APIs. Open point **D2a**: does the owner's gateway also carry STT/TTS, and if so which vendor?
- **The owner's gateway docs are not in this desk yet** (Atlas is making them shared knowledge). Its API shape, the per-family provider switch, usage metering (needed for the 1,000 THB cap) and streaming support are inputs to the contract. Until they arrive, §4 treats the gateway as an OpenAI-compatible chat endpoint (`inferred — to be confirmed from its docs`).

**Update 2026-10-28 — the owner's gateway docs ("AI Develyst", the `llm-gateway` skill, read by the SA 2026-10-28; SYSTEM-FACTS § Costs last line).** Facts about the gateway are from its docs. Every design response below is `[SA-proposed]`, for the owner to decide under D2/D2a/D4:
- Endpoints `GET /`, `GET /models`, `POST /chat`, `POST /chat/multi`. **Text chat only**: `messages[].content` is a string, so **no image input** and **no STT/TTS**. Providers: openai · gemini · xai · deepseek. **No Kimi** (⚠️ conflicts with the owner's 16:13 words; the PM asks the owner, and the SA does not settle it).
- **No streaming is documented.** The example answer took `latency_ms: 4576`. A child waiting ~5 s per turn will drift off, so this is risk **R8**. Design answer: fast models with a small `max_tokens` (P1 compares e.g. `deepseek-v4-flash`, `gemini-2.5-flash`, `gpt-4.1-nano`, `grok-3-mini` on Thai quality and latency); a short pre-generated "thinking" sound/phrase while waiting; and, if P1 shows it is needed, a streaming request to the gateway's own desk (cross-desk, through the PM).
- **The camera's only path to the LLM is the on-device text scene note** (above). Proposed: no snapshots to a vision model while the gateway takes text only, which would also answer part of D4 the private way (no frames leave the device). That is the owner's call under D2/D4.
- **`usage` may be missing.** The 1,000 THB/family cap therefore cannot rely on the gateway's counts. The backend meters every call itself (prompt + completion size per provider, priced from a table it keeps) and stops or downgrades the family's model before the cap.
- **The collection sends no auth (`auth: none`).** So the SA **proposes** that **the TV app never calls the gateway**. Only our backend would, from a server-side base URL (`LLM_GATEWAY_URL`), and it enforces per-family budget, the safety system prompt and logging. If the owner agrees, this replaces the earlier "ephemeral token to the provider" idea; see §4.
- **Speech (D2a) needs a vendor outside the gateway.** Options: a cloud speech API with Thai (e.g. Google Cloud Speech / Azure Speech / OpenAI audio — Thai support and price `UNVERIFIED`); Chrome's built-in speech recognition (free, but audio goes to Google under browser terms — weak for children's privacy); a Thai TTS vendor. Speech-to-text runs only while voice activity is detected (on device), never for the whole hour. Its cost per counted hour is **risk R9** and is measured in P1 against the 5.77 THB/h ceiling.

**Future direction — owner 2026-10-28 16:24 (not V1):** at scale, a local GPU (RTX Pro 6000 Blackwell) answers with self-hosted AI. The design already allows it, in two places, and nothing in the TV app changes:
- **The LLM:** the backend's only LLM caller is the `LlmClient` behind the Conversation Gateway seam, and it speaks the gateway's `/chat` shape. A local model is added **as one more provider inside the owner's gateway** (preferred: zero change in this product), or `LlmClient` points at a local OpenAI-compatible server instead.
- **Speech (D2a):** STT and TTS sit behind their own `SpeechClient` seam, so the same GPU can later take Thai STT/TTS too. That is where R9's cost would fall the most.
- Proposed rule for every TASK cut later (`[SA-proposed]`): **no provider name, URL or SDK outside those two client modules.** Provider and model come from config, per family.

Earlier recommendation, kept for the record (superseded by the updates above): build the seam first, and choose A or C **by measurement** (probe P1, §10). The likely end
state is **hybrid**: a premium real-time model for open conversation, the cascade or pre-generated audio for
scripted activity steps. Text work that is not real-time (reports, goal analysis, memory summaries, gift
lists) goes to a text LLM in batch jobs (Claude recommended), where it costs a small fraction of streaming.

Safety (key principle *"ไม่บังคับเด็ก ชวนและให้รางวัลแทน"*): one system-prompt policy (invite, never force;
age-appropriate; no collecting personal details), held server-side and versioned. Every AI turn's transcript
is kept only as long as §7 allows.

### 3.3 Backend — API contract only for now (no BE repo)

| Option | For | Against |
|---|---|---|
| **A. TypeScript (NestJS, or Hono on Bun/Node) + PostgreSQL + Prisma** — **recommended** | One language end to end; contract types shared with the FE; strong WebSocket and job-queue libraries | — |
| B. Java Spring Boot + PostgreSQL | Mature, strongly typed; a house pattern exists | Two languages across the seam; heavier for a small team |

**Reworked for the owner's preference (DECISIONS 2026-10-28 16:38: back = Bun + Hono or Bun + Elysia), `[SA-proposed]`, owner decides:**

| Option | For | Against |
|---|---|---|
| **Bun + Hono** — SA leans here | Runs on Bun, Node or Deno, so we are not locked to one runtime; large ecosystem; the contract can be written once with `zod` + `@hono/zod-openapi` and shared with the Next.js app; a typed client (`hc`) exists | Its typed client is a little less seamless than Elysia's |
| Bun + Elysia | Very fast on Bun; end-to-end typed client (Eden) for the FE | Bun-only; smaller ecosystem; ties the backend to one runtime |

Under either: **PostgreSQL + pgvector**; ORM **Drizzle** proposed over Prisma (lighter, Bun-friendly, vector column support — `inferred, check the docs before the TASK`); a Postgres job queue (pg-boss or similar — its Bun compatibility is `UNVERIFIED`; checking it costs nothing). Open for the owner: Hono vs Elysia, and the ORM.
Only the contract (§4) is written until `buddy-screen-back` exists. Hosting is not decided: no server exists
for this desk (`SYSTEM-FACTS.md`), so that is the owner's call later (D8).

### 3.4 Data store

- **PostgreSQL** for everything transactional: families, devices, subscriptions, **the time ledger (append-only)**, quota settings, overage approvals, goals, rewards, payments.
- **pgvector** in the same database for Buddy Memory search. One database, not a separate vector store, keeps V1 simple.
- **No blob storage for faces or voices**, because none are stored (§7).
- A Postgres-backed job queue (e.g. pg-boss or Graphile Worker) for the 3-hour approval timers, reports and summaries.

### 3.5 Parent channel — LINE (owner-required, so one option)

- **LINE Official Account + Messaging API**: push messages; **Flex Message with Approve / Decline postback buttons** for over-quota requests; the webhook lands on the backend's LINE gateway, which verifies the request signature.
- **LIFF** (web pages inside LINE) for what buttons cannot do: consent, quota and daily-limit settings, goals, report frequency, gift choice, buying back borrowed time.
- Parent identity = LINE user ID via LINE Login inside LIFF. No separate parent app in V1.
- Prerequisite (D6): the owner creates the LINE OA and the channel keys. They live only in the backend's secrets, never in a desk file.

### 3.6 Billing & quota

- **Quota is computed from the time ledger, not stored as a counter.** Every entry is one row: `ACTIVE_TIME`, `WEEKLY_GRANT`, `BORROW`, `PURCHASE`, `BUYBACK`, `ADJUSTMENT`. The balance is a sum, so it can be audited and recomputed, and a dispute can be answered line by line.
- Payment gateway (D5): **Omise/Opn, 2C2P or Stripe** for the monthly card subscription + one-off charges (overage hours, AI rename, buy-back). Which of them supports recurring cards **and** PromptPay for a Thai business today is `UNVERIFIED` (secondary sources disagree) and must be confirmed with each provider. Recommendation: the one that confirms in writing recurring card billing + PromptPay QR for one-offs. Billing sits behind a `PaymentProvider` seam, like the AI.
- Overage price: ✅ **12.50 THB/h** (2,000 ÷ 160; owner 2026-10-28 17:22). ~~Open: fractional hours vs rounding up, and the buy-back price.~~
- ✅ **Q3 decided 2026-10-28 19:48 (`DECISIONS.md`):** week = Mon–Sun; "the last day of the week" = Sunday's allowance; daily allowance = the parent's setting, or 40 h ÷ 7 when unset; the 3-hour timer starts when the LINE message is sent, and no answer ⇒ auto-borrow from Sunday; buy-back = 12.50 THB/h; extra hours and buy-back are billed **per actual minute, not rounded**. Once Sunday is fully borrowed: approval + payment only (REQ-001).
  Design consequences (`[SA-decided]`, not visible to the owner):
  - **Interpreted (SA, reversible config):** "per actual minute, not rounded" read as "never rounded up". The ledger keeps **seconds**. Money = `seconds / 3600 × 12.50` THB, with no rounding of time; only the final amount is rounded to 2 decimals (satang) when the payment is created. Whether a payment may be for a part-minute is the payment gateway's limit (D5).
  - The default daily allowance is stored as 20,571 s (144,000 ÷ 7, sub-second remainder dropped).
  - Day and week boundaries are computed from UTC timestamps in one configured time zone. The zone itself (Asia/Bangkok proposed) is open with the owner; it changes no structure.
- ✅ **AI rename — owner decided 2026-10-28 19:55 (`DECISIONS.md`):** the first naming is free; each later rename costs **99 THB**, unlimited. The child asks; the parent confirms and pays in LINE. Design: the child's request creates a `PENDING` rename; the new name is written into Buddy Memory only after the payment succeeds.
- The business rules (hourly price, week boundary, borrowing) are **not settled here** (Out of Scope); they are questions Q2–Q4 in REQ-001.

## 4. API / Interface — the BE↔FE contract (first cut, for review; frozen per feature REQ)

Conventions: JSON, **camelCase** field names, ISO-8601 UTC timestamps (`occurredAt`), IDs are UUID strings,
durations in **whole seconds** (`activeSeconds`). Auth: device token (`Authorization: Bearer <deviceToken>`)
for the TV app; LINE ID-token exchange for LIFF. Errors use one body everywhere:
`{ "error": { "code": "QUOTA_EXHAUSTED", "message": "…" } }` with 400 / 401 / 403 / 404 / 409 / 422 / 429.

| Method & path | Caller | Purpose | Key fields |
|---|---|---|---|
| `POST /v1/devices/pair` | TV | Pair a device to a family by a one-time code shown in LINE | → `deviceToken`, `familyId`, `buddyId` |
| ~~`POST /v1/ai/session-token`~~ | — | Proposed to drop (`[SA-proposed]`, pending D2): the TV would never talk to an AI provider or the gateway directly (§3.2, gateway update) | — |
| `POST /v1/sessions/{sessionId}/turns` | TV | One conversation turn. The backend adds memory context + the safety prompt, calls the owner's gateway `POST /chat`, meters cost, and returns the reply text | `transcript` (child's words, from STT), `scene` (`{ "buddyPresent": true, "friendsPresent": 1, "pose": "STANDING", "motion": "HIGH", "activityStep": "JUMP_3" }`) → `replyText`, `provider`, `model`, `latencyMs`, `budgetRemainingTHB`; 409 `QUOTA_EXHAUSTED` · 402 `AI_BUDGET_EXHAUSTED` · 502 `GATEWAY_FAILED` |
| `GET /v1/buddies/{buddyId}/quota` | TV, LIFF | Current balance | → `remainingSeconds`, `todayUsedSeconds`, `dailyLimitSeconds`, `borrowedSeconds`, `state` |
| `POST /v1/sessions` | TV | Open a session | `buddyId`, `activityType` (`EXERCISE`/`BRAIN`/`TALK`/`THINKING`) → `sessionId` |
| `POST /v1/sessions/{sessionId}/events` | TV | **Engagement transitions** (§5) — the ledger's only input | `[{ "seq": 12, "type": "ACTIVE_START", "occurredAt": "…", "reason": "BUDDY_PRESENT_AND_RESPONDING" }]`; idempotent on `seq` |
| `POST /v1/sessions/{sessionId}/heartbeat` | TV | Every 15 s while ACTIVE; no heartbeat for 45 s ⇒ the server closes the interval at the last heartbeat | `seq`, `occurredAt` |
| `GET/PUT /v1/families/{familyId}/settings` | LIFF | Quota settings, report frequency | `dailyLimitSeconds`, `allowOverage`, `reportFrequency` (`DAILY`/`WEEKLY`) |
| `POST /v1/overage-requests/{id}/decision` | LINE webhook | Approve/decline from the Flex button | `decision` (`APPROVE`/`DECLINE`) |
| `/v1/memory/…` | TV, backend jobs | Buddy Memory API — §6 | |
| `POST /v1/line/webhook` | LINE | Signature-verified postbacks | |

Fields marked here are the first cut. Each feature REQ freezes its own slice before either side builds.

## 5. Active time and Sleep — where, how, and how accuracy is proven (AC-5)

**Where.** Decided **on the device**, by a deterministic state machine. The AI model does **not** decide it, because a model's judgement cannot be audited or repeated. **Recorded authoritatively on the server**, from the device's transition events plus heartbeats. The server never counts time it did not receive a heartbeat for.

**How** (a rule the owner can read, with thresholds as settings, not code):

```
SLEEP ──(Buddy's face recognised AND (gesture OR name-call confirmed OR AI invite accepted))──► ACTIVE
ACTIVE ──(any signal lost: Buddy not in frame · no voice/motion response for T1 s)──► PAUSED (not counted)
PAUSED ──(signal back within T2 s)──► ACTIVE
PAUSED ──(T2 s elapse)──► SLEEP      # "ไม่ตอบหรือไม่ทำต่อแบบกระทันหัน → Sleep ทันที"
ACTIVE ──(the AI marks the activity finished via a tool call · the child says stop)──► SLEEP
```

- Signals, all computed on the device: face detected + matched to Buddy's embedding; pose landmarks and motion energy (exercise); voice activity (VAD); the AI's activity-step tool calls (`activityStepStarted`, `activityStepCompleted`).
- ~~Only time spent in ACTIVE is counted. PAUSED and SLEEP return the quota at once.~~ **Owner decided 2026-10-28 17:13 (`DECISIONS.md`): ACTIVE and IDLE (= PAUSED) are counted; only SLEEP is not counted, and the quota is returned only in SLEEP** → ledger config `countedStates = ["ACTIVE","IDLE"]`. The parent sees the live balance in LIFF (*"คืนโควต้าแบบ Real-time"*).
- Friends of Buddy do not start or keep ACTIVE on their own. Counting follows Buddy only (*"นับโควต้าเฉพาะ Buddy หลัก"*).
- **Owner's model, 2026-10-28 17:10 (SYSTEM-FACTS § Time counting): sleep / idle / active.** It maps 1:1 onto the machine above: SLEEP = sleep, PAUSED = **idle**, ACTIVE = active. Whether **idle counts**: ✅ settled 17:13 — **yes** (see the line above). **Either answer costs the design nothing:** the ledger takes a per-state rule `countedStates` (`["ACTIVE"]` or `["ACTIVE","IDLE"]`) from config. The transitions and their reason codes are recorded the same way in both cases, so the rule can even change later and be re-computed on past sessions. A middle option the owner may want to consider (business, his call): idle counts only up to T2, then Sleep.
- **Because idle counts (17:13), T2 (idle → sleep) is now billed time:** every drift-off costs the family up to T2 of quota. At the proposed 20 s, 30 drift-offs in an hour ≈ 10 min charged (`arithmetic, the drift-off rate is a guess`). The owner may want T2 short; a missed Sleep (counting while the child is gone) now costs the parent money directly, so the "never count while Buddy is out of frame" target matters more.
- ✅ **Thresholds decided 2026-10-28 17:13 (`DECISIONS.md`, second line):** T1 = **10 s** (active → idle), T2 = **20 s** (idle → sleep); error **≤ 1 min per counted hour**; **zero seconds counted while Buddy is out of frame**. They are settings, not code, and changing them needs the owner's yes.
- **Interpreted (SA, 2026-10-28, reversible):** "idle counts" + "zero while Buddy is out of frame" together mean idle has two reasons. **IDLE_PRESENT** (Buddy in frame, silent or still) **is counted**. **IDLE_ABSENT** (Buddy not in frame) **is not counted from its first second** and goes to SLEEP after the same 20 s. Ledger config: `countedStates = ["ACTIVE","IDLE_PRESENT"]`. If the owner reads it otherwise, it is a one-line config change. ✅ **Owner approved 2026-10-28 17:22** (`DECISIONS.md`).
- T1/T2 are business numbers: question Q1 (now answered, above). Defaults proposed: T1 = 10 s, T2 = 20 s.

**How accuracy is verified** (*"ต้องแม่นยำ (ไม่ควรผิดพลาด)"*):
1. **Replay tests:** the state machine is a pure function of signal streams. Recorded signal traces, not video, are replayed in CI against expected ACTIVE intervals, so every threshold change is regression-tested.
2. **Labelled sessions, synthetic only:** scripted sessions performed by adult team members or generated media. **Never real children.** A person labels true ACTIVE time; the target metric is counted vs labelled time (e.g. error ≤ 1 min per counted hour, and no counted minute while Buddy is absent). The number itself is Q1.
3. **In production:** every counted interval keeps the reason codes of the transitions that opened and closed it. The parent can see a session timeline in LIFF and dispute it, and the ledger's `ADJUSTMENT` entry corrects it.

## 6. Buddy Memory — independent of the TV app (AC-4)

- **A separate module with its own API (`/v1/memory/…`) and its own tables.** It is keyed by `buddyId`, never by `deviceId`. The TV app is one *embodiment* (`embodimentType: "TV"`); a robot or doll is another client of the same API. Nothing in the memory refers to screens.
- Contents: profile (chosen AI name, the child's preferred name, interests); facts about family and life (each with source and date); episode summaries (one text summary per session, written by the batch LLM. **Not** transcripts or media); Friends of Buddy (invented display name, relation, summary); goal progress.
- **Portable:** a versioned export/import format (`memoryFormatVersion: 1`, JSON + embedding vectors with their `embeddingModel` named). A new body imports it; the face template is re-enrolled on the new device if the model differs (§7).
- Retrieval: the conversation client asks `/v1/memory/{buddyId}/context?activityType=…` at session start and receives a short, ranked context pack. No raw history goes to the real-time model.

## 7. Children's faces, voices and names — processed where, stored what, how long (AC-3)

| Data | Processed where | Stored | How long | Discarded |
|---|---|---|---|---|
| **Camera frames** | **On the device only** (detection, embedding, pose, motion). Only results go to the server; **no frame leaves the home**, and none goes to a cloud vision model until the owner allows it (D4, owner 2026-10-28 16:47 + 17:00) | **Never stored** by us | — | Immediately after inference. Provider-side retention must be zero/no-training by contract (`UNVERIFIED` per provider) |
| **Face template** (numeric embedding of Buddy and each Friend) | Computed on the device at enrolment | Encrypted, in the backend (recommended, D4), plus a local copy | Until the parent deletes it or the subscription ends + 30 days (number: Q7) | The enrolment photos themselves are **never kept** |
| **Gesture ("ท่าเฉพาะ")** | On the device (pose/hand landmarks) | A small landmark template | Same as the face template | — |
| **Voice audio** | Streamed to the AI provider during conversation; VAD on the device | **Never stored** by us | — | Immediately |
| **Transcripts** | From the AI provider | Short-term, encrypted, for safety review and the session summary | e.g. 30 days, then deleted (Q7) | After the summary is written and the window passes |
| **Names** (child's, AI's, friends') | Backend + memory | Yes (needed to talk) | While subscribed | On deletion request |

- **Consent comes first:** no face is enrolled until a parent has given explicit consent in LIFF, for Buddy and for each Friend (Q4, Q7). Thai PDPA appears to require a parent's consent for under-10s, and treats biometric data as sensitive. That reading comes from secondary sources and is `UNVERIFIED`; it needs a legal check (Q7).
- ✅ **Friends of Buddy — owner decided 2026-10-28 19:52 (`DECISIONS.md`):** Buddy's parent confirms in LINE that the friend's parent agreed, before enrolment. Only the face template is kept (no photo), encrypted on the server like Buddy's. The name is the nickname the child uses, never a real name. Buddy's parent can delete a friend at any time. "Kept permanently" means kept until deleted. Design: a `friendConsent` record (who confirmed, when, LIFF action ID) is required before the template endpoint accepts a friend; deletion removes the template and the friend's memory entries together. Open: how a friend's own parent (not a customer) asks for deletion.
- **Test data is synthetic only:** generated faces/voices or adult team members, invented names (e.g. "Nong Mali", "Buddy-Test-01").

## 8. Requirement sections → components (AC-2)

| REQ-001 section | Component(s) | Notes |
|---|---|---|
| ภาพรวม (TV + camera, 2,000 THB, 40 h/week, customer hardware) | TV app §3.1 · Billing §3.6 · ledger §3.4 | The cost risk (§1) comes from this section |
| ลักษณะของ AI (voice only, nameable, paid rename, name used sparingly) | Conversation Gateway §3.2 · Memory profile §6 · Billing one-off charge | Rename price = Q5 |
| การรู้จักตัวตน (face = Buddy, gesture, name call + "เรียกฉันรึเปล่า", Friends, quota for Buddy only, memory portable) | Perception (on device) · state machine §5 · Memory §6 · consent §7 | Recognising a **custom** name in child speech while asleep: on-device keyword spotting vs a short cloud STT window, settled by probe P2 |
| กิจกรรมหลัก (exercise, brain, talk, thinking; invite; ask when off-task; real-time) | Activity player · Conversation Gateway · Perception · state machine | The content of each activity comes in later feature REQs |
| การนับเวลาและ Downtime | State machine §5 · ledger · LIFF live balance | Thresholds/accuracy target = Q1 |
| ระบบเกินโควต้า (LINE approve/decline, hourly pay, daily cap, 3 h → borrow, buy back) | LINE gateway §3.5 · job queue timer · ledger · Billing | Rules = Q2, Q3 |
| เป้าหมายและรายงาน | Goals module · batch LLM analysis · LINE push reports | Topic catalogue source = Q8 |
| ระบบรางวัล (gift every 2 weeks, AI list, ≤ 500 THB, tiers, carry-over) | Rewards module (tier calc + budget ledger with carry-over) · batch LLM gift list · LIFF choice | **Buying and shipping gifts is not in the V1 software architecture.** It is an operations job; V1 only produces the chosen-gift order list (Q6) |
| หลักการสำคัญ | Safety prompt policy §3.2 · parent controls §3.5 · privacy §7 | — |

## 9. Decision pack for the owner (AC-6) — each with my recommendation

| # | Decision | Options | SA recommends |
|---|---|---|---|
| **D0** | The cost-per-hour risk (§1): accept a hybrid design (premium AI only while talking) and re-check price/quota/gift budget after probe P1? | accept · change price/quota/gift budget now | **Accept; re-check with P1's measured cost** — ✅ **decided 2026-10-28 16:19:** gift budget 500 THB/month, direction stands (`DECISIONS.md`) |
| D1 | The device that drives the TV | web app on a Chromium box/laptop + USB webcam · Android TV native · Flutter | **Web app (A)**, and tell us which device families will use — ✅ **decided 2026-10-28 16:37:** web app full-screen in Chromium on an Android TV box / mini-PC / laptop + USB (or built-in laptop) camera; no native/Flutter in V1; a smart TV without a box is not supported in V1; minimum device spec → P2 (`DECISIONS.md`) |
| D2 | Real-time AI | ~~Gemini Live~~ (not on the owner's list, 16:13) · OpenAI Realtime via the gateway (if it can) · cascade STT → Kimi/ChatGPT/DeepSeek via the owner's gateway → TTS | **Cascade through the owner's gateway** (updated 2026-10-28 after the owner's fact). P1 measures Thai quality, latency and THB/h per provider against 5.77 THB/h |
| D2a | Thai speech-to-text + text-to-speech vendor (the gateway has none — `llm-gateway` skill) | a cloud speech API with Thai (Google / Azure / OpenAI audio) · Chrome built-in recognition (free, weaker privacy) · a Thai TTS vendor | **P1 compares two cloud speech APIs on Thai child-like speech + THB/h**; Chrome built-in not recommended for children's audio |
| D2b | Kimi: the owner named it (16:13), the gateway does not list it | add Kimi to the gateway · drop Kimi | **Owner's call**; the design works with the four listed providers |
| D3 | Stack (reworked for the owner's preference, 16:38) | front: **Next.js** (TV client-only routes + LIFF pages) · back: **Bun + Hono** or Bun + Elysia · PostgreSQL + pgvector · Drizzle or Prisma | **Next.js + Bun + Hono + PostgreSQL/pgvector + Drizzle** — ✅ **decided by the owner 2026-10-28 16:43** (`DECISIONS.md`). React + Vite is a fallback only if Next.js blocks the camera/ML pages in P2, and switching needs the owner's yes |
| D4 | Children's camera/face data | (a) face template on the device only · (b) encrypted template also in the backend (needed for device swap / robot); and: may low-rate frames go to the cloud AI during conversation? | **(b), and yes to low-rate frames only with a zero-retention provider contract** — ✅ **part 1 decided 2026-10-28 16:47:** the main server is the source of truth for face/gesture templates (encrypted); the home device keeps only a temporary cache; a device swap or a robot pulls them from the server (`DECISIONS.md`). ✅ **Part 2 decided 2026-10-28 17:00:** *"ส่งแค่ผล"* — frames are analysed on the home device and only results are sent; no camera images go to the server; no images go to a cloud vision model until the owner allows it (PM's interpretation, `DECISIONS.md`). The SA's earlier input, kept for the record — the question was: does the main server also analyse camera frames? SA input for that answer (`[SA-proposed]`): **keep recognition and pose on the device and send only results** (template match yes/no, pose labels). Server-side frame analysis would mean (1) a continuous child-video stream leaving the home, which is the largest privacy exposure in the system; (2) CPU-only real-time vision for every family at once on a 500–750 THB box with no GPU (`inferred: not feasible beyond a handful of families`); (3) upload bandwidth from homes; (4) latency for the Sleep decision (§5). Enrolment is the exception: the device computes the template and sends only the template, never the photo |
| D5 | Payment gateway | Omise/Opn · 2C2P · Stripe | **Whichever confirms recurring cards + PromptPay in writing**; not blocking the first build |
| D6 | LINE Official Account | owner creates the OA + Messaging API + LIFF channels | **Yes, before the parent features start** |
| D7 | Working branch in the repos | `main` · `develop` · other | **`develop`**, needed before the first `ขึ้น git` — ✅ **decided 2026-10-28 17:04: `main` for now** (no `develop`; the owner says when that changes). Commit-message convention: asked at the first `ขึ้น git` (git-command skill) (`DECISIONS.md`) |
| D8 | Hosting for the backend later | the owner's shared server (1,200 THB/month, 8 vCPU/24 GB, no GPU — SYSTEM-FACTS § Costs) · other | **The shared server, for the backend + PostgreSQL only**; not needed until `buddy-screen-back` exists. **Owner 2026-10-28 16:22:** start on a smaller server (500–750 THB/month, spec not stated), the 1,200 one later. That fits: the server runs no AI, only the API, PostgreSQL and batch jobs, so a small box is enough for the first families (`inferred — about 2 vCPU / 4 GB is a reasonable floor; confirm against the box's spec when known`). The single-DB, single-service design moves to the bigger box with a dump/restore |

## 10. After the decision — TASKs to cut (not cut yet)

Owner's standing rule (DECISIONS 2026-10-28 16:37): no TASK is cut on an architecture choice the owner has not decided, and **no probe that spends real money runs until the owner says so**. P1 calls paid APIs, so it waits for his go.

- **P1 probe (FE, throwaway in `tests/harness/`, not product code):** one 10-minute Thai conversation with a synthetic adult/generated voice through each AI candidate. Measure latency, Thai understanding and cost per hour. The result settles D2 and re-checks D0.
- **P2 probe:** on-device face match + gesture + custom-name detection in the browser on the target device. Measure CPU/GPU load and accuracy on synthetic faces.
- Then: FE scaffold (per D1/D3), contract types package, the state machine with replay tests.
  BE TASKs wait for `buddy-screen-back`.

## 11. Risks, assumptions, unknowns

| # | Risk / unknown | What settles it |
|---|---|---|
| R1 | AI cost per hour > ~5 THB budget at full quota (owner's AI budget: 5.77 THB/h) | P1 + provider price sheets; D0 |
| R7 | ~~The owner's LLM gateway: unknown to this desk~~ — **settled 2026-10-28** by the `llm-gateway` skill (§3.2 gateway update) | — |
| R8 | No streaming in the gateway ⇒ ~5 s per turn (example `latency_ms` 4576) — too slow for a child conversation | P1 measures fast models; if still slow, a streaming request to the gateway desk via the PM |
| R9 | Thai STT/TTS cost per counted hour may exceed the 5.77 THB/h ceiling on its own | P1, with STT gated by on-device voice detection |
| R2 | Thai child speech poorly understood by the real-time model | P1 (synthetic voices first; real children only with the owner's own consented trial, never in desk files) |
| R3 | ~~Smart TVs cannot use the camera~~ — settled by D1 (box/mini-PC/laptop) | — |
| R3a | **Android TV boxes usually have no full Chrome** (`inferred — verify`). That path may need a thin WebView/TWA wrapper app, and USB-camera access through it is uncertain. Mini-PC/laptop with desktop Chromium is the safe path | P2 runs on one Android TV box + one mini-PC/laptop; if the box fails, V1 recommends mini-PC/laptop only (the PM tells the owner) |
| R4 | PDPA / biometric consent for children and their friends | Legal check (Q7) |
| R5 | Preview AI models retired; later a move to local AI on the owner's GPU (owner 16:24) | The `LlmClient` / `SpeechClient` seams; provider + model from config, per family (§3.2 future direction) |
| R6 | False Sleep or false ACTIVE erodes trust | §5 replay tests + labelled sessions + parent dispute path |
| A1 | Assumed: one TV device per subscription | Q in feature REQ |

## 12. Regression (AC-7) — `git status` of both repos, 2026-10-28 15:48

```
== buddy-screen-spec
## main...origin/main
0e6e911 Initial commit
README.md
== buddy-screen-front
## main...origin/main
8a3280c Initial commit
README.md
```
Clean trees, no changes. The SA wrote no file in either repo.

## Tasks
- None cut. Waiting for the owner's decision pack (§9), relayed by the PM.

## Questions
Business questions are in `REQ-001 § Questions` (Q1–Q8), for the PM.
