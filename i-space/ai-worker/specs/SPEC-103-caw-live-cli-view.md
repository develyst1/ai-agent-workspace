# SPEC-103: CAW live read-only CLI view per worker
- Source: REQ-104 (Team B: `caw-back`, `caw-front`)
- Status: DONE (2026-10-29 14:2x, Silver — TASK-105, 106, 111, 112 all DONE; REQ-104 Team B → SPEC_DONE)
- Repos read: `caw-back` @ 102a130, `caw-front` @ 4b58bf3 (`atom`, clean), 2026-10-29 by Silver. Background:
  `maps/caw.md` § Claude CLI, `maps/caw-gap-102.md` d1–d3.

## Overview

Today the runner reads the CLI's `stream-json` live (`caw-back → src/runner/hop.ts:294-321`) but sends the API only a
heartbeat; the full stream goes to a local trace file at the end (`hop.ts:329-331`). This SPEC adds one path:
**runner → (render + redact) → `POST /v1/hops/{hopId}/output` in short batches → table `caw.hop_output` →
`GET /v1/hops/{hopId}/output` → caw-front server action → a read-only sheet per worker, polled only while open.**

Not changed: how hops start and end, the heartbeat, limit handling, blocks, the trace file, process groups.

## Guardrails (bind both TASKs)

- **G1 — real Claude CLI: allowed since 13:01, on purpose only** (owner, `DECISIONS.md` 2026-10-29 13:01; REQ-104 Constraints as
  amended).
  - The ACs are still evidenced with the **stub** (deterministic). **Plus exactly one live run** to show the view with a real
    worker (TASK-105 DoD 11).
  - Every real run is logged: command, time, hop id, outcome, in the TASK and the log.
  - Report to the SA (who tells the PM) if a limit/quota signal says past ~60%.
  - **No LLM gateway call** without asking.
  - What follows guards against an *accidental* real start, which is still not allowed. ~~(was: no live Claude CLI)~~
  🔴 **Since 12:54, caw-back has the
  owner's `.env` with `CAW_WORKSPACE_ROOT` set and `CLAUDE_BIN` blank** (`SYSTEM-FACTS.md` § Environment 12:54). Bun loads it on
  every `bun run`, so a plain `bun run dev`, `bun run runner` or `bun run src/runner/main.ts` in caw-back **starts the REAL
  claude**. For this REQ:
  - **never** run those three in caw-back;
  - the only way to start a runner is the dev script;
  - the dev script is started as `bun --no-env-file run src/runner/e2e/live-view.ts`, and it starts **both** of its children with
    `process.execPath, "--no-env-file", …` (as `test/dev.test.ts:47`). It passes `CLAUDE_BIN` = its stub wrapper explicitly
    (**never from env**), and it refuses to start if that wrapper file does not exist;
  - never `src/runner/e2e/run.ts`.
  `bun test` stays safe: its preload clears every `.env.example` key (`test/setup/no-operator-env.ts`).
- **G2 — databases.** `caw-back/.env`'s `DATABASE_URL` is a remote TEST DB the owner allows, but **this REQ does not use it**:
  `pglite:memory` or `pglite:file:<tmp dir>` only, set explicitly. That keeps AC-6 reproducible and nobody else's data in it.
  **Never print, log or paste any `DATABASE_URL`** (owner 12:54). Do not run `bun run api` bare (it would connect to the remote DB).
  No new `.env` file is created.
- **G3 — git:** engineers never run git (`CLAUDE.md` §6). The SA commits only on the owner's own "ขึ้น git" for this topic.
- **G4 — ports:** check with `ss -ltn | grep :<port>` (`lsof` is not installed). Stop what you start by its bun pid.
- **G5 — caw-front build folder:** only a `NEXT_DIST_DIR` already listed in `caw-front → tsconfig.json:39-52` (`.next-b` for Bob,
  `.next-f` for Fanta). A new name rewrites the tracked `tsconfig.json` (TEST-101 O-2).
- **G6 — the regression baseline** (REQ-104 AC-7): caw-back `bun test` = 677 pass / 1 skip / 1 known fail
  (`src/runner/settings.test.ts:162`; `db-scripts` Case C may time out under load); caw-front `bun test src` 328 pass,
  e2e 257 pass. New tests add to these; no existing test may change its result.

## Data Model (caw-back) — new operational table, not replayed

