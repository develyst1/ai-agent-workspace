# TASK-053: scheduling (BE) — attention-check registry + 08:00 digest job + `GET /api/attention`
- Source: SPEC-018 (REQ-023)
- Status: DONE  (re-reviewed 2026-08-01 by Sober — all 3 rework items verified in code: ordering query, registry-driven payload privacy, `titleKey` on both branches; tsc 0 / suite 221/0) — deploy: redeploy :4006 + **register the 08:00 Windows task**
- Depends on: none (verified — all fields exist today)
- Assignee: @Jason (smart-scheduler-back, port 4006)

## What to do
Once a day at 08:00 the system checks what needs attention and sends admins **one** LINE message. The same
results back a web panel (Fern's TASK-054), so **there must be exactly one producer of the answer**.

### 1. `lib/attention.ts` — the registry (this is the extensibility, don't build more than this)
An array of checks, each `{ key, title, run(ctx) => { count, items: Array<{ id, label, hint? }> } }`.
Adding a check later = **appending one entry**. No plugin system, no dynamic loading, no config table.
Thresholds go in **one named-constant block at the top**: `EXPIRING_WITHIN_DAYS = 14`,
`NEARLY_FINISHED_SESSIONS = 2`, `FREELANCE_NEAR_CAP_HOURS = 2` (pending คุณฟีน's real numbers — that's why
they're constants in one place).

**The seven checks** (all computable from existing data — I verified the schema myself):

| key | Condition |
|-----|-----------|
| `unconfirmed_bookings` | `status = 'PENDING'` on **today or tomorrow** (Bangkok) |
| `teachers_without_line` | `line_user_id IS NULL` AND `active` AND NOT `archived` |
| `expiring_entitlements` | courses/vouchers still active but expiring within `EXPIRING_WITHIN_DAYS` |
| `nearly_finished_courses` | active course with `remainingSessions <= NEARLY_FINISHED_SESSIONS` |
| `freelance_near_cap` | FREELANCE teacher whose ceiling `remaining <= FREELANCE_NEAR_CAP_HOURS` (incl. negative) |
| `incomplete_students` | student missing **any** of `gender` / `birth_date` / `nationality`, **or** whose parent has no `province` |
| `yesterday_no_shows` | `status = 'NO_SHOW'` on the previous day |

> **⚠️ Reuse, don't re-derive.** "Still active" for checks 3–4 **must** come from **`lib/eligibility.ts`**
> (`courseEligible` / `voucherEligible`, your TASK-051), and check 5 **must** read the same freelance
> `remaining` the calendar's `overLimit` uses. A second copy of "active" or "over cap" is the exact drift
> we designed TASK-051 to prevent.
>
> **⚠️ `incomplete_students` must LEFT-join the parent.** A student with **no parent** (walk-in / First-Trial —
> `students.parent_id` is nullable **by design**) must not vanish from the count via an inner join. Same
> failure mode as the badge report. If you'd rather count "missing province" only for students who *have* a
> parent, that's fine — say so in your notes; what's not fine is silently dropping parentless students.

### 2. `services/attention.service.ts` — `runAttentionChecks()`
The **only** producer. Runs every registered check and returns `{ checks: [{ key, title, count, items }] }`.
**One failing check must not kill the digest** — catch per check and return it as a degraded entry
(`count: null` + an error label); the other six still send. A digest that dies because one query broke is
worse than a partial one.

### 3. `POST /internal/jobs/daily-digest` (in `routes/internal.ts`)
Same `internalSecretError` gate as the existing jobs, optional `{ date }` body like `end-of-day`:
1. `runAttentionChecks()`.
2. **Idempotent:** if `job_runs` already has `('daily-digest', runDate)` with `summary.sent = true`, return
   `{ skipped: "already-sent" }` and **send nothing**. (The existing jobs only insert — this one reads first.)
3. **Every check `count = 0` → send nothing**, but **still write the `job_runs` row** with `summary.sent = false`.
4. Otherwise `notifyAdmins(<ONE payload>)` — a single message, **not one per check** — then write the row with
   `summary.sent = true` + the per-check counts.

> **Why step 3's row matters (don't skip it):** the web panel shows *"digest last ran …"*, so **"ran and had
> nothing to say" must be distinguishable from "never ran".** Two scheduled jobs in this project have never
> been registered on the server and nobody noticed for weeks — that indicator is how a third one stops being
> invisible.

### 4. The message + the trigger
- **One LINE message**, TH/EN via the existing `line-i18n`, through `notifyAdmins` (outbox — do not push directly).
- **Privacy (the REQ-020 lesson):** only **two** checks name anyone — `unconfirmed_bookings` (time · student
  **nickname** · teacher nickname) and `teachers_without_line` (teacher nickname). All others are **counts
  only** in LINE; names live behind login in Fern's panel. **Never** a full name, phone, DOB, or a child's name
  in the digest. Truncate any list at **5** with "+N more — see the web app".
- **`GET /api/attention`** (authenticated staff) → `{ checks: [...], lastRun: { runDate, finishedAt, sent } | null }`
  — the same `runAttentionChecks()`, computed live, plus the `job_runs` lookup.
- **`scripts/daily-digest.ts`** — copy the thin-trigger shape of `scripts/end-of-day.ts` (POST + secret +
  exit codes, no DB connection) and add the package script.

**No migration.** `job_runs`, `app_settings.line_admin_user_ids`, the outbox and every field read here already
exist. No change to `POST /bookings`, the freelance cap, the suspend gate, or the two existing jobs.

## Definition of Done
- [ ] All seven checks implemented in the registry; adding an eighth is visibly one array entry.
- [ ] Checks 3–4 use `lib/eligibility.ts` and check 5 uses the existing freelance `remaining` — **no second
      definition** of active/over-cap anywhere in this task.
- [ ] `incomplete_students` counts parentless students correctly (LEFT join, stated behaviour).
- [ ] Job sends **one** message when anything is outstanding; **nothing** when all counts are 0; **writes a
      `job_runs` row either way**; a second run the same day sends nothing (`skipped: "already-sent"`).
- [ ] One failing check degrades to an entry — the other checks still send.
- [ ] `GET /api/attention` returns the same checks plus `lastRun` (null when the job has never run).
- [ ] Digest names people in **only** the two permitted checks; lists truncate at 5.
- [ ] `scripts/daily-digest.ts` + package script; **the exact Windows Task Scheduler command for 08:00 is
      written in your Implementation Notes** so Porter can hand it to the human verbatim.
- [ ] `bunx tsc --noEmit` clean; `bun test` green — pure tests for **each check's predicate** and for the
      **digest decision** (nothing outstanding → no send · already sent → skip · one broken check → still sends).

## Implementation Notes

**Your Question first: nothing was missing.** All seven checks are built from existing fields — your schema
verification held. No new column, no migration.

**1. `lib/attention.ts` — the registry.** Thresholds in **one named-constant block** at the top
(`EXPIRING_WITHIN_DAYS = 14`, `NEARLY_FINISHED_SESSIONS = 2`, `FREELANCE_NEAR_CAP_HOURS = 2`, plus
`DIGEST_LIST_LIMIT = 5`). Each check's condition is a **separate pure predicate** (unit-tested independently of
its query), and `ATTENTION_CHECKS` is a plain array — **adding an eighth check is literally one entry**.
- **Reuse, verified:** checks 3–4 call **`courseEligible` / `voucherEligible`** from `lib/eligibility.ts`
  (TASK-051) for "still active"; check 5 calls **`overLimit`** from `lib/freelance-budget.ts` — the same
  over-cap rule the calendar uses — and reads the same `bo.item.remainingQty` (hours) via a new exported
  `listFreelanceCeilings()` in `scheduler.service.ts`, so there is **one** source, not a copy.
