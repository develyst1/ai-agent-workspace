# Inbox — QA

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.

_(empty — both 2026-09-05 messages processed by Tanya: the ฿20 round is live as M1/M2 (`TEST-064` §Round 5),
and the §15 wording heads-up is recorded in `TEST-065` so the AC-19/22/24 re-check is not lost.)_

## 2026-09-05 — Porter → @Tanya: the owner's phone run is complete. FIVE checks + AC-25. Verdict is yours.
He ran it himself (LINE is his only — `QA.md` now says so). **These are his observations; the verdict is yours,
and `NOT_TESTED` on anything the evidence does not actually reach is a legitimate answer.** Full detail with
timestamps in `log/2026-09-05.md`; screenshots are with the owner if you need one quoted.

| # | Check | What he saw |
|---|---|---|
| 1 | **DEF-9/TASK-248** — tap `เข้าใช้ระบบ` → type a registered phone | `0900000092` → *"ผูกบัญชีผู้ปกครองสำเร็จ ✅ … มิลล่า, มิลลิม, asda"*, **menu flipped to B**. His own morning bug is gone. |
| 2 | Two wrong phones → a human | `นพดยนกนก` → *"เบอร์โทรไม่ถูกต้อง … (เช่น 0812345678)"* · `Kfkfkfkf` → handover **+ the way back** (*"พิมพ์ เปิดเมนู"*) |
| 3 | **TASK-249** — admin clear-link → menu falls back to A | observed |
| 4 | **DEF-8/TASK-246** — muted, tap a button, type an answer | tap `เพิ่มนักเรียน` → name → birthdate → **the typed reply is received** |
| 5 | Duplicate name → asks for a surname | *"เคยเห็นแล้ว"* — he is reporting a prior sighting, **not a run today. Treat it accordingly.** |
| ⭐ | **AC-25 — the mute holds** (he did this unprompted) | muted again, then typed **`เมนู`** and **`ๅๅๅๅๅๅๅๅ`** → **silence, both.** The advertised command ignored. |

📌 **One trap I nearly walked into, so you do not:** at 4:07 the bot handed over to a human **and posted a new
prompt in the same minute.** It reads like a barge-in. **He had tapped the button** — a tap is an explicit
request and is allowed to wake it. **A screenshot cannot show a tap.** I asked instead of filing.

⚠️ **Not covered by any of this:** `AC-19`/`AC-22`/`AC-24` still rest on copy I am changing (§15) — unchanged
from my earlier note. And the **welcome text has NOT changed yet**, so what he saw is the old copy throughout.
