# TASK-037: AI drafting — one `back/` admin route + a "Draft with AI" button in the admin (never saves)
- Source: SPEC-010 D7 (REQ-010 R5, R6, AC-d)
- Status: **DONE** (2026-11-01, Sober — see §Review; 1 real call. Was REVIEW 2026-11-01, Fern)
- Depends on: TASK-035 `DONE` (TASK-036 for the post body button)
- Owner: Fern (FE)

**Steps 1–4 make zero real calls (stub). Step 5 makes ONE real call, on SPEC-010 §Call ledger row 1–2 (written by Sober before
any fire).** No git write.

## Contract

`POST /admin/api/draft` — behind the same flag + `requireAdmin` + `application/json` rule as every admin route.
Request `{ "field": string, "note": string, "current"?: string }` — `field` = a label such as `projects[].summary` (for the prompt's
length/shape hint only, never trusted as a path); `note` 1–2000 chars, any language; `current` ≤ 4000 chars.
Response `200 { "draft": string, "provider": string, "model": string }` · bad body → `400 { error: "invalid", path }` · gateway
failure → `502 { error: <SPEC-006 kind>, message: <its fixed sentence> }`. **The route writes nothing** — no document, no post, no log content.

Prompt (server-side, `back/src/admin/draft.ts`; wording yours within these rules): write **English** whatever the note's language
(R6); plain text, or Markdown only when `field` is a post body; use **only facts present in the note or the current text** — never add a
client, number, date, skill or name; keep it the length the field implies; no preamble. One `askGateway` call, `temperature 0.4`,
`max_tokens 1024`, no retry. Log line: `[admin] draft field=<field> note_len=<n> ok|fail kind=<k> provider=<p> tokens=<…>` — never the text.

## What to do

1. `back/src/admin/draft.ts` + the route in `routes.ts` (registered with the others). Tests (stub gateway, zero real calls): valid →
   200 with the stub's text; `note` empty / > 2000 → 400; no flag → 404; foreign Origin → 403; stub `all_failed` → 502 with SPEC-006's
   sentence; the store is byte-identical before/after a draft (no write); the log line has no note text.
2. `admin/`: a **"Draft with AI"** button beside every `text`/`longtext` field and the post body. It opens a panel: a note box (Thai or
   English — say so in the placeholder), "Draft", the result in an editable box, **"Use this"** (copies into the field, unsaved — the
   unsaved dot appears) and "Discard". Loading and the 502 sentence shown in the panel. The panel never calls Save.
3. Stub run: `back/` with `GATEWAY_BASE_URL` at the stub → draft for `projects[].summary` → "Use this" → the field holds it, the store
   does not (`GET /admin/api/documents/projects` unchanged) until Save.
4. Pictures of the panel (empty, loading, result, error) in `../project-docs/fe-task037-2026-11-01/`.
5. **ONE real call** (ledger row 1, cap 2): `back/` on defaults (real gateway), the admin's Draft on `projects[].summary` with this
   Thai note, verbatim: `เพิ่มว่าระบบนี้รองรับผู้ใช้หลายภาษา` and the current summary of one existing project. Record the draft text,
   provider/model, and whether it is English and adds no new fact. Do **not** press "Use this" on it. Stop.

## Definition of Done

- [ ] 1. `cd back && bun test` green (paste before/after); `bunx tsc` 0; `cd admin && npx tsc --noEmit` 0.
- [ ] 2. Step 3 evidence: the `GET` before and after "Use this" identical (paste a hash of each).
- [ ] 3. Step 5: the `[admin] draft … ok` line + the draft text pasted; `calls` = 1 (2 only if the first was a technical failure — say which).
- [ ] 4. `git status --short`: `back/src/admin/{draft,routes}.ts`, `back/test/…`, `admin/**` only. Servers stopped.

## Implementation Notes
Fern, 2026-11-01. Repo `portfolio-nichaphon-web` on `D1` @ `b068fba` (uncommitted tree from TASK-028…036, as found). No git write.

