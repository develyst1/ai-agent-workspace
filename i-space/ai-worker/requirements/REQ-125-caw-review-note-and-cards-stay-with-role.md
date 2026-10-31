# REQ-125: A card in review always says what was done and how to try it; a server card stays with the BE
- Status: **TEST_PASSED** (2026-10-31 01:29 + AC-4 live 03:18, QA Tanya — AC-1/2/3/5 on the stub; AC-4 PASS in REQ-124 round 2; `tests/TEST-123-review-note-and-builder-handoff.md`) · READY_FOR_SA (2026-10-31 00:2x, the PM)
- Priority: HIGH `[operator]`
- Requested: 2026-10-31 00:24 by the owner (via Atom): *"รีบเก็บให้ครบร้อยเปอร์เซ็นต์จะได้ลองโพรดักต์จริง"*, which names the watch-list bugs (`DECISIONS.md` 2026-10-31 00:2x). Source findings: TEST-119 O-3, O-1 · TEST-121 O-2.
- Deadline: none · Team: **B (CAW)** · runs in parallel with REQ-124 (QA tests REQ-124 on committed HEAD exports)

## Problem / Goal

The owner reviews each card that CAW's team finishes. Twice in live runs, a card reached review with no note at all (TEST-119 O-3: card #5, where ฝน wrote `app.js` and said nothing), so the owner reviewed it blind. Twice the BE handed a server/API card to the FE, who closed or reviewed it without doing any work (TEST-119 O-1, TEST-121 O-2). That costs a hop and blurs who built what. With both fixed, the owner can review each card from its note alone, and each card is built by the role it belongs to.

## Requirement

1. **A card can reach review only with a note** that says, in plain Thai: what was done (files or parts) and how the owner can try it (a command, a page to open, or "nothing to try" with the reason). A worker that moves a card to review without such a note is stopped by CAW, and told what is missing. It is not stopped silently.
2. **A server/API card stays with the BE.** A hand-off of a card to a role that is not the card's role is refused unless the hand-off says why the other role is needed (e.g. "needs the page part"). A refused hand-off tells the worker why. Which card is "server/API" comes from the card itself (its role/kind/anchor). How that is read is the SA's design.
3. Everything that works today keeps working (REQ-117…122: hand-offs by name, card by card, open workers, parallel team, stop reasons).

## Acceptance Criteria

- [ ] **AC-1** — **Given** a worker (stub) that moves its card to review with no note **When** CAW receives it **Then** the move is refused with a message naming what is missing, and the card stays where it was. Check: QA, stub.
- [ ] **AC-2** — **Given** a worker (stub) that moves its card to review with a note that has both parts **Then** the card is in review and the owner sees the note on the card. Check: QA, stub + the card on screen.
- [ ] **AC-3** — **Given** the BE (stub) hands its server card to the FE with no reason **Then** the hand-off is refused with the reason, and the card stays with the BE. **And given** the same hand-off with a reason **Then** it goes through. Check: QA, stub.
- [ ] **AC-4** (live, 1 run, gateway 0) — **Given** a new project on real Claude CLI **When** the team runs **Then** every card that reaches review has a note with both parts, and no server card is closed by the FE without work. Check: QA, live; the cards. May be folded into REQ-124's live run if timing allows `[PM-decided]`.
- [ ] **AC-5** (regression) — caw-back + caw-front suites; REQ-119/120/121/122 cases pass.

## User-facing wording (the PM)

| Where | TH |
|---|---|
| refusal to the worker, no note | ยังส่งตรวจไม่ได้ — เขียนบันทึกก่อนว่าทำอะไรไปบ้าง และเจ้าของจะลองได้อย่างไร |
| refusal to the worker, hand-off to the wrong role | ส่งต่อการ์ดนี้ไม่ได้ — การ์ดนี้เป็นงานของ {role} ถ้าต้องให้ {other} ช่วย ให้บอกเหตุผลในการส่งต่อ |

Those lines are read by the worker, not the owner. The SA may adjust the wording to fit how a worker reads it. The owner-visible note is the worker's own text.

## Out of Scope

- Anything on the deployment side (owner 2026-10-30 23:31). · Judging how good a note is: only that both parts are there. · Typing into a worker's screen.

## Questions
(the SA and the QA ask here; the PM answers as `> answer: ...`)

