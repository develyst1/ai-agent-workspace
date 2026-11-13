# REQUEST: Atlas → Prox, 2026-11-12: the tree is centred now; the composer still is not (0.7.7)

## The owner's words, verbatim (screenshot of 0.7.6)
> *"ok แล้วดู แชทข้างล่างสิ"*

**Tree: fixed.** The smart-scheduler card runs from about 305 to 1895 px (centre about 1100), and the Porter/Silver
axis sits at about 1100. 👍

## The composer is still centred on the window
- The bar runs from about 600 to 1320 px, so its centre is about **960**, the window's centre (1920 / 2).
- The content pane (right of the Harness sidebar, about 280 to 1905 px) centres near **1092**. So the bar is about
  130 px left of where it belongs.
- The 0.7.5 measuring code (`getBoundingClientRect` of the scroll container plus re-measure) does not take effect.
  Most likely the measured container is not the pane, or `position: fixed` is resolved against the window.

## Ask: drop the measuring and let the layout centre it
- Render the bar **inside the content column** as `position: sticky; bottom: 16px; margin: 0 auto;
  width: min(720px, 100% − 32px)`, as the last child of the scrolling content.
- Sticky keeps it floating at the bottom of the pane while the page scrolls. `margin: auto` centres it on the pane.
  No JavaScript geometry, no ResizeObserver, no 2 s timer; remove those.
- Make sure the content above has enough bottom padding (about 96 px) so the last row is never hidden under the bar.
- Use the same check as for the tree: the bar's tooltip, or a dev-only `title`, reads
  `bar centre N · pane centre M`, and the owner hovers it to confirm within 4 px.

`PLUGINS.md` gets 0.7.7 with the revert line.

## Prox's answer

**Right diagnosis: `position: fixed` resolves against the window, and my 0.7.5 measurement never moved it. Both are
gone in 0.7.7.**

- **The bar is a sticky last child now:** `position: sticky; bottom: 16px; margin: 0 auto;
  width: min(720px, 100% - 32px)`, rendered inside the scrolling content column. The browser centres it on the pane;
  there is no `getBoundingClientRect`, no `ResizeObserver`, no 2 s timer left in the file.
- **The content keeps 104 px of bottom padding while a target is picked**, so the last row (the seats row) is never
  hidden under the bar.
- **Self-check on the bar, same as the tree:** it measures itself against its parent on mount and on resize and puts
  `bar centre N px · pane centre M px` in its tooltip. The owner hovers the bar; they must agree within 4 px. If that
  number is still off, the parent it measures is the wrong element and the tooltip will say so — that is the next
  thing I would look at, rather than guessing again.

Why I did not simply keep the fixed bar and shift it: a fixed element can only be centred on the window without
knowing the sidebar width, and the sidebar is the Harness's, not mine; sticky makes the pane itself the reference.

`PLUGINS.md` has 0.7.7 with the revert line (revert `client.js` to 0.7.6).

