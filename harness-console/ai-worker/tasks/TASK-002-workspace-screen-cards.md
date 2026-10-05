# TASK-002: Workspace screen — cards, error card, list failure
- Source: SPEC-001 (§1.3, §1.4, §1.5 "Card", §2.3) — REQ-001 AC-1, AC-2, AC-3, AC-5, AC-6
- Owner: FE (Fern) — the only engineer on this desk
- Status: DONE (Sober review, 2026-10-05 21:18)
- Depends on: TASK-001 (runner + `/` shell + refresh component)
- Repo: `harness-console-front`, branch `main`. No git writes — the owner commits.

## What to do

0. **First, before the cards** (Sober, 2026-10-05 — TASK-001 Q-F1 answer): pin `next` to exactly
   `16.3.8` in `package.json` (nothing else hand-edited; let npm move postcss/sharp), `npm install`,
   then `npm run build` and `npm audit --omit=dev`. If 16.3.8 breaks the build or React 19.2.7 /
   antd 6.4.3, stop and ask Sober — do not bump anything else to make it fit.

On `/` (built in TASK-001), render one antd card per project, in `--list` order:

1. **Success card** — exactly SPEC-001 §1.5 "Card": `project` · `result` badge verbatim ·
   `checks.slice(0, 3)` each as `FAIL`/`WARN` + `text` verbatim · `Last moved: <newestLogDate>`
   or `Last moved: —`. No padding when fewer than 3 lines; nothing at all when `checks` is
   `[]` (AC-2, AC-3). The whole card links to `/p/${encodeURIComponent(project)}`.
2. **Error card** — `runGate` returned `ok: false`: project name + `Gate error — <reason>`
   (SPEC-001 §1.4 table). The other cards are unaffected (AC-6).
3. **List failure** — `listProjects()` returned `ok: false`: the page shows only
   `Could not list projects — <reason>`, no cards.
4. AC-7 and the refresh hint stay exactly as TASK-001 built them.

Every visible string is either gate-supplied (verbatim, plain text — no markdown rendering)
or from SPEC-001 §1.4/§1.5. Anything else is a question to Sober. Severity colour on the
badge/labels is allowed only as a direct map of the gate's own `result`/`severity` — never
from a comparison the console makes.

🔴 Reads nothing but the runner's output; writes nothing in the workspace.

## Definition of Done

- [ ] Step 0: `npm ls next` → `16.3.8`; `npm audit --omit=dev` output pasted (no `next` advisory left);
      TASK-001's route checks re-run on 16.3.8 (`/` 200, `/p/did-api-center-c%23` 200, `/p/does-not-exist` 404).
- [ ] `npm run build` succeeds — output pasted.
- [ ] AC-1: against the real workspace, the card count equals the length of
      `node check-hygiene.mjs --list --json` → `projects` (paste both). For **three named
      desks** — one clean PASS, one PASS-or-FAIL with < 3 lines if any exists (else say so),
      one FAIL with ≥ 3 lines (e.g. `smart-scheduler`) — paste the CLI `--json` fields
      `result`, first 3 `checks`, `newestLogDate` beside what the card shows (screenshot or
      page text), and say which real desk each came from.
- [ ] AC-2 / AC-3: the clean-PASS card shows no lines and no placeholder; the < 3-line card
      shows exactly the gate's lines.
- [ ] `Last moved: —`: shown for a desk whose `newestLogDate` is `null` — a real one if the
      list has it (name it), else the fixture below.
- [ ] AC-5: in a **fixture workspace in the OS temp folder** (SPEC-001 §Non-functional —
      script in `harness-console/ai-worker/tests/harness/`), change the fixture desk so its
      gate goes PASS → FAIL; the open page shows it within ~60 s with no click (timestamps).
- [ ] AC-6: in the fixture, one desk's gate fails (`gate`, `timeout` or `not-json` — at least
      one, real output) → that card shows `Gate error — <reason>`, the others render normally.
- [ ] List failure: fixture whose `--list` fails → `Could not list projects — <reason>`.
- [ ] The two searches in SPEC-001 §Non-functional → no hits other than the one allowed
      constant (commands + output).

## Implementation Notes

(Fern fills this in: what changed, how it was verified, real output. Anything not
actually run is written `UNVERIFIED — <what would settle it>`. Any rule you had to
decide yourself — write it here with why.)

**Fern, 2026-10-05 21:20.** Nothing committed (owner commits). No server/process left running (ports 3100/3101 closed, no `next` node process).

### What changed (`harness-console-front`, untracked)

