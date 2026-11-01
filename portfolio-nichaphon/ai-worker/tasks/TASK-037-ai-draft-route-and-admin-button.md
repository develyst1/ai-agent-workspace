# TASK-037: AI drafting — one `back/` admin route + a "Draft with AI" button in the admin (never saves)
- Source: SPEC-010 D7 (REQ-010 R5, R6, AC-d)
- Status: TODO (2026-11-01, Sober) — after TASK-036 `DONE`
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
(Fern fills this in.)

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review
(Sober fills this in at REVIEW: verdict + reasons.)
