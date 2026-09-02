# SPEC-071: LINE self-service on a family code — registration, leave, check-in

- Source: **REQ-079** (owner's REQ-016). Priority: **#2**, behind REQ-078 (SPEC_DONE).
- Status: **ACTIVE** — 🔴 **AMENDMENT #2 (2026-09-02) OUTRANKS EVERYTHING ABOVE IT: the invite is CUT too; entry is the PHONE ALONE.** Read it before anything else. — 🔄 AMENDED 2026-09-02 for REQ-079 §15 (the code is CUT) + §16 (the admin-reply trigger is impossible). Tasks 230–235 RELEASED. Was: **DRAFT** — 🔴 two answers outstanding (Q1, Q2). **Tasks are cut but NOT released** (see §Tasks).
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

---

# 🔴 AMENDMENT 2026-09-02 — the family code is CUT (REQ-079 §15) and the admin-reply trigger is IMPOSSIBLE (§16)

> **Where anything above disagrees with this section, THIS section is right.** Same rule REQ-079 §15 sets for
> itself. The title of this spec now names a thing that does not exist; it is kept for continuity.

## What is deleted from this spec

| Deleted | Because |
|---|---|
| `parents.family_code_hash` · `family_code_set_at` | the customer rejected the code (§15) |
| `parents.code_attempts` · `code_locked_until` | the lockout dies with it — 4 attempts / 3 min / per family, gone |
| The weak-code check + its `app_settings` switch | nothing to check |
| **Flow 2 in every form** — self-service phone + code | **no self-service path exists.** A second guardian or a new device is **an admin opening the door again** |
| Q3 (hash vs plaintext) | moot |
| **AC-4 · AC-6 · AC-7 · AC-8** | withdrawn by §15. AC-2 loses its "asks for a code" clause |

⚠️ **One precision, because the two are easy to conflate and one of them is still required.**
@Porter's release note says *"the attempt counter you called the only new state is gone."* That is the **code
lockout** counter (`code_attempts`). It is **not** the **two-strikes** counter (`unexpected_count`): Rule 5 and
**AC-18** still require *"two unexpected replies and the bot hands over to a human"*, and that still needs a
per-conversation count. 🔴 **Do not delete both because one sentence covered them.**

## What survives, and is now MORE load-bearing

**§6b's finding is unchanged and its consequence is larger:** a chat cannot be addressed until it speaks
(`eventUserId` is the only producer of a `lineUserId`). ⇒ **the door is still something the parent presents.**

With the code gone, the invite is **the only way anyone ever joins a family** — mother, father, grandmother, a
new phone. It was one of two doors; it is now the only one. ⇒ **`family_invites` and `family_line_links` are the
whole data model of this REQ.**

```sql
CREATE TABLE "family_line_links" (
  "parent_id"    uuid NOT NULL REFERENCES "parents"("id") ON DELETE CASCADE,
  "line_user_id" text NOT NULL,
  "linked_at"    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("parent_id", "line_user_id")
);
CREATE UNIQUE INDEX "family_line_links_user_uq" ON "family_line_links" ("line_user_id");

CREATE TABLE "family_invites" (
  "code" text PRIMARY KEY, "parent_id" uuid NOT NULL REFERENCES "parents"("id") ON DELETE CASCADE,
  "expires_at" timestamptz NOT NULL, "used_at" timestamptz, "used_by" text
);
```
🔴 **`family_line_links_user_uq` is still the load-bearing one** — one LINE account, one family. Without it a
second family's invite silently re-points an account and a parent sees another family's children: TASK-047's
failure by another route.
`line_link_sessions` gains **`muted_until`** and **`unexpected_count`** only.

## §16 — AC-17: the mechanism is built, the automatic trigger is NOT

**Measured, not assumed:** the owner replied in OA Manager on `sid` and **no `[line-in]` was logged**. An admin's
reply is outbound and never reaches our webhook. ⇒ build `muted_until` and wire the **two inbound triggers**:
the parent pressing `คุยกับแอดมิน`, and the two-strikes handover. **Nothing else.**
🚫 **Do not build the back-office "หยุดบอทในแชทนี้" control** — @Porter has it noted as the fallback, not now.

## 🔴 §16's second finding changes what TASK-231 IS — read this before estimating it

From the same screenshot: in an **idle** chat the **deployed** bot answers stray text with errors —
`เมนู` → *"เบอร์โทรไม่ถูกต้อง…"*, `yo` → *"ไม่พบครูชื่อเล่น \"yo\""*.

⇒ **AC-16 ("silent by default") is a CHANGE TO SHIPPED BEHAVIOUR, not a new capability.** The current handlers
demonstrably reply. That makes TASK-231 a **regression-shaped** task, not an additive one:
- it must **prove** the bot no longer answers unrecognised text in an idle chat, with a test that **fails on
  today's handlers**;
- and it must not silence the paths that *should* answer — the linking conversation, and every in-flow step.
📌 This is the one place in the REQ where we are taking something away from a running system that real teachers
use. It deserves the sharpest regression in the batch.

## The flows, as they now stand

1. **Flow 1 (the only way in):** admin gives an invite in the chat → parent types it → chat bound to the family
   → parent enters their phone → **children shown by name** → done. **No code is set. Flow 1 got shorter.**
2. **Flow 2: deleted.** A second guardian or a new device = an admin opens the door again.
3. **Flows 3–6** unchanged: เพิ่มนักเรียน (summary-before-write, admin notified) · แจ้งลา · เช็คอิน ·
   คอร์สของฉัน, all on REQ-050's existing pickers. 🚫 Never infer the child, never infer the session.
4. **Flow 7** sets `muted_until`; the bot does not resume by itself.

## 📌 The trade §15 names, carried into the build so nobody re-derives it

The **sick-mother case** now depends on an admin being reachable: dad, unlinked, filing leave on a Sunday
evening, must reach a person. **That is the customer's call and the shop's phone has always worked** — it is
written here because it is invisible at decision time and obvious the first evening it happens. ⚠️ If it ever
becomes a complaint, **the fix is not to re-litigate the code — it is to make "open the door" one tap from where
staff already are.** That is why TASK-235 is not a throwaway.

## Tasks — RE-CUT and RELEASED

| Task | Repo | What |
|---|---|---|
| **TASK-230** | back | the migration: `family_line_links` · `family_invites` · the two session columns |
| **TASK-231** | back | 🔴 silence-by-default as a **behaviour change** (AC-16) + the route precedence + `muted_until` + two-strikes |
| **TASK-232** | back | **Flow 1 only** — invite → bind → phone → children by name. 🚫 `parentChildrenNote` untouched outside an invited chat |
| **TASK-233** | back | Flow 3 เพิ่มนักเรียน — summary before write, admin notified, no partial row |
| **TASK-234** | back | Flows 4–6 on the existing pickers + the two rich menus |
| **TASK-235** | front | the admin control: issue an invite from the People screen |

**Questions: none open.** §15 and §16 closed Q1, Q2 and Q3.

---

# 🔴 AMENDMENT #2 — 2026-09-02 — THE INVITE IS CUT TOO. Entry is the PHONE NUMBER ALONE (REQ-079 §2)

> **This section outranks everything above it, including Amendment #1.** Read §2 of REQ-079 first.
> Owner: *"ฉันเอาแค่เบอร์ ก็สามารถใช้งานได้เลย"* — a parent enters their phone, their children are shown, they
> are in. **No code. No invite. No TTL. No lockout. No admin step.**

## Deleted — do not build, and delete from anything already written

`family_invites` · the code generator · the 8-char base32 alphabet · the 30-minute TTL · single-use redemption ·
the invite attempt counter · **and the admin "opens the door" step in every form.**

⇒ **My §6b invite mechanism is dead**, and with it Amendment #1's Flow 1. **TASK-235 is WITHDRAWN entirely** —
it existed only to issue invites (@Porter did not name it; it follows from the cut).

## ⚠️ TWO things in that CUT list are easy to over-delete. Read this before touching either.

**1. `unexpected_count` SURVIVES.** @Porter's list says *"the attempt counter"* — that is the **invite/code**
attempt counter. It is **not** the **two-strikes** counter, which Rule 5 and AC-18 still require (*"two
unexpected replies and the bot hands over to a human"*) and which **TASK-230 has already shipped**.
🔴 **This is the third time these two counters have nearly been deleted on one sentence.** The distinction is in
the migration, in `schema.ts` and in a comment-stripping test — **do not remove any of them.**

**2. 🚫 DO NOT EDIT MIGRATION `0030`.** It creates `family_invites`, which we no longer use, and **it may already
have run on `sid`** (it was with the owner when this landed). The risk is asymmetric:
- edit it and it has run ⇒ the file and the database disagree, and **`db:verify` witnesses by name so it cannot
  see the difference** — the `0022` blindness, and exactly what TASK-239's byte-identity test exists to prevent;
- leave it and it has not run ⇒ **one unused table.**
⇒ **Leave it.** `family_invites` stays dormant. Dropping it is a one-line migration whenever someone is in there
anyway — **never urgent, never bundled with a release.**

## ✅ Kept, and its reason never depended on the code

`family_line_links` + `family_line_links_user_uq`. **One LINE account belongs to one family.** Without it a
second entry silently re-points an account and a parent sees another family's children — TASK-047 by another
route. **It survived three entry designs because it was never about the code.**

## The flow now

```
ผปค : 0812345678                    ← the phone. INBOUND, so this is also what binds the chat
[ 2FA step — present in the flow, OFF by default ]
บอท : พบข้อมูลของคุณแล้วค่ะ — น้องรดา, น้องต้น
```

📌 **The phone lookup is now the binding event**, doing the job the invite did: it is the first inbound message
that identifies a family, so it is where `family_line_links` is written. **§6b's finding is unchanged and is why
this works at all** — a chat cannot be addressed until it speaks.

📌 **And the sick-mother case is solved outright.** Dad needs no admin, no code, no invite. The problem that drove
three designs disappears with the third — worth stating, because two of those designs are archived above.

## 🆕 The 6-digit 2FA — BUILT, shipped OFF (§2)

- A **per-session** 6-digit verification step **between the phone and the children**. **Off by default.**
- **The switch is `app_settings`** — REQ-031's mechanism, the same shape as the retired weak-code check.
- 🔴 **Turning it on must be a SETTING, never a rebuild.** The branch exists in the flow from day one.
  **A stub that would need the flow re-cut later is explicitly not what was asked for** — build the branch,
  default it off, and prove with a test that flipping the setting changes behaviour with no code change.
- **Its parameters (lifetime · attempts · lockout) return to the OWNER on the day it is switched on.** They are
  **not** inherited from the two deleted designs. *An acceptance does not transfer across a mechanism change* —
  the principle this REQ has now proved three times.

## 🔴 The accepted risk — carried into the build, not re-litigated in it

**Anyone who knows a phone number can see that family's children and act for them.** The owner raised it with the
customer, **explained the danger, and the customer refused** the code and anything in its place (§2, and
`SYSTEM-FACTS.md`).

**Whoever meets this later must read *"the customer was told and declined"*, not *"nobody thought about it"*.**
🚫 **Do not silently re-open it. Do not silently harden it** — a well-meant extra check added in a task is exactly
the "quiet hardening" that is forbidden.

⚠️ **Two limits keep it survivable and must not be traded away without a NEW decision:**
1. 🔴 **LINE never unlocks anything that moves money** — children, leave, check-in only. **This is the line that
   bounds the risk, and it has held across all three entry designs.** AC-20's grep-guard test is what keeps it
   true, so that test is now load-bearing rather than tidy.
2. **A parent cannot delete a student with any history** (§6b of the REQ).

## Tasks after this amendment

| Task | State |
|---|---|
| **TASK-230** | ✅ DONE — unchanged. `family_invites` ships dormant; **`0030` is not to be edited.** |
| **TASK-231** | **TODO, unchanged in substance** — silence-by-default, `muted_until`, two-strikes. ⚠️ `unexpected_count` stays. |
| **TASK-232** | 🔄 **RE-CUT** — phone → (2FA branch, off) → children. No invite, no door. |
| **TASK-233 / 234** | unchanged — they begin from a bound chat, and the binding just moved. |
| **TASK-235** | ⛔ **WITHDRAWN** — it issued invites, and there are none. |
