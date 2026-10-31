# The knowledge file and the snapshot

Two files only the PM writes. They have opposite shapes, and mixing the shapes is the failure.
File names vary by desk (commonly `SYSTEM-FACTS.md` and `RESUME-HERE.md`); the desk says which.

| | Knowledge file | Snapshot |
|---|---|---|
| Holds | What the operator told us and how the system really behaves | Where the project is right now |
| Shape | **Append-only.** One fact, one line, who said it, date | **Replaced whole**, never appended to |
| Size | Exempt from size gates — never from shape | One page (~4–6 KB) |
| Wrong line | Strike through, write the correction under it | Rewrite the page |
| Read | Every role, at session start | You, first thing; SAs read-only |

## Knowledge file — the job nobody else can do

**When the operator states a fact about the product or the system, write it before you send your
reply.** Not after, not at session end. A fact that lives only in chat is one the next session
will not have, and they will have to say it again.

Counts: a product definition, a decision, a limit, a deliberate setting, which document is
authoritative, something that looks like a bug but is not.
Does not count: a requirement (REQ), a status (board), your own inference (not a fact),
something you read in a document they have not confirmed ("no inferring a product rule from a
document").

Entry shape:
```
- <fact in English> — "<their exact Thai words>" [operator YYYY-MM-DD]
```
Contradicts an existing line? Do not pick a winner. Mark both `⚠️ CONTESTED`, ask them one
question, and treat both as unactionable until they settle it. Never rewrite or delete a line.
Never move board content into it, and never move content between files yourself — that is the
desk's housekeeper role.

Decisions may live in `DECISIONS.md` instead, per the desk. Either way: read both before asking.

## Snapshot — the first thing you read, the last thing you write

**Open:** read it first, then verify it against the board and today's log. Report any
disagreement to the operator. Never silently trust it; never silently fix it.

**Close:** rewrite it from the current state. The test: could a cold session that read only
this page act correctly in its first five minutes?

Template:
```markdown
# Snapshot — <desk> — written YYYY-MM-DD HH:MM by PM

## Where we are (3–5 lines)
- <state of the current batch / round> [provenance]

## Waiting on the operator
- <the one decision, in their words> [team-proposed | carried-over]

## In flight
| Item (operator's name for it) | ID | Team | Status | Next move |

## Just closed
- <item> — DELIVERED YYYY-MM-DD; NOT_TESTED: <...>

## Traps for the next session
- <the thing that will bite a cold reader: a deliberate setting, a CONTESTED fact, a stale file>
```
Every line carries a provenance label.

**The failure to watch:** adding a section per turn ("the verdict", then "the next REQ", then
"the run") and trimming whenever the size gate complains. A size gate cannot tell "too long" from
"no longer a snapshot" — you can. When you are about to add a dated block, rewrite the page
instead. That slope is how a 47.9 KB status file got built one section at a time.
