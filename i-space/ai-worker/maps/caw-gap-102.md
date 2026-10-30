# REQ-102 — CAW gap report (Team B): owner intent b, c, d vs today's code

- Written by: Silver (SA, Team B), 2026-10-29 · Source: `requirements/REQ-102-gap-owner-intent-vs-code.md`
- Repos read: `caw-back` @ 102a130, `caw-front` @ 4b58bf3 (`atom`, unchanged). Read only — no run of the runner, no live
  Claude CLI, no gateway call. Detail behind each line: `maps/caw.md`.
- **fits** = the code already does what the owner said · **partly** = some of it · **differs** = it does something else.
  Size = the SA's guess (S/M/L) for CAW's own repos only; a change that also needs Blueprint's side says so.
- Cites are `caw-back → src/…` unless they say `caw-front`.

## Point b — "CAW must always see the LATEST spec immediately; a version label is only a tag for work"

| # | Sub-claim | Verdict | Evidence | What would have to change (size, SA's guess) |
|---|---|---|---|---|
| b1 | What CAW asks Blueprint for, per call | **differs** | every spec read names a **version number**: `getVersion(bp, n)` and `partContext(bp, n, key)` (`blueprint/client.ts:66-70`); `versionsAfter` asks for confirmed versions after n (`:82-86`); `getProject` is used for `project.name` only (`:62-65`); `locate` / `amend` send no version — Blueprint picks (`:71-81`) | CAW would ask for "the current spec" instead of "version n" — **needs Blueprint's seam to serve the latest** (Team A side). CAW side **M** |
| b2 | Which spec a card's worker reads | **differs** | a card is created with a fixed anchor `{ key, version }` that must be a confirmed version (`cards/service.ts:54,59-64`); its context is always read at that version (`cards/service.ts:96`); a newer version only **flags** the card (`specChangedVersion`) and never moves it (`follow/pull.ts:2-3` "the anchor is never edited"; `core/reduce.ts:170-177`); "clear" only removes the flag (`core/reduce.ts:169`) | read a card's part at the latest spec; keep `anchorVersion` as the tag of when the work was cut. **M** |
| b3 | When CAW sees a change | **differs** | only when Blueprint **confirms a version**: the push accepts only `event: "version.confirmed"` (`http/routes/follow.ts:6,11`); the timer pull reads the feed of confirmed versions every `CAW_POLL_MS` (30 s, `index.ts:23-24`; `follow/pull.ts:47`). An edit between two confirms is invisible to CAW | Blueprint pushes (or CAW pulls) on every edit, not only on a label; CAW then flags/refreshes cards. CAW side **S**, Blueprint side needed |
| b4 | Starting a CAW project | **differs** | `/start` needs `version=<n>` (`caw-front → src/app/start/page.tsx:28`); caw-back refuses a version that is not confirmed — 409 `version_not_confirmed` (`projects/service.ts:23-25`) | a project starts from the Blueprint project alone, the label optional. **S** (plus Blueprint's button, Team A) |
| b5 | "A version label is only a tag for work" | **partly** | CAW already carries the label as data: `project.version` and `latestSeenVersion` (`core/reduce.ts:88`), each card's `anchorVersion` (`core/reduce.ts:132`). But the label also **selects the content** (b1, b2) | keep the fields as tags; stop using them to pick content (same change as b1/b2). **S** on its own — the work is counted in b1/b2's M |
| b6 | The part reader on the screen | **partly** | `GET /v1/projects/{id}/parts/{key}` defaults to `latestSeenVersion` (`projects/service.ts:99-104`) — the latest **confirmed**, not the latest edit | follows from b1/b3. **S** |

## Point c — "A CLI per user, per the team set up, works like Atom (CLI on the server); the gateway only for small parts and decision AI"

| # | Sub-claim | Verdict | Evidence | What would have to change (size, SA's guess) |
|---|---|---|---|---|
| c1 | How CAW starts the CLI today | **partly** | Claude CLI on the subscription, as intended — but **one short `claude -p` per hop** (one card turn or one chat answer), then it exits: `-p <prompt>` (`runner/hop.ts:141`), `--no-session-persistence` (`hop.ts:154`), spawned per hop (`hop.ts:269`; `runner/main.ts:116-134`). Nothing carries over between hops except what is in CAW's store. Atom is a long-lived interactive session (`SYSTEM-FACTS.md` § Team) | if "like Atom" means a session that stays open per worker: keep one CLI session per worker (resume or interactive) instead of one per hop. **L** — see Q-B1 |
| c2 | "Per user" | **depends on Q2** (reported, not picked) | **people:** there is no user — one actor `operator`, no login, no auth (`http/actor.ts:1-3`; `index.ts:18`). **AI workers:** each hop runs as exactly one worker — the MCP server acts as `worker:<CAW_WORKER_ID>` (`runner/hop.ts:127-130`), with that worker's model and effort (`hop.ts:142`) | people: login + a CLI pool per person — **L**. AI workers: already per worker, per hop — see c1 |
| c3 | How "the team set up" maps to CLI sessions | **partly** | the team = the project's chain: members, who hands to whom, the entry worker (`chain/service.ts:1-2,13`); the card's assignee decides which worker's CLI runs (`runner/plan.ts:57-60`); the entry worker answers the chat (`plan.ts:18,38`). But **one hop at a time per project** (`plan.ts:20,48`) — a team of four never has four CLIs working at once on one project. Projects do run side by side (`runner/main.ts:285-290`, hops launched in the background `main.ts:116-134`) | allow one live CLI per team member in a project. **M** |
| c4 | Where it is meant to run | **partly** | it is a Claude CLI on the box the runner is on, like Atom — and that box can be the server. But the code assumes **one machine with no login**: the API binds `127.0.0.1` unless `HOST` is set (`index.ts:18-19`), "no auth in v1 (localhost only)" (`http/actor.ts:3`), the runner reaches the API on `127.0.0.1:4500` (`runner/config.ts:42`) and works in absolute folders on its own disk (`runner/config.ts:30-32`) | to open it to users on a server: a login and a safe bind. **M** (the owner put the same kind of risk for Blueprint "later", 10:51) |
| c5 | Does CAW itself call the LLM gateway | **fits** | no. Every outbound call in caw-back goes to Blueprint (`blueprint/client.ts:37,52`) or to CAW's own API (`runner/api.ts:47`, `mcp/server.ts:21`, `dev.ts:46`); no gateway URL or key anywhere in either repo (`grep -rniE "develyst\|gateway\|openai\|anthropic"` → only sample folder paths in `caw-front → src/api/mock.ts:267-268`). All AI work goes to the CLI | none. Open: does CAW need any "decision AI" through the gateway? Nothing in CAW does that today — Q-B3 |
| c6 | Running on a subscription (quota) | **fits** | the runner reads the CLI's limit signal and stops the run with the reset time (`runner/stream.ts:8-9`; `runner/main.ts:122-124` `limit_reached`) | none |

## Point d — "Each agent gets its own CLI screen: a live terminal view per worker, to watch the work if wanted"

| # | Sub-claim | Verdict | Evidence | What would have to change (size, SA's guess) |
|---|---|---|---|---|
| d1 | Does caw-front show anything per worker | **partly** | per worker there is a **status**, not a screen: the crew strip on the board (`caw-front → src/components/CrewStrip.tsx:10`) shows each seat as working / stuck / quiet; the team screen's person drawer edits a worker (`caw-front → src/components/team/PersonDrawer.tsx:3-5`). No screen shows a worker's CLI | a per-worker view (a drawer or a page) that shows the live output. **M** (front) |
| d2 | Is the CLI's live output captured or streamed | **differs** | the runner reads the CLI's `stream-json` live (`runner/stream.ts:1`) but sends the API only a **heartbeat timestamp** every 30 s (`runner/hop.ts:299-301`; event `hop.heartbeat { hopId }`, `core/events.ts:84`) and, at the end, outcome + tokens + a note ≤ 300 chars (`core/events.ts:92`). The full stream goes to a trace file **on the runner's machine only**, "never sent anywhere" (`runner/trace.ts:1-2,11`; written at the end, `hop.ts:330`) | runner → API: stream (or batch) the CLI's lines per hop, redacted (`runner/redact.ts` exists); API: store/serve them; front: show them live. **L** (runner + API + front) |
| d3 | What a user sees of a running hop now | **partly** | the card sits in "กำลังทำ" (`caw-front → src/words.ts:6`), the seat reads working and, after a silence, "เงียบไป {n} นาที" from `Hop.lastActivityAt` (`caw-front → src/lib/crew.ts:125-133`, `words.ts:202`); screens refresh every 3 s (`caw-front → src/components/LiveRefresh.tsx:2`). After the hop: its outcome, tokens and note in the runs list (`caw-front → src/components/runs/RunsList.tsx:1-2`). What the CLI is doing right now is not visible | once d2 delivers the CLI's lines, show "what it is doing now" on the card and the crew seat. **S** on its own — the work is counted in d2's L and d1's M |

## Questions the owner's words leave open (not settled here)

- **Q-B1 (c1)** — "works like Atom": one CLI session that stays open per worker and is given work turn after turn, or a
  fresh CLI per piece of work (as now), only on the server? The size of c1 goes from L to none depending on the answer.
- **Q2 (REQ-102, c2)** — "per user" = each person, or each AI worker. Reported both ways above.
- **Q-B2 (b)** — "immediately": every edit as it is typed or saved, or every time a label is put on? And while a worker is
  mid-hop, should the spec under it change? Today a hop reads the spec once, at its start (`cards/service.ts:94-97`).
- **Q-B3 (c5)** — is there any "decision AI" the owner expects in CAW (choosing the next card, the worker, a summary)?
  Today those choices are plain code (`runner/plan.ts:35-61`), not AI.
- **Q-B4 (d)** — the live view: read-only watching, or can the user type into a worker's CLI (as with Atom)? Watching is d2
  + d1; typing is much more (it touches c1).
