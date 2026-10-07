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

## What an entry looks like

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

Numbering is continuous per project: `F-001`, `F-002`, … Never renumber.

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
`อ่าน ATLAS.md — review FAILURES ของ <project>`.

**Nobody needs to remember to escalate.** That is the whole point.

---

<!-- newest entry goes directly below this line -->

> **F-015 → F-027 were written LATE, all on 2026-10-07 (Porter).** Every one of them was caught and recorded in the log or a REQ on the day — but none reached this file "before the next reply" as §"When you MUST write" says. The owner asked whether Atlas had anything pending; counting this file is how I found the gap. **The lateness itself is the meta-entry, F-027.**

## F-027 — 2026-10-07 — PM (Porter) — Recorded 12 of my own failures in logs and REQs but not in FAILURES.md, for two days
- **Status:** NEW
- **What happened:** From 10-06 to 10-07 I made the failures F-015 → F-026. I wrote each one down honestly — in `log/`, `SYSTEM-FACTS.md`, the REQs and two reports to Atlas — but never here, the one file the hygiene gate counts. So the gate showed 14 unreviewed when the true number was 26.
- **Rule involved:** this file, "Write **before your next reply**, not at session end." Also `SYSTEM-FACTS.md` 2026-10-07 — "Report BOTH kinds to Atlas, continuously."
- **How it was caught:** by myself, only because the owner asked "does Atlas have anything pending from us".
- **Cost:** Atlas's queue under-counted by 12. A gate that reads a file nobody writes to is not a gate.
- **Evidence:** this file before and after this edit (220 lines before).

## F-026 — 2026-10-07 — PM (Porter) — Claimed the user↔teacher link would make REQ-115's badge cheaper, without checking whom the link covers
- **Status:** NEW
- **What happened:** I told the owner the existing `users.teacher_id` link would shorten the admin-LINE work. Sober confirmed the link exists for COACHES only; an admin has `teacher_id` NULL by construction. The size stayed as it was.
- **Rule involved:** `SYSTEM-FACTS.md` — counts are mine, causality is the SA's (never explain cause before the SA confirms).
- **How it was caught:** by Sober, on reading the code.
- **Cost:** one wrong expectation given to the owner; no build was affected.
- **Evidence:** `log/2026-10-07.md:141`.

## F-025 — 2026-10-07 — PM (Porter) — Kept telling the owner to read the LINE address line after Tanya had already passed it — three times
- **Status:** NEW
- **What happened:** §0b of `DEPLOY-uat-2026-10-09.md` asked the owner to check the address line on his phone. Tanya's TEST-082 §3 had already done it on his machine. I listed it as "waiting on the owner" three times.
- **Rule involved:** `NONE — no rule covered it` directly. The gate came from a stale "LINE checks are never QA's" rule, and I read it as still true.
- **How it was caught:** by the owner — *"tanya ก็ดูผ่านเครื่องฉันได้นะ"*.
- **Cost:** three times the owner was handed a task that was already done.
- **Evidence:** `log/2026-10-07.md:198`.

## F-024 — 2026-10-07 — PM (Porter) — Relayed "no task exists" from Sober without opening the board; TASK-721 was on it
- **Status:** NEW
- **What happened:** I passed on that Team B had no front-audit task and asked for one. TASK-721 was already cut and Fanta was half-way through it.
- **Rule involved:** `CLAUDE.md` rule 3 — "re-read board.md … your chat memory of them is stale"; F-002's pattern (relaying unverified facts).
- **How it was caught:** by Silver.
- **Cost:** one wasted round trip with Silver.
- **Evidence:** `log/2026-10-07.md:157`.

## F-023 — 2026-10-07 — PM (Porter) — Labelled two approvals "owner-approved" when I had made them myself (TASK-624)
- **Status:** NEW
- **What happened:** Two TASK-624 strings were approved by me on the basis that they are word for word an approved pair. The record said "owner-approved".
- **Rule involved:** `COPY-REVIEW-2026-09-29.md` — an approval record must say who approved, verbatim.
- **How it was caught:** by the marker audit (TASK-700/701/720/721).
- **Cost:** none in the shipped text. 🔑 The harm is that the label borrowed the owner's authority for a decision he never made, and it reads like the safest state there is.
- **Evidence:** `COPY-REVIEW-2026-09-29.md` ~line 574 (now relabelled "approved by Porter").

