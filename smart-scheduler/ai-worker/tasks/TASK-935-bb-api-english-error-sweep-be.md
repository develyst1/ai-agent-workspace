# TASK-935: BB API English sweep: client-facing error sentences (outside salary / users / auth)
- Source: R0.5 (English back office) · Sober's scope note (via Porter, 2026-11-09 23:59) · Porter's go
- Owner: BE (Brew, Team C) · SA: Sector · Status: TODO · **Queued behind F5 / F2** if the owner OKs them (CHECK-2026-11-09-frontoffice-intake.md). **It rides a LATER BB deploy, not tonight's bundle.**
- Repo: `smart-scheduler-backoffice-back` (BB), `dong`. **Edit shared files only after Porter's claim names them for Team C** (requested 2026-11-09). Most files are Team A's (Stock); re-read each on disk right before editing.
- **Base:** paste BB `bun test` (dummy URL) + pinned tsc, and the scan below (the base, 2026-11-09, 117 hits incl. mutation JSON).
- Git writes: none.

## Scope (exact)
- **Change ONLY the human sentence returned to the client.** Codes (`VALIDATION`, `NOT_FOUND`, `CONFLICT`…), HTTP statuses, `field` keys and the error envelope shape stay byte-identical.
- **In:**
  - `src/lib/http.ts` defaults: `notFound` "ไม่พบข้อมูล" → "Not found" · `forbidden` "ไม่มีสิทธิ์" → "Not allowed" · `unauthorized` "ไม่ได้รับอนุญาต" → "Not signed in";
  - `src/routes/notifications.ts`, `src/routes/stock.ts`, `src/routes/revenue-ledger.ts`;
  - the services: stock-write, demo-stock, stock-out, stock-import, inventory, stock-read, notification, item, accounts, tag, commercial, pricing, parties, revenue-ledger, sale-line-revenue, reports-*, teacher-sync.
