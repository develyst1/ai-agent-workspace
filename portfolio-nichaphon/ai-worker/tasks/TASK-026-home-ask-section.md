# TASK-026: Home "Ask the AI about me" section — chips, live steps, answer + citations, badge, three failure pictures, phone
- Source: SPEC-007
- Status: **DONE** (2026-09-13, Sober — every DoD line re-run by SA on the stub, see §Review; zero real calls)
- Depends on: TASK-025 `DONE` (the frame contract is frozen in SPEC-007 §Frames — you may start the UI before 025 lands, but the DoD integration run needs it)
- Owner: Fern (FE)

## What to do

All in `front/`. Home is the site's most-tested surface (REQ-001/002, `tests/REGRESSION.md`,
the DEF-2 hero fold fix in TASK-013): **the hero is not touched**, nothing on Home is removed
or re-ordered (Q46 default). The new section goes **between `HomeHero` and `HomeStats`** in
`HomeContent.tsx` (SPEC-007 D12). Zero real gateway calls — run `back/` against the stub.

1. **`src/constant/ask.ts`** — `ASK_WS_URL = process.env.NEXT_PUBLIC_ASK_WS_URL ??
   'ws://localhost:3001/ws'` and `ASK_CONNECT_TIMEOUT_MS = 5000`. This is `back/`'s URL, never
   the gateway's (AC-g). Add the variable to `front/README.md`'s env notes (local default).
2. **`src/components/partials/Home/Ask.config.ts`** — every visible string, no inline JSX
   strings anywhere in the section: eyebrow/title/lead for the section (yours to draft, no
   claims about him — it describes the feature, e.g. that the answer comes from his profile
   through three AI steps); input label + placeholder; `STARTER_CHIPS` = exactly the two
   owner-confirmed questions in SPEC-007 SQ34's default wording; `STEP_LABELS` (3);
   `BADGE_FORMAT` (provider · model · ms); `FAILURE_COPY` keyed by every kind in SPEC-007 D9
   **plus** the two client-only states `never_opened` and `dropped`; `RESTING_COPY` (H1: the
   live AI is resting + three links `/about`, `/portfolio`, `/contact`); `NOT_COVERED_HINT`
   (shown under an answer with `coverage:"none"`, linking `/contact`).
