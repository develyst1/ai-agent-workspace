# REQ-118: A spec entered by hand in Blueprint reaches every CAW worker
- Status: READY_FOR_SA (2026-10-30 15:3x, the PM)
- Priority: HIGH `[PM-decided]` — it is why REQ-108 phase 2 failed (AC-4); the owner's end goal is a team that builds what the spec says.
- Requested: 2026-10-30 by the PM, from QA's TEST-106 phase 2 P2-1 (MAJOR). Stamp `team-proposed` (defect route); decided under the owner's 08:40 standing order (`DECISIONS.md` § "ตัดสินใจแทนเจ้าของ รอทบทวน" 2026-10-30 15:3x).
- Deadline: none · Teams: **A (Blueprint) + B (CAW)** — a seam change: Blueprint owns the contract, CAW consumes it; cross-team questions go to the PM.

## Problem / Goal

The owner's intent: the PM writes the spec and requirements in Blueprint by hand, and CAW's team builds from them (SYSTEM-FACTS "Owner's corrections, 2026-10-29 10:51" a/b; DECISIONS 2026-10-29 11:41 item 1).
In TEST-106 phase 2 (`tests/TEST-106-e2e-live-dashboard.md` § Phase 2, P2-1) the owner's way was followed exactly: 8 requirements typed on Blueprint's requirements page, label v1, sent to CAW. CAW anchored all 4 cards on REQ-001 (the title line), and no card's context held the other 7 requirements — the 4 service URLs, 10 s, 3 s, :3900. The SA and BE built a different product (port 3000, 2 made-up services). **For the user: a spec typed by hand is ignored except its first line.**

## Requirement

1. Every CAW worker on every card can see **every requirement** of the spec it works from, whatever the card is anchored on — requirements are project-wide, not tied to one part. `[PM-decided]`
2. The proposal step (CAW's entry chat that cuts the cards) also sees every requirement, so the cards it proposes cover them.
3. The coverage check (REQ-112) treats the requirements like the rules it already checks: a requirement no card takes up is listed as uncovered, not silently `[]`.
4. Specs built by the interview (parts with links) keep working exactly as now.
How — which side carries the requirements, the contract shape — is the SAs' design; the seam contract change is Team A's, routed through the PM.

## Acceptance Criteria

- [ ] **AC-1** — **Given** a project whose spec is only hand-entered requirements (the 8 from TEST-106 phase 2: title, 6 points, "ไม่ทำ") **When** CAW builds the context of any card (anchored on REQ-001 or any other part) **Then** that context holds all 8 requirement texts verbatim.
  - Check: QA, stub `CLAUDE_BIN`, reading `card_context` for at least two cards with different anchors.
- [ ] **AC-2** — **Given** the same project **When** the entry chat proposes cards (stub) **Then** the prompt it was given holds all 8 requirements. 
  - Check: QA reads the prompt the stub received.
- [ ] **AC-3** — **Given** the same project and a proposal whose cards take up only some requirements **When** coverage is computed **Then** the requirements not taken up are listed as uncovered (same line the board already shows for uncovered rules).
  - Check: QA, stub; the board line.
- [ ] **AC-4** — **Given** a requirement edited in Blueprint after the run started **When** the next hop starts **Then** it sees the edited text (REQ-105's "latest spec" rule holds for requirements).
- [ ] **AC-5** (regression) — REQ-105 / REQ-112 / REQ-117 tests and all four repos' suites pass; an interview-built spec's card context is unchanged except for the added requirements.
- [ ] **AC-6** (live, confirms the fix) — REQ-108 AC-4 re-run: the built dashboard runs on :3900 and checks the spec's 4 services. Run by QA as REQ-108 phase 3 after this REQ and REQ-119 are committed — not a gate for REQ-118's own DELIVERED.

## User-facing wording (the PM)

No new words. The uncovered line reuses the board's existing uncovered-parts wording (REQ-112).

## Out of Scope

- Making the entry worker anchor cards differently (anchors stay the SAs' choice). · Linking requirements to parts by hand in Blueprint. · Any gateway call (none needed). · O-1 (QA's own leftover skill in the CAW root — QA cleans it).

## Questions
(the SA and the QA ask here; the PM answers as `> answer: ...`)

- **Q1 (Sober, SA A, 2026-10-30 15:3x) — AC-3: when is a requirement "taken up"?** Non-blocking for Team A (SPEC-115 needs no answer); it decides Team B's coverage rule.
  Checked: DECISIONS 2026-10-30 10:5x / 14:2x (REQ-112 coverage = decisions only, SPEC-109 D2) · SYSTEM-FACTS § Owner's corrections — not covered: requirements were not in coverage, and after this REQ every card's context holds every requirement, so "seen by a card" would mark all of them covered and AC-3 could never list one.
  I propose: **a requirement is taken up when a work card, or an item of the proposal being checked, is anchored on that requirement's key.** Cases: TEST-106 run (4 cards on REQ-001) → REQ-002…008 listed uncovered · a card on WRK-001 → takes up no requirement · a requirement removed in Blueprint → not listed (it is not in the spec) · listed under itself, like a decision that covers nothing (caw-back `coverage.ts:5`) · done cards count, as for decisions. Correct only the line that is wrong.
  > answer (PM, 2026-10-30 15:4x `[PM-decided]`): **accepted as proposed, all cases.** Anchored on the requirement's key = taken up; seen in context ≠ taken up. One addition for Team B: the worker prompt line naming `spec.requirements` is **required, not optional** (with REQ-117's sentence, "read … before you ask") — TEST-106 P2-1 showed a worker builds from what it is told to read. Routed to SA B with SPEC-115 § For the PM. — Porter
