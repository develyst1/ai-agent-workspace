# TEST-154: uat (the customer's live system), READ-ONLY, after the 2026-11-11 front-office deploy
**Status:** ✅ TEST_PASSED on everything in DEPLOY-NOTE §5 that a read can prove · **1 observation for Porter (O-154-1: uat runs Palm's SOM pies build)** · F5/F2 NOT_TESTED by design.
**Source:** Porter's 23:14 line in `inbox/QA.md` · `DEPLOY-NOTE-uat-2026-11-11.md` §5. **Build:** the owner's 23:14 "uat deploy done Frontoffice" (SB `bfe5ef6`; the SF commit wasn't stated, see O-154-1).
**Instrument:** headless Chrome with the uat card `uat.json` (loaded as-is; it was still valid), at `https://frontoffice.develyst.online/scheduler/*`, in **TH and EN** (`ss.lang`). **Every non-GET request was aborted at the browser.** The only ones tried were Cloudflare's own `/cdn-cgi/rum` beacons, 4 per language. The app sent none. Dialogs were opened and closed with Escape. Nothing was saved, confirmed, cancelled, moved, sold, paid or checked in. Counts and labels only, no names. The screenshots taken showed staff names, so they were deleted and none are kept.

## Results (TH and EN alike)
| §5 check | Result | Evidence |
|---|---|---|
| A child's **camp list opens** (the D1 line) | ✅ | API: `GET /camp/packages` returned **200 on 228 of 228 children** walked. 6 have packages: 36 packages, each with `amountMinor` and the `confirmedOn` key. Painted: People → a child with 6 packages → the Camp card opens (60 lines, the Confirm word shown, no error). The cards of 8 other children, who have no packages, open empty, with no error. |
| A course's **Payment card opens** | ✅ | API: `GET /payments?refType=COURSE` returned **200 × 10** (fee present on 6; the rest have no fee set). Painted: Bookings → Manage plan × 3 → the "การชำระเงิน" / "Payment" card shows, with Payment Method and no load error. |
| **Branch** on New course / Issue voucher | ✅ | Both dialogs show the "สาขา" / "Branch" field with **value Bravo** (the default). Closed with Escape and confirmed closed (0 dialogs open). |
| **"No Teacher"** | ✅ | `GET /teachers`: FREELANCE has 12, of which **1 is `isSystem`, named "No Teacher"**. The calendar draws it as a coach lane, styled like the other coach names. |
| The **SOM dashboard loads** | ✅ | 200, `demographics.base = CUSTOMERS_PLUS_RECENT_1HR`, `activityPackages` and `activityProgram` present. The page painted 17 charts and no error text. |
| Nothing errors | ✅ | No 4xx/5xx from `/api/*` and no page error on som, calendar, bookings, camp or people, in both languages. (The "500" text on the calendar is a price, e.g. "x11,500 / x20".) |
| The outbox stays drained | NOT_TESTED by me | There's no read API; Sector's `uat-select` covers it. |
| F5 / F2 | NOT_TESTED (by design) | They need a cancel or a confirm. They rest on TEST-152. The first real Confirm Course is the live proof. |

## O-154-1: uat shows Palm's SOM per-activity pies (SF `86316ee`), which have never been screen-checked on sid
- The SOM page on uat carries the pies hint, "Vouchers are not counted" / "ไม่นับวอยเชอร์" (`som.pkgHint`). That string arrives only with `86316ee` (Palm's commit).
- The deploy note says the deploy should use `6c63154`, and that `86316ee` is OUT ("ต้องเทสด้วยนะที่ sit ไม่งั้น ไม่ขึ้น uat").
- My inference: SF `dong` = `86316ee` (Porter's 23:10 line), so the owner built `dong`. **Porter confirmed it at 23:16:** the owner built from `production` = `86316ee`. The pies are checked in the add-on below.
- **What it means:**
  - (a) Those pies reached the customer without the sid screen check;
  - (b) **Q-153-1 (what the 1 HR slice counts) is now visible to ขวัญ.**
- The page painted with no error. I didn't judge the pies themselves. Porter's call: keep, or re-check on sid and judge the screen.

## Add-on (Porter 23:16): Palm's SOM pies on uat (SF `86316ee`, confirmed by Porter), READ-ONLY ✅
Same card and guard: non-GET aborted (the only one tried was Cloudflare's own `POST /cdn-cgi/rum`, which is also the page's one console "ERR_FAILED"). Default period (9 Aug – 11 Nov 2026), TH and EN alike; painted vs `GET /api/reports/som` on the same page.
| Check | Result |
|---|---|
| The demographics cards say "based on X of Y customers" / "จากลูกค้า X จาก Y คน" | ✅ 4 panels (Gender, Nationality, Age, Address); the Address panel switches Province/District. Painted = API on all 5: gender 244 · nationality 242 · age 279 · province 270 · district 118 (after the District toggle, a view switch only), **of 317**. Y = 317 = Total customers 232 + 85, and 85 is within the 1 HR card (96) ✓. |
| One pie per activity | ✅ 21 cards = 21 API activities, same order and titles. **17 pies drawn = the 17 activities with total > 0.** The 4 at 0 show an empty grey ring with "0", not blank. |
| The total in the middle | ✅ Every card's centre = the API `total` (0 off), and = Σ of its legend rows. |
| Legend Course {size}x / 1 HR ("คอร์ส {n} ครั้ง" / "1 ชม.") | ✅ Every row's count = the API package count, largest first. |
| 1st Trial below, not in the total | ✅ Each card's 1st Trial line = the API `firstTrial`, outside the pie (e.g. Private SURFSKATE: centre 95 = 62 + 15 + 12 + 6; 1st Trial 35 below). An activity at 0 can still show a 1st Trial (e.g. 5), as designed. |
| Consistent with the Active-course card | ✅ Σ of every "Course" row = **190** = the Active course card (190). |
| Errors / blanks | ✅ None. No 4xx/5xx, no page error, no blank card. |
- **Evidence:** `tests/evidence/test-154-uat/som-activity-pies-en.png` and `-th.png` (the Address panel and all 21 cards; aggregates only, no people).
- **Not judged:** the shades (the spec asks for darker for bigger packages), and the 1 HR slice's meaning (Q-153-1, open). For the record, the 1 HR rows add up to 102 against the card's 96, because a child with 1 HR in two activities counts in each.

## Not tested
The outbox (Sector's read) · F5/F2 · the pies' own numbers (Q-153-1).

## Test data created
**None.** uat was read only (GET). No write was sent. sid wasn't touched.