- `package.json`: `next` `16.2.9` → `16.3.8` (the only hand edit; lockfile moved by `npm install`).
- `src/app/page.tsx` — `/` now: AC-7 check → `listProjects()` (fail → only `Could not list projects — <reason>`) → `runGates()` (≤4) → one card per project in `--list` order (antd `Row`/`Col`).
- `src/components/ProjectCard.tsx` — success card: title `project`, badge `result`, `checks.slice(0, 3)` as gate lines, `Last moved: …`; whole card is a `Link` to `/p/${encodeURIComponent(project)}`. Error card: title `project` + `Gate error — <reason>` (via `reasonOf`).
- `src/components/GateLine.tsx` — `FAIL`/`WARN` (= `severity.toUpperCase()`) tag + `text` verbatim (React text, no markdown). Meant for reuse by TASK-003's `Gate` section.
- `src/components/Text.tsx` — client re-export of `Typography.Text` (same cause as TASK-001 D-6: first `/` render was a 500 "Element type is invalid … got: undefined").
- `src/lib/text.ts` — added `gateError(reason)` and `lastMoved(date)` (strings from the REQ-001 wording table).

### Evidence (real output)

1. **Step 0** — `npm ls next antd @ant-design/nextjs-registry --depth=0` → `next@16.3.8`, `antd@6.4.3`, `@ant-design/nextjs-registry@1.3.0`; `npm ls react` → single `react@19.2.7` (deduped). `npm audit --omit=dev` → `found 0 vulnerabilities` (exit 0). Build on 16.3.8 before any card code: `▲ Next.js 16.3.8 (Turbopack)`, routes `ƒ /` · `○ /_not-found` · `ƒ /p/[project]`. Route checks (`next start -H 127.0.0.1 -p 3100`, curl) before and after the card code: `/` 200 · `/p/did-api-center-c%23` 200 · `/p/does-not-exist` 404.
2. **`npm run build`** with the cards → `✓ Compiled successfully`, same 3 routes.
3. **AC-1** (real workspace, `/` page text via the Browser pane at `Updated 21:14:05`): `node check-hygiene.mjs --list --json` → 14 projects `["DID-046-SpringBoot-Service-Report","api-linkage2","code-report","develyst-ai","did-api-center-c#","dte","harness-console","layout-pattern-app","manager-gold","portfolio-nichaphon","possibility","pun-kub-fang","safe-goods","smart-scheduler"]`; the page shows 14 cards, same names, same order.
   - **harness-console** (clean PASS) — CLI `{"result":"PASS","checks":[],"newestLogDate":"2026-10-05"}` · card `harness-console / PASS / Last moved: 2026-10-05` (no lines, no placeholder). Same for **pun-kub-fang** (CLI `PASS`, `[]`, `2026-09-19` · card `PASS / Last moved: 2026-09-19`).
   - **smart-scheduler** (FAIL, 23 checks) — CLI first 3: `fail "board.md 93.0KB > 40.0KB"` · `fail "board.md has 41 table cell(s) > 300 chars in 39 row(s) (TASK-608, … +27 more) — evidence belongs in the TASK/REQ file; the cell keeps a pointer"` · `fail "board.md carries 32 closed rows > 30 at 93.0KB (sweep DONE/DELIVERED rows to archive/board-closed.md)"`, `newestLogDate "2026-10-05"` · card: `FAIL` badge + the same three lines each prefixed `FAIL`, `Last moved: 2026-10-05`.
   - **< 3 lines: no real desk has one today** — real counts are 0 (harness-console, pun-kub-fang) or ≥ 3 (all others: 3,4,4,4,9,8,8,5,4,9,3,23). Shown on the fixture instead (item 4, `gamma`).
4. **Fixture** (`tests/harness/task-002-fixture.mjs` → fake gate in `%TEMP%\hc-task002-*`, removed after; `HARNESS_WORKSPACE_PATH` set in the process env of a second `next start -p 3101`). Page text 21:14:41: `alpha PASS / Last moved: 2026-10-05` · `beta / Gate error — output was not JSON` · `gamma PASS / WARN fixture: gamma warn one / WARN fixture: gamma warn two / Last moved: —`.
   - **AC-2/AC-3:** alpha (PASS, `[]`) no lines; gamma exactly its 2 lines, no padding.
   - **`Last moved: —`:** gamma (`newestLogDate: null`). No real desk has `null` today (all 14 have a date).
   - **AC-6:** beta's gate prints `RESULT: PASS` (CLI output) → `Gate error — output was not JSON`; alpha and gamma render normally.
   - **AC-5:** alpha flipped to FAIL at `21:14:44` (no click after); page text at `Updated 21:15:41`: `alpha FAIL / FAIL fixture: alpha went FAIL`.
   - **List failure:** fixture `--list --json` → `{"ok":false,"error":{"code":"FIXTURE","message":"fixture list failure"}}`, exit 2 → `/` 200 with `Could not list projects — fixture list failure`, no `Workspace` title, no cards.
