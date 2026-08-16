# smart-scheduler — PROJECT STATUS (resume-here / cross-machine memory)

> **Source of truth for resuming the project on any machine.** This file is git-synced, so it travels;
> the local `.claude/memory/` does **not**. To resume: `git pull` → read `ai-worker/PROTOCOL.md` + your role
> file → read this + `ai-worker/board.md` + the newest `ai-worker/log/*.md` → act on your role's open balls.
>
> **Last updated:** 2026-08-16 (end of day) by Porter (PM). REQ *file headers* can be stale — this doc is
> reconciled against `board.md` + `log/2026-08-16.md`; trust this over a REQ file's status line.
> Human-readable twin: `PROJECT-STATUS.html`. Code repos: **`H:\scheduler`**.

## Where we are (2026-08-16)
- 🏁 The 2026-08-11 go-live set is still live and clean. **Zero open defects.**
- ✅ **REQ-042 fixed today** — the LINE rich menu never switched on a role change because
  `app_settings.line_rich_menu_ids` was **empty**, so `linkRoleRichMenu` had no target and the failure was
  **swallowed** by a `try/catch` (`line-webhook.service.ts:462`): the link completed, the menu silently didn't
  move. Fix = **TASK-130 `line:adopt-menus`** (adopt the ids already on the OA; **zero OA write**) — a blind
  `publish-menus` was held by Porter and struck by Sober because it would create duplicate menus and reset the
  channel default on a **customer-facing** OA. Owner ran it; teacher + parent both work, no dead taps.
- 📥 **Customer meeting intake → REQ-045…REQ-053** (9 items), plus **REQ-054** raised from review.
- 🔨 **Four REQs are code-complete and SA-reviewed**, waiting only on rendered/live QA passes.

## 🔴 Environment identity — corrected today, read this before any "prod vs UAT" sentence
`frontoffice.develyst.online` = what every older artifact calls **"customer-prod"** = what the owner calls
**"UAT"**. **One box.** There are exactly two servers: `sid` and this one. The LINE webhook points here, the OA
on it is the customer-facing OA, and it runs the 2026-08-11 build (contains TASK-046). Consequences: every
deferred "prod" housekeeping row means **this** server, and today's REQ-042 fix repaired the customer-facing
environment directly.

## Waiting on the OWNER (nothing else blocks these)
| Item | Decision needed | Porter's lean |
|---|---|---|
| **REQ-045** | Planned absence at course creation: **(A)** free/unlimited · **(B)** free only at creation · **(C)** "ไม่ตัดโควตา" really meant "must not lock". ⚠️ He reversed REQ-030 Q1 (*"ควรสิ"* = quota IS consumed, and that consumption is **what earns the extension**) | **B** |
| **REQ-047** | 3 h leave cut-off **replaces** today's per-teacher-type rule (FT/PT ≥1 h · freelance ≥2 h), or stays per type? | one school-wide number |
| **REQ-049** | Who is "the admin"? · immediate vs 08:00 digest · does a late leave read differently? | existing admin channel · immediate · same message |
| **REQ-051** | Accept "narrow window, minimum disclosure" for the walk-in QR page? · also allow leave there? · one QR or many? | accept · no · one |
| **REQ-044** | Is `แทรกคาบชดเชย` the word staff actually use? · should the confirmation name which session moved? | their word wins · no, end date is enough |
| **REQ-042** | Two ACs untested: wrong input mid-`สมัคร`, and the **language toggle** re-linking the menu → confirm, or hand to Tanya | hand to Tanya if unsure |
| **REQ-035** | go-live vs fast-follow (specced 08-04, genuinely unbuilt, touches money + 1 migration) | owner's call |

**DATA REQUEST (owner-run, read-only)** — do any courses already contain **mixed programs**? Rows found have
been feeding REQ-013/REQ-014 wrong numbers, and what to do about them is the owner's decision:
```sql
SELECT b.course_id, count(DISTINCT b.subject_id) AS programs,
       string_agg(DISTINCT s.name, ', ') AS program_names,
       min(b.student_id) AS student_id
FROM bookings b JOIN subjects s ON s.id = b.subject_id
WHERE b.course_id IS NOT NULL AND b.status <> 'CANCELLED'
GROUP BY b.course_id HAVING count(DISTINCT b.subject_id) > 1;
```

