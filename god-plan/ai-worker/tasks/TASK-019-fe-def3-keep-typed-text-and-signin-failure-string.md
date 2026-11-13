# TASK-019: Front — typed text is never lost when a save finishes (DEF-3), and the sign-in failure string (DEF-2's front half)
- Source: REQ-001 §Defects to fix DEF-3 (MINOR, product rule PM-decided 2026-11-09: *what a person typed is never lost silently*) and DEF-2 ("the sign-in screen
  shows `เข้าสู่ระบบไม่สำเร็จ ลองใหม่อีกครั้ง`, not the save message"; the string is in REQ-001 §User-facing wording, row "Sign-in failed for any other reason")
  · TEST-001 §Defects DEF-3 (`harness/repro-fast-add.mjs`, real back)
- Owner: FE (Fern)
- Status: DONE (2026-11-09, SA review). Earlier: REVIEW (2026-11-09, Fern; was IN_PROGRESS, TODO before — DEF-3 reproduced then fixed on the real back; signInFailed in; walks 31/31, 31/31, 37/37 after one freeze-hit rerun)
- Depends on: none (runs in parallel with TASK-018)
- Git: none by you.

## What to do
1. **DEF-3, Step 0:** run QA's `repro-fast-add.mjs` against the **real** back (`god_plan`, latency about 1 s; the BE's `.env`; owner from `god-plan-qa.env`). Paste
   the box values it records (the third line must show `""`).
2. **The rule, applied to every form that clears after a save.** Found by the SA (`grep` for setters to `""`, read 2026-11-09):
   `ProjectBoard/AddTask.tsx`, `ProjectBoard/TaskCard.tsx` (rename / stuck reason), `Thread/Thread.tsx` (comment), `Projects/NewProject.tsx`,
   `Members/InviteForm.tsx`. Check `Invite/AcceptForm.tsx`, `Reset/ResetContent.tsx` and `SignIn/SignInContent.tsx` too, and say if they clear anything.
   When a save finishes, clear the box **only if it still holds exactly the text that was sent**. If the person has typed since, leave the box
   as it is. While a save runs, the submit is disabled (as today). Pressing Enter or the button must not drop text either; refusing quietly
   while the text stays is fine. One small shared helper (e.g. `hooks/common/useSubmitText.ts`) rather than five copies (SPEC-003).
3. **DEF-2 front half:** in `SignIn/SignInContent.tsx`, `INVALID_CREDENTIALS` and `VALIDATION` keep "อีเมลหรือรหัสผ่านไม่ถูกต้อง". **Any other failure**
   (500, 502, 504, network, timeout) shows the new `strings.th.ts` entry **`signInFailed` = "เข้าสู่ระบบไม่สำเร็จ ลองใหม่อีกครั้ง"** (from REQ-001's table,
   word for word), never `saveFailed`. The typed email stays (the password may clear).
4. **The same recipe after the fix:** `repro-fast-add.mjs` against the real back → no typed text lost, and every title typed is either saved (visible after
   a reload) or still in the box. Paste. A browser check: sign-in with the back stopped → `signInFailed` shown, email kept. Paste.
5. Regression: `task-007.mjs`, `task-008.mjs`, `task-009.mjs` against `back-pglite` + `gateway-stub`, all pass. Paste the summary lines.

## Definition of Done
- [ ] Step 0 and step 4 outputs (same recipe, before and after). Step 3's browser check. Step 5's three walks.
- [ ] `bunx tsc --noEmit` clean · `bun run build` passes · `grep -n signInFailed src/strings.th.ts` shows the exact REQ string. Paste.
- [ ] `git status --short` + the files changed. Servers stopped by PID.

## Implementation Notes
**Fern, 2026-11-09.** Repo `god-plan-front`, branch `atom`, HEAD `a41cbd0` before and after (no git by me). Work was interrupted by the login outage and resumed; nothing from the first part was lost.

