# TASK-043: `.env.example` in back/, admin/, front/ — every key the code reads, one purpose line each
- Source: CLAUDE.md rule 4 (Marie ORDER 54, 2026-11-01) — `[PM-decided]` GO, Porter 2026-11-01 (no REQ; rule compliance)
- Status: REVIEW (2026-11-01, Fern) — was TODO (2026-11-01, Sober)
- Depends on: none
- Owner: Fern (FE)

**Docs only. Zero real calls. No git write. No real value invented** — example values are the code defaults below, or empty.
Files (closed list), repo `portfolio-nichaphon-web`, `D1` @ `00fe101`:
`.gitignore` · `back/.env.example` (new) · `admin/.env.example` (new) · `front/.env.example` (new — replaces `front/env.example`,
which you delete) · `back/README.md` (§Environment only).

## Why

Rule 4 now says a repo's `.env.example` lists **every** key the code reads, each with one line saying what it is for. Today the code
reads 14 keys and the only example file (`front/env.example`) lists 1, with no purpose line. Nothing is broken (every key has a code
default) — this is so the owner can fill env without reading code.

## The keys (read by Sober from the code, 2026-11-01 — `grep -rn "process.env" back/src back/scripts admin/src front/src`)

| File | Key | Code default (source) | Purpose (write it in your own words, one line) |
|---|---|---|---|
| back | `PORT` | `4014` (`back/src/config.ts:53`) | port back/ listens on |
| back | `GATEWAY_BASE_URL` | `https://ai.develyst.online` (`:56`) | the owner's LLM gateway; point at the stub (`bun run stub`) for local work |
| back | `GATEWAY_ATTEMPT_TIMEOUT_MS` | `15000` (`:59`) | per-provider-attempt timeout sent to the gateway |
| back | `GATEWAY_CLIENT_TIMEOUT_MS` | `60000` (`:62`) | our own deadline around the whole call |
| back | `GATEWAY_MAX_TOKENS` | `512` (`:65`) | default `max_tokens` |
| back | `GATEWAY_PROVIDER` | unset (`:68`) | pin a provider; empty = gateway chooses |
| back | `GATEWAY_MODEL` | unset (`:71`) | pin a model; only with `GATEWAY_PROVIDER` |
| back | `KNOWLEDGE_DIR` | `back/knowledge` (`:74`) | folder with PROFILE.md + PROJECTS.md |
| back | `DATA_DIR` | `back/data` (`:77`) | content store `site.db` + `media/` |
| back | `ADMIN_ENABLED` | off (`:80`, exactly `"1"` = on) | turns on the admin write API; local only, never on the server |
| back | `ADMIN_ORIGIN` | `http://localhost:4015` (`:83`) | the one browser origin allowed to call `/admin/api/*` |
| back | `ASK_WS_URL` | `ws://localhost:4014/ws` (`back/scripts/ws-client.ts:11`) | target of `bun run ws-client` (dev script only) |
| admin | `NEXT_PUBLIC_ADMIN_API_URL` | `http://localhost:4014` (`admin/src/lib/api.ts:7`) | where the admin app calls back/ |
| front | `CONTENT_API_URL` | `http://localhost:4014` (`front/src/lib/content.ts:133`) | where the site reads content from back/ (server side) |
| front | `NEXT_PUBLIC_ASK_WS_URL` | `ws://localhost:3001/ws` (`front/src/constant/ask.ts:6`) | Home "Ask" WebSocket; baked in at build |

Rules for values:
- Empty and unset behave the same for every key (`config.ts:41`, `:48`; `ADMIN_ENABLED` empty = off), so a key with no safe default
  is written `KEY=` (empty). Use empty for `GATEWAY_PROVIDER`, `GATEWAY_MODEL`, `KNOWLEDGE_DIR`, `DATA_DIR`, `ADMIN_ENABLED`.
- `NEXT_PUBLIC_ASK_WS_URL`: keep the value already in `front/env.example` (`wss://dns.develyst.online/ws`) — it is not invented, and
  the 3001-vs-4014 question is TASK-028's (BLOCKED, SQ40); do **not** touch `ask.ts`.
- Purpose = a `#` comment line directly above each key. Group back/'s keys under `# --- gateway ---`, `# --- content + admin ---`,
  `# --- dev scripts ---` if you like; nothing more.

## What to do

