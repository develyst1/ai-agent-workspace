# REQ-001: v1 — two read-only screens fed by the gate
- Status: IN_SPEC
- Priority: HIGH
- Requested: 2026-10-05 by the owner
- Deadline: none (the owner's own measure: does it change his week within two weeks of use — `SYSTEM-FACTS.md`)
- Depends on: **`check-hygiene.mjs --json`** — Marie's tooling; exists since gate v6 (2026-10-05 — see C-1 and SPEC-001 §2)

## Problem / Goal

The owner runs 13+ project desks. Today he finds out which one is red, and who is
waiting on whom, by opening sessions one by one — and nobody runs the gate, so a
project can go from FAIL 12 to FAIL 19 unseen. He wants one place that shows every
project's gate result and who holds the ball, refreshed on its own.

Owner's words (2026-10-05, verbatim):
> ทำ v1 ตาม CONSOLE-PLAN.md — แค่ 2 จอ:
> 1. หน้ารวม: การ์ดต่อโปรเจกต์ บอก PASS/FAIL + 3 บรรทัดที่แย่ที่สุด + วันที่ขยับล่าสุด
> 2. หน้าโปรเจกต์: รายละเอียด gate + ตารางสุขภาพไฟล์ + ใครถือลูกบอลอยู่
>
> อ่านข้อมูลจาก check-hygiene.mjs --json เท่านั้น ห้ามเขียน parser เอง
> refresh ทุก 60 วิ · v1 อ่านอย่างเดียว ห้ามเขียนอะไรใน workspace

## Requirement

1. **Overview screen.** The system must show one card per project desk in the
   workspace. Each card shows: the project name; the gate result (PASS / FAIL);
   the worst three lines the gate reported; the date the project last moved.
2. **Project screen.** Opening a card must show that project's page with:
   (a) the full gate detail — every line the gate reported for it;
   (b) a file-health table — one row per coordination file the gate reports on
       (board, knowledge file, each inbox, `RESUME-HERE.md` with its staleness);
   (c) who holds the ball on that project.
3. **Single data source.** Every value on both screens must come from the output
   of `check-hygiene.mjs --json`. The console must not open, read or interpret any
   coordination file itself. If the gate does not supply a value, the screen does
   not show it — it does not compute it.
4. **The console decides nothing the gate decides.** Which lines are "worst", what
   "last moved" means, how staleness is counted, and who holds the ball are the
   gate's answers. The console shows them in the order and wording the gate gives.
5. **Auto-refresh every 60 seconds**, without the owner touching anything.
6. **Read-only.** Running the console must not create, modify or delete any file
   in the workspace. Running the gate as a child process is allowed (it only reads).
7. **The workspace location comes from configuration at run time**, never from a
   path written into the code (`SYSTEM-FACTS.md` § What the console reads).

## Acceptance Criteria

- [ ] AC-1 — **Given** the workspace has N project desks **When** the owner opens
  the overview **Then** he sees N cards, each with name, PASS/FAIL, up to three
  worst lines and a last-moved date — and each value matches what
  `node check-hygiene.mjs <project> --json` prints for that project at that moment.
- [ ] AC-2 — **Given** a project whose gate result is PASS with no warnings **When**
  the overview loads **Then** its card shows PASS and no "worst lines" (not blank
  placeholders, not lines invented by the console).
- [ ] AC-3 — **Given** a project whose gate reports fewer than three problem lines
  **When** the overview loads **Then** the card shows exactly the lines the gate
  gave, no padding.
- [ ] AC-4 — **Given** the owner clicks a card **When** the project page opens
  **Then** it shows every gate line for that project, the file-health table, and
  who holds the ball — each matching the gate's `--json` output for that project.
- [ ] AC-5 — **Given** the console is open on either screen **When** a project's
  state changes on disk (e.g. its gate goes PASS → FAIL) **Then** the screen
  reflects it within ~60 seconds with no click or reload by the owner.
- [ ] AC-6 — negative: **Given** the gate errors, times out, or returns output that
  is not valid JSON for one project **When** the console refreshes **Then** that
  project's card shows a visible error state with the gate's own error text, the
  other projects' cards are unaffected, and the console does not fall back to
  reading the project's files itself.
- [ ] AC-7 — negative: **Given** the configured workspace path is missing, does
  not exist, or exists but has no `check-hygiene.mjs` in it **When** the console starts **Then** it shows a clear message saying
  so, and shows no project data.
- [ ] AC-8 — read-only proof: **Given** a snapshot of the workspace (every file's
  path, size and modified time) **When** the console runs through at least two
  refresh cycles on both screens **Then** a second snapshot is identical to the
  first. (Evidence must name the real projects it ran against.)
- [ ] AC-9 — single source proof: the console's code contains no reader of
  coordination files (board, inbox, log, RESUME-HERE, FAILURES, SYSTEM-FACTS) —
  shown by a search the owner can re-run, stated in the evidence.
- [ ] AC-10 — regression: `node check-hygiene.mjs <project>` (without `--json`)
  still prints exactly what it printed before, for every project. *(Marie's change,
  listed here so the owner checks it; the team does not touch the gate.)*

## User-facing wording (Porter as UX writer) — `[owner-approved 2026-10-05]` (Q-1: English)

The owner is the only user. Labels in English (owner, 2026-10-05), matching the gate's own
words (PASS / FAIL and the gate lines are shown verbatim, never translated).

| Where | Text |
|---|---|
| Overview page title | `Workspace` |
| Card — last-moved | `Last moved: <YYYY-MM-DD>` — the gate's `newestLogDate` *(owner-approved 2026-10-05, Q-6)* |
| Card — last-moved, gate gives no date (no log) | `Last moved: —` *(owner-approved 2026-10-05, Q-6: "ถ้าไม่มี log ให้ขึ้น '—'")* |
| Card — no problem lines (PASS) | *(nothing — the PASS badge says it)* |
| Card — gate error (AC-6) | `Gate error — <gate's own message>` |
| Card — gate timed out (AC-6) | `Gate error — no answer after 15 s` — *owner-approved 2026-10-05 (Q-4)* |
| Card — gate output not JSON (AC-6) | `Gate error — output was not JSON` — *owner-approved 2026-10-05 (Q-4)* |
| Project page sections | `Gate` · `File health` · `Ball` |
| Workspace path missing / no gate there (AC-7) | `Workspace path not found — check HARNESS_WORKSPACE_PATH in .env.local` — *owner-approved 2026-10-05 (Q-3 "ข"; exact text confirmed "AC-7 ได้")* |
| Refresh hint | `Updated <HH:MM:SS> · refreshes every 60 s` |

Anything the gate supplies (lines, file names, role names) is shown as the gate
wrote it. Fern invents no other visible text; a string not in this table comes
back to Porter via Sober.

## Constraints

- **C-1 — `--json` does not exist yet, and it is not the team's to write.**
  Checked 2026-10-05: `node check-hygiene.mjs harness-console --json` prints the
  human `RESULT:` line and exits 0 — the flag is silently ignored. Adding it is
  Marie's (`SYSTEM-FACTS.md`). The team must **not** add it, **not** scrape the
  printed text, and **not** invent the JSON's shape and build against the guess.
  The owner asks Marie; until her output exists, screens can be laid out but no
  data contract may be assumed.
  **Update 2026-10-05:** `--json` now exists (gate v6, Marie); the contract is SPEC-001 §2. The
  "not the team's to write / no scraping / no guessed shape" rule stands.
- **C-2 — what the screens need from the gate, in business terms** (for the owner
  to hand to Marie; *she* decides the shape): per project — overall result; every
  check line with its severity, ranked worst-first; a last-moved date; per
  coordination file — name, size, its limit/verdict, staleness in days where it
  applies; who holds the ball. Plus a way to list every project the gate can check.
- C-3 — local only; nothing deployed (`SYSTEM-FACTS.md`).
- C-4 — Next.js 16 + React 19 + antd v6, one app, no backend service (`SYSTEM-FACTS.md`).

## Out of Scope

The owner listed exactly what the two screens hold. Items in `CONSOLE-PLAN.md` v1
that he did **not** name are out of this REQ until he adds them `[owner-approved 2026-10-05 — "สมมติฐาน A ถูก"]`:
- the **mode** (manual / dispatcher) on the card;
- the **`FAILURES.md` entries with status `NEW`** on the project page;
- **click anything → open that file**;
- the "button that calls Marie".

And, per `SYSTEM-FACTS.md`: all of v2 and v3 (chain graph, stale-rule detection,
autonomy dial, editing rules), any write to the workspace, any second store.

## Questions

*(Sober asks here; Porter answers as `> answer: ...`)*

- Q-1 (Porter → owner, open): approve the English wording table above, or the UI
  should be in Thai? — not blocking SPEC work.
  > answer (owner, 2026-10-05): *"อังกฤษ"* — English; the table above is approved.
- Q-2 (Porter → owner): may Marie add `--json` per §C-2?
  > answer (owner, 2026-10-05): *"ได้"* — yes. Already ordered in `MARIE.md` ORDER 16 ①; not built as of 2026-10-05 00:26. C-1 stands until it exists.
- Q-3 (Sober → Porter, 2026-10-05, non-blocking — wording): SPEC-001 §1.1 puts the workspace path in one setting, `HARNESS_WORKSPACE_PATH` in `harness-console-front/.env.local`, copied by the owner from `machine.local.md` (the console cannot read `machine.local.md` — it sits inside the very folder whose path is unknown). Keep the approved AC-7 string `Workspace path not found — check machine.local.md` as is, or should it name the setting?
  > answer (owner, 2026-10-05): *"ข"* — name the setting. AC-7 text is now `Workspace path not found — check HARNESS_WORKSPACE_PATH in .env.local` (wording table). Sober's assumption A — a path that exists but has no `check-hygiene.mjs` shows the same AC-7 message — *"สมมติฐาน A ถูก"*: confirmed, AC-7 updated to say so.
- Q-4 (Sober → Porter, 2026-10-05, blocks TASK-002 only): AC-6 says `Gate error — <gate's own message>`, but on a **timeout** (15 s) or **output that is not JSON** the gate gives no message. What text goes after `Gate error — ` in those two cases?
  > answer (owner, 2026-10-05 00:40): *"Q-4 ได้"* — approved as proposed: timeout → `Gate error — no answer after 15 s`; not JSON → `Gate error — output was not JSON`. Both are now in the wording table; TASK-002 is no longer blocked on wording.
- Q-5 (Sober → Porter → owner → Marie, 2026-10-05): three points C-2 does not name, which the console cannot decide without guessing — please add to what the owner hands Marie: (a) how a gate *error* is told apart from a *FAIL* under `--json` (today both are non-zero exits: 1 = FAIL, 2 = error); (b) how the console gets the project list — a list call, or one call for all projects; (c) a version field in the JSON. Detail: SPEC-001 §2.
  > status (Porter, 2026-10-05 00:37): the owner hands (a)(b)(c) to Marie together with ORDER 16 ① when he opens her. Marie has not run; `--json` still absent (grep → 0).
  > note (Sober, 2026-10-05 00:55): Marie answered (a)(b)(c) **in the tool** (gate v6) — folded into SPEC-001 §1.2 and §2. Nothing left to ask Marie for REQ-001.
- Q-6 (Sober → Porter, 2026-10-05, blocks TASK-002): **what is "last moved"?** The gate has no field by that name. The nearest is `newestLogDate` — the date of the project's newest dated log file (`dte` → `2026-09-13`; `null` when a desk has no log). Is that what the owner means by "the date the project last moved"? If yes: what does the card show when it is `null`? If no: it is a field to ask Marie for — the console must not compute it (REQ §4).
- Q-7 (Sober → Porter, 2026-10-05, blocks TASK-003): **the file-health "verdict" does not exist per file.** The gate gives each file's `bytes` and its limits (`limitBytes`, sometimes `warnBytes`, sometimes `exempt`), but the PASS/WARN/FAIL judgement exists only as a line in `checks`. The console comparing size to limit would be the console deciding what the gate decides (REQ §4). Options: **ก** the table shows name · size · limit only (the verdicts are already in the `Gate` section), or **ข** the owner asks Marie for a per-file verdict field and TASK-003 waits for it.
- Q-8 (Sober → Porter, 2026-10-05, wording — blocks TASK-002/003): strings not in the wording table: (a) column headers of `File health` and of `Ball`; (b) what an empty value shows (`ball: null` — 33 of 147 rows on smart-scheduler; `limitBytes: null`; a file marked `exempt`); (c) how `fail` / `warn` severity is labelled on the `Gate` lines; (d) card text for a gate error of kind `schema` (JSON of a version the console was not built for) and `spawn` (node could not start the gate); (e) the page text when the project LIST itself fails. Also **assumption B** — confirm or correct: "who holds the ball" = a table of every board row the gate returns (`id` · `title` · `status` · `ball`), verbatim, in board order. Detail: SPEC-001 §1.4, §2.3.
  > answer (owner, 2026-10-05, Q-6): *"ใช่ ถ้าไม่มี log ให้ขึ้น '—'"* — "last moved" **is** `newestLogDate`; when it is `null` the card shows `Last moved: —` (wording table). *(Q-6, Q-7, B were answered as "ตามนั้น" to one line — verbatim in `SYSTEM-FACTS.md`.)*
  > answer (owner, 2026-10-05, Q-7): *"ก"* — the `File health` table shows **name · size · limit only**; no per-file verdict, nothing asked of Marie. The verdicts are the gate's lines in the `Gate` section.
  > answer (owner, 2026-10-05, assumption B): *"สมมติฐาน B ถูก"* — `Ball` = every board row the gate returns (`id` · `title` · `status` · `ball`), verbatim, board order.
  > answer (owner, 2026-10-05, Q-8): *"Q-8 ให้ Porter เสนอ"* — proposal below, **`[team-proposed]`, NOT approved yet**; asked the owner for one-shot approval. TASK-002/003 wait for it.

  **Q-8 proposal `[team-proposed 2026-10-05]` — awaiting the owner.** Principle: where the gate already has a word, reuse it (its printed output says `FAIL` / `WARN` and sizes like `91.6KB`); every empty value is `—`, the mark the owner chose for Q-6.

  | # | Where | Proposed text |
  |---|---|---|
  | (a) | `File health` column headers (Q-7 ก) | `File` · `Size` · `Limit` · `Days behind` *(last column filled only on the `RESUME-HERE.md` row, from `resumeBehindDays`)* |
  | (a) | `File health` size / limit values | the gate's own style: `91.6KB`, `40.0KB` |
  | (a) | `Ball` column headers (assumption B) | `Id` · `Title` · `Status` · `Ball` |
  | (b) | any empty value — `ball: null`, `limitBytes: null`, `resumeBehindDays: null` | `—` |
  | (b) | a file the gate marks `exempt` (`Limit` cell) | `exempt — <gate's exempt text>`, e.g. `exempt — size (append-only)` |
  | (b) | a file the gate reports with `exists: false` (`Size` cell) | `not found` |
  | (c) | severity label on each `Gate` line | `FAIL` / `WARN` (as the gate prints them), then the line text verbatim |
  | (d) | card, gate error kind `schema` | `Gate error — gate version not supported` |
  | (d) | card, gate error kind `spawn` | `Gate error — could not start the gate` |
  | (e) | page text when the project list itself fails | `Could not list projects — <reason>`; `<reason>` = the same text a card shows after `Gate error — ` (gate message · `no answer after 15 s` · `output was not JSON` · `gate version not supported` · `could not start the gate`) |
  | (f) | `Gate` section when the gate gave no lines (clean PASS) — *not asked; closes a gap* | `No lines from the gate.` |
  | (f) | `Ball` section when the gate returned no board rows — *not asked; closes a gap* | `No board rows.` |
