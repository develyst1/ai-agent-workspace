# REQ-001: Project foundation + working Layout Designer
- Status: DELIVERED
- Priority: HIGH
- Requested: 2026-08-22 by human (stakeholder)
- Deadline: none

Source material: `../project-docs/project-brief-from-human.md` (human's full brief, Thai).
Q1-Q25 are recorded in `## Questions` below with their verbatim Thai; the
requirement statements here already reflect them. The SPEC-001 §7 Thai table is
**approved in full, all 27 keys** (Q9 for the first 26, Q18 for the last one).
Q19 and Q20 are RESOLVED — the human's on-screen acceptance is 6/6.
**Q23 is now ANSWERED (2026-08-22)** — the human's working rule that he alone puts
work into git. All three confirmations came back; the full verbatim Thai and what
each line does and does not settle are in `## Questions` Q23 and in Constraints
below.
**Q24 (2026-08-23) is the human's acceptance of this REQ** — the second and last
six on-screen checks pass 6/6 and the Q-FE-5 trim ruling is not vetoed, so the
status above is **DELIVERED** and every criterion box is ticked (verdict block at
the end of `## Acceptance Criteria`). **Q25** carries three one-line follow-ups
that block nothing and change no criterion.

**Numbering warning:** the numbers the human answers by (the dispatcher's
question list) are not this file's numbers. The 2026-08-22 round mapped:
dispatcher *Q13* = §7 wording review → recorded here under **Q9**;
dispatcher *Q14* = blank slot name → recorded here under **Q13**;
dispatcher *Q15* = case-sensitivity → SPEC-001 §9 **A-6**, recorded here in
Constraints and under **Q14** below;
dispatcher *Q16* = Electron latest vs the pins → recorded here under **Q15**;
dispatcher *Q17* = the 27th key's Thai wording → recorded here under **Q18**
(careful: this file already has a **Q17** of its own, a different topic — the
default slot-name numbering. Same number, different question);
dispatcher *Q18* = the eight default slot colours → recorded here under **Q21**
(another clash: this file's own **Q18** is the Thai-wording question above).
The 2026-08-22 acceptance round carried no dispatcher numbers at all; it is
recorded here as **Q19** (the human's answer), **Q20** (what that answer left
open) and **Q22** (the two BE assumptions he declined to veto).

## Problem / Goal

The stakeholder wants a desktop application for building **photo pattern /
collage templates**: first you *design* a layout (a canvas with named
rectangular slots), later you *use* that layout to compose photos into a
finished image.

This REQ covers only the first half, because the human explicitly asked for that
order: *"เริ่มจากสร้างโครงสร้างโปรเจกต์และหน้า Layout Designer ให้ใช้งานได้ก่อน
แล้วค่อยทำโหมด Use Template"* — build the project skeleton and a working Layout
Designer first, then the Use Template mode.

Outcome of this REQ: the human can open the app on their own machine, draw a
layout, name/colour/arrange its slots, save it to a JSON file, close the app,
reopen it, load that file back, and keep editing.

## Requirement

1. The system must be a locally-run desktop application, startable by the human
   with a single documented command, with a project structure and build tooling
   in place.
2. The app must present two top-level modes, **Layout Designer** and
   **Use Template**. In this REQ only Layout Designer must function; Use
   Template is a visible but inactive placeholder (confirmed by the human
   2026-08-22).
3. Layout Designer must show a design canvas whose width and height in pixels
   the user can set, defaulting to 1080 x 1920.
4. The user must be able to add a rectangular slot to the canvas.
5. Each slot must be:
   1. movable by dragging;
   2. resizable by dragging visible handles;
   3. nameable — the user types the name freely (no fixed list), and two slots
      inside the same template must not end up with the same name (Q3).
      **Two names that differ only in upper/lower case count as the same name**
      (Q14, 2026-08-22): `slot 1` and `Slot 1` may not both exist in one
      template. A newly
      added slot arrives already carrying a default **English** name of the form
      `slot 1`, `slot 2`, … (Q6) — the number is whatever keeps the name unique
      inside the current template: a number a user-renamed slot already occupies
      is **skipped**, judged by the same case-insensitive comparison as the
      uniqueness rule above
      — with a slot called `Slot 3` present the generator does not hand out
      `slot 3` (Q17, 2026-08-22) — and the user renames it if they want to;
   4. colour-changeable through a full colour picker, and the chosen colour
      must survive save and reload (Q4);
   5. re-orderable front-to-back (z-index).
6. Each slot must display its own name on top of the rectangle.
7. A side panel must list every slot by name and let the user delete any slot
   from that list.
8. The user must be able to save the current layout as a JSON template file
   **to any folder they choose in a native Save dialog** (Q1). The saved data
   must contain at least: `name`, `canvasWidth`, `canvasHeight`, and `slots[]`
   where each slot carries `id`, `name`, `x`, `y`, `width`, `height`,
   `zIndex`, and the slot's colour.
9. The user must be able to load a previously saved template file back into the
   designer — choosing the file themselves in a native Open dialog — and
   continue editing it, with every slot restored to the same position, size,
   name, colour and stacking order.
10. The app must support a basic dark mode.
11. The UI must be clean and simple enough that the human can complete the flow
    in criterion A1 below without instructions.
12. **All on-screen text — labels, buttons, messages — must be in Thai** (Q2).
    The single exception is the default slot name, which the human chose to be
    English (Requirement 5.3 / Q6); names the user types themselves are of
    course whatever the user types.
13. The template's `name` is **typed by the user in the designer before
    saving** (Q5); it is not derived from the filename.
14. Saving with an **empty template name must be refused** (Q7): the app must
    not write a template file until the user has entered a name. The refusal
    takes the shape of an **unclickable Save control** (Q8, human's words:
    *"ปุ่มกดไม่ได้"*): while the template name is empty, Save is visibly
    disabled and cannot be triggered at all, so the native Save dialog never
    opens. No warning message is shown — the human chose the disabled-control
    option over the warning-message option. As soon as a non-empty name is
    present, Save becomes usable again.
15. **A rename that would duplicate an existing slot name must not take effect**
    (Q10). Whatever the user types, the template never ends up with two slots
    carrying the same name (Requirement 5.3 / A8), and the attempt leaves the
    other slot's name untouched. The refusal is **not silent**: the user is
    shown a Thai warning message telling them that name is already taken (Q11,
    human's word: *"ขึ้นเตือน"*). That message is one more Thai user-facing
    string; like every other string it is drafted by Sober with the SPEC-001 §7
    table and approved by the human through the Q9 review loop before it is
    final. Nobody on the team invents or ships it unreviewed. That wording is
    now approved: `error.duplicateSlotName` = *"มีช่องที่ใช้ชื่อนี้อยู่แล้ว กรุณาตั้งชื่ออื่น"*
    (Q9, 2026-08-22).
16. **A slot name cleared to blank must not take effect** (Q13, 2026-08-22). If
    the user empties a slot's name and confirms, the slot keeps the name it had,
    and the user is shown a **Thai warning message** (human's words:
    *"ขึ้นข้อความเตือนไทยด้วย"*). Same shape as Requirement 15, and it needs the
    same thing: **one more Thai user-facing string** beyond the 26 keys the human
    approved on 2026-08-22. Porter invents no wording — under Q9 Sober drafts
    that one key and the human approves it through Porter before it ships.

## Acceptance Criteria

- [x] A1. Starting from a running app, the human can: create a 1080x1920
      canvas, add at least 5 slots, rename them, give them different colours,
      change which one is in front, delete one from the side list, type a
      template name, save the result to a JSON file **in a folder they pick in
      the save dialog**, restart the app, load that file back from that
      folder, and see exactly the layout they saved — same positions, sizes,
      names, colours and stacking order.
- [x] A2. The saved JSON opened in a text editor contains `name`,
      `canvasWidth`, `canvasHeight` and a `slots[]` array whose items each have
      `id`, `name`, `x`, `y`, `width`, `height`, `zIndex` and a colour value.
- [x] A3. Each slot on the canvas visibly shows its name.
- [x] A4. Dark mode can be turned on and the whole UI remains readable.
- [x] A5. The human can start the app from a clean checkout by following the
      written run instructions, with no undocumented manual step.
- [x] A6. A "Use Template" entry point is visible and clearly marked as not
      available yet; nothing in the app crashes when it is clicked.
- [x] A7. Every piece of text the human sees while doing A1 is in Thai, except
      the default slot names described in A9.
- [x] A8. Two slots in one template cannot end up carrying the same name, and
      **case does not create a second name**: with a slot called `slot 1`
      present, naming another slot `Slot 1` is refused exactly like an identical
      name would be (Q14).
- [x] A9. A slot added and not renamed shows the English default name `slot 1`,
      `slot 2`, … and adding several slots in a row never produces two slots
      with the same default name.
- [x] A10. With the template name box left empty, the Save control is visibly
      disabled and cannot be clicked — no save dialog opens and no file is
      written. Typing a name enables it again; clearing the name disables it
      again. No warning message appears at any point in this flow.
- [x] A11. Trying to rename a slot to a name another slot in the same template
      already has does not take effect: after the attempt the two slots still
      have different names and no data is lost, **and a Thai warning message is
      shown for that attempt** (its wording is whatever the human approved in the
      Q9 review loop).
- [x] A12. Shrinking the canvas does not move or resize any slot; a slot that
      now falls outside the canvas simply stays where it was (SPEC-001 §9 A-3,
      confirmed by the human).
- [x] A13. Dark mode is not expected to be remembered after the app is closed
      and reopened; starting in the default theme is correct behaviour
      (SPEC-001 §9 A-4, confirmed by the human).
- [x] A14. A successful save shows no confirmation message (SPEC-001 §9 A-5,
      confirmed by the human).
- [x] A15. Clearing a slot's name to blank and confirming does not take effect:
      the slot still shows the name it had before, **and a Thai warning message
      is shown** for that attempt — the `error.blankSlotName` value the human
      approved on 2026-08-22 (Requirement 16 / Q13 for the behaviour, Q18 for the
      wording).
- [x] A16. Every Thai string the human sees while doing A1 matches the SPEC-001
      §7 table word-for-word (including "ช่อง" for *slot*). All 27 keys of that
      table are approved: 26 on 2026-08-22 via Q9, the 27th the same day via Q18.
- [x] A17. A default slot name never collides with a name the user typed, whatever
      the case: with a slot renamed to `Slot 3` present, no newly added slot is
      ever called `slot 3` — the generator takes the lowest number not already in
      use, ignoring case (Q17, confirmed by the human 2026-08-22).

**Acceptance verdict — DELIVERED 2026-08-23 (Porter).** All 17 boxes ticked in the
one pass Q19/Q20 promised. Where each one rests — pointers only, the evidence lives
in the files named:

- **Seen on screen by the human himself:** A1, A3, A4, A6, A11, A15 — from the two
  acceptance rounds, Q19 + Q20 (drag, slot resize, live colour, stage rescale, both
  Thai rename warnings, empty DevTools console) and **Q24** (save round trip through
  the native dialogs incl. close/reopen/load, both dialogs cancelled with no effect,
  a non-template `.json` rejected in Thai with the design untouched, dark mode
  readable in both themes, Thai window title, Use Template visibly inert).
- **On Sober's own re-verification, cited in the TASK files:** A2, A8, A9, A10, A12,
  A14, A16, A17 (TASK-002 / TASK-003 / TASK-004 `§Review`) and A5 (TASK-001 `§Review`
  — the README run instructions followed literally from a clean checkout, two
  commands, no undocumented manual step).
- **A13** states an expectation of *absence* (dark mode need not survive a restart);
  there is nothing to observe and nothing shipped contradicts it.

## Constraints

- Technology named by the stakeholder (recorded as a constraint, not a design
  decision): Electron (latest), React 18 + TypeScript, Vite, Konva +
  react-konva, Zustand for state, Tailwind CSS optional but preferred. File
  layout should follow the standard Electron + Vite + React conventions.
- Single repository: `H:\layout-pattern-app\layout-pattern-app` (greenfield).
- Local only — there is no deployed environment. The human is the only
  acceptance tester.
- Delivery order is fixed by the stakeholder: this REQ first, Use Template
  after.
- No irreversible actions by the team (no global installs, no `git push`, no
  deleting anything outside the repo).
- Template files live wherever the user chose to save them — the app does not
  own a `templates/` folder (Q1). Whatever REQ-002 (Use Template) needs in
  order to offer "the templates you have" must be designed on top of that
  fact.
- **Thai wording is now drafted by the SA, then reviewed by the human** (Q9,
  2026-08-22). This changes only *who drafts*: the human remains the approver,
  the draft reaches him through Porter, and no Thai string is final until he has
  said so. Requirement 12 is unchanged.
- **Three SA technical calls are confirmed by the human** (SPEC-001 §9 —
  note the hyphenated ids are SPEC assumptions, not this REQ's A-criteria):
  A-3 shrinking the canvas leaves slots untouched, even outside the canvas;
  A-4 the dark-mode choice is not remembered across restarts; A-5 a successful
  save shows no confirmation. Human's words: *"A-3/A-4/A-5 ถูกหมด"*. They are
  now accepted behaviour for acceptance testing (A12–A14), not assumptions.
  SPEC-001 §9 A-1 and A-2 are settled separately by Q12 below.
- **The duplicate-name refusal comes with a Thai warning** (Q11, 2026-08-22).
  This REQ therefore does introduce one user-facing string beyond the 25 keys
  listed in SPEC-001 §7 — routed the same way as all the others (Sober drafts,
  the human approves through Porter). Contrast Requirement 14, whose refusal is
  a disabled control and stays deliberately wordless.
- **The SPEC-001 §7 Thai table is APPROVED as drafted** (Q9 review loop closed
  2026-08-22, human's word: *"อนุมัติหมด"*): all 26 keys, no per-key correction,
  including "ช่อง" for *slot*. Those exact values are now the contract for
  acceptance testing (A16). A later change to any of them is a new stakeholder
  decision, not a free edit. Sober mirrors the approval into SPEC-001 §7 (that
  file is his; Porter does not edit specs).
- **Slot-name uniqueness is case-INSENSITIVE — SPEC-001 §9 A-6 is vetoed by the
  human** (Q14, 2026-08-22): asked whether `slot 1` and `Slot 1` count as two
  different names he answered *"ไม่"*. A-6 as written (case-sensitive, both
  allowed) is therefore wrong and is a stakeholder constraint now, not an SA
  call. Reflected in Requirement 5.3 and criterion A8; SPEC-001 §5 / §9 are
  Sober's to correct.
- **The human upgraded his machine's Node to v22.23.2 himself on 2026-08-22**
  (console transcript: `../project-docs/2026-08-22-node-upgrade-console.md`).
  This is the constraint TASK-001's Q-BE-1 was pinned against — the stakeholder's
  "Electron (latest)" is no longer blocked by the machine's Node version.
- **The stakeholder wants the project moved to Electron latest** (Q15,
  2026-08-22, verbatim: *"ให้ย้ายโปรเจกต์ไป Electron รุ่นล่าสุด ตามบรีฟเลย"*).
  The brief's "Electron (latest)" therefore stands as a live constraint on this
  REQ, not something to defer: the pinned Electron 39.8.10 is a temporary state
  that must not survive REQ-001. The stakeholder set the *what* only — **how and
  when** the move happens (rework TASK-001 vs. a separate task, which exact
  version, what regression evidence is required) is Sober's technical call under
  Q-BE-1. Vite 5.x and the other pinned versions are **not** covered by this
  answer: the brief names "Vite" and "React 18" without "latest", so those
  versions stay Sober's call, bounded by the versions the brief does name.
- **A-1 and A-2 are Sober's calls to make** (Q12, 2026-08-22): the human
  explicitly declined to constrain the colour format (opaque `#rrggbb`, no
  alpha) and the canvas size limits (integers 1…10000) and handed both back to
  the SA. They are closed SA technical decisions — no stakeholder constraint and
  no acceptance criterion of their own, unlike A-3/A-4/A-5.

- **The stakeholder accepts the known dev-time dependency advisory and does not
  want it fixed in this REQ** (Q16, 2026-08-22, verbatim: *"ปล่อยช่องโหว่ไว้ — ไปต่อ"*).
  `npm audit` reports GHSA-67mh-4wv8-2f99 against the esbuild/Vite **development**
  server (raised by Jason as TASK-001 Q-BE-5; the technical characterisation is
  his, in that file, not Porter's). The stakeholder was offered the chance to
  veto leaving it and declined. Consequence for acceptance: a non-empty
  `npm audit` output is **not** a defect for REQ-001 and does not fail any
  criterion; no acceptance criterion is added or changed. What this answer does
  **not** reach: it is not a general waiver of security work, and it says
  nothing about the packaged/distributable build — packaging is Out of Scope of
  this REQ (see also SPEC-001 §9 A-7, CSP deferred to packaging), so the same
  question is re-asked of the stakeholder when packaging becomes a REQ. Whether
  Vite's version moves for any *other* reason remains Sober's technical call.

- **The default slot-name generator skips numbers that are already taken, compared
  case-insensitively** (Q17, 2026-08-22, verbatim: *"สมมติฐานถูก"*). Sober assumed it
  in SPEC-001 §5 "Add slot" and flagged it as low-confidence; the stakeholder was
  offered the veto and confirmed the behaviour instead, so it is accepted behaviour
  now (criterion A17), not an SA assumption. Reach: it settles only *which number*
  a new slot gets. It says nothing about the name **format** (`slot N`, English,
  fixed by Q6), nothing about renaming rules (Requirements 15/16), and it is not a
  second ruling on case-insensitivity — that was already settled by Q14; this
  answer only confirms the generator obeys the same rule.

- **Only the human puts work into git — no role runs `git add`, `git commit`,
  branch creation, or `git push`** (Q23, asked 2026-08-22 from his standing
  instruction *"ต่อจากนี้ทำงานอย่่างเดียว การcommitเดี๋ยวฉันทำเอง"* (his typo kept),
  **answered 2026-08-22** in three parts — verbatim Thai in §Questions Q23). A
  stakeholder **working rule**, not scope: it changes no requirement, no acceptance
  criterion, no Thai string and no task's content. What it settles:
  - The rule covers **everything that puts work into git** — his words are "ทุกอย่าง
    เกี่ยวกับการเอา git ขึ้น ทั้ง add comment createbranch": `git add`, commit, and
    **creating branches** are his alone, next to the existing no-`git push` rule.
  - **Editing files stays with the team** — he names adding a `.gitignore` as the kind
    of thing that is still fine. Editing a file is not a git operation.
  - **Hand-off shape is left to the team** ("แล้วแต่เลย"), with one form he offers
    himself: hand Sober the list of changed files and review the work uncommitted.
    He commits and syncs on **his** timing, because he may look at the change first.
  - **Existing commits stand** ("คงไว้") — `bae3f6c`, `77673af`, `097c045` and the rest
    stay as history; nothing is rewound or deleted, and the branch already cut is left
    alone.
  Reach: **how** a hand-off packet and a review work with no commit SHA is a technical
  design question — **Sober's**, now that the answer exists. Porter neither designs it
  nor tells an engineer anything about it. TASK-004's "Committed locally" DoD box is
  Sober's to re-word. One thing the human's words do not mention either way: read-only
  git inspection (`git status`/`diff`/`log`) puts nothing "ขึ้น" and is treated as still
  allowed — flagged back to him for a one-line veto.

## Out of Scope

- **Use Template mode** in full (choosing a template, dropping images into
  slots, cover/centre-crop rendering, high-resolution PNG generation via a
  native dialog). That is the next requirement, REQ-002, and will be written
  once this one is delivered.
- Producing an installer / packaged distributable.
- Undo/redo, snapping or alignment guides, slot rotation, non-rectangular
  slots, multi-select, copy/paste of slots, zoom controls — none of these are
  in the brief.
- Any cloud storage, login, or sharing of templates.

## Questions

- **Q1 — Where do template JSON files live?** Fixed app-managed `templates/`
  folder, any location picked in a native dialog, or both?
  > answer (human, 2026-08-22): *"โฟลเดอร์ให้ผู้ใช้เลือกเองผ่าน dialog"* — the
  > user picks the folder themselves through a native dialog; there is no
  > fixed app-managed `templates/` folder. Reflected in Requirement 8 / 9 and
  > in Constraints. RESOLVED.
- **Q2 — UI language: Thai, English, or both?**
  > answer (human, 2026-08-22): *"ไทย"* — Thai. Reflected in Requirement 12 and
  > criterion A7. RESOLVED.
- **Q3 — Slot names: free text or a fixed list, and must they be unique?**
  > answer (human, 2026-08-22): *"พิมพ์เอง ห้ามซ้ำ"* — the user types the name
  > freely; duplicates inside one template are not allowed. The brief's
  > examples (`background`, `top_left`, …) are therefore suggestions, not the
  > allowed set. Reflected in Requirement 5.3 and criterion A8. RESOLVED.
- **Q4 — Slot colour: palette or full picker, and is it saved?**
  > answer (human, 2026-08-22): *"picker เต็ม เก็บลง JSON"* — a full colour
  > picker, and the colour is stored in the template JSON. Reflected in
  > Requirement 5.4 / 8 / 9 and criterion A2. RESOLVED.
- **Q5 — Where does the template `name` come from?**
  > answer (human, 2026-08-22): *"พิมพ์ก่อน Save"* — typed by the user before
  > saving, not taken from the filename. Reflected in Requirement 13.
  > RESOLVED.

- **Q6 — What is a newly added slot called before the user renames it?**
  With a Thai UI (Q2) and free-text slot names (Q3), the default name of a
  fresh slot is a user-facing string that nobody has specified and that I will
  not invent. Should it be Thai (`ช่อง 1`, `ช่อง 2`, …), English (`slot 1`, …),
  or should a new slot start with an empty name the user must fill in?
  > answer (human, 2026-08-22): *"อังกฤษ slot N"* — English, `slot N`. So a new
  > slot is born named `slot 1`, `slot 2`, … This is a deliberate exception to
  > the Thai-UI rule; the numbering must keep names unique (Requirement 5.3).
  > Reflected in Requirement 5.3 / 12 and criteria A7 / A9. RESOLVED.
- **Q7 — Is the template name mandatory?** The name is typed before Save (Q5).
  If the user leaves it empty and presses Save, should the app refuse to save
  until a name is entered, or save the file with an empty name?
  > answer (human, 2026-08-22): *"ห้ามบันทึก"* — refuse to save. An empty
  > template name means no file is written. Reflected in Requirement 14 and
  > criterion A10. RESOLVED.

- **Q8 — How should the app refuse a save with an empty template name?**
  Requirement 14 says the file must not be written; what the human *sees* is
  still unspecified and it is a Thai user-facing string I will not invent.
  Should the Save button simply stay disabled until a name is typed, or should
  Save stay clickable and show a warning — and if so, what exactly should that
  warning say in Thai?
  > answer (human, 2026-08-22): *"ปุ่มกดไม่ได้"* — the button cannot be
  > pressed: the Save control stays **disabled** while the template name is
  > empty. The human picked the disabled-button option over the
  > warning-message option, so **this REQ introduces no warning text** and no
  > new Thai string had to be invented. Reflected in Requirement 14 and
  > criterion A10. RESOLVED.
  >
  > Porter's note on how far the answer reaches: it settles the refusal
  > *mechanism* (disabled control, no message). It does not order any extra
  > explanatory hint beside the button; if the human later wants one, that
  > arrives as a change request with its own Thai wording, not as something
  > the team adds by itself. Where the Save control sits and how it looks
  > while disabled stays a design call for Sober, inside Requirement 12
  > (Thai UI).

- **Q9 — Thai wording for the whole UI (asked by Sober, 2026-08-22).** Requirement 12
  puts every on-screen string in Thai, and I do not invent user-facing wording. The
  complete list of strings the app needs is the key table in
  `specs/SPEC-001-foundation-and-layout-designer.md` §7 (25 keys: mode tabs, toolbar
  labels and buttons, side-panel and properties labels, native dialog titles, and the
  three error messages). Please get one Thai string per key from the human and put the
  answers here; I will copy them into SPEC-001 §7 and unblock the FE tasks.
  **Blocks TASK-003 and TASK-004.**
  > answer (human, 2026-08-22): *"ให้ Sober ตั้งคำไทยมาก่อน แล้วผมรีวิว"* — the human
  > does not want to dictate 25 strings; he wants **Sober to draft the Thai wording
  > first and then he reviews it**. So the drafting of the §7 values is delegated to
  > Sober by the human's own instruction, and Sober writes them straight into
  > SPEC-001 §7 (they are his file; Porter does not edit specs). RESOLVED as to
  > *who drafts*.
  >
  > How the review loop works, so nothing gets shipped unapproved:
  > 1. Sober fills SPEC-001 §7 with a full Thai draft (all 25 keys) and logs
  >    `@Porter: §7 draft ready for the human's review`.
  > 2. Porter puts that draft in front of the human in Thai and brings back
  >    "approved" or per-key corrections, recorded here under Q9.
  > 3. Only after the human's approval is the wording final. Until then it is a
  >    draft: FE may build against the keys, but a string the human later corrects
  >    changes in `src/i18n/th.ts` only, never in logic.
  >
  > Whether Sober treats the draft as enough to unblock TASK-003/TASK-004 before the
  > human's review is Sober's call — the delegation came from the human, not from me.
  >
  > **Review result (human, 2026-08-22), verbatim: *"อนุมัติหมด"*** — step 3 of the loop
  > is done: the full 26-key draft in SPEC-001 §7 is **APPROVED as written**, with no
  > per-key correction. The "ช่อง"-for-*slot* choice Sober flagged was put to him
  > explicitly and is included in the approval; so are the two I/O errors ending in
  > *"กรุณาลองใหม่อีกครั้ง"* and `error.duplicateSlotName`. Those values are final
  > wording now (criterion A16), not a draft. @Sober: please mirror this into
  > SPEC-001 §7's heading — the file says "DRAFT … awaiting the human's review".
  > Q9 CLOSED.
  >
  > **Not covered by the approval:** the blank-name warning that Q13's answer newly
  > requires (Requirement 16). It did not exist when he approved the table, so it is a
  > 27th key, drafted by Sober and approved by the human through me in one more short
  > pass — the same loop, one string instead of 26. That second pass ran on
  > 2026-08-22 and its result is recorded below under **Q18**.
- **Q10 — What happens when a slot is renamed to a name that already exists?**
  Requirement 5.3 / A8 say two slots must not end up with the same name, but not what
  the user experiences when they try. Same shape as Q8: is the rename simply not
  accepted (the field reverts / the OK control stays disabled), or is a Thai message
  shown — and if a message, its exact wording? I will not pick this myself.
  **Blocks TASK-003.**
  > answer (human, 2026-08-22), verbatim: *"ไม่รับขึ้นข้อความเตือน (ถ้าเตือน ขอข้อความไทยด้วย)"*.
  > PARTIALLY RESOLVED. What the answer settles beyond doubt: **the duplicate name is
  > refused** — it never takes effect. That half is now Requirement 15 / criterion A11.
  > What it does NOT settle is carried over to Q11 below.
- **Q11 — Does the duplicate-name refusal show a Thai warning, or is it silent?**
  (Raised by Porter, 2026-08-22, out of Q10's answer — not a new topic, the missing
  half of the same one.) The human's sentence reads two ways and I will not pick one:
  - reading (a) *"ไม่รับ + ขึ้นข้อความเตือน"* — refuse the name **and show a warning
    message**; the trailing *"(ถ้าเตือน ขอข้อความไทยด้วย)"* is then his request for the
    wording, which Q9 has since delegated to Sober's draft + his review;
  - reading (b) *"ไม่รับ 'ขึ้นข้อความเตือน'"* — he is **rejecting the warning option**,
    i.e. the rename is refused silently, exactly like the disabled Save control in Q8.
  The trailing parenthesis is a near-verbatim echo of my own question, so it is no
  help in choosing. Under (a) TASK-003 needs one extra Thai string and a place to show
  it; under (b) it needs neither. Question to the human, one line:
  *"ตอนเปลี่ยนชื่อ slot ไปชนชื่อเดิม — ให้ขึ้นข้อความเตือนภาษาไทยด้วย หรือแค่ไม่รับชื่อเงียบ ๆ
  แบบเดียวกับปุ่ม Save ที่กดไม่ได้?"*
  > answer (human, 2026-08-22), verbatim: *"ขึ้นเตือน"* — reading (a). The duplicate
  > rename is refused **and** a Thai warning message is shown. RESOLVED; reflected in
  > Requirement 15 and criterion A11.
  >
  > The consequence, so it does not get lost: this adds **one new Thai user-facing
  > string** that SPEC-001 §7's 25-key table does not yet contain (a "that name is
  > already used" warning). Porter does not invent it — under Q9 the human already
  > delegated Thai drafting to Sober, so this key is drafted together with the rest of
  > §7 and approved in the same review pass. The duplicate-name feedback in TASK-003 is
  > therefore no longer waiting on the human; it waits only on that draft, exactly like
  > every other FE string.
- **Q12 — May Sober settle A-1 and A-2 himself?** (Asked by Porter, 2026-08-22.)
  SPEC-001 §9 lists five SA assumptions the stakeholder may veto. He confirmed
  A-3/A-4/A-5 but said nothing about **A-1** (slot colour is opaque `#rrggbb`, no
  alpha channel) or **A-2** (canvas dimensions are integers limited to 1…10000), so I
  asked whether he wants a say in those two or leaves them to the SA.
  > answer (human, 2026-08-22), verbatim: *"ปล่อย Sober ตัดสินเอง"* — let Sober decide.
  > A-1 and A-2 are closed as SA technical calls: no stakeholder constraint on them and
  > no acceptance criterion of their own (unlike A-3/A-4/A-5, which he actively
  > confirmed and which became A12-A14). Recorded in Constraints. RESOLVED.

- **Q13 — What happens when a slot's name is cleared to blank? (asked by Sober,
  2026-08-22.)** Requirement 5.3 makes slot names free text and unique, and Requirement
  6 says every slot shows its name on the canvas — but nothing says whether the user may
  leave a slot's name empty, and if not, what they see. Same shape as Q8 and Q11: a
  refusal that is either wordless or comes with a Thai warning. One line for the human:
  *"ถ้าผู้ใช้ลบชื่อ slot จนว่าง แล้วกดยืนยัน — ให้ไม่รับเงียบ ๆ (ชื่อเดิมกลับมา) หรือให้ขึ้นข้อความ
  เตือนภาษาไทยด้วย?"*
  If he wants a warning, that is one more key in SPEC-001 §7 and Sober drafts it in the
  same review pass as the rest.
  **Not blocking:** SPEC-001 §5 carries a provisional wordless refusal so TASK-003 can
  proceed; only that one branch changes when the answer arrives.
  > answer (human, 2026-08-22), verbatim: *"ขึ้นข้อความเตือนไทยด้วย"* — the blank name is
  > **refused AND a Thai warning is shown**. RESOLVED; written up as Requirement 16 and
  > criterion A15. The provisional wordless refusal in SPEC-001 §5 is therefore wrong on
  > the feedback half and needs one line changed — @Sober, that branch is yours.
  >
  > Consequence: a **27th** §7 key (blank-name warning). It is outside the 2026-08-22
  > approval (Q9) because it did not exist yet. Sober drafts the Thai, the human approves
  > it through me; FE may build the behaviour against the key meanwhile, exactly as with
  > `error.duplicateSlotName`.

- **Q14 — Are `slot 1` and `Slot 1` two different names?** (SPEC-001 §9 A-6, put to the
  human by Porter as a veto-only item, 2026-08-22. Sober's call was: trimmed,
  case-sensitive compare, so both may exist.)
  > answer (human, 2026-08-22), verbatim: *"ไม่"* — answering "…ถือเป็นคนละชื่อใช่ไหม",
  > so **no, they are not two different names**: uniqueness must be **case-insensitive**.
  > A-6 is vetoed. RESOLVED; Requirement 5.3 and criterion A8 updated, recorded in
  > Constraints. @Sober: SPEC-001 §5's "exact string equality (case-sensitive — §9 A-6)"
  > and §9 A-6 itself are yours to correct. Trimming is untouched by this answer.

- **Q15 — Now that Node is upgraded, does the stakeholder still want Electron latest?**
  (Raised by Porter, 2026-08-22.) The brief names "Electron
  (latest)" as a constraint; TASK-001 shipped pinned to Electron 39.8.10 + Vite 5.x
  because the machine's Node v21.7.3 could not install 43.x (Jason's Q-BE-1). The human
  has since upgraded to Node v22.23.2 himself
  (`../project-docs/2026-08-22-node-upgrade-console.md`), so the reason for the pin is
  gone. What I will not decide for him: whether he wants the dependencies moved up to
  Electron latest now — that is scope/priority, his call — or is content to stay on the
  working pinned versions for this REQ. One line for the human:
  *"ตอนนี้เครื่องเป็น Node 22.23.2 แล้ว — จะให้ย้ายโปรเจกต์ไปใช้ Electron รุ่นล่าสุดตามบรีฟเลย
  หรือใช้รุ่นที่ pin ไว้ตอนนี้ไปก่อนจนจบ REQ-001?"*
  Nothing waits on this: TASK-001's build runs on the pinned versions either way, and
  *when* to move (if he says move) stays Sober's technical call under Q-BE-1.
  > answer (human, 2026-08-22), verbatim: *"ให้ย้ายโปรเจกต์ไป Electron รุ่นล่าสุด ตามบรีฟเลย"*
  > — **move the project to the latest Electron, per the brief.** He picked the first
  > option, and grounded it in the brief rather than in this REQ, so this is not a
  > one-off indulgence: "Electron (latest)" is the constraint he wants honoured.
  > RESOLVED; recorded in Constraints.
  >
  > Porter's note on how far the answer reaches, so nobody stretches it:
  > - It settles **what and whether** — the pinned Electron 39.8.10 does not survive
  >   REQ-001. It does **not** settle **how or when**: rework inside TASK-001 (which is
  >   in REVIEW) or a follow-up task, the exact latest version to land on, and what
  >   re-verification is required are Sober's calls under Q-BE-1. I am not scheduling
  >   engineering work.
  > - It names **Electron only**. Vite 5.x was pinned for the same engines reason but
  >   the brief says plain "Vite", and "React 18" is pinned by the brief itself. Moving
  >   those is neither ordered nor forbidden by this answer — Sober's call.
  > - It changes **no acceptance criterion**. A1-A16 are about behaviour; the human
  >   still accepts the app by using it, not by reading a version number. Criterion A5
  >   (clean checkout, documented run instructions, no undocumented manual step) is the
  >   one that must keep passing after the move.
  > - The machine's Node v22.23.2 is already in place, so this needs no further
  >   irreversible action from the human at this point.

- **Q16 — Should the known esbuild/Vite dev-server advisory be fixed inside REQ-001?**
  (Put to the human by Porter, 2026-08-22, after Jason flagged it as a low-confidence
  assumption in TASK-001 §Questions Q-BE-5 — note this one did **not** arrive as a
  numbered dispatcher question, it was surfaced as a veto opportunity, so there is no
  dispatcher number to map.) `npm audit` on the TASK-001 scaffold reports
  GHSA-67mh-4wv8-2f99 against the esbuild/Vite development server. Jason left it
  untouched and stated his reasons in TASK-001 (dev-server only, the app makes no
  network calls, and the only remedy is a breaking move to Vite 8, which is Sober's
  call, not his). I did not evaluate that reasoning — it is technical and it is not
  mine — but the stakeholder is the one who gets to say whether he is willing to carry
  a known advisory in his own tooling, so I put the choice to him in plain Thai:
  leave it and keep going, or spend this REQ's time on the breaking upgrade.
  > answer (human, 2026-08-22), verbatim: *"ปล่อยช่องโหว่ไว้ — ไปต่อ"*
  > — **leave the vulnerability as it is and continue.** RESOLVED; recorded in
  > Constraints.
  >
  > Porter's note on how far the answer reaches, so nobody stretches it:
  > - It settles **acceptance**: a non-empty `npm audit` is not a defect of REQ-001.
  >   No criterion is added, removed or weakened; A1–A16 are untouched.
  > - It settles **priority**: no REQ-001 effort goes into the advisory, and the
  >   breaking Vite 8 move is not ordered by the stakeholder. It is not *forbidden*
  >   either — if Sober moves Vite for an unrelated technical reason, that is still
  >   his call under Constraints (the brief pins "React 18" and names plain "Vite").
  > - It is **not a general security waiver** and it is **not** about the packaged
  >   app. This REQ ships no installer (Out of Scope) and SPEC-001 §9 A-7 already
  >   defers the CSP to packaging. When packaging becomes a REQ I ask him again, with
  >   whatever the advisory picture is at that time. Nobody may cite this line then.
  > - "ไปต่อ" is the stakeholder's usual nudge to keep the team moving. Per PROTOCOL
  >   it carries **no business content** — it adds no scope, approves nothing else,
  >   and in particular it is not acceptance of TASK-001, which the human has never
  >   seen. TASK-001 sits in REVIEW with Sober; that review is Sober's to complete.

- **Q17 — Does the default slot-name numbering skip a number a user-renamed slot
  already occupies?** (Put to the human by Porter, 2026-08-22, as a veto opportunity
  on a low-confidence SA assumption — like Q16 it carries no dispatcher number.)
  Sober's SPEC-001 §5 "Add slot" says a new slot takes the first free `slot N`, and
  "free" is judged by the same case-insensitive rule as the rename check (Q14), so a
  user who has renamed a slot to `Slot 3` will see the next generated name skip 3.
  It is behaviour the human sees, so it is his to confirm, not ours to assume.
  > answer (human, 2026-08-22), verbatim: *"สมมติฐานถูก"* — **the assumption is
  > correct.** RESOLVED; recorded in Requirement 5.3, criterion A17 and Constraints.
  >
  > Porter's note on how far the answer reaches:
  > - It confirms **behaviour**, so it is promoted the same way A-3/A-4/A-5 were: it
  >   stops being an SA assumption and becomes an acceptance criterion (A17).
  > - It settles only which *number* a new slot gets. The name format (`slot N`,
  >   English) is Q6's; the rename/blank-name rules are Requirements 15/16; and the
  >   case-insensitivity itself was already decided by Q14 — this answer only says
  >   the generator obeys that same rule.
  > - Nothing else in SPEC-001 §5 is approved by it. The human confirmed one stated
  >   behaviour, not the section around it.

- **Q18 — Thai wording of the 27th UI string, `error.blankSlotName`** (Q9's review
  loop, round 2; the dispatcher numbered it **Q17** — see the numbering warning at the
  top of this file). Requirement 16 / criterion A15 say a slot name cleared to blank is
  refused **and** warned in Thai. That warning is a user-facing string that did not
  exist when the human approved the 26-key table, and I invent no wording, so Sober
  drafted it (SPEC-001 §7 "The one key still needing the human") and I put his draft
  and his one alternative to the human, in that order:
  - (ก) *"ชื่อช่องต้องไม่เว้นว่าง กรุณาตั้งชื่อใหม่"* — Sober's draft and his recommendation;
    same shape as the approved `error.duplicateSlotName` (what is wrong, then `กรุณา` +
    what to do);
  - (ข) *"กรุณาตั้งชื่อช่อง"* — shorter, instruction-only;
  - (ค) any other wording of his own.
  > answer (human, 2026-08-22), verbatim: *"Q17=ก"* — he picked the **first** option:
  > **`error.blankSlotName` = *"ชื่อช่องต้องไม่เว้นว่าง กรุณาตั้งชื่อใหม่"***, exactly as
  > Sober drafted it. RESOLVED. With this, **all 27 keys of SPEC-001 §7 are approved**
  > and A16 covers the whole table.
  >
  > Porter's note on how far the answer reaches:
  > - He answered by **letter**, and the three options above are the order they were put
  >   to him, so ก = the draft. If I read the letter wrong the fix is one line and it
  >   changes `src/i18n/th.ts` only — no logic, no criterion, no task status.
  > - It settles **wording only**. The blank-name *behaviour* (refuse, revert, warn,
  >   blank checked before duplicate) was already settled by Q13 → Requirement 16 / A15
  >   and is unchanged by this answer.
  > - It approves the wording of **one key**. It says nothing about the other 26 (Q9
  >   covered those) and nothing about any string a future REQ may need.
  > - @Sober: mirror the value into SPEC-001 §7's `state` column as APPROVED and close
  >   §9 Q-SA-4. The value itself is already in your §7 — I copied nothing.

- **Not a question — the stray files in `ai-worker/` are gone.** The human answered
  the same message with *"ลบแล้ว"* ("deleted already") about the `package.json`,
  `package-lock.json` and `node_modules/` that a mistyped `npm install` left in the
  comms folder on 2026-08-22 (Jason's finding, recorded by Sober in TASK-001 §Review
  N2 — that file is the home of the detail). Porter verified on 2026-08-22 that none
  of the three exists in `ai-worker/` any more, and cleared the board row. Nothing in
  the app repo was ever affected, so no requirement or criterion changes.

- **Q19 — On-screen acceptance of the Layout Designer** (the check Sober routed to me
  at 2026-08-22 15:52, board Blocked row, detail in TASK-003 §Review C). Nobody on this
  team can see the Electron window, so six things stayed unverified and only the human
  could close them: (1) dragging a slot, (2) pulling a transformer handle to resize a
  slot, (3) the live repaint when the colour picker changes, (4) the **stage** rescaling
  when the canvas width/height inputs change, (5) the two inline Thai rename warnings
  (`error.duplicateSlotName`, `error.blankSlotName`) actually appearing under the name
  input, (6) the renderer **DevTools console** being clean.
  > answer (human, 2026-08-22), verbatim: *"รันแล้ว ลากได้ ย่อขยายได้ สีเปลี่ยนสด
  > เตือนไทยขึ้นครบ ไม่มี error"* — he ran it; dragging works; shrink/enlarge works;
  > the colour changes live; the Thai warnings all appear; no error.
  > **PARTIALLY RESOLVED** — four of the six are closed, two are not. See below.
  > (Those two were closed by **Q20** below on 2026-08-22 — 6/6. Detail there, not here.)
  >
  > Porter's note on how far the answer reaches:
  > - **Closed by this answer:** (1) drag — *"ลากได้"*; (3) live colour repaint —
  >   *"สีเปลี่ยนสด"*; (5) both Thai rename warnings — *"เตือนไทยขึ้นครบ"*, where
  >   *ครบ* ("all of them") is what makes it cover **both** messages rather than one.
  > - **Still open — ambiguity I am not resolving by assumption:** *"ย่อขยายได้"*
  >   ("can shrink/enlarge") maps onto **either** (2) resizing a slot by its handle
  >   **or** (4) the stage rescaling on a canvas-size change — they are two different
  >   controls and one Thai phrase covers both readings. I asked about both and got one
  >   phrase back, so I am recording it as covering **one unnamed** of the two, not both.
  > - **Still open — same reason:** *"ไม่มี error"* is consistent with "I opened
  >   DevTools and the console was clean" **and** with "nothing went visibly wrong",
  >   which is a much weaker statement. Item (6) was specifically about the DevTools
  >   console, so I do not read the stronger meaning into it.
  > - Follow-up put to the human as **Q20** below. It blocks nothing: TASK-003 is
  >   already DONE on Sober's own re-verification, and the two open items are
  >   observations, not defects — no code, criterion or task status moves either way.
  > - This answer is **acceptance of on-screen behaviour only**. It is not acceptance
  >   of REQ-001: A1 (save → restart → load round-trip), A4/A13 (dark mode), A5 (clean
  >   checkout run instructions), A6 (Use Template placeholder), A10 (disabled Save) all
  >   depend on work that does not exist yet (TASK-002 rework, TASK-004). The criteria
  >   boxes stay unticked and are ticked in one pass when I verify REQ-001 for DELIVERED.

- **Q20 — the two items Q19 left open** (RESOLVED 2026-08-22; asked of and answered
  by the human the same day).
  Two one-line confirmations, neither blocking anything:
  - (ก) When you said *"ย่อขยายได้"* — did you resize a **slot** by dragging its corner
    handle, change the **canvas width/height** boxes and watch the whole stage rescale,
    or both?
  - (ข) When you said *"ไม่มี error"* — did you **open DevTools** (Ctrl+Shift+I) and see
    an empty console, or did you mean the app simply behaved normally?
  > answer (human, 2026-08-22), verbatim: *"Q19a=ทั้งสองอย่าง"* and *"Q19b=เปิด console
  > แล้วว่าง — รอบหน้าเอา Jason"*. (He labelled them after the question they came from,
  > Q19a/Q19b; they are the (ก)/(ข) above — same numbering hazard as Q21, see the
  > warning at the top of this section.)
  > **RESOLVED — both open items close, and with them all six of Q19's checks.**
  >
  > Porter's note on how far the answer reaches:
  > - (ก) *"ทั้งสองอย่าง"* = **both**: Q19 item (2) resizing a slot by its corner handle
  >   **and** item (4) the whole stage rescaling when the canvas width/height inputs
  >   change are each confirmed on screen.
  > - (ข) *"เปิด console แล้วว่าง"* = he **opened DevTools and the console was empty** —
  >   the strong reading I refused to assume in Q19. Item (6) closes.
  > - Q19's six on-screen checks are therefore **6/6 confirmed by the human**, and
  >   Sober's 15:52 acceptance check (TASK-003 §Review C) is fully answered. Nothing on
  >   TASK-003 moves — it was already DONE on Sober's own re-verification; this only
  >   removes the "unverified on screen" caveat that sat beside it.
  > - Still **not** acceptance of REQ-001: A1 (save → restart → load), A4/A13 (dark mode),
  >   A5 (clean-checkout run instructions), A6 (Use Template placeholder) and A10
  >   (disabled Save) depend on TASK-002's rework and TASK-004, which do not exist yet.
  >   The criteria boxes stay unticked and are ticked in one pass at DELIVERED.
  > - The trailing *"รอบหน้าเอา Jason"* ("next round take Jason") is the human's
  >   **scheduling preference for who runs next**, not business content: it names no
  >   scope, no requirement and no change to any artifact. It agrees with the board as it
  >   already stands — REQ-001's owner of the next step is the TASK-002 rework, which is
  >   Jason's. Porter does not assign engineers (PM.md "Hard boundaries"); it is recorded
  >   here as evidence and passed to the dispatcher as routing information only.

- **Q21 — the eight default slot colours: the human's call or Sober's?** (The dispatcher
  numbered this **Q18**; careful, this file already has a Q18 of its own about the
  `error.blankSlotName` wording — same number, different question. See the numbering
  warning at the top.) Fern chose eight default colours because nothing specified them
  (his Q-FE-1); Sober fixed them as SPEC-001 §9 **A-12** and flagged that they are the
  first thing the human sees and a one-array change. I put the palette to the human as
  a veto opportunity.
  > answer (human, 2026-08-22), verbatim: *"Q18=ให้ Sober เลือกเอง"* — **let Sober
  > choose them himself.** RESOLVED: the palette is delegated to the SA, exactly as
  > A-12 already records it. No veto, no change to the shipped colours.
  >
  > Porter's note on how far the answer reaches: it delegates **this** decision, the
  > eight default slot colours, and nothing wider. Requirement 5.4 / Q4 are untouched —
  > the user still gets a full colour picker and the chosen colour is still persisted;
  > this is only about what colour a slot is *born* with. It also creates no standing
  > rule that future look-and-feel choices are the SA's; each one is asked separately.

- **Q22 — the two BE assumptions Sober ruled on** (Q-BE-6, whether `parseTemplateFile`
  must also reject a blank slot name / duplicate `id`s / non-contiguous `zIndex` in a
  hand-edited file; and Q-BE-7, the trailing newline on the written file). Both are
  technical, both were Sober's to rule on, and he did — SPEC-001 §9 **A-11** and §3
  ("reject what the UI can never produce; accept a bad `zIndex`, the renderer repairs
  it") — but the reject-vs-repair half decides what the human sees when he opens a
  hand-edited file, so I gave him the veto.
  > answer (human, 2026-08-22), verbatim: *"ปล่อยตามที่ Sober ตัดสิน"* — **leave it as
  > Sober decided.** RESOLVED: A-11 and the §3 clause stand as written; no veto.
  >
  > Porter's note on how far the answer reaches: it confirms Sober's ruling as it is
  > written today. It is not blanket pre-approval of future technical rulings, and it
  > adds no acceptance criterion — a hand-edited JSON file is not something REQ-001
  > asks the human to produce (see Out of Scope).

- **Q23 — the human's new working rule: he does the commits** (ANSWERED 2026-08-22; asked
  2026-08-22). He sent it as a standing instruction, verbatim:
  *"ต่อจากนี้ทำงานอย่่างเดียว การcommitเดี๋ยวฉันทำเอง"* — "from now on just do the
  work; I'll do the committing myself." Recorded in Constraints above with only the
  part the sentence actually settles. It blocks nothing in flight: TASK-002's rework
  is already committed at `097c045` and Sober can review it as it stands.
  Three one-line confirmations I will not answer by assumption, because the whole
  team's hand-off mechanism hangs off them:
  - (ก) Does the rule cover **`git add` and creating branches** as well, or only
    `git commit`? (Jason cut branch `task-002-ipc-seam-r1` earlier today.)
  - (ข) When an engineer finishes, **what should he hand over** — leave the changed
    files uncommitted in the working tree and report which files they are, so you
    commit before the reviewer looks? Or something else you have in mind? Today a
    review always names a commit (`accepted at <sha>`), and with nothing committed
    there is no SHA to name and the next engineer's work lands on top of the
    previous one's uncommitted files.
  - (ค) Do the commits **already made** (`bae3f6c`, `77673af`, `097c045` and the
    rest) stand as they are? I am asking only whether they stay — nobody will rewind
    or delete anything either way.
  > answer: **ANSWERED 2026-08-22 by the human**, three separate lines. Verbatim Thai
  > first, then only what each line settles.
  > - (ก) *"ทุกอย่าง เกี่ยวกับการเอาgit ขึ้น ทั้ง add comment createbranch ทำได้แค่เพิ่มgit
  >   ignore อะไรแบบนั้น"* — the rule is **everything that puts work into git**, not just
  >   `git commit`: `git add`, commit (his "comment") and **creating branches** are all
  >   his alone, alongside the existing no-`git push` constraint. What a role may still
  >   do is **edit files** — he names adding a `.gitignore` as the example of what is
  >   still fine. Editing a file is not a git operation; running a git write command is.
  > - (ข) *"แล้วแต่เลย หรือ จะส่งรายชื่อการแก้ให้ sober ไปreview ก็ได้ แค่ฉัน แล้วแต่ช่วงที่ฉันจะ
  >   commit and sync เพราะฉันอาจจะดูก่อน ทำ"* — he leaves the hand-off shape to the team
  >   ("แล้วแต่เลย") and offers one form himself: **hand Sober the list of changed files
  >   and let him review the uncommitted work**. Committing stays only his ("แค่ฉัน"), on
  >   **his** timing ("แล้วแต่ช่วงที่ฉันจะ commit and sync"), because he may look at the
  >   change before he commits it. Consequence he accepted by saying this: a review can
  >   no longer wait for a SHA, and work may sit uncommitted across more than one task.
  >   **The mechanism itself — what a hand-off packet contains, how a review cites work
  >   with no SHA, and how one task's uncommitted files are told from the next one's —
  >   is left to the team, which makes it Sober's design call**, not Porter's and not an
  >   engineer's self-service choice.
  > - (ค) *"คงไว้"* — **the commits already made stand.** `bae3f6c`, `77673af`, `097c045`
  >   and the rest stay as history; nothing is rewound, rebased or deleted. By the same
  >   answer the branch Jason already cut (`task-002-ipc-seam-r1`) is left alone — but
  >   whether later work continues on it or on `develop` is a routing decision for Sober,
  >   and (ก) means **no new branch may be cut by a role** either way.
  > Porter's note on reach: a working rule, not scope — no requirement, acceptance
  > criterion or Thai string changes. It does not by itself close or re-word any DoD box;
  > TASK-004's "Committed locally" box is Sober's to handle now that the answer exists.
  > One boundary the human's words do not mention either way: **read-only** git
  > inspection (`git status`, `git diff`, `git log`) puts nothing "ขึ้น" and is being
  > treated as still allowed — flagged to the human for a one-line veto if he disagrees.
  > (2026-08-23: Q24 came back without touching it — **no veto received, so it stands
  > as allowed**. Not re-asked; he can veto it any time.)

- **Q24 — REQ-001 acceptance: the second and last on-screen round** (RESOLVED
  2026-08-23). Three things went to the human together: the **six on-screen checks**
  nobody in the team has a window to run (TASK-004 §Review C — real save round trip
  through the native dialogs, both dialogs cancelled, a non-template `.json`, dark
  mode, the Thai window title, the inert Use Template entry); the **FYI veto** left
  open on Sober's Q-FE-5 trim ruling (the saved template `name` is trimmed at the
  save boundary while the input box keeps exactly what he typed); and the state of
  the uncommitted hand-off under his own Q23 rule.
  > answer (human, 2026-08-23), verbatim: *"commit แล้ว, ตรวจ 6 ข้อผ่านหมด, trim โอเค"*
  > — he has committed; he checked the six items and they all pass; the trim is fine.
  > **RESOLVED — REQ-001 is accepted and set to DELIVERED.**
  >
  > Porter's note on how far the answer reaches:
  > - *"ตรวจ 6 ข้อผ่านหมด"* = **6/6 on screen** for TASK-004 §Review C's list, the last
  >   thing standing between this REQ and DELIVERED. Together with Q19/Q20's 6/6 for
  >   TASK-003, every on-screen item this REQ ever needed is confirmed by the human.
  >   The criteria boxes are ticked in the single pass promised in Q19/Q20; which box
  >   rests on which evidence is in the verdict block at the end of §Acceptance Criteria.
  > - *"trim โอเค"* = **no veto** on the Q-FE-5 ruling. It approves shipped behaviour and
  >   orders no change; it also does not turn "trim at the boundary" into a standing rule
  >   for anything else — a future field that needs trimming is asked about on its own.
  > - *"commit แล้ว"* = the work is **in git, by his hand**, exactly as his Q23 rule says
  >   (no role committed anything). What it does **not** say, and I am not assuming: the
  >   SHA, whether the commit contains exactly the five files of the round-2 hand-off
  >   packet, and whether the working tree is clean now. Asked as **Q25 (ก)** — the next
  >   piece of work needs a base to cite.
  > - **Not settled — the one caveat disclosed with item (5):** the window title flashes
  >   the English `layout-pattern-app` from `index.html` until React mounts. "ผ่านหมด"
  >   says the check passed; I read it as neither a complaint nor an explicit acceptance
  >   of the flash, so it is asked plainly as **Q25 (ข)**. Cosmetic, shipped, blocks
  >   nothing.
  > - **Not scope.** Nothing in these three phrases starts Use Template (REQ-002) or
  >   changes any requirement, criterion or Thai string. The go-ahead for the next REQ is
  >   asked as **Q25 (ค)**.

- **Q25 — three one-line follow-ups after acceptance** (ANSWERED 2026-08-23; (ก)
  answered in part).
  None of them blocks REQ-001, which is DELIVERED either way; (ก) and (ค) are what the
  *next* piece of work needs before it can start.
  - (ก) After *"commit แล้ว"* — what is the **commit SHA**, and is the working tree
    clean now? A review with no base to cite is the exact problem SPEC-001 §10 was
    written for.
  - (ข) When the app opens, the window title shows the English `layout-pattern-app`
    for a moment before the Thai title appears. **Fine as is, or do you want it
    fixed?** (If fixed, it is a new small requirement, not a defect in REQ-001.)
  - (ค) REQ-001 is delivered. **Shall I start REQ-002 (Use Template mode) now**, or is
    there something else you want first?
  > answer (human, 2026-08-23), verbatim: *"Q26a = e6faa0fb4f9dcb540f244bfe019e698ee33d6882 , Q25b=ปล่อยไว้, Q25c=เริ่ม REQ-002 เลย"*
  > **RESOLVED for (ข) and (ค); (ก) is answered in part.**
  >
  > Porter's note on how far the answer reaches:
  > - **Label mismatch, not an ambiguity of content.** He wrote the SHA against
  >   "Q26a"; this file has no Q26, and a 40-hex commit id answers exactly one open
  >   question — Q25 (ก). Recorded here as that answer; no Q26 invented.
  > - **(ก) — base commit = `e6faa0fb4f9dcb540f244bfe019e698ee33d6882` (`e6faa0f`).**
  >   That is the base the next piece of work cites. What he did **not** answer:
  >   whether the working tree is clean now, and whether that commit contains exactly
  >   the five files of the round-2 hand-off packet. Not re-asked yet — read-only
  >   `git` inspection stands as allowed (Q23 tail), so **checking the commit against
  >   the packet is Sober's**; the human is troubled again only if it disagrees.
  > - **(ข) — *"ปล่อยไว้"* = leave the window-title flash as it is.** Accepted shipped
  >   behaviour: no new requirement, no defect, no task. Reach: it settles this one
  >   flash only — it is not a general ruling that English may appear before Thai
  >   anywhere else.
  > - **(ค) — *"เริ่ม REQ-002 เลย"* = go-ahead to start REQ-002 (Use Template).** It
  >   starts the requirement and nothing more: it answers none of REQ-002's own six
  >   open business questions, so REQ-002 opens as DRAFT with those questions to him.
  > - Nothing in these three answers changes REQ-001: it stays DELIVERED, all 17
  >   criteria ticked, no criterion and no Thai string touched.
