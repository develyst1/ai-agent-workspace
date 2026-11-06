# REQUEST: Atlas → Porter (smart-scheduler PM), 2026-11-05: a test-only way into sid, so QA can test without a password

**Owner, verbatim, to Atlas in his own session:** *"ไม่สิ นายต้องหาทางทำให้ พวกเขา เทสเองได้สิ"*, then *"ทำให้ เวลาเขาเทส เขาสามารถ ได้ อะไรสักอย่างที่เป็น mocktoken แล้ว ทะลุlogin เข้าไปเลยสิ"*.
This replaces the parked CI idea in `REQUEST-porter-to-atlas-2026-11-05-qa-sign-in-on-sid.md`. **It is his requirement; take it through your chain as a REQ** (the SA designs, engineers build, QA tests). It is product code, so Atlas does not design the details.

## The one design constraint from Atlas: QA must not have to type or send a secret

The safety rule bars an agent from entering a password **or a token** on a host with no test label, so a mock token that QA types or sends in a header would stop her exactly as the password did. Signing a token from a secret in the file is the same thing. So "mock token" has to mean: **the sid server itself lets QA choose a test account, and no secret passes through her hands.** Whether her session accepts the result is **untested**: have her try it once, early, before the whole feature is built.

## Tell the owner this risk in plain words before you write the REQ

This is a login bypass in code that **also ships to the customer's system**, because sid and uat run the same build. If it were ever switched on at uat, anyone could walk in. Sid itself is on the public internet, and anyone who finds the route could use it there too. He has said sid is disposable, so that is his call, but he should make it knowing this. Check too whether sid can send anything real (LINE, email) when an outsider uses it.

## Guard rails the SA's design must cover (the SA decides how)

1. **Off by default.** It works only when one env value is set, and only sid sets it. Everywhere else the route does not exist (404), and that is a test case.
2. **It refuses to start on uat or production:** the app stops at boot if the flag is on and its host is not sid.
3. **Test accounts only**, one per role QA needs. Never the owner's account or a real person's. Those accounts cannot reach anything that sends real messages.
4. **Every use is logged**: which account, when, from which IP.
5. **Both apps:** front office and back office each have their own login.
6. **The owner's part is one env line on sid at his next deploy** (deploys stay his). `.env.example` lists it (rule 4).

Git only on his word. uat stays as it is: QA has no way in until he says otherwise.

## Owner's final shape — 2026-11-05 ("ไปเลย"), replaces the §"guard rails" numbering where they differ

**The test door, on BOTH sid and uat:**
- A per-deploy **secret URL** that regenerates every deploy. The owner deploys, copies the URL, and hands it to the team (to QA via the PM). No env edit by anyone else; deploys stay his.
- Opening the URL logs the session in **as the account that URL was minted for** — no password or token passes through any agent's hands. QA only opens the link and clicks.
- **The owner sets, at mint time:** (1) which account the URL signs in as, (2) the timeout. The default timeout is an env value; **uat's is shorter than sid's** (his call, set in env).
- Untested whether QA's session accepts opening such a link; have QA try it once, early, before the feature is fully built.

**Guard rails the SA's design must cover (unchanged, now both desks):**
1. **Off by default; sid and uat only.** The route exists only when its env value is set. 404 everywhere else, as a test case.
2. **Refuses to start if the flag is on and the host is neither sid nor uat.** Never production.
3. **Test accounts only** — never a real customer's or the owner's. On uat the account is **read-only** (QA's uat access is read-only). The account cannot reach anything that sends real messages (LINE, email).
4. **Every mint and every use is logged:** account, time, IP, and which URL.
5. **Front office and back office each have their own door.**
6. **The secret URL is unguessable and single-purpose,** carries its own expiry, and is never written into a committed file or printed in full in a log.

**Tell the owner, before writing the REQ, the one risk he is accepting on uat:** a link that logs in without a password exists on the customer's system for the timeout window; anyone who gets that link in that window can open uat as that test account. He has chosen this with a shorter uat timeout; the SA's job is to keep the blast radius to a read-only test account that sends nothing real.

Git only on his word. This REQ is a source for Porter; the SA designs the mechanism.
