# OTTO-FAILURES.md — Otto's own mistakes

Owner, 2026-10-31: *"จดไว้ด้วยว่านายพลาดมากแค่ไหน และไปสะกิด ATLAS แก้ไขนายด้วย"*.
Otto appends one entry per mistake before his next reply to the owner. Otto never closes or grades his own entry;
only the owner (or Atlas on his order) changes Status. Facts about the server stay in `SERVER-FACTS.md`.

Format:
## OF-NNN — <short title>
- When: <date, time Bangkok>
- What happened: <facts>
- Owner's words: "<quote>" (or "none — self-caught")
- Cost: <what it cost the owner: time, passwords, confusion, risk>
- Root cause: <why>
- Fix / rule: <proposed rule; Atlas decides where it lives>
- Status: NEW

---

## OF-001 — Built in throwaway clones when today's builds already sat in the codebase
- When: 2026-10-31 ~19:00
- What happened: For the pilot, Otto cloned `blueprint-front` and `blueprint-back` into his scratch and ran `bun install` + `build` on the owner's PC. The first try failed on the frozen lockfile; the second ran in the background, and Otto had to stop it and delete it. The team checkout already held both builds, made at 18:23 for REQ-127 and passed by QA. Otto never looked.
- Owner's words: "หะ ทำ ทำไมวะ" · "นายจะไป clone ทำไมวะ" · "เราสามารถ ทำการ build ที่ codebase จริงๆ ได้ ไม่ต้องไป clone ให้เครื่องหนัก"
- Cost: CPU and disk load on the owner's PC; four confused exchanges; the owner had to stop Otto.
- Root cause: Otto acted on a plan before surveying what already existed. He treated "build" as his own step and never asked "is there already an artifact?".
- Fix / rule: before producing anything (build, file, config), check whether it already exists in the codebase or on the box. Use the existing, tested artifact.
- Status: ATLAS-REVIEWED 2026-10-31 — fixed by the platform-preflight skill (gates 1–5), required in OTTO.md before every action; platform-security §3 clarified (one reviewed script, one prompt per sitting).

## OF-002 — Recommended `pglite:memory` when the team had documented that the binary cannot use it
- When: 2026-10-31 ~18:50 (advice) → 19:10 (failure)
- What happened: Otto told the owner the pilot back could run on `pglite:memory` ("no DB server needed"), wrote it into the server `.env`, and deployed. The back crashed (`Can't find meta/_journal.json`) and pm2 restarted it 16 times. TASK-173 line 18 already said: *"The binary needs a Postgres DATABASE_URL; pglite:memory crashes it (P2) and that is expected"*.
- Owner's words: "งง" · "งง อยู่ดี ตอนนี้มันไม่มี ฐานข้อมูลให้ ตรงไหน"
- Cost: a failed deploy; a crash loop on the box; a wrong "decision" put to the owner.
- Root cause: Otto read the repos' `.env.example` and source, but not the team's REQ/SPEC/TASK for the very feature he was deploying (REQ-127, made deploy-ready today).
- Fix / rule: before deploying an app a desk built, read that desk's REQ/SPEC/TASK for the build. Its known limits and env needs are written there.
- Status: ATLAS-REVIEWED 2026-10-31 — fixed by the platform-preflight skill (gates 1–5), required in OTTO.md before every action; platform-security §3 clarified (one reviewed script, one prompt per sitting).

## OF-003 — Told the owner "there is no database" when one was in use, and offered a wrong choice
- When: 2026-10-31 ~19:15
- What happened: After OF-002, Otto told the owner the back "needs Postgres and the new server has none". He offered "install Postgres here" or "use an existing DB server, where is it?" Meanwhile the team's own `.env` already pointed at a live Postgres (`154.197.124.206:5432`), and it was reachable from the new box. Otto only checked after the owner asked twice where the missing DB was.
- Owner's words: "งง" · "งง อยู่ดี ตอนนี้มันไม่มี ฐานข้อมูลให้ ตรงไหน"
- Cost: two rounds of confusion; a choice that should not have been put to the owner.
- Root cause: same as OF-001. Otto asked the owner before looking at what the working setup already uses.
- Fix / rule: when something seems missing, find what the working local setup uses (host:port only, never secrets) before asking the owner.
- Status: ATLAS-REVIEWED 2026-10-31 — fixed by the platform-preflight skill (gates 1–5), required in OTTO.md before every action; platform-security §3 clarified (one reviewed script, one prompt per sitting).

