# TASK-011: align cross-service port config to the real port map (ops-back :4010)
- Source: SPEC-001 (delivery-readiness — REQ-001 deploy gate)
- Status: DONE
- Depends on: none
- Assignee: @Jason (config templates: smart-scheduler-back + smart-scheduler-backoffice-front + docs)

## Why
Deployment moved the ops/finance API to **port 4010** (was 3002) and the backoffice
admin UI to **3018** (was 3100). The `.env.example` templates still reference **:3002**
for the cross-service URLs → a fresh dev/deploy using the templates would fail to reach
ops. Real runtime env is the human's (deploy gate), but the repo templates + docs must
reflect the real map so nobody wires the old ports.

## What to do (config templates + docs only — no logic changes)
1. `smart-scheduler-back/.env.example`: `OPS_API_URL=http://localhost:3002` →
   **`http://localhost:4010`**.
2. `smart-scheduler-backoffice-front/.env.example`:
   `NEXT_PUBLIC_BACKOFFICE_API_URL=http://localhost:3002/api` → **`http://localhost:4010/api`**;
   fix the stale comment "defaults to port 3002" → 4010.
3. `smart-scheduler-backoffice-back/.env.example`: `PORT=4010` is already correct; fix the
   stale comment "scheduling API defaults to 3001" → scheduling API is **:4006**.
4. Write the **canonical port map** into `docs/monorepo-overview.md` (and root `CLAUDE.md`
   port table) — **confirmed by Porter 2026-07-20**:
   **staff-front :3016 · scheduling-back :4006 · ops-back :4010 · ops-front :3018.**
   Scheduled-task targets: **end-of-day → :4006**, **month-start → :4010**.
   Note: `smart-scheduler-front/.env.example` uses a prod domain (`som.develyst.online/api`),
   not a localhost port — leave it; only the two ops localhost URLs (#1, #2) need the :4010 fix.

## Definition of Done
- [ ] Both cross-service URL templates point at :4010; stale comments fixed.
- [ ] `docs/monorepo-overview.md` + root `CLAUDE.md` state the confirmed port map
      (staff-front :3016 · scheduling :4006 · ops :4010 · ops-front :3018).

## Note
Scheduling-port question RESOLVED by Porter 2026-07-20: scheduling-back = **:4006** (not 3001);
end-of-day scheduled task → :4006. Map baked into #4 above — no open questions; build to it.

## Implementation Notes
Config templates + docs only — **no logic changes**.

- **`smart-scheduler-back/.env.example`** — `OPS_API_URL` `:3002` → **`:4010`**.
- **`smart-scheduler-backoffice-front/.env.example`** — `NEXT_PUBLIC_BACKOFFICE_API_URL`
  `:3002/api` → **`:4010/api`** + comment "defaults to port 3002" → 4010.
- **`smart-scheduler-backoffice-back/.env.example`** — comment "scheduling API defaults to 3001" → **4006**
  (`PORT=4010` was already correct).
- **Root `CLAUDE.md`** — port table → `4006 / 3016 / 4010 / 3018` + a canonical-ports note line. Also
  corrected the contradictory backoffice-front cell ("— | 0% greenfield" → ":3018 | built (P&L + Items)")
  since leaving a real port next to "0%/—" was self-contradictory; matches board reality.
- **`docs/monorepo-overview.md`** — added a **"Canonical port map (confirmed by Porter 2026-07-20)"**
  callout (source of truth) + updated the tree, per-repo port tables, the mermaid diagram, and the dev-command
  comments (`:3001→:4006`, `:3000→:3016`, `:3002→:4010`, `:3100→:3018`). **Synced the canonical file to all
  4 repos' `docs/`** via `cp` (per the root CLAUDE.md doc-sync rule) so no repo carries stale ports.
- Left `smart-scheduler-front/.env.example` as-is (prod domain `som.develyst.online/api`, not a localhost port).

## Verification
- `grep` confirms the 4 real ports now appear across the synced `monorepo-overview.md` copies and no
  cross-service `.env` template still points at `:3002`. No code touched → no tsc/test needed for this task.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

- Minor: I also fixed the root CLAUDE.md backoffice-front "0% greenfield" cell to "built" while there (it
  was contradictory with the confirmed :3018 port). If you'd rather keep doc-maturity edits strictly in
  Porter's lane, revert just that cell — the port itself is correct either way.
  > answer (Sober): **Keep it.** It's a factual correction that matches reality Porter already established
  > (board + `project-understanding.md`: backoffice-front is NOT 0% — P&L + Items built). Leaving a real
  > port next to "0%/greenfield" was self-contradictory; fixing it while you were in the file is correct,
  > not scope creep. No revert.

## Review
**Verdict: DONE** ✅ (Sober, 2026-07-20). Config/docs only — verified by grep: both cross-service
templates now point at **:4010** (`OPS_API_URL`, `NEXT_PUBLIC_BACKOFFICE_API_URL`) and **no `.env`
template still references `:3002`**. Canonical port map (staff :3016 · scheduling :4006 · ops :4010 ·
ops-front :3018) written into `monorepo-overview.md` + root `CLAUDE.md` and synced to all 4 repos' `docs/`.
Staff-front left on its prod domain (correct). No logic touched → no test/tsc needed. Doc-consistency fix
(backoffice-front maturity cell) approved. No rework.
