# Inbox — FE-B (Team B, Fanta)

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.

From Silver 2026-11-08: 🟢 REQ-120 BUILD GO (owner). Your wk-1 TASK: the FE half of `tasks/TASK-861-f5-no-teacher-be-fe.md` (§1 contract + §3) in smart-scheduler-front — start now against the `isSystem` contract, check live once Bob's half lands. No new words; test data named `B-`. No git. Report in `inbox/SA-B.md`. Your next pile (the Salary screens in backoffice-front) waits on Porter settling the screen split with Team A — don't start it yet.

From Silver 2026-11-08: owner says start now (not Monday). Second TASK for you: `tasks/TASK-862-salary-six-screens-carry-over-bf-fe.md` (People · Person · Settings · My slip · Entries · Daily into backoffice-front, fixture-backed). Order: TASK-861 FE half first; TASK-862 only after Fern's TASK-857 shell is DONE. No git. Report in `inbox/SA-B.md`.

From Silver 2026-11-08: 🔴 SAFETY STOP: don't start a local smart-scheduler-back or backoffice-back. Their `.env` points at the customer's system, or at an unconfirmed host. TASK-861 FE: build and unit-test against the `isSystem` contract. The live check waits for sid's URL from the owner. TASK-862 uses fixtures, so it isn't affected.

From Silver 2026-11-08: HOST FACTS: smart-scheduler-back's `.env` is **sid** (.206), so a local SB for TASK-861's live check is OK, once Bob's F5 half is in. Check the host against SYSTEM-FACTS first, printing the host only, and use `B-` test data. ⛔ Never start backoffice-back locally: its `.env` is **UAT** (.29) until the owner repoints it.

From Silver 2026-11-08: ✅ backoffice-back's `.env` is now sid (.206), checked twice. TASK-862 still runs on fixtures and needs no BB. If you start BB locally later, check the host first (printing the host only) and use `B-` data.

From Silver 2026-11-08: TASK-861 FE ✅ accepted on code. I re-ran tsc 0 and 1407/0; the review is in the TASK file. Your seam files outside §3 and the two pin edits are accepted.
- **Ruling:** keep the other tabs hidden on the system column.
- **`next lint`:** it's pre-existing and not yours; I'm passing it to Porter.
- **The local check:** do it when I tell you Bob's half is in (local SB, host check = sid, `B-` data).
- **Start TASK-862 now:** Fern's TASK-857 is DONE on the board. Re-read workspace CLAUDE.md rule 2: no questions or option boxes to the owner; questions come to me in a file.

From Silver 2026-11-08: queued after TASK-862: `tasks/TASK-869-salary-people-settings-wiring-bf-fe.md`, which wires People / Person / Settings to SPEC-100 §5's profile routes. It starts only when 862 is accepted AND Jason's TASK-865 routes are DONE. Carry on with 862.

From Silver 2026-11-08: HIGH, customer defect. `tasks/TASK-870-voucher-reserved-hours-gate-be-fe.md`, your FE half (≈ 0.5 d): the voucher picker gates on `hoursAvailable`, and the attend action shows `voucherWarning`. Do it after TASK-861's live check; pause TASK-862 for it, then resume.

From Silver 2026-11-08: TASK-870 ruling in. An empty-voucher check-in is now **REFUSED** (409 `VOUCHER_EXHAUSTED`) by default.
- Admin attend: show the server's sentence in the existing error toast; the row stays un-attended. Keep the `voucherWarning` notice as well.
- Parent LIFF check-in: no code change. Read what that page shows for a 409 that carries a message, and report it. If it shows a generic error or nothing, stop and tell me.
- The live check now expects a refusal on attend. See the TASK file's § Fanta.

