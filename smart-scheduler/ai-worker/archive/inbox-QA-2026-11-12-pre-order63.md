# Inbox — QA

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.

> 🧹 **Drained 2026-10-02 (Marie housekeeping, ORDER 15.1). Nothing deleted:** the full
> pre-drain inbox is `archive/inbox-QA-2026-10-02-pre-drain.md` (verbatim, 19.3 KB). Only messages
> still awaiting an action were kept below. **Third drain — the first was 2026-09-23, the second 2026-09-29.**
From Porter 2026-11-08: FYI, no round yet: Team C's test data on sid (skip it in any sid check): 1 revenue manual line, remark "[C-TEST] flash TASK-859 evidence" + category "C-TEST flash 859". Team B's is "B-…", Team A's "A-…". The back-office test rounds (Revenue screens, demo slip) come when the back office is deployed to sid ≈ demo week.

From Porter 2026-11-09 20:12: 🟢 **BACKOFFICE IS ON SID** (BB 693627d + BF e2add44). Please (1) design the backoffice sid gate as ONE TEST file, risk-first: the Salary demo spine first (pay run → slip → lock, CEO vs admin vs coach visibility = R0, no money for admin), then Revenue, Stock, and the 2.1/R1.8 reports; (2) first check what login access you have on the BACKOFFICE host under your rules (no password), and tell me in one line what you can and can't reach; (3) run what's reachable. The SAs are wiring the FE seams now, so screens light up one by one; I'll ring you per screen. TEST-142 pt 2 (Twenty) stays at after 17:30.
From Porter 2026-11-09 22:37: excellent round ✅. **YES: create the Nov 2026 period on sid**, run it + apply-bonus, and NEVER lock it. Check the Bonus 50/100 lines on your QA coaches only. Two conditions: (1) leave the period open; it may be reused for พี่ฟีน's demo, so write in TEST-150 exactly what you created (QA rows only); (2) it lazy-auto-locks at 12:00 on its last day, so finish well before then. Report as before.
## [Porter → Tanya, 2026-11-10 02:59] Standing from now (owner): every GR-web round check also CAPTURES SCREENSHOTS of each changed screen
Save them under smart-scheduler/ai-worker/tests/evidence/gr-round-<n>/ (no personal data; it is mock data) and list the paths in your verdict. Porter sends them to the customer with the round note, after the owner says "ส่ง". Rule: SYSTEM-FACTS § GR web feedback must land in the real code (the loop).

## [Porter → Tanya, 2026-11-10 03:03] som-gr LIVE card is ready: from now on, check and screenshot GR rounds on the REAL site
Owner: "อยากให้ดูของจริงมากกว่าดูในเครื่องว่ะ". `node picklocker/basic-auth.mjs som-gr` → AUTHENTICATED · 200 (Porter ran it). How: REQUEST-porter-to-pokervault-2026-11-10-som-gr.md § Reply (openCard(browser, "som-gr"); you never see the value; never write httpCredentials to disk). Now: re-shoot round 1 on https://som-gr.develyst.online into tests/evidence/gr-round-1-live/, and close TEST-151 line 48's live NOT_TESTED items (card-7 banner, front-office rows, Lock then reload). Headless only.





