# SPEC-102 — Salary §5 extensions: coach "My slip" + admin-blind "Entries" (REQ-120 R0.2/R0.3)

**Author: Sober (SA Lead A), 2026-11-08.** Extends SPEC-100 §5 (the thin-slip + money-grade slip contract) with the two access-scoped paths Team B needs for its screens (Silver relay, SA.md 2026-11-08). Repo `smart-scheduler-backoffice-back` (branch `dong`). **Pay-side only; no scheduler file.** Builds on the as-built auth (SPEC-097: token `{sub, role, teacherId}`, `requireAuth`/`requireRole`). Money = integer **satang** over HTTP (SPEC-100). Error envelope `{error:{code,message}}`. **Git only on the owner's word.**

## Why / the two access facts this encodes
- **R0.2 — a coach sees ONLY their own slip** ("ครูเห็นเฉพาะของตัวเองค่ะ" · "Own slip only (My slip)", CUSTOMER-ANSWERS). The CEO-only `GET /salary/slips/:id` already exposes any slip to the CEO; a coach must reach **only their own**, never another's, never a total that isn't theirs.
- **R0.3 — admin-blind entries** ("ทีมงานแก้ไขได้ … เพิ่มเข้าไปได้ โดยไม่เห็นเงินเดือนทั้งหมดของครู", QS12). An **admin** may ADD a line (merit / other income) to a coach's slip **without seeing any pay total or any other line**. Admin never reaches the CEO-only slip read.

## §5-E1 — My slip (coach reads own)
`GET /salary/my-slip?year=<YYYY>&month=<1-12>`
- **Auth:** `requireAuth` (any authenticated user whose token carries a `teacherId`). **NOT** CEO-only. A token with no `teacherId` (e.g. a pure admin) → **403 `NO_TEACHER`**.
- **Scope:** the slip is resolved by **`token.teacherId`** (never a path/query id the caller supplies — a coach cannot name another teacher). 
- **Response 200:** `{ period: {year, month, periodStart, periodEnd, lockAt, status}, teacherId, teacherName, lines: [{id, kind, kindLabel, label, amountSatang}], total, status }` — the caller's **own** slip only.
- **No slip for that period → 200 with `slip: null`** (or 404 `NO_SLIP` — BE picks one, documents it; FE handles "no slip yet").
- A coach **cannot** reach `GET /salary/slips/:id` (that stays CEO-only); `my-slip` is their only read.

