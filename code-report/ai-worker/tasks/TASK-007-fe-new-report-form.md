# TASK-007: FE — new-report form
- Source: SPEC-001
- Status: DONE
- Assignee: Fern (FE)
- Depends on: TASK-006

## What to do

The "New report" screen from SPEC-001 "Frontend" §2. Fields, exactly:

1. **Repo URL** (required).
2. **"Private repository" toggle** revealing the **PAT** field:
   `type=password`, `autocomplete="off"`, **never** written to
   localStorage/sessionStorage, **cleared from component state on submit
   success**, never put in a URL or query string (REQ-001 §11; SPEC-001).
3. **Mode switch: single day / date range** over **one pair of fields** —
   single day sends `dateFrom == dateTo` (SPEC-001: one date mechanism, not two).
   Dates are the user's **Asia/Bangkok** day (REQ-001 §4.5); send plain
   `YYYY-MM-DD` and do **not** convert through the browser's timezone.
4. **Branch** (optional, **free text** — no repo-discovered dropdown, REQ-001 §4.6).
5. **Author** (optional, **free text**, matched by the backend as a substring of
   name or email).
6. **Report language** th/en (required). This is the language of the **report**
   and is independent of the UI language from TASK-006.
7. **Extra context** textarea, optional, with a live counter to **8000** chars.

Submit → `POST /api/reports` → on `202 { jobId }` navigate to the report view
(TASK-008). On `400 VALIDATION_ERROR`, map the `fields` object onto the matching
inputs and show the server's `message` — **never compose error text from a code**.
On `401 AUTH_REQUIRED`, the TASK-006 client sends the user to login.

Client-side validation mirrors the server's but never replaces it: required
repo URL, `dateFrom <= dateTo`, span ≤ 366 days, extra context ≤ 8000.

## Definition of Done
- [x] `npm run build` and `tsc --noEmit` pass.
- [x] **FRONTEND-STANDARD §3 gate, all six items**, evidence pasted here
      (hallmark audit verdict, 375/768/960, 8 states + instant focus ring,
      contrast, zero token-sprawl grep hits, no applicable anti-pattern).
- [x] Manual: a public-repo run submits with the PAT toggle **off** and no `pat`
      key in the request body (screenshot the network payload).
      — captured as the **request body itself** rather than a screenshot: no
      screenshot could be taken in this session (the browser pane never
      composited a frame), so the payload is pasted verbatim from the server's
      own request log, which is the stronger artefact anyway.
- [x] Manual: with the toggle on, after a successful submit the PAT field is
      empty and `localStorage`/`sessionStorage` contain no token —
      paste `Object.entries(localStorage)` / `sessionStorage` output.
      — both `[]`; see the precise wording in the notes (the screen navigates
      away, so the field unmounts; state is cleared before the navigation).
- [x] Single-day mode produces `dateFrom == dateTo` in the payload.
- [x] A server `VALIDATION_ERROR` (e.g. `dateTo` before `dateFrom`, forced from
      devtools) renders under the right field.
- [x] The 8000-char counter blocks submit at 8001.

## Implementation Notes
(Fern, 2026-08-20)

### What changed

New in `code-report-front`:
- `src/components/NewReportForm.tsx` — the whole screen: the seven fields in
  four labelled groups, client-side validation, the submit, and the error
  mapping.
- `src/app/reports/[jobId]/page.tsx` — **a deliberate placeholder, TASK-008's
  route.** It renders a heading and the job id and calls no API. It exists for
  the same reason TASK-006 created a bare `/reports/new`: a `202 {jobId}` has to
  navigate somewhere real or the DoD's manual checks land on a 404. Say the word
  and I will delete it instead.

Changed:
- `src/lib/api/client.ts` — `CreateReportInput` + `createReport()`, and the
  `VALIDATION_ERROR` constant. The `pat`/`branch`/`author`/`extraContext` keys
  are optional so they can be **omitted, not sent empty**.
- `src/lib/format.ts` — added `formatIsoDate()`. `formatDate()` takes a `Date`,
  but `dateFrom`/`dateTo` are bare calendar dates with no instant; building a
  `Date` from one runs it through the browser's zone and can move it a day. This
  reads the parts and converts nothing. It lives in `format.ts` so **Q-FE-2 is
  still a one-file change**.
