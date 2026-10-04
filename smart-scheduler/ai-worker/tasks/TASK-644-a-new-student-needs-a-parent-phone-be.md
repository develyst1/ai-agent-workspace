# TASK-644 — piece A (BE): the server refuses a NEW student with no parent phone on booking, new course and new voucher — BE, S
- Source: `SIZING-parentless-children-2026-10-04.md` (@Sober) **Addendum 2 is binding** · `DIAG-parent-resolves-to-no-children-2026-10-04.md` · owner's ruling that imports are exempt · @Porter assigned TASK-644 to Team B on 2026-10-04
- Status: DONE (reviewed by Silver, 2026-10-04) · 🔴 ships ONLY together with TASK-662 (the FE half)
- Repo: `smart-scheduler-back` · Assignee: @Bob · From: @Silver (2026-10-04)
- Depends on: none. **Ships first.** The front half is `TASK-662` (Fanta), and the server does not wait for it.
- Claim: `src/validation.ts` + its test(s) are Team B's (board, `## Batch claims`). 🚫 **Do NOT edit `src/services/scheduler.service.ts`** (`resolveStudentId` is Team A's). This TASK needs nothing there.

## §0 Why (CERTAIN; read by me)
- **The one place a parentless child is born is `resolveStudentId`.** It inserts an inline NEW student with `parentId: null` when no phone is given.
- **The hole is the validator:** the inline branch of `studentInput` (`validation.ts:141-148`) has `phone: z.string().trim().optional()`.
- **Five acts share that one schema:**

  | act | route | schema line | rule |
  |---|---|---|---|
  | `createBooking` | `POST /bookings` | `:154` (`student` is `.optional()` there; keep that) | **strict** |
  | `createCoursePackage` | `POST /courses` | `:294` | **strict** |
  | `createVoucher` | `POST /vouchers` | `:380` | **strict** |
  | `importCoursePackage` | `POST /courses/import` | `:853` | **optional** |
  | `importVoucher` | `POST /vouchers/import` | `:900` | **optional** |

- ⚖️ **Owner's ruling:** an IMPORT may proceed without a household, and the booking path may not.
  - 🔑 **The server is the authority, per ACT, not per screen.**
- 📌 The live harm: 4 households on uat (and 21 parentless children) were cut off from every parent door. The traced case (Ari) came from this exact path.

