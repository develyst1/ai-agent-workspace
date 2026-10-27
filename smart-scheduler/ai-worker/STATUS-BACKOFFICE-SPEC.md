# STATUS: the back-office spec (REQ-120 + REQ-122). THE ONE PLACE to know where it stands
**Owner, 2026-10-25, verbatim:** *"โน็ต requirement ทุกอย่าง ไม่ให้ lost แล้วนะ ว่า process spec backoffice ถึงไหน ห้าม lost เด็ดขาด"*.
**Rule:** whoever changes the state of the back-office spec updates THIS file in the same step (Porter owns it). Details live in the files linked below. This file is the map + the current state, never a copy of them.
_Last updated: 2026-10-25 (v3 full answers) by @Porter._

---
## 1. Where it stands (one paragraph)
- **The RULES are 100% agreed** with Khwan. The source of truth is REQ-120 §0–§9.1.
- **The SCREENS are being confirmed on prototype v3**: she has ✓'d / commented on pages 1–5 + 8 of 31. Her words: *"อันนี้อัพเดทเพิ่มค่ะ ยังไม่ครบนะคะ"* (10-25), so she is still reviewing.
- **The price is set internally (≈ 39,200 ฿)**; the owner + Palm are to talk with the customer.
- **The build has NOT started.** It starts on the owner's GO after the price is agreed.

## 2. The process so far (each step: what, when, where it's recorded)
| # | step | date | record |
|---|---|---|---|
| 1 | Owner's brief: "รื้อเยอะ", a back office unique to this school; spec first, the customer proves it, then build | 10-12 | REQ-120 header; `UNDERSTANDING-backoffice-2026-10-13.md` |
| 2 | Inputs read: the 10-11 meeting + her Excel sheet + the old system | 10-13 | `project-docs/customer-2026-10-11-meeting/`; UNDERSTANDING §1–§15 |
| 3 | Confirm round 1 (understanding page) → her answers | 10-13/14 | `project-docs/customer-2026-10-13-backoffice-confirm/` (VERBATIM + PDF) |
| 4 | Confirm round 2 (spec draft) → her answers | 10-14/15 | `project-docs/customer-2026-10-14-backoffice-spec-draft/` (VERBATIM + PDF) |
| 5 | Sizing ≈ 160 d; the owner's money rule | 10-15 | `SUMMARY-REQ-120-sizing-for-owner-2026-10-15.md`; SIZING-REQ-120-*.md |
| 6 | Q1–Q5 (D2–D6) scope decisions → her answers; O12 Miller helmets | 10-15/16 | `project-docs/customer-2026-10-15-backoffice-scope-and-decisions/`; REQ-120 §8 |
| 7 | Prototype v1 → v2 (the real-product look + [?] help) | 10-16 | REQ-122 §1–§5; `project-docs/customer-2026-10-16-backoffice-prototype/` |
| 8 | v2 answers, part 1 + part 2 (32 pages) | 10-19 | REQ-122 §7; `…prototype/khwan-answers-proto-v2-part1/2-…-VERBATIM.md` |
| 9 | 5 confirmations → her answers (C-a, C-j, C-b, C-f, C-e) | 10-20 | REQ-120 §9 |
| 10 | Re-size ≈ 174.6 d | 10-20 | `inbox/PM.md` (Silver 10-20); REQ-120 §10 |
| 11 | 4 follow-ups → her answers (10-21 11:21; Porter missed them until 10-25) | 10-21 | REQ-120 **§9.1** |
| 12 | Prototype **v3** built from all feedback (one .html file), sent | 10-21 | REQ-122 §8; `project-docs/customer-2026-10-22-backoffice-prototype-v3/SOM-BACK-OFFICE-v3.html` |
| 13 | Pricing: the owner's method → **≈ 39,200 ฿**; write-ups sent to Palm | 10-22 | REQ-120 **§10**; `COPY-DRAFT-palm-backoffice-pricing-method-2026-10-22.md`; `COPY-DRAFT-customer-backoffice-price-explanation-2026-10-22.md` |
| 14 | v3 answers, part 1 (pages 1–5, 8) + her F-page question answered | 10-23/25 | REQ-122 **§9**; `…prototype-v3/khwan-answers-v3-part1-2026-10-23-VERBATIM.md` |

## 3. What is AGREED (pointers: never restate rules here)
- **Roles, visibility, notifications, language (English):** REQ-120 §0, D2.
- **Salary** (types, pay lines, bonus, commission, transport, cycle, slip): REQ-120 §1 + §9 / §9.1.
- **Revenue** (types / categories, when each counts, refund = cancel the course + its unattended sessions + tell the families; vouchers the same): REQ-120 §2 + §9 / §9.1.
- **Stock** (products, Stock In, locations, Excel import, **STOCK OUT cart with one bill discount; commission per item, admin may only LOWER**, Demo, Low Stock to chosen people): REQ-120 §3 + §9 / §9.1.
- **Front-office changes F1–F6 + Confirm camp + Payment Method** (default Transfer, editable front + back; installments counted on the received date): REQ-120 §5, §8, §9.
- **Constraints C1–C5** (the bridge chosen): REQ-120 §6.
- **Words:** every rename she wrote. REQ-122 §7.1, §7.4, §9.

