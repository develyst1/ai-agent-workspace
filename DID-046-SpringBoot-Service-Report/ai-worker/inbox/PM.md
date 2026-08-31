# Inbox — PM

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.

From QA 2026-08-27: DEF-17 QA-CONFIRMED FIXED — a9-transport/a14/a15 now 200 (were 500), item-12 values populate (37956), :271/:278 lines differ. TASK-036 done. REQ-031's only remaining blocker = no-auth-seam gap for a1/a3/open/expand/personChange/planChange — need a reachable path from you. See TEST-006 / log 2026-08-27.
From QA 2026-08-27: REQ-032 core PASS on 38237 (200 not 400, matches form, per-person ticks, sample person gone, a6 canary OK) — but 🟠 DEF-18 blocks close: footer วันที่มาติดต่อ prints literal "null" (contactDate not blanked; SPEC-035 says blank-never-null). One nz() fix → route to Sober/Jason, I re-render + close. See TEST-007.
