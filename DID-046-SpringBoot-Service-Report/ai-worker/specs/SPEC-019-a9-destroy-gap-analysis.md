# SPEC-019: อ.9 DESTROY variant — gap analysis vs the official form (answers "is it done?")

- Source: REQ-019 (step 1 = this gap analysis; step 2 = build the TRANSPORT variant, separate)
- Status: ACTIVE
- Refs: `project-docs/A9-form-DESTROY-official.pdf` (4 pages) vs the current `/a9/db/{id}` build.

## Verdict (short)
**The DESTROY form is structurally COMPLETE and ~70% wired — but NOT verifiably done yet**, for two
reasons: (1) four page-1/signature field wirings are still pending the DEF-4 emitted-JSON diagnostic
(+ likely small DATA REQUESTs), and (2) **our only sample 18847 is `MOVE_REQUEST_TYPE = 0` (TRANSPORT)**,
so it can't truly prove the destroy form — we need a real destroy-type (`= 2`) sample id.

## Page-by-page gap (official DESTROY vs current build)
### Page 1 — applicant + law refs
| Official item | Current source | Status |
|---|---|---|
| 1 ชื่อผู้ขอ / บริษัท | `T_T_REQUEST.TRADER_NAME` | ⚠️ **pending** — QA saw blank on 18847; TRADER_NAME likely null for อ.9 → need real name source (DATA REQUEST) |
| 2 ประเภท = "ขนย้ายเพื่อทำลาย" | `moveRequestTypeLabel(MOVE_REQUEST_TYPE)` | ✅ logic correct. On 18847 it prints the **type-0 transport** label — **sample mismatch, not a bug**; a type-2 request → "ขนย้ายเพื่อทำลาย" |
| 3 วัตถุ/อาวุธ ตามผนวกบัญชีรายการที่แนบ | — (a9 `Applicant` has no item-3 field) | ⚠️ **verify** — official has item 3 (static "ตามผนวก…"); confirm the a9 template prints it statically, else it's MISSING |
| 4 จำนวน (รายการ) | `COUNT(T_T_REQUEST_DTL)` | ✅ works (QA: "1 รายการ") |
| 5 สถานที่ทำการกำจัด/ทำลาย | `MOVE.DEST_PLACE_NAME` | ⚠️ **pending** — QA saw blank though DEST_PLACE_NAME exists → confirm `move` loads (DEF-4 JSON). For destroy, DEST_PLACE_NAME = the destroy site ✅ |
| 6 วัตถุประสงค์ | `T_T_REQUEST.OBJECTIVE` | ✅ works |
| law references (checked list) | `T_T_REQUEST_LAW_REF` (+ human fixed the display/margins) | ⚠️ **pending** — was empty; human edited the lawRef jrxml — QA to confirm it now lists the 6 checked rows |

