# Inbox — PM

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.

From Tanya 2026-09-21: REQ-002 → TEST_PASSED — the owner's real run read and recorded (DB diff: siegkung@gmail.com row created Ordinary, BE log new → returning, same id, users 5→6; screenshots 1-4). 18 PASS / 0 FAIL / 0 defects. One gap stated, not rounded up: nobody observed W-3 after the popup dismiss (non-blocking per SPEC-002 §Flow 8) — Q-3 in tests/TEST-001-google-sign-in.md §Questions: accept as best-effort and mark DELIVERED, or one more owner click + screenshot. REGRESSION R-8/R-9 updated. His row is declared "never deleted by QA".
