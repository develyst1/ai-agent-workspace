# TASK-572 — REQ-110 item 3: the voucher extend control — FE, S

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-30) · **Size S.** ⏸️ **Queued behind TASK-571.**

## §0 What the server gives you
- **An admin can extend a voucher's expiry**, through the same warn-and-save shape the course expiry edit uses — **one decision serving the preview and the save.**
- **EXPIRED ⇒ extendable** · **ENDED ⇒ 409** (its hours are gone; ⛔ *whether a different "top-up" door should exist is with the owner*) · **NOT STARTED ⇒ 409** — 🔑 *before the first booking the date is a sale-day placeholder, so "extending" it could end the voucher EARLIER.*
- ✅ **The extension now survives a full cancel-and-rebook.** 🔕 **Nobody is notified, deliberately** — the family sees it on their next notice.

## §1 The work
- **The control, with the preview's warning before the save.** 🚫 **Server refusals verbatim** — **all three of them carry a reason an admin can act on; do not replace them with a generic message.**
- ⚠️ **The two 409s are not errors in the admin's sense — they are answers.** 🔑 **Present them as "why not, and what to do instead", not as a failure banner.** 📋 **Wording is a DRAFT into the copy file; 🚫 code not held.**
- 🔕 **Do not imply anyone is told.** *The audience is deliberately none; a screen saying "the family has been notified" would be a lie.*

## §2 The proof
🔑 **Clicked: preview then save, asserting the REQUEST** · **no request before confirm** · **a 409 leaves the voucher untouched and shows the server's words.**

## §3 Not in scope
🚫 Top-up · 🚫 how a voucher's expiry is first set · 🚫 Palm's items.

## Definition of Done
- [ ] Extend with a preview warning · **all three refusals verbatim and presented as answers, not failures** · 🔕 nothing implying a notice · 🔑 clicked, asserting the request, none before confirm · drafts filed early · front repo re-read and said · suite **count** · tsc · build ok · Break-and-watch with `BASELINE=`, `finally`, CHECKSUM · report + `inbox/SA.md` + log.

---

# 📤 REPORT — @Fern → @Sober (2026-09-30)

## §0 ✅ Front repo re-read first — and what I found that the task did not say
🚫 **Not from memory.** I read `develop`'s voucher surface by file (`VoucherPanel`, `voucher.ts`, the contract types) and **@Jason's TASK-568/569 code itself** — the routes, `voucherExpiryDecision`, and the route-access table. **Three facts came out of that reading, not out of the task:**
1. 🔑 **Both refusals arrive at the PREVIEW.** The server runs **one `voucherExpiryDecision`** for `POST …/expiry/preview` and `PATCH …/expiry` ⇒ **the admin learns *why not* before pressing anything**, and a Save pressed anyway can only meet the same 409. *That is what "one decision serving the preview and the save" actually buys, and it changed where I put the refusal on screen.*
2. **The key is the COURSE's** — `action:bookings.course-expiry`, which the BE's own route table reuses. 🚫 No new key, exactly as voucher-cancel reuses course-cancel.
3. **The preview answers `{ expiryWarning }` and NOTHING else** — no `leaveRoom`. **Structural, not an omission:** a voucher has no plan and no leave quota, so the course preview's second half has nothing to report. Written into the type's doc comment so the next reader is not left wondering.
🚫 Items 4, 9 and 11 untouched.

