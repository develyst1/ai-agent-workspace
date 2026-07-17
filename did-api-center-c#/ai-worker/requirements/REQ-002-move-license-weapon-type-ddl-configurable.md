# REQ-002: DASHBOARD_LICENSE_MOVE — make weapon-type dropdown codes configurable in appsettings

- Status: DELIVERED
- Priority: MEDIUM
- Requested: 2026-07-17 by stakeholder (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal

On the DASHBOARD_LICENSE_MOVE (อ.10) page, the "ประเภทอาวุธ" filter dropdown
(`product_type_group_code_ddl`) is currently **hardcoded in code** to all four product-type-group
codes (PTG01 กระสุน / PTG02 อาวุธปืน / PTG03 วัตถุระเบิด / PTG04 อื่น ๆ) — a static array in
`Services/DashboardMoveLicenseService.cs` (lines 34-40, built into the dropdown at line 64).

Right now the business only wants to expose **PTG01, PTG02, PTG03** on this dashboard, and expects
the exposed set to change over time (add/remove codes). Editing code each time is undesirable.

Goal: drive which product-type-group codes appear in this dropdown from **`appsettings.json`**, so
the set can be changed by configuration without a code change.

Stakeholder's words (Thai, for intent):
> "อยากให้ทำเป็น config ได้ บน appsetting.json เพราะปัจจุบันเราโฟกัสแค่ PTG01, PTG02, PTG03 …
> ในอนาคตอาจจะเพิ่มได้ ไม่เอาทั้งหมด"

## Requirement

1. The options of the weapon-type dropdown (`product_type_group_code_ddl`) MUST be driven by a
   **configurable list of product-type-group codes in `appsettings.json`**, instead of the current
   hardcoded array.
2. Only the codes present in that config list appear in the dropdown, **in the configured order**.
   Initial value = `PTG01`, `PTG02`, `PTG03` (PTG04 excluded for now).
3. The config stores **codes only**. The dropdown resolves each configured code against the
   **DATABASE** — semantically `WHERE product_type_group_code IN (<configured codes>)`:
   - a configured code that **exists in the DB** is shown, using the **DB-sourced Thai name** as its
     label;
   - a configured code that is **not in the DB** (e.g. a bogus/typo code) simply **does not appear**
     — no error, no log.
   Labels are **NOT** taken from the current hardcoded in-code map; that map is replaced by the DB
   lookup. Config never carries labels.
   **(Revised 2026-07-17 per stakeholder — supersedes the earlier "label from in-code map" note.)**
4. Changing the list later (add/remove a code) is a **config-only** change — no code edit — beyond
   the normal app restart/reload that appsettings changes require. Whether a configured code shows up
   is ultimately governed by whether it exists in the DB.

## Acceptance Criteria

- [x] The weapon-type dropdown is populated from the appsettings config list, not the hardcoded array.
- [x] With the config set to `PTG01, PTG02, PTG03`, the dropdown returns those three codes (that
      exist in the DB), each with its **Thai name sourced from the DB**. PTG04 (อื่น ๆ) does not appear.
- [x] A configured code that does not exist in the DB does not appear in the dropdown (WHERE-IN
      semantics) — no error, no warning log.
- [x] Editing the config list (e.g. re-adding PTG04, or reordering) changes the dropdown output
      accordingly, with no code change.
- [x] No other behaviour changes: chart/table data, filtering, other dropdowns, and other dashboards
      are untouched. (Dashboard data continues to be filtered by the value the user picks from this
      dropdown — see Out of Scope.)

## Acceptance (Porter, 2026-07-17)

**DELIVERED.** PM independently verified the changed code + a clean build:
- `Services/DashboardMoveLicenseService.cs`: `WEAPON_TYPES` array removed (grep = 0); dropdown now
  built from `_weaponTypeCodes` (config) with labels from `TMProductTypeGroupRepo.GetDataAll()` →
  `nameByCode`, `.Where(ContainsKey)` (WHERE-IN), `Value=code / Label=DB name`, config order.
- `appsettings.json`: `Configurations:MoveLicenseWeaponTypeCodes = ["PTG01","PTG02","PTG03"]`.
- `Models/ConfigurationsModel.cs`: `List<string> MoveLicenseWeaponTypeCodes` present.
- `dotnet build` (PM ran it): **Build succeeded, 0 Error(s)** (179 warnings, all pre-existing/unrelated).
- Live-response spot-check (literal Thai text from live Oracle rows) deferred per brownfield rule —
  accepted; the config-drives-codes/DB-drives-label/unknown-skipped behaviour is conclusive from code.
  Optional: stakeholder may hit `/dashboard-move-license/search-filter` for a visual confirmation.
- **Frontend note:** the weapon-type dropdown now shows only PTG01/02/03 with DB-sourced Thai names;
  no frontend change needed (same `product_type_group_code_ddl` shape, fewer items).

## Constraints

- Backend: `DidSpf.WebApi.Center`. Current source of the list:
  `Services/DashboardMoveLicenseService.cs` — `WEAPON_TYPES` static array (lines 34-40) → dropdown
  build (line 64). Config file(s): `appsettings.json` (+ `appsettings.Development.json`).
- Config holds **codes only**. **Label source = the DATABASE** (Thai name looked up by the code),
  NOT the hardcoded in-code map. SA to identify/confirm the exact DB table/view + columns that hold
  `product_type_group_code` → Thai name; this likely needs a **DATA REQUEST** to the stakeholder
  (see PROTOCOL brownfield rule — the stakeholder offered to provide any DB table, REQ-001).
- Dropdown order: prefer config order; if the DB lookup naturally orders differently, SA to decide
  (config order is the intent).

## Out of Scope

- **No data-level filtering change.** The config controls only which options the dropdown offers;
  it does NOT add a server-side filter that removes non-listed categories from chart/table results.
  (Stakeholder: the dashboard data is already filtered by whatever the user selects in this dropdown,
  so limiting the options is sufficient.)
- No change to other dropdowns, the cascade endpoints, other dashboards, or REQ-001's key naming.
- Not moving the label text into config (codes only, per stakeholder).

## Questions

(SA Lead asks here; PM answers as `> answer: ...`)

- Q1 (raised by PM for SA): If a code is added to the config list that has **no label** in the
  existing in-code map (e.g. a future `PTG05` before its label is added in code), what should happen
  — skip it, show it with the code as its own label, or treat it as a config error? PM will confirm
  the rule with the stakeholder once SA proposes one. (For the initial PTG01-03 set this does not
  arise — all three already have labels.)
  > answer (Sober, SA — proposed rule, 2026-07-17; @Porter please confirm with stakeholder):
  > **Recommend: skip the code** (don't emit the dropdown option). A filter option showing a raw code
  > with no Thai label is confusing to officers, and a missing label almost always means a config typo
  > or a new code whose label isn't in code yet — better hidden than shown broken. This never triggers
  > for the initial PTG01–03 set (all three have labels). Documented alternative if the stakeholder
  > prefers visibility: show the code as its own label (`value == label == code`).
  > Secondary: do they want a **warning log** when a configured code is skipped? That needs an
  > `ILogger` injected into the service (small add). SA default: no log — keep it minimal. Full design
  > in `specs/SPEC-002-...`. Note: this is a small, isolated behaviour — whichever way the stakeholder
  > picks is a one-line change, so it does not block implementing the rest of TASK-002.
  >
  > answer (Porter, from stakeholder 2026-07-17): **The question is superseded by a design change.**
  > The stakeholder clarified the label should NOT come from the in-code map at all — it should come
  > from the **DATABASE**. Their words:
  > > "จริง ๆ มันควรจะมาจาก database นะเรื่องนี้ … ใส่รหัสไปเพื่อไปหาว่าถ้ามีใน database ก็ให้เอามาขึ้น
  > > ถ้าใส่รหัสมั่วจริง ๆ ก็ไม่มีใน database ก็ไม่ขึ้น ก็เหมือน query where in (code1,code2,code3) นั่นแหละ"
  > So: config = codes → look up in DB → present codes found in DB (with DB Thai name); codes not in DB
  > are naturally absent. This makes the "unknown code" case self-handling (not in DB ⇒ not shown), so
  > the skip-vs-show-code question is moot. **Warning log: NO** (stakeholder confirmed).
  > @Sober — this changes the SPEC-002 label source (in-code map → DB lookup). Please **revise
  > SPEC-002** accordingly, and if you need the exact DB table/view + columns for
  > `product_type_group_code` → Thai name, raise a **DATA REQUEST** and @Porter; the stakeholder will
  > provide it. Requirement #3, Constraints, and Acceptance Criteria in this REQ are updated to match.
