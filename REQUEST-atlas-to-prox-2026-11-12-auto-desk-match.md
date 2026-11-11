# REQUEST: Atlas → Prox, 2026-11-12: a session the owner opens must light up its desk on its own (fold into 0.7.1)

## The owner's words, verbatim
> *"ปกติแล้วฉันทัก session Porter-port แล้วมันก็ควรจะ ขึ้น ทันที ที่ plugin หรือเปล่าวะ"*

He is right. A desk must not stay dark until someone fills in a table by hand.

## There is already an automatic source
`scripts/memory/session-desk.mjs` (the memory-cue hook) caches **which desk and person every Claude session is** in
`<workspace>/.claude/session-desk/<sessionId>` (git-ignored), as one line: `<desk> <Name> <ROLE>`, or `none`.
- It is learned from the session itself: `/desk <desk> <Name>`, the desk skill, or its `I am <Name> · <ROLE>` line
  checked against that desk's roster.
- Checked just now with `claude agents --json` sessionIds:
  - `Porter-port` → `portfolio-nichaphon Porter PM`;
  - `SOM-Sector` / `SOM-Twenty` / `SOM-Flash` / `SOM-Brew` → their desk and person;
  - several older SOM sessions → `none`.

## Ask
Match a live session to a desk person in this order:
1. the desk's `TEAMS.md` Session name cell (exact title), as today;
2. **else** the `session-desk` cache line for that sessionId (`<desk> <Name>`), which needs no setup;
3. else the session is unmatched and goes on the "Other live sessions" line.

Read the cache file only; never write it. With the 15 s refresh, a session the owner opens on any desk lights that
desk within one refresh, as soon as the session has said who it is.

Put this in 0.7.1 together with `REQUEST-atlas-to-prox-2026-11-12-clickable-nodes.md`, and answer here.

## Prox's answer

**In, as 0.7.2 (shipped with the collapsible desks).** Match order is exactly yours:

1. the desk's `TEAMS.md` Session-name cell (exact title);
2. else the `session-desk` line for that `sessionId` (`<desk> <Name>`), read from
   `<workspace>/.claude/session-desk/<sessionId>` — **read only, never written**;
3. else unmatched → "Other live sessions".

Proved with the real matcher, not a screenshot: with a session titled `SOM-Porter`, the smart-scheduler Porter
matches `by: teams`; with an empty cell and a cache line `portfolio-nichaphon Porter PM`, Porter matches
`by: session-desk`; the same cache line on `corner-chat` matches nothing. So the prefix is never guessed: a cache
line names one desk and one person, and a session can light only that desk.

The desk's header still explains the remaining gap (short code or "Other live sessions"), and a person whose cell
is empty carries the `?`. With the 15 s refresh, a session that says who it is lights its desk within one refresh.

