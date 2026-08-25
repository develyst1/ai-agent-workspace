# REQ-006: Inconsistencies on the new-report screen (from the stakeholder's screenshot)
- Status: SPEC_DONE (built + SA-reviewed; awaiting stakeholder visual confirm — see PM acceptance check)
- Priority: HIGH
- Requested: 2026-08-24 by the stakeholder
- Deadline: none

## Problem / Goal

The stakeholder ran the app himself, captured the **new-report screen** and
dropped the image into the project's own docs folder:

`C:\Users\Admin\develyst\ai-agent-work\ai-agent-workspace\code-report\project-docs\image-1787542760015.png`

His instruction, verbatim (Thai):

> "เห็นอะไรไม่ตรงกันมั้ย แก้ด้วย"

("Do you see anything that doesn't match? Fix it.") He named **no specific
item** — he asked the team to look, then fix. This is the same arrangement as
Q16 and Q26: his eyes set the standard, the team's judgement finds the items.

## HE HAS NAMED THE ITEM (2026-08-24, answer to Q36) — read this first

> "ไม่ใช่ นายดูรูป ปุ่มโหลด branch กับ โหลด commit มันไม่ตรงกับ dropdownlist หน้ามันอ่ะ"

**The mismatch he photographed is a LAYOUT one, not the date one:** the two
"load" buttons — `โหลดรายการ branch` and `โหลดรายชื่อผู้เขียนคอมมิต` — do not
line up with the dropdowns they belong to. This is now **Requirement 1**; the
date-format item is demoted to Requirement 3 and carries its own question (Q38).

What the image shows on that point, measured off the picture rather than
inferred (approximate pixel positions in the 1719-wide screenshot):

- **Branch row:** the dropdown occupies x≈376–877, y≈245–277; the button
  occupies x≈890–1080, y≈219–261. The button is **taller** than the dropdown
  and rides **higher** — the two do not share a centreline, and the button's
  bottom edge sits above the dropdown's bottom edge.
- **Committer row:** the same shape — dropdown x≈376–847, y≈746–778; button
  x≈858–1080, y≈721–761.
- **The two rows do not even agree with each other:** the dropdown/button split
  falls at x≈877 on the branch row and x≈847 on the committer row, though both
  buttons end at the form's right edge (x≈1080).
- **Observation, not a requirement:** each dropdown carries a label above it
  (`Branch`, `ผู้เขียนคอมมิต`) while the button next to it has none, which is
  consistent with the button being aligned to the top of the whole
  label+control group instead of to the control. **Why it happens and how to
  fix it is Sober's to determine — Porter names no cause and no fix.**

## What the screenshot actually shows (read off the image, not inferred)

The screen is the Thai (TH) new-report form, logged in as `admin`, with the
branch list not yet loaded, so the rest of the form is gated and greyed — that
gating is TASK-018's intended behaviour and is **not** reported here as a fault.

Visible on that one screen:

1. **The same date is printed in two different formats.** The period fields read
   `24/08/2026` (day/month/four-digit year), while the summary card on the right
   prints the same period as `24/Aug/26`. One screen, one date, two renderings.
2. The field label **`Branch`** is in English while every other label on the
   screen is Thai (`ช่วงเวลา`, `ตั้งแต่วันที่`, `ถึงวันที่`, `ผู้เขียนคอมมิต`,
   `ตัวกรอง`, `รายงาน`, `ภาษาของรายงาน`) — including the button next to it,
   `โหลดรายการ branch`, which is Thai.
3. The summary card prints **one** date (`ช่วงเวลา 24/Aug/26`) for what the form
   holds as a **from/to pair**. With today→today both are the same day, so this
   may be correct by design rather than a fault — recorded as an observation, not
   a claim.

## Requirement

1. **Each "load" button must read as part of the same row as the dropdown it
   serves.** On the new-report screen, `โหลดรายการ branch` must line up with the
   branch dropdown and `โหลดรายชื่อผู้เขียนคอมมิต` with the committer dropdown,
   and the two rows must be laid out consistently with each other. *(This is the
   item the stakeholder named himself in the Q36 answer.)*