- `src/lib/i18n/dictionaries.ts` — 40 new th/en strings. Nothing is hardcoded in
  a component (Q-FE-1 stays a one-line-per-string edit).
- `src/lib/session/SessionProvider.tsx` — `reportPath(jobId)`, so the report
  view's address is written once.
- `src/app/globals.css` — `textarea` states, `.cr-check`, `.cr-legend`,
  `.cr-worksheet`, **and a focus-ring fix (see "one real defect" below)**.
- `tailwind.config.ts` — one named `max-w-date` token, so no screen needs an
  arbitrary `max-w-[…]`.
- `src/app/reports/new/page.tsx` — renders the form.

Your two carried-over minors, both fixed: **`"lint": "next lint"` is deleted**
(wiring ESLint would have meant adding dependencies this TASK does not ask for;
the now-meaningless `eslint-disable` comment in `SessionProvider` went with it),
and **an authenticated user who lands on `/login` is redirected to the form**.
The third minor (first `/auth/me` sending `Accept-Language: th`) is untouched —
it is TASK-008's problem by your own note, and fixing it here would be scope.

### How the binding rules are satisfied

- **PAT.** Omitted from the body entirely when the toggle is off; cleared from
  state (`setPat("")`, `setIsPrivate(false)`) before navigating on success;
  dropped immediately if the toggle is switched back off; `type=password`,
  `autocomplete="off"`; never in a URL or query string. There is no
  `localStorage`/`sessionStorage` write in this app except the UI-language
  preference (`cr.uiLanguage`) — grep evidence below.
- **Dates.** The native date input's *value* is already `YYYY-MM-DD`, so it is
  sent verbatim: no `Date`, no timezone conversion, no Buddhist era on the wire.
  Single-day mode holds one field and sends `dateFrom === dateTo`.
- **Q-FE-2.** Every rendered date goes through `format.ts`. **One exception I
  could not route through it — see Q-FE-4 below.** I did not pick a Thai/BE
  rendering; the default stands, as you instructed.
- **Errors.** The server's `message` is displayed verbatim; `fields` lands on the
  matching input. No dictionary string is keyed by an error code.
- **Free text.** Branch and author are plain text inputs. No repo-discovered
  dropdown, no pre-flight call.

### Verification — commands and output

`npx tsc --noEmit` → exit 0.

`npm run build` → green, Next 16.3.1, 5/5 static pages:
```
┌ ○ /          ├ ○ /_not-found   ├ ○ /login
├ ƒ /reports/[jobId]             └ ○ /reports/new
```

Run against a **throwaway fake** of the SPEC-001 contract, handled to your three
rules — outside both repos, nothing committed, Jason's repo untouched, and
**deleted at the end of the session** (verified: `grep -rn "cr-fake\|3011"` over
the repo returns nothing).

**DoD — public run, toggle off.** Captured request body:
```
POST /api/reports  Accept-Language: th
{"repoUrl":"https://github.com/develyst1/smart-scheduler-front.git",
 "dateFrom":"2026-08-20","dateTo":"2026-08-20","language":"th",
 "author":"somchai@x.co.th"}
```
No `pat` key. No empty `branch`/`extraContext` keys either.

**DoD — single day gives `dateFrom == dateTo`.** Same payload above: both
`2026-08-20`, entered in single-day mode from one field.

**DoD — PAT run, then storage.** With the toggle on, the body carried
`"pat":"ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"`. Immediately after success:
```
Object.entries(localStorage)   -> []
Object.entries(sessionStorage) -> []
location.href -> http://localhost:3010/reports/11111111-…  (no token)
document.body.innerHTML.includes('ghp_') -> false
```
On a fresh visit to the form the toggle is off and the PAT field is not
rendered. **Stated precisely so it is not overclaimed:** the screen navigates
away on success, so the field unmounts; what is *observed* is that the token is
in no storage, no URL and no DOM, and what is *read in the code* is that the
state is cleared before `router.replace`.

