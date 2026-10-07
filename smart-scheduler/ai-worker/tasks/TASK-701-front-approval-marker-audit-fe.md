# TASK-701 — FE: **the approval-marker audit of `dictionaries.ts` — Team A's rows, byte-for-byte** — @Fern (S, before FRI 16)
**From @Sober to @Fern.** **Owner ruling 2026-10-07 via @Porter: the front marker audit RUNS before FRI 16** — Team A's rows to you, Team B's to @Silver. 🔑 *A label that outlives its meaning is read as the truth by the next person.* The back end has just had the same pass (`TASK-699` §2): 17 flipped, the rest told true.
✅ **Claim (Team A):** `src/lib/i18n/dictionaries.ts` — **comments only** — and any test that pins a marker.

## 1. Scope
`grep -n "DRAFT\|NOT approved" src/lib/i18n/dictionaries.ts` ⇒ **53 lines today.** **Team A's rows only** — a row is Team A's if its comment names a Team A TASK (≤ 659 written by @Sober, or 690–695/699–701) or REQ-112/114/110 Team A work. **Team B's rows (660–689, 696–698, their REQs): 🚫 do not touch; LIST their line numbers** so @Silver's half is bounded. **A row you cannot attribute: list it, do not touch it.**

## 2. For each Team A row — the rule (the same one Jason used)
1. **Find its approval** in `COPY-REVIEW-2026-09-29.md` / `COPY-REVIEW-2026-09-28.md` (incl. the "all other sections approved as drafted" of 2026-10-01 at `:370`, and the owner-approval blocks).
2. **Compare the string BYTE-FOR-BYTE** (normalise only whitespace, backticks, and `{placeholder}` vs `<placeholder>`). **The ` / ` between TH and EN in COPY-REVIEW is the document's notation for a pair, not a character.**
3. **Equal ⇒ flip** to `✅ APPROVED by the owner <date> — <file>:<line>`. **Different ⇒ 🚫 do NOT flip and do NOT fix — LIST it** (key, code text, approved text). **No approval found ⇒ list it.**
4. ⚖️ **NEW owner rule (`SYSTEM-FACTS.md` 2026-10-07): a refusal NO SCREEN can reach** ships with engineer wording ⇒ label it `📋 ENGINEER WORDING — LISTED, NOT APPROVED (owner rule 2026-10-07: a refusal no screen can reach)` — **only if you can SHOW no screen reaches it** (say how).
🚫 **No string changes, no behaviour.** A deletion-only approval (only the CHANGE was reviewed): flip saying exactly that, as Jason did for `add_birthdate_bad`.

## ✅ Done means
**`tsc` · `bun test` with COUNTS · `unhandled-between-tests: 0` · build** · **a table in your report: flipped (line · key · approval line) · NOT flipped (line · key · why) · Team B / unattributed (line numbers only)** · the diff is comments and marker pins only. No mutation set (no behaviour). **Mismatches come to me and go to the owner via Porter — never fixed silently.**

---
## 📋 @Fern REPORT — 2026-10-07 — 🔨 DONE, ready for @Sober
(Re-read the front repo first.) **53 DRAFT/NOT-approved lines → 28.** Method: a read-only sweep compared every string under each marker, EN and TH, with the approval text, **then I re-checked every claimed MATCH myself with a script (the real dictionary string looked up in `COPY-REVIEW-2026-09-29.md`, whitespace/backticks/`{x}` normalised)** — all matched at the cited lines. **Approval used: the owner's 2026-10-01 "all other sections approved as drafted" (`COPY-REVIEW-2026-09-29.md:373`, corroborated `log/2026-10-01.md:164-167`).** **No byte MISMATCH found anywhere** — every string that has an approval equals it. **No refusal "no screen can reach" found** (discount errors: `lib/scheduler/discount.ts:62-68` → `DiscountSection.tsx:89-92`; `adminPastRefused`: `ReportLeaveDialog.tsx:203`) ⇒ no ENGINEER-WORDING label applied.

