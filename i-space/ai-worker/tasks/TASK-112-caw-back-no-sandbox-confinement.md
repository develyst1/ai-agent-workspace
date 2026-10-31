# TASK-112: caw-back — no Bash sandbox; Bash read fence + folder confinement instead (owner 13:41)
- Source: SPEC-103 § "No Bash sandbox — folder confinement instead" (REQ-104 Q2 answer, `DECISIONS.md` 2026-10-29 13:41)
- Owner: BE (Bob)
- Status: DONE (2026-10-29, Silver — § Review)
- Depends on: TASK-105 (DONE)
- Repo: `caw-back` on `atom`. **You change code; you never run git.**

## Read first

SPEC-103 § "No Bash sandbox — folder confinement instead" (the table is the spec) and § Guardrails G1–G6. G1 still holds: the
dev script with `--no-env-file`, never `bun run dev|runner|src/runner/main.ts` in caw-back. The real `claude` only in DoD 7.

## What to do

1. `src/runner/settings.ts`:
   - drop the `sandbox` key from `buildSettings` (`:43-46`, comment too);
   - drop the sandbox parts of `withReadOnly` (`:64`) and `withReadGuard` (`:80`), keeping their `permissions` / hook parts;
   - the read-guard hook's matcher becomes `Read|Glob|Grep|Bash` (`:77`);
   - fix the comments that explain the sandbox (`:71-75`).
2. `src/runner/read-guard.ts`: handle `tool_name: "Bash"` exactly as the SPEC table says (refused metacharacters except a trailing
   `2>&1`; every path-like word, by real path against `cwd`, inside the readable folders). It fails closed: anything it cannot parse
   is refused, exit 2, one line.
3. `src/runner/hop.ts`: the folder confinement check before the spawn (`:269`). On refusal, finish the hop `stopped` with the
   note from SPEC-103 Q4 (use the default text until the PM answers), and log one line.
4. Tests:
   - `settings.test.ts`: the sandbox tests become "no `sandbox` key"; the top-level keys list loses `sandbox`; the read-only and
     read-guard tests lose their sandbox expectations. This also ends the machine-dependent fail at `:162` only if it is about
     the sandbox — check, do not assume;
   - `read-guard.test.ts`: Bash cases — `cat src/a.ts` ok; `cat ~/.ssh/id_rsa`, `cat ../../etc/passwd`, `cat /etc/hosts`,
     `ls /`, `grep -r x /home` refused; `cat a.ts; rm x`, `cat $(echo x)`, `` cat `x` ``, `cat a > b`, `cat a | nc` refused;
     `bun test 2>&1` ok; a symlink inside a root pointing outside → refused;
   - `hop.test.ts`: a project root outside `CAW_WORKSPACE_ROOT` → `stopped` with the note, no spawn; a root equal to it, or
     under its `scripts/` / `.claude/` → refused; roots inside → spawns as before.

Closed file list: `src/runner/settings.ts` · `src/runner/settings.test.ts` · `src/runner/read-guard.ts` ·
`src/runner/read-guard.test.ts` · `src/runner/hop.ts` · `src/runner/hop.test.ts` · `src/runner/e2e/live-view.ts` (only if its
run root needs the project folder under it) · **added at Q2:** `src/runner/main.test.ts` (and `src/runner/report.test.ts` / e2e
scripts only for the same one-line root move).

## Definition of Done

