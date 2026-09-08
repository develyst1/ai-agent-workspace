# REQ-079: LINE — ผู้ปกครองใช้ระบบผ่านไลน์ + ลงทะเบียนนักเรียนเอง

- Status: 🟢 **READY_FOR_SA / IN_SPEC** — `SPEC-071`, tasks 230–235. Owner gave the GO 2026-09-01.
- 🔢 **The owner's number is REQ-016.** Quote **REQ-016** to him; REQ-079 is for specs and tasks.
- Priority: 🔴 **#2 in his order:** REQ-005 (parked) → **REQ-016 (this)** → REQ-013 → REQ-015 → REQ-014 → REQ-004.
- Requested: 2026-08-31 customer call. Designed 09-01 by Porter at the owner's request.
- 🧹 **Consolidated twice.** Full history, verbatim: `archive/REQ-079-2026-09-01-pre-consolidation.md` and
  `archive/REQ-079-2026-09-02-pre-consolidation-v2.md`. **This file is the current truth; the archives are how
  we got here.** Distinct from **REQ-077** (his REQ-014: OA move · rich menu · notification set).

> 🔴 **The entry design changed TWICE in two days. Read §2 before anything else.**
> family 6-digit code *(cut by the CUSTOMER, 09-01)* → admin invite code *(cut by the OWNER, 09-02)* →
> **the phone number alone.** Any task, spec or memory describing a code or an invite is **stale**.

---

## 1. Goal

Parents use the school through LINE — see their children, file leave, check in, see what is left of a course,
register a new child — **and still talk to a human in the same chat.** Not a closed bot: a bot and an admin
sharing one account.

## 2. 🔴 THE ENTRY — phone number alone (owner, 2026-09-02)

> *"ฉันเอาแค่เบอร์ ก็สามารถใช้งานได้เลย"*

> **A parent enters their phone number. The children on it are shown. They are in.**
> **No code. No invite. No TTL. No lockout. No admin step.**

**CUT and not to be rebuilt:** the 6-digit family code, `family_invites`, the code generator, the 30-minute TTL,
single-use redemption, the attempt counter, and the admin "opens the door" step.
✅ **KEPT: `family_line_links` + its unique index.** One LINE account belongs to **one** family — without it a
second entry silently re-points an account and a parent sees another family's children (Sober's finding; it
survives the mechanism change because it was never about the code).

### 🔴 The accepted risk — recorded so it is legible later

**Anyone who knows a phone number can see that family's children and act for them** (leave, check-in).
**The owner knows.** He raised it with the customer, **explained how dangerous it is**, and the customer
**refused** the 6-digit code and anything in its place. He is proceeding deliberately:
*"ใช่ฉันเข้าใจว่ามันไม่ปลอดภัย … ฉันเสนอแล้ว บอกแล้วว่าอันตรายแค่ไหน เขาก็ไม่เอา ปล่อยไปตามนั้น"*

📌 **A decision taken with the risk on the table — not an oversight.** Whoever meets this later must read
*"the customer was told and declined"*, not *"nobody thought about it"*. **Do not silently re-open it. Do not
silently harden it.** Also in `SYSTEM-FACTS.md`.

⚠️ **Two limits keep it survivable and must NOT be traded away without a new decision:**
1. 🔴 **LINE never unlocks anything that moves money** — children, leave, check-in only. This line has held
   across all three entry designs and is the reason the risk stays bounded.
2. **A parent cannot delete a student with any history** (§6b).

### 🆕 The 6-digit 2FA — BUILT, shipped OFF

> *"ทำ function 2FA 6 digit ไว้ด้วยก็ได้ ให้เป็น session เมื่อต้องการ เมื่อลูกค้าคิดได้ว่ามันสำคัญ เราก็ค่อยมาเปิด"*

