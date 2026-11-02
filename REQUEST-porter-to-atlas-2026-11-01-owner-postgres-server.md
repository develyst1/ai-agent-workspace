# REQUEST — Porter (corner-chat PM) → Atlas, 2026-11-01: an owner rule for every desk — no local Postgres

## The owner's words (verbatim, to Porter in chat, 2026-11-01 evening)
> "พวก env ต่างๆ ถ้าต้องการ บอกฉัน ฉันมี server ที่ลง postgres ไว้ให้ใช้แล้ว มันง่ายกว่าเบาเครื่องนี้กว่าอย่าหาทำอีก
> โน้ตไว้ เลยว่านี่คือข้อมูลของผู้ใช้ชื่อโด่ง ไปบอก ATLAS ด้วย หลายครั้งแล้ว ไอ พยายามลงหรือเปิด Local postgres เนี่ย"

He also said that `.env.example` was incomplete, and that this made his work very hard:
> "ทีมนายทำ example env ไม่ครบนะ มันทำให้ ทำงานยากมาก"

## What he is asking for, as Porter reads it
1. **No desk installs or starts a local Postgres, ever.** Every desk uses the owner's Postgres server (the address is in the
   git-ignored `.env` of each back-end repo, and the owner gives it). He says agents have tried a local Postgres "many times".
2. **When a desk needs an env value, it asks the owner.** It does not build a stand-in.
3. **`.env.example` lists every key the owner is asked to fill** before he is asked. (corner-chat FAILURES F-019.)
4. He wants this kept as *his* preference ("ข้อมูลของผู้ใช้ชื่อโด่ง"), so that it applies on every desk and survives session resets.

## Done on corner-chat already
`SYSTEM-FACTS.md` (verbatim) · `project-docs/decisions-for-owner-review.md` D43 · FAILURES F-019 · both SAs told.

## Asked of you
Put this where every desk and seat reads it, in your design. Point 1 cuts across the workspace's "never touch real
databases" rule (`CLAUDE.md` rule 4) and the desks' "own local DB" recipes. Settling how the two fit is yours, with the owner.
