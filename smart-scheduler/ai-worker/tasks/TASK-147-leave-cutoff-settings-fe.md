# TASK-147: Leave cut-off settings — dictionary keys (FE)
- Source: SPEC-048 (REQ-047)
- Status: BLOCKED (waiting: @Sober — the help line does not render on a `type:"number"` row; see Questions Q1)
- Assignee: @Fern (FE)
- Depends on: TASK-146 (the two new setting keys)

## What to do (smart-scheduler-front)
The settings screen already renders every `type:"number"` rule as a NumberInput card — the two new leave-
cut-off rows appear automatically. Only copy is needed: add `dictionaries.ts` entries (TH+EN) for the two
new settings — help text per the REQ:
- label — TH `แจ้งลาล่วงหน้าอย่างน้อย (ชั่วโมง)` · EN `Minimum leave notice (hours)`
- help — TH `ผู้ปกครองแจ้งลาเองได้จนถึง {n} ชั่วโมงก่อนคาบเริ่ม หลังจากนั้นต้องให้แอดมินทำให้` · EN `Parents can take leave themselves until {n} hours before the session; after that only an admin can.`
(differentiate the two rows as ครูประจำ / ฟรีแลนซ์ · full-time / freelance).

⚠️ The settings-row **label** is BE-supplied Thai-only today (the pending settings-label-i18n follow-up from
TASK-137 Q1). So the bilingual *label* rides that follow-up; the **help** text (`settings.help.<key>`) is
FE-renderable now.

## Definition of Done
- [ ] The two leave-cut-off rows show a Thai + English help line; the number editors work (persist + reset).
- [ ] No component change; numeric-row rendering unregressed.
- [ ] `bunx tsc --noEmit` 0 · `bun run build` ok.

## Implementation Notes (Fern, 2026-08-30)

**Repo:** `smart-scheduler-front`, branch `dong` (contains `develop`/`origin/develop` @9ec5d35 + the 5 FE
commits since; `git rev-list --left-right --count dong...develop` = `5 0`, so nothing on `develop` is missing
here). Not committed — git is the human's.

### Done
1. **`src/lib/i18n/dictionaries.ts`** — added `settings.help.leave_cutoff_hours_fulltime` and
   `settings.help.leave_cutoff_hours_freelance` in **both** `en` (`:145-150`) and `th` (`:1118-1123`).
   The REQ's help sentence is kept **verbatim** and only prefixed with which teacher type the row governs —
   the two rows sit next to each other, so identical prose on both would be useless. `{n}` is left as a
   placeholder (never a hardcoded "3", AC-7).
2. **`src/services/settings.mock.service.ts`** — added the two rows to `SPECS` (`:22-41`), labels/bounds/unit
   copied from the BE registry (`smart-scheduler-back/src/lib/settings.ts:56-73`, `hours`, default 3,
   `intInRange(0,72)`). ⚠️ **Slightly beyond "dictionary keys only"** — I did it because that file's own
   contract is *"Mirrors the BE registry … so list / edit-with-validation / reset are all exercisable
   offline"*, and without the rows there is no way to exercise DoD-1 at all. One-line revert if you disagree.
3. **No change to `SettingsContent.tsx`** — DoD says no component change, so I did not make one. That is
   exactly what Q1 is about.

### Verified
- `bunx tsc --noEmit` → **exit 0**, no output.
- `bun test` → **41 pass / 0 fail** (6 files). This includes `src/lib/i18n/keys.test.ts`, the guard that
  resolves every literal `t("…")` in **both** languages — so the new keys are well-formed and neither language
  is missing one.
- `bun run build` → ok, all routes emitted incl. `○ /scheduler/settings`; postbuild standalone copy ran.

### Observation, NOT changed (out of TASK scope — flagging, not fixing)
`unit` is rendered raw (`SettingsContent.tsx:132-137`, `valueLabel`), so the new rows read
`ค่าปัจจุบัน: 3 hours` / `New value (hours)` — English unit inside the Thai screen. This is **pre-existing**
(`days`/`minutes` already do it), so it is not a regression from this TASK, but `hours` is a new unit
arriving on that screen. Yours to decide whether it joins the settings-label-i18n follow-up.

## Questions

**Q1 (BLOCKING) — the two Definition-of-Done lines contradict each other; the help line cannot render today.**

DoD-1 wants *"the two leave-cut-off rows show a Thai + English help line"*; DoD-2 says *"no component change"*.
Both cannot hold, because the settings screen renders help **only for enum rows** and passes **no variables**:

```tsx
// SettingsContent.tsx:142-146 — as it stands on `dong`
{row.type === "enum" && t(`settings.help.${row.key}`) !== `settings.help.${row.key}` && (
  <Text size="xs" c="dimmed" mt={4}>
    {t(`settings.help.${row.key}`)}
  </Text>
)}
```

Two separate gaps, both in that one expression:
- **(a)** `row.type === "enum"` — the two leave cut-off rows are `type:"number"`, so their help is **never
  rendered**, no matter what the dictionary contains. The SPEC's *"the help text can be a FE
  `settings.help.<key>` now"* is true of the dictionary but not of the screen.
- **(b)** no vars are passed to `t()`, so the REQ's `{n}` would render **literally as `{n}`** to staff — the
  exact "raw placeholder on screen" defect class `keys.test.ts` was written for.

**The minimal change I would make, if you authorise it** (2 edited lines, no new component, no restructure —
the existing `!== key` guard already stops any row without a dictionary entry from gaining a line, so no other
row's appearance changes; `notify_on_leave` keeps its help exactly as today):

```tsx
{t(`settings.help.${row.key}`) !== `settings.help.${row.key}` && (
  <Text size="xs" c="dimmed" mt={4}>
    {t(`settings.help.${row.key}`, { n: String(row.value) })}
  </Text>
)}
```

`{ n: row.value }` uses the row's **effective** value (override if set, else the coded default), so the help
sentence tracks what staff just saved — which is what makes AC-4/AC-7 legible on the screen rather than only
in the refusal message. **I am not making this change unilaterally** — dropping the `enum` gate widens help
rendering to every future number row, and interpolating `{n}` is a rendering decision, both yours.

**What I need from you:** either (i) authorise the two lines above under this TASK, or (ii) say it belongs in
its own TASK, in which case TASK-147's DoD-1 cannot be met here and the DoD should be reworded to "the two
dictionary entries exist in TH+EN" so this TASK can close honestly.

⚠️ Not a DATA REQUEST — nothing here needs the owner or a real environment; it is a spec/code mismatch.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-147 | scheduler-front (FE): dict keys (label/help TH+EN) for the 2 leave-cut-off settings rows | SPEC-048 (REQ-047) | **TODO** (dep TASK-146) | Fern | TASK-146 |
```
