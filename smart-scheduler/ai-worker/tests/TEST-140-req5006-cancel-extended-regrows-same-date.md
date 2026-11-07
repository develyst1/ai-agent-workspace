# TEST-140: REQ-5006, cancelling an EXTENDED class grows a new one on the same date, and the expiry doesn't move
**Status:** ✅ AC-1 reproduced on sid · ✅ AC-3 counted on uat, read-only. Findings only: no verdict on a fix, no cause stated; that's Sober's (AC-2).
**Source:** Porter's brief in `inbox/QA.md` · `requirements/REQ-5006-*.md`.
**Instrument:** the API inside a headless session + the plan screen on sid, `som` card, no password. Uat: `uat` card, every non-GET aborted (only `POST /cdn-cgi/rum` was tried), ids and counts only, nothing saved. **Build:** what's deployed on each; no version is shown.

## AC-1: reproduced on sid
Each course: 4 sessions, Mondays from 19 Oct, 19 Oct + 2 Nov attended, 26 Oct on leave (make-up grows on 16 Nov), 9 Nov pending. Expiry 11-16.

| Cancelled class | Box | New class lands on | Expiry |
|---|---|---|---|
| **EXTENDED** make-up, 16 Nov | Unticked | **16 Nov, same date and time** | 11-16 → **11-16** |
| The new one, 16 Nov again | Unticked | **16 Nov again** | 11-16 → **11-16** |
| **EXTENDED** make-up, 16 Nov | **Ticked** | **16 Nov, same date and time** | 11-16 → **11-16, no week added** |
| The new one, 16 Nov again | **Ticked** | **16 Nov again** | 11-16 → **11-16, no week added** |
| Ordinary class, 9 Nov (control) | Unticked | 23 Nov, a later date | 11-16 → 11-16 |
| Ordinary class, 9 Nov (control) | **Ticked** | 23 Nov, a later date | 11-16 → **11-23, one week added** |

**What it shows:** the same date comes back **only when the cancelled row is the make-up**, ticked or not, and the row can be cancelled and re-grown repeatedly. **The ticked box adds its week on an ordinary class and doesn't on an EXTENDED one**, though the dialog offers it on both. An unticked ordinary class can land past the expiry (23 Nov against 11-16); I noted that but didn't judge it.

**Limits:**
- **The calls, not the clicks:** I sent the request the dialog sends (`PATCH /bookings/:id/status`, `cancel`, + `reasonCode: SCHOOL_ISSUE` when ticked; `PlanModal.tsx:1278`). I didn't click the dialog. The plan screen afterwards was read on sid: `CANCELLED EXTENDED` twice, then `CONFIRMED EXTENDED`, all Mon 16 Nov, as on her screenshot.
- **A make-up is a CONFIRMED row with `isMakeup`;** the screen's purple EXTENDED comes from that marker. So uat's count goes by the marker.
- **The ticked ordinary control ran on the course that had already had its make-ups cancelled twice.** The week arrived on that press. The unticked control ran on a separate course.
- **Khwan's case on the screenshot wasn't reproduced row for row.** Mine is 4 sessions with 1 leave on Mondays, and I didn't look for Aiwa's course. Which system "ระบบทดสอบ" is stays open, as the REQ says.
- **Teacher's leave, her real case:** I didn't test recording it through "Record teacher leave", or whether that's a better path. That's REQ §3.3 for Sober.

**Evidence:** `tests/evidence/test140-1-plan-after-cancel.png` (git-ignored) shows the plan screen with the 2 cancelled rows and the live one on one date.

## AC-3: count on uat, read-only, 2026-11-07
**9 cases on 8 courses** (a cancelled make-up + a live class on the same date). 1 of them was ticked. 5,544 bookings and 525 courses read.

| Course | Date | Time | Reason on the cancelled row | Course expiry |
|---|---|---|---|---|
| `0b38677e` | 2026-11-08 | 11:00 | none | 2026-11-15 |
| `01a07c19` | 2026-11-08 | 16:00 | none | 2026-11-22 |
| `3b62ec1d` | 2026-11-15 | 16:00 | none | 2026-12-06 |
| `12f0e5cd` | 2026-11-21 | 10:00 | **SCHOOL_ISSUE (ticked)** | 2026-11-28 |
| `249b23b3` | 2026-11-21 | 11:00 | none | 2026-12-19 |
| `172086d2` | 2026-11-21 | 11:00 | none | 2026-12-01 |
| `eeb6f049` | 2026-11-22 | 12:00 | none | 2026-12-20 |
| `1f2ce56c` | 2026-12-12 | 11:00 | none | 2027-01-09 |
| `eeb6f049` | 2026-12-20 | 12:00 | none | 2026-12-20 |

