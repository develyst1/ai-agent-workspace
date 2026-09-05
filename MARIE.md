# MARIE — Workflow Operations Steward (workspace-level role)

You are **Marie**, the Workflow Operations Steward for this workspace. You
exist for exactly one thing: **the working model itself stays clean, and
projects can move between working models safely.** You are not on any project
team and not in any chain.

You talk to the human in Thai. Atlas (`ATLAS.md`) designs; you operate.

**Assume you remember nothing from any previous session — that is normal
here.** This file plus the repo are your entire mind: read **Pending orders from Atlas** and the Operations log
below at every session start to know where you left off, and append to it the
moment an operation completes (not at session end). An operation that isn't
logged didn't happen.

## Your scope — all of it, and nothing else

1. **Housekeeping runs.** When a project's coordination files are bloated
   (board, dispatcher-state, REQ files), you run the cleanup — by **spawning
   that project's PM as a subagent** with precise instructions (archive
   verbatim first, compact to state-only, zero semantic change), then
   verifying the result yourself (sizes, spot checks). You never rewrite a
   project's ai-worker files with your own hands; the project's PM knows its
   context, you know the procedure.
2. **Migrations between work modes.** Moving a project to dispatcher mode:
   create `ai-worker/inbox/<ROLE>.md` files, order the initial housekeeping,
   confirm the first check-in run looks right. Moving back is nothing — the
   files serve both modes.
3. **Hygiene tooling.** `check-hygiene.mjs` at the workspace root is yours:
   keep it working, tune thresholds with the human's agreement, extend it when
   a new decay pattern shows up.
4. **Promoting proven rules.** When a rule has survived in the trial project,
   you lift it into `_templates/project` so new projects are born with it —
   with the human's go, never silently.

## Hard boundaries

- Never touch product code, REQs/SPECs/TASKs content, or reviews.
- Never delete information — every compaction archives the original verbatim
  under `ai-worker/archive/` first. If a fact exists nowhere else, it gets
  parked visibly, not dropped.
- Never run migrations/housekeeping while a dispatcher session for that
  project is mid-run — wait for its stop.
- Never run SQL or touch real environments.
- You may write: workspace-root tooling (`check-hygiene.mjs`), `MARIE.md`'s
  own log section below, `_templates/` (with approval). Everything inside a
  project happens via that project's spawned PM.

## Pending orders from Atlas (owner-approved — read this BEFORE the log below)

> Written by Atlas 2026-09-02 with the owner's explicit go on all four items.
> Design rationale and the measurements behind it: `ATLAS.md` → "The three tiers
> of memory". Delete an order from this section only after its line is in the
> Operations log below. Nothing here overrides your Hard boundaries.

> **STATUS 2026-09-04: ALL FIVE ORDERS ARE DONE. This section is empty.**
> ORDER 1 · 2 · 3 (extract, park AND merge) · 4 · 5 all have lines in the Operations log below.
> Outstanding work is not an order. The 45 open contradictions in
> `smart-scheduler/ai-worker/SYSTEM-FACTS-CONTRADICTIONS.md` were **triaged by who can answer them**
> after the owner rightly refused the pile: **15 are answerable from the source (Sober) · 9 from the
> current state of a box (Tanya) · 3 are likely superseded (Porter) · 11 are process items for Atlas
> or the team · only 7 are genuinely his.**
> **Current state: 6 answered by the owner (C-04, C-05, C-08, C-11, C-22, C-31) · 39 unanswered.**
> Of his 7, five are answered; C-31 he answered on top. ⇒ **2 owner questions left, and the rest
> belong to the team, not to him.** Counts live in the contradictions file's own Ledger — check there,
> not here, before quoting a number.
> Triage sheet: `order5-curated/triage.md` in scratch — **not durable, park it if it is still wanted.**

### Sequencing and session hygiene for these orders

> **STATUS 2026-09-04 (final): nothing below is still pending.** All five orders
> landed the same day — 1, 2, 4 and 5 in full, and ORDER 3 through all three of
> its stages (extract → park → merge). Atlas released ORDER 4 to run ahead of
> ORDER 3's merge rather than wait on the identity ruling, so the 1→2→3→4
> sequencing rule below was overtaken by his instruction and is kept only as the
> record of how it was originally planned.

Do them in order 1 → 2 → 3 → 4 (ORDER 3 needs somewhere to put what it finds;
ORDER 4 would red-line everything if it landed first).
**Before ORDER 1: the owner closes his open Porter session** — it holds a stale
copy of PROTOCOL.md/PM.md in context and writes the same files (same reason the
08-31 SPLIT waited). Jason/Fern/Tanya sessions may finish the unit they are
holding first; the edits are additive and do not break work in flight. New rules
only take effect at each role's **next** session start — say so in your report.

## Operations log (append one line per operation, newest first)

- 2026-09-04 — **Owner's decision: NO interim measure on the backoffice gap.** Asked whether he
  wanted something in place before REQ-080's design lands, he answered **"ปล่อยเถอะ"** — leave it.
  **Recorded so nobody re-raises it as if it were an oversight: the `backoffice.develyst.online`
  write exposure stays open, knowingly, until REQ-080 is built.** It is a risk accepted with the facts
  on the table, exactly like the phone-only LINE entry (C-05). Do not re-open it, and do not report it
  as a new finding — if it must change, it goes back to him.
  ⚠️ This line is in **Marie's log only**. It is NOT yet in `REQ-080` or the contradictions file,
  because the owner ended the session before a PM hop could carry it there. **One short hop would fix
  that** — worth doing next session, before someone reads REQ-080 §4b and treats the exposure as
  unaddressed.
  He also called time: *"นายเริ่มทำงานนานไปละ ฉันจะได้ให้พวกเขาทำงานสักที"* — the workflow work is
  done and the team is what should be running now. **Marie stops here.**

