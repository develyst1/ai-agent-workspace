# TASK-877 — BE: REQ-5009 item 2 **Coach Capacity: new rates + ECA / Camp hours count** (smart-scheduler-back) — @Bob — after TASK-870
**From @Silver, 2026-11-08.** Customer ruling (ขวัญ for พี่ปุ้ม + พี่ตั้ม, REQ-5009 verbatim). Porter's GO: *"cut the Capacity TASK (Bob, after 870, same SB deploy)"*. Finding: `CHECK-REQ-5009-som-dashboard-round-3-2026-11-08.md` § 2. Branch `dong`. **No git command: git only on the owner's word.** **Size ≈ 0.5 d.** No migration. No front change.

## The rule (her words: "ต้องรวม ECA / CAMP ด้วยค่ะ นับเป็นรายชั่วโมง" · "FT = วันธรรมดา 4hr … เสาร์อาทิตย์ 5hr · PT = เสาร์อาทิตย์ 5hr · Karn … 4 hr · PT ที่มารับ FL วันธรรมดา ไม่ต้องคำนวณ")
- **Available per day worked:**
  - FULL_TIME: weekday **4**, weekend **5**;
  - PART_TIME: weekday 0 (unchanged), weekend **5**, or the coach's own `weekend_capacity_hours` when set;
  - FREELANCE: 0 (unchanged).
  - **Karn = his own `weekend_capacity_hours = 4`.** It is already set on uat (one PT row; Karn's by inference). No code names him.
- **Booked hours** also count `OTHER` rows whose `otherKind` is **`ECA`** or **`CAMP`**, in clock minutes, the same way as lessons:
  - weekday / weekend by date;
  - not `CANCELLED`;
  - badge filter as today;
  - the primary coach + every extra coach on `booking_teachers`;
  - never a GROUP's seats.
  - **`FREE`, `KOL` and no-kind `OTHER` rows stay out.** *(SA decision; reversible; she named ECA and CAMP only.)*
- **The system "No Teacher" (TASK-861) stays out of the roster,** as TASK-861's exclusion walk already does.

## What to change (`src/lib/som-contract.ts`, `src/services/som-contract.service.ts`)
1. **Constants (`som-contract.ts:588–591`):**
   - `CAPACITY_FULL_TIME_WEEKDAY_HOURS = 4`;
   - split `CAPACITY_WEEKEND_HOURS` into **`CAPACITY_FULL_TIME_WEEKEND_HOURS = 5`** and **`CAPACITY_PART_TIME_WEEKEND_HOURS = 5`**, so the two can differ later;
   - update the comment block above them to cite REQ-5009 (11-08) superseding REQ-5004 §1.
2. **`countCapacity` (`:625`), the booked filter at `:639`:** accept `isLesson(b) || b.bookingType === "GROUP" || (b.bookingType === "OTHER" && CAPACITY_OTHER_KINDS.has(b.otherKind ?? ""))`, with `export const CAPACITY_OTHER_KINDS: ReadonlySet<string> = new Set(["ECA", "CAMP"])`. Fix the comment at `:636` ("never ECA / camp").
3. **`SomBooking`** gains `otherKind?: string | null` (optional, so other readers are untouched). The service mapper next to `som-contract.service.ts:53` passes `b.otherKind ?? null`.
   - Grep every constructor of `SomBooking` in the tests; optional means none must change.
4. **No DTO change.** `CoachCapacity`'s shape is the same.

## Tests (SAFE env; each must fail when its code is removed)
- `som-nvr-capacity-task742.test.ts` pins 5 / 6 today. Move them to 4 / 5. These are the TASK's own edits; tag `🔻 TASK-877`.
- **New**, in `som-capacity-task877.test.ts`:
  1. an FT coach working 1 weekday + 1 weekend day → available 4 + 5;
  2. a PT coach with no own rate → weekend 5; with own rate 4 → 4; weekday 0;
  3. a 2-hour ECA on a weekday and a 1-hour CAMP row on a Saturday count as 2 + 1 booked, with an extra coach on the ECA counted too;
  4. a FREE, a KOL and a no-kind OTHER row → not counted;
  5. a CANCELLED ECA row → not counted.
- A mutation set `som-capacity-task877.mutations.json` over the constants, the kind set and the filter clause.
- **Pure mirror test edits are pre-approved** (tagged `🔻 TASK-877`, listed in the report).

## Files (claim, Team B)
- `src/lib/som-contract.ts` (the capacity block + `SomBooking`);
- `src/services/som-contract.service.ts` (the mapper line);
- `src/lib/som-nvr-capacity-task742.test.ts` + its mutations file (pins only);
- the new test + mutation files.
- **Shared-file note:** `som-contract.ts` is REQ-5004's file (Team B's); nobody else holds it now.