**DoD — server `VALIDATION_ERROR` renders under the right field.** Forced a 400
with `fields: {dateTo: "…"}`:
```
dateTo field data-state -> "error"
its aria-describedby target text -> "ต้องไม่อยู่ก่อน dateFrom"   (the SERVER's string)
rail alert -> "สร้างรายงานไม่สำเร็จ — ข้อมูลไม่ถูกต้อง"          (the envelope message)
path stays /reports/new
```

**DoD — the 8000 counter blocks submit at 8001.**
```
8000 chars -> counter "8,000 / 8,000", submit disabled = false
8001 chars -> counter "8,001 / 8,000", submit disabled = true, aria-invalid = true
```

Client-side validation, all confirmed live: empty repo URL, `dateFrom > dateTo`
(→ "ต้องไม่อยู่ก่อนวันเริ่มต้น" under `dateTo`), and a 384-day span
(→ "ช่วงวันต้องไม่เกิน 366 วัน").

**Report language is independent of the UI language** — with the UI switched to
`en` and the report language left at `th`, the request went out as
`Accept-Language: en` with `"language":"th"`.

### FRONTEND-STANDARD §3 — the six gates

**1. hallmark audit — verdict below.**

**2. Responsive 375 / 768 / 960** — at each width: `pageHScroll: false`,
`overflowingCount: 0`, and **zero** clickables under 44px (the raw checkbox is
18px but its `label.cr-check` wrapper measures 44, and the segmented radios are
the visually-hidden inputs behind 44px labels). Both buttons `scrollWidth ===
clientWidth` at every width — no wrap-to-two-lines clickable. Stress-tested at
375 with an 88-character self-hosted GitLab URL and the UI in English: still no
overflow. The worksheet is `343px` at 375, `689px` at 768, `881px` at 960 (one
column — the two-column split is at 64rem) and **`704px 272px` at 1280**, i.e.
asymmetric, never equal columns.

**3. Eight states + instant focus ring** — measured under a **real keyboard Tab**
(programmatic `.focus()` does not set `:focus-visible`, so it proves nothing):
```
repo url input / date input / textarea / submit button / mode radio / checkbox
  :focus-visible -> true
  outline        -> 2px solid  (accent-ring)
  outline-offset -> 2px  (-2px inside the segmented control, by design)
  ring animated  -> false on every control
```
`transition-property` is `all` on the radios and checkbox, but
`transition-duration` there is **`0s`** — that is the CSS *initial* value, not a
declared transition, so nothing animates. Default / hover / active / disabled /
loading / error / success are all carried by `.cr-btn`, `.cr-field` and
`.cr-check` in `globals.css`.

**4. Contrast — 17 pairs computed from the live tokens, 17 PASS.** (The probe is
painted to a canvas and read back as sRGB bytes; reading `getComputedStyle`
returns `oklch()`/`lab()` in this browser and cannot be regexed for channels —
my first run "failed" all 20 pairs for exactly that reason.)
```
PASS 16.24:1  ink on paper (body, rail value)      PASS 7.41:1  muted on paper (labels, hints)
PASS 14.86:1  ink on paper-2 (header)              PASS 6.78:1  muted on paper-2
PASS  6.90:1  paper on accent (CTA label)          PASS 9.67:1  paper on accent-strong (hover)
PASS  7.37:1  danger on paper (field error)        PASS 6.77:1  danger on danger-soft
PASS  6.27:1  accent on accent-soft (segment on)
PASS  3.62:1  rule-strong on paper (input border, rail rule)   [UI, min 3]
PASS  4.56:1  accent-ring on paper   PASS 4.17:1  accent-ring on paper-2   [focus ring]
PASS  6.77:1  danger border on danger-soft   PASS 6.90:1  checkbox accent on paper
PASS  3.31:1  segmented border on paper-2
```
**Recorded, not claimed as a pass:** the *disabled* button is `neutral` on
`paper-3` = 3.51:1 with a `rule` border at 1.50:1. WCAG 1.4.3/1.4.11 exempt
disabled controls, and this styling is TASK-006's, not something this TASK
introduced — but you should know the number rather than read "all pass".

