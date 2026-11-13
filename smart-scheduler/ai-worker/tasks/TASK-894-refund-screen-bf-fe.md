# TASK-894: Refund screen in the back office (BF)
- Source: final UI `pages/b/revenue/Refund.tsx` (REQ-133) · SPEC-099 §10 (4) · REQ-5010 #13 wording
- Owner: FE (Flash, Team C) · SA: Sector · Status: REVIEW (Flash, 2026-11-09; built vs the fake; no real run by design) · Depends on: none to start (TASK-893's contract with a fake, off by default)
- Repo: `smart-scheduler-backoffice-front` (BF). Every file is Team C's: `src/app/(admin)/revenue/refund/page.tsx` (new) · `partials/RevenueLedger/**` · `services/revenue-ledger.service.ts` · `types/app/revenue-ledger.ts`.
- Git writes: none.

## What to do
- **Carry the final UI's Refund page over:**
  - "From" (a searchable select over `GET /refunds/sources?q=`, label · fee · sold date);
  - Date (default today); Amount (whole baht, ≤ the fee); Method; Remark; **"Save"** (REQ-5010 #13: not "Save refund");
  - the summary table: the sale's month (Sales) vs the refund's month (Refund) as a negative;
  - the session box: **"Cancelled"** (REQ-5010 #13), showing `toCancel` before save and `cancelledSessions` after.
- **A refunded source** shows "Refunded", and Save is disabled for it.
- **Errors:** `NO_FEE`, `ALREADY_REFUNDED`, 503 "Not configured", 502 "Could not cancel the sessions; nothing was saved".
- Link from Summary's header ("Refund"), next to Add Manually.

## Definition of Done
- [ ] tsc → 0.
- [ ] Shots against the fake: the pick, the confirm state, the saved state, `ALREADY_REFUNDED`; 1280 / 768 / 375.
- [ ] **No real-API write run.** A refund cancels a real plan and tells a family. The real run is Tanya's on sid, on a C-TEST plan, after TASK-892/893 deploy.
- [ ] `git status --porcelain`: only the listed files.

## Implementation Notes
(Flash, 2026-11-09. BF `dong` @ `7baca31`, dirty tree. Nothing committed. Built against TASK-893's contract with a fake; **no real-API run and no real refund**, as the DoD says.)

**Built:** `src/app/(admin)/revenue/refund/page.tsx` (new) · `RevenueLedger/RevenueRefund.tsx` (new) · `RevenueLedger/fake.ts` (+`fakeListRefundSources`, `fakeCreateRefund`) · `RevenueLedger/hooks.ts` (+`useRefundSources`, `useCreateRefund`) · `RevenueLedger/RevenueSummary.tsx` (header link "Refund") · `services/revenue-ledger.service.ts` (+`listRefundSources`, `createRefund`) · `types/app/revenue-ledger.ts` (+`RefundSource`, `CreateRefundInput`, `RefundResult`).

**The screen (final UI carried over, SPEC-099 §10 wording):** "From" = a searchable select over `GET /refunds/sources?q=` (the search is the server's; label · fee · sold date, `· Refunded` when so) · Date (default today, Bangkok) · Amount (whole baht, defaults to the fee, clamped to the fee) · Method · Remark · **"Save"** (not "Save refund"). Record table: the sale's month "(Sales)" revenue vs the refund's month "(Refund)" **EXPENSE** as a negative. Session box: Attended n **Kept**; Not attended yet = `toCancel` with "Cancelled on save" before, and `cancelledSessions` with **"Cancelled"** after. A refunded sale shows a **Refunded** badge, a note, and Save is disabled. Errors by status/code: `ALREADY_REFUNDED` → "This sale has already been refunded" (and the sale is then marked refunded), `NO_FEE` → "This sale has no fee on record, so it cannot be refunded", 503 → "Not configured", 502 → "Could not cancel the sessions; nothing was saved", any other API sentence as it arrives. Summary's header has "Refund" next to "ECA Payment" and "Add Manually".

**Checks, real output**
- `tsc`: my files: **0 errors** (`grep "error TS" … | grep -ci revenue` → `0`). The whole-project run shows **5 `error TS`, all in other teams' in-progress Salary files** (`Salary/Daily.tsx`: `useDailyDays` missing from `./PeopleData`; `Salary/salary-862.test.tsx`: `listDailyDays` and a `names` prop that don't exist) — not mine, not touched. Earlier today the base was exit 0; it was exit 0 right after my build too, so these arrived since.
- `next build` → `✓ Compiled successfully`, `Finished TypeScript`, `✓ Generating static pages (29/29)`, route `├ ○ /revenue/refund` listed, **exit 0** (the build's own type check passed).
- `config.ts:5` → `export const USE_FAKE_REVENUE = false;` (`git diff --stat` on `config.ts` → no output; true only for the fake run). Dev server stopped, port 3310 down. Old `/revenue` page and `partials/Revenue` untouched. `git status --porcelain | grep -i revenue` → `M RevenueSummary.tsx · M fake.ts · M hooks.ts · M revenue-ledger.service.ts · M revenue-ledger.ts · ?? revenue/eca/ · ?? revenue/refund/ · ?? RevenueEca.tsx · ?? RevenueRefund.tsx` (TASK-891's three + mine; all in the closed lists).
- **Against the fake, Playwright (real Chrome), BF on 3310 with the API URL forced local, widths 1280 / 768 / 375**, `evidence/TASK-894/shoot.mjs` (`fake-<w>-1-start`, `-2-pick`, `-3-confirm`, `-4-saved`, `-5-already-refunded`, `-6-409-already-refunded`, `-7-502`) — every number from the run: Save disabled at the start; pick the 9,500 ฿ course → Amount `9,500 ฿`, Record row `Nov (Refund) EXPENSE −9,500 ฿`, Session 6 Kept / 4 "Cancelled on save"; typing 9,501 → clamps to `9,500 ฿`; 0 → "Enter an amount above 0"; Save → confirm "Save this refund? 9,500 ฿ will be recorded as an expense on 09/11/26. The 4 sessions not attended yet will be cancelled and the family will be told by LINE. This cannot be undone."; Save → "Refund saved: 9,500 ฿ on 09/11/26. 4 sessions cancelled and the family was told.", Refunded badge, "Cancelled" badge, Save disabled; an already-refunded sale → Refunded + Save disabled; the three refusals at save (409 → "This sale has already been refunded", 502 → "Could not cancel the sessions; nothing was saved", 503 → "Not configured"); Summary has the "Refund" link; `hscroll` false at start / pick / saved, `pageErrors: []`, at all three widths.
- **Error state, fake off, dead API** (`shoot-error.mjs`, `error-1280.png`): the pick list shows `Network Error Retry` and Save is disabled. (The shared QueryClient retries a few times first.)
- `UNVERIFIED`: the real BB (TASK-893 and TASK-892 not on sid; the real run is Tanya's); the exact shape of the sources answer (Q1); keyboard walk, hit targets, reduced-motion, `/impeccable audit` (not run); a real 401; no unit tests (BF has no runner).

**Decided alone (internal; overturn at review):**
1. **A confirm step before the POST.** A refund cancels sessions and tells a family on LINE and cannot be undone, so Save opens "Save this refund?" with Back / Save (red). The final UI had none. (The copy is mine: Q2.)
2. Amount defaults to the whole fee on picking a sale (the final UI pre-filled a demo value); partial = lower it; the field's `max` keeps it ≤ the fee, and the API still checks.
3. The refund date can be any date; the API decides.
4. The pick list searches on a 300 ms debounce; picking an option writes its label into the search box, which is ignored as a search.
5. After a save the sources list is re-read (the sale then comes back `refunded: true`); until it does, this session's result keeps the sale marked.

## Questions
1. **The sources answer's wrapper.** SPEC-099 §10 / TASK-893 say each item is `{ refType, refId, label, soldOn, feeMinor, attended, toCancel, refunded }` but not whether `GET /refunds/sources` returns `{ "sources": [...] }` or a bare array. Every other list in this API is wrapped (`{categories}`, `{lines}`, `{payments}`), so I read `data.sources`. **Default: `{ "sources": [...] }`; one line in `revenue-ledger.service.ts` if Brew builds it differently.**
2. **Copy nobody wrote (English, D2).** The confirm text (above), "Save this refund?", "Back", the success note, "Cancelled on save" (before) / "Cancelled" (after), "Refunded", "The family was told by LINE", "No sales found", "Pick a sale to see where the refund lands", the form messages ("Choose the refund date", "Enter an amount above 0"), and the `NO_FEE` sentence. The REQ-5010 #13 words ("Save", "Cancelled") are used as given. Default: as built; tell me if Porter wants any changed.
3. **Is a confirm step wanted?** (Decision 1.) If the owner wants Save to act at once like the final UI, it is removing one `Modal`.

## Review

## Review

> **answers (Sector, 2026-11-09):**
> 1. **The wrapper: `{ "sources": [ … ] }`**, as you read it (every list in this API is wrapped). It's now written into TASK-893's contract, so Brew builds it that way.
> 2. **Your copy is accepted as built** (English, D2; the REQ-5010 #13 words as given). Porter can change any line later, one string each.
> 3. **The confirm step is accepted** [SA-decided]. A refund cancels sessions and tells a family; it can't be undone. A second click before an irreversible act is the small-UI kind of change the owner's REQ-5010 ruling allows. If the owner wants it gone, it's one Modal.
> **Your other four decisions are accepted** (amount defaults to the whole fee, clamped; any date; debounced search; re-reading after save).

**Review 1, Sector, 2026-11-09. Verdict: the build is ACCEPTED.** DONE follows Tanya's sid round after TASK-892/893 deploy. By design there's no engineer real-API write run.
- **Type check:** your files have 0 errors, and `next build` exits 0. The 5 whole-project `error TS` are in another team's in-progress Salary files (`Salary/Daily.tsx`, `salary-862.test.tsx`), not yours. Noted to Porter.
- The fake is off (`config.ts:5`); the old `/revenue` page is untouched; the footprint is Team C files only.

**ORDER 67 pass (Sector, 2026-11-13): still owed.** Code accepted 11-09. DONE waits on Tanya's sid refund re-run, blocked by D-150-2 (the owner sets SCHEDULER_API_URL / SCHEDULER_INTERNAL_SECRET on the sid back office; back office paused until then).
