# COPY DRAFT — TASK-644 piece A: a NEW student needs a parent phone (booking, new course, new voucher) — @Silver, 2026-10-04
📋 **DRAFT.** These ship with a `📋 DRAFT wording` marker (the team's convention: the owner approves in the next copy batch, and tests pin the SHAPE, not the words). **Nothing here is approved yet.**
**Why the words matter:** the field exists today, labelled **optional**. Making it required without changing the label would tell the admin it is optional and then refuse them.

## 1. The picker's phone field (front, `StudentSelect`), when the student is NEW on booking / course / voucher
| | Today (stays for the IMPORT screen) | Draft (booking / new course / new voucher) |
|---|---|---|
| label TH | เบอร์ผู้ปกครอง (ถ้ามี) | **เบอร์ผู้ปกครอง** |
| label EN | Parent phone (optional) | **Parent phone** |
| hint | ใช้ผูกนักเรียนกับผู้ปกครอง — เบอร์เดียวมีลูกได้หลายคน / Links the student to a guardian — one phone can cover several children | **unchanged.** It is still true. |
| error TH | — | **นักเรียนใหม่ต้องมีเบอร์ผู้ปกครอง เพื่อให้ผู้ปกครองเห็นคลาสของน้องใน LINE ได้** |
| error EN | — | **A new student needs a parent phone, so the parent can see the classes in LINE.** |

🔑 **The error says WHY**, which is the parent's reach. Without the reason, an admin who has no phone at hand types a fake number to get past it, and that recreates the very defect.

## 2. The server's refusal (backstop; the picker normally prevents it)
- TH: **นักเรียนใหม่ต้องมีเบอร์โทรผู้ปกครอง (อย่างน้อย 9 หลัก) — ถ้าเป็นนักเรียนที่มีอยู่แล้ว ให้เลือกจากรายชื่อแทน**
- EN (only if admin refusals carry EN; follow the file's existing convention): **A new student needs a parent phone (at least 9 digits). If the student already exists, pick them from the list instead.**
- 📌 The second half points at **Sober's flagged trap**: typed-but-not-picked text becomes a NEW student. The refusal tells the admin the likely real fix.

## 3. The rule the words describe (for the owner to see beside the words)
- **"A phone" means a real phone shape**: at least 9 digits, and digits and phone separators only. This is the same check the LINE bot already uses (`isPhoneShaped`).
- 🔑 Why this matters: a parent is reached by matching the phone they type at LINE registration. A junk phone such as `1` would create a parent nobody can ever link, which is the same defect one step removed.
- **The IMPORT screen is unchanged:** the phone stays optional, with the existing "(ถ้ามี)" label (owner's ruling).

---
## ✅ OWNER APPROVED, 2026-10-05: §1–§2 VERBATIM
Relayed by @Porter (`log/2026-10-05.md`, "the owner APPROVED the parent-phone wording verbatim"). It covers the label, the field error, the server refusal, the ≥9-digit rule, and the IMPORT screen keeping "(ถ้ามี)".
⇒ The `📋 DRAFT wording` markers come off (TASK-644 `validation.ts`, TASK-662 `dictionaries.ts`). 🚫 **Do not improve an approved string.**
