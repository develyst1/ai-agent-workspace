# TEST-006: "Interested in hiring" request + admin page
- Source REQ: REQ-004 (R1–R5, AC-1..6); SPEC-005 read for the contract only
- Status: **IN_TEST** — user side + record level TEST_PASSED-equivalent; the admin-page half is NOT_TESTED (needs the owner's Google identity — see §Questions)
- Surfaces: SIT `https://possibility.develyst.online` (FE + API `/api/v1`, build deployed by the owner 2026-09-23) · desktop web 1280×800 · mobile web 375×812 · SIT DB `possibility_db` (one read-only select, one scoped delete — declared)
- Tested: 2026-09-23 by Tanya

## Scope
AC-1..6 on the deployed SIT build with fresh self-service QA accounts (`qa-tanya-hire1/2@example.com`, email+password, created through the real SIT `POST /auth/register`). **Deliberately not covered:** anything that requires being signed in as `siegkung@gmail.com` (the admin page render, the contacted toggle, the admin list content) — QA has no Google session and cannot mint one.

## Cases
| # | Case (from AC) | Type | Surface | Steps | Expected | Actual | Result |
|---|---|---|---|---|---|---|---|
| 1 | AC-1: W-1 press → W-2 confirmation (email + discount), button replaced by disabled W-3 | happy | SIT desktop, TH | As hire1, open `/ideas/46265726-…` (Ordinary idea, 85/70/30), click `สนใจจ้างทำ` | W-2 exact wording with `{email}` and `0%`; W-3 disabled; W-1 gone | `POST /ideas/:id/hire-request → 201` `{"hireRequest":{"id":"d369d59d-…","userTierAtRequest":"Ordinary","discountPercentAtRequest":0,"contactedAt":null}}`; page shows the exact W-2 `ส่งคำขอแล้ว — เราจะติดต่อกลับทางอีเมล qa-tanya-hire1@example.com พร้อมข้อเสนอราคาที่รวมส่วนลด 0% ของคุณ` + disabled `ส่งคำขอแล้ว` button; W-1 gone. Screenshot `../project-docs/qa-2026-09-23/test-006-ac1-th-after-hire.png`. (Hit-test note: before scrolling the button sat below the 800 px fold so `elementFromPoint` returned null at its un-scrolled position; Playwright's real click scrolled it into view — a user scrolls the result page the same way. Not a reachability defect.) | PASS |
| 2 | AC-1 (record half): the request on record carries all Requirement-2 fields | happy | SIT DB (read-only) | `tests/harness/sit-test-006-hire-select.ts` | idea, scores, idea tier, user tier at request, email, name, date | Row present: `user_tier_at_request Ordinary`, `discount 0`, `contacted_at null`, user `QA Tanya Hire1 / qa-tanya-hire1@example.com`, idea `46265726-…` scores 85/70/30 tier `Ordinary`, created `2026-09-22T22:16:34Z` (UTC). **The admin-page rendering of these fields is NOT_TESTED (case 6).** | PASS (record) |
| 3 | AC-2: reopen → W-3; second request impossible | negative | SIT desktop TH+EN, API | Reload the result page; `POST /hire-request` again via API; `GET /ideas/:id` | W-3 shown, no W-1; 409; count unchanged | Reload TH: disabled `ส่งคำขอแล้ว`, no W-1. EN: disabled `Request sent` (exact W-3 EN), no W-1. Second POST → `409 ALREADY_EXISTS`. `GET /ideas/:id` → `hireRequested: true`. DB select after: still exactly 1 row. Screenshots `test-006-ac2-th-reopen.png`, `test-006-ac2-en-reopen.png` | PASS |
| 4 | AC-3: non-admin → "not found"; signed-out → sign-in; admin API refused | negative | SIT desktop TH | As hire1: open `/admin`, `GET /api/v1/admin/hire-requests`, `PATCH /admin/hire-requests/:id`. Signed out: `/admin` + admin API | Not-found; 404; 404. Signed-out → no admin content | Page: W-8 `ไม่พบหน้านี้ — หน้าที่คุณเปิดไม่มีอยู่ หรือไม่ใช่ของคุณ`, no admin copy (screenshot `test-006-ac3-nonadmin-admin.png`). API list → `404 NOT_FOUND`; PATCH → `404`. Signed out: page shows landing/sign-in (no admin copy); API → `401 NOT_SIGNED_IN` (screenshot `test-006-ac3-signedout-admin.png`) | PASS (non-admin + signed-out halves) |
| 5 | AC-6: no admin link anywhere for a non-admin | negative | SIT desktop + 375 px | Crawl `a[href]` on `/ideas`, `/me`, result page; header text | Zero admin links | Zero `admin` hrefs on all three pages at both widths; header never mentions admin; no horizontal scroll at 375 px | PASS |
| 6 | AC-3 admin half + AC-4 + admin list rendering (AC-1 display half, admin copy from REQ-004 §Questions) | happy | SIT | Sign in as `siegkung@gmail.com`, open `/admin`, toggle "contacted", reload | List with all fields; contacted state persists | **Cannot run: admin is Google-only (`siegkung@gmail.com`) and QA has no Google session.** | **NOT_TESTED** — see §Questions |
| 7 | AC-5: tier-at-request snapshot survives a later tier rise | edge | SIT API + DB | hire1 hired at `Ordinary/0%`; then submitted a strong idea (`455a3750-…`, 85/90/80 → idea tier Visionary) → user tier rose to `Visionary/20%`; re-select the row | Row still `Ordinary` / 0% | Row unchanged: `user_tier_at_request "Ordinary"`, `discount_percent_at_request 0`, `user_tier_now "Visionary"` (harness `sit-test-006-ac5-tier-rise.mjs` + `sit-test-006-hire-select.ts`) | PASS (record level; admin-page display of it = case 6, NOT_TESTED) |
| 8 | Edge: user B hires user A's idea | negative | SIT API | As hire2: `POST /ideas/<hire1's idea>/hire-request` | 404, no row | `404 NOT_FOUND`; DB count for my rows unchanged | PASS |

## Defects
None found.

## Observations (for Porter, not defects)
- O-1 The result page still shows the REQ-007 photographic tier image — expected; REQ-008/TASK-015 replaces it.
- O-2 Signed-out admin API answers `401 NOT_SIGNED_IN` while a signed-in non-admin gets `404 NOT_FOUND` — sensible (you must be signed in before "not found" applies); recording so nobody "fixes" it.
- O-3 REQ-004 §Questions admin copy (Porter 2026-09-23): the deployed build predates or matches it — **unverifiable without admin access**; checked as part of case 6 when access exists.

## Test data created
| What | Where | Removed? |
|---|---|---|
| users `qa-tanya-hire1@example.com` (tier now Visionary), `qa-tanya-hire2@example.com` (Ordinary) — created via real SIT register | SIT DB `users` | left as-is (reusable QA accounts; no delete exists; passwords held in session only) |
| 3 ideas under hire1/hire2 (`[QA] …`: `46265726-…`, `7c7702ab-…`, `455a3750-…`) + their `idea_steps` | SIT DB `ideas` | left as-is (no delete exists; declared) |
| 1 hire_request `d369d59d-…` (idea `46265726-…`, snapshot Ordinary/0%) | SIT DB `hire_requests` | **deleted after evidence capture** (`sit-test-006-cleanup.ts`, scoped to `qa-tanya-hire%` rows only) — the owner's admin list stays clean; consequence: that idea's button is W-1 again |
| harnesses `sit-test-006-setup.mjs`, `sit-test-006-hire-ui.mjs`, `sit-test-006-ac5-tier-rise.mjs`, `sit-test-006-hire-select.ts` (read-only), `sit-test-006-cleanup.ts` | coordination repo `tests/harness/` | kept |
| screenshots ×6 | `../project-docs/qa-2026-09-23/` | kept (evidence) |

## Verdict
**User side: PASS, 7/8 cases green** (case 6 NOT_TESTED) — W-1 → W-2 (exact TH wording, correct email + discount) → W-3 in TH and EN, idempotency (409, count unchanged, `hireRequested` DTO flag), not-found isolation for non-admin and signed-out users, zero admin links at desktop and 375 px, cross-user 404, and the tier-at-request snapshot proven against a real tier rise (`Ordinary/0%` frozen while the user became `Visionary/20%`).
**REQ-004 as a whole stays `IN_TEST`**: the admin page itself — AC-3's admin half, AC-4's contacted toggle, the admin list rendering and Porter's new admin copy — is **NOT_TESTED** and no PASS will be written on a code read. What would settle it: one signed-in session as `siegkung@gmail.com` on SIT (options in §Questions).

## Questions
- **Q-1 @Porter (Tanya, 2026-09-23): the admin half needs the owner's Google identity, once.** Options, cheapest first:
  1. **The owner signs in once inside my Playwright-controlled browser** (I open the window; he clicks the Google button once — same as the TEST-001 arrangement). I then run the whole admin suite (list fields, expand, contacted toggle + reload persistence, admin copy check, TH/EN, desktop) in that session. One click, ~10 minutes.
  2. The owner does the click-through himself with a checklist I write, and sends screenshots (TEST-001 option-b precedent). More of his time, weaker evidence.
  3. A QA-only way to mint an admin session (e.g. BE-issued token) — needs a code change and weakens the "admin = exactly one Google account" rule; I do **not** recommend it.
  My recommendation: option 1.
  > answer (Porter 2026-09-23): asked the owner for **option 1** (one Google click in your window, then you run the whole admin suite). Waiting for his word — do not proceed with option 3.
