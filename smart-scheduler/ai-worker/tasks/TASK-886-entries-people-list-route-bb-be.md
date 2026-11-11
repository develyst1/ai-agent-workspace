# TASK-886 — BE: the Entries people picker — `GET /salary/entries/people` (admin-safe, names only) (backoffice-back) — @Jason

**From @Sober, 2026-11-08. GO (unblocks Fern's TASK-882 Entries on sid — her Q1).** SPEC: `SPEC-102 §5-E2b`. Repo `smart-scheduler-backoffice-back`, branch `dong`. **Team A — your `salary.ts` / `salary.service.ts`.** Pay-side only; no migration; no scheduler file; git only on the owner's word. **Small (~0.5 d).**

## What to build
`GET /salary/entries/people` — **`requireRole("admin","ceo")`** → `[{ teacherId, name, meritEligible }]`, ordered by `name`.
- **No pay of any kind** in the response — no base, no total, no slip, no rate. Only `teacherId`, the display `name` (nickname→name via the read-only `public.teachers` lookup you already use for `teacherName`), and `meritEligible` (so the FE can disable Merit for a non-eligible coach).
- **Exclude `is_system = true`** ("No Teacher") server-side.
- **Active profiles only.**
- A `listEntriesPeople()` on the service + store (the DB store joins `salary_profile` to the read-only `public.teachers` name lookup, `not is_system`; the in-memory store returns its profiles' names).

## Done = (evidence in `## Implementation Notes`)
- `bunx --package typescript@5.9.3 tsc --noEmit` 0 · DB-less suite green · route-count pin updated + tagged.
- Tests: **admin 200** with `[{teacherId,name,meritEligible}]` and **no pay field** (assert the exact key set — no base/total); **ceo 200**; **coach 403**; no token 401; "No Teacher" (`is_system`) absent; inactive absent; ordered by name.
- A rolled-back real-store check on sid (host-only check first) OR a DB-less proof (your call, documented) that the name join + `not is_system` work.
- `git status` = only your files; no migration; no scheduler file; no git command.

## Claim
backoffice-back: `src/routes/salary.ts` (one tagged route), `src/services/salary.service.ts` + the store(s) (`listEntriesPeople`), tests. **I (Sober) review** — Team A. **Mandatory `/security-review`** (new admin-accessible read — confirm no pay leaks, names only).

## Questions / Implementation Notes / Review
_(—)_

## Jason (BE) 2026-11-08 — TASK-886 GREEN (Entries people picker: `GET /salary/entries/people`)
**Built (backoffice-back; no migration, no scheduler file, no git):** `requireRole("admin","ceo")` route (tagged `🔻 TASK-886`, route-count pin 28→29) → `service.listEntriesPeople()` → store `listEntriesPeople()` on both stores. Response `[{teacherId, name, meritEligible}]`, sorted by name; **no pay field** (the SQL selects only id, display name and the merit flag). Real store: `bo.salary_profile` joined to read-only `public.teachers` (nickname, else name), `where p.active and not t.is_system`, no user input in the SQL. A profile with no teacher row (so no name) is left out. Archived teachers are NOT filtered (only the profile's `active` flag and `is_system` were asked for); say if archived should drop too.
**Evidence:** pinned tsc 5.9.3 → 0 `error TS` · DB-less suite 790 pass / 0 fail. Tests: admin 200 and ceo 200 with the exact key set `{meritEligible,name,teacherId}`, ordered by name, and the body contains no base/total/rate/slip text; coach 403; no token 401; a system teacher, an inactive profile and a nameless profile are absent. **sid, rolled back (host check true; ids and names not printed; 7 PASS, ghost profiles left behind 0):** a real non-system teacher appears with a name and its merit flag; the real `is_system` teacher is absent; a profile with no teacher row is absent; every row has exactly the three keys; an inactive profile drops out. (The name-ordering assertion in that probe is weak, so ordering is proven by the DB-less test only.)
**Security review:** none. New admin-accessible read, checked: gate is admin or ceo (coach 403, anonymous 401); the response is built from a fixed three-column projection, so no pay, slip, rate or base can reach it; the SQL is static (no request input); `is_system` is excluded server-side; it reveals who has an active pay profile and who is merit-eligible, which SPEC-102 §5-E2b accepts and the R0.3 error codes already imply.
Ball: Sober (review).

## Review (Sober, SA Lead A, 2026-11-08) — ✅ DONE
Code-read: `GET /salary/entries/people` is `requireRole("admin","ceo")` (salary.ts:73); the return type is `{teacherId, name, meritEligible}[]` — **no pay/base/total/rate/slip**; the real store joins `bo.salary_profile` to the read-only `public.teachers` name, `where active and not is_system`, static SQL (no request input); a nameless/inactive/system profile is absent. Tests assert the exact key set + no pay text, coach 403, 401, system/inactive/nameless absent (790/0); sid rolled-back 7 PASS. `/security-review` done — none. **Verdict: ✅ DONE** — Fern's Entries picker is unblocked; Bob's TASK-885 Daily cleanly reuses this list.
**Your archived question:** keep `profile.active` as the pay-side gate — do **not** add a `teachers.archived` filter. A payable person's profile should be active; an archived teacher with an active profile is a profile-hygiene case (set the profile inactive), not a picker rule. Leave it as-is.
