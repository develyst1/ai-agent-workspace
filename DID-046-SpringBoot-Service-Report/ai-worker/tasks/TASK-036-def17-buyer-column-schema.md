# TASK-036: DEF-17 — buyer table was ALTERED; re-map entity + move item-12 values to T_T_REQUEST_DOC

- Source: DEF-17 (prod 500 on อ.9-transport / อ.14 / อ.15). 🔴 TOP. Assignee: Jason (BE).
- Root cause (Porter, authoritative `DID_SPF`): `T_T_REQUEST_BUYER` was **restructured** — every date/attachment
  column the item-12 buyer block read was DROPPED; the values **relocated to `T_T_REQUEST_DOC`** (the row already
  joined for the tick). `GRANTOR_*` columns were ADDED. Not a schema mixup — a DB fact with a shelf life (cf. ReqSaleDom 22→21).
- **No interim un-break** (Porter): the values still exist on the doc row, so go straight to the real fix — a6 already
  reads dates off `T_T_REQUEST_DOC` for items 1/2/5; make item-12 use that same mechanism.

## The relocation (confirmed on 38362; T_T_REQUEST_DOC authoritative `DID_SPF`)
| form write-in | OLD (dropped from BUYER) | NEW (on the doc row already fetched) |
|---|---|---|
| ลงวันที่ / ออกให้เมื่อ | `*_ISSUE_DATE` | `RequestDocEntity.issueDate` (ISSUE_DATE) |
| วันหมดอายุ | `*_EXPIRY_DATE` | `RequestDocEntity.expiryDate` (EXPIRY_DATE) |
| เลขที่ / ที่ | `*_NO` | `DOCUMENT_NO` **or** `DOCUMENT_NAME_OTHER` — see DATA REQUEST below |
| tick | `*_ATT_FILE_ID` | `ATTACH_FILE_ID` (already the tick source) |
- **Good news: `RequestDocEntity` ALREADY maps** ID/REQUEST_ID/REQUEST_CHECKLIST_ID/ATTACH_FILE_ID/ISSUE_DATE/
  EXPIRY_DATE/DOCUMENT_NO/DOCUMENT_NAME_OTHER/DOCUMENT_NAME/STATUS. **No new doc columns needed.**

## Do
1. **Re-map `RequestBuyerEntity` to ONLY the authoritative `DID_SPF` columns; verify the WHOLE entity** (ORA-00904
   stops at the first offender). Remove the dropped cols currently mapped: `ATTORNEY_BOOK_ISSUE_DATE`,
   `ASSOC_PRES_ID_CARD_EXPIRY_DATE`, `ATTORNEY_ID_CARD_EXPIRY_DATE`, `BUYER_DOC_DATE`, `BUYER_DOC_ATTACH_FILE_ID`,
   `GOV_COMMITTEE_ISSUE_DATE`, `GOV_COMMITTEE_ATT_FILE_ID` (and any other mapped col not in the DID_SPF list — check
   `BUYER_DOC_NO`). **Add** `GRANTOR_NAME_PREFIX/_NAME/_MIDDLE_NAME/_SURNAME/_ID_CARD_NO`. Keep: names,
   `ASSOC_PRES_ID_CARD_NO`, `ATTORNEY_ID_CARD_NO`, `GOV_COMMITTEE_NO`, `BUYER_DOC_TYPE`, address block, etc.
2. **Repoint item-12 write-in values to the doc row** in `A9CheckListReportBuilderBase` (used by transport + a15;
   a14 has its own — do both). At base lines ~282/285/290/294/301/306 the sub-lines currently read buyer date/number
   getters — replace each with the value off `docByChecklist.get(idFor(idByCode, "<that line's code>"))`:
   `issueDate(doc)` for ลงวันที่, an `expiryDate(doc)` helper for วันหมดอายุ, a `documentNo(doc)` helper for เลขที่.
   The doc row is ALREADY fetched for the tick — one lookup serves tick + values, so they can never disagree.
