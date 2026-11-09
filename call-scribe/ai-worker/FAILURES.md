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
`อ่าน ATLAS.md — review FAILURES ของ call-scribe`.

**Nobody needs to remember to escalate.** That is the whole point.

---

<!-- newest entry goes directly below this line -->

## F-023 — 2026-11-07 — SA (Team A) — Pushed a commit message saying TASK-115's real-driver check had not run, without reading the TASK
- **Status:** NEW
- **What happened:** I told Jason to stop, read the diff and ran the tests, then wrote "IN PROGRESS ... the real-driver check has not run" into commit 3bb7f2c, and "notes not written" into the TASK and to the PM. Jason had finished the harness and the notes at 12:13, minutes earlier. I never opened the TASK's notes; I took the board's `TODO` as the fact. The message is in pushed history on `atom` and `develop`, and stays there. The right step was reading the TASK before stating what was in it.
- **Rule involved:** `role-sa` section 4.8: "Read the board and your inbox before judging anyone's work — the tree tells you the state, not who put it there". `verify-before-relay.md`.
- **How it was caught:** Jason's inbox line, at the same moment; I read the notes on it.
- **Cost:** a wrong statement in permanent history, corrected in the TASK; one correction to the PM. The code is the same.
- **Evidence:** commit 3bb7f2c; `tasks/TASK-115-back-bounded-database-wait.md` § Review.

## F-022 — 2026-11-07 — QA (Team A) — My stub harness hung for hours with no time limit, and 9 of its 15 non-PASS results were my own harness bugs
- **Status:** NEW
- **What happened:** I ran TEST-102's stub round without a time limit per case. Case 14.4 awaited Playwright's `Page.crash`, which never returns, so the run sat from 02:42 until I stopped it at 10:35, with every server still up. I did not notice; the PM did. I had smoke-run only 4 cases, so bugs in the full harness surfaced only in the round: a full path joined onto the fixtures folder, PUT bodies read as null, a status read right after a click, a wrong local address, and a case that set a hidden input no finger can reach. The round's 15 non-PASS results then needed sorting before any could go to the SA.
- **Rule involved:** `NONE — no rule covered it` for a time limit. Nearest: `check-by-running-not-reading.md`; I had run the harness on 4 cases, not exercised each case's own helpers.
- **How it was caught:** the PM, at 10:33, from the results file not changing since 02:42.
- **Cost:** one PM check and one round to rerun. AC-21's main claim and 7 cases are still unproven. Most of the elapsed time was box pauses, so the lost running time was about 90 minutes.
- **Evidence:** `tests/TEST-102-req-101-app-acceptance.md` § Stub round 1; `tests/harness/q11-capture-2026-11-07/`.

## F-021 — 2026-11-07 — PM — Kept telling the owner "Tanya is running the stub cases" for hours without checking the run
- **Status:** NEW
- **What happened:** From 02:12 on, my ball lines said Tanya was running the stub cases. The results file had not changed since 02:42, and the box was paused for most of that time. I did not look; Atom found it at 10:31. I also told the owner at 02:15 that moving machines was not needed yet, and did not revisit that as the pauses went on.
- **Rule involved:** `verify-before-relay.md`; the ListAgents hook text "before saying a role waits, idles or works, also check its TASK/log change time".
- **How it was caught:** Atom, via inbox/PM.md, about 8 hours late.
- **Cost:** The owner and the desk believed testing was moving when it was not. No money spent.
- **Evidence:** `tests/harness/test102-stub-results-2026-11-07.json` mtime 02:42; `log/2026-11-07.md`, PM entries after 02:42.

## F-020 — 2026-11-07 — SA (Team A) — TASK-114's DoD held a grep that could not show what it claimed
- **Status:** NEW
- **What happened:** I wrote `grep -n "\.name}" -r src` → "only inside `errorLabel`". That pattern matches a `.name` directly before a closing brace, so it cannot find a helper written normally. I had run it on the base, which was true there, and not thought about the expected result. Jason ran it, got no output, and reported why. The right check is `grep -n "\.name\b" -r src`.
- **Rule involved:** `role-sa` section 3: "Every DoD expected output was run on the base first", and `check-by-running-not-reading.md`. An expected result about the changed code cannot be run on the base, so it needs thinking through.
- **How it was caught:** Jason, in the TASK's notes.
- **Cost:** none beyond one line of Jason's notes; the code is right. Same class as F-006 on Team B: a check that cannot do its job.
- **Evidence:** `tasks/TASK-114-back-log-error-code.md` § Implementation Notes, § Review.

