# TASK-065: backoffice-front (:3018) — revenue-by-activity + customer-spend screens
- Source: SPEC-021 (REQ-014)
- Status: DONE  (reviewed 2026-08-01 by Sober — percentages of `totalMinor` not of the attributed subset (proven numerically: sums to exactly 100.0%), reconciliation **stated on screen** with a badge that flips red on mismatch, own Thai explanation not reliant on the API string; tsc 0 / build ok. Gap 2 → TASK-083)
- Depends on: **TASK-064**
- Assignee: @Fern (**smart-scheduler-backoffice-front, port 3018** — not the frontoffice)

## What to do
Two report screens on the **backoffice** (already executive-only via its own login — no role code, nothing to
gate). Follow whatever the existing P&L report screen does; this should look like it belongs.

1. **Revenue by activity** — month picker → total, plus the split by sport.
2. **Customer spend** — per student: total spend, plus their courses / vouchers / sessions. Searchable.

## ⚠️ The one thing this screen must not do
**Show `unattributed`. Never hide it, never filter it out, never fold it into an "other" that looks like a
rounding error.**

A **voucher has no sport by nature** — generic hours, and its sessions may later be different sports — so it
cannot be attributed and lands there. If the screen shows only the attributable slice, an executive reads a
clean split that **doesn't add up to the month's actual revenue**, and that is the number decisions get made on.

- Show it as its own labelled slice/row with the reason ("vouchers — not attributable to one sport").
- The split **plus** `unattributed` must visibly reconcile to the month total. If you show percentages, they
  must be of `totalMinor` — not of the attributed subset, which would quietly inflate every sport.

Otherwise: render what the API returns, don't recompute money in the browser, TH+EN, and empty months read as
"no sales this month" rather than a broken chart.

## Definition of Done
- [ ] Both screens render from TASK-064's endpoints; **no money arithmetic in the FE** beyond formatting.
- [ ] `unattributed` is **visible and labelled**, and the figures reconcile to the month total on screen.
- [ ] Percentages (if shown) are of the month total, not of the attributed subset.
- [ ] Empty month / no results read as "no data", not as an error.
- [ ] TH+EN; no regression to the existing P&L dashboard or Items CRUD.
- [ ] `bunx tsc --noEmit` clean; `bun run build` succeeds — **and open both screens in a browser**, including a
      month where vouchers make `unattributed` non-zero, and say what you saw.

## Implementation Notes — Fern 2026-08-01

### Shape
One screen, `/revenue`, nav entry **"รายได้แยกตามกิจกรรม"** directly under the P&L dashboard, with two tabs —
**แยกตามกีฬา** (revenue by activity) and **รายลูกค้า** (customer spend) — sharing one **month picker**. Both
reports are the same month viewed two ways, so one picker beats two screens that can disagree about which month
you're looking at. Styling follows `DashboardContent` (the P&L): same hero-figure card, same `thb()` formatter,
same loader/error cards.

**No money arithmetic.** The only computation is a display ratio for the bars, and a **sum of the buckets used
solely to state the reconciliation on screen** (see below) — every figure printed is an API field passed through
`thb()`.

### 🔴 `unattributed` — how it's made impossible to misread
- Its **own labelled row**, `ยังไม่ระบุกีฬา`, in warning colour, with its own bar — never folded into "other",
  never filtered, never conditional on being non-zero.
- The **reason is spelled out in Thai from my own copy** — *"วอยเชอร์เป็นชั่วโมงรวม ไม่ผูกกับกีฬาใดกีฬาหนึ่ง
  ตั้งแต่ตอนขาย"* — with the API's `unattributedReason` appended after it as detail. I did **not** rely on the
  API string alone: it's English prose composed server-side (see the gap below), and the *reason this bucket
  exists* shouldn't be untranslated on a Thai executive's screen.
- **Percentages are of `totalMinor`**, never of the attributed subset. Verified numerically below — this is the
  one that would have silently inflated every sport.
- **A reconciliation line the screen states rather than assumes:**
  `แยกตามกีฬา ฿9,595 + ยังไม่ระบุ ฿2,405 = ฿12,000` with a green **"ตรงกับยอดรวมทั้งเดือน"** badge — and if the
  three ever disagree it flips to a **red filled** badge naming the real total. That's the only place I sum
  anything, and it exists precisely so a mismatch is loud instead of invisible.

### Browser check — localhost:3018, verified before touching anything
⚠️ **This repo has no mock mode** and its API client points at the backoffice server. PROTOCOL keeps me out of
real environments, so **I wrote a throwaway stub server in my scratchpad** (not in the repo) that serves the two
endpoints' exact contract shapes. Nothing real was contacted; the token cookie was a dummy string.

**Month with vouchers (`2026-07`), the case the DoD asks for:**
| Row | Amount | % |
|---|---|---|
| Skate | ฿4,580 | 38.2% |
| Bike | ฿3,125 | 26.0% |
| Onewheel | ฿1,890 | 15.8% |
| **ยังไม่ระบุกีฬา** | **฿2,405** | **20.0%** |
| **Total** | **฿12,000** | **100.0%** |

**The percentages sum to exactly 100.0%** — which is the proof they're of the month total. Had I divided by the
attributed subset, Skate alone would read **47.7%**. The reconciliation line showed
`฿9,595 + ฿2,405 = ฿12,000` with the green badge. The reason line rendered in Thai followed by the API's
*"3 vouchers (generic hours — no sport at sale)"*.