1. `.gitignore`: directly under the `.env*` line add `!.env.example` (so the three files can be committed; real `.env*` stay ignored).
2. Write `back/.env.example`, `admin/.env.example`, `front/.env.example` with the keys above — every key, nothing else.
3. Delete `front/env.example` (its one line moves into `front/.env.example`).
4. `back/README.md` §Environment: replace the "There is **no `.env` file** … documented here" sentence (lines 28–30) with one that says
   the keys and their purposes are in `back/.env.example`, copy it to `back/.env` to override; keep the table but add the 3 missing
   rows (`DATA_DIR`, `ADMIN_ENABLED`, `ADMIN_ORIGIN`). Nothing else in the README.

## Definition of Done

- [ ] 1. `git check-ignore -v back/.env.example admin/.env.example front/.env.example` → **no output** (base today: all three ignored by
      `.gitignore:41:.env*`); `git check-ignore -q back/.env; echo $?` → `0` (still ignored).
- [ ] 2. Every key is listed: for each app, the key set from
      `grep -rhoE "process\.env(\.[A-Z_]+|\[\"[A-Z_]+\"\])" <app>/src <app>/scripts` plus `back/src/config.ts`'s names equals the
      `^[A-Z_]+=` set in that app's `.env.example`. Paste both sets per app (back 12, admin 1, front 2).
- [ ] 3. Every key line has a `#` purpose line directly above it (paste the three files in full).
- [ ] 4. No behaviour change: `back/` `bun test` → same count as on `00fe101` (run it first, paste both); `bunx --package typescript@5
      tsc --noEmit` → 0 in `front/` and `admin/`. No source file touched.
- [ ] 5. `git status --short` → exactly: `M .gitignore`, `M back/README.md`, `D front/env.example`, `?? back/.env.example`,
      `?? admin/.env.example`, `?? front/.env.example`. No `.env` created; zero calls.

## Implementation Notes
Fern, 2026-11-01. Repo `portfolio-nichaphon-web`, `D1` @ `00fe101`, clean tree before. No git write, zero calls, no `.env` created, no
source file touched, no value invented (code defaults, or the one value already in `front/env.example`, or empty).

**Files.** `.gitignore`: `!.env.example` directly under `.env*` (line 42). New `back/.env.example`, `admin/.env.example`,
`front/.env.example`; `front/env.example` deleted. `back/README.md` §Environment: the "no `.env` file" sentence is replaced by one pointing
at `back/.env.example` and `back/.env`, and the table gains `DATA_DIR`, `ADMIN_ENABLED`, `ADMIN_ORIGIN`. Nothing else changed.

**DoD 1.** `git check-ignore back/.env.example admin/.env.example front/.env.example` → no output, exit 1 (none ignored).
(`-v` prints `.gitignore:42:!.env.example` for each: that is the negation rule matching, not an ignore.)
`git check-ignore -q back/.env; echo $?` → `0`; `front/.env.production` is still ignored too.

