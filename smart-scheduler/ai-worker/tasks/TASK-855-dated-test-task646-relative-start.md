# TASK-855 — BE: the TASK-646 test's "future" date has expired; make it relative (test file only) — @Jason (≈ 0.1 d)
**From @Sober, 2026-11-05. GO now.** Via Porter (inbox/SA.md 11-05; Silver's finding). Repo: `smart-scheduler-back`. **No git:** the fix stays in the working tree until the owner says "ขึ้น git".

## What I verified on the base (`fd7c8f0`, 2026-11-05)
- `bun test src/services/declared-absence-stretches-expiry-task646.test.ts` (the safe env line) → **4 pass, 3 fail**. All 3 throw `LEAVE_NOTICE_TOO_LATE` from `scheduler.service.ts:4785`.
- **Why:** line 33, `const START = "2026-11-02"; // every session is in the FUTURE`. That date has passed, so the product correctly refuses the leave. **The product code is right; it isn't touched.**
- **The whole suite:** **5,246 pass, 3 fail, unhandled 0**; those 3 are the only failures.
- **Every other date in the file derives from `START`** (`plus(START, i)`, `courseExpiry(START, SIZE)`, the `startDate` field). No other date literal. `grep -n "2026-\|2027-"` shows only line 33.
- **No pin depends on the line:** the other mentions are a comment (`pre-start-declared-absence-task609.test.ts:177`) and the `tests` lists of two mutation sets.

## The change: closed file list = 1 file, 1 line
`src/services/declared-absence-stretches-expiry-task646.test.ts:33`:
```ts
// was: const START = "2026-11-02"; // every session is in the FUTURE ⇒ the course has NOT started
const START = plus(new Date().toISOString().slice(0, 10), 4); // 🔻 TASK-855 — four weeks from today, so every session is ALWAYS in the future ⇒ the course has NOT started (a fixed date here expired on 2026-11-02)
```
- `plus` is defined at line 30, above it. **4 weeks** clears the 3-hour notice rule and any UTC / Bangkok day edge.
- Nothing else in the file changes.

## Done = (evidence in `## Implementation Notes`: each command + its real output)
1. The file's test: **7 pass, 0 fail.**
2. **Weekday independence:** the old date was a Monday, and today's offset gives whatever weekday it gives.
   - Prove it: on a **scratch copy** of the test (never the real file), run it with the offset at 28, 29 … 34 days. **All 7 pass, 7 times.** Paste the 7 result lines; delete the copy.
3. **The whole suite** with the safe env line: **5,249 pass, 0 fail, unhandled 0.**
4. **The three mutation sets that use this test as a witness, in a clean room, one at a time** (the tree is shared with Team B; never two at once):
   - `src/services/declared-absence-stretches-expiry-task646.mutations.json` (3 mutations);
   - `src/services/leave-week-triggers-task656.mutations.json`;
   - `src/lib/max-week-from-expiry-task650.mutations.json`.
   - **All bite, 0 survivors.** They've had a red witness since 11-02, so this is the real proof the test still protects the behaviour.
5. `git status --short -uall`: your 1 file is the only new change beside Team B's 6 existing `som-*` files, which you don't touch. `git diff` of your file = the 1 line (+ its comment).

## Questions
_(none yet)_

## Implementation Notes
_(Jason)_

## Review
_(Sober)_


## Jason (BE) 2026-11-05 — TASK-855 DONE: the TASK-646 test's date is relative — GREEN, test file only, no git
`smart-scheduler-back/src/services/declared-absence-stretches-expiry-task646.test.ts:33` is the only file I changed:
`const START = plus(new Date().toISOString().slice(0, 10), 4); // 🔻 TASK-855 — four weeks from today, so every session is ALWAYS in the future ⇒ the course has NOT started (a fixed date here expired on 2026-11-02)` (was `"2026-11-02"`). `git diff` = that 1 line (+1 −1).
1. **The file's test (safe env line): 7 pass · 0 fail** (23 expect() calls).
2. **Weekday independence** on a scratch copy (`src/services/zz-scratch855.test.ts`, the offset read from `OFFS` in days; deleted afterwards, `ls | grep -c zz-scratch855` = 0):
```
offset 28 days (Thu): 7 pass 0 fail
offset 29 days (Fri): 7 pass 0 fail
offset 30 days (Sat): 7 pass 0 fail
offset 31 days (Sun): 7 pass 0 fail
offset 32 days (Mon): 7 pass 0 fail
offset 33 days (Tue): 7 pass 0 fail
offset 34 days (Wed): 7 pass 0 fail
```
3. **Whole suite (safe env line): 5249 pass · 0 fail** (47,254 expect() calls, 373 files).
4. **Mutation sets, one at a time, each `CHECKSUM identical` (restored byte-identical), 0 survivors:**
   - `declared-absence-stretches-expiry-task646.mutations.json`: **X1 · X7 · X8 BITE** (3/3);
   - `leave-week-triggers-task656.mutations.json`: **L1 · L2 · S1 · C1 · C2 · R1 · R2 · F1 · G1 · I1 · I2 BITE** (11/11);
   - `max-week-from-expiry-task650.mutations.json`: **W1 · W2 · W3 · W4 · W5 · W6 · W7 BITE** (7/7).
5. `git status --short -uall` = 7 files: Team B's 6 `som-*` files (untouched by me) + my test file. Product code untouched. No git command run.
Frozen. Ball: Sober.

**Sober, 2026-11-05: DONE.**
- **`git diff`:** the 1 line only; `scheduler.service.ts` unchanged; no scratch file left.
- **My clean room** (HEAD `fd7c8f0` + this 1 file, no `.env`): tsc 0 · **5,236 pass / 0 fail**, unhandled 0 · set 646 **3/3** bite, 0 survivors, checksum identical.
- Your 5,249 = this 5,236 + Team B's 13 tests in their uncommitted `som-*` files. Both correct.
- **Commit list when the owner says "ขึ้น git":** exactly `src/services/declared-absence-stretches-expiry-task646.test.ts`. Message shape: `test: make the TASK-646 test's start date relative (TASK-855)`.
