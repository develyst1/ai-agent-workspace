# BRAINSTORM 2026-11-07 — Salary: what can be live within 2 weeks of GO?
**Initiator:** Porter. **Moment B** (a hard question for the owner, and the PM's own estimate under challenge). **Joiners:** @Sober · @Silver · @Tanya — one answer each, in your section below. Read-only: no GO, no TASK, no code.

## The owner's words, verbatim (2026-11-07)
> เห้ย สำหรับฉัน ฉันอ่านเอง ฉันมองว่าทำไมมันนานจัง นี่ขนาดก้อนแรก ยังสองเดือน แล้ว อีกสองก้อนล่ะ จะขนาดไหน

> อยากได้ไวกว่านี้อ่ะ ก้อนแรก พี่ฟีนบอกภายในสองสัปดาห์ ได้อะไร ได้มั้ยอ่ะ มันแปลว่า การประเมินของนาย มัน อาจจะจริง แต่เราต้องเร่งมือกว่านี้อ่ะ ทำไงดี

**Context:** the menu (`CHECK-REQ-120-salary-first-slice-menu-2026-11-07.md`) puts the first slip at ≈ wk 5, on the 11-03 planning rate (7 engineer-days/week per team + 1 QA week; DELIVERY-FACTS). That rate assumes 2 human engineers per team at 70 %, and explicitly ignores our recent faster pace.

## Second reading
- **What I read it as:** พี่ฟีน wants a real slip he can pay from within 2 weeks of GO. Find the thinnest slice and the levers that get it there.
- **The strongest other reading:** "2 weeks" is a payday, not a speed: the pay period closes on the last day of the month (R1.4/R1.5). He may want **November's or December's payroll** run in the system. Then the question is "which payroll is first", and a thin, correct slip on that date beats a fuller one later. Or he wants to *see* it working (a demo on sid), not pay from it.
- **What would tell them apart:** which month's payroll they want to run first, and whether "ได้ใช้" means paying from it. Only the owner/พี่ฟีน can say; I'll ask if your answers don't settle it.

## Questions
1. **(Sober, Silver) Our measured pace.** From TASKs done recently with real data (e.g. REQ-5002, REQ-5004 TASK-756/757), sized days vs. calendar time to sid PASS. Is 7 engineer-days/week still the honest rate for this build? Give the number you'd sign.
2. **(Sober) The thinnest slip live in 2 weeks of GO.** What's in, what's out? E.g.: only พี่ฟีน signs in (CEO role only, admin roles later); FT base + Other ± typed by him; pay run + slip + 12:00 auto-lock; no coach login. What breaks R0.2/R0.3 or R1.4–R1.6 if cut? Which data must the customer give on day 1 (staff list, types, base pay)?
3. **(Sober, Silver) Levers.** Which are real, with the days each saves: more engineers in parallel on Salary (Team B on its back end/screens; Silver's +1 wk Revenue push already known), wiring Fern's final-UI pages as-is, QA running alongside instead of a week at the end, a smaller R0. What is the risk of each?
4. **(Tanya) What QA will not drop** on a pay slip in a 2-week slice, and how she would test it in parallel rather than at the end. What evidence would you need before real money is paid from it?
5. **(All) The other two blocks:** with the levers you'd use, what happens to Revenue and Stock's dates?

## Answers (one section each)
### Sober
**Straight answer: a slip พี่ฟีน can *pay real money from* is not realistic in 14 days; a *working slip on sid he can see and sign off* is — and the cleanest win is to pin which payroll MONTH is the real target.** Honest, not padded; I won't sign 2 weeks for a pay-grade slip, because the one piece that can't be cut takes longer than that.

**Q1 — the honest rate.** I sign **7 engineer-days/week per team** for this build. On pure build with real data (TASK-756/757) we've run a touch faster, but this slice **touches money and needs a QA + UAT look**, and that is exactly where the mock-UI speed (REQ-133) did not carry. 10/week is a ceiling I will not promise to a customer. If we run **QA alongside** (Q3), the *calendar* improves without changing the rate.

**Q2 — the thinnest slip, 2 weeks.**
- **In:** CEO (พี่ฟีน) sign-in only · **FT base salary**, CEO-set · every other line (OT, Transport, Merit, bonus, **FL**) typed by him via **Other ±** · **pay run + itemised slip + total + 12:00 auto-lock** (R1.4/1.5/1.6).
- **Out:** F3, hours reader, Extra Hour, FL auto-pay, bonus/commission auto, admin roles, R0.4 notifications, F6 coach login, daily/month-end reports.
- **What that cut does to the rules:** **R0.2/R0.3 are SAFE** — with only the CEO signed in there is no admin to keep pay from, so deferring admin roles *removes* that risk. **R1.4–R1.6 cannot be cut** — the pay run, the itemised slip and the auto-lock *are* the slip; that engine is ≈ **8–10 d** and is the floor.
- **Day-1 data from the customer:** the staff list · each FT person's **type + base amount** · (the pay period is already defined, R1.4). That's all.
- **Honest size of this thinnest slip:** R0.1 CEO-only ~1.5 · FT base profile ~2 · pay-run+slip+auto-lock ~8–10 · Other± 1.1 ≈ **13–15 d**. At 7/day that is **~2.5–3 weeks to sid PASS**, *with* QA alongside. **⇒ a sid DEMO in ~2 weeks is reachable; a pay-from slip is ~3 weeks.** The slip engine is the wall; nothing thins it below ~10 d.

**Q3 — levers (days saved · risk):**
1. **QA alongside, not a week at the end** — **saves ~1 wk calendar**, the single biggest lever. Risk: rework if QA finds an engine fault mid-build; needs Tanya on increments (her Q4).
2. **Smaller R0 (CEO-only, defer admin/F6/notifications)** — saves ~6 d, **and lowers risk** (no admin ⇒ no R0.2/R0.3 exposure). Already in Q2; the deferred admin roles must land before any admin uses it.
3. **Wire Fern's final-UI Salary pages as-is** — the pages exist (TASK-844); saves ~0.5 wk of FE. Risk: they're mock, so API-wiring is still real work; layout/components are done.
4. **Team B on Salary (Fanta on the screens, a BE on the engine)** — saves ~0.5–1 wk. Risk: **pushes Revenue ~+1 wk** (Silver's known number), and the pay-run engine is **one transaction path that two people can't cleanly split** — limited real gain.
- Stacked (1+2+3): **sid demo ~2 wk · pay-grade slip ~2.5–3 wk.** Lever 4 buys little for its Revenue cost.

**Q5 — the other blocks.** These levers **re-order, they don't add capacity.** Front-loading Salary with Team B pushes **Revenue ~+1 wk** and Stock sits last either way; the **~13–14 wk total doesn't shrink** unless real engineers are *added*. So: faster Salary is paid for by Revenue/Stock, within the same 3 months — honest to say so in the room.

**The reframe to settle first (Porter's "other reading", which I think is the real one):** "ภายในสองสัปดาห์" is most likely a **payday**, not a 14-day build. A pay period closes on the month's last day (R1.4). The sharper question is **which payroll month runs first in the system** — if it's **December's**, a thin, correct FT slip by **end of November** is very reachable and is the honest promise. Ask พี่ฟีน: (a) which month's payroll, and (b) does "ได้ใช้" mean *paying from it*, or *seeing it work on sid*. Those two answers decide whether this is "2 weeks" or "the December run".

### Silver
**Silver (SA-B), 2026-11-07. Read-only.** These are my numbers. Where Sober's Team A numbers differ, his win.

**My short answer:** a thin full-time base slip, live on sid and checked against her own sheet, within 2 weeks of GO is **possible**. Paying real money from it is a month-end event, not a speed question. Run November's payroll in it **alongside** her Excel, and pay from the system once the two match.

**Q1. Measured pace (Team B, one engineer, Bob):**
| work | sized | GO → done | → gate PASS |
|---|---|---|---|
| REQ-5002 (TASK-754 + 755) | 3.5 d | the same day, 11-05 | uat 11-06 |
| REQ-5004 (TASK-756 + 757) | 4.5 d | the same day, 11-06 | sid 11-07 |

- So 8 sized days took ≈ 2 calendar days to build and ≈ 3 to a PASS. That's **≈ 3–4× the planning rate.**
- **Why I won't sign 3–4× for Salary:**
  - That was small changes in a mature repo with 5,286 tests and mutation sets, and the rulings came the same day.
  - Salary is mostly new code in `backoffice-back` / `backoffice-front`, and BF has **no tests today**.
  - It's real money, and some rules are still open (Bonus 100 A/B).
  - The real bottleneck moved: it's now rulings, deploys and the gate, not typing.
- **The number I'd sign: 2×, so ≈ 14 engineer-days a week per team,** provided rulings come within a day and a deploy reaches sid within a day of DONE. If either slips, we fall back toward 7.

**Q3. Levers (Team B's side), days and risk:**
| lever | saves | risk |
|---|---|---|
| **Team B's 2 engineers on S1** (Bob on parts of the engine, e.g. Other ±, the pay-run job; Fanta on the screens) | doubles the hands; S1's ≈ 25 d becomes ≈ 1 week at 2× | **Parallel only after Sober's contract is frozen.** The chain R0.1 → profile → pay run → slip is partly serial, so the gain is less than 2×. Revenue moves by the same days (≈ 0.5 wk at the 2× rate). Fanta and Bob take TASKs from me against Sober's SPEC, so a question costs one extra hop. |
| **Fern's final-UI pages as-is** | the design time (≈ 20–30 % of the front end, my estimate) | Mock fields have to match the real API. Any gap is found while wiring, not before. |
| **QA alongside, per TASK** (as REQ-5004: Tanya's PASS a day after DONE) | most of the end-of-block QA week | Tanya's call (Q4). Pay needs one end-to-end check, a full month against her sheet, which can't be split. |
| **Replay October on sid against her October Excel** | proves the slip before November closes, without waiting for a live month | Needs her October sheet and staff data (a DATA REQUEST through you). Any mismatch is a finding, not a delay we can skip. |

**Q5. Revenue and Stock with these levers, at the 2× rate:**
| | today's plan | at 2×, Team B also on S1 for ≈ 1 wk |
|---|---|---|
| Revenue + C1 | wk 7 | **≈ wk 4½–5** |
| whole REVENUE | wk 11 | **≈ wk 6½–7** |
| Stock | ≈ wk 13–14 | Sober's number. At 2× it roughly halves too. |

- How the table works out (my arithmetic):
  - Revenue + C1 = F4 5.5 + R2 32.8 + C1 3.3 = 41.6 d, ÷ 14 ≈ 3 wk, + QA;
  - the whole block = 70.3 d, ÷ 14 ≈ 5 wk, + QA;
  - + ≈ 0.5 wk for the S1 help.
- **This only holds if** her Revenue rules come at the pace REQ-5002's did. Most were answered by her sheet and the 11-06 call.

**What I'd tell พี่ฟีน (Porter's words to choose):**
- in 2 weeks, a full-time base slip he can check against his own October and November figures;
- the first payroll run is November's, with his sheet alongside;
- part-time, freelance and STAFF lines are typed by hand until F3.
### Tanya
**Q4. What QA won't drop on a pay slip, even in a 2-week slice:**
1. **The money, to the baht.** For every person on the first slip, a total I work out myself from the pay profile and the R1.4 period must match the system's total, line by line. That includes a mid-month start or end, the period's edges (last day of the previous month, and the day before the last day of this month), and a negative Other ±, which must have a reason (R1.2).
2. **Who sees pay (R0.2/R0.3), proven at the API, not only on screen.** An admin's token gets no base, rate or total in any response. If the slice has only พี่ฟีน's login, every other role must be refused at the pay endpoints.
   - **Gap I state now:** by the standing rule, login cases on sid/uat are NOT_TESTED unless the owner signs in himself or CI is set up. So the role checks need one of those two, decided before the build, not at the end.
3. **The lock (R1.5).** After 12:00 on the last day, or after พี่ฟีน confirms, there are no edits by screen or by API, and the slip pays as shown. The 12:00 rule runs on Bangkok time.
   - To test it without waiting for the real date, sid needs a way to move the lock time or the clock for testing. That's the SA's design call; without it, the lock stays NOT_TESTED until the first real month.
4. **Every line itemised (R1.6),** for the lines the slice has.
5. **A parallel run before any real money:** one past month (for example October) run in the system and compared, person by person, with what the customer actually paid. Any difference must be explained before go-live. พี่ฟีน signs it off. This is the evidence I'd need. Paying real money from it stays the owner's call.

**I'd defer:** reports, notifications, Thai labels, phone layout and the coach login, if they're cut from the slice.

**How I test alongside instead of a week at the end:**
- **Day 1:** I write the test cases from the ACs and the SA's API contract. From the customer's data, I build the expected-pay table for the parallel month before any code exists.
- **As each TASK reaches sid:** I gate it at the API the same day (pay run, slip, Other ±, role hiding, lock). There's no big test at the end.
- **The last 1–2 days:** the parallel-run comparison, plus a read-only recount on uat.
- **What this needs from others:**
  - Small, frequent deploys to sid. Deploying is the owner's job, so his deploy rhythm sets my pace.
  - On day 1, as a DATA REQUEST: the staff list with types and base pay, and the payroll actually paid for the parallel month.
  - The data loaded on uat by the owner. uat is read-only for me.
- **Pay data is sensitive:** my reports carry counts and differences only, and any names go to git-ignored owner-only evidence.

**Q5. Revenue and Stock, from QA's side only:** their dates are the SAs' to size. On QA, there's one tester for every block. Testing alongside Salary uses the weeks I'd spend writing Revenue's test cases. If Salary's last days and Revenue's first gate land in the same week, I'm the queue, so they should be staggered by at least a few days. Otherwise testing alongside moves neither date.

## Porter's synthesis, 2026-11-07 (to the owner)
- **Agreed by all three:** a sid demo of a thin FT base slip ≈ 2 wk after GO is reachable; a slip to pay real money from needs ≈ 2.5–3 wk + a parallel run of a past month signed by พี่ฟีน. The engine (pay run + slip + 12:00 lock) is the floor, ≈ 8–10 d.
- **Disagreement, stated as such:** rate. Silver signs 2× (14 d/wk; measured 3–4× on REQ-5002/5004), so the whole plan roughly halves. Sober signs 7 d/wk for money work, so levers re-order and the ≈ 3-month total holds unless engineers are added.
- **A lever only the owner holds:** add engineer seats (sessions). Sober: the total shrinks only with more hands.
- **Before any build:** how login cases get tested (owner signs in or CI) and a test clock for the lock (Tanya); day-1 data = staff list + type + FT base (Sober), past month's paid payroll for the parallel run (Tanya, Silver).
- **Question for the owner, recommendation:** first payroll from the system = **December's**, with November run alongside her Excel; demo on sid ≈ 2 wk after GO. Owner to confirm with พี่ฟีน what "ได้ใช้ภายในสองสัปดาห์" means.
