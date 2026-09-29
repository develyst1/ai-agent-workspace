# TASK-465 — 🔴 `uat`: the extender's horizon is `NaN-NaN-NaN` because one caller passes the whole setting object to `Number()` — fix it, and make the misuse impossible rather than corrected — BE, S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-25) · **Size S.** No migration. **The extender cannot create a date on any box until this ships** (the owner has applied and scheduled nothing — nothing is broken, nothing was created).

## §0 What the owner saw (uat, after migrate → 56 + pm2 restart, dry run with `{}`)
```
{ "dryRun": true, "date": "2026-09-25", "horizon": "NaN-NaN-NaN", "weeks": null, "series": 0,
  "closedSkipped": 0, "wouldCreate": 0, "truncated": null, "datesNotReached": 0, "plan": [] }
```

## §1 Porter's read — I verified it, and it is correct
`jobs.service.ts:638`: `const weeks = Number(await getSetting("group_series_weeks_ahead"));` — **`getSetting` returns the resolved OBJECT** (`{ value, isDefault, reason }`), so `Number({…})` is `NaN`, the horizon is `addDays(runDate, NaN*7)` = `NaN-NaN-NaN`, and `d <= "NaN-NaN-NaN"` is never true ⇒ **zero dates on every box, reported as a green run.** `weeks` prints as `null` because `JSON.stringify(NaN)` is `null` — which is why the summary looked merely empty rather than broken.
**It is the ONLY caller that forgets `.value`** — every other one reads `(await getSetting(k)).value` or destructures it (`checkin.service.ts:56,86` · `jobs.service.ts:542` · `line-register.service.ts:48` · `line-webhook.service.ts:928,977` · `scheduler.service.ts:3299`). ⚠️ **TypeScript cannot catch this**: `Number()` accepts anything, so the mistake is invisible to the compiler and produces a valid-looking date string.
**Porter's other two questions, answered from the code so you need not re-derive them:**
- **`truncated: null` is CORRECT** — it is `null` until a bound is hit, and no bound was hit. Not a second unset field.
- **`series: 0` is NOT a consequence of the bug.** The summary reports `series.size`, counted from the live GROUP rows *before* any date arithmetic — so `uat` genuinely has **no live group series with a `group_key`**. Even fixed, the extender will create nothing there until somebody makes one. Say this plainly in your report; it is the owner's answer to "is it working?".

## §2 Build
1. **Fix the caller** (read `.value`, as its seven siblings do).
2. 🔑 **Then make the misuse impossible, because a fix that relies on the next person remembering is not a fix.** Options — pick one and argue it: a `settingNumber(key)` / `settingValue(key)` helper that the callers use; or give the resolved object a shape that makes `Number(obj)` fail to compile (e.g. a branded type); or a scan pin that fails when a `getSetting(...)` result reaches `Number`/`parseInt`/arithmetic without `.value`. **Whatever you choose, the compiler or the suite must object the next time somebody writes it** — there are eight call sites today and there will be more.
3. 🔴 **The test must go through the REAL `getSetting`** — Porter's point, and it is the lesson of the week again: the existing tests **spied the setting**, so they asserted the horizon the spy returned and could never see the shape mismatch. Build the value the way production builds it (the real resolver over a fake row / default), so the day the setting's shape changes the suite says so. **A test that mocks the thing under test proves only the mock.**
4. **The summary must not print `weeks: null` again** — if the resolved number is not finite, the run must FAIL loudly (and say which setting), never report a green zero. A job that cannot compute its horizon has not "found nothing to do"; it has broken.
- 🚫 No change to the extender's rules, bounds, dry-run default or route shape.

## §3 Report — for the owner's re-check
Give the **expected dry-run reading after the fix**, so he can tell success from the same silence: what `weeks` and `horizon` should read on `uat` today, and what `series`/`wouldCreate` will be given that `uat` has no group series (he should expect **zeros with a real horizon** — that is a healthy run, not a repeat of this bug). Name what he would see on a box that DOES have an open series.

## Definition of Done
- [ ] The caller fixed · the misuse made impossible (mechanism argued) · **a test through the real `getSetting`, no spy** — say in the report that it FAILS on today's code before the fix · a non-finite horizon fails loudly · the expected dry-run reading for the owner · suite **count** · tsc 0 · 56 = 56 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM · report here + `inbox/SA.md` + log.

---

# ✅ CODE DONE — @Jason → @Sober (2026-09-25) — the caller fixed, the misuse made to THROW, and a second, worse defect under the same NaN; 2964 pass / 0 fail; 7/7 mutations bite

**Numbers:** `bun test` **2964 pass / 0 fail**, 229 files (+1: `src/lib/extender-real-setting-req105.test.ts`, 9 tests) · `tsc --noEmit` **0** · 🚫 no migration (56 = 56) · 2 suites moved off the setting spy (below).

