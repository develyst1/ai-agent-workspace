# REQ-007: "Ask the AI about me" on Home — a visible multi-step reasoning chain
- Status: **DELIVERED 2026-09-13, Porter — 8 of 8 AC ticked.** AC-b/c/f/g on the 2026-09-13 acceptance pass
  (§Acceptance pass); **AC-a/d/e/h ticked on TEST-008 + TEST-009, both `TEST_PASSED` (Tanya)** — Home + the real
  provider in one picture, AC-d QA sample 6/6 backed, three failure pictures re-taken, 360 fold held — see §Delivery.
  **Ledger: TEST-009 `calls=3` relayed to Sober → `10 / 30` once rows 8–10 are filled.** Not signed off, not
  deployed. Q49 = 30 (§Owner decisions). NON-blocking and open, all his at sign-off: Q46 (default stands), Q50,
  **Q52** (H8 zero margin), SQ34–SQ38 (SPEC-007 §Questions), OBS-14/15/16 (TEST-009).
- Priority: HIGH
- Requested: 2026-09-09 by the owner (Nichaphon)
- Deadline: none stated
- Depends on: **REQ-005** (the profile file the AI answers from) and **REQ-006** (the
  `back/` service that calls the gateway). Neither may be skipped.

## Problem / Goal

The owner's words:

> "เพื่อเอาไปใช้กับเว็บนี้ ให้ทำหน้าแรก ให้มี feature ให้ถามเอไอ เกี่ยวกับฉันได้ เลย
> เช่น ทำเว็บ realtime by websocket ได้มั้ย / ทำ database อะไรเป็นบ้าง
> ก็ให้ ai ไปเอาคำถาม มีวิเคราะห์ ว่าเขาหมายถึงอะไร และ นำไปวิเคราะห์ จาก ข้อมูลของฉัน md
> ตัวนั้น มัน match กับคำถามยังไง และ วิเคราะห์อีกครั้งว่างั้นควรตอบเขายังไง ว่าอะไร
> จากข้อมูลของฉันนั้น
> คือฉันจะบอก ว่า ใช้ llm gate ซ้อนกันหลายครั้งได้ เพื่อเป็น step การคิด"

A visitor on the front page can ask a question about him and get an answer drawn from his
own profile. The point is **not** a chatbot. The point is that the answer is produced by
**several stacked gateway calls used as thinking steps** — understand the question, match it
against his profile, then decide how to answer — and that this is *his* architecture, on
*his* site, answering questions about *him*. The feature is simultaneously the demo and the
evidence.

Who it is for: a recruiter or a client who lands on the front page with a specific worry
("can he do realtime?", "has he used MSSQL?") and will not read six routes to find out.

## Owner decisions — 2026-09-09

**Q37 — ANSWERED:** *"ตัวอย่างคำถาม + เอา websocket จริง"* — two answers in five words.
(a) **Confirmed:** *"ทำเว็บ realtime by websocket ได้มั้ย"* and *"ทำ database อะไรเป็นบ้าง"* were
**example questions a visitor types**, exactly as Porter read them. (b) **He wants a real
WebSocket** as the transport — not HTTP streaming. Porter offered him both and said the team
had no preference; he chose the one he can then truthfully put on his resume, which is the
same reason this whole feature exists. **This is now an owner-mandated constraint, not a
design choice**, and it reaches REQ-006 as well (R3 there).

**Q38 — ANSWERED:** *"จำกัดนายจะทำยังไง ต้องมี postgres อีกเหรอ ไว้คราวหลัง แล้วกันตอนนี้ ปล่อย
ไม่จำกัดไปก่อน"* — he asked two questions back and then decided. **His decision: no cap this
round.** The endpoint ships open. **His two questions, answered:** a per-visitor cap does
**not** need Postgres — a count held in the service's own memory is enough while `back/` is
one process, and it forgets everything on restart, which is the *reason* it needs no database;
Postgres would only be required once the count must survive a restart or be shared across
several processes. So "a limit" and "a database" were never the same decision — but he has
deferred both, and both stay deferred. **Q44 (database) is answered by the same sentence:
later, not now.**

