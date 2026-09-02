# TASK-243: an admin must be able to clear a family's LINE link (today nobody can)

- Source: @Jason's Q3 on TASK-232 — *"the first support call this design will generate"*
- Status: TODO — 🟠 not a release blocker, but it ships before anyone tells a parent to "contact an admin"
- Repos: **smart-scheduler-back** (the clear) + **smart-scheduler-front** (the control, People screen)
- Assignees: **@Jason** (BE) → **@Fern** (FE)

## 🔴 Why this exists, and whose gap it is

With entry by phone alone (REQ-079 §2), the **phone lookup binds the chat** and
`family_line_links_user_uq` makes that binding **permanent from the bot's side** — correctly: the bot must never
be able to unbind itself, or the guarantee that protects every family is worth nothing.

**But the refusal message says *"this LINE account belongs to another family — contact an admin"*, and there is
no admin who can do anything about it.** TASK-235 was the only surface anywhere near this and **I withdrew it**
when the invite was cut. ⇒ **this is a hole in the design I wrote, not new scope**, and @Jason found it by asking
what happens after the message.

**The real cases, all ordinary:** a family changes phone numbers · a parent typed the wrong number once and it
bound · a second-hand phone whose LINE account was someone else's · a guardian leaves the household.

📌 **@Porter — strike this if you read it as scope** and it goes to the owner instead. But *"contact an admin"*
must not stay a promise nobody can keep.

## What to do

**BE** — clear one family's LINE binding:
- Remove the `family_line_links` row(s) for a **named parent**, and clear `parents.line_user_id` if it points at
  the same account, **through the one accessor** (TASK-230's `family-link.ts`) — 🚫 never two writers.
- 🔴 **This is a deliberate, audited act by staff, not a cleanup.** Log it with the actor. It is the only way an
  account can move between families, which is exactly the thing `family_line_links_user_uq` exists to prevent
  happening silently.
- 🚫 **No self-service.** No LINE flow, no parent-facing path, no keyword. The bot must not be able to reach this.
- ⚠️ **Clearing does not delete history** — nothing about students, bookings or messages changes. Say so at the
  site; the tempting mistake is to treat "unlink" as "remove the family".

**FE** — on the parent/family row of the People screen (REQ-019 ground, shared repo — read `develop` first):
- Show whether the family has a **linked LINE account** at all (today nothing on that screen says).
- **`ล้างการเชื่อมไลน์`** with a confirm naming the family, and one sentence on what it does **and does not** do:
  the parent can link again from LINE; nothing else is lost.

## Definition of Done — the OUTCOME
- [ ] An admin can clear a family's link, and that LINE account can then bind to a family again (including a
      different one — that is the point).
- [ ] The action is logged with the actor.
- [ ] Clearing removes **no** student, booking, note or message row — assert the absence of collateral change.
- [ ] 🚫 No LINE path can reach it — a grep-guard, the AC-20 shape.
- [ ] The screen says whether a family is linked **before** the admin acts.
- [ ] `tsc` 0 both repos · `bun test` / `bun run build` green (report counts). No migration expected — say so
      after counting, not before.

## Implementation Notes
(Engineers fill this in — repo path + `git rev-parse HEAD`.)

## Questions
(Ask here; Sober answers as `> answer: ...`)

## Review
(Sober fills this in at REVIEW.)