**Empty month (`2026-06`):** reads **"ยังไม่มียอดขายในเดือนนี้"** — a sentence, not a broken chart.

**Customer spend:** three rows with courses / vouchers / sessions split out and the spend right-aligned
(น้องพีพี 1/0/0 ฿4,790 · น้องมิ้น 0/1/2 ฿1,350 · น้องเอิร์ธ 0/1/0 ฿1,055). Typing **"มิ้น"** narrowed **3 → 1**
(server-side, `q` is in the query key). A no-match search reads **"ไม่พบลูกค้าที่ตรงกับคำค้น"**, deliberately
worded differently from the empty-month message so "your filter found nothing" never looks like "the month was
empty".

**No regression:** P&L dashboard and Items/Tags nav unchanged; nav now reads
`งบกำไร–ขาดทุน → รายได้แยกตามกิจกรรม → รายการ (Items) → แท็ก`. No console errors.

### ⚠️ Two gaps I am flagging rather than filling
1. **"TH+EN" is not achievable in this repo as it stands.** `smart-scheduler-backoffice-front` **has no i18n
   layer at all** — no `lib/i18n`, and every string in the P&L screen, the nav and Items is hardcoded Thai. I
   matched the repo (Thai), because the task also says *"this should look like it belongs"* and adding an i18n
   layer to a whole repo is a much larger change than these two screens. **If EN is genuinely wanted on the
   backoffice, that's its own task** — say the word and I'll scope it; I'd rather not bolt a half-i18n onto one
   screen and leave the rest Thai.
2. **`unattributedReason` is English prose from the API** (`"3 vouchers (generic hours — no sport at sale)"`).
   I show it as supporting detail *after* my own Thai explanation, so the screen is comprehensible without it —
   but on a Thai executive's screen it will read as a stray English string. Same shape as the TASK-063 lesson
   (label from the FE by stable key, not the API's hardcoded text). **Fixing it properly means the API returning
   reason *codes* + counts instead of a sentence** — a BE change, so I'm flagging rather than parsing prose.

### Limit
**Not exercised against the real API.** Field names and types are read from `revenue-attribution.ts` and
`bo.ts` routes and match, but no live round-trip happened. Worth confirming on the deployed backoffice —
especially that a real month's `unattributedMinor` genuinely reconciles, since that's the whole claim.

`bunx tsc --noEmit` **clean**; `bun run build` **succeeded** (`/revenue` in the route list).

## Questions
(Fern asks; Sober answers as `> answer: ...`)
- Layout is yours; match the existing backoffice reports. The non-negotiable is that the numbers on screen
  **reconcile** — attributed + unattributed = total.
- If the API doesn't give you something the screen needs, flag it here rather than deriving it locally; money
  derived in two places is money that will disagree.

## Review
(Sober fills at REVIEW.)
**Verdict: DONE ✅ (Sober, 2026-08-01).** `tsc` 0 (my run). `pct = minor / totalMinor` (`RevenueContent.tsx:94`)
— **of the month total, never of the attributed subset**, which was the one thing that would have silently
inflated every sport. Your own numeric proof is the right kind: the percentages sum to **exactly 100.0 %**, and
you stated what the wrong version would have read (Skate 47.7 % instead of 38.2 %). A percentage that can't be
wrong quietly is worth more than one that happens to be right.

**The reconciliation line is better than what I asked for.** I required the numbers to reconcile; you made the
screen **state** it — `฿9,595 + ฿2,405 = ฿12,000` with a green badge that **flips to red and names the real
total** if they ever disagree. That converts an invariant into something an executive can see holding, and it's
the only place you sum anything. Exactly the right amount of arithmetic.

**And you didn't take the API's word for the `unattributed` explanation.** Writing your own Thai sentence
(*"วอยเชอร์เป็นชั่วโมงรวม ไม่ผูกกับกีฬาใดกีฬาหนึ่งตั้งแต่ตอนขาย"*) and appending the API's detail after it means
the screen is comprehensible even if that string is missing or wrong. The two empty states worded **differently**
— "no sales this month" vs "no customer matched your search" — is the same instinct: never let a filter result
look like an empty month.

**On the stub server: correct call, correctly bounded.** No mock mode in that repo and PROTOCOL keeps you out of
real environments, so a throwaway stub in your scratchpad — not in the repo, dummy token, nothing real
contacted — is the honest way to exercise a contract. And you said plainly that no live round-trip happened.

### Your two gaps — both ruled
1. **No i18n in `backoffice-front`: your call is right, keep Thai.** Bolting half an i18n layer onto one screen
   and leaving the P&L, Items and nav in hardcoded Thai would be worse than either consistent option. **If EN is
   genuinely wanted on the backoffice it is its own REQ**, not a rider on a report — and it's Porter's to raise
   with the owner, not ours to assume. I've noted it upward.
2. **`unattributedReason` as English prose is a real gap and you diagnosed it exactly right** — same shape as
   TASK-063's `titleKey` lesson: **the API should supply identity, the FE supplies language.** Parsing prose
   would have been the wrong fix and you refused it. Cut as **TASK-083**: the API returns reason **codes +
   counts**, the FE renders them. Small, and not blocking — your Thai sentence already carries the meaning.

**TASK-065 → DONE. REQ-014's UI is complete.** ⏳ Deploy: backoffice-front. **Smoke, and it's the whole claim:**
open a real month and confirm **attributed + unattributed = total** on screen with the green badge — that's the
one thing the stub can't prove.
