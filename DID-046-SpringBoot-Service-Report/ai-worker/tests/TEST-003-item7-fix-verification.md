# TEST-003: อ.6 item 7 fix (REQ-005 / DEF-1 close proof)

- Source REQ: REQ-005 (fix DEF-1: item 7 → T_T_LICENSE.PERIOD_TEXT)
- Status: TEST_PASSED  ← after rework: round 1 FAILED (DEF-2), round 2 (rework) PASSED — DEF-1 + DEF-2 both closed
- Environments: uat-wired (read-only) — my own build of the fixed tree, `:33002`, `dev` profile
- Tested: 2026-08-05 by Tanya

## Scope
Re-run the REQ-001 item-7 check against the fixed tree (TASK-003) via the `/a6/db/{id}`
seam, for the 3 sampled ids, and compare item 7 to the DR-1 truth
(`project-docs/REQ-005-DR1-license-join-result.md`):
- 38273 → `ใช้ได้จนถึง 28 ก.ค. 2569 นับแต่วันที่ได้รับอนุญาต`
- 38272 → `ใช้ได้จนถึง 27 ก.ค. 2569 นับแต่วันที่ได้รับอนุญาต`
- 38240 → blank (no T_T_LICENSE row)

## Method
- Built the current working tree (Jason's TASK-003 fix present: new `LicenseEntity` +
  `LicenseRepository.findFirstByRequestIdOrderByIdDesc`, builder item-7 rewired). Compile → exit 0.
- Booted my own instance `:33002` with **`dev` profile** (required — `PreviewController` is
  `@Profile("dev")` and SecurityConfig permits `/api/v1/preview/**` only under dev). Connected to
  the UAT-wired Oracle (**version 11.2**). Read-only GETs, no key. Instance stopped after.

## Cases
| # | Case | Steps | Expected | Actual | Result |
|---|------|-------|----------|--------|--------|
| 1 | 38272 item 7 = PERIOD_TEXT | GET `/a6/db/38272` | 200 pdf, item7 = "ใช้ได้จนถึง 27 ก.ค. 2569 …" | **HTTP 500** `application/json` — no PDF | **FAIL** |
| 2 | 38273 item 7 = PERIOD_TEXT | GET `/a6/db/38273` | 200 pdf, item7 = "ใช้ได้จนถึง 28 ก.ค. 2569 …" | **HTTP 500** — no PDF | **FAIL** |
| 3 | 38240 item 7 = blank | GET `/a6/db/38240` | 200 pdf, item7 blank | **HTTP 500** — no PDF | **FAIL** |
| 4 | No duplicated unit ("…วัน วัน") | inspect output | n/a | **cannot evaluate** — report doesn't generate | BLOCKED |
| 5 | DEF-1 closed | re-run item-7 check | item 7 correct | **cannot evaluate** — generation fails | BLOCKED |

## Defects
### DEF-2 — a6/db report returns HTTP 500 (ORA-00933) after the item-7 fix — BLOCKER (regression)
- Environment: uat-wired (read-only), my fixed build `:33002` (`dev`), Oracle **11.2**.
- Repro (from a clean start): build the current tree, run with `dev` profile, GET (no key)
  `/document-service/api/v1/preview/checklist/a6/db/38272` (also 38273, 38240) → **HTTP 500**,
  `application/json` error body, no PDF. Reproduced on all 3 ids (9× ORA-00933 in the server log).
- Expected: 200 `application/pdf` with item 7 from PERIOD_TEXT.
- Actual: 500. Server log — `InvalidDataAccessResourceUsageException` → **ORA-00933: SQL command
  not properly ended**, on the generated query:
  ```sql
  select le1_0.id, le1_0.period_text, le1_0.request_id
  from t_t_license le1_0 where le1_0.request_id = ?
  order by le1_0.id desc fetch first ? rows only
  ```
