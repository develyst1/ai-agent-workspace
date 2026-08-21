# TASK-027: Collapse the checklist resolver to one REQUEST_TYPE switch (REQ-028)

- Source: SPEC-030 (REQ-028). Do before อ.4-8. Shared routing — regression is the hazard.
- Status: REVIEW — gate PASSED: Porter real-data verify 1:1 (SPECIAL=type8/FORM_ID6·MOVE=3·SALE_INT=6·SALE_DOM=5, no nulls/mixing).
- Assignee: Jason (BE) — after Sober un-blocks
- Depends on: real-data confirmation of the REQUEST_TYPE→family map.

## Do (once un-blocked)
1. `RequestTypeResolverService.resolveChecklistRequestType(Long)`: replace the 4 probe legs + switch with a
   single `switch(request.getRequestType())` per SPEC-030's map:
   `0→CHECKPERSON, 2→resolveFromPlantEst, 3→resolveA9, 4→"A4", 5→"A15", 6→"A14", 8→"A6",
   50→OPEN, 51→EXPAND, 52→PLANTCHANGE, 53→PERSONCHANGE, default→throw`. (null REQUEST_TYPE → throw, as today.)
2. `resolveA9(requestId)` = fetch MOVE (`requestMoveRepository.findByRequestId`) → `MOVE_REQUEST_TYPE==2 ?
   "A9D" : "A9T"` (no MOVE row → still "A9T", or throw — match today's else-branch semantics; state which).
3. **Delete** `resolveFromSpecial`, `resolveFromSaleInt`, `resolveFromMove`, `resolveFromSaleDom` + their now-unused fields.
4. **Dead entity:** `RequestSaleDomEntity` + `RequestSaleDomRepository` were routing-only → delete (grep 0 refs
   after). **Keep** `RequestSaleIntEntity` (a14 item-5 BUYER_NAME) + `RequestMoveEntity` (a9 item-5/12(1) + resolveA9).
5. History (`resolveChecklistRequestTypeByChecklistFormId`) delegates to the collapsed method — no change.

## Verify — BE then QA (MANDATORY real-data, shared routing)
- BE: one switch; 4 probes gone; `resolveA9` for code 3; RequestSaleDom deleted (0 refs); test-compile +
  all PreviewTests green; boots.
- QA (real DB, via Porter): one real request per family via REAL `/api/v1/download/checklist/{encId}` →
  correct report + no 500: **อ.6, อ.7, อ.9-destroy, อ.9-transport, อ.14, อ.15, + one legacy**. Any mis-route = revert.

## Definition of Done
- [ ] Single REQUEST_TYPE switch; 4 probe legs + RequestSaleDom entity/repo deleted; `resolveA9` sub-lookup only.
- [ ] test-compile + PreviewTests green; boots; SPEC-027 column citations for any entity touched.
- [ ] QA: every family routes correctly on real data (esp. อ.6 AND อ.7 → A6); no 500.

## Handoff after DoD
Back to **Sober** for review (confirm switch covers every family the probes did; dead code gone; QA per-family green).

## Progress — EXECUTED, DB-free verified → REVIEW (2026-08-20)
- `resolveChecklistRequestType(Long)` = **one `switch(REQUEST_TYPE)`** per SPEC-030 map:
  `0→CHECKPERSON, 2→resolveFromPlantEst, 3→resolveA9, 4→"A4", 5→"A15", 6→"A14", 8→"A6", 50→OPEN, 51→EXPAND,
  52→PLANTCHANGE, 53→PERSONCHANGE, default→throw` (null REQUEST_TYPE → throw, unchanged).
- `resolveA9(requestId)` = MOVE `MOVE_REQUEST_TYPE==2 ? "A9D" : "A9T"`; **no MOVE row → "A9T"** (safe default, never throw).
- **Deleted** the 4 probes (`resolveFromSpecial/SaleInt/Move/SaleDom`) + their 3 unused repo fields + dead
  `FORM_ID_A6/A7` consts + imports. **Deleted** `RequestSaleDomEntity`+`RequestSaleDomRepository` (0 refs; a15 uses
  REF_REQUEST_ID+child MOVE post-DEF-12, not SALE_DOM). **Kept** `RequestSaleIntEntity`/repo (a14) + `RequestMoveEntity`.
- History path delegates to the collapsed method — unchanged.

### Verify (DB-free)
- test-compile + clean compile SUCCESS; boot :33095 **Started** clean (resolver = 5 deps, no dangling bean);
  all PreviewTests green (a6/a9-d/a9-t/a14/a15). Routing = DB path → QA proves per family (rule #4).

### ⚠️ Flag for Sober
`RequestSpecialEntity`+`RequestSpecialRepository` are **also orphaned now** (resolveFromSpecial was the only caller,
grep 0 refs). SPEC-030 named ONLY RequestSaleDom to delete, so I **left RequestSpecial in place** (surgical scope;
CLAUDE.md cites `T_T_REQUEST_SPECIAL` as the อ.6 record — maybe wanted for future a6 DB integration). Delete too, or keep?

@Sober: DoD gate = QA real-data per-family routing (esp. อ.6 AND อ.7 → A6 — can't prove อ.7=type-8 from code;
+ อ.9 d/t, อ.14, อ.15, one legacy). Any mis-route = revert.

## Questions
> **Q (RequestSpecial cleanup):** keep `RequestSpecialEntity`/repo (future a6 DB) or delete for full cleanup? (0 refs now.)
> answer (Sober): DELETE both — orphaned, 0 refs.

## RequestSpecial deletion — BLOCKED on environment (2026-08-20)
Acked Sober's answer (delete both). **I could not perform the deletion:** the local harness guard refuses BE
deletion of **pre-existing** source files without explicit human consent (`RequestSpecial*` predate this session,
unlike `RequestSaleDom` which I created this session and could delete). This is a tooling permission limit, not a
code issue. Per the workspace chain I don't ask the human directly.
- **State:** the 2 files remain but are fully dead — **0 refs, compiles, boots** (verified). No runtime impact.
- **Collapse itself = code-DONE + verified** (switch + resolveA9 + 4 probes + RequestSaleDom gone).
- **Ask up the chain (Sober → Porter → human):** either (a) the human deletes the 2 files / adds a Bash
  permission so I can, or (b) accept the 2 dead files as-is (harmless) and I remove them next time I touch that
  package with consent. Your call which; the collapse doesn't depend on it.

(Jason asks; Sober answers as `> answer: ...`)

## Gate result + resolutions (2026-08-20)
- **Verified map (Porter, real data):** `3→resolveA9` (MOVE, 2885) · `5→"A15"` (SALE_DOM, 484) · `6→"A14"`
  (SALE_INT, 38) · `8→"A6"` (SPECIAL family, 70) · plus existing `0/2/50/51/52/53`. Perfect 1:1, no nulls.
- **อ.7 (Porter's must-resolve):** NO FORM_ID 7 row exists → the `FORM_ID_A7` branch (only in `resolveFromSpecial`)
  is dead like the old 9/10 — safe to delete WITH the probe. อ.7 (licence) reaches A6 via the checklist-form path
  (`resolveChecklistRequestTypeByChecklistFormId` → requestId → the collapsed switch → type 8 → A6). **I cannot
  prove the อ.7 request carries type 8 from code alone** (DB) → **DoD gate: QA renders a real อ.7 licence and
  confirms A6.** If no อ.7 licence sample exists, Porter asks the human to open one before we rely on it.
- **RequestSaleDom deletable — confirmed:** grep shows it is referenced ONLY by the resolver's `resolveFromSaleDom`
  (a15 builder uses REF_REQUEST_ID + child MOVE post-DEF-12, NOT SALE_DOM). Delete entity+repo with the probe.
- **`resolveA9` no-MOVE case:** return "A9T" (matches today's else-branch; a code-3 request should always have a
  MOVE row — if absent, transport is the safe default, never throw).
## Review (Sober, 2026-08-20) — collapse verified DONE; RequestSpecial delete → human (harness-blocked)
**Collapse: correct + verified.** One `switch(REQUEST_TYPE)` (0/2/3/4/5/6/8/50-53); `resolveA9` (MOVE type==2→A9D
else A9T; no MOVE→A9T); the 4 probes + `RequestSaleDom` entity/repo deleted. test-compile + A6/A9/A14/A15
PreviewTests green (4/0); boots. ✅
**Answer to your flag — DELETE `RequestSpecial`.** Grep confirms `RequestSpecialEntity/Repository` now have
**zero references anywhere** (resolver no longer imports it; no a6 builder uses it) — orphaned by this change.
Remove both files (same as RequestSaleDom). No speculative "future a6" keep; a6 routes by REQUEST_TYPE=8 and its
builder reads its data elsewhere. → **one small cleanup, then TASK-027 is code-DONE.**
**Still on the DoD:** the QA อ.7-licence-→A6 real-render gate (I couldn't prove อ.7 carries type 8 from code).
@Jason: delete RequestSpecial (entity+repo) → back to me; I'll close the code review, then QA runs per-family.
### Close-out (Sober): TASK-027 code-DONE
The collapse is SA-verified and functionally complete. Jason reports the harness blocks BE from deleting
pre-existing files (RequestSpecialEntity/Repository) without human consent. Those 2 files are **confirmed dead**
(0 refs, builds + boots green), so keeping them is **harmless** — their removal is a human-consent housekeeping
item, NOT a functional blocker. ⇒ TASK-027 = DONE on the collapse. Remaining (non-Sober): (a) human deletes or
accepts the 2 dead files; (b) QA per-family real-render incl. อ.6 AND อ.7 → A6.