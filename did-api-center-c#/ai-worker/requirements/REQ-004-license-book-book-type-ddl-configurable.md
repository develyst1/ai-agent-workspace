# REQ-004: DASHBOARD_LICENSE_BOOK — make book-type dropdown configurable in appsettings (DB labels)

- Status: READY_FOR_SA (resumed 2026-07-17 — stakeholder said "ลงมือทำเลย"; the earlier ON HOLD is lifted)
- Priority: MEDIUM
- Requested: 2026-07-17 by stakeholder (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal

Same treatment as REQ-002, on the **License Book** dashboard. Its "ประเภทหนังสือ" filter dropdown
(`book_type_ddl`) is currently **hardcoded** in code — a static array `BOOK_TYPES` of
`(FormId, Label)` = `(8,"อ.8") (10,"อ.10") (16,"อ.16") (17,"อ.17")` in
`Services/DashboardLicenseBookService.cs` (~line 34, built into the dropdown in `SearchFilter()`).

Goal: drive which book types appear from **`appsettings.json`** (codes only), with the **label
sourced from the DATABASE** — exactly the REQ-002 pattern. Stakeholder confirmed both the config
approach and DB-sourced labels for this dashboard.

## Requirement

1. The options of the book-type dropdown (`book_type_ddl`) MUST be driven by a **configurable list
   of FORM_IDs in `appsettings.json`** (codes only), instead of the hardcoded `BOOK_TYPES` array.
2. Only the configured FORM_IDs appear, **in configured order**. Initial set = **8, 10, 16, 17**
   (keep all four; stakeholder did not ask to trim — see Q1).
3. The **label comes from the DATABASE**, looked up by FORM_ID — WHERE-IN semantics (like REQ-002):
   a configured FORM_ID that exists in the DB shows with its DB name; one absent from the DB does not
   appear (no error, no log).
4. Changing the list later is a **config-only** change — no code edit.

## Acceptance Criteria

- [ ] The book-type dropdown is populated from the appsettings FORM_ID list, not the hardcoded array.
- [ ] Each configured FORM_ID that exists in the DB appears, in config order, with its **DB-sourced
      label**. A configured FORM_ID not in the DB does not appear (no error, no warning log).
- [ ] Editing the config list (add/remove/reorder FORM_IDs) changes the dropdown with no code change.
- [ ] `dotnet build` succeeds; no other behaviour changes (chart/table data, other dropdowns, other
      dashboards untouched). Dashboard data continues to be filtered by the value the user selects.

## Constraints

- Backend: `DidSpf.WebApi.Center` — `Services/DashboardLicenseBookService.cs` (`BOOK_TYPES` array
  ~line 34 → dropdown build in `SearchFilter()`), `Models/ConfigurationsModel.cs`, `Program.cs`
  (`Configure<ConfigurationsModel>` block), `appsettings.json` (+ `appsettings.Development.json`).
- Reuse the REQ-002 mechanism: add a `List<...>` config key under the existing `Configurations`
  section, inject `IOptions<ConfigurationsModel>` into the service.
- **Label source = DB.** SA to identify/confirm the DB table/view + columns that hold
  FORM_ID → book/form name. Candidate seen in the DAL: `TRLicenseFormRepo` (`T_R_LICENSE_FORM`) — SA
  to verify it maps FORM_ID → the "อ.x" name. If not discoverable from code, raise a **DATA REQUEST**
  (exact table/SQL) and @Porter; the stakeholder will provide it.
- **Value-vs-label detail for SA:** the current dropdown sets `Value = "อ.8"` (the label string), and
  the request body `bookTypes` filters on that. Moving label to DB must not silently break the filter
  contract — SA to decide whether `value` becomes the FORM_ID or stays the "อ.x" string, and keep the
  request/filter consistent. Flag if this needs a frontend change.

## Out of Scope

- No labels in config (codes/FORM_IDs only). No server-side data-filter added (dropdown options only).
- No change to other dropdowns, other dashboards, chart/table logic. Key-renaming is REQ-003.

## Questions

(SA Lead asks here; PM answers as `> answer: ...`)

- Q1 (raised by PM for stakeholder, via SA): Which FORM_IDs should the dropdown show **now**? Today the
  code shows all four (8, 10, 16, 17). REQ-002 trimmed move-license to a subset (PTG01-03) — does the
  stakeholder want to trim License Book too, or keep all four for now (config just makes it changeable
  later)? PM to confirm.
  > answer (Porter, 2026-07-17): stakeholder said "ลงมือทำเลย" without specifying a trim, so
  > **default = keep all four: `8, 10, 16, 17`, in that order** (preserves current behaviour; config
  > makes it changeable later). Initial `appsettings.json` value = these four FORM_IDs. PM will adjust
  > if the stakeholder later asks to trim — not a blocker for SA/BE.
- Q2 (raised by PM for SA): Confirm the DB label source for FORM_ID → name (candidate
  `TRLicenseFormRepo` / `T_R_LICENSE_FORM`) and the `value` decision above. Raise a DATA REQUEST if the
  form-name column isn't discoverable from code.
  > answer (Sober, SA, 2026-07-17; @Porter confirm w/ stakeholder): **No DATA REQUEST needed.**
  > `TRLicenseFormRepo.GetDataByFormId(int)` over `T_R_LICENSE_FORM` is already wired
  > (`IUnitOfWorkSPF.TRLicenseFormRepo`). The entity has two candidate label columns; the in-repo data
  > dictionary (`_docs/db-schema/DATADIC.md`) settles it:
  > - `FORM_CODE` = "รหัสแบบฟอร์ม (อ.2, อ.2-1)" → the **"อ.x" format** = matches the current hardcoded
  >   `"อ.8/อ.10/อ.16/อ.17"` display.
  > - `LICENSE_NAME` = long "ชื่อ" (100 chars).
  > **Recommend label = `FORM_CODE`** (preserves current display, DB-sourced). **Recommend value = FORM_ID**
  > (decouples the filter from display text; the filter is updated to compare FORM_ID — allowed by this
  > REQ's Constraint). **Frontend impact:** after SPEC-003+004, the `form_id` request field carries
  > FORM_IDs (`"8"`, …), not `"อ.8"`. Please confirm `FORM_CODE` is the intended label (vs `LICENSE_NAME`)
  > and that the frontend will send FORM_IDs. Non-blocking — `FORM_CODE`↔`LICENSE_NAME` is a one-word swap.
  > Design in `specs/SPEC-004-...`.
