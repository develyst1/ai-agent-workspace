# FAILURES — this team's own defect log

> **Append-only. Newest first. Never compacted, never summarised, never deleted.**
>
> This is not a log of product bugs — those live in TEST files and REQs. This is
> where **the workforce records its own defects**: a rule broken, a fact relayed
> unverified, a step left out, an ask turned into a project, work reported done
> that was not.
>
> **Why it exists:** a role cannot fix its own decay. It can only *notice* and
> *record*. Atlas reads this file, designs the fix, and Marie installs it. An
> entry that is never written is a defect that will repeat forever.

## When you MUST write an entry — not optional, not a judgement call

Write **before your next reply**, not at session end. One incident = one entry.

1. **The owner corrects you** — a fact, a scope, a tone, a language, an
   assumption. Any correction at all.
2. **A verdict goes against you** — `REWORK` from the SA Lead, `TEST_FAILED`
   from QA, a defect found in work you called finished.
3. **A routing violation** — yours, or one you caused by addressing the wrong role.
4. **You relayed something that turned out to be wrong**, even if you were
   repeating someone else in good faith. *Especially* then.
5. **You gave the owner an instruction that was incomplete** and he had to come
   back, guess, or ran the wrong thing.
6. **You broke a written rule** — even once, even if nobody noticed but you.

Being the one who records it is not a confession. **Not recording it is the
defect.**

## What an entry looks like

```markdown
## F-NNN — YYYY-MM-DD — <Role> — <one line: what went wrong>
- **Status:** NEW
- **What happened:** two or three sentences, no softening. What you did, what
  the correct thing was, and how it surfaced.
- **Rule involved:** the rule you broke — quote it and say where it lives.
  If there was NO rule covering this, write `NONE — no rule covered it`.
  (That answer is more useful than a rule you can name, so do not invent one.)
- **How it was caught:** the owner / QA / SA / yourself — and how late.
- **Cost:** what it actually cost — a wasted round trip, a wrong deploy, an
  hour of the owner's time, a feature shipped unusable.
- **Evidence:** `log/YYYY-MM-DD.md`, an inbox line, a TASK section, a screenshot.
```

Numbering is continuous per project: `F-001`, `F-002`, … Never renumber.

## Status values — only Atlas changes these

| Status | Meaning |
|---|---|
| `NEW` | written, not yet reviewed. **The hygiene gate counts these.** |
| `ATLAS-REVIEWED YYYY-MM-DD` | Atlas has read it; the fix is designed or the pattern is noted |
| `FIXED YYYY-MM-DD — <what changed>` | a rule, a template or a check now covers it |
| `ACCEPTED YYYY-MM-DD — <why>` | the owner or Atlas decided to live with it; recorded so nobody re-raises it |

**A role may only add an entry and set `NEW`.** You never grade your own failure,
never close one, and never edit someone else's entry.

## The route — how this reaches Atlas

Roles cannot call Atlas; only the owner can. So the gate does the calling:
`check-hygiene.mjs` counts `Status: NEW` entries and prints them in its output,
where the owner sees them. When he is ready he opens Atlas with
`อ่าน ATLAS.md — review FAILURES ของ harness-console`.

**Nobody needs to remember to escalate.** That is the whole point.

---

<!-- newest entry goes directly below this line -->

## F-001 — 2026-10-06 — Porter (PM) — REQ-001 specified data correctness only; the delivered UI was unusable to the owner
- **Status:** NEW
- **What happened:** REQ-001's ACs checked only that every value matched the gate; nothing said how much one screen may show or how the owner moves between parts. It was delivered 2026-10-05 with "layout" on the UNVERIFIED list. On 2026-10-06 the owner called the UI "ขยะมาก ข้อมูลมากเกินไปรวดเดียว ... คนใช้ไม่ไหว" and asked for it to be split into pages/menus (now REQ-002).
- **Rule involved:** NONE — no rule covered it (PM.md asks for testable ACs and unhappy paths, nothing on the usability / information load of a screen).
- **How it was caught:** the owner, on first real use, one day after DELIVERED.
- **Cost:** a second REQ and a rework round on two delivered screens.
- **Evidence:** `requirements/REQ-002-ui-split-into-pages.md` §Problem; `requirements/REQ-001-v1-two-screens.md` §SPEC_DONE report (UNVERIFIED: layout).
