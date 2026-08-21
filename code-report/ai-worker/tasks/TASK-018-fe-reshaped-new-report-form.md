# TASK-018: FE — the re-shaped new-report form (branch list, committer list, one date range)
- Source: SPEC-003
- Status: **DONE — reviewed 2026-08-21 by Sober at `f70fb02`**; all gates re-run,
  the client/server contract re-derived from the real backend, Q-FE-23/24/25/26
  all ruled. Evidence in `## Review`.
- Assignee: Fern (FE)
- Depends on: **TASK-017** (the two endpoints) and **TASK-019** (the values that
  arrive on the way back). Blocks TASK-020.
- Written: 2026-08-21 by Sober (SA Lead)

## Carried in from the TASK-019 review (2026-08-21) — read before you start

1. **The handoff is written by TWO writers now, and that is the ruling, not an
   accident** (Q-FE-20): `NewReportContent` writes the six values just before
   `router.push`, and `ReportViewContent` rewrites the same six as soon as it has
   the job. One payload, one reader — `takeRetryParams` still removes it as it is
   read. Do not "tidy" one of them away; the form-side write is what covers the
   window before the first poll, and it was falsified by measurement, not chosen.
2. **A restored branch/committer string is not evidence the branch still
   exists** (SPEC-003, 4a ∩ 1a). The TASK-019 review made that case real: the
   handoff can now arrive at a form reached by a route that is not "back"
   (Q-FE-21, ruled: acceptable, lifetime unchanged). Apply the restored values as
   a **pending selection** after the list loads; submit stays gated on a loaded
   list.
3. **Comment-only correction, take it while you are in the file:**
   `src/lib/storage/retryParams.ts`'s header comment still says the handoff is
   "written on the click, read once on the form's next mount". After TASK-019
   neither writer is on a click. **Fix the comment; change no code in that
   module.** (Fern was right not to open it in TASK-019.)
4. ~~**Q-SA-20 is open and NON-BLOCKING**~~ **Q-SA-20 is ANSWERED 2026-08-21 —
   "เก็บด้วย" = YES, the free-text extra-context box comes back too** (REQ-004
   Requirement 4b). **So it is now part of this TASK — see §5 below**, which has
   been rewritten for it. My "one line in each writer" costing at the TASK-019
   review **was wrong**; the corrected shape and the reason are in SPEC-003
   §Questions → Q-SA-20 and in §5. Still true: **no new string, no API change, no
   new dependency, and the PAT is not restored.**

## Why this exists

REQ-004 Requirements 1, 1a, 2, 2a, 3 and 6 — the stakeholder's own list about the
screen he lands on after login. Design and the reasons: **SPEC-003 §"Flow — the
re-shaped form"** and §"Decision 2". Read them first.

**This is the release of SPEC-002 freeze item 4, and only three clauses of it.**
Still frozen inside that item: the ≤366-day span, the `YYYY-MM-DD` wire values,
the PAT field's rules, extra context and the report-language field.

## What is on the screen today (read 2026-08-21 at `1f90b87`)

`NewReportContent.tsx` holds all state; `NewReportFields.tsx` draws the four
sections; `NewReport.config.ts` holds `Mode`/`isMode`, `MAX_SPAN_DAYS`,
`FIELD_NAMES`. Branch and author are free-text `TextInput`s in the *Filters*
section (`NewReportFields.tsx:263` and `:281`), the period is a
`SegmentedControl` day/range plus one or two `TextInput type="date"`.

## What to do

### 1. Branch — a loaded list, and the gate (Requirements 1, 1a)

- An explicit **load-branches action** next to the repository URL. **Not** a fetch
  on keystroke, not on blur: one deliberate action, so the user is never charged
  for a request they did not ask for.
- On success the branch `Select` fills and is **pre-selected to `defaultBranch`**
  when the server returned one; the rest of the form (period, committer, extra
  context, language, submit) **unlocks**.
- On failure the server's own `error.message` is shown **verbatim** (SPEC-001 —
  never compose text from a code) and the rest stays **locked**. There is **no
  typed-branch fallback** (Q27, and it is the one thing about this screen the
  stakeholder answered with a full sentence).
- `branches: []` → the same locked state with its own line (see the string table).
- The `Select` is **not** editable and **not** creatable.
- **Invalidation, because a stale list is worse than none:** changing the
  repository URL, or the private toggle / token, drops a loaded list and re-locks
  the form. The list belongs to one repository and one credential.
- Send `pat` only when the private toggle is on and the field is non-empty — the
  same rule the submit body already follows.

### 2. Period — one range control (Requirements 2, 2a, 3)

- **Delete the single-day / range switch outright**, and with it `Mode` /
  `isMode` / the `mode` state and the `effectiveDateTo` mirror. Two
  `TextInput type="date"` inputs presented as **one range**.
- **Pre-filled today → today** on first mount (2a). "Today" is the browser's
  local calendar day formatted `YYYY-MM-DD` — no timezone conversion, no `Date`
  round trip through UTC.
