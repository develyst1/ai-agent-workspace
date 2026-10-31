# REQ-124: A new project, not Health Board, built through I-Space end to end, locally
- Status: **DELIVERED** (2026-10-31 03:2x, the PM — the owner's finish line met locally on committed HEADs; no git needed; DEF-2 → REQ-126 round 2; DECISIONS 2026-10-31 03:2x) · **TEST_PASSED round 2** (2026-10-31 03:18, QA Tanya — new product "สมุดยืม-คืนหนังสือในออฟฟิศ": 8/8 points work, 0 interventions, 9/9 notes, roles kept; DEF-2 for REQ-126; `tests/TEST-122-…` § Round 2) · round 1 **TEST_FAILED** (2026-10-31 00:54, QA Tanya — AC-3: 4 cards in review with no note, BE routed server cards through the FE; AC-1/2/4 PASS; findings F-1…F-5; `tests/TEST-122-full-loop-rehearsal-new-project.md`) · READY_FOR_SA → **QA first** (2026-10-30 23:3x, the PM) — this REQ is a test run. The SAs get only what it finds.
- Priority: HIGH `[operator]`
- Requested: 2026-10-30 23:32 by the owner (via Atom): *"ให้ทำงานโปรเจคนี้ให้จบ แค่นั้น — โฟกัสทำตัวโปรเจค I-Space ให้จบ (ฟีเจอร์/บั๊กของ Blueprint+CAW จนสร้างโปรเจคผ่าน I-Space ได้ครบลูป) ไม่แตะ deployment/server/pm2 เลย"* (`DECISIONS.md` 23:3x; `SYSTEM-FACTS.md` § "Deployment side is off-limits"). This is plan step 7 of `../project-docs/plan-sit-th.md`, without the install docs and without SIT. `[PM-decided]`
- Deadline: none

## Problem / Goal

Every live proof so far (REQ-108, 121, 122) used the same Health Board spec, so the team may pass because it already knows that project. The owner's finish line is that **a project can be built through I-Space, full loop, the way he would build it himself**. This run proves it on a project the team has never seen, through the real screens only, and turns whatever gets stuck into the next rounds of work.

## Requirement

1. QA picks a small new product that is **not** Health Board. It must have a page, a server part and data, and fit in about 6–10 cards. QA writes it down before starting, in plain Thai, the way the owner would type it. `[PM-decided]`
2. The whole loop runs **through the screens only**, exactly as the owner would use them: Blueprint (a new project, sources or typed requirements, interview with the gateway if needed, version label) → "ส่งไปสร้างที่ CAW" → CAW (folders, "ใช้ทีมเริ่มต้น", อัตโนมัติ) → the team builds → the owner's reviews (QA acts as the owner and logs each one) → the product runs locally. No API calls by hand, no file edits by QA in the product folder.
3. **Every point where the owner would have to guess, wait, fix something by hand, or ask the team** is recorded as a finding, with its screen, what was expected, and what happened.
4. Code as committed (`atom` HEADs; caw-back/caw-front **without** the kept uncommitted REQ-123 B work — run from exports of the HEADs). Real Claude CLI (allowed, DECISIONS 2026-10-29 13:01), ≤ 2 full runs. LLM gateway ≤ 6 calls (PM's scope line, 08:4x). `free -m` before each run; stop if < 3 GB.

## Acceptance Criteria

- [ ] **AC-1** — **Given** the new product written down by QA **When** QA goes from an empty Blueprint project to a finished product through the screens only **Then** the product runs locally and does what its spec says. Each requirement is checked by hand and marked works / does not. Check: QA, a run log with screenshots and the product checked against each requirement.
- [ ] **AC-2** — **Given** the same run **When** it is reviewed **Then** the number of times "the owner" had to step in beyond the reviews the system asks for is recorded, and each one is a finding (req 3). Zero is the goal; the count is the result. Check: QA's findings table.
- [ ] **AC-3** — each card that reached review says what was done and how to try it (TEST-119 O-3 watch). Each role works on its own cards (TEST-119 O-1, TEST-121 O-2 watch). Check: QA, from the board and the cards.
- [ ] **AC-4** (regression) — no live run leaves a process running (`ps`), and memory recovers after the run (`free -m`).

## User-facing wording

None new. Findings that need new words come back to the PM.

## Out of Scope

- Anything on the deployment side: pm2, server, install docs, `.env` / Linux setup (owner 23:31 / 23:32). · Login / auth (owner 10:51: later). · Typing into a worker's live screen (11:41 item 9 step 2: a later feature, not needed for the loop). · Fixing anything during the run: QA records it; the PM routes it afterwards.

## Questions
(the SA and the QA ask here; the PM answers as `> answer: ...`)

## Verification (by QA)
Tanya, 2026-10-31 00:54 — committed HEADs (tree-fp.sh same 00:35/00:54): bp-back 08e1e4d `c51f8477e700` · bp-front 6a64527 `3a86ddf81dbf` · caw-back 2426d9a `e1be4e88f4d1` · caw-front a009d2c `3ce60b3d3217`; product "สมุดรายจ่ายประจำวัน" (new, written first); 1 live run, 13 hops, gateway 0. Detail TEST-122.

| AC | Verdict | What I checked myself |
|---|---|---|
| AC-1 | PASS | screens only: home → 9 typed requirements → v1 → button → team → folder → chat → accept → อัตโนมัติ → 8 reviews on the card page → `node server.js`; all 7 points work by hand (add, latest-first + time, totals, delete with confirm, restart keeps data, amount > 0 in Thai, :3920 Thai only) |
| AC-2 | PASS (0) | no owner guess / wait / hand fix / question beyond the flow; F-1, F-2 recorded |
| AC-3 | **FAIL** | #4–#7 reached review with no note (F-3); แบงค์ handed #1–#3 to ฝน, who only set review (F-4) |
| AC-4 | PASS | no port, runner or open worker left; memory 5.1 → 6.4 GB |

Add-on: the clean-blue ✓ is a check mark again (Anuphan from Google). Findings: F-1 MAJOR one "ตามนั้น" marked 4 questions answered · F-2 duplicate open proposal · F-3 · F-4 · F-5 QA worker's 58 MB Chrome profile left in the product folder.


## Round 2 (PM, 2026-10-31 02:5x) `[PM-decided]` (DECISIONS 2026-10-31 00:5x, 01:1x, 02:3x)

Same requirements and ACs as round 1, on **another new product** (not Health Board, not "สมุดรายจ่ายประจำวัน"), committed HEADs: bp-back 08e1e4d · bp-front 6a64527 · caw-back 5b49f65 · caw-front 7f68c42. ≤ 2 live runs, gateway ≤ 6, `free -m` first (stop < 3 GB). This run also carries:
- **REQ-125 AC-4:** every card that reaches review has a note with both parts ("ทำแล้ว:" / "ลองได้โดย:"), and no server card is closed by the FE without work.
- **REQ-126 AC-5:** a chat with several questions is answered one by one, and the finished product folder holds no worker junk. Watch TEST-124 DEF-1 (loose scratch files) and O-1 (a worker refused for another worker's folder).
- **Pass = the owner's finish line:** a new product built through I-Space, full loop, screens only, 0 owner interventions, every card reviewable from its note.

### Round 2 — verification (by QA, Tanya, 2026-10-31 03:18)
Trees (tree-fp.sh, same 02:57 / 03:18): bp-back 08e1e4d `c51f8477e700` · bp-front 6a64527 `3a86ddf81dbf` · caw-back 5b49f65 `32a65f35c337` · caw-front 7f68c42 `f91e9b59a4f2`. 1 live run (of ≤ 2), gateway 1 `GET /models` / 0 chat (≤ 6).

| AC | Verdict | What I checked myself |
|---|---|---|
| AC-1 | PASS | all 8 points by hand on :3930, incl. restart (data in `data/books.json`) |
| AC-2 | PASS | 0 owner steps beyond the flow and the 9 reviews |
| AC-3 | PASS | 9/9 notes both parts; each card by its own role, no BE → FE hand-off (= REQ-125 AC-4) |
| AC-4 | PASS | all stopped by pid; ports/processes clear 03:18 |
| + REQ-126 AC-5 | PASS | 2 questions one by one; no worker junk in the product |
| + REQ-126 req 3 | **FAIL → DEF-2** | a reworded second plan kept a live button; pressing it → 9 → 18 cards |

Memory dipped to 2,555 MB at 03:07 for ≥ 21 s (a worker's own tool run); back to 6.6 GB by 03:10 — noted, see TEST-122 § Round 2.
