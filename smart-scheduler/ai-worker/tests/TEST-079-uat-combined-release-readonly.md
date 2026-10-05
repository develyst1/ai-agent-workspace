# TEST-079: uat after the combined release (`DEPLOY-uat-2026-10-05.md` §10), READ-ONLY, 2026-10-06

**Tester:** Tanya (QA) · **Env:** uat (https://frontoffice.develyst.online), the customer's system. **READ ONLY:** headless; logins, GETs, opening forms and typing into them, reading. 🚫 No save / submit / confirm was pressed; every form was closed with ยกเลิก / Escape. · **Evidence:** `project-docs/qa-2026-10-06/UAT-*.png`

## 🔴 Verdict: uat does NOT run the new release, on the back end or the front end
| What the new release does (proven on sid, TEST-077/078) | What uat shows today |
|---|---|
| ตินติน `1997fe76` week label = **14** (TASK-650) | API `maxWeek` **13**; card **"ใช้ไป 3/3 · ขยายได้ถึงสัปดาห์ที่ 13"**, expiry 2026-11-21. Arithmetic 22/08 → 21/11 = week **14**. `UAT-A-tintin-card.png` |
| Ordinary course labels = the real expiry | Of 16 ACTIVE never-extended courses, **6 disagree with the arithmetic** (all `maxWeek 13`, e.g. `66904c50` 22/08→24/10 = week 10). That is the old capped value. |
| `GET /students?noParent=…` filters, and `noParent=yes` ⇒ **400** (TASK-663) | `noParent=yes` ⇒ **200**, 50 rows, 49 with a parent. `noParent=true&limit=5` ⇒ 200, **4 of 5 have a parent**. The parameter is **ignored**, so this is the old back end. |
| People switch "นักเรียนที่ยังไม่มีผู้ปกครอง" (TASK-664) | **Not on the page** (switch count 0); the page is the plain parent list (363). `UAT-B-people-off.png` |
| New student on a booking ⇒ "เบอร์ผู้ปกครอง *", Save waits for a phone (TASK-662) | Label **"เบอร์ผู้ปกครอง (ถ้ามี)"** on the lesson tab. `UAT-D-new-name-phone.png` |
| อื่นๆ: Save shut while a new student's phone is invalid (TASK-654) | No student ⇒ enabled · new name, no phone ⇒ **enabled** · `12` ⇒ **enabled** · 10 digits ⇒ enabled. The gate is absent. `UAT-D-other-gate.png` |
| LAST stays on a checked-in final session (TASK-645) | Calendar API 21/09–05/10: **no ATTENDED row carries `courseLast`**. That is consistent with the old rule (the badge leaves after check-in). |
| Neutral refusal title "บันทึกไม่สำเร็จ" | The string IS present in 2 of the 54 loaded front bundles, but it is not proof: it can exist elsewhere in the old front. **Not triggered** (a refusal on uat needs a write attempt). |

`/api/health` and the front expose no version, so I can't name the build uat is on. The REQ-111 week-label fix is absent too, so uat looks like it is on the release BEFORE REQ-111, not just before this batch.

## Not run on purpose (writes on the customer's system)
The admin leave result sentences, today refused on the admin door, a coach's own same-day cancel, a group swap with a rate, and a real refusal for the neutral title. All are writes or write attempts ⇒ a DATA REQUEST, or read from what Khwan's team does. Owner-level LINE and the real phone replies remain the owner's.

## Footprint
None. No save pressed; forms closed. Typed text ("QA อ่านอย่างเดียว", "QA read-only — not saved", phone digits) never left the browser.

📌 **Note (Porter):** the owner's `db:migrate` returning green proved only the DATABASE. It said nothing about the running code: this batch had no migration, so that command could not have failed whatever the server was running. The code itself must be asked (Porter is raising a version endpoint).

## RE-READ after the owner restarted uat — same checks, same order, READ-ONLY · 2026-10-06
Evidence: `project-docs/qa-2026-10-06/reread/UAT-*.png`. No save pressed; forms closed with ยกเลิก / Escape.
| # | Check | Before restart | **After restart** | Reads |
|---|---|---|---|---|
| 1 | ตินติน `1997fe76` API `maxWeek` / card | 13 / "ขยายได้ถึงสัปดาห์ที่ 13" | **14 / "ใช้ไป 3/3 · ขยายได้ถึงสัปดาห์ที่ 14"** (expiry 2026-11-21) | ✅ **NEW (back)** |
| 1b | 16 ordinary never-extended ACTIVE courses | 6 "mismatches" | the **same 6** still read 13, **and that is the NEW rule**, not old code: see below | ✅ NEW (0 wrong by the code's rule) |
| 2 | `GET /students?noParent=yes` | 200 | **400 `VALIDATION`** | ✅ **NEW (back)** |
| 2b | `noParent=true` | 4 of 5 had a parent | **0 of 5 have a parent**; full list **18 rows** | ✅ NEW (back) |
| 3a | People switch | absent | **present, off by default**; OFF: explainer ×0, "พบผู้ปกครอง 363 ราย"; ON: **"นักเรียนที่ยังไม่มีผู้ปกครอง (18)"**, explainer ×1 | ✅ **NEW (front)** |
| 3b | Booking form, new name | "เบอร์ผู้ปกครอง (ถ้ามี)" | **"เบอร์ผู้ปกครอง *"**, บันทึก disabled | ✅ NEW (front) |
| 3c | อื่นๆ Save gate | open at no phone / `12` | no student ⇒ enabled · new name no phone ⇒ **disabled** · `12` ⇒ **disabled** · 10 digits ⇒ enabled | ✅ NEW (front) |
| 3d | LAST on a checked-in final session | none found | **"ดีมาก", coach Camp, 04/10 10:00, ATTENDED, `courseLast=true`**: **LAST** in the week grid AND the day grid | ✅ NEW (back + front) |
| — | Picker tag (read on the way) | — | "ABC (ECA) | ยังไม่มีผู้ปกครอง" (1 tag) | ✅ NEW (front) |
| — | "บันทึกไม่สำเร็จ" | in 2 bundles | in 2 bundles (one bundle name changed, so a new build) | not triggered (a write attempt) |
**⇒ Every check reads NEW, on BOTH processes.** No item is old.

**1b explained (computed, not a deploy problem).** The new rule is `maxWeek = max(the size's normal window, ceil(days to expiry / 7) + 1)` (`lib/leave.ts` `weekOfExpiry`), so the normal window is a FLOOR. My "mismatch" check used plain arithmetic, which is stricter than the rule.
- All 6 courses have an expiry **EARLIER** than their size's normal window. Example: `66904c50` runs 22/08 → 24/10, which is week 10, and the floor of 13 wins. Also `b40c7ec6`, `9937e8cb`, `77f77ebc`, `49ffc9ce`, `c2b5ca7a`.
- The old code showed 13 for them too, so this is not a regression.
- 🟠 **A question for Porter/owner, not a deploy fault:** on those 6 cards "ขยายได้ถึงสัปดาห์ที่ 13" is LATER than the course's own expiry. Should a shortened expiry lower the label?
