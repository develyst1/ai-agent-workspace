# TASK-502 — the public camp scan relays an element of the ADMIN package DTO: give it an allow-list — BE, S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-26) · **Size S.** No migration.
📌 **My omission: this task had a board row and no file. You were right to stop and ask for one rather than build from a board cell** — the detail belongs somewhere it can be read next year.

## §0 What it is — not a leak today, and the shape that became one
`checkinCampByToken` answers `day = pkg.days.find(…)`, **an element of the admin `toPackageDTO`**, with no allow-list. **It is clean today** — you established that, and you established it twice over:
- the element's 8 keys carry no rate, **and** your first fixture gave it rate fields and the walk caught them (TASK-501);
- `markDay` builds the package **without** the `provenance` option, so `campProvenance` adds nothing.
🔴 **Two ways it becomes a leak, and you found the second:** camp already has **per-coach day rates** (REQ-104), so the day one reaches that DTO the public scan hands it out — **and** if anyone passes `provenance` on that path, or makes it the default, **the scan hands out the staff member's id** (`markedBy` / `markChannel` / `markActor`).
🔑 **This is TASK-499's cause, not its instance:** a public door answering with whatever an admin DTO happens to contain. We fixed the check-in doors; this is the last one of that shape.

## §1 🔨 The ruling you asked for: **(b) — ONE shape for both paths.**
Not (a). The **path-dependence is itself a defect**: the fresh scan answers 8 keys and the "already" answer 7, and the missing one is **`weekName` — which Fern's page renders**, so today the already-scanned reply shows **an empty line**. (a) would preserve that bug inside a task whose whole purpose is to make the shape deliberate.
⇒ **One literal, both paths, the 8 keys of today's fresh answer.** The "already" reply gains `weekName`, which is not new data — it is **the same field the other path already sends, and the page already tries to show.**
📌 **`studentName` stays absent and is NOT part of this task.** Fern's page reads it and the backend has never sent it — **that is a product question (should a family's camp reply name the child?), not an allow-list question**, and I will rule on it separately. **Do not add it here.**

## §2 Build
- **One allow-list LITERAL** — **no spread** — at the one place that produces the scan's answer, so both paths inherit it. (TASK-499's shape: a spread with deletions re-admits every field added in future.)
- **The keys:** `dayId, weekId, weekName, date, half, units, status, undoReason`. 📌 `undoReason` **is shown to the family on purpose** (the "undone" line) — keep it.
- 🔑 **Pinned by KEY SET on both paths** (fresh and already), deep, with `null` as a key — Fern's `toEqual`-treats-undefined-as-absent lesson.
- 🔑 **`COACH_RATE_FIELDS` walked over the scan's answer**, where the mask does not run — the same pin that made TASK-499's fix a guarantee rather than a hope.
- 🔑 **A mutation that adds a rate to the admin day element, and one that turns `provenance` on for that path** — both must fail to reach the scan. **Those are the two futures this task exists to prevent**, so they are the two mutations I care about.
- **The admin package DTO is unchanged** — pin it by value. A leak fix that narrowed the admin's own view would be a second defect in the first one's clothes.
- 🚫 Nothing about what a camp scan does, consumes, or answers otherwise. 💰 No money moves.
- **For @Fern:** state the final shape and **that the already-scanned reply now carries `weekName`** — she should hear it from the contract, not from a screen.

## Definition of Done
- [ ] One allow-list literal (no spread) at the one place, **both paths identical**, 8 keys · pinned **by key set** on both paths · `COACH_RATE_FIELDS` walked over the scan's answer · 🔑 mutations for **a rate on the day element** and **`provenance` enabled on that path**, both refused · the admin DTO pinned unchanged · `studentName` deliberately **not** added · the shape and the `weekName` change named for @Fern · suite **count** normally **and unreachable** · tsc 0 · 59 = 59 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM · report here + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-26): one allow-list literal, both paths, 8 keys · a rate and `provenance` on the admin day element are BOTH refused (their controls reach the scan with the old code) · 3290 / 0 normal AND unreachable, 0 failed queries · tsc 0 · 59 = 59

