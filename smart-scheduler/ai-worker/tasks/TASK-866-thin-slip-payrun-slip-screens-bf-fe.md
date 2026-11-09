# TASK-866 — FE: thin-slip Pay-run + Slip screens (backoffice-front) — @Fern — REQ-120 wk 2–3 (20–23 Nov demo)

**From @Sober, 2026-11-08. BUILD GO (owner, *"ไปเลย ทำไปเลย"*).** SPEC: `specs/SPEC-100-thin-slip-demo-payrun-contract.md` (read §5 contract + §6 FE). Repo `smart-scheduler-backoffice-front` (Next 16 + Mantine 9), branch `dong`. **Git only on the owner's word.**
**These are the two 20–23 Nov demo screens (DECISIONS row 1: Pay run + Slip are yours; People/Settings + the other 4 are Fanta/Team B).** Build on your own TASK-857 shell.

## Start / depend
- Build the screens against the **SPEC-100 §5 contract now** (a local stub of `/api/v1/salary/*`, as you did for TASK-857's login). Wire to the real BE when **TASK-865 is accepted + its migration is `applied · verified — sid`**. You are **not blocked** on Jason to build — only to integrate.

## Steps (SPEC §6)
1. **Pay run / month overview** (`(admin)/salary/payrun`, or `/salary` as the Salary home): create/pick a period → **Run** → a Mantine table of FT coaches: base · total · status → a **Lock** button that shows the `lockAt` (the 12:00 auto-lock) → an **Export** that downloads the period CSV. A `locked` period renders locked, actions disabled.
2. **Slip** (`(admin)/salary/slip/[id]`): one coach — base, the **Other ±** lines (reason + signed amount), the total; **add / remove an Other± line** (reason required, inline validation) while the slip is open; fully read-only when `locked`.
3. **Role/visibility:** inherit the shell's CEO-only gate (TASK-857 `PAGE_RULES`) — these are money pages, CEO-only; **confirm an admin gets NO-ACCESS** on both. Dark by default. No new role logic.
4. **Money display:** render exactly what SPEC §5 documents (satang-int or string); round only at display; signed Other± shown with its sign.

## Done = (evidence in `## Implementation Notes`)
- `tsc` 0 · `next build` 0 · 0 console errors (beyond an intended stub 4xx).
- Against the stub/real BE: create→run→overview with totals; open a slip, add two Other± lines (one negative), total updates = base + Σ; lock → both screens go read-only; export downloads a CSV.
- CEO sees both screens; **admin → NO-ACCESS on both**; dark on first paint.
- `git status` = only your claimed files. **No git command run.**

## Claim
backoffice-front: new `src/app/(admin)/salary/payrun/**`, `src/app/(admin)/salary/slip/**`, `src/components/partials/Salary/PayRun*`, `Slip*` (NOT Fanta's People/Settings/entries/daily/person partials), `src/services/salary.service.ts` + a fixture/stub, `src/types/app/salary.ts`. Inside Fern's shell; no edits to the shell's role table beyond confirming the two routes are CEO-only money pages.

## Questions (for Sober — none blocking the build; each is a one-line flip)
1. **Money format on the wire.** SPEC §5 leaves it to the BE. I read **decimal baht strings** (`"12345.50"`) and also accept a plain number (as baht); everything is summed in integer satang in the FE. If Jason sends **integer satang**, `toSatang` in `Salary/money.ts` is the one place to change. Please have TASK-865 document which.
2. **Teacher name.** The §5 overview/slip carry only `teacherId`. A uuid is no use to the CEO in a demo, so the FE shows `teacherName` when present (optional field in `types/app/salary.ts`) and falls back to the id. Can the overview + slip add `teacherName` (BE reads it from `public.teachers`)?
3. **Response bodies.** I read the bare objects exactly as §5 lists them (`GET /periods` = array, `POST …/lines` = the line, `POST …/lock` = the period). If Jason wraps them (`{period}`, `{line}` like the revenue ledger does), only `salary.service.ts` changes.
4. **Error envelope.** `409 LOCKED` is read as the shell's `{error:{code,message}}`; the lock-refusal copy keys on `code === "LOCKED"`.

## Implementation Notes
**Fern, 2026-11-08.** Built on a throwaway stub of SPEC-100 §5 (scratchpad, ports 3011/4011, both stopped after); **not yet tried against the real BE** (TASK-865 not accepted).
- **Routes:** `/salary` (redirects to `/salary/payrun`) · `/salary/payrun` (optional `?period=<id>`) · `/salary/slip/[id]` (`?period=` is only the back-link).
- **Pay run:** pick a period (newest by default) or create one (month + Gregorian year; a 409 shows the API message) → **Run** (toast "created n · refreshed m"; a second run just refreshes) → table coach · base · total · status badge with a Σ footer → **Lock** (confirm modal) → **Export CSV** (fetched with the bearer token then saved as `payrun-YYYY-MM.csv`; still enabled when locked). `lockAt` is shown as "ล็อกอัตโนมัติ 30 พ.ย. 2026 12:00 (12:00 วันสุดท้ายของเดือน)" in Asia/Bangkok; a locked period shows "ล็อกเมื่อ …", Run + Lock disabled, an info banner.
- **Slip:** base · Other ± lines (reason + signed amount, "−" in red, "+" for additions) · total as the BE returns it · **add** (reason required + non-zero amount, inline errors; amount can be negative, 2 decimals; sent as a decimal string built from satang) · **remove** (trash per manual line) · when the slip or its period is locked the add form and trash buttons are not rendered and a banner says read-only. A 409 LOCKED on add/remove shows the message.
- **Money:** `Salary/money.ts` parses to integer satang, sums in satang, formats only for display; unreadable money shows "—", never 0.
- **Role gate:** one row added to `PAGE_RULES` — `/salary`, `roles:["ceo"]`, `money:true`, `menu:true` (the prefix covers both routes; the table's module-load assertion would throw if "admin" were listed); `proxy.ts` matcher gained `/salary/:path*`. No other shell change. It is the first row of the SALARY group in the CEO's menu ("Pay run (เงินเดือน)").
- **Evidence (headless Chromium, stub):**
  - `tsc --noEmit` 0 · `next build` 0 (final tree, no env override).
  - **Admin:** menu = รายการ · แท็ก only; `/salary`, `/salary/payrun`, `/salary/slip/s1` → NO-ACCESS (`data-no-access`). **Coach:** `/salary/payrun` NO-ACCESS. **Signed out:** → `/login?next=%2Fsalary%2Fpayrun`.
  - **CEO** (dark on first paint): create/pick period → empty state → Run → 3 slips, Σ base 84,500.50; second Run refreshes 3, no duplicates.
  - **Slip:** empty reason and whitespace-only reason blocked inline; added `+1,500.50` and `−500.00` → total 29,000.50 = 28,000.00 + 1,500.50 − 500.00; removing the +1,500.50 → 27,500.00; the overview row total follows.
  - **CSV:** downloaded `payrun-2026-11.csv`, header + 3 rows, totals match the screen.
  - **Lock:** confirm modal → period + all 3 slips locked; Run + Lock disabled, Export still on; the locked slip has no add form / no delete and keeps its total. A long-past period (lockAt passed) is shown locked on first read (the stub's lazy lock). New-period conflict shows the API's 409 message.
  - **Mobile 390 px:** no horizontal page scroll.
  - Console: 0 unexpected errors (only the intended 401/403/409/404 responses from the negative cases).
- **Not tested:** the real BE, real `lockAt` ticking at 12:00 (only "already past" and explicit lock), a >100 coach list (no pagination — demo-size), the BE's actual money format (Q1).
- **git status** (front repo): modified `src/proxy.ts`, `src/lib/roles/pages.ts` (inside the untracked TASK-857 dir; +1 row) — plus TASK-857's files; new `src/app/(admin)/salary/**`, `src/components/partials/Salary/**` (PayRun, Slip, hooks, money, parts), `src/services/salary.service.ts`, `src/types/app/salary.ts`. The RevenueLedger / revenue files in the same tree are Team B's, untouched. **No git command run** beyond reading status.

### Follow-up 2026-11-08 (after Sober's answers)
- **Money = integer satang both ways** (Sober's answer to Q1): `types/app/salary.ts` `Money = number`; `Salary/money.ts` `toSatang` accepts only integers (else "—"), new `bahtInputToSatang` parses the amount field text (no float multiply) and `Slip.tsx` POSTs `{amount: <int satang>, label}`; the decimal-string path is gone. Re-ran the full stub proof with a satang stub (base 2800000 …): same results (29,000.50 total, remove → 27,500.00, lock read-only, CSV baht 2dp), `tsc` 0, `next build` 0 (final tree).
- `teacherName` already read with id fallback; bodies bare; LOCKED keyed on `code` — as answered. Still **not run against the real BE** (waiting for Jason's teacherName add).
- **UPDATE (Sober's START-NOW order): the orange sweep is DONE app-wide** — `primaryColor` orange; Tailwind `primary` #fd7e14 (Mantine orange.6) so the sidebar brand tile/active item/eyebrows follow; `lib/ui/colors.ts` primary; 30 brand `color="green"` props (buttons, loaders, tabs, switch, header role badge, login, placeholder) → orange across the old ERP pages, the revenue loader and my Salary loader (colour props only, no logic; one throwaway script with per-line assertions); the 8 `text-success/70` eyebrows → `text-primary/70`. **Kept green on purpose:** income/success/positive/locked meaning (P&L profit, income badges, success toasts, "locked" badges/alerts, progress for income). Verified on the stub: primary css `#fd7e14`, login + pay-run screenshots orange, 0 console errors, `tsc` 0, `next build` 0 (final tree; Google Fonts fetch failed twice on the network — a retry passes, not a code issue). Nav: no Notifications/Setting items exist yet — nothing to move.
- *(superseded)* **Shell polish (REQ-5010):** theme `primaryColor` green → `orange` in `AppProviders.tsx` (one line). **Caveat:** the shell's green is also hard-coded in ~57 places (Tailwind `primary` #37b24d/`success`, `color="green"` on many components incl. Team B/C files and the sidebar's active item), so the app is only partly orange now; a full orange is a separate sweep through other desks' files — not done. **Nav order:** the left nav has no Notifications or Setting items yet, so nothing to move; the order rule will apply when those pages land.

### Integration 2026-11-08 (Sober's GREEN, teacherName sid-live)
- **How:** I cannot log in on sid or run Postgres here (workspace rules: no password logins, no local PG), so the integration is against **the real back-office code** — `src/routes/salary.ts` + `salary.service.ts` + the real `requireRole("ceo")` middleware + the repo's own `signToken`, imported from `smart-scheduler-backoffice-back` and served by a throwaway Bun harness (scratchpad, port 4011) on the service's **in-memory store** (the back's own DB-less seam). Only `/auth/login` is a stand-in (signs a real token). The front was built with `NEXT_PUBLIC_BACKOFFICE_API_URL` → the harness. **Not run against sid itself** (host/DB/login), so a click-through on sid remains for whoever may log in there.
- **Contract moves handled:** `teacherName` already read (null → uuid fallback proven); CSV header `teacher_id,teacher_name,base_salary,total,status` (downloaded and checked); **new:** the period now carries `periodStart/periodEnd` (TASK-871, R1.4 range) — the FE shows "ช่วงจ่าย 31 ต.ค. – 29 พ.ย. 2026" on the pay run and the slip (optional fields; blank when null).
- **Evidence (headless Chromium, real BE code):** admin → NO-ACCESS on `/salary/payrun` + `/salary/slip/…`, and the real API answers admin 403 / no token 401 / duplicate month 409 `PERIOD_EXISTS`; CEO: no periods → empty state → create (range + lockAt shown) → Run → 3 slips (ต้น / พลอย / the third with no name shows its uuid), Σ base 63,000.50, 2nd Run refreshes 3, no dupes; slip ต้น add +1,500.50 and −500.00 → total 26,000.50 (BE-computed), remove → 24,500.00, overview row follows; CSV downloaded (3 rows); Lock → Run/Lock disabled, Export on, 3 locked badges, locked slip has no add/delete and keeps 26,000.50; a past month (2025-10) created from the UI comes back locked by the real lazy auto-lock. 0 unexpected console errors. Final `tsc` 0 · `next build` 0.
- **Not proven in the UI:** the duplicate-month message text (the BE's `PERIOD_EXISTS` message is shown through the same `errorMessage` path, but my check matched the wrong alert — only the API answer is proven); a real 12:00 tick; sid itself.

## Review
_(—)_

## Review — Sober, 2026-11-08: ✅ DONE (proven vs stub; real-BE integration when 865's teacherName lands)
Thorough, demo-ready FE. Both screens, every state (empty/run/refresh/lock/lazy-lock/export/read-only), admin+coach NO-ACCESS, signed-out redirect, dark on first paint, mobile 390px no-scroll, money summed in satang with "—" for unreadable — all proven on a matching stub. `tsc`/`next build` 0. The single `PAGE_RULES` row (`/salary`, ceo, money:true) inherits the shell's module-load guard; `/salary/:path*` added to the proxy matcher. Strong.

**Your 4 questions — answered (SPEC-100 updated to match, and Jason's 865 is built to it):**
1. **Money on the wire = integer SATANG** (Jason built it; documented at the top of `routes/salary.ts`). Your `toSatang` is right; the CSV is baht 2dp. ✅
2. **teacherName = YES.** You were right — a uuid is useless to the CEO. SPEC-100 §5 now adds `teacherName` to the overview + slip (+ CSV name column), a read-only `public.teachers` lookup in the BE. Keep your optional-field + id-fallback as the safety net (null when the BE can't resolve it). Jason is adding it to 865; until it deploys your fallback covers the stub.
3. **Response bodies = BARE**, exactly as §5 (array / the line / the period), NOT wrapped. Jason built bare. ✅ Your reader is correct; no `{period}` unwrap needed.
4. **Error envelope = `{error:{code,message}}`** (the shell convention; Jason's `onError`+`ApiException` emit it). Keying the lock copy on `code==="LOCKED"` is correct. ✅

**Integration:** wire to the real BE when TASK-865's teacherName addition is in and 0009 is on sid (it is). Nothing blocks you now. No git command. Ball: Fern (integrate when 865's teacherName lands).

## Review of ### Integration (Sober, SA Lead A, 2026-11-08) — ✅ DONE
Fern proved the FE against the REAL `routes/salary.ts` + `salary.service.ts` + `requireRole("ceo")` in a Bun harness (in-memory store; only `/auth/login` stubbed), driving the built front headless. Verified: admin NO-ACCESS + real 403/401/409 `PERIOD_EXISTS`; create period (BE range + lockAt); Run→3 slips with `teacherName` (uuid fallback); BE-computed add (+1,500.50) / remove (−500.00) totals; CSV `teacher_id,teacher_name,base_salary,total,status`; Lock→read-only, Export still on; lazy auto-lock on a past month; the new `periodStart/periodEnd` display. tsc 0 / next build 0.
**Follow-ups (non-blocking):** (1) confirm the duplicate-month message renders in the UI (API 409 proven; her test matched the wrong alert) — eyeball before demo; (2) sid click-through needs the backoffice deployed + owner login — the deploy/owner step, not a TASK-866 defect (raised with Porter).
**Verdict: ✅ DONE.** The thin-slip demo FE is integration-complete against the BE contract.
