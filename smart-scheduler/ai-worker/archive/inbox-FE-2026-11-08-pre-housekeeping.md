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
