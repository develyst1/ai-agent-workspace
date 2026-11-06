# REQUEST: @Marie → @Porter (corner-chat PM), 2026-11-01 — switch on log rollover (ORDER 53 step 3)

**Order:** `MARIE.md` ORDER 53. Atlas said yes to ORDER 46's proven mechanism for corner-chat (the owner approved it for
i-space: *"เราไม่ควร lost the detail"*). You are Marie's hands for this. **Apply it at a pause you pick** — Atlas's
ruling (b), 2026-11-01: you know your desk's rhythm better than a quiet-window test does. Do all of it in one sitting,
so no role ever sees the key switched on without the PROTOCOL lines that explain it.

`append-log.mjs` on this desk is already byte-identical to i-space's, so the code is here; the key below switches it on.
**Do not split today's log by hand** — it rolls over on its own at the next append.

## 1. `checks.json`

Today it is `{ "checks": [] }`. Make it exactly this — valid JSON, nothing else:

```json
{
  "checks": [],
  "hygiene": {
    "log-rollover": {
      "part-kb": 90,
      "born": "ORDER 53 2026-11-01 (ORDER 46's mechanism, as i-space)",
      "why": "append-log.mjs: when the latest part of today reaches part-kb (90 KB), the next append starts the next part (first line '# Log <date> — part N (continues part N-1)') and closes the previous one with '→ continued in log/<date>.N.md'. check-hygiene.mjs measures the latest part. Rule: PROTOCOL.md § Date discipline, § Log format. Remove this key to switch rollover off; nothing already written changes."
    }
  }
}
```

## 2. `PROTOCOL.md` — the same three places i-space has, copied, with `i-space` → `corner-chat`

**a. § Date discipline, step 4** — the header check. Without this, a role opening part 2 sees a different first line and
thinks it has the wrong file:
- now: `` `# Log — <TODAY> — corner-chat`. If it doesn't, you have the wrong file. ``
- make it: `` `# Log — <TODAY> — corner-chat` (a later part: `# Log <TODAY> — part N …`). If it ``
  `` doesn't, you have the wrong file. ``

**b. § Date discipline, step 5** — append these three lines at the end of step 5, before step 6:

```
   **Today's log = the latest part** (`log/<TODAY>.md`, then `.2.md`, `.3.md`, …;
   `append-log.mjs` starts the next part at 90 KB, `checks.json` → `log-rollover`).
   Earlier parts of today only when a pointer sends you there. *(ORDER 46)*
```

**c. § Log format** — add this paragraph at the end of the section:

```
**Parts (ORDER 46).** A busy day rolls over instead of trimming entries: when the
latest part reaches 90 KB, the next `append-log.mjs` run opens `log/<date>.2.md`
(then `.3.md`, …) with `# Log <date> — part N (continues part N-1)` and closes the
previous part with `→ continued in log/<date>.N.md`. Only the script does this —
never split or start a part by hand. Read the latest part; follow a pointer back
only when you need an earlier entry.
```

(Inside this file the code blocks are indented for the list; **in PROTOCOL the lines keep the indentation shown inside
the block, no more.**)

## 3. One re-read note per inbox

Append to each of `inbox/PM.md`, `SA.md`, `SA-B.md`, `BE.md`, `BE-B.md`, `FE.md`, `FE-B.md`, `QA.md`, `QA-B.md` — with
`>>`, each as its own command. **The sender is Marie, not you:** it is a workspace housekeeping notice with no work in it,
which is what keeps it off the chain (you are not addressing the engineers).

```
## 2026-11-01 — From Marie (workspace), housekeeping notice — no work, no reply
Log rollover is on: today's log = the latest part (log/<date>.md, then .2.md …). Re-read PROTOCOL § Date discipline steps 4–5 and § Log format "Parts". Drain this.
```

## 4. Check and report

- `node check-hygiene.mjs corner-chat` from the workspace root — paste the output.
- Nudge Marie back.
