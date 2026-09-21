# TASK-417 — REQ-099 extension, FE: optional year fields on the `Birthday` range (blank = any year)

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-20) · **Size XS.** Against TASK-416 §1 (final unless Jason says otherwise). Wire after his report. `sid`.

## §0 The contract
`?birthMonthFrom&birthMonthTo` + optional `&birthYearFrom&birthYearTo` (both or neither; a year only beside its month; a dated range cannot wrap and must be `from <= to` — the server refuses with `400`); `noDob` exclusive as before. Rows/order from the server.

## §1
- The `Birthday` popover's From/To each gain an optional `Year` box (4 digits, blank = any year); `birthdayQuery` carries both years only when BOTH are filled (one filled ⇒ the query is not active — a half-dated range is not a query; pinned); the popover shows the server's `400` sentence if it ever refuses. The month-only behaviour is byte-unchanged.
- The result list and the families-back-on-clear behaviour unchanged. Copy for the two boxes, both languages.

## Definition of Done
- [ ] Suite, **count** · tsc · build ok · `birthdayQuery` by value (years both/neither) · 🔑 Break-and-watch, `finally`, CHECKSUM · report here + `inbox/SA.md` + log.


---

## §2 ✅ IMPLEMENTED — Fern, 2026-09-20. **Optional `Year` boxes on the Birthday From/To — both or neither; blank = any year; the month-only path byte-unchanged.**

```
bunx tsc --noEmit → exit 0
bun test          →  494 pass / 0 fail   (was 491; +3 in lib/people/birthday-filter.test.ts §3)
bun run build     → ok
git status        →  4 source modified (lib/people/birthday-filter.ts · People/BirthdayFilter.tsx · PeopleContent.tsx · dictionaries) · 0 new
```
Built to §0 = @Jason's line in TASK-416 (2565/0). No key. 🚫 No deploy asked.

- **Pure:** `BirthdayState` + `yearFrom?` / `yearTo?` (optional — an older state has no year keys and builds the
  same query as before, asserted); `isYear` (a 4-digit integer, else blank — mutation 4); `yearsSet` ⇒ `none | both |
  half`; `birthdayActive` is FALSE on a half-dated range (one year filled is not a query — mutation 2); `birthdayQuery`
  adds `birthYearFrom/To` only on `both` (mutation 1 — pinned by source: by value the guard masks it, an equivalent
  mutant), never under the switch (mutation 3). 🚫 **No `from ≤ to` / no-wrap rule here** (mutation 5 — a client rule —
  fails): a backwards pair is sent and the server's TH `400` sentence is shown.
- **The popover:** a `Year` box under each month (`NumberInput`, 1900–2100, no decimals, placeholder `any` / `ทุกปี`),
  greyed under the switch with the two selects (mutation 6 — the source pin now counts three `disabled={value.noDob}`);
  the server's sentence rides in as `error` from the list query and shows under the boxes (mutation 7); the button
  reads `Sept 2018 → Feb 2019` (rendered; mutation 8) and a half-dated state renders as unset (`data-birthday="off"`).
- Copy `people` +2 (`birthdayYear`, `birthdayAnyYear`), both languages.

### 🔑 Break-and-watch — eight, each in `try/finally`, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | one year rides alone | **1 fail** (📌 equivalent by value — the active guard masks the builder; pinned by source, stated) |
| 2 | a half-dated range counts as active | **2 fail** |
| 3 | years ride under the switch | **1 fail** |
| 4 | a 2-digit year counts | **1 fail** |
| 5 | a client `from ≤ to` rule | **1 fail** |
| 6 | the year box stays live under the switch | **1 fail** |
| 7 | the server's sentence is dropped | **1 fail** |
| 8 | the button hides the years | **1 fail** |
`md5` identical on the three mutated files. Pins moved in the same test: the `<BirthdayFilter …` line (+ `error=`), the `disabled` count 2 → 3.

### Definition of Done
- [x] **494 / 0** · `tsc` 0 · build ok
- [x] `birthdayQuery` by value — years both / neither / half; the month-only query byte-identical
- [x] 🔑 Break-and-watch — eight, `finally`, checksum

### ⚠️ Not seen on a screen
The two small year boxes under the month selects at 280 px. For @Tanya on `sid`: From Sep 2018, To Feb 2019 ⇒ the
button reads `Sept 2018 → Feb 2019`, the list is only those born in that dated span in date order; clear one year ⇒
the button reads `Birthday` and the families are back (a half-dated range is not a query); From Sep 2019, To Feb 2018
⇒ the server's Thai sentence under the boxes, no list; blank both years ⇒ the month-only list exactly as yesterday.
