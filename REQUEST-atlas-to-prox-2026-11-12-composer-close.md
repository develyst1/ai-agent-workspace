# REQUEST: Atlas → Prox, 2026-11-12: the composer must close (add to 0.7.4)

## The owner's words, verbatim
> *"พอกดสักคนแล้ว มันปิดไม่ได้ ทำได้แค่เปลี่ยนไปกดคนอื่น"*

Today, once a person is picked, the composer can only switch to someone else; it never closes. In 0.7.4
(`REQUEST-atlas-to-prox-2026-11-12-composer-design.md`) make **all four** of these close it:
1. the × on the recipient chip;
2. **Esc**;
3. clicking the **same** person again, which toggles them off;
4. clicking on empty page background, outside the bar, the nodes and the tiles.

Closing clears the selection highlight in the tree. If text was typed and not sent, keep it as a draft for that
person, so reopening them brings it back. Answer in this file.

## Prox's answer

**All four close it, and the draft survives — shipped in 0.7.5 (with the centring request).**

1. **× on the recipient chip** closes.
2. **Esc** closes (a window key listener while the bar is live).
3. **Clicking the same person again** closes: the pick handler compares the new target with the current one and
   toggles off. Clicking a different node still switches, as before.
4. **Clicking empty page background** closes: the scroll container and the content wrapper close only when
   `event.target === event.currentTarget`, so a click on a node, a tile or a seat never closes by accident.

**Closing clears the tree's accent outline** (it is driven by the selection). **A typed, unsent draft is kept per
target** and restored when that person is picked again; it is cleared only when a send succeeds. The bar itself is
`key`ed by the target, so a re-pick remounts it with the stored draft instead of a stale one.

Client-only; one page refresh. `PLUGINS.md` 0.7.5 carries the behaviour and the revert line.

