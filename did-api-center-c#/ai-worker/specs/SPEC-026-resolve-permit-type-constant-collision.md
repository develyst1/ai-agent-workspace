# SPEC-026: ⛔ BUILD BREAK — resolve the duplicate `ReqMovePermitType` / `REQ_MOVE_PERMIT_TYPE`

- Source: REQ-024 (BLOCKER)
- Status: ACTIVE

## Verified in code (matches REQ-024 exactly)
- `ConstantSPF.GroupCode.cs` — **L55 (develop)** and **L215 (ours)**, both `"ReqMovePermitType"`, byte-identical.
- `ConstantSPF.Type.cs` — **develop's class (~L77)**: `MOVE="MV"`, `SALE_IN_KINGDOM="SD"`, `SALE_OUT_KINGDOM="EX"`, with
  doc comments that already encode the shadow-อ.9 rule; **ours (~L1067)**: `MV`/`SD`/`EX` **plus `BY_REQUEST_TYPE`**,
  which only we have.
- Not carelessness: our constants landed in `8d2034b` (TASK-043) **before** the `develop` merge `0917ab7` brought in the
  same concept. Two teams modelled the same domain independently.

## Decision — keep develop's, fold our map in, delete ours (Porter's recommendation; I agree)
Rationale is **merge economics, not code quality**: `develop` is the integration target, so a name **we** delete is
deleted once, whereas keeping ours would re-collide at every future merge. Their names are also more descriptive than
two-letter codes. Reference counts (develop's 0, ours 4) point the other way but are outweighed — 4 call sites is a
one-time edit.

**⚠ Neither blind deletion is acceptable:** deleting develop's compiles today and re-breaks on the next merge; deleting
ours *without first moving `BY_REQUEST_TYPE`* silently breaks REQ-023's derivation in both dashboards.

## Changes
1. **Delete our `GroupCode.REQ_MOVE_PERMIT_TYPE` (L215)**; keep develop's L55. Zero behaviour change — develop's own
   `RequestMoveService` L30 already consumes it.
2. **Move `BY_REQUEST_TYPE` into develop's class** (~L77), re-pointed at `MOVE` / `SALE_IN_KINGDOM` / `SALE_OUT_KINGDOM`,
   **keeping the "temporary — REQ-023 … do not clean up before CODE_INT is populated" comment verbatim.**
3. **Delete our whole `ReqMovePermitType` block** (~L1067) — only after the map has moved.
4. **Update the 4 call sites** to develop's names: `DashboardMoveA10Service` L365/L368, `DashboardMoveLicenseService`
   L370/L373. Same three string values ⇒ behaviour must be identical.

## 5. Correct develop's doc comment while folding — our DATA REQUEST proved it incomplete
develop's `MOVE` comment reads *"คำขอขนย้ายที่สร้างเอง — RefRequestId = 0"*. Our measurement (REQ-023 DR) showed
**both encodings exist: NULL 2,390 · ZERO 7**. Anyone implementing from that comment alone would write `== 0` and
silently lose **2,390** rows — the inverse of the trap that nearly bit us. Amend it to state:
**"ไม่มีคำขอต้นทาง — REF_REQUEST_ID IS NULL หรือ = 0 (วัดจริง 2026-07-24: NULL 2,390 · 0 = 7 แถว)"**.
This is the one piece of knowledge the collision *adds* to the shared constant rather than duplicating.

## Must NOT change
`RequestMoveService` (develop's consumer) · the REQ-023 derivation semantics (MV = NULL **or** 0; parent 5 ⇒ SD, 6 ⇒ EX)
· anything else in either dashboard.

## Acceptance
- [ ] `dotnet build` → **0 errors**; exactly one `ReqMovePermitType` and one `REQ_MOVE_PERMIT_TYPE` in the solution.
- [ ] The 4 call sites use develop's names; REQ-023 behaviour byte-identical (MV still includes the 7 zero rows).
- [ ] `BY_REQUEST_TYPE` + its temporary comment survive, now inside develop's class.
- [ ] develop's `MOVE` doc comment states the NULL-or-0 reality; `RequestMoveService` untouched.

## Process changes adopted (REQ-023 + REQ-024 — both accepted)
1. For any field whose value is a **code**: the SPEC must state its **business meaning + source table/column path**,
   not just a label group. Untraceable ⇒ stakeholder question, not inference.
2. Before introducing a new constant/concept: **grep the DAL constants *and* `develop`**, not just the current branch.
   Three times now the knowledge already existed in-repo (`CLAUDE.md` shadow-อ.9 · pre-existing `GroupCode` found in
   TASK-039 · develop's `ReqMovePermitType` doc comments). The DATA REQUEST was still worth running — it proved the
   3-bucket model and caught the 7-row trap, neither documented anywhere — but the *concept* existed to build on.

## Tasks
- **TASK-045** — the resolution above.

## Questions
(Jason asks here; Sober answers as `> answer: ...`)