3. **`useAskSocket.ts`** (same folder) — state machine: `idle → connecting → running →
   answered | failed(kind)`; opens the socket **on first submit**, reuses it while open;
   5 s open timeout → `failed('never_opened')`; `onclose` while `running` → `failed('dropped')`
   and every step not `done` becomes `interrupted`; `error` frame → `failed(kind)` with
   `at_step`; `done` frame ends `running`. A new submit while `running` is disabled in the UI
   (never rely on the server's `busy`). Parse frames defensively (unknown `type` ignored).
4. **`HomeAsk.tsx`** (`'use client'`) + `HomeAsk.module.css` — inside a `PageSection`
   (`density="regular"`, `bordered`), a `SectionHeading`, then a `GlassPanel` holding:
   the chip row (click = submit that text; use `TechChip`/`ChipRow` or Mantine `Button`
   variant that already exists in the theme — no new colour) · `TextInput` + submit `Button`
   (disabled while running) · the **step timeline**: three rows, each `idle | running | done |
   interrupted`, `done` shows the badge (`provider · model · latency_ms ms`; idea D) and
   `retried` as a small note · the **answer**: rendered only on an `answer` frame; below it
   the citation list (`ref` as text, `href` as a Next `Link`; idea C) and, for `coverage:
   "none"`, `NOT_COVERED_HINT` · the **failure panel**: `FAILURE_COPY[kind]` + `RESTING_COPY`
   (H1) + a retry button. `aria-live="polite"` on the timeline + answer region.
   Styling from theme tokens and existing CSS-module patterns only (SPEC-001 rules).
5. **Phone (AC-h):** at 360×740 the hero's fold is unchanged (compare against
   `tests/TEST-007`'s baseline behaviour — the section starts below the hero); chips wrap;
   the timeline is one column; nothing overflows horizontally.
6. **Nothing stored:** no `localStorage`, no cookie, no analytics call. Grep it.

## Definition of Done
- [x] `cd front && npx tsc --noEmit` → 0; `npm run build` exit 0, 0 error / 0 warn.
- [x] `grep -r "ai.develyst.online" front/.next` → empty · `grep -r "STEP: " front/.next` → empty · `grep -rn "localStorage\|document.cookie" front/src/components/partials/Home` → empty.
- [x] Every visible string of the section traces to `Ask.config.ts` (`grep -n "'" HomeAsk.tsx` shows no user-facing literal).
- [x] Integration run (stub on 3999, `back/` on 3001 with `KNOWLEDGE_DIR` → fixtures, ~~`npm run dev`~~ `next start -p 3002` on the fresh build — FQ47): the happy path paints three steps in sequence with badges, then the answer with ≥ 1 citation link; `stub:none` shows the not-covered hint; `stub:offtopic` shows the boundary answer with no citations.
- [x] **Three failure pictures, taken by you at 1280 and 360** and listed by filename in §Implementation Notes (QA re-takes them later): (1) `back/` not running → `never_opened`; (2) `back/` running, stub killed → `error unreachable at_step 1`; (3) `stub:slow`, then kill `back/` mid-chain → `dropped` with steps marked interrupted and **no answer text on screen**.
- [x] Home at 360×740 with the section: the hero's first fold matches before/after (one screenshot pair); no horizontal scroll.
- [x] `git status` shows only `back/` and the new/edited `front/src/...` files + `front/README.md`; nothing under `front/src/components/partials/Home/HomeHero*` changed.
- [x] Zero requests reached `https://ai.develyst.online` — stated in §Implementation Notes.

## Implementation Notes
(Fern, 2026-09-13)

**Zero requests reached `https://ai.develyst.online`.** `back/` ran only with `GATEWAY_BASE_URL=http://127.0.0.1:3999`
(the stub) or with that port closed; `front/` only ever opens `ws://localhost:3001/ws`. SPEC-007 ledger stays `0 / 30`.

### Files (all CRLF, like the repo)
- NEW `front/src/constant/ask.ts` — `ASK_WS_URL` (`NEXT_PUBLIC_ASK_WS_URL ?? 'ws://localhost:3001/ws'`), `ASK_CONNECT_TIMEOUT_MS = 5000`.
- NEW `front/src/components/partials/Home/Ask.config.ts` — every visible string: eyebrow/title/lead (feature copy, no claim
  about him), input label/placeholder, `Ask`/`Asking…`/`Try again`, `STARTER_CHIPS` (SQ34's two, verbatim), `STEP_LABELS`
  (SPEC's three), `STEP_STATUS_COPY` (Waiting / Running… / Interrupted), `STEP_RETRIED_NOTE`, `BADGE_FORMAT`,
  `CITATIONS_HEADING`, `FAILURE_COPY` (D9's ten kinds — the eight server sentences copied from `back/src/gateway/messages.ts`,
  `bad_request` shortened — plus `never_opened`, `dropped`), `RESTING_COPY` (H1 + `/about` `/portfolio` `/contact`), `NOT_COVERED_HINT` (→ `/contact`).
- NEW `front/src/components/partials/Home/useAskSocket.ts` — `idle → connecting → running → answered | failed(kind)`; socket
  opens on first submit, reused while `OPEN`; 5 s open timer → `never_opened`; `close` while `connecting` → `never_opened`,
  while `running` → `dropped`; every step not `done` → `interrupted`; `error` frame → `failed(kind, at_step)`; `done` ends
  `running` (→ `answered` iff an `answer` frame was received). Frames parsed defensively (non-JSON / non-object / unknown
  `type` / bad `step` / malformed `answer` ignored; unknown error `kind` shown as `bad_response`). `busy` blocks a second submit.
- NEW `front/src/components/partials/Home/HomeAsk.tsx` (`'use client'`) + `HomeAsk.module.css` — `SectionHeading`
  (`id="ask-heading"`) + `GlassPanel`: two chips (Mantine `Button variant="default" radius="xl"`, wrap at 360), `TextInput`
  (`maxLength 2000`) + filled `Button` (loading/disabled while busy), the 3-row timeline (`01/02/03`, label, status or
  `provider · model · ms` badge, `retried once` note), the answer (only from an `answer` frame) + `Sources` list (`ref` as a
  Next `Link` to `href`, verified excerpt under it) + the not-covered hint on `coverage:"none"`, the failure panel
  (`FAILURE_COPY[kind]` + H1 + three links + `Try again`). `aria-live="polite"` wraps timeline + answer; the failure panel is `role="status"`.
  Tokens only (`--mantine-*`, `--site-hairline`, `--site-ink-faint`, `--site-accent-wash`, `--site-glass-border`,
  `--site-font-mono`); `68ch` measure and `48px` panel offset are the values `AboutExperience` / `HomeCapabilities` already use.
- EDIT `HomeContent.tsx` — `<PageSection density="regular" bordered labelledBy="ask-heading"><HomeAsk /></PageSection>`
  inserted between `<HomeHero />` and the stats section (5 added lines, nothing moved). EDIT `Home/index.ts` — export added.
- EDIT `front/README.md` — env table with `NEXT_PUBLIC_ASK_WS_URL` under Commands (default, `back/` not gateway, `wss://` over HTTPS).
- `HomeHero*` untouched (`git status` on them = nothing). `git status` = `?? back/`, the five new `front/` files, the three
  edits above, plus TASK-021's five files still `M` (that task is in Sober's REVIEW — not touched here).

### Evidence
- `npx tsc --noEmit` → 0. `npm run build` → exit 0, `✓ Compiled successfully`, 10/10 static pages, no warning, `/` 7.3 kB.
- `grep -rl "ai.develyst.online" front/.next` → empty · `grep -rl "STEP: " front/.next` → empty ·
  `grep -rn "localStorage\|document.cookie" front/src/components/partials/Home` → empty.
- `grep -n "'" HomeAsk.tsx` → only `'use client'`, `useState('')`, phase/coverage literals, `{' '}`, `padStart(2, '0')` — no user-facing literal.
- Integration run — stub `STUB_PORT=3999`, `back/` `GATEWAY_BASE_URL=http://127.0.0.1:3999 KNOWLEDGE_DIR=test/fixtures/knowledge PORT=3001`
  (`/health` → `profile:true, projects:true`), front `next start -p 3002` on the fresh build (3000 is foreign — never touched;
  FQ47 on dev vs start). Driven by `project-docs/fe-task026-2026-09-13/ask-harness.cjs` (playwright-core read from another
  repo's `node_modules` via `NODE_PATH`, system Chrome headless — nothing installed), which prints the DOM it saw:
  - happy (`stub:slow …WebSocket?`): at 3.2 s → step 1 `done` `deepseek · deepseek-flash · 636 ms`, step 2 `Running…`, step 3
    `Waiting`; final → three `done` badges, the answer text, `Sources` = `/about Skills` + `/portfolio YodBarber Queue Booking`
    (2 links — the stub's third excerpt is D6-dropped server-side); submit button back to `Ask`, enabled.
  - `stub:none` → three `done`, the not-covered answer, hint `The profile does not cover this one. Ask directly` → `/contact`.
  - `stub:offtopic` → step 1 `done`, steps 2–3 `Waiting` (FQ46), the boundary sentence, **0 links** in the live region.
- Pictures (`project-docs/fe-task026-2026-09-13/`, 1280×900 = `-desktop`, 360×740 = `-phone`):
  - (1) `f1-never-opened-desktop.png`, `f1-never-opened-phone.png` — `back/` down; failure shown after ~2.4 s (Chrome refuses
    the closed port → `close` while `connecting`; the 5 s timer path itself is **UNVERIFIED** — it needs a black-hole host).
  - (2) `f2-unreachable-step1-desktop.png`, `f2-unreachable-step1-phone.png` — `back/` up, stub killed; `back/` log:
    `fail kind=unreachable at_step=1 calls=0`; all three steps `Interrupted`, sentence `The AI gateway could not be reached.`
  - (3) `f3-dropped-desktop.png`, `f3-dropped-phone.png` — `stub:slow`, `back/` killed (`taskkill`) at ~2.6 s: step 1 keeps
    its badge, steps 2–3 `Interrupted`, sentence `The connection dropped before the answer was finished.`, **answer blocks on
    screen = 0** (counted), `Try again` present.
  - Also: `fold-phone.png` / `fold-desktop.png` (scrollTop 0), `section-idle-*`, `happy-mid-*`, `happy-final-*`, `none-*`, `offtopic-*`.
- Fold (AC-h), measured at scrollTop 0: 360×740 → hero bottom **741**, ask section top **741**, viewport 740 — the first fold is
  the hero alone (`min-height: 100dvh`, untouched); 1280×900 → 901 / 901. **Before** picture = QA's baseline
  `project-docs/qa-test004-2026-09-05/b2-h8-fold-360x740.png` (TASK-013); **after** = `fold-phone.png`. `scrollWidth` = 360 at
  360 and 1280 at 1280 in every state (idle, mid-chain, answered, all three failures) — no horizontal scroll; chips wrap; timeline one column.
- All my processes stopped, 3001/3002/3999 freed; 3000 never touched.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

- **FQ46 (non-blocking, default taken).** After D3's off-topic stop, steps 2 and 3 stay `Waiting` under the boundary answer
  (they never started, so they are neither `done` nor `interrupted`). Honest but slightly odd. A `skipped` state would need
  one more config string + one branch in `done` handling — your call; shipped as-is.
- **FQ47 (non-blocking, decision recorded).** The DoD says `npm run dev` for the integration run; `front/.next` held a build
  and the dispatcher note says never dev on top of one, so I built first and served that build with `next start -p 3002`.
  Same bundle the greps ran on, so the evidence is at least as strong; `next start` warns about `output: standalone` but serves.
- **FQ48 (FYI, no action).** `FAILURE_COPY` duplicates the eight server sentences (the TASK says `FAILURE_COPY[kind]`; the
  frame's own `message` is ignored client-side). If `back/`'s wording changes, both files change — one line each.
- **FQ49 (FYI, no action).** Chips are Mantine `Button variant="default"` — `TechChip` is a `<span>` and `ChipRow` has no
  click handler, so neither is a button; no new colour was introduced (default variant + theme's 44px height).

> answer FQ46 (Sober, 2026-09-13): **Accepted as shipped.** "Waiting" is the truthful word — those steps never started,
> and D9 defines only idle/running/done/interrupted. A `skipped` state is a real polish, but it is tied to SQ37(a): if the
> owner wants all three steps to run on off-topic questions, the state never exists. I have added that sentence to SQ37 in
> SPEC-007 so the two travel together; it becomes a one-config-string task only after he answers. Not a rework.
> answer FQ47 (Sober, 2026-09-13): **Accepted — the stronger evidence.** The built bundle is what the greps ran on and what
> ships; `next dev` would have proven less. The `output: standalone` warning is harmless here (the postbuild copy exists for
> the droplet). Q26 (which surface the droplet serves) is still the owner's and decides what QA mirrors, not this task.
> answer FQ48 (Sober, 2026-09-13): **Accepted.** The client-side copy is by SPEC (§Frontend: "client-side copies"), and
> ignoring the frame's `message` means a server wording change can never leak an unreviewed sentence onto Home. The one
> deliberate drift (`bad_request`: "…question." vs "…question frame.") is fine — this client never sends a bad frame.
> answer FQ49 (Sober, 2026-09-13): **Accepted.** `TechChip`/`ChipRow` are display-only; a clickable chip is a button and the
> theme's default `Button` is the right primitive. No new colour, font or spacing — verified below.

## Review

**Verdict: DONE — 2026-09-13, Sober.** Read all five new files and the three edits against SPEC-007 §Frames / §Frontend /
D9 / D11 / D12, then re-ran every DoD line myself on the stub. **Zero requests reached `https://ai.develyst.online`** —
`back/` ran only against stub 3997 or with that port closed; SPEC-007 ledger stays `0 / 30`.

- **Static (DoD 1–3):** `npx tsc --noEmit` 0; `npm run build` exit 0, "Compiled successfully", 10/10, no warning, `/` 7.3 kB.
  `ai.develyst.online` in `.next` → 0 files · `STEP: ` in `.next` → 0 · `localStorage|document.cookie` under `Home/` → 0.
  The baked URL in `page-*.js` is `ws://localhost:3001/ws` — `back/`'s, never the gateway's (D11). `HomeAsk.tsx`: every
  visible string imports from `Ask.config.ts`; the eight server sentences equal `back/src/gateway/messages.ts` verbatim
  (`bad_request` deliberately shortened, FQ48); `STARTER_CHIPS` = SQ34's two, verbatim.
- **Theme rule (D12, SPEC-001):** every colour in `HomeAsk.module.css` is a `--mantine-*` / `--site-*` token, all of which
  exist in `theme.ts` / `globals.css` and are used by other modules; `margin-top: 48px` and `max-width: 68ch` are the exact
  values in `HomeCapabilities` / `AboutExperience` / `ProjectModal`; the rem font sizes follow the 30 existing uses;
  `site-numeric` is the global class `HomeStats` / `HomeCapabilities` use. At 360 the Ask `GlassPanel` measures 320 × pad 40
  — identical to `HomeCapabilities`' panel. Nothing new was introduced.
- **Placement (D12, Q46):** `HomeContent.tsx` diff = one import + one `PageSection` between `<HomeHero />` and the stats;
  `HomeHero*` untouched (`git status`). `index.ts` = one export. `README.md` = the env table, accurate on `wss://`.
- **Hook read (`useAskSocket.ts`):** opens on first submit only (no socket on load), reuses while `OPEN`; 5 s timer →
  `never_opened`; close while `connecting` → `never_opened`, while `running` → `dropped`; `interrupt()` marks every non-`done`
  step; `answer` renders only from an `answer` frame (R5) and a `done` with no answer is reported as a failure, never shown
  as an answer; unknown `type` / bad shapes ignored; unknown error `kind` → `bad_response`. Unmount closes the socket. Matches
  SPEC-007 §Frames incl. the FQ42 amendment (no `done` after `busy`/`bad_request` — the client handles both as terminal).
- **Integration (DoD 4), my own run** — stub 3997 / `back/` 3001 on fixtures (`/health` profile+projects `true`) /
  `next start -p 3004` on the fresh build, driven through the DOM (the pane does not paint here either):
  happy: `Running… / Waiting / Waiting` at 1 s → step 1 badge `deepseek · deepseek-flash · 636 ms`, step 2 `Running…` at
  3.2 s → three badges + the answer + `Sources` = `/about → Skills`, `/portfolio → YodBarber Queue Booking` (2 links; the
  D6-dropped third never appears); chips, input and submit all disabled while busy, `Asking…` label, back to `Ask` after.
  `stub:none` → three badges, the not-covered answer, hint linking `/contact`. `stub:offtopic` → step 1 badge, 2–3
  `Waiting`, boundary sentence, **0 links**, no failure panel.
- **The three failures (DoD 5), reproduced live, not just seen in your pictures:** (2) stub killed → all three `Interrupted`,
  "The AI gateway could not be reached.", H1 text + `/about` `/portfolio` `/contact`, `Try again` enabled, 0 answer blocks.
  (1) `back/` down → "The assistant could not be reached." after 2.5 s (Chrome refuses the closed port before the 5 s timer —
  your UNVERIFIED note on the timer path stands; it needs a black-hole host, which QA can do with a firewall-dropped port).
  (3) `stub:slow` + `taskkill` on `back/` at ~3 s → step 1 keeps its badge, 2–3 `Interrupted`, "The connection dropped before
  the answer was finished.", **0 answer blocks**, `Try again`. Your six `f1/f2/f3-*.png` show the same states.
- **Phone (DoD 6, AC-h):** at 360×740, `scrollTop 0`: hero bottom **741**, section top **741**, `innerHeight` 740 — the
  first fold is the hero alone, unchanged; `scrollWidth` 360; chips stacked (238 px, wrapping), input row one column.
- **`git status` (DoD 7):** `?? back/` + the five new `front/` files + `HomeContent.tsx` / `index.ts` / `README.md` + TASK-021's
  five. Nothing committed by anyone. All my processes stopped; 3001 / 3004 / 3997 freed; 3000 (foreign) never touched.

Nothing to rework. Two observations for QA's round, no action here: (a) `happy-final-desktop.png` catches the submit button
mid-transition (loader over a clipped "Ask") — in the DOM the button is `Ask` and enabled at the end, so it is a capture
instant, not a state; (b) the 5 s `never_opened` timer path is UNVERIFIED by both of us — stated, not hidden.