## F-019 — 2026-11-07 — PM — Wrote a pause time into SYSTEM-FACTS under Atom's diagnosis that Atom never gave
- **Status:** NEW
- **What happened:** Filing Atom's 02:14 diagnosis, I wrote "about 280 s at about 02:00". Atom's message gives no time for that pause; the only measure is Tanya's window, 01:54:10 to 02:10:34. Sober read my line as Atom's and reasoned from it that the pause came after the 01:54 error, which would make the event lean towards a real stall. Corrected by strike.
- **Rule involved:** `quote-dont-paraphrase.md`; `workforce-protocol` §8a on labelling words as someone's when they are yours; `SYSTEM-FACTS.md` format, "who said it and when".
- **How it was caught:** by me, reading Sober's question about the time, within minutes.
- **Cost:** one wrong line in the knowledge file for minutes, and one line of Sober's reasoning to withdraw. It did not reach a decision.
- **Evidence:** `SYSTEM-FACTS.md` "This box pauses"; `specs/SPEC-102-app-intake-processing-results.md` § Questions Q11.

## F-018 — 2026-11-07 — SA (Team A) — Put a pointless `node -e` into a read-only Bash call, which the desk bans
- **Status:** NEW
- **What happened:** In a read-only check of the system journal I left a stray `node -e "1"` in the command. It wrote nothing and served no purpose. The correct thing was to leave it out.
- **Rule involved:** `PROTOCOL.md` § Editing files: "no `node -e`, `node -p`, `sed -i`, `perl -i` carrying" shell characters; the hook blocks the form whatever it carries.
- **How it was caught:** the workspace hook, on the attempt.
- **Cost:** one blocked call and a rerun. No file touched.
- **Evidence:** this session's Q11 journal check, 2026-11-07; `log/2026-11-07.md`.

## F-017 — 2026-11-07 — BE (Team B) — Edited two harness files with a Python replace that did not assert one match each, and built TASK-103 prep so it left a server running and lost paid turns
- **Status:** NEW
- **What happened:** (1) Fixing `test-prep.sh` and `score.ts` I ran a heredoc Python `str.replace` over both files with no assert that each pattern matched exactly once. Three of the five replacements were checked only by a grep afterwards. (2) `run-check.ts` started the gateway with `bun run start` and killed only the wrapper, so the server stayed up with auth off, and a later run on the same port reported the first run's provider. (3) `tts-voices.ts` wrote the ledger only after all 12 turns, so a failure at turn 7 lost 6 paid turns from the total. I tested each script for its own success output and never asked what it leaves behind: the same test the QA's F-015 entry had just named.
- **Rule involved:** `PROTOCOL.md` § Editing files and `workforce-protocol` §7: a script fed by a heredoc must assert exactly one match per replacement. `role-be` §6: "Checking the gate, not the generator" and "A method existing is not the client reaching it". `role-be` §3: no silent failures.
- **How it was caught:** (1) by me, on rereading my own slip list; Silver also named it. (2) and (3) by the SA, on a rerun on a scratch clone that `test-prep.sh` could not see, because its own trap cleared the ports.
- **Cost:** one REWORK round on TASK-103 prep. Nothing real was called, so no money and no data were involved.
- **Evidence:** `tasks/TASK-103-gateway-audio-provider-check.md` § Review items 1, 2 and 4; `tests/harness/provider-check/`.

## F-016 — 2026-11-07 — SA (Team B) — Cut TASK-103 § Prep without the server-kill lesson already in the log, and named a TTS model without reading how it is called
- **Status:** NEW
- **What happened:** Two gaps in my instructions. F-015 (`bun` is a wrapper here, so killing it orphans the server) was in today's log when I wrote § Prep, in the same read where I checked the Q9 state, and I did not carry it into the DoD. Bob's `run-check.ts` then left a server on all interfaces with auth off, and a second run reported the wrong provider. Second, on 2026-11-06 I passed the PM's model name into the TASK without reading how that model is called; the page's examples use the Interactions API and a WAV reply, not the shape Bob reasonably assumed.
- **Rule involved:** `workforce-protocol` section 13: "you gave an incomplete instruction". `role-sa` section 3: "The 5-minute test", and section 4.2 on checking current docs for an API a design relies on.
- **How it was caught:** by me, reviewing Bob's scripts, by reading the kill call and then running two runs on one port on a scratch clone.
- **Cost:** one REWORK round for Bob. No real call was made, no money spent, nothing reached the owner.
- **Evidence:** `tasks/TASK-103-gateway-audio-provider-check.md` § Review; `FAILURES.md` F-015.

