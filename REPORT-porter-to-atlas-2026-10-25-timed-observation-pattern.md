# REPORT: @Porter (smart-scheduler PM) → @Atlas, 2026-10-25: a pattern worth a skill. QA proved a TIME-dependent bug by scheduling her own observations
**Owner, verbatim:** *"เห้ย เท่ ว่ะ ส่งไปบอก ATLAS หน่อยว่าทำแบบนี้ ได้ด้วยนะ ช่วยให้เขา คิด ไอเดียดีๆ ทำ skillเด็ดๆ ที่ช่วยงานเราได้ หน่อย · บอกเขาไป เดี๋ยวฉันไปคุยต่อเอง"*. **The owner asked for this report and will talk with you about it himself.**

## The case (REQ-128, smart-scheduler)
- A customer reported: *"slow from about 15:00, and we get logged out now and then"*.
- **Two kinds of evidence were needed that a one-shot test can't give**:
  - **time-of-day behaviour** (is it slower in the afternoon?);
  - **elapsed-time behaviour** (does a login die after N hours?).

## What Tanya (QA) did (TEST-117), on the customer's system, READ-ONLY
1. **A baseline at night** (01:58): login, the schedule page, a week change, and the `/calendar` API timed, 3 runs each, with the median. 0 errors.
2. **She scheduled her own later passes** at 10:03, 16:03 and 18:03, the same recipe each time, so the afternoon claim gets numbers instead of opinions.
3. **A long-session watcher:** she logged in at 02:00:44 and kept the tab alive.
   - She decoded the API token's own expiry (`exp` = 14:00:44, exactly 12 h; no `iat`). That turned the SA's code-level suspect (*"token 12 h vs session 30 d"*) into a dated prediction.
   - The watcher records the actual first 401 / logout, so the prediction is tested, not assumed.
4. **In parallel:**
   - the SA ranked app-side suspects from code (file:line), with no fix before the evidence;
   - the owner checked the server (it turned out dev tools were running on the customer's box: CPU 30 % → 3 % once closed);
   - 4 bare-SQL counts ruled out "big tables".

**Why it worked:** each angle produced a *checkable prediction*, and the timed observations settle it with numbers at the times the customer named.

## Skill ideas for you to judge (the owner's request: "skill เด็ดๆ")
1. **`timed-observation`**: run the same read-only probe at chosen clock times (or every N minutes for a window), store a time series (timings + error codes), and report the deltas against the baseline. It would use the scheduled-task / wake-up tools rather than a role sleeping in a loop. The guard rails: read-only, normal-use load only, no hammering.
2. **`session-lifetime-probe`**: log in once, decode the token / cookie expiry claims, predict when the session should die, keep it alive, and record the actual death. That proves or kills "users get logged out" in one run.
3. **`prediction-first-debug`** (SA + QA pairing): the SA states each suspect as a falsifiable, dated prediction (*"if L1, the first 401 ≈ 14:00"*), and QA's job is to test exactly those predictions. This pairs with the existing systematic-debugging flow.
4. **`customer-env-hygiene-check`** (owner-run checklist): what else runs on the customer's server (dev tools, games, agents), with CPU / RAM before and after. Today's biggest find came from this, by accident.

## Constraints any of these must keep
- QA stays read-only on the customer's system; every write is a DATA REQUEST.
- No passwords typed on non-local hosts, except under a written, scoped owner exception (as TEST-111 had).
- Long-running watchers must not hold a desk's session busy for hours, or burn the app's send cap (see the 10-22 report on capped nudges).

## Evidence
- `smart-scheduler/ai-worker/requirements/REQ-128-uat-slow-afternoons-and-logouts.md`;
- `tests/TEST-117-*`;
- `inbox/PM.md` (Sober's ranked read 10-25, Tanya's pass-0 + long-session entries);
- `log/2026-10-25.md`.
