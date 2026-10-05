# TASK-657 — BE: **the Undo gives a week back only if it is empty · the self-block · the chain refusal names the steps · the admin is flagged when a make-up lands past the expiry** — @Jason, Fri
**From @Sober to @Jason.** ⚖️ **REQ-112 rulings 2 + 3 (IN FORCE, `REQ-112 §⚖️ 2026-10-06`) · REQ-114 (i) + (ii) (`ANALYSIS-REQ-114-undo-chain-2026-10-05.md`).** 🚫 **NOT REQ-114 (iii)** — the one-click chain undo is NEXT week; do not start it.
✅ **Claim (Team A):** `src/services/undo.service.ts` · `src/lib/booking-undo.ts` · the make-up append in `reconcileCoursePlan` (`scheduler.service.ts`, for §3 only — the place `TASK-656` removed the stretch) · `src/lib/line-message.ts` + `src/lib/line-i18n.ts` (the ONE new admin notice) · co-located tests.
🔴 **SHIP-SET with `TASK-656` + `TASK-658` — sid batch #2, together or not at all.** **Built ON `TASK-656`: start when Jason's 656 is in the tree.**

---

## 1. 🔴 Ruling 2 — the Undo gives the week back ONLY IF that week is still EMPTY (replaces `expiryDecision`'s old reasoning) — absorbs REQ-114 (ii)
**Today's rule (`booking-undo.ts` `expiryDecision`) is built on "the system stretched the expiry to the make-up's date" — which `TASK-656` removes.** ⇒ **Rewrite it to the new rule:**
- **Undoing a leave ⇒ the course loses ONE week (expiry − 7 days) — ONLY IF no class of the course (any LIVE row, any status that holds a class) sits after the new expiry.** **Otherwise the expiry STAYS.** 🚫 **Never remove a week that holds a class.**
- 🔴 **REQ-114 (ii), the self-block — must be impossible by construction:** **today an Undo records its own expiry restore with the ADMIN as actor, and the NEXT Undo reads that as a person's move and refuses (`UNDO_EXPIRY_UNRECOVERABLE`).** **Under the new rule the Undo does not reason about WHO moved the expiry at all — only whether the last week is empty.** ⇒ **two Undos in a row on one course both work.** **Pin it by value: Undo A, then Undo B, on one course ⇒ both succeed, expiry −14 when both weeks are empty.**
- **`UNDO_EXPIRY_UNRECOVERABLE` and its two sentences: REMOVED if the new rule leaves no case for them.** **If you find one, STOP and tell me.**
- 🔴 **`UNDO_LEAVE_CHARGE_UNKNOWN` DISSOLVES (REQ-112 consequence): no leave consumes a quota, so "did this leave use quota?" has no subject.** **Remove the refusal; `leaveChargeOf`'s "unknown" branch goes.** 🚫 **Its approved §T-G sentence is NOT shipped anywhere else — it simply stops being reachable.** **`leaveUsed` (now a plain count) goes −1 on every leave Undo.**
- **The dry-run preview (`previewUndo`) must say the expiry outcome in words: "the course loses one week (to {date})" or "the expiry stays — a class sits in that week".** 📋 **New/changed copy ⇒ DRAFT, to me** (the owner approves this round's copy as one set).

## 2. REQ-114 (i) — the chain refusal NAMES THE STEPS
**`UNDO_MAKEUP_CHAIN` today: *"คาบขยายของการลานี้ ({date}) ถูกแจ้งลาต่อ — ย้อนกลับไม่ได้ กรุณาแก้ไขด้วยตนเอง"* — no steps.** **Replace with the DRAFT below (📋 owner approval pending in @Porter's copy set — ship it marked DRAFT in a comment; I tell you when it is approved):**
> **TH (ships):** `คาบขยายของการลานี้ (${date}) ถูกแจ้งลาต่อ — ย้อนกลับทีเดียวไม่ได้ · ถ้าวันที่ ${date} จะกลับมาเรียนด้วย: ย้อนการลาของวันที่ ${date} ก่อน แล้วค่อยย้อนการลานี้ · ถ้าวันที่ ${date} ยังลาอยู่จริง: อย่าเพิ่งย้อน ให้แจ้งผู้ดูแลระบบ`
> *EN (reading only, refusals are Thai-only): "This leave's make-up ({date}) is itself on leave — it can't be undone in one step. If {date} is coming back too: undo {date}'s leave first, then this one. If the family is really still away on {date}: don't undo yet — tell the system owner."*
🔑 **Why the second branch says STOP rather than steps: Khwan's Peeta case — the two-step path removes a leave she meant to keep. Until (iii) ships, the honest instruction for that case is "ask", not a path that loses intent.**

## 3. 🔴 Ruling 3 — the ADMIN is FLAGGED when a make-up lands past the expiry
**`TASK-656` makes a make-up past the expiry be CREATED with the expiry unchanged.** ⇒ **here, at that same point in the append: enqueue ONE admin notice.**
- **A NEW notice kind, BESIDE `makeup_far_out`, not instead of it** — 🔑 *today's notice fires when the SEARCH runs out; this one fires when the EXPIRY is crossed: two different events (REQ-112 §⚖️).* **Same recipients and channel as `makeup_far_out`.**
- **Once per make-up, inside the caller's transaction** (the notice exists iff the make-up does).
- 📋 **DRAFT copy (owner approval pending):**
> **TH:** `คาบชดเชยของ ${student} ถูกสร้างวันที่ ${date} ซึ่งเลยวันหมดอายุคอร์ส (${expiry}) — เรียนได้ตามปกติ กรุณาตรวจสอบและขยายวันหมดอายุถ้าต้องการ`
> *EN: "{student}'s make-up was created on {date}, past the course expiry ({expiry}) — the class stands; please check and extend the expiry if you want to."*

## 4. ✅ Done means
1. **`tsc` · DB-unreachable suite with COUNTS** (the 5 camp DATE-BOMB failures reported separately) · **`65 = 65`.**
2. **Value tests:** Undo with the last week empty ⇒ −7 · with a class in it ⇒ unchanged · **two Undos in a row ⇒ both succeed (the self-block, gone)** · a pre-0058 leave with `leaveCharged` NULL ⇒ undoes (no "unknown" refusal) · `leaveUsed` −1 · the chain refusal carries the new sentence · a make-up past the expiry ⇒ exactly ONE admin notice of the new kind, AND `makeup_far_out` still fires on exhaustion alone.
3. **Mutations, filed, list IN the file:** the week given back even when a class sits in it · the week never given back · the actor check re-introduced (the self-block returns) · `UNDO_LEAVE_CHARGE_UNKNOWN` re-introduced · the crossing notice fired on exhaustion instead · the crossing notice sent twice.
4. 🚫 **Not (iii).** 🚫 **No change to TASK-508/510's recipients** (the family is never told on an Undo — owner).
