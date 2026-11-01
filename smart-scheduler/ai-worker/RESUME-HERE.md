# RESUME HERE — where this project is right now

> 🔴 **REPLACED, NEVER APPENDED TO.** A snapshot, not a log. Previous snapshot (2026-10-02, a month stale) is kept
> verbatim at `archive/RESUME-HERE-2026-11-01-pre-order51.md`.
> **One page, ~4–6 KB.** History → `log/` · decisions → `SYSTEM-FACTS.md` · state → `board.md`.
> **Written by** the PM before ending any session; **read by** the PM and the SA Lead, first. **On opening,**
> check it against `board.md` + today's log and **report any disagreement to the owner**. Provenance on every line.

**Written:** 2026-11-01 by Porter (PM), during Marie ORDER 51 housekeeping · **Newest log at the time:** `log/2026-10-28.md`

## What we are in the middle of

1. ⏸️ **Nothing is being built. The desk has been quiet since 2026-10-28.** Every REQ up to REQ-133 is closed or accepted;
   all inboxes were drained on 2026-11-01 (ORDER 51; the verbatim copies are `archive/inbox-*-2026-11-01-pre-order51.md`). `[team-proposed 2026-11-01]`
2. 💰 **The back-office money meeting is on SAT 2026-11-07, between the owner, ฟีน and Khwan.** `[owner-approved 2026-10-28: "ถูกแล้ว เสาร์ 7"]`
   - The materials are FINAL and Tanya-passed (REQ-133):
     - the pricing deck `som-balance-backoffice-spec/pricing-deck/dist/index.html` (md5 `604bde02…`);
     - the back-office final UI `…/final-ui/dist/index.html` (md5 `1d0ce1f6…`, opens dark).
   - The Q&A is in `BRIEF-owner-backoffice-money-meeting-2026-10-27.md` §7.
   - **The price:** ALL parts, no options, 39,200 ฿ (149 d × 263 ฿/d), in 3 installments by delivery: 11,900 / 13,800 / 13,500. **No deposit.** Bug fixes throughout, then 6 months' maintenance; additions at 263 ฿/d. `[owner-approved 2026-10-27/28]`
3. ✅ **Khwan answered the 6 back-office money questions** (1a · 2b · 3a · 4a · 5a · 6b). They are recorded in `requirements/REQ-120-…md` §9.4. The price is unchanged. `[customer-asked 2026-10-28]`

## What each thread is waiting on, and from whom

| Thread | Waiting on | Since | What unblocks it |
|---|---|---|---|
| The back-office build (REQ-120) | **the owner** | 2026-10-28 | The meeting result on 11-07 (price agreed?), the go-live date and the stock Excel. Then the owner's GO; the build starts with Stock + roles. |
| TEST-122 (a LINE tap on sid) | **the owner, optional** | 2026-10-25 | Only if he wants it. `tests/TEST-122-123-sid-blocked-data-request.md` |
| TEST-121 SQL-1 / DR-3 | **the owner, optional** | 2026-10-25 | Only if he wants it. `tests/TEST-121-sid-req126-127-end-early-and-change-teacher-time.md` |
| Palm's SOM report may count ended courses | **nobody (not opened)** | 2026-10-27 | Open a REQ only if the owner asks. |
| An Atlas review: UI UX Pro Max / Spec Kit vs `impeccable` | **the owner, optional** | 2026-10-28 | Atlas's domain; after the meeting, if he wants it. |

## Decided recently, not yet in a REQ

- **The release order:** sid deploy → Tanya PASS → git. `[owner-approved 2026-10-27: "ต้อง deploy sid เทสผ่านก่อนค่อยขึ้น git"]`
- **An Atom relay counts** for reports and answers. **It does NOT count** for git, deploys, money or customer messages (`ATOM.md`). `[owner-approved 2026-10-27]`
- **Forms of address:** กุ้ง is "พี่กุ้ง"; BooBee_NS is "พี่ปู" (`SYSTEM-FACTS.md`). `[owner-approved 2026-10-27]`
- **No main character runs as a subagent.** Each role has its own session; wake it with `nudge-session` (`CLAUDE.md`). `[owner-approved 2026-11-01]`

## What becomes urgent, and when

- 📅 **SAT 11-07:** the meeting. Ask the owner for its result on the first message after it.
- ⚠️ **`board.md` is 60 KB, still over the 40 KB gate, after the 11-01 sweep.** The rest is non-table prose (the deadline banner, project context, the owner's batch). Trimming it is a separate decision for Marie or the owner. `[team-proposed 2026-11-01]`
- ⚠️ **`SYSTEM-FACTS.md` is 533 KB.** It is never compacted; the index (ORDER 22.2) is still to be raised with the owner. `[carried-over]`

## What we already tried that did NOT work

- **Asking the customer many questions at once.** 31 questions to Khwan drew *"เห้ย ทำไม มันเยอะจังวะ"* from the owner; 6 got answered the same day. `[owner-approved 2026-10-27]`
- **Real staff names in mock data or screenshots.** Use the invented-name map (Ton / Ploy / Nam / May / Beam / Pete / CEO). `[owner-approved 2026-10-27]`
- **Rows written above `# Board`.** Two were found and moved on 11-01 (`archive/board-2026-11-01-orphan-row.md`). **Check that your row went INTO the table.** `[carried-over]`
