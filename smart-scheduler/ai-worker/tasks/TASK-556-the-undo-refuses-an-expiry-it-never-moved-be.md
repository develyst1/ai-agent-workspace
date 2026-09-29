# TASK-556 — the Undo refuses an expiry it never moved — BE, S/M

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-29) · From Tanya's post-deploy re-test on sid (`qa-2026-09-29/FC-item6-forecast.png`), via @Porter.

## §0 ⚖️ My answer to @Porter's question, and why it is neither (a) nor (b)
**Observed:** the item-6 leave now refuses with `UNDO_EXPIRY_UNRECOVERABLE` — *"currently 10/11, set at course open, no move record"*.
**I read `lib/booking-undo.ts` before answering.** `expiryDecision` reaches its refusal only when **the make-up sits EXACTLY ON the expiry** and **no other live row is on or after it**; with `latest === null` the reason is literally *"กำหนดตั้งแต่เปิดคอร์ส (ไม่มีบันทึกการเลื่อน)"*.
- ⇒ 🔑 **Yesterday it previewed "clean" ONLY because the make-up was UNLINKED** — `makeupDecision` saw nothing, so the expiry branch never ran. **The clean preview was the bug, not the baseline.**
- ⇒ 🔑 **The owner's repair did not create this. It made a PRE-EXISTING refusal REACHABLE** — and **TASK-552 (B) makes it reachable for real courses from now on**, because links now get written.
- ⇒ **So: not (a) — a real customer CAN hit it. Not (b) — the new code is not wrong; it removed the thing that was hiding this.**
✅ **It fails SAFE:** it refuses and tells the admin to fix it by hand. 🚫 **Nothing is corrupted, nothing is silently wrong** ⇒ **Khwan can proceed on sid; this is fixed before uat.**

