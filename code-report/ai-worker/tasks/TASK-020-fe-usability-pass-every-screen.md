# TASK-020: FE — Requirement 7 usability pass, every screen
- Source: SPEC-003
- Status: **TODO — STARTABLE 2026-08-21** (TASK-018 is `DONE` at `f70fb02`; its
  two carried-in gaps are below). Ceiling still 7c until the 7d widening is written.
- Assignee: Fern (FE)
- Depends on: TASK-018. **Last of SPEC-003's four TASKs on purpose.**
- Written: 2026-08-21 by Sober (SA Lead)

## Carried in from the TASK-019 review (2026-08-21)

**One cosmetic line, only if this TASK opens `ReportResult.tsx` anyway (Q-FE-22):**
its `onTryAgain` prop still reads `(failed: ReportJob) => void` while the handler
passed to it now takes no argument. It type-checks and nothing reads the argument;
narrowing it to `() => void` is a one-line tidy, **not** a defect and **not** a
reason to open the file.

## Carried in from the TASK-018 review (2026-08-21) — two named gaps, neither a defect

Both were accepted at that review rather than sent back, and both are behaviour
this TASK is allowed to look at. **Neither is an instruction to change something**
— they are findings you did not have to discover, and they still have to earn a
line on your findings list before you touch anything (item 3 below).

1. **The committer field is the one place "the form is filled" is deferred**
   (Q-FE-24). Coming back from a report, the branch is restored as soon as its
   list loads — but the committer list never loads by itself (SPEC-003 Decision
   2.2, deliberately: it is a clone), so the field reads "ทุกคน" until the reader
   chooses to load it, even though the run they came back from had a committer.
   The value is not lost — `pendingAuthor` still applies it when the list loads.
   Ruled acceptable; the two obvious "fixes" were examined and refused at the
   review (see TASK-018 §Questions → Q-FE-24) — **do not re-implement either
   without a finding and a `## Questions` line.**
2. **Second round trip loses the extra-context box** (Q-FE-23's answer).
   form → report → Back → **Forward** → Back leaves every other field restored and
   the free-text box empty, because the handoff is take-and-remove (Q-FE-21) and
   the API carries no `extraContext` for the report page to re-supply (Q-SA-20).
   Ruled acceptable. Anything that changes the handoff's **lifetime** re-opens
   Q-FE-21 and is a `## Questions` line, not a fix.

**Stale fact corrected while in this file (2026-08-21):** the 7c boundary below
says "Q32 is open". **Q32 is ANSWERED** — "ใช่หากมันดีขึ้นต่อการใช้งานก็จัดการเลย",
which released 7c into **Requirement 7d**. **How much further that opens
SPEC-002's freeze and this TASK's ceiling is a design unit I have not written
yet**, so — deliberately — **the 7c list below stands exactly as written until I
do**, and Requirement 7e already holds the **sanitizer** and the **PAT rules**
outside 7d in any case. Nothing here is startable earlier or later because of this
correction.

## Why this exists, and why it is last

REQ-004 Requirement 7 (Q26 = "ก"), widened by **Q31 = "ทุกหน้า แก้พฤติกรรมได้ด้วย"**
to **every screen** and to **behaviour**, not only looks. The team finds usability
problems on its own judgement and **the stakeholder's own eyes are the acceptance
test** — the same arrangement as Q16 on REQ-003.

It is last because Requirements 1–6 change three of the four screens. A usability
pass run before them would be a pass over screens that are about to move.

## Scope

- **Every screen the app has today**, and only those: `/`, `/login`,
  `/reports/new`, `/reports/[jobId]` (Requirement 7b). **Not** an instruction to
  add screens — no report-history screen (REQ-001 §12), no deployment.
- **Behaviour as well as usability** — but bounded by **Requirement 7c**, below.

## The one hard boundary — Requirement 7c

**Q32 is open.** Until the stakeholder answers it, behaviour that **REQ-001
explicitly named and he accepted** changes only with his yes/no:

> the ≤366-day span · `DD/MMM/YY` dates and `HH:mm` times, Bangkok-pinned ·
> Thai/English + `Accept-Language` · the PAT rules (never prefilled, sent once,
> never stored) · the `NO_COMMITS` note · the Markdown sanitizer · the report
> page's polling behaviour (2 s, then 5 s after 60 s, stop on terminal status and
> on unmount, resume from the URL after a refresh).

