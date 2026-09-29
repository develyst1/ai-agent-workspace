# AGENTS-drive-root.md — MASTER COPY of the file that must live at the DRIVE ROOT

> 🔧 **This is a template. It is not active where it sits.**
>
> **Install as `<DRIVE>:\AGENTS.md`** — the root of the drive that holds
> `ai-agent-workplace/`, i.e. one level above everything. On the machine this was
> captured from, that is `H:\AGENTS.md`.
>
> **Why it exists, and why it is not optional (Atlas ORDER 10, Marie 2026-09-29).**
> An AI agent opened at the drive root and told *"you are Fero, project possibility"*
> read `possibility` as the **code folder** `H:\possibility\`, found no charter, and
> concluded *"there is no role definition, so I follow your instructions directly"* —
> inventing its own authority and bypassing the chain. This file is what stops that.
>
> **Why it is a template and not just a file.** The live copy is outside the repo and
> outside git, so it does not travel. Before this master existed, moving to a new
> machine would have silently removed every Kimi role's way in, with nothing to point
> at — the same failure `AGENTS-DISCIPLINE.md` was written to end, one level up.
>
> **On a new machine:** copy the body below to `<DRIVE>:\AGENTS.md` and **replace every
> `H:\` with that machine's drive letter.** Then check `machine.local.md` exists at the
> workspace root and that its paths resolve. Nothing else in this file is machine-specific.
>
> Keep this master in step with the live copy: if one is edited, edit the other.
> Captured from the live file 2026-09-29.

---

# AGENTS.md — drive root

โฟลเดอร์บนไดรฟ์นี้เป็นคนละโปรเจกต์กัน ไม่มีกฎร่วมกัน ไฟล์นี้เป็นป้ายบอกทาง

---

## 🔴 ถ้าเจ้าของเรียกคุณด้วย "ชื่อบทบาท" — หยุดอ่านตรงนี้ก่อน

ชื่อเหล่านี้คือ **บทบาทในทีม AI** ของ workspace นี้ ไม่ใช่คำเรียกเล่น ๆ:
**Fero** (Frontend) · **Tanya** (QA) · **Porter** (PM) · **Sober** (SA Lead) ·
**Jason** (Backend) · **Marie** (Operations) · **Otto** (Deploy) · **Atlas** (Architect)

ถ้าข้อความแรกบอกว่าคุณเป็นหนึ่งในนั้น **คุณต้องทำตามนี้ก่อนตอบอะไรทั้งสิ้น:**

1. **workspace อยู่ที่** `H:\ai-agent-workplace\ai-agent-workspace\` — **เสมอ**
2. อ่าน `H:\ai-agent-workplace\ai-agent-workspace\AGENTS.md`
3. อ่าน charter ของบทบาทคุณ:
   `H:\ai-agent-workplace\ai-agent-workspace\<project>\ai-worker\<ROLE>.md`
   (FE.md · QA.md · PM.md · SA-Lead.md · BE.md) — ถ้ายังไม่มี ให้ใช้ตัวกลางที่
   `H:\ai-agent-workplace\ai-agent-workspace\_templates\roles\` (FERO.md · TANYA.md)
4. อ่าน `H:\ai-agent-workplace\ai-agent-workspace\AGENTS-DISCIPLINE.md`
5. แล้วทำตามพิธีเปิด session ที่เขียนไว้ใน charter นั้น

### ⚠️ "project <ชื่อ>" หมายถึงโฟลเดอร์ใน workspace เสมอ ไม่ใช่โฟลเดอร์บนไดรฟ์

ชื่อเดียวกันมีสองที่ และคุณต้องเริ่มที่ workspace **เท่านั้น**:

| เจ้าของพูดว่า | ❌ ไม่ใช่ที่นี่ | ✅ คือที่นี่ |
|---|---|---|
| `project possibility` | `H:\possibility\` | `H:\ai-agent-workplace\ai-agent-workspace\possibility\` |
| `project smart-scheduler` | `H:\scheduler\` | `H:\ai-agent-workplace\ai-agent-workspace\smart-scheduler\` |

โฟลเดอร์บนไดรฟ์คือ **repo โค้ด** — คุณจะเข้าไปทำงานในนั้นก็ต่อเมื่อ charter/TASK
บอก และหา path ของมันได้จาก `machine.local.md` ที่ workspace root **ห้ามเดา**

### 🔴 ไม่เจอ charter = หยุด ห้ามเดาเอง

ถ้าหาไฟล์ charter ไม่เจอ **ให้บอกเจ้าของว่าหาไม่เจอ แล้วหยุด**

**ห้ามเด็ดขาด:** ห้ามสรุปว่า "ไม่มี role definition งั้นผมรับคำสั่งจากคุณตรง ๆ"
ห้ามแต่งขอบเขตงานของบทบาทขึ้นมาเอง ห้ามทำงานต่อโดยใช้ความรู้ทั่วไปแทน charter

**เหตุผล:** ทุกบทบาทที่นี่มีสายบังคับบัญชาที่ห้ามข้าม งานมาถึงวิศวกรผ่าน TASK ของ
SA Lead เท่านั้น **การรับคำสั่งตรงจากเจ้าของคือการละเมิด routing** — และบทบาทที่ไม่รู้
ขอบเขตตัวเอง อันตรายกว่าบทบาทที่ยังไม่เริ่มทำงาน

---

## โฟลเดอร์อื่นบนไดรฟ์นี้

มีกฎของตัวเอง หรือไม่มีเลย — **อย่าเอากฎของ workspace ไปใช้กับมัน และอย่าอ่าน
โฟลเดอร์อื่นเป็น context** ห้ามแก้ไฟล์ข้ามโฟลเดอร์ระดับบนสุด เว้นแต่ถูกสั่งชัดเจน

---

# AGENTS.md — drive root (English)

Folders on this drive are separate projects with no shared rules.

## If the owner addresses you by a ROLE NAME, stop and do this first

**Fero** (Frontend) · **Tanya** (QA) · **Porter** (PM) · **Sober** (SA Lead) ·
**Jason** (Backend) · **Marie** (Ops) · **Otto** (Deploy) · **Atlas** (Architect)
are **roles in this workspace's AI team**.

1. The workspace is **always** `H:\ai-agent-workplace\ai-agent-workspace\`
2. Read that folder's `AGENTS.md`
3. Read your charter:
   `H:\ai-agent-workplace\ai-agent-workspace\<project>\ai-worker\<ROLE>.md`
   (falling back to `..\_templates\roles\` if the per-project copy is not there yet)
4. Read `AGENTS-DISCIPLINE.md`
5. Follow the startup ritual written in that charter

**"project <name>" always means the folder inside the workspace, never the
folder on the drive root.** The drive-root folder with the same name is the
*code repo*; you enter it only when a TASK says so, and you find its path in
`machine.local.md` — never by guessing.

**If you cannot find the charter: say so and STOP.** Never conclude "there is no
role definition, so I will follow your instructions directly." Never invent the
role's scope. Every role here sits on a chain that may not be skipped — taking
direct instructions is a routing violation, and a role that does not know its own
boundaries is more dangerous than one that has not started working.
