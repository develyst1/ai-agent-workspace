# TASK-662 — piece A (FE): the shared student picker requires a parent phone for a NEW student, except on import — FE, S
- Source: `SIZING-parentless-children-2026-10-04.md` Addendum 2 (@Sober) · owner's import exemption · server half `TASK-644` (Bob)
- Status: DONE — FINAL (reviewed by Silver, 2026-10-05) · 🔴 ships ONLY with TASK-644
  - **Q1 — `src/lib/ui/masked-input-assert.test.ts`:** add `src/components/partials/Bookings/parent-phone-task662.dom.test.tsx` to its pinned list. **That line only.**
  - **Q2 — `src/lib/api/client.ts`:** 🔴 **Porter's narrowest grant.** The interceptor runs on EVERY request in the front end.
    - **The whole scope:** use the server's `details` sentence as the error's message ONLY for `code === "VALIDATION"` with an issue whose `path` is exactly `["student","phone"]`.
    - 🚫 No other code, no other path, no "while I am here", and no change to what any other error renders today.
    - 🔴 **The required proof, which is Porter's condition: pin that NON-matching errors render EXACTLY as they do today.** At least:
      - a different `code`;
      - `VALIDATION` at a different path;
      - `VALIDATION` with no `details`;
      - a `student.phone` issue under a code other than `VALIDATION`.
      - Compare each against the message the interceptor produces today, byte for byte.
    - "An interceptor is judged by what it leaves alone, not by what it catches."
    - Add mutations to the set: the branch firing on any `VALIDATION` (must bite), and the path check loosened (must bite).
  - **Q3:** kept, and Porter accepted it. He is telling the owner it changes Team A's อื่นๆ booking screen. You change nothing further.
  - 🔴 TASK-644 ships ONLY with this TASK (Porter has adopted that ruling).
  - 🔴 **Porter's condition, verbatim in spirit:** a label reading "(optional)" beside a field the server now REFUSES as empty is worse than no label.
    - Build with the DRAFT wording, marked `📋 DRAFT wording`.
    - **If the owner's approved wording has not landed by the time this is otherwise ready, STOP and tell me.** Never ship the old "(optional)" label on the strict screens.
  - 🔴 **Pairing:** `TASK-644` (server, DONE) and this TASK **ship together or not at all.** That is my ruling, given Bob's finding below.
- Repo: `smart-scheduler-front` · Assignee: @Fanta · From: @Silver (2026-10-04)
- Depends on: `TASK-644` for the server's refusal shape (Bob pastes it in his notes). The picker work does not need to wait for it.
- Claim: `src/components/common/StudentSelect.tsx` (🔴 **SHARED; Team B is its one owner this batch**) · `partials/Bookings/ImportBalanceModal.tsx` · co-located tests.

## §0 Why
- The server becomes strict on booking, new course and new voucher (TASK-644). **The picker mirrors it, so an admin is told while typing, not refused at save.**
- The parent-phone field **already exists** and appears when the student is new (`StudentSelect.tsx:112-119`). Today it is labelled "(optional)".

## What to do
1. **One explicit prop on `StudentSelect`: `requireParentPhone?: boolean`, default `true`.**
   - 🔑 **Default TRUE means it fails CLOSED:** a new caller is safe without anyone remembering.
   - 🚫 **The component must NEVER work out which screen it is on.**
2. When the student is **new** and `requireParentPhone` is true:
   - the phone field is **required**, labelled without "(optional)";
   - the form **cannot submit** until the phone is phone-shaped (at least 9 digits, digits and separators only: the same rule as the server);
   - an inline error explains why. The words are in `COPY-DRAFT-parent-phone-required-teamB-2026-10-04.md` §1, shipped with a `📋 DRAFT wording` marker.
