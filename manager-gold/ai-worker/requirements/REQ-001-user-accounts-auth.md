# REQ-001: User accounts & authentication
- Status: DELIVERED
- Priority: MEDIUM
- Requested: 2026-07-26 by stakeholder (dev@smartalliance.co.th)
- Deadline: set by stakeholder but intentionally not disclosed

## Problem / Goal
manager-gold stores sensitive, private notes about real people. The stakeholder
chose a **multi-user** model: many users, each keeping their OWN private database
of people. Every user must sign in and see only their own data. This REQ is the
prerequisite that makes the rest of the app safe to build (REQ-002, REQ-003 store
per-user data).

## Requirement
1. The system must let a person create an account and sign in / sign out.
2. Each user's data (people, profiles, notes, advice history) must be **private
   to that user** — no user can read or modify another user's data.
3. Access to any app data requires an authenticated session.
4. Credentials must be stored securely (exact mechanism is the SA Lead's decision).

## Acceptance Criteria
- [x] A new user can register, then log in.
- [x] After login the user sees only the records they created. *(Isolation is
      server-enforced on every `/api/*` by session `userId` and proven with a
      two-user test; will be exercised on real records once REQ-002 lands.)*
- [x] Logging out ends the session; protected pages are not reachable when logged out.
- [x] With two test accounts, neither can see the other's data.

## PM Acceptance
- Accepted by Porter (PM) on 2026-07-27 against the criteria above, based on
  SPEC-001 DONE + all 4 TASKs accepted by Sober (real-code review) with evidence
  (BE commit `284aa11`, FE commit `9c9aebd`, both on branch `dong`, not pushed).
- Status → DELIVERED.
- Forward note (not blocking this REQ): final cookie `SameSite` setting depends on
  the hosting topology (same-domain vs cross-domain front/API). To be resolved via
  a DATA REQUEST at deploy time — see log 2026-07-27 and `architecture-baseline.md` §3.

## Constraints
- Frontend: Next.js + Mantine component library. Backend: Bun + Hono. (Stakeholder-mandated.)
- Prerequisite for REQ-002 and REQ-003.

## Out of Scope
- Social/OAuth login, email password-reset, roles/teams/sharing between users.
  (Can become later REQs if the stakeholder wants them.)

## Questions
(SA Lead asks here; PM answers as `> answer: ...`)
