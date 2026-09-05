# Marie's report — ORDERS 1-5, smart-scheduler (2026-09-04)

**For:** the owner, to hand to Atlas.
**From:** Marie (Workflow Operations Steward). Operations log entries: `MARIE.md`.
**Status — ALL FIVE ORDERS COMPLETE (2026-09-04).**
ORDER 1 ✅ · ORDER 2 ✅ · ORDER 3 ✅ (extracted · parked verbatim · **merged**) ·
ORDER 4 ✅ `check-hygiene.mjs` v3 · ORDER 5 ✅ (identity block · attribution fix · curated merge ·
contradictions file).

**§2 below is CLOSED** — the owner ruled on it on 2026-09-04 and the ruling is now written into
`OWNER-LIST.md` and `SYSTEM-FACTS.md`; see §10 for the ruling and what it cost. **§3's contradictions
are now a worklist, not a finding**: all 45 of them live in
`smart-scheduler/ai-worker/SYSTEM-FACTS-CONTRADICTIONS.md`, unanswered by design, for the owner to
settle one at a time.

**Where things stand:** `SYSTEM-FACTS.md` **13,510 → 45,207 B** · contradictions file **85,752 B,
45 open questions** · raw 506 KB extraction still parked intact in
`ai-worker/archive/archaeology-2026-09-04/`. **The only outstanding work is the owner's own** — the
45 questions, and the three live security items in §5.

---

## 1. What actually happened, with the evidence

### ORDER 1 — the Knowledge tier is wired into the startup path

Done via smart-scheduler's spawned PM (Porter). Owner confirmed his Porter session was closed
first — it had written `PM.md` at 00:24, eight minutes before the run.

- PROTOCOL "Session startup ritual": **new step 1 = read `SYSTEM-FACTS.md` + `OWNER-LIST.md`**
  ("never re-derive these from logs"); new step 4 = read `inbox/<YOUR-ROLE>.md`; the most recent
  previous log **demoted from mandatory to on-demand** (today's log stays mandatory; same demotion
  in "Date discipline" item 5; the write-only-to-TODAY rule untouched).
- `PM.md` names SYSTEM-FACTS as Porter's own file, carrying that file's own header rule.
- `board.md` "Read first" now leads with SYSTEM-FACTS.

**Verified by Marie**, not taken on trust: byte+md5 baseline of all three files taken BEFORE the run,
diffed after. Content-only diff = PROTOCOL **+14/-8** (exactly the two demotions, every fact in both
sentences preserved), PM **+6/-0**, board **+2/-1** (bullet rewrapped, original text verbatim).
`grep` now finds `SYSTEM-FACTS` in PROTOCOL.md, PM.md and board.md — before the run, in none of them.
Gate PASS. `find -newermt` proves only 4 files changed in the whole project.

> **Procedure note for Atlas:** the editing tool silently normalised PM.md's trailing 62 lines
> LF → CRLF. Zero semantic change, but a raw `diff` reads it as **52 added / 39 removed** — i.e. as a
> rewrite. **On this repo a raw diff line-count is not evidence.** Strip CR before judging a
> subagent's "additive only" claim, the same way 2026-08-30 taught us not to trust "no status changed".

### ORDER 2 — `inbox/` exists

`ai-worker/inbox/{PM,SA,BE,FE,QA}.md`, five files, **201 B each, seeded empty**. `cmp` proves
PM/SA/BE/FE are **byte-identical** to code-report's; QA differs from code-report's PM.md by
**exactly 2 bytes** (`PM`→`QA`). The standing `no inbox/ directory` WARN is gone.

Nothing was backfilled, per Atlas's instruction. Porter named the live items so they are not lost:
`@Tanya` LINE-link state on `sid` · `@Tanya` Q24 role mix-up · `@Sober` whether day-end also skips
`OTHER` when auto-attending (**this one lives in `SYSTEM-FACTS.md` marked ⚠️ open, not in any log, so
the archaeology sweep would never have found it**) · `@Owner` 08:15 AC-17 and backoffice read access for QA.

> **Procedure note:** the inbox template is CRLF with a UTF-8 em-dash and a trailing blank line.
> Git-Bash `sed -i` silently strips the CR and yields 196 B instead of 201 B. Copy the bytes; never
> stream-edit them. Relevant when the remaining projects get an inbox.

### ORDER 3 — the archaeology run

