# REQ-034 step-1 — อ.14 (ReqSaleInt) special-row list, derived from A14-A16-form-official.pdf

Method: read the official PDF's item-12 (เอกสารของผู้ซื้อ) row shapes and compare each to the row-type
`A14CheckListReportBuilder` currently assigns. A "special row" = a row whose official shape the assigned shared band
cannot express. **These are shape-comparisons (PDF label/segment structure vs builder row-type), NOT width
measurements** — any "clips / too narrow" must be proven by a render before acting ([[relayed-numbers-are-claims-not-facts]]).
Source of truth for the shapes: PDF p2–p3 (extracted text below the table). a14 evidenceSub currently has 11 row types
(no `refrow4`/`refrow5` — those are transport-only).

## Official อ.14 item-12 rows (verbatim labels) vs current builder row-type
| # | official row (label + write-in segments) | current a14 row-type | verdict |
|---|---|---|---|
| 1 | สำเนาหนังสือรับรองการจดทะเบียนเป็นนิติบุคคลของบริษัทผู้ซื้อ (…ไม่เกิน 6 ปี) | employer | OK (simple) |
| 2 | หลักฐานการขอซื้ออาวุธที่ได้รับความเห็นชอบแล้วจากเจ้าหน้าที่รัฐบาลของประเทศผู้ซื้อ | employer | OK |
| 3 | หนังสือมอบอำนาจ (กรณีผู้ซื้อมอบอำนาจให้ผู้อื่นดำเนินการแทน) · ลงวันที่ [date] | refrow1 | OK (label+1 seg) |
| 4 | หนังสือรับรองผู้ใช้ปลายทาง (END-USER CERTIFICATE) | employer | OK |
| 5 | สำเนาบัตรประชาชนผู้รับมอบอำนาจ · เลขที่ [id] · วันหมดอายุ [date] | refrow3 | **CANDIDATE** — verify refrow3 renders the long label + both segments without clip (transport gave this its own `refrow5`) |
| 6 | ตัวอย่างลายมือชื่อผู้รับอาวุธ (header) then per person: **(n) [name] สำเนาบัตรประชาชน เลขที่ [id] วันหมดอายุ [date]** (inline, one line) | `employer` header + **`person2`** per person | 🔴 **SPECIAL** — `person2` renders only `(n) name`; the official row also carries `สำเนาบัตรประชาชน + เลขที่ + วันหมดอายุ` inline. Those are DROPPED. Needs a dedicated band (person + inline id-card/expiry). |
| 7 | ตามหนังสือขอซื้อ · [long gap] · เลขที่ [x/xxxx] · ลงวันที่ [date] | refrow3 | 🟠 **SPECIAL** — official has the `label → long run → เลขที่ → ลงวันที่` shape (transport's `refrow4` family); refrow3 has no long run. a14 gets its OWN band derived from a14's PDF — **do NOT paste transport's refrow4** (transport's now carries the REQ-035 doc-type write-in + label `ตาม`; a14's official label is the full `ตามหนังสือขอซื้อ`). **Stakeholder Q:** is a14's long run also a doc-type write-in, or blank? |
| 8 | ภาพถ่ายสนามยิงปืนและช่องยิงปืน ฯ | employer | OK |
| 9–12 | ป.3 / ป.5 / ย้ายวัตถุระเบิด / ควบคุมยุทธภัณฑ์ — each with (1)(2) **ที่ [x/xxxx] ลง [date]** | refrownum | OK (numbered ref pairs) |

## อ.14 special rows to hand Jason (dedicated band per, own geometry vs a14's PDF)
1. **Row 6 person-with-idcard** (🔴 highest — data is currently dropped, not just mis-laid): a band for
   `(n) [name]  สำเนาบัตรประชาชน  เลขที่ [id]  วันหมดอายุ [date]`. Confirm the id/expiry source in the a14 builder's
   person loop before Jason builds (person2 loop at ~line 273 currently emits name only).
2. **Row 7 ตามหนังสือขอซื้อ** (🟠): a14-own band, `label → run → เลขที่ → ลงวันที่`. Resolve the stakeholder Q first.
3. **Row 5 บัตรผู้รับมอบอำนาจ** (candidate): verify on a render whether refrow3 clips the long label; if so, dedicated band.

## Not yet done (this doc = อ.14 only)
- อ.4 (A4-A8-form-official.pdf) and อ.9-destroy (A9-form-DESTROY-official.pdf) special-row lists — next.
- Verification for each is on a **real /download**, structural gate that fails-on-revert, then stakeholder eye.
- Blocked-adjacent: REQ-035 gates (BUYER_DOC_TYPE QA smoke, multi-buyer) don't block this derivation.

---
## ⚠️ CORRECTION 2026-09-03 (Sober) — the person-with-idcard "drop" was WRONG
Jason verified all 3 layers: `buildPerson2` passes `nz(getIdCardNo())` + expiry, the `person2` **band renders
`เลขที่`+`วันหมดอายุ` (detail/detail2)**, and both renders show them. **Nothing is dropped.** My "person2 = name only"
was read off the type name + first builder args, never the band — an assume-from-name error. The ONLY delta vs the
official is `วันหมดอายุ` **wraps to line 2** instead of inline, and inline is **physically impossible** at this
font/width with real data (Jason measured: needs x=633, page max x=551). → **NOT a new band.** It's a cosmetic
2-line-vs-inline call for the stakeholder. Item 1 above is retracted.
