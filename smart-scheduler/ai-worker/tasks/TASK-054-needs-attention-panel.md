# TASK-054: scheduler-front (FE) — "needs attention" panel + digest last-run indicator
- Source: SPEC-018 (REQ-023)
- Status: IN_PROGRESS  (Fern 2026-08-01)
- Depends on: **TASK-053** (`GET /api/attention` contract)
- Assignee: @Fern (smart-scheduler-front, port 3016)

## What to do
The 08:00 LINE digest tells admins *that* something needs attention; this panel is where they actually do
something about it. It reads `GET /api/attention` → `{ checks: [{ key, titleKey, title, count, items }], lastRun }`.

> **Titles: use `titleKey`, not `title`.** Each check carries an i18n key (`att_<key>`, e.g.
> `att_unconfirmed_bookings`) plus `title` as a Thai default. Render from `titleKey` so the panel is TH+EN like
> the LINE digest. *(My earlier draft said the titles come from the API full stop — that would have forced you
> into TH-only or a second copy of the labels. My gap; it's fixed in TASK-053's rework.)*

1. **A "needs attention" view** listing each check with its **title + count**, and the check's `items`
   underneath (label + optional hint). Checks with `count = 0` collapse or drop to a quiet "all clear" row —
   they must not push the real work off the screen.
2. **Do not recompute anything.** Counts, item labels and hints come from the API as-is. The rule for "what
   needs attention" lives on the server; a second copy here would drift within a month.
3. **A degraded check** (`count: null` + an error label) renders as *"couldn't be checked"* — visibly not the
   same as *"nothing to do"*. Zero and broken must never look alike.
4. **⚠️ The last-run indicator — this is not decoration, it's the point of the panel.** Render `lastRun`:
   - present → *"Digest last sent: &lt;time&gt;"* (and note when it ran but sent nothing).
   - **`null` → a visible warning: "⚠️ The daily digest has never run — the 08:00 scheduled task is not set up."**

   > Why it's prominent: this project already has **two scheduled jobs that were never registered on the
   > server**, and nobody noticed for weeks because a job that never runs produces nothing to notice. This
   > line is how the third one stops being invisible. Don't bury it in a footer.
5. **Placement + layout are yours** — a page under the scheduler section or a panel on the existing landing
   view, whichever fits the app you know. Keep it calm and scannable (คุณฟีน's standing "ไม่อึดอัด").
6. i18n TH+EN for every new string (check titles come from the API — labels/empty/error states are yours).

## Definition of Done
- [ ] Panel lists all checks with counts and their items; zero-count checks don't crowd out real items.
- [ ] Check titles render from `titleKey` in **both** TH and EN — no second copy of the labels in the FE.
- [ ] Nothing is recomputed client-side — no eligibility, expiry, or cap math in the FE.
- [ ] A degraded check reads as "couldn't be checked", clearly distinct from a zero count.
- [ ] `lastRun = null` produces a **visible** "the scheduled task is not set up" warning; a present `lastRun`
      shows when it last ran and whether it sent anything.
- [ ] TH+EN copy; no regression to the calendar or any existing screen.
- [ ] `bunx tsc --noEmit` clean; `bun run build` succeeds — **and open the panel in a browser**. State what you
      clicked, including what it looks like with `lastRun = null`. If the environment blocks something, say
      exactly which, as you did on TASK-049 — don't imply coverage you don't have.

## Implementation Notes
(Fern fills in — include what you exercised in the browser.)

## Questions
(Fern asks; Sober answers as `> answer: ...`)
- Build against TASK-053's response shape; if the panel needs a field it doesn't return, flag it here and I'll
  reconcile both sides rather than you deriving it locally.
- The two non-negotiables are **no client-side recomputation** and **the last-run warning being visible**.

## Review
(Sober fills at REVIEW.)
