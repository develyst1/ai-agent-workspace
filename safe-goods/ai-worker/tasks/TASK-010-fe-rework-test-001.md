# TASK-010: FE rework from TEST-001 — copy on screen, countdown rounds up, cancel confirm, non-integer price
- Source: SPEC-001 (rework of TASK-006..009 per REQ-001 §Rework from TEST-001, R-1..R-8)
- Owner: FE (Fern)
- Status: DONE (2026-09-21, Sober)
- Depends on: none (all nine earlier TASKs are DONE)

## What to do
TEST-001 failed AC-24 only: Porter's late Thai copy (REQ-001 §Additional wording 2) is not
all on screen, plus two Porter rulings (R-6, R-7) and one input case (R-8). Every string
below is in **REQ-001 §Additional wording 2 / §Rework** — copy verbatim, nothing to invent.
Skills per SYSTEM-FACTS Q15: `impeccable` (the `frontend-design` line is dropped).

1. **R-1** `/admin/settings` auto-release result: **ปล่อยเงินอัตโนมัติแล้ว {N} ห้อง**; when N = 0 **ไม่มีห้องที่ครบกำหนด**. No `released:` anywhere.
2. **R-2** `/admin` empty states: parcel queue **ไม่มีพัสดุรอยืนยัน** · payout queue **ไม่มีรายการรอโอนเงิน**.
3. **R-3** `/rooms/new`: visible labels **รายละเอียดสินค้า** (description) and **ราคา (บาท)** (price).
4. **R-4** header logout = icon + text **ออกจากระบบ**; share block copy control = icon + text **คัดลอกลิงก์**, becomes **คัดลอกแล้ว** for 2 s after a successful copy. All `aria-label`s on these controls in Thai (same words).
5. **R-5** room page: section headings **ไทม์ไลน์** · **คำแนะนำ** · **หลักฐานการส่งของ** (the last already exists — keep); **(คุณ)** appended after the viewer's own display name on the party card, colour marker kept. `/register`: AntD `Form` rules with messages shown on blur/submit — required **กรุณากรอกข้อมูลนี้**, email **รูปแบบอีเมลไม่ถูกต้อง**, password length **รหัสผ่านต้องมี 8–72 ตัวอักษร** (keep the disabled-until-valid button if you like; the messages must appear). Apply the same required/email rules on `/login`.
6. **R-6** countdown rounds **up**: `remainingHours = ceil((autoReleaseAt − now) / 3 600 000)`; `d = floor(remainingHours / 24)`, `h = remainingHours % 24`; render **ระบบจะโอนเงินให้ผู้ขายอัตโนมัติใน {d} วัน {h} ชั่วโมง**. Right after delivery (≈ 72 h left) it reads **3 วัน 0 ชั่วโมง**; at 30 min left **0 วัน 1 ชั่วโมง**; never below the true remaining time. Recompute every minute as before.
7. **R-7** **ยกเลิกห้อง** opens a confirm dialog first (AntD `Modal.confirm` is fine): body **ยกเลิกห้องนี้? อีกฝ่ายจะเห็นว่าห้องถูกยกเลิก และห้องนี้จะใช้ต่อไม่ได้** · OK **ยืนยันยกเลิก** (danger) · cancel **กลับ**. Only **ยืนยันยกเลิก** calls `POST /cancel`; **กลับ** changes nothing (AC-12b).
8. **R-8** price input: a non-integer such as `10.5` shows **กรุณาระบุราคาเป็นจำนวนเต็มบาท** under the field and no receipt preview; submit disabled until it is a whole number ≥ 1.