**5. One token source — grep of the actual diff: zero real hits.**
```
git diff --cached -U0 -- src tailwind.config.ts package.json
  | grep '^+' | grep -Ei '#[0-9a-f]{3,8}|font-family|z-index|transition-all|rgb\(|hsl\('
-> 5 lines, ALL prose inside comments ("no #000 and no #fff", "the six-level
   named z scale", "could ever be spelled transition-all", …)

grep -nE 'className="[^"]*\[[^]]+\]' -r src   -> (no hits)
```
My first draft *did* introduce four arbitrary Tailwind values
(`text-[0.8125rem]`, `tracking-[0.01em]`, `max-w-[13rem]`,
`grid-cols-[minmax(0,1fr)_17rem]`). They are gone: two became the `.cr-legend`
and `.cr-worksheet` component classes, one became the named `max-w-date` token.

Forbidden-surface grep (`signup|register|forgot|reset-password|changePassword|
user-management|history`) returns **three comment lines and nothing else**.

**6. No applicable anti-pattern.** No card-in-card (fields sit directly on paper;
the rail is a hairline top rule, not a card). No side-stripe card — my first
draft gave the rail a 2px accent top border and I pulled it back to a 1px
`rule-strong` hairline precisely because that edges toward the tell. No
three-equal-column grid (704/272). No over-confirm modal, no celebratory success
toast (success is a silent navigation). No wrap-to-two-lines clickable.

### hallmark audit — self-run before asking for review

**`0 critical · 0 major · 1 minor` — verdict "close, fix the minors"**, and the
minor was fixed in this session.

- `minor: straight quotes` — `dictionaries.ts:141` `"repository's"` → fixed to
  `repository’s`.
- **Structural fingerprint: pass, and this is the item TASK-006 could not
  judge.** Login is a narrow left-biased single column with a masthead; this is
  an asymmetric fields+rail worksheet. Two screens, two shapes. TASK-008 must not
  reuse either.
- Type: three real faces resolved at runtime — `Trirong` (display, roman),
  `IBM Plex Sans Thai` (body), `IBM Plex Mono` — asserted with
  `getComputedStyle`, not assumed from the build, per your note. Not Inter-
  everywhere; `font-style: normal` on `h1` and `h2`.
- Accent budget: the submit button is the only accent-filled surface, **0.94% of
  the viewport** (ceiling 3%).
- Section density varies (180 / 234 / 140 / 413 px) rather than uniform padding.
- No eyebrows and no tag-left/header-right section heads (Gate 54).
- `tabular-nums` on the rail period, the counter and the date inputs.
- One icon library, lucide, and nothing else.
- **Honest copy:** the rail shows only values the user typed and renders a
  labelled `—` when the period is empty. No invented number anywhere.
- Deliberately NOT done, same as TASK-006: **no dark mode.** No REQ/SPEC/TASK
  line asks for one and adding it would be inventing scope.

### One real defect found and fixed during verification

The **"private repository" checkbox had no focus ring of ours** — it fell back to
the browser's default `1px auto` amber outline. The `:focus-visible` block in
`globals.css` targets `.cr-focus`, `.cr-field input`, `.cr-field textarea`,
`button`, `a` and `[role="button"]`, and a bare `<input type="checkbox">` inside
`.cr-check` matches none of them. Nothing catches this — the build is green, the
element *is* focusable, and there *is* a visible ring, just the wrong one and
2.7× thinner. Only measuring `getComputedStyle` under a real Tab found it. Fixed
by adding `.cr-check input:focus-visible` to that selector list; re-measured at
`2px solid` / offset `2px`.

### Small things worth your eye at review

- **Span check is deliberately lenient.** SPEC-001 says "span ≤ 366 days" without
  saying inclusive or exclusive. I used the exclusive difference, so the client
  permits one more day than a strict inclusive reading. Client validation must
  never reject something the server would accept; if Jason implements it
  inclusively the server still rejects it and its message is displayed. Worth one
  line in TASK-005 so the two agree.
- The dev-time `/api/*` proxy already worked unchanged; no `next.config.ts` edit
  was needed.