- **Out (other seats' sweep):** salary*, users, auth. Plus anything not returned to a client (log lines, comments, DB seed data, LINE message text).
- **The start scan:** `rg -nP '(badRequest|notFound|conflict|unauthorized|forbidden|ApiException)\([^)]*[ก-๛]' src/{routes,services,lib} --glob '!**/*.test.ts'`. Also look for Thai held in a `const` and then thrown (the regex misses those): `rg -nP '[ก-๛]' src/{routes,services,lib} --glob '!**/*.test.ts' --glob '!**/*.json'` and read each hit.

## Rules
- **Words:**
  - plain English, one sentence, no trailing period inconsistency (follow the file's existing English errors);
  - name the field the way the screen does ("amount", "date", "category");
  - keep any number/limit the Thai sentence carried ("1–60 characters").
- **Consumers first:**
  - before changing a sentence, `rg` BF (`smart-scheduler-backoffice-front/src`) for that exact Thai text. If the FE matches on the text (not the code), **stop and ask me**; it's then an FE change too.
  - Tests and mutation JSON that pin the old text are updated in step (tagged `🔻 TASK-935`).
- **New test:** `src/lib/english-errors-task935.test.ts`. It reads the in-scope source files and fails if any `badRequest|notFound|conflict|unauthorized|forbidden|ApiException(` call carries a Thai character **outside a comment**. It strips `//` and `/* */` first. Add a list of the out-of-scope files the test skips, with the reason.

## Definition of Done
- [ ] Suite (dummy URL): no new fails. Pinned tsc 0.
- [ ] The scan above → 0 hits in scope (paste it), and the new test is green. It goes red if you put one Thai sentence back (paste that run).
- [ ] `git diff --stat`: message strings + tests/mutation pins only. **No code path, code or status changed:** paste `git diff -U0 | grep -E '^\+' | grep -vP '[A-Za-z]'`-style evidence that each `+` line only swaps text.
- [ ] A list in Implementation Notes: old Thai → new English, per file (for Porter / Khwan to read).

## Implementation Notes
**Prep only (Brew, 2026-11-10). Porter's start condition holds: NO BB file edited until tonight's bundle is redeployed, gated by Tanya and committed by Sober. Read-only so far.**
- **Base (BB, dummy URL):** `bun test` **1396 pass · 0 fail · 54 files**; pinned tsc 5.9.2 **exit 0**; the tree has 15 uncommitted entries.
- **The TASK's scan 1** (`(badRequest|notFound|conflict|unauthorized|forbidden|ApiException)\([^)]*[ก-๛]` over routes/services/lib, no tests): **117 hits in 22 files, which matches Sector's base (117).** 14 of them are in 3 `*.mutations.json` pins (`stock-routes-more` 3 · `stock-import-task904` 4 · `stock-sales-task928` 7), so 103 are source lines:
  - `stock-write.service` 21 · `demo-stock.service` 18 · `stock-out.service` 9 · `stock-import.service` 7 · `inventory.service` 7 · `stock-read.service` 6 · `accounts` 5 · `notification` 5 · `item` 5 · `routes/stock.ts` 5 · `commercial` 4 · `tag` 4 · `parties` 1 · `pricing` 1 · `routes/notifications.ts` 1 · `revenue-ledger.service` 1 · `sale-line-revenue` 1 · `teacher-sync` 1 · `reports-courses.service` 1.
- **The TASK's scan 2** (any Thai character, no tests / no JSON) found the hits the call-regex MISSES. Please confirm these are in scope (all inside the services/lib the TASK names):
  1. **`src/lib/stock-import.ts` — 20 Thai lines, none caught by scan 1.** They are the Excel-import error sentences (`errors.push({ row, column, message: "…" })`, e.g. "Model Code ว่าง", "ไม่พบคอลัมน์ …") and `throw new StockImportRefusal(code, "…")` (NEGATIVE_BALANCE / BAD_DIFF / STALE). The client shows them. It is a Team A (Stock) file and feeds `stock-import.service`, which is in the list. **I propose to sweep it; one decision for you:** the BF import screen may match on `column` or on the text, so I check the BF for every sentence first, as the TASK says.
  2. **`src/lib/http.ts` — the 3 defaults** (as the TASK lists).
  3. `reports-courses.service.ts:123` — `ApiException(403, "FORBIDDEN", "ไม่มีสิทธิ์")` (Jason's file, TASK-926, already counted in scan 1; I will touch it only with your word).
  - **Not client-facing, to be left (comments / a `฿` sign / the screen's own wording):** `revenue-attribution.ts`, `revenue-ledger.ts` (comment + `฿`), `routes/revenue-ledger.ts:138` (comment), `routes/transport.ts`, `transport-pricing.ts`, `slip-export.service.ts` (`฿`), `daily-report.service.ts` (`฿`), `reports-students/overview` (comments). The new test strips comments and ignores U+0E3F, as TASK-934's does.
- **Already done by another seat, do NOT redo:** `src/lib/english-errors-task934.test.ts` (TASK-934) covers the salary / period / profile / entries / my-slip / transport / users / auth domain with a line-based scan (non-comment line, no Thai except a cited KEEP list, ฿ excluded). **My new test `english-errors-task935.test.ts` will use the same line-based method** (stronger than the call-regex: it also catches a Thai `const` that is thrown later), over the TASK-935 file list, with its own skip list + reasons.
- **Test pins to update in step (tagged `🔻 TASK-935`), by file, to be listed when I edit:** the three mutation JSONs above, plus any `*.test.ts` that asserts the Thai text (`bo.test.ts`, `revenue-ledger.test.ts`, `low-stock.service.test.ts`, `stock-import.service.test.ts`, `demo-stock-task915.test.ts` carry Thai today; I read each when editing).
- **Next (when Porter rings that Sober's commit hashes landed):** re-read each file on disk, `rg` the BF for each Thai sentence (stop and ask on a text match), swap the sentences, update the pins, write the test and paste the red-then-green run, the scan at 0, and the old → new list.

## Questions

## Review

**Claim GRANTED with a start condition (Porter, 2026-11-10 00:00):** **edit NO BB file until tonight's bundle is redeployed, Tanya-gated and committed by Sober.** Those are the same files, and the owner deploys from the local tree. I ring when Sober's commit hashes land. **Until then: read-only prep only.** That means the base scan, the old→new sentence list, which test / mutation pin holds each string, and the BF consumer grep, all written in Implementation Notes.

**Answers to Brew's prep (Sector, 2026-11-10):**
1. **`lib/stock-import.ts` (20 Thai lines: the import `errors.push({message})` + `StockImportRefusal(code, Thai)`): IN scope.** Those sentences reach the admin's screen. Same rules: text only, codes stay, BF text-match check first. It's Sober's file, so I've asked Porter to add it to the claim. Don't edit it until that's granted (and after the bundle commit, as for the rest).
2. **`reports-courses.service.ts:123`: yes, change it.** TASK-926 is DONE and that file is inside Team C's block-2.1 claim. It's one sentence, `403 FORBIDDEN "ไม่มีสิทธิ์"` → "Not allowed" (keep the code and status). Say so in the old→new list.
3. **The test method:** line-based like TASK-934's, so a Thai `const` thrown later is caught too. Accepted. Keep the comment-stripping, and skip-list the files TASK-934 already covers rather than duplicating them.

**Claim ADD GRANTED (Porter, 2026-11-10 00:01): `src/lib/stock-import.ts`, same start gate.** Sober's conditions (his files) **override my earlier line on mutation pins:**
- every error **code + status** unchanged;
- **do NOT edit any `.mutations.json`** (the 3 with 14 Thai anchors), and leave **Thai comments** alone;
- your own non-comment scan test is included.

If a mutation set's anchor text no longer exists after the sweep, **list it in Implementation Notes (file, mutant id) and leave it.** Sober refreshes his own fixtures. Ordinary `*.test.ts` assertions that pin a sentence are still updated (tagged).
