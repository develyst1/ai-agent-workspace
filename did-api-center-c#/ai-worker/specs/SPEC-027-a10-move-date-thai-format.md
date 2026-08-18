# SPEC-027: a10 `move_date` → Thai BE `dd/MM/yyyy`, same as every other date in the suite

- Source: REQ-026 (HIGH)
- Status: ACTIVE

## Verified in code — REQ-026 is accurate on every point
`DashboardMoveA10Service.cs:334`
```csharp
MoveDate = r.MoveDate?.ToString("yyyy-MM-dd") ?? string.Empty,   // ❌
```
sits **22 lines below** L312/L313 in the same object initialiser, which use `r.IssueDate.ToStringTH(FormatStr.DATEONLY)`.
Same method, same row, two conventions ⇒ a slip, exactly as REQ-026 concluded. `DashboardMoveA10Model.cs:264`
`MoveDate` is already `string`, so **no model or JSON-key change** — only the value being produced.

## The null-handling question Porter asked me to confirm, not assume — ANSWERED
`DidSpf.Helper/Extensions/CommonExtensions.cs` has **two** overloads:
```csharp
L44  public static string ToStringTH(this DateTime? raw, string format = "dd/MM/yyyy")
L46      { if (raw == null) return ""; … }        // ← nullable overload short-circuits
L50  public static string ToStringTH(this DateTime  raw, string format = "dd/MM/yyyy")
```
`r.MoveDate` is `DateTime?` ⇒ it binds to the **L44 nullable overload**, which returns `""` for null.

⇒ **A null move date already renders `""`. The `?? string.Empty` is dead once we switch, and must be REMOVED** — not
kept "for safety". Keeping it is not harmless: `ToStringTH` returns a non-nullable `string`, so `?? string.Empty` on
its result is an operand-never-null warning and, worse, it implies to the next reader that the helper can return null.
This matters here because a10 is license-first with left-joined actuals, so **rows with no move genuinely occur** —
this is a live branch, not a defensive one.

## Format + era — proven empirically, not inferred from culture config
`FormatStr.DATEONLY = "dd/MM/yyyy"` (`Center/Utils/TextConstant.cs:336`) and `AppCultures.ThCulture = new
CultureInfo("th-TH")` (`DidSpf.Helper/AppCultures.cs:12`). Rather than reason about whether `th-TH` carries the
Buddhist calendar, use the stakeholder's own live capture: `issue_date` goes through **this exact helper + format** and
came back **`"24/03/2569"`** — BE era, `dd/MM/yyyy`. The helper demonstrably produces what we want; `move_date` will
match it by construction.

## Sweep — re-run independently, REQ-026's count is correct
I did not take the sweep on trust. Over `Center/Services/` + `Center/Models/`:
- `\.ToString\("(yyyy|dd|MM|HH)` → **exactly 1 hit**, `DashboardMoveA10Service.cs:334`. No second occurrence.
- `ToStringTH` in the 6 dashboard services → **17 calls** (ImportA8 4 · Import 2 · LicenseBook 3 · A10 2 ·
  MoveLicense 2 · Tracking 4) = 17 correct + 1 wrong = 18 sites. Reconciles with REQ-026 exactly.
- `ToStringEN` → **0 in any dashboard file** (42 elsewhere in Center, all non-dashboard and out of scope).

## Change — one line
```csharp
MoveDate = r.MoveDate.ToStringTH(FormatStr.DATEONLY),
```
(drop `?`, drop `?? string.Empty`.)

## Must NOT change
- **The request side.** `MoveDateRange` / `MoveDateStart` / `MoveDateEnd` (`DashboardMoveA10Model.cs` L20/L64/L68) are
  separate `string` members feeding the SQL predicate and **stay ISO**. REQ-026 is explicit and the stakeholder's own
  working curl posts ISO. Do not "make the input Thai too".
- `issue_date` / `expiry_date` on the same row · the other 5 dashboards · `authority_group_no` (REQ-026 flags it as an
  unrelated observation for capture — it is correct-as-designed per REQ-021; do **not** fold it in).

## Acceptance
- [ ] `/officer/dashboard-move-a10/table` → `move_date` = `dd/MM/yyyy` **BE**; `2026-06-22` renders `22/06/2569`.
- [ ] A row with no move date returns `""` — not `"01/01/2443"`, not `null`.
- [ ] `issue_date`/`expiry_date` byte-identical to before; `move_date_range` ISO input still filters.
- [ ] `grep -rE '\.ToString\("(yyyy|dd|MM' Services/ Models/` → **0 hits**; build 0 errors.

## Tasks
- **TASK-046** — the one-line fix.

## Questions
(Jason asks here; Sober answers as `> answer: ...`)
