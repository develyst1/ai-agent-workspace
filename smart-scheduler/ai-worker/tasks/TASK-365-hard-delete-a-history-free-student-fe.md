# TASK-365 — Delete a student with NO history — FE (`REQ-089 item 3`)

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-16)
**Source:** owner `§2`: *DELETE only for a student with NO history; hard delete, admin only, CONFIRM step.*
**Contract (proposed to @Jason in TASK-364; he confirms or corrects first — a correction reaches you through me):** `DELETE /students/:id` ⇒ `200 { deleted: true }` · `409 STUDENT_HAS_HISTORY { status, code, message }` (Thai sentence with the counts) · `404`.
**Size S.** ⛔ Chain stopped. Ships with TASK-364.

---

## §1 Where and how
- `PeopleContent.tsx` — the student row/card where suspend lives (`people.service.ts:106` is the parent's; find the student's own actions). **A `Delete` action beside suspend, red, two taps: the action, then a confirm dialog that names the student and says what happens (`ลบถาวร — ทำแล้วย้อนกลับไม่ได้` / EN) — the TASK-355 unlink pattern.**
- 🔑 **The rule has ONE source — the server.** 🚫 No client-side "has history" check, no hiding the button by what the card happens to know; the action is offered on every student, and a `409` shows the server's sentence in the dialog (the admin reads *why* and is pointed at suspend). This is a deliberate trade: a button that sometimes refuses, over a second copy of the rule that drifts.
- After `200`: the student leaves the list, the parent's child count updates (invalidate the queries the create-student path invalidates — same set, one source).
- Both languages; new keys only for the action, the dialog title/body/confirm, and the success notice — count them.

## §2 Not this task
🚫 Deleting a parent · 🚫 anything on `/register` or `/checkin` · 🚫 a "deleted" filter or undo.

## Definition of Done
- [ ] Suite, **count** · tsc · build ok
- [ ] Two taps asserted; `409` renders the server's message; `200` removes the row and refreshes the count
- [ ] 🚫 asserted: no `history`/`bookings.length`/`courses.length` read in the delete path
- [ ] 🔑 Break-and-watch, `finally`, CHECKSUM

## Question — ⚠️ to the OWNER'S LIST
❓ The People page on a phone: is a red `Delete` beside `Suspend` distinguishable at a glance, or should it live under the `⋯` menu only? Say what the layout gives you; build the simplest.

---

## §3 ✅ IMPLEMENTED — Fern, 2026-09-16. **A red Delete on every student row, two taps, the server's sentence on refusal; no client rule.**

```
bunx tsc --noEmit → exit 0
bun test          →  351 pass / 0 fail   (+5 — new lib/people/delete-student.test.ts)
bun run build     → ok
git status        →  5 modified (PeopleContent · usePeople · people.service · people.mock.service · dictionaries)
                     · 1 new (the test)
```
Built against @Jason's CONFIRMED contract (BE done, 2172/0) with his three corrections applied: the `409` is the
app's usual `{ error: { code, message } }` envelope (`ApiClientError.message` — what the page's handlers already
read); **suspension is the PARENT's and the button has NO suspend condition**; walk-ins are the server's business
(the People page lists students under their parent card, so a walk-in has no row here — named, not this task).
🚫 No parent delete · nothing on `/register`/`/checkin` · no filter, no undo · no client-side cap.

### `§1` — where and how
- **Where suspend lives is the PARENT card; the student's own actions are the row inside it** (name · Edit pencil).
  So the Delete is a red `Trash2` `ActionIcon` beside the student's Edit — *beside suspend* in the sense the task
  meant: the same card, the student's own row. **Offered on every student** — asserted that nothing gates the
  tooltip (no `&&`/`?`/`suspended` between the Edit icon and the Delete one; mutation 5 — hide when the parent is
  suspended — fails).