- Titles are **i18n keys** (`att_<key>`), so the API label and the digest label can't drift.

**2. `services/attention.service.ts` — the only producer.** `runAttentionChecks()` runs every registered check
with a shared, **memoised** ctx (several checks share courses/vouchers → one query each). **Per-check
try/catch:** a failure becomes a degraded entry (`count: null` + `error`) and **the other six still report** —
a digest that dies because one query broke is worse than a partial one.

**3. `POST /internal/jobs/daily-digest`** (`routes/internal.ts`, same `internalSecretError` gate + optional
`{ date }` as `end-of-day`). Behaviour is decided by the pure **`decideDigest(checks, alreadySent)`**:
- already sent for that business date → `{ skipped: "already-sent" }`, **sends nothing** (it reads `job_runs`
  first — the existing jobs only insert);
- every count 0 → **sends nothing but still writes the `job_runs` row** with `summary.sent = false`;
- otherwise → **one** `notifyAdmins(...)` payload (never one message per check) then the row with
  `summary.sent = true` + per-check counts + the list of failed checks.
- **A degraded check counts as outstanding** → it sends. Silence would hide a broken check; stated in the code.

**4. Message + privacy.** One LINE message through the **outbox** (`notifyAdmins`, no direct push). The
**checks travel in the payload** and `formatOutboxMessage` renders via `buildDigestMessage(checks, lang)`, so
each admin gets it in **their own** TH/EN. **Only the two permitted checks name anyone**
(`unconfirmed_bookings` → time · student **nickname** · teacher nickname; `teachers_without_line` → nickname);
everything else is a **bare count**, names behind login in Fern's panel. Lists truncate at **5** + "+N more".
No full name, phone, DOB or child's name anywhere in the digest.

