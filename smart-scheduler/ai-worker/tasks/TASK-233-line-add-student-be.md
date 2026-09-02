# TASK-233: BE — Flow 3 เพิ่มนักเรียน: summary before write, admin told, nothing partial

- Source: SPEC-071 · REQ-079 §5 Flow 3 · **AC-9 · AC-10 · AC-11 · AC-12** · §7(a)/(b)
- Status: TODO. Depends on: **TASK-232** (a bound chat). Repo: **smart-scheduler-back**. Assignee: **@Jason**

## The flow

name → (duplicate? ask for more detail) → birthdate → province → **summary → confirm** → saved + admin notified.

## 🔴 The three rules that are the actual requirement

1. **The summary-and-confirm step is not optional.** It writes into a roster that **has no delete for anything
   with history** — that is not an oversight, it is the product. Three seconds of review against a record nobody
   can remove.
2. **A duplicate name asks for MORE DETAIL — it never demands a rename** (§7(a)). Two real children can share a
   name. Telling a parent to rename their child is wrong, **and it confirms to whoever typed it that such a child
   exists.** ⇒ *"มีน้องชื่อนี้อยู่แล้ว รบกวนใส่นามสกุลหรือชื่อเล่นเพิ่ม เพื่อไม่ให้สลับกันนะคะ"* — same outcome,
   no false claim, no leak.
   ⚠️ This encodes **@Porter's recommendation, not the owner's literal words** (*"บอกให้ตั้งใหม่"*). If the owner
   overrules it, only this message and AC-9 change.
3. **Abandon halfway ⇒ nothing is written** (AC-12). The row is created at **confirm**, never before — a
   half-registration in a roster with no delete is the expensive kind of mess.

**The admin must be notified** (the customer's own step 5) — reuse `getAdminLineUserIds` /
`app_settings.line_admin_user_ids`; do not invent a second recipient list. **Without it the hand-off depends on
somebody remembering to look.**

🚫 **No auto-scheduling.** The parent registers; **a human puts the child on the calendar.**
🚫 **No money, ever** (AC-20) — the flow modules must not import the sale/discount/movement paths at all. A
grep-guard test, TASK-223's shape: **a rule the build enforces beats one in prose.**
🚫 **No parent-side delete in this task.** §7(b) is a recommendation the owner has not ruled on.

## Definition of Done — the OUTCOME
- [ ] **AC-10:** the summary shows name · birthdate · province and **nothing is written until confirm**.
- [ ] **AC-12:** abandoning at every step leaves **no student row and no partial anything** — test each step.
- [ ] **AC-9:** a duplicate name asks for a surname/nickname; it does **not** demand a rename and does **not**
      reveal whose child the existing one is.
- [ ] **AC-11:** an admin is notified on success.
- [ ] The grep-guard proves no money path is reachable from these modules.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` → 0 · `bun test` green. 🚫 Nothing sent, no DB run.

## Implementation Notes
(Jason — repo path + `git rev-parse HEAD`.)

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Review
(Sober fills this in at REVIEW.)
