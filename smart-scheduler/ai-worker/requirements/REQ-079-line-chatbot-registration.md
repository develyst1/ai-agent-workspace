# REQ-079: LINE chatbot — ลงทะเบียนนักเรียนเอง + ผู้ปกครองใช้ระบบผ่านไลน์

- Status: 🟢 **READY_FOR_SA** (GO 2026-09-01, queued #2 after REQ-005).
- 🔴 **READ §15 FIRST — the 6-digit family code was CUT by the customer on 2026-09-01.** Where §4–§14 and §15
  disagree, **§15 wins.** Flow 2 is replaced, four ACs are withdrawn, and §12 is superseded by §15 explainer.
- 🔢 **The owner's number is REQ-016.** Quote **REQ-016** to him; use REQ-079 in specs and tasks.
- Priority: 🔴 **HIGH — second in his order:** REQ-005 → **REQ-016 (this)** → REQ-013 → REQ-015 → REQ-014 → REQ-004 → `REQ-BO`.
- Requested: 2026-08-31, customer call. Design completed 2026-09-01 by Porter at the owner's request.
- Sources: the call summary (`call-20260831.md`, code repo) · the owner's answers in chat, 08-30 → 09-01.
- 🧹 **Consolidated 2026-09-01** — it had grown to 53KB of running commentary and failed hygiene. **Nothing was
  deleted:** the pre-consolidation file is `archive/REQ-079-2026-09-01-pre-consolidation.md`, verbatim.
  Distinct deliverable from **REQ-077** (his REQ-014: OA move · rich menu · notification set).

---

## 1. Goal

Parents use the school through LINE — register a child, file leave, check in, see what is left of a course —
**and still talk to a human in the same chat.** Not a closed bot; a bot and an admin sharing one account.

## 2. Provenance — read before treating any of §3 as settled requirement

The call material is a **NotebookLM summary of recorded audio**: audio → machine summary → file. Second-hand
twice. **What is recorded below as decided is what the OWNER confirmed in chat**, not what the summary asserts.
📌 The summary names *"ผู้ออกแบบระบบ (พี่โด่ง)"* — the owner is the designer; several of its "next steps" are his.

## 3. What the call asked for

1. **Hybrid**, not a 100% bot — admin answers in the same account. ⚠️ It named its own risk: commands
   **triggered accidentally** by ordinary chat.
2. **Registration after payment:** admin prompts → phone → student name (+ **birthdate**, **province**) →
   lands in the back office → **an admin schedules the child.**
3. **Duplicate names must raise an alert** so staff do not book the wrong child.
4. **Returning customers:** enter a phone → **see the children already on it**, do not retype.
5. **Show real names** instead of the masked digits.
6. **An old customer on a new LINE account re-links without buying again.**

## 4. The owner's decisions — all confirmed by him, do not re-ask

| # | Decision | Date |
|---|---|---|
| Identity | **No per-device LINE binding. A fixed 6-digit FAMILY code**, many guardians per family | 09-01 |
| First set | **The family sets its own code**, inside an **admin-opened chat** (closes first-use takeover) | 09-01 |
| Reset | **The shop can reset it** | 09-01 |
| Lockout | **4 wrong attempts → 3 minutes**, counted **per family, not per device** | 09-01 |
| Weak codes | **Allowed — accepted risk**, *"ลูกค้ายังไม่มากขนาดนั้นที่จะโดน hack"*. Build the check, ship it **off** (`app_settings`) | 09-01 |
| Scope of the code | Porter's line, uncontradicted: **see children · leave · check-in. NEVER anything that moves money** | — |
| Trigger | **A button, not a typed keyword** — *"ok เปลี่ยนเป็นกดปุ่ม"* | 09-01 |
| Devices | Parents ≈ all mobile; **a minority on PC**; **admins on PC**. LINE PC: **no rich menu and buttons cannot be tapped — text only** | 09-01 |
| Student create | **A parent may create a student** | 09-01 |
| Duplicate name | *"บอกให้ตั้งใหม่"* — ⚠️ see §7(a): Porter proposes **ask for more detail**, not a rename | 09-01 |
| Delete | Admin deletes on the parents page; **parent deletes in LINE** — ⚠️ see §7(b) | 09-01 |
| Channels | `sid` + `uat` **share one LINE channel; rehearsal is allowed now** (see §8) | 09-01 |

## 5. THE FLOW

### The one idea it rests on

A chat is in exactly one of two states — **ยังไม่รู้จัก** (this LINE account belongs to no family) or
**รู้จักแล้ว** — and **in both, the bot is silent unless a button was pressed or an admin started something.**

| Menu — ยังไม่รู้จัก | Menu — รู้จักแล้ว |
|---|---|
| `เข้าใช้ระบบ` · `คุยกับแอดมิน` | `แจ้งลา` · `เช็คอิน` · `คอร์สของฉัน` · `เพิ่มนักเรียน` · `คุยกับแอดมิน` |

📌 **`คุยกับแอดมิน` is in both, always, and no flow may remove it.** It is the promise that a person is
reachable, which is the only thing that makes a bot acceptable to a parent.

### Flow 1 — ครอบครัวใหม่ (admin opens the door; first time only)

```
บอท : ยินดีต้อนรับค่ะ 😊 รบกวนใส่เบอร์โทรที่ให้ไว้กับทางร้านนะคะ
ผปค : 0812345678
บอท : พบข้อมูลของคุณแล้วค่ะ — น้องรดา, น้องต้น
       ตั้งรหัส 6 หลักสำหรับครอบครัวไว้ใช้ครั้งต่อไปนะคะ
       (รหัสนี้บอกคุณพ่อหรือคนอื่นในบ้านได้ เพื่อเข้ามาแจ้งลาแทนกันได้)
ผปค : 481920
บอท : ใส่อีกครั้งเพื่อยืนยันค่ะ                    → 481920
บอท : เรียบร้อยค่ะ ✅ ต่อไปเข้าจากเครื่องไหนก็ได้ด้วยเบอร์ + รหัสนี้
```

- Phone not found → `ยังไม่พบเบอร์นี้ค่ะ ลองตรวจสอบอีกครั้ง หรือกด "คุยกับแอดมิน" ได้เลยค่ะ`
- **Confirm-twice is deliberate** — the code is fixed and long-lived; a typo here is a support call later.
- 📌 **The parenthetical about telling the family the code is the feature**, not decoration: it is the
  sick-mother case. Unsaid, nobody discovers it.

### Flow 2 — ผู้ปกครองคนที่สอง / เครื่องใหม่ (never needs an admin)

`[เข้าใช้ระบบ]` → phone → 6-digit code → in.

- Wrong: `รหัสไม่ถูกต้องค่ะ (เหลืออีก 3 ครั้ง)` — **state the remaining count**; a silent counter locks people
  out with no warning.
- Locked: `ลองใหม่อีกครั้งใน 3 นาทีนะคะ หรือกด "คุยกับแอดมิน" ได้เลยค่ะ` — **the human door stays open while
  locked. A lockout must never be a dead end.**

### Flow 3 — เพิ่มนักเรียน

name → (if duplicate: `มีน้องชื่อนี้อยู่แล้ว รบกวนใส่นามสกุลหรือชื่อเล่นเพิ่ม เพื่อไม่ให้สลับกันนะคะ`) →
birthdate → province → **summary → confirm** → `บันทึกแล้วค่ะ ✅ แอดมินจะจัดตารางเรียนให้และติดต่อกลับนะคะ`

- 🔴 **The summary-and-confirm step is not optional.** It writes into a roster that **has no delete for anything
  with history.** Three seconds of review against a record nobody can remove.
- **The admin must be notified** — that is the customer's own step 5. Without it, the hand-off depends on
  somebody remembering to look.

### Flow 4 — แจ้งลา · Flow 5 — เช็คอิน (same shape)

child (**skipped if there is only one**) → session → confirm → done + teacher told.

- **Never infer the child, never infer the session** — `REQ-050`'s rule, unchanged here.
- **The confirmation names child · date · time**, so a wrong tap is caught by the person who made it.
- Check-in differs only in its time window and what it may refuse.

### Flow 6 — คอร์สของฉัน

The customer's own template: `คอร์ส · ครู · เหลือ 4/6 · สิทธิ์ลาเหลือ · วันหมดอายุ`.

### Flow 7 — คุยกับแอดมิน (every screen, always)

`รับทราบค่ะ แอดมินจะตอบเร็ว ๆ นี้นะคะ 🙏` — then **the bot goes silent and does not resume by itself.
Only a new button press wakes it.**

### The rules that keep bot and human apart

1. **Silent by default.** No greeting on follow, no auto-reply, no *"did that answer your question?"*.
2. **Only a button or an admin starts a flow.** A typed keyword never does.
3. **Typing INSIDE a flow is an answer, not a trigger** ⇒ **every choice also accepts `1` / `2`** — LINE on PC
   cannot tap anything. *(@Sober 09-01: already satisfied — taps and typed replies share one handler.)*
4. **An admin's reply stops the bot instantly**, the flow is abandoned, the parent is told
   `แอดมินเข้ามาคุยด้วยแล้วนะคะ 😊`. 🔴 **Account-wide muting is NOT acceptable** — one admin answering one
   parent must never silence the bot for every family.
5. 🔴 **Two unexpected replies and the bot gives up:** `ขอโทษค่ะ ขอส่งให้แอดมินช่วยดูนะคะ 🙏`
   **A parent must never be trapped in a loop with a machine while a person sits in the same chat.**
6. **No flow touches money.** No buying, refunds or price changes — staff only.

### Deliberately NOT in scope

- **The bot answers no questions** — prices, schedules, opening hours all reach a person. That is the price of
  never talking over the admin, and for this business it is the right trade.
- **No auto-scheduling.** The parent registers; **a human puts the child on the calendar.**

## 6. Feasibility — @Sober, 2026-09-01, read from the code

- **Per-user menus: a LINE feature we already run** (`linkRichMenuToUser`, `setDefaultRichMenu`, ids in
  `app_settings`; REQ-042 was this exact path, owner-verified 08-16). 📌 Make **ยังไม่รู้จัก the DEFAULT** and
  **รู้จักแล้ว the per-user link** — a brand-new follower then gets the right menu with no code running.
- **Nothing in the seven flows needs a mechanism we do not already run.** The **only** new state is a counter
  (attempts-remaining; two-strikes-to-human) — a column on `line_link_sessions`, not a capability.
  ⚠️ **It must reset on success and expire with the session**, or a parent who mistypes twice in March is
  locked out in June.
- **Rule 4 — we build it.** Platform switch if the OA has a per-chat one; otherwise **one column read** in
  `decideMessageRoute`, where the precedence rule (*"an in-progress conversation wins"*) already lives.
- 🟠 **The one mechanism still open (Sober's):** an admin in OA Manager sees a **chat**, not a `lineUserId` —
  so *how the admin's "open the door" action reaches our system* must be settled first. Candidates: (a) a
  keyword the admin types — ⚠️ **our webhook sees INBOUND messages; an admin's reply is outbound and may never
  reach us. Verify before designing on it.** (b) a control on our own back-office screen — certain, at the cost
  of switching windows. **Requirement either way: it must work from LINE OA Manager on a PC.**

## 7. Two things Porter did not build as literally worded

**(a) Duplicate names — ask for detail, do not demand a rename.** The customer asked for children to be
**distinguishable**, and suggested a surname. **Two real children can share a name.** Telling a parent to rename
their child because another family used it is wrong, and it confirms to whoever typed it that such a child
exists. ⇒ ask for a surname or nickname instead. Same outcome, no false claim, no leak.

**(b) 🔴 Deletion by a parent — narrow it.** A student carries bookings, a paid course, attendance and money
rows, and **the product has never had a student-delete** — that is not an oversight. Porter's recommendation,
for the owner to accept or overrule:

- **A parent may remove only a student with nothing attached** (no bookings, purchases or attendance) — the real
  case is *"I typed it wrong"*.
- **Anything with history is hidden, never deleted, and by an admin only.**
- **Never mid-course.** A paid course would lose its owner and the ledger would point at nobody — silently,
  discovered at month-end.

## 8. Rehearsal on `sid` — allowed now, and it EXPIRES

> Owner, 09-01: *"ตอนนี้ซ้อมได้ … ตอนนี้ uat ก็ไม่มีลูกค้าจริง ๆ ใช้"* — the real OA is connected later.

🔴 **It is not empty: 2 real teachers ARE linked on `uat`.** "No real customers" holds for **parents** (0 of 180),
which is what makes parent-flow rehearsal safe. ⇒ **Rehearse the parent flows freely; never fire an outbound
message at the two linked teachers.** No flow here is teacher-facing, so this costs nothing.

> 🔴 **The permission ends the instant EITHER (a) the customer's real OA is connected OR (b) a real parent links
> on `uat` — whichever comes first.** After that, `sid` needs its own channel or rehearsal stops.

📌 **Written as a trigger, not a date, on purpose.** A permission granted because *"nobody uses it yet"* is
exactly the kind that survives the day someone starts — and the person rehearsing has no way to notice. Same
shape as the `uat` remote-DB whitelist opened on 08-16 and still open.

## 9. Sequencing with REQ-051 — settled

**Not a merge.** They share a lookup and a PII rule, but the trust models are opposite: REQ-051 is a **public,
no-login page that burns a paid session**; this is an **authenticated chat**. Merging would park REQ-079 behind
SPEC-050's three unanswered decisions.
📌 **The useful direction is the reverse:** REQ-051's weakest point is its admin code — today the shared static
`"229"`. **REQ-079's per-family code is the answer to it.** ⇒ settle this auth model first, then reopen SPEC-050
decision #1 with it. Free, and it removes one of REQ-051's blockers instead of adding one.

## 10. Acceptance Criteria

🔴 **Not written yet, on purpose.** They are written when the owner gives the GO — ACs against an unapproved
design freeze it. Everything they need is in §4 and §5.

## 11. Open

| What | With whom |
|---|---|
| **GO / no-go, and where it sits in his order** | **the owner** |
| §7(a) rename-vs-detail · §7(b) how narrow parent deletion is | the owner — recommendations above |
| §6 how an admin opens the door from OA Manager | @Sober, before any spec |

---

## 12. คำอธิบายสำหรับลูกค้า (Porter as UX writer, 2026-09-01)

The owner asked for a version he can send to the customer. **Customer-facing Thai — no internal vocabulary, no
REQ numbers, no `sid`/`uat`, no mention of bots as machinery.** Written as the principle plus the scenarios a
customer actually asks about. Keep this in step with §5; if the flow changes, this changes.

```
ระบบไลน์ของทางร้าน — ทำงานยังไง

หลักการ
ไลน์ของร้านจะทำสองอย่างพร้อมกันในที่เดียว
- ผู้ปกครองกดทำรายการเองได้ เช่น แจ้งลา เช็คอิน ดูคอร์ส
- และยังพิมพ์คุยกับแอดมินได้เหมือนเดิม
ไม่ใช่ระบบตอบอัตโนมัติล้วน ๆ ทุกคำถามยังมีคนตอบ

1. ลูกค้าใหม่ เริ่มต้นครั้งแรก
- คุยกับแอดมินและชำระเงินตามปกติ
- แอดมินเปิดให้เข้าใช้ระบบในแชทนั้นเลย
- ผู้ปกครองใส่เบอร์โทรที่ให้ไว้กับร้าน ระบบจะแสดงชื่อน้องที่มีอยู่
- ตั้งรหัส 6 หลักประจำครอบครัวไว้ใช้ครั้งต่อไป
- เรียบร้อย ใช้งานได้ทันที

2. เพิ่มนักเรียน
- กดเมนู "เพิ่มนักเรียน" แล้วกรอกชื่อน้อง วันเกิด จังหวัด
- ระบบสรุปให้ตรวจทานก่อน กดยืนยันแล้วข้อมูลเข้าระบบร้านทันที
- แอดมินจะจัดตารางเรียนให้และติดต่อกลับ
- ถ้ามีน้องชื่อซ้ำกับที่มีอยู่ ระบบจะขอชื่อเล่นหรือนามสกุลเพิ่ม
  เพื่อไม่ให้ลงตารางสลับคนกัน

3. ลูกค้าเก่า เข้าใช้งานครั้งต่อไป
- ใส่เบอร์โทร + รหัส 6 หลัก เข้าได้เลย ไม่ต้องรอแอดมิน
- ผูกได้หลายคนในครอบครัวเดียวกัน คุณพ่อ คุณแม่ คุณยาย พี่เลี้ยง
  วันไหนคนหนึ่งไม่สะดวก อีกคนทำแทนได้ทันที
- เปลี่ยนมือถือใหม่ ใส่เบอร์กับรหัสอีกครั้งก็ใช้ได้เลย
- ลืมรหัส แจ้งทางร้านตั้งใหม่ให้ได้

4. ใช้ทำอะไรได้บ้าง
- แจ้งลา — เลือกน้อง เลือกคาบ ยืนยัน ระบบแจ้งครูให้ทันที
- เช็คอินเข้าเรียน
- ดูคอร์สของน้อง เหลือกี่ครั้ง สิทธิ์ลาเหลือเท่าไหร่ หมดอายุวันไหน
- เพิ่มนักเรียน

5. อยากสอบถาม คุยกับแอดมินได้ตลอด
- ปุ่ม "คุยกับแอดมิน" อยู่ทุกหน้า
- หรือพิมพ์ถามเข้ามาได้เลย ระบบจะไม่เข้ามาขัด แอดมินเป็นคนตอบ
- ถ้าระบบไม่เข้าใจสิ่งที่พิมพ์ 2 ครั้ง จะส่งต่อให้แอดมินเองอัตโนมัติ
  ผู้ปกครองจะไม่ติดค้างอยู่กับระบบ

6. ความปลอดภัย
- ถ้าไม่มีรหัส จะไม่เห็นข้อมูลน้องเลย แม้จะรู้เบอร์โทร
- ใส่รหัสผิด 4 ครั้ง ระบบจะพักไว้ 3 นาที ระหว่างนั้นยังกดคุยกับแอดมินได้
- รหัสนี้ใช้ได้เฉพาะเรื่องตารางเรียน ไม่เกี่ยวข้องกับการเงินใด ๆ

7. ใช้บนคอมพิวเตอร์ได้ไหม
- ได้ แต่ไลน์บนคอมจะไม่มีเมนูด้านล่าง
- ทักแอดมินได้ตามปกติ และทุกขั้นตอนพิมพ์ตัวเลขเลือกแทนการกดปุ่มได้
```

📌 **Three choices in this copy that are deliberate, so nobody "improves" them later:**
1. **It opens by saying a person still answers.** That is the customer's actual worry about a chatbot, and it is
   also literally true of this design — leading with it is not marketing.
2. **Point 3 states the delegation outright** (*"วันไหนคนหนึ่งไม่สะดวก อีกคนทำแทนได้"*). It is the reason the
   family code exists; unsaid, nobody discovers it.
3. **Point 5 promises the parent will never be stuck with the machine.** That is a commitment the build must
   keep — it is the two-strikes rule in §5, written as a promise to a customer.

---

# ✅ GO — owner, 2026-09-01. Status `READY_FOR_SA`, queued **immediately after REQ-005**.

> *"GO เอาเลย ให้อยู่คิวถัดจาก REQ-005"*

**Order is now: REQ-005 → REQ-016 (this) → REQ-013 → REQ-015 → REQ-014 → REQ-004 → the `REQ-BO` block.**

📌 **A property worth stating, because it removes a worry rather than creating one:** REQ-014 later moves the
customer to a **new** LINE OA, and every LINE link is per-OA — so links do not carry over. **This design survives
that by construction:** the family, its children and its 6-digit code live in *our* database, not in LINE. After
the move a parent re-enters phone + code from any device and is back — **no admin, no re-registration, no data
migration.** Building this before the OA move costs nothing.

## 13. Acceptance Criteria

Tanya tests exactly this list. Written on GO, per §10.

**⚠️ Two ACs encode a Porter recommendation the owner has not explicitly ruled on (§7). They are written as
recommended and flagged; if he decides otherwise, AC-9 and AC-19/20 change and nothing else does.**

### Getting in

- [ ] **AC-1 (admin opens the door)** — **Given** a LINE account attached to no family, **When** an admin starts
      Flow 1 for that chat, **Then** the bot asks for a phone number. **And when no admin has started it, the
      bot stays silent no matter what the person types** — including the words `สมัคร` or `เข้าใช้ระบบ`.
- [ ] **AC-2 (phone found)** — **Given** a phone that exists, **When** it is entered, **Then** the children on it
      are shown **by name** and the bot asks for a new 6-digit code.
- [ ] **AC-3 (phone not found)** — **Then** a message that offers a retry **and** the admin, and **no hint about
      whether that number belongs to anyone.**
- [ ] **AC-4 (confirm twice)** — **Given** the two entries differ, **Then** it is refused and asked again; the
      code is **not** saved.
- [ ] **AC-5 (second guardian)** — **Given** a family with a code, **When** a **different** LINE account enters
      phone + code, **Then** it joins the same family and sees the same children. **No admin involved.**
- [ ] **AC-6 (wrong code)** — **Then** the message **states the attempts remaining**, and after the 4th the
      family is locked for **3 minutes**.
- [ ] **AC-7 (lockout is not a dead end)** — **Given** a locked family, **When** the parent presses
      `คุยกับแอดมิน`, **Then** it still works.
- [ ] **AC-8 (lock is per family, and it clears)** — **Given** 4 failures from one device, **When** a second
      device tries the same family, **Then** it is **also** locked; and **after a success the counter resets to
      zero** — a parent who mistypes twice in March is **not** locked out in June.

### Registering a child

- [ ] **AC-9 (duplicate name)** ⚠️*Porter's §7(a) recommendation* — **Given** a name that already exists,
      **Then** the bot asks for a **surname or nickname to tell them apart**. It must **not** tell the parent to
      choose a different name, and must **not** state whose child the existing one is.
- [ ] **AC-10 (review before write)** — **Given** name, birthdate and province entered, **Then** a **summary is
      shown and must be confirmed** before anything is saved. Choosing แก้ไข returns without saving.
- [ ] **AC-11 (the admin is told)** — **Given** a student created this way, **Then** an admin is **notified**.
      Nothing may depend on someone remembering to look.
- [ ] **AC-12 (negative — abandoned halfway)** — **Given** a parent who stops mid-flow, **Then** **no partial
      student exists** anywhere.

### Using it

- [ ] **AC-13 (leave)** — child chosen (**step skipped when there is only one**) → session chosen → confirmed →
      **the teacher is notified**, and the confirmation **names child, date and time**.
- [ ] **AC-14 (never infer)** — **Given** two children, or one child with two sessions that day, **Then** the
      parent is **asked which**; the system never picks.
- [ ] **AC-15 (course view)** — shows คอร์ส · ครู · remaining **n/N** · leave quota left · expiry.

### Bot and human sharing one chat

- [ ] **AC-16 (silent by default)** — **Given** an idle chat, **When** the parent types anything at all,
      **Then** the bot does not reply. No greeting on follow, no auto-reply.
- [ ] **AC-17 (admin takes over)** — **Given** a flow in progress, **When** an admin replies, **Then** the bot
      stops immediately, the flow is abandoned, and the parent is told a person has joined.
      🔴 **And the bot must still work normally in every OTHER family's chat at that moment.**
- [ ] **AC-18 (two strikes → human)** — **Given** two consecutive unexpected replies, **Then** the bot hands over
      to an admin and stops. **The parent is never left looping.**
- [ ] **AC-19 (typed choices)** — **Given** any step offering choices, **When** the parent types `1` or `2`
      instead of tapping, **Then** it behaves identically. *(Tested on LINE PC, where tapping is impossible.)*
- [ ] **AC-20 (no money, ever)** — **Given** any flow, **Then** nothing buys, refunds, discounts or changes a
      price. ⚠️*Deletion, per Porter's §7(b) recommendation:* a parent may remove **only** a student with **no
      bookings, no purchases and no attendance**; anything with history is **hidden by an admin, never deleted**;
      **never mid-course.**

### Regression

- [ ] **AC-21 (existing LINE work unharmed)** — teacher schedule messages, course-confirm, booking-confirm and
      the 08:15 daily reminder all behave **exactly as before**.
- [ ] **AC-22 (rehearsal boundary)** — **Given** any test run on `sid`, **Then** **no message reaches the two
      real linked teachers on `uat`** (§8).

## 14. Still open — neither blocks the spec

| What | With whom |
|---|---|
| §7(a) rename-vs-detail (AC-9) · §7(b) how narrow parent deletion is (AC-20) | the owner — **built as recommended unless he says otherwise** |
| §6 how an admin opens the door from OA Manager | @Sober, **before** the spec is cut |

---

## 6b. ✅ §6 SETTLED — Sober, 2026-09-01. Read from the code; the question was smaller and the stakes larger.

**Two findings. The first collapses the question; the second is why the door has to exist at all.**

### 🔴 Finding A — a chat cannot be addressed until the parent speaks. So (a) and (b) are the SAME mechanism.

Every `lineUserId` this system has ever stored traces back to **`eventUserId(ev)`** — the inbound webhook.
`line-webhook.service.ts:466 · :557 · :620` are the only producers; `parent.service.ts:68` and
`roster-link.ts:24` merely receive it as a parameter. **There is no path by which we learn a chat's identity
without an inbound message.**

⇒ **Option (b) — "a control on our own back-office screen — certain, at the cost of switching windows" — is not
implementable as written.** Our screen can authorise a **family**; it can never address a **chat** we have never
received a message from. The binding to a specific conversation can only happen when that conversation sends us
something.

⇒ **Whatever the admin does, the door is something the PARENT presents, and the admin's job is to deliver it.**
That is not a preference between two candidates — it is the only shape the platform permits. **And it takes the
webhook unknown off the critical path**: we no longer need to know whether an admin's OA Manager reply reaches
us, because the event we act on is the parent's reply, which is inbound by definition.

### 🔴 Finding B — Flow 1 as written REVERSES a shipped safety decision, and one pure function enforces it today

`parentChildrenNote` — `src/lib/line-pairing.ts:19`, REQ-020 Stage 1 / **TASK-047** — with its reason in the file:

> *"Parent linking matches on phone alone, so anyone who types a phone number would otherwise be told that
> family's children's names."*

So the system answers a phone number with **a count, never names**, deliberately, and has done since TASK-047.
**§5 Flow 1 replaces that count with `น้องรดา, น้องต้น`.** That is not a new risk being weighed — it is an
existing, shipped, deliberate control being switched off, and it is one function.

📌 **This is what the door is FOR, and it is the strongest argument for having one:** with the door, names are
shown only in a chat an admin vouched for, and **`parentChildrenNote` keeps protecting everybody else,
unchanged.** Without it, Flow 1 is TASK-047's defect reintroduced with a nicer wrapper.
⚠️ **Whoever builds this must not "simplify" `parentChildrenNote` away.** The task will say so; I am also
recording it here, because the tempting edit is a one-line change in a pure function with an innocent name.

### The mechanism — a one-time invite the parent types

1. **Our product issues it** (the People screen, REQ-019): a short, single-use, expiring invite **per family**.
2. **The admin pastes it into the chat.** They are already typing there ⇒ **works from LINE OA Manager on a PC by
   construction, with no integration and no platform assumption.** The owner's "without leaving it" requirement
   is met for the conversation itself.
3. **The parent types it** → inbound → we bind that `lineUserId` to that family → **only now** may names appear,
   and Flow 1 continues to set the long-lived 6-digit family code.
4. **Everyone else is unchanged:** a stranger typing a phone number still gets the TASK-047 count.

**Reuses what exists:** the `line_link_sessions` state machine and the precedence rule
(*"an in-progress conversation wins over already-linked routing"*, `line-routing.ts:18`). The new state is the
invite plus the attempt counter §6 already named — columns, not capabilities.

**The honest cost:** the admin fetches an invite from our screen **once per family** (Flow 1 is *first time
only*; Flow 2 needs no admin at all). That is strictly less window-switching than a per-chat control, and unlike
a per-chat control, it can actually be built.

### What is still open, and it is small now

- 🟠 **Does an admin's OA Manager reply reach our webhook?** No longer a dependency — only a possible
  **convenience** (the admin types a keyword instead of pasting an invite). **A 30-second test settles it, and
  §8 already permits rehearsal:** reply to one `sid` chat from OA Manager, then look for a `[line-in]` line in
  the server log (`formatInboundEvent`, `line-log.ts:19`). If the line appears, the keyword variant is available
  and we can add it later **without changing the model above** — that is the point of settling it this way.
- 🔴 **@Porter → the owner: does he accept that names appear ONLY after an invite is used?** That is the trade
  Finding B makes explicit, and it is his call, not mine. **If he wants names on a phone number with no door,
  he is knowingly re-opening TASK-047** — and that sentence should be put to him in those words, because the
  customer's request (§3) does not mention the control it removes.

⇒ **§6 is settled for spec purposes.** The mechanism is fixed by the platform, and the spec can be cut against it.

---

# 🔴 15. SUPERSEDES §4–§14 — the 6-digit family code is CUT (customer, 2026-09-01)

> Owner: *"ลูกค้า confirm มาว่าไม่เอา 2FA 6 หลักที่เราคิด งั้นก็ยกเลิกออกจากแผน ตามนั้น"*

**The customer rejected it. It is out.** Everything above stays as the record of how we got here — **but where
this section and an earlier one disagree, THIS one is right.** Read §15 before speccing anything.

## What dies with it

| Cut | Consequence |
|---|---|
| The 6-digit family code itself | no code to set, remember, type, reset or forget |
| Setting a code (Flow 1's last three turns) | Flow 1 gets **shorter** |
| **Flow 2 as written** — self-service joining with phone + code | replaced below |
| The lockout — 4 attempts / 3 minutes / per family | **gone entirely** |
| The weak-code check + its `app_settings` switch | gone |
| First-use takeover risk, and the gate that closed it | gone — there is nothing to claim |
| **AC-4 · AC-6 · AC-7 · AC-8** | withdrawn. **AC-2** loses its "asks for a code" clause |

📌 **The build gets materially smaller.** Sober's review named the attempt counter as **the only new state this
REQ required** (`line_link_sessions` has no such column). **That is now unnecessary** — nothing else in the seven
flows needs storage we do not already have.

## What replaces it: the admin opens the door — every time, for everyone

**One way in, and it already existed as Flow 1:**

> **A LINE account joins a family when an admin opens the door for that chat.** Mother, father, grandmother, a
> new phone after an upgrade — **each is the same one-step action by an admin.**

- **Flow 1 becomes:** admin opens the door → parent enters their phone → children shown → **done.**
- **Flow 2 becomes:** *"a second guardian, or the same guardian on a new device, asks the shop and an admin opens
  the door for that chat."* **No self-service path exists.**
- **Multi-guardian survives.** Several LINE accounts can still belong to one family — they are attached one at a
  time by an admin instead of by a shared secret.

## 🔴 The one thing that got worse, stated plainly so nobody rediscovers it in three months

**The sick-mother case now depends on an admin being reachable.**

That case is why the code was invented: mum is linked and ill, dad is not linked, **and dad needs to file leave
tonight.** With the code, mum told him six digits. Without it, **dad must reach a person** — and if that is
Sunday evening with nobody watching LINE, he calls the shop instead, exactly as he does today.

**This is not an objection.** It is the customer's system and their call, and the shop answering the phone is a
perfectly good fallback that has always worked. **It is written here because it is the kind of trade that is
invisible at decision time and obvious the first evening it happens.**
⚠️ **If it ever becomes a complaint, the fix is not to re-litigate this — it is to make "admin opens the door"
something staff can do in one tap from where they already are.** That is §6, which is now more load-bearing than
it was an hour ago.

## Knock-on: REQ-051 gets its blocker back

§9 said REQ-079's per-family code answered **SPEC-050 decision #1** — REQ-051's admin code, whose only value
today is the shared static `"229"`. **That is void.** REQ-051 keeps all three of its unanswered security
decisions, and nothing about it got cheaper. 📌 I offered that as a free win; **I am withdrawing it rather than
leaving it to be discovered by whoever picks up REQ-051.**

## The customer explainer — §12 is SUPERSEDED by this version

Points 1, 3 and 6 of §12 all described the code. **Send this one instead.**

```
ระบบไลน์ของทางร้าน — ทำงานยังไง

หลักการ
ไลน์ของร้านจะทำสองอย่างพร้อมกันในที่เดียว
- ผู้ปกครองกดทำรายการเองได้ เช่น แจ้งลา เช็คอิน ดูคอร์ส
- และยังพิมพ์คุยกับแอดมินได้เหมือนเดิม
ไม่ใช่ระบบตอบอัตโนมัติล้วน ๆ ทุกคำถามยังมีคนตอบ

1. เริ่มต้นใช้งานครั้งแรก
- คุยกับแอดมินตามปกติ
- แอดมินเปิดให้เข้าใช้ระบบในแชทนั้นเลย
- ผู้ปกครองใส่เบอร์โทรที่ให้ไว้กับร้าน ระบบจะแสดงชื่อน้องที่มีอยู่
- เรียบร้อย ใช้งานได้ทันที ไม่ต้องตั้งรหัสอะไรทั้งสิ้น

2. เพิ่มนักเรียน
- กดเมนู "เพิ่มนักเรียน" แล้วกรอกชื่อน้อง วันเกิด จังหวัด
- ระบบสรุปให้ตรวจทานก่อน กดยืนยันแล้วข้อมูลเข้าระบบร้านทันที
- แอดมินจะจัดตารางเรียนให้และติดต่อกลับ
- ถ้ามีน้องชื่อซ้ำกับที่มีอยู่ ระบบจะขอชื่อเล่นหรือนามสกุลเพิ่ม
  เพื่อไม่ให้ลงตารางสลับคนกัน

3. คนอื่นในบ้าน หรือเปลี่ยนมือถือใหม่
- คุณพ่อ คุณแม่ หรือผู้ปกครองท่านอื่น ใช้ได้ทุกคน
- เปลี่ยนมือถือใหม่ก็ใช้ได้
- วิธีเดียวกันทุกกรณี คือทักแอดมินแล้วแอดมินเปิดให้ในแชทนั้น

4. ใช้ทำอะไรได้บ้าง
- แจ้งลา — เลือกน้อง เลือกคาบ ยืนยัน ระบบแจ้งครูให้ทันที
- เช็คอินเข้าเรียน
- ดูคอร์สของน้อง เหลือกี่ครั้ง สิทธิ์ลาเหลือเท่าไหร่ หมดอายุวันไหน
- เพิ่มนักเรียน

5. อยากสอบถาม คุยกับแอดมินได้ตลอด
- ปุ่ม "คุยกับแอดมิน" อยู่ทุกหน้า
- หรือพิมพ์ถามเข้ามาได้เลย ระบบจะไม่เข้ามาขัด แอดมินเป็นคนตอบ
- ถ้าระบบไม่เข้าใจสิ่งที่พิมพ์ 2 ครั้ง จะส่งต่อให้แอดมินเองอัตโนมัติ
  ผู้ปกครองจะไม่ติดค้างอยู่กับระบบ

6. ความปลอดภัย
- ผู้ปกครองจะเห็นข้อมูลได้ ต่อเมื่อแอดมินเปิดให้ในแชทนั้นเท่านั้น
- คนที่แอดมินไม่ได้เปิดให้ จะไม่เห็นข้อมูลน้องเลย แม้จะรู้เบอร์โทร
- ระบบไลน์นี้ใช้เฉพาะเรื่องตารางเรียน ไม่เกี่ยวข้องกับการเงินใด ๆ

7. ใช้บนคอมพิวเตอร์ได้ไหม
- ได้ แต่ไลน์บนคอมจะไม่มีเมนูด้านล่าง
- ทักแอดมินได้ตามปกติ และทุกขั้นตอนพิมพ์ตัวเลขเลือกแทนการกดปุ่มได้
```

📌 **Point 6 is now a stronger sentence than it was, not a weaker one.** "Only what an admin opened" is a simpler
promise to make and to keep than "a code nobody must guess" — and it is one the shop controls directly.

## Status

**`READY_FOR_SA` — unchanged.** The GO stands, the queue position stands (#2, after REQ-005). **This cut makes
the REQ smaller, not later.** @Sober specs from §5 **as amended by this section**, and §6 (how an admin opens a
door from OA Manager) is now the single most important thing in the file.