**Q49 — ANSWERED 2026-09-13:** *"Q49=30"* — **the REQ-007 real-call budget is 30 real calls**
against `https://ai.develyst.online` (≈ 10 visitor questions at three-plus calls each — Porter's
suggested figure in REQ-006 §Questions Q49, now his number). Recorded here because the ledger that
spends it is SPEC-007's (it opened at `0 / ?`; the `?` is now 30 — Sober's edit). **Separate from
REQ-006's 5** (3 spent, 2 unspent — their disposition is still his, SQ31). TASK-027's Q49 half is
cleared; its `PROFILE.md` half (TASK-021) is not yet. No number was invented: 30 was offered as a
figure to react to, and he said 30.

**Q45 — ANSWERED:** *"A B C D G H"* — exactly Porter's recommended v1.

| In | A starter chips · B show the thinking · C cited answers · D "answered by" badge · G stated boundaries · H graceful cap |
|---|---|
| **Out** | **E** (JD fit check) — his round two · **F** (answer in the visitor's language) — see **Q50** · **I** (unanswered-question list) — needed storage, and storage is deferred |

**H is in, but the cap it degrades to is gone (Q38).** These two answers were given in the
same breath and they collide: H exists to turn a spent budget into a controlled experience,
and there is now no budget to spend. H is **not** dropped — it is what stands between him and
a dead front page when the gateway is down, quota runs out at the provider, or the chain
errors. Its trigger changes from *"the cap is reached"* to *"the live chain cannot answer,
for any reason"*. Recorded here so nobody later reads H as cancelled by Q38.

## Requirement

1. The Home page must carry a place where a visitor types a question about the owner and
   receives an answer.
2. The answer must be produced by **at least three separate gateway calls**, each with its
   own job — as the owner described them:
   - **Step 1 — understand:** what is the visitor actually asking, and is it about him at all?
   - **Step 2 — match:** which parts of his profile (REQ-005) bear on that question, and how
     well do they actually match — including *not at all*.
   - **Step 3 — answer:** given the question and the matched evidence, what should be said,
     in what shape, and how long.
3. The answer must be built **only** from the profile file and already-published site
   content. When the profile does not cover the question, the system must **say so** rather
   than produce a plausible sentence. A portfolio that invents a skill is worse than one that
   admits a gap — and `PROTOCOL.md` already forbids invented facts about a real person.
4. The visitor must never wait in front of a blank screen: progress must be visible while
   the steps run. **The transport is a WebSocket** (Q37b, owner-mandated) and idea B (below,
   approved) is what travels over it: each step reported as it completes, not one silent wait
   followed by an answer.
5. The feature must survive its own failure: gateway unreachable, provider quota exhausted,
   or any step of the chain erroring must each leave the front page usable and say something
   honest. **The WebSocket adds two more failure modes that HTTP did not have** and they are
   part of this requirement: the connection never opening, and the connection dropping
   mid-chain. A half-finished answer must not be left on screen as if it were whole.
6. **No usage cap ships this round** — the owner's explicit call (Q38): the endpoint is open
   on the internet, with no auth in front of the gateway either (REQ-006 Q35), and every
   question costs him three-plus paid calls. What this REQ still requires is that the cap
   remain **cheap to add later**: the place where a per-visitor count would go must be a
   named, single point in the code, so switching it on is a small change and not a redesign.
   No counting is built now, and nothing is stored.
7. Nothing about the feature may put a provider key, a gateway URL or a prompt template in
   the browser.

## Ideas — the owner asked for better ones ("คิดไอเดียที่ดีกว่าออกมาให้ได้")

These are product options, offered for **his pick** (Q45). None is decided.

| # | Idea | Why it is worth it |
|---|------|-------------------|
| **A** | **Starter question chips** — 4–6 real questions under the input, e.g. his own two examples ("Can you build a realtime site with WebSocket?", "Which databases have you worked with?") | An empty input box gets ignored. Chips also let *him* choose which strengths get asked about most. |
| **B** | **Show the thinking, not just the answer** — render the three steps as they complete: "Understanding the question → Matching against 12 years of work → Writing the answer", each with the provider and time that served it | This is the whole differentiator. Every portfolio has a chat box; almost none *shows* a multi-step LLM pipeline running. It turns his architecture into something a recruiter can watch in 4 seconds. Porter's strongest recommendation. |
| **C** | **Cited answers** — every answer ends with where it came from ("from Portfolio → Develyst AI Gateway"), linked | Proves the AI is not inventing, and pushes the visitor deeper into the site instead of ending the visit at the chat box. |
| **D** | **"Answered by …" badge** — the gateway already returns `provider`, `model`, `latency_ms` and token usage; show them | A live, unfakeable demo of the cost-tier fallback chain that is the first line of his resume. Nearly free to build. |
| **E** | **Job-description fit check** — a recruiter pastes a JD; the same chain returns *matches / gaps / evidence*, honestly including the gaps | The highest-value idea for a portfolio whose job is to get him hired — it does the recruiter's work for them. Bigger build than A–D; a natural round two. |
| **F** | **Answer in the visitor's language** — Thai question, Thai answer; English question, English answer | The site is English today, but a Thai recruiter will ask in Thai. See Q39. |
| **G** | **Stated boundaries** — the AI answers about him and says plainly when a question is off-topic or uncovered | Prevents the failure that would actually embarrass him: his own site confidently claiming something he cannot do. |
| **H** | **Graceful cap** — when the daily budget is spent, the chips still answer from pre-written text and the page says the live AI is resting | Turns a cost limit into a controlled experience instead of an error state. |
| **I** | **A private "what nobody could answer" list** — questions the profile failed to cover, visible to him only | Tells him exactly what his portfolio is missing, in the words strangers use. Depends on Q44 (storage). |

**Porter's recommended v1: A + B + C + D + G + H.** They share one build, they need no
database, and together they say "this site is the system" without a single extra sentence of
marketing. **E** is the obvious round two. **I** waits on Q44.

## Acceptance Criteria

- [x] AC-a: On Home, a visitor can ask a free-text question and get an answer.
- [x] AC-b: One question demonstrably triggers **three or more** distinct gateway calls, and
      the intermediate results of each step are recorded (in a log or the response) so the
      chain can be inspected, not assumed.
- [x] AC-c: A question the profile does not cover produces an honest "not covered" answer —
      demonstrated with a real example, not asserted.
- [x] AC-d: An answer's every factual claim is traceable to the profile file or to live site
      copy. QA checks a sample; **one invented fact fails this REQ.**
- [x] AC-e: With the gateway unreachable, Home still renders and the feature says something
      honest — seen as a picture, not reasoned about. **Same for a WebSocket that never
      opens and one that drops mid-chain**: three pictures, not one.
- [x] AC-f: **No cap ships (Q38).** What is checked instead: the single named point where a
      per-visitor count would later go **exists and is documented**, and it is confirmed that
      **nothing about a visitor is stored** anywhere — no message text, no database, no file.
- [x] AC-g: No key, gateway base URL or prompt template is reachable from the browser —
      **including over the WebSocket**, which is a second channel into the same service and
      must be checked as one. Provider *names* are shown on purpose (idea D).
- [x] AC-h: Seen on a phone (360px) as well as desktop — the front page's opening block is
      already the site's most-tested surface and must not regress.

## Constraints

- Owner-mandated: the multi-step chain is the design intent, not an implementation detail —
  a single-call chatbot does not satisfy this REQ.
- Owner-mandated: **the transport is a real WebSocket** (Q37b). HTTP streaming is not an
  acceptable substitute even where it would be simpler — being able to say the site runs on
  a WebSocket is part of what he is buying.
- Owner-decided: **no usage cap, nothing stored** (Q38 / Q44), with the exposure recorded in
  REQ-006 §Owner decisions.
- Every answer costs three-plus real LLM calls on his account, and the test calls come out of
  **a budget of 30 real calls** — Q49, answered 2026-09-13, §Owner decisions.
- Home is the site's most-tested page (REQ-001/002 acceptance rounds, `tests/REGRESSION.md`).
  Anything added there is a regression risk and gets a QA round.

## Out of Scope

- Voice, avatars, or any interface other than typed question and answer.
- Letting the AI take actions (sending mail, booking anything).
- Ideas **E**, **F** and **I** — **decided out 2026-09-09 by Q45.** E is his stated round two;
  I depended on storage, which is deferred; F is out with a caveat, see **Q50**.
- Any usage cap, counter or stored transcript — **decided out by Q38 / Q44.**
- Re-designing Home. This adds one feature to the page as it stands.

## Questions

**~~Q37~~ ~~Q38~~ ~~Q45~~ ALL ANSWERED 2026-09-09** — his words and everything they settle
(including the H-vs-Q38 collision and the answer to *his* two questions back) are in
**§Owner decisions** at the top of this file.

**~~Q39~~ SUPERSEDED — folded into Q50 below.** Its written default was never consumed.

**Q50 (NEW 2026-09-09, NON-blocking) — what language does it answer in?** Two of his answers
point opposite ways and Porter will not pick between them on his behalf:
Q39's written default said **mirror the visitor** (Thai in → Thai out); Q45's list of chosen
ideas **omits F**, which is that same behaviour named as an idea. Either he refused F, or he
answered the blocking question and left the non-blocking default alone — both readings are
reasonable and only he knows which.
**Porter is deliberately NOT applying Q39's default**, because a default is only good while
nothing contradicts it, and Q45 contradicts it. **The hold, which blocks nobody:** the answer
language must be a **single isolated decision point** in the chain, so his one-word answer
later is a change to one place and not a rebuild. Until he answers, the site is English, as it
is today. Worth his attention: his site is in English but a large part of his network reads
Thai, and a Thai recruiter typing a Thai question is the exact visitor this feature is for.

**~~Q44~~ ANSWERED 2026-09-09** (*"ไว้คราวหลัง"*) — no database this round. Recorded in
REQ-006 §Owner decisions; idea I stays out because of it.

**Q46 (non-blocking, default written) — where on Home?** Default: the feature is **added**
below the existing hero, and **nothing currently on Home is removed or re-ordered**. If he
wants it to be the first thing a visitor sees, that is a different (larger) REQ and a new QA
round on the site's most-tested surface.

## Acceptance pass — Porter (PM), 2026-09-13

**REQ-007 stays `SPEC_DONE`. 4 of the 8 acceptance criteria are ticked (AC-b, AC-c, AC-f, AC-g); the
other four are held, and every one of them is held for the same reason: it asks to be SEEN — on Home, in a
real browser, by an eye that is neither the implementer's nor the reviewer's.** Nothing here is a complaint
about the work: TASK-027 fired exactly the 7 calls it planned (0 retries, 0 errors), Sober re-traced AC-d
himself line by line, and every frame is on disk in `../project-docs/fe-task027-2026-09-13/`.

### The four that closed

| AC | Closed on | The evidence, named |
|----|-----------|---------------------|
| AC-b | Porter 2026-09-13 | Run A (his own Q37 chip): three `step … done` frames, each carrying its own provider / model / latency / token usage and parsed result — `deepseek / deepseek-flash`, tokens 224/56/280 · 3504/251/3755 · 388/87/475 — plus three `[chain] step=n ok` log lines as the second, content-free record (SPEC-007 §Call ledger rows 1–3; TASK-027 §Implementation Notes). Sober re-checked the frames byte-identical to the raw files and `calls=` 3+3+1 = 7 = ledger. "Recorded in the response" is the honest reading of the AC's "log or response" — content is barred from logs by REQ-006 D9 / AC-f (SQ37b) |
| AC-c | Porter 2026-09-13 | Run B `Have you worked with Kubernetes?` — `kubernetes` = 0 hits in both knowledge files (Sober re-grepped); step 2 `coverage:"none", matches:[]`; the answer says the profile does not cover it and points to `/contact`; `citations:[]`; **no Kubernetes claim** (Fern + Sober, independently). A real example, not an assertion |
| AC-f | Porter 2026-09-13 | The single named point: `guard()` in `back/src/limits.ts:6` (a no-op), called once per ask on both channels (`ws.ts:60`, `index.ts:63`), documented in `back/README.md`. Nothing stored: `localStorage / sessionStorage / document.cookie / writeFile / appendFile` grep over `back/src` + `front/src` → empty (Fern, re-run by Sober); log lines carry kinds and lengths only. The exposure itself is his decision (REQ-006 §Owner decisions), recorded, not softened |
| AC-g | Porter 2026-09-13 | Over the WebSocket, checked as one channel: `ai.develyst.online` / `STEP: ` / `api_key` / `apiKey` / `Bearer` over the three raw frame files → 0 / 0 / 0; `ai.develyst.online` in `back/src` = `config.ts:48` only; last `front/.next` build → 0 files for the URL, 0 for `STEP: `. My own read-only check 2026-09-13: `front/README.md`'s new env table says the browser is told only where `back/` is (`NEXT_PUBLIC_ASK_WS_URL`, default `ws://localhost:3001/ws`), never where the gateway is. Provider *names* are shown on purpose (idea D). **TEST-009 reads the live frames in a real browser as belt-and-braces; a URL or prompt seen there reopens this tick** |

### The four that are open — and why each one is open

| AC | Why it is not ticked |
|----|----------------------|
| **AC-a** — on Home, free text in, answer out | Met in two halves that have never met each other: the UI on the stub (TASK-026, pictures by Fern, re-run live by Sober) and the real provider over the same `GET /ws` (TASK-027, no browser). **"Home + real provider in one picture" is UNVERIFIED by design** — Sober said so, Fern said so. This is what the owner actually wants to see |
| **AC-d** — every factual claim traceable; **QA checks a sample** | Fern's 7/7 table and Sober's independent re-trace are the implementer's and the reviewer's samples. The AC names QA's. Item 0 ("Yes.") is backed under SPEC-007 D15 — that reading goes to the owner as SQ38 and is not a hold here |
| **AC-e** — three failure pictures | The pictures exist (`../project-docs/fe-task026-2026-09-13/f1…f3`, desktop + phone) and Sober reproduced all three live — but they are the implementer's pictures of his own change, and TASK-026's DoD itself says *"QA re-takes them later"* |
| **AC-h** — seen at 360, hero fold not regressed | Measured (hero bottom 741 = section top 741, `scrollWidth` 360), unseen by an independent eye; Home is the site's most-tested surface and the REQ promised it a QA round |

### What is being asked of QA — two TEST files

Requested from Tanya via `inbox/QA.md`. **TEST-008 costs nothing and can run now. TEST-009 spends the
owner's real calls and may NOT start until SPEC-007 §Call ledger carries a row in Tanya's name** (Sober's
word, asked for via `inbox/SA.md` 2026-09-13; the SPEC's rule is "row before fire", and only Sober writes
there). If the row is not there when she opens the round, she runs TEST-008 only and says so.

**TEST-008 — the zero-cost half (REQ-005 AC-d — see that REQ's §Acceptance pass — plus REQ-007 AC-e / AC-h,
and REGRESSION on Home).** `back/` runs against the stub only (`GATEWAY_BASE_URL` → a stub or a dead port —
the recipe Fern and Sober used is in TASK-026 §Implementation Notes; the harness is
`../project-docs/fe-task026-2026-09-13/ask-harness.cjs`). Zero requests may reach `https://ai.develyst.online`.
1. **AC-e, three pictures at 1280 and 360, re-taken by her:** (1) `back/` not running → the section says the
   live AI cannot be reached, Home still usable; (2) `back/` up, its gateway dead → an honest failure at step 1;
   (3) the socket dropped mid-chain → steps marked interrupted and **no answer text left on screen** as if whole.
   Each with the retry control visible and the rest of Home intact.
2. **AC-h:** Home at 360×740 — hero fold unchanged (the section starts below the hero, nothing removed or
   re-ordered: Q46 default), no horizontal scroll in idle / running / answered / failed states.
3. **The stub happy path once, both sizes:** three steps painting in order with a provider·model·ms badge each,
   then the answer with ≥ 1 citation link, and the not-covered hint on `stub:none` — so the UI states are seen
   by QA before real money is spent on them.
4. **REGRESSION** on Home as she sees fit (her file), plus the counts: console errors / pageerrors / failed
   requests / non-local requests.

**TEST-009 — the real-gateway half (REQ-007 AC-a + AC-d QA sample + AC-g live), gated on the ledger row.**
`back/` on its **defaults** (real `back/knowledge/`, gateway = `https://ai.develyst.online`; `/health` must
show `profile:true, projects:true` first — TASK-027 §Startable has the recipe), the built `front/` served
locally, a real browser at 1280 (and the answered state at 360).
1. **Budget: ONE question, planned 3 calls, hard cap 5** (SPEC-007 D4: one retry per step at most). She
   writes the question, the clock time and the planned count in her TEST file **before** she presses Ask; the
   `back/` log's `calls=` line is the count she reports back. **A second question is not hers to fire** —
   a technical failure (unreachable, quota, timeout) is a real result: record it, do not retry, report.
2. **The question is hers to choose, not Run A's** — so the AC-d sample is independent — and must be one the
   profile can answer (not Kubernetes, not off-topic; `back/knowledge/PROFILE.md` + `PROJECTS.md` are hers to
   read first). Two safe examples: chip 2 *"Which databases have you worked with?"*, or a question about the
   RAG chatbot / the robotic kiosk.
3. **AC-a picture:** Home, the three steps painting with real provider badges, then the answer with its
   citation links — one picture is the whole point; a short capture of the steps landing is a bonus.
4. **AC-d QA sample:** every factual claim in the answer text, one row each, beside the line of `PROFILE.md`
   or `PROJECTS.md` it comes from. **One claim with no line = `TEST_FAILED`** — she reports it plainly and does
   not soften it. A capability "Yes/No" drawn from backed facts is **not** a claim by itself (SPEC-007 D15,
   owner may overrule via SQ38) — she notes it, does not fail on it. Also: no reference name, no "Chatuchak",
   no third-party phone anywhere in the answer (REQ-005 Q41).
5. **AC-g live:** the frames as the browser received them — no `ai.develyst.online`, no `STEP: `, no key-like
   string; and the citation links actually resolve to a local route.
6. She never opens `develyst-ai`'s `.env` or any `.env`; never pins a provider; never touches
   `portfolio.develyst.online`; stops `back/` and frees her ports when done; port 3000 is foreign, untouched.

**Standing facts she must be given, not left to discover:** (a) the timeline shows steps 2–3 as "Waiting" on an
off-topic stop — true, not a defect (SQ37a / FQ46); (b) the `none` answer says "the owner" — a prompt echo,
known, SQ38(b), not a defect; (c) `front/.next` holds Sober's TASK-026 build (`Twf3FOdhYYaVXTKRSnGEp`, my read
2026-09-13) — serve it or clear it, never `npm run dev` on top of it; (d) the two starter chips are the only
chips (SQ34 default); (e) this is the first time QA fires the owner's real calls — his budget (Q49 = 30) is
the authority, the ledger row is the mechanism, and her TEST file is the count's second record.

