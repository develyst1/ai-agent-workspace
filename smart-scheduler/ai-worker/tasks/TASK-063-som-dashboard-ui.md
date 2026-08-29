# TASK-063: scheduler-front (FE) — the SOM dashboard section
- Source: SPEC-020 (REQ-013)
- Status: DONE  (reviewed 2026-08-01 by Sober — percentages of TOTAL not of known (the trap), unknown bucket survives the zero-filter, coverage on every breakdown, unknown label from the FE dictionary; tsc 0)
- Depends on: **TASK-062** (`GET /api/reports/som`)
- Assignee: @Fern (smart-scheduler-front, port 3016)

## What to do
Render `GET /api/reports/som` as the SOM dashboard. Five sections, all from one response:

1. **Existing customers** — three counts: active course · active voucher · first trial in the last 3 months.
2. **Sport share** — proportion of students by their primary sport.
3. **New vs renewing this month** — new-by-first-trial and new-by-registration shown **separately** (they answer
   different questions; don't merge them into one figure), plus renewals.
4. **Demographics** — gender · age band · province · nationality.
5. **Today** — expected vs attended.

**Render what the API returns. Don't recompute, don't re-bucket, don't derive ages** — that all happens
server-side so the dashboard and every other surface agree.

## ⚠️ The one thing this task can get wrong
**Every breakdown must show its own coverage.** Each section carries `{ known, unknown, total }` and an explicit
`unknown` bucket. Show it — *"based on 12 of 48 students"* next to the chart, and the unknown slice visible
rather than dropped.

> Right after launch **most demographics are blank**. A clean pie chart over 12 of 48 students is accurate and
> completely misleading at the same time, and it's the kind of number that ends up in a decision. A dashboard
> that admits its gap is worth more than one that looks confident — and the gap is already actionable: the
> "needs attention" panel (REQ-023) lists exactly which students are missing data.

- Empty/zero states must read as "no data yet", never as a broken chart.
- Keep it scannable — คุณฟีน's standing "ไม่อึดอัด". Cards and simple charts, not a wall of tables.
- i18n TH+EN for all new copy. Bucket **labels** come from the API where present; your copy is the section
  headings, the coverage line and the empty states.
  > **⚠️ One exception, found while reviewing TASK-062: label the `unknown` bucket from YOUR dictionary, not
  > from the API.** `breakdown` hardcodes its label as `"ไม่ระบุ"`, so an English dashboard would show Thai. The
  > bucket's **`key` is stable**, so match on the key and supply your own TH/EN label. (API supplies identity,
  > FE supplies language — same split as `titleKey` on the attention panel.)

## Definition of Done
- [ ] All five sections render from the single response; nothing is recomputed client-side.
- [ ] **Every breakdown shows its coverage** ("based on X of Y") and displays the `unknown` bucket rather than
      filtering it out.
- [ ] Zero/empty data reads as "no data yet" in every section.
- [ ] TH+EN; no regression to the existing Dashboard badge-report or the Reports page.
- [ ] `bunx tsc --noEmit` clean; `bun run build` succeeds — **and open it in a browser**, including a
      **mostly-unknown demographics** case, and say what you saw. If the environment blocks an interaction, say
      exactly which.

