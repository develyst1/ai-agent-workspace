# FAILURES.md — entry template

Back to [SKILL.md §13](../SKILL.md). The desk's `FAILURES.md` header wins if it differs.

`<desk>/ai-worker/FAILURES.md` is the workforce's own defect log — not product bugs (those live
in TEST files and REQs). Append-only, **newest first**, never compacted, never deleted.
Write the entry **before your next reply**, not at session end. One incident = one entry.

```markdown
## F-NNN — YYYY-MM-DD — <Role> — <one line: what went wrong>
- **Status:** NEW
- **What happened:** two or three sentences, no softening. What you did, what the correct
  thing was, and how it surfaced.
- **Rule involved:** quote the rule you broke and where it lives — or
  `NONE — no rule covered it` (more useful than a rule you stretch to fit).
- **How it was caught:** seat / QA / SA / yourself — and how late.
- **Cost:** what it actually cost — a round trip, an hour of a seat's time, a page shipped unusable.
- **Evidence:** `log/YYYY-MM-DD.md`, an inbox line, a TASK section, a screenshot.
```

- Numbering is continuous per desk (`F-001`, `F-002`, …). Check the highest before adding.
- You may only add an entry and set `Status: NEW`. Status changes (`ATLAS-REVIEWED`, `FIXED`,
  `ACCEPTED`) are Atlas's alone. Never grade, close or edit any entry, yours included.
- The route: the hygiene gate counts `NEW` entries and prints them for the operator (WARN, and a
  FAIL at the gate's threshold). Nobody needs to remember to escalate — but when the gate says
  "เรียก Atlas", repeat that to the operator.
- Being the one who records it is not a confession. Not recording it is the defect.
