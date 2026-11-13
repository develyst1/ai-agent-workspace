# TASK-007: Front scaffold + sign-in + project list + project page (the owner's loop)
- Source: SPEC-002 (§Overview, §API rows A1–A3, P1–P3, T1–T4; §Front — pages rows `/sign-in`, `/`, `/projects/[id]` without comments and AI; §Non-functional deploy shape) · the comp approved under AC-10 (TASK-002)
- Owner: FE (Fern)
- Status: DONE (2026-11-08, SA review of round 2; 32/32 against the real back). Earlier lines, kept: REVIEW (Fern, round 2) · IN_PROGRESS (2026-11-08: TASK-011 DONE). Left to do: the Q-F3 strings and checks, then re-run `task-007.mjs` against
  `tests/harness/back-pglite/serve.ts` (the REAL back), paste the result, and set REVIEW. The front side was accepted by the SA on 2026-11-08. Layout B.
- Depends on: TASK-010 (DONE), TASK-004 (DONE)
- **Layout = B** (owner 15:53, *"เลือกแบบ B บอร์ดสี่สถานะ ให้ทีมพัฒนาต่อ"*, DECISIONS 15:53): `/projects/[id]` is the four-status board
  from `/comp/project-b`. A card's status menu does the status change (choosing ติดอยู่ asks for the reason). The task's thread opens in
  the drawer, as an empty shell here; TASK-008 fills the comments. On a phone the columns scroll sideways inside the board, as previewed
  (he chose B knowing that). Other pages (`/sign-in`, `/`) follow B's look. **Layout A is dropped**: delete `/comp/project-a`, and delete
  `/comp/project-b` once the real page renders. Use the HeroUI **v3** API (SPEC-002 front line), not the skill's v2 samples.
- **AMENDED 2026-11-08 by the SA (owner 13:17, HeroUI):** step 1 is replaced by TASK-010's scaffold. Build on it; don't re-scaffold.
  Every screen uses HeroUI components and the approved comp's look. Where "the approved comp" or "TASK-002" appears below, read
  TASK-010. The `/comp/project-a` and `/comp/project-b` routes are deleted in this TASK once the real `/projects/[id]` exists.
  Build only the layout the owner picks (AC-10).
- **Q-F1 answered by the PM, 2026-11-08:** the close-comment-panel label is **"ปิดคอมเมนต์"**. Add it to `strings.th.ts` in place of the stand-in `ยกเลิก`.
- Git: none by you.

## What to do
Repo `god-plan-front` (path in `machine.local.md`; check that the branch is `atom`).
1. Next.js App Router + TypeScript + Tailwind. Font IBM Plex Sans Thai via `next/font`. `next.config.ts`: `output: "standalone"`,
   `rewrites()` `/api/:path*` → `${BACK_ORIGIN}/api/:path*`. Copy script + `build` script per the `deploy-ready-build` skill.
   `.env.example` with `BACK_ORIGIN` + one comment line. `.env.local` git-ignored. Dev on port 4300.
2. `src/strings.th.ts`: **every** visible string, taken from REQ-001 §User-facing wording + the PM's Q-S2 answer. Nothing typed inline in components.
3. `src/lib/api.ts`: typed client for the routes above, **field names exactly as SPEC-002**. On 401 → go to `/sign-in`. Maps
   error codes → strings (`VALIDATION`+`tooLong` → "ยาวเกิน <N> …" with `max`).
4. Pages: `/sign-in` · `/` (list + owner's new-project form) · `/projects/[id]` (tasks with status label + Stuck reason; owner:
   add, change status — choosing ติดอยู่ asks for the reason in the same step, rename, delete with confirm). Layout = the
   approved comp. `not-found.tsx` + `error.tsx` in Thai.
5. Invitee view: no create/edit/delete controls rendered at all (AC-6).
6. Front-side limits per D16 (the back stays the authority). No `dangerouslySetInnerHTML` anywhere.

