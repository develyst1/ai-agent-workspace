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
