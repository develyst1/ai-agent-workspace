# TEST-008: REQ-029 อ.4–อ.8 import checklist (a4)

- Source: REQ-029 / SPEC-034 / TASK-034
- Status: column-safety + structure PASS; **DEF-19 (annex heading) blocks close**; real-data leg needs a REQUEST_TYPE=4 sample
- Environment: own clean build, `:33017`, dev, UAT-wired (DID_SPF), read-only
- Tested: 2026-08-31 by Tanya

## What I could verify without a real อ.4 id
No REQUEST_TYPE=4 sample id was provided. But `/a4/db/{id}` calls the a4 builder **directly**, so I ran it
with a known id (38272) to exercise the new import queries, and used the mock `/checklist/a4` for labels.

| # | Check | Result |
|---|-------|--------|
| 1 | **DEF-17 column-safety** — a4 builder's `T_T_REQUEST_DTL_REF_IMPORT` / import queries valid on live DID_SPF | `/a4/db/38272` → **200, 0 ORA-00904** (0 ORA any-code). The new entity columns + the join exist on the app's own connection — **no invented-column 500** (the DEF-16/17 class is clear). ✅ |
| 2 | Page-1 structure: 7 items, **ระยะเวลา = item 6** (not 7), no buyer item | mock a4: heading `…สั่งหรือนำเข้ามาในราชอาณาจักรซึ่งอาวุธ`, items 1–7, **item 6 = ระยะเวลาการอนุญาต** ✅ |
| 3 | Annex has the 3 extra อ.8 columns | annex cols = ลำดับ·รหัส·รายการ·จำนวน + **เลขที่หนังสืออนุญาต อ.8 ฉบับเดิม · วันที่ออกเอกสาร · วันที่หมดอายุ** ✅ |
| 4 | Renders clean | 4 pages, **0 literal null**, .jasper loads (REQ-031 precompile) ✅ |
| 5 | **Annex heading verbatim vs official** | ❌ **DEF-19** — see below |

## DEF-19 — a4 annex heading is the a14-clone's, not the official อ.4 wording — label defect
- Our render: `แบบบัญชีรายการ วัตถุ/อาวุธที่ขออนุญาต**ขายและขนย้ายอาวุธ**`
- Official `A4-A8-form-official.pdf`: `แบบบัญชีรายการ วัตถุ/อาวุธที่ขออนุญาต**สั่งหรือนำเข้ามาในราชอาณาจักร**`
- It's a **static label** in the annex/component `.jrxml` left over from cloning a14 — so it's wrong on the
  real report too, not just the mock. Sober's verbatim-label fix covered the evidence items (5(4)/12–17)
  but not the annex subreport title. Violates the "labels verbatim, the form wins" rule.
- QA can't fix (boundary). Route to Sober → Jason.

## Not yet verified — needs a real REQUEST_TYPE=4 request (DATA REQUEST → Porter)
The mock/known-id runs prove the plumbing (columns, structure, .jasper). They do **not** prove real
content, which Porter's handoff explicitly asks for:
- item-6 §4 (อ.8 ฉบับเดิม own-table) populated from real `T_T_REQUEST_DTL_REF_IMPORT` rows;
- annex's 3 อ.8 columns carrying real `LICENSE_NO / ISSUE_DATE / EXPIRY_DATE`;
- item-6 §4 ticks; the 17 evidence labels/ticks against the official form on real data;
- the `firstOrNull` latest-by-ISSUE_DATE 1:N annex rule on a request that actually has >1 ref row.
**Need one real REQUEST_TYPE=4 sample id** (plain, for `/a4/db`) to run these.

## Verdict (initial)
REQ-029 is **not closeable yet**: (1) fix **DEF-19** (annex heading), and (2) provide a REQUEST_TYPE=4
sample id so I can verify the real import content. The high-risk DEF-17 column-safety leg already **passes**.

---

## Re-verify on real data — 38427 (REQUEST_TYPE=4, 17 docs) — 2026-08-31
Porter gave 38427 (richest อ.4 sample); DEF-19 fix landed (TASK-042). `/a4/db/38427` → 200, 4 pages, **0 literal null**.

- **DEF-19 → QA-CONFIRMED FIXED on real data.** Both a14-clone strings are gone: annex heading now
  `แบบบัญชีรายการ…สั่งหรือนำเข้ามาในราชอาณาจักร` and the page-2 evidence heading now
  `เอกสารหลักฐาน…สั่งหรือนำเข้ามาในราชอาณาจักร`. `"ขายและขนย้ายอาวุธ"` no longer appears. ✅
- **Evidence page (17 items) PASS:** all 17 items render; real ticks land per 38427's docs (1/2/5-ร.ง.4/7/8/9/
  10/11/12/13/14/17 ticked); item 3 person is real (name + national-ID + expiry, both columns ticked);
  **item 6 = สำเนาหนังสืออนุญาต แบบ อ.8 ฉบับเดิม with (1)(2) min-2 slots**; Sober's verbatim labels (5(4)/13/14)
  present. ✅
- **Structure:** ระยะเวลา = item 6; heading import wording; annex 3 อ.8 columns present. ✅

**⚠️ One gap — the annex 3-col / §4 real VALUES could not be exercised.** 38427 has 17 evidence docs but
**no รายการ/annex rows and no อ.8-ref rows** (annex table renders header-only; item-6 §4 slots blank). So:
- the annex's 3 อ.8 columns (`LICENSE_NO/ISSUE_DATE/EXPIRY_DATE`) and item-6 §4 never render a real value here;
- the **1:N `firstOrNull` latest-by-ISSUE_DATE** rule isn't exercised on real data.
- Empty annex on a no-detail request is an accepted steady state, and the 1:N rule is unit-tested
  (`A4CheckListReportBuilderTest`, 0/1/>1, SA-verified) — so this is covered at the code level, just **not
  seen on a real render.** To see it, I'd need a REQUEST_TYPE=4 request that actually **has** annex +
  `T_T_REQUEST_DTL_REF_IMPORT` rows (38427 does not).

## Final verdict
- **DEF-19 → QA-CONFIRMED FIXED.** **DEF-17 column-safety, structure, 17 evidence items + real ticks,
  labels → PASS** on 38427.
- **REQ-029 close is a Porter call:** either (a) accept — the annex 3-col/§4 real-value render is covered by
  the unit test + column-safety + structure, and no available sample has ref-import rows; or (b) supply a
  REQUEST_TYPE=4 id that has annex/`REF_IMPORT` rows for a full real-data render. I won't claim I *saw* the
  3-col values render when 38427 had none.
