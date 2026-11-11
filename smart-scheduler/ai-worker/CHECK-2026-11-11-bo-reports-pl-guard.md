# CHECK 2026-11-11 — `/api/v1/bo/reports/pl` answers 200 to admin + coach on sid (Porter 23:41)
Sober (SA, Team A). **Read-only code check, no sid call.** Repo `smart-scheduler-backoffice-back`, branch `dong`, HEAD `e3a37de`. Source of the observation: `POKERVAULT-LOG.md` UNLOCK-010 l.280–283 (200 for ceo, admin AND coach cards).

## What the code does
- `src/routes/bo.ts:81` `.get("/reports/pl", adminAuth, …)`. Siblings with the same guard: `:85` `/reports/revenue-by-activity`, `:88` `/reports/customer-spend`, and the item routes `:45–68` (`unitPriceMinor`, freelance ceilings).
- `src/middleware/auth.ts:94-97` `adminAuth` = signed in **and** role `ceo` **or `admin`**; coach → 403.
- `auth.ts:50-63`: when `SKIP_ADMIN_AUTH=true`, a request with **no usable Bearer** becomes `DEV_USER` = **role `ceo`** (`:47`). A valid Bearer still wins.
- BB reads **only** the `Authorization: Bearer` header (`auth.ts:40-43`); it never reads the `bo_token` cookie. The FE's axios adds the header from the cookie (`backoffice-front src/lib/api/client.ts:27-30`).
- `backoffice-back .env.example:19` ships **`SKIP_ADMIN_AUTH=true`** (`:15` "dev-only").

## Verdict
1. **Admin 200 = REAL by code** (not an empty body): `adminAuth` admits `admin` on the P&L and both revenue reports. That contradicts R0 "admin/coach never see money". Fix = a one-line guard change per route.
2. **Coach 200 cannot come from the code with a coach Bearer** (it gives 403). `inferred` cause: sid runs with **`SKIP_ADMIN_AUTH=true`** and the probe sent no usable Bearer (cookie only, or a token sid cannot verify), so every card became the dev CEO. **If so, this is worse than the report: anyone who can reach sid's API, with NO login, reads the P&L.** What would settle it: one GET to `/api/v1/bo/reports/pl` on sid with **no token at all**. 200 → skip is on; 401 → skip is off, and the coach result needs the exact request (header vs cookie) from PokerVault.
   - The settling call and sid's env are not mine. They belong to Tanya (via Porter) for the GET and to the owner/Otto for sid's `.env`. The fix for skip is **`SKIP_ADMIN_AUTH=false`** in sid's env, and the owner applies it.
3. **Second observation in the same entry (l.278):** "the back office accepted both front-office logins; no Admit step was needed." That may be TASK-930's option-2 verify-through sign-in working as designed, or a gap. Not checked here. Tanya should see whether a never-admitted FO user can sign in.

## Proposed fix TASK (not cut yet: Porter decides now vs after 14 Nov)
`bo.ts:81/85/88` `adminAuth` → `requireRole("ceo")` (the Revenue convention, `auth.ts:82`), plus a route-level test: ceo 200 · admin 403 · coach 403 · no token 401 (with skip off). About 0.25 d, Jason. **Checked: no admin screen calls them.** The only BF callers (`src/services/bo.service.ts:77/108/115`) serve `/dashboard` (P&L) and `/revenue`, both `roles: ["ceo"]` in `src/lib/roles/pages.ts:23-24`, so the change breaks no admin UI. A true one-liner. Item prices and freelance ceilings (`:45–68`) also go to admin today. Out of this fix; noted for R0.2 field hiding.
