# SPEC-100 — Thin-slip demo: pay-run + slip contract (REQ-120 Salary subset) — Team A, wk 2–3

**Author: Sober (SA Lead, Team A), 2026-11-08. Status: READY TO CUT (TASK-865 BE / TASK-866 FE).** Build GO relayed by Porter (owner, 2026-11-08: *"ไปเลย ทำไปเลย"*). Repos: `smart-scheduler-backoffice-back` (Hono/Drizzle, `bo.*`) + `smart-scheduler-backoffice-front` (Next+Mantine), branch `dong`. **Git only on the owner's word.**

## 1. Purpose & the demo it serves
The ≈20–23 Nov demo for พี่ฟีน on **sid** (CHECK-REQ-120-three-team-schedule § Round 3, verbatim): the **CEO signs in → an FT coach's slip = base salary + a couple of hand-typed Other± lines → the month overview → the 12:00 auto-lock → export**, on sid seed data. This is **work-in-progress on the critical path**, NOT money-grade payroll (that is wk 6–7). This SPEC is the thin subset that makes that path real and extensible — every later pay line (Extra Hour, OT, Merit, Bonus, Commission, FL pay, Transportation) is **another slip-line kind** on the same model, not a reshape.

## 2. IN scope (and OUT — read both, they define "done")
**IN:** FT **base salary** (CEO-set, CEO-only) · **Other ±** manual lines (signed amount + required reason) · a **pay period = one calendar month** · **pay run** = generate a draft slip per active FT coach · **month overview** (people + totals) · a **single slip** view · the **12:00 auto-lock** (REQ-120 R1.5) · **export**. Everything CEO-only (`requireRole("ceo")`, SPEC-097).
**OUT (do NOT build — later spine):** PT / FL / STAFF pay · Extra Hour · OT · Merit · Bonus 50/100 · Commission · FL teaching pay · Transportation · the hours reader (timetable → payable hours) · F3 multi-role · R0.3 admin-blind entry · PDF export (CSV is enough for the demo). A slip-line **kind enum** is defined wide (below) so these drop in later, but **no logic for them now.**

## 3. Data model (`bo` schema; ONE additive migration via MIGRATION-QUEUE.md, Team A's next slot)
All schema-qualified `bo.*` (matching `bo.item`/`bo.users`). **Additive only; reversible; no drop/truncate/db:push on sid.** `teacher_id` is a **plain uuid, NO cross-schema FK** (the SPEC-097 §2 house pattern — `public.teachers` belongs to smart-scheduler-back).

- **`bo.employment_type`** pgEnum = `('FT','PT','FL','STAFF')` (demo writes only `FT`).
- **`bo.salary_profile`**: `id` · `teacher_id` (uuid, unique) · `employment_type` (enum, default `FT`) · `base_salary` (numeric, nullable — CEO-set; null ⇒ 0 on a slip) · `active` (bool, default true) · timestamps. One row per coach. **Base is CEO-only data.**
  - ⏭️ **Planned additive columns, NOT in the as-built 0009** (which Jason shipped to sid 2026-11-08 without them): `vehicle` (text, nullable — Team B Transportation) on `salary_profile`, and `source_ref` (text, nullable — auto-line idempotency) on `pay_slip_line`. Silver asked to fold them in, but 0009 was already applied, so they land in **the additive migration that introduces their feature** (Transportation / the bonus auto-line). Adding them ahead of their logic as unused columns buys nothing; adding them with the feature keeps the shared journal honest. (Porter/Silver, 2026-11-08.)