| | |
|---|---|
| Log files read | **30 / 30, in full** — 3.28 MB (Atlas measured 28 files / 3.07 MB on 09-02; two days were added since) |
| Workers | 13 parallel throwaway subagents, high-effort model, grouped ~200-400 KB each |
| Output | **30 scratch files, 506 KB, ~1,819 fact bullets** |
| Contradictions | **~247 lines across 25 files — every one reported, none resolved** |
| `SYSTEM-FACTS.md` | md5 **unchanged** (`0aea9f8b…`) |
| Project files written | **zero** (`find -newermt` confirms) |

**Deviation from the order, deliberate, and Marie's call:** Atlas wrote "it may write exactly ONE
file: `SYSTEM-FACTS.md`". Thirteen agents appending to one file concurrently would lose writes. Each
worker instead wrote its own scratch file **outside the repo**, so project writes were zero rather
than thirteen — closer to the charter ("everything inside a project happens via that project's
spawned PM"), not further from it. The intent of the order is unchanged.

**Yield was 20× Atlas's estimate** (15-25 KB expected, 506 KB produced). The reason is in §4: the
founding weeks contain an entire business model that was never written down anywhere else.

---

## 2. ✅ The identity question — CLOSED (kept as the record of how it was found)

**Four of thirteen workers independently stopped on the same question**, without any contact between them.

- July logs call the decision-maker **"the stakeholder" / "คุณฟีน"**, using feminine pronouns.
- August onward calls them **"the owner"**, masculine, with **"the customer" / คุณปุ้ม** a separate party.
- Every founding-era fact was therefore tagged `stakeholder (คุณฟีน)` rather than `owner`, pending a ruling.

> **✅ CLOSED 2026-09-04 — and the final ruling is NOT what this section first recorded.**
> Marie's first note here said only *"คุณฟีน is the CUSTOMER"*, which left the three objections below
> unanswered. The owner's full ruling resolves them: **คุณฟีน and คุณปุ้ม are the customer, but every
> one of those names appearing in a log is the OWNER (โด่ง) speaking**, because he is the only person
> who has ever talked to this team. One voice, several names. See **§10.1**.
> That is why the objections below are not objections at all — they were the evidence for the ruling.

**The three things that did not fit the first reading — and that the final ruling explains:**

1. In the 2026-08-01 log, คุณฟีน **refers to "ลูกค้า" as a third party** — which reads as คุณฟีน *not*
   being the customer.
2. In July, คุณฟีน personally **deploys to the production box, runs `migrate:bo`, runs acceptance,
   sets priority, and links their own LINE account.** Those are owner/operator actions.
3. In the 2026-07-29 log, "คุณฟีน" and "the stakeholder" are used **interchangeably** — Porter relays
   *to the stakeholder* and the answers come back attributed to *คุณฟีน*.

**Marie's original warning here — that a mechanical re-label would mis-file ~1,800 lines in the
opposite direction, turning owner decisions into customer requirements bound for REQ files — is what
the full ruling made unnecessary.** Because the voice in every log is the owner's, those lines are
owner-stated and **belong exactly where they went: in `SYSTEM-FACTS.md`.** Nothing was moved to REQ
files, and nothing needed to be.

**What the ruling does change is weaker and more important than a re-label:** it means no line in this
repo can be read as customer sign-off. Hence the sentence now standing in both `OWNER-LIST.md` and
`SYSTEM-FACTS.md` — *no requirement is customer-validated unless it explicitly says so.*

⇒ **Settled by the owner on 2026-09-04 and written into `OWNER-LIST.md` + `SYSTEM-FACTS.md`.** The
mass rename it might have implied was explicitly NOT done — see §10.1.

---

## 3. Contradictions against `SYSTEM-FACTS.md` itself — now a worklist, see §10.3

The file created to stop re-derivation is itself contradicted by the history. These are the ones that
change what someone would DO. All are reported, none resolved.

### 3.1 What does `end-of-day` do to an unmarked booking? — opposite verbs, same code file

- **2026-08-23**, Porter reading the source: *"`end-of-day` is not a report. It WRITES. It flips today's
  `CONFIRMED` bookings whose end time has passed to **`NO_SHOW`** and increments `used_sessions` /
  `used_hours` (`jobs.service.ts:47-61`)"* — restated the same day as *"the job writes `NO_SHOW`, which
  records fifteen children who attended as absent."*
- **2026-08-30 / 08-31**, Porter relaying the owner and Sober grounding REQ-078: *"day-end **auto-attends**
  it like everything else"*, *"the day-end engine has no booking-type condition (`jobs.service.ts:42-72`)"*.
- **`SYSTEM-FACTS.md` today carries only the second.**

Eight days apart, same file, same job, opposite behaviour. Load-bearing on both sides.

### 3.2 The 18:30 day-end — the schedule is solid, the attribution is not

`SYSTEM-FACTS.md` line 27: `end-of-day | 🔴 18:30 | **The OWNER changed it himself**, 2026-08-29 (was 23:30
until 08-28)`, and line 29: *"DELIBERATE and CORRECT. It is not a defect and must never be reported as one."*

**Marie's own grep, not a subagent's claim:**

| Check | Result |
|---|---|
| `18:30` in `log/2026-08-29.md` | **0 occurrences.** Also 0 for `end-of-day`, `endOfDay`, `sm-end` |
| `23:30` in `log/2026-08-29.md` | **2** — the owner's REQ-005 answers, *"unmarked ⇒ auto-attend at 23:30"* |
| `18:30` anywhere in `log/` | only `07-20` (2), `09-02` (14), `09-04` (1) |
| Did the schedule change? | **YES, hard evidence:** `job_runs` shows `08-19→08-28 = 23:30:02` nightly, then `08-29, 08-30, 08-31, 09-01 = 18:30:02` |
| "The OWNER changed it himself" | found **only as Porter's assertion in the 09-02 log**, written after he had just been wrong about the same job. No quoted words from the owner. The cited date (08-29) contains nothing. |

⇒ **The time is right; the provenance is weak.** The most emphatically flagged line in the file — the one
that forbids anyone from ever reporting this as a defect — rests on an inference by the person who had
just mis-reported it, not on the owner's own words. Worth one sentence from the owner to make it solid.

### 3.3 `sid` is not an isolatable LINE test box

`SYSTEM-FACTS.md`: *"2 real teachers are linked on `uat`… The owner is linked on `sid` as teacher `Bank`
— the isolatable test recipient. **Only ONE recipient is linked.**"*

The logs say otherwise, three times, from three different workers:
- **09-02**, QA reading the `LINE links` screen: *"two linked accounts on `sid`, both TEACHERS — `Bank`
  (the owner) and **`Haris`**"*.
- **09-03**: *"Never message `Haris` (**a real teacher linked on `sid`**)"*; then at 23:4x a **third**
  account, `support08 Dong`, followed the OA and linked as a parent.
- **09-04**: the `Bank` account **became a parent overnight**; a second account now holds `Bank`. The
  SYSTEM-FACTS line is stale as written, and **the replacement state was never read back**.

⇒ Rehearsal traffic from `sid` can reach a real teacher. **The team is operating on the safe version of
this fact.** Whichever side is right, the risk points the same way.

### 3.4 `month-reset` and `job_runs` — flagged twice, independently

`SYSTEM-FACTS.md`: `month-reset | 00:05 | job_runs, observed 09-01`. Against it, **08-23** Porter:
*"`month-reset` writes NO `job_runs` row. It has no audit trail at all — the 08-01 instrumentation fix
skipped it and nobody noticed for three weeks"*; **08-24** and **08-28** repeat it, the latter as
*"a job we cannot prove ran is a job we do not have."* No log records a fix landing in between.

### 3.5 Smaller ones, same class

- **2FA** — SYSTEM-FACTS: *"one `app_settings` switch away."* Log 09-02, same day: *"it cannot usefully be
  switched on until the owner answers how the six digits reach the parent. **There is no SMS in this
  system**, and sending the code into the LINE chat being verified verifies nothing."*
- **Flows and buttons** — SYSTEM-FACTS: *"Flows are started by TYPED KEYWORDS, not buttons."* Log 09-02 at
  23:38: *"quick-reply buttons… so flows CAN be started by a button."* And the deeper history: on
  **07-29** the owner's own acceptance checklist regression-tested *"old typed keywords still work"* —
  so REQ-079's *"a typed keyword never starts a flow"* is a **reversal of behaviour the owner accepted**,
  not a gap in a new feature.
- **Rich menus** — SYSTEM-FACTS 09-02: *"they do not exist yet."* Log 08-16: eight named rich menus on the
  customer OA, four adopted, tapped by the owner in both roles and both languages.
- **"QA cannot test LINE", dated 09-03 in SYSTEM-FACTS** — stated plainly on **08-01** (Tanya's first day,
  and the owner caught it), again **08-02**, **08-11**, **08-16** and **08-22**. It was written down once
  and lost, five times over. *This is precisely the failure the file exists to prevent, happening to the
  file's own content.*
- **The 5-per-parent cap** — SYSTEM-FACTS (09-02): *"It appears in NO requirement, spec or task in this
  repo — Porter searched."* But `MAX_STUDENTS_PER_PARENT === 5` was **in the code and under test on
  2026-08-01**, Sober relied on it in the TASK-150 review on **08-17**, and Jason's importer named it on
  **08-19** — five weeks before the owner was made to re-explain his own limit. There is also a unit
  mismatch: SYSTEM-FACTS says *per phone number*, the logs say *per parent*.

---

## 4. What the history contained that no file anywhere records

The founding weeks decided the **entire money model**, and **none of it is in `SYSTEM-FACTS.md`**:
per-booking-type revenue recognition · day-end = revenue only · the freelance cap counting from booking
time · freelance as the only dynamic expense · effective-dated FT/PT salary with frozen past months ·
the locked CONSUMING/RELEASING drawdown state machine · the explicit refusal of an approval system ·
"everything is an item with a free-choice unit" · badges never carrying money.

Also newly dated and attributed, none of it previously written down: the **LINE outbox worker runs every
15 s** (absent from the schedules table) · **LINE leave is TODAY-ONLY and only sees `CONFIRMED` bookings** ·
**the product has almost no DELETE at all** — exactly two endpoints; students, parents, courses, vouchers,
bookings and posted `bo.movement` rows cannot be removed, far broader than the existing student-delete
line · **one shared staff login, so `actor` is null on every history event — the product cannot attribute
an action to a person**, and the owner accepted a history without it · **`db:migrate` can exit 0 and print
success while the schema stays broken** (two outages, 08-03 and 08-24; `db:verify` is the only proof) ·
**`sid` is a shared 8-project box with 16 pm2 processes** · **the owner switches boxes by editing `.env`,
so you cannot tell from a command which box ran** · **frontoffice is laptop+PC only**.

**And the environment naming, which `SYSTEM-FACTS.md` has a whole section for and yet carries no hostname:**

| Date | The second box is called | Source |
|---|---|---|
| 2026-07-30 | **`production`** → `frontoffice.develyst.online` | owner |
| 2026-08-01 | "PRODUCTION — never touch it, not even a GET". The string `uat` does not appear once in 4,684 lines | log |
| 2026-08-16 | **`uat`** = `frontoffice.develyst.online` + `backoffice.develyst.online`; `sid` = `som.develyst.online` + `backoffice-som.develyst.online`; **"prod" is not an environment and "customer-prod" was always `uat`** | **owner, verbatim** |
| 2026-09-02 | `uat`, no hostname | SYSTEM-FACTS |

The same box was renamed `production` → `uat` in early August and **the rename is recorded nowhere**. This
matters operationally: one file says pushes from `sid` reach people linked on `uat`; another says never
touch that box at all.

---

## 5. 🔴 Operational items — still open, and none of them Marie's to fix

1. **Real customer data is committed and pushed.** A `.dump` with names, phone numbers and LINE userIds of
   real children — commit `0b8966c`, on `origin/dong`. The owner parked it by explicit decision, but **the
   cause is unfixed**: `backup.ts` writes into the repo working tree, so it can recur.
2. **`sid` LINE test-safety is wrong in the file people read** (§3.3). A real teacher is linked there.
3. **A possible real clock fault on the owner's machine** (log 08-20): the file says 08-20, the owner
   corrected to 08-22, the filesystem stamp says 08-22, and the owner's Windows clock read **8/19**. Porter
   raised that it could affect **the check-in window, the leave cut-off and the 08:00 digest** — and
   **nobody ever answered him.**
4. **`pg_hba` was left temporarily open** on the production box to a dynamic laptop IP by explicit owner
   choice on 2026-08-11, still open at end of day. **No log records it being closed.** A stale "it's open"
   and a stale "it's closed" are equally dangerous.
5. **The security posture on phone-keyed lookup reversed 180° with no recorded reason.** On **07-31** it was
   BE priority #1 — *"a live disclosure and it's cheap"* — closed the same day. By **09-02** the same
   exposure class is *"a decision taken with the risk on the table, not an oversight."* Both may be
   correct; nothing records when or why the posture changed.
6. **Mute duration is double what the PM believes** — Porter: ~30 minutes; Jason measured and Sober
   endorsed: **mute 60 min, TTL 30 min**. A PC parent sits in silence twice as long as the team thinks.
7. **The `sm-jobs` secret is committed to git in plaintext** (Porter, 2026-08-29/08-30). Surfaced late,
   during ORDER 5's curation pass. It joins items 1 and 4 to make **three** live secret/data exposures
   found by this run, none of them fixed: a customer-data `.dump` pushed to `origin/dong` whose cause
   still writes into the repo working tree · a `pg_hba` opened to a laptop IP that no log records
   closing · and this. **None is Marie's to fix.** They are listed here so they stop being rediscovered.

---

## 6. The date-integrity problem — three of the largest logs cover multiple days

This is the workflow finding, and it is Atlas's territory.

| File | Actually covers | Evidence |
|---|---|---|
| `2026-07-20.md` (182 KB) | ~07-20 → 07-25 | its own header; wraps past midnight ~5×; **entries are not in append order** — the newest block is at the top and `[00:00] Project initialized` sits at line 492 |
| `2026-08-04.md` (175 KB) | 08-04 → 08-10 | Tanya: *"this machine's clock reads 2026-08-10 while today's log file is `2026-08-04.md`"*; Porter: *"the machine clock is AUTHORITATIVE… I'm not renaming this file mid-flight"* |
| `2026-08-20.md` (50 KB) | 08-20 or 08-22 | owner corrected to 08-22; FS stamp 08-22; owner's clock read 8/19 (see §5.3) |

⇒ **Every date tag extracted from those three files is approximate.** The workers banner-flagged them.
And the project has now misfiled its log by date **four times in five days** — the fourth time *after*
running the date check and ignoring its answer.

**Which is why §7's tooling defect matters.**

---

## 7. ORDER 4 — ✅ SHIPPED as `check-hygiene.mjs` v3 (2026-09-04)

> **Atlas approved all of it and released it to run ahead of §2.** He corrected two things, both
> improvements on Marie's draft: *(a)* "is this project active?" must come from the **log filenames**,
> not mtime — the owner moves between machines and a fresh checkout stamps every file with the
> checkout time, which would make a dormant project look active; *(b)* a **new rule 6** — today's log
> missing while a log dated within 3 days exists ⇒ WARN, because until now a missing file scored
> size 0 and passed silently, which is exactly how four date misfiles in five days went unnoticed
> **by the gate built to notice them**.
>
> **Verified in 8 sandbox cases outside the repo**, all as specified, including both boundaries
> (5 days ⇒ silent, 3 days ⇒ WARN) and a **659 KB** knowledge file proving the size exemption.
>
> **Blast radius:** knowledge-file WARN on **8 of 9** projects (smart-scheduler clean).
> **Marie's "0 new FAILs" estimate was wrong by one** — `layout-pattern-app` gains an inbox FAIL at
> 12 days idle, inside the agreed 14-day window; its overall verdict is unchanged (already FAIL on
> four other counts) and the threshold was **not** tuned away to hide it. One PASS/FAIL flip on
> `portfolio-nichaphon` was investigated and **cleared** — the saved v2 binary returns the same
> result at the same moment, so another session caused it, not this change.

The original diagnosis follows, kept because it is the reason the fix exists.

🔴 **`check-hygiene.mjs` computes "today" in UTC**: `new Date().toISOString().slice(0,10)`. On this machine
(SEAST, UTC+7) that means **between 00:00 and 07:00 local the gate checks YESTERDAY's log.** During the
ORDER 1 run it reported `log/2026-09-03.md` (82.6 KB) as "today's log" and **never opened
`log/2026-09-04.md` at all.**

**The one project that has misfiled its log by date four times in five days is guarded by a gate carrying
the same class of bug.** Fixing this is the highest-value line in ORDER 4.

**Blast-radius survey for the rest of ORDER 4, run across all 9 projects:**

| | |
|---|---|
| Projects with a Knowledge file | **1 of 9** — smart-scheduler only |
| Referenced from PROTOCOL.md | 1 of 1 (as of ORDER 1) |
| Projects with `inbox/` | 4 of 9 — code-report, DID-046, portfolio-nichaphon, smart-scheduler |
| Largest log per project | did-api-center-c# 422 KB · smart-scheduler 389 KB · DID-046 298 KB · code-report 145 KB · api-linkage2 117 KB |

**Marie's proposed thresholds, for the owner's go:**

1. **Knowledge file** — absent ⇒ WARN; **present but not referenced from PROTOCOL.md ⇒ FAIL** (an
   unreachable memory file is worse than none: it looks solved). Effect: **8 new WARNs, 0 new FAILs.**
2. **`inbox/`** — keep the WARN; **raise to FAIL only when the team is active**, defined machine-checkably
   as *a log file modified within the last 14 days*. Dormant projects (did-api-center-c#, untouched since
   07-17) are not red-lined for a workflow they are not running.
3. **Today's log** — keep the 40 KB WARN, add an escalated 🔴 WARN at **100 KB** (09-01 hit 202 KB).
   **Stays a WARN, never a FAIL:** logs are append-only, so a FAIL would be unfixable by design.
4. **Exempt `SYSTEM-FACTS.md` by name from every size rule.** Never compacted, ever.
5. **Fix the UTC date bug.**

---

## 8. What Marie recommends for the 506 KB

Not executed — the owner asked for this report instead, and §2 blocks it regardless.

1. **Settle §2 first.** It decides whether ~1,800 lines are owner decisions (→ SYSTEM-FACTS) or customer
   requirements (→ REQ files). Nothing should merge before it.
2. **Curate, don't dump.** `SYSTEM-FACTS.md` earns its keep by being read at every session start; a 500 KB
   file would be read by nobody and would reproduce the exact failure it was created to fix. Target
   **~30-40 KB**, organised on the existing sections plus the ones the workers had to invent because
   nothing fitted: *What `end-of-day` actually does* · *Where money posts* · *The customer's price card* ·
   *QA — what Tanya can and cannot do* · *Platform / migration behaviour* · *Deploy discipline*.
3. **Park the full 506 KB verbatim** under `ai-worker/archive/`. Marie never deletes information; the raw
   extraction stays greppable, with every fact carrying who said it and when.
4. **Give the ~247 contradiction lines their own file**, settled by the owner one at a time. **No agent
   resolves any of them** — that is the 2026-08-30 REQ-063 defect, and this run was the ideal shape for
   repeating it. It did not.
5. Execute the merge **through the spawned PM**, as ORDERS 1 and 2 were, with a byte baseline taken first.

---

## 9. What Marie did not do

No project file was written by Marie's own hands. No REQ, SPEC, TASK, TEST, board row or status was
touched by anyone in these three orders. No SQL, no real environment. **No git — nothing staged,
committed or pushed.** No contradiction was resolved. `SYSTEM-FACTS.md` is byte-identical to what it was
before the archaeology run.

**Raw extraction is parked and safe.** On the owner's go it was copied verbatim to
`ai-worker/archive/archaeology-2026-09-04/` — 30 files, 518,161 B, plus a README stating the blocker
in the file itself. Copied with a single globbed `cp -p`; **md5-verified 30/30 against the baseline
Marie took before the copy**, not against the copier's own hashes.

### One correction to a cross-check, worth carrying into the review

Porter reported that the คุณฟีน attribution appears in **both** `SYSTEM-FACTS.md` and `PROTOCOL.md`.
`grep` says **`PROTOCOL.md:229` only** — `### 🟢 Stakeholder policy — DON'T guess to spare the human;
ask (คุณฟีน, 2026-08-03)`. SYSTEM-FACTS does not mention คุณฟีน at all.

The finding survives the correction and sharpens §2: **a standing rule that every role reads at every
session start is credited to the person the owner has now ruled is the CUSTOMER.** The identity
question is therefore not confined to the parked extraction — it is already inside the live protocol.
Marie changed nothing; re-attributing a PROTOCOL rule is not hers to decide.

---

## 10. ORDER 5 — the identity ruling, and what landed (added 2026-09-04, after Atlas released it)

### 10.1 The ruling that closed §2

**The owner is โด่ง (develyst), and he is the only person who has ever talked to this team.** In the
logs, **"คุณฟีน", "คุณปุ้ม", "the stakeholder" and "the owner" are all him** — one voice, named loosely
across July and August. The real **คุณฟีน and คุณปุ้ม are the CUSTOMER, and have never spoken to an
agent.** That is why four independent archaeology workers all stopped on the same question: they were
seeing one person's voice under several names, and correctly refused to guess.

⇒ **No requirement in this repo is customer-validated unless it explicitly says so.** When a log says
"คุณฟีน wants X", that is the owner relaying. It is not evidence the customer saw, approved, or was
even asked about X.

Written into **both** `OWNER-LIST.md` and `SYSTEM-FACTS.md`, high, above the first content section.
`PROTOCOL.md:229`'s standing policy re-credited from `(คุณฟีน, 2026-08-03)` to `(owner โด่ง, 2026-08-03)`,
rule text untouched.

**The mass rename was explicitly NOT done.** A read-only survey found **114 `.md` files** still carrying
the old names — not the ~79 estimated — across REQs, SPECs, TASKs, logs, the board and the archive.
**None was opened for edit.** The fix sits at the point of reading, and it reaches every role because
ORDER 1 had already put `SYSTEM-FACTS.md` + `OWNER-LIST.md` at **step 1** of the startup ritual.

### 10.2 The ceiling the owner raised, using his own rule

The 30-40 KB target in §8 was Marie's estimate. At that size the seven curation workers were cutting
**57 named high-value facts** — disproportionately the founding money model. One worker then surfaced
the owner's own instruction of 2026-09-02: *write everything down; **if a rule or a file-length limit
is in the way, tell HIM** and he takes it to Atlas and Marie* — an instruction `SYSTEM-FACTS.md` had
been paraphrasing **without its escalation path**.

So Marie told him. He raised the ceiling to ~45 KB and ordered **all 57 bought back**. Every one
landed. The rule that rescued them is now in the file verbatim, escalation path included.

**This is the run's clearest lesson about itself:** the file existed to stop knowledge being lost, and
was quietly losing knowledge to its own size limit until the rule it had failed to record in full was
dug back out of the logs.

### 10.3 What is on disk now

| | |
|---|---|
| `SYSTEM-FACTS.md` | **13,510 → 45,207 B** · 19 sections, none duplicated |
| `SYSTEM-FACTS-CONTRADICTIONS.md` | **85,752 B** · **45 open questions, C-01…C-45, all unanswered** |
| `archive/archaeology-2026-09-04/` | the raw 506 KB, untouched |
| `⚠️ CONTESTED` markers in the facts file | **14**, each pointing at the contradictions file |

**No fact was lost, and this was proved rather than asserted.** Of the 34 bullets in the pre-merge
file, **32 survive verbatim**. The 2 that do not are exactly the 2 the corrections deliberately
**widened**: the student-delete line became the whole no-delete-anywhere rule (the new line says so
itself — *"This supersedes the earlier student-only line, which was too narrow"*), and the
`C:\sm-jobs\*.ps1` line became *"EVERY per-database script is per-box"*, which also removed the last
machine-local absolute path from the file.

The contradictions file was verified as a **byte-identical copy** (md5 `17c3b069…`), not a
rewrite — 85 KB of carefully-quoted evidence is exactly the kind of thing an LLM should never retype.

### 10.4 The sharpest single correction

`SYSTEM-FACTS.md` dated *"QA cannot test LINE"* to **2026-09-03**. It is now dated **2026-08-01 —
Tanya's first day — restated 08-02, 08-11, 08-16 and 08-22**, with a line recording that **owner โด่ง
caught it, not QA**. The knowledge file built to stop the team re-deriving facts had itself lost that
one **five times**.

### 10.5 Left open, deliberately

- **45 contradictions**, unanswered. No agent may settle one; that rule is written into the file's own
  header, with the 2026-08-30 REQ-063 defect cited as the reason.
- A **date mismatch inside the QA fact** — the corrections list restatements 08-02/08-11/08-16/08-22,
  the curated bullet says 08-20. Both sit in the file three lines apart, unaltered. Reported, not settled.
- **A format tension for Atlas:** `SYSTEM-FACTS.md`'s header still declares the file *"one fact, one
  line… append-only"*, while it now opens with two multi-paragraph blocks (WHO IS WHO, and the
  conventions line). Placement was explicitly ordered; the deviation is real and is his to rule on.
