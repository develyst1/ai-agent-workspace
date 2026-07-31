# TASK-054: scheduler-front (FE) — "needs attention" panel + digest last-run indicator
- Source: SPEC-018 (REQ-023)
- Status: DONE  (reviewed 2026-08-01 by Sober — three lastRun states distinct incl. the never-run warning exercised for real, no FE recomputation, degraded ≠ zero, titleKey with a fallback for future checks; tsc 0 / build ok)
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
**Fern — DONE, ready for review (2026-08-01). `smart-scheduler-front` only; no BE change (reads TASK-053's `GET /api/attention`).** New `/scheduler/attention`.

- **Nav + route:** `nav.attention` (TH+EN) + `app/(admin)/scheduler/attention/page.tsx` → `AttentionContent`.
- **Data layer:** `types/app/attention` (`AttentionCheck`/`DigestLastRun`/`AttentionResponse`) ·
  `services/attention.service.ts` `getAttention()` (+ offline mock) · `hooks/scheduler/useAttention.ts`.
- **`AttentionContent`** renders the API **as-is — no recomputation**:
  - **Last-run indicator (loud, not a footer):** `lastRun: null` → a **red Alert**
    *"⚠️ The daily digest has never run — the 08:00 scheduled task is not set up."*; present + `sent:true` →
    *"Digest last sent: <time>"*; present + `sent:false` → *"Digest last ran <time> — nothing was outstanding."*
    Time formatted per language (Buddhist era in TH).
  - **Checks:** outstanding (`count > 0`) first — title + count badge + the `items` (label + optional hint);
    **degraded** (`count: null`) → an orange **"couldn't be checked"** badge (visibly ≠ zero); **zero-count**
    checks collapse to a quiet "all clear" list at the bottom so they never crowd out real work. If nothing is
    outstanding or degraded → a friendly "nothing needs attention" card.
  - **Titles render from `titleKey`** via my own `attention.checks.<key>` i18n group (TH+EN), with a fallback to
    the API's `title` (TH default) if the FE lacks a label for a future check — no second hardcoded copy.

**Verification:**
- `bunx tsc --noEmit` → 0; `bun run build` → success (`/scheduler/attention` generated).
- **Browser check (mock, logged in — real page; it's a plain list so it renders fine even in the hidden pane):**
  - **Present lastRun:** panel showed **"ส่งไดเจสต์ล่าสุด: 1 ส.ค. 2569 15:00 น."**, then outstanding checks —
    *unconfirmed bookings* **2** with the two items (label + "· Surfskate" hint), *teachers without LINE* **1**,
    *expiring* **1** (+ "หมดอายุ 2026-08-10" hint), *incomplete students* **3** (count only) — then the degraded
    *no-shows yesterday* as **"ตรวจสอบไม่สำเร็จ"**, then the two zero-count checks as quiet **"· เรียบร้อย"** rows.
  - **Never-run:** set the mock's `attn_never` flag → reload → the top banner became the **red ⚠️ warning**
    "ไดเจสต์รายวันยังไม่เคยรัน — งานตั้งเวลา 08:00 ยังไม่ถูกตั้งค่า". (Cleared the flag after.)
  - **Bilingual:** toggled EN → titles switched ("Needs attention", "Unconfirmed bookings (today / tomorrow)",
    the never-run warning in EN); the per-item labels stay as the API sends them (correct — content isn't FE copy).
- `bun run lint` not run — known-broken on Next 16 (not gated).

## Questions
(Fern asks; Sober answers as `> answer: ...`)
- Built against TASK-053's shape exactly (`{checks:[{key,titleKey,title,count,items:[{id,label,hint?}]}], lastRun:
  {runDate,finishedAt,sent}|null}`). Nothing missing. **No client-side recomputation** — I render counts/items/
  labels as-is; the only FE-computed thing is the sort (outstanding → degraded → clear) and the time formatting.
- Titles resolve from `titleKey` via an `attention.checks.<key>` group (keyed by the stable check `key`, == the
  `att_<key>` titleKey minus the prefix), TH+EN, with a fallback to the API `title`. Flag if you'd rather I key
  the dictionary by the literal `att_<key>` string instead — trivial to switch.
- **Mock affordance:** the offline `getAttention` mock returns a present `lastRun` by default; set
  `localStorage.attn_never="1"` (+reload) to see the never-run warning. Mock-only; no effect on the real API path.

## Review
**Verdict: DONE ✅ (Sober, 2026-08-01).** `bunx tsc --noEmit` → **0**; `bun run build` → success with
`/scheduler/attention` generated (my own run).

- **The last-run indicator is treated as the point of the panel, not decoration** — which is exactly why I
  wrote this task. `lastRun === null` → a **red** alert saying the 08:00 task isn't set up; `sent: true` →
  "last sent"; `sent: false` → **"ran, nothing was outstanding"**. All three states distinct, so "ran and had
  nothing to say" can never be misread as "never ran". **And she exercised the never-run state for real** via a
  mock flag rather than reasoning about it — that's the state that will matter, because it's the one that's
  true right now on the server.
- **Nothing is recomputed** (`AttentionContent:38-41`): counts, labels and hints are rendered as the API sends
  them; the only FE-side logic is the ordering and the time format, which is presentation. The rule stays in
  one place.
- **Degraded ≠ zero**, as required: `count === null` is filtered into its own group with an orange
  "couldn't be checked" badge, while zero-count checks collapse to a quiet "all clear" list at the bottom. A
  broken check can't hide inside a calm-looking screen.
- **Title resolution is right, including the fallback:** `attention.checks.<key>` with a fall-through to the
  API's `title` when the FE has no label for a **future** check. So adding an eighth check server-side shows up
  with a Thai title instead of a raw key — the registry's extensibility survives into the UI, which I hadn't
  thought to ask for.

**Your Question — keying by `key`, not the literal `att_<key>`: keep what you did.** `key` is the stable
identifier the API contract is built on; the `att_` prefix is an internal detail of the backend's i18n table and
shouldn't leak into the FE dictionary. No change.

**One line for next time you're in the file, not a rework:** the FE type declares `finishedAt: string` while the
API types it nullable (`job_runs.finished_at` is nullable in the schema), so `fmtTime` would render
"Invalid Date" if a row ever arrived without it. Unreachable today — `runDailyDigestJob` always sets it — and
`runDate` is right there as a fallback if you ever want to belt-and-brace it.

**TASK-054 → DONE. REQ-023's build is complete** (TASK-053 + TASK-054).
**⏳ @Porter — this unblocks the thing you and the stakeholder deliberately deferred: the 🔴 08:00 Windows task
registration can now be done and tested in one go**, with the panel itself as the proof — before registering,
it should show the red "never run" warning; after the first run, a real timestamp. That's the whole reason the
indicator exists, so please use it as the acceptance rather than trusting the task list.
