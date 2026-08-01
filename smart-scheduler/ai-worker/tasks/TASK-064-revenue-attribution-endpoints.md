# TASK-064: backoffice-back (:4010) — sale attribution map + revenue-by-activity & customer-spend reports
- Source: SPEC-021 (REQ-014)
- Status: DONE  (reviewed 2026-08-01 by Sober — sum identity tested across all three unattributable cases, read-*narrow* public declarations, adminAuth + required month both accepted; tsc 0 / 71 tests. Flagged `/reports/pl` auth gap → TASK-068)
  backoffice **71/0** (was 48, **+23**); scheduling re-checked **280/0**. ❓ **2 judgement calls to confirm** —
  I put both endpoints behind `adminAuth` (`/reports/pl` beside them has **none**), and `month` is required with
  no server-side default. Both argued in the Implementation Notes.)
- Depends on: none
- Assignee: @Jason (**smart-scheduler-backoffice-back, port 4010** — not the scheduling API)

## What to do
Two executive-only reports, both built on **one** derived map.

### 1. The attribution map — build it once, use it twice
Every sale is a `bo.movement` with `refType: "SALE"`. Its item's **`externalRef`** (product code) says what
`refId` points at:

| Product code | `refId` → | Sport |
|---|---|---|
| `course-{size}` | `public.course_packages.id` | its bookings' `subjectId` |
| `first-trial` / `single-session` | `public.bookings.id` | `bookings.subjectId` |
| `voucher-{hours}` | `public.vouchers.id` | **none — unattributable, by nature** |

Produce `(productCode, refId) → { studentId, subjectId | null }`, then **group the same map two ways**:
by `subjectId` for revenue-by-activity, by `studentId` for customer spend. **Do not build a second map for the
second report** — that's how two screens end up disagreeing about one month's total.

**Derive by joining; do not tag sales going forward and do not create per-subject income items.** The link
already exists, so this needs **no migration**, works **retroactively on every historical sale**, and can't
drift from the sale it describes.

### 2. Reading `public` from backoffice-back
Add **read-only** Drizzle declarations for the `public` tables you join (`course_packages`, `vouchers`,
`bookings`, `students`, `subjects`). One database since REQ-006, so this is a plain join.

> ⚠️ **Ownership rule — please repeat it in a comment where you declare them: backoffice-back READS these and
> never writes or migrates them.** `public` migrations stay owned by scheduling-back. This mirrors what REQ-006
> already chose in the other direction (scheduling-back touches `bo.item` directly rather than over HTTP), so
> it's the established pattern, not a new liberty.

### 3. ⚠️ The `unattributed` bucket is a requirement, not an edge case
A **voucher is generic hours** — no sport at sale, and its sessions may later be different sports. It goes to
`unattributed`, along with any sale whose `refId` no longer resolves.

**`buckets` + `unattributed` must sum to `totalMinor`.** Assert that in a test. A finance report that silently
drops what it can't classify shows a tidy split that doesn't add up to the month's real revenue — and that is
the number an executive would act on.

### 4. Endpoints (next to the existing `GET /bo/reports/pl`, same admin auth, read-only)
- **`GET /bo/reports/revenue-by-activity?month=YYYY-MM`** → `{ month, totalMinor, buckets: [{ subjectId, name,
  amountMinor }], unattributedMinor, unattributedReason }`
- **`GET /bo/reports/customer-spend?month=…&q=…`** → per student `{ studentId, name, totalSpendMinor, courses,
  vouchers, sessions }`

**No migration. No writes.** Nothing about sale posting, pricing or the P&L report changes.

## Definition of Done
- [ ] Both endpoints work off **one** attribution map; there is no second copy of the refId→student/subject rule.
- [ ] **`buckets` + `unattributedMinor` === `totalMinor`** — asserted by a test, not by inspection.
- [ ] A **voucher sale** lands in `unattributed`; a **course** and a **trial/single** sale land in the right
      sport; a sale whose `refId` no longer resolves lands in `unattributed` rather than disappearing or throwing.
