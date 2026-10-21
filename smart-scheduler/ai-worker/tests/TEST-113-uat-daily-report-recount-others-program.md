# TEST-113: uat READ-ONLY Daily Report recount, every card incl. Others Program (API = recount = screen)

- **QA:** Tanya
- **Date:** 2026-10-21
- **Environment:** uat (`frontoffice.develyst.online`): back `fa1a04c` + front `c743304`
- **Brief:** Porter's ▶️ TEST-113 entry; REQ-124 → "2026-10-21: the customer asks…" (ฟีน: *"ข้อมูลทั้งหมดตรงแล้วใช่ปะคะ พวก group ด้านล่าง"*)
- **Safety:** read only. My guard aborted every non-GET; the only ones were Cloudflare's own analytics beacon (`/cdn-cgi/rum`). **0 app writes.**
- **In this file:** counts only. Coaches masked; no child names. Programme / school / camp-week titles are kept, since they are what the cards show.
- **Evidence:** `project-docs/qa-2026-10-21/test113/`

**Verdict:**
- **The DATA is right:** every number the API serves = my independent recount, on every card, for All teachers and **every one of the 25 coaches**, on all 3 days.
- **The SCREEN = the API, with one 🔴 exception:** when a day (or a coach) has **no** group / ECA / camp / other children at all, the **Others Program section shows made-up sample numbers** instead of "—".

