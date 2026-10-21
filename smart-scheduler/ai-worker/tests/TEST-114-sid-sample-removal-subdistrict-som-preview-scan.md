# TEST-114: Palm's merges on sid (sample rows removed · sub-district click-through · SOM regression) + the SOM preview-layer scan (sid + uat)

- **QA:** Tanya
- **Date:** 2026-10-21
- **Environment:** sid: front **`33f9311`** (= `b901a6f` + Palm's `111a9ed` "Drop the Others Program sample rows") + back `fa1a04c`; uat (read only) for the preview scan.
- **Brief:** Porter's ⏸️ / ▶️ entries of 2026-10-21 in `inbox/QA.md` (the last one: sid front `33f9311`, item 1 back in scope).
- **Evidence:** `project-docs/qa-2026-10-21/test114/`

**Verdict: ✅ PASS on all four items.**
- **Item 1:** the sample numbers are gone. An empty programme day shows "—".
- **Item 2:** the sub-district click-through = `subdistrictByDistrict`.
- **Item 3:** the 5 SOM cards and the New-vs-Renewing detail = the API.
- **Preview scan:** **no SOM number on screen comes from the preview layer, on sid or uat**, for any month / branch I tried. Two latent risks are listed below.

**About the builds during the run:**
- Items 2 / 3 and the preview scan first ran while sid was being moved from `b901a6f` to `33f9311`. That merge changed only `ReportsContent.tsx` (the Daily Report), so the SOM results hold for `33f9311`.
- **Item 1 was re-checked on `33f9311` explicitly.** The served JS (83 chunks of `/scheduler/reports`) contains **no** "Skate Crew" / "Rent park" / "October Camp W2".

## 1 · Daily Report: no sample numbers on an empty programme day: ✅ (was TEST-113 🔴 F1)
| View | API | Screen | |
|---|---|---|---|
| 20 Oct, a coach with lessons and **no** programme class (sid has no recent day where All teachers is empty) | all four programmes empty | *"Group — — · ECA — — · Camp — — · Other — —"* | ✅ no sample |
| 20 Oct, **All teachers** (a day WITH a programme: a camp week) | Group — · ECA — · Camp 2 ("Camp 19 - 23 Oct" 2) · Other — | identical, string for string | ✅ real values unchanged |
| The served JS of the page | — | 0 chunks carry the sample rows | ✅ the code is gone, not just hidden |

**uat** still runs `c743304`, so TEST-113 F1 is still visible there until this front reaches uat.

## 2 · SOM District → sub-district click-through = `demographics.subdistrictByDistrict`: ✅
- **Setup:** sid parents have no area codes, so only "unknown" shows. As in TEST-109 §TASK-744, I **temporarily** gave area codes to the parents of the 2 QA parents' October-attending QA kids:
  - → Mueang Bueng Kan / 380101;
  - → Vadhana (Bangkok) / 103902 คลองตันเหนือ.
- **Restored exactly** afterwards (`finally`; read back field by field ⇒ equal to the originals: one all-null, one province text «กรุงเทพมหานคร» only).

| Filter (Oct) | API | Screen (Address card → **District** tab → every chevron opened) | |
|---|---|---|---|
| **All branches** | district `1039` 2 · `3801` 2 · unknown 33; sub: `1039` → คลองตันเหนือ 2 (+ unknown 0) · `3801` → บึงกาฬ 2 (+ unknown 0) | *"วัฒนา, กรุงเทพมหานคร 2 · 50% ▸ **คลองตันเหนือ 2 · 100%** · เมืองบึงกาฬ, บึงกาฬ 2 · 50% ▸ **บึงกาฬ 2 · 100%**"* | ✅ labels, counts, share |
| | the sub-rows' "unknown" = **0** | not shown | ✅ by design (Palm's `978697b`: "Not specified" shown only when non-zero) |
| **Branch "สาขา 1"** (picked in the page's Branch filter) | district: unknown 0; `subdistrictByDistrict` = {} | *"District · No data yet"*; no chevron row | ✅ |

- **Only 2 districts:** sid has no more QA parents with October-attending kids. **Unknown last** could not be exercised on a non-zero sub-row with this data.
- **Already seen before this run** (not this commit's): the District list on screen shows the known districts only, without the "unknown 33" row. It is the card's existing convention ("based on X of Y").

## 3 · SOM regressions (Oct, sid): ✅
| Card | Screen | API |
|---|---|---|
| Today · Confirmed | 5 | `today.confirmed` 5 |
| Existing · Active course | 40 | `activeCourse` 40 |
| Existing · 1st Trial (last 3 months) | 4 | `recentFirstTrial` 4 |
| Existing · 1 HR (last 3 months) | 25 | `recentSingleSession` 25 |
| Existing · Total customers | 52 | `totalCustomers` 52 |
| NvR · Renew Course | 5 | `renewCourse` 5 |

Each NvR card's pop-up rows = the API detail rows = the card: 1st Trial 1 · New this month 9 · New prev month 3 · Renew 5 · Trial no course 1 · Not renewed 12. **0 preview child names** in any pop-up.

## 4 · The SOM "preview layer" (`lib/som/preview.ts`): which numbers on screen are NOT from our API? **None found**
**What the preview fills, read from the code** (`smart-scheduler-front` `33f9311`):
- `fillSomPreview`, on **every** `/reports/som` answer, fills a field only when the API sends `null` / nothing:
  - `existingCustomers.recentSingleSession` (the 1 HR card);
  - `newVsRenewing.newCourseThisMonth / newCoursePrevMonth / trialNotConverted / notRenewed`;
  - `demographics.district` (7 fake Bangkok / Nonthaburi / Phuket districts);
  - `activityProgram` (the Type / 1st Trial splits).
- `CoachCapacitySection`: a preview per real coach when the API has no `coachCapacity`.
- `NvrDetailModal`: **made-up rows with invented child names** ("น้องข้าวหอม", …) **whenever the detail request errors**.
- `useMockData` (`NEXT_PUBLIC_USE_MOCK=true`) would make the whole page mock. It is not on: the screen = the API.

**Scan (read only on both; `som-preview-scan.js`):** for each month × branch filter, is every one of those fields sent by the API, and does each of the 6 NvR detail endpoints answer 200 with as many rows as its card?

| Env | Months × filters | Preview-fill triggers | Detail rows = card |
|---|---|---|---|
| **sid** | 2026-01, 08, 09, 10 × (all + 2 branches) = 12 | **0** | ✅ all |
| **uat** | 2026-01, 08, 09, 10 (uat has no branch badges) = 4 | **0** | ✅ all (e.g. Oct: 101 / 26 / 18 / 33 / 85 / 30) |

The screen side: 0 preview district labels and 0 preview child names on sid's SOM page (§3).

**Latent risks (no number is wrong today; listed for Sober / Palm, not judged):**
1. **The preview code is still shipped and still runs on every SOM answer.** If a field ever comes back null (a new month, a back regression, a partial answer), the page would show a plausible made-up number with no label. The file says *"🧹 Delete this file … once the backend ships every field"*; on the data scanned, every field is shipped.
2. **The NvR pop-up falls back to invented children on ANY error** (timeout, 500, permission), shown as real rows. That is the most customer-visible of the two.
3. A **future month** (`2026-11`): `/reports/som` answers **400**. The page would show its error state, not a preview. Whether the month picker even offers a future month I did not check.

## Clean-up
- **The 2 QA parents were restored exactly** (read back equal).
- Nothing else was written on sid. **uat: read only**, 0 app writes (the guard aborted only Cloudflare's `/cdn-cgi/rum` beacon).

**Scripts (scratchpad):**
- `t114.js`: SOM cards + pop-ups; a first sub-district try whose District-tab click missed.
- `t114b.js`: item 1 under a coach filter + the sub-district click-through, all + branch, with restore.
- `t114c.js`: the served-JS check + a programme day = API.
- `som-preview-scan.js`: sid / uat.

---
# §uat: READ-ONLY smoke · uat front `33f9311` + back `fa1a04c` · 2026-10-21
**Verdict: ✅ PASS. 0 app writes** (the guard aborted only Cloudflare's `/cdn-cgi/rum` beacon). Counts and place names only.

| Check | Result | |
|---|---|---|
| **The served JS** (62 chunks of `/scheduler/reports`) | 0 carry the sample rows | ✅ this build is live |
| **Daily 18 Oct, All teachers** (no programme children) | API: all four empty · screen *"Group — — · ECA — — · Camp — — · Other — —"* · sample shown: **no** | ✅ **TEST-113 F1 closed on uat** |
| Daily 13 Oct, All (ECA 3 · Camp 8 in 2 weeks · Other: 1 untitled item) | screen = API, string for string | ✅ |
| Daily 20 Oct, All (ECA 10 in 2 classes) | screen = API, string for string | ✅ |
| **SOM Oct cards** | Today Confirmed **19** · Active course **187** · 1st Trial 3 months **162** · 1 HR 3 months **94** · Total customers **345** · Renew Course **33**, each = the API | ✅ |
| **District → sub-district** (the top 2 districts, opened from the District tab) | district of 9 kids → 3 non-zero sub-rows, all on screen with label + count, sub total 9 = district 9 · district of 8 → 2 sub-rows, all on screen, 8 = 8 | ✅ |
| | the API has a sub-breakdown for **45 of 45** known districts | ✅ |

**Not exercised:** a non-zero "Not specified" sub-row (both districts opened had unknown 0); "unknown last" could not show here.

**Script:** `u114.js` (lib-uat). **Screenshot:** `project-docs/qa-2026-10-21/uat-test114/`.
