# TASK-711 — BE: **after an Undo of a leave, the FAMILY is told the class is ON AGAIN** — @Jason (S ≈ ½ day incl. +10 percent) · FINAL ROUND item 2
**From @Sober to @Jason, 2026-10-11.** Owner APPROVED the words — `COPY-REVIEW-2026-09-29.md:592` ("ชุด 1 อนุมัติทั้งหมด", item 1). No migration, no front.
✅ **Claim (Team A):** back `src/services/undo.service.ts` + tests. **Granted by @Porter (2026-10-11), NEW keys/cases only:** `src/lib/line-i18n.ts`, `src/lib/line-message.ts`, `src/lib/line-message-fields.ts` (Team B's files). 🔑 **Before your first edit in any of those three, check `git status` — if Team B has an open edit in that file, STOP and tell me** (their wording build is coming). Write your file list into this task before touching any existing test (Team B holds grants on shared tests).

## The words — VERBATIM (approved; never "improved")
- **TH:** `✅ มีคาบเรียนตามเดิม:` then the field block `Student : …` · `Program : …` · `Date : …` · `Time : …`, then `Note : ยกเลิกการลาแล้ว เรียนคาบนี้ตามปกติค่ะ`
- **EN:** `✅ CLASS ON AGAIN:` then the same field block, then `Note : Leave cancelled. This class goes ahead as scheduled.`
The field block is the family's own (the house parent format, as `class_cancelled` to the family): same labels, same order, same empty-field rule. **No `Coach` line** (the approved text has none).

## The build
- **Where:** `undo.service.ts`, the leave-Undo branch — beside the coach's `class_on_again_teacher` (TASK-508). **Who:** the household(s) of the child whose leave was undone, through the ONE family sender path (one per household, both households of a duo course, unlinked ⇒ SKIPPED row). In the same transaction, AFTER every refusal (as the coach's).
- **A new outbox kind** (e.g. `class_on_again_parent`) with its renderer case and the two keys (title + note). The coach's message: unchanged.
- **Order a family sees after one Undo:** the make-up's cancel (TASK-704, when it was CONFIRMED) then this. Both true.
- 🚫 The check-in Undo (`kind === "checkin"`) sends nothing new.

