# TASK-697 — the swap dialog's rate box waits for the coach (no "ค่าสอนของ สำหรับตารางนี้") — FE, XS
- Source: @Tanya TEST-081 (`tests/TEST-081-task673-696-sid.md` :11) · **@Porter's ruling 2026-10-07: a defect in this round's own work, not new scope; if XS, it rides the next deploy**
- Status: DONE (reviewed by Silver, 2026-10-07) · rides the NEXT deploy
- Repo: `smart-scheduler-front` · Assignee: @Fanta · From: @Silver (2026-10-07)
- **Claim:** `partials/OtherSeries/*` ✅ (Team B's this round, as for TASK-624/673), including its tests. 🚫 No dictionary write. STOP for anything else.

## §0 Why
- Since TASK-673, a GROUP swap fixes the scope to "from here on" on mount, so the optional rate box shows **before** a coach is picked.
- Its label is `otherSeries.swapRate` with `name(to ?? "")` (`OtherSeriesDialogs.tsx:272`), so it reads *"ค่าสอนของ  สำหรับตารางนี้ (ต่อคาบ)"* with the name blank.
- **The same pattern exists on the one-session cover rate** (`otherSeries.coverRate`, `:253`), on an ECA "this session only" chosen before a coach.

## What to do
1. **Render each rate box only once a coach is chosen** (`to` set):
   - the "from here on" rate (`restRate`);
   - the one-session cover rate (`needRate && canRate`).
   - Then the label always carries a name.
2. **Nothing a user can submit changes.** Save is already shut without `to` (`:312`), and the cover rate's `required` gate is unchanged once the box shows.
3. 🚫 No new words, no label change, no change to `coverBlocked` / `coverNeedsKey` (that notice is about the KEY, not the coach; leave it where it is).

## Definition of Done
- [ ] **Clicked DOM tests:**
  - GROUP swap: before a coach is picked, **no rate box** and no "ค่าสอนของ" text; pick a coach ⇒ the box shows with that coach's name;
  - ECA swap, "this session only" chosen before a coach: no cover-rate box until a coach is picked, then it is required as before;
  - pinned and unchanged: every existing 624 / 673 / 634-shape test.
- [ ] Mutation set (front form, `--tests` declared):
  - the swap rate shown before a coach (bites);
  - the cover rate shown before a coach (bites).
- [ ] `bun test`, `tsc` and `build`, with counts. 🚫 No click on sid or uat. Nothing committed.

## QA hand-off
- **Screen:** a GROUP's Manage plan → Swap ⇒ no rate box until a coach is picked, then *"ค่าสอนของ {coach} สำหรับตารางนี้ (ต่อคาบ)"*.
- **Screen:** ECA → Swap → "this session only" before a coach ⇒ the cover-rate box appears only after the coach is picked.

## Implementation Notes
**Fanta, 2026-10-07.** Repo `smart-scheduler-front`. Nothing committed. The tree also holds my accepted-but-uncommitted TASK-673 and TASK-696 files.

**Files (this TASK only, `partials/OtherSeries/*`):**
- `M OtherSeriesDialogs.tsx`: **two conditions, nothing else.** `{restRate && to && (` (the "from here on" series-rate box) and `{needRate && canRate && to && (` (the one-session cover-rate box). Both rate labels are `{name}'s rate for…` with `name(to ?? "")`, so a box is now drawn only once a coach is chosen and its label always carries a name.
  - **Nothing a user can submit changes:** Save was already shut without `to`; the cover's `required` guard, `coverBlocked` and `coverNeedsKey` (about the KEY, not the coach) are untouched; the body is built exactly as before.
  - No new words, no label change, no dictionary write.
- `M series-scope.dom.test.tsx`: +3 tests (32 → 35 on the folder). `?? swap-rate-after-coach-task697.mutations.json` (2 mutations).

**Verification:**
- `bunx tsc --noEmit` exit 0 · `bun run build` exit 0 · `OtherSeries/*` **35 pass / 0 fail**. Read on the real dialog:
  - **GROUP swap:** before a coach there is no rate box and no rate label; picking one shows the box with the label **"บี's rate for this series (per session)"**, and no label ever starts with a blank name;
  - **ECA swap, "this session only" chosen before a coach:** no cover-rate box, no rate label, Save shut; after the coach is picked the box shows ("บี's rate for this session"), is **still required**, Save still waits for it, and the body is exactly `{ from, onDate, rateMinor, to }` as before;
  - ECA "the rest" before a coach: no series-rate box until a coach is picked.
- Mutation set `swap-rate-after-coach-task697`: `bun run mutation:run -- --tests "src/components/partials/OtherSeries/series-scope.dom.test.tsx src/components/partials/OtherSeries/swap-doors.dom.test.tsx" --mutations src/components/partials/OtherSeries/swap-rate-after-coach-task697.mutations.json`
  ```
  BASELINE 32 pass / 0 fail
  R1 the series-rate box shown before a coach ...... BITES 30/2
  R2 the cover-rate box shown before a coach ....... BITES 31/1
  CHECKSUM identical
  ```
  The TASK-624 (11) and TASK-673 (4) sets re-run on the changed dialog: no SURVIVED, no NO RESULT, checksum identical.
- **Full `bun test`: 1087 pass / 1 fail across 121 files.** The 1 is the assertion in Q1; every existing 624 / 673 / 634-shape test passes unchanged.
- 🚫 No click on sid or uat. **Footprint:** none (the runner restored every file).

## Questions
- **Q1 — ONE assertion outside the claim (STOP, as the TASK says).** `src/lib/scheduler/series-scope.test.ts:227`, in "⚠️ an admin WITH the key is UNCHANGED — this adds a state, it does not narrow theirs":
  ```
  expect(dialogs).toContain("{needRate && canRate && (");
  ```
  It pins the cover-rate box's JSX condition, and that condition now has the coach in it. **The claim it protects is untouched and I propose to keep it asserted**, with the new text:
  ```
  expect(dialogs).toContain("{needRate && canRate && to && (");   // + a TASK-697 note: the box still needs the KEY, and now also a coach (its label is "{name}'s rate…")
  ```
  The next line (`if (needRate && canRate && coverRateMinor == null) return;`) and `needRate && !canRate` are unchanged and still pass. This is the only assertion in the repo that reads that text (checked: 0 in `other-series.test.ts`, 0 in `group-series.test.ts`).
  - 🚫 What I did NOT do: keep that literal alive by restructuring the JSX around it, so the pin passes without noticing the change. Its claim is that an admin WITH the key is not narrowed; the only thing that narrows is "before a coach is chosen", a state where Save is shut anyway, and that deserves to be named in the pin, not hidden from it.
  - May I make that one edit (line 227 only)?

## Review
- **Q1 (Silver, 2026-10-07):** your edit is right, and your refusal to dodge the pin by restructuring is exactly right. The miss is mine (**F-013**): I cut the TASK without grepping for pins of the text.
  - **Checked by RUNNING, not reading:** all 5 tests that read this dialog's source → 48 / 1, and the 1 is `:227`.
  - **Every later `expect` in that `it()` already matches the source** (`:228`, `needRate && !canRate`). ⇒ `:227` is the ONLY line.
  - **Asked @Porter for `:227` only. ⛔ Don't edit it until I write GO.**
- **Q1 — ✅ GRANTED by @Porter (2026-10-07): `series-scope.test.ts:227` ONLY**, under the same condition. The pin is text, so it names what it holds. ▶️ GO: make exactly your proposed edit + a TASK-697 note, run the full suite, and nudge me.

### Q1 done as granted (Fanta, 2026-10-07)
**`series-scope.test.ts:227` ONLY** (`git diff -U0` = one hunk `@@ -227 +227,4 @@`: the one assertion replaced, plus a 3-line TASK-697 note; nothing else in the file):
```
- expect(dialogs).toContain("{needRate && canRate && (");
+ // 🔻 TASK-697 (granted by Porter, 10-07): the box still needs the KEY and the cover, and now ALSO a chosen coach (`to`) — its label is
+ // "{name}'s rate for this session", so it must never be drawn before there is a name. The claim this pin protects (an admin WITH the key
+ // is not narrowed; Save was already shut without a coach) is unchanged, and the next line still pins the guard exactly as TASK-577 built it.
+ expect(dialogs).toContain("{needRate && canRate && to && (");
```
The pin still names what it holds: the next line (`if (needRate && canRate && coverRateMinor == null) return;`) and `needRate && !canRate` are untouched and pass.

**Re-run:** `bunx tsc --noEmit` exit 0 · **full `bun test` 1088 pass / 0 fail across 121 files** (it was 1087/1; the 1 was this line) · `bun run build` exit 0. The tree now holds only TASK-697's files (the owner has committed 673 and 696): `OtherSeriesDialogs.tsx`, `series-scope.dom.test.tsx`, the set, and this one line. Nothing committed.

**Silver, 2026-10-07 — ✅ DONE.**
- `series-scope.test.ts` is one hunk at `:227`, exactly the grant. The same claim is kept, and the note says why.
- `OtherSeriesDialogs.tsx` has only the two `&& to &&` conditions.
- **Re-run by me:** the full front suite **1088 / 0**. Set `swap-rate-after-coach-task697` → **2/2 BITES**, `CHECKSUM identical`.
- **Files to commit:** `OtherSeries/OtherSeriesDialogs.tsx`, `series-scope.dom.test.tsx`, `swap-rate-after-coach-task697.mutations.json`, `lib/scheduler/series-scope.test.ts`.
