# SPEC-004: User tier — where it is computed, where it is shown
- Source: REQ-001 (all ACs); builds on SPEC-002 (`User.tier`), SPEC-003 (`src/lib/tier.ts`, `userTier` in the analyse response)
- Status: ACTIVE
- Author: Sober (SA), 2026-09-19

## Overview
REQ-001 is mostly already carried by SPEC-002/003: every user starts `Ordinary` (users table
default), the idea tier is computed in `src/lib/tier.ts` from the lowest score, the user tier
only rises, and `POST /ideas` returns the resulting `userTier`. This SPEC adds the one thing
still missing — **a place where the user sees their own tier** — and pins the traceability so
Tanya can test REQ-001 as a unit. No new endpoints are needed: `GET /auth/me` already returns
`User.tier`.

## API / Interface Design
No new BE routes. One shape extension to SPEC-002's `User` (BE + FE, TASK-003 code already
has `tier`; add `discountPercent`):
```json
User = { "id", "email", "displayName", "tier": "Seeker", "discountPercent": 5, "isAdmin", "createdAt" }
```
`discountPercent` comes from `discountFor(tier)` in `src/lib/tier.ts` (SPEC-003) — the FE never
computes discounts, it only labels them.

## Data Model
No change. (`users.tier` from SPEC-002; upward-only update in SPEC-003 §Flow 4.)

## Flow / UI
1. **Header tier badge** (every signed-in page; *amended 2026-09-21: hidden below 600 px viewport width — the badge is then read on `/me`*): `Your tier` / `ระดับของคุณ` + the exact tier
   string + `Discount {n}%` / `ส่วนลด {n}%` (REQ-001 §wording). Source: `AuthContext.user`.
   Refreshes from the `userTier` returned by `POST /ideas` (SPEC-003) so AC-5 is immediate.
2. **Profile page `/me`** (guarded): display name, email, the tier badge, the tier's one-line
   description in the UI language (REQ-001 table — **superseded 2026-09-22 by REQ-007 W-3 tier lines, same keys, TASK-013**), and the "My ideas" link. Keep it small — it
   exists so REQ-001 AC-1/AC-6 have a stable page to test on.
3. Tier names are rendered from the BE string as-is — no dictionary key for tier names exists
   in `lib/i18n/` (that is how AC-6 "never translated" is enforced, not by review).

## Traceability (for Tanya, via Porter)
| REQ-001 | Where it is built | Where it is proven |
|---|---|---|
| R1/AC-6 exact names | BE CHECK constraints (SPEC-002/003 SQL); FE renders BE string | TASK-006/007 screenshots TH + EN |
| R2/AC-1 new user = Ordinary 0 % | `users.tier` default; `discountFor` | TASK-007 first-sign-in screenshot |
| R4/AC-2/AC-3 lowest score → tier | `src/lib/tier.ts` | TASK-005 boundary harness output |
| R5/AC-4/AC-5 upward only | SPEC-003 §Flow 4 UPDATE … WHERE rank< | TASK-005 two-idea run |
| R6 discounts | `discountFor` | TASK-005 + badge screenshots |
| AC-7 bad score = failure | SPEC-003 zod validation → `AI_FAILED` | TASK-005 dead-gateway run |

## Tasks
- TASK-007: FE — header tier badge + `/me` profile page; `User.discountPercent` in types — owner: FE (depends on: TASK-004)
- BE side: add `discountPercent` to `toUserDto` — folded into **TASK-005** item 3 (one-line change, same file family); no separate task.

## Questions
