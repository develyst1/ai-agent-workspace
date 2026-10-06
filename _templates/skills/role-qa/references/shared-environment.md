# Shared environments — footprint, click-scripts, regression list

Which environments exist and what QA may do on each is a desk fact (the desk's Environments
table). These are the generic rules for any environment that is not yours alone.

## Rules on any shared environment

1. **Clean up after yourself; declare your footprint.** Remove or revert what you created where
   the system allows it; declare the end state either way. Never quietly restore.
2. **Never touch other people's data.** Only rows you created. No update/delete on pre-existing
   records — not even to "reset" a test.
3. **Never message a real person.** Notifications (chat, email, SMS, push) reach humans even
   from a dev server. Isolate the recipient you control, or do not send — raise it.
4. **Never restart, redeploy or reconfigure a server.** You test on it; you do not operate it.
5. **Secrets come from the human via the desk's chain**, into a git-ignored local file. Never into
   a TEST file, log, screenshot, pasted output or any tracked file.
6. **Read-only means read-only.** On an environment cleared for reading only, every write is a
   data request to the human — no create, update, delete, import, restart.
7. **Mark what you create.** Every record carries a visible marker (e.g. a `QA-` prefix on a name
   or note) so anyone can tell it is test data.
8. **No contact is also a footprint entry.** If a task routed you to an environment you are not
   cleared for, record "no contact — not a page load, not an API call" and raise it.

## The footprint ledger

One running file per desk (e.g. `tests/FOOTPRINT-<env>.md` — the desk names it) that answers
"what has QA touched?" without reading every TEST file. Per session, a dated block:

```markdown
## YYYY-MM-DD (<Name>) — <TEST id> — <one-line purpose>

| What (id + marker) | Where | Removed? |
|---|---|---|
| <record> `id` · marker `QA-…` | <env> | ✅ removed / ❌ left — why (e.g. no delete path; inert) |
| Write attempt refused by the server (the case under test) | <env> | ✅ nothing created — <status + message> |
| Settings changed for a test | <env> | ✅ reset; verified back to <value> |
| Near-miss (wrong row opened, etc.) — declared | <env> | ✅ nothing written — how verified |
| Not touched: <messages, other people's rows, other environments> | — | — |
```

- Rejected writes are logged too: "attempted a write" is exactly what someone will want traced.
- Residue you cannot remove (no delete endpoint, money ledger rows) is flagged to the PM, not hidden.
- A read-only session gets a one-line "NO FOOTPRINT" block.
- Keep the file current: one block per session, no rewritten history, no contradicting summaries.

## Click-scripts — when a human must be the hands

For checks only a person/device can make (a real phone account, a painted result behind a login
you may not cross). The human's presses are few and well-aimed. Per script:

```markdown
## Script N — <REQ/AC>: <what is being confirmed>
**Why:** the one thing the eye must confirm; what is already verified separately (cite TEST).
**Environment:** <env> (never production unless the desk says so).
**Prepared data:** what you already set up, so no setup is needed.
1. <step>
2. <step>
   - ✅ Expected: <observable result>
   - ❌ Fail: <the defect's signature>
3. **Tell the PM:** pass/fail + one screenshot.
**Cleanup:** <what, or "nothing — view only">.
```

Add a note when the path itself may be unreachable (e.g. the item may be filtered out of the
picker) — that would be its own finding.

## The regression list (`tests/REGRESSION.md`)

- One line = one observable behaviour a user would notice breaking. If a line cannot be checked
  without reading code, rewrite it.
- Columns: `# | Must still do | From (REQ / defect) | Env | Last verified (date · env · result · API vs painted)`.
- A **Core** set runs before every deploy batch; the full set after a release touching shared code.
- Lines derived from someone's acceptance notes and never run by you are marked **unverified
  baseline** until the first run gives them a date and environment.
- Every delivered REQ adds its lines; every escaped defect adds the case that would have caught
  it, with an `Added by` reference.
- Partial verification is written as partial ("backend PASS; painted alert NOT TESTED").