- **A small row of relative presets** (Requirement 3 — "ให้ง่ายกว่านี้"). Three,
  and no more, each of which just sets the two dates: **today**, **last 7 days**,
  **last 30 days** (each ending today). Three is a judgement call and it is mine:
  a preset row that needs scrolling is the same complaint again.
- **The span rule does not move:** ≤366 days, client bound **exactly** the
  server's exclusive one (366 accepted, 367 rejected), `YYYY-MM-DD` on the wire.
  Keep `MAX_SPAN_DAYS` in `NewReport.config.ts` as the single client constant.
- **No new dependency** — `@mantine/core` + `TextInput type="date"` only
  (SPEC-002 Decision 3.4 as amended; `@mantine/dates` needs `dayjs`, which
  Q-SA-12 declined).

### 3. Committer — a loaded list, on demand (Requirement 6)

- A `Select` that **opens on "everyone"** and a **load-the-list** action beside
  it. It never fetches automatically: that request is a clone, and a form that
  silently spends a minute before it will let you type is worse than the one he
  is complaining about (SPEC-003 Decision 2.2).
- Loading needs `branch`, `dateFrom`, `dateTo` — so the action is available only
  once a branch is chosen and the dates are valid.
- Each option shows the person and their commit count; **the value sent as
  `author` is the e-mail when the entry has one, else the name** (Decision 2.3 —
  `--author` is `--fixed-strings`, and an address is the narrower needle).
- **The exact shape you branch on, settled at the TASK-017 review 2026-08-21
  (Q-BE-19): `email` is always present and always a string, and a committer with
  no author e-mail arrives as `email: ""`** — never an omitted key, never `null`.
  So the rule above is one test: `email === "" ? name : email`. Do not write a
  second branch for `undefined`/`null`; the backend cannot produce them.
- **"everyone" sends no `author` key at all** — REQ-001's accepted empty-author
  behaviour, untouched.
- **Invalidate the committer list when the branch or either date changes**
  (Decision 2.1 — the list is range-scoped, so a date change makes it wrong).

### 4. Submit

**Disabled until a branch has been chosen from a loaded list.** Everything else
about the submit path is unchanged: same body keys, keys omitted rather than sent
empty, PAT wiped before navigating, and the `router.push` TASK-019 landed.

### 5. Coming back from a report (Requirement 4a, with TASK-019)

TASK-019 hands you `RetryParams` — `repoUrl`, `branch`, `author`, `dateFrom`,
`dateTo`, `language`, and **no `pat`**. Requirement 4a says the form is filled;
Requirement 1a says nothing proceeds without a **loaded** list. Both hold, so:

- restore `repoUrl`, the two dates and the report language directly;
- **restore the free-text extra-context box too — Requirement 4b, Q-SA-20 =
  "เก็บด้วย", answered 2026-08-21.** `RetryParams` gains **one** key,
  `extraContext: string`. It still gains **no `pat`**. Three things about it are
  measured facts, not preferences, and they are why this is not the two-line
  change I costed at the TASK-019 review:
  - **The API cannot give you this value.** `GET /api/reports/:jobId` returns
    `params` with exactly six keys (`src/reports/jobs.ts` → `jobResponse`;
    `ReportParams` in `src/types/api/main/report.ts`) and `extraContext` is not
    one of them. So **only the form-side writer** (`NewReportContent`, from the
    submitted body, just before `router.push`) can populate the key.
  - **The report-page writer must not destroy it.** `ReportViewContent` rewrites
    the *whole* payload from `job.params` as soon as it has the job, and
    `writeRetryParams` is a `setItem` — a plain "add it to the form-side writer"
    ships a value the next rewrite silently wipes. **The outcome is binding: a
    payload rewritten from `job.params` still carries whatever extra context the
    form put there. The mechanism is yours** (read-merge-write, or a writer that
    only touches the six keys it owns — I am not naming which; TASK-019's
    precedent).
  - **Do NOT add `extraContext` to the API `params` to make this easier.** That
    is a SPEC-001 contract change Q-SA-20 does not authorise, and it would put an
    8000-character field on every 2-second poll response. If you think the client
    cannot meet the outcome without it, that is a `## Questions` line to me.
  - `takeRetryParams` already coerces a missing string key to `""`, so an old
    payload restores an empty box rather than failing — keep that property.
- **remember** the restored `branch` and `author` as a *pending selection* and
  apply them **after** the corresponding list loads and only if the value is in
  it. The form stays locked until then, and **submit is still gated on a loaded
  list** — a restored string is not evidence that the branch still exists.
- Delete the old `setMode(retry.dateFrom === retry.dateTo ? "day" : "range")`
  line with the rest of `mode`.
- Do **not** add `pat` to `RetryParams`.

## New user-facing strings (Q-SA-19 — **APPROVED 2026-08-21, "ok"**)

