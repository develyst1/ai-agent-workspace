# TASK-142: Calendar cell — program + type + note, under one display toggle (FE)
- Source: SPEC-046 (REQ-052 amended) **+ SPEC-063 (REQ-068)** — 🔄 **RE-CUT 2026-08-23** so the cell is built ONCE.
- Status: ✅ **FE code ACCEPTED (Sober 2026-08-25)** — tsc 0 · build ok · 40/0; dedicated type tokens, one shared cell, note wired. Pending @Tanya rendered pass (AC-3 @375 first + Q2 day/week channel). Q1 → TASK-190 (BE `hasRental`) so the 5th toggle lights up; rental interim-inert.
- Assignee: @Fern (FE)
- Depends on: TASK-141 (nickname — done) · **TASK-178** (the `attendeeNote` on the Booking DTO) · palette sign-off
  (done: icons only, no emoji).

## 🔄 RE-CUT scope (2026-08-23) — read this first; the section below is the original REQ-052 detail, still valid
The cell now carries **program + booking type (REQ-052) AND the session note (REQ-068)** in **one** component, and
everything beyond time+name sits behind a **display toggle** so the cell cannot bloat:
- **Always shown, not toggleable:** `time · name(nickname||studentName)`.
- **Display toggle — a fixed FIVE-item set, default ALL ON, display-only** (no filtering of bookings, no data
  change; persist the choice as an FE preference): **booking type · program · badge · note · rental.**
  ⚠️ **Exactly those five** — adding a sixth is a new decision, not an assumption.
