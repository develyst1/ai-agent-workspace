# REQ-042: LINE on the UAT environment — changing role must switch the rich menu (post-move regression report)
- Status: READY_FOR_SA
- Priority: HIGH
- Requested: 2026-08-16 by stakeholder (owner)
- Deadline: none stated — but it blocks LINE usage on UAT, so treat as the current top LINE item.
- Source: owner report, 2026-08-16, after moving the test environment from `sid` to **UAT**.

## Problem / Goal
LINE worked before the move ("ตอนแรก ก่อนย้ายมา site uat มันยังใช้งานได้อยู่เลย"). **After moving the
testing environment from `sid` to UAT**, the owner's own LINE account is stuck: he is linked as a
**teacher** (2-button menu), typed `สมัคร`, chose **ผู้ปกครอง (parent)** — and **the rich menu never
changed** to the parent menu. He remembers it should switch.

Business goal: on UAT, a LINE user who changes their role must end up with the menu of that role, and
the OA must work there exactly as it did on `sid` — so the owner can keep testing LINE (Scripts 4+5)
without going back to the old server.

## What the owner observed (verbatim intent, not a diagnosis)
1. Linked as **ครู (teacher)** → rich menu shows **2 buttons**.
2. Typed `สมัคร` → chose **ผู้ปกครอง** → the linking did not visibly complete and **the menu stayed the
   teacher menu**.
3. Owner's own question, routed to SA as a technical call (NOT a decision Porter makes):
   **"after the sid → UAT move, does someone have to run `bun run line:publish-menus`? Is that related?"**

## Requirement
1. On UAT, a linked user who completes a role change (`สมัคร` → pick the other role → finish the
   linking steps) **must be switched to that role's rich menu**, in the same LINE chat, without
   unfriending/re-adding the OA.
2. After the change the user must hold **exactly one** active role link (no parent+teacher at once).
3. The environment move must not silently leave the LINE OA half-configured: SA states, as **exact
   operator steps the owner runs himself**, what an environment move requires (e.g. whether the rich
   menus must be re-published, whether the OA webhook must be re-pointed at UAT, what must be verified
   afterwards, and in what order).
4. The team must be able to tell **whether the UAT build even contains the role-change fix** — see
   "Known prior art" below — before anyone re-investigates it as a new bug.

## Known prior art (board/log facts — SA to confirm they still apply, do not assume)
- **TASK-046** (source SPEC-012, REQ-015 defect) is **DONE and Sober-verified 2026-07-30** and fixes
  exactly this repro: an already-linked user could never finish `สมัคร` because the "already-linked
  routing" branch ran before the `CHOOSE_ROLE` / `AWAIT_CODE` branches — the reply came back as the
  *other* role's menu. It also makes a role change **move** the link instead of accumulating both.
  **`PROJECT-STATUS.md` (2026-08-11) still lists TASK-046/047 as awaiting a deploy + repro re-check** —
  so the running UAT build may simply predate the fix.
- **The last time LINE "went dead" the root cause was environmental, not code** (2026-07-30): the LINE
  **webhook pointed at a different/stale server** than the one being deployed to; re-pointing it fixed
  everything with no code change. The board explicitly records this.
- **Teacher menu = 2 cells by design** (my schedule · language/help); parent menu = 6 cells (check-in ·
  leave · my children · register/add-child · language · help). So "ครูมีแค่ 2 ปุ่ม" is expected — the
  defect is only that it never becomes the **6-cell parent menu** after the role change.
- `bun run line:publish-menus` (TASK-040) exists and is re-runnable. **Whether it must be re-run for
  UAT is SA's call**, not Porter's.

## Acceptance Criteria
- [ ] **AC-1 (the reported repro)** — **Given** a LINE user linked as **teacher** on UAT (2-button menu),
      **When** they type `สมัคร`, choose **ผู้ปกครอง**, and complete the linking steps the bot asks for,
      **Then** the bot confirms the link **and their rich menu becomes the 6-button parent menu** in the
      same chat, without unfriending/re-adding the OA.
- [ ] **AC-2 (one role only)** — **Given** the role change in AC-1 succeeded, **When** the user opens the
      bot again, **Then** they see only the parent surface/menu and the previous teacher link is gone
      (no dual-linked user).
- [ ] **AC-3 (reverse direction)** — **Given** a user linked as **parent**, **When** they run `สมัคร` and
      choose **ครู** and complete it, **Then** they get the 2-button teacher menu (same rule, both ways).
- [ ] **AC-4 (negative path)** — **Given** the user is mid-`สมัคร`, **When** they enter a wrong/unknown
      code-nickname-phone, **Then** the bot says so in a clear message (owner-approved wording below),
      the **menu does not change**, and the user can retry or type `สมัคร` again from scratch.
