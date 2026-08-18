# SPEC-025: Fix อ.9 real /download routing — add `resolveFromMove` leg (REQ-024)

- Source: REQ-024 (Porter formalised the latent defect Sober flagged during TASK-018). **HIGH — blocks อ.9
  production**: a real อ.9 request cannot route through `/api/v1/download/checklist/{id}`.
- Status: ACTIVE

## The defect (confirmed)
`RequestTypeResolverService.resolveChecklistRequestType` chain: `resolveFromSpecial` → `resolveFromSaleInt`
→ load request → `switch(REQUEST_TYPE)`.
- `resolveFromSpecial` reads `T_T_REQUEST_SPECIAL`, which holds **only FORM_ID 6** (Porter's SQL). Its
  `case FORM_ID_A9, FORM_ID_A10 -> "A9"` branch **can never match** → dead code.
- The `REQUEST_TYPE` switch has **no อ.9 case** (only 0/50/51/52/53/2).
- ⇒ A real อ.9 requestId falls through to `default -> throw` → **`/download` fails for every real อ.9**.
  (Only the dev `/a9/db/{id}` seam works, because it bypasses the resolver — which is why อ.9 rendered in
  QA but would 500 on the real endpoint.)

## Fix — a per-family MOVE leg (mirror `resolveFromSaleInt`, added in TASK-018)
Each form family routes by its own table (Porter's PROJECT FACT: อ.6=SPECIAL, อ.9=`T_T_REQUEST_MOVE`,
อ.14=SALE_INT). Add:
```java
// อ.9/อ.10 (ขนย้าย) — own table T_T_REQUEST_MOVE
private String resolveFromMove(Long requestId) {
    return requestMoveRepository.findByRequestId(requestId).isPresent() ? "A9" : null;
}
```
- **Row-presence based** (`findByRequestId` already exists). `T_T_REQUEST_MOVE` is the อ.9-exclusive family
  table, so a MOVE row ⇒ "A9" (both อ.9 and อ.10 share report "A9", exactly like SALE_INT→A14). **No entity
  change** (MOVE does not map FORM_ID; row-presence is sufficient and minimal).
  > Optional tightening: if BE confirms `T_T_REQUEST_MOVE.FORM_ID` exists, gate on FORM_ID 9/10 for parity
  > with `resolveFromSaleInt` (14/16). Not required — row-presence is correct because the table is family-exclusive.
- Insert in the chain **after `resolveFromSaleInt`, before the REQUEST_TYPE fallback** (order among family
  legs is irrelevant — each request is in exactly one family table).
- **Cleanup:** remove the dead `case FORM_ID_A9, FORM_ID_A10 -> "A9"` from `resolveFromSpecial` (it can never
  fire and misleads readers into thinking อ.9 routes via SPECIAL). Leave `FORM_ID_A6/A7 -> "A6"` untouched.

## Verify
- BE: `test-compile` green; resolver logic reads MOVE via `findByRequestId`; `resolveFromSpecial` no longer
  references 9/10; a6/a14/other routing unchanged (special/saleInt/REQUEST_TYPE legs intact). (Real routing
  needs the DB — QA's leg, rule #4.)
- QA (real DB, via Porter): a real อ.9 requestId (e.g. 18847 / 37956 / a destroy sample) through the **real**
  `/api/v1/download/checklist/{encryptedId}` (not the /a9/db seam) → returns the อ.9 PDF (routes to "A9"),
  not a 500/mock. อ.6 and อ.14 requests still route correctly (regression).

## Note
This is the same per-family leg shape อ.4–อ.8 (`T_T_REQUEST_IMPORT`) will add later — the resolver is
converging on "one leg per family table + REQUEST_TYPE fallback for the legacy forms". No broader refactor here.

## Tasks
- TASK-021: add `resolveFromMove` leg + remove the dead SPECIAL 9/10 branch.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
