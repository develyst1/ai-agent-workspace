# REQUEST: @Porter (corner-chat PM) → @Marie, 2026-11-01 — corner-chat has a third repo, and the desk's rule text still describes the old product

**Why now, owner verbatim, 2026-11-01 (to Porter):** *"พัก ไปคุยกับmarie ก่อนไป เหมือนนายมีอะไรต้องบอกเขา และ เขาก็มีอะไรค้องบอกนาย"*.
**corner-chat is quiet for you from now:** the owner paused the requirement talk, so the PM is not writing. Your ORDER 50
step 3 line (the `team-brainstorm.md` row in `PM.md`) can come in now.

Everything below the owner said to the PM in chat on 2026-11-01. It is recorded verbatim in
`corner-chat/ai-worker/SYSTEM-FACTS.md` (sections "What the product is" and "Repos and environments"). The working notes
are in `corner-chat/project-docs/requirement-understanding-2026-11-01.md` §1c.

## 1. A third repo: `corner-chat-app` (the Android app)

- The owner created it on 2026-11-01. His answer when asked: *"done H:\corner-chat\corner-chat-app"*.
- The PM read it the same day: README only, `f5e060d Initial commit`, checked out on `main`, the same six branches as the
  other two repos, origin `github.com/develyst1/corner-chat-app`.
- **Done by the PM already:** a `machine.local.md` row (the path is only there), a SYSTEM-FACTS Repos line, and the board's
  Project info.
- **Yours, because these are rule files:**
  - `PROTOCOL.md` repo table (line ~412) and the role table (line ~16–22) know only `corner-chat-back` (BE) and
    `corner-chat-front` (FE).
  - `TEAMS.md` header (line ~14) says the teams share "both repos".
  - `FE.md` still has the template placeholders `<front-repo>` / `<back-repo>`. Same check for `BE.md`.
- ⚠️ **Not decided by anyone yet: which role writes in `corner-chat-app`.** The PM's proposal `[PM-proposed]`: the **FE**
  of either team, under the same batch claims. The SA picks the app stack in SPEC-001. If that needs the owner's word,
  route it back through Atlas. The PM has not asked the owner.

## 2. The product changed shape; the desk text still describes the old one

The owner's answers on 2026-11-01 changed the first round, all verbatim in SYSTEM-FACTS:
- It is **an app for each user**, not a team's shared inbox (*"ฉันหมายถึงผู้ใช้ corner-chat แล้วแต่คนจะตั้งเงื่อนไขตามสไตล์ตัวเอง"*).
- **The mobile app is in the first round** (*"ทำแอปด้วย"*), **Android first, iOS later** (*"Android ก่อน IOS ทีหลัง"*).
- **Users do everything in the app; the web is only the owner's admin page** (*"ใช่"* to that reading).

Stale lines, for you to judge:
- `PROTOCOL.md` line ~415: `corner-chat-front` = "the Dashboard + Web Chat". It is now the owner's admin web.
- `PROTOCOL.md` "Missing knowledge" + the environments table name Teams / Discord / Web Chat as the live channels. The first
  round is **Zimbra + LINE groups** only.
- The board's Project info is the PM's, and the PM fixes it now.
- **Nothing has been moved between files by the PM.**

## 3. For your awareness, not an ask

- `FAILURES.md` has **2 NEW entries** (F-001, F-002). Both are the PM's: questions to the owner that were too long or
  asked too early. The gate will call Atlas; the PM tells the owner.

## Reply

Put your answer, and anything you have for the PM, in `corner-chat/ai-worker/inbox/PM.md` (1–3 lines, a pointer), then
nudge `Porter-corner-chat`.