- A **6-digit verification step, per session, after the phone number.** **Off by default.**
- **The switch lives in `app_settings`** (REQ-031's mechanism — same shape as the weak-code check).
- 🔴 **Turning it on must be a SETTING, never a rebuild.** The verification branch exists in the flow from day
  one. A stub that would need the flow re-cut later is not what was asked for.
- **Its parameters (lifetime · attempts · lockout) come back to the OWNER when it is switched on.** They are
  **not** inherited from the deleted designs.

📌 **The principle this file keeps proving:** *an acceptance does not transfer across a mechanism change.* The
owner accepted weak codes for a family code the parent chose; that did not cover the invite code; the invite's
parameters do not cover the 2FA. **Each mechanism gets its own decision.**

## 3. What the customer asked for (call, 2026-08-31)

Hybrid bot + admin in one account (⚠️ they named their own risk: commands triggered accidentally by ordinary
chat) · registration after payment: phone → student name + **birthdate** + **province** → lands in the back
office → **an admin schedules the child** · duplicate names must be distinguishable · returning customers see
their children instead of retyping · show real names · an old customer on a new LINE account gets back in.

⚠️ **Provenance:** the call material is a NotebookLM summary of audio. **What is recorded in §2 and §4 as decided
is what the OWNER confirmed in chat**, not what the summary asserts.

## 4. The owner's other decisions — confirmed, do not re-ask

| Decision | Date |
|---|---|
| **A button starts a flow, never a typed keyword** | 09-01 |
| **LINE on PC: no rich menu, buttons cannot be tapped — text only** ⇒ every choice needs a typed equivalent | 09-01 |
| Parents ≈ all mobile; a minority on PC; **admins on PC** | 09-01 |
| **A parent may create a student** | 09-01 |
| Duplicate name → *"บอกให้ตั้งใหม่"* — ⚠️ Porter builds §6a instead: **ask for more detail** | 09-01 |
| Delete: admin on the parents page; parent in LINE — ⚠️ narrowed by §6b | 09-01 |
| **LINE goes to EVERY assigned teacher**, and the confirm dialog must name them all | 08-31 |
| `sid` + `uat` share one LINE channel; **rehearsal allowed now**, expiring — see §8 | 09-01 |

## 5. THE FLOW

**The one idea:** a chat is **ยังไม่รู้จัก** (this LINE account belongs to no family) or **รู้จักแล้ว**, and in
**both** the bot is **silent unless a button was pressed**.

| Menu — ยังไม่รู้จัก | Menu — รู้จักแล้ว |
|---|---|
| `เข้าใช้ระบบ` · `คุยกับแอดมิน` | `แจ้งลา` · `เช็คอิน` · `คอร์สของฉัน` · `เพิ่มนักเรียน` · `คุยกับแอดมิน` |

📌 **`คุยกับแอดมิน` is in both, always, and no flow may remove it.** It is the promise that a person is
reachable — the only thing that makes a bot acceptable to a parent.

### Flow 1 — เข้าใช้ระบบ (everyone, every time: first use, a second guardian, a new phone)

```
[เข้าใช้ระบบ]
บอท : ใส่เบอร์โทรที่ให้ไว้กับทางร้านค่ะ        → 0812345678
บอท : พบข้อมูลของคุณแล้วค่ะ — น้องรดา, น้องต้น
       เรียบร้อยค่ะ ✅ ใช้งานได้เลย
```
- Phone not found → `ยังไม่พบเบอร์นี้ค่ะ ลองตรวจสอบอีกครั้ง หรือกด "คุยกับแอดมิน" ได้เลยค่ะ`
- 🔵 **The 2FA branch sits here, between the phone and the children — dormant.**
- 📌 **This solves the sick-mother case outright.** Dad needs no admin, no code, no invite — the family's phone
  number. The problem that drove three designs disappears with the third.

### Flow 2 — เพิ่มนักเรียน

name → *(if duplicate:* `มีน้องชื่อนี้อยู่แล้ว รบกวนใส่นามสกุลหรือชื่อเล่นเพิ่ม เพื่อไม่ให้สลับกันนะคะ`*)* →
birthdate → province → **summary → confirm** → `บันทึกแล้วค่ะ ✅ แอดมินจะจัดตารางเรียนให้และติดต่อกลับนะคะ`
- 🔴 **Summary-and-confirm is not optional.** It writes into a roster that **has no delete for anything with
  history.** Three seconds of review against a record nobody can remove.
- **The admin must be notified.** That is the customer's own step 5; without it the hand-off depends on somebody
  remembering to look.

### Flow 3 — แจ้งลา · Flow 4 — เช็คอิน (same shape)

child *(step skipped when there is only one)* → session → confirm → done + **teacher told**.
- **Never infer the child, never infer the session** — REQ-050's rule, unchanged.
- **The confirmation names child · date · time**, so a wrong tap is caught by whoever made it.
- Check-in differs only in its time window and what it may refuse.

### Flow 5 — คอร์สของฉัน
The customer's own template: `คอร์ส · ครู · เหลือ 4/6 · สิทธิ์ลาเหลือ · วันหมดอายุ`.

### Flow 6 — คุยกับแอดมิน (every screen, always)
`รับทราบค่ะ แอดมินจะตอบเร็ว ๆ นี้นะคะ 🙏` — then **the bot goes silent and does not resume by itself. Only a
new button press wakes it.**

### The rules that keep bot and human apart

1. **Silent by default.** No greeting on follow, no auto-reply, no *"did that answer your question?"*.
2. **Only a button starts a flow.** A typed keyword never does.
3. **Typing INSIDE a flow is an answer, not a trigger** ⇒ **every choice also accepts `1` / `2`** (LINE on PC
   cannot tap). *Already satisfied by the deployed code — taps and typed replies share one handler.*
4. **The bot mutes when the parent presses `คุยกับแอดมิน`, or after two strikes (rule 5).**
   🔴 **An admin's reply CANNOT trigger it** — measured: an admin's message is outbound and never reaches our
   webhook (§7). **Account-wide muting is not acceptable**: one admin answering one parent must never silence
   the bot for every family.
5. 🔴 **Two unexpected replies and the bot gives up:** `ขอโทษค่ะ ขอส่งให้แอดมินช่วยดูนะคะ 🙏`
   **A parent must never be trapped in a loop with a machine while a person sits in the same chat.**
6. **No flow touches money.** No buying, refunds or price changes — staff only.

### Deliberately NOT in scope
- **The bot answers no questions** — prices, schedules, opening hours all reach a person. That is the price of
  never talking over the admin, and for this business it is the right trade.
- **No auto-scheduling.** The parent registers; **a human puts the child on the calendar.**

## 6. Two things Porter did not build as literally worded

**(a) Duplicate names — ask for detail, do not demand a rename.** The customer asked for children to be
**distinguishable** and suggested a surname. **Two real children can share a name.** Telling a parent to rename
their child because another family used it is wrong, and it confirms to whoever typed it that such a child
exists. ⇒ ask for a surname or nickname. Same outcome, no false claim, no leak.

**(b) 🔴 Deletion by a parent — narrowed.** A student carries bookings, a paid course, attendance and money rows,
and **the product has never had a student-delete** — not an oversight. ⇒ a parent may remove **only** a student
with **nothing attached**; anything with history is **hidden by an admin, never deleted**; **never mid-course**
(a paid course would lose its owner and the ledger would point at nobody, discovered at month-end).

## 7. Feasibility — @Sober, read from the code

- **Per-user menus: a LINE feature we already run** (`linkRichMenuToUser` / `setDefaultRichMenu`, ids in
  `app_settings`; REQ-042 was this exact path). 📌 Make **ยังไม่รู้จัก the DEFAULT** and **รู้จักแล้ว the
  per-user link** — a new follower then gets the right menu with no code running.
- **Nothing in the flows needs a mechanism we do not already run.** Multi-turn state = `line_link_sessions` +
  `decideMessageRoute`'s *"an in-progress conversation wins"*. Leave / check-in / course = REQ-046 · REQ-050 ·
  REQ-016 **reused, not rebuilt**.
- 🔴 **Measured 2026-09-01: an admin's reply in OA Manager is OUTBOUND and never reaches our webhook.** The
  owner replied on a `sid` chat and **no `[line-in]` was logged.** ⇒ rule 4's admin trigger cannot be built;
  `muted_until` plus the two inbound triggers is the design.
- 🔴 **AC-16 (silence by default) is a CHANGE to deployed behaviour, not a new capability.** Today's bot answers
  stray text in an idle chat with errors (`เมนู` → *"เบอร์โทรไม่ถูกต้อง"*; `yo` → *"ไม่พบครูชื่อเล่น"*), seen in
  the owner's own account. **It needs a regression test that fails on today's handlers.**

## 8. Rehearsal on `sid` — allowed now, and it EXPIRES

Owner 09-01: rehearsal is allowed; the customer's real OA is connected later.
🔴 **Not empty: 2 real teachers are linked** — "no real customers" holds for **parents** (0 of 180), which is
what makes parent-flow rehearsal safe. **Never fire an outbound message at the two linked teachers.**
The owner is linked on `sid` as teacher **`Bank`** — the one available test recipient.

> 🔴 **The permission ENDS the instant either (a) the customer's real OA is connected OR (b) a real parent links
> on `uat` — whichever comes first.** Written as a trigger, not a date, because a permission granted while
> *"nobody uses it yet"* is exactly the kind that survives the day someone starts.

## 9. Sequencing with REQ-051 — settled

**Not a merge.** Shared lookup and PII rule, opposite trust models: REQ-051 is a **public, no-login page that
burns a paid session**; this is a LINE chat. ⚠️ **The earlier claim that this REQ's code would fix SPEC-050's
static `"229"` admin code is VOID** — there is no code any more. **REQ-051 keeps all three of its security
decisions and got no cheaper.**

## 10. Acceptance Criteria

**Rewritten for §2. Anything about codes, invites, TTLs or lockouts is withdrawn.**

- [ ] **AC-1 (silent by default)** — **Given** an idle chat, **When** the parent types anything at all —
      **including the exact menu words** — **Then** the bot does not reply. 🔴 *A change to deployed behaviour:
      needs a regression that fails on today's handlers.*
- [ ] **AC-2 (entry)** — **Given** `[เข้าใช้ระบบ]` and a known phone, **Then** that family's children are shown
      **by name** and the account is linked. **No code, no invite, no admin.**
- [ ] **AC-3 (unknown phone)** — a message offering a retry **and** the admin, revealing **nothing** about
      whether that number belongs to anyone.
- [ ] **AC-4 (one account, one family)** — **Given** a LINE account already linked to family A, **When** it
      enters family B's phone, **Then** it does **not** silently re-point; the unique index holds.
- [ ] **AC-5 (2FA dormant)** — **Given** the `app_settings` switch OFF, **Then** no verification step appears.
      **When it is turned ON, the step appears with no code change and no redeploy.**
- [ ] **AC-6 (duplicate name)** — asks for a **surname or nickname to tell them apart**; must **not** tell the
      parent to choose a different name, and must **not** reveal whose the existing child is.
- [ ] **AC-7 (review before write)** — a summary is shown and **must be confirmed** before anything is saved;
      แก้ไข returns without saving.
- [ ] **AC-8 (the admin is told)** — a student created this way **notifies an admin**. Nothing may depend on
      someone remembering to look.
- [ ] **AC-9 (nothing partial)** — a parent who abandons mid-flow leaves **no partial student** anywhere.
- [ ] **AC-10 (leave)** — child chosen *(skipped when there is only one)* → session → confirm → **the teacher is
      notified**, and the confirmation **names child, date and time**.
- [ ] **AC-11 (never infer)** — two children, or one child with two sessions that day ⇒ the parent is **asked
      which**. The system never picks.
- [ ] **AC-12 (course view)** — คอร์ส · ครู · remaining **n/N** · leave quota left · expiry.
- [ ] **AC-13 (mute)** — after `คุยกับแอดมิน` or two strikes, the bot stays silent in that chat 🔴 **and works
      normally in every other family's chat.**
- [ ] **AC-14 (two strikes → human)** — two consecutive unexpected replies ⇒ handed to an admin, bot stops.
      **The parent is never left looping.**
- [ ] **AC-15 (typed choices)** — every choice accepts `1` / `2` identically to a tap. *Tested on LINE PC, where
      tapping is impossible.*
- [ ] **AC-16 (no money, ever)** — no flow buys, refunds, discounts or changes a price. Deletion per §6b.
- [ ] **AC-17 (regression)** — teacher schedule messages, course-confirm, booking-confirm and the **08:15** daily
      reminder all behave exactly as before.
- [ ] **AC-18 (rehearsal boundary)** — no test run on `sid` reaches the **2 real linked teachers** (§8).

## 11. Open

| What | With whom |
|---|---|
| Nothing blocks the spec. `SPEC-071` tasks 230–235 are cut; **230 PASSED**, 231 is next | @Sober / @Jason |
| ⚠️ **`SPEC-071` still contains the invite/code design — re-cut it for §2** (231 · 232 in particular) | @Sober |
| `0030` migration — **`sid` first**, `db:verify` ✅ blocking, witnessed by `family_line_links_user_uq` | the owner |
| §6a rename-vs-detail · §6b how narrow parent deletion is — **built as recommended unless he says otherwise** | the owner |

---

## 12. 🎨 Rich-menu spec — CONSOLIDATED 2026-09-06

> **Full original text (cell-by-cell pixel areas, the illustrator brief, the publish/adopt notes):**
> `archive/REQ-079-2026-09-06-pre-consolidation.md`.

**Two menus, and they are BUILT and were published and then REMOVED at the customer's own request (2026-09-05).**
- **A — ยังไม่รู้จัก** · 2500×843 · 2 cells: **เข้าใช้ระบบ** · **คุยกับแอดมิน**
- **B — รู้จักแล้ว** · 2500×1686 · 3+2: **แจ้งลา · เช็คอิน · คอร์สของฉัน** / **เพิ่มนักเรียน · ภาษา/ช่วยเหลือ · คุยกับแอดมิน**
- 🔴 **`คุยกับแอดมิน` is bottom-right in BOTH.** The one position that is not negotiable.
- **แจ้งลา and เช็คอิน sit side by side and mean opposite things** — visually distinct, or a mis-tap files a leave
  for a child standing at the counter.
- **Art direction: 🟠 orange** (owner, 2026-09-05). **Both were confirmed rendering on a phone.**

🔻 **The correction that matters more than the spec:** **the artwork is GENERATED BY US** —
`smart-scheduler-back` → `assets/line/generate-rich-menus.mjs`. **Porter originally wrote §12 as a brief for an
illustrator and told the owner to send it to one.** *"ก็พวกนายนั่นแหละ ทำ"*. **Read what the repo has before
planning what to build.**
🔴 **Cell bounds live in TWO places** — the generator and `line-rich-menu.ts`. *"Change both, never one alone."*
🔴 **`publishRichMenus` creates six NEW menus every run and deletes nothing.** The demo OA reached **twenty**
this way. **`line:remove-menus` exists now (dry-run by default, `REMOVE <n>` to confirm, ours-only).**
⚠️ **Nothing is on the customer's OA today, by their choice.** Re-publishing is one command whenever they ask.

## 13. 🔴 "The parent is never stuck" — defect + wording, owner-approved 2026-09-02

Found by the owner on `sid` while checking something unrelated. **One problem in two places.**

**Inside a flow — no exit.** `ยกเลิก` appears only at the final confirm. Typing `เมนู` at the name step **became
the child's name**; typing it again at the birthdate step was rejected as a malformed date. **The only escape is
to finish — and finishing writes a student that can never be deleted.**

- [ ] **AC-19 (every step has an exit, and says so)** — **Given** any step of any flow, **Then** the prompt
      itself offers a way out: ` · หรือพิมพ์ ยกเลิก เพื่อออก`, and typing it leaves with nothing written.
- [ ] **AC-20 (advertised words do not become data)** — **Given** a word the bot advertises in its own command
      list (`เมนู` at minimum), **When** it is typed where a value is expected, **Then** it is **not silently
      stored**; either it behaves as the command, or the bot asks `ใช้ "เมนู" เป็นชื่อน้องใช่ไหมคะ?`.
- [ ] **AC-21 (rule 5 actually fires)** — two consecutive unexpected replies **hand the chat to a human.**
      Observed **not** to fire on 2026-09-02.

**Outside a flow — nothing says a person is reachable.** The live menu has no `คุยกับแอดมิน` cell and
`ช่วยเหลือ` only re-prints the command list. §5 made that promise the **price of the bot's silence**; today only
the silence is delivered. **From the parent's side, silence reads as broken or ignored.**

- [ ] **AC-22 (the promise is visible)** — the command list (rendered by both `เมนู` and `ช่วยเหลือ`) ends with:
      **`หรือพิมพ์คำถามเข้ามาได้เลยค่ะ เดี๋ยวแอดมินมาตอบนะคะ 🙏`**

🔴 **Scope: a defect fix, not a redesign.** **No new rich-menu image and no `คุยกับแอดมิน` cell** — the owner has
not asked for one, and one i18n line restores the missing half of the trade. 📌 The command list is the right
home because **the person reading it is by definition the person who is lost.**

---

## 14. 🔴 A muted chat must be re-openable BY TYPING — owner, 2026-09-03

> *"มันต้องกลับมาพิมพ์ได้ เพราะลูกค้าอาจจะใช้คอม ไม่มี rich menu … อาจจะบอกทิ้งท้ายว่า ต่อจากนี้หากอยากใช้ระบบ
> คำสั่งอีก ให้พิมพ์ เปิดคำสั่ง ก่อน … ไปคิดกันเอา"*

**He found the hole and he is right.** The wake path was a **button**, and **LINE on PC has no rich menu** —
so a PC parent who gets muted has **nothing to tap** and sits in silence until a timeout they were never told
about. **Both mutes are affected:** the two-strikes handover *and* the parent pressing `คุยกับแอดมิน`.

### The rule — and why it does not reopen rule 2

> **A muted chat is re-opened by typing one specific word, and the bot names that word at the moment it mutes.**

📌 **This is NOT the keyword trigger rule 2 forbids, and the difference is the whole reason it is safe.**
Rule 2 bans a keyword **starting a flow out of an idle chat** — the customer's own fear of *"commands triggered
accidentally"*. This is the opposite shape: **a deliberate act, by a person who was just told the word, whose
only effect is to end a state they are already in.** It starts nothing.

### The word

**`เปิดเมนู`** — Porter's choice over the owner's `เปิดคำสั่ง`, and the reasons are small but real:
- **Two syllables that are not a sentence anyone types by accident** mid-conversation with a human.
- **It reuses vocabulary the parent already has** (`เมนู` is on the command list they have seen), rather than
  teaching "คำสั่ง", which is our word, not theirs.
- 🔴 **It must be DISTINCT from `เมนู` itself.** While muted, `เมนู` is deliberately ignored — that is the point.
  If plain `เมนู` un-muted, then a parent idly reaching for a familiar command would drop the bot back into a
  live conversation with an admin. **The un-mute has to be a thing you choose, not a thing you reach for.**

### Wording — appended to BOTH mute messages

Two-strikes handover:
```
ขอโทษค่ะ ขอส่งให้แอดมินช่วยดูนะคะ 🙏
หากต้องการกลับมาใช้เมนูอีกครั้ง พิมพ์ "เปิดเมนู" ได้เลยค่ะ
```
Parent pressed `คุยกับแอดมิน`:
```
รับทราบค่ะ แอดมินจะตอบเร็ว ๆ นี้นะคะ 🙏
หากต้องการกลับมาใช้เมนูอีกครั้ง พิมพ์ "เปิดเมนู" ได้เลยค่ะ
```
📌 **The sentence sits where the parent is at the moment they need it** — the same reasoning as putting the
"a human will answer" line in the command list. **A way out nobody was told about is not a way out.**

### Acceptance Criteria

- [ ] **AC-23 (a muted chat can be re-opened by typing)** — **Given** a muted chat, **When** the parent types
      **`เปิดเมนู`**, **Then** the bot replies and the command list is available again. **Works on PC**, where
      there is no menu to tap.
- [ ] **AC-24 (the way out is told, not discovered)** — **Given** either mute (two-strikes handover *or*
      `คุยกับแอดมิน`), **Then** the message that mutes the chat **names `เปิดเมนู` in the same message.**
- [ ] **AC-25 (the mute still holds against everything else)** — **Given** a muted chat, **When** the parent
      types anything **other** than `เปิดเมนู` — **including advertised commands like `เมนู`, `เพิ่มนักเรียน`,
      `ลา`** — **Then** the bot stays silent. *(Proven on 09-03 for `เพิ่มนักเรียน`; it must survive this change.)*
- [ ] **AC-26 (re-opening starts nothing)** — **Given** `เปิดเมนู`, **Then** the bot shows the command list and
      **does not resume any abandoned flow.** A draft cancelled or handed off stays gone.

⚠️ **@Sober's design call, not mine:** whether the button press and `เปิดเมนู` share one un-mute path. **They
should behave identically** — the parent must not learn two different ways back depending on their device.

### 🔻 §12 CORRECTED — the artwork is GENERATED BY US, not drawn by anyone (owner, 2026-09-05)

**Porter wrote §12 as a brief for a human illustrator and told the owner to send it to one. That was wrong,
twice: the artwork already exists, and it is produced by a script in our own repo.**
Owner: *"ก็พวกนายนั่นแหละ ทำ ... อยากได้สีส้ม แค่นั้นแหละ"*.

**Where it lives:** `smart-scheduler-back` → `assets/line/` (logical name only — the absolute path is in
`machine.local.md`). Its `README.md` is the contract:
- Four PNGs today — `parent-th/en.png` (2500×1686) and `teacher-th/en.png` (2500×843) — **from REQ-015**.
- They are **generated** by `generate-rich-menus.mjs`: pure geometry + simple SVG icons, rasterised with `sharp`.
  **Palette, icons and label maps are edited in that script and it is re-run.**
- 🔴 **The cell bounds live in TWO places** — the script's geometry and `src/lib/line-rich-menu.ts`. The README's
  own rule: *"change both the code bounds and this artwork — never one side alone."*
- `bun run line:publish-menus` uploads them, on a **fixed filename contract**.

⇒ **This is an engineering change, not a design commission.** Nothing about it needs an outside illustrator, and
the two-state REQ-079 menus (`unknownTH` 2-cell · `knownTH` 5-cell) are new entries in the same generator.

**The one design decision the owner has given: 🟠 ORANGE.** That is the whole art direction — *"อยากได้สีส้ม
แค่นั้นแหละ"*. Everything else in §12 above still stands as the **layout and wording** spec (cell counts, the
exact Thai labels, `คุยกับแอดมิน` bottom-right in both, `แจ้งลา`/`เช็คอิน` visually distinct, legible at 1/3).

