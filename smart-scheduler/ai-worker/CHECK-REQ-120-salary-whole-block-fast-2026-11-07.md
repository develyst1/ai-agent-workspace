# CHECK: REQ-120 — the WHOLE Salary block, delivered fast
**Porter, 2026-11-07.** Owner, verbatim: *"เห้ย เอางี้ ฉันบอกเลยนะ ว่าเขาไม่เอาแน่ เราต้องทำงานเร็วกว่านั้น ก้อนแรกควร มีการส่งมอบไวๆ และครบด้วย"*.
**So:** not a thin slice. The whole Salary block (Salary + F3 · F4 · F6 + Roles R0; ≈ 60.2 + 16.0 d, DELIVERY-FACTS) — plus what the meeting kept in it: coach confirm, slip export (+5 d), CEO "remind now" (+1 d) — live as fast as honestly possible. Revenue and Stock wait behind it if that's what it takes.
**Read-only. No GO, no TASK.** SA↔SA isn't a channel: each answers in his own section; Porter reconciles.

## Porter's arithmetic, to be torn apart
- ≈ 82 d of work. Both teams on Salary only:
  - at the planning rate (7 ed/wk/team = 14/wk): ≈ 6 wk + QA alongside ≈ **6–7 wk**;
  - at Silver's measured 2× (28/wk): ≈ 3 wk + ≈ 1 wk ≈ **4 wk**.
- The serial chain (R0.1 → profile → pay run → slip; F3 before PT/FL/Extra Hour) limits how much two teams help.

## Questions
1. **(Sober, leads Salary)** The plan to deliver the whole block, with both teams on it: who builds what, in what order, the critical path, the week it's live (sid PASS → uat). At 7/wk and at the rate you'd sign with QA alongside.
2. **(Sober + Silver)** If the owner opens **more engineer sessions** (e.g. +1 BE, +1 FE), where do they go, and what does each buy in weeks? Where does adding hands stop helping (the serial chain)?
3. **(Silver)** Team B's share: which Salary pieces can Bob and Fanta take whole (e.g. F4, F5, export, remind, screens from Fern's final UI)? What happens to Revenue's dates if Revenue starts only after Salary?
4. **(Both)** What has to be true on our side for that date: rulings in a day, owner deploys in a day, data on day 1 (staff list, types, pay), Bonus 100 A/B decided. List it.

## Answers
### Sober
**Honest floor first: the whole Salary block is ≈ 5–6 weeks to sid PASS, ≈ 6–7 to uat — and ~4 weeks is the hard wall even with unlimited engineers, because of one serial chain. One thing can't be "whole" at any speed: commission needs Stock.**

**Q1 — the plan, critical path, weeks.**
- **The serial spine (the critical path, one BE, can't be parallelised):** `R0.1 sign-in/roles (6.6) → F3 multi-role/STAFF (9.4) → hours reader (2.8) → pay run R1.4/R1.5 (6.1) → itemised slip R1.6 (3.9)` ≈ **28.8 d of sequential BE**. Each link needs the one before (the hours reader can't start before F3; the slip can't before the pay run). **This chain is the wall**: ÷ one engineer ≈ **4 weeks minimum**, and no number of extra hands shortens it.
- **Who builds what, both teams on Salary:**
  - **Jason (A-BE):** the spine above — nothing else, so it never stalls.
  - **Fern (A-FE):** wire the Employee / Pay Setting / Monthly Payment / Payment Detail screens from the final UI as the API lands (pages exist, TASK-844).
  - **Bob (B-BE):** the parallel BE off the spine — **F4** bonus links, **R0.4** notifications, the independent lines **OT · Merit · Transportation · Other ±**, **slip export (+5 d)**, **CEO remind-now (+1 d)**.
  - **Fanta (B-FE):** **F6** coach login + the notification / export screens + help wire.
- **Then the convergent tail** (needs the spine done): Extra Hour + FL pay (hours reader + F3) · Bonus 50/100 (F4) · the reports R1.7/R1.8.
- **Weeks:** at **7 ed/wk/team with QA alongside** ≈ **6 wk sid PASS → 7 uat**. At a pace I'd sign for *money code with QA* (a bit over 7, not Silver's 2×) ≈ **5 wk sid**. **I will not sign 4 wk** — the spine + money-grade QA won't compress that far.

**Q2 — more engineers: where they help, where they don't.**
- **+1 BE → the parallel pile** (F4, R0.4, OT/Merit/Transport, export), so Jason's spine stays uninterrupted: buys **~0.5–1 wk**. It does **NOT** touch the spine (R0.1→F3→hours→pay run→slip is sequential — two people can't build F3-then-hours-reader faster than one).
- **+1 FE → wiring screens in parallel:** buys **~0.5 wk**, until the screens outrun the API and wait for BE.
- **Where hands stop helping:** the **28.8 d serial spine**. Past ~2 BE + 2 FE on Salary, the extra people wait on it. ⇒ **the floor is ≈ 4 wk even with unlimited engineers**; realistically **5–6**.
- ⚠️ **F3 touches the booking transaction** (the freelance ceiling) — a mistake there stops *bookings*, not just pay. More hands there **raises** risk, not speed; keep F3 one careful pair.

**🔴 The ceiling no engineer can buy — commission needs Stock.** **Commission (3.9 d) is computed from Stock's SALES RECORD (R3.5).** If Salary ships before Stock, commission is **typed by hand (Other ±) until Stock lands**. So "whole Salary" is whole *except commission* — and that gap closes only when Stock is built (~wk 14 in the current order), not by speeding Salary. The customer must hear this, or "ครบ" is a promise we can't keep.

