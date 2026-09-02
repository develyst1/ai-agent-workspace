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

## Schedules — the jobs, and when they really run

| Job | Time | Source |
|---|---|---|
| `month-reset` | **00:05** | `job_runs`, observed 09-01 |
| `daily-digest` | **08:00** | `job_runs`, stable since 08-19 |
| `daily-reminder` | **08:15** | `job_runs`, stable since 08-30 |
| **`end-of-day`** | 🔴 **18:30** | **The OWNER changed it himself**, 2026-08-29 (was 23:30 until 08-28) |

🔴 **`end-of-day` at 18:30 is DELIBERATE and CORRECT. It is not a defect and must never be reported as one.**
**Why it is correct: the app only lets you book a teacher until 18:00** (owner, 2026-09-02) — so **18:30 is after
the last session that can exist.** There is no window of sessions that the job can miss.
📌 **Porter raised this as a 🔴 possible live money incident on `uat` on 2026-09-02. It was neither.** He read
"23:30" out of stale documents, saw 18:30 in the data, and alarmed the owner about a setting the owner had
chosen. **Both halves — the schedule and the 18:00 booking limit — had been said before and never written down.**

## Product limits

- **Teachers can only be booked until 18:00.** Owner, 2026-09-02. This is what makes the 18:30 day-end safe.
- **There is NO student-delete anywhere in the product.** Nothing with history can be removed — only hidden.
- **There is NO rate limiter anywhere in the codebase** (established while speccing REQ-051). Any
  attempt-counting or throttling is new infrastructure, never a library flag.
- **`job_runs.byBookingType` reports only the four original types** — `FIRST_TRIAL · SINGLE_SESSION ·
  COURSE_PACKAGE · VOUCHER`. Observed 09-02. ⚠️ Whether the day-end also *skips* `OTHER` when selecting what to
  auto-attend is **open with @Sober** — reporting and selecting are different questions.

## LINE

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

## Telling the two boxes apart

- `SELECT count(*) FROM course_packages` — **`uat` ≈ 201 · `sid` two digits** (32 on 09-01, and growing as QA
  fixtures land). **The order of magnitude is the tell; the exact number is not.**
- **Scheduled tasks live in `C:\sm-jobs\*.ps1` on each server separately** — the boxes can differ, and one being
  a certain way proves nothing about the other.

## Working agreements the owner has stated

- **The owner commits, on his own schedule. Nobody asks about commit state, ever** (2026-09-01). Agents never
  commit. State your work; never request his.
- **Quote the owner's OWN requirement numbers to him** (REQ-001…016 · REQ-BO-001…006 · FIX-001…007) — the
  mapping to board numbers is in `OWNER-LIST.md`. Board numbers are for files and for Sober.
- **Write to him short.** Under ~15 lines, one decision at a time, reasoning in the files. See `PM.md`.

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
