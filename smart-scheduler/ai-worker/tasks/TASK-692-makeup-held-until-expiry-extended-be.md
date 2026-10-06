# TASK-692 — BE: **a make-up that cannot fit is HELD, not booked · extending the expiry BOOKS it, with no second step** — @Jason (M, ≈2–3 days)
**From @Sober to @Jason.** ⚖️ **Owner ruling 2026-10-06: "เลื่อนวัน ทำให้ตรงที่ลูกค้าขอ" — RULING 3 IS REVERSED.** **Source: `REQ-112` last block — Khwan's words, four times over two days.** 🚫 **SUPERSEDED: "created past the expiry and the admin flagged" (what `TASK-657` §3 built).**
✅ **Claim (Team A):** `src/services/scheduler.service.ts` (`reconcileCoursePlan` and its callers · `updateCourseExpiry` · `previewCourseExpiry`/`expiryDecision`) · `src/lib/course-plan.ts` · `src/lib/line-message.ts` + `src/lib/line-i18n.ts` (the notices) · co-located tests and the `657` / `656` sets you own. 🚫 No Team B file.
⚠️ **No database anywhere. No migration expected — "held" is DERIVED (the course is short), not stored. If you find you need a column, STOP and tell me.**

## 1. The model, in force
| event | what happens |
|---|---|
| a make-up the engine would place **on or before** the expiry | **booked as today** |
| 🔴 a make-up that would land **AFTER** the expiry | **NOT booked. HELD.** The course stays one session short; **"N still owed"** (the plan's existing owed count) is what shows it. **The ADMIN is told · the FAMILY is told.** |
| 🔴 an admin **extends the expiry** | **the re-plan runs on save and BOOKS every held make-up that now fits — no second step** |
| an admin moves the expiry EARLIER | nothing already booked moves (REQ-082 AC-3 still holds for that direction) |
**The three week-triggers (`TASK-656` §R) run FIRST, as built** — a trigger's week is added before the make-up is placed, so a triggered make-up normally fits.

## 2. ▶️ What to build
1. **The engine HOLDS instead of appending past the expiry.** **`reconcileCoursePlan`'s append: if the free date it finds is AFTER `course.expiryDate` ⇒ do not insert; report it as HELD.** **One place, in the engine — every door gets it for free.** 🚫 **Never a refusal of the LEAVE** (that is REQ-085 §12 — the owner complained three times): **the leave succeeds; only its make-up waits.**
2. **The notices — EXACTLY ONCE per held make-up, sent by the ACT that created the need** (a later, unrelated re-plan of the same course that finds it still held must NOT notify again). 🔑 **Pin "exactly once" by value: two unrelated re-plans after a hold ⇒ still one admin notice and one family notice.**
   - **ADMIN:** **re-aim 657's `makeup_past_expiry` to the HELD event** (same recipients/channel; beside `makeup_far_out`). 📋 **New DRAFT copy (it now says "held", not "created")** — to me.
   - **FAMILY:** 🔴 **the sentence is HER words, being asked for verbatim.** **🚫 Nobody writes one.** **Build the notice kind and its plumbing with a placeholder key marked `⛔ AWAITING CUSTOMER WORDS`, and a test that FAILS while the placeholder is the text** — so it cannot ship by accident.
3. **Extending the expiry books the held make-ups.** **`updateCourseExpiry`: after the write, in the SAME transaction, call `reconcileCoursePlan` — it appends exactly the held make-ups that now fit, and holds the rest.** 🔴 **This REVERSES REQ-082 AC-3 ("an expiry edit adds nothing") for the EXTEND direction only — correct its pin, quoting the old claim and the owner's ruling; keep it for a move earlier.** **What the booked make-up then is: today's normal make-up (`EXTENDED`); REQ-115 is a separate release — 🚫 do not pre-empt it.**
4. **The expiry editor's PREVIEW must say it BEFORE the click:** ***"this will add N make-up(s) on {dates}"*** — **computed by a DRY RUN of the same save (the plan editor's pattern: the same applier, full transaction, read back, roll back)**, never a second placement rule. 🔑 *An admin who extends a date and silently gets classes booked for a coach has been surprised by their own click.* **Field on the preview response; Fern renders it (`TASK-693`).**
5. **Re-aim what `657` built:** **"a make-up past the expiry is CREATED" tests and mutations ⇒ now "HELD, not created"**; the `N8` ordering (asked after the week decision) stays. **`N10` (the check must never stretch the expiry) stays — still forbidden.**
6. **The Undo of a leave whose make-up is HELD:** there is no make-up row to cancel; the plan becomes balanced ⇒ **it succeeds, nothing held remains, no notice.** **Pin it.**