3. **Card numbers:** บัตรนายกสมาคม stays `ASSOC_PRES_ID_CARD_NO`; **บัตรนายกสมาคม/ผู้มอบอำนาจ → `GRANTOR_ID_CARD_NO`**
   (this resolves the base `:271`/`:278` duplicate binding — both currently read `ASSOC_PRES_ID_CARD_NO`); ผู้รับมอบอำนาจ
   stays `ATTORNEY_ID_CARD_NO`. Card วันหมดอายุ → the doc row's EXPIRY_DATE for that card's line.
4. Blank-safe: rows with `ATTACH_FILE_ID=0` have null dates → blank stays blank, no special handling.
5. **Printed structure / order / labels UNCHANGED** — only the value source moves.

## DATA REQUEST (Sober → Porter → human) — resolve before wiring เลขที่
On 38362 (destroy) `DOCUMENT_NO` is null and `DOCUMENT_NAME_OTHER` carries `5/2569` — but destroy has no item-12 buyer
lines, so this is untested for them. Need a POPULATED **อ.9-transport or อ.14** request's `T_T_REQUEST_DOC` rows for the
item-12 buyer lines (ขอซื้อ / คณะกรรมการ) showing whether **`DOCUMENT_NO` or `DOCUMENT_NAME_OTHER`** carries the "เลขที่".
Do not pick on a hunch (Porter). Until then Jason may wire `DOCUMENT_NO` as primary and flag the fallback.

## Verify — BE then QA
- BE: every mapped `RequestBuyerEntity` col is in the authoritative DID_SPF list; test-compile + boots; all 5
  PreviewTests green; item-12 values read from the doc row; `GRANTOR_ID_CARD_NO` wired; base `:271`/`:278` no longer duplicate.
- QA (real DB): real `/download` **อ.9-transport, อ.14, อ.15 → 200 with values** (dates/numbers/ticks present where
  docs exist); **a6/38272 unchanged (canary)**; a9-destroy 200.

## Process guard (amend SPEC-027)
Dict citation is necessary but NOT sufficient, AND a verified column can be dropped later — verify new `@Column`s on
SELECTed entities against the app's ACTUAL connection, and treat any DB snapshot as perishable (re-verify at build/QA).

## Handoff
Back to **Sober** (review the entity re-map completeness + the item-12→doc-row repoint + GRANTOR fix). QA proves 200 with values.

## Progress — EXECUTED, DB-free verified → REVIEW (2026-08-25)

**1. `RequestBuyerEntity` re-mapped to the authoritative DID_SPF list.** Removed all 7 dropped columns
(`ATTORNEY_BOOK_ISSUE_DATE`, `ASSOC_PRES_ID_CARD_EXPIRY_DATE`, `ATTORNEY_ID_CARD_EXPIRY_DATE`, `BUYER_DOC_DATE`,
`BUYER_DOC_ATTACH_FILE_ID`, `GOV_COMMITTEE_ISSUE_DATE`, `GOV_COMMITTEE_ATT_FILE_ID`) + `BUYER_DOC_NO` (unused now
that เลขที่ sources from the doc row). Added `GRANTOR_NAME_PREFIX/_NAME/_MIDDLE_NAME/_SURNAME/_ID_CARD_NO`. Kept
names, `ASSOC_PRES_ID_CARD_NO`, `ATTORNEY_ID_CARD_NO`, `GOV_COMMITTEE_NO` per the task.