**Step 0 — QA's `repro-fast-add.mjs` against the REAL back** (`god-plan-back` on :4310 with its own `.env`, its database `god_plan`; owner from `god-plan-qa.env`, read into the environment without printing; front `next dev` with `BACK_ORIGIN` set; `QA_TAG=-fern-before`). Old code:
```
after pressing for "ด่วน 1" +300 ms: {"box":"ด่วน 1","inputDisabled":false,"buttonDisabled":true}
after pressing for "ด่วน 2" +300 ms: {"box":"ด่วน 2","inputDisabled":false,"buttonDisabled":true}
after pressing for "ด่วน 3" +300 ms: {"box":"","inputDisabled":false,"buttonDisabled":true}
after reload, saved: ["ด่วน 1"]
```
The third line shows `""`: the typed "ด่วน 3" was wiped, as DEF-3 says.

**The rule, applied.** New helper `src/hooks/common/useSubmitText.ts`: it holds a box's text, updates a ref the moment the person types (not on the next render), and `clearIfSent(sent)` clears the box **only if it still holds exactly the text that was sent** (compared trimmed). The only `set…("")` left in `src` is inside this helper (`grep -rnE 'set[A-Za-z]*\(""\)' src` → `useSubmitText.ts:28` only). Used by:
- `ProjectBoard/AddTask.tsx` — clears the title only if unchanged; submit refused while a save runs (`if (busy) return`), text stays.
- `Thread/Thread.tsx` — same for the comment box (also refuses a second send while one runs).
- `Projects/NewProject.tsx` — two boxes (name, description), each cleared only if unchanged; refuses while saving.
- `Members/InviteForm.tsx` — the invitee's name, same.
- `ProjectBoard/TaskCard.tsx` (rename and stuck reason) — these forms did not clear a box; they closed (and so discarded the box) when the save finished. They now close **only if the box still holds exactly what was sent**; if the person typed since, the form stays open with their text. Save is disabled while a save runs.
- **Checked, and they clear nothing:** `Invite/AcceptForm.tsx`, `Reset/ResetContent.tsx`, `SignIn/SignInContent.tsx` — no setter to `""`; on a failure every box keeps its text (the password too, which the TASK allows to clear but I left alone). I only added the `busy` refusal to sign-in.

**DEF-2 front half.** `strings.th.ts` has `signInFailed: "เข้าสู่ระบบไม่สำเร็จ ลองใหม่อีกครั้ง"`, the exact text of REQ-001's table row ("Sign-in failed for any other reason…", `grep -n signInFailed src/strings.th.ts` → line 22). New `signInMessageFor()` in `lib/api/errors.ts` (exported from the barrel): `INVALID_CREDENTIALS` and `VALIDATION` → `อีเมลหรือรหัสผ่านไม่ถูกต้อง`; **every other failure** (500, 502, 504, network, timeout) → `signInFailed`, never `saveFailed`. `SignInContent` uses it; the typed email stays.

**Step 4 — the same recipe, fixed code (`QA_TAG=-fern-after`, real back):**
```
after pressing for "ด่วน 1" +300 ms: {"box":"ด่วน 1","inputDisabled":false,"buttonDisabled":true}
after pressing for "ด่วน 2" +300 ms: {"box":"ด่วน 2","inputDisabled":false,"buttonDisabled":true}
after pressing for "ด่วน 3" +300 ms: {"box":"ด่วน 3","inputDisabled":false,"buttonDisabled":true}
after reload, saved: ["ด่วน 1","ด่วน 3"]
```
The third line is no longer `""`. **Read the last line carefully:** "ด่วน 2" is not saved and not in the box at the end. Its button press came while title 1 was still saving, so it was refused (text stayed, as the rule allows); then the script's next step selects the whole box and types "ด่วน 3" over it, so the person's own typing replaced it. The app did not lose it. If QA's check is "every title typed is saved or still in the box", this script overwrites its own title 2 and will flag it whatever the app does; a script that waits for each save (or types into an empty box) would not.

**Step 3 browser check — sign-in with the back stopped** (`tests/harness/task-019-signin-down.mjs`, back killed by pid first): 5 of 5 PASS — the sign-in failure string is shown · it is not the save message · it is not the wrong-password message · the typed email stays in its box · still on `/sign-in`.

