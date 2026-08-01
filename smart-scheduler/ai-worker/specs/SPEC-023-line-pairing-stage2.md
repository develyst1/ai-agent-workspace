# SPEC-023: LINE pairing Stage 2 — teacher approval queue, collision resolution, unlink
- Source: REQ-020 (Stage 2 of SPEC-015)
- Status: ACTIVE

## Overview
Today, typing a teacher's nickname into the LINE bot **grants that teacher's access on the spot**. Stage 1
(TASK-047) stopped the two worst symptoms — no more children's names to anyone with a phone number, and a
nickname shared by two teachers binds nobody. **Stage 2 removes the underlying assumption: that typing a name
proves you are that person.** A claim becomes a request; staff approve it.

**Why now, and why it can't wait for September:** **22 of ~23 teachers are currently unlinked.** They will all
link during the run-up to launch — so the window in which an unverified claim is possible and the fortnight in
which everyone walks through it are **the same fortnight**. This is the one item whose cost isn't felt until
someone exploits it.

## As-built
- `line-webhook.service.ts:174` — `db.update(teachers).set({ lineUserId })` on a nickname match. **That single
  line is the vulnerability**; everything else in this spec exists to replace it safely.
- `lib/line-pairing.ts` — `decideTeacherMatch(count)` → `none | one | ambiguous` (TASK-047), already pure and
  tested. Stage 2 **reuses it and changes what each outcome does**.
- REQ-019's People screen shipped, so the staff UI finally has a home — which is exactly why I deferred this
  stage rather than building a queue with nowhere to approve from.
- **Q3 is answered and this stage is NOT blocked:** คุณฟีน — *"ไม่มี"*, nobody is both teacher and parent, so
  **one LINE account = one role** stands. **Do not build role switching.**

## Design
**Every teacher claim becomes a pending request. Nothing binds without a human.**

| `decideTeacherMatch` | Today | Stage 2 |
|---|---|---|
| `none` | "not found" | unchanged — no request; nothing to approve |
| `one` | **binds immediately** 🔴 | creates a **PENDING** request naming that teacher |
| `ambiguous` | binds nobody, tells them to see staff | creates a **PENDING** request with the **claimed nickname and no teacher** — staff pick who it is |

**The ambiguous case stops being a dead end and becomes the feature.** Stage 1 could only refuse; with a queue,
a collision is just a request where staff choose the person — which is what Porter's original design asked for.

**Approval is the only thing that writes `teachers.lineUserId`.** One writer, so "how did this account get
linked?" has exactly one answer.

## Data Model
**One new table** — `teacher_link_requests`: `id`, `lineUserId`, `claimedNickname`, `teacherId` (**nullable** —
unknown for a collision until staff decide), `status` (`PENDING`/`APPROVED`/`REJECTED`), `createdAt`,
`decidedAt`, `decidedBy`.

**Hand-authored migration, registered in `drizzle/meta/_journal.json` — no `db:generate`** (TASK-042 rule; the
snapshot chain is still incomplete). Nothing else in `public` changes.

**One pending request per LINE account** (re-claiming updates the existing row rather than queueing duplicates)
— otherwise a confused teacher retrying three times produces three identical rows for staff to work through.

## Safety rules — these are the point of the stage, not details
1. **A claim on an already-linked teacher is refused at request time**, exactly as today (`:171`). Don't let it
   become a pending request that would silently steal an account on approval.
2. **Re-check at approval.** Between request and decision the teacher may have been linked, archived or
   deleted. Approving must fail cleanly, not overwrite.
3. **Nothing about the parent path changes.** Parents stay self-service (คุณฟีน's confirmed decision); this
   stage is teachers only.
4. **The bot must never reveal whether a nickname exists** beyond what it already does — a request that names
   no teacher and one that names a teacher look the same to the person typing.

## Unlink
Staff can **unlink** a teacher's LINE account (`teachers.lineUserId = null`) — today a departed teacher keeps
receiving schedule pushes forever and there is no way to stop it. Unlink is reversible: the teacher can claim
again, which creates a new request.

## Notification — reuse, don't build
**A 9th attention check, `pending_teacher_links`.** The daily digest and the "needs attention" panel already
exist (REQ-023), so staff get pending requests where they already look, with **no new notification plumbing**.
This also matters for load: ~22 requests will arrive in a fortnight, and a queue nobody is told about is a queue
nobody empties.

## Tasks
- **TASK-075** (Jason, BE): migration + request/approve/reject/unlink endpoints + the webhook change + the 9th
  attention check.
- **TASK-076** (Fern, FE): the approval queue screen (approve · pick-on-collision · reject · unlink), alongside
  REQ-019's People screens. **Browser-checked** before DONE.

## Questions
(Sober asks; Porter answers as `> answer: ...`)
1. **What a pending user sees — I'm proceeding on:** *"your request is with staff, you'll be told when it's
   approved"*, and they stay unlinked (no teacher menu, no schedule pushes) until approved. Non-blocking; say if
   คุณฟีน wants different wording.
2. **Notify staff of new requests → yes, via the existing daily digest** (the 9th check). No new channel.
3. **⚠️ Notify the teacher on unlink? I am NOT guessing — proceeding on "no push".** Unlink usually means the
   person has left, and messaging them "your access was removed" is a real-world social act, not a technical
   one. Easy to add later; hard to un-send. **This is the one question here I'd like an actual answer to.**
