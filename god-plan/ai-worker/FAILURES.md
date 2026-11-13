# FAILURES — this team's own defect log

> **Append-only. Newest first. Never compacted, never summarised, never deleted.**
>
> This is not a log of product bugs — those live in TEST files and REQs. This is
> where **the workforce records its own defects**: a rule broken, a fact relayed
> unverified, a step left out, an ask turned into a project, work reported done
> that was not.
>
> **Why it exists:** a role cannot fix its own decay. It can only *notice* and
> *record*. Atlas reads this file, designs the fix, and Marie installs it. An
> entry that is never written is a defect that will repeat forever.

## When you MUST write an entry — not optional, not a judgement call

Write **before your next reply**, not at session end. One incident = one entry.

1. **The owner corrects you** — a fact, a scope, a tone, a language, an
   assumption. Any correction at all.
2. **A verdict goes against you** — `REWORK` from the SA Lead, `TEST_FAILED`
   from QA, a defect found in work you called finished.
3. **A routing violation** — yours, or one you caused by addressing the wrong role.
4. **You relayed something that turned out to be wrong**, even if you were
   repeating someone else in good faith. *Especially* then.
5. **You gave the owner an instruction that was incomplete** and he had to come
   back, guess, or ran the wrong thing.
6. **You broke a written rule** — even once, even if nobody noticed but you.

Being the one who records it is not a confession. **Not recording it is the
defect.**

## What an entry looks like — and how it gets in

Write the entry to a scratch file, leaving the heading as `F-NNN`, then run
`node ai-worker/add-failure.mjs <that file>`. The tool gives it the next id under
a lock, sets `Status: NEW`, puts it directly under the marker line at the bottom
of this header, and prints the id. **Never pick a number yourself and never paste
an entry into this file by hand** — two roles taking "the next number" at the
same moment is how ids collided before.

```markdown
## F-NNN — YYYY-MM-DD — <Role> — <one line: what went wrong>
- **Status:** NEW
- **What happened:** two or three sentences, no softening. What you did, what
  the correct thing was, and how it surfaced.
- **Rule involved:** the rule you broke — quote it and say where it lives.
  If there was NO rule covering this, write `NONE — no rule covered it`.
  (That answer is more useful than a rule you can name, so do not invent one.)
- **How it was caught:** the owner / QA / SA / yourself — and how late.
- **Cost:** what it actually cost — a wasted round trip, a wrong deploy, an
  hour of the owner's time, a feature shipped unusable.
- **Evidence:** `log/YYYY-MM-DD.md`, an inbox line, a TASK section, a screenshot.
```

Numbering is continuous per project (`F-001`, `F-002`, …) and comes from
`add-failure.mjs`, never from you. Never renumber.

## Status values — only Atlas changes these

| Status | Meaning |
|---|---|
| `NEW` | written, not yet reviewed. **The hygiene gate counts these.** |
| `ATLAS-REVIEWED YYYY-MM-DD` | Atlas has read it; the fix is designed or the pattern is noted |
| `FIXED YYYY-MM-DD — <what changed>` | a rule, a template or a check now covers it |
| `ACCEPTED YYYY-MM-DD — <why>` | the owner or Atlas decided to live with it; recorded so nobody re-raises it |

**A role may only add an entry and set `NEW`.** You never grade your own failure,
never close one, and never edit someone else's entry.

## The route — how this reaches Atlas

Roles cannot call Atlas; only the owner can. So the gate does the calling:
`check-hygiene.mjs` counts `Status: NEW` entries and prints them in its output,
where the owner sees them. When he is ready he opens Atlas with
`อ่าน ATLAS.md — review FAILURES ของ god-plan`.

**Nobody needs to remember to escalate.** That is the whole point.

---

<!-- newest entry goes directly below this line -->

