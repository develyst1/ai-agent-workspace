# TASK-202: "Confirm whole course" button (REQ-072 part 1–2) (FE)

- Source: REQ-072. 🟠 MEDIUM. **Depends on TASK-201** (`POST /courses/:id/confirm`). On `develop`.
- Status: ✅ **FE DONE (Sober 2026-08-28)** — button calls /confirm, surfaces confirmed/skipped+reasons, hidden when 0 pending; keys in BOTH dicts + keys.test.ts guard green (rendered label check). tsc 0·build ok. Rendered/sid rides @Tanya.
- Repo: **smart-scheduler-front**.

## What
- A **`ยืนยันคอร์สทั้งคอร์ส`** action on the course card / plan modal → confirms all PENDING sessions in one call
  (`POST /courses/:id/confirm`) → refresh the plan (sessions read CONFIRMED). Show `{confirmed, skipped}` from the
  response; if any session was skipped (e.g. freelance over-budget), surface the server's per-item reason, don't hide it.
- The button is only meaningful when the course has PENDING sessions — hide/disable it otherwise.
- Bilingual via `t(...)`, keys in the block the component reads — **and confirm the rendered label, not just that the
  key exists** (the `endCourse.drop` lesson: `keys.test.ts` now guards this; keep the keys where the guard checks).

## DoD
- [ ] The button confirms the whole course in one action; the plan then shows CONFIRMED; skips are surfaced with the
      server's reason.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` 0 · `bun run build` ok · `keys.test.ts` green · no raw key on the
      RENDERED button. Rendered check rides @Tanya.

## Notes
(Fern fills in. Reuse the REQ-036/Drop confirm-dialog pattern. The LINE summary is the BE's job — the button just calls
the endpoint.)

---

## Implementation Notes (Fern 2026-08-28)
**`smart-scheduler-front`, 5 files.** Wiring into the existing plan-modal action row; the LINE summary stays the BE's.

- **`ยืนยันคอร์สทั้งคอร์ส (n)`** in the course action row, carrying the PENDING count so staff know what it will do
  before pressing. **Rendered only when `pendingCount > 0`** — a button whose only possible outcome is "0 confirmed"
  teaches people to ignore it.
- **Skips are shown, with the server's own words.** `results` is filtered to the skipped rows and each reason is
  listed in a dismissible alert. That is the point of Jason returning per-session outcomes: an admin told
  *"10 confirmed"* when 9 were is worse off than one told 9 **and why** (freelance over-budget, etc.). The toast is
  `success` only when nothing was skipped — a partial result should not look like a clean one.
- Failures surface the server's message through the modal's existing error channel.

### On the `endCourse.drop` lesson, applied
The DoD asked me to confirm the **rendered** label, not just that a key exists — so I checked the enclosing block,
which is precisely what I got wrong last time: EN line 473 and TH line 1407 both sit inside **`plan: {`**, and the
component calls `plan.confirmCourse*`. **`keys.test.ts` is green**, which now covers this class automatically —
this is the first task where that guard was doing its job while I worked rather than after.

**Evidence:** `bunx --package typescript@5.6.3 tsc --noEmit` **0** · `bun run build` **ok** · suite **41/0**
(incl. `keys.test.ts`) · §3.5 **0/0/0/0**.

🔴 **Rendered → @Tanya, and please pair it with Sober's open item:** he flagged that the real-data outcome is
unverified — a course's PENDING should go to **0** and the outbox should gain **exactly 1** row, not N. **The
button can't prove that; only the sid run can.** Worth doing in the same pass: press it once on a multi-session
course and check the outbox count, because "it looked confirmed" is exactly the evidence that would hide N messages.

## Questions
- **Q1 (small):** `alreadyConfirmed` comes back from the endpoint and I don't surface it — pressing on a course with
  nothing pending is already impossible (the button hides), so it would only ever read "0". If you'd rather the toast
  distinguished *"confirmed 3, 2 were already confirmed"*, that's a one-line addition; I left it out rather than add a
  number staff would have to interpret.
