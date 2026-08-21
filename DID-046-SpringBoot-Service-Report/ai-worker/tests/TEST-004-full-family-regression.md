# TEST-004: Full-family regression after the resolver collapse

- Assigned: Tanya (QA) by Porter, 2026-08-20
- Status: CONTENT COMPLETE (2026-08-21) — cases 1,2,3,5,6 **CONTENT PASS**; case 4 (อ.7) **CLOSED untestable** (no data exists). **Main-family ROUTING remains unverified read-only → handed to human via /download** (see Results ⚠️)
- Covers: REQ-022, REQ-023, REQ-024, REQ-025, REQ-026, REQ-027, REQ-028, DEF-12

## Why this run matters
We replaced the mechanism that decides **which report a request gets** — it is shared by every form.
We also changed อ.15's item-5 source. Some of these forms have **never** been rendered against real
data (อ.14, อ.15). This is the widest-blast-radius change of the project.

## Before you start
Ask Porter to confirm the service was rebuilt and restarted, otherwise you are testing stale code:
`./mvnw clean compile` → restart with `SPRING_PROFILES_ACTIVE=dev` → port 33000,
context-path `/document-service`.

## Scope reminders (QA boundaries)
- Read-only. GET / report generation only. **Never** run SQL, never write, never production.
- Report to **Porter only**. Do not `@` Sober or Jason.
- If something is unclear or a sample id doesn't exist, ask Porter — do not substitute your own.

## Cases

| # | Form | Sample | Route via | Expected |
|---|---|---|---|---|
| 1 | อ.15 | **18041** | `/download` + `/a15/db` | Routes A15. **ข้อ 5 = `สมาคมกีฬานักยิงปืนสมัครเล่นภูเก็ต`** — if it shows `-`, DEF-12 is NOT fixed. ข้อ 2 = `ขายและขนย้ายให้บุคคลอื่นนอกหน่วยงานตามมาตรา 7` |
| 2 | อ.14 | **27300** | `/download` + `/a14/db` | Routes A14. Heading = …โดยการส่งออกไปนอกราชอาณาจักร. ข้อ 5 = `บริษัท สหการวิศวกร จำกัด`. ข้อ 12 heading = **"เอกสารขอผู้ซื้อ"** (with ขอ, not ของ — verified against the official form, not a typo) |
| 3 | อ.6 | 38272 | `/download` + `/a6/db` | Routes A6, renders as before |
| 4 | **อ.7** | any อ.7 licence | `/download` | **Must also render the อ.6 report.** Highest-risk case — the team could not prove this path from code |
| 5 | อ.9 transport | 38336 or 37956 | `/download` + `/a9/db` | Routes A9 transport |
| 6 | อ.9 destroy | any type-2 | `/download` + `/a9/db` | Routes A9 destroy (4 pages) |

## Must hold on every case
- HTTP 200 and a real PDF — **no 500** (that was DEF-11's symptom)
- No literal `null` anywhere in the text
- Signature block prints its **4 slots**, even with no signers
- ข้อ 7 ระยะเวลา = the `PERIOD_TEXT` string, or **blank** — never a date range

## ⭐ THE MAIN CHECK — every render must match the official form
Stakeholder instruction: *"เอาให้ตรงกับตัวอย่าง"*. Routing and "no 500" are the floor, not the goal.
**Open the official PDF side by side with each render and compare.**

| Form | Official document (in `project-docs/`) |
|---|---|
| อ.9 transport **and อ.15** | `A9-form-TRANSPORT-official.pdf` — **one document serves both** (Porter verified they are textually identical) |
| อ.9 destroy | `A9-form-DESTROY-official.pdf` |
| อ.14 | `A14-A16-form-official.pdf` |
| อ.6 | compare against the delivered อ.6 output (38272) — it is the accepted baseline |

Compare, in this order:
1. **Page-1 heading** — verbatim, and the *right* form's heading (a wrong-but-plausible heading is
   exactly what a routing bug looks like).
2. **Item numbering and order** — every numbered item present, in the form's order, none missing,
   none invented. Watch for an item sitting at the wrong number.
3. **Labels word-for-word**, including the `(1)` / `(2)` sub-rows and the write-in lines.
   The form is the specification: if our text differs from the form, **the form wins** — report it
   even when our wording reads "better".
4. **Page count and page-2/3 headings** — the two อ.9 forms genuinely have different p1/p2 headings;
   that is correct, not a defect.
5. **Annex (last page)** — column headers and order match the form.

Report any mismatch with: the form, the page, the form's text, and our text.

## Expected, NOT bugs — do not raise these
1. **อ.14: no evidence box is ticked.** No อ.14 request in the DB has any attachment at all
   (verified: 0 rows). Blank ticks are the correct steady state.
2. **อ.9: ticks may sit on the wrong line**, and ส.ค.4 / แผนการใช้กระสุน / ภาพถ่ายสนามยิงปืน never
   tick. This is **DEF-13 — cancelled by the stakeholder, won't fix.** Do not re-raise it.
3. **อ.9 request 18847 ข้อ 7 is blank or shows PERIOD_TEXT** (it used to show a date range). Intended
   — DEF-10.
4. **รายการ may show a duplicated word or a trailing `-`** (e.g. `วัตถุระเบิด วัตถุระเบิด … -`).
   That comes from the database view and its owners will fix it — **won't fix by us**.
5. Empty รายการ / empty ข้อ 5 on a request that genuinely has no detail rows.

## Report back to Porter
For each case: route correct? PDF or error? plus anything from the "must hold" list that failed.
Attach or quote the offending text for anything you flag. If everything passes, say so plainly —
that closes eight requirements at once.

---

## Results (2026-08-21, Tanya — read-only, own :33005 dev build of current tree)

