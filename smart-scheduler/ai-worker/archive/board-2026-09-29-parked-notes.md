# Parked board prose — 2026-09-29 compaction (smart-scheduler)

> Written by Porter during Marie's owner-approved housekeeping of 2026-09-29.
> **Nothing here was deleted from anywhere.** Every entry is the VERBATIM original of a `board.md`
> cell (or orphan row) that had to be shortened to satisfy the 300-char cell rule. The live board
> cell now points here by the `§key` shown in each heading. Ordered as they appear in the board.

Pre-compaction board (verbatim, whole file): `archive/board-2026-09-29-pre-compaction.md`
All 112 orphan rows (verbatim): `archive/board-2026-09-29-orphan-rows.md`
Closed rows swept today: `archive/board-closed.md` § Swept 2026-09-29

---

## §orphan-TASK-500

**TASK-500 — original orphan row, verbatim (re-homed to the Tasks table in shortened form)**

```
| TASK-500 | BE: 🔴 **the intermittent full-run failure RECURRED** (one run 3256/1 on the SA's machine, four clean around it; ~1 in 5 across two machines) — capture it, name the cause, fix it | (first seen by @Jason in TASK-488, left unowned pending recurrence; ticketed 09-26) | ⏪ **PRELOAD REVERTED per the owner** (Jason 09-26) — byte-exact (tree checksum back to the post-TASK-501 value), copy kept in scratchpad · testing on sid is by design · the 44–46 mocks → TASK-504; the guard that IS wanted → TASK-503 | @Jason |
```

## §orphan-TASK-511

**TASK-511 — original orphan row, verbatim (re-homed to the Tasks table in shortened form)**

```
| TASK-511 | BE: **the public docs page's login example is `admin`/`admin`** — the password is unusable (8-char rule) **but `admin` is `.env.example`'s bootstrap username**, so the page probably names the first super-admin | (found by @Jason in TASK-509; ticketed by @Sober 09-26) | 🟡 **REPORTED — awaiting @Sober’s review** (Jason 09-26) · login example `admin`/`admin` → `your.username` / `your-password-here` (valid under USERNAME_RE and 8+) · other examples (a date, two times) placeholders, left · document otherwise clean · pinned, revert bites · short passwords NOT investigated · 3306/0 both ways · tsc 0 · 59=59 | @Jason |
```

## §orphan-TASK-516

**TASK-516 — original orphan row, verbatim (re-homed to the Tasks table in shortened form)**

```
| TASK-516 | BE: **announce a MOVED class to the coach(es) AND the family** — today a date/time change is entirely silent | (🔨 owner ruling 09-27 "ย้ายคาบแจ้งทั้งคู่"; found via @Jason's TASK-512 §3) | DONE — REVIEWED by @Sober (09-27), **next deploy** · 3400/0 both ways · 🔴 **the trap he closed is one the SA's own ruling created, found before it shipped: the admin's group cancel cascades the seats FIRST**, so the "drop cancelled seats" filter would have read every seat as cancelled and told **NO family at all** — *a cancel that tells nobody, caused by a filter added to stop telling the wrong people*; he snapshots the seats before the cascade · 📌 **the lesson is the SA's: a filter on "current state", inside an operation that is CHANGING that state, reads the wrong side of the change** · ✅ the audience changes listed and pinned — **four notices, not one**, all GROUP-only · 📌 for the owner: **a cancelled make-up is never told to the family**, so we will now tell a family their make-up MOVED but not that it was CANCELLED | @Jason |
```

## §orphan-TASK-518

**TASK-518 — original orphan row, verbatim (re-homed to the Tasks table in shortened form)**

```
| TASK-518 | FE: 🔴 **there is NO admin Undo control anywhere — build it** (roster + plan editor, three state-driven `ย้อน…` labels, the refusals designed first) | (Tanya TEST-075 B via @Porter 09-27) | 🔴 REOPENED as TASK-531 (Tanya TEST-075 D4/D5, 09-27) — **the control is on screen and does NOTHING when clicked** (no dialog, no `/undo`, no error), **and TASK-514's fix regressed**: the ATTENDED row shows `บันทึกลา/ป่วย` again with the quota/make-up promise · 📌 **the SA reviewed and passed it on the suite, tsc, the build and a careful report — none of which could tell him whether the button works, because every pin in the task was about what RENDERS** · 🔑 **"the API works is not the feature exists", one layer up: "the component renders is not the button works"** — **the SA coined that lesson two days ago and then wrote a DoD that could not catch it** | @Fern |
```

## §orphan-TASK-551

**TASK-551 — original orphan row, verbatim (re-homed to the Tasks table in shortened form)**