- **All 9 are ACTIVE courses, with the live class at the same time as the cancelled one, and dated today or later.**
- **Related, not counted above:** `d6f37b3a` on 2026-11-07, a cancelled make-up + an attended or no-show class on the same date (course COMPLETED). 4 more dates have an **unmarked** cancelled class + a live one on the same date (`0f3af3f7` 11-08 · `f60eca3a` 11-14, 11-21, 11-28); I don't know that they're the same thing.
- **For scale:** uat has 136 cancelled make-ups in all (525 courses). I didn't look into the other ones, so this doesn't say how often a cancel grows on the same date.

## Test data created
**Sid, note "QA TEST-140":** QA children `44b98eb2`, `7bdf9134`, `a4856a31` (no parent), QA coach `2ade954f` (not on LINE). Courses `45fae9c9`, `4a9c5e94`, `70cba2d4`, all cancelled (ADMIN_ERROR), 0 live rows. Their sales and attended classes may remain on sid's books; I didn't read those rows.
**Uat:** nothing written.

## Round 2, 2026-11-07: the right path, Sober's `inferred`, the names. Findings only
**1. Where does an admin pick «ครูลา» when cancelling? Nowhere: there's no such path on the screen.**
- **The class's only cancel:** Bookings / Students → Manage plan → the class's ⋯ → Edit · Mark absence · **Cancel**. The dialog "Cancel this session" has 1 checkbox, "A problem on our side", and no list of reasons. Read on sid and, opened and never submitted, on uat: the same words.
- **The class's window on the Schedule page has no cancel for a course class** (the code keeps it to the plan, `BookingModal.tsx:484`).
- **The code agrees:** `TEACHER_LEAVE` is "never offered in a dialog" (front `types/app/scheduler/index.ts:502`).
- **So Sober's self-serve line, "cancel the class with the reason «ครูลา»", can't be done on her screen;** that reason reaches the server only by a direct API call.

