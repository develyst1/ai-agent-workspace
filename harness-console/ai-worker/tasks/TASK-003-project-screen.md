# TASK-003: Project screen — Gate · File health · Ball
- Source: SPEC-001 (§1.3, §1.4, §1.5 "Project page", §2.3) — REQ-001 AC-4, AC-5
- Owner: FE (Fern) — the only engineer on this desk
- Status: DONE (reviewed 2026-10-05 21:30, Sober — §Review)
- Depends on: TASK-001 (runner + `/p/[project]` shell). Independent of TASK-002.
- Repo: `harness-console-front`, branch `main`. No git writes — the owner commits.

## What to do

On `/p/[project]` (built in TASK-001, which already 404s unknown names), render exactly
SPEC-001 §1.5 "Project page":

1. Heading: `project` + `result` badge verbatim.
2. **`Gate`** — every `checks[]` line in gate order, `FAIL`/`WARN` + `text` verbatim;
   empty → `No lines from the gate.`
3. **`File health`** — antd table, columns `File` · `Size` · `Limit` · `Days behind`, one row
   per `files[]` in gate order, cell rules exactly as §1.5 (`not found`, `exempt — <exempt>`,
   `—`, `fmt()` copied from the gate, `Days behind` only on the `RESUME-HERE.md` row).
   **No verdict column, no colouring by size, no `bytes > limit` anywhere** (Q-7 ก).
   The `"RESUME-HERE.md"` literal is **one named constant in one file**, used only for the
   equality test (SPEC-001 §Non-functional — the one allowed search hit).
4. **`Ball`** — antd table, columns `Id` · `Title` · `Status` · `Ball`, one row per
   `boardRows[]` in gate order, verbatim plain text; `null` → `—`; `ballColumn` not shown;
   empty → `No board rows.` No pagination that hides rows by default (smart-scheduler has
   147) — show all, or say in the notes what you chose and why.
5. Failures: `runGate` `ok: false` → `Gate error — <reason>` instead of the three sections;
   `listProjects()` `ok: false` → `Could not list projects — <reason>` (SPEC-001 §1.4).
6. The refresh component from TASK-001 is on this page too (AC-5).
7. **Added by Sober 2026-10-05 21:18 (TASK-002 review, D-8):** the refresh component renders
   in **every** state of **both** pages: the AC-7 message, `Could not list projects — <reason>`,
   `Gate error — <reason>`, and success. That includes `/`, whose AC-7 and list-failure states
   show only the text today. REQ-001 item 5 says refresh runs with no touch, so a failure
   screen must recover by itself. This adds no new string: the hint is the approved
   `Updated <HH:MM:SS> · refreshes every 60 s` (SPEC-001 §1.3/§1.4).

Every visible string is gate-supplied (verbatim) or from SPEC-001 §1.4/§1.5. Anything
else is a question to Sober. 🔴 Reads nothing but the runner's output; writes nothing.

## Definition of Done

- [ ] `npm run build` succeeds — output pasted.
- [ ] AC-4 on **two named real desks** — `harness-console` (clean PASS, 0 checks) and
      `smart-scheduler` (FAIL, `exempt` rows, `ball: null` rows): paste the CLI `--json`
      `checks` count, `files[]`, `resumeBehindDays`, `boardRows` count + null-ball count,
      beside what the page shows (page text or screenshot); every row present, in order.
- [ ] `fmt()` spot-check: three `files[]` rows — `bytes` from JSON vs the `Size` cell, and
      the same file's size in the gate's printed (non-JSON) output where it appears.
- [ ] Empty texts: `No lines from the gate.` shown on `harness-console`; `No board rows.`
      shown on a desk with none (real if one exists — name it — else the fixture).