## §5-E2 — Admin-blind Entries (R0.3)
`POST /salary/entries`  — admin adds one line to a coach's slip, blind to pay.
- **Auth:** `requireRole("admin")` (CEO uses the full `POST /slips/:id/lines` instead; this route is for the blind admin path). 
- **Body:** `{ teacherId, year, month, kind, amountSatang, label, reason }` — `kind` ∈ the **admin-enterable** set only: **`merit`, `other`** (NEVER the auto kinds `fl_pay`/`extra_hour`/`ot`; a disallowed kind → 400 `KIND_NOT_ALLOWED`). `reason` required for `other` (signed amount allowed for `other`, like SPEC-100's Other±); `merit` only where the profile is `merit_eligible` (else 422 `NOT_MERIT_ELIGIBLE`). The route **finds-or-creates** the coach's slip for (teacherId, period) so admin need not — and must not — see it first.
- **Response 201 — the created line ONLY:** `{ lineId, kind, kindLabel, label, amountSatang }`. **NEVER** the slip total, the other lines, the base salary, or any other coach's data. This is the blind contract — the response body is the single enforcement point, so it is tested explicitly.
- **Locked period:** a locked slip refuses the write → **409 `LOCKED`**.
- Admin has **no** read route that exposes totals; `GET /salary/slips/:id` and `/my-slip` both exclude the admin (the latter by the missing `teacherId`).

## §5-E2b — the Entries people picker (added 2026-11-08 — Fern TASK-882 Q1; the gap that blocked Entries on sid)
The Entries screen needs the admin to pick a coach, but `/salary/profiles` is CEO-only, so an admin had no way to list people. Add an **admin-safe** people list (names only, **no pay**):
`GET /salary/entries/people` — **`requireRole("admin","ceo")`** → `[{ teacherId, name, meritEligible }]`, ordered by name.
- **No pay of any kind** — no base, no total, no slip. Only the id, the display name (nickname→name via the read-only `public.teachers` lookup), and `meritEligible` (so the UI can disable Merit for a non-eligible coach).
- **`is_system = true` ("No Teacher") is excluded** server-side (never a pay target).
- Active profiles only. This is the one list an admin may see; it reveals who is an employee (same fact R0.3's codes already reveal) and no pay — safe.

## §5-E3 — People / Settings fields — already shipped (no new BE)
The People/Settings screens (Team B, Fanta) read/write `roles`, `merit_eligible`, `vehicle`, and FL rates through the **TASK-871 routes already on sid**: `GET/PUT /salary/profiles/:teacherId` (returns `{teacherId, employmentType, roles, baseSalary, active, meritEligible, vehicle}`) and `GET/PUT /salary/profiles/:teacherId/fl-rates`. All CEO-only. **No new BE for this item** — documented so Team B builds its screens on the existing contract.

## Done (the BE TASK-880 proves)
- My-slip: own coach 200 (own slip only), a second coach's token gets ITS own (never the first's), a no-`teacherId` token 403, no-slip period handled, and a coach cannot read another via any id.
- Entries: admin 201 returning **only the line** (a test asserts the body has no total/base/other-line field), disallowed kind 400, merit on a non-eligible profile 422, locked 409, and **admin 403 on `GET /salary/slips/:id`** (blindness holds on the read side too).
- Integer satang; error envelope; no migration (existing tables); pay-side only; no scheduler file; `/security-review` (this is an auth/data-exposure change — mandatory).

## §5-E4 — R1.5: the coach confirms their own slip + the CEO "remind now" (addendum, 2026-11-08, Porter staffing — Bob builds, Silver reviews, Sober checks repo-fit)
REQ-120 R1.5 / Khwan: a coach confirms their **own** slip by the last day of the month before 12:00; the system reminds (1 h / 3 h on LINE); if still unconfirmed at 12:00, the lazy auto-lock pays the web amount, no edit. This addendum adds the **confirm** and **remind** routes; the LINE push itself is a later integration (OUT — the remind route surfaces who to remind). It touches existing tables only — **no migration.**

### The slip status states (already `status` on `bo.pay_slip`, SPEC-100)
`draft` (a.k.a. Pending) → **`confirmed`** → `locked` (AUTO-LOCKED at 12:00 on confirm day, the existing lazy lock). Confirm moves `draft → confirmed`. Lock is unchanged (the lazy 12:00 auto-lock from SPEC-100). A `confirmed` slip stays confirmed until it locks.

### E4a — the coach confirm (own-only)
`POST /salary/my-slip/confirm` — body `{ year, month }`.
- **Auth:** `requireAuth`; the slip is resolved by **`token.teacherId`** (never an id the caller supplies — a coach confirms only their own, exactly like `GET /salary/my-slip`). No `teacherId` on the token → **403 `NO_TEACHER`**.
- `draft → confirmed`. **Idempotent:** confirming an already-`confirmed` slip returns 200 with the slip (no error). A **`locked`** slip → **409 `LOCKED`** (after 12:00 the web amount stands; nothing to confirm). **No slip** for the period → **404 `NO_SLIP`**.
- **Response 200:** the coach's own slip DTO (same shape as `GET /salary/my-slip`) with `status:"confirmed"`.
- After `confirmed`, the coach's slip is **read-only to the coach** (they have agreed). **RESOLVED 2026-11-08 (Khwan 10-14 QS12; Silver's TASK-887 review):** an **admin Entries write after a coach's confirm is ALLOWED, and the slip STAYS `confirmed`** — `addEntry` gates only on the period lock, not the confirm status (Khwan: *"ทีมงานแก้ไขได้ … เพิ่มเข้าไปได้"*). The confirm is the coach's agreement to the figures they saw; a later admin line does not re-open it. Pinned by a test (TASK-887).

### E4b — the CEO "remind now" (CEO-only)
`POST /salary/periods/:id/remind` — **`requireRole("ceo")`**.
- Returns the **unconfirmed targets** for the period: `[{ teacherId, name, status }]` for every active profile whose slip is **not** `confirmed`/`locked` (i.e. a `draft` slip, or no slip yet) — `name` via the read-only `public.teachers` lookup, `is_system` excluded. This is the list the CEO/system reminds.
- **The actual LINE send is IN scope** (REQ-120 l.68–69, l.279 — owner 11-07 "รวมให้ทั้งหมด"), but it is **not in Bob's E4 routes** — it is its own block-1 TASK (**TASK-888**: the 09:00 + 11:00 scheduled pushes + the remind-now send, through smart-scheduler-back's existing LINE integration). E4b just returns the unconfirmed list (the targets) and may stamp a `reminded_at`; TASK-888 does the sending and consumes this list / triggers on remind-now.
- No pay in the response (names + status only) — same admin-safe shape rule as §5-E2b.

### Done (Bob's TASK proves)
- Confirm: a coach confirms their OWN slip (`draft→confirmed`), a second coach can only confirm their own (never the first's), no-`teacherId` 403, locked 409, no-slip 404, idempotent re-confirm 200.
- Remind: CEO 200 with the unconfirmed list (no pay field — assert it), admin/coach 403, no token 401; a `confirmed`/`locked` slip is NOT in the list; "No Teacher" absent.
- Integer satang; error envelope; **no migration**; pay-side only; no scheduler file; mandatory `/security-review` (auth + data-exposure). Reuse `insertLine`/the slip read; the confirm is a `status` update on `bo.pay_slip`.
