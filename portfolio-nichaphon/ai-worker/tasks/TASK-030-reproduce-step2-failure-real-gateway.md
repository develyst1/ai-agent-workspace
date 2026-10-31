# TASK-030: Reproduce the step-2 failure on the real gateway, with the malformed-reason log on
- Source: SPEC-009 (§R2, D4; ledger rows 1–15)
- Status: **DONE** (2026-11-01, Sober — see §Review. Was REVIEW 2026-11-01, Fern: NOT REPRODUCED in 3; one malformed attempt at ct=1024/bad_json; 10 real calls)
- Reading note (TASK-029 review): a reply truncated before any `}` logs `reason=no_json`, not `bad_json` — read the `tokens=` with it (SPEC-009 §R2 H1).
- Depends on: TASK-029 `DONE`
- Owner: Fern (FE)

**This task spends the owner's money: cap 15 real calls, ledger SPEC-009 rows 1–15 (written by Sober 2026-11-01).**
No code change. No git write. Nothing under `back/knowledge/` edited.

## What to do

1. Confirm SPEC-009 §Call ledger shows rows 1–15 for this task. Confirm 4014 is free (or use `PORT=4099` and pass
   `ASK_WS_URL` to `ws-client` — your choice, write it down).
2. `cd back && bun run dev 2>&1 | tee ../../<scratch outside the repo>/task030-back.log` with **no** `GATEWAY_BASE_URL` and
   **no** `KNOWLEDGE_DIR` set (defaults = real gateway, real knowledge). `curl -s localhost:<port>/health` →
   `knowledge.profile:true, projects:true` before any press.
3. Press = `bun run ws-client "Which databases have you worked with?"` (exact text — the chip Porter saw fail).
   **One press, read the frames, then decide:** `step_malformed` → **stop, you are done firing**. A normal `answer` →
   press again. **Never more than 3 presses.** Any other error (quota, unreachable, timeout) → stop, that is the result.
4. Stop `back/`. Copy the log and every press's frames to `../project-docs/fe-task030-2026-11-01/` (frames and `[chain]`
   lines only — they contain no prompt; the answer text in the frames is fine there).

## Definition of Done

- [ ] 1. `/health` line pasted (profile + projects true), and the port used.
- [ ] 2. Per press: the `[chain]` lines verbatim (`step … ok`, any `malformed`, `end`/`fail`) and the `calls=` count.
- [ ] 3. Total calls fired = sum of `calls=`; ≤ 15. State it in one line for the ledger.
- [ ] 4. If reproduced: the two `malformed … reason=` lines quoted, and which SPEC-009 H1–H5 row's prediction they match
      (or "none — new"). **Do not propose or make a fix.** If not reproduced in 3 presses: say `NOT REPRODUCED in 3`.
- [ ] 5. `git status --short` → unchanged from TASK-029's end state; `back/` stopped, port free.

## Implementation Notes
(Fern, 2026-11-01.) No code change, no git write, nothing under `back/knowledge/` edited.

**Before firing:** SPEC-009 §Call ledger has the `1–15 | 2026-11-01 | Fern (TASK-030)` row. 4014 was free (`netstat`: no listener), so I used the
default port **4014** with no `PORT`, no `ASK_WS_URL`, no `GATEWAY_BASE_URL`, no `KNOWLEDGE_DIR`, and no `back/.env` exists.
`bun run dev` start line: `[back] portfolio-back 0.1.0 listening on http://localhost:4014 (ws://localhost:4014/ws) — gateway https://ai.develyst.online`.

**DoD 1:** `curl -s localhost:4014/health` → `{"ok":true,"service":"portfolio-back","version":"0.1.0","knowledge":{"profile":true,"projects":true}}` · port 4014.

**DoD 2: three presses, each `bun run ws-client "Which databases have you worked with?"`**
- Press 1 → `answer`, coverage covered, 6 citations, `calls=3`:
  `[chain] id=d9fdfdde-… step=1 ok provider=deepseek model=deepseek-flash tokens=298/109/407 latency_ms=1111 wall_ms=1454 retried=0 len=186`
  `[chain] id=d9fdfdde-… step=2 ok provider=deepseek model=deepseek-flash tokens=3575/471/4046 latency_ms=2775 wall_ms=2884 retried=0 len=1032`
  `[chain] id=d9fdfdde-… step=3 ok provider=deepseek model=deepseek-flash tokens=524/126/650 latency_ms=1521 wall_ms=1579 retried=0 len=400`
  `[chain] id=d9fdfdde-… end coverage=covered calls=3 wall_ms=5920`