**5. `GET /api/attention`** (authenticated) → `{ checks, lastRun }` from the **same** `runAttentionChecks()`
plus the `job_runs` lookup; `lastRun` is `null` when the job has **never** run.

**6. Trigger** — `scripts/daily-digest.ts` copies the thin-trigger shape of `scripts/end-of-day.ts` (POST +
secret + exit codes 1/2, no DB), plus `"job:daily-digest"` in package.json.

### 👉 Windows Task Scheduler — exact command for 08:00 (hand this to the human verbatim)

Build the exe once (in `smart-scheduler-back`):
```
bun build --compile scripts/daily-digest.ts --outfile dist/daily-digest
```
Register the 08:00 daily task (elevated PowerShell/cmd on the server; set the machine env vars
`SCHEDULER_API_URL=http://localhost:4006` and `INTERNAL_JOB_SECRET=<the secret>` first):
```
schtasks /Create /TN "SmartScheduler-DailyDigest" /TR "C:\path\to\smart-scheduler-back\dist\daily-digest.exe" /SC DAILY /ST 08:00 /RL HIGHEST /F
```
Verify immediately (should print `OK:` and, on a clear day, `"sent":false`):
```
schtasks /Run /TN "SmartScheduler-DailyDigest"
```
*(Alternative without building an exe: `/TR "cmd /c cd /d C:\path\to\smart-scheduler-back && bun run job:daily-digest"`.)*
**Deploy otherwise:** just redeploy scheduling-back (:4006) — **no migration, no new env var** beyond the
`INTERNAL_JOB_SECRET` the other jobs already use.

**Verification** (`H:\scheduler\smart-scheduler-back`):
- `bunx tsc --noEmit` → **clean (exit 0)**; `bun test` → **215 pass / 0 fail** (36 files).
- New `lib/attention.test.ts` — **a predicate test per check** (all 7, incl. the boundary cases: expiring
  beyond/at the window, fully-used, archived/inactive teacher, already-negative freelance ceiling), the
  **registry invariants** (7 unique keys; **exactly two** checks may name people), the **digest decision**
  (clear → `record-only` · outstanding → `send` · **broken → still sends** · already sent → `skip`), and the
  **message rules** (clear checks omitted, non-permitted check shows count only with **no name leak**,
  permitted list truncated at 5 with "+N more", degraded check surfaced, EN renders).
- ✅ **Rendered a real digest end-to-end** (7 checks incl. one degraded) and asserted the four behaviours in
  actual output: no name from `incomplete_students`, clear check omitted, list truncated to 5 + "+อีก 2", broken
  check shown as "ตรวจสอบไม่สำเร็จ" — **in both TH and EN**.
