# TASK-186: Course list — active / inactive filter, default active (REQ-036 Part B / B3) (FE)

- Source: REQ-036 Part B (owner's instruction, Porter 2026-08-25). 🟠 Medium. FE-mostly.
- Status: ⛔ **SUPERSEDED by TASK-188 (BE) + TASK-189 (FE) (Sober 2026-08-25)** — the owner overruled the binary: it's a **computed four-status field** (`CANCELLED→COMPLETED→EXPIRED→ACTIVE`), server-side, single source for badge+filter. This scaffolding's toggle/empty-states are reused by TASK-189; its client-side `isCourseInactive` predicate is replaced by the server `status`. Nothing to run here.
- Repo: **smart-scheduler-front**.

## What to build
- A course-list filter **active / inactive**, **defaulting to active**, so a cancelled course drops out of the
  everyday view but stays findable (this is what makes `ADMIN_ERROR` recoverable in practice).
- Build the toggle + the default-active view + the wiring now. Gate only the **predicate** on the owner's answer.

## ⛔ Blocked-for-the-predicate-only (owner's call, routed via Porter)
**What counts as `inactive`?** Porter's lean (his words): **cancelled + expired = inactive; a fully-used course stays
active until it expires** (a finished course is still a live relationship). **Do not assume it** — Porter routed this
to the owner. Until the answer lands, implement against a single well-named predicate
(`isCourseInactive(course)`) so swapping the definition is one function, and default the toggle to **active**.

## Definition of Done
- [ ] Toggle renders, defaults to active; a cancelled course is hidden under "active" and shown under "inactive".
- [ ] The inactive definition lives in **one** predicate, swappable when the owner answers (cancelled? expired?
      fully-used?).
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` 0 · `bun run build` ok · FRONTEND-STANDARD holds · no raw key.

## Notes
(Fern fills in. Depends on TASK-183 having threaded `endedAt` through the course type — `cancelled` in the predicate
reads that field. Sequence: TASK-183 first, then this.)

---

## Implementation Notes (Fern 2026-08-25)
**Scaffolding built; the predicate is deliberately incomplete, exactly as you scoped it.**

- 🆕 **`lib/scheduler/course-status.ts`** — `isCourseInactive(course)` and `filterByActivity(...)` kept side by side
  so the predicate and its application can't drift. The file's header states, in the code, that the definition is
  the owner's open call.
- **What ships today is the subset nobody disputes: a cancelled course is inactive.** Porter's lean (cancelled +
  expired; fully-used stays active) is written into the doc comment as the likely extension **but is not
  implemented** — it's a lean, not an answer. Cancelled-only is true under *every* candidate definition, so it can be
  **incomplete but never wrong**, and it already delivers B3's actual purpose: an `ADMIN_ERROR` cancellation stops
  cluttering the daily view while staying findable. When the answer lands, the two extensions are one line each,
  spelled out in the comment.
- **Toggle** (`SegmentedControl`) beside the search box, **defaulting to active**; changing it resets to page 1.
- **The empty state names which view is empty** — "no inactive courses" under the Inactive filter, rather than the
  generic "no courses", which under that filter would read as *"nothing was ever cancelled"* — a different claim.

**Evidence:** `bunx --package typescript@5.6.3 tsc --noEmit` **0** · `bun run build` **ok** ·
`bun test src/lib/scheduler/ src/services/` **40/0** · no raw key.

## Questions
- **Q1 (a real limitation, flagged rather than shipped quietly):** `GET /courses` has **no status param**
  (`validation.ts:140` — only `q`/`page`/`limit`), so the filter runs **client-side over the current page**. The
  toggle is correct, but the **counts are not**: `total` still counts both kinds, a page can render fewer cards than
  its limit, and an inactive course on page 3 won't appear under "Inactive" until you page to it. That is the
  "screen quietly lies" class we've been fixing all week, so I'm not calling B3 done on it. The fix is a server-side
  `status=active|inactive` on the list query — but it can only be specced **after** the owner defines `inactive`,
  since the server would need the same predicate. Worth cutting as one BE task **together with** the owner's answer,
  rather than twice.
