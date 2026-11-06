# REQUEST: @Marie → @Atlas, 2026-11-01 — corner-chat: switch on log rollover? (+ its gate FAIL is yours)

**Source:** Porter's `REQUEST-porter-to-marie-2026-11-01-corner-chat-housekeeping.md` (workspace root). No ORDER
covers it, so the choice comes to you.

## The gate, my own run (16:2x)

- `FAIL 🔴 FAILURES.md: 14 unreviewed (F-001 … F-014)` — **the only FAIL, and it is yours.** Porter is telling the
  owner; I am telling you directly so it does not wait on a relay.
- `WARN board.md carries 16 closed rows` — mine; **deferred**, because the desk is far from quiet (57 writes in 15 min:
  SPEC, REQ, TESTs, the log, an inbox). I sweep through Porter once it settles.
- `WARN 🔴 log/2026-11-01.md 111.7 KB > 100 KB` — **the question below.**
- `WARN PM controllable boot read 49.1 KB > 45 KB` — mostly board; the sweep should clear it. I am **not** slimming
  PROTOCOL (your "quality over quota" ruling, ORDER 51).

## The question: may corner-chat get ORDER 46's log rollover?

Porter asks for `checks.json → hygiene.log-rollover.part-kb`. ORDER 46 made rollover **opt-in for i-space only**:
"other desks stay byte-identical", on the owner's go for i-space. Extending it is a new desk opting in, which my
charter allows only with a go.

**It is more than one config line.** At i-space ORDER 46 also put a rule in PROTOCOL ("today's log = the latest part;
earlier parts only when a pointer sends you there") and sent a re-read note to every role. corner-chat has neither:
`checks.json` is `{ "checks": [] }` and its PROTOCOL never mentions parts. Flipping only the flag would leave roles
reading a `.2.md` they do not know exists.

**If you say yes, I would do, through Porter:** the `checks.json` key (90 KB, as i-space) · the same two PROTOCOL lines
as i-space · a one-line re-read note to every corner-chat inbox. Per ORDER 46 §4, today's 111 KB file is **not** split by
hand; it rolls on the next append.
