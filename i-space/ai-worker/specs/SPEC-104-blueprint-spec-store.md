# SPEC-104: Blueprint as the spec store — hand labels, requirements, full audit log
- Source: REQ-103 (Team A only)
- Status: DONE (2026-10-29 14:0x, Sober — SA, Team A) — TASK-107 and TASK-108 DONE (see each § Review)
- Repos read: `blueprint-back` on `atom` @ f60b934 and `blueprint-front` on `atom` @ e46322a, both `git status --short` empty, read 2026-10-29 by Sober.
- Gap basis: `maps/blueprint-gap-102.md` a2–a7, plus the owner's 11:41 items 1–3 (`DECISIONS.md`).

## Overview

| Who | What |
|---|---|
| BE (TASK-107) | Every write carries a typed name. Every non-spec write gets an audit row. Versions become hand labels with no gate. New `requirement` part kind. Project-wide history read. Migration and openapi re-emit. |
| FE (TASK-108) | Name prompt and cookie. Ready screen: label instead of ยืนยัน 100%, warning, label list, build link always on. Requirements page (add / edit / remove). Project-wide history page. `gen:api`. Try the product and report findings. |

Order: FE builds against this SPEC from the start. FE steps that need the real back end (`gen:api`, Playwright) wait for TASK-107 DoD 6 (openapi emitted).

## Design decisions `[SA-decided]` (each cheap to reverse at review)

