# TASK-621 — "Confirmation results" shows the student's name, not the booking id — FE, XS
- Source: REQ-111 item B (§4, screenshot `project-docs/customer-2026-10-02-req111/confirm-results-uuids.webp`) · sizing §B
- Status: DONE
- Repo: `smart-scheduler-front` · Assignee: @Fanta · From: @Silver (2026-10-02)
- Depends on: none

## §0 The cause — proven in code, so do not re-diagnose it
1. `BookingsTable.tsx:151`: `bookingName = (id) => rows.find(b => b.id === id)?.displayName ?? id`. The name is looked up in **the list currently on screen**.
2. `useBulkConfirm` → `onSuccess: invalidateAll` (`hooks/scheduler/useScheduler.ts:514-519`), so **the list reloads the moment the confirm returns.**
3. With a status filter on (Khwan's table showed only EXTENDED rows), **the rows just confirmed are no longer in the list.** The lookup misses and the dialog prints the raw id.
4. SKIPPED rows did not change status, so they stay in the list and keep their names. That matches the screenshot exactly.
5. The server echoes the same ids it was sent. **No BE change.** `BulkConfirmResult` does not need a name.

## What to do
- **Keep the names at the moment of the click.**
  - In `handleBulkConfirm` (`BookingsTable.tsx:153`), **before** `mutateAsync`, build `id → displayName` from the selected rows.
  - Make the results dialog (`:424-466`) read that saved copy instead of the live `rows`.
- Keep the `?? id` fallback only as the true "never seen" case. It should now be unreachable from this flow.
- Fix the TASK-227 comment at `:149-151`, which says the id fallback is only the "row not found" case. That is exactly what was happening.
- 🚫 **No wording changes.** No new strings.

## Definition of Done
- [ ] **A clicked DOM test** in `components/partials/Bookings/bulk-confirm.dom.test.tsx`. Follow that file's existing pattern, and read its header for why the test must click rather than only render.
  - The test ticks rows, confirms, and **after confirm the mocked list reload no longer contains the confirmed rows.**
  - Every result line must show a name and never an id.
  - **Break it and watch:** revert the fix and confirm the test goes red. Paste both runs in your notes.
- [ ] `bun test` for the front, plus a typecheck and a build, all green. Paste the exact commands and the counts.
- [ ] **A real click on local:**
  1. Set the status filter to Extended.
  2. Tick several rows, at least one of them on a paused course so it is skipped.
  3. Confirm, and check that every line in the dialog shows a name.
- [ ] Do not edit any file outside `partials/Bookings/*`. Nothing is committed.

## Implementation Notes
**Fanta, 2026-10-02.** Repo `smart-scheduler-front`. Nothing committed.

**Files (both inside `partials/Bookings/*`):**
- `BookingsTable.tsx`: new state `resultNames: Map<id, displayName>`. `handleBulkConfirm` builds it from the selected rows **before** `mutateAsync` and sets it on success. `bookingName` now reads `resultNames.get(id) ?? id` and never the live `rows`. The TASK-227 comment is corrected. No string changed.
- `bulk-confirm.dom.test.tsx`: the list mock reads a mutable `listed`. In the new test, the POST mock confirms `bk-pending`, skips `bk-extended` and drops the confirmed row from `listed`; that is the reload under a status filter. The 4 existing tests keep their old behaviour, because `beforeEach` resets `listed` and the flag.

**Verification:**
- Red first, before the fix: `bun test src/components/partials/Bookings/bulk-confirm.dom.test.tsx` gave `4 pass / 1 fail`. The dialog text was `"…1 confirmed · 0 already confirmed · 1 skippedbk-pendingConfirmedเด็ก 2Skipped…"`, which is Khwan's screenshot exactly: the confirmed row shows its id and the skipped row keeps its name.
- With the fix: `5 pass / 0 fail`.
- Break it and watch (`BookingsTable.tsx` swapped back to HEAD, then restored): the TASK-621 test went `(fail)`. After restoring, it passed again.
- Full front run, shared with TASK-622 (same tree): `bunx tsc --noEmit` printed nothing (exit 0). `bun test` gave **934 pass / 0 fail across 99 files**; the baseline before any change was 924 / 0 across 97. `bun run build` passed (`[postbuild] copied .next/static into .next/standalone`).
- 🔴 **Real click on local: NOT VERIFIED.** There is no local stack on this machine. The front's `.env.local` points to `som.develyst.online` and the back's `.env` points to a remote DB. Clicking there would confirm real bookings and message real teachers. See Q1. The clicked DOM test reproduces the exact screenshot condition instead.

**Footprint:** no data created anywhere. The temporary HEAD swap for break-it was restored byte-for-byte from a scratchpad copy outside the repo. `.next/` was rebuilt by `bun run build` (build output only).

**Decided (internal):** a separate `resultNames` state instead of changing `results`' shape, so the dialog's count lines are untouched.

## Questions
(Fanta asks; Silver answers as `> answer: ...`. Internal choices you decide and declare here.)
- **Q1 (shared with TASK-622 Q1): where should the "real click on local" happen?** This machine has no local stack. Front `.env.local` → `som.develyst.online`. Back `.env` → remote DB, which today's log says holds uat values. A bulk confirm there would message real teachers. I stopped rather than use it. Please name the environment and whose data I may use, or accept the clicked DOM test as the evidence.
  > answer (Silver): **The clicked DOM test stands as your evidence. Do NOT click on `sid` or uat yourself.** The real click becomes part of the post-deploy `sid` check, which @Porter routes to QA. That is the right owner for a write to a shared box.

## Review
**Silver, 2026-10-03 — ✅ DONE.**
- **Diff read in full:** the names are captured from the selected rows **before** `mutateAsync` and set on success. `bookingName` reads only that copy.
  - Selection is cleared on every query change, so every selected row is on screen at the click; capturing from `rows` is sound.
  - Keeping a separate `resultNames` state rather than reshaping `results` is accepted.
- **The test reproduces Khwan's screenshot exactly** when red (the confirmed row shows its id, the skipped row keeps its name), and break-it was done.
- **Re-run by me:** front `bun test` → **934 pass / 0 fail** (99 files) · `bunx tsc --noEmit` → exit 0.
- **Q1 (real click):** answered below. 🔴 **You were right to stop.** This machine has no local stack, so the real click moves to the post-deploy `sid` check, which goes through @Porter.
- **For the sid check (Porter → Tanya):**
  - filter the status to Extended, then bulk-confirm a few rows including one on a paused course;
  - every line in the dialog must show a name;
  - ⚠️ bulk confirm messages each booking's teacher on `sid`, so use fixtures with no linked LINE account.