**Step 5 — regression, each walk against a fresh `back-pglite` + `gateway-stub`, front under `next dev`:** `task-007.mjs` → **31/31 passed** · `task-008.mjs` → **31/31 passed** · `task-009.mjs` → **first run `36/37`**, with `FAIL AC-8: gateway mode hang → the AI error within 30 s — 132472 ms`, then **37/37 passed** on a fresh-back re-run. The 132 s is the machine freezing, not the front: the timer-stall detector (`tests/harness/timer-stall-detector.mjs`) was running beside that first chain and logged freezes of 126.5 s, 99.1 s, 99.3 s, 111.4 s, 71.8 s and 230.4 s in the window (2026-11-09 13:31–13:47 UTC), and the 009 run fell in it. The clean re-run is the pass; the AI-hang bound itself is TASK-013/014's and unchanged here (this TASK does not touch `api.ts`/`client.ts` timing).

**DoD**
- `bunx tsc --noEmit` → `TSC_OK` (also after the build). `bun run build` passes (`[postbuild] copied .next/static into .next/standalone`). `grep -n signInFailed src/strings.th.ts` → `22:  signInFailed: "เข้าสู่ระบบไม่สำเร็จ ลองใหม่อีกครั้ง",`.
- Other greps still clean: no `process.env` outside `src/config`, no Thai in `.tsx`, no `dangerouslySetInnerHTML`.
- **Files changed** (checksum diff against the end of TASK-017; `git status --short` is unchanged because the repo is all untracked): `src/strings.th.ts` (+1 string; **its md5 is therefore new, `8e6e3ead…`**, as this TASK adds the string), `src/hooks/common/useSubmitText.ts` (new), `src/hooks/common/index.ts`, `src/lib/api/errors.ts`, `src/lib/api/index.ts`, `src/components/partials/{ProjectBoard/AddTask,ProjectBoard/TaskCard,Thread/Thread,Projects/NewProject,Members/InviteForm,SignIn/SignInContent}.tsx`. Nothing else.
- Branch `atom`, HEAD `a41cbd0`. All my servers (the real back, the front, the gateway stand-in, the stall detector) are stopped by pid; nothing listens on 4300, 4310 or 4399; `gateway-stub/mode.txt` is `ok`.

**Footprint on the real dev database (`god_plan`) — test data I created and left.** The two `repro-fast-add.mjs` runs each create one synthetic project named `QA fast-add-fern-before-<n>` / `QA fast-add-fern-after-<n>` (`<n>` = clock digits) with the tasks the script adds (before: 1 saved; after: 2 saved). Synthetic titles only, no personal data. I left them: there is no delete-project feature in release 1, and removing rows from `god_plan` directly is not mine to do (no SQL). The `-fern-` tag makes them easy for the owner or QA to recognise.

**UNVERIFIED:** `/impeccable`, real phone, keyboard pass (as before). Whether QA's own fast-add script, run with a corrected "wait for each save" step, shows every title saved: I did not change that script.

## Questions
- None.

## Review
**DONE — Sober (SA), 2026-11-09.**
- Re-ran myself: `bunx tsc --noEmit` → `TSC_OK` · the only `set…("")` left in `src` is `useSubmitText.ts:28` (the one guarded clear) · `strings.th.ts:22`
  `signInFailed` matches REQ-001's row word for word · `signInMessageFor`: `INVALID_CREDENTIALS` / `VALIDATION` → wrong-sign-in, everything else → `signInFailed`.
- **DEF-3, same recipe on the real back:** before, the third line is `""` (wiped). After, it's `"ด่วน 3"`, and after a reload ["ด่วน 1","ด่วน 3"]. Accepted. Your reading
  of "ด่วน 2" is right: the press was refused while title 1 saved, the text stayed (the rule allows refusing), and then **QA's script selected the box and typed
  over it**. The app didn't lose it. → **for QA, via the PM:** `repro-fast-add.mjs` step 2 overwrites its own title. Judge "never lost silently" on what the
  person did, or adjust the script.
- TaskCard rename / stuck-reason (they used to close and discard) now close only if unchanged. That's a sound extension of the same rule. Sign-in with the back stopped:
  5/5 is accepted.
- Walks 31/31 · 31/31 · 37/37 are accepted. The one 009 `36/37` (AC-8 at 132 s) had the detector running and logging freezes of 71–230 s in that window, then a clean re-run.
  That's machine freezes, and this TASK doesn't touch timing code.
- Synthetic `-fern-` projects on `god_plan`: accepted, tagged, harmless.