⚠️ **STILL OPEN, asked once and not yet answered:** the live 6-cell menu carries **`ภาษา`** and **`ช่วยเหลือ`**.
**REQ-079's menu B drops both** — a choice Porter made while designing and **never put to the owner.** If they
are to stay, this REQ changes; the space exists. **Not a blocker:** it is a label change in one script.

### ✅ `ภาษา` and `ช่วยเหลือ` STAY — owner, 2026-09-05. Menu B re-laid out.

Owner: *"เก็บไว้"*. **My removal of them is reversed.** Recorded here rather than by editing §12 above, so the
change and its reason stay legible.

🔴 **The constraint that decides the layout, and it is not negotiable:** a LINE rich menu is **at most
2500 × 1686**, i.e. **two rows** ⇒ **six cells maximum** on the large menu. Menu B now wants seven —
`แจ้งลา` · `เช็คอิน` · `คอร์สของฉัน` · `เพิ่มนักเรียน` · `คุยกับแอดมิน` · `ภาษา` · `ช่วยเหลือ`.

**Porter's resolution, following a pattern this repo already uses:** the **teacher** menu already ships
`ภาษา/ช่วยเหลือ` as **one** cell (`btn_langhelp` in `line-i18n.ts` — see `assets/line/README.md`).
⇒ **Do the same on the parent menu.** Six cells, nothing dropped:

| Cell | Area (x, y, w, h) | Label |
|---|---|---|
| 1 | `0, 0, 833, 843` | **แจ้งลา** |
| 2 | `833, 0, 833, 843` | **เช็คอิน** |
| 3 | `1666, 0, 834, 843` | **คอร์สของฉัน** |
| 4 | `0, 843, 833, 843` | **เพิ่มนักเรียน** |
| 5 | `833, 843, 833, 843` | **ภาษา / ช่วยเหลือ** |
| 6 | `1666, 843, 834, 843` | **คุยกับแอดมิน** |

📌 **`คุยกับแอดมิน` is still bottom-right**, which was the one position §12 called non-negotiable. It moved from a
wide cell to a third-width one; the corner is what matters, not the width.
📌 **This supersedes §12's 3+2 layout for menu B.** §12's 2-cell **menu A is unchanged** — a follower who has not
linked has exactly two things to do, and the owner's *"เก็บไว้"* was about the buttons the live menu already has.
**If he wants `ภาษา/ช่วยเหลือ` on A as well, that is a third cell and one more line in the generator.**

## 15. ✍️ Wording pass — CONSOLIDATED 2026-09-06

> **Full original text: `archive/REQ-079-2026-09-06-pre-consolidation.md`.** Nothing below is new; everything
> removed was superseded twice — first by the owner, then by the customer taking the menus off their OA.

