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

## 12. 🎨 Rich-menu image spec — Porter (UX writer), 2026-09-02

**Why this is here:** the menus are the **only** blocker left on REQ-079 — with no menu no flow can start (rule
2), so entry, เพิ่มนักเรียน, แจ้งลา, เช็คอิน and คอร์สของฉัน are all unreachable and QA cannot test any of them.
**Two images + one `publishRichMenus` run unblocks the entire REQ.**

⚠️ **`linkKnownRichMenu` is a SILENT no-op until these are published.** Nothing errors; every chat simply keeps
the menu it has. That is correct degradation and it is exactly the shape of thing this project keeps getting
caught by — so it is a **deploy step**, never something a green task tick stands in for.

### Image A — **ยังไม่รู้จัก** (default menu, every new follower)

**2500 × 843 px** · one row of **2 cells**, each **1250 × 843**.

| Cell | Area (x, y, w, h) | Label | Action |
|---|---|---|---|
| 1 | `0, 0, 1250, 843` | **เข้าใช้ระบบ** | starts Flow 1 (phone → children) |
| 2 | `1250, 0, 1250, 843` | **คุยกับแอดมิน** | Flow 6 — mutes the bot |

### Image B — **รู้จักแล้ว** (linked to a family)

**2500 × 1686 px** · **2 rows**. Top row 3 cells of **833 × 843** (the third takes the rounding: 834 wide).
Bottom row 2 cells of **1250 × 843**.

| Cell | Area (x, y, w, h) | Label |
|---|---|---|
| 1 | `0, 0, 833, 843` | **แจ้งลา** |
| 2 | `833, 0, 833, 843` | **เช็คอิน** |
| 3 | `1666, 0, 834, 843` | **คอร์สของฉัน** |
| 4 | `0, 843, 1250, 843` | **เพิ่มนักเรียน** |
| 5 | `1250, 843, 1250, 843` | **คุยกับแอดมิน** |

📌 **`คุยกับแอดมิน` is bottom-right in B and right in A — the same corner in both.** A parent who learns where
the human is must not have to learn it twice. It is the one cell whose position is not negotiable.

### Rules for whoever draws them

- **Thai text on the image itself** — the labels above, exactly. They are the words the parent reads; they are
  not placeholders and must not be "improved" in the artwork.
- **Legible at ~1/3 size.** A rich menu is viewed on a phone at roughly a third of these pixels. Test the
  export scaled down before accepting it.
- **Cell boundaries must be visible** — a line, a tile, or clear spacing. A parent cannot discover a tap target
  they cannot see.
- **แจ้งลา and เช็คอิน sit side by side and mean opposite things.** Make them visually distinct (different icon,
  different colour) — a mis-tap there files a leave for a child who is standing at the counter.
- **No branding requirement from us** — the shop's look is theirs.
- Format: **PNG or JPEG, under 1 MB**, RGB.

### After the images exist

Upload both, run **`publishRichMenus`** once, then confirm **from a phone**: a chat that has never linked shows
**A**; a linked one shows **B**. 🔴 **Confirm on the screen, not from the command's output** — that is the
standing deploy rule and this is precisely the case it was written for.

---

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

## 15. ✍️ Wording pass — the messages still describe a world with no menu (Porter, UX writer, 2026-09-05)

**Why now:** the menus went live on 2026-09-05 and were confirmed on a phone. Every message below was written
when **typing a keyword was the only way in**. They are not wrong; they are **out of date the moment a button
exists**, and they are the first two things a parent reads.

🔴 **What this pass MUST NOT do, and the reason it is stated first:** the owner ruled on 2026-09-03 that **typing
must keep working** — *"มันต้องกลับมาพิมพ์ได้เพราะลูกค้าอาจจะใช้คอม ไม่มี rich menu"* (§14). **No wording here
removes a keyword or implies one stopped working.** The menu becomes the *first* path, never the *only* one.

### What is deployed today, verbatim from the owner's screenshots

| When | Current text |
|---|---|
| **Welcome** (unlinked) | *"สวัสดีค่ะ ยินดีต้อนรับสู่ Smart Scheduler / พิมพ์ สมัคร เพื่อผูกบัญชี LINE / หลังผูกแล้ว (ผู้ปกครอง): เพิ่มนักเรียน · เช็คอิน · ลา · qr"* |
| **After linking** | *"เรียบร้อยค่ะ ✅ / คำสั่งที่ใช้ได้: · เพิ่มนักเรียน … · นักเรียน … · เช็คอิน … · ลา … · qr — รับลิงก์เช็คอิน · เมนู — แสดงคำสั่งนี้อีกครั้ง / หรือพิมพ์คำถามเข้ามาได้เลยค่ะ เดี๋ยวแอดมินมาตอบนะคะ 🙏"* |

