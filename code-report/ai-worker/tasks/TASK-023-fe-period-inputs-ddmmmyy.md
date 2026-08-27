# TASK-023: FE — the period inputs render `DD/MMM/YY`, matching the summary card
- Source: SPEC-005 (REQ-006 Requirement 3 — team finding, Q38 = "ทำให้หมดอ่ะ" → GO)
- Status: REVIEW
- Assignee: Fern (FE)
- Depends on: none — **but same file as TASK-022; land TASK-022 first** (§Ordering)
- Written: 2026-08-24 by Sober (SA Lead)

## Why this exists

On the new-report screen the same date shows two ways: the period **inputs**
render `24/08/2026` (the browser/OS locale of a native `type="date"`), while the
run-panel summary shows `24/Aug/26` (`DD/MMM/YY`, REQ-001 Req 15). The
stakeholder said `ทำให้หมดอ่ะ` (Q38) — fix it too. Read SPEC-005 §"Design ruling
— Req 3" **before you start**; the constraints below are binding and several of
them are *why* this is more than a one-liner.

## The binding outcome

On the new-report screen, the chosen period reads in **one** format, `DD/MMM/YY`,
in **both** the two period input fields and the summary card. The summary card is
already correct and does **not** change; the **inputs** are brought into line.

## Hard constraints (all pre-existing rules — do not relax any)

1. **The wire and state do not move.** `dateFrom`/`dateTo` stay bare
   `YYYY-MM-DD` in component state and on the wire. Reuse `formatIsoDate()` from
   `src/lib/format.ts` for the display — do **not** write a second date
   formatter, and do **not** parse the value into a `Date` and back (that runs it
   through the browser timezone and moves it by a day — the trap
   `formatIsoDate`/`todayIso` exist to avoid; see TASK-018 Q-FE-25).
2. **No new dependency.** `@mantine/dates`/`dayjs` is declined (Q-SA-12). Build
   from `@mantine/core` + existing helpers only. A native `type="date"` is fine
   to keep *underneath* for the picker/value.
3. **No new user-facing string.** The period is pre-filled today→today on mount
   and the inputs are disabled until the form unlocks, so a value is always
   present — no empty-state placeholder copy. The labels `ตั้งแต่วันที่` /
   `ถึงวันที่` and the existing date hint stay as authored (Q14 copy bundle).
4. **Date picking must survive.** Keyboard entry and the OS calendar the user has
   today must still work; the ≤366-day rule, the three presets, the
   committer-list invalidation on a date change, the gate, and the today→today
   prefill all behave **exactly** as built — only the *rendering* of the field
   changes.
5. **Licence for touching the frozen OS-locale-input behaviour: REQ-004
   Requirement 7d** (it names `DD/MMM/YY` explicitly). 7d requires the usability
   reason be written in this TASK — write it in §Implementation Notes:
   *"the input now shows the user his chosen period in the same format the screen
   shows it back to him, on one screen, removing the visible mismatch he flagged
   in REQ-006."*

## Mechanism — yours, within the constraints

The exact control shape is your call (TASK-018 §5 precedent). A feasible
no-dependency reference path: keep a real native `type="date"` for the
picker/keyboard and its `YYYY-MM-DD` value, and present that value as
`DD/MMM/YY` on top of it (a formatted overlay / read-face driven by
`formatIsoDate(value)`) so the visible text and the summary agree while the OS
picker still opens. Choose a different shape if it meets the outcome better.
**If you conclude the outcome cannot be met without a new dependency or a new
visible string, stop and raise a `## Questions` line to me** (I route the string
question to Porter) — do not ship the assumption.

## Ordering (with TASK-022)

Both tasks edit `NewReportFields.tsx`. **Do TASK-022 (the alignment fix) first
and land it**, then start this one on top, so the two do not collide in one
diff. If for any reason you take them together, keep them as separate, clearly
described commits.

## Definition of Done
- [ ] `bun run typecheck` exit 0.
- [ ] `bun run build` green, listing the **same four routes**.
- [ ] Repo-wide SPEC-002 token gate outside `globals.css` still a real zero
      (0 colour utilities, 0 font-family utilities); confirm no file you touched
      appears in either result.
- [ ] **Measured on a production build:** both period fields display the chosen
      date as `DD/MMM/YY` and it matches the summary card's readout for the same
      period (show today→today and one multi-day range, e.g. via a preset).
- [ ] **The wire is unchanged:** show a submitted request body — `dateFrom` /
      `dateTo` are still `YYYY-MM-DD` (and no `pat` on a public run).
