# TASK-142: Calendar cell — program + type, dual-colour (FE)
- Source: SPEC-046 (REQ-052)
- Status: TODO
- Assignee: @Fern (FE)
- Depends on: TASK-141 (nickname on the Booking DTO) · **Porter's palette sign-off** (SPEC-046 §Palette)

## What to do (smart-scheduler-front)
0. **Nickname is now FE-only** (TASK-141 found the BE already carries `student.nickname`): carry it through the
   flatten at `src/lib/api/mappers.ts:13` (`nickname: dto.student.nickname`) and render `nickname || studentName`
   in the cells. No BE dependency — TASK-141 is closed as no-change.
1. **Week cell** (`CalendarWeekGrid.tsx:120-122`): render line 1 `{time} {nickname}`, line 2
   `{type} · {program}` (`t(bookingType.*)` short form + `booking.subject`). `tabular-nums` on the time.
2. **Type marker (the dual-colour, no collision):** a **thin leading edge-stripe** on the card + a labelled
   marker, coloured from a **dedicated `--booking-type-*` token set** (NOT the semantic status hues) added to
   the token source. **Status stays the primary signal** (StatusChip unchanged). The **type text label is
   always present** — colour is redundant reinforcement (AC-1/AC-8). Do NOT reuse a status hue for a type.
3. **Day cell** (`CalendarGrid.tsx:119-122`): already shows student · subject · type — add `nickname` + the
   same edge-stripe marker; keep the **full** program name (AC-4).
4. **Legend:** add a **type** row alongside the existing status legend (AC-9) — names both dimensions.
5. **AC-3 (the standard):** measured at **1440 / 768 / 375** — 0 truncated labels, 0 clipped cells, no page
   h-scroll; if space forces a trim the **program** shortens, never the type label (full program in day view
   + detail).
6. Type labels via `t(...)`, TH+EN short/full (SPEC-046 §Wording). No invented program abbreviations.

## Definition of Done
- [ ] Week cell shows student(nickname) · program · type, type readable as **text** not just colour. (AC-1)
- [ ] Four types distinguishable at a glance without opening the booking or the legend. (AC-2)
- [ ] 1440/768/375: 0 truncated / 0 clipped / no page h-scroll; type label never the cut one. (AC-3)
- [ ] Day view shows the full program. (AC-4)
- [ ] A `ลา`/`ขยายคาบ` session shows status AND type, un-confusable. (AC-5)
- [ ] Greyscale/colour-blind: type identifiable from text alone; no status hue reused for a type. (AC-8)
- [ ] Legend names status **and** type. (AC-9)
- [ ] Status legend / `ประเภท` filter / click-through / REQ-041 conformance unchanged. (AC-6)
- [ ] Type + program labels bilingual, no raw key. (AC-7)
- [ ] **Identity never blank** (Porter): a cell must **never** render an empty slot or `-` where the child's
      name/nickname goes — fall back nickname→name (TASK-141 already does BE-side). An empty name reads as a system error.
- [ ] **375 px is the PRIMARY AC-3 case, not the afterthought** (Porter) — we're adding a 2nd line + a stripe to the
      narrowest cell on the product, and REQ-041 closed "0 truncated" only days ago. Tanya's pass treats 375 first.
- [ ] `bunx tsc --noEmit` 0 · `bun run build` ok · FRONTEND-STANDARD holds (type tokens in the source, no
      inline hex) · self-run `hallmark audit`, paste verdict + per-AC notes.

## Implementation Notes / Questions
(Fern fills in. ⚠️ Do NOT start the visual until Porter signs off the palette — the mechanism is fixed,
the four hues are the gate.)
