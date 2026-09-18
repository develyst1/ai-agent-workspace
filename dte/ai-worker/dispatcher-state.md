# Dispatcher state — dte

> Written ONLY by the dispatcher (workspace-root `DISPATCHER.md`): one line per
> hop, a run header per run, and the digest that ended the run. Keep the last 5
> runs here; older runs go verbatim to `archive/` in a PM housekeeping hop.

_(no runs yet — desk opened 2026-09-06. First run starts when the owner gives
Porter a requirement, or says "ไปเลย".)_

## RUN 2026-09-09-f — N=4 — started from: ไปเลย
hop 1 | SA  | did: reviewed TASK-019 -> DONE (re-produced every number himself), closed SPEC-001 Decision 6 — antd provider STAYS in the root layout, route-group split rejected, with a two-condition re-open trigger | ball_to: SA | flags: 1 low-confidence (his judgement that Navbar/Footer will want antd later)
hop 2 | SA  | did: wrote TASK-004 (/login screen migration, SPEC-001's reference screen): partials split, ui/ wrappers + new ui/Checkbox, alert() -> antd message via a locally mounted App; found the no-emoji harness misses U+23F3 | ball_to: FE | flags: 2 low-confidence (unwired checkbox swap; App component={false} renders no wrapper — Fern must verify)
hop 3 | FE  | did: TASK-004 -> REVIEW: /login migrated to the house pattern — page 236 -> 16 lines, partial extracted, antd wrappers + new BaseCheckbox, all 5 emoji gone (incl. the U+23F3 the harness misses), 3 alert() -> antd message; light+dark verified in a real browser | ball_to: SA | flags: 1 low-confidence and it is visual — antd's metrics changed the screen's look
STOPPED hop 3/4 — condition 3 (low-confidence assumption, and it is a visual decision)
Digest sent (Thai): หน้าแรกที่หน้าตาเปลี่ยนจริงมาแล้ว — /login เป็น antd แล้ว. ปุ่มไล่สี sky->cyan กลายเป็นปุ่ม antd สีเดียว,
ช่องกรอก 50 -> 40 px. Sober ต้องตัดสินก่อนอีก 6 หน้าจะลอกตาม — owner ควรดูด้วยตาก่อน.

## RUN 2026-09-09-g — N=8 — started from: owner ruling (team decides the UI; requirement is emoji -> icons) + ไปเลย
hop 1 | PM  | did: recorded A41 — owner's ruling reads as "keep today's look; the only visible change is emoji -> icons", binding on all 7 SPEC-001 screens; raised the pre-existing /forgot-password 404 as REQ-001 Q6 | ball_to: SA | flags: 1 question (build the forgot-password flow or drop the link)
hop 2 | SA  | did: reviewed TASK-004 with A41 in hand -> REWORK confined to visual restoration; owned the defect (his TASK said to drop the classes that carried the look), found 6 changed controls not 3, wrote SPEC-001 Decision 7 (the ui/ wrapper's DEFAULT look IS today's look) | ball_to: FE | flags: 1 low-confidence (whether every legacy recipe is reproducible on an antd control)
hop 3 | PM  | did: struck A41 and wrote A42 with the owner's correction verbatim (re UI = make it BETTER, never revert to the legacy look), fixed REQ-001 Out of Scope, routed to Sober; asked Q7 (how far "better" goes) | ball_to: SA | flags: 1 question; dispatcher's premise was wrong — the visual restoration IS already in the code (TASK-004 R1-R7)
hop 4 | SA  | did: applied A42 — struck SPEC-001 Decision 7 -> new Decision 8 (wrapper default look HELD, "restore the old look" is dead), withdrew TASK-004's REWORK verdict, set TASK-004 BLOCKED on REQ-001 Q7 rather than guessing the owner's visual intent | ball_to: PM | flags: Q7 is now BLOCKING — its two answers need opposite edits to the same 4 files
STOPPED hop 4/8 — pipeline blocked on the owner (REQ-001 Q7); no role can advance SPEC-001 without it
Digest sent (Thai): Porter อ่าน "re UI" ผิด -> Sober สั่ง rework คืนหน้าตาเดิม -> Fern ทำไปแล้วจริงในโค้ด.
คำแก้ของ owner บันทึกเป็น A42 แล้ว, Decision 7 ถูกยกเลิก, REWORK ถูกถอน, โค้ดยังคาอยู่สถานะย้อนกลับ.
ต้องให้ owner ตอบ Q7 ว่า "ดีขึ้น" แค่ไหน ก่อนใครจะแตะไฟล์ได้ เพราะสองคำตอบต้องแก้ตรงข้ามกัน.

## RUN 2026-09-09-h — N=8 — started from: answer Q7 = (kho) — visual improvement pass, start with / then /courses, spacing + colour, modern
hop 1 | PM  | did: housekeeping — compacted 2 over-length board cells after moving the "Q7 is now BLOCKING" fact into REQ-001; gate PASS | ball_to: HUMAN | flags: none
hop 2 | PM  | did: recorded A43 — Q7 = (kho): deliberate visual pass, criteria are spacing + colour / modern, home page first then courses, owner reviews before the rest follow | ball_to: SA | flags: 1 non-blocking question (which page is "หน้าคอร์ส")
hop 3 | SA  | did: applied A43 — SPEC-001 Decision 9 re-sequences the screens (home first), new SPEC-006 turns the owner's 3 Thai words into 14 checkable rules with his eyes as the phase gate, TASK-004 -> DONE, TASK-005 (home screen) TODO for Fern | ball_to: FE | flags: 1 low-confidence (authoring the concrete visual rules is his call now)
hop 4 | FE  | did: TASK-005 -> REVIEW (first FE session was cut off by an infra error; this one reconciled its on-disk work line by line, changed no product code, ran all 9 DoD): home screen migrated + 14 SPEC-006 rules applied, 7 Heroicons -> lucide, 5 emoji -> icons | ball_to: SA | flags: found a real pre-existing defect (bg-theme-secondary/50 computes transparent) and 2 contrast regressions that follow from Sober's own rules; nobody has LOOKED at / below the fold
hop 5 | SA  | did: reviewed TASK-005 -> DONE (re-ran 5 of 9 DoD himself, plus 2 checks no DoD asked for), confirmed all 4 of Fern's questions were defects in his OWN spec text, wrote TASK-020 to fix them, and told Porter to hold the owner-preview gate shut until it lands | ball_to: FE | flags: 1 low-confidence (whether the quiet band step reads as deliberate — the owner's eyes settle it)
hop 6 | FE  | did: TASK-020 -> REVIEW: real band background, theme-scoped --color-primary-strong (light #0369A1 / dark #0EA5E9), badge on --text-inverse; all 4 contrast targets reproduced exactly (5.68/6.31/5.93/6.31) | ball_to: SA | flags: none
hop 7 | SA  | did: reviewed TASK-020 -> DONE (re-ran 7 of 10 DoD, recomputed all 4 contrast ratios, added a production-CSS-bundle check no DoD asked for) -> SPEC-006 Phase 1 COMPLETE, owner-preview gate OPEN | ball_to: PM | flags: 1 low-confidence (the animated orbs behind the page were never composited into the contrast measurement)
STOPPED hop 7/8 — Phase 1 complete: the run reached the owner-preview gate the owner himself set
Digest sent (Thai): หน้าแรกทำใหม่เสร็จแล้ว รอ owner เปิดดูก่อนจะทำหน้าคอร์สต่อ.
ค้าง: REQ-001 Q8 (หน้าคอร์สคือหน้าไหน), Q6 (/forgot-password), REQ-003 Q4, REQ-006 Q1, copy หน้า /about.

## RUN 2026-09-09-i — N=8 — started from: answers (Q1=courses list, Q2=drop the link, "ผ่าน")
hop 1 | PM  | did: recorded A44 (หน้าคอร์ส = /courses list) + A45 (drop the dead link) + A46, opened REQ-007, and REFUSED to attribute the unlabelled "ผ่าน" — re-asked the 3 pass/fail gates separately labelled | ball_to: SA | flags: 5 questions (A-E), 1 data request (/about copy)
hop 2 | SA  | did: wrote TASK-006 (/courses, SPEC-006 Phase 2) + 5 new look rulings with their measurements pushed into the DoD | ball_to: FE | flags: 2 low-confidence (predicted contrast ratios; dropping the 4-up grid) — and a big finding: /courses/[id] does not exist, so every course card links to a dead route
hop 3 | FE  | did: TASK-006 -> REVIEW: /courses extracted + full visual pass incl. card interior, 4 Heroicons -> lucide, 3 emoji + 2 arrow glyphs -> icons, Thai copy machine-checked 21/21, all 5 contrast ratios clear; the sticky filter bar had NO background before and now paints | ball_to: SA | flags: btn-primary measures 2.77:1 in light and already ships on / — themes.css is out of a screen TASK's scope, so Sober must rule
hop 4 | SA  | did: reviewed TASK-006 -> DONE no rework (re-ran 5 of 11 DoD, read the finished component line by line); ruled Fern's Q1 into new R-COLOUR-7 and found a worse one — .btn-primary:hover computes ~1.15:1 in light, i.e. the label vanishes on hover site-wide | ball_to: PM | flags: 2 low-confidence (sequencing the token fix before the owner's look-gate; keeping the full-width CTA)
hop 5 | SA  | did: wrote TASK-021 — .btn-primary resting + hover onto theme-scoped accents (themes.css only), with a :root default so the pre-hydration paint is not transparent, and a browser-measurement DoD | ball_to: FE | flags: 1 low-confidence (the 4 predicted ratios are arithmetic, not observation)
hop 6 | FE  | did: TASK-021 -> REVIEW: .btn-primary resting + hover moved onto theme-scoped tokens (themes.css only); all 4 predicted ratios now MEASURED in real Chrome with a real pointer (5.93 / 7.56 / 6.31 / 8.16), :root guard proven | ball_to: SA | flags: the in-app browser pane returned computed styles contradicting what the page painted — she discarded them and wrote a Playwright harness instead
hop 7 | PM  | did: housekeeping — compacted 4 over-length board cells (unhomed detail moved into REQ-001 first), swept 7 closed rows verbatim to archive (20.2KB -> 16.8KB), drained his inbox; gate PASS | ball_to: PM | flags: none
hop 8 | SA  | did: reviewed TASK-021 -> DONE (re-ran 6 of 10 DoD, recomputed all 4 ratios — his own TASK text had the rounding error, Fern was right), closed R-COLOUR-7; declares / and /courses ready for the owner's eyes | ball_to: PM | flags: 1 low-confidence (the old ~1.15:1 hover stays computed-not-observed)
STOPPED hop 8/8 — condition 5 (hop budget reached)
Digest sent (Thai): สองหน้าพร้อมให้ owner ดูแล้ว — / และ /courses. ปุ่มหลักธีมสว่างเข้มขึ้นทุกหน้าโดยตั้งใจ (ธีมมืดไม่ขยับ).
เตือนก่อนกด: /courses/[id] ไม่มีอยู่จริง คลิกการ์ดคอร์สแล้ว 404.

