# SPEC-108: CAW workers can work in their folder — a refused command never stalls the team
- Source: REQ-111 (Team B only; no seam change)
- Status: DONE (2026-10-29, Silver — SA, Team B) — TASK-118/119/120 DONE · D8 (added 16:5x for REQ-111's amendment) **moved to SPEC-110 / REQ-113** at 17:0x (owner withdrew the amendment)
- Repos read: `caw-back`, `caw-front` on `atom` @ 102a130 / 4b58bf3 **plus the uncommitted REQ-104 trees** (24 / 18 paths,
  TASK-105/106/111/112), 2026-10-29 15:0x, Silver. Citations `back:` / `front:` + file:line from `nl -ba` / `grep -n`.

## Start gate (per-topic commits, `PROTOCOL.md` § Repo layout)

REQ-111 touches the files REQ-104 changed (`read-guard.ts`, `settings.ts`, `hop.ts`), so every TASK here carries
`Depends on: REQ-104 committed (<hash>)`. It also shares files with REQ-105's TASK-114 (`back: src/cards/view.ts`,
`src/hops/service.ts`; front `src/api/caw.ts`, `mock.ts`), so REQ-111 and REQ-105 (Team B) **cannot be built at the same
time** — one topic, its commit, then the other. **Order (PM, REQ-111 Q1): REQ-111 → REQ-105 → REQ-112** for Team B.

## What happens today (read, and seen live in TEST-106)

1. **The allow-list is narrow and claude enforces it.** `back: src/runner/settings.ts:8-11` allows only `git status/log/diff/show`,
   `ls cat head tail grep wc`, `bun test *`, `bun run typecheck`. In `-p` mode an unlisted Bash command is a permission deny.
2. **Every block except the read guard ends the hop at once.** `back: src/runner/hop.ts:332-338`: a block (`hook` or
   `permission`, parsed by `stream.ts:3-5`) sets `end.note = NOTES.blocked(…)`, kills the child and the hop is `stopped`
   (`:375`). Only a read-guard block is soft, and the 3rd stops (`:83-87`, `:334`).
3. **The Bash fence refuses any chain.** `back: src/runner/read-guard.ts:61` `BASH_REFUSED = /[;|&\`$<>\\{}()\n\r]/` on the raw
   string, so `pwd && ls -la` is refused, and `grep 'a|b'` too (the quote does not protect it).
4. **The hop note names the wrong reason.** Any read-guard refusal is counted as `NOTES.readsRefused` = "อ่านนอกโฟลเดอร์ถูกปฏิเสธ n
   ครั้ง" (`hop.ts:26`, `:371`), whatever the real cause (P1-7).