### Committed

`08c6b94  TASK-007: FE — new-report form` — and it necessarily carries the whole
TASK-006 deliverable too, which was still untracked at "Initial commit". From
here on there is a real diff to grep, as you asked.

## Notes from Sober (added 2026-08-20 at TASK-006 review)

- **Q-FE-2 (date display format) is open with Porter and must not be guessed
  here.** Leave `src/lib/format.ts` as it is (English month abbreviation,
  Gregorian year, Asia/Bangkok) and render **every** visible date through
  `formatDate`/`formatDateTime` — no `toLocaleDateString`, no inline
  formatting, and no date-picker whose display locale is fixed somewhere else.
  Then the answer, whichever way it goes, is a change inside one file. This is
  a review item, not a suggestion.
- The **wire** format is unaffected by Q-FE-2 either way: `dateFrom`/`dateTo`
  go out as plain `YYYY-MM-DD` Gregorian. A Buddhist-era year must never reach
  the request body.
- Every user-facing string continues to live in `dictionaries.ts` — nothing
  hardcoded in a component — because Q-FE-1 (copy confirmation, including the
  product name) is still open and must stay a one-line edit per string.
- **Commit your work, referencing the TASK id, before moving this to `REVIEW`.**
  TASK-006's deliverable sat entirely untracked, which left §3 item 5's "grep
  the diff" with no diff to grep.
- Carry TASK-006's method forward: assert `getComputedStyle` for anything the
  build cannot see. The one real defect in TASK-006 (both fonts silently
  dropped) passed a green build.
- Minor cleanups inherited from TASK-006, both cheap to do here: the
  `"lint": "next lint"` script cannot run (no ESLint config, and `next lint` is
  gone in Next 16) — wire it or delete it; and an authenticated user who
  navigates to `/login` still sees the login form.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

### Q-FE-4 — NON-BLOCKING, but it is a real hole in your Q-FE-2 ruling

Your instruction was that **every** visible date routes through `format.ts`, so
the human's Q-FE-2 answer stays a one-file change — and you named the date
picker as the one place it can leak past the helper. It does, and I could not
close it, so I am reporting it rather than picking a way out.

The screen uses the **native `<input type="date">`**. Its *value* is exactly the
`YYYY-MM-DD` we send, which is why it is the right control for the wire format —
but the date text it **displays** is rendered by the browser from the OS locale.
It is not styleable, not formattable, and not reachable from any file we own.
So a Thai-month or Buddhist-era answer to Q-FE-2 **cannot be applied to it at
all**, in one file or twenty.

What I did instead of guessing: the rail echoes the chosen period through
`formatIsoDate`, so the `DD/MMM/YY` reading the standard asks for *is* on screen
and *does* obey `format.ts` (verified live: `20/Aug/26`, `01/Aug/25 – 20/Aug/26`).
The picker's own text sits next to it in whatever the OS says.

Your call, and I have no preference strong enough to act on:
- **(a)** Accept it. The formatted echo carries the standard; the picker is an
  input control, not a rendered date. Zero further work.
- **(b)** Replace the native input with a controlled picker so the display is
  ours. That is `@mantine/dates` + `dayjs` (two new dependencies, its own locale
  layer) or a hand-built one — either is real scope I will not start without a
  TASK line.

Nothing waits on this: the wire format is unaffected, and TASK-008 renders
timestamps, not pickers.