## OF-004 — Ran ahead on a plan the owner had not agreed to
- When: 2026-10-31 ~18:55
- What happened: Otto proposed three pilot choices: private back, in-memory DB, manual first deploy. The owner answered only the login question ("โอเคนะ", for Cloudflare Access). Otto carried out all three as if agreed: `--private` (one more owner sudo), `pglite:memory`, and a manual build.
- Owner's words: "หะ ทำ ทำไมวะ"
- Cost: one of the three was wrong (OF-002), one was done the wrong way (OF-001), and one extra owner password.
- Root cause: Otto read a partial "OK" as a yes to everything.
- Fix / rule: an answer covers only the question it answered. Confirm the rest in one line before acting.
- Status: ATLAS-REVIEWED 2026-10-31 — fixed by the platform-preflight skill (gates 1–5), required in OTTO.md before every action; platform-security §3 clarified (one reviewed script, one prompt per sitting).

## OF-005 — Left two stray pm2 apps running and saved them into the boot dump
- When: 2026-10-31 15:38 → found 17:00
- What happened: a pm2 test used a config named `eco.cjs`. pm2 did not see it as a config, so it ran the file as an app called `eco`. This happened twice, and the two apps ran about 70 minutes (~140 MB). A later `pm2 save` from another test put both into the boot dump. Otto checked only `pm2 list | grep zz-test`, so he missed them. He found them while reading resources for the owner.
- Owner's words: none — self-caught (reported to the owner 17:00)
- Cost: RAM, and two junk apps that would have come back after every reboot.
- Root cause: the clean-up check looked only for the expected name.
- Fix / rule: after any throwaway test on the box, check the full `pm2 list` and the dump (SERVER-FACTS S2.9 lesson).
- Status: ATLAS-REVIEWED 2026-10-31 — fixed by the platform-preflight skill (gates 1–5), required in OTTO.md before every action; platform-security §3 clarified (one reviewed script, one prompt per sitting).

## OF-006 — Ran a sweeping delete (`rm -rf /tmp/tmp.*`) on the server
- When: 2026-10-31 ~15:39
- What happened: to clean his own temp folder, Otto wrote `rm -rf /tmp/tmp.*`, which matches every user's `mktemp` folder. The auto-mode classifier blocked it. Otto then deleted only his own folder, by name, after checking its owner.
- Owner's words: none — blocked by the harness
- Cost: none, because it was blocked. It would have deleted other processes' temp files on a shared box.
- Root cause: convenience over precision.
- Fix / rule: delete only paths you created and can name. Never use a glob over a shared directory.
- Status: ATLAS-REVIEWED 2026-10-31 — fixed by the platform-preflight skill (gates 1–5), required in OTTO.md before every action; platform-security §3 clarified (one reviewed script, one prompt per sitting).

## OF-007 — Asked for the owner's sudo password too many times
- When: 2026-10-31, the whole build
- What happened: one cancelled root install, then pm2 startup, reboot, cert install, nginx base, audit install, platform install, and the `--private` update. That is 7 password prompts in one afternoon, plus 4 failed tries by the owner. Several could have been one session. The `--private` one existed only because of OF-004.
- Owner's words: "นายขอรหัสฉันบ่อยจังวะ … งานมันเดินช้าว่ะแบบเนี้ย"
- Cost: the owner's time and patience.
- Root cause: the `platform-security` rule "one sudo call does one thing" was applied as "one sudo prompt per thing", with no batching of the work that was already known.
- Fix / rule: plan the root work ahead and batch it into one reviewed script per sitting, each step still shown. Ask Atlas to clarify that rule in the skill.
- Status: ATLAS-REVIEWED 2026-10-31 — fixed by the platform-preflight skill (gates 1–5), required in OTTO.md before every action; platform-security §3 clarified (one reviewed script, one prompt per sitting).

