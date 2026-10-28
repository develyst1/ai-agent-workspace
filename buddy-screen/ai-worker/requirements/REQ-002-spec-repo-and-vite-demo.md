# REQ-002: Publish the full V1 requirement to buddy-screen-spec + a Vite mock demo
- Status: DELIVERED (2026-10-28 21:50, PM — after QA TEST_PASSED round 2, `tests/TEST-001-spec-repo-and-vite-demo.md`; NOT_TESTED: Friend control in the simulator, "no overtime" outcome screen, consent→registration order, real git clone. Not committed — owner's word needed)
- Priority: HIGH
- Requested: 2026-10-28 by the owner (via Atom, 19:57)
- Deadline: none
- Source REQ: REQ-001 · decisions: `DECISIONS.md` 2026-10-28 (all lines) · full requirement: `../project-docs/requirements-v1.md`
- 🔴 Children's data: synthetic only — PROTOCOL § Hard boundaries.

## Problem / Goal
The owner wants to **see** V1 before the real product is built, and wants the requirement in his own repo in a
form any AI can pick up alone. Owner's words (via Atom): *"(1) buddy-screen-spec: full requirement md that an AI
can understand on its own, (2) a Vite mock UI / frontend demo (TV screen, parent LINE/LIFF screens) plus
requirement diagrams … Do not commit/push without my word."* `[operator 2026-10-28 19:57]`

## Requirement
1. `buddy-screen-spec` holds the complete V1 requirement — the content of `project-docs/requirements-v1.md`,
   written by the PM — so that a reader with no other context understands the product. The read-only rule on
   that repo is lifted **for this work only** (`DECISIONS.md` 2026-10-28 19:58, last line). `[PM-interpreted]`
2. It also holds requirement diagrams: system context · engagement states (active / idle-present /
   idle-absent / sleep) · the overtime / borrowing flow · where children's data goes (§10 of the requirement).
3. A clickable **Vite mock demo** shows every V1 screen with invented data: the TV screens and the parent's LINE
   chat + LIFF pages. It is a demo of the requirement, **not the product** (the product stays Next.js, D3).
4. Nothing calls a real AI, LINE, payment provider or server. Nothing is committed or pushed.

## Acceptance Criteria `[PM-decided 2026-10-28]`
- [ ] AC-1 — **Given** a fresh clone of `buddy-screen-spec` **When** a reader opens it **Then** a requirement md there matches `project-docs/requirements-v1.md` §1–§16 in content (same rules, numbers, tags), and the README points to it. *Check: QA compares section by section.*
- [ ] AC-2 — **Then** the 4 diagrams of Requirement 2 exist and render (e.g. Mermaid in md), and each state/number in them matches the requirement (10 s, 20 s, 3 h, Sunday, 12.50 THB). *Check: QA opens each diagram.*
- [ ] AC-3 — **Given** the demo **When** someone runs the one documented command on this machine **Then** it opens in a browser with no errors. *Check: QA runs it.*
- [ ] AC-4 — TV screens present and reachable: first-use AI naming (with example names) · face + gesture registration (placeholder, no real camera needed) · sleep screen · name call → *"เรียกฉันรึเปล่า"* · invitation to each of the 4 activities · activity in progress with counted time · off-task prompt · going to sleep. *Check: QA clicks through each.*
- [ ] AC-5 — Parent screens present and reachable: LINE overtime message with **อนุมัติ / ไม่อนุมัติ** · borrowed-time message · LIFF consent · quota + daily limit + overtime setting · session timeline · goals (topics from §12) · report choice daily/weekly · gift choice (big / small / none, carry-over shown) · rename (99 THB) · Friend consent + delete. *Check: QA clicks through each.*
- [ ] AC-6 — **Given** a simulation control on the TV demo **When** the tester marks the Buddy silent for 10 s **Then** the state shows idle and the counter keeps counting; after 20 s more → sleep and counting stops; when the Buddy is marked out of frame → counting stops from the first second. *Check: QA runs the three cases with a stopwatch.*
- [ ] AC-7 — Every Thai string in requirement §13 appears exactly as written on its screen. *Check: QA compares text.*
- [ ] AC-8 — Unhappy paths shown: parent declines overtime → session ends; Sunday allowance used up → only paid extension offered; quota zero → AI explains kindly and sleeps. *Check: QA clicks through.*
- [ ] AC-9 — regression: no network request leaves the browser during the demo (devtools Network tab) · no real child data or photo anywhere · `git status` shows no commit made in any repo · `buddy-screen-front` has no product code changed unless the SA documents why. *Check: QA reads the Network tab + `git log`.*

## User-facing wording
All TH strings: `project-docs/requirements-v1.md` §13. Anything the FE needs that is not there → `## Questions`
here; the FE never invents user-facing words.

## Constraints
- No commit / push (owner's word needed). No paid API, no real LINE/payment. Synthetic data only.
- Where the demo lives (spec repo or elsewhere) is the SA's call; say it in the SPEC.

## Out of Scope
- The real product (Next.js), backend, AI, speech, payments, LINE OA.
- Pixel-perfect design — the owner approves design later (designer hat = FE, approval = owner).

## Questions
(the SA and the QA ask here; the PM answers as `> answer: …`)

- **Q-A (SA, 2026-10-28) — screen titles and button labels.** This does not block; the FE starts now with the default. §13 (17 rows) covers the sentences, but the demo also needs small labels that are not in §13: screen titles ("ตั้งค่าโควต้า"), button labels ("ยืนยัน", "ลบ", "ซื้อคืน"), field names (daily limit, report daily/weekly), and gift tiers. `Checked: DECISIONS.md 2026-10-28 all lines · requirements-v1.md §13 — labels not covered.` **Default:** the FE drafts them in Thai in one file (`buddy-screen-spec/demo/src/strings.ts`, `source: 'draft'`), each shown with a small **ร่าง** badge. The PM reviews that file after TASK-003 and replaces any draft; a replaced draft loses its badge. Correct the default only if it is wrong (e.g. "send me the list first").
  > answer (PM, 2026-10-28): default accepted — draft labels in one strings file with a ร่าง badge; the PM reviews and replaces them after TASK-003, before the PM hands REQ-002 to QA. `[PM-decided]`
  > **PM review of `demo/src/strings.ts`, 2026-10-28 20:40** (all 76 drafts + goal topics read). Replace these 11; **every other draft is approved as written** — all lose the ร่าง badge, so no badge remains. `[PM-decided, UX-writer hat]`
  >
  > | key | new Thai text |
  > |---|---|
  > | `screenSleep` | หน้าจอพัก |
  > | `screenOffTask` | ถามเมื่อออกนอกกิจกรรม |
  > | `screenLineOvertime` | LINE: ขอเล่นเกินเวลา |
  > | `approvedResult` | อนุมัติแล้ว น้องเล่นต่อได้ ค่าเวลาเพิ่มชั่วโมงละ 12.50 บาท คิดตามนาทีที่เล่นจริง |
  > | `declinedResult` | ไม่อนุมัติ วันนี้น้องจะหยุดเล่นแล้ว |
  > | `consentBody` | ฉันยินยอมให้ลงทะเบียนใบหน้าของลูก ระบบเก็บแค่ข้อมูลจำหน้า ไม่เก็บรูป และลบให้ 30 วันหลังเลิกใช้บริการ |
  > | `dispute` | ขอให้ตรวจสอบช่วงนี้ |
  > | `disputeSent` | ส่งให้ทีมตรวจสอบแล้ว |
  > | `giftSmall` | ของขวัญเล็ก (ทำได้ 70% ของเป้าขึ้นไป) ไม่เกิน 40% ของงบรอบนี้ |
  > | `giftNone` | รอบนี้ยังไม่มีของขวัญ (ต่ำกว่า 70% ของเป้า) งบยกไปรอบหน้า |
  > | `mockNotice` | เดโมจำลอง ข้อมูลสมมติทั้งหมด ไม่เปิดกล้องจริงและไม่ต่ออินเทอร์เน็ต |

- **Q-B (SA, 2026-10-28) — commit-message convention for `buddy-screen-spec`. This blocks the owner's `ขึ้น git` (21:49).** This decision is the owner's: DECISIONS 17:04 leaves the convention open, to be asked at the first `ขึ้น git`, and the `git-command` skill §3A forbids committing without one.
  `Checked: DECISIONS.md 17:04 (Open: commit-message convention) · CONVENTIONS.md § Git (empty) · repo: only "0e6e911 Initial commit", no CONTRIBUTING or commitlint — no convention.`
  **Nothing is committed until he answers.** Proposed pack (correct only the wrong line):
  1. Convention: `<type>: <summary> (REQ-<id>, TASK-<ids>)`. Types: `feat` · `fix` · `docs` · `chore`. English summary, ≤ 72 characters.
  2. This first commit is **one commit**: `docs: V1 requirement, diagrams and Vite mock demo (REQ-002, TASK-001..006)`.
  3. Files: `README.md`, `REQUIREMENTS-V1.md`, `diagrams/` (4 files) and `demo/` sources (44 files). `node_modules/` and `dist/` stay out (they are in `demo/.gitignore`). Nothing from the AI workspace goes in.
  4. Branch `main` (D7). Sync = `git fetch` → `git pull origin main` → `git push origin main` to `github.com/develyst1/buddy-screen-spec`. If the push is refused (e.g. auth), the SA reports the error and does not work around it.
  5. The commit message ends with an AI co-author line: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Say "no" and it is left out.
  6. Once agreed, the PM records the convention in `CONVENTIONS.md` § Git; later commits to `buddy-screen-front` use the same convention unless he says otherwise.
  > answer (Atom, owner delegate, 2026-10-28 21:53, relayed by the PM): "ตามนี้" — all 6 lines approved. Recorded: DECISIONS.md 2026-10-28 21:53 + CONVENTIONS.md § Git. Go: commit + sync now. `[Atom-decided, owner delegated 19:57]`

- **Q-C (SA, 2026-10-28 ~21:55) — commit author for `buddy-screen-spec`. This blocks `ขึ้น git`.** The commit failed: `Author identity unknown … fatal: unable to auto-detect email address`. Neither this machine nor the repo has a git user set. The 44 approved files are staged (index only); nothing is committed or pushed.
  `Checked: Q-B (author not covered) · DECISIONS (no git identity line) · the workspace repo's own .git/config = develyst <develyst1@hotmail.com> · the spec repo's initial commit author = D1 <develyst1@hotmail.com>.`
  **Default:**
  - Author `develyst <develyst1@hotmail.com>`, the identity this machine's workspace repo already uses.
  - It is passed on the command (`git -c user.name=… -c user.email=… commit`) only, and **no git config is written**.
  - It applies to every SA commit in the buddy-screen repos.

  Correct it if he wants the GitHub name `D1` or another identity.

## Defects to fix — round 2 (TEST-001 TEST_FAILED 2026-10-28) `[PM-routed, QA-found]`
Detail, repro and evidence: `tests/TEST-001-spec-repo-and-vite-demo.md` § Defects. The PM adds no fix; the SA decides how.
1. **DEF-1 (MAJOR)** — after the parent presses ไม่อนุมัติ, the TV must show the session ending with §13 *"วันนี้พอแค่นี้ก่อนนะ เก่งมากเลย"* (AC-7, AC-8).
2. **DEF-2 (MINOR)** — diagrams must show every decided rule: 02 — sleep → active start and "or the child says stop"; 03 — 3 h counted from the moment the LINE message is sent; 04 — names (server, while subscribed) and template retention (until deleted or 30 days after the subscription ends) (AC-2).
3. **DEF-3 (MINOR, in scope per PM 21:30)** — the borrowed message points to buy-back; the LIFF quota screen must have a buy-back control (12.50 THB/h, per minute) reachable from that message.
4. **DEF-4 (MINOR, per PM 21:30)** — no face emoji (🤔 😴 or any face) may stand for the AI on any screen (R-AI-1). Non-face icons are fine.
Regression: everything that passed in TEST-001 must still pass.

**PM review of TASK-005 draft labels, 2026-10-28** (`strings.ts` l.112–119, all 8 read). Replace 3; the other 5 are approved as written; no ร่าง badge remains. `[PM-decided, UX-writer hat]`

| key | new Thai text |
|---|---|
| `screenOvertimeDeclined` | ทีวี: หลังผู้ปกครองไม่อนุมัติ |
| `buyBackInfo` | ยืมเวลาวันอาทิตย์ไป {minutes} นาที · ชั่วโมงละ 12.50 บาท คิดตามนาทีจริง |
| `buyBackDone` | ซื้อคืนแล้ว เวลาวันอาทิตย์กลับมาครบ |
