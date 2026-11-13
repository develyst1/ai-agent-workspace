# GR web feedback → real code ledger

**Owner, 2026-11-10 (verbatim):** *"อย่าลืมนะตามกฎตามเป้าหมายของเราคือเก็บฟีดแบ็กถึงเวลาแล้วก็นำฟีดแบ็กมาทำจริงมาอะแดปต์จริงทำลงโค้ดจริง"*

**The rule:** the GR web (som-gr) only collects feedback. **Every feedback item that changes the system must land in the real code** (BB/BF/SB/SF) when the real build resumes (from 14 Nov; scope frozen at 17 Nov → URS). An item is closed only when its real-code TASK has passed on sid. Fixing the GR web alone does not close it.

Porter adds a row the moment an item is accepted (source = the verbatim LINE file / CUSTOMER-ANSWERS). From 14 Nov, each open row gets a TASK from its SA. A row's status moves only on evidence (a TASK id, then a TEST pass).

| # | Date | Feedback (short) | Source | GR web | Real-code impact | Real TASK | Status |
|---|---|---|---|---|---|---|---|
| 1 | 11-10 | Theme: white like the front office, orange accent | LINE 02:08 | Done (round 1, 9a5e7307) | BF theme: light default + orange primary | — | OPEN (after 14) |
| 2 | 11-10 | CEO-only Unlock of a locked pay period; then admin can edit; re-lock | LINE 02:08 + reply #3 | Done as "Proposed" | BB+BF payroll lock: CEO unlock route + UI | — | WAIT ขวัญ OK |
| 3 | 11-10 | Refund only from BO Refund; FO cancel never refunds; BO Refund cancels remaining FO classes | LINE 02:08 + reply #4 | n/a (confirmation) | Verify current code matches; no change expected | — | CHECK (SA) |
| 4 | 11-10 | Revenue page CEO only | LINE 02:08 | Already so | Verify the role gate in BB/BF | — | CHECK (SA) |
| 5 | 11-10 | Full-time commission pooled automatically from the employee type | LINE 02:09 + reply #6 | Already so | Verify the pool logic uses the profile type | — | CHECK (SA) |
| 6 | 11-10 | A mid-course activity change: revenue does not move, only the category; the price difference is entered by hand | LINE 02:10 + DECISIONS row 24 | n/a | Revenue category re-tag on change | — | OPEN (after 14) |
| 7 | 11-10 | Bonus 100 counts from the go-live date; earlier ones by hand | LINE 02:10 + reply #9 | n/a | Bonus start-date setting | — | OPEN (after 14) |
| 8 | 11-10 | Revenue from Nov: earlier months via Add Manually | LINE 02:10 + reply #10 | n/a | Confirm manual-entry path | — | WAIT ขวัญ OK |
| 9 | 11-09 | Park fee: several groups may rent in the same hour | DECISIONS row 23 | n/a | TASK-942 | TASK-942 | OPEN (after 14) |
| 10 | 11-10 | The active menu item is still blue (GR cosmetic, O-151-2) | Tanya | Next round | Covered by #1 | — | GR only |
| 11 | 11-10 | Brand at top left = "SOM BACK OFFICE" only | พี่ฟีน LINE 09:30 | Round 3 | BF shell brand text | — | OPEN (after 14) |
| 12 | 11-10 | Revenue block visible to ขวัญ too (corrects reply #5); other admins unchanged | ขวัญ LINE 11:31 | Round 3 (once HOW is answered) | BB+BF revenue gate: a per-user grant | — | WAIT ขวัญ (how) |
| 13 | 11-10 | Merit shows for the CEO only, never for admin | ขวัญ LINE 11:32 | Round 3 | BB+BF Other Income / slip: hide Merit from admin | — | OPEN (after 14) |
| 14 | 11-09 | F1 fixed schedule on 2+ weekdays and 2-hour sessions; a leave follows the real day order | ขวัญ LINE 11-09 17:08 #1; CHECK-2026-11-09 F1 | Round 4 (Proposed FO page) | SB+SF course day pattern (6–8 d, high risk) | — | GR to build |
| 15 | 11-09 | F2 no parent message while the course is Pending; send it once at Confirm Course | ขวัญ LINE 11-09 17:08 #2; CHECK F2 | Round 4 (Proposed FO page) | SB notify gate (1–1.5 d) | — | GR to build |
| 16 | 11-09 | F3 change a course's activity | ขวัญ LINE 11-09 17:31 #3; REQ-5007 | — | held: owner + พี่เบส | — | HELD |
| 17 | 11-09 | F4 close a whole day's schedule | ขวัญ 17:31 #4; CHECK F4 | Round 4 (Proposed FO page) | SB+SF closed day (3–4 d) | — | GR to build |
| 18 | 11-09 | F5 a leave on a make-up should not land on the same date | ขวัญ 17:31 #5; REQ-5006; CHECK F5 | Round 4 (Proposed FO page) | SB 0.5 d; reverses TASK-551 (owner) | — | GR to build |
| 19 | 11-09 | F6 Dashboard per her latest feedback | ขวัญ 17:31 #6; REQ-5009 | — | owner: Palm or us | — | HELD |
| 20 | 11-11 | F4 / F1 / F3 quotes: Trolley cards 21 (F4 A/B), 22 (F1), 23 (F3 FO+BO) on SOM System Dev → NEW REQUIREMENT, waiting for the doc team | owner 11-10/11 | n/a (front office) | CONCEPT-F4 / CHECK F1 / CONCEPT-F3 | — | QUOTE |
| 21 | 11-11 | Per-MENU permissions in the back office, like the front office (not per block) | ขวัญ LINE 09:21 + 10:51 | Round 5 built (held) → **round 8 live** (TASK-954) | BB+BF role/permission model per menu (≈ 9–10 d, CHECK-2026-11-11; from 14 Nov in the block plan) | — | BUILD on GR, free (owner 11-12) |
| 22 | 11-11 | 16-point UI list (names, order, layout, labels) | ขวัญ LINE 13:36 | Round 5 | BF labels/layout | — | OPEN (after 14) |
| 23 | 11-11 | Revenue Summary: a category total box (Unit + Revenue) + Unit on the top box | ขวัญ LINE 13:50–13:51 | Round 5 | BB+BF Revenue Summary | — | OPEN (after 14) |
| 24 | 11-11 | Collapsible left-menu groups | ขวัญ LINE 13:52 | Round 5 | BF shell | — | OPEN (after 14) |
| 25 | 11-11 | Product: image upload back; commission group is a dropdown; she sets the category | ขวัญ LINE 13:36 #13 | Round 5 | BF/BB product | — | OPEN (after 14) |
| 26 | 11-11 | Per-menu permissions as a 2-option quote: Revenue-only ≈ 600 ฿ (recommended) / every menu ≈ 2,500 ฿ | owner 11-11 "ทำเป็นออปชันให้เขาเลือก" | Single switch stays (round 4/5) | see row 21 | Trolley card 24 | ~~QUOTE~~ SUPERSEDED 11-12: owner "หลังบ้าน เราให้feedbackแก้ฟรีจนถึง 17" → row 21, free, every menu, GR round 8 (TASK-954) |
| 27 | 11-12 | Commission groups: EDIT an existing group (name + amount), not only Add | ขวัญ LINE 02:54 | Round 6 | BB+BF commission group edit | — | OPEN (after 14) |
| 28 | 11-12 | One consistent row/column alignment on EVERY back-office page (extends 11/11 #4,7,8,15,16) | ขวัญ LINE 03:16 | Round 7 (A + B pages) | BF: shared table/form alignment rules | — | OPEN |
| 29 | 11-12 | Which menu each "Proposed" item lives under (question) | ขวัญ LINE 03:15 | Answer (Sober lists the Proposed items + their menu) | — | — | OPEN |
| 30 | 11-13 | Feedback 13/11: 14 back-office items (labels, column placement, layout; Daily detail + pay edit; Category detail + refund; Other free text; ECA Pending default + cancel/edit + history columns; Stock Demo history edit; hide All Report) | ขวัญ LINE 14:59–15:08, verbatim file 2026-11-13 | Round 13 (REQUEST-porter-to-sober-2026-11-13-gr-round-13-feedback-1311.md) | BF/BB per item; Daily pay edit, ECA cancel/edit, Demo history edit are behaviour. Sober sizes: Daily detail + pay edit BIG ~2–3 d (own SPEC, salary engine) · ECA cancel/edit ~1 d · Demo history edit ~0.5–1 d · Category detail ~0.5 d | TASK-976 (A, GR) + B/C slices | OPEN |
| 31 | 11-13 | Move course to branch → front office only (Manage plan, branch per class, English confirm box) | ขวัญ LINE 15:06–15:07 | Proposed page unchanged | SB+SF, front office, paid scope | — | OWNER (scope/price) |
