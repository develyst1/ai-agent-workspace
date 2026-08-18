# TASK-046: a10 `move_date` → `ToStringTH(FormatStr.DATEONLY)` (one line)

- Source: SPEC-027 (REQ-026, HIGH)
- Status: **DONE ✅** (Sober-verified 2026-08-17 — build 0 errors with the warning count **unchanged at 13**, which is
  the positive proof no `??` survived: a `??` on the helper's non-nullable `string` return would have added a 14th.
  L312/313/334 identical; 0 hand-rolled date formats left in Center; request side ISO intact)
- Assignee: Jason (BE)
- Depends on: TASK-045 (build must be green first — it is, verified 2026-08-10)

## The change — `DashboardMoveA10Service.cs:334`
```csharp
- MoveDate = r.MoveDate?.ToString("yyyy-MM-dd") ?? string.Empty,
+ MoveDate = r.MoveDate.ToStringTH(FormatStr.DATEONLY),
```
That is the whole task. It makes L334 identical in treatment to L312/L313 twenty lines above it.

## Drop the `?? string.Empty` — deliberately, and here is why
Do **not** keep it "to be safe". `r.MoveDate` is `DateTime?`, so it binds to the **nullable** `ToStringTH` overload
(`DidSpf.Helper/Extensions/CommonExtensions.cs:44`), whose first line is `if (raw == null) return "";`. Null already
renders `""`. Since the helper returns a non-nullable `string`, a trailing `??` is an operand-never-null warning and
tells the next reader the helper might return null — which it cannot.

This is a **live** branch, not a defensive one: a10 is license-first with left-joined actuals, so licenses with no
movement yet really do produce `MoveDate == null`. Please eyeball one such row when you verify.

## Must NOT change
- **Request side stays ISO** — `MoveDateRange` / `MoveDateStart` / `MoveDateEnd` (`DashboardMoveA10Model.cs`
  L20/L64/L68) feed the SQL predicate. The stakeholder's working curl posts `["2026-01-01","2026-08-01"]`. Response
  only.
- `issue_date` / `expiry_date` on the same row · the other 5 dashboards · `authority_group_no` (mentioned in REQ-026 as
  an unrelated capture observation — correct as designed, not ours to touch).

## Definition of Done
- [x] `dotnet build` → 0 errors, and **no new warning** at L334 (if you see an operand-never-null warning, the `??` is
      still there).
- [x] `grep -rE '\.ToString\("(yyyy|dd|MM' Center/Services/ Center/Models/` → **0 hits**.
- [x] Paste the changed line plus the two lines above it, so the three read the same way.
- [x] State what a null `MoveDate` renders — confirm `""`, from the code path, not from assumption.

## Implementation Notes
(Jason — 2026-08-17)

### The one-line change
```csharp
- MoveDate = r.MoveDate?.ToString("yyyy-MM-dd") ?? string.Empty,
+ MoveDate = r.MoveDate.ToStringTH(FormatStr.DATEONLY),
```
`?? string.Empty` dropped as instructed — not kept "to be safe".

### The three date lines now read identically
```csharp
L312  Date       = r.IssueDate.ToStringTH(FormatStr.DATEONLY),
L313  ExpireDate = r.ExpiryDate.ToStringTH(FormatStr.DATEONLY),
...
L334  MoveDate   = r.MoveDate.ToStringTH(FormatStr.DATEONLY),
```

### Null `MoveDate` renders `""` — traced, not assumed
`r.MoveDate` is `DateTime?`, so it binds to the **nullable** overload
`ToStringTH(this DateTime? raw, string format)` — `DidSpf.Helper/Extensions/CommonExtensions.cs:44`. I read its body:
its **first statement** is `if (raw == null) return "";`. So a null move date renders an empty string, exactly as the
old `?? string.Empty` did — the `??` was redundant, and since the helper's return type is non-nullable `string` it
would also have been an operand-never-null smell. Behaviour for null rows is therefore **unchanged**; only the
non-null formatting changes (ISO → Thai `dd/MM/yyyy` Buddhist-era via `AppCultures.ThCulture`).

### Verification
- `dotnet build` (Center+SPF) → **Build succeeded, 0 Error(s)**, and **no warning** on the a10 service (grep of the
  build output for `DashboardMoveA10` warnings: none) — i.e. no leftover `??`.
- `grep -rE '\.ToString\("(yyyy|dd|MM' Services/ Models/` → **0 hits** across the whole Center project.
- **Request side untouched** (must-not-change): `move_date_range` (L19) + `MoveDateStart` (L64) / `MoveDateEnd` (L68)
  still feed the SQL predicate as raw ISO strings — the stakeholder's curl `["2026-01-01","2026-08-01"]` keeps working.
- `issue_date`/`expiry_date` on the same row, the other 5 dashboards and `authority_group_no`: untouched.
- Static-only per brownfield rule. **For the capture:** a10 is license-first with left-joined actuals, so please eyeball
  (a) a row with a real move date → now Thai `dd/MM/yyyy`, and (b) a licence with no movement yet → `move_date: ""`.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
