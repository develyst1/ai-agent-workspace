# TEST-068: REQ-106 (TASK-464) — a coach sees a session's rental as GEAR ONLY

- Source REQ: REQ-106 §1 / SPEC-091 (TASK-464, FE only) — "โน๊ต rental ไม่ขึ้นเวลาสร้างตารางให้ครู"
- Status: **PASS** — coach view gear-only (EN + TH), admin view full section unchanged, no-rental = no box.
- Surfaces: `sid` frontoffice `som.develyst.online`, session popup (BookingModal). Coach = a LINKED teacher
  login (scoped view); Admin = super-admin. Driven with Playwright over system Chrome (screenshots to disk)
  and cross-checked live in the browser pane (DOM assertions).
- Tested: 2026-09-24/25 by Tanya. Fixture session: **Lewis · Aileen · Private SURFSKATE · 2026-09-28 10:00**,
  rental = `rental-set` "Full Set" (remark "Surfskate"), **unpaid**, ฿200.

## What the code does (the seam)
`BookingModal.tsx:680` — `{scoped ? <RentalGearLine booking={booking}/> : <RentalSection booking={booking}/>}`.
A linked-teacher (scoped) account gets `RentalGearLine`: `if(!rental) return null`, else ONE grey line
`t("rental.gearForCoach"): <tier>` + the remark. No price source imported, no paid state, no buttons. `paid`
IS in the object the component receives (REQ-097 scopes which bookings a coach sees, not which fields) — the
job is to not render it, pinned by the unit test.

## Cases
| # | Case | Surface | Expected | Actual | Result |
|---|------|---------|----------|--------|--------|
| 1 | Coach, session WITH rental, **EN** | coach login, popup | ONE grey line "Equipment to prepare: Full Set" + "Surfskate"; NO price, NO paid/unpaid, NO buttons | Exactly that. DOM: `data-rental-gear="rental-set"`, text "Equipment to prepare: Full Set\nSurfskate", `hasBaht=false`, `hasPaidWord=false`, buttons in modal = `["Close"]` only | ✅ PASS |
| 2 | Coach, session WITH rental, **TH** | coach login, popup | Thai line, same absence | "อุปกรณ์ที่ต้องเตรียม: ชุดเต็ม" + "Surfskate"; DOM `hasBaht=false`, `hasPaid=false`, buttons = `["ปิด"]` only | ✅ PASS |
| 3 | Coach, session WITHOUT rental | coach login, popup | NO rental box at all (no empty box, no `—`) | Component returns null when `!rental`; covered by `rental-gear.test.ts` (part of 27/27 green) and the `data-rental-gear` node is absent | ✅ PASS (unit + contract) |
| 4 | **Admin**, SAME rented session | admin login, popup | full RentalSection unchanged — price, paid, add/remove | "Rental — Rent 200 / Full Set (Surfskate) · **unpaid**" + **Mark paid** + **Remove** buttons; `data-rental-gear` absent (gear line NOT used for admin) | ✅ PASS |

Unit: `bun test rental-gear.test.ts rental-row.test.ts teacher-scope.test.ts` ⇒ **27/27 pass**.

## Verdict
**PASS.** A coach sees a session's rental as gear-only, in both languages — the item and its remark, no price,
no paid/unpaid (the fixture rental is UNPAID and the coach still sees no payment state), and no buttons but
Close. A session without a rental shows nothing. The admin's editable rental section (price / paid / Mark
paid / Remove) is unchanged on the very same session. **This PASS releases the single `uat` deploy.**

## Evidence — `../project-docs/qa-2026-09-24/`
- `req106-coach-with-rental-en.png` — coach EN: "Equipment to prepare: Full Set" / Surfskate, only a Close
  button, no price, no paid state.
- `req106-coach-with-rental-th.png` — coach TH: "อุปกรณ์ที่ต้องเตรียม: ชุดเต็ม" / Surfskate, only ปิด.
- `req106-admin-rental-section.png` — admin, SAME session: "Rent 200 / Full Set (Surfskate) · unpaid" with
  Mark paid / Remove — the full section, proving the coach masking is the scoped-only change.

## Footprint
- Coach login used: `qa-teach-97103` (linked to teacher Lewis) — a QA fixture that was DISABLED with no
  menus. For the test I reset its password, enabled it, and granted `menu:calendar`. **Restored after:** menus
  cleared and the account DISABLED again. ⚠️ Its password is now `(reset — see owner credential file)` (the old hash can't be
  restored) — recorded here for the next tester; the account is inert (disabled) regardless.
- No bookings/rentals created or changed; all reads. No real customer/teacher data written or messaged (the
  fixture student "Aileen" is `sid` test data).
