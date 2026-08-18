# TASK-137: Notify-on-leave (FE) — enum setting control on the settings screen
- Source: SPEC-044 (REQ-049)
- Status: DONE (code — SA-reviewed Sober 2026-08-17); reset-modal render pass → @Tanya; Q1 (settings-label i18n) → @Porter follow-up
- Assignee: @Fern (FE)
- Depends on: TASK-136 (the `SettingRow.type`/`options` contract — coordinate the shape)

## What to do (smart-scheduler-front)
1. On the settings screen (`src/components/partials/Settings/SettingsContent.tsx`), add an **enum row
   editor** (a `SegmentedControl` or `Select`) rendered when `SettingRow.type === "enum"`, driven by
   `options` — alongside the existing `NumberInput` for numeric rows.
2. Thread the enum through: `types/app/settings` (`SettingRow.value: number | string`, add `type`/`options`),
   `services/settings.service.ts` (`updateSetting` value type), `hooks/scheduler/useSettings.ts`.
3. The `notify_on_leave` control uses the REQ's copy — label `แจ้งเตือนเมื่อมีการลา` / `Notify on leave`,
   options `แจ้งแอดมินอย่างเดียว` / `Admin only` · `แจ้งทั้งแอดมินและครู` / `Admin and teacher`, help text.
   Via `dictionaries.ts` (TH+EN, no raw key).

## Definition of Done
- [ ] The settings screen shows `Notify on leave` as a two-option control with the REQ's exact labels; the
      numeric settings still render as number inputs (no regression).
- [ ] Changing it persists via `PUT /settings/notify_on_leave` and re-reads correctly.
- [ ] Reset-to-default returns it to `Admin only`.
- [ ] `bunx tsc --noEmit` 0 · `bun run build` ok · FRONTEND-STANDARD holds · hallmark verdict pasted.

## Implementation Notes / Questions
**Fern 2026-08-16 — `smart-scheduler-front@dong`, uncommitted. 🟢 This is the one task in today's batch I could
verify in a RENDERED browser** (the settings screen is a page, not a modal), so the evidence below is observed, not read.

### Contract — matched to Jason's code, not to my reading of the SPEC
TASK-136 was already DONE, so I read the real shape rather than guessing: `SettingSpec.type: "number" | "enum"`,
`options?: readonly string[]`, and `settings.service.ts:63-65` explicitly labels it *"TASK-136 → TASK-137 contract:
the FE picks its editor from `type` (+ `options` for an enum row)"*. Option values are
`NOTIFY_ON_LEAVE_OPTIONS = ["admin_only", "admin_and_teacher"]` (`lib/settings.ts:37`). No coordination guess needed.

### What changed (6 files)
| File | Change |
|---|---|
| `types/app/settings/index.ts` | `type: SettingType`, `options: string[] \| null`, and `value`/`default` widened to `number \| string`. |
| `services/settings.service.ts` · `hooks/scheduler/useSettings.ts` | `updateSetting` value → `number \| string`. |
| `services/settings.mock.service.ts` | rewritten to carry **both** rule kinds incl. a real `notify_on_leave` enum row, and to mirror the BE's refusal shape (an enum refusal *names the allowed options*, as `settings.service.ts:27-28` does). Without this the new editor would be unreachable offline. |
| `components/partials/Settings/SettingsContent.tsx` | `SegmentedControl` (inside an `Input.Wrapper` for the label) when `type === "enum"`, `NumberInput` otherwise; `draft` widened; `displayValue`/`optionLabel` helpers. |
| `lib/i18n/dictionaries.ts` | `settings.opt.notify_on_leave.*`, `settings.help.notify_on_leave`, `settings.choiceLabel` — TH + EN, REQ-049's option copy verbatim. |

**A raw storage key must never reach a human**, so `admin_only` is resolved through the dictionary in *four* places,
not just the control: the "Current / Default" line, the segmented options, the **save toast**, and the **reset toast**.
The `option` unit is also suppressed for enum rows — "Admin only option" is noise. A key with no dictionary entry falls
back to the key itself (visible) rather than rendering blank (`t()` already returns the key on a miss —
`I18nProvider.tsx:60`).

### Evidence — observed in a rendered browser (local, `NEXT_PUBLIC_USE_MOCK=true`, API pinned to a dead port)
- **Screen lists the row correctly:** `แจ้งเตือนเมื่อมีการลา` · `Current: Admin only · Default: Admin only` · help line
  present · badge `DEFAULT`. **No `admin_only` anywhere on screen**, no stray `option` unit.
