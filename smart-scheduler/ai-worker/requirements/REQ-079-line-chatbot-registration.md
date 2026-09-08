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

## 13–14 — CONSOLIDATED 2026-09-07 (full text: `archive/REQ-079-2026-09-07-pre-consolidation.md`)

**Both are SHIPPED and PROVEN on a phone. Kept as rules, not as their original write-ups.**

### 13 · "The parent is never stuck" — every flow has an exit, and says so
🔴 **A flow with no exit is the defect, not a missing button.** Four patches became one fix (TASK-245) once it was
named that way. **`หรือพิมพ์ ยกเลิก เพื่อออก` appears at every step that takes free text**, `ยกเลิก` deletes the
draft **and says so**, and an advertised word (`เมนู`) typed as data is **refused, not stored**.
✅ Proven: **AC-19 · AC-20 (in LINE and in the database) · AC-22 · AC-9** — an abandoned flow leaves **no partial
student anywhere**, verified against a parent count that did not move.

### 14 · A muted chat must be re-openable BY TYPING — owner, 2026-09-03
> *"มันต้องกลับมาพิมพ์ได้ เพราะลูกค้าอาจจะใช้คอม ไม่มี rich menu"*
**`เปิดเมนู` un-mutes and prints the command list; it starts no flow.** The handover message carries the way back
in the same breath: **`(ถ้าต้องการใช้บอทอีกครั้ง พิมพ์ เปิดเมนู ค่ะ)`**.
✅ Proven: **AC-23 · AC-24 · AC-25 (strong form — muted, `เมนู` and free text both silent) · AC-26**.
🔴 **This is the most load-bearing decision in the REQ.** **When the customer had the rich menus removed on
2026-09-05, typing was the only way in — and it worked.** **Nothing may weaken it.**

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

# 17. 📨 The customer's REGISTRATION COPY — analysis CONSOLIDATED 2026-09-07
> Full analysis: `archive/REQ-079-2026-09-07-pre-consolidation.md`. **The literal strings are in §17b below —
> read those, not this.** This section is now only the rulings that came out of the analysis.

**Straight copy, taken as-is:** the `สมัคร` prompt · phone · province · the success line · **and a
review-before-save step they arrived at independently** *(ours exists because the roster has no delete for
anything with history)*.
**Ruled and closed:** language → **§18** (conversation bilingual, notifications English) · `CEO` → **a
BACKOFFICE audience, deferred to the `REQ-BO` phase**, not a chat role · date → **`วัน-เดือน-ปี`, our dash** ·
**students stay ONE AT A TIME** — the numbered lists were an example, not batch entry · the role step → **buttons
(TASK-251)**, not their typed `Next`.
📌 **The method note worth keeping:** one word in a copy document — `CEO` — **was a whole subsystem in another
phase.** They wrote copy, not scope. **Their documents are read for decisions, never transcribed.**

## §17b — 🔻 THE CUSTOMER'S COPY, VERBATIM. Transcribed 2026-09-07 because §17 never held it.

🔻 **My error, and it is the one this repo has a rule against.** I told @Sober *"their own 8-screen copy in §17 is
the source text — use their English, not a translation of ours."* **§17 holds my ANALYSIS of that copy, with
fragments quoted. It never held the strings.** He wrote a spec and a Definition-of-Done line pointing at §17
**without opening it**, and @Jason found it **by trying to use it**.
🔑 **@Jason's sentence, kept because it names the class:** *"a document that exists outside the repo doing work
inside it."* ⇒ **That is our own rule from the other end — if a fact is not in a file in this repo, it does not
exist — and I broke it while quoting it.**
**Below is the literal text the owner relayed on 2026-09-06. Not summarised, not improved.**

```
1. เริ่มลงทะเบียน / Start Registration
กรุณาพิมพ์ "สมัคร" เพื่อลงทะเบียนนักเรียนค่ะ
Please type "register" to start.

2. เลือกบทบาท / Select Your Role
กรุณาพิมพ์ "Next" เพื่อเข้าใช้งานค่ะ
Please type "Next" to continue.

3. เบอร์โทรศัพท์ / Phone Number
กรุณาพิมพ์เบอร์โทรศัพท์เพื่อดำเนินการลงทะเบียนค่ะ
Please enter your phone number to continue.

4. เพิ่มนักเรียน / Add a Student
ลงทะเบียนผู้ปกครองสำเร็จแล้วค่ะ ✅
Registration completed ✅

เบอร์โทรศัพท์ / Phone: 082-503-1502

กรุณาพิมพ์ชื่อนักเรียน เช่น "ส้ม"
Please enter the student's name, e.g. "Emily".

เพิ่มได้สูงสุด 5 คนต่อเบอร์โทรศัพท์
You can add up to 5 students per phone number.

5. วันเดือนปีเกิด / Date of Birth
กรุณาพิมพ์วันเกิดของนักเรียนค่ะ
Please enter the date of birth.

6. จังหวัด / Province
กรุณาพิมพ์จังหวัดที่อยู่ปัจจุบันค่ะ
Please enter your current province.

7. ตรวจสอบข้อมูล / Confirm Information
กรุณาตรวจสอบข้อมูลก่อนบันทึกค่ะ
Please check your information before saving.

ชื่อ / Name: น้องส้ม
วันเดือนปีเกิด / Date of Birth: 02.12.2024
จังหวัด / Province: Bangkok

ข้อมูลถูกต้องหรือไม่คะ?
Is this information correct?

กรุณาพิมพ์ "ยืนยัน" เพื่อบันทึก
Please Type "Confirm" to save.

พิมพ์ "ยกเลิก" เพื่อออกจากการลงทะเบียน
Type "Cancel" to exit.

8. เพิ่มนักเรียนสำเร็จ / Student Added Successfully
เพิ่ม "น้องดีซี" สำเร็จแล้วค่ะ ✅
"Nong DC" has been added successfully. ✅
```

