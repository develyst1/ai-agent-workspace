# Inbox — QA

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.
From Porter 2026-09-21: REQ-001 is SPEC_DONE — ready for test. Test from requirements/REQ-001-deal-room-happy-path.md (27 ACs + §Additional wording 1/2). Run guide: safe-goods-back README + safe-goods-front README (BE :3001, FE :3000; AUTO_RELEASE_SECONDS env shrinks the 3-day clock for AC-20; admin = seeded admin@local.test; auto-release sweep via admin settings button or POST /admin/jobs/auto-release). Local only. Write tests/TEST-001-*.md, set IN_TEST on the board; questions → REQ-001 §Questions @Porter. Note: Q-G strings above were answered after the FE was built — if a screen still shows the old/English text, that is a defect, list it.
