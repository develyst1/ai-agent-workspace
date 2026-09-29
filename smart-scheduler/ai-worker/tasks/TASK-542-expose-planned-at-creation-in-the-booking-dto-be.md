# TASK-542 — expose `plannedAtCreation` so the leave dialog can stop promising a quota it never spends — BE, XS

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-28) · **Size XS.** @Fern's residual (2) in TASK-541 — **she stopped at the contract boundary, correctly.**

## §0 What it is
A leave **declared at course creation** (`plannedAtCreation`) **appends the make-up and charges NO quota** — the owner's own decision B, which you quoted back to me in TASK-492 when my `leave_charged` boolean was wrong.
⇒ **the leave dialog promises "uses one of the course's leaves" on exactly the rows where it never does**, and 🔑 **the FE cannot tell, because the field is not in `BookingDTO` at all.**

## §1 Build
- **`plannedAtCreation` on the booking DTO**, as the boolean it is. 🔑 **Raw, not translated** — the words are the screen's job, as TASK-481 settled for provenance.
- ⚠️ **And apply TASK-481's lesson without being asked: WHO ELSE reads this builder?** **The public check-in answers are allow-listed now (TASK-499/502), so they should be unaffected — confirm that rather than assume it**, and **say whether a scoped teacher sees it** (I expect it is harmless, but **I want the answer, not the expectation**).
- **By value:** a `plannedAtCreation` row reads `true`, an ordinary leave `false`, and **nothing else in the DTO moves.**
- 📌 **Say whether anything else on that DTO is now the ONLY thing a screen cannot ask about** — 🔑 **three dialogs in a row have been wrong because the FE could not see a server-side fact.** **If there is a fourth such field, I would rather cut one task than three.**

## Definition of Done
- [ ] `plannedAtCreation` on the booking DTO, raw · **the public answers confirmed unaffected** (not assumed) · the scoped-teacher answer **stated** · by value both ways, nothing else moved · **any other field a screen cannot see, named** · suite **count** normally **and unreachable** · tsc 0 · 61 = 61 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation that leaks it onto a public check-in answer · report here + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-28): `plannedAtCreation` on the admin DTO, raw. Public unaffected (confirmed); the scoped teacher sees it on their own rows. 🔴 **And yes: a FOURTH hidden fact (§4)** · **3504 / 0 normally, and 3× unreachable with plain `bun test`, 0 failed queries** · tsc 0 · 61 = 61 · three mutations bite

## §1 Built
- **`toBookingDTO`: `plannedAtCreation: b.plannedAtCreation === true`.**
  - Raw boolean, **never undefined** (a row that never had it reads `false`).
- **By value:** declared at creation ⇒ `true`; an ordinary leave ⇒ `false`.
- **Nothing else moved:** the admin DTO's full key set is pinned (**the previous 33 + this one = 34**, the same under every provenance view).
  - TASK-499's own "the admin DTO has 33 keys" pin is honestly moved to 34.

## §2 🔒 WHO ELSE reads this builder (TASK-481's lesson): confirmed, not assumed
- **The public check-in answers** (the token page, the shop front single + batch, LINE) all go out through **`toPublicCheckinBooking`, a six-field allow-list** (TASK-499).
  - Pinned by value: the public booking built from a `plannedAtCreation: true` row has exactly those six keys and no `plannedAtCreation`.
  - Pinned by source: both of `checkinByToken`'s returns wrap it, and no raw admin booking is handed back.
  - **Mutation P (leaked onto the public answer) BITES.**
- **The camp public scan (TASK-502)** builds its own allow-listed answer from the camp package DTO, **not** from `toBookingDTO`, so it's unaffected by construction.
- **Admin readers:** the calendar, the paginated list, the by-id read, create / pause / resume, and the course create. All admin surfaces.

## §3 📌 The scoped teacher: the answer
- **A scoped teacher reads the SAME DTO for their own rows.** Scope filters **rows** (`ownScopeWhere`) and masks only **provenance** (TASK-488). ⇒ **they see `plannedAtCreation` on their own leaves** (pinned: under the `masked` view it's `true` while `checkinActor` is `null`).
- **Harmless by design:** the row's `SICK_LEAVE` status is already theirs to see, and `course` already carries the course's leave counts. This only says **which** of those leaves was declared at creation.
- If you want it masked for teachers, it's one line in the provenance-view pattern. I don't recommend it.

## §4 🔴 Your real question: YES, a fourth fact a screen can't ask about, and it's already wrong on screen
- **The leave Undo dialog's APPROVED body** (`undo.leaveMsg`, FE) says, for **every** leave:
  > *"…the leave is returned to the family's quota **and its make-up is cancelled**…"*
- **Both halves are false on whole classes of leave, and the FE can't know which:**
  1. **"returned to the quota"**: only if the leave **took** quota, which is `bookings.leave_charged` (TASK-492). It's **false** for a leave declared at creation (this task's field), an **over-quota locked** leave, and **every 1-hour / voucher** leave. **`leaveCharged` is NOT on the DTO.**
  2. **"its make-up is cancelled"**: only if the leave **has** a make-up (an `EXTENDED` row whose `extendedFromId` is this leave). **None exists** for a 1-hour / voucher leave or an over-quota one. **Neither `extendedFromId` nor a "has make-up" fact is on the DTO.**
- ⇒ **The same dialog class as TASK-541, on the Undo.** The truthful answer exists server-side (`makeupDecision` + `leaveCharged` are exactly what the Undo uses), and the screen can't see it.
- ⭐ **One BE task, as you'd prefer:** expose `leaveCharged` (raw, like this one) and a derived `makeupId` (or `hasMakeup`) on the leave row, **computed by the Undo's OWN `makeupDecision` rule** so the dialog and the act can't disagree. Then the FE words the three cases (the owner's copy).
  - Cost: one grouped read for SICK_LEAVE rows on the calendar.
- **Checked and NOT a gap:**
  - `confirmedAt`: the status says it;
  - `checkinTokenExpiresAt`: a credential's lifetime, deliberately private;
  - `leaveNoteReplaced` / `noteBeforeLeave`: an Undo's internal, and no dialog promises the note;
  - `createdAt` / `updatedAt`: nothing reads them.

## §5 Break-and-watch (CHECKSUM identical, every restore byte-identical, BASELINE=5)
- **P: leaked onto the public check-in answer:** **BITES**.
- **V: the field wrong** (always false): BITES.
- **X: a stray internal field added while in there** (`leaveCharged`): BITES, so §4's field comes only by a decision.

⛔ Only you mark this DONE. §4 is yours to cut.
