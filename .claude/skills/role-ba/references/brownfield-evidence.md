# Gap analysis of an existing system — from evidence

Use when a requirement is about a system that already exists: documenting it, changing it, or
deriving a new one from it. The rule: **a statement about what the system does today is
evidence, and evidence has a pointer.** Everything else is a gap or a proposal.

## The three kinds of statement — never mixed in one paragraph

| Kind | Meaning | How it is written |
|---|---|---|
| Observed | The source / config / rendered output shows it | Statement + pointer (repo or module, path, line where a line proves it) |
| Not established | The evidence available cannot settle it | `UNVERIFIED — <what would settle it>` or a data request to the seat who knows |
| Proposed | What the new or changed system should do | Stamped `team-proposed` until a seat decides; in a separately labelled section |

Keep a fixed, small set of labels for these and forbid invented ones ("probably", "likely", "TBD").

## Method

1. **Inventory before choosing.** Read the manifest, flags and metadata (archived, deprecated,
   last-modified, owner) before recommending anything to study. Never choose from a name.
2. **Trace from the user's surface inward.** Start at what the user sees — the screen template,
   the rendered page, the CLI output — and follow calls inward. A handler, route or graph edge
   proves nothing until the surface that reaches it renders. Commented-out and mode-gated UI are
   not features of the mode they are hidden in.
3. **Record the pointer at the moment of reading.** File and line, plus the quoted value that
   proves it (a code, a constant, a condition). A pointer added later is a guess.
4. **Write the gap as a gap.** What the snapshot cannot show (an external service's behaviour, a
   module not in the snapshot, real data) is declared, with what would settle it — never filled
   by inference from naming or convention.
5. **Separate "as is" from "to be" in files, not just paragraphs.** An observed contract written
   into the new system's design file will be read as the new design in three weeks. Give observed
   artefacts their own file, named as such.
6. **Spot-check before claiming coverage.** Open a sample of pointers and confirm the file says
   what the statement says. Count what the reader's artefact actually renders, not what the
   source data holds.

## Gap analysis table (as-is → to-be)

| Capability | As is (evidence) | To be (stamp) | Gap | Proposed requirement |
|---|---|---|---|---|

Only the "As is" column needs pointers; "To be" needs a stamp; "Gap" is your analysis and is
`team-proposed` until a seat accepts it.

## Read-only by default

Studying a system is never permission to run, build, modify or connect to it. Real environments,
real data and credentials are the desk's call; anything that needs them is a data request.
