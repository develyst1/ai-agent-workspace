# TASK-513 — four more coach notices reach only the primary, and two of them are a class STOPPING and STARTING — BE, S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-27) · **Size S.** From your own derived inventory in TASK-512. **This is not a new question — it is TASK-510's rule on four more senders.**

## §0 The four
🔴 **`pauseBooking` (`booking_paused`) — a class STOPS.** 🔴 **`resumeBooking` (`booking_resumed`) — it STARTS AGAIN.** Both tell the primary coach only ⇒ **on a co-taught class the second coach is not told the class is off, and then is not told it is back on.**
Plus **`confirmCourse` (`course_confirmed`)** and **`notifyRentalAddedSameDay` (`rental_added_teacher`)**, the same shape.
📌 **The first two are the exact failure TASK-510 existed to fix**, found two tasks later because the first list was written from the notices a task happened to name. **Your derived inventory is what turned them up** — and it now says this list **may only shrink.**

## §1 Build
- **All four through `teachersOfBooking`.** After this, the inventory's **"still primary-only" list should be empty** — 🔑 **and say so explicitly in your report, because an empty known-bad list is the only version of that pin worth having.**
- **Unlinked coaches SKIPPED**, as before. **No family recipient** anywhere in these paths, pinned.
- 🚫 **Wording unchanged — only who receives it.** Same rule as TASK-510: if a message reads oddly arriving at a second coach, **report it, do not edit it.** ⚠️ **`rental_added_teacher` is the one I would look at twice** — a rental is a thing one coach prepares. **If it reads as an instruction to a single person, tell me**; that may be a named-by-design case rather than a class-event one, and **if you think it belongs in the other category, argue for it instead of converting it.**
- 🔑 **`booking_paused` / `booking_resumed` deserve one by-value pair on a co-taught fixture:** both coaches told it stopped, **both told it restarted.** The pair matters more than either alone — **a coach told a class stopped and never told it resumed is worse off than one told neither.**

## §2 What I want stated
- **The inventory's "still primary-only" list, after the change, quoted in the report.**
- **Whether any of the four had a reason to be primary-only that I have not thought of.** 🔑 If one of them does, **say so and leave it** — I would rather have three converged and one explained than four converged and one wrong.

## Definition of Done
- [ ] All four through `teachersOfBooking`, or one **argued as named-by-design** and left · the inventory's primary-only list **empty and quoted** · the pause/resume **pair** pinned by value on a co-taught fixture · unlinked coaches SKIPPED · no family recipient, pinned · wording unchanged (oddities **reported**) · suite **count** normally **and unreachable** · tsc 0 · 59 = 59 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation returning each of pause/resume to primary-only and one that tells the family · report here + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-27): three converged, one ARGUED and left · the inventory's primary-only list is EMPTY · 3313 / 0 normal AND unreachable, 0 failed queries · tsc 0 · 59 = 59

## §1 The inventory's "still primary-only" list, after the change (quoted from `coach-notice-inventory-task512.test.ts`)
```ts
// 🔻 TASK-513 — EMPTY: pause / resume / same-day rental converged; `confirmCourse` argued as named-by-design (above).
const OPEN_PRIMARY_ONLY: Record<string, string> = {};
```
**It is empty, and pinned empty** (`expect(OPEN_PRIMARY_ONLY).toEqual({})`). With the derived producer list (17), a primary-only coach notice now has nowhere to hide:
- a new one fails the equality until it's classified;
- a class-event one fails if it doesn't ask `teachersOfBooking`, looks a teacher up, reads `teacherId` for a recipient, or **names a parent recipient** (added this task).

## §2 The four
**1–2. `pauseBooking` / `resumeBooking`: CONVERGED, as a pair.**
- Every coach of the class through `teachersOfBooking`. Resume reads the coaches **after** its write, so a resume that picks a new primary tells the class as it now stands.
- ⚠️ **"Unlinked ⇒ SKIPPED" does NOT apply here, and I kept the existing rule instead:**
  - these two carry **AC-7 (SPEC-072 §5): no link ⇒ NO row at all**, because *"a SKIPPED row would read as we tried to reach someone when there was nobody to reach"*.
  - Converting that to SKIPPED would change what those paths record, which is outside "only who receives it". **It's per coach now** (`if (!coach.lineUserId) continue; // AC-7`) and pinned.
  - **If you want these two to write SKIPPED like the others, that's a ruling on AC-7, and I didn't make it.**
- The response's `notification` still describes **the primary** (it's `null` when the primary is unlinked, even if an additional coach was told). That's pinned.

**3. `notifyRentalAddedSameDay` (`rental_added_teacher`): CONVERGED, and I looked at it twice as you asked.**
- It doesn't read as an instruction to one person. It's `RENTAL ADDED / เพิ่มอุปกรณ์เช่า ‼️` + the class block + `Rental : <code>`, a fact about the session.
- 🔑 **The deciding reason is the notice's own purpose:** it exists **only** to carry the `Rental :` line that the morning reminder couldn't. **That reminder already goes to every coach of the session** (`groupReminders`: primary + additional). So its stand-in reaching only the primary was the inconsistency, not the other way round.
- Unlinked ⇒ SKIPPED as before; it returns the primary's result.

