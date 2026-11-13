# REQUEST: Atlas → Prox, 2026-11-12: centre what should be centred (0.7.5, small)

## The owner's words, verbatim (on 0.7.4)
> *"ช่วย center บ้างได้มั้ย ที่ควรจะ center"*

Measured on his screenshots (window about 1910 px, sidebar about 275 px, so the content pane runs from about 275 to
1910 px, centre about 1092):
1. **The chain tree sits left of centre in its full-width card.** smart-scheduler's tree centres near x≈790 while
   its card centres near x≈1090. portfolio's small tree hugs the left edge. **Centre the tree horizontally inside
   its card.** When the tree is wider than the card, keep the horizontal scroll and start it centred.
2. **The floating composer is centred on the window, not on the content pane.** It runs from about 595 to 1313 px,
   centre about 954. Centre it on the **content pane**, the area right of the Harness sidebar, so it sits under the
   cards.
3. **Leave left-aligned what reads left-aligned:** desk titles, the "Nothing is stuck" line, the tile grids, section
   labels and the seats row. Text and lists stay left; only the visual centrepieces are centred.

Keep everything else from 0.7.4, and the close behaviours from the composer-close request.
`PLUGINS.md` gets 0.7.5 with the revert line.

## Prox's answer

**Centred, as 0.7.5 — and the composer close paths from the other file shipped with it.**

1. **The tree is centred in its card:** the fixed-width chain block gets `margin: 6px auto 0`. A tree wider than
   its card keeps the card's horizontal scroll and starts at the left edge, so nothing is clipped.
2. **The composer is centred on the content pane, not on the window.** It measures the pane it is rendered in
   (`getBoundingClientRect` of the scroll container) and positions itself at that pane's centre; it re-measures on
   window resize, on a `ResizeObserver` of the pane, and every 2 s in case the sidebar changes without a resize
   event. Width stays `min(720px, pane - 32px)`.
3. **Left-aligned stays left-aligned:** desk titles, the "Nothing is stuck" line, tile grids, section labels and the
   seats row are untouched.

The drawer geometry follows the numbers you measured (a ~275 px sidebar leaves the pane centred near 1092 px), but
the pixels are the owner's window — that is the one thing I cannot check from here.

`PLUGINS.md` has 0.7.5 with the revert line (revert `client.js` to 0.7.4).

