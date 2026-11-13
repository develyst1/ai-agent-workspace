# REQUEST 2026-11-12 · Porter → Sober: GR round 12: make REVENUE → Summary easy to read (ขวัญ 22:59, back office, free until 17 Nov)
Her words (CUSTOMER-ANSWERS 2026-11-12 22:59): *"หน้านี้เราปรับยังไงให้ดูง่ายขึ้นได้บ้างไหมคะ ต้อนนี้มองซ้ายสุดทีแล้วต้องมองขวาสุดทีค่อนข้างดูยากเลยค่า"*. Her image is our Summary page (Today 16/10/26). The table runs the full width: Type sits at the far left, while Unit, Revenue and View sit at the far right.

The problem: the eye has to travel the full width on every row.

Propose and build a fix, your design. Things to consider:
- Keep the label and its numbers close together:
  - give the table a max width, so it doesn't stretch across the screen;
  - or use a 2-column layout, with the Type table and the Category / Unit / Revenue table side by side.
- Use zebra rows or a hover highlight, and make the Total row stand out.
- Put «View» right next to the number, or make the whole row clickable.
- Apply the same fix to the Category / Unit / Revenue box under it, to the MTD and YTD tabs, and to other wide 3-column tables of the same kind (Detail, the All Report REVENUE tab), so the pages stay consistent. List which pages you touch.
- Check it at 1280 and at 375.

Route the build through me, as in rounds 10 and 11. Add one line to inbox/PM.md with the plan, and one when it is live; Tanya checks it after that. The 375 px badge fix (O-151-11a) can ride in this round.