**Files (closed list).** New: `back/src/admin/draft.ts`, `back/test/draft.test.ts`, `admin/src/components/DraftAssist.tsx`.
Edited: `back/src/admin/routes.ts` (import + `POST /admin/api/draft`), `admin/src/lib/api.ts` (`requestDraft`, `fieldLabel`,
failure kind `gateway` = 502 + back/'s sentence), `admin/src/components/FieldInput.tsx` (button under every `text`/`longtext`),
`admin/src/components/Posts.tsx` (button under the body, field `posts[].bodyMd`). Throwaway harness: `tests/harness/task-037/shoot.mjs`.

**DoD 1.** `cd back && bun test`: before **85 pass / 0 fail**, after **95 pass / 0 fail** (+10 in draft.test.ts: valid → 200 stub
text + 1 call; note ""/blank/2001 → 400 `note`, 2000 ok; bad field / current / extra key / not JSON → 400 with path, 0 calls; text/plain
→ 415; foreign Origin → 403 `admin_bad_origin`; flag off → 404; `all_failed` → 502 `gateway_error` + SPEC-006 sentence; store dump
(all 3 tables) identical before/after; log lines exact, no note / current text). `bunx --package typescript@5 tsc --noEmit` → exit 0 in
`back/` and `admin/`; admin `bun test` 13 / 0. ⚠️ plain `bunx tsc` now resolves typescript@latest (the native preview) and panics on
a missing `lib.d.ts`, so I pinned 5 (5.9.3, bun's cache only; nothing installed in the repo).

**DoD 2 (step 3, stub, `GATEWAY_BASE_URL=http://127.0.0.1:3999`, seeded scratch store):** draft on `projects[].summary` → "Use this" →
the field holds `"OK"` (stub text) and the Projects nav shows the unsaved dot (`04-after-use-this-unsaved.png`).
`GET /admin/api/documents/projects` sha256 before `dc0b78ff6c47925eea266ad45f0e60821a5b22b2d268c401f684a08bf5bf9214`, after
**the same**.

**Step 4 pictures** in `project-docs/fe-task037-2026-11-01/` (headless Chrome, 1280×900): `01-panel-empty` · `02-panel-loading`
(request held 4 s in the browser by `page.route` → continue, the response is back/'s own) · `03-panel-result` · `05-panel-error`
(back/ pointed at a closed port → real `unreachable` → "The AI gateway could not be reached.", log `fail kind=unreachable`) ·
`06-panel-768` (0 px horizontal overflow; no phone check, per TASK-035 note 7) · `07-real-draft-result`.

**DoD 3 (step 5, ONE real call, ledger row 1):** back/ on the real gateway (`https://ai.develyst.online`), admin on, one press of Draft
on Learning Curve's summary with the note verbatim; "Use this" NOT pressed.
`[admin] draft field=projects[].summary note_len=35 ok kind=- provider=deepseek tokens=333/264/597`
Provider/model: **deepseek / deepseek-flash**. `calls` = **1** (no failure, no second call). Draft text, verbatim:
> A Thai-language web application that pairs an AI helpdesk chat with a learning dashboard, and supports multilingual users. Learners get generated lessons, quizzes and an AI chat; administrators get a knowledge base, a dashboard and skill management. A NestJS backend exposes authenticated learning, quiz, chat, Knowledge Base and Skill Radar APIs over PostgreSQL through Prisma. Lesson, quiz and chat generation call a separate AI gateway, and each caller holds a fallback response for when that gateway does not answer.

English: yes. New facts: none. It is the current summary word for word plus ", and supports multilingual users" (the note).
My reading only; AC-d's judgement is QA's.

**DoD 4.** `git status --short` for my work = the 7 files above (inside `back/src/admin/`, `back/test/`, `admin/**`). Every other entry
was there before I started. Servers 3998/3999/4014/4015 stopped and free; scratch store deleted; no `back/data/`; browser pane closed.

**FE decisions (internal; please overrule any):**
1. `field` is validated: 1–200 chars, `[A-Za-z0-9_.[\]]` only (so it cannot carry prompt text into the system/user message or the log);
   only the keys `field`/`note`/`current` are accepted (as `/ask` does). A blank (whitespace-only) note = 400 `note`.
2. Every gateway kind → **502** `{ error: <kind>, message }`, as the contract says, so `unreachable`/`timeout` are 502 here, not
   SPEC-006's 503/504 used by `/ask`.
3. Log line keeps the contract's shape on both outcomes: ok → `kind=-`; fail → `provider=- tokens=-`. No gateway `detail` logged.
4. Markdown only for the field label `posts[].bodyMd`. The length hint comes from the label: title/name/label/heading/eyebrow/role →
   "a short title"; post body → "a full blog post body"; otherwise "about as long as the current text" or "one to three sentences".
5. `current` is sent only when the field is non-empty; the panel sends the field's live (possibly unsaved) text.
6. "Discard" and "Use this" both close the panel and clear note + draft; a new Draft press replaces the shown draft.
7. Panel strings I wrote (admin-only, owner-facing): placeholder "What should it say? Write in Thai or English — the draft comes back in
   English." (the TASK asked for this message), "Note", "Draft" (result label), "Edit it here before using it · <provider> <model>",
   "Drafting…" (role=status for screen readers). Change any, one line each.

**Audit (`/impeccable audit`, panel only, numbers measured headless):** a11y 3 · perf 4 · responsive 4 (768 / 1280; desktop-only
admin) · theming 4 (no hex, no new token) · anti-patterns 4 → **19/20**. Measured: labels 16.5:1, inputs 15.5:1, note placeholder 7.6:1,
description 8.1:1, error line red-text; every button 44 px tall; Tab order toggle → note → Draft → draft box → Use this → Discard.
- **P1 fixed:** the theme's `filled` button is white on violet `rgb(164,136,255)` = **~2.5:1** (fails AA). Draft now uses `light`
  (same as "Use this", 17.3:1).
- ⚠️ **P1, not mine (not in the closed list):** the same `filled` variant is the admin's **Save** button and the Posts editor's Save
  (TASK-035/036), so their enabled state has the same ~2.5:1. One theme line or `variant` change; your call.
- P3: disabled Draft (empty note) 3.3:1, which WCAG exempts for disabled controls.

**Observation for Sober (visible to the owner, so not decided by me):** "every `text` field" literally puts the button under
`id`, Name, Email, Location, Nickname and so on (see `01-panel-empty.png`'s neighbours). Drafting an id or an e-mail with AI is noise
at best and a broken slug at worst. Built literally. A one-line filter (e.g. skip `id`/email/url-like keys, or `longtext` + titles
only) is cheap if you want it.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review

**Verdict: DONE** (Sober, 2026-11-01). Zero real calls in review.
- Re-run: `back bun test` → `95 pass / 0 fail / 457 expect() calls / Ran 95 tests across 11 files`; `bunx --package typescript@5 tsc
  --noEmit` → 0 in `back/` and `admin/`. Read `back/src/admin/draft.ts`: three keys only, `field` restricted to a label charset (no
  prompt text through it), English-only + "only facts in the note or current text" rules, one call, no retry, returns — never writes; log
  content-free. Contract met.
- Step 3: store hash identical before/after "Use this" — the "never saves" guarantee, proven. Step 5: **1 real call**, English, the
  current summary + the note's clause, nothing invented (your reading; AC-d's verdict is QA's). Ledger row 1 = 1, row 2 released.
- **`bunx tsc` note — accepted and adopted:** plain `bunx tsc` now pulls a TypeScript preview that panics; every DoD of mine that said
  `bunx tsc` should read **`bunx --package typescript@5 tsc --noEmit`** from now on.
- Your 7 calls — **all accepted** (#2 every gateway kind → 502 matches the contract I wrote).
- ⚠️ 1 (filled Save ~2.5:1 in the admin) and ⚠️ 2 (Draft button under id/e-mail/etc.) — both right, both outside your list →
  **TASK-041** (admin polish). Whether the public site's `filled` buttons (Hero CTA, Contact, Services CTA, Ask) share that contrast is
  **UNVERIFIED** — they use the same theme; QA measures them in the REQ-010 round, not a change now.
