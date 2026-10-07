# SYSTEM FACTS — how this system actually behaves

> 🔴 **Created 2026-09-02 because Porter kept re-learning things the owner had already told him.**
> He had to explain the same operational facts across sessions, and twice acted alarmed at deliberate
> configuration. **That is a note-taking failure, not a knowledge failure.**
>
> **What belongs here:** any fact about how the running system behaves that is **not** derivable from the code,
> not a requirement, and not a status. Limits, schedules, deliberate settings, platform behaviour, things the
> owner decided operationally.
>
> **The rule that makes it work — Porter's, binding on himself:**
> **When the owner states a fact about how the system behaves, it is written HERE BEFORE the reply is sent.**
> Not after, not "when I update the board", not in a log entry that scrolls away.
>
> **Format:** one fact, one line, with **who said it and when**. Append-only. Never compacted, never summarised.
> If a fact turns out to be wrong, strike it and write the correction under it — do not delete.

> 🧹 **Shape fixed 2026-09-23 (Marie housekeeping, owner-approved, ORDER 6). Nothing deleted:** the
> pre-split file is `archive/SYSTEM-FACTS-2026-09-23-pre-split.md` (verbatim, 323 KB). Two
> `MOVED FROM board.md` dumps were unwrapped: the durable facts stayed here, the board-shaped
> residue went to `archive/SYSTEM-FACTS-2026-09-23-board-residue.md`. **This file is exempt from
> SIZE, never from SHAPE — a board that fails its gate is never emptied into here.**

> 🧹 **Transcripts removed 2026-09-28 (Marie ORDER 12.5, owner-approved; executed by Porter). Nothing deleted:**
> pre-split file `archive/SYSTEM-FACTS-2026-09-28-pre-split.md` (verbatim, 359,975 B, md5 `1c8375c3…`). Three
> section BODIES were distilled here and archived verbatim to
> `archive/SYSTEM-FACTS-2026-09-28-investigations.md`: §PARKED LINE inbound · §SOLVED ecosystem.cjs · §Project
> info. `Project info` went back to `board.md`, where it belongs.
>
> 🔴 **WHAT THE PASS ACTUALLY FOUND, and the next person needs it:** the "four huge sections" are **not four
> transcripts.** Measured heading-to-heading they are 74% of the file — but each `##` BODY is only 1–4 KB. The
> bulk is **130+ dated `###` facts that were appended under whichever `##` heading happened to be LAST at the
> time.** 127 KB of TASK-318/323/324/325 engineering lessons sit under `## 📱 LINE MOBILE…`, which is about
> rendering. ⇒ **the `##` headings here do not describe what is under them.** Re-parenting those `###` blocks is
> a separate operation; **it was NOT done, because moving facts on a guess is worse than a big file.**

---

## 🧭 HOW THIS FILE IS ORGANISED — read this before you add a fact
###### Facts are grouped by SUBJECT. Every `## ` heading names the subject of everything underneath it.
###### 🔴 A NEW FACT GOES UNDER THE `## ` SECTION FOR ITS SUBJECT — never appended blindly to the end of the file.
###### End-of-file appending is what broke this file: whatever `## ` heading happened to be LAST silently became the parent of everything written after it. That is how `🚦 DEPLOY RULES` and `🔴 MIGRATION CHECK` ended up filed under `🅿️ PARKED → 🔻 SUPERSEDED`, and how 100+ engineering facts ended up under a heading about LINE rendering.
###### If no existing section fits, create a NEW `## ` section named for the subject. A dated `## ` of its own is always better than a wrong parent.
###### Re-parented 2026-09-29 (Marie re-parent operation, executed by Porter). Verbatim pre-operation copy: `archive/SYSTEM-FACTS-2026-09-29-pre-reparent.md` (359,261 B, md5 `2fb216b551c37aea68792741904803ce`). NOT ONE BYTE of fact content was changed — only heading levels and block order. Proof: `archive/verify-before-2026-09-29.txt` vs `archive/verify-after-2026-09-29.txt` diff clean.

## 🔴 WHO IS WHO — settled by the owner, 2026-09-04

Read this before you attribute anything to anyone.

- **The owner is โด่ง (develyst).** He is the only person who has ever talked to this team.
  Every requirement, answer, correction and decision in every log and every REQ reached us
  through him.
- **In the logs, "คุณฟีน", "คุณปุ้ม", "the stakeholder" and "the owner" are all HIM.** The team
  used those names loosely across July and August. They are not different people speaking —
  they are one voice.
- **คุณฟีน and คุณปุ้ม are the CUSTOMER.** Real people on the customer's side, and **they have
  never spoken to an agent, ever.**
- ⇒ **No requirement in this repo is customer-validated unless it explicitly says so.** When a
  log says "คุณฟีน wants X", that is the OWNER relaying. It is not evidence that the customer
  has seen X, approved X, or was ever asked. If customer sign-off matters for an item, it must
  be obtained and stated **on that item** — never inferred from a name.

**Do not go back and rewrite the names in the ~79 files that carry them.** The fix is here, at
the point of reading. A mass rename would rewrite history and prove nothing.

> **Conventions for this whole file:** every date is **2026** unless a full year is written · **`(owner, …)` means owner โด่ง**, the person defined directly above · **⚠️ CONTESTED** means both sides are recorded in `SYSTEM-FACTS-CONTRADICTIONS.md` and neither may be acted on without him.

## Schedules — the jobs, and when they really run

| Job | Time | Source |
|---|---|---|
| `month-reset` | **00:05 on the 1st** | `job_runs`, observed 09-01 |
| `daily-digest` | **08:00** | **owner โด่ง's own choice, 2026-08-01**; `job_runs`, stable since 08-19 |
| `daily-reminder` | **08:15** | **owner โด่ง's choice 08-28**; registered on both boxes, first self-firing 08:15:01 on 08-29 |
| **`end-of-day`** | 🔴 **17:30** (was 18:30) | **The OWNER set 17:30, 2026-09-16, on customer request** (18:30 from 08-29; 23:30 before). A session is "in time" (ทัน / not-yet-cut) until this fires that day. |

🔴 **SUPERSEDES the 18:30 paragraphs below (owner's ruling via Porter, 2026-09-18; code TASK-396): end-of-day = 17:30, and the job gates on START time.**
- **Why 17:30 and not 18:30:** the team LEAVES at 17:30 and wants every class cut before they go — the trigger cannot move later.
- **What the job does now:** today's run attends every unmarked CONFIRMED class whose **`start_time <= now`** (was `end_time <= now`). A 17:00–18:00 class IS attended at the 17:30 run because it has started; a class starting after 17:30 (none exists — `TIME_SLOTS` ends at 17:00) would wait for the next day. Past dates: every unmarked CONFIRMED, unchanged.
- **This is a CONSCIOUS OVERRIDE of REQ-070's "never attend before the class ends"**, recorded in the code header with the owner's reason: staff are on-site and review before leaving. Do not report "attended before it ended" as a defect.
- **The coupling to keep now:** *the trigger must stay at/after the last `TIME_SLOTS` START* (17:00 today; 17:30 clears it by 30 minutes). The old "+1 hour" rule in the paragraphs below is history. The gate has exactly two mirrors — `jobs.service.ts` (SQL) and `lib/auto-cut.ts` (pure, test-only) — both flipped together.
- 📌 The 2026-09-16→18 episode: a 17:00 class not cut at 17:30 with a `job_runs` row present was **not a timezone bug** — the end-time gate skipped it correctly; the owner then chose start-based cutting over moving the trigger back to 18:30.

📜 *History (18:30 era, 2026-08-29 → 09-16; end-time gate until 09-18) — kept verbatim, superseded above:*
🔴 **`end-of-day` at 18:30 is DELIBERATE and CORRECT. It is not a defect and must never be reported as one.**
**Why it is correct: the app only lets you book a teacher until 18:00** (owner, 2026-09-02) — so **18:30 is after
the last session that can exist.** There is no window of sessions that the job can miss.
📌 **Porter raised this as a 🔴 possible live money incident on `uat` on 2026-09-02. It was neither.** He read
"23:30" out of stale documents, saw 18:30 in the data, and alarmed the owner about a setting the owner had
chosen. **Both halves — the schedule and the 18:00 booking limit — had been said before and never written down.**

- **Tasks are registered BY HAND by the owner, per box — an ops step, never part of a deploy** (Porter, 2026-07-20; restated 08-28).
- 🔴 **Deployed ≠ registered, registered ≠ working — the failure looks identical to success** (Porter, 2026-07-20/08-01). Day-end never ran on `uat` for weeks (Jason, 08-28).
- **Proof a job fired = a `job_runs` row for that date AND `Last Run Result` `0x0`**; `Last Run Time 11/30/1999` means never (Porter, 08-23). 🔴 **`job_runs` is WIPED by `db:reset`** ⇒ empty never proves "never ran".
- 🔴 **`INTERNAL_JOB_SECRET` unset ⇒ `503 NOT_CONFIGURED` while Task Scheduler still reports SUCCESS** (Porter, 08-23) ⇒ read the response BODY, never the exit code.
- 🔴 **`month-reset` must NEVER be test-run mid-month — it wipes that month's freelance drawdown.** Idempotent per month via `app_settings`, with a `force` flag (Sober, 2026-07-20; Porter, 08-23).
- 🔴 **Triggering `daily-reminder` manually before 08:15 SILENTLY EATS that day's reminders for real families** — idempotent per business date, no error, no sign (Porter, 08-29). **`daily-digest` is idempotent per day too: a re-run returns `skipped: already-sent` and the last-run clock does not advance — looks broken, is not** (Porter, 2026-08-01).
- **08:00 = ADMINS/ops · 08:15 = TEACHERS + PARENTS about today's classes — different audiences entirely** (Porter, 2026-08-28).
- **08:00 was the owner's own choice, and both surfaces — LINE digest *and* a web view: *"web ด้วย"*** (owner โด่ง, 2026-08-01).
- **`sent: true` on a job result means the JOB ran, not that anyone was reached** (Jason, 2026-08-28). **Since 08-29 `sent` is the DELIVERED count and `attempted` the separate ran-fact** (TASK-209, 08-29).
- **The LINE outbox worker runs every 15 s** — `som-back-out.log` prints `[outbox] LINE worker started (every 15s)` on each boot (observed in owner โด่ง's own pm2 paste, 2026-08-19). Absent from the table above; sourced nowhere else.
- **Moving a job's trigger is one `schtasks` edit on the box** (Porter, 2026-08-24) ⇒ trigger times are cheap and should be expected to change.
- ✅ **SETTLED by the owner, 2026-09-05 — the day-end trigger time is `18:30`, and he changed it himself** (`C-03`, *"C-03 18:30 ฉันปรับเอง"*). The 23:30 · 18:05 readings are history; do not reintroduce them.
- ⚠️ **STILL CONTESTED — whether `month-reset` writes a `job_runs` row** (none 08-24 · all jobs do 08-29). `C-06` in `SYSTEM-FACTS-CONTRADICTIONS.md`, `_(unanswered)_`; do not act without the owner.

## What end-of-day actually does

- 🔴 ✅ **SETTLED by the owner, 2026-09-05 (`C-01`): it AUTO-ATTENDS an unmarked booking. It does NOT write `NO_SHOW`** — *"C-01 auto-attend"*. It WRITES either way (consuming `used_sessions`/`used_hours`). The `NO_SHOW` reading (Porter, `jobs.service.ts:47–61`, 08-23) is **superseded by the owner's ruling; if the code still writes `NO_SHOW`, that is a DEFECT to route, not a fact to record.**
- **It selects `CONFIRMED` only — `PENDING` rows sit forever** (Porter, 08-23).
- **The scheduled run passes NO date ⇒ it can only ever process today** (Porter, from `jobs.service.ts`, 08-23) ⇒ switching it on cannot sweep history — one day at worst.
- 🔴 **Re-running a PAST date is no clean back-post — the predicate is `sql\`true\`` (`jobs.service.ts:29`) and the whole date is swept** (Porter, 08-23). Needs a revenue-only mode.
- **Revenue posts ONLY for `ATTENDED`** (`jobs.service.ts:88`, Porter 08-23), **at two moments: at sale (course·voucher·rental) and at day-end (1st Trial·single)** (Porter, 08-22).
- 🔴 **`revenuePosted` in `job_runs` OVER-COUNTS on a re-run** — a duplicate returns `{ok:true}` and counts (Porter, `lib/sale-post.ts:88`, 08-23). **The ledger is the fact; the summary is a claim.**
- **Best-effort, idempotent per booking (`rev:<bookingId>`), skips silently on a dead target** (Jason, 2026-07-20).
- **No repo command runs it** — `scripts/end-of-day.ts` is a thin unwired trigger needing `SCHEDULER_API_URL` + `INTERNAL_JOB_SECRET`; on-demand day-end is the owner's setup (Porter, 2026-08-22).

## Product limits

- **Teachers can only be booked until 18:00.** Owner, 2026-09-02. This is what makes the 18:30 day-end safe.
- **There is NO rate limiter anywhere in the codebase** (Sober, 2026-08-17, grounding REQ-051 — its public
  no-login page). Any attempt-counting or throttling is new infrastructure, never a library flag.
- **`job_runs.byBookingType` reports only the four original types** — `FIRST_TRIAL · SINGLE_SESSION ·
  COURSE_PACKAGE · VOUCHER`. Observed 09-02. ✅ **RESOLVED from the code, Sober 2026-09-07: the day-end does NOT
  skip `OTHER` when SELECTING** — the query is `inArray(bookingType, ["FIRST_TRIAL","SINGLE_SESSION","OTHER"])`
  (`jobs.service.ts`, TASK-225). **Only the REPORT omits it.** Reporting and selecting were different questions and
  the answers differ.
- 🔴 **The product has almost no DELETE at all.** Exactly **two** deletes exist — `DELETE /teachers/:id/line-link` and `DELETE /settings/:key` — and the FE calls one. **Students, parents, courses, vouchers, bookings and posted `bo.movement` rows have no delete anywhere**: a booking is only *cancelled*, a parent only *suspended*, both still listed (Tanya, API + FE, 2026-08-11; earliest 2026-08-01, `api.ts:34`). **Nothing with history can be removed — only hidden.** ⚠️ **This supersedes the earlier student-only line, which was too narrow.** ⇒ **anything created on a real box is permanent**; QA can never clean up after itself. **`course:cleanup` is no escape hatch: it refuses any course with a posted sale, and creation always posts one — so it refuses 100% of normally-created courses** (Porter, 2026-08-23).
- 🔴 **ONE shared staff login ⇒ every history event carries `actor = null` by design** (SPEC-035 §1) — **the product cannot attribute an action to a person** (2026-08-24). Per-person permissions cannot be enforced at all — "only person X may do this" needs separate logins as a **prerequisite** (Porter, 2026-08-01).
- **NO audit table exists anywhere** (BE, 2026-09-02) : clearing a family's LINE link (the only way an account moves families) is a **log line only**.
- 🔴 **2FA — ⚠️ CONTESTED.** No SMS exists, and a code sent into the LINE chat being verified proves nothing ⇒ the six digits have **no transport**; `deliver2faCode` deliberately throws (BE + SA, 2026-09-02). This file says "one `app_settings` switch away". ⚠️ CONTESTED — both sides in `SYSTEM-FACTS-CONTRADICTIONS.md`; do not act on either without the owner.
- 🔴 **Max 5 students per phone/parent — ⚠️ CONTESTED.** This file says it is in no REQ/spec/task; the logs have it in code and under test 2026-08-01, used by Sober 08-17 and Jason's importer 08-19 — and the **unit differs** (per phone vs per parent). ⚠️ CONTESTED — as above; do not act on either side without the owner.
- **No cancel-course / refund / early-termination flow exists** (grep-confirmed; Sober, 2026-08-03). Every course-session cancel re-owes a make-up ⇒ **cancelling sessions one at a time can never end a course** (2026-08-24).
- **No sale-reversal path anywhere in `scheduler-back`** (Jason, 2026-08-22; asked of the owner twice, never answered). Only the owner can reverse a `bo.movement`.
- **LINE leave covers only TODAY's bookings; the bot sees only `CONFIRMED` ones** — a `PENDING` one is invisible (Porter, 2026-08-01 / 08-19).
- 🔴 **`bun test` in `smart-scheduler-back` reaches the LIVE `sid` DB** (`eligible.route.test.ts:13`) — refused off-whitelist; on a whitelisted machine it reads real rows, and every DoD names it (Sober, 2026-08-30).
- **Frontoffice web is LAPTOP + PC only; 375 px is out of scope** (owner โด่ง, 2026-08-04) ⇒ a phone-width-only defect never blocks go-live.
- 🔴 **Revenue by branch / onsite-vs-online is STRUCTURALLY IMPOSSIBLE** — badges carry no price and the `bo` ledger no tag link (Porter, 07-31, restated 08-01).
- **Programs (`subjects`) have NO screen and NO API** — only in `db/seed.ts`; each needs an engineer (Porter, 2026-08-20) and stays an owner-run script (Sober, 08-22).
- 🔴 **Engineers reach NO authenticated `/scheduler/*` screen and render NO modal** ⇒ every rendered check and measurement is QA's or the owner's (Fern/Sober, 08-16/09-01).
- **No build stamp; BE and FE deploy separately** ⇒ a PARTIAL deploy (BE current, FE stale) is real, invisible, and cost a QA round (Porter, 2026-08-23/08-25).
- 🔴 **Drizzle SILENTLY SKIPS a migration whose `when` predates the ledger's newest `created_at`, and reports success** — the 08-02 outage; `db:verify` exposes it (Porter/Jason, 08-18).
- **`recordSale` never back-posts; editing a `bo.item` price does not correct posted movements** ⇒ a placeholder price is permanent, silent, wrong money (observed, 08-22).
- **`notification_outbox` and the `bo` ledger have NO read API; QA cannot trigger any job** ⇒ each is a DATA REQUEST or the owner's hands (Tanya, 2026-08-20/08-29).
- **A charged `อื่นๆ` amount is WRITE-ONLY with NO CEILING** — nothing reads it back, nothing bounds it; a ฿2,000-for-฿20 typo is money before anyone sees it (Tanya/Sober, 2026-09-01).
- 5-per-phone cap = `MAX_STUDENTS_PER_PARENT`, asserted in `module-isolation.test.ts` (Jason/Sober 08-01).
- 🔴 **A course RE-PLAN moves what is OWED; it does NOT move what has HAPPENED.** A resumed course lays its
  remaining sessions out from the admin's new date/time, but **a declared leave keeps its ORIGINAL date and
  time** — `endableSessions` is `COURSE_LIVE` only, so a pause never touches a `SICK_LEAVE` row, and a re-plan
  never re-dates one. ⇒ **a re-planned course legitimately shows a mixed-time plan**, and that is the truth: the
  leave WAS at the old time. 🔑 **Same distinction as `cancelledByPause`: a leave is a DECISION that was made;
  the remaining sessions are the PLAN being replaced.** (Owner's screenshots + @Porter's question, ruled by
  @Sober, 2026-09-08.) 📌 **Confirmed twice in two nights, from two different directions.**
- 🔴 **THIS PRODUCT COMMITS AND THEN SHOWS — there is no preview surface anywhere, and it has bitten twice in one night** (Sober, 2026-09-08). **The six notifications** can be read only by the owner, **after sending** (no preview endpoint; a push to an unlinked recipient returns `skipped` without rendering). **A course RE-PLAN** states its new last session and expiry only in the **response** — `POST /courses/:id/resume` is the only route, so *"read before you confirm"* is not reachable without a `resume/preview`. ⇒ **every verification of a message or a re-plan costs a round trip through a human doing the act.** 🚫 **Not a defect in either feature — it is the shape of the product**, and @Fern's refusal to compute the dates client-side to fake the ordering is the right ranking: **a computed preview that drifts from the server is worse than reading the outcome a second later.** 📌 Something to decide about deliberately, on a day when nobody is deploying.
- 🔴 **THE SIX NOTIFICATION MESSAGES CAN BE READ BY EXACTLY ONE HUMAN BEING BEFORE THEY GO OUT — the owner.** There is **no message-preview surface** (no preview endpoint), and **a push to an unlinked recipient returns `skipped` WITHOUT rendering any text** ⇒ @Tanya cannot see a composed message at all, on any box. **This is structural, not a QA gap** (@Porter + Tanya, 2026-09-08). ⇒ **every correction to a notification is verified on the owner’s phone or not at all**, which is why each one costs a round trip. 📌 It is also why @Porter’s *"test it with a note PRESENT"* mattered: an empty booking renders the omit-empty path and proves nothing about the field.
- 🔴 **`tsched_empty` is the ONE i18n key shared by a CONVERSATIONAL reply and a NOTIFICATION** — `line-schedule.ts:42` (the teacher’s `ตาราง`) and `line-today-schedule.ts:64` (the daily-reminder outbox). ⚠️ **The conversation is bilingual and the notifications are held single-language (SPEC-077 §5), so this key sits ON that boundary.** ✅ **It is safe because composition happens at the CALLER** — `both((l) => …)` makes the reply bilingual while the notification still calls `t(key, lang)` itself. 🔴 **A per-key bilingual helper would have made the notification bilingual SILENTLY**, which is what `SPEC-077` §3 originally specified before @Jason replaced it for an unrelated reason. ⇒ **if the notification language decision is ever unheld, this key is the first thing to look at** (Sober + Jason, 2026-09-07).
- 🔴 **The two `BookingStatus` unions are DELIBERATELY SEPARATE — a decision, not a coincidence** (@Fern's Q1, ruled by @Sober, 2026-09-08). `smart-scheduler-front/types/api/contract.ts` is **the wire**, synced from the backend's `types/contract.ts`; `types/app/scheduler` is **the app's own model**, already deliberately not the wire's (`Booking` is flattened, `dtoToBooking` is the seam) and carrying app-only vocabulary (`OFF_CALENDAR_STATUSES`, `BOOKING_STATUS_COLOR`, `isDeliveredStatus`). 🔑 **The argument is an event that happened:** her wire copy was CORRECT while the backend's published contract was WRONG (TASK-270) — **had the app union derived from the wire, the error would have propagated into the colour map, the icon map and `OFF_CALENDAR_STATUSES` instead of being contradicted by them.** ⇒ **DERIVATION MAKES THE CLIENT INHERIT THE SERVER'S MISTAKES.** 🚫 **This RANKS the two options @Sober left open on 09-07: codegen from the OpenAPI is not merely one of two, it is the WRONG one.** ✅ **If the duplication is ever closed, it is closed with a CROSS-REPO CONTRACT TEST — "the two lists must agree" — never by making one depend on the other.**
- 🔴 **Cross-repo duplication is a CLASS, not an incident — three instances by 2026-09-07:** the booking-status **list** · the status **labels** (`dictionaries.ts`) · the **attention-card keys and their headings** (`attention.service.ts` + `dictionaries.ts`). **Each is complete and correct today; none has a mechanism keeping it so, and a RENAME on the backend would break the front end silently.** ✅ **No task cut for any of them (Sober, 09-07):** there is no defect, only a missing mechanism, and the two real options — **(a) generate the FE types from our OpenAPI** or **(b) a cross-repo contract test** — are decisions about how the repos relate. 📌 **Three occurrences strengthen (a); it is @Porter's to raise when the owner has room.**
- 🔴 **A FIFTH copy of the booking-status list lives in `smart-scheduler-front`** (`types/api/contract.ts:13`) and it is **COMPLETE — all nine** (@Fern added `PAUSED` for REQ-076). ⇒ **the CLIENT's contract was correct while the server's own published OpenAPI said the status did not exist.** ✅ **No task cut (Sober, 09-07): there is no defect — the list is right — only a missing mechanism.** The two real options are **(a) generate the FE types from our OpenAPI document** (truthful since TASK-270) or **(b) a cross-repo contract test**; both are decisions about how the repos relate. 📌 `BookingStatusAction` (the four verbs) matches on both sides — **the write path has never had this problem.**
- 🔴 **The booking-status list exists FOUR times, and only the DB enum is the truth** — `db/schema.ts`
  `pgEnum("booking_status")` (**9 values**) · `validation.ts` `BOOKING_STATUS` · `types/contract.ts`
  `BookingStatus` · `openapi/document.ts` (**7 each**). **`PAUSED` reached one of the four ⇒ DEF-1: the pause
  tray's own request is a 400** (Tanya on `sid`, 2026-09-07). **`NO_SHOW` has the identical gap and nobody had
  found it** — historical no-show rows render but cannot be listed. ⇒ **TASK-270 makes the three derive from the
  DB enum.** 🚫 **Not the same thing as `SLOT_INACTIVE_STATUSES` / `CALENDAR_HIDDEN_STATUSES` / the
  availability list** — those answer *questions* and are allowed to differ; these four are the same list, four
  times, for no reason (Sober, 2026-09-07).

## LINE

### 🔴 ONLY THE OWNER CAN TEST LINE — @Tanya cannot, ever (owner, 2026-09-05, correcting Sober)

Owner, verbatim: *"tanya cannot test line that me only one can test."* **Stated as a correction to @Sober, who had
routed three LINE replays to QA.**

**What this covers:** anything that needs a **real LINE account on a phone** — tapping a rich menu, seeing a menu
render or flip, sending an inbound message as a parent or a teacher, or confirming what a chat looks like.
⚠️ **It supersedes the looser line above** (*"inbound LINE is testable on `sid` any time"*), which is true of the
**webhook** and not of the **experience**. Three reasons already in this file, and any one of them is enough:
- **LINE on PC has no rich menu and its buttons cannot be tapped at all** — a menu test needs a phone.
- **`sid` and `uat` share ONE LINE channel**, and **`sid` is not a safe isolated box** — real people are linked, so
  a test message can reach one. QA's own rule is *"never message real people."*
- The owner holds the OA and the phone. **Nobody else can produce the evidence.**

⇒ **Routing, and it is a hard rule, not a preference:** a LINE-on-a-phone check is **never** assigned to @Tanya.
It goes **@Sober → @Porter → the owner**, and comes back the same way. @Tanya still owns everything reachable
without a phone: API and DB behaviour, the web app, and the outbox rows a flow is supposed to write.
📌 **A test nobody on the team can run is not a test plan — it is a request, and it must be addressed to the one
person who can run it.**

- **The webhook points at `sid` PERMANENTLY** since 2026-09-01 (owner). It used to live on `uat` and be borrowed
  at night; that arrangement is over. ⇒ inbound LINE is testable on `sid` any time.
- **`sid` and `uat` share ONE LINE channel** (owner, 09-01). The customer's real OA becomes a separate account
  later. ⇒ **outbound pushes from `sid` can reach anyone linked on `uat`.**
- **2 real teachers are linked on `uat`.** **They must never receive a rehearsal message.**
- **The owner is linked on `sid` as teacher `Bank`** (2026-09-01) — the isolatable test recipient. Only ONE
  recipient is linked, so "every assigned teacher got it" still cannot be proven.
- 🔴 **An admin's reply typed in LINE OA Manager is OUTBOUND and never reaches our webhook.** Measured by the
  owner on `sid`, 2026-09-01: he replied, and no `[line-in]` was logged. ⇒ "bot mutes when an admin replies"
  **cannot be triggered automatically.**
- 🔻 **SUPERSEDED — do not read this line alone.** *"LINE on PC: no rich menu, and buttons cannot be tapped at
  all — text only"* (owner, 09-01). **CORRECTED 2026-09-02, in this same file (§LINE, the ‹CORRECTED› entry):
  quick-reply chips ARE tappable on PC.** What is true: **they vanish the moment the user types**, and PC has no
  rich menu to bring them back. ⚠️ **The conclusion is unchanged — every choice still needs a typed equivalent —
  but the reason is different, and the difference decides where the buttons must be RE-OFFERED** (TASK-251).
  📌 **Left in place rather than deleted, marked rather than trusted: @Sober quoted the superseded half on 09-06
  and specced from it.** RULE ZERO is newest-wins, and a file can contradict itself in two places.
### Who can receive a message — read before ANY send
- 🔴 **Who is LINE-linked on `sid` is CONTESTED.** Logs show `Bank` **and `Haris`, a REAL teacher** (09-02), a third account as a parent (09-03), and on 09-04 `Bank` turning parent while another account took that name. ⚠️ CONTESTED — see `SYSTEM-FACTS-CONTRADICTIONS.md`; do not act without the owner. **Whichever side is right, `sid` is not a safe isolated test box.**
- 🔴 **A departed teacher whose account is still bound keeps receiving schedule pushes on their personal LINE — there is no staff-side unbind** (Porter, 2026-07-30).
- 🔴 **Cancelling a `CONFIRMED` booking pushes a cancellation to its assigned teacher** ⇒ retiring confirmed fixtures can message a real person (2026-09-02).
- **Confirm both sets `CONFIRMED` and pushes LINE to the TEACHER, not the parent** — *"มันก็ส่งไลน์ครูนะ ปกติ ปุ่มนี้"* (owner โด่ง, 2026-08-22). It fires for **every assigned teacher**, one outbox row **per PERSON, never per booking** (owner โด่ง, 2026-08-28).
- **`uat`: 0 of ~180 parents and 2 of 20 teachers linked — a KNOWN STATE, not a defect**: *"uat ลูกค้าแค่ยังไม่ใช้เฉย ๆ ปล่อยไปอย่าไปยุ่ง"* (owner โด่ง, 2026-08-29). **No broadcast or nudge unless he asks.**
- 🔴 **Where no admin has registered in the bot, notify-on-leave is a SILENT NO-OP forever, no error anywhere.** Registering an admin **per box** is a go-live checklist item (Porter + Sober, 2026-08-20). **`notify_on_leave` defaults `admin_only`; the teacher is never messaged** (2026-08-19).
- **An admin registers through the BOT, not config: `สมัคร` → role `3` → the verify code `LINE_ADMIN_VERIFY_CODE ?? "229"` — `229` is only the fallback** (Porter, in code, 2026-08-20).
- **An unlinked recipient is a reported SKIP, not an error** (Jason + Tanya, 2026-08-28).
- 🔴 **A human admin LIVES IN the LINE OA and answers customers by hand** — *"admin เขาจะสิงไลน์นั้นแหละ ไปตอบลูกค้า"* (owner โด่ง, 2026-08-30). ⇒ the bot is never alone in the thread.

### What the bot can and cannot do
- 🔴 **LINE leave and check-in are TODAY-ONLY and see only `CONFIRMED` bookings** — today's date **and** `status = CONFIRMED` **and** the account's own child; any miss yields one empty-state reply, nothing logged (Porter, 2026-08-01; re-verified 08-22).
- **Mute lasts 60 min (`MUTE_MINUTES`); a session expires after 30 min idle (`SESSION_IDLE_MINUTES`)** (Jason measured 2026-09-02, Sober endorsed). ⇒ **leave a chat alone 30 min before retesting expiry**; the mute is **per-chat, never account-wide** (2026-09-03).
- 🔴 **An unlinked chat typing an UNKNOWN phone CREATES a parent record**; a roster nickname links you as that teacher (Porter, 2026-07-30).
- **One LINE user ⇒ ONE roster link; a role change MOVES it, never adds one. Precedence: teacher → customer → admin** (2026-07-30).
- **Unfollowing and re-following the OA does NOT unlink — the link is in OUR database** (2026-07-30).
- 🔴 **If `app_settings.line_rich_menu_ids` is empty the per-user menu switch is a SILENT NO-OP while the account link still succeeds** — the OA looks fine and nobody reports it; root cause of REQ-042 (Sober, 2026-08-16).
- **Quick-reply button labels clamp at 20 characters** ⇒ anything longer goes in the message body, not the button (Jason measured, 2026-08-16).
- **The leave cut-off is an editable setting, default 3 hours, resolved per session from the teacher's type** (observed live, 2026-08-19).
- 🔴 **LINE will not linkify `webcal://`, and Google Calendar mobile cannot add a calendar by URL** — a platform wall (2026-07-31).
- ⚠️ CONTESTED — **rich menus** (none exist yet vs. eight on the customer OA, four adopted, 08-16) and **whether a flow can start from a button** (typed keywords only vs. buttons starting flows 09-02 23:38, with the owner's 07-29 typed-keyword regression check). Both in `SYSTEM-FACTS-CONTRADICTIONS.md`; do not act on either without the owner.
- **A LINE refusal with no `catch` makes the bot go SILENT** — the parent gets no reply; catch and render every LINE-path refusal (Jason/Sober 08-17).
- **Only TWO admin-digest checks may name a person**: unconfirmed bookings and teachers with no LINE link. Everything else is a bare count — never a name, phone, DOB or child's name in a chat log (Sober 08-01).


### A new outbox kind must be added to the message inventory script — it refuses to run without it (Silver, 2026-10-03, TASK-620)
- **`scripts/inventory-line-messages.ts`** (back repo) produces the customer's list of every LINE message (REQ-111 A).
  - It parses every `case "…":` in `buildOutboxMessage` (`src/lib/line-message.ts`) and **throws** `renderer kinds not in the inventory: …` if one is missing from its hand-written `KINDS` list.
- ⇒ **Whoever adds a notification kind also adds a `KINDS` row** (the audiences, a fake fixture, and a one-line "when it is sent"), then re-runs the script.
  - A thrown run is the guard working, not a broken script.
- 📌 **First caught 2026-10-03:** TASK-608 added `teacher_leave_recorded` / `teacher_leave_lifted`, which made the workbook generated on 10-02 stale before it reached the owner.

## Telling the two boxes apart

- `SELECT count(*) FROM course_packages` — **`uat` ≈ 201 · `sid` two digits** (32 on 09-01, and growing as QA
  fixtures land). **The order of magnitude is the tell; the exact number is not.**
- **EVERY per-database script is per-box** (`sm-jobs`, `sale:ensure-items`, `demographics:repair`, `db:migrate`)
  — 2026-08-22: `uat` 0 sale items, `sid` 16/20, ledgers diverged. **The boxes can differ, and one being a
  certain way proves nothing about the other.**
- 🔴 **Exactly TWO environments, named by the owner; "prod" is not one of them, and "customer-prod" was ALWAYS `uat` — the box never changed, only the label** (owner โด่ง, 2026-08-16):
  **`sid`** = `som.develyst.online` + `backoffice-som.develyst.online` — team builds and verifies here.
  **`uat`** = `frontoffice.develyst.online` + `backoffice.develyst.online` — the customer's system, owner-operated only.
- 🔴 **The second box was RENAMED mid-project and nobody wrote it down.** 2026-07-30: it is **`production`** (owner โด่ง). 2026-08-01: still *"PRODUCTION — never touch it, not even a GET"*, `uat` **zero times** that day. `uat` begins 2026-08-16. ⇒ **every July/August "prod" / "customer-prod" means today's `uat`; there is no third box.**
- 🔴 **You cannot tell from a command which box it ran against — one shell, boxes switched by editing `.env`.** Ask him; never assume: *"รันที่เครื่องนี้ และแก้ env เป็นของ sid แล้วค่อยรัน"* (owner โด่ง, 2026-08-18).
- 🔴 **"Local" is not local either:** the checked-in `.env` aims a "local" run at a real server DB; **`env -u DATABASE_URL` does NOT isolate you — Bun auto-loads `.env`, which wins** (Jason, 2026-08-02). **His `smart-scheduler-front/.env.local` points at `frontoffice.develyst.online`**, and he declined to change it: *"ไม่จำเป็น"* (owner โด่ง, 2026-08-16).
- 🔴 **`sid` is a SHARED box — 8 unrelated projects, 16 pm2 processes** — killing a PID can kill someone else's service (owner's `pm2 ls`, 2026-08-19). **Nor is it private: the customer's own STAFF trial on it** (owner โด่ง, 2026-08-30).
- **Order of magnitude is the tell, only on COURSE counts:** 2026-08-23 `sid` 10 vs `uat` 60. 🔴 **Student/parent counts are NOT a tell** — same day `sid` 133/111 vs `uat` 137/115; the customer adds students continuously, so any count over a day old is stale (owner โด่ง 2026-08-23; observed 2026-08-25).
- ⚠️ CONTESTED — (a) whether QA may read `uat`, (b) whether `som.develyst.online` was ever "prod". Both sides in `SYSTEM-FACTS-CONTRADICTIONS.md`; do not act on either without the owner.
- **`sid` = rehearsal box; `uat` = the customer's box** (Porter 08-19); `sid` can be `db:reset` + re-imported in a minute.
- **`daily-reminder.ps1` is COPIED per box — the secret differs per box** (Porter 08-29).

## Platform, migration and deploy discipline

- 🔴 **EVERY migration is proven on `sid` FIRST; the TASK states how.** Owner's reason: *"ห้ามพลาด เพราะหลังเทสเสร็จต้องขึ้น uat เลย"* (owner โด่ง, 2026-08-16).
- 🔴 **`db:migrate` can exit 0 and print success while the schema stays broken** — drizzle silently skips a migration whose ledger row is missing but older than the newest one. **`db:verify` GREEN is the only proof, and comes before ANY restart** (Sober/Porter, 2026-08-22). Two outages (2026-08-03, 2026-08-24) ran with every command green.
- 🔴 **`db:verify`'s blind spots: it never goes RED on a SURPLUS ledger row** (it asserts journal ⊆ ledger) **and it witnesses by NAME** — an edited migration file or a changed index predicate passes green (Sober/Jason, 2026-09-01).
- 🔴 **Every seed/repair/reconcile script is PER DATABASE — having run one on `uat` proves nothing about `sid`; the boxes have been found empty, drifted and correct** (Sober, 2026-08-22). **Example:** after a new price, `sale:ensure-items` must run on THAT box or the booking is accepted and the revenue never posts — **only the ledger tells them apart; the screen looks right either way** (Jason/Sober, 2026-08-23).
- **No source on either server: build LOCAL → copy → `pm2 restart` there** (owner โด่ง, 2026-08-03). **Restart BE (`:4006`) then FE (`:3016`) in the SAME sitting, then confirm FROM THE SCREEN, not the deploy command** (Porter, 2026-08-28).

## 🚦 DEPLOY RULES (standing)

> 🔴 **PENDING DEPLOY (REQ-079 + TASK-225).** Items 1–2 cleared 09-05; item 5 frozen; **item 6 added 09-06 and it is live money.**
> 1. ✅ **DONE 09-05 (owner).** `0030` + `0031` applied on `sid`; `db:verify` ✅ — journal 32 · **32 witnessed**.
> 2. ✅ **DONE 09-05 (owner).** All six menus published; `unknown-TH` is the account default, `known-TH` links per user. **Both states confirmed ON A PHONE** — menu A on a fresh follow (13:47), menu B after linking (13:53). 🔴 The one dead cell is **DEF-9 / TASK-248**, not a publish fault.
> 3. **2FA cannot be switched on at all** until the owner answers how the six digits reach the parent — there is no SMS, and LINE cannot verify LINE.
> 4. ✅ **Trigger fired** (the menus now exist on the OA) ⇒ `NAME_TO_KEY` is folded into **TASK-249 §4**. No longer a loose deploy item.
> 5. 🧊 **FROZEN 09-05 — do NOT run.** The server now points at the **CUSTOMER'S OA**, and a LINE userId is scoped to the provider ⇒ the stored ids may match nothing there. @Porter has three unknowns open (which box holds the token · are `family_line_links` rows still valid · which OA). **Unfreeze only when he answers.** Original note: the backfill, and it is the owner's. Families linked **before** the 09-05 publish never had `linkKnownRichMenu` run for menus that did not exist. **Two wrong populations:** an **old** per-user link still resolves to the **old parent menu** (those menus still exist on the channel — the 01:23 screenshot), and **no** per-user link now shows **unknown**. **Neither shows menu B.** A one-off re-link runs against real customer chats ⇒ **deploy action, owner's call.** @Sober cuts a script task only if he asks for one.
> 6. 🔴 **`bun run sale:ensure-items` — OWED ON EVERY BOX SINCE TASK-225, and this is the AC-5 defect (added 09-06 by @Sober).** TASK-225 added the `other-booking` INCOME bucket to `SALE_ITEMS`; `sale:ensure-items` **only ever INSERTS what is missing**, so until it runs on a box, **every typed-amount อื่นๆ booking auto-attends and posts NOTHING** — `postOtherBookingSale` logs *"NOT POSTED — no bo.item for external_ref='other-booking'"* and returns false. 📌 **TASK-225 stated this deploy step twice, in its own file, and it never reached this block** — which is the block anyone actually reads. That is rule 4 below, missed by me. **Order per box: `db:migrate` → `db:verify` ✅ → `sale:ensure-items` → restart.** ✅ **Recovery after seeding is safe:** re-run the day-end for the affected date — the auto-attend touches only `CONFIRMED`, and revenue posts on `rev:<bookingId>` which is idempotent (a duplicate returns `skipped: "duplicate"`, plus a 23505 fallback), so nothing double-posts.
> 7. 🔴 **REQ-076's index rebuild — run it when the shop is CLOSED (added 09-06).** `0032` adds the `PAUSED` enum label; `0033` drops and recreates `bookings_teacher_slot_uq`. **`DROP INDEX` + `CREATE UNIQUE INDEX` take ACCESS EXCLUSIVE on `bookings`: reads AND writes block.** ⚠️ **The build itself is ~100–300 ms (budget 2 s) — that is NOT the risk.** If any transaction is holding the table when it starts, the `DROP` queues behind it **and everything else queues behind the DROP.** 🚫 `CREATE INDEX CONCURRENTLY` is unavailable — it cannot run in a transaction and every migration does. ⇒ **the note says "closed shop", never "it takes 300 ms".** (Jason's measurement, Sober 09-06.)
> 8. 🔴 **THE MIGRATIONS GO IN TWO RUNS — the commands, literally (added 09-06 after `sid` failed; TASK-266 landed).** `drizzle-kit migrate` applies **every pending migration in ONE transaction**, and `0033` uses the `PAUSED` label `0032` adds ⇒ a single `db:migrate` fails the whole batch. ✅ **`db:migrate` now REFUSES it up front** (`db:preflight`) and prints the split. **Type these two, in order, each ending in its own verify:**
>    ```
>    bun run db:migrate:through 0032_booking_paused_status
>    bun run db:migrate
>    ```
>    ⚠️ **What a failure would leave behind — say this to the owner, it is not "nothing".** Run 1 **commits**, so the batch is no longer atomic: if run 2 fails, the `'PAUSED'` enum label stays. ✅ It is **inert** (no index, no column, no code reads it until `0033`), `0032` is `ADD VALUE IF NOT EXISTS` so run 1 is safe to repeat, and **re-running `db:migrate` recovers** — `db:verify` names what is missing. 🟢 On `sid` (before the fix) the whole batch rolled back and left nothing; **that guarantee is what the split trades away, deliberately.**
>    🔴 **Separately, and not about `uat`: a FRESH database is broken today.** All 35 are pending from empty, so migrate-from-scratch fails at **`0002`** — `0001` adds `PENDING_RESCHEDULE` and `0002` uses it. **Thirty-one migrations old, never noticed because they were applied a few at a time.** A rebuilt dev box or `db:reset` needs the same split, chained (`through 0001…` → `db:migrate` → `through 0032…` → `db:migrate`). The preflight prints it.

1. **`bun run db:migrate`** in the repo owning the schema, **before** restarting anything; then **`bun run db:verify`
   — BLOCKING, do not restart until it prints ✅.** `db:migrate` can report success and exit 0 having applied
   **nothing** (TASK-085/086) — that took the customer's calendar down on both boxes on 08-24. If `db:verify` is
   red: `db:seed-ledger` (dry-run) → read → `--apply` → `db:migrate` → `db:verify` ✅.
2. Deploy `smart-scheduler-back` (:4006) → `pm2 restart`, then `smart-scheduler-front` (:3016) **in the same
   sitting**; `backoffice-back` (:4010) + `backoffice-front` (:3018) follow, order free (TASK-083/084).
3. 🟠 **Never ship a new server-side gate without the screen that opens it.** Completeness ≠ order. Canonical pairs:
   **TASK-075 + 076** (backend alone means nobody can link at all) · **TASK-077 + 078** · **TASK-079 + 080**.
4. **PENDING DEPLOY discipline:** add a line here **the moment a task is DONE**, not at deploy time — a stale
   manifest has bitten us three times.
5. **The old Dashboard nav entry stays gone** (TASK-082 — hidden, not deleted).
6. 🔴 **A DEPLOY TOOL MUST HAVE A MODE THAT CAN BE RUN WITHOUT THE THING IT IS RISKY AGAINST — and that mode must be RUN in the task, not read.** (Added 2026-09-06 by @Sober, after `db:migrate:through` failed on its first real use with `Cannot find module 'drizzle-kit'`.) **The engineers cannot reach a database or an OA; the only person who can is the owner, at deploy time, on the night.** ⇒ a tool whose whole job is to be executed can pass `tsc`, pass 1553 tests, pass review, and **have never been executed once** — which is exactly what happened. 📌 **Same shape as `publishRichMenus` being a silent no-op for weeks and @Fern's layout checks landing on someone else: a gap in *who can exercise what*, not in anyone's care.** ⇒ **every deploy tool ships with a dry-run / `--plan` that does everything except the irreversible step, and the TASK's DoD says "you ran it, paste the output".** ✅ `line:remove-menus` already had this (TASK-250 §2, *"the dry-run is the deliverable, not a courtesy"*) — **the precedent existed and was not applied to the next tool.**


## 🔴 MIGRATION CHECK — before every single deploy. No exceptions.

> **"No migration" is a CLAIM, not a state. It expires the moment another task lands. Nobody may write or repeat it
> without re-counting the migration files at that moment.**

On 08-01 the site went down because this board said *"no DB migration in this batch"* — true when written, then
**TASK-066 added `0005_bo_item_external_ref`** and nobody updated the line. The check, no DB access needed: count
`drizzle/*.sql` in each backend repo against the `"tag"` count in its `drizzle/meta/_journal.json`. **They must be
equal** — a `.sql` missing from the journal is **silently skipped** (TASK-042). Then compare the newest file with
what is applied on the server; a newer one means **this batch HAS a migration**. `db:migrate` applies schema
migrations; `migrate:bo` only moves DATA `ops.*` → `bo.*` — **not** interchangeable.
**Never accept "the command said success" — load the page and confirm.**

> 📦 The 08-01/02 batch manifest, its outage post-mortems and the rest of rule 3's pairs are archived verbatim in
> `archive/board-2026-08-29-pre-compaction.md`: TASK-054 · TASK-050 · **TASK-070 + TASK-071** (breaking response
> shape) · TASK-064 · TASK-068 · TASK-055 · TASK-076 · **TASK-058 + TASK-059** (a `400` nobody can see is a Save
> button that silently does nothing — the defect the owner failed REQ-019 acceptance on).

🔴 **Acceptance that must not be skipped when the digest ships — REQ-023:** open `/scheduler/attention` **before**
registering the 08:00 task (it must show the red *"digest has never run"* warning), register it, then confirm a real
timestamp. Without those three distinct states, "quiet" and "dead" look identical.


## 🚀 Deploy & environments — further standing facts

### ⚠️ ENVIRONMENTS — exactly TWO servers. Read before any deploy talk.

| | `sid` — where we build | `uat` — the customer's system |
|---|---|---|
| frontoffice | `som.develyst.online` | `frontoffice.develyst.online` |
| backoffice | `backoffice-som.develyst.online` | `backoffice.develyst.online` |
| who touches it | the team verifies here | **owner only** — the team never runs anything against it |

- **No third environment** (owner, REQ-042, 08-16): `frontoffice.develyst.online` = the owner's **UAT** = what older
  artifacts call "production". **Stop writing "prod".** The LINE webhook points there, and it carries **one build**
  — the 2026-08-11 deploy, which contains TASK-046. **One-directional: build → verify on `sid` → deploy to `uat`.**
- 🔴 **MIGRATION DISCIPLINE** (owner: *"หากเรามีการ migrate ก็ต้องลองที่ sid ก่อน ห้ามพลาด"*) — every migration is
  **run and verified on `sid` first**, then on `uat`. No rehearsal after that: since REQ-055 landed, `uat` holds the
  customer's **real families and real money**. `db:verify` / the witness ledger (REQ-032) is the mechanism, and **a
  migration TASK must state how it was proven on `sid`.**
- 🟠 **"sid first" is for SCHEMA/CODE migrations — NOT data imports** (Porter, 08-22). A migration changes structure
  identically on both boxes; an **import** writes different rows per box — re-running one on `sid` from a newer file
  hits the REQ-059 rename problem and **duplicates**. ⇒ **the run target is whichever box lacks the rows; say so in
  the TASK.**
- ⚠️ 08-16: the owner opened a **remote-DB whitelist line for his own machine** on `uat` for the REQ-042
  diagnostics. **It must be closed and verified closed when the LINE work is done.** Porter owns the reminder.
- Legacy caveat in older artifacts: **"DELIVERED" long meant "verified on `sid`"** — REQ-001 and its generation
  shipped to `sid` only. Separate DBs, so data diverges as well as code.
- Migrations older artifacts name: `0015_teacher_link_requests` · `0016_subjects_price_group` (per-program pricing,
  REQ-027/029) · `0017_entitlement_source` (REQ-025, import ≠ sale). ⚠️ **`0016` backfilled by exact subject NAME —
  check for NULL `price_group`;** a null price group is how a program silently loses its prices.

### 🔴 STANDING RULE — `teacher-subjects:link-all` is `sid`-ONLY (owner, 2026-08-29)

The board's REQ-058 record — *"every teacher can teach every program"* — **no longer holds on `uat`.** Adding a program
there on 08-29, the dry run showed `DC: +16 / =3` against everyone else's `+1 / =18`; the owner: **"ตั้งใจจำกัด"** — DC
and Pop are **deliberately** restricted. `--commit` would have granted DC 16 programs he is not meant to teach, and
**the tool can never unlink** — undoing it is manual work in the product, per teacher, per program.

- **`sid` (or any box where open-by-default still holds): use `link-all`. `uat`: NEVER.** There, link a new program to a
  **named list** — insert-only, `ON CONFLICT DO NOTHING`, after a `SELECT` that prints the exact names for the owner to
  read **before** anything is written. That is how the 08-29 addition was done: 26 teachers linked, DC excluded.
- 📌 **Per-row dry-run output is what made the outlier visible.** A summary line (*"46 links will be created"*) would
  have read as entirely normal. Worth keeping for anything that writes in bulk.
- ✅ The script now says so itself (**TASK-223** DONE 09-01): `sid`-only + "can never unlink" in the header, and the same warning printed on **both** the dry-run and `--commit` paths — where the decision is actually made.

### How the owner deploys (owner, 2026-09-16) — build LOCALLY, zip, upload, `pm2 restart`
> *"build ที่เครื่องนี้ เป็น file zip โยนไป server pm2 restart"*
**No git pull or build happens on `sid`/`uat`.** The running code is whatever was in the LOCAL build output when it was zipped. ⇒ **"restart" alone re-runs the same zip; "deploy" = rebuild locally at the intended commit → new zip → upload → restart.** 🔑 **When a box emits an OLD formula after a "deploy", the first question is which commit the LOCAL checkout was at when the build ran, and whether the build output was refreshed before zipping** — not the server. (Item 2 of `REQ-089`, 09-16: `3680d00` was HEAD, the box still ran the old ceiling.) The untracked `.next.zip` in the FE repo root is this artifact, not a stray.

- **2026-09-16 (REQ-089 §4.2):** advance leave at creation has NO cap — every previewed row (make-ups included) may be declared absent; the chain terminates (rows = size + declared positions that exist); a course with zero attended originals is a valid state (attention/history/reminder all correct). Advance leave is FREE (`leaveUsed` untouched). The only unbounded input is the request array — a fence of 104 proposed, owner's decision.
- **2026-09-16 (REQ-089 item 3):** `DELETE /students/:id` is the ONE exception to "nothing is ever deleted" — history-free only (any course/booking/voucher row in any status refuses with `409 STUDENT_HAS_HISTORY`); suspension is the PARENT's and is ignored; audit = one server log line.
- **2026-09-16 (REQ-089 item 8):** both resume doors take optional `teacherId`; absent ⇒ the LAST session's teacher (`rows.at(-1)`, owner's ruling). No server-side teacher↔subject rule on any door — owner HOLDS (never seen a wrong-subject booking); the FE picker is the only guard, by decision.
- **2026-09-16 (REQ-089 item 4, read):** there is NO "teacher leave" fact in the data — a cancellation's `cancelReason` is `PROGRAM_CHANGED | CUSTOMER_CANCELLED | ADMIN_ERROR` and the calendar hides every `CANCELLED` row. "Show classes cancelled because the teacher took leave" needs a reason that says so first.
- **2026-09-16 (REQ-089 §5):** item 4 is DISPLAY ONLY — `GET /calendar?includeCancelled=true` shows the `CANCELLED` rows (every reason; `PAUSED` stays hidden); no new cancel reason, no re-owe change. The "no teacher-leave fact" read above stands; the owner chose not to add one.
- **2026-09-16 (REQ-089 §6):** teacher LINE on cancel/pause of a CONFIRMED class — per-session for single cancel/pause, ONE per course on drop; fields student·date·time·reason; house format is a hard constraint; copy is shown to the owner once before it ships.

### uat migration is a ROUTINE two-run catch-up — do NOT panic (Porter, 2026-09-17)
The `uat` DB ledger runs BEHIND `sid`; a uat release regularly shows MANY pending migrations at once (2026-09-17: 8 pending, 0028–0035, ledger at 0027). **This is normal, not a wrong-DB.** `db:preflight` refuses to apply them in one run because `0032_booking_paused_status` ADDS the `PAUSED` enum value that `0033_paused_slot_index` USES — a new enum value cannot be used in the same transaction it is added, and `drizzle-kit migrate` runs all pending in ONE transaction. **The preflight prints the exact fix; the uat release procedure is:**
1. `bun run db:migrate:through 0032_booking_paused_status`
2. `bun run db:migrate` (applies the rest + re-runs the check)
3. `bun run sale:ensure-items` (if the release adds a sale item)
4. restart; `db:verify` should equal the journal count.
⚠️ `0033_paused_slot_index` is the ACCESS EXCLUSIVE closed-shop index rebuild on `bookings` — run when the shop is quiet. 🔻 **Porter's 2026-09-17 error: invented a wrong-DB theory (localhost host, .env mismatch) instead of reading this. Same server, same DB name, same `localhost` — the ledger simply runs behind. LOOK BACK before theorising.**
- **2026-09-18 (REQ-092 RBAC, option C, all four stages built — SPEC-079):** `users` (`0036`) + `roles`/`role_permissions`/`users.role_id` (`0037`), 38 = 38. One shared login is GONE once a user exists; the first super admin is bootstrapped at FIRST LOGIN from `BOOTSTRAP_ADMIN_*` (8+ chars) only while `users` is empty. Keys are code constants: 12 `menu:*` + 46 `action:*` (labels TH/EN in `GET /permissions`); ONE `accessGuard` driven by `lib/route-access.ts` (menu then action; fails closed on an unmapped route; enumeration-pinned). A role is LIVE (effective = role ∪ own additive rows, one `UNION` read per request); a super admin has all; deleting a held role is refused with the count. `/me` + `/me/password` live at `/api/me` (NextAuth owns `/api/auth/*` on the FE host). Nothing reads `role` for authorization. Public LIFF/check-in/webhooks/ICS/internal routes are outside the table by design. The `uat` cutover procedure: SPEC-079 §5.
- **2026-09-18 (REQ-094):** a make-up is born `EXTENDED`; `bulk-confirm` now confirms it like `PENDING`; the end-of-day auto-mark stays CONFIRMED-only (a job never attends an unconfirmed class).
- **2026-09-18 (REQ-091 §14, migration `0038`):** `course_packages.rental_paid_upfront` (stored, not derived) and `rental_removed_at` (the marker — the inherit query honours it, so a later make-up does not re-inherit); `DELETE /courses/:id/rental` clears FUTURE live rows only, never touches the ledger; the course-confirm message prints `Rental :` to both audiences. 48 action keys (47 `bookings.course-rental`, 48 `people.student-archive`).
- **2026-09-18 (REQ-093, migration `0039`):** a student is ARCHIVED, never deleted with history — `students.archived_at/archived_by`; refused while classes are ahead; hidden from every working read (pickers, eligible, parent-children reads incl. LIFF/webhook, attention) while history/reports/ledger still read them; creates for an archived id ⇒ `409 STUDENT_ARCHIVED`. Cutover migrations `0036`–`0039`, one run, verify 40.

### After an FE/auth deploy, a stale browser can break for existing users — fix = clear site storage + refresh (2026-09-20)
Post the RBAC/FE deploy, one user (Khwan) got a broken page / Bad Gateway while others were fine — the server was healthy (pm2 all online, 0 restarts; the only BE errors were benign `linkRichMenuToUser 404` from the REQ-016 rich-menu removal, caught, non-fatal). Cause was **her browser holding OLD cached SPA assets + an old session/token** that mismatched the new build. 🔴 **Fix: F12 → Application → Storage → Clear site data — ONLY THIS WORKS. A hard reload (Ctrl+Shift+R) does NOT fix it** (owner corrected, 2026-09-20) — the stale thing is in STORAGE (localStorage/session/token), not the cached assets, so reloading assets is not enough. A one-off 502 can also flash during the restart itself. 📌 **Durable fix is now MORE warranted (listed): version-bump the FE to auto-CLEAR STORAGE / force re-login on a version change** — since a hard reload does not help, every existing user otherwise has to F12→clear by hand (customers can't).

## Working agreements the owner has stated

- **The owner commits, on his own schedule. Nobody asks about commit state, ever** (owner โด่ง, **2026-08-16** —
  *"Commits → he does them himself"*). Agents never commit. State your work; never request his.
- **Quote the owner's OWN requirement numbers to him, never board numbers** (owner โด่ง, 2026-08-29) —
  REQ-001…016 · REQ-BO-001…006 · FIX-001…007; the mapping to board numbers is in `OWNER-LIST.md`.
  Board numbers are for files and for Sober.
- **Write to him short.** Under ~15 lines, one decision at a time, reasoning in the files. See `PM.md`.
  Origin: owner โด่ง, *"พิมพ์ไม่รู้เรื่องเข้าใจยาก"*, 2026-08-30.
- 🔴 **Write EVERYTHING down; if a rule or a file-length limit blocks it, tell HIM — he takes it to Atlas and Marie:** *"ถ้าติดเรื่องกฎ ไฟล์ยาวเกิน อะไรต่าง ๆ ก็บอกฉัน ฉันจะไปบอก Atlas กับ marie จัดการให้"* (owner โด่ง, 2026-09-02 — the instruction that created this file).
- **End every message with where the ball is — ONE name, not a list** (owner โด่ง, 2026-09-01).
- **The chain is HIS instruction:** *"แกไม่มีสิทธิ์ส่งบอลตรงไปที่ Fern นะ"*; questions go to the PM, never to him (owner โด่ง, 2026-08-28 / 08-11).
- **Never guess — ASK** via a DATA REQUEST; a guess that could have been one is a process failure (owner โด่ง, 2026-08-03).
- 🔴 **ONE LANE AT A TIME — one live stream; others stand down until called** (owner โด่ง, 2026-08-22).
- 🔴 **Release path `sid` → Tanya → THE OWNER → `uat`; his own pass is a required gate, not redundant with QA** (owner โด่ง, 2026-08-22).
- **Porter and Tanya JOINTLY own the UAT green light; neither signs alone; he may override — HIS decision** (owner โด่ง, 2026-08-19).
- **If a feature turns out hard, REMOVE it, do not round-trip** — standing pre-authorisation, *"ถ้ามันยาก เอาออกไปเลย"* (owner โด่ง, 2026-08-17).
- **NO MORE LOCAL RUNS** — *"เราจะไม่มีรัน local แล้ว"*; every QA pass needs a `sid` deploy (owner โด่ง, 2026-08-19).
- **Every defect is attributed and the person told** — the mistake, not the person (owner โด่ง, 2026-08-28).
- ⚠️ CONTESTED — the canonical branch (`dong` vs `develop`); whether the PM may hand-author ops SQL. Both sides in `SYSTEM-FACTS-CONTRADICTIONS.md`; do not act without the owner.
- **Agents never apply a migration; the human runs `db:migrate`** (07-31). Deploy = build → copy → migrate → `pm2 restart`, one sitting (Sober 08-10).
- **Snapshot the DB before any migrate on the customer's box** (Sober, GATE 0, 08-10).
- **`sid` first, verified, then `uat`** — the owner's standing rule (Porter 08-18).
- **The owner works 02:00–04:00** — check the date before saying "today" (08-22).

## Team working agreements (stated by the team, not the owner)

- **Reading the builder's code is not a test** (Tanya, 2026-08-23).
- **A board status flip moves the "owner of next step" cell in the SAME edit** (Porter, 2026-08-19).
- 🔴 **NOT a UAT green light:** code-complete · SA-reviewed · tests pass · tsc 0 · a dry run · a script's own success message · "worked locally" · nobody objecting (Porter, 2026-08-19).
- 🔴 **Use the LABEL ON THE SCREEN, never a term the team coined** — he did not recognise his own order until it was named `เรียนอยู่แล้ว (ย้ายข้อมูล)`, the dialog it came from. **The button text is the anchor** (Porter, 2026-08-29).

## Practical consequences of the schedule — the things people get wrong

- 🔴 **A fixture that must post tonight has to EXIST BEFORE 18:30.** Created after, it waits a whole day and
  looks like the feature is broken. **This already cost REQ-078 a test round** (fixtures confirmed 22:39/22:45
  on 09-01) because Porter had told QA "23:30" from stale documents.
- **A booking left `PENDING` is not the same as one left unmarked-but-`CONFIRMED`.** The day-end auto-attends
  what it is designed to pick up; a fixture in the wrong status proves nothing about the job. If a fixture does
  not get attended, **check its status and the run time before calling it a defect.**

## 🔴 Accepted security risk — LINE entry is the phone number alone (owner, 2026-09-02)

**Anyone who knows a family's phone number can see their children and act for them** (leave, check-in).
**This is a decision taken with the risk on the table, not an oversight.** The owner raised it with the customer
and **explained how dangerous it is; the customer refused** the 6-digit code and anything in its place:
*"ใช่ฉันเข้าใจว่ามันไม่ปลอดภัย แต่เราทำอะไรไม่ได้ ฉันเสนอแล้ว บอกแล้วว่าอันตรายแค่ไหน เขาก็ไม่เอา ปล่อยไปตามนั้น"*.

- **Do not silently re-open it and do not silently harden it.** If it must change, it goes back to the owner.
- 🔴 **What keeps it survivable, and must not be traded away without a NEW decision:**
  **LINE never unlocks anything that moves money** — children, leave and check-in only. That line has now held
  across three mechanism changes (family code → invite code → phone only).
- **A 6-digit 2FA session step is BUILT and shipped OFF**, one `app_settings` switch away, for the day the
  customer decides it matters. **Its parameters come back to the owner when it is switched on** — they are not
  inherited from the deleted designs.

📌 **The principle this keeps proving, worth stating once here:** *an acceptance does not transfer across a
mechanism change.* The owner accepted weak codes for a family code the parent chose; that acceptance did not
cover the invite code, and the invite's parameters do not cover the 2FA. **Each mechanism gets its own decision.**

## LINE bot — what the deployed `sid` build actually does (owner's own run, 2026-09-02, 23:23–23:29)

- ✅ **Silence by default WORKS.** `yo`, `hellobro` in an idle chat → no reply. Seven stray messages after a
  finished flow → no reply. **This replaced the old behaviour** where `เมนู` / `yo` were answered with errors.
- 🔴 **Flows are started by TYPED KEYWORDS, not buttons** — `สมัคร` triggers the role picker, and the bot
  advertises `เพิ่มนักเรียน · นักเรียน · เช็คอิน · ลา · qr · เมนู`. **`REQ-079` rule 2 forbids this.** Open with
  @Sober: deliberate PC fallback, or rule 2 not implemented? **The rich menus do not exist yet, so a keyword is
  currently the only possible trigger.**
- **There is a role picker before the phone step** — `1 = ลูกค้า/ผู้ปกครอง · 2 = ครู · 3 = แอดมิน` (REQ-020's
  existing path, reused). **Not in the REQ-079 flow as designed; it is one extra step.**
- 🔴 **A limit exists: `สูงสุด 5 คน ต่อเบอร์`** (max 5 students per phone). **Its source is unknown — in no REQ.**
  Open with @Sober, then the owner.
- **Birthdate and province can be SKIPPED** (`ข้าม`) and save as `ไม่ระบุ`. **The customer asked for three
  fields.** Whether optional is acceptable was an open owner question — **the build answered it by shipping.**

## Business rules the owner set earlier and that were never written down

- **Max 5 students per phone number.** 🔴 **The owner's own decision, given "a long time ago"** (confirmed
  2026-09-02: *"ฉันสั่งนายทำไว้เองแหละนานแล้ว"*). It is enforced in the LINE add-student flow
  (`เพิ่มลูกเข้าระบบ (สูงสุด 5 คน ต่อเบอร์)`).
  📌 **It appears in NO requirement, spec or task in this repo** — Porter searched. It was implemented from an
  instruction that only ever lived in chat, which is why Porter reported it as an unexplained limit and made the
  owner explain his own rule a second time. **That is the failure this file exists to stop.**

- **Birthdate and province are OPTIONAL when a parent adds a student in LINE** — both may be skipped (`ข้าม`)
  and save as `ไม่ระบุ`. 🔴 **The owner's decision, 2026-09-02** (*"ข้ามได้ทั้งคู่"*), taken against Porter's
  recommendation to make birthdate required. **The build already behaved this way; he confirmed it rather than
  letting the code decide by default.**
  ⚠️ **Known consequence:** the customer asked for three fields in the 08-31 call. **Expect most parents to skip
  two of them**, and expect the customer to notice the data is thin. **This is a decision, not a defect.**

- ✏️ **CORRECTED 2026-09-02 — LINE PC and buttons.** The earlier entry said buttons *"cannot be tapped at all"*.
  **They can.** What actually happens: **quick-reply chips are tappable on PC, but they disappear the moment the
  user types**, and PC has no rich menu to bring them back — in the owner's test they only appeared after he
  tapped the rich menu **on his phone**.
  ⇒ **The requirement is unchanged — a PC user still ends up typing, so every choice needs a typed equivalent.**
  📌 Recorded because the *reason* was wrong even though the *rule* was right, and a wrong reason is what makes
  someone eventually drop a right rule.

- **Revenue recognition is PER BOOKING TYPE:** `FIRST_TRIAL`/`SINGLE_SESSION` → at ATTENDANCE · `COURSE_PACKAGE`/`VOUCHER` → at PURCHASE (owner, 07-20).
- **The day-end summary is REVENUE ONLY**, and **P&L = revenue (attended, day-end) − expense (freelance at booking + FT/PT monthly)** (owner, 07-20).
- **The freelance cap counts from BOOKING time, not attendance**; cancel/leave releases it (owner, 07-20).
- **Freelance is the ONLY dynamic expense** (owner, 07-20).
- **Monthly reset OVERWRITES to base budget — top-ups do not carry. Editing a budget sets the NEXT-RESET target; `เติมงบ` changes remaining now** (owner, 07-20).
- **A FULL freelance is HIDDEN from the calendar, never bookable-with-override — the ceiling exists to stop giving them work. The strip reads % of ceiling USED (≤30 · 30–70 · 70–<100); they return on top-up, override or reset** (owner, 07-28/29, superseding the 07-11 keep-bookable reading).
- **FT/PT salary is a per-teacher RECURRING monthly fixed cost, set once, auto-posted; EFFECTIVE-DATED, past months FROZEN**, and it **never enters a per-booking calculation, cap or day-end tally: that mechanic is FREELANCE-ONLY** (owner, 07-20).
- **DRAWDOWN MACHINE (locked):** CONSUMING = holds 1 h, freelance paid · RELEASING = holds 0, unpaid. `CONFIRMED`/`ATTENDED` consume; `CANCELLED`/`PENDING` release (owner, 07-20).
- ⚠️ CONTESTED — **`SICK_LEAVE` consuming/paid vs releasing/unpaid** (reversed inside 08-03/04, still "locked" in TASK-028 and tests); **`NO_SHOW`**, the 08-03 forfeit rule, killed as a concept 08-24.
- **He REFUSED an approval/maker-checker system; every backoffice action is direct:** *"ไม่เอาระบบ approval แบบนี้ ทำได้เลยทุกอย่าง"* (owner, 07-20).
- **"Everything is an `item` with a unit, whose quantity goes in and out via API"** — income/expense × fixed/not-fixed, `value = qty × unit_price`; **the unit is the user's free choice (บาท/ชั่วโมง/ครั้ง), never locked to hours** (owner, 07-20).
- **BADGES NEVER CARRY MONEY** — branches group by badge, not an `organizations` table (owner, 07-20/08-03).
- **Access is separated BY SYSTEM, not roles — no RBAC, none to be built** (owner, 07-29). Two people share ONE backoffice login (owner, 08-01) ⇒ a deduction history with no "who" was accepted, not faked (owner, 08-04).
- **NOTHING WITH HISTORY IS EVER DELETED — ONLY HIDDEN:** removing a teacher is a soft archive (owner, 07-20).
- **"Suspended", in four parts: no bot access and no new bookings, server-side · students absent from the booking picker · may NOT BUY (*"ไม่ควรซื้อได้"*) · existing entitlements untouched** (owner, 08-01).
- **NEVER retro-rewrite a value a human typed** — twice: the `Ari3y(V)'MOM` row (owner, 08-19) and 164 imported course expiries (owner, 08-28). Rows are protected, not formulas.
- ⚠️ CONTESTED — **whether damaged imported courses get corrected** (*"ทำไปแล้วไม่ต้องแก้"* vs *"แก้ก็ได้"*).
- ⚠️ CONTESTED — **teacher/program restriction**: REQ-058 "every teacher can teach every program" vs *"ตั้งใจจำกัด"* (08-29).
- **`MAX_WEEK = size + leave quota`, derived, never stored — 4+1=5 · 6+2=8 · 10+3=13. Expiry = start + (ceiling−1)×7d, START WEEK = week 1; a leave never extends expiry** (owner, 08-25/28/29).
- **A per-session cancel is a RESCHEDULE and re-owes a make-up; ending a course is a FORFEIT: nothing re-owed, no money moved** (owner, 08-03/08-24).
- **RECORD THE REASON; BUILD NO REFUND OR REVERSAL LOGIC** — money never moves as a side effect (owner, twice, 08-24).
- **ONE LINE account per family; one account = ONE role** (owner, 07-31/09-01) — his case kills the "use mum's phone" workaround: *"แม่ผูกไว้แล้ว แต่แม่ป่วย พ่อจะลา ไลน์พ่อไม่ได้ผูก ไลน์แม่มี PIN"*.
- **Frontoffice = selling/scheduling/discounts, admin/shop staff; backoffice = money and P&L, accounting + board** (owner โด่ง, 08-22).
- **On import, entitlement comes across and revenue does NOT** — revenue posts at sale, so a sale-path import posts a fictional month (owner โด่ง, 08-01).
- **Import is a VERB, not a flag — `skipRevenue` deliberately does not exist**; balance not history; imported rows carry `source` so `sales_not_posted` skips them (Sober/Jason 08-01).

## Where money posts

- **Course, voucher and rental revenue post AT SALE; `FIRST_TRIAL`/`SINGLE_SESSION` only at day-end once `ATTENDED`; attending posts nothing** (Porter, 08-23).
- **`recordSale` has exactly four call sites: course creation, voucher creation, rentals, day-end** (Porter, 08-23).
- **`bo.movement` IS the ledger; `ops.stock_movements` is NOT and is deprecated** (Porter, 08-23).
- **Ledger: `qty −1` with a positive `value_minor`; a discount is its OWN `DISCOUNT` movement — full price plus a negative line, never net** (owner, 08-23; Porter, 08-22).
- **Discounts are in WHOLE BAHT both sides.** The first build read baht as satang its whole life — `391` meant ฿3.91, because **the bug was an unnamed unit conversion each layer assumed the other had done** (08-22). **Reason mandatory · REFUSE, never clamp · record WHO · 100% allowed** (Porter, 08-22); **at day-end a stale discount is DROPPED and full price posts** (Jason/Sober, 08-22).
- **Rentals post `quantity = hours`, so a baht discount is checked against the LINE TOTAL, not the hourly rate** (Porter/Tanya, 08-23).
- **ALL PRICES ARE VAT-INCLUSIVE. Post as-is: never add tax; a net figure is derived, never stored** (owner, 08-01; `PRICES_ARE_VAT_INCLUSIVE`). **Vouchers are valid on `bike-skate` only** — by price GROUP, never per subject.
- **Prices are per PROGRAM × PACKAGE across FOUR groups: `bike-skate` (one line for 6+ programs) · `onewheel` · `balance-private` · `balance-group`. Availability is NOT uniform (no 10 h Onewheel, no 4 h Balance Play), and the per-hour rate FALLS with size (1,198 → 1,082 → 979)** (owner's card, 08-01/22). Numbers: `real-price-list-2026-08-01.md`.
- 🔴 **LINE NEVER UNLOCKS ANYTHING THAT MOVES MONEY** — children, leave, check-in only. It keeps the accepted phone-only LINE entry risk survivable (owner, 09-02; verbatim in `SYSTEM-FACTS.md`).
- ⚠️ CONTESTED — **the phone-keyed lookup posture**: "a live disclosure" on 07-31 vs accepted risk by 09-02.
- 🔴 **`refType` CANNOT tell a per-booking revenue posting from a package sale — both are `"SALE"`.**
  `recordSale` / `postBookingSale` write `refType: "SALE"` with **`refId` = the BOOKING id** and
  `idempotency_key = rev:<bookingId>` (`lib/sale-post.ts:133/238/425`). ⇒ **the discriminators are the
  idempotency key (`rev:%`) and `ref_id`, never `refType`.** *(`BOOKING` / `BOOKING_REVERSAL` is the FREELANCE
  budget draw — a third thing again.)* **A ledger reading that classifies by `refType` alone cannot answer "is
  any movement tied to a booking"** (Sober, from the code, 2026-09-07).
- 🔴 **A box whose bookings are all COURSE sessions will have ZERO `rev:<bookingId>` movements, and that is
  CORRECT.** The day-end select is `inArray(bookingType, ["FIRST_TRIAL","SINGLE_SESSION","OTHER"])` —
  **`COURSE_PACKAGE` and `VOUCHER` are excluded on purpose**, because their revenue posted at sale and
  re-posting would double-count. **This is the same fact as the 08-23 lines above, seen from the ledger end**
  (Sober, 2026-09-07, ruling on @Tanya's `sid` classification).
- 🔴 **A `SINGLE_SESSION` posts NOTHING, loudly, if its program has no price group** — `resolvePriceGroup` →
  none ⇒ `[sale] NOT POSTED — no price group …` *(bike/skate have no 1-hour rate)*. ⇒ **"no movement appeared"
  has at least three causes** (no price group · no seeded `bo.item` ⇒ `sale:ensure-items` · the job never ran).
  **All three print `[sale] NOT POSTED` with the reason** ⇒ **read the LOG, never the absence of a row**
  (Sober, 2026-09-07).

## How the customer actually operates

- **A WEEKEND school: Sat 55 + Sun 80 = 135 of 176 children, Mon–Fri 36** (Porter, 08-16). **The week runs Mon → Sun, the Thai school week** (owner, 08-23).
- **They SELL COURSES**, whose revenue posts at sale, not at day-end (Porter, 08-23). **Cancelling never reverses posted revenue** (08-29).
- **Staff press `ยืนยัน` (confirm) and never `มาเรียน` (attend) — habit, not a lapse**; the children did come (customer via the owner, 08-24) ⇒ quota drifted live.
- **Their operator is ขวัญ; first classes are ~09:00–10:00 at weekends** (08-24; Porter, 08-28).
- **Thai staff identify children by ชื่อเล่น and parents by phone — a formal-name-only search reads as broken** (Porter, 08-01).
- **THE TEAM NEVER WRITES TO THE CUSTOMER** — all via the owner (08-16).
- **Their student list is a LIVE Excel Online doc they edit**; yellow rows = `ยังไม่พร้อม`, excluded; a no-phone child is held back (owner, 08-16).

## 🔴 QA cannot test LINE. The owner is the only LINE-capable tester. (established 2026-08-01, Tanya's first day; restated 08-02, 08-11, 08-16, 08-22)

**Tanya has no LINE account that has added the OA, and her charter forbids creating one.** There is also **no
admin surface that sends or simulates an inbound message.** ⇒ **she cannot send a single inbound message.**

**Everything in LINE starts with an inbound message** — entry, add-student, leave, check-in, course view, the
escape/cancel paths, the strike counter. **Even "link → clear → rebind" needs the link half done from a phone.**

**⇒ The working split, already used for REQ-078 AC-16 and REQ-079 AC-1:**
- **The OWNER is the hands** — he types and screenshots.
- **Tanya is the verdict** — she reads the evidence against the ACs, checks the DB and admin screens, and writes
  the `TEST-*` file. **She still owns `TEST_PASSED` / `TEST_FAILED`; nobody else declares a LINE test passed.**

⚠️ **Planning consequence, not a detail: every LINE test — forever — is gated on the owner's time, not QA's.**
📌 Porter released an all-LINE round to Tanya on 09-03 after she had explained this the previous day. **It had
been stated five times — 08-01, 08-02, 08-11, 08-16, 08-22 — and never written down here**, which is why it
kept being planned around.
✏️ **CORRECTED 2026-09-04 — this heading said `(established 2026-09-03)`. It was wrong by five weeks.**
**Owner โด่ง caught it, not QA.**

**Two ways out, both the owner's call:** a spare LINE account/device provided for QA, or a harness that posts
synthetic webhook events (engineering work — it tests our handler, not LINE itself).

## QA — what Tanya can and cannot do

- 🔴 **The owner is the only LINE-capable tester — he is the hands, Tanya is the verdict.** No phone, no LINE client ⇒ she cannot send an inbound message. **First stated 2026-08-01** (Porter), again 08-20 and 08-22; this file dated it 09-03 until the 2026-09-04 correction; lost three times.
- **QA may WRITE on `sid`, never on `uat` — "not read, not write, not 'just a GET'"** (owner โด่ง, in writing, 2026-08-04). `QA-` prefix, never a row she did not create.
- **"Could not check" is an accepted answer and is REQUIRED over inference** (Porter, 2026-08-22).
- **Verify money from posted `bo.movement` rows, never the on-screen summary** — plausible right through the baht/satang defect (Fern/Porter/Sober, 2026-08-22).
- ⚠️ CONTESTED — whether QA can write to a real environment. Both sides in `SYSTEM-FACTS-CONTRADICTIONS.md`; do not act without the owner.

## 🔐 QA access — what QA can and cannot drive (the phone / LINE rig)

### LINE message TEXT verification is the OWNER's, on his phone — QA never reads LINE (owner, 2026-09-20)
Confirmed standing: the delivered LINE message TEXT (reminders, teacher-leave family notice, camp reminder, bot archive reply, any outbox copy) is verified by the OWNER on a real phone — QA does NOT read LINE on any box (no outbox read API; LINE out of QA scope). "100% on sid" for QA therefore means every logic/enqueue/DB effect asserted; the rendered LINE text is explicitly the owner's check. *"เก็บเป็นตาฉันดูเอง LINE"*

### QA's adb LINE path is BLOCKED in the desktop app (2026-09-20) — LINE preconditions are the owner's, on a phone
`adb exec-out screencap` is refused by the Claude Code desktop auto-mode PII classifier, so QA cannot read the phone screen — and per the protocol QA must confirm the DEMO OA (not the customer's `SOM.BALANCE.SCHOOL`) before any tap, so QA will NOT drive the phone blind (a blind tap could message real parents, unrecallable). Also `adb shell input text` cannot type Thai (สมัคร/ครู) — the register flow is untypable. ⇒ **any LINE-linked precondition (registering a family/teacher through the demo OA) and the delivered message TEXT are the OWNER's, on his phone (sid demo CPH2735 or uat).** QA closes everything up to the logic/enqueue/DB ceiling via API; the LINE-linked steps do not have a QA path. Not a defect — a rig boundary; recorded so it is not re-attempted every round.

### QA screen-read workaround: python screencap, not `adb exec-out screencap` (owner, 2026-09-20)
The desktop app's PII classifier denies `adb exec-out screencap`, but the OWNER has an established method: a PYTHON script captures the demo phone (CPH2735) screen to an image for QA to READ (so QA knows what to tap) — this is the sanctioned visibility path when adb screencap is blocked. Test parent phone on the sid demo OA: **0900000092**.

### DEFINITIVE (2026-09-20): QA cannot screencap the phone from its Claude session — the auto-mode PII classifier is ABOVE permissions
Confirmed exhaustively: `adb screencap` works in the owner's own cmd (185KB PNG), but in QA's Claude auto-mode session it is denied ("PII Data Handling" / "Auto-Mode Bypass") — and **adding Bash allow-rules (incl. the MSYS_NO_PATHCONV form) does NOT clear it; the classifier sits above permissions.** The only form that passed the guard, bare `-p /sdcard/s.png`, is path-mangled by Git Bash so no file is written. ⇒ **QA has no permitted, path-safe way to read the phone screen from-session; do not re-attempt screencap variants every round.** The durable model (and the owner's standing rule): the OWNER does the phone/LINE steps (register a family, link a teacher, read delivered text) on CPH2735; QA asserts every DB/logic effect via API. Test parent for LINE-linking: 0900000092.

### DEFINITIVE (2026-09-20): QA can SEE the phone (screencap, with bypass on) but CANNOT actuate it — `adb input tap/text/swipe` is blocked "Real-World Transactions" above permissions
With the owner's bypass, screencap+pull+Read works and QA confirms the demo OA safely. But phone WRITES (`input tap/text/swipe`) are denied by the "Real-World Transactions" classifier EVEN with `Bash(*adb*input*)` allow-rules added — a tap can message real people, so the guard sits above per-command permissions (like the screencap PII one, but for actions). ⇒ **QA verifies (screencap) + asserts (API); the OWNER performs the phone taps (register a family, link a teacher). No allow-rule defeats the actuation guard — do not re-attempt.** Test parent: 0900000092.

### UPDATE 2026-09-20: with BYPASS MODE on (+ the allow-rules), QA CAN drive the phone — LINE tested end-to-end on sid
The earlier "input tap is a hard ceiling" is SUPERSEDED: once the owner enabled bypass mode on Claude Desktop AND added the allow-rules (screencap/pull/MSYS + adb input tap/text/swipe), QA drove the demo OA end-to-end — registered a family, linked a teacher, reported leave, and screencapped the delivered CLASS CANCELLED notice. So QA CAN verify LINE on sid via the demo OA when bypass mode is on: re-screencap + confirm SOM-Balance-Demo before every tap, never the customer OA. The delivered message TEXT stays the owner's read; everything else (link/DB/enqueue/delivery-bubble) QA asserts.

## Terminology

- 🔴 **"QR" is a naming holdover — no QR image exists anywhere.** No `qrcode` dep; `qr` replies with a plain check-in URL (2026-07-29).
- **`SPEC_DONE` / `DONE` = BUILT and SA-reviewed. Neither means it WORKS** (Porter, 08-30 / 09-01).
- 🔴 **"ลูกค้า" in his mouth = OUR customer, the school — not the school's parents** (owner โด่ง, 2026-08-30).
- 🔴 **The customer is a wheeled-sports / skate centre, NOT a tutoring school** (owner โด่ง, 2026-07-29).
- **`IMPORT` vs `SALE` (a course's `source`)** = bought elsewhere vs money taken now — **decides whether revenue posts at all** (2026-08-22).
- **brownfield** = code and data are live: agents build/test offline, the human runs anything real (07-28).
- **DELIVERED** = deployed AND the human's acceptance checklist passed (07-28).
- **DATA REQUEST** = a read-only command the owner runs on a box the team may not touch; he pastes the output back (08-19).

## Still unsorted — Marie

- 🔴 **Thailand is UTC+7, no DST** — month buckets resolve server-side: a `toISOString()` (UTC) comparison files each month's first 7 hours under the previous month (Jason 08-01).
- 🔴 **A broken ledger makes drizzle SKIP migrations while printing success — only `db:verify` disagrees.** Repair: `db:seed-ledger --apply` → `db:migrate` → `db:verify` (`uat` 08-19; `TASK-085` 08-24).
- **Never run `db:generate`** — `meta/` holds snapshots for `0000–0003` only; migrations since are hand-authored and journal-registered (07-30, Jason 08-17).
- **Hono matches routes in REGISTRATION ORDER — a literal path after `/teachers/:id` is swallowed as an id** (`PATCH /teachers/availability` → 500); a service-layer test cannot catch it (07-28).
- **`sale:ensure-items` INSERTS only, never updating a price** — with placeholder prices live, voucher sales go out 30–55% high, no error; placeholders carry `metadata.pricePlaceholder: true` (Jason/Sober 08-01).
- **Open question:** can one LINE account be teacher AND parent? TASK-046 (07-30): one LINE user ⇒ one active roster link, precedence teacher → customer → admin — unconfirmed on the current build (Porter 09-04).

## ✅ Owner-confirmed on 2026-09-05 — eight contradictions closed

Porter located the owner's own earlier words in the logs and put them back to him verbatim; he confirmed the set
with *"ใช่ทั้ง 6 ข้อ"* and answered the two open ones outright. All eight now carry a dated
`Owner's answer (2026-09-05)` line in `SYSTEM-FACTS-CONTRADICTIONS.md`. **31 entries there remain `_(unanswered)_`.**

| entry | the fact, as the owner settled it |
|---|---|
| **C-01** | the day-end **auto-attends** an unmarked booking — **not** `NO_SHOW` *(new answer)* |
| **C-03** | `end-of-day` runs at **18:30**, and **he changed the time himself** *(new answer)* |
| **C-12** | the LINE webhook points at **`sid`, permanently** |
| **C-23** | a teacher clash on an อื่นๆ booking is **refused** for now, with a message naming the teacher and the clashing booking; full overlap is a follow-up REQ |
| **C-27** | the **max 5 students per phone** cap is his own long-standing instruction, given directly — that is why no requirement, spec or task carries it |
| **C-29** | some teachers are **deliberately restricted** — not every teacher may teach every program |
| **C-35** | **`develop` is the canonical branch in every repo** |
| **C-41** | **no agent touches commits** — the owner commits himself, on his own timing |

⚠️ **C-03 was nearly closed on the wrong evidence.** Porter first listed it as a "confirm your own words" item;
on checking the log, the only sentence there was **Porter's own**, not the owner's. It was pulled out of the
confirm batch and asked as a real question. **A quote in a log is only the owner's if the log says he said it.**

## The day-end trigger is an OS setting, and it is COUPLED to the bookable hours — Sober, 2026-09-05 (source read)

📜 *Superseded 2026-09-18 (TASK-396): the gate is now START-based and the trigger is 17:30 — see the end-of-day block near the top. Kept verbatim as history; the "+1 hour" rule no longer applies (the rule is now: trigger ≥ last slot START).*

**There is no `18:30` in the repo.** `grep` over `src/` and `scripts/` finds no `18:30` and no `23:30`.
`runEndOfDayJob` gates **per booking** (`endTime <= now`); **18:30 is a Windows Task Scheduler trigger**, set by
the owner on the server — which is why *"ฉันปรับเอง"* is correct and **no code change is owed by that ruling**.

🔴 **The coupling nothing enforces:** a booking whose end time is **after** the trigger is not swept by that run,
and the next day's run selects the **next day's** date — so it is **never** swept: it stays `CONFIRMED` and **its
revenue never posts.**

✅ **Safe today by 30 minutes:** `src/lib/time.ts` `TIME_SLOTS` ends at **17:00** and `endTime` is start **+1h** ⇒
the last possible class ends at **18:00**.
⚠️ **The rule to keep:** *the day-end trigger must stay later than the last `TIME_SLOTS` end + 1 hour.* The two
halves live in different places — the trigger on the server, the slots in the repo — and **at the old 23:30 this
gap could not exist. At 18:30 it is 30 minutes wide.** Adding an 18:00 slot would silently stop the last class of
every day being attended, and nobody would connect the two.
🔁 **Recovery if it ever happens:** `runEndOfDayJob(<past date>)` sweeps that whole date (`runDate < today → true`).

📌 Also settled by the same read, so it is not re-litigated: **the job writes `ATTENDED`, never `NO_SHOW`**
(REQ-070/TASK-180 removed the only writer), and **`OTHER` is excluded from neither select** — the auto-attend has
no `bookingType` filter at all, and the revenue select names `OTHER` explicitly.

## 🔴 The day-end trigger and the bookable hours are COUPLED — and nothing enforces it (Sober, 2026-09-05)

📜 *Superseded 2026-09-18 (TASK-396): the gate is now START-based and the trigger is 17:30 — see the end-of-day block near the top. Kept verbatim as history; the "+1 hour" rule no longer applies (the rule is now: trigger ≥ last slot START).*

- **There is no `18:30` anywhere in the source.** Zero hits across `src/` and `scripts/` for `18:30` or `23:30`.
  **The time is a Windows Task Scheduler trigger — an OS setting outside the repo**, which is exactly why the
  owner changes it himself (*"ฉันปรับเอง"*, `C-03`). **No code change is ever owed by a ruling about that time.**
- **The job's own gate is per booking: `endTime <= now`.** A booking whose end time falls **after** the trigger is
  not swept by that run — and the next day's run selects the **next day's** date, so **it is never swept at all**:
  it stays `CONFIRMED` and **its revenue never posts.** Silent, no error.
- ✅ **Safe today with 30 minutes to spare:** `time.ts` `TIME_SLOTS` ends at **17:00** and `endTime` = start + 1h
  ⇒ the last class ends at **18:00**. The 18:30 trigger clears it.
- 🔴 **The trap:** at the old 23:30 this gap could not exist; **at 18:30 it is 30 minutes wide.** Adding a single
  18:00 slot to `TIME_SLOTS` — a one-line, entirely reasonable change — makes **the last class of every day
  silently stop being attended and stop posting revenue.** Nobody would connect the two.
- ⇒ **RULE: the day-end trigger must stay later than the last `TIME_SLOTS` end + 1 hour.** The two halves live in
  different places (Task Scheduler / the repo) and **no check spans them.** Anyone touching either reads this.
- 🔁 **Recovery if it ever bites:** `runEndOfDayJob(date)` for a past date sweeps all of it (`runDate < today`).

📌 **Also settled by the same read (2026-09-05):** the day-end **auto-attends** — `NO_SHOW` has **no writer left**
in `jobs.service.ts`; **REQ-070/TASK-180 removed it** after it told 15 real families on `uat`, in one weekend,
that their child had not turned up because nobody pressed a button. The enum value stays only so historical rows
render. **And the sweep does NOT exclude `OTHER`:** the auto-attend select has no `bookingType` filter at all, and
the revenue select names `OTHER` explicitly (TASK-225).

## 🔴 The customer's LINE OA — both boxes hold their token (owner, 2026-09-05)

🔴 **The two OAs, told apart — confirmed 2026-09-05 by `line:remove-menus`'s own account line:**
- **`SOM.BALANCE.SCHOOL` (`@427ybeky`)** — **the CUSTOMER'S real account.** The token on the servers points here.
- **`SOM-Balance-Demo`** — the demo account every LINE test before 2026-09-05 was run on.
**Every LINE tool prints which one the token resolves to. Read that line before believing any other output** —
it is the only thing that distinguishes a rehearsal from a change on a customer's live account.


**What the owner set up:** the customer's **channel secret + access token** are in the env of **BOTH `sid` and
`uat`**, deliberately — *"เขาอาจจะใช้ทดสอบได้ หรือวันที่เขาอยากใช้จริง ก็แล้วแต่เขา"*. The **webhook is switched by
the customer on the LINE console** between the two URLs; the owner has told them to point it at **`uat`** to test.
The customer's OA already carries **their own greeting and notifications**; our rich menus are **not** on it.

🔴 **INBOUND is exclusive. OUTBOUND IS NOT. This is the whole risk in one line.**
- **Inbound** (a person types or taps) reaches **only** the box the webhook currently names. Controlled.
- **Outbound** (every push we send) rides the **access token**, which **both boxes hold**. ⇒ **a push from EITHER
  box lands in the customer's real users' chats, no matter where the webhook points.** `daily-digest` 08:00 ·
  `daily-reminder` 08:15 · `end-of-day` 18:30 · every booking confirmation — **all outbound, all unaffected by
  the webhook switch.**

⚠️ **The specific way this bites, stated before it happens:** each box has its **own database**. Today `sid`'s
`family_line_links` hold userIds from the **demo** OA, which is why `sid` pushes are probably inert. **The moment
the customer's webhook is pointed at `sid` even once, real people link into `sid`'s database — and `sid`'s daily
jobs will keep messaging them afterwards, forever, including after the webhook moves back to `uat`.** Nothing
un-links them and no job asks which OA a row came from.

**🔻 Porter recommended `sid` keep the demo token. THE OWNER OVERRULED IT, 2026-09-05, and his reasons are
better than mine. This stands as the decision; do not re-open it.**
1. *"line oa ลูกค้ามี set up ต่างจาก demo หลายอย่าง"* — **the two OAs are configured differently**, so a green run
   on the demo OA proves nothing about the customer's. **The 1/2/3 collision is the proof: it existed only on
   their account and could never have been found on ours.**
2. *"ลูกค้าตอนนี้ หมายถึงคนที่เป็น admin นะ เขายังไม่ให้ลูกค้าเขามาใช้"* — **the people on that OA today are the
   shop's ADMIN STAFF, who are doing the testing. No parent has been let in yet.** A stray push reaches someone
   who is expecting bot messages.
🔻 **My framing was wrong and I am correcting it, not softening it:** I wrote this as *"a test message reaches
real parents"*. **It does not — it reaches the admins running the test.** The risk was real; **its severity was
not what I said**, and overstating a risk to win an argument is its own defect.

🔴 **What survives, as a TRIGGER and not as a disagreement:** the exposure becomes real **the day the shop opens
that OA to actual parents.** From that day, `sid` holding a live token means `sid`'s 08:00 / 08:15 / 18:30 jobs
can reach them. **Whoever reads this on that day: raise it again then.** It is not an argument to have now.

**Porter's superseded recommendation, kept for the record:** **`sid` keeps the DEMO OA's token; only `uat` carries the
customer's.** The customer switches their webhook to `uat` to test — which is already what he told them — and the
team keeps a box it can test LINE on without touching a real account. **Both boxes holding the live token buys
nothing the webhook switch does not already provide, and it is the only thing that makes an accident possible.**

📌 **Consequence if it stays as-is:** `QA.md` rule 4 (*never message real people*) can no longer be honoured on
`sid` by care alone — it would depend on stored userIds happening not to resolve.

## 🔴 SUPERSEDES the section above — one OA per box (customer's decision, relayed 2026-09-05 evening)

**The customer decided this, not us.** Owner: *"ลูกค้าบอกให้เอาออกก่อนเพราะกลัวลูกค้าเขาเห็น ยังไม่พร้อมใช้งาน
เขาคุยกับฉันแล้วว่าจะเอาแบบนี้ `sid` => my line / `uat` => admin line oa"*.

| Box | LINE OA | Whose |
|---|---|---|
| **`sid`** | `SOM-Balance-Demo` | **the owner's own** — the team rehearses here |
| **`uat`** | `SOM.BALANCE.SCHOOL` (`@427ybeky`) | **the customer's**, used by their ADMINS |

⇒ **`sid` must have the DEMO token + secret in its env again.** Until that is done, `sid` still holds the
customer's credentials and the split is a decision, not a state. **This is an ops step for the owner.**

🔴 **Why the customer wanted the menus off, and it retires an assumption of ours:** *"กลัวลูกค้าเขาเห็น
ยังไม่พร้อมใช้งาน"* — **they were afraid their OWN customers, the parents, would see an unfinished system.**
📌 **A LINE OA is public.** Any parent can follow it at any time. **The earlier reading — "only the shop's admins
are on that account" — described who had been INVITED, never who could arrive.** The customer acted on precisely
the exposure this file recorded as a future trigger; **the trigger fired the same day it was written.**

📌 **This is also the split Porter recommended and the owner overruled earlier the same day.** **The overrule was
correct on its reasons** — the two OAs are configured differently and a demo run proves nothing about the
customer's, which is how the `1/2/3` collision was found at all. **What changed is not the reasoning; it is that
the customer weighed being seen unready above test fidelity.** Both boxes now get an OA, so the fidelity argument
survives: `uat` still tests against the real account.

### 🔻 Correction, 2026-09-06 — the customer refused the MENU only, not the commands

**Porter recorded, and told the owner, that the customer wanted "no rich menu AND no commands" on their OA, and
concluded that nobody could link there so no notification could reach anyone.** **The owner corrected it:**
*"เรื่อง line ฉันแค่ไม่เอา line rich menu ขึ้น ก็พอ"*.

⇒ **Typed commands are ON on the customer's OA.** `สมัคร` works, so **an admin or a parent CAN link**, and
**notifications CAN reach a real person there.** ⇒ **`uat` is a usable review surface for REQ-077 after all.**
🔻 **The error was mine and it is the same one as the illustrator brief and the stale 2FA text: I took a phrase
("ยังไม่เอา line rich menu + command") and built a conclusion on my reading of it instead of checking the reading
first.** The conclusion was large — *"the customer cannot see anything we send"* — and it was wrong.
📌 **What stays true:** **no rich menu on the customer's OA** (they took it down on 2026-09-05, deliberately), and
**links do not carry over from the demo OA** — a LINE `userId` is provider-scoped, so anyone wanting to receive
must link on that account.

## 🅿️ PARKED → 🔻 SUPERSEDED — LINE inbound stopped when the customer moved from the demo OA to their own (2026-09-08)
🔻 **Superseded the same day by the ✅ SOLVED section below. The parked diagnosis was WRONG:** it said *"It is a
setting on their console, not a defect in our build."* **It was ours, on our server** — `ecosystem.cjs` held the
demo LINE credentials. **Kept, dated, because the pair is how a reader knows the rule changed.**
**The two things here that are still true and still worth acting on:**
- 🔑 **OUTBOUND rides the channel TOKEN; INBOUND rides the webhook + channel SECRET.** ⇒ **silence on outbound
  proves nothing about inbound, and a working inbound proves nothing about outbound.** Say which one you tested.
- 📌 **If inbound ever dies on the customer's console, this is the checklist, in order:** webhook URL not pointing
  at the box · `Use webhook` OFF (a SEPARATE switch from the URL) · 🔴 **the OA in CHAT mode rather than BOT mode
  — LINE sends no webhook at all in chat mode** · log level. **All four were raised in 2026-09-08 and none of
  them was the cause that time.**
📦 Full parked note, the timeline and the customer's own words, verbatim: `archive/SYSTEM-FACTS-2026-09-28-investigations.md` §PARKED LINE inbound.


---

#### ➡️ MOVED 2026-09-29 — `🚦 DEPLOY RULES (standing)` and `🔴 MIGRATION CHECK — before every single deploy` were filed under this SUPERSEDED heading by end-of-file appending. They are NOT superseded: they are now their own top-level `## ` sections, directly after `## Platform, migration and deploy discipline`.

## 🖥️ Front-end rendering patterns — `Select`, time formats, and the FE/BE contract

### The plan DTO ships `HH:mm:ss` deliberately, and the FE formats — at DISPLAY sites only (2026-09-08, DEF-5)
`bookings.startTime` is a pg `time` column ⇒ reads back **`"17:00:00"`**. `toSessionRow`
(`scheduler.service.ts:1781`) ships it **raw**, and `contract.ts:155` **documents it**: *"As stored (`HH:mm:ss`)
— the FE formats."*
- **The FE keeps that promise at every display site**: `PlanModal.tsx:689`, `:1143`, `:1210` — all `.slice(0, 5)`.
- **It does NOT keep it where the value seeds a control**: `resumeDefaultTime` (`resume-defaults.ts`) and
  `PlanModal.tsx:828` both pass the raw value into a `Select` over `TIME_SLOTS` (`"09:00" … "17:00"`).
🔑 **Message-build sites use `hhmm()` (`lib/time.ts:20`); the DTO does not, and that is correct.** ⇒ **a
seconds-shaped `startTime` on the wire is not a defect. Failing to format it at a MATCHING site is.**

### A `Select` given a value outside its options renders EMPTY — the one silent failure mode (2026-09-08)
Mantine `Select`: a `value` that is not in `data` displays as blank. **No error, no warning, nothing at compile
time.** The state still holds the value, so any `disabled={!value}` gate **does not fire** and the form **can be
submitted with a value the admin never saw**.
🔴 **This is DEF-5 exactly**, and it explains why @Tanya's Round-12 `10:00:00` (the VALUE) and the owner's empty
field (the same value through the control) never looked like the same defect.
⚠️ **`TIME_SLOTS` is a closed list of nine strings; server data can miss all nine** — `"17:30:00"` slices to
`"17:30"`, still not a member. **The guard is MEMBERSHIP, not slicing.**

### A `Select` seeded with `null` shows a PLACEHOLDER; one seeded with a wrong-format value shows NOTHING (2026-09-08)
Both look like "no value" in a screenshot, and they are opposite states. `null` ⇒ the control says *choose one*.
A value outside `data` ⇒ the control draws **empty while holding the value**, so `disabled={!value}` stays off
and the form submits what was never displayed.
📌 `BookingModal:680` (REQ-076 resume time) is safe **by the first route** — `useState<string | null>(null)`.
🔑 **"Empty on screen" is not one state. Ask which.**

### `startTime` has TWO mappers with TWO formats, and the contract comment documents only the exception (2026-09-08)
| | |
|---|---|
| `db/mappers.ts:123` — the **booking** DTO | `startTime: hhmm(b.startTime)` ⇒ **`HH:mm`** |
| `scheduler.service.ts:1781` — `toSessionRow`, the **plan** DTO | `startTime: b.startTime` ⇒ **`HH:mm:ss`** |
⇒ `contract.ts:155`'s *"As stored (`HH:mm:ss`) — the FE formats"* reads like the project's rule and is **the one
place it applies**. ⚠️ **A reader would fairly take the exception for the rule.**
✅ **The booking side is proved by behaviour, not by grep:** `CalendarGrid.tsx:66` matches `b.startTime === time`
against a `TIME_SLOTS` string — **if bookings shipped seconds, the calendar would render no bookings at all.**

### A `searchable` Select's text is not its value (2026-09-08, @Tanya Round 13)
Typing into a `searchable` Mantine `Select` **without picking the filtered option** leaves the box reverting on
blur while the state keeps the previous value. ⇒ ***"the field the admin edits is not the field submitted"* —
with no hidden input involved.**
🔴 **Dangerous specifically AFTER a value bug is fixed:** while the field rendered empty a typed-but-unpicked
value produced a server ERROR; with a valid default showing, the same gesture **submits the old time silently.**
📌 Nine fixed options do not need a search box. Removed from the resume `Time` (TASK-295 §6).

### A Mantine `Select` has TWO inputs, and DEF-5 lived between them (2026-09-08)
The component renders a **visible text input** and a **hidden input carrying the value**
(`@mantine/core/.../Select.mjs` — `hiddenInputProps`, and `readOnly: readOnly || !searchable` at `:134`).
⇒ **`readOnly: true` on the visible box is the observable signature of `searchable` being absent** — that is how
a DOM read tells a patched Select from a replaced one.
🔑 **The two inputs can disagree**, and DEF-5 was exactly that disagreement:
| **hidden `10:00:00`** | the value, with seconds — what @Tanya read in Round 12 |
| **visible BLANK** | the same build: no option matched, so nothing rendered — what the owner screenshotted |
⇒ **a screenshot shows one end and a DOM read shows the other**, which is why three observers held three
irreconcilable readings of **one** component for a week.
📌 **`searchable` adds a third string** — the search box's text, which is neither: typing without picking reverts
it on blur while the value stands.
⚠️ **When a form field looks wrong, ask WHICH of the three you are looking at before theorising.**

## `zValidator` answers directly — `app.onError` is NOT on the validation path (2026-09-08)
`routes/api.ts` uses `@hono/zod-validator` on every validated route **with no error hook**. On a refusal the
validator **responds itself**, so `app.onError` (`index.ts:55`) — which maps `ApiException`, `23505` and `23503`
to Thai sentences — **is never reached**. The `ZodError`'s `.message` is the **JSON-stringified issue array**,
regex source included, and the FE correctly renders `e.message`.
⇒ 🔴 **Every 400 in the product, on every screen, has always reached the admin as a raw array.** Unseen only
because forms normally gate the button.
🔑 **A handler that is not reached is worse than a missing one: it looks handled.**


## A new student's phone is `phone` on the booking acts and `parentPhone` on `POST /students` — and zod drops the wrong one SILENTLY (Bob, 2026-10-04, TASK-644)
⚠️ **The inline student on `createBooking` / `createCoursePackage` / `createVoucher` (and the two imports) carries the parent phone as `student.phone`. `POST /students` calls the same fact `parentPhone`.** zod strips an unknown key without a word, so a body with the wrong name simply has NO phone.
📌 **Found because `validation.test.ts`'s fixture had sent `{ name, parentPhone }` to `createCoursePackage` since TASK-138:** it was a phoneless new student all along, and it was green only because the phone was optional. TASK-644 made it required and the fixture went red. `StudentSelect` (front) sends `phone` correctly.
🔑 **Since TASK-644, the three booking acts refuse a new student without a phone-shaped (≥ 9 digits) `student.phone`; the two imports do not.** The refusal is ONE issue at `student.phone`, and it travels in the 400's **`details`**. Its `message` is the generic sentence, per the section above.
📌 **The phone rules now live in `src/lib/phone.ts`** (`normalizePhone`, `isPhoneShaped`; pure, no DB). `parent.service.ts` re-exports them, so old imports still work.
## A `DONE` board row can outlive its code — the window between review and commit is real (2026-09-08)
**TASK-295 was implemented, reviewed and verified (`tsc 0 · 168/0 · build ok`), the board row said `DONE`, and
the code existed only as uncommitted changes.** A `discard` in `smart-scheduler-front` wiped every **tracked**
modification since `01203d3`; **untracked files survived** — which is why the new `time-slot.ts` and its test
remain while every wiring edit is gone.
🔑 **Git keeps no record of a discarded uncommitted change** ⇒ **the engineer's own task notes are the only map**,
and only that engineer knows whether they touched a file the notes do not mention.
⚠️ **Nothing in the agent process was wrong: the task WAS done and the row WAS true.** The exposure is the time
between a green row and a commit, **and it belongs to the human alone — no agent here commits.**
📌 **Recovery check for next time:** `git status` showing **only untracked files** plus a suite failing on
**source-text assertions** is the signature of a discard, **not of unwritten work.**

## Rule-green + wiring-red is a LOST edit, not a bad change (2026-09-08, @Fern, TASK-295)
When a pure module survives and its callers do not — the signature of a `discard`, since untracked files survive
and tracked modifications do not — **the suite fails as *"a rule with no caller"***: every failure is a WIRING
assertion and **not one is a RULE assertion.** The module's own behavioural tests stay green, **because the logic
is in the file that survived.**
🔑 **A genuinely broken change fails the other way round, or fails both.** ⇒ **read the SHAPE of the failures
before concluding anything about who caused them.**
📌 The source-text assertions that detected it were written to prove **absences** (the AC-8 pattern); catching a
vanished edit was not what they were designed for. **They also gave the redo a checklist that was not the
engineer's memory: the four failures were the four missing edits, one each.**
⚠️ **Corollary for scoping a loss:** *"every tracked file modified since `<sha>`"* is accurate and **reads wider
than the loss usually is.** Tasks pinned by source-text tests **prove their own survival** — if their wiring had
gone, those tests would have failed too. **Redoing already-committed work is its own defect.**

## ✅ SOLVED 2026-09-08 (owner) — LINE inbound was dead because **`ecosystem.cjs` HARD-CODED the demo LINE credentials on `uat`**
🔴 **The fact (owner, 2026-09-08):** `pm2`'s `ecosystem.cjs` on `uat` had the LINE channel secret + token written
into it **literally**, so `.env` was **never consulted** — the owner changed `.env` and the value did not change.
✅ **Fixed to read from `env` always.**
🔑 **Why it looked exactly like a customer-console problem:** inbound webhooks are verified with the **channel
secret**. With the DEMO secret loaded, every signed request from the CUSTOMER'S OA failed verification and was
**dropped silently** — no `[line-in]` lines, no error, and the failure appeared at the exact moment they switched OA.
🟢 **Current status: LINE inbound on the customer's OA WORKS** (owner's screenshot: `สมัคร` → the bilingual entry
message). **All four escalated consequences were closed by the owner the same day. Nothing is outstanding.**

**The operative rules this left behind — act on these, not on the story:**
- 🔑 **A value in TWO places, where one silently wins, is invisible from the outside.** Everyone could read the
  `.env`, and everyone was reading the wrong file. Same class as the two Thai sentences and the two live-status
  lists hit the same week.
- 🔑 **A consequence chain is a HYPOTHESIS list, not a findings list.** @Porter derived four consequences from one
  true mechanism and escalated all four without checking any against what the team had already done on purpose.
- 🔴 **The customer's OA has NO rich menus, and that is the INTENDED state** — the owner removed them on 2026-09-08
  with `line:remove-menus` (*"ลูกค้าบอกให้เอาออกก่อน … ยังไม่พร้อมใช้งาน"*). **Absence is the decision, not a symptom.**
- ⚠️ **`family_line_links` rows written from `uat` BEFORE the fix carry DEMO-provider-scoped userIds** — inert,
  because nobody had ever linked on the customer's OA, but they match nothing there.
- 🧊 **PENDING DEPLOY item 5's freeze note (*"the server now points at the CUSTOMER'S OA"*) is FALSE** — it pointed
  at demo. That is a document correction, not work.
- 📌 **Outbound from `uat` rode the DEMO token** ⇒ anything it sent went to the demo OA's users. **TRUE and
  harmless** — inbound was dead, so no parent was ever waiting for a message.
📦 Full finding, the four-consequence escalation and its closure, verbatim: `archive/SYSTEM-FACTS-2026-09-28-investigations.md` §SOLVED ecosystem.cjs.

## 🧾 Leave, sick leave and what they cost

### `SICK_LEAVE` is ONE state with SIX independent prices — the consequence table (2026-09-08)
Leave has needed a ruling per feature five times in one week. **It is not a missing definition.** `SICK_LEAVE`
is one status, used consistently; what differs is **what it COSTS**, and the six consequences are set
separately:
| consequence | file | rule today |
|---|---|---|
| **quota** | `scheduler.service.ts:2328`, `:2751` | consumed — **unless `plannedAtCreation`** |
| **make-up** | `course-plan.ts:111` | **always earned** — the appender never reads the flag |
| **slot blocking** | `booking-slot.ts:6` (`SLOT_NON_BLOCKING`) | **frees the slot** for a replacement |
| **expiry** | `course-expiry-impact.ts:31` (`EXPIRY_SETTLED_STATUSES`) | **settled** — counts as done |
| **freelance pay** | `freelance-budget.ts:33` | **releases** the held hour |
| **notification** | `line-message.ts` | parent only — **`REQ-085 §2` adds teacher + admin** |

🔑 **The proof they are independent is the owner's own reversal**, recorded at `freelance-budget.ts:34`:
*"SICK_LEAVE also RELEASES — owner reversal 2026-08-03, overturning the 2026-07-20 'SICK_LEAVE keeps the draw'
rule."* ⇒ **he moved ONE price and left the other five untouched.**
⚠️ **A single definition of "leave" would have made that reversal inexpressible** — it would have forced a new
status or a change to all six.
📌 **What was actually missing is this table.** Six files cannot be read at once, so every new ruling
re-derived the previous five.

### A re-plan moves what is OWED, not what has HAPPENED — so an `ON LEAVE` row keeps its old time (2026-09-08)
A `SICK_LEAVE` row is a **happened** fact: the family already missed that lesson. **What is owed is its
MAKE-UP, and the make-up is what moves.** ⇒ rewriting the leave row's time would be **rewriting history to make
a schedule look tidy.**
✅ True by construction today — `COURSE_LIVE` excludes `SICK_LEAVE`, so a re-plan cannot touch it. **No task.**

### `REQ-085 §1` (unlimited advance leave, free of quota) was ALREADY BUILT (2026-09-08)
`plannedAtCreation` — `REQ-045` owner decision B, TASK-148, migration `0019` — already makes a creation-time
leave free of quota, guarded in **two** service paths. **There is no cap:** `validation.ts:276-279` refuses only
a week beyond the course size and *every* week absent; the FE picker caps nothing.
✅ **A creation-time leave DOES earn its make-up** — `course-plan.ts:111` appends for any unmatched `SICK_LEAVE`
and never reads the flag.
⚠️ **So the requirement is satisfied and the owner still reported it** ⇒ **he is probably reading a DISPLAY**
(`CreatePlanFlow.tsx:77` shows `LEAVE_QUOTA_BY_SIZE` on the size picker — a quota stated on the one screen where
it does not apply). **Unconfirmed; asked rather than built.**
🔑 **A requirement that is already implemented is the strongest signal that the report is about something else.**

### Two overrides of the leave lock already exist, and they are not interchangeable (2026-09-08)
1. **`adminUnlocked`** — the `admin_unlocked` column, `updateCourse`, `useSetCourseAdminUnlock`, the buttons on
   the course card ⇒ **unlocks THE COURSE, standing, until re-locked.**
2. **A per-change `override: boolean`** — `validation.ts:316`, enforced at `scheduler.service.ts:2319`
   (`if (!change.planned && !change.override && leaveLocked) throw LEAVE_LOCKED`) ⇒ **one absence pushed past the
   lock, the lock still standing.**
🔑 **"Can an admin override the lock?" has two different yeses. The difference is whether the NEXT leave is also
free.** 📌 Recorded as a fact rather than a pending decision — `REQ-085 §11.1` was withdrawn (it was a
misreading; the owner meant moving the EXPIRY), and **neither mechanism is to be changed.**

### FOUR writes set `SICK_LEAVE`; only one notifies (2026-09-09)
| path | notifies | verdict |
|---|---|---|
| `scheduler.service.ts:1703` declared at creation | ❌ | ✅ fine — the leave predates the course; the teacher has not been told of the class either |
| `:2382` **the plan editor's `mark-absence`** | ❌ | 🔴 **the hole — a FUTURE session, the same act, a different door** (TASK-306) |
| `:2749` attendance correction `ATTENDED → SICK_LEAVE` | ❌ | ✅ fine — the class already happened; a notice would be about the past |
| `:2810` `updateBookingStatus` `sick-leave` | ✅ | the `LEAVE NOTICE` |
🔑 **A teacher told SOMETIMES is worse than never: never is a gap people work around; sometimes is a promise that
fails silently.**

### `REQ-085 §12` — the leave QUOTA is the ONLY gate on leave (2026-09-09, the owner)
> *"quota ลา มี แต่การยืดเวลาไม่มี quota … ถ้าเขาจะลา ต้องได้ เพราะเขามี quota ลา ส่วนวันหมดอายุ ก็ให้ยืดตามไปเลย"*

| | |
|---|---|
| **leave quota** | ✅ **the only thing that may ever refuse a leave** |
| **week / extension ceiling** | 🚫 **not a quota, not a limit — may NEVER refuse a leave** |
| **expiry date** | ✅ **STRETCHES to fit, every time a leave is legitimately taken** |
🔑 **`§10`'s principle with no exception: *the plan decides the dates; the dates do not veto the plan* — at
creation AND after it.**
🔻 **`§11`'s two-rule table was @Porter's misreading of one sentence, and @Sober RATIFIED it** — inventing a job
for the ceiling (*"it refuses AUTOMATIC growth and yields to a DELIBERATE act"*) so the table would be coherent.
**TASK-299/301/302 were all shaped by it.**
🔻 **CORRECTED (@Jason, same day): the ceiling was NOT an unsourced invention.** `SPEC-028 §5 #2` **specifies the
refusal explicitly** and calls week-8 *"owner-confirmed and load-bearing"*. ⇒ **it was a real, owner-confirmed
rule that the owner has now REVERSED.** ⚠️ **What went wrong was that three tasks treated a SUPERSEDED rule as
current** — not that its authority was missing. 🔑 **A ruling that contradicts a shipped SPEC does not update the
SPEC, and nothing makes them collide.**
📌 **`SPEC-028` line 102 saw it two months early:** *"the ceiling and the quota already encode the same limit:
`MAX_WEEK = natural_end + leaveQuota` for every size."*
📌 **An accurate refusal is still a refusal:** TASK-301 moved the message from *"week 5"* to *"27 Oct"* and the
owner still could not take his leave.

### `LEAVE_NOTICE_TOO_LATE`'s authority is a document that does not exist (2026-09-09)
`SPEC-048` **inherits** the refusal and never asks for one — its own ask (`REQ-047`) is that the cutoff values
become **editable settings**. The refusal's authority is cited as **`UC-029`**, and **five files mention `UC-029`,
every one of them REFERRING to it. There is no such document in this workspace.**
🔴 **And it collides with `REQ-085 §12`: the quota is now the only thing that may refuse a leave — and this
refuses one.** ⚠️ **An admin has an `override`; a parent using LINE self-service does not** ⇒ **a parent declaring
leave too close to the class is refused by a rule nobody can read the source of.**
🚫 **Nothing changed.** ❓ **With the owner: does `§12` retire the cutoff for parents, or is a LATE leave a different
thing from a leave?**

### `REQ-085 §12.2` — a LATE leave is a different thing from a leave (2026-09-09, the owner)
🔑 **The precise rule, after @Porter corrected his own `§12` wording:** ***among the reasons a leave may be
refused for BEING A LEAVE, the quota is the only one.***
✅ **`§12` deleted the EXTENSION ceiling — a limit on how far the CALENDAR may move.** ⚠️ **`LEAVE_NOTICE_TOO_LATE`
is about WHEN THE FAMILY SPOKE, and it STANDS — parents on LINE included.** 🔴 **Removing a refusal on that path
is a REGRESSION, not the requirement.**
✅ **Verified after TASK-308/309: it still throws at `scheduler.service.ts:2480` and `:2914`, mapped at
`line-webhook.service.ts:838`.**
📌 **Recorded and deliberately NOT raised to the owner:** an admin has an `override` for the cutoff and a parent
does not · **`UC-029`, its cited authority, does not exist in this workspace.**

## 📆 Course expiry and the extension ceiling

### The extension ceiling is RE-DERIVED from the purchase date and never reads the stored `expiryDate` (2026-09-08)
`course-plan.ts:86` — `exceedsExtensionCeiling(date, startDate, size)` → `date > courseExpiry(startDate, size)`.
⚠️ **`course-plan.ts:45` calls the stored `expiryDate` column *"only the MAX_WEEK ceiling"* — the code does not
read the column that says it is the answer.**
**Two callers:** `scheduler.service.ts:2027` (the creation preview's `exceedsCeiling`) and `:2199` (the
auto-extend's `EXTENSION_CEILING`).
🔴 **Three consequences, one cause:**
1. a course with several planned absences **cannot be created** — the plan runs past a ceiling computed without it;
2. a **resumed** course is at its ceiling immediately — `:3849` deliberately keeps `startDate` as the PURCHASE
   date (correctly), and the ceiling measures from it;
3. 🔑 **an admin who moves the expiry changes nothing** — `PATCH /courses/:id/expiry` writes the column `:2199`
   never reads. **`REQ-085 §11.2` exists and is inert for the purpose the owner asked for it.**
✅ **Ruling (2026-09-08): the ceiling is measured from the course's own AGREED PLAN, not from its purchase date.**
⇒ **it refuses AUTOMATIC growth (a leave-driven auto-extend) and yields to a DELIBERATE act (an admin edit, or a
plan being drawn).** 🚫 It does **not** become an unreachable branch — only its source changes.

### The extension ceiling now reads the course's stored `expiryDate` (2026-09-08, TASK-299)
`exceedsExtensionCeiling(date, ceiling)` — **the SOURCE changed, nothing was skipped.** `courseExpiry`,
`maxWeekFor` and `MAX_WEEK_BY_SIZE` still COMPUTE the boundary a course is born with.
✅ **`courseBornCeiling(base, lastPlanned, absences)` = `max(base, lastPlanned + absences×7d)`** — computed
before the insert from the same `plannedSessions` array that is inserted, and used by **both** the preview and
the create, so the two cannot disagree.
🚫 **The stretch is ONE-DIRECTIONAL** — a short plan keeps the full MAX_WEEK window, because *"the family bought
a leave window and shrinking it to fit a plan takes back something nobody agreed to give up."*
🔑 **The rule: the ceiling refuses AUTOMATIC growth (a leave-driven auto-extend) and yields to a DELIBERATE act
(an admin edit, or a plan being drawn).**
❓ **Open, asked of @Jason, not yet a defect:** the ceiling stretches by the **ideal weekly cadence** while the
make-up's real date comes from `findFreeExtensionDate`, a **slot SEARCH** ⇒ **on a busy calendar the search may
outrun the ceiling by a week.** ⚠️ **Not a regression** — before this the ceiling was week 5 and it failed for
every course with two absences.

### The stretched ceiling drops the quota's week — `plan end + quota weeks` is the promise (2026-09-08, TASK-301)
`courseExpiry(start, size)` = `start + (maxWeekFor(size, quota) − 1)` weeks ⇒ for size 4, **week 5**, while an
absence-free plan ends at **week 4**. 🔑 **The base ceiling always encoded *plan end + quota weeks* — that one
week of headroom IS the quota.**
🔴 `courseBornCeiling` stretches from `lastPlanned` by the **absences only** ⇒ on a 4-session course with 3
declared absences the plan ends week 7 and the ceiling is week 7 ⇒ **zero headroom, and the card's `Leave 0/1`
cannot be used.** **`§10` gave unlimited absences at creation and removed the leave the family had afterwards.**

### ⚠️ SUPERSEDED — the ceiling promise as it stood 2026-09-08 (TASK-301/302); the LIVE rule is the 2026-09-15 TASK-358 block below
🔻 **Stale as written (rewritten by Sober 2026-09-16):** the four-argument `courseBornCeiling(base, lastPlanned, absences, quota)` and its `quota` term were REMOVED by TASK-308 (09-09); since TASK-358 the signature is `courseBornCeiling(base, lastPlanned, absences)` = `max(base, lastPlanned) + absences × 7d`, and since TASK-361/363 `absences` counts DISTINCT DECLARED POSITIONS, make-up rows included, with no cap. The "two paths do not keep the promise" paragraph is also historical: `replanExpiry` now calls the same function with `absences = 0` (a resume never moves the ceiling). Kept for the record of WHY the term was tried; do not cite as current.

*Original text follows.*
`courseBornCeiling(base, lastPlanned, absences, quota)` — the absences move the plan's END; the quota's weeks sit
BEYOND it; still `max(base, …)` so a short plan keeps its full window. **Quota via `courseLeaveQuota`, so an
off-card size answers with its own allowance instead of falling through to zero.**
🔑 **The check that proves the TERM rather than the ROOM:** an absence-free size-6 course ends week 6, ceiling
week 8 = `courseExpiry(start, 6)` — **the two agree by arithmetic, not coincidence.** *A `+ 7` that merely made
tests pass would fail this.*
⚠️ **Two paths do NOT keep the promise:** **a re-plan** (`replanExpiry` sets the expiry to the last session
exactly ⇒ zero headroom — **TASK-302**), and **an admin edit**, which is a deliberate exception and correct.

### The ceiling promise holds on three computing paths and deliberately not on the fourth (2026-09-08, TASK-302)
| path | ceiling | keeps *plan end + remaining quota* |
|---|---|---|
| **created** | `courseBornCeiling(courseExpiry, lastPlanned, absences, quota)` | ✅ |
| **imported** | `importedCourseExpiry` → `courseExpiry(realStart, size, quota)` | ✅ |
| **re-planned** | `replanExpiry` → `courseBornCeiling(…, absences = 0, remaining)` | ✅ |
| ⚪ **admin edit** | whatever the person typed | **deliberately not — a deliberate act sets the boundary (TASK-299)** |
🔑 **A re-plan declares no absences, so it IS `courseBornCeiling` with `absences = 0`** — one arithmetic because
the domain says so, not for convenience. **Asserted BY AGREEMENT across every quota value**, so a change to
either function that does not change the other fails in a test.
⚠️ **The imported path keeps the same promise by a DIFFERENT expression** (`courseExpiry` encodes it directly).
They cannot disagree in the direction that matters — `courseBornCeiling` `max`es with `courseExpiry` — **but it
is one sentence in two arithmetics. A third path needing a third expression is the moment to collapse them.**

### Nothing warns an admin who edits a course's expiry into its remaining LEAVE (2026-09-08)
`updateCourseExpiry` computes `expiryImpact`, which reports the **sessions** falling outside the new date and
**says nothing about the leave the family has not used.** ⇒ **an admin can spend a course's remaining quota by
moving one date**, and the first sign is a leave refused weeks later — with a message that names the course's end
date (TASK-301) and explains nothing about why the room went.
📌 **Folded into TASK-298 §5 rather than cut as its own task:** that task exists so an admin is told what an
earlier expiry cuts off BEFORE saving, and unused leave is one of the things it cuts off.
✅ **Asserted meanwhile as the ABSENCE of `leaveUsed` in that function**, so a later warning makes the note stale
instead of letting it rot.

### 🔻 CORRECTED 2026-09-09 — the ceiling WAS properly sourced. A rule can be right and still be wrong, because the owner changed his mind.
**The earlier version of this entry said `SPEC-028 §5 #2` "named a worry and never asked for a gate". That is
FALSE, and @Jason corrected it by reading the source I had only read a code comment about.**
**`SPEC-028 §5 #2`, verbatim (line 115):**
> *"SPEC: the reconcile's **append refuses** when the appended date would exceed `startDate + MAX_WEEK weeks`,
> with a reason (…). Week-8 (size 6) is **owner-confirmed** and load-bearing."*

⇒ 🔑 **The SPEC specified the refusal explicitly, named its message, and attributed its number to the owner.
Nothing was invented.** ⚠️ **I judged the citation by the CODE COMMENT quoting it** (*"a leave could otherwise
extend a course indefinitely"* — a fear) **rather than by the source one paragraph above it.**
🔴 **So the real failure was not untraceable authority. It was that THREE tasks treated a SUPERSEDED rule as
current, and nobody noticed the owner had since said something that contradicted it.**
📌 **And `SPEC-028` itself saw it coming, at line 102:** ***"the ceiling and the quota already encode the same
limit: `MAX_WEEK = natural_end + leaveQuota` for every size."*** ⇒ **the redundancy `§12` removed was written down
two months before anyone acted on it.**
🔑 **The lesson: a rule can be correctly sourced, correctly built, owner-confirmed — and still be wrong because
the owner changed his mind. The repo has no way to notice a reversal.** ⚠️ **A ruling that contradicts a shipped
SPEC does not update the SPEC, and nothing makes it collide.**

### `EXTENSION_CEILING` is gone; the QUOTA is the only refusal on leave (2026-09-09, TASK-308)
✅ **The refusal became a stretch:** the append loop collects the furthest date and grows the expiry **once**
through `recordExpiryChange` with a **NULL actor** — *the system moved it, not a person* — so a course earning
three make-ups records one expiry change and REQ-082's trail still answers *"why did this date move?"*.
🔻 **Reverted with it:** TASK-301's pre-allocated quota week **and** TASK-302's twin in `replanExpiry` — *leaving
either would pre-allocate on one path only, which is the inconsistency `§12` ends.*
🔻 **Only dead once the refusal went, both removed:** the `CANCEL_AT_CEILING` re-map (*"a handler for an exception
that cannot arrive"*, `EXPIRY_REQUIRED`'s shape — and the reconcile still runs on a cancel, so a cancel is still a
reschedule, not a forfeit) and a comment claiming the ceiling was enforced at creation.
📌 **Both were invisible before the change and obvious after** — which is what makes them easy to leave behind.

### The born ceiling is the BASE plus the absent weeks — `REQ-089 item 2`, TASK-358 (2026-09-15)
**Supersedes the TASK-301 block above** (*"stretched ceiling drops the quota's week"*). `courseBornCeiling` = `max(base, lastPlanned) + distinctAbsentWeeks × 7 days`, where `base = courseExpiry(start, size)` already holds the quota (size 6 ⇒ week 8). Kavya: size 6, 3 weeks advance leave ⇒ **week 11**, not week 9 (the last make-up). 0 leaves ⇒ unchanged. Never shrinks. `resumeCourse` reaches the same function via `replanExpiry(…, 0)` ⇒ a resume does not move the ceiling. ⚠️ **Courses created before 09-15 with `planned_at_creation` bookings carry the OLD, lower stored ceiling** — DATA REQUEST raised; `PATCH /courses/:id/expiry` is the per-course fix, the owner's call. 📌 The TASK-301/302 "ceiling promise" block still describes a four-argument signature with a `quota` term TASK-308 removed — stale, to rewrite on a quiet day.

## "Already built" is the MIDDLE of a triage, never the end (2026-09-08)
Twice in one batch a requirement named something that already existed, and **both times the report was real:**
- **`REQ-085 §1`** — `plannedAtCreation` worked perfectly **and the screen still refused him**: the blocker was
  the WEEK CEILING, not the quota.
- **`REQ-085 §11.2`** — the expiry editor exists **and is inert for the purpose he asked for it** (see above).
🔑 **The question is not *"does this exist?"* but *"does it do the thing they want it for?"*** ⇒ **the second
question is answered by their stated REASON**, which is why quoting the requester verbatim is what makes this
findable. **What a person can see is a SCREEN; what changed is a RULE.**

## The question is not "stored or derived" — it is **"is there an ACT that can move one without the other?"** (2026-09-08, @Jason)
Sharper than *"two things that agree today are two things that can disagree later"*, because it is **answerable**:
one names a risk, the other names where to look. **Every pair below was fine until exactly such an act appeared.**
| stored | re-derived | the act that splits them |
|---|---|---|
| `coursePackages.usedSessions` | the delivered count `courseCurrent` sees | the attendance write moves both — ⚠️ guarded only by a COMMENT in `getEntitlementPlan` |
| `coursePackages.leaveUsed` | the count of `SICK_LEAVE` rows | ⚠️ **designed to disagree** — a `plannedAtCreation` leave never increments it (TASK-148) |
| `coursePackages.expiryDate` | `deriveLiveEndDate(sessions)` | two different questions (TASK-097); the plan returns both side by side |
| `coursePackages.weekday` / `startTime` | `weekdayOf(booking.date)` (`:2971`) | ⚠️ a RE-PLAN — TASK-282 had to write the stored pair back **because they drift** |
| `coursePackages.expiryDate` | `courseExpiry(startDate, size)` | 🔴 **a plan with absences — TASK-299** |
🔑 ***"The act that will split them is usually already in the backlog."***
⚠️ **Two of the five are guarded only by prose.** This week showed twice what a sentence is worth: a
`COURSE_PAUSE_NOTE` comment went stale inside a day, and `scheduler.service.ts:15` outlived its mechanism.

## The PREVIEW and the SAVE place creation-time make-ups in DIFFERENT weeks (2026-09-08, @Jason, TASK-300)
| | anchor | code | 4-session course, absences in weeks 2–4 |
|---|---|---|---|
| **preview** | the last **PLANNED** session | `scheduler.service.ts:2027` | weeks 5, 6, 7 |
| **save** | the last **LIVE** session | `:2216` — `liveAfterCancel.reduce(max, startDate)` | 🔴 weeks **2, 3, 4** |
`liveAfterCancel` filters `COURSE_LIVE`, and **`SICK_LEAVE` is not in it** ⇒ the absent weeks are invisible to
the anchor, so the search starts at week 1. **`SICK_LEAVE` IS in `SLOT_INACTIVE_STATUSES`** ⇒ those weeks read
FREE ⇒ they get filled.
🔴 **The make-up for a declared absence is booked ON the absent day** — same teacher, same time, mirrored from
the absence it replaces. **A lesson on a day the family said they could not attend, with no warning anywhere.**
🔑 **It also explains the owner's `Create plan` refusal:** the preview refused over weeks 5–7 against a week-5
ceiling **while the save would never have passed week 4** ⇒ the two disagreed and the admin saw the stricter one.
⚠️ **`SICK_LEAVE` freeing the slot is CORRECT (UC-004) and must not change** — `migration-witness.ts:77` says
reversing it *"must never be attempted"*. **The bug is that the course reused ITS OWN absent week.**

## A source sweep can ask the SHAPE question; only a request can ask the REACHABILITY one (2026-09-08, @Jason)
✅ **Mechanical:** every `c.json({ error: … })` in the routers carries both a `code` and a `message` — source-read,
because *"a route no test requests still ships"*. **The `35 = 35` shape.**
🔴 **Invisible to it, and written into the test so nobody trusts it too far:** a Response built in a helper ·
`new Response(...)` · `c.text`/`c.body` with an error status (**the ICS route is deliberately one**) · and **a
library answering before our code runs — which is exactly what DEF-5/TASK-296 was.**
🔑 ***"No source sweep would have found TASK-296"*** — that needed a route-level assertion that made the request.
📌 **Conflating the two questions is how a sweep that looks complete lets the next one through.**

## `c.notFound()` dispatches to the APP's handler — adding `app.notFound` silently changes every route that used it (2026-09-08, TASK-297)
The ICS route (`routes/calendar.ts`) deliberately answers a calendar client with Hono's plain-text 404. Adding an
app-level `app.notFound` envelope **switched that route to JSON as a side effect**, invisibly: no test, no error,
a client quietly ignoring a body.
✅ **It now writes its own `c.text("404 Not Found", 404)`** — **byte-identical output, changed in order to
PRESERVE it**, and pinned against the next app-level edit.
🔑 **And why nothing looked wrong from the inside: a 404 is not a thrown error, so `onError` was never a fallback
for it — the two are siblings, not a chain.**

## A refusal that prints a number the check did not use (2026-09-08)
`scheduler.service.ts:2230` compares against `course.expiryDate` (the real ceiling); `:2233` prints
`MAX_WEEK_BY_SIZE[course.size]`. ⇒ **refused at week 7, told "week 5".**
🔑 **It did not merely confuse an admin: it sent the PM to a wrong diagnosis** (*"the after-creation path uses the
OLD limit"*) **and nearly bought a task for a defect that was not there.**
📌 **Same class as DEF-3 and the two `startTime` formats — one value with two sources.** ⚠️ **An error message is
a derived value like any other, and nothing tests it against the branch that raised it.**

## Reading tells you what CAN happen; only running tells you what DOES (2026-09-08)
Two escalations in one night came from correct source-reads and were contradicted or narrowed by saved data:
- **`REQ-085 §1`** — `plannedAtCreation` was right in every line, **and the screen still refused the owner** (the
  blocker was the week ceiling).
- **TASK-300** — the anchors do differ in the source, **and the owner's saved plan shows correct placement**,
  because his absences sat BEFORE his last live week. **The condition is the POSITION of the absences, not the
  count** — and it is still unproven either way.
🔑 **Standing rule (SA): a family-facing claim gets a FAILING TEST before it gets a message.** Stricter than
"a reproduction someone can click", because it needs nobody else's time.
⚠️ **Corollary for writing a task: put the CONDITION in the headline.** A count in the title and a position in a
table cell means the reader reproduces the count. **They are reading what you emphasised.**

## TASK-300 CONFIRMED by gate, then fixed: the make-up anchor must be the last PLANNED session (2026-09-08)
**The gate run, before any code was touched** — 4-session course, weeks 2/3/4 declared absent, week 1 live:
the save placed all three make-ups on **`2026-09-08` · `09-15` · `09-22`** — **the same three dates as the
declared absences.** The mirror arrangement (absences first, live session last) placed them correctly.
🔑 **The condition is the POSITION of the absences, never the count:** the defect needs a live session EARLIER
than a declared absence, so the old `liveAfterCancel` anchor started the search before it — and `SICK_LEAVE`
being in `SLOT_INACTIVE_STATUSES` made those weeks read FREE.
✅ **Fixed with ONE anchor — the last planned session — used by the preview and the save.** 🚫 **Neither status
list changed:** a student on leave still frees the slot for someone else (UC-004). **The bug was the course
reusing its OWN absent week.**
🔴 **And the same anchor was wrong AFTER creation** — a leave taken on the LAST session fell back to the
second-to-last live row, whose own date then read as free. **Not a creation-time special case.**

## A reconstruction pinned to the source is the strongest evidence available here — and it is weaker than a click (2026-09-08)
Placement lives inside a DB-bound function and **no agent in this workspace touches a database**, so the test
reproduces those lines and **asserts the source still contains them**. A source mutation therefore fails the
**pin**, not the placement assertions.
🔑 **@Jason wrote that limit into the test file rather than into a report:** *"a reconstructed test that stops
describing the code it names would be worse than no test."*
⚠️ **When reporting such a result upward, say which it is.** A reconstruction can reproduce a defect the real
code does not have, if the reconstruction is wrong; **the pin is the only thing standing between those two.**

## Break-it-and-watch has a second half: which tests must NOT fail (2026-09-08, @Jason, TASK-302)
Mutating the remaining-quota term made the resumed-course assertions fail — **and the *"quota SPENT"* test kept
passing, correctly**: with nothing remaining, the two builds agree.
🔑 ***"A mutation that broke it too would have meant the term was doing something other than what it claims."***
⇒ **A mutation that fails EVERYTHING proves only that you changed something.** **Naming the tests that must stay
green is what proves the change is the one you described.**

## Answer "assert that X agrees with Y" by deleting one of them (2026-09-09, @Jason)
TASK-298's DoD asked the expiry PREVIEW and the PATCH to return the same warning, **asserted by comparison**.
He instead made disagreement impossible: `expiryDecision(id, date)` loads once and both callers read it, with
**exactly one `expiryImpact(` call in the service, asserted by count.**
🔑 **A comparison test proves they agree TODAY; one call site means they cannot diverge.**
📌 Same move as `lib/validate.ts` owning the `@hono/zod-validator` import (TASK-296) — *"covered by construction,
not by memory"*. ⇒ **when a DoD asks for agreement between two derivations, the better answer is usually one
derivation.**

## The acts with NO preview are `sick-leave` and `resume` — the two highest-frequency dates the system picks (2026-09-09)
| act | previews? |
|---|---|
| create course · import · end course · workDays change · plan change (incl. `mark-absence`) · expiry | ✅ |
| 🔴 `POST /bookings/:id/status` — **`sick-leave`** | ❌ |
| 🔴 `POST /courses/:id/resume` — the re-plan | ❌ |
| `cancel` on a course session (reconciles and re-owes) · `bulkConfirm` partial success | ❌ |
🔑 ***"That is how TASK-300 stayed invisible: nobody could see where a make-up would land until it had landed."***
⚠️ **The plan editor previews the SAME act** (`planChange` `mark-absence`) ⇒ **the product already knows how to
answer; the per-session path never asks.** **The resume picks N dates at once and can fail mid-way on
`SLOT_TAKEN`** — the admin discovers a clash only on submit.

## The line for `REQ-086`: not acts that WRITE, but acts where the SYSTEM decides something the person is held to (2026-09-09, @Jason)
🔑 **A date a family is told about is exactly that.** ⇒ it explains why the preview list above splits so cleanly,
and it says what a message editor's preview must cover: **not every save — every place the product commits
someone to something they did not choose.**
📌 Sharpens @Porter's `REQ-086 §2` refusal (*no editor without a preview*) into a test for WHICH previews.

## A test that fails because a requirement changed is not a wrong test — it is a test in the WRONG PLACE (2026-09-09, @Jason)
TASK-284 made the course `CONFIRMED SCHEDULE` **language-invariant** (`TH` and `EN` render byte-for-byte the
same), which broke two tests asserting `th !== en` on it.
🔑 **He found what they were FOR** — a **proxy** for *"the language switch still switches"* — **moved the proxy to
`booking_confirmed`**, whose `ob_l_*` labels are genuinely bilingual and byte-frozen, **and asserted the real
property in their place**: no notification renders both languages.
📌 **Seven tests in total were pinning the Thai weekday or `ไม่มี`; all corrected with their reason, none
deleted.** ⇒ **before deleting a failing test, name the property it was standing in for.**

## 🗣️ Copy, language and how messages are worded

### The course `CONFIRMED SCHEDULE` is language-invariant BY RULING (2026-09-09, TASK-284)
Every piece is a label, a value we generate (`TEMPLATE_LANG = "EN"`, `TEMPLATE_NONE = "(-)"`), or a human's own
words ⇒ **`TH` and `EN` are byte-identical, asserted**, so a translation creeping into any of them fails.
🚫 **A human's words are never translated:** a student's Thai name and the admin's Thai `Remark` are reproduced
exactly as typed (`REQ-085 §8.2`). 🔑 *Translating a Remark is putting words in an admin's mouth.*
⚠️ **`§7.1` has TWO OPPOSITE empty-field rules in one message** — `Advance Leave Notice` always prints `(-)`;
`Remark` is absent entirely. **Asserted three ways, including a case with both empty.** *A single "empty fields"
test passes through the swap.*

### Two of the customer's messages share ONE title and ONE i18n key (2026-09-09, TASK-303)
`§7.1` (course `CONFIRMED SCHEDULE`) and `§7.3` (per-session) both render `t("ob_course_title")`.
| what distinguishes them | strength |
|---|---|
| `payload.kind` | ⚠️ a plain string on an untyped payload — a typo falls through to the generic fallback |
| **`TemplateKey`** (`confirmed_schedule` vs `session_confirmed`) | ✅ **structural** — `Record<TemplateKey, …>` forces the declaration, and it caught the new template on the day it was added |
| the two byte-for-byte pins | ✅ pasting one message's text into the other's builder fails both |
🔴 **The TITLE distinguishes nothing.** ⇒ **`REQ-086` would list two editable rows with the same name, and an edit
to the wrong one would look like it worked.**
✅ **RULING (2026-09-09): the message editor keys its rows on `TemplateKey`, never on the title.** 🔑 **The titles
are the customer's words and two are identical; the template key is ours and cannot be.**
📌 **Not a defect today:** a human reading a LINE message always knows which one they got, because the lines
beneath it differ. **It is only a problem in a LIST, which does not exist yet.**

### The `th !== en` proxy does not belong on a NOTIFICATION (2026-09-09 ruling)
It moved twice in one night — off `course_confirmed` (TASK-284) and then off `booking_confirmed` (TASK-303) — as
each `§7` format made another message language-invariant.
🔑 **Every notification is English-by-ruling (`REQ-079 §18`), so a notification-based proxy for *"the language
switch still switches"* is guaranteed to move again.** ⇒ **it belongs on a CONVERSATION flow, where bilingual is
the RULE rather than a leftover.** 🚫 **Not deleted — the property is real; it was measured in the one place that
is disappearing.**
📌 **@Jason's line, and the reason for the ruling: *"a proxy that has to move twice in one night is a proxy worth
retiring."***

### The customer's own examples disagree on `HR` vs `Hr` (2026-09-09)
`REQ-085 §7.3` writes `Private Freeskate 1 Hr`; `§9.1`, the same batch, writes `Private Freeskate 6 HR`.
⇒ **there is no casing to follow.** ✅ **We keep ours (`HR`), which is what `§7.1` already ships**, and a change
would move both messages from one line in `programLabel`.

### The COMMAND daily schedule was rendered TWICE, once per language (2026-09-09, TASK-304)
`renderSchedule` was wrapped in `both((l) => …)` ⇒ **a teacher who asked for their day received the whole list
twice in one message.** 🔑 **The customer reported it as a preference — *"ให้เป็นภาษาเดียวพอ"* — and it was a
duplicate of their own schedule.**
✅ The renderer itself was never bilingual: **one line at the call site, rendering in `TEMPLATE_LANG`** — the same
constant every `§7` format uses, rather than a fourth answer to *"which language is a notification in?"*
📌 **Second time in two days a politely-worded request was a defect underneath** (the first: `REQ-085 §1`, where
the requirement said *"make leave unlimited"* and the screen was refusing him at the week ceiling).

### `REQ-085 §5`'s entry copy is with the CUSTOMER — no engineer may write it (2026-09-09)
`§5`'s MECHANISM is settled (no role list; teachers and admins type a phrase — an undocumented door), but the
**wording is unsettled and the REQ says so explicitly**: *"No engineer may implement this text."* The customer's
words win **verbatim**, per the `REQ-079 §17b` precedent.
⏸️ **Still owed by @Porter: the admin phrase (proposed `แอดมินเอง`) and the parent-certainty wording.**
🔑 **`§6` (no SKIP past having a child) is the buildable half** — and TASK-307 asserts `§5`'s prompt stays
**byte-identical**, because a stray diff there is invisible to us and visible to the customer.
📌 **The precedent for the discipline: `Date : อังคาร` shipped after `REQ-079 §18` had already ruled labels
English — an engineer's sentence outliving a ruling nobody re-read.**

### The four `§7` notification messages are a FIELD TABLE, not free text (2026-09-09, SPEC-078)
In code a notification already is: **`TemplateKey` → an ordered `FieldKey[]` (`TEMPLATE_FIELDS`)**, each field
carrying **a label + a value source + an empty rule**, with `TYPE_OMITS` / `AUDIENCE_OMITS` removing fields per
booking type and audience (`fieldsFor(template, type, audience)`).
🔑 **So `REQ-086`'s editor edits WORDS — the title per `TemplateKey` and the label per `FieldKey` — never a
template string.** ⇒ **@Porter's *"no raw text box with `{{placeholders}}`"* is satisfied structurally: there are
no placeholders to mistype, because labels do not name values — fields do, and fields are ours.**
⚠️ **Labels are GLOBAL per `FieldKey`, not per message** — `ob_f_note` is deliberately one word across all four,
*"so the word means one thing across every message a family receives"*. **Per-message labels would reintroduce
the drift this week was spent closing, as a feature.**
✅ **Defaults are never copied: store only OVERRIDES, and `Reset` DELETES the override row** ⇒ *"back to default"
is the ABSENCE of an edit, not a stored copy that can rot.*
🔴 **`REQ-086` needs the batch's FIRST migration.** Everything in `REQ-085` shipped `35 = 35`; this will not.

### `§14` and `§15` are ONE defect: a label that names a RECURRING attribute (2026-09-10)
**`REQ-085 §15`:** the teacher received two byte-identical LEAVE NOTICES because `Date : Tuesday` names a
recurring slot, and the course runs every Tuesday.
**`§14`, one surface over:** `lib/line-leave.ts:32` — **`sessionLabel` is `time · teacher · program`, with NO
date.** ✅ Correct while `doLeave` scans **today only**; 🔴 **the moment the window widens, one weekly course
produces three identical picker rows and the parent cannot tell which class they are cancelling.**
🔑 ***Both labels were sufficient only while their context was one day wide.*** ⇒ **widening a scan without
widening its labels converts a fixed defect into a new one, on the other side of the same act.**
⚠️ **Constraint: LINE clamps a picker BUTTON label to 20 chars** (the prompt BODY is unclamped), and
`time · teacher · program` already overflows — **so a date cannot simply be prepended; body and button may need
different forms.** 🚫 **Never a half-printed date: it looks like information.**

## `Coach` on a course summary is the earliest session's teacher, and nothing says it must be the only one (2026-09-09)
| field | source | can rows differ? |
|---|---|---|
| `coach` | `rows[0]?.teacher` | 🔴 **yes** — `createCoursePackage` accepts a per-session `teacherId`, and `planChange`'s `move` accepts one |
| `subject` | `rows[0]?.subject?.name` | ✅ **no** — a mixed course is refused in the zod refine AND again in the service (SPEC-045 / TASK-138) |
🔑 **The product has already decided `Program` is a promise and `Coach` is not, and nobody chose that.**
⚠️ **Unlike a missing note, a wrong coach does not look empty — it looks confidently right**, which is harder to
notice. 📌 **Raised to the customer via @Porter as a question (main coach? several? enforce one per course?),
not cut as a task — the answer is theirs, not ours.**

## Seven statuses reach the COMMAND schedule; two are our words, not a coach's (2026-09-09)
The query excludes `CALENDAR_HIDDEN_STATUSES` (`CANCELLED`, `PAUSED`), so **seven of the enum's nine can appear.**
✅ Plain: `Pending` · `Confirmed` · `Attended` · `Leave` · `No-show`.
🔴 **`Extended`** — our word for our mechanism (*a make-up appended because someone took leave*), **and the
commonest non-obvious row on the list.** 🔴 **`Awaiting move`** — does not say **who** is being waited on.
⚠️ **The reader is a TEACHER, not a parent**, which makes `Extended` more defensible here than it would be on a
family's message. **Raised to the customer as wording, not cut as a defect.**
📌 **`PAUSED` has a label for a row the query can never render** — the mirror of TASK-271, where a row rendered
its own key because no label existed.

## A shape assertion catches changes a byte pin was not written for (2026-09-09, @Jason)
TASK-304 asserted AUTO as *"the message with the note IS the message without it, plus one line"*. When a
mutation made `Remark` fall back to `(-)`, **that assertion fired too** — catching a wrong string as a **layout**
change.
🔑 **Stronger than a byte pin, because it survives the field being added and still fails on changes nobody
predicted.**

## The bilingual proxy is retired: assert the property, not a symptom (2026-09-09, TASK-304)
The `th !== en` proxy moved three times in one night as each `§7` format made another notification invariant.
✅ It now sits on `tb("children_none")` — a CONVERSATION reply — **and stopped being a proxy at all**: it asserts
`tb()` composes **one string containing both `t(key,"TH")` and `t(key,"EN")`**, which is the bilingual property
itself. 🔑 **`§7.4` cannot move it.**
📌 **The general form: when a proxy keeps moving, the fix is not a better location — it is asserting the property
the proxy was standing in for.**

## A feature behind a default-off setting is indistinguishable from a feature nobody wrote (2026-09-09, TASK-305)
The owner reported TWICE that teachers were not told when a student takes leave. **The notification already
existed** — `kind: "leave_teacher"`, wrapped in `if (notifyOnLeave === "admin_and_teacher")`, with
`notify_on_leave` defaulting to `admin_only`. ⇒ **on a default install that branch never ran.**
⚠️ **It had a comment explaining the default**, so it was deliberate and documented — **and still wrong for what
was asked.** 🔑 **A reviewer reading that branch would have found it correct: the defect was the DEFAULT, and
nobody reviews defaults.**
✅ **The owner's `§9` ruling is unconditional (*"เฉพาะแชทครู / แอดมิน"*)** ⇒ the setting gates nothing and is
**removed from the registry and the settings screen** (TASK-306). 🚫 **Stored rows are NOT deleted** — a value
nothing reads is inert; a DELETE is irreversible and buys nothing.
🔑 **The general rule: a CONTROL that does nothing is worse than a missing feature — an admin who sets it
believes they changed something.**

## `bunx tsc` is broken on this machine — use a pinned version (2026-09-09)
`bunx tsc --noEmit` panics with `bundled: …/@typescript/typescript-win32-x64/lib/lib.d.ts does not exist` — a
`typescript-go` preview binary whose temp install was cleaned. **It is a toolchain fault with no relation to the
code, and it exits 2.**
✅ **`bunx --package typescript@5.6.3 tsc --noEmit` works** (exit 0). ⚠️ **There is no local `typescript`
dependency in `smart-scheduler-back`**, so there is no `./node_modules/.bin/tsc` fallback.
📌 **An engineer's `tsc 0` can be TRUE and unreproducible an hour later. Check the failure's SHAPE before
reading it as a code defect.**

## A sweep whose SCOPE is hand-written is only as complete as somebody's memory (2026-09-09, @Jason)
Sweeping for "settings nobody reads", @Jason's **first** attempt hand-listed the files to search and reported the
two `leave_cutoff_hours_*` keys as UNREAD. **They are read** — via `leaveCutoffKey(teacher.type)` in
`lib/leave-notice.ts`, a file the list omitted. 🔴 **It would have recommended deleting two LIVE settings, minutes
after a real dead one was removed.**
🔑 **The technique was sound; the INPUT was not.** Every reader names its key as a **string literal** — including
the one that looks dynamic: `leaveCutoffKey` is a **ternary over two literals**, not a composed string, so a
whole-tree grep finds it.
📌 **This revises TASK-297's split.** The honest question is not *"mechanical vs needs an eye"* — it is
***"walks the tree vs walks a list"***. **A hand-scoped sweep fails the same way as the thing it is looking for.**
⚠️ **Residual risk, checked rather than assumed:** a key built by template literal (`getSetting(\`…${x}\`)`).
**Zero such calls today**, and a grep for that shape is the cheap guard if anyone starts.

## `sick_leave` and `leave_teacher` are dead as PRODUCERS and live as CONSUMERS until the queue drains (2026-09-09)
TASK-305/306 replaced both with one `leave_notice`, so **no non-test code enqueues either kind** — *"exactly the
shape that makes dead code look alive"*.
🔴 **They are NOT removable yet:** `outbox.service.ts:78` renders `row.payload` **at SEND time**, so any row
already queued with those kinds still needs its branch.
✅ **RULING: keep the renderers, keep the "re-wiring fails loudly" assertions.** **They become removable after a
deploy plus a drain — not before.**
⚠️ **Constraint for `REQ-086`: a template kind nothing sends must NOT appear as an editable row** — the same
defect as a setting nobody reads, one layer up.

## The registration flow honours "conversation is bilingual" WITHOUT `both()` — it answers in the session's language (2026-09-09)
`line-webhook.service.ts` uses **`t(key, lang)` 39 times against `both()` 13 times**, and
`add_student_name_prompt` is called **five** times — four with `lang`, one (a new re-ask) with `both()`.
🔑 **`both()` is for a reader whose language is not known; inside a session it IS known.** ⇒ **`REQ-079 §18` is
satisfied by answering IN the parent's language, not by composing both into one message.**
🔻 **My TASK-307 §3 told the engineer to make a re-ask bilingual, without checking the flow's convention** — which
would have left one sentence rendering in two forms depending on how a parent arrived at it. **He flagged it
rather than choosing; corrected to `t(…, lang)`.**
📌 ***An instruction about a CONVENTION must be checked against the convention.*** **Second time in one day an SA
instruction was refuted by the code it was about** (the first: a DTO-formatting task that `contract.ts` forbade).

## A parent account can be CREATED empty by abandonment, and cannot BECOME empty (2026-09-09, TASK-307)
| road to a usable-looking childless account | reachable? |
|---|---|
| 🔴 **abandoning registration mid-way** | **YES, and it is the widest road** — `ensureParentByPhone` (`parent.service.ts:66`) creates the `parents` row **at LINK time, before any child.** **Nobody types anything, so `§6`'s "no skip" cannot touch it.** |
| 🔴 **blocking and re-adding the bot** | **YES** — the link persists, so re-adding lands on the same empty parent. Road 1 by another exit. |
| ⚪ **an admin creating a parent** (`POST /parents`) | **YES, deliberately** — a household may be registered before its children. Not a defect. |
| ✅ **a child DELETED later** | **NO** — there is no student delete route and no archive flag ⇒ **an account cannot BECOME empty.** |
🔑 **So `§6` is complete for its own shape.** ⚠️ **The gap is abandonment, and the remedy is a different shape:
*not a refused word — something that notices an account has sat childless.*** **How long is "sat", and who is
told, are the owner's questions.**

## An editor must list templates that are ENQUEUED, not templates that RENDER (2026-09-09)
`sick_leave` and `leave_teacher` still have renderers because a queued outbox row needs them, while no code
enqueues either. ⇒ **an editor built from the renderer list would offer the customer two messages the product no
longer sends** — *edited, and never seen.*
🔑 **Derive that list rather than hand-writing it** — a hand-scoped sweep is only as complete as somebody's
memory, and here it is wrong in the more embarrassing direction.


---

## Project info → MOVED TO `board.md` (Marie ORDER 12.5, 2026-09-28)
📌 **This block was board CONTEXT, not knowledge** — and it is the same block that was moved OUT of `board.md`
on 2026-09-09 in the incident that started this file's growth. **The durable part is back in `board.md`,
immediately under its title line.** Full original block, verbatim: `archive/SYSTEM-FACTS-2026-09-28-investigations.md` §Project info.
⚠️ **The `###` sections below are NOT project info.** They are dated facts that were appended under whichever
`##` heading happened to be last at the time. **They stay here** — do not read this heading as covering them.

## 📏 STANDING RULE — FE layout IS verifiable here (08-01, TASK-081)

The in-app browser does not *paint* but it does **compute layout**. **Any FE change that adds or resizes a control
in a shared row must measure that row at 1600 / 1280 / 768 / 375 and report the numbers.** Anything painted stays
out of reach — **a deployed look is the only full detector**, so ship in small slices.

🔴 **HEIGHTS — added 09-08 (TASK-291 §2, @Porter's finding, @Sober's instruction; written in by @Fern, reword at
will).** **The four widths above were the whole rule, and nobody had ever checked a height — on any dialog.**
⇒ **Any change that makes a DIALOG taller is measured at 900 / 650, and its primary action must stay reachable
at 450.** *650 = a 1366×768 laptop after browser chrome, the commonest real admin screen. 450 = the harness
height that exposed this; a floor that only holds on real screens is not a floor.*
📌 **The reason is not the viewport: a dialog whose primary action can be unreachable cannot be VERIFIED.**

## 🔴 STANDING RULE — the human COMMITS at the end of every batch (his decision, 2026-09-01)

**An uncommitted working tree is not storage.** Agents never commit (`CLAUDE.md` rule 6), so finished engineering
output lives **only** as uncommitted changes until the human commits. On 2026-08-31 a routine branch sweep
(`dong → develop → production → dong`, fast-forward + a clean) **silently destroyed three completed tasks**
(TASK-218 / 221 / 223) — identical mtimes across every touched file, new files gone, no stash.

🔴 **The dangerous part is not the loss, it is how it presents: a clean tree looks exactly like an engineer who
never built it.** Sober came within one step of recording that, which would have cost a re-cut task, a rewritten
spec, and a false line in a log everyone treats as history.

**🔴 UPDATED 2026-09-01, his instruction:** *"เลิกยุ่งเรื่อง commit ฉันจะทำเองเมื่อถึงเวลาของฉัน"*
**Nobody reports, chases, or asks about commit state** — not in the log, not in a hand-off, not as a reminder.
He commits on his own schedule; it is his repo and his call. *"This batch is code-complete"* is still worth
writing — that is ordinary status and it makes a natural commit point visible **without anyone being chased.**
**State your work; never request his.** *(Porter put commit state into the reporting loop and has removed it.)*

**What protects the work is OURS, not his, and it is unchanged:** ⇒
- **Engineers:** when a batch is code-complete, say so plainly in the log so the commit point is visible. Keep
  every load-bearing fact in the **TASK file's `## Implementation Notes`** — that is the only reason the three
  tasks were reviewable and rebuildable after the tree was swept. **Evidence in the TASK, never only in the log.**
- **Nobody may conclude "it was never built" from an empty diff alone.** Check `git reflog` and file mtimes
  first — that is how the real cause was found.
- Interim artifact from that incident: `archive/patch-scheduler-back-TASK-218-221-223-224.diff` (base `7217599`).

*(Project-level record. If this should bind every project in the workspace, it belongs in the workspace
`CLAUDE.md` — the human's or Atlas's call, not Porter's.)*



## A PM's misreading costs a message; an SA's ratification costs a sprint (2026-09-09)
@Porter read a structure into the owner's prose **four times in one day** — the `HH:mm:ss` prefill, the address as
three fields, the "admin override", and a second gate on leave. **He caught and withdrew all four himself.**
🔴 **The one that reached code is the one @Sober RATIFIED without asking where its authority came from.**
🔑 **The check that was missing: *"which REQ or ruling says this limit exists?"*** ⇒ **before building against a
structure in a REQ, trace it to the requester's own words.**

## When the requester reports with a screenshot, the SCREENSHOT is the DoD (2026-09-09, @Porter)
`TASK-301` was reported fixed twice and the owner found it standing twice. **Its DoD did not contain his exact
course and his exact click** — the screenshot was relayed as a DESCRIPTION rather than as an acceptance test.
🔑 **Adopted: a defect reported with a reproduction gets that reproduction as the first DoD line.**
⚠️ **And assert the OUTCOME, not the mechanism:** *"the leave succeeds"* AND *"the expiry moved"* — **the leave
going through with a stale date is the same defect wearing a different face.**

## The test for an unauthorised limit: does the cited source ask for a REFUSAL, or only name a WORRY? (2026-09-09, @Jason)
🔑 ***"The first is a grep; the second is a read."*** ⚠️ **Do NOT apply this to the extension ceiling — see the
correction above; the ceiling passes this test.** **It earns its place on what it actually caught, the same day:**
- ✅ **`TEACHER_CHANGE_TOO_LATE` PASSES cleanly** — `SPEC-028 §5 #3` specifies the mechanism, names the code, and
  attributes the number (*"3 days (owner)"*). **The source asks for the refusal.**
- 🔴 **`LEAVE_NOTICE_TOO_LATE` cannot be closed.** `SPEC-048` **inherits** the refusal and never asks for one — its
  own ask is that the values become *editable settings* (`REQ-047`). **The refusal's authority is cited as
  `UC-029`** — ⚠️ **and `UC-029` does not exist in this workspace: every mention is a reference to it, never a
  definition.**
  🔴 **And it matters now: `REQ-085 §12` says the QUOTA is the only thing that may ever refuse a leave, and this
  refuses one.** It has an admin `override` — **but a parent using LINE self-service has no override.** 🚫 Nothing
  changed; raised to the owner.
📌 **A limit whose authority is a document nobody can read is a different problem from one with no comment at
all** — **and harder, because the citation looks like an answer.**
## `firstFreeWeeklySlot` gives up and answers anyway — and its backstop was deleted (2026-09-09)
`MAX_EXTENSION_WEEKS_SCANNED = 26` (`extension-slot.ts:7`): the scan finds no free slot and **returns the last
candidate regardless.** Its comment says *"the caller's ceiling is what refuses it — this function never silently
invents a valid-looking date."* 🔴 **That caller was `EXTENSION_CEILING`, removed by TASK-308.**
⇒ **on a slot booked solid for 26 weeks a make-up lands SIX MONTHS out and the expiry stretches to meet it, in
silence.**
✅ **RULING: it must not REFUSE (`§12` forbids it) and must not be SILENT** ⇒ **the leave succeeds and the ADMIN is
told.** 🔑 ***A refusal is the owner's to grant; a warning is ours to owe*** — the shape of `warn, and still save`
(REQ-082 AC-4) and `§11.3`. ❓ **The threshold is with the owner; `26` was chosen as a scan limit, not a promise.**

## `MAX_STUDENTS_PER_PARENT = 5` cites nothing (2026-09-09)
`parent.service.ts:13`, refusing at `:119`, commented *"Business rule: a single phone may register at most 5
students"* — **no REQ, no SPEC, no TASK, no owner ruling.** The customer's own copy hardcodes 5
(`line-i18n.ts:142`), **and it cannot be told from the repo whether the copy is the SOURCE or an ECHO of the
code — which is itself the finding.**
📌 **Raised to the owner via @Porter as two questions — *is five yours?* and *do you want a limit at all?*** 🚫 Not
changed; nothing is broken. ⚠️ **A family with six children would meet a wall nobody remembers building.**

## `searchExhausted` — a warning trigger nobody had to choose (2026-09-09, TASK-309)
`firstFreeWeeklySlot` returns the last candidate when its 26-week scan finds nothing, so **a found slot and a
surrendered one differ by exactly one signal: the distance.** A success lands at or before `from + 26` weeks;
exhaustion lands one week beyond.
✅ **So the alert fires on EXHAUSTION, not on a threshold anyone picked** — 🔑 *"a threshold of my own choosing would
be the same mistake as the ceiling."* **The leave succeeds, the ADMIN is told (never the parent), and the alert
carries `weeks` / `replaces` / `landedOn` so a tighter number can become one constant later.**
✅ **A normal make-up warns nobody, including one that skipped a few busy weeks** — *a warning that fires every
time is not a warning.*
📌 **The general form: when a threshold is needed and nobody has authority to set one, look for a signal the
mechanism already produces.**

## A field that CANNOT be true beats a field assigned `false` (2026-09-09, TASK-309)
The creation preview's `exceedsCeiling` now compares against `max(bornCeiling, furthest session the preview laid
out)` — **and nothing in that array can exceed a maximum taken over it**, so the field is false **by
construction**.
🔑 **Left as the computation rather than a literal `false`, so *"the day someone narrows the ceiling again it starts
telling the truth instead of lying quietly."***
⚠️ **The field stays on the DTO** — the FE reads it to disable `Create plan`. **Two repos, one order: the FE gate
goes before the field does, never both at once.**

## The registration screens are BILINGUAL; the rest of the conversation is not (2026-09-09)
`REQ-079 §17c` — the customer's verbatim copy — shows **Thai and English in one block on every registration
screen**. ⚠️ **This SUPERSEDES the TASK-307 ruling that `add_student_name_prompt` render in the session's single
language.**
🔑 **Both are right, and `both()`'s own purpose is the reconciliation: it exists for a reader whose language is
not yet KNOWN — and during REGISTRATION it is not.** ⇒ **bilingual on the `§17c` screens; single-language once the
session knows.**
📌 **`§17f` (@Porter's ruling): NONE of the eight numbered headings is sent** — *"a table of contents, not
copy"* — **and screen 2's `เลือกบทบาท / Select Your Role` is the one whose text defeats the requirement its own
screen exists to satisfy.**

## The entire LINE surface is served by the BACKEND (2026-09-09)
Checked, not assumed: **nothing in `smart-scheduler-front` touches `line-webhook`, `replyToken` or
`enqueueLine`.** ⇒ **the front end serves the admin frontoffice and no part of the LINE conversation or its
notifications.**
🔑 **Consequence for release planning: a LINE test round is gated by the BACKEND deploy alone.** ⇒ **FE work can
never delay a LINE round, and a "split deploy" to get one LINE item out early is not a thing that needs
negotiating — the two repos already are the split.**
⚠️ **The real caveat is the opposite one: deploying the backend ships EVERYTHING currently in it**, so "just this
one item" is never available within a repo. **Whether that is safe is a question about what else is in there,
not about the item.**

## `both()` cannot render the `§17c` registration screens — the STRING is bilingual, the call site is not (2026-09-09, TASK-310)
`both()` stacks a whole Thai body above a whole English one. **`REQ-079 §17c` alternates LINE BY LINE** — a Thai
sentence, its English sentence, and on screen 4 a `เบอร์โทรศัพท์ / Phone:` line in the middle of the pair. ⇒
**there is no pair of `TH`/`EN` values `both()` could join to make their screen.**
✅ **So the STRING holds both languages and the call site keeps `t(key, lang)`** — which satisfies TASK-307's
property more strongly: **every reader gets the IDENTICAL screen.**
🔑 **The guard lives in the JOINER, not in a list of keys:** `both()` now returns a body once when both languages
render the same text — **because `` tb(`code_${role}`) `` renders a `§17c` screen for a parent and one of OURS for
a teacher from ONE expression**, so no call site could carry the rule.
⚠️ **A doubled screen passes every string pin** — assert the ASSEMBLED screen.

## The errors clustered where we DECIDED, not where we TRANSLATED (2026-09-09, @Jason, TASK-310)
Scoring our eight registration screens against the customer's own `§17c`:
- ✅ **Five English sentences were already byte-correct** — **because `§17b` was a transcript of the same
  document.** *"Our wording was right wherever we COPIED it"* — which says almost nothing about our writing.
- 🔴 **The four that were WRONG were all STRUCTURAL, not tone:** the role list (`§5`'s whole subject) · the
  address asked as ONE part when they ask for three · their *"type เพิ่มนักเรียน"* invitation missing · their
  field labels dropped **by an explicit judgement (TASK-278)**.
🔑 **TASK-278 named five places their text *"must not be applied literally"* — three right, two wrong, and both
misses are the same mistake: reading BODY TEXT as document furniture.** *(`§17f` later ruled the numbered HEADINGS
out on that same reasoning, correctly — same reasoning, two different objects.)*
⇒ ⚠️ **An editor (`REQ-086`) would have prevented NEITHER miss.** 📌 **Its shipped defaults matter less than a
review of what an engineer decided NOT to apply.** **Still worth building; it buys something narrower than "we
stop getting the words wrong".**
✅ **The cheap control is the one TASK-310 used: pin the customer's text byte-for-byte in a test.**

## 💬 LINE commands, reserved words and the registration doors

### The bot's command vocabulary is ONE file and ALREADY bilingual — except `ครู` (2026-09-09, `§13` inventory)
`src/lib/line-commands.ts` holds the router's vocabulary **and** the reserved set, deliberately (TASK-245:
*"a second copy is how 'the bot said `เมนู` is a command' and 'the bot stored `เมนู` as a name' both become true
at once"*).
✅ **English forms already accepted:** `register` · `menu` `help` · `courses` `mycourses` · `admin` ·
`children` `students` · `qr` · `checkin` `check-in` · `leave` `sick` · `schedule` · `calendar` · `cancel` ·
`reopen` `open menu` · `skip` `no` `done`, plus `confirm` `yes` `ok` in `lib/line-add-student.ts`.
🔴 **The only Thai keyword with no English form is `ครู`.**
⚠️ **Two keywords live OUTSIDE that file** — `confirm` (`line-add-student.ts`) and `Add Student` (a REGEX in the
router) — **so a "every keyword has an English form" sweep over the list cannot see them.**

### 🔴 `Add Student` creates a child NAMED "Student" (2026-09-09)
`line-webhook.service.ts:1028` — `raw.match(/^(?:เพิ่มนักเรียน|เพิ่มลูก|add)\s*(.*)$/i)` — and `:1031` adds a
student with the captured remainder as the NAME.
**`REQ-079 §17c` screen 8 tells the parent: *please type "Add Student"*.** ⇒ **`add` matches, `Student` is
captured, and a child called `Student` is created — silently, successfully, wrongly.**
⚠️ **`Student` is not in `RESERVED_WORDS` (`students` is), so nothing stops it.**
🔑 **This is TASK-245's defect returned: the bot advertises a phrase and swallows part of it as data** — the one
that cost the owner *"a student record that can never be deleted"*, **and there is still no delete route and no
archive flag.**
📌 **The failure mode: obey our own screen, in the language our own screen offers, and create a permanent record.**

### 🔻 CORRECTED 2026-09-09 — the `add` prefix swallows `address` and `Add Student`. **NOT `admin`.**
**The earlier version of this entry claimed `admin` created a child named `in`. That is FALSE — `a-d-m` is not
`a-d-d`.** Run, not read:
```
"admin" -> NO MATCH   |   "address" -> "ress"   |   "Add Student" -> "Student"
```
🔻 **@Sober asserted it from reading the pattern, sent it as URGENT while @Porter was mid-warning to the owner,
and @Porter relayed it.** ⇒ **`CMD_ADMIN` was reachable the whole time.**

**What was REAL, and justified shipping on its own:** `line-webhook.service.ts:1028` —
`/^(?:เพิ่มนักเรียน|เพิ่มลูก|add)\s*(.*)$/i`, where **`add` is a bare prefix and `\s*` matches EMPTY**:
| input | result before TASK-312 |
|---|---|
| **`Add Student`** *(screen 8 tells the parent to type it)* | a child named **`Student`** |
| `address` | a child named `ress` |
⚠️ **Neither is in `RESERVED_WORDS`, and there is no delete route and no archive flag — both writes are
permanent.** 🔑 **TASK-245's defect returned: the bot advertises a word and swallows part of it as data.**
✅ **Fixed in `parseAddCommand` (pure, `line-add-student.ts`): `add` is the command only when the input ENDS
there or a SEPARATOR follows, and `Add Student` is matched as the COMMAND (case-insensitive, space-collapsed).**
**`Add Student Emily` creates `Emily` — the phrase takes a name exactly as bare `add` does.**
🚫 **The check still sits ABOVE `CMD_ADMIN`, pinned by a source assertion** — *the pattern was the defect, not
its position.*

### 🔴 `add child` — OUR OWN English menu writes a child named `child` (2026-09-09, unfixed)
`line-i18n.ts:220`, the EN menu's first line: *"· add child — register a child (up to 5)"*.
⇒ **a parent who types what our menu tells them gets a permanent record named `child`.**
🔑 **TASK-312 could NOT have caught it: `add child` IS the correct shape for an inline add** — separator, then a
name. **It was true before that fix and is true after.**
📌 **`Add Student` came from the customer's copy. This one we wrote ourselves.** ❓ **With @Porter as a COPY
decision** — rename the hint, reserve `child`, or make `add child` a phrase.
⚠️ **Also named, not fixed: `เช็คอิน 2` / `ลา 1` are Thai-only regexes** (`:1055`, `:1065`) — **`checkin 2` and
`leave 1` match nothing.** **Never advertised in English, so nobody is told to type them.**

### 🔻 `ครู`/`teacher` was never missing — an inventory's SCOPE is part of its claim (2026-09-09)
**@Sober inventoried `lib/line-commands.ts`, found no `ครู`, and reported "the only Thai keyword with no English
form".** 🔴 **`ครู` is not in that file at all** — **the bot accepts it in `parseRoleChoice`, where `teacher` has
sat since TASK-251.**
⇒ **@Porter took a ratification question to the owner that never needed asking, and @Jason correctly refused to
add a `teacher` command keyword** — *"that would have been inventing a command nobody asked for."*
🔑 **The inventory was accurate about the file and wrong about the product.** ⚠️ **State the SCOPE of a sweep in
the same breath as its result** — *"nothing in `line-commands.ts`"* is a different claim from *"nothing in the
product"*, and only one of them was true.
### `REQ-085 §13.3` — every English keyword is CASE-INSENSITIVE, and the test must be ABSURD (2026-09-09)
> *"คำสั่งภาษาอังกฤษ ต้องไม่สนใจ จะพิมพ์เล็กใหญ่ได้หมด เช่น confirm Confirm ConFirm ConFiRM"*

🔑 **The letters are what matter; their case never does.** ⚠️ **English only — Thai has no case.**
🔴 **Test with `ConFiRM`, never `Confirm`:** *a test using `Confirm` passes a `toLowerCase()` applied to the first
letter only.* **The owner's four absurd examples ARE the requirement.**
📌 **`Add Student` carries case AND a space** ⇒ `ADD STUDENT` · `add student` · `AdD StUdEnT` · and collapsed.
🚫 **Case-insensitive is not FORGIVING: `CONFIRMM` is not `confirm`.** **We accept the same WORD however typed;
never a different word.**

### 🔴 The reserved-word guard is on ONE of two doors — `add เมนู` writes a child named `เมนู` (2026-09-09)
| path | check |
|---|---|
| the name PROMPT — `line-webhook.service.ts:563` | ✅ `isReservedWord(name)` → `strikeOrPrompt` (TASK-245) |
| 🔴 the INLINE add — `:1035` | 🔴 **none**; `addStudentAndReply(name)` is called directly |
⇒ **`เมนู` typed at the prompt is refused; `add เมนู` creates a permanent child named `เมนู`.**
🔑 **That is TASK-245's ORIGINAL defect** — *"`เมนู` was stored as a child's NAME, in a roster with no delete, by
a bot that had just told him `เมนู` was a command"* — **live on the other door the entire time.**
📌 **The shape: a rule extracted into a helper, applied where the defect was REPORTED, never applied to the
sibling call site.** ⚠️ **Second instance this week — the leave notice fired from one door of four (TASK-306).**
***The fix went where the report came from.***

### "What the product ADVERTISES is reserved" is two-thirds mechanical (2026-09-09, @Porter's principle)
> ***No word the product PRINTS in a menu or a prompt may become a child's name.***
1. ✅ **STRUCTURAL** — with the inline guard in place, every word in `RESERVED_WORDS` is unusable as a name on
   both doors, by construction.
2. ✅ **MECHANICAL for the MENU** — `menu_body` is `· <word> — <description>` in both languages, so a test can
   parse the menu STRING and assert every advertised token is reserved. **It fails the day someone advertises a
   word without reserving it.**
3. 🔴 **HAND-KEPT for the customer's eight `§17c` screens** — they are PROSE (*"please type "Add Student"."*) and
   no parser finds that reliably. **Mitigation, not mechanism: `§17c` is pinned byte-for-byte (TASK-310), so the
   words cannot change silently; what is unguarded is a NEW instruction added later without reserving its word.**
⚠️ **Declared in the test file beside the part that works** — the same rule as TASK-312's blind spot.

### `add child` is retired as ADVERTISING, not as input (2026-09-09, @Porter's copy ruling)
**Three phrasings for one act — `เพิ่มนักเรียน` (ours) · `add child` (ours) · `Add Student` (the customer's,
screen 8) — TWO of them ours.**
✅ **The EN menu now says `Add Student`** — the customer's own phrase, matched by the same rule.
🚫 **We do not invent a second English phrase for an act the customer has already named.** 🔑 *Two ways to say one
thing is how it starts meaning two things.*
⚠️ **`add child` REMAINS ACCEPTED** — parents have seen it. **It stops being advertised; it does not start being
refused** — and when typed it must ADD a child, not name one `child`.

### The wizard door gets the rules; the INLINE door predates them (2026-09-09, @Jason)
> ***"`addStudentAndReply` predates the wizard, and every rule written FOR the wizard was written INTO the
> wizard. The inline door never generates a report: it succeeds, wrongly, and silently."***

🔑 **The wizard is the door with a prompt to get STUCK in, so it is the only door that ever complains** — which is
why *"the fix went where the report came from"* keeps producing defects in this feature specifically.
**Four instances found in one week, all by ASKING, none by failing:**
| rule | on the wizard | on the inline add |
|---|---|---|
| the leave notice (TASK-306) | ✅ | 🔴 one door of four |
| `isReservedWord` (TASK-313) | ✅ `:563` | 🔴 none — `add เมนู` wrote a child named `เมนู` |
| `decideDuplicate` (AC-9) | ✅ | 🔴 **`add น้องเอ` twice creates two identical PERMANENT records** |
| `notifyAdmins({student_registered})` (AC-11) | ✅ | 🔴 **a child added inline is one no admin is told about** |
⚪ **NOT an instance:** the cap's courtesy check is wizard-only but **harmless** — the write's own precondition
still enforces it, *which is why it was extracted.* **A worse MESSAGE, not a missing rule.**

### `add child` is the COMMAND, and `child` is NOT reserved (2026-09-09 ruling)
@Porter: *"`add child` must still be ACCEPTED — parents have seen it. It stops being ADVERTISED; it does not start
being refused. **And when it is typed, it must add a child and NOT name one `child`.**"*
⇒ ✅ **`add child` is a PHRASE like `Add Student`** — bare it starts the prompt; `add child Emily` creates `Emily`.
🚫 **`child` must NOT join `RESERVED_WORDS`** — ⚠️ **that would REFUSE a parent who typed the retired phrase
instead of SERVING them.** 🔑 **Reserving is for words we ADVERTISE; this one we retired.**

### `add child` is a PHRASE, and AC-11's notification lives on the LINE side (2026-09-09, TASK-313 §5 / TASK-314)
✅ **`parseAddCommand` has one alternative (`student|child`): `add child` · `AdD ChIlD` · `addchild` → the prompt;
`add child Emily` → `Emily`; `addchildemily` → nothing.** 🚫 **`child` is NOT in `RESERVED_WORDS`** — reserving is
for words we advertise, and this one was retired.
✅ **AC-9's duplicate rule moved to HANDLER helpers** — *"the rule's whole content is a QUESTION, and only a
handler can ask one"* — and an inline duplicate now joins the wizard at `AWAIT_STUDENT_DETAIL`.
✅ **AC-11's `student_registered` moved to `createStudentFromLine`, NOT to `createStudentForParent`** — 🔑 **that
service function is also the STAFF screen's write, so an admin adding a student would be notified of their own
act.** **The rule is *a parent registered a child over LINE*, so it lives on the LINE side.** ⇒ **one caller, one
notify site, unskippable by construction.**

### 🔴 `REQ-085 §6.1` — the no-skip rule applies ONLY to a family with ZERO children (2026-09-09)
**The defect, from the owner's own screen:** a phone with FOUR existing children linked and was dropped straight
into *"กรุณาระบุชื่อนักเรียน"* — **a family with four children made to add a fifth**, with `ยกเลิก` the only exit
and not advertised in English. **Owner: *"เหมือนบังคับเลยมั้ย"*.**
✅ **RULING (ratified):** **0 children → the mandatory prompt, unchanged.** **≥1 child → NO prompt: the
found-your-family line, then the screen-8 invitation (`add_another_hint`), then the menu.**
🔑 **`§6`'s justification was *"a parent account with no child can do nothing"*** ⇒ **a family that already has
children can do everything, so the rule never reached them.**
🚫 **Not fixed by adding a skip:** ***the prompt should not be there; a skip on a prompt that should not exist is
a second wrong thing.***
🔴 **TWO doors set that step: `line-webhook.service.ts:1327` (link success) and `:1291` (the 2FA branch, which
has already fetched the children).** ⚠️ **2FA is unreachable today (`line_parent_2fa` off) and exists so
*"switching the setting on is a setting change and not a rebuild"*** ⇒ **fixing only the reported door means the
defect returns the day that switch is flipped, by someone certain they changed only a setting.**

## An English-only defect on a Thai-speaking team is invisible by construction (2026-09-09)
**`admin` has been broken since inline-add was built and nobody reported it — because everyone here types
`แอดมิน`.** 📌 **`REQ-085 §13` exists because the customer has foreign parents: they are exactly who would have
found it, in production, by following our own menu.**
🔑 **The general form: a branch nobody on the team has a reason to walk is untested by the team's own habits, not
by oversight.** ⇒ **ask which paths have an ENGLISH (or any minority) branch that no one here has ever used.**

## A parsed-from-source assertion found a defect its own principle had not named (2026-09-09, TASK-313)
The test that parses `menu_body` for advertised tokens **found `เพิ่มนักเรียน` and `Add Student` unreserved on its
first run** ⇒ **`add เพิ่มนักเรียน` would have written a child named `เพิ่มนักเรียน`.**
✅ **Closed WITHOUT a second list: `isReservedWord` CONSULTS `parseAddCommand`** (`parseAddCommand(text)?.name ===
null` ⇒ reserved), **so the regex stays the single source and the two cannot drift.**
🔑 **A guard whose reach is DERIVED from what the product prints catches words nobody remembered to reserve.**

## 🔴 A GREEN mutation is a result about the TEST, not the code — a source pin proves a line EXISTS, never that it EXECUTES (2026-09-09, @Jason, TASK-314)
Break-and-watch mutation B disabled the inline duplicate question (`if (false && …)`) and the suite came back
**9 pass, 0 fail** — because the pins were an `indexOf` ordering check and a `toContain` of the helper call, **and
both are satisfied by the TEXT of a condition that can never run.**
> *"A green mutation proves nothing, and I nearly reported it as coverage."*

🔑 **This is the limit of the technique we leaned on all week** — source-text pins are the only way to assert a
DB-bound path from a pure test, **and they cannot tell a live line from a dead one.**
✅ **The fix: pin the EXACT guard line, and write the reason beside the pin.** ⚠️ **And chase every green mutation
rather than filing it — it is evidence the assertion is in the wrong place.**

## Look for TWO WRITERS, not two doors (2026-09-09, @Jason)
Counted rather than reasoned: **nine of eleven `do*` handlers are reached from BOTH the typed word and the tap,
and converge on ONE function within a line** — so the rules live in that function and cannot diverge.
`doCheckin`/`doLeave` look single-door only because the tapped form carries a booking id and lands on the
`…Booking` sibling — the same convergence, one hop later.
🔑 **Add-student was the ONE feature with TWO WRITERS** — `addStudentAndReply` (older, inline) and the wizard's
confirm (newer) — **which is why FOUR instances of "the rule guards one door" landed in one feature in one week
and none anywhere else.** ✅ **After TASK-313/314 it has one writer (`createStudentFromLine`).**
📌 **Two pairs to watch, neither a defect today:** **`verifyAndLink`'s 2FA branch** (existing parent only —
correct, but a rule on one branch of two) and **`handleFollow` vs the unlinked-postback fallback**, which
**diverged once (TASK-231's silence rules) and was re-converged by hand.**
⇒ ***two doors that converge are safe; a feature whose second entry point grew its own WRITE is where the next
one is.***

## A rule can be RIGHT and its BOUNDARY assumed — and tests that match the requirement exactly will pass (2026-09-09)
`REQ-085 §6` shipped in the morning and produced a defect on the owner's phone the same afternoon.
**TASK-307 asserted both halves the requirement named** — *a parent with NO children cannot skip*, *a parent WITH
a child can still skip* — **both true, both green.** 🔴 **Neither is the failing case: a family with children being
forced into the flow AT ALL.**
🔑 **The gap was not in the assertions; it was in the requirement, which never said what happens to a RETURNING
family.** 📌 **Tests written faithfully to a requirement cannot cover a case the requirement does not mention** —
⇒ **when a rule is about a STATE (no children), ask what the other states do, and write that into the
requirement rather than leaving it to the code.**

## 🔴 A restore that fails silently turns "break it and watch" into "break it and ship it" (2026-09-09, @Jason)
On TASK-315 his mutation script's RESTORE threw, **so the `bun test` after it never ran** — the passing number he
first saw was **stale output from before the mutation**, and the working tree still contained `if (true)`.
**He caught it only by READING the file back.**
🔑 **New rule, his:** **verify a restore by READING the line, never by the exit code of the script that wrote
it.**
✅ **And @Sober's review rule adopted from it: any report that mentions a mutation gets the suite RE-RUN by the
reviewer, not read from the report.** ⚠️ **This is the one error class this week that could have reached the
owner as a broken DEPLOY rather than a wrong belief.**

## A rule that names who it PROTECTS, and not who it TOUCHES, has an assumed boundary (2026-09-09, @Jason)
> *"`REQ-085 §6` was specified for the population it was ABOUT — parents with no children — and silent about the
> population it would also REACH."*

**TASK-307's two assertions were the right two for what `§6` said** — *no children cannot skip*, *with a child can
still skip* — **both about a parent already INSIDE the add-child flow.** 🔴 **The defect was about whether a family
should be in that flow AT ALL: a question the requirement never asked, so no assertion could have been written
against it.** ⇒ ***not a missing test; a missing sentence.***
🔑 **The pair to carry:** ***"look for two writers" finds the sibling DOOR; "look for the sibling POPULATION"
finds this.*** 📌 **Both are questions asked at the right moment, not coverage targets.**

## Record the assertion you REJECTED, inside the test file (2026-09-09, @Jason)
His first TASK-315 assertion counted `setStep(…, "AWAIT_STUDENT_NAME", …)` and expected 3; there are **4** — the
inline add's prompt, TASK-313's reserved-word refusal and the `register` postback all set it legitimately. ⇒ **a
count that includes them measures the wrong thing.**
✅ Replaced with the property actually meant — **neither door contains the decision, asserted as an ABSENCE on
both slices** — **and the WRONG version is named in the test so the next reader does not re-add it.**
🔑 **The obvious-but-wrong assertion is exactly what a future reader reaches for; writing down why it was
rejected is worth more than the one that was kept.**

## 📱 LINE MOBILE AND LINE DESKTOP DO NOT RENDER OUR MESSAGES IDENTICALLY (2026-09-10, owner-verified)
**Same message, side by side:** **desktop ends at the last field; MOBILE shows a VISIBLE EMPTY LINE below it.**
**Reported by the customer** (*"ในคอมไม่ขึ้น แต่ในโทรศัพท์ขึ้นค่ะ"*), **then reproduced by the owner with both
clients on screen at once.**
📖 **Likely cause (@Porter, unconfirmed): a TRAILING NEWLINE that desktop trims and mobile does not** — **most
probably a conditional field emitting its separator before deciding it has nothing to print.**
🔴 **THE CONSEQUENCE, which outlives the bug:** **every message check this team has ever run was on a computer.**
⇒ **we have been verifying a DIFFERENT RENDERING from the one a parent sees.** **Nobody here has a phone; the
owner is the only person who can see what we actually ship.**
📌 **So a message that "looks right" in a transcript, a screenshot from a desktop, or an API payload is verified
for CONTENT and not for APPEARANCE.** **Say which one you mean.**

## `§14`'s flow already exists — only the WINDOW is one day wide (2026-09-10)
`doLeave` (`line-webhook.service.ts:901`) already **scans**, already asks **which child** (`needsChildStep`, only
when ≥2 have a session), already lists **which session** (`sessionPicker`), and already skips the question when
there is one answer. 🔴 **`findTodayBookingsForParent(lineUserId, date)` is the whole defect.**
🔴 **And `doLeaveBooking` (`:915`) re-fetches with the SAME today window** ⇒ **widening only the picker makes
every pick outside today fail authorization AFTER the parent has chosen.** *(The sibling-door shape again.)*
✅ **Eligibility must reuse `hasEnoughLeaveNotice`, the helper `updateBookingStatus` throws from** — 🔑 *offering a
session the bot will then refuse is worse than not offering it*, and `§12.2` keeps that refusal.
📌 **The empty message must distinguish "nothing upcoming" from "everything is inside the cutoff"** — *"too late
for tomorrow's class, call the school" is help; "no class eligible" is a shrug.*

## `REQ-085 §4` governs values the system GENERATES, never what a message is CALLED (2026-09-10, @Porter)
`§4` — *"eng ล้วน ไม่ควรไทยเลยแม้แต่ติด"* — was always about the SYSTEM'S OWN words (`Date : อังคาร` → `Tuesday`,
`ไม่มี` → `(-)`). ⇒ **it does not forbid the customer's bilingual HEADER `LEAVE NOTICE / แจ้งลา ‼️` (`§16e`),
which REVERSES the owner's earlier `§9` English-header ruling — superseded, not wrong.**
🔑 **Write the boundary next to the header**, or someone "fixes" it back to English citing `§4` — 📌 **exactly the
shape that let `Date : อังคาร` ship after `REQ-079 §18` had already ruled labels English.**
⚠️ **And the audience is why it holds: the leave notice goes to COACHES and ADMINS, never a parent** — **the one
notification with a Thai header is the one no parent ever sees.**

- 🔴 **The LEAVE NOTICE date format is the CUSTOMER's: `Date : 10-09-2026`, the date ALONE, `DD-MM-YYYY`** —
  `REQ-085 §16d`. 🔻 **@Porter's `Tuesday 22/Sep/26` was withdrawn**; the customer used the same `DD-MM-YYYY`
  they specified for date of birth in `REQ-079 §17c`. 🚫 **The `§14` picker's `อังคาร 22/09` is a DIFFERENT
  surface and stays as it is** — two audiences, two formats, both correct. *(TASK-318)*
- 🔴 **The leave-notice header is `LEAVE NOTICE / แจ้งลา ‼️`, BILINGUAL** (`§16e`) — **this REVERSES the
  owner's own `§9` English-header ruling**, which was given before the customer had asked. **Superseded, not
  wrong.** 🔑 **The boundary that keeps it alive, and it is written in the code beside the header:** ***`§4`
  governs values the system GENERATES; it never governed what a message is CALLED.*** ⚠️ **Without it, `§4`
  gets cited to "fix" the header back to English** — the same shape that let `Date : อังคาร` ship after
  `REQ-079 §18` had ruled labels English. ✅ **It holds because the audience is coaches and admins, never a
  parent.** *(TASK-318)*
- ✅ **`Sessions :` is removed from `§7.1`** (`§16.4`) — the program name already carries the hours
  (*"Freeskate 6 HR"*). 🚫 **`Remaining` and `*Expiry date` STAY** — they are how a coach tells a COURSE row
  from a one-off, which is the owner's own acceptance criterion (*"ไม่งั้นมันจะแยกยังไง"*). ⚠️ **`§7.1`'s
  byte pin is REWRITTEN, not deleted** — *an assertion that changes because a requirement changed is correct;
  one deleted because it failed is how this class ships.* *(TASK-318)*
- 🔑 **A label is at risk exactly when it names an attribute that is CONSTANT across the set it is displayed
  in** — and **whenever a list's WINDOW widens, re-ask what VARIES among the rows, because the label was
  written against the old set and NOTHING WILL FAIL.** *(@Jason, TASK-316 — the `§14` picker labelled
  sessions by teacher and program, which are identical across the rows being told apart.)*

- 🔴 **`note` and `attendeeNote` are TWO DIFFERENT booking columns and only ONE of them is ever rendered.**
  **`attendeeNote`** (TASK-178) is what the plan editor's `Session note` reads/writes and **the only note any
  LINE message renders**; **`note`** is the **STATUS-FLOW** note where machine text lands
  (*"ยกเลิกโดยแอดมิน"*), displayed in exactly one place in the app (`BookingModal.tsx:461`).
  📌 **`coursePackages` has NO note column** — only `endNote`. 🔑 **A note "on a course" is always N rows on
  the bookings, never one row on the course.** *(TASK-320)*
- 🔴 **The create-course dialog sent the admin's note as `note`, never `attendeeNote`** —
  `CreatePlanFlow.tsx:214` — **while `createCoursePackage` already sent `attendeeNote` and the BE and schema
  had accepted it since TASK-178.** ⇒ ***"one note at creation, carried onto every session" was never
  reachable from the UI, from REQ-068 until TASK-320.*** 🔑 **Every layer individually correct, the product
  doing nothing: each side asserted its own half of a boundary neither crossed.** ⚠️ **The fix is NOT
  retroactive.** *(TASK-320 — and `courseNote`/TASK-284's BE fix were correct all along.)*

- 🔑 **@Fern's rule, and it is the FRONT END's own version of @Jason's:** ***on the front end a label becomes
  at risk when the USER'S PATH gains a second candidate for the thing it names — not when a SCREEN does. And a
  path is exactly what no component's tests can see.*** 📌 **The `Ends` defect crossed two screens** — the
  owner conflated the course CARD's `expires` with the plan MODAL's `Ends`, **and neither screen's own context
  had changed.** ⇒ **@Jason's form names the SET (one screen); hers names the PATH (two).** *(TASK-319)*
- 🔴 **`attendeeNote`'s own hint FORBIDS what the product's own fixtures put in it.** The hint (REQ-068 /
  TASK-178, both languages) reads *"Not for phone numbers, addresses or medical details"* — **while `แพ้ถั่ว`
  (a peanut allergy) is the canonical `Remark` fixture in the back end's tests**
  (`customer-english.test.ts:238`, `line-message-fields.test.ts:225`). ⚠️ **OPEN — with the owner through
  @Porter (2026-09-10):** is `Session note` logistics-only (⇒ our fixtures teach the wrong example) or
  anything-a-coach-should-know (⇒ the HINT is wrong)? 🚫 **Nothing changed pending his answer; the TASK-320
  wiring is correct either way.**
- ⚠️ **The BROKEN-typecheck fact is BACK-END-ONLY, and here is why.** `smart-scheduler-front` has typescript
  in its own `node_modules`, so **`bunx tsc --noEmit` there resolves to the local one and works (exit 0)**.
  `smart-scheduler-back` has NO local typescript, so `bunx tsc` downloads one and panics ⇒ **there, and only
  there, use `bunx --package typescript@5.6.3 tsc --noEmit`.** 📌 **Even that can fail with a missing
  `lib.*.d.ts` from a half-populated bunx cache** — the reliable fallback in a repo that HAS typescript is
  `bun node_modules/typescript/lib/tsc.js --noEmit`. *(Verified by @Sober, 2026-09-10.)*

- 🔑 **@Jason's law, tested against ten items and ADOPTED (2026-09-10):** ***everything we wrote that was a
  rule about BEHAVIOUR survived the customer; everything that was a rule about APPEARANCE was overridden the
  moment they spoke.*** ⇒ **the split is not "defects vs wording" — it is *what the message must DO* vs *what
  it must LOOK LIKE*.** ✅ **Consequence, now standing: the ACCEPTANCE CRITERION is the deliverable and the
  string is a PLACEHOLDER until the customer ratifies it** — 🔑 **and the concrete cost is that @Sober stops
  asking for BYTE PINS on strings the customer has not seen.** 📌 *The convention already exists in the repo:
  `PENDING_RESCHEDULE`'s comment says "PLACEHOLDER … do not treat it as agreed."* 🚫 **We do NOT stop designing
  the wording — you cannot find the defect without imagining the fix; the string is the by-product of the
  thinking, not the waste.** *(`§15`'s durable content was ONE sentence and it survived all three readings.)*
- 🔴 **A TASK NEVER RE-TRANSCRIBES A SPEC BLOCK — it points at the requirement.** @Sober compressed `§16d`'s
  one-field-per-line block onto two `·`-joined lines in TASK-318, @Jason wrote his byte pin from the task page,
  **and it failed against `REQ-085` itself.** ⚠️ **Had he trusted the task, he would have rewritten the field
  block for EVERY template to match an artefact the task introduced.** 🔑 **Where a TASK and a REQUIREMENT
  disagree, the REQUIREMENT wins, without asking.** *(TASK-318)*
- ✅ **`§16d`'s `Time :12:00-13:00` (no space) is DELIBERATELY NOT reproduced**, and the reason is a BEHAVIOUR
  rule, not an appearance judgement: **`TASK-257 §3` — a message with two labelling conventions is what put
  `จำนวนคาบที่ยืนยัน` under eight English labels.** ` : ` is the separator in every field of every template.
  📌 **Reported to the customer through @Porter as a stated deviation, never a silent one.** *(TASK-318)*
- 🔑 **The general test for any "remove the redundant field" request** (@Jason, TASK-318 §4): ***removing one
  of two fields is safe only because they had already been made to AGREE. Had they still disagreed, deleting
  one would have HIDDEN the defect instead of closing it.*** 📌 *The safe edit and the defect-hiding edit are
  the same keystroke; only the state BEFORE it tells them apart.*

- 🔑 **@Jason's TELL, adopted (2026-09-10) — run it BEFORE dispatching a copy item:** ***count the call sites
  of the string the customer named; a copy item is a SCOPE DECISION exactly when the string is SHARED, and you
  only need to ask "which screens?" when the answer is more than one.*** ✅ **It partitions the whole `§16`
  batch correctly**: `§16.2`'s exit hint had **11** sites and arrived under-scoped; `§16g`, `§16.4` and `§16d`
  had one each and did not. 📌 **And the cause is THEIR document being right, not wrong: a screenshot cannot
  know a string appears anywhere else — a customer describing what they SEE is the customer doing it right.**
  ⚠️ **Predicted next: `add_student_name_prompt` (5 sites) and `withExit` (11) are the two shared strings left
  in the registration flow.**
- ✅ **A test that pins a COINCIDENCE turns a silent assumption into a scheduled question.** (@Jason, TASK-323
  `§16g`.) **Two keys hold the same value on purpose** — reuse would couple them silently, a copy would let
  them drift silently ⇒ **separate keys AND a test asserting they are equal**, so the day either moves a human
  is told and decides. 🔻 *@Sober had offered only the two flawed options and priced the risk of just one.*
- 🔴 **A TASK may say what to CHECK; any count, layout or list of sites in it is a HYPOTHESIS, not a fact — and
  the engineer's finding overrides it SILENTLY.** ⚠️ **Two instances in two days: `§16d`'s block compressed in
  TASK-318, and *"twelve call sites"* in TASK-323 (it is eleven — the twelfth match is the declaration).**
  🔑 **Both are the same failure: a DERIVED fact written into a task and pinned as an assertion.**
- 🔴 **There is NO shared time formatter in the front end, and dates have one.** Four sites render a raw
  `HH:mm:ss` (`ExpiryWarningAlert:54`, `EditExpiryDialog:205`, `BookingsTable:369`, `CreateCourseModal:174`),
  three do `.slice(0, 5)` inline (TASK-295's), and `formatDateDisplay` exists for dates.
  ⇒ 🔑 ***the owner reported the same missing function FOUR times in one week and every report looked like a
  one-line bug.*** 📌 **`contract.ts:155` documents `HH:mm:ss` and names the FE as the formatter — the contract
  is right; the formatter was never written.** *(TASK-324)*

- 🔴 **`§16.3` IS NOT DONE, and @Sober reported it done.** **`.trimEnd()` is in 5 of `formatOutboxMessage`'s
  14 branches and there is NO trim at the builder** ⇒ **nine messages are clean or dirty by accident of which
  branch someone trimmed.** 🔻 **@Sober assembled the completion table from MEMORY and ticked a row he had
  never dispatched — in the ONE message that releases a tester.** ✅ **Standing correction: the completion
  message is built by CHECKING each row IN THE CODE, and says so.** 📌 *A table assembled from memory is a
  report about that memory.* *(TASK-325)*
- 🔴 **MONEY: a shared formatter EXISTS and four local copies coexist** — `formatPriceMinor` against
  `FreelanceBudgetStrip:11` and `FreelanceBudgetControls:13` (**byte-identical lines**), `TeacherRowActions:36`,
  `TeachersContent:41`. 🔑 **Worse than the time gap precisely BECAUSE the shared one exists**, and
  `money-display.test.ts` already records that this must not happen — **pinned there because a 100× money
  defect shipped on that exact boundary** *(TASK-169: `391` took ฿3.91 instead of ฿391, found by @Tanya, not
  the compiler)*. ⚠️ **@Fern: *a wrong time is embarrassing; a wrong magnitude of money is actionable*, and the
  copies are in the FREELANCE BUDGET surfaces.** ❓ **OPEN with the owner via @Porter: may a budget legitimately
  format differently from a price?** 🚫 **Nothing moves on money until he answers.** *(TASK-324)*
- ⚠️ **The FE's `src/types/api/contract.ts` says *"Synced … keep in lockstep"* and has DRIFTED.** The sentence
  *"As stored (`HH:mm:ss`) — the FE formats"* exists only at `smart-scheduler-back/src/types/contract.ts:156`;
  the FE copy contains no `HH:mm:ss`. 🔴 **@Sober cited `contract.ts:155` in TASK-295 and TASK-324 for a line
  that lives only in the other repo** — **the third instance of a derived fact written into a task.**
  📌 **Neither repo's tests could ever have noticed.** *(TASK-326)*
- ✅ **`formatTimeDisplay` is a TRIM, not a parse, and that is LOAD-BEARING** (@Fern, TASK-324): a `dayjs` parse
  would "improve" a malformed value and **silently change what the three already-correct `.slice(0,5)` sites
  render.** 📌 **Byte-identical asserted against the OLD EXPRESSION itself** — the right way to prove it.
- 🔑 **@Fern, TASK-321: *a dead string kept ON PURPOSE with the purpose written down is the opposite of a label
  outliving its value.*** **`noLiveEnd` now has NO renderer** (both callers removed) but stays, because
  **TASK-294 is an OPEN RULING on it** — ⚠️ **and all THREE states of its pin are recorded, because that pin's
  REASON went stale twice in two days.** 📌 **TASK-294 now has a fact it did not have: one of its three strings
  is dead, which may make it a deletion rather than a rewording.**

- 🔴 **A BREAK-AND-WATCH WINDOW IS A WINDOW IN WHICH SOMEONE ELSE MAY COMMIT.** (@Jason, TASK-325.)
  **Commit `0d91b4d` captured his deliberately-mutated line** — a build in history with `§16.3` NOT fixed —
  **taken between his mutation and his restore, two Bash calls apart.** ⚠️ ***"Verify the restore by READING
  the line" protects YOUR state and cannot protect a commit taken by another actor inside the window.***
  ✅ **Standing fix, costs nothing: the mutation and its restore go in ONE tool call — the window becomes zero,
  not short.** 📌 **What made it detectable: the commit contained the very test that catches it, and the
  `// MUTATED` marker was greppable** ⇒ 🔑 **the marker is not decoration, it is the detector.**
  *(Resolved by `3ba04ff`; the tree and HEAD agree.)*
- 🔑 **To tell an ARTEFACT byte from a DELIBERATE one, RENDER THE OLD BUILDER** (@Jason, TASK-325): he rendered
  all 14 kinds against `git show HEAD:` in a scratch module and read the actual trailing whitespace.
  **Exactly TWO of fourteen carried a trailing `\n`, both single, never `\n\n` ⇒ zero deliberate, seven pins,
  all artefacts.** 📌 **By-product: `course_confirmed` was NOT one of the two** ⇒ ***the `CONFIRMED SCHEDULE`
  the customer photographed was the PER-SESSION message (`§7.3`)*** — both open with `ob_course_title`, so
  neither their report nor our reading could tell them apart. 🔑 ***And their two reports were the COMPLETE
  list, not a sample.***
- 🔑 **A property that belongs to ALL messages but lives in each branch is held by N coincidences.** @Jason's
  tell, counted the other way: ***a property is at risk exactly when the number of places implementing it is
  neither ONE nor ALL.*** 📌 **`§16.3` was 5 of 14. `line()` vs `extra()` is 9 of 14.** ⚠️ **OPEN refinement
  (TASK-327's Question): `ALL` may be safe only when it is ALL BY CONSTRUCTION (one helper) and fragile when
  ALL BY REPETITION** — *no-un-interpolated-`{placeholder}` is 14 of 14 and held by nothing.*
- ✅ **A TITLE belongs to a TEMPLATE (a field block), not to a MESSAGE.** *"Every message has a title line"*
  looks like a property and is not: `booking_paused`, `booking_resumed`, `leave_teacher`, `makeup_far_out` and
  `default` are **deliberately single sentences with no title**, and the titled ones are exactly the ones that
  render a block. *(@Jason, TASK-325.)*
- ⚠️ **A TEST-ONLY task is safe to run during a tester's round; a LABEL change is not.** 🔑 *A build that moves
  under a tester is what @Porter has been burned by three times this week.* ⇒ **TASK-327 (test-only) runs
  during @Tanya's `uat` round; the `line()`/`extra()` convention task is HELD until she is finished.**

- 🔑 **@Jason's REFRAMING, adopted whole (2026-09-10) — it REPLACES the count-based tell:**
  ***"When the fifteenth branch is written, does it get the property for free, or must it re-earn it?"***
  📌 **The count was always a proxy: `5/14` and `14/14-by-habit` fail for the SAME reason and the count
  separates them; `14/14-by-habit` and `14/14-by-construction` share a number and differ completely.**
  ✅ **Keep the count as a CHEAP FIRST PASS — it is a grep and it finds every `5/14` without reading code — but
  it cannot finish the job.**
- 🔴 **AND THE SHARPER HALF: a helper is not enough — IT MUST BE UNAVOIDABLE.** ***Safe by construction
  requires the mechanism to sit on the path you cannot avoid, not merely to exist.*** **`line()` / `extra()` /
  `renderFieldBlock` are AVAILABLE (a branch can call `t()` instead); `formatOutboxMessage`'s exit is
  COMPULSORY (every `return` in the switch passes through it).** ⇒ 🔑 **that is why `§16.3` is genuinely
  one-and-done and the placeholder property is not, though both were "fixed with a helper".**
  ✅ **THE STANDING AUDIT, in this order: 1. what is the narrowest point every message must pass through?
  2. which invariants live THERE, and which live in the BRANCHES? — everything in the second list is held by
  habit, whatever its count.** *(TASK-327)*
- ⚠️ **NOT every invariant CAN move to the narrowest point.** **The trim could, because whitespace can be
  applied to a finished string without knowing what it MEANS.** 🔴 **A LABELLING convention cannot: normalising
  `label:` → `label :` at `formatOutboxMessage`'s exit would rewrite colons inside the customer's own headers
  (`📅CONFIRMED SCHEDULE:`, `⏱️TODAY'S SCHEDULE:`) and inside a parent's typed `Remark`** — **a new defect
  class, not a fix.** ⇒ 🔑 **when the invariant cannot move, the question becomes: can the HELPER be made
  COMPULSORY?** *(TASK-328, open and HELD.)*
- ✅ **A negative test that cannot fail is DECORATION** (@Jason, TASK-327): he asserted that the leak probe can
  SEE a leak (`t("added_atmax_note","TH")` renders `{max}` verbatim with no vars) **before trusting a file that
  is almost entirely negative assertions.** 📌 **Same method as TASK-325's render-the-old-builder: MEASURE,
  then assert — never assert, then discover.**
- 📌 **Five branches hold no-placeholder-leak by HABIT** (`booking_paused`, `booking_resumed`, `makeup_far_out`,
  `sick_leave`, `leave_teacher`) — they call `t(key, lang, {…})` directly and are safe only because their
  authors wrote `?? "-"` twelve times. **The other nine are safe by CONSTRUCTION** — `line()`/`extra()`/
  `renderFieldBlock` drop a falsy value so the whole line disappears. **The count of five is itself asserted.**

- 🔴 **A GREP FOR A RENDER SHAPE CANNOT FIND A VALUE PASSED AS A PROP OR AS AN i18n ARGUMENT OBJECT.** The raw
  time-render count moved **4 → 6 → 9**, and the three found last were `BookingModal:427` (a `value=` prop),
  `BookingModal:669` and `PausedTray:181` (both `t(key, { time: booking.startTime })`). 🔑 **Twice the wrong
  number was @Sober's grep.** 📌 **And the sharpest instance: `:669` passes `date: formatDateDisplay(b.date)`
  and `time: b.startTime` on ADJACENT LINES — the date had a helper and the time did not, in the same call,
  and nobody saw it while looking straight at it.** *(TASK-326)*
- 🔻 **`smart-scheduler-front/src/types/api/contract.ts` says *"Synced … keep in lockstep"* AND IS NOT A
  MIRROR.** **9 exports exist only on the BE** (including `PlanSessionRow`) **and 17 only on the FE**
  (`ExpiryWarning`, `ExpiryWarningSession`, `ResumeCourseResponse`, `PostedSale`, `Paged`, `CourseListItem`,
  the badge family). ⇒ 🔑 **it is partly an independent file that claims to be generated from another one.**
  ⚠️ ***A false claim of automation is worse than no claim: it converts a file people would check by hand into
  one they trust by default*** — **@Sober cited it twice for a line that lives only in the other repo.**
  ✅ **DECIDED (TASK-329): the header stops promising lockstep and says what the file is, plus the clause *a
  type here is this repo's CLAIM about the wire, not the BE's declaration*.**
- 🔴 **`ExpiryWarningSession` is an FE-ONLY type — the BE has none.** Its BE equivalent is `ExpiryCandidate`
  (`lib/course-expiry-impact.ts:39`), which declares `startTime?: string | null` — **honest.** ⇒ 🔑 **`HhMm` is
  OUR claim about a payload nothing normalises: the VALUE is not wrong, the TYPE is.** 🚫 **Adding `hhmm()` to
  `expiryDecision`'s candidates map would be a CHOICE about the wire, not a correction of a BE defect.**
  *(TASK-326 — @Sober had routed this to @Jason in error.)*
- ✅ **`PlanSession.startTime` was annotated `// HH:mm` and that was FALSE** — the plan row arrives with
  seconds, which is the whole of TASK-295 and TASK-324. **The other three `// HH:mm` annotations are TRUE**
  (`Booking` and `RescheduleTarget` are `hhmm()`-mapped; `CoursePackage.startTime` is never on the wire).
  🔑 ***The annotations were an accurate map of which payloads are normalised — and the one that lied is
  exactly the one payload that is not.*** *(TASK-326)*

- 🔴 **`Remaining : 0` CANNOT PRINT, and nothing would tell us.** `line-message.ts:307` —
  `remaining: (payload.remaining as string) || undefined` — **`||`, not `??`** ⇒ **`0` is falsy ⇒ the field is
  `undefined` ⇒ omit-empty deletes THE WHOLE LINE.** ⚠️ **LATENT, not live:** the one producer
  (`remainingLabel`) always returns a non-empty string. 🔑 **@Sober counted the idiom — `as string) ||` appears
  THIRTEEN times in that file** ⇒ ***a thirteen-wide class, not one line.***
  📌 **The compiler looks like it is helping and is not:** `payload.remaining` is `unknown` off a JSON column,
  and `as string` is an ASSERTION, so the number path type-checks perfectly. *(TASK-330 · sweep = TASK-331)*
- 🔑 **THE CLASS THE REPORTING CHANNEL CANNOT REACH** (@Jason, TASK-330): ***not "the message is wrong", but
  "the message is incomplete and looks complete".*** **Every rule this week came from a message somebody SAW
  and objected to; a missing LINE produces nothing to object to** — ⚠️ **and omit-empty, which the owner asked
  for, makes the absence look deliberate.** ***His own `(-)` reasoning pointed back at us.***
  ⇒ **the only way to find these is to read what the code does with an EMPTY or ZERO value, field by field,
  rather than waiting for a screenshot.**
- ⚠️ **The `||` → `??` fix has a TRAP: `?? undefined` alone converts the EMPTY-string case from an ABSENT line
  into a label with nothing after it** — **which TASK-219 established reads as information that went missing.**
  ⇒ 🚫 **the fix is cut from the FULL sweep, never from one example.**
- 🚫 **THREE things that LOOK like message invariants and are NOT** (@Jason, TASK-330 §2, all MEASURED):
  **1. language-invariance — 10 of 14 kinds DIFFER between TH and EN**; the four that do not are exactly the
  field-block templates ⇒ **a property of the TEMPLATE FAMILY.** ⚠️ *`§4`'s "eng ล้วน" makes this easy to "fix"
  into existence — the same boundary `§16e` had to draw.*
  **2. the 20-char quick-reply cap — a CATEGORY ERROR:** an outbox message is pushed as `{type:"text", text}`
  with **no quick reply at all**; the cap belongs to `line-reply.ts`, the CONVERSATION layer.
  **3. `(-)` vs absent — a rule about ONE FIELD in ONE template**, not a message property.
  ⚪ **And `AUDIENCE_OMITS`: 0 of 14 differ by audience, but it is held by a deliberately EMPTY TABLE** ⇒
  ***a current SETTING that is asserted, not an invariant.***
- ⚠️ **`renderTodaySchedule` (the AUTO morning push) has NO row cap; `renderSchedule` (the COMMAND one) caps at
  20 with a "+N more" line.** **Two renderers of one thing, one respecting a platform limit and the other
  not.** ✅ **Its failure is LOUD** — LINE rejects an over-long push and the outbox row goes `FAILED` — **so it
  is listed, not alarming.** 📌 **The cap is a PLATFORM limit, so @Porter's *AUTO and COMMAND are different
  shapes by design* does not cover it.** *(TASK-330)*
- 🔴 **THE GAP THE MAP COULD NOT CLOSE: the renderer is safe GIVEN a payload, and NOTHING checks what producers
  put in one.** `row.payload as any` ⇒ **the compiler checks none of it**, and payloads are built across
  `scheduler.service.ts` (~3000 lines) and a dozen smaller writers. 🔑 ***That is where `Remaining : 0` lives***
  — found by reading one branch, not by a method that would find the others. *(TASK-330 §4)*

- 🔻 **@Sober counted an idiom and reported a CLASS. It was ONE defect and TWELVE correct usages.**
  `as string) ||` appears 13 times in `line-message.ts`; @Jason read all thirteen with a producer column:
  **ten can lose a LINE, three fall through to `-`, and twelve are CORRECT** — `Remark` is the customer's
  `*ถ้ามี` rule, an absent `expiryDate` is a TRUE statement, an absent `studentName` is TASK-224's decision.
  🔑 ***A COUNT is a place to LOOK, never a finding*** — the same rule @Sober had already given @Jason twice
  about numbers written into tasks. 📌 **The count saved no reading; it only said where to start.** *(TASK-331)*
- 🔑 **THE CRITERION that separates a wrong omission from a right one** (@Jason, TASK-331 §2):
  ***a field's absence is a defect when it removes the MESSAGE'S PURPOSE.*** **`Remaining` is the only such
  field: a `COURSE DEDUCTION` exists to tell a parent what is left, and without that line it is a receipt with
  no balance.** ✅ **Every other absent line is either the customer's own rule or a true statement about
  missing data.**
- 🔴 **THE MIRROR — the file has BOTH bugs, one per idiom** (@Jason, TASK-331 §3): ***`||` eats a legitimate
  ZERO; `??` lets an EMPTY STRING through.*** `String(payload.weeks ?? "-")` on `makeup_far_out` renders a
  half-sentence for `""`. ⚠️ **So "fix the `||` with `??`" walks straight into the opposite defect** — and
  `?? undefined` on `remaining` would turn an absent line into a BARE LABEL, which TASK-219 established reads
  as information that went missing.
- ✅ **`coursePackages.startDate` is `notNull()`** (`schema.ts:346`) ⇒ the `course_confirmed` `startDate` row is
  **SAFE, not "not established"**. 📌 *Closed with one grep by @Sober — cheap only because @Jason wrote "not
  established" instead of guessing "no".*
- ⚠️ **Since TASK-318 removed `Sessions :`, the PROGRAM LABEL is the only place a course's hours appear.**
  A falsy `size` renders `Program : Freeskate` with the hours silently dropped. ✅ **Safe today**
  (`PackageSize = 4|6|10`, column `smallint notNull`). 📌 **The redundancy that would have caught a bad size is
  the line the customer asked us to delete — correctly deleted, noted, not reopened.** *(TASK-331)*
- ✅ **DECIDED (TASK-333, HELD): the outbox payload becomes a DISCRIMINATED UNION on `kind`, PARSED at the
  read — not cast.** 🔑 ***`row.payload as any` is where type information is destroyed: the producer knew
  `remaining` was a string, the column knows nothing, and `as string` re-asserts a fact nobody checked.***
  **Assertions cannot fail for the FIFTEENTH KIND; a parsed union makes it declare its fields or fail to
  compile.** 🔴 **The hard requirement, from @Jason and made the spec: *no message that sends today stops
  sending*** — a LENIENT parse that LOGS, the shape of `notifyAdmins`' loud SKIPPED row. ⚠️ *A strict parse
  would turn a type improvement into an outage on rows nobody can re-create, and the oldest rows are from when
  we were least careful.*

- 🔑 **THE ONE-SENTENCE TEST for whether a COUNT is evidence** (@Jason, TASK-332, adopted):
  ***try to write, in ONE sentence, what all the instances are FOR. If the only sentence you can write
  describes what they LOOK LIKE, it is a SHAPE and the count is only a place to look.***
  ✅ Separates this week's four correctly: `withExit` × 11 (*every question advertises the exit*) — **evidence,
  and it is what showed the customer's "two screens" was under-scoped** · `.trimEnd()` × 5-of-14 (*no message
  ends in whitespace*) — **evidence** · `t(key, lang, {…})` × 5 (*no placeholder leaks*) — **evidence** ·
  `as string) ||` × 13 — 🔴 **SHAPE: 12 of 13 were correct**, because the thirteen had **THREE intentions** —
  a customer RULE, a TRUE STATEMENT, and a DEFECT. ***One operator, three meanings.***
  🔑 **The asymmetry that makes it usable: calling a rule-count "a place to look" costs nothing; calling a
  shape-count "a finding" creates work** ⇒ ***when the test is unclear, default to "a place to look".***
  🚫 **Do NOT stop reporting counts.**
- 🔴 **`?? undefined` IS NOT A FIX FOR `|| undefined`, and reading cannot tell you that.** @Sober prescribed it;
  @Jason ran it as a mutation and it failed **two** ways: **(1) it does not fix the ZERO** — the value stays a
  NUMBER and `fieldLines`' own omit-empty (`facts[f] ? …`) is falsy too, so the line drops one layer further
  down; **(2) the bare-label trap is reachable through WHITESPACE, not `""`** — `"" ?? undefined` stays falsy
  and absent, but `"   "` is TRUTHY and renders a label with nothing after it (TASK-219).
  ⇒ 🔑 ***The fix must produce a NON-EMPTY STRING, not merely a defined value — three conditions, and an
  operator states one.*** ✅ **Hence `fieldValue` (`line-message.ts:78`): reject null/undefined, coerce to
  string, reject whitespace-only.** 📌 *@Sober named the right DANGER with the wrong CAUSE; only running it
  separated them.* *(TASK-332)*
- ✅ **`weeks` on `makeup_far_out` is LEFT ALONE deliberately** — `weeksBetween(...)` is a computed NUMBER, so
  `""` is **unreachable** from the producer, and its failure is a half-sentence a human would report.
  ⇒ **latent AND unreachable AND loud**, against `remaining`'s **latent AND reachable-in-principle AND
  silent.** 📌 **The two-idiom sentence lives at `fieldValue`, where the next person reaching for `??` to
  "fix" a `||` will be standing.**
- ⚠️ **A HOLD SHOULD BE SCOPED TO THE RISK, NOT TO THE TASK.** @Sober held TASK-333 entirely *"after @Tanya
  AND after TASK-328"*, but **its DESIGN half is analysis-only** — by his own rule the safest work available
  during a tester's round. ✅ **Design half released; code half still held.** 🔑 *An over-broad hold idles an
  engineer for a reason that only applies to part of the work.*

- 🔴🔴 **LIVE (2026-09-10): THREE payload kinds are ENQUEUED and have NO renderer branch, so all three send the
  generic default** — `teacher_link_approved` (`teacher-link.service.ts:157`, direct `enqueueLine`),
  `student_registered` and `parent_asked_for_admin` (both via `notifyAdmins` → `enqueueLine`).
  **Renderer `case`s = 14 · producer kinds = 14 · three do not overlap.** *(Verified by @Sober.)*
  🔑 **`teacher_link_approved` CARRIES the correct, translated sentence on its payload (`text:
  t("verify_teacher_ok", …)`) and the renderer never reads it** — and the comment above that send says *"the
  bot promised you'll be told once it's approved — not sending would make it a lie."* ⇒ ***the send happened
  and the message said nothing: kept in form, broken in content.*** 📌 **The mirror of TASK-152, which made a
  SKIPPED row LOUD — these rows are SENT and MUTE.** ⚠️ **The two ADMIN ones need COPY from the owner.**
  *(TASK-334 — found while answering a DESIGN question, not by a report.)*
- 🔑 **THE TWO CRITERIA FOR A CHOKEPOINT vs ASSERTIONS** (@Jason, TASK-333, adopted verbatim):
  **(1) does the invariant have ONE answer for every instance? (2) can the chokepoint SEE the difference from
  where it stands?** ⇒ ***`REQ-085 §8.1` fails the first*** — `(-)` always prints and `Remark` vanishes, both
  at the bottom of ONE message, so a chokepoint would carry a table of exceptions, ***and a table of
  exceptions is the per-instance knowledge you were escaping, moved somewhere nobody reads it against the
  message it applies to.*** ⇒ ***the labelling convention fails the second*** — a colon is a separator AND a
  character in the customer's headers and a parent's typed `Remark`.
  🔴 **And the third edge: a chokepoint on the unavoidable path is a SINGLE POINT OF FAILURE.** ***The
  principle is strongest for chokepoints that can only SUBTRACT (trim, omit) and weakest for those that
  REWRITE*** — the trim is safe because it is idempotent and the worst it can do is nothing.
- ✅ **The outbox union ships OBSERVE-ONLY** (TASK-333 design, accepted): **it does not gate rendering; a row
  that lacks a required field renders exactly as today and the parse writes one log line naming row, kind and
  field.** 🔑 ***The union's first job is to TELL US WHAT IS IN THE TABLE, not to enforce anything*** — the
  only version that cannot cause an outage. 📌 **Parse at `outbox.service.ts:78`, where the `any` is created —
  NOT at `formatOutboxMessage`'s entry, which is pure and called from ~20 test files with hand-built payloads.**
- 🔴 **THE PARSE DETECTS; THE PRODUCER TYPE PREVENTS. Neither alone closes the class.** ⚠️ **And a union must
  describe what producers ACTUALLY send, historically — not what we wish they sent:** after TASK-332 the
  renderer handles `remaining: 0` CORRECTLY, so a union declaring `string` would now **reject a payload the
  product renders perfectly.** 🚫 **It also cannot catch a WRONG VALUE of the RIGHT type** (`remaining: "3 HR"`
  when the balance is 2). *(TASK-333)*
- 📌 **SEVENTEEN outbox kinds exist, not fourteen:** 11 in both lists · **3 renderer-only DEAD branches**
  (`reschedule_requested`, `sick_leave`, `leave_teacher` — two unsent as a side effect of TASK-305) · **3
  producer-only** (the live finding). 🔑 ***The union is the small part; the work is the six anomalies***, and
  each needs a decision rather than a type.

- 🟢 **`REQ-087`'s narrowed sweep (notifications only): the VOUCHER is at PARITY with the COURSE everywhere
  except ONE message.** **Equal:** per-session `CONFIRMED SCHEDULE` · `LEAVE NOTICE` · today/this-week
  schedules · daily reminder + digest · teacher assigned/unassigned. **By design:** whole-course
  `CONFIRMED SCHEDULE` (a voucher is HOURS, not a schedule) · `makeup_far_out` · **expiry warning — NEITHER
  has one, it is a SCREEN.** **Voucher-only:** pause/resume (AC-1: hold is `1HR · VOUCHER · FIRST_TRIAL`).
  🔴 **Wrong: `COURSE DEDUCTION`.** 🔑 ***"Vouchers never got what courses got" is true of the ADMIN side and
  of flows — NOT of notifications:*** **the notification layer is type-driven (`notifyTypeOf`, `TYPE_OMITS`)
  and `VOUCHER` has been a first-class type in it with no omissions.** *(2026-09-11)*
- 🔴 **`COURSE DEDUCTION` has NEVER carried `Remark` — not for a VOUCHER and NOT FOR A COURSE.**
  `TEMPLATE_FIELDS.course_deduction` = `student · program · date · time · coach · remaining · expiry`, and
  nothing is appended below the block. ⇒ 🔑 ***The customer compared their voucher DEDUCTION to their course
  CONFIRMATION.*** ⚠️ **Adding it is NOT restoring parity — it is adding a field to a message they already
  approved, and it changes the byte-pinned COURSE deduction too.** ❓ **OPEN with the customer via @Porter.**
  *(`REQ-087 §1b`)*
- ⚠️ **`remainingLabel` is ONE function with TWO readers:** the notification's `4/6 ครั้ง` **and** the CARD's
  **owner-verified** `เหลือ 6/10` (TASK-234). 🔑 **`REQ-085 §4` governs the MESSAGE; the card is a staff
  surface the owner signed off** ⇒ **the Thai comes out of the message without touching the card.**
  📌 *One transformation, two contracts — the `ddmmyyyy` shape from TASK-318.* *(TASK-335)*
- ✅ **`parent_asked_for_admin`'s `lineUserId` CAN be resolved to a parent name and phone at send time** —
  `findParentByLineUserId` is already the ONE resolver (TASK-259/316). ⇒ 🚫 **"no wording rescues an unusable
  identifier" is NOT a constraint on that alert's copy.** 🅿️ *Part B parked by the owner; recorded so the
  limitation is not carried to him when it returns.* *(TASK-334)*
- 🔑 **Why `teacher_link_approved` got a SPECIFIC `case` and not a general `text` passthrough** (@Porter's
  reason, better than @Sober's): ***a general passthrough makes every future payload's `text` field silently
  load-bearing — a field added for LOGGING becomes a message nobody meant to send.*** *(TASK-334 Part A)*

- 🔴 **A COMMENT RECORDS INTENT — IT IS NOT EVIDENCE OF WIRING.** @Sober warned that `remainingLabel` was
  SHARED with the owner-verified card and told @Jason to protect it. **It never was:** `line-course-view.ts`
  has **zero** references to it and computes `Math.max(0, c.size - c.usedSessions)` itself. **The warning came
  from the function's OWN comment — *"matching `courseLine`'s owner-verified `เหลือ 6/10`"*.**
  🔑 ***"Matching" and "shared" are one word apart in a comment and a whole task apart in the code.***
  📌 **The comment version of @Jason's rule: a source pin proves a line EXISTS, never that it EXECUTES.**
  *(Fourth derived-fact error of this batch — after the compressed spec block, the miscounted call sites and
  "a thirteen-wide class".)* *(TASK-335)*
- 🔴 **`remainingLabel`'s REAL second reader is the AUTO DAILY SCHEDULE** (`jobs.service.ts:418`, both course
  and voucher branches). ⇒ ***`Remaining : … ครั้ง` was in TWO messages, not one — the deduction AND the daily
  reminder — and one line fixed both.*** 📌 **The `ddmmyyyy` shape with the pairing reversed: both real readers
  were NOTIFICATIONS, and the surface that LOOKED shared was the independent one.** *(TASK-335)*
- ✅ **`§4` is satisfied by REMOVING a Thai word, not by translating it** (@Jason, TASK-335 `§1c`):
  ***removing a Thai word APPLIES a ruling; choosing an English one INVENTS a string*** — and a PLACEHOLDER in
  a VALUE is worse than in a title. **`Remaining : 14/15` — the `n/N` form carries the meaning `HR` carries
  for a course, and the owner already signed that form off on the card.** 📌 *A unit word is the customer's to
  name, and it is one constant when they do.*
- 🚫 **There is NO cheap assertion that "no message contains Thai in a generated value"** (@Jason, TASK-335,
  by TASK-333's own second criterion). **A student's name, an admin's typed `Remark`, every bilingual half and
  `LEAVE NOTICE / แจ้งลา ‼️` are all Thai in a message and all correct** ⇒ 🔑 ***the rule is not about the
  CHARACTERS but about WHO WROTE THEM, and authorship is exactly what a finished string does not carry.***
  ✅ **The workable version moves UPSTREAM, where authorship still exists: assert that the VALUE GENERATORS
  return no Thai** — `remainingLabel`, `programLabel`, `ddmmyyyy`, `hhmm`, `shortDate`, `joinCoaches`,
  `ob_dow_*`. ⚠️ **It would NOT catch a Thai literal written straight into a branch of `line-message.ts`** —
  📌 *but both `ครั้ง` and `อังคาร` lived in the generator set.* **NOT CUT — `uat` first.**
- 📖 **The VOUCHER deduction header that ships is OURS, not the customer's** — `💡VOUCHER DEDUCTION`, declared
  a PLACEHOLDER in the i18n table the way `tsched_title_week` is. **Its test pins the FORM** (the `💡`, upper
  case, **no trailing colon — its course twin has none**, checked rather than assumed) **and DIFFERENT from the
  twin**, deliberately not the bytes. *(TASK-335 `§1a`)*

- ✅ **WHICH NOTE a DEDUCTION carries: the SESSION's own** (`payload.attendeeNote`), **not `courseNote`'s
  *first non-empty in date order*.** 🔑 **`courseNote`'s rule exists because a COURSE SUMMARY has no true
  answer to "which session's note" — a deduction HAS one: the session just used.** 📌 **`booking_confirmed`
  (`§7.3`) and `leave_notice` (`§9.1`) already do exactly this.** *(TASK-336)*
- 🔴 **A `Remark` must come from the PAYLOAD, never from `ctx`** — `§7.3`'s own comment: ***"the worker
  enriches `ctx` from the booking row it points at, and the note must survive a row that has since been edited
  or deleted."*** 🔑 **The reason is STRONGER for a DEDUCTION: it is a RECEIPT for something that already
  happened — if the booking is edited afterwards, the receipt must still say what it said.**
  ⇒ **`bookingContext` returns no note by design, and adding one there would be the wrong fix.** *(TASK-336)*
- 🔑 **@Porter's test for what needs asking at all:** ***"the rule is `*ถ้ามี`, so the line appears only when a
  note exists ⇒ adding it cannot make an existing message noisier. A change that cannot make things worse does
  not need to be asked about."*** 📌 **Nearly the same shape as @Jason's TASK-318 sentence — *removing one of
  two fields is safe only because they had been made to AGREE*** — **both argue a change is safe BY
  CONSTRUCTION rather than by review.** ❓ **OPEN (TASK-336's Question): where does it FAIL? Working guess —
  it holds for ADDITIONS under a `*ถ้ามี` rule and breaks the moment a change is UNCONDITIONAL.**
- 🔴 **A SCREEN and a COMMENT are both DESCRIPTIONS, and neither is the wiring.** **@Sober read
  `remainingLabel`'s comment (*"matching `courseLine`'s owner-verified …"*) as evidence that the card SHARED
  it — it does not.** **@Porter made the same error on `TASK-284`: he read the plan editor SHOWING a note as
  the note BEING there.** 🔑 ***Both times the artefact described an INTENT and it was read as a FACT.***

- 🔑 **@Jason's REPAIR of @Porter's safe-unasked test (TASK-336, adopted):** ***a change is safe unasked when
  it cannot make an existing message DIFFERENT — not merely when it cannot make one LONGER.***
  **Counter-example that kills the weaker form: had the deduction's note been the COURSE-level one, it would
  still be `*ถ้ามี`, conditional and silent when empty — passing the original test exactly — and it would
  print ANOTHER SESSION'S note on a receipt for this one.** ⇒ ***"Cannot add a line" is not the same as
  "cannot say something false."***
- 🔴 **STATE THE PRIOR FACT, THEN THE CONCLUSION.** **Both *"safe because the line is conditional"* and
  TASK-318's *"removing one of two fields is safe because they had been made to AGREE"* are arguments that a
  change is safe BY CONSTRUCTION — and both rest on a PRIOR FACT that is easy to leave implicit.**
  ⚠️ ***The prior fact is the part nobody writes down, and when someone later changes it the conclusion is
  still sitting there in a comment looking true.*** *(TASK-336)*
- ⚠️ **The whitespace-only-note bare label is LATENT, NOT LIVE.** `validation.ts:22` is
  `z.string().trim().max(200)`; **zod's `.trim()` TRANSFORMS** — verified by running it: a whitespace-only
  value parses to empty — **and every write path uses that schema through `zValidator`.** ⇒ **`§7.3` and
  `§9.1`'s `|| undefined` cannot produce a bare label today.** 🔑 **They still move to `fieldValue`
  (TASK-337) because *the renderer's safety depends on a `.trim()` in a validator it cannot see*** —
  **TASK-330's gap in miniature.** 📌 **And the COMMENT matters more than the change: a reader who later finds
  the zod trim will "simplify" the guard away.**
- ✅ **`notifyCourseDeduction` reads the note ITSELF, as a PARAMETER on `deductionPayload` — not a field on
  `DeductionInput`.** 🔴 **@Sober's "all four callers have the booking in hand" was HALF WRONG: the DAY-END
  (`jobs.service.ts`) selects an explicit column list without the note, and its own comment calls that path
  *the MAJORITY path since REQ-070*.** ⇒ **reading it in the one writer needs nothing from any caller, and a
  deduction site added later inherits it.** 📌 ***An input field that no caller ever sets reads as one somebody
  forgot.*** *(TASK-336)*

- 🔴 **NEVER RESTORE A MUTATION WITH GIT.** `git checkout -- <file>` reverts to **HEAD**, not to the
  pre-mutation bytes. **@Jason used it during a break-it-and-watch and discarded FOUR tasks of UNCOMMITTED
  work in one file** (TASK-334 A, TASK-335 §1a, TASK-336, TASK-337). ✅ **Recovered and verified change by
  change by @Sober.** 🔑 ***Restore from a byte copy you took yourself; the git index is not a backup. In a
  tree where several tasks sit uncommitted, `git checkout` is a DELETE of other people's work, not an undo of
  yours.*** ⚠️ **And it is a boundary matter too: `CLAUDE.md` permits READING git state — that command
  WRITES.** ✅ **The mutation script now writes the original bytes to a scratch file and verifies the restore
  by SHA-256 against that copy.** 📌 **The exposure was FOUR tasks because four rounds had landed since the
  last commit — the size of the uncommitted window is the human's to choose, and he should know what it is
  worth.** *(2026-09-11)*
- ✅ **What made that recovery possible: the tests pin the SOURCE STRINGS and the COMMENT SENTENCES**, so a
  rebuilt file that satisfies them is the file. 🔑 ***A habit paid out in a way it was not designed for.***
  ⚠️ **Limit, stated by @Jason: comment line-WRAPS may fall differently; the content is the same.**
- 🔑 **A COMMENT GOES STALE IN THE COMMIT THAT MAKES IT STALE, AND THAT IS THE ONLY MOMENT ANYONE KNOWS.**
  **`course-deduction.ts:21` still describes `remainingLabel` as returning `4/6 ครั้ง` hours after TASK-335
  removed the word** — **on the very function whose comment misled @Sober two days earlier**
  (*"matching"* read as *"shared"*). 📌 **The tense test: a comment stating the CURRENT contract must be true;
  one recording what CHANGED must stay.** *(TASK-338)*
- 🔑 **@Jason on why "which guards are load-bearing?" has no comment-based answer:** ***the distinction is a
  TYPE distinction being carried by a comment.*** **`payload` is `[k: string]: unknown` and every read is a
  cast, so *"this field is always a non-empty string"* can only be written as prose** ⇒ **a parsed union
  (TASK-333) puts it where the compiler holds it.** ⚠️ **And a comment describing a REMOTE fact rots — delete
  the zod `.trim()` and a comment claiming it exists still sits there.** ✅ **Kept as a PRACTICE, not a
  convention: name the upstream BY FILE, but only where the guard is genuinely redundant today — that is the
  only place a reader is tempted to delete.**

- 🔑 **GREP FOR THE LITERAL YOU JUST DELETED.** (@Jason, TASK-338 — adopted by @Sober for task-writing too.)
  **TASK-335 removed `ครั้ง` from a return expression; the same literal was still sitting THREE LINES ABOVE the
  return, FORTY BELOW it, and in a THIRD FILE.** ⚠️ **One `grep` at the moment of deletion would have found all
  three in a second.** 📌 ***Not a convention — one command, at the only moment anyone knows a comment has gone
  stale.***
- 🔴 **A FILE CAN DISAGREE WITH ITSELF AND BOTH HALVES PASS — because one of them is PROSE.**
  `remaining-zero.test.ts`'s header claimed `remainingLabel` returns `"0/6 ครั้ง"` while an assertion 100 lines
  below it read `0/6`. 🔑 **Written by the same person, hours apart, in one file.** *(TASK-338)*
- ✅ **A comment that QUOTES A LITERAL THE FUNCTION PRODUCES can be checked by ASKING THE FUNCTION** — the
  `course-deduction` doc-block test asserts it contains `` `${remainingLabel("voucher", 4, 6)}` ``.
  ⚠️ **STATED LIMIT, and it is why the mechanism is kept: it generalises no further.** **A comment about WHY,
  about another file, or about intent has nothing to compare itself against.** 🚫 **Applied to ONE doc-block —
  the one that has now misled two people — and nowhere else.** 📌 ***A narrow mechanism with its limit written
  down is worth more than a broad one without.***
  🔻 *Its first catch was its own author: a version demanding `ครั้ง` be absent from the whole block FAILED on
  the history line recording the removal — history asserted away one minute after the tense rule was written.*
- 🔑 **THE TENSE TEST for a comment** (TASK-338): ***a comment stating the CURRENT contract must be true; one
  recording what CHANGED must stay.*** ⇒ `ครั้ง` still appears twice in `course-deduction.ts` and both are
  correct, because both are past tense about a change.
- ✅ **`remainingLabel`'s *"matching `courseLine`'s owner-verified `เหลือ 6/10`"* is REWRITTEN to say SHAPE
  ONLY**, with the reason (`line-course-view.ts` imports nothing from that file) and a line recording that
  *matching* was read as *shared*. 📌 **The sentence that caused @Sober's error now carries its own
  correction.**

- 🔑 **A CLAIM THAT NAMES ITS ENFORCER is the only kind that survives** (@Fern, TASK-329). **The model already
  in the repo: `dictionaries.ts:1` — *"`en` is the source of truth; `th` must mirror its shape exactly
  (enforced by `const th: typeof en`)"*** — **and the enforcement is real.** ⇒ ***"Mirrors X" alone tells a
  reader to trust and not check*** — which is exactly the state `contract.ts` was in when @Sober cited it
  twice without opening the file it named. **Unenforced claims found and NAMED, not fixed:**
  🔴 `AttendeeNoteInput.tsx:7` — **`ATTENDEE_NOTE_MAX = 200`, a NUMBER copied across repos** (matches the BE's
  `.max(200)` today; drift means **staff are told the wrong maximum before the server refuses**) ·
  🟡 `import-preview.ts:6` · 🟡 `leave.ts:32` (an ORDERING copied by hand — **TASK-188 exists because the FE
  re-derived lifecycle**) · ⚪ the four mocks (least worrying — a mock's job is to imitate).
- 🔴 **`type HhMm = string` — the alias was a LABEL, not a constraint.** Changing `ExpiryWarningSession.startTime`
  from `HhMm | null` to `string | null` **widened nothing**: the compiler saw no difference either way.
  🔑 ***Nothing tightens, nothing widens, and no guarantee is lost — because there was never a guarantee, only
  a claim.*** *(TASK-329 §2)*
- 🔴 **THE RAW-TIME COUNT WENT 4 → 6 → 9 → 11, and every miss after the first was ONE SHAPE:** **three
  `value=` PROPS and five `t()` ARGUMENT KEYS.** ⇒ ***"We keep sweeping for a RENDER."*** 📌 **Twice the wrong
  number was @Sober's and twice @Fern's — a METHOD problem, not carelessness.** ✅ **The durable answer is a
  sweep by SHAPE: a `time:`-like key inside a `t()` argument object whose value is an unformatted DTO field.**
  *(TASK-329 → TASK-339)*
- 🔑 **@Fern's test for a client-computed figure** (TASK-292): ***the shape is not "a figure beside a button" —
  it is "a figure describing a set the SERVER chooses."*** ⇒ **answerable in one question: *does the request
  carry the set, or only an id?*** **`bulkConfirm` POSTs `{ ids }` ⇒ the client sends the set ⇒ it CANNOT
  diverge; `dropLine` and `confirmCourse` name sets the server picks ⇒ both diverged.** 📌 **Predicts: any
  `POST /x/:id/<verb>` whose screen states a count is a candidate; any `POST /x/<verb> { ids }` is not.**

- 🔑 **A NEGATIVE CHECK MUST ASSERT BOTH DIRECTIONS** (@Fern, TASK-339): ***a check that finds nothing because
  it is looking nowhere passes exactly as quietly as a clean tree.*** ⇒ **pin the FIXED sites too, so the
  scanner cannot silently stop reaching the code.** 📌 **It is the TASK-326 *green-by-absence* failure mode
  caught in a MECHANISM instead of in a review.** ⚠️ **OPEN (TASK-340's Question): how many of our other
  "nothing is wrong" assertions can tell *nothing is wrong* from *I looked nowhere*?**
- ✅ **AN UNNEEDED ALLOW-LIST ENTRY IS AS BAD AS AN UNEXPLAINED ONE.** @Sober named two sites that *"must say
  why"*; **neither is a `t()` argument, so the sweep never sees them** ⇒ ***an entry for them would exempt
  something the check cannot see.*** 📌 **TASK-322's rule cuts both ways.** *(TASK-339)*
- 🔴 **DATES ARE IN MONEY'S STATE, NOT TIME'S** — **`formatDateDisplay` EXISTS and FIVE local formatters were
  written beside it**: `fmtTime` (`AttentionContent:27`), `fmtDate` (`ImportBalanceModal:138`,
  `SomContent:15`), `fmtDateTime` (`OverviewContent:58`, `SomContent:16`). *(Verified by @Sober.)*
  🔻 **This CORRECTS TASK-324's write-up, where @Sober called dates the sibling that already had its
  function** — ***they have one and do not use it.*** 🔑 **Worse than the time gap for @Fern's own reason:
  with time there was no shared helper to ignore.**
- 🔑 **THE LINE BETWEEN A DEFECT AND A DECISION, for duplicated formatting:** ***UNFORMATTED is a defect and
  the SA dispatches it; DIFFERENTLY-formatted is a decision and the owner's.*** 📌 *That line is what stops a
  finding becoming a tidy-up nobody asked for.* ⇒ **the four raw DTO dates in `t()` arguments → TASK-340; the
  five local formatters → the owner, beside MONEY and `ATTENDEE_NOTE_MAX`, as ONE question:** ***may a surface
  legitimately format the same kind of value differently — and if so, which?***
- ⚠️ **A SCANNER THAT STRIPS COMMENTS BY DELETING THEM REPORTS THE WRONG LINE NUMBERS.** @Fern caught it before
  reporting: comments are blanked to **equal-length whitespace** so offsets and newlines survive.
  🔑 ***A sweep whose output cannot be looked up is worse than no sweep — it sends the next reader to the wrong
  line and spends the trust that makes them check at all.*** *(TASK-339)*

- 🔴 **`formatDateDisplay("—")` RENDERS `Invalid Date`.** It returns `""` only for a FALSY input, and an em
  dash is truthy ⇒ `formatDateDisplay(booking?.date ?? "—")` hands `dayjs` an em dash. **@Sober's instruction
  was *"route all four"*; the fourth could not be routed, and the no-booking case is branched BEFORE the call.**
  🔑 ***An instruction that names a transformation must be checked against every value the site can hold — only
  running it says so.*** *(TASK-340 — @Sober verified.)*
- 🔑 **THE GUARD MUST BE OVER THE SAME REGION AS THE NEGATIVE** (@Fern, TASK-340 Question — the sharpened form
  of *green by absence*): ***it is not "a negative needs a positive somewhere in the test".***
  🔴 **`dialog-labels.test.ts:127` HAS three positives — on `modal`, the whole file, not on the `header` slice**
  ⇒ ***it looks guarded and is not, and the three green assertions beside it are what make it look safe.***
  ⚠️ **Four such assertions found, in three files.** 📌 **And one region is bounded by a COMMENT —
  `expiry-warning.test.ts:71` slices to `indexOf("TASK-287 §1")`** ⇒ **a tidy-up that deletes a stale task
  reference silently empties the region and the negatives stay green.** *(→ TASK-341)*
- ✅ **A SWEEP ADDED BEFORE THE FIX PROVES ITSELF ON THE REAL DEFECT** — @Fern ran the date sweep against the
  UNFIXED tree, so the demonstration is the defect itself rather than a mutation. 🔑 ***Better than break-it-
  and-watch, because nothing had to be pretended.*** 📌 *And she checked bun's `+ Received + 6` against the
  scanner rather than reporting six sites — **a count read from a diff renderer is not a count.***
- 🔑 ***AN ALLOW-LIST ENTRY OUTLIVING ITS DEFECT IS THE SAME CLASS AS A COMMENT OUTLIVING ITS MECHANISM***
  (@Fern, TASK-340): the known-open entry for `CancelBookingDialog:80` was **DELETED, not moved**, when the
  site was fixed. ⚠️ **And the reason the site was fixed at all: `date:` and `time:` are the SAME `t()` call
  one line apart** ⇒ ***formatting one and leaving the other is authoring the adjacent-lines defect we spent
  three tasks removing.***
- ⚠️ **`file:line` PINS ARE BRITTLE TO THE COMMENTS A FIX CARRIES** — three of @Fern's own assertions went red
  for no reason but their own brittleness. ✅ **Identity is now FILE + EXPRESSION; the line survives only in a
  `where` field for a human to look up.** 🔑 ***A pin a comment can break teaches the next person to delete
  it.*** 📌 **And the two-directional guard earned itself again: the "formatted sites" pin went red because a
  site had BECOME formatted — *a formatted site appearing is as much a change to the sweep's world as a raw
  one.*** *(TASK-340)*

- 🔴 **`grep -c` EXITS NON-ZERO WHEN THE COUNT IS 0.** An `&&`-chained demonstration therefore **short-circuits
  at the count and the RESTORE STEP NEVER RUNS.** ✅ **Caught by the read-back and `git status` in the same
  call.** 🔑 ***A restore behind `&&` is only as reliable as every command before it, and a COUNTING command is
  exactly the kind that "fails" while succeeding.*** ⇒ ✅ **use `;` and verify by CHECKSUM, never by exit
  code.** 📌 **THIRD distinct restore failure this week — `git checkout` reverting to the wrong target · a
  `sed` delimiter failing silently · a short-circuited chain — and ALL THREE were caught by the READ-BACK,
  none by the script that caused them.** *(TASK-341)*
- ✅ **A REGION GUARD MUST FAIL ON *MISPLACED*, NOT ONLY ON *EMPTY*.** `expect(region.length).toBeGreaterThan(0)`
  is the weakest acceptable form and @Fern declined it: her guards NAME what the region is
  (`toContain("endCourse.resumeCreated")` for the re-plan summary). 🔑 ***The difference between "I read
  something" and "I read the right thing."*** 📌 **And two assertions in DIFFERENT `it`s cannot borrow each
  other's guard — each re-slices, so each needs its own.** *(TASK-341)*
- ✅ **BOUND A TEST REGION BY THE STRUCTURE THE RULE IS ABOUT, and search the end anchor FROM the start index.**
  `expiry-warning.test.ts`'s `panel` now runs `result ? (` → the `) : (` that closes that JSX branch, **found
  from `panelStart`** — because `) : (` also appears earlier and a bare `indexOf` took the wrong boundary
  silently. 🔑 ***A re-anchor that is wrong in a new way is not a fix.*** *(TASK-341 §3)*
- 🔑 **REPORT PROSE NEEDS A DIFFERENT DISCIPLINE FROM CODE PROSE, NOT A LIGHTER ONE** (@Fern, TASK-341):
  ***a code comment sits beside the thing it describes; a report describes a tree that has already moved on***
  — **and the chain is longer: engineer → SA → PM → owner, each hop losing the tree.**
  ✅ **The rule, adopted:** ***be exact about anything a reader can ACT ON or RE-QUOTE — a location, a number,
  a verdict; be free with emphasis.*** 📌 ***"Closes with" is `file:line` for sentences*** — **state a location
  the way the reader will LOOK IT UP.** ⚠️ **And her refusal of ceremony is what makes it keepable: *a report
  that hedges every location becomes unreadable, and an unread report is worse than a loose one.***

- ⛔ **THE CHAIN RULE (@Porter, 2026-09-11, and he was right):** **`TASK-336 → 337 → 338 → 339 → 340 → 341 →
  342` — every link's source was the PREVIOUS LINK'S OWN QUESTION, and not one was chosen by the owner, the
  customer, @Tanya or the PM.** 🔑 **The mechanism, named by @Sober: *a Question at the end of every task, and
  every ANSWER treated as a dispatch.*** ⇒ ***the Questions are worth keeping; turning each one into the next
  task is what made it unbounded.*** ⚠️ **A loop with no external input has no natural end, and each individual
  step was defensible.** ✅ **Standing: when a Question produces work, it goes on a SIZED LIST for the owner to
  cut — it does not become the next task.** 📌 *His `REQ-087 §4` is the precedent: he cut a sweep to "just the
  notifications" in one line.*
- 🔴 **@Sober treated NO MESSAGE as NO EVENT** — said *"waiting on @Tanya"* four times, having checked the
  inbox and found nothing, while she had already reported. 🔑 ***The absence-of-evidence error, made about a
  person instead of about code.*** ✅ **One line — *"has she reported?"* — costs nothing. ASK rather than
  infer.** *(2026-09-11)*
- 🔑 **THE RESTORE, in one sentence** (@Jason, TASK-342): ***all three failures this week were a restore
  expressed as a STEP IN A CHAIN rather than as a GUARANTEED POSTCONDITION*** — *`git checkout`: the step ran
  and restored the wrong thing · the `sed` delimiter: the step ran and did nothing · `grep -c`: the step never
  ran at all.* 🔴 **And the correction that matters: *the read-back is not PROTECTING us, it is DETECTING for
  us, and only afterwards. A detector that fires after the damage is a smoke alarm, not a guard.*** *(In
  TASK-325 the human committed inside the window before any read-back ran.)*
  ✅ **Spec for ONE helper, if the owner takes it:** **1. the restore runs in a `finally` — no exit code, no
  `&&`, can skip it. 2. restore FROM BYTES THE HELPER ITSELF CAPTURED. 3. verify by CHECKSUM and exit
  NON-ZERO on mismatch.** ⚠️ **Caveat that keeps it honest: *small enough to read in one screen and NO
  OPTIONS — the moment it grows a `--no-restore` flag it is a chain again.***
- ✅ **A TEST REGION FAILS SAFE OR IT CAN EMPTY, and the form tells you which** (@Jason, TASK-342):
  **`X.slice(X.indexOf(A), …)` ⇒ anchor gone ⇒ `-1` ⇒ EMPTY ⇒ 🔴 can empty.**
  **`X.slice(0, X.indexOf(A))` ⇒ anchor gone ⇒ the region GROWS and the negatives get STRICTER ⇒ ✅ fails
  loudly.** 📌 **184 regions carry assertions; a script flagged 23; the VERIFIED number is 18 in 14 files.**
  🔴 **Sharpest: `bookings-list-other:101` is anchored on `"if (f.q) {\n    const ors"` — A NEWLINE AND FOUR
  SPACES OF INDENTATION; a formatter run empties it.** ⚠️ **The comment-bounded shape exists three times here
  and all three are guarded — *by a positive somebody happened to write, not a rule anyone applied.***

- ▶️ **`REQ-087 §6` — OWNER-CHOSEN, two items, NOT held for `uat`** (*"แก้เลยเหอะฉันว่าไม่น่ายาก"*):
  **`§6a`** `Remaining` becomes **`9/10 sessions`** (voucher) and **`3/4 HR`** (course) — 🔑 ***the SHAPE is
  unified and the unit made explicit; the UNIT is deliberately NOT unified, because a voucher sells sessions
  and a course sells hours.*** 🔴 **`3 HR` does not say OF WHAT — a parent cannot tell 3-of-4 from 3-of-10.**
  ✅ **PRECONDITION CHECKED: `remainingLabel(kind, remaining, total)` ALREADY TAKES `total` and both call sites
  pass it** (`course-deduction.ts:97`, `jobs.service.ts:418`/`:420`) — **the course branch ignores it** ⇒
  **one expression, not a data path.**
  **`§6b`** `booking_confirmed` (`§7.3`) renders **`DD-MM-YYYY`** instead of the weekday.
  🚫 **`§7.1` course-wide KEEPS the weekday — it reads `payload.weekday`, a DIFFERENT source, so it will not
  follow by accident.** 🔑 ***`REQ-085 §15` still holds: WEEKDAY for a course, DATE for a session*** — **the
  change makes the product consistent with that rule rather than breaking it.**
  🔻 **`§6b` DEVIATES from the customer's `§7.3` and THE OWNER IS TELLING THEM, NOT ASKING** — 🚫 **not a
  placeholder, not unsettled.** *(TASK-343)*
- 📖 **`sessions` and the `n/N` shape are @PORTER'S WORDS, RATIFIED BY THE OWNER — not the customer's.**
  ⇒ **stronger than a placeholder, weaker than `§16d`'s verbatim copy.** ✅ **Pinned as SHAPE + WORDS with the
  attribution written beside them**, 🔑 **so if the customer later sends their own, the boundary is already
  known.** 📌 *The `§16e` lesson: a ruling that does not carry its own boundary gets re-applied to the wrong
  thing.*
- ✅ **THE CORRECTED LOOP, made structural rather than promised:** **a task still ENDS in a Question — that is
  where the findings come from — but the task states IN WRITING that the answer goes on the OWNER'S SIZED LIST,
  not into the next task.** 🔑 ***The Questions were never the problem; treating every answer as a dispatch
  was.*** *(TASK-343, after @Porter stopped the chain.)*

- 🔴 **THE PRODUCT NOW SPEAKS THREE DATE FORMATS IN ITS MESSAGES:** **`08-09-2026`** (a SESSION — `§7.3`,
  `§9.1`), **`Tuesday`** (a COURSE — `§7.1`), and 🔴 **`2026-09-08` — RAW ISO, in the DAILY SCHEDULE**
  (`line-today-schedule.ts:91`, `date: dash(r.date)`). 🔑 ***`REQ-085 §15` explains two of them; nothing
  explains the third*** — 📌 **and it is the only place a reader meets the machine's own format, in the message
  a coach reads every morning.** ⚠️ **ON THE OWNER'S LIST as item 9 (XS, one line); NOT cut, because the chain
  is stopped.** *(Found by @Jason, verified by @Sober, 2026-09-11.)*
- 🔑 **THE SENTENCE UNDER THE WHOLE UNIT/FORMAT CLASS** (@Jason, TASK-343): ***every one of these was
  introduced by somebody rendering a value correctly for the message they were looking at. A number with an
  implied unit does not look wrong; it looks like a number.*** 📌 **`Remaining` has been wrong twice in one
  week — `ครั้ง` in the value, then a missing denominator — and NEITHER was reported by the person who reads
  it.**
- ✅ **THE `finally` RESTORE PROVED ITSELF BY ACCIDENT, TWICE, ON ITS FIRST OUTING.** @Jason's mutation anchor
  was wrong twice — **the second time because these checkouts are CRLF and he wrote a multi-line anchor with
  `\n`** — ✅ **and both times the file was restored anyway.** 🔑 ***Under an `&&` chain that throw is exactly
  the shape that left @Fern's file mutated*** ⇒ **the same failure, a third door, stopped by CONSTRUCTION
  instead of by a read-back.** 📌 ***"Three failures in a week" is an argument; "the fix worked accidentally,
  twice, on its first outing" is a demonstration.*** ⚠️ **Also banked: a multi-line source anchor written with
  `\n` does not match on this checkout.**
- ✅ **AN ASSERTION REVERSED BY A REQUIREMENT IS CORRECT — rewrite it WITH the reversal and its reason inside
  the test.** `session-confirmed-req085`'s *"the calendar DATE appears NOWHERE"* now asserts the opposite.
  📌 ***Deleting the test that failed is how the record is lost.*** **And a byte pin rewritten for the SECOND
  time is *not a sign the pin is wrong; it is the pin doing its job, twice.*** *(TASK-343 — 14 pins in 8 files,
  all rewritten, none deleted.)*
- 📌 **`§6a` needed NO new i18n key, and the reasoning matters more than the conclusion:** **`HR` has always
  been a bare English literal in `remainingLabel` because `REQ-085 §4` puts SYSTEM-GENERATED values in English
  for everyone** ⇒ **`sessions` is the same kind of thing.** ⚠️ ***If it ever needs to be Thai, that is a `§4`
  REVERSAL and a different conversation.***

- ▶️ **`REQ-087 §7` — OWNER: *"เอา แก้ให้เป็น 08-09-2026 เหมือนกันทุกที่"*** ⇒ **every rendered DATE is
  `DD-MM-YYYY`.** ✅ **@Porter's boundary, and it holds:** ***A WEEKDAY IS NOT A DATE — `§7.1`'s course-wide
  `Date : Friday` STAYS.*** 🔑 **`REQ-085 §15` is the owner's own ruling and he re-affirmed it by keeping
  `§7.1` out of `§6b`** ⇒ ***"every date is `DD-MM-YYYY`" is about FORMAT; it does not turn a weekday into a
  date.***
- 🔴 **A SECOND BOUNDARY THE PM'S SENTENCE DOES NOT COVER — OPEN with the owner (2026-09-11):** **two places
  render `อังคาร 22/09`, a WEEKDAY PLUS A DATE FRAGMENT** — **`line-leave.ts:68`** (the `§14` LEAVE PICKER's
  row) and **`line-schedule.ts:57`** (the teacher's weekly day HEADING).
  ⚠️ **Neither is a weekday and neither is `DD-MM-YYYY`: it is a THIRD form, and it was CHOSEN** — **TASK-316
  decided the picker deliberately and TASK-318 said `§16d`'s format must NOT be used there**
  (***"two surfaces, two audiences, two formats, both right"***), **and @Sober ratified it.**
  ⇒ 🔑 ***`ทุกที่` either REVERSES a ratified decision or does not reach them.*** 🚫 **Left untouched, with the
  absence ASSERTED AND THE REASON IN THE TEST** — 📌 *so the next reader sees a pending question rather than an
  oversight.* ⚠️ **The cost of the wider reading, if he takes it: a 10-character date inside a 20-character
  quick-reply label is the constraint that shaped TASK-316's fix.**
- 🔴 **RAW ISO DATES REACH READERS IN FIVE PLACES** *(candidate list, for the engineer to verify — @Sober's
  counts have been wrong four times this batch)*: **`line-message.ts:367` `course_deduction` — LIVE, and the
  message fixed twice on 09-11** · `:400` `booking_resumed` · `:439` `sick_leave` and `:449` `leave_teacher`
  — ⚪ **both DEAD branches with no producer, fixed anyway** *(a dead branch rendering the wrong format is a
  trap for whoever revives it)* · **`line-today-schedule.ts:91`**, the instance the owner saw. *(TASK-344)*
- 🔑 **AN SA'S LIST IS A CANDIDATE LIST AND THE TASK SHOULD SAY SO.** ***"Treat every line as a place to look;
  your number overrides mine, silently."*** 📌 *Said in the task rather than discovered in the report — after
  four wrong counts in one batch: the compressed spec block, "twelve call sites", "a thirteen-wide class", and
  "all four callers have the row".*

- 🔴 **A RENDERED DATE DOES NOT ALWAYS LOOK LIKE `date:` IN SOURCE.** Three of TASK-344's EIGHT sites hid from
  BOTH sweeps — @Sober's candidate list and @Jason's first pass were **the same list** — **because their date
  is INTERPOLATED INTO A COMBINED VALUE** (a `Time` line, an `Old slot` line) **rather than assigned to a field
  key.** 🔴 **One was LIVE: `teacher_assigned` / `teacher_unassigned` printed `2026-09-08 10:00-11:00` to a
  TEACHER.** 📌 **It is @Fern's `t()`-argument finding again in a new disguise — three `value=` props, five
  i18n keys, and now a template literal.** ⇒ 🔑 ***every sweep that greps a FIELD NAME walks past the values
  built by interpolation.*** *(TASK-344 — found when a mutation sent him back through `ctx.date` by hand: the
  second time this week a mutation found SCOPE rather than a bug.)*
- 🔑 **@Jason's shortest statement of the whole class** (TASK-344 §4, his THIRD green mutation this month):
  ***"I pinned the case I was thinking about instead of the case that breaks."*** **His `§15` guard rendered
  `§7.1` with an EMPTY `ctx`, so the sweep's ternary fell back to the weekday and every assertion stayed
  green** — ⚠️ **and the omitted case was the PRODUCTION one**, since a real `§7.1` message is enriched from the
  booking the row points at. 📌 *It generalises past mutations — it is what four wrong counts were, too.*
- 🚫 **A CHOKEPOINT FOR DATES WAS CONSIDERED AND REJECTED, with evidence.** `bookingContext` fails both TASK-330
  tests — **`§7.1`'s weekday is COMPUTED from the ISO date**, and the context **cannot see which kind will
  render** — and it is not even one point (`payload.to.date`, `TodayRow.date` bypass it).
  🔴 **The line that settles it: `renderFieldBlock` *would have caught FIVE of the eight and missed exactly the
  THREE that were hiding.*** ⇒ ***a chokepoint would have covered the sites that were easy to find and missed
  the ones that were hard.*** ✅ **The only mechanism that makes it true BY CONSTRUCTION is a BRANDED type — an
  `IsoDate` a message string cannot accept and a `DisplayDate` produced only by `ddmmyyyy`** — 📌 *TASK-333's
  work pointed at one field.* ⚠️ **On the owner's list, sized; it touches every date in the product.**
- ⚠️ **TWO OPEN BOUNDARY QUESTIONS on *"เหมือนกันทุกที่"*, to be asked in ONE message:**
  **A — the `§14` LEAVE PICKER (`line-leave.ts:68`) and the weekly HEADING (`line-schedule.ts:57`)**, both
  `อังคาร 22/09`, a weekday PLUS a date fragment ⇒ 🔴 **the wider reading REVERSES TASK-316**, and *a 10-char
  date in a 20-char quick-reply label is the constraint that shaped it.*
  **B — the DAILY DIGEST (`attention.ts:226`, `:348`), raw ISO in a label an ADMIN reads** ⇒ **two lines.**
  ✅ **Both left UNTOUCHED with the absence asserted AND the reason in the test** — 🔑 *so whoever answers
  changes those tests ON PURPOSE, and the next reader sees a pending question rather than an oversight.*
- ✅ **A PIN WHOSE NUMBER MOVES IS THE PIN WORKING.** `no-placeholder-leak` asserted TWELVE `?? "-"`; three
  became ternaries ⇒ **NINE**. 🔑 **The CLAIM was kept — *these branches are safe BY REPETITION, not by a
  chokepoint* — and the new shape pinned.** 📌 ***"The number moving is that assertion working, not
  breaking"*** — the opposite of the reflex to relax a pin that goes red. ⚠️ **And two stale `4/6 ครั้ง` test
  INPUTS fell out two tasks after the word was removed, green because the test hard-codes them** — *third time
  this week a stale value survived as a fixture or as prose.*

- 🔴 **THREE SWEEPS, THREE UNDERCOUNTS (5 → 8 → 9+), ALL FOR ONE REASON:** ***we searched the SHAPE OF THE
  SOURCE instead of the SHAPE OF THE OUTPUT.*** **The "ninth site" is at least FOUR:** `expiry` on
  `course_deduction` (`line-message.ts:378`) **and** on `course_confirmed` (`:300`) · **`start` on
  `course_confirmed` (`:298`) — never screenshotted** · 🔴 **`advanceLeave` (`:307`) — the declared-leave DATES,
  `join(", ")`, RAW.**
  🔻 **And it is NOT the leading `*` on `*Expiry date`, as @Porter wondered: `Start` has no asterisk and is
  just as raw.** ⇒ 🔑 ***the variable is that we searched for a field NAMED `date` — `expiry`, `start` and
  `advanceLeave` are dates that are not called one.*** *(TASK-345)*
- ✅ **A CHECK OVER WHAT A MESSAGE EMITS IS CHEAP, because the harness exists.** **`no-placeholder-leak.test.ts`
  (TASK-327) already renders ALL FOURTEEN KINDS from a probe payload** ⇒ **give every date field a distinctive
  ISO value and assert the output contains no `\d{4}-\d{2}-\d{2}`.**
  🔑 **The property that makes it robust rather than a fragile regex:** ***the probe CONTROLS every input, so
  any ISO in the output came from US*** — **no false positive from a parent's typed `Remark`, because the probe
  decides what the `Remark` says.** ✅ **And it satisfies the real requirement: *it can FAIL on a site it has
  never been told about*** — `start` and `advanceLeave` are exactly that.
  🚫 **AN EXEMPTION LIST IS FORBIDDEN — if a message legitimately needs a raw ISO, STOP and escalate:**
  📌 ***an exemption list is how this check becomes the thing it replaced.***
- 🔑 **A CHECK THAT FLAGS A PENDING DECISION IS NOT A FALSE POSITIVE — it is the decision becoming visible.**
  The output check will flag `§7.1`'s weekday, the `§14` picker, the weekly heading and the admin digest.
  ✅ **All are LEFT and asserted KNOWN-OPEN with their reasons** ⇒ **when the owner answers, the test changes
  ON PURPOSE.** *(TASK-345 §4)*
- 📌 **THE ORDER FOR ANY SWEEP-PLUS-FIX, now standing:** **1. build the check and run it on the UNFIXED tree —
  *the demonstration is the DEFECT, not a mutation* (@Fern, TASK-340). 2. REPORT what it finds and how many,
  BEFORE fixing — a size is a decision and it belongs to the PM. 3. fix. 4. EMPTY the probe and show the check
  FAILS (@Fern, TASK-339).**

- 🔑 **THE OUTPUT CHECK EXISTS AND PROVED ITSELF ON ITS FIRST RUN:** `no-iso-date-leak.test.ts` renders every
  kind × both languages × both audiences **plus the daily schedule** from a probe whose every date is a
  DISTINCT ISO value, and asserts the output holds no `\d{4}-\d{2}-\d{2}`. **Built FIRST, run on the UNFIXED
  tree: FIVE sites — and the fifth was `line-today-schedule.ts:103`, a DIFFERENT FILE that never goes through
  the message switch.** ***A sweep of `line-message.ts` could not have found it at any level of care; the
  check found it because it reads OUTPUT.*** 📌 **Distinct probe values ⇒ a failure NAMES ITS OWN SOURCE.**
  🚫 **No exemption list was needed and none was written.** *(TASK-345)*
- 🔻 **THE DAILY DIGEST DOES NOT RENDER ITEM LABELS INTO A LINE MESSAGE.** `buildDigestMessage`
  (`attention.ts:396`) emits `• <check label>: <count>` and a *"see the web app"* line; **the `${b.date}`
  item labels go to the WEB APP.** ⚠️ **@Jason reported it as *"a label an ADMIN reads"* on TASK-344, corrected
  himself on TASK-345, and @Sober had already relayed the first version to @Porter without opening the
  function.** ✅ **Withdrawn from the owner's list.** 🔑 *The correction is asserted in the check file so it is
  executable rather than a sentence.*
- 🔑 ***"THE CHECK IS SILENT" AND "THE RULE IS SAFE" ARE DIFFERENT FACTS, AND ONLY ONE IS EVIDENCE.*** A weekday
  holds no `YYYY-MM-DD`, so the ISO check could never flag `§7.1` — **its weekday is guarded by its OWN
  assertion, not by the new check's silence.** *(@Jason, TASK-345 §4 — written into the test.)*
- ⚠️ **"CHECKED BY NAME" MATCHES A FILENAME, NOT A PIN.** One of the ten `§17c` files was touched on a line that
  is NOT a `§17c` pin (the file only cross-references `§17c` in a comment). ✅ **Reported as *file touched,
  claim intact* rather than letting the method's answer stand.** 📌 *A method that reports its own miss is a
  method; one that does not is a habit.*
- ✅ **`dateField` (`line-message.ts:111`) = `fieldValue` then `ddmmyyyy` — the one guard, then the one
  formatter.** 🚫 **NOT a second date function** — it formats nothing. **It exists because the same three lines
  were about to appear at four sites, which is the *"applied five times in three days"* failure.** 📌 *The
  doc-block names where a second FORMAT would go — a `§15` decision, not a helper.*
- 🔑 **THE TEST FOR SOURCE-SHAPED vs OUTPUT-SHAPED CHECKS** (@Jason, TASK-345 §8): ***is the property visible
  in the RENDERED STRING? If yes, a source check is a proxy and will undercount the way three date sweeps
  did.*** **Candidates on the owner's list:** the Thai-in-a-generated-value rule (already failed twice the way
  dates did — first pick) · the labelling convention (a pure output property, held in nine branches) ·
  **"no message ends in whitespace" IS already an output check and is the one that has never come back.**
  🚫 **NOT a candidate: the `?? "-"`-vs-omit rule — which of two correct answers the customer chose is not a
  property of the string.**

- 🔴 **THE OWNER'S OWN `§17g` EDIT (`baa6015`, 2026-09-11 21:38) COMMENTED OUT A LINE THAT DID TWO JOBS.**
  `line-webhook.service.ts:1533` — `if (linked !== "customer") return send(… tb("welcome") …)` — **sent the
  unsolicited welcome AND kept UNLINKED users out of the customer postback flow.** ⇒ **an unregistered parent
  tapping `เช็คอิน` / `นักเรียน` on the rich menu now falls through to `doCheckin` / `doChildren` and is told
  `empty_checkin` / `children_none` instead of being told to register.** *(Verified per landing by @Sober.)*
  🚫 **Not a crash — a WRONG REPLY to an unregistered person, on the deployed tree.** ⚠️ **Also: the `follow`
  dispatch is commented out, so `handleFollow` is dead code; and the suite is RED (2053/1) on a bilingual
  source pin whose claim is now vacuous.** 🔑 **Fix-forward is one line — keep the guard, drop the send — and
  it is the OWNER'S edit, so whether an engineer or he does it is @Porter's call.** 📌 ***A line that does two
  jobs cannot be commented out to remove one of them.***
- 🔑 **`REQ-088` (registration by LINK) SIZED, 2026-09-12: M (FE) + M (BE) · NO migration · ONE LIFF app on the
  customer's console.** ***The LOGIC exists; the SURFACE does not.*** `verifyAndLink` (customer's "code" IS the
  phone) · `bindFamilyLine` (the one guarantee: never re-bind to another family) · `createStudentFromLine`
  (the ONE LINE-side writer) · `afterParentLink` (family-with-children ⇒ no forced add) · TASK-313/314's guards
  — **all exist.** 🔴 **What does NOT exist: any LIFF / LINE Login code — zero hits.** ⇒ ***the page's one job
  is to turn a tap into a `lineUserId`; from there it calls what the chat calls.***
  ⚠️ **THE HONEST COST IS THE WRAPPING, NOT THE PAGE:** `verifyAndLink` and the wizard live inside the webhook
  service wrapped in reply-tokens and session steps ⇒ **the page needs the DECISION without the REPLIES** —
  the TASK-315 extraction, once more, for link/create. 🚫 **If the page grows its own copy of any rule it is
  wrong** (one writer, two doors).
- 📋 **WHAT THE CUSTOMER MUST DO FOR `REQ-088`** (their console, their action, same class as the webhook
  URL): **1.** a LINE Login channel on the SAME provider as their Messaging API channel *(shared user IDs)* ·
  **2.** a LIFF app on it — Endpoint = our `/register` page, size Full, scope `profile` · **3.** send us the
  **LIFF ID** and the **Login channel ID** — *the channel ID is what lets the BE VERIFY the ID token; a page
  that trusts the client about who it is would be TASK-047's failure by a new route.*
- ✅ **`REQ-088` item 3, corrected by the owner (*"แอดมินส่งให้"*): ONE stable URL, pasted by an admin, NO
  per-parent token.** 🔑 **The LIFF login identifies the parent, not the link** ⇒ **no token table, no expiry,
  no "already used" — a whole class of cost removed.**
- ⚠️ **What the CHAT does that the PAGE must handle differently:** **2FA (`line_parent_2fa`, OFF) exists on
  the chat door only — the page MUST honour the same setting or it is a second door that ignores it** ·
  `ยกเลิก` and 3-strike stuck detection are NOT needed (a form has a close button and no session) — **but the
  page must not LEAVE a chat session step set** · `ข้าม` = optional fields · **the `§17c` screens need their
  own copy on the page, and by rule it is a PLACEHOLDER until the customer sees it.**

- ✅ **`§17g` GUARD RESTORED (TASK-346):** `line-webhook.service.ts:1543` — `if (linked !== "customer") return
  send(… tb("welcome") …)` — **both jobs back: it GATES unlinked users out of the customer switch AND replies
  with `§17c` screen 1's text, which is SOLICITED because they tapped.** 🚫 **`handleFollow` stays DEAD BY
  RULING, KEPT BY DECISION** — *the customer's OA greeting is what made two voices; if they drop theirs, this is
  the line that comes back* — with *"do not re-dispatch without a task"* asserted. 🔑 **The assertion that was
  MISSING when the owner edited now exists: the guard over CODE-STRIPPED source, so his exact edit re-applied
  fails three tests.** 📌 **The silent-gate reading of @Porter's "drop the send" was built as a mutation and
  rejected: *an empty reply to a button reads as a broken bot* (AC-16's silencing is for STRAY text, not a
  press).**
- 🔴 **THE SUSPENDED-HOUSEHOLD REFUSAL (TASK-048) HAS THE `§17g` SHAPE AT TWO SITES, AND ITS PIN IS VACUOUS
  ALREADY.** `handleMessage:1332` and the postback block below the guard are each a `return` that REPLIES and
  GATES; **`line-menus-flows.test.ts:289` pins `isSuspendedLineParent(lineUserId)` over the RAW WHOLE FILE** ⇒
  **comment out either site, or both, and it stays green.** 🔑 ***A refusal that is also a message: when the
  message is the thing someone wants to change, the refusal is what they will accidentally remove.***
  ⚠️ **On the owner's list — one test, ten lines. NOT fixed.** *(@Jason, TASK-346 §7 — 17 such lines sorted;
  this is the only one where motive and shape both match.)*
- 📜 **`REQ-088` CONTRACT (TASK-347 `§C0`–`§C5`), accepted 2026-09-12 — three principles:** **1. the server
  returns CODES, the page renders WORDS — no `message`, no `lang`.** **2. the page never says who it is — every
  call carries the LIFF ID TOKEN, `sub` is the `lineUserId`, and NO body carries a `lineUserId`/`parentId`/
  `familyId`.** **3. every decision is the chat's, CALLED not copied.** 🔴 **`TOKEN_WRONG_CHANNEL` (`aud` ≠
  `LINE_LOGIN_CHANNEL_ID`) is decoded LOCALLY before calling LINE and logged LOUDLY — trusted for nothing but
  choosing the error code.** **Two env values from the customer's console: `LINE_LOGIN_CHANNEL_ID` (server
  verifies against it) and `LIFF_ID` (page only); neither optional — absent channel ID ⇒ every call
  `TOKEN_WRONG_CHANNEL`, never "skip verification".**
  ✅ **Decisions: `/link` CREATES the parent for a new phone so `/create` is always *"add a child to MY
  family"*** (the page's 4a/4b are the same two calls; `afterParentLink`'s decision is rendered from
  `children.length`, not re-derived) · **`birthDate` is the customer's `DD-MM-YYYY` TEXT through the chat's
  `parseBirthDate`, which REFUSES ISO on purpose** — one parser, one strictness; the page shows the date back
  before submitting (TASK-277). 🔑 **The cap is asked FIRST (the chat's order); duplicate ⇒
  `NAME_DUPLICATE_NEEDS_DETAIL` (AC-9, more detail never a rename); `LINE_BOUND_TO_OTHER_FAMILY` pre-checked
  read-only on `lookup` and RE-CHECKED at the write.** 🚫 **No `GET`, no per-parent URL, no unbind (that is
  `clearFamilyLine`, an admin's audited act), no teacher/admin role on this door.**

- 🔑 **THE RULE FOR THE NEXT DOOR** (@Jason, TASK-347 §8, standing): ***every decision that BOTH doors need is
  in one place (`line-register.service.ts`); every decision that is a property of the CHAT SURFACE — strikes,
  steps, who-is-talking — stays in the webhook. Ask "does the new surface need this decision?", not "is it in
  the webhook?"*** 📌 **The webhook is NOT "replies only" after the extraction — six decisions remain, each
  with its reason:** the admin verify code (one door) · routing to the teacher claim · the two-strikes rule
  (AC-19 — *a chat that hands over to a human after two failures is a property of the CHAT surface; a page can
  be retried forever*) · `afterParentLink` (one FACT rendered on two sides) · the wizard's guard ORDER (held
  EQUAL to the page's by assertion — *the seam is visible*) · the suspended-household refusal and
  `detectLinkedRole` (who-is-talking; the page's answer is the token).
- 🔴 **A PRE-EXISTING CHAT GAP, MIRRORED INTO THE PAGE BY RULE 1 AND NAMED:** *a LINE account already bound to
  family A that enters a NEW phone creates an ORPHAN parent B carrying its id — `findOrCreateParentByPhone(phone,
  { lineUserId })` with no `familyOfLineUser` check — and `familyOfLineUser` keeps answering A.* **@Jason had
  added the guard, REMOVED it to match the chat, and recorded it in the code.** ⚠️ **On the owner's list (item
  12): one check in `linkFamilyByPhone` gives the refusal to BOTH doors — and changes the chat.**
- 🔴 **`parseBirthDate("")` IS A REFUSAL, NOT A SKIP — only the WORD `ข้าม` is.** A page create with an absent
  birthdate must OMIT the field; a blank passed to the parser is `BIRTHDATE_INVALID`. *(Caught by a test before
  the mutation stage on TASK-347; the trap is named in the file.)* 📌 **The page must not send `""` or
  `YYYY-MM-DD`.**
- ✅ **`REQ-088` BACK END (TASK-347): `POST /api/register/{lookup,link,create}` mounted BEFORE the JWT guard
  beside `publicCheckin`; `lib/line-id-token.ts` verifies the LIFF ID token — `TOKEN_MISSING` 400 ·
  `TOKEN_WRONG_CHANNEL` 401 (`aud` decoded LOCALLY, trusted for nothing but the error code, logged loudly) ·
  `TOKEN_INVALID` 401 · `TOKEN_EXPIRED` 401; nine unit tests with an injected fake LINE, including *a token
  with OUR `aud` that LINE refuses is INVALID* (keeps `decodeAud` from ever becoming the verifier) and *no
  channel configured ⇒ every token WRONG_CHANNEL, LINE never called*.** **Env: `LINE_LOGIN_CHANNEL_ID`
  (server) and `LIFF_ID` (page only), both the customer's, neither optional.** ✅ **The chat is BYTE-IDENTICAL:
  every pre-existing reply pin green UNMODIFIED; two non-reply differences declared (a log prefix; `province`
  written before `notifyAdmins`, no reader depends on it).**
- 📌 **`afterParentLink`'s fact — *children ⇒ no forced add* — is the SOFTEST point of the extraction:** ONE
  fact rendered on two sides (the chat advances the session; the page reads `children.length`), with nothing
  beyond the type asserting they agree. **Owner's list item 13: `linkFamilyByPhone` returns `mustAddChild:
  boolean` and both doors read it — one line.**

- 🔴 **A NEXT.JS PAGE CAN ONLY SEE `NEXT_PUBLIC_*` ENV VARS.** The FE's LIFF id is **`NEXT_PUBLIC_LIFF_ID`**,
  not `LIFF_ID` as TASK-347/348 first said — *a bare name would have been invisible on every environment,
  forever, and the "not configured" message would have been the page's only path.* Same shape as
  `NEXT_PUBLIC_API_URL`, which `/checkin` reads. ⚠️ **The BE's `.env.example` still names `LIFF_ID` "for the
  page" — docs only (the BE never reads it), owner's list item 14.** *(@Fern, TASK-348 — the seventh
  correction of @Sober's text this batch, and the first that would have shipped a page that never worked.)*
- ✅ **`REQ-088` FRONT END (TASK-348): `/register` — public BY CONSTRUCTION (`proxy.ts` matches only
  `/scheduler/:path*`), phase machine `liff → phone → found / found-2fa → linked → form → confirm → done`.**
  🔑 **The page holds NO rule — asserted by ABSENCE on the page and the API module, PROVEN by mutation (a
  client-side cap fails).** The one branch that looks like a rule, `children.length === 0 → form`, is `§6.1`'s
  decision READ OFF THE RESPONSE and asserted by name. 🔑 **The ID TOKEN is the identity — `getProfile`,
  `userId`, `parentId`, `familyId` absent from code, proven by mutation.** **The date: a masked `TextInput`
  (no picker, no `type="date"`), echoed back on the confirm screen (TASK-277), OMITTED when blank, shown on
  `done` as the SERVER's echo.** **`@line/liff@2.31.0` imported DYNAMICALLY so the admin bundle never carries
  it.** **Copy: 21 verbatim from `§17c`/the chat (pinned byte-for-byte) · 2 adapted with the change named ·
  2 borrowed from `/checkin` · 29 PLACEHOLDER tagged at their lines, pinned by FORM.**
- ⚠️ **A LIFF PAGE YIELDS AN ID TOKEN ONLY INSIDE THE LINE APP, against a real LIFF ID and channel — there is
  no mock for that boundary and none was faked.** ⇒ **`REQ-088` is proven only by @Tanya on a phone, on `sid`,
  AFTER the customer's two values are set.** 📌 **The customer's console is the critical path, not us.**
- 🔑 ***SHARE THE CREDENTIAL, NOT THE SHELL*** (@Fern, TASK-348 Question): `/checkin` and `/register` duplicate
  ~15 lines (the `API_BASE` derivation — itself a copied value — a `Paper` wrapper, a loader view) against a
  coupling where *a change to the shell for one page is a deploy of the other, on the two pages parents open
  with no admin in front of them.* **They differ in the ONE thing that matters — a query token vs a LIFF
  token — and a shell that abstracts that hides each page's security model.** ⇒ **when a third public page
  arrives (likely `REQ-062`, leave by link), share `lib/register/liff.ts` — the CREDENTIAL module, already
  page-free — not the chrome.**

- 🟢 **`REQ-088` PROVEN INSIDE LINE on the owner's phone (2026-09-12): consent → phone → "Found your family"
  (4 children) → link; and a NEW parent, "Gekko", added.** 🔑 **The LIFF boundary nobody could test from a
  desk is tested.**
- 🔴 **TWO LIFF SETUP FACTS, both got wrong first:** **1. the link parents tap is `https://liff.line.me/<LIFF_ID>`
  — the endpoint URL lives ONLY in the LIFF app config; pasting the endpoint into a chat opens a plain in-app
  browser with no LIFF context (`no-id-token`).** **2. scope must include `openid` — the ID TOKEN needs it;
  `profile` alone yields a profile, not a token.** ⚠️ **@Sober wrote "scope `profile` — that yields the
  `userId`" on the same day as a design that uses the TOKEN, without checking the two against each other; the
  owner's phone found it.** *(Eighth correction of @Sober's text — the first found by the owner.)* ✅ **Both go
  into `.env.example`'s comment (TASK-349) so the customer's instructions and the code agree in one place.**
- 🔑 **`REQ-088 §7` — THE INSIGHT ONE LEVEL DOWN:** ***a parent who will not type `สมัคร` will not type
  `08-09-2020` or an address ⇒ every field that can be a TAP should be a tap.*** 🚫 **STORED VALUES UNCHANGED —
  the picker is ENTRY, not STORAGE:** `birthDate` stays `DD-MM-YYYY` text through the server's one parser;
  `province` stays ONE free-text string, the three cascading picks JOINED in the customer's own order and
  abbreviation (`พระโขนงเหนือ วัฒนา กทม`). **No migration; `§16e` stands.** ⚠️ **`§7b` is the first part of
  `REQ-088` that is DATA rather than logic — the Thai administrative divisions, 77 / ~900 / ~7,000 — and it
  must load ONLY on `/register`, dynamically, like `@line/liff`.** Labels follow the province: Bangkok
  เขต/แขวง, elsewhere อำเภอ/ตำบล.
- ✅ **`§7b`'s ESCAPE HATCH, decided by @Sober (2026-09-13): a `พิมพ์เอง / Type it instead` toggle revealing
  the existing free-text field.** **Three paths, ONE stored shape:** pick all three ⇒ the joined string · type
  it ⇒ the chat's field unchanged · leave it ⇒ skipped (`ข้าม` already allowed it). 🚫 **Not an "other" inside
  the picker** — *it still needs a text box, and it invites a half-picked `กทม · other · other`.* 🚫 **Not
  "just optional"** — *a parent who cannot find their sub-district and cannot type it leaves blank what they
  wanted to give.*
- 📌 **Two display fixes from the owner's screenshot (TASK-349):** children rendered `มิลล่า (มิลล่า)` — nickname
  shown even when IDENTICAL to the name ⇒ **nickname only when it differs, matching the chat's screen 4** ·
  **the primary button was TRUNCATED on a phone** (*"This is my family — link this LINE acc…"*) ⇒ @Porter's
  `Link this LINE account`, **pinned by LENGTH bound, not bytes.**

- 🔴 **`parents.province` HAS TWO WRITERS STORING TWO FORMS, AND THE SOM REPORT GROUPS BY IT.** **The admin's
  `ParentFormModal` (SPEC-016) picks from `lib/people/th-provinces.ts` and stores the FULL name —
  `กรุงเทพมหานคร`; the chat (REQ-079) and now the `/register` page store the customer's free-text line —
  `พระโขนงเหนือ วัฒนา กทม` — into the SAME column (`line-register.service.ts:192`); and
  `som-report.service.ts:120` groups demographics by `r.parent?.province`.** ⇒ ***a Bangkok family registered
  by an admin and one registered from LINE land in two different buckets of the same report, and every LINE
  family lands in a bucket of its own, one per sub-district string.*** 📌 **Pre-existing since REQ-079; found
  by @Fern on TASK-349 by putting the two writers side by side; verified by @Sober.** ❓ **The OWNER'S decision,
  item 17 at the TOP of the list: which form the column holds — the admin's full name, the chat's line, or TWO
  columns.** ✅ **Guard added: the dataset's 77 names are pinned EQUAL to `TH_PROVINCES`, so the page can never
  be the cause of a split.** ⚠️ **QA check with it: the admin form's `Select` fed a LINE-registered value not in
  its 77 rows may render BLANK.**
- 🔑 **A PICKER IS ENTRY, NOT A RULE — the line, drawn in code** (@Fern, TASK-349): ***it cannot produce
  nonsense; it does not pre-validate anything.*** `toCustomerDate` is `split("-").reverse().join("-")` — **a
  REORDER, not a parse; no `dayjs`, no `Date`, nothing that could say "invalid".** The Rule-1 absence was
  RE-SCOPED ON PURPOSE: the page and `api.ts` still hold the FULL absence; `entry.ts` holds its own narrow one
  (exactly one `split`, no `dayjs`/`Date`/`isNaN`/`throw`/`min|maxDate`), proven by a mutation that adds a
  validation.
- ✅ **THE THAI ADDRESS DATASET — `thai-address-universal@2.2.0`, ISC, PINNED EXACT** (*a dataset should not
  float on a caret*): 77 provinces · 928 districts · 7,211 sub-districts (7,893 rows, one per postal code —
  `พระโขนงเหนือ`'s two codes collapse to one row). **Measured from the build: 417,590 raw / 127,496 gz, five
  chunks, loaded LAZILY only while the form is on screen in pick mode; imported in exactly ONE source file
  (`entry.ts`) as `await import(...)`; the admin bundle asserted clean by source walk AND build graph.**
  🔑 **Lookups by GEOCODE, never by name — `จอมทอง` is a district in BOTH Bangkok (`1035`) and Chiang Mai
  (`5002`); `เฉลิมพระเกียรติ` is in FIVE provinces.** **Tier words keyed off geocode `10` (Bangkok ⇒ เขต/แขวง;
  else อำเภอ/ตำบล) — the dataset carries no tier word.** ⚠️ **Honest cost: the geocode-keyed API also loads the
  English names and the code table, ≈55 KB gz of the 127 — a build-time Thai-only slice would roughly halve
  it (named, not built).** 📌 **If the dataset chunk cannot be fetched, the page drops to the typed field by
  itself — an automatic hatch.**
- 🔑 **THE PROVINCE ABBREVIATION RULE, DERIVED NOT FELT** (@Fern, TASK-349 §7b): ***the province is written the
  way a parent writes it in a chat — its EVERYDAY name.*** **`กรุงเทพมหานคร` is the ONE province whose everyday
  name is not its formal name (`กทม`); every other province's everyday name IS its formal name** — their
  official abbreviations (`ชม.`, `ขก.`) are licence-plate/postal forms nobody types in an address. ⇒ **one row
  in the table, and that is the finding.** `เชียงใหม่` ⇒ `ศรีภูมิ เมืองเชียงใหม่ เชียงใหม่`.
- 📌 **A LENGTH BOUND CARRIES ITS DERIVATION:** the link button is pinned at **≤ 28 characters, both languages**,
  because a Mantine `Button` inside a `max-w-sm` `Paper` at `p="xl"` has ~320 px for its label ≈ 28 characters
  at 14 px before an ellipsis. *(The truncated sentence was 43.)* **A bound with its derivation beside it can
  be recomputed when the layout changes.**
- 📌 **WHERE A TYPE COULD BE A PICK** (@Fern's sweep of 21 `TextInput` labels, named not built): **the `OTHER`
  booking title** (strongest — typed free every time, the same handful recur, and it BECOMES `displayName` per
  AC-10) · `discount.reason` · the foreign `country` field (~250 rows, no cascade) · `badges.typeName`
  (`Gold`/`gold`/`Gold ` splitting one badge into three). **NOT candidates:** names and nicknames (open sets),
  prose notes, phones (an identity), the search boxes (already picks).

- 🔴 **THE SAVED LANGUAGE PREFERENCE (`ss.lang` in `localStorage`) IS ONE KEY PER ORIGIN.** Before TASK-350, a
  parent's TH/EN tap on `/register` would have written the ADMIN'S preference and an admin's choice would have
  been the parent's default — on the same browser (*the owner testing the LIFF URL in Chrome on the phone he
  runs the back office on*). ✅ **`/register` now mounts a NESTED `I18nProvider` with its own key
  `ss.lang.register` — React context resolves to the nearest provider — and its own `DatesProvider`, so the
  picker's month names follow the toggle, not the back office.** 🔑 **A device default is NEVER saved; only a
  tap is** (`setLangIfUnset` reads storage at call time and returns if a saved value exists). *(TASK-350)*
- 🔴 **LIVE: `/checkin` SHOWS ENGLISH TO A THAI PARENT BY DEFAULT.** It mounts under the ROOT provider
  (`DEFAULT_LANG = "en"`, key `ss.lang`) with no scope of its own ⇒ **a Thai parent tapping the check-in link
  sees English unless that browser happens to hold a saved ADMIN preference — and it READS the admin's
  preference on a shared browser.** 🔑 **It does not need a TOGGLE (one screen reached from a message in their
  own language); it needs the DEVICE DEFAULT — ten lines, the TASK-350 shape with `navigator.language`, since
  `/checkin` is not LIFF.** ⚠️ **Owner's list item 18, the only LIVE item on it. Not cut — the chain is
  stopped.** *(Found by @Fern's TASK-350 Question; verified by @Sober.)*
- ✅ **`/register`'s TH/EN toggle is the admin header's own `LanguageToggle`** (two additive props, header
  unchanged), **the first child of the page's `Stack`, present in every phase; it calls `setLang` and nothing
  else** — `lang` appears exactly TWICE on the page (the destructure and the `DatesProvider` locale), no
  `[lang]` effect, no `lang ===` branch. **The LINE app's language is read in `lib/register/locale.ts`, NOT in
  `liff.ts`** — the credential module gained one export (`loadLiff`, so both modules share ONE SDK object) and
  never calls `getLanguage`. **Tier words เขต/แขวง/อำเภอ/ตำบล stay Thai in both languages** — proper nouns on a
  parent's own mail. *(TASK-350)*
- 📝 **`/register`'s copy, by whose it is (TASK-350):** **21 VERBATIM** — both halves the customer's `§17c`/chat
  words, nothing to ask · **2 ADAPTED** — one clause changed, one question each · **2 BORROWED** from
  `/checkin` · **36 PLACEHOLDER PAIRS** — both halves @Porter's, except `FAMILY_FULL` (TH = the server's own
  sentence), `foundConfirm` (EN @Porter's, TH @Fern's) and `typeInstead` (@Sober's pair). 🔑 **One customer
  visit, a different question per set.**

- 🔻 **REVERSED (2026-09-13): tier LABELS FOLLOW THE LANGUAGE; only the VALUES stay Thai.** EN mode showed
  `Province · อำเภอ · ตำบล` — one English label over two Thai ones a foreign parent cannot read, above fields
  they must fill. 🔑 **The "stay Thai" ruling (@Porter's, agreed by @Sober) was reasoning about VALUES —
  `คลองสามวา` is a proper noun on their own mail — applied to LABELS.** ✅ **Now: EN `Province · District ·
  Sub-district` (English loses the เขต/อำเภอ distinction — "District" covers both); TH `จังหวัด · เขต/อำเภอ ·
  แขวง/ตำบล` with the Bangkok flip; VALUES Thai in both modes.** *(TASK-351 — TASK-350 §3's assertion rewritten
  with the reversal inside.)* 📌 ***A rule about VALUES is not a rule about LABELS, even when both are on the
  same line.***

- 🔴 **THE CUSTOMER'S OWN `§17c` ENGLISH EXAMPLE INVITES A SECOND SPELLING INTO `parents.province`.** Screen 6's
  EN half — *"Eg. Prakanueng Nuea, Wattana, BKK"* — is a LABEL whose example is a ROMANISED value: an English
  parent who takes the hint types `Prakanueng Nuea, Wattana, BKK`, stored as-is, while the picker two taps away
  stores `พระโขนงเหนือ วัฒนา กทม` for the same address — **two spellings of one place from ONE page, into the
  column `som-report` groups by.** 📌 **Customer's verbatim text, pre-existing in the chat's EN half — not ours
  to change.** ❓ **Owner's list item 19, BESIDE item 17 as the same decision:** the English hint should show the
  value the way it is stored (Thai), or the field should say "in Thai". *(Found by @Fern, TASK-351.)*
- 🔑 **THE SPLIT TO WALK A PAGE AGAINST: *a LABEL follows `lang`; a VALUE is what is stored.*** (@Fern,
  TASK-351.) Month names in a picker are labels (follow `lang`; the value is digits) · `กทม` in a confirm line is
  a value under a label (correct by the rule) · `(skipped)` is a label standing in a value slot (nothing
  stored). **Walking every rendered string against that one split is the method, and it is reusable.**
- ✅ **HOW A REVERSED ASSERTION IS REWRITTEN** (TASK-351, the model): **the test's NAME says *reversed by
  TASK-nnn*; the comment above states the ruling that was wrong and WHY; the half that was RIGHT stays in the
  same test; the half that was wrong is inverted; a count pin that moves NAMES each member and restates the
  rule it protects** (*`lang` renders; nothing keyed on it sets state*). 📌 **A count pin that names its members
  can be recomputed; one that just says "three" is the next stale claim.**

- ✅ **`REQ-088 §9` — OWNER-RULED (2026-09-13): `parents.province` holds the PROVINCE ONLY (the admin form's
  full name, `กรุงเทพมหานคร`); the address line — `พระโขนงเหนือ วัฒนา กทม`, joined or typed — goes into
  `parents.note`, APPENDED, never overwritten.** *"เก็บจังหวัดลงจังหวัด และเอาจังหวัด อำเภอ ตำบล มาต่อกัน แล้วเซฟลง
  note แทน"*. 🔑 **TYPED (the page's "Type it instead" AND the chat's screen 6) ⇒ `note` only, `province`
  untouched — no guessing a province out of free text; a wrong bucket is worse than an empty one.** **The chat
  changes BY CONSTRUCTION because it already calls the one writer (`createStudentFromLine`).** **No
  migration.** *(TASK-352 BE / TASK-353 FE.)*
- 🔴 **`REQ-088 §9.1` — EXISTING ROWS: THE OWNER MOVED THE ADDRESSES TO `note` HIMSELF AND IS LEAVING
  `province` DIRTY ON PURPOSE.** *"ปล่อยจังหวัดพัง ให้เขาเจอ dashboard พัง แล้วให้เขาไปไล่แก้เอง (admin)"*
  🔑 ***A visibly broken dashboard gets fixed by the admins who know the family's province; a silently empty
  field never does.*** 🚫 **Do NOT write a cleanup. Do NOT file it as a defect. If anyone proposes a script to
  "fix" those provinces, this is the answer.** ⚠️ **Consequence: the admin form's `Select` fed a non-province
  value is the REPAIR PATH — it must let an admin PICK a real province over the dirty value and SAVE, not
  blank or refuse.** *(Verified on the component in TASK-353.)*

- 🔴 **A CONSEQUENCE OF `§9`: `parents.note` now GROWS by machine, and the admin form caps it at 500.**
  `validation.ts:339` — the admin's parent write is `note: z.string().trim().max(500)`; `§9` makes the writer
  APPEND an address on every registration with no cap ⇒ ***after enough registrations the admin cannot save
  that parent at all — the existing note fails the admin's own validator on the next edit of anything on the
  form.*** *(~180 chars after three page-registered children plus an allergy note; five re-registrations
  reach 500.)* 🔑 **One line either way — raise the validator (recommended by @Jason and @Sober: *a form that
  refuses to save what the system wrote is worse than a long note*) or cap the append with a named refusal
  (which silently drops the address — the thing `§9.1` was chosen to avoid).** ❓ **The owner's pick; not cut.**
- ✅ **"UNTOUCHED" IS THE KEY BEING ABSENT FROM THE PATCH, NOT `null`** (@Jason, TASK-352): a patch with
  `province: null` would CLEAR a value an admin set — *the difference between untouched and
  overwritten-with-nothing, and a `toMatchObject` hides it.* **`householdPatch(existingNote, {province,
  address})` is a PURE function asserted with values, and the writer reads the ROW's current note — not the
  row the chat loaded at the start of the wizard — so a staff note written mid-registration survives.**
- ✅ **THE BE HOLDS THE 77 PROVINCES (`lib/thai-provinces.ts`, full forms) and refuses anything else with
  `PROVINCE_UNKNOWN`, in the WRITER for every caller.** 🔑 **The FE's dataset pins equal to the BE's list, not
  the reverse — the server is the source; the FE's list is its claim.** *(TASK-352)*
- 📌 **`§9` reached the chat by ONE WORD at its call site** — `province:` → `address:`; the session draft key
  keeps its name, the column changes. ***Both doors got `§9` from one edit to the writer — that is why "one
  writer" was worth the fight.***
- 🟡 **Named, rare, not proposed: the admin form OVERWRITES `note` wholesale on save** (`parent.service.ts:315`)
  ⇒ an admin editing a parent while a registration appends will save their textarea's older text and the
  appended address is gone — last-write-wins. *The machine's side is safe by construction.* **Nothing prints
  `parents.note` on a LINE message.** *(TASK-352 §7)*

- 🔴 **A MANTINE `Select` FED A VALUE NOT IN ITS `data` RENDERS BLANK, with the placeholder — the value lives
  only in a hidden input.** ⇒ ***a bad stored value HIDDEN as "nothing set", the exact shape `§9.1` refuses.***
  ✅ **The model fix (TASK-353): `provinceOptions(current)` in `lib/people/th-provinces.ts` — a current value not
  in the 77 is put in FRONT of the list as `{ value, label: current, disabled: true }`; otherwise the 77 are
  returned by reference.** **The dirty value is shown AS ITSELF, greyed, unpickable; the admin picks a real one
  over it and saves; editing anything else re-sends the dirty value unchanged — nothing silently cleared.**
  📌 **The visible value IS the warning — no button, no banner, no cleanup.**
- 🔴 **THE SAME SHAPE EXISTS AT FOUR MORE `Select`s** (@Fern's sweep, TASK-353 — owner's list, ONE item):
  **`startTime` over `TIME_SLOTS` seeded from a stored row** (`PlanModal`, `DropResumeDialog`) — TASK-295 fixed
  `17:00:00`, but **a stored time OFF the grid (an imported `09:15`) still renders blank** · `teacherId` over
  `bookableTeachers` (a teacher since made unbookable ⇒ empty; the admin cannot see who it WAS) · `subjectId`
  over the teacher's `subjectOptions` (unlocked path) · `size` over `sizeOptions` (blank on purpose by a guard).
  **Not the shape:** the nationality `SegmentedControl` COERCES a bad value into `none` — a different smell.
  🔑 **`provinceOptions` is the model for all four.**
- ✅ **`/register` sends two forms of one province on one request, each in the field that wants it:** `province`
  = the dataset's `nameTh` (the admin list's spelling, `กรุงเทพมหานคร`) → the column that GROUPS; `address` = the
  joined line with `กทม` → the note that READS. TYPED ⇒ `address` only. **The abbreviation reaching the column
  (`everydayProvinceName` on the send) fails two tests.** `api.ts` gained one line and no rule. *(TASK-353)*
- 📌 **A PIN ACROSS REPOS IS A CLAIM, and it should say so:** a test in the FE cannot read the BE's file (paths
  are per-machine, `machine.local.md`) ⇒ the FE pins its dataset == `TH_PROVINCES`, with the comment stating
  that `TH_PROVINCES` is this repo's CLAIM of the BE's `lib/thai-provinces.ts`, **checked equal by hand
  (77 = 77) on 2026-09-13.** *The `contract.ts` rule applied to a list.*
- ✅ **`parents.note` is rendered in exactly ONE place in the FE — the parent modal's `Textarea`, whole**; the
  parents list renders name, phone and `province` (in full, no truncate — a dirty province shows on the card,
  the owner's "broken dashboard" in the list too). **Nothing in the FE truncates, splits or parses the note.**
  ⇒ 🔑 *the Textarea will SHOW a 600-character note the form then cannot SAVE — the 500-cap finding, from the
  other side.* *(TASK-353)*

- 🔴 **`/register`'s UNLINK IS FAMILY-WIDE — it is the admin's `Clear LINE link` by one more door.** `unlinkSelf`
  → `clearParentLineLink(parentId, "line:<sub>")` → `clearFamilyLine`: **the atomic two-write clear and the
  rich-menu unlink, and it clears EVERY LINE account the family holds, not only the one that tapped** — a
  household with both parents linked (TASK-230) loses both. 🔑 **Not narrowed on purpose: "unlink my account"
  would be a SECOND writer and a different task.** ⇒ **the page's copy must read *"this family's LINE
  connection"*, never *"my phone"*; the warning shows a masked phone + a child COUNT so a parent can recognise
  their family without a name.** ❓ **OPEN with the owner (2026-09-14): family-wide as built, or a per-account
  unlink as a new task?** *(TASK-354)*
- ✅ **ITEM 12 CLOSED IN THE ONE WRITER (TASK-354):** `linkFamilyByPhone` checks `familyOfLineUser` BEFORE any
  parent row exists ⇒ **a bound account entering a phone that is not its family's — even a NEW phone — is
  refused `LINE_BOUND_TO_OTHER_FAMILY`; no orphan parent can be created, on either door.** 🔑 **The CHAT changed
  with it, named:** a linked parent typing `สมัคร` with another family's phone **used to get
  `verify_parent_ok_new` plus an orphan row; now gets `verify_parent_other_family`** — the reply that has meant
  exactly this since SPEC-071, no new key. Their own phone is still a no-op success on both doors.
- ✅ **`POST /register/status`** ⇒ `{ linked: false }` | `{ linked: true, phone: "08x-xxx-xxxx", childCount }` —
  **masked in the HOME, not the route (the raw phone never reaches it): the first TWO digits, every other `x`,
  the customer's grouping; a non-standard phone masked ENTIRELY.** No names, no ids — TASK-047: a count, not a
  list. Writes nothing. **`POST /register/unlink`** ⇒ `{ unlinked: true, cleared: n }` | `{ unlinked: false }`
  (idempotent; the page proceeds to `lookup` either way). *(TASK-354)*
- ✅ **The parent's note cap is 2000 on BOTH parent writes (`createParent.note`, `updateParent.note`); the other
  six `max(500)`s in `validation.ts` are other fields and stay.** *Why 2000: the column is unbounded `text`, but
  a human reads the note in a textarea — ~25 lines, room for ten appended addresses plus a staff note, still a
  guard.* *(TASK-354)*
- 🔑 **THE FRAME FOR THE OWNER'S LIST** (@Jason, TASK-354 §6): **items split into two KINDS — 🟢 FOUND BY USE
  (the owner is currently the only test; each costs a report and a deploy) and ⚪ NEVER FOUND BY USE
  (properties of the suite, the types, the tooling).** ***"The green class is where the OWNER is our QA; the
  white class is where the SUITE is — and the suite is cheaper than him."*** ⚠️ ***"Never found by use" does
  not mean "never found" — it means found by a PARENT, in production, as the first symptom of something else:
  the worst finder there is.*** 📌 Item 12 was findable because a TEST had named it; the white items have no
  test naming them yet, which is why they are on the list. **Green first (each one he finds costs trust); white
  sized by what the suite would catch that he cannot.**

- 🔑 **THE LANGUAGE RULE FOR A CUSTOMER PAGE** (@Fern, TASK-355, tested against every rendered string on
  `/register` — 0 exceptions): ***what a parent must CHOOSE between follows the language; what merely
  IDENTIFIES stays as stored.*** Tier labels and dropdown options are the frame and the choices ⇒ follow
  `lang`; the confirm line, child names, the masked phone, the `DD-MM-YYYY` echo ⇒ as stored. **It would have
  predicted both reversals (TASK-351 labels, TASK-355 options) and the one anomaly (the EN hint whose example is
  a value).** ⚠️ **With the sentence that keeps it honest: *the rule is the DEFAULT and the screen is the TEST,
  in that order; neither replaces the other* — because "values stay Thai" also sounded like a rule and was
  wrong twice.** 📌 **The edge: when a choice's label and its stored value are the same string (a province
  name), the screen shows the chosen language and stores the Thai — two forms of one thing, on purpose (`§9`
  and `§10.2`).**
- ✅ **`REQ-088 §10` LANDED (TASK-355): `/register`'s document title is `SOM SCHEDULE`** (page-level `metadata`;
  the root's `Smart Scheduler` untouched — `/checkin` still shows it; @Fern's reading is that it should follow,
  named not changed) · **EN mode shows the dataset's `nameEn` as option LABELS only — the pick is the geocode;
  `pickedProvince`, the join and the confirm line read `nameTh`; the JOIN following the language fails four
  tests** · **UNLINK is TWO taps** (a red outline, then a red `Alert` with "Yes, unlink the family" / "Keep the
  link", the close path above), the copy family-wide (*"if another parent linked their LINE account too, theirs
  is removed as well"*), the page branching on `st.linked` and nothing else, never masking, never holding a
  full number, `StatusResult` = `phone` + `childCount` only.
- ⚠️ **THE DATASET'S ENGLISH NAMES ARE ROMANISATIONS AND SOME ARE ROUGH** — `thai-address-universal`'s `nameEn`
  gives `Khnong Tan Enue` for คลองตันเหนือ. **If an English spelling looks wrong on a screen, it is the dataset,
  not a mapping error; a fix-up table or another dataset is a task.** *(Told @Porter before the owner's test so
  it does not arrive as a defect.)* *(TASK-355)*

- **2026-09-14 (REQ-088 §10.1):** both LINE-opened pages, `/register` AND `/checkin`, carry document title `SOM SCHEDULE` (page-level `metadata`); every other route keeps the root layout's `Smart Scheduler`. `/checkin` half = TASK-356.
- **2026-09-14 (REQ-088 §10.3):** unlink is FAMILY-WIDE — accepted as built by the owner; no per-account unlink.

## Scope boundary — program/subject management belongs to the BACKOFFICE, not smart-scheduler (owner, 2026-09-17)
The owner built the backoffice as the scalable hub other apps connect to via API — including creating revenue / deducting expenses. **A "rename/manage program" admin screen is NOT to be built in smart-scheduler**; such management lives in the backoffice. smart-scheduler renames via a one-time SQL the owner runs (REQ-090).
- **2026-09-17 (REQ-091):** a rental is a ROW on a booking (`booking_rentals`, migration `0035`, 36 = 36); money posts ONLY through `recordRental` — on the paid press (`hours 1`, `refId = bookingId`) or once at course creation (`hours = size`, `refId = courseId`); five tiers (50/50/100/150/200; `rental-helmet-pads` is the 5th `bo.item`, added on a box by `sale:ensure-items`). The `R` chip: red unpaid, green paid; historic ledger-only rentals show nothing. A whole-course rental is DERIVED from its rows (no column); make-ups inherit through ONE `inheritCourseRental` called by both make-up writers (reconcile + sick-leave append); `resumeCourse`'s new rows do NOT inherit (named, not built). The daily reminder prints `Rental :` to both audiences; `rental_added_teacher` fires only for a same-day add after the reminder ran.
- **2026-09-17 (writers of live course rows):** THREE — create/reconcile · the sick-leave append (`updateBookingStatus`, its own insert) · `resumeCourse` (`insertBooking`). Any fact a make-up must carry needs all of them (TASK-376 §8's table). A source pin on one function cannot see a second function.

## The slot-holder rule is ONE predicate — and it was two until 2026-09-18 (Sober, TASK-397 read)
- **Who holds a teacher's slot = `lib/slot-holder.ts`** (`status NOT IN (CANCELLED, PENDING_RESCHEDULE, SICK_LEAVE, PAUSED) AND group_id IS NULL`) — the index `bookings_teacher_slot_uq` and all four application reads (clash, additional-teacher, make-up/extension placement, the availability picker) take it from there. **Never restate the status list by hand** — that is exactly what broke: from TASK-260 (PAUSED, 2026-09) until TASK-397, the availability PICKER read a second list without PAUSED, so a paused session's slot showed as BOOKED while the system would accept a booking there. Fixed in passing by TASK-397; a PAUSED slot now shows free.
- **A GROUP booking row holds the slot; its SEATS (children's sessions with `group_id`) hold none** — outside the index by the predicate. A seat draws no freelance hour (the group row draws one, like a lesson). The teacher swap on a group sends no message (no notice exists; the owner decides whether one is wanted).
- **Migration `0041` rebuilt the index — closed shop** (ACCESS EXCLUSIVE, reads and writes) — the `0033` rule applies to the cutover minute. Cutover = `0036 … 0041`, verify 42.

## Closed sets that live in THREE places — code, validator, and a DB CHECK (Sober, 2026-09-19, TASK-410's lesson)
- **`bookings.cancel_reason` is constrained by a DB CHECK** (`0025`: `IN ('PROGRAM_CHANGED','CUSTOMER_CANCELLED','ADMIN_ERROR')`; `0045` adds `TEACHER_LEAVE`). The code's `END_REASONS` and the validator are NOT the whole rule — **adding a code to `END_REASONS` without a migration ⇒ Postgres `23514` ⇒ 500 on the first write** (REQ-097's teacher leave, `sid`, 2026-09-19). TASK-410 pins the CHECK's list ⇔ `END_REASONS`. Rule: any closed set that is also a CHECK must be listed here, and its task must carry the migration.
- Other CHECKs on hot tables to remember: `booking_other_price_chk` (`other_price_minor` xor `other_price_item_id`). Enum labels (`booking_type`, `booking_status`) are the other DB-side closed sets — those need the preflight's split.

## 2026-09-22 — 🔴 Never READ on a transaction after a statement in it FAILED (TASK-445)
A pg unique-index clash (`23505`) inside `db.transaction` ABORTS the tx; any further query on that tx — even a harmless `findFirst` for a nickname to build the 409 sentence — answers `25P02 current transaction is aborted` and surfaces as a **500**, hiding the clean 409 that was already built. Rule: load every name/fact the error message needs BEFORE the write loop; a `catch` inside a tx touches memory only. The camp-week create (`syncCampDayRows`) hit this on every coach clash (not a today rule); `swapGroupTeacher`'s 23505 mapping reads nothing — the shape to copy.

## 2026-09-23 — Fern and Fero are the same role
Fern and Fero are the SAME role (Frontend Engineer). Renamed 2026-09-23, owner's decision; older files, board rows and logs still say Fern. Do not rename them.

## 2026-09-23 — 🔒 Writing to a LINE OA needs the account NAMED, not just printed (TASK-448)
A local `.env` pointing at the customer's real OA made `line:relink-menus` report on **`SOM.BALANCE.SCHOOL (@427ybeky)`** — 201 real people — while everyone believed it was the demo. Nothing was written (dry run), but the printed header was the only guard and a header can be skimmed. Rule now enforced in code: every script that WRITES to the Messaging API (`line:publish-menus`, `line:remove-menus --apply`, `line:relink-menus --apply`, `line:push`) calls `guardOaWriteOrExit()` before its first write — the operator must pass `--account @xxxx`, it must match the token's real account (`GET /v2/bot/info`) AND be in `LINE_OA_WRITE_ALLOW`; an unreadable identity, a missing `--account`, a mismatch or an empty allow-list all REFUSE with both names printed. A scan test fails the suite if a new OA-writing script skips it. Read-only tools are unguarded and print the account they read.

## 2026-09-23 — 🔴 A guard must read the STORE THE CONSTRAINT IS ON, and read it before anything writes (TASK-449)
The phone link died three times on `23505 parents_line_user_id_uq` and the webhook swallowed it, so the parent got silence. Cause: `linkFamilyByPhone` calls `bindFamilyLine` (which INSERTS `family_line_links`) **before** `linkParentLine`, whose guard asked `familyOfLineUser` — a router that reads the LINKS table first and `parents.line_user_id` only as a fallback. The insert therefore made the guard answer "this parent holds it" while a DIFFERENT parent still held the id in the COLUMN the unique index is on. **The guard was blinded by a write made three lines earlier, and attempt 1 blinded attempts 2 and 3.** Rules now in code: `holdersOfLineUser` answers "who holds this id" from BOTH stores in one read and is used before any write; `familyOfLineUser` keeps its links-first precedence for ROUTING only (two questions, two readers); the `23505` is caught and mapped to the same refusal, because a race beats any pre-check. And: **no webhook event may end in silence because something threw** — the dispatcher's catch replies with a generic bilingual sentence (never a language lookup inside a failure) and still logs.

## 2026-09-23 — 🔑 A break-and-watch must compare the TEST COUNT, not just `fail = 0` (TASK-450)
Two mutations in TASK-450 first reported as "PASSED" (the mutation slipped past the suite). They had not: the mutated file no longer LOADED, so the test file that imports it never ran — 22 passes, zero failures, and the pin that would have caught it was never executed. **Rule: every mutation run compares the clean baseline's TEST COUNT as well as its failures; fewer tests than baseline is a BITE, not a pass.** Same class as the ledger/census lessons — an absent check and a satisfied check look identical unless the absence is itself asserted.

## 2026-09-24 — 🔑 Three rules from the slot-yield migration (TASK-453)
1. **A partial index's predicate lives in THREE places** — the migration's SQL, the schema's `.where`, and the code mirror (`slotHolderWhere`). They are pinned EQUAL by rendering the schema through `getTableConfig` + `PgDialect` (never by reading source text) and rendering the mirror with its params substituted, all normalised — **with a guard on the normaliser itself**, so the pin cannot pass by collapsing every string to the same thing.
2. **When a migration's last act is an index REBUILD, the witness is the PREDICATE, not a column and not the index's existence.** Both columns land before the rebuild, so a column probe passes on a file that stopped half way; the index existed before and after, so existence proves nothing (0007/0033/0041's lesson, one step further).
3. **Prefer "the check IS the act":** un-yielding a group row re-enters the unique index, so a collision is a `23505` that rolls the transaction back — rather than reading first and hoping nothing changed in between.

## 2026-09-24 — 📵 The demo OA's push quota is exhaustible, and a silent test proves nothing while it is (Porter/Tanya, REQ-105 §7c)
`notification_outbox` on `sid`, 09-23: **63 rows × `429 You have reached your monthly limit`** plus 3 × `400 Failed to send messages`. That is LINE's FREE push quota on the demo OA, spent by a heavy QA day — it was Tanya's "push ceiling" all along. **Rule: before concluding "the notice did not fire", read the outbox rows' `error` (since TASK-450 the run line prints LINE's own sentence).** A delivery check on the demo OA needs quota to be meaningful; a REPLY (to an inbound message) does not consume push quota, a push does.

## 2026-09-24 — 🔗 Clearing a family's LINE link clears both stores — but only for the parent you NAME (TASK-449 follow-up)
`clearFamilyLine` deletes `family_line_links` AND nulls the legacy `parents.line_user_id` in one transaction, and both staff doors (clear-link, archive-parent) use it — so the door has never been the leak. What it does not do, by design, is ask *"does any OTHER parent hold this LINE id?"*. That is how an id kept sitting on parent `62e9562a` while Khwan linked against a different parent and hit `23505` three times. Since TASK-449 the bind asks that question across both stores before writing, so the case ends in a sentence rather than silence.

## 2026-09-24 — 🔴 A migration that DROPS an object must re-point any witness that probes it — in the same task (TASK-459)
`0052` created `camp_week_day_rates`; its witness probed that table. `0053` (TASK-454) merged the table away and dropped it — correctly. But the ledger seeder trusts the witness to decide "has this migration run", so on a fully-migrated `sid` it read `found=false`, called **0052 not-applied**, and proposed applying it — which would have RE-CREATED the retired table and undone the merge. The owner stopped at the dry run.
**The rules now in code:** (1) a witness whose object the current schema no longer declares must be marked **inherited** from the migration that superseded it — `0002`'s shape (*own effect no longer observable*), including the ⚠️ that re-running it would REGRESS the later one; (2) a test walks the witness table and fails if any witness probes an object the schema does not declare and is not marked inherited; (3) **the task that drops the object re-points the witness — not a later cleanup.**
⚠️ Cause on our side: the SA confirmed the merge without asking *whose witness that table was*. The question to ask of any DROP: **does anything prove a past migration by looking at this?**

## 2026-09-24 — 🔑 A pin that matches TEXT is satisfied by code that does nothing (TASK-450 · 458 · 460)
Three times in one week a mutation "passed" because the pin was looking at the wrong thing:
- **TASK-450** — the mutated file stopped LOADING, so the test never ran: 22 passes, zero failures, nothing executed. ⇒ every break-and-watch now compares the clean baseline's TEST COUNT; fewer tests than baseline is a BITE.
- **TASK-458** — *"the course rate is never cleared"* was pinned on a SOURCE LITERAL, so a `null` reaching the save through a cast left the suite green. ⇒ pin the CALL, not the source.
- **TASK-460** — the sweep pin matched `delete(lineWebhookEvents)`; the mutation kept that text and removed the `await`. `void db.delete(...)` greps identically and sweeps nothing. ⇒ the pin requires the awaited call AND the row count.
**The rule: pin the EFFECT a user or the next run can observe — a rendered string, a call with its arguments, a row count — never the presence of a line of code.** An absent check and a satisfied check look identical unless the absence is itself asserted.

## 2026-09-24 — 🔑 A census sweep across many files is a code change, not a chore (TASK-460)
Renumbering the migration-count pins swept `toBe(55)` → `toBe(56)` across 37 files and rewrote one that meant **55 minutes** in an unrelated auto-cut test. The suite caught it; the author reverted and audited every other hit. **Read each hit before writing it, and check the sweep's report against what the number MEANS.** A wrong green pin planted this way stays invisible for months.

- **QA login on `sid` (recorded 2026-09-24 after a wasted round):** `project-docs/sm-test-access.txt` (admin/admin) is **STALE since the RBAC deploy (2026-09-18)** — the users table retired it. The owner gave a super-admin credential after Round 31 (TEST-066); its per-machine location is in `machine.local.md` → "smart-scheduler QA credentials". Never ask the owner for a sid login again without checking there first.

- **Scheduled-job triggers live IN THE CODE REPO** (recorded 2026-09-24, after Porter sent the owner to hand-make files): repo `smart-scheduler-back`, folder `sm-jobs/` — one `.ps1` per job (daily-digest, daily-reminder, end-of-day, month-reset, weekly-teacher-digest, + group-series-extender once Sober adds it). The owner copies them to the box and registers them in Task Scheduler. **Before telling the owner how to deploy a job, check `sm-jobs/` first; a new job must ship its `.ps1` there in the same task.** The old `DEPLOY-scheduled-tasks-windows.md` (hand-written `C:\sm-jobs\…` files) predates this folder.

## 2026-09-24 — 📦 A new scheduled job is not done until its `sm-jobs/*.ps1` trigger ships WITH it (TASK-461)
The owner deploys jobs by copying a one-file PowerShell trigger from this repo's **`sm-jobs/`** (`daily-digest`, `daily-reminder`, `end-of-day`, `month-reset`, `weekly-teacher-digest`) to the box. TASK-456 shipped the job, the internal route and the script but **no trigger**, so there was nothing to deploy and the owner hand-wrote one. **Rule: a task that adds `POST /internal/jobs/<name>` adds `sm-jobs/<name>.ps1` in the same task**, in the siblings' exact shape — and a test walks BOTH directions (a route with no trigger is undeployable; a trigger pointing at a renamed route fails silently on the box every night for ever). ⚠️ SA note: the convention was visible in `sm-jobs/` and the TASK text asked for "an exe + a registration" instead — **read how the thing is actually deployed before describing it.**

## 2026-09-24 — 🔑 Two more harness rules, and a detached-promise trap (TASK-462)
1. **A mutation must test the bug someone would actually write.** TASK-462's mutation G "passed" — because the mutation itself was wrong (it counted complete series only once the budget was full, a bug nobody would write). Rewritten to the real inversion, it bit. *A mutation that tests an imaginary bug proves nothing, in either direction.*
2. **A job with two doors needs both checked.** TASK-461's rule walks `sm-jobs/*.ps1` ⇄ `/internal/jobs/:name`. The extender also has a **bun exe** (`scripts/*.ts`) calling the same route, and it was still sending `{}` after the body changed — it would have reported a plan nightly and created nothing, **with a green exit code**.
3. 🔴 **`void p.finally(fn)` is not fire-and-forget: `.finally` returns a promise that REJECTS when `p` does** — an unhandled rejection no caller can catch, which ends a Bun/Node process. Use `void p.then(fn, fn)` when the point is "run this either way and swallow". This was live in the per-chat queue for three tasks, a path from "the database hiccuped" to "the API vanished" — introduced by the change that was fixing exactly that class of silence.
4. **`unhandledRejection` ⇒ log and keep serving; `uncaughtException` ⇒ log and `exit(1)`** (state is unknown after a synchronous throw; never `exit(0)` — a supervisor reads it as a clean stop).

## 2026-09-24 — 🔴 Two lists of "the same fields" will drift, and an exclusion BY NAME loses to the next route (TASK-463)
**DEF-3, a real coach-pay leak found by QA:** the coach-rate READ mask named three fields (`rate`, `classRateMinor`, `teacherRates`) while the WRITE check named four (plus `rateMinor`). TASK-454 then added a fourth read surface — the camp day's `teachers[].rateMinor` — and nothing added it to the mask, so a `menu:camp` user without key 59 read every coach's pay. ⚠️ TASK-434 had pinned *"no DTO carries `rateMinor`"* **by absence**, and that pin stopped covering the thing it was written for without anyone noticing. **Rules: one declared set of "this is a coach-rate field", derived into both uses; and a walk that fails when any DTO surface emits a rate-shaped field the mask does not know — the next new rate field must fail the suite the day it is written, not the day someone reads a colleague's pay.**
**DEF-2:** `uuid-params` excluded `:key` and `:date` **by NAME** because `:key` was a settings key — then the series routes named a uuid `:key`, so the guard skipped exactly the params that needed it and a malformed one reached Postgres (500). **An exclusion by name is a bet that no future route uses that name differently; we lost it in two weeks. Decide by ROUTE, not by param name.**
⚠️ SA note: both defects passed my review. The question I did not ask of TASK-454 was *does this new field go through the mask?* — the same shape as the witness miss on the same task.

## 2026-09-24 — 🔴 The fourth time this week: a pin matched the LAYOUT, not the output (TASK-463)
TASK-434 pinned "no DTO carries `rateMinor`" with a regex anchored to the START of a line. TASK-454 wrote that key in the middle of a one-line object literal — the regex walked past it, and a `menu:camp` user without key 59 read every coach's pay until QA found it. **The pin was never removed and never scoped away; it stopped matching the day someone formatted the code differently.**
With TASK-450 (a mutated file stopped LOADING, so the test never ran), TASK-458 (pinned on a source literal, not the call) and TASK-460 (matched the TEXT `delete(...)` while the mutation dropped the `await`): **pin what the API emits or what a user sees — never the shape of a line of source.** And when a walk finds one name, ask for the SECOND of the same shape: this one also found `teacherRateMinor`, unmasked, one careless reader away from the same leak.

## 2026-09-24 — 📌 What is on `uat` is a LOG fact, not a memory fact (SA correction)
I told Porter that keys 57/59 were not on `uat` yet. **Wrong** — `log/2026-09-22.md` records "WHOLE BATCH (REQ-094…104) LIVE ON uat — 2026-09-23": migrated to **53**, `ensure-subjects --apply` (2 DUO subjects), backfill 0, weekly digest registered Mon 08:15, **grants 57/58/59 + Teacher role**, camp reminder off, pm2 restarted. What is NOT on `uat` is only what came after: TASK-446…463 (including TASK-463's camp `rateMinor` fix and REQ-105's per-coach camp table).
**Rule: before stating what a live environment has, READ the log entry for that deploy.** The repo is the memory (CLAUDE.md); a deployment claim from recollection is exactly the kind of "as discussed before" the workspace forbids — and stated to the PM it becomes a wrong answer to the customer.

## 2026-09-25 — 🔴 `NaN` in a STRING comparison is an infinite loop, not a wrong answer (TASK-465, and the likely cause of the `sid` incident)
`weeklyDatesToCreate` walks `for (d = …; d <= horizon; d = addDays(d, 7))` — a **string** compare. When the horizon was `"NaN-NaN-NaN"` (a resolved-setting object passed to `Number()`), `"2026-11-13" <= "NaN-NaN-NaN"` is **`true`** (digits sort before `N`) **for every date, for ever**: 360,756 iterations in 300 ms, into the year 8940, growing an array synchronously on the event loop.
- On a box with **no** series: a green zero — which is all `uat` showed.
- On a box **with** a live series: the call **never returns** — no HTTP response at all, and memory grows until something kills the process. **That matches the `sid` incident** (connection closed with no response + the shared Postgres cluster into recovery = an OOM kill on a 30-app box). Not proven from the repo; Otto's OOM/Postgres line would settle it.
**Rules:** (1) a loop bounded by a **string** compare must validate the bound's SHAPE before looping, **inside the loop's own function** — a caller's check does not protect the next caller; (2) bounds applied *after* a function returns (`maxDates`, `maxSeries`) protect nothing if that function may not return; (3) 🔑 **a resolved setting now REFUSES coercion** — `Symbol.toPrimitive` throws, so `Number(obj)`/`+obj`/`` `${obj}` `` fail loudly on the first run instead of producing a plausible `NaN` three calls later; (4) ⚠️ a synchronous infinite loop cannot be caught by a per-test timeout (the timer never gets the thread) — only the runner's outer timeout sees it.
📌 SA note: TASK-462 §1.1 said "the work IS bounded — the loop's bound is a string compare against the horizon", and I signed it. **The bound held only while the horizon was a date.** Reading a comparison is not reading a loop.

## 2026-09-25 — 🔑 Two more harness rules, from the extender's cancelled-date fix (TASK-466)
1. **A wrong `BASELINE` can MANUFACTURE a bite.** A run with `BASELINE=60` against a 51-test set reported mutation B as caught; B had actually passed. The baseline must be the clean run of **that** set — this is the mirror of the 09-24 rule (a mutation that never ran reports as a pass): too low hides failures, too high invents them.
2. **A spy that ignores its arguments cannot see a change to those arguments.** Every extender fixture fakes `findMany` and drops its `where`, so adding a status filter **at the database** was invisible to all of them — the defect's other door. The pin now runs the real `where` callback against recording operators and asserts what it asks for.
📌 And the sentence worth remembering about why this sat unseen: *the full suite stayed green through the fix before any new test existed — every older fixture had live rows only.* **The fixtures agreed with the bug.**

## `bookings.checkin_source` holds TWO kinds of fact — a channel and a person (Sober, 2026-09-25, TASK-481)
The column stores `shopfront-qr` · `checkin-qr` · `end-of-day` **and, for a staff attend, the admin's USERNAME** (`actorOf`). Camp's `marked_by` is the same. **Any rule written for one kind is wrong for the other** — which is how a "show the provenance" task became a privacy question. Until it is split into a channel column + an actor column (next round, with Undo, which needs both anyway): **a scoped teacher reads `null`** on `/bookings` and `/calendar`, and the admin chip renders `shopfront-qr` only.

## ABSENT is terminal to every SCAN, but not to an ADMIN (Sober, 2026-09-25, TASK-480)
`campScanOutcome` refuses to overturn a coach-recorded `ABSENT` — for the roster QR and the shop-front QR alike (the bot has **no** camp scan path; there are **two** callers of `checkinCampByToken`, not three). **`ABSENT → ATTENDED` stays legal through `assertDayTransition` / `markDay`**, because a coach who marked the wrong child must be able to correct it. The rule is *who* may overturn a human's judgement, so it lives in the scan rule and nowhere else. 🔇 It went unseen because `consumes()` is true for ABSENT and ATTENDED alike ⇒ **the flip moved zero units, so nothing on any money report looked wrong.**

## Migration `when` values are hand-assigned `1783…`, and that is load-bearing (Sober, 2026-09-26, TASK-494)
Drizzle decides what to apply by comparing **one number — the newest `created_at` in the ledger — against each migration's `when`**, never by hash. Our journal's `when` values are a hand-assigned series (`1783000000000`+, `0056` = `…052`, `0057` = `…053`).
**Measured by the owner, 09-26:** `sid` 97 rows / 97 distinct hashes, `uat` 78 / 78, both with `min 1782154751279` and **`max 1783000000052`**. ⇒ the surplus rows are **pre-split history with REAL timestamps, all BELOW our series**, so there is **no silent-skip hazard on either box**, and no duplicates anywhere.
🔴 **The safety is an accident of the numbering, not a property of the tooling.** One migration generated with drizzle's default `Date.now()` lands at `1790…` and **every migration after it is skipped in silence, exit 0** (the TASK-085 failure mode). TASK-494 pins strictly-increasing `when`s inside our series.

## `every` vs `any` changes the EMPTY case (Sober, 2026-09-26, TASK-489)
`every` over an empty list is **vacuously true**. Swapping `anyHouseholdSuspended` for `everyHouseholdSuspended` without `if (!studentIds.length) return false;` would have turned *"a walk-in with no parent is never blocked"* into **"a walk-in is always blocked"**. The empty case is the one nobody writes a fixture for.

## DUO suspension: refuse only when EVERY household is suspended (Sober, 2026-09-26, TASK-489)
Owner ruling 3. A DUO is **one booking row, two children, one shared token, no per-child attendance or credit**, so "refuse only the suspended family" cannot mean checking in one child and not the other. The public `/checkin` door cannot know who is asking (the token is the row's), and the old "any household" rule told family A *"your account is suspended"* — **false about A and a disclosure about B**. Consequences the owner accepted as information: the class is delivered to both; a suspended family with the desk QR can check the shared row in; **CRM points are not withheld on suspension anywhere** (pinned by value, so a future ruling makes that pin fail on purpose).

## `db:generate` must be `--custom`, and the `when` must be renumbered (Jason via Sober, 2026-09-26, TASK-494/495)
Two facts that were not written down anywhere:
1. **`drizzle-kit generate` hardcodes `when: +new Date()`**, which lands above our whole hand-assigned `1783…` series. Drizzle applies by comparing **one number** (the ledger's newest `created_at`) against each `when`, never by hash ⇒ one such migration **silently skips every migration after it, exit 0**. TASK-495's wrapper renumbers the newest entry; TASK-494's test catches a hand-edited journal or a bad merge.
2. 🔴 **`drizzle/meta` holds snapshots only for `0000`–`0003`**, so a **diff-mode** `db:generate` would try to **re-create every migration from `0004` on**. **`--custom` is the mode this repo works in.**
Also: **drizzle-kit can error and still exit 0** — a tool that edits the journal must survive the upstream failure that looks like success.

## A comment untrue about its own line is the same defect as a column name untrue about its contents (Sober, 2026-09-26)
TASK-488 existed because `checkin_source` held a channel *and* a person. TASK-492 shipped a new RBAC key whose trailing comment described its **neighbour** and said the opposite of what the key means. **Both are read as fact by the next person.** When a line is inserted beside another, the comment that followed the old line is part of what moved.

## 🔴 A middleware guard only protects the routes registered AFTER it (Jason via Sober, 2026-09-26, TASK-499)
`src/index.ts` registers the **public** routes (`publicCheckin` at `:71`, the ICS calendar, `publicRegister`) **before** `authMiddleware`, `accessGuard`, `uuidParamGuard` and **`coachRateMask`** (`:80`–`:84`). Hono runs handlers in registration order ⇒ **none of those guards has ever applied to a public route.** The coach-rate mask (key 59, TASK-431) was therefore absent from exactly the doors with no login.
**What that exposed, measured by a real request through the root app:** the public check-in answered with the whole 33-key `toBookingDTO` — **the coach's `rate`**, `discount.actor` (an admin's username), the staff `note`, the course's internals, `teacher.type`, and the CRM fields.
🔑 **The fix is an ALLOW-list, not a deny-list:** the admin DTO grows every round, so a deny-list makes each new field public by default. Public check-in answers carry only `date`, `startTime`, `endTime`, `student.name`, `subject.name`, `teacher.nickname` (+ `already`, `crmAwarded`, `remaining` at the top level) — every field the pages actually read.
📌 **Any guard expressed as middleware needs a pin that checks its promise where it does not run.** `COACH_RATE_FIELDS` is now asserted against the public doors' output.

## The test suite runs against `sid` — BY DESIGN (Jason via Sober, 2026-09-26, TASK-500; ⏹️ owner ruling below)
**Bun auto-loads `.env` into every `bun test` run**, and the tests' own `process.env.DATABASE_URL ??= "…localhost…"` **cannot override a value that is already set**. The back repo's `.env` on this machine points at **`154.197.124.206:5432 / smart_scheduler`** (the same host as `.env.sid`) and carries a **real `LINE_CHANNEL_ACCESS_TOKEN`**, which also starts the outbox worker on import.
⇒ **44 tests in 16 files make real database calls on every full run**, and the intermittent ~10 017 ms failure was a **connection wait, not a flake**. Files: the LINE dispatcher and root-app auth paths (`middleware/auth`, the `req105`/`req107`/`req108`/`req109` service tests, `routes/envelope-reachability`).
🚫 **Superseded:** the SA proposed a `bunfig.toml` preload forcing a dead local port and blank credentials, and paused his own suite runs. **The owner ruled that setup is intended** (see below), so **the preload is NOT built** — it would break what he wants — and the suite is run normally.
✅ **The one guard that IS wanted (TASK-503): refuse to run the suite when `.env` points at the UAT database or the real OA (`@427ybeky`).** Testing against the customer's box must be impossible; testing against `sid` is not.
✅ Mocking a test that was meant to be a unit test is **ordinary work** where it is flaky or slow — not an incident.
📌 **The SA's mistake, kept because it is the useful part: "never touch a real database" is a rule about the CUSTOMER'S environments.** `sid` is the test box. Reading the rule at its widest and escalating before asking which environments it covers cost the owner a decision he should not have had to make.

- 🔴 **Tests running against `sid` is BY DESIGN** (owner โด่ง, 2026-09-26: "เทสบน sid นั่นแหละ ถูกแล้ว"). The back repo's local `.env` pointing at the sid database and the demo OA token is the intended test setup. It is **not** a leak and **not** a rule breach. Do not escalate it again.
  - The one boundary that still holds: **never run the suite while `.env` holds uat values**. The owner switches `.env` to uat only for a uat deploy and switches it back afterwards.
  - ⚠️ **2026-10-02 (Bob, TASK-607): `.env` held uat values on this machine after the uat release, and the guard refused the run as designed.** **`bun --env-file=.env.sid test …` runs the suite against `sid` WITHOUT touching `.env`** (Bun then loads only the named file; the guard reads `process.env` and passes). 🚫 Do not edit or copy over `.env` to get a run — the owner may be running the uat BE from it.
  - 🔻 **SUPERSEDED 2026-10-04 (Bob, on the owner's ruling — see the section "🔴 OWNER RULING 2026-10-04 — engineers do NOT verify against sid"):** the `--env-file=.env.sid` advice above is **withdrawn**. An engineer never runs the suite against `sid`; the suite runs with the database pointed at nothing. Kept, not deleted, so the next reader sees what we used to do and why we stopped.
  - ⚠️ **Same run: `teacher-schedule-req109.test.ts` "the REASON sits beside the English strings" fails on THIS checkout, unrelated to any change** — it `toContain`s a multi-line string with `\n`, and `src/lib/teacher-schedule.ts` is checked out CRLF (`core.autocrlf=true`). A full-suite "1 fail" here is that pin, not your diff — check its name before reading it as yours.

## A "this test proves nothing" finding needs a CONTROL (Sober, 2026-09-26, TASK-507)
**A claim that an assertion is vacuous is itself a claim, and it can be wrong.** The only way to know is to **break the thing the assertion supposedly guards and watch the old line pass.** TASK-507 did that three times (`A0`, `G0`, `H0`) and the old lines sat green each time. **From now on: every "this test wasn't doing anything" report carries a control run.**
**Shapes that cannot fail, found so far:** `not.toBe` against a value the expression cannot produce (`status).not.toBe(401 + 1000)` — both refusals are 401, so a status can never separate them) · `expect(calls.where).toBeDefined()` (any `where` passes, including one matching every row) · a function compared with **itself** (`expect(f(x)).toBe(f(x))`).
✅ **Not every vacuous-looking line is a defect:** `course-status:189` is vacuous **by design** — it exists to give an `@ts-expect-error` somewhere to live, and `tsc` is what enforces it.

## A list is a memory; a derivation is a fact (Sober, 2026-09-27)
Every time this round replaced a written list with something derived from the source, **the derivation immediately found what the list had missed**:
- migration `when` values → the journal read directly (TASK-494) — found that `drizzle-kit generate` makes the hazard on **every** run;
- the visible session statuses → a typed table over the **real enum** (TASK-486) — found **EXTENDED missing from every Monday digest**;
- the unguarded routes → derived from `index.ts` (TASK-501) — found the root-mounted `/openapi.json` pair;
- the read-modify-write counters → a scan over every `.set({…})` (TASK-496) — found a **third** counter, `camp_packages.used_units`;
- the coach-message producers → derived by scanning for `recipientType: "teacher"` (TASK-512) — found **four** primary-only senders after the previous task had called the list complete.
🔑 **So: when a task needs "all the places that X", derive them and make the derived set EQUAL a classified set.** A new one then fails the suite until someone decides how it should behave — **a decision forced at the moment of writing**, not a rule to remember. And **keep an exceptions class**: a pin that cannot express a legitimate exception gets deleted.

## 🔴 A class can be MOVED and nobody is told (Jason via Sober, 2026-09-27, TASK-512 §3)
`moveBooking` and the plan editor's `edit` update the booking **in place** (same id, new date/time). ⇒ **no cancel notice, no confirm notice, and no message to the coach, the family or an admin.** The only send on that path is `sendTeacherReassigned`, and only when the **teacher** changes. `PENDING_RESCHEDULE` exists as a status **nothing writes**, and `reschedule_requested` has a renderer with **no producer**.
**A coach learns passively or not at all:** the ICS feed, the next daily reminder **if it is sent after the move**, or the Monday digest ⇒ **a same-day move made after that morning's reminder reaches them through nothing.**
⏸️ **With the owner (2026-09-27): should a move be announced, to whom, in what words?** Nothing built.
- **`sid` pm2 (`som-back`) runs the backend entry directly.** Verified on 2026-09-27, the first deploy after TASK-505 (the outbox worker starts only when the app is the process entry): the log showed `[outbox] LINE worker started (every 15s)`. Do not ask the owner for this line again on sid. uat still needs the same one-time look on its first deploy after TASK-505.

## 🔴 `mock.module` is global to the test PROCESS — always spread the real module (Fern via Sober, 2026-09-27, TASK-532)
A `mock.module` that returns **only the members the current file needs** **silently deletes the rest for every other file in the same test process.** Found within an hour of adding the FE's DOM harness: two unrelated suites failed with *"Export named 'useResolveClashMove' not found"*, **pointing at the innocent files rather than at the mock.**
✅ **FE rule: every `mock.module` spreads the real module and replaces one member**, with the reason beside it.
🔨 **BE rule (TASK-533, stricter): NO `mock.module` at all, except a NAMED exception carrying its reason** — the repo has **zero** calls, `spyOn` has served every case for months, and the trap is process-global. A scan over `src` + `scripts` enforces it, **pins "zero today" so the first one is a visible act**, fails a stale exception, and is **proven on samples so a green scan over zero calls is not vacuous.**
📌 **The BE had already learned this once (TASK-072 removed its mocks) and recorded it in FIVE COMMENTS — it took an FE discovery months later to turn it into a check. A fact in five comments is not a rule.**

## A control is proven by CLICKING it (Sober, 2026-09-27, TASK-531/532)
"The API works" is not "the feature exists" (TASK-492 shipped an endpoint with no screen); **"the component renders" is not "the button works"** (TASK-518 shipped a control whose dialog was mounted inside `<Menu.Dropdown>`, so the click that opened it unmounted it — **no dialog, no request, no error**).
✅ **The FE now has a DOM harness** (`happy-dom` + testing-library, via `bunfig.toml` → `test/dom-preload.ts`), so for a **control** the proof is: **real click ⇒ the dialog found on screen ⇒ real confirm ⇒ the request asserted at the fetch boundary**, plus a refused act showing the server's sentence with no success.
🚫 **A `.dom.test.tsx` is for a CONTROL** — something pressed that is irreversible or expensive (money, a message to a family, an undo) — **never labels, layout or copy counts.** A harness used to assert that text is centred is slow, brittle, deleted within a month, **and takes the rule with it.**
⚠️ **Still outside any DOM harness:** the real browser's CSS, focus, z-index, and a phone's tap. **"Clicked" must not come to mean "seen".**
- **No coach uses a web (frontoffice) account as of 2026-09-28** (owner โด่ง). Do not count or check this; coaches use LINE only. A coach-facing web link means the shop must create their web user first.

## DOM-harness facts that cost an afternoon each (Fern via Sober, 2026-09-28, TASK-539)
1. 🔴 **Bun does not auto-clean between tests.** A render **leaks into the next test**, and **the failure then names the WRONG test** — the one that inherited the DOM, not the one that left it. **Clean up explicitly.**
2. 🔴 **A Mantine modal's shell and title SURVIVE a close transition that happy-dom never finishes** ⇒ **a title can never prove a close.** **Probe inside the conditional (`{target && …}`)**, not on the modal's chrome.
⚠️ **Still outside any DOM harness:** the real browser's CSS, focus, z-index, and a phone's tap. **"Clicked" must not come to mean "seen".**

## Admin rights on a LINE account: no permission key, on purpose (Jason + Fern via Sober, 2026-09-28, TASK-538/539)
**Listing and removing LINE admins is gated by `isSuperAdmin`, not by an action key** — **a key is grantable, so the power would become delegable.** 🔑 **And a 61st key would have been worse than no key: a granted non-super-admin would see a button that always 403s** (TASK-518's rule — *a control that cannot succeed invites a person to try and then tells them no*). **No super admin ⇒ no panel, and the list is never fetched.** `ACTION_KEYS` stays **60**.
📌 **Removal order matters and is deliberate: the id comes off the admin list FIRST, then the menu** — so **the notices stop even if the menu update fails** (`menuSettled: false`, warned on screen). **A rollback would leave a stranger's phone receiving other families' children.**
⚠️ **With ZERO LINE admins, admin notices go to nobody, and nobody can re-link until the new admin code is set.** ⭐ **Order: new code → real admins re-link → remove the unknowns.**

## A GET carries an action key in exactly ONE place (2026-09-28, TASK-546)
**Rule (TASK-385, pinned twice): no GET carries an action key.** **Exception, named and reasoned: `GET /bookings/:id/undo-preview`.**
🔑 **The rule exists so a READ is never gated by a grantable power. This GET is a preview of a privileged ACT, and its gate is the ACT's gate** — ONE `UNDO_ACCESS` value and ONE `assertMayUndo` on both routes, derived, not re-typed.
⇒ **The alternative was a second, re-typed guard — the drift the shared gate exists to prevent.** **Every other read still carries none; the exception is pinned to the Undo's own entry.**

## A preview is a forecast, not a guarantee (2026-09-28, TASK-546)
**`undoBooking` = `planUndo` + writes; the preview IS `planUndo`, read-only** ⇒ the dialog and the act cannot disagree **because they are the same reads**, not an agreeing copy.
⚠️ **But `UNDO_PLAN_WOULD_CHANGE` is decided AFTER the act's writes** ⇒ **the act can refuse a preview that said ok.** **The act stays authoritative; no caller may skip or disable a failure path because a preview passed**, and any screen must word a post-click refusal so it is not a contradiction.
📌 **Not closed deliberately:** moving the balance check before the writes would change the act (whose being untouched was the whole value), and a rollback dry run takes write locks for a dialog.

## Copy: approval covers what was SHOWN, and value pins ADD to shape pins (2026-09-28, TASK-549/550)
🔑 **An owner's "approved" covers exactly the strings he was shown.** **TASK-549: `COPY-REVIEW-2026-09-28.md` §D listed 10 of the LINE-admin page's 17 strings, so "ผ่านหมด" left 8 unapproved** — they stay drafts, **and a mutation that sneaks one into the approved list bites.** ⇒ **Nobody may read silence as approval; the boundary of an approval is enforced, not remembered.**
**When copy becomes final, the value pin is ADDED and the shape pin is KEPT:**
- **a reword that keeps the promise fails ONLY the value pin ⇒ a conversation;**
- **a reword that breaks the promise fails the SHAPE pin ⇒ a defect.**
✅ **The reasons stay in the comments and are themselves pinned** — *approved does not mean unexplained.* **Pin templates, never a rendered example.**
📌 **The right proof that copy matches: compare the APPROVED DOCUMENT against the strings THROUGH `t()`** (TASK-550: 4/4) — that tests the template, the lookup and the language, not a constant.

## Removing a wrong rule that is covering a gap exposes the gap, at the rule's full scale (2026-09-29, TASK-552)
**`planCourseMoves` counted a leave as matched if ANY row pointed at it, including a CANCELLED one.** The rule is wrong — **but two writers ANSWER a leave WITHOUT linking**, and the wrong rule was covering for them:
1. **pause → resume** re-lays owed sessions **unlinked**;
2. **an admin insert** filling a leave's gap answers it **unlinked** (the reconcile trims the leave's make-up).
🔑 **So "a cancelled make-up is not a make-up" is only safe ONCE EVERY ANSWER CARRIES ITS LINK.** Shipping the one-line fix first **moves D7 (a forecast saying "no make-up" and an Undo refusing) onto every paused or inserted course.**
⇒ **Order: writers link → backfill → then the planner line** (TASK-553). **TASK-552 (B) closes the walked path by making the re-owe INHERIT the cancelled row's own `extended_from_id`** — 🚫 **never a date match or "the most recent leave", and an absent link stays absent.**
📌 **The general rule: before removing a rule, derive what has been resting on it. A wrong rule live for months usually has something resting on it.**

## Never read the event inside a state updater — and the rule is enforced, not documented (2026-09-29, TASK-554)
🔴 **`onChange={(e) => setX((prev) => e.currentTarget.checked ? … : …)}` crashes**: React may run the updater after the event is released, so `currentTarget` is null. 🔑 **The eager `dispatchSetState` path makes the FIRST interaction work and defers the SECOND into the render phase** ⇒ *"the first tick survives, the second dies"* — which is why it passes review and reaches production.
**Read the value eagerly in the handler body.** 🚫 **NOT `e.currentTarget?.checked`** — *that stops the crash and records the wrong thing silently, which on a public shop-front page is worse than falling over.*
📌 **TASK-237 (REQ-078 DEF-1/DEF-5) diagnosed this and wrote the mechanism into a comment. It came back nineteen tasks later on a PUBLIC page.** ⇒ 🔑 **We did not lack the knowledge; we lacked a test.** **Now enforced repo-wide by `lib/ui/event-in-updater.test.ts`** (comments stripped, the failure names the file, the optional-chain rescue refused).
🔑 **The general rule: a defect written down in prose is not prevented. If a class of bug is worth a comment, it is worth a check that fails.**

## A writer that does not RECORD what it did is a class of defect here (2026-09-29, TASK-552/553/556)
**Three found in three days, all the same shape — a write happens and nothing records that it happened, so a later reader cannot tell "nothing" from "unknown":**
1. **pause → resume** re-lays owed sessions **without linking** them to the leave they answer (TASK-553);
2. **an admin insert** filling a leave's gap answers it **unlinked** (TASK-553);
3. **`repair-course-expiry.ts` (FIX-007)** moves an expiry **without `recordExpiryChange`**, and can be re-run (TASK-556) — as did **every stretch/edit before migration 0034**, which was never backfilled.
🔑 **The consequence is always the same: an ABSENT record gets read as EVIDENCE OF ABSENCE.** *`extendedFromId === null` read as "no make-up"; `latest === null` read as "never moved".*
⇒ **Before treating a null as evidence, derive whether every writer of that fact records it** — and **if one does not, the null means "unknown", not "no".**
📌 **The SA made this exact error twice in one week** (TASK-552 and TASK-556): *ruling on a rule without ruling on the state of the data the rule reads.*

## The Undo's expiry refusal (D8) is COMMON, not an edge case (2026-09-29, TASK-556)
**The born ceiling = plan end + quota weeks** ⇒ **the make-up of a course's LAST in-quota leave lands EXACTLY on the born expiry, with no stretch and therefore no change record.**
⇒ **`UNDO_EXPIRY_UNRECOVERABLE` fires for EVERY size-4 course's leave**, the 2nd leave of a size-6 and the 3rd of a size-10. 📌 **It stayed invisible because TASK-492's fixture happened to carry a system change record**, so the born-ceiling shape was never tested.
✅ **It fails safe** (it refuses and asks for a human) — but **"the commonest leave cannot be undone" is not shippable.**

## The migration table does NOT record when a migration was applied (2026-09-29, TASK-556)
🔴 **Drizzle writes `created_at` = the JOURNAL'S `when`** — our hand-assigned synthetic series value (0034's is `2026-07-02`) — **not the moment the migration ran.** ⇒ **It is IDENTICAL on sid, uat and production.**
🚫 **Never use it to answer "when did THIS box get feature X".** 🔑 *It reads like per-box evidence and is a constant in disguise* — **the SA ruled exactly this mistake in TASK-556 and the engineer caught it before code.**
✅ **To date a capability on a box, record a marker** (`COALESCE(the earliest row the capability itself wrote, now())`) — 🔑 **write the fact down rather than deriving it from an absence**, because an empty table cannot distinguish *"nothing happened yet"* from *"we were not recording yet"*.

## `repair-course-expiry.ts` (FIX-007) is RETIRED (2026-09-29, TASK-556)
🔴 **A re-run resets native expiries to `courseExpiry(start, size)` — EARLIER than the born ceiling — discarding every recorded stretch and admin move, with no record.** ⚠️ **Its header still claims "idempotent", which is stale and would be believed.**
**It ran `--commit` on both boxes on 2026-08-28 (traced), and both runs precede migration 0034.** ✅ **It cannot produce the silently-late expiry shape** (it writes a make-up-independent value); **only a pre-recording stretch, edit or resume can.**
⇒ **Retired as a REFUSING STUB that explains and points at TASK-556** — 📌 *a script that vanishes gets rewritten from memory by whoever needed it; one that refuses and explains does not.*

## What does NOT travel between machines (2026-09-29, recovered from `PROJECT-STATUS.md` before it was retired)

Recovered verbatim in meaning from the 2026-08 header of `PROJECT-STATUS.md` (Porter); kept because it is the
only place this was written and the owner changes machines constantly.

- 🔴 **The `.env` in each repo root is NOT in git.** On a fresh machine it is copied by hand or **nothing
  connects** — and because the `.env` is also what decides whether you are pointed at `sid` or `uat`, a machine
  with no `.env` and a machine with the wrong `.env` fail differently and neither says so.
- 🔴 **QA's access file (`project-docs/sm-test-access.txt`) does not travel either**, and the repo paths live only
  in `machine.local.md` at the workspace root (git-ignored).
- 🔴 **The server job scripts (`C:\sm-jobs\*.ps1`) live ON EACH SERVER**, never on the dev box — so nothing you do
  on a dev machine can show you what is scheduled on either box.
- 📌 **First command on a new machine: `bun run db:verify` in `smart-scheduler-back`.** Not green ⇒ either the
  wrong box or the ledger needs `db:seed-ledger`. (Porter, 2026-08-30.)
- 📌 A machine-local `.claude/memory/` does not travel and is not a source of truth. **The repo is the memory.**

## Fitting is not evidence (2026-09-13, @Porter — recovered from `PROJECT-STATUS.md`)

🔴 **@Porter read structure into the owner's prose five times in one fortnight, and every reading FITTED.**
A reading that fits the words is not a finding about what he meant — it is a hypothesis, and it must be asked.
🔑 Its twin, from the same fortnight: **"no message" ≠ "no event"** — both @Sober and @Porter held live work on
silence that a one-line check would have ended.

## A self-generated task chain has no natural end (2026-09-13, @Sober + @Porter — recovered from `PROJECT-STATUS.md`)

🔴 **Every task that closes with a Question which becomes the next task will run forever.** One such chain ran for
a day while a finished release sat undeployed. ⇒ **A self-generated chain is STOPPED deliberately, and the
remaining pile goes to the owner WITH SIZES so he picks** — the team does not pick for him by continuing.

- **Palm's items are hands-off (owner, 2026-09-29):**
  - Palm is the owner's friend, a human developer who maintains the front repo, outside the team chain.
  - Any item the owner says Palm does, the team SKIPS entirely: no build, no review, no test, unless the owner asks.
  - Palm's commits reach the front repo through the owner's git, so re-read current front-repo state before any FE task.

## A green FE suite is a statement about the REPO, not about one engineer's change (2026-09-29)
**Palm (outside the chain) commits to the front repo through the owner's git.** ⇒ **When the SA re-runs the FE suite to verify a report, the result covers whatever is in the repo at that moment — which may include work nobody on the team wrote.**
🔑 **So: re-read the front repo's state before cutting or reviewing an FE task**, and **when a count does not match an engineer's report, that is a question about the repo before it is a question about the engineer.**
📌 **The same care applies to the counts we pin** (suite totals, file counts): they can move without any of our tasks moving them.

## 🚫 No agent runs a git command that WRITES (2026-09-29, TASK-557)
**Git is the human's, alone.** ⚠️ **That is not only "never commit": never run `checkout`, `restore`, `stash`, `clean` or `reset` on a file either.** ✅ **Reading git state for analysis is fine; anything that CHANGES a file is not.**
📌 **An engineer discarded her own uncommitted edits with `git checkout <file>` while verifying a pin, self-reported it, and restored them.** 🔑 **The reason the rule is absolute is bigger than the lost work: the OWNER works in these repos, and an outside developer now commits to the front repo — a discard does not know whose uncommitted work it is destroying.**
✅ **The replacement, and it is the engineer's own: verify pins through the break-and-watch harness, which restores from memory. Never through git.**

## A break-and-watch table with only green rows is LESS trustworthy (2026-09-29, TASK-555)
**A mutation slipped: gutting a pin's own equality failed nothing — 🔑 a pin cannot pin itself.** ⚖️ **Ruled: no third holder.** *The only cheap one would assert that the assertion exists, which raises the count and not the confidence.* ✅ **The mitigation that counts: the EVENT is guarded twice, from two files and two tasks — the thing we care about is held, the guard's own text is not, and that is an acceptable floor.**
🔑 **The rule: a reported slip is EVIDENCE the table is real.** **An engineer who reports a green row where a mutation should have bitten is making the report worth more, not less** — and a table that is always all-green is the one to distrust.

## `user.type` does not drive Mantine's `NumberInput` under happy-dom (2026-09-29, TASK-559)
🔴 **A typing test can PASS while the handler is gutted:** the input shows the characters, **nothing is stored.** **Found by a mutation that emptied the handler and still went green.**
✅ **Use `fireEvent.change`, and ASSERT THE SAVE** — the request or the state, never only what is on screen.
🔑 **"A box that shows what you typed and forgets it is the same class of lie as a clipped one."**
⚠️ **Treat any existing DOM test that types into an input and asserts only the screen as SUSPECT until it asserts an outcome.**

## happy-dom has no layout engine — pixels are never proven here (2026-09-29, TASK-559)
**Width, clipping, overflow, focus rings and z-index cannot be answered by our DOM tests.** ✅ **What CAN be proven is that a control exists, is reachable, and that its value LANDS in the request.**
🔑 **A layout fix therefore always ends with a named human check** — the page, the device, the width, and the exact question. 📌 *Naming what the harness cannot do is worth more than another green test.*

## Assert the KEY SET of a request body, not a subset match (2026-09-29, TASK-564)
**`expect(body).toEqual({...})` passes a body that carries BOTH scope keys** — *the exact shape the server refuses with a 400.*
✅ **Assert `Object.keys(body).sort()` exactly.** 🔑 **A test that proves what is PRESENT cannot prove what is ABSENT**, and on these doors the absence is the contract: **exactly one scope key may ride.**
📌 **The same reasoning as the allow-list pins on public answers, and as `DROPPED_TOP` being deliberately empty: what must NOT be there needs its own assertion.**

## When a screen-only assertion is a false-green — the rule, not the list (2026-09-29, TASK-563)
🔑 **A screen-only assertion is a false-green EXACTLY when the control keeps its own display state.**
🔴 **Can lie:** `NumberInput` (proved by mutation, TASK-559) and, by construction, `PinInput` · `Autocomplete` · `TagsInput`.
✅ **Cannot lie:** a controlled native `Checkbox` · `Radio` · `TextInput` · `Textarea`.
📌 **Corollary: `checked` assertions on a controlled checkbox are state assertions wearing a DOM coat** — settled by construction, so they need no defence. 🔑 **Knowing which greens need no defence is worth as much as knowing which ones do.**
⚠️ **Undecided by construction, so break-it-and-watch is the only answer:** `Select` · `MultiSelect` · `DatePickerInput`. **No test asserts one screen-only today.**
✅ **Survey (whole tree, not just `*.dom.test.tsx`): 3 typing sites, ONE false-green, already fixed.** **One gap left: `shopfront-checkin`'s `toList` asserts an outcome but not the VALUE (XS).**

## Assert against a surface that CAN hold the value, at the boundary the other side reads (2026-09-29, TASK-566)
🔴 **`textContent` does not include ATTRIBUTES, and a placeholder is an attribute** ⇒ a "no `optional` anywhere on screen" check was **reading a surface that could never hold the string**, and was green for a reason unrelated to the truth. ✅ **Read `placeholder` / `aria-label` / `title`, and pin the words in a copy test too.**
🔴 **And assert at the boundary the OTHER SIDE reads:** asserting the argument handed to a client wrapper passed while **the wire carried an `address` key**, because the wrapper's literal always sets `address: undefined`. ✅ **Move the assertion to `fetch`.**
🔑 **Both are TASK-563's rule one layer over: an assertion against the wrong surface is a false-green.** 📌 **And name WHICH net catches a given claim — two greens that both "cover" something usually means neither was checked.**

## A "clicked" test that presses a DISABLED button proves nothing (2026-09-29, TASK-566)
**The click lands nowhere, so the absence the test asserts was guaranteed by the wrong thing.** 🔑 **Assert that no request went out AND that the guard behind the button refuses** — the two-guard rule from TASK-564, applied to the test rather than the code.

## The one deliberate exception to "a no-op is not a change" (2026-09-30, TASK-569)
**When the voucher first-booking re-count YIELDS to a person's recorded extension, it writes a RECORDED NO-OP** (from = to, actor NULL).
🔑 **Because "no record" was meaning two different things — "it skipped" and "it never ran" — and that exact ambiguity is what made D8 and TASK-553 expensive.** ⇒ **One rare row is cheap for keeping them apart.**
✅ **Declared as an exception in its own doc rather than widening the rule.** 📌 *A rule with a named exception stays usable; a rule quietly bent stops being a rule.*

## A rule whose reason has evaporated gets a NEW reason or goes (2026-09-30, TASK-569)
**NOT STARTED ⇒ 409 was justified by "the first booking would overwrite it". TASK-569 removed that.** ✅ **The rule STAYS, on a different reason: before the first booking the expiry is a sale-day placeholder, so a person's date FREEZES it and can end EARLIER than the normal count** — 🔑 **"an extension that shortens".** **The dead reason was replaced in the doc.**
🔑 **The discipline: when a rule's reason dies, do not delete the rule and do not keep it silently — find out whether it still has one.**

## A mutation run that prints NO SUMMARY is not a green (2026-09-30, TASK-571)
**A mutation removed the only focusable element from a modal; Mantine's `use-focus-trap` dumped a whole document, the run produced no summary at all, and the runner read that as a PASS.**
🔑 **No summary is not "nothing failed" — it is a run that did not happen.** ✅ **Break-and-watch must treat an absent summary as INCONCLUSIVE and say so**, and the pin must be re-placed until the mutation actually bites.
📌 **Related trap: a dead branch keeps its `t(...)` calls, so a copy-key pin still passes — only the block's OWN condition catches it.**

## `execSync`'s default 1 MB maxBuffer FAKES a pass (2026-09-30, TASK-574)
🔴 **A ~6.9 MB suite output against the 1 MB default kills the child mid-run, so NO summary line is ever printed — and a runner that looks for failures finds none.** ⇒ **Ten mutation rows reported green that had never run.**
✅ **Set it explicitly (256 MB), and TRUST THE COUNTS, not extracted failure names** — one row was labelled "slipped" while the counts plainly read `1 fail`. 🔑 **Counts are the truth; names are a convenience.**
📌 **Second cause, same rule as TASK-571's R6: the lesson is not about focus traps, it is about ABSENCE.** 🔑 **A run that prints no summary is not a green — it is a run that did not happen.**
⚠️ **This reaches BACKWARDS: any break-and-watch table produced while the suite output exceeded the limit is suspect.**

## A value shown in two places needs TWO pins (2026-09-30, TASK-574)
**Restoring a removed em-dash placeholder PASSED, because the CARD was pinned and the DIALOG'S HINT was not.** 🔑 **"The feature works" gets checked wherever the author happened to look.**
✅ **Pin at the source, and pin every surface that shows the value.**

## A faked verdict points EITHER way — a false BITE is as dangerous as a false pass (2026-09-30, TASK-575)
**@Fern's overflow made a killed run read as a PASS. @Jason's families B and C would read the same killed run as a BITE** — *proven on a real >1 MiB fixture: a run where every test passes is reported as BITES.*
🔑 **Both are false REASSURANCE: a fake bite says "the pin caught it" when nothing ran.** 📌 **The instinct that a red result is the safe kind is wrong here.**
✅ **BE numbers (measured, 2026-09-30): the passing suite prints 19,049 B; 1,282 B per failure; the limit needs ≈800 failures in one run; the worst recorded row is 46.** ⇒ **17× margin, so no historical BE table is suspect from overflow.** ⚠️ **An implausible historical failure count is the only trigger to re-run one row.**
✅ **The rule both runners now hold: the verdict comes ONLY from parsed counts — BITES / SURVIVED / NO RESULT [reason]; a timeout is not a bite; an absent summary is never a colour.**

## A comment does not have to be EDITED to become false — it only has to be MOVED (2026-09-30, TASK-572)
**Inserting a function BETWEEN a doc comment and the function it documented orphaned three comments across two repos' files** — **the worst had become a lie: *"There is no preview route"* sat directly above `previewCourseStart`.**
✅ **Self-caught and re-attached.** 🔑 **When you insert code, check what is directly ABOVE the insertion point**, and ⚠️ **a stale line gets re-pointed at the task that made it stale, not deleted.**
📌 **Corollary: a known-wrong comment inherited from HEAD is still fixed, declared. Leaving it because it was someone else's is how the next person inherits it.**

## A check written against a defect can CONTAIN the defect (2026-09-30, TASK-567)
🔴 **The sweep built to catch "asserts only the screen" ACCEPTED `expect(patches.length).toBeGreaterThan(0)`** ⇒ **the row the task existed for SURVIVED its first version.**
🔑 **"Something was sent" cannot tell a landed value from a lost one — that is the entire defect, and the check was blind to it.**
✅ **The rule now: the proof must reach INTO what the other side received** (`body` · `payload` · `args`), **and `document.body` is renamed away before matching — it is the screen wearing the boundary's word.**
📌 **Only mutating the CHECK finds this. Three survivors in one pass shared one cause: an assertion placed ADJACENT to its claim rather than on it.**

## A sweep that matches nothing is a green that means nothing (2026-09-30, TASK-567)
✅ **Say how many files a repo-wide check applies to TODAY, and PIN that in-scope list** — *so it cannot go quietly vacuous when the code moves.*
✅ **A file that does not qualify is OUT OF SCOPE WITH A REASON, never excused.**
⚠️ **And watch the direction of a fix: a sweep that starts INVENTING offenders is more dangerous than one that misses them** — 🔑 **a false alarm is how a check gets switched off.**

## A pin proves what the code DOES — it cannot tell you that what it does is useless (2026-09-30, TASK-577)
🔴 **A test asserting *"this door offers no rate box"* PASSED for weeks while every save it described returned 400 on sid.**
🔑 **The pin was faithful to the code, and the code was wrong.** ⇒ **A confident pin on a broken path is how a defect survives a green suite.**
✅ **So: when a customer reports a dead end, read the pins that cover it FIRST — one of them is probably describing the dead end approvingly.**

## A body WIDER than its type is how a required field goes missing (2026-09-30, TASK-577)
**`swapOtherSeriesTeacher`'s type named only `fromDate` while the door had been sending `onDate` since TASK-564.** 🔑 **The compiler cannot object to a field it was never told about** ⇒ **a required field can be absent with no compile error anywhere.**
✅ **Type the body exactly, and pin the KEY SET** (TASK-564) — *what must not be there needs its own assertion.*

## A fourth way a mutation run yields no counts: the RUNNER crashes (2026-09-30, TASK-577)
**Bun exited `0xC0000409` (then 9) with 122 bytes and no summary** — not a timeout, not an overflow, not a signal. ✅ **NO RESULT, never a colour, held unprompted.**
✅ **The verdict now NAMES THE EXIT STATUS:** *"NO SUMMARY" sends the reader looking for a missing print; "exited 0xC0000409" sends them to the crash.*
🔑 ***A rule whose only proof is a run that can crash is a rule with no proof on the days it crashes*** ⇒ **pin the rule as a UNIT where it lives, not only through the DOM run.**

## A mutation that does not COMPILE proves nothing (2026-09-30, TASK-580)
🔴 **A mutation that deleted an `if` and left a dangling `else` scored 82 pass / 2 fail — a BITE by the counts rule — while the file had merely failed to LOAD.** ✅ **Rewritten as a dead condition: 91/2, with the TESTS failing.**
🔑 **Counts are still the truth (TASK-575), but a non-compiling mutation is a VOID run inside that rule:** **a bite only counts when the tests fail, not when the file cannot load.**
✅ **Prefer a mutation that changes a VALUE or a CONDITION over one that deletes a line.**

## A guard whose DETECTOR is shallower than the body it guards lies about its coverage (2026-09-30, TASK-584/585)
🔴 **Two gaps found by DERIVING every rate writer** (every JSON body in all 100 routes, schemas walked at every depth ⇒ **14 writers, 12 with key 59**):
1. **`PATCH /other-series/:key/teacher` had NO rate guard at all** — the UI merely hid the field.
2. 🔴 **`PATCH /camp/weeks/:id/days/:date` CALLS the guard, but the detector reads TOP-LEVEL fields only, so `teachers[].rateMinor` passed without key 59.**
🔑 **The second is worse: a missing guard is visible, a shallow one is not — a reader sees the call and concludes the door is covered.**
✅ **Rules:** **an unenforced key is a key that lies** · **enforce first and relax by decision, never the reverse** · **derive the detector from the SCHEMAS, not from a list of known nestings** · **pin BOTH directions — the false-positive half is what gets a guard switched off.**
📌 **`PUT /teachers/:id/budget` has no key 59 BY DESIGN (key 57's hourly rate, pinned by TASK-434) — the right kind of exception: named, with its own key and its own pin, not an absence.**

## A pin that can be satisfied by a STYLESHEET is not a copy pin (2026-09-30, TASK-586)
🔴 **A check for *"nothing here says cancelled / hidden / off"* read `document.body.textContent`, which includes Mantine's INJECTED STYLESHEET — `.mantine-hidden-from-xs` matched "hidden".**
✅ **Assert copy against the DICTIONARIES (both languages), not against the rendered document.**
🔑 **Same family as TASK-567's `document.body` finding: the surface being asserted was not the surface that holds the claim.** 📌 **`document.body.textContent` carries class names, injected styles and anything else the framework writes — it is not "what the user reads".**

## A clicked test cannot tell "CANNOT" from "did not happen to" (2026-09-30, TASK-588)
🔴 **A mutation allowing `sessionIds` to ride on an advance leave SURVIVED — because with the chooser absent, the default set is empty and the field was omitted anyway.**
🔑 **The click proved the field was missing; the RULE is that it may not be sent.** ⇒ **Those are different claims, and only the second is the contract.**
✅ **Prove a "cannot" as a UNIT over several inputs** (a strict subset, an empty set, everything) — *the click proves the screen, the unit proves the rule.*

## A fixture that AGREES WITH ITSELF cannot tell two sources apart (2026-09-30, TASK-588)
🔴 **A mutation reading the wrong source SURVIVED because the server's answer and the page's own calendar both held the same booking at the same time.**
✅ **Make the two sources DISAGREE on purpose in the fixture** — then reading the wrong one is visible.
📌 **Also from that pass: a mutation that edits UNREACHABLE code proves nothing** — the same family as TASK-580's non-compiling mutation. **And a DOM mutant that HANGS is a NO RESULT: crash (TASK-577), overflow (TASK-575), hang (TASK-588) — three causes, one rule, and the answer each time is to pin the rule at the source.**

## Copy-review sections are numbered BY TASK (`§T-589`) (2026-09-30, TASK-589)
🔴 **Two engineers appending to the same copy file collided twice in one hour — two §17s and two §18s — because the next number is chosen by whoever writes last.**
⚖️ **Rule: number a section by its TASK id.** 🔑 **Collision-free by construction, needs no coordination, and self-documenting: any string traces to the task that made it.**
🚫 **Rejected: "one role owns the file" — it adds a hop and a queue through the SA.** 📌 **Same principle as the rest of this fortnight: remove the shared mutable thing rather than schedule access to it.**

## Do not re-sort what the server already ordered (2026-09-30, TASK-589)
**A `localeCompare` re-sort on the page put บี before เอ and DISAGREED with the order the server sent.**
🔑 ***"The server already answers date-then-coach; a second ordering here is a second opinion about a question that has an answer."*** ✅ **Filter and shape; assert the SERVER's order.**
📌 **Related: a hook a scoped session may not call is gated with `enabled`, never a caught 403** — *a catch would still have sent it, and the console would carry a refusal on every render.*

## Half a rule is not a rule (2026-09-30, TASK-591)
🔴 **Two mutations survived because the tests proved only one side:** one rule said *"never again"* and **no test ever added a SECOND child**; another proved a sentence **APPEARS** for a legacy family and never that it is **ABSENT** for a new one.
🔑 **A rule with two halves needs two assertions.** ✅ **Ask of every pin: what is the case where this must NOT happen, and is it written down?**

## Assert the IDENTITY of a refusal, not its wording (2026-09-30, TASK-591)
✅ **The refusal box carries `data-failure={code}`** ⇒ **a test names WHICH refusal it reads.** 🔑 **The wording is the owner's and will change; the code is ours and will not.**
📌 **Also: query a control BY POSITION when the label carries decoration** — Mantine puts the required asterisk inside the label, and two page strings began with "Province", so a label query matched prose as well as the control.

## An identity a test asserts must not depend on execution order (2026-09-30, TASK-592)
🔴 **`mock.module` is GLOBAL TO THE PROCESS**, so an identity WITHOUT a permission cannot live in a file that mocks the permission hook to grant everything.
✅ **Give that identity ITS OWN FILE.** 🚫 **Not a mutable mock** — 🔑 ***"a test whose identity depends on execution order is not a test of an identity."***
📌 **The same process-global fact the backend has a standing rule about (`mock.module`: none except a named exception), met from the front-end side.**

- **Tanya may create QA accounts on sid herself** (owner, 2026-10-01). She uses the sid super admin → Users, and may create QA users and roles, e.g. a no-rate admin, or a coach web account linked to a QA teacher record.
  - sid only, never uat.
  - Passwords go only in the git-ignored credential file named in `machine.local.md`.
  - Porter must not route "need a login" requests to the owner for sid.

## A defence can have a SHAPE-SHAPED HOLE (2026-10-01, TASK-593)
🔴 **Developer comments rendered as page text on a PARENT-facing form, and nothing caught it.** **The reason: the register pins STRIP COMMENTS before matching (`codeOf`)** ⇒ **a comment that had become TEXT was invisible to exactly the tests that read that file.** **The DOM tests read named things — a label, a box, a button — never the strip between two fields.** ✅ **`tsc` and the build are right to be silent: JSX text is valid JSX.**
🔑 **The very step that makes those pins robust is what blinded them to this class.** ⇒ **When something reaches a customer, ask what the guarding check DELIBERATELY IGNORES.**
📌 **Cause: TASK-591 MOVED two valid comments into JSX children.** 🔑 **A comment does not have to be edited to become false — it only has to be moved; here it did not become false, it became VISIBLE.**
✅ **Enforced by `jsx-text-comments.test.ts`, reading the PARSED TREE** — 🚫 **not a regex: a marker above a JSX element, in a string or in JSDoc is all correct, and *a check that fires on correct code is turned off within a week*.**

## A key may be STORED; a sentence may not (2026-10-01, TASK-593)
**A refusal's sentence was captured at answer time in one language, so it stayed English after the page switched to ไทย.** ✅ **Store the CODE and choose the language at RENDER.** 🔑 **Everything else on that page already went through `t(…)` — one captured sentence is a class, not a typo.**

## The `--tests` list is part of the mutation run (2026-10-01, TASK-593)
🔴 **A mutation scored a survival because the pin that would have caught it lived in a file the run never listed.** 🔑 ***"A mutation aimed at a file nobody runs is a green that means nothing."***
📌 **And its sibling: *a field verified BY EYE is not a field pinned — a nit fixed without a pin is a nit that comes back.***

## A SOURCE pin on a CALL SITE proves the call, not the answer (2026-10-01, TASK-594)
🔴 **Third instance this fortnight.** **A camp count was pooled across weeks sharing a date, and its pin only asserted that the call was made — so any derivation would have passed.** ✅ **Replaced by a VALUE test where the two candidate meanings DISAGREE (1 and 6, never 7/7).**
🔑 **Sibling rules already recorded: *a pin proves what the code DOES, not that what it does is useful* (TASK-577) and *a fixture that agrees with itself cannot tell two sources apart* (TASK-588).**
✅ **Ask of any source pin: could a wrong implementation satisfy it?**

## "Identical in TH and EN" PASSES a Thai-only string (2026-10-01, TASK-594)
🔴 **A check asserting a bilingual screen's two halves match is satisfied when BOTH are the same wrong language.** ✅ **Require BOTH SCRIPTS**, not equality.
📌 **The pattern it protects, derived and pinned: a §17c SCREEN is bilingual; everything else answers in the session's known language — and the 9 per-language keys are ALL refusals or the menu, pinned AS A LIST so a tenth cannot appear quietly.**

## Roles and the keys they hold are DATA, not code (2026-10-01, from Tanya's sid finding)
🔴 **sid's shared Teacher role had `menu:calendar` but NOT `action:calendar.teacher-leave`, so a coach on it could not record leave at all.**
✅ **The key exists and has since TASK-406** (*"the link is the identity, the key is the door"*) — **but NOTHING in the code grants a key to a role.** ⇒ **Which roles hold which keys is a row an admin edits, per box.**
🔑 **So: a feature gated by a key that NO ROLE HOLDS is a feature nobody has** — **and nothing tells us which keys are unreachable on a given box.** ⚠️ **With sixty keys, this recurs for every new one.**
✅ **Per box it must be CHECKED, never assumed** — it is a READ on the roles screen, not SQL. 📌 **Proposed next round: a small admin read, "keys held by no role".**

## A leave UNDO never tells the family — structurally (recorded 2026-10-01)
**Undoing a leave cancels the make-up and tells ONLY the coaches.** 🔑 **The owner's "never the family" is not a condition on that path — there is no family sender on it at all, and it is pinned both ways.**
📌 **So a missing family push after an undo is usually NO PUSH BEING DUE.** ✅ **Ask which act it was (an undo, or an admin cancelling a make-up) before asking for data** — *one question to the tester can dissolve a data request.*

## An assertion whose FAILURE MESSAGE cannot be read is an assertion that cannot report (2026-10-01, TASK-595)
🔴 **`expect(node).toBeNull()` makes the runner print the RECEIVED value, and a happy-dom element serializes its WHOLE document graph (~307 MB)** ⇒ **the run is killed and the verdict is NO RESULT, not a red.**
🔑 **And it is invisible until it matters: a PASSING run prints nothing, so the trap only appears on the day the assertion fails** — *exactly when the test is needed.*
✅ **Make every "not there" check read a COUNT (`1` vs `0`), or anything whose failure prints small.** ⚠️ **The question is what the failure PRINTS, not which matcher is used.**
📌 **Sixth NO RESULT of this stretch, and the FIRST whose cause was an ASSERTION rather than the tool** — overflow · hang · crash · crash · crash · unreadable-message.

## One dialog, two acts: a string that belongs to only one of them (2026-10-01, TASK-595)
**Three instances in one fortnight:** **TASK-547** (a body written for every leave, shown for leaves it did not describe) · **TASK-588** (a chooser written for a cancel, offered where nothing is cancelled) · **TASK-595** (a same-day warning shown on a future date).
🔑 **One shape, and it is NOT sweepable: *"does this sentence still mean the same thing on the other branch?"* needs judgement per dialog.**
✅ **But the SET is derivable — dialogs whose body or controls branch on a mode, a date or a type.** ⇒ **Derive the set, then review each.** 📌 **Queued as TASK-597; an audit whose output is a list, not a fix.**

## Prose does not execute — even FIRST-HAND prose (2026-10-01, TASK-596)
📌 **The strongest evidence we have produced for the standing rule.** **`line-admins.dom.test.tsx:77` already carried a note IN THE AUTHOR'S OWN HAND** describing the `toBeNull()`-on-a-DOM-node trap — *"turned one red assertion into an eight-minute run"* — **and 38 instances stood everywhere else.**
🔑 **A rule written down by the person who learned it, in the file where it hurt, still did not hold.** ⇒ **It is not about memory or care.**
📌 **Fourth time this fortnight a rule had to become a check: TASK-554 (event-in-updater) · TASK-567 (masked inputs) · TASK-593 (JSX text comments) · TASK-596 (unreadable failures).** ✅ **If a class of defect is worth a comment, it is worth a check that fails.**

## A guard with no FIXTURE is a guard nothing is asking about (2026-10-01, TASK-596)
🔴 **A check's escape hatch survived being deleted — because every real use went through a HELPER, so the escape was never what kept those assertions safe.** **The behaviour it protected had NO FIXTURE at all.**
✅ **Every branch of a check needs a case that EXERCISES it**, including the branches that exist to say "do not flag this". 🔑 **A check is as much about what it must NOT flag as about what it must** — *and the must-not half is the half that gets a check switched off.*

## The admin notice recipient is ONE box-level list — empty means a total blackout (2026-10-01)
**`notifyAdmins` and the role detection read exactly one thing: an `app_settings` row holding a LIST of LINE user ids.** **It is written by a person typing the admin code in LINE, and by the Remove button on the LINE-links page.** ⇒ **DATA, per box. No deploy creates it.**
✅ **An empty list writes ONE visible `SKIPPED — "no admin recipient configured"` outbox row** (TASK-152, added after this fault was found live on sid: *"zero outbox rows — no send and no trace that a send was due"*). 🔑 **The system is loud; what is missing is anyone reading the outbox.**
🔑 **Audience fragility differs: ADMIN is the only audience with a SINGLE box-level switch** (empty ⇒ nobody, ever). **Teacher and parent notices hang off each PERSON's own link** ⇒ **a per-person miss, visible per row, never box-wide.** 📌 **Keep the two apart: "nobody can ever receive this" is not "this person did not."**
⚠️ **Two instances of the same class in two days — a feature deployed, green, and reaching nobody because a per-box list is empty: the uat Teacher role's missing key, and this.** ⇒ **TASK-600 proposes the one read that answers it.**

## A pin written to preserve a FINDING must be retired by the fix that answers it (2026-10-01, TASK-601)
📌 **The author's own pin from TASK-594 recorded a defect as TODAY'S FACT — and still said so after the defect was fixed.**
🔑 **A finding-pin has a LIFETIME: it exists to stop a fact being lost before it is acted on, and the act that answers it must take it down.** ⚠️ **Otherwise the suite asserts the bug.**
🔴 **Scale of it here: the false sentence had been pinned FOUR times** (`customer-english` · screen 4a byte-for-byte · screen 4 assembled · the ✅ pin) ⇒ **not four mistakes, but ONE sentence that four people each took as the specification.** 🔑 **A pin is a statement of intent, and intent copied four times is very hard to dislodge.**
✅ **And when a customer sentence is RETIRED, assert that no key carries it** — *a retired sentence that simply disappears is indistinguishable from one we lost.*

## An APPROVED copy section is never renumbered (2026-10-01, TASK-601)
**Two `§19` blocks exist after the by-task numbering rule came in.** ✅ **The approved one was marked `§19b`, and nothing was renumbered.**
🔑 **The owner's approval references the NUMBER** ⇒ **renumbering an approved section silently detaches his decision from the thing he decided.** **A suffix is the honest minimal fix.** 📌 **The by-task rule (`§T-601`) stands for NEW sections; this is its legacy edge.**

## A bilingual assertion is satisfied by ONE language unless BOTH are counted (2026-10-01, TASK-602)
🔴 **Two instances, two engineers, one week:**
1. **TASK-594:** *"identical in TH and EN"* **PASSES a Thai-only string** — an equality between two languages holds when both are the same wrong language.
2. **TASK-602:** a marker pin used `toContain("✅ APPROVED (owner …, §12")`, **and the THAI line carries the same prefix** ⇒ **deleting the ENGLISH marker left the assertion satisfied BY THE OTHER LANGUAGE.**
🔑 ***"One source standing in for another is the bug the agreement pin exists to catch — and I had written it into the pin itself."***
✅ **COUNT both, or require both scripts.** 🚫 **Never `toContain` on a string two languages share.**

## `ANCHOR AMBIGUOUS ⇒ NOT RUN` is the runner being CORRECT (2026-10-01, TASK-602)
**A mutation whose anchor matched more than one line came back NOT RUN.** 🔑 **An ambiguous anchor is the runner refusing to guess which line was meant — and that is exactly what it should do.**
📌 **Seventh distinct non-verdict of this stretch, and the FIRST that is the tool being right rather than failing** (overflow · hang · crash · crash · crash · unreadable message · ambiguous anchor). 🔑 **NO RESULT must be reachable ON PURPOSE, not only by accident** — that is what makes it a verdict rather than an excuse.

- **FE baseline before Palm's merge (2026-10-02):** `smart-scheduler-front` branch `dong`, commit **6224445** ("Update language dictionaries and test cases…", 2026-10-01). This is the exact code Tanya verified on sid and that went to uat. Anything the owner merges from Palm lands on top of it, so `git diff 6224445..HEAD` is the whole of what came in.

## On the front repo, `tsc` and `build` are the inventory — the suite is NOT (2026-10-02, TASK-605)
🔴 **After a merge dropped one identifier, the test suite passed 921/0 on a tree that COULD NOT BUILD.** **The runner strips types, so a missing name is invisible to it.**
🔑 **So after any merge or restore: run `tsc` and `build`, and treat THEIR output as the inventory of what was dropped.** 🚫 **"Tests pass" is not an answer to "did the merge lose anything".**
✅ **A cheap second measurement that worked: count our own task markers in `src` at the baseline and after** (549 → 549), **and list the files that differ from the baseline** (nine, all in the other developer's area). ⇒ **Evidence that nothing else was lost, rather than a reassurance.**
📌 **Cause worth remembering: the same destructure had TWO independent additions, one per branch. A conflict resolved "with his side" keeps his and silently drops ours, while our TYPE and our USAGE both survive** — *so the only witness is the compiler.*

## A declared prop that is never READ is legal TypeScript — the feature is simply absent (2026-10-02, TASK-605)
🔑 **Only OPTIONAL props can be dropped in silence.** **A required prop left out at a call site is a type error, so the build shouts.** ⇒ **The risk set is the optional props, and it is DERIVABLE rather than searchable.**
🔴 **Worse than a dropped destructure: a prop the caller passes and the component never reads.** **Nothing fails, nothing is logged, the feature is just gone.** 📌 ***That is the shape of the Palm merge minus the one accident — the surviving usage — that made it loud.*** **Had the usage been dropped too, the build would have been clean and the feature missing.**
✅ **Enforced by `props-wired.test.ts`, reading the parsed tree** (a prop named in a comment is not wiring), **with `unwired-on-purpose` written IN the file — a decision, not a silence.**
⚖️ **It binds the other developer's files too, deliberately: it constrains nobody today, a "whose prop is whose" list would rot, the escape hatch is one visible line, and it protects HIS work from OUR merges as much as the reverse.**

## A dead control is worse than a missing marker (2026-10-02, TASK-605)
🔴 **`onSelectCamp` was wired at BOTH call sites and pinned at NEITHER** — the tests asserted what the grids DO with it, never that the page hands it over. ⇒ **Dropping it compiles, passes, and leaves a camp block that opens nothing.**
🔑 ***"The marker's absence hides a fact; the dead control invites a click and answers it with silence."***
✅ **Pin wiring with a COUNT of the call sites** — *so one surviving call site cannot cover for the other.*

## `REQ-BO-001…006` are TITLES, not documents (2026-10-02)
🔴 **No `REQ-BO-00x` file exists anywhere in this workspace and none ever has.** **What exists is `OWNER-LIST.md` §2: six one-line Thai titles with the owner's 08-23 sizing.**
⇒ 🔑 **"Are the REQ-BO files still accurate?" has no answer — there is nothing to be out of date. The gap is that there are no specs.**
✅ **The backoffice requirements that DO exist are on OUR numbering, and all three are from JULY:** **`REQ-002` admin auth — DELIVERED · `REQ-006` universal item model — DESIGN APPROVED, NOT BUILT · `REQ-014` revenue by activity + access control — READY_FOR_SA.** ⚠️ **Everything we shipped since (permission keys, per-session coach rates, camp money, the leave machinery) came after them** ⇒ **those three can be audited against today's system; the six titles cannot.**
📌 **The owner's own dependency reasoning is already recorded in `OWNER-LIST.md`:** **BO-002 last (a dashboard reads what the others create) · BO-004 after BO-003 (salary is computed from the ceiling) · BO-005 needs a stable frontoffice · BO-006 is REQ-009's twin and its reason enum and service path already exist.**
🔑 **So the first decision is not the ORDER — he has that right — it is WHO WRITES THE SIX REQUIREMENTS.** **Until one exists there is nothing to review, size honestly, or cut.** 🚫 **A size without a requirement is a guess with a number on it.**

## `UNDO_LEAVE_CHARGE_UNKNOWN` is a CLOSED, SHRINKING set — and a downstream symptom (2026-10-02, REQ-111 G)
**It fires only when ALL FOUR hold: no recorded charge (⇒ the leave predates migration 0058) · the row is COURSE-backed · not declared at creation · AND no LINKED make-up.**
🔑 **The last condition makes it far narrower than "every old leave": a course leave normally appends a make-up, and a LINKED make-up answers the question by itself.** ⇒ **Only a pre-0058 course leave whose make-up is UNLINKED can be "unknown".**
📌 **And we know why a make-up would be unlinked — it is the TASK-552/553 class** (the planner matching a leave against any pointing row; pause→resume and admin-insert answering a leave without recording which one). ⇒ **G is a DOWNSTREAM SYMPTOM, not a separate defect.**
✅ **The count needs NO new query: TASK-553's backfill DRY RUN already returns linked · ambiguous · n/a, and its "cannot tell" figure is the upper bound.**
✅ **The set is CLOSED AND SHRINKING — every leave since 0058 records the fact, so it can only affect old rows and never grows.** 🔑 **And the refusal is the SAFE behaviour: a guess would silently give a family a leave they already spent, or take one they still have.**

## Team split (2026-10-02): two SA teams, claimed file areas
**Team A — @Sober with @Jason (BE) and @Fern (FE). Team B — Silver with Bob and Fanta.** 🚫 **The two SAs never message each other: anything cross-team goes through @Porter, and shared findings go in this file.**
**@Sober's claim: the LEAVE & TEACHER machinery** — back `scheduler.service.ts`, `lib/leave-*`, the leave / teacher-leave paths in `line-webhook.service.ts` and their routes; front the booking detail, leave and teacher-change dialogs under `partials/Schedule/`.
⚠️ **Known boundary trap, found at once: the ECA teacher-change door is NOT under `partials/Schedule/`** — **it is `TeacherDialog`, mounted from `OtherSeriesModal` under `partials/OtherSeries/`.** ⇒ **Any ECA teacher-change work touches a file outside Team A's claim; STOP and ask @Porter rather than reaching.**

## The front claim's `partials/Schedule/` does not exist — the boundary runs THROUGH `Calendar/` (2026-10-02)
🔴 **Team A's front claim names "the booking detail, leave and teacher-change dialogs under `partials/Schedule/`". There is no such directory.**
**Where those things actually live:** **the booking detail AND the leave dialog ⇒ `partials/Calendar/Modal/BookingModal.tsx`** · **the teacher-change dialog ⇒ `partials/OtherSeries/`** (confirmed Team A's).
🔑 **So the boundary runs THROUGH `Calendar/`, not between directories** — **Team B owns `Calendar/CalendarContent.tsx` and `lib/scheduler/teacher-scope.ts` in the same batch.** ⇒ **That is the shape that produces an accidental reach, and a claim stated against a non-existent path cannot prevent one.**
📌 **And the first casualty: an admin's natural entry point for recording a teacher's leave is the blocked-day marker (`LeaveDayBanner`, `useLeaveDays`) — which is inside Team B's `CalendarContent.tsx`.** ⇒ **Any claim must be restated against REAL paths before front work starts.**

## "Primary teacher" is not a flag on a list of people — it is a DIFFERENT STORAGE LOCATION (2026-10-02)
🔑 **A session stores its PRIMARY teacher in `bookings.teacher_id` (rate: `bookings.teacher_rate_minor`) and every OTHER teacher as a row in `booking_teachers` (rate: that row's own `rate_minor`).**
⇒ **Any act phrased as "do X to a teacher on this session" has TWO implementations, chosen by which location that teacher occupies.** **A swap of the primary is an UPDATE of a column; a swap of a non-primary is a DELETE + INSERT on another table.** 📌 *That is why REQ-111 item E is S and not XS, and why it must not be written as one more branch inside the row loop.*
✅ **The READ side is already unified and should stay that way: `ratesOf` merges both into one teacher→rate map, `seriesRateOf` looks a teacher up in both, `teachersOfBooking` is the same shape.** 🔴 **The WRITE side is not unified, and the guarantee is weaker there: the slot index constrains `bookings.teacher_id` ONLY — a `booking_teachers` teacher is kept out of two places at once by an APPLICATION check that two racing requests can both pass.** ⇒ **Say so whenever that path is used; do not let a reader assume the database is holding it.**

## A "from here on" teacher swap moves the teacher and LEAVES THE RATE BEHIND (2026-10-02)
🔴 **The per-session (`onDate`) swap writes the incoming teacher's rate and refuses when it cannot find one. The from-this-date-on swap writes the teacher and does NOT touch `teacher_rate_minor`.** ⇒ **the new teacher is paid at the OLD teacher's stored rate, silently, on every row it moves.**
🔑 **The owner's ruling — "the cover is paid at the COVERING teacher's rate" — therefore holds for ONE session and NOT for the rest-of-series case.** ⚠️ **It is money, and it is wrong in one direction.** 📌 **Board row TASK-613.** *A scope option that changes WHICH rows are written can also change WHICH COLUMNS are written — check both before calling two scopes "the same act with a different range."*

## One human event, four notification kinds (2026-10-02)
⚠️ **"Who is teaching this session changed" enqueues `teacher_unassigned` + `teacher_assigned` down the SWAP path, and `other_teacher_added` / `other_teacher_removed` down the ADD/REMOVE path.**
⇒ 🔑 **Widening or re-routing one of those acts silently changes which words the coaches receive.** **Check the message kind whenever an act's path changes, not only its effect.** 📌 **Board row TASK-614; it is also one of the duplicates the REQ-111 notification inventory will surface.**

## A scoped read answers for the CALLER — it cannot stand in for a subject the caller chose (2026-10-02)
🔑 **`GET /calendar` returns only the caller's own sessions, by design.** ⇒ **A screen that lets an ADMIN act on ANOTHER person cannot reuse it to list that person's day: it will show the ADMIN's day under the other person's name.**
🔴 **That is not a cosmetic mismatch when the screen's next button CANCELS.** ⇒ **Either the act's own answer carries the list, or there is an explicitly scoped read.** 📌 **Why TASK-611's admin door is FUTURE-DATES-ONLY — the future branch needs no list.** *When a screen gains a SUBJECT, re-ask every read on it whose data it actually returns.*

## The calendar grids are pinned from OUTSIDE the calendar claim (2026-10-02, Fanta, TASK-622)
- `smart-scheduler-front/src/lib/rbac/action-gate.test.ts:98-99` pins exact source strings in both grids: `!canBook ? (` in `CalendarGrid.tsx` and `{canBook && mayBook && (` in `CalendarWeekGrid.tsx`. Pins on the grids also live in `lib/camp/grid.test.ts` and `lib/ui/props-wired.test.ts`. ⇒ **A team that owns the grids does not own every test that reads them.** Rewording a `+` gate goes red in a file outside the claim. TASK-622 kept those lines byte-identical (it folded leave into `canBook`) rather than edit the pin.

## 🔴 TWO routers resolve every request, and they pick OPPOSITE matches — a `:param` sibling SWALLOWS a literal route (2026-10-03)
🔑 **Hono dispatches to the FIRST matching route. `accessGuard` (`middleware/auth.ts`) computes its `ROUTE_ACCESS` key from `[...c.req.matchedRoutes].reverse().find(...)` — the LAST match.**
⇒ 🔴 **Registering `POST /teachers/:id/leave` AFTER `POST /teachers/me/leave` means the handler is still the `me` one, but the PERMISSION CHECK is the `:id` one.** **`POST /teachers/:id/leave` is correctly absent from `TEACHER_ALLOWED`, so a linked teacher is refused `403 SCOPE_TEACHER` on their OWN door and the handler is never reached.** **Caught by the suite on TASK-608; it would have revoked a feature live on uat for 21 linked coaches.**
🚫 **Re-ordering is NOT the fix** — it flips which handler Hono dispatches to, trading a guard bug for a handler bug.
✅ **The fix is not to create a wildcard sibling of a literal at all** — give the second door its own noun (e.g. the admin act under `teacher-leave-days`, where the admin's READ already lives).
📌 **And `TEACHER_ALLOWED` / `ROUTE_ACCESS` are keyed by the string the GUARD computes, never the string written in the router** ⇒ **a pin that reads the table proves nothing; it must go THROUGH the guard.**
⚠️ **`uuid-params` matches by pattern too, which is why the same shadowing turns a `403` identity refusal into a `400` shape refusal.** *When a refusal changes from "who you are" to "what you sent", the route resolution moved.*

## The DB-unreachable run is available in ANY `.env` state — it is never blocked (2026-10-03)
🔑 **The TASK-503 guard refuses the suite when `.env` names the customer's system. Pointing `DATABASE_URL` at an unreachable host AND blanking `LINE_OA_WRITE_ALLOW`, `LIFF_ID` and `LINE_LOGIN_CHANNEL_ID` satisfies the guard legitimately: the environment then genuinely is not the customer's, which is the guard's whole purpose.** ✅ **Empty `LINE_OA_WRITE_ALLOW` ⇒ nothing is writable (`oa-guard.ts`) — allow-list, not deny-list, doing its job.**
🚫 **Passing SID credentials on the command line WOULD be slipping past** — it makes the suite hit a real database while `.env` says another. **Pointing at NOTHING is the opposite act.**
⇒ **An engineer blocked by the env guard still owes the DB-unreachable run and every source-derived check.** 📌 *On TASK-608 that run alone produced 21 findings, one of them a live-feature regression, with `.env` untouched and the owner's uat session undisturbed.*

## A source-region pin ANCHORED ON A DECLARATION dies when the declaration changes shape (2026-10-03)
🔴 **`reportOwnLeave` became `export const reportOwnLeave = (...)` — a one-line delegation. A pin anchored on `export async function reportOwnLeave(` now THROWS `region start missing`, so every assertion after it in that file does not run.**
⇒ 🔑 **NO RESULT. Never a pass, and not a failure.** ⚠️ **Worse: it was the file guarding the SHIPPED teacher door, so the pins that would have independently caught the route shadowing were silenced by the same change that caused it.**
📌 **Anchor a region on something that survives a refactor into a delegation, and write IN the pin what it is anchored to and why that anchor is stable.** *A pin that cannot speak is worse than one that is red: red gets fixed.*

## Both teams' uncommitted work shares ONE back-repo working tree (2026-10-03)
⚠️ **Team A's and Team B's in-progress edits sit in the same checkout, so any suite run mixes them and neither engineer can get a clean verdict on their own change.** 📌 **On TASK-608 I had to check attribution before naming failures as Jason's — @Bob's TASK-607 edits were in the same tree. None of the 21 was his, but the check was necessary, not optional.**
⇒ 🔑 **Attribute a failure to a change before reporting it, by reading what the failure NAMES — not by who reported last.** **Any rule about the shared tree belongs to @Porter; recorded here so both SAs have it without messaging each other.**

## 🔴 A silent anchor can start LYING, not just stop speaking (2026-10-03, @Jason's finding — it supersedes the weaker rule)
**A source-region pin takes a START anchor and an END anchor. When the START goes missing the pin THROWS (`region start missing`) — loud, and the file stops. 🔴 When the END goes missing, `indexOf` returns `-1` and the slice runs to END OF FILE: the pin then still runs, still asserts, and FAILS FOR A REASON UNRELATED TO ITS CLAIM.**
⇒ 🔑 **A red that means nothing costs MORE than a green that means nothing, because somebody chases it.** 📌 **Found on `booking-undo-req108` while re-anchoring the four pins TASK-608 silenced.**
✅ **So: anchor a region on the ACT, give the pin a reason in its own text, and make a missing END as loud as a missing START.** *A check must fail only for the thing it claims.*

## ✅ The shadowing pin, and the one property that makes a sweep worth anything (2026-10-03)
**`admin-records-teacher-leave-task608.test.ts` derives every route path from the table, compares SEGMENT BY SEGMENT with `:param` matching anything (🚫 not a segment COUNT, which would wrongly flag `/teachers/:id/budget`), and asserts no wildcard route shadows a `/teachers/me/` literal.**
⭐ **And then it asserts THE CHECK CAN SEE THE DEFECT, using the path that actually shipped:** `expect(literals.some((l) => shadows("/teachers/:id/leave", l))).toBe(true)`.
⇒ 🔑 **Every repo-wide sweep owes that second assertion.** *A sweep that matches nothing is a green that means nothing; a sweep that cannot be shown to match a KNOWN defect is the same thing with extra confidence.*
📌 **It guards the `/teachers/me/` literals only. The CLASS — no `ROUTE_ACCESS` pattern may shadow any other — is `TASK-615`, and this `shadows` function is its template.**
⚠️ **Prove route permissions THROUGH THE ROOT APP. Reading `TEACHER_ALLOWED` is belt-and-braces; the guard computes its own key, so only a request through the guard proves anything.**

## ⚠️ `core.autocrlf=true` here: a pin fails only when its EXPECTED LITERAL spans a newline (2026-10-03)
**Files on disk are CRLF; `HEAD` is LF. A naked `readFileSync` in a test is therefore CRLF text.**
🔑 **That is harmless until an expectation's own literal CONTAINS `\n` — then `toContain` cannot match, although the text is present and identical.** ✅ **43 test files in the back repo already normalise with `.replace(/\r\n/g, "\n")`: the convention exists and is the norm.**
🚫 **So the rule is NOT "any test comparing raw bytes fails here"** — that is too wide and sends people hunting. ⇒ **The rule is: when a source-reading pin's expected string spans a line break, normalise the file first.** 📌 **One such file was missed (`teacher-schedule-req109.test.ts`, TASK-486) and is red for this reason alone, independent of any batch.** 🚫 **Never "fix" it with a `.gitattributes` change — that rewrites working copies repo-wide to solve one assertion.**

## An ENTRY whose classification is right and whose REASON is absent (2026-10-03)
**In `course-ended-writes.test.ts` the coach's leave DELETE carries its reason (*"lifts a leave-day row only; no booking is touched"*); the POST beside it carries none — yet the POST's today/past branch DOES cancel bookings, so its `"unrelated"` is true for a reason that is written nowhere.**
⇒ 🔑 **A classification without its reason is one refactor away from being wrong AND unchallenged** — the next reader has nothing to test the entry against. 📌 **Also the answer to "does a new caller need a new ruling?": when the ACT is unchanged and only the CALLER is new, the new door INHERITS the existing classification and there is nothing to rule on.** *Withdraw a question that has dissolved rather than spend the owner's attention on it.*

## 🔴 The mutation RUNNER is in the repo; the mutation SETS are not — the same failure, one level up (2026-10-03)
**TASK-576 put the runner in the repo on the stated reason that *a tool kept in a session scratchpad is a tool we silently stop having, and its absence looks exactly like nobody having run it.*** 🔴 **The `mutations.json` sets were left in the scratchpad.** ⇒ **"9/9 bite", "10/10 bite" cannot be re-run by the SA, by the engineer next month, or on another machine. Those numbers were being accepted on trust.**
▶️ **Rule: the mutation SET is a file in the repo beside the test it proves, and every report NAMES the test set it was run against.** ✅ **A named SUBSET is correct and expected — the runner refuses a dirty baseline (rule 4), so a repo with one known-red test can only be mutated against a subset.** 🚫 **But a subset nobody can see is a number, not evidence.**
🔑 **Generalise it: when a tool is preserved because its absence is invisible, its OUTPUT is invisible in exactly the same way.** *Preserve the evidence on the same reasoning that preserved the tool.*

## The suite needs NO database — so the two runs prove opposite things and neither substitutes (2026-10-03)
**`3748 of 3749` tests pass with `DATABASE_URL` pointed at an unreachable host, there are no `skipIf`s anywhere in the suite, and no skip count is printed.** ⇒ 🔑 **a run against a reachable database cannot exercise MORE than the unreachable run already did.**
⚠️ **It is still not redundant, and this is the ONLY thing it can tell us: it can reveal a test that passes BECAUSE the database is absent** — one asserting a fallback that would fail once a connection succeeds. ⇒ **both runs are owed; neither replaces the other.**
🔴 **And the live run carries a risk the unreachable one cannot: KHWAN TESTS ON SID.** **If any test opens a real connection and writes, we write into the environment the customer is using.** **The evidence says the suite never connects; "the evidence says" is not "we established".** ⇒ **the live run is scheduled by @Porter in a window, never taken by an engineer or an SA on their own judgement.**
📌 **Driving a new door END TO END against a real database is a QA exercise (Tanya, through @Porter) — it is NOT a suite run, and calling it "the live-DB layer" hid that for two days.**

## Free pre-start absences and charged leaves are TWO independent ceilings of the same size (2026-10-03)
**TASK-609: `leaveUsed` is never incremented for a declared day (both write sites are guarded by the charge), and the pre-start cap counts only declared rows.** ⇒ **a course may declare up to its quota in FREE days before it starts AND still take its full quota of charged leaves afterwards — up to TWICE the quota in total absences.**
⚠️ **Not only across the boundary: `courseNotStarted` is satisfied by a course that already carries a FUTURE CHARGED leave, so an unstarted course can hold charged leaves and then declare its full free set.** **The two counts never see each other.**
✅ **It is the better reading and it stands** — 🔑 **a shared pool would make a declared day DEFERRED, not free, contradicting the owner's own word.** 📌 **But the owner said "capped at the quota the customer bought", SINGULAR, so the CONSEQUENCE was sent to him as a statement, not a question.** *When an implementation is right and its consequence is bigger than the words that authorised it, report the number — do not re-open the decision.*
⚠️ **Open leak, to be ruled deliberately: `declared` counts rows whose status is `SICK_LEAVE`, so a declared day later CANCELLED stops counting and the cap can be reset by cancelling and re-declaring.**

## Read the line WITH the comment above it (2026-10-03 — my own error, twice in a week)
🔴 **I reported a classification entry as missing its reason. The reason was in the comment immediately above the entry.** 🔴 **And a day earlier I read a census going red and asserted WHICH name caused it instead of checking.**
🔑 **Same shape both times: a line read without its context, reported as a gap.** ⇒ **Before reporting an absence in source, read the surrounding block — and prefer "I could not find X; where is it?" to "X is missing."** 📌 *An absence is the easiest thing to be confidently wrong about, and it is the claim engineers can most cheaply disprove.*

## ⚠️ TWO SAs allocate TASK numbers from ONE board and may not message each other (2026-10-03)
🔴 **@Bob and @Sober both took `TASK-623`: the board's highest was 622 when it was read, and 623–628 existed by the time four tasks were written.** ✅ **Resolved by Team A renumbering its own (item E's back half ⇒ `TASK-629`); 🚫 nothing of Team B's touched.**
🔑 **Reading the board's maximum is not an allocation — it is a read, and two readers get the same answer.** ⇒ **Ask @Porter for number BLOCKS per team (e.g. A 630–659, B 660–689), so neither SA has to read the board to pick a number.**
📌 **And the board is the record; an inbox note is only a notification. When the two disagree, the board wins.**
⚠️ **Second-order gain: reading the colliding row revealed that Team B's `TASK-623` is BLOCKED on "Team A's FINAL owner-approved copy"** ⇒ **part of the other team's idle time was waiting on OUR COPY, not our code, and the copy could go to the owner ahead of the batch.** 🔑 *A collision is also a reason to read the other team's rows, which the no-contact rule otherwise discourages.*

## The Daily report's numbers come mostly from `/calendar`, and camp counts as COACH-HOURS (Silver, 2026-10-04, read in code)
- **Where the figures come from:**
  - Front `getDailyReport` calls **both** `/reports/daily` and `/calendar` (front `src/services/scheduler.service.ts:1055-1061`).
  - `enrichDailyReport` (`:1016-1053`) computes Total booked, Attended, Confirmed, Pending and the type/teacher rows **from the calendar bookings.** Only On leave and Cancelled come from the backend report.
  - ⇒ Reading back `getDailyReport` alone explains almost nothing on the screen.
- **How camp is counted:**
  - A camp block writes one `bookings` row **per coach per hour** (type `OTHER`, kind CAMP, CONFIRMED; back `camp.service.ts:280`).
  - **The end-of-day auto-attend marks them ATTENDED** (`jobs.service.ts:83-88`), with no camp exclusion.
  - The children's attendance is in `camp_days`, which the report does not read.
  - ⇒ **Attended includes camp coach-hours, not camp children.** That is Khwan's 17 vs 19 (2026-09-28): 9 private lessons + 8 coach-hours, against her 10 + 9.
- **The type rows cover 4 of 6 types** (OTHER and GROUP have none), and **Total booked counts every status except CANCELLED.**

## The parent's leave and check-in windows are two doors with DIFFERENT acts (Silver, 2026-10-04, read in code)
- **Both windows are CONFIRMED-only:** `findTodayBookingsForParent` and `findUpcomingBookingsForParent` (`checkin.service.ts:154-180`).
- **Check-in:** the act **also** refuses anything not CONFIRMED (`checkinByToken`, `checkin.service.ts:108-110`), so its window already equals its act.
- **Leave:** the act, the `sick-leave` branch of `updateBookingStatus` (`scheduler.service.ts:3983-3998`), has **no status allow-list.** Only the cut-off guards it, so it would take leave on a CANCELLED or NO_SHOW row.
- ⇒ **"Window = act" fixes leave and does nothing for check-in.** Showing unconfirmed classes at check-in is a change to the act itself.

## A digit anywhere in a student search adds a phone match (Silver, 2026-10-04, F5)
- `studentSearchConditionsOn` (`parent.service.ts:642-650`) adds `phone ILIKE '%<digits>%'` whenever the query holds **any** digit.
- So `Ari3y` matches every parent whose phone contains a 3.
- Shared by bookings, students, courses, vouchers and the eligibility picker.

- **Where testing happens — owner's ruling, 2026-10-04. This settles it; do not re-open it.**
  - 🚫 **No local stack, and nobody proposes one again.** The owner's reason: it becomes a SECOND migration target to keep in step, and that costs more than it saves.
  - 🚫 **Engineers do NOT test against `sid`.** An engineer's runs are the ones that need no reachable database. **Anything that needs a live database is NOT the engineer's to run** — it leaves their definition of done.
  - ✅ **That verification belongs to QA.** **Tanya is a SENIOR TESTER, not a clicker: her remit is the FULL test** — **every API route**, **the web screens**, **the phone**, and **LINE OA** — on `sid`.
  - ✅ **Nobody needs a window on `sid` and nobody asks the owner for one.** Khwan uses `sid` to help US; the three of them do not have to tiptoe around each other.
  - ⇒ **An SA must not hold a batch waiting for an engineer's live-DB run.** The equivalent proof is QA's, after the deploy.

## ✅ The mutation sets are FILED, and the rule is now verifiable by anyone (2026-10-04 — closing TASK-627)
**`src/lib/admin-records-teacher-leave-task608.mutations.json` (H1–H9) and `src/lib/pre-start-declared-absence-task609.mutations.json` (F1–F11).** **Each set carries its OWN test list; the runner accepts `{ tests, mutations }` as well as a bare array, `--tests` still wins when given, and a set with NO list anywhere is REFUSED rather than guessed at** — *a guessed test set produces a verdict about something nobody chose.*
✅ **Re-run by @Sober, not the author: `F1…F11` all BITE (baseline 113) and `H1…H9` all BITE (baseline 108), restores byte-identical, CHECKSUM identical, no NO RESULT.** 🔑 **Yesterday those numbers were trust; today they are a command anyone can type.**
⭐ **`H7` is the near-miss made permanent: it puts the admin door back on `/teachers/:id/leave`, the wildcard sibling that revoked the coach's own door — and it bites.** 🔑 *That is what a near miss should become: a failure you can summon on demand.*
✅ **THE VERDICT RULE in `scripts/mutation/README.md` is byte-for-byte intact** — the input was widened, the JUDGEMENT untouched. 🔑 **Check that distinction whenever a runner is changed.**
⭐ **And the retired README bullet survives only as a QUOTE inside the correction that supersedes it.** 🔑 **A deleted rule looks like it was never there; a quoted one tells the next reader what we used to believe and why we stopped.**

## 🔴 A FILED mutation set can rot the same way a pin can — so the sets have their own check (2026-10-04)
**`src/lib/mutation-sets-task627.test.ts` checks EVERY filed set: each `from` anchor resolves in the source EXACTLY ONCE (🚫 not zero, 🚫 not twice), every named test file exists, the set names the test it proves, and no mutation is a no-op.** 🚫 **It does not re-run mutations — it proves the recorded verdicts are still RE-RUNNABLE, which is the whole point of filing them.**
🔑 **Filing the evidence only HALF-fixes it: a set whose anchor no longer matches is a silent lie — the same class as a lost region END, which did not stop speaking but started lying.** ⇒ **"Exactly once" is the load-bearing half; `>= 1` would pass on an anchor that now matches two places and mutates the wrong one.**
📌 **It earned its place on day one: `TASK-609` §3 rotted F10's anchor the same day it was written.** *A meta-check that catches a defect on its first day is load-bearing, not scaffolding.*

## The cap counts DECLARATIONS MADE, not declarations standing — and the flag must not be cleared (2026-10-04)
**TASK-609 §3: the pre-start cap counts `plannedAtCreation` ALONE; the `status === "SICK_LEAVE"` term is gone.** 🔑 **A limit that cancel-and-re-declare can reset is decorative.**
⚠️ **Known, pinned cost: a declaration TAKEN BACK still consumes one of the cap.** 🔴 **It must NOT be "fixed" by clearing `plannedAtCreation` on the Undo:** **`leaveChargeOf` returns `"free"` off that flag BEFORE it falls through to the make-up test, so clearing it makes an already-refunded row answer `"charged"` (make-up linked) or `"unknown"` (not)** ⇒ **it would RE-OPEN `UNDO_LEAVE_CHARGE_UNKNOWN` — a set recorded as closed and shrinking — on rows we have already acted on.**
▶️ **If a withdrawn declaration should return to the pool, the design is a SEPARATE "withdrawn" marker, never clearing the flag (`TASK-630`).** 📌 **Recorded so nobody re-derives it under time pressure.** 🔑 *A flag that answers a question about the PAST cannot be reused to change a count about the PRESENT.*

## 🔴 OWNER RULING 2026-10-04 — **engineers do NOT verify against `sid`. Live-database verification is QA's. This SUPERSEDES the entry above it.**
**The owner's ruling, in substance:**
- 🚫 **No local stack.** **It becomes a second migration target to keep in step, and he will not pay that cost.**
- 🚫 **Engineers do not test against `sid`.** ✅ **That verification is QA's.**
- ✅ **@Tanya is a SENIOR TESTER and her remit is the FULL test: every API route, the web screens, the phone, and the LINE OA.** ⇒ **a QA hand-off must lead with the API ROUTES, not only the screens.**
- ✅ **Nobody needs a WINDOW on `sid`.** **Khwan is using it to help us; the three of them need not tiptoe around each other.**

🔴 **SUPERSEDED, and quoted so the next reader knows what we used to believe:** the entry above once said the live run was *"scheduled by @Porter in a window, never taken by an engineer or an SA on their own judgement"*. **The window part is now FALSE.** ✅ **What survives from it: the suite needs NO database — 3763 of 3763 pass with it pointed at nothing, there are no `skipIf`s and no skip count** ⇒ 🔑 **the no-DB run is now the ONLY suite run there is, not a second opinion on a live one.**
📌 **@Porter withdrew his own window request in his own words: "that was me carrying a constraint the owner does not have."** 🔑 *A constraint nobody imposed is the most expensive kind, because nobody is there to lift it.*

### ⇒ The engineer's standing verification set, final — THREE things
1. **`tsc --noEmit` clean.** 2. **The suite with the database pointed at nothing — counts, never a colour.** 3. **The mutation set, FILED beside its test and naming its test list** (the runner already points the database at nothing by design).
✅ **A task is CLOSED on that proof.** 🚫 **Nothing is "owed" for want of a reachable database.** ⚠️ **What only a real database, a real screen or a real phone can answer goes to QA as a written line — including the thing the live suite would have caught: a test that passes BECAUSE the database is absent.**
🔴 **And a naming lesson, mine:** **I called a QA exercise "the live-DB layer" for two days, which made it look like an engineering debt the BE owed.** ⇒ 🔑 **Name a gap by WHO CAN CLOSE IT, not by the resource it lacks** — *"the live-DB layer" sounds like something an engineer can get; "QA's live verification" names the person.*

## A promise inside a refusal is the easiest copy to write and never check (2026-10-04)
🔴 **`DECLARED_ABSENCE_CAP`'s message ends *"…หรือปลดล็อกโดยแอดมิน"* — but there is NO unlock on that path.** **`adminUnlocked` gates the POST-start `leaveLocked` rule; the pre-start cap does not consult it, and the code is right not to.** ⇒ **the refusal offers a remedy that does not exist.**
🔑 **How it surfaced: writing down what the RIGHT ANSWER LOOKS LIKE, case by case, for a QA hand-off.** ⇒ **A refusal's REMEDY CLAUSE is a factual claim about the system and must be checked like any other** — *the error path is where copy goes unread, and a remedy is the one part a user will actually try.*
📌 **Whenever a refusal tells someone what to DO, verify that the thing can be done, by them, on that path.**

## 🔴 A write assertion that does not read the WHERE is an assertion about the VERB (2026-10-04 — @Jason's, from a mutation that SURVIVED)
**`E5` broke the scoping of a DELETE so that EVERY extra teacher on the row was removed, not just the outgoing one — and the first version of the check SURVIVED it**, because the harness recorded **that a delete happened** and nothing about **who it named.**
⇒ 🔑 **Assert the bound parameters of the condition, not the fact that the statement ran.** ✅ **The fix also pins a BYSTANDER as untouched** — *the only way to prove a write was scoped is to name something it must not have reached.*
📌 **Same family: a refusal test in the same file PASSED ON THE WRONG REFUSAL — `RATE_REQUIRED` is also a `400` and was thrown earlier.** ⇒ **assert the SENTENCE, not the status code.** 🔑 **A code is not a sentence, and two refusals sharing a code share nothing else.**

## 🔴 A rule that says "ask X" is wrong when X's return type cannot carry the answer (2026-10-04 — @Sober's error, @Jason overruled it correctly)
**I instructed that `teachersOfBooking` was "the only thing that may answer" whether a teacher is the primary or an extra. It cannot: it returns ids and FLATTENS the primary and the extras into one list — the very distinction TASK-629 exists for.**
🔑 **Two questions were collapsed into one:**
- **"WHO is on this session?"** ⇒ `teachersOfBooking`, and it must remain the only answer to that.
- **"WHERE does this teacher live on it?"** ⇒ **its own answer (`locationOf`), in one place**, because the first question's answer deliberately destroys that information.
⇒ **Before naming the single source of truth for a question, check that its RETURN TYPE can express the answer.** 📌 *An engineer who pushes back with the reason rather than complying is doing the job; a "one source of truth" rule that cannot carry the distinction produces two sources under one name.*
⚠️ **And the case that proves it is `E3`: a series where the same coach is PRIMARY on one date and an EXTRA on another.** **Deciding per row would write BOTH changes.** 🔑 **"Decide it once" was asked for tidiness; the real reason is that deciding twice is WRONG.**

## Widening a shipped response to say what the caller already knows is a contract change smuggled in beside a feature (2026-10-04 — @Jason's)
**He added `swapped: "primary" | "extra"` to the swap's answer and took it back out:** **two shipped pins assert that object exactly, and the front end already knows the answer — it sent that teacher as `from`.**
⇒ 🔑 **A new field in an existing response is a decision, not a side effect.** **If a caller wants it, that is asked for and ruled on.**

## Naming a thing inside a refusal: use the ONE name rule, and check it EXISTS before concluding it does not (2026-10-04)
**`booking-undo.ts` already names a session in a refusal with `displayNameOf(holder) || "คาบอื่น"`, and the code calls it *"the ONE name rule"*.** ⇒ **`{course}` in the `§T-G` reword renders as `displayNameOf(row)`, same fallback.** 🚫 **No new course label.**
🔑 **Why not programme-and-size: it does not DISTINGUISH** — two children on the same programme and size produce the same string, so a list of refusals says nothing. **What identifies a course to the reader is WHOSE it is.**
⚠️ **And the honest limit, stated to the owner rather than hidden: a course in this system HAS NO NAME.** **The approved sentence says it names the course; the closest TRUE thing we can print is whose course it is.**
📌 **The EN half does NOT ship — decided from the file: every refusal in `booking-undo.ts` is Thai only and the block's own comment says they are written "in the admin's language (the codebase's Thai)".** 🔑 *An engineer who stops rather than invent a convention is right; finding the convention that already exists is the SA's job, not his.*

## 🔴 A pin can PASS FOR A DIFFERENT REASON than it was written for, and nothing reports it (2026-10-04 — @Jason's, the third distinct "green that means nothing")
**Two pins in `other-series-req101`:**
1. **The from-here-on swap pin ASSERTED THE DEFECT** — `{ teacherId: T3 }` with no rate. 🔑 **A pin written while the behaviour was wrong records the wrongness as the contract.**
2. 🔴 **Its neighbour, `from: T2 ⇒ 400`, had been passing for a DIFFERENT REASON than it was written for ever since TASK-629 shipped:** **T2 is a legitimate extra-teacher swap now, and the `400` it was meeting was `RATE_REQUIRED`, not the refusal the pin was about.** ⇒ **green, meaningless, invisible for a day, and only the NEXT change exposed it.**
▶️ **RULE (@Jason's words): every pin you widen past must be re-read for WHAT IT IS NOW PROVING, not only for whether it is green.**
🔑 **This is the third distinct green-that-means-nothing we have found, and the FIRST that needed no tooling to catch — only the discipline of re-reading.** 📌 **Companion rule, same day: a code is not a sentence — two refusals sharing a `400` share nothing else, so assert the SENTENCE.**

## The fix is FEWER rules, not one more — a rule resolved in TWO PLACES is one edit from being two rules (2026-10-04)
**TASK-625 did not add a rate resolution; it REMOVED one.** **TASK-629 had left the extra path resolving its own rate beside the per-session one, and that asymmetry was the same defect in miniature.** ✅ **`seriesRateOf(` and `RATE_REQUIRED(` now appear exactly once each in the act, proven as an ABSENCE.**
📌 **@Sober's miss, recorded: reviewing TASK-629 he checked that no second RATE RULE existed and missed that a second RESOLUTION SITE did.** 🔑 **Checking for a duplicate RULE is not checking for a duplicate CALL** — *ask for the count of call sites, not the count of rules.*

## 🔴 A candidate list for a defect that is OPEN ON ANOTHER PATH is a MISLEADING report, not an incomplete one (2026-10-04)
**TASK-625 closed the rate defect on the OTHER-series swap and produced a read-only candidate list for the owner.** **@Jason then found the SAME defect live on `swapGroupTeacher` (the GROUP path), which TASK-625 does not touch.**
🔑 **Handing the owner that list while the second path still writes new rows says *"here is what a CLOSED problem cost"* when the truth is *"here is part of what an OPEN problem is still costing."*** ⇒ **We would have built the misreading ourselves.**
▶️ **So: close every path of a defect BEFORE its numbers go up, or send the numbers with a warning that halves their value.** ⭐ **Closing was cheaper than caveating** (`TASK-632`, cut the same day, onto the last day of the gate). 📌 *Adding work to your own gate beats shipping a report that misleads.*

## A read-only count for the owner is a CEILING and a CANDIDATE LIST, never a count (2026-10-04)
**The only durable trace of a teacher change is `notification_outbox` (the swap's own pair carries the `booking_id`, nothing prunes that table, and on a row with `other_series_key` the series swap is its only writer).**
**The query returns every series row a swap ever touched, each flagged twice: is this rate one the CURRENT coach is paid elsewhere in the series · is it one SOMEBODY ELSE is paid.** **`own=0,other=1` strongest · `own=1` almost certainly fine · both-0 unknowable · both-1 the defect cost nothing even if it happened.**
🚫 **What it cannot tell anyone, and all of it goes IN FRONT of the owner rather than buried:** **intent is not recorded — a deliberate price and the defect are byte-identical** · **only the LAST coach is known, so a twice-swapped row hides the rate's real owner** · **a per-session swap leaves the SAME trace and was always correct, so the list includes rows never at risk** · **a series where everyone is paid the same hides it, harmlessly.**
🔑 **"We cannot tell from the data" is a real answer the owner can act on; a guess he mistakes for a count is not.** 🚫 **Nobody runs it — not the engineer, not the SA.**

## A RELOCATED mutation keeps its id, and BOTH files say where it went (2026-10-04)
**`E7`/`E8` moved from TASK-629's set into TASK-625's, because the rule they attacked (the extra path's own rate resolution) no longer exists as a separate thing** — **and a mutation filed against a rule that is gone cannot bite for its stated reason.**
✅ **Correct move. ▶️ But the old TASK report still says "14", so the id must not change and both files must carry the note.** 🔑 **The filed set is the record; a TASK report is a snapshot of the day it was written.**
⭐ **And the set-integrity check earned its keep a second time: `R7`'s anchor matched TWICE in `validation.ts` (`.refine(oneScope, ONE_SCOPE);` is also another body's last line) before the set was ever run.** 🔑 **"Exactly once" catching a real second match twice in one week is the whole argument for it.**

- **Leave quota by course size (verified in code 2026-10-04, `lib/leave.ts`):** `LEAVE_QUOTA_BY_SIZE` — **4 sessions ⇒ 1 leave · 6 ⇒ 2 · 10 ⇒ 3**. **`maxWeek = size + quota`** (4+1=5 · 6+2=8 · 10+3=13). An off-card imported course carries its own stored quota, and the stored one wins. 📌 **Recorded because Porter put an invented "10 ⇒ 2" into a draft to the customer and the owner caught it. Never state a product number to a customer without reading it.**

## 🔴 A green suite after a behaviour CHANGE means either nothing cared, or nothing was WATCHING (2026-10-04 — @Jason's, the fourth green-that-means-nothing)
**TASK-632 changed what the group swap writes, and NOTHING in the suite broke. The finding was not the fix — it was that no existing test pinned the group swap's rate at all: the wrong write was simply UNOBSERVED.** 🔑 **That is how it stayed wrong while its twin on the other path was found by reading.**
▶️ **OBLIGATION: when a change you expected to break something breaks nothing, find out WHICH of the two it was BEFORE you report the green.** 📌 **Fourth distinct green-that-means-nothing this week, and the first where the right question was asked before anyone was misled.**

## 🔴 A refusal with NO ANSWER is not an improvement — check the route-around EXISTS before accepting a refusal (2026-10-04)
**TASK-632 correctly refused a group swap it could not price, pricing the incoming coach from `seriesRateOf` over the whole group key.** 🔴 **But there is NO per-coach standard rate anywhere in this system** — **`freelance_budgets.rate_minor` is the freelance CEILING's drawdown, not a coaching rate, and nothing reads it here.**
⇒ **A coach NEW to that series can never be priced, and "new to this series" is exactly what a COVER IS.** ⇒ 🔴 **the fix traded a silent money defect for a HARD BLOCK on the ordinary operation: before it the swap worked and paid wrongly; after it the admin has nothing to type.**
🔑 **"Paying the wrong coach silently is worse than a refusal an admin must route around" is right about the refusal and wrong when there IS no route around.** ⇒ **Before accepting a refusal as the safe answer, name the route-around and verify it exists.** ✅ **`TASK-634`: the door accepts an optional rate, exactly as the other path already does, and `TASK-632` does not ship without it.**

## A column that IS read cannot be dismissed as safe — make the ABSENCE the pinned answer instead (2026-10-04)
**Asked to prove a seat's `teacher_rate_minor` was unread and therefore safe, @Jason found it IS read (`rateFacts` is non-null only for a `COURSE_PACKAGE` row, and `toBookingDTO` puts it on every DTO) — and refused the easy answer.**
⇒ ▶️ **The seat write deliberately carries NO rate, the reason is at the line, and the absence is pinned by value (every seat write is exactly `{ teacherId }`).** 🔑 **A group swap must not answer a product question as a side effect** — whether changing a coach should clear a CHILD's course override is `TASK-633`, and one answer must cover the plan edit, the Move popup and the seat together.
📌 **The rate LOOKUP must span the whole key, not the slice being moved** — *a coach paid on a past date of this group would otherwise be refused as unknown.* 🔑 **Ask what the READ should span rather than assuming it matches the WRITE.**

- **Gate reports name the people, not only the tasks (Porter, 2026-10-04).** Every SA gate report to the PM must list **each engineer, what they hold, and the date of their last report.** 📌 **Written after `TASK-611` sat unstarted for two days inside a gate the PM had accepted: the gate was a list of TASKS, so a silent engineer was invisible until the SA read the repo. A reset session remembers nothing, so silence is the normal case and must be checked for, not waited on.**

## 🔴 STANDING RULE (@Porter, 2026-10-04) — every gate report NAMES EACH ENGINEER, what they hold, and the DATE OF THEIR LAST REPORT
**Set after `TASK-611` was found unstarted two days after dispatch — by READING THE REPO, not by a report arriving.**
⇒ **"No report in two days" becomes VISIBLE instead of discovered.**
🔑 **Why it was a hole on both sides: a list of TASKS reads as progress; a list of PEOPLE reads as capacity, and only one of those tells you whether a date is real.** 📌 **@Porter set the gate on a list of tasks and never asked who was holding them; the SA reported the gate as a list four times in a week and never named the two pairs of hands it was in.**
▶️ **And the column must be a fact the SA CHECKED, not one he was told: re-read the code repo's working state before every gate report, not only when something smells wrong.**
⚠️ **A silent engineer is the normal case here, not a fault — a reset session remembers nothing, and the repo is the only memory.** ⇒ **Re-dispatch assuming they remember NOTHING: ask for a one-line status FIRST, repeat the file claim in full, and restate every decision they must not re-ask.**

## "Inert until its screen lands" — inert on the SCREEN is not sealed at the DOOR, and the two must not be blurred (2026-10-04)
**`TASK-629`'s widened swap ships with no front-end change. Confirmed unreachable from the product by TWO single-site facts:** **there is exactly ONE Swap entry point (rendered beside the PRIMARY's name; each extra gets only *Remove*, and the click carries no teacher id)** and **exactly ONE body builder with ONE caller, which hands the series' PRIMARY in as the teacher going out.**
⚠️ **But the ROUTE still accepts a non-primary caller who crafts a request by hand.** 🔑 **That is a working feature answering correctly, not a defect leaking — there is no state it can reach that the FE task will not reach deliberately.** ⇒ ✅ **Call it inert; 🚫 do not call it sealed.**
🚫 **No test was added to pin the inertness.** 🔑 **It would be a pin deleted within a week, and a pin written to be deleted teaches the next reader that pins are disposable.** ✅ **What makes it safe is that both facts are SINGLE-SITE, and the FE task changes both on purpose.**

- **Ask the customer BEFORE the owner rules, on anything about how the shop actually works (Porter, 2026-10-04).** When a question is about the customer's own operation — quotas, reasons, who does what, what counts as whose fault — **Porter asks Khwan first and brings the owner her answer with the options**, instead of having the owner rule and then checking with her.
  📌 **Written after two reversals in one week on work that was already built and verified** — REQ-110 F's pre-start cap, and the leave-quota model. **Both times we answered on her behalf, she answered differently, and a verified task had to be re-opened.**
  ⚠️ **It does not apply to decisions that are the owner's alone** — money, security, what we will and will not build, and anything about his own servers.

## 🔴 The course EXPIRY is DERIVED FROM the leave quota — they are not two independent controls (2026-10-04)
**`maxWeekFor(size, quota) = size + quota`, and `courseExpiry(startDate, size)` is built from it.** ⇒ **a course is valid for *its sessions plus its leave quota*, in weeks.**
🔑 **So "abolish the leave counter and use the expiry as the only control" is self-referential: delete the quota and the expiry formula loses a term.** ⇒ **Before sizing any such request, establish whether the number STAYS as a validity window (a RENAME — small) or something else must newly decide validity (a product decision — large).** 📌 *One question decides small vs large; ask it rather than size both.*
⚠️ **And the cascade if the counter goes: `leaveCharged` has no subject, so `UNDO_LEAVE_CHARGE_UNKNOWN` DISSOLVES entirely** — the refusal class the customer complained about on live uat. **`adminUnlocked` becomes vestigial.** **13 files mention the counter and most only REPORT it** ⇒ 🔑 **the REPORTING is the risk, not the rule: a screen still showing "2 of 4 leaves used" after the rule is gone is worse than one that never showed it.**

## ⚠️ `makeup_far_out` fires on SEARCH EXHAUSTED, not on crossing the course expiry (2026-10-04)
**The admin notice when a make-up lands a long way out is triggered by the make-up search being exhausted — deliberately, because any fixed distance would be a number we invented.** 🔴 **It is NOT "the make-up passed the course expiry".**
⇒ **The two overlap and are not the same: a make-up can land past the expiry without exhausting the search, and the search can exhaust without the expiry being crossed.**
📌 **Khwan asked for "notify the admin, like now" believing they were the same thing.** 🔑 **When a customer says "like it does now", check what "now" actually triggers on before agreeing** — *agreement on a word is not agreement on a rule.*

## 🔴 A defect INVISIBLE while a second guard holds is a defect waiting for that guard to move (2026-10-04 — @Fern's, learned from a mutation)
**TASK-611's admin door is future-dates-only in TWO layers: the session chooser is NOT RENDERED, and the calendar read is NOT MADE (`enabled: !onBehalf`).** 🔴 **The mutation that removed the FIRST layer SURVIVED — the shell rendered empty, because the disabled read had no rows to give it.**
⇒ **Both layers are now asserted separately.** 🔑 **When two guards cover one rule, a mutation must be written against EACH, or the pair reports as one.**
⭐ **And the better reason for the second layer, in her words: *a request whose answer must never be shown should not be made.***

## 🔴 The screen's LABEL and the request's ID are two different claims (2026-10-04 — @Fern's)
**A mutation that replaced the teacher's id with a CONSTANT SURVIVED**, because the dialog's title renders the teacher's NAME — **so the screen still read correctly while the request named the wrong person.**
⇒ ▶️ **The test now drives the act from the row and asserts the BODY: `teacherId` is the row's id, and neither the name nor the nickname appears in the body at all.**
🔑 **When a screen's whole argument is "the subject cannot be got wrong", assert the WIRE, never the title.**

## 🔴 A message must not assert an act that may not have happened (2026-10-04 — found reviewing TASK-611)
**The admin screen rendered *"{name} has been told about this day"* on `subject &&` — i.e. on every admin use — and never read `teacherNotified`.** **An UNLINKED coach produces a SKIPPED row and no message**, so the sentence was false exactly when it mattered.
🔑 **It is the same error as the line beside it that was RIGHT: the *nothing has been cancelled* warning exists because *an admin who believes the families were told will not phone them* — and the next line made that same admin believe the COACH was told.** ⇒ **Same consequence, same reader, the call does not get made.**
▶️ **Read the COUNT from the ANSWER; never re-derive "it was sent" from "which door was used", and pin BY VALUE that a count of `0` does not produce the told line.** 📌 *Every "X has been told" string owes a second string for when X has not.*

## ⚠️ A mutation set whose TEST LIST lives on the command line cannot be re-run by anyone else (2026-10-04 — the front repo, two ways)
**The front runner takes `--tests` on the command line and its sets are bare arrays.** 🔴 **Consequence one: two of TASK-611's mutations SURVIVED their first run because the denied-key file was missing from the list — the second time in a fortnight.** 🔴 **Consequence two: verifying "14/14" required GUESSING the author's list; until the guess landed, the number was unverifiable by anybody but her.**
✅ **The back repo fixed this (a set may be `{ tests, mutations }`; `--tests` still wins; a set with no list anywhere is REFUSED).** 🔑 **The fix existed and had not crossed repos** — *a tool fix is not done when one repo has it.* 📌 **`TASK-637` ports it.** ⚠️ **Keep each repo's own file layout; the property that matters is that the set is in the repo and carries its list, not where it sits.**
🚫 **Never invent a list for an old set after the fact** — *a list invented after the fact is worse than an absent one: it reads as evidence.*

- **Mutation sets are FILES in the repo, both teams (Porter's rule, 2026-10-04).** A mutation set is committed beside the test it proves, named `*.mutations.json`, and **every report that quotes a mutation score names the set it ran against.**
  📌 **Origin: @Sober found that the mutation RUNNER was in the repo but the SETS were not — so "9/9 bite" could not be re-run by anyone else, on any other machine, ever. Team A adopted the file convention; @Bob asked whether Team B should too. One convention, both teams, so a number means the same thing whoever reports it.**

## 🔑 A rule learned on ONE line does not travel to the NEXT line by itself (2026-10-04 — @Fern's, on her own defect)
**She wrote the admin's *nothing has been cancelled* warning for an explicit reason — *an admin who believes the families were told will not phone them* — and then wrote the very next line as if the notice were a property of the DOOR rather than an outcome of the ACT.**
⇒ 🔑 **The rule was right; it was applied to one sentence and not to the one beside it.** 📌 **When a reason is written for one string, walk every string in that same block and ask whether the same reason applies.**

## THREE states, because there are three facts: told · not told · not known (2026-10-04)
**`>0` ⇒ "X has been told." · `0` ⇒ "X has NOT been told — here is WHY and WHO must act." · ABSENT ⇒ say NOTHING about the notice at all.**
🔑 ***"We were not told whether it went" and "it did not go" are different facts, and only one of them is safe to print.***
⚠️ **And the fourth pin, the one nobody asks for: the caller's OWN door must show NEITHER sentence whatever the count says** — **this server sends `0` on that door, so without that pin a teacher reporting their own leave is told "you have not been told".**
📌 **The server always includes `teacherNotified`** ⇒ **ABSENT means exactly one thing in practice: a FRONT END newer than its SERVER — the deploy window where FE lands before BE.** 🔑 **Say which window a defensive branch protects; a reader who knows will not delete it as paranoia.**

## 🔴 A BAN is not a CONTRAST — a file-wide sweep can delete a TRUE promise to protect against a false one (2026-10-04 — @Jason's)
**His first "no unlock" check banned the word ปลดล็อก from the whole service and FAILED ON CORRECT CODE: it is used rightly in four places, including `LEAVE_LOCKED`, where an admin unlock genuinely exists.**
🔑 **The claim was never "this word is forbidden" — it is: the refusal for a cap that CANNOT be unlocked must not offer one, and the refusal for a rule that CAN must keep offering one.** ⇒ **Both halves must be asserted.** 📌 *Before writing a file-wide negative, find the places where the thing you are banning is TRUE.*

## 🔴 A lost START anchor gives an EMPTY slice; a lost END anchor runs to EOF. Both PASS. Neither REPORTS. (2026-10-04)
**`indexOf('conflict("DECLARED_ABSENCE_CAP"')` returned `-1` once the sentence wrapped onto two lines, and `slice(-1, …)` quietly returned `""`** ⇒ **every "the sentence contains…" assertion passed on nothing.** **Caught by its author, four days after he wrote the rule it breaks.**
▶️ **Check the anchor BEFORE slicing on it — in every region pin.** 🔑 **Two mechanisms, one lesson: *a silent anchor does not stop speaking; it starts lying.***
⚠️ **And a THIRD way a pin can be wrong, found the same day: two pins broke merely because a `throw` wrapped onto two lines.** 🔑 **A pin that breaks when a line wraps was never testing what it said it was testing** — narrow it to the claim (the code raised), not the layout.

## 🔑 Clearing a value IS editing it — a gate that asks "is the field PRESENT" lets a CLEAR through (2026-10-04)
**TASK-634 widened two doors to accept an optional `rateMinor`. The coach-rate gate reads the BODY and returns early when the body edits no rate** — ✅ **and `rateMinor: null` COUNTS as an edit.**
🔑 **A permission gate must ask "is this field being WRITTEN", not "is this field SET".** ⇒ **Otherwise the one operation it most needs to stop — wiping a number — is the one it waves through.**
📌 **Proven BY VALUE at both doors (with a rate ⇒ privileged, without ⇒ not), and the gate runs BEFORE the service, pinned by order.** 🔑 **Widening a door's INPUT must be shown not to widen its AUDIENCE, and shown by value rather than argued.**

## ⚠️ State the BOUNDARY of your own verification, or it is worth nothing (2026-10-04 — @Sober, on himself)
**Accepting TASK-634's back half, one mutation set was NOT re-run (the run was interrupted).** ⇒ **That set's result is accepted ON THE ENGINEER'S EVIDENCE, and the acceptance says so in as many words.**
🔑 **"Verified" with no boundary is exactly what the SA keeps refusing from engineers; it is worth nothing applied only to them.** ✅ **And nothing is lost BECAUSE the set is filed and named** — **the re-run is a command anyone can type, not a favour to ask.** 📌 *That is what TASK-627 bought: a gap in verification is now a scheduling detail instead of a permanent hole.*

## 🔴 A hand-written test list is the failure mode — even when it is written down ON PURPOSE (2026-10-04)
**@Fern parked `task-634`'s test list in a file DELIBERATELY, to avoid the two list mistakes of the previous fortnight.** 🔴 **The parked list was still short: run the set with it and `R8` SURVIVES — and `R8` is the exact mutation whose survival made her write the missing test file.** ✅ **With the right list, 11/11.**
⇒ 🔑 **Writing the list out by hand IS the failure mode; filing it by hand only moves the mistake into the repo.** ▶️ **The set must carry a list that is CHECKED (every named file exists AND the set runs green against it), not typed.**
📌 **It was caught ONLY because the set is a named file the SA can re-run** — *the argument for filing sets, making itself.* ⚠️ **And note what it is NOT: her code was proven. The RECORD of how to prove it was not.**

## 🔴 A guard can be REAL and UNASKED — find the one case where it is live, or delete it (2026-10-04 — @Fern's)
**`R8` dropped the permission check from a request-body builder and SURVIVED: a hidden field can never be filled, so the typed value is always empty when the key is gone.** ⇒ **the guard was real and nothing was asking about it.**
⭐ **The live case is not exotic: THE GRANT IS REVOKED WHILE THE DIALOG IS OPEN** — permission data is live, the field vanishes, **and the number already typed is still in component state.** ⇒ **a test drives type → revoke → re-render → submit: no rate rides, and the act still goes.** 🔑 ***Losing the key costs the RATE, not the ACT.***
📌 **Its own file, because the IDENTITY CHANGES there** — *the transition is the subject of the test, not an accident of ordering.* ⇒ **When a mutation survives, the choice is: delete the guard as dead, or write the case where it is live. 🚫 Never leave it unasked.**

## 🔴 "Is this still the wording the owner approved?" is answered for SOME strings, by accident (2026-10-04)
**A one-line fix-up script corrected an insertion's ANCHOR and not its PAYLOAD (`String.replace` takes the first occurrence only), silently replacing an APPROVED, SHIPPED sentence in BOTH languages with invented wording.**
✅ **Caught within the minute by a copy pin that happened to exist on that string — in somebody else's feature.** 🔴 **Nothing in anyone's process would have caught it otherwise.**
⇒ **Which approved strings are protected is an accident of who wrote a test that day.** 📌 **`TASK-640` asks whether every owner-approved string should be pinned.**
✅ **Adopted immediately regardless: 🚫 NO bulk string-replace on `dictionaries.ts`, ever** — **a script that edits approved copy must NAME every string it intends to touch.**

## 🔴 A UNIQUE index guarantees each SPELLING is unique — not each PERSON (2026-10-04)
**`normalizePhone` strips non-digits and NOTHING else — no country-code handling. `findParentByPhone` then matches EXACTLY, and `parents_phone_uq` is unique on the STRING.**
⇒ 🔴 **`0925874986` and `66925874986` are two DIFFERENT, equally legal, equally unique parent rows for ONE human.** **A family created under one spelling and a parent linking under the other produces a SECOND parent row with the LINE id on it and NO children.**
🔑 **And `students.parent_id` is a single column: a child belongs to EXACTLY ONE parent row, with no co-parent** ⇒ **resolving to any other row means that parent sees nothing, on every door, forever.**
⚠️ **The failure is SILENT by construction: nothing errors, nothing is logged, and the parent simply reads "you have no classes".** ⇒ **Every household entered in one shape and typed in another is in this state and is invisible to us.**
📌 **Whenever a human identifier is a free-text key: canonicalise on WRITE and on every LOOKUP, and never let a uniqueness constraint stand in for identity.**

## 🔴 TWO stores for one link, FIRST-WINS precedence — right for routing, wrong for identity (2026-10-04)
**A LINE id lives in `family_line_links` AND in `parents.line_user_id`. `familyOfLineUser` reads the links TABLE first and stops; only if it finds nothing does it read the column.**
⇒ **A link row pointing at a childless parent row BEATS the column on the parent who actually holds the children — silently.** 📌 **The code's own comment records this precedence causing exactly this class of fault once already (`23505` on the next write, and the customer got silence).**
🔑 **When one fact has two homes, every reader must declare whether it wants FIRST-WINS (routing) or ALL-HOLDERS (identity, guards, diagnosis)** — *and the two must not be the same function.*

## 📌 Both doors stop BEFORE they look at a booking (2026-10-04)
**`linkedStudentIds` returns `[]` when the LINE id resolves to no parent, or that parent has no live children — and `findTodayBookingsForParent` / `findUpcomingBookingsForParent` both return immediately on `[]`.**
⇒ 🔑 **"The sessions are CONFIRMED" and "you have no upcoming classes" are CONSISTENT, not contradictory.** ⚠️ **Which is why the CONFIRMED-only window was the wrong explanation for this symptom, twice — once by @Porter, once by @Sober.**
▶️ **When a list is empty, find out which STEP emptied it before explaining the contents of the list.**

## 🔴 The BOOKING path creates a child WITH NO PARENT — one line, silently, and the booking lands on it (2026-10-04)
**`students.parent_id` is NULLABLE (no `.notNull()`), so a parentless child is a state the system PERMITS.** 🔴 **And `resolveStudentId` on the booking path writes it: an inline NEW student with NO PHONE is inserted with `parentId: null` — no refusal, no warning, nothing logged.** ⚠️ **The comment above it describes only the happy path.** 🔑 *The null branch was never decided; it was DEFAULTED.*
🔴 **The SAME CALL then attaches the booking** ⇒ **the course and its sessions land on the unreachable child BY CONSTRUCTION — not by bad luck.**
✅ **And nothing NULLS a parent later: the student edit writes a six-field allow-list excluding `parentId`, and no other site touches the column.** ⇒ 🔑 **a parentless child is BORN parentless** ⇒ **there is no nulling bug to hunt; the fix is at CREATION, and existing rows need RE-PARENTING, not repair.**
⚠️ **Consequence: that child is unreachable by EVERY parent-facing door — check-in, leave, My Course, every notice — and nothing anywhere says so.** 📌 **It also skips `assertCanAddStudent`, the household child-count guard the admin path enforces.**
🔑 **General rule: when a foreign key is nullable, find the branch that writes the null and ask whether anybody DECIDED it. A default is not a decision.**

## 📌 Say "tell me at once if none of my explanations is right" — and mean it (2026-10-04)
**Three explanations were offered for a live customer defect, each certain in its mechanism and each WRONG for this case.** **The diagnosis also named the query outcome that would mean all three were wrong, and asked to hear it immediately.**
⇒ **The owner ran one query, the answer came back, and the real cause was found the same hour.** 🔑 **Being publicly wrong on three and corrected in an hour beats being privately right on one in a week.**
▶️ **Every diagnosis that offers candidate causes owes: the observation that would REFUTE all of them, and an explicit request to be told.**

## 🔑 Repair REACHABILITY (ours, broken). 🚫 Do NOT repair IDENTITY (theirs). (2026-10-04)
**Two student records share a name; one is parentless and holds the live course. The obvious "fix" is to merge them.** 🔴 **But "(V)" is the CUSTOMER'S naming convention — two records for one child may be routine, so "same name ⇒ duplicate" is a GUESS about their filing, not a fact about our data.**
⇒ ⭐ **Attach the parentless record to the parent: ONE write, ONE column, reversible, and it ends the harm today.** 🚫 **Merging ASSERTS an identity we cannot verify; if wrong it merges two real children and their attendance history becomes a lie.**
🔑 **A repair that can be wrong about WHO SOMEBODY IS must not be the first repair.**
✅ **And the attach makes a later merge SAFER, not harder: afterwards both records hang off the SAME parent, so the merge is a move WITHIN one family instead of ACROSS two.** ⇒ **the attach is the first STEP of the merge, not an alternative to it.**
⚠️ **If a merge is ever chosen, SIX places move in one transaction or none:** `bookings.student_id` + `co_student_id` · `course_packages.student_id` + `co_student_id` · `vouchers.student_id` · `camp_packages.student_id` (**NOT NULL — repoint only**) · **plus a DECISION about `crm_points`/`crm_level`, which live on the STUDENT row.** ✅ **NOT the outbox (keyed on `booking_id`), NOT notices already sent.** 🔑 *A half-moved child is worse than a duplicated one: nothing would say which half is real.*

## A guard that EXISTS on the other door is not a missing guard (2026-10-04)
**`POST /students` — the admin's add-a-child door — REFUSES a body with neither `parentId` nor `parentPhone`.** 🔴 **`resolveStudentId`, on the booking path, writes `parentId: null` without a word.**
⇒ 🔑 **The door DESIGNED to create children enforces a parent; the door that creates them as a side effect does not.** 📌 **And no screen can repair it afterwards: the student edit writes a six-field allow-list that excludes `parentId`.**
⇒ **When one door enforces an invariant, find every OTHER path that creates the same row — a side-effect creator is where invariants go to die.**

## A one-row repair against live data owes its GUARD and its NON-fixes (2026-10-04)
**`UPDATE students SET parent_id = … WHERE id = … AND parent_id IS NULL`.** 🔑 **The `AND parent_id IS NULL` is not politeness: without it, a re-run with a stale id moves a child who already has a family.** ✅ **`UPDATE 1` expected; `UPDATE 0` means somebody already set it — STOP and re-read the row.**
▶️ **And every such statement owes an explicit list of what it does NOT fix.** **Here: it does not merge the records (the parent will see two children of that name) · it does not move CRM points · it does not stop recurrence · it gives nobody a screen.** ✅ **And what it does NOT need to touch, which is the point: bookings, the course and the outbox** — **every parent-facing door resolves parent → children → bookings, so attaching the parent fixes every door at once.**
⚠️ **State the human consequence too: the family will immediately receive notices they have never received, possibly a reminder for the next session.** 🔑 **Correct behaviour arriving late still reads as a burst of messages out of nowhere — one sentence of warning turns it from alarming into reassuring.**

## 🔴 The front end ALREADY KNOWS which children are unreachable — it has the fact and does not use it (2026-10-04)
**The booking dropdown (`searchStudents`) does a LEFT JOIN from the child to the parent**, so a parentless child is **INCLUDED with the phone simply null** — **and the row it returns already carries `parentId`.**
⇒ 🔑 **Marking or excluding an unreachable child is NOT a pipeline, a query or a new field. It is a marker on data already on the screen.** 📌 **That is the cost of `TASK-642`'s (c).**
⚠️ **And the state is not merely unlabelled, it is UNLISTED: the People page lists children BY PARENT, so a parentless child is invisible on the ONE screen staff would use to find it.** ⇒ **It exists only inside bookings and the schedule, where its course card reads perfectly ordinary.**
🔑 **The difference between a reachable and an unreachable child WAS already on screen — as the ABSENCE of a phone — and nobody was ever told to read a blank as a warning.** ⇒ **It is not "the staff should have checked"; there was nothing to check against.**
🚫 **Nothing to chase in the ordering: a parentless child appearing FIRST is plain alphabetical order, not a sorting defect.**

## When the customer confirms an identity, say exactly WHICH objection it retires (2026-10-04)
**Four objections stood against merging two student records: not reversible · the harm is urgent and the smaller fix ends it today · 🔴 we cannot assert who somebody IS · and the CRM points need a decision nobody has made.**
**Khwan then confirmed the two records are one child.** ⇒ ✅ **That retires the THIRD objection and only the third: the merge is now a decision the owner CAN make — it was never one we could make for him.**
🔑 **The ruling did not change, because three reasons still stood.** 📌 **Name which objection moved rather than re-deciding from scratch** — *a confirmation that answers one of four reasons is not an argument for reversing the other three.*

## 🔴 A mutation whose SUBJECT is deliberately removed must be RETIRED or INVERTED — never left to "survive" (2026-10-04)
**When a rule is removed on purpose (the TASK-609 pre-start cap), the mutations that pinned it lose their subject.** **Left in the set, they now SURVIVE — and a survivor that is supposed to survive is indistinguishable from one that is not.** 🔑 **@Porter: *a set that silently stops biting because the behaviour it pinned is gone looks identical to a set that broke.***
▶️ **So, per mutation: KEEP (subject intact, must still bite) · RETIRE (subject gone — remove it, keep the id, write WHY and WHEN in the file) · INVERT (the defect it described is now the INTENDED behaviour — pin the new rule, and add a mutation that reinstates the old one, which must BITE).**
⭐ **Inverting is the valuable one: a limit the customer disowned, quietly reintroduced, is now the defect.**
⚠️ **Same for pins of removed copy: assert the string is GONE, do not merely stop asserting it is there.** 🔑 *An absent check and a check for absence are different things.*

## ⚠️ Removing a LIMIT can expose an unbounded quantity — prove the number (2026-10-04)
**`courseBornCeiling` sets a course's expiry to the BASE ceiling PLUS the weeks declared absent (the customer's Kavya rule: 8 + 3 = 11).** **With the pre-start cap removed, every declared pre-start absence now extends validity by a week, WITHOUT LIMIT.** ✅ **That is the customer's own model ("the expiry is the only control"), not a defect.**
🔑 **But removing a limit is exactly when an unbounded loop shows itself** ⇒ **prove it BY VALUE (more absences than the quota ⇒ expiry stretched by exactly that many weeks, make-ups inside it) rather than reasoning that it must be fine.**

## 🔑 Prefer a CHECK that forbids exactly the defect over a NOT NULL that forbids more (2026-10-04)
**A live, bookable child with no parent is the defect. Plain `students.parent_id NOT NULL` forbids MORE than that: an ARCHIVED row still holds the null, so every junk or abandoned record would need an INVENTED family — a lie written into the data to satisfy a constraint.**
⭐ **`CHECK (parent_id IS NOT NULL OR archived_at IS NOT NULL)` forbids exactly the defect and nothing else** — **a live child must have a family; an archived one need not.** ⇒ **junk can simply be ARCHIVED (an owner decision per row), never deleted, never given a fake family.**
🔴 **Order: the app-level refusal ships FIRST, the constraint LAST** — **constraint before the refusal ⇒ the database turns an ordinary booking into a 500; constraint before every environment is swept ⇒ the migration fails mid-deploy.**

## 🔴 A fix in a SHARED component crosses the team boundary even when the bug is "ours" (2026-10-04)
**`components/common/StudentSelect.tsx` is used by BOTH teams' screens** — Team B's `partials/Bookings/*` (New course, plan, voucher, IMPORT) and Team A's booking modal, plus the camp dialogs.
⇒ **Fix the SHARED component, never per screen** (*per-screen fixes are how two screens end up with two rules*) — **and because it changes the OTHER team's screens' behaviour, @Porter claims it to ONE team and tells the other.** 📌 **The screen in the customer's own screenshot was the other team's.**

## ⚖️ OWNER RULE (2026-10-04): when one SA genuinely needs something from the other, @Porter SAYS SO IN THOSE WORDS
**Owner, verbatim:** *"ถ้างานมันต้องถามกันจริงๆ อ่ะ นายก็ควร บอกฉันชัดๆ ว่า เขาฝากถาม ฉันจะได้ไปบอก sober ให้"*
🔑 **The no-contact rule between the two SAs was never meant to hide the fact that a question exists.** **It governs WHO CARRIES a question, not whether the owner is told there is one.**
▶️ **So, whenever a cross-SA need is real, @Porter reports it to the owner as: "⟨SA⟩ is asking ⟨the other SA⟩ ⟨this⟩" — naming BOTH sides and the question** — instead of quietly relaying it and presenting only the outcome. **The owner may then carry it himself; that is faster than a Porter round-trip and it is his call to make, not Porter's.**
⚠️ **What this does NOT change:** 🚫 **the two SAs still never message each other**, and 🚫 **@Porter does not stop relaying** — the owner gains the OPTION, he is not handed the job.
🔴 **And the failure it corrects, from the same day:** **@Porter held @Bob on a question he had sent to @Sober, and reported it to the owner as "Team B is waiting".** **The owner read that as Silver waiting on Sober — a chain that does not exist.** ⇒ 📌 **Reporting a block WITHOUT naming who is actually asked makes the org chart look wrong.** 🔑 *"Team B is waiting" names a symptom; "Silver is asking Sober X" names a fact the owner can act on.*

## 🔴 THE CUSTOMER USES A STUDENT RECORD AS A LABEL, NOT ONLY AS A PERSON (2026-10-04, confirmed by Khwan)
**`ISB (ECA)` is not a child.** **Khwan:** *"ที่ทีมงานสร้างผิดใส่เป็นชื่อเด็กไปค่ะ แต่จริงๆมันคือ Title เฉยๆค่ะ เป็นรายการตัวแทนคลาส ECA ของโรงเรียนค่ะ"* — **staff typed a CLASS TITLE into the student field to stand for a school's ECA slot, and booked a confirmed session against it.**
⇒ 🔑 **"Every student must have a parent" is NOT a statement anyone can make about this data.** **A rule that refuses a parentless student refuses a workflow they use today.** 🚫 **And such a row must never be given a parent: there is no family, and inventing one is worse than the defect.**
⭐ **@Sober's `CHECK (parent_id IS NOT NULL OR archived_at IS NOT NULL)` was designed before this was known and SURVIVES it** — the title row is disposed of by ARCHIVING, which the constraint permits. 📌 *Evidence that "a LIVE child must have a family" was the right shape, and a plain NOT NULL was not.*
⚠️ **Open PRODUCT question, owner's, not ours: is the title row misuse to be replaced by a real ECA-slot concept, or legitimate and owed a "not a person" flag?** 🚫 **Neither is a defect anybody may assert.**

## 📌 A customer can SEE this defect and still not report it (2026-10-04)
**Khwan had noticed `ตินติน เปรมตฤณ` missing from People the previous day and did not raise it** — *"เมื่อวานที่ทีมมาแจ้งขวัญลืมบอกพี่โด่งค่ะ"*. **She read it as the student's data having disappeared.**
🔑 **So "no further complaints" is not evidence of no further cases.** ⇒ **Sizing this class of defect by customer reports UNDER-COUNTS it; only a sweep of the data gives a number.**

## 🔴 A lost SUBJECT is a retirement; a lost ANCHOR is a re-anchor — and in a report that prints only a number they look identical (2026-10-04 — @Jason's)
**Removing the TASK-609 cap, two mutations (F5, F6) kept their SUBJECT — what they test still exists — but lost their ANCHOR: the helper now RETURNS the predicate instead of branching on it, so the text they hooked into was gone.** ⇒ **They needed RE-POINTING, not retiring.**
🔑 **A table of what each mutation PINS is only half the prediction; the other half is what each one ANCHORS ON — and that half breaks first, because it is about code shape, not behaviour.**
▶️ **When a change lands in a file that mutation sets anchor into, re-run EVERY set that anchors there, not only the one for the task.** **"The anchors still resolve" (the integrity test) is not "the mutations still bite" (only a re-run).**
⭐ **The set-integrity test caught it BEFORE the run — its third catch in a week, making it the cheapest thing we own that has paid for itself the most.**

## 📌 A count that goes DOWN on purpose must say so in the same place the count is read (2026-10-04)
**`task-609` went from 11 to 7 mutations: four RETIRED with the rule they tested, one INVERTED into the new rule.** ⇒ **The deploy note states WHY beside the number** — *fewer, all meaningful, not fewer because something broke.*
🔑 **A falling coverage number with no explanation reads as lost coverage, and the explanation belongs where the number is read, not in a TASK file nobody opens.**

## ⚖️ OWNER RULE (2026-10-04): find what the CUSTOMER can do themselves before costing the team anything
**Owner, verbatim:** *"เห้ย เราต้องช่วยอะไรอีก เราไม่ช่วยเขาเยอะขนาดนั้นนะ หา ทางที่เขาทำเองได้มากที่สุดได้มั้ย"*
🔴 **The failure that earned it:** Khwan asked to delete the duplicate `Ari Khosla (V)`; it holds a LIVE voucher (**6 of 15 hours left, expires 2027-05-25, source `IMPORT`**) and 3 past sessions, so deleting it would cost the family paid hours. **@Porter's answer was to offer @Sober a multi-table merge design.** ⇒ ⚠️ **That is engineering spent on TIDINESS, proposed before anyone asked what the customer actually wanted.**
✅ **What the customer actually wanted was in her own words — *"คุณแม่จะได้ไม่งง"*.** **She wanted the mother not to be confused, not the row removed.** ⇒ ⭐ **RENAMING the two records on the People page — which she can do herself, today, with the pencil she already has — answers it completely, moves no data, risks nothing, and is reversible.**
🔑 **The rule: before routing a customer request to the team, state what the customer can already do with the screens they have.** **Read the request for the OUTCOME they want, not the ACTION they proposed.** 📌 **And when the problem expires on its own — this voucher ends in 8 months, after which the row can simply be archived — say so: a problem with a date on it may not need a fix at all.**

## ⚖️ OWNER RULE (2026-10-04): @Porter ends EVERY reply to the owner with who holds the ball
**Owner:** *"ตอนตอบฉันแบบนี้ นายควรแปะลงท้ายด้วยว่าส่งบอลไปไหน"*
🔑 **The owner coordinates agents he cannot watch working.** **Without that line he has to re-derive who is waiting on whom** — and the same day he misread "Team B is waiting" as Silver waiting on Sober, a chain that does not exist.
▶️ **Format: one short last line — 🏀 ball is with ⟨PERSON⟩ — ⟨what they are doing⟩.** **Name the PERSON (Sober · Silver · Tanya · Khwan · the owner · Porter), never a team.** **If nothing is pending, say that explicitly.**

## 🔑 Before adding a concept, check whether the workaround is standing in for one that EXISTS (2026-10-04)
**Staff created a STUDENT named `ISB (ECA)` — a class title, not a child — and booked a confirmed session against it.** **The concept they needed already exists: an `OTHER` booking takes NO student, a free-text `otherTitle`, and `otherKind = ECA`** (`lib/other-kind.ts`: `ECA · FREE · KOL`).
⇒ **A "not a person" flag on students would REBUILD OTHER/ECA inside the student table.** ⭐ **The useful question is not "misuse or legitimate?" but "WHY did staff not use the existing feature?"** — **if it lacks something they needed, THAT is the gap; if it was simply unknown, the fix costs nothing.**
✅ **And a constraint shaped as "a LIVE child must have a parent" absorbed this surprise unchanged: the title row is ARCHIVED, which it permits.** 🔑 *A constraint that forbids exactly the defect survives facts it was not designed for; one that forbids more does not.*

## ⚠️ "No further complaints" is not evidence of no further cases (2026-10-04)
**A third parentless household surfaced that the customer had SEEN — missing from People — and not reported.** ⇒ **Complaints undercount a silent defect by construction: the affected family sees "no classes", not an error.** 🔑 **Only a sweep count is a number.** ▶️ **So the half of a fix that SURFACES existing cases matters as much as the half that stops new ones — stopping new ones never finds the old.**

## The `LAST` badge's rule is a UNION of two sets that already exist (2026-10-04 — REQ-113 pre-read)
**`deriveLiveEndDate` = max(date) over `COURSE_LIVE` = `{PENDING, CONFIRMED, EXTENDED}`, so an ATTENDED last session drops out and the badge vanishes at check-in.** 🔴 **It must NOT be widened: it also feeds the PLAN's displayed end and course history.**
✅ **`COURSE_DELIVERED` already exists as exactly `{ATTENDED, NO_SHOW}`** ⇒ **"last lesson" = max date over `COURSE_LIVE ∪ COURSE_DELIVERED` — no new status list.** 🔑 **The owner's ruling that a NO_SHOW keeps the badge is satisfied by construction.** *A rule built from a union of existing definitions cannot drift from them; a rule with its own list can.*

## 📉 When an answer makes the work smaller, SAY the new number (2026-10-04)
**Khwan confirmed a suspected product gap (a class title stored as a student) was a one-off MISTAKE.** ⇒ **The sizing fell: an M-sized option retired, an exception branch removed, a constraint term removed.**
▶️ **Report the decrease explicitly, beside what did NOT shrink** — *a number that quietly stays the same after its reason disappears reads as padding.* 🔑 **And ask "why did they do it this way?" before designing for either reading: one question to the customer retired an M.**

## 🔴 An EXEMPTION to a rule can make that rule's DATABASE constraint impossible (2026-10-04)
**The planned constraint said "a LIVE child must have a parent". The owner then exempted IMPORTS, which may create exactly a live child with no parent.** ⇒ **The constraint would refuse what the policy now permits.**
🔑 **When a policy gains an exception, re-check every place that ENFORCES the policy — especially the database, which cannot hear about exceptions it was not told.** ⇒ **Either the constraint goes (the policy no longer holds the rule, so the DB must not assert it) or it gains a marker whose only job is to let the rule coexist with its own exception.**

## 🔑 ONE rule, enforced by the SERVER per ACT; a shared component only MIRRORS it, with a safe default (2026-10-04)
**Import vs booking are different ACTS with different schemas already — that is where the difference belongs, not in which screen a shared picker finds itself on.**
▶️ **The picker gets ONE explicit prop (`requireParentPhone`) defaulting to the SAFE value, so a new caller fails CLOSED without anyone remembering; only the one exempt caller overrides it.** 🚫 **A component that sniffs its caller is how two rules become three.** ✅ **If the mirror is ever wrong, the server still refuses.**
⚠️ **Evidence the risk is real: the shared picker already misbehaves for one caller — the camp-sale dialog offers "create a new student" but sends only an id.**

## ⚖️ Couple the thing that actually depends — not the whole piece (2026-10-04)
**"A and B no longer ship independently" was half right: the EXEMPTION depends on B (an unreachable import is only acceptable if B makes it findable), but Piece A does not — A alone closes one path and leaves the other exactly as open as before, so it is never worse than the status quo.**
🔑 **Before coupling two deliveries, ask whether shipping the first ALONE could ever be worse than today. If not, coupling only delays a strict improvement.**

## 🔴 A proof of the FUNCTION is not a proof of the PATH — check which one you were handed (2026-10-04 — QA F3)
**`courseBornCeiling` was proven to stretch the expiry by exactly the declared absences. True — of the function.** **The TASK-609 declaration path never CALLS it, so on the live box the expiry did not move and make-ups landed past it.**
🔑 **The SA asked for a PATH-level proof, received a FUNCTION-level one, re-ran its mutation counts, and accepted the substitution.** ⇒ **He verified that the proof was HONEST, not that it proved the CLAIM.**
▶️ **When a claim is about behaviour ("a declared day stretches the expiry"), the evidence must drive the real entry point. A test named for the behaviour that exercises only a helper is how this got through.**

## 🔴 A LIMIT can be silently LOAD-BEARING for something else — find what it holds up before removing it (2026-10-04)
**The pre-start cap was removed as "a deletion, free today". It was not free: the base expiry carries the quota's weeks as slack, so a cap of `quota` declared days made the missing expiry-stretch INVISIBLE — every make-up fitted.** **Removing the cap exposed the gap at `quota + 1`.**
▶️ **Before deleting a constraint, ask: what invariant ELSEWHERE is only true because this one bounds it?** 🔑 *A removal is only "free" if nothing was leaning on it.*

## 🔴 A field verified for SHAPE on one side and for MEANING on the other has been verified by nobody (2026-10-04 — QA F2)
**`teacherNotified` was a hard-coded `1`: the function discarded the queue's own QUEUED/SKIPPED result.** **The back-end test asserted the SKIPPED row existed; the front-end test fed a mocked `0`; the SA checked the field was a number with the right name.**
⇒ **Each side tested its own idea of the contract; the SEAM was never tested.** ▶️ **For every cross-repo field whose VALUE drives behaviour, one test must cross the seam: the real server answer, fed to the shape the screen reads.**

## 🔴 A rule enforced only by the SCREEN leaves the door open behind it (2026-10-04 — QA F1)
**"Admin leave is future-only" lived in the dialog alone; the server, built as "a second caller of the same act", accepted today and CANCELLED the day's classes and NOTIFIED the families — irreversibly — on a direct API call.**
▶️ **A refusal that protects against an irreversible act belongs at the SERVER, at the DOOR that needs it — and never inside a shared act whose other caller must keep the behaviour.** 🔑 **And QA lines, deploy notes and tasks must state the same rule; when they disagree, the one describing the server is the one that will be built.**

## 🔑 A census answers the question you ask it; it cannot tell you a path is MISSING from the list (2026-10-04 — @Jason's)
**A test counted every call site of `courseBornCeiling` correctly, all week. The pre-start declaration path was not one of them — and nothing asked why it should have been.** ⇒ **A census proves the list is accurate, never that it is complete.**
▶️ **When a rule must apply on every path that does X, enumerate the paths that do X first, and check each is on the census — not the reverse.**

## ⭐ Two rules can produce ONE observable number — pin the term where it IS distinguishable, and say why (2026-10-04 — @Jason's)
**Mutation `declared = 1` survived every value assertion on the real path, because the make-up chain (each declaration appends a make-up a week after the last row) yields the same expiry as the declared-weeks term in every reachable scenario.**
✅ **Correct response: do not invent an unreachable scenario to force them apart, and do not drop the mutation — pin the term at its own line, and write in the test that the two are indistinguishable at path level and WHY.** 🔑 *A survivor with a stated reason is knowledge; a survivor without one is a gap.*

## 🔑 A mutation that changes NOTHING is indistinguishable from a gap in the tests (2026-10-04 — @Jason's)
**`1 && await notify(…)` is a no-op as a mutation — it "survived", not because the tests were weak but because nothing was broken.** ▶️ **Before reading a survivor as a gap, confirm the mutation actually changes behaviour.**

## 🔴 When a rule changes, find EVERY reader of the old rule — a label is a reader too (2026-10-04)
**TASK-646 made a declared pre-start day stretch the expiry. The course card's "ขยายได้ถึงสัปดาห์ที่ N" kept computing `size + quota` — the old, capped rule — because `maxWeek` is derived from size and quota, never from the stored expiry.** ⇒ **Right dates, wrong label, on the exact screen the customer was about to inspect.**
▶️ **Derive a displayed fact from the stored fact it describes, not from a parallel formula that used to agree with it.** 🔑 *A number on screen that disagrees with the system's behaviour is a defect wearing copy's clothes.*

## 🔑 Before "fixing a message", find out WHY that message is the one shown (2026-10-04)
**A linked coach calling the admin leave door got a generic `FORBIDDEN` instead of the teacher-scope sentence.** **Not copy: the global guard checks MENU and ACTION before SCOPE, deliberately (TASK-406), and a coach lacks `menu:bookings`.** ⇒ **Changing the sentence means reordering the guard every request passes — a blast radius far beyond the two doors.**
**Likewise "the ticked sessions line on a door with no ticks" was a DISPLAY CONDITION, not wording.** ▶️ **Trace why a string appears before rewriting it; often the right fix is where, not what.**

## 🔑 A MEANINGLESS fixture value becomes a WRONG one the moment something starts reading it (2026-10-04 — @Jason's)
**A shared test fixture carried an arbitrary `expiryDate`. Harmless while nothing read it; misleading the moment `maxWeek` began deriving from it.** ▶️ **Give fixture values the meaning the real rule would give them, with the reason written beside them.**

## 🔑 A mutation aimed at the WRONG line survives for a reason unrelated to the tests (2026-10-04 — @Jason's)
**`W7` edited `MAX_WEEK_BY_SIZE`, which the rule does not read (the map is derived FROM the quota table). It survived while claiming to change the rule.** ⇒ **Before reading a survivor as a gap, confirm the mutated line is actually on the path.** *(Second this week, after a no-op mutation.)*

## ⚖️ A test whose SUBJECT and FILE belong to different teams belongs to the FILE's team — and is in the wrong place (2026-10-04, @Porter's rule)
**`teacher-scope.test.ts` pins Team A's leave dialog but sits beside Team B's `teacher-scope.ts`.** **TASK-638 assigns it by location ⇒ Team B's.** **Two careful readers still read the rule two ways — the exact failure TASK-638 was meant to end.**
▶️ **Rule: the FILE's team owns it — AND the mismatch is a defect in the test's placement, to be FIXED (move the pins beside their subject), not argued.** 📌 **`TASK-653`.**

## 🔑 A deploy note for the customer's environment must warn about numbers that will CHANGE because they were WRONG (2026-10-04)
**The course card's week label had been wrong on uat for admin-extended courses all along. Fixing it changes numbers the customer has already seen.** ⇒ **The uat note says so in a sentence written to be read BEFORE she looks, with an example and the evidence that the new number is the true one.**
🔑 *A number that changes after a fix looks identical to a number that broke; the difference is whether someone was told why.* **And a rollback reverses it — say that too.**

## 🔑 A rule can be written in several PLACES even when it is one rule — find them all before saying "one change" (2026-10-04)
**REQ-113's "live only" lived in the date helper, in the badge check's own status filter, AND in the database read that never fetched delivered rows.** **Fixing only the date helper would have changed nothing on screen.** ▶️ **Trace every filter on the path from the database to the screen, not just the function with the obvious name.**

## 🔑 A compile error finds every reader the compiler can see; a COMMENT is a reader it cannot (2026-10-04)
**TASK-645 renamed the badge helpers and the compiler surfaced every code reader. The comment on the `courseLast` DTO field, in another file, still described the old rule ("no second rule") — the opposite of the fix.** ▶️ **After a rename or a rule change, grep for the OLD name and the OLD claim too; comments and docs do not fail to compile.**

## The two repos' mutation runners read DIFFERENT set formats (2026-10-04, Fanta, TASK-662)
- **Back** (`scripts/mutation/run.ts`): a plain list OR an object `{ tests, mutations }`. Bob's `*-task644.mutations.json` uses the object, carrying its own test list.
- **Front** (`scripts/mutation/run.ts:66`): a **plain list only**. An object set crashes it, so a front set must be a list with `--tests` passed on the command line.
- **Front sweep with a pinned list:** `src/lib/ui/masked-input-assert.test.ts:162` pins the exact DOM tests whose screen holds a `NumberInput` and that type. **A new clicked test on any screen with a `NumberInput` turns it red even when it satisfies the rule.** The list needs one line per new file, and that file sits outside most claims.

## Front tests: a `mock.module` lasts for the WHOLE run — test the real `client.ts` by its own specifier (2026-10-05, Fanta, TASK-662)
- 18 DOM tests `mock.module("@/lib/api/client")`, and Bun keeps a module mock for every file that runs after. A test that imports `@/lib/api/client` or `./client` therefore gets whichever stand-in loaded last. **Seen: 10/10 alone, 0/10 in the full suite.**
- Fix: import it by a query-suffixed specifier, `await import("./client.ts?<tag>")`. That is a separate, unmocked instance of the same source, and mutations to the file still reach it (TASK-662 C1–C4 bite).

## 🔴 OWNER RULE (2026-10-06): @Porter does NOT send the customer a CAUSE before the SA confirms it from code
**Owner, verbatim:** *"ไอควายเอ้ย อย่าให้มีอีก เป็นครั้งที่สอง บอกฉันแจ้งขวัญไวไป"*
**The two incidents:** **(1)** Porter told him to send @Fern the message workbook while `TASK-608` was still adding two notifications — he had to unsend it. **(2)** Porter drafted a customer explanation of the leave chain (*"12/12 was the make-up for the 17/10 leave"*) from screenshots, before @Sober had read the code. **@Sober's answer swapped it: 05/12 was the make-up of the 17/10 leave; 12/12 was the make-up of 05/12's.**
🔑 **THE LINE, and it is a clean one:**
- ✅ **What @Porter can COUNT or QUOTE from the customer's own screen is his to send** — *10 of 10 sessions · `Leave 1/3` · `0 session(s) still owed`*. **That half was correct both times.**
- 🚫 **WHY the system behaved that way is NOT his** — it is reading code he has never opened. **It waits for the SA, every time, with no exception for "it is obvious".**
▶️ **If the customer is waiting, send the countable half NOW and say the reason is being checked.** 🔑 *An answer that is half as complete and entirely true beats a complete one that has to be taken back.*
⚠️ **And the cost is not embarrassment — it is the customer's reasoning.** **Khwan is actively redesigning the leave model with us; a wrong mechanism in her head steers the next decision she makes.**

## 🔑 Migration ledger: ONE migration, TWO fingerprints — by line ending (2026-10-06, @Sober, confirmed by the owner's read on sid + uat)
- **The ledger hash is sha256 of the `.sql` TEXT. The repo stores `drizzle/*.sql` LF; a Windows checkout (`core.autocrlf=true`) has CRLF** ⇒ each migration has an LF and a CRLF fingerprint (appendix in `DATA-REQUEST-ledger-read-2026-10-06.md`). Read 10-06: sid 113 rows / uat 86, 65 dates on both, no identical rows, pair for `0011` = its LF/CRLF pair on both boxes.
- **`db:verify` is GREEN iff every migration has a row in the RUNNING machine's ending.** A migration recorded only in the other ending reads MISSING ⇒ RED. **`seed-ledger` repairs by adding the other ending ⇒ every repair adds doubles.**
- 🔴 **It never makes drizzle skip or re-apply: drizzle decides by the newest `created_at`, and both rows of a pair share a date.** A RED of this kind is ledger-only, never missing schema.
- **Remedy (sized XS each, pending): verify/seed accept EITHER fingerprint (guard) + pin `drizzle/*.sql` to LF (fix, owner's `.gitattributes` decision). Both are needed.**


## 🔴 Test DATE BOMBS: a literal date passed to code that compares with TODAY (2026-10-06, @Sober)
- **Seen:** three camp test files built their day as `"2026-10-05"`; `camp.service.ts:254` skips a past day (`d.date < bangkokNow().date`). **On 10-06 five tests went red with no code change** (same commit was green the day before).
- **Rule:** **a fixture date that reaches code reading `bangkokNow()` / today must be RELATIVE to today (or the clock passed in)** — never a literal. **A literal date in a test is fine ONLY when the code under test never asks what day it is.**
- **Review check:** when a test's subject reads the clock, grep its fixtures for `"20\d\d-` literals.

## 🔴 OWNER RULE (2026-10-06): ACKNOWLEDGE, then BATCH — @Porter does not answer the customer item by item
**Owner, verbatim:** *"อย่าตอบกลับ ว่าเสร็จแล้วๆ ทำแล้วๆ หรือ ตอบกลับเขาตลอดๆ ให้ตัดจบไปบ้าง ว่า 'note ไว้ละครับ' แล้วมึงก็ไปเดินงานหลัก แล้ว ส่ง พร้อมกับที่เขา แจ้ง ตู้ม ทีเดียว"*
**What earned it:** one evening, Khwan's reports were answered one at a time — a fix, a confirmation, an explanation, each inviting the next message. **The thread never closed, the owner relayed all night, and both teams were interrupted per item instead of running a batch.**
▶️ **The rule: acknowledge and STOP.** **"note ไว้ละครับ" / "รับเรื่องแล้วครับ" — 🚫 no fix, 🚫 no explanation, 🚫 no progress update.** **Then go back to the main pipeline, collect the answers, and deliver them in ONE message when the work is actually done.**
🔑 **Five "fixed it" messages buy less than one complete delivery, and each one costs an interruption at both ends.**
⚠️ **The only things worth breaking the batch for:** **the customer is BLOCKED right now and a hand-step unblocks them**, or **they are about to act on something FALSE.** 🚫 **Everything else waits for the batch.**
**➕ 2026-10-06, the same rule made concrete: the owner CLOSES LINE and opens it only to deliver finished work.** *"ฉันปิดไลน์ละ รอเปิดแค่ตอนส่งงานจบงานอย่างเดียว"*
⇒ 🚫 **@Porter does not ask him to relay ANYTHING to the customer until a batch is finished** — **no questions, no acknowledgements, no progress.** **If something genuinely cannot wait** (the customer is blocked, or acting on something false) **@Porter says so explicitly and says why it cannot wait.** 🔑 *Every draft handed to him is a request to re-enter a conversation he has deliberately left.*

## 2026-10-06 — 🔴 A screenshot of a customer thread is NOT an intake. **Open the REQ before you believe it is new.** (@Porter, after doing the opposite)
**What happened:** the owner forwarded two LINE screenshots of Khwan's thread. **Porter recorded all six items as NEW, wrote a note, stopped @Fanta mid-task, and asked @Sober for three code-reads.** **Every single item was `REQ-111` A–F — intake 2026-10-02, closed the same day, ruled 10-02/10-03, and all but one SHIPPED to uat on 10-05. Khwan was REMINDING about one item; the owner capped the thread so Porter could read it.**

**Three distinct failures, worth separating because the fixes differ:**
1. **Treating a screenshot as an arrival.** A customer re-sends, reminds and quotes. 🔑 ***The date on a message is not the date of the requirement.***
2. **Misreading one word and building on it.** "ครั้งต่อ ๆ ไป" read as "ครั้งนี้" ⇒ an invented "per-session vs per-series" conflict ⇒ a false STOP on a correctly-sized task. 🔑 ***When one word decides whether a teammate's work is right or wrong, go back to the source text — do not re-type it from memory.***
3. **Recording "ITEMS 3 AND 4 ARE MISSING" when she had written "(เข้าใจแล้ว)".** 🔑 *Being careful in the wrong direction is still being wrong: it manufactured an open question against the customer's own closure.*

### The rule, for every role
▶️ **Before recording ANY customer item as new: grep the requirements folder for a distinctive phrase from it.** One command. **If it lands in a REQ, you are reading history — go and read what was ruled and what shipped.**
▶️ **Before stopping a teammate's work on the strength of a customer sentence: re-read that sentence IN THE REQ, not in the image.**
📌 **Cost this time:** a false stop on one engineer, three redundant reads asked of the SA who had built those very features, and an hour of two teams' uncertainty — **against one `grep`.**

### ✅ The part that justifies keeping the episode
**It surfaced a real collision nobody had seen:** `REQ-111 F` capped free pre-start absences **at the leave quota the customer bought** — **and `REQ-112` abolishes the quota.** ⇒ **the thing the cap counts against stops existing.** 🔑 *Two rules written four days apart now meet; the only question is whether they meet in a TASK or in the customer's data.*

## 2026-10-06 — 🔴 When a term means different things to us and to the customer, state the OBSERVABLE CONDITION, not the label (owner's catch)
**Trigger:** Khwan asked whether "คอร์สที่ยังไม่เปิดใช้" can take a free pre-start absence. **Our code's term is `courseNotStarted` = no session taught yet AND every remaining session today or later** — a condition that **expires by itself** when tonight's auto check-in runs. **Her "ยังไม่เปิดใช้" is a word about the course's state in HER business**, and her own screen carries a separate `Already in progress` control, so she has her own vocabulary for it.
**The owner, before anyone sent anything:** *"คำว่า 'คอร์สที่ยังไม่เปิดใช้' ของพวกเรา กับ ขวัญ คนละโลกกันชัวร์เลย."*
🔑 ***Agreeing on a sentence is not agreeing on a set.*** Both sides can answer "yes" about "a not-yet-started course" and mean different courses — and nobody discovers it until a real family's leave is spent.

▶️ **The rule, for replies AND for product copy:** when a term is ours, never hand it back to the customer as if it were shared. **Say the condition they can check on their own screen** — *"as long as no session on this course has been checked in yet"* — which is true under every reading of the disputed word.
📌 **Third instance of the same shape in one week:** `REQ-101/102` read as unruled because a header said `DISCUSSION`; the week label printed the size's floor rather than the real expiry; and this. **All three are a NAME that two readers filled in differently.**

## Leaves and the expiry — REQ-112 (Jason, 2026-10-06, TASK-656 §R — the customer's model, RE-AIMED the same night)
- 🔴 **A course's expiry gains ONE WEEK (7 days) for exactly THREE triggers — an EXPLICIT, CLOSED LIST (`LEAVE_WEEK_TRIGGERS`, `lib/course-plan.ts`) — and for NOTHING else. An ORDINARY leave, any door, any number, adds NOTHING and is still ONE make-up.** Her words, quoted in the code: *«ไม่จำกัดจำนวน — ลาได้ไม่จำกัดภายในอายุคอร์ส … ที่ขยายอายุคอร์สอัตโนมัติ 1 สัปดาห์ คือการที่เรากด cancel คลาส แล้วเลือก ปัญหาจากทางเรา ถึงจะเพิ่มให้นะคะ ถ้าลาปกติไม่เพิ่มให้นะคะ»*. **T1** an absence declared BEFORE the course starts (session button, plan editor — TASK-646) · **T2** a COACH's leave, per class (own or admin-recorded — and each SEAT's course when it cancels a group) · **T3** a school cancel carrying the reason `SCHOOL_ISSUE` «ปัญหาจากทางเรา» (a course session; a group-date cancel; the series cancel-all). Her numbers: a 13-week course, coach away twice ⇒ **15**; a 4-session/5-week course, one absence declared before the start ⇒ **week 6**.
- 🔴 **The three are a LIST, pinned BY VALUE — never a "whose fault" predicate.** *"The family didn't choose it"* reads right and gets **T1 BACKWARDS**: a pre-start declared absence IS the family's own choice and still adds a week. `addLeaveWeek(tx, courseId, trigger: LeaveWeekTrigger)` accepts only a member of the list, so a fourth trigger fails to compile and then fails a test (`leave-week-triggers-task656.test.ts`; mutations X1, P1). **🔑 A tidy summary standing in for the list the customer actually gave ("EVERY leave adds a week") is what produced a night of work on the wrong rule — see the paraphrase entry below.**
- ⚖️ **FIVE call sites, by trigger:** door 1 the session's *Record leave* (admin button AND the parent through LINE — one path) **only when `declaredFree`** (T1) · door 2 the plan editor's *Mark absence* **only when `declaredFree`** (T1) · door 3 the coach's leave, per class (T2), and its GROUP seats via `cancelSeatsOfGroup(…, {weekTrigger: "T2_COACH_LEAVE"})` · door 4 a school cancel of a course session **only when `reasonCode === SCHOOL_ISSUE`**, the row was LIVE or ATTENDED, and the re-plan did not put the make-up back in the SAME slot (TASK-551) (T3) · door 5 `cancelSeatsOfGroup`, **whose trigger comes from its CALLER** (coach leave ⇒ T2; group-date cancel and series cancel-all ⇒ T3 only for `SCHOOL_ISSUE`; any other reason passes nothing ⇒ +0). The reason is read from the CODE the caller passed — **never from the free-text note.** A course-session cancel now carries ONLY `SCHOOL_ISSUE` (stored on the row); every other code is still ignored there, so those cancels stay byte-identical. Migration `0065` carries the new value in `bookings_cancel_reason_chk`.
- 🔴 **`leaveUsed` is a plain COUNT of leaves taken, with NO limit** (schema comment: *"A plain count of leaves taken (REQ-112) — not a limit; nothing gates on it."*). `leaveLocked` is **always `false`** (field kept so the DTO shape does not change), `LEAVE_LOCKED` is never thrown, the *"quota full"* LINE line is gone (`leave_lockline` deleted). A pre-start declaration is still FREE (not counted). `canTakeLeave` has no production caller left.
- 🔴 **A make-up that lands PAST the expiry is CREATED — never held, never refused, and the expiry is NEVER silently stretched to fit it** (stretch-to-fit is gone). The admin is told instead (`TASK-657` §3) — her words: *«แจ้งแอดมินเท่านั้นค่ะ ที่เหลือเราจะจัดการเองว่าจะยืดอายุคอร์สให้ไหม»*.
- 🔴 **FORWARD-ONLY:** an existing course's expiry moves ONLY when a NEW trigger fires on it. Nothing recomputes an expiry on read, and there was no back-fill.
- 📌 **The writers of `course_packages.expiry_date` are exactly SIX** (pinned by function name in `leave-week-triggers-task656.test.ts`): `createCoursePackage` and `importCoursePackage` (both at BIRTH), `addLeaveWeek`, `updateCourseExpiry` (the admin's edit), `changeCourseStart`, `resumeCourse`. **The Undo is NOT one of them any more (TASK-657 §R, 2026-10-06) — it was the seventh until its expiry restore was deleted; its file is still read by the pin, so a restore that comes back fails with a name.** A new place that moves an expiry must fail that test, not pass review.
- 🔴 **The Undo NEVER touches the expiry** (TASK-657 §R). An ordinary leave never added a week; a declared day's week is not returned (the owner's 10-04 ruling); a coach's leave is lifted, not undone; a cancel cannot be undone. `expiryDecision`, `UNDO_EXPIRY_UNRECOVERABLE` (both sentences) and the `UNDO_LEAVE_CHARGE_UNKNOWN` refusal are DELETED — which ends REQ-114 (ii) (the self-block) BY CONSTRUCTION: two Undos in a row on one course both succeed. The preview and the answer carry no `expiry` field (the front never read it). `leaveUsed` goes −1 on a leave Undo **only when that leave was COUNTED** — a free declared day never incremented it, so there is nothing to give back (`leaveChargeOf` now answers `charged`/`free`; a legacy NULL row is counted). `booking_undos.expiry_from/expiry_to` stay as columns, written null — the history of the old rule is not rewritten.
- 🔴 **A make-up past the expiry tells the ADMIN — once per make-up, nothing extends** (TASK-657 §3 — the centre of her model: «แจ้งแอดมินเท่านั้นค่ะ ที่เหลือเราจะจัดการเองว่าจะยืดอายุคอร์สให้ไหม»). A NEW notice kind `makeup_past_expiry` beside `makeup_far_out` — **two different events** (the expiry crossed vs the search exhausted); one make-up can raise both. Asked by the CALLER after `reconcileCoursePlan` returns and **after its week decision** (so a make-up the new week covers raises nothing): door 1's own insert, and the four doors that re-plan (2, 3, 4, 5). The callers that deliberately do not ask are pinned by name: BIRTH (`createCoursePackage` ×2 — the expiry is born to cover its declared absences) and the Undo (it refuses if the re-plan would append). 📋 DRAFT copy, dd-mm-yyyy dates (the product's format).
- 🔴 **A FAMILY leave with no room before the expiry is REFUSED** (TASK-692 re-cut, owner ruling — supersedes "created past the expiry" for these two doors): `LEAVE_NO_VALIDITY` is thrown by `assertRoomForLeave` at door 1 (the session Record leave — admin button AND the parent via LINE) and door 2 (the plan editor Mark absence), AFTER the T1 week decision, inside the leave's own transaction ⇒ it rolls back: no status, no make-up, no count, no coach notice. The parent's LINE reply prints HER sentence (`leave_no_validity`, verbatim) ONLY on this code, and the admins get ONE `leave_refused_no_validity` notice (📋 DRAFT) sent AFTER the rollback by the webhook — an admin refused at their own door gets none. **A coach's leave (T2), a school cancel (T3) and any other cancel NEVER refuse** — the class is lost whatever we answer — they keep 657's `makeup_past_expiry`. Boundary inclusive (a make-up ON the expiry fits). No held state / retry / re-plan on extend: after the admin extends, recording the leave again just works. ⚠️ A 4-session course has exactly ONE week of room: its second ordinary leave is refused.
- 🔑 **In the expiry history, "actor NULL, +7 days" IS "one of the three triggers added a week"** — `addLeaveWeek` is the only call that records with a LITERAL null actor, and the trigger itself is NOT stored (no column, no sentinel). ⚠️ **Limit, stated:** `changeCourseStart` writes `actor ?? null`, and `actorOf` is null with no authenticated user (dev / `SKIP_AUTH` only) — in production the claim holds **by the auth layer, not by construction.**

## 2026-10-06 — 🔴 **A customer's rule is quoted, never paraphrased — and the restatement goes BACK to her before it becomes a ruling** (@Porter, after the second error on the same paragraph)
**What happened:** Khwan wrote her leave model in `REQ-112 §11`. **Porter restated it as "EVERY leave adds one week."** On that restatement: @Sober re-sized M → L · the owner ruled ("ALL FIVE doors add a week") · @Jason BUILT `TASK-656`. **Her actual rule:** *"ลาได้ไม่จำกัดภายในอายุคอร์ส … ที่ขยายอายุคอร์ส 1 สัปดาห์ คือการที่เรากด cancel คลาส แล้วเลือก ปัญหาจากทางเรา ถึงจะเพิ่มให้ ถ้าลาปกติไม่เพิ่มให้นะคะ."*
⇒ **The lever is not "a leave" at all. It is WHOSE FAULT the missed class was.** A commercial rule, not a scheduling one.

### The root cause, stated exactly
🔑 ***A paraphrase entered the chain and nothing downstream could tell it apart from the source.*** The SA, the owner and the engineer each treated "every leave adds a week" as the customer's requirement. **It was Porter's sentence.** 📌 **And it was the SECOND error on that same paragraph** — the first was telling @Sober *"nothing about the EXPIRY changes"*, corrected a day earlier. **Two errors on one paragraph means the paragraph is the problem, not the attention paid to it.**

### 🔑 What actually caught it, and it is the whole lesson
**The error was found when the owner sent Khwan a bubble DESCRIBING THE RULE BACK TO HER.** ⇒ ***The thing that caught it is the thing that should have come first.*** Done before the owner ruled, it would have cost one sentence and saved four days of design, one re-size, one owner ruling and one built task.

### The rules, for every role
1. **A customer rule that decides money, validity or entitlement is QUOTED VERBATIM in the REQ, and the TASK quotes the REQ — never a restatement.** A restatement may sit beside the quote, clearly marked as ours.
2. 🔴 **Before such a rule becomes an owner ruling, the restatement goes BACK to the customer as ONE sentence for confirmation.** Cheap, fast, and it is what caught this one.
3. **A paragraph we have been wrong about twice is never paraphrased again** — it is quoted, and the quote travels.
4. **When a rule is overturned, STOP the build the same hour.** Here `TASK-656` was already built; the stop went out before anything was re-ruled.

## 🔴 Bun: a test FILE that fails to load DROPS every test in it — read the log, not the summary (2026-10-06, @Fern via @Sober)
- **An error at module load** (e.g. importing an export that was removed) **does not fail a test: it skips the whole file**, prints one `unhandled error between tests` line, and the `pass` count is merely LOWER. **"0 fail" can sit on top of a deleted file.**
- **Rule: every engineer report and every SA verification states `unhandled-between-tests: N` from the log** (grep the full output). **N > 0 is a failure, whatever the summary says.**

## Front tests: `@/lib/ui/notify` is mocked by three dom tests for the whole run — assert on what `notify` was CALLED with (2026-10-07, Fanta, TASK-696)
- `extend-voucher-expiry`, `camp-week-lifecycle` and `line-admins` `mock.module("@/lib/ui/notify")` with a collector, and Bun keeps a mock for every file after. A test that asserts "the success toast is on screen" (via `<Notifications />`) therefore **passes alone and fails in the full suite**: seen 3 of 6, TASK-696.
- Fix: mock `notify` in the test itself with a collector and assert on `{ title, description }` — the same proof, and it cannot leak. Same family as the `@/lib/api/client` note (2026-10-05); the component also needs the SAME `ApiClientError` class the error was built from (`mock.module(..., { ...real, ApiClientError: RealClass })`) or its `instanceof` check drops the server's sentence.

## 2026-10-07 — Family notice on a course expiry change (`TASK-699`)
- **Only the ADMIN's expiry edit (`updateCourseExpiry`) tells the family**, kind `course_expiry_changed {courseId, from, to}`, inside the write's transaction, via `householdLineUserIds` + `enqueueParentCopies` (no account ⇒ one skipped row). **Longer and shorter: the same notice.**
- **Never told:** the automatic +1 weeks (`addLeaveWeek` T1/T2/T3 — they ride an event the family already hears) · a no-op (`from === to`) · an ENDED course · the coach/admins. **Not covered (outside the ruling):** `changeCourseStart`, `resumeCourse`, voucher expiry edits.
- Words: DRAFT until owner-approved (see `inbox/PM.md` 2026-10-07).

## 2026-10-07 — 🔴 **F-011 · F-012 · F-013 · F-014 are ONE failure: a fact taken from a NEARBY artefact instead of its SOURCE**
**Four failures logged by @Silver in one day, each filed as his own carelessness. They share a single root.**
| # | the fact he needed | where he took it from | the source it should have come from |
|---|---|---|---|
| F-011 | which test lines pin a sentence | **memory** | `grep` |
| F-012 | which counts a change breaks | **a prediction before the work ran** | the suite, run |
| F-013 | same | same | same |
| F-014 | the next TASK number | **`ls tasks \| tail`** | **the board's block line** |
🔑 ***Every one of these is a fact derived from something that happened to be nearby and usually agrees — until the moment it does not.*** **A folder listing usually gives the next free number. Memory usually lists the right pins. A prediction is usually right.** 🔑 **"Usually right" is the most expensive kind of wrong, because nobody checks it.**

### The rule, for every role
▶️ **Name the SOURCE OF TRUTH for the fact you need, and take it from there — even when something closer agrees.**
- the next TASK number → **the board's block line.** 🚫 never the `tasks/` folder.
- which pins break → **run the suite.** 🚫 never predict, 🚫 never recall.
- what the customer wants → **their own words, quoted.** 🚫 never a restatement, including your own.
- what is deployed → **the box.** 🚫 never a green suite.
📌 **And the same day, @Porter made the mirror of F-014: he issued the block AND approved all three out-of-block numbers, four times, without reading the line he had written himself.** ⇒ 🔑 ***A rule that only works while the person who wrote it remembers it is not a rule; the check has to live where the act happens.***

## 2026-10-07 — ⚖️ **A refusal no screen can reach ships with ENGINEER wording — listed, not approved** (owner ruling)
**Trigger:** `GROUP_SWAP_NO_SINGLE_SESSION` carried a "not approved" marker and had genuinely never been approved. **@Silver established from the code, not from memory, who could see it:** the screen no longer sends `onDate` on a group (`TASK-673`), and even if it did the front lifts `details` only for the student-phone case ⇒ **it reaches a raw API caller alone.**
⚖️ **RULE, both teams:** **a refusal that NO screen can reach ships with the engineer's words, recorded in the copy review as LISTED, not approved.** 🔴 **The day any screen CAN reach it, it returns to the approval queue — that is the condition, and without it this becomes a back door for words nobody read.**
🔑 **Why:** *every one of these was costing the owner a decision at 3 a.m. about a sentence no human being can see. One rule clears all of them and every future one.*
⚠️ **"No screen reaches it" is established by READING THE CODE PATH, never by assuming.** 🔑 ***"Nobody should see it" and "nobody can see it" are different claims, and only the second one earns this rule.***

## 2026-10-07 — 🔴 **An approval record must be VERBATIM. @Porter recorded his own rewrite three times in one day.**
**On `TASK-699` he rewrote the SA's drafted sentence while presenting it to the owner — dropped both `ค่ะ` from a PARENT-facing message, changed the opening and two words — then recorded his rewrite as the approved string.** **The code held the real draft, so the record and the shipped message disagreed.**
📌 **Caught TWICE, independently, inside an hour: @Sober by diffing the record against the code; @Tanya by reading the message a LINE account actually received on sid.**
🔑 ***The approval record is the only place a string is ever checked against anything. A paraphrase there is not a typo — it is the check itself being wrong.***
▶️ **Rule: a string being put to the owner is COPIED, machine-to-machine, from the draft or the code — never retyped, never tidied, never re-punctuated.** **If it needs改善, say so as a separate proposal; 🚫 do not improve it on the way past.**
📌 **Same root as `REQ-112 §11` and the `§11.4` quote lifted out of its case — three in one day, all "my sentence standing in for someone else's".**

## 2026-10-07 — ⚖️ **A DEADLINE IS A CEILING, NOT A TARGET. Finishing earlier is better.** (owner)
> **"เราคือทีมที่มีแผน มีเวลาจำกัด … แต่การทำให้เสร็จ การขึ้น deploy เรายิ่งทำได้เร็วกว่า dead line ยิ่งดี · เพราะงั้นเราไม่จำเป็นต้องทำให้เครื่องยนต์เราเย็นลง ถ้าเราสามารถรวบทำแม่งหมด ส่งศุกร์นี้ตู้มเดียวได้ ทำแม่งเลย … แต่เราแค่ต้องคุยกัน"**
🔴 **This CORRECTS how @Porter had been working.** **He had been treating "next round" as a parking lot and deferring work to protect a release date** — slid items stayed slid *because* there was a date, and the date became a reason not to finish.
⚖️ **IN FORCE:** **the deadline is the LATEST acceptable, not the plan.** **If the work can be bundled and shipped sooner, bundle it and ship it.** 🚫 **Do not cool the engine to respect a date that was never a target.**
⚠️ **The condition he attached, and it is the whole safety of this:** ***"แต่เราแค่ต้องคุยกัน"*** — **pulling work forward is a CONVERSATION with him, never Porter's own decision.** 📌 *Which is the same boundary as `ORDER`-style scope: nobody adds to a round on their own judgement, including the PM.*
🔑 **And it is not a licence to cram:** **the rules that bought the extra days still bind** — no QA step cut, no uat deploy without a sid pass, no team green alone, and 🚫 **nothing shrunk to fit a date.** *"Faster if we can" and "shrink it to fit" are opposite instructions.*
📌 **Style flexes per case.** **He said plainly this is not every case: "ไม่ใช่ทุกเคส นายต้องเข้าใจ การทำงาน มันพลิกสไตล์ได้บ้าง."** ⇒ 🚫 **Never carry a previous round's cadence into a new one as if it were a rule.**

## 2026-10-07 — ⚖️ **Mistakes are acceptable; unawareness is not. Report BOTH kinds to Atlas, continuously.** (owner)
> **"เรื่องความแม่นยำ ที่ทำให้งานมันเยอะ กินโทเคน ฉันไม่มีปัญหาเลย คนเราสามารถพลาดกันได้ แต่เราต้องพัฒนาตัวเองตลอด และต้องมีความรู้ตัวว่าตัวเองพลาดอะไร … ระหว่างทางเราเข้าใจผิดได้ แต่ต้องไม่ตื่นตระหนก ตื่นตูม ต้องเข้าใจและค่อย ๆ แก้ไขให้เข้าตาม Goal"**
⚖️ **Standing duty, every role:** **write to Atlas BOTH the things done precisely (the ones the owner praised) AND the things one judges to be one's own failures.** 🚫 **Not a post-mortem at the end — continuously.**
🔑 **The thing he values is not the absence of error; it is that the role can still NAME its own error while the work is running.** 🔑 *And the pairing matters: a report carrying only wins biases the person designing the system; one carrying only failures hides what is worth copying.*
🚫 **Do not panic at a mid-course misunderstanding.** **Understand it, correct toward the Goal, keep moving.**

## 2026-10-07 — REQ-115 make-up populations: the notes are NOT one (corrects `SPEC-REQ-115` §1)
- **Two creation notes:** reconcile append `คาบขยายอัตโนมัติจากการปรับแผนคอร์ส` · leave writer `คาบขยายอัตโนมัติจากการลา` (always linked at birth).
- **Two cancel notes overwrite them:** the trim `ยกเลิกคาบขยายอัตโนมัติ (ปรับแผนคอร์ส)` · the Undo `ยกเลิกคาบขยาย — ย้อนกลับการลา` (`undo.service.ts` `MAKEUP_UNDONE_NOTE`).
- ⇒ **An unlinked make-up that was trimmed matches neither status, link nor creation note.** Any "is this a make-up?" over history must include the cancel notes — and **a real-data read of every `ขยาย` note precedes any backfill** (`TASK-702` step 0).

## A make-up is a normal CONFIRMED class — the MARKER says it grew from a leave (Jason, 2026-10-07, TASK-702 / REQ-115)
- 🔴 **`bookings.is_makeup` (migration `0066`) is THE make-up fact. The STATUS no longer is** — a make-up is born `CONFIRMED` (through `applyConfirm`, the ONE confirm: `confirmedAt`, check-in token, freelance hold, coach-leave guard, the normal `booking_confirmed` to family and coach), in a PENDING course as well as a confirmed one. **Ask the right question:** *"is this a MAKE-UP?"* ⇒ read `isMakeup` (the plan engine's TRIM and `canInsert`, the history kind, the same-slot rule, `reowedForOf`, the front's «ขยายคาบ» badge); *"is it UNCONFIRMED / announced / live / paused / consuming?"* ⇒ keep reading the STATUS. The full per-reader table is pinned in `makeup-born-confirmed-task702.test.ts`.
- 🔴 **The TRIM removes the newest-dated LIVE MARKED make-up — never an ordinary class, whatever its status** — and, for a CONFIRMED one (announced at birth), tells the family and the coach with the NORMAL cancel notice. A legacy unconfirmed (EXTENDED) make-up is still trimmed silently.
- 🔴 **If the birth-confirm REFUSES (budget spent, coach on leave) the LEAVE still commits**: the make-up stays EXTENDED + marked and the admins get ONE `makeup_not_confirmed` (📋 DRAFT). Only an `ApiException` is a refusal.
- 🔴 **The migration backfills and VERIFIES ITSELF**: P1 `EXTENDED` ∪ P2 linked ∪ P3 the two birth notes ∪ P4 CANCELLED + the two cancel notes (the trim and the Undo overwrite the birth note) — all from ONE list (`lib/makeup-marker.ts`, pinned equal to the SQL). It counts `missed` / `extra` / `marked = expected` and a 4th `suspect` (a note mentioning `ขยาย` in no population) and `RAISE`s — rolling the whole file back — if any is off. **Never fix by hand on the box; never loosen the check; send the numbers to Sober.** The old code never reads the column, so a refused migration harms nobody. **Forward-only:** existing make-ups are marked, no status is changed.

## 2026-10-07 — ⚖️ **LINE-on-a-phone checks MAY be QA's now** (owner, via @Porter) — supersedes the routing rule above ("a LINE-on-a-phone check is never assigned to @Tanya")
**@Tanya runs LINE checks on the OWNER's machine** (first done: `TEST-082` §3, the registration address line). ⇒ a LINE-text check no longer needs the owner's own eyes **unless a task says why**. 🚫 Her rules do not change: she never messages real people, and every write on uat is still a DATA REQUEST.
