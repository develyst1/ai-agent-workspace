# COPY DRAFT — Team B's wording for the week to 11 Oct (for TONIGHT's one batch) — @Silver, 2026-10-06
📋 **DRAFT.** Nothing ships until the owner approves. **Approved strings are REUSED wherever they fit;** only what has no existing words is new. Thai first, then English.
(5a, the completed/expired course sentence, is already drafted in `SIZING-teamB-next-round-pile-2026-10-05.md` §5a. **5b needs NO new words**: it reuses the existing "ไม่มาเรียน / No-show" label. The only open point is the decision to add CANCELLED too.)

## A. TASK-624: swap ANY teacher (not only the primary)
Today's title is `swapPrimaryTitle` *"สลับครูหลัก ({name})" / "Swap the primary teacher ({name})"*. It is untrue the moment an extra teacher can be swapped.
| | TH | EN |
|---|---|---|
| dialog title (any teacher) | **สลับครู ({name})** | **Swap teacher ({name})** |
- The button label stays the existing *"สลับ / Swap"*. The success and outcome lines are reused.

## B. TASK-624 1b: the rate field on a "from here on" swap (mirrors the GROUP swap's approved pair, TASK-634)
| | TH | EN |
|---|---|---|
| field label | **ค่าสอนของ {name} สำหรับตารางนี้ (ต่อคาบ)** | **{name}'s rate for this series (per session)** |
| hint | **ไม่ต้องกรอก ยกเว้นระบบปฏิเสธเพราะไม่มีค่าสอน — จะเกิดเมื่อตารางนี้ยังไม่เคยจ่ายค่าสอนให้ครูคนนี้** | **Leave this empty unless the swap is refused for a missing rate — that happens when this series has never paid this coach before.** |
- It is word for word the group pair (`groupSwapRate` / `groupSwapRateHint`), with "กลุ่มนี้ / group" → "ตารางนี้ / series".
- The one-session cover keeps its own approved `coverRate` field, unchanged.

## C. Link a parent to a child (Bob BE + Fanta FE)
| where | TH | EN |
|---|---|---|
| row action on the no-parent list | **ผูกผู้ปกครอง** | **Link a parent** |
| family search placeholder | **ค้นหาผู้ปกครอง (ชื่อหรือเบอร์)** | **Find the family (name or phone)** |
| confirm title | **ผูก {child} กับ {parent}?** | **Link {child} to {parent}?** |
| confirm: the family's existing children | **ครอบครัวนี้มีนักเรียนอยู่แล้ว: {names}** | **This family already has: {names}** |
| …when it has none | **ครอบครัวนี้ยังไม่มีนักเรียน** | **This family has no students yet.** |
| confirm: upcoming sessions | **{child} มีคาบที่จะถึง {n} คาบ (คาบถัดไป {date}) — หลังผูกแล้ว ผู้ปกครองจะเริ่มได้รับแจ้งเตือนใน LINE ตั้งแต่ครั้งถัดไป** | **{child} has {n} upcoming session(s) (next {date}). Once linked, the family starts receiving LINE notices from the next one.** |
| …when there are none | **{child} ยังไม่มีคาบที่จะถึง** | **{child} has no upcoming sessions.** |
| confirm: it cannot be undone | **การผูกนี้ย้อนกลับจากหน้าจอไม่ได้** | **This link can't be undone from the screen.** |
| confirm button | **ผูกผู้ปกครอง** | **Link** |
| success | **ผูก {child} กับ {parent} แล้ว** | **{child} is now linked to {parent}.** |
| server refusal: already has a parent (409) | **นักเรียนคนนี้ผูกกับผู้ปกครองแล้ว — รีเฟรชหน้าเพื่อดูข้อมูลล่าสุด** | **This student already has a parent linked. Refresh to see the latest.** |

- **Reused, not new:**
  - the 5-children cap refusal (*"เพิ่มนักเรียนได้สูงสุด 5 คนต่อเบอร์"*);
  - the archived-family refusal;
  - the permission's own label *"ผูกนักเรียนกับผู้ปกครอง"*.
- 🔑 **Why "two Aris" is shown and not warned about:** the confirm **lists the family's children's names**, and the admin sees the duplicate. There is no "possible duplicate!" heuristic (Porter, Sober, and §4 of the sizing).
- 🔑 **Why "cannot be undone" is stated:** nothing in the product un-links. A wrong link is a data fix by the owner, so the admin must know that before pressing.