- [ ] Read-only `public` declarations carry the ownership comment; **no migration in this repo touches `public`**.
- [ ] Month filtering is on the movement's `created_at` **in Bangkok time** — see the TASK-062 note below.
- [ ] `bunx tsc --noEmit` clean; `bun test` green — the mapping/grouping logic **pure and tested without a DB**.

> ⚠️ **Carry TASK-062's lesson across, please.** You found there that comparing `toISOString()` files rows under
> the wrong month for the first 7 hours of every Bangkok day-of-month-1. This report is month-bucketed **and
> financial**, so the same bug here is worse: it would move revenue between months. Use the same fixed +07:00
> shift and pin both sides of a boundary with a test.

## Implementation Notes

# ✅ RESUMED AND BUILT (2026-08-01, after TASK-066 landed)
Taken on your explicit trigger — *"TASK-064 resumes once TASK-066 lands, keyed on `external_ref`."* TASK-066 is
DONE, so the premise now holds and the key is settled. **The original blocker analysis is preserved below**, since
it's the record of why this task looks the way it does.

### What I built
**One map, two groupings — `lib/revenue-attribution.ts` (pure, no DB).** `attributeSales(sales, sources)` is the
only place that decides what a `refId` points at; `groupBySubject` and `groupByStudent` both consume its output.
There is no second copy of the rule, so the two screens cannot disagree about a month's total.

**The `unattributed` bucket carries its reasons with counts.** Your §3 asks for the bucket; I made it say *why*,
because "unattributed: ฿9,000" reads as "vouchers, fine" when it might be a code we don't recognise. It renders
e.g. `1 vouchers (generic hours — no sport at sale); 1 sales whose reference no longer resolves; 1 ⚠️ sales with
an unrecognised product code`. That directly serves your standing instruction that a fourth product code must
**never fall silently into `unattributed`** — an unknown code gets `reason: "unknown-code"`, not the voucher
treatment.

**The `buckets + unattributed === total` identity holds by construction, not by luck:** `attributeSales` returns
**exactly one entry per sale**, and grouping adds every entry to precisely one of the two sides. There's a test
for that invariant too, not just for the sum.

**A voucher is unattributed by SPORT but fully attributed by CUSTOMER.** That asymmetry is the whole reason one
map serves both reports, so I made it explicit in the type (`studentId` set, `subjectId` null, `reason:
"voucher"`) and pinned it with a test.

**Read-only `public` declarations** (`pubStudents`, `pubSubjects`, `pubCoursePackages`, `pubVouchers`,
`pubBookings`) carry the ownership rule as a header comment, as you asked. I declared **only the columns the join
needs** — a narrow declaration can't tempt anyone into writing through it, and it won't drift when
scheduling-back adds a column. **No migration in this repo touches `public`.**

### Two judgement calls I want you to confirm
**1. 🔐 I put both endpoints behind `adminAuth`, unlike `/reports/pl` next to them.** Your task §4 says "same
admin auth as `/reports/pl`" — but `/reports/pl` has **none** (`bo.ts`: *"Writes behind the single-admin JWT;
reads open"*), while SPEC-021 says "**Both** behind the existing backoffice admin auth". I took the protective
reading: REQ-014 is titled *executive-only*, and `customer-spend` pairs a child's name with what their family has
paid. Opening them is a two-word change if you disagree. ⚠️ **The neighbour is the real question: `/reports/pl` —
the P&L — is currently readable without auth.** Given REQ-014's framing that may be an existing gap worth a look.
**I have not touched it** (out of scope).

**2. `month` is required, with no server-side default.** Same reasoning as TASK-062's "no parameters": a default
would let two staff at a month boundary read different months and each conclude the report is broken. The FE
always passes it.

### Performance note (small, deliberate)
The SQL is bounded to the month via `bangkokMonthRangeUtc` rather than reading every SALE movement ever recorded
and filtering in JS. The range is derived from **the same +07:00 offset** as the predicate, and a test asserts the
two agree **at all four boundary instants** for four different months — so a row can never be fetched-then-dropped
or, worse, missed. `inMonthBangkok` remains the authority.

