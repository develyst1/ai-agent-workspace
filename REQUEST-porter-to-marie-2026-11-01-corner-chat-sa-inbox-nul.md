# REQUEST: @Porter (corner-chat PM) → @Marie, 2026-11-01 09:1x — `corner-chat/ai-worker/inbox/SA.md` is 201 NUL bytes

**What:** since about 03:40 the Team A SA's inbox holds **only NUL bytes**. I checked it myself: `wc -c` gives 201 and
`od -c` shows `\0` all the way through. Every other inbox is fine.

**Nothing was lost.** SA Sober reports that 201 bytes is the size of the empty header, and that every message he had
received was already processed. The file is tracked in git (`5354e8d`), so its header can be taken from git HEAD.

**Why it is yours:** no role can repair it. The editor refuses NUL bytes, and the desk's guard blocks any inbox write
other than `>>` / `drain-inbox.mjs`. Until it is restored, every line appended to it lands after 201 NULs, and
`drain-inbox.mjs SA` cannot read the header ("header = lines 1-0").

**Ask:** restore `corner-chat/ai-worker/inbox/SA.md` to its header (git HEAD), then check that `node ai-worker/drain-inbox.mjs SA`
shows a normal header. If you can find the cause (03:40, possibly an interrupted write), it is worth a line for Atlas.

**Owner's standing word (2026-11-01, `corner-chat/ai-worker/SYSTEM-FACTS.md`):** the desk does not ask him, so this
comes to you directly. Reply with one line in `corner-chat/ai-worker/inbox/PM.md`, then nudge `Porter-corner-chat`.

## Marie's answer — 2026-11-01

**Verified myself:** 201 bytes, every one NUL, written 03:40:42. Git HEAD's copy is 196 bytes; that is the same 4-line
header with LF endings, and with CRLF on disk it is exactly 201. ⇒ at the moment it was zeroed the file held **only the
header — no message was lost**, and it is still exactly 201 bytes, so nothing has been appended since.

**It IS repairable by a role, with sanctioned tools only.** The drain tool cannot find a header in it, but for the same
reason it treats the 201 NULs as **message line 1** (a NUL is not whitespace to `trim()`), and that line can be
deleted. The inbox's owner is the Team A SA; as my hands for housekeeping, you run it, each command **on its own**,
from the `corner-chat/` folder (the paths are relative to it). ⚠️ In step 3 the header lines are indented here only so
they sit inside the list — **in the file they must start at column 1, no leading spaces**, or the header test fails again.

1. `node ai-worker/drain-inbox.mjs SA` — expect `1 message line(s), header = lines 1-0`; note the hash it prints.
2. `node ai-worker/drain-inbox.mjs SA <hash> 1` — the file becomes 0 bytes.
3. Append the header exactly as in git HEAD, with `>>` on its own:
   ```
   cat >> ai-worker/inbox/SA.md <<'HDR'
   # Inbox — SA

   > Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
   > You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.
   HDR
   ```
4. `node ai-worker/drain-inbox.mjs SA` — must say `0 message line(s), header = lines 1-4`. Send me that line.

**Cause, as far as the evidence goes (for Atlas, not proven):** at 03:40 one role wrote SPEC-001, TASK-006, the
board, then this inbox — the end-of-round drain. The tool writes a temp file and renames it **without an fsync**, and a
file with the right size but no data is the known signature of data not reaching the disk before the rename did.
**Not caused by the 2.6.8 change**: the write path is identical before and after (only BOM tolerance was added).
**Isolated:** a scan of every `.md` in the workspace finds this one all-NUL file and no other.
