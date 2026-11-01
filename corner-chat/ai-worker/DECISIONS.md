# DECISIONS — สิ่งที่เก้าอี้ตัดสินไปแล้ว

> **อ่านไฟล์นี้ก่อนถามอะไรทั้งสิ้น** คำถามที่ตอบไปแล้ว ถามซ้ำ = เสียเวลาคนนั้นสองรอบ
> ต่อท้ายอย่างเดียว ไม่ลบ ไม่ย่อ · หนึ่งการตัดสินหนึ่งบรรทัด

รูปแบบ: `วันที่ · เก้าอี้ · ตราที่มา · สิ่งที่ตัดสิน`

ตราที่มา (harness `CLAUDE.md` §4): `customer-validated` (ต้องมีวันที่ + ช่องทาง) ·
`customer-asked` · `operator` · `operator-delegated` (ต้องบอกว่ามอบให้เมื่อไหร่) · `team-proposed`

---

<!-- รายการใหม่ต่อท้ายบรรทัดนี้ -->
2026-11-01 · operator · [operator 2026-11-01, to the PM] · *"ต่อจากนี้ ไม่ต้องถามฉันแล้ว ทำงานกันได้ เลย … เป้าคือ ทำให้เสร็จใช้งานได้ หากมีคำถามให้ รวมหัวกันคิด แล้วตัดสินใจไปก่อน แล้ว ลิสต์ ไว้ … ทำไปจนกว่่าจะติดไปต่อไม่ได้จริงๆ"* · **Standing: the desk stops asking the owner; goal = done and usable; questions are settled by a team round, decided, and listed in `../project-docs/decisions-for-owner-review.md`** · Covers: product and design questions · Neighbouring cases: things only he can give (accounts, keys, server, branch, git command, any send to a real system) are blocks, listed in §B there, not questions · Open: none
2026-11-01 · operator · [operator 2026-11-01, to Atlas → MARIE.md ORDER 48] · Mode: **manual** — one session per role; the owner opens each role with `/desk corner-chat <Name>` and names the session `<Name>-CC`
2026-11-01 · operator · [operator 2026-11-01] · *"น่าจะต้องมีทีม engineer สองทีม เทสเตอร์สองคน"* · Team: PM Porter (both teams) · Team A = SA Sober, BE Jason, FE Fern, tester Tanya · Team B = SA Silver, BE Bob, FE Fanta, tester Tefany · inboxes and session names in `TEAMS.md`
2026-11-01 · operator · [operator 2026-11-01] · *"ทำไมจะทำrepo ด้วยกันไม่ได้ smart scheduler ยังทำได้เลย TESTER tefany"* · Both teams share `corner-chat-back` and `corner-chat-front`, split by file area: the PM claims a file area per team on the board (`## Batch claims`) before either team starts
2026-11-01 · PM (Porter) · [operator-delegated 2026-11-01: *"แต่แล้วแต่นาย ไปรวมหัวคิดกัน เอาว่าเอาแบบไหน"*; team round SA Sober + QA Tanya] · **AI filter shape = fixed rules → layer 1 (addressed?, meaning, summary) → layer 2 (raw + summary vs conditions → %) → % ≥ the user's bar → notify with an "about" line** · Covers: every incoming message after intake; model per layer is a setting; fail open when the gateway is down · Neighbouring cases: a layer-1 "spam" still goes to layer 2 · Open: the default bar (from a labelled corpus run, 70 % until then); whether the user's name **without a tag** is caught (owner's ⚠️) · Detail: `../project-docs/requirement-understanding-2026-11-01.md` § "PM decision after the round"
2026-11-01 · PM (Porter) · [operator-delegated 2026-11-01: *"เอาแล้ว แต่นาย กับ ทีมนายตัดสินใจเลย"*; built on SA Sober + QA Tanya's round replies] · **LINE groups also take in a message that names the user without a tag**: each user keeps a list of their name + nicknames; every group message's text is matched against it **in memory, by plain text match, no AI**; a non-matching message is dropped unread: **not stored, not sent to AI, no row** · a match enters the AI filter like a tag does · Covers: LINE groups (mail: "addressed" = To: vs Cc:/list, SA) · Neighbouring cases: tag, reply-to-user, @All unchanged · Open: false matches on common names (the user edits the list; the corpus run counts them); QA adds "non-match leaves no stored row" privacy tests
2026-11-01 · operator · [operator 2026-11-01] · *"back ไม่ใช้ nest ใช้ bun hono หรือ bun elysia เท่านั้น"* · Stack: back = **Bun + Hono or Bun + Elysia only, never NestJS**, with Postgres (Atlas recommends Hono; the SA chooses in SPEC-001) · front = Dashboard + Web Chat, stack decided in SPEC-001 · AI through the owner's LLM gateway