~~Authored here for the single yes/no round in SPEC-003 §Questions.~~ **That round
is done: the stakeholder read these 12 strings (plus TASK-019's
`reports.view.back`) and answered "ok" — they are approved *as authored below*.**
Ship them exactly as written; **changing any of them is now a `## Questions` line
to me, not a judgement call**, and the wording is an `[x]` at review rather than
an open `[~]`. Adding keys is not a rewording of the Q14 bundle. **Change no
existing string**; the keys below go into **both** dictionaries in
`src/constant/text/dictionaries.ts`.

| Key | th | en |
|-----|----|----|
| `reports.new.branch.load` | `โหลดรายการ branch` | `Load branches` |
| `reports.new.branch.loading` | `กำลังโหลดรายการ branch` | `Loading branches` |
| `reports.new.branch.select` | `เลือก branch` | `Choose a branch` |
| `reports.new.branch.locked` | `โหลดรายการ branch ให้สำเร็จก่อน จึงจะกรอกส่วนที่เหลือได้` | `Load the branch list before filling in the rest.` |
| `reports.new.branch.empty` | `repository นี้ยังไม่มี branch จึงสร้างรายงานไม่ได้` | `This repository has no branches, so no report can be made.` |
| `reports.new.period.preset.today` | `วันนี้` | `Today` |
| `reports.new.period.preset.last7` | `7 วันล่าสุด` | `Last 7 days` |
| `reports.new.period.preset.last30` | `30 วันล่าสุด` | `Last 30 days` |
| `reports.new.author.everyone` | `ทุกคน` | `Everyone` |
| `reports.new.author.load` | `โหลดรายชื่อผู้เขียนคอมมิต` | `Load committers` |
| `reports.new.author.loading` | `กำลังโหลดรายชื่อ` | `Loading committers` |
| `reports.new.author.empty` | `ไม่พบผู้เขียนคอมมิตในช่วงเวลานี้` | `Nobody committed in this period.` |

- The **failure** line for either list is the server's `error.message`, not a
  string of ours — that is SPEC-001 and it is why there is no "could not load"
  key here beyond the locked/empty lines above.
- `reports.new.branch.hint` and `reports.new.author.hint` describe typing and are
  now false. **Rewording an approved string is not yours or mine** (freeze item
  10 / Q14): remove the two hints if the new controls make them redundant, or
  raise a `## Questions` line if you think replacement text is needed. Do not
  quietly rewrite them.
- `reports.new.mode.*` and `reports.new.date.day` lose their last reader when the
  switch goes. **Delete the keys with the control** and say so in
  `## Implementation Notes` — a dictionary key with no reader is dead code, and
  removing it is not a reword.

## Client wiring

- New types in `src/types/api/main/` (a `repos.ts` beside `report.ts`), exported
  through the existing barrel; one typed function per endpoint in
  `src/lib/api/api-main.ts`; a thin `src/services/repo.service.ts` in the shape
  of `report.service.ts`. Follow the layering that is already there — do not call
  `apiRequest` from a component.
- A `VALIDATION_ERROR` from either endpoint carries `fields`; map it onto the
  controls the same way the submit path already does.

## Boundaries

- **Freeze:** item 4, **four clauses now** (branch list, committer list, one range
  pre-filled today → today, **and the extra-context field's value restored on the
  way back** — the fourth added 2026-08-21 by Q-SA-20). **Everything else inside
  item 4 is still frozen**, including the extra-context field's optionality, its
  8000-character bound, its wire key and its label. Items 1, 2, 3, 5, 6, 7, 8, 9,
  10 stay frozen — including the copy bundle beyond the approved keys above.
  **Q32's wider licence (Requirement 7d) changes nothing in this file:** it lands
  in TASK-020 and that edit has not been written yet.
- **No redesign of the other screens**, and no re-theming of this one: TASK-012
  shipped its visual layer. The new controls speak the cobalt register already in
  `globals.css`; if a control needs a token that does not exist, ask first.
- **No new dependency at all.**
- **No backend change** — TASK-017 owns the endpoints. If you find the contract
  wrong, that is a `## Questions` line to me, not an edit in `code-report-back`.
- Requirement 7's wider usability licence is **TASK-020**, not this TASK. Fix what
  Requirements 1/1a/2/2a/3/6 name; write anything else down instead of doing it.

## Definition of Done
- [x] `npm run typecheck` exit 0.
- [x] `npm run build` green, listing **the same four routes**.
- [x] Repo-wide SPEC-002 gate still a real zero: **0 Tailwind colour utilities,
      0 font-family utilities** outside `globals.css`.
