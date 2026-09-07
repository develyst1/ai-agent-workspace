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