2. Requirement 1 is a **layout** fix only: no string is added, removed or
   reworded, no control is added or removed, and the branch/committer gating,
   the values submitted and every other screen behaviour stay exactly as built.
3. **A date must not appear in two different formats on the same screen** — the
   period the user is choosing and the period shown back to him in the summary
   card must read as the same thing — **without** changing what goes on the wire
   or what period is actually reported on. **Requirement 3 was NOT the item he
   spotted (Q36 = "ไม่ใช่")** — it is the team's own finding, kept because it is
   objectively true on his image and disagrees with REQ-001 Req 15. **Q38 =
   "ทำให้หมดอ่ะ" (2026-08-24) → GO: build it too.** The hold is lifted. How the
   OS-locale date input is brought into line with `DD/MMM/YY`, and whether
   REQ-004 Req 7d's usability licence covers it (Q-SA-10), stays @Sober's design
   call — Porter lifts the hold, not the design question.

Observation item 2 (the English `Branch` label) is **CLOSED by his Q37 answer —
keep it as it is**; see `## Questions`. Observation item 3 (one date printed for
a from/to pair) stays an observation only and may be correct as built.

## Acceptance Criteria

- [ ] On the new-report screen, each load button and its dropdown read as one
      aligned row, and the branch row and the committer row are laid out the
      same way as each other.
- [ ] The stakeholder, opening the same screen again, no longer sees the
      mismatch he photographed and named in the Q36 answer.
- [ ] No change to the values submitted, to the 366-day rule, to the branch /
      committer gating, to any string, or to any other screen.
- [ ] *(Requirement 3 — now GO, Q38 = "ทำให้หมดอ่ะ")* the period reads in one
      consistent format in both the input fields and the summary card.

## Constraints

- **REQ-001 Requirement 15 already fixes the display format as `DD/MMM/YY`** —
  which is what the summary card is doing. The input fields are the ones
  disagreeing with the standard.
- Known tension the SA must weigh rather than discover: Q-SA-10 accepted that the
  date **input** renders in the operating system's locale, which is exactly why
  the two can disagree. REQ-004 Requirement 7d (Q32) permits changing
  REQ-001-named behaviour **when it demonstrably improves usability**, with the
  reason written into the TASK. Whether that licence covers this, and how the fix
  is built, is the SA's call, not the PM's.
- The Q14 copy bundle stays closed: no user-facing string is added, removed or
  reworded under this REQ without the stakeholder's yes/no.

## Out of Scope

- The other two screens (login/shell, report view). He photographed one screen
  and this REQ covers that screen.
- The behaviour of the branch/committer gate, the presets, and the 366-day cap —
  all built and SA-verified under SPEC-003.

## PM acceptance check (2026-08-25, Porter)

Both SPEC-005 tasks are built and SA-reviewed DONE (TASK-022 = Req 1 load-button
alignment at `859148a`; TASK-023 = Req 3 `DD/MMM/YY` period inputs at `68a1475`).
I re-verified the two commits read-only in `code-report-front` (branch `develop`,
both present in history):

- **TASK-022 (`859148a`):** exactly `NewReportFields.tsx`, 2 lines — adds
  `sm:items-end` to the branch and committer load-button rows. Layout-only.
- **TASK-023 (`68a1475`):** `globals.css` (+52) + `NewReportFields.tsx` (+88/−15) —
  a read-face overlay renders the value via the shared `formatIsoDate()` in
  `DD/MMM/YY`; native `type="date"` control kept for the picker; wire values stay
  `YYYY-MM-DD`. No new string, no new dependency.

**Verdict against the Acceptance Criteria:**

- **AC 3 (no change to values submitted / 366-day rule / gating / any string /
  any other screen) — PASSES.** Corroborated by the two diffs above: TASK-022 is a
  className-only layout change; TASK-023 keeps the wire (`dateFrom`/`dateTo`)
  `YYYY-MM-DD` and adds no string. SA independently confirmed the logic files are
  absent from both diffs.