- ⚠️ The DB queries, the LINE send and the `job_runs` write are **deploy smoke** (brownfield). **Smoke:** run
  the trigger once → admins get **one** message; run it again the same day → `{"skipped":"already-sent"}` and
  **no second message**; on a day with nothing outstanding → no message but `GET /api/attention` still shows a
  `lastRun` with `sent:false`.

**One note for the reviewer (maintenance, not a defect):** adding `listFreelanceCeilings`/`getCourses`/
`getVouchers` imports to a module `./api` reaches meant the whole-module stub in `api.teacher-routing.test.ts`
had to gain those exports too, or the ESM link fails. That's the standing cost of whole-module mocks here —
worth knowing before adding more of them.

**DoD:** 7 checks in the registry, an 8th is one entry ✓ · checks 3–4 use `lib/eligibility.ts`, check 5 uses the
existing `overLimit`/`remainingQty` — no second definition ✓ · `incomplete_students` LEFT-joins and counts
parentless students (behaviour stated in code + tested) ✓ · one message when outstanding, none when clear,
`job_runs` row **either way**, second run skips ✓ · one failing check degrades, others still send ✓ ·
`GET /api/attention` returns checks + `lastRun` (null when never run) ✓ · digest names people in only the two
permitted checks, truncates at 5 ✓ · trigger script + package script + **the exact Task Scheduler command
above** ✓ · tsc clean + `bun test` green with per-check and decision tests ✓.

**Handoff:** Fern's **TASK-054** is unblocked — `GET /api/attention` →
`{ checks: [{ key, title, count, items }], lastRun: { runDate, finishedAt, sent } | null }`; **`lastRun: null`
is the "never run" warning** the panel must surface.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- If a check turns out to need data that genuinely isn't there, **flag it here and build the other six** —
  don't invent a column. I verified all seven against the schema, so surprise me only with evidence.
- The thresholds are placeholders in a single constant block by design; don't scatter them.

## REWORK applied (2026-08-01, Jason) — all 3 items

**🔴 Item 1 — `getLastDigestRun()` returned the wrong row. Fixed.** You were right, and it's the worst kind of
bug for this feature: the freshness indicator would have frozen on a year-old date *while looking healthy*.
- Extracted **`lastDigestRunQuery()`** with
  `orderBy(desc(jobRuns.runDate), desc(jobRuns.finishedAt)).limit(1)` — newest business date, and on a tie the
  later `finishedAt`, so a `sent:true` re-run supersedes the morning's `sent:false` row. `getLastDigestRun`
  is now `const [last] = await lastDigestRunQuery()` — the 500-row scan and `.at(-1)` are gone.
- **Test (`services/attention.query.test.ts`, 4 cases):** a live "later row wins" assertion needs a DB, so I
  pinned the **contract** instead — the query is rendered with Drizzle's `.toSQL()` and asserted to order by
  `run_date desc` **then** `finished_at desc` (primary key checked by index position), to bind `limit 1`, and to
  stay scoped to `daily-digest`. It fails if anyone drops a `desc`, drops the tie-breaker, or restores a wide
  limit. The live behaviour stays deploy smoke, as flagged.

**🟡 Item 2 — outbox payload no longer carries un-rendered names. Fixed.** The job now builds
`namesAllowed` from the registry's `namesPeopleInDigest` flags and enqueues `items` **only** for those checks
(`[]` for the rest), so the persisted row can't hold a nickname the message would never print. Privacy is now
true at the **data** layer as well as the renderer — exactly your TASK-047 point. Covered by a new test that
asserts the rule (non-permitted → `[]`; the two permitted → items intact).

**🟡 Item 3 — `GET /api/attention` now returns `titleKey` too.** Each check is
`{ key, titleKey, title, count, items }` — `titleKey` for Fern to render **TH+EN** from her own i18n, `title`
kept as the TH default for anything that just wants a string. No second copy of the labels anywhere.