## §1 The control — the course's shape, one new fact in it
**Warn, and still save.** The dialog seeds itself with the voucher's own date, asks the preview for **every date that differs**, and renders what comes back: the sessions that would fall outside, the count, and *"Nothing is saved yet."* 🚫 **The Save is never disabled by a warning.**
🔴 **What is new is that this entitlement can REFUSE — and a refusal is not a warning:**
- **The server's sentence is shown VERBATIM**, under a heading that asks the admin's own question back (*"This expiry cannot move — here is why"*). 🚫 **Never a generic failure**: each refusal names its own reason and that reason *is* the useful part.
- **What to do instead is ADDED underneath** — a new voucher for ENDED; book the first session for NOT STARTED, **keeping the BE's reason that a date set now could end the voucher EARLIER.**
- 🚫 **An unrecognised code gets NO suggestion** (`refusalAnswerKey` → `null`). 📌 *Advice invented for a refusal we do not understand is worse than none, because the admin would act on it.*
- 🔴 **A refused date cannot be saved — two guards** (the disabled button AND a pre-request return). ⚠️ **That block is the SERVER's refusal of that exact date, never a warning**, and the two are kept apart in the code and in the pins.
- **A new date discards the previous answer AND the previous refusal** — an answer about another date is not about this one.
⚠️ **An EARLIER date is named** (*"it shortens the voucher instead of extending it"*) — 🚫 **not a gate**: this is the expiry *edit*, and the admin may shorten it. The word on the button would simply be a lie for that save if nothing said so.

## §2 🔕 The audience — said, not implied
**The dialog states that nobody is told**, in both states, and names where the family will see the date (their next deduction notice or reminder).
🔑 **The task said "do not imply anyone is told"; I went one line further and said the opposite out loud, deliberately** — *silence is what lets an admin assume a notice went out.* ⚠️ **If you would rather the screen said nothing at all, that is one string to delete** — but a pin then has nothing to protect, and **V8 below shows what that pin is worth.**
🚫 Nothing in the block may acquire the words *notified / แจ้งลูกค้า / ส่งข้อความ* — **pinned across every string in both languages**, not just the one sentence.

## §3 The door — and the rule it deliberately does not own
**Offered on the key and any status but ENDED. Hidden, never disabled.** ✅ **EXPIRED is offered — that is the feature.**
🔑 **NOT STARTED is NOT re-implemented, and it CANNOT be:** it means *no live booking exists yet*, and a voucher row has no field that says so — `usedHours: 0` is equally true of a voucher with a PENDING booking. ⇒ **A copy here could only ever guess.** So the door opens on what is knowable and **the server answers the rest, as an answer.**
📌 *Pinned by absence: the rule module may not mention `usedHours`, `remaining`, `today`, `new Date` or `dayjs`.* **V6 proves the pin bites when that guess is added.**

## §4 The proof — 🔑 clicked, asserting the REQUEST
**10 clicked tests**, requests split **by method AND url**, because the only thing that proves nothing was written is the count of the **WRITE**:
- opening asks **nothing**, and the Save is shut (the date on screen is the one it already has);
- a new date sends **exactly one preview and zero PATCH**, and the server's row is on screen;
- **Save sends ONE PATCH with the SAME body the preview was asked** (asserted `toEqual`, not merely "a PATCH happened");
- 🔴 a **refused preview**: the server's Thai sentence verbatim, the answer under it, the button shut, **zero writes** — *and the button is then pressed anyway, because a clicked test that presses a disabled button proves nothing on its own; the count does*;
- a **new date drops the refusal** and asks again;
- an **earlier date** is named and still savable;
- 🔴 **a 409 on the SAVE itself** is shown the same way, once, with **no success toast** — *the preview's yes is not a promise.*
📌 **And the file prints 201 bytes.** I mounted the dialog **closed**, opened by its prop — the pattern my own audit identified as the reason `change-start-date.dom.test.tsx` dumps 6.1 MB. *The finding paid for itself in the next task.*

## §5 🔑 Break-and-watch — through the runner that now lives in the REPO
`bun run mutation:run -- --tests "…" --mutations scripts/mutation/task-572.json` · **BASELINE measured and clean · every mutation restored in `finally` and re-read from disk · TREE CHECKSUM identical.**

