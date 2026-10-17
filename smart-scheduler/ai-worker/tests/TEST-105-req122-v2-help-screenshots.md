# TEST-105 — REQ-122 v2: the [?] help screenshots (CONVENTIONS v2 §5.3)

**Tester:** Tanya (QA) · **Brief:** `inbox/QA.md` → "▶️ GO REQ-122 v2 screenshots, part 1"
**Capture only:** no pins, no page edits. The only files written are the PNGs below, in the spec folder's `help/`.

## Part 1 — Team A's 12 pages · 2026-10-16
**Settings:**
- 1280 × 800 viewport; light theme; ⋯ closed, no dialog, no [?] popup;
- the most privileged role that can open each page;
- headless, opened from the folder's `index.html` (file://);
- 0 console errors, 0 dead buttons on every page.

**All 12 are ≤ 150 KB (largest 124 KB).**

| File (`help/`) | Size | Role | Page |
|---|---|---|---|
| `salary-people.png` | 84 KB | CEO | People |
| `salary-person.png` | 91 KB | CEO | Person profile |
| `salary-settings.png` | 124 KB | CEO | Pay settings |
| `salary-payrun.png` | 92 KB | CEO | Pay run |
| `salary-slip.png` | 95 KB | CEO | Slip |
| `salary-my-slip.png` | 82 KB | Coach (Coach-only page) | My slip |
| `salary-entries.png` | 86 KB | CEO | Admin entries |
| `salary-daily.png` | 80 KB | CEO | Daily check-in report |
| `notify-settings.png` | 90 KB | CEO | Notification settings |
| `notify-inbox.png` | 99 KB | CEO | Inbox |
| `frontoffice-teacher-roles.png` | 83 KB | CEO | Teacher: several roles + STAFF |
| `frontoffice-coach-login.png` | 85 KB | CEO | A web login for every coach |

