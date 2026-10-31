# REQ-132: "คอร์สที่ใกล้ใช้ครบ: 48" in the 08:00 digest — can admins see WHO?
- Status: OPEN, with Sober (Team A, REQ-023's owner) for a code read
- Requested: 2026-10-27 09:02 by **กุ้ง**, a customer admin like Khwan (per the owner, 2026-10-27: *"นี่ คือ admin อีกคนนึง เหมือนขวัญ ชื่อกุ้ง"*), in the LINE group, with a screenshot of the 27 Oct digest (that line boxed)
- Verbatim: *"@Dong_08 สอบถามนิดนึงค่ะ ไม่ทราบว่าตรง คอร์สที่ใกล้ใช้ครบ เรามาสามารถกดดูรายชื่อของคนเหล่านี้ได้ไหมคะ"*

## Already exists (REQ-023, grep before intake)
- The 08:00 digest = counts only. The names are meant to sit behind the login, in the web "needs attention" panel (`AttentionContent.tsx`), per REQ-023's privacy design.
- **Porter's code read (not confirmed by the SA):**
  - the panel lists the 48 items for `nearly_finished_courses`, but each label is only `course <size> · เหลือ <n>` (`lib/attention.ts:278-289`), with **no child name and no link** (`CHECK_LINKS` has only `pending_teacher_links`);
  - so today she can open the list but can't tell who.
  - The threshold is "≤ 2 sessions left" (`NEARLY_FINISHED_SESSIONS = 2`).

## Asked of Sober
1. **Confirm from code:** what exactly does the panel show for this check today, and where is it in the menu (the exact path / Thai label)?
2. **Self-serve first:** is there any page where an admin can already see these students today (a course list / filter)?
3. **If not, size the smallest change:** the child's name (+ parent) on each item and/or a link to the course. The same question applies to the sibling check "คอร์ส/วอยเชอร์ที่ใกล้หมดอายุ: 43" (same label shape).
- **No customer message until the answer is known** (owner rule).

---
## @Sober (SA) — 2026-10-27 — answers 1–3, from code (analysis only)
**1. What she sees today, and where.** Porter's read is CONFIRMED.
- The LINE digest gives counts only (by design: names stay behind the login).
- Behind the login, the **Attention** page (menu `menu:attention`, `GET /attention`) lists the items. But each item is labelled:
  - **"ใกล้ใช้ครบ"**: `course <size> · เหลือ <n>` (back `lib/attention.ts:278-289`);
  - **"ใกล้หมดอายุ"**: `course <size> · <expiry>` / `voucher <hours>h · <expiry>` (`lib/attention.ts:259-275`);
  - **no child, no parent, no link.** The front prints the label as is; `CHECK_LINKS` has a link only for `pending_teacher_links` (`AttentionContent.tsx:13-15`).
- "ใกล้ใช้ครบ" = 2 or fewer sessions left on a live course (`NEARLY_FINISHED_SESSIONS = 2`, `lib/attention.ts:21,50-53`).

**2. Self-serve today: only partly. Not practical for 48.** Bookings → **"คอร์ส + สิทธิ์การลา"** → the **Active** tab shows every live course with its used/remaining ring and expiry, and has a name search. But:
- there is **no filter or sort for "2 or fewer left" or "expires soon"** (the list only groups live before ended);
- so she would read every active card to find the 48.
- **Workable meanwhile:** the owner can run a read-only SQL for her (the list with names). I'll write it on request.

**3. The smallest change: put the child's name on each Attention item, for BOTH checks** ("ใกล้ใช้ครบ: 48" **and** "ใกล้หมดอายุ: 43"; the same gap, the same fix).
- **BE (≈ 0.35 d incl. +10%):**
  - each item's label becomes `<child's nickname or name> · course <size> · เหลือ <n>` (and `<child> · course <size> · <expiry>` / `<child> · voucher <h>h · <expiry>`);
  - a DUO course names both children, as every other notice does (the ONE name rule);
  - **reuse the existing name helper; no new words** (the tokens "course", "เหลือ", "voucher" are already on screen);
  - **the LINE digest stays counts-only** (privacy, unchanged);
  - tests by value + a set.
- **FE (optional, ≈ 0.25 d):** make each item a link to that course in Bookings (the course list with the search pre-filled by the child's name, or the course's plan window). It needs no new words (`attention.open` exists).
  - **Without it**, she still sees WHO, and searches the name herself.
- **Total ≈ 0.35 d (names only), or ≈ 0.6 d with the links.** Parent / phone on the item: **not recommended.** It adds personal data to a list; the course card already has it one click away.
- Team A, numbers from 840 on Porter's GO.

---
## Owner's decision — 2026-10-27: **B** (names + links)
- The owner first worried about the LINE message (*"ไม่อยากแก้อะไรเลยอ่ะ ในไลน์ เพราะ ข้อความมันจะยาวมั้ยอ่ะ"*). Porter confirmed that A/B leave the LINE digest **unchanged** (counts only). Then the owner wrote: *"B"*.
- **Scope = Sober's option 3 with the FE link:**
  - the child's name on each Attention item, for BOTH checks ("ใกล้ใช้ครบ" and "ใกล้หมดอายุ");
  - each item links to that course in Bookings;
  - LINE digest unchanged; no parent/phone; no new words.
- ≈ 0.6 d. Team A, from TASK-840. **GO given to Sober 2026-10-27.**
- Customer reply to กุ้ง: **only after it is live on uat and Tanya passes** (no holding message).

## Owner — 2026-10-27: TASK-842 rides with this release
- TEST-126 PASS on sid. Tanya found a pre-existing hole, which Sober confirmed: both course checks count ended/paused courses (uat ใกล้หมดอายุ 15 of 44).
- The owner picked *"ก"*: fix it in TASK-842 (BE, ACTIVE-only; the digest count drops ≈44→29), then re-test on sid before git.

## ✅ LIVE on uat 2026-10-27
- ขึ้น git: back 31cd2d0, front e44c38a.
- uat smoke (back) PASS: 29 / 49, all name-led and ACTIVE.
- The first front deploy did not serve 841. The owner redeployed the front; the re-check PASSED (78 links, 0 errors).
- กุ้ง reply: `COPY-DRAFT-kung-req132-who-is-nearly-finished-2026-10-27.md`, waiting for the owner to send.
- Open: tomorrow's 08:00 digest (counts only, ใกล้หมดอายุ ≈ 29), from the owner.

- 2026-10-27: reply + screenshot SENT to พี่กุ้ง by the owner (*"ส่งพี่กุ้งแล้ว"*). Only open item: tomorrow's 08:00 digest check (counts only, ใกล้หมดอายุ ≈ 29). Close REQ-132 after that.

## ✅ CLOSED 2026-10-28
- The live digest check could not be seen: the owner *"ไม่เห็น ข้อความไม่ขึ้นใน OA เหมือนไม่มี admin อ่ะ"* (the OA web chat shows no 08:00 push).
- Closed on TEST-126 (the code proves counts only) + the uat smoke (29 / 49).
- Known fact: พี่กุ้ง DID receive the 08:00 digest on 10-27 (her screenshot = this REQ's intake). Re-check only if a customer reports the numbers.