- [x] **Measured on a production build**, not reasoned (TASK-013's method; a
      throwaway local fake backend is fine — stop and delete it before you
      report, and say so):
      - [x] no branch list loaded → period, committer, extra context, language
            and submit are **all** unavailable, and no submit is possible;
      - [x] load fails → the **server's own message** is on screen and the form is
            still locked; there is **nowhere** to type a branch;
      - [x] `branches: []` → locked, with the empty line;
      - [x] load succeeds → `defaultBranch` is pre-selected and the form unlocks;
      - [x] changing the repository URL after a successful load re-locks the form;
      - [x] the period opens **today → today**; each of the three presets sets the
            two dates correctly;
      - [x] **366 accepted / 367 rejected** on the client, and the wire values are
            `YYYY-MM-DD` (show the request body, with no `pat` for a public run);
      - [x] committer left on "everyone" → the body has **no `author` key**;
      - [x] a picked committer → `author` is the e-mail where one exists;
      - [x] changing a date after loading committers invalidates that list;
      - [x] **no** single-day / range switch exists anywhere on the screen;
      - [x] back from a report page (both ways, TASK-019) → the form is filled and
            the branch is re-selected after the list loads, with the PAT empty;
      - [x] **the extra-context box comes back with its text (Q-SA-20), on both
            ways back, and — this is the part that can quietly fail — after the
            report page has had time to rewrite the handoff from `job.params`.
            Measure it with at least one poll having landed**, not by going back
            instantly.
- [x] **`RetryParams` gained exactly one key (`extraContext`) and no `pat`: show
      the type's diff.**
- [x] `grep` proof that the PAT is still never written to `localStorage` /
      `sessionStorage` and never enters a URL or query string — including in the
      two new requests.
- [x] The dictionary diff is **additions plus the deletions named above and
      nothing else**: show it.
- [x] `git status --porcelain` empty at the reported commit, and the hash in
      `## Implementation Notes`.
- [x] Name the files you changed and state which freeze items they could possibly
      affect.
- [x] Standing FE proxy rule honoured: set `API_PROXY_TARGET` **before**
      `npm run build`, and restore the env afterwards.

## Implementation Notes

Built 2026-08-21 by Fern (FE). Commit **`f70fb02`** on `develop`, tree clean.
`+773 / −183` over **12 files** (10 modified, 2 added).

### 1. Files changed, and the freeze items each could touch

| File | What | Freeze items it could possibly affect |
|------|------|---------------------------------------|
| `types/api/main/repos.ts` **(new)** | the two endpoints' wire shapes | none — new wire types only |
| `types/api/main/index.ts` | barrel `+1` line | none |
| `lib/api/api-main.ts` | `fetchBranches` / `fetchCommitters` | none — no existing call changed |
| `services/repo.service.ts` **(new)** + `services/index.ts` | the layering `report.service.ts` already uses | none |
| `types/app/reports/index.ts` | `RetryParams` **+1 key**, new `RunRetryParams` | item 4 clause 4 only |
| `lib/storage/retryParams.ts` | reader restores `extraContext`; **second writer** `writeRunRetryParams`; header comment corrected | item 4 clause 4; item 6 (checked: still no `pat` key) |
| `partials/ReportView/ReportViewContent.tsx` | one writer swapped, one comment | item 5 (polling) — **not touched**; nothing else on that screen |
| `partials/NewReport/NewReport.config.ts` | `Mode`/`isMode` removed; `ListPhase`, `todayIso`, `daysAgoIso`, `PERIOD_PRESETS`, `committerValue` added; **`MAX_SPAN_DAYS` untouched at 366** | item 4 clauses 1–3 |
| `partials/NewReport/NewReportContent.tsx` | list state, the gate, invalidation, restore-as-pending, submit body | item 4 clauses 1–4; item 6 (PAT) |
| `partials/NewReport/NewReportFields.tsx` | two `Select`s + two load actions, one range + presets, mode switch deleted | item 4 clauses 1–3; item 1 (visual layer — **no re-theme**, see §6) |
| `constant/text/dictionaries.ts` | **+12 keys ×2, −6 keys ×2**, nothing reworded | item 10 — see §3 |

### 2. Mechanism for Q-SA-20 (the part the TASK left to me)

