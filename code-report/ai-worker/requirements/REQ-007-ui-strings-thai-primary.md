# REQ-007: Reword the existing UI strings to Thai-primary / English-secondary
- Status: READY_FOR_SA
- Priority: MEDIUM
- Requested: 2026-08-24 by the stakeholder
- Deadline: none

## Problem / Goal

The stakeholder reads the product in Thai. On 2026-08-24 he set a standing
language rule — **"ไทยหลัก อังกฤษรอง"** (Thai primary, English secondary) — and
confirmed (Q39) that it applies to **everything he reads**, the product UI
included. The existing on-screen strings were authored as a th/en pair and
approved as-authored (REQ-001 Q14), but they are not guaranteed to lead with
Thai in the way he now wants.

Asked (Q40) whether the **team** should now go and reword the existing UI
strings to be Thai-primary, or whether the rule was a going-forward principle he
would apply himself, he answered **"แก้เลย"** ("just fix it"). This REQ captures
that reword pass as a deliverable so it can be specced and built.

## Requirement

1. The team must reword the **existing user-facing UI strings** so that **Thai is
   primary and English is secondary**, per the stakeholder's "ไทยหลัก อังกฤษรอง"
   instruction (Q-SA-21 / Q39 / Q40).
2. Scope of "existing UI strings" = the on-screen text the stakeholder reads in
   the frontend product (the frontend copy dictionary and any user-visible screen
   text). It does **not** reach team-internal artifacts (REQ/SPEC/TASK, board,
   log — Q39: those stay English).
3. The reword is **strings only**: no change to behaviour, controls, layout,
   gating, or data. This REQ does not add or remove any feature or screen.
4. **Excluded from the reword** (unchanged, by prior settled decisions):
   - the on-screen product name stays the Latin string **`KnowCode`** (REQ-001
     Req 14);
   - on-screen dates stay in the **`DD/MMM/YY`** form (REQ-001 Req 15);
   - any string whose value is a code/technical identifier the user is meant to
     read verbatim (endpoint-style tokens, etc.) is a wording judgement, not a
     blanket translation.
5. The **concrete form** of "อังกฤษรอง" — Thai text with an English line beside
   it, versus Thai text keeping English only where a term has no natural Thai
   equivalent — is a **design/wording decision for the SA Lead** (the same open
   point Sober named on Q-SA-21). It is deliberately **not** dictated here.
6. **Sign-off on the reworded copy:** per the standing REQ-001 Q14 process, the
   reworded strings come back to the stakeholder for a **yes/no before they
   ship** — this is the working default. Whether "แก้เลย" waives that per-string
   sign-off is open (Q41, NON-BLOCKING); drafting proceeds regardless.

## Acceptance Criteria

- [ ] Every existing user-facing UI string reads Thai-primary / English-secondary
      in the form the SA Lead rules for "อังกฤษรอง".
- [ ] The on-screen product name still reads the Latin `KnowCode`, and on-screen
      dates still read `DD/MMM/YY` — the reword did not touch either.
- [ ] No behaviour, control, layout, gating or data change accompanies the reword
      — the diff is strings only.
- [ ] Team-internal artifacts (REQ/SPEC/TASK, board, log) are unchanged and stay
      English.
- [ ] The reworded copy was shown to the stakeholder for yes/no before it shipped
      (working default per Req 6 — see Q41; drop this criterion only if he
      answers Q41 to waive the sign-off).

## Constraints

- Strings only — no new dependency, no behaviour change (ties to REQ-006 Req 2's
  "layout/strings only" discipline on the same screens).
- The form of "อังกฤษรอง" is the SA Lead's wording decision (Req 5); Porter names
  no format and invents no Thai copy.
- This runs on the frontend that is now bun-only (REQ-005) and clean at
  `d44f523`; grounding against the real repo is the SA Lead's, not Porter's.

## Out of Scope

- Team-internal English artifacts (REQ/SPEC/TASK, board, log) — Q39.
- The product name and the on-screen date format — kept as settled (Req 4).
- New strings for not-yet-built UI — those are authored with their own TASK line
  under the standing rule, not part of this reword pass.

## Questions

### Q40 — ANSWERED 2026-08-24 — the origin of this REQ

> answer (2026-08-24, human, verbatim): "แก้เลย"

The stakeholder chose "the team does the reword pass" over "forward-only
principle he applies himself". This **overrides Q37** (he edits Thai copy
himself) for this work. Full reasoning: REQ-001 §Questions → Q40.

### Q41 (to the human) — NON-BLOCKING — does the reworded copy still need his yes/no?

Per REQ-001 Q14 the working default is that reworded strings come back to him for
a yes/no before shipping (Req 6). Whether "แก้เลย" waives that is open. Nothing
waits on it — the team can draft either way. Verbatim Thai text and the working
default are recorded in **REQ-001 §Questions → Q41**.