## RUN 2026-09-13-a — N=8 — started from: answers (A pass / D fail: filter dead + not pretty / E team writes /about copy + de-emoji / F tell the truth)
hop 1 | PM  | did: recorded A47-A50 (/ passed; /courses failed — filter dead + not pretty; team may write /about copy itself; login must tell unverified users the truth), opened REQ-008 + REQ-009 READY_FOR_SA, closed REQ-001 Q9 | ball_to: SA | flags: 4 questions (B, C, D1, D2), 1 low-confidence
hop 2 | SA  | did: diagnosed the /courses filter — inert by construction (14 <button>s with no onClick, server component, active pill hard-coded), pre-existing; wiring it is new scope -> REQ-001 Q10 for Porter | ball_to: PM | flags: 1 low-confidence; questions for the owner (what a pill does, pre-filtered landing, heading copy)
hop 3 | SA  | did: REQ-007 -> IN_SPEC: SPEC-007 + TASK-022 (3-line deletion of the dead /forgot-password link, found at its real home in partials/Login/LoginContent.tsx) | ball_to: FE | flags: 1 low-confidence (row geometry unchanged — measured in DoD, not asserted)
hop 4 | SA  | did: REQ-008 -> IN_SPEC: SPEC-008 drafts the /about copy verbatim (25 rows sourced to DTE.md), emoji -> lucide map, unsourced numbers block dropped; TASK-023 TODO for Fern behind TASK-022 | ball_to: FE | flags: 1 low-confidence (dropping the unsourced numbers is a copy judgement — flagged to Porter)
hop 5 | FE  | did: TASK-022 -> REVIEW: 3-line deletion of the dead /forgot-password link, geometry byte-identical before/after in both themes, screenshots saved for the owner | ball_to: SA | flags: none
hop 6 | FE  | did: TASK-023 -> REVIEW: /about copy pasted verbatim from SPEC-008, 10 emoji -> lucide, 8 emoji deleted, unsourced numbers section removed; emoji baseline 110 -> 93 | ball_to: SA | flags: none; the Thai hero sentence wraps mid-word at 1280px (Chrome line-breaking, observation for the owner)
hop 7 | SA  | did: reviewed TASK-022 + TASK-023 -> both DONE; REQ-007 + REQ-008 -> SPEC_DONE; ruled the (c) is not an emoji (his own DoD wording), carried the mid-word Thai wrap to the owner's eye | ball_to: PM | flags: none
hop 8 | PM  | did: homed the never-worked /courses filter as REQ-010 (DRAFT, 3 owner facts needed), acceptance checks for REQ-007 + REQ-008 (both held at SPEC_DONE for the owner's eyes) | ball_to: HUMAN | flags: 7 questions, 2 low-confidence
STOPPED hop 8/8 — condition 5 (hop budget reached)
Digest sent (Thai): / ผ่านแล้ว. /about เขียนใหม่เสร็จรอ owner ดู. ลิงก์ลืมรหัสผ่านตัดแล้ว. filter /courses ไม่เคยทำงานเลย -> REQ-010 รอ 3 ข้อจาก owner.
ค้าง: REQ-007/008 ผ่านไหม, REQ-010 Q1-Q3, "ไม่สวยพอ" ตรงไหน, REQ-003 + REQ-006 ยังไม่ตอบ.

## RUN 2026-09-13-b — N=8 — started from: N=8 (bare, treated as ไปเลย)
hop 1 | SA  | did: REQ-009 -> IN_SPEC (FE-only: back/ already returns 403 + requiresEmailVerification, the frontend discards it twice); SPEC-009 + TASK-024 for Fern | ball_to: FE | flags: 4 questions for the owner via Porter — 3 are backend defects found by reading: no mailer at all, password_hash returned in login/profile responses, /verify-email can never verify anyone (toCamelCase is not a postgres@3.4.9 export)
hop 2 | FE  | did: TASK-024 -> REVIEW: login now surfaces the backend's 403 unverified answer with a working resend; verified on a REAL local back/ against her own throwaway Postgres cluster (torn down after) | ball_to: SA | flags: none
hop 3 | SA  | did: reviewed TASK-024 -> DONE (re-ran diff/grep/tsc, real-stack evidence accepted), REQ-009 -> SPEC_DONE; F1 now RUN-confirmed: no email is ever sent, so the resend's "sent" message is a live untruth | ball_to: PM | flags: none
hop 4 | PM  | did: REQ-009 acceptance — AC 1-4 MET, held at SPEC_DONE because the resend toast says "sent" while no email is ever sent; recorded A51/A52 (not owner-stated); wrote the full owner digest G1-G5 | ball_to: HUMAN | flags: 10 questions, 1 data request
STOPPED hop 4/8 — conditions 1 + 2 + 7 (pipeline blocked on the owner; every role's queue is empty)
Digest sent (Thai): งานทั้งหมดที่ทำได้โดยไม่ต้องรอ owner หมดแล้ว. เรื่องแรง: password_hash ถูกส่งถึง browser, /verify-email ยืนยันใครไม่ได้, ไม่มีระบบส่งเมล.