- **AC 1, AC 2, AC 4 — VISUAL/render criteria; NOT closeable from code alone.**
  AC 1 (buttons read as one aligned row, both rows consistent) and AC 4 (one
  consistent date format in inputs + summary card) are rendering claims that
  typecheck/tests do not prove (Sober noted the build gate is inert to a
  CSS/className diff). **AC 2 is by its own wording the stakeholder's to satisfy:**
  "The stakeholder, opening the same screen again, no longer sees the mismatch he
  photographed and named." This project has **no deployed environment** and the
  new-report screen is gated behind admin login against the real backend, which the
  team may not touch — so Porter cannot produce an honest render either. The proper
  close is the stakeholder's own eyes on the rebuilt screen (same pattern as the
  TASK-009 / REQ-009 acceptance runs).

**Outcome:** REQ-006 stays `SPEC_DONE`. The code-level criterion is met; the three
visual criteria are routed to the stakeholder for a look-and-confirm (Q-REQ006-1
below). **BLOCKS `DELIVERED` only** — no engineer or SA is waiting; SPEC-005 is
fully built. On his "ok" Porter sets REQ-006 → `DELIVERED`.

## Questions

### Q-REQ006-1 — to the human, 2026-08-25 — **visual confirm of the two fixes (gates DELIVERED only)**

The two fixes are built and SA-verified; only the stakeholder's eyes can satisfy
AC 2 (and confirm the visual AC 1 / AC 4). Thai, ready to send:

> "REQ-006 (จุดที่ไม่ตรงกันในหน้าสร้างรายงานที่พี่ถ่ายรูปมา) ทีมแก้เสร็จและ SA ตรวจโค้ดผ่านแล้วทั้ง 2 จุด
> — (1) ปุ่ม 'โหลดรายการ branch' กับ 'โหลดรายชื่อผู้เขียนคอมมิต' จัดให้อยู่แถวเดียวกับ dropdown ของมันแล้ว
> (แก้เฉพาะการจัดวาง ไม่แตะข้อความ/ค่า/การล็อกฟอร์ม) และ (2) วันที่ในช่องกรอกช่วงเวลาแสดงเป็น DD/MMM/YY
> (เช่น 24/Aug/26) ตรงกับกล่องสรุปแล้ว (ค่าที่ส่งยังเป็น YYYY-MM-DD เหมือนเดิม). รบกวนพี่เปิดหน้าสร้างรายงาน
> อีกครั้งแล้วยืนยันว่า (ก) ปุ่มโหลดทั้งสองตรงแถวกับ dropdown แล้ว และ (ข) วันที่ในช่องกรอกกับในกล่องสรุป
> เป็นรูปแบบเดียวกันแล้ว ถ้าโอเคผมจะปิดงานเป็น DELIVERED ครับ (ไม่มีใครในทีมต้องรอ — รอแค่ตายืนยันของพี่)"

> answer: _(pending)_

### Q36 — ANSWERED 2026-08-24 — **not the date; it is the buttons vs the dropdowns**

> answer (2026-08-24, human, verbatim): "ไม่ใช่ นายดูรูป ปุ่มโหลด branch กับ
> โหลด commit มันไม่ตรงกับ dropdownlist หน้ามันอ่ะ"

- Recorded as **Requirement 1**, with the measurements read off his image in the
  section at the top of this REQ. "โหลด commit" = the
  `โหลดรายชื่อผู้เขียนคอมมิต` button (there is no other load-commit control on
  that screen).
- **What Porter deliberately did NOT decide:** what "ตรงกัน" should look like —
  same centreline, same height, same column split across both rows, or a
  different arrangement entirely — and what causes the offset. That is a design
  judgement and belongs to @Sober.
- Consequence for the old Requirement 1: the date-format item is **demoted to
  Requirement 3 and held** — see Q38.

### Q37 — ANSWERED 2026-08-24 — **keep `Branch`; mixed English is acceptable**

> answer (2026-08-24, human, verbatim): "คง Branch ไว้บางส่วนจำเป็นต้องใช้
> ภาษาอังกฤษ ก็ปนไปได้ ตีคำนั้นว่าเป็นคำไทยด้วย เลย หากจะแก้เดี๋ญวฉันไปแก้ คำไทย เอง"

