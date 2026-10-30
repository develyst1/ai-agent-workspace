# REQ-102 — Team A gap report: owner intent vs Blueprint code

- Written by: Sober (SA, Team A), 2026-10-29 — the SA's own reading, no TASKs cut (read-only, one reader).
- Repos read: `blueprint-back` `atom` @ f60b934 · `blueprint-front` `atom` @ e46322a — `git status --short` empty in both.
  Nothing was run: no server, no test, no gateway call, no Claude CLI.
- Points covered: **a** (AC-1) · **b, Blueprint side** (AC-2) · **gateway uses** (AC-4). Point c and CAW's side of b are Team B's.
- Marks: **fits / partly / differs**. Size = **S/M/L, the SA's guess `[SA-decided]`**, not a design.
- Citations: `back:` = `blueprint-back`, `front:` = `blueprint-front`; line numbers come from `grep -n` / `cat -n`.

## Point a — Blueprint is the store; the PM edits there; labels by hand; every edit audited (AC-1)

| # | Sub-claim | Mark | Evidence | What would have to change (size, SA's guess) |
|---|---|---|---|---|
| a1 | Spec is stored and edited in Blueprint | **fits** | The spec is the `parts` + `links` tables (`back: src/db/schema.ts:29-53`). Every change goes through one writer, `applyChangeSet` (`back: src/spec/store.ts:97-111`). | — |
| a2 | The PM edits and adds there **directly** | **partly** | The site has no edit form. The front only calls `/rounds` (AI chat: message, accept, answer, park, retry; `front: src/features/chat/actions.ts:33,47,54,61,99`) and undo (`:66`). The spec is changed by the AI's proposals inside a chat round (`back: src/interview/round.ts:372`) or by a wrong quiz mark (`back: src/quiz/store.ts:192`). A direct-edit API exists, `POST /v1/projects/{projectId}/change-sets` (`back: src/http/routes/change-sets.ts:13-29`), but no screen calls it. | A screen where the PM adds or edits a part by hand, on the existing change-set API. **M** |
| a3 | Requirements are kept there too | **partly** | Raw inputs are kept as **sources** (file or link, extracted text; `back: src/db/schema.ts:88-103`). Requirements exist only as spec parts (kinds in `back: src/spec/registry.ts:81`). There is no "requirement" record of its own. | Add a `requirement` part kind next to the existing ones (`back: src/spec/registry.ts:7-69` has none today), so it goes through the same change sets and audit log. Hand editing comes with a2. **S** (fixed 2026-10-29 for TEST-102 DEF-1, after Q-A1 was answered: owner 11:41, DECISIONS item 1) |
| a4 | Versions only from a person's hand-applied label, no arbitrary splitting | **differs** | A version is made only by `POST /v1/projects/{projectId}/versions` (`back: src/http/routes/versions.ts:9-31`), which a person clicks (ยืนยัน 100%, `front: src/features/ready/actions.ts:57-62`). But it is a **gated, numbered, frozen snapshot**, not a label. It is refused while anything is stuck or the quiz is not 100% of ≥ 5 (`back: src/projects/service.ts:104-110`). The number is automatic, `latest + 1` (`:112`). The whole spec is copied into `versions.snapshot` (`:113-117`, `back: src/db/schema.ts:80`). There is no label text anywhere (`schema.ts:75-85` has no label column). Nothing creates a version automatically. | Turn a version into a tag a person names (free text) on the current state. Decide whether the stuck and quiz gate stays (**Q-A2**). **M** (back + front + CAW's reader). |
| a5 | Audit: every edit and addition keeps a record of **what** changed | **partly** | Spec edits: yes. Each change set writes one `changes` row per entity with `before` and `after` (`back: src/spec/store.ts:116-117`, schema `:64-73`). Undo is also a change set (`store.ts:325-330`). It can be read per part (`GET …/parts/{key}/history`, `back: src/http/routes/parts.ts:11-22`). **Not audited:** source adds (a `sources` row only, `back: src/sources/service.ts:77-86`); the failed-link re-fetch, which **overwrites** the source row with no "before" (`:135-150`); and project settings model/creativity (`back: src/projects/service.ts:163-166`). | Send the source add, the source re-fetch and the settings change through an audit record too. **S–M** |
| a6 | Audit: **when** | **fits** | `change_sets.at` (`back: src/db/schema.ts:58`). `sources.created_at` (`:102`), but it only marks the creation. | — |
| a7 | Audit: **who** | **differs** | `change_sets` has no person column, only `cause_kind` operator / message / source / undo and `cause_ref` (`back: src/db/schema.ts:55-62`, `src/spec/types.ts:88-91`). The person who confirms is a fixed string: the front always sends `"operator"` (`front: src/features/ready/actions.ts:55`). There is no login, so there is no "who" to record (no auth, `maps/blueprint.md` §6). | Needs a user identity (log-in or at least a name) and a `by` field on every change set, source and confirm. **L** if it comes with real log-in. **M** for a typed name only. |

## Point b, Blueprint side — what the seam serves: latest draft or a confirmed snapshot (AC-2)

