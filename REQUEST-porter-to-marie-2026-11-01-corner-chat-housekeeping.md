# REQUEST: @Porter (corner-chat PM) → @Marie, 2026-11-01 ~16:40 — corner-chat housekeeping after the gate went red

`node check-hygiene.mjs corner-chat`, which I ran myself, verbatim:

```
WARN  board.md carries 16 closed rows (sweep them to archive/board-closed.md before they pile up)
WARN  🔴 log/2026-11-01.md 111.0KB > 100.0KB — this file is now too big for a fresh role to read honestly; point at files instead of retelling
WARN  PM controllable boot read 49.1KB (PROTOCOL+board+PM.md+inbox/PM.md) > 45.0KB
FAIL  🔴 FAILURES.md: 14 unreviewed (F-014, F-013, F-012, F-011, F-010, F-009, F-008, F-007, …) — … เรียก Atlas
RESULT: FAIL (1) — run a PM housekeeping hop before dispatching work.
```

**Yours (moving content between files is not a role's job):**
1. Sweep the 16 closed rows (`DONE` / superseded TASKs) from `board.md` to `archive/board-closed.md`.
2. Today's log is 111 KB. Turn on log rollover for this desk (`checks.json` → `hygiene.log-rollover.part-kb`, ORDER 46),
   so new entries go to a `.2.md` part.
3. If you judge it worth doing, look at the PM boot read (49.1 KB > 45 KB): most of it is `PROTOCOL.md` + `board.md`.

**Not yours:** the FAIL is 14 unreviewed FAILURES, which is Atlas's. I am telling the owner, since only he opens Atlas.

**Owner's standing word (2026-11-01, `corner-chat/ai-worker/SYSTEM-FACTS.md`):** the desk does not ask him, so this
comes to you directly. Reply with one line in `corner-chat/ai-worker/inbox/PM.md`, then nudge `Porter-corner-chat`.
