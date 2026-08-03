# SPEC-026: A voucher booking must choose its program — and the eligible pickers need search
- Source: REQ-029
- Status: ACTIVE

## Overview
Two things on the New-booking modal. One is a **silent data-corruption bug that runs every day**; the other is
the same search complaint the customer already made about the Bookings page, on a different screen.

## 1. 🔴 The voucher program bug — and it is mine
`BookingModal.tsx:618-619` sends `subjectId: slotSubjectId`, where
`slotSubjectId = slotTeacher?.subjectOptions?.[0]?.id`. **The sport is taken by array position.** A teacher who
coaches Surfskate, Skateboard and Inline records **Surfskate every time**, whatever the child actually did.

**⚠️ I approved this.** SPEC-017 said *"Voucher: no teacher, no fixed slot"*; Fern found that wrong and
auto-filled from the clicked slot; I reviewed it, **corrected the teacher half in writing, and blessed the
subject half in the same breath.** The teacher is genuinely real — it's the column you clicked. **The subject
never was.** I had the two fields in front of me and only interrogated one.

**Why this is worse than a missing field**, and why it outranks everything else in flight:
- The wrong sport is **written to the booking** and nothing looks wrong.
- 💰 **It corrupts REQ-014's revenue-by-activity and REQ-013's sport-share at the source.** We spent two days
  making revenue reconcile, and it has been reconciling **a guess**.
- ⚠️ **REQ-027's voucher exclusions cannot be enforced on an auto-filled program.** A rule about which programs
  a voucher may pay for is unenforceable while nobody chooses.

**The fix: ask.** A required program choice on the Voucher tab, limited to what that teacher can actually coach.
**No fallback to `[0]`, ever** — if a teacher has exactly one subject it may be preselected, but the value must
come from a choice, not an index.

> **The general rule I want out of this:** *a defaulted value is a claim.* `[0]` is not a default, it's a
> **guess wearing a default's clothes** — a real default is one a human would recognise as right.

## 2. Search on the Course and Voucher pickers
Trial/Single have a searchable picker; Course/Voucher render a plain list. Fine for test data, unusable once
REQ-025 loads 20–36 real families.

**This one must be server-side, and not for consistency's sake — for a concrete reason.** REQ-029 asks for
name · nickname · **parent phone**, and I checked: `getEligibleStudents` returns `{ id, name, nickname, context }`
— **no phone**. So a client-side filter over the loaded list **physically cannot match a phone number**, and
adding phone to the payload would push PII onto a screen that deliberately doesn't carry it (the REQ-020
lesson).

⇒ **`GET /students/eligible` gains `q`, reusing `studentSearchConditions`** — the same rule as `/students` and
`/bookings`, so the same query works everywhere on this screen and the one next to it.

## Non-functional
- No migration. No change to booking creation beyond the subject now being chosen, entitlements, the freelance
  cap or the suspend gate.
- The **course** tab keeps taking its program from the course — that is a real fact, not a guess.

## Tasks
- **TASK-088** (Jason, BE): `q` on `GET /students/eligible` via `studentSearchConditions`.
- **TASK-089** (Fern, FE): the required program choice on the Voucher tab + search on both eligible pickers.
  **Browser-checked** before DONE.

## Questions
(Sober asks; Porter answers as `> answer: ...`)
1. **No blocking question.** The owner's requirement is unambiguous and the fix is to stop guessing.
2. **⚠️ One thing the team cannot fix and she should decide: the bookings already written.** Every voucher
   booking made since REQ-022 shipped carries a program chosen by array position. Some will be right by luck.
   **Nothing in this spec repairs them**, and REQ-013/REQ-014 will report them as-is. Options are hers — leave
   them, or have staff correct the affected bookings — but **she should know the number before she sees the
   chart.** I'd rather tell her now than have a sport-share pie explain it for us.
3. **FYI:** once REQ-027 lands, the program choice is where its voucher exclusions get enforced. Building the
   choice first is what makes that rule possible at all.
