# TASK-194: Render the rental marker on the cell — thread `hasRental` (FE)

- Source: TASK-190 (Jason put `hasRental` on the booking DTO). 🟢 **LOW** — lights up the calendar cell's 5th toggle
  item (`rental`), which has been intentionally inert since TASK-142. FE-only.
- Status: 🔴 **BLOCKED** (Fern 2026-08-25 — `hasRental` exists on no BE branch here; see Q1)
- Repo: **smart-scheduler-front**.

## What
- Thread **`hasRental: boolean`** onto the FE `Booking` type + `dtoToBooking` — **required** (per TASK-187's convention:
  a DTO-coalesced field is required so the mapper can't silently drop it; the BE always sends it, `contract.ts:180`).
- In `BookingCellBody`, when the **`rental`** toggle item is on **and** `booking.hasRental`, render the rental marker
  (icon + short label, same icon-not-emoji / text-not-colour-alone rules as the other cell dimensions). Nothing when
  `hasRental` is false or the toggle is off (AC-5 empty-is-nothing).

## DoD
- [ ] A booking with a rental shows the marker when the `rental` toggle is on; nothing otherwise.
- [ ] `hasRental` is required on the FE `Booking` type; the mapper sets it (guard from TASK-187 holds).
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` 0 · `bun run build` ok · no raw key.
- [ ] Rendered check rides @Tanya (the 375 rule: this adds one more optional line to the cell).

## Notes
(Fern fills in. The toggle item + slot already exist from TASK-142; this just gives it data + a marker. Keep it inside
the shared `BookingCellBody` so week and day stay identical.)

---

## 🔴 BLOCKED (Fern 2026-08-25) — `hasRental` is not on the wire anywhere
The task points at `smart-scheduler-back/src/types/contract.ts:180`, so I went to look rather than assume. On the
checked-out BE (`smart-scheduler-back@dong`, HEAD `d901dc7`):
- `grep -rn hasRental src` → **0 hits**;
- `git log --all -S'hasRental'` → **0 commits**, and a sweep of **every** local branch (`develop`, `dong`, `main`,
  `production`) finds it on none.

So **TASK-190 has not landed on any branch this checkout can see.** I can't thread a field that doesn't exist without
inventing the contract — the exact thing I've refused to do on voucher prices, trial prices and the booking DTO, and
for the same reason: a made-up shape compiles, ships, and is wrong.

**The moment it lands this is ~15 minutes** — `hasRental` onto `BookingDTO` + `Booking` (**required**, per TASK-187's
convention) + one line in `dtoToBooking`, then the marker in `BookingCellBody` behind the existing `display.rental`
flag, which has been wired and inert since TASK-142 precisely so this would be a one-place change.

## Questions
- **Q1:** where is TASK-190? Given I found my own TASK-187/191/192/193 sitting on **`dong3`** while the FE checkout is
  on **`dong`** (see today's log), the likeliest answer is that Jason's commit is on a branch this machine hasn't got —
  not that it's unbuilt. Worth confirming before anyone treats TASK-194 as merely "not done yet".

## Block cause CONFIRMED (Sober 2026-08-25)
Fern is right — grounded it in the BE tree: **`hasRental` is gone.** TASK-190 wrote it to the BE working tree but
agents never commit (git is the owner's), and the owner's revert+merge of the colleague's branch **wiped that
uncommitted change** (`grep hasRental src/` in scheduler-back → nothing; last BE commit `d901dc7`, no hasRental commit).
TASK-184's `PlanSessionRow`/plan-note and the DELIVERED REQ-036 core **survived** (committed), so the damage is limited
to hasRental. **PARKED with TASK-190** — do not thread the FE against a field that isn't there; both resume once
TASK-190 is redone AND the owner's branch churn has settled (redoing it into a tree that's still being reverted just
loses it again).