## The days
| Day | Why | Rows | Shape |
|---|---|---|---|
| **Tue 20 Oct** | a weekday, ECA (Khwan's 3-teacher STA class) | 29 | 14 lessons attended, 5 1 HR cancelled; ECA 2 live (+1 cancelled), both multi-coach; 7 Other rows, all CANCELLED; no camp, no GROUP |
| **Sun 18 Oct** | a weekend, the busiest day in 14 | 145 | 94 attended, 21 on leave, 24 cancelled lessons; 6 Other rows all CANCELLED; **no** ECA / camp / GROUP |
| **Tue 13 Oct** | camp + ECA + Other | 65 | **2 camp weeks** (10 camp hour rows); 1 ECA (multi-coach); 18 Other rows (17 CANCELLED, 1 ATTENDED with no title and no head count) |

uat has **no GROUP rows at all** in the last 14 days, so the Group card can only ever be "—" on uat today.

## 1 · API = my recount (from `/bookings` + `/calendar`, not from the report)
| Day | All teachers: 9 counters + by-type ×3 + workload | Others Program (4 programs, items, totals) | `?teacherId`, all 25 coaches (cards + Others Program) |
|---|---|---|---|
| 20 Oct | ✅ TB 14 · Att 14 · Conf 14 · Pend 0 · Await 0 · Leave 0 · Canc 5 · 100% · No-show 0 | ✅ ECA **10** = STA… 7 + ABBY… 3 · Group / Camp / Other — | ✅ 10 coaches non-empty, 0 mismatch |
| 18 Oct | ✅ TB 115 · Att 94 · Conf 94 · Pend 0 · Await 0 · Leave 21 · Canc 24 · 82% | ✅ all four empty (null) | ✅ 22 non-empty, 0 mismatch |
| 13 Oct | ✅ TB 30 · Att 28 · Conf 28 · Pend 0 · Await 0 · Leave 2 · Canc 6 · 93% | ✅ ECA 3 (ABBY… 3) · **Camp 8 = "12-16 Oct" 6 + "12-13 Oct" 2** · Other: one item "OTHER" with no number | ✅ 13 non-empty, 0 mismatch |

**My recount's rules** (the agreed ones, written independently of the report code):
- **Lessons** = the 4 types, not group seats, not `pendingSlot`. Confirmed = CONFIRMED + ATTENDED + NO_SHOW. Total booked = Confirmed + On leave. Pending = PENDING + EXTENDED. Awaiting = PAUSED 1st Trial / 1 HR.
- **Workload** = every non-cancelled, non-paused row, once for each coach on it (main + extras).
- **Others Program:**
  - CANCELLED / PAUSED rows are out;
  - an ECA / Other class counts its head count **once per class** (same series or title + main coach + date + back-to-back hours);
  - same-name classes merge;
  - Camp = each camp week's own kid count for that day, **including a week with no coach** (All teachers only);
  - under a coach filter, only that coach's rows.

## 2 · The screen = the API (a fresh page per view, EN)
| View | Cards (rate, a/b, 7 counters) | By type (Attended / Confirmed) | Others Program | Workload |
|---|---|---|---|---|
| 20 Oct · All | ✅ | ✅ | ✅ | ✅ 10 rows (names, order, att / conf / total) |
| 20 Oct · coach C1 (an extra coach of a 3-coach ECA) | ✅ | ✅ | ✅ (sees the ECA) | hidden by design (only for All teachers) |
| 20 Oct · coach C2 (programme coach) | ✅ | ✅ | ✅ | hidden by design |
| 20 Oct · coach C3 (lessons only) | ✅ | ✅ | **🔴 sample numbers** (API: all empty) | hidden by design |
| **18 Oct · All** | ✅ | ✅ | **🔴 sample numbers** (API: all empty) | ✅ 20 rows |
| 18 Oct · coaches C4, C2, C5 | ✅ | ✅ | **🔴 sample numbers** (API: all empty) | hidden by design |
| 13 Oct · All | ✅ | ✅ | ✅ (ECA 3 · Camp 8 = 6 + 2 · Other "OTHER —") | ✅ 12 rows |
| 13 Oct · coach C6 (extra coach of the ECA), C7 (camp coach) | ✅ | ✅ | ✅ | hidden by design |
| 13 Oct · coach C5 (lessons only) | ✅ | ✅ | **🔴 sample numbers** (API: all empty) | hidden by design |

No "NaN" / "undefined" anywhere.

## 🔴 F1: when the day has no programme children, the Others Program section shows SAMPLE numbers as if they were real
- **What the screen shows** (`others-mismatch-*.png`), identical every time:
  - **Group 8** (Balance Play 3, Skate Crew 5) · **ECA 13** (STA 5, ISB 8) · **Camp 8** (October Camp W2 8) · **Other 10** (Birthday 8, Rent park 2);
  - no label, no dimming.
- **What the data says:** the API sends all four programs empty, which my recount confirms. uat has no GROUP rows at all, so "Group 8" cannot be real.
- **When:** every view where all four programs have no item. In this run: **18 Oct for All teachers** (a normal weekend) and any coach with no programme class on 20 / 13 / 18 Oct. On a weekend with no ECA / camp, **the owner and ฟีน would see these numbers**.
- **The code, read** (`smart-scheduler-front` `c743304`, `src/components/partials/Reports/ReportsContent.tsx`):
  - lines 244–257: `SHOW_SAMPLE_WHEN_EMPTY = true` + `SAMPLE_PROGRAMS`. The comment reads *"🚧 TEMPORARY — sample rows shown while the day has no group-program data (the backend does not send `kidsByProgram` yet…) … Rendered like real data (no label, no dimming — client request) … Delete this … once `/reports/daily` ships `kidsByProgram`"*;
  - line 269: `isSample = programs.every((p) => p.items.length === 0) && SHOW_SAMPLE_WHEN_EMPTY`.
  - The back has shipped `kidsByProgram` since 10-19 (TASK-743), so the stated condition for deleting it is met. **The fix is Sober's / Palm's call; I only report the screen and the line.**
- **Relevance to ฟีน's question:** her "พวก group ด้านล่าง" may well be these cards. If she looked at a day without programme children, the Group / ECA / Camp / Other numbers she saw were the sample. Not confirmed; for Porter.

## Things a person might read as wrong even though they follow the agreed rule (listed, not judged)
1. **ECA is counted once per class, not per coach and not per hour.** 20 Oct: Khwan's STA class has 3 coaches and shows **7** once. Under each of its coaches' filters it also shows 7 (the class is theirs too), so the per-coach ECA numbers don't add up to the day's.
2. **Camp counts each camp WEEK's children that day, even a week with no coach that day** (13 Oct: "12-16 Oct" 6 + "12-13 Oct" 2 = 8). Under a coach filter, a coach-less week is in no coach's view.
3. **An "Other" class with no title and no head count shows as an item called "OTHER" with "—"** (13 Oct, 1 attended row). It reads like a blank line.
4. **Other items only come from live rows:** 20 Oct and 18 Oct had 7 / 6 Other rows, **all cancelled**, so "Other —" is correct, though someone looking at the calendar may expect to see them.
5. **Total booked excludes Pending** (TASK-738: Confirmed + On leave). On these days Pending was 0, so it didn't show.
6. **The workload list disappears when a coach is picked** (by design: "only when viewing all teachers").
7. **The Group card is always "—" on uat:** there are no GROUP rows on uat in the last 14 days.

## Not covered
- Thai labels (the numbers are the same data; EN was used for parsing).
- Days older than 13 Oct.
- `noShow` / `byBookingType` are in the API only (not on the screen). Both = recount.

**Scripts (scratchpad):**
- `u113scan.js`: picking the days.
- `u113.js`: API = recount for All teachers + 25 coaches, plus a first screen pass. My filter-clear failed between days there, so its later "All" screen reads were really one coach's view; superseded by `u113b.js`.
- `u113b.js`: the screen, with a fresh page per view.
- `u113s0.js`: the layout dump.

**Closed 2026-10-21:** F1 is fixed on sid (TEST-114 §1, front 33f9311) and uat (TEST-114 §uat): an empty programme day shows "—"; the sample code is gone from the served JS.