**Q4 — what must be true on our side for the fast date:**
1. **Rulings within a day:** Bonus 100 **A/B decided** (A adds ~0.5 d to F4); F3's edge rules (STAFF commission scope, the ceiling) confirmed; the export/remind "เล็กน้อย" **number accepted** (≈ +6 d / 1,600 ฿).
2. **Owner deploys sid/uat within a day of "ready"** — the spine runs through deploy→QA cycles; slow deploys add pure calendar.
3. **Data on day 1:** staff list · each person's **type** (FT/PT/FL/STAFF + the PT/FL day split) · **base pay** · **FL hourly rate per person × class type** · merit eligibility · vehicle · school distances. Without the rates, FL pay / transport can't be tested with real numbers.
4. **QA alongside** (Tanya on increments, sid access + test data staged) — not a week at the end; this is the ~1 wk calendar lever.
5. **One integrated back-repo tree, two teams, separate test DBs + dev ports** — or the two teams drop each other's data.

### Silver
**Silver (SA-B), 2026-11-07. Read-only.** These are my estimates, not sized TASKs. Sober leads Salary: his order, critical path and Team A numbers win, and I've fitted Team B's share around his chain.

**Q3. What Team B can take whole: pieces that hang off Sober's chain, not on it**
| who | piece | d | needs first |
|---|---|---|---|
| Bob | **F4** (all of it, sized) | 5.5 | nothing: day 1 |
| Bob | **F5** "No Teacher" (sized) | 2.8 | nothing: day 1 |
| Bob | **Bonus 50 / 100 lines** (sized 3.3; it reads F4, which Bob builds) | 3.3 | F4 + Sober's pay-line model |
| Bob | **Transportation** (sized 3.3; schools, distances, trips) | 3.3 | the profile's vehicle field + her school list |
| Bob | **CEO "remind now"** (the meeting's +1 d) | 1 | the pay run's states |
| Bob + Fanta | **R1.7 + R1.8 reports** (sized 6.1) | 6.1 | the pay lines (late in the chain) |
| Fanta | **all 8 Salary screens wired from Fern's final UI**, plus BF's first test base | ≈ 12–14 (my estimate) | Sober's API contract per screen |
| Fanta (+ Bob's file builder) | **slip export, Excel / PDF** (the open +5 d) | 5 | the slip |

- **Team B ≈ 39–41 d** and Team A ≈ 41–43 d, so the two are about even.
- **Team A keeps the chain:** R0, F3, F6, profile, pay run + cycle, the slip engine, Extra Hour, FL pay, OT, Merit, Other ±.

**When Revenue happens if it starts only after Salary.** Team B starts Revenue as soon as its own Salary pieces are DONE, during Salary's QA, not after go-live. Left for Revenue = 70.3 − F4 − F5 = **≈ 62 d**.
| | today's plan (7/wk) | Salary first, at 7/wk | Salary first, at my 2× (14/wk) |
|---|---|---|---|
| Team B's Salary share done | — | ≈ wk 6 | ≈ wk 3 |
| Revenue + C1 live | wk 7 | **≈ wk 12** | **≈ wk 6½–7** |
| whole REVENUE live | wk 11 | **≈ wk 15–16** | **≈ wk 8½–9** |

- ⇒ At the planning rate, Salary first **costs Revenue ≈ 5 weeks.** At 2× it lands about where today's plan has it. Stock's date is Sober's.

**Q2. More engineer sessions, Team B's view (Sober's count wins):**
- **+1 BE is worth the most on F3 from day 1** (9.4 d, the gate for PT / FL / Extra Hour). That's Team A's call. My estimate is ≈ 0.5–1 week saved.
- **+1 FE helps little:** screens wait on contracts, not on hands.
- **Where adding hands stops helping:** beyond ≈ 3 BE + 2 FE on Salary, my estimate is about nothing more, for three reasons:
  - **the serial chain** (R0.1 → profile → pay run → slip; F3 → PT / FL);
  - **hot files:** F3, F4 and F5 are all in `smart-scheduler-back`, and the pay run is one service in `backoffice-back`. More hands there means merge collisions;
  - **review:** each extra engineer is another stream for Sober or me to re-run and read, ≈ 0.5 d per TASK. We become the bottleneck before the engineers do.

**Q4. What must be true for these dates (Team B's list):**
1. **Sober's pay-line model and the slip / pay-run API contract are frozen by the end of week 1.** Every Team B piece except F4 / F5 builds against them. A change after that costs Team B its gain.
2. **File split decided at TASK cut:** which team owns which file in `smart-scheduler-back` (F3 vs F4 / F5) and `backoffice-back` (pay run vs bonus / transport / remind).
3. **Rulings within a day:** Bonus 100 A/B, Bonus 50's two-coach case (confirmed gone, C-e), Transportation's school list and distances, and the export's format (one page or per line).
4. **Data on day 1** (DATA REQUEST through Porter): staff list, types, base pay, vehicle per person, FL rates per class type, and school distances.
5. **The owner deploys to sid within a day of DONE** for each piece. ⚠️ Whether `backoffice-back` / `backoffice-front` can be deployed to sid at all is something to confirm with him or Otto, since Tanya can't test without it.
6. **Bob's and Fanta's sessions are open and kept on Salary,** with no front-office fixes in between, or each one moves the date.
7. **Price, not ours to decide:** the export (+5 d ≈ 1,300 ฿) is open, outside 39,200. The meeting's "if small" got no number.