**Written 2026-09-05** because the menus had gone live and the messages still told parents to type keywords.
🔴 **Then the customer removed the menus from their OA the same day**, so copy pointing at buttons is wrong
again. ⇒ **Do NOT ship §15's button-first copy while the customer's OA has no menu.**

**What SURVIVES from it, and is still binding:**
1. 🔴 **Typing must never stop working** (owner, 2026-09-03: *"มันต้องกลับมาพิมพ์ได้ เพราะลูกค้าอาจจะใช้คอม"*).
   **This is why the menu removal did not lock anyone out** — the most load-bearing decision in the whole REQ.
2. 🔻 **Our bot sends NOTHING on follow.** The shop's own OA greeting already carries the programme list, branch,
   prepayment rule, phone and prices. **A second welcome branding "Smart Scheduler" competes with it.**
   *(Porter proposed one; the owner corrected it — the bot is the shop's tool, not a product introducing itself.)*
3. **Decision 7 — the empty state:** teacher `วันนี้ไม่มีคาบสอนค่ะ` · parent `วันนี้ไม่มีคาบเรียนค่ะ`.
   Two strings: *คาบสอน* is what a coach teaches, *คาบเรียน* what a child attends.
4. ⚠️ **Open, unchanged:** `นักเรียน` (keyword) vs `คอร์สของฉัน` (menu cell) — same destination or two? ·
   `qr` has no cell and there is no seventh.
5. 🔴 **Cost, unchanged:** `AC-19`/`AC-22`/`AC-24` were @Tanya's passes on the OLD copy ⇒ **re-checked, not
   carried over**, whenever new copy ships.

⚠️ **The customer's 2026-09-06 registration copy (§17) overlaps this pass. Read §17 first** — it is newer and it
is theirs.

## 16. 🔴 CUSTOMER CHANGE REQUEST — the role step must not use `1 / 2 / 3` (customer, via the owner, 2026-09-05)

**The first change request that has ever reached us from the customer about the bot**, and it arrives because the
bot is now running on **their** OA. Owner, relaying: *"พวกคำสั่งเริ่มต้น ไอ่ 1, 2, 3 น่ะ มันชนกับของเขาที่มีอยู่แล้ว
เขาขอว่าแก้ให้เป็น พ่อ แม่ หรือกลุ่มคำสั่งที่เข้าชุดคำสั่งแทนได้มั้ย"*.

**The collision, plainly:** our role prompt is *"เลือกบทบาทของคุณ: 1 = ลูกค้า/ผู้ปกครอง · 2 = ครู · 3 = แอดมิน"*.
**Their OA already answers to bare numbers** for their own menu. A parent typing `1` is answering two systems at
once. **This is not a preference — it is two systems claiming the same input on one account.**

📌 **And it is exactly the failure mode this REQ already has a rule for.** `AC-20` exists because *"advertised
words must not become data"*. **The same principle, one level up: a word the ACCOUNT already owns is not ours to
claim.** We were the second system onto that OA; the numbers were theirs first.

### The design — words, and the parent should not have to type them

**Roles stay three. The input stops being a number.**

| Role | Accepted answers |
|---|---|
| ผู้ปกครอง | **`ผู้ปกครอง`** · `พ่อ` · `แม่` · `ปกครอง` |
| ครู | **`ครู`** |
| แอดมิน | **`แอดมิน`** · `admin` |

🔴 **Bare `1` / `2` / `3` must STOP being accepted at this step** — leaving them as a hidden fallback keeps the
collision alive and makes it intermittent, which is worse than keeping it.

**Preferred presentation: LINE quick-reply buttons on the role question**, so the parent **taps** and never types.
That removes the collision at the source rather than negotiating around it. **Whether quick replies are already
wired is @Sober's read, not my assumption** — if they are not, the typed words above are correct and sufficient
on their own, and quick replies are an improvement to sequence later.

**Wording, if it stays typed:**
> เลือกบทบาทของคุณค่ะ — พิมพ์ **ผู้ปกครอง** · **ครู** · หรือ **แอดมิน**
> (พ่อหรือแม่ พิมพ์ `ผู้ปกครอง` ได้เลยค่ะ)

⚠️ **`พ่อ` and `แม่` are ACCEPTED but not ADVERTISED.** Offering them as the headline invites *"แล้วยายล่ะ / ป้าล่ะ"*
— the design is deliberately one guardian role with many people in it (§2), and the label must not imply otherwise.

⚠️ **Anywhere else the bot asks for a number must be swept too** — this request names the role step because that
is where the customer hit it, **not because it is the only one.** ⇒ **@Sober: a read across the flows.**

---

# 17. 📨 2026-09-06 — the customer sent the REGISTRATION COPY. Analysis.

**Eight screens, bilingual, in their own words.** Same pattern as the notification templates: **they write copy,
and the copy carries design decisions they may not know they are making.** Porter's job is to separate the two.

## 1. What is simply COPY — take it, no question

| Their step | vs today |
|---|---|
| 1 · *"กรุณาพิมพ์ 'สมัคร'"* | ✅ matches |
| 3 · phone prompt | ✅ matches |
| 6 · province | ✅ matches |
| 7 · a **review-before-save** step | ✅ we already require it (`Flow 2`) — their wording replaces ours |
| 8 · *"เพิ่ม 'น้องดีซี' สำเร็จแล้ว ✅"* | ✅ matches |

📌 **Step 7 is worth noting: they arrived at summary-and-confirm independently.** It was in our design because
the roster has no delete for anything with history. **They want it for their own reasons. Agreement, not luck.**

## 2. 🔴 CONFLICTS — each needs a decision, and one lands tonight

### 2a. The role step: their **typed `Next`** vs our **buttons**, shipping tonight
They want: **type `Next` ⇒ parent** · `ครู` ⇒ teacher · `แอดมิน` ⇒ admin · **`CEO` ⇒ ผู้บริหาร**, and *"เดี๋ยวทาง
ภายในที่เหลือจะสื่อสารกันเองค่ะ"* — **only the parent path is advertised; staff are told their keyword privately.**
🔴 **`TASK-251` is in tonight's release and does the opposite:** quick-reply **buttons**, no typing at all, which
is what killed their own `1/2/3` collision.
📌 **Their design is coherent** — a public message that shows only the parent path is a real choice, and buttons
would expose every role to every parent. **Ours removes typing; theirs hides the staff paths. Both solve the
collision; they cannot both ship.**
⚠️ **And `Next` does not mean "parent" in any language.** A teacher reading *"พิมพ์ Next เพื่อเข้าใช้งาน"* types
`Next` and is registered as a parent. **Their answer is that staff know better — which holds until one does not.**

### 2b. 🔴 A FOURTH ROLE — `CEO` / ผู้บริหาร
**Does not exist.** The system has parent · teacher · admin. **This is not copy; it is a new role**, and nobody
has said what a CEO may see or do. ⇒ **Scope question for the owner, not a wording change.**

### 2c. 🔴 Date format — theirs is `DD.MM.YYYY`, ours is `YYYY-MM-DD`
Their step 5: *"(1.วัน.เดือน.ปี)"* / `DD.MM.YYYY`. **The deployed bot rejects that today** — the owner's own
screenshot: *"รูปแบบวันเกิดไม่ถูกต้อง กรุณาพิมพ์เป็น ปปปป-ดด-วว"*. ⚠️ **`02.12.2024` in their step 7 is
ambiguous to a machine that also accepts the other order — 2 Dec or 12 Feb.** **Their format, their customers,
their call — but it must be stated, not inferred.**

## 3. 🆕 NEW WORK they may not realise they are asking for

### 3a. **Bilingual — every message in Thai AND English, together**
**We already support two languages** (`line_lang`, `ภาษา` button, `parent-th`/`parent-en` menus) — **as a
SWITCH, one language per person.** They are asking for **both in one message, always.**
⇒ **Two different products.** Both-always is simpler to build and doubles the length of every message on a phone;
the switch is already built and shows each person one language. **Their call, and it affects every string we
have, including REQ-077's six notifications.**

### 3b. **Numbered multi-student entry** — *"(1.ส้ม 2.องุ่น 3.แอปเปิ้ล)"* and *"(1.วัน.เดือน.ปี 2.วัน.เดือน.ปี)"*
Read literally: **a parent types several children at once, then several birthdates in the same numbered order.**
**Today the flow is one child at a time, each with a review step.** 🔴 **If that reading is right it is a real
redesign** — and the numbered-list-with-a-typed-reply shape is **exactly what their own `1/2/3` complaint was
about.** ⚠️ **I am not building it on my reading. One question settles it.**

### 3c. Cosmetic, cheap, do them: phone shown formatted (`082-503-1502`) · the existing children listed back at
the add-student step · `ยืนยัน`/`Confirm` accepted at step 7 *(we accept `ยกเลิก` already)*.

## 4. What this does NOT change

**Entry is still the phone number alone** — no code, no 2FA. Nothing in their copy reopens that.

## §17 — TWO of the four answered by the owner, 2026-09-06. Both taken to the customer already.

### ✅ Language: **the SWITCH stays. Not both languages in one message.**
> *"เรื่องภาษา เอาสลับแบบเรานั่นแหละ เพราะฉันว่ามันจะยาวเกินไป … ผู้ใช้เวลาอ่านจะลายตาหรืองงเอา"*

**He put it to the customer himself and recommended against both-at-once.** ⇒ **Nothing changes.** The existing
mechanism stands: `line_lang` per person · the `ภาษา` control · `parent-th`/`parent-en` menus.
📌 **This also protects `REQ-077`, which shipped to `sid` today.** Both-languages-always would have doubled the
length of **all six notifications** — and `TODAY'S SCHEDULE` for a coach with eight classes is already the longest
message the product sends. **The decision that looked like a wording preference was a length decision.**
⚠️ **What the customer's bilingual copy is still good for: the ENGLISH strings.** They wrote them; **use them as
the `en` side of the switch** rather than translating our own. **Their words for their customers.**

### ✅ `CEO` / ผู้บริหาร: **not a LINE role at all — a BACKOFFICE audience, deferred**
> *"เรื่อง CEO เป็นเรื่องของแจ้งยอดขาย ยอดจ่าย กำไร ของระบบ backoffice ฉันเลยบอกลูกค้าไว้ทีหลัง ไว้ช่วงทำ backoffice"*

⇒ **Struck from this REQ.** It is not a fourth chat role and nothing here builds it. **Sales · spend · profit
reporting belongs to the `REQ-BO` block**, and the owner has already told the customer it waits for that phase.
📌 **Worth keeping as an example, not a criticism:** a single word in a copy document — `CEO` — **was a whole
subsystem in a different product phase.** The customer was not hiding it; **they wrote copy, not scope.** This is
why their documents get read for decisions rather than transcribed.

### 🔴 Still open — two, both narrow
1. **Date format** — theirs `DD.MM.YYYY`, ours `YYYY-MM-DD`, and their own `02.12.2024` is ambiguous to a parser
   that accepts both orders.
2. **Numbered multi-student entry** — did they mean **several children in one pass**, or is `(1.ส้ม 2.องุ่น)`
   just showing what the list looks like? **The difference is a redesign versus a display line.**

### ✅ §17 CLOSED 2026-09-06 — the last two, both from the owner after talking to the customer

**1. Date of birth: `วัน-เดือน-ปี` (`DD-MM-YYYY`).**
The customer's day-first order, **with our dash separator, not their dots.** ⇒ **The deployed prompt and parser
both change** — today they demand `ปปปป-ดด-วว` and reject anything else.
- **Prompt:** `กรุณาพิมพ์วันเกิดของนักเรียนค่ะ (วัน-เดือน-ปี เช่น 02-12-2024)`
- **Rejection:** `รูปแบบวันเกิดไม่ถูกต้องค่ะ กรุณาพิมพ์เป็น วัน-เดือน-ปี เช่น 02-12-2024`
- 🔴 **Day-first makes `03-04-2024` genuinely ambiguous to a human** — 3 April or 4 March. **What saves it is the
  confirm step (§7): the summary prints the date back before anything is written.** ⇒ **The confirm step is now
  load-bearing for correctness, not just for review.** **Nobody may "simplify" it away later.**
- ⚠️ **The bot must still accept a 4-digit-first string and refuse it clearly** rather than read `2024-12-02` as
  day 2024 and produce a confusing error. **A wrong-order date should fail loudly, and it does — but say so.**

**2. Adding students: UNCHANGED. One child at a time.**
> *"การเพิ่มลูกเอาตามเดิม"*
⇒ **The numbered lists in their copy — `(1.ส้ม 2.องุ่น 3.แอปเปิ้ล)` — were an EXAMPLE of what the list looks
like, not a request for batch entry.** **No redesign.** 📌 **This was the expensive reading and it is now closed**
— and it is why I did not build it on my own interpretation. **The literal reading was a rebuild; the answer was
a display line.**

**⇒ §17 is fully answered except the role step**, where their typed `Next` and our shipping buttons both solve
their own `1/2/3` complaint. **Porter's standing recommendation: ship the buttons, let them tap them, then
decide.**

## §18 — 🔴 LANGUAGE, SPLIT IN TWO (customer via the owner, 2026-09-07). **This reverses 2026-09-06.**

> *"พวกชุดคำสั่งที่ให้ ผปค ใช้พิมพ์ตอบโต้ ให้เป็นแบบสองภาษา แบบที่เขาต้องการนั่นแหละ · แต่ข้อความแจ้งเตือน
> เอาตามที่ลูกค้าบอก มันจะเป็น eng ล้วนมั้ง"*

**Two message families, two different answers. They were one question yesterday and the answer was "the switch".**

| Family | Language | Where |
|---|---|---|
| **The conversation** — registration, commands, prompts, errors, the command list | 🔴 **BILINGUAL — Thai AND English in the same message**, in the customer's own 8-screen copy (§17) | `REQ-079` |
| **The notifications** — the six `CONFIRMED SCHEDULE` / `TODAY'S SCHEDULE` / `COURSE DEDUCTION` / แจ้งลา | **English labels**, as they specified | `REQ-077` |

🔻 **This reverses the 2026-09-06 ruling** (*"เอาสลับแบบเรานั่นแหละ … มันจะยาวเกินไป"*), **and the reversal is
narrow: it applies to the CONVERSATION only.** **The length objection still holds for notifications**, which is
why they stay single-language — **so the owner's original reasoning survives where it was strongest.**

🔴 **The consequence nobody has stated: the `ภาษา` control may now switch nothing.**
`line_lang`, the `ภาษา` cell and the `parent-th`/`parent-en` menu pair exist to give each person ONE language.
⇒ **If the conversation is bilingual and the notifications are English-labelled, what is left for it to change?**
⚠️ **Not a thing to rip out tonight** — but **a switch that switches nothing is a control that lies**, and it has
a cell on a rich menu. **Raised, not decided.**

### Porter's decision on the one thing the customer's copy cannot answer
**Generated values inside a notification follow the LABELS: English.** ⇒ **`Date : Monday`, not `อาทิตย์`.**
**Reason:** the owner's two live samples disagreed with each other on exactly this — teacher `อาทิตย์`, parent
`Monday`, same field — **because they followed the recipient's `line_lang`.** ⇒ **once notifications are English,
one rule replaces the disagreement.** ⚠️ **Names stay as they are** — `Student : น้องดีซี` is Thai because the
child's name is Thai, not because the message is. **Labelled mine; one line to revert.**
