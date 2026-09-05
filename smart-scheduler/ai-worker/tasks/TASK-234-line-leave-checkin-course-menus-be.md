# TASK-234: BE — Flows 4–6 on the existing pickers, and the two menu sets

- Source: SPEC-071 · REQ-079 §5 Flows 4–6 · **AC-13 · AC-14 · AC-15**
- Status: ✅ DONE — code (Sober 2026-09-02) · 🔴 menus NOT live until published with images (board PENDING DEPLOY). Was: REVIEW — next-session-teacher fix done · ⚠️ menus still need IMAGES + a publish run

## 🔴 This is the reuse task. Almost nothing here should be new code.

- **แจ้งลา** — REQ-046 / `line-leave.ts` · **เช็คอิน** — REQ-050 · **คอร์สของฉัน** — REQ-016.
  All three already exist and are deployed. **Wire them to the new menu; do not rebuild them**, and say in your
  notes what you reused versus what you had to add.
- 🚫 **Never infer the child, never infer the session** (AC-14) — REQ-050's rule, and the child step is **skipped
  only when there is exactly one**. The confirmation names **child · date · time**, so a wrong tap is caught by
  the person who made it.
- **คอร์สของฉัน** shows the customer's own template: `คอร์ส · ครู · เหลือ n/N · สิทธิ์ลาเหลือ · วันหมดอายุ`.

## The two menu sets

`linkRichMenuToUser` / `setDefaultRichMenu` (`line-rich-menu.ts:110,119`) — **REQ-042's path, in production and
owner-verified.** Zero new mechanism.

📌 **Cheapest shape, from SPEC-071 §Overview:** make **ยังไม่รู้จัก the DEFAULT menu** and **รู้จักแล้ว the
per-user link.** A brand-new follower then gets the right menu with **no code running at all**, and "unknown" is
the state you fall back to rather than one you must remember to set.

| ยังไม่รู้จัก | รู้จักแล้ว |
|---|---|
| `เข้าใช้ระบบ` · `คุยกับแอดมิน` | `แจ้งลา` · `เช็คอิน` · `คอร์สของฉัน` · `เพิ่มนักเรียน` · `คุยกับแอดมิน` |

🔴 **`คุยกับแอดมิน` is in both, always, and no flow may remove it.** It is the promise that a person is
reachable — the only thing that makes a bot acceptable to a parent. **A lockout or a handover must never be a
dead end.**
⚠️ **`เข้าใช้ระบบ` on the unknown menu now leads to "ask an admin"**, not to a code prompt — Flow 2 is deleted (§15).

**AC-19:** every choice accepts a typed `1` / `2` as well as a tap — **already true** (`line-webhook.service.ts:4`,
postbacks and keywords share handlers). Assert it rather than build it; LINE on PC cannot tap anything.

## Definition of Done — the OUTCOME
- [ ] **AC-13:** leave — child step **skipped with one child**, shown with two; session chosen; confirmation names
      child · date · time; the teacher is told.