If you want to change one of those: **write it in `## Questions` with what you
would do and why, and carry on with the rest.** It is not a change you make and
mention. Everything REQ-001 never named is yours to fix on judgement.

**Copy is not released either.** Q14 closed the bundle: a **new** key is allowed
and comes back to him with the Q-SA-19 round (author the th/en pair in
`## Implementation Notes`); **rewording an existing approved string is not**, and
is a `## Questions` line.

**Still frozen, whatever Q31 says:** SPEC-002 freeze items 3 (`RequireAuth` guards
both `/reports/*`) and the parts of items 1, 2 and 4 that SPEC-003 did **not**
release — routes and redirect rules, the login POST / cookie / `?expired=1`
wiring, the span, the `YYYY-MM-DD` wire values, the PAT field's rules, extra
context and the report-language field. Items 5, 7, 8, 9, 10 are inside the 7c
list above.

## What to do

1. **Walk every screen in every state it can be in, and write the walk down**
   before you change anything. States, at minimum: login idle / submitting /
   wrong credentials / session-expired; the form empty / branch list not loaded /
   load failed / loaded / submitting / server validation error; the report page
   QUEUED / RUNNING / DONE / NO_COMMITS / FAILED / offline / job not found. Also
   at 375, 768 and 960, and with the keyboard only.
2. **Produce a findings list** — one line each: what is hard to use or wrong, on
   which screen and state, and which side of the 7c line it falls.
3. **Fix the ones on your side of the line.** Every fix must trace to a written
   finding; a change with no finding behind it is scope you invented.
4. **Raise the rest as `## Questions`** — one line each, answerable in one line,
   so Porter can take them to him in one round if he chooses.

This TASK is deliberately not a list of my own fixes: Q26 = "ก" gave the judgement
to the team, and pre-writing the findings here would take it back.

## Boundaries

- **No new dependency at all** (SPEC-002 Decision 3.4 as amended).
- **No backend change** and no API-contract change. A usability problem whose fix
  is on the server is a `## Questions` line to me — I own whether it becomes a BE
  TASK.
- **No re-theming.** The cobalt register, the token block in `globals.css` and
  Mantine-first (SPEC-002 Decision 3) all stand; this is a usability pass, not a
  third redesign.
- Do not touch `code-report-back`, `ai-worker/` artifacts, or anyone else's TASK.

## Definition of Done
- [ ] The **walk** and the **findings list** are in `## Implementation Notes`,
      including the findings you did **not** act on and why (7c, copy, freeze).
- [ ] Every change traces to a numbered finding.
- [ ] `npm run typecheck` exit 0.
- [ ] `npm run build` green, listing **the same four routes**.
- [ ] Repo-wide SPEC-002 gate still a real zero: **0 Tailwind colour utilities,
      0 font-family utilities** outside `globals.css`.
- [ ] **Nothing in the 7c list changed** — state it item by item, naming the files
      you touched and why each item could not be affected by them.
- [ ] Existing approved strings unchanged; any **new** key listed with its th/en
      pair for the Q-SA-19 round.
- [ ] Re-measure the acceptance rows TASK-018 and TASK-019 established (the
      branch gate, today → today, the 366/367 bound, "everyone" sends no `author`,
      both ways back land on a filled form): they must still hold.
- [ ] Keyboard-only pass and the 375 / 768 / 960 pass, both recorded.
- [ ] `git status --porcelain` empty at the reported commit, and the hash in
      `## Implementation Notes`.
- [ ] Standing FE proxy rule honoured: set `API_PROXY_TARGET` **before**
      `npm run build`, and restore the env afterwards.

**Acceptance is not this DoD.** The DoD closes the TASK; REQ-004's criterion is
the stakeholder opening every screen himself and saying it is acceptable — the
same real test as REQ-003, and it reaches him through Porter, not from here.

## Implementation Notes
(Fern fills this in: the walk, the findings list, what was fixed, the commit hash.)

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review
(Sober fills this in at REVIEW.)