The same kind as `follow_state` ("Operational, not replayed", `caw-back → src/db/schema.ts:189-194`): it is not an event, not
in `loadState`, and not in the rebuild check (`src/core/rebuild.ts:20-35`). Output is high-volume and has no business meaning
for the reducer.

Drizzle (`src/db/schema.ts`, after `followState`):

```ts
// Operational, not replayed (REQ-104): what a hop's CLI showed, rendered and redacted by the runner. Append-only by (hop_id, seq).
export const hopOutput = caw.table("hop_output", {
  hopId: uuid("hop_id").notNull().references(() => hops.id),
  seq: integer("seq").notNull(),
  at: at("at").notNull(),
  kind: text("kind").notNull(),
  text: text("text").notNull().default(""),
  gapSeconds: integer("gap_seconds"),
}, (t) => [
  primaryKey({ columns: [t.hopId, t.seq] }),
  check("hop_output_kind", sql`${t.kind} in ('line','gap','truncated')`),
  check("hop_output_text_length", sql`char_length(${t.text}) <= 2000`),
  check("hop_output_gap", sql`(${t.kind} = 'gap') = (${t.gapSeconds} is not null)`),
]);
```

Migration `src/db/migrations/0010_hop_output.sql` = the output of `bun run db:generate` for that schema (the BE pastes it in the
TASK). Its effect must be exactly:

```sql
CREATE TABLE "caw"."hop_output" (
  "hop_id" uuid NOT NULL, "seq" integer NOT NULL, "at" timestamp with time zone NOT NULL,
  "kind" text NOT NULL, "text" text DEFAULT '' NOT NULL, "gap_seconds" integer,
  CONSTRAINT "hop_output_hop_id_seq_pk" PRIMARY KEY("hop_id","seq"),
  CONSTRAINT "hop_output_kind" CHECK ("kind" in ('line','gap','truncated')),
  CONSTRAINT "hop_output_text_length" CHECK (char_length("text") <= 2000),
  CONSTRAINT "hop_output_gap" CHECK (("kind" = 'gap') = ("gap_seconds" is not null))
);
ALTER TABLE "caw"."hop_output" ADD CONSTRAINT "hop_output_hop_id_hops_id_fk" FOREIGN KEY ("hop_id") REFERENCES "caw"."hops"("id");
```

Existing rows: none (new table). Who runs it on a real database: **the owner** (`bun run db:migrate`); locally, PGlite applies it
on start (`src/db/client.ts:17-21`). No pruning in v1. Risk noted below.

## API / Interface Design (caw-back) — the contract caw-front and the runner build against

Field names are exact, camelCase in JSON.

**Entry** (both routes):

| Field | Type | Rule |
|---|---|---|
| `seq` | integer ≥ 0 | increasing per hop, **not** contiguous (dropped lines leave holes) |
| `at` | string, ISO 8601 | when the runner saw the line |
| `kind` | `"line"` \| `"gap"` \| `"truncated"` | |
| `text` | string, ≤ 2000 chars | the rendered, redacted line for `line`; `""` for `gap` / `truncated` |
| `gapSeconds` | integer ≥ 1, or `null` | required for `gap`, `null` otherwise |

**`POST /v1/hops/{hopId}/output`** — the runner writes a batch.
- Actor: `runner:<name>` only. Add `{ method: "POST", path: /^\/v1\/hops\/[^/]+\/output$/ }` to `RUNNER_ROUTES`
  (`src/http/actor.ts:19-26`, and its 403 message `:47`). An `operator` or `worker:` actor → **403** `runner_only`.
- Body: `{ "entries": Entry[] }`, 1–200 entries (`gapSeconds` may be omitted for non-gap kinds on input; stored as null).
- **202** `{ "stored": <number of NEW rows> }`. A `(hopId, seq)` that already exists is skipped (`ON CONFLICT DO NOTHING`), so a
  retried batch is harmless. Accepted whether or not the hop has ended (a last batch may land after `hop.finished`).
- **400** `validation` (bad body) · **403** `runner_only` · **404** `not_found` (no such hop) — the body is the usual
  `{ "error": { "code", "message" } }` (`src/http/errors.ts:6`).

**`GET /v1/hops/{hopId}/output?after=<int, default -1>&limit=<1..1000, default 500>`** — a screen reads.
- Any actor (reads need none, `src/http/actor.ts:30-37`).
- **200** `{ "hopId": string, "entries": Entry[] /* seq > after, ascending, at most limit */, "more": boolean }`.
- **404** `not_found` (no such hop).

