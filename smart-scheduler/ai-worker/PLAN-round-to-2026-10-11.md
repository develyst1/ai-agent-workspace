# PLAN — the whole front-office round, finished by SUN 11 OCT 2026 — @Porter
**Owner, 2026-10-06: "ฉันอยากได้ภายในเสาร์ อาทิตย์นี้ แบบถูกต้องที่สุด."** ⇒ **deadline = end of SUN 11 Oct · "correct" outranks "fast": 🚫 no QA step is cut, 🚫 no uat deploy without a sid pass.**
Scope = `NOTE-frontoffice-remaining-2026-10-05.md` items **1–10 except 4 and 8** (owner, 10-05).
Sizes are **not** Porter's: Team A = `SIZING-teamA-next-round-2026-10-05.md` (+ its 10-06 REQ-112 re-size), Team B = `SIZING-teamB-next-round-pile-2026-10-05.md` + `SIZING-link-a-parent-teamB-2026-10-06.md`.

## 🔑 What actually decides the weekend — read this first
**It is NOT engineer speed.** On 10-05 alone, REQ-111 + TASK-643/645/644+662/663+664/660/661/654/655 went through sid **and** uat. The three real limits are:
1. 🔴 **four REQ-112 decisions that are still unanswered** — Sober cannot write a line of the biggest item until they land. **Every hour they are open is an hour off the back end of the week.**
2. 🔴 **QA runs on a real box, by one person (Tanya), and only after a deploy.** Two sid batches is the most this week can carry honestly.
3. 🔴 **The owner is the only one who deploys and the only one who runs reads on uat.**

## Capacity: 4 engineers × 5 days (Wed 7 → Sun 11), 2 SA Leads
| | Team A (@Sober) | Team B (@Silver) |
|---|---|---|
| BE | @Jason | @Bob |
| FE | @Fern | @Fanta |
| pile | REQ-112 · REQ-114 · copy 3a/3b · ledger root cause · TASK-653/639/652 | TASK-665+667+666 (in flight) · TASK-624+1b · link-a-parent · 5a · 5b · TASK-637 · the 9 LINE accounts |

## The schedule
| when | Team A | Team B | gate |
|---|---|---|---|
| **TUE 6 (tonight)** | @Sober cuts the REQ-112 TASKs **the moment the 4 answers land** | @Silver finishes the TASK-666 + TASK-667 review; TASK-665 closes | — |
| **WED 7** | @Jason: §11.2 — the **"a leave adds a week" helper on EVERY leave door** (M, the core) · @Fern: the reporting sweep — 16 front files stop saying "x of y leaves used" | @Fanta: TASK-624 + 1b (swap any teacher **with** the rate field) · @Bob: link-a-parent BE (S) | — |
| **THU 8** | @Jason: §11.2 continues · @Fern: copy 3a + 3b, TASK-653 (XS each) | @Fanta: link-a-parent FE (S–M) · @Bob: TASK-637 port | ▶️ **sid batch #1 (BOTH teams, whatever is REVIEWED)** |
| **FRI 9** | @Jason: 2b the Undo's expiry rule (S, **absorbs REQ-114 (ii)**) + §11.3 warn-the-admin-on-crossing-expiry (S) · @Fern: 5a + 5b if Team B has not | @Fanta: 5a + 5b (XS) · @Bob: the ledger 69-pair match when the rows arrive | ▶️ **Tanya QA on sid batch #1** |
| **SAT 10** | fix round on QA's findings | fix round on QA's findings | ▶️ **sid batch #2 (REQ-112)** → ▶️ **Tanya QA, both batches** |
| **SUN 11** | — | — | ▶️ **uat deploy (one release note) → Tanya QA on uat → done** |

## 🔴 The one item that does NOT fit, named now and not hidden
**REQ-114 (iii) — "Undo walks the chain in one click" = M+ (≈3–4 days, @Sober, re-sized on Khwan's real case).** It must be built **with** REQ-112 (it shares the expiry rule), and REQ-112 alone is **L**. **Two of those in five days by one pair is not a plan, it is a wish.**
- ✅ **Shipping this week anyway:** **(i)** the refusal that names the hand-steps (XS) and **(ii)** the self-block defect (S, absorbed into 2b). **Those are the two that bite a live admin.**
- ▶️ **(iii) is the thing I would move to next week** — and Khwan already has a working hand-path (`ANALYSIS-REQ-114… §Q2`), so nobody is stuck meanwhile.
- 🚫 **Also sliding if the weekend squeezes: `TASK-639` (S–M) and `TASK-652` (M).** Internal tooling; no screen reaches them; nothing of the customer's waits on them.

## 🚫 What this plan refuses to trade away
- 🔴 **REQ-112 changes WHEN A COURSE THE CUSTOMER PAID FOR STOPS BEING VALID.** It ships **only** on a sid pass with the expiry checked by hand on at least one course of each size (4 / 6 / 10).
- 🔴 **Existing courses: FORWARD-ONLY** (my recommendation, owner's decision #1 below) — 🚫 nothing already on Khwan's screens moves silently.
- 🔴 No team is reported green alone; a sid batch is ONE batch covering both teams (ORDER 14.3).

## ▶️ BALL: the owner — 5 answers, tonight, and the week holds
*(all five are in `inbox/PM.md` → the batch; Porter's recommendation is marked ⭐)*
1. **Existing courses** — forward-only, or recompute their expiry? ⭐ **forward-only**
2. **Undoing a leave takes its week back?** ⭐ **only if that week is still empty**
3. **A make-up past the expiry** — create it and flag the admin, or hold it? ⭐ **create + flag** (her §11.4 "เรียนได้ ตารางยังอยู่")
4. **Which leaves add a week** — all five doors? ⭐ **all**
5. **`ครู{ชื่อ}` spacing** — always a space, or only before a non-Thai name? ⭐ **always**
