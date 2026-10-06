# TASK-690 — BE: **a new cancel reason, `ปัญหาจากทางเรา` ("a problem on our side") — the lever for REQ-112's trigger T3** — @Jason (S)
**From @Sober to @Jason.** ⚖️ **Owner ruling 2026-10-06 (LOCKED): add the reason.** **It is the ONLY thing that carries trigger T3 (`TASK-656` §R1): a session the school cancels for its own reason ⇒ +1 week.** **Do this BEFORE wiring door 4/5 in `656`'s re-aim — they read it.**
✅ **Claim (Team A):** `src/lib/course-plan.ts` (`END_REASONS` — or a sibling set, see §2) · `src/validation.ts` (the reason enums only) · `src/lib/line-i18n.ts` + `src/lib/line-message.ts` (the reason label only) · a NEW migration (`0066`) · `src/lib/migration-witness.ts` (its witness) · co-located tests. 🚫 **Not the front** — that is `TASK-691` (@Fern).
⚠️ **No database anywhere — the DB-unreachable run only.** **The migration is written and pinned; the OWNER runs it on deploy.**

## 1. 🔴 The closed list lives in THREE places — miss one and it is a 500 on live (`0045`, TASK-410, already happened once)
1. **the code set** (`END_REASONS`, `course-plan.ts:437`) · 2. **the validator** (`validation.ts:419` `reasonCode`, and `:680` the series cancel-all) · 3. **the database CHECK** `bookings_cancel_reason_chk` (redefined in `0045`).
▶️ **A new migration `0066` that DROPS and RE-ADDS the CHECK with the new code** — exactly `0045`'s shape, hand-authored and journal-registered per `drizzle/README.md` (🚫 no `db:generate`). **Count the files and tags at the moment of writing; state the count in the file, as `0045` did.** **Witness it in `migration-witness.ts`.** **The suite's existing pin (the CHECK's list ⇔ `END_REASONS`) must pass with the new code.**

## 2. ⚠️ Session cancel ONLY — 🚫 not a reason to END A COURSE
**`END_REASONS` is ALSO the closed set for ending a whole course (`coursePackages.endReason`, its own CHECK `0023`).** **"A problem on our side" is about ONE missed class, not ending a purchase.** ▶️ **The new code is valid for a SESSION cancel (`bookings.cancel_reason`), the group-date cancel and the series cancel-all — 🚫 NOT for a course end.** **If that needs a separate session-reason set beside `END_REASONS`, make it, and pin that the course-end set is UNCHANGED (still 3) and its CHECK `0023` untouched.** **Tell me which shape you chose and why.**

## 3. The code and its words
- **Code name:** a stable English token (e.g. `SCHOOL_ISSUE`) — your choice, stated in the report.
- **TH label (the customer's own words): `ปัญหาจากทางเรา`** · **EN: `A problem on our side`** — 📋 **both ride the round's ONE copy set via @Porter; ship them marked DRAFT until I say approved.**
- **The LINE cancel notice's reason line** reads the same label (`ob_reason_<code>`).

## 4. ✅ Done means
**`tsc` · suite with COUNTS · `66 .sql = 66 journal tags`** · **pins: the three copies agree (incl. the CHECK text) · the course-end set unchanged · the label in both languages** · **mutations, list in the file: the code missing from the validator (BITES) · missing from the CHECK (BITES) · accepted on a course end (BITES).**

## ✅ 2026-10-06 (night) — @Jason: `TASK-690` DONE — migration **`0065`** (not `0066`), a SIBLING reason set, 9/9 bite
**`tsc` 0 · the DB-unreachable suite 4098 pass · 1 fail (TASK-667's own mutation set — not mine, reported separately) · `66 .sql = 66 journal tags`.**
**Set: `src/lib/school-issue-reason-task690.mutations.json` — 9 / 9 BITE**, baseline 69, CHECKSUM identical, every restore byte-identical. **Test list in the file.**
🔴 **THE OWNER RUNS `0065` ON DEPLOY. It is written, journal-registered, witnessed and pinned; nothing ran against any database.**

### 📌 The migration NUMBER — reported at the moment it existed, and it is NOT what the task said
**`0065`, the 66th file.** Counted at the moment of writing: 65 files / 65 tags, newest `0064`, **no `0065` anywhere (tree, git, any branch) and none reserved** — and the task's own done-means (*"66 .sql = 66 journal tags"*) only works with `0065`. **If `0066` was reserved for something I cannot see, it is a rename and one journal line — say so.** The count and the reason are stated IN the file, as `0045` did.

### Which SHAPE I chose, and why — §2's question
**A SIBLING set: `SESSION_CANCEL_REASONS = [...END_REASONS, SCHOOL_ISSUE]`** (code `SCHOOL_ISSUE`), **derived by SPREAD — never re-typed.**
- **`END_REASONS` is UNCHANGED** and keeps its job as the closed set for ENDING a **course** (`course_packages_end_reason_chk`, 0023) and a **voucher** (`vouchers_end_reason_chk`, 0051). **Adding the code to it would have made `endCourse` ACCEPT it and Postgres refuse it — a 500, not a 400.** `M4` does exactly that and bites.
- 🔑 **Your "still 3" was slightly off, and the shape depends on it:** `END_REASONS` has **FOUR** (`TEACHER_LEAVE` joined in TASK-406). It is the **course-end CHECK `0023`** that lists **three**, and the voucher-end CHECK `0051` lists four. **All three are pinned by value, and `0065` does not touch either — asked of the SQL STATEMENTS, not the file's text.**
- **The code is valid for:** a session cancel (the status route), a group-date cancel (it is a `GROUP` row through the same route) and the series cancel-all. **REFUSED at the door for a course end and a voucher end** (`isEndReason` stays on both, pinned by count: exactly two, and no `isSessionCancelReason` on an END) — **by value, through the real `endCourse`: 400 `INVALID_REASON`.**

### The three copies — pinned to AGREE, in order
**the code set ⇔ the validator ⇔ the database CHECK, read from the migration's own text.** **`M1` (missing from the validator), `M2` (missing from the CHECK — the 0045 incident again) and `M3` (accepted on a course end) are the three you named, and each bites.** ✅ **The suite's existing CHECK⇔code pin passes with the new code — it fired exactly as written ("a 5th code fails here until a migration carries it") and it was the MIGRATION that had to catch up.**

### The label — 📋 DRAFT, both languages
**TH `ปัญหาจากทางเรา` (the customer's own words, verbatim) · EN `A problem on our side`**, `ob_reason_SCHOOL_ISSUE`, marked DRAFT in the dictionary until you say approved. **Read by the SAME `cancelReasonText` the coach's and family's cancel notices use — the CODE wins over free text** (`M6` swaps the reader and bites; `M7` paraphrases the Thai and bites).

### ⚠️ What I did to existing pins — each with its reason
**61 hand-maintained "N migration files / N tags" pins moved 65 → 66** (scripted, constrained to count lines, `· 🔻 TASK-690: +0065` appended per the file's own convention). **My filter was too narrow on three — they count WITNESSES and `tags` (I added a witness too) — caught because the suite said so, and widened.**
**Four REASON pins were narrowed, not made green:**
- **`cancel-reason.test` ("one vocabulary, not two — the enum is imported, never re-declared")** — **the PRINCIPLE is kept and now asserted in a stronger form: the sibling is DERIVED by spread, so "find every admin-error cancel" is still ONE query over ONE set of codes. What the pin forbids is a second LITERAL list, and that is still asserted.**
- **`teacher-own-calendar-req097`** — the status route reads the session set; **a third migration now touches the constraint**; the CHECK's list ⇔ the session set, in order.
- **`teacher-told-on-cancel-req089`** — the labels cover **exactly the session set** (five), and the new label is held to the same both-languages bar, plus by value.
⚠️ **And one of mine, the SAME mistake as `expiryAfterAppends`: my own migration's header comment NAMES `course_packages_end_reason_chk` (to say it is unchanged), so a raw-text "this file does not mention it" check read my explanation as the thing it forbids.** 🔑 ***An absence claim about SQL has to be asked of SQL — statements, not prose.***

### ❓ FLAGGED, not touched — a FOURTH copy of the list, outside my claim
**`src/openapi/document.ts` → `UpdateStatusRequest.reasonCode.enum` lists THREE codes.** **It was ALREADY stale (it has missed `TEACHER_LEAVE` since TASK-406) and is not in 690's claim, so I left it — and pinned it as what it is, so it cannot drift further unnoticed.** ▶️ **Yours: claim it and it is one line, or leave the doc stale.**
**Door 4 has nothing to read yet:** a COURSE-session cancel **IGNORES `reasonCode` entirely today** (`enumReason` is computed only for single/voucher/trial/other/group rows — "so a course-session cancel is byte-identical"). **That is 656 §R's job, and I will carry ONLY the new code on course cancels so every other course cancel stays byte-identical.**
