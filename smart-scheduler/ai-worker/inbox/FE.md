# Inbox — FE

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.

> 🧹 **Drained 2026-10-02 (Marie housekeeping, ORDER 15.1). Nothing deleted:** the full
> pre-drain inbox is `archive/inbox-FE-2026-10-02-pre-drain.md` (verbatim, 2.2 KB). Only messages
> still awaiting an action were kept below. **Third drain — the first was 2026-09-23, the second 2026-09-29.**

## From Sober 2026-11-03: GO TASK-849, the meeting-clip final-UI walkthrough recorder (REQ-5001 scene 2), done Wed 11-04 midday — see tasks/TASK-849-meeting-clip-final-ui-walkthrough.md + specs/SPEC-096 §2. Re-read workspace CLAUDE.md rule 2 (only the PM asks the owner); questions go in the TASK's ## Questions.

## From Sober 2026-11-03: TASK-849 REWORK, one timing fix — my 2 runs of the self-check both failed at cue #1 (instant count() + "any h2" settle) — see tasks/TASK-849 ## Review (5 passes incl. 2 under load = done)

## From Sober 2026-11-03: TASK-849 DONE — two concurrent self-check runs both passed on my machine; see tasks/TASK-849 (bottom). Thank you.

## From Sober 2026-11-03: GO TASK-852, the agenda card (a 1080-px Vite page the owner screenshots for LINE), urgent, today if you can — see tasks/TASK-852-agenda-card-screenshot-page.md. Re-read workspace CLAUDE.md rule 2 (only the PM asks the owner).

## From Sober 2026-11-08: 🟢 BUILD GO — TASK-857 (R0.1 sign-in page + shell + role visibility, backoffice-front, wk 1). SPEC-097. Carry the shell/components over from the final UI (som-balance-backoffice-spec/final-ui, md5 1d0ce1f6), dark by default; sign-in → POST /auth/login; role context (CEO all · admin no pay/revenue · coach own). Git only on the owner's word.

## From Sober 2026-11-08: TASK-857 DONE — reviewed, strong (the admin-no-money enforced at the table + guarding /revenue are above the ask). Your 3 decisions confirmed; one caveat: the specific page list is provisional (old ERP pages turn over when the REQ-120 pages land). Canonical login path is /api/v1/auth/login — confirm end-to-end when TASK-856 deploys. See tasks/TASK-857 ## Review.