## Done =
- `bunx --package typescript@5.9.3 tsc --noEmit` 0. Note: plain `bunx tsc` pulls TypeScript 7 / tsgo, which panics on this machine (Silver, 11-08).
- SAFE suite green (count before / after); the mutation set all bites.
- A report in `inbox/SA-B.md`. `git status` = only the claimed files. No git command run.
- **It rides the same SB sid deploy as TASK-861 + 870**, so Tanya checks Coach Capacity with the new numbers on sid.

## BE report (Bob, 2026-11-08) — DONE-pending-review, no migration, nothing committed
- **Rates** (`som-contract.ts`): `CAPACITY_FULL_TIME_WEEKDAY_HOURS = 4`; `CAPACITY_WEEKEND_HOURS` split into `CAPACITY_FULL_TIME_WEEKEND_HOURS = 5` and `CAPACITY_PART_TIME_WEEKEND_HOURS = 5`; PT weekday 0 and FL 0 unchanged; a PT's own `weekend_capacity_hours` still wins (Karn's 4 is data; no name in the code). The comment block cites REQ-5009 superseding REQ-5004 §1 row 4.
- **Booked hours:** `CAPACITY_OTHER_KINDS = {ECA, CAMP}`; the filter accepts `isLesson || GROUP || (OTHER && kind ∈ set)`; clock minutes, weekday / weekend by date, not CANCELLED, badge filter as before, primary + every extra coach, never a seat. FREE · KOL · no-kind OTHER stay out. `SomBooking.otherKind?` (optional — no constructor changed) and the service's column list + mapper pass `otherKind`. The comment that said «never ECA / camp» is fixed. The system "No Teacher" stays out of the roster (TASK-861's filter).
- **Tests:** `som-capacity-task877.test.ts` 12 pass (FT 4+5; PT 5 / own 4 / weekday 0; ECA 2 h weekday + CAMP 1 h Saturday with an extra coach; FREE / KOL / no-kind out; CANCELLED out; seats out; badge filter; a lesson still counts; the service mapper). `som-capacity-task877.mutations.json` 17 mutants, all bite (one candidate, «FT weekend read from the PT constant», is EQUIVALENT while both are 5 and was dropped — noted in the file). Every other set in the tree re-run: no survivors. Full SAFE `bun test` → **5530 pass · 0 fail**; tsc (`typescript@5.9.3`) 0.
- **Mirror edits (pins only, tagged 🔻 TASK-877):** `som-nvr-capacity-task742.test.ts` — the constants pin (4 / 5 / 5 / 0 / 0) and every capacity figure moved from the 5 / 6 arithmetic to 4 / 5 (≈ 25 lines, incl. the TASK-756 / TASK-757 capacity cases that quote hours); the byType case now books 4 lessons (5 would make the average-of-percentages mutant equivalent); `som-nvr-capacity-task742.mutations.json` — six capacity mutants re-aimed to the new constants (N10, N16, S1, S4, S5, S6).

## Review — @Silver, 2026-11-08: ✅ ACCEPTED (DONE)
- **Re-run by me:** SB tsc 0 (TS 5.9.3); SAFE **5530 pass / 0 fail**.
- **Constants** (`som-contract.ts:591–597`): FT weekday 4 · FT weekend 5 · PT weekend 5 (the coach's own value still wins) · `CAPACITY_OTHER_KINDS = {ECA, CAMP}`.
- **Filter** (`:645`): adds OTHER rows of those kinds only. FREE / KOL / no-kind stay out, and seats / cancelled / badge rules are unchanged.
- **Mapper:** `som-contract.service.ts` now passes `otherKind`.
- **Tests:** the 742 pins moved 5/6 → 4/5. The new 877 test is green, with 17 of 17 mutants.
- **Live numbers:** Tanya checks them on sid after the deploy, with Karn's own 4 shown on his row.
- **Security review:** none (read-only report).