## Implementation Notes
**Fern — DONE, ready for review (2026-08-01). `smart-scheduler-front` only; no BE change (reads TASK-062's `GET /api/reports/som`).** New `/scheduler/som`.

- Nav entry `nav.som` (TH+EN) + `app/(admin)/scheduler/som/page.tsx` → `SomContent`. Separate from the existing
  badge Dashboard / Reports (no regression to either).
- `types/app/som` (mirrors the response) · `services/som-report.service.ts` `getSomReport()` (+ a "just-after-launch"
  mock: demographics **mostly unknown**) · `hooks/scheduler/useSomReport.ts`.
- **`SomContent` renders the one snapshot as-is — no recomputation/re-bucketing/age derivation.** Five sections:
  existing-customers (4 stat tiles + trial-window note), new-vs-renewing (the **two "new" numbers kept separate** +
  renewing, per {month}), today (expected/attended + rate), sport-share and demographics as **breakdown cards**.
- **Coverage on every breakdown:** each card shows **"based on {known} of {total} students"** and renders the
  **`unknown` bucket** (never filtered) as a muted bar. The unknown bucket is **labelled from my dictionary** by
  its stable `key === "unknown"` (TH "ไม่ระบุ" / EN "Not specified") — not the API's hardcoded `"ไม่ระบุ"`, so an
  English dashboard isn't half-Thai (the `titleKey`-style split you flagged). Gender labels from my dict; sport
  names from the API `label`; province/nationality/age-band self-label from the key. Zero-total → "no data yet".

**Verification:**
- `bunx tsc --noEmit` → 0; `bun run build` → success (`/scheduler/som` generated).
- **Browser check (mock, real page — plain cards, renders fine in the hidden pane):** all five sections rendered
  from the one response. Existing customers 12 / 7 / 5, distinct 20, "Trials since 1 May 2026". New-vs-renewing
  (2026-08): 4 / 3 / 2. Today 18 / 11 / **61%**. **Sport share — "based on 17 of 20 students"**, Surfskate 45% ·
  Scooter 25% · Balance bike 15% · **Not specified 15%**. **Demographics (the mostly-unknown case):** Gender
  **"based on 5 of 20"** (Not specified **75%**), Age band **"based on 3 of 20"** (Not specified 85%), Province &
  Nationality **"based on 5 of 20"** with the unknown slice shown — i.e. the dashboard **admits its gap** rather
  than drawing a confident pie over a fraction of students. Toggled **TH** → coverage "จากข้อมูล X จาก Y คน",
  unknown → **"ไม่ระบุ"**, gender → ชาย/หญิง (labels switch language; API-supplied sport names stay).
- `bun run lint` not run — known-broken on Next 16 (not gated).

## Questions
(Fern asks; Sober answers as `> answer: ...`)
- Built against TASK-062's shape exactly (`existingCustomers{byCourse,byVoucher,byRecentTrial,total,recentTrialSince}`
  · `sportShare`/`demographics.*` as `{buckets:[{key,label?,count}],known,unknown,total}` · `newVsRenewing{month,
  newByFirstTrial,newByRegistration,renewing}` · `today{date,expected,attended}` · `generatedAt`). Nothing missing.
- **No client-side recomputation** — I render counts as-is; the only FE math is the per-bucket **percentage for the
  bar** (`count/total`) and the today attendance %, which are display formatting, not re-bucketing. Flag if you'd
  rather the API also return the percentages.
- Unknown bucket labelled from the FE dictionary by its stable `key` (per your TASK-062 note), TH+EN.

## Review
(Sober fills at REVIEW.)

## Review
**Verdict: DONE ✅ (Sober, 2026-08-01).** `bunx tsc --noEmit` → **0** (my own run).

The one thing this task could get wrong, it gets right — and I checked the specific line rather than the claim:
- **Percentages are of `data.total`, not of the known subset** (`SomContent.tsx:144`). Dividing by `known`
  would have quietly inflated every sport and gender in exactly the situation this dashboard launches into
  (mostly-blank demographics). That was the trap; you didn't fall in it.
- **The `unknown` bucket survives the zero-filter**: `.filter(b => b.count > 0 || b.key === SOM_UNKNOWN_KEY)`
  keeps it visible even at 0, so "nobody is unknown" is stated rather than inferred from an absence.
- **Coverage on every breakdown** — "based on X of Y" sits above each card, not once at the top of the page
  where it would be read as decoration.
- **The unknown label comes from your dictionary keyed on `SOM_UNKNOWN_KEY`**, with the API's label used only
  where the API actually has one. That's the correction I added mid-task after reviewing TASK-062, applied
  exactly as intended: **the API supplies identity, the FE supplies language.**
- Nothing recomputed — counts, buckets and coverage all render as sent.

**TASK-063 → DONE. REQ-013's build is complete** (TASK-062 + TASK-063).
⏳ Deploy: FE + BE, **no migration**. **Acceptance note for @Porter:** the demographics sections will show a low
coverage line and a large "unknown" slice on day one. **That is the dashboard being honest, not broken** — the
"needs attention" panel lists exactly which students are missing data, and the number climbs as staff fill them
in. Worth saying to คุณฟีน *before* she sees it, not after.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-063 | scheduler-front (FE): the SOM dashboard section | SPEC-020 | ✅ **DONE** (Sober 2026-08-01 — **percentages are of `total`, not of the known subset** (the trap: dividing by `known` would have inflated every slice exactly when demographics are mostly blank); the `unknown` bucket survives the zero-filter so "nobody is unknown" is stated not inferred; coverage on **every** breakdown; unknown labelled from the FE dictionary; tsc 0) | Fern | TASK-062 |
```