3. **`ImportBalanceModal.tsx` is the only caller that passes `requireParentPhone={false}`.** That keeps today's optional field and its existing "(ถ้ามี)" label. It maps 1:1 onto the two exempt server acts.
4. 🚫 **No other caller changes.** The default does the work:
   - `CreateCourseModal`, `CreatePlanFlow`, `CreateVoucherModal` (ours);
   - Team A's `BookingModal` (Team A has been told its behaviour changes);
   - the two Camp dialogs (unclaimed).
   - **If making submit wait on the phone seems to need a caller change, STOP and tell me.**
   - **Decide and declare** how the picker blocks the submit without touching callers. For example, it reports no complete value until the phone is valid, so each form's existing "student required" check holds. Say which, and why.
5. **If a server refusal still arrives** (TASK-644's shape), it must reach the admin as a readable message, not a bare error.
   - 🔑 **The actual shape, captured by Bob through the root app** (TASK-644 notes):
     ```
     400 {"error":{"code":"VALIDATION","message":"ข้อมูลที่กรอกไม่ถูกต้อง กรุณาตรวจสอบแล้วลองใหม่อีกครั้ง",
          "details":[{"code":"custom","path":["student","phone"],"message":"นักเรียนใหม่ต้องมีเบอร์โทรผู้ปกครอง (อย่างน้อย 9 หลัก) — …"}]}}
     ```
   - ⚠️ **The specific sentence is in `details[*].message` where `path` is `["student","phone"]`, NOT in `message`.** `message` is the deliberate generic line from `lib/validate.ts` (TASK-296), used for every refusal.
   - ⇒ When that issue is present, show **its** message, ideally on the phone field. Otherwise the admin reads only "invalid data" beside a label that has just told them what to do.
   - Find how the front already surfaces API errors, and **decide and declare** the smallest place to read `details` for this one path. If that place is outside the claim, STOP and tell me.
6. 🚫 **Out of scope (flagged, not ours now):**
   - the typed-but-not-picked trap that creates a duplicate;
   - `SellCampDialog` sending only an id;
   - Piece B (the "no parent" marker and the People finding aid) comes **next**, as its own TASK.

## Definition of Done
- [ ] **Clicked DOM tests** on `StudentSelect`:
  - default: a new student with no phone, or a junk phone, cannot be submitted, and the error shows;
  - a valid phone lets it through;
  - **an existing student needs no phone**;
  - with `requireParentPhone={false}`: the optional field, and submit allowed with no phone.
- [ ] **One clicked test per kind of caller:**
  - `CreateCourseModal` (default, the screen in Khwan's screenshot) refuses a phoneless new student;
  - `ImportBalanceModal` still accepts one.
- [ ] **Break it and watch**, filed as `src/components/common/student-select-task662.mutations.json` with its own test list:
  - the default flipped to `false` (bites);
  - the import modal's `false` removed (bites);
  - the 9-digit floor lowered (bites).
- [ ] `bun test` for the front, `tsc --noEmit` and `bun run build`, all green, with counts. Say that the tree may hold Team A's uncommitted work.
- [ ] 🚫 No click on `sid` or uat (owner ruling). The real clicks go to QA.
- [ ] `git status`: `StudentSelect.tsx`, `ImportBalanceModal.tsx`, the dictionary keys (once claimed), and the tests and set. Nothing committed.

## For the QA hand-off
- **Screens:**
  - New course → type a new name, and the phone field is **required**; there is no save without a 9+ digit phone.
  - Pick an existing student, and no phone is asked.
  - Import balance → a new name with no phone **still saves** (exemption).
  - Booking modal (Team A's screen) → behaves like New course.

## Implementation Notes
**Fanta, 2026-10-04.** Repo `smart-scheduler-front`. The tree was clean at the start (the owner had committed), so every change below is mine. Nothing committed.

**Files (`git status`):**
- `M src/components/common/StudentSelect.tsx`
  - `requireParentPhone?: boolean` with **default `true`** (fails closed).
  - `isParentPhoneShaped` mirrors the server's `isPhoneShaped` (`back/src/lib/phone.ts`): digits and separators only, at least 9 digits.
  - For a NEW student, the phone field's label is `student.parentPhoneRequired`, the field is `required`, and the error `student.parentPhoneRequiredError` shows while the phone is not phone-shaped.
  - With `false`, the field is exactly today's (`student.parentPhone`, "(ถ้ามี)", no error).
- `M src/components/partials/Bookings/ImportBalanceModal.tsx`: one line, `requireParentPhone={false}`. **No other caller changed.**
- `M src/lib/i18n/dictionaries.ts`: **two `student.*` keys only**, EN + TH, marked `📋 DRAFT wording`, from `COPY-DRAFT-parent-phone-required-teamB-2026-10-04.md` §1 verbatim. `parentPhone` / `parentPhoneHint` are untouched.
- `?? src/components/common/student-select-task662.dom.test.tsx`: 8 tests. The rule by value; default refuses no phone and junk phones and shows the error; a valid phone passes; an existing student needs no phone; `false` keeps the optional field and lets Save through; a NOT-required picker never drops what was typed.
- `?? src/components/partials/Bookings/parent-phone-task662.dom.test.tsx`: 2 caller tests, both clicked through to the act.
  - `CreateCourseModal` (default): with teacher, program and size all ready, Save stays shut until the phone is valid. Then the course is created with `studentPhone`.
  - `ImportBalanceModal`: a voucher import with a new name and no phone saves, and the import is called with no phone.
- `?? src/components/common/student-select-task662.mutations.json`: the set (P1–P5).

**Decided and declared (internal; overturn freely):**
1. **How the submit waits without touching a caller.** On a `required` picker, a new student whose phone is not phone-shaped is reported to the form as **`null`**. Every caller's existing check (`student?.name.trim()`) then keeps Save shut. The picker keeps what is being typed in its own `draft`, so the phone field stays on screen. A value set from outside (a reset, a preset) still replaces the draft.
2. ⚠️ **The block applies only when the picker is `required`.** See Q3; it is user-visible on Team A's screen.
3. **The set is a plain list,** because the FRONT runner reads only that (`scripts/mutation/run.ts:66`). Bob's back-end object form with a `tests` field would crash it. The test list is: `src/components/common/student-select-task662.dom.test.tsx src/components/partials/Bookings/parent-phone-task662.dom.test.tsx`.
4. Phone rule copied, not imported: the front cannot import the back repo. The comment names the source so a drift is findable.

**Verification:**
- `bunx tsc --noEmit`: exit 0, no output.
- `bun test src/components/common/student-select-task662.dom.test.tsx src/components/partials/Bookings/parent-phone-task662.dom.test.tsx`: **10 pass / 0 fail**.
- Mutation set: `bun run mutation:run -- --tests "<the two files>" --mutations src/components/common/student-select-task662.mutations.json`
  ```
  BASELINE 10 pass / 0 fail
  P1 default flipped to false ............ BITES 6 pass / 4 fail
  P2 import's false removed .............. BITES 9 pass / 1 fail
  P3 9-digit floor lowered to 8 .......... BITES 8 pass / 2 fail
  P4 block on a NOT-required picker ...... BITES 9 pass / 1 fail
  P5 strict screen keeps "(optional)" .... BITES 9 pass / 1 fail
  CHECKSUM identical
  ```
- Full `bun test`: **973 pass / 1 fail across 107 files**. The 1 fail is `lib/ui/masked-input-assert.test.ts` "the rule APPLIES to a real file today". It pins the exact list of in-scope files, and my caller test is now in scope (see Q1).
  - My tests first tripped two repo rules: a `toBeNull()` on a node (TASK-596) and "types into a screen that has a `NumberInput`" (TASK-567). **Both are fixed in my files:** a boolean assertion, and the act's arguments read as `.args`.
  - The tree holds no one else's uncommitted work (clean at start).
- `bun run build`: passes (`[postbuild] copied .next/static into .next/standalone`).
- 🚫 No click on sid or uat (owner ruling). The QA hand-off below is unchanged.

**Footprint:** no data anywhere. The mutation runner restored every file (`CHECKSUM identical`). `.next/` was rebuilt.

**Not done, and why (2026-10-04):** part 5 was blocked on Q2. The strict screens must not ship on DRAFT wording (Q4).

### Round 2 — Q1 + Q2 granted (Fanta, 2026-10-05)
**Files added to the list above:**
- `M src/lib/ui/masked-input-assert.test.ts`: **one line**, `"src/components/partials/Bookings/parent-phone-task662.dom.test.tsx"` added to the pinned list. Nothing else.
- `M src/lib/api/client.ts`: `isStudentPhoneIssue` (a type guard, no casts) and `studentPhoneSentence` (module-private). The interceptor now builds `ApiClientError` with `studentPhoneSentence(body.error) ?? body.error.message`. The sentence is used **only** for `code === "VALIDATION"` with `details` a list holding an issue whose `path` is **exactly** `["student","phone"]`. `code`, `status` and `details` are always passed through unchanged. No other line in the file changed.
- `?? src/lib/api/client-student-phone-task662.test.ts`: 10 tests through the **real** `api` instance, with a stand-in adapter in place of the network.
  - **Matching:** Bob's captured shape gives the sentence and keeps `details` whole. The sentence is also found among other issues.
  - **Non-matching, byte for byte against the server's own `message`** (plus `code`, `status`, `details`): a different code · a different code with details · VALIDATION at a different path · VALIDATION at another `phone` (`teacher.phone`) · VALIDATION one level deeper (`student.phone.x`) · VALIDATION with no details · VALIDATION with non-list details · a `student.phone` issue under `CONFLICT`. Porter's four cases are all included, plus four more.
  - 📌 **Found while proving it:** 18 DOM tests `mock.module("@/lib/api/client")`, and Bun keeps a module mock for the rest of the run. So this file passed 10/10 alone and **failed 10/10 in the full suite**, because it was testing another file's stand-in. Fixed by importing the real module through its own specifier (`./client.ts?task662-real`), which is a separate instance of the same source. Recorded in SYSTEM-FACTS.

**Set** `student-select-task662.mutations.json`, now 9 rows. Command: `bun run mutation:run -- --tests "src/components/common/student-select-task662.dom.test.tsx src/components/partials/Bookings/parent-phone-task662.dom.test.tsx src/lib/api/client-student-phone-task662.test.ts" --mutations src/components/common/student-select-task662.mutations.json`
```
BASELINE 20 pass / 0 fail
P1 default false ............................ BITES 16/4
P2 import's false removed ................... BITES 19/1
P3 floor 9 → 8 .............................. BITES 18/2
P4 block on a NOT-required picker ........... BITES 19/1
P5 strict screen keeps "(optional)" ......... BITES 19/1
C1 fires on ANY VALIDATION issue (asked) .... BITES 16/4
C2 path check loosened (asked) .............. BITES 19/1
C3 code check dropped ....................... BITES 19/1
C4 interceptor ignores the sentence ......... BITES 18/2
CHECKSUM identical
```

**Verification (round 2):** `bunx tsc --noEmit` exit 0 · **`bun test`: 984 pass / 0 fail across 108 files** · `bun run build` passes. The tree holds only my files (`git status`: 5 M, 4 ??).
- ⚠️ `client.ts` tests print `ECONNREFUSED`: next-auth's `getSession` in the request interceptor tries `http://localhost/api/auth/session`, which is refused. It is local; no real environment is reached, and the adapter answers the request itself.

**Holding (Q4):** the owner's wording has not landed (checked the 10-04 log and the copy files). When it does: if the words differ from the draft, I update the two keys; then I remove the two `📋 DRAFT wording` markers and submit.

## Questions
(Fanta asks; Silver answers as `> answer: ...`.)
All four at once. Parts 1–4 are built; Q1, Q2 and Q4 block the REVIEW.
- **Q1 — a pinned list outside the claim (BLOCKS a green suite).** `src/lib/ui/masked-input-assert.test.ts:162` pins the exact list of DOM tests whose screen has a `NumberInput` and that type into it. `ImportBalanceModal` and `CreateCourseModal` contain `NumberInput`s, and my caller test types (the name and the phone, not a number box), so the sweep now finds it. My test SATISFIES the rule (it asserts the act's `.args`); only the pinned list is short by one. The fix is one line, adding `"src/components/partials/Bookings/parent-phone-task662.dom.test.tsx"` to that list, the same way TASK-577 and TASK-634 each added theirs. The file is not in our claim. May I add that one line?
  > answer (Silver, 2026-10-04): **Correctly stopped.** That file is outside the claim, so it is @Porter's to grant. I have asked him, **recommending YES**: one line, the same way TASK-577 and TASK-634 added theirs, and your test satisfies the rule rather than evading it. 🚫 Do not add it until he grants it.
- **Q2 — part 5 needs `src/lib/api/client.ts` (outside the claim): STOP, as the TASK says.** The specific sentence is in `details`, and the `ApiClientError` already carries `details` (`client.ts:21`). But every caller shows `e.message` (`CreateCourseModal:139`, `ImportBalanceModal:202`, and Team A's `BookingModal`). So without a caller change, the only place is the response interceptor (`client.ts:76-82`).
  - Proposal, about 3 lines: when `code === "VALIDATION"` and `details` holds an issue whose `path` is `["student","phone"]`, build the `ApiClientError` with **that issue's `message`** instead of the generic line. Every other refusal is unchanged; `details` is still carried.
  - It reaches every screen at once, Team A's included, with no caller edit.
  - "On the phone field" is not reachable without a caller change: the error renders in each form's own Alert. Grant `client.ts` for that one branch, or rule otherwise.
  > answer (Silver): **Correctly stopped. I have asked @Porter for `client.ts`, recommending your interceptor branch exactly as proposed.**
  - Narrow it to `code === "VALIDATION"` **and** an issue whose `path` is exactly `["student","phone"]`. Every other refusal stays byte-identical, and `details` is still carried.
  - One place, every screen including Team A's, and no caller edits. That is better than "on the field", which would need three callers changed.
  - 🚫 Wait for his grant.
- **Q3 (user-visible, Team A's screen): the optional student on the อื่นๆ booking (`BookingModal.tsx:1581`, no `required`).** There, `null` means "no student". If the picker blocked by reporting `null`, that booking would save **without the name the admin typed**, and the title becomes the only name. So as built, a NOT-required picker shows the required label and the error but still reports what was typed. A phoneless new name there reaches the server, which refuses it, and that is readable once Q2 lands. Making that screen also wait would need a caller change in Team A's file. Keep as built?
  > answer (Silver): **Keep it as built.** Silently dropping a name the admin typed is worse than a readable refusal. And the owner's ruling is that the booking path may not create a parentless child, which covers the อื่นๆ booking too. With Q2, the refusal reads as our sentence.
  - 📌 It is a visible change on **Team A's screen**: an อื่นๆ booking with a typed new name now needs a phone. **I have told @Porter**, so he can tell Team A or overturn it.
- **Q4 — wording (Porter's condition): NOT approved yet.** The two keys ship marked `📋 DRAFT wording`. Porter's rule: if the owner's approval has not landed when this is otherwise ready, STOP. I am stopping on it together with Q1 and Q2. The words are §1 of the copy draft, unchanged.
  > answer (Silver): **Correct: we stop on it.** That is Porter's condition. The wording is with him for the owner, in the round's copy batch. When it is approved: if the approved words differ from the draft, update the two keys; then remove the DRAFT markers and submit.

## Review
**Silver, 2026-10-05 — ✅ ENGINEERING ACCEPTED. Final DONE is held ONLY on the owner's wording (Q4).**
- **Round 1 (parts 1–4), read 10-04:** the default `requireParentPhone = true` (fails closed); a required picker reports `null` until the phone is phone-shaped, so every form's own check holds; the draft stays on screen; the import passes `false`; only two `student.*` keys added, with DRAFT markers. All sound.
- **Round 2, read today:**
  - **`client.ts` is exactly Porter's scope:** one changed line in the interceptor (`studentPhoneSentence(body.error) ?? body.error.message`) plus a type guard. It fires only on `VALIDATION` with a `details` issue at **exactly** `["student","phone"]`, and `code`, `status` and `details` pass through.
  - **The proof Porter required is there and goes further than asked:** 8 non-matching cases pinned byte for byte, including his 4.
  - C1–C4 bite, including "fires on any VALIDATION" and "path check loosened", which were the two he asked for.
  - `masked-input-assert.test.ts`: the one pinned line, nothing else.
- **The module-mock finding is valuable** (it passed alone and failed in the suite, because Bun keeps a `mock.module` for the run). It was fixed with a separate real-module specifier and recorded in SYSTEM-FACTS. ✅
- **Re-run by me:**
  - the 4 related files → **30 / 0**;
  - **full front suite → 984 / 0** (108 files);
  - `tsc --noEmit` → exit 0;
  - `git status` shows only these files.
- 🔴 **Remaining, and it is not engineering:** the owner's approval of the two keys' wording.
  - When it lands: if the approved words differ, update the two keys; then remove both `📋 DRAFT wording` markers and re-run this TASK's tests.
  - I will check only that diff, and then mark it DONE.
- 🔴 **Ships ONLY together with TASK-644** (Porter has adopted that ruling).

## Final step (Silver, 2026-10-05): Q4 ANSWERED, the owner APPROVED §1 verbatim
- Approval record: `COPY-DRAFT-parent-phone-required-teamB-2026-10-04.md` § "OWNER APPROVED, 2026-10-05".
- @Fanta:
  - the approved words **are** your two keys' words, so **remove both `📋 DRAFT wording` markers only**;
  - 🚫 do not touch the strings;
  - re-run this TASK's tests and send me that diff. Then I mark it DONE.

### Final step done (Fanta, 2026-10-05)
- **Only the two marker comments changed. The strings are byte-unchanged** (`dictionaries.ts`):
  ```
  - // 🔴 TASK-662 — 📋 DRAFT wording (Silver, COPY-DRAFT-parent-phone-required-teamB-2026-10-04.md §1; not yet approved).
  + // 🔴 TASK-662 — ✅ owner-approved 2026-10-05, verbatim (COPY-DRAFT-parent-phone-required-teamB-2026-10-04.md §1).
  - // 🔴 TASK-662 — 📋 DRAFT wording (see the EN block).
  + // 🔴 TASK-662 — ✅ owner-approved 2026-10-05 (see the EN block).
  ```
  `git diff -U0` against HEAD shows the four key lines exactly as the draft (`Parent phone` / `A new student needs a parent phone, so the parent can see the classes in LINE.` / `เบอร์ผู้ปกครอง` / `นักเรียนใหม่ต้องมีเบอร์ผู้ปกครอง เพื่อให้ผู้ปกครองเห็นคลาสของน้องใน LINE ได้`).
- **Re-run:**
  - this TASK's 4 files + `src/lib/i18n` → **37 pass / 0 fail**;
  - `tsc --noEmit` exit 0;
  - set `student-select-task662` **9/9 BITES**, checksum identical (re-run after TASK-664 also touched `StudentSelect.tsx`);
  - full suite (with TASK-664 in the tree) **991 / 0 across 110 files**; build ok.

- ✅ **Final step accepted (Silver, 2026-10-05):** only the two marker comments changed. A machine check finds all 4 key strings equal to the approved §1. Full front suite 991/0, tsc 0. **TASK-662 is FINAL.**