Both routes in a new `src/http/routes/output.ts`, mounted in `src/app.ts`, in the OpenAPI document; `openapi.json` re-emitted
(`bun run openapi:emit`) — caw-front's types come from it.

## The runner (caw-back)

New `src/runner/screen.ts`, pure parts unit-tested:

1. **`screenLines(streamLine: string): string[]`** — one `stream-json` line → the lines a person would see on the CLI screen.
   - `system`/`init` → `● session <model>`.
   - `assistant` text block → its text, split on new lines.
   - `assistant` `tool_use` → `▸ <tool> <input summary>`, where tool = name without `mcp__caw__` and the summary is ≤ 200 chars:
     the `command` for Bash, the `file_path` for Read/Edit/Write, else compact JSON.
   - `user` `tool_result` with `is_error` → `✗ <first 200 chars>`.
   - `result` → `■ <subtype> · turns <num_turns>`.
   - Anything else, or not JSON → nothing.
   - Every line is cut to 2000 chars.
   These glyphs are a terminal's own output, not product wording `[SA-decided]`; the PM may change them.
2. **`liveRedact(text: string, secrets: readonly string[]): string`** = `redact(text)` (`src/runner/redact.ts:4-9`, unchanged) **plus**:
   - **bare key shapes → `***`:** `sk-[A-Za-z0-9_-]{20,}` · `gh[pousr]_[A-Za-z0-9]{30,}` · `github_pat_[A-Za-z0-9_]{30,}` ·
     `AKIA[0-9A-Z]{16}` · `xox[abprs]-[A-Za-z0-9-]{10,}` · `AIza[0-9A-Za-z_-]{35}` · JWT `eyJ[\w-]{10,}\.[\w-]{10,}\.[\w-]{10,}`;
   - **known values → `***`:** every value in `secrets`, matched exactly (longest first).
   **`secretValues(env)`** builds that list: the value of every env key whose name matches
   `/KEY|TOKEN|SECRET|PASSWORD|PASS|DATABASE_URL/i`, if the value is ≥ 6 chars. ~~(was: also every key `.env.example`
   lists — corrected at TASK-105 review 2026-10-29: that masked plain paths like `CAW_WORKSPACE_ROOT` on the screen)~~
   Built once at runner start from `process.env`. Bun loads the repo's `.env` into it, so a secret-named `.env` value is
   covered.
3. **`createScreenSender({ post, hopId, now, flushMs = 1000, maxBatch = 200, maxLines = 5000, log })`** → `{ push(text), close() }`.
   - `push` assigns the next `seq` and queues a `line`. It **never awaits and never throws**.
   - Every `flushMs` it POSTs up to `maxBatch` queued entries; **one request in flight at most**.
   - **On a failed POST:** drop that batch and the queue, and mark *down since T* (T = the time of the first failure). While down,
     `push` drops lines without queueing. Each flush sends one probe entry
     `{ kind: "gap", gapSeconds: ceil((now − T) / 1000) }` (new seq). The first probe that succeeds ends *down*, and new lines
     flow again. This matches the PM's wording "nothing received in this gap". The full stream is still in the local trace file.
   - After `maxLines` lines in a hop: one `truncated` entry, then every further line is dropped.
   - `close()` flushes what is queued, waiting at most 3 s; it never throws.
4. **Wiring in `src/runner/hop.ts`:**
   - create the sender after the spawn (`:269`);
   - in the `readLines` callback, right after `lines.push(line)` (`:295`): `for (const t of screenLines(line)) screen.push(liveRedact(t, secrets))`;
   - `await screen.close()` in the `finally` at `:326`, before the trace is written.
   - A failing sender must not change any hop outcome (AC-6, AC-7).
5. **`src/runner/api.ts`:** `hopOutput(hopId, entries)` → `POST /v1/hops/{hopId}/output` as the runner actor, the same style as `heartbeat`.