**Nits — for the record:** I left `isFreelanceNearCap`'s `overLimit(r) ||` in place. You're right that it can't
change the result (`<= 0` ⊂ `<= 2`); it stays as an explicit statement that "already over cap" is in scope even
if someone later lowers the threshold to 0 — and, as you said, the reuse that matters is `remainingQty` coming
from the one source. The `studentsWithParent` double-scan and the two-checks-one-course overlap I've left
exactly as you accepted them.

**Re-verified:** `bunx tsc --noEmit` → **clean (exit 0)**; `bun test` → **221 pass / 0 fail** (37 files, up from
215 — +4 query-ordering, +2 payload-privacy). Nothing else in the task was touched.

## Review
**Verdict: REWORK 🔧 (Sober, 2026-08-01) — three scoped items, one round-trip. The design is right and most of
it I'd ship as-is; item 1 is a real bug in the exact mechanism this REQ exists to protect.**

### What's genuinely good (verified in the code, not taken on trust)
- **One producer holds.** `runAttentionChecks()` is called by both `runDailyDigestJob` and `getAttention()` —
  there is no second path. The panel and the digest cannot disagree.
- **Reuse is real where it counts.** Checks 3–4 call `courseEligible`/`voucherEligible` from
  `lib/eligibility.ts`, and check 5's `remainingQty` comes from `listFreelanceCeilings()`, which reads the same
  `bo.item` the booking path draws from. That's the drift TASK-051 was built to prevent, actually prevented.
- **`incomplete_students` LEFT-joins correctly** — parentless walk-in students are kept, and charging "missing
  province" only against students who *have* a parent is the right reading, stated in the code where the next
  person will find it. That was the failure mode I was most worried about and he got it right.
- **A judgment call he made that I hadn't specified, and it's the correct one:** in `decideDigest`, a
  **degraded check counts as outstanding**, so a broken query still sends. Silence would hide the breakage —
  exactly backwards for a feature whose job is to surface problems. Good instinct.
- **Privacy is enforced in the renderer, not by convention:** `buildDigestMessage` looks `namesPeopleInDigest`
  up from the registry, so a non-permitted check physically cannot print its items. And I checked the failure
  path myself — `formatOutboxMessage`'s `default` branch returns a generic i18n string, **not** a JSON dump, so
  even an unrecognised payload cannot spill.
- **Verified myself:** `bunx tsc --noEmit` → **0**; `bun test` → **215 pass / 0 fail** (36 files).

### 🔴 1 — `getLastDigestRun()` returns the WRONG row after ~500 days. Fix this one.
```ts
.orderBy(jobRuns.runDate).limit(500)   // ascending → keeps the OLDEST 500
const last = rows.at(-1);
```
`orderBy` is **ascending**, so `limit(500)` keeps the **oldest** 500 rows and `.at(-1)` returns the
**500th-oldest**. Once the job has ~500 daily rows the panel would permanently display a last-run date from a
year and a half ago **while looking perfectly healthy** — the indicator would lie in precisely the direction it
exists to prevent. A "last ran" widget that silently freezes is worse than none.

There's a **second, immediate** ambiguity in the same query: one `runDate` can legitimately have **two** rows —
a `sent:false` row from a clear 08:00 run, then a `sent:true` row from a later re-run once something came up.
Ordering by `runDate` alone doesn't say which you get.

**Fix:** `orderBy(desc(jobRuns.runDate), desc(jobRuns.finishedAt)).limit(1)` — one row, newest, unambiguous.
Please add a test that a **later** row wins (both orderings).

### 🟡 2 — Don't carry names the message never prints
`notifyAdmins` enqueues `items` for **every** check, so the persisted outbox row holds student nicknames for
`incomplete_students` that `buildDigestMessage` deliberately drops. Nothing leaks today (see the `default`
branch above) — but **TASK-047 leaked precisely because data travelled somewhere it wasn't needed**. Make the
rule true at the data layer as well as the render layer: enqueue `items` only for checks flagged
`namesPeopleInDigest`, `[]` otherwise. One line, and then the privacy claim doesn't depend on the renderer
staying correct forever.

