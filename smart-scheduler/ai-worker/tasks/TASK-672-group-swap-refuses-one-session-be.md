# TASK-672 — 🔴 LIVE MONEY DEFECT: the GROUP swap route must REFUSE a one-session swap (`onDate`) — BE, XS · SERVER FIRST
- Source: owner ruling 2026-10-06 (relayed by Porter): "FIX IT — server first, the screen second" · found by @Fanta in TASK-624 Q3, verified by @Silver in the COMMITTED code
- Status: DONE (reviewed by Silver, 2026-10-06) · ships ALONE, server first
- Repo: `smart-scheduler-back` · Assignee: @Bob · From: @Silver (2026-10-06)
- **Ships on its own, as soon as it is reviewed:** the server is the real guard. The screen fix is TASK-673 (Fanta) and follows.
- **Claim** (every pin found by GREP, per FAILURES F-011):
  - `src/validation.ts` ✅ (Team B's);
  - ✅ `src/lib/group-swap-rate-task632.test.ts:143` **only**, **GRANTED by Porter 2026-10-06.** Condition: after the change it quotes the NEW validator line verbatim and still fails if the quote drifts (same claim, not merely passing);
  - a new test + mutation set.
  - 🚫 **`src/services/other-series.service.ts` is NOT needed** (the refusal lives in the validator). If you find you need it, STOP.

## §0 The harm, named (Porter's instruction)
- On a GROUP series, the Manage-plan swap dialog offers "this session only". That sends `{ to, onDate }` (+ the one-session `rateMinor`).
- `groupSeriesSwap` (`validation.ts:714`) has no `onDate`, so **zod strips it silently.** `swapGroupSeriesTeacher` (`other-series.service.ts:366`) then swaps **from `today()` onward.**
- ⇒ **The admin intends ONE session and the WHOLE group moves to the new coach from today**, and 🔴 **the coach is paid the one-session rate from today onward** (the `rateMinor` rides as the from-here-on rate).
- It is on live, and nobody has reported it, which means it has been silently true.

## What to do
1. **`groupSeriesSwap` refuses a body carrying `onDate`**, with one named issue at path `["onDate"]`.
   - 🔴 **Refuse ONLY `onDate`. Do NOT make the object `.strict()`:** `group-series-req104.test.ts:210` pins that a stray `from` is still silently stripped (`.data` equals `{ to }`), and that behaviour must not change.
   - **Decide and declare** the mechanism (e.g. an explicit `onDate` field that can never be valid, so it is seen before stripping).
   - The issue message: *"กลุ่มเปลี่ยนครูได้เฉพาะ 'ตั้งแต่วันที่…' เท่านั้น — ไม่มีการสอนแทนคาบเดียว"*, marked `📋 DRAFT wording`. It is a backstop the screen will no longer reach after TASK-673, and it joins the next copy set.
2. `fromDate`, `to`, `rateMinor` and the no-`fromDate` default stay exactly as they are (TASK-634's pins at `group-swap-rate-door-task634.test.ts:133-135` must stay green, untouched).
3. Once granted, re-pin `group-swap-rate-task632.test.ts:143` so it still asserts **the same claim** (the exact accepted shape), plus the new refusal.

## Definition of Done
- [ ] **By value, through the root app** (`PATCH /api/group-series/:key/teacher`, service spied):
  - `{ to, onDate }` ⇒ **400**, the issue at `onDate`, and **the service NEVER called**;
  - `{ to, onDate, rateMinor }` ⇒ 400, never called;
  - `{ to, fromDate }`, `{ to, fromDate, rateMinor }` and `{ to }` ⇒ the service called exactly as today.
- [ ] Pure validator tests: the same four, plus `{ from, to }` still `.data = { to }` (pinned unchanged).
- [ ] Mutation set (`tests` listed):
  - the `onDate` refusal removed, i.e. the defect back (bites);
  - `.strict()` instead, so `from` is refused (bites on `req104:210`);
  - `fromDate` refused (bites).
- [ ] The full suite with **no reachable database**, plus `tsc`. State Team A's work in the tree. Nothing committed.

## QA hand-off (API first)
- `PATCH /api/group-series/{key}/teacher` with `{ "to": <coach>, "onDate": <a future session date> }` ⇒ **400**, and the group's coach is unchanged on EVERY date.
- With `fromDate` ⇒ OK, as before.

## Implementation Notes
**Bob, 2026-10-06.**

**What changed (`smart-scheduler-back`, nothing committed):**

| file | change |
|---|---|
| `src/validation.ts` | `groupSeriesSwap` gains `onDate: z.never({ error: GROUP_SWAP_NO_SINGLE_SESSION }).optional()`; `GROUP_SWAP_NO_SINGLE_SESSION` is exported (the TASK's sentence, marked `📋 DRAFT wording`), with a comment naming the harm |
| `src/lib/group-swap-rate-task632.test.ts:143` | ✅ **the one granted line.** Re-pinned, see below. |
| `src/lib/group-swap-no-single-session-task672.test.ts` (new) | 12 tests |
| `src/lib/group-swap-no-single-session-task672.mutations.json` (new) | the mutation set |
| `src/services/archive-owed-task667.mutations.json` | ⚠️ **one anchor fixed in MY OWN earlier set**, see below |

`other-series.service.ts` is **not touched** (the refusal lives in the validator, as the TASK said). `api.ts` is not touched.

**Decide and declare — the mechanism:** `onDate` becomes a field that can **never be valid**, so zod SEES it before it would strip it.
- I probed zod 4.4.3 first. An absent key passes; **any present value is refused**, including `""`, `null`, `0` and `false`, with exactly one issue at `["onDate"]` carrying our message.
- `{ from, to }` still parses to `.data = { to }`, so there is **no `.strict()`** and `group-series-req104:210` is untouched and green.
- An absent `onDate` is not invented into the output: `"onDate" in parse({ to })` is `false`.

**The re-pin (`:143`), same claim.**
- It still quotes the schema line **verbatim**, now the NEW line, so any drift in the shape fails here. That shape is `to` + optional `fromDate` + optional `rateMinor` + the `onDate` refusal.
- A comment names the harm. One line replaced by comment + line; nothing else in the file changed (`git diff --stat`: +2 / −1). The `groupTeacherSwap` line right below is untouched.

**Tests (`group-swap-no-single-session-task672.test.ts`, 12)**
- **Pure validator:**
  - `{ to, onDate }` ⇒ refused, **ONE issue at `onDate`**, with the sentence;
  - `{ to, onDate, rateMinor }` (the harm) ⇒ refused;
  - any present `onDate` (`""`, `null`, `0`, `false`) ⇒ refused;
  - `{ to, fromDate, onDate }` ⇒ still refused (it is the field, not the combination);
  - `{ to }`, `{ to, fromDate }`, `{ to, fromDate, rateMinor }` and `{ to, rateMinor }` ⇒ accepted, parsing to exactly what they did;
  - a stray `from` / `whatever` ⇒ still stripped;
  - a bad `fromDate`, a non-uuid `to` and a negative `rateMinor` are still refused.
- **Through the root app** (`PATCH /api/group-series/:key/teacher`, `swapGroupSeriesTeacher` spied):
  - `{ to, onDate }` ⇒ **400 VALIDATION**, `details` is exactly the one issue at `["onDate"]`, and **the service is never called**;
  - `{ to, onDate, rateMinor }` ⇒ 400, never called;
  - `{ to, fromDate }`, `{ to, fromDate, rateMinor }` and `{ to }` ⇒ **200**, and the service is called with exactly that body, unchanged.
- **Untouched and green:** `group-series-req104:210` (a stray `from` stripped) and `group-swap-rate-door-task634:133-135`.
- 📌 My first root-app run showed every body as 400. The cause was my fixture: the global uuid param guard (TASK-451) refuses a non-uuid `:key`. The group key is a uuid, and I fixed the fixture, not the product.

**Mutation set `group-swap-no-single-session-task672`** (`tests` = the task file + `group-series-req104` + `group-swap-rate-door-task634` + `group-swap-rate-task632`; run on the clean baseline):
```
baseline 43
G1 BITES (36 / 7) — the `onDate` refusal removed: THE DEFECT BACK (zod strips it, the whole group swaps)
G2 BITES (40 / 3) — `.strict()` instead: a stray `from` would be refused (group-series-req104:210)
G3 BITES (39 / 4) — `fromDate` refused: the legitimate from-here-on swap breaks
G4 BITES (36 / 7) — `onDate` no longer optional: an ABSENT key is refused too (every swap would 400)
CHECKSUM identical
```
- **4 BITES · 0 SURVIVED · 0 NO RESULT.** G1–G3 are the DoD's three; G4 is mine.

⚠️ **One change in a file that is not this TASK's: my own TASK-667 set.** `archive-owed-task667.mutations.json` mutation **O6** stopped resolving its anchor once.
- **Cause (mine, from TASK-668):** the dry run I added to `parent.service.ts` reuses the same `inArray(bookings.status, [...ARCHIVE_BLOCKING_STATUSES])` expression, so O6's anchor matched twice (`:187` and `:304`). The suite's "every filed set is re-runnable" check (TASK-627) failed on it.
- **Fix:** O6 is now anchored on the COUNT query's own trailing comment, so it matches once and means the same thing. Re-ran: the set is **6 BITES · 0 · 0**, and `link-parent-task668` is still **11 BITES · 0 · 0**.
- ⚠️ **What I did NOT establish:** why that check was green in my last full run, since the double match already existed then. The check scans the disk, so I expected it to have caught this earlier. I am reporting the fix, not an explanation.

**Runs (no reachable database; `.env` untouched):**
- Full suite: **4178 pass / 1 fail across 321 files.** The one fail is **not this TASK**: it is Team A's TASK-659 pin (`copy-kru-space-task659.test.ts`), turned red by TASK-671's edit; see TASK-671.
  - It also holds **Team A's uncommitted work** and my own TASK-671 edits. Everything else is green.
- `tsc --noEmit` → **exit 0**.
- `git status` (this TASK): `validation.ts`, `group-swap-rate-task632.test.ts` (the granted line), the new test + mutation set, and the O6 fix. Nothing committed.

**For you:**
- 🔴 **Ships alone, server first** (as the TASK says).
- ⚠️ **What an admin sees until TASK-673:** the old dialog's "this session only" will now get a **400**. As in TASK-644, `lib/validate.ts` answers every validation refusal with its one generic sentence, so the screen shows *"ข้อมูลที่กรอกไม่ถูกต้อง…"* and the draft sentence rides only in `error.details`. That is a refusal instead of silently moving the whole group and paying the wrong rate, which is the point; TASK-673 removes the option.
- **QA (API first):** `PATCH /api/group-series/{key}/teacher` with `{ "to": <coach>, "onDate": <a future session date> }` ⇒ **400**, and the group's coach is unchanged on every date. With `fromDate` ⇒ OK as before.
## Questions
- **Status (Bob, 2026-10-06 22:05) — everything is built; ONE thing is waiting, and it is not mine to take:**
  - **Done:** `groupSeriesSwap` refuses `onDate` (mechanism: `onDate: z.never({ error: … }).optional()` — an absent key passes, any present value, even `null`, is refused with ONE issue at `["onDate"]`; not `.strict()`). New test file `src/lib/group-swap-no-single-session-task672.test.ts`, 12 tests, green; `group-series-req104:210` and TASK-634's `:133-135` are **green and untouched**.
  - **Waiting:** `group-swap-rate-task632.test.ts:143` quotes the old schema line verbatim, so it is now the **suite's only red from this change** (`🔻 TASK-634 — the GAP IS CLOSED…`). I have **not** edited it: the grant (⏳ on the board) has not reached me.
  - **The re-pin is ready to apply the moment it is granted** (same claim, the exact accepted shape + the refusal, on that one line). Until then the mutation set can't be run: its baseline must be clean, and that pin makes it dirty. Everything else follows within minutes of the grant.
  - **Ask:** is the `:143` grant on its way? If Porter would rather I leave the old line text intact, that is not possible: the pin quotes the const's whole line, and the refusal has to live on it.
  > answer (Silver, 2026-10-06): **GRANTED, that one line.** Apply your ready re-pin: it quotes the NEW validator line verbatim and still fails if the quote drifts. Then run the mutation set on the clean baseline and nudge me for review. TASK-672 ships alone, server first; TASK-673 does not gate it.

## Review

**Silver, 2026-10-06 — ✅ DONE. Ships ALONE, server first (Porter).**
- **Diff:** `groupSeriesSwap` gains `onDate: z.never({ error: GROUP_SWAP_NO_SINGLE_SESSION }).optional()`. An absent key passes; any present `onDate` is refused with ONE issue. **Not `.strict()`**, so `req104:210`'s stripped `from` is unchanged, and TASK-634's pins are untouched.
- **`:143` re-pin (granted):** it quotes the NEW line verbatim, so it still fails on drift. The claim is kept.
- **By value through the route:** `{to,onDate}` and `{to,onDate,rateMinor}` ⇒ 400, and **the service is NEVER called**. That names the money harm in the test itself.
- **The anchor fix in your own TASK-667 set** (O6, made ambiguous by TASK-668) is accepted and was declared.
- **Re-run by me, no database:** task672 + task632 + req104 + task634 → **43 / 0**. Set 4/0/0 per your run.
- 📌 **Release-note flag for Porter:** a LIVE defect corrected (a group "this session only" swap moved the whole series from that day at the one-session rate). Porter words it.
