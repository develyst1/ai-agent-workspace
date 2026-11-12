# DECISIONS — สิ่งที่เก้าอี้ตัดสินไปแล้ว

> **อ่านไฟล์นี้ก่อนถามอะไรทั้งสิ้น** คำถามที่ตอบไปแล้ว ถามซ้ำ = เสียเวลาคนนั้นสองรอบ
> ต่อท้ายอย่างเดียว ไม่ลบ ไม่ย่อ · หนึ่งการตัดสินหนึ่งบรรทัด

รูปแบบ: `วันที่ · เก้าอี้ · ตราที่มา · สิ่งที่ตัดสิน`

ตราที่มา (harness `CLAUDE.md` §4): `customer-validated` (ต้องมีวันที่ + ช่องทาง) ·
`customer-asked` · `operator` · `operator-delegated` (ต้องบอกว่ามอบให้เมื่อไหร่) · `team-proposed`

---

<!-- รายการใหม่ต่อท้ายบรรทัดนี้ -->
2026-11-12 · operator · [operator 2026-11-12, to Atlas → MARIE.md ORDER 65] · *"เปิดโต๊ะให้หน่อยพอดีฉันมีงานฟรีแลนซ์ในการรับสอนเขียนโปรแกรมสอนโปรแกรมมิ่งหรือว่าสอน AI พวกเนี้ยเปิดโต๊ะให้หน่อย"* · Desk `code-class` opened for freelance teaching (programming basics + AI)
2026-11-12 · operator · [operator 2026-11-12, to Atlas → MARIE.md ORDER 65] · Mode: **manual** — one session per role; the owner opens each with `/desk code-class <Name>` and names the session `<Name>-CLS`
2026-11-12 · operator · [operator 2026-11-12, kept Atlas's proposal unchanged] · Team: one team — PM Porter · SA Sober (curriculum + repo folder structure) · FE Fern (slides, lesson pages, example code) · QA Tanya (tries every exercise) · **no BE seat** · learners reached only through the owner
2026-11-12 · operator · [operator 2026-11-12] · *"ให้ทีม https://github.com/develyst1/code-class-docs.git clone ลงไปตรงที่ฉันทำประจำแล้วทำงานได้เลย"* · The course repo is `code-class-docs` (path in `machine.local.md`), cloned by Marie 2026-11-12; only `main` exists
2026-11-12 · operator · [operator 2026-11-12] · First work = **REQ-001** from the owner's words (`SYSTEM-FACTS.md`): (a) folder structure for `code-class-docs` that reads well to a Fastwork client, (b) the class schedule table, (c) the course outline: basics + AI. **The SA proposes; the owner approves through the PM before content is written.**
2026-11-12 · operator · [operator 2026-11-12, chat to the PM: "เอาตามนั้น" on the PM's recommendation] · Decided: the repo keeps the **12-class path as the full course** (12 × 2 h = 24 h = the 4,500 THB tier); **the first learner (8 h, 2026-11-16..19 + bonus 11-20) takes classes 01–04**, re-cut so those four evenings end with one small working calculation program (SA option A table: `talks/SA-SPEC-001-8-hour-shape-option-2026-11-12.md`), and the team makes class 01 material ready before 2026-11-16 · Covers: course shape, which classes this learner gets, deadline for class 01 · Neighbouring cases: a buyer of 16 h takes 01–08, 24 h takes 01–12 [PM-interpreted, cheap to change] · Open: the other 6 lines of the SPEC-001 §6 pack (languages, AI share, format, course name, one-repo-many-courses) are still AC-1 — not approved by this line; real dates in the repo — PM-decided no (team default, cheap to undo)