| # | Call (CAW's name → route) | Serves | Evidence | Mark vs "CAW always sees the LATEST spec" | What would have to change (size, SA's guess) |
|---|---|---|---|---|---|
| b1 | getProject → `GET /v1/projects/{projectId}` | **latest draft** (live tables) | `back: src/http/routes/projects.ts:50-51` → `src/projects/service.ts:70-72` → `loadSpec`, live `parts` with `removed_at IS NULL` (`back: src/spec/store.ts:72-74`) | **fits** | — |
| b2 | getVersion → `GET …/versions/{version}` | **confirmed snapshot** | `back: src/http/routes/versions.ts:33-35` → `src/projects/service.ts:125-135` ("Read from the frozen row only") | **differs** | Serve the latest, with the label as a tag only, or drop this as CAW's main read. **M** (moves with a4). |
| b3 | versionsAfter → `GET …/versions?after=` | **confirmed versions**, with diffs computed between snapshots, plus `changedSinceLatest` | `back: src/http/routes/versions.ts:72-74` → `src/seam/feed.ts:50-71` | **differs** | A feed of the latest changes (change sets after X) instead of versions. The data already exists in `change_sets` / `changes`. **M** |
| b4 | partContext → `GET …/versions/{version}/parts/{key}/context` | **confirmed snapshot** ("never the live draft") | `back: src/http/routes/seam.ts:44-45` → `src/seam/context.ts:1-2,19-20` | **differs** | Read from the live spec, not `getVersion`. **S** |
| b5 | locate → `POST …/locate` | **latest confirmed version** (refuses with none) | `back: src/http/routes/seam.ts:54-55` → `src/seam/locate.ts:1-2,37` | **differs** | Match against the live spec. **S** |
| b6 | amend → `POST …/amendments` | writes a chat message only; the spec is not touched | `back: src/http/routes/seam.ts:76-77` → `src/seam/amend.ts:1-2,48-50` | **fits** (neutral: it adds to the chat, so the next round sees it) | — |
| b7 | push → `CAW_NOTIFY_URL` | sent **only after a confirm** (`version.confirmed`). No push on an ordinary edit. | `back: src/projects/service.ts:120-121` → `src/seam/notify.ts:7,18` | **differs** | Push on every change set ("spec changed"), not only on confirm. **S** |
| b8 | front's CAW link ("ส่งไปสร้างที่ CAW") | on only for a confirmed version with nothing changed since; carries `&version=<n>` | `front: src/features/ready/load.ts:140-146` | **differs** | Link to the project (latest), with the label passed only as a tag. Decide whether "nothing changed since" still blocks it (**Q-A2**). **S** |

**Blueprint side in one line:** one call (getProject) serves the latest draft. The other three reads, the push and the front link are all built around confirmed snapshots. Point b moves together with a4.

## Gateway use in Blueprint — listed, not marked (AC-4; owner's call, REQ-102 Q1)

The client is `back: src/gateway/client.ts`. It has two methods, `chat` (`:117`, POST `/chat`) and `listModels` (`:109`, GET `/models`). Every caller (`grep -rn "gateway\.\w*(" src`, excluding `src/gateway/`):

| # | Caller | Call | What it is for | Reached from |
|---|---|---|---|---|
| g1 | `back: src/interview/round.ts:358-359` | `chat` | **The AI interview.** Each chat round sends the history, sources and spec, and gets the bot's reply plus proposed spec changes. | `POST /v1/projects/{projectId}/rounds` (`back: src/http/routes/rounds.ts:36-37,68`) — the chat screen |
| g2 | `back: src/quiz/answer.ts:57` | `chat` | **The understanding quiz.** The AI answers a person's question from the spec only. A person then marks the answer right or wrong; 100% is needed to confirm. | `POST …/quizzes/{quizId}/questions` (`back: src/http/routes/quizzes.ts:54-55,66` → `src/quiz/store.ts:223,233`) |
| g3 | `back: src/http/routes/models.ts:24` | `listModels` | Lists the models the gateway offers, for the model picker. | `GET /v1/models` (`:7-8`) |
| g4 | `back: src/projects/service.ts:157` | `listModels` | Checks that a chosen `<provider>/<model>` exists before saving it to the project. | `PATCH /v1/projects/{projectId}` (`back: src/http/routes/projects.ts:60-61,76`) |

Not a gateway call: **locate** is a word match with "no model, no gateway call" (`back: src/seam/locate.ts:1-2`). Link sources are fetched from the link's own site, not the gateway (`maps/blueprint.md` §6). The only callers that do AI work are **g1 interview** and **g2 quiz**. g3 and g4 only read the model list.

## Questions — the owner's words leave these open (REQ-102 Req 4; not settled here)

- **Q-A1 (a3)** — *answered: owner 2026-10-29 11:41 (DECISIONS item 1), a requirement is a spec part kind; a3 now has a size.* — "store of spec **and requirements**": is a requirement (a) a spec part, as today (the AI interview turns sources into parts), or (b) its own record the PM writes by hand next to the spec? (a) needs no new data. (b) is a new table and screen.
- **Q-A2 (a4, b8)** — When versions become hand labels, does the confirm gate stay? Today the gate is: no stuck items, quiz 100% of ≥ 5 (`back: src/projects/service.ts:104-110`), and the CAW link stays off while anything changed since. Three readings: keep the gate before a label can be put on · keep the quiz only · drop both, so a label is just a name.
- **Q-A3 (a7)** — "who" in the audit log: a real log-in per person, or a name typed on the site? This sets the size of a7 (L vs M), and it touches the "no auth" risk the owner put off for later.
- Already raised by the PM, reported here without picking: **Q1** (are the interview g1 and the quiz g2 "small parts / decision AI"?) — the facts are the table above.

## Repo state at close (AC-6)

Read-only. `git status --short` empty and HEAD f60b934 / e46322a, checked by Sober before writing. Nothing started, nothing listening was opened by Team A.