`RetryParams` gained **exactly one** key, `extraContext: string`, and **no
`pat`** — the type diff is in §5. The outcome ("a payload rewritten from
`job.params` still carries whatever extra context the form put there") is met by
splitting the writer in two rather than by merging at the call site:

- `writeRetryParams(RetryParams)` — the **form-side** writer, all seven keys. It
  is the only writer that can produce `extraContext`, exactly as the TASK says.
- `writeRunRetryParams(RunRetryParams)` — the **report-side** writer, the six
  keys `job.params` actually has. It reads the stored payload, keeps its
  `extraContext`, and writes seven. The read is deliberately **not**
  `takeRetryParams` (that one removes the payload as it reads it).

`RunRetryParams = Omit<RetryParams, "extraContext">` makes the "the report page
must not write this key" rule a **type error**, not a comment. Nothing was added
to the API and no SPEC-001 contract was touched.

### 3. Dictionary diff — additions plus the named deletions, and nothing else

- **+12 keys in each dictionary**, the twelve of the table above, **character for
  character as approved** (Q-SA-19). No existing string was reworded.
- **−6 keys in each dictionary:** `reports.new.mode.label`,
  `reports.new.mode.day`, `reports.new.mode.range`, `reports.new.date.day` (they
  lost their last reader when the switch went, as the TASK says) **plus
  `reports.new.branch.hint` and `reports.new.author.hint`** — the two the TASK
  told me to remove *if* the new controls make them redundant. They do: both
  describe typing, and there is nothing to type in either control now. They were
  **removed, not replaced** — no substitute text was authored (freeze item 10).
- Full diff: `git show f70fb02 -- src/constant/text/dictionaries.ts` → `+26/−12`,
  which is 12+12 additions plus the two blank-line moves, and 6+6 deletions.

### 4. Measured on the production build (`npm run build` → `npm run start`)

Throwaway local fake backend, **outside the repo** at `~/.tmp-task018/`, driven
through the real screen in a browser. **It was stopped and the directory deleted
before this was written** — `netstat` shows both its ports free. It logged
request body **keys** only (plus report bodies with the token redacted).

| DoD row | Measured |
|---------|----------|
| no list → everything below locked | `dateFrom/dateTo/branch/author/extraContext` `disabled=true`, both language radios `true`, all three presets `true`, **submit `true`** |
| load fails → server's own message, still locked, nowhere to type | on screen: **"FAKE-SERVER: the remote refused the connection."** verbatim; submit still `true`; the only enabled inputs on the whole page are `ui-language`, `repoUrl`, `private` — **no branch text input exists** (`input[name=branch]` is Mantine's `type="hidden"` mirror) |
| `branches: []` → locked, empty line | "repository นี้ยังไม่มี branch จึงสร้างรายงานไม่ได้", submit `true` |
| success → `defaultBranch` pre-selected, form unlocks | `branch="main"`, every control above `disabled=false`, submit `false` |
| URL change after a load re-locks | `branch=""`, submit `true`, locked line back. **Also measured, same rule:** toggling `private` after a successful load re-locks it too |
| period opens today → today | `2026-08-21` / `2026-08-21` on first mount |
| the three presets | today `[21/08, 21/08]`; last 7 `[2026-08-15, 2026-08-21]`; last 30 `[2026-07-23, 2026-08-21]` — **inclusive of today** (see Q-FE-26) |
| **366 accepted / 367 rejected**, `YYYY-MM-DD` on the wire | 367 (`2025-08-19`→`2026-08-21`): "ช่วงวันต้องไม่เกิน 366 วัน", no request left the browser. 366 (`2025-08-20`→`2026-08-21`): submitted. Body: `{"repoUrl":"…","dateFrom":"2025-08-20","dateTo":"2026-08-21","language":"th","branch":"main","author":"ada@example.com","extraContext":"…"}` — **no `pat` key** on the public run |
| "everyone" → no `author` key | server log: `/api/reports keys=repoUrl,dateFrom,dateTo,language,branch,extraContext` — **`author` absent from the body entirely** |
| a picked committer → the e-mail | `author = "ada@example.com"`. The list also carried `No Email Person` with `email: ""`, whose value is the **name** — the one-test rule of Q-BE-19 |
| a date change invalidates the committer list | options went from `[ทุกคน, Ada Lovelace · 12, No Email Person · 3]` to `[ทุกคน]`, `author` reset to `""` |
| **no** single-day / range switch anywhere | `period-mode` absent from the DOM; regex over the rendered text for `วันเดียว\|ช่วงวัน\|รูปแบบช่วงเวลา\|Single day\|Date range\|Period mode` → **false** in both languages |
| back both ways → filled, branch re-selected after the list loads, PAT empty | **explicit control:** `/reports/new` with `repoUrl`, both dates and the extra context restored, `input[name=pat]` **not mounted**, `private` unchecked, form locked, handoff consumed (`sessionStorage` → `null`); loading the list then applied the restored branch (`branch="main"`) and only then did submit unlock. **Browser Back** (`history.back()` after a second run): identical result |
| **extra context comes back after a poll has landed** | see §5 — measured with a sentinel, not by going back instantly |
| PAT never in storage / never in a URL | after a **private** run: `Object.keys(localStorage) = []`, `Object.keys(sessionStorage) = ["cr.retryParams"]` whose payload has **no `pat`**; `location.href` contains no token; the fake server's whole log contains **0** occurrences of the token string. The token appeared in exactly three request **bodies** (`/repos/branches`, `/repos/committers`, `/reports` — `hasPat=true`), which is SPEC-003's stated consequence, not a new rule |

### 5. The Q-SA-20 measurement, done the way that can actually fail

Going back instantly proves nothing, so the report page's rewrite was forced:
with `/reports/job-1` open, `cr.retryParams` was overwritten by hand with
**sentinels in all six job-sourced keys** and `extraContext:
"SENTINEL-extra-must-survive"`, then the page was reloaded and given 2.5 s.

Result: `{"repoUrl":"https://github.com/o/good.git","branch":"main","author":"ada@example.com","dateFrom":"2025-08-20","dateTo":"2026-08-21","language":"th","extraContext":"SENTINEL-extra-must-survive"}`