| # | mutation | verdict |
|---|---|---|
| V1 | 🔴 the server's refusal stops blocking the save | ✅ BITES 41/1 |
| V2 | the Save BUTTON opens on a refused date | ✅ BITES 39/3 |
| V3 | 🔴 the server's sentence replaced by a generic message | ✅ BITES 39/3 |
| V4 | the what-to-do answer disappears | ✅ BITES 39/3 |
| V5 | 🔴 an UNKNOWN code gets a suggestion anyway | ✅ BITES 41/1 |
| V6 | the door guesses NOT STARTED from the hours | ✅ BITES 41/1 |
| V7 | the door offered on an ENDED voucher | ✅ BITES 40/2 |
| V8 | 🔕 the audience line claims the family was notified | ✅ BITES 40/2 |
| V9 | a new date keeps the previous refusal | ✅ BITES 41/1 |
| V10 | the preview block computes the cut list | ✅ BITES 41/1 |
| V11 | 🔴 the preview and the save stop sharing one body | ✅ BITES 41/1 |
| V12 | an earlier date is no longer named | ✅ BITES 40/2 |

**Twelve mutations, twelve BITES, every row with COUNTS, CHECKSUM identical.** 🔑 **And every row prints its byte size (1.2–19 KB against a 512 MiB capture)** — *the thing that was invisible in TASK-574 is now on the face of the table.*

## §6 Verification
**840 pass / 0 fail across 89 files** (was 812/87 ⇒ **+28 tests, +2 files**) · **tsc clean** · **`bun run build` ok** — and the mutation pass ended `CHECKSUM identical`, so the tree those numbers describe is the tree that is there now.
🚫 No SQL, no database, no environment · **no BE change asked for** · no deploy request · 🚫 top-up, how an expiry is first set, and Palm's items untouched · **git read only.**
📋 **8 drafts filed as COPY-REVIEW §13**, both languages, shape-pinned, `DRAFT (Fern, TASK-572)`. 🚫 Code not held.

### ⚠️ Declared: two existing pins touched, one shared comment updated, three comments of mine repaired
1. **`action-gate.test.ts`: the key-literal sweep 103 → 104.** The new door asks its key **as a literal**, which is what that sweep exists to see. Nothing else about it changed.
2. **`expiry-preview.test.ts`: `contract.ts` must not contain `"ExpiryPreview"` → must not DECLARE one** (`/\b(interface|type) ExpiryPreview\b/`). The old form also forbade any type whose name merely *ends* in it; `VoucherExpiryPreview` belongs in `contract.ts` because unlike the course's app-level type it **is** a wire shape. 🔑 **What the pin protects is unchanged.**
3. **`ExpiryWarningAlert` has a second caller now, and its doc comment says so.** Its own comment invited exactly this: *"If a second caller ever needs this warning again, the reason to have exactly one of these is unchanged."* Same question, same DTO, one renderer.
4. 🔴 **Three doc comments that MY OWN TASK-571/574 insertions had orphaned, repaired** — in `scheduler.service.ts`, `scheduler.mock.service.ts` and `useScheduler.ts` I had inserted new functions **between an existing comment and the function it documented**. ⚠️ **The worst of them had become a lie:** the sentence *"There is no preview route"* was sitting directly above `previewCourseStart`. Each is back on its own function and the stale line now points at TASK-574. 📌 *A comment does not have to be edited to become false — it only has to be moved.* ⚠️ **And one more sentence went false because of THIS task:** `EditExpiryDialog` said the shared alert had *only* one caller. Corrected there too.
⚠️ **And one I did NOT touch, because it is not mine:** a `REQ-082 AC-1/AC-4` block sits above `useRemoveCourseRental` in `useScheduler.ts` **in `HEAD`** — pre-existing, one line to move, yours to assign.

⚠️ **Not proven by me:** CSS, focus order and a real tap · the server's own refusal logic (@Jason's; I assert only that I show its words and add nothing to them) · and **§2's extra sentence is a judgement you may reverse in one edit.**

**Ball: @Sober.**

---

# ✅ DONE — REVIEWED by @Sober (2026-09-30) · **item 3 complete, both halves**
Verified by me: **840 pass / 0 fail** across 89 files · tsc 0 · build ok. **Run through `scripts/mutation/` in the repo — twelve rows, twelve bites, counts on every row.**

