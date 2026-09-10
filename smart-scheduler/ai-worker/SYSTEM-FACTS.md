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

---

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
| **`end-of-day`** | 🔴 **18:30** | **The OWNER changed it himself**, 2026-08-29 (was 23:30, dating from 2026-08-01, until 08-28) |

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

## 🅿️ PARKED — LINE inbound stopped working when the customer moved from the demo OA to their own (2026-09-08)

**Symptom:** typing into the customer's OA produces **no `[line-in]` lines on `uat`**, where the same act on `sid`
produces them. ⇒ **inbound webhook events are not reaching `uat` at all.**

🔴 **The timeline is the evidence, and it is the customer's own words via the owner:** *"ตอนแรกของเขาก็ใช้งานได้
อยู่ แต่เหมือนอยู่ ๆ ตอนเขาแจ้งว่าเปลี่ยนจากที่เคยต่อ demo ไปต่อตัวจริงแล้วนะคะ ก็ใช้ไม่ได้เลย"*
⇒ **It WORKED, then stopped AT THE MOMENT THEY SWITCHED OA.** **Nothing we deployed sits at that boundary.**

**Four candidates, in the order worth checking — the third is the one that fits their own stated goal:**
1. The **webhook URL** on their LINE console does not point at `uat` *(they were told to switch it there to test;
   it may never have been switched, or was switched back)*.
2. **`Use webhook` is OFF** in LINE Official Account Manager — **a separate switch from the URL.**
3. 🔴 **The OA is in CHAT mode rather than BOT mode.** **LINE sends no webhook at all in chat mode**, and **the
   customer's stated intention is that admins answer in the same account** — so this setting is exactly the one
   they would have reached for.
4. `uat` logging at a different level from `sid` — cheap to rule out, last.

⚠️ **Consequence while it stands: NOBODY can link on the customer's OA**, which means **inbound LINE is dead
there and nothing can be verified through it.** 📌 **OUTBOUND is unaffected** — notifications ride the channel
token, not the webhook. ⇒ **silence at 08:00/08:15 would prove nothing about the message code.**
🅿️ **Owner's call, 2026-09-08: parked pending the customer's answer.** *"ช่างมันเถอะ รอเขามาตอบ … อันนี้ค่อยดู"*
**It is a setting on their console, not a defect in our build.**


---

## ⬅️ MOVED FROM `board.md` 2026-09-08 (hygiene: board was 44KB > 40KB). VERBATIM, nothing dropped.
These are standing rules, so this file is their home; the board keeps a pointer where they used to sit.

### 🚦 DEPLOY RULES (standing)

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


### 🔴 MIGRATION CHECK — before every single deploy. No exceptions.

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

### `zValidator` answers directly — `app.onError` is NOT on the validation path (2026-09-08)
`routes/api.ts` uses `@hono/zod-validator` on every validated route **with no error hook**. On a refusal the
validator **responds itself**, so `app.onError` (`index.ts:55`) — which maps `ApiException`, `23505` and `23503`
to Thai sentences — **is never reached**. The `ZodError`'s `.message` is the **JSON-stringified issue array**,
regex source included, and the FE correctly renders `e.message`.
⇒ 🔴 **Every 400 in the product, on every screen, has always reached the admin as a raw array.** Unseen only
because forms normally gate the button.
🔑 **A handler that is not reached is worse than a missing one: it looks handled.**

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

### A `DONE` board row can outlive its code — the window between review and commit is real (2026-09-08)
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

### Rule-green + wiring-red is a LOST edit, not a bad change (2026-09-08, @Fern, TASK-295)
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

## ✅ SOLVED 2026-09-08 (owner) — LINE inbound was dead because **`ecosystem.cjs` HARD-CODED the demo LINE credentials on `uat`**
🔴 **UNPARKS and CORRECTS the section above.** **I wrote there: *"It is a setting on their console, not a defect
in our build."* THAT WAS WRONG. It was ours, on our server.**

**The owner's finding:** he changed `.env` on `uat` and **the value did not change**. Logging showed the process
still holding the **demo** channel secret + token. **`pm2`'s `ecosystem.cjs` had the LINE credentials written
into it literally**, so the `env` file was never consulted. ✅ **Fixed to read from `env` always.**
🔑 **Why the symptom looked exactly like a customer-console problem:** inbound webhooks are verified with the
**channel secret**. **With the DEMO secret loaded, every signed request from the CUSTOMER'S OA failed
verification and was dropped** ⇒ **no `[line-in]` lines, no error anyone would notice, and the failure appeared
at the exact moment they switched OA.** **All four of my candidates were on their side. None of them was it.**

### 🔴 CONSEQUENCES that do NOT go away with the fix — check these before trusting anything LINE on `uat`
1. **OUTBOUND on `uat` was riding the DEMO token.** ⇒ **anything `uat` sent went to the DEMO OA's users, not the
   customer's.** **The customer's parents received NOTHING from `uat`, and the demo OA may hold real messages
   about real students.**
2. 🧊 **PENDING DEPLOY item 5 was frozen on a FALSE premise** — its note says *"the server now points at the
   CUSTOMER'S OA"*. **It did not. It pointed at demo.** ⇒ **the three unknowns behind that freeze must be
   re-asked, not resumed.**
3. **Which OA holds the six rich menus?** `publishRichMenus` uses the **token** ⇒ **they were published to
   whichever OA the token named.** **The 09-05 phone confirmation was on the owner's demo OA.** ⇒ **the
   customer's OA may have NO menus at all**, and *"the menus exist"* is unverified there.
4. **`family_line_links` rows written from `uat`** carry userIds **scoped to the DEMO provider** ⇒ **they may
   match nothing on the customer's OA.**

📌 **The lesson worth keeping: a value in TWO places, where one silently wins, is invisible from the outside.**
**Everyone could read the `.env` and everyone was reading the wrong file.** ⇒ **the same class as the two Thai
sentences and the two live-status lists we hit the same week.**