## What to do
1. **Two input shapes in `validation.ts`:**
   - **strict:** `{ id }` OR an inline `{ name, nickname?, phone }` where `phone` is **required and phone-shaped**: at least 9 digits, and digits and phone separators only. That is the same rule as `isPhoneShaped(q)` with its default floor of 9 (`parent.service.ts`, also Team B's).
   - **optional:** today's `studentInput`, unchanged.
2. Use **strict** in `createBooking`, `createCoursePackage` and `createVoucher`. Keep **optional** in `importCoursePackage` and `importVoucher`.
   - `createBooking.student` stays `.optional()`, because an `OTHER` booking takes no student. Only its inline branch becomes strict.
3. **The refusal sentence:** use the server line in `COPY-DRAFT-parent-phone-required-teamB-2026-10-04.md` §2, marked `📋 DRAFT wording (owner approves with the next copy batch)`. Pin it by SHAPE (refused, the field path, a non-empty message), **not by the words**.
   - Follow `validation.ts`'s own convention for language (it is Thai-led).
4. **Decide and declare:** where the phone-shape test is imported from.
   - If importing `parent.service.ts` into `validation.ts` would drag the DB module into the validator, move `normalizePhone` / `isPhoneShaped` into a small pure `src/lib` file **and re-export them from `parent.service.ts`**, so every existing caller is byte-unchanged.
   - Say which you chose and why.
5. 🚫 **Out of scope (flagged by Sober, not ours now):**
   - the picker's typed-but-not-picked trap;
   - `SellCampDialog` sending only an id;
   - an `{ id }` pointing at an archived student;
   - Piece C (the DB `CHECK`), which is retired.

## Definition of Done
- [ ] **Schema tests, pure, all five acts:**
  - an inline student **without** a phone is refused by the 3 strict acts and **accepted** by the 2 import acts;
  - an inline student with a **junk phone** (`1`, `12345`, `0812`) is refused by the strict acts;
  - a **valid phone** (`0812345678`, `081-234-5678`, `+66 81 234 5678`) is accepted;
  - **`{ id }` is accepted everywhere**;
  - an **`OTHER` booking with no student** is still accepted.
- [ ] **One test through the root app** (`POST /api/bookings` with an inline student and no phone) shows the HTTP refusal shape the front end will receive (status + body). Paste it in your notes; Fanta's TASK-662 reads it.
  - ⚠️ `zValidator` answers directly and `app.onError` is not on that path (SYSTEM-FACTS).
- [ ] **Mutation set** `src/lib/parent-phone-required-task644.mutations.json`, with its own test list. At minimum:
  - strict made optional (bites);
  - the import acts made strict (bites, which proves the exemption is pinned);
  - the phone floor lowered to 1 (bites);
  - `{ id }` broken (bites).
- [ ] Full suite with **no reachable database** (the SYSTEM-FACTS recipe) plus `tsc --noEmit`. Say that the tree may hold Team A's uncommitted work.
- [ ] `git status`: `validation.ts`, its tests, the mutation set, and (only if step 4 needs it) the new pure lib file plus a re-export line in `parent.service.ts`. Nothing committed.

## For the QA hand-off
- **API:**
  - `POST /api/bookings`, `/api/courses` and `/api/vouchers` with `student: { name: "Test Kid" }` and no phone → **refused**, with nothing created (no student row).
  - The same with `phone: "0812345678"` → created, and the student **has a parent**.
  - `POST /api/courses/import` with no phone → **still accepted** (the owner's exemption).

## Implementation Notes
**Bob, 2026-10-04.**

**What changed (`smart-scheduler-back`, nothing committed):**

| file | change |
|---|---|
| `src/validation.ts` | `studentInputStrict` = the SAME `studentInput` union + one `.superRefine` (an inline student without a phone-shaped `phone` ⇒ ONE issue at `student.phone`) · `NEW_STUDENT_PHONE_REQUIRED` (the DRAFT TH sentence, exported so tests and FE pin by reference) · strict on `createBooking.student` (still `.optional()`), `createCoursePackage`, `createVoucher` · **imports unchanged** (`studentInput`) |
| `src/lib/phone.ts` (new) | `normalizePhone` + `isPhoneShaped`, **moved verbatim** |
| `src/services/parent.service.ts` | the two definitions are replaced by `import { isPhoneShaped, normalizePhone } from "../lib/phone"; export { … }` |
| `src/validation.parent-phone-task644.test.ts` (new) | 46 tests |
| `src/validation.test.ts` | one fixture key fixed, see below |
| `src/lib/parent-phone-required-task644.mutations.json` (new) | the mutation set |

`scheduler.service.ts` is **not touched**.

**Decide and declare:**
- **Step 4: I moved the helpers to `src/lib/phone.ts` and re-exported them from `parent.service.ts`.** `parent.service.ts` imports `../db`, so importing it into `validation.ts` would drag the DB module into every validator. Every existing importer (`routes/checkin.ts`, `line-webhook.service.ts`, the tests) is byte-unchanged.
- **A refinement on the existing union, not a second union.** With zod 4, a union where both branches fail answers one vague `invalid_union` at `student`. The refinement gives one precise issue at `student.phone` carrying our sentence, and leaves the accepted shapes exactly as they were.
- **Language:** `validation.ts` messages are Thai-only, so the TH line of the draft is used and the EN line is not.

⚠️ **Two findings:**
1. **The draft sentence will NOT be in the red box.**
   - `lib/validate.ts` (TASK-296, by design) answers EVERY refusal with the generic `message` *"ข้อมูลที่กรอกไม่ถูกต้อง กรุณาตรวจสอบแล้วลองใหม่อีกครั้ง"*. The specific issue rides only in `error.details`.
   - So the backstop refuses correctly, but the admin reads the generic line unless TASK-662's front end reads `details[*].message` where `path` is `["student","phone"]`.
   - I did not touch `validate.ts`; it is not this TASK's file, and the generic-message rule is deliberate. **This one is for you and Fanta.**
2. **`validation.test.ts`'s `base` fixture (TASK-138) sent `student: { name, parentPhone }`.** `parentPhone` is not a field of the inline student (it belongs to `POST /students`), so zod stripped it.
   - That test has always sent a phoneless new student, and it went red (6 tests) once the booking acts became strict.
   - Fixed to `phone` with a comment saying why; the TASK-138/148 assertions are unchanged.
   - I checked the real caller first: `StudentSelect.tsx` (front) sends `{ name, phone }`, so no screen is affected.
   - Recorded in `SYSTEM-FACTS.md`, beside the `zValidator` section.

**🔑 The HTTP refusal for Fanta (TASK-662)** — `POST /api/bookings` with `student: { name: "Test Kid" }` and no phone, through the root app, service spied and **never called**:
```
400
{"error":{"code":"VALIDATION","message":"ข้อมูลที่กรอกไม่ถูกต้อง กรุณาตรวจสอบแล้วลองใหม่อีกครั้ง","details":[{"code":"custom","path":["student","phone"],"message":"นักเรียนใหม่ต้องมีเบอร์โทรผู้ปกครอง (อย่างน้อย 9 หลัก) — ถ้าเป็นนักเรียนที่มีอยู่แล้ว ให้เลือกจากรายชื่อแทน"}]}}
```
- Exactly ONE issue, and the test pins `details` to that single element.
- The words are a DRAFT, pinned by reference to `NEW_STUDENT_PHONE_REQUIRED`, never by literal. Changing the wording is one line.

**Tests (`validation.parent-phone-task644.test.ts`, 46):**
- Each act's fixture is first proven valid with `{ id }`, so every verdict below is about the student alone.
- **Strict acts (×3):**
  - no phone ⇒ refused, with the issue at `student.phone` and our message;
  - junk `1` · `12345` · `0812` · `""` · `"   "` · `081x2345678` ⇒ refused;
  - `0812345678` · `081-234-5678` · `+66 81 234 5678` ⇒ accepted.
- **Import acts (×2):** no phone ⇒ accepted, and `1` ⇒ accepted (today's shape).
- `{ id }` is accepted by all 5.
- An `OTHER` booking with no student has no issues.
- The root-app HTTP test is above.

**Mutation set `parent-phone-required-task644`** (`tests` = the task file plus `validation.test.ts`, `validation.booking-refine.test.ts`, `validation.import.test.ts`; anchors checked to match exactly once):
```
baseline 69
P1  BITES (47 pass / 22 fail) — strict made optional — the refinement never fires
P2a BITES (67 / 2) — importCoursePackage made strict (the owner exemption lost)
P2b BITES (67 / 2) — importVoucher made strict (the owner exemption lost)
P3  BITES (60 / 9) — the phone floor lowered to 1 digit (a junk `1` passes)
P4  BITES (60 / 9) — { id } broken — an existing student is asked for a phone too
P5  BITES (61 / 8) — createBooking alone loses the strict shape (per-ACT, not per-schema)
CHECKSUM identical
```
- **6 BITES · 0 SURVIVED · 0 NO RESULT.** P2a/P2b prove the import exemption is pinned, and P4 proves `{ id }` is.

**Runs (no reachable database, the SYSTEM-FACTS recipe; `.env` untouched):**
- Full suite: **3966 pass / 0 fail, 3966 tests across 313 files**.
  - The tree also holds **Team A's uncommitted TASK-645 work** (`course-plan.ts`, `scheduler.service.ts`, two tests and a mutation set). It is included in the count, and nothing failed.
- `bunx --package typescript@5.6.3 tsc --noEmit` → **exit 0**.
- `git status` (mine):
  - `validation.ts`, `validation.test.ts`, `parent.service.ts`;
  - new: `lib/phone.ts`, `validation.parent-phone-task644.test.ts`, `lib/parent-phone-required-task644.mutations.json`.
- Nothing committed.

## Questions
(Bob asks; Silver answers as `> answer: ...`.)

## Review
**Silver, 2026-10-04 — ✅ DONE (built and reviewed). 🔴 Ships ONLY together with TASK-662.**
- **Diff read in full:**
  - `lib/phone.ts` is a **verbatim** move, and still carries TASK-660's `minDigits`.
  - `parent.service.ts` re-exports, so every caller is byte-unchanged.
  - `validation.ts` uses the same union plus one `superRefine`: strict on the 3 booking acts (`createBooking.student` still `.optional()`), and the imports are untouched.
  - `scheduler.service.ts` is not touched.
- **Decisions accepted:**
  - the pure lib move: the right fix, because the validator must not import the DB module;
  - refine rather than a second union: one precise issue at `student.phone` instead of zod's vague union error;
  - TH-only, following `validation.ts`'s convention.
- **The fixture fix in `validation.test.ts` (`parentPhone` → `phone`) is accepted.** That test had always sent a phoneless new student without knowing it. You checked the real caller first, and you recorded it in SYSTEM-FACTS.
- **Re-run by me, with no reachable database:**
  - the task file + `validation.test`, `booking-refine`, `import` + `parent.service` + the two LINE phone-silence tests (the moved helpers' callers) → **120 / 0**;
  - `tsc --noEmit` → exit 0.
  - ⚠️ The tree also holds Team A's uncommitted TASK-645 work.
- **Mutation set:** 6 BITES / 0 / 0. P2a and P2b pin the owner's import exemption, P4 pins `{ id }`, and P5 proves the strict rule is per ACT.
- 🔴 **Your finding changes the shipping plan, and it is the most valuable thing in this TASK.**
  - The specific sentence travels only in `details`. `lib/validate.ts` shows every refusal as one generic line, by design.
  - ⇒ **The server must NOT ship ahead of the picker.** Alone, it would give an admin "invalid data" beside a field labelled "(optional)".
  - ⇒ **TASK-644 and TASK-662 ship together or not at all.** That is my ruling, sent to Porter.
  - Fanta reads `details` for this path (TASK-662 §5).
  - 📌 This supersedes the sizing's "A's server half may ship first" for this batch. The reason is the generic-message design, which was not visible at sizing time.

## Final step (Silver, 2026-10-05): the owner APPROVED the wording verbatim
- Approval record: `COPY-DRAFT-parent-phone-required-teamB-2026-10-04.md` § "OWNER APPROVED, 2026-10-05" (relayed by Porter, `log/2026-10-05.md`).
- @Bob:
  - **remove the `📋 DRAFT wording` marker** from the `NEW_STUDENT_PHONE_REQUIRED` comment in `validation.ts`;
  - 🚫 **do not change the sentence**: it is approved verbatim;
  - re-run the task file (no DB) and paste the diff. Then this stays DONE and ships with TASK-662.
- ✅ **Done (Bob, 2026-10-05):** the marker is off. The sentence is **not touched**: `grep -c` of the approved TH line in `validation.ts` = 1, the same bytes.
  - The diff, the only change:
    ```
    160c160
    <  * 📋 DRAFT wording (owner approves with the next copy batch) — `COPY-DRAFT-parent-phone-required-teamB-2026-10-04.md` §2.
    ---
    >  * ✅ Owner APPROVED verbatim 2026-10-05 — `COPY-DRAFT-parent-phone-required-teamB-2026-10-04.md` §2 · 🚫 do not improve an approved string.
    ```
  - `bun test src/validation.parent-phone-task644.test.ts` (no DB) → **46 pass / 0 fail**. After TASK-663's edits, the set `parent-phone-required-task644` is still **6 BITES · 0 · 0**.
  - 📌 The task test file still has one comment calling the words "a DRAFT" (`// pinned by SHAPE — the words are a DRAFT`). You said marker only, so I left it; it is one word to change if you want it.
- ✅ **Final step accepted (Silver, 2026-10-05):** the DRAFT marker was replaced by the approval note. A machine check confirms the sentence equals the approved §2 TH exactly. The 644 tests are green in my 99/0 re-run. **TASK-644 is FINAL**, and it ships with TASK-662.
