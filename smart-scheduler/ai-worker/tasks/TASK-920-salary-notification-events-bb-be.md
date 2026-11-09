# TASK-920 — BE: REQ-120 **Salary notification events: a feed item when a pay line of a notifiable kind is written, with NO money in the text** (backoffice-back) — @Jason (Team A, lent to Silver; Porter 2026-11-09) — Silver reviews
**From @Silver, 2026-11-09.** Source: TASK-917's cross-team follow-up (Sober). The Salary-type events originate in Salary code and must call the TASK-917 seam. REQ-120 R0.2 (an admin never sees pay) and ขวัญ S17 (staff are told about bonus, commission, transportation, OT and other items). Repo `smart-scheduler-backoffice-back`, branch `dong`. **No git command: git only on the owner's word.** **No migration** (0020's `bo.notification` exists). **Size ≈ 1 d.** Your chain is Sober, so the report and questions go in this TASK.

## The seam (yours, TASK-917, `services/notification.service.ts`)
`recipientsForType(type, exec)` (l.25) · `createNotification(exec, { recipientRef, type, text, occurredOn, key })` (l.39), idempotent on (recipient, key) · `notifyAssigned({ type, text, occurredOn?, key? })`.

## The events: one feed item per **pay line written** of these kinds, to everyone `recipientsForType` returns

| type | written by (today's code) | when it fires |
|---|---|---|
| **Bonus** | `bonus-lines.service.ts` `applyBonusLines` (TASK-867) | each line in `written` (not `unchanged`) |
| **Transportation** | `transport.service.ts` `applyTransportLines` (TASK-868) | each line in `written` |
| **Extra Hour** | the pay run's auto lines (`runPeriod` → `syncAutoLines`, kind `extra_hour`, TASK-878) | each extra-hour line **inserted** (not one that was only kept / updated) |
| **OT** | `POST /salary/slips/:id/ot` (CEO) | the OT line written |
| **Other** | `POST /salary/slips/:id/lines` (CEO, kind `other`) **and** `POST /salary/entries` (admin, kind `other`, TASK-880) | the line written |
| **Commission** | **no writer exists yet** in BB (no code writes kind `commission`) | **none in this TASK.** Export one helper the future commission writer will call, and say so in the report |

- **Merit and FL pay are NOT notification types** (TASK-917's 7 types), so don't emit them.
- **Never on a delete, an orphan, or a `changed` (report-only) line.**

## The text: **NO money, ever** (an admin sees the same item)
- **Format:** `<Type> · <coach name> · <dd/mm/yy>` + **one detail with no amount**:
  - Bonus → "1st Trial" (b50) / "Renew" (b100) (REQ-5010's words);
  - Transportation → `<school> · Round trip|One way`;
  - Extra Hour → `<n> Hr` (that day's extra hours);
  - OT → `<n> Hr`;
  - Other → the line's reason **as typed**. It's free text, so **if it contains a digit-run that looks like money (e.g. "200", "1,000", "฿"), drop the reason and write "Other item".** Test it.
- **The coach name** comes from the store's existing `teacherNames` lookup (`salary.service.ts:72`); unknown → the word "coach". The date is the line's date (or the run date for a line without one), in Bangkok `dd/mm/yy`.
- **A test asserts that no generated text contains a satang / baht figure.** Feed it lines with amounts and check the output has none of their digits / ฿.

## Idempotency and failure
- **Key per line:**
  - an auto line → `pay:<slipId>:<kind>:<sourceRef>`;
  - a manual line → `pay-line:<lineId>`.
  - A pay-run re-run or a double click can't notify twice.
- **A notification never blocks or rolls back pay:**
  - write it **after** the line is committed (`notifyAssigned`), or in the same tx only where you already hold one and a failure there is caught;
  - a failure is logged and counted in the producer's result as `notifyFailed: n`, never thrown.
- Recipients per type come from `recipientsForType` only. There are no per-person rules in this code.

## Files (claim: lent to Jason; Brew's / Team B's producer files edited at their write points only)
- A new `src/services/salary-notify.ts` (the text builders + `notifyPayLine(...)` + the commission helper) + `salary-notify-task920.test.ts`;
- one call site each, tagged `🔻 TASK-920`, in:
  - `bonus-lines.service.ts`;
  - `transport.service.ts`;
  - the extra-hour insert path of the pay run (your `salary.service.ts`);
  - the OT route / service;
  - the `other` line paths (`/slips/:id/lines`, `/entries`).
- **No change to line amounts, keys, or any response shape;** add a result counter only.
- Pure mirror test edits are pre-approved (tagged, listed).

## Tests (each must fail when its code is removed)
- each of the 5 producers emits one item per written line, to every recipient, with the right type;
- a re-run / an `unchanged` line emits nothing;
- no text contains money (the assert above, including the "Other" reason with a number);
- a notify failure leaves the pay line written and counts `notifyFailed`;
- Merit / FL pay emit nothing.
- A mutation set over the type mapping, the key and the no-money filter.

## Done =
- `bunx --package typescript@5.9.3 tsc --noEmit` 0;
- BB suite green (before / after);
- the mutation set bites;
- a rolled-back sid proof (host .206): one bonus line + one OT line → feed rows for the assigned users, a re-run adds none, the texts have no amounts; residue 0.
- `/security-review` result in the report (data exposure: the no-money rule).
- Report at the end of this TASK. `git status` = only the claimed files. No git command run.

## Jason (BE) 2026-11-09 — TASK-920 GREEN (Salary notification events, NO money in any text) — for Silver's review
**Built (backoffice-back; no migration, no git):** new `src/services/salary-notify.ts` (the text builders, the keys, `realNotify`, `fire`, `notifyCommission`) + one tagged `🔻 TASK-920` call site at each write point, all through the accepted 917 seam (`notifyAssigned` → `recipientsForType` + `createNotification`). **No change to any line amount, key or response shape**: the only addition is a `notifyFailed` counter that appears **only when > 0**.
| type | where | fires when |
|---|---|---|
| Bonus | `bonus-lines.service.ts` `applyBonusLines` | each line **written** (not `unchanged` / `changed` / `orphaned`) |
| Transportation | `transport.service.ts` `applyTransportLines` | each line **written** |
| Extra Hour | `salary.service.ts` `runPeriod` | each extra-hour line **inserted** by the run (a kept or updated line, FL pay and every re-run: nothing). `syncAutoLines` now also returns the lines it inserted; `AutoLine` gains `extraMinutes` so the text says "2 Hr" without parsing the label (which carries the rate) |
| OT | `addOt` (`POST /slips/:id/ot`) | the OT line written |
| Other | `addLine` (`POST /slips/:id/lines`) **and** `addEntry` (`POST /entries`, kind `other`) | the line written; **Merit and FL pay emit nothing** |
| Commission | none exists in BB | **`notifyCommission(notify, {lineId, coach, day?, detail?})` is exported** for the future writer (key `pay-line:<lineId>`; a detail that could hold money is dropped) |
**Text (no amount, ever):** `<Type> · <coach> · <dd/mm/yy>` + one detail: Bonus = «1st Trial» (b50) / «Renew» (b100); Transportation = `<school> · Round trip|One way` (no km, no vehicle: they give the pay away); Extra Hour / OT = `<n> Hr`; Other = the reason **as typed unless it could hold money, then «Other item»**. **My rule is blunter than your example: ANY digit, a currency symbol (฿ $ € £) or a currency word (บาท, สตางค์, baht, satang, THB) drops the reason.** A false positive only costs the detail ("2 helmets" becomes «Other item»); say if you want it looser. Coach name from the store's `teacherNames`, the word «coach» when unknown. Dates: Bonus and Other use the run/entry day (no line date), Transportation the trip date, Extra Hour the day, OT the OT date.
**Keys / failure:** auto line `pay:<slipId>:<kind>:<sourceRef>`, manual line `pay-line:<lineId>`, so a re-run or a double click cannot notify twice. The pay line is **committed first**; the notification runs after, inside `fire()` which **never throws** (a thrown or failed notifier = one counted failure, logged without text or recipient). Producers default to notifications OFF when no notifier is injected (every existing test), ON in production wiring (`createSalaryService` default deps, `applyBonusLinesFor`, `transportServiceFor`).
**Evidence:** pinned tsc 5.9.3 → 0 `error TS` · backoffice-back suite 1191 pass / 0 fail · new `salary-notify-task920.test.ts` (20 tests: text builders; the no-money rule incl. the Other-reason cases and a property check against the line amounts in every producer; Extra Hour one per inserted line, re-run nothing, a new day just that one, a changed day nothing, FL pay nothing; OT / Other (CEO) / Other (admin entry, response keys unchanged) / Merit nothing; a refused (locked) write emits nothing; Bonus 1st Trial / Renew, re-run nothing; Transportation text without km/vehicle/amount; failure and **thrown** notifier leave the lines written and count `notifyFailed`; Commission helper). **Mutation set 14/14 bites** (no-money filter digits / currency words, both keys, Bonus detail, Round trip / One way, a thrown notifier escaping, the Extra Hour / OT / Bonus / Transportation type, Extra Hour notifying existing lines, Merit notifying, transport text carrying km). **sid, rolled back (host .206 checked; 9/9 PASS, left behind: 0 periods, 0 notifications):** a real teacher + the seeded CEO: an OT line, an Other line whose reason held "1,500", a Bonus 50 line and an Extra Hour line produced exactly four feed items for the CEO (`OT · coach · 20/07/98 · 3 Hr`, `Extra Hour · … · 2 Hr`, `Bonus · … · 1st Trial`, `Other · … · Other item`), no text with a money figure; a re-run of the pay run and the bonus apply added none; a failing notifier gave `notifyFailed: 1` with the OT line still written.
**Security review (data exposure: the no-money rule):** none open. Texts are built only from fixed words, the coach's display name, a date, an hours count, a school name and (Other) a reason that is dropped when it holds any digit or currency token; no amount, km, vehicle, rate or base ever reaches a text builder's input (the builders do not accept one). Recipients come only from the assignments table (the CEO role today); an admin sees the same items. A notification failure cannot change pay (committed first, caught, counted). Residual, by design: a free-text reason without digits can still say "bonus for Pete" in words; the CEO enters it, and it is the CEO's own wording.
**Notes for Silver:** (1) Recipients today are the CEO role only (917's seed); London's Low-Stock assignment does not receive Salary types. (2) The `Other` entry by an admin also notifies the CEO. (3) Commission has no writer yet; the helper is ready.
Ball: Silver (review) · Sober (FYI).

## Review — @Silver, 2026-11-09: ✅ ACCEPTED (DONE)
- **Re-run by me:**
  - BB `bunx --package typescript@5.9.3 tsc --noEmit` = 0;
  - `bun test` = 1230 pass with 1 fail on the first run, **0 fail on the re-run** a minute later. The fail was in Bob's in-flight TASK-921 file (`commission-lines.service.ts`, written at 03:16), not 920's.
- **Call sites:** `bonus-lines.service.ts` · `transport.service.ts` · `salary.service.ts` (extra hour / OT / other). Commission exports `notifyCommission`, and Bob's 921 already calls it, so the seam works end to end.
- **No money:**
  - texts are built by `payLineText` from code-made details;
  - an "Other" reason with any digit / ฿ / บาท is replaced (`looksLikeMoney`, `salary-notify.ts:24`). It's deliberately broad: a reason like "ทำอุปกรณ์เสีย 2 ชิ้น" also becomes "Other item". That's an accepted trade-off.
- **Keys:** `pay:<slipId>:<kind>:<sourceRef>` / `pay-line:<lineId>`; a failure is counted, never thrown.
- **Evidence:** 14 / 14 mutants; sid 9 / 9 rolled back.
- **Security review:** none (Jason's, confirmed). It's a no-money feed to role-derived recipients.
