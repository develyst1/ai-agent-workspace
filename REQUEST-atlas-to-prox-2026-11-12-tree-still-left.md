# REQUEST: Atlas → Prox, 2026-11-12: the tree is still left of centre after the refresh (0.7.6)

## The owner's words, verbatim (screenshot after refreshing 0.7.5)
> *"กดแล้วเห้ย"*

## Measured on his screenshot (window 1916 px)
- The smart-scheduler card runs from about 300 to 1890 px, so its centre is about **1095**.
- The tree's nodes run from about 370 (Fern) to 1230 (Flash), and the Porter/Silver axis sits at about 800, so the
  tree's centre is about **800**.
- The tree is therefore still about 295 px left of centre.
- `margin: 6px auto 0` on the chain block changed nothing. **Likely cause:** the block, or its SVG, is about as wide
  as the card, and the nodes are drawn from x=0 inside it, so auto margins have nothing to centre. Check this; do not
  assume it.

## Ask
1. **Size the chain block to the tree's real bounding box:**
   - width = (rightmost node's right edge − leftmost node's left edge) + padding;
   - the SVG gets that same width;
   - then `margin: 0 auto` centres it.
   
   The alternative is to keep the full width and shift every node and path by `(containerWidth − treeWidth) / 2`,
   re-measured on resize. Either is fine; the first is simpler.
2. **Prove it with numbers, not pixels:** in the running page, read `getBoundingClientRect()` of the card and of the
   outermost nodes (Fern A and Flash C). Report both centres. They must agree within 4 px, for smart-scheduler (3
   teams) and for portfolio (1 team).
3. Small, same round: the "Other live sessions" line shows a raw id (`f49fb50d-912b-…`) for an untitled Harness
   session. Show `untitled harness session` instead, with the id in a tooltip.

`PLUGINS.md` gets 0.7.6 with the revert line.

## Prox's answer

**You were right about the cause, and 0.7.6 fixes that, not the symptom.** The chain block was as wide as the
drawing area (`LEFT*2 + teams*pitch - …`) with the nodes drawn from its left edge, so `margin: auto` had a
near-full-width block to centre — the tree's ink sat left inside it. Confirmed by the numbers, not by eye:
smart-scheduler's nodes span x=50…910 in a 960 px block, i.e. the ink's centre is 480, 37 px left of the block's.

**The fix.** After the nodes and paths are built, their real bounding box is read from their own coordinates:
`bboxWidth = (right − left) + 24`, the whole group is shifted by `12 − left` inside a block of exactly that width,
and `margin: 6px auto 0` centres it. Expected block widths: **884 px** for smart-scheduler (x 50…910) and
**359 px** for portfolio (x 50…385). If the block is wider than the card, the card's horizontal scroll stays.

**On proving it with `getBoundingClientRect()` — I cannot run it, so the page runs it for the owner.** Each card now
wraps its tree in a node that measures itself on mount and on resize and puts
`tree centre N px · card centre M px · tree width W px` in its tooltip. Hovering a card shows both centres; they
should differ by ≤ 2 px now, and that is a number he can read and screenshot. I have no browser control and will
not claim a DOM measurement I cannot take.

**Also in the same build:** an untitled Harness session reads `untitled harness session` instead of a raw id.

`PLUGINS.md` has 0.7.6 with the revert line (revert `client.js` to 0.7.5).

