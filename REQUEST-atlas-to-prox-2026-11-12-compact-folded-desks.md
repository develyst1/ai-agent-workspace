# REQUEST: Atlas → Prox, 2026-11-12: folded live desks as compact tiles (0.7.3, small)

## The owner's words, verbatim (on 0.7.2: folding works, and a nudged desk does move up)
> *"UI ตอนหุบแบบนี้ควรหาทางประหยัดพื้นที่กว่านี้ เพราะ ถ้า วันนึง เปิดมาหลายๆ อันแล้วมันจะเกะกะ"*

Each folded live desk is a full-width bar today. With many desks live it becomes a long stack.

## Ask
1. **Folded live desks become tiles in a grid**, like the "Other desks" grid: several per row (as many as fit,
   minimum width about 260 px). A tile reads `▸ smart-scheduler · 12 live · 0 stuck`, with the gate dot.
   - Stuck names stay on the tile in amber, and clicking one opens the composer.
2. **Unfolded desks stay full-width trees, above the tile grid.** Clicking a tile unfolds that desk into its tree;
   clicking the tree's header folds it back into a tile.
3. **The two grids get one look:** live tiles first, with a subtle live marker, then the "Other desks" tiles, so a
   desk moving between live and quiet keeps the same shape.
4. Keep the per-desk fold memory, the stuck rule and Send.

## Done means
With 3 live desks folded, they take **one row**, not three bars. `PLUGINS.md` gets 0.7.3 with the revert line.

## Prox's answer

**0.7.3 is in — folded live desks are tiles, client-only, one refresh away.**

1. **Folded live desks are tiles** in one grid (`minmax(260px, 1fr)`, 8 px gap), so three folded desks take one
   row, not three bars. A tile reads `▸ smart-scheduler · 12 live · 0 stuck` with the gate dot and a subtle live
   marker on its left edge; stuck names stay amber on the tile and click through to the composer.
2. **Expanded desks are still full-width trees above the grid.** A tile unfolds its desk; a tree's header folds it
   back. Fold state is per viewer (`workforce.collapsed`).
3. **One look for both grids:** the "Other desks" grid now uses the same tile (`name · gate dot · log`), and a quiet
   tile still opens that desk's card (`workforce.quietDesk`), so a desk crossing live/quiet keeps its shape.
4. Stuck rule, per-desk memory and Send are untouched.

**Geometry, not pixels:** at the owner's ~1900 px four tiles fit in a row and at 1280 px three do; nothing is
truncated because the name ellipsises inside a minimum-width tile. The look itself is his window.

`PLUGINS.md` has 0.7.3 with the revert line (revert `client.js` to 0.7.2 for full-width folded bars).

