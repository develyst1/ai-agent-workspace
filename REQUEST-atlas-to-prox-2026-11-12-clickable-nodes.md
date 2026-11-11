# REQUEST: Atlas → Prox, 2026-11-12: console 0.7.1: clickable nodes, quiet desks out of the way, say why a desk is dark

## The owner's words, verbatim (on 0.7.0)
> *"สวย แต่กด node พวกนั้นไม่ได้ เช่น กด Porter PM ไม่ได้ และพวกโต๊ะที่หุบไว้อยู่ มันแอบเกะกะ และ ฉันว่ามันน่าจะhard code
> หรือเปล่าอะไรบางอย่าง ฉันไปปลุกโต๊ะ portfolio มา ทำไม นิ่งอ่ะ"*

He likes the tree ("สวย"). Keep its look exactly as it is.

1. **Every tree node with a live session is clickable again** and opens the composer, as the chips did in 0.5.3,
   with the one-way tag. This is a regression in 0.7.0. A node with no session is not clickable; its tooltip says
   why (point 3).
2. **Quiet desks:** replace the 10 full-width rows with **one** line at the bottom:
   `Other desks · 10 (no live session) ▸`. Clicking it expands a compact grid of `name · gate dot · log Nd ago`,
   several per row. Collapsed by default, and the state is remembered per viewer.
3. **Say why a desk or a person is dark. Never look hard-coded.**
   - Today the owner opened portfolio-nichaphon (`Porter-port` is live), yet the console says "no live session".
     The reason is data: that desk's `TEAMS.md` has an **empty Session name** for every row, so nothing can match.
   - When a desk has live sessions that match no roster row, show it on the desk line:
     `1 live session not matched — TEAMS.md has no session names (Porter-port)`.
     Then the desk counts as live and gets its card. In the card, the people with an empty session cell show a
     small `?` with the tooltip "TEAMS.md has no session name for <Name>".
   - **Do not guess by name prefix.** `Porter-` exists on several desks (`Porter-CC`, `Porter-ISP`, `Porter-port`).
   - Bring back the "Other live sessions" line for sessions that belong to no desk.
4. Keep everything from 0.7.0: the tree, the stuck rule, the gate dot, Send.

Atlas has asked the portfolio PM to fill in its session names, so that desk will light up on its own.

## Done means
- Clicking `Porter` on smart-scheduler opens the composer to `SOM-Porter`.
- The quiet desks take one line until clicked.
- Before portfolio's TEAMS.md is filled, its line says why it is dark and names `Porter-port`.

`PLUGINS.md` gets 0.7.1 with the revert line.

## Prox's answer

**0.7.1 is in; the tree's look is unchanged.**

1. **Nodes are buttons again.** Every node with a live session opens the composer for that session
   (`Porter` on smart-scheduler opens `SOM-Porter`); a node with no session does not react, and its tooltip says
   `no session open`. The click uses the same selection and Send path as the 0.5.3 chips, so the one-way tag is
   there too.
2. **Quiet desks are one line:** `Other desks · N (no live session) ▸`, expanding to a compact grid of
   `name · gate dot · log Nd ago`. Open state is remembered per viewer in `localStorage`.
3. **Why a desk looks dark — explained, and never guessed.**
   - A person with an empty Session-name cell gets a `?` with `TEAMS.md has no session name for <Name>`.
   - A desk with live sessions the roster cannot name is recognised only by **its own short code**
     (`Desk short code **BUD**`), never by a person's name prefix. Such a desk counts as live, gets its card, and
     its header reads `N live session(s) not matched — TEAMS.md has no session names (<names>)`.
   - **Proof of the rule** (unit test, since portfolio's file is now filled): a synthetic desk with code `port`
     and empty session cells, plus a live `Porter-port`, attributes exactly that session to portfolio; a desk with
     no code receives none and the session stays in "Other live sessions".
   - **The live case is already resolved by data:** portfolio-nichaphon's `TEAMS.md` now carries `Porter-port`, so
     the desk reports `live: 1` on the next refresh — exactly as you predicted. Its short-code line is still
     missing, which is why it would fall back to "Other live sessions" if the roster ever lost the name again.
4. Everything from 0.7.0 stays: the tree, the new-mail stuck rule, the gate dot, Send.

**Checked against the tool:** 15 live sessions, portfolio-nichaphon `live: 1`,
`stuck: []` right now (the four from 18:27 sent their mail and moved since; the inboxes were drained).
Pixels are still the owner's look. `PLUGINS.md` has 0.7.1 with the revert line.

