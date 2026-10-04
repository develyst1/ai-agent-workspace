# COPY DRAFT — TASK-644 piece B: a child with no household is MARKED in the picker and FINDABLE on People — @Silver, 2026-10-05
📋 **DRAFT.** It ships with `📋 DRAFT wording` markers. The owner approves it in the round's copy batch, and nothing goes live before he does.
**Porter's tone rule:** quiet, factual and findable on purpose, **not a scary warning on an ordinary screen.** Staff see these rows every day, and a marker everyone learns to ignore is worse than none.
⇒ These words state a fact. They carry no alarm, no exclamation mark and no blame.

## 1. The picker row marker (a small grey tag beside the name)
| | Draft |
|---|---|
| TH | **ยังไม่มีผู้ปกครอง** |
| EN | **No parent linked** |

- **Why these words:** they say exactly what is true about the record. They do not say "error", "invalid" or "broken".
- The admin can still pick the row. The tag tells them that the family will not see this child in LINE.

## 2. The People page: a way to list them
| | Draft |
|---|---|
| filter label TH | **นักเรียนที่ยังไม่มีผู้ปกครอง** |
| filter label EN | **Students with no parent linked** |
| count beside it | the number, e.g. `(17)`, with no extra words |
| empty state TH | **ไม่มีนักเรียนที่ยังไม่มีผู้ปกครอง** |
| empty state EN | **Every student has a parent linked.** |
| one-line explainer under the filter TH | **นักเรียนในรายการนี้ ผู้ปกครองจะไม่เห็นคลาสใน LINE จนกว่าจะผูกกับผู้ปกครอง** |
| explainer EN | **Parents can't see these students' classes in LINE until a parent is linked.** |

- The explainer gives the reason once, in the place where somebody went looking. It does not appear on every row.
- 📌 **No action button.** No screen can set a child's parent today (the student edit's six-field allow-list excludes `parentId`). The owner decides each row (REQ-112 / Sober's repair query). **This view makes them visible; it does not fix them**, and it must not promise to.

---
## ✅ OWNER APPROVED, 2026-10-05: §1–§2 AS DRAFTED (relayed by @Porter, `inbox/SA-B.md` 10-05)
**He approved the three judgements inside it, not only the words. None may be "tidied" later:**
1. **The tag states a FACT.** It never says error, invalid or broken, and **the row stays pickable.**
2. **The explainer appears ONCE, under the filter, never per row.** The person who opened the filter came looking; everyone else must not be taught to ignore it.
3. 🚫 **NO ACTION BUTTON.** No screen can set a child's parent today, so a button would promise what the product cannot do. **This view makes them VISIBLE; it does not fix them.**
⇒ The DRAFT markers come off (TASK-664). 🚫 **Do not improve an approved string.**
