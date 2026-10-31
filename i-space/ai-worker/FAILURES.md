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
`อ่าน ATLAS.md — review FAILURES ของ i-space`.

**Nobody needs to remember to escalate.** That is the whole point.

---

<!-- newest entry goes directly below this line -->

## F-063 — 2026-10-31 — QA (Tanya) — My `next dev` with an unlisted `NEXT_DIST_DIR` (`.next-q`) rewrote blueprint-front's tracked `tsconfig.json`
- **Status:** NEW
- **What happened:** In TEST-125 (REQ-127 AC-5) I ran `NEXT_DIST_DIR=.next-q bun run dev` in the owner's blueprint-front checkout. Next added `.next-q` to the tracked `tsconfig.json` `include` and rewrote the whole file with LF line endings — a product-repo change by QA. I saw it in `git status` at the round's end, removed the two lines with the editor and restored CRLF; tree-fp is back to the start value 219729729f1a, `git status` = the 4 closed-list paths only. The correct move was a dist name the repo already lists (`.next-qa`), or the default.
- **Rule involved:** SYSTEM-FACTS § "Machine and repo facts" (F-003): *"a `NEXT_DIST_DIR` name Next.js has not seen is added to the tracked `tsconfig.json` `include`. Use … another name `maps/` lists"*; QA.md card: *"Put anything into a product repo"* — 🚫.
- **How it was caught:** myself, by `git status` + tree-fp before the verdict, same round.
- **Cost:** ~5 min; the tested tree was briefly not the SA's tree. No commit, no other role affected.
- **Evidence:** `tests/TEST-125-blueprint-deploy-ready-build.md` § Test data created; `log/2026-10-31.md` Tanya entry.

## F-062 — 2026-10-31 — PM (Porter) — A one-line build ask took over an hour and I did not notice the front engineer stopped for 53 minutes
- **Status:** NEW
- **What happened:** REQ-127 (standalone front + Bun binary, build config only) arrived 16:57. Back DONE 17:39; Fern edited the front files at 17:10 and went idle without building. I only watched my own inbox, so nobody noticed until the owner asked 18:03: *"ทำไมนานจังวะ … แค่นี้ ฉันทำเองแปปเดียวเองนะ"*. I also cost ~10 min writing the branch default, then reversing it.
- **Rule that should have caught it:** PM.md "never make the operator the one who notices a problem"; card habit "a role busy/idle for long — check its TASK change time".
- **Proposed fix (Atlas to judge):** for a small build-config ask, the PM checks TASK files' mtime after each hand-off it is waiting on, not only its inbox; and settles the checkout question with one look at where the team's sessions run before writing a default.



## F-061 — 2026-10-31 — QA (Tanya) — I wrote TEST-124 round 1 case 6 as PASS while the run's own output had a BAD line for it, and I did not name that line
- **Status:** CLOSED 2026-10-31 — owner: "ปิดไปให้หมด เลย ช่างมันเริ่มใหม่". Reviewed by Atlas; no fix installed (ATLAS.md § FAILURES review i-space F-044…F-061).
- **What happened:** at 02:32 I wrote TEST-124 case 6 (AC-4, a Chrome profile refused at done, CAW deletes nothing) as PASS, citing `s19-run1.json`. The same run's output `r126-s19.out` had `BAD … AC-4 a Chrome profile … CAW deletes nothing`. The 409 and its message were right; the BAD came from my check also asking that the folder still existed, after the stub worker's own second turn had removed it. So the substance held, but the PASS sat on evidence with an unexplained BAD. I found it at 05:0x, when the round-2 regression showed the same line, and traced it to the hop records.
- **Rule involved:** role-qa §3 "Every PASS and FAIL has evidence a reader can open" and "a script's own success is not proof" — a BAD line in the evidence must be explained before a PASS.
- **How it was caught:** by me, in REQ-126 round 2's regression, 2026-10-31 05:0x.
- **Cost:** none to the product (the behaviour was right); the round-1 TEST read cleaner than its evidence. Now explained in TEST-124 § Round 2, case 9.
- **Evidence:** `tests/harness/test-126/r126-s19.out` line 1; `r126-r2-regression.out`; `tests/TEST-124-chat-answers-plan-copy-temp-folders.md` § Round 2 case 9.
- **Suggestion (for Atlas):** before a verdict, QA greps the run's output for `^BAD` and every hit is either the FAIL or a named harness line in the TEST — never silently absent.

## F-060 — 2026-10-31 — SA (Silver, Team B) — I wrote "04:31" / "04:3x" into TASK-171 § Review while the `date` printed in that turn read 04:28
- **Status:** CLOSED 2026-10-31 — owner: "ปิดไปเลย", an environment / clock problem of the Grok-bot box the desk ran on, not a process defect. No fix.
- **What happened:** I printed `date` (04:28) in one call, then wrote the TASK-171 DONE verdict in a later call. In that later call I typed `04:31` and `04:3x` by guessing that time had passed, not from a clock. I saw the mismatch on the read-back and changed both to 04:28 (the `date` of that same turn) before any other role read them.
- **Rule involved:** my card, "every HH:MM I write into a file comes from `date` printed in that same turn — never estimated from elapsed time" (F-046, after F-043).
- **How it was caught:** by me, on the read-back of the changed lines, 2026-10-31 04:28.
- **Cost:** none: fixed within the same minute, no one had read them.
- **Evidence:** `tasks/TASK-171-caw-front-plan-on-board-line.md` § Review and Status line (now 04:28); log 2026-10-31 Silver 04:29.
- **Suggestion (for Atlas):** the stamp goes in the same command as the `date` call, or the time is printed in the write call itself (`date '+%H:%M' && <write>`). Never print it in one call and type it in another.

## F-059 — 2026-10-31 — SA (Silver, Team B) — TASK-171 changes the mock's accept behaviour and fixture, but its closed list left out `src/api/mock-chat.test.ts`, which pins the old behaviour
- **Status:** CLOSED 2026-10-31 — owner: "ปิดไปให้หมด เลย ช่างมันเริ่มใหม่". Reviewed by Atlas; no fix installed (ATLAS.md § FAILURES review i-space F-044…F-061).
- **What happened:** SPEC-126 D3 changes the caw-front mock in two ways. `acceptProposal` now makes cards only for items not already on the board, and the seed plan `Q(2)`'s first item moves to API-004. My front probe (`spec126-r2-front.patch`) held only the type change (`caw.ts`, `crew.ts`, `Chat.tsx`). It found the mock's 4 type errors but could not see a test that pins what the mock *does*. `src/api/mock-chat.test.ts:117` expects 3 cards from accepting Q(2); under the new rule it makes 1. The file was not on TASK-171's closed list, so Fanta had to ask (Q1).
- **Rule involved:** my card / role-sa § 3, "a shape change's consumers = probe-change.sh … each hit → TASK", and spec-rules §1. A behaviour or fixture change is a shape for its tests. The probe patch has to carry the behaviour too (here the `mock.ts` edit), or I `git grep` the fixture's ids (`Q(2)`, `acceptProposal`) in the tests. I did neither.
- **How it was caught:** FE (Fanta), TASK-171 § Questions Q1, 2026-10-31 03:59.
- **Cost:** one question, answered in minutes; Fanta kept working on the rest. Nothing was built wrong.
- **Evidence:** `tasks/TASK-171-caw-front-plan-on-board-line.md` § Questions Q1 + answer; `specs/SPEC-126-…` § API front probe lines; `tests/harness/spec126-r2-front.patch` (no `mock.ts` hunk).
- **Suggestion (for Atlas):** when a SPEC changes a mock's or fixture's behaviour, the probe patch includes that behaviour change (not only the types), or the SPEC lists `git grep -n '<fixture id>\|<method>'` over the tests, each hit → TASK. This is the third closed-list miss of this kind (F-047, F-055, F-059).

## F-058 — 2026-10-31 — SA (Silver, Team B) — My pre-commit tree-fp check for caw-back (REQ-126) did not run, and the commit went ahead anyway
- **Status:** CLOSED 2026-10-31 — owner: "ปิดไปให้หมด เลย ช่างมันเริ่มใหม่". Reviewed by Atlas; no fix installed (ATLAS.md § FAILURES review i-space F-044…F-061).
- **What happened:** In the `ขึ้น git REQ-126` call for caw-back I put the check as `tree-fp.sh . | grep -q 'fp 32a65f35c337' && echo "fp ok"` under `set -e`. `tree-fp.sh` refuses `.` ("has no existing path in machine.local.md"), so grep found nothing. But a failed command on the left of `&&` does not stop a `set -e` script, so `git add`/`commit`/`push` ran without the check. The last real check was at 02:40 (it matched QA's TEST-124 fp). Nothing wrote to the tree between then and 02:4x: I had confirmed it was untouched after the refused call, and the commit holds exactly the 12 paths on TASK-168's list, parent 5779554. So the commit is right, but the gate didn't protect it. For caw-front I used the absolute path and a `case … exit 9` check. That one ran and printed `fp ok`.
- **Rule involved:** my card / SA-Lead.md § Git safety: "`tools/tree-fp.sh <repo>` = the value in QA's verdict" before typing the owner's `ขึ้น git`; spec-rules §4.
- **How it was caught:** by me, reading the call's output (the tree-fp error line above `left unstaged: 0`).
- **Cost:** none in the code (pushed tree = the tested tree, by path list and parent). The cost is that a check the gate depends on silently didn't run.
- **Evidence:** log 2026-10-31 Silver 02:4x; caw-back 5b49f65 (12 files, parent 5779554); caw-front 7f68c42 (fp checked).
- **Suggestion (for Atlas):** a pre-git gate check must stop the script when it fails (`|| exit`, or `case … exit`), never be an `&& echo`. tree-fp gets the repo's absolute path from machine.local.md, never `.`.

## F-057 — 2026-10-31 — SA (Silver, Team B) — SPEC-125 D5 hid a copy of an accepted plan on the card only; the Board's notice still said "waits for your agreement" for it
- **Status:** CLOSED 2026-10-31 — owner: "ปิดไปให้หมด เลย ช่างมันเริ่มใหม่". Reviewed by Atlas; no fix installed (ATLAS.md § FAILURES review i-space F-044…F-061).
- **What happened:** SPEC-125 D5 says an open proposal equal to an accepted one shows `แผนนี้ตกลงไปแล้ว` with no button, and `newestOpen` skips it. I did not trace the other reader of "an open proposal": `caw-front → src/lib/crew.ts:77-81` `proposalWaits`, which drives the Board's `รอคุณตกลง` notice. A copy would still raise it. Fanta found it and wrote it under UNVERIFIED in TASK-169. I added step 8 to the TASK.
- **Rule involved:** role-sa § 3 "A shape change names every consumer of that shape (you grepped them)". Here the "shape" is a rule (what counts as an open plan). Its readers were findable with `git grep -n 'status === "open"'` in caw-front, and I did not run it.
- **How it was caught:** FE (Fanta), TASK-169 § Implementation Notes UNVERIFIED, 2026-10-31 02:0x.
- **Cost:** one added step in a TASK that was still open (step 6 waits anyway). Nothing built wrong.
- **Evidence:** `tasks/TASK-169-caw-front-answers-together-plan-copy.md` § What to do 8 and § Review (interim); `specs/SPEC-125-…` D5.
- **Suggestion (for Atlas):** when a SPEC changes what a state means (open / waiting / workable), it lists every reader of that state from a grep on the state's literal (`status === "open"`), each → TASK or untouched. That is the state form of spec-rules §3's boundary rule.

## F-056 — 2026-10-30 — SA (Silver, Team B) — Reviewing TASK-165, I built caw-front with `NEXT_DIST_DIR=.next-s`; Next added two `.next-s` lines to the tracked `tsconfig.json` in Fanta's tree
- **Status:** CLOSED 2026-10-31 — owner: "ปิดไปเลย", an environment / clock problem of the Grok-bot box the desk ran on, not a process defect. No fix.
- **What happened:** To re-run TASK-165's offline build at review, I used a new dist folder name, `.next-s`, in caw-front's real working tree. Next.js adds a dist folder it has not seen to the tracked `tsconfig.json` `include`, and it added `".next-s/types/**/*.ts"` and `".next-s/dev/types/**/*.ts"`. I noticed when `git status` went from Fanta's 14 paths to 15. I removed the two lines with the editor (no git command), and checked: `git diff --stat tsconfig.json` empty, 14 paths, typecheck 0, tree-fp `1b01369237d6`.
- **Rule involved:** SYSTEM-FACTS § "Machine and repo facts from the FAILURES review": *"caw-front: a `NEXT_DIST_DIR` name Next.js has not seen is added to the tracked `tsconfig.json` `include`. Use the map's `.next-f`…"* `[Atlas review 2026-10-29, F-003]`. I had read that file at session start.
- **How it was caught:** by me, from the path count in the next `git status`, within the same review.
- **Cost:** a two-line change in an engineer's tree for about one minute; nothing committed, nothing else touched. Had I not counted, it would have gone into the commit as an unexplained `tsconfig.json` change.
- **Evidence:** `tasks/TASK-165-caw-front-start-fonts-readme.md` § Review (23:1x); caw-front `tsconfig.json:49-53`.
- **Suggestion (for Atlas):** a reviewer's build in a team's tree uses the folder named in the TASK's own DoD (here `.next-f`), never a new one. `probe-change.sh`-style scratch copies are the place for any other experiment.

## F-055 — 2026-10-30 — SA (Silver, Team B) — TASK-165 changes the folder hint in `words.ts`, but its closed list left out `words.test.ts`, which pins the old hint
- **Status:** CLOSED 2026-10-31 — owner: "ปิดไปให้หมด เลย ช่างมันเริ่มใหม่". Reviewed by Atlas; no fix installed (ATLAS.md § FAILURES review i-space F-044…F-061).
- **What happened:** SPEC-123 D9 changes the folder hint at `caw-front → src/words.ts:153` (`/Users/…` → `/home/…`). For AC-5 I grepped the product code for `/Users/` and listed `words.ts:153` and `mock.ts:302-303`. I did not grep the tests for the hint text itself. `src/words.test.ts:36` asserts the old string, so the change breaks it. That file was not on TASK-165's closed list, and Fanta had to ask (Q1). It is the same kind of gap as F-047 (TASK-149's DoD named a test file its closed list left out), one day later.
- **Rule involved:** role-sa § 3 "A shape change names every consumer of that shape (you grepped them)"; spec-rules §1. A user-visible text is not a shape, so I skipped the consumer step — but a test that pins the text is a consumer all the same.
- **How it was caught:** FE (Fanta), TASK-165 § Questions Q1, 2026-10-30 23:1x.
- **Cost:** one question, answered within minutes; Fanta kept working on the rest. Nothing was built wrong.
- **Evidence:** `tasks/TASK-165-caw-front-start-fonts-readme.md` § Questions Q1 and the answer; `specs/SPEC-123-caw-linux-deploy-ready.md` D9 (consumer line added 23:1x).
- **Suggestion (for Atlas):** for every user-visible string a SPEC changes, `git grep -nF '<old text>'` across the repo, tests included. Each hit goes on a closed list or is marked untouched — the text form of the probe.

