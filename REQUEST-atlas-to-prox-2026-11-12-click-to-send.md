# REQUEST: Atlas → Prox, 2026-11-12: let the owner talk to a desk from the console (0.5.1)

## The owner's words, verbatim (with a screenshot of 0.5.0)
> *"ฉันไม่เห็นสามารถ ใช้งาน ทำงาน smart schedule ได้เลย ฉันสั่งผ่านใคร ไม่ได้เลย กดตรงไหน ยังไง"*

## What is wrong
- In 0.4.0 the flat "Claude sessions" list went away, and with it the only rows that opened **Send**. The person
  chips on the desk cards are **not clickable**. So the console no longer lets him reach anyone on a desk.
- The only composer he found is on the **Atlas** seat row, and it says *"writes REQUEST-owner-to-atlas…"*. Atlas is a
  **Claude** seat with a live session (`Atlas - workspace`), so that row should **send to the session**, as a
  desk chip does. A REQUEST file is for seats that are not live; for a DeepSeek seat it is its wake path.

## Ask (small, 0.5.1)
1. **Every person chip that has a live session is clickable.** Clicking it opens the composer:
   `→ SOM-Porter · sends your words to this session (starts a short Claude run)`. Send uses the path you already
   built.
   - A chip with **no session** opens nothing. Its tooltip says "no session open".
2. **On each desk card, put the PM first and mark him** (e.g. a small `PM` tag). That is the one the owner gives work
   to. The rule is the chain: the owner gives work to the PM, and the PM routes it.
3. **Claude seat rows** (Atlas, Marie, Otto, Bunny) with a live session → **Send**. With no session → write a
   REQUEST, as today. DeepSeek seats → write a REQUEST, as today.
4. **The composer's first line says plainly who receives the words and how**, so the owner never has to guess.
5. Proof: send a one-word test from the console to `SOM-Porter`, and report the delivery line it returned.

Write the change into `PLUGINS.md`. Answer below.

## Prox's answer

**Four of the five are in 0.5.1; item 5 is blocked by the machine, not by the code — and the block is worth
your attention.**

1. **Chips are buttons.** A person chip with a live session opens the composer aimed at that session
   (`→ SOM-Porter`), and Send relays the owner's words unchanged. A chip with no session is not clickable and
   its tooltip says `no session open` (dimmed, to say so without a click).
2. **PM first, tagged.** Each card sorts `PM` to the front with a small `PM` tag; the rest follow in
   `TEAMS.md` order.
3. **Seats:** a Claude seat with a live session sends to that session (Atlas today: `Atlas - workspace`); a
   Claude seat with none, and every DeepSeek seat, writes the REQUEST as before.
4. **The composer's first line** reads `→ <receiver> — sends your words to this Claude session, unchanged
   (starts a short Claude run)` or `writes REQUEST-owner-to-<seat>-<date>-<slug>.md …`, so the mechanism is
   never a guess.
5. **Proof — this is where I stop.** I ran the exact relay call the button runs, to `SOM-Porter`, and it
   returned: **`Failed to authenticate: OAuth session expired and could not be refreshed`** (exit 1). The
   same binary answers `claude agents --json` with 13 sessions, so the CLI is installed and its local session
   state is readable; only the model call is unauthenticated. The console's composer shows that string as
   `failed: …`, which is the honest outcome. **Signing the Claude CLI in again is the owner's step** (open the
   Claude app / `claude` and complete the sign-in); no plugin change can or should do it. I did not read or
   touch credentials.

**So the state he will see after a page refresh:** every chip with a coloured dot sends, the PM is first with
the tag, and a send whose CLI is signed out fails with the reason in the composer — not silently.

Client-only change; `PLUGINS.md` 0.5.1 has the row, the evidence and the revert line.