**Dev script for QA (stub only):** `src/runner/e2e/live-view.ts` + stub `src/runner/e2e/ticker-claude.ts`, modelled on
`e2e/down-up.ts` / `e2e/fake-claude.ts`:
- Starts **caw-back as a child** (`bun run src/index.ts`, `PORT=E2E_PORT` (default 4530),
  `DATABASE_URL=pglite:file:<tmp dir>`, `CAW_POLL_MS=0`, `BLUEPRINT_URL` = the in-process fake Blueprint
  (`test/helpers/fake-blueprint.ts`)). Seeds a project, a worker, a card, the chain and a workspace folder (a tmp dir). A worker needs ≥ 1 skill
  (`src/http/routes/workers.ts:15`), so the script builds its **own run root** in a tmp dir: a one-line stand-in skill, plus
  `scripts` → the real workspace's `scripts/` for the hooks (TASK-105 round 2). Then it
  starts **the real runner** with `CLAUDE_BIN` = a wrapper around `ticker-claude.ts` — **hard-coded, never from env** — and
  `CAW_WORKSPACE_ROOT` from the env (required; the runner needs the hooks). Then it starts one manual hop and prints
  `caw-front: CAW_API_URL=http://127.0.0.1:<port> bun run dev` and the URL `/p/<projectId>`.
- The stub prints `stream-json`: an `init`, then one assistant text line per second for `TICKS` (default 60). Tick 5 is a line
  carrying `sk-test-` + 24 letters and the value of env `LIVE_VIEW_SECRET`. QA sets that var in the **runner's** env, where
  `secretValues` picks it up (the name matches `SECRET`). The stub cannot read it: the child only gets `PATH HOME …`
  (`hop.ts:97-101`). So the script **writes the value into the stub's wrapper text** when it creates the wrapper. Then it comments on
  its card through the API (as `fake-claude.ts` does) and prints a `result`.
- `LIVE_VIEW_API_DOWN_AT=<s>` and `LIVE_VIEW_API_DOWN_FOR=<s>`: the script stops the API child at that second and starts it
  again on the same port and the same DB folder after the pause (AC-6).
- Ctrl+C stops everything it started, by pid.
- **`LIVE_VIEW_REAL=1`** (since 13:01): the same script, but `CLAUDE_BIN` = `~/.local/bin/claude`, set explicitly by the script
  and printed. The card's todo is a small, harmless task in the tmp workspace folder: "list the files here, then comment what you
  found". The worker gets the cheapest model and effort CAW accepts. One run, to show the view with real CLI output. Without the
  flag the stub is used, as above.

## caw-front

- **`src/api/caw.ts`:** `HopOutputEntry { seq: number; at: string; kind: "line" | "gap" | "truncated"; text: string; gapSeconds: number | null }`,
  `HopOutput { hopId: string; entries: HopOutputEntry[]; more: boolean }`, and on `CawApi`:
  `hopOutput(hopId: string, query?: { after?: number; limit?: number }): Promise<HopOutput>`.
- **`src/api/http.ts`:** over the regenerated `schema.d.ts` (`bun run gen:api`, after TASK-105 re-emits `openapi.json`).
- **`src/api/mock.ts`:** seed output for the seeded hops. The mock's **running** hop gets one more `line` every 2 s since a
  fixed start, worked out on read, so a watcher sees it grow. One finished hop has a `gap` entry (12 s) between lines.
  Hops with no output return `entries: []`.
- **Server action `src/lib/screen.ts`** (`"use server"`, like `src/lib/liveEvents.ts:1-12`):
  `screenOf(projectId, workerId, after)` → `{ hop: { id, startedAt, endedAt } | null, entries, more }`. The hop is the worker's
  newest hop in this project (`api.hops(projectId, { limit: 50 })`, newest first, filtered by `workerId`). The entries are
  `api.hopOutput(hop.id, { after })`. A back end that cannot be reached → throw; the client keeps what it has and shows the
  next poll's result.
- **Component `src/components/screen/WorkerScreen.tsx`** (client): a non-modal `Sheet` from the right, as `PersonDrawer`
  (`src/components/team/PersonDrawer.tsx:91-92`).
  - Title "หน้าจอของ {ชื่อ}". While the hop runs: the badge "สด". After it: "เริ่มเมื่อ {เวลา}" + "จบงานเมื่อ {เวลา}".
    No hop yet: "ยังไม่ได้เริ่มทำงาน".
  - Entries in a monospace, scrollable area. A `gap` renders "ขาดช่วง {n} วินาที — ระหว่างนี้ไม่ได้รับข้อมูล"; a `truncated`
    renders the PM's word (Q1).
  - Stays scrolled to the bottom unless the user has scrolled up.
  - **Polls every 2 s only while open, visible and the hop runs** (`startPoller`, `src/lib/livePoll.ts`). When the newest hop
    changes, it starts again from `after = -1`. When the hop has ended and `more` is false, it stops.
  - **No input of any kind** inside it: no `input`, `textarea`, `contenteditable`, nor a send button.
  - Mark it `data-screen` for tests.