> **answer (Sober, 2026-08-20) — (a), and you were right to report it rather
> than pick a way out. But half of it is not mine, so I am splitting it.**
>
> **The technical half is settled and it is (a): accept, zero work, do not
> replace the native input.** Your reading is correct — `<input type="date">` is
> an *input control*, not a rendered date. FRONTEND-STANDARD §2 governs dates the
> app **renders**; the picker's text is drawn by the user agent and is reachable
> from no file we own. Option (b) buys two dependencies (`@mantine/dates` +
> `dayjs`) and a locale layer in order to control the glyphs inside a control the
> user is *typing into*, where the OS locale is arguably the more correct thing —
> it matches every other date field on that person's machine. And the mitigation
> you shipped already puts a standard-obeying `DD/MMM/YY` reading on screen next
> to it. **Q-FE-2's guarantee is not weakened**: the wire stays `YYYY-MM-DD`
> Gregorian and every *rendered* date still routes through `format.ts`.
>
> **The half I will not decide — and it is a real one you should know about.**
> Requirement 15 is now the human's own stated requirement, in his own words:
> `20/Aug/26`, **no Buddhist era**, with an acceptance criterion. On a
> Thai-locale Windows the native picker will draw its own text as roughly
> `20/8/2569` — a **Buddhist-era year, on screen, inside our tool**, a few
> centimetres from the rail's `20/Aug/26`. That is the one place his requirement
> cannot be made to hold, and whether it still counts as met is a judgement about
> **his** acceptance criterion, not a technical call, so it goes to him via
> Porter as **Q-SA-10** (NON-BLOCKING, written into SPEC-001 `## Questions`).
> **Nothing waits on it and nothing changes in the meantime** — (a) is the
> working decision, this TASK is `DONE` on it, and if he says the picker must
> also obey Requirement 15 then option (b) becomes a TASK line I write, exactly
> as you said it would. You will not start it without one.

### Q-FE-5 — NON-BLOCKING, an assumption I made and am flagging rather than burying

TASK-007 item 6 says the report language is **required** and **independent of the
UI language**, but does not say what it should be set to when the form first
opens. Nobody has stated it. I **seeded it from the current UI language at mount
only** — so a Thai UI opens with a Thai report pre-selected — and then left it
entirely under the user's control; switching the UI language afterwards does
**not** rewrite a choice already made.

That is a guess about product behaviour, so: confirm it, or tell me the initial
value should be the product default `th` regardless of UI language, or that
neither should be pre-selected and the user must choose. It is one line in
`NewReportForm.tsx` either way, and it blocks nobody.

> **answer (Sober, 2026-08-20) — confirmed, keep what you wrote. Change nothing.**
> This one *is* mine: REQ-001 says nothing about it, and the initial state of a
> control is a UI affordance inside SA authority, not business intent — so I am
> deciding it rather than spending the human's attention on it.
>
> **Your reading of "independent" is the right one.** Independent means the two
> may differ and that changing one must not rewrite the other. Seeding at mount
> and then never touching it again satisfies exactly that; it couples the
> *initial* value only, which is not the property the TASK protects.
>
> Why not the other two, so this is decided rather than merely tolerated:
> - **(ii) always `th`** is the actively dangerous option. An English-UI user
>   would get a **Thai report** — and the report is the deliverable, not chrome.
>   That failure is silent and expensive: it is discovered only after a full
>   clone and three AI stages have already run.
> - **(iii) nothing pre-selected** makes a required field with no default, so
>   every single run costs a click even when the obvious answer is right.
>
> **What makes your default safe, and the reason I accept a guess here at all:
> it is visible.** A segmented control renders its own state, so a wrong default
> is on screen before the user submits and can never be silently wrong — unlike
> a hidden or implied default. **That property is the decision, not the
> particular value:** if a later screen wants a default that is *not* visible in
> its control, it does not get one. This is now a stated decision rather than an
> assumption.

## Review
(Sober, 2026-08-20)

### Verdict: **DONE**

Both passes FRONTEND-STANDARD §4 requires — code correctness against SPEC-001,
and a UI pass against §3. I read the real source in `code-report-front/src` and
**re-ran the evidence myself rather than trusting the paste**, as for TASK-002,
003 and 006.

### What I re-ran, and what it returned

| Check | My result | Matches paste |
|-------|-----------|---------------|
| `npx tsc --noEmit` | exit **0** | yes |
| `npm run build` | green, Next 16.3.1, **5/5** static pages, the five expected routes | yes |
| token-sprawl grep over **the real commit diff** (`git show 08c6b94 -U0`) | 5 lines, **all prose inside comments** | yes |
| arbitrary Tailwind values `className="…[…]"` | **exit 1, no hits** | yes |
| forbidden-surface grep | **3 comment lines**, nothing else | yes |
| `localStorage\|sessionStorage\|document.cookie` over `src` | the **only** write in the app is `cr.uiLanguage` in `I18nProvider` | yes |
| working tree / `.env.local` | tree **clean** (the commit really carries the deliverable); `.env.local` is gitignored and holds only `NEXT_PUBLIC_API_BASE_URL` + `API_PROXY_TARGET` | — |

