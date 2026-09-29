# TEST-075 — FULL ROUND on sid (2026-09-27): Undo · three admin actions · Shop-QR multi-select · DUO · Camp · check-in pages · REQ-109 teacher LINE · coach notices — **on the phone too**

- Tester: Tanya (QA). Env: **sid** (`som.develyst.online`). Surface named per row: 📱 = owner's demo phone (CPH2735, demo OA @125vuzsj), 🖥️ = desktop browser, 🔌 = API.
- Source: `inbox/QA.md` 2026-09-27 dispatch, `DEPLOY-sid-2026-09-26.md` §6, `requirements/REQ-109-teacher-line-round.md`.
- Build: owner deploy 2026-09-27 — migrations 60, BE+FE, outbox worker, orange teacher menu (4 re-linked).
- Evidence: `project-docs/qa-2026-09-27/`.
- Round started 02:30 local (Sun 27/09). Rows that need a class **inside the check-in window** can only run from ~08:30.

## Safety facts established before any write
- Only ONE teacher on sid is LINE-linked: **Kwan** (`0de6ab87`) = a real person. **Any class with Kwan as a coach is excluded** from every write in this round (a leave/undo/cancel notifies every coach, TASK-510).
- Demo family `07735dba` (0900000092) is LINE-linked to the demo phone; students มิลล่า, มิลลิม, asda `267a8c9c`, temp `b767367c`.
- Old leave fixtures to clear: asda 24/10 `793f2aad` + 31/10 `7ce723ba` (Balance Play Group, coach **Camp** only, unlinked); temp 01/10 `9f31a756` (Private SURFSKATE, coach **Bank** only, unlinked). Kwan on none of them.
- The FE repo has **no control calling `POST /bookings/:id/undo`** (TASK-492's Undo); the only on-screen undo is BookingModal's ATTENDED branch (TASK-514). To be confirmed on the deployed UI.
- adb cannot inject Thai text ⇒ a literally *typed* Thai command needs a human; typed checks use the English aliases in the same command list (`my schedule`, `schedule`, `register`, `teacher`, `calendar`).

## Results

### A. Undo (🔌 API `POST /bookings/:id/undo` — see B for the missing screen control)
| Row | Verdict | Evidence / reason |
|---|---|---|
| Old fixtures cleanup (asda 24/10 `793f2aad`, 31/10 `7ce723ba`, temp 01/10 `9f31a756`) | 🟠 **BLOCKED by design** | All three → **409 `UNDO_LEAVE_CHARGE_UNKNOWN`** *"ระบบไม่ทราบว่าการลานี้ใช้โควตาลาหรือไม่ (ลาก่อนมีการบันทึก) — กรุณาแก้ไขด้วยตนเอง"*. They are pre-migration (legacy) leaves: the Undo refuses to guess whether quota was used (TASK-492 contract §B). **Cannot be cleared with Undo** ⇒ a DATA REQUEST / manual correction. Unchanged. |
| A1 mistaken leave ⇒ CONFIRMED | ✅ PASS (🔌) | Fixture `0e0947d0` (temp, 1-HR, Bank, 05/10 10:00): confirm → leave → Undo **200** `kind:"leave"` → status **CONFIRMED**. |
| A2 refund only if charged — *not-charged half* | ✅ PASS (🔌) | A 1-HR leave charges no quota ⇒ Undo returns **`leaveRefunded:false`**, `makeupCancelledId:null`. |
| A2 — *charged half* (a course leave within quota) | ⏳ | see below |
| A3 coach-hour held again | ✅ PASS (🔌) | `GET /slots/availability 05/10 10:00`: CONFIRMED ⇒ Bank **BOOKED** (clash = `0e0947d0`) · on leave ⇒ Bank **available** · after Undo ⇒ Bank **BOOKED** again (clash = `0e0947d0`). |
| A6 second Undo changes nothing | ✅ PASS (🔌) | Undo #2 → **409 `UNDO_NOT_UNDOABLE`** *"คาบนี้ย้อนกลับไม่ได้ — สถานะปัจจุบันคือ CONFIRMED (ย้อนกลับได้เฉพาะการลา หรือการเช็คอินของผู้ปกครอง)"*. Row stays CONFIRMED. |
| A3b hour re-booked meanwhile ⇒ refuse, naming it | ✅ PASS (🔌) | Leave → booked Bank 05/10 10:00 for campkid2 (`fca3e10f`) → Undo **409 `UNDO_SLOT_TAKEN`** *"ย้อนกลับไม่ได้ — ช่วงเวลา 2026-10-05 10:00 ของครูมีคาบของ campkid2 อยู่แล้ว"* (names hour + child; not the coach by name — minor). Cancelled `fca3e10f` → Undo **200**, CONFIRMED. |
| A7 settled day ⇒ refused clearly | ✅ PASS (🔌) | asda 26/09 leave `4e5fe236` → **409 `UNDO_DAY_SETTLED`** *"ปิดวันของวันที่ 2026-09-26 แล้ว — ย้อนกลับไม่ได้"*. No change. |
| A4 coach told / family NOT told | ⛔ NOT_TESTED | **LINE pushes are not arriving on the demo phone** (see Blockers #1). Silence on the family chat proves nothing while a positive-control push (the booking confirm) also never arrives. |
| A8 undo attendance ⇒ CONFIRMED, not ลา | ✅ PASS (🖥️, new FE 03:35) | ATTENDED row menu = **Undo attendance** + **Cancel booking** (distinct). Dialog: *"Undo this attendance? The session goes back to confirmed and the class returns to the family's balance. No leave is used, no make-up is added, and nobody is told."* → toast *"Attendance undone"* → row **CONFIRMED**. (Before the FE redeploy the old "Record leave/sick" also returned CONFIRMED — BE side.) ⚠️ KNOWN: label wording `ยกเลิก…`/final `ย้อน…` is TASK-517. `A8-new-attended-row-menu.png`, `A8-new-undo-attendance-dialog.png`, `A8-new-after-undo-toast.png` |

### B. The three admin actions are distinct
| Row | Verdict | Evidence / reason |
|---|---|---|
| Undo leave / check-in reachable on screen | 🟠 **BLOCKED** (Porter 09-27: escalated to Sober — the Undo FE was never cut) | No control anywhere calls TASK-492's `POST /bookings/:id/undo`. ON LEAVE row: *Attended* + menu *Overbook · Record leave/sick · Pause · Cancel booking* — **no Undo**. CONFIRMED row: *Attended* + *Move session · Record leave/sick · Pause · Cancel booking*. The Undo exists only in the API; an admin cannot reach it. (FE repo HEAD has no such control either — not only a deploy gap.) `B-modal-sickleave-no-undo.png`, `B-modal-sickleave-no-undo-menu.png`, `B-modal-confirmed-actions.png` |
| Cancel never reachable from Undo and vice-versa | ⚪ NOT_TESTED | Cannot be tested while the Undo has no screen control. |

### G. REQ-109 — teacher LINE (📱 demo phone linked as fixture teacher `qatt75`)
Link: typed `สมัคร` (Thai keyboard) → *"Please type "Next" to continue."* → `teacher` → *"Please type the teacher nickname as registered"* → `qatt75` → *"Your link request has been sent to staff ✅ You'll be told once it's approved"* → approved as super admin (`POST /teacher-link-requests/:id/approve` 200).
| Row | Verdict | Evidence / reason |
|---|---|---|
| Orange 2-cell menu | ✅ PASS 📱 | *ตารางของฉัน / My Schedule* · *ภาษา/ช่วยเหลือ / Language / Help*, orange, bilingual, **collapsed by default**. `G-teacher-menu-orange-open.png`, `G-teacher-menu-orange-collapsed.png` |
| `ตารางของฉัน` **tapped** ⇒ today + chips | ✅ PASS 📱 | `⏱️TODAY'S SCHEDULE:` · `▸ SUN / 27/09` · chips **วันนี้ · สัปดาห์นี้** · ปฏิทินของฉัน · ‹ เมนู. `G-tapped-myschedule-today.png` |
| `ตารางของฉัน` **typed** (Thai) | 🔴 **FAIL on first use — D1** · ✅ afterwards 📱 | 1st typed text after approval → *"ขอโทษค่ะ ขอส่งให้แอดมินช่วยดูนะคะ 🙏 … Sorry about that — I am passing this to an admin to help you. (To use the bot again, type: reopen)"* and the chat is **muted**. After `reopen`, typed `ตารางของฉัน`, `ตาราง`, `my schedule` all answer with today. `G-typed-thai-myschedule-today.png` (the failure), `G-typed-thai-myschedule-2nd-try-works.png`, `G-typed-en-myschedule.png` |
| Weekly view (chip `สัปดาห์นี้`) | ✅ PASS 📱 | `⏱️ THIS WEEK'S SCHEDULE` (Khwan's header exactly) · only **Confirmed + Attended**; Pending/Leave/Cancelled hidden. `G-chip-thisweek-weekly-view.png` |
| Khwan's format | ✅ PASS 📱 (one caveat) | English header + status words in a **Thai** chat (by design) · 3-letter day `SUN` · `@ 10:00` start only · program with no "Private" (`SURFSKATE`, `FREESKATE`) · `📝` note line only where set. Caveat: the subject `Balance Play (Private)` prints as stored (mixed case); Khwan's sample shows `BALANCE PLAY (Private)`. Cosmetic. Only one day in the week exercised (fixture teacher new; today is Sunday). |
| Today shows Pending / Leave / No-show | ✅ Pending + Leave 📱 · ⚪ No-show NOT_TESTED | No admin action creates NO_SHOW (day-end only). Cancelled 14:00 hidden in both views ✅. EXTENDED not exercised (needs a course make-up). |
| Help list = teacher commands | ✅ PASS 📱 | Tap *ภาษา/ช่วยเหลือ* ⇒ *"Switched to English ✅ / Available Commands: · My Schedule — Today's / This week's schedule · Calendar — Link to your full teaching calendar"* — the owner-approved EN text, teacher commands only. `G-help-tap-1.png` |
| Each advertised command works typed | 🟠 PARTIAL 📱 | `ตารางของฉัน` / `my schedule` ✅ (after D1). `calendar` and Thai-typed `ปฏิทิน` ✅ **reply arrives**, but its link is broken on the phone — **D3**. `G-typed-calendar.png`, `G-typed-thai-calendar.png`, `G-calendar-link-opens-wrong-site.png` |
| TH help list (2nd tap) | ✅ PASS 📱 | *"เปลี่ยนเป็นภาษาไทยแล้ว ✅ / คำสั่งที่ใช้ได้: · ตารางของฉัน — ตารางสอนวันนี้ / สัปดาห์นี้ · ปฏิทิน — ลิงก์ปฏิทินสอนทั้งหมด"* = the approved TH text. `G-help-tap-2-thai.png` |
| Monday auto digest (weekly format) | ⛔ NOT_TESTED | It is a push at Mon 08:15 — pushes are blocked (Blockers #1). |
| Kwan's chat not touched | ✅ | Kwan was the only linked teacher before and after; no write involved her classes. |
| Demo restored | ✅ 📱 | qatt75 unlinked (`DELETE /teachers/:id/line-link` 200); phone re-linked as parent: `สมัคร` → `Next` → `0900000092` ⇒ *"ผูกบัญชีผู้ปกครองสำเร็จ ✅ … Found your family — มิลล่า, มิลลิม, asda, temp"*; the 6-cell parent menu is back. `G-demo-restored-parent-menu.png` |

### Defects
- **D1 🔴 — a newly linked teacher's first typed message is swallowed into the admin hand-off.** Repro (sid, 03:13): clear a chat's link → `สมัคร` → `teacher` → nickname → admin approves → **type** `ตารางของฉัน` ⇒ hand-off text + chat muted (expected: today's schedule). Menu taps / chips (postbacks) are not affected, which hides it. `reopen` clears it; afterwards all typed aliases work. Surface: 📱 demo phone. Severity: MEDIUM — every coach's first typed command after linking, and the coach is told "passing this to an admin" for a valid command.
- **D2 🟠 — `reopen` answers a linked TEACHER with the CUSTOMER command list** (เพิ่มนักเรียน / คอร์สของฉัน / เช็คอิน / แจ้งลา). The TEST-073 nit, still present on the un-mute path. `G-typed-en-myschedule.png` (top). Severity: LOW.

- **D3 🔴 — the coach's Calendar link does not work in LINE, and opens another website.** The reply prints `webcal://som.develyst.online/api/calendar/<token>.ics`. LINE (Android) does not recognise `webcal://`, so it links only `develyst.online/api/calendar/<token>.ics` — **without `som.`** — and the preview card is titled **"kbtgkampushk2026"**. Tapping it opens `https://develyst.online/api/calendar…`, a different site showing "KBTG". The coach cannot subscribe, and the private calendar token is sent to the wrong host. Repro: linked teacher types `calendar` (or ปฏิทิน) → tap the link. Surface 📱. Severity: MEDIUM (the one action of an advertised command fails; token leaves the product). Likely pre-existing (REQ-016), newly advertised by REQ-109's help list. Also: this reply stays **bilingual** in an EN chat, unlike the others (minor).

### H. Coach notices — every coach of a co-taught class (🔌; pushes to the demo OA are blocked by quota until 1 Oct)
Fixture coaches are both **unlinked** (qatt75, qatt75b) ⇒ every notice is written as a **SKIPPED outbox row** — nobody reached. There is **no admin/API screen that lists outbox rows** (the backend reads the table internally only; the action response reports the PRIMARY coach's result only), so the per-coach proof needs the owner's read-only query below.
| Row | Verdict | Evidence / reason |
|---|---|---|
| Co-taught class (OTHER, qatt75 + qatt75b) confirm + **cancel** ⇒ both coaches | ⏳ DATA REQUEST | `9a7def1c` 06/10 09:00: confirm 200, cancel 200, each `notification: skipped (ผู้รับยังไม่ผูก LINE userId)` for the primary. Expect **2 teacher rows per event** in the outbox. |
| Co-taught **group** seat — leave / Undo (CLASS ON AGAIN) / cancel ⇒ every coach | 🔴 **FAIL (known, not built)** + ⏳ DATA REQUEST | Group row `2596a14a` has **qatt75 + qatt75b**; the walk-in seat `2b309ea4` (campkid2) carries **qatt75 only** ⇒ its notices can reach only the primary. This is the "Ek told, Nok not" gap; owner ruled 09-27 *every coach of the group* — not yet built. Ran: confirm 200 · leave 200 · **Undo 200 (`kind:leave`, CONFIRMED, `leaveRefunded:false`)** · cancel 200. |
| Push actually arriving on a coach's phone | ⛔ push blocked by quota (until 1 Oct) | Porter 09-27. |
**DATA REQUEST (owner, read-only, sid):**
```sql
SELECT booking_id, recipient_type, payload->>'kind' AS kind, status, idempotency_key, created_at
FROM notification_outbox
WHERE booking_id IN ('9a7def1c-4bec-4c41-b1e6-66d3bd8244d3','2b309ea4-04a5-4bdd-9ce1-bd8b9d9ba0d8','2596a14a-a72c-4749-91a6-34aa8551a72d')
ORDER BY created_at;
```
Expected if "every coach" holds: the OTHER booking's confirm and cancel each produce **two** `teacher` rows; the seat's rows show what the seat actually does today (one coach). **No `parent` row** for the seat's leave, Undo or cancel-by-leave-undo (family NOT told), except the parent copy of the confirm.

### C. Shop QR / chip / parent reply — rows that do not need the check-in window
| Row | Verdict | Evidence / reason |
|---|---|---|
| Parent-facing reply shows **no admin username** — a real page/response test | ✅ PASS 📱🖥️ | Fixture `55d424ab` (campkid2, 27/09 15:00, qatt75): confirm → **staff attend** (admin) → opened its parent link. Page: *"Already checked in · Student QA Camp Kid2 · Subject Private SURFSKATE · Teacher qatt75 · Time 2026-09-27 15:00–16:00"*. Raw `POST /api/checkin` response: `{"already":true,"booking":{date,startTime,endTime,student.name,subject.name,teacher.nickname},"remaining":null}` — **no `admin`, no `checkinSource`**. `C-staff-checkin-parent-page-phone.png`, `C-staff-checkin-parent-page-desktop.png` |
| Staff check-in has **NO** Shop-QR chip | ✅ PASS 🖥️ | Same booking's admin detail: 0 `[data-checkin-source]` elements. `C-staff-checkin-no-chip-modal.png` |
| Check-in page carries 6 fields, nothing missing on screen ("already" view) | ✅ PASS 📱 | The response above is exactly the 6 fields; the page renders Student · Subject · Teacher · Time — nothing blank or missing. The fresh-success view still needs a class in the window. |

**DATA REQUEST answered (owner, sid, 2026-09-27; relayed by Porter): 12 rows, all `SKIPPED`.** Per-row verdict:
| Booking | Rows | Verdict |
|---|---|---|
| `9a7def1c` co-taught OTHER (qatt75 + qatt75b) | `booking_confirmed` 2× teacher + 1× parent · `class_cancelled_teacher` **2× teacher** | ✅ **PASS — every coach is told on a co-taught cancel** (and on confirm). |
| `2b309ea4` = the **walk-in SEAT** in the co-taught group | `leave_notice` admin + **1×** teacher · `class_on_again_teacher` **1×** teacher, **no parent row** · `class_cancelled_teacher` 1× + `class_cancelled_parent` | ✅ a leave Undo tells the coach (`class_on_again_teacher`) and **not the family** (no parent row). 🔴 but only **one** teacher row per event: qatt75 (the seat's own coach) — qatt75b, the group's second coach, is never told. Confirms the known seat gap (owner ruled "every coach of the group", 09-27). |
| `2596a14a` = the **GROUP ROW** itself | none | Expected — no action was taken on the group row (every action was on the seat). Not a defect. |
| Why SKIPPED | — | ✅ Confirmed from the fixtures: qatt75 and qatt75b were **unlinked** when the actions ran (qatt75 unlinked 03:20), and campkid2's parent `b7146378` has **no LINE link** ⇒ nothing deliverable. Distinct from the demo-OA quota block. |

### Move notice (TASK-516/529) + group seat every coach (TASK-522) — run 2026-09-28 00:20, awaiting DATA REQUEST #2
| Row | Verdict | Evidence / reason |
|---|---|---|
| Move ⇒ a row for every coach + a family row | ⏳ DATA REQUEST #2 | `b67ce26d` 1-HR campkid2/qatt75 moved 07/10 10:00 → **08/10 11:00** (200) · `0fd5fba5` co-taught OTHER qatt75+qatt75b moved 13:00 → **14:00** (200). |
| Move wording byte-exact (coach `CLASS MOVED / ย้ายคาบ ‼️` … `Was :` · family `📅 ย้ายคาบเรียน:` / `📅 CLASS MOVED:`, English labels, no coach, `Was :`) | ⏳ | SKIPPED rows are never rendered and pushes are quota-blocked ⇒ render the stored payloads with the product's formatter once DATA REQUEST #2 returns them. |
| TASK-522: a walk-in seat's leave / Undo / cancel ⇒ rows for **both** group coaches | ⏳ DATA REQUEST #2 | New seat `8e4d8c56` on group row `2596a14a`: confirm → leave → **Undo 200 CONFIRMED** → cancel. The seat's DTO still lists **qatt75 only** — the outbox decides. |

### SPEC-095 §0 — coach calendar subscription device check (📱 Android CPH2735 / LINE / Brave; 2026-09-28 00:14–00:17; phone linked as teacher qatt75)
| Step | Result | Evidence |
|---|---|---|
| Calendar command ⇒ link to OUR host | ✅ typed `calendar` ⇒ reply links **`https://som.develyst.online/api/calendar/subscribe/<token>`**, fully linkified; preview *"ปฏิทินสอน · Teaching calendar — If the button does nothing…"* (**D3 fixed** — TASK-519). | `S-calendar-first-typed-after-link.png` |
| Subscribe page | ✅ opens on `som.develyst.online/api/calendar/subscribe`, bilingual: button **"ติดตามปฏิทิน · Subscribe (iPhone)"**, the "Open in browser" tip, and **Android: open Google Calendar on the web → Add calendar → From URL → paste `https://som.develyst.online/api/calendar/<token>.ics`**. | `S-subscribe-page-in-line.png` |
| Android: tap Subscribe (iPhone) | ⚪ **does nothing** — in LINE's in-app browser AND after "เปิดด้วยเบราว์เซอร์เริ่มต้น" (Brave). No calendar app opens. Consistent with the page's own labelling (iPhone-only button); on Android the only path is the manual Google Calendar web "From URL". | `S-subscribe-iphone-button-on-android.png`, `S-subscribe-button-in-default-browser.png` |
| Android: Google Calendar → From URL, then watch it update | ⏸️ **NOT DONE — needs the owner's OK**: it adds a subscription to the owner's **own Google account** on this phone, and Google re-polls URL calendars on its own schedule (hours), so the "delay" needs the phone left subscribed for hours. | — |
| Does the FEED update? (server side) | ✅ **YES, immediately.** `GET …/<token>.ics` ⇒ `200 text/calendar`, **`Cache-Control: private, no-store`**. Moved `b67ce26d` 08/10 11:00 → 09/10 12:00 at 17:16:37Z; the feed fetched **1 s later** had `DTSTART:20261009T050000Z`, a higher `SEQUENCE`, `LAST-MODIFIED:20260927T171636Z`. | (curl output in the round log) |
| Refresh hint in the feed | ⚠️ none — no `REFRESH-INTERVAL` / `X-PUBLISHED-TTL`; each client polls at its own default (Google Calendar ≈ many hours, not controllable). | — |
| iPhone | ⚪ **NOT_TESTED — no iPhone available** to me. | — |
**Reading for SPEC-095:** the server side of a subscription is live; any staleness Khwan sees is the **phone calendar's polling interval**, not our feed. A subscription alone cannot promise same-day freshness on Google Calendar ⇒ the web-page link should SUPPLEMENT it (the owner's decision).

### Retests on the phone (2026-09-28 00:13)
- **D1 ✅ FIXED** — after `register` → `teacher` → `qatt75` → approval, the **first typed** message (`calendar`) was answered normally (no hand-off, no mute). `S-calendar-first-typed-after-link.png`
- **D3 ✅ FIXED** — see SPEC-095 above.

### Build check after the FE redeploy (03:35)
- Deployed bundles now contain TASK-491 (`Please check in up to`, `need the front desk`), TASK-483 (`data-camp-mark`, `recordedTitle`), TASK-514 (`Undo attendance`) ✅. On screen: the Undo-attendance dialog ✅ and the camp "Already recorded" page ✅ (below).

### E. Camp ABSENT (📱 phone, new FE)
| Row | Verdict | Evidence / reason |
|---|---|---|
| ABSENT + scan ⇒ stays ABSENT | ✅ PASS 📱🔌 | Fixture day `84e44edd` (27/09 AM) marked ABSENT → opened the camp roster link on the phone → package still `ABSENT`. |
| Page says "already recorded", **no green tick** | ✅ PASS 📱 | **"Already recorded"** + neutral clipboard icon · Camp day `QA-Camp-075` · 27/Sep/26 · AM · **Status Absent**. `E-camp-absent-page-phone.png` |
| The child's name is shown | 🔴 **FAIL (expected — not built)** 📱 | No name on the page. It needs **TASK-515** (BE sends `studentName`), which is still ▶️ QUEUED. Re-test when it ships. |

- **D4 🔴 — (build 15574ef, 18:10) the new on-screen Undo controls do nothing.** ON LEAVE row (TH) menu shows **`ย้อนการลา`**; ATTENDED row shows **`ย้อนการเข้าเรียน`**. Clicking either: **no dialog, no request (`/undo` never called), no console error, no toast**; the row stays SICK_LEAVE / ATTENDED (checked on the calendar payload). Observation for Sober: in `UndoControl.tsx` the confirm `Modal` is rendered inside the `Menu.Item`'s component, and a Mantine menu closes on item click. Repro: admin → any ON LEAVE or ATTENDED row → ⋮ → ย้อน… . Severity: HIGH — the Undo that B needed exists on screen but cannot be used. `U-th-onleave-row-menu.png`, `U-th-undo-leave-click.png`, `U-th-attended-row-menu.png`, `U-th-attended-undo-click.png`
- **D5 🔴 — regression of TASK-514:** on an ATTENDED row the menu shows **`บันทึกลา/ป่วย`** again; its dialog says *"บันทึกลาคาบนี้? จะใช้โควตาลาของคอร์ส 1 ครั้ง และเพิ่มคาบชดเชยต่อท้ายให้"* — pressing it returns the row to **ยืนยันแล้ว (CONFIRMED)** (TASK-497), i.e. an attendance undo labelled as a charged leave. At 03:35 (build 857d897) this row showed "Undo attendance" with the truthful dialog. Combined with D4, the only working way to undo an attendance on screen is the mislabelled one. `U-th-attended-row-leave-label-regression.png`
- **TASK-517 wording:** labels read `ย้อนการลา` / `ย้อนการเข้าเรียน` — **ย้อน…, no ยกเลิก in the Undo labels** ✅; the dialog body and the `ย้อนรายการแล้ว / Undone` toast **cannot be reached** (D4) ⇒ NOT_TESTED.

### Undo on screen — RETEST after TASK-531 (FE `7f8e3f0`, 2026-09-27 23:59 → 09-28 00:10, 🖥️ Thai UI; 📱 blocked — phone locked since 18:10)
| # | Row | Verdict | Evidence / reason |
|---|---|---|---|
| R1 | ON LEAVE ⋮ → `ย้อนการลา` → dialog → confirm → toast → CONFIRMED | ✅ PASS 🖥️ | Dialog *"ย้อนการลาคาบนี้? — คาบจะกลับเป็นยืนยันแล้ว คืนโควตาลาให้ลูกค้า และยกเลิกคาบชดเชยของการลานี้ ระบบจะแจ้งครูว่าคาบนี้กลับมาเรียนแล้ว"* (coach IS told ✅) + optional reason → **ย้อนรายการนี้** → toast **`ย้อนรายการแล้ว`** → server `200 kind:leave leaveRefunded:false` (1-HR: not charged ✅) → CONFIRMED. `R1-leave-menu.png`, `R1-leave-dialog-first-open.png`, `R1-leave-dialog.png`, `R1-leave-after.png` |
| R1b | refund only if charged — charged half on screen | ⚪ NOT_TESTED | Needs a course leave within quota; creating a course posts a sale. |
| R2 | ATTENDED ⋮ → `ย้อนการเข้าเรียน` → confirm → CONFIRMED | 🔴 **FAIL — D6** | Dialog ✅ *"ย้อนการเข้าเรียนคาบนี้? — คาบจะกลับเป็นยืนยันแล้ว และคืนคาบเข้าโควตาของลูกค้า ไม่ใช้โควตาลา ไม่เพิ่มคาบชดเชย และไม่มีการแจ้งใคร"*, but confirm ⇒ **409 `UNDO_STAFF_ATTEND`** *"คาบนี้เจ้าหน้าที่เป็นผู้บันทึกการเข้าเรียน — การย้อนกลับใช้ได้กับการเช็คอินของผู้ปกครองเท่านั้น"* (shown in the dialog, no success toast). `R2-attended-menu.png`, `R2-attended-dialog.png`, `R2-attended-after.png` |
| R3 | `ย้อนการเช็คอิน` on a check-in ATTENDED row | ⏳ | Needs a parent check-in in the window (phone locked; next window tomorrow). |
| R4 (D5) | ATTENDED row offers NO `บันทึกลา/ป่วย` | ✅ PASS 🖥️ | ATTENDED menu = **ย้อนการเข้าเรียน · ยกเลิกการจอง** only. `R2-attended-menu.png` |
| R5a | Refusal — slot taken, in the server's own sentence, no success toast | ✅ PASS 🖥️ | Two-admin race: dialog open on temp 05/10 → hour booked for campkid2 → **ย้อนรายการนี้** ⇒ in-dialog *"ย้อนกลับไม่ได้ — ช่วงเวลา 2026-10-05 10:00 ของครูมีคาบของ campkid2 อยู่แล้ว"*, no toast. (Observation: once the hour is re-booked, the calendar **hides** the on-leave row, so an admin can only meet this refusal in a race.) `R5a-slot-taken-refusal.png` |
| R5b | Refusal — charge unknown (legacy leave) | ✅ PASS 🖥️ | temp 01/10 `9f31a756` (same refusal path as asda 24/10, which sits inside a group row): in-dialog *"ระบบไม่ทราบว่าการลานี้ใช้โควตาลาหรือไม่ (ลาก่อนมีการบันทึก) — กรุณาแก้ไขด้วยตนเอง"*, no toast, unchanged. `R5b-charge-unknown-dialog.png`, `R5b-charge-unknown-after.png` |
| R5c | Refusal — settled day | ✅ PASS 🖥️ | Fixture `07eb2274` (campkid2, 27/09 16:00, leave): in-dialog *"ปิดวันของวันที่ 2026-09-27 แล้ว — ย้อนกลับไม่ได้"* (`UNDO_DAY_SETTLED`), no toast. `R5c-settled-after.png`. (Minor: an admin could create + confirm + leave a session on the already-settled 27/09 with no warning — noted with F3.) |
| R6 | A coach-linked account sees NO Undo control | ⚪ NOT_TESTED | Needs a coach login. The only QA coach account (`qa-teach-97103`) is **disabled**, and I do not create or re-enable login accounts myself ⇒ owner: enable it (or provide one) and I will check. |
| R7 | Cancel booking still separate | ✅ PASS 🖥️ | `ยกเลิกการจอง` is its own item on ON LEAVE and ATTENDED rows; the Undo items never lead to it. |
- **D6 🔴 — a STAFF-marked attendance can no longer be undone on screen.** The ATTENDED row offers `ย้อนการเข้าเรียน`, whose server door refuses staff attendance (`UNDO_STAFF_ATTEND`); and TASK-531 removed `บันทึกลา/ป่วย` from that row — the only control whose server path (TASK-497) did return a staff attendance to CONFIRMED. An admin who taps **มาเรียน** by mistake is now stuck (the TASK-497 case). The API path still works (`PATCH /status {action:"sick-leave"}` on an ATTENDED row ⇒ CONFIRMED — used to restore the fixture). Also: the control is offered on a row it will always refuse.
- Wording notes (owner's call, not defects): the Undo dialog's dismiss button reads **`ยกเลิก`** (the verb kept for Cancel booking); the leave-Undo body promises **"คืนโควตาลา"** even when the leave was never charged (the server correctly refunds nothing).

- **SEC-1 🔴 (HIGH) — the admin-link prompt prints the default admin code.** Chat: `register` → `admin` ⇒ *"กรุณาพิมพ์รหัสแอดมิน (เช่น 229) / Please type the admin code (e.g. 229)"*. In the backend the expected code is `process.env.LINE_ADMIN_VERIFY_CODE ?? "229"` (`line-webhook.service.ts:424`), the prompt text is `code_admin` (`line-i18n.ts:215`), and `.env.example` ships `LINE_ADMIN_VERIFY_CODE=229`. ⇒ On any box where the variable is unset or copied from the example, **anyone chatting with the OA can link themselves as an admin** (and receive admin notices, e.g. families' leaves). The code is also 3 digits with no approval step. **Not exploited** — I did not type any code (a secret). Owner must confirm the variable on sid AND **uat (real OA)**. Surface 📱. `SEC-admin-code-prompt-shows-default.png`
- **R1 on a phone-sized screen** — ✅ PASS (🖥️ **emulated** 360×800, touch, Android UA — not the real device): ON LEAVE ⋮ → `ย้อนการลา` → dialog → `ย้อนรายการนี้` → toast `ย้อนรายการแล้ว` → `200 kind:leave` → CONFIRMED. `R1m-mobile-leave-menu.png`, `R1m-mobile-leave-dialog.png` (mid fade-in), `R1m-mobile-leave-after.png`. On the **real phone** I stopped: blind taps on the mobile admin grid are unreliable (one opened another family's paused booking — Aiwa; nothing pressed inside, closed with ✕).

### Admin LINE menu (TASK-530) — 📱 real phone, 2026-09-28 01:03–01:09 (owner typed the admin code himself; it is never recorded here)
| Row | Verdict | Evidence |
|---|---|---|
| 1-cell admin menu `SOM SCHEDULE` / `เปิดระบบ · Open the system` | ✅ PASS 📱 | After *"Admin account linked ✅ You'll be notified of leave requests"*, the menu is ONE orange cell with exactly that text. `ADM-admin-menu-1cell.png` (cropped so the owner's code message is not in frame) |
| Tapping it opens the PHONE's browser, not LINE's | ✅ PASS 📱 | Focused window after the tap = **`com.brave.browser`** (the phone's default browser), at `som.develyst.online/scheduler/calendar`. It showed the schedule because my earlier QA session was still in Brave; a new admin would get the login page. `ADM-admin-menu-tap-opens.png` |
| A coach who is also an admin keeps the COACH menu | ✅ PASS 📱 | Same LINE account linked as teacher qatt75 (approved) on top of admin ⇒ the **orange 2-cell coach menu** (ตารางของฉัน / ภาษา/ช่วยเหลือ). `ADM-coach-plus-admin-keeps-coach-menu.png` |
| Restore 0900000092 as parent, 6-cell | ✅ 📱 | qatt75 unlinked; `register` → `Next` → `0900000092` ⇒ *"ผูกบัญชีผู้ปกครองสำเร็จ ✅ … Found your family"*; 6-cell parent menu shown. `ADM-restored-parent-6cell.png` |
Notes for the owner: (1) the demo phone's LINE account is **still registered as an admin** (parent role wins the menu) ⇒ once pushes resume on 1 Oct it will receive **admin notices** (leave requests); I found no admin-unlink control, so that is his call. (2) The admin code he typed now sits in the demo chat history and in the OA's own chat log — consider rotating it after the round.
Housekeeping on the phone: Gboard switched back to **Thai** (a stray tap had switched it to QWERTY); my QA admin session in Brave **signed out**; no password saved.

### In-window rows — 2026-09-28 17:50–18:15 (build of `DEPLOY-sid-2026-09-28`, migrations 61) · evidence in `project-docs/qa-2026-09-28/`
| Row | Verdict | Evidence / reason |
|---|---|---|
| False check-in Undo ⇒ CONFIRMED, credit back, silent | ✅ PASS 🔌 (before the 18:05 day-end) | Fixture `ccf9a095` (campkid2, 28/09 18:00): confirm → **parent check-in via the public token door** (`POST /api/checkin` → `already:false`) → `POST /bookings/:id/undo` **200 `kind:"checkin"`** → CONFIRMED; 2nd Undo **409 `UNDO_NOT_UNDOABLE`**. Re-checked-in and undone again, then cancelled at 17:52 — before the day-end. "Nobody told" ⇒ outbox (DATA REQUEST #3). |
| R3 — `ย้อนการเช็คอิน` label on a check-in row | ⏳ | The 18:00 row could not be opened on the calendar (see F6); redo tomorrow before 18:05 with an in-hours class. |
| Shop-QR page lists several children with checkboxes | ✅ PASS 📱 | 0812345671 ⇒ **campkid2** + **qakid3**, each with a checkbox; button **`เช็คอิน (0)`** disabled until ticked; 1 ticked ⇒ `เช็คอิน (1)`. `SQ-1-list-with-checkboxes.png`, `SQ-2a-one-ticked.png` |
| **Two children ticked ⇒ one result per child** | 🔴 **FAIL — D7** | Ticking the **second** child **crashes the page** ("This page couldn't load — Reload to try again, or go back"). 2/2 on the phone (Brave) and reproduced in desktop Chrome at phone size, where the console shows **`PAGEERROR: Cannot read properties of null (reading 'checked')`**. The multi-select cannot be used at all, so the per-child result / "never says checked in for the failed one" rows are **BLOCKED** by it. `SQ-2-both-ticked.png` (the crash), `SQ-desktop-mobile-after-2nd-tick.png` |
| Single child via the wall QR | ✅ PASS 📱 | `เช็คอินสำเร็จ · QA Camp Kid2 · Private SURFSKATE · ครู qatt75 · 2026-09-28 18:30–19:30 น. · +10 แต้มสะสม`. `SQ-3-single-child-result-phone.png` |
| Shop QR chip — roster row | ✅ PASS 🖥️ | All bookings: `campkid2 · Private SURFSKATE · qatt75 · 28/Sep/26 18:30-19:30 · 1 HR · ATTENDED · **SHOP QR**` (orange outline). API: `checkinSource = checkinChannel = "shopfront-qr"`, `checkinActor = null`. `SQ-5-chip-roster-row.png` |
| Shop QR chip — booking detail | ⏳ | The 18:30 booking is not on the calendar (F6) ⇒ redo with an in-hours class. |
| Coach account sees NO chip | ⚪ NOT_TESTED | Needs a coach login (R6). |
- **D7 🔴 (HIGH) — the shop-QR page crashes when a 2nd child is ticked.** Repro: `/checkin/shop` → a phone with two children in the window → tick child 1 (OK, `เช็คอิน (1)`) → tick child 2 ⇒ error page. Console: `Cannot read properties of null (reading 'checked')`. Surfaces: 📱 Brave on CPH2735, 🖥️ Chrome (360×800). This is exactly TASK-491's feature.
- **F5 (minor) — a search containing a digit floods the bookings list:** `q=Ari3y` ⇒ 228 unrelated bookings (first: ดิววี่) though the student exists (`q=Ari` finds her); `q=2` ⇒ 1347; any form of "campkid2" ⇒ 1222. A student whose name contains a digit cannot be found by name (real example: "Ari3y(V)'MOM").
- **F6 (minor) — the API accepts a start time the calendar cannot show:** bookings created by API at 18:00/18:30 exist (list, check-in, shop QR all work) but are **absent from the calendar payload** (time slots end at 17:00) ⇒ no way to open their detail in the admin UI. The admin form only offers 09:00–17:00, so this is reachable only via API/imports; noted.
- Fixtures (all **CANCELLED**): `ccf9a095` (18:00), `28dea218` (18:30 shop-QR, was ATTENDED), `8687fe6e` + `8cbd1bb5` (qakid3 18:30).

### Build `DEPLOY-sid-2026-09-28` (migrations 61) — Porter's 09-28 list
**1. LINE-links admin list + Remove** (page `/scheduler/link-requests`, 🖥️ Thai UI + 📱)
| Row | Verdict | Evidence / reason |
|---|---|---|
| Admin list | ✅ PASS 🖥️ | Section **"บัญชี LINE ที่มีสิทธิ์แอดมิน"** with the warning *"บัญชีเหล่านี้จะได้รับข้อความแจ้งของแอดมิน ซึ่งมีชื่อเด็กของครอบครัวอื่นอยู่ด้วย"*; one row: **0900000092 · ไอดีลงท้าย …71e5 · เป็นผู้ปกครอง 0900000092 ด้วย · ถอนสิทธิ์แอดมิน**. `LL-2-admin-list.png` |
| "ไม่ทราบว่าเป็นบัญชีของใคร" row | ⚪ NOT_TESTED | No such admin exists on sid now — nothing to render. |
| Remove dialog wording | ✅ PASS 🖥️ | *"ถอนสิทธิ์แอดมินของบัญชีนี้? · 0900000092 · ไอดีลงท้าย …71e5 · บัญชีนี้จะไม่เป็นแอดมินอีกและจะไม่ได้รับข้อความแจ้งของแอดมิน ไม่ใช่การลบบัญชี · ยังใช้งานในฐานะผู้ปกครองได้ตามเดิม"* · ยกเลิก / ถอนสิทธิ์แอดมิน. `LL-3-remove-dialog.png` |
| **Removed the demo phone's admin rights** (owner-authorised) | ✅ DONE | List now *"ยังไม่มีบัญชี LINE ที่มีสิทธิ์แอดมิน"*. `LL-4-after-remove.png` |
| After removal the account keeps parent access + menu | ✅ PASS 📱 | `menu` ⇒ parent command list (18:13) + 6-cell parent menu. `LL-5-phone-after-remove-parent-menu.png` |
| Observations | 🟠 minor | (a) the "สิ่งที่หน้านี้แสดงให้ไม่ได้ และเหตุผล" block is **English** in the Thai UI ("display name — LINE's name…", "linked at — …", "how it was linked — …"); (b) "ครูที่ผูก LINE แล้ว" shows **"ยังไม่มีครูผูก LINE"** — Kwan was linked at 01:07 today; changed outside my actions, worth a glance. |

**2. The four leave dialogs** (🖥️ Thai UI, ⋮ → บันทึกลา/ป่วย → read → ยกเลิก; nothing recorded)
| Variant | Verdict | Dialog body (verbatim) |
|---|---|---|
| No course (1-HR) | ✅ PASS | *"คาบนี้จะถูกบันทึกเป็นการลา คาบนี้ไม่มีคอร์สอยู่เบื้องหลัง จึงไม่ใช้โควตาลาและไม่มีคาบชดเชย ระบบจะแจ้งครูและแอดมิน"* — F2 is fixed. `LV-no-course-dialog.png` |
| No leave left (เหมียว 30/09 09:00) | ✅ PASS | *"…คอร์สนี้ใช้สิทธิ์การลาครบแล้ว จึงไม่ตัดโควตาและไม่มีคาบชดเชย และจะยังล็อกการเลื่อนตารางไว้จนแอดมินปลดล็อก ระบบจะแจ้งครูและแอดมิน"*. `LV-no-leave-left-dialog.png` |
| Ordinary course leave (Anya, Jayleen 29/09 11:00) | ✅ PASS · 🟠 note | *"จะใช้โควตาลาของคอร์ส 1 ครั้ง และเพิ่มคาบชดเชยต่อท้ายให้"*. It is accurate, but unlike the other variants it does **not** say who will be told ("ระบบจะแจ้งครูและแอดมิน" is missing). `LV-ordinary-dialog.png`, `LV-ordinary2-dialog.png` |
| Declared at sign-up (`plannedAtCreation`) | ⚪ NOT_TESTED | No CONFIRMED `plannedAtCreation` session exists on sid. Making one requires a course sale, which I did not do. |

**3. Undo forecast** (🖥️ Thai UI + 📱 emulated 360×800 at Android size; the network was throttled so the loading state could be seen)
| Row | Verdict | Evidence |
|---|---|---|
| Loading line | ✅ PASS | Spinner plus *"กำลังตรวจว่าจะมีผลอะไรตามมา…"*; the confirm button stays disabled until the check returns. `FC-A-loading.png` |
| Phone layout while loading | ✅ PASS (emulated) | The dialog fits the 360-wide screen with no overflow; the buttons stay in one row. `FC-R-mobile-loading.png`. The real phone was not used because admin-UI tapping on it is unsafe (see the earlier stray-tap note). |
| Heading + per-booking lines | ✅ PASS | ส้มตำ 01/10 10:00, read only and cancelled: *"ถ้าไม่มีอะไรเปลี่ยนก่อนกดยืนยัน รายการนี้จะ:"* · **คืนโควตาลาให้ลูกค้า** · **คาบชดเชยวันที่ 2026-11-19 จะถูกยกเลิก** · *"ระบบจะตรวจอีกครั้งเมื่อกดยืนยัน จึงยังมีสิทธิ์ปฏิเสธได้"*. These match `undo-preview` (`leaveRefunded:true`, makeup `f400815a`). `FC-two-lines.png`. The single-line case (ส้มตำ 30/09 17:00) shows only the make-up line. `FC-makeup-line.png` |
| "Nothing else follows" | ✅ PASS | Fixture `0e0947d0` (1-HR leave): *"ไม่มีผลอื่นตามมา — ไม่คืนโควตาลา และไม่มีคาบชดเชยที่ต้องยกเลิก"*. Confirming it → 200, CONFIRMED. `FC-A-forecast.png` |
| Server refusal under **"ระบบจะไม่ย้อนรายการนี้:"** | ✅ PASS | Ally 01/09 11:00 (a settled day, read only): a red box headed **ระบบจะไม่ย้อนรายการนี้:** containing the server's own sentence *"ปิดวันของวันที่ 2026-09-01 แล้ว — ย้อนกลับไม่ได้"*; **ย้อนรายการนี้ is disabled**, so pressing it is not possible. `FC-refused-settled.png` |
| Clean forecast, refused at confirm (Porter's expected (b)) | ✅ PASS · 🟠 note | `0e0947d0`: the forecast was clean, then I undid it by API behind the open dialog, then pressed ย้อนรายการนี้ → **409 `UNDO_NOT_UNDOABLE`**. The server's sentence appears in a red box at the top: *"คาบนี้ย้อนกลับไม่ได้ — สถานะปัจจุบันคือ CONFIRMED …"*. `FC-R-mobile-after.png`. Notes: (a) this box has **no** "ระบบจะไม่ย้อนรายการนี้:" heading; the heading is used only for a preview refusal (`UndoControl.tsx`). (b) The now-stale forecast stays below it, and the button stays enabled. |
| Wording observation | 🟠 minor | The fixed intro *"…และคืนคาบเข้าโควตาของลูกค้า"* sits directly above the forecast *"ไม่คืนโควตาลา"* on a 1-HR leave, so it reads as a contradiction. On a refused row the intro also still promises the outcome. |

**4. `ปฏิทิน` / calendar on LINE** (📱 demo phone relinked as teacher `qatt75` at 18:30, approved by API; restored to parent 0900000092 at 18:34 ✅; no teacher is LINE-linked afterwards, the same state as before)
| Row | Verdict | Evidence |
|---|---|---|
| Help line | ✅ PASS 📱 | `menu` ⇒ *"คำสั่งที่ใช้ได้: · ตารางของฉัน — ตารางสอนวันนี้ / สัปดาห์นี้ · ปฏิทิน — ลิงก์เข้าเว็บ ดูตารางสอนบนมือถือ"*, which matches byte for byte. The EN half matches too. `CAL-1-help-and-calendar-reply.png` |
| `calendar` replies with the web-app link + the login line | ✅ PASS 📱 | *"📅 ตารางสอนของคุณอยู่ในระบบ SOM SCHEDULE: https://som.develyst.online/?openExternalBrowser=1 · แตะลิงก์ แล้วเข้าสู่ระบบด้วยบัญชีที่แอดมินให้ไว้"*, plus the EN half and a link preview card. `CAL-1-…png`. I sent the English alias `calendar` because adb cannot type Thai; the Thai word `ปฏิทิน` was not typed. |
| The link opens the web app | ✅ PASS 📱 | Tapping it opens **Brave (outside LINE)** at `som.develyst.online/login?next=…` on the SOM SCHEDULE login page. I did not log in. `CAL-2-link-opens-web-login.png` |

**6. Cancelled make-up — family notice** — ⚪ **NOT_TESTED (needs a decision + DATA REQUEST).** The notice is sent when an Undo cancels a make-up (`line-message.ts:335` puts `mc_new_class` only when the re-plan added dates). Pushes to the demo OA are quota-blocked until 1 Oct, so the only evidence would be the outbox row. Every make-up on sid belongs to a real demo family (for example ส้มตำ 01/10, whose forecast is "คืนโควตาลา + ยกเลิกคาบชดเชย 19/11"). I did **not** undo one, because that would change their course and queue a message to their LINE. To test it cleanly: either a course sale for the demo phone's family (student `temp`) so the notice lands on our own phone, or the owner exports the outbox rows from a natural occurrence. ⇒ asked Porter.

**5. SEC-1** (📱 demo chat; I never typed or asked for the real code)
| Row | Verdict | Evidence / reason |
|---|---|---|
| `register` → `admin` shows NO example code | ✅ PASS 📱 | Prompt now *"กรุณาพิมพ์รหัสแอดมิน / Please type the admin code"* (was "(เช่น 229)"). `SEC-1-prompt-and-wrong-code.png` |
| A wrong code is refused | ✅ PASS 📱 | `qa-wrong-1` ⇒ *"รหัสแอดมินไม่ถูกต้อง ลองใหม่อีกครั้ง / Wrong admin code, please try again"*; no link made. |
| Repeated wrong codes rate-limited; `เปิดเมนู` does not reset it | ⚪ NOT_TESTED from the phone — **by design indistinguishable** | Code: 5 misses / 60 min per LINE account (`ADMIN_CODE_MISS_LIMIT`), then "refused without checking" — but the chat reply is the **same** "wrong code" sentence, so a limited attempt looks identical to a wrong one. Only typing the **real** code after 5 misses (owner) or the server log line `🔴 [SEC-1] admin code: … is over 5 misses` can show it. ⇒ owner check. Note the limiter is in memory (a restart clears it). |
| Minor (F7) | 🟠 | `cancel` typed at the code prompt is NOT treated as leaving the flow: it triggers the hand-off *"Sorry about that — I am passing this to an admin"* and **mutes** the chat; `reopen` restores it (parent chips back). `SEC-1-cancel-reply.png` |

### Findings logged along the way (minor)
- **F1 — an undone leave leaves its reason in the booking Note.** The leave writes `note = reason`; the Undo returns the status but not the note ⇒ a CONFIRMED session reads "Note: QA TEST-075: leave, then the hour gets re-booked". `B-modal-confirmed-actions.png`
- **F2 — the leave dialog promises a course cost on a 1-HR booking:** *"This uses one of the course's leaves and adds a make-up session at the end."* A 1-HR leave uses no quota and adds no make-up (the API confirms `leaveRefunded:false`, `makeupCancelledId:null`). Same shape as TASK-514. `B-leave-dialog.png`
- **F4 — `POST /bookings` with a `groupId` that is not a group row is silently ignored:** passing the series KEY (a valid UUID, not a booking) created a plain 1-HR with `group:null` and 201, instead of refusing. An admin UI always sends the right id, so API-only; noted.
- **F3 — an admin can mark a session ATTENDED 8 days before it happens** (05/10 fixture, pressed on 27/09) with no warning. Possibly intended; noted.

### Blockers (reported mid-round to Porter)
1. **LINE pushes do not arrive on the demo phone** (02:42 confirm push never delivered; replies instant). Needs the owner's pm2 `[outbox]` log / OA quota.
2. **sid's FE is older than commit `857d897`** (TASK-483 + 491 + 514): none of their strings are in the deployed bundles. BE is current.

## Test data created
- `0e0947d0-517b-42c6-a354-98d0f6eeccfe` — 1-HR, student **temp** (demo family), coach Bank, **2026-10-05 10:00**. Currently **ATTENDED** (by the UI press). **To restore + cancel at the end.**
- `fca3e10f-8794-4866-af08-44306ccc70c9` — 1-HR, campkid2 (my fixture family), Bank, 05/10 10:00 — **CANCELLED** (ADMIN_ERROR).
- Fixture teacher **`QA Teacher 075` / nickname `qatt75`** — `7508e641-0aef-4a2b-9460-d0dd48de08db` (FULL_TIME, all days, SURFSKATE/FREESKATE/Balance Play (Private)). **Archive at the end.**
- Today **2026-09-27**, teacher qatt75, student campkid2, all 1-HR — ✅ **all four live ones CANCELLED at 03:22** (ADMIN_ERROR), before the day-end could attend/post them:
  - 10:00 SURFSKATE **CONFIRMED** + attendeeNote `เตรียมอุปกรณ์ให้น้องด้วย (QA)` — `dd255444-0e98-48fc-b714-0daf200e8b8b`
  - 11:00 FREESKATE **ATTENDED** (staff) — `bc4b0867-d127-4821-b97e-f5be5602752b`
  - 12:00 Balance Play (Private) **PENDING** — `9a5e4ec2-afa9-447e-86a2-621390e5700f`
  - 13:00 SURFSKATE **SICK_LEAVE** — `a51efc66-83f5-4053-8a86-c088fd65ea06`
  - 14:00 SURFSKATE **CANCELLED** — `cc08b72b-0c82-4304-9fef-1287f3abb6bb`
- Camp: week **QA-Camp-075** `578f1526-c567-444d-bc78-b8f5e7361688` (27/09, cap 3, coach qatt75); **new camp package** `d4416ed8-8356-46c5-b0f3-87280591aec3` for campkid2 (HALF, DAILY, 1 day — **a camp sale on sid**, same as last round's fixture package); day `84e44edd-3720-435e-a561-4a8d2ca5dc9d` 27/09 AM **ABSENT**. ⚠️ Today's day-end will settle it (ABSENT stays ABSENT). **To close the week at the end.**
- `55d424ab-5c3c-4def-9fe5-f9f32efbd322` — 1-HR campkid2, 27/09 15:00, qatt75: confirmed → staff-attended → **CANCELLED** (ADMIN_ERROR) at 03:47.
- Move/seat fixtures: `b67ce26d-7a74-48e1-b218-76d40622d1fb` (1-HR campkid2, now 08/10 11:00, CONFIRMED) · `0fd5fba5-98c6-48ac-a8d8-2d97d4d87dac` (OTHER co-taught, 07/10 14:00, CONFIRMED) — **cancel at the end** · seat `8e4d8c56-6897-48c4-9a75-84473a69f74d` **CANCELLED**.
- Undo-retest fixtures, all **CANCELLED**: slot takers `20c099a4-b701-45ca-aee2-460f262dde9d`, `26b959ae-dcbe-4107-a251-8161bb92b2f3` (campkid2, Bank 05/10 10:00); settled-day `07eb2274-ae20-43ee-adf6-5837a4c69db7` (campkid2, 27/09 16:00). The 18:45 shop-QR pair `d789abcb`, `d1b5c956` **CANCELLED** (phone was locked, window missed). `0e0947d0` back to CONFIRMED.
- Second fixture child **`QA Kid Three` / qakid3** `72bac3b1-b98e-4328-9475-bf725747359e` under my fixture parent `b7146378` (0812345671). **Archive at the end.**
- Shop-QR multi-select, 27/09 **18:45** (after the day-end): campkid2 `d789abcb-3c58-44f4-90a6-626dece6cbe3` (qatt75) · qakid3 `d1b5c956-f4be-4eaf-983b-b0b508316243` (qatt75b). **Clean up before the next day-end.**
- Second fixture coach **`QA Teacher 075B` / `qatt75b`** `7c9bbc14-8f90-43e8-a5c4-5bf52ccd3983` (unlinked). **Archive at the end.**
- 06/10 co-taught fixtures (all now **CANCELLED**): OTHER `9a7def1c-4bec-4c41-b1e6-66d3bd8244d3` (09:00, qatt75+qatt75b); stray 1-HR `aa252513-2568-4838-8b67-9e42b312d83f` (wrong groupId — **F4**); seat `2b309ea4-04a5-4bdd-9ce1-bd8b9d9ba0d8` (11:00, campkid2). Group series **QA-Group-075** key `2d42fe5e-41b6-4ffa-8565-8ca1796e9333`, row `2596a14a-a72c-4749-91a6-34aa8551a72d` (PENDING) — **to close at the end.**
- ⚠️ **Residue from TEST-074's cleanup:** the old fixture day `743a27b0` (26/09) that I reverted to PLANNED was then **auto-marked ATTENDED by the 26/09 day-end** (package `a00160bd` now 2/2 used). My revert left a PLANNED day on its own date — the day-end did its job. Test data only; declared here rather than hidden.
- Demo phone LINE link: switched parent 0900000092 → teacher qatt75 at 03:10, **restored to 0900000092 as parent at 03:21** ✅ (qatt75 unlinked; kept, unarchived, for the coach-notice rows once pushes work — archive at the end).
- 09-28 18:20–18:30: `0e0947d0` was put on leave and undone twice for the forecast rows (the second Undo was the 409 race). It is **CONFIRMED** again, still to be cancelled at the end. The demo phone went parent → teacher qatt75 (18:30) → **parent 0900000092 (18:34)** ✅. The read-only forecasts on ส้มตำ / Ally were opened and closed with ยกเลิก, and nothing was written.
- **Item 6 fixture (owner ruling (a), 09-28 ~18:55):** a **course sale on sid**: course `47be0cc9-698f-43d1-810b-95bfea5f6dc1`, student **temp** (demo family 0900000092), coach qatt75, Private SURFSKATE, 4 classes, Tuesdays 10:00 from 13/10 to 03/11. First session `40c68a59-6a2e-4d09-88bd-b365138fd6e5`. **To cancel/close at the end.**

**6. Cancelled make-up — family notice (run 09-28 ~19:00, owner ruling (a); fixture course `47be0cc9`)**
| Step | Result 🔌 |
|---|---|
| Sale (4 classes, Tue 10:00, 13/10–03/11) → `POST /courses/:id/confirm` | 4 CONFIRMED; `parentNotified:true, parentLinked:true` (the family is the demo phone's). |
| Leave on 13/10 (`40c68a59`), within quota | SICK_LEAVE; make-up **`e7cb8771` 10/11 10:00 EXTENDED** appended. |
| Admin cancels the make-up (`PATCH …/status {action:cancel, reasonCode:ADMIN_ERROR}`) | 200 CANCELLED; the re-plan appended **`0494ab85` 10/11 10:00 EXTENDED**, i.e. **the same date** as the class it replaces ⇒ the notice should carry *"ระบบเพิ่มคาบใหม่ให้แล้ว วันที่ 10/11/2026"*. 🟠 **Observation:** the family will read "10/11 cancelled" followed by "new class added on 10/11". That is true, but it looks like a mistake to a parent. |
| "No new class ⇒ no line" case | ⚪ **Not reachable through the admin cancel:** every course-session cancel re-owes a make-up (`scheduler.service.ts` ~3763, SPEC-028 §11.3), so `appended` is never empty there. It would need a coach's own leave, or a course at a plan state that adds nothing. Not constructed. |
| Undo of the 13/10 leave (would cancel make-up `0494ab85`; the family should NOT be told) | Forecast **ok, "คืนโควตาลา" only, `makeupCancelled:null`**, then the act was **refused 409 `UNDO_PLAN_WOULD_CHANGE`** ("คาบขยายของการลาอื่นจะถูกยกเลิก/เพิ่ม — กรุณาแก้ไขด้วยตนเอง"). This matches Porter's expected (b). 🟠 **Note for Sober:** once a make-up has been replaced, the forecast no longer links the replacement to the leave, so it predicts "no make-up cancelled", which is wrong. The act catches it. |
| Notice content (title `❌ ยกเลิกคาบเรียน:` / `❌ CLASS CANCELLED:`, Student/Program/Date/Time, no "make-up" word, the new-class line) + coach notice | ⏳ **DATA REQUEST #4** (outbox, pushes blocked until 1 Oct). qatt75 is **not** LINE-linked, so the coach side can at most show a skipped row. The only teacher linked on sid was Kwan, and she is off-limits. |
- **09-29 re-test fixtures (D7):** 29/09 **03:30** 1-HR CONFIRMED: campkid2 `0e389b50-4366-458c-8aab-0a2e5be8eae0` (qatt75) · qakid3 `f5de2a52-c6a6-41cf-b9c4-73b8e8c93295` (qatt75b). **Cancel before the 18:05 day-end.**

### Re-test 2026-09-29 03:35–03:45 — sid deploy (TASK-551/552 BE, TASK-554 FE) · frozen scope · evidence `project-docs/qa-2026-09-29/`
(At 03:25 the login was blocked: the owner had changed the sid admin password on the web and has since updated the credential file. Not a defect.)
| Item | Verdict | Evidence |
|---|---|---|
| **1. D7 shop-QR, 2nd tick** | ✅ **PASS 📱 real phone** (+ emulated) | Demo phone CPH2735, Brave, `/checkin/shop`, 0812345671 (03:46): tick campkid2 ⇒ `เช็คอิน (1)`; tick qakid3 ⇒ **both ticked, `เช็คอิน (2)`, no crash** `D7-phone-1-both-ticked.png`; untick qakid3 ⇒ `(1)` `D7-phone-2-untick-B.png`; re-tick ⇒ `(2)`; submit ⇒ **"เช็คอินครบทั้ง 2 คน · campkid2 เช็คอินแล้ว · qakid3 เช็คอินแล้ว"** `D7-phone-3-results.png`. API: both ATTENDED, `checkinSource=shopfront-qr`. The emulated run agrees (`D7-emu-*.png`). |
| **2. Item-6 Undo forecast names the replacement make-up** | 🔴 **FAIL — NEW finding (D8)** | The leave `40c68a59` (13/10) forecast is now a **refusal**, and the button is disabled: **`UNDO_EXPIRY_UNRECOVERABLE`** *"คำนวณวันหมดอายุเดิมกลับไม่ได้ (ปัจจุบัน 2026-11-10: กำหนดตั้งแต่เปิดคอร์ส (ไม่มีบันทึกการเลื่อน)) — ย้อนกลับไม่ได้ กรุณาแก้ไขด้วยตนเอง"*. It does not name make-up `0494ab85`. But **10/11 IS the sale's original expiry** (the 09-28 sale preview said `expiryDate:"2026-11-10"`), so there is nothing to recover. Yesterday, before the repair and deploy, the same leave previewed `ok` / "คืนโควตาลา". Either the owner's DB repair or TASK-551/552 changed what the expiry check sees. `FC-item6-forecast.png` |
| **3. Smoke** | ✅ PASS | Admin login ✅ `SMOKE-1-logged-in.png`. Bookings list loads (courses tab: ปกติ 76 · พักคอร์ส 3 · จบแล้ว 1 · หมดอายุ 1 · ยกเลิกแล้ว 98) `SMOKE-2-bookings-list.png`. One leave dialog (temp 20/10, a course with its leave used): the correct "quota used up / lock" text `SMOKE-3-leave-dialog.png`. Ordinary check-in QR: a new fixture's QR URL opened on a phone-sized page ⇒ **"Check-in complete · QA Camp Kid2 · Private SURFSKATE · qatt75 · 05:00–06:00 · +10 points"** `SMOKE-4a-qr-page.png`. |
- Fixtures `0e389b50`, `f5de2a52` (D7, ATTENDED via shop QR) and `0805a4da` (smoke QR, ATTENDED via `checkin-qr`): **all CANCELLED at 03:48** (ADMIN_ERROR), before the day-end. The item-6 course `47be0cc9` is **kept on purpose** as the live repro for D8 until Sober has looked; I close it out after that.

### D8 re-test — sid BE TASK-556 (migration 0061, verify 62/62) · 2026-09-29 ~04:45 · 🖥️ Thai UI
| Row | Verdict | Evidence |
|---|---|---|
| **Fixture course `47be0cc9`: the forecast names the replacement make-up; the Undo proceeds** | ✅ **PASS — D8 fixed** | Leave `40c68a59` (temp 13/10 10:00). Loading line, then *"ถ้าไม่มีอะไรเปลี่ยนก่อนกดยืนยัน รายการนี้จะ: · **คืนโควตาลาให้ลูกค้า** · **คาบชดเชยวันที่ 2026-11-10 จะถูกยกเลิก** · ระบบจะตรวจอีกครั้งเมื่อกดยืนยัน…"* (preview `makeupCancelled.id = 0494ab85`). Pressed **ย้อนรายการนี้** ⇒ `POST /undo` **200** `leaveRefunded:true, makeupCancelledId:0494ab85, expiry:null` ⇒ the leave is **CONFIRMED** and `0494ab85` **CANCELLED**. `D8-fixture-loading.png`, `D8-fixture-forecast.png`, `D8-fixture-after.png` |
| **An older course's expiry refusal: do the words tell an admin what to do?** | ⚪ **NOT_TESTED — no such course on sid now** | I scanned the preview of **every** SICK_LEAVE row from 29/09 onwards (read only): **zero** `UNDO_EXPIRY_UNRECOVERABLE`. Refusals present: UNDO_LEAVE_CHARGE_UNKNOWN ×4, UNDO_SLOT_TAKEN ×2, UNDO_MAKEUP_CHAIN ×2, COURSE_DROPPED ×2. Porter said read only, so I did not construct one. *Code read only, not a screen verdict:* the draft is *"ย้อนกลับการลานี้อัตโนมัติไม่ได้: คอร์สนี้เปิดก่อนระบบเริ่มบันทึกการเลื่อนวันหมดอายุ (เริ่มบันทึก {date}) จึงบอกไม่ได้ว่าวันหมดอายุ {expiry} ถูกเลื่อนเพราะคาบขยาย {makeup} หรือไม่ — กรุณาเปิดหน้าคอร์ส ตรวจวันหมดอายุกับประวัติการลา แล้วแก้การลาและวันหมดอายุด้วยตนเอง"*. It does name what to open and what to check. |
| Observation (not in scope, for the copy batch) | 🟠 | The refusals that are live today end in a bare *"กรุณาแก้ไขด้วยตนเอง"*, which does not say what to fix or where: LEAVE_CHARGE_UNKNOWN *"ระบบไม่ทราบว่าการลานี้ใช้โควตาลาหรือไม่ (ลาก่อนมีการบันทึก) — กรุณาแก้ไขด้วยตนเอง"*, MAKEUP_CHAIN *"คาบขยายของการลานี้ (2026-11-12) ถูกแจ้งลาต่อ — ย้อนกลับไม่ได้ กรุณาแก้ไขด้วยตนเอง"*. The new expiry draft is clearer than both. |
- Footprint: course `47be0cc9` is now 4× CONFIRMED (13/10–03/11), with no leave used; make-ups `e7cb8771` and `0494ab85` are CANCELLED. **Kept, since Sober has not released it yet.** Close-out on his word.
