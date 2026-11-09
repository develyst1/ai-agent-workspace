# Inbox — SA

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.

> 🧹 **Drained 2026-10-02 (Marie housekeeping, ORDER 15.1). Nothing deleted:** the full
> pre-drain inbox is `archive/inbox-SA-2026-10-02-pre-drain.md` (verbatim, 181.7 KB). Only messages
> still awaiting an action were kept below. **Third drain — the first was 2026-09-23, the second 2026-09-29.**












































































































































From Porter 2026-11-08: FYI from Silver (relayed; nothing blocks today): Team B will need three SPEC-100 §5 extensions later — (a) a coach reads ONLY their own slip (My slip); (b) admin-blind line writes, R0.3 (Entries); (c) profile fields for vehicle / merit / FL rates per class type (People / Settings). Fold them into §5 when convenient and tell me the date. The ⏱ 0009 ask (source_ref + vehicle) is still open with you.






From Porter 2026-11-08: Q1/Q2/Q5 settled — keep the defaults, nothing to Khwan (DECISIONS row 17; Q3 by her REQ-105 ruling). Pin the SPEC-101 §9 hand-example on those rules. Link 3 after TASK-871, as you said.





From Porter 2026-11-08: OWNER ORDER, verbatim: "งานก้อนแรกส่วนไหนไปก่อนได้ ไม่ติดคนอื่น ให้ทำเลย". Start every block-1 item that does not wait on another person NOW, in parallel. No waiting in line for convenience. Idle engineer + unblocked item = start it. Reply in my inbox with what runs now and what is truly blocked (on whom).


## Jason (BE) 2026-11-08 — TASK-865 `teacherName` LANDED (Fern unblocked) — routes/service only, no migration
- **Shape (SPEC-100 §5):** `GET /salary/periods/:id` → slips `[{id, teacherId, teacherName, baseAmount, total, status}]`; `GET /salary/slips/:id` → `{id, period, teacherId, teacherName, baseAmount, status, lines, total}`; the CSV gains a `teacher_name` column: **`teacher_id,teacher_name,base_salary,total,status`** (a name with a comma or quote is CSV-quoted; empty cell when not found). `teacherName` is **`null`** when the id has no row in `public.teachers`.
- **How:** one read-only SELECT of `public.teachers` per overview / slip (display only, not an FK, never written): nickname first (how coaches are known), else name. A new `SalaryStore.teacherNames(ids)`; the Drizzle store does the lookup, the in-memory store has a settable map for tests.
- **Proof:** `bunx tsc --noEmit` = 0 (pinned typescript 5.6.3) · suite **all green** (salary tests now 19: overview + slip + CSV carry the name, null for an unknown id, quoted-name CSV cell) · **the REAL lookup on sid, read-only** (host-only check first): asked 3 real + 1 unknown id (+1 duplicate) → 3 names back, the unknown id absent, empty list → 0 entries; no name printed.
- Heads-up for Fern: one field is **new on the overview rows and the slip**, the CSV column order changed (name inserted after `teacher_id`). Nothing else in the contract moved.
Starting TASK-871 now. Ball: Jason (TASK-871).

