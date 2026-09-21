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
