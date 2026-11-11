# SPEC-104 — SOM Dashboard API for Palm's front end: **#3 the demographics base** + **#5 Activity / Program by package** (smart-scheduler-back) — Silver, 2026-11-11 — DOCS ONLY (the desk stop holds; no build)
**Why:** the owner split the SOM Dashboard: *"frontend ปาล์มทำ backend เราทำ หมายถึง dashboard นะ"* (SYSTEM-FACTS § SOM Dashboard split). REQ-5009 #3 + #5; ขวัญ's words, verbatim, in `project-docs/customer-2026-11-09-line-som-system/line-som-system-2026-11-09-VERBATIM.txt` l.20–35 and CUSTOMER-ANSWERS (2026-11-09 13:33, 2026-11-10 01:53).
**Read (SB `dong`):**
- `routes/api.ts:359` `GET /api/reports/som` (query `somQuery`, `validation.ts:96`: `month=YYYY-MM` | `from` + `to`, optional `badgeValueIds`);
- `lib/som-contract.ts`: `existingCustomers` (l.192; `totalCustomers` l.305, `recentSingleSession` l.299); `demographics` (attended-in-range people, l.316–320); `activityProgram` (l.194 / 198 / 340–360: today counts **attended sessions** by type).

## The one endpoint (unchanged path, additive fields): `GET /api/reports/som?month=YYYY-MM | from=…&to=… [&badgeValueIds=…]`
Same auth as today (the admin / CEO SOM menu). **Palm's screen calls only this.** The fields below are what it reads for #3 and #5.

### #3 — `demographics`, the base changes
- **Today:** the children with ≥ 1 ATTENDED lesson in the range (that's the "202").
- **New (ขวัญ):** **"Total Customer + 1 HR (Last 3 months)"**. That's the **same children** the Existing Customers cards count:
  - every child holding an **active course or voucher** at the range end (`totalCustomers`' set);
  - **plus** every child counted in **1 HR (last 3 months)** (`recentSingleSession`'s set);
  - each child **once**, archived children out.
- **Shape is unchanged** (`gender` · `ageBand` · `nationality` · `province` · `district` · `subdistrictByDistrict`, each `{ buckets[], known, unknown, total }`), plus one new field: **`demographics.base: "CUSTOMERS_PLUS_RECENT_1HR"`**, so the screen can label it ("based on {known} of {total} customers").
- **Check:** `demographics.gender.total` **=** `existingCustomers.totalCustomers` + the 1 HR children who aren't customers. Tested.

### #5 — the NEW field `activityPackages` (`activityProgram` stays as it is for the old screen until Palm's ships)
```
activityPackages: {
  month, from, to,
  base: "CUSTOMERS_PLUS_RECENT_1HR",
  activities: [{
    key, label,                          // subject id + its name as the screens show it ("Private SURFSKATE")
    total,                               // Σ packages[].count (NOT incl. firstTrial)
    packages: [                          // largest count first
      { kind: "COURSE", size: 10, count: 61 },   // ACTIVE courses of that activity and size, counted as COURSES
      { kind: "COURSE", size: 6,  count: 11 },
      { kind: "SINGLE_SESSION", count: 15 }      // 1 HR: CHILDREN with a 1 HR of that activity in the last 3 months
    ],
    firstTrial: 4                        // 1st Trials of that activity in the range, counted SEPARATELY (her words)
  }]
}
```
**Rules (her words → code):**
- **"นับเป็นจำนวนคอร์ส":** `COURSE` = **the number of active courses** (a child with 2 courses of that activity counts 2), grouped by the course's own activity (`subject_id`) and size (4 / 6 / 10). Active means the same rule as the "Active course" card (status at the range end + a class after it). It never counts class rows.
- **"Voucher ไม่ต้องคำนวณ":** vouchers are **not** counted anywhere in `activityPackages`.
- **1 HR:** `SINGLE_SESSION` = **children** with a non-cancelled 1 HR of that activity in the last-3-months window the 1 HR card already uses. A child with a 1 HR in 2 activities counts once in each.
- **"แยก 1st Trial ออกมา":** `firstTrial` = the 1st Trials of that activity dated in the range. It's **not** in `total`.
- **Every active activity is listed, 0 included,** so the pie / bar has stable colours. An unknown subject goes under `key: "unknown"`, last, only if > 0.
- **The badge filter** applies as it does to the other cards.

### Worked example (her own SURFSKATE / BIKE lines, as the API returns them)
```
{ key: "<surfskate-id>", label: "Private SURFSKATE", total: 87,
  packages: [ { kind: "COURSE", size: 10, count: 61 }, { kind: "SINGLE_SESSION", count: 15 }, { kind: "COURSE", size: 6, count: 11 } ],
  firstTrial: 0 },
{ key: "<bike-id>", label: "Private BIKE", total: 35,
  packages: [ { kind: "SINGLE_SESSION", count: 25 }, { kind: "COURSE", size: 4, count: 10 } ],
  firstTrial: 0 }
```
- **Note for Palm / Porter:** her BIKE header says **54**, but her two listed lines add up to **35**. *Inferred:* her example was partial, with more BIKE package lines not typed. **`total` is always Σ of the listed packages,** so the header can't disagree with its lines.

### What Palm's screen should call / draw
- **One call:** `GET /api/reports/som` with the dashboard's period (and badges).
- **#3:** draw `demographics.*` as today, with the label from `demographics.base`.
- **#5:**
  - one pie (her preference) **per activity**, or one bar / stack when there are many activities (her words allow "รูปแบบอื่น"), using `activities[].packages` with these labels:
    - `COURSE` → «คอร์ส {size} ครั้ง» / "Course {size}x";
    - `SINGLE_SESSION` → "1 HR";
  - `firstTrial` shown separately.
  - **The wording is the PM's.**

## Size (BE, one engineer, excludes QA)
- #3 (people set + `base` + tests) **≈ 0.5 d**
- #5 (the new reader over courses + 1 HR + trials, + tests incl. the worked example) **≈ 0.75–1 d**
- **≈ 1.25–1.5 d**
- **Risk: low.** It's additive (`activityProgram` and the old screen keep working), with no migration.

## Open (for Porter, not blocking the contract)
- **Should the old `activityProgram`** (attended sessions) be **removed** once Palm's screen ships? Default: keep it until the owner retires the old screen.
- **Is the 1 HR window** the same "last 3 months" as the card (calendar months ending at the range end)? Default: yes, reusing the card's window exactly.