## Fern (FE) 2026-11-08 — TASK-866 follow-up: satang switch done; shell polish partly done
- **Money = integer satang both ways** as you answered: FE types/`toSatang` now take integers only, the add-line POST sends `{amount: <int satang>, label}`. Re-ran the full stub proof with a satang stub — same results (total 29,000.50; remove → 27,500.00; lock read-only; CSV baht 2dp). `tsc` 0 · `next build` 0. teacherName (id fallback), bare bodies, `code==="LOCKED"` unchanged. **Still not run against the real BE** — I integrate when Jason's teacherName add is in (tell me, or I check inbox/FE.md).
- **REQ-5010 polish:** (1) theme `primaryColor` green → `orange`, one line in `AppProviders.tsx`. **Caveat:** the shell's green is hard-coded in ~57 places (Tailwind `primary`/`success`, `color="green"` incl. other teams' files and the sidebar's active item), so the app is only partly orange; a full orange is a sweep through other desks' files — say if you want it as a TASK. (2) Nav order: the nav has no Notifications/Setting items yet (the current groups are REPORTS/REVENUE/ITEMS/SALARY), so nothing to move; I'll apply "bottom" when they land.
- unhandled-between-tests: 0 · git status = only claimed files (+ AppProviders.tsx, one line) · no git command run.
Ball: Sober (aware) · Fern (integrate on Jason's teacherName).

From Porter 2026-11-08: (1) NUMBER CLASH: your link-3 file is TASK-873, but TASK-873 is already Flash's (revenue wording, DONE, on the board and in the log). Renumber yours with `node ai-worker/new-id.mjs TASK <slug>` and tell me the new id. (2) BLOCKER from Silver: 0009 shipped without `bo.pay_slip_line.source_ref` (+ partial unique index, needed by TASK-867's write) and `bo.salary_profile.vehicle` (needed by TASK-868). Both are additive and nullable, on your tables. Have Jason ship them as BB migration 0010 via the queue (about 1 h), before 871 or folded into 871's first migration, your call. Tell me which, and I relay it to Silver. (3) 2nd BE on 871: no. Brew went to Team B's TASK-863. Jason keeps 871.

## Fern (FE) 2026-11-08 — REQ-5010 shell polish IN: orange app-wide (nav item: nothing to move yet)
- **Orange done app-wide:** Mantine `primaryColor` orange + Tailwind `primary` #fd7e14 (so the sidebar brand tile / active item / eyebrows follow) + `lib/ui/colors.ts`; 30 brand `color="green"` props (buttons, loaders, tabs, switch, role badge, login) → orange, incl. the old ERP pages and the revenue loader (colour props only, no logic); 8 eyebrows. **Green kept where it MEANS something** (income / success / locked / positive P&L). Verified on the stub: login + pay-run screenshots orange, 0 console errors, `tsc` 0, `next build` 0.
- **Nav order:** the left nav has NO Notifications or Setting items today (groups: REPORTS · REVENUE · ITEMS · SALARY), so there is nothing to move. When those pages exist, add them to `PAGE_RULES` with a `bottom` flag — I'll do it with the page, or tell me if you want the mechanism now.
- Touched files outside my own (colour only): BoItems/BoTags/Dashboard/FreelanceBudgets/FtptSalary/Items/Revenue partials, PagePlaceholder, login. No git command run. unhandled-between-tests: 0.
Ball: Sober (review) · Fern (integrate TASK-866 when you ring that teacherName is sid-live).


## Jason (BE) 2026-11-08 — TASK-871 BUILT: F3 people model + R1.4 pay period; migration 0010 applied on sid — GREEN
**State:** `bunx tsc --noEmit` = 0 (pinned typescript 5.6.3; the unpinned `bunx tsc` pulled a native build that panicked on this machine, so I pin it) · suite **334 pass / 0 fail** (22 files) · `payPeriodRange` and `roleOfDay` unit-tested **first**, before anything used them · migration `0010_bo_people_model_pay_period` **applied · verified on sid, host named** · the real store proven on sid in a rolled-back transaction · **no scheduler file touched** · no git command run.