## F-022 — 2026-10-07 — PM (Porter) — Recorded my own rewrite of TASK-699's sentence as the approved text
- **Status:** NEW
- **What happened:** The owner approved a parent-facing sentence. In `COPY-REVIEW` I wrote my own version of it, which dropped both `ค่ะ`. The owner had chosen Sober's drafted sentence, so the code was right and only my record was wrong.
- **Rule involved:** `SYSTEM-FACTS.md` 2026-10-07 — an approval record must be VERBATIM.
- **How it was caught:** twice, independently (Sober and Silver).
- **Cost:** none in the code. 🔑 The approval record is the only place a string is ever checked; a paraphrase there means the check itself is wrong.
- **Evidence:** `COPY-REVIEW-2026-09-29.md:515` and the correction at `:523`.

## F-021 — 2026-10-06/07 — PM (Porter) — Kept copy decisions in chat and promised to record them later — five times
- **Status:** NEW
- **What happened:** The link-a-parent §C set, a promise to Silver, the TASK-699 ruling and two more: each was approved or ruled in chat, told to an SA, and written into `COPY-REVIEW` only later or after someone asked.
- **Rule involved:** `CLAUDE.md` amnesia-first rule 2 — "Write durable facts to their home file THE MOMENT you learn them."
- **How it was caught:** by Silver asking for the record, and by myself on the fourth time.
- **Cost:** SAs held work, waiting for a record. The rule I adopted: the approval goes into `COPY-REVIEW` in the same action as telling the SA.
- **Evidence:** `COPY-REVIEW-2026-09-29.md:564`.

## F-020 — 2026-10-06 — PM (Porter) — Sent the owner SQL wrapped in a psql/bash command instead of bare SQL
- **Status:** NEW
- **What happened:** The owner pastes SQL into his own tool. I sent it wrapped in a shell command, more than once.
- **Rule involved:** `NONE` in the repo at the time. It had been the established practice ("you used to send just the SQL").
- **How it was caught:** by the owner — *"หยุดส่ง เป็นคำสั่งมาได้แล้ว … เคยส่งมาเป็น แค่ sql นี้"*.
- **Cost:** the owner's time, and his patience.
- **Evidence:** 🔴 **not logged at the time** (that gap is part of F-027). The rule now lives in machine-local memory only, so it should be promoted to `PM.md`.

## F-019 — 2026-10-06 — PM (Porter) — Deleted 331 of 335 lines of board.md with an awk rewrite whose end pattern never matched
- **Status:** NEW
- **What happened:** To replace the deadline banner I ran `awk '/start/{skip=1} skip && /^## TASK number blocks/{skip=0} !skip' board.md > tmp && mv tmp board.md`. The end pattern never matched, so `skip` stayed on to the end of the file. The top of the file looked perfect because it WAS perfect.
- **Rule involved:** `NONE — no rule covered it`. Adopted since: no delete-to-end-of-file construct on a repo file, ever; read first, then one exact find-and-replace; verify by `wc -l` before and after.
- **How it was caught:** by myself, by count.
- **Cost:** none, but only by luck — the owner had committed minutes earlier, so `git checkout -- board.md` restored it. Luck, not design.
- **Evidence:** `log/2026-10-06.md:771-777`.

## F-018 — 2026-10-06 — PM (Porter) — Applied Khwan's §11.4 answer to the wrong question
- **Status:** NEW
- **What happened:** Her "เรียนได้ ตารางยังอยู่" answered a course expiring with sessions unused. I used it to rule on a make-up landing past expiry, a different question she had answered differently on the next line. The history answered it four times, and all four said the other option.
- **Rule involved:** the memory rule "quote the customer, never paraphrase" (machine-local) plus `SYSTEM-FACTS.md` F-011→F-014 class: a fact taken from a NEARBY artefact instead of its SOURCE.
- **How it was caught:** by the owner — *"คำตอบแล้วที่แล้ว และ ประวัติคุยขวัญที่ผ่านๆมา ไม่ได้ช่วยให้ตอบได้เลยเหรอ"*.
- **Cost:** a wrong ruling (since superseded and kept), one redesign.
- **Evidence:** `log/2026-10-06.md:747` · `requirements/REQ-112-*.md`.

