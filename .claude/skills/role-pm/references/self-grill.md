# Self-grill — intake (§A) and before anything leaves you (§B)

Use `mattpocock-skills:grilling` (or ask the operator for `/grill-me`) when the plan is big or
risky. For everyday asks, this checklist is the grill. Answer each line honestly; a "no" is a stop.

## §A — Intake: a new ask from the operator (or a customer, relayed)

1. **Restate it in one plain Thai sentence** and show the operator that sentence.
   If you cannot fit it in one sentence, you do not understand it yet.
2. **Is it already answered?** Search `DECISIONS.md`, the knowledge file, open REQs. If yes,
   act on that and say where the answer is — do not ask again.
3. **Who said it?** Operator's own call → stamp `operator`. Relayed from the end user →
   `customer-asked`. The operator says which; never decide it for them.
4. **Did they state a fact?** (a definition, a limit, a deliberate setting, "that's not a bug").
   Write it to the knowledge file now, with their words and the date, before replying.
5. **Do I need to ask anything?** At most one question. Pick the one whose answer changes
   what gets built. Everything else you decide and say what you assumed.
6. **What exactly was asked — and what am I adding?** Write the dispatch. Delete anything they
   did not ask for: a SPEC when no design was asked, a trade-off study, a device check, a
   count "while we're here", a second option nobody wanted.
7. **Is it a one-liner?** Then the dispatch is one line. If your plan is bigger than the ask,
   show the ask and the plan side by side and let them cut.

## §B — Before a REQ goes `READY_FOR_SA`, or a recommendation goes to the operator

**Evidence**
- [ ] Every claim I am about to make — "this repo", "this screen", "this flag" — I looked at
      myself: the column, the flag, the file line. Not the name, not a summary, not memory.
      (An archived repo looks exactly like a live one until you read the `archived` column.)
- [ ] I read the right slice. `tail` of a file returns the end of the file, which may be the
      header table, not the newest entry. Check you actually have what you claim to have read.

**The REQ against itself** (`role-ba` writes it; you grill it)
- [ ] No AC contradicts another clause of the same REQ, or its `## Out of Scope`.
- [ ] I opened the gate / check script that will judge the output (if the desk has one) and
      confirmed no requirement + Out-of-Scope pair is made impossible by a gate rule.
- [ ] Every AC says how someone checks it. "If you cannot state how someone would check it, it
      is not a requirement yet."
- [ ] Every constraint in it is the operator's, not mine. ("No content changes", "presentation
      only" — did they say that, or did I narrow it?)

**Visual asks ("ดูง่าย", "สวย", "อ่านง่าย", "ไม่รก")**
- [ ] I checked what the product/engine can already render before writing ACs.
- [ ] No AC adds text: coverage, findability, persistent menus, "≤ N lines" all add words and
      fight a readability goal.
- [ ] AC-1 is the operator's yes on a one-screen comp shown before the full build. Audits and
      contrast checks are supporting evidence, never AC-1.
- [ ] I read the desk's design notes (what they already accepted and what they rejected).

**Coverage**
- [ ] Each approved line maps to a TASK on every side it needs (FE and BE when both). A feature
      reported "done" with no UI, or a UI that does nothing, is a coverage miss the PM catches.
- [ ] Private / off-list items appear nowhere on team-visible files — not even as a hint.

**The message**
- [ ] Provenance label on every line of every list.
- [ ] A command carries its expected output and its stop condition.
- [ ] Thai, short, answer first, one ask, ball line (`thai-writing.md`).
