# TEST-006: REQ-031 packaged-jar smoke (compile .jrxml→.jasper in build)

- Source: REQ-031 QA smoke (Porter, 2026-08-24/25) — "one real request per builder from the packaged jar"
- Status: PARTIAL — **REQ-031 build sound**, but the smoke **surfaced a blocker (DEF-16)** in 3 forms + 6 builders unreachable read-only
- Environment: packaged jar (`java -jar target/…jar --spring.profiles.active=dev`), `:33010`, UAT-wired, read-only
- Tested: 2026-08-25 by Tanya

## Build smoke (REQ-031 mechanism) — PASS
- `./mvnw -o clean package` → **BUILD SUCCESS**. JasperPrecompiler compiled **52 `.jrxml` → 52 `.jasper`**
  in `target/classes` (1:1, no gap — the old 52-vs-28 gap is closed) and **52 `.jasper` are packaged in
  the jar**. `src/` holds **0** `.jasper` (TASK-035 purge verified); git clean. The build mechanism works.

## Per-builder render from the jar
| Builder | id | seam | Result |
|---------|-----|------|--------|
| a6 | 38272 | `/a6/db` | **200**, 3p, 0 null — matches known-good | ✅ |
| a9 destroy | 38362 | `/a9/db` | **200**, 4p, 0 null; item2 = ขนย้ายเพื่อทำลาย, item7 = 180 วัน… — **ticks still correct after the fresh precompile** (DEF-15 stays fixed) | ✅ |
| a9 transport | 38336 | `/a9/db` | **HTTP 500** | ❌ DEF-16 |
| a14 | 27300 | `/a14/db` | **HTTP 500** | ❌ DEF-16 |
| a15 | 18041 | `/a15/db` | **HTTP 500** | ❌ DEF-16 |
| a1, a3, open, expand, personChange, planChange | — | **none** | **NOT SMOKED** — no no-auth seam exists; reachable only via `/download` (auth + encrypted id) | ⚠️ gap |

## DEF-16 — a9-transport / a14 / a15 return HTTP 500 on real data (invalid column) — BLOCKER
- **NOT a REQ-031 defect.** REQ-031's `.jasper` are fine (a6 + a9-destroy render from the same jar). This
  is a **DB-column regression** the broad smoke surfaced — same class as DEF-11 (an invented column).
- Error (all 3, identical): **`ORA-00904: "RBE1_0"."GOV_COMMITTEE_ISSUE_DATE": invalid identifier`** on
  `SELECT … FROM t_t_request_buyer …`. `T_T_REQUEST_BUYER` has no such column.
- Source: `RequestBuyerEntity.java:61-62` — `@Column(name = "GOV_COMMITTEE_ISSUE_DATE") private LocalDate
  govCommitteeIssueDate;` (added in the DEF-14 / REQ-030 buyer-field work). The buyer query is shared by
  all forms with an item-12 buyer block ⇒ a9-transport, a14, a15 all 500; a6 and a9-destroy have no buyer
  block ⇒ unaffected.
- **Before/after:** in my TEST-004 sweep earlier this session these same seams returned **200** with content
  (a15/18041 ข้อ5, a14/27300 ข้อ12, a9t/38336). They now **500** — a regression from the intervening
  RequestBuyerEntity change.
- **Severity: production blocker.** The same buyer query runs on the real `/download` path, so a9-transport,
  a14 and a15 downloads will 500 in prod (REQ-024 had verified /download 200 *before* REQ-030 landed —
  exactly the DEF-11 pattern of a new entity column breaking a previously-green path).
- **Caveat:** ORA-00904 fails on the first bad identifier, so `GOV_COMMITTEE_ISSUE_DATE` is the one proven
  invalid; the other new buyer columns (`GOV_COMMITTEE_NO`, `GOV_COMMITTEE_ATT_FILE_ID`, `ASSOC_PRES_*`,
  `ATTORNEY_*`) may also be invented — needs an SA/data-team sweep vs `DIDPERMIT-data-dictionary.xlsx`.
- Repro (clean): build the jar, run dev, GET (no key) `/a14/db/27300` (or `/a15/db/18041`, `/a9/db/38336`)
  → 500 JSON. Evidence: `../project-docs/REQ-031-evidence/ora00904-error.txt` (SQL error text, no PII).
- I did **not** fix it (QA boundary; not my initiative). Reporting to Porter → Sober.

## Coverage gap — 6 older builders not smoked
a1 / a3 / open / expand / personChange / planChange have **no no-auth seam** (PreviewController exposes db
seams only for a6/a9/a14/a15). These are exactly the "at-risk older builders" Porter flagged, and I cannot
reach them read-only. To smoke them I need either `/download` access (test `X-API-KEY` + one encrypted id
per family) or temporary `/db` seams. **Their freshly-compiled `.jasper` are therefore unverified at render.**

## Verdict
- **REQ-031 build mechanism: PASS** (52→52 compile, packaged, a6 + a9-destroy render correctly from the jar).
- **Do NOT close REQ-031 as "all builders smoke clean":** 3 forms 500 (DEF-16, a REQ-030 buyer-column
  regression — must be fixed regardless), and 6 older builders are unreachable read-only.
- Needs from Porter/human: (1) route DEF-16 to Sober (invalid buyer column(s)); (2) a `/download` path or
  seams to smoke a1/a3/open/expand/personChange/planChange.

---

## DEF-17 (was DEF-16) fix verification — 2026-08-27, Tanya (clean build, own :33011/:33012, read-only)
The buyer re-map (TASK-036) is confirmed on real data. "200 is the floor" — also checked item-12 values.

**200 + no ORA (the 500-fix):** a9-transport/38336, a14/27300, a15/18041 all now **HTTP 200** (were 500);
a6/38272 + a9-destroy/38362 canaries 200 unchanged; **0 `null`, 0 ORA-00904** across all five.

**Item-12 write-ins actually populate (not a hollow 200):** used **37956** (the a9-transport request known
to carry item-12 data). Its item-12 prints real values — `เลขที่` on multiple lines (นายกสมาคม card
`1234455678903`, ผู้รับมอบ `1119922345697`, ลายมือชื่อ `1122233232123`), **`เลขที่ e0001` from
`DOCUMENT_NAME_OTHER`**, ชื่อนายกสมาคม (the DEF-14 blank-name fix), `วันหมดอายุ 12/08/2570`, and one ticked
box. So the new wiring reads data. ✅
- **`:271`/`:278` duplicate fix:** the two assoc-president ID lines now differ — บัตรนายกสมาคม `1234455678903`
  vs นายกสมาคม/ผู้มอบอำนาจ **blank**. Not the old identical-duplicate. ✅
- **18041 (a15) item-12 blank** = that request genuinely has no buyer-doc data — NOT a wiring failure
  (37956 proves the wiring populates). **27300 (a14) item-12 blank** = the documented accepted gap
  (no attachments/source in the อ.14 family). Neither raised.

**DEF-17 verdict: QA-CONFIRMED FIXED.** REQ-031 build + DEF-17 both pass; REQ-031's ONLY remaining blocker
is the no-auth-seam coverage gap for a1/a3/open/expand/personChange/planChange (Porter to provide a path).