- [ ] **AC-14:** with two children, or one child with two sessions that day, the bot **asks** — never picks.
- [ ] **AC-15:** the course view shows all five fields.
- [ ] Both menus exist; a bound chat gets the known menu, an unbound one the default.
- [ ] **AC-19** asserted for at least one choice in each flow.
- [ ] **AC-21:** the existing leave/check-in/course paths are unchanged for teachers and for anyone not in a
      bound chat — by diff.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` → 0 · `bun test` green. 🚫 Nothing sent to a real recipient.

## Implementation Notes (Jason, 2026-09-02)
| | |
|---|---|
| Repo | `H:\scheduler\smart-scheduler-back` — the `machine.local.md` row |
| `git rev-parse HEAD` | `2aa68a0` |

🔴 **No migration** — `drizzle/*.sql` = 32 = journal tags, unchanged.

### 🔁 REUSED vs ADDED — the thing you asked me to name

**Reused, untouched:**
| | |
|---|---|
| **แจ้งลา** | `doLeave` / `doLeaveBooking` / `needsChildStep` (REQ-046) — **not re-implemented.** A test asserts `async function doLeave(` appears **exactly once** in the service. |
| **เช็คอิน** | `doCheckin` / `doCheckinBooking` (REQ-050) — same, asserted the same way. |
| **เพิ่มนักเรียน** | TASK-233's wizard, via the existing `action=register`. |
| **The menu mechanism** | `createRichMenu` · `uploadRichMenuImage` · `setDefaultRichMenu` · `linkRichMenuToUser` · `getMenuIds` / `storeMenuIds` (REQ-042). **Zero new machinery.** |
| **Mute** | `muteUntilFrom` — the same helper the two-strikes handover uses. |
| **Admin notify** | `notifyAdmins`. |

**Added — four things, and only the first is real logic:**
1. **`lib/line-course-view.ts`** (pure) + `doMyCourses` — คอร์สของฉัน. **Nothing customer-facing showed a course
   before**; REQ-016's view is the *teacher's* schedule, which answers a different question.
2. **Two menu definitions** + `menuHasAdminButton` + `linkKnownRichMenu` — data and one link call.
3. **Two postback actions** — `admin` (Flow 7) and `enter`.
4. **Copy** — 5 i18n keys.

### 🔴 `คุยกับแอดมิน` is handled BEFORE every role check
Both menus carry it, and the handler runs it **before `detectLinkedRole`** — asserted by index comparison.
Gating it behind a role would have made **the one button that must never fail available only to people who do
not need it.** Someone who cannot get in is exactly who needs a person. Pressing it notifies the admins and
mutes the chat with the **same** helper the handover uses, so "how long the bot stays out" has one definition.

📌 **There is deliberately no `unlink`.** ยังไม่รู้จัก is the DEFAULT menu, so a chat that was never bound — or
whose per-user link is ever removed — lands on the right menu **with no code running**. That is SPEC-071's
"cheapest shape", and it means *unknown* is a state you fall back to rather than one somebody must remember to
set. A test asserts no unlink exists.

### AC-15 — the five fields, and the one inversion worth guarding
`เหลือ` is **REMAINING** (`size − usedSessions`), not used. Showing the used count under a label reading
"remaining" is the kind of quiet inversion a family only notices when they run out early — by which point they
have planned around the wrong number. Clamped at 0, so an over-attended course (reachable after an import
correction) reads *"0 left"* and never a negative on a money-adjacent line.

🔑 **The numbers come from `toCourseSummary` — the same builder every staff screen uses** — and are not
re-derived. A second derivation of "sessions remaining" is how a parent and an admin end up quoting different
figures at each other. Asserted: the view is *handed* a summary, and `doMyCourses` contains no quota arithmetic.

⚠️ **A course has no teacher column** (TASK-140 moved the *program* onto the course and deliberately left the
teacher on the bookings, because a course can be re-teachered). So the teacher is read from the sessions, which
means the view shows whoever is actually teaching it.

### AC-19 / AC-21 — asserted, not built
Typed twins (`คอร์ส`, `แอดมิน`) call the **same handlers** as the taps — asserted by counting call sites, since
LINE on PC cannot tap a rich menu at all. The teacher branch, the suspended-household refusal and the shipped
parent/teacher menus are all asserted unchanged: **REQ-042's menus are in production and owner-verified, so this
task adds data beside them rather than editing them** — a REQ-079 rollback cannot disturb what teachers use.

### Verified
```
bunx --package typescript@5.6.3 tsc --noEmit   → exit 0
bun test                                        → 1212 pass / 0 fail (+26)
drizzle/*.sql = 32 = journal tags (no migration)
```
🚫 Nothing sent to a real recipient; nothing run against any database.

### 🚦 Deploy note — the menus need IMAGES before they exist
`publishRichMenus` uploads an image per menu, and I have none for the two new ones. **Until someone publishes
them, `getMenuIds()` returns no `unknownTH`/`knownTH`, `linkKnownRichMenu` is a no-op, and every chat keeps the
menu it has today** — which is the correct degradation, but it does mean **the menus are not live on `sid`
merely because this task is DONE.** Two 2500-wide images (843-high unknown, 1686-high known) + one
`publishRichMenus` run, and that is an owner/@Porter step, not mine.

## Questions
- 🔴 **The two menus do not exist on any box until someone publishes them WITH IMAGES, and "TASK-234 DONE" will
  read as though they do.** `publishRichMenus` uploads a 2500-wide image per menu; I have none for
  ยังไม่รู้จัก / รู้จักแล้ว, and I cannot make them. Until they are published, `getMenuIds()` returns no
  `unknownTH`/`knownTH`, `linkKnownRichMenu` is a **no-op**, and every chat keeps the menu it has today.

  That degradation is correct — I would not have it fail — **but it is silent**, which is exactly the shape of
  thing this project keeps getting caught by. ⇒ **@Porter needs two images (843-high unknown, 1686-high known)
  and one `publishRichMenus` run**, and until then AC's "both menus exist" is **not** met on `sid`. Please carry
  it as a deploy step rather than letting the task's green tick stand in for it.

- ⚠️ **`เข้าใช้ระบบ` says "type your registered phone; if you have never registered, contact an admin".** That
  is my wording, from §15's rule that Flow 2 is deleted and the button now points at a person. **The task did
  not give me the copy**, and this is the first sentence a stranger ever reads from us. If the owner wants
  different words, it is one i18n key — but I would rather you saw the sentence than discovered it on a phone.

- **A course's teacher comes from its SESSIONS, because a course has no teacher column** (TASK-140 put the
  program on the course and left the teacher on the bookings, deliberately — a course can be re-teachered). I
  take the first session that has one. **For a course whose sessions are split between two teachers, the view
  names only one.** Correct for every course I can see in the schema's intent, but worth confirming: if a split
  course is a real thing here, the line should say so rather than pick.

- **`doMyCourses` lists only ACTIVE courses.** An ended, expired, cancelled or dropped course is not something a
  family is still owed, and listing one invites *"why does it say I have sessions left?"*. But it also means a
  parent whose course just expired sees **nothing at all**, with no explanation. AC-15 does not mention it. **If
  the owner would rather they saw "หมดอายุแล้ว" than an empty list, that is a filter change and one more copy
  key** — flagging rather than deciding.

- 🟠 **TASK-243** (the admin unbind, from my own TASK-232 finding) and 🟢 **TASK-240** are the two rows left with
  my name on them. 243 is the one I would do next: **REQ-079 now tells people "contact an admin" from two menus
  and three messages, and the admin still has no button.**


---

## The SA fix — the teacher is the NEXT upcoming session's (Jason, 2026-09-02)

tsc **0** · `bun test` **1219 pass / 0 fail** (+7) · no migration.

New pure `nextSessionTeacher(sessions, today)` in `line-course-view.ts`, called with `bangkokNow().date`. The
service no longer takes whichever booking came back first — asserted, both that it calls the rule and that
`bookings?.find(` is gone.

**Your reasoning, carried into the code so it survives:** TASK-140 left the teacher on the bookings *because a
course is re-teacherable*, so a split course is the **normal result of a re-teacher**, not an oddity — and a
parent is asking *"who is teaching my child"*, present tense.

**Three edges I had to decide, all pinned:**
- **A session TODAY counts as upcoming.** It has not happened yet, and a parent checking in the morning should
  see who they are about to meet.
- **A finished course still names who taught it** — falls back to the most RECENT past session. Otherwise the
  day the last session is attended, the line would silently become `-`.
- 🚫 **A `CANCELLED` session is not evidence of who teaches.** Skipped in both directions; otherwise a cancelled
  hand-over session could name a teacher who never taught one.

Pure with `today` injected, matching `toCourseSummary`'s shape — so it never picks up the server's timezone.

## Review
(Sober fills this in at REVIEW.)

## Review — Sober, 2026-09-02: ✅ **PASS.** 🏁 **The last build row of REQ-079** — and your deploy flag is the reason "DONE" will not lie.

**Reproduced:** `tsc --noEmit` → **0** · `bun test` → **1212 pass / 0 fail**, matching your count exactly ·
`drizzle/*.sql` = 32 = journal tags, no migration · `doMyCourses` at `line-webhook.service.ts:665`,
`linkKnownRichMenu` at `:950`.
⚠️ *I ran the full suite this time, having said I would not — it completed without reaching a database on this
machine. The standing `eligible.route.test.ts` risk is unchanged for a whitelisted one; noting the reversal
rather than leaving it silent.*

### The reuse is asserted, not asserted-in-prose

📌 *"`async function doLeave(` appears **exactly once**"* is the right shape for a reuse claim — it survives the
next person who "just adds a small variant for the parent flow", which is how one rule becomes two. Same for
`doCheckin`. **Four flows wired, one real new module** (`line-course-view.ts`), and you named the split.

### 🔴 The two calls that are better than what I specified

**1. `คุยกับแอดมิน` runs BEFORE `detectLinkedRole`, asserted by index comparison.**
> *"Gating it behind a role would have made the one button that must never fail available only to people who do
> not need it."*
**Someone who cannot get in is exactly who needs a person.** I wrote *"in both menus, no flow may remove it"* and
you found the ordering consequence I had not: a role check in front of it is a removal for the people it exists
for. And it reuses `muteUntilFrom`, so *"how long the bot stays out"* still has one definition.

**2. No `unlink`, deliberately, with a test asserting none exists.** ยังไม่รู้จัก is the **default** menu, so a
chat that was never bound — or whose link is ever removed — lands correctly **with no code running.** That is
SPEC-071’s "cheapest shape" applied without being told to, and it means *unknown* is a state you **fall back to**
rather than one somebody must remember to set.

### AC-15 — the inversion you guarded is the one that would have been believed

`เหลือ` is **REMAINING**, clamped at 0, **from `toCourseSummary` — the same builder every staff screen uses.**
Showing used-under-a-remaining-label is a number a family only discovers is wrong **when they run out early**,
having planned around it. And a second derivation of "sessions remaining" is how a parent and an admin end up
quoting different figures at each other. Asserting that `doMyCourses` contains **no quota arithmetic** is what
keeps that true.

### Your three questions

> **1. 🔴 The menus do not exist until published WITH IMAGES, and "TASK-234 DONE" will read as though they do.**
> ✅ **Exactly right to flag, and it is now a board deploy line, not a task tick.** The degradation is correct
> (no ids ⇒ `linkKnownRichMenu` is a no-op ⇒ every chat keeps today’s menu) **but it is silent**, which is the
> board’s own PENDING-DEPLOY lesson: *a green task standing in for a step nobody ran* has bitten this project
> three times. ⇒ **@Porter: two images (2500×843 unknown, 2500×1686 known) + one `publishRichMenus` run.**
> **Until then AC "both menus exist" is NOT met on `sid`**, and I have written that on the board row itself so
> the tick cannot be read alone.

> **2. `เข้าใช้ระบบ`’s wording is yours, and it is the first sentence a stranger reads from us.** ✅ Right to
> surface it rather than let it be discovered on a phone. **→ @Porter, who is the UX writer** — it is one i18n
> key. Your sentence is honest and complete; that is a higher bar than most copy clears, so it ships unless he
> improves it.

> **3. A course whose sessions are split between two teachers names only one.** 🔴 **Change it: name the teacher
> of the NEXT upcoming session**, falling back to the most recent when none is upcoming.
> **Reason:** TASK-140 made a course re-teacherable on purpose, so a split course is the *normal* result of a
> re-teacher — old sessions with A, future ones with B. **A parent reading คอร์สของฉัน is asking "who is
> teaching my child", present tense.** Taking the first session answers a question nobody asked and is wrong in
> exactly the case the split exists to represent. Small change, and the test is a course with two teachers.

**Status → DONE (code), with the next-session teacher fix.** 🏁 **REQ-079’s BE is complete: 230 · 231 · 232 ·
233 · 234.** Remaining in the REQ: 🟠 **TASK-243** (the admin unbind, from your own TASK-232 finding) and the
deploy steps above. 🟢 TASK-240 still yours.

## Review #2 — Sober, 2026-09-02: ✅ **PASS. TASK-234 is DONE.** 🏁 REQ-079’s BE build is complete.

**Reproduced:** `tsc --noEmit` → **0** · `bun test` → **1219 pass / 0 fail** · `nextSessionTeacher` at
`line-course-view.ts:71`, called at `line-webhook.service.ts:686` with `bangkokNow().date` ·
`bookings?.find(` → **0 occurrences**. Asserting the removal as well as the addition is what makes "no longer
takes whichever came back first" a fact rather than a claim.

### The three edges are the review — and all three are right

- **A session TODAY counts as upcoming.** It has not happened yet, and a parent checking in the morning is
  asking about the person they are about to meet. The off-by-one here would have been invisible and wrong every
  single morning.
- **A finished course still names who taught it.** Without the past-session fallback, the line would silently
  become `-` **the moment the last session is attended** — a course going blank exactly when a parent is most
  likely to look at it.
- 🚫 **A `CANCELLED` session is not evidence of who teaches**, skipped in both directions. A cancelled hand-over
  session could otherwise name a teacher who **never taught one** — which is the specific way this feature would
  have lied rather than merely been unhelpful.

📌 **`today` injected, matching `toCourseSummary`’s shape**, so the rule never picks up the server’s timezone.
That is the same instinct as reading the price at posting time: a value that depends on *when the code runs*
rather than *what the data says* is a bug that only appears at the wrong hour.

📌 And the reasoning is now **in the code** rather than only in my review — TASK-140 left the teacher on the
bookings *because a course is re-teacherable*, so a split course is the **normal** result of one. The next
person changing this meets the argument, not the conclusion.

**Status → DONE.** ⚠️ The menu-image deploy step is unchanged and on the board’s PENDING DEPLOY block.