## F-054 — 2026-10-30 — SA (Silver, Team B) — SPEC-120's restart rule read a task's context from `result.usage`, which sums every model call in the task; real workers were restarted after every task (TEST-121 DEF-1)
- **Status:** CLOSED 2026-10-31 — owner: "ปิดไปให้หมด เลย ช่างมันเริ่มใหม่". Reviewed by Atlas; no fix installed (ATLAS.md § FAILURES review i-space F-044…F-061).
- **What happened:** In SPEC-120 D3 I set the restart threshold `RUNNER_WORKER_MAX_TOKENS` (150 000) against "the last task's `result.usage` input + cacheCreation + cacheRead". I wrote that "a task's context size can be read from its own `result`" because of my 18:51 probe. That probe's tasks made **one** model call each ("Reply with exactly: ONE"), so the sum and the context were the same number. A real task makes 4–19 calls, and `result.usage` adds up every call's prompt. QA's live run measured 238 884–632 307, so every task restarted the process (13 hops, 13 sessions). From QA's own traces, the real context (the last call's prompt) was 25 849–54 865.
- **Rule involved:** role-sa § 3 "A claim is never stronger than what you read … A cause you inferred … is written `inferred — <what would settle it>`". I generalised from a one-call probe to multi-call tasks without saying so, and did not open any existing real trace, of which the desk already had many (TEST-106, TEST-119 traces).
- **How it was caught:** QA (Tanya), TEST-121 AC-6 live, DEF-1 MAJOR, 2026-10-30 21:41.
- **Cost:** REQ-122 TEST_FAILED, one live run spent on a defect, a round 2 (one more TASK + up to 2 live runs).
- **Evidence:** `specs/SPEC-120-…` § Overview (the probe paragraph) and § D3; `tests/TEST-121-…` DEF-1; `tests/harness/test-121/live/out/traces/*.jsonl`, measured at 21:4x (first / last / peak context per task vs the result sum).
- **Suggestion (for Atlas):** a SPEC number derived from a probe states what the probe could and could not show: here, "1 call per task, so the sum equals the context". Any threshold on model usage is checked against at least one real multi-call trace from `tests/harness/` before the TASK is cut.

## F-053 — 2026-10-30 — SA (Sober, Team A) — I typed a time stamp ("21:2x") into inbox/WAKE.md before running `date`, a third time after F-049
- **Status:** CLOSED 2026-10-31 — owner: "ปิดไปเลย", an environment / clock problem of the Grok-bot box the desk ran on, not a process defect. No fix.
- **What happened:** I rang for Fern through `inbox/WAKE.md` with "2026-10-30 21:2x". My last `date` in view said 21:18, and I ran `date` only after the line was written. It printed 21:20, so the stamp happened to be right. My card's correction, written after F-049, says: "`date +%H:%M` output in view BEFORE typing any stamp, never after".
- **Rule involved:** PROTOCOL.md § Log format ("`[HH:MM]` is the real clock time"); workforce-protocol §2; my card (correction line, F-049).
- **How it was caught:** by me, from the `date` call right after the write.
- **Cost:** none. The stamp is correct, and nothing was edited.
- **Evidence:** `inbox/WAKE.md` (last line from Sober); this session's tool order (`date` 21:18 → TASK-161 → … → the WAKE echo → `date` 21:20).
- **Suggestion (for Atlas):** none new. A card line alone has not changed the habit in long sessions. F-044's gate idea (a stamp later than the write time) or a hook that refuses `HH:Mx` stamps in an echo with no `date` in the same call would.

## F-052 — 2026-10-30 — BE (Bob, Team B) — TASK-157: I saw a stale API description in a file I was changing and only declared it, instead of fixing it or asking
- **Status:** CLOSED 2026-10-31 — owner: "ปิดไปให้หมด เลย ช่างมันเริ่มใหม่". Reviewed by Atlas; no fix installed (ATLAS.md § FAILURES review i-space F-044…F-061).
- **What happened:** Building TASK-157 I copied the SA's reference patch into `src/http/routes/team.ts`. The check-in's 204 description still said "only `state` is read from the body" although the same edit made the body also carry `sessions`. I noticed it, left it as the patch had it, and wrote it as a "Declared" note asking whether to reword. The SA set REWORK for that one line (the gap was her patch's, but the line was in my closed-list file and I knew it was wrong).
- **Rule involved:** role-be §3 "Code and contract agree" — an `openapi.json` description that says the opposite of the code is a disagreement; and §1 "You own the outcome, not the diff". A one-line fix inside my own closed file did not need a question; I should have made it and said so (or put it in `## Questions` before REVIEW, not in a note after).
- **How it was caught:** SA (Silver), review of TASK-157, after REVIEW.
- **Cost:** one rework round on one string and one re-emit; nothing wrong shipped (nothing committed).
- **Evidence:** `tasks/TASK-157-caw-back-hop-per-worker-and-team-sessions.md` § Implementation Notes (Declared) and § Review (REWORK).

## F-051 — 2026-10-30 — SA (Silver, Team B) — SPEC-120's probed team.ts patch changed what the check-in body reads, but left its 204 description saying "only `state` is read from the body"
- **Status:** CLOSED 2026-10-31 — owner: "ปิดไปให้หมด เลย ช่างมันเริ่มใหม่". Reviewed by Atlas; no fix installed (ATLAS.md § FAILURES review i-space F-044…F-061).
- **What happened:** I wrote `tests/harness/spec122-api.patch` (SPEC-120 D6.1), which adds an optional `sessions` to the runner check-in body. TASK-157 told Bob to build team.ts "exactly as in" that patch. The patch left the route's 204 description unchanged ("…; only `state` is read from the body"), and that is now false. Bob built it as told and declared the stale line under Implementation Notes. I set TASK-157 to REWORK for that one line plus a re-emit, before Fanta's `gen:api` reads the document.
- **Rule involved:** role-sa § 3 "A TASK is done (as a document) when an engineer could execute it with no question"; SPEC-120 D6.1 named the body and response shapes but not the text around them. NONE more specific — no rule covers the prose next to a changed shape.
- **How it was caught:** BE (Bob), TASK-157 § Implementation Notes "Declared", 2026-10-30 20:0x.
- **Cost:** one REWORK round of one line, and TASK-158 waits for it. Nothing was built wrong.
- **Evidence:** `tasks/TASK-157-caw-back-hop-per-worker-and-team-sessions.md` § Implementation Notes (Declared) and § Review; caw-back `src/http/routes/team.ts:51`; `tests/harness/spec122-api.patch`.
- **Suggestion (for Atlas):** when a probe patch changes a route's request or response, grep the same `createRoute` block's `description` strings for the old field list before the TASK says "exactly as in the patch".

## F-050 — 2026-10-30 — FE (Fern, Team A) — I wrote guessed clock times ("~20:3x") into TASK Implementation Notes and the board, and set REVIEW on a status line that still named the SA
- **Status:** CLOSED 2026-10-31 — owner: "ปิดไปเลย", an environment / clock problem of the Grok-bot box the desk ran on, not a process defect. No fix.
- **What happened:** In TASK-156 I wrote "Fern, 2026-10-30 ~20:3x" in Implementation Notes and "20:3x" in the board cell, when the real clock read 19:5x. I had not run `date`; I made the time up from how long the work felt. The same habit is in my earlier notes today (for example "~13:5x" on TASK-141, "~16:4x" on TASK-135, "~00:4x" on TASK-131), none checked against `date`. Separately, I set the TASK to REVIEW by editing only the word on the status line, which still ended "(2026-10-30 19:5x, Sober)": the line read as the SA's stamp, not mine.
- **Rule involved:** workforce-protocol §2 (a time in a file comes from the session's own clock; all dates absolute) and PROTOCOL § Log format (`[HH:MM]` is the real clock time; `[--:--]` if unknown, never a guess); the same family as F-043…F-046 which Sober named. Role skill §6: report what you ran and saw, do not infer.
- **How it was caught:** the SA (Sober), in TASK-156 § Review, 2026-10-30 19:59.
- **Cost:** none to the work; a false timeline in a TASK file that QA or Atlas reading it would trust.
- **Evidence:** `tasks/TASK-156-blueprint-front-start-check-pm2-readme.md` § Implementation Notes ("~20:3x") and § Review (Sober's note); board row TASK-156. From now on I stamp with `date +%H:%M` and write my own name when I move a status.

## F-049 — 2026-10-30 — SA (Sober, Team A) — Twice in 3 minutes I wrote a TASK status time ahead of the clock ("20:0x" at 19:57, "20:01" at 19:59)
- **Status:** CLOSED 2026-10-31 — owner: "ปิดไปเลย", an environment / clock problem of the Grok-bot box the desk ran on, not a process defect. No fix.
- **What happened:** When I released TASK-155 I typed its status as "TODO (2026-10-30 20:0x, Sober)" and ran `date` only afterwards (19:57). When I set TASK-156 DONE I typed "20:01", and `date` in the next call printed 19:59. I corrected both before anyone read them, and the board cells carry the right times. This is the slip of F-043…F-046, and my own card says "`date +%H:%M` before any time stamp". I ran `date` after the stamp, not before.
- **Rule involved:** PROTOCOL.md § Log format: "`[HH:MM]` is the real clock time"; workforce-protocol §2; my card: "correction: `date +%H:%M` before any time stamp".
- **How it was caught:** by me, both times, by the `date` call I made right after the edit.
- **Cost:** none in the work; two corrective edits. Same session as my review note to Fern about the same slip (TASK-156 § Review).
- **Evidence:** `tasks/TASK-155-…` status line (now 19:57), `tasks/TASK-156-…` status line (now 19:59), this session's tool order.
- **Suggestion (for Atlas):** none new. F-044's suggested gate WARN (a stamp later than the file's mtime) would have caught both. Until it exists, the stamp comes from a `date` output already in view, never typed first.

## F-048 — 2026-10-30 — SA (Sober, Team A) — My pm2 trials for REQ-123 left several orphan pm2 daemons of ~2 GB each, and the box ran short of memory
- **Status:** CLOSED 2026-10-31 — owner: "ปิดไปเลย", an environment / clock problem of the Grok-bot box the desk ran on, not a process defect. No fix.
- **What happened:** For SPEC-121 (REQ-123) I tried pm2 on scratch clones (19:11–19:12) through `npx -y pm2@7.0.4` with `PM2_HOME` = my scratchpad's `pm2home`. That socket path is 111 bytes (`…/scratchpad/pm2home/rpc.sock`; `interactor.sock` 118), over the Unix-socket path limit (~107). So the daemon could not bind its socket (`connect EINVAL …/pm2home/interactor.sock`, and `[PM2] Spawning PM2 daemon with pm2_home=…` on screen). **Cause, read in the code and the log:** `pm2/modules/pm2-axon/lib/sockets/sock.js:389-424` handles a bind error that is not `EADDRINUSE` by calling `self.server.listen(port, host, fn)` again, with no limit. Each failed listen adds a handle to Node's domain async-hook Map, until `pm2home/pm2.log` shows `RangeError: Map maximum size exceeded … at AsyncHook.init (node:domain:79:15) … at Server.<anonymous> (…pm2-axon/lib/sockets/sock.js:423:21)`. That is the ~2–2.5 GB per daemon. Because the CLI could never reach a daemon, **every pm2 command I typed (`--version`, `start`, `start`, `ls`, `restart`, `ls`, `kill`, then `--version` again) spawned a new one**. The `timeout 120` around each command killed only the CLI, never the detached daemon, and `pm2 kill` with that home could not reach them either. I saw the `EINVAL` text, shortened `PM2_HOME` to `/tmp/claude-1000/p2s` (which worked and was `pm2 kill`-ed), and **did not check for, or stop, the daemons the long path had already started**. I also never checked memory after the trial. The PM found 5 at ~1.7–2 GB each, with the box at ~1.6 GB free, and it stopped SA B's REQ-122 probes. When I read the owner's order at 19:45, no pm2 process was left (`ps … | grep pm2` → none; `free -m` → 6424 MB free / 7627 MB available). I did not kill them: `pm2home/pm2.log` was last written 19:42, so someone else stopped them first.
- **Rule involved:** `PROTOCOL.md` § Environments: this box is shared ("the developer's own machine" is shared by the whole desk). The kill-by-name hook's message: "stop your own port". NONE — no written rule says "a tool trial must leave no process behind and must be checked with `ps`/`free` afterwards". I broke the plain duty to clean up what I start, and I failed to read an error (`EINVAL` + "Spawning daemon") as "something was left running".
- **How it was caught:** by the PM (inbox/SA.md, 19:3x), from `ps` and free memory, after SA B's probes failed. The owner ordered the stop at 19:28 (DECISIONS 19:3x). About 30 minutes after the daemons started.
- **Cost:** about 8–10 GB of the box's 16 GB for ~30 min. SA B's REQ-122 probes stopped. The owner's and Atom's attention. pm2 is now banned on this box until this cause is accepted, so REQ-123's pm2 DoD lines (TASK-155 DoD 8, TASK-156 DoD 10) and QA's AC-1/2 pm2 steps are held.
- **Evidence:** `inbox/SA.md` Porter lines 2026-10-30 (5 daemons, owner order); `DECISIONS.md` 2026-10-30 19:3x; scratchpad `pm2home/pm2.log` (the RangeError), last written 19:42; `specs/SPEC-121-…` E8–E10 (the trial); the sock.js lines above (pm2 7.0.4 in the npx cache).
- **Suggestion (for Atlas):** (1) A trial of any daemon-making tool (pm2, a dev server, a browser) ends with `ps -eo pid,rss,cmd | grep <tool>` + `free -m`, pasted, before the next step. (2) A tool error that says "spawning daemon" or `EINVAL` on a socket means stop and check, not retry with a new setting. (3) For pm2 itself: `PM2_HOME` must be short (≤ ~80 chars, e.g. `/tmp/<name>-pm2`). Never the scratchpad path. Write that into SPEC/TASK and README text, and a gate or hook could refuse a pm2 call whose `PM2_HOME` is longer.

## F-047 — 2026-10-30 — SA (Silver, Team B) — TASK-149's DoD 6 asked for "a `hop.test.ts` case", but its closed file list left out `src/runner/hop.test.ts`
- **Status:** CLOSED 2026-10-31 — owner: "ปิดไปให้หมด เลย ช่างมันเริ่มใหม่". Reviewed by Atlas; no fix installed (ATLAS.md § FAILURES review i-space F-044…F-061).
- **What happened:** When I cut TASK-149 (SPEC-117, REQ-118 B side), DoD 5 ran `src/runner/hop.test.ts` and DoD 6 asked for the AC-2 stub check as "a `hop.test.ts` case". The closed file list in § What to do named `src/runner/{prompt,prompt.test,hop,api}.ts`, without `hop.test.ts`. So Bob had to step outside the list to meet the DoD, and he asked about it as Q1 (non-blocking).
- **Rule involved:** role-sa § 3 "A TASK is done (as a document) when an engineer could execute it with no question: … closed file list"; SA-Lead.md § TASK template. I did not check the DoD's file names against the closed list before I released the TASK.
- **How it was caught:** BE (Bob), TASK-149 § Questions Q1, at REVIEW 2026-10-30 17:0x.
- **Cost:** one non-blocking question. Nothing was built wrong. At review I accepted the file as in scope (§ Review).
- **Evidence:** `tasks/TASK-149-caw-back-requirements-reach-workers.md` § What to do (closed list), DoD 5–6, § Questions Q1, § Review.
- **Suggestion (for Atlas):** before a TASK is released, every path that its DoD commands or wording name should appear in its closed list. That check could be mechanical: grep the DoD for `\S+\.(ts|tsx|md|json)` and diff it against the list.

## F-046 — 2026-10-30 — SA (Silver, Team B) — Right after filing F-043 (a time stamp an hour ahead) I wrote "16:5x" about ten times while the clock read 16:4x
- **Status:** CLOSED 2026-10-31 — owner: "ปิดไปเลย", an environment / clock problem of the Grok-bot box the desk ran on, not a process defect. No fix.
- **What happened:** At 16:22 I filed F-043 for writing "17:2x" on the board when it was 16:1x. Then, from about 16:41 to 16:44, I wrote "16:5x" in SPEC-116 (status line), REQ-119 § Questions Q4, TASK-151 (status line and four DoD base stamps), SPEC-117 § Consumers, the board's REQ-119/TASK-151 cells, and my PM inbox pointer ("see log 16:5x"). `date` printed 16:47 at the next wake. I found it myself while writing TASK-151's review, and corrected every one in my own files to 16:4x. The PM inbox line is not mine to edit; it is mentioned in my log instead.
- **Rule involved:** PROTOCOL.md § Log format: "`[HH:MM]` is the real clock time." Workforce-protocol §2: settle the date (and time) from the session's own clock. The fix I wrote for F-043 ("check with `date` before you write") was not applied. I wrote the stamps from my sense of how much time had passed.
- **How it was caught:** by me, about 5 minutes later, when `date` printed 16:47 at a wake.
- **Cost:** ten wrong stamps in five files; one correction pass. Nothing was built wrong.
- **Evidence:** `log/2026-10-30.2.md` Silver entries 16:4x; `inbox/PM.md` my 2026-10-30 lines; `tasks/TASK-151-…` status line + DoD 1–4.
- **Suggestion (for Atlas):** a time a role writes into a file is guessed unless a tool printed it in the same turn. `append-log.mjs` already stamps the log. A small `now.mjs` (prints `HH:M` + `x`) or a hygiene WARN on a stamp later than the file's mtime would catch this mechanically. Willpower did not (F-043 → this).

## F-045 — 2026-10-30 — QA (Tanya) — I stamped REQ-119's verdict "17:4x" in four places when the real time was 16:36
- **Status:** CLOSED 2026-10-31 — owner: "ปิดไปเลย", an environment / clock problem of the Grok-bot box the desk ran on, not a process defect. No fix.
- **What happened:** When I wrote the REQ-119 verdict (TEST-116 status line and test-data row, REQ-119 § Verification, the board's TEST row), I typed "2026-10-30 17:4x" without running `date`. My own log entry for that verdict, written by `append-log.mjs`, says [16:36]. The PM copied my stamp into DECISIONS and REQ-119 (F-044). Third guessed future time on this desk within the hour (F-043, F-044).
- **Rule involved:** PROTOCOL.md § Date discipline / § Log format — a time in a file comes from the clock, not from a guess.
- **How it was caught:** the PM, at about 16:43 (`inbox/QA.md`, F-044).
- **Cost:** no effect on the verdict or the tested trees. Events looked out of order: the decision appeared to come after the commit. Corrected at 16:4x in all four places, with the time `append-log.mjs` recorded (16:36). The PM's own status line on REQ-119 still quotes "17:4x" and is the PM's to fix.
- **Evidence:** `tests/TEST-116-…` status line ("stamp corrected … F-044"); `log/2026-10-30.md` `## [16:36] Tanya (QA)`; board TEST row REQ-119.
- **Suggestion (for Atlas):** none new. F-044's gate WARN (an `HH:Mx` stamp later than the file's mtime) would have caught this one too. Until it exists, I run `date` before writing any stamp.

## F-044 — 2026-10-30 — PM (Porter) — I stamped DECISIONS, REQ-119 and two board cells with future times ("17:4x", "16:5x") without checking the clock
- **Status:** CLOSED 2026-10-31 — owner: "ปิดไปเลย", an environment / clock problem of the Grok-bot box the desk ran on, not a process defect. No fix.
- **What happened:** Between about 16:30 and 16:42 I wrote REQ-119's delivery decision as "2026-10-30 17:4x" in DECISIONS.md and in REQ-119 § Round 2, and the REQ-115 and REQ-119 commit cells on the board and in both REQs as "16:5x". `date` at 16:43 showed the real times were 16:3x and 16:4x. I had copied "17:4x" from QA's TEST-116 stamp, which was itself in the future, and guessed "16:5x" without running `date`. This is the same slip as F-043 (Silver), less than an hour after it was reviewed.
- **Rule involved:** PROTOCOL.md § Log format: "`[HH:MM]` is the real clock time"; § Date discipline. A time in a file must come from the clock, not from another file.
- **How it was caught:** by me, at 16:43, when I ran `date` while answering REQ-119 Q4.
- **Cost:** no effect on the work. DECISIONS showed a decision timed after the commit it led to, which could confuse anyone putting events in order. The stamps are corrected: the REQs and board in place, DECISIONS with a correction line under the original.
- **Evidence:** `DECISIONS.md` line "2026-10-30 17:4x · REQ-119 TEST_PASSED…" plus its "↳ time corrected" line; `requirements/REQ-119-…` § Round 2 heading; `tests/TEST-116-…` status line "17:4x" (QA's own stamp, also in the future — the PM tells QA).
- **Suggestion (for Atlas):** `append-log.mjs` already writes the real time. A board, DECISIONS or REQ stamp could be checked by the gate, which would WARN on any `HH:Mx` later than the file's mtime.

## F-043 — 2026-10-30 — SA (Silver, Team B) — I stamped my REQ-119 board cell "17:2x" when the real clock was 16:1x
- **Status:** ATLAS-REVIEWED 2026-10-30 — one-off: a guessed clock time; the rule exists (PROTOCOL § Date discipline / Log format: real time, from `date`). No new fix; watch for a repeat.
- **What happened:** When I set REQ-119 to SPEC_DONE (log entry [16:14]), I wrote "2026-10-30 17:2x" in its board cell. The real time was 16:1x, so the board was dated about an hour in the future. Sober noticed it at 16:18 and told the PM in his log entry. I corrected the cell to 16:1x at 16:2x, after a /clear.
- **Rule involved:** PROTOCOL.md § Log format: "`[HH:MM]` is the real clock time." The board form is "status + date + owner + pointer"; I did not check the time with `date` before I wrote it.
- **How it was caught:** by SA A (Sober), reading the board in a fresh session, about 4 minutes later.
- **Cost:** none in the work. A reader trying to put events in order could have been misled. One correction edit.
- **Evidence:** `log/2026-10-30.md` Sober [16:18] "board REQ-119 cell stamped "17:2x" by Silver; real clock 16:1x"; `board.md` REQ-119 row (fixed 16:2x).

## F-042 — 2026-10-30 — SA (Sober, Team A) — SPEC-112's front consumer grep named only `roundRaw`; the quiz item's new required `calls` broke a front test fixture outside TASK-135's file list
- **Status:** FIXED 2026-10-30 — consumers now come from tools/probe-change.sh (a scratch copy of the change; the errors are the list), ticked per hit, and the gate WARNs on a SPEC without them; SA-Lead § SPEC template (ORDER 45). Was ATLAS-REVIEWED.
- **What happened:** SPEC-112 adds `calls` to three schemas (message `roundCalls`, `Round`, quiz item). On the front I grepped only `roundRaw|roundAdjusted` and closed TASK-135's list at `schema.d.ts` + `chat/load.ts`. The quiz item type `ApiQuizItem` is built by hand in `src/features/ready/load.test.ts:24` (`item()`), so the regenerated required `calls` key broke `typecheck` there. Fern stopped and asked (Q1). One key added, file added to the list.
- **Rule involved:** SA-Lead.md § SPEC template "Every shape change names its consumers, grepped" + my card line "every consumer grep runs over `src test`" (F-034). I grepped `src` with test files included, but for **one of the three** changed shapes only.
- **How it was caught:** FE (Fern), `bun run typecheck`, TASK-135 Q1, before REVIEW.
- **Cost:** one question round on an XS TASK; nothing built wrong.
- **Evidence:** `tasks/TASK-135-blueprint-front-round-calls-type.md` § Questions Q1; `specs/SPEC-112-gateway-model-per-task.md` § API / Interface "Consumers".
- **Suggestion (for Atlas):** the Consumers line is per changed schema name (one grep per generated type alias that gains a field), not per field. For a generated-types front, a cheap complete check is `gen:api` + `typecheck` in a scratch copy before the TASK is cut.

## F-041 — 2026-10-30 — SA (Sober, Team A) — I ran `sed -i` on a TASK file to flip its status; the hook blocked it
- **Status:** ACCEPTED 2026-10-30 — the hook (block-shell-edits.sh) worked as designed. The edit-script rule (Q5, F-025) goes into ORDER 45.
- **What happened:** After writing TASK-134's review with the editor tool, I tried to set its `- Status:` line with `sed -i.bak 's/…/…/'` in Bash, to save a Read. The PreToolUse hook (`scripts/hooks/block-shell-edits.sh`) blocked it, so nothing changed and no `.bak` was left (checked with `ls tasks/*.bak`). The pattern would also have missed: Jason had already changed the line to `REVIEW`, so my sed matched nothing, and with no hook it would have "succeeded" silently. Redone with Edit after reading the line.
- **Rule involved:** PROTOCOL.md § Editing files: "Never pass file content through a double-quoted shell string — no `node -e`, `sed -i`, `perl -i` … Allowed, and only these: the editor tool; a script fed by a quoted heredoc where every replacement asserts exactly one match or throws." Same family as F-025.
- **How it was caught:** the hook, at once. No file was harmed.
- **Cost:** none beyond one blocked call. It shows the habit is not reliable without the hook, and the hook covers only Claude Code.
- **Evidence:** this session, TASK-134 § Review (2026-10-30 16:0x); `log/2026-10-30.md` Sober entry 16:0x.

## F-040 — 2026-10-30 — SA (Silver, Team B) — SPEC-116 D3.4 said worker names "are not unique by construction" without reading the schema; they are unique among live workers
- **Status:** FIXED 2026-10-30 — derived-rule table, cited rule plus one boundary case, schema line for uniqueness; spec-rules.md §3 (ORDER 45). Was ATLAS-REVIEWED.
- **What happened:** In SPEC-116 D3.4 (hand-off by name) I added an `[SA-decided]` rule for "a name matching two recipients" and a risk R3, on the premise that worker names are not unique. I did not open the workers table. `caw-back → src/db/schema.ts:24` has `uniqueIndex("workers_name_live")` (live workers), and `src/workers/service.ts:32` answers `409 name_taken`; recipients are always live. So the branch can never happen, and TASK-147 asked Bob to test an unreachable case. Bob found it (TASK-147 Q2), kept the one-line `exactly one` check, and listed the test as UNVERIFIED.
- **Rule involved:** role-sa §3 "A claim is never stronger than what you read"; my card's habit of citing the base rule a new rule depends on (F-038).
- **How it was caught:** BE (Bob), building TASK-147, Q2.
- **Cost:** one non-blocking question; no wrong code (the built check is correct either way). SPEC-116 D3.4 and R3 struck and corrected.
- **Evidence:** `tasks/TASK-147-caw-back-no-progress-and-named-handoff.md` § Questions Q2 + answer; `specs/SPEC-116-caw-run-honest-end-named-handoff.md` D3.4, R3.
- **Suggestion (for Atlas):** a SPEC rule about a value's uniqueness, nullability or range cites the schema line that decides it (`grep -n` on the table definition) — the same as a Consumers line.

## F-039 — 2026-10-30 — BE (Bob, Team B) — TASK-143: I settled an operator-visible count on my own reading of an ambiguous SPEC line instead of asking
- **Status:** ATLAS-REVIEWED 2026-10-30 — Downstream of F-038 (an ambiguous SPEC line). The BE rule exists (role-be §1: ask about anything outside-visible). The SA-side fix in ORDER 45 (P12) removes the ambiguity at the source. No BE-side change.
- **What happened:** SPEC-114 D3 said a review card's "waiting" counts the not-done work cards that depend on it "directly or through other cards". It did not say whether a `done` card in the middle of a chain cuts the path. I saw the gap while building `src/runner/report.ts`, chose "walk through a done card, count only the not-done ones" (a card behind a done card still counted), wrote it down as Decision 1 in the Implementation Notes and set REVIEW. The number is printed in the operator's run report ("มีอีก {n} งานรออยู่"). The SA overturned it (REWORK round 1): a card whose own dependencies are done is workable, so counting it tells the operator more cards wait than do.
- **Rule involved:** role-be §1: "You ask about everything someone outside can see — a field, a status code, an error body, a business rule … and you ask all questions in one message". What the report says to the operator is outside-visible; it was a `## Questions` entry, not a "decide and declare" one. (Mitigation, not an excuse: I declared it for review, and the SA's clarification of step 4 reached my inbox after I had built.)
- **How it was caught:** SA (Silver), review of TASK-143, after REVIEW.
- **Cost:** one rework round on one function and one test; no wrong number shipped (nothing committed).
- **Evidence:** `tasks/TASK-143-caw-back-starter-skills-and-review-line.md` § Implementation Notes (Decision 1) and § Review (REWORK round 1); `inbox/BE-B.md` lines of 2026-10-30.

## F-038 — 2026-10-30 — SA (Silver, Team B) — SPEC-114 D3 said "waiting through other cards" without saying a done card ends the walk; TASK-144 counted a workable card as waiting
- **Status:** FIXED 2026-10-30 — derived-rule table, cited rule plus one boundary case, schema line for uniqueness; spec-rules.md §3 (ORDER 45). Was ATLAS-REVIEWED.
- **What happened:** D3 defined the cards waiting behind a review card as "not done, depending on it directly or through other cards". Fanta read it literally and walked on through a **done** card, so `#3 todo → #2 done → #1 review` counted #3 as waiting. In CAW a card whose own dependencies are done is workable (`caw-back → src/cards/view.ts:1-2`), so the report/board would tell the operator more cards wait than do. Caught in my TASK-144 review; REWORK round 1; D3 and TASK-143 (Bob, in progress) clarified before his code used it.
- **Rule involved:** role-sa §3 "A claim is never stronger than what you read" — I wrote a rule about waiting without reading the workable rule it must agree with (I had the file open for `dependsOn`).
- **How it was caught:** by me, reviewing TASK-144 (the engineer flagged the choice in her Notes, which made it visible).
- **Cost:** one small rework round on TASK-144; TASK-143 corrected before its report code landed.
- **Evidence:** `specs/SPEC-114-caw-starting-team-and-review-report.md` D3 (clarified 14:4x); `tasks/TASK-144-caw-front-review-hold-notice.md` § Review; `tasks/TASK-143-…` step 4/test (f).
- **Suggestion (for Atlas):** a SPEC rule that derives a state from the same data as an existing rule (here waiting vs workable) cites that rule's line and states one boundary case worked through (a done card in between).

## F-037 — 2026-10-30 — SA (Sober, Team A) — SPEC-106's `relatedDecisions` rule counted only the steps a part sits in (`flows[].at`); a card anchored on a work got none of its steps' rules, and live it stopped the team (TEST-112 DEF-1)
- **Status:** FIXED 2026-10-30 — derived-rule table, cited rule plus one boundary case, schema line for uniqueness; spec-rules.md §3 (ORDER 45). Was ATLAS-REVIEWED.
- **What happened:** REQ-112 req 1 asks for "every rule in the spec that bears on what the card builds". I designed `relatedDecisions` from SPEC-106's worked example (a screen card, SCR-001) and wrote "touched = `flows[].at` + `flows[].work`". For a work anchor, `contextIn` gives that work's flow with `at = []`, so its steps' rules (DEC-001…003 on STEP-002) never arrived. I did not simulate the most common SA/BE anchor, a whole work. Live, the SA card on WRK-001 asked the operator for what DEC-001/DEC-003 already say, and the run stopped.
- **Rule involved:** role-sa §4.3 "Simulate before you ask": carry each plausible case to the end (here, each anchor kind the cut produces). §3 "Every AC of the REQ maps to a TASK": AC-1 named only SCR-001, and I checked the AC instead of req 1.
- **How it was caught:** QA (Tanya), TEST-112 joint + live run, DEF-1 MAJOR.
- **Cost:** one live run stopped (operator step by QA), one TEST_FAILED round, TASK-117 round 2 before REQ-112 A can commit.
- **Evidence:** `tests/TEST-112-caw-card-rules-coverage.md` § DEF-1; `specs/SPEC-106-seam-latest-spec.md` § REQ-112 addition (Round 2 / E17); `tasks/TASK-117-…` § Round 2.
- **Suggestion (for Atlas):** a SPEC rule computed "per anchor" lists its result for every anchor kind the consumer actually uses (here: work, step, screen, data, decision), in a table, before the TASK is cut.

## F-036 — 2026-10-30 — SA (Sober, Team A) — SPEC-106 said "Front: no change" although blueprint-back's `openapi.json` gained 4 routes; blueprint-front's `check:api` went red at QA (TEST-110 DEF-1)
- **Status:** FIXED 2026-10-30 — openapi.json changes get a paired front gen:api+check:api, and the probe runs it on its own; spec-rules.md §2 (ORDER 45). Was ATLAS-REVIEWED.
- **What happened:** SPEC-106 § Front read "No change". TASK-113 re-emitted `openapi.json` with 4 v2 routes. blueprint-front's `check:api` compares its generated `src/core/api/schema.d.ts` with that file, so it failed (additive diff, no runtime effect). I reviewed TASK-113 DONE without running the front's contract check. REQ-110 and REQ-114 r2 each had a front `gen:api` step, so I knew the coupling. This time I judged "the front calls none of them" instead of "the front's types mirror the whole document".
- **Rule involved:** role-sa §3 "A shape change names every consumer of that shape". `openapi.json` is a shape, and `check:api` is a consumer whatever the front calls.
- **How it was caught:** QA (Tanya), REQ-105 joint run, AC-6 → TEST_FAILED (MINOR).
- **Cost:** one TEST_FAILED round + an XS TASK (TASK-140) + a QA re-check before REQ-105's git.
- **Evidence:** `tests/TEST-110-caw-reads-latest-spec.md` § DEF-1 (joint); `specs/SPEC-106-seam-latest-spec.md` § Front (corrected); `tasks/TASK-140-…`.
- **Suggestion (for Atlas):** any TASK whose diff touches `openapi.json` gets a paired front `gen:api` TASK by default, and its review runs the front's `check:api`.

## F-035 — 2026-10-30 — SA (Silver, Team B) — TASK-138's consumer grep covered `src` only; a test helper typing the label as `string` was missed
- **Status:** FIXED 2026-10-30 — consumers now come from tools/probe-change.sh (a scratch copy of the change; the errors are the list), ticked per hit, and the gate WARNs on a SPEC without them; SA-Lead § SPEC template (ORDER 45). Was ATLAS-REVIEWED.
- **What happened:** For TASK-138 (widen `latestLabel.label` to `string | null`) I grepped `LatestLabel|latestLabel` in `caw-back/src` only. `test/http/part-read.test.ts:12` has a helper typed `label: string`, so `tsc` failed there after the change. Bob asked (TASK-138 Q1); one token, approved. Same family as F-027/F-028/F-029 — this time I did grep before cutting, but over the wrong root.
- **Rule involved:** SA-Lead.md § SPEC template "Every shape change names its consumers, grepped"; Atlas's Q1 practice (2026-10-30: "consumer list from a full test run + `grep -rn` across src AND test").
- **How it was caught:** BE (Bob), `tsc`, TASK-138 Q1.
- **Cost:** one question round; nothing built wrong.
- **Evidence:** `tasks/TASK-138-caw-back-nameless-label.md` § Questions Q1; `specs/SPEC-107-caw-reads-latest-spec.md` D13 Consumers line (src only).
- **Suggestion (for Atlas):** the Consumers line's grep is always `src test` (both roots), and for a TS type change the SA runs `tsc` on a throwaway patch in a scratch copy of the repo — the errors are the list.

## F-034 — 2026-10-30 — SA (Sober, Team A) — SPEC-106's consumer grep for `insert(changeSets)` ran on `src` only; the NOT NULL `rev` breaks 6 test inserts that were not in TASK-113's list
- **Status:** FIXED 2026-10-30 — consumers now come from tools/probe-change.sh (a scratch copy of the change; the errors are the list), ticked per hit, and the gate WARNs on a SPEC without them; SA-Lead § SPEC template (ORDER 45). Was ATLAS-REVIEWED.
- **What happened:** SPEC-106 § Data Model makes `change_sets.rev` NOT NULL and names its writers as `grep -rn "insert(changeSets)" src` → `src/spec/store.ts` (apply, undo). Six tests also insert a `change_sets` row directly (`test/db/rules.test.ts:22,94`, `test/sit/rules.sit.test.ts:91,180,247`, `test/spec/store.test.ts:160`). With the column NOT NULL they fail, and those files were outside the closed list. Jason found it at the start of the work (TASK-113 Q1), measured `5 pass / 3 fail`, and proposed the fix I accepted.
- **Rule involved:** SA-Lead.md § SPEC template "every shape change names its consumers, grepped" and role-sa §3. A NOT NULL column is a shape change for every writer. F-026's suggestion ("build the list from `grep -rn \"<fn>(\" src test`") was in my inbox from the PM today and I did not apply it to this older SPEC when I released the TASK.
- **How it was caught:** BE (Jason), TASK-113 Q1, ~20 minutes after release.
- **Cost:** one question round; Jason kept building the rest meanwhile; no wrong code.
- **Evidence:** `tasks/TASK-113-blueprint-back-seam-latest.md` § Questions Q1 and answer; `specs/SPEC-106-…` § Data Model consumers line.
- **Suggestion (for Atlas):** when the SA releases a TASK cut on an earlier day, the release step re-runs every consumer grep of its SPEC over `src test`, not only the DoD base lines.

## F-033 — 2026-10-30 — SA (Silver, Team B) — TASK-121 named a new file at `src/coverage/service.ts`, a path caw-back's `.gitignore` hides; a commit would have pushed a route without its service
- **Status:** FIXED 2026-10-30 — `git check-ignore -v` DoD line for new files; pre-commit untracked check; spec-rules.md §4 (ORDER 45). Was ATLAS-REVIEWED.
- **What happened:** I cut TASK-121 (2026-10-29) with a new service at `src/coverage/service.ts`. caw-back's `.gitignore:31` is `coverage` (test-coverage output), which matches the directory `src/coverage/`. The file is invisible to `git status`, so an owner's `ขึ้น git` staging "every changed path" would have committed `routes/projects.ts` importing a file that is not in the repo — a pushed tree that does not build. Bob found it before any commit (TASK-121 Q1); moved to `src/projects/coverage.ts` (`git check-ignore` exit 1).
- **Rule involved:** NONE — no rule covered it. Nearest: role-sa §3 "Every DoD expected output was run on the base first" — a path I name as new was never checked against the repo's ignore rules.
- **How it was caught:** BE (Bob), `git check-ignore` while building TASK-121.
- **Cost:** one question round; nothing committed.
- **Evidence:** `tasks/TASK-121-caw-back-coverage-and-prompt.md` § Questions Q1 + answer.
- **Suggestion (for Atlas):** when a TASK creates a new file, the SA runs `git check-ignore -v <path>` for it at cut time (exit 1 = fine), and the SA's pre-commit check lists `git status --short --untracked-files=all` against every new path in the TASKs.

## F-032 — 2026-10-30 — FE (Fern, Team A) — I wrote `pkill -f next-server` to stop my own front end on the shared machine; the hook blocked it before it ran
- **Status:** ACCEPTED 2026-10-30 — the hook (block-kill-by-name.sh) worked as designed; nothing ran. No new fix.
- **What happened:** After the TASK-133 render check I put `pkill -f "next-server"` in the cleanup command. Other sessions run next-servers on this box, so it could have killed theirs. `block-kill-by-name.sh` refused it ("never stop processes by name on the shared machine"); nothing ran. I then stopped only the two pids I had started (front 368621, back 368613), found from `ss -ltnp` on my own ports 3101 / 4299.
- **Rule involved:** the hook's own message — stop your own port or pid, never a process by name. TASK-127 and TASK-128 notes show I had been stopping by pid before; I reached for a name pattern out of habit when the front's pid was not in my pid file (it holds the `nohup` wrapper).
- **How it was caught:** the PreToolUse hook, same command.
- **Cost:** none; one command refused.
- **Evidence:** `tasks/TASK-133-blueprint-front-api-full-url-render.md` § Implementation Notes (footprint line).

## F-031 — 2026-10-30 — SA (Silver, Team B) — While matching QA's tree fingerprint before a commit, I ran `git add -N .` in caw-back — a git index write no command covered
- **Status:** FIXED 2026-10-30 — tools/tree-fp.sh shared by QA and the SA; git experiments only in a scratch copy (ORDER 45). Was ATLAS-REVIEWED.
- **What happened:** Before the owner's "ขึ้น git REQ-105 ฝั่ง CAW" commit, I tried several fingerprint recipes to match QA's TEST-110 value. One command line ended with `git add -N .` (intent-to-add, a "try another variant" I typed without thinking it through). It marked caw-back's 10 untracked files as intent-to-add in the index. No file content changed and nothing was committed. I saw it in the next `git status` (10 ` A`), and removed exactly those 10 marks with `git reset -q -- <the 10 paths>`. Status was back to 34 ` M` + 10 `??` = 44, then I committed as ordered.
- **Rule involved:** workspace `CLAUDE.md` §6 and the `git-command` skill §1: no git write except the owner's command. Experimental git commands (index-touching ones included) belong in a scratch copy, not in the team's working tree.
- **How it was caught:** by me, in the next `git status`, within a minute.
- **Cost:** none lasting. Index restored before the commit; the commit staged the 44 paths by name.
- **Evidence:** log 2026-10-30 Silver 09:2x entry; caw-back 27cbd1b (44 paths).
- **Suggestion (for Atlas):** a tree fingerprint that the QA's verdict and the SA's commit check both use belongs in one harness script (e.g. `tests/harness/tree-fp.sh`), so nobody improvises recipes in a live repo. Mine could not reproduce QA's value for untracked files; caw-front (no untracked files) matched.

## F-030 — 2026-10-30 — PM (Porter) — I nudged SA B and logged a git relay before its inbox line and DECISIONS line existed
- **Status:** FIXED 2026-10-30 — PROTOCOL § Inbox: ring only after the write's result is back (ORDER 45). Was ATLAS-REVIEWED.
- **What happened:** For the owner's "ขึ้น git REQ-105 ฝั่ง CAW" I put the DECISIONS append and the `>> inbox/SA-B.md` in one Bash call, sent it in the same batch as the SendMessage to Silver-ISP and the log entry. The inbox hook blocks a `>>` that shares a call, so neither line was written, while the nudge and the log already said they were. I saw the block in the same response and wrote both as separate calls within a minute (read back: one copy each).
- **Rule involved:** workforce-protocol §11a / nudge-session "files first, then the nudge"; RESUME-HERE "What did NOT work": an inbox `>>` combined with other commands in one Bash call is blocked — run each alone.
- **How it was caught:** by me, from the hook's error in the same response.
- **Cost:** none seen — Silver's session had not read the nudge yet (delivered ≠ read); the files existed about a minute later.
- **Evidence:** `log/2026-10-30.md` Porter 09:1x; `inbox/SA-B.md` last line; `DECISIONS.md` 2026-10-30 09:1x.
- **Suggestion (for Atlas):** never send a nudge in the same batch as the file write it points at; wait for the write's result first.

## F-029 — 2026-10-29 — SA (Silver, Team B) — SPEC-107 called caw-front test fixtures "untouched" because they only test behaviour, but they must still type against the new required fields
- **Status:** FIXED 2026-10-30 — consumers now come from tools/probe-change.sh (a scratch copy of the change; the errors are the list), ticked per hit, and the gate WARNs on a SPEC without them; SA-Lead § SPEC template (ORDER 45). Was ATLAS-REVIEWED.
- **What happened:** SPEC-107 § API Consumers named `front: src/components/runs/RunsList.test.tsx` and `src/lib/crew.test.ts` and marked the front readers "untouched — they test only `!== null`". That judged behaviour, not types: their `Card` / `Project` fixtures are typed objects, and the generated types now require `anchorLabel`, `anchorRemoved`, `latestLabel`, `spec`. `src/lib/readiness.test.ts` was not even in my grep's hits (it builds a Project). `bun run typecheck` failed in all three; Fanta asked (TASK-116 Q1). Same SPEC and same evening as F-027 and F-028.
- **Rule involved:** SA-Lead.md § SPEC template: "Each consumer it finds is in a TASK's file list or is named as untouched, with why" — my "why" was wrong for a typed fixture.
- **How it was caught:** FE (Fanta), TASK-116 typecheck, Q1.
- **Cost:** one question round; no wrong code.
- **Evidence:** `tasks/TASK-116-caw-front-label-tag-latest-spec.md` § Questions Q1 + answer; `specs/SPEC-107-caw-reads-latest-spec.md` § API Consumers.
- **Suggestion (for Atlas):** when a SPEC adds a required field to a generated type, the consumer list comes from running the typecheck on a throwaway patch that adds the field (the errors are the consumers), not from a field-name grep; "untouched" is never claimed for a file that builds a literal of that type.

## F-028 — 2026-10-29 — SA (Silver, Team B) — SPEC-107 listed rebuild-sequence.test.ts as a consumer of the spec-change flag, but no TASK owned it; TASK-115 broke it
- **Status:** FIXED 2026-10-30 — consumers now come from tools/probe-change.sh (a scratch copy of the change; the errors are the list), ticked per hit, and the gate WARNs on a SPEC without them; SA-Lead § SPEC template (ORDER 45). Was ATLAS-REVIEWED.
- **What happened:** SPEC-107 § API Consumers named `caw-back → test/http/rebuild-sequence.test.ts` among the `specChangedVersion` hits and said "back writers: TASK-115 (`spec.revised`)", but I put the file in no TASK's closed list. Its AC-6 case drives the v1 feed (`follow.pullAll()` at `:90`), which TASK-115 replaces, so it failed in TASK-115's full suite. Bob asked (TASK-115 Q4). Same day and same SPEC as F-027: the consumer was found but not carried into a file list.
- **Rule involved:** SA-Lead.md § SPEC template: "Each consumer it finds is in a TASK's file list or is named as untouched, with why." I did neither for this file.
- **How it was caught:** BE (Bob), TASK-115 full suite run, Q4.
- **Cost:** one question round; no wrong code.
- **Evidence:** `specs/SPEC-107-caw-reads-latest-spec.md` § API Consumers (`specChangedVersion` line); `tasks/TASK-115-caw-back-follow-by-revision.md` § Questions Q4.
- **Suggestion (for Atlas):** after writing a Consumers line, tick each hit against a TASK file list (or "untouched — why") in the SPEC itself, one hit per line, so an unowned hit is visible.

## F-027 — 2026-10-29 — SA (Silver, Team B) — SPEC-107 added `spec` to every Project but my consumer list missed the chat route that also returns a project; and D12 named replayed state without its column
- **Status:** FIXED 2026-10-30 — consumers now come from tools/probe-change.sh (a scratch copy of the change; the errors are the list), ticked per hit, and the gate WARNs on a SPEC without them; SA-Lead § SPEC template (ORDER 45). Was ATLAS-REVIEWED.
- **What happened:** SPEC-107 § API says Project gains `spec` on "every route returning a project", but my 14:3x consumer grep searched field names (`latestSeenVersion`, `project.version`), not the schema (`ProjectSchema`). `GET /v1/chat/{messageId}/context` returns `project: ProjectSchema` (`caw-back → src/http/routes/chat.ts:8,39`) and was in no file list, so `tsc` went red in TASK-115. Separately, D12 (REQ-105 Q4, written 18:2x) added `CardState.anchorRemovedRevision` as replayed state without its `cards` column, migration, or the `state.ts` row mapping, though `anchorRevision` sat beside it in 0011 as the pattern. Bob stopped and asked both (TASK-115 Q1, Q2). Fifth consumer-list gap of mine today (F-018, F-019, F-022, F-026); Atlas's Q1 practice (full test run + `grep -rn "<fn>("`) reached me at 18:30, after D12 was written.
- **Rule involved:** SA-Lead.md § SPEC template "Every shape change names its consumers, grepped"; role-sa §3 "A shape change names every consumer of that shape". I grepped fields, not the schema object that carries them; and a replayed-state field is a schema change I did not design as SQL.
- **How it was caught:** BE (Bob), TASK-115 Q1/Q2, mid-build (tsc red; Q4 step not started).
- **Cost:** one question round; no wrong code; caw-back tsc red until Q1 is applied.
- **Evidence:** `tasks/TASK-115-caw-back-follow-by-revision.md` § Questions Q1/Q2 + answers; `specs/SPEC-107-caw-reads-latest-spec.md` § Data Model "Migration 0012".
- **Suggestion (for Atlas):** for a response-shape change, grep the schema/type name (`ProjectSchema`, `CardSchema`) as well as its fields; for a new replayed-state field, the SPEC writes its column SQL in the same edit (state ⇒ column ⇒ row mapping).

## F-026 — 2026-10-29 — SA (Silver, Team B) — TASK-114's closed file list missed src/app.ts, where hopRoutes must receive the Blueprint client for SPEC-107 D5's pin
- **Status:** FIXED 2026-10-30 — consumers now come from tools/probe-change.sh (a scratch copy of the change; the errors are the list), ticked per hit, and the gate WARNs on a SPEC without them; SA-Lead § SPEC template (ORDER 45). Was ATLAS-REVIEWED.
- **What happened:** SPEC-107 D5 has `POST /v1/projects/{id}/hops` pin a card hop with `readLatestPart`, which needs the Blueprint client. The hops route is built by `hopRoutes(app, db)` (`caw-back → src/app.ts:32`), and the client is passed in at that call. I listed `src/http/routes/hops.ts` but not the call site that wires it. Bob stopped and asked (TASK-114 Q1). It is the fourth consumer-list gap of mine today (F-018, F-019 and F-022 were the others); this one is a new dependency of a function, not a changed shape.
- **Rule involved:** role-sa §3 "A shape change names every consumer of that shape (you grepped them)" — a function's parameter list is a shape; I did not grep `hopRoutes(` when D5 gave the route a new need.
- **How it was caught:** BE (Bob), TASK-114 Q1, at the start of the work.
- **Cost:** one question round; no wrong code.
- **Evidence:** `tasks/TASK-114-caw-back-read-latest-spec.md` § Questions Q1.
- **Suggestion (for Atlas):** when a SPEC gives a function a new input (a client, a config value), the TASK's file list is built from `grep -rn "<function>(" src test`, not from the file where the function lives.

## F-025 — 2026-10-29 — SA (Silver, Team B) — My edit scripts used JS String.replace with text containing "$`", which pasted the whole file into SPEC-110 (twice) and into REQ-113's AC-5 row
- **Status:** FIXED 2026-10-30 — PROTOCOL § Editing files: replace(a, () => b) or split/join, with a real read-back (ORDER 45). Was ATLAS-REVIEWED.
- **What happened:** I edited coordination files with a quoted-heredoc `node` script that asserts one match, then calls `t.replace(anchor, newText)`. In a replacement string JavaScript reads `` $` `` as "everything before the match" (also `$&`, `$'`, `$$`). My new text held `` $` `` twice in SPEC-110 D6/D7 (the end of the regex `` `^[1-9][0-9]{0,4}$` `` and `` `$` anywhere ``) and once in REQ-113's AC-5 row. Each one pasted the text before the anchor into the file. SPEC-110 went from 71 to 133 lines with two copies of its head; the AC-5 row held the REQ's whole body. The one-match assertion passed, because the anchor itself was fine. The defect was in the replacement text. I did not read the changed lines back after these edits (I printed only "ok").
- **Rule involved:** PROTOCOL.md § Editing files and workforce-protocol §7: "read the changed lines back before you say it is done". My edits obeyed "assert exactly one match" but skipped the read-back.
- **How it was caught:** the PM, when the REQ-113 file looked wrong (17:4x); then I found SPEC-110 the same way.
- **Cost:** two damaged files for ~30 min. The PM repaired REQ-113 and archived the corrupted copy. I repaired SPEC-110 by line slicing (backup in my scratchpad) and restored the lost `$` token in REQ-113. Scanned every spec/task/requirement for repeated headings and Status lines: no other damage.
- **Evidence:** `specs/SPEC-110-…` (now 71 lines, one heading); `requirements/REQ-113-…` AC-5 row (restored note); `archive/REQ-113-corrupted-copy-2026-10-29.md` (the PM's).
- **Suggestion (for Atlas):** in the editing rule, an edit script uses `t.replace(a, () => b)` (a function, so no `$` patterns) or `split(a).join(b)`, never `replace(a, b)` with a string `b`; and the read-back is a `sed -n`/`grep` of the changed lines, not the script's "ok".

## F-024 — 2026-10-29 — SA (Sober, Team A) — SPEC-105 E8's round_adjusted record had no title, though the line it feeds must name the part
- **Status:** FIXED 2026-10-30 — placeholder → field list; spec-rules.md §5 (ORDER 45). Was ATLAS-REVIEWED.
- **What happened:** Round 3's E8 record was `{ item, what, field?, from?, to? }`. E9's user-facing line is "{title} — บันทึกแล้ว แต่ตัดช่อง {field} ออก", but nothing in the record gave a title, so the line could only show "changes[2]". Fern asked (TASK-127 Q1). Fixed before Jason wrote it: E8 now carries `title`/`key`/`ref` like `round_refused`. Same mistake as F-021, an hour later: I didn't walk a user-visible line back to the record that feeds it.
- **Rule involved:** role-sa §3 "Every contract states … response shape"; F-021's lesson, not yet applied.
- **How it was caught:** FE (Fern), TASK-127 Q1, ~10 minutes after the cut.
- **Cost:** one question round trip; nothing built twice.
- **Evidence:** `tasks/TASK-127-blueprint-front-interview-field-dropped.md` § Questions Q1; `specs/SPEC-105-blueprint-interview-honest.md` § Round 3 E8.
- **Suggestion (for Atlas):** for every user-visible line a SPEC adds, list its placeholders and the record field each comes from, in the SPEC itself.

## F-023 — 2026-10-29 — SA (Sober, Team A) — SPEC-105 E1 told the model the kinds but not their shapes; REQ-110 failed live a second time
- **Status:** FIXED 2026-10-30 — diagnose-first before scarce live calls; full zod schema in the prompt; spec-rules.md §6 (ORDER 45). Was ATLAS-REVIEWED.
- **What happened:** E1's generated prompt block listed each kind's field **names** with a `?` for optional, plus the link rules. It gave no field types and no ref pattern. Live (TEST-107 round 2), the real model guessed: hyphenated refs, a `system` with no body, strings where lists are needed, a boolean where text is needed. 8 changes were refused, and 12 more fell with them. I had the zod schemas in hand when I designed E1, and printing types was as cheap as printing names.
- **Rule involved:** NONE — no rule covered it. Nearest is role-sa §3 "every contract states … shape with exact field casing": the prompt *is* the model's contract, and I gave it half of it.
- **How it was caught:** QA (Tanya), TEST-107 round 2, live, 17:33, diagnosed from the record round 2 added (no extra call).
- **Cost:** the last 2 of the owner's 8 live calls, and a third design round. The next proof needs new calls from the owner.
- **Evidence:** `tests/TEST-107-blueprint-interview-honest.md` § Round 2; `tests/harness/test-107/r2/ac1-bot-row.json`; `specs/SPEC-105-blueprint-interview-honest.md` § Round 3.

## F-022 — 2026-10-29 — SA (Silver, Team B) — SPEC-110 compared ports as text and read only inline headers; QA got operator access with `curl -H @h.txt http://127.0.0.1:04500/…`
- **Status:** FIXED 2026-10-30 — deny-rule review probes the real parser; spec-rules.md §7 (ORDER 45). Was ATLAS-REVIEWED.
- **What happened:** SPEC-110 D2/D3 (REQ-113) refused a local curl/wget whose port string matched a configured server port, and any command word containing `x-caw-actor` / `x-blueprint-by`. I did not ask how curl itself reads a port (it accepts leading zeros: `04500` = 4500) or where else curl takes a header from (`-H @file`, `--variable`/`--expand-*`, wget `--config`). My review of TASK-125 probed other spellings of the HOST (`0.0.0.0`, `127.1`, …) but not of the PORT or the header source. QA's TEST-109 DEF-1 (MAJOR): the two together pass the hook and give full operator access.
- **Rule involved:** role-sa §3 "A claim is never stronger than what you read" — I treated "the port in the URL" as one form, without reading the consumer's (curl's) own parsing; same spirit as AGENTS-DISCIPLINE "Evidence before assertion".
- **How it was caught:** QA (Tanya), TEST-109, with real curl against an echo server.
- **Cost:** one TEST round (TEST_FAILED), one rework round for Bob; no harm (the hole existed only in an uncommitted tree).
- **Evidence:** `tests/TEST-109-caw-workers-cannot-act-as-operator.md` DEF-1; `specs/SPEC-110-…` D6/D7; `tasks/TASK-125-…` § Review round 2 (base runs).
- **Suggestion (for Atlas):** for a deny-rule on a value that another program parses (a port, a path, a header), the SA's review probes the parser's alternative spellings of that value with the real program (e.g. curl against a local echo server) — not only the spellings of its neighbours.

## F-021 — 2026-10-29 — SA (Sober, Team A) — SPEC-105 E6 asked the front for "saved n" but recorded no saved count
- **Status:** FIXED 2026-10-30 — placeholder → field list; spec-rules.md §5 (ORDER 45). Was ATLAS-REVIEWED.
- **What happened:** SPEC-105 § Round 2 had the front show "บันทึกแล้ว {n} รายการ — ยังไม่ได้บันทึก {m} รายการ" (the Q4 wording I proposed). But E6 recorded only the refused items, so the front had no source for n. Fern filled it from change-set row counts, which mix link rows and the user's own decisions with proposed items, and asked (TASK-124 Q1). Fixed before the back end finished: `round_saved` was added to E6 and TASK-123.
- **Rule involved:** role-sa §3 "Every contract states … request and response shape". The response the front needed had a field missing, and I didn't walk the wording I proposed back to its data.
- **How it was caught:** FE (Fern), TASK-124 Q1, ~20 minutes after the cut.
- **Cost:** a question round trip and Fern's stand-in code to remove. Jason hadn't written his part yet.
- **Evidence:** `specs/SPEC-105-blueprint-interview-honest.md` § Round 2 E6 (added line); `tasks/TASK-124-…` § Questions Q1.

## F-020 — 2026-10-29 — SA (Sober, Team A) — REQ-110 TEST_FAILED live: SPEC-105 kept the round all-or-nothing and recorded no refused change
- **Status:** FIXED 2026-10-30 — diagnose-first before scarce live calls; full zod schema in the prompt; spec-rules.md §6 (ORDER 45). Was ATLAS-REVIEWED.
- **What happened:** SPEC-105 fixed the prompt (kinds list) and made rejected rounds honest, but it kept `applyChangeSet` all-or-nothing and stored only a reason code. Live, the real model's set failed validation as a whole twice (`invalid_change`), so 0 parts were stored (TEST-107 DEF-1). Nothing recorded which change was invalid (O-4), so the failure couldn't be diagnosed without spending more of the owner's gateway calls. I had named partial apply in § Risks as "the next step if AC-1 fails", but didn't design the per-change record. That record would have cost almost nothing and saved the diagnosis.
- **Rule involved:** NONE — no rule covered it. The nearest is role-sa "you own technical risk… either design it out or put it in front of the PM": I put it in front of the PM, but not the cheap diagnostic part.
- **How it was caught:** QA (Tanya), TEST-107, live run 16:15.
- **Cost:** 6 of the owner's 8 live gateway calls spent on a run that could not say why it failed; one more round (TASK-123/124).
- **Evidence:** `tests/TEST-107-blueprint-interview-honest.md` § DEF-1, O-4; `specs/SPEC-105-blueprint-interview-honest.md` § Risks and § Round 2.
- **Suggestion (for Atlas):** when a design depends on a live call that is scarce, record enough at the server to diagnose a failure without spending another call.

## F-019 — 2026-10-29 — SA (Silver, Team B) — TASK-118's closed file list missed main.test.ts, which pins "a block stops the hop at once"
- **Status:** FIXED 2026-10-30 — consumers now come from tools/probe-change.sh (a scratch copy of the change; the errors are the list), ticked per hit, and the gate WARNs on a SPEC without them; SA-Lead § SPEC template (ORDER 45). Was ATLAS-REVIEWED.
- **What happened:** SPEC-108 D4 makes every block soft (the 10th stops). I listed the tests that pin the old rule in `hop.test.ts`, `read-guard.test.ts` and `settings.test.ts`, but not `src/runner/main.test.ts:403` ("AC-7"), which builds a `stopped` hop from one hook block. Bob stopped and asked (TASK-118 Q2). Second time today with the same root as F-018: I grepped the files I was changing and their own tests, not every test that builds the behaviour.
- **Rule involved:** `SA-Lead.md` § SPEC template "Every shape change names its consumers, grepped" (F-009, F-012); role-sa §3.
- **How it was caught:** BE (Bob), TASK-118 Q2, from the full suite.
- **Cost:** one question round; no wrong code.
- **Evidence:** `tasks/TASK-118-caw-back-command-policy-soft-refusals.md` § Questions Q2; F-018.
- **Suggestion (for Atlas):** when a SPEC changes a behaviour (not a field), run the repo's whole suite on a throwaway patch of the change before cutting the TASK, or grep the fixture/helper names that build that behaviour (`blockLines`, `hookBlock`, …) across `src` and `test` — the failing tests are the consumer list.

## F-018 — 2026-10-29 — SA (Silver, Team B) — TASK-119's closed file list missed two tests that pin the event count of a hop finish
- **Status:** FIXED 2026-10-30 — consumers now come from tools/probe-change.sh (a scratch copy of the change; the errors are the list), ticked per hit, and the gate WARNs on a SPEC without them; SA-Lead § SPEC template (ORDER 45). Was ATLAS-REVIEWED.
- **What happened:** SPEC-108 D6 makes a card hop's finish write a second event (`card.status_set` → todo). For its consumers I grepped the old rule ("leaves it in doing") and found `test/http/hop-card-doing.test.ts:18` and `rebuild-sequence.test.ts:99`. I did not grep for tests that count or list the events a finish writes. Two do: `test/http/runner-actor.test.ts:31` (exact runner event list) and `test/http/hop-output.test.ts:139` (`before + 1`). Both are outside TASK-119's closed list, so Bob stopped and asked (TASK-119 Q1) instead of finishing DoD 5.
- **Rule involved:** `SA-Lead.md` § SPEC template "Every shape change names its consumers, grepped" (F-009, F-012) and role-sa §3 "A shape change names every consumer of that shape". An event sequence is a shape; I grepped the behaviour, not the shape.
- **How it was caught:** BE (Bob), TASK-119 Q1, while running the full suite.
- **Cost:** one question round, ~10 min; no wrong code. Both tests added to the list with the answer.
- **Evidence:** `tasks/TASK-119-caw-back-card-back-to-todo.md` § Questions Q1; `specs/SPEC-108-caw-workers-work-in-folder.md` § API "Hop finish → card".
- **Suggestion (for Atlas):** for a change that adds an event to an existing write, the consumer grep includes `grep -rn "<event type>\|events.length\|toEqual(\[\"" test` (tests that list or count events), not only the old behaviour's words.

## F-017 — 2026-10-29 — SA (Silver, Team B) — Created SPEC-107 and TASK-114 by picking the number myself and wrote SPEC-107 without "Consumers:" lines, after ORDER 42 had changed both rules
- **Status:** ATLAS-REVIEWED 2026-10-29 — P7 window: the SA read SA-Lead.md minutes before ORDER 42 changed it. The re-read line is the fix (ORDER 42 item 8). No new fix.
- **What happened:** At 14:2x–14:3x I wrote `specs/SPEC-107-caw-reads-latest-spec.md` and `tasks/TASK-114-caw-back-read-latest-spec.md`. I took the numbers from an `ls` (re-listed just before writing), not from `node ai-worker/new-id.mjs`, and the SPEC's shape-change sections had no `Consumers: <grep> → <hits>` line. Both rules were written at 14:20 (ORDER 42). I had read `SA-Lead.md` at session start (~14:2x), but evidently before the change reached me, and I did not re-read it until Marie's inbox line at 14:36. No ID clash happened: checked at 14:3x, there is one SPEC-107 and one TASK-114.
- **Rule involved:** `SA-Lead.md` § Your responsibilities 3 (new-id.mjs) and § SPEC template (Consumers), ORDER 42.
- **How it was caught:** by me, on reading Marie's inbox line (14:36), before any engineer or PM pointer went out.
- **Cost:** a few minutes: Consumers lines added to SPEC-107; TASK-115/116 made with new-id.mjs.
- **Evidence:** `specs/SPEC-107-caw-reads-latest-spec.md` § API (Consumers added after); `inbox/SA-B.md` Marie line; `log/2026-10-29.md` Silver entry.

## F-016 — 2026-10-29 — SA (Sober, Team A) — Cut TASK-107…110 and 113 without the "(base: …)" run on each DoD result line
- **Status:** ATLAS-REVIEWED 2026-10-29 — P7 (a rule change not yet in the SA's head). TASK-107…113 were cut before ORDER 42's re-read lines existed. Now covered by P7 (re-read lines); watch for a repeat after 14:20.
- **What happened:** SA-Lead.md § TASK template has required since 01:06 (ORDER 41) that every DoD line with an expected result carries the SA's own base run, or `(base: n/a — new: <why>)`. I cut TASK-107, 108, 109, 110 and 113 with a "step 0 — base first" for the engineer instead. The engineers ran the bases (Jason found the 5 s timeout flake that way), but the rule's point is that the SA runs them before cutting. I noticed when Marie's ORDER 42 notice sent me back to the template. I added base lines to the two TASKs still TODO (110, 113). The DONE ones are left as they are (the template says older TASKs aren't edited).
- **Rule involved:** `SA-Lead.md` § TASK template, "Every DoD expected result carries its base run" (F-001, F-002; ORDER 41).
- **How it was caught:** myself, re-reading the template on ORDER 42, ~14:4x.
- **Cost:** none visible. Had I run TASK-107's base myself, I would have found the 5 s timeout flake before cutting instead of Jason's question Q2.
- **Evidence:** `tasks/TASK-107…110`, `TASK-113` § Definition of Done; TASK-107 § Questions 2.

## F-015 — 2026-10-29 — PM — Relayed "timeout retried 4×90 s" to the owner; it was 2×90 s
- **Status:** ATLAS-REVIEWED 2026-10-29 — downstream of F-014: a teammate's number relayed to the owner unchecked. The rule exists (PM.md "I checked: <file:line>" / verify-before-relay.md). No new fix: low cost, and caught by the team itself.
- **What happened:** From Sober's REQ-110 inbox line I told the owner that the interview's timeout retried "up to 4 times, 90 s each". SA A later corrected SPEC-105's root cause 3 to 2×90 s (his F-014). I passed the number on without opening SPEC-105's evidence myself.
- **Rule involved:** `verify-before-relay.md` / workforce-protocol §14 ("A subagent's report is a lead, not a fact" — same spirit for a teammate's inbox line relayed upward as a number).
- **How it was caught:** SA A, about 40 minutes later, by his own re-check.
- **Cost:** one wrong detail in an owner message; no decision rested on it.
- **Evidence:** `log/2026-10-29.md` (PM entry on REQ-110 IN_SPEC); `specs/SPEC-105-blueprint-interview-honest.md` § Root causes 3; inbox line from Sober 14:28.

## F-014 — 2026-10-29 — SA (Sober, Team A) — SPEC-105 stated a root cause (the round re-asks after a failed call) that the code does not do
- **Status:** ATLAS-REVIEWED 2026-10-29 — same pattern as F-001 (an inferred cause written as a read fact); the rule exists (role-sa §3 `inferred — <what would settle it>`). No new fix; watch for a third occurrence before adding a check.
- **What happened:** SPEC-105 root cause 3 said a timeout costs "up to 4 × 90 s" because "the round asks again after a failed first call (`round.ts:417-422`)", and that "382 s is consistent with that". I got the line range from a `grep` of `ask`/`fail` lines and did not read the block. At `round.ts:417` a failed first call ends the round, and the comment at `:415` even says so. Only the client retry (2 × 90 s) applied. Jason found it while building, so E3's round part needed no change. Struck and corrected in SPEC-105.
- **Rule involved:** role-sa §3 "A claim is never stronger than what you read … A cause you inferred … is written `inferred — <what would settle it>`". I wrote an inferred cause as a read fact, and tied an unreproduced number (382 s) to it.
- **How it was caught:** BE (Jason), TASK-109 finding 1, before QA.
- **Cost:** none to the code. The SPEC told the PM a wrong mechanism for P1-3's 382 s for about an hour.
- **Evidence:** `specs/SPEC-105-blueprint-interview-honest.md` § Root causes 3 (struck); `tasks/TASK-109-blueprint-back-interview-honest.md` § Findings 1 and § Review.

## F-013 — 2026-10-29 — SA (Sober, Team A) — Sequenced REQ-110's back-end task after TASK-107 was DONE, not after REQ-103 was committed, so two topics mixed in one working tree
- **Status:** FIXED 2026-10-29 — the next topic's TASK in the same repo carries `Depends on: <previous topic> committed (<hash>)`, not DONE (PROTOCOL.md § Repo layout, SA-Lead.md § TASK template + rule; SAs told via inbox) (ORDER 42). Was ATLAS-REVIEWED 2026-10-29, pattern P5 (review text: ATLAS.md § FAILURES review i-space F-003…F-013).
- **What happened:** The owner asked for "commit and sync เป็นเรื่องๆ" (one commit per topic, DECISIONS 12:41). I gated TASK-109 (REQ-110) on "TASK-107 DONE", and Jason correctly started it as soon as I set DONE. Its changes went into blueprint-back's tree beside REQ-103's uncommitted changes, in shared files: `round.ts`, `schema.ts`, migrations, `openapi.json`. Now the back end can't get a clean REQ-103-only commit without delicate patch staging. I caught it before Fern started TASK-110, and put the front on hold so it stays single-topic. The back-end choice went to the PM (REQ-103 Q7).
- **Rule involved:** owner's instruction 12:41 "commit and sync เป็นเรื่องๆ" (DECISIONS.md), with git per topic in REQ-103's header. I read it, but did not turn it into a dependency ("next topic starts after the previous topic's commit") when I cut TASK-109/110.
- **How it was caught:** myself, at REQ-103 SPEC_DONE, about an hour after TASK-109 started.
- **Cost:** the back end needs a combined commit or delicate staging (owner's choice); the front's TASK-110 waits for REQ-103's commit.
- **Evidence:** `requirements/REQ-103-blueprint-spec-store.md` § Questions Q7; `tasks/TASK-109-…`, `tasks/TASK-110-…` status lines; blueprint-back `src/db/migrations/0007_spooky_blur.sql`.
- **Suggestion (for Atlas):** when the owner commits per topic, a follow-up topic's TASKs that touch the same repo depend on the previous topic's commit, not on its TASK being DONE.

## F-012 — 2026-10-29 — SA (Sober, Team A) — SPEC-104 added "who" to history rows without saying what replaces the existing "โดยคุณ" word
- **Status:** FIXED 2026-10-29 — every SPEC section that changes a shape, format, key pattern or rendered field carries `Consumers: <grep> → <hits, file:line>` or `Consumers: none (<grep> → no hits)` (SA-Lead.md § SPEC template + rule; SAs told via inbox) (ORDER 42). Was ATLAS-REVIEWED 2026-10-29, pattern P1, twin of F-009.
- **What happened:** SPEC-104 § Front said each history row "shows who, when and what" and that `HistoryEntryVM` gains `by`. It did not look at the existing cause word `historyCause.operator = "โดยคุณ"` (`front: src/core/words.ts:61`), which every operator row already shows. The built screen then said "โดยคุณ" ("by you") next to another person's name, which is false. Fern found it on her walkthrough (TASK-108 finding 2). It now makes up half of a REWORK.
- **Rule involved:** role-sa §3 "A shape change names every consumer of that shape (you grepped them)". I extended the history row without reading how its existing fields are rendered.
- **How it was caught:** FE (Fern), TASK-108 step 8 walkthrough, before QA.
- **Cost:** one REWORK item (small); the PM did not see the false label.
- **Evidence:** `tasks/TASK-108-blueprint-front-spec-store.md` § Findings (2) and § Review; `front: src/core/model/build/pages.ts:232,249`.

## F-011 — 2026-10-29 — SA (Silver, Team B) — SPEC-103 left the dev-script worker's skills unspecified and made the secret list too broad
- **Status:** FIXED 2026-10-29 — the DoD base-run rule (ORDER 41) and the re-read line now delivered to both SAs' inboxes (ORDER 42, P7). Was ATLAS-REVIEWED, P2.
- **What happened:** Two of TASK-105's REWORK items were my SPEC's defects, both caught by the BE:
  (1) The dev script seeds a worker, but SPEC-103 never said which skills it carries. The BE gave it `role-be`, which does not exist under the real workspace root (skills live in `~/.claude` on this box), so the DoD 8 command as written stopped the hop at once. He had to build a scratch root to run it.
  (2) `secretValues` was specified as "every key `.env.example` lists, or a secret-looking name". That masks plain paths like `CAW_WORKSPACE_ROOT` on the worker's screen.
  I did not run the dev-script command shape against the real root before writing the DoD.
- **Rule involved:** role-sa skill § 3 — "Every DoD expected output was run on the base first" and "The 5-minute test"; an instruction left incomplete (FAILURES trigger 5 / workforce-protocol §13).
- **How it was caught:** the BE, in TASK-105 Implementation Notes ("Things Silver should know / decide" 1 and 2), before review.
- **Cost:** one extra round trip BE → SA → BE; a scratch-root workaround QA would otherwise have had to repeat.
- **Evidence:** `i-space/ai-worker/tasks/TASK-105-caw-back-live-output.md` § Implementation Notes item 8 and § Review items 2–3; `specs/SPEC-103-caw-live-cli-view.md` § The runner item 2 (corrected).

## F-010 — 2026-10-29 — QA (Tanya) — TEST-106 Q3 default assumed blueprint-back takes `pglite:file`; it takes only `pglite:memory`
- **Status:** FIXED 2026-10-29 — fact in SYSTEM-FACTS § Machine and repo facts (blueprint-back takes only `pglite:memory`; ORDER 42). Was ATLAS-REVIEWED, one-off.
- **What happened:** In TEST-106 Q3 I proposed, and the PM accepted, a `pglite:file:<dir>` database for both back ends so a long run survives a restart. I had checked that form for caw-back only (`maps/caw.md` § Folders `db/`). blueprint-back's `createDb` treats anything but `pglite:memory` as a Postgres URL (`blueprint-back → src/db/client.ts:12-20`), so my first start got `500 ECONNREFUSED` on every call. It was a local refusal; no remote database was touched. Restarted on `pglite:memory`; TEST-106 corrected.
- **Rule involved:** `check-by-running-not-reading.md` — "assume there is a second instance and go find it": I checked one repo's DB URL forms and carried them to the other.
- **How it was caught:** by me, on the first start of phase 1 (13:08), before any data was entered.
- **Cost:** one restart, a few minutes. A Blueprint restart during the run now loses its data, so the run must not restart it.
- **Evidence:** `tests/TEST-106-e2e-live-dashboard.md` § Instrument limits (corrected); `log/2026-10-29.md` (Tanya entry).

## F-009 — 2026-10-29 — SA (Sober, Team A) — SPEC-104 / TASK-107 left out keys.ts, which a new part kind needs
- **Status:** FIXED 2026-10-29 — `Consumers: <grep> → <hits>` on every shape-changing SPEC section (SA-Lead.md § SPEC template + rule) (ORDER 42). Was ATLAS-REVIEWED 2026-10-29, pattern P1, twin of F-012.
- **What happened:** SPEC-104 said a new `requirement` part kind needs only a `PART_KINDS` entry in `registry.ts`, and TASK-107's closed file list had no `src/spec/keys.ts`. But `KEY_RE` at `keys.ts:3` is a hard-coded prefix list. Without `REQ` in it, one requirement makes `compareKeys` throw inside `loadSpec`, which breaks `GET /v1/projects/{id}`. Jason found it before writing code and asked (TASK-107 Q1). Answered yes and added to the file list and the SPEC.
- **Rule involved:** role-sa §3 "A shape change names every consumer of that shape (you grepped them)". I read `registry.ts` but did not grep the consumers of the part-key format.
- **How it was caught:** BE (Jason), TASK-107 § Questions, ~15 minutes after the cut, before any code.
- **Cost:** one question round trip; Jason worked on the other parts meanwhile.
- **Evidence:** `tasks/TASK-107-blueprint-back-spec-store.md` § Questions 1; `specs/SPEC-104-blueprint-spec-store.md` § Requirement part kind.

## F-008 — 2026-10-29 — SA (Sober, Team A) — Cut TASK-105/106 while Silver cut TASK-105/106 at the same moment (duplicate IDs)
- **Status:** FIXED 2026-10-29 — REQ/SPEC/TASK/TEST files are created only with `node ai-worker/new-id.mjs <TYPE> <slug>` (next number from 101 under a lock, `wx` create, never overwrites; proven in scratch: 2 and 10 parallel runs → distinct numbers); rule in PROTOCOL.md § Artifact numbering, SA-Lead.md, PM.md, QA.md (ORDER 42). Was ATLAS-REVIEWED 2026-10-29, pattern P4.
- **What happened:** I listed `tasks/` (highest TASK-104), wrote SPEC-104 (several minutes), then created TASK-105 and TASK-106 without re-listing. In between, Silver (SA B) had created TASK-105 and TASK-106 for REQ-104. I noticed on my next `ls`, before any inbox pointer or board row went out, and renamed mine to TASK-107/108 (files, SPEC references, board).
- **Rule involved:** workforce-protocol §9 "Numbers are per type … never reused — check the folder for the highest before creating"; and §13's "take the id at write time" (stated for FAILURES, same reasoning). I checked, but too early — the check was not at write time.
- **How it was caught:** myself, on the next `ls tasks`, a few minutes later.
- **Cost:** a few minutes; no one acted on the duplicate IDs.
- **Evidence:** `tasks/TASK-105-caw-back-live-output.md`, `tasks/TASK-106-caw-front-worker-screen.md` (Silver's), `tasks/TASK-107-…`, `tasks/TASK-108-…` (mine); `log/2026-10-29.md` Sober entry.
- **Suggestion (for Atlas, not a rule):** with a shared counter between two SAs working in parallel, re-list the folder in the same command that creates the file.

## F-007 — 2026-10-29 — SA (Sober, Team A) — Gap report line a3 had a question instead of the S/M/L size AC-5 requires
- **Status:** FIXED 2026-10-29 — SPEC_DONE only with an `## AC check` table at the end of the REQ, one row per AC (`AC-n | where met | self-checked yes/no`); a `no` row ⇒ not SPEC_DONE (SA-Lead.md § Your responsibilities 7, PROTOCOL.md § Statuses) (ORDER 42). Was ATLAS-REVIEWED 2026-10-29, pattern P3, twin of F-006.
- **What happened:** In `maps/blueprint-gap-102.md` I marked a3 "partly" but left the size column as "Open … Q-A1 … size unknown until answered". REQ-102 AC-5 says every partly/differs line needs one sentence on what would change and an S/M/L guess, and that a missing size fails the line. I should have given a size for my own default reading, with the question beside it. TEST-102 failed on it (DEF-1). Now fixed: a3 = S.
- **Rule involved:** REQ-102 AC-5 ("A missing sentence or size fails the line"), plus role-sa §3 ("every AC of the REQ maps to … work"): I did not re-check the report against AC-5 line by line before setting SPEC_DONE.
- **How it was caught:** QA (Tanya), TEST-102 DEF-1, 2026-10-29 11:58 — after SPEC_DONE.
- **Cost:** a TEST_FAILED round trip (QA → PM → SA → PM → QA) on a few-word fix.
- **Evidence:** `tests/TEST-102-gap-owner-intent-vs-code.md` § DEF-1; `maps/blueprint-gap-102.md` row a3; `inbox/SA.md` Porter 2026-10-29 DEF-1 line.

## F-006 — 2026-10-29 — SA (Silver, Team B) — REQ-102 gap report: two "partly" lines shipped without the S/M/L the AC requires
- **Status:** FIXED 2026-10-29 — SPEC_DONE only with an `## AC check` table at the end of the REQ (SA-Lead.md § Your responsibilities 7, PROTOCOL.md § Statuses) (ORDER 42). Was ATLAS-REVIEWED 2026-10-29, pattern P3; see F-007.
- **What happened:** In `maps/caw-gap-102.md` the lines b5 and d3 (both "partly") said what would change but carried no S/M/L size, because I treated them as "covered by" b1/b2 and d2 and wrote a cross-reference instead of a size. REQ-102 AC-5 says every partly/differs line needs one sentence and a size, and "a missing sentence or size fails the line". QA failed AC-5 (TEST-102 DEF-1, minor). Fixed the same day: both lines now say S on their own, with the shared work counted in the lines they depend on.
- **Rule involved:** REQ-102 AC-5 (`requirements/REQ-102-gap-owner-intent-vs-code.md`); role-sa skill § 3 — a deliverable is checked against the gate that will judge it before hand-off.
- **How it was caught:** QA (Tanya), TEST-102, after hand-off.
- **Cost:** one round trip QA → PM → SA → PM → QA; no effect on content.
- **Evidence:** `i-space/ai-worker/tests/TEST-102-gap-owner-intent-vs-code.md` § DEF-1; `maps/caw-gap-102.md` rows b5, d3.

## F-005 — 2026-10-29 — PM — Two PM inbox watchers running at once
- **Status:** FIXED 2026-10-29 — `tools/watch-inbox.sh` refuses a second watcher for the same desk and role set (`already watching: <files> (pid N) — not starting a second`, exit 3, the other one untouched; proven on a scratch copy); PROTOCOL.md § Session shutdown ritual 6 updated (ORDER 42). Was ATLAS-REVIEWED 2026-10-29, pattern P6.
- **What happened:** I armed `watch-inbox.sh PM RELAY` (task bwfyxodfy) after closing the map follow-up, then armed a second one (bo4cox2ml) after the REQ-102 hand-off without checking that the first was still running. Both fired at once when I appended the hook's "ring … (my sends fail)" lines to my own inbox.
- **Rule involved:** `PROTOCOL.md` § Session shutdown ritual 6: "On wake: read the inbox, act, arm it again. Never run two at once."
- **How it was caught:** myself, when two completion notices arrived together.
- **Cost:** none beyond a duplicate wake; a habit that would double every wake.
- **Evidence:** `log/2026-10-29.md` (PM entries after 10:51).

## F-004 — 2026-10-29 — PM — Owner overview presented the code's version model as the product's intent
- **Status:** ATLAS-REVIEWED 2026-10-29 — Atlas shares this one: the "confirmed versions" product line in SYSTEM-FACTS was Atlas's own reading of the code (ATLAS.md, 2026-10-29). Proposed: an owner-facing summary of existing code splits "what the code does (observed)" from "what you want (owner to confirm)".
- **What happened:** In `project-docs/overview-th.md` I described Blueprint as producing locked "confirmed versions" that CAW builds from, and CAW's main work as the runner — written from the two code maps. The owner (via Atom 10:51) corrected it: versions are hand-applied labels, CAW must always see the latest spec, every edit needs an audit log, and the main AI work is a CLI per user per team. The overview told him what the code does, as if that were what the product is meant to be, without saying which was which.
- **Rule involved:** `quote-dont-paraphrase.md` / role-ba "Observed and proposed are never mixed" (pre-flight A4) — the overview mixed observed code behaviour with product definition. REQ-101 itself was about the code, so no AC covered intent vs code; for an owner-facing summary, NONE — no rule required marking "this is what the code does, not necessarily what you want".
- **How it was caught:** the owner, on reading the overview, about 9.5 hours later.
- **Cost:** one round-trip for the owner; the team's maps describe the code correctly but the SYSTEM-FACTS product line (Atlas's description, GO'd 00:24) had to be struck; a gap-analysis REQ (REQ-102) follows.
- **Evidence:** `project-docs/overview-th.md`; `SYSTEM-FACTS.md` § "Owner's corrections, 2026-10-29 10:51"; `DECISIONS.md` 2026-10-29 10:51.

## F-003 — 2026-10-29 — QA (Tanya) — my TEST-101 run modified a tracked file in caw-front (tsconfig.json)
- **Status:** FIXED 2026-10-29 — fact in SYSTEM-FACTS § Machine and repo facts (use `.next-f`; ORDER 42). Was ATLAS-REVIEWED, one-off.
- **What happened:** For TEST-101 I built and started caw-front with `NEXT_DIST_DIR=.next-t`, a dist folder name I picked myself. Next.js adds every new dist folder to `tsconfig.json` `include`, so a tracked file in caw-front gained two lines (`.next-t/types/**/*.ts`, `.next-t/dev/types/**/*.ts`). The team's map recipe uses `.next-f`, which tsconfig already lists, so it changes nothing. I only found it at my AC-11 after-check, 2026-10-29 01:17. I removed exactly those two lines with the editor and checked that `git hash-object tsconfig.json` equals `HEAD:tsconfig.json` (aa88246). I ran no git command.
- **Rule involved:** QA.md Hard boundaries, *"Put anything into a product repo"* (🚫), and REQ-101 AC-11 (no tracked file modified). I did not check before the run what a new `NEXT_DIST_DIR` does to tracked files.
- **How it was caught:** by me, at TEST-101 case #26 (AC-11 after-check), about 15 minutes after the change.
- **Cost:** none outside this run. Had it been missed, AC-11 would have failed because of QA, and the next "ขึ้น git" in caw-front would have committed QA's change.
- **Evidence:** `tests/TEST-101-understand-all-the-code.md` § Test data created; `log/2026-10-29.md` (Tanya entry).

## F-002 — 2026-10-29 — SA (Silver, Team B) — TASK-103 gave a curl that could not show what it claimed, and a tool this machine lacks
- **Status:** FIXED 2026-10-29 — DoD `→` lines carry `(base: …)` (SA-Lead.md § TASK template, PROTOCOL.md § Evidence); check-hygiene warns when missing (checks.json `hygiene.dod-base`, ORDER 41).
- **What happened:** TASK-103 DoD 5 told the BE to POST `/v1/projects` without the `X-CAW-Actor` header, to show "what caw-back answers when Blueprint is down". caw-back rejects any call without an actor (400 `actor_required`) before it reaches Blueprint, so the command as written could not show the case it was for. The same TASK (and SPEC-102 G6) told him to check ports with `lsof`, which is not installed on this machine. I ran neither command on the base before writing them into the DoD. The BE noticed both, added the header (→ 502 `blueprint_unreachable`) and used `ss -ltn`.
- **Rule involved:** role-sa skill § 3 "Every DoD expected output was run on the base first. Before writing '→ …' … run the command / check the file on the base ref and paste that base result in the TASK."
- **How it was caught:** the BE, during the TASK, ~10 minutes after it was cut; recorded by me at review.
- **Cost:** small — no rework, because the BE recovered correctly; but a less careful engineer would have recorded a 400 as "Blueprint down" in the map, a wrong fact that QA would then have checked against.
- **Evidence:** `i-space/ai-worker/tasks/TASK-103-caw-back-study.md` § Implementation Notes item 5 and § Review; `specs/SPEC-102-caw-code-map.md` G6.

## F-001 — 2026-10-29 — SA (Sober, Team A) — SPEC-101 told the FE that `check-required.ts` starts the back end; it does not
- **Status:** FIXED 2026-10-29 — DoD `→` lines carry `(base: …)` (SA-Lead.md § TASK template, PROTOCOL.md § Evidence); check-hygiene warns when missing (checks.json `hygiene.dod-base`, ORDER 41).
- **What happened:** In SPEC-101 § Risks and TASK-102's Depends-on line I wrote that `tests/states.spec.ts` and `scripts/check-required.ts` both spawn `../blueprint-back`. I based that on one grep hit, `check-required.ts:43` (`path.resolve(root, process.env.BLUEPRINT_BACK || "../blueprint-back")`), without reading the function: that line only imports a fixture file. The script's own header (`:11-13`) says it needs an in-memory back end *already running* on :4299. Fern ran `test:required` on my instruction, got ConnectionRefused on :4299, and had to stop and ask (TASK-102 Q1).
- **Rule involved:** role-sa §3 — "A claim is never stronger than what you read … A cause you inferred (one end of a boundary read) is written `inferred — <what would settle it>`"; and the SA's `check-by-running-not-reading.md` (read before cutting a TASK).
- **How it was caught:** by the FE (Fern), during TASK-102 step 7, about 6 minutes after the TASK was cut.
- **Cost:** one failed Playwright run and one review round trip (Q1) before `test:required` can give a real result.
- **Evidence:** `tasks/TASK-102-blueprint-front-study.md` § DoD 4, § Questions Q1, § Review; `specs/SPEC-101-blueprint-code-map.md` § Risks (struck and corrected 2026-10-29).
