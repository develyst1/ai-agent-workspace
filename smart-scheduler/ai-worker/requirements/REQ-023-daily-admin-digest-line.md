# REQ-023: Daily admin digest — one morning LINE message telling staff what needs attention
- Status: **READY_FOR_SA** — all questions answered by คุณฟีน 2026-08-01 (see `## Questions`)
- Priority: MEDIUM
- Requested: 2026-08-01 by stakeholder (คุณฟีน)
- Deadline: none
- Source: stakeholder idea, raised while discussing incomplete student data.

## Problem / Goal
Things quietly need attention every day and nobody is told: students created via the quick "add new" path have
**no gender / date of birth / nationality**, and that is only one example — the stakeholder's words were that
there could be **"อีกเยอะ"**. Today staff would have to remember to go looking, so in practice nobody does, and
small problems accumulate until they show up as bad data in a report or a missed class.

Goal: **once a day, in the morning, admins get a single LINE message listing what needs attention** — a standing
to-do rather than a surprise.

## Requirement
1. **Once a day (morning), the system checks for outstanding items and sends admins ONE summary message on LINE.**
2. It must be **one digest, not a stream of separate alerts** — a single readable message.
3. **If there is nothing to report, say nothing** (no empty daily message).
4. The set of checks must be **extensible** — new checks can be added later without redesigning the mechanism;
   the stakeholder expects the list to grow.
5. **First check (the one that prompted this): students with incomplete information** — missing gender / date of
   birth / nationality (and province where applicable), so staff can go and complete them.

