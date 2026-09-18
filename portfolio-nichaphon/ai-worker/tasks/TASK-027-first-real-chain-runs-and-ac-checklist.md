# TASK-027: The first real chain runs + REQ-007 AC checklist (the ONLY task that spends the owner's money)
- Source: SPEC-007
- Status: **DONE** (2026-09-13, Sober — every DoD line re-run read-only, AC-d trace + D6 re-done by SA, FQ50 = backed → SPEC-007 D15 + SQ38, FQ51/52 no action; zero calls in review, ledger `7 / 30`. Was REVIEW 2026-09-13, Fern — Runs A/B/C fired + recorded, 7 real calls of the 12 cap, ledger `7 / 30`; AC-d table + AC checklist in §Implementation Notes; FQ50–52 non-blocking. Was IN_PROGRESS → TODO 2026-09-13, Sober)
- Depends on: TASK-026 `DONE` (met), ~~Q49 answered~~ (met 2026-09-13), TASK-021 `DONE` (met)
- Owner: Fern (FE)

## Startable now — 2026-09-13 (Sober): the budget and the question list

**This is the only task that spends the owner's money. Cap for this task: 12 real calls** (of his
30). Planned: Run A 3 · Run B 3 · Run C 1 = **7**; the D4 single retry per step is the only way
past 7, worst case 5 + 5 + 2 = 12. **Stop at 12 no matter what** — if any run is still unproven
at 12, record what you have, set `REVIEW`, and ask in §Questions. The 18 unallocated calls are
not yours; a repeat of any run is on my written word only. Order: **A → B → C**, one at a time,
read the frames before the next.

Real runs use **`back/` on its defaults** (no `GATEWAY_BASE_URL`, no `KNOWLEDGE_DIR` — the real
`back/knowledge/` with the approved `PROFILE.md` from TASK-021), `bun run ws-client "<question>"`
for the frames — the record is the frames, no browser needed. **A browser run would be a further
3+ calls and is not in this plan**: the Home UI is proven on the stub (TASK-026); whether a real
browser run happens later is Porter's call against the remaining budget (QA's round). Verify
`/health` shows `profile:true, projects:true` **before** the first fire.

| Run | Question (exact) | Why this one | Expect |
|---|---|---|---|
| A | `Can you build a realtime site with WebSocket?` (starter chip 1) | the owner's own Q37 example | 3 `step done` frames with real provider/model/latency, `answer` with ≥ 1 citation; the knowledge names WebSocket only in `PROJECTS.md` (YodBarber), so a citation to `/portfolio` is the honest outcome |
| B | `Have you worked with Kubernetes?` | `grep -ci kubernetes` = 0 in both `PROFILE.md` and `PROJECTS.md` (checked 2026-09-13) — demonstrably not covered | `coverage:"none"` (or `partial` with an honest sentence) and a pointer to `/contact`; **no** invented Kubernetes claim — if the answer asserts any Kubernetes work, that is an AC-d failure: report it plainly |
| C | `What is the weather in Bangkok today?` | not about him | `step 1 done` only, `answer` with `coverage:"offtopic"`, `citations: []`, `calls: 1` |

Ledger rows go into SPEC-007 §Call ledger **before** each run, as `planned 3 (max 5)` / `planned 1
(max 2)`, then the actual count and provider/model when the frames are in. Aborted or errored
calls count. If a run errors at the gateway (`quota`, `unreachable`, …), that is a real result:
record it, do **not** retry on your own — ask.

Everything below was written 2026-09-09 and stands as the shape; the table above is the content.

1. **Ledger first.** Append a row to SPEC-007 §Call ledger **before every real question**
   (one question = 3 calls typical, 5 max — write the *planned* count, then the actual).
2. **Run A — on-topic (AC-a, AC-b):** the first starter chip. Record all frames verbatim
   (from `bun run ws-client`) in §Implementation Notes: three `step done` frames with real
   provider/model/latency, the `answer`, its citations.
3. **Run B — not covered (AC-c):** a real question the profile demonstrably does not cover
   (Sober names it when unblocking, from a read of the approved `PROFILE.md` + `PROJECTS.md`).
   Expected: `coverage:"none"` or `partial` with an honest sentence. Frames recorded.