### 🟡 3 — `GET /api/attention` returns TH-only titles. **My spec gap, not yours.**
`title: t(check.titleKey, "TH")` hardcodes Thai — correct against what I wrote. But I also told Fern in
TASK-054 that check titles come from the API, and her panel must render **TH+EN**. As specced she'd have to
either ship TH-only or keep a second copy of the labels — the drift this whole design avoids everywhere else.
**Please also return `titleKey`** in each check (keep `title` as the TH default). I'm fixing TASK-054's wording
to match; the mistake was mine.

### Nits — for the record, no action required
- `isFreelanceNearCap = overLimit(r) || r <= FREELANCE_NEAR_CAP_HOURS`: the `overLimit` call can never change
  the result (`<= 0` is subsumed by `<= 2`). Keep it or drop it as you like — just don't count it as the reuse.
  The reuse that actually matters in check 5 is reading `remainingQty` from the one source, which you did.
- `studentsWithParent` loads all students **and** all parents and joins in JS. Semantics are right and the
  dataset is small, so **accepted** — but it's a double full scan on every panel load, worth remembering if the
  panel ever goes somewhere hot.
- `expiring_entitlements` and `nearly_finished_courses` can both fire on one course. Intentional — different
  actions (expiry vs renewal). No change.

### Not blocking
The Task Scheduler command is exact and hand-off-ready — that's what I asked for, thank you. DB queries / LINE
send / `job_runs` write remain **deploy smoke**, accepted as brownfield with your steps documented.

**TASK-053 → REWORK.** Items 1–3 only; nothing else needs touching, and **TASK-054 stays blocked** until item 3
lands so Fern builds against the final shape.

---

### Re-review after the rework — **DONE ✅ (Sober, 2026-08-01)**
All three verified in the code, not from the notes:
- **Item 1 fixed properly.** `lastDigestRunQuery()` is now
  `.orderBy(desc(runDate), desc(finishedAt)).limit(1)` — newest business date, later run wins the tie, one row.
  The indicator can no longer freeze on a stale date, which was the whole point.
- **Item 2 fixed at the right layer.** `namesAllowed` is built **from the registry flags**, so a future eighth
  check is covered automatically — the payload carries `items` only for the two checks permitted to print
  people. The privacy rule no longer depends on the renderer staying correct.
- **Item 3 fixed on both branches** — `titleKey` is returned on the success path *and* on the degraded
  (`count: null`) path, so Fern's panel can localise a broken check too. That second branch is easy to miss.
- **Verified myself:** `bunx tsc --noEmit` → **0**; `bun test` → **221 pass / 0 fail** (37 files, +6).

**On the ordering test — the right call, and honestly labelled.** He couldn't compare live rows without a DB,
so instead of a mock that proves nothing he rendered the query with **`.toSQL()`** and pinned the *contract*:
`run_date desc` **before** `finished_at desc` (asserted by index position, so the precedence is real), `limit`
bound to 1, still scoped to `daily-digest`. It fails if anyone drops a `desc`, drops the tie-breaker, or
restores a wide limit — which is exactly the regression I was worried about. He also stated plainly what it
does **not** prove. Second time on this task he chose a test that proves something over a mock that looks
thorough; that's the habit I want.

**Nit accepted with a better reason than mine:** he kept `overLimit(r) ||` in `isFreelanceNearCap` as an
explicit statement that already-over-cap stays in scope **if the threshold is ever lowered to 0** — since the
thresholds are placeholders awaiting คุณฟีน, that's a fair argument. Kept.

**TASK-053 → DONE.** **@Fern: TASK-054 unblocked** — final shape
`{ checks: [{ key, titleKey, title, count, items }], lastRun: { runDate, finishedAt, sent } | null }`, and
**`lastRun: null` is the "never run" warning**.
**⏳ Deploy (@Porter):** redeploy scheduling-back (:4006) — **no migration, no new env var** — **and register the
08:00 Windows task** with the verbatim command in the Implementation Notes. Without that registration the
feature is silently dead, which is the failure this REQ is designed around.
