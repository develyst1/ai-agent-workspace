# REQ-007: Remove the dead "forgot password" link from `/login`
- Status: READY_FOR_SA
- Priority: LOW
- Requested: 2026-09-09 by the owner
- Deadline: none

## Problem / Goal

The `/login` screen shows a **"forgot password"** link that points at **`/forgot-password`**, and
that route **does not exist** in the app. A visitor who clicks it lands on a 404 — a dead end
offered to exactly the user who is already stuck.

Sober found it while writing TASK-004 and reported it as a **finding, not a request**
(`front/src/app/login/page.tsx:151`). It is **pre-existing**: TASK-004 neither introduced it nor
touched it. It was put to the owner as `requirements/REQ-001-frontend-pattern-and-ui-foundation.md`
§Questions **Q6** — *build the forgotten-password flow, or drop the link?* — and he answered
**"ตัดลิงก์ทิ้ง"** (*cut the link out*), `SYSTEM-FACTS.md` **A45**.

This REQ exists because that question was framed to him that way: **either answer becomes its own
requirement**, never a widening of REQ-001, which is foundation work with no product surface in it.

## Requirement

1. The `/login` screen **must not offer a link to `/forgot-password`**, because no such route
   exists. The dead affordance is removed from the screen.
2. Nothing else on `/login` changes as a consequence — the two fields, the submit path, the Thai
   copy and the layout are all untouched by this requirement.

## Acceptance Criteria

- [ ] AC 1 — No link, button or other affordance pointing at `/forgot-password` remains anywhere in
      `front/`. (Checkable: a repo-wide search for the string returns nothing user-facing.)
- [ ] AC 2 — `/login` still renders and still logs a user in exactly as it does today; the removal
      is subtractive only.
- [ ] AC 3 — **The owner's own eyes on `/login`**: the screen still reads right with the link gone,
      and nothing looks orphaned where it used to be. There is no QA role here — an engineer's
      evidence closes AC 1 and AC 2, only he closes this one.

## Constraints

- **No forgotten-password feature is being built.** He chose removal over building; there is no
  backend work, no email sending, no new route in this REQ.
- Frontend only (`front/`). No `back/` change, no database, no `develyst-ai`.
- Standing rules unchanged: no agent commits, deploys, or touches production
  (`SYSTEM-FACTS.md` A23 and PROTOCOL.md §Environments). `DELIVERED` ≠ deployed.

## Out of Scope

- Building a forgotten-password / password-reset flow, now or as a stub. He said remove.
- Any other `/login` change, including anything about the visual pass — `/login`'s look is
  SPEC-006's business (Phase 3), not this REQ's.
- The separate `/login` finding about the **dead "resend verification email" path**
  (`AuthContext.tsx` `login()` swallowing the error) — that is **unanswered by the owner** and is
  carried as REQ-001 §Questions **Q9**. It is a different decision and must not be folded in here.

## Questions

- **For the owner — asked and ANSWERED before this REQ existed.**
  > **answer (owner, 2026-09-09): "Q2=ตัดลิงก์ทิ้ง"** (`SYSTEM-FACTS.md` **A45**) — remove the link.
  > ⚠️ **What he did NOT say, and nobody guesses:** whether he wants a forgotten-password flow
  > *later*. He answered what to do today. If it is ever wanted it is a new REQ with backend work.

- **⚠️ UNVERIFIED, carried not laundered.** The 404 is **Sober's read of the code**, not an observed
  response — nobody here may open the live site (PROTOCOL.md §Environments). His answer settles what
  to do; it does not turn a code read into an observation.

- **Priority note (Porter's call, not the owner's word).** He stated no priority and no deadline.
  `LOW` is Porter's sequencing judgement — a one-line subtractive change behind the visual pass he
  is actively watching. **One word from him overturns it.** Sequencing against SPEC-006 and the
  SPEC-001 screens is **Sober's design call**; Porter proposes no mechanism and names no engineer.

- **Q1 — for the owner (asked in Thai 2026-09-13 by Porter): AC 3, his eyes on `/login`.** Look at
  `/login` (both themes if he likes): the `ลืมรหัสผ่าน` link is gone, `จดจำฉัน` sits alone on its row,
  nothing else moved. Reference: `tests/harness/login-AFTER-{light,dark}.png`. Answer `ผ่าน` /
  `ไม่ผ่าน เพราะ …` with the label **REQ-007**. ⚠️ Also for his eyes only: the login itself
  (wrong password → error banner; a real login → home) was verified **on a mocked backend only**
  (TASK-022 DoD 7) — one real login on his side is what settles it; the change touched no submit code.

(SA Lead adds questions here as new bullets; Porter answers as `> answer: ...`)

## Porter's acceptance check (2026-09-13)

Status stays **`SPEC_DONE`** — not `DELIVERED` — because AC 3 is his and unanswered.

- **AC 1 MET on evidence** — `tasks/TASK-022-remove-forgot-password-link.md` §Implementation Notes /
  §Review: repo-wide grep for `forgot-password|forgot|ลืมรหัสผ่าน` returns nothing (re-run by Sober),
  DOM anchor count 0 in both themes. The only occurrence was `partials/Login/LoginContent.tsx:154-156`
  (the REQ's `login/page.tsx:151` predates TASK-004's move — same link).
- **AC 2 MET on evidence, with one UNVERIFIED carried** — deletion-only diff (1 file, 3 lines); build
  and typecheck clean; BEFORE/AFTER geometry byte-equal. **DoD 7 (wrong-password banner + demo login)
  passed on a mocked `/auth/login`** — no backend runs in the harness — so "still logs in exactly as
  today" is UNVERIFIED against the real API; Fern and Sober both said so. What settles it: one real
  login by the owner.
- **AC 3 OPEN** — his eyes; asked as §Questions Q1 above. Porter looked at the light AFTER screenshot:
  the row reads clean, nothing orphaned — but Porter's eyes are not the AC.
- Nothing was built, and no forgotten-password flow exists — as he chose (A45). `DELIVERED` ≠ deployed.