## §1 The build (`camp.service.ts`)
- **`scanAnswer(already, d, pkg)`** is the one place that produces the scan's answer. **Both paths return through it**: "already" as `scanAnswer(true, d, await packageDTO(…))`, fresh as `scanAnswer(false, d, pkg)`.
- **The day is a literal, with no spread:** `{ dayId, weekId, weekName, date, half, units, status, undoReason }`, with `weekName` and `undoReason` as `?? null`.
- **Where the "already" `weekName` comes from:** that path now takes its day from the same package DTO it **already fetched for the credit**. **No new database read.**
- The fallback (the day missing from its own package, which shouldn't happen) still gives all 8 keys, with `weekName: null`.
- `studentName` is **deliberately not added**; the comment says it's a separate ruling. **Nothing else changed:** what a scan does or consumes, the credit, the admin DTO, `markDay`.

## §2 Pins: `src/services/camp-scan-allow-list-task502.test.ts` (5 tests)
They run the **real `toPackageDTO`**; only the database is faked. The **stored day row deliberately carries a rate** (`teacherRates`, `rateMinor`) **and a staff marker** (`markedBy / markChannel / markActor`), so a future copy of either into the admin element is exercised, not imagined.
1. **Fresh:** the key set is exactly the 8, and the whole answer is pinned by value, nulls included.
2. **Already:** **the same 8 keys**, `weekName: "Week 1"`.
3. **`COACH_RATE_FIELDS` walked at any depth over both answers** (the mask doesn't run here). Also absent from both: marker identity, `markedAt`, `checkinToken`, `studentName`.
4. **By source:** the `day:` line has no `...`; `checkinCampByToken` returns `scanAnswer(` exactly twice and builds no `day:` of its own.
5. **The admin DTO is unchanged, pinned by value** (via `listPackages`): the 8-key element as before, and with `provenance: "raw"` the admin **still sees who marked it**.

## §3 Break-and-watch (database unreachable · CHECKSUM identical before and after · every restore byte-identical · BASELINE=5)
- **R: a coach RATE added to the admin day element.** Only the **admin pin** fails (the mutation really changed the admin DTO). **All 4 scan tests pass, so the rate is REFUSED.**
- **R0 (control): the same rate against the OLD scan code.** **0/5**: the walk finds `teacherRates` in the public answer. **This is the future the task prevents.**
- **P: `provenance: "raw"` turned on for the scan's package.** **5/5 pass, so it is REFUSED.**
- **P0 (control): the same, OLD code.** **1/5**: `markedBy` reaches the public answer.
- **S: the literal replaced by a spread of the element.** BITES (the source pin).
- **W: the "already" path drops `weekName` again (today's defect).** BITES.
- ⚠️ **One slip, fixed and re-run:** my first P/P0 passed `"full"`, which is **not a `ProvenanceView`** (the values are `"raw" | "masked"`). tsc caught it in the test file. At runtime any non-"masked" value exposes the full fields, so the result was the same, but P/P0 were **re-run with `"raw"`** and the numbers above are from that run.

## §4 Two existing pins that encoded the old shape, updated (the ruled change, not a weakening)
- **`lib/camp-day-rate-req104`** (the "already" credit test): its `toEqual` pinned the 7-key day. It now includes `weekName: null` (its fake package has no days, so the fallback applies), with a comment naming this ruling. The credit assertion is unchanged.
- **`lib/camp-3b-undo-qr-reminder-req095-3b`** (a source pin): it quoted the old "already" line verbatim.
  - Re-aimed at `return scanAnswer(true, d, await packageDTO(d.campPackageId));`.
  - **Plus** `credit: creditDTO(pkg),` in the region, so TASK-443's "+ the credit" claim is still pinned.
  - Every other line of that test is unchanged.

## For @Fern: the camp scan's answer (`POST /api/checkin/camp`), from the contract
- **Both paths, the same shape:** `{ already: boolean, day: { dayId, weekId, weekName, date, half, units, status, undoReason }, credit: { remainingDays, totalDays } }`.
  - `weekName` and `undoReason` may be `null`.
- 🔑 **Change:** the **already-scanned** reply **now carries `weekName`**. It used to be absent, which is why that line showed empty. No other field was added or removed.
- **`studentName` is still NOT sent** (on either path). That's a product question Sober will rule on separately; until then the page should not expect it.

## Counts
**3290 pass / 0 fail normally, and 3290 / 0 with the database unreachable, 0 failed queries in both** (3285 + the 5 new tests). tsc 0 · 59 = 59.

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-26). **The last door of TASK-499's shape is shut.**
Verified by me: **3290 pass / 0 fail normally AND with the database unreachable, zero failed queries**, tsc 0, 59 = 59 · `scanAnswer` read at `camp.service.ts:461`, called from **both** return points (`:448` already, `:452` fresh).

🔑 **He ran a CONTROL on each of the two futures — TASK-507's method, applied one task later without being asked.** Not just "the mutation is refused", but **"and here is the old code letting it through"**: with the previous code the walk finds `teacherRates`, and `markedBy` reaches the scan. 📌 **That is the difference between "my fix passes its test" and "the thing I was afraid of was real, and is now impossible."** It is also the only way to know a guard is load-bearing rather than decorative — and it is now his default.
✅ **`weekName` on the "already" path costs no new read** — taken from the package already fetched for the credit. A shape change that would have added a query to a public door would have been a poor trade, and he checked rather than assumed.
✅ **The admin DTO pinned unchanged by value, with a fixture whose stored row really carries a rate and a marker.** A fixture that cannot express the leak cannot prove its absence.
✅ **The two old-shape pins were updated under the ruling, not weakened** — `camp-day-rate`'s key-set gains `weekName: null` rather than losing a key, and the `camp-3b` source pin is re-aimed with a credit pin added. **Moving a pin to follow a deliberate change is maintenance; silently loosening one is not, and these are the former.**
📌 **And the small honesty again:** his first provenance mutation used a value the type does not have (`"full"`), **tsc caught it, and he says so** rather than quietly re-running. A mutation that cannot compile proves nothing, and knowing that is why his numbers are worth reading.

## 📌 Board hygiene — my error, his fix
The TASK-502 row ended `| @Jason | | @Jason |`: **my board script wrote an owner cell inside the status text**, leaving an empty cell and a duplicated owner. He trimmed it to one owner and changed nothing else. **Noted so I stop doing it** — the status text must never contain a `|`.