## F-010 — 2026-11-09 — BE — TASK-018: cleared a log before reading the failure it held
- **Status:** ACCEPTED 2026-11-13 — closed unreviewed on the owner's word (via Atom 09:37): "เรื่อง Failures ให้ปิดทิ้งหมด เพราะฉันไม่เชื่อ ตอนนี้" (DECISIONS.md 2026-11-13). Status set by Atlas.
- **What happened:** during the DEF-2 reproduction the invite-accept call returned 500 once. In the same shell command I restarted the diagnostic back and truncated its log file (`: >log`) before reading the new error line, so the cause of that third 500 is lost. The two other causes were captured, and the third could not be re-created on demand.
- **Rule involved:** NONE — no rule covered it. (Closest: `check-by-running-not-reading.md` and `reproduce-first.md`: the evidence of a failure is the point of the run, and I destroyed part of it.)
- **How it was caught:** myself, one command later, when I went to read the log.
- **Cost:** one error line of evidence (the invite-accept 500); the analysis went on with the other two causes. Rule of thumb I now follow: read or copy a log before anything clears or restarts it.
- **Evidence:** `tasks/TASK-018-be-error-logging-and-def2-real-db-signin.md` §Implementation Notes, step 2.

## F-009 — 2026-11-09 — QA — Timed AC-8 on a machine that pauses, and stated where DEF-1 lives as fact
- **Status:** ACCEPTED 2026-11-13 — closed unreviewed on the owner's word (via Atom 09:37): "เรื่อง Failures ให้ปิดทิ้งหมด เพราะฉันไม่เชื่อ ตอนนี้" (DECISIONS.md 2026-11-13). Status set by Atlas.
- **What happened:** In TEST-001 round 2 (2026-11-08) I reported DEF-1 (MAJOR, AC-8) and wrote that it "lies between the front's `/api` proxy and the back; the back alone always answers on time". I based that on wall-clock durations (5/9 proxy calls late, 9/9 direct calls on time). I never checked whether the machine's clock and scheduler were steady during those calls. In round 3 (2026-11-09), with `timer-stall-detector.mjs` running beside each call, every late call contained a whole-machine pause of 8–288 s that ended when the call ended. There was no late call while the detector was quiet. So round 2's localisation was not sound evidence, and TASK-014 (a new proxy route) was built partly on it.
- **Rule involved:** role-qa §1 *"Knows the limits of every instrument … and states which one each result came from"* and §6 *"A timed wait written as 'never' … Anything you conclude on top of an unproven observation inherits its uncertainty"*. The clock was the unproven instrument. No written rule tells QA to verify the machine is not pausing before a timing verdict: `NONE — no rule covered that step specifically`.
- **How it was caught:** the FE (Fern) found the pauses with a stall detector while doing TASK-014. The SA routed it to QA as Q-F6. QA confirmed it in round 3, one day later.
- **Cost:** one TASK (TASK-014) whose cause premise is unproven. A REQ was held at TEST_FAILED for about a day. The SA's F-008 causal link is now unproven too.
- **Evidence:** `tests/TEST-001-req-001-first-release.md` §Round 2, §Round 3 (detector table), §Defects DEF-1; `tasks/TASK-014-fe-explicit-api-proxy-route-def1.md` §Implementation Notes "Finding", §Questions Q-F6.

