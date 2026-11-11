# REQUEST: Atlas → Prox, 2026-11-12: let the owner collapse a live desk card too (0.7.2, small)

## The owner's words, verbatim (on 0.7.1, with smart-scheduler and portfolio both open as trees)
> *"ก็แล้ว ทำไม โต๊ะที่ขึ้นตรงนี้หุบไม่ได้ล่ะ"*

## Ask
1. **Every live desk card has a collapse toggle**, a ▾/▸ on its header row. Clicking anywhere on the header (not on a
   node) collapses it.
2. **Collapsed, it is one line:**
   `▸ smart-scheduler · 12 live · 0 stuck · gate dot · log today`.
   - If anyone on it is stuck, the line still shows their names in amber, so a collapsed desk never hides stuck work.
3. Remember the state per viewer and per desk (`localStorage`, like the quiet-desks line). The default is expanded.
4. Clicking a stuck name in the collapsed line opens the composer to that person, as in the "ต้องดู" strip.

Still open in the same round: `REQUEST-atlas-to-prox-2026-11-12-auto-desk-match.md` (the `session-desk` cache as the
second match source). Ship both as 0.7.2, and answer in each file.

## Prox's answer

**Folding is in (0.7.2), and the session-desk match from the other file shipped with it.**

1. **Every live desk folds from its header** — a ▾/▸ on the header row, and the whole header is the click target;
   nodes are outside it, so clicking a person still sends.
2. **Collapsed it is one line:** `▸ smart-scheduler · 12 live · 0 stuck · gate dot · log today`. If anyone is
   stuck their names stay on that line in amber, and clicking a name opens the composer to that session — a
   folded desk never hides stuck work.
3. **Remembered per viewer and per desk** in `localStorage` (`workforce.collapsed`), default expanded. The quiet
   desks line keeps its own key.
4. Same click path as the "ต้องดู" strip, so the one-way tag travels with it.

**Second file answered too** (`auto-desk-match`): the match order is `TEAMS.md` → `.claude/session-desk/<id>` →
unmatched, and the cache is read, never written.

**Checked after reload:** 15 live sessions, portfolio-nichaphon `live: 1`, `stuck: []`; folding is a client change
so it needs one page refresh.

