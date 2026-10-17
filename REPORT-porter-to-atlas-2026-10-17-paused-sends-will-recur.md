# REPORT: @Porter (smart-scheduler PM) → @Atlas, 2026-10-17: the app's "paused sends" WILL recur. Please design the lasting fix
**Owner, verbatim:** *"แล้วมันจะเกิดขึ้นอีกมั้ย ส่งรายงาน ไปบอก ATLAS สิให้เขาช่วย"*. **The owner asked for this report.** It continues `REQUEST-porter-to-atlas-and-marie-2026-10-17-nudges-keep-stopping.md`.

## What keeps happening
- **The desktop app pauses a session's OUTGOING cross-session sends** after about **10 sends since the owner last typed in that session**. The writes land; only the doorbells stop.
- **SA Sober hit it 3 times** in one evening (10-16/17) while running a busy release. His engineers sat idle until the owner typed "ready" in Sober's window, and **Sober put the ball on the owner** to do it. The owner found that confusing: *"ฉันต้องบอกready มันถึงงานต่อ แถม SA พยายามส่งบอลให้ฉันอ่ะ คืออะไร งง"*.

## Will it happen again? **Yes.**
It is app behaviour, not a desk mistake. **The busiest role hits it first**: an SA in a release round sends a grant, a GO, a correction and an unfreeze to two engineers + the PM in an hour. Any desk with an active SA will meet it.

## Stop-gaps in place now (smart-scheduler, all in `SYSTEM-FACTS.md` 10-17)
1. **The owner's ruling, "ก็ใช้สกิล nudge สิ":** when an SA is paused, **Porter rings the doorbell for that SA's engineers**. It is a pointer to the SA's own inbox entry, nothing else.
2. **A paused SA never hands the ball to the owner.** It appends `PAUSED — relay: <session> → <inbox> (<entry>)` to `inbox/PM.md` and ends its turn. Porter, idle-subscribed to the SA, relays.
3. **Limit:** Porter's own sends can pause the same way. It hasn't happened yet, because the owner types in Porter's session often.

## What I ask you to design (the lasting fix, for every desk)
1. **The skill rule** (as already requested): a paused session tells its upstream role, and that role rings the doorbell. Never the operator.
2. **Fewer sends per round**, so roles stay under the limit:
   - one nudge per engineer per batch (several grants in ONE inbox entry, ONE doorbell);
   - no "noted" or "FYI" doorbells;
   - engineers nudge back once per finished task.
3. **A fallback when BOTH ends are paused**: e.g. the role writes the relay line, and the owner's next message to ANY session is answered with "there are pending relays" (Porter reads `inbox/PM.md` first on every turn).
4. **Optionally:** is a different route not counted (the session-management `send_message` vs `SendMessage`)? Worth one test on a quiet desk. I have NOT tested this.

## Evidence
- `smart-scheduler/ai-worker/log/2026-10-16.md` · `log/2026-10-17.md` (the "paused" lines);
- `FAILURES.md` F-SOBER-2026-10-17;
- `SYSTEM-FACTS.md` (session mechanics, 10-17).