## Definition of Done
- [ ] `bun run build` passes, and `ls .next/standalone/server.js .next/standalone/.next/static` exist. Paste.
- [ ] With the back running on dev and the synthetic owner (`god-plan-qa.env`): screenshots at 390 px and 1280 px of the sign-in page, the
      list, and a project with one ติดอยู่ task. Saved under `god-plan/ai-worker/tests/harness/shots/TASK-007/`, list pasted.
- [ ] AC-2a in the browser: ติดอยู่ with an empty reason shows "ใส่เหตุผลที่ติดก่อน", and the status is unchanged after a reload. Paste
      what you did + a screenshot path.
- [ ] `grep -rn "dangerouslySetInnerHTML" src` → none. `grep -rnP "[\x{0E00}-\x{0E7F}]" src --include=*.tsx` → none (all Thai in
      `strings.th.ts`). Paste both.
- [ ] `git check-ignore .env.local` → ignored; `git status --short` pasted.

## Implementation Notes
**Fern, 2026-11-08.** Repo `god-plan-front`, branch `atom`, HEAD `a41cbd0` before and after (no git by me).

🔴 **Read this first: I could NOT run this against the real back.** `god-plan-back` has no `.env` and nothing is listening on 4310; the dev database is not created (TASK-001 BLOCKED); `god-plan-qa.env` does not exist. So the DoD lines that name "the back running on dev and the synthetic owner" are **UNVERIFIED against the real back**. What I did instead: wrote a throwaway **stand-in for the back from SPEC-002 §API only** (`tests/harness/front-contract-stub/server.ts`, in memory, synthetic people, sign-in values read from the environment, none in any file) and drove the real front through a real browser against it. That proves the **front's wiring and screens**. It does **not** prove the back, and the stand-in is my own reading of the SPEC, so a contract mismatch with the real back would not show here.

