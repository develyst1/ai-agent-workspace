# SPEC-040 — REQ-035: refrow4 long-run binds the buyer DOCUMENT-TYPE name (was mis-bound to the ref number)

- Source: DEF-22 (Jason found refrow4 renders its value twice) → stakeholder ruled it's a **mis-binding, not a design defect**.
- The long dotted run in `refrow4` (`☐ ตาม ....`) is the **write-in for the buyer's document TYPE**, not a repeat of เลขที่.
- The stakeholder already relabelled the frozen a9-transport `ตามหนังสือขอซื้อ` → **`ตาม`** so the type name sits in the run.

## Target vs now (stakeholder, verbatim)
```
NOW:     ☐ ตาม ....<ref number>.... เลขที่ <ref number> ลงวันที่ .....
TARGET:  ☐ ตาม ....<document type name>.... เลขที่ ..... ลงวันที่ .....
```
So: the **long run (x=136) shows the doc-type NAME**; **เลขที่ (x=347) shows the reference number** (unchanged);
ลงวันที่ unchanged. The two must stop sharing `$F{detail}` (that shared bind is exactly why DEF-22 looked like a double-print).

## Data source (stakeholder-supplied — authoritative)
- `T_T_REQUEST_BUYER.BUYER_DOC_TYPE` (int) → `T_S_COMMON_CODE.CODE_INT` where `GROUP_CODE='BuyerDocType'` → `CODE_NAME`.
- Known values: `1 หนังสือขอซื้อ · 2 สัญญาซื้อขาย · 3 ใบสั่งซื้อ · 9 อื่นๆ`.
- Sample `REQUEST_ID=38406` (buyer 2979, `BUYER_DOC_TYPE=1`, `BUYER_DOC_NO` null).

## Porter's three constraints (held — do not assume away)
1. **Read the label from the DB, never hardcode it.** Reference data gets renumbered here
   ([[checklist master SEQUENCE is unstable]] class of trap) — resolve `CODE_INT`→`CODE_NAME` at runtime.
2. **`CODE_INT=9` → print `BUYER_DOC_TYPE_OTHER`, falling back to `อื่นๆ`.** Sample 38406 is null on that branch →
   it is **UNVERIFIED**; test it with a deliberate type-9 request, don't let a green type-1 run stand in for it.
3. **Multiple buyer rows:** filter `(STATUS IS NULL OR STATUS <> 'D')` — bare `<> 'D'` is UNKNOWN on NULL and drops
   rows silently. If **>1 survives, route up — do not pick one.**

## Scope / freeze note
- The a9-transport freeze is **lifted ONLY for this specific stakeholder-directed rebind**: geometry (x/width/heights)
  stays byte-identical; only the field a band element reads changes. Re-verify geometry unchanged after (frozen_check on
  positions), then it's frozen again.
- **Shared blast radius:** `buildTransportItem12` + the refrow4 band are shared by **a9-transport AND a15** (TASK-047).
  One builder change + the band rebind cover both; regression-check both.

## Entity gap (DEF-17 discipline)
`RequestBuyerEntity` does **not** currently map `BUYER_DOC_TYPE` / `BUYER_DOC_TYPE_OTHER` (dropped in the DEF-17 re-map).
Jason adds the `@Column`s and **verifies they exist against the app's live `DID_SPF` connection** — dict/ALL_TAB_COLUMNS
is not proof ([[dict-is-not-the-app-schema]]). If a column is absent at runtime → STOP, route up, do not invent.

## Multi-buyer — RULED by stakeholder 2026-09-03
**One buyer per request only.** So the `if (buyers.size() > 1) throw` at `A9CheckListReportBuilderBase:299` is
**correct — do NOT soften it to first-row.** >1 active buyer is an invalid data state and should fail loud, not print an
arbitrary buyer's doc type on a permit. (Constraint #3's "route up" is satisfied by the throw.)

## Closure — REQ-035 CLOSED by stakeholder 2026-09-03
Verified on real data **38399**: `☑ ตาม ....หนังสือขอซื้อ.... เลขที่ ....161564.... ลงวันที่ ....31/05/2569....` — doc-type
name in the run, ref number once. `BUYER_DOC_TYPE` columns exist live (the render proves it). DONE.

## Task
- TASK-048 (Jason, BE).

## Acceptance
- On a real /download, refrow4 shows the buyer doc-type **name** in the long run and the reference **number** in เลขที่ —
  each once, no repeat. Type-1 (38406) verified; **type-9 (other) verified separately** (deliberate sample) or recorded
  as an explicit unverified gap. `(STATUS IS NULL OR STATUS<>'D')` filter in place; >1 buyer row → routed up, not guessed.
- a9-transport geometry unchanged (mechanical check); a15 regression-checked (same shared band/builder).
- Labels resolved from `T_S_COMMON_CODE` at runtime, not hardcoded.
