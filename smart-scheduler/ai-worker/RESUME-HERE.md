# RESUME HERE — where this project is right now

> 🔴 **REPLACED, NEVER APPENDED TO.** A snapshot, not a log. Its predecessor (`../PROJECT-STATUS.md`) died by
> stacking dated blocks to 47.9 KB, nine days stale; it is kept verbatim at
> `archive/PROJECT-STATUS-2026-09-28-pre-split.md`.
> **One page, ~4–6 KB.** History → `log/` · decisions → `SYSTEM-FACTS.md` · state → `board.md`.
> **Written by** the PM before ending any session; **read by** the PM and the SA Lead, first. **On opening,**
> check it against `board.md` + today's log and **report any disagreement to the owner** — never silently trust
> it, never silently fix it. Provenance on every line.

**Written:** 2026-10-02 by Porter (PM) · **Newest log at the time:** `log/2026-10-02.md`
*(Previous snapshot was 2026-09-29 and three days stale; this replaces it entirely.)*

## What we are in the middle of

1. 🏁 **The REQ-110 round is CLOSED and LIVE on `uat`.** `[owner-approved 2026-10-02]`
   All 12 of Khwan's items are done; the owner has told her so. `uat` is migrated (**65/65 green, 8 applied**),
   the code is up, `[outbox] LINE worker started (every 15s)` confirmed. Both data gates passed: Khwan is linked
   as an admin on the real OA, and the Teacher role holds `action:calendar.teacher-leave` with 21 coaches on it.
   Palm's front-end branch is merged, the one identifier it dropped is restored (TASK-605), and Tanya smoked both
   `sid` and `uat`. `[team-proposed 2026-10-02]`
2. ▶️ **REQ-111 — a NEW front-office round from Khwan — is in intake, ANALYSE/SIZE ONLY.** `[customer-asked 2026-10-02]`
   Intake is **closed** (owner: *"หมดละเท่านี้"*). **Eight items, A–H**: A the full notification-message inventory ·
   B "Confirm results" prints raw booking UUIDs instead of student names on CONFIRMED rows · C an admin records a
   teacher's leave · D a blocked day must be visible on the GRID itself · E the ECA teacher change is the WRONG
   act (she wants a SWAP, not a second teacher) · F a not-yet-started course takes a planned absence without
   spending quota · G the `uat` `LEAVE_CHARGE_UNKNOWN` scale · H the freelance rows move behind the coach-pay
   permission (owner ruled option ข). **Sober owes ONE sizing message for all of them — except G, which comes
   ahead of it because it is live.** `[owner-approved 2026-10-02]`
3. ⏸️ **The BACKOFFICE phase is PAUSED** — the customer asked for the front office to be finished first.
   `[customer-asked 2026-10-02]` 🔴 **Sober's finding stands and changes the first decision there: there are NO
   `REQ-BO-001…006` files and never have been** — what exists is six one-line Thai titles in `OWNER-LIST.md` §2.
   Our own `REQ-002` (DELIVERED), `REQ-006` (IN_SPEC) and `REQ-014` (READY_FOR_SA) are all from July.
   **The owner's one decision when the phase opens: who writes the six requirements, and in what form.**
   `[team-proposed 2026-10-02]`
