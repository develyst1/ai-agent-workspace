# TASK-028: DEF-12 — อ.15 item-5 from child อ.9 MOVE.AUTHORITY_NAME (fix the `-` placeholder)

- Source: SPEC-031 (DEF-12). 🔴 TOP. Corrects the SPEC-029 item-5 source (was VW placeholder `-`).
- Status: DONE (Sober-reviewed)
- Assignee: Jason (BE)
- Depends on: none (a15 already built; this repoints one hook)
- ⚠️ a9-transport item-5 must stay **unchanged** (MOVE.AUTHORITY_NAME on its own row). อ.6/อ.14 untouched.

## Do
1. `RequestRepository`: add `List<RequestEntity> findByRefRequestIdAndRequestType(Long refRequestId, Integer requestType)`
   (derived query; no FETCH FIRST — take first in Java).
2. `A15ReportBuilder.item5Value(long requestId, RequestMoveEntity move)` → replace the VW read with the child hop:
   ```java
   RequestEntity childA9 = firstOrNull(requestRepository.findByRefRequestIdAndRequestType(requestId, 3));
   if (childA9 == null) return "";                       // no child → blank (never "-", never "null")
   RequestMoveEntity m = requestMoveRepository.findByRequestId(childA9.getId()).orElse(null);
   return m != null ? nz(m.getAuthorityName()) : "";
   ```
   (Base already injects `requestRepository` + `requestMoveRepository`; reuse them.)
3. **Remove the dead `AUTHORITY_NAME` mapping on `RequestDtlViewEntity`** (added in TASK-026 for the wrong
   source) — confirm grep 0 refs first. Leave the rest of the view entity untouched.

## Verify — BE then QA (real DB)
- BE: compiles/boots; a15 item5Value uses the child-a9 hop; `RequestDtlViewEntity.AUTHORITY_NAME` gone (0 refs);
  A15 + A9 (destroy/transport) + A6/A14 PreviewTests green; **a9-transport item-5 unchanged**.
- QA (real DB, via Porter): **18041 → item-5 = `สมาคมกีฬานักยิงปืนสมัครเล่นภูเก็ต`** (not `-`); an อ.15 with no
  child อ.9 → blank; a9-transport item-5 unchanged.

## Definition of Done
- [ ] a15 item-5 = child อ.9 (`REF_REQUEST_ID`, type 3) → `MOVE.AUTHORITY_NAME`; blank when no child (never `-`/"null").
- [ ] `findByRefRequestIdAndRequestType` added; dead `RequestDtlViewEntity.AUTHORITY_NAME` mapping removed.
- [ ] a9-transport item-5 unchanged; test-compile + all PreviewTests green; boots.

## Handoff after DoD
Back to **Sober** for review (a9-transport unchanged + a15 hook logic + dead mapping gone). Then QA 18041 on real DB.

## Progress — EXECUTED, DB-free verified → REVIEW (2026-08-20)
- `RequestRepository.findByRefRequestIdAndRequestType(Long, Integer)` (derived List; firstOrNull in Java — 11.2-safe).
  Boot validated the derived query (no PropertyReferenceException → `refRequestId`+`requestType` resolve).
- `A15ReportBuilder.item5Value` → child อ.9 hop exactly per spec: `findByRefRequestIdAndRequestType(requestId, 3)`
  → firstOrNull → `requestMoveRepository.findByRequestId(childId)` → `nz(MOVE.AUTHORITY_NAME)`; **no child → ""**
  (never `-`, never "null"). Uses base's injected requestRepository/requestMoveRepository (no new field).
- Removed dead `RequestDtlViewEntity.AUTHORITY_NAME` mapping (grep = 0 refs after the item5Value repoint).
- **a9-transport item-5 UNTOUCHED** — its `item5Value` still reads `move.getAuthorityName()` on its own row.

### Verify (DB-free)
- test-compile + clean compile SUCCESS; boot :33094 **Started** clean.
- All PreviewTests green (A6 3pg / A9 destroy 4 / A9 transport 5 / A14 4 / A15 5). a9-transport 7606 chars =
  unchanged; a15-preview 7606, **0 "null"**, no bare `-`. (mock can't exercise the child hop — DB path.)
- Real proof = QA: **18041 → item-5 = `สมาคมกีฬานักยิงปืนสมัครเล่นภูเก็ต`** (not `-`); an a15 with no child → blank;
  a9-transport item-5 unchanged.

@Sober: ready for review — a15 item-5 now child-a9 MOVE.AUTHORITY_NAME, a9-transport unchanged, dead VW mapping gone.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Review
**Verdict: DONE** (Sober, 2026-08-20). Verified code + build (real render = QA leg, rule #4):
- a15 `item5Value` = child อ.9 hop: `findByRefRequestIdAndRequestType(requestId, 3)` → firstOrNull → child
  `MOVE.AUTHORITY_NAME`; **no child → "" (blank, never `-`/"null")**. ✅
- `RequestRepository.findByRefRequestIdAndRequestType(Long,Integer)` returns List (11.2-safe). ✅
- **a9-transport item-5 UNCHANGED** — still `move.getAuthorityName()` on its own row (grep-confirmed). ✅
- Dead `RequestDtlViewEntity.AUTHORITY_NAME` mapping (my SPEC-029 mistake) **removed** (0 refs). ✅
- test-compile + A15/A9 PreviewTests → BUILD SUCCESS 2/0; boots. ✅
- **DEF-12 fixed in code.** QA (real DB): 18041 → item-5 = `สมาคมกีฬานักยิงปืนสมัครเล่นภูเก็ต` (not `-`);
  an a15 with no child → blank; a9-transport unchanged.
