# SPEC-030: Collapse the checklist resolver to ONE T_T_REQUEST.REQUEST_TYPE lookup (REQ-028)

- Source: REQ-028 (Porter; do BEFORE อ.4-8). Drop the 4 per-family probe legs; route by REQUEST_TYPE.
- Status: ACTIVE — design locked; **implementation GATED on one real-data verification (below)**.

## Today vs target
**Today** `resolveChecklistRequestType(requestId)`: probes 4 family tables in order —
`resolveFromSpecial` (SPECIAL.FORM_ID 6/7→A6) → `resolveFromSaleInt` (SALE_INT.FORM_ID 14/16→A14) →
`resolveFromMove` (MOVE row→A9D/A9T) → `resolveFromSaleDom` (SALE_DOM row→A15) → then `switch(REQUEST_TYPE)`
(0/50/51/52/53/2). Each leg is a DB probe; the probes take PRECEDENCE over REQUEST_TYPE.

**Target** one `switch(T_T_REQUEST.REQUEST_TYPE)` (Porter's map), the only sub-lookup being MOVE for อ.9:
```
0  -> "CHECKPERSON"
2  -> resolveFromPlantEst(requestId)        // อ.1/3/20 — keep (existing sub-lookup)
3  -> resolveA9(requestId)                  // MOVE_REQUEST_TYPE==2 ? "A9D" : "A9T"  (only remaining probe)
4  -> "A4"                                   // อ.4-8, added when built
5  -> "A15"
6  -> "A14"
8  -> "A6"                                   // อ.6 + อ.7 (shared report)
50 -> "OPEN"  51 -> "EXPAND"  52 -> "PLANTCHANGE"  53 -> "PERSONCHANGE"
default -> throw
```
Delete `resolveFromSpecial` / `resolveFromSaleInt` / `resolveFromMove` / `resolveFromSaleDom`. Keep
`resolveFromPlantEst`. New `resolveA9` = the a9 destroy/transport sub-lookup (fetch MOVE, read MOVE_REQUEST_TYPE).

## ⚠️ Why this needs a verification gate (not just a mechanical swap)
The per-family probes were **added because routing was broken** (REQ-024: a9 500'd; DEF-11). They are
robust — they detect the actual family-table row. REQUEST_TYPE is a single code that could be null,
inconsistent, or shared. Collapsing is correct **only if REQUEST_TYPE is reliably populated and consistent
with the family tables.** Because the probes currently take PRECEDENCE, any request with a family-table row
but a different/null REQUEST_TYPE routes differently after the collapse. So — **confirm on REAL data before
deleting the probes** (DB = Porter/QA leg, rule #4):

1. **อ.6 vs อ.7 (Porter's explicit MUST-resolve):** today SPECIAL.FORM_ID 6/7 distinguishes them; both →
   "A6". Under REQUEST_TYPE, confirm **both อ.6 AND อ.7 requests carry a code that maps to A6** (Porter's map
   says 8=อ.6 but does not state อ.7's code). If อ.7 has a different code, add it → "A6"; if อ.7 has no
   distinct code, the pair is safe under 8→A6. Do not delete the SPECIAL leg until this is confirmed.
2. **อ.9 (code 3):** confirm real อ.9 (destroy + transport) requests have REQUEST_TYPE=3 — the DEF-11/REQ-024
   fix relied on MOVE-row presence; the collapse relies on REQUEST_TYPE=3 + the MOVE sub-lookup. If any a9
   request has ≠3, it re-breaks (the exact 500 we just fixed).
3. **อ.14 (6) / อ.15 (5):** confirm a real a14/a15 request carries 6/5 (and that these don't collide with an
   existing legacy meaning of 5/6).
Porter has the DB; a `SELECT REQUEST_TYPE, COUNT(*)` per family (+ one known requestId each) settles it.

## Cleanup (post-collapse)
- **Routing entities now dead:** `RequestSaleDomEntity`+repo were **routing-only** (a15 reads item-5 from
  VW, header from T_T_REQUEST) → **delete** after the SaleDom leg is removed. **Keep** `RequestSaleIntEntity`
  (a14 builder still reads `BUYER_NAME` for item-5) and `RequestMoveEntity` (a9 destroy item-5/item-12(1) +
  resolveA9). Verify each per SPEC-027 before deleting.
- `resolveChecklistRequestTypeByChecklistFormId` (history) already delegates to `resolveChecklistRequestType`
  → inherits the collapse automatically; no separate change.
- Note (Porter): `REF_REQUEST_ID` is a real parent/child spine — the resolver reads REQUEST_TYPE on the
  request itself (no child assumption), which is *more* correct than the probes; fine.

## Verify
- BE: one `switch`, 4 probe methods gone, `resolveA9` sub-lookup for code 3; test-compile + all PreviewTests
  green; boot clean. (Routing is a DB path — BE can't prove it, rule #4.)
- QA (real DB, via Porter — MANDATORY, this is shared routing): one real request per family through the REAL
  `/api/v1/download/checklist/{encId}` → correct report, no 500: อ.6, **อ.7**, อ.9-destroy, อ.9-transport,
  อ.14, อ.15, + a legacy (open/expand/…). Any family that mis-routes = stop.

## Tasks
- TASK-027 (GATED on the §verification, esp. อ.6/อ.7): collapse the resolver + delete the 4 probes + dead
  RequestSaleDom entity; `resolveA9` sub-lookup; QA every family.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
