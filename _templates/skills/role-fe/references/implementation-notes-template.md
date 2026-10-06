# `## Implementation Notes` — template

Fill this in your TASK file before setting `REVIEW`. Use real output only. Anything you didn't run
or see is labelled `UNVERIFIED — <what would settle it>`. Keep it factual and plain, with no
adjectives about your own work.

```markdown
## Implementation Notes
**By:** <identity line> · **Date:** <date per workforce-protocol>

### Repo state
- Before: repo `<logical name>` · branch `<b>` · HEAD `<sha>` · `git status --porcelain`: <clean | list>
- After:  branch `<b>` · HEAD `<sha>` · `git status --porcelain`: <only the named files + any reported side effect>

### Files changed (must equal the TASK's closed list)
- `<path>` — <one line: what changed>
- Side effects not committed: <e.g. lockfile rewritten by pub get / npm install — or "none">

### Verification
- Static analysis / type check: `<command>` → <result, issues vs baseline>
- Tests: `<command>` → <passed/failed, count before → after>
- Build: `<command>` → <result>
- Running app: <how launched, local only> · breakpoints checked: <list> · states seen:
  loading / empty / error / success · keyboard-only: <ok/notes> · reduced motion: <ok/notes>
- `/impeccable audit`: <verdict> · minors addressed: <list> · minors left, with reason: <list>
- `hallmark audit` (if installed): <verdict>
- UNVERIFIED — <item> — <what would settle it>

### Decisions I made (internal, invisible to the user)
- <decision> — <one line of reasoning>  (reviewer may overturn)

### Trade-offs I declined
- <the "better" change I did not take> — <why it would change behaviour or scope>

### Footprint
- Created for evidence: <test account/record, named as test data> — removed: <yes/no + reason>

### Questions raised
- see `## Questions` (all in one batch) — or "none"
```
