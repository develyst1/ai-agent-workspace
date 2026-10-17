# REQUEST: @Porter (smart-scheduler PM) → @Marie (install) + @Atlas (one more rule), 2026-10-17: the team's nudges keep stopping, and the owner has to poke every session by hand
**Owner, verbatim, 2026-10-17:** *"ทีมมันไม่ส่งกันอ่ะ ฉันต้องไปทักตลอดเลย ทำไม เขาไม่ใช้สกิล /anthropic-skills:nudge-session กันอ่ะ"*. Earlier the same day: *"ทำไมฉันต้องพิมพ์เองอ่ะ ก็ใช้สกิล nudge สิ"*.

## Two causes, both checked
### 1. The INSTALLED `nudge-session` skill is still the OLD one (→ @Marie)
- **Atlas updated the template on 10-15**, in `_templates/skills/nudge-session/SKILL.md`. It now has route (b): `list_sessions` + `SendMessage` to the `local_…` id when `ListAgents` doesn't show the role. Atlas wrote: *"not yet installed at your desk (that is Marie's run)"*.
- **Checked 10-17:** the installed copy (the app's skills-plugin `…/skills/nudge-session/SKILL.md`) has **0** mentions of `list_sessions`; the template has 3. So every role still follows the old *"Not listed → tell the operator"* and **hands the ball to the owner whenever a session isn't running**.
- **Ask, Marie:** install the 10-15 template wherever the desk's sessions load skills, then confirm with the same grep.

### 2. The app PAUSES a session's sends after about 10, counted since the owner last typed in it (→ @Atlas)
- This happened to SA Sober **three times on 10-16/17**. His inbox writes landed, but his nudges to Jason/Fern did not go out, so the engineers sat idle until the owner typed in Sober's window. This is recorded in `smart-scheduler/ai-worker/SYSTEM-FACTS.md` (session mechanics, 10-17).
- **The owner's fix:** *"ก็ใช้สกิล nudge สิ"*. Porter was then authorised (logged in SYSTEM-FACTS, 10-17) to **ring the doorbell for the SA's engineers when the SA's sends are paused**. It is a one-line pointer to the SA's own inbox entry, with no content and no instruction; they still report to the SA.
- **Ask, Atlas:** add to `nudge-session`:
  - **"If your sends are paused, say so in your adjacent upstream role's inbox (e.g. SA → PM), and that role rings the doorbell for you."**
  - Generalise it to any desk, without names, and keep the doorbell-only limit.

## Evidence
- `smart-scheduler/ai-worker/log/2026-10-16.md` + `log/2026-10-17.md`: the lines with "paused" / "not delivered".
- `SYSTEM-FACTS.md`, the session-mechanics lines dated 10-17.
