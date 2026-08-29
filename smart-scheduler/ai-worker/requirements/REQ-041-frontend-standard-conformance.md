# REQ-041 — Bring frontoffice-front UI up to FRONTEND-STANDARD.md (hallmark conformance)

- **Status:** READY_FOR_SA
- **Source:** Stakeholder (owner), 2026-08-11 — off a **professional frontend engineer**'s (`neeeeroooo`) rework of
  `smart-scheduler-front@dong` and Tanya's audit of it. The engineer is the bar; this REQ is how **Fern learns the
  standard hands-on and surpasses it.**
- **Standard:** the workspace-root **`FRONTEND-STANDARD.md`** (the checklist). Repo: `smart-scheduler-front` (branch
  `dong`, both commits present). Design ref: `.agents/skills/hallmark/` (`audit` verb).

## Why
Tanya audited the reworked screens against our new standard: functionally `TEST_PASSED` (no regressions, DEF-1 closed),
but the hallmark verdict is **`close, fix the minors` — 0 critical · 7 major · 2 minor**. Crucially, **even the
engineer's own commit does not clear our §3 Definition of Done** — **§3.3** (the `:focus-visible` ring animates) and
**§3.5** (inline hex / `transition-all` must be zero — currently **4 + 4**) both fail. The standard applies to everyone;
this REQ closes the gap so the FE actually passes it. Evidence: `tests/TEST-DONG-fe-rework-retest-and-hallmark-audit.md`.

## Scope — the ranked punch-list (cheap-first; Tanya's file has file/line for each)
1. **One token source.** Kill the Tailwind colour scale running in parallel with the Mantine theme
   (`bg-default-*` etc. across ~26 files) — route colour through one system. Biggest blast radius; do first.
2. **4 inline hex → a token.** `bg-[#f5f7fb]` in login + checkin (×2) + AdminLayout → one `--color-paper`.
3. **Kill `transition-all` + never animate the focus ring.** 4 sites (Sidebar, CalendarGrid ×2, CalendarWeekGrid) +
   the row-action control's `transition-property: all`. **(2 + 3 clear §3.3 and §3.5 — the two DoD gates.)**
4. **`tabular-nums`** on every numeric / date / time / count / price column (currently 0/20).
5. **One date formatter for every table.** Bookings still renders ISO `2026-08-13`; unify to `DD/MMM/YY`.
6. **Heading type pairing** — a display face distinct from the body. ⚠️ **BLOCKED on the owner's font decision**
   (needs a **Thai-capable** display face — a design call, not a code fix). Porter to bring options. **Hold this item;
   ship 1–5, 7, 8 without it.**
7. **Status chip carries shape/icon, not hue alone** (a11y + hallmark).
8. **44 px hit target on phone** — the Voucher "Manage" button is 30 px at 375.

## Acceptance
On the reworked screens + every file this REQ touches, `FRONTEND-STANDARD.md` **§3 Definition of Done passes**:
- hallmark `audit` verdict better than *"reads as AI-generated"*, with the 7 majors above resolved (item 6 excepted
  while its font decision is pending);
- **§3.5 grep = 0** inline hex / `font-family` / `transition-all`; **§3.3** focus ring is instant (no transition);
- `tabular-nums` present on numeric/date columns; one date format app-wide; one colour token source.
- No functional regression (Tanya re-verifies against her `dong` retest set).

## Questions
- **Bulk-confirm** was not exercised in the retest (no selectable rows in the filtered set); it's already `TEST_PASSED`
  on `sid` — **not blocking**, re-check opportunistically.
- **Item 6 font:** Porter is bringing 2–3 Thai-capable display-face options to the owner; item 6 stays held until picked.

→ **@Sober** — please pick up REQ-041 (READY_FOR_SA): SPEC + TASK(s) for **Fern**, hold item 6 pending the font call.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| REQ-041 item 6 | scheduler-front (FE): heading type-pairing (display face ≠ body) | REQ-041 | ⏸️ **HELD** — needs owner's **Thai-capable display-face** pick (design call, Porter bringing options); ship 1–5,7,8 without it | Fern | owner font call |
```
