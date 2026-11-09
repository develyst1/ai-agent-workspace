# CHECK: REQ-120 Salary block, broken into pieces the customer can choose to get first
**Porter, 2026-11-07.** Owner: *"ลำดับการส่งมอบเขาบอก ว่า ก้อนแรก ที่เป็นเงินเดือน เขาอยากได้ใช้ไวๆ เราช่วยbreak feature แล้ว list ไปให้เขาเลือก เพื่อส่งมอบเร็วๆได้ก่อน"*.
**Status:** DRAFT. My arithmetic on Sober's 11-05 table (`DELIVERY-FACTS-REQ-5001-s8-part-order-2026-11-03.md`, "Added 2026-11-05 … Sober"). Read-only; no GO, no TASK. **Sober confirms or corrects before anything reaches the customer.**
**Rate:** 7 engineer-days a week per team + ≈ 1 week of review and QA before a piece goes live.

## 1. Porter's draft menu (Team A days; Team B's F4 / F5 run in parallel)
| step | what she gets | d (Sober 11-05) | running d | live ≈ wk after GO |
|---|---|---|---|---|
| **S1: base slip** | sign-in + roles + pay visibility (R0.1/R0.5/R0.2/R0.3 8.8) · base pay profile (R1.2/R1.1 5.0) · pay run + slip + confirm + lock (R1.4/R1.5/R1.6 10.0) · Other ± for every by-hand line (1.1) · coach login to confirm (F6 2.2) | 27.1 | 27.1 | **≈ 5** |
| **S2: + Bonus 100** | the Bonus 100 line (≈ 2; F4 by Team B in wk 1) | ≈ 2 | 29.1 | **≈ 5–5½** |
| **S3: + Extra Hour** | multi-role / STAFF (F3 9.4) + hours reader + Extra Hour (4.5); needs F5 from Team B | 13.9 | 43.0 | **≈ 7** (= today's slice) |
| later | FL pay 1.7 · OT 1.7 · Transportation 3.3 · Merit 1.1 · Bonus 50 1.3 · reports R1.7 2.8 + R1.8 3.3 | | | whole block ≈ wk 10–11 |

Until a line ships, it goes on the slip by hand through Other ±. Commission stays by hand until Stock.
**Bonus 100 depends on a rule not yet decided (A/B, agenda):** under B (the team's plan), the first slips show almost no Bonus 100, so S2 early adds little.

## 2. For Sober (read-only; reply below, Silver where Team B is named)
1. Is S1 a real, shippable slip? Can base pay go live **without F3**? What breaks for a PT+FL person or STAFF before F3?
2. Is F6 needed in S1, or can the CEO confirm on coaches' behalf at first (saves 2.2 d)? Any rule against it (R1.5)?
3. Can Extra Hour for **FT only** ship before F3, with PT's Extra Hour following F3? Size?
4. Would Team B taking a piece (e.g. F3's front end, or S1's screens from the final UI) bring S1 or S3 earlier? Silver: does it push Revenue?
5. Correct any number above; your numbers win.

## 3. Sober's answers (read-only, 2026-11-07) — Team A numbers mine; Team B (Q4 Revenue push) is Silver's, via Porter
**1. Is S1 a real slip? Base pay without F3? What breaks pre-F3?**
- **Yes, S1 is a shippable slip — but its *automatic* content is FT base only.** Base salary needs the person's **type**; today `teachers.type` is a single value, and only **FULL_TIME** exists as a base-earning type until F3 adds **STAFF** and the roles-by-day. So:
  - **FT:** base + confirm + lock works without F3. ✓
  - **STAFF:** the STAFF *type itself* arrives with F3 — so STAFF base is **not** clean in S1 (enter by hand via Other± until F3).
  - **PT + FL:** their pay is hourly, computed by the F3 role-by-day resolver (`R1.1`) — **nothing of it computes before F3**; their S1 slip is base-0 + whatever is typed by hand.
- Nothing *breaks* (no crash) — the slip is real and locks; it is just that **everyone except FT is hand-entered until F3/S3.** Honest framing for the customer: "S1 = the base salary slip for full-time staff; part-time, freelance and STAFF pay is entered by hand on the slip until S3."

**2. Is F6 needed in S1? Can the CEO confirm at first?**
- **F6 is NOT strictly needed in S1 — defer it, save the 2.2 d.** R1.5's cycle is *open → confirmed **or** auto-locked at 12:00 (paid as shown)*. The auto-lock already finalises a slip with no confirm, so S1 can ship with the **CEO reviewing and the slip auto-locking**; the coach's own login-and-confirm (F6) follows later.
- **One caution:** confirming should be the **CEO's**, not an admin's — an admin pressing confirm on a pay total brushes R0.2/R0.3 (admins never see pay totals). CEO-confirm or auto-lock only. No rule against it in R1.5.
- ⇒ **S1 without F6 ≈ 24.9 d ≈ wk 4½–5.**

**3. Extra Hour for FT before F3?**
- **Yes.** FT work every day, so their Extra Hour ("from the 5th weekday teaching hour") needs the **hours reader** but **not** the role-by-day resolver (every class is FT). PT's Extra Hour ("PT days only") does need F3.
- **Size:** FT-only Extra Hour = hours reader (2.8) + the FT Extra-Hour rule (≈ 1.0) ≈ **3.5–4 d** (my estimate; the hours reader is the bulk and is reused by FL pay later). PT's Extra Hour then adds ≈ **+1 d** when F3 lands. So an "S2b: FT Extra Hour" could ship **before** F3, ≈ wk 6.

**4. Team B taking a piece — earlier S1/S3?**
- **S1's screens:** the Salary pages already exist in the final UI (Fanta, TASK-844). If **Team B's FE wires S1's slip / pay-run screens** while Team A's BE builds the engine, S1 could come **≈ 0.5–1 week earlier**. The cost is Fanta off Revenue's front end → **it pushes Revenue** by about the same — **Silver sizes that push** (Porter, please relay; SA↔SA isn't a channel).
- **F3's front end** is small (F3 is mostly BE — 24 type readers + the booking ceiling), so Team B taking it saves little.

**5. Number corrections:** Porter's table is right on my 11-05 figures. Two adjustments:
- **S1 → 24.9 d (≈ wk 4½–5)** if F6 is deferred per Q2 (recommended).
- **Add an optional "FT Extra Hour before F3" step (≈ 3.5–4 d, ≈ wk 6)** between S2 and S3 — it gives FT staff their Extra Hour a week before the full PT/STAFF rollout.
- **Value note (not a number):** S2 "+ Bonus 100" is worth little *early* under rule B (the first slips show almost no Bonus 100). Unless the owner picks **rule A** (pay a renewal of a pre-go-live course), I'd **fold Bonus 100 into the later block**, not make it an early step.

## 4. Silver's answer to Q4: does Team B wiring S1's screens push Revenue? (read-only, 2026-11-07)
Same rate: 7 engineer-days a week per team + 1 week of QA. My estimates, not sized TASKs. Sober's Team A numbers win.

- **A correction first:** the Salary pages in the final UI are **Fern's** (TASK-844, Team A), not Fanta's. Fanta would be wiring another team's design into `backoffice-front`. That's doable, but she's starting from cold.
- **S1's front-end share, my estimate: ≈ 5–7 d.**
  - pay run + cycle ≈ 1.5;
  - the itemised slip ≈ 2;
  - pay profile ≈ 1.5;
  - Other ± ≈ 0.5;
  - hiding by role, plus the blind entry for R0 ≈ 1–1.5;
  - plus BF's first test base (BF has none today).
  - That's the same size as Sober's "≈ 0.5–1 wk earlier".
- **The push on Revenue is the same days moved:** ≈ 5–7 d ⇒ **≈ +1 week**.

| what | today's plan | with Fanta on S1 |
|---|---|---|
| F4 built | wk 1 | **wk 1, holds** |
| Revenue + C1 | wk 7 | **≈ wk 7½–8** |
| whole REVENUE block | wk 11 | **≈ wk 12** |

- **F4 holds** because S1's screens can't be wired before Team A's S1 API exists (≈ wk 2–3). Fanta does F4's small "choose" UI in week 1, then S1 in about wk 2–4.
- **Revenue + C1 may move by less than a full week,** since its early work is mostly back end (Bob). I plan on the full push to be safe.
- **The total barely moves:** the days only change hands. Team A frees the same ≈ 5–7 d, so Team B's later Stock share (≈ 17 d in the rebalance) shrinks by about that much. **Stock's date ≈ unchanged; Sober's Stock number wins.**
- **Two conditions, or the gain vanishes:**
  1. Sober's S1 API contract (slip, pay run, profile, the role-hiding fields) must be **frozen in his SPEC by about week 2**. Fanta can't wire a moving contract, and a mid-build change costs the gain back.
  2. Fanta takes direction **from me only** (the chain). Sober's contract reaches her as my TASK, and any question goes Fanta → me → shared file / Porter → Sober. That handoff runs slower than in-team work, and it's priced in the 7 d end of the range.
- **My line:** worth it only if the customer values Salary ≈ 1 week sooner over Revenue ≈ 1 week later. That trade is the owner's and hers.

### 3b. What S3 computes by itself (Sober, 2026-11-07) — from REQ-120 R1 (lines 55–62)
At **S3** = F3 (roles-by-day + STAFF) + hours reader + Extra Hour. Automatic vs still by hand:
| item | at S3? | why / when |
|---|---|---|
| **STAFF base** | ✅ **auto, wk 7** | STAFF type arrives with F3; base is CEO-set in the pay profile (R1.2) |
| **PT base salary** | ✅ **auto, wk 7** | base salary covers **FT · PT · STAFF**, CEO-set (R1 line 55) — not hourly; the PT type exists once F3 lands |
| **PT Extra Hour** | ✅ **auto, wk 7** | F3 gives the PT days + hours reader + Extra Hour (R1 line 57, "PT days only") |
| **FL teaching pay** | ❌ **NOT at S3 — by hand (Other ±) until ≈ wk 9** | FL pay is its **own** line (R1 line 56: FL hours × per-class-type rate), sized 1.7 d, **not** part of F3/Extra Hour. It ships ≈ 2 wk after the slice |
- **The PT + FL multi-role person (the case F3 exists for):** at S3 their **PT side** (base + PT-day Extra Hour) is automatic, but their **FL weekday hours** are still **typed via Other ±** until the FL-pay line (≈ **wk 9**).
- So S3 = "every FT and PT salary line computes; freelance teaching hours are hand-entered for ~2 more weeks."
