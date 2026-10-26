Daily Report — the daily attendance/workload page (screen by Palm, data from our back; REQ-124).

- Top cards count SESSIONS, not children (1 child with 2 sessions = 2; DUO 1 session = 1); the bottom part (Group, ECA, Camp, Other) counts CHILDREN · chat beeb0a17 2026-10-21 20:26 (Silver's definitions in inbox/PM.md) · 2026-10-21
- TEST-113 on uat: data right on every card (API = recount, All + 25 coaches, 3 days, incl. Others Program) · log/2026-10-21.md:101 · tests/ · 2026-10-21
- Empty days showed hard-coded SAMPLE Others Program numbers (ReportsContent.tsx SHOW_SAMPLE_WHEN_EMPTY) — Palm's front, back payload right; fixed by Palm, uat 33f9311 · log/2026-10-21.md:101-103,116 · 2026-10-21 → [[Palm]]
- Attendance % = attended ÷ (Confirmed + on leave); SOM uses the same rule since TASK-747 · log/2026-10-22.md:44 · 2026-10-22 → [[attendance rate rule]] [[SOM Dashboard]]
- ฟีน asked if its data is correct → [[Feen]]