- [ ] `not found` in `Size`: a real row with `exists: false` (name it) or the fixture.
- [ ] AC-5: fixture workspace in the OS temp folder (TASK-002's script may be reused) — a
      change on disk shows on the open project page within ~60 s, no click (timestamps).
- [ ] Gate error on this page: fixture → `Gate error — <reason>`, real output.
- [ ] Step 7: on the fixture, `/` and `/p/<desk>` in the list-failure state show the refresh
      hint. Remove the fixture's `list-fail` marker (it is in the OS temp folder) → the page
      recovers within ~60 s with no click (timestamps). The AC-7 state shows the hint (page text).
- [ ] The two searches in SPEC-001 §Non-functional → no hits except the one
      `RESUME-HERE.md` constant (commands + output).

## Implementation Notes

(Fern fills this in: what changed, how it was verified, real output. Anything not
actually run is written `UNVERIFIED — <what would settle it>`. Any rule you had to
decide yourself — write it here with why.)

**Fern, 2026-10-05 21:28.** Nothing committed (the owner commits). No server or process left running: ports 3100/3101/3102 are closed and the temp fixture is removed.

### What changed (`harness-console-front`, untracked)

- `src/app/p/[project]/page.tsx`: AC-7 → list → 404 check → `runGate(project)`. On failure it shows heading `project` + `Gate error — <reason>`. On success it shows heading `project` + `result` tag, then `Gate` (GateLine ×N, or `No lines from the gate.`), `File health`, and `Ball` (or `No board rows.`). The refresh hint is in all 4 states.
- `src/app/page.tsx`: step 7. The AC-7 and list-failure states now also render the refresh hint.
- `src/components/FileHealthTable.tsx` (client): cell rules from §1.5. Holds the one `RESUME_FILE_NAME` constant.
- `src/components/BallTable.tsx` (client): `id` · `title` · `status` · `ball`, verbatim, `null` → `—`.
- `src/lib/text.ts`: section names, column headers, `No lines from the gate.`, `No board rows.`, `not found`, `exempt — <x>`, `EMPTY` (`—`), and `fmt`, which is copied from the gate (gate line 132 `fmt`, `KB = 1024` line 62).
- `src/lib/gate.ts`: `boardRows[].title` / `status` typed `string | null` (see D-11).
- Tables are client components because antd column `render` functions cannot cross the server→client boundary.

### Evidence (real output)

1. `npx tsc --noEmit` → exit 0. `npm run build` → exit 0, `▲ Next.js 16.3.8`, `✓ Compiled successfully`, routes `ƒ /` · `○ /_not-found` · `ƒ /p/[project]`. Routes on `next start -p 3100` (real workspace): `/` · `/p/harness-console` · `/p/smart-scheduler` · `/p/pun-kub-fang` · `/p/did-api-center-c%23` → 200; `/p/does-not-exist` → 404.
2. **AC-4, page vs CLI, cell by cell.** `tests/harness/task-003-compare.mjs` runs `check-hygiene.mjs <p> --json`, fetches `/p/<p>`, and compares every table row in order (21:23):
   - **harness-console**: CLI `PASS`, checks 0, files 9, `resumeBehindDays` 0, boardRows 5, null ball 0 → page heading `harness-console PASS`, `No lines from the gate.` shown, 9 file rows match, 5 ball rows match. `RESUME-HERE.md` row: `Days behind` `0`.
   - **smart-scheduler**: CLI `FAIL`, checks 23, files 14, `resumeBehindDays` 3, boardRows 148, null ball 34 → heading `smart-scheduler FAIL`, all 23 gate lines present in order with `FAIL`/`WARN`, 14 file rows match, 148 ball rows match. 42 `Ball` cells show `—`: 34 are `null`, and 8 are the gate's own literal `"—"`. The two `exempt` rows show `exempt — size (append-only knowledge)` and `exempt — size (append-only)`.
   - Headers on the page: `File · Size · Limit · Days behind · Id · Title · Status · Ball`.
   - ⚠️ The first compare of smart-scheduler **failed** at row 116 (`TASK-627`): the gate returns `title: null, status: null` on 32 rows. That run rendered them as empty cells. Fixed per §1.5 "Empty value anywhere = `—`" (D-11), and the re-run matched all 148 rows.
3. **`fmt()` spot-check** (smart-scheduler): `board.md` bytes 95209 → cell `93.0KB`, and the gate prints `board.md 93.0KB > 40.0KB`. `inbox/BE.md` 84515 → `82.5KB`, gate prints `inbox/BE.md 82.5KB > 2.0KB`. `RESUME-HERE.md` 8076 → `7.9KB`, limit 20480 → `20.0KB`. `log/2026-10-05.md` (`limitBytes: null`) → `Limit` `—`.
4. **Empty texts, on real desks:** `No lines from the gate.` appears on harness-console and pun-kub-fang. `No board rows.` appears on **pun-kub-fang** (CLI boardRows 0), so no fixture was needed.
5. **`not found`, on a real desk:** pun-kub-fang `log/2026-10-05.md` has `exists: false` → `Size` `not found` (the compare matched). pun-kub-fang has no `RESUME-HERE.md` row, so every `Days behind` cell is empty.
6. **Fixture** (`tests/harness/task-002-fixture.mjs` → `%TEMP%\hc-task002-kEivUJ`, removed afterwards; `next start -p 3101` with `HARNESS_WORKSPACE_PATH` in the process env). Browser pane, two tabs (`/p/alpha`, `/`), no clicks:
   - **Gate error:** `/p/beta` → `beta` / `Updated 21:23:38 · refreshes every 60 s` / `Gate error — output was not JSON`, with no sections.
   - **AC-5:** `/p/alpha` at `Updated 21:23:45` showed `alpha PASS` / `No lines from the gate.`. At 21:23:53 the alpha gate was flipped to FAIL. At `Updated 21:24:45` the page showed `alpha FAIL` / `FAIL fixture: alpha went FAIL`.
   - **Step 7:** the `list-fail` marker was written at 21:24:59. At `Updated 21:25:45` `/p/alpha` showed `Could not list projects — fixture list failure` + the hint, and at `Updated 21:25:50` `/` showed the same. The marker was removed at 21:26:05. At `Updated 21:26:45` `/p/alpha` was back to `alpha FAIL …`, and at `Updated 21:26:50` `/` was back to `Workspace` + 3 cards. No click at any point.
   - **AC-7 state:** `next start -p 3102` with a temp path that does not exist → `/` and `/p/alpha` both show `Workspace path not found — check HARNESS_WORKSPACE_PATH in .env.local` + `Updated 21:27:23 · refreshes every 60 s` (HTTP 200).
7. **§Non-functional searches** (repo root): search 1 → no output, exit 1. Search 2 → exactly one line, `src/components/FileHealthTable.tsx:11:const RESUME_FILE_NAME = "RESUME-HERE.md";`. Absolute path: `git ls-files -co --exclude-standard | xargs grep -nF 'H:\'` → exit 123 (no match). The new harness script → exit 1 (no match).

### Decisions I made (not in the SPEC) — Sober to confirm or overrule

- **D-11 `title` / `status` can be `null`.** SPEC-001 §2.3 types them as `string`, but the gate returns `null` on 32 smart-scheduler rows (e.g. `TASK-627`…`TASK-654`, `REQ-003 subjects (known limit)`). I render them as `—` under §1.5 "Empty value anywhere = `—`" and Q-8 (b) "any empty value". No new string was added. → Q-F3.
- **D-12 Empty `files[]`** → the table shows `—` in place of antd's built-in `No data`, because that would be invented copy. No real desk has an empty `files[]`; only the fixture does. → Q-F3.
- **D-13 Gate-error page heading** = the project name only, with no badge, since there is no `result`. The name comes from `--list`.
- **D-14 No pagination** on either table (`pagination={false}`). All 148 smart-scheduler rows render, as step 4 allows.
- **D-15 Colour**: the heading badge uses the same map as the card (D-9). The tables have no colour.

### UNVERIFIED

- The owner's eyes on layout. The page text was read, but no visual review was done. Settled by him opening `/p/smart-scheduler` locally.
- The `gate` / `timeout` / `schema` / `spawn` error kinds on this page. Only `not-json` was rendered here. All kinds go through the same `reasonOf`, which TASK-001 proved for all five.

## Questions

- (Sober, 2026-10-05) REQ-001 Q-9 (b) — **answered yes** (owner, 2026-10-05 08:03): a failed
  gate run on this page shows `Gate error — <reason>` in place of the three sections, exactly
  as SPEC-001 §1.4 says. Nothing changes.
- Q-F3 (Fern → Sober, 2026-10-05, non-blocking — built as D-11/D-12): (a) SPEC-001 §2.3 types
  `boardRows[].title`/`status` as `string`, but the gate returns `null` on 32 smart-scheduler rows;
  I show `—` (§1.5 "empty value anywhere"). Correct, and should §2.3 be updated? (b) An empty
  `files[]` has no approved text; I show `—` instead of antd's `No data`. OK, or does Porter
  need to word it?
  > answer (Sober, 2026-10-05 21:30): (a) **Correct — and yes, §2.3 is updated** to
  > `title: string|null, status: string|null`. The nulls are the gate's documented behaviour on
  > header-less board rows (`check-hygiene.mjs`, the `hdr` comment above `rows.push`), so the
  > console shows them as `—` and never re-reads the board to "fix" them (single source).
  > (b) **OK.** `—` is the owner-approved text for any empty value (Q-8 (b), SPEC-001 §1.5),
  > antd's `No data` would be invented copy, and no real desk has an empty `files[]`. Nothing
  > goes to Porter.

## Review

**Sober, 2026-10-05 21:30 — DONE.**

- **Evidence is complete:** every DoD line has a command and real output in §Implementation
  Notes (build, AC-4 on two named real desks + pun-kub-fang, `fmt()` against the gate's printed
  lines, both empty texts and `not found` on a real desk, AC-5 / gate error / step 7 / AC-7 on
  the temp fixture with timestamps, both searches). The first compare failing at row 116 and
  being fixed is recorded honestly — that is the harness doing its job.
- **Code read against SPEC-001 §1.3–§1.5:** `/p/[project]` = AC-7 → list → 404 → `runGate`;
  `Gate error — <reason>` replaces the three sections; hint in all 4 states of both pages
  (step 7); File health cells exactly §1.5 (no verdict, no colour, no `bytes > limit`);
  Ball = `id`·`title`·`status`·`ball`, `ballColumn` not shown, `null` → `—`, no pagination.
  Every visible string is in `src/lib/text.ts` and traces to the REQ-001 wording table / Q-8.
- **Re-run by me, not the author (21:29):** `tsc --noEmit` exit 0 · `npm run build` exit 0 ·
  search 1 → no output (exit 1) · search 2 → exactly
  `src/components/FileHealthTable.tsx:11:const RESUME_FILE_NAME = "RESUME-HERE.md";` ·
  absolute-path check → exit 123 (no match) · `next start -p 3110` + `task-003-compare.mjs`:
  smart-scheduler FAIL 23 lines in order, files 14/14 match, ball 148/148 match (42 `—`);
  harness-console PASS, `No lines from the gate.`, 9/9, 5/5; pun-kub-fang `No board rows.`,
  9/9; `/p/does-not-exist` → 404. Server stopped, port 3110 closed.
- **Decisions D-11..D-15 confirmed.** D-11/D-12 per Q-F3 above. D-13 (gate-error heading =
  name only, no badge — there is no `result`), D-14 (`pagination={false}`), D-15 (badge colour
  = card map, tables uncoloured) are technical and within SPEC-001.
- **Still UNVERIFIED — for the owner's eyes:** layout of `/p/smart-scheduler` (148 rows);
  the `gate` / `timeout` / `schema` / `spawn` kinds rendered on this page (only `not-json`
  was rendered; all share `reasonOf`, proven for all five in TASK-001).
