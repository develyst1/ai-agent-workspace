# REQUEST: Atlas → Prox, 2026-11-12: console 0.6: show each desk's chain and where the work is

## The owner's words, verbatim
> *"ฉันอยากให้ทำ UI ให้มี chain บอกด้วยจะได้ดูง่ายกว่านี้ว่างานวิ่งไปไหน เส้นไหน ยังไงบ้าง เส้นไหนบ้างกำลังไปพร้อมกัน
> ไปทำที่ใครอยู่"* · on the 5 ideas below: *"เป็นไอเดียที่ไม่เลว"* · *"ไปเลย … ฉันไม่อยากผิดหวัง"*

He skipped a mock-up and wants the real thing, so build it in the plugin and keep it simple. He judges it in his
own window.

## 1. The chain: where it comes from
- **Default:** derived from each desk's `TEAMS.md` roster (`Role · team` cell):
  - `owner ↔ PM`;
  - `PM ↔ every QA`;
  - `PM ↔ the SA of each team`;
  - `SA(team X) ↔ BE(team X)` and `SA(team X) ↔ FE(team X)`.
  
  Rows with team `all` hang off the PM.
- **A desk's own chain wins:** if its `TEAMS.md` has a `## Chain` section with a ` ```chain ` block (one
  `<Name> ↔ <Name>` per line, `owner` for the human), use exactly those links. The format is now in
  `_templates/project/ai-worker/TEAMS.md`. No desk has written one yet, so every desk is on the default today.
  Show a small `default` tag when it is derived.

## 2. Where the work is (read only, never claimed)
- **Mail on a link:** each message line in `inbox/<receiver>.md` names its sender in one of two shapes found on
  the desks today: `From <Name> …` or `## [<Name> → <Name>, …]`. Count them per (sender → receiver) and light that
  link, with an arrow toward the receiver and the count.
  - A line whose sender you cannot parse still counts for the receiver, but lights no link.
  - Lines that start with `#` or `>` are the file's preamble: skip them, as 0.5 does.
- **Person state:** as now: busy (green), waiting (amber), idle (grey), no session (outline).
- **Stuck** = mail waiting and the session not busy or waiting. This is the strongest highlight on the page.

## 3. Layout (the owner liked all five ideas)
1. **"ต้องดู" strip at the top:** every stuck person on every desk, as `desk · name · N messages from <sender>`.
   Click → the composer to that person. When nobody is stuck, one quiet line says so.
2. **Active desks get a full card; desks with no live session collapse to one line** (name · gate dot), and
   expand on click.
3. **The chain inside a card:** `owner → PM` at the top, the QA beside the PM, then **one column per team**
   (`A`, `B`, `C`): SA on top, BE and FE under it, with the links drawn as lines.
   - Teams sit side by side, so "which lines run at the same time" is visible at a glance.
   - A team column with any busy or stuck member is marked active.
4. **Readable people:** larger names, and a filled background in the state colour (not only a 6 px dot). A person
   with no session is dimmed.
5. **Less noise:**
   - drop `board NN KB`;
   - the gate verdict becomes a small dot by the desk name, with the first FAIL/WARN line as a tooltip (it is
     Marie's work, not the owner's);
   - the seat list becomes one compact row, each status next to its name instead of at the far edge.

Keep everything 0.5.3 does: Send, the one-way tag, the PM tag, and no thresholds of your own.

## Done means
- smart-scheduler shows owner → Porter, QA Tanya and Twenty, and three team columns: Sober → Jason, Fern ·
  Silver → Bob, Fanta · Sector → Brew, Flash.
- One real inbox line, for example in `BE-C.md` from Sector, lights the Sector → Brew link with its count.
- A desk with no live session is one line.
- No text is cut off at the owner's window width (about 1900 px), and nothing breaks at 1280 px.
- `PLUGINS.md` has 0.6.0, with the revert line.

## Prox's answer
(pending)
