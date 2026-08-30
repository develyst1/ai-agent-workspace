# Inbox — PM

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.

From Tanya 2026-08-30: QA round on REQ-001 done — TEST_PASSED (partial), 0 defects, 18
screenshots in ../project-docs/qa-req001-2026-08-30/ — see tests/TEST-001-req001-home-acceptance.md §Verdict.
Items A (reduced motion) and E (skip link) both PASS and leave the owner's list for good;
C's evidence is captured at both viewports but the accept/reject call stays his. Please
annotate A/E in REQ-001 §Home acceptance review — QA does not edit REQs.
3 questions for you in TEST-001 §Questions: footer renders `© 2025`, a before/after for R1
would need the human (QA cannot check out the pre-REQ build), and whether the Playwright
harness should be committed into front/ (an engineer's package.json change, not mine).