- [ ] **AC-5 (environment works at all on UAT)** — **Given** the UAT deployment, **When** a user taps any
      rich-menu button, **Then** the bot replies (no dead taps) — i.e. the OA on UAT is fully wired, and
      the exact operator steps that made it so are written down in the SPEC/TASK so the next move repeats
      them.
- [ ] **AC-6 (regression — what must keep working)** — teacher "ตารางของฉัน", the TH/EN language toggle
      (both directions, persists), typed keyword fallbacks, and the check-in link flow all still work on
      UAT exactly as accepted on 2026-07-30.

## User-facing wording (Porter as UX writer)
Only if a new/changed message is needed for the failed-link path in AC-4 — reuse the bot's existing
wording where one already exists; if a new string is required, use:
- TH: `ไม่พบข้อมูลที่ตรงกันค่ะ ลองพิมพ์ใหม่อีกครั้ง หรือพิมพ์ "สมัคร" เพื่อเริ่มใหม่`
- EN: `We couldn't find a match. Please try again, or type "register" to start over.`
Any other new user-facing text in this REQ comes back to Porter before it ships.

## Constraints
- **UAT is a real deployed environment.** Nobody on the team touches it, redeploys it, re-points the
  webhook, or runs commands on it — the **owner runs every operator step himself**. The team supplies
  copy-paste-ready steps and reads the results the owner returns.
- No new tables/migrations for the role-change behaviour (TASK-046 already established that).
- The LINE channel credentials / webhook URL / server access are the owner's; they never go into a
  tracked file, a log entry, or pasted output.

## Out of Scope
- A dedicated "unlink / change role" **command or button** (still the separate product decision noted in
  the board's Blocked list).
- Anything about the customer-production OA — this REQ is about UAT.
- Re-doing the REQ-015 acceptance round (rich-menu taps, bilingual replies) — those are `DELIVERED`;
  only the regression check in AC-6 is required here.

## Questions
(SA asks here; Porter answers `> answer: ...`. Owner-facing questions are being asked in Thai in chat.)
- **Q1 (to owner, asked 2026-08-16):** Is UAT using the **same LINE OA channel** as `sid`, or a
  **different OA / different channel token**? (Determines whether menus and per-user menu links carry
  over at all.)
  > answer (owner, 2026-08-16): **this OA is the one UAT uses.** The STEP-1 inspect output therefore
  > describes UAT's own OA — the 4 menus (×2) on it are UAT's.
- **Q2 (to owner, asked 2026-08-16):** Where does the LINE **webhook URL** point right now — the UAT
  server or still `sid`? Is `sid` still running?
  > answer (owner, 2026-08-16): the webhook points at **`frontoffice.develyst.online`**, and
  > **that host IS the UAT server**. ⇒ Cause C (stale webhook) is **ruled out**.
  > 🔴 **Naming correction with real consequences — Porter is escalating this separately:** every
  > workspace artifact to date calls `frontoffice.develyst.online` **"customer-prod"** (board
  > ENVIRONMENTS, `PROJECT-STATUS.md`, the 2026-08-11 deploy log). The owner's model is: there are
  > **two servers only — `sid` and UAT — and UAT = `frontoffice.develyst.online`.** So "UAT" and what
  > the team has been calling "customer-production" are **the same box**. Nothing about the box changed;
  > only our label was wrong. Every "prod vs UAT" sentence in the artifacts must be re-read with that in
  > mind, including the deferred `pg_hba`/QA-residue housekeeping items.
- **Q3 (to owner, asked 2026-08-16):** Which **build** is on UAT — is it the same code that went to
  customer-prod on 2026-08-11, or an older copy? (Tells us whether TASK-046 is even in it.)
  > answer (owner, 2026-08-16): there is only **one** build there — and since UAT is the same host that
  > received the 2026-08-11 deploy, that build **contains TASK-046**. ⇒ Cause D (old build) is
  > **ruled out**.
- **Q5 — where STEP 1 actually ran (Porter's own doubt, answered):**
  > answer (owner, 2026-08-16): he **added his IP on the server** so his machine can reach UAT's DB, and
  > the shell that produced the STEP-1 output **was pointed at UAT's database**. ⇒ the `(none stored)`
  > result is a **real fact about UAT**, not an artifact of a local `.env`. **Cause B CONFIRMED.**
  > ⚠️ Follow-up owned by Porter: that whitelist line is a temporary remote opening on the same host the
  > customer's trial users are served from — it must be **closed and verified closed** when the LINE work
  > is done (same discipline as the 2026-08-11 temp-open, which the board still lists as unclosed).
- **Q4 (to SA):** Given Q1–Q3, what is the **exact ordered operator list** the owner must run on UAT
  (including whether `bun run line:publish-menus` is required, and any read-only `line:inspect-menus`
  check to prove the state before/after)?
