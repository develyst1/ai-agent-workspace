The deploy chain — how a change reaches the customer: SA's ONE commit list → owner commits → sid → Tanya → uat (+ db:migrate) → Tanya read-only smoke.

- Only the owner commits, merges and deploys; roles write a DEPLOY-…md commit list and stop · DEPLOY-REQ-125-rework-o1-and-task829-2026-10-21.md · log/2026-10-21.md:72-73 · 2026-10-21
- Palm's work: develop → owner's merge workflow → dong → sid front; after a merge check the local front hash — 10-22 the merge had not landed locally (dong still 33f9311, preview.ts present) until re-run · log/2026-10-22.md:57-58 · 2026-10-22 → [[Palm]]
- A merge can bring only part of Palm's push (10-21: sub-district came, sample fix did not) — verify the file, not the message · log/2026-10-21.md:108-110 · 2026-10-21
- uat migration example: db:migrate 0071 (teacher_leave_removals) with REQ-125 · log/2026-10-21.md:94 · 2026-10-21 → [[REQ-125 teacher leave]]
- uat unstable during the 10-22 smoke (2 of 3 runs could not log in, one 522) → owner/Otto · log/2026-10-22.md:66 · 2026-10-22
- ⚠️ The back repo's .env points at the customer's system; the test guard refuses bare runs, SAFE overrides used · log/2026-10-22.md:49,53 · 2026-10-22
