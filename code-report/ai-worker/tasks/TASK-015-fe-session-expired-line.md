# TASK-015: FE — show the session-expired line when a session dies mid-use
- Source: SPEC-002
- Status: TODO
- Assignee: Fern (FE)
- Depends on: TASK-013 (DONE). Nothing depends on this except TASK-016.
- Written: 2026-08-21 by Sober (SA Lead)

## Why this exists

Q-SA-14 is answered: **"ขึ้นข้อความ"** (2026-08-21, verbatim, via Porter — REQ-003
`## Questions`). This is the **only** place SPEC-002's behaviour freeze is
released, and it is released narrowly: freeze item 2 protected the *silent*
redirect, and the stakeholder has replaced that outcome. See SPEC-002 freeze item
2 (annotated) and SPEC-002 `## Questions` → Q-SA-14.

It is a **separate TASK, not a line inside a redesign TASK**, because all four
SPEC-002 redesign TASKs were already `DONE` when the answer arrived, and a
behaviour change buried in a visual diff is unreviewable.

**This is approved NEW behaviour, not a bug fix.** You measured on 2026-08-21
that the silent redirect is identical on the pre-move and post-move builds, so
nothing regressed — REQ-001 shipped it this way and the stakeholder has now
changed his mind about it.

## What is actually happening today (read, 2026-08-21, at `1f90b87`)

Two components navigate in the same tick and the bare path wins:

- `src/context/session/SessionProvider.tsx` — the 401 handler sets the state to
  `anonymous` **and** `router.replace(`${LOGIN_PATH}?${EXPIRED_PARAM}=1`)`.
- `src/components/common/RequireAuth.tsx` — its effect sees `status ===
  "anonymous"` and independently `router.replace(LOGIN_PATH)`, with no flag.
- `src/app/page.tsx` does the same bare redirect on `/`. **It is the second
  clobber source and is easy to miss** — check it before you call this done.

The login screen itself is fine: `LoginContent.tsx` already renders
`login.sessionExpired` when the URL carries `?expired=1` (and only while the form
is idle with no login error). **Do not restyle or rewrite that screen.**

## What to do

Make an **expired** session arrive at the login screen with its flag intact,
without inventing a new reason to show that line.

**The constraint, not the mechanism:** the *reason* the user became anonymous is
known only to `SessionProvider` (it is the only place that distinguishes "the
server rejected an existing session" from "there was never a session"). Every
other component currently navigates without that knowledge. Fix the knowledge,
not the timing — a solution that depends on which `router.replace` happens to run
first is not a solution.

**My preferred shape, offered so you can falsify it rather than obey it:** carry
the reason in the session state (e.g. `{ status: "anonymous"; reason: "expired" |
"none" }`) and have the components that redirect to login append the flag when
the reason is `expired`. It keeps one source of truth and no ordering assumption.
If you find something simpler and equally ordering-free, take it and say why in
`## Implementation Notes` — I review the outcome, not my own suggestion.

**Three outcomes must be distinguishable. Two of them must NOT show the line:**

| Case | Expected |
|------|----------|
| Session dies mid-use (any call returns `401 AUTH_REQUIRED`) | lands on `/login?expired=1`, `login.sessionExpired` visible |
| The user logs out deliberately | bare `/login`, **no** line |
| A never-logged-in visitor opens `/reports/new` or `/` | bare `/login`, **no** line |

Telling someone who never logged in that their session expired is a defect, not a
rounding error — it is the reason this table is in the TASK.

## Boundaries

- **No new user-facing string.** `login.sessionExpired` already exists in both
  dictionaries (th line 41 / en line 139, verified 2026-08-21) and was approved
  under Q14. `src/constant/text/dictionaries.ts` must be **untouched** — if you
  believe it needs an edit, that is a question, not a decision.
- **No redesign.** Do not change the login screen's visual layer; TASK-011
  already shipped and was reviewed. If the notice line needs a Mantine component
  it does not already have, ask first.
- **No new dependency** (SPEC-002 Decision 3.4, amended — this SPEC authorises
  none at all).
- **No backend change**, no API-contract change, nothing in `code-report-back`.
- The rest of freeze item 2 stays frozen: same login POST, same cookie handling,
  same `setUnauthorizedHandler` wiring, same `?expired=1` reading on the screen.

## Definition of Done
- [ ] `npm run typecheck` exit 0.
- [ ] `npm run build` green and listing **the same four routes**.
- [ ] Repo-wide SPEC-002 gates still a real zero: **0 Tailwind colour utilities,
      0 font-family utilities** outside `globals.css` (the gate you took to zero
      in TASK-013 — prove it did not move).
- [ ] `src/constant/text/dictionaries.ts` unchanged — show it in the file list.
- [ ] **All three rows of the table above measured, not reasoned**, on a
      production build: the URL that was actually reached and whether the line is
      in the DOM. Same method as TASK-013 (a throwaway local fake backend is fine
      and is precedent; **stop it and delete it before you report**, and say so).
- [ ] Freeze items 1, 3–10 spot-checked as untouched code: name the files you
      changed and state which freeze items could possibly be affected by them.
- [ ] `git status --porcelain` empty at the reported commit, and the commit hash
      in `## Implementation Notes`.
- [ ] The standing FE proxy rule honoured: set `API_PROXY_TARGET` **before**
      `npm run build` (Next bakes `rewrites()` into the manifest at build time —
      your own finding, adopted 2026-08-21), and restore the env afterwards.

## Implementation Notes
(Fern fills this in: what changed, how each of the three cases was measured, the
commit hash.)

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review
(Sober fills this in at REVIEW.)