- **D1 — A label is still a `versions` row.** Putting a label inserts a frozen snapshot row as today, carrying the typed label text. This keeps the seam working unchanged (REQ-103 AC-9): getVersion, versionsAfter, partContext, locate and the push all read `versions` (`back: src/projects/service.ts:125-135`, `src/seam/feed.ts:50`, `src/seam/context.ts:20`, `src/seam/locate.ts:37`, `src/projects/service.ts:121`). "No arbitrary splitting" holds because a row is only ever made by a person's label (AC-2). Whether CAW reads the latest spec instead is REQ-105.
- **D2 — No gate on a label.** The checks at `back: src/projects/service.ts:97-110` are removed from the label path: empty spec, nothing changed since the last label, stuck items, quiz missing / not 100% / stale. The front shows them as a warning only. Two labels on the same state are allowed: labels are tags.
- **D3 — Old confirmed versions stay readable as labels.** `label` is null on old rows, and the front shows them as `v{n}`. No data migration. `versions` rows stay immutable (`back: src/db/migrations/0001_db_rules.sql`), so the label is set only at insert and can't be edited later. REQ-103 asks for no label edit.
- **D4 — The "who" travels in a header, not in bodies.** `X-Blueprint-By: <encodeURIComponent(name)>` on every write. A header is used because one middleware then covers every write route, including the multipart source upload, without changing any body. It is percent-encoded because a Thai name is not a valid raw header value.
- **D5 — Spec changes keep their audit home (`change_sets`/`changes`), plus a `by` column. Every other write gets a new `audit_events` table.** Putting source, settings or label events into `change_sets` would be wrong. They would count as spec changes: they would flip `changedSinceLatest` (`back: src/seam/feed.ts:71`), make a quiz stale (`quizzes.base_change_sets`, `back: src/db/schema.ts:122`), and become undoable.
- **D6 — Requirements are the PM's, not the AI's.** `requirement` is not added to `MODEL_KINDS` (`back: src/interview/round.ts:27`), so the interview can read requirements but can't add or change them (guards at `:143,148`). `Interpreted owner 11:41 item 1 ("PM adds/edits by hand") as: the AI does not write requirements.` A removal through the chat still works when it carries the user's own quoted words (`round.ts:151`, the old team's rule for every person-stated part): that counts as the person's act. Ruled at the TASK-107 review, 2026-10-29 (finding 2).
- **D7 — A requirement stands alone.** No link kind may touch it, and the stuck rule `unlinked_part` skips it, so a requirement never makes the spec "stuck".

## API / Interface Design (blueprint-back; field casing is the contract)

### Who — `X-Blueprint-By`
- Required on every `POST`, `PATCH`, `PUT` and `DELETE` under `/v1/` **except** the seam's `POST /v1/projects/{projectId}/locate` (a read) and `POST /v1/projects/{projectId}/amendments` (CAW names itself in `from`; seam unchanged, AC-9).
- Value: `decodeURIComponent`, then trim; 1–100 characters; no NUL. Missing, undecodable or out of range → **400** `{ "error": { "code": "name_required", "message": "type your name first" } }` (the shape at `back: src/http/errors.ts:12-15`). Nothing is written.
- The decoded name is the `by` of every record that request writes.

### Labels — `POST /v1/projects/{projectId}/versions` (changed; not a seam route)
- Body: `{ "label": string }`, trimmed, 1–80 characters. `confirmedBy` leaves the body and is filled from `X-Blueprint-By`.
- Empty or whitespace → **400** `validation`, nothing saved.
- Removed from this route: the 409 refusals `nothing_to_confirm`, `already_confirmed`, `confirm_blocked`, `quiz_*`. Keep the 404 for an unknown project.
- 201 `{ "version": int, "label": string }`. The row is written as today (snapshot, summary, `quiz: freeze(latestQuiz) | null`), and `notifyConfirmed` still runs after commit (seam unchanged).
- `versions.last_change_set` becomes nullable, because a project with no change set can now be labelled.

### `GET /v1/projects/{projectId}/labels` (new)
200 `{ "labels": [{ "version": int, "label": string | null, "labelledAt": string, "by": string }] }`, newest first. `labelledAt` = `confirmed_at`, `by` = `confirmed_by`.
The seam responses (`GET …/versions/{version}`, `GET …/versions`) are **not** changed: no `label` field is added to them, so CAW's parsing can't break.

### Requirement part kind
- `PART_KINDS.requirement = { prefix: "REQ", body: z.strictObject({ text: z.string().min(1).max(4000) }) }` (`back: src/spec/registry.ts:7-69`). Also add `REQ` to the hard-coded `KEY_RE` at `back: src/spec/keys.ts:3`. Missed in the first cut; found by Jason, TASK-107 Q1. Without it, one requirement breaks `loadSpec`'s sort. `title` = the short name; no link rule names it.
- Written through the existing `POST /v1/projects/{projectId}/change-sets` (`part.add` / `part.update` / `part.remove`, `back: src/spec/types.ts:54-68`) with `cause: { kind: "operator" }`. The front sends `origin: { stamp: "operator", date }`.
- `src/spec/stuck.ts`: `unlinked_part` skips `kind === "requirement"`.

### Audit
- `change_sets.by text NULL` (null only on rows from before this change). `applyChangeSet` and `undoChangeSet` take `by`. A round's change set gets the name of the person who sent the round, and a wrong quiz mark gets the marker's name.
- `messages.by text NULL` — set on the `user` rows a round writes.
- New table `audit_events`: `id uuid pk default gen_random_uuid()` · `project_id uuid not null → projects` · `at timestamptz not null default now()` · `by text not null` · `action text not null` · `entity text not null` · `before jsonb null` · `after jsonb null`. Index on `(project_id, at)`. Each row is written **in the same transaction** as the change it records.

| action | entity | before → after |
|---|---|---|
| `project_create` | `project` | null → `{ name, theme }` |
| `settings` | `project` | `{ model, creativity }` → `{ model, creativity }` |
| `source_add` | `source:<id>` | null → the source as `GET …/sources/{id}` returns it, **plus `text`** |
| `source_refetch` | `source:<id>` | the old row incl. `text`, `sha256`, `storedAs`, `status`, `reason` → the new one. The old original stays on disk: storage is content-addressed by sha (`back: src/sources/store.ts:13`); BE confirms nothing deletes it. |
| `label` | `label:<version>` | null → `{ version, label }` |
| `quiz_start` · `quiz_ask` · `quiz_mark` | `quiz:<id>` | null → `{ … }` (what was added or marked) |

### `GET /v1/projects/{projectId}/history?limit=` (new; limit 1–500, default 200)
200 `{ "entries": [{ "at": string, "by": string | null, "kind": string, "entity": string, "op": string, "before": unknown, "after": unknown, "changeSetId": string | null }] }`, newest first.
It merges one entry per `changes` row (with `kind` = the change set's `cause_kind` and `op` as `partHistory` computes it, `back: src/spec/store.ts:225-248`) with one entry per `audit_events` row (`kind` = `action`, `op` = `action`, `changeSetId` = null).
`GET …/parts/{key}/history` entries gain `by: string | null`. That route is not a seam route.

### Test-only seam for a local link (REQ-103 Q1 from QA)
- `BLUEPRINT_LINK_TEST_ALLOW=<host>:<port>[,<host>:<port>…]` — an exact list of addresses that the private-address refusal (`back: src/sources/link.ts:81-91`, `isPrivateAddress` `:58`) lets through, matched on host **and** port.
- Honoured **only** when `DATABASE_URL` starts with `pglite:`. With any other database the variable is ignored, and a line `[link] test allow-list ignored` is logged once. So it can never open a real deployment to local addresses.
- Unset or empty means behaviour exactly as today. Redirect targets are checked the same way (`:3`).
- QA's recipe for AC-5's "re-fetch a failed link":
  1. Start the back end with `BLUEPRINT_LINK_TEST_ALLOW=127.0.0.1:4295`.
  2. Add the link `http://127.0.0.1:4295/page` while nothing listens there. It fails ("network").
  3. Serve a page on :4295 and re-fetch it. The new text is in `after`; the failed row (status, reason) is kept in `before`.
- Test: one unit test per rule (allowed only on the list, only with pglite, a redirect out of the list refused).

### Not changed (AC-9)
`GET /v1/projects/{projectId}` · `GET …/versions/{version}` · `GET …/versions?after=` · `GET …/parts/{key}/context` · `POST …/locate` · `POST …/amendments` · the `CAW_NOTIFY_URL` push body.

## Data Model — one new drizzle migration (`bun run db:generate`, plus SQL by hand if needed)

```sql
ALTER TABLE versions ADD COLUMN label text;
ALTER TABLE versions ALTER COLUMN last_change_set DROP NOT NULL;
ALTER TABLE change_sets ADD COLUMN by text;
ALTER TABLE messages ADD COLUMN by text;
CREATE TABLE audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id),
  at timestamptz NOT NULL DEFAULT now(),
  by text NOT NULL, action text NOT NULL, entity text NOT NULL,
  before jsonb, after jsonb
);
CREATE INDEX audit_events_project_at_idx ON audit_events (project_id, at);
```
Existing rows: the new columns are null and nothing is backfilled (D3). The DDL fires no row trigger, so the `versions_immutable` trigger is untouched. Who runs it on a real DB: the owner, never an engineer. Engineers run it only on `pglite:memory` in tests.

## Front (blueprint-front)

- **Name:** one core-owned control that shows the current name or asks for it, placed through the shell's `tools` slot (as `ExportButton`, `front: src/core/render/ProjectPage.tsx:44,54`), plus the home page's create-project form. Stored in cookie `bp_by` (`encodeURIComponent`, path `/`, 1 year).
  - Every server action that writes reads it with `cookies()` and sends `X-Blueprint-By`. With no name it returns a `name_required` result without calling the back end, and the UI opens the prompt ("พิมพ์ชื่อคุณก่อน ระบบจะบันทึกว่าใครแก้"). A back-end 400 `name_required` maps to the same result.
  - Writes today: `front: src/features/chat/actions.ts:30-99`, `src/features/ready/actions.ts:25-62`, `src/app/actions.ts:16`, plus the new ones.
- **Ready screen:** "ยืนยัน 100%" is replaced by "ใส่ป้าย version" and a text field (placeholder in REQ § Wording).
  - Warning before saving when stuck > 0 or the quiz is not complete (Q1 below for the wording split). An empty label shows "ต้องตั้งชื่อป้ายก่อน" and nothing is sent.
  - A label list from `GET …/labels`: text (null → `v{n}`), Thai date, by.
  - "ส่งไปสร้างที่ CAW" is **always enabled**. With a label, the href is as today with the newest label's `version` (`front: src/features/ready/load.ts:142-146`). With none, it is `${CAW_URL}/start?project=<id>` (Q2 below).
  - `GateCode` (`front: src/features/ready/contract.ts:7`) changes, and every theme's ready page follows (clean-blue, minimal-mono, luxury-gold, default).
- **Requirements page:** a new `PageId` `"requirements"` (`front: src/core/theme/contract.ts:8`, `src/core/model/build/common.ts:10,15`), rendered by the core's default page. A theme may add its own later.
  - It lists requirement parts (title + text) and offers "เพิ่ม requirement", edit and remove, via `POST …/change-sets`.
  - Add `"requirement"` to the front's `PartKind` (`contract.ts:9`). Every exhaustive switch on kind must compile.
- **History page:** with no part selected it shows the project-wide history from `GET …/history`, titled "ประวัติการแก้ทั้งหมด". Each row shows who, when and what (before → after summary). The per-part view gains `by`. `HistoryEntryVM` gains `by` (`contract.ts:83`).
- **Words:** all new text comes from the REQ-103 § Wording table, through the existing words files. FE invents no wording.
- **Required items:** the new controls get `data-required` entries, so `check-required` covers every theme.

## Guardrails (both TASKs)

- G1 Git: none. Leave reviewed code in the working tree. The SA commits later, only on the owner's own "ขึ้น git".
- G2 `bun install --frozen-lockfile`; no new dependency without asking the SA.
- G3 Allowed now, because this REQ changes code: `openapi:emit`, `db:generate`, `gen:api`. **Still forbidden:** `db:create`, `db:migrate` (real DB), `check-required --extra-theme`.
- G4 No live gateway: never set `BLUEPRINT_GATEWAY_LIVE`, and use `GATEWAY_URL=http://127.0.0.1:9` or the tests' stub. No Claude CLI.
- G5 `DATABASE_URL=pglite:memory`, `CAW_NOTIFY_URL` empty, `HOST` empty.
- G5b (added 2026-10-29 12:5x, SYSTEM-FACTS § Environment 12:54) — `blueprint-back/.env` now holds a **remote TEST DB** `DATABASE_URL` and a `PORT`, and Bun loads `.env` by itself.
  - **Every** `bun` command run in blueprint-back for this SPEC (`test`, `dev`, `run src/index.ts`, `db:generate`, `openapi:emit`) is prefixed with `DATABASE_URL=pglite:memory` and, when it serves, an explicit `PORT=`.
  - Never `cat`, print, log or paste `.env` or its values.
  - The remote test DB is **not used in this SPEC** `[SA-decided]`: the tests and the walkthrough run on pglite, and the migration is **not** applied there. When and whether to apply it to the test DB is decided after QA, with the git step.
- G6 Ports: back 4200 / 4299 / 4298, front 3100, stub 4296. Never 4500 or 3500 (CAW). Stop what you start; `ss` shows them free at the end.
- G7 Only the TASK's file list. A file not on it → `## Questions` first.

## AC → work

| AC | Covered by |
|---|---|
| AC-1 label + warning | TASK-107 (route, labels list) + TASK-108 (field, warning, list) |
| AC-2 no label by itself | TASK-107 test: an edit after two labels adds no `versions` row |
| AC-3 build always clickable | TASK-108 (link) — Q2 |
| AC-4 requirement add / edit / remove + audit | TASK-107 (kind, stuck skip) + TASK-108 (page) |
| AC-5 five records with "โด่ง" | TASK-107 (audit_events + history) + TASK-108 (header, history page) |
| AC-6 name first | TASK-107 (400 `name_required`) + TASK-108 (prompt, no call) |
| AC-7 empty label | TASK-107 (400) + TASK-108 (message, no call) |
| AC-8 regression | both: full suites green, with the counts pasted |
| AC-9 seam | TASK-107: seam route tests unchanged and green; seam responses byte-for-byte as before for an old version |
| AC-10 requirements on overview + PDF (amended 2026-10-29, Q6) | TASK-108 rework item 4 |
| AC-11 name button "{ชื่อ} · เปลี่ยนชื่อ" (amended 2026-10-29, Q6) | TASK-108 rework item 3 |
| Owner "try the product" | TASK-108 DoD: a walkthrough, with findings to the SA → PM as questions |

## Risks / assumptions

- The CAW side was not read (Team B's repos). AC-9 rests on "the seam's routes and shapes don't change". The only seam-adjacent behaviour that changes is that `versions` rows can now be made with no gate, so CAW may see more versions. Inferred to be harmless; QA's TEST-101 #14 re-run settles it.
- Existing back-end tests that assert the confirm refusals (`quiz_*`, `confirm_blocked`, `already_confirmed`) must change. BE lists each one it changes, with the reason "REQ-103 D2", in Implementation Notes. A test changed without that line is REWORK.
- Front unit tests and `check-required` counts will move. FE pastes the before and after numbers.

## Questions (to the PM — non-blocking; the default applies until answered)

- **Q1 (wording)** — The warning sentence names both: "ยังมี {n} จุดค้าง และ quiz ยังไม่ครบ …". When only one applies, the default is to show only that half, plus the tail: "ยังมี {n} จุดค้าง — ใส่ป้ายได้ แต่ spec อาจยังไม่พร้อม" / "quiz ยังไม่ครบ — ใส่ป้ายได้ แต่ spec อาจยังไม่พร้อม". Correct me if the PM wants other words.
- **Q2 (AC-3 with no label)** — The button is clickable. With no label, the default is that it opens CAW's `/start?project=<id>` with no version. Today's CAW then says "ลิงก์นี้ไม่ครบ ต้องมีโปรเจกต์และเวอร์ชัน" (`maps/caw.md` /start table) until REQ-105 makes CAW read the latest spec. Alternative: the button is clickable but says "ใส่ป้ายก่อน" and stays on the page. Which one does the owner want for now?
  > answer (Q1): default accepted; EN halves added to REQ-103 § Wording. (Q2): default accepted — open CAW `/start?project=<id>` with no version. Interpreted `DECISIONS.md` 11:41 item 2 ("กดได้เสมอ") as "always leads to CAW"; the temporary "ลิงก์นี้ไม่ครบ" in today's CAW closes with REQ-105, and the owner is the only user now. Cheap to reverse. — Porter (PM) 2026-10-29 `[PM-decided]`