### 🔴 Departures from this text that are already RULED — apply the copy, not these bits

1. **Screen 2's `Next`** — **superseded.** `TASK-251` ships **quick-reply buttons with postback payloads**, which
   is what killed their own `1/2/3` collision. **Their Thai/English framing of the step stays; the typed `Next`
   does not.** *(Their staff keywords `ครู` · `แอดมิน` stand. `CEO` is a backoffice audience — §17.)*
2. **Screen 5's date format** — **`วัน-เดือน-ปี` (`DD-MM-YYYY`)**, their day-first order with **our dash**, per
   the owner 2026-09-06. **Their `02.12.2024` dots do not ship.**
3. **The numbered lists in screens 4 and 5** were an **example of the list, not batch entry** (owner,
   2026-09-06). **One student at a time, unchanged.**
4. **Headings** (*"1. เริ่มลงทะเบียน / Start Registration"*) are **their section titles, not message text.**
   **Do not send them.**

## §19 — ✅ SWEEP OF THIS REQUIREMENT'S CLOSED RULINGS (Sober, 2026-09-07, TASK-279)

**Why:** two decisions in this file were closed and never carried — **found by @Jason, twice, while looking for
something else.** ⇒ `SA-Lead.md` now requires a closed section to name its task or say *"no work"*. **This is the
backlog for this file.** 📌 *Once is a slip; twice in one file is that there is no mechanism.*

| # | ruling | closed | state |
|---|---|---|---|
| §17 | **Language: the switch stays, not both languages** | owner 09-06 | 🔻 **SUPERSEDED by §18** the next day. No work was owed; **the reversal is the record.** |
| §17 | **`CEO` is a BACKOFFICE audience, deferred** | owner 09-06 | ✅ **no work** — struck from this REQ; belongs to the `REQ-BO` block. |
| §17 | **Date of birth `วัน-เดือน-ปี` (`DD-MM-YYYY`)** — *"prompt and parser both change"* | owner 09-06 | 🔴 **WAS THE MISS.** Unbuilt for a day; **TASK-275 then translated the overruled prompt.** ⇒ **TASK-277 (DONE)**, and its echo half ⇒ **TASK-280.** |
| §17 | **Adding students: UNCHANGED, one at a time** | owner 09-06 | ✅ **no work** — the numbered lists were an example, not batch entry. Verified: the flow is one child at a time with a review step. |
| §3c | **Phone shown formatted (`082-503-1502`)** | @Porter, *"cosmetic, cheap, do them"* | 🔴 **WAS THE SECOND MISS.** ⇒ **TASK-278 §6 (DONE)** — `formatPhoneForDisplay`, display only. |
| §3c | **Existing children listed back at the add-student step** | same | ✅ **built** — `parentChildrenNames`, `line-webhook.service.ts:1132` (@Jason verified). |
| §3c | **`ยืนยัน`/`Confirm` accepted at step 7** | same | ✅ **built** — `CONFIRM`, `line-add-student.ts:47` (@Jason verified). |
| §18 | **The conversation is BILINGUAL; notifications are not** | customer 09-07 | ⏳ **carried** — `SPEC-077` · **TASK-275 (DONE, registration)** · **TASK-276 (the remaining five flows)**. |
| §18 | **Generated notification values follow the labels: English** | @Porter 09-07 | ⏸️ **HELD, deliberately** — `SPEC-077` §5: their own template writes `ไม่มี` · `4/6 ครั้ง` is hard-coded outside `t()` · `booking_confirmed` is byte-frozen. **Three answers owed by the owner.** |
| §18 | **The `ภาษา` control may now switch nothing** | @Porter 09-07, raised not decided | ⏸️ **with @Porter** — `SPEC-077` §3 answers it concretely: after TASK-275 it governs **the button labels and the menu image**, and nothing else. **ก/ข put to the customer.** |
| §17b | **Their 8 screens, verbatim** + four departures | @Porter 09-07 | ✅ **carried — TASK-278 (DONE)**, every screen mapped; **screen 2 has no applicable string** and that is stated rather than skipped. |

🔴 **Two of eleven had no task and no "no work" line.** ✅ **Every row above now has one of the three states, in
this file, where the next reader will be.**
⚠️ **What the sweep does NOT cover:** rulings in *other* requirements. **`REQ-076` · `REQ-077` · `REQ-082` ·
`REQ-083` are next, and TASK-279 says where it stopped.** **A sweep nobody finishes is worse than one that is
honestly partial — it makes the backlog look checked.**
