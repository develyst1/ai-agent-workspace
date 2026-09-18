# REQ-009: `/login` — tell an unverified user the truth, and offer the resend
- Status: **SPEC_DONE** — 2026-09-13 (set by Sober when SPEC-009 closed). Porter's acceptance check
  done 2026-09-13: AC 1–4 MET on evidence; **AC 5 (his eyes) OPEN**, asked as §Questions **Q1** together
  with the three backend findings Sober routed. See §"Porter's acceptance check (2026-09-13)" below.
- Priority: MEDIUM — Porter's call, unstated by him (see §Questions)
- Requested: 2026-09-13 by the owner
- Deadline: none

## Problem / Goal

A user whose email is **not yet verified** and who tries to log in is today told
**"อีเมลหรือรหัสผ่านไม่ถูกต้อง"** (*wrong email or password*) — which is not what happened to them.
The screen *has* an unverified-email branch with a **"ส่งอีเมลยืนยันอีกครั้ง"** (resend) button, but
per Sober's finding it **can never show**: `front/src/contexts/AuthContext.tsx` `login()` catches
every error and returns `false`, so `LoginForm`'s `catch` — the only caller of
`setNeedsVerification(true)` — never runs. Detail: `tasks/TASK-004-login-screen-migration.md`
§Questions **Q2** (Sober). Pre-existing; TASK-004 did not introduce or touch it.

It was put to the owner as REQ-001 §Questions **Q9** — *tell an unverified user so and offer the
resend, or keep today's single generic message?* — and he answered **"F=บอกตามจริง"** (*tell it as
it is*), `SYSTEM-FACTS.md` **A50**. By that question's own framing this is its **own REQ**, not a
widening of REQ-001.

## Requirement

1. When a login attempt fails **because the account's email is not verified**, `/login` must say
   **that** — in Thai, plainly — and **not** the generic wrong-credentials message.
2. In that same state the user must be **offered the resend** of the verification email (the
   existing affordance, made reachable), and be told the outcome of the resend (sent / failed).
3. A login attempt that fails for **any other reason** (wrong password, unknown email) keeps
   today's single generic message — the owner was asked about the unverified case only, and
   nothing here widens what is disclosed about other failures.
4. The user-facing Thai wording for requirement 1 and 2 is **copy**, and the owner was not asked for
   it. Sober lists the strings that are needed (as with REQ-001 §Q5: a concrete list, never an
   abstract question) and Porter takes them to the owner — or, if the strings already exist on the
   screen today (the branch has copy in it), Sober says so and they are reused unless he objects.

## Acceptance Criteria

- [x] AC 1 (MET on evidence, TASK-024 DoD 5 — real local stack) — A login attempt with an unverified email shows the unverified-email message, not
      "อีเมลหรือรหัสผ่านไม่ถูกต้อง"; evidence = a real run against the local backend and a local
      database with a seeded unverified user (command + output / screenshot), never a code read.
