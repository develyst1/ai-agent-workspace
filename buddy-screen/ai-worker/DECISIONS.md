# DECISIONS — สิ่งที่เก้าอี้ตัดสินไปแล้ว

> **อ่านไฟล์นี้ก่อนถามอะไรทั้งสิ้น** คำถามที่ตอบไปแล้ว ถามซ้ำ = เสียเวลาคนนั้นสองรอบ
> ต่อท้ายอย่างเดียว ไม่ลบ ไม่ย่อ · หนึ่งการตัดสินหนึ่งบรรทัด

รูปแบบ: `วันที่ · เก้าอี้ · ตราที่มา · สิ่งที่ตัดสิน`

ตราที่มา (harness `CLAUDE.md` §4): `customer-validated` (ต้องมีวันที่ + ช่องทาง) ·
`customer-asked` · `operator` · `operator-delegated` (ต้องบอกว่ามอบให้เมื่อไหร่) · `team-proposed`

---

<!-- รายการใหม่ต่อท้ายบรรทัดนี้ -->
2026-10-28 · operator · [operator 2026-10-28] · เปิดโต๊ะ `buddy-screen` — "AI for Kids V1 — แอปบนจอทีวี + กล้อง ให้ AI คุยและชวนเด็กทำกิจกรรม" · เพื่อใคร: ผลิตภัณฑ์ของเจ้าของเอง (ตอบ "ไปเลย" รับค่าตามที่ Atlas เสนอ, MARIE.md ORDER 37)
2026-10-28 · operator · [operator 2026-10-28] · งานแรก: "อ่าน requirement V1 + spec repo แล้วให้ SA เสนอ stack/สถาปัตยกรรม (role-sa §4.0) ก่อนเขียนโค้ด"
2026-10-28 · operator · [operator 2026-10-28] · โหมด **manual** — หนึ่ง session Claude CLI แบบ interactive ต่อหนึ่งบทบาท ใน tmux · **ห้ามใช้ `claude -p`**
2026-10-28 · operator · [operator 2026-10-28] · ทีมเดียว: Porter (PM+BA) · Tanya (QA) · Sober (SA) · Jason (BE) · Fern (FE+designer) · รหัสสั้น BUD → session `<Name>-BUD`
2026-10-28 · operator · [operator 2026-10-28] · หน้าที่เจ้าของ: อนุมัติดีไซน์ · deploy
2026-10-28 · operator · [operator 2026-10-28] · repos: `buddy-screen-spec` (repo requirement ของเจ้าของ — ทุกบทบาทอ่านอย่างเดียว) · `buddy-screen-front` · `buddy-screen-back` **ทีหลัง** — ระหว่างนี้ไม่มีโค้ดเบส BE, ที่นั่ง BE ว่าง, SA ออกแบบแค่ API contract
2026-10-28 · operator · [operator 2026-10-28] · git ตาม `CLAUDE.md` §6 (SA พิมพ์สามคำสั่งของเจ้าของ ที่ PM ส่งต่อ) · ระบบ: **เครื่องนี้เท่านั้น**
2026-10-28 · operator · [operator 2026-10-28] · ข้อมูลอ่อนไหว: **มี** — ใบหน้า เสียง ชื่อของเด็ก · ห้ามมีข้อมูลเด็กจริงในไฟล์ของโต๊ะ test fixture หรือ log ใดๆ — ใช้ข้อมูลสังเคราะห์เท่านั้น
2026-10-28 · operator · [operator 2026-10-28] · เก้าอี้: customer = skipped (ยังไม่มีลูกค้า ⇒ ไม่มีตรา `customer-validated` เลย) · designer / platform / deploy → operator