5. **SPEC §Non-functional searches** (repo root): search 1 → no output, exit 1; search 2 → no output, exit 1 (the `RESUME-HERE.md` constant arrives with TASK-003).
6. **Absolute path:** `git ls-files -co --exclude-standard | xargs grep -nF 'H:\'` → exit 123 (no match); harness file → exit 1 (no match).

### Decisions I made (not in the SPEC) — Sober to confirm or overrule

- **D-7 Error card is NOT a link** — the TASK says "the whole card links" only for the success card. A one-line change if the failed card should also open `/p/<project>` (which shows `Gate error — <reason>`, Q-9 b) — see Q-F2.
- **D-8 List-failure page shows only the text** — no `Workspace` title and no refresh hint (TASK: "the page shows only …"), same as the TASK-001 project page. Consequence: that page does not auto-refresh; it recovers on a manual reload.
- **D-9 Colour:** badge `success` for `PASS` / `error` for `FAIL`; line tag `error` for `fail` / `warning` for `warn`; error-card text `danger`. Each is a direct map of the gate's own field.
- **D-10 Layout:** cards in an antd grid, 1 / 2 / 3 per row (`xs=24 md=12 xl=8`). No approved string added.

### UNVERIFIED

- The owner's eyes on the card layout and colours (screenshot taken in a dark-themed pane only) — settled by him opening `/` locally.
- AC-6 kinds `gate` / `timeout` on a card: shown only for `not-json` here; the runner returns all five kinds (TASK-001 evidence item 5) and the card uses the same `reasonOf`, but those two were not rendered on a card.

## Questions

- (Sober, 2026-10-05) REQ-001 Q-9 (a) — **answered yes** (owner, 2026-10-05 08:03): card
  lines carry the `FAIL`/`WARN` label, exactly as SPEC-001 §1.5 says. Nothing changes.
- Q-F2 (Fern → Sober, 2026-10-05, non-blocking — built as "no"): should an **error card**
  (`Gate error — <reason>`) also link to `/p/<project>`? The TASK names the link only for the
  success card, so D-7 leaves it unlinked. "Yes" is a one-line change.
  > answer (Sober, 2026-10-05 21:18): **No — keep D-7.** SPEC-001 §1.3 means the success
  > card. An error card's project page would show only the same `Gate error — <reason>`
  > (Q-9 b), so the link adds no information. Nothing to change.

## Review

**Sober, 2026-10-05 21:18 — verdict: DONE.** Built to SPEC-001 §1.3–§1.5. Every DoD item has
real output in §Implementation Notes, and each one names a real desk or the temp fixture.

- **Code read against the SPEC:** `page.tsx` runs AC-7 → `listProjects` → `runGates` (≤4,
  `--list` order kept by index), which matches §1.2/§Flow. `ProjectCard` = `project` · `result`
  badge · `checks.slice(0, 3)` · `lastMoved()`. The error card goes through the single
  `reasonOf` (§1.4). The strings in `lib/text.ts` match the REQ-001 wording table. Gate text is
  rendered as React text, with no markdown.
- **What I re-ran myself:** search 1 → exit 1 and search 2 → exit 1 (no hits). Absolute-path
  check → exit 123 (no match). `npm ls` → `next@16.3.8`, `react@19.2.7`, `antd@6.4.3`.
  `npx tsc --noEmit` → exit 0. `npm run build` → exit 0, routes `ƒ /` · `○ /_not-found` ·
  `ƒ /p/[project]`. `node check-hygiene.mjs --list --json` → 14 projects, in the same order as
  the evidence. I started no server.
- **Fixture script** (`tests/harness/task-002-fixture.mjs`) writes only under `os.tmpdir()` and
  never touches the workspace. OK.
- **D-7** confirmed (Q-F2 answered no). **D-9** (colour is a direct map of `result`/`severity`)
  and **D-10** (grid) confirmed: neither adds a comparison or a new string.
- **D-8 is accepted as built, because it follows the TASK text. The SPEC wording was wrong.**
  The phrase "the page shows only …" in SPEC-001 §1.4 left a failure page that never refreshes.
  That breaks REQ-001 item 5 (auto-refresh with no touch). SPEC-001 §1.3/§1.4 are now fixed:
  the refresh component is on **every** render state of both pages (AC-7, list failure, gate
  error, success). The `/` change is carried as TASK-003 step 7. It is not REWORK here, because
  Fern built what the TASK said.
- **Still UNVERIFIED, to go to the owner via Porter at SPEC_DONE:**
  - The owner's eyes on layout and colour. The only screenshot was taken in a dark-themed pane.
  - The `gate`/`timeout` error kinds on a card. Accepted, because the card uses the same
    `reasonOf` that TASK-001 proved for all five kinds.
