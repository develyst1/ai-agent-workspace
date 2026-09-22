# TEST-005: Visual redesign — "you are the possibility"
- Source REQ: REQ-007 (AC-1..AC-7); SPEC-008 read for the page order / phone rules
- Status: TEST_PASSED — 2026-09-22 (round 2 after TASK-014 redeploy: AC-6 alert 14.16:1, DEF-2 Thai hero wraps at the word boundary; round 1 was TEST_FAILED on DEF-1)
- Environment: **SIT only** — `https://possibility.develyst.online`, build deployed by the owner 2026-09-22; desktop 1024 px + emulated 375×812
- Tested: 2026-09-22 by Tanya

## Scope
The seven ACs on SIT with my `qa-tanya-pw1/2/3` accounts (TEST-004). Tiers forced per Sober's note: Ordinary / Visionary / Raw Diamond came from real analyses (TEST-003), Seeker / Raw Diamond (again) / The Possibility from my own fixture rows (`tests/harness/test-005-tier-fixtures.ts` — writes only `qa-tanya-pw2/3`). Contrast measured with a DOM script (WCAG 2.x relative-luminance formula; text over photographs judged by eye). Lighthouse 74 is the accepted baseline (Porter) — not measured by me.

## Cases
| # | Case (from AC) | Type | Steps | Expected | Actual | Result |
|---|----------------|------|-------|----------|--------|--------|
| 1 | AC-1 landing desktop + 375: hero fills the top, W-1/W-2 readable over it, Google button the one gold element, email form below, no overflow | happy | Signed-out `/`, TH + EN, 1024 px and 375×812 | As stated | Hero `hero-glowing-stone-wide.jpg` at 1024 / `-tall.jpg` (375×558) at 375; W-1 `คุณคือความเป็นไปได้` / `You are the possibility`, W-2 under it, readable (off-white on the dark image, by eye); Google button first, then `or use email` + form; `scrollWidth` = viewport on both. **Google button is dark outline, not gold** — SPEC-008 amendment (GIS forbids styling) accepted by Sober; the gold on the landing is the link `ยังไม่มีบัญชี? สร้างบัญชี`. **Thai W-1 breaks mid-word at 375 px: `คุณคือความเป็นไป / ได้`** — DEF-2 | PASS (layout) / DEF-2 cosmetic / Google-not-gold = SPEC amendment, Porter to confirm |
| 2 | AC-2 each tier's image on the result page and `/me`, TH + EN | happy | Ordinary: `/me` (pw1 before its first idea) + result `2f0931be`; Seeker: pw2 `/me` + result `6ff813a0` (fixture); Raw Diamond: result `cd40b60d` (real) + pw2 `/me` (fixture); Visionary: result `675689e9` + pw1 `/me`; The Possibility: pw3 `/me` + result `41eccfbe` (fixture) | R2 mapping | `currentSrc` read after load: Ordinary → `ordinary-hands-stone-wide.jpg` · Seeker → `seeker-crack-hands-wide.jpg` · Raw Diamond → `raw-diamond-hands-wide.jpg` · Visionary → `visionary-half-hands-wide.jpg` · The Possibility → `the-possibility-diamond-wide.jpg`; at 375 px the `-tall` file (`visionary-half-hands-tall.jpg` 375×558). Same image in TH and EN (checked Seeker, Visionary, The Possibility in both). Loading (`/ideas/new` while analysing) and empty list → `spark-wide/tall.jpg` | PASS |
| 3 | AC-3 loading: spark image breathes + W-4, no spinner, until the result replaces it | happy | Three real submissions (TEST-003 #1) | As stated | During analysis `main` = `AI กำลังวิเคราะห์ไอเดียของคุณ…` / `The AI is analysing your idea…`, one `<img>` `spark-wide.jpg`, CSS animation `IdeaForm-module__…__breathe` running, `.ant-spin`/spinner count 0; replaced by the result page on 201 (~12–25 s) | PASS |
| 4 | AC-4 result page order = R6; scores as gold bars with axis labels; reason as a quote | happy | Result pages of all five tiers, DOM order read | R6 order | DOM order: heading `ตอนนี้คุณอยู่ตรงนี้` → tier `<img>` → `<h2>` tier name → W-3 line → `<dl>` three axis rows (label + number + thin gold bar) → `<blockquote>` reason + cite `เหตุผลจาก AI` → discount line (`และเพราะแบบนั้น เราให้ส่วนลด 20% …`) → **hire button slot (TASK-009 not built — absent)** → `<h3>` `สิ่งที่คุณเล่าให้เราฟัง` collapsed with `ดูข้อความ`/`ซ่อน` toggle (works, text appears/hides). Bars gold, labels = REQ-003 axis labels | PASS (hire button pending TASK-009) |
| 5 | AC-5 language switch: no layout shift, all wording switches (REQ-005 regression) | happy | Result page `cd40b60d` TH→EN: positions of img/h2/dl/blockquote/h3 and page height before/after; landing, `/me`, list, not-found in both languages | No shift, all strings switch | Positions `[146,1194,1329,1510,1922]` and height `2035` identical TH vs EN; every REQ-007 string seen in both languages (W-1, W-2, tier lines ×5, result heading, discount line, empty state, W-4 collapsed heading/toggle), plus W-8 not-found and W-9 dates (`22 ก.ย. 2026` / `22 Sep 2026`) | PASS |
| 6 | AC-6 contrast ≥ 4.5:1 for body text on three sample pages | a11y | DOM contrast script on `/` (signed out), result page `675689e9`, `/me`, `/ideas` — every text node vs its effective background; alerts measured separately | All ≥ 4.5 | Landing: all pass except the *disabled* Sign-in button (2.0:1 — inactive control, WCAG-exempt); result page: 18 nodes, min **7.82**; `/me`: 13 nodes, min 7.82; `/ideas`: min 7.15. Text over the hero/tier photos: readable by eye. **The antd error `Alert` (W-4 wrong password): 1.14:1 — TEST-004 DEF-1** (off-white text on antd's light error background). W-6 uses the same component (not triggerable on SIT) **Round 2 after TASK-014: the error alert measures 14.16:1 (`rgb(235,231,224)` on `rgb(39,21,19)`), TH + EN, desktop + 375 px — DEF-1 closed** | PASS (round 2) |
| 7 | AC-7 regression smoke of REQ-002/003/004/006 after the redesign | regression | REGRESSION.md R-1..R-9 subset + TEST-002/003/004 runs on this build | Still pass | R-1 (guard/landing), R-5 (sign-out), R-7 (401/204) re-run on SIT — PASS; REQ-003 UI ACs PASS (TEST-003); REQ-006 behaviour PASS (TEST-004); REQ-004 FE not built | PASS |

## Defects
### DEF-1 — see `tests/TEST-004-email-password-login.md` §Defects DEF-1 (W-4 alert 1.14:1) — MAJOR, failed AC-6 in round 1 — **FIXED (TASK-014), verified 14.16:1 on SIT 2026-09-22.**
### DEF-2 — Thai hero headline W-1 breaks inside the word at 375 px — COSMETIC — **FIXED (TASK-014), verified 2026-09-22: at 375 px the headline wraps `คุณคือ` / `ความเป็นไปได้` (second part one line, 64 px), no overflow; the ZWSP after "คุณคือ" is the intended break hint (Sober), not a wording defect.**
- Environment: SIT, `/` signed out, TH, 375×812.
- Repro: open `/` in Thai at 375 px wide.
- Expected: `คุณคือความเป็นไปได้` wraps at a word boundary (or not at all).
- Actual: line 1 `คุณคือความเป็นไป`, line 2 `ได้` — the word `เป็นไปได้` is split (Thai has no spaces; the browser's line breaker cut it). Fern noted a "Thai W-1 line break" fix in TASK-013; at 375 px on SIT it still splits.
- Evidence: 375 px screenshot viewed live 2026-09-22; `h1` rect 449–541 (two lines).

## Observations (for Porter)
- O-1 Google button not gold (SPEC-008 amendment) — AC-1's "the Google button is the one gold element" no longer matches the SPEC; the wording should follow whatever the owner accepts.
- O-2 First load of each tier image on SIT is slow (5–10 s cold `/_next/image`); thumbnails on `/ideas` appear after ~3 s (lazy). Not an AC, but visible.
- O-3 Phone header shows name only (no email) — TEST-004 Q-2.

## Test data created
| What | Where | End state |
|------|-------|-----------|
| tier fixtures on my own rows: `qa-tanya-pw2` (tier Raw Diamond, one `[QA-FIXTURE]` idea 70/62/74), `qa-tanya-pw3` (tier The Possibility, one `[QA-FIXTURE]` idea 95/92/96) — no `idea_steps` | SIT DB | left as-is (synthetic; never counted as real analyses) |

## Verdict
**`TEST_PASSED`** (round 2, 2026-09-22 after the TASK-014 redeploy) — REQ-007 holds on SIT: hero + tier imagery per R2 for all five tiers (TH/EN, desktop/phone), breathing spark loading with no spinner, R6 result order with gold bars and the reason as a quote, zero layout shift on language switch, body text ≥ 7:1 everywhere and the error alert now 14.16:1 (DEF-1 fixed), Thai hero wraps at the word boundary (DEF-2 fixed), regression green. AC-1's "Google button gold" line follows the SPEC-008 amendment (Porter Q-1 confirmed). Observation only: after TASK-014 the GIS button renders in its light theme (white) rather than the dark outline seen in round 1 — still not gold, still Google-rendered; flagged for Porter, not a defect against any AC. Round 1 (same day, before the fix) was TEST_FAILED on AC-6 — kept above for the record.

## Questions
- **Q-1 @Porter (Tanya, 2026-09-22):** AC-1 "the Google button is the one gold element" vs SPEC-008's amendment (GIS cannot be gold; button is dark outline, the gold element is the create-account link). I have not failed AC-1 on it — please confirm the amendment is the owner's accepted reading, or the AC line needs the owner's word.
  > answer (Porter 2026-09-22) Q-1: **confirmed** — SPEC-008's amendment stands (GIS forbids styling; Google button dark outline, the gold element on the landing is the create-account link). REQ-007 AC-1 amended. DEF-1 + DEF-2 routed to @Sober.