## 3. ✅ Done means
1. **`tsc` · DB-unreachable suite with COUNTS · `66 = 66`.**
2. **Value tests, through the REAL functions:** a leave whose make-up would land past the expiry ⇒ **no row, owed +1, ONE admin + ONE family notice** · an unrelated re-plan afterwards ⇒ **no second notice** · extend the expiry by a week ⇒ **the held make-up is BOOKED in the same save, owed back to 0** · extend by too little ⇒ still held, no notice · move the expiry earlier ⇒ nothing moves · the preview names the date(s) the save will book and **agrees with the save** · Undo of the held leave ⇒ balanced, nothing held · a triggered (T1/T2/T3) make-up that fits its new week ⇒ booked, never held.
3. **Mutations, filed, list IN the file:** the append past the expiry restored (BITES) · the notice sent on every re-plan (BITES) · the expiry save without the re-plan (BITES) · the preview computed by a second rule that disagrees (BITES) · the family placeholder shipped as text (BITES).
4. **Re-run 656 / 657 / 609 / 646 / 608 from their files.**

## 4. 🚫 Not in this task
REQ-115 (born confirmed) · REQ-114 (iii) · `TASK-639` / `652` · any family sentence of our own.


## ⏸️ 2026-10-06 — @Sober: ON HOLD. Khwan's own sentence (her edited workbook, found by @Porter) REFUSES the leave when the course lacks time: "ไม่สามารถแจ้งลาได้ เนื่องจากวันหมดอายุไม่เพียงพอค่ะ กรุณาติดต่อแอดมินค่ะ". Owner ruling pending; expected re-cut: refuse at the family-leave doors (S), no held state; `TASK-693` likely dropped.


---

# 🔴 RE-CUT — 2026-10-06, @Sober → @Jason. **THIS SECTION REPLACES §1–§4 ABOVE ENTIRELY.** Size: **S (≈ 1 day).** Start after your small grants.
⚖️ **Owner ruling, recorded in `REQ-112` (last block):** **a FAMILY leave that has no room before the expiry is REFUSED — at the parent's LINE door AND the admin doors.** 🔑 *"Parent refused, admin allowed" is two rules for one act — the rule of this whole round. The admin is not stuck: they extend the expiry first, then record.* **🚫 NO held state.**

## R1. Who refuses — a CLOSED list, pinned by value
| door | refuses when the make-up would land AFTER the expiry? | with |
|---|---|---|
| **the parent's LINE leave** (door 1 via `line-webhook`) | ✅ **YES** | **her sentence, VERBATIM — TH `ไม่สามารถแจ้งลาได้ เนื่องจากวันหมดอายุไม่เพียงพอค่ะ กรุณาติดต่อแอดมินค่ะ` · EN `Leave request unavailable because there is not enough time before the course expiry date. Please contact Admin.`** (from `project-docs/req111-message-inventory/message-inventory-KHWAN-EDITS-2026-10-06.xlsx`) |
| **the admin's Record leave** (door 1) · **the plan editor's Mark absence** (door 2) | ✅ **YES — the SAME rule** | 📋 **DRAFT (in the one copy set): `อายุคอร์สไม่พอสำหรับคาบชดเชย — ขยายวันหมดอายุก่อน แล้วค่อยบันทึกลา`** (EN reading: *"Not enough course validity for a make-up — extend the expiry first, then record the leave."*) |
| **a pre-start DECLARED absence (T1)** | ✅ **only if it STILL does not fit AFTER its +1 week** | the same sentence as its door |
| **a coach's leave (T2) · a school cancel "our side" (T3) · any other cancel** | 🚫 **NEVER** | **the class is lost whatever we answer — they add their week (T2/T3) and, if the make-up STILL cannot fit, it is created and the admin told: `657` AS BUILT** |

## R2. How — inside the leave's OWN transaction, no dry run
**Run the leave as today (status, its week if T1, the re-plan). If the re-plan placed this leave's make-up AFTER `course.expiryDate` ⇒ THROW the refusal ⇒ the transaction rolls back ⇒ nothing recorded, no make-up, no count, no notice to the coach.** 🔑 **One decision point, asked AFTER the week decision** (so a T1 week that makes room is honoured — `657`'s `N8` ordering).
- **A refusal is NOT an error page:** a distinct code (e.g. `LEAVE_NO_VALIDITY`) so the parent's LINE reply prints her sentence and the admin screens show the admin wording. **The parent's reply uses her sentence ONLY on this code** — every other leave refusal keeps its own sentence.
- **Tell the ADMINS when a PARENT is refused** (her *"แจ้งแอดมิน"*): **re-aim `657`'s `makeup_past_expiry` kind for this event** (same recipients/channel, beside `makeup_far_out`). 📋 **Its text becomes a DRAFT to me** ("a parent's leave was refused — not enough validity; student · date"). **An ADMIN refused at their own door needs no notice — they are looking at the refusal.**
- **`LEAVE_NOTICE_TOO_LATE` and every existing refusal: unchanged** (REQ-085 §12.2).

## R3. 🚫 Build ONLY what is true either way — @Porter's condition
**Her answer is still owed on: *"after the admin extends, does the admin re-record the leave (or the parent ask again) — and the make-up appears then?"*** ⇒ **🚫 Do NOT make the expiry editor re-plan or book anything; 🚫 do NOT add a "pending leave" or a retry.** **Today, after an extension, recording the leave again simply works and its make-up is created at once — that is true under either answer, and it needs no code.** **Pin it by value: refused ⇒ extend ⇒ the same leave recorded ⇒ succeeds, make-up booked.**

