# REQUEST 2026-11-12 · Porter → Sober: ECA Payment, Pending entry + VAT 7% / withholding tax (ขวัญ 18:49)
Her words: CUSTOMER-ANSWERS.md, the 2026-11-12 18:49 line, and `.private/line-20261112-185903.json`. Her 3 example images are not readable by the bot.

1. Create an ECA Payment entry and keep it **Pending** until the money arrives. She knows the amount before she knows the date.
2. Add 2 fields calculated automatically from Amount: **VAT 7%** and **withholding tax**.

Questions:
- Is this new scope, or is any of it already in the ECA Payment page (GR web / BB+BF)?
- Size in days, one line each, SA estimate.
- The open questions, for example the withholding-tax rate and whether Amount includes VAT. I will put them in one pack for her, after the owner's images.

Answer under `## Answer`, then add one line to inbox/PM.md.

## Answer
**Sober (SA, Team A), 2026-11-12. Days only, one engineer, QA excluded.**

**Scope: both asks are new. Neither exists anywhere today.**
- **GR web** (`final-ui` `b/revenue/EcaPayment.tsx`, TASK-891): one form, price/class × Student × Class = Total Amount, with **Payment Date required** (l.43). Revenue counts on that date. There is no status, no Pending, and no VAT or tax field.
- **Real code:**
  - BB has only `ECA` as a revenue category type (`schema-revenue.ts:23`), with no ECA payment route.
  - BF `revenue/eca/page.tsx` is a 5-line stub.
  - The ECA page itself is part of the planned back office. Pending and VAT/WHT are extra on top of it.

**Sizes (SA estimate, real BB+BF):**
1. **Pending entry → Received: 0.75–1 d.** A status field, Payment Date optional while Pending, a «Received» action that sets the date, revenue counted only once Received, a Pending badge and filter in the list, and tests. GR mock version: +0.25 d.
2. **VAT 7% + withholding tax, calculated from Amount: 0.5–0.75 d.** Stored or derived fields, shown on the form and the list, rounding tests. GR mock version: +0.25 d.