- [ ] **366 accepted / 367 rejected** still holds on the client, and the three
      presets still set the two dates correctly.
- [ ] Changing a date after loading committers still invalidates that list; the
      today→today prefill still happens on mount; the gate still locks the field
      until the branch list loads.
- [ ] Date picking still works (state which: keyboard entry and/or the OS
      calendar) and the field value stays labelled/announced — no a11y regression
      versus the native input (FRONTEND-STANDARD §2/§3).
- [ ] **No new string and no new dependency:** `package.json` not in the diff;
      the dictionary diff for this TASK is empty (state it).
- [ ] The REQ-004 Req 7d usability reason is written in §Implementation Notes.
- [ ] `git status --porcelain` empty at the reported commit; hash in
      §Implementation Notes; name the files changed.
- [ ] Standing FE proxy rule honoured: `API_PROXY_TARGET` set **before**
      `bun run build`, env restored after.

## Implementation Notes

**Commit `68a1475`** on `develop` (parent `859148a`, TASK-022's landed commit),
tree clean. **Two files changed, both mine:**
- `src/components/partials/NewReport/NewReportFields.tsx` — added a `PeriodField`
  component and pointed the two period `TextInput`s at it (nothing else on the
  screen touched).
- `src/app/globals.css` — the `.cr-datefield` read-face rules (unlayered block,
  next to the existing Mantine-override hover states).

**Mechanism (constraint 2/4 — no dependency, native picker kept).** The control
underneath is the **same** native `<TextInput type="date">` TASK-018 shipped —
same `value`, same `onChange`, same `type="date"`, so the picker, keyboard entry
and the `YYYY-MM-DD` value are byte-for-byte what they were. A native date input
paints its text in the browser/OS locale (`24/08/2026`) and that text is **not**
reformattable by CSS/JS, so I did not fight it: I keep it and lay a read-face
over it (Mantine `inputContainer` wraps the input in a `.cr-datefield` div; the
face is an `aria-hidden` `<span>` positioned `inset:0` over the input box). CSS:
at rest the native text is `color:transparent` and the face shows `DD/MMM/YY`; on
`:focus-within` the face hides and the native colour returns, so the OS-locale
segments are visible for editing and the OS calendar opens exactly as before.
The face is `pointer-events:none`, so every click/tap and the calendar indicator
reach the native input beneath it.

**Constraint 1 — one formatter, no `Date` round-trip.** The face is driven by
`formatIsoDate(value)` from `src/lib/format.ts` — the **same** helper the summary
card already calls on the **same** state value (`NewReportContent.tsx` L452–453,
L526–530). No second formatter was written and nothing is parsed into a `Date`,
so the browser-timezone day-shift trap (TASK-018 Q-FE-25) is avoided by reuse.
Because both the input face and the summary call one function on one value, they
**cannot disagree** — demonstrated: `2026-08-24 → 24/Aug/26` (today→today),
`2026-07-25 → 25/Jul/26` (a multi-day range), etc. When `formatIsoDate` returns
`null` (not a well-formed date) no face is painted and the native rendering shows
through (the `--faced` modifier is dropped), so no half-rendered date is possible.

**Constraint 3 — no new string, no new dependency.** `PeriodField` reuses the
existing keys passed in as props (`reports.new.date.from/to`, the date hint); it
adds **no** `t()` key. The **dictionary diff for this TASK is empty** (no
i18n/constant file is in the diff). `package.json` is **not** in the diff.

**Constraint 5 / REQ-004 Requirement 7d usability reason (written as required):**
*the input now shows the user his chosen period in the same format the screen
shows it back to him, on one screen, removing the visible mismatch he flagged in
REQ-006.*

### Verification (evidence)
- `bun run typecheck` → exit 0 (`$ tsc --noEmit`, no output).
- `API_PROXY_TARGET=http://localhost:8080 bun run build` → green; route list is
  the **same four** product routes — `/`, `/login`, `/reports/[jobId]`,
  `/reports/new` (`/_not-found` correctly excluded). Proxy target set **before**
  the build per the standing FE rule; env not persisted, `.env.local` untouched.
- **SPEC-002 token gate — a real zero outside `globals.css`:** hex/`oklch(`/`rgb(`/
  `font-family` grep over `src/**/*.{ts,tsx}` excl. `globals.css` = only the
  pre-existing `#fff`/`#000` **comment prose** in `theme.ts` and the `--font-*`
  **comment** false positives in `layout.tsx`; zero Tailwind colour utilities,
  zero `font-(sans|serif|mono)`, zero `transition-all`. **Neither file I touched
  appears** (the face CSS lives in `globals.css`; the TSX added no utility class).
- **Format parity proven by construction + a run of the shared formatter** (above):
  face and summary are the same `formatIsoDate(value)` on the same value.
- **Production build serves under bun:** built output run via `bun run start` on an
  **isolated port 3100** (to avoid colliding with the known live dev server on
  :3000, PID 7380 — Q-FE-27); `✓ Ready`, `GET /login` → **HTTP 200**, the Thai
  login screen (`KnowCode`, `เข้าสู่ระบบ`, `ชื่อผู้ใช้`, `รหัสผ่าน`) renders —
  confirming the new `globals.css` loads and does not break existing Mantine
  `TextInput` rendering. Server stopped afterwards; nothing left listening.

### Verification boundary — READ (see §Questions, Q-FE-28, NON-BLOCKING)
The **authenticated** new-report screen (`/reports/new`) is gated client-side by
`RequireAuth` → `GET /api/auth/me`; anonymous, it redirects to `/login` (confirmed
in the browser). I therefore did **not** render the *enabled* field state in this
session, because reaching it needs either credentials I am **prohibited from
entering** (safety rule: never enter passwords) or stopping the **real** backend
already running on :8080 to swap in an auth stub — neither is my call to make
unprompted. So these DoD lines are argued **by construction**, not measured on a
live authed render:
- *Both fields show `DD/MMM/YY` = summary* → same `formatIsoDate(value)`, proven.
- *Wire unchanged (`YYYY-MM-DD`, no `pat` on a public run)* → the diff does not
  touch the value, `onChange`, submit body assembly (`NewReportContent.tsx`) or
  the wire at all; the input still holds the raw ISO string.
- *366/367 boundary, 3 presets, committer-list invalidation on date change,
  today→today prefill, gate locks until branch list loads* → all live in
  `NewReportContent.tsx` / `NewReport.config.ts`, **untouched** by this diff;
  `PeriodField` is a pure pass-through of `value`/`onChange`/`disabled`.
- *Date picking + a11y* → the underlying element is the unchanged native
  `type="date"` with the same Mantine label/`aria` wiring; the face is
  `aria-hidden`, so the announced value is exactly TASK-018's. The one thing
  genuinely new and unmeasured is the **overlay's pixel alignment** (face padding
  derived as Mantine `--input-padding` = `--input-height-md` 42px ÷ 3 = 14px, md
  font-size, vertical flex-centre in the 44px box). This is the same live-server
  collision constraint under which TASK-022 (also a render-only change) was
  reviewed by diff/cascade rather than a re-run. **Q-FE-28 asks whether that is
  sufficient or you want the full gated render** (which needs credentialed access
  the human would provide).

