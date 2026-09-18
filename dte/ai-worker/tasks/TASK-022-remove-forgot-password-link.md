# TASK-022: Remove the dead `/forgot-password` link from `/login`
- Source: SPEC-007
- Owner: FE (Fern)
- Status: DONE (reviewed 2026-09-13, Sober — see §Review)
- Depends on: none

## What to do

**Edit `front/src/components/partials/Login/LoginContent.tsx` only.** One deletion:

- Delete lines 154-156 — the `<Link href="/forgot-password" className="text-sky-600 hover:text-sky-500
  transition-colors">ลืมรหัสผ่าน?</Link>` element.

**Do not:**
- remove or change the wrapper `<div className="flex items-center justify-between text-sm">` or the
  `BaseCheckbox` inside it (the checkbox stays flush-left on its own — SPEC-007 §Flow 2);
- remove `import Link from 'next/link'` — line 174 (`สมัครฟรีเลย`) still uses it;
- touch any class string, any Thai string, any other file, `themes.css`, or anything in `ui/`;
- build, stub, or redirect a `/forgot-password` route. The owner said remove (A45).

The diff must be a pure deletion of three lines. If you find yourself adding a line, stop and ask.

## Definition of Done

Run each command yourself and paste the **real output** into §Implementation Notes. A claim with no
output is `REWORK`. Your real-Chrome Playwright harness (`playwright-core` + `executablePath`
against `npx next start`) is the instrument for DoD 5-7; nothing below assumes the Chrome extension.

- [ ] 1. `npm run build` in `front/` — exit 0, route table still lists **9 routes**. Paste the table.
- [ ] 2. `npx tsc --noEmit` in `front/` — exit 0, no output.
- [ ] 3. `grep -rn "forgot-password\|forgot\|ลืมรหัสผ่าน" src next.config.ts public` from `front/` —
  **no matches**. Paste the command and its (empty) result plus the exit code.
- [ ] 4. `node <harness>/check-no-emoji.mjs src` from `front/` — still **110**. Do not re-baseline.
- [ ] 5. Against `npx next start` (state the port; stop it after): `GET /login` → **200**, and in the
  rendered DOM `document.querySelectorAll('a[href="/forgot-password"]').length === 0` and
  `document.body.innerText.includes('ลืมรหัสผ่าน')` is **false**. Paste both values.
- [ ] 6. **Geometry, both themes, same viewport, BEFORE and AFTER** (take BEFORE on the unedited file
  first — a stash/copy is fine, `tests/harness/LoginContent.tsx.task004.bak` is NOT the before, it
  predates TASK-004): `getBoundingClientRect()` of (a) the `จดจำฉัน` checkbox row `div`, (b) the
  checkbox input, (c) the submit button. Expected: (a) height unchanged, (b) and (c) `x/y/width/
  height` unchanged. If anything moved, paste the numbers and hand it back — do not compensate.
- [ ] 7. Behaviour unchanged, in the browser: a wrong password still shows
  `อีเมลหรือรหัสผ่านไม่ถูกต้อง` in the red banner; the demo credentials
  `john@example.com / password123` still log in (say what happened after submit).
- [ ] 8. `git diff --stat` and `git diff` of the one file — read-only git use, allowed: shows **1 file,
  0 insertions, 3 deletions**. Paste it.
- [ ] 9. Screenshot of `/login` AFTER, light and dark, saved under `tests/harness/` with the filenames
  stated — Porter will hand these to the owner for REQ-007 AC 3 (his eyes are the only thing that
  closes it; yours close AC 1 and AC 2).

Then set this TASK `REVIEW` on the board, and `@Sober` in `inbox/SA.md`.

## Implementation Notes

**Fern, 2026-09-13.** One file edited: `front/src/components/partials/Login/LoginContent.tsx` — the
three `<Link href="/forgot-password">` lines deleted, nothing else. The wrapper `div`, the
`BaseCheckbox`, and `import Link from 'next/link'` (still used by `สมัครฟรีเลย`) stay. Line endings:
CRLF as found — **228 CRLF / 0 bare LF before, 225 CRLF / 0 bare LF after** (Node count; no `sed -i`,
per SYSTEM-FACTS A40). Instrument: a new throwaway script in the coordination repo,
`ai-worker/tests/harness/measure-login-link.mjs` (real Chrome via `playwright-core` + `executablePath`
from a scratch dir; nothing added to `front/`). BEFORE was taken on the unedited file (built and served
first), then the edit, then the AFTER build and run. Server: `npx next start -p 3062`, stopped after
each run (`taskkill … SUCCESS`, PIDs 23968 / 21248). No backend runs on this machine and none was
pointed at; `NEXT_PUBLIC_API_URL` unset → the app's own `http://localhost:4002` default.

### DoD 1 — `npm run build` — exit 0, 9 routes
```
Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /about
├ ƒ /classroom/[id]
├ ○ /courses
├ ○ /login
├ ○ /register
├ ○ /teach
└ ○ /verify-email
build exit=0
```

### DoD 2 — `npx tsc --noEmit` — exit 0, no output
```
tsc exit=0
```

### DoD 3 — repo-wide grep — no matches
```
$ grep -rn "forgot-password\|forgot\|ลืมรหัสผ่าน" src next.config.ts public
grep exit=1        (no output — grep's "nothing matched")
```

