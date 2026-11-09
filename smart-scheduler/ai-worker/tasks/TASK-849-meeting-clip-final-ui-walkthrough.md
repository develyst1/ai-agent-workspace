# TASK-849 — the meeting-clip FINAL-UI WALKTHROUGH recorder (REQ-5001, scene 2) — @Fern (≈ 0.5 d)
**From @Sober, 2026-11-03. GO now.** SPEC: `specs/SPEC-096-meeting-clip-presenter-video.md`: §1 step 4, the **"Scene-2 walkthrough cues"** table, and **§2, the contract**. REQ: `requirements/REQ-5001-meeting-clip-presenter-video-for-11-07.md`.
**Target:** done **Wed 11-04 midday**, so Jason's Wed render can include it.
**Folder:** `som-balance-backoffice-spec/meeting-clip/`. Not git. **You may only READ** `final-ui/dist/index.html` (md5 `1d0ce1f6…`, Tanya-passed). Don't rebuild or edit `final-ui/`.
**Rule 2 (workspace CLAUDE.md, re-read it):** you never ask the owner anything. A question goes in `## Questions` below, to me.

## Closed file list
`meeting-clip/scripts/capture-ui.mjs` (new) · `meeting-clip/scripts/capture-ui.test.mjs` (new, a self-check). **Everything else in `meeting-clip/` is Jason's (TASK-848).** If you need a dependency, it goes in his `package.json`. Write the exact line in `## Questions`, and I relay it.

## Build
`export async function recordWalkthrough({ cues, durationSec, outFile })`. The types are exactly SPEC §2.
- **Playwright Chromium,** a fresh context (empty storage ⇒ the final UI opens **DARK**; assert `data-mantine-color-scheme="dark"` before recording), viewport + `recordVideo` 1920×1080, `file://…/final-ui/dist/index.html`.
- **Start on Home as CEO.** Apply each cue at `atSec`, measured from the recording's first frame:
  - `goto` → set `location.hash`;
  - `openDetail` → click the first row's "Payment Detail";
  - `role` → click the header's role control (find it by its accessible name: CEO / Admin / Coach).
- **A visible cursor:** inject a small round pointer that glides to each target before a click (≈ 400 ms ease) and pulses on click, so a viewer sees what is clicked. Playwright videos show no cursor otherwise.
- **Waits:** after each cue, wait for the page title / heading of the target page before the next cue's timing. **If a target isn't found, throw** naming the cue. Never record a blank or loading screen (REQ §2.5).
- **Length:** keep recording until `durationSec`. The WebM must be `durationSec` ± 0.2 s (SPEC §2). Close the context to flush, then move the file to `outFile`.
- **Content:** the final UI's own mock data only (invented names). Nothing typed, nothing saved.

## Done = (evidence in `## Implementation Notes`)
1. `node scripts/capture-ui.test.mjs`:
   - runs `recordWalkthrough` with a hand-made 12-cue list (SPEC §1 order, every 6 s, `durationSec` 78);
   - prints the WebM's duration (`ffprobe` from Jason's `ffmpeg-static`, or Playwright's own if his isn't in yet);
   - prints each cue's measured apply time vs `atSec` (all within 0.3 s).
2. **Frames,** one per cue, from the WebM, in `meeting-clip/out/ui-frames/`, checked by you:
   - dark;
   - the right page each time;
   - Admin's Employee has **no salary column**;
   - Coach lands on their own Payment Detail;
   - the cursor is visible.
3. `grep -E "Kid|Poo|Kung|Bank|London|Nelson|พี่ฟีน"` over the frames' page text (dump `document.body.innerText` at each cue to `out/ui-frames/text.txt`) = 0.
4. `final-ui/dist/index.html` md5 before = after.

## Questions
_(none yet)_

