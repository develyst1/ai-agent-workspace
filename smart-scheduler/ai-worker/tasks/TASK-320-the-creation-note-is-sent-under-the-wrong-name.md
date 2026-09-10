# TASK-320 — `TASK-284` reopened, and it is NOT a back-end defect: the creation note is sent under the WRONG NAME

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-10)
🔴 **The blocking item in the owner's `uat` batch.** ⏱️ **Ahead of TASK-319 — do this one first.**
🚫 No BE change, no API change, no migration, **no new endpoint.**
🔑 **The whole fix is ONE WORD in one object. Read `§3` before you write it, because the one word has a
consequence and I want you to state it.**

---

## §1 What the owner found, and what it is NOT
| what he did | result |
|---|---|
| `New course` → filled **`Note (optional)`** → created → `Confirm whole course` | 🔴 **NO `Remark`** |
| opened each session before confirming | 🔴 **every `Session note` field EMPTY** |
| typed into **ONE session's `Session note`** → Save → `Confirm whole course` | ✅ **`Remark` appeared** |

🚫 **It is not timing** — he confirmed after saving in both cases.
🚫 **It is not the back end.** **I traced the whole chain: `loadCourseForEnd` (ordered `asc(date)`) →
`courseNote(rows)` → one payload → stored whole → the renderer prints `Remark` outside the omit-empty block.**
✅ **Every line correct, and `courseNote` is behaving correctly in BOTH cases** — *it finds the first non-empty
note, and in case 1 there is not one.*
🔑 **The question was never "why is it not rendered". It is *where does the creation note go?*.**

## §2 🔴 THE ANSWER, and it is in your repo
**`CreatePlanFlow.tsx:54` has ONE note state. Line 214 sends it as:**
```ts
note: note.trim() || undefined,
```
🔴 **`note`, not `attendeeNote`. And they are two different columns with two different owners.**
- **`attendeeNote`** — TASK-178's field. **What the plan editor's `Session note` reads and writes, and the
  ONLY one any LINE message ever renders.**
- **`note`** — the **STATUS-FLOW** note. Machine-written text lands here (*"ยกเลิกโดยแอดมิน"*). **It is
  displayed in exactly one place in the whole app: `BookingModal.tsx:461`.**

📌 **So, to answer the question that was actually asked: the note IS stored — it is not discarded.** It goes
onto **every session's `note` column** (`scheduler.service.ts:1562`/`:1712` on the BE pass it through).
🚫 **NOT onto the course** — `coursePackages` has no note column at all, only `endNote`.
⇒ ✅ **Every piece of the owner's evidence follows from that one word:** the `Session note` fields read
`attendeeNote` and are honestly blank; no message reads `note`; and typing into `Session note` writes
`attendeeNote`, which is why that one works.

🔑 **And this is the part worth stopping on: `createCoursePackage` at `scheduler.service.ts:689` ALREADY sends
`attendeeNote: input.attendeeNote`.** **The API client is wired. The BE is wired. The validation schema has
had the field since TASK-178.** ⇒ 🔴 ***`CreatePlanFlow` simply never sets it — so TASK-178's "one note at
creation, carried onto every session" has never once been reachable from the UI.*** 📌 *A feature complete on
three layers out of four is invisible to every test that does not cross the boundary, which is why it has sat
here since REQ-068.*

## §3 🔴 The one word has a consequence — DECIDE it and SAY which
✅ **The field must send `attendeeNote`.** 🔑 **The admin's *"หมายเหตุ"* at course creation is about the
CHILD — *"แพ้ถั่ว"* — which is what `attendeeNote` is and what the teacher needs to read.** ⚠️ **And writing
into `note` is not merely useless, it is wrong: that column is shared with the status flows and can be
overwritten by a cancel.**
❓ **What I want you to decide: does it STOP sending `note`, or send BOTH?**
- 📌 **My reading is that it stops** — one box, one meaning, and nothing in the product reads that `note` for a
  course except one modal line. **But you own this dialog and you may know a reason it is read that I do not.**
- ⚠️ **Whichever you pick, say it in the report with the reason.**

🔻 **AND STATE THIS PLAINLY, because someone will ask:** ***the fix is NOT retroactive.*** **Courses created
before it have their note in `note` and will never grow a `Remark`.** 🚫 **Do not write a migration and do not
ask for one** — 🔑 **that is a decision for the owner through @Porter, not a thing to slip into a copy fix.**

