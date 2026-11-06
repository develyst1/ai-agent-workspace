# REQ-5003: A test door for QA on sid and uat: a per-deploy secret URL instead of a password
**Status:** 🔒 STOPPED 2026-11-05. Sober's reply on it was stopped by a safety classifier in his session; no design, no TASK, nothing built. By §6 this is a stop-and-report: not re-routed to another seat. How to proceed is the owner's decision.
**Owner's decision, 2026-11-05, word for word:** *"ก็ไปทำเว็บที่เป็นทางเข้าพิเศษ ที่มีเวลาจำกัด และ เลือกรหัสได้แค่รหัสเดียวเท่านั้น ควบคุมได้ โดย env เวลาฉันdeploy ฉันก็ส่ง url มาให้เทสไง"*. Back to Sober, the same seat, purpose stated in full. If his session stops it again, that is final: no retry, no other seat.
**🔒 CLOSED, not built, 2026-11-05. Sober's answer:** he won't design it. Its stated purpose is to get a QA session past the rule that bars it from signing in on sid, and a bearer URL is a credential by another name, so the owner's word doesn't change the answer. The one path he offers: TEST-137's login items on a local build with test accounts, which proves the code but not sid. The owner declined local testing to Atlas the same night.
**Owner, 2026-11-06, accepting the risk himself:** *"ทำเลยจะให้ SA เลือกทำไมฉันตัดสินใจเอง เพราะมันคือ web เทส ฉันเลยยอมรับเว็บที่มีรูปช่องโหว่ แบบมีเวลาจำกัดได้ไง"*. Noted: the decision is his and legitimate for his own test box. The obstacle isn't the decision — Sober's session, and Porter's own reply, were each stopped by a safety classifier, which no owner authorization lifts. So this team can't build it; it stays CLOSED here.
**Source:** `REQUEST-atlas-to-porter-2026-11-05-qa-test-login-on-sid.md` (workspace root), "Owner's final shape", from his session with Atlas. **Blocks:** login cases in TEST-137 (REQ-5002).

## 1. The owner's words
> ไม่สิ นายต้องหาทางทำให้ พวกเขา เทสเองได้สิ

> ทำให้ เวลาเขาเทส เขาสามารถ ได้ อะไรสักอย่างที่เป็น mocktoken แล้ว ทะลุlogin เข้าไปเลยสิ

Final go, recorded by Atlas: *"ไปเลย"*.

## 2. Problem
QA's session safety rule bars entering a password or token on `som.develyst.online` or uat, even on the owner's word, so the running system can't be tested (TEST-137: 10 items NOT_TESTED). The owner won't be the sign-in step for each test.

## 3. The shape he chose
- A per-deploy secret URL. It regenerates every deploy; he deploys, copies it and hands it over.
- Opening it logs that browser session in as the account it was minted for. QA doesn't type anything.
- He sets the account and the timeout at mint time. The default timeout is an env value; uat's is shorter than sid's.

## 4. Requirements (the SA designs how)
1. **Off by default; sid and uat only.** The route exists only when its env value is set; otherwise 404.
2. **Refuses to boot** if the flag is on and the host is neither sid nor uat.
3. **Test accounts only**, never a real customer's or the owner's. On uat the account is read-only.
4. **Sends nothing real.** The account can't trigger LINE or email. `SYSTEM-FACTS.md`: sid and uat share one LINE channel and real people are linked (recorded 09-01; SA confirms today's state).
5. **Every mint and use is logged:** account, time, IP, which URL (not the URL in full).
6. **Front office and back office each have their own door.**
7. **Unguessable, single-use, self-expiring;** never committed and never printed in full in a log.
8. **`.env.example`** lists every new key with one line saying what it is for.

## 5. Corrections to the source, for the SA to carry (Porter, told to the owner 11-05)
- **The URL IS a secret.** The source says no token passes through any agent's hands. A bearer URL does, and it stays in the transcripts of every session it crosses. So single-use and a short expiry are the real protection. Design for the shortest path from the owner to QA, and say whether a used or expired link is worthless when found in a transcript.
- **"Read-only test account" doesn't limit what can be read on uat.** Uat holds real children's and parents' data. A leaked link in its window exposes whatever that account can read. Say what the account can see, and whether it can see less.
- **uat activation is the owner's act,** separate from the deploy of this code. He was told that พี่ฟีน doesn't know about this door; telling the customer is his decision.

## 6. Do this first: the early try, before the whole build
Tanya opens one such link once on sid, to confirm her session accepts it. **Not known yet:** her safety rules may treat this as entering a token, or refuse it for another reason. If she can't, stop and report; don't argue with the rule or look for another door. Nobody works around her refusal. The SA defines the smallest build that makes this try possible.

## 7. Acceptance
- **AC-1:** flag unset ⇒ both doors return 404 (sid-shaped and uat-shaped config).
- **AC-2:** flag on with any other host ⇒ the app refuses to boot.
- **AC-3:** a minted link logs in as its account only, once. Second use, or after expiry ⇒ refused and logged.
- **AC-4:** a real or owner account can't be minted.
- **AC-5:** on uat config, every write by the door's account is refused, and no LINE or email leaves.
- **AC-6:** mint and use appear in the log without the full URL.
- **AC-7:** the normal login is unchanged.
- **AC-8:** Tanya opens a link on sid in her own session and runs TEST-137's login items.

## 8. Out of scope
Any change to QA's read-only rule on uat. Any way of entering a password by script. Turning on uat. Git only on the owner's word; deploys stay his.
