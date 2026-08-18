# TASK-021: อ.9 /download routing — add `resolveFromMove` leg + drop dead SPECIAL 9/10 branch (REQ-024)

- Source: SPEC-025 (REQ-024). HIGH — unblocks อ.9 on the real `/download` endpoint.
- Status: DONE (Sober-reviewed)
- Assignee: Jason (BE)
- Depends on: none
- ⚠️ Shared resolver — must NOT change อ.6 / อ.14 / legacy REQUEST_TYPE routing.

## Change (`RequestTypeResolverService`)
1. Add a per-family leg (mirror `resolveFromSaleInt`):
   ```java
   private String resolveFromMove(Long requestId) {
       return requestMoveRepository.findByRequestId(requestId).isPresent() ? "A9" : null;
   }
   ```
   Inject `RequestMoveRepository` (its `findByRequestId` already exists). `T_T_REQUEST_MOVE` is the
   อ.9-exclusive family table → a row ⇒ "A9" (covers both อ.9 and อ.10, same report). No entity change.
2. Call it in `resolveChecklistRequestType` **after `resolveFromSaleInt`, before** the `REQUEST_TYPE` switch:
   ```java
   String moveType = resolveFromMove(requestId);
   if (moveType != null) return moveType;
   ```
3. **Remove** the dead `case FORM_ID_A9, FORM_ID_A10 -> "A9"` from `resolveFromSpecial` (SPECIAL holds only
   FORM_ID 6 — it never matches). Keep `FORM_ID_A6, FORM_ID_A7 -> "A6"`. You may also drop the now-unused
   `FORM_ID_A9/FORM_ID_A10` constants if nothing else references them.
- (Optional, only if you confirm `T_T_REQUEST_MOVE.FORM_ID` exists: gate on FORM_ID 9/10 for parity with
  the SALE_INT leg. Not required — row-presence is correct for a family-exclusive table.)

## Verify — BE (compile/logic), then QA (real DB)
- BE: `./mvnw -o -DskipTests=false test-compile` green; app boots; `resolveFromSpecial` no longer references
  9/10; the new leg sits after saleInt / before the REQUEST_TYPE switch. a6/a14/legacy legs untouched.
- QA (real DB, via Porter — the routing proof needs the DB, rule #4): a **real** อ.9 request (18847 /
  37956 / a destroy sample) through `/api/v1/download/checklist/{encryptedId}` (the REAL endpoint, not
  `/a9/db`) → returns the อ.9 PDF (routes "A9"), no 500. อ.6 + อ.14 requests still route correctly.

## Definition of Done
- [ ] `resolveFromMove` leg added (row-presence → "A9"), called after saleInt / before REQUEST_TYPE fallback.
- [ ] Dead SPECIAL `9/10 -> "A9"` branch removed; a6 `6/7 -> "A6"` intact.
- [ ] test-compile + all PreviewTests green; app boots; no change to อ.6/อ.14/legacy routing.

## Handoff after DoD
Back to **Sober** for review, then QA proves a real อ.9 routes through the real `/download` endpoint.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Implementation Notes
**1 file: `RequestTypeResolverService`.** อ.6/อ.14/legacy routing untouched.
- Injected `RequestMoveRepository`; added `resolveFromMove(requestId)` = `findByRequestId(...).isPresent()
  ? "A9" : null` (T_T_REQUEST_MOVE = อ.9-exclusive family table → row ⇒ A9, covers อ.9+อ.10).
- Chain order now: `resolveFromSpecial` (a6: 6/7→A6) → `resolveFromSaleInt` (a14: 14/16→A14) →
  **`resolveFromMove`** (a9) → REQUEST_TYPE switch (legacy). Each family-exclusive; one request → one family.
- Removed the dead `case FORM_ID_A9, FORM_ID_A10 -> "A9"` from `resolveFromSpecial` (SPECIAL holds only
  FORM_ID 6 — never matched) and dropped the now-unused `FORM_ID_A9`/`FORM_ID_A10` constants. `6/7 -> "A6"` intact.

**Verify:** `./mvnw -o -DskipTests=false test-compile` → BUILD SUCCESS; `grep FORM_ID_A9|A10` = 0; chain
order confirmed (special→saleInt→move→fallback); **app boots clean** (RequestMoveRepository injected).
@Sober: ready for review. QA (real DB, rule #4): a real อ.9 (18847/37956/destroy) through the REAL
`/api/v1/download/checklist/{encryptedId}` → returns the อ.9 PDF (routes "A9"), no 500; อ.6 + อ.14 still route correctly.

## Review
**Verdict: DONE** (Sober, 2026-08-18). Verified the resolver code + build independently:
- `resolveFromMove` (L142-143) = `findByRequestId(id).isPresent() ? "A9" : null`; `RequestMoveRepository` injected. ✅
- Chain order: `resolveFromSpecial` → `resolveFromSaleInt` → **`resolveFromMove`** → REQUEST_TYPE switch (L43/49/55). ✅
- Dead SPECIAL branch removed — `resolveFromSpecial` now only `case FORM_ID_A6, FORM_ID_A7 -> "A6"` (L123); FORM_ID_A9/A10 constants gone. ✅
- `test-compile` → BUILD SUCCESS; app boots (repo injected). a6/a14/legacy legs untouched. ✅
- Real-routing proof = QA's DB leg (rule #4): a real อ.9 via the REAL `/api/v1/download/checklist/{encId}` → "A9" PDF, no 500.
