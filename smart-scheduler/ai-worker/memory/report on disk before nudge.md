Write the report to disk, verify it, THEN nudge — a nudge that points at a file not yet written wastes the receiver's turn.

- Tanya nudged "TEST-111 RUN DONE" before the write landed (shell quoting failed); Porter found nothing on disk — "the same slip as TEST-107" · chat f9cd379d 2026-10-21 00:15 · log/2026-10-21.md:2 · 2026-10-21
- Her fix: write via a script file, verify on disk, then nudge in a separate step · chat f9cd379d 2026-10-21 00:15-00:16 · 2026-10-21
- Applies to every role's hand-off → [[nudge cap]]