The images hold example data only. Fern adds the pins next. **Part 2 (Team B's 20 pages) waits for their restyle.**
Script (scratchpad): `t105.js`. It can be re-run for Team B by widening its page filter.

## Part 2 — Team B's 20 pages · 2026-10-16
**Settings:** the same (1280 × 800, light, ⋯ closed, no dialog), **CEO on all 20**, the slugs from Silver's list. Every page's own `help.img` points to exactly `help/<slug>.png`.
- **All 20 are ≤ 150 KB (largest 134 KB).** 0 console errors, 0 dead buttons.
- With the files in place, **every [?] popup shows its screenshot** (no placeholder left) and its Thai steps (3–6). The two `help.ask` A/B questions appear in the popups of `fo-payment` and `fo-confirm-camp`.

| File (`help/`) | Size | File | Size |
|---|---|---|---|
| `revenue-summary.png` | 91 KB | `stock-locations.png` | 88 KB |
| `revenue-lines.png` | 134 KB | `stock-sales-record.png` | 88 KB |
| `revenue-manual.png` | 71 KB | `stock-demo.png` | 113 KB |
| `revenue-refund.png` | 88 KB | `stock-low-stock.png` | 80 KB |
| `revenue-categories.png` | 95 KB | `stock-reports.png` | 78 KB |
| `revenue-eca-term.png` | 85 KB | `fo-branch.png` | 70 KB |
| `stock-products.png` | 132 KB | `fo-payment.png` | 80 KB |
| `stock-stock-in.png` | 64 KB | `fo-trial-link.png` | 82 KB |
| `stock-import.png` | 92 KB | `fo-no-teacher.png` | 83 KB |
| `fo-confirm-camp.png` | 67 KB | `reports-home.png` | 63 KB |

### The v2 look, by page (nothing edited)
**Mechanical checks:**
- **Desktop 1280, all 20 pages:** no clipped buttons/badges/cells, no `undefined`/`NaN`/`TODO`, no empty cards, no v1 leftovers (side panel, `box new`), and every page has its [?].
- **Phone 375, all 20 pages:** 0 sideways scroll, and no button or heading goes off-screen (evidence `qa-2026-10-16/test105/phone-*.png`).

| # | Sev | Page | What I see |
|---|---|---|---|
| 1 | 🟡 | **SALES RECORD** (`stock-sales-record`) | **"Save sale" (and Cancel) is 3 px below the 800 px frame**, so the page's key action is **not in its [?] screenshot** and Fern can't pin it. The page is 863 px tall. Either the form gets ~70 px shorter, or the save row moves into the header actions. |
| 2 | ⚪ | Revenue summary | "How refunds count" sits below the frame (y 863), so it is not in the screenshot. |
| 3 | ⚪ | (Team A, part 1) Pay settings, Admin entries | The same thing: Pay settings' "Add school" + 5 "Edit" (the school-distance table at y 1221–1506) and Admin entries' "Save" (y 969) are below the frame of their part-1 screenshots. |
| 4 | 🟡 | **Stock Demo**, phone | Silver's point checked: the **7 header buttons fit (no overflow) but wrap into 4 rows**, and the page header is **204 px**. The red **Write-off** comes second, and the primary **Move A → B** comes last next to [?] (`phone-stock-demo.png`). It works, but it's tall and the order is odd. The site table scrolls inside its box with "WA (Abbey)" cut at the edge and no hint that more columns follow. |
| 5 | ⚪ | F2 · Payment record | The [?] button carries its **red "unanswered" dot**, and that dot is **frozen into `help/fo-payment.png`**. The same applies to `fo-confirm-camp`. Harmless, but the image will always show the dot. Also, the card says **"น้องเอ · paid"** above a **"Confirm and record payment"** button: "paid" before the payment is recorded reads oddly. |
| 6 | ⚪ | Revenue summary | The amount column sits mid-table with a wide empty band before "View lines". It reads fine. |
| 7 | ⚪ | Every revenue line | "Birthday party (Other booking)" is typed **COURSE · Group / Camp**. That's content, for the SA, if the sheet's type list (RENT / OTHER / ระบุเอง) matters. |
| — | ✅ | Reports | The 6 headings with "LATER · รายละเอียดจะคุยกันอีกครั้ง", as REQ-122 asks. |

Script (scratchpad): `t105b.js` (captures + look), `t105c.js` (below-the-fold check across all 32 pages).

## Part 3 — 5 Team B pages re-captured · 2026-10-16
**Settings:** the same (1280 × 800, CEO, light, ⋯ closed, no dialog). On `fo-payment` and `fo-confirm-camp` the red [?] "unanswered" dot was **hidden at capture time only**; no file was edited. 0 console errors, 0 dead buttons.

| File (`help/`) | Size | Main actions inside the frame | Outside the frame |
|---|---|---|---|
| `stock-sales-record.png` | 91 KB | **Save sale** + Cancel (top-right of "New sale"), Products, [?] | none (page is now 822 px; only the end of the commission card is cut) ✅ |
| `revenue-summary.png` | 93 KB | **How refunds count** (now a header action), Every line, Add manual line, Apply filters, Today/MTD/YTD, 7 × View lines | the **8th row's "View lines"** (MANUAL, y 804). It's a repeated row link, not a main action. ⚪ |
| `stock-demo.png` | 115 KB | **Move A → B**, **More**, **Write-off**, [?] (3 header buttons + [?]), the ± row buttons | none ✅ |
| `fo-payment.png` | 80 KB | **Confirm and record payment**, with the **PAID** badge now after it; Add an installment; [?] **with no dot** | none ✅ |
| `fo-confirm-camp.png` | 67 KB | **Confirm camp**, Edit schedule, [?] **with no dot** | none ✅ |

All 5 are ≤ 150 KB. Team A's Pay settings and Admin entries wait for Sober.
Script (scratchpad): `t105d.js`.

## Part 4 — 3 Team A pages re-captured FULL-PAGE (Fern's v2.1 layout) · 2026-10-16
**Settings:** full page, **1280 wide** × the whole height · CEO · light · ⋯ closed, no dialog. The old `help/` files were overwritten. 0 console errors, 0 dead buttons.

| File (`help/`) | Size (px) | KB | Main actions in the first 800 px |
|---|---|---|---|
| `salary-settings.png` | 1280 × 1590 | **80** (palette-encoded; raw 194) | ✅ **Add school** + **Save settings** (header), [?], Add group. The 5 "Edit" links of the school-distance table sit at y 1340–1536, inside the full-page image. |
| `salary-entries.png` | 1280 × 968 | 100 | ✅ the 4 **Save** buttons (OT · Merit · Transportation · Other ±), [?] |
| `salary-slip.png` | 1280 × 1759 | **74** (palette-encoded; raw 170) | ✅ **Download PDF**, Back to Pay run, [?], the Nelson / Kid / Poo switch |

- **Size:** the raw full-page PNGs of Pay settings and Slip were **over 150 KB**. I re-encoded them as a 256-colour PNG with `sharp` (same dimensions; text and colours checked by eye, no visible loss). No page file was touched.
- 🟡 **Admin entries is 21 px too wide at 1280.** The page scrolls sideways (`scrollWidth 1301`). The cause is two `<label>`s in the right-hand **"Other ±"** card ("Person", "Amount", 260 px wide, right edge at 1301). I captured it **clipped to exactly 1280**; nothing visible is cut, because the overflow is the empty part of those label boxes. For Fern/Sober.
- ⚪ **A full-page capture artefact:** the sidebar is fixed to the screen height, so in the tall images **the menu ends at 800 px and the area below is plain grey**. On a real screen it's fine. Mentioning it in case the [?] image looks unfinished to Khwan.
- ⚪ Pay settings has **two "Add school" buttons**: the header and the School distances card.

Script (scratchpad): `t105e.js` (capture), `t105f.js` (overflow check, 1280 clip, palette encode).

## Part 5 — the 3 tall Team A pages once more, after Fern's fixes · 2026-10-16
**Settings:** the same as part 4 (full page, 1280 wide, CEO, light, ⋯ closed, no dialog); old files overwritten. **✅ both checks pass.** 0 console errors, 0 dead buttons.

| File (`help/`) | Size (px) | KB | Sidebar to the bottom | Right edge |
|---|---|---|---|---|
| `salary-settings.png` | 1280 × 1583 | 81 (palette; raw 192) | ✅ white sidebar band down to the last pixel row | ✅ `scrollWidth 1280/1280`, 0 elements past the edge; **one "Add school"** now |
| `salary-entries.png` | 1280 × 968 | 101 | ✅ | ✅ **no overflow any more** (was 1301 in part 4), so no clip was needed |
| `salary-slip.png` | 1280 × 1759 | 74 (palette; raw 171) | ✅ (checked by eye, the whole slip + teaching-hours card) | ✅ |

Pixel check on each image: bottom-left = sidebar white `rgb(255,255,255)`; bottom-right = page grey `rgb(245,247,251)`.
Script (scratchpad): `t105g.js`.