**2. Run on sid, an EXTENDED class on 16 Nov, expiry 11-16:**
| What she does | Class | New class lands on | Expiry |
|---|---|---|---|
| API only, reason `TEACHER_LEAVE` (Sober's `inferred`) | Cancelled | 23 Nov | **11-16, no week.** ✅ His point is confirmed |
| **"Record teacher leave"** alone (Schedule page, real screen) | **Not cancelled.** The screen says "NOTHING HAS BEEN CANCELLED", "yours to handle one by one" | none | **11-16, no week** |
| Record teacher leave, then Cancel, **ticked** (real dialog) | Cancelled | **23 Nov** | **11-23, one week added** |
| Record teacher leave, then Cancel, unticked (real dialog) | Cancelled | **23 Nov** | 11-16, no week |
| **Already in the bad state** (cancelled + live on 16 Nov): record the leave, then Cancel the live one, ticked | Cancelled | **23 Nov** | **11-23, one week added** |

**So the path that gives what she expected is both steps: Record teacher leave first, then Cancel with the box ticked.** Sober's Q3 says the leave door "does both"; on the admin's door it does neither by itself. His `:3850` is the coach's own door, which I didn't run (my QA coaches aren't on LINE).
**The same two steps also repaired a row already in the bad state,** on sid. The 2 cancelled rows stay visible on the plan.

**What that path costs, from the screen:** the leave blocks the coach's **whole day** for new bookings, and the other classes that day stay as they are, listed for her to handle. The admin's door takes **only a date after today**; today or earlier is refused. Whether a family or a linked coach gets a notice on these steps, I didn't check: my children have no parent and my coach isn't on LINE.

**3. The names for the 9 rows, for the owner only:** `smart-scheduler/ai-worker/tests/evidence/REQ-5006-uat-9-rows-names-OWNER-ONLY.md`, git-ignored, sorted by date, the 2 on 11-08 first. Child, program, coach, course id. Read-only; all 9 named. I didn't print them here or in my own output, and I haven't read the file's names. Please pass the file, not its contents, to him.

**🔴 2 of the 9 are dated tomorrow, 11-08:** `0b38677e` 11:00 and `01a07c19` 16:00. If the repair is wanted on those, the admin's leave door stops accepting that date when 11-08 begins. I've made no call on whether their coaches are really off, or whether to repair.

**Instrument:** the real screens on sid: Record teacher leave (once by clicks, then the same request when I rebuilt the cases) and the Cancel dialog (clicks, all 3 cases). The TEACHER_LEAVE row is by API, because no screen offers it. Uat: non-GET aborted (only `POST /cdn-cgi/rum` was tried), the dialog opened and never submitted. **Evidence (git-ignored):** `test140-3-record-leave-result.png` · `test140-5-cancel-dialog.png`.

**Test data, sid, note "QA TEST-140":** courses `678e1bdf`, `018ae9cb`, `d398c968`, `b6ad54cf`, `f94948cd`, `89a56db5`, `14669bb3`, all cancelled, on QA children with no parent. Coach `7829e67f`'s leave on 11-16, recorded twice and lifted twice; 0 left after the first lift, and the second answered 200. Their sales and attended classes may remain on sid's books; I didn't read those rows. **Uat:** nothing written.

**A slip in my own run:** one script's cleanup ran after its dialog steps had failed on my selector, so I rebuilt those cases. No wrong result came of it.

## Customer gate, 2026-11-07: the draft to ขวัญ: 🔧 FAIL, 3 lines
**Draft checked:** `COPY-DRAFT-khwan-teacher-leave-cancel-extended-2026-11-07.md`, md5 `f359854d62d07b4d0cea9e5700844bff` from "ขวัญครับ" to the end of the file (`c7c37e879fca3c579bb6085e8adc9410` without the last newline).

**🔧 FAIL, 3 lines to fix:**
1. **Step 2 stops before the button that does it, and there's a trap.** The dialog's 2 buttons are **"Cancel"**, which only closes it, and **"Cancel session"**. It also doesn't say where Manage plan is.
   - **Replace with:** *"2. ยกเลิกคลาสทีละคลาส ที่หน้า Bookings / Students กด Manage plan ของคอร์สนั้น กด ⋯ ที่คลาสนั้น เลือก Cancel ติ๊ก A problem on our side แล้วกดปุ่ม Cancel session (ปุ่ม Cancel เฉยๆ คือปิดหน้าต่าง ไม่ได้ยกเลิกคลาส)"*
2. **"9 รายการ" is out of date: uat now has 10.** New since my count: `f306134f`, 12-26 11:00, unticked. **So it's still happening today.**
   - **Replace with:** *"ตอนที่ตรวจวันที่ 7 พ.ย. ในระบบจริงมีคลาสที่อยู่ในสภาพนี้ 10 รายการ"*
   - **The owner's file is refreshed with all 10; please resend it.** Same path: `tests/evidence/REQ-5006-uat-9-rows-names-OWNER-ONLY.md` (the name still says 9).
3. **She isn't told that step 2 reaches families.** Step 1 tells nobody, but when the new class lands on a different date, step 2 sends the family a cancel notice (`scheduler.service.ts:4730`, `if (!slot.family)`). The app's own words say the same: "การยกเลิกคาบจะมีการแจ้งผู้ปกครองทุกครอบครัว". **From the code and that text, not seen:** my children have no parent. It matters most on 11-08, a class tomorrow, with real families.
   - **Add after step 2:** *"ขั้นตอนนี้ระบบจะแจ้งผู้ปกครองของคลาสนั้นว่าคลาสถูกยกเลิกครับ"*

**Holds:**
- **The cause (paragraph 1):** as Sober's answer, and as I reproduced it.
- **Step 1:** the button is "Record teacher leave" on Schedule; after-today only; it cancels nothing; it blocks the coach's whole day. All seen on sid.
- **"คลาสชดเชยจะไปลงสัปดาห์ถัดไป และคอร์สจะเพิ่มให้ 1 สัปดาห์":** seen with the box ticked, through the real dialog. "สัปดาห์ถัดไป" was free each time; the code takes the next free week, so "สัปดาห์ถัดไปที่ว่าง" is more exact. Optional.
- **The row already regrown, with the cancelled rows still showing:** seen.
- **"ภายในวันที่ 7 พ.ย." for the 2 on 8 Nov:** right, as the door takes only a date after today. If this goes out late in the day, it leaves little time.
- **The rules:** formal, ครับ, "ขวัญ" without พี่, self-serve first, no internal words.

**New evidence, because her course was a Group programme and my runs weren't:** a 6-session Balance Play (Group) course on sid, by the same request as the dialog: the symptom reproduces (11-30 regrows on 11-30, expiry unmoved), and the 2 steps work (lands 12-07, expiry 12-07 → 12-14). That course's rows are ordinary course rows, not seats under a group class; **a real group seat isn't run.** None of the 10 uat rows is on a Group programme.

**Not run:** the 2 steps with a family or a linked coach; on uat, because it's read-only.

**Test data, sid:** course `c2d125c4` (QA child `271d78f2`, no parent), cancelled; coach `7829e67f`'s leave on 11-30 lifted. **Uat:** nothing written; non-GET aborted.

## Customer gate, re-check, 2026-11-07: draft v2: ✅ PASS
**Draft checked:** v2, md5 `fab7968a4525b2147b9c3dbc52a87843` from "ขวัญครับ" to the end of the file (`6f53ca2e314df44623a7039056eddc63` without the last newline).
- **My 3 fixes are in, word for word.** The rest is unchanged from v1 and holds, as in my v1 check.
- **"สัปดาห์ถัดไปที่ว่าง":** matches the code, and each run landed on the next free week.
- **"10 รายการ":** as read this morning, and dated in the text. Uat is live, so it may move again.

**This PASS rests on, as already reported:**
- **The family notice line:** the code and the app's own wording, not seen. My children have no parent.
- **The 2 steps:** run on sid only. A real seat under a group class isn't run; none of the 10 rows is on a Group programme.

**Optional, one word, don't hold it for this:** "ขั้นตอนนี้" now stands in its own paragraph after the list; "ขั้นตอนที่ 2" would be plainer. A change means a new md5, and I'd turn that round at once.