Every sentinel in the six keys was replaced from `job.params` — so the rewrite
demonstrably ran — and `extraContext` survived it. A plain six-key `setItem`
would have produced `""` here. Going back then filled the box with the surviving
value. `takeRetryParams`' coercion is kept: a pre-TASK-018 payload has no
`extraContext` key and restores an empty box rather than failing.

### 6. Gates

- `npm run typecheck` → exit **0**.
- `npm run build` → green, **the same four routes** (plus `/_not-found`): `/`,
  `/_not-found`, `/login`, `ƒ /reports/[jobId]`, `/reports/new`.
- Repo-wide SPEC-002 token gate outside `globals.css`: **0 colour utilities**;
  the font grep returns **9**, and they are the **same nine known `--font-*`
  false positives** (`app/layout.tsx:22,28,35,42,59,60`, `lib/theme.ts:78,79,81`)
  — **no file this commit touched appears in either result**. The raw-colour grep
  outside `globals.css` returns the same **2** comment-text hits in
  `lib/theme.ts:148,153`, unchanged by this commit.
- No new dependency: `package.json` is **not in the diff**. The range is
  `@mantine/core` + `TextInput type="date"`; the two lists are `Select`.
- No token added to `globals.css` — the file is **not in the diff** either, so
  the new controls speak the cobalt register as it already stands.
- **Standing FE proxy rule:** the measurement build ran with
  `API_PROXY_TARGET=http://localhost:8099` set inline for that one command; the
  **final** build at `f70fb02` ran with no override, so it used the repo's own
  `.env.local` (`8080`) and the env is back where it started. `.env.local` was
  read, never written, and is gitignored.
- `git status --porcelain` **empty** at `f70fb02`; `git worktree list` shows only
  the main tree.

### 7. Two things stated rather than discovered at review

1. **A port was already in use and it is not mine.** Something is listening on
   `localhost:8080` — the value `.env.local` names for the backend. Before I
   noticed, my throwaway server's first start attempt sent **one** request to it
   (`POST /api/repos/branches`, no credentials), which it rejected with
   `AUTH_REQUIRED`. I then moved my fake backend to **8099** and every
   measurement above ran against that. **Nothing of mine ever connected to a
   database, ran SQL, or authenticated anywhere**, and I did not stop or touch
   that process (it is still listening).
2. **The committer `Select`'s option label is composed from data, not copy:**
   `` `${name} · ${commits}` ``. The TASK asks each option to show the person and
   their commit count and approved no string for it; a number and a separator are
   not a dictionary entry. If Sober wants that shape written down, it is a
   one-line answer.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

### Q-FE-23 — I changed code in `retryParams.ts`, which carried-in item 3 forbids. NON-BLOCKING (built; this is a review ruling)

Item 3 says *"Fix the comment; change no code in that module."* §5 — written
later, in the Q-SA-20 re-scope — requires `takeRetryParams` to restore
`extraContext` and requires a report-side write that does not destroy it. Both
land in that module, so the two instructions cannot both hold. I read §5 as the
later and more specific one and implemented it: the header comment is corrected
as item 3 asks, **and** the module gained the `extraContext` read plus the second
writer `writeRunRetryParams` (§2 above). **Nothing else in the file changed** —
same key, same `sessionStorage`, same take-and-remove, still no `pat`.
If you meant the mechanism to live in `ReportViewContent` instead, say so and I
will move it; it is the same few lines either way.

> answer (Sober, 2026-08-21): **Your reading is right and the conflict is mine,
> not a deviation of yours. Keep the mechanism exactly where it is.** Carried-in
> item 3 was written at the TASK-019 review, before Q-SA-20 was answered; §5 was
> written after it and is the specific instruction. Item 3's *intent* was "do not
> re-open a module this TASK has no business in" — §5 gave you business in it.
> The shape you chose is better than the one I would have named:
> `RunRetryParams = Omit<RetryParams, "extraContext">` makes the rule a compile
> error rather than a comment, and I verified the whole module diff — the key,
> the storage, the take-and-remove and the absence of `pat` are all unchanged.
> **Item 3 is hereby superseded; no move, no rework.**
>
> One consequence I am recording rather than leaving to be discovered, and it is
> not a defect of yours: **on a second round trip the extra-context box is the one
> value that does not survive.** form → report → Back (payload consumed and
> removed) → Forward → report (the page rewrites six keys, and the storage it
> merges from is now empty, so `extraContext` becomes `""`) → Back = every other
> field restored, the free-text box empty. That is the price of take-and-remove,
> which Q-FE-21 already ruled, plus the API's missing field, which Q-SA-20 refused
> to add. **Accepted as shipped** — the alternative re-opens a lifetime question I
> closed. Carried into TASK-020 as a named item, not as rework here.

### Q-FE-24 — Back leaves the *committer* on "everyone" until the list is loaded. NON-BLOCKING

§5 says a restored `branch`/`author` is a **pending** selection applied only
after its list loads. For the branch that is invisible (the user must load that
list anyway to proceed). For the committer it is visible: the committer list is
**never** loaded automatically (Decision 2.2), so a reader coming back sees
"ทุกคน" until they choose to load it, even though the run they came from had a
committer. That is the literal instruction and I did not deviate from it — but
Requirement 4a says "the form is filled", so I am naming the one field where
"filled" is deferred rather than letting you find it at review.

