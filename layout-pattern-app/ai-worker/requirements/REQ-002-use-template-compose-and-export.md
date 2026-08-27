# REQ-002: Use Template — compose photos into a saved layout and export a PNG
- Status: SPEC_DONE
- Priority: HIGH
- Requested: 2026-08-23 by human (stakeholder)
- Deadline: none

Source material: `../project-docs/project-brief-from-human.md`, section
**"2. Use Template"** — the half of the brief REQ-001 deliberately left out
(REQ-001 §Out of Scope, first bullet). The human's go-ahead to start it is
REQ-001 §Questions **Q25 (ค)**, answered 2026-08-23: *"เริ่ม REQ-002 เลย"*.

**Status is READY_FOR_SA as of 2026-08-23.** All nine business questions
(Q1–Q9) have been answered by the human and are recorded verbatim in
`## Questions`, together with exactly how far each answer reaches. The last three
(Q7–Q9, answered 2026-08-23) settled the one that was blocking:

- **Q7 = ก, *"ของเก่าถือว่า require หมด"*** — the required/optional mark is a
  **slot property set in Layout Designer and saved into the template file**, and
  every template saved before this change counts as **all slots required**. This
  deliberately widens the REQ: Layout Designer and the template file format are
  now in scope, **for this one mark and nothing else** (see §Constraints and
  §Out of Scope, both amended).
- **Q8 = *"เอาออกได้"*** — a photo can be taken back out of a slot (Requirement 16).
- **Q9 = *"ตัดส่วนเกินทิ้ง"*** — photos beyond the slot count are discarded
  (Requirement 17).

**Second round, 2026-08-23 — Q10 came back together with three of Sober's
questions and one confirmation** (Q11-Q14 below): a multi-photo bring-in fills
**only empty slots**, the 18 draft Thai strings are **all approved**, "several at
once" stays the **native dialog** (no drag-and-drop), a new slot starts
**required**, and surplus photos are dropped **silently**. Nothing business-side
is open on this REQ any more.

