# TEST-126: REQ-132 (TASK-840 + 841) on sid: the Attention items "ใกล้ใช้ครบ" / "ใกล้หมดอายุ" name the child and link to the course

- **QA:** Tanya
- **Date:** 2026-10-27, ~12:40–13:10 Bangkok
- **Brief:** Porter's GO in `inbox/QA.md` (2026-10-27); `DEPLOY-REQ-132-attention-names-and-links-2026-10-27.md` §4
- **Builds:** sid back `f4aeb39` + TASK-840's 4 files; front `f9f7f9c` + TASK-841's 8 files (the owner: *"deploy sid back front done"*)
- **How:** headless, sid admin, look only. Every dialog closed, nothing saved.
- **No children's names in this file.** Labels are written as `<child> · …`.
- **Screenshots:** `project-docs/qa-2026-10-27/test126/`

## Verdict: ✅ PASS for REQ-132 · plus 🟡 one PRE-EXISTING finding (not from 840 / 841): **cancelled courses are counted in "ใกล้หมดอายุ"** (sid 13 / 39 · **uat 15 / 44**)

## §4.1 "คอร์สที่ใกล้ใช้ครบ"
| | sid, by value | |
|---|---|---|
| Items | **35**; **35 / 35 lead with the child's name** (`<child> · course <size> · เหลือ <n>`); 0 without | ✅ |
| DUO | **2** items name both children (`<child> & <child> · course 6 · เหลือ 2`) | ✅ |
| Link | 35 / 35 carry `link: {kind: "course", id}`, with `link.id` = the item's own id; each is an `<a href="/scheduler/bookings?course=<id>">` on the page | ✅ |
| **Click (a QA course)** | Bookings opens at `?course=<that id>` with **that course's plan window**: title "<child> — plan COURSE 4-session course" (same child, same size), its session table | ✅ |
| **Click (the DUO)** | Bookings opens with "แผนของ <child> & <child> · คอร์ส 6 คาบ", the session table, and the **ตัดจบคอร์ส / เปลี่ยนครู** buttons | ✅ |

- The first click's window was in English because my script set the language after the page had loaded; the later ones were Thai. Not a defect.

## §4.2 "คอร์ส/วอยเชอร์ใกล้หมดอายุ"
| | sid, by value | |
|---|---|---|
| Items | **39**; **39 / 39 lead with the child's name** (`<child> · course <size> · <expiry>`) | ✅ |
| Link | 39 / 39 course links (`link.id` = id) | ✅ |
| **Click (a QA course)** | opens `?course=<id>` with "แผนของ <child> · คอร์ส 4 คาบ …" | ✅ |
| **Voucher** | ⚪ **no voucher on sid expires within 14 days** (`EXPIRING_WITHIN_DAYS = 14`), and a voucher's expiry can't be back-dated. So I opened **the exact URL the link builds** (`/scheduler/bookings?voucher=<QA voucher id>`): the **Vouchers tab is selected** and **that voucher's own window** opens ("แผนของ <QA child> · วอยเชอร์ เหลือ 3 / 5 ชม."). | ✅ by URL · the voucher item itself is unit-tested (841 set) |
| **Unknown id** | `?course=00000000-…`: no dialog, no alert, no error | ✅ |
| The expiry date in the label | still ISO (`2026-11-09`), as the deploy note says | ⚪ known; the possible follow-up is Porter's |

## §4.3 The 08:00 LINE digest is unchanged: counts only
- **By code** (the back diff vs `f4aeb39`: 2 files, +16 / −5): only the two labels gain `childLead()` and a `link`.
  - The digest names people **only for checks flagged `namesPeopleInDigest`**, which are `unconfirmed_bookings` and `teachers_without_line`.
  - **`expiring_entitlements` and `nearly_finished_courses` carry no flag**, so they stay count-only in the digest ✅.
  - Sober's run: digest byte-identical (TH + EN).
- **Live:** SKIPPED. sid has no LINE-linked admin (TEST-111), so no digest reaches a phone on sid. **The live check is the first 08:00 digest on uat after its deploy:** the two lines must still read "…: <number>" with no names.

## §4.4 Menu permission + other items
- **Other Attention items look as before:** every other check's items have **no `link`** and the old label shapes (time · student · teacher; teacher nickname; student name; date · student · n).
- **A user without the Attention menu:**
  - 🔒 **not run live.** It needs a non-admin login on sid, which is DR-3, still with the owner.
  - **By code:** neither the 4 back files nor the 8 front files touch the menu / permission guard, so it's unchanged from before.
