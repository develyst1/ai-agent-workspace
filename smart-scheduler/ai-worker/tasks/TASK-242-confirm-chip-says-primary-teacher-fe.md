# TASK-242: FE — the post-confirm chip must stop claiming more than it knows

- Source: REQ-078 DEF-6 §2 (Fern's finding on TASK-241) · @Porter's ruling, 2026-09-02
- Status: 🔒 **HELD — do NOT start.** The owner declared REQ-078's last round closed and the build is finished.
- Repo: **smart-scheduler-front**. Assignee: **@Fern**, when released.

## 🔒 Release condition — @Porter's, and it is narrow

> *"The wording line rides along **only if Tanya's round forces an FE touch anyway** — otherwise it ships with
> the follow-up."*

⇒ **If the final QA round produces no FE defect, this does NOT ship now.** It goes with the per-recipient
follow-up REQ. **Written down so it is not rediscovered as a defect in six months** — which is the whole reason
it exists as a file rather than a log line.

## The defect

`UpdateBookingStatusResponse.notification` is **one object with no recipient identity** (`contract.ts:411`), and
the BE assigns it **only for the primary** teacher (`scheduler.service.ts:2486`) — deliberately, with the reason
on the line. The chip renders straight off it.

⇒ with two teachers, primary linked and the second not: the chip says **`ส่ง LINE แล้ว`** while the second
teacher's outbox row is `SKIPPED`. **The send is correct; the sentence is false.** DEF-6 one screen later.

## The change — one line, no contract change

> **`ส่ง LINE ถึงครูหลักแล้ว`**

The chip reports the primary, so **say the primary**. @Porter's ruling, and his reasoning is the part to keep:
*documenting the chip's meaning is not a fix — nobody reads a doc, they read the chip.*

🚫 **Do not narrow it further** (e.g. dropping the per-send claim for multi-teacher bookings). Fern's own analysis:
under-claiming is **worse for staff in the common single-teacher case** than today's chip.
🚫 **Do not touch the BE contract here.** Per-recipient results is the follow-up REQ, and it changes
`UpdateBookingStatusResponse` for every caller of `updateBookingStatus`.

## The follow-up this defers to
A named REQ carrying the owner's one-line question: **does he want the screen to answer "did everyone get it?"**
If yes → a small BE contract task returning `{ teacherId, status, reason }[]`. If no → this wording is the
permanent answer.

## Definition of Done (when released)
- [ ] The chip says `ส่ง LINE ถึงครูหลักแล้ว` in both languages; the unlinked case is unchanged.
- [ ] No BE change, no contract change.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` → 0 · `bun run build` ok · suite green.

## Review
(Sober fills this in at REVIEW.)
