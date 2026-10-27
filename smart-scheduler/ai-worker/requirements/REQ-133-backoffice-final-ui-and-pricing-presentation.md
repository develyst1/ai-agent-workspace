# REQ-133: the back-office FINAL UI (Vite + React) and a pricing-meeting PRESENTATION
- Status: OPEN → with Sober (lead) + Silver, for a plan + size, then build on Porter's GO
- Requested: 2026-10-27 by the owner. Verbatim:
  > *"แล้วทีนี้ฉันจะนัดคุยขวัญ กับพี่ฟีนเรื่องเงิน อยากให้นายทำให้ฉันเข้าใจ ภาพรวม หรือ เข้าใจอะไรบ้างที่ต้องเข้าใจ แล้วทำ backoffice final version ui using vite หรืออะไรก็ได้ ที่สวยกว่า และดูจริงจังกว่า html ธรรมดา ก่อนจะนำไปทำ front จริงๆ ด้วย next แบบเดิมกับ frontoffice แล้ว ทำ spec presentation แบบ ดูง่าย สวย ไม่ใช่แค่ html ทำเป็นvite หรือ react ก็ได้ เพื่อให้นำมา ประชุมเกี่ยวกับราคาได้ ง่าย และสวยงาม การใช้งานต่างๆ เป็นยังไงได้ เรื่องอะไร บ้าง การคิดเงินเราคิดยังไง และมี option ให้เขาเลือก แบบ option A B C"*
- The owner's briefing (Porter's part, done): `BRIEF-owner-backoffice-money-meeting-2026-10-27.md`.

## Deliverable 1: back-office FINAL UI (the agreed screens, built properly)
- **Stack:** Vite + React + TypeScript + **Mantine** (the same UI library as the front office). Screens and components should carry over to the real Next.js build with little rework.
- **Content:**
  - every screen Khwan agreed on v3 (REQ-122 §8–§10; `project-docs/customer-2026-10-22-backoffice-prototype-v3/`);
  - **all her v3 notes applied** (words, formats, the per-item discount, commission lower-or-raise, My slip = Payment Detail, the Excel/PDF export button).
  - It replaces the "v4" that was skipped.
- **Look:**
  - visibly a real product, not a mock-up, and consistent with the live front office (SOM SCHEDULE): the same shell, fonts and colours;
  - realistic mock data, Thai names, no real children's names;
  - clickable navigation, dialogs and filters;
  - **no backend, no network calls.**
- **Roles:** a switcher (CEO / Admin / Coach) so the meeting can see what each person sees (R0).
- **Front-office screens (F1–F6, Confirm camp)** marked plainly as front office.
- **Delivery:** a static build that opens offline in the meeting. Ideally one file or one folder the owner can open or zip. The SA decides how.

## Deliverable 2: the pricing-meeting PRESENTATION (Vite + React)
- **Audience:** ฟีน (CEO) + Khwan. **Thai**, easy to read, clean, slide-by-slide (keyboard / click), and works offline.
- **Sections:**
  1. what the new back office does: the 5 parts in plain words;
  2. how it's used: a short day-in-the-life per part, with screenshots or live embeds from Deliverable 1;
  3. what's agreed (the spec is closed; rules confirmed by Khwan);
  4. **how the price is calculated:** the same rate as the 73,000 package (≈ 263 ฿/d) × 149 d ≈ 39,200 ฿; what's included free;
  5. **Options A / B / C** (comparison table + timeline);
  6. timeline and delivery order (Stock first);
  7. what we need from them (go-live date, data list).
- **Numbers come from ONE data file** (e.g. `pricing.ts`), so Porter / the owner can change them without touching slides. **The option numbers are PENDING the owner's OK.** Porter's proposal is in the BRIEF §4; Porter sends the final numbers.
- **No internal-only data on slides:** no SA names, task numbers or engineer-day breakdowns beyond what the BRIEF §3 says to the customer.

## Constraints
- **Where:** the SA picks the folder/repo (logical name in `machine.local.md`; Porter asks the owner if a new path is needed).
- **No git** unless the owner says it.
- **No customer data.**
- **Tanya checks both before the owner sees them:** opens offline, 0 console errors, every page reachable, Thai text OK, no dead buttons.

## Asked of the SAs (first answer: plan + size, NO build yet)
- **Sober (lead):**
  - the Vite shell, Salary, R0 / roles, the front-office pages, and the presentation app;
  - one plan + size for both deliverables.
- **Silver:** Revenue, Stock, Reports pages (the same split as v3).
- **Reply in `inbox/PM.md`:**
  - the size per team;
  - the earliest date it can be ready (the owner is setting a meeting);
  - anything to confirm with the owner;
  - the Options A/B/C day split, per the BRIEF §4. Check the module shares, and firm up option B's range (which front-office items depend on Salary).

## 2026-10-27: plans + GO
- Team A ≈ 9.0 d (843 shell · 844 Salary · 845 Notify + FO · 846 deck). Team B ≈ 7.8 d (751 Revenue · 752 Stock · 753 Reports / data / roles).
- Dates: deck ≈ Fri 10-30; both ≈ Mon 11-02 (Team B all pages Fri 11-06, meeting-ready 11-09).
- Options firmed (BRIEF §4.1): A 39,200 · B 25,700 · C 11,900 · Salary later 13,500.
- Folder: `som-balance-backoffice-spec/final-ui` + `/pricing-deck`, single-file offline builds.
- Open for the owner: the meeting date · the B variant · show the +5 d or not.

## Owner, 2026-10-27: NO options, everything, in installments
- Verbatim: *"ไม่เอา option ดีกว่า เอาเป็น all แต่ผ่อนจ่ายได้"*.
- **The deck shows ONE offer:** all 5 parts, 39,200 ฿, payable in installments. **No A/B/C table.**
- The installment slide is in `pricing.ts`. Porter's proposal:
  - by delivery: (1) Stock + roles ≈ 11,900 · (2) Revenue + front office ≈ 13,800 · (3) Salary + F3/F4/F6 ≈ 13,500;
  - alternative: 3 monthly ≈ 13,070.
  - PENDING the owner's pick.

## Owner OK, 2026-10-27 (*"โอเค"*)
- Installments by delivery: 11,900 / 13,800 / 13,500. The extra ≈ 5 d is included free (price stays 39,200). The meeting date is TBD.

## 2026-10-27: Deliverable 2 (the deck) DONE
- TEST-127 PASS after one fix round. md5 `056a00b466fced49741c0c3fbd6cb9a5`, 12 slides, sent to the owner.
- The screenshots are v3-based (invented names). Swap them for final-UI shots when Deliverable 1 lands (≈ 11-09), if the owner wants.