### ✅ FLIPPED (marker line EN / TH · task · approval)
| lines | task · keys | approval (CR29 = `COPY-REVIEW-2026-09-29.md`) |
|---|---|---|
| 292 / 2408 | 572 · `voucherExpiry.*` (8 keys) | CR29:119-126 (§13) |
| 414, 443 / 2520 | 586 · `camp.weekStatus_CLOSED`, close/open/delete-week (9) | CR29:139-145 (§14) |
| 497 / 2595 | 589 · `leaveDays.markerClasses/markerAway` | CR29:223-224 (§20) |
| 515 / 2611 | 588 · `teacherLeave.advance*` (8) | CR29:208-211 (§19) |
| 587 / 2657 | 592 · `otherSeries.coverNeedsKey` | CR29:254 |
| 662 / 2741 | 574 · `courseStart.newStartHintCurrent` | CR29:94 (§11) |
| 1209 / 3186 | 557 · `bookings.bulkSelectAll` | CR29:13 (§1) |
| 2019 / 3900 | 591 · `addressAskAgain`, `addrPart_*` | CR29:240-242 |
| 2119 / 3955 | 591 · `code.ADDRESS_INCOMPLETE` | CR29:239 |
| 2109 / 3948 | 566 · `code.NAME_DUPLICATE_NEEDS_DETAIL` | CR29:63 (§8) |
| 2116 / 3952 | 566/591 · `code.BIRTHDATE_REQUIRED`, `ADDRESS_REQUIRED` | CR29:70 (§9), CR29:237 |
| 2061 / 3922 | 593 · `alreadyLinkedTo` (+ TH `alreadyLinkedToOne`) | CR29:265-266 — ⚠️ **partly: see below** |
(Also matched and carrying no marker: `code.PHONE_NOW_REGISTERED` CR29:241 — nothing to flip. `forecastTitle/Row/Caveat/preview` (574) CR29:95-98 — inside the 652 block, which stays DRAFT for its other keys.)

### 🚫 NOT flipped — no approval found / partial (listed, nothing fixed)
| lines | key(s) | why |
|---|---|---|
| 119, 237-239 / 2359 | `discount.errPercentRange / errBahtPositive / errValue` | no REQ line, no COPY-REVIEW row (EN only in QA's TEST-057:27) |
| 120 | `attendeeNote.hint` | Porter owns the wording; TASK-179:84-85,107; no approval |
| 529 / 2622 / 2633, 1563 / 3507 | TASK-611 admin leave door: `teacherLeave.admin*` (9) + `teachers.actRecordLeave` | **only @Sober's ruling exists** (log 10-04:319, board:220), not the owner's; EN `adminHint` was tightened and the tightened text is recorded verbatim nowhere; TH are my drafts, in no approval file |
| 585 / 2656 | 577 `otherSeries.coverRate`, `coverRateHint` | no text-level approval (COPY-DRAFT-teamB:18 calls it "approved" in passing, no entry) |
| 600 / 2667 | 564 `otherSeries.scope*`, `coverNote`, `joinNote` | CR29 §2-§4 cover LINE notices/refusals, not these screen strings |
| 1030 / 3023 | 564 `booking.moveThisOnly` | only my log (2026-09-29:277) |
| 652 / 2734 | 571 `courseStart.*` (14 keys: startLabel, edit, title, newStart, newStartHint, warnStale, warnExpiry, warnHandSetExpiry, confirm, doneTitle, expiryMoved, skippedTitle, reconfirmTitle, reconfirmBody) | §11 approved only the five TASK-574 strings |
| 1092 / 3080 | 634 `booking.groupSwapRate`, `groupSwapRateHint` | only my draft (TASK-634:106-108, inbox/SA.md:529 "yours to rule on"); later files call it "approved" with no owner entry |
| 2017 / 3898 | 566 `register.addressOnFile` (+ derived `addressOnFileProvince`) | the sentence is in no COPY/REQ file |
| 2061 (EN only) | 593 `alreadyLinkedToOne` "Linked to {phone} (1 child)." | CR29:266 describes it ("keeps its own sentence") but quotes no string ⇒ cannot compare; marker text says so |
**Mismatches: none ⇒ nothing for the owner via Porter on that count; the "no approval" rows above are the owner's list.**

### Team B / unattributed — line numbers only, untouched
**986, 990, 1239, 1684** (TASKs 662/664/670/669 — they matched "DRAFT" only through a `COPY-DRAFT-…` filename in a comment saying "owner-approved") · **594** (TASK-624 swap rate; same: "✅ covered" comment, Silver's/Porter's draft §B — not mine, untouched). **Unattributed: none.**

### Pins re-aimed (each declared in-file; the rule they protect — an approval state is DECLARED, never silent — is unchanged)
`voucher-expiry.test.ts` (572) · `leave-days.test.ts` (589) · `bulk-confirm.test.ts` (557) · `register-page.test.ts` (regex now also accepts `APPROVED by the owner`). Pins for 571 / 564 / 566-addressOnFile still pass (those markers stay DRAFT).

### Verification
Diff = **comments only** in `dictionaries.ts` (checked: no non-comment line changed; line numbers unchanged) + the 4 pins above. `tsc` 0 · `bun test` **1095 pass / 0 fail, 122 files** · **unhandled-between-tests: 0** · build OK. No mutation set (no behaviour). No git.
**BALL: @Sober.**