## §0 It was mine, and so was the reason nobody saw it
`Number(await getSetting(…))` was written in TASK-456, and **both of my extender suites spied `getSetting` to return a bare `2`** — where production returns `{ value, isDefault, reason }`. So they asserted the horizon the SPY produced, and could never see the shape mismatch that every real box hit. Those two spies are gone: both suites now fake only the `app_settings` ROW, and the value goes through the real resolver.

## §1 🔴 The worse half — found by writing the test first, as you asked
**On today's code the new test FAILED exactly as `uat` did** (`horizon: "NaN-NaN-NaN"`, `weeks: NaN`) for the no-series case. **The case WITH an open series did not fail — it HUNG.** Reason: `weeklyDatesToCreate` stops on `d <= horizon` as a STRING compare, and `"2026-11-13" <= "NaN-NaN-NaN"` is **`true`** — digits sort before `N` — and stays true for every date, including past the year 9999. Measured: **360,756 iterations in 300 ms, already at the year 8940, pushing into an array with no end, synchronously.** So:
- on `uat` (no series) the bug was a **green zero** — which is what the owner saw;
- on **any box that HAS a live group series**, the extender's first call **never returns**: it blocks the event loop (so the HTTP request gets **no response at all**) and grows memory without limit.
⚠️ **That is exactly `sid`'s incident** (TASK-462 §0): the trigger got "the underlying connection was closed" with no response, and the shared Postgres cluster went into recovery at the same moment — which is what an OOM killer on a 30-app box does when one process eats the memory. **I cannot prove it from here** — Otto's Postgres log / the kernel's OOM line would show whether `som-back` was the process that grew — but it is now the leading candidate, and it retires the "coincidence" reading in TASK-462 §1.4. 📌 It also corrects TASK-462 §1.1 ("the work IS bounded — the loop's bound is a string compare against the horizon"): that bound held only while the horizon was a date. TASK-462's `maxDates`/`maxSeries` bounds could not help either — they apply AFTER `weeklyDatesToCreate` returns, and it never did.

## §2 What was built
1. **The caller**: `await getNumberSetting("group_series_weeks_ahead")` — a new helper in `settings.service.ts` that reads `.value` and **refuses a non-finite result loudly, naming the setting**.
2. 🔑 **The misuse is made to THROW, not merely discouraged — argued:** a resolved setting now carries a **non-enumerable `Symbol.toPrimitive` that throws** (`resolveSetting`, `lib/settings.ts`): `Number(obj)`, `+obj`, `obj * 7` and `\`${obj}\`` all throw `setting "…" is a resolved object — read \`.value\` (or use getNumberSetting)`, on the first call, on every box. ⚖️ **Why this over the three options you listed:** a branded type cannot stop `Number(x)` (its parameter is `any`), so the compiler route is closed; a helper alone relies on the next person choosing it; a scan pin catches the pattern it knows and nothing else. The throwing object catches **every** coercion path, in production, the first time it runs — a loud error on the wrong line instead of a plausible `NaN` three calls later. Non-enumerable and symbol-keyed, so every correct use is untouched: `.value`, destructuring, `toEqual`, `JSON.stringify` (pinned; mutation C makes it enumerable and 5 tests fail). The helper and a paren-matching scan pin (every `Number/parseInt/parseFloat(… getSetting(…) …)` in src must read `.value`) are the belt and braces. 📌 The scan's first draft was a regex that flagged the CORRECT `Number((await getSetting(leaveCutoffKey(type))).value)` as an offender (it stopped at the inner `)`) — so it is a paren matcher now, proven on both lines.
3. **A non-date horizon FAILS the run** (`horizon is not a date … runDate=… weeks=…`) — never a green zero with `weeks: null` again.
4. 🔴 **The loop is guarded WHERE THE LOOP IS**: `weeklyDatesToCreate` refuses a `from`/`horizon` that is not `YYYY-MM-DD`, immediately (pinned: < 50 ms). The caller's check is not enough on its own — this function is exported and the next caller may not check.

## §3 The tests go through the REAL `getSetting` — no spy on the setting anywhere now
`extender-real-setting-req105.test.ts` fakes only the `app_settings` row and the GROUP rows: `uat`'s exact case (no row ⇒ default 8 ⇒ a real horizon), an admin override (`12` ⇒ 12 weeks), a corrupt row (`"banana"` ⇒ the resolver's fallback, 8 — not NaN), a box WITH an open series (the plan names it and stops at the horizon). **Both older extender suites** (`group-series-extender`, `extender-safe-run`) were moved off `spyOn(settings, "getSetting") → 2` onto the row — with a comment saying that spy is why they passed while every box computed NaN.

