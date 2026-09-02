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