## §4 The label, while you are in there
**The dialog says `Note (optional)` / `หมายเหตุ (ถ้ามี)`; the plan editor says `Session note`.**
⇒ **after this change they are THE SAME FIELD, and they should not read as two things.** ⚠️ **Small, and
yours** — 🔑 **if you would rather leave the label alone and say why, that is an answer.** 🚫 **What is not an
answer is changing it without noticing they now mean the same thing.**

## §5 What must not change
- 🚫 `absentWeeks` · `sessions` · `discount` · the student payload · the course-level `subjectId` rule
  (SPEC-045 — the per-row `subjectId` stays unsent).
- 🚫 `setAttendeeNote` and the plan editor's own note — **that path WORKS and is what proved the diagnosis.**
- 🚫 No BE change, no contract change, no migration, no new endpoint.

## Definition of Done
- [ ] The FE suite passes, **state the count** · typecheck clean, **say which command**
- [ ] 🔴 **The create-course request carries the typed note as `attendeeNote`** — asserted **on the payload**,
      ⚠️ *not on a component's state — the defect lived entirely in the gap between the two*
- [ ] 🔑 **`§3` DECIDED and stated** — whether `note` is still sent, and why
- [ ] **A note typed at creation reaches EVERY session's `Session note`** — asserted as far as this repo can
      see it *(the payload plus the editor reading it back, if your fixtures allow)*