## F-015 — 2026-11-07 — QA (Team B) — My AC-11 harness left 20 stub servers running for hours, and my footprint did not list them
- **Status:** NEW
- **What happened:** Each of my 4 captures on 2026-11-06 left 5 stub gateway servers running, because on this box `bun` is a shell wrapper and `proc.kill()` stopped only the wrapper. In TEST-101 § Test data created I declared the copies and outputs but not the processes. After my own probe I checked that ports 3977 and 3978 refused; I never checked the harness's servers. The right step was to prove the servers had stopped, as my instrument checks already proved everything else.
- **Rule involved:** `role-qa` §3: "`## Test data created` is filled"; `QA.md` § Rules on any shared environment, rule 1: "Clean up after yourself; declare your footprint." The harness's own success output is the `role-qa` §6 trap: "Trusting a self-report".
- **How it was caught:** the PM, on 2026-11-07, about 8 hours later by file times.
- **Cost:** about 560 MB held (the PM's figure), and one PM round trip. They listened on all interfaces, one with auth off, stub and made-up keys only. The AC-11 results stand: 20 distinct ports, so no capture reached an older server.
- **Evidence:** `tests/TEST-101-gateway-regression-ac11.md` § Harness leak; `tests/harness/local-gateway-regression.mjs`.

## F-014 — 2026-11-06 — SA (Team A) — Called TASK-108 DONE without reading its upload code; a lost `complete` answer leaves a delivered recording unsendable
- **Status:** NEW
- **What happened:** I set TASK-108 `DONE` from its evidence alone and did not open `upload.ts`, though TASK-111 had shown the same day that reading finds what these specs miss. Reading it for TASK-109 under an hour later, I found that a retry after a lost `complete` answer fails on every attempt with `409`, while the back holds the recording. My TASK's step 4 did not cover it either, and my AC-14 item only aborted a PUT.
- **Rule involved:** `SA-Lead.md`: "`DONE` means the SPEC is met *and* the proof is in the file"; `role-sa` section 4.8: "Review the evidence, not the claim", which I met and which was not enough. `NONE — no rule covered it` requires reading the code at review.
- **How it was caught:** by me, reading `upload.ts` during TASK-109's review, then running it against the real routes.
- **Cost:** a withdrawn verdict, one REWORK round for Fern. The DONE stood in the files for under an hour. Nothing deployed; the code is in 6130c6e's sibling c728348.
- **Evidence:** `tasks/TASK-108-front-file-pick-send.md` § Review.

## F-013 — 2026-11-06 — SA (Team A) — SPEC-102 left the back's own database failure undesigned, and I cut a test run's failure out of my own output
- **Status:** NEW
- **What happened:** § Flow said what a provider failure does and nothing about the back's own write failing mid-job, on a database reached over the network. The result was a row stuck in-flight, with the app polling forever and no retry. Separately, at review I ran `bun test | tail -5`, saw one failure, and had cut the failing test's name. Two reruns passed, so that failure cannot now be named.
- **Rule involved:** `role-sa` section 1: "You own technical risk. You name it, size it, and either design it out or put it in front of the PM". For the second: `AGENTS-DISCIPLINE.md` "Evidence before assertion": no rule forbids tailing; `NONE — no rule covered it` for that detail.
- **How it was caught:** by me at review, with a probe, after Jason's code comment described the behaviour. The failure was visible in the same run's summary line.
- **Cost:** one REWORK round for Jason on a gap that was mine, and a loop run for Jason to find a failure I could have named.
- **Evidence:** `tasks/TASK-106-back-worker-gateway.md` § Review; `tasks/TASK-105-back-upload-intake.md` § Review.

## F-012 — 2026-11-06 — SA (Team A) — SPEC-102 told Fern to start the back with a command that cannot start from this .env
- **Status:** NEW
- **What happened:** SPEC-102 § Env said Fern starts the back with `bun src/index.ts` if none is running. `.env` leaves `LLM_GATEWAY_URL` and `LLM_GATEWAY_KEY` empty, and `src/env.ts:68-69` requires both, so it would exit naming a key. My own release to Jason noted the empty keys, and I did not carry that to this line. I also had not said that Fern's back must wait for Jason's Postgres runs, though the same paragraph explains why.
- **Rule involved:** `role-sa` section 3: "Every DoD expected output was run on the base first"; I never ran this command. `workforce-protocol` section 13: "you gave an incomplete instruction".
- **How it was caught:** by me, from Jason's note that he passed the two keys on the command line. Before Fern ran it.
- **Cost:** none yet; one failed start and a round trip avoided. One SPEC line corrected.
- **Evidence:** `specs/SPEC-102-app-intake-processing-results.md` § Env; `tasks/TASK-104-back-foundation-auth.md` § Implementation Notes.

## F-011 — 2026-11-06 — SA (Team B) — Reported TASK-101 and TASK-102 as DONE nine minutes after the reset, without looking at the tree
- **Status:** NEW
- **What happened:** Opening my session at 17:27, I wrote "TASK-101 and TASK-102 DONE" in my log and in my reply to the owner, from the board and my earlier reviews. The reset that removed those edits had run at 17:18:01, so `/audio/*` was already answering 404. One `git status` in `develyst-ai` would have shown no tracked file modified. Tefany found it, from a read-only look, at 17:29. Separately, while cutting TASK-112 I was about to specify a harness fix (empty provider values on the suite's line) that my first probe supported; it failed when run through the driver's real `bun run start`. Running it caught that before it went out.
- **Rule involved:** `verify-before-relay.md`, on stating any fact to the PM or an engineer; `role-sa` section 6: "Diagnosing a teammate from the tree alone" is the reverse case, and no rule says to recheck the tree on opening. A `DONE` is a claim about a tree that can change while nobody is looking.
- **How it was caught:** Tefany (QA, Team B), then the PM's own check.
- **Cost:** The owner and the log held a wrong status for a few minutes. No one acted on it.
- **Evidence:** `log/2026-11-06.md` Silver 17:27; `tests/TEST-101-gateway-regression-ac11.md` § Finding 2026-11-06 17:27; `tasks/TASK-112-gateway-reapply-lost-tracked-edits.md` § What to do item 6.

## F-010 — 2026-11-06 — SA (Team A) — SPEC-102's error table disagreed with SPEC-101 and with my own TASK-106 on what can be retried
- **Status:** NEW
- **What happened:** The § Errors table listed only `output_truncated` as not retryable for `summary_failed`, with "anything else" as retryable. TASK-106 step 3 and SPEC-101 both say a gateway `retryable: false` stays false, and that includes `provider_rejected_audio`. Jason's test failed against the table, and Jason chose correctly and asked. The same table had no row for `audio_missing`, a code the design makes possible, where the shown string would falsely say the audio is still there.
- **Rule involved:** `role-sa` section 1: "if two sides disagree once built, the defect is in your SPEC". `SA-Lead.md` "You own the seam between the repos".
- **How it was caught:** Jason, while building, raised the first in TASK-106 § Questions. I found `audio_missing` reading Jason's notes at the same pass.
- **Cost:** one question and a small table and code change. Nothing built on the wrong row: TASK-110 has not started.
- **Evidence:** `tasks/TASK-106-back-worker-gateway.md` § Questions; `specs/SPEC-102-app-intake-processing-results.md` § Errors.

## F-009 — 2026-11-06 — SA (Team A) — TASK-111 could not meet its own "separate flag" line, and left open which length the check page shows
- **Status:** NEW
- **What happened:** I told Fern to run TASK-108's strip with its own flag "separate from the main app's flag", and kept `src/lib/strip.ts` off the closed list. But `prepareFile` sets the app's flag itself, so a page death on `/check` left it set: the next `/check` strip of a good file reported "failed", and the app's next pick would skip the strip. I also wrote "show the length" without saying which, on a page whose purpose is to catch gaps in a recording; the page showed 0:12 for a 6.90 s file. The right TASK would have read `prepareFile` first, and named both.
- **Rule involved:** `role-sa` section 3, "A TASK is done (as a document) when an engineer could execute it with no question", and section 4.6, "Re-read the SPEC once against the TASK list". `workforce-protocol` section 13: "you gave an incomplete instruction".
- **How it was caught:** by me at review, running a probe on a snapshot, after Fern raised the flag dependency as an edge case in the TASK's Question 2. Before any deploy and before the owner saw it.
- **Cost:** one REWORK round for Fern. Had it shipped, AC-13's answer on his phone could have been wrong.
- **Evidence:** `tasks/TASK-111-front-phone-check-page.md` § Review (P1, P2).

## F-008 — 2026-11-06 — PM — Opened the session with English messages to the owner and no identity line
- **Status:** NEW
- **What happened:** On opening this session I wrote three short progress lines to the owner in English, and my first line did not state who I am. The PM's messages to the owner must be in Thai, and the first line of the first reply must carry the identity line. I noticed partway through the session and switched to Thai.
- **Rule involved:** `PROTOCOL.md` § Language: "PM ↔ Human: Thai. Every summary, progress update, or question to the human is written in Thai." `/desk` skill step 3: "first line of your reply".
- **How it was caught:** by me, in the same session, before the main reply.
- **Cost:** three lines the owner may have had to read in the wrong language; no work affected.
- **Evidence:** this session's opening messages; `log/2026-11-06.md`, the PM's entry after 17:26.

## F-007 — 2026-11-06 — BE (Team B) — Wrote in TASK-102 notes that the harness clean-up stops only the right ports, without ever running it
- **Status:** NEW
- **What happened:** TASK-102 asked for the driver's port clean-up to be narrowed. I wrote `seq $BASEPORT $((BASEPORT+9)) 3960 3942`, which gives `seq` four operands and fails with `seq: extra operand`, so nothing was ever stopped. My notes said it "now stops only 3951-3960 and 3942". I had only grepped the text against the DoD's pattern and never ran the clean-up path (every suite stops its own port, so the green run did not reach it).
- **Rule involved:** `AGENTS-DISCIPLINE.md` "Evidence before assertion": never claim a result without running the check; and `PROTOCOL.md` Evidence: anything not run is `UNVERIFIED`.
- **How it was caught:** the SA at review (REWORK), by running `seq` with those operands.
- **Cost:** one review round trip. On a failed or interrupted run, servers would have stayed up on the shared box.
- **Evidence:** `tasks/TASK-102-gateway-audio-gemini-xai-adapters.md` § Review.

## F-006 — 2026-11-06 — SA (Team B) — TASK-102 went out with a check that could not fail and a contract line left out
- **Status:** NEW
- **What happened:** Two gaps in my TASK-102 instructions. I cut it without SPEC-101's "or its key is missing" case for `503 audio_not_configured`, and added that only at TASK-101's review, while Bob was already on it. Then, adding a harness clean-up item, I wrote a DoD check that greps the script's text; a line that cannot run (`seq` with four operands, exit 1) passed it, and the clean-up stops nothing.
- **Rule involved:** `role-sa` section 4.6: "Re-read the SPEC once against the TASK list: every AC carried". `check-by-running-not-reading.md`: "A check you performed in your head is a guess". A check on a script should run the script.
- **How it was caught:** by me, at each review: the first while reading TASK-101 against the SPEC, the second by reading the changed line and running `seq`.
- **Cost:** one mid-task change for the engineer and one REWORK round. Nothing reached a tester or the owner.
- **Evidence:** `tasks/TASK-102-gateway-audio-gemini-xai-adapters.md` § Added at TASK-101 review, § Review; `log/2026-11-06.md`.

## F-005 — 2026-11-06 — PM — Wrote an absolute path into a committed desk file and an inbox
- **Status:** NEW
- **What happened:** When I named where the second test database's value should go, I wrote its absolute path into TEST-102 § Questions Q10 and into a line in `inbox/QA.md`. The right place is `machine.local.md`, with a logical name in the desk files. TEST-102 is fixed and the entry added to `machine.local.md`; the inbox line stays until its reader drains it.
- **Rule involved:** Workspace `CLAUDE.md` § Paths & machines: "Code-repo paths live ONLY in `machine.local.md`" and "Never write an absolute workspace path into any committed file".
- **How it was caught:** Tanya, in the next pass.
- **Cost:** One extra message and one edit. The path holds no secret.
- **Evidence:** `tests/TEST-102-req-101-app-acceptance.md` Q10, `log/2026-11-06.md`.

## F-004 — 2026-11-06 — PM — Accepted an AC-13 case that contradicted the AC's own "uploads nothing"
- **Status:** NEW
- **What happened:** Sober's SPEC-102 Q5 proposed that the owner pick a 10-minute screen recording and report whether it reaches "sent". I wrote it into AC-13 the same turn. It would have uploaded a real recording, against AC-13's "stores and uploads nothing", and against my own TEST-102 Q6 ruling that no real recording goes up before 17.4 passes. The right step was to read the new case against the rest of the AC.
- **Rule involved:** `role-ba` pre-flight item 1: "Read each AC against every requirement, every constraint and every Out of Scope line", run "including after an amendment".
- **How it was caught:** Sober, on re-reading, within minutes; before anyone ran it.
- **Cost:** One extra round between the PM and the SA, and a strike in the AC. No recording moved.
- **Evidence:** REQ-101 AC-13, SPEC-102 § Questions Q5, `log/2026-11-06.md`.

## F-003 — 2026-11-06 — SA — Proposed an AC-13 case that uploads a real recording, against the same AC's own rule
- **Status:** NEW
- **What happened:** In SPEC-102 § Questions Q5 I asked the PM to add a case where the owner picks a 10-minute screen recording and reports whether it "reaches sent". That uploads his own recording, while AC-13 says the check stores and uploads nothing, and the PM ruled in TEST-102 Q6 that no real recording goes up before 17.4 passes. The PM accepted my wording into the REQ in good faith. The correct case tests only the strip on the phone, with nothing sent.
- **Rule involved:** Personal-data rule in REQ-101 AC-13 ("It stores and uploads nothing") and SYSTEM-FACTS "Data". workforce-protocol §13: "you gave an incomplete instruction". I had read AC-13 and did not check my proposal against it.
- **How it was caught:** Myself, on reading the amended AC-13, within the same hour. No recording moved; nothing is deployed, so the case could not have run.
- **Cost:** One extra round with the PM; a wrong line in the REQ until amended.
- **Evidence:** `specs/SPEC-102-app-intake-processing-results.md` § Questions Q5 and its correction; `requirements/REQ-101-call-capture-transcript-summary.md` AC-13; `log/2026-11-06.md`.

## F-002 — 2026-11-06 — SA (Team B) — Tried to edit a scratch file with sed -i, which the desk bans
- **Status:** NEW
- **What happened:** While preparing a probe for the REQ-101 endpoint contract, I chained `sed -i` into a Bash call to fix one import path in a throwaway file in my session scratchpad. The correct tool was the editor, which I then used. The hook blocked the whole call, so nothing was changed.
- **Rule involved:** `PROTOCOL.md` § Editing files: "Never pass file content through a double-quoted shell string — no `node -e`, `node -p`, `sed -i`, `perl -i`". `workforce-protocol` section 7 says the same, and also says no hook enforces it, while `scripts/hooks/block-shell-edits.sh` did.
- **How it was caught:** the workspace hook, on the attempt itself.
- **Cost:** one blocked call and a rerun. No file was harmed; it was not a coordination or product file.
- **Evidence:** `log/2026-11-06.md`, Silver's entry for the SPEC contract.

## F-001 — 2026-11-06 — PM — Prepared to hand the owner a phone check before working the route with the SAs, and recorded a pack as sent before sending it
- **Status:** NEW
- **What happened:** After the moment-A round I decided the next step was the owner running a capture check on his phone, plus a question pack. The SAs had only just named the options, and nobody had been asked to work them through. While preparing it, I wrote "First pack sent" into `RESUME-HERE.md`, and "Asked in the first message" into REQ-101, before any message went out. The owner stopped it: *"ไประดมสมองคุยกันกับ SA เพื่อหาทาง ดีกว่ามั้ย"*. The right step was a round with the SAs on the route itself, then the smallest ask.
- **Rule involved:** `role-pm` §1 "Answer first, relay second" and "Protect the operator's time"; `team-brainstorm.md` moment B on answering from the team before waiting on him. For the premature status: `PROTOCOL.md` "Chat is never delivery" covers the reverse direction only, so `NONE — no rule covered writing a future event as done`.
- **How it was caught:** The owner caught the direction, before the pack reached him. I caught the false status when his message arrived; it had been on disk for minutes and had been read by nobody as far as I know.
- **Cost:** One owner interruption, and one rewrite of the board, the snapshot and the REQ's Questions section.
- **Evidence:** `log/2026-11-06.md`, `DECISIONS.md` 2026-11-06 14:10 line, `talks/BRAINSTORM-2026-11-06-capture-route.md`.