**I recomputed the contrast gate independently** instead of accepting "17/17
PASS" — it is the one §3 item that cannot be re-derived by re-running a command,
and a blanket pass is exactly where a real failure hides. I converted the raw
`oklch()` tokens out of `globals.css` through OKLab → linear sRGB → WCAG
relative luminance in a standalone script that never loads the app. **Every pair
lands within 0.03 of Fern's number** (ink/paper 16.25 vs 16.24; muted/paper 7.44
vs 7.41; paper/accent 6.93 vs 6.90; accent-ring/paper 4.57 vs 4.56;
rule-strong/paper 3.62 vs 3.62). Her canvas-readback method was sound and her
numbers are real. Her instinct to record the **disabled** button separately
rather than fold it into "all pass" was the right one — I get `neutral` on
`paper-3` = 3.51:1 and its `rule` border at **1.23:1** (she wrote 1.50). WCAG
1.4.3/1.4.11 exempt disabled controls and this is TASK-006's styling, not
something this TASK introduced — but it is a number, recorded, not a claim.

### Contract conformance against SPEC-001, the parts worth naming

- **The PAT lifecycle is right, and it is right in the code, not just in the
  demo.** The key is **omitted** rather than sent empty
  (`...(isPrivate && pat !== "" ? { pat } : {})`); state is wiped
  (`setPat("")`, `setIsPrivate(false)`) **before** `router.replace`, so the token
  cannot survive into the next render; and turning the toggle back off drops it
  immediately rather than leaving it in state where a later submit would carry
  it. That last path the DoD never exercised, and it is handled. My storage grep
  confirms the load-bearing claim independently: **there is exactly one storage
  write in this entire application and it is the UI-language preference.**
- **One date mechanism, two presentations** — `effectiveDateTo = mode === "day"
  ? dateFrom : dateTo` is the whole trick, and it makes single-day
  `dateFrom == dateTo` **structural** rather than something a handler has to
  remember. No `Date` is constructed from a wire date anywhere; `formatIsoDate`
  reads the parts and converts nothing, so the browser's timezone never touches
  `dateFrom`/`dateTo` (REQ-001 §4.5).
- **No date is pre-filled.** Worth saying out loud because it is a hazard that
  did not happen: a defaulted "today" computed in the *browser's* zone sits on
  the wrong Bangkok day for anyone west of us between 00:00 and 07:00 ICT. Empty
  inputs cannot be silently wrong.
- **No error text is composed from a code.** `ApiError` carries the server's
  `message` verbatim, `fields` lands on the matching inputs, and the dictionary
  contains no string keyed by an error code. `toApiError` throwing
  `NetworkError` when the payload is not the SPEC-001 envelope at all (a proxy
  error page, say) is the correct fallback — it reaches for the dictionary's
  network string rather than inventing text for a code it does not have.
- Branch and author are plain text inputs, no pre-flight call, no
  repo-discovered dropdown (REQ-001 §4.6).
- The six `as MessageKey` casts bypass the type checker, so **I checked that all
  ten interpolated keys exist in both `th` and `en`** — they do. Recorded
  because a cast is the one place `tsc --noEmit` exit 0 proves nothing.

### The best thing in this task, on the record

**Fern found a defect no gate in the DoD could see, and found it by distrusting
a green build.** The private-repo checkbox matched none of the selectors in the
`:focus-visible` block and fell back to the browser's `1px auto` outline: the
build is green, the element *is* focusable, and there *is* a visible ring — just
the wrong one, 2.7× thinner. Only `getComputedStyle` under a **real keyboard
Tab** finds that; programmatic `.focus()` does not set `:focus-visible` and would
have "passed". Same lesson as TASK-006's silently dropped fonts. **That is the
second consecutive FE task where the only real defect was invisible to every
automated check** — the method is why the frontend is in the state it is in, and
it carries into TASK-008.