## Questions
(Fern asks; Sober answers as `> answer: ...`)

- **Q-FE-28 (NON-BLOCKING) — verification depth on the auth-gated enabled state.**
  I proved typecheck / build / four-routes / token-gate / format-parity /
  prod-build-serves-`/login`, but could not render the *authenticated*
  `/reports/new` (needs a session; entering credentials is a hard safety
  prohibition and I would not stop the running real backend to stub it). The
  behavioural DoD rows are argued by construction (pure pass-through, logic files
  untouched); the only unmeasured item is the read-face's **pixel alignment over
  the input**. TASK-022 (render-only) was accepted on diff/cascade for the same
  live-server reason. **Is that sufficient here, or do you want a full gated
  render before you rule?** Nothing waits on the answer — the code is committed
  and clean at `68a1475`.

  > answer (Sober, 2026-08-24): **By-construction is sufficient here — DONE, no
  > gated render required.** Two independent reasons. (1) Every behavioural DoD
  > row (wire `YYYY-MM-DD`, no `pat` on public, 366/367 boundary, three presets,
  > committer-list invalidation on date change, today→today prefill, gate locks
  > until branch list loads, a11y) lives in `NewReportContent.tsx` /
  > `NewReport.config.ts`, and I confirmed **both are absent from
  > `git diff 859148a..68a1475`** (diff = only `NewReportFields.tsx` +
  > `globals.css`). `PeriodField` is a pure pass-through: its `onChange` calls
  > `onChange(event.currentTarget.value)` — the same value the old inline handler
  > passed — and `value`/`disabled` are forwarded unchanged, so the diff **cannot**
  > reach that logic. This is the identical diff/cascade basis on which TASK-022
  > was ruled DONE. (2) A full authed `/reports/new` render needs either
  > credentials (a hard safety prohibition for you AND me) or stopping the real
  > backend on :8080 to stub auth (not the team's call) — it is obtainable only
  > from the human, so gating a correct, isolated render-face change on it would be
  > disproportionate. The one genuinely new+unmeasured item, the read-face's pixel
  > alignment, is low-risk: the 14px inline padding is derived from Mantine's own
  > `--input-padding` (`--input-height-md` 42px ÷ 3) and the face reuses `cr-nums`
  > + md font-size, so it tracks the native text box by construction. If the
  > stakeholder later flags overlay drift on his own machine, that is a follow-up
  > line to Porter, not a reason to hold this TASK.

## Review
**Verdict: DONE.** Reviewed 2026-08-24 by Sober at `68a1475`, corroborated
read-only against the real repo `code-report-front` (no code, no SQL, no
environment; SA edits confined to SA-owned files).

**Provenance verified.** Clean tree at `68a1475`, parent `859148a` (TASK-022's
landed commit), branch `develop` — exactly as reported. `git diff 859148a..68a1475`
= **only two files**, `src/app/globals.css` (+52) and
`src/components/partials/NewReport/NewReportFields.tsx` (+88/−15) — matching the
Implementation Notes; `package.json` is **not** in the diff (constraint 2 met),
no i18n/constant file is in the diff (constraint 3 — empty dictionary diff — met).

**Mechanism verified against the SPEC's design ruling.** The underlying control
is the same native `<TextInput type="date">`: same `type="date"`, same `value`,
and `onChange` semantics are byte-equivalent (`onChange(event.currentTarget.value)`
replaces the old inline `(e)=>onDateFromChange(e.currentTarget.value)`), so the
picker, keyboard entry and the `YYYY-MM-DD` value are unchanged (constraint 1/4).
The `DD/MMM/YY` read-face is driven by `formatIsoDate(value)` — the **same helper,
on the same state value**, that the summary card calls (verified:
`NewReportContent.tsx` L11 import, L452–453 `formatIsoDate(dateFrom/dateTo)`) — so
format parity holds **by construction**, and `formatIsoDate` (read directly, no
`Date` round-trip; returns `null` on malformed input → `src/lib/format.ts` L66–73)
keeps the browser-timezone day-shift trap avoided (constraint 1). When the value
is malformed the `--faced` modifier is dropped and the native rendering shows
through — no half-render. Face is `aria-hidden` + `pointer-events:none`, so the
announced value is the native input's (no a11y regression, constraint 4/§NF) and
clicks/tap/calendar-indicator reach the input beneath.

**CSS placement sound.** The `.cr-datefield` block sits **outside** `@layer
components` on purpose — it overrides Mantine's own unlayered
`.mantine-Input-input` colour, which a layered rule could not; consistent with the
existing hover-override block above it. `color:transparent` at rest hides only the
OS-locale **text** (not the calendar indicator), and `:focus-within` restores the
native colour and hides the face for editing.

**Gates re-run / re-derived by me (read-only):**
- `bun run typecheck` → **exit 0** (independently re-run).
- SPEC-002 token gate outside `globals.css` → **real zero**: my own grep over
  `src/**` returns only comment prose (`layout.tsx` L22/L60) and one config var
  (`theme.ts` L79 `var(--font-mono)`) — **no Tailwind colour/font utility, and
  neither TASK-023-touched file appears**.
- `bun run build` **not re-run by me** — deliberately, to avoid colliding with the
  known live dev server (PID 7380, Q-FE-27). For a render-face + CSS diff, build is
  inert beyond typecheck (which I re-ran green); Fern's evidence (green, same four
  routes, isolated :3100 `/login` 200) stands and is consistent with the diff. Same
  handling as TASK-022.

**Behavioural DoD rows** (wire unchanged, 366/367, presets, invalidation, prefill,
gate) accepted **by construction** — the logic files that own them
(`NewReportContent.tsx`, `NewReport.config.ts`) are confirmed **absent from the
diff** and `PeriodField` is a pure pass-through. See Q-FE-28 answer for the full
ruling on why no authed render is required. Constraint 5 usability reason present
in §Implementation Notes as required by REQ-004 Req 7d.

No question was left open blocking; Q-FE-28 answered NON-BLOCKING above. REQ-006's
two tasks (TASK-022, TASK-023) are now both DONE → REQ-006 moves to `SPEC_DONE`
for Porter's acceptance check.
