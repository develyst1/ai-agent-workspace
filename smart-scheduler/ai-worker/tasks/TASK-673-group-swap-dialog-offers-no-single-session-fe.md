# TASK-673 — the swap dialog on a GROUP series offers no "this session only" — FE, XS · SCREEN SECOND
- Source: owner ruling 2026-10-06 ("server first, the screen second") · the server half is TASK-672 · found in TASK-624 Q3
- Status: DONE (reviewed by Silver, 2026-10-07) · rides the NEXT deploy (batch #2 already on sid)
- Repo: `smart-scheduler-front` · Assignee: @Fanta · From: @Silver (2026-10-06)
- **Claim:** `partials/OtherSeries/*` ✅ (Team B's this round), incl. `series-scope.dom.test.tsx`. 🚫 **`Calendar/Modal/GroupSwapDialog.tsx` is Team A's**, and it already sends no `onDate` (pinned at `lib/scheduler/series-scope.test.ts:252-253`). Do not touch it.
- Ships after (or with) TASK-672. It is fine for the server fix to go first.

## §0 Why
- On a GROUP series, `OtherSeriesDialogs.tsx` shows the scope choice for every swap (HEAD `:213-219`). "This session only" sends `onDate`, which the group route cannot honour.
  - Today it silently swaps the whole group from today **and pays the one-session rate from today onward** (TASK-672 §0).
- TASK-672 makes the server refuse it. **This TASK makes the screen never offer it**, so an admin is not refused for a choice we put in front of them.

## What to do
1. On a **GROUP** series (`seriesRef.kind === "group"`), the swap dialog offers **only "from here on"**: no "this session only" radio, and therefore never the one-session cover rate box.
   - **Other** series keep both scopes exactly as they are (the TASK-624 behaviour, pinned).
   - **Decide and declare** the shape (e.g. the radio group shows the one valid option, or the scope is fixed to `rest` with the date picker labelled as today). 🚫 **No new wording:** reuse `otherSeries.scopeRest` / `fromDate`. If a new sentence seems needed, STOP and ask me.
2. The body for a group swap can then only ever carry `fromDate`, never `onDate`, never the cover `rateMinor`.

## Definition of Done
- [ ] **Clicked DOM tests:**
  - GROUP: no "this session only" option, and Save posts `{ to, fromDate[, rateMinor] }`, **never `onDate`**;
  - OTHER: both scopes still offered and unchanged (pinned).
- [ ] Mutation set (front form): "this" offered on a group again (bites) · `onDate` sent for a group (bites).
- [ ] `bun test`, `tsc` and `build`, with counts. 🚫 No click on sid or uat. Nothing committed.

## QA hand-off
- **Screen:** a GROUP's Manage plan → Swap ⇒ only "from here on" is offered.
- **Screen:** an ECA (other) series → Swap ⇒ both scopes, as before.

## Implementation Notes
**Fanta, 2026-10-07.** Repo `smart-scheduler-front`. Nothing committed. The tree is otherwise clean (the owner committed my earlier work), plus the step-1 comment edit in `dictionaries.ts` already sent to you.

**Files (this TASK only, all in `partials/OtherSeries/*`):**
- `M OtherSeriesDialogs.tsx` (`TeacherDialog`): `isGroupSwap = seriesRef.kind === "group" && mode === "swap"`. For it, **the scope question is not asked** (the `Radio.Group` is not rendered) and the scope is set to `rest` on mount. So the body can only ever be `{ to, fromDate[, rateMinor] }`: never `onDate`, and never the one-session cover `rateMinor`, because `coverRateRequired(mode, "rest")` is false and the cover box and the key-59 cover guard cannot appear.
- `M series-scope.dom.test.tsx`: +4 tests (28 → 32 on the folder) and a `kind` option on the harness.
- `?? group-swap-scope-task673.mutations.json` (4 mutations).
- **No dictionary write and no new wording:** the date label is the existing `otherSeries.fromDate` ("From date"), as the TASK suggested.
- `Calendar/Modal/GroupSwapDialog.tsx` is **not touched** (Team A's; it already sends no `onDate`).

**Decided and declared (internal; overturn freely):**
1. **Shape: the question is not asked at all** (no radios) rather than showing one radio. With one valid answer there is nothing to ask; Khwan's complaint was an unasked question with a hidden effect, and the date label still says what the date means. A single pre-checked radio under "Choose one — nothing is assumed" would read oddly. If you would rather show the one option, it is a one-line change.
2. **The scope is set by an effect, not by the initial state.** `series-scope.test.ts:52` pins `const [scope, setScope] = useState<SeriesScope>(null);` (TASK-564: no door that ASKS the question starts with an answer). That claim is still true and still asserted, so I did not touch the pin: the group swap, the one door with nothing to ask, is given its only answer on mount. The first paint has `null`, so Save is shut until the effect lands. (My first version put `"rest"` in the initial state and moved exactly that pin; I changed approach rather than edit a file outside the claim.)
3. **ADD on a group is unchanged** (both scopes). The group add route takes `onDate` (`otherSeriesAddTeacher`), so it has no such defect, and the TASK is about the swap. Pinned.

**Verification:**
- `bunx tsc --noEmit` exit 0 · `bun run build` exit 0 · **full `bun test` 1079 pass / 0 fail across 120 files** (was 1075/0).
- New tests, all read at the wire, **32 pass / 0 fail on `OtherSeries/*`**:
  - GROUP swap: no radio, no "this session only", no cover-rate box, the date reads "From date"; picking a coach opens Save with no scope click; the PATCH goes to `/group-series/k-1/teacher` with keys exactly `["fromDate","to"]`, **`onDate` undefined**, no cover rate;
  - GROUP swap + the optional series rate: keys `["fromDate","rateMinor","to"]`, `rateMinor: 65000`, still no `onDate`;
  - **unchanged (pinned):** ADD on a group still shows both scopes with none checked; an OTHER series' swap still shows both scopes with none checked, and its one-session cover still needs a rate.
- Mutation set `group-swap-scope-task673`: `bun run mutation:run -- --tests "src/components/partials/OtherSeries/series-scope.dom.test.tsx src/components/partials/OtherSeries/swap-doors.dom.test.tsx" --mutations src/components/partials/OtherSeries/group-swap-scope-task673.mutations.json`
  ```
  BASELINE 29 pass / 0 fail
  G1 "this session only" offered on a group again ...... BITES 28/1
  G2 onDate sent for a group (scope fixed to "this") ... BITES 27/2
  G3 the fix leaks to OTHER series' swap ............... BITES 13/16
  G4 the fix leaks to ADD on a group ................... BITES 28/1
  CHECKSUM identical
  ```
  (The DoD's two are G1 and G2.) The TASK-624 set re-run on the same dialog: still all BITES, checksum identical.
- 🚫 No click on sid or uat. **Footprint:** none (the runner restored every file).

## Questions
None. 📌 **Housekeeping for you:** TASK-673 has no row on `board.md` (TASK-696 does). I did not add one, since the board is yours; I updated this file's status only.

## Review
**Silver, 2026-10-07 — ✅ DONE.**
- **Scope:** `OtherSeries/*` only; Team A's `GroupSwapDialog.tsx` untouched; no dictionary write, no new words (`otherSeries.fromDate` reused).
- **All 3 declared decisions accepted:**
  1. **No radio at all on a group swap.** One valid answer means no question; the date label still says what the date means.
  2. **The scope is set by an effect, not the initial state.** TASK-564's `useState(null)` pin stays true. The first paint is `null`, so Save is shut until it lands.
  3. **ADD on a group keeps both scopes.** Its route takes `onDate`, so it has no defect.
- **Re-run by me:** `OtherSeries/*` → **32 / 0** (before and after the set). Set `group-swap-scope-task673` → **4/4 BITES** (G1, G2 = the DoD's two; G3, G4 = the leaks to OTHER / ADD).
  - My runner said `CHECKSUM CHANGED`: the checksum covers all of `src`, and Fanta was editing `People/*` for TASK-696 during the run. The per-file restores were byte-checked, and the folder re-ran 32/0 afterwards. ⇒ Not a leak.
  - 📌 My lesson: **don't run a mutation set while the engineer is working in the same tree.**
- **Release:** batch #2 is already on sid, so 673 rides the **next** deploy, with 672 already live. 🔴 **The tree also holds 696 in progress, and it must not be committed until it is DONE.**
