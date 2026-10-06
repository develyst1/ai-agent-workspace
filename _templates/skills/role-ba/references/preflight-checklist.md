# Pre-flight — before a REQ leaves the BA

Run every item, in order, every time the REQ moves to the desk's hand-off status — including after
an amendment. A "no" stops the hand-off; fix the REQ or write the point into `## Questions`.
Each item exists because skipping it once cost a build round.

## A. Internal consistency

1. **No AC contradicts another clause.** Read each AC against every requirement, every
   constraint and every Out of Scope line. Ask: "can this AC be met without breaking any other
   sentence in this file?" If not, the REQ is self-contradictory.
2. **No requirement is made impossible by Out of Scope.** Pair every requirement with every
   Out of Scope line — directly *and* via the tooling (section B).
3. **Every requirement is checked by at least one AC; every AC serves a requirement.**
4. **Observed and proposed are never mixed.** On a brownfield REQ, a statement about what the
   system does today (evidence) and a statement about what it should do (scope) are in separate,
   labelled places.

## B. Against the tooling that will judge it

5. **If the desk has a gate script, open it and read it** — not its README. For every rule, ask
   whether any requirement + Out of Scope pair is forbidden by it (e.g. "every X must have a Y"
   while Y is cut).
6. **Read the generator too, not only the gate.** A gate that *accepts* a field or node type does
   not mean the output a reader opens *renders* it. If an AC depends on something appearing on a
   page, confirm the page-builder emits it.
7. **Check what the engine already does** before writing ACs that ask for it — an empty section
   the renderer already supports is a content task, not a tooling one.

## C. Checkability

8. **Every AC has a `Check:` line** naming who checks it and how (command + expected output,
   page + what to look for, field + value, or a named seat's yes).
9. **Every AC is one observable outcome** — no "and" joining two results.
10. **Unhappy paths are covered**: invalid input, empty state, no permission, the thing not found,
    the network or dependency failing — whichever apply.
11. **At least one regression AC** names what must keep working exactly as before.
12. **Every AC is checked on the surface the user touches.** If the requirement is a user doing
    something, the AC proves the user can reach it (the screen renders the control), not that
    a method or endpoint exists.

## D. Visual and "looks" asks

13. **AC-1 is the operator's yes on a one-screen comp shown before the full build.** No team
    member may tick it. Audits, contrast scores and lint passes are supporting evidence only.
14. **No AC adds text to satisfy a readability ask.** Coverage, findability, persistent navigation,
    "≤ N lines before a picture" — if the ask was "ดูง่าย / สวย / lighter", each of these pushes
    the other way. Remove them or ask first.
15. **No content lock the asker did not state.** If the REQ says "no content changes", find the
    asker's words that say so; otherwise ask whether content may fold, summarise or become a diagram.
16. **The desk's design file was read** (the look already accepted, and what was rejected), if
    the desk has one.

## E. Provenance and evidence

17. **Every line carries a stamp** (harness §4). Header stamp for the ask; per-line stamps where a
    line's origin differs. `operator-delegated` carries a note saying when.
18. **No seat's name is on a sentence they did not say.** Relayed customer words are
    `customer-asked`, with the relayer as channel.
19. **Every recommendation and every factual claim carries `I checked: <file:line | output>`** —
    something you looked at yourself, not a name or a memory.
20. **Every user-facing string is exact**, or is an open Question. No invented copy shipped as final.

## F. Scope

21. **The REQ answers the ask, not more.** Every requirement traces to the asker's words or is
    stamped `team-proposed` and visible as such.
22. **Out of Scope names what a reader might reasonably expect and will not get.**
23. **Blocking questions are marked BLOCKS** and the REQ does not move while one is open, unless
    the desk's protocol allows partial hand-off and the unblocked part is stated.
