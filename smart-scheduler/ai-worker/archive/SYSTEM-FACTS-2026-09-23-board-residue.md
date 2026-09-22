# BOARD RESIDUE removed from `SYSTEM-FACTS.md` — 2026-09-23 (Marie housekeeping, owner-approved, ORDER 6)

Source: the two `MOVED FROM board.md` dumps (2026-09-08 and 2026-09-09) inside `SYSTEM-FACTS.md`. These blocks are
board-shaped residue — per-REQ/per-DEF work-item status at a past moment, and two self-referential board pointers —
whose home is `board.md`, the REQ/TASK files or `archive/board-closed.md`, not the Knowledge tier. Copied VERBATIM,
nothing dropped. The full pre-split file is `archive/SYSTEM-FACTS-2026-09-23-pre-split.md`.

---

## 1. QA work-item status, from the `## Project info` block (was `SYSTEM-FACTS.md` lines 1319–1371)

These were sub-bullets under `- Team: Porter (PM/BA) · Sober (SA) · Jason (BE) · Fern (FE) · **Tanya (QA)**.`
The durable bullet above them (“QA trial, this project only…”) stayed in `SYSTEM-FACTS.md`.

  - 🧪 **QA verdict history 08-04 → 08-28 — parked verbatim** in `archive/board-2026-08-29-parked-notes.md`;
    evidence in `tests/TEST-055…TEST-060`. Verdicts exist, in board order, for: REQ-071 · REQ-072 · REQ-036 ·
    REQ-063 · REQ-064 / TASK-168 · REQ-046 · REQ-047 · REQ-049 / TASK-152 · REQ-044 · REQ-043 · REQ-048 · REQ-054 ·
    REQ-053 · DEF-5 → REQ-056 · DEF-3 → REQ-041 / TASK-090 · DEF-1 · TASK-129 · TASK-128 · REQ-030 ·
    REQ-037 / TASK-124 · REQ-038 / TASK-099 · REQ-024 · REQ-026 · REQ-020 · REQ-022 · REQ-009.
  - ✅ **LINE test recipient — CLOSED 2026-09-01** (open since 08-04). The owner linked **himself** on `sid` as
    teacher **Bank**; outbound LINE is testable, and AC-16 was fired from it the same day (`tests/TEST-064`
    §Round 3). The rule that the **2 real teachers are never messaged in rehearsal stands unchanged.**
    🔴 **Still short one thing:** only **ONE** recipient is linked, so *"every assigned teacher gets it"*
    (REQ-078 AC-16 revised) **cannot be proven** — a second linked device/teacher is needed.
  - 🔴🔴 **BLOCKING NOW (QA, 2026-09-06):** **the `sid` session harness will not run on this machine.** The minted
    cookie expired with the deploy; re-minting (`mint-session.mjs`, TASK-090) needs the owner's access file and the
    API login, and **QA's tooling refused that step — twice.** `sid` itself is UP (`/login` 200, `POST
    /api/auth/login` → 400 from the backend's own validator). ⇒ **the whole REQ-076/082/083/084 round is
    `NOT_TESTED` for an ACCESS reason, not a product one**, and since **`uat` is read-only**, every write-shaped
    AC is proven on `sid` or nowhere. **`tests/TEST-066-…` is open as a PLAN only** — `NOT_TESTED` on every line, no verdict in it, and it may not be quoted as evidence.
  - ✅ **CLOSED 2026-09-07 — backoffice access GRANTED** (owner: both `sid` hosts, full). QA authenticated via
    the API, never the login form. **28 items / 75 movements read.** It immediately closed `REQ-083` AC-6 and
    `REQ-076` AC-4, and proved `REQ-082` AC-5 against the ledger instead of by inference.
  - 🔴🔴 **DEF-2 (QA, 2026-09-08) — RELEASE-BLOCKING. Course RESUME regenerates the plan.** Reproduced twice on
    fresh 4-session fixtures: **4 rows → 4 (all flipped `CANCELLED` by pause) → 8 (originals + a brand-new plan).**
    🎯 **Isolated: PAUSE does not duplicate; RESUME does** — but pause writes the TERMINAL code `CANCELLED`, so
    resume has no plan to restore and builds one. Course history shows 4 `cancelled` then 4 `scheduled` events.
    🔴 **Second, worse half: the new plan starts from TODAY, not the course's own slot** — a course sold for
    `2026-11-11` came back as `2026-09-09`, and **this week's calendar now shows November sessions.**
    🟢 **NOT a money defect: exactly one `SALE` per course, pause/resume wrote nothing; entitlement intact.**
    Reproduction left live: course `dd78bd1e-…`. `tests/TEST-066` → DEF-2. @Sober.
  - 🔴🔴 **DEF-5 (QA, 2026-09-08) — RELEASE-BLOCKING. Course RESUME cannot be completed through the UI.**
    `Resume the course` renders a raw Zod error: the FE submits `startTime: "10:00:00"` where the API requires
    `HH:mm`. **Fails on the form's defaults AND on a hand-typed value** — the dialog holds a HIDDEN third input
    still carrying `10:00:00`, so the field the admin edits is not the field submitted. 🟢 **Server is innocent:**
    `POST /courses/:id/resume {startTime:"11:00"}` → **200**. ⚠️ The admin is shown a REGEX, not a message.
    ⇒ **a paused course can only be recovered by a hand-made API call.** `tests/TEST-066` → Round 13. @Sober.
  - ✅ **Pause-dialog COUNT fixed (QA, 2026-09-08)** — dialog says 6 against a 7-row plan (`ON LEAVE` correctly
    excluded); every counted row is visible on the same screen. The `9`-against-`5` defect is closed.
  - ✅ **DEF-1 CLOSED 2026-09-08 (QA).** Post-redeploy retest: `?status=PAUSED` → **200** *(was 400)* and the
    tray on screen reads **`Paused bookings | 1 | KKTEST | 1 HR | Was: 08/Oct/26 16:00`**. **Verified BOTH via
    the API and on screen** — a 200 with an empty array would have read identically. ⇒ **`REQ-076` AC-1, AC-9
    and AC-12 all PASS.** The empty state is honest again. **Nothing from QA holds `uat`.**
  - ✅ **`REQ-083` AC-5 · AC-7 · AC-9 PASS (QA, 2026-09-08).** A swept `1 HR` posted **฿1,390**; undo wrote **one**
    `REVERSAL −139000` beside an unedited `SALE`; **the replay wrote nothing.** 🟢 **`end-of-day` DOES run on
    `sid`** — answered from movements, not `job_runs`.
  - 🔻 **QA RETRACTION (2026-09-08):** the 09-07 claim *"no movement is tied to a booking"* was **FALSE**.
    `postBookingSale` writes `refType: "SALE"` with `refId` = the **booking** id, so `refType` cannot
    discriminate. **@Sober called it before it could be measured.** The money thread is fine.
  - ⚠️ **FE width checks NOT_TESTED** — QA could not change the viewport (Chrome fixed at 1920, in-app browser
    refused). **DEF-1 also means the tray can only be measured EMPTY, so 1280-decides-AC-9 is unanswerable
    until the fix lands.** **Re-run them together.**
  - ⚠️ **`sid` was being written to by someone else during the QA round** (`ปกติ 13→18`; the QA fixture course
    was sold at 00:05). **Baselines must be re-read, never carried across hours.**
  - 🔴 **Open for the human (QA):** **backoffice read access** (`backoffice-som.develyst.online`) — without it
    Tanya cannot read what any day-end actually posted, so every money AC stays `NOT_TESTED` even after the job
    runs. Access lives in `../project-docs/`, never in a tracked file.

---

## 2. Two board pointers that pointed at this very file (was `SYSTEM-FACTS.md` lines 1455–1457)

Stubs left behind on the board by the 2026-09-08 hygiene move, which then travelled into `SYSTEM-FACTS.md` with the
2026-09-09 move — so they pointed at the file they were sitting in. The rules they point to are present, in full, in
`SYSTEM-FACTS.md`.

### 🚦 DEPLOY RULES (standing) → **MOVED VERBATIM to `SYSTEM-FACTS.md` (board hygiene 09-08). Read it there before any deploy.**

### 🔴 MIGRATION CHECK — before every single deploy → **MOVED VERBATIM to `SYSTEM-FACTS.md` (board hygiene 09-08). Read it there before any deploy.**