## 🧪 Code-complete — waiting on QA (Tanya), the only thing between these and DONE
Both passes are un-doable headless (the Mantine modal won't composite; LINE taps need a live OA).
- **Pass A — booking-modal render pass** (375/768/1440, FRONTEND-STANDARD): **TASK-131** → REQ-043 (one student
  picker on all four tabs) · **TASK-132** → REQ-048 (voucher time selectable, seeded from the clicked cell) ·
  **TASK-133** → REQ-053 FE half (course session's วิชา read-only + explanation).
- **Pass B — live LINE leave pass**: **TASK-135** → REQ-046 (enriched picker label `time · teacher · program`,
  child-first step when ≥2 children have sessions, confirmation names the cancelled session **and the child**).
  ⚠️ Same OA the customers are on — **must not message real parents/teachers**; if it can't be done cleanly the
  verdict is `NOT_TESTED` and Porter routes it to the owner (Script-6 pattern).
- **TASK-134** (BE 409 `COURSE_SUBJECT_LOCKED`) is DONE; REQ-053 closes on Pass A + it.

## 🔨 Team queue — unblocked, no owner input needed
- **REQ-052** — calendar cell shows program + booking type. Owner answered: **dual colour** (status = primary,
  type = small/quiet) + **nickname**. Guardrails: the **text label stays** (colour never the sole carrier), no
  status hue reused for a type, palette from existing tokens, legend names both dimensions, final palette shown
  to Porter before build. The **view-mode switch** (`สถานะ > ประเภท` / `ประเภท > สถานะ`) is **deferred, not
  rejected** — revisit after staff use the simple version.
- **REQ-054** — a course is created with ONE program (`CreatePlanFlow` posts per-row `subjectId`; TASK-134 guards
  edits only). Porter pulled the course-level program field **into** scope: today the course's program is
  `bookings[0].subject` — an accident of row order, which is why this class of bug keeps appearing.
- **REQ-050** — check-in attribution. 🟢 Audit says the main worry is a **non-issue** (primary LINE flow is
  id-keyed; QR token is per-booking). 🔴 Real gap: **correcting a check-in does not return the consumed
  session/hour** — Porter decided it **must** (money owed to a family). Historical back-fill: **none** — wrong
  attributions aren't detectable from stored data, and guessing against real balances isn't authorised.
- **REQ-044** — rename the course tab to `แทรกคาบชดเชย / Make-up session` + always-visible explainer +
  confirmation naming the plan's new end date. Wording-only; all strings written.

## Housekeeping (owner-run, not blocking)
- **Close two temp DB whitelists** on the customer-facing box: `49.237.170.101` (opened today) and
  `110.171.40.169` (from the 08-11 deploy — the board still lists it unclosed). Remove line → `pg_reload_conf()`
  → verify gone.
- **`smart-scheduler-front/.env.local` points `NEXT_PUBLIC_API_URL` + `AUTH_URL` at `frontoffice.develyst.online`**
  — starting a local dev server and hitting a protected route redirects to the **production login page**. Default
  should be localhost; opting into prod must be deliberate.
- **Commit TASK-133** (the only uncommitted work; 131+132 = `c6db8ca`, TASK-130 = `9d01efd`).
- QA residue `QA-prod-*` still on the box (REQ-040 delete block).

## Parked / backlog (unchanged)
REQ-036 (early termination — owner's hours-based model idea, needs a customer conversation) · REQ-014
(revenue-by-activity: built but **delivered-but-UNVERIFIED**, reports ฿0 until real prices are seeded) ·
REQ-034 / REQ-039 / REQ-033 (dashboards + the 8-item wishlist — "only if nothing else is left") · REQ-017 ·
REQ-021 · REQ-038 #6–9 · REQ-041 item 6 (font — CUT) · owner-run QA Scripts 4 (REQ-020) and 5 (REQ-023).

## Team & workflow
PM=Porter · SA=Sober · BE=Jason · FE=Fern · QA=Tanya. Chain is hard: Human→Porter→Sober→(Jason/Fern), QA hangs
off Porter. Coordination lives in `ai-worker/` (board, log, REQ/SPEC/TASK/TEST). See `ai-worker/PROTOCOL.md`.