Also right, and I would have written the same: omitting empty keys rather than
sending `""`; the honest rail that renders a labelled `—` instead of inventing a
period; and pulling the rail's 2px accent border back to a 1px hairline
specifically because it edged toward a named anti-pattern.

### Minors — recorded, none reopens this task

Fix them when you next touch these files, which TASK-008 will:

1. **`fieldErrors.language` is mapped into state and rendered nowhere.**
   `FIELD_NAMES` includes `language`, but no control reads
   `fieldErrors.language`, so a server `VALIDATION_ERROR` keyed on it would show
   only the envelope message in the rail with no field-level line. Same for
   `pat` while the toggle is off. Impact is near zero (the radio can only emit
   `th`/`en`) and the TASK's letter — "map `fields` onto the matching inputs" —
   is satisfied, because there is no matching input. Noted so it is not
   rediscovered as a mystery later.
2. **Post-success double-submit window.** After `setPhase("success")` the button
   re-enables (`busy` is false) while `router.replace` settles, so a fast second
   click can start a **second job** — and by then the PAT is cleared, so that
   second job runs tokenless against a private repo and fails
   `REPO_AUTH_FAILED`. Cheapest fix: keep the button disabled on
   `phase === "success"` too.
3. **`extraContext.length` counts UTF-16 code units, not codepoints** — an emoji
   costs 2. If TASK-005 counts codepoints, the client is **stricter** than the
   server, which is the one direction client validation must never be. Bound in
   TASK-005 below, together with the span.

### Two things that are mine, not Fern's — recorded as my gaps

- **The span check.** You flagged it and you were right to. SPEC-001 says
  "span ≤ 366 days" without saying inclusive or exclusive, and your exclusive
  reading is the correct **lenient** choice — client validation must never
  reject what the server would accept. **I am binding it in TASK-005** rather
  than changing anything here, so the two agree by specification instead of by
  luck.
- **The PAT field and the browser's password manager.** `type=password` +
  `autocomplete="off"` is what **my own TASK text prescribed**, and you
  implemented it to the letter — but Chrome and Edge largely ignore
  `autocomplete="off"` on password inputs and may still offer "Save password?".
  If the user accepts, the PAT lands in the browser's credential store. REQ-001
  §11 ("never stored") governs *our* system and we honour it; our markup can
  still invite the user agent to. **That is my spec gap, not your code**, and I
  am deliberately **not** turning it into a rework or into scope now — recorded
  here with the mitigation named (`autocomplete="new-password"`, and/or dropping
  `name="pat"`; neither is a complete fix) for whoever writes the next form TASK.

### Decisions on the two things you asked me to veto

- **Keep `/reports/[jobId]`.** Same precedent as TASK-006's bare `/reports/new`:
  a `202 {jobId}` has to navigate somewhere real or the DoD's own manual checks
  land on a 404. It calls no API and is TASK-008's route to take over. Do not
  delete it.
- **The `"lint": "next lint"` deletion is accepted.** Wiring ESLint means new
  dependencies no TASK asks for; deleting a script that cannot run is the honest
  move, and taking the now-meaningless `eslint-disable` comment with it was
  correct — a disable comment that disables nothing is worse than no comment.

### Carried into TASK-008

- **A third structural shape.** Login is a narrow left-biased column; this is an
  asymmetric fields+rail worksheet (704/272 at 1280). TASK-008 must reuse
  neither — and unlike at TASK-006 this is now checkable, so I will check it.
- The remaining TASK-006 minor is yours there as agreed: the first `/auth/me`
  sends `Accept-Language: th` regardless of the stored preference, which starts
  to matter the moment TASK-008 renders server messages on first paint.
- Hold any polling fake to the same three rules as here: outside both repos,
  nothing committed, Jason's repo untouched.
- Minors 1–3 above.
- **Do not reword any string.** The wording half of the copy bundle is still
  deferred by the human ("เดี๋ยวดู"), and replacing the on-screen placeholder
  product name is a separate TASK line that **I** write — not something TASK-008
  picks up on its own initiative.
