# REQ-106 — Rental note not shown in the teacher's view of a session (customer, 2026-09-24)

**Source:** Khwan via owner, 2026-09-24, with two screenshots on `uat` (frontoffice.develyst.online).
- **Teacher's view** (phone, teacher login "TM"): booking กิ๊ก กวิสรา · ATTENDED · VOUCHER · Haris · Private INLINE SKATE · 2026-09-23 14:00–15:00 · Session note "คุณพ่อป้อม (V-KIKI)" — **no Rental section.**
- **Admin view** (desktop, same booking): the same + **"Rental: Rent 200 / Full Set (inline Skate Size 45-46 + Protective Gear Set) · paid".**
Khwan: "โน๊ต rental ไม่ขึ้นเวลาสร้างตารางให้ครู — หรือให้เลือกส่วนไหนเพิ่มในสิทธิ์?" (is it a permission she must grant?)
Intent: the coach must see what rental gear to prepare for the session.

## For @Sober (analysis first)
Is the Rental block gated by a permission key the Teacher role lacks (or by the teacher-scope mask of REQ-097)? If it's a grant: which key, and should the Teacher role get it by default (read-only, no price?) — rental PRICE vs gear DESCRIPTION: coach needs the gear, arguably not the money. Recommend + size.

## §2 — SEPARATE complaint (customer, 2026-09-24, on uat): "turned off a permission to hide a value, but it's still visible"
Owner's reading: Khwan disabled some "see value" permission and still sees the value; her "อันนี้คืออะไรคะ" on our release-note line ("ปิดจุดที่คนไม่มีสิทธิ์ดูค่าสอน…") is a sarcastic "what did you actually do?".
Porter's error: the release note said the Camp coach-pay leak was closed, but that fix (TASK-463) is only on `sid`; she tested on `uat`. Note wording didn't make the sid/uat split clear enough.
Facts pending from the customer: WHICH permission she turned off, WHICH screen/value still shows, WHICH account she looked with.
Candidate causes to check (@Sober): (a) super-admin bypasses role grants; (b) grants apply only at next login (session carries them); (c) the surface is one of the leaks fixed only on sid (TASK-463 camp rateMinor) or not covered by any key.
- CORRECTION §2: owner clarified — Khwan only asked WHERE the permission fix is (what we changed), not a failed-permission report. No defect; §2 downgraded to 'explain'. Sober: no action needed on §2 beyond the rental add-on.

## §3 — OWNER ruling 2026-09-24: (ก) GEAR ONLY, fold into the pending uat batch
Teacher view shows the rental GEAR read-only (rental item/code + remark, e.g. "Full Set (inline Skate Size 45-46 + Protective Gear Set)") — NO price, NO paid/unpaid state, NO buttons. Admin view unchanged. Ships with the held uat batch after Tanya checks it.