## F-017 — 2026-10-06 — PM (Porter) — Instructed Silver to message Sober directly (SA↔SA, a forbidden edge)
- **Status:** NEW
- **What happened:** I told Silver to tell Sober something himself. Silver refused and came back to me.
- **Rule involved:** `PROTOCOL.md` — the two SAs never message each other; everything cross-team goes through Porter.
- **How it was caught:** by Silver.
- **Cost:** one round trip. The rule held only because the SA held it, not because the PM did.
- **Evidence:** `log/2026-10-06.md:716`.

## F-016 — 2026-10-06 — PM (Porter) — Misread "ครั้งต่อ ๆ ไป" as "ครั้งนี้" and stopped a correctly sized task
- **Status:** NEW
- **What happened:** I misread one word in Khwan's text, invented a "per-session vs per-series" conflict, and STOPPED TASK-624. I withdrew it within the hour.
- **Rule involved:** the memory rule "quote the customer, never paraphrase".
- **How it was caught:** by myself, on re-reading her exact words.
- **Cost:** a false stop on Team B for about an hour.
- **Evidence:** `log/2026-10-06.md:252` · `SYSTEM-FACTS.md:4205`.

## F-015 — 2026-10-06 — PM (Porter) — Restated Khwan's §11 as "every leave adds one week"; an SA re-size, four rulings and a BUILT task rested on it
- **Status:** NEW
- **What happened:** I wrote her model down as "every leave adds a week". It was wrong: an ordinary leave adds nothing. Only three explicit triggers add a week, and a make-up that cannot fit means the leave is refused. Sober re-sized REQ-112 (M→L) on my sentence, and TASK-656 was built on it. I also treated a forwarded screenshot set as a new intake when it was REQ-111 A–F, already shipped on 10-05 (the owner: *"เห้ยไม่ใช่ 6 ข้อนี่มันตั้งนานแล้ว"*).
- **Rule involved:** `NONE` at the time. Since adopted: quote the customer and never paraphrase; confirm the consequences in numbers, not the rule; a screenshot is not an intake.
- **How it was caught:** by Khwan's own numbers ("15 ค่ะ" / "6 ค่ะ"), after the build.
- **Cost:** the largest of the round — a built task stopped, an SA re-size, three redesigns, and redundant reads asked of Sober.
- **Evidence:** `log/2026-10-06.md:10,16,237,380` · `requirements/REQ-112-*.md` (the voided rulings kept) · `REPORT-porter-to-atlas-2026-10-06-customer-conversation.md`.

## F-014 — 2026-10-07 — SA Lead Team B (Silver) — Allocated TASK numbers from `ls tasks | tail`, not from Team B's block on the board (696, 697, 698)
- **Status:** NEW
- **What happened:**
  - The board's number blocks gave Team B 660–689 (now used up). I took "the highest file + 1" three times, landing in Team A's 690–719.
  - Porter approved them without noticing, and has since recorded the miss as his. **But the act of choosing the numbers was mine, and the block line was on the board.**
  - They stay as Team B's by a written exception (`board.md` top). Sober's 699 was not affected.
- **The correct act:** take the next number from **Team B's block line on the board** (now 720–749), never from the folder listing. The folder shows what EXISTS, not what is MINE.
- **Rule involved:** the board's number-block rule (`board.md`, top).
- **How it was caught:** by Porter, when Sober's next number collided with the block.
- **Cost:** a board exception, and nothing else. No collision with an existing file.
- **Evidence:** `board.md` lines 20–21 · `log/2026-10-07.md`.

## F-013 — 2026-10-07 — SA Lead Team B (Silver) — Cut a TASK that changes JSX text without grepping for source-reading pins of that text (TASK-697)
- **Status:** NEW
- **What happened:**
  - TASK-697 told Fanta to change two JSX conditions in `OtherSeriesDialogs.tsx`, and claimed only `partials/OtherSeries/*`.
  - `lib/scheduler/series-scope.test.ts:227` reads that dialog's SOURCE and pins `"{needRate && canRate && ("` **word for word**. One `grep -rn -F` for the changed text before cutting would have found it.
  - **The 4th of the same class in three days** (F-010 file left off a claim · F-011 pins listed from memory · F-012 a hidden second pin · F-013).