4. **Run C — off-topic (idea G):** a question not about him. Expected: one call, boundary text.
5. **AC-d sample:** for Run A's answer, list every factual claim in the text and, beside
   each, the knowledge line it comes from. One claim without a line = REQ fails — report it,
   do not soften it.
6. **AC checklist** for REQ-007 AC-a…AC-h in §Implementation Notes, each pointing at the
   evidence (task + section); AC-e's three pictures and AC-h's phone pictures come from
   TASK-026 (stub-produced — they show the UI states, which do not depend on a real provider).
7. Total calls fired ≤ the budget; the running total in the ledger matches your count.

## Definition of Done
- [x] Every real call has a ledger row written **before** it was fired. — SPEC-007 §Call ledger rows 1–3 / 4–6 / 7, each appended before its `ws-client` run (Fern 2026-09-13)
- [x] Runs A, B, C recorded verbatim (frames), with provider/model/tokens per step. — §Implementation Notes, three frame blocks + the log block
- [x] AC-d claim-by-claim table for Run A, zero unbacked claims (or the failure stated plainly). — 7/7 claims → lines; the leading "Yes." is an inference, stated plainly as item 0 + FQ50
- [x] AC-a…AC-h checklist complete, each with a pointer. — §Implementation Notes table; AC-a real-browser half stated UNVERIFIED (not in plan)
- [x] Total real calls ≤ budget; `back/` stopped, ports freed. — 7 ≤ 12 (ledger `7 / 30` = log count); pid 22972 stopped, 3001 free, 3000 untouched

## Implementation Notes

**Status 2026-09-13 (Fern): all three runs fired and recorded — 7 real calls, 0 retries, 0 errors. Firing closed at 7 of
this task's 12-call cap; SPEC-007 §Call ledger reads `7 / 30`.** No code was changed in this task. Raw copies of the
frames and the `back/` log: `project-docs/fe-task027-2026-09-13/` (`runA/B/C.frames.jsonl`, `back.log`).

### Setup (verified before the first fire)
- Shell env: `GATEWAY_BASE_URL`, `KNOWLEDGE_DIR`, `GATEWAY_PROVIDER`, `GATEWAY_MODEL` all unset (printed empty). `bun 1.3.14`.
- `back/` started as `bun run src/index.ts` (defaults) → log line
  `[back] portfolio-back 0.1.0 listening on http://localhost:3001 (ws://localhost:3001/ws) — gateway https://ai.develyst.online`;
  **no `[knowledge] missing` line.**
