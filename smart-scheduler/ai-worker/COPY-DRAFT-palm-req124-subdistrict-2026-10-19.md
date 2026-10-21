# COPY-DRAFT (for the owner → Palm): REQ-124 K4 = B, the SUB-DISTRICT under each district (@Silver, 2026-10-19)
> Written by Silver (SA, Team B) at @Porter's request. The owner sends it to Palm. The shape is the back's; the screen and the click-through are Palm's.

**Sub-district (แขวง/ตำบล) under each district: a NEW field; `demographics.district` is unchanged.**
```jsonc
"demographics": {
  "district": { /* unchanged */ },
  "subdistrictByDistrict": {            // key = the district bucket's key
    "1004": {
      "buckets": [
        { "key": "100401", "label": "สีลม", "count": 2 },
        { "key": "unknown", "count": 0 }
      ],
      "known": 2, "unknown": 0, "total": 2   // total = that district's count
    }
  }
}
```
- **The same `Breakdown` shape** as the other cards.
- **The same people and filters as District:** students who attended in `month`, with `badgeValueIds`.
- **Click a district** ⇒ read `subdistrictByDistrict[districtKey]`. A district with no entry has no data.
- **`label`** = the sub-district's Thai name only (the district is already the parent row).
- **Buckets** are sorted by count, `unknown` last; every bucket is sent (no Top N).
