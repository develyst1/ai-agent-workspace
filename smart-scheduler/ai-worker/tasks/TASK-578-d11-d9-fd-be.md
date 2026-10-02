# TASK-578 — 🔴 D11 + 🟠 D9 + 🟠 F-D — BE, S/M

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-30) · Tanya, TEST-076 on sid.

## §1 🔴 D11 — an abandoned registration leaves a linked parent with NO children
**A parent who stops after the phone step is LINE-linked to a parent row with 0 children, and "Add Student" then dead-ends.**
🔑 **Two separate faults are hiding in one symptom — name both before fixing either:** **(a) the link is written before the registration is finished** · **(b) a linked parent with 0 children is a state the rest of the system does not handle.**
- ⚠️ **(b) can exist WITHOUT (a)** — a parent's only child could be removed. 🔑 **So fixing (a) alone leaves a reachable dead end.** **Say whether (b) is reachable another way, and handle it.**
- ⚠️ **Existing rows are already in this state on sid.** 🚫 **No agent touches data** — **say what a repair would be, if one is needed, and I will send it up.**

## §2 🟠 D9 — `true` where a count belongs
**The reconfirm box prints `"true คาบต้องยืนยันใหม่"`.** ⚖️ **Ruled: the BACKEND sends the COUNT.** 🔑 **I approved "the digest shows the COUNT only" in TASK-573 — the boolean is the side that drifted from the agreed shape.**
✅ **Pin the type so the next reader cannot send a boolean.** ⚠️ **Say whether any other consumer reads that field.**

## §3 🟠 F-D — garbled English sub-district names
**Diagnose first: is it OUR DATA or OUR CODE?** 🔑 **Say which, with the evidence.** ⇒ **Ours and small ⇒ fix it. Otherwise report back and STOP.**
⚠️ **If it is the data, say where the data came from and whether the Thai names are affected too.**

## §4 Context you need
📌 **F-C is now ruled: an address requires PROVINCE + DISTRICT + SUB-DISTRICT, on the form AND the chat. Province alone must not pass.** 🚫 **Not this task** — it goes with the chat work — **but F-D touches the same data, so say whether your finding affects it.**

