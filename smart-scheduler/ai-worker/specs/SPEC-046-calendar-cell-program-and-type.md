# SPEC-046: Calendar cell shows program + booking type (dual-colour, no collision)
- Source: REQ-052
- Status: ACTIVE (palette proposal → Porter sign-off gates the FE visual — see §Palette)

## Overview + Q3 answered (data shape)
Mostly FE, plus **one small BE field**. Grounded:
- **Program + type are ALREADY on the Booking DTO** (`types/app/scheduler` `Booking.subject`, `.bookingType`).
  The **day view already renders both** — `CalendarGrid.tsx:119-122` shows `studentName` · `subject` ·
  `t(bookingType.*)`. So AC-4 (day view, full program) is essentially already met.
- The **week view does NOT** — `CalendarWeekGrid.tsx:120-122` shows only `startTime` + `studentName`. That
  is the real work.
- 🔴 **`nickname` is NOT on the Booking DTO** — both grids render `studentName` (full). The owner's Q2 answer
  is **nickname**, so the weekly cell needs the student's nickname → **add `nickname` to the Booking DTO**
  (BE mapper joins `students.nickname`). Small, additive.

## 🔴 The design knot (why this needs a real design, not a colour pick)
`BOOKING_STATUS_COLOR` already uses **all six** semantic tokens: PENDING=warning, CONFIRMED=primary,
ATTENDED=success, NO_SHOW/PENDING_RESCHEDULE/CANCELLED=danger, EXTENDED=secondary, SICK_LEAVE=default. So a
booking **type** cannot take a *different semantic hue* without either colliding with a status or inventing
new tokens. The existing `BOOKING_TYPE_COLOR` (FIRST_TRIAL=warning, COURSE_PACKAGE=primary, …) **already
collides** with status — which is exactly the owner's "is this green a status or a type?" fear, and the
owner's own examples (`first trial = red` = danger, `course = dark green` ≈ success) collide too.

**Resolution — disambiguate by CHANNEL + TEXT, not by hue.** The reader must never rely on hue to tell
status from type:
- **Status stays the load-bearing signal** (unchanged): the StatusChip (icon + label + its semantic colour,
  REQ-041/TASK-129) and whatever card tint exists today.
- **Type becomes a distinct secondary channel:** a **thin leading edge-stripe** on the card (a different
  visual place than the status chip/fill) in a **dedicated type-token palette** (NOT the semantic set), plus
  the **type text label always present** (AC-1/AC-8: colour is redundant reinforcement, never the carrier).
- Because status lives in the chip/fill and type lives in the edge-stripe + a labelled dot, "which colour is
  which" is answered by **position and text**, not by memorising hues — so even a near-identical hue can't be
  confused (AC-5), and greyscale/colour-blind readers lose nothing (AC-8).
- The **legend names both dimensions** (AC-9): a status row (existing) + a new type row.

## Palette (revised 2026-08-17 after the token-level collision check — Porter/owner sign off the rendered look)
🔴 **Token-level check done** (`src/lib/ui/colors.ts` `MANTINE_COLOR`): status consumes **six** Mantine
families — `default=gray` (SICK_LEAVE), `primary=blue` (CONFIRMED), `secondary=grape/violet` (EXTENDED),
`success=green` (ATTENDED), `warning=orange` (PENDING), `danger=red` (NO_SHOW/RESCHEDULE/CANCELLED). My first
proposal collided on **three** of four (amber≈orange, slate≈gray, violet≈**grape**) — Porter caught two, and
trial-amber≈orange was a third. **Revised to free families** (none of gray/blue/grape/green/orange/red):
- `first-trial` → **pink**
- `single-session` → **cyan**
- `course` → **teal**
- `voucher` → **indigo** (moved off violet — violet **is** `secondary/EXTENDED`)
Added to the one token source as `--booking-type-*` (FRONTEND-STANDARD §3.5, no inline hex). **One pair to
eyeball:** `cyan` vs `teal` are adjacent — if they don't read as distinct on screen, move `single-session` to
`pink`-family and `first-trial` elsewhere. Since type is also carried by the **edge-stripe channel + the text
label**, hue proximity is a polish concern, not a correctness one.