- **Two taps:** the icon opens a `Modal` titled *"Delete {name} permanently?"* / *"ลบ {name} ถาวร?"* with the body
  *"Permanent — this cannot be undone…"* / *"ลบถาวร — ทำแล้วย้อนกลับไม่ได้ …"*, a plain Cancel and a red
  **"Yes, delete"** / **"ยืนยัน ลบ"** — the TASK-355 unlink pattern, and the same `Modal` shape as the suspend
  dialog two lines below it. Mutation 1 (one tap) fails.
- 🔑 **The rule has ONE source:** `people.service.deleteStudent` is one `api.delete`; the hook is one mutation; the
  page reads nothing about history. Asserted by absence on all three (`history|bookings.length|courses.length|
  hasHistory|STUDENT_HAS_HISTORY` nowhere in the delete path — mutation 2 fails). **A `409` puts the server's
  sentence in an `Alert` INSIDE the dialog and the dialog stays open** (the admin reads the counts and the pointer
  to suspend; mutation 3 — refusal closes — fails). **A `200` notifies `{name} deleted`, closes, and the list
  refreshes through `PARENTS_KEY` — the SAME invalidation as `useCreateStudent`** (asserted side by side; mutation 4
  fails), so the student leaves the list and the parent's count updates from the server's answer.
- Copy: **5 keys × 2** (`deleteStudent` · `deleteStudentTitle` · `deleteStudentBody` · `deleteStudentConfirm` ·
  `deletedOk`), both languages, `{name}` interpolated on the title and the notice. The body says what happens and
  that the server will say if there is history — it does not restate the rule.

### 🔑 Break-and-watch — five mutations, each in `try/finally`, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | one tap — the icon deletes directly | **1 fail** |
| 2 | a client-side history check (`deleteTarget.note`) before the call | **1 fail** |
| 3 | a refusal closes the dialog | **1 fail** |
| 4 | the hook stops invalidating `PARENTS_KEY` | **1 fail** |
| 5 | the icon hidden when the parent is suspended | **1 fail** *(the first pin let this through — tightened: nothing between the Edit icon and the Delete tooltip may gate it)* |
`md5` identical on both mutated files.

### Definition of Done
- [x] **351 / 0** · `tsc` 0 · build ok
- [x] Two taps asserted; `409` renders the server's message in the dialog; `200` removes the row (invalidation) and refreshes the count
- [x] 🚫 asserted: no `history`/`bookings.length`/`courses.length` in the delete path
- [x] 🔑 Break-and-watch — five, `finally`, checksum

### ⚠️ Not seen on a screen
The red icon next to the grey pencil at row scale (15 px icons, `gap={2}`), and the 409 Alert wrapping in the
dialog. For @Tanya via you on `sid`: a fresh student ⇒ two taps ⇒ gone, count down; a student with a booking ⇒ the
Thai sentence with counts in the dialog, dialog still open, Cancel closes it.

## Question — **on a phone, is a red Delete beside Suspend distinguishable at a glance, or should it live under `⋯` only?** ⚠️ owner's list
**What the layout gives:** the People page has no `⋯` menu — the parent card carries four `compact-sm` text
buttons in a wrapping `Group` (Edit · Add student · LINE link · Suspend/Un-suspend), and each student row carries
ONE icon (Edit). I put Delete as a second ICON on the student row, not a fifth button on the parent's group —
**so it is not beside Suspend on screen; it is beside the student's own Edit**, which is where the act belongs
(it deletes a student, not the family). At a glance on a phone: a red trash icon next to a grey pencil, 15 px each,
2 px apart. **Distinguishable by colour, not by distance** — and a mis-tap is caught by the confirm dialog, which
is why the two-tap pattern is the right safety here rather than a menu. If the owner wants it further from Edit,
the cheapest change is `gap="xs"` or a `⋯` per student row; a per-student `⋯` would also be the natural home for
the day a third student action arrives. 🚫 Said, built the simplest.
