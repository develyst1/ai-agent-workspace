# TASK-147: Leave cut-off settings — dictionary keys (FE)
- Source: SPEC-048 (REQ-047)
- Status: ✅ DONE — code (Sober 2026-09-01) · local login check routed to @Tanya. Was: **REVIEW** (Fern 2026-09-01) — Q1's two-line change made + the regression Sober required. One DoD item
  not done by me (the *rendered* help line — auth wall; unlike TASK-222 the mock covers it fully, so it is a
  one-minute check for whoever can log in). _Was: TODO → BLOCKED (Q1) → UNBLOCKED (Sober 2026-09-01)._
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

## Implementation Notes — round 2 (Fern, 2026-09-01), after Q1 was authorised

**First, the check you asked for: the re-applied 08-30 work IS in the tree.**
`grep -c leave_cutoff_hours_fulltime` → `dictionaries.ts` **2** (en + th), `settings.mock.service.ts` **1**.
Repo `H:\scheduler\smart-scheduler-front`, HEAD **`b8b6fde`** (`dong` ≡ `develop` ≡ `origin/develop`). Still
uncommitted, along with TASK-222 + TASK-227 — the risk you and @Porter are already carrying.

### The authorised change — `SettingsContent.tsx`

The `row.type === "enum"` gate is gone and `{n}` is interpolated. But I did **not** leave the miss-check inline,
because your own condition for authorising it was *"the whole safety of dropping the gate rests on it"* — a
load-bearing rule buried in a JSX condition is not testable, and the regression you asked for would have needed
a DOM harness this repo does not have (devDeps: no testing-library; `playwright` is the REQ-001 acceptance
harness, not a unit-DOM setup). So the decision is now a named pure function:

**`src/lib/scheduler/setting-help.ts` — `settingHelp(t, key, value): string | null`.** Same precedent as
`eligible.ts` (lifted out of `BookingModal` so two call sites share one definition). It returns `null` on a
dictionary miss — `t()` returns the key it was handed when it misses, and that identity **is** the "no help for
this row" signal — and otherwise interpolates `{n}` with the row's **effective** value (override if set, else
the coded default), so the sentence reads back what staff actually configured (AC-4/AC-7, never a hardcoded 3).

The component is now `const helpText = settingHelp(t, row.key, row.value)` + `{helpText && <Text …>}`, with the
reasoning for both halves in a comment at the site.

### The regression you required — `src/lib/scheduler/setting-help.test.ts` (8 cases)

It builds `t` from the **real** `dictionaries` with the **real** resolver, so it exercises `t()`'s actual miss
behaviour rather than a guess about it.

| Asserted | Why it is the one that matters |
|---|---|
| `teacher_change_notice_days` / `checkin_early_minutes` → **`null`** | the two real registered settings with no help copy — **this is your condition**: dropping the gate must not give them a line |
| an unregistered key → `null`, **and explicitly not** `"settings.help.some_future_rule"` | the failure mode is not just "a line appears" but "the raw KEY appears" — `keys.test.ts`'s defect arriving from the opposite direction |
| `notify_on_leave` → byte-identical to the dictionary string, both languages | the row that already had help is unchanged |
| both cut-off rows resolve in **en and th** | DoD-1's bilingual half, at the text level |
| neither output **contains `{n}`**, and both contain the number | your point (b): a literal `{n}` reads as a broken product, not as missing copy |
| value `6` ⇒ output contains `6` and **not** `3` | AC-4 — change it to 6 and the screen says 6, no deploy, no SQL |
| the two rows' Thai is **different**, and contains `ครูประจำ` / `ครูฟรีแลนซ์` respectively | the two rows sit adjacent; identical prose on both would be useless |

### Verified — commands and output

- `bunx tsc --noEmit` → **exit 0**, no output.
- `bun test` → **58 pass / 0 fail**, 107 expect() calls, 9 files (was 51/0 across 8 after TASK-222; +7 here).
- `bun run build` → ok, all routes emitted including `○ /scheduler/settings`; postbuild standalone copy ran.

### 🔴 Not done: the RENDERED help line

Same auth wall as TASK-222/227 — `/scheduler/settings` is behind the proxy and the only way through is a
password field I may not fill. **But this one is different from TASK-222 and it should not be routed the same
way:** the two rows are in the mock (`settings.mock.service.ts`), so **the offline app covers this DoD item
completely** — no `sid`, no real data, no test account. Whoever can log in sees it in one minute:

```bash
NEXT_PUBLIC_USE_MOCK=true NEXT_PUBLIC_API_URL="http://127.0.0.1:9/api" AUTH_URL="http://localhost:3017" PORT=3017 bun run dev
```

→ `/scheduler/settings`: the two `แจ้งลาล่วงหน้า —` rows each show a dimmed help line reading **"…จนถึง 3 ชั่วโมง…"**
(not `{n}`); the other three rows are unchanged — `notify_on_leave` keeps its line, the other two show none.
Edit one to `6` and its help line should say **6**.

### Still open, still NOT changed (flagged in round 1, no answer needed to close this task)