## Acceptance Criteria
- [ ] A scheduled daily run produces **one** LINE message to the admin recipients, in the morning.
- [ ] The message lists each triggered check with a count and enough detail to act (e.g. "5 students missing
      information").
- [ ] Nothing outstanding ⇒ **no message sent**.
- [ ] Adding a new check later does not require rebuilding the delivery mechanism.
- [ ] Re-running the job on the same day does not spam duplicates.

## Analysis / current state (Porter, read-only — for Sober to verify)
- **The delivery half already exists.** Admins are already a LINE audience: `app_settings.line_admin_user_ids`
  with a `notifyAdmins` fan-out (used today for leave notifications), on top of the outbox + retry worker.
  So this is mainly *checks + scheduling*, not new plumbing.
- **The scheduling pattern already exists too:** the system is driven by **Windows Task Scheduler hitting an
  internal HTTP endpoint** (`POST :4006/internal/jobs/end-of-day` and `/month-reset`, guarded by
  `x-internal-secret`), with `job_runs` for idempotency. This REQ follows exactly that shape — which is also
  what the stakeholder described ("task schedule รัน ... call api backend ทุกวัน").
- ⚠️ **Dependency worth stating up front:** the two existing scheduled tasks **have never been registered on the
  server** (a long-standing open item). A third job inherits the same gap — if nobody registers it, this feature
  silently never runs. Registering it must be part of delivery, not an afterthought.
- The "incomplete student" condition needs no new column — it's derivable once REQ-019's demographic fields exist.
  **REQ-019 is therefore a prerequisite for that first check** (the mechanism itself isn't blocked).

## Constraints
- Reuse the existing internal-job + admin-notify + outbox machinery; don't invent a parallel one.
- Must not leak personal data into the digest beyond what staff already see (mind the REQ-020 lesson — no
  unnecessary names in messages).
- HOW (job endpoint, check registry, message format) is the SA's design.

## Out of Scope
- Per-user/per-teacher digests (this is for admins).
- Real-time alerts — this is a once-a-day summary.

## Questions
(Porter → คุณฟีน. Her answers turn this into READY_FOR_SA. She said the list could grow a lot — this is a
starting menu, not a limit.)
1. **Which checks do you want in the first version?** My proposals, ranked by what I think earns its place:
   - 🔴 **Bookings still unconfirmed for today/tomorrow** — an unconfirmed booking means **the teacher was never
     notified**; this is the one that costs a real class.
   - 🔴 **Teachers with no LINE account linked** — they silently receive no schedule notifications at all.
   - 💰 **Courses / vouchers expiring soon**, and **students who have nearly finished their course** — the
     renewal conversations that quietly make money.
   - 🟡 **Freelance teachers near or over their monthly budget cap.**
   - 🟡 **Yesterday's no-shows.**
   - 📋 **Students with incomplete information** (your example — needs REQ-019 first).
2. **What time in the morning** should it arrive?
3. **Who receives it** — everyone in the admin LINE list, or a narrower group?
4. Should the digest also be **visible somewhere in the web app** (a "needs attention" panel), or LINE only?
   (Porter's lean: LINE first — it's what gets read.)

> ### ✅ ANSWERS (Porter, from คุณฟีน 2026-08-01) — this REQ is now READY_FOR_SA
> **Q1 — she wants ALL of the proposed checks**, i.e. the full list:
> 1. **Bookings for today/tomorrow still unconfirmed** (⇒ the teacher was never notified)
> 2. **Teachers with no LINE account linked**
> 3. **Courses / vouchers expiring soon** **and** **students whose course is nearly finished** (renewal)
> 4. **Freelance teachers near/over their monthly budget cap** **and** **yesterday's no-shows**
> 5. **Students with incomplete information** ⚠️ *depends on REQ-019's fields — see the note below*
>
> **Q2 — send at 08:00, every morning.**
> **Q3 — to ALL admins** (everyone in the admin LINE list).
> **Q4 — BOTH: LINE **and** a "needs attention" view in the web app** (not LINE-only). This adds a frontoffice
> screen/panel to the scope alongside the job + LINE digest.
>
> **Porter's notes for the SA — not decisions, just what I'd want considered:**
> - The scope is now **6 distinct checks + a job + a LINE digest + a web view**. **Staging is entirely your
>   call** — an obvious cut is the mechanism plus the checks that need no new data, with check #5 following
>   REQ-019. I'm recording her full scope, not pre-cutting it.
> - **Check #5 is the only one that is blocked** (needs REQ-019's gender/DOB/nationality/province). Checks 1–4
>   are computable from data that already exists.
> - The **08:00 job must actually be registered on the server**, or the whole feature is silently dead — the two
>   existing scheduled tasks still aren't registered. Please keep that in the delivery definition.
> - Worth deciding once, up front: whether the **web view and the LINE digest read the same check results** so
>   they can never disagree.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| REQ-023 | Daily admin digest — 08:00 LINE message + web "needs attention" view | MEDIUM | 🧪 **QA 2026-08-04 (2nd pass): PARTIAL — web half PASS, delivery `NOT TESTED`.** The panel shows **"Digest last sent: 4 Aug 2026, 08:00"** (the scheduled job ran this morning) with per-check counts and actionable detail ("Teachers not linked to LINE **21**", "Students with incomplete info **11**", both named). The three delivery ACs (one message · silence when nothing is outstanding · no duplicate spam) stay **NOT TESTED** — they require sending to real admins. Prior: **SPEC_DONE** — build complete, ready to deploy | **@Porter — deploy + 🔴 REGISTER THE 08:00 TASK. BUILD COMPLETE 2026-08-01: TASK-053 (BE) ✅ + TASK-054 (FE) ✅.** ⚠️ **Use the panel itself as the acceptance:** before registering, `/scheduler/attention` must show the **red "the daily digest has never run"** warning; after the first run it must show a real timestamp. That is exactly what the indicator was built for — do not accept this REQ off the task list. _Previously: TASK-053 (BE) ✅ DONE 2026-08-01** (rework applied + re-reviewed). SPEC-018 (2026-08-01). **✅ Correction to the REQ's analysis: check #5 is NOT blocked — REQ-019's fields already landed with TASK-048** (`students.gender`/`birth_date`/`nationality`, `parents.province` are in the schema today), so **all the checks are computable now and this REQ has no prerequisite** — คุณฟีน gets the check that prompted her idea in the first release. Design = **ONE registry, ONE producer, TWO renderers**: `lib/attention.ts` (append one array entry = a new check — no plugin system) → `runAttentionChecks()` → the 08:00 job formats it as **one** LINE message *and* `GET /api/attention` serves the web panel **live**, so the two surfaces can never disagree. **No migration** (`job_runs`, `line_admin_user_ids`, outbox all exist; I verified `routes/internal.ts`'s `x-internal-secret` gate + 503-when-unset myself). Porter's 4 bundled items are **7 distinct checks**. Reuse-not-redrive is enforced: checks 3–4 must use **`lib/eligibility.ts`** (TASK-051) and check 5 the calendar's own freelance `remaining`. 🔴 **Dead-job visibility is designed in:** the job writes a `job_runs` row **even when it sends nothing**, and the panel shows *"digest last ran…"* / **"⚠️ never run — the 08:00 task is not set up"** — because two jobs here have never been registered and nobody noticed. **Privacy:** only 2 checks name anyone (unconfirmed bookings, teachers w/o LINE); the rest are counts in LINE with names behind login. **Not staged** (nothing is blocked; BE→FE is 2 tasks, not 2 stages). **Non-blocking Q to @Porter:** confirm thresholds (expiring **14d** · nearly-finished **≤2 sessions** · freelance near cap **≤2h**) — one constant block, I'm not waiting. _Porter's original:_ คุณฟีน's idea 2026-08-01: a **daily scheduled job → backend runs checks → ONE LINE digest to admins**; silent when nothing is outstanding; **extensible** ("อีกเยอะ"). Her first check = **students with incomplete info** (needs REQ-019's fields). **Most of the plumbing exists** — `notifyAdmins` + outbox, and the internal-job + `job_runs` pattern used by end-of-day/month-reset. ⚠️ **Inherits the long-standing gap that those scheduled tasks were never registered on the server** — registration must be part of delivery or this silently never runs. **ALL questions ANSWERED 2026-08-01 — she wants the FULL check list:** (1) today/tomorrow bookings still unconfirmed · (2) teachers with no LINE link · (3) courses/vouchers expiring + courses nearly finished (renewal) · (4) freelance near/over cap + yesterday's no-shows · (5) students with incomplete info. **08:00 daily · to ALL admins · BOTH LINE and a web "needs attention" view.** Only check (5) is blocked (needs REQ-019 fields); 1-4 use existing data. **Staging is Sober's call.** |
```
