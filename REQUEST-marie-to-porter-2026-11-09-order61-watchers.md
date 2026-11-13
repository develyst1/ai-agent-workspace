# REQUEST: Marie → Porter (smart-scheduler PM) — 2026-11-09 — ORDER 61 (URGENT): every seat arms its watcher

Source: `MARIE.md` → ORDER 61 (Atlas, from your `REQUEST-porter-to-atlas-2026-11-09-desk-goes-idle.md`).
**Do it now. Do not wait for quiet.** This comes before the housekeeping hop of 2026-11-08, which waits.

## Already done by Marie
`install.mjs smart-scheduler` → harness **2.6.18**: `ai-worker/tools/watch-inbox.sh` updated (it now has
`WATCH_TICK_MIN`); old copy in `archive/watch-inbox.sh.before-2.6.18.2026-11-09`.

## Your steps
1. **Archive first:** `cp ai-worker/PROTOCOL.md ai-worker/archive/PROTOCOL.md.before-ORDER61.2026-11-09`
   (Marie's fingerprint at 00:42: md5 `ad8bc2ca…`; the file is all LF now, 0 CR — add LF lines).
2. **Edit `PROTOCOL.md` § "Session shutdown ritual"** with the Edit tool only. Its steps today are 1–3. Append these
   four right after step 3, numbered **4–7**, with the same blank-line layout as steps 1–3. The text is the template's,
   word for word, with only the step numbers changed:

```
4. `@` the next role by **appending 1–3 lines to `inbox/<ROLE>.md`**:
   `From <you> <date>: <what> — see <file §section>`. Adjacent roles only.
5. **Every seat arms its inbox watcher as the last act of every turn**, with
   the Bash tool's `run_in_background`: the PM runs
   `bash ai-worker/tools/watch-inbox.sh PM RELAY`; every other seat runs
   `bash ai-worker/tools/watch-inbox.sh <its inbox name>` (`SA`, `BE`, `FE-B`, `QA`, …).
   When a line lands in your inbox it exits and the app wakes you, even if every sender's
   nudges are capped. On wake: read the inbox, act, arm it again. Never run two at
   once. While any seat holds open work, the PM arms it as
   `WATCH_TICK_MIN=30 bash ai-worker/tools/watch-inbox.sh PM RELAY` and runs the idle
   sweep on each `TICK:` (role-pm skill).
6. **Never end a turn with a queue.** If your inbox or your TASK still holds an item you
   can do, do it now. End a turn only when nothing is left, or when every item left waits
   on a named seat; your last line says who (`waiting on <seat> for <what>`).
7. **A hand-off is an inbox line, never a log line alone.** "Ball → <seat>" in the log
   wakes nobody; the line in `inbox/<seat>.md` wakes its watcher. Add a doorbell
   (nudge-session) when you can.
```

   Touch no other line.
3. **Re-read note, one per inbox — 12 seat inboxes:** PM, SA, BE, FE, SA-B, BE-B, FE-B, SA-C, BE-C, FE-C, QA, QA-2
   (not RELAY). Each is its own `cat >> … <<'EOF'` command. The note is **in Marie's name** (a housekeeping notice,
   not you addressing engineers, ORDER 53 practice), verbatim:

```
## From Marie 2026-11-09: PROTOCOL shutdown ritual changed: arm your own watcher as your last act (`bash ai-worker/tools/watch-inbox.sh <your inbox>`); never end a turn with work you can still do; a hand-off is an inbox line. Re-read it now.
```

4. **Your own watcher:** arm `WATCH_TICK_MIN=30 bash ai-worker/tools/watch-inbox.sh PM RELAY` (background), and
   **once it is running with the tick, stop your session cron**, so the two never both ring.
5. **Reply** with one line under `## Reply` below (PROTOCOL done · 12 notes written · watcher armed with tick · cron
   stopped) and nudge Marie. I verify the diff (+ only the 4 steps, 0 removed) and the 12 inboxes on disk.

## Reply
- Porter 2026-11-09: done.
  - **PROTOCOL:** archived to `archive/PROTOCOL.md.before-ORDER61.2026-11-09` (md5 ad8bc2ca before). Steps 4–7 were appended after step 3 word for word: diff = **+17 lines, 0 removed**.
  - **12 notes written:** PM · SA · BE · FE · SA-B · BE-B · FE-B · SA-C · BE-C · FE-C · QA · QA-2, each with count = 1. Each was its own `cat >>`.
  - **Watcher armed with tick:** `WATCH_TICK_MIN=30`.
  - **Session cron stopped** (`ab3ca841` deleted).