### Pages 2–3 — evidence (13 items) + 4 signatures
- **Labels: ✅ render already** — the 13 item labels + item-12 (1)/(3)–(9) sub-labels are **fixed in the
  builder**, so the layout is reviewable now even before seeding (satisfies the human's "mock page-2 for
  layout" ask). Items 3/4 persons from `T_T_REQUEST_PER`; item 12(2) person2 from `T_T_REQUEST_EXAMPLE_SIGN`.
- **Ticks + dates: pending the data team seeding `GROUP_CODE='ReqMove'`** + backfilling
  `REQUEST_CHECKLIST_ID` (graceful: unticked/blank until then — expected, not a defect).
- **Signatures: ⚠️ pending** — built from `T_T_LICENSE_INFORM` by `REFERENCE_NO`, but 18847's
  `REFERENCE_NO="MV000407"` (a MOVE ref) → confirm the join returns signers for อ.9 (DEF-4 JSON), else empty.

### Page 4 — annex table
| รหัส / รายการ / จำนวน | `T_T_REQUEST_DTL` + `T_M_UNIT` | ✅ works (reuse a6) |

## What's DONE vs PENDING (destroy)
- **Done:** all 4 pages/layout; item 2 (type map), 4, 6; evidence labels; annex; graceful degradation.
- **Pending (in flight as DEF-4 — QA emitted-JSON + then DATA REQUESTs I'll raise):** item 1 name source,
  item 5 destroyLocation (confirm move loads), law-ref population, signatures (MV-ref join). Plus **verify
  item 3** static renders.
- **Blocked on human/data team:** a real `MOVE_REQUEST_TYPE=2` sample id (to actually verify the destroy
  form — 18847 is transport); the `ReqMove` master seeding (to light evidence ticks).

## Recommendation to Porter (answer to the human)
"The destroy อ.9 **layout is done and it already matches the official form**; the remaining work is
**field wiring on page 1 + signatures** (4 items, being diagnosed now via the DEF-4 emitted-JSON check),
and it **can't be fully confirmed on 18847 because that request is a *transport* (type 0), not a
*destroy* (type 2)** — please give us one **destroy-type sample id**. Evidence ticks await the data
team seeding `ReqMove`. Once those land, the destroy variant is complete."
→ **Do NOT start the TRANSPORT variant build yet** — finish + verify destroy first (the DEF-4 wirings +
a type-2 sample). Transport is REQ-019 step 2.

## Tasks
- None new here — the destroy wirings continue under TASK-008/DEF-4 (QA JSON → my DATA REQUESTs → Jason).
  Transport variant = a later TASK once destroy is signed off.

## Questions
- **@Porter → human:** (1) a real **MOVE_REQUEST_TYPE=2 (destroy)** sample requestId; (2) is the applicant
  **name** meant to come from TRADER_NAME or elsewhere for อ.9 (ties to DEF-4 item 1). These unblock the
  destroy sign-off.

---

# DESTROY completeness AUDIT (2026-08-05) — field-by-field, honest evidence levels
Evidence: **RUNTIME(id)** seen in real output on that sample · **RUNTIME(mock)** seen in the mock
preview PDF · **CODE-ONLY** believed from code, never observed · **ASSUMED** source/rule inferred,
nothing confirms it. (SA has never queried the DB; QA saw only what's noted on 18847 — a *transport* id.)

## Page 1 — heading, applicant 1–6, law refs
| Element | Source | Wired? | Evidence |
|---|---|---|---|
| Page-1 heading | `$F{documentTitle}` = ReportDefinition.A9 = "…**ขายและขนย้าย**อาวุธ" | yes | RUNTIME(mock) — **MISMATCH**: official destroy p.1 = "…ขนย้ายอาวุธ" (no "ขาย") ⚠️ |
| 1 ชื่อผู้ขอ/บริษัท | `T_T_REQUEST.TRADER_NAME` | yes | **RUNTIME(18847)=FAILED (template binding)** — value IS in JSON; item-1 textField overlaps its label → DEF-4a/TASK-010 ⚠️ |
| 2 ประเภท (="ขนย้ายเพื่อทำลาย") | `moveRequestTypeLabel(MOVE_REQUEST_TYPE)` | yes | RUNTIME(18847) shows **type-0 transport** label; destroy label never seen (need type 2) — CODE-ONLY for destroy |
| 3 วัตถุ/อาวุธ ตามผนวก… | **static text** in main jrxml (line 62) | yes | RUNTIME(mock) ✅ |
| 4 จำนวน (รายการ) | `COUNT(T_T_REQUEST_DTL)` | yes | RUNTIME(18847) "1 รายการ" ✅ |
| 5 สถานที่กำจัด/ทำลาย | `MOVE.DEST_PLACE_NAME` | yes | **RUNTIME(18847)=FAILED (template binding)** — value IS in JSON; item-5 textField overlaps its label → DEF-4a/TASK-010 ⚠️ |
| 6 วัตถุประสงค์ | `T_T_REQUEST.OBJECTIVE` | yes | RUNTIME(18847) ✅ |
| law-reference list | `T_T_REQUEST_LAW_REF` (human fixed display) | yes | **RUNTIME(18847)=RENDERS (9 items)** ✅ — DEF-4b CLOSED |

## Pages 2–3 — evidence 1–13 (+ 12(1)–(9)) + signatures
| Element | Source | Wired? | Evidence |
|---|---|---|---|
| Page-2 heading | static "…ขายและขนย้ายอาวุธ" (line 142) | yes | RUNTIME(mock) ✅ matches official p.2 |
| Item labels 1–13 (+12 subs) | **hardcoded in builder** | yes | RUNTIME(mock) ✅ (render before seeding) |
| Ticks (items 1,2,5,6–11, 12(1),(3)–(9)) | master `T_S_REQUEST_CHECKLIST 'ReqMove'` by SEQ idx + `T_T_REQUEST_DOC.REQUEST_CHECKLIST_ID` + REQ-009 attach | yes | **CODE-ONLY** — master unseeded → all false now (graceful); SEQ→item order ASSUMED (SPEC-016) ⚠️ |
| Items 3/4 persons | `T_T_REQUEST_PER` PER_TYPE 1/2 (NULL-safe) | yes | CODE-ONLY (a6-proven pattern) |
| Item 12(1) **date value** (วัน/เดือน/ปี ที่จะทำลาย) | `MOVE.WRITE_OFF_DESTROY_DATE` | **NO — label+tick only, value NOT wired** | needs code ⚠️ |
| Item 12(2) person2 (ผู้รับอาวุธ) | `T_T_REQUEST_EXAMPLE_SIGN` (tick via ATTACH_FILE_ID) | yes | CODE-ONLY; linkage/type ASSUMED ⚠️ |
| Item 13 เอกสารอื่น ๆ | DOCUMENT_ID=0/TYPE=99 (REQ-011 pattern) | yes | CODE-ONLY |
| 4 signature blocks | `T_T_LICENSE_INFORM` by `REFERENCE_NO` | yes | 18847 REFERENCE_NO="MV000407" (MOVE ref) → join for a9 ASSUMED; not confirmed ⚠️ |

## Page 4 — annex
| แบบบัญชีรายการ (heading + rows) | heading static; rows `T_T_REQUEST_DTL`+`T_M_UNIT` | yes | CODE-ONLY (a6-proven) |

## Buckets — everything not finished
**1. Needs code (do now):**
- Wire item 12(1) date value = `MOVE.WRITE_OFF_DESTROY_DATE`.
- Page-1 heading: destroy needs "…ขนย้ายอาวุธ" (no "ขาย") — but this ties to the two-variant split (REQ-019 step 2); decide whether the heading is variant-driven before changing documentTitle.

**2. Needs the data team (ReqMove seeding):** all page-2/3 evidence **ticks + issue/expiry dates**
(items 1,2,5,6–11,12(1),(3)–(9)) — seed `GROUP_CODE='ReqMove'` + backfill `T_T_REQUEST_DOC.REQUEST_CHECKLIST_ID`.

**3. Needs a real DESTROY request (MOVE_REQUEST_TYPE=2, MOVE_STATUS ≥ 18):** runtime confirmation of
item 2 (destroy label), item 5 (destroy-site), signatures, person2, and the whole destroy render. 18847
(transport, type 0) cannot prove these.

**4. ⚠️ ASSUMPTIONS THAT COULD BE WRONG — what would confirm each:**
| Assumption | Confirm with |
|---|---|
| item 1 name = `TRADER_NAME` (blank on 18847) | DEF-4 emitted-JSON (is applicant.name null?) + business: real applicant-name source for อ.9 |
| item 5 destroyLocation = `DEST_PLACE_NAME` for a *destroy* case | business answer: for type-2, is the destroy site `DEST_PLACE_NAME` or another MOVE col? + a type-2 sample |
| ~~item 7 duration = MOVE.START_DATE/END_DATE~~ **CONFIRMED RUNTIME(18847)** = "01/12/2562 ถึง 31/03/2563" ✅ | (resolved) |
| item 12(1) date = `WRITE_OFF_DESTROY_DATE` | dictionary/business: is that the "วันที่จะทำลาย" the form wants? |
| signatures join `T_T_LICENSE_INFORM` by `REFERENCE_NO`="MV…" | query: do LICENSE_INFORM rows exist for a MOVE REFERENCE_NO? (DEF-4 JSON shows empty/not) |
| lawRef linkage `findByRequestIdOrderByIdAsc` for อ.9 | DEF-4 JSON (is lawReferences empty?) + how the 6 IS_CHECKED rows attach |
| person2 = `T_T_REQUEST_EXAMPLE_SIGN` + which `EXAMPLE_SIGN_TYPE` renders | a sample with a receiver + render check |
| evidence SEQ→item index (SPEC-016 order) | only verifiable once `ReqMove` is seeded |
| ~~page-1 heading~~ **CORRECTED**: render shows page1="…ขนย้ายอาวุธ", page2="…ขายและขนย้ายอาวุธ" = MATCHES official destroy PDF (they differ by design). No destroy change; transport headings = REQ-019 step 2. |

## Blunt bottom line
Layout is done; **most page-1 real-data fields + all signatures are CODE-ONLY or worse**, and **the two
most load-bearing page-1 fields (name, destroyLocation) are confirmed BLANK on the only sample we have** —
which is itself the wrong variant (transport). So "how correct is it?": **the skeleton is right; almost
nothing on a destroy request has been *seen* working.** We need a type-2 sample + the DEF-4 JSON + a few
business confirmations before calling the destroy variant done.