- **Note (REQ-068):** render `booking.attendeeNote` when present (from TASK-178's DTO); nothing when absent (AC-5).
- **Icons only, no emoji (REQ-052 AC-9):** the type marker is an icon **component** + the type **as text**; status
  stays primary (StatusChip unchanged). An icon never carries meaning alone.
- **AC-7 (new, REQ-052):** with everything ON a cell shows time·name·type·program·badge·note·rental and still meets
  the responsive standard below (program shortens first, never the type label).
- Everything in the original scope below (dual-colour edge-stripe, legend naming both dimensions, day view keeps the
  full program, 1440/768/375) **still holds** — this re-cut adds the note + the toggle to it, it does not replace it.

## Original scope (SPEC-046 / REQ-052 — still in force)
- Source: SPEC-046 (REQ-052)
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

## SA go-ahead (Sober 2026-08-25)
All deps met: TASK-141 (nickname) closed no-change, TASK-178/184 put `attendeeNote` on the booking DTO, palette signed.
**Data path pre-verified so you don't lose a cycle to the mapper trap that bit this feature four times:**
`booking.attendeeNote` **does** reach the calendar cell — BE `getCalendar` → `toBookingDTO` (`db/mappers.ts:109`), FE
flatten `lib/api/mappers.ts:27`, type `types/app/scheduler/index.ts:141`. So AC (render note when present) is wired;
just consume it. Two reminders: use the **pinned** `bunx --package typescript@5.6.3 tsc --noEmit` (env's `latest` tsgo
panics), and **375px is the primary AC-3 case** — you're adding a 2nd line + stripe + note to the narrowest cell.

## Implementation Notes / Questions
(Fern fills in.)

---

## Implementation Notes (Fern 2026-08-25)
**`smart-scheduler-front@dong`, uncommitted — 9 files (3 new).** Built as ONE cell, per the re-cut.

### The two dimensions, kept apart
- 🆕 **`--booking-type-*` tokens** in `globals.css` — a **dedicated** four-hue set (fuchsia · teal · indigo ·
  amber). **Deliberately none of the semantic status hues**: a cell shows status *and* type at once, so sharing a
  colour makes one of them unreadable. The **type text label is always present** — colour is redundant
  reinforcement, never the carrier (AC-1/AC-8, and REQ-041's a11y rule). **Icons, never emoji** (AC-9), and the icon
  never carries the meaning alone.
- 🆕 **`BookingCellBody`** — everything beyond `time · name`, in **one** component used by both grids, so the week
  and day cells can't drift into two different cells. Ordering encodes AC-3: **the program shortens first, the type
  label never does** — the type is what changes what a session *means* commercially.
- **Week cell:** line 1 `time(tabular-nums) · nickname||name` with the status dot, plus a **leading edge-stripe** in
  the type hue; line 2 `type · program`; then badge and note.
- **Day cell:** 🔴 **a design call I want on the record.** Its left stripe was **already status** (it predates
  REQ-052). Adding a second stripe for type would have put two stripes on one card and made **neither** readable —
  the exact collision REQ-052 exists to prevent. So the day cell gives type its own channel: **icon + type-hued
  label**. Same two dimensions, no fight. It also keeps the **full** program (AC-4) and now shows the note.
- **Legend names both dimensions** (AC-9) — a legend explaining only status teaches staff that the other channel is
  decoration.

### The display toggle
🆕 `useCellDisplay` + `CellDisplayMenu`: the **fixed five** (type · program · badge · note · rental), **default all
on**, persisted in `localStorage` like the language toggle. **Display-only — none of it filters bookings**, which is
the distinction that matters: a "filter" silently removing sessions from a calendar would make the screen lie about
what is booked. Saved preferences are **merged over the defaults**, so a preference stored before a field existed
can't leave that field permanently hidden.

### 🔴 One item of the five has no data behind it
**`rental` is inert.** I checked the wire rather than assume: `toBookingDTO` carries **no** rental marker (grep for
rental in the BE booking mapper/contract → nothing), so there is nothing for the cell to render. The toggle item
exists because the re-cut fixes the set at five and dropping one is as much a decision as adding a sixth — but it
currently shows nothing. **Q1** has the shape.

**Evidence:** `bunx --package typescript@5.6.3 tsc --noEmit` **0** · `bun run build` **ok** ·
`bun test src/lib/scheduler/ src/services/` **40/0** · §3.5 on all four changed/new components **0/0/0/0** · no raw key.
🔴 **AC-3 (1440/768/375) NOT measured** — headless pane. → @Tanya. **375 is the case that matters**: this adds a
second line + stripe + note to the narrowest cell, and the rule to check is that when space runs out the **program**
shortens and the **type label** never does.

## Questions
- **Q1 (`rental`, small):** the booking DTO has no rental indicator, so that toggle item renders nothing. Either a BE
  field (e.g. `hasRental: boolean` on `toBookingDTO`, cheap — rentals already carry the booking as `refId`), or the
  re-cut drops it to four. I did **not** silently remove it: the set being exactly five was an explicit instruction.
- **Q2 (day-cell stripe):** flagging the design call above so it's yours to overrule — if you'd rather the day cell
  carry the type stripe and move **status** to a dot (matching the week cell), that's a small change and arguably
  more consistent; I chose not to alter a status affordance staff already read.

## Review — ✅ code accepted (Sober 2026-08-25)
Reproduced tsc 0 · build ok · 40/0. One shared `BookingCellBody` (week+day can't drift), dedicated `--booking-type-*`
tokens (fuchsia/teal/indigo/amber — none of the status hues, so status+type never fight for a colour), type label
always present (colour is reinforcement, AC-1/AC-8), toggle is the fixed five persisted like the language pref and
**display-only** (never filters bookings — right; a filter that hides sessions would make the calendar lie), note wired
off the pre-verified path, prefs merged over defaults so a new field can't stay hidden. Good.

**Q1 (rental inert) — keep the five, wire the data.** Dropping to four contradicts the explicit five-item decision, and
rental is a real thing staff want on the cell. Cut **TASK-190 (BE)**: `hasRental` on `toBookingDTO` so the toggle item
renders something. Ship 142 now; rental is interim-inert, not wrong. Do NOT silently drop it (you were right not to).

**Q2 (day-cell type channel) — ACCEPT your call.** The day cell's stripe was already *status* (predates REQ-052);
adding a type stripe = two stripes = the exact collision REQ-052 fights. Giving type its own icon+label channel there
is correct, and I won't destabilise a status affordance staff already read for the sake of week/day symmetry. **But
whether the week(status-dot+type-stripe) vs day(status-stripe+type-icon) difference confuses a staffer switching views
is a *rendered* question** — flag it for @Tanya's pass; if she finds it jarring we revisit, headless can't judge it.

**AC-3 (1440/768/375) → @Tanya, 375 first** — this stacks a 2nd line + stripe + note on the narrowest cell; the rule is
program shortens, type label never does.
