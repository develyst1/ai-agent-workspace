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