- **Entry points** (AC-2): a secondary button "ดูหน้าจอ" on each seat of the crew strip (`src/components/CrewStrip.tsx:53-62`). It
  is separate from the seat's own filter button and does not toggle the filter. A button "ดูหน้าจอ" in `PersonDrawer`
  (team screen). Nothing opens by itself.
- **Words** in `src/words.ts` (a `screen` group), exactly the PM's table in REQ-104, plus Q1's answers.

## Flow

stub CLI prints → `hop.ts` `readLines` → `screenLines` → `liveRedact` → sender queue → `POST …/output` every 1 s →
`caw.hop_output` → user clicks "ดูหน้าจอ" → `screenOf` every 2 s → new entries appended. AC-1: ≤ 1 s runner flush + ≤ 2 s poll
+ render, well inside 5 s.

## Non-functional

- Output never delays or fails a hop. One POST in flight per hop; a batch is at most 200 lines of at most 2000 chars.
- Nothing polls while no view is open.

## Tasks

- **TASK-105** — caw-back: table + migration, the two routes, `screen.ts`, the runner wiring, the dev script + stub, tests —
  owner: BE Bob (depends on: —)
- **TASK-106** — caw-front: types, mock, server action, `WorkerScreen`, the two entry points, words, e2e — owner: FE Fanta
  (depends on: TASK-105 for the http part only, DoD 6; everything else on the mock at once)

## AC → work

| REQ-104 AC | Covered by |
|---|---|
| AC-1 live within 5 s | TASK-105 sender + dev script (stub ticks 1/s) · TASK-106 polling |
| AC-2 closed until clicked | TASK-106 entry points + "polls only while open" |
| AC-3 secrets | TASK-105 `liveRedact` + `secretValues`, stub tick 5 · stored rows checked through `GET …/output` |
| AC-4 no typing | TASK-106 "no input of any kind" + e2e assertion |
| AC-5 finished hop + times | TASK-106 "after it" state · API keeps rows after the hop ends |
| AC-6 API down 30 s | TASK-105 down/probe/gap + `LIVE_VIEW_API_DOWN_*` · TASK-106 gap rendering |
| AC-7 regression | G6, both TASKs' DoD |

## Risks / assumptions

- `hop_output` grows without bound (≤ 5000 rows per hop). No pruning in v1 `[SA-decided]` — a later REQ if the server's disk
  needs it.
- Redaction is by pattern and by known values. A secret of an unknown shape that the runner does not hold can still show.
  Same limit as today's `redact()` (`src/runner/redact.ts:3`).
- The stream shapes `screenLines` reads are the ones recorded in `src/runner/fixtures/*.stream.jsonl` (CLI 2.1.287). A newer CLI
  may add types, which show as nothing (safe), not as an error.
- REQ-106 (persistent sessions) will keep this path. One sender per hop works the same for a long-lived worker's tasks.

## No Bash sandbox — folder confinement instead (owner 13:41, `DECISIONS.md` 2026-10-29 13:41; REQ-104 Q2 answer)

Owner: *"ใช่ไม่ต้องใช้หรอก sandbox จัดวาง folder แล้วทำเลย"* — no Claude Bash sandbox, no `socat`. Guard hooks and the read fence
stay. *How* to confine the folders is the SA's design (the decision's "Open"). Built in **TASK-112** (BE).

What the sandbox did today, and what replaces each part:

