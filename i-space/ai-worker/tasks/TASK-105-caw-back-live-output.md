# TASK-105: caw-back — store and serve each hop's CLI output, live (REQ-104)
- Source: SPEC-103 (REQ-104 AC-1, AC-3, AC-5, AC-6, AC-7)
- Owner: BE (Bob)
- Status: DONE (2026-10-29, Silver — DoD 1–10; DoD 11 = environment blocker, carried to the PM, § Questions Q1)
- Depends on: none
- Repo: `caw-back` on `atom` @ 102a130. **You change code; you never run git** (the SA commits only on the owner's word).

## Read first

`specs/SPEC-103-caw-live-cli-view.md`, all of it. Guardrails G1–G6 bind every step. 🔴 **G1 (updated 13:01): the real `claude` only on purpose — exactly the one run in DoD 11.**
Everything else uses the stub. `CLAUDE_BIN` is always set by the dev script itself, never from env or `.env`.

## What to do

Build the caw-back half of SPEC-103 exactly as written: § Data Model, § API, § The runner (items 1–5), § Dev script. Where the
SPEC names a file and line, change it there. Keep every existing behaviour; output must never change a hop's outcome.

Closed file list (ask in `## Questions` before touching anything else):
`src/db/schema.ts` · `src/db/migrations/0010_hop_output.sql` + `meta/_journal.json` + `meta/0010_snapshot.json` (generated) ·
`src/http/actor.ts` · `src/http/routes/output.ts` (new) · `src/app.ts` · `src/runner/screen.ts` (new) · `src/runner/screen.test.ts` (new) ·
`src/runner/hop.ts` · `src/runner/hop.test.ts` · `src/runner/api.ts` · `src/runner/api.test.ts` · `src/runner/main.ts` (only to build
`secretValues` once and pass it) · `src/runner/e2e/live-view.ts` (new) · `src/runner/e2e/ticker-claude.ts` (new) ·
`test/http/hop-output.test.ts` (new) · `test/db/migration-0010.test.ts` (new) · `openapi.json` (re-emitted).

## Definition of Done

Paste each command and its real output (trimmed) in `## Implementation Notes`.

- [ ] **1. Base.** `git status --short` (→ empty) and `bun test` before you start (→ 677 pass / 1 skip / 1 fail, SPEC G6).
- [ ] **2. Migration.** `bun run db:generate` writes `0010_hop_output.sql`. Paste the file: it must match SPEC-103 § Data Model.
      `test/db/migration-0010.test.ts` (same shape as `test/db/migration-0009.test.ts`) proves the table, the PK, the three
      checks and the FK.
- [ ] **3. Routes.** `test/http/hop-output.test.ts` covers:
      - POST as runner → 202 `{stored:n}`;
      - the same batch again → `{stored:0}`;
      - POST as operator and as worker → 403 `runner_only`;
      - unknown hop → 404;
      - 201 entries → 400; text of 2001 chars → 400; `gap` without `gapSeconds` → 400;
      - GET `after` / `limit` / `more` and ascending order;
      - rows readable after the hop finished.
- [ ] **4. Runner units.** `src/runner/screen.test.ts`:
      - `screenLines` on every fixture in `src/runner/fixtures/*.stream.jsonl` (paste what one fixture renders to);
      - `liveRedact` on each bare key shape in the SPEC, a known value, and that "monkey=banana" stays;
      - `secretValues` from a sample env;
      - the sender with a fake clock and a fake `post`: batching ≤ 200, one request in flight, down → probe → gap with the
        right seconds, `truncated` after `maxLines`, `close()` ≤ 3 s, and `push` never throws.
- [ ] **5. Hop wiring.** `src/runner/hop.test.ts` gains:
      - a hop whose fake child prints lines → the fake API received them in order, redacted;
      - a hop whose output POSTs all fail → the **same** outcome and note as without output (AC-6).
- [ ] **6. Whole suite.** `bun test` → previous counts + your new tests, **no** existing test changes result (G6). Paste the summary.
- [ ] **7. OpenAPI.** `bun run openapi:emit` and `git diff --stat openapi.json` (reading git is allowed) shows only the two new
      paths and the Entry schemas.
- [ ] **8. Dev script, run with the stub (G1 — read it again: since 12:54 `.env` sets `CAW_WORKSPACE_ROOT`).** Run
      `CAW_WORKSPACE_ROOT=<workspace root from machine.local.md> LIVE_VIEW_SECRET=s3cr3t-value-123 bun --no-env-file run src/runner/e2e/live-view.ts`.
      First paste the line the script prints with the `CLAUDE_BIN` it gives the runner (it must be the stub wrapper). Then, while it runs,
      `ps -eo args | grep -c "[.]local/bin/claude"` → 0. Then `curl -s localhost:4530/v1/hops/<hopId>/output | head -c 600` twice, 5 s apart:
      the entries grow. Tick 5 shows `***` in place of the key and of `s3cr3t-value-123`.
      `grep -c s3cr3t-value-123` on the GET output → 0. Paste it all.
- [ ] **9. API down (AC-6), with the stub.** Run with `LIVE_VIEW_API_DOWN_AT=10 LIVE_VIEW_API_DOWN_FOR=30`, then GET the output
      after the hop ends. Expected: one `gap` entry with `gapSeconds` ≈ 30 (±3), lines before and after it, and the hop's
      outcome `commented`, not `failed` / `stopped`. Paste it.
- [ ] **10. After.** `git status --short` lists only the files in the closed list. Nothing listening on :4530. No `claude` process
      (`ps aux | grep -c "[.]local/bin/claude"` → 0).
- [ ] **11. One live run (allowed since 13:01, `DECISIONS.md`; SPEC-103 G1).** After DoD 1–9 pass on the stub, run once:
      `CAW_WORKSPACE_ROOT=<…> LIVE_VIEW_REAL=1 bun --no-env-file run src/runner/e2e/live-view.ts`. Paste the start time, the
      `CLAUDE_BIN` line, the hop id, the first ~20 entries of `GET …/output`, the hop's outcome + tokens, and any `rate_limit`
      line. If a limit signal says past ~60%, stop and write it in `## Questions`. Write one log line for the run. **Exactly
      one run**; a second one needs a reason in `## Questions` first.

## Implementation Notes

Bob, 2026-10-29 12:53–13:15 (box clock). Repo `caw-back` @ `102a130`, no git write. 🔴 G1 held: no real `claude` ran. Before every dev-script run I
used `env -u CLAUDE_BIN`; the script hard-codes `CLAUDE_BIN` = its stub wrapper (`live-view.ts`, "CLAUDE_BIN last"). After: `ps aux | grep -c "[.]local/bin/claude"` → `0`.

**1. Base** (12:53) — `git status --short` → (empty) · `git log -1 --oneline` → `102a130 chore: add merge and release workflows` ·
`bun test` → `677 pass · 1 skip · 1 fail · Ran 679 tests across 60 files. [89.04s]` (fail = `src/runner/settings.test.ts:162`, as G6).

**2. Migration** — `bun run db:generate --name hop_output` → `[✓] Your SQL migration file ➜ src/db/migrations/0010_hop_output.sql`. The file:
```sql
CREATE TABLE "caw"."hop_output" (
	"hop_id" uuid NOT NULL, "seq" integer NOT NULL, "at" timestamp with time zone NOT NULL, "kind" text NOT NULL, "text" text DEFAULT '' NOT NULL, "gap_seconds" integer,
	CONSTRAINT "hop_output_hop_id_seq_pk" PRIMARY KEY("hop_id","seq"),
	CONSTRAINT "hop_output_kind" CHECK ("caw"."hop_output"."kind" in ('line','gap','truncated')),
	CONSTRAINT "hop_output_text_length" CHECK (char_length("caw"."hop_output"."text") <= 2000),
	CONSTRAINT "hop_output_gap" CHECK (("caw"."hop_output"."kind" = 'gap') = ("caw"."hop_output"."gap_seconds" is not null))
);
--> statement-breakpoint
ALTER TABLE "caw"."hop_output" ADD CONSTRAINT "hop_output_hop_id_hops_id_fk" FOREIGN KEY ("hop_id") REFERENCES "caw"."hops"("id") ON DELETE no action ON UPDATE no action;
```
(shown wrapped to fewer lines here; the file has one column per line.) Same effect as SPEC § Data Model; the only difference is drizzle's own style of writing the column names in the CHECKs with the table in front. Journal: `idx 10 · 0010_hop_output`.
`test/db/migration-0010.test.ts` (same shape as 0009's): 1 test, 16 expects — applies on a database at 0009, table empty, the six columns/defaults, PK + 3 checks + FK by name,
and refusals: duplicate (hop, seq), kind `banner`, text 2001 (2000 passes), a gap without seconds, seconds on a line, no such hop. Note: this Postgres lists NOT NULL as `contype n` too, so the test selects `contype in ('c','f','p')`.

**3. Routes** — `bun test test/http/hop-output.test.ts` → `11 pass · 0 fail · 55 expect()`. They cover every bullet of DoD 3: 202 `{stored:n}`; same batch → `{stored:0}`, a mixed batch counts only new rows; operator/worker → 403 `runner_only` (real and unknown hop); no actor → 400; unknown/non-uuid hop → 404 (POST and GET);
201 entries / 0 entries / text 2001 / gap without `gapSeconds` (omitted, null, 0) / `gapSeconds` on a line / negative seq / bad kind / bad `at` → 400 `validation` and **nothing stored, not even the good entries**; 200 entries and text of exactly 2000 are accepted; GET ascending, `after` exclusive, `limit`, `more` (exactly-limit-left → false), defaults, bad query → 400; GET for any actor; rows readable after `hop.finished` and a last batch still lands; the events feed gains no event and `rebuild-check` stays `{same:true}`; the two paths and `HopOutputEntry` are in `/v1/openapi.json`.
Routes are in `src/http/routes/output.ts`; the runner's allow-list line is `src/http/actor.ts:26`, its 403 text now says "send a hop's output".

**4. Runner units** — `bun test src/runner/screen.test.ts` → `32 pass · 0 fail · 275 expect()`.
What one fixture renders to (`ok.stream.jsonl`, 11 lines): `● session claude-haiku-4-5-20251001` · `ตกลง (OK) ✓` · *(blank line)* · `ฉันพร้อมแล้ว ได้รับการตั้งค่าทั้งหมด:` · `- จะพูดภาษาไทยกับคุณ แต่เก็บโค้ดเป็นภาษาอังกฤษ` · … · `■ success · turns 1`.
`write-outside.stream.jsonl` → `● session …` · the worker's words · `▸ Bash mkdir -p /private/tmp/…` · `✗ mkdir in '/private/tmp/…' needs approval. The path is outside the working directories…` · … · `■ success · turns 2`. Counts per fixture: no-web 6, read-guard 2, ok 11, push-absolute-hooks 12, push-relative-hooks 5, write-outside 6 — all plain strings ≤ 2000 chars.
`liveRedact`: each of the 8 bare shapes (sk-, ghp_, gho_, github_pat_, AKIA, xox, AIza, JWT) → `***`; a known value (all occurrences, longest first, exact case); `monkey=banana` stays; `redact()`'s own forms still apply. `secretValues` from a sample env; `exampleKeys()` reads the real `.env.example`.
Sender (fake clock, fake `post`, hand-driven flush via an injected `every`): batches 200+200+50 for 450 lines; one request in flight; down → batch+queue dropped → probe gaps (13 s, then 30 s) → recovery → new lines; `truncated` after `maxLines` (also when the cap is passed while down); `close()` flushes, returns ≤ closeMs on a hung POST (80 ms test value; 3000 default), is instant while down; `push`/`close` never throw (clock throws, post throws synchronously, post rejects); a hung POST counts as failed after `postTimeoutMs`.

**5. Hop wiring** — `bun test src/runner/hop.test.ts` → `95 pass · 0 fail` (91 existing unchanged + 4 new, in `describe("the worker's screen …")`): a child printing lines → the API holds `● session stub-model · first line · second line · leaked *** and *** and token=*** · ▸ comment {"text":"hi"} · ■ success · turns 2`, seq 0–5, and the raw key and `topsecretvalue` are in neither; **AC-6** a hop whose `hopOutput` always throws ends with the same outcome/note/tokens as an untroubled one (`commented`, ``), output empty, one log line `screen output not sent … boom`; a `hopOutput` that never answers → hop still `commented`, under 6 s; a child printing nothing → nothing stored. `src/runner/api.test.ts` +2 (real app: `{stored:2}` then `{stored:0}`; a stub fetch sees `POST /v1/hops/a%20b/output`, `x-caw-actor: runner:test-1`, body `{entries}`) → `8 pass`.

**6. Whole suite** (13:07) — `bun test` → `727 pass · 1 skip · 1 fail · Ran 729 tests across 63 files. [98.03s]`. = 677 + 50 new (1 migration + 11 routes + 32 screen + 4 hop + 2 api). Same single fail (`settings.test.ts:162`) and same skip (`guard.test.ts:51`); no existing test changed result. `bunx tsc --noEmit -p tsconfig.json` → no output (clean; it flagged one error in my own `api.test.ts` first, fixed, then re-run clean).

**7. OpenAPI** — `bun run openapi:emit` → `wrote …/openapi.json`; `git diff --stat openapi.json` → `1 file changed, 251 insertions(+)`, **0 deletions**. Hunks: `@@ -722,0 +723,42 @@` (`HopOutputEntry` schema) and `@@ -2337,0 +2380,209 @@` (path `/v1/hops/{hopId}/output`, `get` + `post`). Nothing else.

**8. Dev script, with the stub** — ⚠️ **the command as written in the TASK does not run a hop here.** `CAW_WORKSPACE_ROOT=<machine.local.md workspace root>` has no `.claude/skills/role-be` on this machine (skills live in `~/.claude`), so the runner stops the hop at once:
`hop … skill role-be not found under /workspace/ai-agent-workspace/.claude/skills — hop stopped` → `hop ended: {"outcome":"stopped","note":"ไม่พบสกิล role-be"}` · `output: {"entries":0,…}` (stub, TICKS=10; nothing sent anywhere).
So I ran it with a **scratch workspace root** in my scratchpad: `.claude/skills/role-be/SKILL.md` (a one-line stub) and `scripts` → symlink to the real workspace's `scripts/` (the three guard hooks). Nothing under a repo or the workspace was created. Command (13:04):
`env -u CLAUDE_BIN CAW_WORKSPACE_ROOT=<scratch root> LIVE_VIEW_SECRET=s3cr3t-value-123 bun run src/runner/e2e/live-view.ts` →
`API up: http://127.0.0.1:4530` · `runner started … claude = /tmp/caw-live-bin-…/ticker-claude.sh` · `hop started: 01a18642-93f3-77ee-ac3b-b22098ced872` · `caw-front: CAW_API_URL=http://127.0.0.1:4530 bun run dev  then open http://localhost:3500/p/<projectId>`.
`curl …/output | head -c 600` at ≈12 s and 5 s later both begin `{"hopId":…,"entries":[{"seq":0,…"text":"● session ticker-stub"…},{"seq":1,…"tick 1 of 60"…` (the first 600 chars cannot show growth); the growth: entries `24` → `29` five seconds later (`grep -o '"seq"' | wc -l`).
Tick 5: `"text":"tick 5 of 60 — key *** and the secret ***"`. `curl -s …/output | grep -c s3cr3t-value-123` → `0`; `grep -c 'sk-test-'` → `0`. At the end: `hop ended: {"outcome":"commented","note":""}` · `output: {"entries":62,"more":false,"gaps":[],"tick5":"tick 5 of 60 — key *** and the secret ***"}` (init + 60 ticks + result) · `secret value in the stored output? no` · `sk-test key in the stored output? no`.

**9. API down (AC-6), stub** (13:05:58) — `… LIVE_VIEW_API_DOWN_AT=10 LIVE_VIEW_API_DOWN_FOR=30 bun run src/runner/e2e/live-view.ts` → `[12.3 s] API DOWN: stopping pid 718301 for 30 s` · `[43.2 s] API back: pid 724469` (same port, same `pglite:file` folder — the data survived) · `[63.0 s] hop ended: {"outcome":"commented","note":""}`.
Stored output (31 entries): seq 0–9 `● session ticker-stub`, `tick 1…9`, then **`[72,"gap",32,""]`**, then `[73,"line","tick 42 of 60"]` … `[92,"line","■ success · turns 1"]`. One gap, `gapSeconds` 32 (expected ≈30 ± 3 ✓). Ticks ≈10–41 are missing by design (the runner's own trace file still has the whole stream). The holes in `seq` (10–71) are the dropped lines and the failed probes — `seq` is not contiguous, as the SPEC says.
Runner log: `screen output not sent (0 network: POST /v1/hops/…/output: The socket connection was closed unexpectedly…)` once, then `screen output is flowing again after 32 s`.

**10. After** (13:10) — `git status --short` lists exactly the closed list: `M openapi.json src/app.ts src/db/migrations/meta/_journal.json src/db/schema.ts src/http/actor.ts src/runner/{api.test.ts,api.ts,hop.test.ts,hop.ts,main.ts}` and new `src/db/migrations/0010_hop_output.sql`, `meta/0010_snapshot.json`, `src/http/routes/output.ts`, `src/runner/{screen.ts,screen.test.ts}`, `src/runner/e2e/{live-view.ts,ticker-claude.ts}`, `test/db/migration-0010.test.ts`, `test/http/hop-output.test.ts` (19 paths). `ss -ltn | grep :4530` → nothing. `claude` processes → 0. One listener on **:4500** exists that is **not mine**: pid 731113, `bun run src/index.ts`, cwd in another session's scratchpad (`…/t106/src/caw-back`), started 13:07:53 — I left it alone (Fanta's TASK-106 work, I assume — `inferred`).

**Decisions I made (internal, reversible — veto freely)**
- The sender takes `every` (scheduler), `postTimeoutMs` (10 s) and `closeMs` (3 s) as options so tests need no real waiting; `HopDeps.secrets` is optional (default none) because `main.test.ts`, outside my file list, builds `HopDeps`. `main.ts` builds it once and logs a line if `.env.example` cannot be read.
- A dropped line still uses its `seq` (the "hole"); `at` is when the line was **seen**, not flushed; a whitespace-only text block shows nothing; a blank line inside a text block is kept.
- POST validation: `gapSeconds` required for `gap`, refused on other kinds (the DB check would otherwise answer 500); a bad batch is refused whole.
- Redaction order: known values first (exact), then `redact()`, then the key shapes.

**Things Silver should know / decide**
1. 🟡 **Item 8's command needs a workspace root that has `.claude/skills/role-be`.** QA will hit "skill role-be not found" exactly as I did. Either QA uses a scratch root like mine (I can write the 4 shell lines into the TASK/TEST), or the worker in the script should carry a skill that exists under the real root. Not changed by me (SPEC-fixed).
2. 🟡 `secretValues` follows the SPEC literally — **every** key `.env.example` lists with a value ≥ 6 chars. That includes `CAW_WORKSPACE_ROOT`, `CAW_API_URL`, `BLUEPRINT_URL`, `CLAUDE_BIN`, `DATABASE_URL`. If the runner has `CAW_WORKSPACE_ROOT=/home/x/ws` then any line a worker prints containing that path shows `***/…` on the screen. Safe, but it will look odd. I did not change it. Say the word if you want only the secret-looking names.
3. The API does not cap rows per hop (the 5000 cap is the runner's); a misbehaving runner could grow `hop_output` — SPEC Risk 1, no pruning in v1.
4. The bare-key rules are by shape: the `sk-` rule hides any token that starts `sk-` and has 20+ of `[A-Za-z0-9_-]` after it, whatever it really is. No false positive appeared in the 6 recorded fixtures.

**UNVERIFIED** — everything ran on PGlite only: `ON CONFLICT DO NOTHING … RETURNING` and the migration on a **real Postgres** (settles: the owner's `bun run db:migrate` on SIT, then one POST); the real `claude` stream beyond the 6 recorded fixtures (CLI 2.1.287) — a newer CLI's new line types render as nothing; caw-front against these routes (TASK-106 DoD 6); no formal `/security-review` or `silent-failure-hunter` pass (no such agent in this session) — I did the passes by hand: no empty catch (every catch logs or is a documented "not there yet"), input validated by zod at the boundary, queries parameterised by drizzle, secrets never logged (the sender's `log` is the hop's redacting `log`), `runner_only` enforced on POST.

### Rework round 1 — Bob, 2026-10-29 13:12–13:30 (answers Silver's four items; item 4 is blocked, see Questions)

**Item 1 (G1, `--no-env-file`, refuse without the stub) — done.** `live-view.ts` now starts the API child and the runner as `[process.execPath, "--no-env-file", "run", …]`; `CLAUDE_FOR_RUNNER` is written in the script (stub wrapper, or `~/.local/bin/claude` only with `LIVE_VIEW_REAL=1`), never from env/`.env`; it exits 1 with one line if that file is not there; it prints `CLAUDE_BIN given to the runner: …` first.
Checked what my 12:5x–13:15 runs (before your G1 update) could have touched, since `caw-back/.env` appeared at 12:54:44: the dev script gave the API child `DATABASE_URL=pglite:file:<tmp>` and `BLUEPRINT_URL=<fake>` explicitly, and the runner `CLAUDE_BIN=<stub>` explicitly (env overrides `.env`); their logs show `database /tmp/caw-live-db-…/pg` and `claude = /tmp/caw-live-bin-…/ticker-claude.sh (stub)`. `openapi:emit` uses `pglite:memory`; `db:generate` opens no database; `bun test` has the preload. I never read, printed or used the `.env`'s `DATABASE_URL` (I printed only its key names and the value of `CAW_WORKSPACE_ROOT`).

**Item 2 (skills) — your fix cannot work as written; I did the equivalent inside the script.** `skills: []` is refused by the API (`Skills = z.array(…).min(1)` at `src/http/routes/workers.ts:15`; `test/http/workers-chain.test.ts:29` asserts a 400) and by the DB (`workers_skills_not_empty`, migration 0000:134). And no root on this box has any `.claude/skills/<name>` (checked `/workspace/ai-agent-workspace` and `/workspace/caw-workspaces`). So `live-view.ts` now builds its **own run root** in a temp folder: `.claude/skills/role-be/SKILL.md` (a one-line stand-in) and `scripts` → symlink to `<CAW_WORKSPACE_ROOT>/scripts`, so the **real guard hooks** run; the runner gets that run root as its `CAW_WORKSPACE_ROOT`; the real one is only where the hooks come from. It refuses to start if `<root>/scripts/hooks` is missing. QA can therefore use the real root, as you wanted. Cleanup: `rmSync` of the temp root removes the link only (checked: a target outside the temp dir survives; and after my runs `ls /workspace/ai-agent-workspace/scripts/hooks | wc -l` → `12`, `ls -d /tmp/caw-live-*` → nothing).

**Item 3 (`secretValues`) — done.** Names matching `/KEY|TOKEN|SECRET|PASSWORD|PASS|DATABASE_URL/i`, value ≥ 6 chars; `exampleKeys` and its `readFileSync` removed; `main.ts` is now `const secrets = secretValues(process.env);` (the extra log line is gone). Tests: `CAW_WORKSPACE_ROOT` / `BLUEPRINT_URL` / `PORT` / `HOME` are not in the list; a lower-case `my_api_key` is; and `liveRedact("▸ Read /home/x/ws/src/a.ts", secretValues({CAW_WORKSPACE_ROOT:"/home/x/ws", CLAUDE_BIN:"/home/x/.local/bin/claude"}))` is unchanged.

**DoD 8 as written, real root** (13:23:50): `env -u CLAUDE_BIN CAW_WORKSPACE_ROOT=/workspace/ai-agent-workspace LIVE_VIEW_SECRET=s3cr3t-value-123 bun --no-env-file run src/runner/e2e/live-view.ts` →
`CLAUDE_BIN given to the runner: /tmp/caw-live-bin-errTse/ticker-claude.sh  (STUB wrapper around ticker-claude.ts)` · `runner started … (stub)` · `hop started: 01a18654-49f4-720c-8ef5-a195482701f8` · `ps -eo args | grep -c "[.]local/bin/claude"` while running → `0` ·
GET at ≈12 s begins `{"hopId":…,"entries":[{"seq":0,…"● session ticker-stub"…},{"seq":1,…"tick 1 of 60"…` · entries `10` → (5 s) → `15` · `"text":"tick 5 of 60 — key *** and the secret ***"` · `grep -c s3cr3t-value-123` → `0` · `[63.4 s] hop ended: {"outcome":"commented","note":""}` · `output: {"entries":62,"more":false,"gaps":[],…}`. (The same run was done twice before with the scratch root and once with `bun --no-env-file`; identical results.)
**DoD 9 again, real root** (13:25:13, `LIVE_VIEW_API_DOWN_AT=10 LIVE_VIEW_API_DOWN_FOR=30`): `API DOWN` at 12.9 s · `API back` at 43.4 s · `hop ended: {"outcome":"commented","note":""}` · one gap `[72,"gap",32,""]`, lines `0–` before it and `…tick 60 of 60`, `■ success · turns 1` after it.
**Whole suite after the rework** (13:26): `725 pass · 1 skip · 2 fail · Ran 728 tests across 63 files [117.79s]` (−2 tests: the two `exampleKeys`/old `secretValues` tests were replaced by two). The second fail is `claim (C-Q1)` in `test/http/hops-runs.test.ts` at **16 164 ms** — it passes alone, twice (`9 pass · 0 fail`, 3.5 s) and it does not touch my code (start/patch of a hop); the box was under load from sibling sessions (load average ≈ 4, `main.test.ts` alone took 24 s). `inferred — a timeout under load; settles: one more full run when the box is quiet`. `bunx tsc --noEmit` → clean.

**Item 4 / DoD 11 — attempted ONCE, did not run a model.** `LIVE RUN START: 2026-10-29 13:16:15 +0700` — `env -u CLAUDE_BIN CAW_WORKSPACE_ROOT=<scratch root> LIVE_VIEW_REAL=1 bun --no-env-file run src/runner/e2e/live-view.ts` →
`CLAUDE_BIN given to the runner: /home/box/.local/bin/claude  (REAL claude — LIVE_VIEW_REAL=1)` · `runner started … (REAL)` · hop `01a1864d-5730-77e6-a9fd-f37d870ce48f` · after **1 s**: `hop ended: {"outcome":"failed","note":"ก้าวนี้ไม่ได้ทิ้งผลงานไว้ · exit 1 · tools: none · turns 0"}`. The only stored entry: `[0,"line","■ error_during_execution · turns 0"]`. The runner's trace (`~/.caw/traces/01a1864d-….jsonl`, 1 line): `{"subtype":"error_during_execution","is_error":true,"num_turns":0,"total_cost_usd":0,"usage":{"input_tokens":0,…},"errors":["Sandbox required but unavailable: sandbox is enabled but dependencies are missing: socat not installed · install missing tools (e.g. apt install bubblewrap socat) or see https://code.claude.com/docs/en/sandboxing. Set sandbox.failIfUnavailable=false to allow unsandboxed execution."]}`.
So: **no model call, 0 tokens, no quota used, no `rate_limit` line** (the CLI stopped before `init`). `which bwrap` → `/usr/bin/bwrap` (there); `which socat` → not found. Nothing was started afterwards; script stopped, `:4530` free, 0 claude processes. The run was *not* repeated — see Questions.

## Questions

**Q1 (Bob → Silver — blocks DoD 11 only).** The one live run could not start: the runner's generated settings turn the Claude sandbox on (`src/runner/settings.ts`, R-4) and `claude` 2.1.312 here refuses to run without `socat` (`bwrap` is installed). Evidence above (trace line of hop `01a1864d-5730-77e6-a9fd-f37d870ce48f`). No quota was spent, so I do not count it as "the" run — but you set "exactly one", so I will not run it again without your word. Options, my order of preference:
  A. **Someone with root installs `socat`** (`apt install socat`) on this box, then I run DoD 11 once. It changes the machine, not any repo — not mine to do (no sudo/installs for me).
  B. Run the live check on the owner's own machine, where the sandbox deps exist — he sees it there; I paste nothing.
  C. Set `sandbox.failIfUnavailable=false` for the live run only — I advise **against**: it runs the model with the Bash sandbox off, which is the guard the runner relies on (`settings.ts` is outside my file list too).
  Checked: SPEC-103 G1 (13:01) allows the live run but says nothing on the sandbox; `DECISIONS.md` 13:01 — not covered.
  > answer (Silver, 2026-10-29): **C is refused** (it would run the model with the Bash sandbox off). **A** is a machine change,
  > neither yours nor mine: it goes to the PM for the owner (and Otto, if the owner wants). **B** is the owner's choice.
  > Your one attempt is correctly **not** "the" run: 0 tokens, the CLI stopped before `init`. DoD 11 is carried out of this TASK
  > as an environment blocker (§ Review). Do not run it again until the PM writes the owner's answer here.

## Review

**REWORK (small, four items)** — Silver (SA, Team B), 2026-10-29 13:2x. The work itself is good. Items 2 and 3 are defects in
**my** SPEC (F-entry written). Item 1 is a G1 rule I added at ~13:00, after you had started.

Re-checked by the SA:
- `bun test src/runner/screen.test.ts test/http/hop-output.test.ts test/db/migration-0010.test.ts` → 44 pass · 0 fail.
- `git status --short` → 19 paths, all in the closed list.
- `ps` → 0 `claude`.
- `live-view.ts:85-88` hard-codes `CLAUDE_BIN` = the stub; `:49` gives the API child `pglite:file`.

Accepted as is:
- the migration (drizzle's own CHECK style, same effect);
- routes and validation (whole-batch refusal, `gapSeconds` refused on non-gap);
- `screenLines` / `liveRedact` / sender behaviour, AC-6 (`gapSeconds` 32), and the redaction at tick 5;
- the OpenAPI diff, additions only;
- your internal decisions.

Fix:
1. **G1 (13:00 update) in `live-view.ts`:** start both children with `[process.execPath, "--no-env-file", "run", …]` (now
   `:47` and `:86`), and refuse to start (exit 1, one line) if the stub wrapper file is missing before the runner spawns.
   Re-run DoD 8 as written, with `bun --no-env-file run …`, and paste the `CLAUDE_BIN` line.
2. **Skills (my gap — the SPEC never said which skills the seeded worker has):** seed the worker with `skills: []`
   (`live-view.ts:80`), so the real workspace root works and QA needs no scratch root. Re-run DoD 8 with the real root.
3. **`secretValues` (my over-broad rule):** drop "every key `.env.example` lists". Keep only names matching
   `/KEY|TOKEN|SECRET|PASSWORD|PASS|DATABASE_URL/i`, value ≥ 6 chars. Paths like `CAW_WORKSPACE_ROOT` stay readable.
   SPEC-103 § The runner item 2 is updated. Adjust its test.
4. **DoD 11 (the one live run)** is not done yet. Do it after 1–3, exactly once, logged.

Noted, not yours: a caw-back API on :4500 from another session's scratchpad (`…/t106/…`, pid 731113, `pglite:file`) — left alone.
**Round 2 — DONE (DoD 1–10)** — Silver, 2026-10-29 13:3x. DoD 11 carried out as an environment blocker (not a defect of this TASK).

Re-checked by the SA:
- `live-view.ts` starts both children with `--no-env-file` (`:4-5`). It refuses when the claude it would hand over is missing
  (`:60-61`) or the hooks are missing (`:45`), and prints the `CLAUDE_BIN` it gives the runner (`:62`).
- `which socat` → nothing, `/usr/bin/bwrap` present.
- `bun test test/http/hops-runs.test.ts src/runner/screen.test.ts` → 40 pass · 0 fail. The "claim (C-Q1)" timeout in your full run
  did not repeat alone; it is recorded as flaky under load (`inferred`), with the same status as `db-scripts` Case C.
- `git status --short` → 19 paths. 0 `claude` processes.

Accepted:
- item 1;
- item 2 your way: the script's own run root. My `skills: []` could not work, because the API and the DB require at least one
  skill (`src/http/routes/workers.ts:15`, `workers_skills_not_empty`). SPEC-103 says so now;
- item 3;
- DoD 8 and DoD 9 re-run on the real root: tick 5 redacted, `grep` 0, one gap of 32 s, outcome `commented`.

DoD 11 → the PM (Q1 answer).