## ✅ Done means
- **Reproduce first:** a leave Undo today ⇒ coach notice, 0 family notice (failing test).
- By value: the family gets exactly the approved TH / EN text (string equality with the field block) · two households ⇒ two · unlinked ⇒ SKIPPED · a refused Undo ⇒ no message · a check-in Undo ⇒ none · the coach's message byte-identical.
- `tsc` 0 · full suite DB-unreachable, every connection setting blanked · **counts** · `unhandled-between-tests: 0` · `68 = 68` (0067 is Team B's, committed).
- **Mutations:** the family not told · told on a check-in Undo · told before a refusal (rollback leaves it) · the coach's line changed. Regression `704` · `716`.
**Then:** my verification → owner commit → sid (@Tanya) → uat. No git.

---
## 📋 2026-10-11 — @Jason: FILE LIST for 711 (planned, nothing touched — back/front FROZEN until "sid built"; `git status` on the back tree was clean of Team B edits at 64e27b3 + only old pending pin edits)
**Source (mine / granted):** `src/services/undo.service.ts` (the family call beside the coach's) · `src/lib/line-i18n.ts` (NEW keys only: `ob_class_on_again_parent_title`, `ob_class_on_again_note`) · `src/lib/line-message.ts` (NEW case `class_on_again_parent`) · `src/lib/line-message-fields.ts` (NEW `class_on_again_parent` field-block key only, if the existing `class_on_again` block cannot be reused — it HAS a `coach` slot, so I will pass `coach: undefined` and reuse it: expected NO edit here).
**New files:** `src/services/family-told-class-on-again-task711.{test.ts,mutations.json}`.
**Existing test files I MAY have to touch (the kind lists that enumerate every outbox kind — each gets ONE added row/entry for the new kind, nothing re-aimed):** `src/lib/no-iso-date-leak.test.ts` · `src/lib/no-placeholder-leak.test.ts` · `src/lib/message-trailing-req085-16-3.test.ts` · `src/lib/message-time-format.test.ts` · `src/services/booking-undo-req108.test.ts` (the Undo harness: one added test + the existing "never the family" assertion of TASK-508 must be re-read — it asserts no non-teacher outbox row on a leave Undo, which the owner has now reversed; it will be re-aimed to the new rule and I will say so). I will drop any I do not end up needing.

---
## 📋 2026-10-12 — @Jason: FILE LIST for 711, UPDATED after the first run on `eca7d2e` (written before touching any test; Bob's 727 is in, the tree was clean)
**Source (done):** `src/services/undo.service.ts` · `src/services/scheduler.service.ts` (new exported `sendClassOnAgainToFamilies`, beside the cancel sender) · Team B's `src/lib/line-i18n.ts` (2 NEW keys) · `src/lib/line-message.ts` (1 NEW case). `line-message-fields.ts` NOT touched (the existing `class_on_again` block, `coach: undefined`).
**New files:** `src/services/undo-tells-family-class-on-again-task711.{test.ts,mutations.json}`.
**Existing tests that MUST change (a new kind / a new family message — each a count or a harness fact, nothing loosened):**
- `src/lib/message-trailing-req085-16-3.test.ts` · `src/lib/no-placeholder-leak.test.ts` · `src/lib/no-iso-date-leak.test.ts` — the derived kind list `37 → 38` (+ a probe row for the new kind where the test enumerates kinds).
- `src/lib/family-multi-account.test.ts` — `enqueueParentCopies(` call count `8 → 9`.
- `src/services/booking-undo-req108.test.ts` — the harness `run()` gets a `householdLineUserIds` spy (a leave Undo now reads the family; without it every Undo test hits a DB-less query), and the assertions that enumerated the WHOLE outbox of a leave Undo or asserted «never the family» (TASK-508 / TASK-510 / TASK-704) are re-aimed to the owner's reversed rule: the family now also gets `class_on_again_parent`. The coach's rows stay asserted byte-identical.
- `src/services/makeup-cancel-family-task537.test.ts` — only if its by-source pin on the Undo's family sender text fails.
I will drop any I do not end up needing and say so in the report.

## ✅ 2026-10-12 — @Jason: `TASK-711` BUILT — after an Undo of a leave the FAMILY is told the class is ON AGAIN, in the owner's words — 7 / 7 bite
**Base `eca7d2e`, tree clean when I started (Bob's 727 in); the numbers below are from the SHARED tree, whose only changes are my 12 files (`git status` listed nothing else).** `tsc` 0 (5.6.3) · DB-unreachable suite, no connection settings: `4481 pass · 0 fail` · `unhandled-between-tests: 0` · `68 = 68`. **Set `undo-tells-family-class-on-again-task711.mutations.json` — 7 / 7 BITE** (W1 family not told · W2 told on a check-in Undo · W3 told before the plan check · W4 the coach's message changed · W5 a Coach line in the family's copy · W6 the Thai note changed · W7 the English title changed), CHECKSUM identical. Regression, all bite, checksums identical: `719` 8/8 · `716` 11/11 · `713` 7/7 · `704` 5/5 · `702` 24/24 · `657` 16/16.
### The words — machine-checked against the task, byte for byte
TH `✅ มีคาบเรียนตามเดิม:` + the family's field block (**no Coach line**) + `Note : ยกเลิกการลาแล้ว เรียนคาบนี้ตามปกติค่ะ` · EN `✅ CLASS ON AGAIN:` + the block + `Note : Leave cancelled. This class goes ahead as scheduled.` All four strings: present in the TASK **and** in `line-i18n.ts` (script-compared). Rendered output pinned by string equality (TH and EN, the exact lines, no Coach / Reason).
### The build
- **`line-i18n.ts` (Team B's file, NEW keys only):** `ob_class_on_again_parent_title`, `ob_class_on_again_parent_note`. **`line-message.ts`:** one NEW case `class_on_again_parent` — the title in the chat's language, the house block (`student` from the worker's enrichment, `program`, `date`, `time`, `coach: undefined`), then `Note :`. `line-message-fields.ts` untouched (the existing `class_on_again` block). No new `|| undefined` site (so the TASK-332/337 counts hold).
- **`scheduler.service.ts`:** `sendClassOnAgainToFamilies(tx, row)` beside the cancel sender — `familyAccountsOfRow` (a Private/DUO row's two households, de-duplicated; unlinked ⇒ the SKIPPED row) → `enqueueParentCopies`, new kind `class_on_again_parent`.
- **`undo.service.ts`:** the call sits in the **leave** branch only, inside the transaction, **after the plan check (after every refusal)**, beside the coach's — so the order a family sees after one Undo is the make-up's cancel (TASK-704, when it was CONFIRMED) THEN «class on again». The coach's message is byte-identical (pinned). The check-in Undo's branch sends nothing new (pinned by source: ONE call site, before the check-in `else`, which already has TASK-508's own «sends NOTHING» test).
### By value (9 tests)
exact TH and EN · no Coach/Reason line · Undo of a leave ⇒ ONE family row for the class (before: 0), the coach's payload unchanged · a DUO course ⇒ two rows, one per household · an unlinked household ⇒ ONE row with no recipient · the order [make-up cancel, class on again] · a REFUSED Undo (slot taken) ⇒ no family message.
### Existing tests changed — all in the list I wrote in the task BEFORE touching them; nothing loosened, each states the new truth
- `booking-undo-req108.test.ts`: the harness `run()` gets a default `householdLineUserIds` spy (a leave Undo now reads the household; a test's own spy, registered earlier, wins) and SIX assertions re-aimed — the TASK-508 «never the family» lines now say *the family gets exactly ONE `class_on_again_parent`, no other non-coach row*; the outbox/write-list expectations gain that row (between the make-up's cancel and the coach's); TASK-704's two tests list `class_on_again_parent` after `makeup_cancelled_parent`.
- `makeup-cancel-family-task537.test.ts`: its by-source pin that quoted the old «never the family» line.
- Kind-count pins `38 → 39`: `message-trailing-req085-16-3` (×2) · `no-placeholder-leak` (×2) · `no-iso-date-leak` (×1). `family-multi-account.test.ts`: `enqueueParentCopies(` `8 → 9`.
- Designed around: the 657 set's import anchor (the new import has its own line).
### Said, not hidden
- The check-in Undo's silence is pinned by source and by the existing TASK-508 value test, not by a new value test.
- A leave Undo of a seat whose retired extra date is REVIVED (719): the family is told for the seat's class as for any leave Undo; E (the group row) gets no family message — as ruled in 719.
▶️ **Ball: Sober — verify 711 → owner commit → sid (@Tanya) → uat. Nothing else is cut for me.**

