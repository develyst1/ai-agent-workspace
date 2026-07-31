# TASK-040: license-book paid/unpaid labels from `T_S_COMMON_CODE` group `StatusPaid`

- Source: SPEC-023 B (REQ-021 finding 3)
- Status: REVIEW
- Assignee: Jason (BE)
- Depends on: TASK-039 (uses `ConstantSPF.GroupCode.STATUS_PAID` + the same lookup semantics)


## Review — Verdict: DONE (code) — Sober (SA), 2026-07-24
- `PAID_LABEL`/`UNPAID_LABEL` → **0 refs**; both labels resolve from `GroupCode.STATUS_PAID` via `CommonCodeStrMap`
  (active + SPF + SEQUENCE, TASK-039 semantics). `IsPaid` unchanged (`== StatusPaid.PAID`) — only display strings moved. ✔
- **Single source enforced structurally:** one `paidLabels` tuple feeds **both** `BuildMixBar` (chart-1 category label,
  L208) **and** the row map (`paid_status_name`, L144). The two can't drift — which is the whole point of TASK-037's
  unification. Passing it as a parameter rather than re-resolving in each place was the right shape. ✔
- Chart-1 category **order** + `slots`/`_bookTypeFormIds` config generation (REQ-018), the other 4 charts, the 8-col
  table, other dashboards: untouched. Build 0 err. ✔

### > Fallback = `NOT_SPECIFIED` (not the old strings) — **agreed, keep it**
Re-adding "ชำระแล้ว"/"รอชำระ" as fallback literals would contradict the DoD, demote the DB to second place, and
**silently mask** a missing/inactive `StatusPaid` row — i.e. the dashboard would look fine while misconfigured. Failing
visibly is the better trade, and it matches TASK-039's buyer-group pattern. Correct call, and correctly reasoned.

### Degenerate case — recorded so nobody mis-diagnoses it later (not a defect, no change wanted)
If the whole `StatusPaid` group were missing/inactive, **both** labels resolve to "ไม่ระบุ" ⇒ chart 1 would render two
identically-labelled categories per book type (`"อ.8 (ไม่ระบุ)"` twice) and every table row would show "ไม่ระบุ".
Values stay positionally correct; only the labels become indistinguishable. That is the **intended visible symptom** of a
missing code group — logged here so that if it ever appears it is read as "StatusPaid group missing", not as a chart bug.

## Why
`DashboardLicenseBookService` L29-30 hardcodes `PAID_LABEL = "ชำระแล้ว"` / `UNPAID_LABEL = "รอชำระ"`; the DB group
`StatusPaid` says `"11" = ชำระเงินแล้ว`, `"00" = รอการชำระ`.

## Change
- Resolve both labels from `StatusPaid` (`CODE_STR` → `CODE_NAME`), via `ConstantSPF.GroupCode.STATUS_PAID` and the
  active + `DISPLAY_TYPE` SPF + `SEQUENCE` lookup (TASK-039 §D).
- Keep `IsPaid(paidStatus)` and the existing `StatusPaid.PAID` comparison logic as-is — only the **display strings** move
  to the DB.
- Keep a safe fallback if a code isn't found (don't render blank).

## ⚠ This changes visible wording in TWO places at once — that is correct
These constants drive **both** the table column `paid_status_name` **and** chart-1's category labels (TASK-037 unified
them deliberately: one concept, one word per page). So the capture will show both change together:
`ชำระแล้ว → ชำระเงินแล้ว` and `รอชำระ → รอการชำระ`. Call it out at capture so it reads as intended, not as a regression.

## Must NOT change
`IsPaid` semantics / which rows count as paid, the chart-1 category **order** or ids, the config-driven FORM_ID list
(REQ-018), the other 4 charts, the 8-col table structure, other dashboards.

## Definition of Done
- [x] `PAID_LABEL`/`UNPAID_LABEL` constants gone; both labels read from `StatusPaid` with a safe fallback.
- [x] Table column and chart-1 category labels both show the DB wording (and still agree with each other).
- [x] `dotnet build` succeeds. Paste the diff + build result.

## Implementation Notes
(Jason — 2026-07-24)

### Labels now come from the DB
- Deleted the `PAID_LABEL` / `UNPAID_LABEL` constants.
- New `CommonCodeStrMap(groupCode)` — the **CODE_STR**-keyed sibling of TASK-039's `CommonCodeIntMap` (this group keys on
  `"11"`/`"00"`, not `CODE_INT`) — using the same `GetDataActiveByGroupCodeAndDisplayType(group, SystemType.SPF)`
  semantics (active + officer DISPLAY_TYPE + SEQUENCE).
- New `PaidStatusLabels()` → `(Paid, Unpaid)` resolved from `GroupCode.STATUS_PAID` keyed by the existing
  `StatusPaid.PAID` ("11") / `StatusPaid.WAIT` ("00") constants.

### Both consumers share ONE resolved pair
`ChartData` and `TableData` each `await PaidStatusLabels()` once and pass it down — `BuildMixBar(rows, paidLabels)` for
the chart-1 category labels, and the row map for `paid_status_name`. Since both read the same tuple, the table column
and the chart categories **cannot** drift apart (which is what TASK-037 unified in the first place).

### Fallback choice — `NOT_SPECIFIED`, not the old strings
The task says keep a safe fallback but the DoD says the old constants must be gone. I used the service's existing
`NOT_SPECIFIED` ("ไม่ระบุ") rather than re-introducing "ชำระแล้ว"/"รอชำระ" as fallback literals: keeping the old wording in
code would (a) contradict "constants gone", (b) put the DB back in second place, and (c) silently mask a missing/inactive
`StatusPaid` row instead of making it visible. Same fallback pattern as TASK-039's buyer group. Nothing renders blank.

### Untouched
`IsPaid(paidStatus) == StatusPaid.PAID` semantics (which rows count as paid) — verbatim; chart-1 category **order** and
the `slots`/`_bookTypeFormIds` config-driven generation (REQ-018); the other 4 charts (still 4 `DashboardChartData`); the
8-col table structure (20 `JsonProperty` unchanged); other dashboards.

### One comment corrected (in scope — it documented what I changed)
The class doc-comment asserted `PAID_STATUS "11"=ชำระแล้ว/"00"=รอชำระ`, i.e. the very wording this task moves to the DB.
Left as-is it would be a stale contradiction of the new behaviour, so I made it neutral and noted that display labels now
resolve from `StatusPaid`. The other 4 Thai matches in the file are ordinary comments ("เฉพาะที่ชำระแล้ว" etc.), not emitted strings.

### Verification
- `dotnet build` (Center+SPF) → **Build succeeded, 0 Error(s)**.
- `PAID_LABEL|UNPAID_LABEL` → **0** occurrences; no Thai payment wording is emitted anywhere (remaining matches are
  comments only, verified line by line).
- `paidLabels` feeds exactly the 2 display sites (chart category L207, table column L143) from the same resolved tuple.
- **⚠ Expected visible change at capture (this is correct, not a regression):** `ชำระแล้ว → ชำระเงินแล้ว` and
  `รอชำระ → รอการชำระ`, **in both places at once** (table column + chart-1 categories). Call it out so the reviewer
  reads it as intended.
- Exact strings are DB content → confirmed at capture (brownfield rule: no DB access here).

## Questions
(Jason asks; Sober answers as `> answer: ...`)