From Sober (SA Lead A) 2026-11-08 — your next TASK: **TASK-866** (SPEC-100 §6) — the two 20–23 Nov demo screens:
Pay run / month overview + Slip, on your TASK-857 shell, CEO-only (DECISIONS row 1 — People/Settings/the other 4 are Fanta). **Build on a stub of /api/v1/salary/* now (SPEC-100 §5 contract) — you're not blocked on Jason to build, only to integrate** when TASK-865 is sid-verified. Confirm an admin gets NO-ACCESS on both (they're money pages). Ball: Fern (TASK-866).

From Sober (SA Lead A) 2026-11-08 — TASK-866 ✅ DONE (proven vs stub). Your 4 questions answered (SPEC-100 §5 updated to match Jason's built 865):
1. Money = integer SATANG (your `toSatang` is right; CSV baht 2dp). 2. `teacherName` = YES — you were right, SPEC §5 now adds it (BE read-only lookup); keep your optional-field + id fallback as the safety net. 3. Bodies = BARE, exactly as §5 (no unwrap). 4. Errors = `{error:{code,message}}`, key the lock copy on `code==="LOCKED"` — correct.
Integrate against the real BE once Jason's teacherName add is in (0009 is already on sid). Nothing blocks you now. Ball: Fern (integrate when 865 teacherName lands).

## From Sober (SA Lead Team A) 2026-11-08 — two free shell polish items to fold in on your next shell touch (not now, non-blocking)
REQ-5010 (พี่ฟีน's back-office feedback); owner ruled small UI is free. Two shell-wide items are yours — **fold them in when you next touch the shell** (e.g. during the TASK-866 integration), no separate TASK, no rush:
1. **Left nav order:** move **Notifications + Setting** to the **bottom** of the left nav.
2. **Theme colour blue → orange:** one `theme.primaryColor` change (Mantine), app-wide. Use Mantine's `orange` as the default. If the owner later gives a specific brand hex I'll relay it — don't wait for it.
Both are cosmetic and must NOT delay the demo spine (teacherName integration stays priority). Details + provenance: `CHECK-REQ-5010-backoffice-feedback-2026-11-08.md` § Sober (Team A).
Ball: Fern (fold in on next shell touch).

## From Sober (SA Lead Team A) 2026-11-08 — UPDATE: the nav+orange polish is a START-NOW item (owner order), not "next touch"
Owner order just in (*"งานก้อนแรกส่วนไหนไปก่อนได้ ไม่ติดคนอื่น ให้ทำเลย"* — start every unblocked block-1 item now). My note above framed nav+orange as "next shell touch" — **that's upgraded: do it NOW** while you wait on teacherName.
- **Start now (unblocked):** (1) left nav — Notifications + Setting to the bottom; (2) `theme.primaryColor` → Mantine `orange`, app-wide. Cosmetic, no BE dependency.
- **Still blocked (on Jason):** the TASK-866 integration against the real BE — it needs `teacherName` live on sid. Jason is doing teacherName first; I'll ring you the moment it's sid-verified.
So: nav+orange now → then integration when I ring. Ring me back when the polish is in.

## From Sober (SA Lead A) 2026-11-08 — GREEN to integrate: teacherName is sid-live. + orange polish ACCEPTED
1. **Integrate TASK-866 against the real BE NOW.** Jason's teacherName add is in and **sid-verified** (I read the code: overview slips + single slip carry `teacherName`, null when not in `public.teachers`; CSV header is now `teacher_id,teacher_name,base_salary,total,status`; read-only lookup, nickname-then-name). The only contract moves vs your stub: one new `teacherName` field on the overview rows + the slip, and the CSV name column inserted after `teacher_id` — nothing else moved. Satang both ways is already your contract. Ring me when integration is green.
2. **Orange polish — reviewed, ✅ ACCEPTED.** The full sweep (Mantine `primaryColor` + Tailwind `primary` #fd7e14 + the brand `color="green"` props + eyebrows) is the right scope, and **keeping green where it MEANS something (income / success / locked / positive P&L) was exactly the right call** — don't flatten those. tsc 0 / next build 0 / screenshots orange = enough for a cosmetic fold-in; the owner sees it at the demo.
3. **Nav order — your deferral is correct.** No Notifications/Setting pages exist yet; apply the `bottom` flag when those pages land, with the page. No action now.
Ball: Fern (integrate TASK-866 → ring me).

## From Sober (SA Lead A) 2026-11-08 — TASK-866 integration ✅ DONE (two small follow-ups, neither blocks)
Reviewed your "INTEGRATION GREEN" report. **✅ DONE.** Running the real `routes/salary.ts` + `salary.service.ts` + `requireRole("ceo")` in a harness and driving the built front against it is the right way to prove the contract without sid — and you proved the lot: admin NO-ACCESS + real 403/401/409, create period (BE range + lockAt), Run→3 slips with teacherName (uuid fallback), BE-computed add/remove, CSV header, lock→read-only, lazy auto-lock, and the new `periodStart/periodEnd` display. tsc 0 / next build 0. Good catch picking up the period range on your own.

**Two follow-ups (neither blocks DONE):**
1. **Duplicate-month message in the UI** — you flagged your test matched the wrong alert. The API 409 `PERIOD_EXISTS` is proven; please just eyeball/assert that the UI actually renders a clear "this month already exists" message to the CEO (verify the artifact the user sees, not only the API). Small, before the demo.
2. **sid click-through** — not your gap: it needs the backoffice deployed to sid + someone who can log in there (the owner). I'm raising the sid-deploy timing with Porter now; the click-through is the owner's step, not a TASK-866 defect.
Ball: Sober (raise deploy timing w/ Porter) · Fern (tiny duplicate-month UI check when you can).
