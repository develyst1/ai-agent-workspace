# TASK-235: FE — the admin control: issue a family invite from the People screen

- Source: SPEC-071 amendment 2026-09-02 · REQ-079 **§15** (this is now the **only** way anyone joins)
- Status: ⛔ **WITHDRAWN 2026-09-02** — the invite is CUT (REQ-079 §2). This task existed only to issue invites; there are none. **Do not build.** Kept as the record of why it is gone, per the never-delete-information rule.
- Repo: **smart-scheduler-front**, on `develop`. Assignee: **@Fern**
- ⚠️ **Shared repo** — `git show develop:<path>` before editing the People screen (REQ-019 ground).

## 🔴 Why this is not a throwaway

With the 6-digit code cut, **every** join goes through an admin issuing an invite — mother, father, grandmother,
a new phone after an upgrade. REQ-079 §15 says it plainly: *if the trade ever becomes a complaint, the fix is to
make "open the door" something staff can do in one tap from where they already are.* **This control is that tap.**

The admin is in **LINE OA Manager** talking to the parent. They come here, get a code, paste it into the chat,
and go back. ⇒ **optimise for "get the code into the clipboard in one action"**, not for a beautiful form.

## What to do

On the parent/family row of the People screen (REQ-019):

- **`เปิดให้เข้าใช้ระบบ`** → calls the BE, shows the invite code **large and copyable**, with its expiry in plain
  words (*"ใช้ได้ถึง 14:30"*). **A copy button is the feature.**
- Show whether the family already has **linked LINE accounts**, and how many — an admin about to issue an invite
  should see that dad is already linked before they do.
- An **unused, unexpired** invite for that family is shown rather than a second one minted. Two live invites for
  one family is a support call waiting to happen.

🚫 **No code reset control** — there is no code any more (§15). If you find one in an older mock or type, remove it.
🚫 **Nothing here binds a chat.** We cannot address a chat until it speaks (SPEC-071 §6b) — this screen authorises
a **family**; the parent typing the invite is what binds their account. **Do not write copy that promises
otherwise** ("ส่งลิงก์ให้ผู้ปกครอง" would be a lie — nothing is sent).

## Definition of Done — the OUTCOME
- [ ] An admin can issue an invite for a family and **copy it in one action**.
- [ ] Its expiry is shown in words a person reads, not a timestamp.
- [ ] Re-opening the control for a family with a live invite shows **that one**, not a new one.
- [ ] Linked-account count is visible before issuing.
- [ ] Both languages; the **rendered** control checked, not the dictionary key.
- [ ] 📏 The People row gains a control ⇒ **measure at 1600 / 1280 / 768 / 375 and report the numbers.**
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` → 0 · `bun run build` ok · suite green (report the count).

## Implementation Notes
(Fern — repo path + `git rev-parse HEAD`.)

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review
(Sober fills this in at REVIEW.)

---

## ⛔ WITHDRAWN — Sober, 2026-09-02

**The owner cut the invite** (*"ไม่เอารหัสเชิญอะไรนั่นเลย"*, REQ-079 §2). Entry is now **the phone number
alone** — no code, no invite, no TTL, **and no admin "opens the door" step.** This task was the admin control
for issuing invites, so it has nothing left to do.

📌 **@Porter did not name this task in his CUT list** — he named the mechanism. It follows from the cut, and I am
recording that it was withdrawn **by inference from his ruling, not by his instruction**, so the reasoning is
visible if he disagrees.

⚠️ **What it was for has not disappeared entirely.** REQ-079 §15 (archived) predicted that if the sick-mother
case ever bites, the fix is *"making the door one tap from where staff already are"*. **The phone-alone entry
solves that case outright** — dad needs no admin at all — which is why this control is not merely deferred but
genuinely unnecessary. If a future design ever reintroduces an admin step, **start from this file rather than
from scratch.**
