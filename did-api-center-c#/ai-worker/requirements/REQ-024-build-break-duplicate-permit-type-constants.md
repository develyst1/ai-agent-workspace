# REQ-024: ⛔ BUILD BREAK — duplicate `ReqMovePermitType` / `REQ_MOVE_PERMIT_TYPE` after merging `develop`

- Status: READY_FOR_SA
- Priority: **BLOCKER** — the solution does not compile; nothing can be captured until this is resolved
- Raised: 2026-07-24 — stakeholder: *"error build ไม่ได้ น่าจะเพราะ merge code develop เข้ามา"* (correct diagnosis)

## The errors (reproduced, `dotnet build` on `feat/dashboard`)
```
ConstantSPF.Type.cs(1067,29):      error CS0102: 'ConstantSPF' already contains a definition for 'ReqMovePermitType'
ConstantSPF.GroupCode.cs(215,33):  error CS0102: 'ConstantSPF.GroupCode' already contains a definition for 'REQ_MOVE_PERMIT_TYPE'
                                   2 Error(s)
```

## Root cause — a genuine merge collision, NOT team carelessness
`git log`: our constants landed in **8d2034b** ("add new permit type constants", TASK-043), and **0917ab7
"Merge branch 'develop' into feat/dashboard" came afterwards**, bringing in a `develop` version of the *same concept*.
At the time TASK-043 was written those definitions did not exist on this branch, so Jason's "check before adding" was
correct against what he could see. Two teams modelled the same domain concept independently.

## The two collisions are NOT equally difficult

### 1. `GroupCode.REQ_MOVE_PERMIT_TYPE` — trivial, identical
| | line | value |
|---|---|---|
| develop | `ConstantSPF.GroupCode.cs` L55 | `"ReqMovePermitType"` |
| ours | `ConstantSPF.GroupCode.cs` L215 | `"ReqMovePermitType"` |

Byte-identical ⇒ **delete ours (L215), keep develop's (L55).** Zero behaviour change, zero risk.
Note `develop`'s own `RequestMoveService.cs` L30 already consumes this constant — another reason theirs is the keeper.

### 2. `ConstantSPF.ReqMovePermitType` — same values, different member names, and **only ours has the map**
| | line | members |
|---|---|---|
| **develop** | `ConstantSPF.Type.cs` **L77** | `MOVE="MV"`, `SALE_IN_KINGDOM="SD"`, `SALE_OUT_KINGDOM="EX"` |
| **ours** | `ConstantSPF.Type.cs` **L1067** | `MV`, `SD`, `EX` + **`BY_REQUEST_TYPE`** (the temporary 3/5/6 map from REQ-023) |

The **string values are identical** ("MV"/"SD"/"EX") — the two teams agree on the domain, only the C# member names
differ. Reference count (grep-verified):
- develop's names (`MOVE` / `SALE_IN_KINGDOM` / `SALE_OUT_KINGDOM`) → **0 references anywhere**
- ours (`MV` / `SD` / `EX` / `BY_REQUEST_TYPE`) → **4 references**, all in the two dashboard services
  (`DashboardMoveA10Service` L365/L368, `DashboardMoveLicenseService` L370/L373)

## Recommended resolution (Porter proposes — @Sober decides and specs)
**Keep develop's class, fold our map into it, delete our duplicate.** Concretely:
1. Delete our `ReqMovePermitType` block (Type.cs L1067-…) and our `REQ_MOVE_PERMIT_TYPE` (GroupCode.cs L215).
2. Move `BY_REQUEST_TYPE` **into** develop's L77 class, re-pointed at develop's member names, keeping the
   "temporary — REQ-023 … do not clean up before CODE_INT is populated" comment verbatim.
3. Update the 4 dashboard call sites to develop's names.

**Why theirs rather than ours, even though ours has all the users:** develop is the integration target — our branch
merges *into* it, so a name we delete now is deleted once, whereas a name develop keeps would collide again at every
future merge. Their names are also more descriptive than two-letter codes. This is the cheaper direction, not a
judgement about code quality.

**⚠ Do not simply delete one blindly** — deleting develop's would compile today and re-break on the next merge;
deleting ours without moving `BY_REQUEST_TYPE` first would break the REQ-023 derivation in both dashboards.

## 🔎 Worth noting — develop had already encoded the rule we spent a DATA REQUEST rediscovering
develop's L77 doc comments read: *"ขนย้าย (คำขอขนย้ายที่สร้างเอง — **RefRequestId = 0**)"*, *"ขายขนย้ายในราชอาณาจักร
(**shadow จาก อ.15 SaleDom**)"*, *"...(**shadow จาก อ.14 SaleInt**)"* — i.e. the whole MV/SD/EX ⇄ shadow-อ.9 rule,
already written down by another team member, plus `RequestMoveService` already reading the group.
That is the **third** time the knowledge behind the 70% verdict turned out to already exist in this repo
(after `CLAUDE.md`'s shadow-อ.9 section and the `ConstantSPF.GroupCode` constants Jason found pre-existing in TASK-039).

**Process change to add to the one from REQ-023** (@Sober): before introducing any new constant/concept, grep the DAL
constants **and `develop`**, not just the current branch. Our DATA REQUEST was still worth running — it proved the
3-bucket model and caught the 7-row NULL/0 trap, neither of which was documented anywhere — but the *concept* was
already there to build on.

## Acceptance
- [ ] `dotnet build` → 0 errors.
- [ ] Exactly one `ReqMovePermitType` and one `REQ_MOVE_PERMIT_TYPE` in the solution.
- [ ] REQ-023 behaviour unchanged: MV includes `REF_REQUEST_ID` NULL **or 0** (the 7 rows), parent 5 ⇒ SD, 6 ⇒ EX.
- [ ] `RequestMoveService` (develop's consumer) still compiles and is untouched.

@Sober — SPEC + TASK. Blocker: everything else is waiting on this.
