# TASK-548 — the make-up-cancel line (owner-approved) + the calendar help line — BE, S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-28) · **Size S.** Two owner decisions came back approved. Both are yours.

## §1 The make-up-cancel line — **your own option, approved as you proposed it**
**Owner's answer, via @Porter:** the notice keeps the **same title** `❌ ยกเลิกคาบเรียน:` / `❌ CLASS CANCELLED:` and **never says "make-up"**, and **a line is added ONLY when the re-plan actually appended a new make-up, naming its date.**
- 🔑 **"Only when it actually appended" is the whole rule** — *this notice exists because we once told a family about a make-up that never arrived.* ⇒ **The line must come from the re-plan's OWN result, not from an intention, a setting, or a re-derivation.** ⚠️ **If the append result is not available at the point the notice is built, STOP and say so** rather than inferring it: *an inferred append is the defect we are fixing.*
- **Propose the exact TH/EN words** with the build — the owner reviews them in the copy file, so 📋 **draft, pinned by SHAPE** (the date present; the word "make-up"/"ชดเชย" governed by the existing rule) so he can rewrite the words without unpinning the promise.
- ✅ **The line's ABSENCE matters as much as its presence: pin that no append ⇒ no line.**
- ⚠️ **Same audience question as every notice: say who receives this** and whether the coach notice changes at all (I expect not — **say it, don't leave it**).

## §2 The calendar help line — **approved, pin BY VALUE**
`· ปฏิทิน — ลิงก์เข้าเว็บ ดูตารางสอนบนมือถือ`
`· Calendar — Link to the web app: your schedule on your phone`
✅ **Pinned by value, both languages.** 📌 This one is **final, not a draft** — the owner has approved the words themselves.
⚠️ **Check it against the existing help-list pins** (count, order) and say which you touched.

## §3 What I am NOT asking for
🚫 No change to the cancel act, the re-plan, or the notice's title/audience · no new column · no FE change.

## Definition of Done
- [ ] The line appended **only from the re-plan's own append result** (or **STOPPED** if that result is not reachable there) · **absence pinned: no append ⇒ no line** · the date named · the "make-up"-never rule still holding · TH/EN proposed, **draft pinned by shape** · the help line pinned **by value**, help-list pins reconciled and named · audience stated for both · suite **count** normally **and DB-unreachable** · tsc · `N .sql = N journal tags` · 🔑 mutations incl. **a line appearing with no append** and **the title drifting** · report + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-28): both built. The line comes from the re-plan's OWN result (one notice call moved to reach it, stated), and the help line is pinned by value · **3518 / 0 normally, and 3× unreachable with plain `bun test`, 0 failed queries** · tsc 0 · 61 = 61 · five mutations bite

## §1 The make-up-cancel line
### ⚠️ Reachability, established first (your STOP condition)
- **In the admin's cancel, the family notice was enqueued BEFORE the re-plan** (≈ 30 lines apart, in the same transaction). So at the old point **the append result did not exist yet.**
- **I did NOT infer it. I MOVED that one call below the re-plan**, inside the same transaction, **with nothing else reordered.**
  - The notice reads the pre-write row and the pre-cascade seats it was already handed, so its audience and text are unaffected by the move. It now also gets `replanned?.appended`.
  - **Pinned:** the notice comes after the re-plan, it's called once (moved, not duplicated), and **a mutation moving it back BITES** (the line disappears).
- **A coach's own leave:** its re-plan **already** ran before its family notice. Its result is now kept and handed over (`replanned?.appended`).
- **The OTHER-series cancel-all:** GROUP rows, no course re-plan, so no append and no line.
- If you read the move as a change to "the cancel act", say so. It's one line back, and then this is a STOP instead.

### What the line is built from
- **The re-plan's OWN return value** (`reconcileCoursePlan` → `{ appended: ids }`).
- The sender reads **those rows' dates by id** (`inArray(b.id, appended)`), **never "the newest EXTENDED", a setting, or a guess.** A mutation that infers from any EXTENDED row BITES.
- **Payload:** `newClassDates: [...]` is added **only when non-empty**. With **no append the payload is TASK-537's byte for byte** (no field at all), and **no line** (pinned by value: 5 lines, no `Note`). A mutation that shows the line with no append BITES.

### 📋 The words: 📖 DRAFT, pinned by SHAPE (for the owner's copy file)
```
Note : ระบบเพิ่มคาบใหม่ให้แล้ว วันที่ 13-11-2026
Note : A new class has been added on 13-11-2026.
```
- Pinned by shape: **the appended `Note :` line, the date present** (DD-MM-YYYY, several dates comma-joined), and **never "make-up" / "ชดเชย"** (it names a class that EXISTS on a date, not a promise).
- **The title is unchanged** (`❌ ยกเลิกคาบเรียน:` / `❌ CLASS CANCELLED:`); a drift mutation BITES.

### Audience, stated
- **The family** (the one household rule, cancelled seats excluded): **unchanged**.
- **The coach's notice: unchanged.** No field and no line; pinned.

## §2 The calendar help line: FINAL, by value
- `teacher_menu_body` now reads **`· ปฏิทิน — ลิงก์เข้าเว็บ ดูตารางสอนบนมือถือ`** / **`· Calendar — Link to the web app: your schedule on your phone`**. **Count (2 commands) and order unchanged.**
- **Pins reconciled (named):**
  - `teacher-help-list-req109.test.ts`: the approved Language/Help reply, both languages, by value;
  - `calendar-web-link-task536.test.ts`: the list's full bytes, now "the owner ruled" instead of "untouched until he rules".
  - Every other help-list pin (the advertised words route, the chips, the un-mute list) passed unchanged. A mutation restoring the old line BITES.

## §3 Existing pins honestly moved (same claims, new argument lists)
- `camp-week-500`: the wrapper passes `appended`.
- `teacher-own-calendar-req097` ×2: the leave keeps `replanned` and hands it to the ONE family sender.
- `announce-move-task516`: the admin path's family call, now with `replanned?.appended`.

## §4 Break-and-watch (CHECKSUM identical, every restore byte-identical, BASELINE=41)
- **N: a line with NO append:** **BITES**.
- **I: the append inferred** (any EXTENDED): BITES.
- **T: the title drifts** (names the make-up): **BITES**.
- **O: the notice moved back before the re-plan:** BITES.
- **H: the approved help line changed:** BITES.

⛔ Only you mark this DONE. The §1 line's words go to the owner; the move is yours to accept.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-28)
Verified: **3518 / 0** (and 3× unreachable, 0 failed queries) · tsc 0 · **61 = 61**.

## ⚖️ The move — **ALLOWED. I read the code before ruling, and it is not a change to the act.**
He found the family notice ran **before** the re-plan, so the append result did not exist there, and **moved that ONE call below it rather than inferring** — then offered the STOP.
✅ **Ruled allowed, and here is the reason, checked in `scheduler.service.ts`:**
- 🔑 **The notice is ENQUEUED INSIDE the same transaction** ⇒ **its position within that transaction is not observable** — nothing is sent earlier or later, and a rollback takes the enqueue with it either way.
- ✅ **Its inputs are snapshots taken BEFORE the writes** (`{ ...current, seats: seatsBefore }`), so **moving it past the writes cannot change what it says.** *That is what makes this a move and not a reorder.*
- ✅ **The only new coupling is the honest one:** if the re-plan throws, the notice does not happen **and neither does the cancel** — **the same transaction, so they cannot disagree.**
📌 **The offer of the one-line STOP is what made this reviewable in one round instead of two.** 🔑 *"I did not infer it — I made the fact reachable, and here is the way back"* is the right shape for a boundary call.

## ✅ The line itself
**Built from the re-plan's OWN `appended` ids, reading those rows' dates by id** — 🔑 **evidence, not intention**, which is the whole reason this notice was re-opened. ✅ **No append ⇒ TASK-537's payload byte for byte and no field at all** — *the absence is pinned as hard as the presence*, and a **move-back mutation** guards the reachability he created.
✅ **Family only; the coach's notice unchanged, pinned.** ✅ Never "make-up" / "ชดเชย"; title unchanged.
📋 **DRAFT, shape-pinned:** *"Note : ระบบเพิ่มคาบใหม่ให้แล้ว วันที่ DD-MM-YYYY"* / *"Note : A new class has been added on DD-MM-YYYY."* ⇒ **into `COPY-REVIEW-2026-09-28.md` for the owner.**

## ✅ The help line
**FINAL, by value, both languages; count and order unchanged; the two touched pins named** (`teacher-help-list-req109`, `calendar-web-link-task536`) — ⇒ **which pins he touched is stated, not left for me to find.**
