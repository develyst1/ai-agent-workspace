# TEST-011: REQ-035 BUYER_DOC_TYPE column-safety gate (อ.9 / อ.15)

- Source: REQ-035 blocking gate (Porter, 2026-09-03) — DEF-17 class
- Status: PASS
- Environment: own clean build (BUYER_DOC_TYPE + BUYER_DOC_TYPE_OTHER present in RequestBuyerEntity),
  `:33022`, dev, UAT-wired (DID_SPF), read-only
- Tested: 2026-09-03 by Tanya

## Gate
REQ-035 added `@Column("BUYER_DOC_TYPE")` / `@Column("BUYER_DOC_TYPE_OTHER")` to `RequestBuyerEntity`.
If either column is absent on live `DID_SPF`, every อ.9 + อ.15 download 500s with ORA-00904 (a DEF-17
repeat on already-delivered forms). Gate = real render on an อ.9 and an อ.15 → **200, zero ORA**.

## Result
| Form | Request | Endpoint (exercises the buyer query) | HTTP | ORA |
|------|---------|--------------------------------------|------|-----|
| อ.9 (type-1) | 38406 | `/a9/db/38406` | **200** application/pdf | — |
| อ.15 | 18041 | `/a15/db/18041` | **200** application/pdf | — |
| — | — | server log this run | — | **0 ORA of any code** |

`/aN/db` calls the same builder that `/download` uses, so it runs the `RequestBuyer` SELECT with the new
columns against the app's own DID_SPF connection — the exact path that would ORA-00904 if the columns
were invented. Both 200, no ORA.

## Verdict
**PASS.** `BUYER_DOC_TYPE` / `BUYER_DOC_TYPE_OTHER` exist on live DID_SPF; REQ-035 does not repeat DEF-17.
The gate is green — REQ-035 is safe to proceed. Next: TEST-010 (DEF-21) with the corrected `ReqSaleDom`
codes (00014 / 00020), using 38399 for a `BUYER_DOC_NO`-populated request.
