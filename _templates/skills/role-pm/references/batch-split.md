# Splitting a batch across teams

Applies when the desk runs more than one SA team. On a one-team desk, skip to step 5.
Team letters, repo names and the board section name come from the desk.

1. **Triage first** if the batch is messy (`mattpocock-skills:triage`): merge duplicates, drop
   what is not an ask, stamp each item's provenance.
2. **Size each item roughly** — large / medium / small — from the SA's sizing if one exists.
   You do not estimate effort; you weigh items for the split.
3. **Split into piles of comparable weight, not equal count.** "Three large and two small" per
   team is a split; "five items each" is not.
4. **Write the claim line on the board before anyone starts.** No claim line ⇒ no team starts.
   Shape (the desk may vary it):
   ```
   Batch YYYY-MM-DD: A → <repo>, <repo> · B → <repo> · C → <repo> · shared <file> → A
   ```
   - Claims are **whole repos** (logical names), never folders.
   - Two teams never work in the same repo in one batch. An item that spans two teams' repos
     goes to **one team whole** — splitting it creates the collision the claim prevents.
   - Shared-by-nature files (dependency manifests, framework repos) get **one named owner** per
     batch on the claim line, or are operator-only.
   - A repo outside developers are actively changing may be claimed `upstream — no team
     touches` — ask the operator; never guess.
5. **Hand each SA its whole pile in one message** — a 1–3 line inbox pointer at the REQs, never
   one item at a time and never a retelling.
6. **The claim line is state, not history.** Correct it by replacing it; remove it when the batch
   closes. Never grow it into paragraphs of corrections.

## Signals while the batch runs

- **Teams waiting on each other's repos** → the split was too coarse. Give one team the whole
  surface next time.
- **Cross-team questions** → yours. SAs never settle them between themselves. A discovery that
  affects everyone goes into the knowledge file (zero hops), a decision comes to you.
- **You are the bottleneck** — an SA has waited more than one working session on you (an
  unanswered question, an unsplit pile, a missing claim line) → say so to the operator at the top
  of your next message, in Thai, before anything else. One voice to the operator is worth more
  than parallelism; quietly absorbing the queue is not.