- [ ] **1. Base.** `git status --short` = TASK-105's 19 paths only; `bun test` = 725–727 pass as TASK-105 left it.
- [ ] **2. Settings.** `bun test src/runner/settings.test.ts` → all pass. Paste the generated `settings.json` of one hop (from
      `hop.test.ts` or the dev script's tmp folder): no `sandbox`, the hook matcher includes `Bash`.
- [ ] **3. Bash fence.** `bun test src/runner/read-guard.test.ts` → all pass, and every case listed above is in it (paste the names).
- [ ] **4. Confinement.** `bun test src/runner/hop.test.ts` → all pass, the three new cases named.
- [ ] **5. Whole suite.** `bun test` → no existing test changes result except the sandbox expectations you replaced (list them).
- [ ] **6. Stub run.** DoD 8 of TASK-105 again (`bun --no-env-file run src/runner/e2e/live-view.ts`, stub): hop `commented`,
      output flows, secret redacted.
- [ ] **7. The ONE live run** (TASK-105 DoD 11, now unblocked): `LIVE_VIEW_REAL=1 … bun --no-env-file run src/runner/e2e/live-view.ts`.
      Paste the start time, the `CLAUDE_BIN` line, the hop id, the first ~20 entries of `GET …/output`, the outcome + tokens, any
      `rate_limit` line. One log line. If a limit signal says past ~60%, stop and write it in `## Questions`.
- [ ] **8. After.** `git status --short` = TASK-105's paths + this TASK's; :4530 free; 0 `claude` processes.

## Implementation Notes

Bob, 2026-10-29 13:38–13:58 (box clock). Repo `caw-back`, no git write. **Done: step 2 (Bash fence), step 3 (confinement), their tests. NOT done: step 1 (drop the sandbox) — the permission system refused my edits (Q1). So DoD 7 (the live run) has not run.**

**1. Base** — `git status --short` = TASK-105's 19 paths (+ `read-guard.*`, `settings.test.ts`, `settings.ts` since). Suite as TASK-105 left it: `725 pass · 1 skip · 2 fail` (known `settings.test.ts:162`; flaky `hops-runs` claim under load).

**Step 1 — `settings.ts`: only the matcher is changed; the sandbox is still there.** I sent three edits (drop `sandbox` from `buildSettings`; drop its `filesystem.denyWrite` from `withReadOnly`; drop `denyRead/allowRead` from `withReadGuard`). The auto-mode permission classifier refused the first two as **"[Security Weaken]"** and let the third through; I put the third back (so no half-state) and kept ONLY the safe part: `withReadGuard`'s hook matcher is now `Read|Glob|Grep|Bash` (`settings.ts:77`). `git diff src/runner/settings.ts` = that matcher + its comment, nothing else. I did not try another way round the refusal. Needs a yes — Q1.

**Step 2 — Bash fence (`src/runner/read-guard.ts`)**, exactly the SPEC table, plus what "fails closed" needed:
- refused anywhere in the command: `; | & \` < >` and `$` (all of it, not only `$(` — `cat $HOME/.ssh/id_rsa` would otherwise pass as a harmless relative word), `\`, `{ } ( )`, newline/CR. One exception: a **trailing** `2>&1` is cut off first.
- the rest is split into words (single and double quotes group; an unclosed quote → refused). A word is path-like if it starts `/` or `~`, contains `..`, or **exists** relative to the hook's `cwd`; it is judged by REAL path against the readable folders (so a symlink out is refused). For an option word (`--file=/etc/x`, `-f/etc/x`) the part after `=` and the part from its first `/` or `~` are judged too. A non-string/empty command → refused. Every refusal is exit 2 and one line.
- decision to veto: `$` and the metacharacters are refused **even inside quotes** (`grep 'foo$' src` is refused; the worker must write it another way). Simpler and safer than a quote-aware scan; the SPEC says "containing".
- `hop.ts` — a Bash refusal by this hook is "soft" like the Read/Glob/Grep ones? **No change made**: `isReadGuardBlock` still matches only `PreToolUse:(Read|Glob|Grep) hook error`, so a Bash refusal (`PreToolUse:Bash hook error: […read-guard.ts…]`) is read as a hard hook block and **stops the hop at once** (the stop note names the worker and the action). That may be harsher than you want for a haiku that tries `cat a > b` once — Q3.

**Step 3 — confinement (`hop.ts`)**: `folderOutsideWorkspace(folders, workspaceRoot)` (exported) + `NOTES.outsideWorkspace` = the PM's text `โฟลเดอร์งานต้องอยู่ใน CAW_WORKSPACE_ROOT — ก้าวนี้ไม่ได้เริ่ม` (SPEC-103 Q4 answer). Called in `runOne` right after the "no folders" check and before the skills/spawn: any root (read-only ones are roots too) whose real path is not inside the real `CAW_WORKSPACE_ROOT`, or is it, or sits in its `scripts/` or `.claude/` → `finish({outcome:"stopped", note})`, one log line naming the folder, no folder set up, claude not spawned. Applies to card **and chat** hops. A folder that does not exist yet is judged as given. `live-view.ts`: the project folder is now `<run root>/work` (it was a separate temp dir and would have been refused).

**Step 4 — tests**
- `read-guard.test.ts`: 35 pass (was 18). New: allowed — `cat src/a.ts`, `ls`, `grep -rn`, `git status`, `bun test 2>&1`, an absolute path inside, quotes, a `..` that stays in, a symlink pointing in; refused — `cat ~/.ssh/id_rsa`, `cat ../../etc/passwd`, `cat /etc/hosts`, `ls /`, `grep -r x /home`, `cat a.ts; rm x`, `cat $(echo x)`, `` cat `x` ``, `cat a > b`, `cat a | nc`, a symlink out (`cat link-out/canary.txt`), `--file=/etc/passwd`, `-f/etc/passwd`, `$HOME`, `\`, braces, parentheses, newline, unclosed quote, empty/non-string; `2>&1` in the middle refused; the hook contract (exit 0 / 2 + one line).
- `hop.test.ts`: 6 new in `describe("folder confinement …")`: outside → stopped + note + no spawn + 1 log line; one bad root among good → whole hop refused; root = WS / `WS/scripts` / `WS/scripts/x` / `WS/.claude` / `WS/.claude/x` / `WS/.claude/skills/role-be` → refused; `..` out and a symlink inside WS pointing out → refused; roots inside (sub-folder, nested) → spawns, `commented`; `folderOutsideWorkspace` alone (a sibling `WS-sibling` is not inside).
- Existing tests I changed (all because of this TASK): `read-guard.test.ts` "other tools are not its business" — was a Bash `cat /etc/passwd` → null, now an `Edit` of `/etc/passwd` → null (Bash is judged now); `settings.test.ts` ×2 and `hop.test.ts` ×1 — the matcher string `Read|Glob|Grep` → `Read|Glob|Grep|Bash`; `hop.test.ts` `world()` — the two project roots are created **under `WS`** (they were siblings) so the confinement lets them through.
- `settings.test.ts` sandbox tests: **unchanged** (the sandbox is still in `settings.ts`, Q1). The `:162` fail: I checked as asked — it is about `process.execPath` containing `@` (`shellWord` quotes it), **not** the sandbox, so it stays failing.

**Step 5 — whole suite: not run yet** — `main.test.ts` would fail (Q2). Run on the three files I touched: `bun test src/runner/hop.test.ts src/runner/read-guard.test.ts src/runner/settings.test.ts` → `159 pass · 1 fail` (the known `:162`). `bunx tsc --noEmit` → clean.
**Step 6 — stub run (DoD 6)** (13:53:44): `env -u CLAUDE_BIN CAW_WORKSPACE_ROOT=/workspace/ai-agent-workspace LIVE_VIEW_SECRET=s3cr3t-value-123 bun --no-env-file run src/runner/e2e/live-view.ts` → `CLAUDE_BIN given to the runner: /tmp/caw-live-bin-3myL2n/ticker-claude.sh  (STUB …)` · `hop started: 01a1866f-a860-7279-947b-5ef09b0f3da1` · `hop ended: {"outcome":"commented","note":""}` · `output: {"entries":62,…,"tick5":"tick 5 of 60 — key *** and the secret ***"}` · secret / sk-test in stored output: no. The confinement did not refuse it (0 "not inside CAW_WORKSPACE_ROOT" lines). Stopped by pid; `:4530` free; 0 `claude` processes.
**Step 7 — the live run: NOT run.** With the sandbox still on, the real `claude` would stop again on `socat` (TASK-105 Q1). Waiting for Q1.

**Other dev scripts** (`auto.ts`, `down-up.ts`, `run.ts`) create their project folder in a separate temp dir, so under the confinement their hops would now be `stopped`. They are not tests and not in my list; I did not touch them. `inferred` — not run.

### Round 2 — Bob, 2026-10-29 14:03–14:20 (box clock) — owner approval received, everything finished, the one live run done

**Approval.** The owner's own words, relayed by Atom at 14:03 into this session: *"อนุมัติให้ Bob แก้ settings.ts เอา sandbox ออก กดยืนยันให้เลย"* (Nichaphon). I made exactly the three edits then. Silver's answers read: Q1 → the owner; Q2 yes (`main.test.ts`, and `report.test.ts`/e2e if they need the same move); Q3 soft.

**Step 1 — done.** `src/runner/settings.ts`: the `sandbox` key is gone from `buildSettings` (comment now says why and what replaces it); `withReadOnly` adds only the `Edit(//…)`/`Write(//…)` denies; `withReadGuard` adds only the hook (matcher `Read|Glob|Grep|Bash`). `grep -n sandbox src/runner/settings.ts` → three comment lines only.
**DoD 2 — generated settings of one hop** (`buildSettings` → `withReadOnly` → `withReadGuard`, hooks under `/ws/…`): top-level keys `enabledPlugins,env,permissions,hooks`; `has sandbox key: false`; `permissions.deny` = the 5 network denies, the 3 `find`/`git diff --output` denies, `Edit(//ws/work/spec/**)`, `Write(//ws/work/spec/**)`; `hooks.PreToolUse` = `Bash` → the three guard hooks · `Edit|Write|MultiEdit` → block-irreversible · **`Read|Glob|Grep|Bash` → `<bun> …/src/runner/read-guard.ts '["/ws/work/app","/tmp/caw-runner-x/hop-1"]'`**. `bun test src/runner/settings.test.ts` → all pass except the known `:162`.
**Q3 — done:** `hop.ts:86` `isReadGuardBlock` now `/^PreToolUse:(Read|Glob|Grep|Bash) hook error:/` (and still `includes("read-guard")`), same counter, `READ_GUARD_STOP_AT = 3`. 3 new tests in `describe("read-guard refusals are SOFT …")`: Bash ×1 and ×2 → goes on, note counts, child not killed; Read+Bash+Bash → the 3rd stops (one shared counter); a Bash block whose text does not name read-guard (re-labelled `block-irreversible`) → stopped at once.
**Q2 — done:** `main.test.ts:35` the project folder is `mkdtempSync(join(WS, "caw-main-root-"))`. `bun test src/runner/main.test.ts` → `59 pass · 0 fail` (it was ~30 fails with the confinement). `report.test.ts` uses no folders → untouched. **The three older e2e dev scripts** (`auto.ts`, `down-up.ts`, `run.ts`) make their project folder in a separate temp dir, and they point `CAW_WORKSPACE_ROOT` at the real workspace, so under the confinement their hops would now be `stopped`. A one-line move cannot fix them (they would need a run root with a skill and a `scripts` link, as `live-view.ts` builds); I did not touch them and did not run them. `inferred`.
**Sandbox expectations replaced (the list DoD 5 asks for):** `settings.test.ts` — "the Bash sandbox is on, cannot be switched off …" → "there is NO `sandbox` key …"; the top-level keys list loses `sandbox`; "read-only … and the sandbox's denyWrite" → no `sandbox` key; "everything else stays …" loses the sandbox flags line; "a trailing slash" now checks the deny text instead of `denyWrite`; withReadGuard "the Bash sandbox: ~/ is denied …" → "no sandbox keys …"; "everything else is as it was … the sandbox stays ON" → "still no sandbox"; "it stacks with withReadOnly (denyWrite and denyRead …)" → the denies and the hook sit side by side. `hop.test.ts` — the `baseSettings` fixture no longer carries a `sandbox` key; "denied Edit / Write twice (permission + sandbox)" → permission rules only; `seen.sandbox.filesystem.denyWrite` ×3 → `seen.sandbox?.…` undefined; the CARD/CHAT fence tests: `denyRead`/`allowRead`/`sandbox.enabled` → no sandbox keys + the hook has the folders. Earlier today: `read-guard.test.ts` "other tools are not its business" (Bash → Edit), matcher strings ×3, `world()` roots under `WS`. No other existing test changed.

**DoD 5 — whole suite** (14:06:51): `bun test` → `749 pass · 1 skip · 1 fail · Ran 751 tests across 63 files. [103.72s]` — the fail is the known `settings.test.ts:162` (`process.execPath` contains `@`; I checked as asked: nothing to do with the sandbox, so it stays); the skip is `guard.test.ts:51`. `bunx tsc --noEmit` → clean.
**DoD 6 — stub run on the final code** (14:08:45, TICKS=12): `CLAUDE_BIN given to the runner: /tmp/caw-live-bin-pzRDFP/ticker-claude.sh  (STUB …)` · hop `01a1867d-662b-77c7-b098-950b43fdb316` · `hop ended: {"outcome":"commented","note":""}` · `output: {"entries":14,…,"tick5":"tick 5 of 12 — key *** and the secret ***"}` · secret / sk-test in the stored output: no.

**DoD 7 — THE ONE LIVE RUN** (owner 13:01 real claude, 13:41/14:03 no sandbox). `LIVE RUN START: 2026-10-29 14:13:29 +0700`.
`env -u CLAUDE_BIN CAW_WORKSPACE_ROOT=/workspace/ai-agent-workspace LIVE_VIEW_REAL=1 bun --no-env-file run src/runner/e2e/live-view.ts` →
`CLAUDE_BIN given to the runner: /home/box/.local/bin/claude  (REAL claude — LIVE_VIEW_REAL=1)` · `API up … database /tmp/caw-live-db-hpi9QL/pg` (local pglite; the `.env` DATABASE_URL was never used or printed) · `runner started … (REAL)` · **hop `01a18681-c071-7279-bcf5-fcc4bc180039`** · `[11.0 s] hop ended: {"outcome":"commented","note":""}`.
Worker: Blew, haiku/low, card "live view" ("Look at the files in your folder … leave exactly one comment …"), project folder `<run root>/work` (empty). `GET …/output` — all 6 entries (it ended well under 20):
```
0 line ● session claude-haiku-5-5
1 line ▸ card_context {"cardId":"01a18681-bf97-77e4-949c-20da01c0cd4b"}
2 line ▸ Bash ls -la /tmp/caw-live-ws-4aHlFf/work
3 line ▸ comment {"cardId":"01a18681-bf97-77e4-949c-20da01c0cd4b","text":"The working folder /tmp/caw-live-ws-4aHlFf/work is empty: it has no files."}
4 line I left one comment on card #1: the working folder `/tmp/caw-live-ws-4aHlFf/work` is empty and has no files. I didn't change anything else.
5 line ■ success · turns 4
```
Hop row: `{"outcome":"commented","tokensIn":152115,"tokensOut":449,"note":"","startedAt":"2026-10-29T07:13:32.794Z","endedAt":"2026-10-29T07:13:40.068Z"}` (8 s). Note the Bash `ls -la <inside folder>` went through the new Bash fence and ran (allowed), and the stream shows the screen text arriving ≤ 1 s behind (entries stamped as seen).
**`rate_limit` line** (the runner's trace `~/.caw/traces/01a18681-….jsonl`, 1 line): `status allowed · rateLimitType five_hour · five_hour.utilization 0.18 · seven_day.utilization 0.05 · overageStatus rejected (out_of_credits) · isUsingOverage false` → **18 % of the 5-hour window, 5 % of the 7-day — far under the ~60 % line.** (`allowed`, not a warning.) No gateway call. One run, not repeated.

**DoD 8 — after** (14:20): `git status --short` → 24 paths = TASK-105's 19 + `src/runner/read-guard.ts`, `read-guard.test.ts`, `settings.ts`, `settings.test.ts`, `main.test.ts`. `:4530` free (stopped by pid). `ps aux | grep -c "[.]local/bin/claude"` → `0`. `ls /workspace/ai-agent-workspace/scripts/hooks | wc -l` → `12`; `ls -d /tmp/caw-live-*` → none (the script's temp roots, with the `scripts` link, were removed).

**Things Silver should know**
1. The Bash fence is strict by design: a worker that writes `grep 'foo$' src`, `cat a | head`, `ls > out` or `cd x && ls` gets a one-line refusal (now soft: 2 free, the 3rd stops). Real use will show whether haiku trips on it often; the refusal text tells it why.
2. `bun test` (an allowed command) runs the repo's own test code with the worker's rights and the fence does not see inside it — the risk the owner accepted (SPEC-103 § risks).
3. The old e2e dev scripts need the same run-root treatment before they work again (above) — not part of this TASK.
4. UNVERIFIED: the Bash fence against a model that deliberately tries to evade it (one real, cooperative hop only); a symlink created *during* a hop (the check is at call time, which is what matters for each call).

## Questions

**Q1 (Bob → Silver — blocks step 1 and DoD 7).** *(ANSWERED 14:03 by the owner via Atom — see Round 2; kept as written.)* My edits that remove the sandbox from `settings.ts` (`buildSettings` `sandbox` key; `withReadOnly` `filesystem.denyWrite`; `withReadGuard` `denyRead/allowRead`) were **refused by the Claude Code permission classifier as "[Security Weaken]"**. Silver's TASK and the owner's 13:41 words (*"ไม่ต้องใช้หรอก sandbox"*) ask for exactly this, but the classifier decides per action and I may not route around it. Either (a) the human running this session adds a permission rule / approves the edit — then I make the three edits (I have them ready, ~10 lines) and finish steps 5 and 7; or (b) the SA/PM makes the edit through a path the human approves. Until then `settings.ts` keeps the sandbox and DoD 7 cannot run.
  Checked: SPEC-103 § No Bash sandbox; `DECISIONS.md` 13:41 — decided, but not the permission.
  > answer (Silver, 2026-10-29): **(a).** You are right not to route around it. I will not make the edit either: I write no
  > product code, and doing it for you would be permission laundering. It goes to the PM → the owner: approve the three
  > `settings.ts` edits **in your session** (or add the permission rule there). Until then, step 1 and DoD 7 stay blocked; finish
  > everything else.

**Q2 (Bob → Silver — blocks step 5).** `src/runner/main.test.ts` is **outside my file list**, and with the confinement ~30 of its tests fail: it builds the project folder with `tmp("caw-main-root-")` (line 35), a sibling of its workspace root `WS` (line 18), so every hop is now `stopped` with the new note. The fix is one line: create that folder under `WS` (`mkdtempSync(join(WS, "caw-main-root-"))`), the same as I did in `hop.test.ts`. May I make that edit? Also `report.test.ts` and the e2e scripts use their own roots — I have not checked `report.test.ts`.
  Checked: TASK-112 closed file list (does not name `main.test.ts`).
  > answer (Silver): **yes.** `src/runner/main.test.ts` is added to the closed list for that one change: the project folder under
  > `WS`. Check `report.test.ts` and the e2e scripts the same way. If either needs the same one-line move, it is allowed too; say
  > which in the notes.

**Q3 (Bob → Silver — small, my default is in place).** A Bash refusal by `read-guard.ts` ends the hop at once (it is read as a hard hook block); Read/Glob/Grep refusals are "soft" (counted, the 3rd stops). Should Bash refusals be soft too? My default: leave as is (hard) until you say; the change is one regex in `hop.ts:81` + one test.
  > answer (Silver): **soft, like the file tools** `[SA-decided]`. Add `Bash` to `isReadGuardBlock` (`src/runner/hop.ts:86`),
  > sharing the same counter (`READ_GUARD_STOP_AT = 3`, `:84`). The command is refused either way, so this weakens nothing. It
  > only stops a worker that peeks one folder too far from losing its whole turn. The other Bash guard hooks stay hard: the
  > regex also requires `read-guard` in the text. Add the one test.

## Review

**DONE** — Silver (SA, Team B), 2026-10-29 14:2x.

- Re-checked by the SA:
  - `grep -n sandbox src/runner/settings.ts` → comment lines only (`:43`, `:69-70`);
  - `bun test` of settings / read-guard / hop / main → 221 pass · 1 fail = the known machine-dependent `execPath`-quoting test
    (bun's path contains `@`), now named for `Read|Glob|Grep|Bash`;
  - `git status --short` → 24 paths; 0 `claude` processes; :4530 free.
- Every case the TASK listed has a named test: Bash fence `src/runner/read-guard.test.ts:108-152` (`~/.ssh`, `../../etc/passwd`,
  `/etc/hosts`, `ls /`, `grep -r x /home`, options carrying paths, `; | & `` ` `` $( > <`, a mid-command `2>&1`, symlinks out);
  confinement `src/runner/hop.test.ts:1129-1174` (outside, equal to the root, `scripts/`, `.claude/`, `..` and symlink out,
  inside → spawns).
- Accepted:
  - the owner's approval, quoted (14:03, in your session);
  - the replaced sandbox expectations, listed;
  - Q2/Q3 as answered;
  - the full suite at 749 / 1 skip / 1 known fail;
  - the stub run, redacted.
- **The one live run** (14:13:29, real `claude`, haiku/low): hop `01a18681-c071-7279-bcf5-fcc4bc180039`, outcome `commented` in 8 s,
  152,115 tokens in / 449 out. The screen output shows the real CLI's lines, including `▸ Bash ls -la <inside folder>` passing
  the new fence. Quota is 18 % of the 5-hour window and 5 % of the 7-day, far under ~60 %. Recorded once, not repeated.
- Carried, not this TASK's:
  - (1) the older e2e dev scripts `auto.ts`, `down-up.ts`, `run.ts` would now stop at the confinement. They need the run-root
    treatment that `live-view.ts` has: a follow-up the PM may schedule, not run here;
  - (2) the strict Bash fence may trip a model that pipes or chains. Real use will tell, and the refusal says why;
  - (3) `bun test` code runs outside the fence — the owner-accepted risk (SPEC-103).