**Third round, 2026-08-23 — Q15 closed, one of Sober's questions answered, two
new one-liners open.** **Q15**: the commit holding TASK-005 is **`fc9ba21`**,
tree clean. **Q16** (= SPEC-002 Q-SA-5): a photo that will not decode **fails the
whole multi-pick**, which confirms the spec — no Requirement and no criterion
moves. Still open, both **non-blocking** and neither about the product itself:
**Q17** (the id of his second commit of the day, the one holding the still
unreviewed TASK-006 + TASK-007 work) and **Q18** (whether *"รอบหน้า Sober
รีวิวสองก้อน"* means one session or two).

**Fourth round, 2026-08-23 — Q17 closed, Q18 closed by events, one product
decision taken, two new one-liners open.** **Q17**: the second commit is
**`6879acf`**, tree clean — the human's own word on the id Sober had only
observed. **Q18** is closed without an answer: both reviews are finished, one per
session. **Q19**: shown the required/optional checkbox is painted by the OS colour
scheme and not by the app's dark mode, he answered *"ปล่อยไว้"* — the checkbox
ships as it is, so **no Acceptance Criterion of this REQ needs its appearance
fixed**. Newly open, both **non-blocking**: **Q20** (the id of the third commit of
the day, the one holding TASK-008's packet, which he says he has now made) and
**Q21** (whether *"ปล่อยไว้"* covers only the checkbox or the same OS-colour gap
everywhere in the app — the colour input has it too and shipped in REQ-001).

**Fifth round, 2026-08-23 — Q20 and Q21 closed, N-SA-6 given a go-ahead, one new
one-liner open. Status moves to SPEC_DONE.** All five TASKs of SPEC-002 were
accepted by Sober on 2026-08-23 (board + TASK-009 §Review), so this REQ is
`SPEC_DONE` and the only thing between it and `DELIVERED` is the human's own
acceptance pass on a screen. **Q20**: the commit holding TASK-008's packet is
**`de33ff9`**, tree clean. **Q21**: *"ปล่อยไว้"* covers **the whole app**, not
just the checkbox — every OS-painted native control ships as it is, so Sober's
unwritten dark-mode TASK is **dropped, not deferred**. **Q22**: N-SA-6, the
cosmetic `$`-pattern defect in the Generate refusal message, is to be fixed
**now** rather than parked (*"แก้เลย"*) — a priority call; how it is packaged is
Sober's. Newly open and **non-blocking**: **Q23** (the id of the fifth commit of
the day, the one holding TASK-009's packet).

**Sixth round, 2026-08-23 — Q23 closed, the release-ordering ruling taken (Q24),
one new one-liner open (Q25). Status stays SPEC_DONE.** **Q23**: the commit
holding TASK-009's packet is **`b9389e1`**, tree clean — the human's own word on
the id Sober had only observed read-only. **Q24**, and this is the one that
matters for the finish line: asked whether `DELIVERED` should wait for TASK-010
(Sober's N-SA-6 fix, accepted but sitting uncommitted at the time) or ship
without it, he answered **"DELIVERED รวม TASK-010 ด้วย"** — the delivery
**includes** TASK-010. In the same breath *"commit แล้ว"* a fifth time, covering
TASK-010's one-file packet on base `b9389e1`, again without an id → **Q25**,
non-blocking. So TASK-010 is both accepted and in git, and **nothing between this
REQ and `DELIVERED` is on the team any more**: the whole remainder is the human's
own on-screen pass, which has not come back yet.

**What REQ-002 is still waiting for: the human at a screen.** Nobody on the team
has a window, a native dialog or a real photo, so a fixed list of checks can only
be done by him. The list lives in one place — **TASK-009 §Review G** — and is
carried into §Acceptance Criteria below as a note. Everything not on that list has
been verified by Sober.

## Problem / Goal

REQ-001 gave the human a way to *design* a layout. On its own a layout produces
nothing: it is an empty frame saved as JSON. This REQ makes the layout pay off —
the human picks a template he saved earlier, puts his own photos into its slots,
and gets one finished full-resolution image out of it.

Outcome of this REQ: the human opens the app, switches to **Use Template**,
picks one of his saved templates, fills its slots with photos from his machine,
presses Generate, and ends up with a PNG file on disk at the template's own
canvas size, with each photo sitting exactly where its slot is.

## Requirement

1. **Use Template must become a working mode.** REQ-001 Requirement 2 left it as
   a visible but inactive placeholder; this REQ replaces the placeholder with the
   real mode. Layout Designer must keep working exactly as delivered, **with the
   single exception of the required/optional mark added by Requirement 15**.
2. The user must **choose the saved template by picking its `.json` file in a
   native Open dialog, every time** — the same way Load Template already works in
   Layout Designer (Q1, answer ก). The app keeps no folder, no list, and remembers
   nothing about templates between runs.
3. Once a template is chosen, the app must show a **preview of that layout** at
   the template's own canvas proportions: every slot drawn as a **transparent
   rectangle with its name shown**, in the template's stacking order.
4. The user must be able to **put an image file from their own machine into a
   slot in either of two ways** (Q2, *"ทั้งสองแบบ"*): (a) choose a photo for one
   named slot at a time, and (b) bring several photos in at once, which are
   matched to slots **in the order the on-screen slot list shows them** — which in
   the shipped app means front-most slot first (REQ-001 Requirement 7; that list
   is top-most first). Both ways must work; neither replaces the other.
   **A multi-photo bring-in fills only the slots that are still empty** (Q11,
   *"เฉพาะช่องว่าง"*): a slot the user has already filled by hand is never
   overwritten by it — replacing a photo stays a deliberate, per-slot act
   (Requirement 13). And "several at once" means **multi-select in the native Open
   dialog**; dragging files from Explorer onto the window is not part of this REQ
   (Q12, *"dialog พอ"*).
5. An image placed in a slot must be shown **filling that slot completely,
   centre-cropped, with its aspect ratio preserved** (`object-fit: cover`): no
   stretching, no distortion, no letterboxing — the overflow is cropped away
   evenly around the centre.
6. Pressing **Generate** must produce **one finished image at the template's full
   resolution** — exactly `canvasWidth` x `canvasHeight` pixels as stored in the
   template file, regardless of how large or small the on-screen preview is —
   with every image drawn at its own slot's position and size, cover-cropped as
   in Requirement 5, and the slots' stacking order respected.
7. The generated image must be **saved as a PNG file to a folder the user chooses
   in a native Save dialog**, the same way saving a template works in REQ-001.
8. **All new on-screen text must be in Thai**, continuing REQ-001 Requirement 12
   and its review loop: Sober drafts the wording, the human approves it through
   Porter before it ships (REQ-001 Q9). Nobody on the team invents or ships a
   user-facing string unreviewed.
9. The new mode must work in **dark mode** as well as light, to the same basic
   standard as REQ-001 Requirement 10.
10. A template file the app cannot use (not a template, or damaged) must be
    **refused with a Thai message** rather than crashing the app — the same
    standard REQ-001's Open path already meets.
11. **Accepted photo types are JPG and PNG only** (Q5). The picker the user is
    offered must be limited to those; nothing else is promised by this REQ.
12. **Everything in the generated PNG that no photo covers must be fully
    transparent** (Q4, *"โปร่งใส"*) — both the area outside every slot and any slot
    left without a photo. No background colour is painted.
13. The user must be able to **put a different photo into a slot that already has
    one**, any number of times, before pressing Generate (Q6, *"เปลี่ยนได้"*).
14. **Slots must be markable as required or optional**, and Generate must behave
    accordingly (Q3, *"ตั้งได้ อันไหน require อันไหน optional"*): it refuses, with a
    Thai message naming the problem, while any **required** slot is still empty;
    it goes ahead when only **optional** slots are empty, leaving those areas
    transparent per Requirement 12. Where the mark is set is Requirement 15.
15. **Layout Designer must let the user mark each slot as required or optional,
    and that mark must be saved in the template file and come back when the
    template is loaded again** (Q7, answer ก). Consequences the human accepted by
    choosing ก, all of them in scope for this REQ:
    a. The designer gains a per-slot required/optional control, alongside the slot
       properties REQ-001 already gives it (name, position, size, colour, z-order).
    b. The template file format gains one per-slot mark. Nothing else about the
       format changes.
    c. **A template file that carries no mark — i.e. every template the human
       saved before this change — must load with all of its slots treated as
       required** (*"ของเก่าถือว่า require หมด"*), in both modes, without an error
       and without the user having to do anything. Once such a template is opened
       in the designer the user may of course change the marks and save it again.
    d. A newly created slot's mark starts at **required**, so a template the user
       never touches the control on behaves exactly like an old one. **Confirmed
       by the human on 2026-08-23** (Q14, *"required"*) — no longer my inference.
16. **The user must be able to take a photo back out of a slot**, leaving it
    empty, not only replace it with another (Q8, *"เอาออกได้"*). A slot emptied
    this way is empty for every purpose: it is transparent in the output per
    Requirement 12, and if it is a required slot it blocks Generate per
    Requirement 14.
17. **When more photos are brought in at once than there are slots to take them,
    the extra photos are discarded** (Q9, *"ตัดส่วนเกินทิ้ง"*): the slots that fit
    are filled in the on-screen list order of Requirement 4, the surplus photos
    are dropped, and the app carries on — it must not refuse the whole drop and
    must not crash. **Nothing is shown to the user when this happens** (Q10,
    answer ก): the slots that fit are filled and the app carries on silently — no
    notice, no count, no message. Since a multi-photo bring-in only touches empty
    slots (Requirement 4 / Q11), "the slots that fit" means the **empty** ones and
    the surplus is counted against those.

## Acceptance Criteria

*(Written from the stakeholder's seat: each is something the human can check on
screen. Boxes are ticked only when the human has seen it or Sober has verified it,
and the verdict says which — same rule as REQ-001.)*

**Acceptance pass opened 2026-08-23 (Porter).** No box is ticked yet — I am not
ticking any of them off Sober's word alone while the human's own pass is still to
come, and B1 is holistic enough that it can only be judged after the rest. What
each side owns:

- **The human's own eyes, on a running app** — nine checks, and the complete
  reasoning for why no harness here can stand in for them is Sober's, in
  **TASK-009 §Review G**: **B1** (the whole unaided flow), **B3**, **B5**'s
  pixels, **B4**'s pixel size, **B7** (the real Save dialog and cancelling it),
  **B9**, **B12**, **B14**, **B15**'s pixels. Plus **N-SA-1**, which is not a
  criterion but a seam risk riding on the same pass: if the first real export
  refuses with `INVALID_PAYLOAD` instead of saving, that is a **defect for
  Sober**, not something for the human to work around.
- **Already verified by Sober**, per his reviews of TASK-005 through TASK-009:
  every criterion not named above. When the human's pass comes back, each box gets
  ticked with which of the two it rests on, and the REQ moves to `DELIVERED`.
- **What the delivery contains, ruled by the human 2026-08-23 (§Questions Q24):**
  `DELIVERED` **includes TASK-010** (the N-SA-6 refusal-message fix), not just
  TASK-005 → TASK-009. TASK-010 is `DONE` and in git, so this costs no waiting —
  it only fixes what the word "delivered" will name. Riding along, **optional and
  skippable**: one extra on-screen look, *not* a criterion — a slot named `A$&B`,
  required, left empty, `สร้างภาพ` pressed, and the red Thai line must show the
  name literally (offered by Sober, TASK-010 §Review F). Nothing is ticked or
  untied by it; Sober's review already verified the string.

- [ ] B1. **The whole flow, unaided:** open the app, switch to Use Template, pick
      a template saved from the designer, fill its slots with photos, press
      Generate, choose a location, and find a PNG there — without instructions.
- [ ] B2. The chosen template's slots appear in the preview at the right relative
      positions and sizes, each showing its name, matching the layout as designed.
- [ ] B3. A photo placed in a slot appears centre-cropped and undistorted, filling
      the slot edge to edge.
- [ ] B4. The generated PNG measures exactly the template's `canvasWidth` x
      `canvasHeight` in pixels.
- [ ] B5. In the generated PNG each photo sits at its slot's position and size,
      cropped the same way it looked in the preview.
- [ ] B6. Where slots overlap, the generated PNG stacks them in the same order the
      designer showed.
- [ ] B7. Cancelling the Save dialog writes no file and leaves the app usable.
- [ ] B8. Every piece of text in the new mode is Thai, and matches the wording the
      human approved.
- [ ] B9. The mode is usable and readable in dark mode.
- [ ] B10. Choosing a file that is not a valid template shows a Thai message and
      does not crash the app.
- [ ] B11. Layout Designer still does everything REQ-001 delivered (spot-check of
      REQ-001 A1).
- [ ] B12. Picking a template is a native Open dialog on a `.json` file, exactly
      like Load Template; cancelling it leaves the app as it was.
- [ ] B13. Choosing a photo for one named slot works, **and** bringing several
      photos in at once fills the slots in the order the on-screen list shows them
      — and the user can tell that order by looking at the screen beforehand.
      Photos already placed by hand are left alone (Q11).
- [ ] B14. The photo picker offers JPG and PNG.
- [ ] B15. Opened in something that shows transparency, the generated PNG is
      see-through everywhere no photo covers — outside the slots and in any empty
      slot — with no background colour.
- [ ] B16. A slot that already holds a photo can be given a different one before
      Generate, and the preview and the PNG both show the new photo.
- [ ] B17. Generate refuses with a Thai message naming the problem while a
      **required** slot is empty; with only **optional** slots empty it produces
      the PNG and those areas are transparent.
- [ ] B18. In Layout Designer a slot can be marked required or optional; saving
      the template and loading it again brings the marks back unchanged, and Use
      Template acts on them (B17).
- [ ] B19. **A template saved before this change opens normally in both modes and
      every one of its slots behaves as required** — no error, nothing for the
      user to fix first.
- [ ] B20. A photo already in a slot can be taken back out, leaving the slot
      empty: the preview shows it empty, the generated PNG is transparent there,
      and if that slot is required, Generate refuses (B17).
- [ ] B21. Bringing in more photos at once than the template has slots fills the
      empty slots in list order, discards the surplus, and leaves the app working —
      it does not refuse the whole drop, and **no notice is shown** (Q10 = ก).

## Constraints

- Everything REQ-001 fixed stays fixed, in particular: the stakeholder's tech
  stack; the single repo `H:\layout-pattern-app\layout-pattern-app`; local only,
  no deployed environment, the human is the only acceptance tester; **all git
  writes are the human's alone** (REQ-001 Q23); Thai UI with the Q9 review loop.
- **The app owns no template folder** (REQ-001 Q1): template files live wherever
  the user chose to save them. Q1 below confirms this stays true — the user picks
  the file each time; the app builds no list and remembers no path.
- The template file format is the one REQ-001 already ships and the human already
  has files in — `name`, `canvasWidth`, `canvasHeight`, `slots[]` with `id`,
  `name`, `x`, `y`, `width`, `height`, `zIndex`, colour. **Templates the human
  saved under REQ-001 must keep working.** Amended 2026-08-23 by **Q7 = ก**: the
  format gains **one** addition, the per-slot required/optional mark of
  Requirement 15 — and nothing else. Backward compatibility is not optional here,
  it is Requirement 15c and criterion B19: a file without the mark loads with
  every slot required.
- Output format is **PNG**, named by the brief. Nothing else is asked for.
- The window-title flash disclosed at REQ-001 acceptance is **accepted as
  shipped** (REQ-001 Q25 (ข), *"ปล่อยไว้"*) and is not part of this REQ.
- Baseline for this work: the human's own commits of 2026-08-23 — `e6faa0f`
  (REQ-001 Q25 (ก)), where TASK-004 landed; **`fc9ba21`** on top of it, where
  TASK-005 landed (Q15, *"fc9ba21 ใช่"*, tree clean); **`6879acf`** on top of
  that, where TASK-006 + TASK-007 landed (Q17, *"6879acf ใช่"*, tree clean); and
  **`de33ff9`** on top of that, where TASK-008's eight-file packet landed (Q20,
  *"de33ff9 ใช่"*, tree clean). A fifth commit of the same day holds TASK-009's
  three-file packet (*"commit แล้ว"*); its id has not been given yet (Q23). Work
  still moves between roles as a hand-off packet, never through git.

## Out of Scope

- Any change to Layout Designer's behaviour or to the template file format,
  **except the required/optional mark of Requirement 15**, which Q7 (answer ก)
  put into both of them on 2026-08-23. That one mark is in scope; every other
  designer behaviour and every other part of the format stays exactly as REQ-001
  delivered it.
- Image editing of any kind — rotate, zoom, pan, reposition the crop inside a
  slot, filters, brightness, borders, text overlays. The brief asks for cover
  crop and nothing more.
- Photo types other than JPG and PNG (Q5) — no WEBP, no HEIC, no RAW.
- **Dragging files from Explorer onto the window** (Q12, *"dialog พอ"*): photos
  come in through the native Open dialog only, one slot at a time or multi-select.
  Drag-and-drop is a separate input path and would be a new REQ.
- Producing an installer / packaged distributable (still REQ-001's out-of-scope
  item, unchanged).
- Undo/redo, printing, batch generation over many templates, exporting anything
  other than a single PNG, cloud storage, login or sharing.

## Questions

*(Q1–Q6 were asked on 2026-08-23 and answered the same day. The human's words are
verbatim Thai, followed by exactly how far each answer reaches and nothing more.
Q7–Q9 are what those answers left open — they are what blocks this REQ.)*

- **Q1 — How should the user pick a template?** (ก) native Open dialog each time /
  (ข) a remembered "recent" list / (ค) point the app at one folder once.
  > answer (2026-08-23, human): **"ก"**
  > - Reaches: option (ก) exactly as it was put to him — *pick the `.json` file
  >   each time in a native Open dialog, like Load Template already does*. Written
  >   into Requirement 2 and B12.
  > - Also settles, by elimination, that the app keeps **no** recent list and **no**
  >   remembered folder — those were (ข) and (ค), and he did not take them.
  > - Does not say which folder the dialog opens in; he was not asked that, and it
  >   is a presentation detail, not a business decision.

- **Q2 — How do photos get into slots** — one per slot, several at once matched
  *"ตามลำดับ"*, or both? And which order are the slots in — creation order, the
  side-panel order, or the stacking order?
  > answer (2026-08-23, human): **"ทั้งสองแบบ ลำดับในลิสต์"**
  > - Reaches: **both** ways must work (Requirement 4), and the matching order is
  >   **the order of the on-screen slot list**.
  > - Fact, not interpretation: in the app as shipped the slot list is **top-most
  >   first** (SPEC-001 §Z-order, TASK-003), so of the three orders offered, "the
  >   list" and "the stacking order" are the *same* order — the front-most slot
  >   takes the first photo — and creation order is ruled out.
  > - Does not reach what happens when the counts do not match — see **Q9**.

- **Q3 — Generate when not every slot has a photo:** refuse, or go ahead?
  > answer (2026-08-23, human): **"ตั้งได้ อันไหน require อันไหน optional"**
  > - Reaches: neither option as asked. He wants the *slot* to carry the answer —
  >   each slot marked required or optional — so Generate refuses only for an empty
  >   **required** slot and proceeds when only **optional** ones are empty. Written
  >   into Requirement 14 and B17.
  > - Does not reach — and this is what keeps the REQ DRAFT — **where the mark is
  >   set, and what the templates he already has count as**: see **Q7**.

- **Q4 — What should the empty parts of the PNG look like?**
  > answer (2026-08-23, human): **"โปร่งใส"**
  > - Reaches: fully **transparent**, both outside the slots and inside any slot
  >   left empty. No background colour. Requirement 12, B15.

- **Q5 — Which image file types must the app accept?**
  > answer (2026-08-23, human): **"JPG/PNG"**
  > - Reaches: **JPG and PNG only**. Requirement 11; everything else is named in
  >   §Out of Scope. (".jpeg" is the same format as JPG, not a second decision.)

- **Q6 — After a photo is in a slot, must the user be able to change it?**
  Replace it, and/or take it out again leaving the slot empty?
  > answer (2026-08-23, human): **"เปลี่ยนได้"**
  > - Reaches: **replace** — a slot that holds a photo can be given a different
  >   one. Requirement 13, B16.
  > - Does **not** reach the second half of the question — taking the photo out
  >   again and leaving the slot empty. See **Q8**.

- **Q7 — Where is "required / optional" set, and what are the templates he already
  has?** Q3's answer needs a home, and there are only two: (ก) **in Layout
  Designer**, as a slot property saved into the template file — which changes the
  designer *and* the file format, both of which this REQ currently rules out, and
  needs a rule for templates saved before the change (do they count as all
  required, or all optional?); or (ข) **in Use Template**, ticked per slot after
  the template is opened and saved nowhere, so every session starts from one
  default (which default?). Which of the two, and which default?
  > answer (2026-08-23, human): **"ก ของเก่าถือว่า require หมด"**
  > - Reaches: option (ก) exactly as it was put to him — the mark is a **slot
  >   property set in Layout Designer and saved into the template file**. Option
  >   (ข), the per-session tick in Use Template, is ruled out by elimination.
  > - Reaches, second phrase: a template **saved before this change counts as all
  >   slots required**. Requirement 15c, criterion B19.
  > - Consequence he accepted by choosing ก, and which I have therefore written in
  >   rather than worked around: this REQ now touches Layout Designer and the
  >   template file format, which its own §Constraints and §Out of Scope forbade.
  >   **Both sections are amended, narrowly** — this one mark and nothing else.
  > - Does **not** reach: what the control looks like or what it is called on
  >   screen (that is Requirement 8's Thai-wording loop — Sober drafts, the human
  >   approves through me), nor the field name inside the JSON, which is Sober's
  >   technical call.
  > - Not asked, so flagged rather than assumed silently: a **newly created** slot
  >   starts **required** (Requirement 15d). That is the reading that makes his
  >   second phrase hold — a template he never touches the new control on behaves
  >   exactly like one of his old ones. If he wants new slots to start optional
  >   instead, it is a one-line change and he can say so any time.

- **Q8 — Can a photo be taken out of a slot again**, leaving it empty, or is
  replacing it with another photo enough?
  > answer (2026-08-23, human): **"เอาออกได้"**
  > - Reaches: the user **can take the photo out**, leaving the slot empty — not
  >   only replace it. Requirement 16, criterion B20.
  > - Follows from rules already agreed, not a new decision: an emptied slot is
  >   transparent in the output (Requirement 12) and, if it is required, it blocks
  >   Generate (Requirement 14).
  > - Does not reach how it is done on screen (a button, a menu, a key) — that is
  >   design plus the Requirement 8 wording loop, not business.

- **Q9 — Bringing in more photos than the template has slots:** ignore the extra
  ones, or refuse the whole drop with a message?
  > answer (2026-08-23, human): **"ตัดส่วนเกินทิ้ง"**
  > - Reaches: the surplus photos are **discarded** and the slots that fit are
  >   filled in list order; the whole drop is **not** refused. Requirement 17,
  >   criterion B21.
  > - Does **not** reach whether the user is *told* that photos were dropped —
  >   "ตัดทิ้ง" says what happens to the files, not what the screen says. That is
  >   **Q10**, and it does not block: the REQ is buildable either way and the
  >   answer changes at most one Thai message.

- **Q10 — When surplus photos are discarded (Q9), does the app tell the user?**
  (ก) say nothing, just fill what fits / (ข) show a short Thai notice, e.g. that
  N photos did not fit. *Non-blocking* — REQ-002 is READY_FOR_SA either way; if
  the answer arrives after Sober has specced it, it is a one-message change.
  > answer (2026-08-23, human): **"ก"**
  > - Reaches: option (ก) exactly as it was put to him — **say nothing**, just fill
  >   what fits. Requirement 17 amended, criterion B21 closed.
  > - Consequence for the team: the notice string drafted against this question is
  >   **not** shipped. Nothing is shown, so no key, no logic, no criterion moves.

*(Q11-Q14 are Sober's questions, put to the human on 2026-08-23 and answered the
same day. He asked them in SPEC-002 as Q-SA-1 / Q-SA-2 / Q-SA-3; that file is his
to update — the answers are recorded here, in mine, and he transcribes them.)*

- **Q11 (= SPEC-002 Q-SA-1) — When several photos come in at once, do they fill
  only the *empty* slots, or fill from the top of the list and overwrite photos
  already placed?** (ก) skip filled slots / (ข) fill from the top, overwriting.
  Blocks TASK-008 and nothing else.
  > answer (2026-08-23, human): **"เฉพาะช่องว่าง"**
  > - Reaches: **only the empty slots** — option (ก) as it was put to him, said in
  >   his own words instead of by letter. A slot he has already filled by hand is
  >   never disturbed by a multi-pick. Requirement 4 amended, criterion B13.
  > - Follows, not a second decision: "the slots that fit" in Requirement 17 means
  >   the **empty** ones, so the surplus is counted against those.
  > - Option (ข), the redo-the-whole-template multi-pick, is ruled out.
  > - Does not reach what a filled row shows on screen, or how the user empties one
  >   — that is Requirement 16 and Sober's design, both unchanged.

- **Q12 (= SPEC-002 Q-SA-2) — "Several at once" is specced as multi-select in the
  native Open dialog; dragging files from Explorer onto the window is not in this
  REQ. Did he picture dragging?** A scope check asked before the build rather than
  at acceptance.
  > answer (2026-08-23, human): **"dialog พอ"**
  > - Reaches: the **dialog is enough** — the specced multi-select stands, and
  >   drag-and-drop is **not** wanted here. Written into §Out of Scope and
  >   Requirement 4 so it cannot resurface as a surprise at acceptance.
  > - Does not reach any later REQ: he said not here, not never.

- **Q13 (= SPEC-002 Q-SA-3) — Approval of the 18 new Thai strings** drafted in
  SPEC-002 §7 (Requirement 8 / REQ-001 Q9 loop: Sober drafts, the human approves
  through me, nobody ships an unreviewed string). Approve, or replace wording.
  > answer (2026-08-23, human): **"อนุมัติหมด"**
  > - Reaches: **all 18 strings in that table are approved as drafted** — no
  >   replacement wording and no exception called out. They stop being DRAFT and
  >   become the shipped wording; criterion **B8** becomes checkable.
  > - Does **not** reach any string outside those 18: the surplus-photos notice is
  >   not shipped at all (Q10 = ก), and any *new* string invented later comes back
  >   through this same loop before it ships.
  > - Not a technical approval: which keys exist, which are reused, and which dead
  >   key is deleted stay Sober's calls.

- **Q14 — Does a newly created slot start required or optional?** Flagged on
  2026-08-23 as my own reading of *"ของเก่าถือว่า require หมด"* (Requirement 15d)
  and offered back to him as a one-line change.
  > answer (2026-08-23, human): **"required"**
  > - Reaches: a new slot starts **required**, confirming Requirement 15d exactly as
  >   written. My inference is now his decision; no text in the REQ changes.

- **Q15 — Which commit, and is the tree clean?** On 2026-08-23 he said
  *"commit แล้ว"* about TASK-005's four-file hand-off packet, so the repo tip is
  no longer the `e6faa0f` baseline named in §Constraints — but he did not give the
  id. Sober checks every commit against the packet with read-only `git` (he did
  exactly that for `e6faa0f`) and needs the id to do it. **Non-blocking**: the team
  builds from the packet, not from git.
  > answer (2026-08-23, human): **"fc9ba21 ใช่"**
  > - Reaches: the commit that holds TASK-005's four-file packet is **`fc9ba21`**,
  >   and **"ใช่" answers the second half — the tree was clean**. It is the same id
  >   Fern reported as a read-only observation the same day (TASK-006
  >   §Implementation Notes: base `fc9ba21`, parent `e6faa0f`, holding exactly
  >   TASK-005's four files); the human's word is what turns that observation into
  >   the answer. Sober can now check `fc9ba21` against TASK-005's packet the way
  >   he checked `e6faa0f` against TASK-004's.
  > - Consequence: §Constraints now names both commits — `e6faa0f` (TASK-004) and
  >   `fc9ba21` (TASK-005) — instead of the single baseline written before.
  > - Does **not** reach the *next* commit he made the same day, the one holding
  >   TASK-006 + TASK-007: that has no id yet and is asked as **Q17**.

- **Q16 (= SPEC-002 Q-SA-5) — In a multi-photo pick, if one of the *surplus*
  photos is corrupt, does the whole drop fail (as SPEC-002 specced it, SA call
  B-11) or do the good photos still go in?** Sober's question, raised 2026-08-23,
  non-blocking — the mode is buildable either way.
  > answer (2026-08-23, human): **"ล้มทั้งชุด"**
  > - Reaches: **the whole batch fails** — a multi-pick containing a file that will
  >   not decode is rejected as a unit, and no slot is filled from it. Whether the
  >   bad file was one that would have fit or one of the surplus makes no
  >   difference.
  > - Consequence: **no Requirement and no Acceptance Criterion in this REQ
  >   changes** — the answer confirms what SPEC-002 already specced (B-11) rather
  >   than moving it. Transcribing it into SPEC-002 §11 is **Sober's**; I do not
  >   write in `specs/`.
  > - Does not reach the wording the screen shows when a batch fails — that stays
  >   inside the 18 strings approved at Q13, and any genuinely new string comes
  >   back through the Requirement 8 approval loop before it ships.

- **Q17 — His second commit of 2026-08-23: which id, and is the tree clean?**
  Together with the Q15 answer he said *"commit แล้ว"* about the TASK-006 +
  TASK-007 change set that was sitting uncommitted on base `fc9ba21` — again
  without an id. Same shape as Q15 and the same **non-blocking** status: the team
  hands work off as a packet and builds from the packet, never from git, but
  Sober's read-only check of a commit against its packet needs the id.
  > Recorded as fact, not as a complaint: that commit holds **unreviewed** work —
  > TASK-006 and TASK-007 are both still in REVIEW. What a REWORK verdict would
  > mean for a change that is already committed is Sober's call under the human's
  > git rule (REQ-001 Q23, git writes are the human's alone), not mine.
  > answer (2026-08-23, human): **"6879acf ใช่"**
  > - Reaches: the commit holding the TASK-006 + TASK-007 change set is
  >   **`6879acf`**, and **"ใช่" answers the second half — the tree was clean**.
  >   Same shape as Q15: Sober had already observed exactly this id read-only
  >   (TASK-006 §Review D — tip `6879acf`, clean, parent `fc9ba21`, all ten packet
  >   hashes matching), and the human's word is what turns that observation into
  >   the answer. Sober can now check `6879acf` against the TASK-006/007 packets
  >   the way he checked `e6faa0f` against TASK-004's.
  > - Consequence: §Constraints now names three commits of 2026-08-23 —
  >   `e6faa0f`, `fc9ba21`, `6879acf`. Nothing in the product moves.
  > - Does **not** reach the commit he says he has since made for TASK-008's
  >   eight-file packet, which again came without an id — asked as **Q20**.

- **Q18 — *"รอบหน้า Sober รีวิวสองก้อน"* (said 2026-08-23, unprompted): one
  session or two?** How far it plainly reaches: the two packets in REVIEW are
  **TASK-006 and TASK-007**, both Fern's and both Sober's to review, so "สองก้อน"
  is those two and nothing else. What it does **not** settle: the run mode the
  whole team works under gives each session **one coherent unit of work**
  (workspace-root `DISPATCHER.md`), and two reviews may be one unit or two. That
  is his call about his own team's cadence, so I am not making it for him.
  **Non-blocking** — Sober picks the reviews up either way; the answer only
  decides whether both fit in one session or the second waits for the next.
  > CLOSED 2026-08-23 by events, not by an answer: he answered the other pending
  > questions and left this one alone, and by then both reviews were already
  > finished — **one review per session** (TASK-006 §Review, TASK-007 §Review).
  > The question only ever decided the cadence of those two reviews, so there is
  > nothing left for it to decide. Nothing in the REQ changes; the standing
  > one-unit-per-session rule (workspace-root `DISPATCHER.md`) is untouched.

- **Q19 — The required/optional checkbox is painted by the OS colour scheme, not
  by the app's dark mode. Fix it or ship it?** Sober's FYI to me on 2026-08-23
  (TASK-006 §Review F): a native `<input type="checkbox">` does not follow the
  app's `dark` class, so the new checkbox can look wrong in dark mode. Sober had
  ruled it (ค) — its own small TASK, still unwritten — and asked that the human
  judge the checkbox knowing the box is *supposed* to be OS-coloured for now.
  > answer (2026-08-23, human): **"checkbox=ปล่อยไว้"**
  > - Reaches: the required/optional checkbox **ships as it is**. Its OS colouring
  >   is accepted, the same way the window-title flash was accepted at REQ-001 Q25
  >   (ข) with the same word. **No Requirement and no Acceptance Criterion of this
  >   REQ changes** — Requirement 15 never asked for a particular look — and
  >   TASK-006, already accepted by Sober as it stands, needs no rework for it.
  > - Consequence for the team: the reason Sober's unwritten Q-FE-1 TASK existed
  >   is gone **for the checkbox**. Whether that TASK is still worth writing for
  >   the rest of the app is not settled by these two words — see Q21.
  > - Does not reach anything else the human has not seen yet: dark mode in Use
  >   Template (B9) and the real Open-dialog round trip (B12) are still waiting for
  >   his acceptance pass on a screen.

- **Q20 — The commit holding TASK-008's packet: which id, and is the tree
  clean?** Asked 2026-08-23. Together with the answers above he said *"commit
  แล้ว"*, which covers TASK-008's eight-file packet that was sitting uncommitted
  on base `6879acf` — for the third time without an id. Same shape as Q15 and
  Q17, same **non-blocking** status: the team hands work off as a packet and
  builds from the packet, never from git, but Sober's read-only check of a commit
  against its packet needs the id.
  > Recorded as fact, not as a complaint, and it is the same fact as at Q17: that
  > commit holds **unreviewed** work — TASK-008 is still in REVIEW. What a REWORK
  > verdict means for a change already committed is Sober's call under the human's
  > git rule (REQ-001 Q23), not mine.
  > answer (2026-08-23, human): **"de33ff9 ใช่"**
  > - Reaches: **CLOSED.** The commit holding TASK-008's eight-file packet is
  >   **`de33ff9`**, and by confirming the id he confirms the observation it was
  >   quoted from — Sober's read-only check (TASK-008 §Review A: tip `de33ff9`,
  >   parent `6879acf`, tree clean, all eight packet hashes matching). Third time
  >   in the same shape as Q15 and Q17: Sober sees it, the human's word makes it a
  >   fact.
  > - Consequence: §Constraints now names four commits of 2026-08-23 — `e6faa0f`,
  >   `fc9ba21`, `6879acf`, `de33ff9`. Nothing in the product moves. The work that
  >   commit held was still unreviewed when it was made; it has since been
  >   accepted (TASK-008 DONE), so the question of what a REWORK would have meant
  >   never arose.
  > - Does **not** reach the commit he says he has since made for TASK-009's
  >   three-file packet, which again came without an id — asked as **Q23**.

- **Q21 — Does *"ปล่อยไว้"* cover only the checkbox, or the same OS-colour gap
  everywhere in the app?** Asked 2026-08-23, **non-blocking for every task now in
  flight**. Why it is a real question and not me splitting hairs: the gap Sober
  described is app-wide and predates the checkbox (per TASK-006 §Review F the
  colour input has it too and shipped in REQ-001), and his ruling (ค) scoped a
  TASK for the whole app, not for one control. The human's two words name the
  checkbox only.
  > What turns on it: whether that unwritten TASK is dropped, or still written for
  > the other native controls. It is Sober's technical call how — my job is only to
  > tell him how far the human's "leave it" reaches, and today it reaches the
  > checkbox.
  > answer (2026-08-23, human): **"Q21=ทั้งแอป"**
  > - Reaches: **CLOSED, and it reaches further than the checkbox.** *"ปล่อยไว้"*
  >   (Q19) covers **every** OS-painted native control in the app, not just the
  >   required/optional checkbox — so the colour input that shipped in REQ-001 with
  >   the same gap is covered too. He was asked the narrow question and answered the
  >   wide one, in his own words.
  > - Consequence for the team: the whole reason Sober's unwritten Q-FE-1 dark-mode
  >   TASK existed is gone. **It is dropped, not deferred.** No Requirement and no
  >   Acceptance Criterion of REQ-001 or REQ-002 changes — none of them ever asked
  >   for a particular look on a native control — and **B9** ("usable and readable
  >   in dark mode") still stands as written: it is about the mode being usable, and
  >   the human judges it on screen knowing the native controls stay OS-coloured.
  > - Does not reach any *new* control the team might add later. If a future control
  >   looks wrong in dark mode, that is a fresh question, not something these two
  >   words already answered.

- **Q22 — N-SA-6 (the refusal message mangles slot names containing `$`): fix it
  now, or let it ride?** Put to the human on 2026-08-23 as an FYI-with-a-choice,
  not as a blocker. What he was told: Sober measured a cosmetic defect he owns —
  a slot named with JavaScript's `$` patterns (e.g. `A$&B`) comes out garbled
  **inside the Thai message that refuses Generate**, and nowhere else: no crash,
  no wrong file, the export path untouched. Sober had parked it to ride the next
  small FE batch alongside the Q-FE-1 TASK.
  > answer (2026-08-23, human): **"N-SA-6=แก้เลย"**
  > - Reaches: a **priority decision, which is mine to relay and his to make** —
  >   the fix is wanted **now**, not parked. It does not reach *how*: whether it
  >   becomes its own TASK, or rides with the one-word `shared/` byte-type fix, is
  >   Sober's technical call.
  > - Note the interaction with Q21: the batch this note was going to ride with no
  >   longer exists (the Q-FE-1 TASK is dropped), so "let it ride" had quietly
  >   stopped being an option. His answer settles it in the same direction anyway.
  > - Does not reach **N-SA-7** (a zero-sized decoded image counting as "filled").
  >   Sober recorded that one as an observation with no action and said it becomes a
  >   REQ question for me only if the human ever hits it. He has not been asked
  >   about it and I am not asking yet.

- **Q23 — The commit holding TASK-009's packet: which id, and is the tree
  clean?** Asked 2026-08-23, **non-blocking**. Alongside the answers above he said
  *"commit แล้ว"* again, this time covering TASK-009's three-file packet that was
  sitting on base `de33ff9` — the fourth time without an id.
  > Recorded plainly, and it is the mildest instance yet: unlike Q17 and Q20 this
  > commit holds work that was **already accepted** (TASK-009 DONE, reviewed
  > against base `de33ff9` + the packet), and SPEC-002 has no TASK left, so no
  > read-only check is queued behind it. It is asked so the board's repo line names
  > a real tip instead of "an unnamed commit", nothing more.
  > A standing request, put gently: sending the id **with** the *"commit แล้ว"*
  > closes this in the same breath and saves a round trip — it has cost four now.
  > answer (2026-08-23, human): **"b9389e1 ใช่"**
  > - Reaches: **CLOSED.** The commit holding TASK-009's three-file packet is
  >   **`b9389e1`**, and he confirms the tree is clean. This is his own word on the
  >   id Sober had recorded only as a read-only observation (TASK-010 §Review /
  >   log 15:52), so the board's repo line may now name it as confirmed.
  > - Does not reach the commit **after** it — see **Q25**.

- **Q24 — Does REQ-002 `DELIVERED` wait for TASK-010, or ship without it?** Asked
  2026-08-23. Sober raised it as the one ruling he would not make for me (log
  15:52) and repeated it after accepting TASK-010 (log 16:03). What the human was
  told before answering: TASK-010 is the N-SA-6 fix he himself ordered *"แก้เลย"*
  (Q22); it is accepted by Sober; at the time it was accepted but **uncommitted**
  on top of `b9389e1`; and no Requirement and no Acceptance Criterion of this REQ
  ever mentioned the `$`-name defect, so shipping without it would not have left
  any criterion unmet.
  > answer (2026-08-23, human): **"DELIVERED รวม TASK-010 ด้วย"**
  > - Reaches: **CLOSED, and it is a release-scope decision, which is his to
  >   make.** REQ-002's `DELIVERED` **includes TASK-010**. The delivery is
  >   therefore TASK-005 → TASK-010, not TASK-005 → TASK-009.
  > - Consequence, and it is small: TASK-010 was already `DONE` and is now in git
  >   (Q25), so **this ruling costs no waiting**. It changes what "delivered"
  >   names, not when it can happen.
  > - Consequence for my acceptance pass: since the fix now ships *inside* this
  >   delivery, I am adding the **one optional on-screen check** Sober offered
  >   (TASK-010 §Review F — a slot named `A$&B`, required, left empty, press
  >   `สร้างภาพ`, the red line must read the name literally) to the human's list,
  >   marked optional and skippable. **It is not a new Acceptance Criterion** — no
  >   criterion ever asked for it, and Sober's review already verified the string
  >   the component hands React. It is offered because the human may as well look
  >   at the thing he ordered fixed while he is in front of the app.
  > - Does not reach REQ-001, which is already `DELIVERED`, and does not reach the
  >   one-word `shared/` byte-type fix (Q-FE-7) — that is an unwritten BE TASK of
  >   Sober's, was never part of SPEC-002's five, and nobody has asked whether it
  >   is in or out of this delivery. I am **not** assuming it is out; if Sober
  >   writes it, whether it rides this REQ or the next is a fresh question.

- **Q25 — The commit holding TASK-010's one-file packet: which id, and is the
  tree clean?** Asked 2026-08-23, **non-blocking**. Alongside the answers above he
  said *"commit แล้ว"* a fifth time, covering the single-file packet that was
  sitting on base `b9389e1` — and for the fifth time without an id.
  > Why it is still worth asking even though it blocks nothing: TASK-010 is now
  > **inside the delivery** (Q24), so when this REQ is marked `DELIVERED` the
  > board's repo line should name the exact tip that holds it, not "an unnamed
  > commit on top of `b9389e1`". Sober has not observed this one read-only, so at
  > the moment nobody on the team has seen the id at all.
  > The standing request, repeated once and then dropped: sending the id **with**
  > the *"commit แล้ว"* closes this in the same breath. It has now cost five round
  > trips; I will keep asking, but I will not keep explaining why.
