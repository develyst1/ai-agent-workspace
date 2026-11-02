# TASK-021: Admin web — the LINE-count month picker shows the Thai month and Buddhist year
- Source: SPEC-001 §3.3 (`/admin/stats/line-pushes`) · REQ-001 § Questions (PM, 2026-11-01: "picker also Thai month + Buddhist
  year, only if cheap") · found at TASK-009 review (P3)
- Owner: FE (Fern)
- Status: DONE (SA Sober, 2026-11-01)
- Depends on: TASK-009 (DONE)

- Repo: `corner-chat-front` — Team A claim · git writes: **none**
- Files you may edit (closed list): the LINE-count panel component under `src/components/users/**` (the one TASK-009 added),
  and `src/lib/**` only for a small date-format helper if you need one.

## What to do
The month picker beside the LINE-count title shows `2026-11`, while the title shows `พฤศจิกายน 2569`. Make the picker's
**shown value** use the same form as the title: the Thai month name and the Buddhist year (e.g. `พฤศจิกายน 2569`), via antd's
`format` prop or a dayjs Buddhist-era format. **The value sent to the API stays `YYYY-MM` Gregorian**
(`month=2026-11`): only the display changes.
The PM said "only if cheap". **Time-box: 45 minutes.** If showing the panel's own month grid in Thai/Buddhist needs a locale
change wider than this component (app-wide `ConfigProvider` locale, dayjs global plugins), do **only** the input's shown value
and write in Notes what the grid would need. Do not change the app-wide locale in this TASK.

## Definition of Done
- [ ] Screenshot at 1280 px: title and picker both read `พฤศจิกายน 2569` (or the current month the same way).
- [ ] Pick October in the picker → the network call is `month=2026-10` (paste it from the browser or the mock log) and the card
      updates.
- [ ] `bun run lint`, `bun run typecheck`, `bun run build` clean · `git status --porcelain` → only closed-list paths changed.

## Implementation Notes
*(Fern, FE Team A, 2026-11-01 — about 20 minutes, inside the 45-minute time-box)*

**Repo state:** `corner-chat-front`, `main`, HEAD `0f8c0bc`, before and after; one file changed: `src/components/users/LinePushPanel.tsx`. No `src/lib` helper was needed
(the panel already had `thaiMonth()` from TASK-009). No git writes.

**What changed:** the `DatePicker` got `format={(value) => thaiMonth(value.format("YYYY-MM"))}` (the same helper as the title), `inputReadOnly` and `style={{ width: 200 }}`.
The picker's *value* is untouched, so `onChange` still sends `value.format("YYYY-MM")` (Gregorian) to the API. `inputReadOnly` because a shown Thai month cannot be typed
back in and parsed — the month is picked from the grid (the input used to accept typed `2026-10`; that is gone). The width stops the longer text clipping.

**What the open grid does NOT show (did only the input, as the TASK says):** it lists Thai month names (ม.ค. … ธ.ค., from the app's existing antd `th_TH` locale) but its header
reads **"2026"** (Gregorian) — the panel's year header and the year panel are antd's own and take their year from the locale/dayjs, not from `format`. To show **2569** there
it would take an **app-wide** change (a Buddhist-era `locale` object for antd's date components, or `dayjs.locale("th")` + the `buddhistEra` plugin registered globally, plus a
`ConfigProvider` change) — wider than this component, so not done here, per the TASK. Result today: input and title say พฤศจิกายน 2569, the open grid says 2026 above Thai month names.

**Evidence (real output):** `bun run lint` → `$ eslint src` clean · `bun run typecheck` → `$ tsc --noEmit` clean · `bun run build` → `✓ Compiled successfully`, `[postbuild] copied .next/static into .next/standalone`,
`ls .next/standalone/server.js` exists · `git status --porcelain` → only closed-list paths (the whole repo is still untracked).
`tests/harness/task-021/shoot.mjs` (headless Chrome, 1280 px, my standalone front on :3000 → the running dev back end on :8080; read-only: sign-in + `GET /admin/stats/line-pushes`) → **ALL PASS**:
- title `พฤศจิกายน 2569` and picker `พฤศจิกายน 2569` read the same · pick October → the picker shows `ตุลาคม 2569`, the title changes, and the requests were
  `["(no query)","?month=2026-10"]` → **`month=2026-10`** went to the API, Gregorian `YYYY-MM`.
Screenshots (`tests/harness/task-021/`): `01-picker-thai.png` (title + picker, current month) · `02-picker-october.png` (October picked) · `03-picker-grid-open.png` (the open grid with the "2026" header; caught mid-fade).
**Against the real back end** — Jason's dev server on :8080, which I did not start or stop; the count it returned for October was `0`, so "the card updates" is shown by the title/picker/request changing, not by a non-zero number
(TASK-009's live run already proved the number against the endpoint).

**Footprint:** two sign-in sessions on the dev server (the script signs in as the owner; no user, message or setting was created or changed). My front on :3000 is stopped.

## Questions
- To SA (non-blocking): is "input in the Buddhist year, grid header still 2026" acceptable for round 1, or should I do the app-wide locale change as its own TASK?
  > answer (SA Sober, 2026-11-01): Acceptable for round 1. The PM asked for it "only if cheap", and the app-wide locale change is not.
  > There is no follow-up TASK unless the owner asks for one.

## Review
**Verdict: DONE** — SA Sober, 2026-11-01. One file changed, inside the time-box. Re-run by me: `bun run lint` / `bun run typecheck`
are clean; `LinePushPanel.tsx:57–58` has the `format` via the existing `thaiMonth()` plus `inputReadOnly`, and the value is untouched.
Your harness shows the API still gets `month=2026-10` (Gregorian), and the title and picker read the same. `inputReadOnly` is the
right call, since a Thai display string cannot be typed back. You used Jason's :8080 read-only, without starting or stopping it —
good.
