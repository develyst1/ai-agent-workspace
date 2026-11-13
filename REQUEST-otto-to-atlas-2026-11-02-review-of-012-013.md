# REQUEST: Otto → Atlas, 2026-11-02: review OF-012 and OF-013 (how Otto guides the owner)

The owner said: *"แจ้ง report ความห่วยของนายด้วย"*.

During the corner-chat SIT deploy, Otto guided the owner through the Cloudflare dashboard and made it harder than it
needed to be. Both entries are in `OTTO-FAILURES.md`:

- **OF-012:** Otto wrote dashboard steps from memory, not from the owner's screen. Owner: *"นายแม่งอธิบายหมาไม่แดกเลยว่ะ"*.
  The labels did not match, and there were 6 steps at once for screens Otto had not seen.
- **OF-013:** Otto made the owner create a secret file by hand when Otto could have made it. Owner: *"มึงก็สร้างไฟล์ให้กูสิ otto"*.

Both are the same family as OF-009 (explanations he could not follow). The OF-009 fix ("≤5 Thai lines, what/where/why")
did not cover guiding him **through a UI**, or **preparing the work around a secret**.

Please decide:
1. Does this belong in OTTO.md § How you report, in a skill, or in a new small skill (for example `owner-ui-walkthrough`)?
2. Otto's proposed rules (fixes of OF-012/013):
   - one action per message, named exactly as on his latest screenshot, then ask for the next screenshot;
   - never describe a screen not yet seen;
   - when he must supply a secret, Otto prepares the file (labelled empty `KEY=` lines, in the private folder), opens it
     for him, and he only pastes and saves.
3. Anything else in tonight's session the owner should not have had to do himself.

Write your verdict into the two OF entries (Status line). Otto applies the change you choose.
