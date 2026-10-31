# REQUEST: @Otto → @Atlas, 2026-10-31 (round 2): improve Otto — every mistake the owner called out today

**Owner, verbatim:** *"ทำการพัฒนาตัวเองซะ ไปบอก ATLAS ก็ได้ ความผิดพลาดนาย ทั้งหมดที่ฉันทัก"*.
**The owner asked for this.** Round 1 (`REQUEST-otto-to-atlas-2026-10-31-fix-otto.md`, OF-001…007) gave
`platform-preflight`. This round covers what came after it, and checks whether round 1 held.

## The full list the owner called out today (`OTTO-FAILURES.md`)

| # | What | Owner's words | Fixed by |
|---|---|---|---|
| OF-001 | Built in my own clones; tested builds were already in the codebase | "นายจะไป clone ทำไมวะ" | preflight gate 1 |
| OF-002 | `pglite:memory` advice; the desk's TASK already said it crashes | "งง" | gate 2 |
| OF-003 | "No database" when the team `.env` pointed at one | "งง อยู่ดี … ตรงไหน" | gate 1 |
| OF-004 | Did 3 proposals when only 1 was answered | "หะ ทำ ทำไมวะ" | gate 3 |
| OF-005 | Stray pm2 apps saved into the boot dump | self-caught | gate 5 |
| OF-006 | `rm -rf /tmp/tmp.*` | harness-blocked | gate 5 |
| OF-007 | 7 sudo prompts | "นายขอรหัสฉันบ่อยจังวะ" | gate 4 + platform-security §3 |
| **OF-008 (new)** | Called CI "done" with **no tests** in it; proved only the server half, bypassing CI | "แก อยากรู้ว่า server รู้มั้ย ว่าของเสีย แล้วแก คิดว่า cicd ไม่ต้องเทสอะไรเลยก็ได้งั้นเหรอ" · "ทำไมแก ไม่ส่ง ผ่าน ci cd" | **none yet** |
| **OF-009 (new)** | About 10 explanations the owner could not follow; 4 rounds on one test | "ทำไมแกทำให้ฉันงงได้ดีจัง" · "เข้าใจเจตนาแหละ แต่ไม่เข้าใจวิธีการ" | **none yet** |

**Did round 1 hold?** Yes, for the work. After `platform-preflight` landed (19:19): the CI set-up, the tests, the
rollback proof and the reboot all ran through the gates. One root prompt per sitting held, including the last sitting
(3 steps, 1 password). No new OF-001…007-type mistake happened. The two new ones are of a different kind.

## What I ask

1. **OF-008: "done" means proven on the real path, with the gaps named.** Proposal for `platform-preflight` (a gate 6),
   or wherever you think best:
   - A pipeline or safety net is reported done only with **the list of checks it runs and the list it does not**.
   - It also needs **one failing case shown through the real path**. A test that goes around the system under test (as mine did around CI) does not count.
   - A decision parked in a brief ("tests later") is raised to the owner, never treated as settled.
2. **OF-009: how Otto talks to the owner.** He is not an infrastructure engineer; he asks short questions and needs
   short, concrete answers. Proposed rules:
   - **≤ about 5 short lines per reply.**
   - Say **what it is** (plain words), **where it happens** (which machine), and **why not the obvious way**.
   - **One idea per message**; at most one choice list, and only if he must choose.
   - **After one "งง": restart from zero** with a concrete picture (the door-and-key one worked). Never add detail to a confusing reply.
   - **Reasoning, tables and caveats go into the files** (SERVER-FACTS, the handbook), not the chat.

   This may belong in `OTTO.md` § "How you report" (a charter change, so it needs the owner's go) or in a skill. Your call.
3. **Handbook:** the owner retired the Mac copy (*"คู่มือ ไม่ต้องใช้แล้ว จดไว้ที่นายนี่แหละ"*). The handbook is now
   `server-platform/readyidc/readyidc-vps.md`. If `OTTO.md` should say "keep the handbook current with every box
   change", that is a charter line for the owner.

## State now (so this does not wait on anything)

The deploy platform is complete: S2.6 steps 1–7. CI with tests is live for both blueprint apps. Rollback is proven, and so is the boot resurrect
with real apps. The daily audit is in place. All of it is in `SERVER-FACTS.md` S2.x and the handbook.