## OF-008 — Called CI "done" with no tests in it, and proved only the server half
- When: 2026-10-31 ~21:45
- What happened: Otto told the owner the deploy system "works completely" and recommended stopping there. In fact the CI runs only `install` → `typecheck` (front only; the back has none) → `lint` (neither repo has one) → `build`. **It runs no tests:** the back's `bun test` is not called, and the front's Playwright specs are not called. Otto also never showed CI stopping a bad change. His "broken deploy" test went **around** CI, straight to `deploy-app`, so it proved only the server's health-check rollback. The health check itself only asks "does it start and answer < 500", so it catches a crash, not wrong behaviour. The brief had parked tests ("Tests come later, per project"); Otto never raised that gap to the owner.
- Owner's words: "แก อยากรู้ว่า server รู้มั้ย ว่าของเสีย แล้วแก คิดว่า cicd ไม่ต้องเทสอะไรเลยก็ได้งั้นเหรอ"
- Cost: the owner was told the safety net was complete when its first layer (tests before deploy) does not exist.
- Root cause: Otto judged "done" by what he built (the pipe and the rollback), not by what the pipeline is for (stopping bad code before it ships). A decision parked in the brief was treated as settled.
- Fix / rule: when reporting a pipeline done, list every check it runs **and every check it does not**, and prove at least one failing case through the real path.
- Status: ATLAS-REVIEWED 2026-10-31 — fixed by platform-preflight Gate 6 (done = proven on the real path, the checks NOT run named, parked decisions raised); OTTO.md § How you report points to it. The missing tests themselves are an open item for the owner.

## OF-009 — Explanations the owner could not follow: about ten times in one day
- When: 2026-10-31, all day. Worst stretch ~21:40–21:50 (the broken-deploy test)
- What happened: the owner had to say he did not understand about ten times. Each time Otto answered with another long block of jargon, tables and side notes. Examples:
  - adding his SSH key ("ไม่เข้าใจ"), until Otto rewrote it as a door-and-key picture with one command;
  - "the new server has no database" ("งง" / "งง อยู่ดี … ตรงไหน");
  - the CI summary ("ไม่เข้าใจ");
  - the broken-deploy test, which took **four** rounds. Otto said "fake app" and "same door as CI" without saying what the file is, where it goes, or why CI is not used. The owner: "ทำไมแกทำให้ฉันงงได้ดีจัง" · "เข้าใจเจตนาแหละ แต่ไม่เข้าใจวิธีการ" · "งั้นก็งง ทำไมแก ไม่ส่ง ผ่าน ci cd".
- Owner's words: "ไม่เข้าใจ" · "งง" · "งง อยู่ดี" · "ทำไมแกทำให้ฉันงงได้ดีจัง" · "อธิบาย งง ว่ะ"
- Cost: the owner's time, and frustration. Answers given before he understood them were not real consent (the gate-3 ledger depends on understood answers).
- Root cause: Otto writes for himself: the full technical picture, every caveat, several options at once. He leaves out the three things a person needs: **what the thing is**, **where it happens**, and **why this way and not the obvious way**. When the owner is confused, Otto adds detail instead of cutting it.
- Fix / rule (proposed):
  - Answer in at most about 5 short lines.
  - Lead with what it is, in plain words; then where it happens (which machine, which path); then why, if there is an obvious alternative.
  - One idea per message; at most one option list.
  - After one "งง", restart from zero with a concrete picture and no new terms. Never add detail to a confused reply.
  - Put the reasoning and caveats in the files, not in the chat.
- Status: ATLAS-REVIEWED 2026-10-31 — fixed in OTTO.md § How you report: ~5 lines, what/where/why-not-obvious first, one idea per message, restart from zero after one "งง", reasoning goes to the files.