## Definition of Done
Against the running BE; Tanya re-tests from REQ-001, so prove each line the way she will look at it.
- [x] `npm run build` + `npm run lint` clean — paste.
- [x] R-1: `/admin/settings` button with nothing due → **ไม่มีห้องที่ครบกำหนด**; with one due room (`AUTO_RELEASE_SECONDS=5`, `SWEEP_INTERVAL_MS=600000` so the button wins) → **ปล่อยเงินอัตโนมัติแล้ว 1 ห้อง** — page text for both.
- [x] R-2: both empty states seen with 0 rows — page text.
- [x] R-3: both labels visible on `/rooms/new` — page text.
- [x] R-4: header shows **ออกจากระบบ** with the icon; share block shows **คัดลอกลิงก์**; after clicking, **คัดลอกแล้ว** appears then reverts (describe; clipboard itself may stay UNVERIFIED).
- [x] R-5: a room page shows **ไทม์ไลน์**, **คำแนะนำ**, **หลักฐานการส่งของ** and **{name} (คุณ)** on the viewer's card; `/register` with empty name / `abc` email / 5-char password shows the three messages — page text.
- [x] R-6: deliver a room with the default 259 200 s window → countdown reads **ใน 3 วัน 0 ชั่วโมง**; with `AUTO_RELEASE_SECONDS=1800` → **ใน 0 วัน 1 ชั่วโมง** — page text for both.
- [x] R-7: press ยกเลิกห้อง → dialog with the exact body and two buttons; **กลับ** → room unchanged (status, timeline); **ยืนยันยกเลิก** → **ห้องถูกยกเลิก** — page text for both paths (AC-12, AC-12b).
- [x] R-8: type `10.5` → message shown, no receipt, submit disabled; `10` → receipt back — page text.
- [x] AC-24 sweep: list every visible string on the changed screens; no English except proper nouns and user data.
- [x] `git diff --cached` empty; no commit.

## Implementation Notes

