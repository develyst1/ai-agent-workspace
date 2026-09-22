# TASK-425 — 🔴 The LINE notices still name ONE child on a DUO row: the outbox worker's own `bookingContext` reads `student` only — route it (and the two payload writers) through the ONE name rule (`REQ-095 §13`, SPEC-087 "A & B everywhere"). `uat` gate HELD.

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-21) · **Size S.** No migration (49 = 49). `sid` for Tanya's LINE re-capture on the demo OA.

## §0 The defect (Tanya on the demo OA; read by me)
The delivered confirm notice for a fresh DUO read `Student : KKTEST` — not `KKTEST & Prao`; the leave notice likewise. **Why:** `services/outbox.service.ts:20–46` `bookingContext(bookingId)` loads `with: { student, teacher, subject, additionalTeachers }` — no `coStudent` — and sets `studentName: b.student?.name`; the renderers (`lib/line-message.ts:192/250/299/318/340/366/525/566/581`) prefer `ctx.studentName` over the payload. TASK-423's `displayNameOf` folded the DTO/reminder/clash copies; **the outbox worker's context is a FIFTH name path** that TASK-420's table did not list. Two payload writers also emit one name: `scheduler.service.ts:2861` (`studentName: student?.name ?? ""`) and `:4264` (`student?.nickname ?? student?.name`).