| Sandbox part (caw-back) | Replaced by |
|---|---|
| `sandbox.enabled …`, `network: { allowedDomains: [] }` (`src/runner/settings.ts:46`) | **removed**. Bash network stays limited by the allow-list: only `git status/log/diff/show`, `ls cat head tail grep wc`, `bun test *`, `bun run typecheck` (`settings.ts:8-19`), plus the denies on `curl wget nc ssh scp` (`:23-26`). `-p` cannot ask, so anything else is refused |
| Bash read fence `denyRead ["~/"]` + `allowRead` = readable folders (`settings.ts:80`) | **`read-guard.ts` also guards `Bash`** (hook matcher `Read\|Glob\|Grep\|Bash`). For Bash it **fails closed**: it refuses a command containing `;` `\|` `&` `` ` `` `$(` `>` `<` (the one exception is a trailing `2>&1`). It splits the rest into words (simple quotes respected), and refuses if any word that names a path — starts with `/` or `~`, or contains `..`, or is an existing relative path — resolves (real path, against the hook's `cwd`) outside the readable folders |
| `sandbox.filesystem.denyWrite` for read-only folders (`settings.ts:64`) | **removed**; `Edit`/`Write` stay denied there (`:63`). No allowed Bash command writes, except what `bun test` code does (risk below) |
| — (new) | **Folder confinement:** before spawning, `hop.ts` refuses the hop (outcome `stopped`, one Thai note — wording from the PM) unless **every** project root and read-only folder, by real path, is inside `CAW_WORKSPACE_ROOT`. Each must also not be `CAW_WORKSPACE_ROOT` itself, nor inside its `scripts/` or `.claude/`. The worker's cwd is already its first root (`hop.ts:269`) |

`Interpreted` `[SA-decided]`: "each worker's own folder" = **its project's work folders** under `CAW_WORKSPACE_ROOT`. Today
all workers of a project share them. A per-worker sub-folder would be a later change if the owner means that (asked, Q4).

Risks the owner accepted by choosing this:
- `bun test` runs the repo's own test code with the worker's user rights. That code can read or write outside the folder and
  use the network; only hooks on the *tool call* see it, not what the test does.
- The Bash read check is by words, not a shell parser. It fails closed on anything it cannot judge.

## Interpreted (at review)

- 2026-10-29, TASK-106. `WorkerScreen` polls with its own 2 s loop, not `startPoller` (fixed at 3 s, `caw-front →
  src/lib/livePoll.ts:5`), to keep AC-1's 5 s budget. It also keeps polling while the worker has no hop yet, so a hop that starts
  while the sheet is open appears. Both are reversible `[SA-decided]`.
- ~~2026-10-29, TASK-106. Each crew-strip seat is 44 px taller (the "ดูหน้าจอ" row). Kept for now `[SA-decided]`; the look is the
  owner's design approval, flagged to the PM.~~ **Superseded by the owner 13:13** (`DECISIONS.md` 2026-10-29 13:13, *"เปลี่ยนเป็นปุ่มมุม"*):
  "ดูหน้าจอ" on the crew strip is a **small button in each seat's corner**, no extra row. It must not cover the name or the
  role marks, must keep a ≥ 44 × 44 px touch target, and must not toggle the seat's filter. On the team screen, the drawer's
  button follows the same style where it fits (the owner's "if possible").

## Questions

- **Q4 (SA → PM, does not block TASK-112)** — the owner's 13:41 *"จัดวาง folder"*: I read "each worker's own folder" as **the
  project's work folders under `CAW_WORKSPACE_ROOT`**, shared by that project's workers (today's model). If he means **one
  sub-folder per worker**, that is a later change (per-worker roots). I build the shared reading unless corrected. Also needed:
  the Thai note when a hop is refused because a folder is outside — my default: `โฟลเดอร์งานต้องอยู่ใน CAW_WORKSPACE_ROOT — ก้าวนี้ไม่ได้เริ่ม`.
  Checked: DECISIONS 13:41 (Open = the SA's design), 11:41 items 5/7 — not covered.
  > answer: build the **shared project folders** reading now; the Thai refusal note as you wrote it. Interpreted `DECISIONS.md` 13:41 this way because it is today's model and per-worker sub-folders can be added on top later. Atom's English relay said "each worker … its own folder", so I am telling the owner this reading in one line; if he wants per-worker folders it becomes a later change. — Porter (PM) 2026-10-29 `[PM-decided]`

- **Q1 (SA → PM — blocks TASK-106 DoD 4 only, two words)** — REQ-104's wording table has no text for two states I need.
  I will use these unless you change them: **truncated** (after 5000 lines) → `ยาวเกินไป — ส่วนที่เหลือไม่ได้แสดง` · **start
  time** on a finished hop → `เริ่มเมื่อ {เวลา}`. Correct only the line that is wrong.
  Checked: REQ-104 § User-facing wording; DECISIONS 2026-10-29 11:41, 12:41 — not covered.
  > answer: truncated → `ยาวเกิน 5,000 บรรทัด — ส่วนที่เกินไม่ได้แสดง` / EN `Over 5,000 lines — the rest isn't shown` (number added so the user knows what was cut) · start time → `เริ่มเมื่อ {เวลา}` / EN `Started at {time}` as you proposed. Added to REQ-104 § User-facing wording. — Porter (PM) 2026-10-29 `[PM-decided]`