> answer (Sober, 2026-08-21): **Keep what you shipped. Naming it was the right
> call and it changes nothing today.** I checked the two alternatives before
> ruling, because "just show the old value" sounds free and is not:
> - *Auto-load the committer list on a restored handoff* — refused. That is a
>   metadata clone the reader never asked for, on a screen they may have come back
>   to in order to change the repository. Decision 2.2 exists for exactly this.
> - *Render the restored string as a synthetic `Select` option* — refused. Your
>   pending-selection rule (carried-in item 2) exists because a restored string is
>   **not evidence the person still has commits in that range**, and the range is
>   the one thing the reader is most likely to change on the way back. A synthetic
>   option would put an `author` on the wire that matches nobody, and the run would
>   come back `NO_COMMITS` with no explanation on screen.
> So the deferral is the honest behaviour, and `pendingAuthor` still applies the
> value the moment the list does load — verified in `NewReportContent.tsx`
> (`handleLoadCommitters`, the `committerValue(c) === restored` test). **Recorded
> as a known, deliberate gap against Requirement 4a**, not smoothed over: it is
> carried into TASK-020, where Requirement 7d explicitly licenses a behaviour
> change made for usability, with the reason written down. It does not go up to
> Porter — Q29 said the values come back and they do; *when* one of them becomes
> visible is a mechanism question, and mechanism is mine.

### Q-FE-25 — `reports.new.date.hint` and the definition of "today" now disagree. NON-BLOCKING for the build

§2 says "today" is **the browser's local calendar day**, and that is what
`todayIso()` computes. The surviving hint string says *"นับตามวันในเขตเวลา
Asia/Bangkok" / "Counted as the Asia/Bangkok day."* On a browser outside
Asia/Bangkok those two are different days, so the pre-fill and the hint can
contradict each other. **I changed neither**: the hint is approved copy (freeze
item 10 / Q14) and the "today" rule is your §2. Which one is wrong is your call,
and it needs no code from me until you answer.

> answer (Sober, 2026-08-21): **Neither is wrong, and nothing changes. They are
> statements about two different things, and I confirmed that in the backend
> rather than reasoning about it.** The hint describes how the two dates are
> **counted into commits**, and that really is a fixed zone: `readCommits` builds
> its `--since` / `--until` boundaries with `zonedBoundary(..., timeZone)` and the
> `timeZone` is `config.REPORT_TIMEZONE`, whose default is `"Asia/Bangkok"`
> (`src/config.ts:81`, `src/git/commits.ts:103-107`). So the hint is **true**, and
> replacing approved copy is not mine anyway (freeze item 10 / Q14). §2's "today"
> governs only the **pre-filled default value** — no wire semantics — and the
> local-getter build is right for that: a `toISOString()` round trip shifts the
> default by a day every evening in Asia/Bangkok, which is the failure that
> actually bites the stakeholder.
> **The one real consequence, bounded and written down rather than dismissed:**
> on a browser whose clock is not on the Asia/Bangkok day, the default range can
> be one day off the day the server will count — a wrong *default*, never a wrong
> *submission*, since the two dates go on the wire exactly as shown. Nobody on
> this project is on such a browser today. If that ever changes it is one question
> (which day should pre-fill), not a code change I am authorising now.
> **Parked as queue candidate; no edit to either the string or `todayIso()`.**

### Q-FE-26 — "7 วันล่าสุด" is built as **7 calendar days including today**. NON-BLOCKING

Q-SA-19 approved the **words**; the arithmetic behind them was not stated. I
read "7 วันล่าสุด / Last 7 days" as today plus the six before it (`dateFrom =
today − 6`), and "30 วันล่าสุด" as today − 29, so the label's number equals the
number of days in the range. The other reading (`today − 7`, an 8-day range) is
defensible; it is one constant in `PERIOD_PRESETS` if you prefer it.

> answer (Sober, 2026-08-21): **Your reading stands — keep `back: 0 / 6 / 29`.**
> The label carries a number, so the range it produces must contain that many
> days; "7 วันล่าสุด" giving eight days is the kind of small lie that turns into a
> support question. Your reading is also the one that cannot make the *other*
> bound wrong: `today − 6` can never be the day the ≤366 rule trips on. Recorded
> as a decision so the next person does not re-litigate it: **relative presets on
> this screen are inclusive of today.**

### Q-FE-27 (noted by Sober, no answer owed) — the committer option label

Your §7.2 point is right and needs no string: `` `${name} · ${commits}` `` is
**composed from data**, and a separator plus a number is not a dictionary entry
(same rule I ruled Q-FE-19 on — a derived, language-invariant token is design,
not copy). Written down here so it is a decision rather than an unexamined habit.

## Review

**Verdict: DONE** — reviewed 2026-08-21 by Sober at `f70fb02`. Nothing sent back.

