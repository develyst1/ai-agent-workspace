# SPEC-005: "Interested in hiring" request + the owner's admin page
- Source: REQ-004 (R1–R5, AC-1..6); builds on SPEC-002 (`requireAdmin` → 404), SPEC-003 (`Idea.hireRequested`, `GET /admin/ideas/:id/steps`), SPEC-004 (`discountPercent`)
- Status: ACTIVE
- Author: Sober (SA), 2026-09-19

## Overview
One button on the result page creates one `hire_requests` row per idea, **snapshotting** the
user's tier and discount at that moment (REQ-004 AC-5). The admin page (only `ADMIN_EMAIL`)
lists requests newest first and can flag one as contacted. No pricing, no messaging, no
payment (R5). The whole admin surface returns 404 to non-admins — there is no 403 anywhere.

## API / Interface Design
Base `/api/v1`, camelCase, envelope per SPEC-001 §D6.

### `POST /ideas/:id/hire-request` — `requireUser`
- 201 `{ "hireRequest": HireRequest }` — idea must be mine (else 404 `NOT_FOUND`).
- 409 `ALREADY_EXISTS` — a request for this idea already exists (AC-2). Idempotent from the FE's point of view: on 409 the FE simply shows W-3.

### `GET /ideas/:id` (SPEC-003) — now returns `"hireRequested": true` once a row exists. `GET /ideas` summaries unchanged.

