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