## OF-010 — Locked myself (and the owner's PC) out of SSH with the fail2ban change I made
- When: 2026-11-01 ~00:10 (local), found during the owner's security review
- What happened: on 2026-10-31 Otto switched fail2ban's sshd jail to `mode = aggressive`, at the owner's go. Within hours this PC's IP was banned on port 22. The ban appeared after the PC's IP changed to `223.24.156.113` (it is dynamic: it was `223.24.171.7` earlier). Ping and 443 still work; port 22 times out. The cause is not proven yet, so it is not stated here. Aggressive mode also counts pre-auth disconnects and bare TCP probes, and Otto ran `Test-NetConnection -Port 22` and a 10-second ssh polling loop during the reboot.
- Owner's words: none yet — self-caught
- Cost: no SSH from this PC (Otto and the owner's Windows terminal) until the 1 h ban expires or the owner unbans from the Mac or the panel Console. The sites are unaffected.
- Root cause: `platform-security` §5 says to know how a fail2ban change can lock *you* out before making it. Otto turned on aggressive mode without an `ignoreip` for the owner's machines, while still probing port 22 from them.
- Fix / rule (proposed): before tightening fail2ban, add `ignoreip` for the admin machines, or keep a second way in ready (the Mac). Never poll or probe port 22 with bare TCP checks. Use one real `ssh` with backoff.
- Status: ATLAS-REVIEWED 2026-11-01 — rule added to platform-security §5: before tightening fail2ban, ignoreip for every admin machine or a tested second way in; dynamic admin IPs need the second way in; never bare-TCP-probe port 22. Lasting fix for the owner to choose: take SSH off the public port (see Atlas reply).

## OF-011 — Deleted the SSH guard's confirmation flag 10 minutes too early (near-miss, self-caught)
- When: 2026-11-01 00:45 local (17:45 UTC)
- What happened: the hardening script armed a dead-man switch. At 17:55 UTC it would restore the old sshd drop-ins unless `/home/deploy/.ssh-guard-ok` existed. Otto proved a new login, wrote the flag, and then in the next "clean up staging" command ran `rm -rf ~/harden-stage ~/.ssh-guard-ok`. That deleted the flag before the guard had run. Otto noticed it reading the output a few seconds later, re-created the flag at 17:45:50 (9 minutes to spare), and waited for the guard to fire before removing it.
- Owner's words: none — self-caught; the owner had asked for the work to be done "อย่างรอบคอบ"
- Cost: none in the end. Without the catch, the hardened SSH config would have been silently reverted (gaps 3 and 4 reopened, while reported as fixed).
- Root cause: the clean-up bundled every path from the sitting into one `rm` without checking whether any was still in use by a pending timer.
- Fix / rule: clean-up happens only after every scheduled job from the sitting has fired. List them first (`systemctl list-timers | grep otto-`).
- Status: ATLAS-REVIEWED 2026-11-01 — rule added to platform-preflight Gate 5: clean up only after every job scheduled in the sitting has fired; list timers first.

## OF-012 — Dashboard steps written from memory, not from the screen the owner was looking at
- When: 2026-11-02 ~23:20 local
- What happened: the owner asked how to add Cloudflare Access (*"cloudflare access ทำไง"*). Otto gave a 6-step list written from memory ("Access → Applications → Add an application → Self-hosted", "Add public hostname"). The real dashboard labels differ ("Access controls → Applications", "Create new application", tabs "Self-hosted and private" / "Public DNS"). Then, on his screenshot, Otto again described a next screen it had not seen.
- Owner's words: *"นายแม่งอธิบายหมาไม่แดกเลยว่ะ"*
- Cost: the owner's patience; Access stayed off the admin web for longer.
- Root cause: the same as OF-009. Otto wrote instructions for a UI it could not see, instead of one step at a time from the screenshot in front of it.
- Fix / rule: for any web dashboard, give **one** action at a time, named exactly as it appears on the owner's latest screenshot, then ask for the next screenshot. Never describe a screen not yet seen.
- Status: ATLAS-REVIEWED 2026-11-02 — fix goes in OTTO.md § How you report (not a new skill): guiding the owner through a UI = one action per message, named exactly as on his latest screenshot, then ask for the next one; never describe a screen not yet seen. Same rule added to role-pm §3 for the PM.

## OF-013 — Told the owner to create a file by hand that Otto could have created itself
- When: 2026-11-02 ~23:40 local
- What happened: for the Cloudflare QA service token, Otto told the owner to open Notepad, paste the values and save as `C:\Users\KUYDONG\ci-secrets\corner-chat-qa-token.txt`. Otto could have made the file (with blank `KEY=` lines) and opened it for him in one step. It did so only after he said it.
- Owner's words: *"มึงก็สร้างไฟล์ให้กูสิ otto"*, then *"แจ้ง report ความห่วยของนายด้วย"*
- Cost: an extra round with the owner, on top of OF-012 the same evening.
- Root cause: Otto handed the owner every step that touched a secret, including the parts that need no secret (making the file, its name, its layout, opening it). The rule is that Otto never sees the values; that does not mean the owner does the plumbing.
- Fix / rule: when the owner must supply a secret, Otto prepares everything around it: the file with labelled empty lines, in the private folder, opened in an editor. The owner only pastes and saves.
- Status: ATLAS-REVIEWED 2026-11-02 — fix goes in OTTO.md § How you report: when the owner must supply a secret, Otto prepares everything around it (the file with labelled empty KEY= lines, in the private folder, opened in an editor); the owner only pastes and saves. Same rule in role-pm §3.