### What QA is deliberately NOT asked
No re-trace of Run A (done twice), no re-run of Runs B / C (paid; their frames are the record), no judgement of
the answer's *quality* or the section's look (the owner's eye), no full REGRESSION re-run beyond Home.

### What `SPEC_DONE` means right now
Not `DELIVERED`, not signed off, not deployed. Ledger `7 / 30`; TEST-009 would take it to at most `12 / 30`.
`back/` and thirteen `front/` files are uncommitted on `D1` (`1dcc9b8`); the WS URL is baked at build time and
is `ws://localhost:3001/ws` — deploy-day facts are SQ36 / Q43, the owner's. SQ34–SQ38, Q46, Q50 survive this
pass, non-blocking, and go to him at sign-off.

## Delivery — Porter (PM), 2026-09-13

**REQ-007 is `DELIVERED`: 8 / 8.** AC-b / c / f / g closed in §Acceptance pass above; the four held ACs closed on the
two QA rounds — `tests/TEST-008-req005-strings-and-req007-stub-pictures.md` (zero cost, `TEST_PASSED` 24/24) and
`tests/TEST-009-req007-real-gateway-in-a-real-browser.md` (real gateway, `TEST_PASSED`, **`calls=3`** — planned 3,
cap 5, 0 retries, one press). Every verdict is taken as written; nothing is softened or re-read by me.

| AC | Closed on | The evidence, named |
|----|-----------|---------------------|
| AC-a | Porter 2026-09-13, on TEST-009 case 1–2 | Home + the real provider **in one picture**: `../project-docs/qa-test009-2026-09-13/06-answered-desktop.png` — a question typed by hand (not a chip), three steps painting in order with real `deepseek · deepseek-flash` badges (607 / 1638 / 1256 ms, matching the `back/` log line for line), then a 565-character answer with five citation links, `Ask` re-enabled; the answered state legible at 360×740 too. The two halves that had never met (UI on the stub, provider without a browser) met, seen by an eye that is neither Fern's nor Sober's |
| AC-d | Porter 2026-09-13, on TEST-009 §AC-d | QA's own sample, independent of Run A: **6 claims, 6 backing lines (`PROFILE.md` L23–L32), 0 invented**; no reference name, no "Chatuchak", no phone, no third party in the answer (Q41); the five `citations[]` excerpts equal step 2's five `matches[]` one-for-one (D6). No capability "Yes/No" in this answer, so D15 / SQ38 was not exercised — SQ38 stays with the owner as before |
| AC-e | Porter 2026-09-13, on TEST-008 B1–B3 | Three pictures, **re-taken by QA** at 1280 and 360 on the stub: (1) `back/` down → `The assistant could not be reached.`; (2) gateway dead → `The AI gateway could not be reached.` at step 1 (`fail kind=unreachable at_step=1 calls=0`); (3) socket killed mid-chain → step 1 keeps its badge, steps 2–3 `Interrupted`, `The connection dropped before the answer was finished.`, **answer blocks on screen = 0**. Each with `Try again` visible and the hero / second `<h2>` / footer intact. 0 requests reached `ai.develyst.online` |
| AC-h | Porter 2026-09-13, on TEST-008 B6–B8 (+ TEST-009 case 2) | At 360×740: hero bottom = Ask section top (788.41 = 788.41), `main` order unchanged (Q46 default), `scrollWidth` 345 ≤ 360 in all eight states incl. the real answered state; REGRESSION H8 **PASS — with zero margin**: quote line box 713.41–740.41 on a 740 fold, all six hero items legible. **The margin was spent by REQ-005's longer role + lead (his words), not by this REQ** — the Ask section starts at the hero's bottom and changes nothing inside it. Ticked on that reading; the margin itself goes to the owner as **Q52** (overrulable — if he wants margin back, that is a copy/layout decision, his, then Sober) |

### Ledger
`calls=3` + the verdict relayed to Sober via `inbox/SA.md` 2026-09-13 (his to fill SPEC-007 §Call ledger rows 8–10;
rows 11–12 unused return to unallocated). **`7 / 30` → `10 / 30`** on the SPEC once he writes it; 20 remain.

### Carried to the owner at sign-off (not defects — his eye or his prompt call, via Sober)
- **OBS-14** (TEST-009) — the real *covered* answer says "the owner shipped" / "The owner led": the third-person voice
  already flagged for the `none` answer (SQ38(b)) appears in a covered answer too. Facts right, voice not the site's
  ("I"). Rides with SQ38(b) as one prompt-wording question; Sober told (FYI, no task until the owner says).
- **OBS-15** (TEST-009) — step 2 judged `coverage:"partial"` although every claim traced; the UI shows nothing for
  "partial" (per SPEC only `none` gets a hint). FYI to Sober; nothing visible to a visitor.
- **OBS-16** (TEST-009) — the five `Sources` links carry the same label five times (the profile section heading), told
  apart only by the excerpt under each. A look matter — what he sees in `06-answered-desktop.png`.
- **Q52** (H8 zero margin, from REQ-005's strings — see REQ-005 §Delivery), Q46, Q50, SQ34–SQ38 — unchanged.

### What DELIVERED means right now
Not signed off, not deployed. `back/` and thirteen `front/` files are uncommitted on `D1` (`1dcc9b8`); the WS URL is
baked at build time and is `ws://localhost:3001/ws` — deploy-day facts are SQ36 / Q43, the owner's. **REQ-008 (2026-09-13)
moves `back/` to port 4014 by env — the front's default WS URL is one of the places that must follow; that is Sober's
to reconcile under REQ-008, not a REQ-007 defect.**
