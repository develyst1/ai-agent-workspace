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

## What an entry looks like — and how it gets in

Write the entry to a scratch file, leaving the heading as `F-NNN`, then run
`node ai-worker/add-failure.mjs <that file>`. The tool gives it the next id under
a lock, sets `Status: NEW`, puts it directly under the marker line at the bottom
of this header, and prints the id. **Never pick a number yourself and never paste
an entry into this file by hand** — two roles taking "the next number" at the
same moment is how ids collided before.

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

Numbering is continuous per project (`F-001`, `F-002`, …) and comes from
`add-failure.mjs`, never from you. Never renumber.

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
`อ่าน ATLAS.md — review FAILURES ของ buddy-screen`.

**Nobody needs to remember to escalate.** That is the whole point.

---

<!-- newest entry goes directly below this line -->

## F-002 — 2026-10-28 — SA — Reviewed a §13 string as present in the strings file, not on a screen; TEST-001 failed on it
- **Status:** NEW
- **What happened:** TASK-003 said "(`ไม่อนุมัติ` → the TV shows §13 'overtime declined', built in TASK-002.)", but TASK-002's step 6 never listed a screen or state that shows it. Its DoD and the SA's review only checked the string is defined in `src/strings.ts` (`grep -qF … src/strings.ts`). The string `overtimeDeclinedTv` was defined and never rendered. QA's TEST-001 found it on no screen: DEF-1 (MAJOR), AC-7 and AC-8 failed. Separately, at the TASK-001 review the SA accepted two diagram omissions ("or the child says stop", template retention) as "summary-level". AC-2 says each state/number must match, and QA failed them as DEF-2.
- **Rule involved:** role-sa §6 "Checking the gate, not the generator. Verify in the artifact the reader actually opens." Also §3: "Every claim that a user *can* do something cites the line that renders it". And the TASK 5-minute test: the TASK-002 step list did not carry the decline screen.
- **How it was caught:** QA (TEST-001 TEST_FAILED, 2026-10-28), routed by the PM (REQ-002 § Defects to fix — round 2).
- **Cost:** one QA round failed; TASK-005 to fix; a QA re-run.
- **Evidence:** tasks/TASK-002 DoD (strings-file grep), tasks/TASK-003 step 1 (the TV pointer), tasks/TASK-001 § Review (omissions accepted), tests/TEST-001 § Defects DEF-1, DEF-2.

## F-001 — 2026-10-28 — SA — Labelled an architecture change `[SA-decided]` before the owner decided it
- **Status:** NEW
- **What happened:** After the owner's 16:13 cost/provider facts, the SA rewrote SPEC-001 §3.2 and labelled the consequences `[SA-decided from the owner's fact]`. Several lines were also worded as settled ("becomes the base design", "drops out", "superseded", "settles part of D4"). The correct label was `[SA-proposed]`: D2 had not been decided by the owner. The SA's own skill says it may decide only what the user cannot see, and a provider/architecture choice is visible to the owner. The owner then set a standing rule (DECISIONS 2026-10-28 16:37, second line): every architecture choice comes back to him; the SA only proposes.
- **Rule involved:** workforce-protocol §8a ("Label something as approved … only if you can point at that person's own words … No approver named → it is not an approval, it is a proposal") and `attribution.md`; also SA-Lead.md "The stack is undecided … the owner decides". The SA used an own-decision label, not an owner-approved one, but on a choice that was not the SA's to make.
- **How it was caught:** the owner, via the PM, about 25 minutes later (inbox/SA.md 2026-10-28; DECISIONS 16:37).
- **Cost:** one owner correction and a standing rule; SPEC-001 relabelled (8 lines + 2 notes). No TASK or code was affected.
- **Evidence:** specs/SPEC-001-v1-stack-architecture.md §3.2 (16:13 update, now `[SA-proposed]`), §4 session-token row, §10; log/2026-10-28.md SA entries.