- **Errors in every run:** **0** responses ≥ 500 and **0** page errors.

## 🟡 Pre-existing finding (not REQ-132; found because the links make it visible)
- **"ใกล้หมดอายุ" counts CANCELLED courses.** The check takes every course from `getCourses()` and keeps those with sessions left and an expiry within 14 days. `courseEligible` = remaining > 0 and not past expiry: **it never looks at the course's status** (`lib/eligibility.ts:38`).
- **By value** (status read via `/courses?status=…`):

| | "ใกล้หมดอายุ" | of which CANCELLED | "ใกล้ใช้ครบ" | of which CANCELLED |
|---|---|---|---|---|
| **sid** | 39 | **13** (6 QA, 7 other) | 35 | **3** (all QA) |
| **uat** (read only, GETs, today) | **44** | **15** | **49** | **0** |

- **So on uat, about 1 in 3 of the "ใกล้หมดอายุ" items is a course that was already cancelled.** Once 841 is live, กุ้ง will click those and land on a cancelled course. **"ใกล้ใช้ครบ" (the line she asked about) is clean on uat** (49 / 49 ACTIVE).
- **Not a cause statement, just the rule as written.** Whether a cancelled course belongs in either list is a call for Sober / the owner. The fix would be small (status ACTIVE only), but it's not mine to make.


---
## Re-test: TASK-842 on sid (§4 item 5): both course checks count ACTIVE courses only · ✅ PASS
- **Build:** sid back `f4aeb39` + 840 + 842 (the owner: *"deploy sid back done"*); front unchanged since the first run.
- **When:** 2026-10-27 ~16:50 Bangkok.

### Ended / cancelled courses are out, by value
| | First TEST-126 read (840 only) | Now (840 + 842) | Removed | Added |
|---|---|---|---|---|
| "ใกล้หมดอายุ" | 39 | **26** | **13, all CANCELLED** | 0 |
| "ใกล้ใช้ครบ" | 35 | **32** | **3, all CANCELLED** | 0 |

- **Exactly my 🟡 list left;** nothing else changed.
- **Every listed course is ACTIVE now:** 26 / 26 and 32 / 32, by `/courses?status=…`.
- **My own recount** from `/courses?status=ACTIVE` (sessions left > 0, not past expiry; ≤ 2 left, or expiry within 14 days) **= the API lists exactly**: 32 = 32 and 26 = 26, 0 only-mine, 0 only-API.
- **What's still kept out:** by sessions / expiry alone, **15 CANCELLED** courses would qualify; **0 of them are listed**. DROPPED (4), COMPLETED (14) and EXPIRED (7) have none that would qualify.

### Paused (พักคอร์ส) is out too, built on QA data
- No paused course on sid qualified, so I built the case on a **QA course** (`2c28b534`, 2 of 4 left, in "ใกล้ใช้ครบ"):

| Step | Course status | "ใกล้ใช้ครบ" | In the list? |
|---|---|---|---|
| Before | ACTIVE, 2 / 4 used | 32 | yes |
| **Paused** (`POST /courses/:id/drop` ⇒ 200; 2 future sessions removed) | **DROPPED** | **31** | **no** ✅ |
| **Resumed** (`/resume`, 2 Nov 09:00, same teacher ⇒ 200) | ACTIVE | 32 | yes ✅ |

- **Cleanup:** the QA course is ACTIVE again with its 2 remaining sessions re-planned from 2 Nov. QA data only; the QA household may have had pause / resume LINE notices.

### The counts match
- **Attention page headers:** **26** ("expiring soon") and **32** ("nearly finished") = the API counts = the item counts.
- **The digest** takes each check's `count` from the same run, by code. These two checks are still not `namesPeopleInDigest`, so they stay counts-only, now with the same active-only numbers.
- **Live digest:** SKIPPED on sid (no LINE-linked admin). **The uat 08:00 digest after the deploy** should show the "ใกล้หมดอายุ" count drop (≈ 44 → 29 on uat, per the deploy note).

### Items 1–2 still hold (quick re-look)
- **Names:** 32 / 32 and 26 / 26 lead with the child's name; the 2 DUO items name both; every item links with `link.id` = its own id.
- **Clicks:**
  - a QA "ใกล้ใช้ครบ" course and the DUO each open their own plan window;
  - a QA "ใกล้หมดอายุ" course opens its window;
  - the voucher URL opens the Vouchers tab + its window;
  - an unknown id opens nothing, with no error.
- **Errors:** 0 responses ≥ 500 and 0 page errors.