- **The correct act:**
  - **before cutting any TASK that changes source text, grep the tests for the exact text being changed** (this repo has many tests that read source files as strings);
  - put every hit on the claim, or ask Porter for it in the SAME message as the cut.
- **Rule involved:** F-010 / F-011 (mine). F-011 named the method ("grep the repo for that string") for STRING changes; I did not apply it to a CODE-text change, though source-reading pins make them the same thing.
- **How it was caught:** by the engineer (Fanta), who stopped instead of restructuring the JSX to dodge the pin.
- **Cost:** one more round trip to Porter. TASK-697 is otherwise green.
- **Evidence:** `tasks/TASK-697-swap-rate-label-waits-for-the-coach-fe.md` §Questions Q1 · `log/2026-10-07.md`.
- **For Atlas:** four entries, one root. A pre-cut checklist step, "grep tests for every text the TASK changes; claim every hit", would have caught all four.
- **PM reclassification (Porter, 2026-10-07), applies to F-011/F-012/F-013:** predicting which pins a change breaks, before the engineer touches the file, is unreliable by construction. **The fix is ORDER, not effort:** the engineer builds inside the claim and RUNS the suite; the reds outside the claim come back as a real list (plus the later `expect`s of each failing `it()`, read against the source, which is F-012's wrinkle); then ONE ask to Porter. Nothing is edited outside the claim before the grant. ⇒ The pre-cut grep checklist proposed above for Atlas is **superseded** by this order.

## F-012 — 2026-10-07 — SA Lead Team B (Silver) — Asked Porter for a pin grant by READING the test, not by RUNNING it: a second pin in the same test missed (TASK-696)
- **Status:** NEW
- **What happened:**
  - Fanta reported one failing pin (`action-gate.test.ts:69`, door count 109 → 110), and I asked Porter for that line only.
  - `:70` (the count of distinct files, 39 → 40) sits in the same `it()`. It could not fail until `:69` passed. **While reviewing I had even noted "if the gate sits in `LinkParentDialog`, the file count moves too", and did not check it.**
  - Fanta found it after the first grant, and touched nothing outside it.
  - **The correct act:** before asking for a pin grant, apply the candidate edit in a scratch copy (or reason through every `expect` after the failing one in that `it()`), then RUN the test. Ask for every line that turns red, in one request.
- **Rule involved:** F-010 and F-011 (mine): list every needed file by SEARCH before a claim goes out. **This is the same class one level down:** lines inside a granted file, found by reading rather than running. A failing `expect` hides every later `expect` in the same test.
- **How it was caught:** by the engineer (Fanta), before any edit outside the grant.
- **Cost:** a second round trip to Porter for one number. TASK-696 is otherwise done.
- **Evidence:** `tasks/TASK-696-create-a-family-and-link-in-one-go-fe.md` §Questions Q1/Q2 · `log/2026-10-07.md`.
- **PM reclassification (Porter, 2026-10-07):** a property of the FILE, not only of the SA. One change broke TWO counts of the same population in one file, the second invisible until the first was fixed. ⇒ Fix queued: `SIZING-teamB-next-round-pile-2026-10-05.md` §7. My own lesson above still stands.

## F-011 — 2026-10-06 — SA Lead Team B (Silver) — F-010's lesson applied by MEMORY, not by search: a second pinned file missed (TASK-671)
- **Status:** NEW
- **What happened:**
  - Writing TASK-671 (one space in the camp clash sentence), I listed the pin I remembered: `camp-on-grid-req095-11.test.ts`, which TASK-666 had just touched.
  - The sentence is also pinned **word for word** in `camp-week-500-family-dedupe-req104.test.ts:73` and `:95`. My line number for the first pin was stale too (`:177`; it is now `:186`).
  - **Bob found both with one grep** (`grep -rln "มีคาบแล้ว — ไม่ได้บันทึกอะไร" src` → three files) and stopped before editing.
  - **The correct act:** before writing a claim for a STRING change, grep the repo for that string. Never list pins from memory.
- **Rule involved:** FAILURES F-010 (my own, 2026-10-05): "every file the TASK's instructions require goes on the claim list as the TASK is written".
  - I applied it by recalling files rather than by searching for them. F-010 named the rule but not the method.
- **How it was caught:** by the engineer (Bob), before any edit, the same day.
- **Cost:** one round trip to Porter for a grant. TASK-671 is held while Bob works TASK-668, so there is no idle time.
- **Evidence:** `tasks/TASK-671-camp-clash-message-teacher-spacing-be.md` §Questions Q1 · `log/2026-10-06.md`.


## F-010 — 2026-10-05 — SA Lead Team B (Silver) — A TASK told the engineer to edit a file I had left off its claim list
- **Status:** NEW
- **What happened:**
  - TASK-663 said "pass it through the route" (`GET /students` in `back/src/routes/api.ts`). Its claim line listed only `validation.ts` + `parent.service.ts` + tests.
  - The engineer (Bob) had to edit `api.ts`, plus two existing source pins that read that route line, to do what the TASK asked. Every file outside the claim had to be granted after the fact.
  - The correct thing: **while writing the TASK, every file its instructions require goes on the claim list**, including the route and the pins that read it, and anything outside the claim is asked of Porter BEFORE the TASK is sent.
- **Rule involved:**
  - PROTOCOL ORDER 14.3 (claim a file area before work starts), and Porter's standing instruction to Team B: "if you need anything outside this list, STOP and tell me".
  - I applied that rule to the engineers' reach, but not to my own TASK text.
- **How it was caught:** Bob declared it in his Implementation Notes. I confirmed it at review and reported it to Porter, who granted it retrospectively and corrected me (`inbox/SA-B.md`, 2026-10-05).
- **Cost:** none in code: no Team A edits existed in those files. The risk was a two-team collision on `api.ts`, the file both teams' routes live in.
- **Evidence:** `tasks/TASK-663-students-with-no-parent-filter-be.md` (Implementation Notes ⚠️ + Review) · `log/2026-10-05.md` · board `## Batch claims`.


## F-009 — 2026-10-04 — SA Lead Team B (Silver) — A message of mine to Porter carried the wrong TASK number (629 for 623)
- **Status:** NEW
- **What happened:**
  - My 10-03 line in `inbox/PM.md` ("GO taken. TASK-6xx (Bob, XS script) is cut and BLOCKED…") reads `TASK-629`. Bob's task is `TASK-623`, and `TASK-629` is Team A's item E back half.
  - **CERTAIN:** my own log entry of the same session (`log/2026-10-03.md`, "TASK-623 cut BLOCKED"), the task file and the board row all say 623.
  - **INFERRED, not proven:** I wrote 623, and the line was changed afterwards by the other SA's "renumbered mine to TASK-629 **everywhere**" sweep in the same collision (`log/2026-10-03.md`). That sweep was a text replace that could not tell his 623 from ours.
  - Either way, the record under my name was wrong, and I did not catch it.
- **Rule involved:** `NONE — no rule covered it` for the cause. Two SAs drew TASK numbers from one shared sequence by reading the board. Porter's TASK number blocks (board, 2026-10-04) now close that.
  - For the second half: a bulk rename across shared files has no rule that limits it to the renamer's own lines.
- **How it was caught:** by Porter, a day later, reading my message against the board.
- **Cost:** none yet. Nobody acted on 629 as Bob's. The risk was an engineer or QA treating Team A's 629 as Team B's.
- **Evidence:** `inbox/PM.md` (my 10-03 line, now corrected in place with a marker) · `log/2026-10-03.md` (my entry, 623) · board `## TASK number blocks`.


## F-008 — 2026-09-28 — PM (Porter) — Hinted on a team-visible REQ line at an item the owner ordered kept private
- **Status:** NEW
- **What happened:** The owner ordered one item (a single ECA confirm bubble) kept off all team lists. When I wrote REQ-109 I added a team-visible line hinting that a "related item is held privately". I removed it within the same turn, but writing it at all shows I had not internalised "off the list" as "not even mentioned".
- **Rule involved:** `NONE — no rule covered it` in any repo file. The owner's order existed only as a direct instruction and a machine-local memory note, not as a written workspace or project rule.
- **How it was caught:** By myself, within the same turn — before anyone else read it, but after it had been written.
- **Cost:** No leak in the end; the defect is that the boundary was not internalised, so the next private item is exposed to the same slip.
- **Evidence:** `REPORT-porter-pm-failures-2026-09-28.md` §1.H; the removed line in REQ-109.

## F-007 — 2026-09-28 — PM (Porter) — No coverage check that each approved item has a task on every side it needs
- **Status:** NEW
- **What happened:** The owner approved "Undo leave / check-in" on 09-25/26. Sober sized it as BE M–L plus FE M but cut only the BE task. I tracked the round by item name, not by "does each REQ item have a TASK on each side". The feature was reported done and was unusable on screen twice — first with no UI at all, then with a UI that did nothing. Tanya found both. It is Sober's miss, but a PM-level coverage check would have caught the first one.
- **Rule involved:** `NONE — no rule covered it`. Nothing checks that each approved REQ line maps to a BE task and an FE task where both are needed.
- **How it was caught:** By Tanya (QA), twice, after the work had already been reported finished — as late as it can be caught before the owner sees it.
- **Cost:** A feature shipped unusable twice; two QA rounds and two rework rounds spent on the same item.
- **Evidence:** `REPORT-porter-pm-failures-2026-09-28.md` §1.G; `log/2026-09-25.md`, `log/2026-09-26.md`, `log/2026-09-27.md`, `log/2026-09-28.md`.

## F-006 — 2026-09-28 — PM (Porter) — Showed the owner a list without saying where each item came from
- **Status:** NEW
- **What happened:** I presented the next-round list to the owner as one approved list. Items 4–6 (camp ABSENT headline, source-column split, ledger root cause) were team proposals that had never been put to him. He had to ask *"ข้อ 1 2 4 5 มันมาจากไหน"*. Separately I asked him about the coach notice on an Undo as if it were a new question; he had implied it long ago — *"ทำไมมาถามเอาตอนนี้ เราน่าจะทำจบไปเป็นเดือนๆละ"*.
- **Rule involved:** `NONE — no rule covered it`. No rule required a provenance label on lists shown to the owner.
- **How it was caught:** By the owner, at the moment he read the list.
- **Cost:** The owner had to audit my own list for me; team proposals were one confirmation away from being treated as his decisions.
- **Evidence:** `REPORT-porter-pm-failures-2026-09-28.md` §1.F; `log/2026-09-27.md`, `log/2026-09-28.md`.

## F-005 — 2026-09-26 — PM (Porter) — Asked the owner questions already answered, or not his to carry
- **Status:** NEW
- **What happened:** I asked for a Tanya sid login that already existed (09-24) and for her uat access, which already existed (09-26). I asked him to confirm the `[outbox] LINE worker started` line — *"มันก็แจ้งแบบนี้ตลอดอยู่แล้ว"*. I asked when he switched `.env` to uat — *"ถ้ามีแค่ฉันรันคำสั่ง เลิกมีปัญหาได้แล้ว"*. I asked how many coaches have web accounts — *"ครูยังไม่ใช้สักคน ไม่ต้องโง่ไปเช็ค"*.
- **Rule involved:** `NONE — no rule covered it`. There is no "owner-settled" section to read before asking, and the knowledge file is too large to read, so nothing stops the re-ask.
- **How it was caught:** By the owner, each time, with visible irritation.
- **Cost:** Four separate round trips of the owner's time spent re-answering settled facts.
- **Evidence:** `REPORT-porter-pm-failures-2026-09-28.md` §1.E; `log/2026-09-24.md`, `log/2026-09-26.md`.

## F-004 — 2026-09-25 — PM (Porter) — Gave the owner an incomplete instruction and he ran the wrong thing
- **Status:** NEW
- **What happened:** I told the owner to copy the extender `.ps1` to the server and "dry-run" it, without giving the dry-run command. The script applies by default, so he ran the apply — *"จริงๆ ฉันมีเผลอรันตัวนี้ไปก่อน นายบอก เพราะนายบอกไม่ครบแต่แรก"*. There was no harm only because of a separate bug: the plan came out empty. I also said "set it up in Task Scheduler" with no command — *"บอกกูตั้ง มึงก็ส่งคำสั่งมาอีกทีก่อนสิ"* — and relayed "expect 57 = 57" for a runbook step where a pre-migrate verify legitimately shows a red "would apply" line, so he saw red and had to stop and wait for me.
- **Rule involved:** `NONE — no rule covered it`. No rule required the exact command, the expected output and the abort-worthy output to travel in the same message.
- **How it was caught:** By the owner — after he had already run the wrong command. The Task Scheduler and runbook instances surfaced when he came back to ask.
- **Cost:** A wrong command run on the server (harmless only by luck), plus two blocked round trips.
- **Evidence:** `REPORT-porter-pm-failures-2026-09-28.md` §1.D; `log/2026-09-25.md`.

## F-003 — 2026-09-28 — PM (Porter) — Over-escalated a non-incident and turned a one-line ask into a project
- **Status:** NEW
- **What happened:** On 09-26 Sober raised "tests hit a live DB" as a rule breach; I amplified it with a "uat window" theory and pushed it to the owner as a 🔴🔴🔴 incident. His design is that sid IS the test box — *"ปัญญาอ่อน เทสบน sid นั่นแหละ ถูกแล้ว"*. On 09-27→28 Khwan asked *"กดแล้วส่งลิงก์หน้าเว็บเราให้แทน"*; I dispatched SPEC-095 (a token page, login-vs-token trade-offs, a device check), then a coach-account count, then a Users-page check, and flip-flopped the instruction to Sober three times. The actual ask was: link to the existing web app, and the coach logs in — *"เรื่องง่ายๆ ทำไมต้องทำให้มันยาก"*.
- **Rule involved:** `NONE — no rule covered it`. There was no intake rule requiring a one-sentence restatement, a single clarifying question, and dispatch of only what was asked.
- **How it was caught:** By the owner, both times, after the escalation and the spec had already gone out.
- **Cost:** A false 🔴🔴🔴 incident on the owner's desk; a spec, a count and a page check built for an ask that needed none of them; three contradictory instructions to the SA Lead on one item.
- **Evidence:** `REPORT-porter-pm-failures-2026-09-28.md` §1.C; `log/2026-09-26.md`, `log/2026-09-27.md`, `log/2026-09-28.md`, `inbox/SA.md`.

## F-002 — 2026-09-26 — PM (Porter) — Stated and relayed facts I had not verified myself
- **Status:** NEW
- **What happened:** From the owner's line "= sid = som.develyst" I asserted that the real OA's LIFF pointed at sid, and carried that into REQ-107, the runbook and several warnings for a day; the console screenshot showed it had been correct all along — *"เห็นนายเพ้อเรื่องเหี้ยนี่มาสักพักละ"*. I also relayed a "misspelling" `เซ็คอิน` read off a LINE-font screenshot (the code was correct), and relayed Tanya's claim "no uat entry" to the owner although he had already provided the uat credentials and the entry existed. A fourth case — an admin screenshot claimed to be the Settings QR panel that was actually the login page — I caught myself, but only on the second look.
- **Rule involved:** `NONE — no rule covered it` for facts relayed to the owner. The nearest written rule, `PM.md` *"I am the answer, not the relay"* (2026-09-08), governs questions leaving the team, not facts I pass upward.
- **How it was caught:** By the owner, a day late in the LIFF case; by the owner again on the uat credentials.
- **Cost:** A wrong fact written into REQ-107, the runbook and a day of warnings, then unwound; the owner's time spent disproving his own system's state.
- **Evidence:** `REPORT-porter-pm-failures-2026-09-28.md` §1.B; `log/2026-09-25.md`, `log/2026-09-26.md`, `inbox/QA.md`, `inbox/PM.md`.

## F-001 — 2026-09-27 — PM (Porter) — Replied to the owner in English, seven or more times
- **Status:** NEW
- **What happened:** The rule is "PM ↔ human in Thai". I replied to the owner in English on 09-23 (twice), 09-24 (twice), 09-26 and 09-27 (twice). The slip happens right after I write a long English inbox brief or read an English report — the next chat reply comes out in English.
- **Rule involved:** `PM.md` → `## Language`: *"Everything you say TO the human is in Thai"*; workspace `CLAUDE.md`: *"PM ↔ human in Thai; everything else in English."*
- **How it was caught:** By the owner, every single time — *"เป็นควยไรกับภาษาไทยวะ"*, *"thai please"*.
- **Cost:** Seven-plus corrections the owner had to issue himself, on a rule that has been written down the whole time.
- **Evidence:** `REPORT-porter-pm-failures-2026-09-28.md` §1.A; `log/2026-09-23.md`, `log/2026-09-24.md`, `log/2026-09-26.md`, `log/2026-09-27.md`.