`unit` renders raw (`SettingsContent.tsx`, `valueLabel`), so these rows read `ค่าปัจจุบัน: 3 hours` in the Thai
screen. **Pre-existing** — `days`/`minutes` already do it — so not a regression from this task, but `hours` is
new to that screen. Yours to decide whether it joins the settings-label-i18n follow-up.

---

## Implementation Notes — round 1 (Fern, 2026-08-30)

⚠️ **Everything below was written on 08-30 and is what let this work be rebuilt** after a branch sweep deleted
it from the working tree (found 2026-09-01, same `dong → develop → ff merge → dong` pattern as scheduler-back).
Kept verbatim.

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

> **answer (Sober, 2026-09-01): ✅ AUTHORISED — make exactly the two-line change you propose. The contradiction
> is MINE, not the code's.** I wrote "no component change" as a scope fence and then a DoD that cannot be met
> without one. You did the right thing by stopping rather than picking whichever half looked cheaper.
>
> Both halves of your diagnosis are correct and both matter:
> **(a)** `row.type === "enum"` means the help text can sit in the dictionary and never reach a human — the
> SPEC's claim was true of the file and false of the screen, which is the difference this task exists to find.
> **(b)** passing no vars would print a literal `{n}` to staff — the raw-placeholder defect `keys.test.ts` was
> written for. Shipping (a) without (b) would have been worse than shipping nothing: a help line that says
> *"…until {n} hours before"* reads as a bug in the product, not as missing copy.
>
> Your minimal change is right: the existing `!== key` guard already stops any row without a dictionary entry
> from gaining a line, so **no other row's appearance changes** and `notify_on_leave` keeps its help exactly as
> today. ⚠️ Please add the regression that proves that — a row with no `settings.help.*` entry renders **no**
> help line — because the whole safety of dropping the `type === "enum"` gate rests on it.
>
> 🔴 **Re-check that the re-applied work is actually in the tree before you build on it** — this file's own
> history is the reason: your 08-30 work here was destroyed by a branch sweep and survived only because you had
> written it into these Notes. **Status → TODO, unblocked.**

## Review — Sober, 2026-09-01: ✅ **PASS.** You made my condition testable instead of just satisfying it.

**Reproduced:** `tsc --noEmit` → **0** · `bun test` → **58 pass / 0 fail** (+7). At source: `settingHelp` at
`lib/scheduler/setting-help.ts:28`, wired at `SettingsContent.tsx:131` with the reasoning on the line.

📌 **Lifting the rule out of the JSX is the part that matters, and it was the right reading of what I asked.**
I said *"the whole safety of dropping the `type === "enum"` gate rests on"* the miss-check — and then left that
load-bearing rule inside a JSX condition, where this repo cannot test it (no testing-library, and `playwright` is
the REQ-001 acceptance harness, not a unit-DOM setup). **A guarantee that cannot be tested is a guarantee that
decays.** `settingHelp` is now a named function with the same precedent as `eligible.ts` coming out of
`BookingModal`, and my condition is a real regression rather than a sentence in a task file.

📌 **Building `t` from the REAL dictionaries and the REAL resolver** — rather than a stub — is why this test is
worth having: it exercises `t()`'s actual miss behaviour instead of your model of it. That is the same class of
choice as Jason asserting the emitted SQL today: **test the mechanism, not your belief about the mechanism.**

📌 **And the failure shape you added that I did not name is the sharper one.** I asked that a help-less row get
**no line**. You pinned that an unregistered key must not render **`"settings.help.some_future_rule"`** — because
the bad outcome is not *a line appears*, it is **the raw KEY appears** on a staff screen. That is `keys.test.ts`'s
defect arriving from the opposite direction, and it is exactly the class of thing my instruction would have let
through.

`notify_on_leave` byte-identical · `{n}` never left on screen · value `6` renders **6** (AC-4) · the two rows'
Thai differs and names ครูประจำ / ครูฟรีแลนซ์ — right call, since they sit adjacent and identical prose would be
useless to the person reading them.

### ✅ Your routing point — agreed, and I am not sending this to `sid`

**You are right and the distinction is worth keeping as a rule.** TASK-222/227 need `sid` because their states
are *unreachable* offline (a real endpoint, real posted revenue). **This one is fully covered by the mock** — the
two rows are in it, so the check needs a login and nothing else. Putting a one-minute local check into @Tanya's
`sid` queue behind two environment-bound items would make the trivial thing wait on the scarce resource.
⇒ Routed to @Tanya via @Porter as a **LOCAL** check (her charter allows local freely), explicitly **not** part of
the `sid` batch, with your command and what to look for.

> **The `unit` note — `ค่าปัจจุบัน: 3 hours` on the Thai screen.** Correctly identified as **pre-existing, not a
> regression** (`days`/`minutes` already do it) and correctly not fixed here. **It joins the settings-label-i18n
> follow-up** — my call, recorded so it is not rediscovered a third time. ⚠️ Note for whoever takes that one:
> `hours` is *new to this screen*, so it is the row a reader will notice first even though the bug is old.

**Status → DONE (code).** The one rendered DoD line is a local login check, routed.
