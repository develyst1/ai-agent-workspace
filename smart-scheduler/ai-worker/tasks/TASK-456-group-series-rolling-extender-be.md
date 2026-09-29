# TASK-456 — `REQ-105 §3`: a group series with no end date always has N weeks of rows ahead — the rolling extender (job + route + exe + script; the human registers it) — BE, S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-24) · **Size S.** After TASK-453 (it needs `closed_at`). The REQ-105 slice.

## §0 Why this is separate
Every scheduled job here is a Windows Task Scheduler exe hitting an internal route (`scripts/*.ts` → `POST /internal/jobs/*`, `INTERNAL_JOB_SECRET`, a `job_runs` row always written), and **the box registration is a human deploy line**. That is one moving operational part with nothing else in its path — your call to keep it out of TASK-453 was right.

## §1 Build
- `runGroupSeriesExtenderJob(runDate?)`: for every group series that is **not closed** (`closed_at IS NULL`), ensure rows exist for the next **N weeks** (a setting, default 8 — say if you read the customer's words differently); create the missing ones from the series template exactly as `add dates` does (same clash rule, same refusal), skipping any date that already has a row. **Idempotent by state** ("N weeks ahead exists"), not by a stamp — a second run the same day creates nothing.
- A clash on one date must not abort the run: that series/date is reported and the job continues — one bad coach-hour cannot stop every other series from being extended. Say how the report reaches a human (the `job_runs` summary + the log line).
- The route, the exe, the `package.json` script and the `job_runs` row in the shape TASK-441's weekly digest set. 📦 A deploy line for the human: register it (daily is enough — recommend a time).
- 🚫 Nothing else: no enrolment, no notices, no touching a closed series.

## Definition of Done
- [ ] The extender by value (missing dates created; a second run creates none; a closed series untouched; a clashing date reported and the run continues) · the setting · suite **count** · tsc 0 · migrations unchanged · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM · report here + `inbox/SA.md` + log, with the registration line for the deploy list.

---

# ✅ CODE DONE — @Jason → @Sober (2026-09-24) — the extender + TASK-453 §4's label (your ruling (c)); no migration; 2896 pass / 0 fail; 16/16 mutations bite

**Numbers:** `bun test` **2896 pass / 0 fail**, 223 files (+1: `src/lib/group-series-extender-req105.test.ts`, 15 tests) · `tsc --noEmit` **0** · 🚫 **no migration — 55 = 55, unchanged** (this is behaviour over the columns `0054` already added) · 3 pins moved.

## What was built
- **`lib/group-extend.ts` — `weeklyDatesToCreate({ existing, from, horizon })`**, the pure half: the weekly steps AFTER the series' last row, up to the horizon (inclusive), never before `from`. 🔑 **Idempotent BY STATE** — the answer is derived from the rows that exist, so a second run the same day returns `[]`; a "last extended on" stamp would be a second fact that can disagree with the rows (pinned: the job's source contains no `lastExtendedAt`/`extendedThrough`).
- ⚠️ **An ABANDONED series is NOT back-filled, and that needed saying.** The steps are counted from the LAST ROW (so a Tuesday class stays a Tuesday class — pinned by weekday), but anything before `from` is dropped: a series whose last row was in March gains its next four Tuesdays, **not thirty past ones**. Mutation A removes that guard and bites.
- **`runGroupSeriesExtenderJob(runDate?)`** — every live GROUP row, grouped by `group_key`; a series with any `group_closed_at` row is skipped **and counted** (`closedSkipped`), so "nothing happened" is never silent. The template is **the LAST row** — the series as it stands today, not as it began: extending from the first row would quietly restore an old name and an old coach every week for ever (mutations B and I bite; the test now has a renamed, re-coached series so it can tell the two apart).
- 🔑 **ONE DATE PER TRANSACTION** — that is what makes "the run continues" true rather than a hope. A clashing coach-hour is caught, recorded as `{ groupKey, date, message }`, and the loop goes on: by value, one failing Tuesday costs that one date while the same series' next date AND every other series are still created. It reaches a human **twice** — the `job_runs` summary and a `console.warn` line (mutations G and H bite).
- **`POST /internal/jobs/group-series-extender`** behind `INTERNAL_JOB_SECRET` (401 pinned) + `scripts/group-series-extender.ts` (a THIN trigger — no DB connection, so it cannot drift from the API's rules) + `"job:group-series-extender"` in `package.json`. A `job_runs` row is **always** written (TASK-208's lesson — mutation K bites).
- **The setting `group_series_weeks_ahead`, default 8, range 1–52.** 📌 I read the customer's words as "a couple of months ahead" and 8 weeks is that; it is a SETTING because it is the one number an admin can feel — too small and the calendar ends in a fortnight, too large and a series nobody closed fills the grid for a year. ⚠️ One honest edit: `SettingSpec.unit` gained **`"weeks"`** — expressing this as 56 days would make the Settings row read as a number nobody chose.
- 🚫 The job sends nothing, enrols nobody, posts no money (pinned by absence: no `enqueueLine`, `recordSale`, `seatOnGroup`, `reconcileCoursePlan` in it).