## §1 🔑 The question, and I want you to FALSIFY my reading rather than implement it
**My reading: `latest === null` is not "unknown", it is EVIDENCE — the expiry has NEVER been moved, so this make-up did not stretch it, so there is nothing to restore ⇒ the answer should be `keep`, not a refusal.**
**The refusal exists to stop a SILENTLY WRONG expiry** (the comment says so: *"a silently wrong expiry ends a course early"*) — ⚠️ **and `keep` cannot end a course early. It is the safe direction; restoring is the dangerous one.**
- 🔑 **Falsify it.** **Name a case where the expiry was set at course open, a make-up sits exactly on it, and `keep` is WRONG.** ⚠️ **If you find one, my reading is wrong and I want that answer, not a patch built on it.**
- ⚠️ **Check the other two refusal reasons with the same eye** (*the latest change is not this make-up's*; *moved by an actor*): 🔑 **is each of those genuinely unrecoverable, or is it also "we cannot restore, therefore keep"?** **Say which, one line each.** 🚫 **Do not change them if they are genuinely different — say so.**
- ⚠️ **The refusal must remain for any case where restoring is possible but not exactly computable.** 🚫 **This is not a licence to replace refusals with "keep".**

## §2 Reachability, in numbers or in cases
**Derive how a real course reaches this: the re-planned make-up must land exactly on the expiry, so the reconcile never stretched it, so no move record exists.**
⚠️ **Say plainly whether that is common, rare, or effectively only this fixture** — 🔑 **and note that TASK-552 (B) CHANGES the answer**, because before it the link was often missing and the branch never ran.

## §3 The rows, if you need them — **read-only DATA REQUEST through @Porter**
🚫 **No agent runs SQL.** **Write the read-only statements in this file and I will send them up.** What would settle it: **the course `47be0cc9`'s expiry and its move records (expect zero)** and **`0494ab85`'s date (expect 10/11)**.
⚠️ **State what each answer would prove** — 🔑 **a query whose outcome changes nothing is not worth the owner's time.**

## §4 Not in scope
🚫 TASK-553 · 🚫 the same-slot rules · 🚫 anything else in the Undo.

## Definition of Done
- [ ] My reading **falsified or confirmed, with the case that decides it** · the other two refusal reasons each ruled *unrecoverable* or *also keep*, one line each · 🚫 refusals kept wherever restoring is possible but not exact · §2 reachability stated **in cases or numbers, noting TASK-552 (B)'s effect** · §3 read-only statements written, **each with what it would prove**, run by nobody · the fixture's end-to-end outcome pinned · suite **count** normally **and DB-unreachable** · tsc · `N .sql = N journal tags` · 🔑 mutations incl. **a refusal turned into a silent restore** and **`keep` swallowing a real unrecoverable case** · report + `inbox/SA.md` + log.

---

# ⏸️ ANSWER, and a STOP — @Jason (2026-09-29): your reading is RIGHT for the common case, but NOT PROVABLE from the data. There's a falsifying case (late, not early), and the refusal is far more common than one fixture. **Nothing built** (your rule: a patch on a falsified reading is what you didn't want).

## §1 Falsification: FOUND, in the lenient direction only
- **Your claim has two halves:**
  1. **"`keep` cannot end a course early"**: ✅ **TRUE, always.** `keep` leaves the expiry at the make-up's date, never earlier.
  2. **"`latest === null` is EVIDENCE the expiry was never moved"**: ❌ **FALSE in general.** It's evidence **only for writes made after the audit table existed.** Two writers move an expiry with **no record**:
     - **every stretch or edit BEFORE migration 0034** (`course_expiry_changes`, ~2026-09-06, **no backfill**);
     - **`scripts/repair-course-expiry.ts` (FIX-007)**, which writes `expiry_date` **without** `recordExpiryChange` (lines 104–108; 0 references to the table). It's owner-run and **re-runnable**.
- 🔴 **The case:**
  - a course's leave make-up M **stretched** the expiry E0 → E1 = M's date **before 0034** (or the repair script set E1);
  - the leave's date is still in the future (an advance leave), so its Undo is allowed.
  - Undo ⇒ M is on the expiry, nothing live after it, `latest === null` ⇒ **`keep` leaves E1**, but the true pre-leave expiry was **E0**.
  - ⇒ **silently LATE**: the family keeps validity they no longer earned. **Not early, so not the guard's stated danger, but still a silently wrong expiry on a paid-for boundary.**
- ⇒ **Your reading holds exactly when `null` truly means "never moved"**, and the data can't say that for pre-0034 courses or repair-script edits.

## §1b The other refusal reasons, one line each
- **"the latest change is not this make-up's"** (`latest.toDate !== expiry`): **genuinely unrecoverable.** Something UNRECORDED wrote the current expiry after the last record, so we don't know what it was before. Keep the refusal.
- **"moved by an actor"** (`actor != null`): **genuinely different: a human's decision.** Restoring overrides it, and `keep` may be late if the admin only made room for this make-up. **The intent is unknowable, so a human decides.** Keep the refusal.
- **"sessions after `from`"** (other live rows between the pre-stretch date and the make-up): **genuinely unrecoverable exactly.** `from` would cut them off, and any other value is a guess. Keep the refusal.
- 🚫 **None of the three becomes `keep`.**

## §2 Reachability: COMMON, not this fixture (and not caused by TASK-552 (B))
- **The born ceiling is plan end + the quota's weeks** (`courseBornCeiling`; *"an absence-free size-4 ends week 4 and expires week 5"*).
- A make-up is appended in the **next free week after the last session**, i.e. for the leave that uses the **last quota week**, **exactly ON the born expiry**.
  - The reconcile only stretches when `extDate > expiry`, so **no stretch and no record.**
- ⇒ **The Undo of the LAST in-quota leave of a course refuses this way**, whenever the free-slot search didn't skip a week:
  - **size 4 (quota 1): the ONLY leave**, so effectively **every size-4 course's leave**;
  - size 6 (quota 2): the **second** leave;
  - size 10 (quota 3): the **third**.
  - Earlier leaves' make-ups sit **before** the expiry, so the result is `keep`.
- **TASK-552 (B) is NOT what made this common.** The ordinary leave paths have always **linked** their make-ups, so this branch was live before. (B) only added the re-added-after-cancel path (Tanya's).
  - Why nobody hit it: **TASK-492's fixture had a SYSTEM change record** on the expiry (the "stretched" shape), and **the born-ceiling shape (no record) was never tested.**
- **For these common cases `keep` IS exactly right:** the make-up landed on the born ceiling and moved nothing.

## §3 What would make "`null` means never moved" TRUE (proposed, NOT built; your ruling)
- ⭐ **(1) `keep` when `latest === null` AND the course was CREATED after this database began recording expiry changes.** The evidence is the DB's own migration record for 0034 (its applied time), not a constant date, because sid and uat got 0034 on different days.
  - **Plus: make `repair-course-expiry.ts` write its changes through `recordExpiryChange`**, so the one unrecorded writer is closed.
  - Older courses keep the refusal (honestly: we can't know).
- **(2) `keep` whenever `latest === null`** (your reading as stated): accepts the **late** error on pre-0034 / repaired courses in exchange for simplicity. That's defensible only if the owner accepts late-over-refused.
- **(3) Leave it** (refuse): safe, but **the Undo of every size-4 leave refuses**. Probably not acceptable.

## §4 📋 Read-only statements for the owner (run by nobody here) and what each PROVES
```sql
-- Q1 · proves the course's age vs the audit table: if created AFTER Q3's time, `null` IS evidence for THIS course.
SELECT id, created_at, start_date, size, expiry_date, prior_sessions FROM course_packages WHERE id::text LIKE '47be0cc9%';
-- Q2 · proves which refusal reason fired (expect 0 rows ⇒ the `latest === null` branch).
SELECT from_date, to_date, actor, changed_at FROM course_expiry_changes WHERE course_id::text LIKE '47be0cc9%' ORDER BY changed_at;
-- Q3 · proves WHEN this database began recording expiry changes (the 35th migration = 0034).
SELECT id, created_at FROM drizzle.__drizzle_migrations ORDER BY id OFFSET 34 LIMIT 1;
-- Q4 · proves the make-up sits ON the expiry (expect 2026-10-11 = Q1's expiry_date).
SELECT id, date, status, extended_from_id FROM bookings WHERE id::text LIKE '0494ab85%';
-- Q5 · SIZES the problem: live make-ups sitting on an expiry that has NO record = leaves whose Undo refuses this way today.
SELECT count(*) FROM bookings b JOIN course_packages c ON c.id = b.course_id
WHERE b.status IN ('EXTENDED','CONFIRMED') AND b.extended_from_id IS NOT NULL AND b.date = c.expiry_date
  AND NOT EXISTS (SELECT 1 FROM course_expiry_changes x WHERE x.course_id = c.id);
```
- **Q5 is the one that changes a decision:** a large number argues for (1) now.
- **Q1 + Q3 decide Tanya's course** under (1).
- Q2 / Q4 confirm the branch (cheap; they could be skipped if you trust Tanya's screenshot).

⛔ **Your ruling:** (1) [rec.], (2) or (3). Nothing is built; the Undo behaves exactly as on sid today (it refuses, safely).

---

# ⚖️ SA RULING (2026-09-29) — **(1). And he falsified me correctly.**

## ✅ The falsification stands, and it is the useful kind
**I claimed `latest === null` means "never moved". He showed that is only true for writes made after migration 0034** — **two writers move an expiry unrecorded: every stretch/edit BEFORE 0034 (no backfill), and `repair-course-expiry.ts` (FIX-007), which writes without `recordExpiryChange` and can be re-run.**
⇒ **The case that kills my version: a pre-0034 stretch E0 → E1 = the make-up's date, and an advance leave undone ⇒ `keep` leaves E1, silently LATE — unearned validity.**
🔑 **So my half held and my premise did not: "`keep` cannot end a course early" is always true, but "nothing was moved" was an ASSUMPTION about the data, not a fact about it.** 📌 **That is the same mistake as TASK-552: I ruled on a rule without ruling on the state of the data it reads. Twice this week.**

## 🔴 And the reachability changes the shape of the decision
**The born ceiling = plan end + quota weeks ⇒ the make-up of a course's LAST in-quota leave lands EXACTLY on the born expiry, with no stretch and no record.**
⇒ **It refuses for EVERY size-4 course's leave**, the 2nd of a size-6, the 3rd of a size-10. 🔑 **This is not an edge case; it is the normal case, and it was invisible because TASK-492's fixture happened to have a system change record.** ⇒ **(3) is out: we are not shipping a product where the commonest leave cannot be undone.**

## ⚖️ Ruled: **(1)** — 🚫 not (2), 🚫 not (3)
✅ **(1) makes the premise TRUE instead of assuming it.** **"Created after THIS DB applied 0034", read from the DB's own migration record and not a constant, is right** — *sid, uat and production applied it on different days, and a constant would be a lie on two of them.*
✅ **And fixing the repair script to record its writes is the same principle as TASK-553: every writer records what it did.** 🔑 **We have now hit "a writer that does not record" twice in three days. It is a class, not a coincidence.**
🚫 **(2) is out:** *a silently LATE expiry is unearned validity — a money and entitlement error that nobody sees.* **We have spent two weeks removing exactly this shape.**

## ⚠️ The condition that decides whether (1) is as strong as it looks
🔑 **(1)'s premise is "a post-0034 course has no unrecorded expiry write" — and the REPAIR SCRIPT can have broken that already, on a post-0034 course, before you fix it.**
⇒ **Derive whether `repair-course-expiry.ts` has ever run on this data, and whether it left ANY trace** (a log, a marker, an updated-at, anything).
- ✅ **If it has never run, (1) is sound as written — say so.**
- ⚠️ **If it has run and left a trace, exclude those courses and say how.**
- 🔴 **If it has run and left NO trace, (1) is weaker than it looks — STOP and tell me**, *because then a post-0034 course can still carry an unrecorded move and we would be back to a silent late expiry.*
✅ **Pin that a pre-0034 course still REFUSES** — and 🔑 **that refusal should say WHY in terms an admin can act on**, not merely that it cannot be computed.

## §3 The queries
✅ **Q1–Q5 written, each with what it proves, and run by nobody — correct.** ⭐ **Q5 (live make-ups on an unrecorded expiry) sizes the problem and I want it in front of the owner**, plus **whatever settles the repair-script question above.**

---

# ⛔ STOP on (1), before any code — @Jason (2026-09-29). **The fact that (1) rests on is NOT in the data. That's my error, and the same class you recorded.** Nothing built.

## 🔴 What (1) needs, and why the database can't give it
- **(1) needs to know when THIS database began recording expiry changes.** I proposed reading that from "the DB's own migration record for 0034". **That record doesn't hold the applied time.**
  - Drizzle's migrator writes `created_at = migration.folderMillis`, i.e. **the journal's `when`, identical on every box.** It never writes the time it ran (`node_modules/drizzle-orm/pg-core/dialect.js` line 67).
  - For 0034, that value is the synthetic `1783000000030` (2026-07-02), weeks **before** the table existed.
- ⇒ **My Q3 was wrong. On sid and on uat it would return the same 2026-07-02, which is exactly the "constant that lies" you ruled out.** Postgres doesn't record a table's creation time either.
- 📌 **Same mistake as the one you recorded:** I proposed a rule without checking that the data it reads exists. Recorded here, not hidden.

## ✅ The repair-script question: it RAN, it left a TRACE, and it can't cause the late case anyway
- **It ran with `--commit` on BOTH boxes on 2026-08-28** (`log/2026-08-28.md`, *"FIX-007 DELIVERED on both boxes"*: uat 37 native courses fixed, 37 earlier, 0 later; sid under the old scope, imports included).
- **Traces:**
  - the workspace log;
  - the report files `course-expiry-repair-{preview,after}.txt`, both dated 2026-08-28 (only the counts line was read; the files hold names). A later `--commit` from this machine would have overwritten "after" with a later date.
  - **No run after that is recorded anywhere** (every log from 2026-09-* checked). **Both runs precede 0034 (code from 2026-09-06) on both boxes.** (There are exactly two boxes, per SYSTEM-FACTS.)
- 🔑 **More important: its writes can't produce the late case at all.**
  - It sets `courseExpiry(start, size)`, a value **independent of any make-up.** The late case needs an unrecorded writer that moved the expiry **onto the make-up's date because of it**, and **only a stretch does that.**
  - Cases:
    - a make-up placed after a repair on that date ⇒ `keep` is exactly the pre-leave value;
    - a repair after a no-stretch make-up (M ≤ E0) can land on M only by moving EARLIER, and then `keep` is again the pre-leave value.
- ⇒ **The late case = a stretch (or admin edit / resume) made before recording existed. Only those need the cutoff.**
- **Every writer of `course_packages.expiry_date` in `src` now records** (checked each update site):
  - the reconcile stretch (~2966), the admin edit (~4960), resume (~5114) and the Undo restore (`undo.service.ts` ~172);
  - creation sets it with no record (correct: nothing moved);
  - **the repair script is the only unrecorded one.**

## ⚠️ A separate hazard found while reading it (not TASK-556's scope; your ruling)
- 🔴 **A re-run of `course:repair-expiry` TODAY would move native expiries EARLIER, without a record.**
  - It resets every native course to `courseExpiry(start, size)`, which ignores the born ceiling (`courseBornCeiling` ≥ that value whenever the plan runs long or absences exist at birth) **and every recorded stretch, admin move and resume.**
  - Its header still calls it *"idempotent: a second run finds nothing to change"*. **That was true only under the rule of 2026-08-28.**
  - ⇒ **It's the "silently ends a course early" shape, one owner command away.**
  - "Make it record" doesn't make it safe. **Recommend retiring it** (delete, or refuse to `--commit`), rather than teaching it to record. Your call.

## ⚖️ What CAN prove "recording was live when this course was born" (proposed; nothing built)
- ⭐ **(1a) Cutoff = this box's EARLIEST `course_expiry_changes.changed_at`.**
  - It proves more than a migration time would: **the recording CODE was live** (a deployed table with old code would still write nothing).
  - A course created after it has every later move recorded ⇒ `latest === null` really means "never moved" ⇒ `keep`.
  - Courses born between the deploy and the first record keep refusing. **That errs safe.**
  - **Weakness:** a box with no records yet has no cutoff, so everything refuses. **Both real boxes should have records (Q6 confirms).** No migration needed; the lookup is one `min()` read in `planUndo`.
- **(1b) A marker migration:** a one-row table set on apply to `COALESCE((SELECT min(changed_at) FROM course_expiry_changes), now())`.
  - Same cutoff on sid and uat; on a fresh box `now()` precedes every course, so there's no dead start.
  - Costs a migration (62 = 62) and is still only as good as (1a) on the existing boxes.
- **Either way, a pre-cutoff course keeps refusing**, with the reason reworded for an admin, e.g. *"course opened before expiry changes were recorded (records start <date>), so its original expiry can't be verified. Check the date on the course page and correct it there if needed"* (DRAFT wording, the owner's to approve).

## 📋 Queries for the owner (read-only, run by nobody here). **Q3 above is WITHDRAWN (it proves nothing).**
```sql
-- Q6 · the cutoff (1a) would use, per box: proves records exist here and when recording provably began.
SELECT min(changed_at) AS recording_since, count(*) FROM course_expiry_changes;
-- Q7 · Tanya's course under (1a): created after Q6's time ⇒ keep (the Undo proceeds); before ⇒ it still refuses (reworded).
SELECT id, created_at FROM course_packages WHERE id::text LIKE '47be0cc9%';
```
- **Q5 (sizing) still stands**, and it's what goes to the owner first.
- **Q6 decides whether (1a) is live on both boxes.**
- Q1, Q2 and Q4 are optional confirmations.

⛔ **Your ruling:** (1a) [rec.] or (1b) for the cutoff, and **retire or guard** the repair script. Then I build (1).

---

# ⚖️ SA RULING #2 (2026-09-29) — **(1b), and RETIRE the script. My cutoff was the wrong fact to read.**

## 🔴 My error, and he caught it before writing code
**I ruled: "read '0034 applied' from the DB's own migration record, never a constant."** 🔴 **Drizzle writes `created_at = the journal's `when`* — **the synthetic series value, identical on every box.** ⇒ **My instruction would have produced the SAME answer on sid, uat and production while LOOKING per-box.**
🔑 **I corrected a constant into a lie that reads like evidence.** 📌 **That is this week's class again, from the other end: I told him to trust a recorded value without checking WHAT was recorded.** ✅ **He withdrew his own Q3 rather than let it pass.**

## ✅ The condition I set is ANSWERED — and the answer is good
**The repair script ran with `--commit` on both boxes on 2026-08-28, WITH traces (its log and dated report files); no later run is recorded; both runs precede 0034.**
✅ **And it cannot cause the late case at all:** 🔑 **it writes `courseExpiry(start, size)` — a value independent of any make-up** — so *only a pre-recording stretch, edit or resume can produce the silently-late shape.* ⇒ **(1)'s premise is not broken by the script.**

## ⚖️ Ruled: **(1b)** — the marker, not the derived minimum
🔑 **Because this week's whole lesson is that a derived null is not evidence.** **(1a)'s cutoff comes from `min(changed_at)`, and an EMPTY table is ambiguous — "no changes yet" and "no recording yet" look identical** ⇒ *on a fresh box every course would refuse, which is the (3) we already rejected.*
✅ **(1b) WRITES THE FACT DOWN ONCE**, `COALESCE(earliest recorded change, now())` — **the same move we have demanded of every writer this week, applied to ourselves.** ✅ **And it is stable: a derived minimum moves if an old row is ever archived; a recorded marker does not.**
⚠️ **Both directions of the cutoff must be pinned:** **after it ⇒ `keep`**, **before it ⇒ REFUSE**, and 🔑 **the refusal reworded for an admin — what they should DO, not that a computation failed.** 📋 **Draft, pinned by shape, to the owner with the next copy batch.**

## ⚖️ The script: **RETIRE it. 🚫 Do not teach it to record.**
🔴 **A re-run today resets native expiries to `courseExpiry(start, size)` — EARLIER than the born ceiling — and discards every recorded stretch and admin move, without a record.**
🔑 **That is not a script with a missing feature; it is a loaded gun with a stale label** — *its header still says "idempotent", so the next person to find it will trust it.* ⇒ **Retire it.**
✅ **Leave a refusing stub that says why and points here**, rather than deleting it outright — 📌 *a script that vanishes gets rewritten from memory by whoever needed it; one that refuses and explains does not.*
⚠️ **If anything still DEPENDS on it, STOP and say so** — that would be a different task.

## §3 The queries
⭐ **Q5 (how many live courses are in this state), Q6 (`min(changed_at)` + count, per box) and Q7 (`47be0cc9`'s `created_at`) go to the owner.** ✅ Each with what it proves; run by nobody.

---

# ✅ REPORT (1b) — @Jason (2026-09-29): the marker is written once; a course born after it ⇒ `keep`; before ⇒ refused, telling the admin what to DO · the repair script RETIRED to a refusing stub · **3551 / 0 normally, and 3× unreachable, 0 failed queries** · tsc 0 · **62 = 62** · seven mutations bite

## §1 What's built
- **Migration `0061_expiry_recording_marker`** (hand-written, journal idx 61, when …057, witnessed by the table, rerunnable):
  - **one row** (`id = 1` by CHECK): `recording_since` = `COALESCE((SELECT min(changed_at) FROM course_expiry_changes), now())`;
  - `ON CONFLICT DO NOTHING`, so **a re-run never moves it**;
  - on sid / uat it's **their own first record** (the recording code was provably live then); **on a fresh box it's `now()`**, before its first course, so there's no refuse-everything start. Never read from the ledger (whose `created_at` is the journal constant).
- **`expiryDecision`** takes `courseCreatedAt` + `recordingSince` (both required, so no caller can forget them):
  - **no change record + course created strictly AFTER the marker ⇒ `keep`** (the born-ceiling case);
  - **no record + created before, at the same instant, or no marker row ⇒ REFUSED**, reworded.
  - 🚫 **The three other reasons are untouched.** "Born after" is checked **only inside the no-record branch**, so it can't soften them.
- **`planUndo`** reads the marker next to the latest record. Preview and act share it (one function), so they can't disagree.

## §2 📋 The refusal, for an admin (DRAFT, pinned by SHAPE; goes to the owner with the next copy batch)
> *ย้อนกลับการลานี้อัตโนมัติไม่ได้: คอร์สนี้เปิดก่อนระบบเริ่มบันทึกการเลื่อนวันหมดอายุ (เริ่มบันทึก <Bangkok date>) จึงบอกไม่ได้ว่าวันหมดอายุ <expiry> ถูกเลื่อนเพราะคาบขยาย <make-up date> หรือไม่ — กรุณาเปิดหน้าคอร์ส ตรวจวันหมดอายุกับประวัติการลา แล้วแก้การลาและวันหมดอายุด้วยตนเอง*
- Pinned by shape:
  - what happened;
  - since when, in **Bangkok** (a UTC mutation bites);
  - both dates;
  - where to look (หน้าคอร์ส) and **what to do** (แก้การลาและวันหมดอายุด้วยตนเอง);
  - **not** the old "cannot be computed".
- **No marker ⇒ "ยังไม่เริ่ม".**

## §3 Pinned end to end (the real `undoBooking` + `previewUndo`): Tanya's shape
- The fixture: **a size-4 course's only leave; its make-up ON the born expiry, 10-30; no change record.**
- **Born AFTER the marker:**
  - the preview is ok, and the act **proceeds**: b1 CONFIRMED, m1 CANCELLED;
  - **the expiry stays 10-30, with no change record written**;
  - the preview wrote nothing.
- **Born BEFORE:**
  - **the act REFUSES and writes nothing** (b1 still SICK_LEAVE, m1 still EXTENDED);
  - **the preview refuses with the same code and the same words.**
- **Both directions are pinned by value in the pure decision too:** after ⇒ keep; before / same instant / no marker ⇒ refused. With "born after", **actor / not-this-make-up / rows-after still refuse, and the system's stretch still RESTORES.**

## §4 🚫 The repair script: RETIRED
- `scripts/repair-course-expiry.ts` is now **a refusing stub**:
  - no DB import, no update;
  - it prints why in Thai (a re-run would set expiries EARLIER and discard recorded moves, unrecorded) and where to go instead (the course's expiry edit, which records);
  - `exit(1)`. Pinned.
- **`package.json` `course:repair-expiry` still points at it**, so the old command meets the explanation.
- **Nothing else depended on it** (checked: its only importer relationship ran from it to `lib/expiry-repair-plan.ts`).
- ⚠️ **`lib/expiry-repair-plan.ts` + its test are now used by nothing but that test.** Pure and harmless, and I left them because deleting them wasn't in the ruling. **Retire them too? Your call.**

## §5 Checks
- Suite: **3551 / 0** (3544 + 7). **DB-unreachable 3×: 3551 / 0, 0 "Failed query".** tsc 0. **62 .sql = 62 journal tags.**
- The **61 existing count pins bumped 61 → 62** with `· 🔻 TASK-556: +0061`, TASK-540's convention. **That's the only change to them.**
- **Break-and-watch** (BASELINE 63, CHECKSUM identical, every restore byte-identical):
  - **R1, a refusal turned into a silent KEEP** (pre-recording course kept): **BITES** (4).
  - **R2, `keep` swallowing a real unrecoverable case** ("born after" checked before every reason): **BITES**.
  - **R3, a refusal turned into a silent RESTORE** (the other reasons stop throwing): **BITES** (3).
  - **R4, the same instant counted as after:** BITES.
  - **R5, the service ignores the marker:** BITES (2).
  - **R6, a re-run moves the marker:** BITES.
  - **R7, the date in UTC:** BITES.

## §6 For the owner (read-only, run by nobody here)
- **Q5** (sizes the problem), **Q6** (per box: the value 0061 will write, `min(changed_at)`, and the count) and **Q7** (47be0cc9's `created_at` ⇒ whether Tanya's course proceeds after deploy) are above, unchanged.
- **Deploy note: 0061 is owner-run, sid first.**

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-29)
Verified by me: **3551 / 0** (and 3× unreachable, 0 failed queries) · tsc 0 · **62 .sql = 62 journal tags** (counted myself).

## ✅ The marker is the right shape, down to the details
**One row, `recording_since = COALESCE(min(changed_at), now())`, `ON CONFLICT DO NOTHING` ⇒ 🔑 a re-run never moves it** — *the fact is recorded once and then stops being re-derived, which is the whole point of (1b).* ✅ **A fresh box gets `now()` and therefore does not refuse everything**, which is exactly why (1b) beat (1a).
✅ **"Born strictly AFTER ⇒ `keep`; before, the same instant, or no marker ⇒ refuse."** 🔑 **Ties refuse.** *Every boundary in this feature errs toward the refusal, and that is the correct direction: a refusal costs an admin a minute, a wrong expiry costs a customer weeks.*
✅ **"Born after" lives ONLY in the no-record branch, the other three reasons untouched** — **the narrow change I ruled for, not a general softening of refusals.** ✅ **And three of the seven mutations are the ones that matter: a refusal silently turned into a keep, into a restore, and `keep` swallowing a real unrecoverable case.**

## ✅ End to end, on Tanya's actual shape
**Size-4, make-up on the born expiry, no record: born after ⇒ the act proceeds, the expiry untouched, nothing recorded, and THE PREVIEW AGREES · born before ⇒ it refuses, writes nothing, and the preview gives the SAME WORDS.**
🔑 **The preview agreeing in both directions is what makes this finished** — *TASK-546's promise held through a change that altered when the act refuses.*

## ✅ The script, retired properly
**A refusing stub: no DB, `exit 1`, says why and where to go. Nothing depended on it.**

## ⚖️ The orphans — **retire them too, with one condition**
**`lib/expiry-repair-plan.ts` and its test: yes, retire.** 🔑 **A library is not an entry point** — *nobody re-creates a module from memory the way they re-create a script they once needed, so the stub argument does not carry over, and dead code invites resurrection.*
⚠️ **The condition: if that module is the ONLY written record of how the repair was meant to reason**, **lift that reasoning into the stub's comment or into `SYSTEM-FACTS.md` BEFORE deleting it.** 🔑 **Delete the code, keep the knowledge** — *we have spent this week learning what happens when a fact exists only where nobody looks.* ✅ **If it holds nothing but mechanics, say so and delete it plainly.**

## ⚠️ For the deploy
**Migrations are now 62.** 🔴 **`0061` is owner-run, sid first** — carried into `DEPLOY-sid-2026-09-29.md`.

---

# ✅ Orphans retired — @Jason (2026-09-29), per your ruling
- **Deleted:** `src/lib/expiry-repair-plan.ts` and `src/lib/expiry-repair-plan.test.ts` (15 tests). **Nothing else referenced them** (checked).
- 🔑 **The knowledge was NOT only mechanics, so it was lifted first**, into the stub's comment (`scripts/repair-course-expiry.ts`, "HOW THE REPAIR REASONED"). The four rules any future bulk expiry correction must answer:
  1. **Imports excluded entirely** (TASK-200: a typed expiry may encode an agreement), and the skip count printed;
  2. **a live session past the corrected expiry was FLAGGED, never moved** (FIX-007 AC-4);
  3. **"newly expired" = the status flips**, read by the owner before any commit (dry run by default);
  4. **counts on the console, names only in the gitignored report** (PII).
- The stub still refuses, and its pin still holds.
- **The suite drops by those 15 tests** (the count is in TASK-558's report).
