# TASK-902 — FE: REQ-120 R1.5 **"Confirm this slip" on the coach's My slip**, wired to SPEC-102 §5-E4a (backoffice-front) — @Fanta — now
**From @Silver, 2026-11-09.** Porter: Fanta's next, since E4a is accepted (Bob's TASK-887, DONE). Repo `smart-scheduler-backoffice-front`, branch `dong`. **No git command: git only on the owner's word.** **Size ≈ 0.5 d.**

## The route (TASK-887, DONE)
- `POST /salary/my-slip/confirm` body `{ year, month }`, `requireAuth`. The slip comes from the **token** (never send a teacher id).
- 200 = the my-slip DTO with `status: "confirmed"`; a re-confirm is also 200.
- 409 `LOCKED` · 404 `NO_SLIP` · 403 `NO_TEACHER`.

## What to build
- **On My slip (`components/partials/Salary/MySlip.tsx`, Fern's TASK-882 file, claimed for you by this TASK):** the final UI's button **«Confirm this slip»** (`final-ui` `MySlip.tsx:22–23`, check icon). It's shown **only while the slip's status is `draft`** and the period isn't past its `lockAt`.
- **Press → confirm first:** the final UI has no confirm dialog. Send the POST, then show the final UI's toast **«ยืนยันสลิปรอบนี้แล้ว: <total> — หลังจากนี้แก้ไม่ได้»** with the total from the 200 body. Re-read My slip.
- **After `confirmed`:** no button. The status shows the existing "Confirmed" word (Fern's `SlipView` status words). `locked` → no button (AUTO-LOCKED).
- **Errors:** the server's sentence in the existing red toast (409 / 404 / 403). A 409 also re-reads, so the screen shows AUTO-LOCKED.
- **«Tell an admin»:** still **not** rendered. It has no route (TASK-882 Q4 ruling stands).

## Files (claim; Fern's files, lent to you for this TASK only. Porter tells Sober so Fern doesn't edit them at the same time)
- `components/partials/Salary/MySlip.tsx`;
- `services/salary.service.ts` + `types/app/salary.ts` (**add** `confirmMySlip(year, month)` + its type only; change nothing else);
- a new `salary-902.test.tsx`.
- **`SlipView.tsx` / `parts.tsx` / `money.ts`: import only.**

## Tests (each must fail when its code is removed)
- the button shows for `draft` and not for `confirmed` / `locked`;
- the body is exactly `{ year, month }`, with no teacher id;
- a 200 shows the final UI toast with the total and hides the button after the re-read;
- 409 / 404 / 403 show the server's sentence;
- an admin / CEO never reach My slip (unchanged guard).

## Done =
- `tsc` 0 · tests green · `next build` 0 (retry once on a `next/font` failure, and say so).
- Report in `inbox/SA-B.md`. `git status` = only the claimed files. No git command run.
- The live coach press is Tanya's gate.

## Review — @Silver, 2026-11-09: ✅ ACCEPTED (DONE on code; the live coach press → Tanya's gate)
- **Re-run by me:** BF tsc 0; `bun test` = **83 pass / 0 fail**; `bun run build` = 0.
- **`confirmMySlip`** sends only `{ year, month }` (`salary.service.ts`, `confirmMySlipBody`). The button shows only for a `draft` slip in an open period before `lockAt` (`MySlip.tsx:22`).
- **Only the lent files were touched;** the rest of the service diff is Fern's earlier TASK-882 / 895 work.
- **Security review:** none. The token-scoped server route (TASK-887); no id in the body.
