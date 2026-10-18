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