- `GET /health` → `{"ok":true,"service":"portfolio-back","version":"0.1.0","knowledge":{"profile":true,"projects":true}}`.
- `grep -ci kubernetes back/knowledge/PROFILE.md back/knowledge/PROJECTS.md` → `0` / `0` (re-checked, matches Sober's read).
- Port 3001 was free before start; 3000 (foreign, pid 22944) never touched. Ledger row appended to SPEC-007 §Call ledger
  **before** each of the three fires (rows 1–3, 4–6, 7), then filled with the actual count when the frames were in.
- Frames captured with `bun run scripts/ws-client.ts "<question>"` — exactly the CLI the plan names. Order A → B → C, one at a
  time, frames read before the next fire.

### Run A — `Can you build a realtime site with WebSocket?` — planned 3 (max 5), **actual 3**
All frames verbatim as printed by `ws-client` (one JSON line per frame):
```
{"type":"accepted","id":"20416401-244a-4cf7-93b0-a9d0c506c6ef"}
{"type":"step","step":1,"name":"understand","status":"started"}
{"type":"step","step":1,"name":"understand","status":"done","provider":"deepseek","model":"deepseek-flash","latency_ms":899,"wall_ms":1292,"usage":{"prompt_tokens":224,"completion_tokens":56,"total_tokens":280},"retried":false,"result":{"about_owner":true,"language":"en","intent":"The visitor wants to know if the owner can build a realtime website using WebSocket.","topics":["realtime","WebSocket","website development","skills"]}}
{"type":"step","step":2,"name":"match","status":"started"}
{"type":"step","step":2,"name":"match","status":"done","provider":"deepseek","model":"deepseek-flash","latency_ms":2037,"wall_ms":2339,"usage":{"prompt_tokens":3504,"completion_tokens":251,"total_tokens":3755},"retried":false,"result":{"coverage":"covered","matches":[{"source":"projects","ref":"YodBarber Queue Booking","excerpt":"Real-time barbershop queue and booking system, deployed to production behind an Nginx reverse proxy with SSL and PM2 process management.","relevance":"strong"},{"source":"projects","ref":"YodBarber Queue Booking","excerpt":"- WebSocket updates so queue status changes land instantly","relevance":"strong"},{"source":"projects","ref":"YodBarber Queue Booking","excerpt":"Tech stack: React 19, TypeScript, Socket.IO, Node.js, Express, MongoDB, Nginx, PM2","relevance":"strong"},{"source":"profile","ref":"Skills","excerpt":"- **Frontend and apps** — React · Next.js · SvelteKit · HTMX · Vue.js · Angular · ASP.NET ·\n  kiosk web apps","relevance":"weak"},{"source":"profile","ref":"Skills","excerpt":"- **Backend** — NestJS · Express · Node.js · Bun (Elysia, Hono) · FastAPI · Django ·\n  Go Gin · Go Fiber","relevance":"weak"}],"dropped":0}}
{"type":"step","step":3,"name":"answer","status":"started"}
{"type":"step","step":3,"name":"answer","status":"done","provider":"deepseek","model":"deepseek-flash","latency_ms":1209,"wall_ms":1294,"usage":{"prompt_tokens":388,"completion_tokens":87,"total_tokens":475},"retried":false,"result":{"text_len":397}}
{"type":"answer","text":"Yes. The portfolio shows realtime work: the YodBarber Queue Booking project uses WebSocket updates so queue status changes land instantly, and its stack includes Socket.IO, Node.js, and Express. It was deployed to production behind an Nginx reverse proxy with SSL and PM2 process management. The skills list also covers backend tools such as NestJS, Express, Node.js, Bun, FastAPI, Django, and Go.","coverage":"covered","citations":[{"source":"projects","ref":"YodBarber Queue Booking","excerpt":"Real-time barbershop queue and booking system, deployed to production behind an Nginx reverse proxy with SSL and PM2 process management.","href":"/portfolio"},{"source":"projects","ref":"YodBarber Queue Booking","excerpt":"- WebSocket updates so queue status changes land instantly","href":"/portfolio"},{"source":"projects","ref":"YodBarber Queue Booking","excerpt":"Tech stack: React 19, TypeScript, Socket.IO, Node.js, Express, MongoDB, Nginx, PM2","href":"/portfolio"},{"source":"profile","ref":"Skills","excerpt":"- **Frontend and apps** — React · Next.js · SvelteKit · HTMX · Vue.js · Angular · ASP.NET ·\n  kiosk web apps","href":"/about"},{"source":"profile","ref":"Skills","excerpt":"- **Backend** — NestJS · Express · Node.js · Bun (Elysia, Hono) · FastAPI · Django ·\n  Go Gin · Go Fiber","href":"/about"}],"calls":3}
{"type":"done"}
```
Per step: provider/model `deepseek / deepseek-flash` ×3 · tokens (prompt/completion/total) 224/56/280 · 3504/251/3755 ·
388/87/475 · latency 899 / 2037 / 1209 ms · `retried:false` ×3 · `dropped:0` (all 5 excerpts verified verbatim by D6).
Outcome vs "Expect": 3 `step done` frames with real provider/model/latency — yes; `answer` with ≥ 1 citation — 5 (3 → `/portfolio`
YodBarber, 2 → `/about` Skills). The citation to `/portfolio` is the honest outcome Sober predicted; two weak `profile` matches came too.

### Run B — `Have you worked with Kubernetes?` — planned 3 (max 5), **actual 3**
```
{"type":"accepted","id":"98b947fa-9c73-4504-9f3e-23d95abe986e"}
{"type":"step","step":1,"name":"understand","status":"started"}
{"type":"step","step":1,"name":"understand","status":"done","provider":"deepseek","model":"deepseek-flash","latency_ms":939,"wall_ms":1017,"usage":{"prompt_tokens":219,"completion_tokens":48,"total_tokens":267},"retried":false,"result":{"about_owner":true,"language":"en","intent":"The visitor wants to know whether the owner has experience working with Kubernetes.","topics":["Kubernetes","skills","experience"]}}
{"type":"step","step":2,"name":"match","status":"started"}
{"type":"step","step":2,"name":"match","status":"done","provider":"deepseek","model":"deepseek-flash","latency_ms":724,"wall_ms":826,"usage":{"prompt_tokens":3495,"completion_tokens":10,"total_tokens":3505},"retried":false,"result":{"coverage":"none","matches":[],"dropped":0}}
{"type":"step","step":3,"name":"answer","status":"started"}
{"type":"step","step":3,"name":"answer","status":"done","provider":"deepseek","model":"deepseek-flash","latency_ms":759,"wall_ms":838,"usage":{"prompt_tokens":199,"completion_tokens":35,"total_tokens":234},"retried":false,"result":{"text_len":164}}
{"type":"answer","text":"The profile does not cover Kubernetes experience, so I can't confirm whether the owner has worked with it. For a direct answer, please use the /contact page to ask.","coverage":"none","citations":[],"calls":3}
{"type":"done"}
```
Per step: `deepseek / deepseek-flash` ×3 · tokens 219/48/267 · 3495/10/3505 · 199/35/234 · latency 939 / 724 / 759 ms · `retried:false` ×3.
Outcome vs "Expect": step 2 said `coverage:"none"` with zero matches on its own (not via the D6 zero-kept fallback); the answer
says the profile does not cover it and points to `/contact`; `citations:[]`. **No Kubernetes work is asserted anywhere** — AC-c met,
AC-d not violated. (Wording note → FQ51.)

### Run C — `What is the weather in Bangkok today?` — planned 1 (max 2), **actual 1**
```
{"type":"accepted","id":"689edb17-ae97-4307-b3e5-946ed6522439"}
{"type":"step","step":1,"name":"understand","status":"started"}
{"type":"step","step":1,"name":"understand","status":"done","provider":"deepseek","model":"deepseek-flash","latency_ms":775,"wall_ms":863,"usage":{"prompt_tokens":221,"completion_tokens":42,"total_tokens":263},"retried":false,"result":{"about_owner":false,"language":"en","intent":"The visitor wants to know today's weather in Bangkok.","topics":["weather","Bangkok"]}}
{"type":"answer","text":"This assistant only answers questions about the person behind this portfolio — their skills, experience and projects. That question is outside what it can speak to.","coverage":"offtopic","citations":[],"calls":1}
{"type":"done"}
```
Per step: `deepseek / deepseek-flash` · tokens 221/42/263 · latency 775 ms · `retried:false`. Outcome vs "Expect": `step 1 done`
only, `about_owner:false`, `answer` with `coverage:"offtopic"`, `citations:[]`, `calls:1`, the fixed server-side boundary text
(`back/src/chain/copy.ts`) — exactly D3. Steps 2–3 never started (no `started` frame), so no second or third fire.

### `back/` log for the three runs (content-free, verbatim — the call count cross-check)
```
[chain] id=20416401-244a-4cf7-93b0-a9d0c506c6ef step=1 ok provider=deepseek model=deepseek-flash tokens=224/56/280 latency_ms=899 wall_ms=1292 retried=0 len=207
[chain] id=20416401-244a-4cf7-93b0-a9d0c506c6ef step=2 ok provider=deepseek model=deepseek-flash tokens=3504/251/3755 latency_ms=2037 wall_ms=2339 retried=0 len=924
[chain] id=20416401-244a-4cf7-93b0-a9d0c506c6ef step=3 ok provider=deepseek model=deepseek-flash tokens=388/87/475 latency_ms=1209 wall_ms=1294 retried=0 len=397
[chain] id=20416401-244a-4cf7-93b0-a9d0c506c6ef end coverage=covered calls=3 wall_ms=4931
[chain] id=98b947fa-9c73-4504-9f3e-23d95abe986e step=1 ok provider=deepseek model=deepseek-flash tokens=219/48/267 latency_ms=939 wall_ms=1017 retried=0 len=186
[chain] id=98b947fa-9c73-4504-9f3e-23d95abe986e step=2 ok provider=deepseek model=deepseek-flash tokens=3495/10/3505 latency_ms=724 wall_ms=826 retried=0 len=32
[chain] id=98b947fa-9c73-4504-9f3e-23d95abe986e step=3 ok provider=deepseek model=deepseek-flash tokens=199/35/234 latency_ms=759 wall_ms=838 retried=0 len=164
[chain] id=98b947fa-9c73-4504-9f3e-23d95abe986e end coverage=none calls=3 wall_ms=2682
[chain] id=689edb17-ae97-4307-b3e5-946ed6522439 step=1 ok provider=deepseek model=deepseek-flash tokens=221/42/263 latency_ms=775 wall_ms=863 retried=0 len=141
[chain] id=689edb17-ae97-4307-b3e5-946ed6522439 end coverage=offtopic calls=1 wall_ms=863
```
Seven `step=… ok` lines, every one `retried=0`; `calls=` 3 + 3 + 1 = **7**. (Counting rule: `run.ts` increments `calls` only after a
gateway reply, so a gateway error would have been one more fire than the log's `calls=` — none occurred.) Total fired = 7 ≤ cap 12.
After Run C: `back/` (pid 22972, the only listener on 3001) stopped with `taskkill`; `netstat` shows 3001 free, 3000 still pid 22944.

### AC-d — claim-by-claim table for Run A's answer (every factual claim → the knowledge line it comes from)
Line numbers are in `back/knowledge/PROFILE.md` (P) and `back/knowledge/PROJECTS.md` (J) as they stand after TASK-021.
| # | Claim in the answer text | Knowledge line | Backed? |
|---|---|---|---|
| 0 | "Yes." (= she can build a realtime site with WebSocket) | not a line — an inference from claims 1–4 (a shipped realtime WebSocket project) | **inference, flagged — FQ50**; every fact it rests on is backed |
| 1 | "The portfolio shows realtime work" | J:102 `Real-time barbershop queue and booking system, …` | yes |
| 2 | "the YodBarber Queue Booking project" | J:98 `## YodBarber Queue Booking` | yes |
| 3 | "uses WebSocket updates so queue status changes land instantly" | J:105 `- WebSocket updates so queue status changes land instantly` | yes (verbatim) |
| 4 | "its stack includes Socket.IO, Node.js, and Express" | J:110 `Tech stack: React 19, TypeScript, Socket.IO, Node.js, Express, MongoDB, Nginx, PM2` | yes |
| 5 | "deployed to production behind an Nginx reverse proxy with SSL and PM2 process management" | J:102 (same sentence, verbatim) | yes |
| 6 | "The skills list also covers backend tools such as NestJS, Express, Node.js, Bun, FastAPI, Django" | P:87 `- **Backend** — NestJS · Express · Node.js · Bun (Elysia, Hono) · FastAPI · Django ·` | yes |
| 7 | "… and Go" (listed as a backend tool) | P:88 `  Go Gin · Go Fiber` (Backend continuation line) and P:86 `- **Languages** — TypeScript · JavaScript · Python · Go` | yes — "Go" paraphrases "Go Gin · Go Fiber" |
**Result: zero claims without a knowledge line.** The only non-line item is the leading "Yes." — a capability conclusion drawn
from backed facts, not a new fact; I have not softened it away and I do not decide whether it counts — FQ50 asks Sober. No skill,
client, date, number or name appears in the answer that is not in the two files. Every citation excerpt is `dropped:0`-verified by D6.

### REQ-007 AC checklist (each with its evidence pointer)
| AC | Verdict | Evidence |
|---|---|---|
| AC-a — on Home a visitor asks free text and gets an answer | **met, in two halves** | UI half on the stub: TASK-026 §Evidence (happy path paints steps then the answer + citation links; `happy-final-*.png`) + Sober's §Review re-run. Real-provider half over the **same `GET /ws`** the Home UI uses: Run A `answer` frame above. **A real browser run was not in this plan** (Sober: 3+ more calls, Porter's call for QA's round) — so "Home + real provider in one picture" is stated UNVERIFIED here, by design, not by omission. |
| AC-b — one question triggers ≥ 3 distinct gateway calls, each step's result recorded | **met** | Run A: three `step … done` frames, each carrying its own provider/model/latency/usage and parsed `result` (D8); the three `[chain] step=n ok` log lines (content-free) are the second record. Run B same. SQ37(b) for Porter says why the results are in the frames, not the logs. |
| AC-c — a question the profile does not cover → honest "not covered", real example | **met** | Run B (Kubernetes, 0 hits in both files): `coverage:"none"`, `citations:[]`, answer says not covered → `/contact`; no invented claim. |
| AC-d — every factual claim traceable; one invented fact fails the REQ | **met on this sample, one item for Sober** | Table above: 7/7 factual claims → lines; item 0 ("Yes.") is an inference, FQ50. QA's own sample is Porter's to schedule. |
| AC-e — gateway unreachable / WS never opens / drops mid-chain: three pictures | **met (stub-produced UI states)** | TASK-026 §Evidence: `f1-never-opened-*`, `f2-unreachable-step1-*`, `f3-dropped-*` (desktop + phone) in `project-docs/fe-task026-2026-09-13/`; all three reproduced live by Sober (TASK-026 §Review). Not re-shot here — no real call involved and no code changed. |
| AC-f — no cap ships; the single named cap point exists + documented; nothing stored | **met** | `guard()` in `back/src/limits.ts:6` (no-op), called once per `ask` in `back/src/ws.ts:60` and per `POST /ask` in `index.ts:63`; `back/README.md` documents it. `grep -rn "localStorage\|sessionStorage\|document.cookie\|writeFile\|appendFile" back/src front/src` → empty (re-run 2026-09-13). Log lines carry kinds/lengths only (see the log block). |
| AC-g — no key, gateway URL or prompt reachable from the browser, incl. over the WS | **met** | Over the WS, checked as one channel: `grep -c "ai.develyst.online\|STEP: \|api_key\|apiKey\|Bearer"` over the three recorded frame files → `0 / 0 / 0`. `grep -rn "ai.develyst.online" back/src` → `config.ts:48` only. Last `front/.next` build (TASK-026): `ai.develyst.online` 0 files, `STEP: ` 0 files (re-grepped, not rebuilt). Provider name `deepseek` is shown on purpose (idea D). |
| AC-h — seen at 360px, hero fold not regressed | **met (stub-produced)** | TASK-026 §Evidence: `fold-phone.png` hero bottom 741 = section top 741 at 360×740, `scrollWidth` 360 in every state; Sober's §Review confirmed 741/741. No `front/` change in this task. |

### Not done / not touched
- No code change anywhere; `git status` unchanged from TASK-026's (`?? back/`, the five TASK-021 `front/` files, `Ask.config.ts`). No git writes.
- No browser run against the real gateway (per plan). No repeat of any run. No call outside the three planned ones.
- `H:\chipint\develyst-ai\.env` never opened; no provider pinned (`GATEWAY_PROVIDER` unset — the gateway's own chain chose `deepseek`).

## Questions

**FQ50 (to Sober, non-blocking — AC-d judgement, not mine to make).** Run A's answer opens with "Yes." — a conclusion that she
*can* build a realtime WebSocket site, drawn from the backed YodBarber facts (claims 1–5). There is no line in either file that
says "can build"; every fact under the "Yes" is on a line. Is a capability conclusion from backed facts a "factual claim" for
AC-d, or is it the answer to the question? I recorded it unsoftened as table item 0 and left the answer text as the model wrote it.
If it counts as unbacked, that is an AC-d finding on this sample and the step-3 prompt would need a "state the evidence, do not
conclude" rule — a prompt edit plus a re-run on your written word.

> answer (Sober, 2026-09-13): **Backed — not an AC-d finding.** AC-d asks that every factual claim be *traceable* to the profile or live site copy, not that it be a verbatim line. "Yes" to "Can you build a realtime site with WebSocket?" is traceable to J:102 / J:105 / J:110 — a shipped, production, realtime WebSocket site in the owner's own approved `projects.ts` copy. It introduces no skill, client, date, number or name absent from the files, which is the SPEC's hard rule and the one thing that would embarrass him. The owner's own Q37 example question is a yes/no question; an answer forbidden from saying yes to it would fail his intent. Rule recorded as **SPEC-007 D15** and put to Porter → owner as **SQ38** (non-blocking, default = this reading). No prompt edit, no re-run.

**FQ51 (to Sober, non-blocking, FYI).** Run B's visitor-facing answer says "the owner" ("whether the owner has worked with it") —
that word comes from the step-3 system prompt ("…about the owner of a personal portfolio website…"), which the model echoed.
Visitors never see the word "owner" elsewhere on the site. A one-word prompt change ("Nichaphon" / "she") is within "wording is
Fern's" but would need a paid re-run to prove, so I did not touch it. Your call whether it rides on a later run.

> answer (Sober, 2026-09-13): Recorded, no action this round. The word is not false and appears only in a `none` answer; proving a one-word prompt change needs a paid run, and I will not spend one of the 23 on wording without Porter wanting it. Noted for Porter inside SQ38(b) — if he wants "Nichaphon"/"she", it rides on QA's real-browser run (one ledger row, my word).

**FQ52 (to Sober, non-blocking, FYI).** Step 2 on Run A returned two `weak` profile matches (the Frontend and Backend skill
lines) alongside the three strong YodBarber ones, and step 3 used the Backend one for its last sentence. All verified verbatim
(`dropped:0`), so nothing invented — but the answer's final sentence is about backend tools generally, not WebSocket. Recorded
as observed; no action proposed.

> answer (Sober, 2026-09-13): Recorded, no action. Passing every *verified* excerpt to step 3 regardless of `relevance` is D6 as written; the last sentence is true and backed (P:87–88), just less on-point. A "prefer strong matches" nudge in the step-3 prompt is a later polish, only worth a paid run alongside something else.

## Review
**Verdict: DONE — 2026-09-13 20:58, Sober.** Zero requests reached `https://ai.develyst.online` in this review; the ledger stays **7 / 30** (per the dispatcher's standing rule the recorded frames are the evidence, nothing was re-fired).

What I re-ran myself (read-only, no network):
- **Frames verbatim:** the three frame blocks and the log block pasted in §Implementation Notes are byte-identical (after CRLF→LF) to `project-docs/fe-task027-2026-09-13/run{A,B,C}.frames.jsonl` + `back.log` (`diff` empty ×4).
- **Call count:** `back.log` has exactly **7** `step=n ok` lines, 7× `retried=0`, 0× `retried=1`, 0 `fail`; frames carry 3 + 3 + 1 `status:"done"` and 7× `"retried":false`; `calls=` 3 + 3 + 1 = 7 = SPEC-007 §Call ledger running total. Cap 12 respected. (The "row written before the fire" ordering is Fern's stated procedure; file mtimes cannot prove order after the fact — taken on the record, consistent with the planned/actual columns.)
- **AC-d, my own trace of Run A's answer against `back/knowledge/` as it stands after TASK-021:** every line number in Fern's table is correct — J:98 heading, J:102 sentence (claims 1 + 5, verbatim), J:105 (claim 3, verbatim), J:110 (claim 4), P:87 (claim 6), P:86 + P:88 (claim 7 "Go"). The answer names **no skill, client, date, number or name absent from the two files**. Item 0 ("Yes.") — see FQ50 below: **backed, not a finding**.
- **D6 by script:** all 5 Run A citation excerpts are whitespace-normalised substrings of the loaded files (5/5 `VERBATIM`, hrefs `/portfolio` ×3, `/about` ×2). Run B `citations:[]`, Run C `citations:[]`.
- **Run B (AC-c):** `grep -ci kubernetes` = 0 / 0 re-run; step 2 `coverage:"none", matches:[]`; answer text asserts no Kubernetes work and points to `/contact`. Real example, not asserted — AC-c met.
- **Run C (D3/idea G):** one `step done`, `about_owner:false`, answer text = the constant in `back/src/chain/copy.ts:5` character-for-character, `calls:1`. Steps 2–3 have no `started` frame.
- **AC-f / AC-g re-run:** storage grep over `back/src` + `front/src` empty; `guard()` = `limits.ts:6` (no-op) called at `ws.ts:60` and `index.ts:63`; `ai.develyst.online` in `back/src` = `config.ts:48` only; `front/.next` (BUILD_ID 20:24, TASK-026's build) → 0 files for `ai.develyst.online`, 0 for `STEP: `; AC-g grep over the three raw frame files → 0 / 0 / 0.
- **No code changed:** no file under `back/src`, `back/scripts`, `back/test` or `front/src` has an mtime after 20:30; `git status` = the same 8 `M` + 6 `??` as after TASK-026 (`D1` @ `1dcc9b8`). `.env` not opened by me either.
- AC-e / AC-h evidence is TASK-026's stub-produced pictures, re-verified live in my TASK-026 review; nothing in this task could change them (no `front/` edit).

Open by design, for Porter (not REWORK): AC-a's "Home + real provider in one picture" and AC-d's **QA sample** are both **UNVERIFIED here** — a browser run against the real gateway costs 3+ calls of the 23 remaining and is Porter's/QA's round on my written ledger row. FQ50 → SQ38 (SPEC-007) so the owner can overrule my AC-d reading. FQ51/FQ52 recorded, no action, no re-run.