**2. Item-12 (a9-base, used by transport + a15) repointed to the doc row.** Threaded `docByChecklist` through
the `buildItem12` hook (base + all 3 subclasses) so `buildTransportItem12` can resolve each line's doc row by
its own code (00014/00015/00016/00018/00019/00020) — one lookup serves tick + value, can't disagree:
- 00016 (บัตรนายก): no=`BUYER.ASSOC_PRES_ID_CARD_NO` (kept), expiry=doc row.
- 00018 (บัตรนายก/**ผู้มอบอำนาจ**): no=`BUYER.GRANTOR_ID_CARD_NO` (**new col — resolves the old :271/:278 duplicate**,
  confirmed by grep: 00016 and 00018 now read different buyer columns), expiry=doc row.
- 00019 (มอบอำนาจ): ลงวันที่ = doc row `ISSUE_DATE` (was `ATTORNEY_BOOK_ISSUE_DATE`, dropped).
- 00020 (บัตรผู้รับมอบ): no=`BUYER.ATTORNEY_ID_CARD_NO` (kept), expiry=doc row.
- 00014 (ขอซื้อ): เลขที่=doc row `DOCUMENT_NO` (wired as **primary**, not decided which of DOCUMENT_NO/
  DOCUMENT_NAME_OTHER is authoritative — flagged, see DATA REQUEST below, did not guess), ลงวันที่/tick=doc row.
- 00015 (คณะกรรมการ): เลขที่=`BUYER.GOV_COMMITTEE_NO` (kept, real column), ลงวันที่/tick=doc row.

**3. a14 (`A14CheckListReportBuilder`) — could NOT apply the same code→doc-row repoint.** Its item-12(3)/(5)/(7)
lines (มอบอำนาจ/บัตรผู้รับมอบ/ขอซื้อ) have **no master `CHECKLIST_CODE` at all** per Porter's own `ReqSaleInt`
table ("no master row — own tables, §4 carve-out") — so there is no `REQUEST_CHECKLIST_ID` to join a doc row
against for these 3 specific lines; the a9-transport mechanism doesn't transfer. Fixed the compile break by
rendering them **blank/untick** (graceful — never invents a source) instead of guessing a join, and left a
code comment flagging the gap. **This is a genuine open question, not a decided fix** — see Questions below.
- `attorneyIdCardNo` (the card *number*, not date) is unaffected — still reads `BUYER.ATTORNEY_ID_CARD_NO` (kept column).

### Verify (DB-free)
- test-compile SUCCESS (52/52 jrxml); all 5 PreviewTests render (a6=3pg/a9-d=4pg/a9-t=5pg/a14=4pg/a15=5pg);
  clean compile + boot :33107 **Started** clean (JPA/Hibernate accepts the re-mapped entity — no
  `PropertyNotFoundException`/mapping error at startup, which is as close as I can get to proving column
  existence without touching the real DB, per rule #4). Full `clean package`: BUILD SUCCESS, 5/5 tests.
- **Cannot verify DB-free:** that the ORA-00904 is actually gone (needs the real `T_T_REQUEST_BUYER`/
  `T_T_REQUEST_DOC` on 10.32.2.50) — that's QA's leg.

### DATA REQUEST reminder (unresolved, per the task)
DOCUMENT_NO vs DOCUMENT_NAME_OTHER for "เลขที่" — wired DOCUMENT_NO as primary per the task's own instruction
("Jason may wire DOCUMENT_NO as primary and flag the fallback"); still needs QA confirmation on a populated
a9-transport/a14 sample. Not treated as resolved.

## Questions
> **Q (a14 item-12(3)/(5)/(7) — มอบอำนาจ/บัตรผู้รับมอบ/ขอซื้อ):** these have no master CHECKLIST_CODE in
> ReqSaleInt (per Porter's own table), so I could not repoint them to a doc-row-by-code lookup the way
> a9-transport's equivalent lines were fixed. Rendered blank/untick (graceful) for now. Is there a different
> a14-specific correlation (e.g. a DOCUMENT_ID constant, like a6/a9's person docs use 102/103) that should
> source these three lines, or do they stay blank by design until a14 gets its own master rows for them?

@Sober: ready for review — a9-base (transport+a15) fully repointed per spec; a14's 3 own-table lines flagged
rather than guessed (genuine gap in the spec's coverage, not an oversight). DB-free green throughout.
