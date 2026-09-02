# TASK-234: BE — Flows 4–6 on the existing pickers, and the two menu sets

- Source: SPEC-071 · REQ-079 §5 Flows 4–6 · **AC-13 · AC-14 · AC-15**
- Status: TODO. Depends on: **TASK-232**. Repo: **smart-scheduler-back**. Assignee: **@Jason**

## 🔴 This is the reuse task. Almost nothing here should be new code.

- **แจ้งลา** — REQ-046 / `line-leave.ts` · **เช็คอิน** — REQ-050 · **คอร์สของฉัน** — REQ-016.
  All three already exist and are deployed. **Wire them to the new menu; do not rebuild them**, and say in your
  notes what you reused versus what you had to add.
- 🚫 **Never infer the child, never infer the session** (AC-14) — REQ-050's rule, and the child step is **skipped
  only when there is exactly one**. The confirmation names **child · date · time**, so a wrong tap is caught by
  the person who made it.
- **คอร์สของฉัน** shows the customer's own template: `คอร์ส · ครู · เหลือ n/N · สิทธิ์ลาเหลือ · วันหมดอายุ`.

## The two menu sets

`linkRichMenuToUser` / `setDefaultRichMenu` (`line-rich-menu.ts:110,119`) — **REQ-042's path, in production and
owner-verified.** Zero new mechanism.

📌 **Cheapest shape, from SPEC-071 §Overview:** make **ยังไม่รู้จัก the DEFAULT menu** and **รู้จักแล้ว the
per-user link.** A brand-new follower then gets the right menu with **no code running at all**, and "unknown" is
the state you fall back to rather than one you must remember to set.

| ยังไม่รู้จัก | รู้จักแล้ว |
|---|---|
| `เข้าใช้ระบบ` · `คุยกับแอดมิน` | `แจ้งลา` · `เช็คอิน` · `คอร์สของฉัน` · `เพิ่มนักเรียน` · `คุยกับแอดมิน` |

🔴 **`คุยกับแอดมิน` is in both, always, and no flow may remove it.** It is the promise that a person is
reachable — the only thing that makes a bot acceptable to a parent. **A lockout or a handover must never be a
dead end.**
⚠️ **`เข้าใช้ระบบ` on the unknown menu now leads to "ask an admin"**, not to a code prompt — Flow 2 is deleted (§15).

**AC-19:** every choice accepts a typed `1` / `2` as well as a tap — **already true** (`line-webhook.service.ts:4`,
postbacks and keywords share handlers). Assert it rather than build it; LINE on PC cannot tap anything.

## Definition of Done — the OUTCOME
- [ ] **AC-13:** leave — child step **skipped with one child**, shown with two; session chosen; confirmation names
      child · date · time; the teacher is told.
- [ ] **AC-14:** with two children, or one child with two sessions that day, the bot **asks** — never picks.
- [ ] **AC-15:** the course view shows all five fields.
- [ ] Both menus exist; a bound chat gets the known menu, an unbound one the default.
- [ ] **AC-19** asserted for at least one choice in each flow.
- [ ] **AC-21:** the existing leave/check-in/course paths are unchanged for teachers and for anyone not in a
      bound chat — by diff.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` → 0 · `bun test` green. 🚫 Nothing sent to a real recipient.

## Implementation Notes
(Jason — repo path + `git rev-parse HEAD`; **name what you reused vs added**.)

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Review
(Sober fills this in at REVIEW.)