- **`bo.pay_period`**: `id` · `year` (int) · `month` (int 1–12) · **unique (year,month)** · `status` pgEnum `bo.pay_period_status` = `('open','locked')` default `open` · `lock_at` (timestamptz — the auto-lock instant; default = **12:00 local on the last day of (year,month)**, REQ-120 R1.5) · `locked_at` (timestamptz, nullable — when it actually locked) · timestamps.
- **`bo.pay_slip`**: `id` · `period_id` (FK → bo.pay_period, same schema so a real FK is fine) · `teacher_id` (uuid) · **unique (period_id, teacher_id)** · `base_amount` (numeric — snapshot of `salary_profile.base_salary` at run time) · `status` pgEnum `bo.pay_slip_status` = `('draft','confirmed','locked')` default `draft` · `confirmed_at` (nullable) · timestamps. **`total` is NOT stored** — it is `base_amount + Σ lines` (see §4), computed on read; snapshotting the total is a wk-6 hardening, not now.
- **`bo.pay_slip_line`**: `id` · `slip_id` (FK → bo.pay_slip, cascade on slip delete) · `kind` pgEnum `bo.pay_line_kind` = `('base','other','extra_hour','ot','merit','bonus','commission','fl_pay','transport')` — **demo uses only `other`** (`base` is the slip's own `base_amount`, not a line) · `label` (text — for `other`, the **required reason**, REQ-120 R1.4 "amount + reason, required") · `amount` (numeric, **signed** — Other ± may be negative) · `source` pgEnum `bo.pay_line_source` = `('manual','auto')` default `manual` · `created_by` (text — the CEO username from the token) · timestamps.

## 4. The pay-run & totals (semantics the BE owns)
- **Run** (`POST …/run`): for the period, for **every active FT `salary_profile`**, upsert a `draft` slip with `base_amount = base_salary ?? 0`. Idempotent — a second run refreshes `base_amount` on `draft` slips, **never touches a `confirmed`/`locked` slip, never deletes a line.**
- **Slip total** (computed, every read): `base_amount + Σ(pay_slip_line.amount)`. Signed lines sum straight.
- **Other± line** (`POST …/lines`): `kind='other'`, `amount` signed, `label` (reason) **required and non-empty** → 400 if missing. Allowed only while the slip is `draft` or `confirmed` **and** the period is `open`; a `locked` period / slip refuses writes → 409 `LOCKED`.
- **Lock** (REQ-120 R1.5 — "confirm by the last day of the month, before 12:00"): the **12:00 auto-lock** is **lazy + explicit**:
  - **Lazy:** any read or write of a period evaluates `now >= lock_at` ⇒ the period is `locked` (set `status='locked'`, `locked_at=now` if not already), and every slip in it becomes `locked`. No background job for the demo.
  - **Explicit:** `POST …/lock` locks immediately (the CEO's "lock now").
  - After lock: all line writes and re-runs on that period return 409 `LOCKED`. Reads and export still work.
- **Money:** store as numeric; compute in integer satang or a decimal lib — **never float arithmetic on money** (role-be). Round only at display.

## 5. HTTP contract (CEO-only; `requireRole("ceo")` on every route; mounted in `api.ts` under `/api/v1`)
Base path `/salary`. All return JSON; money as a string or integer satang (BE picks, documents it; FE reads what BE documents).
- `GET  /salary/periods` → `[{id, year, month, status, lockAt, lockedAt}]`
- `POST /salary/periods` `{year, month}` → the period (lockAt defaulted per §3) · 409 if (year,month) exists
- `POST /salary/periods/:id/run` → `{created, refreshed}` counts · 409 `LOCKED` if locked
- `GET  /salary/periods/:id` → `{period, slips:[{id, teacherId, teacherName, baseAmount, total, status}]}` (the **month overview**)
- `GET  /salary/slips/:id` → `{id, period:{…}, teacherId, teacherName, baseAmount, status, lines:[{id, kind, label, amount, source}], total}`
- **`teacherName`** (overview + slip, and a name column in the CSV): a **read-only lookup from `public.teachers`** (display only; NOT an FK, no cross-schema constraint — the no-FK rule is about constraints, a read join for display is fine). Null when not found. Added 2026-11-08 on Fern's catch (a uuid is useless to พี่ฟีน in the demo); it is a routes/service change, **no migration** (0009 unaffected).
- **Response bodies are BARE** — exactly the objects listed above, NOT wrapped (`{period}`/`{line}`). `GET /periods` is an array; `POST …/periods`/`…/lines` return the created object (201); `POST …/lock` returns the period.
- **Error envelope** is the backoffice shell convention `{ "error": { "code", "message" } }`. Codes the FE keys on: `LOCKED` (409), `PERIOD_EXISTS` (409), `FORBIDDEN` (403), validation (400), not-found (404).
- `POST /salary/slips/:id/lines` `{amount, label}` → the line · 400 if label empty · 409 `LOCKED`
- `DELETE /salary/slips/:id/lines/:lineId` → 204 · 409 `LOCKED`
- `POST /salary/periods/:id/lock` → the locked period
- `GET  /salary/periods/:id/export` → **CSV** (one row per slip: teacher, base, each total; demo-grade). `Content-Type: text/csv`. PDF is a later upgrade, out of scope.
- **Salary-profile admin (CEO sets base):** `GET /salary/profiles`, `PUT /salary/profiles/:teacherId` `{employmentType, baseSalary, active}` (demo: FT + base). Needed so the demo seed/CEO can set a base; keep minimal.

## 6. FE (TASK-866, Fern — on her TASK-857 shell, dark, CEO-only)
Two demo screens under `(admin)/salary/` inside the existing shell (the Pay run + Slip of DECISIONS row 1; People/Settings/the other 4 are Fanta/Team B, not here):
1. **Pay run / month overview** (`/salary/payrun` or `/salary`): pick/create a period → **Run** → a table of FT coaches with base + total + status → a **Lock** button (with the 12:00 `lockAt` shown) → an **Export** (download the CSV). A locked period shows locked, buttons disabled.
2. **Slip** (`/salary/slip/[id]`): one coach — base, the Other± lines (reason + signed amount), the total; **add / remove an Other± line** (reason required) while open; read-only when locked; a per-slip export/print is optional.
Gating is already the shell's (`requireRole`/page table, CEO-only); these pages inherit it. No new role logic.

## 7. Seed for the demo (sid) — a SEPARATE additive seed, not the migration
A `bo.salary_profile` row (FT + a base) for a few **existing** coaches, and one `open` period for the demo month, as an **additive, idempotent, team-A-named** seed script (`db:seed-salary-demo`), run on **sid** with the **host-only check first** (F-038: confirm `154.197.124.206`), like the CEO seed. It reads a few real `teacher_id`s **read-only** from `public.teachers` (or uses clearly-demo uuids). **No truncate/reset.** Running it on sid is a gated step near demo time, not part of the build.

## 8. Done = (evidence in each TASK)
- BE: `tsc` 0 · DB-less suite green · one additive migration **applied · verified on sid** (host named, per F-038) · the full round-trip proven on an injected/seeded store: create period → run → add two Other± lines → total = base + Σ → lock (both lazy-past-`lock_at` and explicit) → locked writes 409 → CSV export. `requireRole("ceo")` on every route (admin 403, no token 401).
- FE: `tsc` 0 · `next build` 0 · the two screens drive the contract against a stub/real BE; CEO sees them, admin does not (shell gate); dark; locked state disables edits.
- `git status` = only claimed files. **No git command run.**

## 9b. Canonical pay-line model for ALL teams (unblocks Team B) + accepted BE defaults
**§3 (the model) and §5 (the API) are the canonical pay-line contract every team consumes** — the Team-A equivalent of what SPEC-097 §4 was for Team C. Team B (Silver/Fanta/Bob) builds its remaining Salary pieces against this, so it is published now, not at wk 6. What Team B's pieces consume here, and the thin-subset **extensions** they will need me to add as each lands (named so Silver can plan; each is additive, not a reshape):
- **Bonus pay lines** (Bob's TASK-863 reader → pay lines): the `bo.pay_slip_line` model + `kind='bonus'` + `source='auto'` is the target shape. **Extension when wired:** an internal "apply reader results as auto lines" endpoint/service (idempotent per (slip,kind,source-ref)); the reader stays Team B's, the line-write contract is this model.
- **Transportation:** needs a **`vehicle`/transport field on `bo.salary_profile`** — NOT in the thin subset. Extension: one nullable column + `kind='transport'` lines. Flag me when TASK for it is cut.
- **CEO "remind now" / pay-run states:** the thin subset has period `open|locked`. A `remind`/notify state is an **additive status/field** when that piece lands.
- **R1.7 / R1.8 month-end reports:** read-only over `pay_slip` + `pay_slip_line` (+ totals). The model supports them; the report queries are Team B's, no model change expected.
- **The 8 Salary screens** (Fanta: People/Settings/Entries/Daily/Person/My-slip): consume `GET /salary/profiles`, `PUT /salary/profiles/:teacherId`, `GET /salary/periods/:id`, `GET /salary/slips/:id`. People/Settings map to the profile routes; Entries/Daily map to the slip + lines routes. If a screen needs a field §5 doesn't expose, name it and I extend §5.

**Accepted BE defaults (Jason, 2026-11-08 — all correct, locked into this contract):**
- **Money over HTTP = integer satang** (documented in the routes file); **CSV in baht, 2 decimals**. No float money math.
- **`lock_at` default = 12:00 Asia/Bangkok (UTC+7, no DST) on the last day of the month = 05:00 UTC.** (REQ-120 R1.5 "before 12:00" is local Bangkok time.)
- **Export carries teacher_id only, no names** — names are a `public.teachers` join the FE does (no cross-schema join in BB). The FE renders names in the UI; the demo CSV is id + amounts. If พี่ฟีน wants names in the CSV itself, that's a FE-supplied export or a later §5 addition — flag at demo time.
- **Migration `0009`** (Team C took `0008`) — via MIGRATION-QUEUE in apply order, host-check first.

## 9. Risks / notes
- **Critical-path re-sequence, not new scope:** this subset is the pay-run+slip engine the money-grade slip needs anyway; building it first is the demo, per Round 3. It does **not** move Salary wk 6–7.
- **Extensible by design:** the `bo.pay_line_kind` enum and the line model carry every later pay line; wk-6 work adds kinds + their auto-readers (hours reader, bonus reader TASK-863, etc.), not a new shape.
- **Shared sid DB:** one additive migration via MIGRATION-QUEUE (Team A slot), host-check first. No `bo.*` table dropped (DECISIONS row 6).
- **Two BEs condition (Round 3):** the demo date assumes the pay-run engine is not one BE's sole 10-day task. If Jason is solo on TASK-865, flag the date risk to me early (the engine is the long pole).