**🔴 Rendered comparison produced** (`project-docs/req-052-palette-comparison.html`, accurate Mantine shade-6
hexes, both themes). It shows the honest finding: **the wheel is full** — status uses 6 families, so at
saturated shade 6 the type hues have real near-pairs (indigo≈blue, teal≈green, pink≈red, cyan↔teal). **So
the stripe is a QUIET muted tint** (shade 2 light / shade 8 dark), not the saturated hue — a different
*loudness* as well as a different *place* than the status chip. That plus the always-shown text label is
what separates them; hue-distance is not relied on. This refines the mechanism (muted stripe) and is the SA
decision; the exact hues remain the owner's eye on the real calendar (Tanya's 375px pass).

**Two gates before the FE build (Porter's conditions, both are on-screen checks I cannot composite headless):**
1. the four type hues vs the **rendered** status hues (the token check above rules out same-family collisions;
   the on-screen confirmation is the last 5%), and 2. **both themes** (a "quiet marker" invisible in dark mode is
   not a marker — the REQ-041 lesson). These render for **@Tanya / the owner** (Porter said the owner will look).
The *mechanism* (edge-stripe + dedicated tokens + always-a-label) is the SA decision; the final hues are the
owner's eye. **TASK-142's visual waits on that look.**

## Cell layout (both views)
- **Week cell** (`CalendarWeekGrid`): line 1 `{time} {nickname}`, line 2 `{type} · {program}` (Porter's
  reading order), + the type edge-stripe. `tabular-nums` on the time (REQ-041). **AC-3 (the standard we hold
  ourselves to):** measured at **1440 / 768 / 375** — 0 truncated labels, 0 clipped cells, no page h-scroll,
  and the **type label is never the thing that gets cut** (if space forces a trim, the program shortens, per
  REQ req 4; the full program shows in the day view + booking detail).
- **Day view** (`CalendarGrid`): already shows student · subject · type — add nickname + the same type
  edge-stripe for consistency; keep the **full** program name (AC-4).

## Wording (from REQ-052; via `t(...)`, TH+EN — AC-7)
Type labels — short (week) / full (day) — TH `ทดลอง/เรียนทดลอง · คาบเดี่ยว/คาบเดี่ยว(เก็บเงิน) · คอร์ส/คาบในคอร์ส ·
บัตร/ใช้บัตร` · EN `Trial/First trial · Single/Single session · Course/Course session · Voucher/Voucher
session`. **Program = its own name, no invented abbreviations** (REQ); if too long for the week cell it
shortens by truncation-with-full-in-detail, never a new short vocabulary.

## Out of scope (owner deferred, not rejected)
The `สถานะ > ประเภท` / `ประเภท > สถานะ` **view-mode switch** — Porter's call: ship the dual-colour cell
first; the switch (a persisted preference + a toolbar control) is a follow-up REQ if still wanted after real use.

## Regressions (AC-6)
Status legend, the `ประเภท` filter, click-through to the booking, and REQ-041 conformance (tabular-nums,
one date format, instant focus ring) all unchanged.

## Tasks
- **TASK-141 (BE, Jason)** — add `nickname` to the Booking DTO (mapper joins `students.nickname`); no schema
  change (nickname already on `students`). Update the contract type + FE `Booking` type. Small.
- **TASK-142 (FE, Fern)** — week cell shows `{time} {nickname}` / `{type} · {program}` + the type
  edge-stripe/labelled marker; day cell gains nickname + the same marker; the dedicated `--booking-type-*`
  tokens in the token source; legend names status **and** type; measured at 1440/768/375 (AC-3). **Gated on
  Porter's palette sign-off** (§Palette). Depends on TASK-141 (nickname). Self-run `hallmark` before REVIEW.

## Questions
- **To Porter:** sign off the type palette (§Palette) — the mechanism is set (edge-stripe + labelled dot +
  dedicated tokens, so no status/type hue collision); only the four hues need your (the owner's) eye before
  Fern builds TASK-142.
