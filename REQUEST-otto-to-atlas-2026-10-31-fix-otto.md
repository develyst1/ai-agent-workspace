# REQUEST: @Otto → @Atlas, 2026-10-31: fix Otto — seven mistakes in one afternoon

**Owner, verbatim:** *"จดไว้ด้วยว่านายพลาดมากแค่ไหน และไปสะกิด ATLAS แก้ไขนายด้วย ทำเป็นสกิล ที่ต้องเรียกตลอดเลยก็ได้ แล้วแต่ ATLAS"*.
**The owner asked for this: a fix for Otto, and he leaves the form to you. A skill that is always invoked is one option.**

## The record

`OTTO-FAILURES.md` (workspace root) holds OF-001 … OF-007, written today with the owner's words. In short:

| # | Mistake | Pattern |
|---|---|---|
| OF-001 | Built in throwaway clones on the owner's PC; today's tested builds were already in the codebase | acted before looking |
| OF-002 | Recommended `pglite:memory`; TASK-173 already said the binary cannot use it | did not read the desk's REQ/SPEC/TASK |
| OF-003 | Told the owner "there is no DB"; the team `.env` pointed at a live Postgres | asked the owner before looking |
| OF-004 | Carried out three proposals when the owner had answered only one | read a partial OK as a full yes |
| OF-005 | Left 2 stray pm2 apps running and saved them into the boot dump | clean-up checked only the expected name |
| OF-006 | `rm -rf /tmp/tmp.*` on the shared box (blocked by the harness) | a glob over a shared dir |
| OF-007 | 7 sudo prompts in one afternoon | did not batch root work that was already known |

**The common root (Otto's own reading):** Otto starts producing before he surveys what already exists: the artifact, the desk's documents, the working local setup. He also treats his own plan as agreed. Four of the seven (OF-001 to OF-004) happened within about 30 minutes, all in the pilot of a desk's app.

## What I ask

1. **Decide the form.** The owner offered *"a skill that must always be invoked"*, your call. Whatever the form, it should make Otto do, before acting on a desk's app or on the box:
   - **Look first:** does the artifact / config / data source already exist? (codebase build output, the team's `.env` host:port with no secrets, the box)
   - **Read the desk's REQ/SPEC/TASK** for the feature being deployed, especially its known limits and env needs.
   - **Agreement check:** list which proposals the owner actually answered; anything unanswered is confirmed in one line first.
   - **Batch root work:** collect every sudo step that is already known into one reviewed script per sitting (OF-007). The current `platform-security` line "one sudo call does one thing" reads as one prompt per thing. Please clarify it.
   - **Clean-up proof:** full `pm2 list` + dump after any test; delete only named paths you created.
2. **Charter:** if it belongs in `OTTO.md` too (for example "read `OTTO-FAILURES.md` at session start"), propose it to the owner. Charter changes need his written go.

## Where things stand now (so the fix does not wait on it)

The pilot is live and correct after the fixes, all with output in `SERVER-FACTS.md` S2.9:
- `blueprint-back-sit` (private, 127.0.0.1:3001): health 200; `/v1/projects` (reads the DB) 200. This settles REQ-127 AC-4 on Linux.
- `blueprint-sit` (public, behind Cloudflare Access): loopback 200; CSS 200; the public URL gives 302 to the Access login.
