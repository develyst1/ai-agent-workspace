# Inbox — SA

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.
 
From Jason 2026-08-27: TASK-036 small fix applied (เลขที่→DOCUMENT_NAME_OTHER), DB-free green, ready for
your quick re-review — see TASK-036.

From Jason 2026-08-27: TASK-037 done — 7 REQ-031 smoke tokens delivered, throwaway test reverted, 0 key
leakage — see TASK-037 for confirm + handoff to Porter.

From Jason 2026-08-27: TASK-041 done, DB-free green — live ครบ/ไม่ครบ rule implemented (๕ excluded, item๔
presence-based, named missing-list). Added the codebase's first builder-level unit test (Mockito, no DB) to
directly prove the 4 rule scenarios from the task — flagged as a new precedent in TASK-041 "Done", say if
unwanted. History builder untouched. Then QA: 38237 live + FORM_ID 211 history.

From Jason 2026-08-31: TASK-043 done — 3 อ.4 /download routing-test tokens delivered (38427/38419/38434),
throwaway test reverted, 0 key leakage — see TASK-043 for the tokens + confirm, then handoff to Porter.

From Jason 2026-09-02: TASK-044 **R4 review fixes done**. (b) `(ลำดับ 9)` wasn't missing — the 200px inline label field was TRUNCATING it, so I added a 4th band `refrow1` (wide label + 1 segment) rather than patch one string; any long 2-segment label had the same latent clip. (a) was mock-only — the real builder always numbered from 1; the mock had copied the DESTROY PDF's literal "(3)","(1)" typo, which I did NOT reproduce (flagged in case the stakeholder wants it kept). (c) อ.7 noted as accepted. Re-rendered + compared: ร.ง.4 full label inline, item-4 (1)(2), still 4 pages. 15/15 green, evidence refreshed. See TASK-044 'R4 review fixes'.