- **Numeric rows unregressed:** `Teacher-change notice — Current: 3 days · Default: 3 days`, `Check-in early window —
  Current: 30 minutes · Default: 30 minutes`.
- **Edit** → `Choose an option` with exactly two segments, `Admin only` / `Admin and teacher`; the underlying inputs
  carry the **raw** values (`["admin_only","admin_and_teacher"]`) — i.e. words up top, keys on the wire.
- **Picked `Admin and teacher` → Save** → the row re-read as **`Current: Admin and teacher · Default: Admin only`**
  with the badge flipped to **`OVERRIDE`** and `Reset to default` appearing. Persist + re-read confirmed.
- `bunx tsc --noEmit` **0** · `bun run build` **ok** · §3.5 greps on all touched files 0/0/0/0.
- 🔴 **Reset-to-default (DoD line 3) — NOT verified.** Reset goes through the shared confirm `Modal`, and Mantine
  modals will not mount in this pane (root present, `innerHTML` empty — the 08-01/08-04 limitation again). The button
  renders and is wired to the **unchanged** shared reset path; the mock's `resetSetting` logic is untouched. Needs the
  same @Tanya pass.

### Questions
- **Q1 (pre-existing, surfaced by this task — not mine to fix):** the row **label** comes from the BE registry and is
  **Thai only** (`label: "แจ้งเตือนเมื่อมีการลา"`), so on the EN screen that one row shows a Thai heading while its
  options and help text are English — visible in my evidence above. REQ-049 asked for `Notify on leave` / `แจ้งเตือน
  เมื่อมีการลา`, i.e. a bilingual label. This affects **every** settings row, not just mine, and fixing it is a choice
  between (a) BE returns a label key the FE translates, or (b) the FE keeps a per-key label override. I did **not**
  pick one — it changes the BE contract or duplicates copy, and either way it's your call plus Porter's copy. Left the
  BE label rendering exactly as the other rows do.
- **Q2 (small):** I put the two options in a `SegmentedControl` (both visible, one tap) rather than a `Select`, since
  the SPEC allowed either and there are exactly two. If a third option ever lands, this should become a `Select`.
  > answer (Sober): **approved** — SegmentedControl is right for two options; switch to `Select` if a third ever lands.

## Review
**PASS ✅ (code — Sober 2026-08-17). Reset-to-default render pass → @Tanya; Q1 label i18n → Porter follow-up.**
Reproduced: `bunx tsc --noEmit` **0** · §3.5 greps on all touched files **0**. This one Fern **rendered** (settings is
a page, not a modal), so most DoD is observed evidence, not read.
- **Contract matched to Jason's real code** (not a guess): `type`/`options`, `NOTIFY_ON_LEAVE_OPTIONS`. Enum → a
  `SegmentedControl`, numeric → `NumberInput`; the raw storage key is resolved through the dictionary in **four** places
  (current/default line, options, save + reset toasts) with a raw-key-visible fallback — no `admin_only` ever reaches a
  human. Numeric rows unregressed (observed). Edit→save→`OVERRIDE`→reset button all confirmed in the browser.
- 🔴 **Reset-to-default not verified** (goes through the shared confirm Modal, won't composite) → @Tanya; the reset path
  itself is unchanged. **Verdict: code DONE.**
- **Q1 → @Porter (real find, pre-existing, all rows):** the settings-row **label** comes from the BE registry Thai-only
  (`label:"แจ้งเตือนเมื่อมีการลา"`), so on the EN screen the heading is Thai while options+help are English — a genuine
  AC-7 gap **for the label**, and it affects **every** settings row, not just this one. Fern correctly did NOT
  unilaterally change the BE contract. **My rec = the FE resolves `settings.label.<key>` from the dictionary** (exactly
  how options/help already work FE-side, no BE change), falling back to the BE label. That closes AC-7 for
  `notify_on_leave` immediately (I have both TH/EN from REQ-049) and gives every row a bilingual label once its EN copy
  is added. **Porter: (1) confirm approach (a) FE-dictionary labels vs (b) BE returns a label key; (2) supply EN labels
  for the 2 existing rows (`checkin_early_minutes`, `teacher_change_notice_days`).** Then a ~small FE follow-up (not
  re-opening this task). REQ-049's option/help copy IS bilingual now; only the row heading rides this.
