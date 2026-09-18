# Board — dte

> Single source of truth for CURRENT state. Update me at the end of every session
> (see PROTOCOL.md). **File discipline:** detail lives in the TASK/REQ file; a
> board cell is ONE line (status + date + owner + pointer); a log entry is ≤ 15
> lines. Never paste evidence or keep old text here.

## Project info

- Description: **DTE — "Develyst The Education"** (name settled by the owner
  2026-09-07; *"Disrupt Thai Education"* is superseded — see `SYSTEM-FACTS.md` A6),
  an online learning platform with a per-course **AI Teacher**. Live at
  `dte.develyst.online`. Product vision (Thai) is the owner's `DTE.md` in the
  repo — background, not a requirement.
- Code repository (single repo, **brownfield — production serves real users**):
  logical name **`dte`**, containing `back/` and `front/`. Absolute path only in
  the workspace-root `machine.local.md`.
- Stack: `back/` = **Bun + ElysiaJS + PostgreSQL, raw SQL, no ORM**
  (`back/db/schema.sql`) · `front/` = **Next.js 15 App Router + React 19 +
  Tailwind**. AI calls go through the **`develyst-ai`** gateway (a separate
  project). 🔴 The repo-root `README.md` is **stale** — `back/README.md` is the
  accurate one; see `SYSTEM-FACTS.md`.
- **`SYSTEM-FACTS.md`** — read it first, every session. Owner-stated facts and
  survey findings live there. Of the original Q1–Q4, **Q1/Q2/Q4 were answered
  2026-09-07**; **Q3 was answered 2026-09-07 too — "ลบ"** (§"…three re-asked questions"
  A7–A9). All of Q1–Q4 are now closed; the revenue model is settled at **2% of the GROSS sale
  price of paid courses, no course-opening fee, the platform absorbing the payment-gateway fee**
  (A9/A13/A14). Open items: "Blocked / waiting" below.
- As-built survey (read-only, gathered before the team existed):
  `../project-docs/as-built-survey-2026-09-06.md`. Source material, not a
  requirement — Porter still writes the first REQ from the owner's words.
- Team: Porter (PM) · Sober (SA Lead) · Jason (BE — `back/`) · Fern (FE —
  `front/`). **No QA role** — verification is engineer evidence plus the
  owner's eyes; see PROTOCOL.md "Evidence and the missing QA role".
- 🤖 Run mode: **DISPATCHER** (workspace-root `DISPATCHER.md`) — one session
  spawns the roles as subagents. Files remain the only channel; PROTOCOL
  unchanged. Dispatcher run log: `dispatcher-state.md` — last 5 runs; older runs
  rotated verbatim to `archive/dispatcher-state-2026-09-07.md` (2026-09-07).
- Branch: work happens on **`develop`**. Git writes and both workflow scripts
  are the human's alone.