**Open questions (one pack for her, after the owner's images). My default comes after each →**
1. Does Amount **include** VAT? → default: **excludes**, so VAT = Amount × 7%. If it includes VAT, VAT = Amount × 7/107.
2. Withholding-tax rate? → default: **3% on the pre-VAT amount** (services). She confirms it, or names 1% / 2%.
3. Which figure counts as revenue: Amount before VAT, the gross with VAT, or the net actually received (after the withholding tax)? → default: **Amount before VAT**.
4. Is VAT on **every** school, or only some (a per-school or per-entry switch)? → default: **every entry**, with no switch.
5. When the money arrives, is the received amount ever different from the Pending amount? → default: she may **edit the amount** at Received.
6. May a Pending entry be deleted? → default: **yes, while Pending**; once Received, only the CEO edits it.
7. Rounding → default: **2 decimals (satang)**, rounded half-up for each field.

## Follow-up (Porter, 2026-11-12 ~20:30): her 3 images, from the owner's screenshots
Saved in `project-docs/customer-2026-11-12-line-images/` (1849-*).
- Image 1 is our own GR ECA Payment page, which is her base.
- Images 2 and 3 are a VAT / withholding calculator she uses as the model:
  - **3 modes, picked per entry:** ไม่รวม VAT (Amount excludes VAT) · รวม VAT (Amount includes VAT, so VAT is backed out) · หลังหัก ณ ที่จ่าย (Amount is the net after WHT).
  - **VAT % and WHT % are editable fields.** The defaults are 7 and 3.
  - **WHT is calculated on the pre-VAT price** ("คิดจากราคาก่อน VAT").
  - **Results shown:** ราคาก่อน VAT · VAT (7%) · ราคารวม VAT · หัก ณ ที่จ่าย (3%) · ยอดหลังหัก ณ ที่จ่าย · ยอดที่ต้องจ่ายจริง.
  - Example (รวม VAT 10,000): 9,345.79 / 654.21 / 10,000.00 / 280.37 / 9,700.00 / 9,719.63.
- **What this settles among your 7 open questions:**
  - Q1: Amount mode → the 3 modes, per entry.
  - Q2: WHT → editable %, default 3, base = pre-VAT.
  - Q4: VAT on every entry? → covered by the mode and the editable %.
  - Q7: rounding → 2 decimals, matching her example.
- **Still open for her:** Q3, which figure counts as revenue. I will ask it with your default (ราคาก่อน VAT). Q5 and Q6 go with your defaults.
- ⚠️ Her example shows ยอดหลังหัก 9,700.00 next to ยอดที่ต้องจ่ายจริง 9,719.63. Please check what each line means from the calculator's own definitions, so that our form doesn't copy a figure we can't explain. If it's unclear, add it to my question pack.
Update the size if it changes, and give one line to inbox/PM.md.

## Answer to the follow-up
**Sober (SA, Team A), 2026-11-12.** I read both calculator images (`1849-vat-wht-calculator-modes.png`, `1849-vat-wht-calculator-example.png`) and recomputed her example with a script (half-up, 2 decimals).

**The two net lines (your ⚠️).** One is right, the other contradicts the calculator's own rule.
- **ยอดที่ต้องจ่ายจริง 9,719.63 is correct.** 10,000.00 (with VAT) − 280.37 (3% of 9,345.79) = 9,719.63. This is the money that actually arrives.
- **ยอดหลังหัก ณ ที่จ่าย 9,700.00 is wrong by the calculator's own label.** It equals 10,000 × 97%, which is 3% taken on the price **with** VAT. The label beside the WHT line says «คิดจากราคาก่อน VAT», and on that base no line comes to 9,700. It is a defect in her calculator; nothing in it explains the figure.
- **Our form shows one net line only: «ยอดที่ได้รับจริง» = ราคารวม VAT − หัก ณ ที่จ่าย.** No 9,700-style line. **For her pack:** *"ยอดที่ได้รับจริงคือ 9,719.63 (ราคารวม VAT − หัก ณ ที่จ่าย 3% ของราคาก่อน VAT) ใช่ไหม? บรรทัด 9,700.00 ในโปรแกรมคำนวณคิด 3% จากยอดรวม VAT ซึ่งไม่ตรงกับที่โปรแกรมเขียนไว้ เราจะไม่ใส่บรรทัดนี้"*.

**How each mode works in our form** (one Amount, a mode, VAT % default 7, WHT % default 3, both editable per entry):
- **ไม่รวม VAT:** ก่อน VAT = Amount; VAT = ก่อน VAT × v; WHT = ก่อน VAT × w.
- **รวม VAT:** ก่อน VAT = Amount ÷ (1+v); **VAT = Amount − ก่อน VAT**, by subtraction, so the two always add up to Amount (her example: 9,345.79 + 654.21 = 10,000.00 ✓).
- **หลังหัก ณ ที่จ่าย:** ก่อน VAT = Amount ÷ (1+v−w). For 9,719.63 that rounds to 9,345.80, and the parts then add up to 9,719.64, which is 1 satang off. **[SA-decided] default: the Amount she typed stays fixed, and the VAT line absorbs the satang.** This is reversible; it is not in her pack.
- Every field is 2 decimals, half-up; this matches her example.

**Size — item 2 changes; item 1 does not:**
1. Pending → Received: **0.75–1 d** (unchanged). GR mock: +0.25 d.
2. VAT + WHT: **0.75–1 d** (was 0.5–0.75). The added cost: the mode is chosen per entry, there are 3 formulas, the 2 rates are stored on each entry, and each mode gets rounding tests. GR mock: **+0.25–0.5 d** (was +0.25).
- **Both items: 1.5–2 d in real code; 2–3 d with the GR mock first.**

**Still open for her:** Q3, which figure counts as revenue (my default: ราคาก่อน VAT), and the net-line question above. Q5 and Q6 go with my defaults, as you said.
