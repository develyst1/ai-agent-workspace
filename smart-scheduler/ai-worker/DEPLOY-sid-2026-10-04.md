# DEPLOY — sid — 2026-10-04 (the REQ-111 batch)

> ✅ **READY — FINAL, 2026-10-04. The owner's "clear everything first" list is DONE: `TASK-650` (the week label reads the real expiry) and `TASK-651` (the admin's result speaks to the admin · the no-ticks warning gone from the admin door · the filed test list complete). Item 4 (the coach's generic refusal) LEFT by the owner's ruling. Re-verified by @Sober, every set re-run.**
> 📌 *Earlier banner, kept:* ✅ **READY AGAIN — 2026-10-04, after QA (TEST-077) and three fixes, re-verified by @Sober.** **`TASK-646` (a free pre-start absence now STRETCHES the expiry, on the real path) · `TASK-647` (`teacherNotified` is now COUNTED — an unlinked coach reads as NOT told) · `TASK-648` (the admin door REFUSES today and the past AT THE SERVER).** 📌 *Below, the banner it replaced, kept so nobody wonders:*
> ⛔ ~~**NOT READY — 2026-10-04, after QA (TEST-077).** **Three defects block uat: `TASK-646` (a free pre-start absence does not stretch the expiry), `TASK-647` (an unlinked coach reported as told), `TASK-648` (the admin door accepts today at the server).** 🔴 **§3 item 2 and §9's expiry line are WRONG as written until 646 lands — the expiry does NOT currently stretch on the declaration path.** **This note is re-verified and re-measured before anyone follows it.**~~
**Written by @Sober for @Porter.** **Read it in order; the order is the instruction.**
✅ **Verified by me, both repos, with counts — not colours.** 📌 **Said the long way, per @Porter's rule: clean on a tree that ALSO holds Team B's uncommitted work.**

## 0. 🚫 NO MIGRATION IN THIS BATCH
**`65 .sql = 65 journal tags`, unchanged.** ⇒ **`db:migrate` has nothing to do.** 🔑 **Run it anyway and expect `Journal: 65 migration(s)` — a batch that needs no migration and a batch whose migration failed to copy look identical until you check.**

## 1. Environment — 🚫 nothing new
**`LINE_ADMIN_VERIFY_CODE` and `PUBLIC_ADMIN_BASE_URL` unchanged.** 🔴 **The second is still read at RUNTIME, not build time.**

## 2. 🔴 BE and FE ship TOGETHER — and this batch has a reason of its own
**The admin leave screen reads a field the new server returns (`teacherNotified`).** ✅ **The screen handles the field being ABSENT by saying nothing about the notice** — **so FE-before-BE degrades safely rather than lying.** 🚫 **But BE-before-FE is still wrong, and they are one release.**

## 3. What goes out
1. **An ADMIN can record a teacher's leave on their behalf** — a row action on the Teachers page. **FUTURE DATES ONLY — enforced at the SERVER as well as the dialog (`TASK-648`, owner ruling): today and the past are REFUSED before anything is cancelled.** 🔴 **A teacher's OWN door still takes today (a coach's same-day cancel) — unchanged.** **The teacher is told; 🚫 no family is told, because nothing is cancelled.**
2. **A not-yet-started course takes a planned absence FREE — with NO LIMIT.** ✅ **Owner ruling 2026-10-04: the cap built in `TASK-609` comes OUT before this ships (`TASK-643`)** — **Khwan disowned it, and on the deployed build she was right that pre-start leave was already unlimited.** 🔴 **The leave COUNTER itself stays; only the LIMIT goes.** ✅ **And each declared day now STRETCHES the course's expiry by one week, on the real path (`TASK-646`), so its make-up always lands inside it.**
3. **Swap now takes ANY teacher off a session, not only the primary** — ⚠️ **BACKEND ONLY, INERT.** **See §5.**
4. **A "from here on" swap pays the INCOMING coach**, on the Other-series path AND the group path. 🔴 **This is a MONEY fix.**
5. **The group swap door accepts an optional rate**, so a coach the group has never paid can still be swapped in.
6. **ONE reworded refusal**, owner-approved: ONE sentence replacing two for "that teacher is not on this session". 🚫 **The at-cap refusal (`§T-609-CAP`) does NOT ship — it goes with the cap.** 📌 *A refusal for a rule that no longer exists is worse than no refusal.*
7. **The course card's "ขยายได้ถึงสัปดาห์ที่ N" now reads the REAL expiry (`TASK-650`)** — it understated stretched courses, and 🔴 **it had been wrong for admin-EXTENDED expiries all along** (a 10-session course extended 4 weeks read week 13, really 17). **An ordinary course's card is byte-identical to before.**
8. **The admin's leave result now speaks to the ADMIN in four owner-approved sentences, and the "ticked sessions" warning no longer appears on the admin door (`TASK-651`).**

## 4. ✅ The numbers I verified, so you can quote them
✅ **RE-MEASURED AFTER `TASK-650` and `TASK-651` — FINAL, 2026-10-04.**
**Back: `3903 pass · 0 fail` · type-check clean · `65 = 65` (🚫 no migration).** **Front: `964 pass · 0 fail` across 105 files · type-check clean · build clean.** *(Counts include Team B's uncommitted work in the same tree.)*
**Front: `960 pass · 0 fail` across 105 files · type-check clean · build clean.** *(`TASK-643` touched the back only; the front was not re-measured because nothing in it changed.)*
**Break-and-watch, ALL re-run BY ME at the end (not read off a report):** back — `608` 9/9 · `609` 7/7 · `625` 10/10 · `629` 12/12 · `632` 8/8 · `634` 10/10 · `646` 8/8 · `647` 6/6 · `648` 6/6 · **`650` 7/7**; front — **`611` 24/24** · **`634` 11/11, run from the list FILED in the repo** (the artefact defect is CLOSED). **0 SURVIVED, 0 NO RESULT, CHECKSUM identical throughout.**
📌 **Why `task-609` went from 11 to 7, so nobody reads it as lost coverage:** **four mutations pinned the cap and lost their subject when it was removed — F4, F9, F10, F11 — and are RETIRED by name in the file.** **F3 described "the cap does not apply" as a defect; it is now the INTENDED behaviour, so it was INVERTED into a pin that a cap is not quietly reintroduced — and it bites.** 🔑 **Fewer, all meaningful — not fewer because something broke.**
⚠️ **One artefact defect, not a code defect: `task-634`'s FRONT test list as filed is SHORT, and with it `R8` survives.** **With the missing file added it is 11/11.** **The code is proven; the record of how to prove it was not.** 📌 **`TASK-637` makes that structural.**

## 5. ⚠️ Item 3 is INERT — and inert on the SCREEN is not sealed at the DOOR
**The widened swap ships with no front-end change, so nothing on any screen can reach it:** **ONE Swap entry point, beside the primary's name, and ONE body builder that names the primary.** ✅ **Confirmed from the repo, not assumed.**
⚠️ **The ROUTE will accept a non-primary from a holder of the schedule-edit grant who crafts a request by hand** — 🔑 **that is a working feature answering correctly, not a defect leaking.** ✅ **Call it inert; 🚫 do not call it sealed.**
📌 **Khwan does NOT get to choose WHICH teacher is swapped in this batch, and that is the thing she said would make the control do what she needs.** 🚫 **Do not soften that when you tell the owner.**

## 6. ✅ DECIDED — the cap comes out (`TASK-636` §1 → `TASK-643`)
**Owner ruling 2026-10-04: take the LIMIT out, keep the FLAG.** ✅ **Free pre-start absences are unlimited; `§T-609-CAP` goes with the limit.**
🔴 **What does NOT change, and must not be "tidied" by whoever deploys this:** **`plannedAtCreation` stays** (clearing it would re-open `UNDO_LEAVE_CHARGE_UNKNOWN` on rows already acted on) · **the leave COUNTER stays** — 🔑 **the course expiry is DERIVED from it (`size + quota` weeks), and the owner has not ruled on what would replace it.** ⇒ **`TASK-636` questions 2–4 remain OPEN and are not in this batch.**
✅ **`TASK-643` verified, then QA found three defects; all three fixed (`646`/`647`/`648`), re-verified by @Sober, §4 re-measured, 2026-10-04. The batch is READY.**

## 7. What Tanya tests — **the QA line is already written**
**`QA-LINE-REQ111-CF-2026-10-04.md`** — **API routes first, then screens, then LINE.** 🔴 **§1.6 is the one case I most want run: the admin route with the teacher id set to the literal `me`. `400` is right; `403` is the near-miss returning.**
**Add for this batch:** **a group swap to a coach the group has NEVER paid, with a rate typed ⇒ succeeds** · **the same without a rate ⇒ refused, and NOTHING moves** · **a from-here-on swap re-rates every date it moves.**
🚫 **She still cannot test an owner-level LINE account. That stays the owner's.**

## 8. Rollback
**The code rolls back on its own; there is no migration to consider.** 🔑 **Put the previous build back, both repos together.** 🚫 **Never roll one repo back without the other** — §2.

## 9. ⚠️ Known and deliberate — so nothing here is reported as a fault
- **The admin leave door refuses TODAY and PAST dates — on the screen AND at the server.** **Deliberate: the owner's ruling — accepting today would cancel the day's classes and notify the families in one irreversible call. And the screen cannot list that teacher's sessions anyway.** 🔑 *A screen that shows the wrong person's sessions and offers to cancel them is worse than one that refuses.*
- **Free pre-start absences are UNLIMITED and do not reduce the ordinary leaves available afterwards.** **Deliberate, by the owner's ruling and Khwan's own description of how it already worked.**
- **Each declared pre-start absence extends the course's expiry by one week, with no ceiling** — the customer's own rule (8 + 3 = 11), now without a cap above it. ✅ **Deliberate; the owner has the sentence.** ✅ **Proven on the REAL path (`TASK-646`), not only on the helper.**
- **LIFTING or undoing a declared day does NOT give the week back.** 🔑 **The expiry is a promise the family has already been shown, and a make-up may already sit inside the widened window — shrinking could strand it.** ⚠️ **If the owner wants a lift to reclaim the week, that is a ruling, not arithmetic.**
- 📌 *(Superseded, kept so nobody wonders where it went: "a course can reach twice its allowance" and "a declaration taken back still uses one of the free days" both described the CAP. With no cap, neither applies. `TASK-630` is moot.)*
- **A teacher with no LINE link produces a visible SKIPPED row and the admin screen says so in as many words** — 🚫 **it does not claim they were told.**
