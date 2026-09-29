# TASK-515 — the camp check-in reply must name the child — BE, XS

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-27) · **Size XS.** No migration. Closes the question I left open when TASK-502 fixed the shape.

## §0 The ruling, and whose argument won it
`CampSuccessView` reads `day.studentName`; **the backend has never sent it**, so that line silently renders nothing. I asked @Fern what the line was *for*, and said I would delete it if the answer was "because the session view has one".
**It was not.** Her reason: the reply's other four lines — **week, date, half, status — are identical for siblings on the same camp day**, and **the phone at the counter is usually a nanny or a driver with two or three children in the car.** ⇒ **"Which child did I just check in?" has no answer on the screen, and the person least able to work it out from context is the one most likely to be holding it.**
🔑 **That is the owner's own reasoning from REQ-108 — the counter is not the parent — applied to a different surface.** ⇒ **send it.**

## §1 Build
- **`studentName` joins the camp scan's allow-list** — TASK-502's `scanAnswer` literal, **both paths** (fresh and already), so it cannot be path-dependent the way `weekName` was. **9 keys, pinned by key set on both.**
- 🔑 **The name must be the one the rest of the system prints.** Camp already resolves a display name for its own messages (`package.student.nickname ?? name` is the shape `getDayCheckinQr` uses). **Use the one existing rule — do not write a second** — and **say which function you used.** 📌 A second name rule is how a child ends up called two things on two screens.
- **It costs no new read or say so:** the package is already fetched for the credit (TASK-502's `weekName` came from it). **If the student is not on that object, stop and tell me** rather than adding a query to a public door — that would change the trade and it is mine to weigh.
- 🚫 **Nothing else joins the allow-list.** This is one field with an argument behind it, not an invitation.
- **For @Fern:** confirm the field name and that it is on both paths.

## §2 The rule this sets, for the next time
📌 **A field a page reads and the server never sends is not a small thing: it renders as nothing, and the next person to meet it reads it as a bug** — @Jason did, which is how we got here. ⇒ **Either the server sends it or the line goes.** A conditional that can never fire is the same defect as an assertion that can never fail (TASK-507).

## Definition of Done
- [ ] `studentName` on **both** camp scan paths, pinned by key set (9 keys) · **the existing display-name rule reused and named** · no new read (or **stopped and reported** if the student is absent from the fetched package) · nothing else added to the allow-list · `COACH_RATE_FIELDS` still walked and clean · the field named for @Fern · suite **count** normally **and unreachable** · tsc 0 · 60 = 60 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation that sends it on one path only and one that invents a second name rule · report here + `inbox/SA.md` + log.

---

# ⏸️ STOPPED as §1 instructs — @Jason (2026-09-27): the student is NOT on either object the scan already fetches. Nothing built.

## §1 What the camp scan fetches today (read, not assumed)
- **Read 1:** `checkinCampByToken` loads the day: `campDays.findFirst({ …, with: { package: true } })`. The package row carries **`studentId` only**, no name.
- **Read 2:** the credit's `packageDTO(campPackageId)` reads `campPackages.findFirst` (no relations) and `campDays.findMany({ with: { week: true } })`. That's where TASK-502's `weekName` came from. **No student there either.**
- (The suspension guard, `anyHouseholdSuspended`, reads the student row internally, but only to reach the parent. **Its result isn't available to the scan.**)
- ⇒ **Sending the child's name needs data the scan does not load today.** As you said, that changes the trade, so it's yours.

## §2 The options, weighed
- ⭐ **(a) Widen the scan's OWN first read, with no new query:** `with: { package: { with: { student: { columns: { nickname: true, name: true } } } } }`.
  - **Drizzle's relational `with` nests it inside the SAME statement**, so there's no extra round trip.
  - 🔑 **`columns` limits what the public door even reads to the two fields the name rule needs.** The allow-list starts at the read, not just at the answer.
  - It's exactly the shape **`getDayCheckinQr` already uses** for the staff QR (`with: { package: { with: { student: true } } }`).
- **(b) A separate `students.findFirst` by id:** a genuinely new query on a public door. **Not recommended.**
- **(c) Leave it:** Fern's page line then renders as nothing (your §2 rule: *either the server sends it or the line goes*). **That makes it a Fern task to remove the line.**

## §3 The name rule, ready for whichever you choose
- **`studentNamesOf` (`db/mappers.ts`)** is the ONE rule: `nickname ?? name` (and `joinChildNames` for a DUO row's two children; a camp package has one student). **I'd reuse it on the scan answer**, both paths, as `studentName: studentNamesOf({ student })`.
- 📌 **A second copy already exists:** `getDayCheckinQr` hand-writes `package.student.nickname ?? package.student.name ?? ""`. It's the same order, but it's **a second spelling of the rule, and its fallback is `""` rather than `null`**. Converging it onto `studentNamesOf` would be the natural companion to (a). Named, not touched.

## §4 On your word ((a) recommended)
`studentName` goes into `scanAnswer`'s literal (both paths, 9 keys, pinned by key set). The read is widened with `columns` as above, and `COACH_RATE_FIELDS` is still walked. The mutations: one path only, and a second name rule. A note goes to Fern with the field name and both paths.

⛔ Nothing built.

---

# 🔨 RULING — @Sober (2026-09-27): **(a), and converge `getDayCheckinQr` onto the one name rule with it.** ▶️ Build.
📌 **You asked this three reports ago and I answered two other things instead. My miss, and carrying it forward each time was right.**

**(a) — widen the scan's own read with `columns`.** 🔑 **The part that makes it (a) rather than merely "not (b)" is your `columns` clause: the public door reads only the two fields the name rule needs.** ⇒ **the allow-list starts at the READ, not at the answer** — so a future field on `students` cannot arrive in a public handler's memory at all. **That is a better property than the one I asked for**, and it is the shape `getDayCheckinQr` already uses.
🚫 **Not (b):** a new query on a public door to add one field is the trade I said I would weigh, and it loses. 🚫 **Not (c):** Fern's argument for the line already won — **siblings share every other line, and the phone is usually a nanny or a driver with two children in the car.**

## ▶️ And converge the second spelling, in this task
`getDayCheckinQr` hand-writes `nickname ?? name ?? ""` — **the same order, a different fallback (`""` rather than `null`), and a second place the rule lives.** 🔑 **Two spellings of "what is this child called" is exactly the shape that has cost us a week elsewhere**, and it is three lines to remove while you are holding both.
⚠️ **If the empty-string fallback is load-bearing for the QR page** — if something there renders `null` badly — **stop and tell me** rather than changing what that page shows. **Then it stays, with the reason pinned, and that is a fine outcome.**

## Definition of Done — amended
Everything in §4, plus: · **the read narrowed with `columns` to the two name fields**, pinned · `getDayCheckinQr` moved onto `studentNamesOf` **or stopped and reported with the reason** · 🔑 a mutation that widens the read back to the whole student row.

---

# ✅ REPORT — @Jason (2026-09-27): built as ruled, (a). The camp scan names the child on BOTH paths through THE rule, from a read that fetches only the two name fields · the QR's second spelling converged, and TWO more found and converged · 3400 / 0 normal AND unreachable, 0 failed queries · tsc 0 · 60 = 60
## §1 The build (`camp.service.ts`)
- **The read:** the scan's own `campDays.findFirst` now loads `package → student` with **`columns: { nickname: true, name: true }`**.
  - It's one statement (drizzle nests it), and **the public door reads only the two fields the name rule needs**, so no future `students` field can reach it.
  - **No new query.**
- **The answer:** `scanAnswer`'s literal gains **`studentName: studentNamesOf({ student })`**, **both paths**, 9 keys. Nothing else joined the allow-list.
- **The QR (`getDayCheckinQr`) converged onto `studentNamesOf`.** ⚠️ **Its `""` fallback IS load-bearing, so it's KEPT** with the reason in the code: the staff QR renders `${studentName} · date · half` in a template string (`WeekRoster.tsx`), where `null` would print "null".
- 🔑 **Two MORE spellings of the same rule were in the same file:**
  - the week grid's entries (`?? null`);
  - a `"-"` one and a `""` one (the reminder / roster inputs).
  - **All converged onto `studentNamesOf`, each keeping its own fallback**, so behaviour is byte-identical (`studentNamesOf` with one student *is* `nickname ?? name`).
  - A pin now asserts **no spelled-out copy of the child-name rule remains in `camp.service.ts`**. **`HEAD` has four.**

## §2 Proof (`camp-scan-allow-list-task502.test.ts`, +4 and 4 moved)
- **FRESH and ALREADY:** `studentName` = the **nickname**, **9 keys** each.
- **The rule's order by value:** nickname ⇒ else name ⇒ else `null`.
- **By source:** the read's `columns`, the answer's `studentNamesOf`, the QR's kept `?? ""`, and no spelled copy left.
- **Moved under the ruling (same claims):** KEYS 8 → 9; the two by-value answers gain `studentName: "Ploy"`; the forbidden-keys walk drops `studentName` (ruled in) **and adds `studentId` / `nickname` / `name`** (so the raw student fields can't leak); two test titles now say 9; camp-day-rate's "already" pin gains `studentName: null`.
- **Mutations** (CHECKSUM identical, restores byte-identical): **the name on one path only:** BITES (3) · **a second name rule (name before nickname):** BITES (5).

## For @Fern
**`POST /api/checkin/camp` now sends `day.studentName`** (string, or `null` when the child has neither a nickname nor a name) **on BOTH the fresh and the already-scanned reply**. It's the nickname when there is one. The line your page reads now has data.

⛔ Only you mark these DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-27)
**3400 / 0 normally and unreachable** · tsc 0 · 60 = 60. `studentName` on **both** paths (9 keys), read with `columns: { nickname, name }` in the same statement.
🔑 **He found TWO MORE spellings of the name rule in `camp.service` and converged them — HEAD had four.** I knew about one. ⇒ *"what is this child called"* was answered in four places, **and a pin now asserts none remain.** 📌 **That is the difference between fixing the duplicate you were told about and ending the duplication.**
✅ **The QR's `""` fallback kept, with the reason — load-bearing, because a template string would print "null".** 🔑 **He stopped at exactly the line I said to stop at**, and the outcome is the right one: **converged where converging is safe, and the one genuine exception pinned with its reason** rather than either forced into line or left unexplained.
✅ Fern has the field name and both paths.
