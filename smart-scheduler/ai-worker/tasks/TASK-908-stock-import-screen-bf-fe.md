# TASK-908 — FE: Stock IMPORT screen (git-style diff → confirm) — backoffice-front, Stock block — @Fern (lent to Team A's Stock block)

**From @Sober, 2026-11-09. This is the BF half of the import flow; the BE half is @Bob's TASK-904. Fern already built this GREEN on a fixture seam (report was in inbox/SA.md) — this TASK adopts that build and pins the contract so the real wiring is a one-file swap when 904 lands.** Repo `smart-scheduler-backoffice-front`, branch `dong`. Route `/stock/import` ("Stock import", STOCK group, **CEO only**). Git only on the owner's word. **Chain: report + questions in this TASK `## Questions`; Sober reviews (Stock is Team A's).**

## Status at adoption (Fern's report, 2026-11-09)
Upload `.xlsx` → "Check changes" → diff grouped by kind (New · Quantity changes · Field changes · Removed), counts, signed qty delta, field changes listed, removed row shown + "not deleted", not-imported columns named → Confirm import (N) → result → negative-balance refusal (red alert, "nothing was written"). Non-.xlsx = 400. Dark + mobile OK. Files: `types/app/stock-import.ts`, `services/stock-import.service.ts` (**the one file to swap when 904 lands**), `services/__fixtures__/stock-import.ts`, `components/partials/StockImport/*`, `app/(admin)/stock/import/page.tsx`, +1 `lib/roles/pages.ts` row. **Proof: tsc 0 · bun 132/0 (12 new) · mutations 10/10 · next build 0 · live headless (CEO diff→confirm→result, negative refusal, bad file, mobile, admin NO-ACCESS).**

## CONTRACT (Sober's answers — pinned against TASK-904; Fern Q1–Q6)
The import is **git-style: preview = stage, apply = commit.** Aligned with 904's `bo.item`/`bo.movement` model.

**Q1 — Preview envelope: ✅ confirmed, with two additions.**
`POST /v1/stock/import/preview` (CEO, multipart xlsx) → `{ batchId, rows: Row[], notImported: string[] }`.
- `Row = { model, name, kind, before, after, delta }`. **`name` IS sent per row** (display name from the sheet, or the existing item for a change/removed). `model` = the product code (BE `externalRef`).
- **`kind` is exactly one of `"new" | "qty_change" | "field_change" | "removed"`** (match 904 line 12 — use these strings, your UI groups them into New / Quantity changes / Field changes / Removed).
- `before`/`after` = `{ name?, priceSatang?, quantity?, category?, commissionGroup? }` — **add `category` and `commissionGroup`**: 904 imports both (price `unitPriceMinor` satang, category as a tag, new nullable `commission_group`), so a `field_change` can be any of name/price/category/commissionGroup. `before` null for `new`; `after` null for `removed`. `delta` = signed qty integer (only meaningful for `qty_change` and `new`'s opening).

**Q2 — Apply request: `{ batchId }` only. The xlsx is NOT re-sent.**
`POST /v1/stock/import/apply` (CEO) body `{ batchId }`. Preview **stages the parsed sheet + computed diff server-side under `batchId`** (TTL ~30 min); apply re-reads the staged batch, **re-checks balances at apply-time** (they may have moved since preview) and writes. The client never resends the diff (so it can't be tampered between preview and apply). *This pins the "or its id" branch of 904 line 13 — I've told Bob the staging is required, not optional.*

**Q3 — `notImported`: YES, a field of the preview** (`string[]` of recognised-but-unimported sheet columns: the `Other` balance column, picture, note, Remark — per 904 line 51). Show them named, as you do.

**Q4 — Apply result: ✅ confirmed.**
`{ batchId, movementsWritten, itemsAdded, fieldEdits, removedLeft, alreadyApplied? }`.
- **A `new` item's opening movement COUNTS in `movementsWritten`** (904 Q3: a new product starts with ONE opening movement so the card starts from a movement, not a bare number). So your fixture's `3 = 2 qty changes + 1 opening` is right.
- `alreadyApplied: true` on an idempotent re-apply (batch already committed → **no new writes**, the result echoes the first apply's counts). 904 keys each movement `idempotencyKey = stock-import:<batch>:<model>`.

**Q5 — Negative-balance refusal: `409 NEGATIVE_BALANCE`, whole apply refused atomically, nothing written.**
Body `{ error: "NEGATIVE_BALANCE", model, name, resultingBalance }`. Show it as you do (red alert naming Model code + name, "nothing was written"). *Note: 904's existing `bo.item` path emits `409 CEILING_EXCEEDED` for its ceiling; I've told Bob the import-apply path must emit **`NEGATIVE_BALANCE`** specifically for a below-zero result, so your code and his agree on one string.*

**Q6 — proxy.ts matcher gap: CONFIRMED real — YOU add the one line, for ALL /stock routes.**
`src/proxy.ts` matcher (line 20) has no `/stock/:path*`, so the edge cookie guard misses `/stock/out`, `/stock/reports`, `/stock/import` (the layout role gate still applies = defence in depth, but the edge guard should cover it). **Add `"/stock/:path*"` to the matcher as part of this TASK.** It covers 905/906/908 at once — I'm giving it to you alone so Fanta/Flash do NOT also touch `proxy.ts` (no 3-way race on a shared file). One line, evidence it builds.

## To finish (small)
- Fix the `kind` strings to exactly `new | qty_change | field_change | removed` if yours differ.
- Extend `before`/`after` to include `category?` and `commissionGroup?` (even if your fixture doesn't exercise them yet — the type must match 904).
- Add `"/stock/:path*"` to `proxy.ts` (Q6).
- Keep the service seam one-file-swappable; do NOT wire the real endpoints until 904 deploys (STOCK_SOURCE / fixture, as 905/906 do).

## Done = (evidence in `## Implementation Notes`)
- `tsc` 0 · `bun test` repo green · `next build` 0 · headless CEO run of diff→confirm→result + negative refusal + bad file + mobile + admin NO-ACCESS; proxy build includes `/stock`.
- `git status` = only your files; no Salary file, no `smart-scheduler-back`; no git command.

## Claim
backoffice-front: the `/stock/import` screen + `stock-import.service.ts` seam + its fixture + the `pages.ts` row + **the `proxy.ts` `/stock` matcher line**. **Sober reviews.** Contract questions beyond Q1–Q6 → me.

## Questions / Implementation Notes / Review
_(Fern's original 6 questions answered above. Further questions here.)_

## Implementation Notes (Fern, 2026-11-09) — the "To finish" list is done
- **Kind strings:** already exactly `new | qty_change | field_change | removed` (a test pins the four).
- **`before`/`after`:** `StockSnapshot` now has `category?: string | null` and `commissionGroup?: {name, amountSatang} | null` (as `GET /v1/stock/products`). `fieldDeltas` lists name · price · category · commission group (an unchanged group is not a change; a removed group is). The screen shows «Category: Safety → Helmets» and «Commission group: Animal Helmet (40.00 ฿) → Animal Helmet (50.00 ฿)». The fixture's ANI-HEL-020 row now exercises both.
- **`proxy.ts`:** `"/stock/:path*"` added to the matcher (one line). Proof on a production build: with no cookie, `/stock/import`, `/stock/out` and `/stock/reports` all answer **307** (redirect to login). A test pins the matcher line.
- **Seam:** unchanged, one file (`stock-import.service.ts`); `STOCK_IMPORT_SOURCE = "fixture"`; the real endpoints are NOT wired (904 not deployed).
- **Proof:** tsc 0 · `bun test` whole repo **155 pass / 0 fail** (15 in this folder, 3 new) · mutations 3/3 new killed (category, commission group, proxy matcher; the earlier 10 still pass) · `next build` 0. The earlier headless run (diff→confirm→result, negative refusal, bad file, mobile, admin NO-ACCESS) was on the screen before this small change; I did not rerun it, the diff view change is covered by the unit tests.
- **For the wiring TASK (observation):** Q5's refusal body is `{ error: "NEGATIVE_BALANCE", model, name, resultingBalance }` (a flat string), while the shared axios interceptor reads the envelope `{error:{code,message}}`. When 904 is wired, either Bob sends the envelope (code `NEGATIVE_BALANCE` + a message naming the item), or the seam builds the sentence from `model/name/resultingBalance`. I will do whichever you pick; the fixture's sentence names Model code + name + resulting balance.
- **Files:** `types/app/stock-import.ts`, `services/__fixtures__/stock-import.ts`, `components/partials/StockImport/{StockImport.tsx,import-logic.ts,stock-import.test.tsx}`, `src/proxy.ts`. No Salary file, no `smart-scheduler-back`, no git command.

## Review (Sober, SA Lead A, 2026-11-09) — ✅ ACCEPTED on the fixture; NEGATIVE_BALANCE answered
Adopted your green build (category/commissionGroup added, `/stock/:path*` in proxy.ts, tsc 0, bun 155/0, build 0). Contract now verified against Bob's SHIPPED 904 code (`src/routes/stock.ts`), so the swap is clean.
**Your wiring question — the NEGATIVE_BALANCE body shape:** `HTTP 409`, body **`{ error: "NEGATIVE_BALANCE", model, name, resultingBalance }`** (exactly what you assert). Two more apply errors to handle on the real wiring (both mean "the staged batch is unusable — send the user back to re-upload / re-preview"):
- `409 STALE` — balances moved since the preview; show "the stock changed, please check again" and re-run preview.
- `404 BATCH_NOT_FOUND` — the 30-min staged batch expired or is unknown; same "preview again" path.
Also: Bob's preview returns a **`flags[]`** array (the Other-branch guard — a row with a non-zero "Other"/future-branch value, message "Other branch not supported yet — value N not imported"). Today it never fires (the real sheet's Other is empty), but render it near "not imported" so it surfaces the day Khwan fills that column. Apply stays `{ batchId }` only (confirmed in code). **Verdict: ✅ ACCEPTED.** Ball: you — the only open item is the real wiring when BB deploys to sid (keep the seam one-file-swappable; nothing to change now).

## Implementation Notes — prep for the real wiring (Fern, 2026-11-09, after the ACCEPT)
Done on the fixture so the swap stays one file (Sober's headlines: STALE / BATCH_NOT_FOUND / flags[]):
- **`flags?: string[]`** on `ImportPreview`; the screen shows them in a yellow "Check before confirming" box above the diff (none → no box).
- **409 `STALE` and 404 `BATCH_NOT_FOUND`** (`isStaleBatch` in `import-logic.ts`) → an orange "Stock changed or the check expired — nothing was written" with a **Check again** button that re-previews the same file. NEGATIVE_BALANCE stays the red refusal.
- Fixture triggers: a file name with "flag" adds a flag; "stale" makes the apply answer STALE.
- tsc 0 · bun **157 pass / 0 fail** · 3 new mutations killed · `next build` 0. Not browser-run for this addition (unit-tested; the Check again button is not clicked in a browser). Real wiring (flat `{error:"STALE"}` bodies vs the client envelope) is still the wiring TASK's job. No git.

## Review update (Sober, 2026-11-09) — "to finish" DONE; fully ACCEPTED; the error shape, corrected
Your finish items are in (kind strings pinned, category/commissionGroup on before/after, `/stock/:path*` giving 307 without a cookie on all 3 routes, seam still one file; tsc 0, bun 155/0, build 0). **Fully ACCEPTED on the fixture.**
**Your flat-vs-envelope question — the answer is the ENVELOPE, and uniformly for all three.** I checked the app's error convention (`backoffice-back/src/index.ts app.onError`): the standard is **`{ error: { code, message, details } }`**. NEGATIVE_BALANCE was special-cased flat (my earlier wrong pin) — I'm having Bob align it to the envelope, so **parse all three the same way**:
- `409` + `error.code === "NEGATIVE_BALANCE"` → `error.details = { model, name, resultingBalance }`; show `error.message` (Thai).
- `409` + `error.code === "STALE"` → "stock changed, check again" → re-preview.
- `404` + `error.code === "BATCH_NOT_FOUND"` → staged batch expired (30 min) → re-preview.
Plus render the preview's `flags[]` (Other-branch guard). So read `error.code` off the envelope, not a flat string. (If you already coded the flat shape, switch to `error.code`/`error.details` — it lands once Bob's fix is in.) Nothing else to change; real wiring waits on BB deploy.

## Implementation Notes — envelope switch (Fern, 2026-11-09, per Sober/Porter 02:45)
- The seam already raised `ApiClientError(code, message, status)` from the envelope, so `NEGATIVE_BALANCE` / `STALE` / `BATCH_NOT_FOUND` were read off `error.code` (no flat parsing existed). The one missing piece was **`error.details`**: the shared client dropped it. Now: `ApiError.error.details?` in `types/api/contract.ts`, and `ApiClientError` carries an optional 4th field `details`, passed from the interceptor (`lib/api/client.ts`, 2 small edits to shared files; all existing callers unchanged).
- `negativeBalanceDetails(error)` (`import-logic.ts`) returns `{model, name, resultingBalance}` only for code `NEGATIVE_BALANCE` with a well-formed details object. The red refusal alert shows the server's `error.message`, plus a line «MODEL (name) would be left at N» from the details. The fixture's refusal carries the same details.
- tsc 0 · bun **229 pass / 0 fail** (whole repo now) · 3 new mutations killed (client drops details, code check, shape check). No git.

## 908 envelope switch ✅ ACCEPTED (Sober, 2026-11-09)
Fern's fix: the parser already read `error.code`; the gap was `error.details`, dropped by the shared client — fixed with `ApiError.error.details?` + `ApiClientError.details` (2 edits in `lib/api/client.ts` / `types/api/contract.ts`, all callers unchanged = additive, as I approved). 908's red refusal now shows «MODEL (name) would be left at N» from `error.details`. tsc 0, bun 229/0, 3 mutations killed. ✅ ACCEPTED. The shared-client `.details` addition is the one Fanta's 910 + Fern's 918 also rely on — good it's in. Fern → TASK-918.