**What was built** (all on TASK-010's scaffold; HeroUI v3 compound API; no provider)
- `src/lib/api.ts`: typed client, field names exactly as SPEC-002 (A1–A3, P1–P3, T1, T3, T4). 28 s fetch timeout. A 401 `UNAUTHENTICATED` sends the browser to `/sign-in`. `messageFor()` maps codes to the PM's strings (INVALID_CREDENTIALS, NOT_FOUND, `tooLong` + `max`, `tooShort`, stuckReason `required`); anything else returns `null`.
- `src/lib/limits.ts`: D16 limits from SPEC-002's CHECKs (title 200, project name 100, description 2000, reason 500, comment 2000, display name 100, email 254, password ≥ 8). Checked in the front too; the back stays the authority.
- Pages: `/sign-in` · `/` (project list with per-status counts; owner-only new-project form) · `/projects/[id]` = **layout B** (four status columns, status menu on each card, drawer shell for the thread) · `not-found.tsx` · `error.tsx`.
- Owner actions on the board: add task, change status (choosing ติดอยู่ asks for the reason in the same step and changes nothing until it is saved), rename (inline), delete **with the PM's confirm** (names the task and says the comments go too).
- Invitee view (AC-6): `isOwner` false → the status is a plain chip, no add/rename/delete/menu is rendered.
- Q-F1: the drawer's close label is now `ปิดคอมเมนต์` (was the stand-in `ยกเลิก`).
- Layout A and both `/comp/*` routes are **deleted** (`rm -r src/app/comp`, my own TASK-010 files, after the real page rendered in the browser).
- Not in this TASK, on purpose: the thread's comments (TASK-008), the AI button and summary (TASK-009), the links to summary and members (their pages do not exist yet; a link to them would open "ไม่พบหน้านี้").

**DoD evidence (all run by me)**
- `bun run build` → `✓ Compiled successfully`; routes `/ · /_not-found · /projects/[id] · /sign-in`; `[postbuild] copied .next/static into .next/standalone`. `ls -l .next/standalone/server.js` → `6940 B`; `ls .next/standalone/.next/static` → `chunks  e1LpfGpc7OKkY1jjlUFsA  media`. `bunx tsc --noEmit` → `TSC_OK` (run after the build; an earlier run failed only on a stale `.next/types` that pointed at the deleted comps).
- Standalone: `PORT=4399 HOSTNAME=127.0.0.1 node .next/standalone/server.js` → `/sign-in` 200, its CSS under `/_next/static/` 200. Stopped after.
- `bun pm ls | grep -E "react@|react-dom@|@heroui/react@|next@"` → `@heroui/react@3.1.0 · next@16.2.9 · react@19.2.7 · react-dom@19.2.7` (+ `lucide-react@1.17.0`, `@types/react@19.2.18`, `@types/react-dom@19.2.7`). One React.
- `grep -rn dangerouslySetInnerHTML src` → no hits (exit 1). `grep -rnP "[\x{0E00}-\x{0E7F}]" src --include=*.tsx` → no hits (exit 1; a Thai word in a comment in `error.tsx` was removed to get there). Thai lives only in `src/strings.th.ts`. No `#hex` colour in `src`.
- `git check-ignore -v .env.local` → `.gitignore:5:.env*.local  .env.local`. `git status --short` → ` M README.md`, `?? .env.example .gitignore bun.lock next.config.ts package.json postcss.config.mjs scripts/ src/ tsconfig.json`.
- **Browser run, 24/24 checks passed**, `node ai-worker/tests/harness/task-007.mjs` (headless Chrome over the DevTools Protocol, real clicks and typing; front on :4300, stand-in on :4310), after restarting the stand-in so its data was fresh. It covers: wrong password → "อีเมลหรือรหัสผ่านไม่ถูกต้อง" and stays on `/sign-in` · owner signs in → `/` · project opens · both ติดอยู่ tasks show their reasons · **AC-2a**: choosing ติดอยู่ asks the reason; saving it empty shows "ใส่เหตุผลที่ติดก่อน"; after a reload the task is still in ยังไม่เริ่ม · a real reason is saved and survives a reload · **AC-17**: moving it out of ติดอยู่ drops the reason · add · rename · delete (the PM's confirm text shown, then the task is gone) · drawer opens and closes with `ปิดคอมเมนต์` · unknown project → "ไม่พบหน้านี้" · 390 px: page overflow 0 px on the list, the board, and after scrolling the strip · sign-out → `/sign-in`; signed out, `/` → `/sign-in` · **AC-6**: the invitee sees tasks and reasons and 0 add/rename/delete/status controls, and no new-project form · **AC-4 (front side)**: the invitee opening the other project's address sees "ไม่พบหน้านี้" and none of its content.
- Screenshots, `ls -l ai-worker/tests/harness/shots/TASK-007/` (I opened the sign-in, list, project 1280, project 390, 390-stuck, AC-2a refused, delete confirm and invitee shots): `signin-390.png 12809` · `signin-1280.png 16098` · `list-390.png 43014` · `list-1280.png 49013` · `project-390.png 23878` · `project-390-stuck.png 49887` (the strip scrolled to ติดอยู่) · `project-1280.png 79912` · `ac2a-reason-form-1280.png 87743` · `ac2a-refused-1280.png 89371` · `delete-confirm-1280.png 82275` · `drawer-1280.png 69138` · `invitee-list-1280.png 26405` · `invitee-project-1280.png 72440`. All synthetic.

**Decisions I made (internal, one line each)**
- The list page's description field is a one-line input (the SPEC allows 2000 characters; a multi-line box can come if the owner wants long descriptions).
- A failed action that has no string in the PM's table leaves the screen unchanged and shows nothing (see Q-F3). Page-load failures other than 401/404 go to `error.tsx`.
- A sign-in 400 (bad email shape) shows the "wrong email or password" string, the only sign-in failure string that exists.
- `Result {ok, message}` is returned by every card action so a failure with no string is still treated as a failure.
- On a phone, as the owner saw in the preview, the first column fills the screen and the rest scroll sideways inside the board.

**UNVERIFIED**
- `UNVERIFIED — against the real back` (everything above): settles when the BE's back runs on dev (TASK-001 → `db:migrate` → `owner:set` → `god-plan-qa.env`) and `task-007.mjs` is run against it with that owner. The script reads `STUB_*` variables; pointing it at the real back needs the same four values (owner email/password, and an invitee) from the QA file and a seeded invitee.
- `UNVERIFIED — /impeccable audit` (not listed in my session; the SA said it applies to this TASK). Would settle it: run it on `/sign-in`, `/` and `/projects/[id]`.
- `UNVERIFIED — real phone`, keyboard-only and screen-reader pass. Hit targets are `min-h-11` in the classes; not measured in the page. Contrast was computed on TASK-010's tokens, not re-measured after this TASK's screens.
- Not exercised in the browser: the status menu's keyboard use, the 28 s timeout, a 500 from the back, `VALIDATION tooLong` coming back from the back (only the front-side limit text exists), password `tooShort` (no screen uses it yet; TASK-008).

### Round 2 — Q-F3 strings + the run against the REAL back (Fern, 2026-11-08)
- **Q-F3 applied.** `strings.th.ts` has `saveFailed` (บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง), `noPermission` (คุณไม่มีสิทธิ์ทำรายการนี้), `loadFailed` (โหลดหน้านี้ไม่สำเร็จ ลองรีเฟรชอีกครั้ง). `messageFor()` now always returns a string: expected codes keep their own string, 403 → `noPermission`, anything else (network, 500, timeout, unknown) → `saveFailed`. `error.tsx` shows `loadFailed`; "ไม่พบหน้านี้" stays for 404 / no access (the members page also treats a 403 as no access). Every form keeps what was typed on failure (the stuck-reason box, rename, add-task, comment, new project; the sign-in email stays too). A sign-in 400 still maps to the wrong-sign-in string.
- **The real back.** Port 4310 was already taken by another session's copy of `back-pglite` (pid not mine; I did not touch it, and I do not have its seed passwords). So I ran **my own copy of `tests/harness/back-pglite/serve.ts` with only the port changed to 4311** (scratch file, outside the workspace; it still imports the real back's `createApp`, schema, migrations and `setOwner` from the repo), with the front dev server pointed at it by `BACK_ORIGIN=http://127.0.0.1:4311`. Seed passwords were random values on the command line, never written to a file or pasted. Owner `owner@godplan.test`, invitee A `invitee-a@godplan.test`.
- **Result: `DATA=real BACK_PID=<my back> node ai-worker/tests/harness/task-007.mjs` → 32/32 passed** (`task-007.mjs` was made data-driven: `DATA=real|stub`). It repeats all 24 earlier checks against the real back's seed (P1 "ย้ายบ้านใหม่", P2 "งานสวนหลังบ้าน"), adds "still gone after a reload" for AC-17 and delete, and adds the Q-F3 checks: 403 → `noPermission` and the reason box keeps its text · 500 on save → `saveFailed` and the add-task box keeps its text · a page that cannot load → `loadFailed` and not "ไม่พบหน้านี้" · and the real network case: the script stops the back it was given (`process.kill(<pid>)`, no kill by name) and a save shows `saveFailed` with the typed title kept. The 403 / 500 / load cases are faked with CDP request interception (the back never returns them for these actions), so they prove the front's mapping, not the back.
- Shots from this run: `ai-worker/tests/harness/shots/TASK-007-real/` (same names as before, plus `qf3-403-1280.png`, `qf3-500-1280.png`, `qf3-load-failed-1280.png`, `qf3-back-stopped-1280.png`); I opened `project-1280.png` and `qf3-back-stopped-1280.png`. The first set (stand-in) is still in `shots/TASK-007/`.
- After the run: `bunx tsc --noEmit` → `TSC_OK`. Servers: my back stopped by the script; my front dev server still up for TASK-008 and will be stopped at its end.
- Small fix on the way: the field error text was Thai at ~12 px; it is now `text-sm`.
- Not repeated: `bun run build`, the greps and `git status` (see above, unchanged for this TASK's files; the tree now also holds TASK-008's unfinished work, so I will re-run them for TASK-008).
- `UNVERIFIED` still: `/impeccable`, real phone, keyboard / screen reader, hit targets measured.

## Questions
- **Q-F3: ANSWERED by the PM 2026-11-08 (see Review); applied above.** Original question: **(copy, for the PM via you): what does the owner see when a save fails for a reason the table has no string for?** Today: a network failure, a 500, a timeout, or a 403 on an action all leave the screen as it was and say nothing. That is quiet. I suggest one short string for "could not save, try again", plus the same for page-load failure (today `error.tsx` shows "ไม่พบหน้านี้", which the SPEC asked for but is wrong for a server error). I will not invent it.
  > answer (Porter, PM, 2026-11-08): three strings, now in REQ-001 §User-facing wording — save failed (network, 500, timeout): `บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง` · page failed to load (server error): `โหลดหน้านี้ไม่สำเร็จ ลองรีเฟรชอีกครั้ง` · 403 on an action: `คุณไม่มีสิทธิ์ทำรายการนี้`. "ไม่พบหน้านี้" stays for 404 / no access to a page only. On any failure the screen keeps what the person typed.
- **Q-F4 (SA): the real-back run.** I need the dev database and `god-plan-qa.env` to finish the "with the back running on dev" lines. Until then this TASK is complete on the front side and unproven against the real back. Do you want it at `REVIEW` now with those lines `UNVERIFIED`, or held? I have set `REVIEW` and said so.

## Review
**Front side accepted; the TASK is held for one run against the real back — Sober (SA), 2026-11-08.** Status: BLOCKED (waiting: TASK-011).
- Re-checked: `git status` = the scaffold + these screens, `/comp` is gone, and `src/lib/api.ts` uses SPEC-002's casing (`stuckReason`,
  `commentCount`, `taskCounts`, `isOwner`, `displayName`). Your 24/24 browser run, the screenshots and the build evidence are accepted.
  The AC-2a / AC-17 / AC-6 / front-side AC-4 behaviour is shown. Your decisions are accepted.
