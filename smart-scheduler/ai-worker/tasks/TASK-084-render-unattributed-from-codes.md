# TASK-084: backoffice-front (:3018) — render `unattributed` from codes, in Thai
- Source: SPEC-021 (REQ-014) — the FE half of TASK-083
- Status: DONE  (reviewed 2026-08-01 by Sober — type declares only the new shape, both deprecated fields free to delete; expected-vs-fault carried by wording + colour + weight and **measured** not asserted; both sum identities verified from the screen; red-mismatch path forced deliberately; tsc 0 / build ok)
- Depends on: **TASK-083** (DONE — `unattributed.reasons` is live)
- Assignee: @Fern (smart-scheduler-backoffice-front, port 3018)

## What to do
You flagged that `unattributedReason` is English prose on a Thai executive's screen, and refused to parse it.
Jason has replaced it: the API now returns

```
unattributed: { totalMinor, reasons: [{ code: "VOUCHER" | "UNRESOLVED_REF" | "UNKNOWN_CODE", count, amountMinor }] }
```

- **Render each reason from its `code`, with your own Thai wording**, plus the count and the amount. The amount
  is why it's worth showing per reason: *"2 รายการอ้างอิงไม่พบ"* doesn't say whether to care; **"…, ฿4,000"**
  does.
- **Read `unattributed.totalMinor`** and drop `unattributedMinor` / `unattributedReason` — both are
  `@deprecated` and Jason deletes them **once this lands**, so tell me when it does.
- **The reconciliation line stays exactly as it is** — it's the best thing on that screen. Just source the
  number from the new field.
- ⚠️ **Keep the three codes visually distinct in meaning:** `VOUCHER` is **expected** (a voucher genuinely has
  no sport), while `UNRESOLVED_REF` and `UNKNOWN_CODE` are **faults**. The API returns them in that order for
  exactly that reason. A reader should be able to tell "this is fine" from "someone should look at this"
  without reading the numbers.
- **An unknown code deserves the strongest wording of the three** — it means we posted revenue against a
  product code the report doesn't recognise.

## Definition of Done
- [ ] Each reason renders from its code in Thai, with count and amount.
- [ ] No deprecated field is read any more; the reconciliation line still holds and still flips red on mismatch.
- [ ] The expected case is visually distinguishable from the two faults.
- [ ] An **empty** `reasons` array renders nothing (not a "0 รายการ" row) — that's a clean month.
- [ ] `bunx tsc --noEmit` clean; `bun run build` succeeds — and say what the panel read for each code.

## Implementation Notes — Fern 2026-08-01

### ✅ Both deprecated fields are gone — **`unattributedMinor` and `unattributedReason` are safe to delete**
The FE type no longer declares either. `unattributed.totalMinor` feeds the row, the bar and the reconciliation
line; `unattributed.reasons` feeds the detail. **Nothing in this repo reads the deprecated fields any more** —
delete them whenever you like.

### Wording, and why each one reads the way it does
One row per code, each carrying **count AND amount** — you were right that the amount is what makes it
actionable; *"2 รายการอ้างอิงไม่พบ"* doesn't tell you whether to care, *"…· ฿405"* does.

| code | Thai | tone |
|---|---|---|
| `VOUCHER` | วอยเชอร์ — เป็นชั่วโมงรวม ไม่ผูกกับกีฬาใดกีฬาหนึ่งตั้งแต่ตอนขาย **(ปกติ)** | calm grey |
| `UNRESOLVED_REF` | อ้างอิงรายการขายไม่พบ — **ควรตรวจสอบ** | amber |
| `UNKNOWN_CODE` | ⚠️ รหัสสินค้าไม่รู้จัก — มีการบันทึกรายได้ด้วยรหัสที่รายงานนี้ไม่รู้จัก **ต้องตรวจสอบ** | red, bolder |

The distinction is carried **three ways at once** — the wording itself (`(ปกติ)` vs `ควรตรวจสอบ` vs
`ต้องตรวจสอบ`), the colour, and the weight — so it survives a reader who is skimming, and it doesn't depend on
colour alone.

**Unknown codes render raw** (`รหัสเหตุผลที่ไม่รู้จัก: <code>`) rather than being dropped, per your note: on a
money screen a visible unknown beats a silent omission.

### Browser check — localhost:3018 (verified first), scratchpad stub, nothing real contacted
**Month with all three codes (`2026-07`)** — the panel read, in order:
- `วอยเชอร์ — … (ปกติ) · 3 รายการ · ฿1,800`
- `อ้างอิงรายการขายไม่พบ — ควรตรวจสอบ · 2 รายการ · ฿405`
- `⚠️ รหัสสินค้าไม่รู้จัก — … ต้องตรวจสอบ · 1 รายการ · ฿200`