**Three things wrong with them now, and only now:**
1. The welcome says **"พิมพ์ สมัคร"** while a button labelled **`เข้าใช้ระบบ`** sits directly under it.
2. The linked message is **a six-line keyword list that duplicates a six-cell menu**, read on a phone where the
   menu is already visible. The buttons are the answer; the list competes with them.
3. It advertises **`qr`**, which **has no cell on either menu** — the one command a parent cannot discover.

### Proposed replacements

**Welcome (unlinked chat):**
> สวัสดีค่ะ ยินดีต้อนรับสู่ Smart Scheduler 🙏
> กดปุ่ม **เข้าใช้ระบบ** ด้านล่างเพื่อเริ่มใช้งานได้เลยค่ะ
> (หรือพิมพ์ `สมัคร` ก็ได้เหมือนกันค่ะ)

**After linking:**
> เรียบร้อยค่ะ ✅ ผูกบัญชีเรียบร้อยแล้ว
> ใช้ปุ่มเมนูด้านล่างได้เลยค่ะ — แจ้งลา · เช็คอิน · คอร์สของฉัน · เพิ่มนักเรียน
> พิมพ์ `qr` เพื่อรับลิงก์เช็คอิน · พิมพ์ `เมนู` เพื่อดูคำสั่งทั้งหมด
> หรือพิมพ์คำถามเข้ามาได้เลยค่ะ เดี๋ยวแอดมินมาตอบนะคะ 🙏

**`เมนู` (the full keyword list) is unchanged** — it stays the complete reference for anyone on a PC, and §14's
`เปิดเมนู` un-mute wording is untouched.

### ⚠️ Two things this pass CANNOT settle, and I am not guessing either

1. **`นักเรียน` (keyword: *ดูรายชื่อลูกของคุณ*) and `คอร์สของฉัน` (menu cell) are different words.** Are they the
   same destination, or two? **If two, the menu has no way to reach `นักเรียน` at all.** ⇒ **@Sober: a read.**
2. **`qr` has no cell.** Either it is genuinely typing-only — which contradicts the menu being the primary path —
   or it needs one, and there is **no seventh cell available** (six is the ceiling). ⇒ **The owner's call**, and
   it is not urgent: his **REQ-015** (walk-in QR check-in) is still ToDo, so `qr` may be re-scoped by that work.

🔴 **Cost of this pass, stated so nobody is surprised:** **`AC-19`, `AC-22` and `AC-24` were PASSED by @Tanya on
this exact copy.** Changing it means those three are **re-checked, not assumed** — a cheap re-read of one screen,
and far cheaper than shipping copy that points at a button that is not there.

### 🔻 §15 CORRECTED — the shop ALREADY has a greeting. Ours must not compete with it. (owner, 2026-09-05)

Owner: *"ลูกค้ามีข้อความทักทายอยู่แล้วนะ"*, with a screenshot of the real OA. **He is right and §15's welcome
replacement is withdrawn.**

**What the shop's own greeting already does on follow:** a branded welcome, the full **program list** (Snow Trip,
School Break Camp, Bike Riding, Balance Play, Scooter, Inline Skate, Balance Cruiser, Surfskate, Skateboard,
FreeSkate, E-Skate Onewheel with age tiers), the **branch and address**, the **100%-prepayment rule** in Thai and
English, the **phone number and hours**, *"On Booking only — NO WALK IN"*, **and a full price-table image.**

⇒ **A parent's first screen is already full, and it is the shop's, not ours.** Adding *"ยินดีต้อนรับสู่ Smart
Scheduler"* underneath makes **two welcomes from one follow**, the second one branded to a system the parent has
never heard of. 🔴 **The bot is the shop's tool; it must not introduce itself as a product.**

**Revised proposal — the follow event says LESS, not more:**
- **Preferred: our bot sends NOTHING on follow.** Menu A is already on screen, its first cell says
  **`เข้าใช้ระบบ`**, and that is a clearer instruction than any sentence. The shop's greeting keeps the floor.
- **If a line is wanted anyway, one line, no branding, after theirs:**
  > กดปุ่ม **เข้าใช้ระบบ** ด้านล่างเพื่อเริ่มใช้งานได้เลยค่ะ (หรือพิมพ์ `สมัคร`)

**§15's after-linking message is UNAFFECTED** — that one fires deep inside a flow the parent chose, and it does
not compete with anything. It stands as written.

⚠️ **A question this raises that nobody has asked, and it belongs to the owner:** the shop's greeting is set in
**LINE OA Manager**, ours is a **follow-event push from our code**. **Two independent senders, neither aware of
the other.** When REQ-014 moves them to a new OA, **the greeting must be re-created there** — it does not travel
with the account switch, and losing the shop's own onboarding would be a visible regression the day of the move.

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