- **Closed. Nothing changes.** `Branch` stays exactly as authored, and observation
  item 2 is not a fault.
- Three things this settles beyond the one label, recorded because they will come
  up again: (a) an English word inside a Thai screen is **not** an inconsistency
  on this project — he counts such a word *as Thai*; (b) some strings must stay
  English by necessity; (c) **he edits Thai copy himself** — the team does not
  reword Thai strings, which reinforces the Q14 copy bundle rather than opening
  it.
- **@Sober: no TASK line comes out of this question.**

### Q38 — ANSWERED 2026-08-24 — **"ทำให้หมดอ่ะ" → build Requirement 3 too**

> answer (2026-08-24, human, verbatim): "ทำให้หมดอ่ะ"

- **GO on Requirement 3.** The date-format inconsistency is fixed together with
  the layout item. The hold is lifted; the acceptance criterion for it is now
  active, not conditional.
- **What Porter did NOT decide:** *how* the OS-locale date input is brought into
  line with `DD/MMM/YY`, and whether REQ-004 Req 7d's usability licence covers
  changing that frozen behaviour (Q-SA-10). "ทำให้หมดอ่ะ" is the stakeholder's
  yes to the outcome; the design path stays @Sober's, inside SPEC/TASK.
- **No new string** is added or reworded by Requirement 3 — it is a rendering
  fix on an existing field, so the Q14 copy bundle stays closed.

### ~~Q38 original~~ (kept for the record)

**Q38 (to the human) — NON-BLOCKING.**
He has told us the date format was **not** what he saw, so Requirement 3 is now
the team's finding, not his instruction — and it is not free: Q-SA-10 accepted
that the date *input* renders in the OS locale, so making it match `DD/MMM/YY`
is a real change on a screen that is otherwise frozen. Porter will not spend that
on an assumption, and will not silently drop a real inconsistency either.
Thai, ready to send:
> "อีกเรื่องจากรูปเดิม — ที่ผมเห็นเพิ่มเองคือ วันที่ในช่องกรอกขึ้น `24/08/2026`
> แต่ในกล่องสรุปขึ้น `24/Aug/26` ไม่ตรงกันในหน้าเดียวกันครับ พี่บอกว่านั่นไม่ใช่
> จุดที่พี่เห็น — จะให้ทีมแก้ให้ตรงกันด้วยเลยไหมครับ หรือปล่อยไว้ก่อน
> เอาเรื่องปุ่มกับ dropdown อย่างเดียว?"

### ~~Q36 original~~ (kept for the record)

**Q36 (to the human) — NON-BLOCKING.**
Is the date-format mismatch (item 1) the thing he spotted, or did he mean
something else on that screen? Requirement 1 is objective and can proceed either
way; his answer only tells us whether anything is still unfixed.
Thai, ready to send:
> "จากรูปที่ส่งมา — ที่ 'ไม่ตรงกัน' ที่พี่เห็น คือวันที่ในช่องกรอกขึ้นเป็น
> `24/08/2026` แต่ในกล่องสรุปด้านขวาขึ้นเป็น `24/Aug/26` ใช่ไหมครับ
> ถ้าใช่ทีมแก้ให้ตรงกันเลย ถ้าพี่หมายถึงจุดอื่นด้วย บอกได้เลยครับ"

### ~~Q37 original~~ (kept for the record)

**Q37 (to the human) — NON-BLOCKING, and it is a wording question, so it cannot
be decided by the team.**
The label `Branch` is the only English label among Thai ones (item 2). Changing
it is a **reword**, and Q14 approved every string as authored, so the team may
not change it unasked. Does he want it in Thai?
Thai, ready to send:
> "อีกจุดในรูป: หัวข้อช่อง `Branch` เป็นภาษาอังกฤษอยู่จุดเดียว ที่เหลือเป็นไทยหมด
> ให้เปลี่ยนเป็นไทยไหมครับ (เช่น 'สาขา') หรือคงคำว่า Branch ไว้ตามเดิม?"
