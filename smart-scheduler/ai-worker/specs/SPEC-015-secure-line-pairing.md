# SPEC-015: Secure the LINE pairing — staged (leak-stop now, approval queue with the people screens)
- Source: REQ-020
- Status: ACTIVE (Stage 1 specced + task cut; Stage 2 designed, cut after REQ-019's screens)

## Overview
REQ-020 has two very different halves, and treating them as one build would delay the part that actually leaks
data today. **I'm delivering it in two stages** (a technical sequencing call — the business scope is unchanged):

- **Stage 1 — hardening that needs no UI (TASK-047, now).** Stop the bot disclosing PII and stop it silently
  guessing on a name collision. Backend-only, small, ships immediately.
- **Stage 2 — the approval queue + link control (after REQ-019).** Teacher claims go to a **pending queue** that
  staff resolve, plus staff **unlink/suspend**. These are inherently staff-facing, and REQ-020's own constraint
  puts that surface on **REQ-019's people screens** — building the queue before the screens exist would stall
  teacher onboarding with no way to approve.

## As-built — all of Porter's claims verified in code (`line-webhook.service.ts` `verifyAndLink`)
- **Teacher:** `rows.find(tt => tt.nickname.toLowerCase() === nick.toLowerCase())` (`:151`) → **first match wins**;
  binds if that teacher's `lineUserId` is empty ⇒ knowing a nickname is enough to become that teacher.
- **Parent:** matches on phone, binds if empty, then the success reply interpolates
  `kids.map(k => k.name).join(", ")` (`:172`, i18n `verify_parent_students`) ⇒ **an unauthenticated user who
  types a parent's phone is told that family's children's names.** This is the real leak.
- **Unknown phone → `findOrCreateParentByPhone` creates a parent** (`:174`).
  ⚠️ **This one is NOT a defect to fix:** it *is* parent self-registration, which REQ-020 #2 and REQ-019 #5 both
  confirm must stay. The junk-record risk is mitigated by REQ-019's **view + suspend**, not by blocking creation.
  I'm calling that out because "anyone can generate junk records" reads like a bug in the REQ's problem statement.
- Post-TASK-046: one LINE user holds one active roster link; precedence teacher → parent → admin.

## Stage 1 (TASK-047) — design
1. **Stop disclosing children's names on parent link.** Confirm the link **without PII**: report a **count**
   (e.g. "พบนักเรียน 2 คนในบัญชีนี้" / "2 children on file") instead of the names. This keeps the confirmation's
   real purpose — the legitimate parent can tell they hit the right account — while an attacker who guessed a
   phone learns nothing identifying. Retire/replace the `verify_parent_students` string (TH+EN).
2. **Never silently resolve a teacher name collision.** If **more than one** roster nickname matches, do **not**
   bind anyone: reply that staff must complete the pairing and stop. (Exactly-one match keeps today's behaviour
   until Stage 2 replaces it with approval.) This directly satisfies REQ-020 #3's "must never silently guess"
   for the case that exists today, at near-zero cost.
3. Everything else unchanged — parent self-registration, existing links, TASK-046's move-the-link rule.

## Stage 2 (after REQ-019) — design outline (not cut yet)
- **Pending queue:** a teacher claim creates a `pending` record (claimant LINE userId + display name + the
  nickname they typed + timestamp) and grants **nothing**; the claimant gets a "waiting for staff" reply (Q1).
- **Staff resolution** on REQ-019's people screens: list pending claims, show **all candidate teachers** when a
  name collides, approve→link / reject→polite message (REQ-020 #3, AC 2–3).
- **Link control:** staff unlink/suspend an existing link (teacher or parent) so pushes stop, without deleting
  the person (REQ-020 #4). Keep `line_admin_user_ids` **out** of it — it's a notification subscription, not a
  roster identity (established in the TASK-046 review).
- Optional per Q2: notify the admin list when a claim arrives.

## Data Model
- **Stage 1: none.** No migration.
- Stage 2: a pending-claims table + a link-suspended flag — designed with REQ-019's schema work so we migrate once.

## Tasks
- **TASK-047** (Jason, BE — Stage 1, now): no-PII parent-link confirmation + refuse-on-collision.
- Stage 2 tasks: cut after REQ-019's screens exist.

## Questions
(Sober asks; Porter answers as `> answer: ...`)
- **Nothing blocking Stage 1.** Two things for the record:
  1. **FYI on the wording change:** the parent-link confirmation will report a **count** instead of names. I
     judged this inside REQ-020's stated goal (it calls the disclosure a privacy hole) rather than a new business
     decision — but คุณฟีน will see the message change, so you may want to mention it.
  2. **Correction worth relaying:** "typing an unknown phone creates a parent record" is **self-registration
     working as she confirmed it**, not a bug — so Stage 1 does **not** touch it. If she actually wants creation
     gated, that's a scope change to REQ-019/020 and I'd need it stated explicitly.
- **Q3 (dual-role) still matters for Stage 2** and is still unanswered — please get it before I design the
  approval queue, since "can one person be teacher *and* parent" changes the pending/approval model.
