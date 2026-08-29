# Parked from board.md — 2026-08-29 housekeeping

> Moved here VERBATIM during the 2026-08-29 board compaction (Marie housekeeping order, owner-approved).
> This is the QA verdict history and the open-items block that stood in `board.md` under "Project info".
> It belonged to no single REQ/TASK file, so it is parked here rather than deleted. The board carries a
> one-line pointer to it. The complete pre-compaction board is `board-2026-08-29-pre-compaction.md`.

## QA verdict history + open items, as they stood in board.md (Project info, lines 32-169)

  - **QA opened 2026-08-01.** `tests/REGRESSION.md` exists — but read its header:
    it is an **unverified baseline** seeded from this board's acceptance notes,
    **no line carries a QA verdict yet**. No REQ is `IN_TEST`; nothing has been
    routed to Tanya.
  - ✅ **2026-08-28 (Tanya) — REQ-071 (Drop) + REQ-072 (Confirm) `TEST_PASSED` (sid), write-verified + fixture retired.**
    **I owned a miss:** wrongly said "QA can't write on sid" and it cost the owner 3 features of writes — I DO write on
    sid (board 154-159). Ran the full lifecycle on a QA fixture: **REQ-072** confirm 4/4, **used_sessions unchanged**, one
    notification/course, translated skip reason; **REQ-071** drop (DROPPED, sessions off), resume (sessions return), 🎯
    **SLOT_TAKEN refuses — no double-book**, raw-key fix (Pause course/พักคอร์ส). Then **retired the fixture via cancel
    ADMIN_ERROR** (QA-residue problem solved). 🔴 **DEFECT → Fern:** stale Paused chip count ((0) vs DROPPED 1; chips
    sum 18 vs true 19). 🟡 **@Porter rulings:** `COURSE_DROPPED` session-write (resume-first vs "accepts writes"); outbox=1
    for a LINE-linked recipient (DATA REQUEST). `tests/TEST-060`.
  - ✅ **2026-08-25 (Tanya) — REQ-052+068 + REQ-036 B2/B3 `TEST_PASSED` (sid): rendered pass (375+1440).** First run caught
    a **stale FE (partial deploy)** — reported, owner **redeployed**, re-verified. Now: **four-status filter Active(9)/
    Completed(0)/Expired(0)/Cancelled(1) sums to 10**; Cancelled shows status+reason; 🎯 **leave-locked = Active + separate
    Locked chip (not a 5th status)**. Calendar cell carries **type (SVG icons, no emoji)** + a **Cell-display toggle that is
    display-only** (flipping keeps the same 9 bookings) 🎯. 🟡 minor: 375 badge truncation "AC…/LO…". `tests/TEST-059`.
  - ✅ **2026-08-25 (Tanya) — REQ-036 `TEST_PASSED` (sid): end-course-early verified (Part A + B).** Preview + reason-gate +
    item-5 UI ("already cancelled" / no Confirm) verified **read-only** by Tanya (never confirmed — zero footprint);
    items 2/3/4/7(ADMIN_ERROR)/8 signed on the **owner-measured before/after** (pending 5→0 · extended 1→0 = **no
    re-owe** · size 6→6 · used_sessions 0→0 · **bo.movement 26→26 no money** · end_reason ADMIN_ERROR). Preview said 6
    remaining = DB (pending 5+extended 1), then exactly those 6 → CANCELLED (soft-cancel, 20/Aug ON LEAVE preserved).
    **Part B — owner-verified live:** `เพิ่มคาบ(คิดเงิน)` on the ended course → **409 COURSE_ENDED, zero rows** (count
    held 8, refusal screenshot no new row); the stray 25/Aug EXTRA residue now **ยกเลิก** (sid consistent). ⇒ **REQ-036
    = TEST_PASSED on sid, feature complete.** Accepted risk: item-7 only ADMIN_ERROR round-tripped (other 2 = same path).
    **`uat` = owner's call (production off QA's hands).** `tests/TEST-058`.
  - ✅ **2026-08-23 (Tanya) — REQ-063 `TEST_PASSED` (sid): sale discount verified.** Screen/client by Tanya (item 1
    7,900→−790→7,110 · item 4 refuse-never-clamp/all-problems-at-once · item 5 rental 600/฿300/฿700 · **baht fix**
    391→−391 both surfaces · percent −790 · rendered "Discount: ฿391 · Reason" no raw key). Ledger **owner-attested**
    (his SELECT: course +7,900/−790, +5,790/−391, +7,900 undiscounted; single-session day-end +1,690/−391 — both
    posting moments). **Inferred, not run:** 1st-Trial / voucher / rental *ledger* rows (shared proven path). **AC-9
    untestable** (no non-admin user). Item 7 alignment = FAIL-as-expected (REQ-064). **The baht/satang defect Tanya found
    → fixed (TASK-168/169) → re-verified.** Scope sid-only; DELIVERED needs prod re-check. `tests/TEST-057`.
  - ✅ **2026-08-20 (Tanya) — REQ-046 + REQ-047 `TEST_PASSED` (sid): LINE advance-leave flow verified end to end.**
    Owner-taps / Tanya-verifies split. Bot side (owner's live taps): child-first step · session picker
    `time·teacher·program` · confirmation names child+session · refusal explains itself + carries the **configured**
    3h cut-off and the session's own time (REQ-047). My read-only DB half: right sessions `SICK_LEAVE` (separate rows),
    course make-up **+1 at tail / total unchanged / end 2026-10-01** (matches the bot), single session no-extend, quota
    moved (leaveUsed 1/6). μิลลิม "double leave" = **not a defect** (Porter explained via timestamps). **Scope:** sid-only
    (DELIVERED needs prod re-check); leave-**notification delivery** is NOT in this verdict → that's **REQ-049** (outbox
    was empty this run; AC-4 closed by TASK-152, notification-firing not yet re-verified). `tests/TEST-056-line-leave-flow-req046-req047.md`.
  - ✅ **2026-08-19 (Tanya) — sid six-REQ screen pass `TEST_PASSED` (UI acceptance, 375/768/1440), zero footprint.**
    On `som.develyst.online` only (minted cookie, no password typed; post-wipe people-only data). **PASS:**
    REQ-044 (New-booking modal = 3 tabs, COURSE gone) · REQ-043 (student picker every tab) · REQ-048 (voucher Time
    selectable) · REQ-049 (settings rows render) · REQ-054 (one course-level Program; teacher-swap resets it; plan
    preview = 6 sessions all one program, no per-session control) · REQ-053 (Edit-session: Date/Time/Teacher editable
    but **Subject read-only text + the exact explanation line**). REQ-053/054 verified via **plan preview (Generate
    plan = dry-run; never pressed Create/Save)** — **no course created, no footprint** (no course-delete exists
    anywhere, so creating one was deliberately avoided). Responsive: **no h-scroll at 375/768/1440**, tabs intact,
    nav collapses at 375; tap targets 30–36px = pre-existing minor, not a regression.
    ✅ **REQ-054 AC-2 (server negative) PASS** — live `POST /courses` refuses a mixed-program create with the exact
    rule text "ทุกคาบในคอร์สต้องเป็นกิจกรรมเดียวกัน", courses 0→0 (nothing persisted). 🔴 **REQ-053 AC-2 still
    NOT_TESTED** — its `PATCH /bookings/:id` guard needs a course session, but sid has **0 courses** and creating a
    fixture = unremovable residue on the import box. **@Porter Q1: authorize an isolated QA fixture (I run + owner
    scoped-deletes) or defer to real courses?** REQ-054 **AC-6** = Porter-deferred. 🟡 **DEF-5** → REQ-056 (Sober).
    Detail: `tests/TEST-055-sid-six-req-screen-pass.md`.
    **@Porter — Q1: is the screen pass enough to move these toward DELIVERED, or run the AC-2/AC-6 server-side tests too? Q2: DEF-5 scope? (TEST_PASSED is sid-only; DELIVERED still needs the customer-prod re-check.)**
  - ✅ **2026-08-11 (Tanya) — DEF-3 CLOSED on CUSTOMER-PROD; REQ-041 items 1–5, 7, 8 verified on the deployed build.**
    Human-authorized, **strictly read-only** (nothing created/changed/sent; TASK-090 guard untouched — access via the app's own
    login form). Read from the **deployed CSS**: `bg-content1/80` → `rgb(var(--color-surface) / .8)` ⇒ **`rgba(255,255,255,0.8)`**;
    `hover:bg-muted-100/60` → `rgb(var(--color-muted-100) / .6)`; `/50`, `/40`, `/80` all paint; plain `bg-muted-*` unchanged
    (value-preserving). **🎯 The app header backdrop is BACK** — the live `<header>` computes `rgba(255,255,255,0.8)`.
    In situ: header ✅ · Teachers (21 hover-tinted blocks) ✅ · Reports ✅ · PlanModal summary bar ✅ (one of the two that were
    *still colourless* in round 2). ⚠️ CalendarWeekGrid non-bookable cell **not seen in place** (no such cell this week) — covered by
    rule + synthetic, flagged rather than claimed. **No regression:** at 1440/768/375 — pinned 11 all sticky · 0 truncated · 0 clipped ·
    0 ISO dates (10 × `DD/MMM/YY`) · **20/20** `tabular-nums` · no h-scroll; **DEF-1 stays closed** (reachable, 44 px).
    **@Porter — gate met; DELIVERED is yours.** ⚠️ Corrected my own in-run false negative: `bg-muted-100/60` is only used as a
    `hover:` variant, so the bare class is never generated — the probe, not the product, was wrong (rule added to `REGRESSION.md`).
  - 🔴 **2026-08-11 (Tanya) — REQ-041 verification: TASK-129 `TEST_PASSED` · TASK-128 `TEST_FAILED` on DEF-3.**
    **Fixed & verified:** §3.5 all five greps = 0 · §3.3 ring instant (12 controls, 0 animated) · dates now `13/Aug/26` (iso=0) ·
    **20/20** cells `tabular-nums` · status chips carry icons (`aria-hidden`, label stays the a11y name) · Voucher Manage **44 px**
    at 375 · **the date FILTER still queries** (preset → 10 rows — the one place a formatter swap could have broken data) · the
    63f734d rework survives the token swap and **DEF-1 stays closed**.
    🔴 **DEF-3 (MAJOR) — the token migration silently disabled Tailwind's opacity modifier.** Before: literal hex
    (`content1:"#ffffff"`, `default-100:"#f1f5f9"`) ⇒ `/NN` composed. After: `var(--color-…)` ⇒ in Tailwind v3 the utility is
    **never generated**. Proved from the generated CSS: rules exist for `.bg-muted-50`/`.bg-muted-100`, **none** for
    `.bg-muted-50/40` · `/80` · `.bg-muted-100/60` · `/50` · `.bg-content1/80` — all paint `rgba(0,0,0,0)`. **6 sites:**
    `Header.tsx:27` (app header backdrop, was #fff@80%) · `TeachersContent.tsx:255,342` · `ReportsContent.tsx:155` — **4 visible
    regressions**; `PlanModal.tsx:269` + `CalendarWeekGrid.tsx:106` — **still colourless**, so 2 of the review's “six newly-defined
    sites” did NOT gain the predicted colour. Beyond these, the modifier is silently unavailable for every future use of the
    tokens. Fix shape: channel triplets + `<alpha-value>` — one config change closes all six. **REQ-041 not done.**
    ⚠️ Also corrected **my own** round-1 §3.3 FAIL: `transition-property: all` with `duration: 0s` animates nothing — the ring was
    always instant. ⚠️ Fern's work is **uncommitted** (36 modified files, HEAD `7f9456e`) — verdict covers the working tree.
  - 🎨 **2026-08-11 (Tanya) — FE REWORK RETEST (`front@dong`, `neeeeroooo`): functional `TEST_PASSED`, no regressions;
    hallmark verdict **`close, fix the minors`** (0 critical · 7 major · 2 minor).** Run locally on `dong`, mock mode — no server
    touched. **Verified, measured:** 11 `[data-pin]` cells all `position: sticky` at 375/768/960/1280 · **0 truncated badges** (the
    PEN… tell is gone) · 0 clipped cells and no page h-scroll · the edge shadow really is scroll-aware (`data-at-start/end` flip) ·
    PlanModal **1100 px** with **one** ⋯ control per row, opening on **Enter** (keyboard, not hover-only) · search/status-filter/plan
    modal all still work. 🎯 **DEF-1 is CLOSED** — the Voucher “Manage” button that was *unreachable* at 375 on 2026-08-04 is now
    hit-testable and reads as a filled button.
    🔴 **Still short of our own §3 DoD, and that's the point of the standard:** **§3.3 fails** (the focus-visible ring animates —
    `transition-property: all`) and **§3.5 fails** (“zero hits” for inline hex / `transition-all` is currently **4 + 4**).
    Other majors: **two colour systems in parallel** (Mantine + Tailwind `bg-default-*`, **26 files** — the standard's named “biggest
    sin”) · **no `tabular-nums`** (0/20 numeric cells) · **one-font page** (body + headings both Noto Sans Thai) · **two date formats**
    (plan table `DD/MMM/YY` vs bookings table ISO `2026-08-13`). Minors: status chip is hue+label with no shape · 30 px hit target at 375.
    Clean: card-in-card · side-stripe · 3-col grid · `hover:scale-105` · arbitrary `z-index` · hover-only affordances · invented metrics.
    **Ranked punch-list (input for the follow-up REQ) in `tests/TEST-DONG-fe-rework-retest-and-hallmark-audit.md`** — items 1–4 are cheap
    and clear both failing gates. ⚠️ Item 6 (type pairing) needs a **Thai-capable display face** — an owner design call, not a code fix.
  - ✅✅ **2026-08-11 (Tanya) — CUSTOMER-PROD RE-CHECK COMPLETE. The whole smoke set PASSES. No defects.**
    Human authorized QA **in-session**, then approved phase 2 and **waived cleanup** (reset to follow). Access via the app's own
    login form — **TASK-090 guard untouched**. On prod: **A/B/C ✅ (owner)** · **#2 ✅** (picker names each course:
    `Bike / Scooter / Balance Cruiser (0/4) · exp 2026-09-24` vs `Surfskate (0/4) · exp 2026-09-25`) · **#4 ✅** (class carried through
    API + bookings table + the voucher-shaped plan modal) · **#5 ✅** (post-wipe, 4 events, no raw i18n key) · **107/109/102 ✅** ·
    **REQ-030 ✅** (dry-run preview · move · absence keeps size 4→4 · insert · live-cancel re-owes · delivered refuses edit/move
    **409 SESSION_DELIVERED** and needs a reason **409 REASON_REQUIRED**) · **REQ-037 ✅** (SINGLE_SESSION, size/end untouched, cancel
    doesn't re-owe) · **OBS-3 ✅** (UI shows *“Your plan will become: 0 added · 1 removed · ends 17 Sep 26”* before commit; plan
    unchanged 9→9 while open) · **STANDING-RULE widths ✅** (closes TASK-124's last runtime item).
    ⚠️ **Teacher-change NOT run on prod** (ratified exclusion — dual LINE to 21 real teachers; covered by its `sid` pass).
    **Footprint left by agreement:** 1 parent + `QA-prod-student` · 2 courses · 1 voucher · 1 voucher booking (+ their sessions),
    enumerated in `../project-docs/qa-prod-2026-08-11/phase2-created.json`; owner re-runs the reset.
    🎯 **@Porter — the DELIVERED gate is MET** for REQ-038 #1–5 and REQ-030 / REQ-037 / OBS-3. Marking DELIVERED is yours.
    Detail: `tests/TEST-PROD-post-deploy-recheck.md`.
  - 🛑 **2026-08-11 (Tanya) — the customer-prod post-deploy smoke is NOT a QA run.** The 2026-08-11 deploy
    put the batch on **`frontoffice.develyst.online` = PRODUCTION**, and the smoke was routed to QA. I declined and
    made **no request of any kind** to that host: `QA.md` says production is never mine (*“not read, not write, not
    ‘just a GET’”*), the workspace rule says the same, and TASK-090's `mint-session.mjs` refuses that host by design
    (`PRODUCTION_HOSTS`) — **the guard was not worked around.** Instead: **`tests/CLICK-SCRIPTS-owner.md` Script 6**,
    a ~10-minute owner-run smoke (A: did the build land · B: #3 search + a width check an owner can do · C: #5 history ·
    D: #2/#4/107/109/102 · E: plan editor, marked as the data-writing part and skippable). **Every item is already
    `TEST_PASSED` on `sid` against the same build**, so this is the post-deploy re-check that DELIVERED needs — not new
    testing. **@Porter — hand Script 6 to the owner, or bring written authorization; I'll convert the ✅/❌ list same-day.**
  - ✅ **2026-08-04 (Tanya) — ACCESS RESTORED and USED.** The access file now lives at
    `C:\\Users\\Admin\\sm-test-access.txt`; TASK-090's `mint-session.mjs` works exactly as written
    (login → token → cookie → painted `sid` browser; **nothing written to disk, nothing printed**).
    Same-day result: **TASK-099 behaviour `TEST_PASSED`**, **REQ-024 + REQ-026 `TEST_PASSED`**,
    REQ-020/023 PARTIAL (the LINE halves need the owner's phone), REQ-022 a finding (see its row), and
    **REQ-009 `NOT TESTED` — it needs a teacher-roster WRITE authorization, not access.**
  - 🔴 **Open item for the human (×2), both blocking every non-unit test:**
    (1) dev-server URL + a **test staff account** + an **isolatable LINE test
    recipient**, in `../project-docs/`.
    (2) ~~**"local" is not local:**~~ **✅ ANSWERED 2026-08-04 by คุณฟีน (direct, in
    writing).** The remote Postgres host `154.197.124.206:5432` is **dev/staging
    with test data — NOT production.** Tanya may therefore run writes against it
    under the normal dev-server rules in `PROTOCOL.md` → "The Tester's
    environment": remove every record she creates, declare the footprint in the
    TEST file, never touch data she did not create, never restart/redeploy.
    Item (1) — dev-server URL, test staff account, isolatable LINE recipient —
    **is still open and still blocks LINE-touching tests.**