## Implementation Notes
**Fern, 2026-11-03.** Two files, both in `meeting-clip/scripts/`: `capture-ui.mjs` (`recordWalkthrough` + `findFfmpeg`, `UI_FILE` exported) and `capture-ui.test.mjs`. Nothing else touched; no new dependency (Jason's `playwright` 1.64.1 + `ffmpeg-static` were already in his package.json).
- **How it works.** Fresh Playwright Chromium context, viewport + `recordVideo` 1920×1080, `file://…/final-ui/dist/index.html`; asserts `data-mantine-color-scheme="dark"` then starts on Home as CEO.
  - `goto`: the cursor glides (~400 ms, eased) to the **sidebar menu item** and clicks it (same navigation the user does); a hidden page / Home has no menu item, so it sets `location.hash`.
  - `openDetail`: glide + click on the first row's "Payment Detail".
  - `role`: glide + click on the header's CEO / Admin / Coach control. **The shell does not move the route on a role switch**, so the click also sets the landing route in the same render: Coach → `#/salary/my-slip` (their own Payment Detail); leaving Coach → Home. That way no "cannot see" frame is ever recorded.
  - Cursor: a round white ring injected in the page (follows real mouse events, pulses on mousedown). Playwright videos show none.
  - After every cue it waits for `main h2` + body text + fonts, and **throws naming the cue** if the page doesn't settle, a target is missing, the "cannot see" screen shows, the UI logs a console error/warning, or Admin's Employee shows "Base salary".
- **Length / loading head (a real find).** The recorder starts before the page loads, and its first frame is not at page creation (my first run came out 77.60 s). So the script shows a magenta marker in the head that is discarded, finds the frame where it ends in the WebM, ties wall clock to video time, then cuts `[lead, lead + durationSec]` and re-encodes (VP9 CRF 26, 25 fps, no audio) with `ffmpeg-static`. No loading frame survives; the WebM is exactly `durationSec`. Playwright's own bundled ffmpeg can't decode WebM, hence ffmpeg-static (or `FFMPEG_PATH`).
- **Return value:** `{ outFile, durationSec, leadSec, applied[] }` (an extra over SPEC §2's "a WebM": `applied` has each cue's measured time + the page text, used by the self-check).
- **Evidence** (`node scripts/capture-ui.test.mjs`, run 3×; two full passes after the marker fix):
  1. 12-cue list in SPEC §1 order, every 6 s, `durationSec` 78 → **WebM 78.00 s**, 1920×1080. Apply time vs `atSec`: Δ +0.03 … +0.11 s (max 0.11, limit 0.3).
  2. One frame per cue in `out/ui-frames/` (13 files incl. `text.txt`), 1.5 s after each cue. I looked at cue00 (Monthly Payment, cursor on the menu item), cue09 (Admin: Employee has **no salary column**), cue10 (Coach lands on **own Payment Detail**, "Ton"), cue11 (CEO, Home): all dark, right page, cursor visible. The self-check asserts dark at every cue.
  3. Real-name check over the page text of every cue (`out/ui-frames/text.txt`): **0** of Kid / Poo / Kung / Bank / London / Nelson / พี่ฟีน (the check uses `includes`, not a regex).
  4. `final-ui/dist/index.html` md5 before = after = `1d0ce1f63ae826984172ade3d724f41a`. Not rebuilt, not edited.
- **For Jason:** `recordWalkthrough` throws if the last cue is within 1 s of `durationSec`. The WebM is a **VP9** WebM (compose with ffmpeg-static handles it). A recording takes ≈ `durationSec` + 15 s (78 s → 92–96 s). A `goto` to `#/fo/confirm-camp` works the same way (menu item "To Confirm Camp"); I did not put it in the self-check's 12 cues. `out/ui-test.webm` (2.7 MB) is the self-check's output; delete it if unwanted.
- **Not verified:** the ear/eye timing against the real `timeline.json` (not in yet), and the real cue list's "go Home" after "back to CEO" — if it is a separate `goto` `#/` cue it works (Home has no menu item, so it sets the hash); if it is only the role cue, the role handler already lands on Home when leaving Coach.

## Rework notes (Fern, 2026-11-03, after Sober's review)
Both races fixed in `capture-ui.mjs`; nothing else changed (`capture-ui.test.mjs` only gets an optional `UI_TEST_TAG` env so two copies can run at once without sharing output files).
- **(a)** Each cue settles on the TARGET page's own heading **and** hash, then must stay settled for 150 ms: a `goto` waits for the menu item's own title (I checked all 30 menu titles equal the page's `h2`), `openDetail` for `#/salary/slip` + "Payment Detail", a role switch for the landing page (Coach → "Payment Detail" on `#/salary/my-slip`; leaving Coach → "Home"; Admin → the same page). A previous page's heading can no longer pass (run 2's "Home").
- **(b)** Every `count()` is gone. Targets use `locator.waitFor({ state: "visible", timeout: 5000 })`, then throw the named error ("… not found (waited 5000 ms)"); the Payment Detail button is awaited the same way (run 1's late rows). The box is re-read (one round trip) after the glide so a layout shift can't make the click miss. The pointer now arrives 450 ms BEFORE the click and rests on the target, so a slow machine's round trips are absorbed and the click still lands on the cue's time.
- **Two things the real `timeline.json` needed** (it is in `out/` now; its first cue is at **0 s** and two cues share 82.985 s): a cue at ≈ 0 s has no time to glide, so it is applied BEFORE the video window opens (in the part that is cut off), and the video's first frame already shows Monthly Payment with the cursor on its target (reported as applied at its own `atSec`). A `goto #/` when the page is already Home (the preceding role cue landed there) is a no-op, stamped with the moment that state became true.
- **(c)** Unchanged by design and now stated in the code: every cue is timed from `t0`, never from the previous cue, so a slow wait never shifts the rest.
- **Runs with the final code: 5 consecutive passes, 4 of them with a second copy running at the same time** (all: WebM **78.00 s**, 1920×1080, all checks passed, dist md5 `1d0ce1f6…` unchanged). The cue lines are Δ = applied − `atSec`, in s:
  - run 1, idle: max +0.02 (all 12: +0.01 +0.02 +0.01 0.00 0.00 +0.01 0.00 0.00 +0.02 +0.01 +0.01 +0.01)
  - run 2 + 3, pair A (two copies at once): max +0.01 / +0.02
  - run 4 + 5, pair B (two copies at once): max +0.01 / +0.02
  - **Honest note — an earlier pair failed once:** with the first version of the fix (150 ms of slack), one copy of a pair showed Δ +0.54 (cue 1) and +0.39 (cue 4) and the self-check FAILED "within 0.3 s". The cause was the click-time work after the glide (CDP round trips) under load, not a wait; the 450 ms rest-on-target slack fixed it (the pairs above are re-runs with the final code). So **the self-check can fail on a very loaded machine; if Jason renders while another heavy job runs, raise `SLACK_MS`**.
  - **Real timeline** (`UI_TEST_REAL=1 node scripts/capture-ui.test.mjs`: the 14 cues + `walkthrough.durationSec` from `out/timeline.json`, now 97.12 s): passed with the final code, WebM 97.12 s, every cue within 0.3 s (I did not print its Δ lines). An earlier run on the then-current 88.08 s version of the timeline, before the last slack change, had every Δ ≤ +0.02 s.

## Review
**Sober, 2026-11-03: REWORK (one fix, timing races). The design and evidence are good; the fix is small.**
- **What I ran:** `node scripts/capture-ui.test.mjs`, twice, on this machine. **Both failed at cue #1 (`openDetail @12s`):**
  - run 1: `{"hash":"#/salary/payrun","h2":"Monthly Payment (Up to date)"}`, no "Payment Detail" button;
  - run 2: `{"hash":"#/salary/payrun","h2":"Home"}`.
  - `final-ui/dist` md5 before = after = `1d0ce1f6…` ✓.
- **Cause (from the code + the two snapshots):**
  1. `capture-ui.mjs:168–169` tests the button with `await btn.count()`. That is an instant check that doesn't wait, so it fails when the table's rows render a moment after the heading (run 1).
  2. The settle after a `goto` accepts **any** `main h2`, so the previous page's heading ("Home") passes it while the new route is still rendering (run 2).
  - Your 3 passes and my 2 fails differ only in machine load: Jason may be rendering at the same time. The recorder has to hold under load, because it runs inside `npm run render`.
- **Fix:**
  - (a) Each cue settles on the **target page's own heading**: the menu title of the route (Monthly Payment, Revenue Summary, STOCK OUT, Branch for booking, …), or "Payment Detail" for `openDetail`. Not just any `h2`.
  - (b) Replace every `count()` existence test with `locator.waitFor({ state: "visible", timeout: 5000 })` (or `expect`-style polling), then throw your named error on timeout.
  - (c) Keep the timing honest: when a wait eats time, the **next** cue still fires at its own `atSec`. Never shift the rest.
- **Done =**
  - **5 consecutive passes** of the self-check, with 2 of them run while a CPU load runs alongside (e.g. a second copy of the self-check at the same time). Paste each run's Δ line;
  - md5 unchanged.
- Everything else is accepted:
  - the marker-trim for the loading head (a good find);
  - the role handler landing Coach on My slip;
  - the extra `applied[]` in the return value (a superset of SPEC §2, fine);
  - the VP9 WebM.

**Sober, 2026-11-03 (re-review): DONE.** I ran the self-check **twice at the same time** (the load that broke it before): **both exit 0, "all checks passed"**, each WebM 78.00 s at 1920×1080. That covers the Admin no-salary-column check, Coach landing on own Payment Detail, and dark at every cue. `final-ui/dist/index.html` md5 before = after = `1d0ce1f6…`. The rework (settle on the target's own heading + hash, `waitFor` in place of `count()`) holds under load. The recorder may go into Jason's full render.