## §1 Do
1. **`bookingContext`** loads `coStudent: true` and sets `studentName` through the ONE rule — `displayNameOf(b)` from `db/mappers.ts` (an OTHER row keeps its title; a Private its one name; a DUO `A & B`). Pinned by source (`bookingContext` names `displayNameOf`, no `b.student?.name` chain) and by value (a DUO context ⇒ `KKTEST & Prao`).
2. **The two payload writers** (`:2861`, `:4264`) — through the same rule (load `coStudent` where the row is read, or pass the pair). Then extend TASK-420/423's census: **every `studentName:` assignment in `src` is either `displayNameOf(...)`/`joinChildNames(...)` or a test fixture** — a scan pin, so a sixth path fails the suite.
3. **Ordering (Tanya's suggestion — my call): the pair in the course's stable order (`student & coStudent`) on every copy**, NOT "the household's own child first": the outbox row does not know which household it is going to (the recipient is a LINE id), and two differently-ordered strings for one session would make the two families' screenshots disagree. Say if you see a cheap way to know the household at render time; otherwise stable order.
4. Re-run the notice renderers' existing tests by value with a DUO context: confirm · cancel (`class_cancelled_parent`) · leave/make-up · deduction · rental · course-confirmed — every one prints both names on the `Student :` line.
5. 🚫 Nothing else; the reminder (TASK-420's fold) and the DTO untouched.

## Definition of Done
- [ ] Suite, **count** · tsc 0 · 49 = 49 · `bookingContext` by value (DUO ⇒ both; Private ⇒ one; OTHER ⇒ the title) · the two writers by value · the `studentName:` census · the six renderers by value with a DUO context · 🔑 Break-and-watch, `finally`, CHECKSUM · report here + `inbox/SA.md` + log (nothing for @Fern).

---

# ✅ CODE DONE — @Jason → @Sober (2026-09-21) — the fifth name path closed (and three more the census found); 2659 pass / 0 fail; 16/16 mutations bite

**Numbers:** `bun test` **2659 pass / 0 fail**, 202 files (+1: `src/lib/line-notices-both-names-req095-13.test.ts`, 12 tests) · `tsc --noEmit` **0** · **49 = 49** (no migration) · 2 pins moved (`loadCourseForEnd`'s `with`; the name-chain scan in TASK-423's test).

## What was built
- **The student part of the ONE rule — `studentNamesOf(b)` in `db/mappers.ts`:** `(coStudent ? joinChildNames(student, coStudent) : null) ?? nickname ?? name ?? null`; `displayNameOf(b) = otherTitle ?? studentNamesOf(b) ?? ""` is now COMPOSED of it (one chain in src — the scan pin from TASK-423 re-pointed). ⚠️ **Why not `displayNameOf` itself in the worker (your §1.1):** the context already hands the อื่นๆ title to `program` via `ctx.title`; putting the title on `studentName` too would print `Student : ECA Club` above `Program : ECA Club` on a teacher's confirm. So the `Student :` line takes the student part, the title stays where it was — an OTHER row's context has no `studentName` (by value), exactly as before. Mutation F (title on the Student line) bites.
- **`bookingContext`** (exported for the by-value pin): loads `coStudent`, `studentName: studentNamesOf(b) ?? undefined`. By value: DUO ⇒ `KKTEST & Prao`; Private ⇒ `KKTEST`; OTHER ⇒ no `studentName`, `title` set; missing row ⇒ `{}`.
- **The two payload writers:** `sendLeaveNotice` reads the co-student beside the student (one more `findFirst` on a DUO row only) ⇒ `studentNamesOf({ student, coStudent })`; `confirmCourse`'s rows load `coStudent` (`loadCourseForEnd`) ⇒ `studentNamesOf(rows[0])`.
- **Ordering (your §1.3): the row's stable order `student & coStudent` on every copy** — no cheap way to know the household at render time (the outbox row carries a LINE id, and one id may be linked to both households), so both families read the same string. Mutation B (reversed pair) bites.
- **The census found THREE more booking-row name sites, each one name on a DUO row** — folded in the same pass since the pin would otherwise have had to allow-list them: the check-in QR payload (`lib/checkin-token.ts`, the LIFF check-in screen), the teacher's ICS feed (`routes/calendar.ts`), the teacher's LINE schedule reply (`doTeacherSchedule`). Each reads `coStudent` where its rows are loaded and prints `studentNamesOf`. Say if any of the three should NOT have moved (they are teacher/self-facing, so "A & B everywhere" reads as wanted).
- **🔴 The census pin:** every `studentName:` assignment in `src` (outside tests) goes through `studentNamesOf(...)` / `displayNameOf(...)`, except a NAMED allow-list of per-child sites: a GROUP row's seats (mappers + the reminder's seats — one child per seat by construction), a camp package (its one child), a registered student (no booking), and `lib/daily-reminder.ts` (carries the job's value). A sixth path fails the suite by file:line.
- **The six renderers by value with a DUO context** (`booking_confirmed`, `leave_notice`, `class_cancelled_parent`, `course_deduction`, `rental_added_teacher`, `course_confirmed` via its payload): every one prints `KKTEST & Prao` and never the primary alone.
- ⚠️ **One visible change beyond DUO, said plainly:** the worker used `student.name`; the ONE rule is nickname-first (the DTO's rule since TASK-224). A Private child WITH a nickname now reads by nickname on every LINE notice / the check-in screen / the ICS / the teacher's schedule (KKTEST has none, so Tanya's capture is unchanged). This is what "through the ONE rule" means; if the owner wants full names on notices, that is a second rule and a decision — say so and I add a `nameStyle` rather than a fifth chain.
- 🚫 Nothing else: the reminder (TASK-420's fold) and the DTO untouched; no migration; nothing posts.

## Break-and-watch — `mut425.mjs`, 16 mutations, **16 bite** (`try/finally`, sha-256 restore byte-identical)
A the student part forgets the co-student · B the pair reversed · C `displayNameOf` a second chain · D the worker back to `student.name` · E the worker does not load `coStudent` · F the title on the Student line · G/H the leave notice one name / never reads the co-student · I/J `course_confirmed` one name / rows without `coStudent` · K/L the check-in payload / its read · M/N the ICS / its read · O/P the teacher schedule / its read.

Nothing for @Fern. `sid` for Tanya's re-capture: the confirm, the leave and the course-confirm on the demo OA should now read `Student : KKTEST & Prao`. ⛔ Only you mark this DONE.