4. 🆕 **This project now runs TWO parallel teams** (ORDER 14, owner's go 2026-10-02): **Team A** Sober · Jason ·
   Fern, **Team B** Silver · Bob · Fanta. **Porter and Tanya are NOT duplicated** — one PM, one QA, both serving
   both teams. **No batch is claimed yet** (`board.md` → `## Batch claims`), so Team B has no pile and has not
   started. 🔴 **Splitting and claiming the next batch is Porter's named job and must happen BEFORE either team
   starts.** `[owner-approved 2026-10-02]`

## What each thread is waiting on, and from whom

| Thread | Waiting on | Since | What unblocks it |
|---|---|---|---|
| REQ-111 item G — `LEAVE_CHARGE_UNKNOWN` on live `uat` | **@Sober** | 2026-10-02 | his answer: the mechanism, the SCALE (a read-only query if he needs one), whether it decays, and whether an admin can actually do anything. **Nothing is said to Khwan until (2) is answered.** |
| REQ-111 A–F + H sizing | **@Sober** | 2026-10-02 | ONE sizing message for all of them. Build nothing. |
| Khwan's three diagnoses (Daily report · freelance rows · "no class today") | **@Porter → the owner** | 2026-10-02 | Sober answered all three; Porter relays them to the owner in one message. **The freelance-rows one is an OWNER DECISION, not a defect** (TASK-607). |
| Rich menus on the real OA | **the owner or Khwan** | 2026-10-02 | a 1-minute phone check — Tanya cannot see it read-only. Open her item 4. |
| The next batch split + file-area claim | **@Porter** | 2026-10-02 | the owner's next batch; no team starts without a claim line on the board. |
| Team B's first pile | **@Silver, @Bob, @Fanta — idle, onboarded, standing by** | 2026-10-02 | Porter handing Silver a pile in one message. |

## Decided recently, not yet in a REQ

- **The freelance-budget rows move BEHIND the coach-pay permission** (owner's option ข). `[owner-approved 2026-10-02]`
- **Anything Palm does, we skip entirely** — items 4, 9 and 11 are not ours. `[owner-approved 2026-09-29]`
- **The chat address stays FREE TEXT** — no picker, no address dataset. `[owner-approved 2026-10-01]`
- **`props-wired.test.ts` pins prop wiring by source and binds Palm's props too** (Sober's ruling; the owner is
  TOLD, not asked). `[team-proposed 2026-10-02]`
- **One shared knowledge file.** `SYSTEM-FACTS.md` serves both teams; a second one is drift. `[owner-approved 2026-10-02]`

## What becomes urgent, and when

- 🔴 **`LEAVE_CHARGE_UNKNOWN` is being hit by the customer on LIVE `uat` today.** If Porter's unverified reading is
  right, it is not a defect but it refuses **essentially every leave that predates today's deploy**. `[carried-over]`
- 🔴 **The board's line-1 defect is UNFIXED.** Rows keep landing **above** the `# Board` title instead of in the
  `## Tasks` table: 112 of them on 09-29, **11 more by 10-02**. **Check that your row went INTO the table.**
  `[carried-over]`
- ⚠️ **`SYSTEM-FACTS.md` is 398 KB and the project cannot pass the gate until it is split** (Marie ORDER 12.5, still
  owed). **Both teams are reading a knowledge file too large to read honestly.** `[carried-over]`
- **Keep on `sid` until released:** the two QA accounts, the phone linked to QA parent `0899990763`, and fixture
  course `47be0cc9` (until @Sober releases it). `[team-proposed 2026-10-02]`

## What we already tried that did NOT work

- **A test suite can be green on a tree that cannot BUILD.** After Palm's merge: 921/0 passing, `tsc` 1 error,
  `bun run build` failing. 🔑 *Check the three gates separately.* `[team-proposed 2026-10-02]`
- **Only OPTIONAL props can be dropped in silence** — a required one left out is a type error, so the build shouts.
  The merge dropped `closedWeeks`; `onSelectCamp` was wired at both call sites and pinned at neither.
  `[team-proposed 2026-10-02]`
- **`toContain` on a string BOTH languages share is not a pin** — deleting the English marker left the assertion
  satisfied by the Thai one. **Count both languages, or require both scripts.** `[team-proposed 2026-10-01]`
- **"No CONFIRMED class today" is TRUE and USELESS** — sessions are born PENDING, so a child who has a class is told
  there is none. An honest sentence that reads as a lie. `[team-proposed 2026-10-02]`

## Open questions with the owner

- **Who sees the freelance drawn/refunded rows?** `GET /courses/:id/history` is gated on `menu:bookings` only, **not**
  the coach-pay key ⇒ an admin barred from a coach's RATE can see that coach's hours. **His call, not ours** (TASK-607).
  `[team-proposed 2026-10-02]`
- **Who writes the six backoffice requirements, and in what form?** Until one exists there is nothing to size.
  `[team-proposed 2026-10-02]`
- **The copy nit, now overdue:** `LEAVE_CHARGE_UNKNOWN` / `MAKEUP_CHAIN` end in a bare *"กรุณาแก้ไขด้วยตนเอง"* with no
  what and no where. It is now in front of the customer. `[carried-over]`
- **REQ-086** (the customer edits the message words) remains the known LAST big item; `SPEC-078` written. REQ-111 item
  A may make it cheaper or redundant — Sober to say which. `[carried-over]`
