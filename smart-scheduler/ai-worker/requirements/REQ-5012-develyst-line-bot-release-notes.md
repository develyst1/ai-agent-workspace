# REQ-5012: the Develyst LINE bot in the customer group (release notes first, chat reading later)

**Status:** DRAFT, timing waits on the owner · **Raised by:** the owner, 2026-11-10 · **Written by:** Porter (PM)

## The owner's words
*"ฉันอยากเอาไลน์ Develyst ฉันเข้ากลุ่มได้มั้ย แล้ว ให้พวกนายเข้าถึงมัน เข้าถึง webhook เพื่อรู้ว่าลูกค้าทักอะไรมาบ้าง … หรือ อาจจะ ไว้ทีหลัง แต่เอาไว้ แจ้ง เวลา ขึ้นระบบ ต่างๆ แบบเรียลไทม์ ไปก่อนก็ได้ … เวลาขึ้น sid ก็บอก ระบบ backoffice ขึ้น ระบบทดสอบแล้วนะ ทดสอบแล้ว แนบรูป … เวลาขึ้น uat ก็บอก … ขึ้นระบบจริงแล้วนะ … เวลาขึ้น get requirement ก็บอก อัปเดตตาม feedback ล่าสุดแล้ว แนบรูป"*

## Phase 1: release notes into the customer LINE group (small, first)
- The Develyst LINE OA (the owner's) joins the "SOM SYSTEM" group. One webhook captures the group id once.
- After an event, the desk writes a short Thai note plus 1–3 screenshots: a sid deploy that passed Tanya, a uat go-live the owner confirmed, or a GR-web update.
- **The owner approves each post before it goes.** It shows up in his chat as a ready card, and he replies "ส่ง". Two reasons: the omakase rule (he picks what is served and when), and our rule that a customer message goes out only after Tanya's PASS. No automatic posts.
- A post uses the LINE push API (a quota on the OA plan; release notes are a few a week).
- Needs from the owner: the OA's channel secret + access token in a git-ignored env file (he pastes them; agents never see them), and adding the OA to the group.
- Host: a tiny webhook + push service on the owner's platform (Otto).

## Phase 2: reading the group chat (later, needs consent)
- A bot in a group receives every message by webhook. That would let the desk see customer asks in near-real time, instead of the owner forwarding screenshots or exporting the chat.
- **Before turning it on:** tell the group that the bot is in it and records messages for the project. Messages may hold personal data, so they're stored in a git-ignored place, summarised into the desk files, and never pasted raw into shared files (our privacy rule).
- Lower priority: the owner's LINE export (as on 2026-11-09) already works.

## Out of scope
Auto-replies to the customer · posts without the owner's "ส่ง" · reading 1-to-1 chats.
