# TASK-021: FE — verify `code-report-front` runs and verifies under bun
- Source: SPEC-004
- Status: DONE
- Depends on: none

## What to do

The stakeholder migrated `code-report-front` to bun himself (commit `d44f523`:
`bun.lock` added, `package-lock.json` deleted, nothing else; tree clean). The
`package.json` scripts are runner-agnostic, so **no code or script change is
expected or allowed** here (REQ-005 Req 4). This TASK only produces the evidence
that REQ-005 AC 1 asks for — that the repo's own verification commands actually
succeed under bun — and a light boot sanity.

Working directory: `C:\Users\Admin\develyst\code-report\code-report-front`.

1. From a clean checkout of `d44f523` (or later, tree clean), run `bun install`
   and confirm it resolves against the committed `bun.lock` without rewriting it
   (`git status --porcelain` on `bun.lock` stays empty).
2. Run `bun run typecheck` and paste the exit code + tail of output.
3. Run `bun run build` and paste the exit code + the route list it prints
   (expect **the same four routes** the DONE FE tasks recorded).
4. Boot once with `bun run dev`, load `/login`, confirm the shell renders, then
   stop it. One screen is enough — the three screens are unchanged **by
   construction** (zero source diff since `f70fb02`), so this is a boot sanity,
   not a re-acceptance.
5. Do **not** touch `package.json`, dependencies, or any source file. If any of
   the above fails or would require a code change, **stop** and write it under
   `## Questions` — do not fix it here (that would be a new REQ-005 finding).

## Definition of Done
- [ ] `bun install` clean against `bun.lock` (no lockfile churn); output pasted.
- [ ] `bun run typecheck` exit 0; output pasted.
- [ ] `bun run build` green, listing the same four routes; output pasted.
- [ ] `bun run dev` boots and `/login` renders; server stopped afterward (say so).
- [ ] `git status --porcelain` empty at the reported commit; **no** source,
      script, or dependency change.
- [ ] No secret pasted (no password, no PAT, no cookie value).

## Implementation Notes — Fern, 2026-08-24

**Environment.** Repo `C:\Users\Admin\develyst\code-report\code-report-front`,
HEAD `d44f523` (exactly the migration commit), clean tree before I started.
`bun --version` → `1.3.13`. `package.json` scripts confirmed runner-agnostic:
`dev: next dev`, `build: next build`, `start: next start`, `typecheck: tsc --noEmit`.
No `package.json`, dependency, or source file was touched.

**1. `bun install` — clean against `bun.lock`, exit 0, no lockfile churn.**
```
bun install v1.3.13 (bf2e2cec)
Checked 229 installs across 263 packages (no changes) [137.00ms]
```
`git status --porcelain bun.lock` → empty (lockfile not rewritten).

**2. `bun run typecheck` — exit 0.**
```
$ tsc --noEmit
(no diagnostics)
```

**3. `bun run build` — green, exit 0.** Same four app routes the DONE FE tasks
recorded (`/`, `/login`, `/reports/[jobId]`, `/reports/new`); `/_not-found` is the
framework fallback, not a product route.
```
$ next build
▲ Next.js 16.3.2 (Turbopack)
✓ Compiled successfully in 4.6s
  Finished TypeScript in 2.6s ...
✓ Generating static pages using 7 workers (5/5) in 518ms
Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /login
├ ƒ /reports/[jobId]
└ ○ /reports/new
```

**4. `bun run dev` — bun booted the shell (reached Ready), `/login` renders 200.**
`bun run dev` compiled and reached `✓ Ready in 478ms` under bun (bound to port
3001 because 3000 was taken). A **pre-existing** Next dev server for this same
project directory (PID 7380, not started by me) was already running, and Next 16
refuses a second concurrent dev server for one project dir, so my instance
self-exited with code 1 right after Ready — nothing of mine was left running to
stop. I did **not** kill PID 7380 (not my process to touch — see Question 1).
`/login` was then verified against the live server:
```
GET http://localhost:3000/login  →  HTTP 200
<html lang="th"> ... <title>KnowCode</title>   (35,130 bytes)
```
The shell renders (Thai locale, KnowCode title) — boot sanity satisfied. This is
a boot check only, not a re-acceptance; the three screens are unchanged by
construction (zero source diff since `f70fb02`).

**Post-run state.** HEAD still `d44f523`; `git status --porcelain` → empty. No
source/script/dependency change. No secret pasted (no password, PAT, or cookie).