## Definition of Done
- [ ] D11: **both faults named**, (b) handled or proven unreachable, **the data repair described and NOT run** · D9: a count, **typed so a boolean cannot be sent**, other consumers named · F-D: **data or code, with evidence**, fixed only if ours and small · suite **count** normally **and DB-unreachable** · tsc · `N .sql = N journal tags` · migration reported if any · mutations for each · report + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-30): D9 fixed (a COUNT, typed) · D11 both faults NAMED, (b) HANDLED, no repair needed · F-D is third-party DATA (not ours; stopped) · **NO migration (65 stays)** · **3637 / 0 normally, and 3× DB-unreachable, 0 failed queries** · tsc 0 · all mutations bite (on the in-repo runner, TASK-576's first real use)

## §1 🔴 D11: two faults, named before either was touched
- **(a) The link is written before the registration is finished.** For a NEW phone, `/register/link` → `linkFamilyByPhone` **creates the parent row AND binds this LINE account to it at the PHONE step**, before any child exists. Abandon the page there and the binding stays.
- **(b) A linked family with 0 children is a state the page has no way out of.** `/register/status` answered only `childCount`; for any linked account the page shows *"already linked — nothing to do"*.
- **(b) is reachable WITHOUT (a),** so fixing (a) alone would leave the dead end:
  - **archiving a family's only child** (`archiveStudent`): `listStudentsOfParent` counts only unarchived children, so a linked family reads 0;
  - **deleting a family's only child** (`deleteStudent`);
  - and it isn't only a zero problem: **Tanya's F-B is the same dead end for EVERY linked family** (the demo family has 4 children and still can't add a 5th from the rich-menu *Add Student*).
- ✅ **(b) HANDLED, server side:** `/register/status` now carries **`canAddMore`** (`childCount < MAX_STUDENTS_PER_PARENT`, the cap, not a copy of it), the same fact `/register/link` and `/register/create` already carried.
  - **0 children ⇒ `true`**; at the cap (5) ⇒ `false`. Pinned both ways.
  - **The add itself already works for a linked family with 0 children:** the page's one writer creates the first child (pinned by value through `addChildForLineParent`).
  - ⚠️ **The FE must USE it** (offer *Add a child* when `canAddMore`): that's @Fern's half, and it also closes F-B.
- ⏸️ **(a) NOT fixed, deliberately:** `linkFamilyByPhone` is the CHAT's function too (`/register`'s contract rule 3: *"every decision is the chat's function, called"*). Deferring the bind to the first child changes the chat's flow. **With (b) handled, (a) stops being a dead end.** It's now a family that was started and not finished, which the page lets them finish. **Your call whether (a) is still worth changing.**
- 📋 **The rows already on sid: NO repair is needed for the dead end.** Once the FE reads `canAddMore`, a linked family with 0 children simply continues and adds a child.
  - **Nothing to run.** If you want to SEE how many families are in that state (read-only, run by nobody here):
```sql
-- Q-D11 · LINE accounts linked to a family with NO active child (the D11 state), oldest first. Read-only.
SELECT l.line_user_id, p.id AS parent_id, p.phone, l.linked_at,
       count(s.id) FILTER (WHERE s.archived_at IS NULL) AS active_children, count(s.id) AS all_children
FROM family_line_links l
JOIN parents p ON p.id = l.parent_id
LEFT JOIN students s ON s.parent_id = p.id
GROUP BY l.line_user_id, p.id, p.phone, l.linked_at
HAVING count(s.id) FILTER (WHERE s.archived_at IS NULL) = 0
ORDER BY l.linked_at;
```
  - 🚫 **Deleting such parents is NOT proposed.** A phone number is a real family's. Tanya's own fixture (0899990761) is already on her cleanup list.

## §2 🟠 D9: the COUNT, typed so a boolean cannot be sent
- **The cause:** the planner returned `needsReconfirm: boolean` (`moves.some(…)`), and the FE types it as `number` and prints it. So the page said *"true คาบต้องยืนยันใหม่"*.
- **Fixed at the source:** `needsReconfirm = the number of CONFIRMED sessions that return to PENDING` (`0` = nothing to re-confirm). The act's mark now fires on `> 0`.
  - The **preview and the act both carry it** (one planner, TASK-573).
- 🔑 **Typed so a boolean can't come back:** the field is `number`, **and a compile-time assertion in the test file fails `tsc` if it widens to a boolean.** Proven: widening it to `number | boolean` makes tsc fail on the pin line; restored byte-identical.
- **Other consumers:** the FE's `ChangeStartDateDialog` (preview + result, typed `number` in `lib/scheduler/course-start.ts`, both lines 26 and 51) and the FE mock (`3`). **No other BE reader:** the attention card reads the stored `reconfirm_needed_since`, not this field.

## §3 🟠 F-D: DATA, not code, and not ours ⇒ reported, STOPPED
- **Evidence:** the names come from the FE's address package **`thai-address-universal@2.2.0`** (`entry.ts` imports it; the backend has no district or sub-district data).
- **Asked through the package's own API**, Bangkok → Khlong San:

| code | nameTh | nameEn (the package's) |
|---|---|---|
| 101804 | คลองต้นไทร | **Khnong Tntnai** |
| 101801 | สมเด็จเจ้าพระยา | **Smtet Chaopnaa** |
| 101803 | บางลำภูล่าง | Bang Lam Phu Lang |

  - The garbled strings are **inside the package's shipped English data file** (`dist/*/en_db-*.js`).
- **The Thai names are CORRECT**, and our code sends only Thai to the server: the address line is built from `nameTh` (`joinAddress`), and the province from the Thai name. **So stored addresses are unaffected; only the English picker's labels are wrong.**
- **F-C** (province + district + sub-district required) **is unaffected**: it rests on the codes and the Thai names, which are sound.
- **Options (FE / owner, not mine):** show the Thai names in the English picker for sub-districts; report upstream; or pin a fixed version. **Stopped here, as ruled.**

## §4 Checks
- Suite: **3637 / 0** (3634 + 3 new in `src/lib/tanya-sid-d9-d11-task578.test.ts`). **DB-unreachable 3×: 3637 / 0, 0 "Failed query".** tsc 0. **65 .sql = 65 tags, no migration.**
- **Existing assertions updated, only for this:** TASK-570 / TASK-573 `needsReconfirm` true / false → 4 / 0; TASK-565's status body + `canAddMore`.
- **Break-and-watch, run with `bun run mutation:run`** (the in-repo runner, TASK-576). Baseline 35, measured; CHECKSUM identical; every restore byte-identical:
  - **B1, the BOOLEAN back:** **BITES** (4).
  - **B2, the wrong count:** BITES.
  - **A1, `canAddMore` dropped (the dead end back):** **BITES**.
  - **A2, 0 children told it can't add:** BITES.
  - **A3, the cap off by one:** BITES.
  - **+ the TYPE pin, proven with tsc** (the runner runs tests, not tsc): widening the field fails the build.
- **F-D has no code change, so no mutation.** Nothing of ours to break.

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-30)
Verified by me: **3637 / 0** (and 3× unreachable) · tsc 0 · **65 .sql, no migration** (counted myself).

## 🔑 D11 — and the payoff of naming both faults is bigger than the task
**(a) the new-phone link creates the parent AND binds the LINE at the PHONE step · (b) a linked family has no way forward on the page.**
✅ **He proved (b) reachable without (a)** — archiving or deleting a family's only child — ⭐ **and then found it is Tanya's F-B for EVERY linked family.**
🔑 **F-B was filed as "pre-existing, next round". It is not a separate defect: it is (b).** ⇒ **Handling (b) closes it.** 📌 **That is exactly why I refused to let one symptom be fixed as one bug.**
✅ **`/register/status` now carries `canAddMore`** (0 children ⇒ true, the cap ⇒ false, pinned) **and the add already works for a 0-child family, pinned.**
⚖️ **(a): fold it into the CHAT task, not a separate fix.** 🔑 **It is still wrong — we create a real linked parent from an abandoned form** — **but it is the chat's shared function, and bringing the chat in line with the page is already dispatched.** ⇒ **One change, one round, same function.** ✅ **And with (b) handled it is no longer a dead end, so nothing is urgent about it.**
✅ **No sid repair needed, a read-only count query written, and deleting parents NOT proposed** — *the restraint is right: an abandoned registration is a person who might come back.*

## ✅ D9 — the type does the enforcing
**`needsReconfirm` is the COUNT, typed `number`, with a COMPILE-TIME assertion that fails tsc if it widens back to boolean — proven.**
🔑 **A pin that fails at compile time cannot be skipped by anyone not running the suite.** ✅ **Consumers named: only the FE dialog (already typed `number`) and its mock.**

## ✅ F-D — not ours, and he stopped
**It is DATA: the FE package `thai-address-universal@2.2.0` returns *"Khnong Tntnai"* for คลองต้นไทร.** ✅ **The Thai names are correct, we store only Thai ⇒ addresses and F-C are unaffected.**
✅ **Diagnosed with evidence and STOPPED, exactly as scoped.** ⚠️ **One question it leaves, and it is @Fern's: does any screen SHOW those English names to a parent?** 🔑 **Correct data displayed wrongly is still a defect the customer sees** — *if a picker offers English, the answer is almost certainly "show Thai only".*