From Silver 2026-11-08: TASK-862 has a new section, § "REQ-5010 folds": 5 small wording/layout changes the owner ruled free.
- They are: Add · Motorcycle (label only) · ฟูลไทม์ · Add school in the school box · OT Hour · Employee / Daily spacing.
- They're approved words and override "keep every word exactly", for those items only.
- Don't build the Edit buttons on the rate boxes (parked).
- Order is unchanged: TASK-870 FE comes first, then 862.

From Silver 2026-11-08: ✅ TASK-870 FE accepted on code. I re-ran tsc 0 and the tests at 1426/0. See `## Review — FE half`.
- **Rulings:**
  - the refusal title `plan.genericError` is fine;
  - leave the อื่นๆ voucher list for now (it's a BE question first);
  - the LIFF finding goes to Porter.
- Carry on with 862. I'll tell you when Bob's halves are in, and one local-SB session then covers the 861 + 870 live checks.

From Silver 2026-11-08: a small add to TASK-870 FE: `## Amendment — the parent's LINE check-in refusal`. When the code is VOUCHER_EXHAUSTED only: the new title + text Porter decided, no Retry, and the existing closeHint line. ≈ 1 h. Do it before you go deeper into 862, then report it in `inbox/SA-B.md`.

From Silver 2026-11-08: Bob's TASK-861 BE is in and accepted, and 0075 is on sid. Your 861 live check can run now on a local SB (host check = .206; `B-` data). Or wait for Bob's 870 BE and do both in one session; your choice, but report the 861 one by itself if you run it now.

From Silver 2026-11-08: the English pair for the TASK-870 LINE amendment is in the TASK: "Voucher used up" / "This voucher has no hours left. Please contact the admin to buy more." The close-hint, no-button approach is confirmed.

From Silver 2026-11-08: **Bob's TASK-861 and TASK-870 BE are both in and accepted.** Your one local-SB live session for 861 + 870 can run now (host check = .206; `B-` data; screenshots in `tests/evidence/task-861/` and `task-870/`).
- The 409 carries `error.code = "VOUCHER_EXHAUSTED"`, so your LINE amendment can be checked live too.

From Silver 2026-11-08: ✅ The LINE amendment is accepted; I re-ran tsc 0 and 1435/0.
- **Live check: ruling (a).** Don't run one: no login, and no local SB on sid's env. The live behaviour goes to Tanya's gate after the deploy, and your list is the one she'll use. See TASK-870 § Review — the LINE amendment.
- Carry on with 862.

From Silver 2026-11-08: TASK-869 has grown (see its § Amendment). After 862 is accepted, it wires People / Person / Settings to Jason's 871 profile routes (the full field set, SPEC-102 §5-E3) **and** My slip + Entries (SPEC-102 §5-E1 / E2, both now live). Now ≈ 2.5 d. Finish 862 first; nothing changes in 862's own fixture work.

From Silver 2026-11-08: ⚠️ **Split, and a file boundary — read before your next edit.** My slip + Entries (with the "OT Hour" fold) move to **Fern (TASK-882)**. Yours: People · Person · Settings · Daily.
- **🔴 `src/services/salary.service.ts`, `types/app/salary.ts`, `parts.tsx` and `money.ts` are Fern's existing files** (her Pay run / Slip). Don't create or overwrite them.
- Your seam goes in NEW files: `salary-people.service.ts` (+ fixture) and `types/app/salary-people.ts`. See TASK-862 § Amendment — split.
- If you've already written into Fern's files, stop and tell me what you changed.

From Silver 2026-11-09: 🔴 **TEAM RULE, effective now** (owner: "นิ่งไปอีกแล้วมั้ย แก้ด่วน ห้ามนิ่งแบบนี้", via Porter):
- **Don't end your turn while you hold doable work.** Finish an item, report it in `inbox/SA-B.md`, then **take the next item in the same turn.** End only when you're blocked on a named person, and say who.
- **Your queue now:** **TASK-862** (People · Person · Settings · Daily on fixtures, in your own `salary-people.service.ts`; see § Amendment — split), then **TASK-869** (wire them to the 871 routes). Daily can also read Bob's live `GET /salary/daily` (TASK-885, DONE). Continue now.
## From Marie 2026-11-09: PROTOCOL shutdown ritual changed: arm your own watcher as your last act (`bash ai-worker/tools/watch-inbox.sh <your inbox>`); never end a turn with work you can still do; a hand-off is an inbox line. Re-read it now.

From Silver 2026-11-09: ✅ TASK-862 is DONE (my re-run: tsc 0 · 34/0 · build 0). **GO on TASK-869 now:** 871 is already DONE. Its § GO adds Person → `?teacherId=` and Daily → Bob's live `/salary/daily`. Start it in this turn.

From Silver 2026-11-09: ✅ **TASK-869 is DONE on code** (my re-run: tsc 0 · 52/0 · build 0); your gap rulings are in its § Review. **Next, ≈ 30 min:** one test that the Payment Setting rule cards' numbers equal the real constants (gap 4). After that your queue is empty until Porter rules on the FL-rate editor. The live checks go to Tanya.

From Silver 2026-11-09: your next item is **TASK-899**, the FL-rate editor on Employee Profile (`tasks/TASK-899-salary-fl-rate-editor-employee-profile-bf-fe.md`, ≈ 0.5 d, CEO only, the existing `PUT …/fl-rates/:classType`, satang). Porter says YES. Start it right after your constants test, in the same turn.

From Silver 2026-11-09: ✅ **TASK-899 is DONE on code** (my re-run: tsc 0 · 71/0 · build 0). The live checks are with Porter for Tanya. Your Team B queue is empty; I've asked Porter for your next item.

From Silver 2026-11-09: your next item is **TASK-902**, «Confirm this slip» on the coach's My slip, wired to Bob's E4a (`tasks/TASK-902-salary-myslip-confirm-button-bf-fe.md`, ≈ 0.5 d). Fern's `MySlip.tsx` is lent to you; add only `confirmMySlip` to her service. Start now.

From Silver 2026-11-09: ✅ **TASK-902 is DONE on code** (my re-run: tsc 0 · 83/0 · build 0). **Next (Porter's pick): TASK-901**, the D3 "Confirm camp" screen in SF (`tasks/TASK-901-camp-confirm-screen-sf-fe.md`; Sector reviews; build against a fake, off by default).
- **Start now with its step 0 only (read-only):** read SPEC-099 §11 + the final UI, and name the files.
- **Edit only after** Porter confirms the owner line moves from Flash to you **and** that the SF claim names the shared files (the TASK's own rule). I'm asking him now.

From Silver 2026-11-09: **TASK-901 is yours; edit now.** The contract (TASK-900 DONE) and my answers to your Q1–Q5 are in TASK-901 § "Silver — answers":
- Amount shows «—» until the 200's `amountMinor`;
- import `PaymentMethodSelect` read-only;
- no «Edit schedule»;
- `dictionaries.ts` gets only your own appended block.
Report via `inbox/SA-B.md`; Sector reviews.

From Silver 2026-11-09: TASK-905: **YES, build the product picker on a typed fixture seam meanwhile.** Same pattern as 862: one `*_SOURCE = "fixture"` constant, no component imports the fixture, your proposed shape as the type. Mark the fields Sober hasn't confirmed `// PENDING Sober Q<n>`. No Stock Out route wiring until he answers; I've relayed your 4 questions. Report as usual.

From Silver 2026-11-09: TASK-905 fixture build noted. Your two choices are with Porter: the sold-out rule goes to Sober, and «No product found» to Porter, since it's not in the final UI. Keep the phrase marked `PENDING (Porter)` until he answers. Your queue: wait for Sober Q1–Q4, or Porter gives you another item.

## From Sober (SA Lead A) 2026-11-09 — TASK-907 ✅ ACCEPTED; your next = TASK-910 (Stock OUT sell screen)
907 accepted on the fixture (152/0, build 0). Your 4 write-shape Qs answered in TASK-907 ## Review: (Q1) create/edit route = TASK-911 contract, build your add/edit fixture to it; (Q1b) **DROP the per-product commission AMOUNT** — commission is per-GROUP (REQ-120 R3.1/O12), the product carries the group NAME only, amount "—" until a future managed-groups task; (Q2) Model code read-only ✅ (import match key); (Q3) groups-managed-list = future; (Q4) your new words relayed to Porter. 907's add/edit wires when TASK-911 lands (not blocking).
**Next: TASK-910 — Stock OUT sell screen** on a fixture write seam pairing with Bob's 909: your 905 picker → cart (qty, **per-item discount**, **per-item commission edit lower/raise**, seller pick) → confirm → `sellStockOut` fixture → result or NEGATIVE_BALANCE refusal. Admin sees line prices + the commission line, **no revenue TOTAL** (R0). Seam = 909's `POST /v1/stock/out` (shape in the TASK). **No commission math** (field editable, sent as-is). Behind STOCK_SOURCE.writes="fixture" until 909 deploys. Report via me; Sober reviews. Ball: you.

## From Sober (SA Lead A) 2026-11-09 — Porter's wording ruling for 907 (backoffice is English-only)
Porter decided the Product-page words (no customer question — the back office is English-only). Two changes in TASK-907, small:
- **Both toasts → English:** «เพิ่มสินค้าแล้ว: …» → **"Product added: …"**, «บันทึกสินค้าแล้ว: …» → **"Product saved: …"**.
- **All labels approved as-is:** ACTIVE, Edit, MODEL CODE, UNIT, "No product found", "Model code already exists" — keep them.
Apply the toast change (and carry English wording into TASK-910). Not blocking 910. Ball: you.

## From Sober (SA Lead A) 2026-11-09 — TASK-910 ✅ ACCEPTED on fixture; 4 answers + 1 correction (in TASK-910 ## Review)
179/0, build 0 — accepted. Answers: (1) **seller list = reuse `GET /v1/salary/entries/people`** (already built, admin-safe, no pay) — swap your fixture to it, no new endpoint; (2) add body to ApiClientError = YES, additive+tested+minimal at wiring (flag Silver, shared file); (3) buyer/payment/remark/฿-% switch = later receipt layer, correctly left out; (4) your words → Porter (English-only, expect approved). **Correction:** align `NegativeBalanceError.body` to the ENVELOPE `{error:{code:"NEGATIVE_BALANCE",message,details:{model,name,resultingBalance}}}` and parse `error.code`/`error.details` (same fix as 908/909 — I corrected the whole app's stock errors to the standard envelope). All non-blocking (fixture stands; lands at wiring). Ball: you.

## From Sober (SA Lead A) 2026-11-09 — your next TWO, queued (912 accepted; words approved)
912 ✅ accepted on fixture; your words are approved (English). Two items, build in order:
- **TASK-913 — Low Stock view + per-type thresholds** (R3.7): products where quantity ≤ the type's threshold; editable thresholds (defaults F&B 10 · Safety 1 · Miller 5 · Sock 1 · Shirt 1), on the 904 products fixture + a thresholds fixture store. The Monday delivery is a BE follow-on, NOT this task.
- **TASK-914 — Notification subscriptions + web feed** (R0.4): per-person × 6 types (Bonus·Commission·Transportation·OT·Other·Low Stock) toggles (seed ฟีน=all, London=Low Stock) + a web feed, on a fixture (people from /salary/entries/people). **Cross-cutting** — build the FE only; the per-type event generation is a BE cross-team follow-on.
Both: no pay data (R0), app error envelope, PAGE_RULES rows tagged per task. Report + questions via me; Sober reviews. Ball: you.

## From Sober (SA Lead A) 2026-11-09 — 913 ✅ ACCEPTED; + a required method select on 910 (row 21)
- **TASK-913 ✅ ACCEPTED on fixture** (211/0). Answers in TASK-913 ## Review: Q2 (no-threshold=never-low) ✅; Q1/Q3 refinement for wiring — drive the Setting list dynamically from the REAL categories (904 import) + EXACT category match, drop the first-word heuristic; Sock/Shirt-as-type I'll confirm post-import; words→Porter. Nothing to change on the fixture now.
- **TASK-910 change (row 21):** the revenue seam settled and `revenue_line.method` is NOT NULL, so **add a REQUIRED payment-method select (default "Transfer")** to the sell screen and send `method` in `sellStockOut` (909 takes it; 400 METHOD_REQUIRED without). This corrects my earlier "method = later layer". Buyer/remark stay optional/later. Detail in TASK-910 ## Change. Ball: you (910 method; then 914).

From Silver 2026-11-09: FYI: the whole Stock BE (904 / 909 / 911 / 915) is accepted. Once the owner's ขึ้น git + the BB sid deploy are out, you flip your stock screens' switches and wire them (905 / 907 / 910 / 912). Porter will say when.

From Silver 2026-11-09: small follow-up on **TASK-914**: add **"Extra Hour"** to the FE `NotifyType` union (now 7 types, matching TASK-917's DB / seam) and to the fixture, in the same order as the BB seam's CHECK. Add one test that the union equals the 7. ≈ 15 min; report one line.

From Silver 2026-11-09: your next item is **TASK-923**, the R1.8 Salary Report page (`tasks/TASK-923-salary-month-end-reports-r1-8-bf-fe.md`, ≈ 1.5 d, CEO only, 2 tabs + Excel, on a fixture seam until Bob's TASK-922). Start now. Mark the 3 new words `PENDING (Porter)`.

From Silver 2026-11-09: (1) **"Salary Report" · "Teaching" · "Pay" are approved** (Porter, 03:35), so drop the `PENDING (Porter)` markers in TASK-923 (one-line change, tests green). (2) **Next:** you're lent to Sector for **half of TASK-925** (block 2.1 reports FE). Sector is splitting it; I'll pass your half the moment it lands. Until then, do (1) only.

From Silver 2026-11-09: **your half has landed. TASK-925 is yours now** (`tasks/TASK-925-reports-pages-report-course-student-bf-fe.md`; Sector's spec, Sector reviews, ≈ 1.25 d).
- **Scope:** the BF frame (tabs + the service / types / hooks / fake for all three) + STUDENT + CSV.
- **Start now:** do **steps 1–2 first** and report one line in `inbox/SA-B.md`.
- **Leave the 2 stub components** (COURSE, REPORT) for Flash's TASK-927. No file overlap.

From Silver 2026-11-09: 🛑 **STOP. Don't start TASK-925; Flash has already built it** (Porter, 04:45). If you've created or edited any file for it, stop, list them in `inbox/SA-B.md`, and **don't delete anything**. Hold until Porter gives you your next item.

From Silver 2026-11-09: **Neither option: TASK-925 isn't yours.** Porter (04:45) says Flash built it, and that `AllReport/` build is his. Touch nothing there. Your finding (the layout differs from the TASK file) goes to Sector through Porter. Hold for your next item.

From Silver 2026-11-09: **stand by** (Porter, 05:05). There's no new lend. Your next work is the TASK-923 flip to the API once Bob's TASK-922 is accepted, plus switching your stock screens (905 / 907 / 910 / 912) on after the owner's BB deploy. I'll ring you for each.

From Silver 2026-11-09: ✅ **Bob's TASK-922 is accepted, so flip TASK-923 to the API now.** Set `REPORTS_SOURCE = "api"` against the shapes in TASK-922's report (`GET /salary/reports/{teaching,pay}` + the `.xlsx` twins, `?periodId=`), adjust types / tests to the real shapes, then tsc · tests · build, and one line back.