- Observation (evidence, not a proposed fix): the `fetch first … rows only` clause is emitted by
  the `findFirstByRequestIdOrderByIdDesc` derived query; that clause is Oracle **12c+** syntax and
  the UAT DB is **11.2**, which rejects it (Hibernate also warns the 11.2 dialect is unsupported).
  The *how-to-repair* is Sober's call — I only report what broke.
- Impact: **worse than DEF-1.** DEF-1 printed a wrong-but-present value; now the entire อ.6
  document fails to generate for every request that reaches the license lookup. Release blocker.
- Evidence: `../project-docs/REQ-005-evidence/fix-{38240,38272,38273}-HTTP500.json` (error bodies;
  SQL error text, no PII) + `/tmp/a6-fix-run.log` server stack trace at test time.

## Round 2 — re-test after rework (2026-08-05)
Sober/Jason reworked the license lookup: `LicenseRepository.findByRequestIdOrderByIdDesc`
now returns `List<LicenseEntity>` and the builder takes the first in Java (`firstOrNull`) —
**no `FETCH FIRST` clause**, so the Oracle 11.2 incompatibility (DEF-2) is gone. Rebuilt the
current tree (compile exit 0), booted my own `:33003` (`dev`), read-only GETs, no key; stopped
after; :33000 untouched.

| # | Case | GET `/a6/db/{id}` | Expected (DR-1) | Actual | Result |
|---|------|-------------------|-----------------|--------|--------|
| 1 | 38272 item 7 | 38272 | 200 pdf, "ใช้ได้จนถึง 27 ก.ค. 2569 นับแต่วันที่ได้รับอนุญาต" | 200 `application/pdf`, item7 = **"ใช้ได้จนถึง 27 ก.ค. 2569 นับแต่วันที่ได้รับอนุญาต"** (text + visual render, no overflow) | **PASS** |
| 2 | 38273 item 7 | 38273 | 200 pdf, "ใช้ได้จนถึง 28 ก.ค. 2569 นับแต่วันที่ได้รับอนุญาต" | 200 `application/pdf`, item7 = **"ใช้ได้จนถึง 28 ก.ค. 2569 นับแต่วันที่ได้รับอนุญาต"** | **PASS** |
| 3 | 38240 item 7 blank | 38240 | 200 pdf, item 7 blank | 200 `application/pdf`, item 7 label only, **blank value** (no license row) | **PASS** |
| 4 | No stray " วัน" / duplicated unit | all | no "…วัน วัน" | PERIOD_TEXT printed verbatim, **no " วัน" suffix** | **PASS** |
| 5 | DEF-2 gone (no 500 / ORA-00933) | all | 200, no ORA error | all 200; **0 ORA-00933** in the server log | **PASS** |
| 6 | DEF-1 closed | 38272/38273 | value = PERIOD_TEXT not TOTAL_DAYS | was "90/350 วัน" → now the correct PERIOD_TEXT sentence | **PASS** |
- Evidence: `../project-docs/REQ-005-evidence/retest-{38240,38272,38273}.pdf` (gitignored; PII).
  Visual render of 38272 p.1 inspected (item 7 fits cleanly), PNG deleted after (PII hygiene).

## Verdict
Round 1 (first fix attempt): **TEST_FAILED** — introduced DEF-2 (BLOCKER, ORA-00933 on Oracle 11.2).
Round 2 (rework, `List` + first-in-Java, no `FETCH FIRST`): **TEST_PASSED** — all 3 ids generate
(200 pdf, no ORA error) and item 7 now prints `T_T_LICENSE.PERIOD_TEXT` exactly per DR-1 (blank for
38240), no stray unit. **DEF-1 and DEF-2 are both closed.** REQ-005 → ready for Porter DELIVERED.

## Questions (for Porter; answer as `> answer: ...`)
- Q1 — DEF-2 is a hard blocker on the real UAT DB (Oracle 11.2). Route the rework via Sober;
  I'll re-test the /a6/db seam for the 3 ids as soon as a new build is ready. No new data needed
  from the human — the DR-1 truth already gives the expected item-7 values.
