# REQ-128: uat is slow from about 15:00 and users get logged out (customer report)
**Intake:** BooBee_NS (newly added to the group by ฟีน), LINE, 2026-10-25 (or 10-26) 11:07 (the owner's screenshot). Verbatim:
> *"คุณโด่งครับ ขออนุญาตแจ้งเรื่องการใช้ระบบนิดนึงนะครับ 4-5 วันที่ผ่านมา ในหน้าตารางค่อนข้างจะมีความหน่วงๆนิดนึงนะครับ ช่วงเช้ายังสามารถใช้งานได้ปกติ แต่พอเริ่มช่วงประมาณ 15:00 น ยาวๆไปเนี่ยเริ่มจะเข้าหน้าเว็บได้ช้าลง เปลี่ยนหน้าหรือว่า Search หาข้อมูลในหน้าตารางได้ช้าลง และมีการเด้งออกจากระบบเป็นระยะครับ รบกวนหรือเช็คให้ด้วยนะครับขอบคุณครับ"*

## What he reports (his words; the cause is NOT known)
- For the last **4–5 days**: the **schedule page** is slow. **Mornings are fine; from about 15:00 on** it gets slow: page loads, page changes, search.
- Users **get logged out** from time to time.

## Matching evidence we already have
- Tanya's uat read-only smoke, **2026-10-22**: *"2 of 3 runs couldn't log in, and one request got a 522"* (522 = the CDN could not reach the origin server in time). Recorded in `log/2026-10-22.md` / `inbox/PM.md`.
- uat releases in the window: 10-21 (REQ-125 ruling B + 829, migration 0071; TASK-830), 10-22 (TASK-747 + Palm's front). **No link is claimed.**

## Order (three angles at once; nothing to the customer about a cause before it's confirmed)
1. **The server (Otto, through the owner):**
   - the shared server's load around 15:00–20:00 (CPU / RAM / disk / DB connections; other apps or jobs on the same box);
   - PM2 restarts or crashes (a restart can log users out);
   - nginx / CDN 522 / 5xx counts by hour.
2. **Tanya, uat, READ-ONLY:**
   - time the schedule page, a week change and a search (and the `/calendar` + search API) at **~10:00 and again ~16:00 / ~18:00**;
   - record every 5xx / 522 / login failure with the time. Numbers only.
3. **Sober (the app side, from code + Tanya's numbers):**
   - why would a session end on its own? (token / cookie lifetime, a restart wiping sessions, a 401 on a timeout);
   - is any calendar / search query heavy or unindexed, or newly added in the last week (REQ-125 / 123 reads)?
   - any polling by the front?

## Sober's read (10-25, `inbox/PM.md`): ranked suspects, no cause claimed
- **Logouts: L1** (the API token expires after 12 h, the front session lives 30 days, and any 401 signs the user out); L2 a JWT_SECRET change on a restart; L3 ruled out (a slow call ≠ a 401).
- **Slowness: S1** no client cache + refetch on every focus / page change (load grows with staff activity, which peaks after school); **S2** the heavy week-calendar read; **S3** ILIKE search; **S4** the outbox poll every 15 s on an unindexed status; S5 the server cron; nothing new on the hot path.
- **Pending:** the owner's 4 bare SQL counts; Otto (crontab, PM2 restarts, CPU / RAM / DB by hour, is JWT_TTL_SECONDS set y / n); Tanya's TEST-117 incl. the 12-h logout step.
- **Sizes once confirmed:** L1 ≈0.5–1 d (needs the owner's ruling on the login length), S1 ≈1 d, S3 / S4 ≈0.5 d each.

## Owner's data, 2026-10-25
- **The customer's server is NOT under Otto** (*"ยังไม่มี otto ที่ server ลูกค้า"*): a Windows VM, Xeon E5-2690 v2, 6 vCPU, 16 GB, up 98 days.
- **The owner had Claude Desktop, VS Code and Steam running ON that server**: CPU ≈30 %, RAM 40–50 %. After closing them: **CPU 3 %, RAM 3.5 / 16 GB (22 %)**. ⇒ **A likely contributor** (desk sessions run busiest in the afternoon too). Not proven; Tanya's afternoon timings will show it.
- **DATA REQUEST answered (uat):** notification_outbox SENT 7,212 + SKIPPED 2,440 (no PENDING) · bookings 4,573 · line_webhook_events 1,923 · students 653. ⇒ **The tables are small; S3 (search) and S4 (the outbox poll) are minor.**
- **Still open:** L1 (the 12 h token vs the 30-day session) is independent of load. Confirm via TEST-117's logout step; the fix needs the owner's ruling on how long a login lasts.

## Owner ruling, 2026-10-25: a login lasts **7 days** (verbatim: *"A. 7 วัน"*)
- **L1 fix = TASK-836** (Team A): the API token and the front session get ONE lifetime of 7 days (or a silent renewal inside 7 days), so a working user is never thrown out mid-day. After 7 days, a clean sign-in.
- **Built now; ships after TEST-117's logout step confirms L1** (the expected first 401 ≈ 14:00:44). S1 (cache) waits for the afternoon timings.
- **TASK-836 note (10-25):** the env sets `JWT_TTL_SECONDS=43200` on the servers. **OWNER STEP at deploy: set it to 604800 (or delete the line) on uat + sid; never empty; JWT / NextAuth secrets untouched.** `.env.example` → 604800 (granted). The code hardens empty / garbage values to 7 days.

## TEST-117 (10-25): the long session was logged out at **09:33** (+7.55 h), NOT at the 12-h token expiry ⇒ **something else ended it between 09:23 and 09:33.** L1 is still real (12-h token vs 30-day session) but is NOT this event. Ask the owner: a server restart / deploy / app closing at ~09:23–09:33? Pass 1 at 13:44: fast, 0 errors (≈ baseline). **TASK-836 committed (43da846 / 46c6ee1), not deployed.**
- **Correction (10-25):** the 09:33 logout coincided with the OWNER'S machine losing internet (where Tanya's watcher runs) ⇒ an artifact, not a uat event. L1 stands on the decoded token (12 h). **Decision: deploy TASK-836 to sid now** (+ the env step); its gate re-tests the lifetime.

## TEST-117 (10-25): night 2.1 s / 13:44 2.2 s / 17:55 2.65 s for the schedule; the API ≈0.55–0.66 s; 0 errors. **No afternoon slowdown seen after the owner closed Claude Desktop / VS Code / Steam on the customer's server** (a Sunday, one sample). Re-check on a weekday afternoon (Tanya) before closing. L1 = TASK-836 (sid ✅, the uat deploy pending).