### ✅ ALL FOUR CONSEQUENCES CLOSED, same day — I over-escalated them and the owner closed each one
**Recorded because the escalation is on the record above and must not outlive its answer.**
1. **Outbound rode the demo token** — **TRUE and HARMLESS.** **Inbound was dead, so NOBODY was ever linked on the
   customer's OA** ⇒ **no parent was waiting for a message that never came**, and what `uat` did send went to
   the owner's own demo test accounts. **Nothing to fix.**
2. **The frozen item-5 note states a false premise** — **a document correction, not work.**
3. 🔑 **"The customer's OA may have NO menus" — TRUE, AND IT IS THE INTENDED STATE.** **The owner removed them
   deliberately on 09-08 with the team's `line:remove-menus` tool**, because *"ลูกค้าบอกให้เอาออกก่อนเพราะกลัว
   ลูกค้าเขาเห็น ยังไม่พร้อมใช้งาน"*. ⇒ **absence is the decision, not a symptom.**
4. **`family_line_links` rows are demo-scoped** — **TRUE and inert: nothing to collide with, since nobody had
   linked on the customer's OA.**
🔻 **The lesson is mine: I derived four consequences from one true mechanism without checking any of them against
what we had already DONE ON PURPOSE.** **Item 3 was an instruction I carried myself, eight hours earlier.**
⇒ **a consequence chain is a hypothesis list, and I presented it as a findings list.**
🟢 **LINE inbound on the customer's OA is WORKING — the owner's screenshot: `สมัคร` → the bilingual entry message
with `ผู้ปกครอง · ครู · แอดมิน`. Nothing is outstanding from this fix.**

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

### Two overrides of the leave lock already exist, and they are not interchangeable (2026-09-08)
1. **`adminUnlocked`** — the `admin_unlocked` column, `updateCourse`, `useSetCourseAdminUnlock`, the buttons on
   the course card ⇒ **unlocks THE COURSE, standing, until re-locked.**
2. **A per-change `override: boolean`** — `validation.ts:316`, enforced at `scheduler.service.ts:2319`
   (`if (!change.planned && !change.override && leaveLocked) throw LEAVE_LOCKED`) ⇒ **one absence pushed past the
   lock, the lock still standing.**
🔑 **"Can an admin override the lock?" has two different yeses. The difference is whether the NEXT leave is also
free.** 📌 Recorded as a fact rather than a pending decision — `REQ-085 §11.1` was withdrawn (it was a
misreading; the owner meant moving the EXPIRY), and **neither mechanism is to be changed.**

### "Already built" is the MIDDLE of a triage, never the end (2026-09-08)
Twice in one batch a requirement named something that already existed, and **both times the report was real:**
- **`REQ-085 §1`** — `plannedAtCreation` worked perfectly **and the screen still refused him**: the blocker was
  the WEEK CEILING, not the quota.
- **`REQ-085 §11.2`** — the expiry editor exists **and is inert for the purpose he asked for it** (see above).
🔑 **The question is not *"does this exist?"* but *"does it do the thing they want it for?"*** ⇒ **the second
question is answered by their stated REASON**, which is why quoting the requester verbatim is what makes this
findable. **What a person can see is a SCREEN; what changed is a RULE.**

### The question is not "stored or derived" — it is **"is there an ACT that can move one without the other?"** (2026-09-08, @Jason)
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

### The PREVIEW and the SAVE place creation-time make-ups in DIFFERENT weeks (2026-09-08, @Jason, TASK-300)
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

### A source sweep can ask the SHAPE question; only a request can ask the REACHABILITY one (2026-09-08, @Jason)
✅ **Mechanical:** every `c.json({ error: … })` in the routers carries both a `code` and a `message` — source-read,
because *"a route no test requests still ships"*. **The `35 = 35` shape.**
🔴 **Invisible to it, and written into the test so nobody trusts it too far:** a Response built in a helper ·
`new Response(...)` · `c.text`/`c.body` with an error status (**the ICS route is deliberately one**) · and **a
library answering before our code runs — which is exactly what DEF-5/TASK-296 was.**
🔑 ***"No source sweep would have found TASK-296"*** — that needed a route-level assertion that made the request.
📌 **Conflating the two questions is how a sweep that looks complete lets the next one through.**

### `c.notFound()` dispatches to the APP's handler — adding `app.notFound` silently changes every route that used it (2026-09-08, TASK-297)
The ICS route (`routes/calendar.ts`) deliberately answers a calendar client with Hono's plain-text 404. Adding an
app-level `app.notFound` envelope **switched that route to JSON as a side effect**, invisibly: no test, no error,
a client quietly ignoring a body.
✅ **It now writes its own `c.text("404 Not Found", 404)`** — **byte-identical output, changed in order to
PRESERVE it**, and pinned against the next app-level edit.
🔑 **And why nothing looked wrong from the inside: a 404 is not a thrown error, so `onError` was never a fallback
for it — the two are siblings, not a chain.**

### The stretched ceiling drops the quota's week — `plan end + quota weeks` is the promise (2026-09-08, TASK-301)
`courseExpiry(start, size)` = `start + (maxWeekFor(size, quota) − 1)` weeks ⇒ for size 4, **week 5**, while an
absence-free plan ends at **week 4**. 🔑 **The base ceiling always encoded *plan end + quota weeks* — that one
week of headroom IS the quota.**
🔴 `courseBornCeiling` stretches from `lastPlanned` by the **absences only** ⇒ on a 4-session course with 3
declared absences the plan ends week 7 and the ceiling is week 7 ⇒ **zero headroom, and the card's `Leave 0/1`
cannot be used.** **`§10` gave unlimited absences at creation and removed the leave the family had afterwards.**

