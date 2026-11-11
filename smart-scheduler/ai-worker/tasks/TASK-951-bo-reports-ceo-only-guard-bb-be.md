# TASK-951 — BE: the three `/bo/reports/*` money routes are CEO-only — backoffice-back — @Jason (Team A)

**From @Sober, 2026-11-11.** Source: `CHECK-2026-11-11-bo-reports-pl-guard.md` (PokerVault UNLOCK-010: the admin card read the CEO P&L on sid). **Porter's decision (23:42): cut now, BUILD AFTER 14 Nov**, and it rides the English-bundle BB deploy (the back office is not on uat; sid holds test data only). R0: admin and coach never see money. Repo `smart-scheduler-backoffice-back`, branch `dong`. **No git** (Sober, on the owner's word). Chain: report in this TASK; Sober reviews. Size about 0.25 d.

## The change (closed file list: `src/routes/bo.ts`, `src/routes/bo.test.ts`)
- `src/routes/bo.ts` (lines at HEAD `e3a37de`): replace `adminAuth` with **`requireRole("ceo")`** on exactly these three routes:
  - `:81` `GET /reports/pl`
  - `:85` `GET /reports/revenue-by-activity`
  - `:88` `GET /reports/customer-spend`
  - Import `requireRole` from `../middleware/auth`, beside `adminAuth` (`:10`).
  - Every other route in `bo.ts` keeps `adminAuth`: items, tags and movements are not part of this TASK. Item prices and freelance ceilings for admin are an R0.2 field-hiding question, noted in the CHECK.
  - Add a one-line comment at the three routes: `// CEO-only: money (R0, TASK-951)`.
- **Already verified, no FE change needed:** the only BF callers are `bo.service.ts:77/108/115`, which serve `/dashboard` and `/revenue`. Both are `roles: ["ceo"]` (`pages.ts:23-24`).
- **`src/routes/bo.test.ts`: two existing tests must change with it (they break otherwise):**
  1. The `:84-91` test «a VALID token gets past the guard» signs `role: "admin"` against `/reports/pl`. Point it at an `adminAuth` route that takes a query, or sign `role: "ceo"`, so it still proves "a valid token passes" (400 from the validator).
  2. The `:93-…` route-table walk counts only `handler.name === "adminAuth"`. Accept **`adminAuth` OR `requireRole`** (the inner function returned by `requireRole` is named `requireRole`, `auth.ts:85`), so a GET with no guard still fails it.

## New route-level test (mandatory)
`describe("TASK-951 money reports are CEO-only")`, with `SKIP_ADMIN_AUTH=false` as the file already sets it. For each of the three paths, with valid query params (`from=2026-11-01&to=2026-11-30`, or each route's own required params; read `v.boPlQuery`, `v.revenueByActivityQuery`, `v.customerSpendQuery`):
- **ceo** Bearer → **not 401/403**. Assert the status is not 401 or 403: the handler may hit the DB, so a 500 with the dummy URL is acceptable. Better, if the validator lets you send a bad param: ceo + bad param → **400**, which proves the guard passed without touching the DB.
- **admin** Bearer → **403** `FORBIDDEN`
- **coach** Bearer (`role: "coach", teacherId: <uuid>`) → **403**
- **no token** → **401**
Mutation check: put `adminAuth` back on `/reports/pl` and the admin case goes red. Restore it and write both results in your notes.

## Done = (evidence in `## Implementation Notes`)
- `npx --yes --package typescript@5.6.3 tsc --noEmit` → 0
- `DATABASE_URL=postgres://dummy:dummy@127.0.0.1:1/dummy bun test` → base is **1396 pass / 0 fail** (Sober, 2026-11-11, HEAD `e3a37de`); after = 1396 + your new tests, 0 fail
- The mutation check above
- The diff covers only the two files

## Not in this TASK
- sid's `SKIP_ADMIN_AUTH`: an env value, the owner sets it on the 14th if Tanya's no-token GET returns 200.
- The `.env.example:19` default `SKIP_ADMIN_AUTH=true`: leave it (dev convenience). Sober will raise the comment wording separately if needed.

## Questions
_(—)_

## Implementation Notes
_(—)_

## Review
_(—)_
