# TASK-199: Drop / resume course — action + `DROPPED` badge (FE)

- Source: TASK-196 design. 🟠 MEDIUM. **Depends on TASK-198** (the drop/resume endpoints + `DROPPED` status). On `develop`.
- Status: **REVIEW** (Fern 2026-08-28 — badge + 5th chip rode the TASK-189 seam; drop/resume dialog + status-driven write gating)
- Repo: **smart-scheduler-front**.

## What
- **`DROPPED` badge** — thread `droppedAt`/`dropReason` are not needed; the badge reads the server `course.status`
  (TASK-189 seam), so `DROPPED` → a "พักคอร์ส" badge slots in **for free** beside the four. Add the label + colour.
- **A `พักคอร์ส` (drop) action** on the course card/plan → confirm dialog (names the student + how many sessions come
  off the schedule; **reuse the `/cancel/preview` pattern** if a `/drop/preview` exists, else confirm plainly) →
  `POST /courses/:id/drop`.
- **A `กลับมาเรียน` (resume) action** on a dropped course → a small form for the **new expiry date** → `POST
  /courses/:id/resume {expiryDate}`; surface `SLOT_TAKEN` clashes from the regeneration as the server states them.
- **The status filter gains a fifth chip** (`DROPPED`), driven by the server counts (TASK-189) — no client recount.
- Write actions (add/extra) are already hidden/guarded for non-active courses; make sure `DROPPED` hides them too and
  surfaces `409 COURSE_DROPPED` gracefully.

## DoD
- [ ] A dropped course reads `พักคอร์ส` on card + plan; the filter has five chips whose counts sum to total.
- [ ] Drop → confirm → the course leaves the schedule; Resume → new-expiry form → it returns on its own slot.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` 0 · `bun run build` ok · no raw key. Rendered rides @Tanya.

## Notes
(Fern fills in. Reuse the REQ-036 dialog + the TASK-189 status/filter seam — this is mostly wiring two endpoints into
patterns that already exist.)

---

## 🔴 Defect + fix (Fern 2026-08-28) — the raw key was mine
**Attribution, per the owner's new standing rule: this defect is mine, introduced in this task.**

**What shipped:** the pause button rendered the literal `endCourse.drop` to staff on `sid`.

**Cause:** I added the twelve drop/resume strings by anchoring on `ended: "Cancelled"` — which lives in the
**`course:`** block — while `DropResumeDialog` and `PlanModal` read them from **`endCourse.*`**. The keys existed, in
both languages, in the wrong parent. `tsc` passed, the build passed, and the dictionary was valid TypeScript;
`t()` returns the key when it misses, so the failure mode is a screen that looks fine to everything except a human.

**Fix:** moved all 12 EN + 12 TH keys into the `endCourse` block the components actually read. No component churn —
I didn't rename call sites while fixing a live defect.

### 🆕 The guard, because this is the second time a "looks fine to the compiler" bug reached staff
`src/lib/i18n/keys.test.ts` walks **every literal `t("…")` in `src/`** and resolves it exactly as `t()` does, in
**both** languages — a key present in EN but missing in TH is the same bug for a Thai-speaking user, which no manual
check would reliably catch.

🟢 **Proved it bites:** deleted `endCourse.drop` again and re-ran — the test failed naming
`PlanModal.tsx → endCourse.drop (en)`; restored, green. Same discipline as TASK-172's request-body guard.

**Known gap, stated rather than hidden:** it can only check **literal** keys. Templated ones
(`t(\`course.status.${s}\`)`) are invisible to it. Those are the smaller risk — the enum types constrain them — but
they are not covered, and I'd rather say so than let a green test imply more than it checks.

**Evidence:** `bunx --package typescript@5.6.3 tsc --noEmit` **0** · `bun run build` **ok** · full suite green ·
guard demonstrated failing and restored.