## ✅ VERDICT (TEST-126 with 842): PASS on sid. REQ-132 (840 + 841 + 842) is ready for uat
- **Live checks for uat (read only, mine after the deploy):**
  - every listed course is ACTIVE;
  - "ใกล้หมดอายุ" ≈ 29.
- **The 08:00 digest** the next morning: counts only, the new numbers.


---
## uat READ-ONLY smoke (2026-10-27 ~20:00–20:20 Bangkok; the owner: *"deploy uat back front done"*, back `31cd2d0` / front `e44c38a`)
- **How:** `lib-uat`, every non-GET aborted, so nothing was written. Labels masked; no names here.

## 🔴 Verdict: back ✅ PASS · front ❌ the links are NOT live on uat (the served front behaves like the pre-841 build)

### Back (840 + 842): ✅
| | uat, by value | |
|---|---|---|
| "ใกล้หมดอายุ" | **29** items (the deploy note: ≈ 29 ✅); **29 / 29 name-led**; 29 course links (`link.id` = id); **course status ACTIVE 29 / 29** | ✅ |
| "ใกล้ใช้ครบ" | **49** items; **49 / 49 name-led**; 49 course links; **ACTIVE 49 / 49** | ✅ |
| Page header | "คอร์ส/วอยเชอร์ใกล้หมดอายุ **29**" = the API | ✅ |
| Other checks | no `link`, the old label shapes (unconfirmed 0–1, teachers without LINE 1, incomplete students 303, sales not posted 2, the rest 0) | ✅ |
| No DUO / voucher item on uat today | so the DUO and voucher clicks can't be shown on uat (both were proven on sid) | ⚪ |

### Front (841): ❌ not live
- **The Attention page renders the items as plain text:** **0 `<a>` elements** in the page (0 links to `/scheduler/bookings?…`), although the API sends a `link` on all 78 items. So clicking an item does nothing (the first click timed out after 30 s: there's no link to click).
- **`/scheduler/bookings?course=<a listed course id>` opens no window on uat** (0 dialogs after 9 s). On sid the same URL opens that course's window. So the URL reader (`useOpenPlanFromLink`) isn't in the served front either.
- **The served JS:** on sid, 4 loaded chunks contain the link builder (`/scheduler/bookings?` + `voucher`); on uat only 2, the shared ones. **The 2 chunks that hold 841's code on sid are not served by uat.**
- **Repo check:** `e44c38a` does contain 841 (its 8 files, incl. `attention-link.ts`). So the commit is right and **what uat serves is not that build.**
- **Facts only, no cause:** the uat front process may still be the previous build (a rebuild / restart that didn't take), or something in front of it is serving old files. That's the owner's / Otto's to check on the box.
- **My browser is a fresh headless context each run**, so there's no local browser cache.

### Errors
- 0 responses ≥ 500 and 0 page errors on Attention / Bookings / Reports.

### What it means for the customer
- Today on uat, กุ้ง sees **the names** (and only active courses, 29 / 49), **but can't click through.**
- **Re-check after the front is redeployed:** links present (78), a click opens that course's window, and `?course=<id>` opens it. About 2 minutes, read only.


### uat front re-check after the redeploy (2026-10-27 20:22, the owner: *"deploy uat front ใหม่แล้ว"*), READ ONLY: ✅ PASS
| | uat, by value | |
|---|---|---|
| Links on the Attention page | **78 `<a>` elements** (29 + 49; before: 0) | ✅ |
| Click a "คอร์สที่ใกล้จบ (ต่ออายุ)" item | Bookings opens at `?course=<that id>` on the **คอร์ส + สิทธิ์การลา** tab with **that course's plan window** (the same child's name in it) | ✅ |
| Click a "ใกล้หมดอายุ" course | the same: its own window | ✅ |
| `/scheduler/bookings?course=<a listed id>` typed directly | opens that course's window | ✅ |
| An unknown id | no dialog, no error | ✅ |
| Back, unchanged | 29 / 49 items, all name-led, all ACTIVE; header "ใกล้หมดอายุ 29" | ✅ |
| Errors | 0 responses ≥ 500 · 0 page errors | ✅ |

- **Not on uat today:** a DUO item and a voucher item (none in either list). Both were proven on sid.
- The section on uat is titled "คอร์สที่ใกล้จบ (ต่ออายุ)". That's the existing word, unchanged.

## ✅ FINAL: REQ-132 (840 + 841 + 842) PASS on sid and uat
- **Still open, live:** tomorrow's 08:00 LINE digest on uat (counts only, "ใกล้หมดอายุ" ≈ 29). Porter gets it from the owner.
