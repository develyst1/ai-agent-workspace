# HAND-OFF — Team B's work waiting for the NEXT `sid` batch — @Silver → @Porter, 2026-10-05
**Nothing here is deployed, and nothing is committed by us (git is the owner's).** Every TASK below is reviewed. The **ship pairs** are binding.
⚠️ The back tree also holds Team A's uncommitted work (TASK-645). Test counts quoted are this team's runs, not an "all green" claim.

## What is ready, and how it must ship
| Pair | TASKs | Repo | Status | Gate |
|---|---|---|---|---|
| **F5: a digit search floods the list** | TASK-660 | back | ✅ DONE | none |
| **Check-in sentence A′** | TASK-661 | back | ✅ DONE | none (wording approved 10-04) |
| 🔴 **Piece A: a new student needs a parent phone** | TASK-644 (back) + TASK-662 (front) | both | ✅ DONE, FINAL | **ship TOGETHER or not at all.** The server's specific sentence reaches the screen only through 662's `client.ts` branch. |
| **Piece B: no-household children marked and findable** | TASK-663 (back) + TASK-664 (front) | both | ✅ BOTH DONE, FINAL (wording approved 10-05) | ship them as a pair. 663 alone is harmless (a new optional param). |

- **No migration in any of them.**
- **No deploy step** beyond the earlier `teachers.budget-view` grant (REQ-111 batch, already Porter's).

## For QA — ROUTES first, then screens
### API
1. **F5 (660):** `GET /api/bookings?q=Ari3y` and `?q=2` no longer return the whole roster. `?q=081` still finds by parent phone, and `?q=<a name>` still finds by name. A "name + digits" query matches names only (intended).
2. **Piece A (644):**
   - `POST /api/bookings`, `/api/courses` and `/api/vouchers` with `student: { name: "Test Kid" }` and **no phone** → **400 `VALIDATION`**, with `details[0].path = ["student","phone"]` carrying the approved sentence, and **no student row created**.
   - The same with `phone: "0812345678"` → created, and the new student **has a parent**.
   - **`POST /api/courses/import` and `/api/vouchers/import` with no phone → still accepted** (the owner's exemption).
3. **Piece B (663):** `GET /api/students?noParent=true` → only `parentId: null` rows (live). With no param it is unchanged.

### Screens (the web app; no phone needed)
4. **Check-in sentence (661), on a phone, by the owner or Tanya:** with a parent account that has no confirmed class today, tap check-in and scan a QR. Both replies read A′ word for word.
5. **Piece A (662):**
   - New course: type a NEW name, and the phone field is **required** (label "เบอร์ผู้ปกครอง"); there is no Save until there is a 9+ digit phone.
   - Picking an existing student asks for no phone.
   - **Import balance:** a new name with no phone still saves, and its label still reads "(ถ้ามี)".
   - **Booking modal (Team A's screen):** same as New course. An **อื่นๆ** booking with a typed NEW name now needs a phone (owner's ruling; Porter has told the owner).
   - **A server refusal reads as the approved sentence**, not "ข้อมูลที่กรอกไม่ถูกต้อง…".
6. **Piece B (664):**
   - The picker shows a quiet grey **"ยังไม่มีผู้ปกครอง"** tag on a parentless child, and the row is still pickable.
   - **People → the "นักเรียนที่ยังไม่มีผู้ปกครอง" switch** is off by default. On, it lists them with a count and one explainer line, with **no action buttons**.
   - On uat, expect the 17 dormant rows plus any not yet repaired.

## Owner follow-ups still open (not blockers)
- **REQ-111 D:** mark a camp block on a leave day? Grey the day-view header?
- **REQ-113 LAST badge:** badge, list, or both; NO_SHOW on the final date; which team (it needs Team A's file).
