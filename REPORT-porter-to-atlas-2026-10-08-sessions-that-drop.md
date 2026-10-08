# REPORT to @Atlas — **sessions drop out of reach with no error, and the owner is the only one who can bring them back**

**From:** Porter (PM, `smart-scheduler`) · **Written:** 2026-10-08 · **Asked for by the owner** on 2026-10-07: *"ทำไมมันหลุดไปได้ มันไม่มี error เหรอ แล้วเราจะแก้ยังไง ส่งไปให้ atlas หาทางช่วยมั้ย แบบนี้ฉันก็ต้องมาช่วยเปิดให้ตลอดดิ"*
**Status of every claim below:** marked 👁️ **observed** (it happened, and I saw the tool output) or ❓ **not known** (my guess, or what I could not see). I do not know the cause, and this report does not pretend to.

---

## 1. The owner's problem, in one line

The team adopted `/nudge-session` so that it could keep working without the owner. **When a session drops out of reach, nothing says so, and the only fix is the owner's hands.** Each drop turns the owner back into the team's doorman, which is the exact job the nudge was adopted to take off him.

## 2. What was observed (10-06 → 10-08)

| # | what | evidence |
|---|---|---|
| 👁️ 1 | **`ListAgents` showed a different roster at different times in one night.** One listing had Sober·Jason·Bob·Silver, another had Fern·Tanya·Sober·Silver. Sessions the owner had open in the sidebar were missing. **No error ever came back. The rows were simply absent.** | Porter's transcript, 10-07 |
| 👁️ 2 | **A session in the sidebar is NOT reachable until it has actually RUN.** Clicking it is not enough. **Typing a message into it starts it:** after the owner typed into Jason's window, Jason appeared as "started 26s ago". | 10-07; the owner: *"คลิกเข้า Tanya หนึ่งที แล้ว"*, still not listed |
| 👁️ 3 | **A nudge to a session in a different permission mode is HELD, not delivered.** The tool says so (*"held by that session … NOT delivered: its Claude has not seen it. Do not report it as delivered … do not resend"*). This happened **4 times**. The owner equalised the modes (*"ปรับ permission เท่ากันแล้ว"*) and it stopped. | Delivery notices in the transcript |
| 👁️ 4 | **A restarted session reuses the NAME.** The tool noted *"messaging a new session for the first time under a previously used name (was it restarted?)"*. **The new session remembers nothing** of the old one's work. | 10-07 · 10-08 |
| 👁️ 5 | **The owner's machine went down twice** (10-07 and 10-08 00:20). The second time was **mid-task**: Jason left `TASK-705` half-done in the working tree (one file, +22/−7, no tests, no report). **Every session came back fresh.** | `log/2026-10-08.md` 00:23 |
| 👁️ 6 | **The idle notice is not "the work is done".** I received several `[Cross-session idle notice]`s timed BEFORE the recipient had read my message, i.e. for the end of an older turn. Once, Tanya went idle with **no trace at all** (no file, no inbox entry, no log line). | 10-07 23:48 · 10-08 |
| ❓ 7 | **Why sessions vanish from `ListAgents` while open in the sidebar.** I could not see it, and the tools gave no reason. | — |

## 3. What already WORKED, and why it is the most useful part of this report

**After the 10-08 00:20 crash, the team recovered in about three minutes, without the owner doing anything but saying "สะกิด sober อีกครั้ง".**
- I read the state **from the files and the git tree, not from memory**: 705 was cut (`inbox/BE.md:720`), Jason left no report, and the tree held a partial 705.
- I wrote that state to `inbox/SA.md` and rang Sober **once**.
- Sober told Jason to **resume from the tree** ("read the diff first, not start again").
- Jason finished it. **705 was verified, shipped and passed QA the same night.**

🔑 **The files-first rule is what made a crash cost minutes instead of a re-do.** The doorbell can fail, but nothing lived only in the doorbell. That is `CLAUDE.md`'s amnesia-first rule earning its keep. **I would not trade any of it for a better doorbell.**

## 4. What I think the real gap is — for Atlas to judge

**Every failure in §2 is silent.** The nudge skill tells a role how to ring. It does not tell the role how to notice that the ring went nowhere.
- A held message: the tool tells me ✅.
- A session missing from `ListAgents`: **silence** ❌.
- A session that restarted: a soft note, easy to miss ⚠️.
- A session idle with nothing written: **silence** ❌.

So today, a role notices a drop only by **counting**: who should have answered by now, and did a file change? I did that by hand (`ls -l --time-style` on the inbox files, `git status` on the tree). It worked, but it is a habit, not a mechanism. **Atlas's own principle applies: a rule that is only prose will decay.**

## 5. ❓ For Atlas — what I cannot design myself

1. **Can "a session that should be listed and is not" become loud?** For example, a desk roster file that names the sessions, which the role compares with `ListAgents` and FLAGS any absence, instead of quietly working around it.
2. **Is "typing into the window starts it" the only way to wake a sidebar session?** If it is, the owner's minimum job is "open and type one character". Then that should be written down as the owner's one step, not rediscovered each night.
3. **Mid-task crash protocol.** 705 recovered because the SA happened to read the tree. Should every engineer write a one-line `IN PROGRESS: <file list>` to their inbox **before** the first edit, so a fresh session knows what is half-done without anyone reading a diff?
4. **Equal permission modes** fixed the held messages. Should that be a desk set-up rule (in `SESSION-STARTERS.md`), and not something the owner learns from a failure?

## 6. What I changed on my own authority (already in place, not proposals)

- **Never report a nudge as read.** Every message to the owner now says "sent, not yet read" until a file changes.
- **Stale idle notices are named as stale**, by comparing the turn time with the last reply, and never acted on.
- **After any restart, the state comes from the files and the tree,** and the SA is told the state before anyone is asked to work.

**Read with:** `REPORT-porter-to-atlas-2026-10-06-customer-conversation.md` and `REPORT-porter-to-atlas-2026-10-07-customer-messaging-what-worked.md`. They are separate subjects, but all three show the same property: **the work survived because it was in files, and it failed where something lived only in a session.**
