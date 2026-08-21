# smart-scheduler — PROJECT STATUS (resume-here / cross-machine memory)

> **Source of truth for resuming on any machine.** git-synced, so it travels; local `.claude/memory/` does not.
> Resume: `git pull` → `ai-worker/PROTOCOL.md` + your role file → this + `ai-worker/board.md` + the newest
> `ai-worker/log/*.md` → act on your role's ball.
>
> **Last updated:** 2026-08-20 (~02:30) by Porter (PM), reconciled against the board and `log/2026-08-19.md` +
> `log/2026-08-20.md`. Human twin: `PROJECT-STATUS.html`. Code repos: **`H:\scheduler`**.

## 🚦 Environments (owner's names — "prod" is not a word we use)
| | **`sid`** — the team builds & verifies here | **`uat`** — the customer's system |
|---|---|---|
| frontoffice | som.develyst.online | frontoffice.develyst.online |
| backoffice | backoffice-som.develyst.online | backoffice.develyst.online |
| who touches it | team verifies (owner deploys) | **owner only** |

**Migrations: `sid` first, verified, then `uat`.** Both boxes are now at **20/20 migrations, `db:verify` GREEN**.

## 🚦 The UAT gate (owner's rule, 2026-08-19 — written into `PM.md` and `QA.md`)
**Nothing reaches `uat` without BOTH Porter and Tanya green-lighting it**, and we carry that responsibility.
Tanya answers *"does it work?"* from a run on the deployed `sid` build; Porter answers *"is it the right thing,
is now the right moment, is the customer impact understood?"* **Not a green light:** code-complete · SA-reviewed ·
tests pass · a dry run · "worked locally" · nobody objecting. A green light is a written block naming the build,
what was tested, **what was NOT**, migrations, rollback, customer impact, and both names.

## Where we are
- 🟢 **Green Light #1 issued** (2026-08-19) for **REQ-043 · 044 · 048 · 049 · 053 · 054** (+ REQ-045 rides the same
  deploy). `uat`'s ledger is repaired, so **nothing technical blocks the deploy** — it simply has not been run yet.
- 🟢 **Go-live wave 1 is half done on `uat`**: test data wiped, **4 of 8 batches imported (Mon·Tue·Wed·Thu) = 23
  parents / 25 students**. Owner will run **Fri · Sat · Sun · Voucher** when the customer confirms the first days.
- 🟢 **`sid` holds the full import** (109 parents / 130 students, all 8 batches) as the rehearsal.
- 🟢 **LINE leave flow verified live on a real phone** (child picker → session picker → confirmation naming the
  cancelled session; and a refused leave now **explains itself** instead of the bot going silent).

## Go-live (REQ-055)
**Wave 1 = people only.** 179 named rows → **✅ 130 importable · ⚠️ 22 held · ⛔ 27 not-ready (yellow)**.
Rules: `0`-prefix phones (10 digits or held) · DOB sanity 2005–2026 (unreadable ⇒ empty, child still imports) ·
no-phone ⇒ held · parent-name rows become the family name · **yellow excluded** · **day-by-day batches** ·
row-keyed report so the owner can colour the customer's sheet.
**Wave 2 = the customer's real courses** — blocked on **them**: program · package size · sessions used · day+time ·
coach, per student. Files: `project-docs/2026-08-19-student-import-checklist.md`, `…-yellow-rows.txt`.

## Open work, ranked
1. **Deploy Green Light #1 to `uat`** (owner: build → copy → `pm2 restart`), then **Tanya's post-deploy re-check** →
   that is what turns `TEST_PASSED` into **DELIVERED**.
2. **REQ-055 remaining 4 batches** on `uat` — waiting on the customer.
3. **REQ-049 (notify on leave) is OPEN** — its central AC is unproven: on three live leaves the outbox was
   **empty**, because **no admin is registered**. Two follow-ups: the owner registers an admin on `uat`
   (`สมัคร` → 3 → admin code, default `229`), and **TASK-152** makes a zero-recipient case write a **visible
   SKIPPED row** instead of nothing (REQ-049 AC-4 — "never a silent drop").
4. **REQ-052** (calendar cell: program + booking type) — TASK-141 done; **TASK-142 waits on the owner glancing at**
   `project-docs/req-052-palette-comparison.html`.
5. **TASK-147** (settings dictionary) · **TASK-146's AC-7 finish** (LINE refusal in the parent's language).
6. **REQ-051 (walk-in QR check-in)** — SPEC-050 DRAFT, stuck on **3 security decisions owed by Porter + owner**.
7. **REQ-035** (sell-side stock + revenue) — specced 08-04, never built; owner's instruction: **last**.

## Deferred tests (grouped into wave-2 acceptance, named not dropped)
REQ-053 AC-2 (crafted `PATCH` refusal — needs a real course) · REQ-054 AC-6 (reports read a course as one program) ·
REQ-049 AC-1 (admin actually notified) · the LINE flows on `uat` itself.

## Open questions owed by the owner
- **Advance leave:** LINE can only cancel **today's** sessions. His original words were *"การลาล่วงหน้าในไลน์"* —
  so: should a parent be able to take leave for a future date, or is same-day-only the intent?
- **REQ-051's three security decisions** (see the REQ).

## Parked by the owner (his explicit decisions — do not re-raise)
Dashboards + the 8-item meeting wishlist (REQ-033/034/036/039) · the `.dump` pushed to git (`0b8966c`) ·
the two open DB whitelists (`49.237.170.101`, `110.171.40.169`) · `.env.local` pointing at `uat` ·
`QA-prod-*` residue · REQ-056 (`สาขา`/`จังหวัด` are **badge names**, not untranslated strings — closed, not a defect).

## Team & workflow
PM=Porter · SA=Sober · BE=Jason · FE=Fern · QA=Tanya. Chain: Human→Porter→Sober→(Jason/Fern); QA hangs off Porter.
Everything lives in `ai-worker/`. **Write the log entry in the day's file** — a status without an owner, or work
without a log line, is how three items went missing this week.
