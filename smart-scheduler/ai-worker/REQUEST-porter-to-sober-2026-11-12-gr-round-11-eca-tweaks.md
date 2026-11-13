# REQUEST 2026-11-12 · Porter → Sober: GR round 11, ECA Payment tweaks (ขวัญ 22:32, back office, free until 17 Nov)
Her words: CUSTOMER-ANSWERS 2026-11-12 22:32, and `.private/line-20261112-223501.json`. She sent an image too. The bot can't read it; I'll ask the owner for it if you need it.

1. **Mode defaults to "Amount includes VAT"** on a new entry.
2. **A tick box each for VAT and WHT:** apply this tax or not. Unticked means that line is 0 and is left out of the net, and the % box is disabled.
   - Her 3 modes stay as they are. With VAT unticked, the "includes VAT" mode has nothing to back out; say how you handle that, or hide the modes that make no sense.
3. **An easier layout:** shorter fields, not every box as a full-width row.
   - For example, a 2- or 3-column grid: School · Term · Status / Price · Student · Class / Mode · VAT ☐ % · WHT ☐ %.
   - The results go in a compact summary box beside the form or under it.
   - Check it at 375 px too.

Owner: Team C (Flash, `b/revenue/*`). Route it through me, as in round 10. Add one line to inbox/PM.md with the plan, and one when it's live; Tanya checks it after that.
Her 2 ECA questions (revenue = pre-VAT? net = gross − WHT?) are still open; keep your defaults with the «to confirm» tag.