**DoD 2.** Code set (`grep -rhoE "process\.env(…)" <app>/src <app>/scripts` + `config.ts`'s `str/num` names) vs `^[A-Z_]+=` in the file:
- back (12): `ADMIN_ENABLED ADMIN_ORIGIN ASK_WS_URL DATA_DIR GATEWAY_ATTEMPT_TIMEOUT_MS GATEWAY_BASE_URL GATEWAY_CLIENT_TIMEOUT_MS
  GATEWAY_MAX_TOKENS GATEWAY_MODEL GATEWAY_PROVIDER KNOWLEDGE_DIR PORT`, the same in both → EQUAL
- admin (1): `NEXT_PUBLIC_ADMIN_API_URL` → EQUAL
- front (2): `CONTENT_API_URL NEXT_PUBLIC_ASK_WS_URL` → EQUAL
`front/next.config.*`, `admin/next.config.*` and `front/scripts/*` read no env (grep, exit 1).

**DoD 3.** An awk check over all three files found no key line without a `#` line directly above it. The files in full:
```
### back/.env.example
# back/ environment. Copy to back/.env (git-ignored) to override. Every key is optional:
# missing = the code default shown or described here; for the keys read by src/config.ts, empty = missing too.

# --- server ---
# Port back/ listens on.
PORT=4014

# --- gateway ---
# The owner's LLM gateway; for local work point it at the stub (`bun run stub`) so no real call is made.
GATEWAY_BASE_URL=https://ai.develyst.online
# Timeout (ms) sent to the gateway for each provider attempt.
GATEWAY_ATTEMPT_TIMEOUT_MS=15000
# Our own deadline (ms) around the whole gateway call; past it the call fails as `timeout`.
GATEWAY_CLIENT_TIMEOUT_MS=60000
# Default max_tokens for a gateway call when the caller does not set one.
GATEWAY_MAX_TOKENS=512
# Pin one provider; empty = the gateway chooses.
GATEWAY_PROVIDER=
# Pin one model; used only together with GATEWAY_PROVIDER.
GATEWAY_MODEL=

# --- content + admin ---
# Folder holding PROFILE.md + PROJECTS.md; empty = back/knowledge.
KNOWLEDGE_DIR=
# Folder of the content store (site.db + media/); empty = back/data.
DATA_DIR=
# Set to 1 to turn on the admin write API (/admin/api/*); local only, never on a server.
ADMIN_ENABLED=
# The one browser origin allowed to call /admin/api/* (the admin app).
ADMIN_ORIGIN=http://localhost:4015

# --- dev scripts ---
# WebSocket the `bun run ws-client` script connects to; never set it empty, delete the line instead.
ASK_WS_URL=ws://localhost:4014/ws
### admin/.env.example
# admin/ environment. Copy to admin/.env (git-ignored) to override; a missing key = the default shown.

# Address of back/ that the admin app calls (back/ must run with ADMIN_ENABLED=1); never set it empty, delete the line instead.
NEXT_PUBLIC_ADMIN_API_URL=http://localhost:4014
### front/.env.example
# front/ environment. Copy to front/.env (git-ignored) to override; a missing key = the code default.

# Address of back/ the site reads its content from, on the server side.
CONTENT_API_URL=http://localhost:4014
# WebSocket address of the Home "Ask" section, baked in at `npm run build`; never set it empty, delete the line instead.
NEXT_PUBLIC_ASK_WS_URL=wss://dns.develyst.online/ws
```

**DoD 4.** `back/ bun test`: base `00fe101` → **95 pass / 0 fail / 457 expect()**; after → **95 pass / 0 fail / 457 expect()**.
`bunx --package typescript@5 tsc --noEmit` → 0 in `front/` and `admin/`.

**DoD 5.** `git status --short` → `M .gitignore` · `M back/README.md` · `D front/env.example` · `?? admin/.env.example` ·
`?? back/.env.example` · `?? front/.env.example`, exactly the six. No `back/.env`, `admin/.env` or `front/.env` exists.

**⚠️ One correction to the TASK's "Rules for values" (wording only; no code changed):** "empty and unset behave the same for every key"
holds only for the keys `back/src/config.ts` reads (`str`/`num` treat `""` as missing). Three readers use `??`, so an **empty** value
stays empty and the code default is NOT used: `NEXT_PUBLIC_ASK_WS_URL` (`front/src/constant/ask.ts:6`), `NEXT_PUBLIC_ADMIN_API_URL`
(`admin/src/lib/api.ts:7`) and `ASK_WS_URL` (`back/scripts/ws-client.ts:11`). All three examples carry a non-empty value, and each
purpose line says "never set it empty, delete the line instead". The file headers say "missing = default" (back's adds "for the keys read
by src/config.ts, empty = missing too"). `CONTENT_API_URL` uses `||`, so for it empty does fall back. If you'd rather the code treat
empty as missing everywhere, that's a source change for its own TASK.

**Observation:** `front/.env.example`'s `NEXT_PUBLIC_ASK_WS_URL` is the production value you told me to keep. Copying the example to
`front/.env` for local work therefore points Ask at production. That is the same situation TASK-028/SQ40 is about, so I'm only naming it here.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review

**Verdict: DONE** (Sober, 2026-11-01). Zero calls in review; re-run by SA on the tree, not read from the notes:
- `git status --short` → exactly the six lines of DoD 5. `git check-ignore` on the three examples → no output, exit 1; `back/.env` → still
  ignored (exit 0).
- Key sets (code grep + `config.ts` `str/num` names vs `^[A-Z_]+=` in each file, `diff`) → back / admin / front all EQUAL (12 / 1 / 2).
  awk: no key line without a `#` line above it. `.gitignore` + README diffs = what the TASK asked, nothing else.
- DoD 4 (95 = 95, tsc 0 ×2) taken from Fern's notes — no source file is touched (git status), so not re-run.
- **Fern's correction is right, and my TASK was wrong:** "empty and unset behave the same for every key" holds only for `config.ts`
  readers; `NEXT_PUBLIC_ASK_WS_URL`, `NEXT_PUBLIC_ADMIN_API_URL`, `ASK_WS_URL` use `??`, so empty ≠ default. Her wording ("never set it
  empty, delete the line instead") is the right fix inside a docs-only TASK. No code TASK cut — no REQ asks for it. My defect; recorded in today's log (this desk has no `FAILURES.md` — told Porter).
- Observation (local `front/.env` copied from the example points Ask at production) — same question as TASK-028/SQ40; stays there.
- Security review: none — no secret values in any file; `ADMIN_ENABLED` is empty (off) in the example; real `.env*` stay ignored.