## F-008 — 2026-11-08 — SA — SPEC-002 put every API call through Next's rewrite proxy without checking its timeout or error behaviour; AC-8 failed through it (DEF-1)
- **Status:** ACCEPTED 2026-11-13 — closed unreviewed on the owner's word (via Atom 09:37): "เรื่อง Failures ให้ปิดทิ้งหมด เพราะฉันไม่เชื่อ ตอนนี้" (DECISIONS.md 2026-11-13). Status set by Atlas.
- **What happened:** SPEC-002 §Overview chose `next.config` `rewrites()` to proxy `/api/*` to the back, for one origin and a first-party cookie. I set a timeout budget for the back (25 s), for Bun's `idleTimeout` (30 s, after TASK-006) and for the browser (28 s), but never for the proxy in between. Next's rewrite proxy (`next/dist/server/lib/router-utils/proxy-request.js`) has its own 30 s `proxyTimeout` and answers any proxy error with 500 "Internal Server Error". TEST-001 round 2: 5/9 hung AI calls through `/api` ended after 42–237 s, with `socket hang up (ECONNRESET)` in the front log. Direct to the back, 9/9 ended at 25 s. QA set TEST_FAILED on AC-8 (DEF-1, MAJOR).
- **Rule involved:** role-sa §3: "Every contract states path/method/auth … status codes, error bodies"; §6: "Designing from structure, not code: a route table … none is the behaviour. Open the file that runs." I treated the rewrite as a pass-through and didn't open its implementation.
- **How it was caught:** QA, in round 2. An earlier single occurrence (OBS-1) was hardened in TASK-013 along a different path (a stalled body), which was real but not this. About 3 h after the SPEC, before any deploy.
- **Cost:** REQ-001 line stopped (TEST_FAILED), QA rounds 2 and 3, one more FE TASK. TASK-013 fixed a real but different gap.
- **Evidence:** `tests/TEST-001-req-001-first-release.md` §DEF-1 · `requirements/REQ-001-…` §Defects to fix · `specs/SPEC-002-…` §Overview (struck line) · `god-plan-front/next.config.ts` (rewrites).

## F-007 — 2026-11-08 — QA — Reported a "missing" 429 wording that REQ-001 already had
- **Status:** ACCEPTED 2026-11-13 — closed unreviewed on the owner's word (via Atom 09:37): "เรื่อง Failures ให้ปิดทิ้งหมด เพราะฉันไม่เชื่อ ตอนนี้" (DECISIONS.md 2026-11-13). Status set by Atlas.
- **What happened:** In the TEST-001 dry-run note and in my inbox line to the PM (19:4x), I said the D1 guard's 429 had no user-facing wording in REQ-001. REQ-001 lines 129–130 already held `RATE_LIMITED` and `AI_BUSY` strings, added for SPEC-002 Q-S2. I had read REQ-001 around 02:00 and did not re-read its wording table before writing the claim at 19:4x.
- **Rule involved:** workforce-protocol §3 "Re-read board, inbox and today's log before acting — your memory of them goes stale the moment another role writes to disk" (applied to the REQ I was citing), and AGENTS-DISCIPLINE "Evidence before assertion". The claim was a statement of fact about a file I did not open at the time.
- **How it was caught:** the PM, on his next read (inbox/QA.md 19:59), one round trip later.
- **Cost:** one wasted PM read and reply; a false gap would have reached the owner if relayed.
- **Evidence:** `tests/TEST-001-req-001-first-release.md` §Dry run (struck line); `inbox/PM.md` my 19:4x line; REQ-001 lines 129–130; `log/2026-11-08.md` Tanya 19:59.