### A refusal that prints a number the check did not use (2026-09-08)
`scheduler.service.ts:2230` compares against `course.expiryDate` (the real ceiling); `:2233` prints
`MAX_WEEK_BY_SIZE[course.size]`. ⇒ **refused at week 7, told "week 5".**
🔑 **It did not merely confuse an admin: it sent the PM to a wrong diagnosis** (*"the after-creation path uses the
OLD limit"*) **and nearly bought a task for a defect that was not there.**
📌 **Same class as DEF-3 and the two `startTime` formats — one value with two sources.** ⚠️ **An error message is
a derived value like any other, and nothing tests it against the branch that raised it.**

### Reading tells you what CAN happen; only running tells you what DOES (2026-09-08)
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

### TASK-300 CONFIRMED by gate, then fixed: the make-up anchor must be the last PLANNED session (2026-09-08)
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

### A reconstruction pinned to the source is the strongest evidence available here — and it is weaker than a click (2026-09-08)
Placement lives inside a DB-bound function and **no agent in this workspace touches a database**, so the test
reproduces those lines and **asserts the source still contains them**. A source mutation therefore fails the
**pin**, not the placement assertions.
🔑 **@Jason wrote that limit into the test file rather than into a report:** *"a reconstructed test that stops
describing the code it names would be worse than no test."*
⚠️ **When reporting such a result upward, say which it is.** A reconstruction can reproduce a defect the real
code does not have, if the reconstruction is wrong; **the pin is the only thing standing between those two.**

### The ceiling promise, stated once: **plan end + remaining leave quota** (2026-09-08, TASK-301/302)
`courseBornCeiling(base, lastPlanned, absences, quota)` — the absences move the plan's END; the quota's weeks sit
BEYOND it; still `max(base, …)` so a short plan keeps its full window. **Quota via `courseLeaveQuota`, so an
off-card size answers with its own allowance instead of falling through to zero.**
🔑 **The check that proves the TERM rather than the ROOM:** an absence-free size-6 course ends week 6, ceiling
week 8 = `courseExpiry(start, 6)` — **the two agree by arithmetic, not coincidence.** *A `+ 7` that merely made
tests pass would fail this.*
⚠️ **Two paths do NOT keep the promise:** **a re-plan** (`replanExpiry` sets the expiry to the last session
exactly ⇒ zero headroom — **TASK-302**), and **an admin edit**, which is a deliberate exception and correct.

### Break-it-and-watch has a second half: which tests must NOT fail (2026-09-08, @Jason, TASK-302)
Mutating the remaining-quota term made the resumed-course assertions fail — **and the *"quota SPENT"* test kept
passing, correctly**: with nothing remaining, the two builds agree.
🔑 ***"A mutation that broke it too would have meant the term was doing something other than what it claims."***
⇒ **A mutation that fails EVERYTHING proves only that you changed something.** **Naming the tests that must stay
green is what proves the change is the one you described.**

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

### Answer "assert that X agrees with Y" by deleting one of them (2026-09-09, @Jason)
TASK-298's DoD asked the expiry PREVIEW and the PATCH to return the same warning, **asserted by comparison**.
He instead made disagreement impossible: `expiryDecision(id, date)` loads once and both callers read it, with
**exactly one `expiryImpact(` call in the service, asserted by count.**
🔑 **A comparison test proves they agree TODAY; one call site means they cannot diverge.**
📌 Same move as `lib/validate.ts` owning the `@hono/zod-validator` import (TASK-296) — *"covered by construction,
not by memory"*. ⇒ **when a DoD asks for agreement between two derivations, the better answer is usually one
derivation.**

### The acts with NO preview are `sick-leave` and `resume` — the two highest-frequency dates the system picks (2026-09-09)
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

### The line for `REQ-086`: not acts that WRITE, but acts where the SYSTEM decides something the person is held to (2026-09-09, @Jason)
🔑 **A date a family is told about is exactly that.** ⇒ it explains why the preview list above splits so cleanly,
and it says what a message editor's preview must cover: **not every save — every place the product commits
someone to something they did not choose.**
📌 Sharpens @Porter's `REQ-086 §2` refusal (*no editor without a preview*) into a test for WHICH previews.

### A test that fails because a requirement changed is not a wrong test — it is a test in the WRONG PLACE (2026-09-09, @Jason)
TASK-284 made the course `CONFIRMED SCHEDULE` **language-invariant** (`TH` and `EN` render byte-for-byte the
same), which broke two tests asserting `th !== en` on it.
🔑 **He found what they were FOR** — a **proxy** for *"the language switch still switches"* — **moved the proxy to
`booking_confirmed`**, whose `ob_l_*` labels are genuinely bilingual and byte-frozen, **and asserted the real
property in their place**: no notification renders both languages.
📌 **Seven tests in total were pinning the Thai weekday or `ไม่มี`; all corrected with their reason, none
deleted.** ⇒ **before deleting a failing test, name the property it was standing in for.**

### The course `CONFIRMED SCHEDULE` is language-invariant BY RULING (2026-09-09, TASK-284)
Every piece is a label, a value we generate (`TEMPLATE_LANG = "EN"`, `TEMPLATE_NONE = "(-)"`), or a human's own
words ⇒ **`TH` and `EN` are byte-identical, asserted**, so a translation creeping into any of them fails.
🚫 **A human's words are never translated:** a student's Thai name and the admin's Thai `Remark` are reproduced
exactly as typed (`REQ-085 §8.2`). 🔑 *Translating a Remark is putting words in an admin's mouth.*
⚠️ **`§7.1` has TWO OPPOSITE empty-field rules in one message** — `Advance Leave Notice` always prints `(-)`;
`Remark` is absent entirely. **Asserted three ways, including a case with both empty.** *A single "empty fields"
test passes through the swap.*

### `Coach` on a course summary is the earliest session's teacher, and nothing says it must be the only one (2026-09-09)
| field | source | can rows differ? |
|---|---|---|
| `coach` | `rows[0]?.teacher` | 🔴 **yes** — `createCoursePackage` accepts a per-session `teacherId`, and `planChange`'s `move` accepts one |
| `subject` | `rows[0]?.subject?.name` | ✅ **no** — a mixed course is refused in the zod refine AND again in the service (SPEC-045 / TASK-138) |
🔑 **The product has already decided `Program` is a promise and `Coach` is not, and nobody chose that.**
⚠️ **Unlike a missing note, a wrong coach does not look empty — it looks confidently right**, which is harder to
notice. 📌 **Raised to the customer via @Porter as a question (main coach? several? enforce one per course?),
not cut as a task — the answer is theirs, not ours.**

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

### Seven statuses reach the COMMAND schedule; two are our words, not a coach's (2026-09-09)
The query excludes `CALENDAR_HIDDEN_STATUSES` (`CANCELLED`, `PAUSED`), so **seven of the enum's nine can appear.**
✅ Plain: `Pending` · `Confirmed` · `Attended` · `Leave` · `No-show`.
🔴 **`Extended`** — our word for our mechanism (*a make-up appended because someone took leave*), **and the
commonest non-obvious row on the list.** 🔴 **`Awaiting move`** — does not say **who** is being waited on.
⚠️ **The reader is a TEACHER, not a parent**, which makes `Extended` more defensible here than it would be on a
family's message. **Raised to the customer as wording, not cut as a defect.**
📌 **`PAUSED` has a label for a row the query can never render** — the mirror of TASK-271, where a row rendered
its own key because no label existed.

### A shape assertion catches changes a byte pin was not written for (2026-09-09, @Jason)
TASK-304 asserted AUTO as *"the message with the note IS the message without it, plus one line"*. When a
mutation made `Remark` fall back to `(-)`, **that assertion fired too** — catching a wrong string as a **layout**
change.
🔑 **Stronger than a byte pin, because it survives the field being added and still fails on changes nobody
predicted.**

### The bilingual proxy is retired: assert the property, not a symptom (2026-09-09, TASK-304)
The `th !== en` proxy moved three times in one night as each `§7` format made another notification invariant.
✅ It now sits on `tb("children_none")` — a CONVERSATION reply — **and stopped being a proxy at all**: it asserts
`tb()` composes **one string containing both `t(key,"TH")` and `t(key,"EN")`**, which is the bilingual property
itself. 🔑 **`§7.4` cannot move it.**
📌 **The general form: when a proxy keeps moving, the fix is not a better location — it is asserting the property
the proxy was standing in for.**

### A feature behind a default-off setting is indistinguishable from a feature nobody wrote (2026-09-09, TASK-305)
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

### FOUR writes set `SICK_LEAVE`; only one notifies (2026-09-09)
| path | notifies | verdict |
|---|---|---|
| `scheduler.service.ts:1703` declared at creation | ❌ | ✅ fine — the leave predates the course; the teacher has not been told of the class either |
| `:2382` **the plan editor's `mark-absence`** | ❌ | 🔴 **the hole — a FUTURE session, the same act, a different door** (TASK-306) |
| `:2749` attendance correction `ATTENDED → SICK_LEAVE` | ❌ | ✅ fine — the class already happened; a notice would be about the past |
| `:2810` `updateBookingStatus` `sick-leave` | ✅ | the `LEAVE NOTICE` |
🔑 **A teacher told SOMETIMES is worse than never: never is a gap people work around; sometimes is a promise that
fails silently.**

### `bunx tsc` is broken on this machine — use a pinned version (2026-09-09)
`bunx tsc --noEmit` panics with `bundled: …/@typescript/typescript-win32-x64/lib/lib.d.ts does not exist` — a
`typescript-go` preview binary whose temp install was cleaned. **It is a toolchain fault with no relation to the
code, and it exits 2.**
✅ **`bunx --package typescript@5.6.3 tsc --noEmit` works** (exit 0). ⚠️ **There is no local `typescript`
dependency in `smart-scheduler-back`**, so there is no `./node_modules/.bin/tsc` fallback.
📌 **An engineer's `tsc 0` can be TRUE and unreproducible an hour later. Check the failure's SHAPE before
reading it as a code defect.**

### A sweep whose SCOPE is hand-written is only as complete as somebody's memory (2026-09-09, @Jason)
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

### `sick_leave` and `leave_teacher` are dead as PRODUCERS and live as CONSUMERS until the queue drains (2026-09-09)
TASK-305/306 replaced both with one `leave_notice`, so **no non-test code enqueues either kind** — *"exactly the
shape that makes dead code look alive"*.
🔴 **They are NOT removable yet:** `outbox.service.ts:78` renders `row.payload` **at SEND time**, so any row
already queued with those kinds still needs its branch.
✅ **RULING: keep the renderers, keep the "re-wiring fails loudly" assertions.** **They become removable after a
deploy plus a drain — not before.**
⚠️ **Constraint for `REQ-086`: a template kind nothing sends must NOT appear as an editable row** — the same
defect as a setting nobody reads, one layer up.

### `REQ-085 §5`'s entry copy is with the CUSTOMER — no engineer may write it (2026-09-09)
`§5`'s MECHANISM is settled (no role list; teachers and admins type a phrase — an undocumented door), but the
**wording is unsettled and the REQ says so explicitly**: *"No engineer may implement this text."* The customer's
words win **verbatim**, per the `REQ-079 §17b` precedent.
⏸️ **Still owed by @Porter: the admin phrase (proposed `แอดมินเอง`) and the parent-certainty wording.**
🔑 **`§6` (no SKIP past having a child) is the buildable half** — and TASK-307 asserts `§5`'s prompt stays
**byte-identical**, because a stray diff there is invisible to us and visible to the customer.
📌 **The precedent for the discipline: `Date : อังคาร` shipped after `REQ-079 §18` had already ruled labels
English — an engineer's sentence outliving a ruling nobody re-read.**

### The registration flow honours "conversation is bilingual" WITHOUT `both()` — it answers in the session's language (2026-09-09)
`line-webhook.service.ts` uses **`t(key, lang)` 39 times against `both()` 13 times**, and
`add_student_name_prompt` is called **five** times — four with `lang`, one (a new re-ask) with `both()`.
🔑 **`both()` is for a reader whose language is not known; inside a session it IS known.** ⇒ **`REQ-079 §18` is
satisfied by answering IN the parent's language, not by composing both into one message.**
🔻 **My TASK-307 §3 told the engineer to make a re-ask bilingual, without checking the flow's convention** — which
would have left one sentence rendering in two forms depending on how a parent arrived at it. **He flagged it
rather than choosing; corrected to `t(…, lang)`.**
📌 ***An instruction about a CONVENTION must be checked against the convention.*** **Second time in one day an SA
instruction was refuted by the code it was about** (the first: a DTO-formatting task that `contract.ts` forbade).

### A parent account can be CREATED empty by abandonment, and cannot BECOME empty (2026-09-09, TASK-307)
| road to a usable-looking childless account | reachable? |
|---|---|
| 🔴 **abandoning registration mid-way** | **YES, and it is the widest road** — `ensureParentByPhone` (`parent.service.ts:66`) creates the `parents` row **at LINK time, before any child.** **Nobody types anything, so `§6`'s "no skip" cannot touch it.** |
| 🔴 **blocking and re-adding the bot** | **YES** — the link persists, so re-adding lands on the same empty parent. Road 1 by another exit. |
| ⚪ **an admin creating a parent** (`POST /parents`) | **YES, deliberately** — a household may be registered before its children. Not a defect. |
| ✅ **a child DELETED later** | **NO** — there is no student delete route and no archive flag ⇒ **an account cannot BECOME empty.** |
🔑 **So `§6` is complete for its own shape.** ⚠️ **The gap is abandonment, and the remedy is a different shape:
*not a refused word — something that notices an account has sat childless.*** **How long is "sat", and who is
told, are the owner's questions.**

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

### An editor must list templates that are ENQUEUED, not templates that RENDER (2026-09-09)
`sick_leave` and `leave_teacher` still have renderers because a queued outbox row needs them, while no code
enqueues either. ⇒ **an editor built from the renderer list would offer the customer two messages the product no
longer sends** — *edited, and never seen.*
🔑 **Derive that list rather than hand-writing it** — a hand-scoped sweep is only as complete as somebody's
memory, and here it is wrong in the more embarrassing direction.


---

## ⬅️ MOVED FROM `board.md` 2026-09-09 (hygiene: board over 40KB). VERBATIM, nothing dropped.

## Project info

- Scheduling + back-office ERP for a balance/wheeled sports activity centre. Repos by logical name:
  `smart-scheduler-back` / `-front` / `-backoffice-back` /
  `-backoffice-front` (+ `smart-scheduler-requirement`). **Absolute paths on this machine are in `machine.local.md`
  at the workspace root** — never in a committed file.
- 🔴 **STANDING RULE (owner, 2026-08-28): `develop` is the CANONICAL central branch in every repo.** `dong`/`dong2`/
  `dong3` are no longer the reference. **Another team also builds on `develop`** — before speccing anything on
  shared ground (calendar, course card, cell, expiry, LINE), **read what `develop` already does**
  (`git show develop:<path>`) and re-apply only what is genuinely missing. Never build against a remembered tree.
  *(08-28: merged — front `dong`≡`develop`≡`origin/develop` @9ec5d35, back @d901dc7; one tree with our REQ-052/068
  cell + the TASK-191 toggle fix; only `hasRental` (TASK-190) was missing.)*
  - `smart-scheduler-back` — scheduling API, Bun + Drizzle, **:4006** → Jason
  - `smart-scheduler-front` — staff calendar UI, Next.js, **:3016** → Fern
  - `smart-scheduler-backoffice-back` — finance API, **`bo` schema on the shared `smart_scheduler` DB**
    (`ops` RETIRED by REQ-006 / TASK-027), **:4010** → Jason
  - `smart-scheduler-backoffice-front` — admin money UI, Next.js, **:3018** → Fern
- **Read first**: `ai-worker/SYSTEM-FACTS.md` (owner-stated system behaviour), then
  `project-understanding.md` (as-built map, rewritten 08-01), then the monorepo root `CLAUDE.md` and
  `docs/` — newest wins. Docs calling this a "tutoring school" are wrong; it is a sports business.
- DB: one PostgreSQL — `public.*` (scheduling) + `bo.*` (finance). Reading schema from the Drizzle files is fine;
  the DATA REQUEST rule covers **real data and live environments**.
- Team: Porter (PM/BA) · Sober (SA) · Jason (BE) · Fern (FE) · **Tanya (QA)**.
  - **QA trial, this project only.** Tanya talks to Porter only; tests on **local + `sid`** (never `uat`); owns
    `IN_TEST` / `TEST_PASSED` / `TEST_FAILED`. A REQ is `DELIVERED` only after a `TEST_PASSED` **and** a post-deploy
    re-check. She **may create test data on `sid`**, declaring and retiring the footprint in the TEST file.
  - 🧪 **QA verdict history 08-04 → 08-28 — parked verbatim** in `archive/board-2026-08-29-parked-notes.md`;
    evidence in `tests/TEST-055…TEST-060`. Verdicts exist, in board order, for: REQ-071 · REQ-072 · REQ-036 ·
    REQ-063 · REQ-064 / TASK-168 · REQ-046 · REQ-047 · REQ-049 / TASK-152 · REQ-044 · REQ-043 · REQ-048 · REQ-054 ·
    REQ-053 · DEF-5 → REQ-056 · DEF-3 → REQ-041 / TASK-090 · DEF-1 · TASK-129 · TASK-128 · REQ-030 ·
    REQ-037 / TASK-124 · REQ-038 / TASK-099 · REQ-024 · REQ-026 · REQ-020 · REQ-022 · REQ-009.
  - ✅ **LINE test recipient — CLOSED 2026-09-01** (open since 08-04). The owner linked **himself** on `sid` as
    teacher **Bank**; outbound LINE is testable, and AC-16 was fired from it the same day (`tests/TEST-064`
    §Round 3). The rule that the **2 real teachers are never messaged in rehearsal stands unchanged.**
    🔴 **Still short one thing:** only **ONE** recipient is linked, so *"every assigned teacher gets it"*
    (REQ-078 AC-16 revised) **cannot be proven** — a second linked device/teacher is needed.
  - 🔴🔴 **BLOCKING NOW (QA, 2026-09-06):** **the `sid` session harness will not run on this machine.** The minted
    cookie expired with the deploy; re-minting (`mint-session.mjs`, TASK-090) needs the owner's access file and the
    API login, and **QA's tooling refused that step — twice.** `sid` itself is UP (`/login` 200, `POST
    /api/auth/login` → 400 from the backend's own validator). ⇒ **the whole REQ-076/082/083/084 round is
    `NOT_TESTED` for an ACCESS reason, not a product one**, and since **`uat` is read-only**, every write-shaped
    AC is proven on `sid` or nowhere. **`tests/TEST-066-…` is open as a PLAN only** — `NOT_TESTED` on every line, no verdict in it, and it may not be quoted as evidence.
  - ✅ **CLOSED 2026-09-07 — backoffice access GRANTED** (owner: both `sid` hosts, full). QA authenticated via
    the API, never the login form. **28 items / 75 movements read.** It immediately closed `REQ-083` AC-6 and
    `REQ-076` AC-4, and proved `REQ-082` AC-5 against the ledger instead of by inference.
  - 🔴🔴 **DEF-2 (QA, 2026-09-08) — RELEASE-BLOCKING. Course RESUME regenerates the plan.** Reproduced twice on
    fresh 4-session fixtures: **4 rows → 4 (all flipped `CANCELLED` by pause) → 8 (originals + a brand-new plan).**
    🎯 **Isolated: PAUSE does not duplicate; RESUME does** — but pause writes the TERMINAL code `CANCELLED`, so
    resume has no plan to restore and builds one. Course history shows 4 `cancelled` then 4 `scheduled` events.
    🔴 **Second, worse half: the new plan starts from TODAY, not the course's own slot** — a course sold for
    `2026-11-11` came back as `2026-09-09`, and **this week's calendar now shows November sessions.**
    🟢 **NOT a money defect: exactly one `SALE` per course, pause/resume wrote nothing; entitlement intact.**
    Reproduction left live: course `dd78bd1e-…`. `tests/TEST-066` → DEF-2. @Sober.
  - 🔴🔴 **DEF-5 (QA, 2026-09-08) — RELEASE-BLOCKING. Course RESUME cannot be completed through the UI.**
    `Resume the course` renders a raw Zod error: the FE submits `startTime: "10:00:00"` where the API requires
    `HH:mm`. **Fails on the form's defaults AND on a hand-typed value** — the dialog holds a HIDDEN third input
    still carrying `10:00:00`, so the field the admin edits is not the field submitted. 🟢 **Server is innocent:**
    `POST /courses/:id/resume {startTime:"11:00"}` → **200**. ⚠️ The admin is shown a REGEX, not a message.
    ⇒ **a paused course can only be recovered by a hand-made API call.** `tests/TEST-066` → Round 13. @Sober.
  - ✅ **Pause-dialog COUNT fixed (QA, 2026-09-08)** — dialog says 6 against a 7-row plan (`ON LEAVE` correctly
    excluded); every counted row is visible on the same screen. The `9`-against-`5` defect is closed.
  - ✅ **DEF-1 CLOSED 2026-09-08 (QA).** Post-redeploy retest: `?status=PAUSED` → **200** *(was 400)* and the
    tray on screen reads **`Paused bookings | 1 | KKTEST | 1 HR | Was: 08/Oct/26 16:00`**. **Verified BOTH via
    the API and on screen** — a 200 with an empty array would have read identically. ⇒ **`REQ-076` AC-1, AC-9
    and AC-12 all PASS.** The empty state is honest again. **Nothing from QA holds `uat`.**
  - ✅ **`REQ-083` AC-5 · AC-7 · AC-9 PASS (QA, 2026-09-08).** A swept `1 HR` posted **฿1,390**; undo wrote **one**
    `REVERSAL −139000` beside an unedited `SALE`; **the replay wrote nothing.** 🟢 **`end-of-day` DOES run on
    `sid`** — answered from movements, not `job_runs`.
  - 🔻 **QA RETRACTION (2026-09-08):** the 09-07 claim *"no movement is tied to a booking"* was **FALSE**.
    `postBookingSale` writes `refType: "SALE"` with `refId` = the **booking** id, so `refType` cannot
    discriminate. **@Sober called it before it could be measured.** The money thread is fine.
  - ⚠️ **FE width checks NOT_TESTED** — QA could not change the viewport (Chrome fixed at 1920, in-app browser
    refused). **DEF-1 also means the tray can only be measured EMPTY, so 1280-decides-AC-9 is unanswerable
    until the fix lands.** **Re-run them together.**
  - ⚠️ **`sid` was being written to by someone else during the QA round** (`ปกติ 13→18`; the QA fixture course
    was sold at 00:05). **Baselines must be re-read, never carried across hours.**
  - 🔴 **Open for the human (QA):** **backoffice read access** (`backoffice-som.develyst.online`) — without it
    Tanya cannot read what any day-end actually posted, so every money AC stays `NOT_TESTED` even after the job
    runs. Access lives in `../project-docs/`, never in a tracked file.

### 📏 STANDING RULE — FE layout IS verifiable here (08-01, TASK-081)

The in-app browser does not *paint* but it does **compute layout**. **Any FE change that adds or resizes a control
in a shared row must measure that row at 1600 / 1280 / 768 / 375 and report the numbers.** Anything painted stays
out of reach — **a deployed look is the only full detector**, so ship in small slices.

🔴 **HEIGHTS — added 09-08 (TASK-291 §2, @Porter's finding, @Sober's instruction; written in by @Fern, reword at
will).** **The four widths above were the whole rule, and nobody had ever checked a height — on any dialog.**
⇒ **Any change that makes a DIALOG taller is measured at 900 / 650, and its primary action must stay reachable
at 450.** *650 = a 1366×768 laptop after browser chrome, the commonest real admin screen. 450 = the harness
height that exposed this; a floor that only holds on real screens is not a floor.*
📌 **The reason is not the viewport: a dialog whose primary action can be unreachable cannot be VERIFIED.**

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

### 🔴 STANDING RULE — the human COMMITS at the end of every batch (his decision, 2026-09-01)

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

### 🚦 DEPLOY RULES (standing) → **MOVED VERBATIM to `SYSTEM-FACTS.md` (board hygiene 09-08). Read it there before any deploy.**

### 🔴 MIGRATION CHECK — before every single deploy → **MOVED VERBATIM to `SYSTEM-FACTS.md` (board hygiene 09-08). Read it there before any deploy.**


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

### A PM's misreading costs a message; an SA's ratification costs a sprint (2026-09-09)
@Porter read a structure into the owner's prose **four times in one day** — the `HH:mm:ss` prefill, the address as
three fields, the "admin override", and a second gate on leave. **He caught and withdrew all four himself.**
🔴 **The one that reached code is the one @Sober RATIFIED without asking where its authority came from.**
🔑 **The check that was missing: *"which REQ or ruling says this limit exists?"*** ⇒ **before building against a
structure in a REQ, trace it to the requester's own words.**

### When the requester reports with a screenshot, the SCREENSHOT is the DoD (2026-09-09, @Porter)
`TASK-301` was reported fixed twice and the owner found it standing twice. **Its DoD did not contain his exact
course and his exact click** — the screenshot was relayed as a DESCRIPTION rather than as an acceptance test.
🔑 **Adopted: a defect reported with a reproduction gets that reproduction as the first DoD line.**
⚠️ **And assert the OUTCOME, not the mechanism:** *"the leave succeeds"* AND *"the expiry moved"* — **the leave
going through with a stale date is the same defect wearing a different face.**

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

### The test for an unauthorised limit: does the cited source ask for a REFUSAL, or only name a WORRY? (2026-09-09, @Jason)
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

### `firstFreeWeeklySlot` gives up and answers anyway — and its backstop was deleted (2026-09-09)
`MAX_EXTENSION_WEEKS_SCANNED = 26` (`extension-slot.ts:7`): the scan finds no free slot and **returns the last
candidate regardless.** Its comment says *"the caller's ceiling is what refuses it — this function never silently
invents a valid-looking date."* 🔴 **That caller was `EXTENSION_CEILING`, removed by TASK-308.**
⇒ **on a slot booked solid for 26 weeks a make-up lands SIX MONTHS out and the expiry stretches to meet it, in
silence.**
✅ **RULING: it must not REFUSE (`§12` forbids it) and must not be SILENT** ⇒ **the leave succeeds and the ADMIN is
told.** 🔑 ***A refusal is the owner's to grant; a warning is ours to owe*** — the shape of `warn, and still save`
(REQ-082 AC-4) and `§11.3`. ❓ **The threshold is with the owner; `26` was chosen as a scan limit, not a promise.**

### `MAX_STUDENTS_PER_PARENT = 5` cites nothing (2026-09-09)
`parent.service.ts:13`, refusing at `:119`, commented *"Business rule: a single phone may register at most 5
students"* — **no REQ, no SPEC, no TASK, no owner ruling.** The customer's own copy hardcodes 5
(`line-i18n.ts:142`), **and it cannot be told from the repo whether the copy is the SOURCE or an ECHO of the
code — which is itself the finding.**
📌 **Raised to the owner via @Porter as two questions — *is five yours?* and *do you want a limit at all?*** 🚫 Not
changed; nothing is broken. ⚠️ **A family with six children would meet a wall nobody remembers building.**

### `searchExhausted` — a warning trigger nobody had to choose (2026-09-09, TASK-309)
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

### A field that CANNOT be true beats a field assigned `false` (2026-09-09, TASK-309)
The creation preview's `exceedsCeiling` now compares against `max(bornCeiling, furthest session the preview laid
out)` — **and nothing in that array can exceed a maximum taken over it**, so the field is false **by
construction**.
🔑 **Left as the computation rather than a literal `false`, so *"the day someone narrows the ceiling again it starts
telling the truth instead of lying quietly."***
⚠️ **The field stays on the DTO** — the FE reads it to disable `Create plan`. **Two repos, one order: the FE gate
goes before the field does, never both at once.**

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

### The registration screens are BILINGUAL; the rest of the conversation is not (2026-09-09)
`REQ-079 §17c` — the customer's verbatim copy — shows **Thai and English in one block on every registration
screen**. ⚠️ **This SUPERSEDES the TASK-307 ruling that `add_student_name_prompt` render in the session's single
language.**
🔑 **Both are right, and `both()`'s own purpose is the reconciliation: it exists for a reader whose language is
not yet KNOWN — and during REGISTRATION it is not.** ⇒ **bilingual on the `§17c` screens; single-language once the
session knows.**
📌 **`§17f` (@Porter's ruling): NONE of the eight numbered headings is sent** — *"a table of contents, not
copy"* — **and screen 2's `เลือกบทบาท / Select Your Role` is the one whose text defeats the requirement its own
screen exists to satisfy.**

### The entire LINE surface is served by the BACKEND (2026-09-09)
Checked, not assumed: **nothing in `smart-scheduler-front` touches `line-webhook`, `replyToken` or
`enqueueLine`.** ⇒ **the front end serves the admin frontoffice and no part of the LINE conversation or its
notifications.**
🔑 **Consequence for release planning: a LINE test round is gated by the BACKEND deploy alone.** ⇒ **FE work can
never delay a LINE round, and a "split deploy" to get one LINE item out early is not a thing that needs
negotiating — the two repos already are the split.**
⚠️ **The real caveat is the opposite one: deploying the backend ships EVERYTHING currently in it**, so "just this
one item" is never available within a repo. **Whether that is safe is a question about what else is in there,
not about the item.**

### `both()` cannot render the `§17c` registration screens — the STRING is bilingual, the call site is not (2026-09-09, TASK-310)
`both()` stacks a whole Thai body above a whole English one. **`REQ-079 §17c` alternates LINE BY LINE** — a Thai
sentence, its English sentence, and on screen 4 a `เบอร์โทรศัพท์ / Phone:` line in the middle of the pair. ⇒
**there is no pair of `TH`/`EN` values `both()` could join to make their screen.**
✅ **So the STRING holds both languages and the call site keeps `t(key, lang)`** — which satisfies TASK-307's
property more strongly: **every reader gets the IDENTICAL screen.**
🔑 **The guard lives in the JOINER, not in a list of keys:** `both()` now returns a body once when both languages
render the same text — **because `` tb(`code_${role}`) `` renders a `§17c` screen for a parent and one of OURS for
a teacher from ONE expression**, so no call site could carry the rule.
⚠️ **A doubled screen passes every string pin** — assert the ASSEMBLED screen.

### The errors clustered where we DECIDED, not where we TRANSLATED (2026-09-09, @Jason, TASK-310)
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
### An English-only defect on a Thai-speaking team is invisible by construction (2026-09-09)
**`admin` has been broken since inline-add was built and nobody reported it — because everyone here types
`แอดมิน`.** 📌 **`REQ-085 §13` exists because the customer has foreign parents: they are exactly who would have
found it, in production, by following our own menu.**
🔑 **The general form: a branch nobody on the team has a reason to walk is untested by the team's own habits, not
by oversight.** ⇒ **ask which paths have an ENGLISH (or any minority) branch that no one here has ever used.**

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

### A parsed-from-source assertion found a defect its own principle had not named (2026-09-09, TASK-313)
The test that parses `menu_body` for advertised tokens **found `เพิ่มนักเรียน` and `Add Student` unreserved on its
first run** ⇒ **`add เพิ่มนักเรียน` would have written a child named `เพิ่มนักเรียน`.**
✅ **Closed WITHOUT a second list: `isReservedWord` CONSULTS `parseAddCommand`** (`parseAddCommand(text)?.name ===
null` ⇒ reserved), **so the regex stays the single source and the two cannot drift.**
🔑 **A guard whose reach is DERIVED from what the product prints catches words nobody remembered to reserve.**

### `add child` is the COMMAND, and `child` is NOT reserved (2026-09-09 ruling)
@Porter: *"`add child` must still be ACCEPTED — parents have seen it. It stops being ADVERTISED; it does not start
being refused. **And when it is typed, it must add a child and NOT name one `child`.**"*
⇒ ✅ **`add child` is a PHRASE like `Add Student`** — bare it starts the prompt; `add child Emily` creates `Emily`.
🚫 **`child` must NOT join `RESERVED_WORDS`** — ⚠️ **that would REFUSE a parent who typed the retired phrase
instead of SERVING them.** 🔑 **Reserving is for words we ADVERTISE; this one we retired.**

### 🔴 A GREEN mutation is a result about the TEST, not the code — a source pin proves a line EXISTS, never that it EXECUTES (2026-09-09, @Jason, TASK-314)
Break-and-watch mutation B disabled the inline duplicate question (`if (false && …)`) and the suite came back
**9 pass, 0 fail** — because the pins were an `indexOf` ordering check and a `toContain` of the helper call, **and
both are satisfied by the TEXT of a condition that can never run.**
> *"A green mutation proves nothing, and I nearly reported it as coverage."*

🔑 **This is the limit of the technique we leaned on all week** — source-text pins are the only way to assert a
DB-bound path from a pure test, **and they cannot tell a live line from a dead one.**
✅ **The fix: pin the EXACT guard line, and write the reason beside the pin.** ⚠️ **And chase every green mutation
rather than filing it — it is evidence the assertion is in the wrong place.**

### Look for TWO WRITERS, not two doors (2026-09-09, @Jason)
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

### A rule can be RIGHT and its BOUNDARY assumed — and tests that match the requirement exactly will pass (2026-09-09)
`REQ-085 §6` shipped in the morning and produced a defect on the owner's phone the same afternoon.
**TASK-307 asserted both halves the requirement named** — *a parent with NO children cannot skip*, *a parent WITH
a child can still skip* — **both true, both green.** 🔴 **Neither is the failing case: a family with children being
forced into the flow AT ALL.**
🔑 **The gap was not in the assertions; it was in the requirement, which never said what happens to a RETURNING
family.** 📌 **Tests written faithfully to a requirement cannot cover a case the requirement does not mention** —
⇒ **when a rule is about a STATE (no children), ask what the other states do, and write that into the
requirement rather than leaving it to the code.**

### 🔴 A restore that fails silently turns "break it and watch" into "break it and ship it" (2026-09-09, @Jason)
On TASK-315 his mutation script's RESTORE threw, **so the `bun test` after it never ran** — the passing number he
first saw was **stale output from before the mutation**, and the working tree still contained `if (true)`.
**He caught it only by READING the file back.**
🔑 **New rule, his:** **verify a restore by READING the line, never by the exit code of the script that wrote
it.**
✅ **And @Sober's review rule adopted from it: any report that mentions a mutation gets the suite RE-RUN by the
reviewer, not read from the report.** ⚠️ **This is the one error class this week that could have reached the
owner as a broken DEPLOY rather than a wrong belief.**

### A rule that names who it PROTECTS, and not who it TOUCHES, has an assumed boundary (2026-09-09, @Jason)
> *"`REQ-085 §6` was specified for the population it was ABOUT — parents with no children — and silent about the
> population it would also REACH."*

**TASK-307's two assertions were the right two for what `§6` said** — *no children cannot skip*, *with a child can
still skip* — **both about a parent already INSIDE the add-child flow.** 🔴 **The defect was about whether a family
should be in that flow AT ALL: a question the requirement never asked, so no assertion could have been written
against it.** ⇒ ***not a missing test; a missing sentence.***
🔑 **The pair to carry:** ***"look for two writers" finds the sibling DOOR; "look for the sibling POPULATION"
finds this.*** 📌 **Both are questions asked at the right moment, not coverage targets.**

### Record the assertion you REJECTED, inside the test file (2026-09-09, @Jason)
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

### `§14`'s flow already exists — only the WINDOW is one day wide (2026-09-10)
`doLeave` (`line-webhook.service.ts:901`) already **scans**, already asks **which child** (`needsChildStep`, only
when ≥2 have a session), already lists **which session** (`sessionPicker`), and already skips the question when
there is one answer. 🔴 **`findTodayBookingsForParent(lineUserId, date)` is the whole defect.**
🔴 **And `doLeaveBooking` (`:915`) re-fetches with the SAME today window** ⇒ **widening only the picker makes
every pick outside today fail authorization AFTER the parent has chosen.** *(The sibling-door shape again.)*
✅ **Eligibility must reuse `hasEnoughLeaveNotice`, the helper `updateBookingStatus` throws from** — 🔑 *offering a
session the bot will then refuse is worse than not offering it*, and `§12.2` keeps that refusal.
📌 **The empty message must distinguish "nothing upcoming" from "everything is inside the cutoff"** — *"too late
for tomorrow's class, call the school" is help; "no class eligible" is a shrug.*

### `REQ-085 §4` governs values the system GENERATES, never what a message is CALLED (2026-09-10, @Porter)
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