## ✅ Three facts that came from READING, not from the task
🔑 **Both refusals arrive at the PREVIEW**, because one decision serves both calls ⇒ **the admin learns *why not* before pressing anything.** ✅ **And that changed where she put the refusal on screen** — *that is what "one decision serving preview and save" actually buys, discovered rather than assumed.*
✅ **The key is the COURSE's — no new key.** ✅ **And `{ expiryWarning }` with no `leaveRoom` is STRUCTURAL** (a voucher has no plan and no quota), **written into the type's doc so the next reader is not left guessing** — *an absence with a reason beside it is not a gap.*

## 🔑 §3 — "it cannot be re-implemented" is the strongest possible answer
**NOT STARTED means *no live booking exists yet*, and a voucher row has NO FIELD that says so — `usedHours: 0` is equally true of one with a PENDING booking.** ⇒ **A copy here could only GUESS.**
✅ **So the door opens on what is knowable and the server answers the rest, AS AN ANSWER.** **V6 bites the moment the guess is added.** 🔑 *She did not merely decline to duplicate the rule — she proved duplication was impossible, which is a stronger guarantee than a promise not to.*

## ⚖️ §2 — **she went one line beyond the task, and she was right. Keep it.**
**I wrote "do not imply anyone is told." She made the dialog SAY nobody is told, in both states, and name where the family will see the date.**
🔑 **Her reason beats my instruction: "silence is what lets an admin assume a notice went out."** ⇒ **A prohibition leaves a blank; a statement closes it.** ✅ **And V8 shows what the pin is worth: it covers every string in the block, in both languages, not only that sentence.** 🚫 **No reversal.**
✅ **"A refusal is not a warning"** — the server's words verbatim, *what to do instead* underneath, 🚫 **and no invented suggestion for a code we do not recognise.** 🔑 *Advice invented for a refusal nobody understands is worse than none.*
✅ **An EARLIER date is NAMED as shortening and not gated** — correct: **it is the expiry EDIT, and a button that silently refused would be lying about what it is.**

## ✅ §4 — the proof kept getting stricter on its own
**Requests split by METHOD and URL · Save sends ONE PATCH with the SAME body the preview was asked (`toEqual`, not "a PATCH happened") · the disabled button is pressed anyway · a new date drops the refusal ·** 🔴 **a 409 on the SAVE is shown the same way, once, with no success toast** — 🔑 ***the preview's yes is not a promise.*** *That case was in no task; it is TASK-546's rule reaching a third screen by her own hand.*
📌 **And the new DOM file prints 201 bytes because she mounted the dialog CLOSED — the pattern her own audit named. The finding paid for itself in the next task.**

## 🔑 The declared repairs — one is a keeper
🔴 **Three doc comments that HER OWN TASK-571/574 insertions had orphaned**, the worst being ***"There is no preview route" sitting directly above `previewCourseStart`.***
🔑 **"A comment does not have to be edited to become false — it only has to be moved."** ⇒ **Recorded in `SYSTEM-FACTS.md`.** ✅ **Self-caught, self-declared, all re-attached.**
✅ **The two pins touched are both narrowings that keep what they protected** (the key sweep 103 → 104 is the sweep doing its job; *must not DECLARE* is the honest form of *must not CONTAIN*).
⚖️ **The pre-existing orphan in HEAD (`REQ-082` above `useRemoveCourseRental`): it is in her repo, it is one line ⇒ fix it, declared, in TASK-567.** 🚫 *Leaving a known-wrong comment because it was someone else's is how the next person inherits it.*

## ⚖️ TASK-571's nine rows — **ruled: RE-RUN them**
**They were produced by the runner she later found broken.** ⇒ 🔑 **This is exactly the row-level rule I set for @Jason: a table we have specific reason to doubt gets re-run; forty tasks on principle do not.** **Nine rows is cheap and the doubt is specific.**
