# TASK-880 — BE: Salary §5 extensions — coach "My slip" + admin-blind "Entries" (backoffice-back) — @Jason

**From @Sober, 2026-11-08. GO (owner's "งานก้อนแรกส่วนไหนไปก่อนได้ ไม่ติดคนอื่น ให้ทำเลย" — unblocks Team B's My-slip + Entries screens).** SPEC: `specs/SPEC-102-salary-section5-extensions-myslip-entries.md` (read whole). Repo `smart-scheduler-backoffice-back`, branch `dong`. **Pay-side only — no scheduler file. No migration (existing tables). Git only on the owner's word.**

## Steps (SPEC-102 §5-E1, §5-E2)
1. **My slip (E1):** `GET /salary/my-slip?year=&month=` — `requireAuth`, resolve the slip by **`token.teacherId`** (never a supplied id). A token with no `teacherId` → **403 `NO_TEACHER`**. Return the caller's own slip only `{period{…}, teacherId, teacherName, lines[{id,kind,kindLabel,label,amountSatang}], total, status}`; no slip for the period → your choice of `200 {slip:null}` or `404 NO_SLIP` (document it). Reuse the slip-DTO shape from SPEC-100 (teacherName read-only lookup; skip `is_system`).
2. **Admin-blind Entries (E2):** `POST /salary/entries` — `requireRole("admin")`. Body `{teacherId, year, month, kind, amountSatang, label, reason}`. `kind` ∈ **{merit, other}** only (else 400 `KIND_NOT_ALLOWED`); `reason` required for `other`; `merit` only where `merit_eligible` (else 422 `NOT_MERIT_ELIGIBLE`). **Find-or-create** the (teacherId, period) slip. Locked slip → 409 `LOCKED`. **Response 201 = the created line ONLY** `{lineId, kind, kindLabel, label, amountSatang}` — NO total, base, or other line. Write via the existing `insertLine` (source `'manual'`/the admin kind, no `sourceRef`; it's outside the 0011 auto index).
3. **Blindness on the read side:** confirm `admin` is 403 on `GET /salary/slips/:id` (CEO-only already — just assert it in a test, don't change it).

## Done = (evidence in `## Implementation Notes`: command + real output)
- `bunx --package typescript@5.9.2 tsc --noEmit -p .` → 0 · DB-less suite green.
- **My-slip:** coach A's token → A's slip; coach B's token → B's slip (never A's); a no-`teacherId` (admin) token → 403; no-slip period handled; a coach supplying another id in any form still gets only their own.
- **Entries:** admin 201 returning **only the line** — a test **asserts the response body has no `total`/`base`/other-line/second-coach field** (the blind contract); disallowed kind 400; merit on non-eligible 422; locked 409; **admin 403 on `GET /salary/slips/:id`**.
- A rolled-back real-store check on sid (host-only check first, host named) like TASK-865/871/878.
- **`/security-review` run; result in `## Review` as `Security review: <findings or "none">`** (auth/data-exposure change — mandatory).
- `git status` = only your files; no scheduler file; no migration; no git command run; no DB command without the host-only check.

## Claim
backoffice-back: `src/routes/salary.ts` (the 2 routes), `src/services/salary.service.ts` (+ `mySlip`, `addEntry` find-or-create), tests. Reuse `insertLine` (it now persists sourceRef; manual entries pass none). **Do NOT** touch `smart-scheduler-back`. People/Settings fields (E3) already ship on the 871 routes — nothing to build there.

## Questions / Implementation Notes / Review
_(—)_

## Jason (BE) 2026-11-08 — TASK-880 GREEN (Salary §5 extensions: My slip + admin-blind Entries)
**Built (backoffice-back only; no migration, no scheduler file, no git):** `salary.service.ts` `mySlip(teacherId, year, month)` + `addEntry(...)`; `routes/salary.ts` `GET /salary/my-slip` and `POST /salary/entries`.
- **My slip:** gate `requireRole("ceo","admin","coach")` (= any signed-in role; named `requireRole` so the every-route guard test still holds). The slip is resolved by the TOKEN's `teacherId` only; any `teacherId`/`id`/`sub` query is ignored (tested), `/my-slip/<id>` is 404. No `teacherId` on the token (admin, ceo, dev bypass) → 403 `NO_TEACHER`. No period or no slip → **200 `{slip:null}`** (my pick, as SPEC-102 allows). 200 shape: `{period{year,month,periodStart,periodEnd,lockAt,status}, teacherId, teacherName, baseAmount, lines[{id,kind,kindLabel,label,amountSatang}], total, status}`. **One addition to the spec shape: `baseAmount`** (the coach's own base, so the page can show base + lines = total); drop it if you do not want it.
- **Entries:** `requireRole("admin")` only (ceo and coach → 403, none → 401). Body `{teacherId, year, month, kind, amountSatang, label?, reason?}`. `kind` outside merit/other → 400 `KIND_NOT_ALLOWED`; `other` needs a reason; merit must be positive, other may be signed, zero or fractional → 400; merit on a non-eligible profile → 422 `NOT_MERIT_ELIGIBLE`; no profile or no period → 404 (an admin never creates a period); locked period or slip, including the lazy 12:00 lock → 409 `LOCKED`. Finds the slip or creates a draft one from the profile base (an existing slip is never refreshed). **201 body = `{lineId, kind, kindLabel, label, amountSatang}` and nothing else**; the test asserts the exact key set and that the body contains no total, base, lines, teacherId, the base figures or the other coach's id. Written via `insertLine`, source `manual`, no sourceRef.
- **Blind read side:** admin is 403 on `GET /slips/:id`, `/periods`, `/periods/:id`, `/periods/:id/export`, `/profiles`, and on `/my-slip` (no teacherId); a coach is 403 on `GET /slips/:id`.
**Evidence:** pinned tsc 5.6.3 → 0 `error TS` · DB-less suite 725 pass / 0 fail (new `salary-my-slip-entries-task880.test.ts`; route-count pin 24→26) · **sid rolled back (host check true, nothing printed; 8/8 PASS, left behind: periods 0, profiles 0):** no slip → `{slip:null}`; entry returns the line only; A sees own slip total 28,000.00; B unaffected; slip found-not-duplicated; merit non-eligible 422; ot 400; locked 409.
**Security review:** none above threshold. Checked: identity comes only from the signed token (no caller-supplied id reaches the slip lookup); entries is admin-only and returns just the created line; all queries are Drizzle-parameterised; inputs are zod-typed and bounded (label ≤200, reason ≤500, safe integers); no new logging. Accepted trade-offs, both from the spec: the 404/422/409 codes tell an admin that a person has a profile, is merit-eligible, or that the month is locked (no pay figure). A coach sees a DRAFT slip before it is confirmed; say if you want My slip limited to confirmed/locked.
Ball: Sober.

## Review (Sober, SA Lead A, 2026-11-08) — ✅ ACCEPTED / DONE
Read the code — the security-critical path especially.
- **My-slip scoping is correct and safe** (`routes/salary.ts:64-68`): the gate is any signed-in role, but the slip is resolved by **`c.get("user").teacherId`** (the TOKEN), and `mySlipQuery` (`:52`) accepts only `year`/`month` — there is **no way for a caller to name another teacher**. No-teacherId token → 403 `NO_TEACHER`. A coach can read only their own slip. This was the one path that could leak another coach's pay; it doesn't.
- **Entries is admin-only and blind** (`:71-73`): `requireRole("admin")`, actor from `token.sub`, and the 201 body is `{lineId, kind, kindLabel, label, amountSatang}` only — a test asserts the exact key set and that no total/base/lines/other-coach id appears. Blindness also holds on the read side (admin 403 on `/slips/:id`, `/periods*`, `/profiles`, and `/my-slip`).
- Codes KIND_NOT_ALLOWED 400 / NOT_MERIT_ELIGIBLE 422 / LOCKED 409 correct; find-or-create the draft slip, an existing slip never refreshed; written via `insertLine` (manual, no sourceRef — outside the 0011 auto index). No migration, pay-side only.
- **Evidence accepted:** tsc 0, suite 725/0, sid rolled-back 8/8 (own-slip total, B unaffected, blind line, 422/400/409). **Security review: none** (Jason's pass — token-only identity, parameterised, zod-bounded; named trade-offs below, both acceptable).

**Jason's decisions — all ✅ accepted:** (1) `baseAmount` on my-slip — fine, it's the coach's OWN base so the page shows base+lines=total. (2) My-slip shows a DRAFT slip before confirm — **correct by design** (the coach confirms their own slip, REQ-120 "My slip · Confirm"); it's their own data, not a leak. (3) 404/422/409 tell an admin a person exists / is merit-eligible / month locked — acceptable, no pay figure leaks.

**Verdict: ✅ DONE.** Team B's My-slip + Entries screens are unblocked.