- **Q-F4, answered:** don't wait for the dev database. The real back already runs on PGlite (TASK-006 did it). I've cut **TASK-011** (BE): a
  harness that runs the **real** back in memory on :4310 with synthetic seed data. When it lands, re-run `task-007.mjs` against it
  instead of `front-contract-stub` and paste the result here. That run turns this TASK DONE. Keep `front-contract-stub` only as
  scratch; the real back is the reference.
- **Q-F3 (failure string, and `error.tsx` showing "ไม่พบหน้านี้" for a server error)** → routed to the PM as copy. A good catch.
  Until it's answered, keep the current behaviour.
- `/impeccable`, keyboard and real phone stay `UNVERIFIED`, as you wrote. They will be asked for again at the release gate (QA).
- **Meanwhile, start TASK-008 on the same basis** (the front-side proof now, the real-back run with TASK-011).
- **Q-F3 answered (the PM, 2026-11-08). Add this to TASK-007 before the real-back run:** put the three strings in `strings.th.ts`, from
  REQ-001's table. A failed save (network, 500, timeout) shows `บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง`. A 403 on an action shows
  `คุณไม่มีสิทธิ์ทำรายการนี้`. `error.tsx` shows `โหลดหน้านี้ไม่สำเร็จ ลองรีเฟรชอีกครั้ง`, and "ไม่พบหน้านี้" stays for 404 / no access only.
  **On any failure the form keeps what the person typed.** Add one browser check for each to `task-007.mjs` (a stopped back gives the
  network case). TASK-008/009 use the same rule.

**Round 2: DONE — Sober (SA), 2026-11-08.** Q-F3 is applied (the three strings, typed text kept, `error.tsx` = `loadFailed`). The **32/32
run against the real back** is accepted. The 403/500/load cases are faked by request interception, which proves the front's mapping, as you
said. The network case (back stopped by its own PID) is real. Using a scratch copy on :4311 because :4310 was taken is fine. The build and
greps were re-checked at TASK-008's review on the same tree. `UNVERIFIED` items are carried to the release gate.
