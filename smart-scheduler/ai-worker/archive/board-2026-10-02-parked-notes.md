# Parked board prose — 2026-10-02 sweep

> Prose that was shortened out of a `board.md` cell on 2026-10-02 (Marie ORDER 15.1) and that
> **belongs to no single TASK/REQ file**, because the row has no file of its own.
> **Nothing here was deleted — it was moved.** The live cell now points at this file.
> The whole board as it stood before the sweep is `archive/board-2026-10-02-pre-sweep.md` (verbatim).
>
> Same pattern as `archive/board-2026-09-29-parked-notes.md` and the 08-29 / 09-23 sweeps.
>
> ⚠️ **TASK-606 and TASK-607 have NO `tasks/TASK-*.md` file** — they were boarded straight from
> @Sober's diagnosis on 2026-10-02 and never cut as TASKs. Their full diagnosis existed **only**
> in the board cell, so it is parked here rather than re-homed. **Writing a TASK file is the SA's
> act, not Porter's**, which is why one was not created. When Silver or Sober cuts them, the text
> below is the source.

## Row with no id — `line()` vs `extra()` (candidate 4 of @Jason's TASK-325 Question)

Verbatim, as it stood at `archive/board-2026-10-02-pre-sweep.md` line 174:

```
| — | BE: **`line()` vs `extra()` — nine branches choosing a LABELLING CONVENTION by hand** (`TASK-257 §3`) | @Jason’s TASK-325 Question (candidate 4) | ⛔ **HELD until after the `uat` round** · 🔑 **the better next task — same mechanism as `§16.3`, and it already has a defect history (`จำนวนคาบที่ยืนยัน` under eight English labels)** · ⚠️ **it changes VISIBLE labels on three messages and @Tanya is about to read them** | — |
```

## TASK-606 — BE: the Daily report cannot agree with the schedule

Verbatim, as it stood at `archive/board-2026-10-02-pre-sweep.md` line 220:

```
| TASK-606 | BE: **the Daily report cannot agree with the schedule** | (Tanya, via @Porter; diagnosed by @Sober) | ⏸️ **DIAGNOSED, sized S, NOT dispatched** — 🔴 **THREE independent causes, all in `getDailyReport`** · **(1) it is NOT SCOPED while the schedule read IS — they sit on consecutive lines in the same file** ⇒ *a scoped coach sees their OWN schedule and a WHOLE-SHOP report* · **(2) `byBookingType` covers only FOUR types and the system has SIX — GROUP and OTHER are in the total and MISSING from the rows**, so the rows can never add up · **(3) `totalBooked` counts every non-CANCELLED status INCLUDING leaves and no-shows** ⇒ *"booked" exceeds the classes actually happening* · ⚠️ **which one she SAW depends on WHICH LOGIN she used — ask her, it changes what we fix first** · 🚫 no data needed to confirm any of the three | @Jason |
```

## TASK-607 — who may see the freelance drawn / refunded rows?

Verbatim, as it stood at `archive/board-2026-10-02-pre-sweep.md` line 221:

```
| TASK-607 | ⚖️ **who may see the freelance drawn/refunded rows?** | (Tanya, via @Porter) | ⛔ **OWNER DECISION, not a defect** — they are **FREELANCE COACH ledger rows on a course history**: `BOOKING` ⇒ an hour DRAWN off the coach ceiling, `BOOKING_REVERSAL` ⇒ that hour REFUNDED; a revenue posting is deliberately excluded · 🔑 **they are about the COACH hour ceiling, not the family money — which is why they look alarming on a course page** · 🔴 **`GET /courses/:id/history` is gated on `menu:bookings` ONLY, NOT the coach-pay key** ⇒ **an admin deliberately barred from seeing a coach RATE can see that coach hours being drawn and refunded** · ⚖️ **either the rows are not sensitive (nothing changes) or they are behind the WRONG permission** — 🚫 the SA does not move a permission on his own judgement | — |
```
