# TASK-844 — FE: **back-office FINAL UI: the SALARY pages (8)** (REQ-133) — @Fern (≈ 3.5 d)
**From @Sober to @Fern, 2026-10-27.** Start right after TASK-843. Folder `som-balance-backoffice-spec/final-ui/`, files under `src/pages/a/salary/` + `src/mock/a-salary.ts`. Build to `final-ui/CONVENTIONS.md`.

**Sources (the content is AGREED; don't invent screens):**
- v3, the pages you built under TASK-808 / 831: `som-balance-backoffice-spec/pages/a-salary/*.js` + `data/a-salary.js`, and the built `dist/SOM-BACK-OFFICE-v3.html`;
- **Khwan's v3 notes, ALL applied:** `smart-scheduler/project-docs/customer-2026-10-22-backoffice-prototype-v3/khwan-answers-v3-part1-2026-10-23-VERBATIM.md` + `khwan-answers-v3-full-2026-10-25-VERBATIM.md`;
- R0 in `requirements/REQ-120-backoffice-rebuild-salary-revenue-stock.md` §0.

## The 8 pages (v3 routes, minus the `#`)
`/salary/people` · `/salary/person` (hidden, opened from People) · `/salary/settings` · `/salary/payrun` · `/salary/slip` · `/salary/my-slip` · `/salary/entries` · `/salary/daily`.

## Her notes that must be visible (check each against the VERBATIM files; this list is a reminder, not the source)
- **My slip = "Payment Detail"** (the word and the screen); a Coach lands here and sees only their own.
- **Commission: an amount can be lowered OR raised** per sale (with who / when).
- **The Excel / PDF export button** on the slip and the pay-run views → `fakeDownload("…xlsx" / "…pdf")`.
- Her renames, ALL-CAPS groups, every date dd/mm/yy (`fmtDate`), the ‹ month year › picker on Monthly Payment / Payment Detail / Other Income.
- **R0:**
  - the Admin sees no base salary, no pay totals, no slips. **HIDE them** (drop the column / card / page via `roles`); **never a lock or "CEO only"**. Khwan's v3 note: *"ไม่ต้องขึ้นค่ะ ขึ้นแค่อันที่เขาดูได้ค่ะ"*. CONVENTIONS §2.7, corrected 10-27;
  - the CEO sees all;
  - the Coach sees My slip only.

## Done = (report in `inbox/SA.md`)
- `tsc` 0 · build 0 · the built file offline: all 8 pages reachable per role, **every control does something**, 0 console errors / warnings, 375 px OK.
- A short table: page → which of her notes it carries (the VERBATIM line).
- Mock data: invented children only (น้องมะลิ …), **and invented staff names only** (corrected 10-27, CONVENTIONS §2.8; never Kid / Poo / Kung / Bank / London / Nelson / พี่ฟีน).

---
## FE report — Fern, 2026-10-27 — TASK-844 DONE: the 8 SALARY pages (final UI). No git; no smart-scheduler repo touched
**Files:** `final-ui/src/pages/a/salary/{People,Person,Settings,PayRun,Slip,MySlip,Entries,Daily,SlipView,parts}.tsx`, `src/mock/a-salary.ts`, `src/pages/a/index.ts` (the example page is gone). Routes = v3's minus the `#`; `/salary/person` is `hidden` (opened from Employee). R0: People/Person/Other Income = CEO + Admin; Payment Setting / Monthly Payment / Payment Detail / Daily Training Report = CEO; **Payment Detail (My slip) = Coach only**; a Coach lands there.
**Gates:** `tsc` 0 · `npm run build` 0 · **`dist/index.html` = (see the size in my inbox entry; it also carries whatever Team B had registered at build time)**. Built file opened ALONE from `file://` in headless Edge and Chrome: **every page × 3 roles** reachable or shown the shell's no-access screen as R0 says; **every control clicked** (header buttons, row buttons, tabs, modals and each button inside them): **0 dead**, **0 console errors / warnings**; **375 px: no sideways page scroll on any page × any role**. Admin scan: Employee base salary 🔒 ×6 (no ฿ figure), Employee Profile Base + Freelance Rate 🔒, Other Income shows only the amounts of the lines they enter.
**Page → her notes it carries (khwan-answers-v3 part 1 / full; quoted):**
| page | what I applied |
|---|---|
| Employee | "Type เขียนตัวเต็มทั้งหมดค่ะ" → Full-time / Part-time · Sat–Sun / Freelance · Mon–Fri / STAFF; brand per the shell |
| Employee Profile | "FT ใช้ตัวเต็มค่ะ ตรง Type"; "Freelance hourly rate per class type = **Freelance Rate**"; "ต้องมีหัวข้อ **Bonus** … ต่อ Merit" (new Bonus row after Merit); "Yes · every 3 months (**Nov 2026**)"; Commission: "**All**" / "**All — shared among employees**" / "**Only Skate bag**" |
| Payment Setting | every rename of page 3: OT · Hour (ตัด S) = **Enter manually** · Weekday/Weekend (ตัด S) = **> 4th HR / > 5th HR** · "Apply to" on all · Condition / Pay to / 1st Coach on all · **New Course/ Voucher Package after 1st Trial** · **Renewal Course** · **Special Case: 1st Coach & 2nd Coach share 50% (When changing coach)** · **NO = Renewal Voucher** · **Commission** · **Share Equally** · her 4 lines under Commission IN THAI as written (Full-time / Part-time · Freelance left-right, STAFF one long left-aligned line, then the three `*` lines) · **Per KM / One Way / KM / Minimum / Trip** + her two notes under Transportation · **School Distance** + her two `*` notes |
| Monthly Payment | "ส่วนที่ 4 Remind → **Reminder** เฉยๆ"; Type full words; **DRAFT = Pending**; **AUTO-LOCKED** (no 12:00); last row **TOTAL**; month picker; **Excel + PDF export** (fakeDownload) |
| Payment Detail | **Export Excel = summary only** (a section + its Subtotal) and **Export PDF = everything with the detail**; Bonus lines in her form **"For 50 : … = 2" / "For 100 : … = 3"** (counts × 50 / × 100; the example children are invented); "14/10/26 (Wed) : 6 Hr → ชม.ที่ 5–6 = 2 Hr × 350 ฿"; **OT**; **Total 1,200 ÷ 6 coaches**; the transport line without "(minimum 60 ฿ not needed)"; **Merit (Every 3 month)** + "(enter manually)" on the heading line; **Teaching Hours** with **Student** and **Program** (the activity named) and ALL rows listed (no "62 Hr in total" line); readable cards, even spacing. **Commission lowered or raised per sale, with who / when** shown on two lines (Kid lowered 100→60 by Poo; Poo raised 100→150 by พี่ฟีน) |
| Payment Detail (Coach) | the word "Payment Detail" on the coach's own screen; Confirm this slip / Tell an admin / Export PDF — **page 6 was unanswered in v3, so this is my reading** |
| Other Income | removed "… Slip total 🔒 HIDDEN FOR ADMIN"; now "**Kid already confirmed slip of 30/09/26–30/10/26**"; **Detail** (was Other Income Detail); **Description** (was Item); month picker |
| Daily Training Report | "FT FL PT = เขียนตัวเต็มทั้งหมด"; **Description** (was Extra); even columns |
**Judgement calls (tell me if wrong):** (1) Payment Setting "Hours come from = Hour Count" + "The timetable, incl. ECA and camp = เอาออก": I **dropped the whole row** (a label with its value removed says nothing). (2) Her typo "Minumum" is written "Minimum". (3) Payment Detail totals are the SUM of the rows shown, so Nelson's total changed from v3's 23,139 to 23,389 (her new Bonus lines count 2 × 50 + 3 × 100) and Kid's / Poo's changed with the commission adjustments; Monthly Payment's TOTAL is the sum of its rows. (4) A row without a slip in Monthly Payment (Bank / Kung / London) toasts "looks like the others" (as v3 did). (5) Employee Profile for Bank / Kung / London is generic (v3 had three).
**Not done:** not clicked through by a person; the `STAFF  get commission …` line is plain text beside a bold STAFF (she asked for no left/right split) — format is my reading.