- 🔴 Standing rule (owner, 2026-09-07 — "เลิกยุ่งกับการ commit หรือ git ของฉัน ทำงาน
  code กันไป"): **git is OUT OF THE TEAM'S SCOPE** — branches, commit hashes, what
  is merged/pushed/uncommitted, which branch production runs. Nobody asks about
  them, reports on them, or gates work on them; no Blocked row, no ⚠️, ever again.
  Unchanged: **no agent commits, pushes, merges, deploys or touches production**;
  work is handed off as edited files on `develop`. See `SYSTEM-FACTS.md` A23.
- 🔴 Standing rule: **no agent touches production or the production database —
  ever.** Not a deploy, not ssh, not `pm2`, not a GET. Real-world material
  arrives via DATA REQUEST into `../project-docs/`.
- 🧹 Standing rule (owner, 2026-09-07 — "housekeeping แก้ได้"): a **housekeeping
  hop MAY rewrite** `log/*.md` and `dispatcher-state.md`; append-only binds
  ordinary role sessions, not housekeeping. Every such edit stays marked inside
  the file it touched. Scope of a hop is `DISPATCHER.md`'s rule, not his — see
  `SYSTEM-FACTS.md` A18.

## Requirements

| ID | Title | Priority | Status | Owner of next step |
|----|-------|----------|--------|--------------------|
| REQ-001 | Frontend foundation — house folder pattern, component library, icons not emoji | HIGH | IN_SPEC — 2026-09-13, Porter · Phase 1 `/` PASSED (A47); Phase 2 `/courses` FAILED (A48) — reason 1 homed as **REQ-010** (§Q10 ANSWERED, closed); reason 2 "ไม่สวยพอ" awaits his specifics — see `requirements/REQ-001-frontend-pattern-and-ui-foundation.md` §Owner's-eyes gates | **Human (owner)** — reason-2 specifics; then Sober |
| REQ-002 | Course creation via the teacher-side AI training loop | (unset) | DRAFT — 2026-09-07, Porter · INTAKE only; **Q1 fully CLOSED** (2% of gross price, no opening fee, platform pays gateway); Q2–Q7 open — see `requirements/REQ-002-course-creation-ai-training-loop.md` §Open questions | **Human (owner)** |
| REQ-003 | Remove the inherited portfolio-site routes from the frontend | MEDIUM — after REQ-001 | **SPEC_DONE** — 2026-09-09, Porter · AC 7 (owner's eyes, Q4) OPEN, so NOT `DELIVERED`; **unanswered again 2026-09-13 (digest item B) — re-asked**; A46 stands — see `requirements/REQ-003-remove-inherited-portfolio-routes.md` §"Porter's acceptance check (2026-09-09)" | **Human (owner)** — answer Q4 |
| REQ-006 | Replace the leftover `DTE Platform` wording in the visible page copy | LOW | **SPEC_DONE** — 2026-09-09, Porter · AC 1–5 MET on evidence, **AC 6 (owner's eyes, Q1) OPEN** so NOT `DELIVERED`; **unanswered again 2026-09-13 (digest item C) — re-asked**; A46 stands — see `requirements/REQ-006-replace-dte-platform-body-copy.md` §"Porter's acceptance check (2026-09-09)" | **Human (owner)** — answer Q1 |
| REQ-007 | Remove the dead `/forgot-password` link from `/login` (he chose "ตัดลิงก์ทิ้ง", A45 — no flow is built) | LOW — Porter's call, unstated by him | **SPEC_DONE** — 2026-09-13, Porter · acceptance check done: AC 1–2 MET on evidence (login vs real API UNVERIFIED, mocked), **AC 3 (owner's eyes) OPEN → asked as §Q1** — see `requirements/REQ-007-remove-dead-forgot-password-link.md` §"Porter's acceptance check (2026-09-13)" | **Human (owner)** — answer REQ-007 §Q1 (AC 3, his eyes) |
| REQ-008 | `/about` — DTE About copy authored by the team + emoji removed (he delegated it: "คิดเองและทำได้เลย… เอาอิโมจิออกด้วย", A49) | LOW — Porter's call | **SPEC_DONE** — 2026-09-13, Porter · acceptance check done: AC 1–4 MET on evidence + Porter's §Copy read (nothing flagged), **AC 5 (owner's eyes + corrections) OPEN → asked as §Q1** with the numbers-dropped / new-sentence / `เรียน|รู้` wrap disclosures — see `requirements/REQ-008-about-page-copy-and-emoji.md` §"Porter's acceptance check (2026-09-13)" | **Human (owner)** — answer REQ-008 §Q1 (AC 5, his eyes + corrections) |
| REQ-009 | `/login` — tell an unverified user the truth + offer the resend ("บอกตามจริง", A50; born from REQ-001 §Q9) | MEDIUM — Porter's call | **SPEC_DONE** — 2026-09-13, Porter · acceptance check done: AC 1–4 MET on evidence (real local stack), **AC 5 (owner's eyes) OPEN → asked as §Q1 G1** with the backend findings disclosed (G2 no email is ever sent — run-confirmed; G3 verify link cannot verify; G4 `password_hash` leaks; G5 strings) — see `requirements/REQ-009-login-tell-unverified-user-the-truth.md` §"Porter's acceptance check (2026-09-13)" | **Human (owner)** — answer REQ-009 §Q1 G1–G5 |
| REQ-010 | `/courses` — make the category filter actually filter (A48 reason 1; never worked, pre-existing — REQ-001 §Q10) | HIGH — Porter's call | **DRAFT — BLOCKED** — 2026-09-13, Porter · needs 3 owner facts (what a pill does / home `?category=` cards / grid heading) asked in Thai as §Questions Q1–Q3; `READY_FOR_SA` when answered — see `requirements/REQ-010-courses-category-filter.md` | **Human (owner)** — Q1–Q3 |

> Swept 2026-09-09 (housekeeping): **REQ-004 `DELIVERED`** moved byte-verbatim to
> `archive/board-closed.md`. Closed rows leave the live board; their detail never lived here.
>
> Swept 2026-09-09 (second housekeeping hop): **REQ-005 `DELIVERED`** moved byte-verbatim to
> the same file. Its acceptance check stays in `requirements/REQ-005-unify-page-titles-site-wide.md`.

## Tasks

| ID | Title | Source | Status | Assignee | Depends on |
|----|-------|--------|--------|----------|------------|
| TASK-021 | `.btn-primary` resting **and** hover onto the theme-scoped accent — `themes.css` only, no screen file | SPEC-006 §R-COLOUR-7 | **DONE** — reviewed 2026-09-09, Sober · 6 DoD re-run by me; Q1+Q2 answered — see `tasks/TASK-021-btn-primary-theme-scoped-accent.md` §Review | FE (Fern) | none |
| TASK-022 | Remove the `/forgot-password` link from `LoginContent.tsx` — 3-line deletion, nothing else | SPEC-007 | **DONE** — reviewed 2026-09-13, Sober · DoD 3 re-run by me, geometry measured equal, DoD 7 UNVERIFIED vs real backend (carried) — see `tasks/TASK-022-remove-forgot-password-link.md` §Review | FE (Fern) | none |
| TASK-023 | `/about` — paste SPEC-008 copy, 18 emoji → 10 lucide icons + 8 deleted, drop the numbers block — `app/about/page.tsx` only | SPEC-008 | **DONE** — reviewed 2026-09-13, Sober · DoD 3/4/5 re-run by me; Q2 ruled (passes on `main`, DoD wording was mine); Q1 wrap carried to Porter as SPEC-008 §Q3, not fixed — see `tasks/TASK-023-about-copy-and-emoji-to-icons.md` §Review | FE (Fern) | none |
| TASK-024 | `/login` — carry the 403 `requiresEmailVerification` answer through `api.ts` + `AuthContext`, show it with the existing resend button — 3 files, no `back/` | SPEC-009 | **DONE** — reviewed 2026-09-13, Sober · diff/greps/tsc re-run, evidence on a real throwaway stack, toast hypothesis confirmed — see `tasks/TASK-024-login-surface-unverified-and-resend.md` §Review | FE (Fern) | none |

> Numbering note: **TASK-004…010 stay reserved for SPEC-001's per-screen units**, so SPEC-002's
> tasks start at 011, SPEC-003's at 014, SPEC-004's at 015–017 and SPEC-005's at 018. Numbers are
> never reused (PROTOCOL.md §Artifact numbering).

> **Closed 2026-09-09:** the *"antd shared-chunk cost"* Blocked row is removed — TASK-019 measured it
> (**+40.55 kB gzip / +35.71 kB Brotli per route, uniform on all 9**) and **SPEC-001 §Decision 6 is
> CLOSED**: the provider **stays in the root layout**, the route-group split is **rejected**, with a
> two-condition re-open trigger written into the SPEC. Nothing reverts; TASK-004…010 are ungated.

> Swept 2026-09-09 (housekeeping): **TASK-001/002/003/011/012/013/014/015/016/017 — all `DONE`** —
> moved byte-verbatim to `archive/board-closed.md`. Their reviews stay in their own `tasks/` files.
>
> Swept 2026-09-09 (second housekeeping hop): **TASK-004/005/006/018/019/020 — all `DONE`** —
> moved byte-verbatim to the same file. Their reviews stay in their own `tasks/` files, which the
> open Blocked rows and REQ-001 §Owner's-eyes gates still point at.

## Blocked / waiting

| Item | Waiting on | Since | Note |
|------|-----------|-------|------|
| **SPEC-006 Phase 2 — `/courses` FAILED the owner's eyes** ("D=ไม่ผ่าน", A48) | **Human (owner)** — REQ-010 Q1–Q3 (reason 1) + reason-2 specifics | 2026-09-13 | **(1) filter never worked** — homed as **REQ-010** (DRAFT, blocked on his 3 answers); **(2) "ไม่สวยพอ"** — awaiting his specifics, nothing designed. Phase 3 stays gated on both |
| **REQ-007 AC 3** — the owner's own eyes on `/login` with the link gone | **Human (owner)** | 2026-09-13 | Asked as REQ-007 §Questions Q1; the only thing keeping REQ-007 out of `DELIVERED`. Login vs the real API is UNVERIFIED (mocked) — one real login on his side settles it. |
| **REQ-008 AC 5** — the owner's own eyes on `/about` + his promised corrections | **Human (owner)** | 2026-09-13 | Asked as REQ-008 §Questions Q1 with three disclosures (numbers block dropped, the one new sentence, the `เรียน|รู้` wrap). Corrections come back as a string-only follow-up via Sober. |
| **REQ-009 AC 5** — the owner's own eyes on the unverified-login path (banner + resend button) | **Human (owner)** | 2026-09-13 | Asked as REQ-009 §Questions Q1 **G1** (+ G5 strings). The only thing keeping REQ-009 out of `DELIVERED` besides G2 below — Porter will not call "sent" delivered while no email is sent. |
| **`back/` auth findings (SPEC-009 F1–F3, `SYSTEM-FACTS.md` A51/A52)** — no email is ever sent (run-confirmed); verify link cannot verify; `password_hash` returned to the browser (both code reads) | **Human (owner)** — REQ-009 §Q1 **G2** (a/b/c) · **G3** · **G4** | 2026-09-13 | Not REQ-009's to fix, not fixed. On his "yes" G3/G4 become their own BE REQs (REQ-011/012) the same hop — Porter's call, Sober asked. Porter recommends G4 first (security); his word decides. |
| Owner's own eyes — the **8** unified tabs (`/` `/about` `/courses` `/login` `/register` `/teach` `/verify-email` + `/classroom/<id>`) | **Human (owner)**, via Porter | 2026-09-09 | Non-blocking: REQ-005 is `DELIVERED` on evidence, but only an automated Chrome looked, `DELIVERED` ≠ deployed, and the classroom tab was never seen while authenticated — see REQ-005 §"Porter's acceptance check". |
| **`/courses/[id]` does not exist** — every course card and every AI-search result links to it | **Porter (PM)**, then the owner | 2026-09-09 | Sober's finding while writing TASK-006; **UNVERIFIED** (a code read, no `courses/[id]/page.tsx` exists — nobody opens the live site). Gates nothing: TASK-006 proceeds. A product decision (build the page, or change what a card does) — never SA's. See `tasks/TASK-006-…md` §Findings 1. |
| The API port `4013` — needs a REQ | **Porter (PM)**, then Sober | 2026-09-07 | ANSWERED "ทั้งคู่" = prod AND local; all 4 places in the repo are wrong. Porter writes the REQ next session. See `SYSTEM-FACTS.md` A7. |
| REQ-002 scoping | **Human (owner)** | 2026-09-06 | Q1 closed 2026-09-07; **Q2–Q7 still open** — see REQ-002 §Open questions. |
| **REQ-003 AC 7** — the owner's own eyes on the removals (the 4 redirects, the Footer, `/verify-email`) | **Human (owner)** | 2026-09-09 | **ASKED 2026-09-09 as REQ-003 §Questions Q4; unanswered 2026-09-13 (item B), re-asked**; the only thing keeping REQ-003 out of `DELIVERED` — what he must look at, the AC 6 classroom gap and the live-site caveat are all in REQ-003 §Questions Q4 + §"Porter's acceptance check (2026-09-09)". |
| **REQ-006 AC 6** — the owner's own eyes on the shortened body copy | **Human (owner)** | 2026-09-09 | **ASKED 2026-09-09 as REQ-006 §Questions Q1; unanswered 2026-09-13 (item C), re-asked**; the only thing keeping REQ-006 out of `DELIVERED`. What he must look at (the 3-char `DTE` wordmark, `/about`, and `สอนกับ DTE` on `/teach` which nobody here can render) is all in REQ-006 §Questions Q1. |
| Owner's own eyes — the upgrade AND the folder moves | **Human (owner)**, via Porter | 2026-09-07 | `/teach` + `/classroom/[id]` (auth-guarded), below-the-fold everywhere, and routes other than `/` after the moves. No QA here; nobody claims these work until he looks. See TASK-001 §Review + TASK-002 §Review. |

> **Closed 2026-09-13 (the owner's A–F reply, `SYSTEM-FACTS.md` A47–A50):** three rows are removed. **(1)** *"Owner's eyes on SPEC-006 Phase 1 — `/`"* — **`A=ผ่าน`** (**A47**): the A43 gate is **MET**; the two UNVERIFIED stay written in REQ-001 §Owner's-eyes gates. **(2)** *"`/login` resend path is dead code"* — **`F=บอกตามจริง`** (**A50**) → its own **REQ-009** above, REQ-001 unwidened. **(3)** *"DATA REQUEST — the Thai copy for `/about`"* — **`E=คิดเองและทำได้เลย… เอาอิโมจิออกด้วย`** (**A49**): he delegated the copy to the team and wants the emoji gone → **REQ-008** above; A10's "not to be invented" is superseded for `/about`. **Not closed:** the Phase-2 row is replaced by a FAILED row (**A48**), and **B and C were not answered** — REQ-003 AC 7 and REQ-006 AC 6 stay open, re-asked.

> **Closed 2026-09-09:** the *"`.btn-primary` fails contrast site-wide"* row is removed — **TASK-021 is
> `DONE`** and SPEC-006 **§R-COLOUR-7 is CLOSED**. All four states are **measured** in real Chrome with a
> real pointer-hover: light **5.93** resting / **7.56** hover, dark **6.31** / **8.16**; dark resting is
> byte-identical to before. Two things did **not** close and are not reported as observed: the old light
> hover **≈1.15:1 stays computed-only, UNVERIFIED**, and the ~200 ms colour-in on every load is a
> pre-existing whole-site finding **parked** (TASK-021 §Q1/§Q2). The light-theme side effect Porter
> carries is unchanged — see `requirements/REQ-001-frontend-pattern-and-ui-foundation.md`
> §"Owner's-eyes gates".

> **Closed 2026-09-09 (third round of owner answers):** two rows are removed. **(1)** *"Which page is
> หน้าคอร์ส"* — **`Q1=ก`** (`SYSTEM-FACTS.md` **A44**): the course **LIST** page **`/courses`**, not a
> detail page, not both. SPEC-006 **Phase 2 = `/courses` only** and is unblocked; **how and when it is
> sequenced stays Sober's design call** — Porter proposed no mechanism. **(2)** *"`/login` links to
> `/forgot-password`"* — **`Q2=ตัดลิงก์ทิ้ง`** (**A45**): **remove the link, do not build the flow**, so
> there is no backend work. Exactly as REQ-001 §Q6 was framed, it becomes its **own** requirement —
> **REQ-007** above — and REQ-001 is not widened. The 404 itself stays **UNVERIFIED** (a code read).
> 🔴 **NOT closed by the same message:** his trailing **"ผ่าน" carried no label** while four pass/fail
> items were open (the `/` look, REQ-003 AC 7, REQ-006 AC 6, plus the `/about` copy which is not
> pass/fail at all). Porter did **not** assign it — see **A46**; all three gates stay open and were
> re-asked separately labelled.

> **Closed 2026-09-09 (Q7, the blocking one):** the *"How far ทำหน้าตาใหม่ให้ดีขึ้น goes"* row is
> removed — he answered **`Q7=ข`** (`SYSTEM-FACTS.md` **A43**): a **deliberate visual-improvement
> pass**, his stated criteria **ระยะห่าง (spacing) + สี (colour), โมเดิร์น (modern)**, and he
> **changed the first screen** — **home page first, courses page second, seen by him before the
> other screens copy the result**; `/login` was NOT taken as the first screen. Sequencing the seven
> SPEC-001 screens and every mechanism stay **Sober's** call; Porter proposed none. The one thing
> his sentence leaves open — *which* courses page — is the new non-blocking **Q8** row above.

> **Closed 2026-09-09 (the two half-answers, second round):** two rows are removed at once.
> **(1)** *"REQ-005 Part B — the shared page name for `/classroom/[id]`"* — he answered **`Q1=ก`**
> (`SYSTEM-FACTS.md` **A37**): the shared name is **`ห้องเรียน`**, one fixed name on every
> classroom, tab `ห้องเรียน | DTE — Develyst The Education`; the per-course title stays rejected.
> REQ-005 has nothing open with him. **(2)** *"REQ-006 — what the body copy changes TO"* — he
> answered **`Q2=ข`** (**A38**): the short **`DTE`**, plus **`ไม่ต้องเอาคอมเมนต์`** (**A39**)
> excluding the `src/services/api.ts:1` source comment, which keeps its wording. REQ-006 is
> `READY_FOR_SA`; its in-scope list is still enumerated from the code first, never from a count.

> **Closed 2026-09-08 (second round of owner answers):** three rows are removed at once.
> **(1)** *"REQ-005 — the exact separator/word order + what `/` reads"* — he answered **`Q1=ข`** and
> **`Q2=คงเดิม`** (`SYSTEM-FACTS.md` **A30/A31**): every route reads `<page name> | DTE — Develyst
> The Education` and `/` stays exactly `DTE — Develyst The Education`. REQ-005 is `READY_FOR_SA`.
> **(2)** *"Owner's own eyes — the renamed page titles (REQ-004 AC 5)"* — **`Q4=ผ่าน`** (**A33**):
> AC 5 is met and REQ-004 is `DELIVERED`. `DELIVERED` ≠ deployed; the live site is unchanged until
> he ships it. **(3)** Sober's SPEC-003 §Questions **Q1** (support contact after `/contact` is
> removed) — **`Q3=ไม่ต้อง`** (**A32**): he does not want one, **no new REQ**, and nobody re-raises
> it. Sober's **Q2** (2 stray `about/` files) is answered in the SPEC too: nothing deleted, no REQ,
> Porter carries it as housekeeping.

> **Closed 2026-09-08:** the *"`DTE Platform` suffix — unify or leave"* row is replaced by the REQ-005
> row above — the owner answered **"ให้เหมือนกันทั้งเว็บ"** = unify (`SYSTEM-FACTS.md` **A27**), which by the
> framing of the question makes it a **NEW REQ (REQ-005), never a widening of SPEC-002**. SPEC-002
> §Questions **Q5 is ANSWERED** and no TASK in it changes. In the same reply he declined to overturn the
> TASK-013 → Jason routing — **"โอเค"** (**A28**): an accepted one-off, `PROTOCOL.md` still unamended,
> no repo-root precedent.

> **Closed 2026-09-08:** the *"Who edits the repo-root `README.md` (TASK-013)"* row is removed —
> Porter answered SPEC-002 **Q4**: **TASK-013 goes to Jason (BE)**, a one-off for that one line.
> `PROTOCOL.md` is **not** amended and no repo-root precedent is created; the reasoning, and the
> fact that the owner was told so he can overturn it in one word, are in
> `requirements/REQ-004-product-name-rename-everywhere.md` §Questions.

> **Closed 2026-09-08:** the *"Owner-only rename occurrences + 2 copy questions"* row is removed —
> the owner answered all three on 2026-09-08 (`SYSTEM-FACTS.md` **A24–A26**) and takes the
> owner-only occurrences himself, so REQ-004 AC 6 is met and nothing on REQ-004 waits on him.

> **Closed 2026-09-07 by the owner's standing ruling (`SYSTEM-FACTS.md` A23):** the
> `origin/production`-vs-`develop` commit row is **struck and will not return** — git is
> outside the team's scope. Nothing that was waiting on it is waiting any more.
