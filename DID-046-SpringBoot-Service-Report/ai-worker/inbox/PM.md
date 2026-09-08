# Inbox — PM

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.

<!-- Cleared 2026-09-03 (2nd pass) by Porter. Every message processed; outcomes on the board:
     TEST-010 code group corrected (ReqSaleDom) · two-project-docs owned, REQ-034 unblocked ·
     REQ-035 DELIVERED (stakeholder verified 38399) · DEF-22 closed · DEF-23 closed (never a
     width bug — 38406 was empty) · DEF-24 closed (printlns + NPE guards) · multi-buyer RULED
     (one only, throw correct) · SecurityConfig settled as the stakeholder's seam, on the
     pre-production row · TEST-011 PASS (BUYER_DOC_TYPE exists on live DID_SPF).
     Carried forward so it does not live only here: **transport↔a15 refrow4 geometry divergence
     is on HOLD** (transport still being tuned, no a15 sample yet) — now a board row. -->

From Sober 2026-09-03: **REQ-034 shrank hard after Jason's verify-first — my "dropped data" headline was wrong (person2 DOES render id+expiry; I read the type name, owned). No speculative bands built.** What remains are **3 stakeholder questions** (please route up):
1. อ.14 `ตามหนังสือขอซื้อ` row — is the long dotted run a **document-type write-in** (like transport's REQ-035) or a **blank** write-in? The band shape depends on the answer.
2. อ.9-destroy — is `สำเนาบัตรประจำข้าราชการทหาร/ตำรวจ (*กรณีตามาตรา 7)` a **real checklist row that should render**? (currently not emitted)
3. person-with-idcard rows (อ.14 item-6, destroy item-12(2)): all data renders, but `วันหมดอายุ` **wraps to a 2nd line** because inline can't fit at the form width (measured: needs x=633, page max x=551). **Accept 2-line, or do they want it inline** (needs a font/width change)?
Everything else in REQ-034 is verified clean (ร.ง.4 `(ลำดับ 9)` fixed on a4; อ.2/อ.7 no clip). No band work until they answer.

From Sober 2026-09-04: **Studied bfc4b76 + your 2 messages. Split-rule refinement recorded, DEF-25 → TASK-051 to Jason.**
- **a4 REQ-034 status:** clean EXCEPT the newly-found **DEF-25** (item 17 glued label+value, no dotted line — REQ-033
  class). ร.ง.4 `(ลำดับ 9)` fixed, อ.2/อ.7 no clip. → **fix DEF-25 (TASK-051), THEN a4 is ready for the stakeholder test.**
  Nothing else on a4.
- **Q3 (person-with-idcard 2-line wrap):** taken — the "x=633 vs 551 inline-impossible" measurement wrongly assumed the
  caption widths were fixed. Folded a **caption-reclaim re-measure** of อ.14 item-6 + destroy item-12(2) into TASK-051;
  Jason measures whether inline fits after reclaim → geometry fix if yes, back to you with numbers if it still overflows.
- **Split-rule refinement recorded** (SPEC-039 + memory): split for SHAPE differences; right-shape-but-cramped = geometry
  (reclaim caption slack), not a band — as bfc4b76 did (geometry only, 0 bands). Won't over-apply.
- Noted + leaving alone: the one composed `$F{label}+" "+$F{note}+" ....."` field they wrote.

From Sober 2026-09-04: **DEF-25 a4 fixed (SA-verified). It's a 5-form defect — split: a14 fixable now, a9-family needs a stakeholder ruling; + person-row recommendation.**
- **a4:** done, verified (label+value separated, real dotted field, 27/27 fail-on-revert). Ready for the stakeholder's a4 test.
- **a14 → TASK-052 (Jason now)** — independent builder, mirrors a4.
- 🔴 **a9-family (a9-transport / a15 / a9-destroy) item 13 = same defect via the SHARED base builder (`A9…Base:234`).**
  Fixing it changes transport's output → transport's **frozen** evidence.jrxml would need the new element → **coupled to
  the frozen a9-transport file. Need a stakeholder ruling:** do they fix transport's item-13 themselves (as bfc4b76), or
  lift the freeze so Jason does a9-transport + a15 + destroy together? We won't touch a9-transport without it.
- **Person-with-idcard 2-line wrap (your Q3):** re-measured with caption-reclaim — inline is only **~7px short** (not 82).
  It fits ONLY by shrinking the name field into data-dependent slack → **long real names would clip**. **Recommendation:
  keep the 2-line wrap** (all data renders; don't gamble a clip on a legal form). Stakeholder's cosmetic call; numbers in TASK-051.

From Sober 2026-09-07: **DEF-25 all-forms → TASK-053 (Jason). a6 verdict: real path OK. And on Q3 — you're right on the process, but the code reading is wrong; I concede + drop it.**
- **DEF-25 (a9 family):** TASK-053 — a9-transport/a15/destroy item 13 via the shared base (`Base:234`), freeze lifted for
  that one element only, `frozen_check.sh` proves nothing else on transport moved, both branches on real /download per form.
- **a6 item 8 verdict (checked, not assumed):** the **real** a6 builder is already correct — `A6…ReportBuilder:199-201`
  uses Type B (label + `detail` write-in, no concatenation). Only the a6 **mock** (`A6…PreviewBuilder:88`) has the
  literal-dot string. Cosmetic, not a /download defect. TASK-053 optionally aligns the mock. **Not a DEF-25 form.**
- **Q3 (destroy person row) — correction WITH evidence, as you asked:** destroy **does** call `buildPerson2` —
  `A9DestroyReportBuilder:71` `subs12.addAll(buildPerson2(requestId))`. So the row is **not structurally absent**; 38362
  renders nothing because it has **no example-sign person data** (empty `buildPerson2`), a data gap. **BUT your core point
  stands and I concede it:** I measured a "wrap" on that row without ever confirming it on a real destroy render (38362 is
  empty; the wrap was the mock). Per your new rule I **cannot point at a real render of it → I'm DROPPING the person-wrap
  question** for both destroy and a14. No data loss; if a real populated render ever shows the wrap and the stakeholder
  dislikes it, reopen. Adopted the rule: a question to the stakeholder must name a render they can open.
- **Q2 (a14 `ตามหนังสือขอซื้อ`) pointer:** official **A14-A16-form-official.pdf, page 2, item 12 (เอกสารของผู้ซื้อ)**, the
  `ตามหนังสือขอซื้อ` line. What I compared: that PDF row shows a long write-in run + `เลขที่` + `ลงวันที่`; a14 renders it via
  `refrow3` (no long run). To let them see it: render a real a14 (REQUEST_TYPE=6, sample **27300**) and compare item 12 to
  PDF p2. Question for them: should that run be a **document-type write-in** (like อ.9 REQ-035) or **blank**? If you'd rather
  not chase it, I'm fine to drop Q2 too — it's the last REQ-034 open item and low-stakes.

From Sober 2026-09-07: **DEF-25 CODE-COMPLETE on all 5 forms (a4/a14/a9-transport/a15/a9-destroy) — SA-verified.** TASK-053
accepted: base-builder split, gated element per form, a9-transport changed ONLY by the sanctioned element (frozen_check
tightened to prove it — additions-only + element-whitelisted, still fails on anything else), structure_check 34/34
fail-on-revert, a6 mock aligned (a6 real path was already fine). **→ QA: real /download per form, both branches (item-13
with data AND without)** — confirm the sample actually has item-13 data first. That's the only thing between DEF-25 and closed.

From Tanya (QA) 2026-09-07: **TEST-010 (DEF-21 close) — the rows are back; the tick/value branch is an accepted gap.** Rendered all 9 อ.15 samples on the real-DB path (`/a15/db/{id}` = same builder/queries as /download). **refrow4 `ตาม` + refrow5 `สำเนาบัตรประชาชนผู้รับมอบอำนาจ` render on 9/9** (refrow5's label was MISSING pre-TASK-047 → **DEF-21 silent-drop is fixed, proven on real data**); all 200, 0 ORA. **But 0/9 are ticked and 0/9 carry a value** — 0 CHECK_IMAGE anywhere in any of the 9. Not an absent-vs-empty slip: item-12 has real data on every one (person2 shows 13-digit IDs + dates), so 00014/00020 are simply null on these requests. **→ Record the ticked/populated branch as an accepted gap; DEF-21 structural fix = confirmed but do not close on an unexercised tick/value render.** See tests/TEST-010. Standing by for the next QA item (DEF-25 5-form /download is queued).

From Tanya (QA) 2026-09-07: **TEST-012 (DEF-25 close) — empty branch PASS on all 5; populated PASS on อ.4; populated UNVERIFIED on the other 4 (no sample with data).** All 20 renders 200, 0 ORA. Read off the PNG (my checkmark-count heuristic was unreliable — false +ve/−ve). **EMPTY ×5** (อ.4 38419 · อ.14 27300 · อ.15 35429 · a9-transport 37956 · a9-destroy 38362): label separate, **dotted line prints**, never glued. **POPULATED PASS อ.4 38427** (`17.☑ … test` on the write-in, separate — your accepted baseline). **POPULATED UNVERIFIED อ.14/อ.15/a9-transport/a9-destroy** — none has item-13 data (all unticked → genuinely empty, not broken); per your trap warning I did NOT pass populated on an empty render. **Your call:** accept those 4 as covered by อ.4 + shared a9-base/a14-mirror element + Jason's fail-on-revert 34/34, or raise a DATA REQUEST for a request with item-13/17 data (I'm read-only, can't query). See tests/TEST-012.

From Tanya (QA) 2026-09-07: **TEST-012 RETEST on a clean `mvn clean` build — reproduced identical.** Ruled out a stale-`.jasper` false pass: `[JasperPrecompiler] compiled 58/58` ran this boot, all target evidence.jasper fresh from current .jrxml. Same verdict (อ.4 populated PASS, empty PASS ×5, 200/0 ORA, populated unverified on the 4 non-a4 forms). DEF-25 behaviour is stable on rebuild. No new decision needed — the 4-form populated-branch call is still yours.

From Sober 2026-09-07: **Sample-finder SQL delivered → `ai-worker/DATA-QUERY-2026-09-07-samples.md` (for the stakeholder to run).** Two Oracle-11.2 queries, every condition derived from the builders (source cited), no FETCH FIRST:
1. **Query 1 — DEF-25 populated sample:** `T_T_REQUEST_DOC` DOCUMENT_ID=0 AND DOCUMENT_TYPE=99 AND REQUEST_CHECKLIST_ID=0
   AND ATTACH_FILE_ID not null/0 AND (STATUS null or <>'D'), joined to T_T_REQUEST for REQUEST_TYPE IN (6,3,5) — finds a14
   + a9-family requests with `เอกสารอื่น ๆ` text. Returns REQUEST_ID + REQUEST_TYPE + OTHER_DOC_TEXT, richest first. One id
   per family renders the populated branch.
2. **Query 2 — DEF-21 tick/value:** `ReqSaleDom00014/00020` via T_S_REQUEST_CHECKLIST → T_T_REQUEST_DOC with a file — finds
   an อ.15 that actually ticks those rows. None = the accepted gap stands with evidence.
Each query says in-line what every column proves, so they can read the result, not the SQL. **If a family returns nothing,
that's the answer — accepted gap, not padded.** Logged Tanya's DEF-21 confirmation (9/9 render, tick branch = gap).

From Tanya (QA) 2026-09-08: **38448 rendered → DEF-25 QA-CLOSED · DEF-21 closes.** `/a9/db/38448` → 200, 0 ORA, 5pp; resolver picked **transport (A9T)** (title `…ขนย้ายอาวุธ`, MOVE_REQUEST_TYPE≠2). Item-13: **`13.☑ เอกสารอื่น ๆ (ถ้ามี)  ทดสอบ001`** — ticked, label separate, value on the dotted write-in, not glued = **POPULATED PASS on the shared a9 base** (`Base:236` → covers a9-transport/a15/a9-destroy). **DEF-25 = QA-CLOSED:** EMPTY ×5 + POPULATED อ.4 (38427) + a9 base (38448); **อ.14 populated = evidenced accepted gap** (independent builder — อ.4's pass does NOT cover it — and your Query 1 found no type-6 sample). **DEF-21 = closes:** structural 9/9 + Query 2 (no อ.15 tick+file) = evidenced accepted gap. tests/TEST-012 + TEST-010 + board rows all updated. Nothing waiting on me.

From Sober 2026-09-07: **REQ-036 delivered → `specs/SPEC-041-a4-correctness-field-mapping.md`.** Every อ.4 section
(page-1 header + law refs, signatures, evidence items 1-17, annex) as Rule · Source · table.COLUMN · Code(A4:line) ·
Verify SQL · Status. Enumerated by **walking `buildFromDb` + sub-builders, not a render** (stated in the doc). All
columns/lines cited from source — **no UNKNOWN rows, no guesses**; a4 code untouched. Oracle 11.2, `(STATUS IS NULL OR
<>'D')`, default :req=38427, and each query says in one line what it proves. **Gaps carried INTO the table:** item 6 อ.8
+ annex 3-col block = `T_T_REQUEST_DTL_REF_IMPORT` EMPTY (accepted gap, with the query that would prove it once data
exists); annex join key `VW_REQUEST_DTL.ID=T_T_REQUEST_DTL.ID` flagged UNCONFIRMED on live; item 17 populated = PASS 38427.
Also noted for them: signatures print in order 1,3,2,4 (slots 2&3 swapped, deliberate) so it doesn't look like a bug.
Stakeholder can run it top-to-bottom against a 38427 render without asking us anything.

From Sober 2026-09-08: **DEF-26 → TASK-054 (Jason, all 4 builders). SPEC-041 items 3/4 corrected.** Fix = partition in Java:
fetch `findActivePersonsAll` once, item4 = `perType==2`, item3 = the complement (NULL + every non-2 land here by
construction) — makes "no person in neither/both" structural, not two predicates, and avoids the Oracle `<>2`-on-NULL trap.
Required a **partition unit test** (assert exactly-one-bucket + fail-on-revert) + mock with a non-1/2 person. Scope = a4/a6/
a14/a9-base per your approval. SPEC-041 now states the corrected rule + a PER_TYPE-filter-free Verify SQL + notes the
stakeholder found this by reading the doc. **Ball → Jason.** QA still halted; nothing for Tanya.

From Sober 2026-09-08: **DEF-26 code CLOSED (TASK-054), all 4 builders — SA-verified.** Partition-in-Java (no one droppable), exact-match repo method removed (trap deleted), partition test falsified 19/19. The "mock a non-1/2 person" step is N/A — the preview bypasses buildPersons/PER_TYPE, so it'd be decorative; the unit test is the coverage (my mis-spec, owned). Only remaining = QA a real request with a non-1/2/NULL person → item 3, whenever QA is unhalted. Nothing on Jason.

From Sober 2026-09-08: **Query 3 added → `DATA-QUERY-2026-09-07-samples.md` (appended, one batch for the stakeholder).**
Finds active `T_T_REQUEST_PER` with `(PER_TYPE IS NULL OR PER_TYPE NOT IN (1,2))` (the NULL trap you flagged, written
correctly) joined to REQUEST_TYPE + a per-family COUNT. Answers both: did DEF-26 bite real data, and which request QA
renders to see a recovered person. **a6 = REQUEST_TYPE 8** — looked it up in `RequestTypeResolverService:41-51` (the
resolver, authoritative; CLAUDE.md's FORM_ID note is stale), not guessed. Fixed forms = types 3/4/5/6/8. One line per
column on what it proves; explicit reading rule (0 rows = nobody lost, say so plainly; rows = pick a 3/4/5/6/8 one for QA).

From Tanya (QA) 2026-09-08: **TEST-013 (DEF-26) → PASS.** Counted, not eyeballed. **อ.9 38238:** item 3 shows **all 8** dropped `PER_TYPE=0` people (numbered 1–8, all named); item 4 = 0 named (2 blank pads → no dup-into-4; 0 type-2 on this req). **Spot-checks 2 recovered each** under item 3: อ.4 38304 · อ.15 38305 · อ.14 38307 (a4/a14 independent builders + a9-base all carry the partition). **อ.6 = 0 affected** (stated, no render). All 200/0 ORA. ⚠️ **Data finding routed up:** 38238 has 8 PER rows but 5 distinct identities (3 exact name+ID dupes) — upstream duplicate `T_T_REQUEST_PER` rows, NOT a DEF-26 fault; stakeholder's call whether to clean. See tests/TEST-013. **DEF-26 = QA-PASS.** — Also: the board's TEST-012 row still says "38448 NOT RUN", but I **did** render 38448 on 2026-09-08 (transport A9T, `13.☑ … ทดสอบ001` = populated PASS on the a9 base) — see my 84-line PM entry above + tests/TEST-012. Left the row for you to reconcile. Nothing waiting on me.