### DoD 4 — emoji harness — still 110, not re-baselined
```
$ node <harness>/check-no-emoji.mjs src
110 occurrence(s) in 52 file(s) scanned.
```

### DoD 5 — DOM against `npx next start -p 3062` (real Chrome, both themes)
```
=== AFTER / light (html="light") GET /login -> 200 ===
a[href="/forgot-password"].length = 0
body.innerText.includes('ลืมรหัสผ่าน') = false
row children=1 text="จดจำฉัน"
=== AFTER / dark (html="dark") GET /login -> 200 ===   (same three values)
```
For contrast, BEFORE on the unedited build read `length = 1`, `includes = true`, `row children=2
text="จดจำฉัน ลืมรหัสผ่าน?"` — the instrument sees the link when it is there.

### DoD 6 — geometry, viewport 1280×1050, both themes, BEFORE vs AFTER — **all unchanged**
```
                 BEFORE (light = dark)            AFTER (light = dark)
(a) row div      x=449 y=591 w=382 h=22           x=449 y=591 w=382 h=22
(b) checkbox     x=449 y=594 w=16  h=16           x=449 y=594 w=16  h=16
(c) submit       x=449 y=637 w=382 h=48           x=449 y=637 w=382 h=48
```
SPEC-007's hypothesis (the checkbox was the row's taller child, so removing the link moves nothing)
is **confirmed by measurement**: row height 22 px both ways, checkbox and submit byte-identical rects.
Nothing compensated.

### DoD 7 — behaviour, in the browser — **with the backend MOCKED, stated plainly**
No `back/` runs on this machine (not mine to run, and it needs a DB). The harness intercepts the app's
own `POST http://localhost:4002/auth/login` with `page.route()` and answers it; so this proves the
**frontend's** submit path, not the real credentials or the real API:
```
wrong password (route → 401 {"message":"Invalid credentials"}):
  url stayed http://localhost:3062/login · banner text = "อีเมลหรือรหัสผ่านไม่ถูกต้อง" · dte_user = null
demo login john@example.com / password123 (route → 200 minimal AuthResponse, role student):
  after submit: url = http://localhost:3062/  (router.push('/') — the redirect default)
  banner = null · localStorage dte_user = {"id":"u1","display_name":"John Doe","email":"john@example.com","role":"student"}
```
Both results are identical BEFORE and AFTER (the BEFORE run drove the same two cases). **UNVERIFIED
against a real backend** — what would settle it: the same two submits against a running `back/` on
`4002`, or the owner's eyes on the live site (REQ-007 AC 3).

### DoD 8 — `git diff` (read-only) — 1 file, 0 insertions, 3 deletions
```
 front/src/components/partials/Login/LoginContent.tsx | 3 ---
 1 file changed, 3 deletions(-)
@@ -151,9 +151,6 @@ function LoginForm() {
             <div className="flex items-center justify-between text-sm">
               <BaseCheckbox className="text-theme-secondary">จดจำฉัน</BaseCheckbox>
-              <Link href="/forgot-password" className="text-sky-600 hover:text-sky-500 transition-colors">
-                ลืมรหัสผ่าน?
-              </Link>
             </div>
```

### DoD 9 — screenshots for Porter → the owner (REQ-007 AC 3), full page, 1280 wide
- `ai-worker/tests/harness/login-AFTER-light.png` · `login-AFTER-dark.png` (the deliverable)
- `login-BEFORE-light.png` · `login-BEFORE-dark.png` (for the side-by-side, if wanted)
Seen with my own eyes (light): the card reads อีเมล / รหัสผ่าน / `☐ จดจำฉัน` flush-left on its own row /
`เข้าสู่ระบบ` / `ยังไม่มีบัญชี? สมัครฟรีเลย` / the demo line. Nothing else on the page moved.

## Questions

(Fern asks; Sober answers as `> answer: ...`)

## Review

**Sober, 2026-09-13 — verdict: `DONE`.** Reviewed the evidence, not the claim; re-ran what can be re-run
from a code read on `develop`:

- DoD 3 re-run by me: `grep -rn "forgot-password\|forgot\|ลืมรหัสผ่าน" src next.config.ts public` → no
  output, exit 1. `LoginContent.tsx:152-154` is now the wrapper `div` + `BaseCheckbox` only; `import Link`
  kept and still used (lines 90, 171). Matches SPEC-007 §Flow 1-3 exactly; the diff is deletion-only (DoD 8).
- DoD 6: SPEC-007's row-height hypothesis was measured, not asserted — BEFORE/AFTER rects byte-equal in
  both themes. That is the instrument rule done right.
- DoD 9: `tests/harness/login-AFTER-{light,dark}.png` exist (2026-09-13 13:06); I looked at the light
  one — `จดจำฉัน` sits flush-left on its own row, nothing else moved. AC 1 + AC 2 of REQ-007 are met on evidence.
- **DoD 7 is `UNVERIFIED` against a real backend** — Fern said so plainly (mocked `/auth/login`). Accepted
  as DONE because no `back/` runs here and the change touches no submit code; Porter carries the caveat
  with AC 3. What would settle it: one wrong-password + one demo login on the live site, the owner's eyes.
- Nothing to attribute: no defect found.

REQ-007 → `SPEC_DONE`; AC 3 (his eyes) goes to Porter with the two AFTER screenshots.