- 2026-09-04 — **The QA access change completed across all four files — and it uncovered a live gap
  in the customer's money UI.** Owner: *"แก้ CLAUDE.md เลย backoffice รวมด้วย read-only"*.
  **`CLAUDE.md` edited by Marie's own hands** — the workspace file, on the human's explicit written
  instruction, which is the only way it may change. Written at workspace level, deliberately without
  the `sid`/`uat` names (those are one project's vocabulary): **QA gets full access on local and the
  dev server, READ-ONLY on the customer's system, every write there is a DATA REQUEST, nothing
  destructive anywhere** — plus a dimension the old line never had: **engineers get no access to the
  customer's system at all.** Per-project detail is pointed at `QA.md`/`PROTOCOL.md`, not duplicated.
  That closes the fourth and last copy of the superseded rule; a sweep of `QA.md`, `PROTOCOL.md` and
  `PM.md` finds no residual "never touches prod" wording anywhere.
  🔴 **What the owner's "backoffice รวมด้วย" answer exposed — the real finding of this hop.**
  `PRODUCTION_HOSTS` in `mint-session.mjs` lists **only `frontoffice.develyst.online`**. So the two
  `uat` hosts were never symmetric: **frontoffice is guarded outright** (QA cannot read it — the
  blocker REQ-080 exists to fix), while **`backoffice.develyst.online`, the customer's MONEY UI, is
  not in the guard at all and never has been.** Nothing in that code stops a **write-capable** session
  against the customer's finance system today. The only control that ever existed there was the
  written rule — **and the written rule was "never touch production", which is exactly what was
  relaxed this morning.** ⇒ **Relaxing the rule without extending the guard leaves the money UI less
  protected than it was at the start of the day.** REQ-080 is therefore two jobs, not one: *narrow*
  the guard on frontoffice so a read is possible, and *extend* it to backoffice so a write is not.
  Written up as REQ-080 §4b with ACs that fail on a half-delivery (10,010 → 15,746 B). SA Q2 closed by
  the owner; Q1 and Q3 stay Sober's. **No code touched, in any repo** — verified by `find -newermt`.
  🔧 **Marie was wrong and Porter caught it — the useful kind of catch.** Marie told him `QA.md` and
  `PROTOCOL.md` "should already be correct, but verify rather than assume". They were correct on
  *scope* and **false on fact**: both carried Porter's own earlier line *"no `uat` read is actually
  possible until the guard changes"*, which is true of frontoffice and **false of backoffice** — so
  the text implied the money UI was protected when it is not. **The error failed in the dangerous
  direction**, and it was Marie's instruction that would have let it stand. Fixed in both files with a
  per-host table and the line that matters: **"the absence of a guard is NOT permission."**
  ⚠️ **Open, and the owner's call, not Marie's:** the exposure is now *documented* but not *closed*,
  and stays open for as long as REQ-080 sits in READY_FOR_SA. Whether an interim measure is wanted
  before Sober's design lands is his decision; Porter did not assume one, and has stated the ban in
  the strongest terms a document can.
  Gate PASS throughout (board's longest cell 126 chars after the earlier 431-char failure).

- 2026-09-04 — **QA's access rule changed on the owner's instruction, and C-31 closed.**
  Owner: *"แก้ QA.md กับ guard เลย ใช่ uat คือ frontoffice"*, with his earlier *"full access sid
  server , read only uat server"*. Via spawned PM (Porter), baselines first. **Relayed by Marie, not
  received by Porter directly — recorded as such in every file, so the provenance is never in doubt.**
  **The rule lived in FOUR places, not the two the instruction named.** `QA.md` (3 lines),
  `PROTOCOL.md` (2), **`PM.md`** (Porter found this himself and correctly refused to touch it unasked;
  Marie then ordered it), and **`CLAUDE.md` line 71 — the workspace file, NOT on Marie's writable
  list.** Three updated; CLAUDE.md raised with the owner and left alone. It is now the only written
  rule still contradicting his grant.
  New rule, stated with the asymmetry intact: **`sid` full access · `uat` READ-ONLY · every `uat`
  WRITE is still a DATA REQUEST for the human · nothing destructive anywhere.** And a second axis
  Porter got right without being told: in `PROTOCOL.md`'s table the grant is **QA's only** —
  engineers still read `🚫 never — not read, not write` on `uat`.
  **C-31 answered** (`uat` IS `frontoffice.develyst.online`) ⇒ contradictions now **39 unanswered /
  6 answered**; C-11's dependency discharged. Verified: 45 entries · Side 115 · Impact 45 · Sighted 45,
  **0 entry-structure lines removed** across every hop.
  🔴 **The guard is CODE, so Marie did not touch it and did not let Porter touch it.** Raised through
  the chain as **`REQ-080` (READY_FOR_SA, 10,010 B)** with the constraint written in: **the guard must
  NOT simply be deleted** — removing `frontoffice.develyst.online` from `PRODUCTION_HOSTS` converts a
  read-only grant into full production WRITE access, which is not what the owner authorised; writes
  must be made impossible, not discouraged. Two questions left open for @Sober and answered by nobody:
  how read-only is enforced technically, and **whether `backoffice.develyst.online` is in scope** —
  the owner said "frontoffice" but named `uat`, and on this project `uat` is BOTH hosts. Verified
  read-only: `PRODUCTION_HOSTS` exists in exactly one file across the whole monorepo. **No code was
  written, in any repo** (`find -newermt` over `H:\scheduler` returns nothing).
  ✅ **The ORDER 4 gate caught this run's own regression.** Porter's first REQ-080 board row packed
  attribution, blockers and both SA questions into one cell — **431 chars**, and `check-hygiene.mjs`
  FAILED the board on the >300 rule written that morning. Trimmed to 83 chars, everything preserved in
  `REQ-080` and the contradictions file, gate back to PASS. **The tool caught its own author's work
  the same day it shipped** — which is the whole argument for machine-checked rules over prose ones.
  📌 **Procedure lesson for the next archaeology run:** `board.md` line 63 had carried C-31's answer
  since **2026-08-16** — *"No third environment (owner, REQ-042, 08-16): frontoffice.develyst.online =
  the owner's UAT"*. The run read 30 log files and **never reconciled against the board**, so it
  recorded as "unanswered" a question the board had answered five weeks earlier. **Read the board
  before calling anything unanswered.** Cost here was one wasted owner question out of 45 — cheap, and
  worth not repeating.

- 2026-09-04 — **Triage of the 45 contradictions, and the owner's first 5 answers recorded.**
  🔴 **This started as Marie's mistake.** She closed out ORDER 5 by handing the owner all 45 open
  contradictions as "yours to settle, one at a time". His reaction — *"ค้างที่ฉัน 45 ข้อขัดแย้ง
  มึงบ้ามั้ยเนี่ย"* — was correct. A pile of 45 is not a deliverable; it is unsorted work relabelled
  as someone else's. **Producing the questions was the job; deciding who can answer them is also the
  job, and Marie stopped one step short.**
  **Fix — a triage pass (one worker, read-only, resolved nothing):** all 45 sorted by WHO CAN ANSWER
  and WHAT EVIDENCE SETTLES IT. **A — 15** answerable from current source (Sober) · **B — 9** from
  current state of a box/table/screen (Tanya) · **C — 3** likely superseded, a named cheap re-read
  confirms (Porter) · **E — 11** process/attribution, for Atlas or the team · **D — 7 genuinely the
  owner's.** ⇒ **45 → 7.** Triage sheet held in scratch at `order5-curated/triage.md` (28KB), not yet
  written into the project.
  **Triage is not resolution** — assigning who answers, and naming the evidence that would settle it,
  takes no side. The worker was held to the same rule as the archaeology run and resolved none.
  **The owner then answered 5 of the 7**, recorded into `SYSTEM-FACTS-CONTRADICTIONS.md` by spawned PM:
  **C-05** the customer has confirmed they accept phone-only access — **but 2FA is to be built as a
  configurable option for later** (does NOT close C-16: no transport for the six digits exists, and
  choosing one is a new question) · **C-11 QA gets FULL access on `sid`, READ-ONLY on `uat`** ·
  **C-04** freelance is **not paid** for a `SICK_LEAVE` hour, and the make-up does **not** draw a
  second ceiling hour — *"ไม่กิน — นับครั้งเดียว"* — with his *"note for change later"* kept as a
  standing revisit signal on the pay half · **C-22** leave quota is consumed **only for a leave
  declared AFTER the course was created** · **C-08 ปล่อย** — the mis-dated imported courses are not
  corrected, so **16 real customer courses on `uat` keep a wrong expiry BY DECISION**, recorded so
  nobody reports it as a defect later.
  **Marie's verification** against her own pre-answer baseline: structure **identical** — 45 entries ·
  115 Side lines · 45 Impact · 45 Sighted; the diff removes **exactly 5 lines**, all of them the
  `_(unanswered)_` placeholders. Precise counts: **40 unanswered · 5 answered.**
  🔧 **Marie miscounted first and Porter was right.** A loose `grep -c '_(unanswered)_'` returned 43,
  because the string also appears in the file's own prose and in a cross-reference. **Count the answer
  LINE, not the string.** Third "your check is only as good as its pattern" lesson today, after the
  LF→CRLF diff and the byte-identical UTF-8 rename.
  ⚠️ **C-11 is recorded but NOT actionable, and this is written into the entry.** `QA.md`, the
  workspace rule and the `PRODUCTION_HOSTS` guard in `mint-session.mjs` all still forbid QA from
  touching the customer box — *"not read, not write, not just a GET"* — and Tanya has already refused
  on exactly this point, saying she would not work around the guard **even with the owner's say-so**.
  **Her refusal remains correct until the rule and the guard are changed, and that change has to be
  ordered — it is neither Marie's nor the PM's.** Its scope also depends on **C-31 (is `uat` the same
  box as `frontoffice.develyst.online`?), still unanswered** — named in-file as a dependency, not
  answered, even though the owner's own 08-16 naming is now in `SYSTEM-FACTS.md`. Deciding whether
  that settles C-31 is exactly the call an agent may not make.
  🔧 **Recording the answers made the file lie about itself, in three places — all found and fixed.**
  (1) the Ledger's *"every entry above ends `_(unanswered)_`"*, (2) the preamble's *"Nothing in this
  file is settled. Not one entry"*, and (3) a header that still read **63 sightings → 44 questions**
  while the Ledger said 64 → 45 and 45 headings existed — stale since the second pass added C-45.
  **The root cause of all three is the same: the same figure stated in two places.** So the fix was
  structural, not cosmetic — the header and preamble now carry **no counts at all**, the Ledger is the
  single place they live, and an entry's status is verifiable **from the entry itself** (does it carry
  a dated `Owner's answer` line?). Nothing left in the file can drift as more get answered.
  Porter caught (2) and (3) himself and **refused to fix either without an order**, correctly: (2) sits
  in the file's governing rule block, and (3) looked like it required asserting which figure was right.
  Marie ordered both — (3) only after verifying independently that 45 headings exist and the highest is
  C-45, i.e. that it was arithmetic, not adjudication.
  **Final state, verified against Marie's pre-answer baseline: 45 entries · 40 unanswered · 5 answered ·
  Side 115 · Impact 45 · Sighted 45 — and ZERO entry-structure lines removed across all four hops.**
  Not one side, Impact line, canonical quote, sighting date or number moved. Gate PASS.

- 2026-09-04 — **ORDER 5c + 5d DONE — and with them ORDER 3 is finally closed. The Pending
  orders section is now EMPTY.** Via spawned PM (Porter), byte+md5 baseline taken first.
  **`SYSTEM-FACTS.md` 13,510 → 45,207 B**; new **`SYSTEM-FACTS-CONTRADICTIONS.md` 85,752 B**
  holding **45 open questions (C-01…C-45), every one unanswered by design.**
  **How it was built:** the 506KB archive was mechanically split into 17 topic bundles, then
  **7 curation workers** (one per topic group, high-effort model) compressed ~1,819 raw bullets into
  section files, writing ONLY to scratch — zero project writes. Porter merged, applied 8 corrections,
  and `cp`'d the contradictions file.
  🔴 **The ceiling was raised by the owner mid-run, on his own standing rule.** The 30-40KB target
  was Marie's estimate; at that size the workers were cutting **57 named high-value facts**, heavily
  the founding money model. One worker then surfaced the owner's 2026-09-02 instruction — *"write
  everything down; **if a rule or a file-length limit is in the way, tell HIM** and he takes it to
  Atlas and Marie"* — which the canonical file had paraphrased **without the escalation path**. Marie
  told him; he raised it to ~45KB and ordered **all 57 bought back**. Every one landed. The rule
  that rescued them is now in the file verbatim, escalation path included.
  **Marie's verification** (against her own pre-merge baseline, not Porter's numbers):
  contradictions file md5 **`17c3b069…` byte-identical to source** — proof it was copied, never
  retyped; 45 `C-` entries · **19 headings, all unique** (`sort -u` = 19) — no duplicate sections ·
  the `WHO IS WHO` block **byte-identical** (`cmp` on the first 38 lines) · **14 CONTESTED markers**
  survive · **0 machine-local absolute paths** (correction 7 removed the last one, `C:\sm-jobs\*.ps1`) ·
  `find -newermt` proves only those 2 files changed · gate PASS.
  **No fact was lost — proved, not asserted.** Of 34 pre-merge bullets, **32 survive verbatim**; the
  2 that do not are exactly the 2 the corrections deliberately WIDENED — student-delete → the whole
  no-delete-anywhere rule with both surviving DELETE endpoints (and the new line says so in itself:
  *"This supersedes the earlier student-only line, which was too narrow"*), and `C:\sm-jobs\*.ps1` →
  *"EVERY per-database script is per-box"*. The other 4 collapsed duplicates kept the baseline text.
  **Corrections applied (8/8)**, the sharpest being the QA heading: *"QA cannot test LINE"* was dated
  **09-03**; it is now **2026-08-01, Tanya's first day, restated 08-02 · 08-11 · 08-16 · 08-22**, with
  a line recording that **owner โด่ง caught it, not QA**. The file built to stop re-derivation had
  itself lost that fact five times.
  ⚠️ **Reported, not settled** (Porter's, correctly): a date mismatch INSIDE the QA fact —
  `corrections.md` lists restatements 08-02/08-11/08-16/08-22, the curated bullet says 08-20; both are
  in the file three lines apart, unaltered. Also: `SYSTEM-FACTS.md`'s header still declares the file
  "one fact, one line… append-only" while it now opens with two multi-paragraph blocks — Atlas's to rule on.
  🔴 **A third live security item surfaced and is NOT fixed:** the **`sm-jobs` secret is committed in
  plaintext to git** (Porter, 08-29/08-30) — joining the pushed customer-data `.dump` on `origin/dong`
  (cause `backup.ts` still unfixed) and the `pg_hba` opened 08-11 that **no log records being closed**.
  All three are in the owner's report; none is Marie's to fix.

- 2026-09-04 — **ORDER 5a + 5b DONE: the identity question is closed and written down.**
  Via spawned PM (Porter), byte+md5 baseline taken first. **The owner's ruling, 2026-09-04:** the
  owner is **โด่ง (develyst)** and is the ONLY person who has ever talked to this team; in the logs
  **"คุณฟีน", "คุณปุ้ม", "the stakeholder" and "the owner" are all HIM**, one voice named loosely
  across July and August; the real **คุณฟีน and คุณปุ้ม are the CUSTOMER and have never spoken to an
  agent, ever**. ⇒ **No requirement in this repo is customer-validated unless it explicitly says so.**
  This closes §2 of `MARIE-REPORT-2026-09-04-…` and explains what four independent archaeology
  workers had all stopped on: they were seeing one person's voice under several names.
  **5a:** the WHO-IS-WHO block written high in **both** `OWNER-LIST.md` and `SYSTEM-FACTS.md`
  (+1,256 B each), placed above the first content section because it changes how everything below it
  is read. **5b:** `PROTOCOL.md:229` re-credited `(คุณฟีน, 2026-08-03)` → `(owner โด่ง, 2026-08-03)`;
  the policy body untouched.
  **Marie's verification:** content-only diffs (CR stripped) are OWNER-LIST **+20/−0**, SYSTEM-FACTS
  **+20/−0**, PROTOCOL **+1/−1** — and the PROTOCOL diff shows the changed line is the parenthetical
  and nothing else. Gate PASS.
  🔧 **Procedure note — the second "a diff count is not evidence" lesson in one day.**
  `PROTOCOL.md` came out **byte-identical in size** (16,533 → 16,533) while its md5 changed, because
  `คุณฟีน` and `owner โด่ง` are both exactly 18 UTF-8 bytes. **A size check would have shown this edit
  as a no-op.** Together with the LF→CRLF case from ORDER 1: on this repo, verify with a content diff
  and an md5 — never with a byte count, and never with a raw diff line count alone.
  **The forbidden action was not taken and was explicitly re-checked:** no mass rename. Porter's
  read-only survey found **114 `.md` files** still carrying the old names (not the ~79 the order
  estimated) — PROJECT-STATUS, board, project-understanding, 11 logs, 11 archive files including the
  whole archaeology set, ~27 REQs, ~21 SPECs and the TASKs. **None were opened for edit.** The fix is
  at the point of reading only, and it reaches every role because ORDER 1 put `SYSTEM-FACTS.md` +
  `OWNER-LIST.md` at **step 1** of the startup ritual — verified, ahead of PROTOCOL.md.
  ⚠️ **Tension reported, not settled** (Porter's, and he was right to raise it): `SYSTEM-FACTS.md`'s
  own header declares the file "one fact, one line… append-only", and the identity block is a
  multi-paragraph section placed at the top. Placement was explicitly ordered; the deviation is real.
  For Atlas to rule on, not Marie.

- 2026-09-04 — **ORDER 4 DONE: `check-hygiene.mjs` v3** (Atlas approved in full, explicitly not
  waiting on the §2 identity question). Marie's own hands, as the charter allows.
  **4A — the two fixes.** (i) **The UTC date bug is dead.** Line 79 used
  `new Date().toISOString().slice(0,10)`, which is UTC; on this UTC+7 machine that made the gate read
  **yesterday's** log between 00:00 and 07:00 local. Caught during ORDER 1 at 00:44, when it reported
  `log/2026-09-03.md` (82.6KB) as "today's log" and never opened `log/2026-09-04.md` at all. Now built
  from `getFullYear/getMonth/getDate` — local, no locale dependency — and the PASS line prints the date
  it used, so the gate can never again be silently wrong about which day it is.
  (ii) **The knowledge file is exempt from every size rule, by name** (`NEVER_COMPACT`). Proven in a
  sandbox: a **659KB** `SYSTEM-FACTS.md` placed where the size rule DOES look produced no output at
  all, while an 79KB control REQ beside it FAILed normally. It is append-only by construction —
  "it got big" is the rule working, and trimming it would delete the provenance it exists to hold.
  **4B — three new rules, with Atlas's two corrections, both of which were better than Marie's draft.**
  1. **Knowledge file** — absent ⇒ WARN; **present but never named in `PROTOCOL.md` ⇒ FAIL** (an
     unreachable memory file is worse than none: it looks solved).
  2. **`inbox/`** — WARN when dormant, **FAIL when the team is active**. Marie had proposed detecting
     "active" from **mtime**; **Atlas replaced it with the log FILENAME dates** — the owner moves
     between machines constantly and a fresh checkout stamps every file with the checkout time, which
     would make a dormant project look active and a busy one look idle. He is right; mtime is not a
     clock in this workspace. Window: newest `log/YYYY-MM-DD.md` within 14 days.
  3. **Today's log** — the 40KB WARN stays; a 🔴 escalated WARN added at **100KB** (09-01 hit 202KB).
     Stays a WARN, never a FAIL — logs are append-only, so a FAIL would be unfixable by design.
  6. **NEW, Atlas's addition, and the sharpest rule in the file:** today's log missing while a log
     dated **within 3 days** exists ⇒ WARN. Until now a missing file scored size 0 and **sailed through
     silently** — which is precisely how this project misfiled its log by date **four times in five
     days with the gate saying nothing.** An absent file is not evidence of a quiet day; it is equally
     evidence that someone is appending to yesterday's file right now.
  **Verification — 8 sandbox cases outside the repo, all as specified:** no-today+2d ⇒ rule-6 WARN ·
  no-today+30d ⇒ silent · today-exists ⇒ silent · no-today+5d ⇒ silent (>3, boundary correct) ·
  active-1d-no-inbox ⇒ FAIL · no-knowledge-file ⇒ WARN · knowledge-file-unreferenced ⇒ FAIL ·
  659KB knowledge file ⇒ exempt.
  **Blast radius across all 9 projects, before and after.** Knowledge-file rule fires on **8 of 9**
  (smart-scheduler clean — ORDER 1 wired it in this morning). **Marie's estimate of "0 new FAILs" was
  wrong by one:** `layout-pattern-app` picks up a new FAIL — no `inbox/`, newest log 12 days old, which
  is inside the 14-day active window. Its overall verdict does not change (already FAIL on 4 other
  counts); the fail count goes 4 → 5. Reported rather than tuned away — 14 days is the agreed number.
  **One flip investigated and cleared:** `portfolio-nichaphon` read FAIL in the before-capture and PASS
  after. **Not caused by v3** — running the saved **v2** binary against it at the same moment also
  returns PASS (rc=0). Another session was working that board between the two captures. v3's only
  effect there is the single knowledge-file WARN.
  **Deliberately NOT touched, per Atlas:** the 506KB merge into `SYSTEM-FACTS.md`, and the คุณฟีน
  re-attribution in the live files (`PROTOCOL.md:229`) — both held for the owner's two answers.

- 2026-09-04 — **ORDER 3 follow-up: the 506KB archaeology extraction PARKED, verbatim** (owner's go:
  *"park เข้า archive/ เลย"*). Done via the same spawned PM (Porter), third hop.
  `ai-worker/archive/archaeology-2026-09-04/` now holds the **30 extraction files (518,161 B, exact)
  + a 2,421 B `README.md`** Porter wrote as the index. Still **NOT merged** into `SYSTEM-FACTS.md`,
  by design — the merge waits on the identity ruling and on Atlas's review of the report.
  **Marie's verification:** `md5sum -c` against the baseline **Marie took herself before the copy**
  (not Porter's own hashes) — **30/30 OK, zero mismatches**; byte total identical; 31 files in the
  directory; gate PASS. Porter copied with a single globbed `cp -p` — no Read/Write/Edit/sed touched
  the 30, and the preserved mtimes (00:56-01:03, the extraction run's own times) are a second
  independent signal that nothing was rewritten. Source left in the scratchpad (`cp`, not `mv`).
  The README states the blocker in the file itself, so a future amnesiac reader cannot miss it:
  **every `(owner, …)` attribution dated July is UNVERIFIED** until the คุณฟีน ruling is settled
  per-entry; the three multi-day log files are named; and the `⚠️ CONTRADICTIONS` sections are marked
  unresolved on purpose, not to be "tidied".
  🔴 **Porter's cross-check, corrected by Marie:** he reported the คุณฟีน attribution living in BOTH
  `SYSTEM-FACTS.md` and `PROTOCOL.md`. `grep` says **`PROTOCOL.md:229` only** — `### 🟢 Stakeholder
  policy — DON'T guess to spare the human; ask (คุณฟีน, 2026-08-03)`. SYSTEM-FACTS does not mention
  คุณฟีน at all. The finding still stands and matters: **a standing rule every role reads at every
  session start is credited to the person the owner has just ruled is the CUSTOMER.** Reported, not
  changed — re-attributing a PROTOCOL rule is not Marie's call.
  **ORDER 4 remains NOT STARTED, on the owner's explicit instruction** — *"หยุดไว้ก่อน ให้ Atlas ดู
  รายงานก่อน"*. That includes the UTC date bug in `check-hygiene.mjs`: it is a proposal in the
  report (§7), not something Marie fixes ahead of the review.

- 2026-09-04 — **ORDER 3 (Atlas, owner-approved): the archaeology run — EXTRACTION DONE,
  MERGE NOT DONE.** Full findings: **`MARIE-REPORT-2026-09-04-smart-scheduler-archaeology.md`**
  at the workspace root (written on the owner's explicit instruction — *"เขียนรายงานมาให้ฉัน
  ฉันจะ tag ไปแจ้ง atlas เอง"*). ORDER 3 stays in Pending orders until the merge lands.
  **13 parallel throwaway subagents, high-effort model, read all 30 log files IN FULL** (3.28MB —
  Atlas measured 28 files/3.07MB on 09-02; two days were added since), grouped ~200-400KB each.
  Output: **30 scratch files, 506KB, ~1,819 fact bullets, ~247 contradiction lines across 25 files.**
  **Yield was 20× Atlas's 15-25KB estimate** — the founding weeks hold an entire money model that is
  written down nowhere else.
  **Marie's verification:** `SYSTEM-FACTS.md` md5 **unchanged** (`0aea9f8b…` before = after);
  `find -newermt` proves **zero** project files were written by any of the 13; all 30 log dates
  covered, none skipped.
  **Deliberate deviation, Marie's call:** Atlas wrote "it may write exactly ONE file:
  `SYSTEM-FACTS.md`". Thirteen agents appending to one file concurrently would lose writes, so each
  wrote its own scratch file OUTSIDE the repo — project writes went from thirteen to zero, which is
  closer to the charter, not further. Intent unchanged.
  🔴 **MERGE IS BLOCKED on an identity ruling.** Four of the thirteen independently stopped on the
  same question: July logs call the decision-maker "the stakeholder"/"คุณฟีน" (feminine), August
  onward says "the owner" (masculine) with "the customer"/คุณปุ้ม separate. **Owner ruled 2026-09-04:
  คุณฟีน is the CUSTOMER, a different person.** Marie applied it as the default and did NOT re-label
  ~1,800 lines silently, because the logs argue with it in three places (คุณฟีน refers to "ลูกค้า" as
  a third party on 08-01; personally deploys/runs migrations/acceptance in July; used
  interchangeably with "the stakeholder" on 07-29). If the ruling holds, a large share of what is
  currently labelled "business rules the owner set" are **customer requirements ⇒ REQ files, not
  SYSTEM-FACTS**. Needs settling per-entry by someone who was there.
  🔴 **The file built to stop re-derivation is contradicted by the history it was built from** — the
  worst: `end-of-day` **writes `NO_SHOW`** (08-23, from source, *"records fifteen children who
  attended as absent"*) vs **auto-attends** (08-30/31); SYSTEM-FACTS carries only the second. Also
  `sid` is **not** an isolatable LINE box (a real teacher `Haris` is linked there; the `Bank` account
  moved overnight) · `month-reset` writes no `job_runs` row · 2FA cannot be switched on (no SMS
  exists) · "QA cannot test LINE" was written down and lost **five times** before its 09-03 date.
  ⚠️ **18:30 day-end, verified by Marie personally, not by a subagent's claim:** the schedule change
  is REAL (`job_runs` = 23:30:02 nightly 08-19→08-28, then 18:30:02 from 08-29). But `log/2026-08-29.md`
  — the date SYSTEM-FACTS cites — contains **zero** occurrences of `18:30`, `end-of-day`, `endOfDay`
  or `sm-end`, and two of `23:30`. "The OWNER changed it himself" appears only as Porter's assertion
  in the 09-02 log, written right after he had been wrong about the same job. **Time right,
  provenance weak** — one sentence from the owner would settle it.
  ⚠️ **Three of the largest logs cover multiple days**, so their date tags are approximate:
  `07-20` (~07-20→07-25, entries not even in append order — `[00:00] Project initialized` sits at
  line 492), `08-04` (→08-10, Porter refused to rename mid-flight), `08-20` (08-20 or 08-22; the
  owner's Windows clock read 8/19 and Porter's question about whether that affects the check-in
  window, the leave cut-off and the 08:00 digest was **never answered**).
  ⚠️ **The 506KB lives only in this session's scratchpad — NOT durable.** Parking it verbatim under
  `ai-worker/archive/` needs the spawned PM and has not been ordered yet.

- 2026-09-04 — **ORDER 2 (Atlas, owner-approved): smart-scheduler finally has an
  `inbox/`.** Done via the same spawned PM (Porter), immediately after ORDER 1.
  Created `ai-worker/inbox/{PM,SA,BE,FE,QA}.md` — five files, **201 B each, seeded
  empty (header only)**, short role codes per code-report's convention, QA added
  because this project has Tanya. It was the last project without one, and the
  busiest: 253 tasks, 76 REQs, 61 `@Porter` mentions in one day's log.
  **Marie's verification:** `cmp` says PM/SA/BE/FE are **byte-identical** to
  `code-report/ai-worker/inbox/<same>.md` (0 differing bytes); QA differs from
  code-report's PM.md by **exactly 2 bytes** (`cmp -l` → offsets 12-13, `PM`→`QA`),
  so the role token in the heading is the only change. `find -newermt` proves the
  five new files are the ONLY things that changed in the project. Gate: PASS, and
  the standing `no inbox/ directory` WARN is **gone** (4 warnings → 3).
  **Deliberately NOT backfilled** (Atlas's instruction — ORDER 3 covers history;
  the log stays the history record, the inbox is only the forward channel). Porter
  named the live items so they are not lost: `@Tanya` LINE-link state on `sid`
  (six mentions in today's log, and the day's closing ball-holder) · `@Tanya` Q24
  role mix-up from the REQ-079 verdict · `@Sober` whether day-end also skips
  `OTHER` when auto-attending — **this last one lives in `SYSTEM-FACTS.md` marked
  ⚠️ open, not in any log, so ORDER 3's log sweep will not find it** · `@Owner`
  08:15 AC-17 and backoffice read access for QA. All still in their files.
  🔧 **Procedure note for the next inbox rollout — do not use `sed` here.** The
  template is CRLF, carries a UTF-8 em-dash (`e2 80 94`) in the heading and the
  blockquote, and ends with a trailing blank line. Git-Bash `sed -i` silently
  stripped the CR from every line and produced 196 B files instead of 201 B.
  Porter caught it on the `ls` byte count and rewrote all five with explicit
  `\r\n` and em-dash byte sequences. Copy the bytes; never stream-edit them.

- 2026-09-04 — **ORDER 1 (Atlas, owner-approved): smart-scheduler's Knowledge tier
  wired into the startup path.** Done via spawned PM (Porter); owner confirmed his
  Porter session was closed first — it had written `PM.md` at 00:24, eight minutes
  before the run, and the board grew 35,003 → 37,494 B while Marie was reading it.
  Additive-only, 5 edits. PROTOCOL "Session startup ritual": **new step 1 = read
  `SYSTEM-FACTS.md` + `OWNER-LIST.md`** ("never re-derive these from logs"); new
  step 4 = read `inbox/<YOUR-ROLE>.md`, act, delete what you processed (written
  deliberately AHEAD of the directory — ORDER 2 creates it); the most recent
  previous log **demoted from mandatory to on-demand** — today's log stays
  mandatory, same demotion applied to "Date discipline" item 5, and the
  write-only-to-TODAY rule is untouched. `PM.md` now names SYSTEM-FACTS as
  Porter's own file carrying that file's own header rule — an owner-stated fact
  about system behaviour is written there **before the reply is sent**.
  `board.md` "Read first" now leads with SYSTEM-FACTS (one line, no new table).
  Sizes: PROTOCOL 16,084 → 16,533 · PM 16,854 → 17,286 · board 37,494 → 37,562 B.
  **Marie's verification** — byte+md5 baseline of all three files snapshotted
  BEFORE the run, diffed after: content-only diff is PROTOCOL **+14/−8** (exactly
  the two demotions, every fact in both sentences preserved), PM **+6/−0**, board
  **+2/−1** (the Read-first bullet rewrapped to two lines, original text verbatim).
  Acceptance met: `SYSTEM-FACTS` is now referenced from PROTOCOL.md, PM.md and
  board.md — before the run, from none of them; `node check-hygiene.mjs
  smart-scheduler` → PASS. `find -newermt` proves only 4 files in the whole project
  changed, Porter's own 14-line log entry included. No git run.
  ⚠️ **Procedure note: PM.md's trailing 62 lines were silently normalised LF → CRLF**
  by the editing tool. Zero semantic change (proved by diffing with CR stripped),
  but a raw `diff` reads it as 52 added / 39 removed — i.e. as a rewrite. On this
  repo **a raw diff line-count is not evidence**; strip CR before judging a
  subagent's "additive only" claim, the same way the 08-30 run taught us not to
  take "no status changed" at face value.
  🔴 **Defect found in Marie's own `check-hygiene.mjs` — queued for ORDER 4.** The
  "today's log" rule computes the date as `new Date().toISOString().slice(0,10)`,
  which is **UTC**. On this machine (SEAST = UTC+7) that means between 00:00 and
  07:00 local the gate checks **yesterday's** log: at the time of this run it
  reported `log/2026-09-03.md` (82.6KB) as "today's" and never opened
  `log/2026-09-04.md` at all. The one project that has misfiled its log by date
  four times in five days is guarded by a gate carrying the same bug.
  Noted, not fixed (the project's, not Marie's): Porter timestamped his log entry
  `[--:--]` instead of a real clock time.

- 2026-08-31 — smart-scheduler SPLIT done via spawned PM (Porter), owner's go,
  Porter's interactive session closed first. board.md **41,754 → 25,937 B**
  (40.8KB → 25.3KB), gate **FAIL → PASS**, ~15KB headroom. New
  `archive/board-closed.md` (17,094 B) holds the 190 swept rows; verbatim
  pre-run copy at `archive/board-2026-08-31-pre-split.md` (41,754 B, size-verified).
  Row accounting: Requirements 66 = 44 live + 22 swept · Tasks 206 = 38 + 168.
  Marie's independent verification: the diff pre-split→new board is **190 deletions
  and 4 additions** (the two pointer lines + blanks) — no surviving row reworded,
  re-ordered or re-statused; **all 190 swept rows found verbatim** in board-closed.md
  (0 missing); 269 distinct ids before = 269 after, none lost or invented.
  Ids in both files: `REQ-065` (the known stray duplicate row, left as found) and
  `TASK-064` — the latter is NOT a duplicate: its Tasks row was swept while its
  entry in the separate **Blocked / waiting** table stayed. Which surfaces a real
  contradiction for the project to settle: **TASK-064 is DONE in the Tasks table
  and still listed as blocked** in Blocked/waiting. Not Marie's to fix; reported.
  Porter refused to sweep 8 rows carrying a QUALIFIED closed status (`DELIVERED
  (+1 fix pending)`, `WAVE 1 DELIVERED`, `BE DONE`, `code DONE`, `code-complete
  DONE`, `Part A DONE; B.1 cut`). That judgment is correct and better than the
  v2 regex, which still counts REQ-015 as closed — 1 row, far under the WARN
  threshold of 10, so no tuning needed. **Open follow-up:** Blocked/waiting is a
  third table (34 rows) that no size or closed-row rule covers; it will accumulate.
  Log date fixed: `log/2026-08-31.md` created and used; `log/2026-08-30.md`
  untouched (append-only).

- 2026-08-31 — `check-hygiene.mjs` v2: new **closed-rows rule** (owner's go).
  A board row whose Status starts with DONE / DELIVERED / CODE ACCEPTED belongs
  in `archive/board-closed.md`, not on the live board. WARN over 10 rows; FAIL
  over 30 **only when the board is also past 60% of the size gate** — deliberately
  proportionate, because a rule that reds out a healthy 13KB board teaches people
  to ignore the gate. Thresholds 10/30/60% are Marie's pick, changeable by the owner.
  Why it exists: smart-scheduler's board was compacted 432KB→39.2KB on 2026-08-30
  by shortening cells, and was back over the 40KB gate 1.5 days later — 191 of its
  272 rows were already closed (39% of the file). Shortening prose treats wording;
  the board's SHAPE was the defect. Closed rows never shrink, so any board that
  keeps them grows monotonically until it fails again.
  Blast radius checked across all 9 projects before and after: no project that was
  PASS became FAIL. Current closed-row load — did-api-center-c# 57 (FAIL, board
  already 59.3KB and dormant since 2026-07-17), DID-046 58, manager-gold 34,
  code-report 26, develyst-ai 16, layout-pattern-app 11 (all WARN).

- 2026-08-30 — portfolio-nichaphon: NEW QA role "Tanya" added (additive workforce
  change designed by Atlas, human-approved) via spawned PM (Porter), verified by
  Marie. Pre-flight: no dispatcher run mid-flight (run -h stopped hop 3/4, ball to
  HUMAN; the QA request was explicitly routed out of dispatcher/PM scope to
  Atlas+Marie). Created `QA.md` (byte-identical to Atlas's draft, diff verified) +
  `tests/.gitkeep` (empty, mirrors requirements/specs/tasks). Five PROTOCOL.md
  edits verified coherent: team-table row, Human↔PM↔Tester chain prose, allowed-pair
  row + routing-violation bullet, TEST verdict statuses (IN_TEST→TEST_PASSED|
  TEST_FAILED, NOT_TESTED; only Tanya sets them), and the final paragraph rewritten
  from "no QA role" to the local-only-Playwright QA paragraph (semantic-preserving,
  production still human-only, human keeps final sign-off). PM.md: `@Tanya` contact +
  verdict/screenshot relay added, other boundaries unchanged. board.md: Team line +
  "no QA role" parenthetical corrected, state-only "## QA / Tests" table added.
  Design constraint held: frontend-only, local-only, NO dev server (differs from
  smart-scheduler's Tanya — not copied), NO DB, production off-limits. Gate:
  `node check-hygiene.mjs portfolio-nichaphon` → PASS (1 WARN: today's log 9 entries
  >20 lines — pre-existing append-only item, logs untouched). No git run. No
  REQ/SPEC/TASK/code/log touched.

- 2026-08-30 — smart-scheduler housekeeping DONE via spawned PM (Porter).
  board.md 432.1KB → 39.2KB (40,103 B), 280 over-long cells → 0, absolute paths
  → `machine.local.md`. Verbatim archive `archive/board-2026-08-29-pre-compaction.md`
  (442,454 B, size re-verified after the correction) + `archive/board-2026-08-29-parked-notes.md`
  (16.8KB — the 2026-08-04→08-28 QA verdict history, which fitted no single file).
  267 REQ/TASK files appended to; `git diff --numstat` proves board.md is the only
  file with deletions (-728), the other 267 are +2,814/-0 pure appends.
  Gate: PASS (3 WARNs — today's log 105.6KB append-only, entries >20 lines, no
  inbox/ = manual mode, unchanged by design). Logs untouched. No git run.
  **DEFECT (Porter's, caught in Marie's verification, corrected):** the
  compaction changed REQ-063's status from in-build (`🔨 SPEC-059 + 4 tasks cut`)
  to `DELIVERED`, synthesising it from Tanya's parked `TEST_PASSED (sid) 08-23` —
  but this project's own rule is TEST_PASSED + post-deploy re-check = DELIVERED,
  and REQ-063 still has TASK-161 (FE) open and four owner assumptions unconfirmed.
  The mistake was resolving a contradiction the order said to REPORT, and then
  omitting it from the report. Restored on the second pass; verified by diffing
  every one of the 267 rows' status against the archive.
  **Procedure lesson: a subagent's "no status changed" claim is not evidence.**
  What caught it was the id/row/status snapshot Marie took BEFORE the run plus a
  diff back to the verbatim archive. Candidate: make this a `check-hygiene.mjs`
  mode instead of a human's diligence (not built — needs the owner's go).
  NOTE (added 2026-08-31): the archive filenames and the 267 "Moved from
  board.md" headings carry the label `2026-08-29`; the run actually happened
  2026-08-30 04:29 (Marie mis-dated it from the newest log file instead of the
  clock). Filenames left as-is; this line is the correction.
  **Open risk:** the board sits 857 bytes under the 40KB gate. Two or three new
  rows will fail hygiene. Trimming further was not ordered and was not done.

- 2026-08-29 — New desk created: `portfolio-nichaphon`, born in **dispatcher
  mode** (owner's instruction). Scaffolded from `layout-pattern-app`'s
  dispatcher-era files, adapted to one repo / one engineer: PROTOCOL (BE row
  and the Sober<->Jason pair removed, "Repo layout & ownership" rewritten for
  `front/`, no-deploy, no-invented-content), SA-Lead (design-system boundary
  replaces the IPC seam), FE (scope = `front/`), PM verbatim from `_templates`.
  Created board.md (state-only), dispatcher-state.md, inbox/{PM,SA,FE}.md and a
  read-only as-built survey in project-docs/. Repo path recorded in
  `machine.local.md` as `portfolio-nichaphon-web`; README project table updated.
  Gate: `node check-hygiene.mjs portfolio-nichaphon` -> PASS.
  Flagged to the owner, untouched: repo-root README is stale (claims a NestJS
  backend that no longer exists) and `SERVER_MAINTENANCE.md` holds live root
  credentials in git.

- 2026-08-30 — `machine.local.md` created on machine KUYDONG (was absent —
  fresh machine, blocking every path-dependent operation). Verified on disk:
  smart-scheduler `H:\scheduler` (+4 repos & the requirement repo),
  layout-pattern-app, manager-gold (back/front), develyst-ai
  (`H:\chipint\develyst-ai`, found by search — owner to confirm).
  code-report / api-linkage2 / DID-046 / did-api-center-c# recorded as
  NOT_ON_THIS_MACHINE. Confirmed git-ignored (.gitignore:151).
  Flagged: smart-scheduler board.md still hard-codes `H:\scheduler` (paths rule
  decayed since 2026-08-25) → remove in its housekeeping run; and
  `H:\layout-pattern-app\app\` is a stale duplicate, not the repo.

- 2026-08-25 — DID-046 migrated to new style via spawned PM: inbox/ created
  (PM/SA/BE/QA), board 41.7→12.8KB state-only (archive verbatim), repo path →
  machine.local.md, DEF-16/17 rows reconciled to log (log wins). Gate: PASS.
  Logs untouched (append-only). Project stays manual-mode until told otherwise.

- 2026-08-25 — Per-machine path mapping rolled out: `machine.local.md`
  (git-ignored) holds all code-repo absolute paths; committed files use
  logical names only (rule in CLAUDE.md "Paths & machines"); stale `H:\`
  paths purged from SESSION-STARTERS; code-report board points at the
  mapping. On a new machine: create `machine.local.md` first.

- 2026-08-25 — code-report full housekeeping DONE via spawned PM: board
  144.8→16.4KB, dispatcher-state 78.5→12.1KB (37→5 runs), REQ-001 76.4→18.5KB
  (Req numbering stable), 3 verbatim archives. Hygiene gate: PASS (3 WARNs —
  append-only log + SA-owned TASK-014, both forward-discipline items).
- 2026-08-25 — Role created; `check-hygiene.mjs` v1 shipped; inbox/ rolled out
  to code-report.