## 4. OPEN: what is still missing
| item | owner of the next move | blocks the build? |
|---|---|---|
| v3 pages **6–7, 9–31**: her review (she said "ยังไม่ครบ") | **Khwan** | no (labels / layout) |
| **My slip** (page 6): never answered in any round | Khwan | no |
| **The Payment Detail export**: Excel = section summary, PDF = everything (her new ask, 10-23) | the team to size it with v4 | no (small) |
| **The §4 Reports** (6 headings): content agreed "later" | Khwan, when that part starts | no (built last) |
| **v4 prototype**: all v3 notes + the v4 UX note (✓ every viewed page) + the F-pages shown unmistakably as front office | the team, **after** her full v3 answers | no |
| **The price talk with the customer** (≈ 39,200 ฿) | **the owner + Palm** | **YES: the build starts after this** |
| Her real **Excel stock sheet** (for the import) | Khwan, at the start of the Stock part | only the import |
| **Pay-period examples** (February, 31-day months) | Khwan, at the start of Salary | only the pay cycle |
| Sober confirms his Salary / Stock lines in the re-size | Sober (low priority) | no |

## 5. NEXT STEPS, in order
1. Khwan finishes the v3 review and sends the full export → Porter saves it VERBATIM + updates REQ-122 §9 + this file.
2. v4 (one round) → Tanya's check → Khwan OKs every page → **spec CLOSED** (this file says so).
3. In parallel: the owner's price talk → **the owner's GO** → the build starts with R0.1 users / roles + Stock (the first usable slice). Ask Khwan for her stock Excel then.

## 6. Numbers
| what | value | record |
|---|---|---|
| BO_new, incremental | ≈ 174.6 engineer-days | REQ-120 §10; `inbox/PM.md` Silver 10-20 |
| BO_new, from zero | ≈ 200 d | REQ-120 §10 |
| BO_old, from zero | ≈ 51 d | REQ-120 §10 |
| FO_now, from zero (C1 moved to BO_old) | ≈ 240 d (− 13.3 d for the separately paid permission work) | REQ-120 §10 |
| rate | 73,000 ÷ 277.7 ≈ 263 ฿/d | REQ-120 §10 |
| **price** | **149 d × 263 ≈ 39,200 ฿** (tests / UAT, reports and Palm's screens included, no extra days) | REQ-120 §10 |
| calendar | ≈ 2–3 months; Stock first | SUMMARY 10-15 |

---
## UPDATE 2026-10-25 (later): Khwan finished v3: *"ครบแล้วค่ะ V3"*. ✓ on 29 / 31 pages
- **Screens AGREED.** The remaining notes are words / format, which go straight into the build spec. **No v4 needed.** (REQ-122 §10; verbatim `…prototype-v3/khwan-answers-v3-full-2026-10-25-VERBATIM.md`.)
- **Still open before the build:**
  - (1) the **admin commission edit conflict** (lower only vs raise or lower): asked;
  - (2) **My slip** (page 6) never answered: asked;
  - (3) the size of the new **Excel / PDF export** on Payment Detail (small).
- **Rule change:** the **STOCK OUT discount is per ITEM** (REQ-120 §9.2).
- **Blocking the build:** only the owner's price talk (≈ 39,200 ฿) + his GO.
---
## ✅ SPEC CLOSED, 2026-10-25 15:02: Khwan answered the last 2 points (commission edit = lower OR raise; My slip = as Payment Detail). REQ-120 §9.3. **Remaining before the build:** the owner's price talk (≈ 39,200 ฿) + GO; the SAs' build-readiness review (a data checklist for go-live, defaults to confirm).

---
## 2026-10-27: the build-readiness questions DRAFTED for Khwan (owner: *"ร่างเลย"*)
- One message: 31 A/B questions (Team A Q2–Q25 + Team B Q1–Q11, with duplicates merged) + the data list. Draft: `COPY-DRAFT-khwan-backoffice-build-questions-2026-10-27.md` (a mapping table to the team Q numbers is in its header).
- Waiting for the owner to send. Her answers get saved VERBATIM, then the SAs update their reviews.
- Still blocking the build: the owner's price talk (≈ 39,200 ฿) + GO.

- 2026-10-27: **6 build questions SENT to Khwan** (the short version in `COPY-DRAFT-khwan-backoffice-build-questions-2026-10-27.md`; the owner cut 31 → 6). Every other review question = **the SA's stated default**, shown to her on UAT. The data list is asked when each part starts.
