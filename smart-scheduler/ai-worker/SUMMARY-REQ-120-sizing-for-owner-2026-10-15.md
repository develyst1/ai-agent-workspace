# SUMMARY for the owner: REQ-120 back-office rebuild, sized (@Porter, 2026-10-15)
**Inputs** (read-only, no TASK cut, no money opinions):
- `SIZING-REQ-120-revenue-frontoffice-2026-10-15.md` (@Silver);
- `SIZING-REQ-120-salary-stock-2026-10-15.md` (@Sober).

**Unit:** **engineer-days**, the SA's own estimate + 10%. Covers build + tests + mutation sets. **Not included:** SA verification, QA (Tanya), deploys, UAT, entering her data, and the §4 reports.

## 1. The numbers
| part | engineer-days | sized by |
|---|---|---|
| R0 roles · per-person notifications · English labels | 14.9 | Silver |
| F1–F6 front-office changes (branch · payment record · multi-role/STAFF · first coach + trial/renewal links · "No Teacher" · coach web users) | 36.9 | Silver |
| R2 Revenue | 29.2 | Silver |
| R1 Salary | 42.9 | Sober |
| R3 Stock | 33.1 | Sober |
| C1 (a) **bridge**: keep `bo.*`, add columns beside each movement | +3.3 | Silver |
| C1 (b) **replace**: move all 11 scheduling write points in one release | +16.5 | Silver |
| **TOTAL** | **≈ 160 (bridge) · ≈ 173 (replace)** | |

**Rough calendar (Porter's arithmetic, not an SA estimate):** the desk has 4 engineers (Jason, Fern, Bob, Fanta). 160 ÷ 4 ≈ 40 working days if every hour could run in parallel. The dependencies below will not allow that, so plan for **about 2–3 months**, plus QA and UAT.

## 2. The order the work forces
1. **Decisions** (§3).
2. **R0.1 + F6:** real users and roles, coach web users. **Also close C5**: the back office's `admin/admin` fallback.
3. **C1** (bridge or replace).
4. **First usable slices, which can start early:**
   - **Stock ≈ 13 d:** her catalogue, Stock In, the Excel import, balance per location. Needs only R0.1.
   - **Salary ≈ 21 d:** a real slip she can confirm, with base pay and the manual lines (OT · Merit · Transportation · Other), the pay run, the 12:00 auto-lock and the itemised slip. Needs R0.1–R0.3 + F6, **not** F3/F4.
5. **F1 + F2** (branch, payment record) **before Revenue** → R2.1–R2.5.
6. **F3 / F4 / F5 before** FL pay and Extra Hour (F3) and before the bonuses (F4).
7. **SALES RECORD before commission.** Commission also waits for **O12**.
8. R0.4 (notifications) before the pay notices and Low Stock.
9. §4 reports last.

## 3. Decisions only the owner can make (before build)
| # | decision | why it matters |
|---|---|---|
| D1 | **C1:** bridge (+3.3 d) or replace (+16.5 d) | replace touches the booking transaction and every sale posting in one release |
| D2 | **The whole back office in English?** (R0.5) | Khwan asked for English labels |
| D3 | **Camp "confirm":** camp has no confirm step today; R2.2 counts camp revenue "at confirm" | needs a rule, or a new step |
| D4 | **Payment record:** required on every confirm? Partial payments? | F2 shape |
| D5 | **Cut-over rule:** go-live date; what happens to sales already posted at SALE before it | 🔴 **double counting** risk |
| D6 | **History before go-live** has no payment, branch or trial link, so no bonus without a manual back-fill. Accept that? | 🔴 cannot be restated |
| D7 | **Scope / money / timeline with the customer** | the owner's (Option C was 73,000 ฿ for "simple stock") |

## 4. Still needed from Khwan (small)
- **O12:** the commission group of Miller helmets (draft `COPY-DRAFT-khwan-o12-miller-helmet-2026-10-15.md`).
- **Her real Excel stock sheet**, before the import is built (Sober).
- **Pay-period examples for February and 31-day months** (Sober).

## 5. Other risks the SAs flagged
- **Which coach rate wins:** today's stored per-session rates, or the new per person × class type?
- The back-office back has **no job runner and no file storage** (Monday Low Stock, pictures).
- The back-office front has **0 tests**.
- **F3 touches the booking transaction.**

## 6. Owner ruling (2026-10-15) and the customer page
**Owner, verbatim:** *"D 1ถึง D 6อ่ะกูไม่รู้เรื่องอะไรเลยแต่ D 7อ่ะ … ต้องให้เห็นว่ามันสโคปงานมันเยอะกว่าแบบเดิมไปขนาดไหนแล้วก็คิดเป็นวันแล้วก็เอาวันมาคิดเป็นเงินมาแจ้งเขาวันละ 1,000 · D1-D6 ถามเขาเพิ่มได้นะ ว่าระหว่าง ผลลัพท์ แบบนี้ กับ แบบนี้ ต่างกันแบบนี้ จะเอาแบบไหน ให้เขาเห็นว่ามันกระทบ business logic ยังไง"*.
**Pages (split 10-15, owner: *"นายแค่ถามเขาเพิ่มก่อน เรื่องเงิน คุยแยก อย่าเพิ่งส่งเกี่ยวกับค่าบริการเราตอนนี้"*):** the CUSTOMER page `…/backoffice-scope-and-decisions.html` = **Q1–Q5 ONLY, no money**. The price content lives in `…/OWNER-ONLY-backoffice-scope-and-price-DO-NOT-SEND.html`:
- old Option C (73,000, the whole project) vs the new back office (**160 days × 1,000 = 160,000 ฿**), with a per-part table (each part rounded to whole days);
- §4 reports not included;
- 2–3 months;
- first usable slices.

**Questions Q1–Q5 = D2–D6**, each as option A vs B with the business consequence. **D1 is NOT asked** (purely technical, same result for her); the quote uses the cheaper bridge (+3 d).

**Porter's notes for the owner (not on the page):**
- The days exclude QA, deploys and UAT.
- Option C already promised "simple stock". Stock's first slice (≈13 d) is roughly that, if the owner wants to credit it.
