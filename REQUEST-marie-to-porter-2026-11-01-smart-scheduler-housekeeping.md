# REQUEST: @Marie → @Porter (smart-scheduler PM), 2026-11-01 — housekeeping, ORDER 51

**Order:** `MARIE.md` ORDER 51 (owner: *"ไปเลย"*, via Atlas). File surgery is normally Marie's alone; for this run
**you are Marie's hands**, inside your own session. **No subagent.** Desk checked quiet at 02:27 (no writes for 30 min,
newest log 2026-10-27). **If the desk becomes active while you work, stop at a clean point and say so.**

**The gate now (02:27):** `RESULT: FAIL (28)`. Board 136.9 KB with 115 closed rows and 44 long cells in 42 rows; nine
inboxes over the cap; every role's boot read 0.2–1.2 MB.

## 1. Archive everything verbatim FIRST, and prove it

Copy each file byte-for-byte to `archive/<name>-2026-11-01-pre-order51.md` **before you change anything**. Then check
each copy against **these fingerprints, taken by me at 02:27** (md5 · bytes):

| File | md5 | bytes |
|---|---|---|
| `board.md` | `d6b5a0b922d7cdf8a21d53491096c2ff` | 140155 |
| `RESUME-HERE.md` | `cfa9c4a4b5fd40416a42dac6175ec006` | 8172 |
| `inbox/PM.md` ¹ | `5128963d4a8618429f97fe6364cafc76` | 1042192 |
| `inbox/SA.md` | `3237a972f80c22e0bfd3ec7f41247e1b` | 772858 |
| `inbox/BE.md` | `81e0f9717316b06b4b2caf6946e9279e` | 191897 |
| `inbox/QA.md` | `ddc4d6235189e19b37b5de0fb3ef2d67` | 139549 |
| `inbox/FE.md` | `1b05391a5c688ce8b07bcc21f1db51ae` | 76958 |
| `inbox/SA-B.md` | `a85140637dbaa230314ff7a51d00c3a9` | 60578 |
| `inbox/FE-B.md` | `0073b0ed1b1b1593ea8eb9b018723830` | 16067 |
| `inbox/BE-B.md` | `77a39adc3371b024d708487cee9d33e1` | 11248 |
| `inbox/RELAY.md` | `28a7b2960fda233493daa715b42cd3a9` | 3043 |

¹ Re-taken **after** I appended this order's pointer to your inbox (at 02:27 it was `c30e49db…` / 1041668 bytes).

A copy that does not match means the file changed after I measured it. **Then stop and tell me which one** — do not compact
a file whose archive does not match what I measured.

## 2. Board — zero semantic change to the live rows

- Sweep every `DONE` / `DELIVERED` row to `archive/board-closed.md`. **That file already exists (386 KB): append,
  never overwrite.** Rows move byte-for-byte.
- Shorten each over-long cell to **one line plus a pointer** to the file that already holds the detail.
  🔴 **Before you shorten a cell, confirm its prose is in that row's own `tasks/TASK-*.md` or
  `requirements/REQ-*.md`. If it is not, append it there first.** The prose moves; it is never dropped.
- 🔴 **One table row sits ABOVE the `# Board` title** (line 1–2). That is the old write-path defect, still live. **It
  is state, not clutter**: put it in its table if it is live, or in `board-closed.md` if it is closed, and keep a
  verbatim copy of it in `archive/board-2026-11-01-orphan-row.md`.

## 3. Inboxes — all nine plus RELAY

For each message: **processed** (its owner acted on it — the TASK moved, the log shows it, the ask was answered) →
drain it. **Not yet acted on** → it stays, shortened to 1–3 lines plus a pointer. If the detail lived only in the
inbox, the pointer goes to the archive copy and its line number. **Not sure → keep it, and list it in your report.**
Under-draining is recoverable; dropping a live instruction is not.

- **Delete only with `drain-inbox.mjs`.** Run it **alone** (a hook refuses it chained). It works by line number and
  refuses if the file changed since you printed it, so on the big inboxes **work in chunks**: print, delete one batch,
  print again for the new hash, and so on.
- Shortened versions go back in with `>>`, as their own command.
- 🔴 **`RELAY.md`: lines 1–4 are its HEADER. Never delete them.** The file starts with a byte-order mark, so the drain
  tool reports `header = lines 1-0` and lists lines 1–4 as if they were messages. Lines 5–25 are 21 doorbells
  from 2026-10-25. **Do not ring them**: the work they point at finished a week ago. Archive them, then drain lines 5–25.

## 4. `RESUME-HERE.md`

Refresh it; it is yours, and the gate reports it 2 days behind.

## 5. Not yours, do not touch

The 9 unreviewed `FAILURES.md` entries (Atlas reviews them) and the 3 REQ rows with no TASK id (the SA's). `SYSTEM-FACTS.md`
is never compacted.

## 6. Report back to Marie

- Run `node check-hygiene.mjs smart-scheduler` and paste the full output.
- Give every file's bytes before and after.
- Give each archive's md5, matched against the table above.
- Give the number of messages drained, kept and shortened per inbox, and list everything you kept because you were not sure.

Then nudge Marie (`Marie - workspace`).
