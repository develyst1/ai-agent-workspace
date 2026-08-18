# smart-scheduler — PROJECT STATUS (resume-here / cross-machine memory)

> **Source of truth for resuming on any machine.** git-synced, so it travels; local `.claude/memory/` does not.
> Resume: `git pull` → `ai-worker/PROTOCOL.md` + your role file → this + `ai-worker/board.md` + the newest
> `ai-worker/log/*.md` → act on your role's ball.
>
> **Last updated:** 2026-08-16 (end of day) by Porter (PM), reconciled against the board + `log/2026-08-16.md`.
> REQ *file headers* can lag; trust this and the board. Human twin: `PROJECT-STATUS.html`. Code: **`H:\scheduler`**.

## 🚦 Environments — the owner's names, use these (standing rule, 2026-08-16)
| | **`sid`** — where the team builds | **`uat`** — the customer's system |
|---|---|---|
| frontoffice | **som.develyst.online** | **frontoffice.develyst.online** |
| backoffice | **backoffice-som.develyst.online** | **backoffice.develyst.online** |
| who touches it | team verifies here | **owner only** — the team never runs anything there |

**Stop writing "prod".** `uat` *is* the box previously called customer-prod; the mismatch cost a day of confusion.
🔴 **Every migration is run and verified on `sid` first** — *"ห้ามพลาด เพราะหลังเทสเสร็จต้องขึ้น uat เลย"*. Once
REQ-055 lands, `uat` holds **real families and real money records**; a failed migration there is the customer's
business, not a rollback exercise. **Every migration TASK must state how it was proven on `sid`.**

## Where we are (2026-08-16)
- ✅ **REQ-042 DELIVERED** — the LINE rich menu never switched on role change or language toggle because
  `app_settings.line_rich_menu_ids` was empty and the failure was swallowed by a `try/catch`. Fixed by
  **TASK-130 `line:adopt-menus`** (adopt the ids already on the OA; **zero OA write** — a blind `publish-menus`
  was held by Porter and struck by Sober because it would duplicate menus and reset the customer's default).
  Owner verified both role switch and language switch on the live OA. **Not covered:** AC-4 (wrong input
  mid-`สมัคร`) — carried as a regression line for Tanya.
- 📥 **Customer meeting + go-live intake → REQ-045…REQ-055** (11 REQs in one day).
- 🔨 **Four REQs code-complete** waiting only on Tanya's rendered/live passes; **8 tasks** built and SA-reviewed today.
- 🔴 **The customer wants to start using the system** → **REQ-055 is the highest priority in the project.**

## 🔴 REQ-055 — go-live: wipe test data, then import the real families (HIGHEST)
The customer sent `Student list.xlsx` and asked us to clear our test data first. Owner's order: **backup → wipe →
import people → hand over.**
- **The file creates people, not courses** — it has no program/teacher/time/package/sessions-used/expiry.
  **Wave 1 = master data (confirmed by the owner).** **Wave 2 = their real timetable**, once the customer sends,
  per student: program · package size · sessions already used · day+time · coach. (REQ-025 is the mid-course path.)
- **Porter's analysis of the file (2026-08-16), from the customer's own data:**
  **176 named rows · 124 clean · 52 need the customer's confirmation · 21 families with more than one child.**
  Detail (names + per-row problem) in **gitignored** `project-docs/2026-08-16-student-import-issues.md` — the owner
  sends that list to the customer. Breakdown: 32 no phone · 40 no DOB · 11 DOB to confirm · 4 rows that are a
  parent not a child · 1 phone still short after the leading zero.
- **Owner's three rulings:** phones get their **leading `0` prefixed automatically** (Excel dropped it on every
  row; anything not exactly 10 digits after that is **not stored**, it goes on the list) · children with **no
  phone are held back**, not imported · **parent-name rows become the family/parent name**, never a student.
- **Two traps recorded for whoever writes the importer:** Excel stores phones in **scientific notation**
  (`8.64197169E8`) and DOBs as **date serials** — read the real cell types; and a mistyped DOB (`22022020`)
  converts **silently into a plausible wrong date** (year 62194; another row reads 1985) — hence a 2005–2026
  sanity range, with failures listed rather than stored.
- **Still unknown, deliberately not guessed:** what **column A** means (owner asking the customer — Porter
  previously mis-recorded it as "day of the week, owner-confirmed"; it was an inference, now corrected) and what
  the **yellow-highlighted rows** mean.