## Break-and-watch — `mut465.mjs`, 7 mutations, **7 bite** (`try/finally`, sha-256 restore byte-identical, `BASELINE=52`)
A 🔴 the defect restored (`Number(await getSetting(…))`) — **17 tests fail, because the object now THROWS** instead of coercing · B the object stops refusing coercion · C the refusal becomes enumerable · D the helper accepts NaN · E the helper forgets `.value` itself · F a non-date horizon let through · G 🔴 **the loop guard removed — the suite HANGS and the runner kills it at 60 s.**
⚠️ **Honest note on G:** a SYNCHRONOUS infinite loop cannot be interrupted by Bun's own per-test `--timeout` (the timer never gets the thread), so G is caught by the runner's OUTER timeout, not by an assertion. That is the nature of the defect, and it is the strongest argument for the guard living inside the loop's own function.

## §4 📦 The owner's re-check on `uat` — what success looks like, so he can tell it from the same silence
Dry run with `{}` after deploying:
```
{ "dryRun": true, "date": "2026-09-25", "horizon": "2026-11-20", "weeks": 8, "series": 0,
  "closedSkipped": 0, "wouldCreate": 0, "truncated": null, "datesNotReached": 0, "plan": [] }
```
- **`weeks: 8` and `horizon: "2026-11-20"`** (today + 56 days) are the proof the fix is live — **the two fields that read `null` / `NaN-NaN-NaN` before.** (If he runs it on a later day, the horizon is that day + 56.)
- **`series: 0` and `wouldCreate: 0` are CORRECT on `uat`** — your read is right: `series` is counted from the live GROUP rows BEFORE any date arithmetic, so `uat` genuinely has no live group series. **Zeros with a real horizon are a healthy run**, not this bug again. `truncated: null` is correct too (no bound hit).
- **On a box that DOES have an open series** (e.g. `sid`): `series ≥ 1` and `plan` lists each one — its key, title, coach and the weekly dates it would add up to the horizon — with `wouldCreate` = the total. 🔴 **`sid` should be dry-run FIRST, and only after this ships** — on today's code a run there is the infinite loop above.
- If a setting is ever corrupted so the number cannot be computed, the run now answers with an error naming `group_series_weeks_ahead`, never a green zero.
⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-25)
Re-run by me: **2964 pass / 0 fail** · tsc 0 · 56 = 56 · the throwing `Symbol.toPrimitive` on the resolved setting · `getNumberSetting` at the caller.
🔴 **§1 is the most important thing found this week, and it rewrites an incident report.** The NaN horizon was the harmless half. `weeklyDatesToCreate` stops on a **string** compare, and `"2026-11-13" <= "NaN-NaN-NaN"` is **true** — digits sort before `N` — so on a box with **no** series the run was a green zero, and on a box **with** one the first call **never returned**: 360,756 iterations in 300 ms, into the year 8940, growing an array synchronously on the event loop. **That is `sid`'s incident** — no HTTP response at all, and a shared Postgres cluster into recovery, which is what an OOM kill on a 30-app box looks like. He says plainly he cannot prove it from here and names what would (Otto's OOM/Postgres line), which is the right way to hand a leading candidate to someone who can check it.
**It also corrects two things I wrote in TASK-462 and signed off:**
1. I said *"the work IS bounded — the loop's bound is a string compare against the horizon."* That bound held **only while the horizon was a date**. I read the loop and accepted the comparison without asking what it does when the right-hand side is not a date.
2. TASK-462's `maxSeries`/`maxDates` could never have helped: they apply **after** `weeklyDatesToCreate` returns, and it did not return. I designed bounds around a function I had assumed terminates.
**On the mechanism — he argued past all three of my options and chose better.** A branded type cannot stop `Number(x)` (its parameter is `any`); a helper relies on being chosen; a scan knows only its own pattern. A **throwing `Symbol.toPrimitive`** catches every coercion path — `Number()`, `+`, `*`, template — on the first run, on every box, with the fix in the message, and leaves `.value`, destructuring, `toEqual` and `JSON.stringify` untouched. 📌 And his scan's first draft flagged a CORRECT line (it stopped at the inner paren), which he found and replaced with a paren matcher — a guard that cries wolf gets deleted.
**Two more rules earned here:**
3. 🔑 **The loop is guarded where the loop is.** A caller's check is not enough for an exported function whose next caller may not check.
4. ⚠️ **His honest note on mutation G:** a synchronous infinite loop cannot be caught by a per-test timeout — the timer never gets the thread — so it is the runner's outer timeout that kills it. Saying that, rather than letting a green "7/7 bite" imply an assertion caught it, is exactly the standard I want.
**§0 is the reason all of this stayed invisible:** both extender suites spied `getSetting` to a bare `2`, so they asserted the spy's horizon while every real box computed NaN. Both are now off the spy.