- [x] AC 2 (MET on evidence, TASK-024 DoD 6 — ⚠️ "sent" is the backend's claim, see Q1) — In that state the resend affordance is visible and a click calls the resend; the
      user sees sent/failed. Same evidence standard.
- [x] AC 3 (MET on evidence, TASK-024 DoD 7) — Wrong password and unknown email still show today's generic message, unchanged.
- [x] AC 4 (MET on evidence, TASK-024 DoD 8) — `/register` and `/verify-email`, which share `AuthContext`, still behave as today —
      stated with evidence, or written `UNVERIFIED — <what would settle it>`.
- [ ] ⏳ AC 5 (OPEN — asked 2026-09-13 as §Questions Q1) — **The owner's own eyes** on the unverified-login path. No QA role here; only he
      closes this one.

## Constraints

- Whether this is frontend-only or also needs `back/` is **Sober's to establish** — `back/src/routes/auth.ts`
  already has a `POST /auth/resend-verification` route and an `is_email_verified` check on login
  (Porter's read, 2026-09-13 — a pointer for Sober, not a design). Porter designs nothing.
- `AuthContext.tsx` is shared with `/register` and `/verify-email` (TASK-004 §Q2) — a change to it
  is a whole-auth-surface change, on a live product; AC 4 exists for that reason.
- Standing rules unchanged: no agent commits, deploys, or touches production (A23, PROTOCOL.md
  §Environments); real user data is never used — a seeded local user only. `DELIVERED` ≠ deployed.
- Nothing about `/login`'s **look** (SPEC-006 Phase 3) or the `/forgot-password` link (REQ-007) is
  in here.

## Out of Scope

- Disclosing anything about *other* login failures (e.g. "email exists but password wrong") — not
  asked, not answered, and a security-shaped decision the owner has not made.
- Any change to what the verification email itself says or how it is sent.
- Building account-recovery flows of any kind.

## Questions

- **Priority note (Porter's call, not the owner's word).** `MEDIUM`: a real user today is told a
  falsehood at the one moment they need the true reason; but he stated no deadline, and it sits
  behind the `/courses` fix he is waiting on (A48). **One word from him overturns it.**

- **⚠️ UNVERIFIED, carried not laundered.** That the branch is dead is Sober's read of the code, not
  an observed login (nobody opens the live site). The REQ stands on his answer either way: even if
  the branch somehow fires today, requirement 1–2 describe what he wants to be true.

(SA Lead adds questions here as new bullets; Porter answers as `> answer: ...`)

- **Q1 (owner) — AC 5, his own eyes, plus the three backend findings — ⏳ OPEN, asked 2026-09-13.**
  What to look at on his local `develop`: log in with an account whose email is not yet verified →
  the red banner **S1** `กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ` with the button **S2** `ส่งอีเมลยืนยันอีกครั้ง`
  inside it (screenshots `tests/harness/login-unverified-{light,dark}.png`); click the button → toast
  **S3**. Wrong password / unknown email still show the generic **S6**. Nobody here has seen it on the
  live site. Asked in Thai as one digest, labelled **G1–G5**:
  - **G1 (AC 5)** — pass / fail, and what to change.
  - **G2 (SPEC-009 §Q1, F1 — run-confirmed):** the backend sends **no email at all** — no mailer
    exists; register and resend only print the token to the server console — so the toast
    `ส่งลิงก์ยืนยันอีเมลแล้ว กรุณาตรวจสอบ inbox ของคุณ` is **not true** on the very screen A50 asked to
    be truthful. His choice: **(a)** wire real sending — its own REQ, and the SMTP account/credentials
    are his to supply, never ours to guess; **(b)** accept as-is for now; **(c)** reword S3 to something
    true (his words, or ours to draft — his call).
  - **G3 (SPEC-009 §Q2, F2(c) — code read, UNVERIFIED by run):** `/verify-email` can never mark
    anyone verified (a column-name transform in `back/src/db.ts` is not applied, so the token lookup
    reads a field that does not exist). Together with G2: **no self-registered user can become
    verified today** without a hand-flip of `users.is_email_verified` in the database. Own BE REQ — yes/no?
  - **G4 (SPEC-009 §Q3, F2(b) — code read, UNVERIFIED by run — security):** the same missing
    transform means the **`password_hash` column is returned to the browser** in the login and
    `/auth/profile` responses. Porter's recommendation, not his word: fix it first, own small BE REQ.
    Yes/no, and priority?
  - **G5 (SPEC-009 §Q4, copy):** strings S1–S5 exist on the screen today and were reused; keep, or
    replacements?
  - Disclosed, no action asked (SPEC-009 §Q6): the `/login` demo line names
    `john@example.com / password123`, which the seed does not create (seeded users use
    `Demo1234!`). Whether that account exists in production is his to say — not asked as a DATA
    REQUEST this hop; raised only so the line is not later called a defect.
  > answer: _(pending)_

- **Porter's answer to Sober's "your call" on SPEC-009 §Q2/§Q3 (2026-09-13):** not homed as REQs yet — a
  defect that nobody asked to fix is still the owner's decision on a live product (as the
  `/courses/[id]` row on the board). They are asked as G3/G4 above; on his "yes" each becomes its
  own BE REQ (`REQ-011`, `REQ-012`) the same hop. Nothing is lost: both sit as a Blocked row on the board.

## Porter's acceptance check (2026-09-13)

Status stays **`SPEC_DONE`** — not `DELIVERED` — because AC 5 (his eyes) is open, and because AC 2's
"sent" is, by the team's own run, a message the backend cannot honour (Q1/G2). Porter does not call a
REQ whose one visible outcome is untrue "delivered" until the owner has chosen a/b/c.

- **AC 1 MET on evidence** — TASK-024 DoD 5 on a **real** local stack (Fern's own throwaway Postgres
  cluster + `back/` + `next start`, env-only, torn down and declared): register → 201, login → **403**
  with `requiresEmailVerification: true`, banner S1 rendered in both themes, screenshots in
  `tests/harness/`. Re-run by Sober where a read allows (diff, greps, tsc). Not mocked, not a code read.
- **AC 2 MET on evidence, with a disclosure** — the button S2 is in the DOM, the click produced a real
  `POST /auth/resend-verification` → 200, and the antd toast S3 rendered (a SPEC hypothesis, settled by
  measurement). ⚠️ What the toast says is the backend's own claim: **no email leaves the system** (F1,
  run-confirmed). Carried to the owner as G2, not laundered.
- **AC 3 MET on evidence** — DoD 7: wrong password and unknown email → the generic S6, 0 buttons; the
  seeded `Demo1234!` login still lands on `/` with `dte_user` set.
- **AC 4 MET on evidence** — DoD 8: `login()` has one caller (tsc is the proof, exit 0); `/register`'s
  own resend still toasts; `/verify-email?token=bogus` renders the backend's string through the new
  seam. No `back/` file changed (`git diff` is exactly 3 `front/src` files, byte-for-byte SPEC-009).
- **AC 5 OPEN** — his eyes; asked as §Questions Q1 (G1). Porter looked at the light screenshot: the
  banner and the button are where SPEC-009 §Flow puts them — but Porter's eyes are not the AC.
- **Requirement 4 (copy)** — Sober listed S1–S6; all pre-existing, none invented; taken to the owner
  as G5. Nothing built waits on it.
- Backend findings F1–F3 are **not** REQ-009's to fix and were not fixed; they are stated plainly to the
  owner in Q1 (G2–G4). `DELIVERED` ≠ deployed; nothing here is on `dte.develyst.online` until he puts it there.