## R4. ✅ Done means
1. **`tsc` · suite with COUNTS · `66 = 66`.**
2. **Value tests through the REAL functions:** parent leave with room ⇒ booked · parent leave without room ⇒ **refused, her sentence verbatim, NOTHING written** (no status change, no make-up, no count, no coach notice) **+ ONE admin notice** · admin Record leave / plan editor without room ⇒ **refused with the admin wording, nothing written, no admin notice** · T1 that fits after its week ⇒ booked; T1 that still does not ⇒ refused · **a coach's leave / an "our side" cancel without room ⇒ NOT refused; created + admin told (657)** · refused ⇒ extend ⇒ record again ⇒ succeeds.
3. **Mutations, list IN the file:** the refusal removed (BITES) · the refusal asked BEFORE the T1 week (BITES) · a coach's leave refused (BITES) · her sentence paraphrased (BITES) · the refusal writes the leave anyway (BITES) · the admin notice sent on an ADMIN refusal (BITES).
4. **Re-run `656` / `657` / `690` / `609` / `646` / `608` from their files.**

## ✅ 2026-10-06 (night) — @Jason: `TASK-692` §RE-CUT DONE — a family leave with no room is REFUSED; 12 / 12 bite — and one consequence for the sid gate
**`tsc` 0 · suite `4202 pass · 0 fail` · `66 = 66` (no migration).** **Set: `src/services/leave-refused-no-validity-task692.mutations.json` — 12 / 12 BITE**, baseline 86, CHECKSUM identical, test list in the file. **Re-run from files: `657` 16/16 · `656` 29/29 · `690` 9/9 · `609` 7/7 · `646` 3/3 · `608` 9/9 · `656b` 7/7 — all bite, checksums identical.**
**Built exactly as §RE-CUT:** `LEAVE_NO_VALIDITY` thrown by ONE function (`assertRoomForLeave`) asked by exactly TWO callers (door 1 Record leave — admin AND parent — and door 2 Mark absence), **AFTER the T1 week** (`R3` asks before and bites), **inside the leave's own transaction ⇒ rollback**. Coach's leave / school cancel / any cancel never refuse (`R4`/`R5` refuse them and bite) — they keep 657's notice. Boundary inclusive (`R7`).
**By value, through the real functions:** with room ⇒ booked · no room ⇒ `LEAVE_NO_VALIDITY` + the admin wording, **the whole world BYTE-IDENTICAL** (no status/make-up/count/expiry record) and **zero notices** · door 2 answers the same · **T1: fits after its week ⇒ booked; still not ⇒ refused and the week rolls back with it** · **refused ⇒ admin extends ⇒ the SAME leave again ⇒ works, make-up booked** (no held state, no retry — pinned absent).
**The PARENT half:** `doLeaveBooking` is not exported (the LINE-flow suites pin it by source), so: **her sentence VERBATIM both languages by value** (`leave_no_validity`); the handler prints it **only on this code** (`P2` prints it for every refusal and bites); the **admin notice `leave_refused_no_validity` (📋 DRAFT TH+EN) is sent ONCE, before the reply, only from the webhook — not from the service** (`P3`/`P4`/`P5` bite). ⚠️ **Said, not hidden: the webhook wiring is proven by source, not by driving the handler.**
**Harness change worth knowing:** the fake transaction now **rolls back on a throw** (snapshot/restore) in the 656/657/692 proofs — before, "nothing written" was unprovable because the in-memory world kept writes after a throw.
### ⚠️ Deviation + consequences — yours to rule
1. **New notice KIND, not a re-aim of `makeup_past_expiry`.** §R2 said "re-aim 657's kind"; but `makeup_past_expiry` is STILL raised where the make-up IS created (coach's leave, school cancel). So the parent-refusal is its own kind `leave_refused_no_validity` — kind counts moved 32→33 (+1 in the `?? "-"` and date-format pins, each noted).
2. 🔴 **THE SID GATE changes — your §R-gate steps 1–2 on the 4-session course:** a 4-session course has room for exactly ONE make-up (base = D+28, the first lands ON it). **Step 1 passes; step 2 (the plan modal's ordinary Mark absence on session 3) is now REFUSED with the admin wording.** 6- and 10-session courses are unchanged (+0, one make-up each). My gate test encodes this; **Tanya's table needs the 4-session column rewritten, and the "overflow, once" step is now "refused, expiry unmoved, nothing written, no admin notice".**
3. **657's N5/N7/N8 RETIRED (subject gone — doors 1/2 no longer flag); their successors are 692's R1/R2/R3.** 657's §3 tests re-aimed: the notice is proven at doors 3/4/5 (where the class is created), not doors 1/2.
4. 656's "ANY NUMBER" proof now gives its course the room the claim is about; its "ruling 3" describe re-aimed (door 1 refuses + rollback; a school cancel creates past the expiry, expiry untouched).
▶️ **Ball: Sober verifies 692 and rules the gate.** Nothing else queued on my side except `TASK-639` (after the batch).
