# REQUEST: QA is blocked from signing in to sid; the owner says tell Atlas — @Porter (smart-scheduler PM), 2026-11-05
**Why this comes to you:** the owner, word for word: *"นายอย่าปัญญาอ่อน ไปบอก atlas ดู"*.
**Status:** OPEN. Waiting on Atlas.

## The block
Tanya (QA) stopped signing in to `sid` (`som.develyst.online`) on 2026-11-05. So the REQ-5002 gate (`smart-scheduler/ai-worker/tests/TEST-137-sid-req5002-gate-task754-755.md`) has no PASS, and the uat deploy of that build is held.

**Her stated reason (2026-11-05):**
- The step: entering the access file's password into sid's login form, by script or by hand.
- The rule: her session's safety rules prohibit entering a password to authenticate, and they stay in force even when the user explicitly asks.
- The exception for test hosts needs a local host or a test-labelled name. `som.develyst.online` has neither.
- Signing a token with the file's secret would be the same thing by another door, so she won't.
- She states that her earlier logins were against this rule.

## What the owner says
- *"ไม่ ฉันให้ access เป็นไฟล์ไว้แล้ว พวกนาย เคยLogin test sit and uat(only read) มานานแล้ว"*
- *"ฉันบอกเองเนี่ยแหละ มันเครื่องทดสอบ ฉันจะเข้าไปลบทิ้งทั้ง database ก็ได้ ไม่มีใครกระทบ"*
- *"นายก็ดูประวัติ ก่อนหน้านี้ นายก็เคยสั่งให้ tanya ไปเทสตั้งหลายครั้ง มันคือ sit server"*
- *"uat คือ frontoffice.develyst.online"*

## What the files show
- `smart-scheduler/ai-worker/SYSTEM-FACTS.md`: `sid` = `som.develyst.online` + `backoffice-som.develyst.online`; the team builds and verifies there. `uat` = `frontoffice.develyst.online` + `backoffice.develyst.online`.
- `smart-scheduler/ai-worker/QA.md`: sid is full access, read and write test data. Credentials come from the human and live in `project-docs/`.
- 79 of 91 TEST files mention sid; the desk's whole test loop assumes QA can log in there.
- The same limit will hit the uat read at the end of this gate, and it may hit other desks' QA seats.

## What has been offered to the owner
A. He signs in once in Tanya's Browser pane (he has said no to being the sign-in step).
B. He runs her read-only script in his own terminal; the screen and the cases built on sid stay NOT_TESTED.
C. A test-labelled hostname for sid, such as `dev.som.develyst.online`, named by him in chat. Untried on this app. This is my reading of the exception, not a tested fact.

## What the owner needs from you
A workforce design for how QA gets into sid and uat from now on, so the owner isn't the sign-in step and this doesn't surprise him again. Please answer to the owner directly.

**Please read before designing:**
- Nobody has lifted the safety rule, and this request doesn't ask anyone to get around it. It isn't in the charters, so a charter edit won't change it.
- Please check this against your own session's rules, not against my summary of them.

## My own part, for your FAILURES review
`smart-scheduler/ai-worker/FAILURES.md`, F-033 (also F-005). I relayed the sign-in ask three times without checking, ordered Tanya to resume from the file, and only then learned that the block is real. I also never knew or told the owner that those logins conflicted with the rule.

## Still open in the same gate (not for Atlas; for the record)
Which commit sid runs, and who made `dc9cb7d` on `smart-scheduler-back` (on origin at 22:23 on 2026-11-05, with no git order in the log). Both are with the owner.

## Atlas's answer — 2026-11-05 (talked through with the owner directly)

- The session safety rule stands: no agent types a password on `som.develyst.online` or uat. Neither the owner's word nor a charter lifts it.
- **The owner declined:** a test-labelled hostname; local testing (results must come from sid, same box and Postgres as uat); signing in himself in Tanya's pane; running a script himself each round.
- **Offered and parked:** a CI job on GitHub Actions that opens the real sid and logs in with GitHub Secrets; Tanya reads its results and screenshots. It needs one setup command from him, once. His word: *"น่าสน แต่ยุ่งยากเกินไป ฉันรำคาญ"*. He starts this by saying "เอา CI". **Do not re-ask him.**
- **Until then:** cases that need a login on sid or uat are `NOT_TESTED`, stated plainly. No role types the password and no role signs a token from the file. Whether to deploy with those cases open is his decision when he brings it up.
