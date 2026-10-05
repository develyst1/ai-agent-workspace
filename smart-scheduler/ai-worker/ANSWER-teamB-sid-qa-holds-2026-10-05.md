# ANSWER — Porter's three holds from QA on `sid` (TEST-078) — @Silver, 2026-10-05
🚫 Nothing was changed: no code and no words. These are facts from the code, with one proposal each for Porter and the owner.

## 1. 🔴 TASK-663 says 14, TASK-664 says (12). **Explained: not a defect, but the two numbers were read at different moments.**
- **CERTAIN (code):** with no search text and no birthday filter, the People switch sends exactly `{ noParent: "true", limit: 200 }`.
  - `birthdayQuery` returns `null` when the birthday filter is empty (`lib/people/birthday-filter.ts:37-38`), and `PeopleContent.tsx:126` then spreads only `q`, if any.
  - The front end neither filters nor counts anything else: the label is `rows.length` (`NoParentList` "filters nothing").
  - Neither the route call nor the screen sends `archived`, so both read **live rows only**. It is the **same predicate**.
- **CERTAIN (QA's own record):** `tests/TEST-078-both-teams-batch-sid.md` §9, Tanya: *"the label reads (12) (the API's 14 minus the 2 import students I archived)"*.
  - ⇒ **She archived 2 between the two reads.** 14 − 2 = 12. The pair agrees.
- ⚠️ **But Porter's underlying point is real, and here is where the pair CAN disagree:**
  - The switch **composes with the page's search box and birthday filter** (Fanta's declared decision 3). With either set, the "(N)" is narrowed, and **the label does not say so.**
  - A bare number that silently means "parentless AND matching your search" will one day contradict someone's route call. Nobody will know which half to trust.
- ▶️ **Proposal, the smallest fix with no new wording:** make the no-parent view **independent**: it ignores search and birthday, so its count **always equals** `GET /students?noParent=true` (live).
  - FE XS: one line in `PeopleContent.tsx:126`, plus a pin that the request is exactly `{ noParent: "true", limit: 200 }` whatever the search box holds.
  - Rationale: the list is short (14 on sid, ~21 on uat), so it needs no search. And a count that can be reconciled is the whole point of the pair.
  - *Alternative:* keep the composition and label the narrowed count. That is new wording, so it needs the owner.

## 2. (a) The อื่นๆ refusal's title *"จองวันที่นี้ไม่ได้"* names the wrong cause
- **CERTAIN: it is an EXISTING shared title, not ours.**
  - `booking.dateRejectedTitle` (`dictionaries.ts:1159` EN *"Can't book this date"* / `:3126` TH).
  - Team A's `BookingModal.tsx:1843` renders it over **every** server refusal from the save (`setSubmitError(e.message)`, `:1440`), whatever the cause.
- ⇒ **The wrong-cause title is pre-existing for every non-date refusal**, for example a clash or a suspended household. Ours is simply the newest one to land under it.
- **Smallest correct fix:** make the title **neutral**, e.g. *"จองไม่สำเร็จ / Couldn't save this booking"*, with the body (already specific) carrying the reason.
  - **Blast radius:** that one key. It is used **only** at `BookingModal.tsx:1843` (grep), so every refusal on the booking modal's save gets a truthful title. Date refusals lose nothing, because their body names the date problem.
  - ⚠️ It needs **new wording** (the owner's), and the key is **not Team B's** (`booking.*`, Team A's screen). It is Porter's to route.
- **Bigger alternative, not recommended now:** a per-error-code title. That is Team A's file plus a code→title table.

## 2. (b) Can the field's sentence and the server's sentence be on screen TOGETHER? **YES, on ONE path.**
- **Strict screens** (New course, New voucher, the booking modal's lesson types; `required` picker): **NEVER together.** Save is disabled until the phone is valid (TASK-662), so the server is never reached. Tanya confirmed this in TEST-078 §8.
- 🔴 **The อื่นๆ booking (optional picker, Team A's `BookingModal`): BOTH show at once.**
  - The picker shows the field error (its rule is on by default), but Save stays **enabled**, by design, so a typed name is never silently dropped (TASK-662 Q3).
  - Pressing Save ⇒ the server refuses ⇒ the Alert shows the server sentence **under the wrong title from (a)**, while the field error is still showing above. TEST-078 §8 records exactly this.
- ⇒ **By Porter's own rule, that is a defect.**
- ▶️ **Proposal, which fixes (b) and also removes our case from (a):** on the อื่นๆ path, **disable Save while a NEW student's phone is invalid**, the same as the strict screens. Then the server is never reached for this rule, only the field sentence ever shows, and the wrong title never appears for it.
  - It needs a **caller change in Team A's `BookingModal.tsx`**: one condition on its Save. The picker cannot do it alone without dropping the typed name, which Q3 rejected.
  - **FE XS.** Porter's call, because the file is Team A's.
  - Typing no student at all stays allowed, as today.

## Summary
| Hold | Verdict | Fix | Whose file |
|---|---|---|---|
| 14 vs (12) | **explained**: 2 archived between the reads; same predicate | optional XS: make the view independent of search/birthday so the count always reconciles | Team B (`PeopleContent.tsx`) |
| (a) wrong title | **pre-existing** shared title over every booking-modal refusal | a neutral title (new wording) | `booking.*` key, Team A's screen |
| (b) two sentences together | **yes, only on อื่นๆ** | disable Save on อื่นๆ while a new student's phone is invalid | Team A's `BookingModal.tsx` |
