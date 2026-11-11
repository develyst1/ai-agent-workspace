# TASK-931 — PARKED by Fern, 2026-11-09 (Sober: freeze R0.1; the BF redeploy is Stock-only)

Parked WITHOUT git (git is the owner's alone): the 931 files were copied here (hashes verified, 0 mismatches), then removed from the front tree, and the 4 small hunks in shared files were taken out by hand.
**State parked = the option-2 re-shape, already DONE** (Admit a login · Reactivate · no password · no Reset). tsc 0 · bun 392/0 · mutations 24/24 · build 0 · live run green at the moment of parking. Nothing is left to re-shape.

## Files (paths relative to the front repo root `smart-scheduler-backoffice-front`; copy them back as they are)
`front/` here mirrors the repo: `src/types/app/users.ts` · `src/services/users.service.ts` · `src/services/__fixtures__/users.ts` · `src/components/partials/Users/{Logins.tsx,logins-logic.ts,hooks.ts,users.test.tsx}` · `src/app/(admin)/users/page.tsx`.

## The 4 hunks in SHARED files (re-apply by hand)
1. `src/lib/roles/pages.ts` — the lucide import: add `KeyRound` (alphabetical, after `FileText`).
2. `src/lib/roles/pages.ts` — `export type Group = … | "NOTIFICATION" | "SETTING";` (add `| "SETTING"`).
3. `src/lib/roles/pages.ts` — after the `/notify/inbox` row:
```ts
  // 🔻 TASK-931 (R0.1; final-ui «User Setting»): who can sign in — Admit a login · Deactivate · Reactivate. CEO ONLY (an admin or a coach never manages logins). Fixture until TASK-930's `/v1/users` is deployed.
  { href: "/users", label: "User Setting", group: "SETTING", roles: ["ceo"], menu: true, icon: KeyRound },
```
4. `src/proxy.ts` — matcher: add `"/users/:path*",` after `"/stock/:path*",`.

## Restore
Copy `front/src` over the repo's `src`, re-apply the 4 hunks, then `tsc` + `bun test` + `next build`. The login-page text (`login/page.tsx`) was never touched.

## RESTORED 2026-11-09 (Fern, on Sober's "unpark 931" after the Stock commit BF 6204d3e)
All 8 files copied back (0 clashes, hashes verified) and the 4 hunks re-applied. One cosmetic difference: in the committed `pages.ts` the `/notify/inbox` row had the next row's comment glued to its line; my row now sits between them and that comment is on its own line (text unchanged). Tree: tsc 0 · bun 392/0 · next build 0. The `front/` copy here is kept as the backup until the R0.1 unit ships.
