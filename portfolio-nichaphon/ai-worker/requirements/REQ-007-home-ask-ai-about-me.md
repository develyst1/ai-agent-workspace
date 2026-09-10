# REQ-007: "Ask the AI about me" on Home — a visible multi-step reasoning chain
- Status: **READY_FOR_SA** — unblocked 2026-09-09 by the owner's answers to Q37 / Q38 / Q45
  (recorded in §Owner decisions below). **Build order still holds: REQ-005 and REQ-006 land
  first.** NON-blocking and open: Q46 (default stands), Q49 (in REQ-006), Q50 (new).
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

- [ ] AC-a: On Home, a visitor can ask a free-text question and get an answer.
- [ ] AC-b: One question demonstrably triggers **three or more** distinct gateway calls, and
      the intermediate results of each step are recorded (in a log or the response) so the
      chain can be inspected, not assumed.
- [ ] AC-c: A question the profile does not cover produces an honest "not covered" answer —
      demonstrated with a real example, not asserted.
- [ ] AC-d: An answer's every factual claim is traceable to the profile file or to live site
      copy. QA checks a sample; **one invented fact fails this REQ.**
- [ ] AC-e: With the gateway unreachable, Home still renders and the feature says something
      honest — seen as a picture, not reasoned about. **Same for a WebSocket that never
      opens and one that drops mid-chain**: three pictures, not one.
- [ ] AC-f: **No cap ships (Q38).** What is checked instead: the single named point where a
      per-visitor count would later go **exists and is documented**, and it is confirmed that
      **nothing about a visitor is stored** anywhere — no message text, no database, no file.
- [ ] AC-g: No key, gateway base URL or prompt template is reachable from the browser —
      **including over the WebSocket**, which is a second channel into the same service and
      must be checked as one. Provider *names* are shown on purpose (idea D).
- [ ] AC-h: Seen on a phone (360px) as well as desktop — the front page's opening block is
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
  a budget he has not yet set for this REQ — see **Q49** in REQ-006.
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
