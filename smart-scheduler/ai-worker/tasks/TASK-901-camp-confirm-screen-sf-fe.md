# TASK-901: D3 "Confirm camp" in the front office (SF)
- Source: SPEC-099 §11 · final UI `pages/a/frontoffice/ConfirmCamp.tsx` (REQ-133) · REQ-5010 #11 ("Not confirmed yet", no "Sold")
- Owner: FE (**Fanta, Team B**; moved from Flash by Porter 2026-11-09, PM staffing) · SA reviewer: Sector · she reports via Silver · Status: TODO, **start now** (the claim is granted; Fanta is the SF claimant) · Depends on: TASK-900's contract (build with a fake, off by default). **Edit shared SF files only after Porter's claim names them for Team C** (requested 2026-11-09).
- Repo: `smart-scheduler-front` (SF).
- Files (closed list): new `src/components/partials/CampConfirm/**` · the SF camp package view where a package is shown (name it in step 0; one block) · its service/type files (one function / one field) · `src/lib/i18n/dictionaries.ts` (one appended block).
- Git writes: none.

## What to do
0. **Step 0:** where SF shows a camp package (file:line), and its service/type for `GET /api/camp/packages`.
1. **On each camp package:** a state badge, **"Not confirmed yet"** or **"Confirmed · <date>"** (from `confirmedOn`), plus a **"Confirm camp"** button, disabled once confirmed.
2. **The dialog (final UI):** title, Date received (default today), Amount (read-only: the camp's fee as the list shows it, or the server's answer after confirm), Payment Method (default Transfer). Confirm → `POST /api/camp/packages/:id/confirm` → the badge flips. `ALREADY_CONFIRMED` / `NO_FEE` show their message.
3. **Thai labels:** ask me. They go to Porter; English placeholders marked `PENDING (Porter)` until then.

## Definition of Done
- [ ] tsc 0; the SF suite has no new fails (paste both).
- [ ] Shots against the fake: not confirmed, the dialog, confirmed; 1280 / 375.
- [ ] **No sid write run.** The real confirm is Tanya's round after TASK-900 deploys.
- [ ] `git status --porcelain`: only the listed files.

## Implementation Notes

## Questions

## Review

**Claim GRANTED (Porter, 2026-11-09; board line written).**

**Thai (Porter, PM wording):**
- Confirm camp = «ยืนยันแคมป์»
- Not confirmed yet = «ยังไม่ยืนยัน»
- Confirmed = «ยืนยันแล้ว»
- Date received / Amount / Payment Method: as already in the app (วันที่รับเงิน · จำนวนเงิน · วิธีชำระเงิน)
- `ALREADY_CONFIRMED` = «แคมป์นี้ยืนยันแล้ว»
- `NO_FEE` = «แคมป์นี้ยังไม่มีรายการขาย»

**Owner:** this may move to Fanta (Team B) if Silver says so. Sector stays the reviewer.

## Silver (Fanta's SA) — answers to Fanta's step 0 + the contract, 2026-11-09. Sector stays the reviewer
- **Owner (Q5):** moved to **Fanta** (Porter / Sector, 2026-11-09). **Edit now.**
- **The contract, live in the SB tree** (TASK-900 DONE, SPEC-099 §11, relayed by Porter from Sector):
  - `POST /api/camp/packages/:id/confirm` `{ receivedOn: "YYYY-MM-DD", method: "TRANSFER" | "CASH" | "CARD" }` → 200 `{ packageId, confirmedOn, amountMinor, method }`.
  - Errors: 409 `NO_FEE` / `ALREADY_CONFIRMED`, 404.
  - `GET /api/camp/packages` items gain **`confirmedOn`** (YYYY-MM-DD or null).
- **Q1 «Amount»:** the list has **no** amount today. **Default, build it now:** the dialog shows «—» for Amount before the press, and the success toast / the "Confirmed" state shows the 200's `amountMinor`. `NO_FEE` shows as the 409's sentence.
  - Your proposal (`amountMinor` on the list item) is **Sector's call** (his contract), and I've routed it through Porter. If he adds it, switching is one line.
- **Q2 Payment Method:** **import Team C's `Payments/PaymentMethodSelect.tsx` read-only.** Its values are exactly `TRANSFER · CASH · CARD` (`types/payments.ts:8`) and its labels are already approved (`paymentRecord.methods.*`).
- **Q3:** OK. `DatePickerInput`, default today (Bangkok).
- **Q4 «Edit schedule»:** **leave it out** (not in the TASK).
- **`dictionaries.ts` is shared with Flash (898):** append only your own `campConfirm` block, re-read the file on disk right before the edit, and touch no other line (Sector's note).
- **English pairs:** use your listed English, marked `PENDING (Porter)`, until Porter gives them.

## Review (Sector, 2026-11-09): ✅ DONE on code (ships in this deploy)
- **Re-run by me:** SF **1460 pass · 0 fail**; `tsc` 0.
- Fanta's report (Silver's inbox, `@Fanta → @Silver`) matches the contract:
  - ONE POST with exactly `{ receivedOn, method }`;
  - badge from `confirmedOn`;
  - button disabled once confirmed, and hidden without `action:camp.sell`;
  - both 409s show Porter's words;
  - no LINE;
  - the fake is off by default.
  The two pin edits are the usual count/list bumps.
- **Amount: «—» before the press is accepted for this deploy.** Adding `amountMinor` to the SB list is an SB change, and SB is frozen, so it's next round. I'll cut it after the deploy. SF already reads the field when it's present.
- **Screenshots: not blocking.** They can be done after the deploy the way Flash did 898 (`evidence/TASK-898/shoot.mjs`): the real components with mock services in a scratch bundle, no sign-in. Optional.
- Security review: an existing right (`action:camp.sell`), a server-validated body, no personal data. **None.**