### ⚠️ Coverage limitation — ROUTING is NOT proven by this run
The no-auth seams I can reach (`/aN/db/{id}`) call each builder **directly** and **bypass the main
family resolver** — `a6/db`→A6, `a14/db`→A14, `a15/db`→A15 regardless of the request's REQUEST_TYPE.
Only **`/download`** (and, for the a9 destroy/transport branch only, `/a9/db`) exercises
`resolveChecklistRequestType`. `/download` requires a valid `X-API-KEY` + an AES-encrypted id, which QA
does not have. **So these renders verify report CONTENT, not that REQ-028's collapsed resolver routes a
given request to the right FORM.** Routing (the core of REQ-024/REQ-028 and case 4/6) needs either a
`/download` test path (key + a few encrypted ids across families) or SA-review acceptance. Raising to Porter.

### Per-case
| # | Form / id | HTTP | null | 4 sig slots | Key checks | Verdict |
|---|-----------|------|------|-------------|------------|---------|
| 1 | อ.15 / 18041 (`/a15/db`) | 200 pdf (5p) | 0 | ✅ | **ข้อ5 = `สมาคมกีฬานักยิงปืนสมัครเล่นภูเก็ต`** (DEF-12 FIXED, not `-`); ข้อ2 = `ขายและขนย้ายให้บุคคลอื่นนอกหน่วยงานตามมาตรา 7`; ข้อ7 blank | **CONTENT PASS** |
| 2 | อ.14 / 27300 (`/a14/db`) | 200 pdf (5p) | 0 | ✅ | heading = official verbatim (`…โดยการส่งออกไปนอกราชอาณาจักร`); ข้อ5 = `บริษัท สหการวิศวกร จำกัด`; **ข้อ12 = `เอกสารขอผู้ซื้อ`** (ขอ, verbatim); ข้อ7 blank | **CONTENT PASS + 1 FLAG** |
| 3 | อ.6 / 38272 (`/a6/db`) | 200 pdf | 0 | ✅ | renders as delivered; persons filter OK (REQ-010, TEST-004-persons) | **CONTENT PASS** |
| 4 | **อ.7 / (routing)** | — | — | — | **CLOSED — untestable:** no อ.7 request exists in the DB (FORM_ID 7 never present; Porter confirmed under REQ-028). อ.7→A6 path is dead/unexercisable; recorded as an explicit accepted gap, NOT a pass | **CLOSED (n/a)** |
| 5 | อ.9 transport / 38336 (`/a9/db`) | 200 pdf (6p) | 0 | ✅ | resolver picked **transport**; ข้อ2 = `ขนย้ายให้หน่วยงานตามมาตรา 7`; ข้อ5 populated; ข้อ7 blank | **PASS** (a9 resolver branch + content) |
| 6 | อ.9 destroy / **38362** (`/a9/db`) | 200 pdf (**4p**) | 0 | ✅ | resolver picked **destroy**; ข้อ2 = `ขนย้ายเพื่อทำลาย`; ข้อ5 = destroy label `สถานที่ทำการกำจัดหรือทำลาย`; law-ref 9 rows match official DESTROY form word-for-word; **ข้อ7 = `180 วัน นับแต่วันที่ได้รับอนุญาต`** (= REQ-023 positive/licence-present proof); page1 vs `A9-form-DESTROY-official.pdf` matches | **PASS** |

### FLAG-1 (case 2, a14/27300, page 1) — empty law-reference block
- **Form:** `A14-A16-form-official.pdf`, page 1, section "ซึ่งเป็นตาม พ.ร.บ., กฎกระทรวง, ระเบียบ และคำสั่งที่เกี่ยวข้อง ดังนี้".
- **Official form's text:** ~9 checkbox law-reference rows (พ.ร.บ.โรงงานผลิตอาวุธ 2550 ม.31/32; กฎกระทรวง ...ขายหรือจำหน่าย...ม.7 พ.ศ.2554 + ฉบับ2 2563; ...ค่าธรรมเนียม 2553; ...ขนย้าย 2556; ...มอบอำนาจ รมว.กห.).
- **Our render:** the section **header prints but ZERO rows** appear.
- **Not on the "do NOT raise" list** (that list's a14 item = evidence ticks, not page-1 law refs).
- **Question for Porter (not a decided defect):** is a14's law-ref block DB-driven (so 27300 legitimately
  has no rows, like อ.6's empty case) — or should it print the form's fixed law references? อ.6 sources
  law refs from `T_T_REQUEST_LAW_REF`; if a14 is the same, empty may be correct-for-this-data.

### Not raised (per the plan's "do NOT raise" list)
a14 evidence ticks blank, a9 tick placement (DEF-13), 18847 ข้อ7 blank, รายการ duplicated word / trailing `-`,
empty รายการ/ข้อ5 on no-detail requests — all left alone as instructed.

### Recommendation to Porter
- **Content is clean** on the 4 reachable cases (no 500, no literal `null`, 4 sig slots, ข้อ7 = blank/PERIOD_TEXT,
  DEF-12 fixed, a14/a15 item strings verbatim). This supports REQ-022/023/027 + DEF-12 on the content axis.
- **To actually close REQ-024/REQ-026(destroy)/REQ-028 (routing)** I need: (i) a `/download` read path
  (test `X-API-KEY` + a handful of encrypted ids: one อ.6, one อ.7, one a14, one a15, one a9-transport,
  one a9-destroy), or SA-review acceptance of routing; (ii) an **อ.7** sample id; (iii) a **type-2 destroy** id.
- Evidence PDFs: `../project-docs/REQ-sweep-evidence/{a15-18041,a14-27300,a9t-38336}.pdf` (gitignored; PII).