```
| TASK-551 | BE: **the forecast miss — the forecast missed the replaced make-up** · **the same-slot silence** (owner ruling) | (Tanya item-6 on sid, via @Porter; owner *"ตามแนะนำ ไม่ต้องส่ง"*) |✅ §2/§3 DONE · ⚖️ the forecast miss RULED — REVIEWED by @Sober (09-28) · **3532/0** normally **and 3× DB-unreachable, 0 failed queries**, tsc 0, **61 = 61**, re-run by me · 🔴 **the forecast miss cause NAMED and STOPPED as §1 required — and it is worse than the symptom: neither the accepted gap nor a preview/act split. Both read the same thing because THE LINK WAS NEVER WRITTEN** — `planCourseMoves` counts a leave as matched if **ANY** row points at it, **including the CANCELLED `e7cb8771`**, so the re-plan appended `0494ab85` with `extendedFromId: null` (**reproduced on the pure planner**) ⇒ 📌 **the forecast was HONEST about a database that was WRONG** — *fixing the screen would have been fixing the wrong thing, which is exactly why §1 said name the cause first* · ⚖️ **SA ruling: (a) the planner fix + a DATA REQUEST, NOT (b)** — 🔑 *a cancelled make-up is not a make-up; the planner is wrong on its own terms EVERYWHERE, and a course whose leave is "matched" by a cancelled row quietly stops owing what it owes*; ✅ **the act outcome changing is the POINT, not the risk** ⇒ **TASK-552** · 🔴 **sid needs a one-row re-link = DATA REQUEST via @Porter, 🚫 no agent touches it** · ✅ **§2: he DERIVED that the re-plan CAN change coach/co-teachers/times** (it copies a template) ⇒ 🔑 **"same slot" alone would have silenced a notice for a coach who genuinely lost the class — the condition was load-bearing** · **ONE pure decider `sameSlotReplacement`, exact on date · start · end · coach SET**, make-ups only; coach notice moved below the re-plan **under TASK-548 own move rule, applied without being restated** · ✅ pinned both ways **and then some**: same slot + same coaches ⇒ nothing · same slot + different/dropped coach ⇒ **family silent, coaches told** · different date ⇒ today notices byte for byte · **one minute off ⇒ both told** (*the pin that proves "exact" means exact*) · ⚠️ declared not-in-scope: **the coach who GAINS the re-added class is told in neither case (pre-existing)** ⇒ raised to @Porter separately · ✅ **§3 answered path-by-path**: ended/paused/non-course/other-series **unreachable**; ceiling and expired course **not paths (they append)**; 🔑 **REACHABLE: an over-size IMPORTED course** (trims withheld ⇒ surplus make-ups) — **for Tanya: pick one from the TASK-166 audit and cancel a surplus make-up; if sid has none, test only**| @Jason |
```

## §orphan-TASK-552

**TASK-552 — original orphan row, verbatim (re-homed to the Tasks table in shortened form)**

```
| TASK-552 | BE: **a cancelled make-up is not a make-up** (`planCourseMoves` matches a leave against a CANCELLED row) | (@Jason D7 root cause in TASK-551, ruled (a) by @Sober) |✅ (B) DONE — REVIEWED by @Sober (09-29) · **3544/0** normally **and 3× DB-unreachable, 0 failed queries**, tsc 0, **61 = 61**, **4 mutations bite**, re-run by me · ✅ **inheritance from the cancelled row OWN link only (`reowedForOf`), on exactly the 3 cancel-then-re-plan paths** — 🚫 a link-invented mutation bites · ✅ **an unlinked make-up yields NOTHING and IT IS SAID in the log** ⇒ 🔑 *the difference between a gap that is CARRIED and a gap that is HIDDEN* — the pause case stays visible for TASK-553 instead of being quietly filled with a plausible leave · ✅ empty ⇒ the old answer byte for byte; the inherited leave goes first, never a double answer · 🔑 **the pin worth naming: he pinned the ORDER, not just the code — the one-line planner change is deliberately ABSENT and an EARLY-SHIP mutation BITES** ⇒ *a test whose subject is a DECISION rather than a behaviour: it fails if someone does the right fix at the wrong time*; **pause/resume and insert pinned UNCHANGED**, so the gap cannot be closed by accident either · ✅ **end to end: the forecast miss course as (B) writes it ⇒ the forecast NAMES the replacement and the act PROCEEDS and cancels it** · 🔴 **the OLD unlinked shape (sid row) still reads "no make-up" and that is PINNED** — ✅ *pinning what the fix does NOT do is what keeps the DATA REQUEST honest: without it the next person to see sid would read it as the fix failing* · ✅ before/after of an affected course written in §3 · 🚫 sid repair untouched|
```

## §orphan-TASK-553

**TASK-553 — original orphan row, verbatim (re-homed to the Tasks table in shortened form)**

```
| TASK-553 | BE: **every answer to a leave carries its link** (pause→resume · admin insert · backfill · THEN the planner line) | (@Jason dependency finding in TASK-552, option (A)) | ⏸️ QUEUED behind TASK-552 (B) — 🔑 **the ORDER is the finding, not negotiable: writers link → backfill → THEN the one planner line**; 🚫 *the planner line must not land first "because it is one line"* · ⚠️ **the backfill is the hard part and the difficulty must be SURFACED, not smoothed: an ambiguous row is LEFT ALONE and COUNTED, never assigned on a best guess** — *this defect came from treating an assumed link as a real one; a backfill that guesses would industrialise it* · **three numbers before anything is applied: linked · ambiguous · n/a** · 🚫 **DATA operation — no agent runs it anywhere; dry-run output is what the SA reviews, then it is handed to the owner** · ✅ **the pins must include the two cases that would have broken in the wrong order** (pause→resume, admin insert) | @Jason |
```

## §orphan-TASK-555

**TASK-555 — original orphan row, verbatim (re-homed to the Tasks table in shortened form)**

```
| TASK-555 | FE: **the eight LINE-page strings become FINAL** (§D2) | (owner APPROVED 09-28, via @Porter) |⏸️ HELD — **@Porter 09-29: the owner FROZE SCOPE to D7 + the same-slot suppression; D8 is in only because it blocks uat.** 🚫 **Copy goes to the NEXT round** — *the SA had queued it to release after the deploy; the freeze overrides that, and correctly: a frozen scope that bends for "it is only text" is not frozen* · the approved strings and the boundary pin are unchanged and waiting | @Fern || @Fern |
```