### `GET /admin/hire-requests` — `requireAdmin`
- 200 `{ "hireRequests": AdminHireRequest[] }` newest first (R3). No paging yet (volume is the owner's own leads).

### `PATCH /admin/hire-requests/:id` — `requireAdmin`
Body `{ "contacted": true | false }` (false lets him undo a mis-click).
- 200 `{ "hireRequest": AdminHireRequest }` · 404 unknown id · 400 `VALIDATION_FAILED`.

### Shapes
```json
HireRequest = { "id", "ideaId", "userTierAtRequest": "Seeker", "discountPercentAtRequest": 5,
                "contactedAt": null, "createdAt" }
AdminHireRequest = HireRequest + {
  "user": { "displayName", "email" },
  "idea": { "id", "text", "textPreview": "<first 120 chars>",
            "scores": { "feasibility", "impact", "interestingness" }, "ideaTier", "createdAt" }
}
```
`contactedAt` is an ISO date or `null` — "contacted" is a timestamp, not a boolean, so the owner
sees when he did it. `discountPercentAtRequest` is stored, not recomputed (AC-5). The admin
page shows the **idea's** tier and the **user's tier at request time** side by side (R3 says
"idea tier, discount"; the discount is the user-tier one — REQ-001 R6 ties discount to the user).

## Data Model
Migration `drizzle/0002_hire_requests.sql` (generated; Jason applies after `0001`):
```sql
CREATE TABLE hire_requests (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id                     uuid NOT NULL UNIQUE REFERENCES ideas(id),
  user_id                     uuid NOT NULL REFERENCES users(id),
  user_tier_at_request        text NOT NULL CHECK (user_tier_at_request IN ('Ordinary','Seeker','Raw Diamond','Visionary','The Possibility')),
  discount_percent_at_request integer NOT NULL CHECK (discount_percent_at_request IN (0,5,10,20,30)),
  contacted_at                timestamptz,
  created_at                  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX hire_requests_created_idx ON hire_requests (created_at DESC);
```
`UNIQUE (idea_id)` is what makes AC-2 a database fact, not a UI promise: a second insert fails →
409. User name/email are **not** copied — they are read from `users` at list time (the owner
wants to reach the person as they are now; a changed display name is not a business fact).

## Flow
1. Result page (TASK-006 placeholder slot): if `idea.hireRequested` → W-3 disabled; else W-1.
2. W-1 → `POST /ideas/:id/hire-request`. BE: load idea (mine, else 404) → insert with
   `user_tier_at_request = user.tier`, `discount_percent_at_request = discountFor(user.tier)`
   → on unique violation → 409.
3. FE on 201 or 409: show W-2 (with `{email}` = `user.email`, `{discount}` = `${discountPercentAtRequest}%`) once, then W-3 disabled; invalidate the idea query so `hireRequested` is true on reload (AC-2).
4. Admin page `/admin` (FE): guarded by `user.isAdmin`; non-admin and signed-out users get the
   app's not-found page — **the FE never renders an admin link** (AC-6); the URL typed by hand
   shows not-found because `GET /admin/hire-requests` is 404 for them (AC-3).
5. Admin list row: date (`DD/MMM/YY HH:mm`), user name, email, idea preview (120 chars, expand
   → full text), three scores, idea tier, user tier at request + discount, contacted state
   (Porter's "ติดต่อแล้ว / ยังไม่ติดต่อ") with a toggle → `PATCH` → row updates; reload keeps it (AC-4).
   Optional link "steps" → `GET /admin/ideas/:id/steps` shown in a drawer (REQ-003 AC-10 for the owner).
6. Empty list → "ยังไม่มีคำขอ" / "No requests yet".

Edge cases: idea deleted — cannot happen (no delete in scope). Admin marks contacted twice → second PATCH is a no-op 200. Request by a user whose tier later rises → row unchanged (AC-5). Admin's own ideas may appear — fine.

## Non-functional
- Log one line per hire request: `hireRequest.id`, `idea.id`, `user.id`, tier. Never the idea text.
- No email/LINE notification (REQ-004 out of scope; SYSTEM-FACTS: "possible later addition").

## Tasks
- TASK-008: BE — `hire_requests` table, `POST /ideas/:id/hire-request`, admin list + PATCH, `hireRequested` in Idea DTO — owner: BE (depends on: TASK-005 DONE)
- TASK-009: FE — hire button + W-2/W-3 on the result page; `/admin` page with list, expand, contacted toggle, steps drawer — owner: FE (depends on: TASK-006, TASK-008)

## Questions

## Amendment 2026-09-23 — admin is a LIST of emails in configuration (owner, REQ-004 §Questions)
Supersedes "admin = `siegkung@gmail.com` via Google only" in this SPEC, in SPEC-002 §Overview/§Flow 9 and in SPEC-007 §Unchanged (`isAdmin` requiring `googleSub`).
- **`ADMIN_EMAILS`** replaces `ADMIN_EMAIL` in `possibility-back/.env` / `.env.example`: a comma-separated list, e.g. `ADMIN_EMAILS=siegkung@gmail.com,qa-tanya@example.com`. Parsing: split on `,`, trim each, lower-case each, drop empties; zod requires at least one valid entry or the process exits (SPEC-001 §Backend layout fail-fast).
- **`isAdmin(user)` = `ADMIN_EMAILS` contains `user.email.toLowerCase()`** — **the sign-in method no longer matters** (an email+password account on the list IS admin; REQ-006 R7 is superseded by the owner's 2026-09-23 decision). Everything else about `requireAdmin` is unchanged: a non-admin still gets **404**, never 403, and no admin link is ever rendered (REQ-004 AC-6).
- Nothing else changes: no schema change, no new endpoint, no FE change (the FE already branches on `user.isAdmin` from `/auth/me`).
- **Transition:** while only `ADMIN_EMAIL` exists in a deployed `.env`, the BE must still start — read `ADMIN_EMAILS` and fall back to `ADMIN_EMAIL` if the new var is absent, logging one WARN line naming the old var. The owner replaces it on SIT at the next deploy.
- **What Porter asks the owner for, once:** `ADMIN_EMAILS=siegkung@gmail.com,<QA account email>` in `possibility-back/.env` on SIT (comma-separated, no spaces needed, case-insensitive). The QA email is whatever address Tanya registers with via REQ-006.