**4. `confirmCourse` (`course_confirmed`): ARGUED as named-by-design, and LEFT.**
- **A course has one coach by construction:**
  - validation **refuses `additionalTeacherIds` on every lesson type** (AC-20: only อื่นๆ takes extras);
  - a course seat on a GROUP keeps the group's extras **on the group row, not on the seat**.
  - So `teachersOfBooking` on any course row **is** the primary, and converting would change nothing today.
- **The message is a COURSE summary with ONE `Coach :` line** (`rows[0].teacher`). The code's own comment: *"one teacher for a course… the multi-teacher case is อื่นๆ, which is never a course"*.
- If a multi-coach course ever exists, **that's a message-design decision** (whose Coach line? which sessions?), not a recipient loop.
- **The ground is pinned:** a new inventory test asserts the AC-20 refusal is still in `validation.ts`, so the exemption goes when its reason does.
- 📌 **One thing beside it, named:** `confirmCourse` takes `rows[0].teacher`. A course **re-teachered before confirmation** (sessions under two coaches) would confirm to the first session's coach only. That's a different gap (re-teachering, not co-teaching), and pre-existing.

## §3 Wording: unchanged, and nothing reads oddly at a second coach
- `booking_paused` / `booking_resumed` name the child, the date and the time, never a coach, so a second coach reads exactly what the first does.
- The rental notice's `Coach :` line lists all of the class's coaches (`joinCoaches`), as TASK-512 found.

## §4 Pins and break-and-watch
- **`src/services/pause-resume-coaches-task513.test.ts`**, through the real `pauseBooking` / `resumeBooking` on a **co-taught** fixture (Ek primary, Ple additional, Mai additional and unlinked):
  - 🔑 **the PAIR:** pause ⇒ Ek and Ple told `booking_paused`; resume ⇒ **the same two** told `booking_resumed`; Mai gets no row (AC-7); no family.
  - with the primary unlinked: Ple is still told, and `notification` is `null`.
- **The inventory:** three producers move up to the class-event rule; `confirmCourse` is named-by-design with its ground pinned; the open list is empty and pinned; **no parent recipient** on any class-event path.
- **Existing source pins moved (same claims):**
  - AC-7's "the link is checked before the send" is now checked per coach;
  - resume "reads the coaches after the update" now through `teachersOfBooking`;
  - the rental's "unlinked ⇒ SKIPPED by `enqueueLine`" now per coach.
- **Mutations** (database unreachable · CHECKSUM identical before and after · restores byte-identical · BASELINE=21):
  - **P1: pause back to the primary only:** BITES (2).
  - **R1: resume back to the primary only:** BITES.
  - **F1: pause tells the family:** BITES (3, including the inventory).
  - **L1: rental back to the primary only:** BITES. ⚠️ **By SOURCE pin only**: the rental has no by-value test (`notifyRentalAddedSameDay` is private and gated on the reminder having run). Say if you want one.

## ⚠️ Named beside it (not changed)
- **A GROUP seat's own events (pausing one child's seat, for instance) reach only the seat's coach.** The group's extra coaches sit on the GROUP row, and THE predicate reads the row it's given, exactly as a coach's own calendar does.
- Whether a group's extras should hear about one seat is a product question, and the answer should come from the predicate's owner rather than a special case in a notice.

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-27)
Verified: **3313 pass / 0 fail normally AND with the database unreachable, zero failed queries** · tsc 0 · 59 = 59.

🔑 **`const OPEN_PRIMARY_ONLY = {}` — the known-bad list is empty and PINNED empty.** That is the version of that pin worth having: **it can no longer quietly grow, and nobody has to remember that it used to have four entries.**
✅ **Three converged, one argued and left — exactly the trade I asked for.** `course_confirmed` is named-by-design because **a course has ONE coach by construction** (validation refuses extras on every lesson type), and 🔑 **he pinned the AC-20 refusal as the exemption's GROUND.** That is the right way to record an exception: **the exemption now fails the day its premise stops being true**, rather than sitting as an opinion in a comment.
✅ **`rental_added_teacher` converged after looking twice**, with the reason that decides it: **it exists only to carry the Rental line the morning reminder could not, and that reminder already goes to every coach.** ⇒ converging it makes the two agree rather than inventing a new audience. **I asked him to argue rather than convert if he disagreed; he did the looking and the argument went the other way, which is the same discipline.**
✅ **AC-7 kept, not quietly changed:** pause/resume write **no row** for an unlinked coach (SPEC-072 §5 — *"we tried to reach someone" is false*), which differs from TASK-508's SKIPPED row. **He named the inconsistency and left it, because changing it is a ruling on AC-7 and not his to make.** 📌 Correct, and I am not ruling on it today either: the two behaviours have different justifications and **an inconsistency someone has written down is cheaper than a change nobody asked for.**
✅ **The pause/resume PAIR pinned by value on a co-taught class** — both told it stopped, **the same two** told it restarted. That was the point.
⚠️ **The rental mutation is a SOURCE pin only** (no by-value rental test), and he says so. Accepted: the message's own content is not what changed.

## 📌 Named beside it: a group SEAT's events reach only the seat's coach
The extras live on the group row, so a seat's own notices know one coach. **That is a product question** — *is a seat's coach the class's coach?* — and it goes on the list for the owner with the move question rather than into a task.