**Fern, 2026-09-21.** `safe-goods-front` only; no git commands; `.env` untouched (timer variants passed as process env). Skills: `impeccable` (Q15 — the only mandate now). Port: `:3000` was free when I ran (the other project's server was gone); the FE ran on `:3000`, BE on `:3001`.

**Strings:** all from REQ-001 §Additional wording 2 / §Rework, added to `src/constant/text/th.ts` as `FORM_TH`, `NAV_TH`, `SHARE_TH`, `ROOM_SECTION_TH`, `CANCEL_CONFIRM_TH`, `ADMIN_TH2`. No `released:` and no English `aria-label` remains on the changed controls.

**What changed, per item:**
- **R-1** `Admin/AdminSettings.tsx` — result pill = **ปล่อยเงินอัตโนมัติแล้ว {N} ห้อง** / **ไม่มีห้องที่ครบกำหนด**.
- **R-2** `Admin/AdminQueues.tsx` — `EMPTY_TEXT` per queue (slips / **ไม่มีพัสดุรอยืนยัน** / **ไม่มีรายการรอโอนเงิน**); the wordless dashed box is gone.
- **R-3 + R-8** `RoomNew/RoomNewContent.tsx` — visible labels **รายละเอียดสินค้า**, **ราคา (บาท)**; the price `InputNumber` no longer silently rounds (`precision` removed, `inputMode="decimal"`): a non-integer or < 1 sets `validateStatus="error"` + help **กรุณาระบุราคาเป็นจำนวนเต็มบาท**, the receipt is not computed (`quoteInput` needs `Number.isInteger`), submit disabled.
- **R-4** `AppHeader.tsx` — logout = icon + **ออกจากระบบ**, `aria-label` the same word. `Room/ShareBlock.tsx` — icon + **คัดลอกลิงก์** → **คัดลอกแล้ว** for 2 s (`aria-live="polite"`, Thai `aria-label`s). Added a fallback: if `navigator.clipboard.writeText` rejects (blocked context), select the URL field and `document.execCommand("copy")` — only a successful copy flips the label.
- **R-5** `RoomJoin/RoomContent.tsx` — `SectionHeading` **คำแนะนำ** / **ไทม์ไลน์** (timeline section renders only when there are events); `Room/ActionPanel.tsx` — **หลักฐานการส่งของ** heading over the evidence gallery (it had none — the TASK said "already exists", it did not; added); `Room/PartyRow.tsx` — **(คุณ)** after the viewer's own name, colour kept. `Auth/RegisterForm.tsx` / `LoginForm.tsx` — AntD `rules` with Porter's messages, `validateTrigger={["onBlur","onSubmit"]}`; the disabled-until-filled gate is removed so pressing the button shows every message at once (`onFinish` only fires when valid).
- **R-6** `Room/Countdown.tsx` — `hours = ceil(ms / 3 600 000)`, `d = floor(hours/24)`, `h = hours % 24` (SPEC §Rework rulings); still recomputed each minute.
- **R-7** `Room/ActionPanel.tsx` — ยกเลิกห้อง → `App.useApp().modal.confirm` (body / **ยืนยันยกเลิก** danger / **กลับ**); only OK calls `POST /cancel`. `app/layout.tsx` now wraps the tree in AntD `<App>` (needed for the hook-based modal).

**`npm run lint`** → `> eslint` (exit 0). **`npm run build`** → `✓ Compiled successfully in 5.3s`, `✓ Generating static pages (10/10)`, routes unchanged (`/`, `/admin`, `/admin/settings`, `/login`, `/register`, `/room/[code]`, `/rooms`, `/rooms/new`, `ƒ Proxy`).

**Runs (browser = Claude's built-in; A = เฟิร์นทดสอบ seller, B = ผู้ซื้อบี buyer, seeded admin; rooms prepared with `tests/harness/fe-task008-helper.mjs`; page text = `innerText` of `<main>`):**
- **R-5 register:** `/register`, name empty, email `abc`, password `12345`, press สมัครสมาชิก → page text: `ชื่อที่แสดง / กรุณากรอกข้อมูลนี้ / อีเมล / รูปแบบอีเมลไม่ถูกต้อง / รหัสผ่าน / รหัสผ่านต้องมี 8–72 ตัวอักษร`, fields outlined red. (Login gets the same required/email rules — not exercised separately.)
- **R-6 (default 259 200 s):** room `64TRTCB2` delivered by harness, B's page ≈ 1 min later: **ระบบจะโอนเงินให้ผู้ขายอัตโนมัติใน 3 วัน 0 ชั่วโมง**. **R-6 (`AUTO_RELEASE_SECONDS=1800`):** room `NEKPMWWA`, ≈ 20 s after delivery: **ใน 0 วัน 1 ชั่วโมง**.
- **R-5 room page** (`64TRTCB2`, as B): headings **หลักฐานการส่งของ** (above the evidence thumbnail), **คำแนะนำ**, **ไทม์ไลน์**; party card **ผู้ซื้อบี (คุณ)** in cobalt; header **ออกจากระบบ** with the icon (R-4).
- **R-7** (`SHCJ9VLF`, B opened as buyer, A joined, WAITING_PAYMENT): ยกเลิกห้อง → dialog text `ยกเลิกห้องนี้? อีกฝ่ายจะเห็นว่าห้องถูกยกเลิก และห้องนี้จะใช้ต่อไม่ได้` with buttons `กลับ` · `ยืนยันยกเลิก` (read from `.ant-modal-confirm`). **กลับ** → dialog closes, status still **รอผู้ซื้อชำระเงิน**, both buttons still there, **no `/cancel` request** (network list empty) — AC-12b. ยกเลิกห้อง again → **ยืนยันยกเลิก** → `POST …/rooms/SHCJ9VLF/cancel → 200`, headline **ห้องถูกยกเลิก** (AC-12). (The buttons in the dialog were pressed via a DOM `click()` on the real buttons — the pane's pointer coordinates were off by the zoom at that moment; the dialog itself was opened by a normal click.)
- **R-3 / R-8** (`/rooms/new` as B): page text lists **รายละเอียดสินค้า** and **ราคา (บาท)**; typing `10.5` → **กรุณาระบุราคาเป็นจำนวนเต็มบาท** under the field, receipt absent (`dl[aria-label]` = null), submit `disabled === true`; `10` → message gone, receipt `ผู้ซื้อจ่าย 30 บาท · ผู้ขายได้รับ 10 บาท · ค่ากลาง 20 บาท`.
- **R-4 copy** (`Z6WW6SXX`, WAITING_SELLER_JOIN, as B): share block shows **คัดลอกลิงก์** with the icon; click → **คัดลอกแล้ว** (check icon) → back to **คัดลอกลิงก์** after 2 s (read at +1 s and +3 s). In this browser `navigator.clipboard.writeText` rejects with `NotAllowedError` (automation context), so the `execCommand` fallback is what copied — the URL field shows the selection in the screenshot; the clipboard content itself stays UNVERIFIED.
- **R-1** (as admin, `/admin/settings`): with nothing due (BE at 1800 s) → **ไม่มีห้องที่ครบกำหนด**. BE restarted with `AUTO_RELEASE_SECONDS=5 SWEEP_INTERVAL_MS=600000`, room `XKKCBFNR` delivered and left 6 s → button → **ปล่อยเงินอัตโนมัติแล้ว 1 ห้อง**.
- **R-2** (`/admin`): parcel queue → **ไม่มีพัสดุรอยืนยัน**; after paying out the 7 waiting rooms (harness, test data) the payout queue → **ไม่มีรายการรอโอนเงิน**; slip queue still **ไม่มีสลิปรอตรวจสอบ**.
- BE restored to its `.env` (3-day timer) afterwards; fee settings untouched at 20 / 20.

**AC-24 sweep — strings on the changed screens:** register/login: ชื่อที่แสดง · อีเมล · รหัสผ่าน · สมัครสมาชิก · เข้าสู่ระบบ · กรุณากรอกข้อมูลนี้ · รูปแบบอีเมลไม่ถูกต้อง · รหัสผ่านต้องมี 8–72 ตัวอักษร · switch links. Header: เว็บกลาง · display name · แอดมิน — ตรวจสอบสลิป (admin) · ออกจากระบบ. `/rooms/new`: + รายละเอียดสินค้า · ราคา (บาท) · กรุณาระบุราคาเป็นจำนวนเต็มบาท. Room: + คำแนะนำ · ไทม์ไลน์ · หลักฐานการส่งของ · (คุณ) · คัดลอกลิงก์ / คัดลอกแล้ว · the dialog body · ยืนยันยกเลิก · กลับ. Admin: + ไม่มีพัสดุรอยืนยัน · ไม่มีรายการรอโอนเงิน · ปล่อยเงินอัตโนมัติแล้ว {N} ห้อง · ไม่มีห้องที่ครบกำหนด. No English except proper nouns / user data / the seeded name `Admin`; the description counter `0 / 500` is digits.

**UNVERIFIED:** the clipboard's actual content (see R-4); login-page rule messages (same rules as register, not pressed); real-pointer clicks on the confirm dialog's buttons (DOM click used — see R-7); phone viewport for the new dialog and headings.

**`git status --short`:** modified `app/layout.tsx`, `common/index.ts`, `layout/AppHeader/AppHeader.tsx`, `partials/Auth/{LoginForm,RegisterForm}.tsx`, `partials/Home/HomeContent.tsx`, `constant/text/th.ts`, `lib/api/api-main.ts`, `types/api/main/room.ts`; deleted `partials/Auth/FormError.tsx`; untracked as before (TASK-007..009 files, still uncommitted by the owner). `git diff --cached` empty. No commit. New local test rooms: `64TRTCB2`, `SHCJ9VLF`, `Z6WW6SXX`, `NEKPMWWA`, `XKKCBFNR`; the 7 former WAITING_PAYOUT rooms are now COMPLETED.

## Questions

- **Q1 (Fern → Sober, 2026-09-21) — "หลักฐานการส่งของ (already exists — keep)":** it did not exist on screen before (the gallery was unlabelled); I added it. Just so the review reads the right premise. Not a question that blocks.
- **Q2 (Fern → Sober, 2026-09-21) — register button gating:** I removed the disabled-until-filled gate so the three messages appear on submit as R-5 asks; the rules gate submission instead. Say if Sober/Porter want the disabled state back on top.

## Review
**Verdict: DONE (Sober, 2026-09-21).** Verified on Fern's running servers: lint + tsc clean, `git diff --cached` empty. In the browser: `/rooms/new` shows **รายละเอียดสินค้า** and **ราคา (บาท)**, `10.5` → **กรุณาระบุราคาเป็นจำนวนเต็มบาท** with no receipt (R-3, R-8); room `64TRTCB2` shows **คำแนะนำ** and **ไทม์ไลน์** headings (R-5); header **ออกจากระบบ** (R-4); `/admin/settings` button with nothing due → **ไม่มีห้องที่ครบกำหนด** (R-1). `Countdown.tsx` implements exactly the SPEC §Rework formula (R-6). R-2, R-7 (both paths, no `/cancel` request on กลับ), R-6 page texts and the AC-24 sweep are complete in Fern's notes and consistent with what I saw. No `released:` string remains.
Rulings: Q1 — noted, premise corrected (the heading was new; TEST-001's DEF-5 text was the source of my wording). Q2 — accepted: rule messages on submit are what R-5 asks; no disabled gate needed. Clipboard content and real-pointer dialog clicks stay UNVERIFIED for Tanya.
All TASKs of SPEC-001 (001..010) are DONE → REQ-001 SPEC_DONE for re-test of AC-24, AC-12b, AC-15.