- **Q1 (SA B, 2026-10-31 00:3x, non-blocking — I design on these defaults; correct only the line that is wrong).** Checked: DECISIONS 2026-10-31 00:2x, REQ-121 (chain SA → BE → FE/QA), SYSTEM-FACTS — the "card's role" and which hand-offs count are not covered. Evidence: the cards of REQ-108/121's live runs are anchored on `REQ-…` keys (one card per requirement), so an anchor such as `API-` / `SCR-` does not exist on them and cannot say "server card".
  - **(a) A card's role = the builder role of the worker the card was made for** (the proposal's `workerId`, kept at `card.created`): `BE` if that worker has BE and not FE, `FE` if FE and not BE, else none (a planning card for the SA, a test card for QA, a worker with both). A card with no role has no hand-off rule.
  - **(b) Only a hand-off from one builder to the other needs a reason:** a BE-role card to a worker without BE but with FE, and the same the other way round. **A hand-off to QA, SA, PM, BA or `other` never needs one** — BE → QA is the normal chain (REQ-121), and refusing it would stop every test hand-off.
  - **(c) "Says why"** = a new, separate `reason` field on the hand-off (non-empty). CAW cannot judge meaning in free text, so a field is the check (as REQ-114 r2: the server checks deterministically). The reason is kept in the hand-off note, so the owner sees it.
  - **(d) The review note** = two new fields when a worker moves a card to `review`: `done` (what was done) and `howToTry` (how the owner tries it, or "nothing to try" with why), each non-empty. CAW writes them as **one note on the card** in the same write, and the owner sees it among the card's notes. Its two labels are user-visible: **default `ทำแล้ว:` and `ลองได้โดย:`** (the PM's words win).
  - **(e) Only a worker needs the note.** The operator moving a card to review on the screen does not. A worker setting `done` directly is not changed (REQ-125 names review only; QA closing a card after its own test stays as today).
  - **(f) The two refusal lines** = the REQ's table, as the API error message the worker reads. `{role}` / `{other}` are filled with the role codes (`BE`, `FE`).
  > answer (Porter, PM, 2026-10-31 00:3x) `[PM-decided]`: **(a)–(f) accepted as written.** Labels: `ทำแล้ว:` and `ลองได้โดย:` are the final words. (b) is right: BE → QA must never need a reason. On (e): a worker setting `done` directly stays as today. If REQ-124's live run shows cards being closed with no review and no note, that comes back as a round of this REQ. It is not added now.

## AC check
(SA B, Silver, 2026-10-31 01:1x — SPEC-124; TASK-166/167 DONE, uncommitted: caw-back 2426d9a fp `a8e76ef8bc69` · caw-front a009d2c fp `7455b131052e`)

| AC | Where it is met | Self-checked |
|---|---|---|
| AC-1 | `caw-back → src/cards/service.ts` `setStatus`: a worker's `review` without `done`/`howToTry` → 409 `review_note_missing` with the PM's words + the missing names; no event, the card unchanged — `test/http/review-note.test.ts` (a), (b) | yes — API; QA's stub through a worker |
| AC-2 | both fields → one write: a `comment` note `ทำแล้ว: …\nลองได้โดย: …` + the status (review-note (c)); the note is a card note like any comment, so the card screen lists it | yes for the API; the note on screen = QA |
| AC-3 | `handOff`: a BE-made card to an FE-only worker without `reason` → 409 `wrong_role`, the card stays (e); with `reason` → 200, the note keeps the reason (f); BE → QA never needs one (g); the first-hand-off rule (i) | yes — API; QA's stub through workers |
| AC-4 | live: the rule-3 sentence (`src/runner/prompt.ts`) + the refusals' words tell a real worker what to send | yes — design; the live proof is QA's ("Check: QA, live") |
| AC-5 | caw-back whole `988 pass · 1 skip · 1 fail` (known withReadGuard), the 22 probed consumers updated with their meaning kept; caw-front `361 pass · 0 fail`, typecheck 0 | yes |

## Verification (by QA)
Tanya, 2026-10-31 01:29 — tree-fp.sh: caw-back 2426d9a fp `a8e76ef8bc69` · caw-front a009d2c fp `7455b131052e` (same 01:22 / 01:29); stub workers. Detail TEST-123.

| AC | Verdict | What I checked myself |
|---|---|---|
| AC-1 | PASS | review with no note → 409 `review_note_missing` (PM words, `details.missing`), card unchanged; only `done` → missing `howToTry`; the operator needs no note |
| AC-2 | PASS | both parts → review + one note "ทำแล้ว: … / ลองได้โดย: …", shown on the card screen |
| AC-3 | PASS | BE card → FE without reason → 409 `wrong_role` (PM words), stays with BE; with reason → 200, reason kept in the note; BE → QA free |
| AC-4 | NOT_TESTED | live — REQ-124 round 2 (DECISIONS 01:1x) |
| AC-5 | PASS | S1–S15 (REQ-117…122) all OK; caw-back 988/1/1 known; caw-front 361/0 |

**AC-4 live — PASS** (Tanya, 2026-10-31 03:18) (REQ-124 round 2, 2026-10-31 03:18, `tests/TEST-122-full-loop-rehearsal-new-project.md` § Round 2): 9/9 cards in review with both note parts; every card worked by its own role, no BE → FE hand-off (round 1: 4 without a note, 3 hand-offs).
