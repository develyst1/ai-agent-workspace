# REQ-124: The BACK serves Palm's SOM dashboard (`GET /reports/som`) + the Daily Report's new "Others Program" section
**Owner, 2026-10-18:** *"เริ่มงาน back ของปาล์มได้เลย"*. He merged Palm's front into `dong` (merge `e314303`).
**Palm, to the owner (Messenger, 10-18):** *"ไฟล์ข้อมูลสำหรับ back คือสองอันนี้นะ ให้ผมเอาล่าสุดขึ้น dev ไปก่อนเลยมั้ยโด่ง"*, naming `backend-daily-report.md` + `backend-som-dashboard.md`.
**The same model as REQ-119:**
- the SCREEN is Palm's (`smart-scheduler-front`, **read-only** for us);
- the team builds the **BACK only**;
- Palm's docs are the contract;
- **our §9-style checks against the real back come first**, and every mismatch comes to @Porter, never to Palm directly.

## Sources (`smart-scheduler-front`, at `e314303`)
1. **`docs/backend-som-dashboard.md`** (454 lines, NEW), `GET /reports/som`:
   - §0 section order;
   - §0.1 page filters (*"client ตกลง 2026-10-17"*);
   - §1 Today;
   - §2 Existing Customers;
   - §3 New vs Renewing, with **6 cards + a NEW list endpoint** (§3.2) and the client answers (§3.3, 10-15);
   - §4 Coach Capacity;
   - §5 Demographic: new age bands (§5.1) and **District** (§5.2, which depends on REQ-118's area codes);
   - §6 Activity / Program.
2. **`docs/backend-daily-report.md`** (now 347 lines). **Only the delta since REQ-119** (`89774a9` → `e314303`, +70 lines) is new: **§10 "Others Program"** (10.1 client need · 10.2 mapping · 10.3 counting · **10.4 values the FE uses, NOT confirmed with the client** · 10.5 checklist).
3. Palm's front code for the shapes/fallbacks (read-only).
4. **Customer decisions that bind** (the SA cross-checks Palm's doc against them; conflicts come to me):
   - REQ-117 / the 10-11 meeting §3 (Dashboard / Overview);
   - REQ-119's ruling (Total booked = Confirmed + On leave);
   - REQ-118 (area codes, for District).

## Rules
- The back matches Palm's contract **exactly** (field names, shapes, filters). If one release must carry all fields at once (as with REQ-119's switch-over), it does.
- **Palm's "not yet confirmed with the client" values (10.4, and any similar in the SOM doc) stay at his values** until the owner or customer rules. They are listed for the owner, not decided by us.
- **The old readers stay byte-identical** unless the owner says otherwise (as REQ-119: SOM report, day-end job).
- 🚫 No front file edited. No change to Palm's docs.

## Order
1. **SA (Team B, Silver; they did REQ-119):**
   - read both docs;
   - run the §9 / §10.5-style checks against our real back (file:line);
   - list the mismatches, the conflicts with customer rulings, and the "unconfirmed" values;
   - size it (+10%);
   - give the claims.
2. Porter grants; Bob builds; Silver verifies; the owner commits → sid → **Tanya: API = her independent recount + screen = API**, by value, Palm's screens on sid → uat.
3. Palm is told about mismatches through the owner (a COPY-DRAFT to Palm, like 10-12).

## Owner rulings, 2026-10-18 (verbatim: *"K1 ตามปาล์มว่ามาเลย · K3 เอาไปถามปาล์มเขียนข้อความมา · K4 ถามขวัญ · K5 ทีหลังได้"*)
- **K1 = Palm's:** Active Course / Voucher counts **people** (one child with 2 active courses = 1).
- **K3:** asked **to Palm**: `COPY-DRAFT-palm-req124-som-2026-10-18.md`.
- **K4:** asked **to Khwan**: `COPY-DRAFT-khwan-district-subdistrict-2026-10-18.md`. Until then, **district only** (Palm's).
- **K5 (the non-renewal Remark):** **later**. `remark: null`, not built.
- **D1 (Porter, 10-18):** ECA/OTHER head count once per class (contiguous hours). It goes to Palm in the same note.

## Status, 2026-10-19
- **uat BACK LIVE** (`4762aa7` + `82a1988`, no migration). TEST-109 + re-check PASS on sid.
- **uat FRONT held** (Porter's advice, owner agreed): it waits for Palm to switch the 5 old-field cards (Confirmed, Active Course, 1st Trial, Total, Renew Course; the Palm note's item 13) and give his uat OK, then Tanya re-checks the screen on sid, then the uat front goes up.
- **uat smoke PASS (Tanya, read-only, 10-19):** every new section answers, the old fields are intact, the NvR lists match their cards, and `kidsByProgram` is present. The BACK is done. Open item: the uat front, after Palm's switch.

## K4 answered: Khwan, 2026-10-19 20:55 (LINE, the owner's screenshot), verbatim *"B ka"*
- She was asked (COPY-DRAFT-khwan-district-subdistrict-2026-10-18.md): A = district only · **B = district, and you can click through to the sub-district**.
- **Ruling: B.** The back adds the sub-district breakdown **inside each district** as an **additive** field. Palm's existing district fields stay unchanged. Palm builds the click-through on his screen.
- Silver sizes it and proposes the field shape. Palm is told the shape through the owner.
- **2026-10-19:** the Palm note and the K4 question were sent by the owner. The commission-picker answer was sent by the owner in his own words. Porter's draft was not used.
- **2026-10-19:** Palm switched the 5 cards (front `692f798`, via develop → dong). Tanya's sid screen check PASS. **Next: uat front `692f798`.** Still open: Palm's district → sub-district click-through, and the K3 age-band answer.
- **2026-10-19: LIVE on uat** (back `6bac497` + front `692f798`). Tanya's uat smoke PASS. **Open:** Palm's district → sub-district click-through (the back is ready), and the K3 age-band answer from Palm.

## 2026-10-21: the customer asks "is the Daily Report data correct now?" (LINE group, the owner's screenshot), verbatim
- **ฟีน (CEO), to Palm:** *"@Palm ตอนนี้หน้า daily report ข้อมูลทั้งหมดตรงแล้วใช่ปะคะ พวก group ด้านล่าง · ถ้าส่วนไหนเสร็จแล้ว ดูได้แล้ว ปกติจะมาอัพเดท ขวัญใช่มั้ยคะ @All"*
- **Palm:** *"Dairy report ส่วนหน้าจอเสร็จเรียบร้อยแล้วครับ ส่วนเรื่องความถูกต้องของข้อมูลจะเป็นส่วนที่โด่ง @Dong_08 ดูแลครับ ตอนนี้น่าจะเข้าไปดูและตรวจสอบได้เลยครับ"*
- **ฟีน:** *"สรุปหน้านี้ข้อมูลถูกแล้วเนอะ @Dong_08"*
- **Owner:** *"ดูเรื่องนี้ ร่วมหัว กับทีม ทำความเข้าใจ"*.

**What we can prove today (files):**
- The main cards: TEST-101 §uat (10-13), a by-value recount on uat, 78 reports, PASS.
- The **Others Program** section (`kidsByProgram`, REQ-124, live on uat since 10-19): recount PASS on **sid** (TEST-109), but only a SMOKE on uat.
- Palm's front changed since 10-13 (`692f798` and maybe more).
- **"พวก group ด้านล่าง"** most likely = the Others Program cards at the bottom. Not confirmed.

**Order:**
1. **Tanya: a uat READ-ONLY recount** of the Daily Report on the current uat build, for 3 recent real days (a weekday, a weekend, a camp/ECA day), All teachers + a few coaches. **Every card, incl. Others Program: API = your recount = the screen.**
2. **Silver: a plain definitions list** (what each card and each Others Program card counts, incl. the agreed rules: Total booked, ECA once per class, camp weeks without a coach, what is NOT counted). Porter turns it into Thai for the owner's reply.
3. **Then Porter drafts the owner's answer to ฟีน.** It answers "is it correct", by evidence, plus what each number means.
- **Process note for the owner:** ฟีน expects *"ถ้าส่วนไหนเสร็จแล้ว … มาอัพเดท ขวัญ"*.

## 2026-10-21: Palm's district → sub-district click-through
Palm (10-20 22:46): *"ผมปรับตามที่คุณส่งมาขึ้นไปละ"* = merged into `develop`. **Next:** the owner merges develop → dong + deploys the sid front → Tanya checks it against `subdistrictByDistrict` → uat.