## F-006 — 2026-11-08 — BE — TASK-006 REWORK: stub `malformed` mode returned a well-formed 200 instead of a non-JSON body
- **Status:** ACCEPTED 2026-11-13 — closed unreviewed on the owner's word (via Atom 09:37): "เรื่อง Failures ให้ปิดทิ้งหมด เพราะฉันไม่เชื่อ ตอนนี้" (DECISIONS.md 2026-11-13). Status set by Atlas.
- **What happened:** I built the stand-in's `malformed` mode as `success:true` with `content: "not json ["`, exactly as SPEC-002 §Testability P1 then said. That is valid JSON, so S2 stored it as a summary and only G1 failed. I saw the mismatch with QA's AC-8 reading ("malformed" should fail both endpoints) while writing, and raised it as a decision in the TASK notes, but I shipped to REVIEW without asking the SA first. The SA returned REWORK, tracing the cause to the SPEC (SA's F-005).
- **Rule involved:** NONE — no rule covered it. (Closest: role-be "ask about everything someone outside can see", since the stub's behaviour is what QA sees; I decided it myself and declared it instead of asking before hand-off.)
- **How it was caught:** the SA at review, about 25 minutes after hand-off.
- **Cost:** one rework round trip; no wrong data shipped.
- **Evidence:** `tasks/TASK-006-be-ai-endpoints-and-gateway-stub.md` §Implementation Notes decision 1 and §Review.

## F-005 — 2026-11-08 — SA — SPEC-002 defined the stand-in's `malformed` mode so it could not meet AC-8 for the summary
- **Status:** ACCEPTED 2026-11-13 — closed unreviewed on the owner's word (via Atom 09:37): "เรื่อง Failures ให้ปิดทิ้งหมด เพราะฉันไม่เชื่อ ตอนนี้" (DECISIONS.md 2026-11-13). Status set by Atlas.
- **What happened:** SPEC-002 §Testability P1 defined stub mode `malformed` as a valid gateway reply whose `content` is `"not json ["`. REQ-001 AC-8 (QA's check) expects "an empty or malformed answer → the AI error, nothing saved" for **any** AI call. S2 (summary) rightly accepts any non-empty text, so under my definition `malformed` makes S2 store junk and return 200. Jason built the stub exactly to the SPEC, noticed the gap, and flagged it as his decision 1. Fixed by redefining `malformed` as an HTTP 200 whose body is not JSON.
- **Rule involved:** role-sa §3: "Every contract states … status codes, error bodies"; "if the two sides disagree once built, the defect is in your SPEC". I didn't simulate each stub mode against each endpoint's ACs.
- **How it was caught:** the BE, at TASK-006, before QA ran. Caught by the SA at review, the same day.
- **Cost:** one REWORK round on TASK-006 (a one-line stub change) and one SPEC amendment. QA had not run it yet.
- **Evidence:** `specs/SPEC-002-first-release-design.md` §Testability (amended) · `tasks/TASK-006-be-ai-endpoints-and-gateway-stub.md` §Implementation Notes decision 1, §Review.

## F-004 — 2026-11-08 — SA — typed a `sed -i` on a TASK file in a Bash call
- **Status:** ACCEPTED 2026-11-13 — closed unreviewed on the owner's word (via Atom 09:37): "เรื่อง Failures ให้ปิดทิ้งหมด เพราะฉันไม่เชื่อ ตอนนี้" (DECISIONS.md 2026-11-13). Status set by Atlas.
- **What happened:** While amending TASK-010 (comp redo, two layouts), I ran `sed -i.bak 's#…#…#' tasks/TASK-010-…md` to rename one path. The workspace hook `scripts/hooks/block-shell-edits.sh` blocked it, so nothing was written. The correct tool was the editor (Edit), which I had used for the two edits just before.
- **Rule involved:** `PROTOCOL.md` § Editing files: "Never pass file content through a double-quoted shell string — no `node -e`, `sed -i`, `perl -i` … Allowed, and only these: the editor tool; a script fed by a quoted heredoc that asserts one match." Also `workforce-protocol` §7.
- **How it was caught:** the hook, immediately. Also by me, on reading the error. The same shape as F-001 (PM), same day.
- **Cost:** none to files, one blocked call. The risk: on a vendor or machine without the hook, the same habit would have rewritten the file unchecked.
- **Evidence:** this session's Bash call on `tasks/TASK-010-fe-ac10-comp-heroui-redo.md`, 2026-11-08 ~13:3x. The hook message names `block-shell-edits.sh`.

## F-003 — 2026-11-08 — SA — picked "no component library" for the front without checking the owner's house UI pattern; the comp built on it was rejected
- **Status:** ACCEPTED 2026-11-13 — closed unreviewed on the owner's word (via Atom 09:37): "เรื่อง Failures ให้ปิดทิ้งหมด เพราะฉันไม่เชื่อ ตอนนี้" (DECISIONS.md 2026-11-13). Status set by Atlas.
- **What happened:** In SPEC-002 §Overview I wrote "Tailwind CSS. No component library. `[SA-decided]`" and cut TASK-002 as a hand-styled static HTML comp. I reviewed it DONE on DoD evidence (contrast, layout, strings). The owner rejected it at 13:17: *"ไม่ดีเลยควร base on heroUI และ ทำการปรับปรุงให้สวยกว่านี้"*. The workspace already had his house pattern skill `nextjs-heroui-pattern` (Next 16 + HeroUI v3, pinned lockset). Other desks' SYSTEM-FACTS also show he picks the UI stack himself (possibility D3: Next.js + Mantine "based on the workspace skill nextjs-pattern-generator"). I didn't look for either before deciding.
- **Rule involved:** role-sa §3 / §6 — "Measuring what you can compute instead of what was asked … the operator's yes on a one-screen comp is AC-1; numbers are supporting evidence." Also role-sa routing table: "Desk stack is … Next.js (and the desk adopts the house pattern) → `anthropic-skills:nextjs-pattern-generator`". I treated the UI library as an internal choice, when it is what a user sees.
- **How it was caught:** the owner, at AC-10, about 2 h after the SPEC was written. The gate worked as designed. The cost landed before the full build.
- **Cost:** one FE comp built and thrown away, one SA review that passed it, and one owner look spent on it.
- **Evidence:** `specs/SPEC-002-first-release-design.md` §Overview (as of 02:1x) · `tasks/TASK-002-fe-ac10-comp-project-page.md` §Review · `DECISIONS.md` 2026-11-08 13:17 · `SYSTEM-FACTS.md` §AC-10 comp rejected.

## F-002 — 2026-11-08 — PM — AC-10 comp rejected; the owner's UI-library preference was never asked or looked up
- **Status:** ACCEPTED 2026-11-13 — closed unreviewed on the owner's word (via Atom 09:37): "เรื่อง Failures ให้ปิดทิ้งหมด เพราะฉันไม่เชื่อ ตอนนี้" (DECISIONS.md 2026-11-13). Status set by Atlas.
- **What happened:** The PM put the first AC-10 comp (TASK-002, plain inline CSS) to the owner. He rejected it at 13:17: "ไม่ดีเลยควร base on heroUI และ ทำการปรับปรุงให้สวยกว่านี้". Neither REQ-001 nor the PM's Q4 decision pack named a UI library, although the workspace carries an owner skill `anthropic-skills:nextjs-heroui-pattern` (one of three Next.js UI patterns) that hinted at his preference. The PM relayed the comp after checking only content (strings, synthetic data, layout), not whether its look matched what he uses.
- **Rule involved:** NONE — no rule covered it (role-pm §10a "simulate before you ask" is close: the Q4 pack covered stack but not the UI kit).
- **How it was caught:** the owner, at AC-10 — the gate worked, one comp round late.
- **Cost:** one comp built and rejected (TASK-002); TASK-007 waits for a second comp; one owner review spent.
- **Evidence:** `SYSTEM-FACTS.md` §AC-10 comp rejected; `DECISIONS.md` 2026-11-08 13:17; `log/2026-11-08.md`.

## F-001 — 2026-11-08 — PM — typed a `sed -i` in a Bash call
- **Status:** ACCEPTED 2026-11-13 — closed unreviewed on the owner's word (via Atom 09:37): "เรื่อง Failures ให้ปิดทิ้งหมด เพราะฉันไม่เชื่อ ตอนนี้" (DECISIONS.md 2026-11-13). Status set by Atlas.
- **What happened:** While logging the delegation round, the PM chained a leftover `sed -i '…' /dev/null` (a no-op aimed at nothing, from an abandoned board edit) into the same Bash call as `append-log.mjs`. The workspace hook blocked the whole call, so the log entry did not land and had to be re-run. No file was changed. The correct thing was the editor tool only, which the PM then used for the board edit.
- **Rule involved:** `PROTOCOL.md` § Editing files — "Never pass file content through a double-quoted shell string — no `node -e`, `sed -i` …"; workforce-protocol §7.
- **How it was caught:** the PreToolUse hook `block-shell-edits.sh`, immediately; then the PM.
- **Cost:** one blocked call, one re-run of the log append. No damage.
- **Evidence:** `log/2026-11-08.md` (Porter entry after 01:25, written on the second try).