### DoD
- [x] `bun install` clean against `bun.lock` (no lockfile churn); output pasted.
- [x] `bun run typecheck` exit 0; output pasted.
- [x] `bun run build` green, same four routes; output pasted.
- [x] `bun run dev` boots (reached Ready under bun) and `/login` renders 200;
      my instance self-exited (guard) — no process of mine left running. See Q1.
- [x] `git status --porcelain` empty at `d44f523`; no source/script/dependency change.
- [x] No secret pasted.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

- **Q-FE-27 (NON-BLOCKING).** A pre-existing Next dev server (PID 7380) for this
  exact project directory was already running on port 3000 when I ran
  `bun run dev`. Next 16 allows only one dev server per project dir, so my bun
  instance reached `✓ Ready` on 3001 then self-exited. I did **not** kill PID 7380
  (not mine to touch), so my `/login` boot check was made against that live server
  rather than an isolated bun-only instance. Evidence that bun itself boots is the
  `✓ Ready in 478ms` line under `bun run dev` plus the green `bun run build`. Do
  you want an isolated bun-only boot (which would require stopping PID 7380 — whose
  owner I don't know), or does the Ready line + the 200 on `/login` satisfy AC 1's
  boot sanity as-is? I read the DoD as satisfied and am submitting for review.

> answer (Sober, 2026-08-24): **The Ready line + green `bun run build` satisfy
> AC 1's boot sanity as-is; no isolated bun-only boot is required, and NOT killing
> PID 7380 was correct.** Reasons: (1) AC 1 asks that `bun run dev` *starts the
> frontend* and that the verification commands *run under bun* — `✓ Ready in 478ms`
> is genuine bun-boot evidence (compile succeeded, listener bound under bun), and
> `typecheck`/`build` exit-0 is the verification half. (2) `/login` *compiling*
> under bun is separately proven by the green `bun run build` (a production build
> compiles every route, `/login` included); its *serving* the shell (200, `lang="th"`,
> KnowCode) is confirmed on the byte-identical source tree — zero source diff since
> `f70fb02`, so what PID 7380 serves is what a bun instance would serve. (3) PID 7380
> is a process of unknown ownership on this project dir; stopping it to get a
> marginally purer boot check is not your call and not worth the risk — the
> single-instance guard that self-exited your bun instance is expected Next-16
> behaviour, not a defect. **Residual, recorded not hidden:** we have no capture of
> a request served *by the bun dev instance itself*; the SPEC framed TASK-021 as a
> light boot sanity, not a re-acceptance, and the build + Ready + identical-source
> chain closes that gap for AC 1. Nothing further owed.

## Review

**Verdict: DONE — accepted.** Reviewed read-only against the real repo at
`code-report-front` HEAD `d44f523` (I independently ran `git rev-parse`,
`git status --porcelain`, and enumerated the route files — not trusting the pasted
output alone).

- **Independently corroborated:** HEAD is `d44f523`, `git status --porcelain` is
  empty (clean tree, no source/script/dep change), `package.json` scripts are
  runner-agnostic (`next dev/build/start`, `tsc --noEmit` — no npm), and the app
  tree has exactly **four** product routes — `src/app/page.tsx` (`/`),
  `(auth)/login/page.tsx` (`/login`), `(app)/reports/new/page.tsx`,
  `(app)/reports/[jobId]/page.tsx` — matching what Fern reported. `/_not-found`
  correctly excluded as the framework fallback.
- **DoD rows 1–3, 5, 6 met with pasted evidence:** `bun install` no-change against
  the committed `bun.lock` (zero lockfile churn), `bun run typecheck` exit 0,
  `bun run build` green with the same four routes, clean tree at the reported
  commit, no secret pasted.
- **DoD row 4 (boot sanity) met** on the evidence chain in Q-FE-27's answer above:
  `✓ Ready in 478ms` under bun + green build + `/login` 200 on identical source.
  Fern's instance self-exited (Next-16 single-instance guard) so nothing of hers
  was left running; she correctly did not touch the unknown PID 7380. This is a
  light boot sanity per SPEC-004, not a re-acceptance — accepted.
- **Q-FE-27 answered above (NON-BLOCKING):** no rework; the residual (no request
  captured from the bun instance itself) is recorded, not a defect, and does not
  gate AC 1.

With TASK-021 `DONE` — the only TASK of SPEC-004 — **SPEC-004 is DONE** and
**REQ-005 is `SPEC_DONE`**: AC 1 (bun dev starts + verification under bun) proven
here, AC 2 (clean tree) already met at `d44f523`, AC 3 (no FE TASK gated on npm)
met by the SA wording edits + Req-5 grep check, AC 4 (three screens unchanged) met
by construction (zero source diff). **@Porter: REQ-005 is ready for your acceptance
check.**
