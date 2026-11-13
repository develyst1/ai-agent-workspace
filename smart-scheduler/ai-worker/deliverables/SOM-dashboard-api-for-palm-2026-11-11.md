# SOM Dashboard: API for the 2 new charts (backend by our team, frontend by Palm)

Repo: `smart-scheduler-back`. Status: **contract only; the backend is not built yet.** We will tell you when it is on sid.

## One endpoint, the same as today
`GET /api/reports/som?month=YYYY-MM` (or `from=…&to=…`) `[&badgeValueIds=…]`

The auth is the same as today. The screen calls only this endpoint. The two changes below are additive, so the existing fields keep working.

## 1) Gender / Nationality: `demographics`, the base changes
- **Today:** children with at least 1 attended lesson in the range.
- **New (ขวัญ):** "Total Customer + 1 HR (Last 3 months)". That is:
  - every child holding an active course or voucher at the range end;
  - plus every child counted in the "1 HR (last 3 months)" card;
  - each child once; archived children are left out.
- **The shape is unchanged:** `gender` · `ageBand` · `nationality` · `province` · `district` · `subdistrictByDistrict`, each `{ buckets[], known, unknown, total }`.
- **One new field:** `demographics.base = "CUSTOMERS_PLUS_RECENT_1HR"`, so the screen can label it, e.g. "based on {known} of {total} customers".

## 2) Activity chart: the NEW field `activityPackages`
The old `activityProgram` stays as it is until the new screen ships.

```
activityPackages: {
  month, from, to,
  base: "CUSTOMERS_PLUS_RECENT_1HR",
  activities: [{
    key, label,                          // activity id + its display name ("Private SURFSKATE")
    total,                               // sum of packages[].count (firstTrial NOT included)
    packages: [                          // largest count first
      { kind: "COURSE", size: 10, count: 61 },   // active COURSES of that activity and size
      { kind: "COURSE", size: 6,  count: 11 },
      { kind: "SINGLE_SESSION", count: 15 }      // 1 HR: children with a 1 HR of that activity in the last 3 months
    ],
    firstTrial: 4                        // 1st Trials of that activity in the range, shown separately
  }]
}
```

**Rules:**
- `COURSE` is the number of active **courses** (a child with 2 courses counts 2), grouped by the course's activity and size (4 / 6 / 10).
- Vouchers are not counted.
- `SINGLE_SESSION` is the number of **children** with a 1 HR of that activity in the last-3-months window.
- `firstTrial` is not part of `total`.
- Every active activity is listed, including 0, so the colours stay stable. An unknown activity is listed last, only when it is above 0.
- The badge filter applies as it does to the other cards.

**Example (ขวัญ's own lines):**
```
{ key: "<surfskate-id>", label: "Private SURFSKATE", total: 87,
  packages: [ { kind: "COURSE", size: 10, count: 61 }, { kind: "SINGLE_SESSION", count: 15 }, { kind: "COURSE", size: 6, count: 11 } ],
  firstTrial: 0 }
```

## What the screen draws
- **#1:** `demographics.*` as today, labelled from `demographics.base`.
- **#2:**
  - one pie per activity, as ขวัญ prefers. If there are many activities, a bar or stack is fine; she said another format is OK.
  - Labels: `COURSE` → «คอร์ส {size} ครั้ง» / "Course {size}x"; `SINGLE_SESSION` → "1 HR".
  - `firstTrial` is shown on its own.
