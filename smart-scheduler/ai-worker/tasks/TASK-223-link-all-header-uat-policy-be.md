# TASK-223: BE — `teacher-subjects:link-all` still documents a policy the owner has revoked

- Source: **Porter's log entry 2026-08-29** — *"POLICY CHANGED: `link-all` is now DANGEROUS on `uat`"*, closing with
  *"@Sober, the header should say so"*.
- Status: REVIEW → @Sober (SA)
- Depends on: none. **Comment + console output only — no behaviour change, no schema, no new flag.**
- Repo: **smart-scheduler-back**, on `develop`. Assignee: **@Jason** (tiny — take it between larger items)

## Why this is a real task and not tidying

`scripts/link-all-teacher-subjects.ts` opens with two statements that were true when written and are **false now**:

- `:2` — *"OWNER-RUN, on **BOTH** `sid` and `uat`."*
- `:13` — *"pruning who actually teaches what is staff work in the product, which is the trade-off the owner accepted
  when he chose **open-by-default**."*

`src/lib/bulk-link-plan.ts:4` repeats the same *"every teacher can teach every program"* premise.

On 2026-08-29 the owner said **"ตั้งใจจำกัด"** — DC and Pop are **deliberately** restricted on `uat`. A `--commit` there
would have granted DC 16 programs he is not meant to teach, and **the tool can never unlink**: undoing it is manual work
in the product, per teacher, per program. The dry run's **per-teacher deltas** are the only reason anyone noticed
(`+16 / =3` next to everyone else's `+1 / =18`); a summary line would have read as normal.

📌 **A comment that asserts a revoked policy is worse than no comment** — it is the reason someone runs the command
confidently. Same lesson as TASK-191, applied to prose.

## What to do

**1. `scripts/link-all-teacher-subjects.ts` header — correct both false statements.** Say plainly:

- `link-all` is **`sid`-only** (or any box where open-by-default still holds).
- On **`uat` the roster is deliberately restricted** (owner, 2026-08-29). Link a new program to a **named list** there,
  insert-only, `ON CONFLICT DO NOTHING`, after a `SELECT` that prints the exact names for the owner to read first.
- **The tool cannot unlink.** Say it in the danger paragraph, not only in the safety list — it is what makes a wrong
  run expensive rather than merely wrong.

**2. `src/lib/bulk-link-plan.ts:1–10` — one line** so the "every teacher can teach every program" premise no longer
reads as current policy, and points at the script header.

**3. 🟠 My addition, flagged so Porter can strike it — print the rule in the DRY RUN output.**
One line above the plan, e.g.:

```
⚠️  `uat`: the roster is deliberately restricted (owner 2026-08-29) — this tool is sid-only. It can NEVER unlink.
```

**Reason:** the person about to type `--commit` is reading the **console**, not a file header they opened weeks ago.
Porter asked for the header; this puts the same sentence where the decision is actually made, and it is one
`console.log` on the existing dry-run path. **@Porter — strike item 3 if you want the header alone.**

🚫 **Do NOT add a box-detection guard or an env check.** That is a behaviour change nobody ordered, and getting
"which box am I on" wrong in a safety guard is worse than a comment.

## Definition of Done

- [ ] Neither file states or implies that `link-all` is for `uat`, or that open-by-default is current policy.
- [ ] The header names: `sid`-only · `uat` = named list after a `SELECT` · **the tool cannot unlink**.
- [ ] Dry-run output carries the warning line (or item 3 is struck by Porter — say which in your notes).
- [ ] **Behaviour unchanged**: dry-run still rolls back, `--commit` still inserts with `onConflictDoNothing`, the plan
      output is otherwise identical. `bunx --package typescript@5.6.3 tsc --noEmit` → 0 · `bun test` green.
- [ ] 🚫 **Not run against any database** — this task needs no run at all.

## Implementation Notes (Jason, 2026-08-30)

**Repo:** `smart-scheduler-back`, branch `dong` ≡ `develop`. **Comment + console output only** — no schema, no
new flag, no migration, and 🚫 **nothing was run against any database.**

### Files
| File | Change |
|---|---|
| `scripts/link-all-teacher-subjects.ts` | header rewritten (items 1); **item 3** dry-run warning line; two operator-facing console strings corrected |
| `src/lib/bulk-link-plan.ts` | item 2 — the "every teacher can teach every program" premise no longer reads as current policy; points at the script's danger paragraph |
| `src/lib/bulk-link-plan.test.ts` | +5 tests pinning what the header may claim, and that behaviour is unchanged |

### Item 3 is IN — Porter has not struck it
You flagged it for him to strike; no strike has arrived in the log or in this file, so I built it as written:
one `console.log` above the plan, **dry-run path only**, saying `sid`-only · cannot unlink · `uat` = named list.

⚠️ **One consequence to note:** a run that goes straight to `--commit` prints no warning — only the header
covers it. That follows your wording (*"print the rule in the DRY RUN output"*) and I did not widen it. If you
want it on both paths it is a one-word change (drop the `if (!commit)`); your call, not mine to make.

### 🔴 Two things I found beyond the two lines you named — both were the same defect
The task named `:2` and `:13`. The **operator-facing console strings** carried the revoked policy too, and those
are what someone actually reads at the moment of deciding:
1. `:58` closing line — *"…don't forget to run on both sid and uat"*. **The last words on screen after a
   successful run told the operator to go and do the dangerous thing.** Corrected to say `uat` is off-limits and
   needs an owner-approved named list.
2. The DRY RUN footer — now ends `--commit (เฉพาะ sid)`.

I judged these in scope: DoD box 1 says *"neither file **states or implies** that `link-all` is for `uat`"*, and
a `console.log` states it far more loudly than a header comment. Flagging it explicitly since it is more than
the two line numbers you listed.

### The revoked wording is not reproduced ANYWHERE — including as a quotation
My first draft quoted the old sentences verbatim to explain what changed. **A test I wrote then failed on my own
header**, which is the correct answer: a grep for the revoked wording must find nothing in this repo, or the
next person greps, finds a hit, and reads the wrong policy out of context. Both files now *describe* what used
to be claimed without restating it, and the test enforces that.

### Behaviour unchanged, and pinned
A test asserts `if (!commit) throw new Error(DRY_RUN_ROLLBACK)` and `.onConflictDoNothing()` are still there,
**and that no box-detection guard was added** — it greps for `process.env.NODE_ENV`, `DATABASE_URL`, `isUat`,
`--force` and fails on any. That is your 🚫 written down where it cannot be quietly undone.
`UAT_WARNING` is deliberately **not** exported: nothing imports it, and the test reads the source text rather
than the module (importing this script would construct the DB client).

### Verified
```
bunx --package typescript@5.6.3 tsc --noEmit     → exit 0
bun test                                          → 970 pass / 0 fail (+5), 93 files
```
🚫 The script itself was **not executed** — not even a dry run. This task needs no run, as you wrote.

## Questions

- **@Sober — item 3 scope:** the warning prints on the **dry-run path only**, per your wording. A run that goes
  straight to `--commit` sees only the header. One word (`if (!commit)`) separates the two behaviours — say
  which you want; I did not widen it on my own judgement.
- **FYI, not a question:** I corrected two **console strings** beyond the two line numbers you named (`:58`'s
  closing line told the operator to run it on `uat`). Detail in the Implementation Notes — flagging it because
  it is more than the task literally listed, and I would rather you see it than find it in review.

## Review

(Sober fills this in at REVIEW.)
