# DECISIONS — สิ่งที่เก้าอี้ตัดสินไปแล้ว

> **อ่านไฟล์นี้ก่อนถามอะไรทั้งสิ้น** คำถามที่ตอบไปแล้ว ถามซ้ำ = เสียเวลาคนนั้นสองรอบ
> ต่อท้ายอย่างเดียว ไม่ลบ ไม่ย่อ · หนึ่งการตัดสินหนึ่งบรรทัด

รูปแบบ: `วันที่ · เก้าอี้ · ตราที่มา · สิ่งที่ตัดสิน`

ตราที่มา (harness `CLAUDE.md` §4): `customer-validated` (ต้องมีวันที่ + ช่องทาง) ·
`customer-asked` · `operator` · `operator-delegated` (ต้องบอกว่ามอบให้เมื่อไหร่) · `team-proposed`

---

<!-- รายการใหม่ต่อท้ายบรรทัดนี้ -->
2026-11-01 · operator · [operator 2026-11-01, to Atlas → MARIE.md ORDER 48] · Mode: **manual** — one session per role; the owner opens each role with `/desk corner-chat <Name>` and names the session `<Name>-CC`
2026-11-01 · operator · [operator 2026-11-01] · *"น่าจะต้องมีทีม engineer สองทีม เทสเตอร์สองคน"* · Team: PM Porter (both teams) · Team A = SA Sober, BE Jason, FE Fern, tester Tanya · Team B = SA Silver, BE Bob, FE Fanta, tester Tefany · inboxes and session names in `TEAMS.md`
2026-11-01 · operator · [operator 2026-11-01] · *"ทำไมจะทำrepo ด้วยกันไม่ได้ smart scheduler ยังทำได้เลย TESTER tefany"* · Both teams share `corner-chat-back` and `corner-chat-front`, split by file area: the PM claims a file area per team on the board (`## Batch claims`) before either team starts
2026-11-01 · operator · [operator 2026-11-01] · *"back ไม่ใช้ nest ใช้ bun hono หรือ bun elysia เท่านั้น"* · Stack: back = **Bun + Hono or Bun + Elysia only, never NestJS**, with Postgres (Atlas recommends Hono; the SA chooses in SPEC-001) · front = Dashboard + Web Chat, stack decided in SPEC-001 · AI through the owner's LLM gateway