**What I built (my claim):** `src/lib/pay-period.ts` (`payPeriodRange`) · `src/lib/role-of-day.ts` (`roleOfDay`, `effectiveRoles`, `rolesProblem`, `dayOfWeek`) · `src/db/schema.ts` (`boPayClassType`, `boVehicle`; `salary_profile` +`roles`/`meritEligible`/`vehicle`; `pay_period` +`periodStart`/`periodEnd`; `boFlRate`) · `drizzle/0010_bo_people_model_pay_period.sql` + journal · `src/lib/migration-witness.ts` · `salary.service.ts` / `salary-db.store.ts` / `salary-memory.store.ts` (profile merge, FL rates, period dates) · `src/routes/salary.ts` (2 FL-rate routes; profile PUT extended) · tests `src/lib/pay-period-role-task871.test.ts`, `src/routes/salary-people-task871.test.ts` (+ 2 of my TASK-865 assertions updated for the new shapes). No new env key. (The `hours-reader*`, `bonus-rules`, `pub-timetable`, `schema-salary-b-read` files in the tree are the second BE's, not mine.)

**Unit tests, shown (all pass):** `payPeriodRange(2026, 10)` = **2026-09-30 … 2026-10-30** (the customer's "30/9–30/10") · Nov 2026 = 10-31…11-29 · Jul/Aug (31-day) end on the 30th · **Dec 2026 = 11-30…12-30** · **Jan 2027 = 2026-12-31…2027-01-30 (crosses the year)** · **Feb common 2027 = 01-31…02-27, leap 2028 = 01-31…02-28** · March after a leap Feb starts 2028-02-29 · consecutive periods tile with no gap/overlap (next start = this end + 1 day) · bad month/year throws. `roleOfDay` PT+FL across Mon 2026-11-02 … Sun 11-08 = **FL FL FL FL FL PT PT**, either primary type or role order; every pure type = itself all 7 days; empty roles = employmentType; month/year-boundary dates (Sat 10-31 PT, Sun 11-01 PT, Mon 11-02 FL; 2026-12-31 Thu FL, 2027-01-02 Sat PT) use the date string, never a timezone; malformed date throws; `rolesProblem` allows one role or exactly PT+FL.

**Design choices (documented; tell me if wrong):**
1. **Multi-role = a `roles bo.employment_type[]` column on `salary_profile`** (NOT NULL, default `{}`): **empty ⇒ just `employment_type`**, so every existing row works untouched. A person holds one role, or **exactly PT+FL**; `employmentType` must be one of the roles (for PT+FL it is PT or FL). A lone role is stored as `[]`. The API returns `roles` as the *effective* set (never empty).
2. **`PUT /salary/profiles/:teacherId`** keeps its SPEC-100 body; `roles?`, `meritEligible?`, `vehicle?` are **optional and, when omitted, keep the stored value** (`vehicle: null` clears it). `GET /salary/profiles` and the PUT return `{teacherId, employmentType, roles, baseSalary, active, meritEligible, vehicle}`.
3. **FL rates:** `bo.fl_rate(profile_id FK→salary_profile cascade, class_type, rate numeric)`, UNIQUE(profile_id, class_type). `GET /salary/profiles/:teacherId/fl-rates` → `[{classType, rate}]` in class order (`private, duo, group, eca, camp`; only types that have a rate); `PUT …/fl-rates/:classType {rate}` → `{classType, rate}`. **`rate` = integer satang PER HOUR** (same convention as SPEC-100); 0 is allowed; negative / fractional / bad class type = 400; unknown person = 404 (a rate needs the person's profile first). I did **not** restrict rates to people holding FL (a rate can be set before the role).
4. **Period dates:** `periodStart` / `periodEnd` are **nullable `date`** (existing rows stay NULL, no back-fill, as you said) and set on `createPeriod` from `payPeriodRange`; both come back as `YYYY-MM-DD` strings on the period in list / overview / slip / lock. `year`/`month` remain the label; **`lock_at` is unchanged** (12:00 Bangkok on the last day, one day after `period_end` — per SPEC-101 §3).
5. The **pay run is unchanged**: still only ACTIVE **FT** profiles (a PT+FL person gets no slip until link 3).

**Migration through the queue (two lines, F-038):** host-only check passed (the shell's `DATABASE_URL` host == 154.197.124.206 = sid, a boolean) before every DB command → `applying` → `drizzle-kit migrate` exit 0 → `db:verify`: **Journal 11 · ledger 12 rows · Schema witnesses 9 applied**, no NOT-recorded line → `applied · verified` line **names the host**. Ledger `drizzle.__drizzle_migrations_bo` **id 12 · created_at 1794146072037 · hash 6fbfe84ffb3d**. Read of the host: `bo.pay_class_type` = **private,duo,group,eca,camp** (link 2 can build on it now) · `bo.vehicle` = car,motorbike · `salary_profile` +`roles` (array, NOT NULL) / +`merit_eligible` (NOT NULL) / +`vehicle` · `pay_period` +`period_start` / +`period_end` (date, nullable) · `bo.fl_rate` 6 columns, FK `fl_rate_profile_id_salary_profile_id_fk`, unique `bo_fl_rate_profile_class_uq`; 0 rows; nothing seeded; additive only (nothing dropped / truncated / pushed). ⚠️ honest note: the first `db:verify` I ran right after the first migrate printed 0010 as "not recorded" (ledger 11 rows); a re-run of migrate (no-op) and the next verify show it recorded, and the ledger read has id 12 from the first run.

**Done list:**
- **FL-rate + merit + vehicle round trip, DB-less (`salary-people-task871.test.ts`):** set / update / read back FL rates in class order, an update upserts (no duplicate), a second person's rates untouched; 0 allowed, −1 / 1.5 / "yoga" = 400, unknown person = 404; profile PUT with `roles:[PT,FL]` + merit + vehicle round-trips; an old-style PUT keeps them; `vehicle:null` clears; invalid role combos (FT+PT, STAFF with PT+FL, a lone role ≠ employmentType) = 400; the pay run still creates slips for active FT only; period dates for Oct 2026 / Jan 2027 / Feb 2028 on `createPeriod`, the overview and the list.
- **`requireRole("ceo")` on the new routes:** `GET …/fl-rates`: **ceo 200 · admin 403 `FORBIDDEN` · coach 403 · no token 401**; `PUT …/fl-rates/:classType` and the extended profile PUT: admin 403, coach 403, no token 401; the route-table walk now asserts **all 13 routes** are behind `requireRole`.
- **The REAL store + service on the REAL tables on sid, one transaction ALWAYS rolled back (host-only check first; scratch script, not in the repo): 14 of 14 PASS** — PT+FL profile round-trips roles/merit/vehicle (the Postgres enum array), `roleOfDay` on the stored roles (Wed FL, Sat PT), an update without the new fields keeps them, merit off + vehicle cleared with null, a pure FT stores `[]` and reads `[FT]`, invalid roles 400, FL-rate upsert on the composite unique (private 45,000 updated not duplicated + group 25,000, class order), another person untouched, unknown person 404, period dates `2099-09-30…2099-10-30` and Jan `2098-12-31…2099-01-30` stored and read back, the overview carries them, the run still takes FT only — and **`left behind after rollback: {"profiles":0,"periods":0,"fl_rates":0}`**.
- `git status` (backoffice-back): my files above; the second BE's hours-reader files and Team C's revenue files are also in the tree (not mine); **no `smart-scheduler-back` file touched**. Demo seed unchanged and still NOT run.
**Heads-up for Fern / Team B:** periods now carry `periodStart`/`periodEnd`; the profile object has `roles`/`meritEligible`/`vehicle`; money in FL rates is satang per hour. Nothing else in the SPEC-100 contract moved.
**Frozen** until your review. Ball: Sober.


## Jason (BE) 2026-11-08 — Silver's prerequisite is ON SID: `source_ref` + the partial-unique index (as migration **0011**, because 0010 had already shipped)
**One correction to your numbering, so nobody waits on the wrong file:** I had already built and applied **0010 = TASK-871's migration** (`vehicle` + `roles` + `merit_eligible` + `period_start/end` + `bo.fl_rate` + the `pay_class_type` enum; ledger id 12, reported in my TASK-871 entry), so `salary_profile.vehicle` **is already on sid**. What was still missing was `source_ref` and the index, so they went into the next slot: **`0011_bo_pay_slip_line_source_ref`**, applied · verified on sid just now.
- **What 0011 is (additive, idempotent, nothing else):** `bo.pay_slip_line.source_ref text NULL` and the **partial unique index `bo_pay_slip_line_auto_ref_uq` on `(slip_id, kind, source_ref) WHERE source = 'auto'`**. A manual line has no `source_ref` and is outside the index. TASK-867 / 868 / 878 can write auto lines against it now.
- **Queue + host (F-038):** host-only check (host == 154.197.124.206 = sid) before every DB command; `applying` line, `drizzle-kit migrate` exit 0, `db:verify`: **Journal 12 · ledger 13 rows · Schema witnesses 10 applied**, no NOT-recorded line; the `applied · verified` line **names the host**. Ledger `drizzle.__drizzle_migrations_bo` **id 13 · created_at 1794146584908 · hash 771481ec70f9**. Read of the host: `pay_slip_line.source_ref: text NULL`; index def `bo.pay_slip_line USING btree (slip_id, kind, source_ref) WHERE (source = 'auto')`; `salary_profile.vehicle` present.
- **Behaviour proven on sid in a transaction I always roll back (5/5 PASS, `left behind: periods 0`):** a first auto bonus line inserts; the **same (slip, kind, source_ref) auto line again is refused (23505)**; a different ref is allowed; two **manual** lines with the same ref are fine (outside the index); manual lines with no `source_ref` are unconstrained.
- `tsc` 0 · suite 412 / 0 (the tree now holds the other BE's hours-reader tests too). No scheduler file, no git.
**For Porter → Silver:** `source_ref` and the idempotency index are on sid; `vehicle` was already there since 0010. TASK-871's remaining work needs no further migration (everything it needed is 0010; vehicle is not re-added). Frozen on TASK-871 as reported; Ball: Sober.

## Fern (FE) 2026-11-08 — TASK-866 INTEGRATION GREEN (against the real BE code, in-memory store — not sid itself)
- **Honest scope:** I can't log in on sid or run Postgres, so I ran the **real** `routes/salary.ts` + `salary.service.ts` + `requireRole("ceo")` + `signToken` from the back repo in a throwaway Bun harness (in-memory store; only `/auth/login` is a stand-in) and drove the built front against it in headless Chromium. A click-through on sid needs someone allowed to log in there.
- **Green:** admin NO-ACCESS on both screens (and the real API: admin 403, no token 401, duplicate month 409 `PERIOD_EXISTS`) · create period (shows the BE's range + lockAt) → Run → 3 slips with **teacherName** (null name falls back to the uuid), Σ base 63,000.50, 2nd Run refreshes 3 · slip: +1,500.50 and −500.00 → 26,000.50 (BE-computed), remove → 24,500.00, overview follows · CSV `teacher_id,teacher_name,base_salary,total,status` downloaded, 3 rows · Lock → both screens read-only, Export still on · a past month made from the UI comes back locked by the real lazy auto-lock. 0 unexpected console errors; `tsc` 0, `next build` 0.
- **One contract move I picked up beyond teacherName:** periods now carry `periodStart/periodEnd` (TASK-871); the FE shows "ช่วงจ่าย 31 ต.ค. – 29 พ.ย. 2026" on the pay run and the slip (blank if null).
- **Not proven:** a real 12:00 tick; the duplicate-month message *in the UI* (API answer proven, my UI check matched the wrong alert); sid itself.
- No git command run; unhandled-between-tests: 0; git status = claimed files + the orange-sweep files already reported. Details: tasks/TASK-866 `### Integration`.
Ball: Sober (review → DONE).

From Porter 2026-11-08 (relay, Silver): TASK-861 "No Teacher" is DONE (0075 on sid). Team A's back-office readers of `public.teachers` (e.g. TASK-865 roster / teacherName, 871, 878) must skip `teachers.is_system = true`, or "No Teacher" (type FREELANCE) shows up as a person on the pay run. Please carry this into Jason's work.

From Porter 2026-11-08: 🟢 OWNER GIT COMMAND, verbatim: "ขึ้น git หลังบ้านได้เลย", meaning **ขึ้น git** on **smart-scheduler-backoffice-back** and **smart-scheduler-backoffice-front** (branch dong), and those 2 repos only. Per the `git-command` skill: the repo's commit-message convention, commit + sync. It is a save point, no deploy and no merge. All 3 teams' work is in these trees: Jason 878, Brew 867, Fanta 862, Fern 866. Note in your report any file that is mid-edit or red (tsc) at commit time. Never commit `.env*`. Reply with the commit hashes per repo, and I put them on the first line to the owner.

From Porter 2026-11-08: deploy timing, my call: **WAIT for TASK-878**, so the first backoffice sid deploy carries the whole spine. That is one owner deploy + login instead of two, and the demo window (≈ 20–23 Nov) allows it. When 878 is accepted, prep the deploy note (BEFORE checks, the migration list 0007–0011 already on sid, env keys) and tell me. I take it to the owner. is_system: noted, and I'll tell Silver.
