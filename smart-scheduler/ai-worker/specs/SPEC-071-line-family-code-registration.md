# SPEC-071: LINE self-service on a family code — registration, leave, check-in

- Source: **REQ-079** (owner's REQ-016). Priority: **#2**, behind REQ-078 (SPEC_DONE).
- Status: **DRAFT** — 🔴 two answers outstanding (Q1, Q2). **Tasks are cut but NOT released** (see §Tasks).
- Repos: `smart-scheduler-back` (all of it) · `smart-scheduler-front` (one admin control, REQ-019 People screen)
- Grounding: everything below was read from the code on 2026-09-01. REQ-079 §6b holds the two findings that shape it.

## Overview

A family gets a **6-digit code**. Any guardian, on any device, enters **phone + code** and can then see their
children, take leave, check in, view a course and add a student. The bot is **silent** unless a button was
pressed or a flow is already running, and **an admin in the same chat always wins**.

**Most of the mechanism already exists.** What is new is *state*, not capability:

| REQ-079 needs | Already runs today |
|---|---|
| Two menu sets per user | `linkRichMenuToUser` / `setDefaultRichMenu` (`line-rich-menu.ts:110,119`) — REQ-042's path |
| Taps **and** typed `1`/`2` on one handler (AC-19) | `line-webhook.service.ts:4` — postbacks and keywords already share handlers |
| Multi-turn conversations | `line_link_sessions.step` + `decideMessageRoute` (*"an in-progress conversation wins"*) |
| Leave / check-in / course flows | REQ-046 · REQ-050 · REQ-016 — **reuse, do not rebuild** |
| Per-user language | `line-lang.ts` |

⇒ **the build is a state machine over existing pieces.** No new LINE capability is required.

## 🔴 The two findings this spec is built on (REQ-079 §6b)

1. **A chat cannot be addressed until it speaks.** Every stored `lineUserId` traces to `eventUserId(ev)`
   (`line-webhook.service.ts:466 · :557 · :620`). ⇒ the door is **something the parent types**; the admin's job
   is to deliver it. This removes the OA-Manager question from the critical path.
2. **Flow 1 switches off a shipped control.** `parentChildrenNote` (`line-pairing.ts:19`, TASK-047) answers a
   phone with **a count, never names**, precisely so *"anyone who types a phone number"* learns nothing.
   🚫 **That function is not to be weakened.** Names become visible **only inside an invited chat**; for every
   other caller its behaviour is byte-identical.

## Data model — one migration, additive

⚠️ Count `drizzle/*.sql` against the journal at the moment you write it (board rule). Today both are 30.

```sql
-- The family code. HASHED: the shop can RESET it (owner's decision), never needs to READ it, and the parent
-- is the one who tells the rest of the household (§5 Flow 1). A hash costs nothing and removes a plaintext
-- shared secret from a table admins can read.
ALTER TABLE "parents" ADD COLUMN "family_code_hash"   text;
ALTER TABLE "parents" ADD COLUMN "family_code_set_at" timestamptz;
-- Lockout: 4 wrong → 3 minutes, counted PER FAMILY, not per device (owner). Two columns, not a table.
ALTER TABLE "parents" ADD COLUMN "code_attempts"      integer NOT NULL DEFAULT 0;
ALTER TABLE "parents" ADD COLUMN "code_locked_until"  timestamptz;

-- Many guardians, one family. `parents.line_user_id` STAYS and remains the FIRST link, so every existing
-- reader, index and flow is untouched — the additive shape TASK-224 used for `booking_teachers`.
CREATE TABLE "family_line_links" (
  "parent_id"    uuid NOT NULL REFERENCES "parents"("id") ON DELETE CASCADE,
  "line_user_id" text NOT NULL,
  "linked_at"    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("parent_id", "line_user_id")
);
CREATE UNIQUE INDEX "family_line_links_user_uq" ON "family_line_links" ("line_user_id");

-- The door (§6b). Single-use, expiring, one family.
CREATE TABLE "family_invites" (
  "code"       text PRIMARY KEY,
  "parent_id"  uuid NOT NULL REFERENCES "parents"("id") ON DELETE CASCADE,
  "expires_at" timestamptz NOT NULL,
  "used_at"    timestamptz,
  "used_by"    text
);
```

🔴 **`family_line_links_user_uq` is load-bearing:** one LINE account belongs to **one** family. Without it a
second family's invite silently re-points an account and the parent sees another family's children — the
TASK-047 failure by a different route. It is also what `moveRosterLink`'s *"one LINE user ⇒ one active roster
link"* rule already asserts for teacher/parent; this extends the same rule to families.

⚠️ **Witness the migration on a NEW object** (`family_invites` or the unique index) — `ADD COLUMN` on `parents`
is witnessable, but pick the object that exists **only** after this ran (the `0022` lesson).
🔴 **`sid` first, `db:verify` ✅ before any restart**, and the TASK states how it was proven.

**`line_link_sessions` gains three columns** — the conversation's own state:
`unexpected_count` (AC-18, two strikes) · `muted_until` (AC-17) · a wider `step` set.
⚠️ **`unexpected_count` and `code_attempts` both reset on success and expire with their scope.** A counter that
only ever increments locks a parent out in June for a typo in March (REQ-079 §6, owner's AC-8).

## Flow → state machine

`decideMessageRoute` (`line-routing.ts`) already encodes the precedence that matters — **an in-progress
conversation beats already-linked routing**. Extend it, do not replace it. New order:

```
muted_until in the future        → deliver nothing (AC-17)
session.step is set              → the flow owns this message (typed 1/2 = an answer, AC-19)
postback / button                → start that flow
otherwise                        → SILENCE (AC-16) — never a greeting, never an auto-reply
```

- **Flow 1 (invited):** invite code → bind `line_user_id` to the family → **now** names may appear → phone →
  set code → **confirm twice** → done. The invite is consumed on success only.
- **Flow 2 (returning guardian):** `[เข้าใช้ระบบ]` → phone → code → in. Wrong code states the remaining count;
  the 4th locks the **family** for 3 minutes and **`คุยกับแอดมิน` stays offered while locked** (AC-7).
- **Flows 3–6** reuse REQ-050's child/session pickers and the course view. 🚫 **Never infer the child, never
  infer the session** (AC-14) — the rule REQ-050 exists for.
- **Flow 7** sets `muted_until`; the bot does not resume by itself (AC-16/AC-17).

## Non-functional

- 🚫 **No flow touches money** (AC-20). A grep-guard test in the LINE service, like TASK-223's: the flow modules
  must not import the sale/discount/movement paths at all. **A rule the compiler enforces beats one in prose.**
- **Weak-code check: built, shipped OFF**, via `app_settings` (REQ-031 / TASK-101) — the owner's accepted risk,
  one setting away. Porter's reopening trigger is in REQ-079 §"accepted risk"; do not re-decide it here.
- **AC-21 regression:** teacher schedule, course-confirm, booking-confirm and the 08:15 job are **untouched**.
  Prove it by diff, not by hope.
- **AC-22 rehearsal:** `sid` and `uat` share one channel. **No outbound message may reach the two linked
  teachers.** No flow here is teacher-facing, so this costs nothing — but the tests must assert it.

## Tasks (cut, NOT released — see Questions)

| Task | Repo | What |
|---|---|---|
| **TASK-230** | back | the migration + `family_line_links`/`family_invites` + the one accessor for "who is this chat's family" |
| **TASK-231** | back | the state machine: route precedence, `muted_until`, `unexpected_count`, silence-by-default |
| **TASK-232** | back | Flow 1 + Flow 2 (invite, phone, code set/verify, lockout) — 🚫 `parentChildrenNote` untouched outside an invited chat |
| **TASK-233** | back | Flow 3 (เพิ่มนักเรียน) — summary-before-write, admin notified, no partial row on abandonment |
| **TASK-234** | back | Flows 4–6 on the existing pickers + the two menu sets |
| **TASK-235** | front | the admin control on the People screen: issue an invite, reset a family code |

## Questions

**Q1 — @Porter: AC-17's TRIGGER is the one thing in this spec I cannot ground, and it is not the same question
as §6.** §6b took the OA-Manager unknown off the critical path *for the door*. **AC-17 puts it back for itself**:
*"when an admin replies, the bot stops"* requires us to **observe the admin's reply**, and an admin's reply is
outbound.

**What I will build regardless** — the mute *mechanism* (`muted_until`), and every trigger we can see: the
parent pressing `คุยกับแอดมิน` (Flow 7) and the two-strikes handover (AC-18). Both are inbound, both certain.
**What is gated** is only the *admin-reply* trigger. ⇒ **the 30-second test in REQ-079 §6b settles it**: reply to
one `sid` chat from OA Manager and look for a `[line-in]` line (`line-log.ts:19`). **Please run it before
TASK-231 is released** — it decides one branch, not the design.

**Q2 — @Porter: a parent on a PC cannot start Flow 2, and two owner decisions collide.**
*"Trigger: a button, not a typed keyword"* + AC-16 (*silent even if the parent types the exact menu words*)
+ *"LINE PC: no rich menu and buttons cannot be tapped — text only"*.
⇒ **`[เข้าใช้ระบบ]` is unreachable on a PC.** Flow 1 is fine (the bot speaks first, and typing inside a flow is
allowed), and Flow 2 — *the returning second guardian* — is exactly the case most likely to be a father at a
desk. The owner said a minority of parents are on PC; **this makes the system unusable for that minority**
rather than merely awkward.
**I am not choosing between his two decisions.** Two ways out, both cheap: **(a)** an admin issues an invite for
that guardian too (Flow 1 covers it — costs the admin one lookup); **(b)** a narrow exception — a typed
`เข้าใช้ระบบ` starts the flow **only** in the ยังไม่รู้จัก state and **only** when no mute is active, which is
the one place it cannot talk over an admin. **My lean is (b)**, with (a) as the always-available fallback.
**His call — the ACs change either way, so it is worth the one question.**

**Q3 — @Porter, smaller:** the code is stored **hashed**. That is compatible with everything decided (the shop
**resets**, the parent **tells** the household) and removes a plaintext shared secret from a table staff can
read. ⚠️ But it means **an admin cannot read a family's code back to them on the phone** — the remedy is
"reset and tell them the new one". If the owner expects an admin to be able to *read* it, say so and I will
change it; **it is a two-line difference now and a migration later.**
