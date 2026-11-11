# REQUEST: Atlas → Prox, 2026-11-12: a composer that looks like a modern chat input (0.7.4)

## The owner's words, verbatim (on 0.7.3, which he likes: *"สวยงามขึ้นเยอะ"*)
> *"เหลือแค่ ช่องการส่งข้อความนี่แหละ แม่ง บ้านนอกยังไงไม่รู้"*

What looks crude today:
- a full-width plain textarea is pinned to the bottom, even when nobody is picked;
- a flat white "Send" box sits beside it;
- a technical sentence sits above it (`sends your words … starts a short Claude run`);
- the result arrives as a raw line of text.

## Ask
1. **Hidden until someone is picked.** No default target, so the bottom of the page is empty until the owner
   clicks a node, a tile name or a seat. **Esc**, or a × on the recipient chip, closes it.
2. **A floating, centred input bar:** max width about 720 px, rounded 12 px, a subtle border and shadow over the
   page, 16 px from the bottom. Inside it, left to right:
   - a **recipient chip**: the initial circle (same style as the tree nodes), then `Porter · smart-scheduler`,
     then ×;
   - an **auto-growing textarea** (1 line, up to 6), no visible border of its own, placeholder `Message Porter…`;
   - a **round send button** with an arrow icon in the accent colour. It is disabled (dimmed) while the text is
     empty, and shows a small spinner while sending.
3. **Keys:** **Enter sends, Shift+Enter is a new line**, as in every chat app. Ctrl/⌘+Enter keeps working.
4. **The technical note** moves to a small ⓘ in the bar, as a tooltip: *one-way · starts a short Claude run · not
   an approval*.
5. **The result is a toast**, not a text line:
   - success → `Sent to Porter` fades out after about 3 s;
   - failure → a red toast with the reason, which stays until dismissed;
   - the text box clears only on success.
6. **The picked node is highlighted** in the tree (accent outline), so the owner sees who he is talking to.
7. A REQUEST target (a seat with no live session, or a DeepSeek seat) uses the same bar. The chip says
   `→ REQUEST to Marie` and the button icon is a document. Nothing else differs.

Keep the one-way tag, the send path and every behaviour of 0.7.3.

## Done means
With nobody picked there is no input at the bottom. Picking Porter opens the floating bar, Enter sends, a toast
confirms, and the bar stays open for the next message. `PLUGINS.md` gets 0.7.4 with the revert line.

## Prox's answer

**0.7.4: the composer is a floating chat bar now; nothing of it shows until a target is picked.**

1. **Hidden by default.** The bar renders only when a node, a tile name, a stuck name or a seat is chosen; **Esc**
   or the chip's × closes it.
2. **Floating, centred:** `min(720px, 100% - 32px)`, rounded 12, 16 px from the bottom, bordered and shadowed.
   Inside: the recipient chip (initial circle, `Porter · smart-scheduler`, ×), an auto-growing textarea (1 line up to
   6, no border, placeholder `Message Porter…`), the ⓘ, and a round accent button with an arrow.
3. **Keys:** Enter sends, Shift+Enter is a newline, Ctrl/Cmd+Enter still sends.
4. **The note is a tooltip** on ⓘ: *one-way · starts a short Claude run · not an approval*.
5. **Result as a toast:** `Sent to Porter` fades after ~3 s; a failure is red, keeps the reason and stays until
   dismissed; the box clears only on success and the bar stays open.
6. **The picked node is outlined in the accent colour** in the tree, so the target is visible while typing.
7. **A REQUEST target uses the same bar** — chip reads `→ REQUEST to Marie` and the button shows a document icon;
   the send path, the one-way tag and every 0.7.3 behaviour are untouched.

**One honest limit:** the spinner is a CSS animation injected by the module; if the page blocks injected
`<style>`, it degrades to a static ring rather than failing. The look itself is the owner's window — I have no
browser. `PLUGINS.md` has 0.7.4 with the revert line (revert `client.js` to 0.7.3 for the pinned bar).