## 🧪 Code-complete — waiting on QA (Tanya). The only thing between these and DONE
Both passes are impossible headless (the Mantine modal won't composite; LINE taps need a live OA).
- **Pass A — booking-modal render pass** (375/768/1440, FRONTEND-STANDARD): TASK-131 → **REQ-043** (one student
  picker on all four tabs) · TASK-132 → **REQ-048** (voucher time selectable, seeded from the clicked cell) ·
  TASK-133 → **REQ-053** FE half (course session's วิชา read-only + explanation).
- **Pass B — live LINE pass**: TASK-135 → **REQ-046** (picker label `time · teacher · program`, child-first step,
  confirmation naming the cancelled session **and** the child). ⚠️ Same OA the customers are on — **must not
  message real parents/teachers**; if it can't be done cleanly the verdict is `NOT_TESTED` and Porter routes it.
- Also for Tanya when she's in there: **REQ-042 AC-4**, and **Script 4's approve/reject half** (REQ-020 — the
  owner's screenshots already evidence that a teacher claim *queues* rather than auto-granting).

## 🔨 Team queue — unblocked
- **REQ-055** (above) — outranks everything.
- **REQ-049** notify-on-leave → SPEC-044 + TASK-136 (BE) + TASK-137 (FE). Owner accepted all three
  recommendations: existing admin channel · **immediate**, not the digest · a late leave reads the same.
- **REQ-054** course = one program at creation → SPEC-045 + TASK-138/139/140. Lossless: the DATA REQUEST found
  **zero** mixed-program courses, so the new course-level subject column back-fills by derivation.
- **REQ-052** calendar cell shows program + type → SPEC-046 + TASK-141 (BE nickname on the DTO) + TASK-142 (FE).
  Design: status stays the primary signal; **type is a separate channel** (edge-stripe + labelled dot + text),
  because the six semantic hues are already spent on status. **Porter approved the palette subject to two checks
  before build:** compare the four type hues against the **rendered** status hues (violet vs EXTENDED, slate vs
  SICK_LEAVE) and verify both themes.
- **REQ-050** check-in attribution — audit says the main worry is a non-issue (id-keyed). 🔴 Real gap:
  **correcting a check-in does not return the consumed session/hour** — Porter ruled it **must** (money owed to a
  family). **No historical back-fill** — undetectable from stored data; guessing against real balances isn't
  authorised.
- **REQ-045** planned absences at course creation — owner chose **(B)**: free when declared at creation, quota
  still applies later. Two SPEC consequences: `MAX_WEEK_BY_SIZE` becomes the only limit, and "declared at
  creation" must be a **real distinction in the data**.
- **REQ-047** leave cut-off — owner chose **per teacher type** (not one school-wide number); values become
  settings on REQ-031's screen. Porter's stated assumption: **defaults 3 h for both types** unless he objects.
- **REQ-051** walk-in QR page — scan → phone → that phone's children today → per child **check in or take leave**.
  A leave **inside** the cut-off is `PENDING_APPROVAL` + admin notified + an admin-code fast path at the counter
  (owner's addition, and it closes the loophole an outright exemption would have opened).
- **REQ-044** — 🔴 **BLOCKED on a code question.** The tab does a plain **ADD (+1 session)**, not a make-up move;
  Porter had relayed REQ-030's *intention* as behaviour. Owner pre-authorised **both** outcomes: **(A)** route it
  through the real make-up path, **or (C)** remove the tab if that's hard. **(B) rename-only is rejected.** Sober
  answers first: *when does a course hold a session that is owed but not yet placed* (what does `ยังค้างอีก N คาบ`
  count)?

## Waiting on the owner
- Send the **52-row list** to the customer; get **column A**'s meaning and the **yellow rows**' meaning.
- **Wave-2 data** for the timetable (program · package · used · day+time · coach per student).
- **REQ-035** (sell-side) — his call: **do it last**.
- Housekeeping he has explicitly deferred or declined: close the two temp DB whitelists (`49.237.170.101`,
  `110.171.40.169`) · `.env.local` pointing local FE work at `uat` (**declined — his machine, his call; do not
  re-raise**) · commits (he does them himself) · `QA-prod-*` residue (REQ-040 delete block).

## Parked / backlog
REQ-036 (early termination — his hours-based model idea; needs a customer conversation) · REQ-014
(revenue-by-activity: built but **delivered-but-UNVERIFIED**, reports ฿0 until real prices are seeded) ·
REQ-034 / REQ-039 / REQ-033 (dashboards + the 8-item wishlist, "only if nothing else is left") · REQ-017 ·
REQ-021 · REQ-038 #6–9 · REQ-041 item 6 (font — CUT) · owner-run QA Scripts 4 (REQ-020) and 5 (REQ-023).

## Team & workflow
PM=Porter · SA=Sober · BE=Jason · FE=Fern · QA=Tanya. Chain is hard: Human→Porter→Sober→(Jason/Fern), QA hangs off
Porter. Everything lives in `ai-worker/`. See `ai-worker/PROTOCOL.md`.

**Two Porter corrections on the record from today** (both were inferences written in the voice of confirmed fact,
both caught by others): REQ-044's premise (REQ-030's intention relayed as shipped behaviour) and REQ-055's column A
("owner-confirmed" when the owner had said no such thing). Rule going forward: anything not read in the code or
heard from the owner verbatim is labelled **"Porter's reading — verify"**, never entered as an answer.
