# TASK-189: Badge + filter off the ONE server `status` (REQ-036 B3, owner-ruled) (FE)

- Source: REQ-036 B3 (owner-ruled four statuses). 🟠 Medium. **Depends on TASK-188** (the `status` field). **Supersedes
  the client-side predicate in TASK-186** — reuse its toggle/empty-state UI, replace its brain.
- Status: ✅ **FE DONE (Sober 2026-08-25)** — tsc 0 · build ok · 40/0; badge+filter+counts read the ONE server field, client predicate deleted, leave-lock kept separate. Nit: dead `isCourseEnded` helper → fold into TASK-187. Rendered rides @Tanya. **B3 complete → REQ-036 fully code-complete.**
- Repo: **smart-scheduler-front**.

## What to build
- **Badge renders the server `status`** — `CANCELLED` (ยกเลิกแล้ว) · `COMPLETED` (จบแล้ว) · `EXPIRED` (หมดอายุ) ·
  `ACTIVE` (ปกติ). **Rip out the FE's own "over"/`ปกติ` computation** — that separate compute is the exact reason a
  cancelled course showed green (Porter). The badge now reads one field; it does not re-derive lifecycle.
  - Reconcile with TASK-183: the CANCELLED badge now comes from `status`, not a separate `isCourseEnded` branch — one
    source. **Keep the leave-lock / special-unlock indicator separate** (it's quota state, orthogonal to lifecycle) —
    don't conflate, but lifecycle "over/ปกติ/หมดอายุ" must come from the server `status`, never a re-compute.
- **Filter is the four statuses** (not a binary), defaulting to **ACTIVE**. Reuse TASK-186's `SegmentedControl` +
  empty-state-names-the-view; drive it from `GET /courses?status=…` so the **counts are the server's** (TASK-186 Q1:
  the client-side filter miscounted across pages).
- **AC-B6 visible:** the four filtered counts sum to the unfiltered total — surface the counts from the BE, don't
  recount client-side.
- Bilingual via `t(...)`, no raw key.

## Definition of Done
- [ ] Badge shows the right one of four from the server `status`; a cancelled course reads ยกเลิกแล้ว, a used-up course
      จบแล้ว, an expired-with-sessions-left course หมดอายุ.
- [ ] Filter defaults to ACTIVE; switching filters queries the server; counts are the server's and sum to total.
- [ ] The old client-side `isCourseInactive`/`course-status.ts` predicate is removed (superseded), not left to rot.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` 0 · `bun run build` ok · FRONTEND-STANDARD holds · no raw key.
- [ ] Rendered verdict → rides @Tanya.

## Notes
(Fern fills in. The whole point is ONE source of "what state is this course" — the server `status`. If you find yourself
computing "is it over" on the client again, stop: that's the bug this task exists to kill.)

---

## Implementation Notes (Fern 2026-08-25)
**`smart-scheduler-front@dong`, uncommitted — 6 files, and one file deleted.**

### The badge now reads one field; nothing re-derives lifecycle
`status` threaded `CourseSummary` → `CoursePackageView` → `dtoToCourseView`, **required on the view**, and the badge
renders `t(\`course.status.${c.status}\`)`. **The FE's own "over / ปกติ" computation is gone** — including TASK-183's
`isCourseEnded` branch on this card, which was a *second* source and therefore the same class of bug even though it
was right. One field, one answer.

🔴 **What I deliberately did NOT collapse:** the leave-lock / special-unlock indicator. It is **quota** state, not
lifecycle — a locked course is still `ACTIVE` — so they now render **side by side** rather than as one chip fighting
for the same slot. Collapsing them would have re-created the original sin in a new place: a badge that means two
things and can only show one.

### Filter
Four statuses (not a binary), defaulting to **ACTIVE**, driven by **`GET /courses?status=…`** — so paging and totals
are the server's. **TASK-186's client-side predicate is deleted** (`lib/scheduler/course-status.ts` removed, not left
to rot), which also closes **TASK-186 Q1**: the miscount across pages I flagged is gone because the filtering moved to
where the data is.

**AC-B6 is visible, not just true:** each chip shows the server's own count (`ปกติ (12)` …), taken from the response's
`counts` — computed over the search-filtered set *before* paging, so the chips say what switching would actually find
and the four sum to the unfiltered total. **I do not recount client-side**; a second count is the exact disagreement
this task exists to remove.

Empty state names the state (`ไม่มีคอร์สที่หมดอายุ`), because a generic "no courses" under an EXPIRED filter reads as
a different claim.

**One honest note on the offline path:** `toCourseView` (mock/offline only) sets `CANCELLED` or `ACTIVE` — the only
thing that shape actually knows. It does **not** guess COMPLETED/EXPIRED; inventing them there would be the very
re-derivation this task kills, and it's commented as such.

**Evidence:** `bunx --package typescript@5.6.3 tsc --noEmit` **0** · `bun run build` **ok** ·
`bun test src/lib/scheduler/ src/services/` **40/0** · §3.5 **0/0/0/0** · no raw key ·
grep for `isCourseInactive|filterByActivity|course-status|course.normal|isCourseEnded` in the panel → **zero hits**.
🔴 Rendered verdict → @Tanya. Worth checking specifically: a **cancelled** course (red + reason), a **used-up** one
(จบแล้ว), an **expired-with-sessions-left** one (หมดอายุ), and that a **leave-locked ACTIVE** course shows *both*
chips — that last one is the case where a careless merge would have hidden the lock.