฿1,800 + ฿405 + ฿200 = **฿2,405**, which is exactly `unattributed.totalMinor`, and the reconciliation line still
read `฿9,595 + ฿2,405 = ฿12,000` with the green badge.

**I measured the visual distinction rather than asserting it** (`getComputedStyle`, same technique as TASK-081):
`rgb(139,144,153)` weight 400 → `rgb(232,162,61)` weight 400 → `rgb(224,49,49)` weight **500**. Expected reads
quiet; the two faults escalate.

**Clean month (`2026-05`, real sales, nothing unattributed):** **zero reason rows rendered** and **no "0 รายการ"
row** — checked by counting the `<li>`s (0) and grepping the page for `0 รายการ` (absent). The
`ยังไม่ระบุกีฬา` row itself still shows ฿0 / 0.0%, which TASK-065 requires (never conditional on being
non-zero); it's only the *reasons list* that disappears.

**Red guard, forced deliberately (`2026-04`, buckets ฿4,000 + unattributed ฿1,000 vs a claimed total of
฿9,000):** the badge flipped to **filled red** reading **"⚠️ ไม่ตรงกับยอดรวม ฿9,000"** (`rgb(250,82,82)`). The
mismatch path is exercised, not just written.

`bunx tsc --noEmit` **clean**; `bun run build` **succeeded**.

### Limit
Still **no live round-trip** — the stub serves your exact contract shapes, but confirming a *real* month's
`sum(reasons.amountMinor) === unattributed.totalMinor` is deploy smoke on the backoffice.

## Questions
(Fern asks; Sober answers as `> answer: ...`)
- Wording is yours — you wrote the current Thai explanation and it was better than the API's.
- If a code arrives that you don't have a label for, render the raw code rather than hiding the row. **A visible
  unknown beats a silent omission** on a money screen.

## Review
(Sober fills at REVIEW.)
**Verdict: DONE ✅ (Sober, 2026-08-01).** `tsc` 0 (my run). The response type declares **only**
`unattributed: { totalMinor, reasons }` — neither deprecated field is declared or read. (`unattributedMinor` at
`RevenueContent:123` is a **local alias** for `unattributed.totalMinor`, not the API field.)
**@Jason: both mirrors are free to delete.**

**You carried the expected/fault distinction three ways at once** — wording (`(ปกติ)` · `ควรตรวจสอบ` ·
`ต้องตรวจสอบ`), colour, and weight. That's the right instinct for two reasons: it survives a reader who is
skimming, and **it doesn't depend on colour alone** — which matters on a screen one person looks at, in a
country where nobody is going to file an accessibility ticket about it.

**And you measured the distinction instead of asserting it** (`getComputedStyle`, the technique you established
on TASK-081): grey/400 → amber/400 → red/**500**. The escalation is now a number in a task file rather than an
adjective, and the next person changing that panel can tell whether they broke it.

**Three checks that show you understood what each requirement was protecting:**
- **฿1,800 + ฿405 + ฿200 = ฿2,405 = `unattributed.totalMinor`** — you verified the *second* sum identity from
  the screen, not just the first. That's the one Jason built by construction; you confirmed it survived the
  trip.
- **Clean month: zero reason rows, and you checked for the absence** (counted the `<li>`s, grepped for
  "0 รายการ") — while correctly keeping the `ยังไม่ระบุกีฬา` row at ฿0, because TASK-065 requires it never be
  conditional. Two rules that point opposite ways, both honoured.
- **You forced the red guard** with a deliberately inconsistent month and confirmed it flipped. **The mismatch
  path is the entire reason that badge exists**, and it's the one nobody ever exercises because it needs data
  that shouldn't happen.

**Unknown codes render raw rather than being dropped** — as asked, and it matters: on a money screen a visible
unknown beats a silent omission.

**TASK-084 → DONE. REQ-014 is complete end to end.** ⏳ Deploy: backoffice-front. **Smoke:** open a real month
and confirm the reason amounts sum to the unattributed total — the one thing your stub can't prove.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-084 | backoffice-front (:3018): render `unattributed` from **codes with Thai labels**; deprecated fields dropped | SPEC-021 | ✅ **DONE** (Sober 2026-08-01 — type declares only the new shape ⇒ **@Jason's two mirrors are free to delete**. Expected-vs-fault carried **three ways at once** (wording `(ปกติ)`/`ควรตรวจสอบ`/`ต้องตรวจสอบ`, colour, weight) so it survives a skimming reader and **doesn't depend on colour alone** — and she **measured** it (grey/400 → amber/400 → red/**500**) rather than asserting it. Verified the **second** sum identity from the screen (฿1,800+฿405+฿200 = ฿2,405) and **forced the red-mismatch badge deliberately** — the path that exists for data that shouldn't happen and therefore nobody exercises; tsc 0 / build ok) | Fern | TASK-083 |
```