- [ ] **`§4` answered** — the label changed, or explicitly left with a reason
- [ ] 🔑 **Break it and watch** — send `note` again and show the assertion failing. ⚠️ **Verify the restore by
      READING the line** *(@Jason's rule; it caught a real silent `sed` failure this week)*
- [ ] 🚫 **No migration, no BE change** — asserted as an absence
- [ ] 🔻 **Say in the report, in one line, that the fix is not retroactive** — I am carrying that to @Porter

## Question
🔴 **The back end was right, the API client was right, the schema was right, and the feature did not exist.**
🔑 **Every layer was individually correct and the PRODUCT did nothing** — and the tests on both sides passed,
because each asserted its own side of a boundary neither crossed.
⇒ ❓ **How many other fields does this dialog — or any of our create dialogs — accept from a human and send
under a name the server does not use for that purpose?** ⚠️ **I am not asking for a sweep.** **I am asking
whether the FE has any assertion ANYWHERE that a form's value arrives in the request under the name the
feature reads it from.**
📌 **If the honest answer is "no, we assert state and we assert rendering, never the wire", say that** —
🔑 **because then this is not a mistake anyone made; it is a whole class we have no test for, and knowing that
is worth more than this fix.**

---

## §6 ✅ IMPLEMENTED — Fern, 2026-09-10. **One word, and it was the word you said.**

```
bunx tsc --noEmit → exit 0
bun test          →  196 pass
                       0 fail      (was 183 — +13 across two tasks; +9 for this one)
bun run build     → ok
```
🚫 No BE change · no contract change · no migration · no new endpoint.

### The fix
`CreatePlanFlow.tsx` — `note: note.trim() || undefined` → **`attendeeNote: note.trim() || undefined`.**
Nothing else needed touching: `CreateCourseInput.attendeeNote` and the service's request body have carried the
field since TASK-178. ✅ **Your §2 is exactly right, and I verified each link rather than taking it** — the
client was wired, the BE was wired, the schema was wired, and the dialog never set it.

### §3 DECIDED — **it STOPS sending `note`.** Your reading, and here is my reason on top of yours
🔑 **One box must not write two columns**, and the specific danger is not redundancy — it is DIVERGENCE. **The
status flows OWN `note` and overwrite it** (*"ยกเลิกโดยแอดมิน"*), so a second copy would stop matching this one
the moment a session was cancelled, and we would have two sources for one human sentence. **That is the drift
class this project keeps paying for**, and it would be self-inflicted this time.
✅ **And nothing goes dark by dropping it** — I checked where `note` is rendered before deciding: **exactly one
place, `BookingModal.tsx:462`, a grey line.** The value now appears in that same modal's **`attendeeNote` block
one element ABOVE it** (`:455`, the warning-styled one). ⇒ **the note does not disappear from any screen; it
moves to the more prominent half of the same modal — the one the teacher actually reads.**

### §4 ANSWERED — the label changed
`Note (optional)` → **`Session note (optional) — added to every session`** ·
`หมายเหตุ (ถ้ามี)` → **`โน้ตของคาบ (ถ้ามี) — ใส่ให้ทุกคาบ`**
🔑 It borrows the plan editor's own vocabulary (`attendeeNote.label` = *"Session note"* / *"โน้ตของคาบนี้"*)
because **they are now the same field and must not read as two things**, and it names **the one way this one
differs: it seeds all of them at once.**

### ⚠️ One thing I will not adopt silently — your §3 example contradicts the field's own hint
You justified the move with *"the admin's หมายเหตุ at course creation is about the CHILD — **แพ้ถั่ว**"*.
🔴 **`attendeeNote.hint` — REQ-068/TASK-178's own words, shipped in both languages — says: *"Who is bringing the
child, and logistics for this session. **Not for phone numbers, addresses or medical details.**"***
⇒ **a peanut allergy is precisely a medical detail, and the destination field tells the admin not to type it.**
✅ **The WIRING fix stands regardless** — `attendeeNote` is the field the editor reads and the only one LINE
renders, so it is the right column whatever goes in it. ⚠️ **But if the owner's "หมายเหตุ" really is allergies,
then REQ-068's scope is what needs the decision, not this line** — and that is @Porter's, through you. 🚫 **I
have not widened the hint and I have not quoted your example in any user-facing string.**

### 🔻 NOT RETROACTIVE — in one line, as asked
**Courses created before this keep their note in the `note` column and will never grow a `Remark`.** 🚫 No
migration written and none requested — the owner's call through @Porter.

### 🔑 Break it and watch — restored, and the restore READ back
Put `note:` back. **Both directions failed**, which is the point of asserting the pair:
```
(fail) the create request carries it as `attendeeNote`   Expected to contain: "attendeeNote: note.trim() …"
(fail) 🚫 and NOT as `note` — one box must not write two columns
```
✅ **Restore verified by READING the line** (@Jason's rule, not the script's exit code):
`CreatePlanFlow.tsx:236` reads `attendeeNote: note.trim() || undefined,` and a bare `note: note.trim()` line
count is **0**.

### Definition of Done
- [x] Suite **196 / 0** · `bunx tsc --noEmit` exit 0
- [x] 🔴 Asserted **on the payload** — the slice actually handed to `create.mutateAsync`, not on state
- [x] 🔑 §3 decided and stated — **stops sending `note`**, with the divergence reason
- [x] **Reaches every session** — the mock now accepts `attendeeNote` and seeds it onto every generated
      booking (it did not accept the field at all, so the offline path could show neither the defect nor the
      fix), and the editor reads that same field back
- [x] §4 answered — label changed, both languages
- [x] 🔑 Break-and-watch — failed both ways, restored, **restore read back**
- [x] 🚫 No migration / BE change — asserted as an absence
- [x] 🔻 Not retroactive — stated above

## Question — **does the FE assert anywhere that a form's value arrives under the name the feature reads it from?**

🔻 **Essentially no, and the near-miss is more damning than a flat no.**

**What exists today, checked file by file:**
| assertion | what it actually proves |
|---|---|
| `expiry-warning.test.ts` (TASK-287) — `expect(fn).toContain("startDate: input.startDate")` | **the SERVICE forwards its own input.** ⚠️ Not that any form supplies it. |
| same file — `payload` has no `weekday`, **and** the dialog's `resume.mutateAsync` call has no `weekday` | 🔑 **the only test that reads BOTH sides of the boundary — and it asserts an ABSENCE.** |
| everything else | component state, or rendering |

⇒ 🔑 **We have asserted that a field is NOT sent, on both sides. We had never once asserted that a field IS sent
under the name the reader uses.** 📌 **That is not a mistake anyone made — it is a whole class with no test**,
and it is why this sat since REQ-068: *every layer asserted its own half of a boundary neither crossed, and all
of them were green.*
✅ `create-note.test.ts` is the first that crosses it: form payload → service request body → the mock that seeds
it → the editor that reads it back, **all four checked for the same NAME.**
⚠️ **What it still is not:** a source-text check, not a running request. **The cheap general version — if you
want one — is a test that reads each create dialog's `mutateAsync` object literal and its service's request
body and asserts the key sets AGREE.** That would have failed on this defect on the day it was written, costs
one file, and needs no harness. 🚫 **Named, not built — it is a task, not a footnote to this one.**
