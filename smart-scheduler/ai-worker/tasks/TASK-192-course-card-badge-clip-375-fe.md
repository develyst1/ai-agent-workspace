# TASK-192: Course-card status/lock badges clip to "AC…"/"LO…" at 375px (FE)

- Source: Tanya rendered pass (via Porter) 2026-08-25. 🟢 **Cosmetic, low** — shipped knowingly on uat; both chips are
  present and correct, they just truncate at the narrowest width. REQ-036 B3 polish.
- Status: ✅ **FE DONE (Sober 2026-08-25)** — tsc 0·build ok; wrap + shared NO_TRUNCATE, nothing merged/icon-only. 375 rendered check rides @Tanya.
- Repo: **smart-scheduler-front**.

## What
On the course list at **375px**, the four-status badge and the separate Locked chip truncate to **"AC…" / "LO…"** —
both are present (not a logic bug), the label is just cut. Give the chips room at 375 (wrap, shrink the surrounding
padding, allow a 2-line row, or a shorter TH label at that breakpoint) so the status reads in full. Do **not** merge the
lock chip into the status (it's orthogonal — TASK-189) and don't drop to an icon-only chip (REQ-052 AC-8/REQ-041: a
label must be readable as text, not colour/icon alone).

## DoD
- [ ] At 375px the status badge and lock chip read in full (no "AC…"/"LO…"); both still present; no h-scroll.
- [ ] 1440/768 unaffected. `bunx --package typescript@5.6.3 tsc --noEmit` 0 · build ok · no raw key.
- [ ] Rendered check rides @Tanya.

## Notes
(Fern fills in. 375 is the primary case, per the standing rule.)

---

## Implementation Notes (Fern 2026-08-25)
Two causes, both fixed, neither by dropping information:
1. **The chips were competing with the title for one line.** The row is now `flex-wrap` with the chip group
   `shrink-0` — at 375 the chips **wrap** under the title instead of being squeezed.
2. **Mantine `Badge` ellipsises its own label** — FRONTEND-STANDARD §2 names this exact trap, and `NO_TRUNCATE`
   already existed in `BookingBadges.tsx` for it. I **exported** it (it was file-private) and applied it to the
   status, lock and special-unlock chips, so the label can't clip even when the row is tight.

**Explicitly not done, per the task:** the lock chip is **not** merged into the status (orthogonal — TASK-189), and
nothing went icon-only (a label must be readable as text, not colour or icon alone — REQ-052 AC-8 / REQ-041).

**Evidence:** `bunx --package typescript@5.6.3 tsc --noEmit` **0** · `bun run build` **ok** · §3.5 **0/0/0/0**.
🔴 Rendered at 375/768/1440 → @Tanya (the widths are the whole point of this one).
