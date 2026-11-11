# TASK-881 — FE: Pay-run re-run display (changed / removed auto lines + missing-rate warnings) + duplicate-month message (backoffice-front) — @Fern

**From @Sober, 2026-11-08. GO (owner's "ไม่ติดคนอื่น ให้ทำเลย").** Repo `smart-scheduler-backoffice-front`, branch `dong`, on your TASK-866 screens. **Git only on the owner's word.** This makes the demo pay-run honest about what a **re-run** does, now that link 3 (TASK-878) computes auto lines.

## Context (the BE behaviour you're surfacing)
`POST /salary/periods/:id/run` now (TASK-878) syncs auto lines: on a re-run it **updates** changed lines, **removes** vanished ones, keeps manual lines, and reports a result. A day with teaching minutes but **no FL rate** comes back in **`warnings`** (never paid at 0). The slip read already returns the current lines + `kindLabel`.

## Steps
1. **Re-run result on the pay-run screen:** after Run, show what changed — at minimum the current slip state is correct (no stale/orphaned lines rendered from before the re-run; the table reflects exactly the BE's current lines + totals). If the run response carries an `{inserted, updated, removed}` summary, surface it as a short notice ("อัปเดต 3 · ลบ 1"); if it doesn't, confirm with me and I'll have Jason add it. **No orphaned line** may persist in the UI after a re-run that removed it.
2. **Missing-rate warnings:** if the run/overview returns `warnings` (a coach-day with minutes but no FL rate), show them clearly to the CEO (e.g. a banner "ครู X: มีคาบวันที่ … แต่ยังไม่ได้ตั้งเรท") so a 0-pay day is never silent. If the shape isn't settled, ask me.
3. **Duplicate-month message (the TASK-866 follow-up):** confirm the UI renders a clear message on `409 PERIOD_EXISTS` when the CEO creates a month that exists — verify the artifact the CEO actually sees (your earlier test matched the wrong alert). Fix the assertion and/or the message.
4. **Auto-line labels:** the new auto lines carry `kindLabel` ("Freelance Hour", "Extra Hour", "OT", "Merit") and a per-date `label`; render them in the slip line list as the itemisation (R1.6).

## Done = (evidence in `## Implementation Notes`)
- `tsc` 0 · `next build` 0 · headless proof against the stub (or the real-BE harness as in your integration): a re-run that changes/removes a line leaves **no orphaned line** on screen; a missing-rate warning shows; the duplicate-month message renders; `kindLabel`s render on the slip.
- 0 unexpected console errors; `git status` = only your claimed files; no git command run.

## Claim
backoffice-front: your TASK-866 Salary screens (`components/partials/Salary/*`, the pay-run + slip pages). Contract questions (the run-result summary shape, the `warnings` shape) come to me — I'll have Jason confirm/add on the BE. **Do NOT** touch Team B's screens.

## Questions (for Sober — non-blocking)
1. **`warnings` only come back in the run response**, not in the overview/slip read. So the FE keeps the last run result per period in `sessionStorage` ("as of the last Run") — it survives opening a slip and coming back, and a reload, but a warning raised on another browser/session is invisible until someone presses Run. Can the period overview carry `warnings` (or a `missingRates` list) so it is always true? FE then drops the storage.
2. **Warning shape** as built by the BE (read from `salary.service.ts`): `{teacherId, date, classType, problem:"no_fl_rate"}` — no name, so the FE maps `teacherId` → the overview's `teacherName`. Confirm that is the settled shape.
3. `autoLines` appears **only when something changed** (absent = nothing changed); the FE reads absent as "รายการอัตโนมัติไม่เปลี่ยน".

## Implementation Notes
**Fern, 2026-11-08.** Proof is against the **real back-office code** (routes + service incl. TASK-878 auto lines + `requireRole`, from the back repo) in a throwaway Bun harness on its in-memory store with an injected hours reader I can change between runs; not sid.
- **1. Re-run display / no orphans:** `useRunPeriod` now **removes every cached slip query** and invalidates the overview, so a line the run removed cannot flash back from the cache. The run result is shown as a persistent blue notice ("Run ล่าสุด: สลิปใหม่ n · อัปเดต m · รายการอัตโนมัติ: เพิ่ม i · แก้ u · ลบ r", or "รายการอัตโนมัติไม่เปลี่ยน") plus the toast.
- **2. Missing-rate warnings:** a yellow banner "ยังไม่ได้ตั้งเรท Freelance — วันเหล่านี้ยังไม่ถูกคิดเงิน" listing **coach name: dates (class type)** + a hint to set the rate and Run again; it stays until the next Run clears it (see Q1).
- **3. Duplicate month:** the artifact is `[data-create-error]`: "มีงวด ตุลาคม 2026 อยู่แล้ว — เลือกจากรายการ “งวดเงินเดือน” ด้านบนได้เลย" (keyed on `409 PERIOD_EXISTS`; any other error shows the API message); it clears when the month/year changes. My TASK-866 test matched the locked-banner alert — this time asserted on the right element.
- **4. Auto-line labels:** each slip line shows a `kindLabel` badge ("Freelance Hour" / "Extra Hour" / "Other"; blue outline for auto, grey for manual) and the BE's per-date `label` ("14/10 (Wed): private 2 Hr × 400, …"); auto lines have no delete button.
- **Evidence (headless Chromium, real BE code, 15 checks all PASS):** Oct 2026 created (range 30 ก.ย.–30 ต.ค.) → Run: "เพิ่ม 4 · แก้ 0 · ลบ 0", warning "พลอย: 16 ต.ค. (Camp)"; พลอย slip = 2 Freelance Hour lines, ต้น slip = 2 Extra Hour lines; then the timetable changes (พลอย loses 15/10, changes 14/10; ต้น loses the 18/10 day) and a manual +100 line was added to ต้น → re-run: "แก้ 1 · ลบ 2"; **screen == BE** for both slips (line count and total: พลอย 1 line 10,650.00, ต้น 2 lines 25,800.00, compared with the API read); the removed lines are gone, the manual line survived; the warning persisted through slip → back; set the camp rate → Run → warning gone, camp line "16/10 (Fri): camp 1 Hr × 300" added; duplicate-month message as above and it clears. 0 unexpected console errors. `tsc` 0 · `next build` 0 (final tree; the Google-Fonts fetch occasionally fails on the network and a retry passes).
- **Not tested:** sid itself; a real 12:00 tick; OT/Merit auto kinds (the harness hours produced only FL + Extra Hour; their labels come from the BE's `kindLabel` and render the same way).
- **Files:** `components/partials/Salary/{PayRun,Slip,hooks,money,parts}`, `types/app/salary.ts` only. No git command run.

## Review
_(—)_

## Review (Sober, SA Lead A, 2026-11-08) — ✅ DONE + answers to Q1–Q3
Strong proof — 15 checks against the REAL back-office code (routes + service + 878 auto lines) in a harness with a changeable reader, **screen == BE** asserted on both slips (line counts + totals), removed lines gone, manual line survived, warning shows/clears, duplicate-month on the right element this time, kindLabels render. tsc 0 / next build 0. **Verdict: ✅ DONE.**

**Answers:**
- **Q1 (warnings only in the run response → sessionStorage "as of last Run"; can the overview carry them so it's always true?):** For the demo your sessionStorage approach is **fine — ship it**. Always-true needs the BE to include a `missingRates` list on the period **overview** (`GET /periods/:id`), computed read-only. That's a small BE add I'm **queuing as a follow-up** (after the demo / when Jason's free — he's on TASK-879 now). When it lands, drop the sessionStorage. Not blocking 881.
- **Q2 (warning shape `{teacherId, date, classType, problem:"no_fl_rate"}`, no name, FE maps via teacherName):** **Confirmed** — that is the settled shape (it's what `salary.service.ts` produces; map `teacherId`→`teacherName` from the overview).
- **Q3 (`autoLines` absent = nothing changed, FE reads "ไม่เปลี่ยน"):** **Confirmed.**

Your TASK-866 follow-ups are both closed here (duplicate-month message now on the right element; the re-run display is honest). Not-tested items (sid, real 12:00 tick, OT/Merit labels) are fine — they ride the same `kindLabel` path and the sid proof is the deploy's.
