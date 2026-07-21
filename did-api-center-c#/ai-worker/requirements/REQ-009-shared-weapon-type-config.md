# REQ-009: Unify the weapon-type (ประเภทอาวุธ) dropdown onto ONE shared config for a10 + move-license (default all 4 PTG)

- Status: READY_FOR_SA
- Priority: MEDIUM
- Requested: 2026-07-20 by stakeholder (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal

Diagnosis (2026-07-20): the ประเภทอาวุธ dropdown behaves differently per dashboard —
- **move-a10**: lists **all** weapon types from the DB (`TMProductTypeGroupRepo`) → shows PTG01–PTG04.
- **move-license**: **config-driven** (REQ-002) off its own key `Configurations:MoveLicenseWeaponTypeCodes`
  → **empty** because that key is unset in the deployed appsettings.

Stakeholder wants: **move-license shows all 4 like a10, and both dashboards use a SHARED config**
("ทั้ง 4 เหมือน a10 ใช้ config ร่วมกัน") — no separate per-dashboard weapon-type config.

## Requirement

1. **One shared appsettings config** drives the ประเภทอาวุธ dropdown for **both** `dashboard-move-a10`
   and `dashboard-move-license` (retire the move-license-only `MoveLicenseWeaponTypeCodes`; both read the
   same shared key).
2. **Default value = all 4**: `PTG01, PTG02, PTG03, PTG04` — so move-license matches a10 out of the box.
3. **Robust empty behaviour (avoid the silent-empty trap):** if the shared config list is empty/unset,
   fall back to **all weapon types from the DB** (so a missing/unset config never yields an empty dropdown).
   *(SA/stakeholder confirm — see Q.)*
4. Config-only to change the visible set later (still the REQ-002 spirit, now shared). No change to chart/
   table data or other filters. `dotnet build` succeeds; other dashboards untouched.

## Acceptance Criteria

- [ ] Both a10 + move-license ประเภทอาวุธ dropdowns are driven by the same shared config key.
- [ ] With the shared config set to the 4 PTG codes (or empty, per Q), **both dropdowns show PTG01–PTG04**.
- [ ] Editing the shared config (add/remove PTG codes) changes **both** dropdowns; no code edit.
- [ ] Labels still from DB (`TMProductTypeGroupRepo`); `dotnet build` succeeds.

## Constraints

- Backend only: `DidSpf.WebApi.Center` — `Models/ConfigurationsModel.cs`, `Program.cs`, the two dashboard
  services' weapon-dropdown builders, `appsettings.json`. Reuse REQ-002's mechanism, generalized.

## Out of Scope

- No change to other dashboards' dropdowns, chart/table logic, or the weapon cascade (หน่วยนับ/อาวุธ).

## Questions

(SA Lead asks here; PM answers as `> answer: ...`)

- Q1 (PM for SA): the **shared key name** — propose a generic `Configurations:DashboardWeaponTypeCodes`
  (retire `MoveLicenseWeaponTypeCodes`), or reuse an existing key. SA to pick + wire both services.
- Q2 (PM→stakeholder, via SA): **empty-config behaviour** — recommend "empty ⇒ show ALL from DB" (never a
  silent empty). OK? Or should empty mean "hide all"? *(Default: empty ⇒ all.)*
- Q3 (PM for SA): a10 currently lists ALL from DB (not config-filtered). Confirm a10 now reads the shared
  config too (with the empty⇒all fallback, its behaviour is unchanged when the config = all 4).

> Porter note: this supersedes the interim "just set `MoveLicenseWeaponTypeCodes` in deploy" — once REQ-009
> lands, the stakeholder sets the ONE shared key (all 4) in the deployed appsettings + restart.

---
### SA response (Sober, 2026-07-20) — SPEC-009 written, all Qs answerable

- **Q1 → shared key = `Configurations:DashboardWeaponTypeCodes`** (retire `MoveLicenseWeaponTypeCodes`).
- **Q2 → empty ⇒ ALL from DB** (confirmed; robust — a missing/unset config never yields an empty dropdown,
  which is exactly the trap that just bit us). Default appsettings value = all 4 PTG.
- **Q3 → yes, a10 now reads the shared config too** (add `IOptions<ConfigurationsModel>` to its ctor). With
  config = all 4 (or empty⇒all), a10's current behaviour is unchanged.
- Unified dropdown logic in **both** services' `SearchFilter()`: config non-empty → those codes present in DB,
  in config order; config empty/unset → all DB groups. Labels always from `TMProductTypeGroupRepo`.
- **TASK-013 (TODO)** wired: `DashboardWeaponTypeCodes` config (model + Program.cs + appsettings, default 4 PTG)
  + the shared dropdown block in both services (a10 gains the `IOptions` ctor param). Deterministic + empty⇒all
  → Sober-review accept, no live capture. @Jason: startable now.
