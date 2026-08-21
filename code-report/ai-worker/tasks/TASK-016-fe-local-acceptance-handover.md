# TASK-016: FE — local acceptance hand-over (the URL the stakeholder opens)
- Source: SPEC-002
- Status: BLOCKED (waiting: human via @Porter — Q-SA-17, what he is willing to start)
- Assignee: Fern (FE)
- Depends on: TASK-015. **Deliberate ordering** — TASK-015 changes the login
  screen, which is one of the screens he will open; handing over first and
  changing it after buys a second look-round for nothing.
- Written: 2026-08-21 by Sober (SA Lead)

## Why this exists

REQ-003's final acceptance criterion is **the stakeholder looks at the reworked
screens and says they are acceptable**. Three answers settled who and how, and
all three are transcribed in SPEC-002 `## Questions`:

- **Q-SA-13 "screenshot, ไปเลย"** — captured images are the form of the evidence.
- **Q-SA-15 "ก ส่ง URL มา"** — **he** captures; the team's job is to make
  something openable. No TASK carries a "paste screenshots here" line.
- **Q23 "localhost"** — on his own machine. **No deployment**, so the parked
  cookie-`Secure` note stays parked and REQ-003's Out of Scope is unchanged.

What was left to me, and is this TASK: **which command, which port, which
pages/states.** This TASK does not decide acceptance — he does, after Porter
relays the hand-over in Thai.

## Blocked — read this before you start

**Without a backend, `localhost` shows exactly one of the three reworked
screens.** `RequireAuth` asks `GET /api/auth/me`; with nothing behind the proxy
that call fails, the visitor is anonymous, and `/reports/new` and
`/reports/[jobId]` both bounce to `/login`. So "start the frontend and send him
the URL" hands over **one screen out of three** — which does not satisfy the
criterion it exists to satisfy.

What the team may do about that is a business decision with real cost attached
(option ข below is engineering work, and it shows **fabricated** data), so it is
**Q-SA-17 with the human via @Porter** — see `## Questions`. Everything below is
written so it is startable the day the answer lands.

## What to do

Produce a **hand-over block** — the exact steps he runs and the exact URLs he
opens — and prove it works by running it yourself. The block goes in
`## Implementation Notes` of this file; **Porter relays it to him in Thai.** It
does **not** go into `../project-docs/` — that directory is where *he* puts
evidence for *us*, and this travels the other way.

1. **Write the steps for a machine that has only the repo.** Assume nothing is
   already running and nothing is already set. Name the Node/npm requirement you
   actually verified against, the working directory, the command, the port, and
   how he stops it. Prefer the fewest steps that work.
2. **Name the proxy setting explicitly.** `next.config.ts` reads
   `API_PROXY_TARGET`, and Next bakes `rewrites()` into the build manifest — so
   whichever start path you document (`npm run dev`, or `build` + `start`), the
   setting must be in place at the right moment and your instructions must say
   so in one line he can follow on **his** shell, not yours. Verify the form you
   write actually works; do not write a command you have not run.
3. **List the pages and states he should open**, in this order, with one line
   each saying what he is looking at. The set is mine, not yours to trim:

   | # | Page | State |
   |---|------|-------|
   | 1 | `/login` | idle |
   | 2 | `/login` | failed login (wrong password) |
   | 3 | `/login` | session-expired line (TASK-015's behaviour) |
   | 4 | `/reports/new` | empty form |
   | 5 | `/reports/new` | validation errors shown |
   | 6 | `/reports/[jobId]` | run in progress (the six-stage display) |
   | 7 | `/reports/[jobId]` | finished report |
   | 8 | `/reports/[jobId]` | the `NO_COMMITS` note |

   **State honestly, per state, whether the answer to Q-SA-17 makes it reachable
   for him.** A list that quietly includes screens he cannot open is worse than a
   short list. Rows 1–3 need only the frontend; 4–8 need whatever Q-SA-17 names.
4. **Both languages.** He accepts a bilingual product: say how to switch (the
   language switch is on screen) and mention that the report language is a
   separate field.
5. **Leave the repo exactly as you found it.** No `.env*` file committed, no
   config change to make the instructions work — if the instructions need a
   repo change, that is a finding for `## Questions`, not a silent commit.

## Definition of Done
- [ ] The hand-over block exists in `## Implementation Notes`: prerequisites,
      commands, port, stop instructions, the eight rows with reachability marked.
- [ ] **You ran your own instructions verbatim, from a stopped state**, and say
      what you observed at each URL you could reach.
- [ ] `npm run typecheck` exit 0 and `npm run build` green with the same four
      routes — this TASK expects **no production-code change**; if you find you
      must change code, stop and write it in `## Questions`.
- [ ] `git status --porcelain` empty, and any throwaway server or fake stopped
      and deleted — say so explicitly.
- [ ] No secret in anything you paste here (no password, no PAT, no cookie
      value). The `admin` password is **his**, and the hand-over must not ask him
      to send it to us.
- [ ] One line naming what this TASK does **not** prove: it does not make the
      screens acceptable, it makes them openable.

## Implementation Notes
(Fern fills this in — the hand-over block is the deliverable, so write it for a
reader who is not on this team.)

## Questions

- **Q-SA-17 (BLOCKS THIS TASK — raised by Sober 2026-08-21, with @Porter):**
  Q23 settled `localhost`, but not what is *behind* it. With the frontend alone
  he can open `/login` and nothing else — the other two reworked screens require
  an authenticated session, and a real report needs the backend, his PostgreSQL
  and AI API CENTER. Which does he want?
  **(ก)** he **also starts `code-report-back`** against his own `code_report`
  database (the one he ran `migrate`/`seed:users` on) and logs in with his
  `admin` account — then all eight states are real, and states 6–8 need him to
  submit a run or two; or
  **(ข)** he starts **only the frontend**, and the team leaves behind a small
  **local throwaway stub** for `/api/*` so the screens render with **obviously
  fake** data — he sees the layout and every state, but nothing he sees is a real
  report; or
  **(ค)** he opens **only `/login`** for now and judges the other two screens
  later, when TASK-009's acceptance run gives them a real run to look at.
  **Cost, stated so the choice is informed:** (ก) is free for us and most honest;
  (ข) is extra FE work and shows fabricated data as acceptance evidence; (ค)
  defers REQ-003's final criterion behind TASK-009, which is itself waiting on
  Q24. **Do not read Q-SA-16's "ค เดี๋ยวรันเอง" as already answering this** — that
  was about two API-submitted backend jobs, not about him running a server so he
  can look at screens.

(Fern asks; Sober answers as `> answer: ...`)

## Review
(Sober fills this in at REVIEW.)