### ⚠️ TASK-062's lesson, carried across as you asked
This is month-bucketed **and** financial, so the UTC bug would literally **move revenue between months**. The
comparison shifts by a fixed +07:00 (Thailand has no DST, so it's exact) and there are tests on **both** sides of
**both** boundaries — 01 Aug 02:00 Bangkok files under August, 31 Jul 23:00 Bangkok stays in July — plus a
December case so month 12 rolls into the next year rather than becoming month 13.

### What this will show on day one — please set this expectation before คุณกุ้ง sees it
The reports are correct, but they can only report what was posted. Until **TASK-066 is deployed** and
`sale:ensure-items` has run, there are no SALE movements, so a month will read **฿0 with an empty split**. After
deployment it fills in **going forward only** — the retroactive coverage you already corrected in SPEC-021 is
still not achievable, and per TASK-066's finding the history cannot include courses or vouchers at all. **The
number will be honest but young.**

### Verification (`smart-scheduler-backoffice-back`)
- `bunx tsc --noEmit` → **clean (exit 0)**; `bun test` → **71 pass / 0 fail** (11 files, was 48 — **+23**).
- `smart-scheduler-back` re-checked and unaffected: tsc **0**, **280/0**.
- New `lib/revenue-attribution.test.ts` covers the DoD line by line: course → its sport · trial/single → the
  booking's sport · **voucher → no sport but the right customer** · **a refId that no longer resolves is kept as
  `unresolved` with its money intact** (not dropped, not thrown) · an unknown code flagged separately · a course
  with no bookings yet · **the sum identity asserted** — including the two degenerate cases that would otherwise
  pass for the wrong reason (**nothing attributable**, and **no sales at all**) · both groupings from one list ·
  and the month boundaries above.
- One test documents a genuine, intended asymmetry: **customer-spend's total is *less* than the month total**
  when a sale has no resolvable student — it has no customer to attribute to, and stays visible in revenue's
  `unattributed`, which is where the money reconciles.
- ⚠️ The queries are **deploy smoke** (brownfield). **Smoke** (after TASK-066's deploy): sell a course and a
  voucher → `GET /bo/reports/revenue-by-activity?month=YYYY-MM` shows the course under its sport and the voucher
  in `unattributed`, and **buckets + unattributed equals `totalMinor`** · `GET /bo/reports/customer-spend` shows
  that family once with **both** purchases · both endpoints **401 without an admin token**.

**DoD:** both endpoints off **one** map, no second copy of the rule ✓ · **`buckets + unattributedMinor ===
totalMinor` asserted by test** ✓ · voucher → `unattributed`, course/trial → the right sport, unresolved `refId`
neither disappears nor throws ✓ · read-only `public` declarations with the ownership comment; **no migration here
touches `public`** ✓ · month filtering on `created_at` in **Bangkok** time ✓ · tsc clean + `bun test` green with
the mapping/grouping **pure and tested without a DB** ✓.

---

## Original blocker analysis (2026-08-01, preserved — this is why the task looks like this)

### ⛔ The blocker in one line
**There are no `bo.movement` rows with `refType:"SALE"` for this map to attribute, and the field it keys on
(`bo.item.externalRef`) does not exist.** Built as specced, `revenue-by-activity` returns
`{ totalMinor: 0, buckets: [], unattributedMinor: 0 }` — and **`buckets + unattributed === total` passes**,
because 0 + 0 === 0. The DoD's correctness check is satisfied by an empty report. That is the failure the
`unattributed` bucket exists to prevent, one level up: §3 stops us silently dropping what we *can't classify*,
but nothing stops us silently reporting nothing *to* classify. An executive would read "฿0 revenue".

I stopped and brought this to you rather than shipping a green, empty, technically-correct report.

### The evidence — three independent breaks, all traced in code
**1. The sale-posting path is dead.** `recordSale` (`smart-scheduler-back/src/lib/ops-client.ts:112`, the line
SPEC-021 cites) POSTs to `/api/v1/catalog/items/by-ref/movements`. That route is defined in backoffice-back's
`src/routes/catalog.ts:27` — and **nothing imports `catalogRoutes`**. `src/routes/api.ts` mounts `/auth` and
`/bo` only, with its own comment saying the `ops.*` routes are **retired** because "those routes would 500".
So the POST 404s, `opsMovementByRef` returns `{ok:false, skipped:"ops 404"}`, and both call sites are
`void recordSale(...)` — **best-effort by design, so it fails silently**. No SALE row has been written since the
REQ-006 rebuild (TASK-027).

**2. Even when it was alive, it didn't write `bo.movement`.** That route's service writes **`ops.stock_movements`**
(`inventory.service.ts:260`, `refType: input.refType ?? "SALE"`). `db/migrate-to-bo.ts` was a **one-shot backfill**
(ops → bo, carrying `refType` at `:111` and mapping ops `externalRef` → bo **`ownerRef`** at `:78`) — not a
standing bridge. So any SALE rows in `bo.movement` are historical residue of that one run, not a live feed.

**3. `bo.item` has no `externalRef` column.** It has `ownerRef` + `externalSource` (`db/schema.ts:479-500`).
And the only INCOME items ever seeded are **`first-trial` / `single-session`**, into **`ops.catalog_items`**
(`db/seed.ts:92-112`). **`course-{size}` and `voucher-{hours}` items are created nowhere** — so those two
`recordSale` calls (`scheduler.service.ts:697` / `:751`) would have no-op'd on item-not-found *even before* the
route was unmounted. The two product codes carrying the most revenue are exactly the two that never had an item.

### What I checked so this isn't a dead end I'm handing you
- **Is revenue derivable from `public` instead, dodging `bo` entirely?** **No.** `public.course_packages` carries
  only `size`, `vouchers` only `totalHours` — **neither stores a price** (`smart-scheduler-back/src/db/schema.ts:248-282`).
  Money exists solely in backoffice (`bo.item.unitPriceMinor` × movement qty → `valueMinor`). So the dependency
  on `bo.movement` is real and there is no second source. The spec's read-side design is not the problem.
- **Does scheduling-back write `bo` directly anywhere?** Yes — but only the freelance ceiling
  (`refType: "BOOKING"` / `"BOOKING_REVERSAL"`, via Drizzle on the shared DB, `scheduler.service.ts:115-137`).
  **Sales are the one flow still going over the retired HTTP hop.** That's the asymmetry that hid this.

### My recommendation (yours to take or overrule)
**SPEC-021's design stands — derive by joining, one map, honest `unattributed`. Only its input is broken.**
Sequence it as two pieces, because they're different scopes:

- **(A) Repair the sale write path first** — sales must land in `bo.movement` with `refType:"SALE"`, written the
  same way the freelance ceiling already is (direct Drizzle on the shared DB), which also deletes the last
  dependency on the retired `ops` HTTP route. This is a **REQ-006 rebuild regression**, it touches
  **scheduling-back's write path**, and it needs `course-{size}` / `voucher-{hours}` INCOME items to exist in
  `bo.item` with prices. **None of that fits SPEC-021's "no migration, read-only, backoffice-only" envelope** —
  so I'm not doing it under this task, and the pricing part is a คุณปุ้ม question, not ours.
- **(B) Then TASK-064 as written**, keyed on whatever (A) settles.

⚠️ **And one expectation to reset now, because it's in the REQ:** SPEC-021 sells *"retroactive coverage — every
historical sale is attributed too"*. **That is not achievable.** Repairing (A) attributes sales **going forward**;
the past is limited to whatever the one-shot backfill carried, and per break 3 that can't include courses or
vouchers, because those items never existed. Worth saying to Porter before คุณปุ้ม sees a month with a
suspiciously small number in it.

### Not done
No code written, no files touched in `smart-scheduler-backoffice-back`. `tsc`/`bun test` unchanged from TASK-030.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

### 🔴 Q1 (blocking) — do I wait for the write path, or ship the read side over an empty table?
Two honest options; **I recommend (a)**:
- **(a) Hold TASK-064 until the sale write path is repaired** under its own REQ/TASK. The report then means
  something the day it ships. Cost: TASK-065 (Fern) stays blocked longer.
- **(b) Build the read side now** against `bo.item.ownerRef` (the backfill's key) so the endpoints and the FE
  screen exist, accepting they read ~฿0 until (A) lands. Cost: we ship a finance report that is **wrong in the
  most dangerous direction** — under-reporting, silently, with a passing sum check. If you want this, I'd want
  the endpoint to return an explicit "sale attribution is not yet wired" signal rather than a clean zero, so the
  screen can't be mistaken for a real month.

### 🔴 Q2 (blocking, and it decides the map's key) — what does the map key on?
`bo.item` has **no `externalRef`**. Either:
- **`ownerRef`** — exists today, is what the backfill wrote, **no migration**; but it's currently used for the
  *teacher id* on freelance items, so it'd be doing double duty; or
- **add `external_ref` to `bo.item`** — a migration **in our own `bo` schema**, which we own outright, so it
  breaks no ownership rule (and I'd hand-author + journal-register it per the TASK-042 rule, no `db:generate`).

I lean **add the column**: one field, one meaning. But this is a schema call and it's yours.

### 🚧 Q3 — DATA REQUEST (for you to route up; I can't run SQL)
Only the human can tell us whether the historical residue is worth anything. Two counts:
1. `bo.movement` rows with `ref_type = 'SALE'` — **how many, and what date range?**
2. For those rows, their item's **`owner_ref`** values (distinct, with counts) — i.e. which product codes, if any,
   actually made it through the backfill.

If (1) is 0, break 1 is confirmed end-to-end and option (b) above is definitively off the table. If it's non-zero,
we at least know what a "retroactive" report could honestly cover.

### The pre-answers you left me — both noted, neither affected
- **A fourth product code:** none found. The four in your table are the only codes `recordSale` is ever called
  with (`ops-client.ts:99-101` for trial/single, `scheduler.service.ts:697`/`:751` for course/voucher). I checked
  precisely because you asked me to flag one rather than let it fall silently.
- **Voucher revenue stays `unattributed` for now.** Recognising it per session as it's consumed would change
  *when* revenue is recognised — a finance decision that's with @Porter → คุณปุ้ม. Don't pre-build it.
- If a fourth product code shows up that I haven't listed, **flag it** — it must map explicitly, never fall
  silently into `unattributed`.

## Review / Answers
**You were right to stop, and this is the best catch of the day. I verified both load-bearing claims myself:**
`catalog` is mounted **nowhere** in `api.ts` or `index.ts` (so the sale POST 404s), and `bo.item` has
`ownerRef` + `externalSource` and **no `externalRef`** (`schema.ts:479-500`).

**Two of the three breaks are my errors, and I want them recorded as mine:**
1. **I invented `bo.item.externalRef`.** I read `recordSale(externalRef, …)` in `ops-client.ts` and assumed the
   name described the *destination* field. It describes the **ops** `catalog_items` key — a schema we retired.
   I asserted a column from a function signature instead of opening the schema, which is exactly what I tell
   you two not to do.
2. **"Retroactive coverage — every historical sale is attributed too" is not achievable**, and it was a
   *selling point* of my design. Repair attributes sales **going forward**; the past is limited to the one-shot
   backfill's residue, which per your break 3 cannot include courses or vouchers because those items never
   existed. **I've corrected SPEC-021 in place** — that claim was the one most likely to be repeated to
   คุณปุ้ม and then contradicted by a small number on a screen.

**The framing I'm taking upward is bigger than this task.** Sales have not been recorded **since the REQ-006
rebuild (TASK-027, deployed 2026-07-28)**, and nobody noticed — because both call sites are `void
recordSale(...)`, best-effort by design, so the failure had no voice. **That is the third instance of one
failure mode this week**: two scheduled jobs never registered, a digest that would have died silently, and now
revenue quietly not posting. The fix isn't only to repair the pipe; it's to make its silence impossible.

### 🔴 Q1 → **(a) Hold. Do not build the read side yet.**
Agreed, and not a close call. A finance report that reads **฿0 with a passing sum check** is wrong in the one
direction that can't be caught by looking at it — and your own observation is the clincher: my `unattributed`
rule stops us dropping what we *can't classify*, but nothing in it stops us reporting nothing *to* classify.
Shipping (b) would put a green, empty, technically-correct revenue screen in front of an executive.
**TASK-064 stays IN_PROGRESS-blocked; TASK-065 stays blocked behind it.** Fern has TASK-063 and isn't idle.

### 🔴 Q2 → **Add `external_ref` to `bo.item`.** One field, one meaning.
`ownerRef` already means *teacher id* on freelance items. Overloading it with product codes gives one column
two meanings distinguished only by which query you're reading — the kind of thing that is obvious to whoever
wrote it and invisible to everyone after. `bo` is **ours outright**, so a migration there breaks no ownership
rule. **Hand-author it and register it in `drizzle/meta/_journal.json` per the TASK-042 rule — no `db:generate`.**

### 🚧 Q3 → **Routed to @Porter** (I can't run SQL either; this needs the human). Both counts requested.

### What happens next — I've cut the work rather than leaving it as a finding
- **TASK-066** (yours, scheduling-back): repair the write path — direct Drizzle `bo.movement` write like the
  freelance ceiling already does, killing the last dependency on the retired `ops` HTTP hop; the
  `external_ref` migration; and the missing `course-{size}` / `voucher-{hours}` INCOME items.
- **TASK-067** (yours, small): an **8th attention check** so this can never be silent again.
- **TASK-064 resumes** once TASK-066 lands, keyed on `external_ref`.

**Your two pre-answers are both accepted:** no fourth product code (you checked because I asked you to flag one
rather than let it fall silently — thank you), and voucher revenue stays `unattributed` pending คุณปุ้ม.

---

### Re-review after the unblock — **DONE ✅ (Sober, 2026-08-01)**
`bunx tsc --noEmit` → **0**; `bun test` → **71 pass / 0 fail** (my own run, up from 48).

- **The sum identity is tested the way it needed to be** — not just "it adds up", but adds up across **all three
  ways a sale can be unattributable**: a voucher, an **unresolved `refId`**, and an **unknown product code**
  (`revenue-attribution.test.ts:97-105`), plus the two extremes (everything unattributed; nothing unattributed).
  That's the difference between asserting an invariant and asserting it *survives the interesting inputs*.
- **`unattributedReason` names the composition** ("1 vouchers…") rather than being a generic label — so the
  screen can tell an executive *why* the gap exists, which is the whole point of not hiding it.
- **The `public` declarations are better than I specced.** You declared **only the columns the join needs** and
  wrote the reason down: *"a narrow declaration can't tempt anyone into writing through it, and it won't drift
  when scheduling-back adds a column."* I asked for read-only; you made it read-*narrow*, which is the stronger
  version. The `pub*` prefix also makes a mistaken write visible at the call site.
- **One map, both reports** — the customer-spend grouping reuses the same attribution, so the two screens
  cannot disagree about a month.

### Your two API calls — both accepted
1. **`adminAuth` on both new endpoints.** Correct, and it's the protective reading: REQ-014 is explicitly
   executive-only, and customer-spend pairs a **child's name with what their family paid**. That's the most
   sensitive join in the product; it should never have been a "reads are open" default.
2. **`month` required, no server-side default.** Right — a report whose window is implicit is a report two
   people read differently. Consistent with TASK-062.

### 🔴 The neighbour you flagged is a real security gap, and it invalidates REQ-014's stated premise
**`GET /bo/reports/pl` has no `adminAuth`** (`bo.ts:44`) — I verified: every write is guarded, all reads are
open, by the deliberate legacy comment *"reads open (like the old ops GETs)"*. For item lists that was a
defensible choice. **For the P&L it isn't**: REQ-014's access-control answer is *"finance is executive-only
because it lives on the backoffice"*, and that is **false at the API level** — the protection is the frontend
login, not the API. Anyone who can reach :4010 can read the business's profit and loss without a token.

**You were right to flag it and not touch it.** I've cut **TASK-068** to close it, and I checked the thing that
would have made it risky: backoffice-front attaches the JWT in an **axios interceptor on every request**
(`lib/api/client.ts:27-28`), so guarding the reads breaks nothing.

**TASK-064 → DONE. @Fern: TASK-065 unblocked.**
⏳ **Expectation to carry into acceptance (yours, and it's right):** correct reports can still only report what
was posted — **฿0 with an empty split until TASK-066 is deployed** and `sale:ensure-items` has run, then
forward-only. That is the report working, not failing.
