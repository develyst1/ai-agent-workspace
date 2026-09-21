# TASK-422 — `GET /entitlements/:id/plan` carries `coStudent` (the one course reader TASK-420 missed) — XS

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-21) · **Size XS.** No migration (49 = 49). `sid`.

## §0 The gap (Fern's TASK-421 §2.2, verified by me): `getEntitlementPlan` (`scheduler.service.ts:2246`) reads the course with `{ teacher, subject }` and returns `student: studentRef(student)` only — a DUO plan page would show one name. TASK-420's table covered list/view/create/PATCH/confirm; the plan reader was not listed.

## §1 Do
- `getEntitlementPlan` returns `coStudent: studentRef | null` (the same read shape as `student`; a Private ⇒ null) and `classRateMinor`, `courseKind` — the course DTO's three DUO facts, through the SAME `toCourseSummary`/mapper path if it has them, not a second hand-built object.
- Pin by value (a DUO course ⇒ both refs; a Private ⇒ null) and extend TASK-420's reader census with this site (so the next course reader is caught by the suite, not by Fern).
- 🚫 Nothing else.

## Definition of Done
- [ ] Suite, **count** · tsc 0 · 49 = 49 · the plan payload by value · the census +1 · 🔑 mutation (the field dropped) bites · report here + `inbox/SA.md` + log · one line for @Fern.

---

# ✅ CODE DONE — @Jason → @Sober (2026-09-21) — 2634 pass / 0 fail (+4), tsc 0, 49 = 49; 4/4 mutations bite

- **The ONE builder:** the three DUO facts left `toCourseWithStudent`'s body and became `duoCourseFacts(c)` in `db/mappers.ts` (`coStudent: studentRef | null · classRateMinor · courseKind = courseKindOf(c)`); `toCourseWithStudent` spreads it (byte-identical output), and `getEntitlementPlan` spreads it too — no second hand-built object (a mutation that hand-builds the same three keys in the plan is caught by source).
- **The plan reader:** the course read gains `with: { coStudent: true }`; the course branch returns `…duoCourseFacts(course)` beside `student`. The voucher branch is untouched (pinned by absence). A Private ⇒ `coStudent: null · classRateMinor: null · courseKind: "PRIVATE"`.
- **By value** (spied reads): a DUO course ⇒ `student` + `coStudent` refs, `classRateMinor`, `"DUO"`; a Private ⇒ the three nulls/PRIVATE. **The census** (`duo-course-req095-13.test.ts`, the `test.each` reader table): +3 rows — the builder, `toCourseWithStudent` spreading it, the plan loading + spreading it; the old three-line DTO pin re-pointed to the builder.
- ⚠️ One shape note: the plan's `student` is the thin local ref (`id · name · nickname`); `coStudent` comes from the mapper's `studentRef` (the same keys **plus** the CRM fields) — a superset, so Fern's `coStudent?.nickname ?? coStudent?.name` reads the same either way. Say if you want the two refs byte-equal (the plan's `student` through the mapper's ref would be the change, not the other way).
- **Break-and-watch** (`mut422.mjs`, 4/4 bite, restore byte-identical): the plan drops the three facts · the plan does not load `coStudent` · the plan hand-builds the object · the builder forgets the rate.
- No migration; `sid` untouched. 🚫 Nothing else.

**For @Fern (one line):** `GET /entitlements/:id/plan` (course kind) now carries `coStudent: { id, name, nickname, … } | null`, `classRateMinor: int | null`, `courseKind: "PRIVATE" | "DUO"` at the top level beside `student` — the same three keys as the course DTO; the voucher plan is unchanged.

⛔ Only you mark this DONE. ▶️ Next: whatever waits on the board.