## TASK-453 §4 — your ruling (c), folded in as instructed
The attention card's item now ends with **` · PRIVATE CANCELLED`** when the coach-hour the group yielded no longer has a live Private on it. One extra read for the whole set (keyed `teacher|date|start`), not one per row. 🚫 **Nothing auto-resolves** — the card is still listed, and `scheduler.service.ts` still has no un-yield on any cancel path (pinned by a negative regex). Mutations N (the mark inverted) and O (the mark dropped) both bite.
📌 I used the LABEL rather than `AttentionItem.hint`: `hint` is carried by the type and the service's DTO but **nothing renders it today**, so the ruling would have shipped invisible. EN and upper-case, like the CLASH note the owner is reading — the labels are data lines and have never been translated.

## 🔴 One thing I removed rather than kept
The first version skipped a date that already existed. The break-and-watch run showed removing that check **changed nothing** — the anchor is the MAXIMUM existing date, so no later step can already be there. 🚫 It was dead code, and a guard for an impossible case reads as if the case happens. Removed; the property (never a duplicate, even on an irregular series with a hand-added off-cadence date) is pinned in the suite instead. That is what the two "PASSED ⚠" mutations were worth.

## Break-and-watch — `mut456.mjs`, 16 mutations, **16 bite** (`try/finally`, sha-256 restore byte-identical, `BASELINE=83`)
A the past back-filled · B the anchor becomes the first row · C the step becomes a day · D the horizon exclusive · E a series with no rows is guessed at · F a closed series extended · G one clash aborts the run · H the clashes never reach a human · I the template is the first row · J the horizon counts days · K no `job_runs` row · L the default changes · M the secret gate gone · N the cancelled mark inverted · O the mark dropped · P the package script dropped.

## 📦 THE REGISTRATION LINE FOR THE DEPLOY LIST (the human's, and it is the whole point of this task)
```
bun build --compile scripts/group-series-extender.ts --outfile dist/group-series-extender
```
Windows Task Scheduler → **daily at 03:30**, "Run whether user logged on or not", with `SCHEDULER_API_URL` + `INTERNAL_JOB_SECRET` in the machine env. 📌 **03:30 recommended** and the reason is not taste: it is after the day-end cut and well before the 08:00/08:15 messages, so a date created overnight is already on the coach's morning schedule; and the job is idempotent by state, so a missed night costs nothing — the next run does the same work. ⚠️ Until it is registered, the `job_runs` table shows no row for `group-series-extender` — which is exactly how TASK-208's missing job was eventually found.

⛔ Only you mark this DONE. 🚫 No deploy request; no migration.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-24)
Re-run by me: **2896 pass / 0 fail** · tsc 0 · **55 = 55, no migration** (behaviour over `0054`'s columns) · `lib/group-extend.ts` + `scripts/group-series-extender.ts` present.
Four calls of his I am keeping:
1. **The template is the LAST row, not the first.** Extending from the first row would quietly restore an old name and an old coach every week for ever — a bug that would have looked like the calendar "fixing itself" back to a state nobody wanted. The test now carries a renamed, re-coached series so the two cannot read alike.
2. **An abandoned series is not back-filled.** The step is counted from the last row (a Tuesday class stays Tuesday) but nothing before today is created: a series last touched in March gains its next four Tuesdays, not thirty past ones.
3. **ONE DATE PER TRANSACTION** — that is what makes "the run continues" a fact rather than a hope, and the failures reach a human twice (the `job_runs` summary and the log).
4. 🔴 **He deleted his own guard rather than keep it.** The "skip a date that already exists" check could not fire — the anchor is the maximum existing date — and a guard for an impossible case reads as if the case happens. He removed it and pinned the property instead. That is the right instinct and it is what the mutation run was worth.
**§4 (c) is in:** the card ends with ` · PRIVATE CANCELLED`; using the label rather than `hint` was correct — nothing renders `hint` today, so the ruling would have shipped invisible.
📦 The registration line and **03:30** (after the day-end cut, before the morning messages; idempotent so a missed night costs nothing) go to the deploy list as written.
