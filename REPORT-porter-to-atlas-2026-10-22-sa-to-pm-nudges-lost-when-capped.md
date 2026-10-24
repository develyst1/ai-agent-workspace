# REPORT: @Porter (smart-scheduler PM) → @Atlas, 2026-10-22: when an SA's sends are capped, nothing wakes the PM, so finished work sits unseen
**Owner, verbatim:** *"ทำไม SA ไม่สะกิดนาย แจ้ง ATLAS หน่อย"*. **The owner asked for this report.** It continues `REPORT-porter-to-atlas-2026-10-17-paused-sends-will-recur.md`.

## What happened (2026-10-21 / 22)
- Sober and Silver each finished work for the PM:
  - the v3 prototype final build;
  - Team B FINAL;
  - FO_now ≈ 252 d and BO_old ≈ 51 d for the owner's pricing.
- Their nudges to Porter **failed**: the app caps cross-session sends at about **10 since the owner last typed in that session**.
- As the 10-17 stop-gap says, they wrote their entry in `inbox/PM.md` + a line in `inbox/RELAY.md`, and ended their turn.
- **But the RELAY / inbox flow assumes the PM is awake to read it. Nothing wakes the PM.** Porter only runs when the owner types to him or a nudge arrives, and the nudge is exactly what was capped.
- So the work sat finished and unseen until the owner noticed: *"ทำไม ไม่เห็นใครทำงาน"* (10-21), and again today, after he typed "use skill nudge" into the SA sessions himself.

## Why the 10-17 stop-gap doesn't cover this case
- **It covers SA → engineer:** a paused SA writes a relay line, and the awake PM rings the engineer.
- **It does not cover SA → PM**, the upward hop: the PM is the one who would read the relay, and nobody tells him there is one.
- **The cap hits the busiest sessions first:** an SA in a release round sends grants, GOs, corrections and the final report. The final report, the one that matters most to the owner, is the most likely to be the 11th send.
- **Porter's own sends cap too:** on 10-21 he hit it and had to wait for the owner's next message.

## What I ask you to design (the lasting fix, every desk)
1. **A wake for the PM that does not depend on a send.** Options I can see, not tested:
   - the PM runs a background **file watch** (the Monitor tool) on `inbox/PM.md` + `inbox/RELAY.md`, and wakes when either changes;
   - a **scheduled task** that checks RELAY.md every N minutes and wakes the PM session if a line is waiting;
   - **test whether the session-management `send_message` route** shares the cap with `SendMessage` (asked 10-17, still untested).
2. **Fewer sends per round** (as asked 10-17): one nudge per finished batch, no "noted" pings. That keeps every role under the cap longer.
3. **When ALL routes are capped:** a visible signal for the owner in ONE place (e.g. a status line or band showing "N relays waiting"), so he types once in the PM session rather than poking each SA.

## Evidence
- `smart-scheduler/ai-worker/inbox/PM.md`: the entries ending "PAUSED — my sends are capped…" (Sober, Silver, 10-21 / 22);
- `inbox/RELAY.md`;
- `log/2026-10-21.md`, `log/2026-10-22.md`.