**Every gate re-run by me, not read off her table:** `npm run typecheck` exit
**0**; `npm run build` green with **the same four routes** (`/`, `/login`,
`ƒ /reports/[jobId]`, `/reports/new`, plus `/_not-found`); the repo-wide SPEC-002
gate a real **0 colour utilities**, the font grep the **same nine known
`--font-*` false positives** (`app/layout.tsx`, `lib/theme.ts` — **no file this
commit touched appears**), the raw-colour grep the same **2** comment hits in
`lib/theme.ts`; `git status --porcelain` **empty**; `git show --numstat` the
declared **12 files, `+773/−183`**.

**Three checks the DoD did not ask for, because they are where this commit could
have gone wrong quietly:**

1. **The freeze/untouched diff prints nothing.** `git diff 32e8eed f70fb02 --`
   over `src/hooks/reports`, `src/context/session`, `src/app/globals.css`,
   `package.json`, `package-lock.json`, `src/services/report.service.ts`,
   `src/types/api/main/report.ts` and `src/app` returns **0 lines**. So freeze
   item 5's polling is byte-identical, `SessionProvider` was not opened (the
   Q-FE-21 bound holds), no token was added, and "no new dependency" is proof
   rather than a claim.
2. **The dictionary deletions are safe by construction, not by inspection.**
   `MessageKey` is derived from the `th` object and `en` is
   `Record<MessageKey, string>`, so a surviving reader of any of the six deleted
   keys — or a key present in one dictionary and not the other — is a **type
   error**. Typecheck is 0, so the six are genuinely dead and the two dictionaries
   are still key-for-key equal. Independently: `grep` for `reports.new.mode`,
   `date.day`, `branch.hint`, `author.hint` and `isMode` across `src` returns
   **no reader**, and the only `SegmentedControl` left on this screen is the
   pre-existing **report-language** control (`NewReportFields.tsx:384`) — the
   period switch is gone.
3. **The client contract was re-derived from the real backend, not from her fake.**
   A fake server proves the screen, never the contract, so I read TASK-017's code:
   `POST /api/repos/branches` → `{ branches, defaultBranch }` with
   `defaultBranch: string | null` (`src/git/lsRemote.ts:29-33`) and
   `POST /api/repos/committers` → `{ committers }` with
   `{ name, email, commits }` (`src/repos/routes.ts`) — both match
   `types/api/main/repos.ts` exactly. `branch`/`dateFrom`/`dateTo` really are
   **required** on the committers body (`validateCommittersBody`), which is what
   `canLoadCommitters` gates on. And the ≤366 bound is the **same number and the
   same comparison on both sides**: client `span > MAX_SPAN_DAYS` with
   `MAX_SPAN_DAYS = 366` (`NewReport.config.ts`), server
   `(to - from) / MS_PER_DAY > MAX_SPAN_DAYS` with `MAX_SPAN_DAYS = 366`
   (`src/reports/validate.ts:24,84`). Her 366-accepted / 367-rejected measurement
   is therefore the client agreeing with the server, not a coincidence.

**Read structurally rather than trusted from the harness:**
`unlocked = branchPhase === "ready" && branches.length > 0` is the single source
of the gate and it reaches **every** control below it plus `disabled` on submit
**and** an early `return` in `handleSubmit` — so the Enter key cannot get past the
gate either, which no DoD row asked for. The `Select` is `searchable={false}`,
so the "nowhere to type a branch" claim is a property of the control, not of a
screenshot. `invalidateBranches()` is called from **all three** of URL, private
toggle and token change and itself calls `invalidateCommitters()`, so a stale
list cannot outlive the credential it was fetched with. `patBody()` is the one
place the token can enter a body, and it is `isPrivate && pat !== ""` — the same
rule the submit path already had.

**Q-SA-20 accepted, and the mechanism is better than the one I would have named.**
`RetryParams` gained **exactly one** key (`extraContext: string`) and no `pat`;
`RunRetryParams = Omit<RetryParams, "extraContext">` turns "the report page must
not write that key" into a compile error. Her sentinel measurement is the right
test — the six job-sourced keys were demonstrably overwritten while
`extraContext` survived, which a plain six-key `setItem` could not have done.
`takeRetryParams`' coercion of a missing key to `""` is kept, so a pre-TASK-018
payload restores an empty box.

**Findings, both mine and neither a rework:** the **second-round-trip** loss of
the extra-context box (Q-FE-23's answer — accepted, carried into TASK-020) and
the **deferred committer** on the way back (Q-FE-24 — accepted, carried into
TASK-020 under Requirement 7d).

**Her §7.1 disclosure is closed with no action.** Something not hers is listening
on `localhost:8080`; one unauthenticated `POST /api/repos/branches` reached it and
was rejected `AUTH_REQUIRED`; she moved to 8099. No database was connected to, no
SQL run, nothing written and nothing to undo — the same shape as the TASK-010
probe, and the standing FE rule (set `API_PROXY_TARGET` **before** `npm run
build`) was honoured, with the env restored.
