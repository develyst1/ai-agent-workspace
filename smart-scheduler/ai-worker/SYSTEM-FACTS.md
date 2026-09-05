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
  COURSE_PACKAGE · VOUCHER`. Observed 09-02. ⚠️ Whether the day-end also *skips* `OTHER` when selecting what to
  auto-attend is **open with @Sober** — reporting and selecting are different questions.
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
- **LINE on PC: no rich menu, and buttons cannot be tapped at all — text only** (owner, 09-01). Every choice in
  every flow therefore needs a typed equivalent.
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