- Press 2 → `answer`, `calls=3`:
  `[chain] id=d266d0b5-… step=1 ok provider=deepseek model=deepseek-flash tokens=298/118/416 latency_ms=1104 wall_ms=1174 retried=0 len=188`
  `[chain] id=d266d0b5-… step=2 ok provider=deepseek model=deepseek-flash tokens=3574/917/4491 latency_ms=4758 wall_ms=4817 retried=0 len=1060`
  `[chain] id=d266d0b5-… step=3 ok provider=deepseek model=deepseek-flash tokens=538/140/678 latency_ms=1559 wall_ms=1616 retried=0 len=579`
  `[chain] id=d266d0b5-… end coverage=covered calls=3 wall_ms=7609`
- Press 3 → `answer` (the visitor saw no error), `calls=4`. **Step 2 attempt 1 was malformed and the retry succeeded:**
  `[chain] id=9ba1e354-… step=1 ok provider=deepseek model=deepseek-flash tokens=298/116/414 latency_ms=1383 wall_ms=1430 retried=0 len=172`
  `[chain] id=9ba1e354-… step=2 malformed attempt=1 provider=deepseek model=deepseek-flash tokens=3572/1024/4596 len=1091 reason=bad_json`
  `[chain] id=9ba1e354-… step=2 ok provider=deepseek model=deepseek-flash tokens=3572/796/4368 latency_ms=4105 wall_ms=4190 retried=1 len=1122`
  `[chain] id=9ba1e354-… step=3 ok provider=deepseek model=deepseek-flash tokens=520/143/663 latency_ms=1521 wall_ms=1586 retried=0 len=474`
  `[chain] id=9ba1e354-… end coverage=covered calls=4 wall_ms=12692`

**DoD 3, for the ledger:** **10 real calls fired** (3 + 3 + 4), ≤ 15 · 3 presses · 5 of the 15-call allocation unspent.

**DoD 4: `NOT REPRODUCED in 3`.** No `step_malformed` happened: the visitor-facing failure needs two malformed step-2 replies in a row,
and I saw only one. **That one malformed attempt is quoted above:** `reason=bad_json` with `completion_tokens=1024`, which is exactly
step 2's `max_tokens`. That matches **H1's prediction** (ct at the cap, `bad_json`). It does not match H2 (no `match:` reason), H3 (ct is not well under 1024),
H4 (`provider=deepseek` on every line) or H5 (not `no_json`, and len 1091 is not small). Step 2's completion tokens across the 4 step-2 replies: 471 · 917 · **1024 (cut)** · 796.
This is one observation. It is not a proven cause of Porter's two-in-a-row failure. I have no fix to propose.

**DoD 5:** `git status --short` → same 8 ` M` + `?? back/test/language.test.ts` as at TASK-029's end. I stopped `back/` (bun PID 30284); `netstat` shows no listener on 4014.

**Evidence copied** to `../project-docs/fe-task030-2026-11-01/`: `back-chain-lines.log` (the `[back]` start line + 13 `[chain]` lines),
`press1-frames.jsonl`, `press2-frames.jsonl`, `press3-frames.jsonl` (frames only, no prompt: `grep -il "STEP:"` → no file).

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review

**Verdict: DONE** (Sober, 2026-11-01). Fired nothing in review.
- Evidence checked on disk: `../project-docs/fe-task030-2026-11-01/` holds the 4 files named; `back-chain-lines.log` has 13 `[chain]`
  lines, one `malformed` (press 3, step 2, attempt 1, `tokens=3572/1024/4596 len=1091 reason=bad_json`), three `end` lines with
  `calls=3/3/4` → **10 real calls**, inside the 15 cap. Stopped at 3 presses as written; no fix proposed. Tree unchanged.
- Reading: `NOT REPRODUCED in 3` is the honest result for the two-in-a-row failure. The one malformed attempt matches **H1**
  (`bad_json` at exactly step 2's `max_tokens` 1024) and rules out H2–H5 for that attempt.
- **New, mine, inferred (not proven):** step 2's reply *length* barely moved (1032 · 1060 · 1091 · 1122 chars) while its
  `completion_tokens` swung 471 · 917 · 1024(cut) · 796. Content alone cannot explain that spread; the most likely reading is that
  the model spends a varying number of hidden reasoning tokens inside the same `max_tokens` budget. What would settle it: the
  gateway reporting reasoning tokens separately (it does not today). Either way the remedy is the same — headroom — so TASK-031 is cut.
- Ledger: rows 1–10 filled at actual 10; rows 11–15 released (SPEC-009 §Call ledger).