5. **A card whose hop ended stays `doing`.** `hop.started` moves todo→doing (`back: src/core/reduce.ts:205-206`, D-081);
   `hop.finished` touches no card (`:234-244`), and a test pins that (`back: test/http/hop-card-doing.test.ts:18` "the hop ending
   leaves it in doing"). The planner gives each card one turn per worker per run (`back: src/runner/plan.ts:53-60`), so after a
   stopped hop the run ends `nothing_workable` with the card in "กำลังทำ" and its dependants waiting (P1-8).

## Design `[SA-decided]` unless marked; each is cheap to reverse

- **D1 — The command policy moves out of claude's allow-list and into our hook.** Permissions allow `Bash` as a whole; the
  read-guard hook (already on `Read|Glob|Grep|Bash`, `settings.ts:72-77`) judges every Bash command with a new pure module
  `back: src/runner/bash-policy.ts`. Why: the reason a worker sees is then **ours** (stderr of a hook goes to the model), the
  whole policy is unit-testable without a real claude, and one place decides. The three workspace guard hooks stay exactly as
  they are and still run first (`settings.ts:47`).
- **D2 — The policy (what a worker may run).** `judgeBash(command, cwd, readable, readOnly) → null | { code, detail }`:
  - **Shell syntax.** Quote-aware tokens (single quotes: literal; double quotes: group, but `$` and `` ` `` inside still refused).
    Allowed between commands: `&&` `||` `;` `|`. Allowed redirects: `>` `>>` `2>` `2>>` `&>` + a path word (judged as a **write**),
    `<` + a path word (a read), `2>&1`, `>&2`. Refused anywhere outside single quotes: `$`, `` ` ``, `\`, `(` `)` `{` `}`, newline,
    a lone `&` (background), `<<` (heredoc) → code `shell_feature`.
  - **Each command** is judged by its first word (a bare name, no path):

    | Program | Rule | Refusal code |
    |---|---|---|
    | `pwd ls cat head tail grep wc diff sort uniq file stat du tree which echo printf true sleep date basename dirname realpath` | allowed (read) | — |
    | `mkdir touch cp mv rm chmod tee` (`sed` removed 2026-10-29 at TASK-118 review: its `e`/`w` commands run programs / write anywhere) | allowed (write): cwd and every path word in a **writable** folder | `read_only` |
    | `find` | allowed; `-exec -execdir -ok -okdir` refused | `not_allowed` |
    | `git` | only `status log diff show ls-files blame rev-parse`; `--output` refused; `-C <dir>` judged as a path | `git_write` |
    | `bun`, `bunx`, `node` | allowed (install, add, build, run, test, x …), cwd writable; `-e --eval -p --print` refused; `bun publish` refused | `inline_code` / `not_allowed` / `read_only` |
    | `curl`, `wget` | only when every URL/host word is `127.0.0.1`, `localhost` or `[::1]` (with any port); `-K --config` refused | `network` |
    | `nc ncat ssh scp sftp rsync telnet ftp` | refused | `network` |
    | anything else | refused | `not_allowed` |
  - **Paths.** Every path-like word (today's rule, `read-guard.ts:80-110`: `/`, `~`, `..`, or an existing relative name; option
    forms `--x=/p`, `-f/p`) must be inside a readable folder (`outside`); for a write program, `bun`/`node` and a `>`-target it
    must also not be inside a read-only folder (`read_only`).
  - The registry: `bun install`/`add` reach the package registry by nature; nothing else is meant to leave `127.0.0.1`.
- **D3 — The hook's stderr starts with the code:** `caw-refused <code>: <English reason for the model>`, e.g.
  `caw-refused not_allowed: "docker" is not a command a worker may run here — use bun, node, git (read) or file commands`.
  The hook gets the read-only folders as an **optional second argument** (JSON list; missing = none), so today's one-argument
  form keeps working.
- **D4 — No refusal ends a hop.** In `hop.ts`'s block loop, every block (our hook, a workspace guard hook, a claude permission
  deny) is recorded and the stream goes on; claude has already returned the refusal to the model. **Cap:** the **10th** block in one
  hop stops it (probing), with the cap note. The timeout, the limit signal and the runner-stopping paths are unchanged.
- **D5 — Hop note = the real reasons, in the PM's sentence.** Each distinct refusal becomes
  `คำสั่งนี้ทำไม่ได้: {เหตุผล} — ทำต่อด้วยวิธีอื่น` (REQ-111 wording), at most 3 distinct, then `(อีก {n} ครั้ง)`; joined into the
  note where `readsRefused` sits today (`hop.ts:371-380`). `NOTES.readsRefused` and `READ_GUARD_STOP_AT` go. The Thai {เหตุผล} per
  code is user-facing copy → **REQ-111 Q2** (the PM accepted all ten defaults as written, 2026-10-29).
- **D6 — A card is never left `doing` without a hop.** `back: src/hops/service.ts:74-82` `patchHop`, when it writes `hop.finished`
  for a **card** hop and that card's status is still `doing`, writes a second event in the same write (`writeDecided` takes a list,
  `back: src/core/write.ts:15`): `card.status_set { cardId, status: "todo" }`, actor = the same actor. Any outcome (a finished hop
  whose worker left the card `doing` is not "in progress" any more either — **REQ-111 Q3**, default accepted by the PM). A plain event, so a
  rebuild replays it with no reducer change (`rebuild-check` stays `same: true`). The next run picks the card up like any `todo`
  (`isWorkable` already accepts todo, `back: src/cards/view.ts:22-23`); its dependants wait until it is `done`, which can now happen.
- **D7 — The card says why it stopped.** `Card` gains `stoppedMidway: { hopId: string; at: string; reason: string } | null`,
  computed in `cardView` (never stored): non-null when the card is `todo` and its **latest** card hop ended `failed`, `stopped` or
  `interrupted`; `reason` = that hop's note up to the first ` · ` (the leading Thai sentence the runner writes, `hop.ts:372`).
  caw-front shows `งานนี้หยุดกลางทาง: {reason} — รอทำต่อ` (REQ-111 wording) on the board card and on the card page.
- ~~**D8**~~ — moved to `specs/SPEC-110-caw-workers-cannot-act-as-operator.md` (REQ-113), 2026-10-29 17:0x: the owner withdrew REQ-111's amendment (`DECISIONS.md` 17:0x).
- **Out:** per-worker sub-folders, persistent sessions (REQ-111 Out of Scope); a run that restarts itself after `nothing_workable`
  (today a new run opens on the operator's mode switch, `back: src/runner/main.ts:214` — unchanged).

## API / Interface Design

**Hook contract** (`back: src/runner/read-guard.ts` CLI): `bun read-guard.ts '<JSON readable>' ['<JSON readOnly>']`, payload on
stdin; exit 0 = allow; exit 2 + one stderr line = refuse. Bash lines start `caw-refused <code>: `; file-tool lines keep today's
text with the same prefix (`caw-refused outside: read guard: …`).
Consumers: `grep -rn "withReadGuard\|runGuardCli\|read-guard" src test` → `back: src/runner/settings.ts:66-78` (builds the hook) ·
`src/runner/hop.ts:12,286` (calls `withReadGuard`) · `:87` (`isReadGuardBlock` matches the text) · `src/runner/settings.test.ts:144-190` ·
`src/runner/read-guard.test.ts` (all) · `src/runner/hop.test.ts:952-1045` · `src/runner/fixtures/read-guard.stream.jsonl` (a recorded
real line; kept as is — it is history, and its text still names read-guard). All in TASK-118.

**Settings** (`back: src/runner/settings.ts`): `permissions.allow` = `"Bash"` + the MCP tool names (unchanged); `WORKER_ALLOW`'s
Bash entries go. `deny` keeps `nc ssh scp`, `find -exec/-execdir`, `git diff --output`; **drops `curl`/`wget`** (the hook allows
them to 127.0.0.1 only; a deny would beat that). `withReadOnly`'s comment "No allowed Bash command writes" becomes false → rewritten.
Consumers: `grep -rn "WORKER_ALLOW" src test` → `src/runner/settings.ts:8,42` · `src/runner/settings.test.ts:6,29,75`. TASK-118.

**Card** (`GET /v1/cards/{id}`, `GET /v1/projects/{id}/cards`, card inside context and proposals): adds
`"stoppedMidway": { "hopId": "uuid", "at": "ISO", "reason": "string" } | null` — camelCase exactly as written.
Consumers: `grep -rn "cardView(" src` → 16 call sites, all through `back: src/cards/view.ts:25` (one change) · `CardSchema`
`back: src/http/routes/cards.ts:16` (+ `proposals.ts:7` imports it) · `openapi.json` (re-emit) · `back: test/http/cards.test.ts:36`
asserts the exact key list → gains the key · front: `grep -rln specChangedVersion src tests` → `src/api/caw.ts` (type),
`src/api/schema.d.ts` (generated), `src/api/mock.ts`, `src/api/mock.test.ts`, `src/api/mock-writes.test.ts`,
`src/lib/crew.test.ts:11`, `src/components/runs/RunsList.test.tsx:11` (fixtures build a full `Card`), `src/components/Board.tsx:77-80`,
`src/components/card/CardView.tsx:48` (where marks render). Back in TASK-119, front in TASK-120.

**Hop finish → card** (D6): no shape change; one more event in the same write.
Consumers of the old behaviour: `back: test/http/hop-card-doing.test.ts:18` ("the hop ending leaves it in doing") — **rewritten** to
the new rule in TASK-119; `:64` rebuild-check must stay `same: true`. `back: test/http/rebuild-sequence.test.ts:99` compares card
statuses after a `commented` and an `interrupted` hop (base: `1:todo`, `3:todo`) — may change; in TASK-119's list conditionally.

## Data Model

None. `stoppedMidway` is computed; D6 is an ordinary `card.status_set` event. Existing cards already stuck in `doing` (old local
test DBs) are left as they are; the operator can move them.

## Flow (TEST-106's stop, after this SPEC)

Builder runs `bun build …` → allowed → runs. Builder runs `git commit -m x` → hook: `caw-refused git_write: …` → claude hands the
refusal to the model → the hop goes on; note gains `คำสั่งนี้ทำไม่ได้: worker เขียน git ไม่ได้ — ทำต่อด้วยวิธีอื่น`. If the hop ends
without finishing (cap, timeout, crash, no result), the card goes back to `todo` with `stoppedMidway`, and the next run gives it a turn.

## Non-functional

- No sandbox (owner 13:41): code a worker writes and runs (`bun run x.ts`) can still do anything the OS lets it; the policy judges
  **words**, not processes. Known and accepted with the 13:41 decision; restated here so nobody reads D2 as a sandbox.
- The policy fails closed: what it cannot parse is refused (today's principle, `read-guard.ts:58`).
- Added at TASK-118 review (2026-10-29): `~name` / `~+` / `~-` words and glob segments starting with `.` are refused (`shell_feature`). Known small gaps, accepted: `sort -o` / `tree -o` write inside a read-only folder (they stay inside the folders).

## Tasks

- TASK-118: caw-back — command policy, `Bash` allowed through the hook, soft refusals + cap, real reasons in the note, one live probe — owner: BE Bob (depends on: REQ-104 committed)
- TASK-119: caw-back — a finished hop sends its `doing` card back to `todo`; `stoppedMidway` on Card — owner: BE Bob (depends on: REQ-104 committed; independent of TASK-118)
- TASK-120: caw-front — the "stopped midway" sentence on the board card and the card page — owner: FE Fanta (depends on: TASK-119 DONE — its `openapi.json`)

## AC → work

| AC | Where |
|---|---|
| AC-1 commands run | TASK-118 (policy + `Bash` allow; unit tests + one live probe hop) |
| AC-2 refused, named, hop goes on | TASK-118 (D3–D5) |
| AC-3 no card stuck in "กำลังทำ" | TASK-119 (D6, D7) + TASK-120 (shown) |
| AC-4 live, team reaches QA's turn | REQ-108 phase 2 (QA); enabled by 118 + 119 |
| AC-5 regression | TASK-118 (guard hooks untouched, TASK-112 confinement tests green, suite) · TASK-119 (rebuild-check) |

## Risks / assumptions

- **R1** `"Bash"` alone as an allow rule allowing every Bash call, with our hook still run first, is claude's documented behaviour
  as I understand it — `inferred`. TASK-118's one live probe settles it (DoD 9). If it is wrong, the fallback is wide `Bash(<prog> *)`
  rules generated from D2's table.
- **R2** A stub run (QA's AC-1/AC-2 check) proves our hook and the soft loop, not claude's permission matcher; only the live probe and
  REQ-108 phase 2 prove that. Told to the PM (Q4) so the TEST knows.
- **R3** A worker may now start a server in the foreground; claude's own Bash timeout ends it, and the runner's group kill cleans up at
  hop end (`procs.ts`). Not designed further.

## Questions

Asked in REQ-111 § Questions (Q1–Q4), not here.
