# SYSTEM FACTS — what the owner has said, and how the system actually behaves

> **Created 2026-10-20, on the day this desk opened, by Marie (workspace operations) —
> deliberately BEFORE the team's first session, so the team is born with it instead of
> re-learning it.** On another project this file did not exist for six weeks, and the
> owner had to explain the same facts across sessions; twice the team raised a deliberate
> decision as if it were a live incident. **That is a note-taking failure, not a knowledge
> failure.**
>
> **What belongs here:** any fact about the product or how the system behaves that is
> **not** derivable from the code, not a requirement, and not a status. Product
> definitions, deliberate settings, decisions the owner already made, which document is
> authoritative, environment facts.
>
> **The rule that makes it work — Porter's, binding on himself:**
> **When the owner states a fact about the product or how the system behaves, it is
> written HERE BEFORE the reply is sent.** Not after, not "when I update the board", not
> in a log entry that scrolls away.
>
> **Format:** one fact, one line, with **who said it and when**. Append-only. Never
> compacted, never summarised, exempt from every size gate (`check-hygiene.mjs` exempts
> this file by name). If a fact turns out to be wrong, strike it and write the correction
> under it — do not delete.
>
> **Conventions:** every date is **2026** unless a full year is written · **`(owner)`
> means the owner, develyst — the only person who has ever talked to this team** ·
> **⚠️ CONTESTED** means two sources disagree, both are recorded, and **neither may be
> acted on** until the owner settles it · a line marked **(Marie, read-only survey
> 2026-10-20)** was read out of the repos on the day the desk opened and is evidence of
> what is *there* — not of any decision.

---

## What the product is (owner, 2026-10-20, relayed in Atlas ORDER 21)

- **A backend that answers a Facebook page's messages automatically**, by running a
  layered AI pipeline over the owner's own LLM gateway. (owner, 2026-10-20)
- **Backend only. The webhook and the Send API are the whole path; no screen exists in
  it.** (owner, 2026-10-20)
- **A read-only admin view will probably be wanted later — it is NOT in scope now and
  nobody scaffolds one.** (owner, 2026-10-20) This is why there is **no FE role** here.
- **The page is a PUBLIC input.** Anyone on the internet can type into it. Every design
  decision is made with that in front of you. (Atlas, 2026-10-20, ORDER 21.2)

## The owner's pipeline — max five layers, as he stated it (owner, 2026-10-20)

`classify what they want -> generate a query -> the BACKEND runs it -> analyse the result -> answer`

- 🔑 **Layer 3 is the backend executing the query — NOT a human.** Atlas first read it as
  a human step and the owner corrected him. **Recorded so nobody re-introduces a human
  into the loop.** (owner's correction, 2026-10-20)
- **Max five layers** is the owner's own bound on the design. (owner, 2026-10-20)

## Chat history and personal data (owner, 2026-10-20)

- **Chat history is kept**, so the bot knows what has already been said.
- **Anything older than three months is deleted — by a SCHEDULED JOB, never lazily on a
  customer's message.**
- **It is personal data belonging to Facebook users. Deleting on schedule is a feature**,
  not an optimisation, and not something to "do later if there is time".

## 🔴 Security constraints — the owner has RULED on these. They are BINDING.

> **These four are owner-ruled and are not open for re-argument by the team.** Porter
> carries them into the first REQ as binding constraints; Sober designs to them; Jason
> implements them; Tanya tests that they hold. (Marie does not write REQ content — her
> charter forbids it — so the constraints live here, where every role reads them at
> step 1 of the startup ritual, and the board carries the row that puts them in REQ-001.)

**The hazard Atlas raised (2026-10-20):** an LLM writes SQL, the backend runs it, and the
page is a public input anyone can type into. The chain to fear is *crafted message -> a
query that reaches data it should not -> the analyse layer summarises it -> the answer goes
back to the person who crafted it.*

**The owner's decision, 2026-10-20: customers may ask freely about services**, and the
defences are documented in a `prompt-system.json` plus logging. **That is his call and the
team builds it.**

**And these four stay, because none of them limits what a customer may ask** — they limit
only what a hallucinated or hostile query can reach:

1. **The database role the backend connects with must not be able to write. `SELECT`
   only.** If a generated statement tries to delete, the database refuses — **the guard
   lives in the database, not in a prompt.**
2. **Expose only what the bot needs, through views, not the whole customer schema.**
3. **A statement timeout and a row cap, both set in code.**
4. **Every generated statement is logged, with the message that produced it.** Without
   that, the day something leaks nobody can say how.

🔑 **Prompt-level defence is necessary and is NOT sufficient** — the attack arrives
*through* the prompt, so it cannot be the only layer. This is not a re-argument of the
owner's decision; it is the reason his `prompt-system.json` needs company.
(Atlas, 2026-10-20, ORDER 21.2)

## The LLM gateway this product runs on

**Where it is:** the gateway is the **`develyst-ai`** desk's product — one normalized API
over OpenAI / Gemini / xAI / DeepSeek, written in Bun. Local port **3009**; in production
it is the **`ai.develyst.online`** app on the shared server.
🚫 **It is another desk's repo. Nobody on this desk writes code in it.**

🔑 **The gateway is deliberately framework-free** — the owner's position, relayed by
Atlas: *"your product's orchestration layer composes these."* So **every layer of this
product's thinking belongs in THIS repo, not in the gateway. Do not propose changes to
the gateway to make this project easier.** (owner via Atlas, 2026-10-20)

### What Atlas stated (Atlas, 2026-10-20, ORDER 21.1 — read by him from the repo and its Bruno collection)

- `POST /chat` — one provider, or **omit `provider` for the fallback chain
  `deepseek -> xai -> gemini -> openai`** (first success wins).
- `POST /chat/multi` — several models in parallel, results returned **in the order the
  configs were sent**.
- `POST /search/classify` `{message}` -> `{search, query, reason}` — a cheap small-tier
  call that decides whether fresh web info is needed; **fail-soft** (unparseable ->
  `search:false`).
- `POST /search` `{query}` -> Tavily results.
- `GET /` `/models` `/tiers` are open; **everything else needs
  `Authorization: Bearer <project-key>`**.
- Keys live in a **gitignored `api-keys.json`** on the gateway, one entry per project,
  hot-reloaded, **fail-closed**. So this desk needs its own project key; **the owner
  issues it.** Never commit it, never print it.
- Tiers are `small` / `medium` / `flagship` — **choose by capability, not by model name.**
- **Current date/time is injected into every `/chat*` call automatically. Do not
  re-send it.**
- Response shape is always `{success, data:{provider, model, content, usage, latency_ms}}`.

### ✅ ALL OF THE ABOVE IS CONFIRMED — verified twice, in the right tree the second time

> **They were briefly recorded here as ⚠️ CONTESTED on 2026-10-20 and the contest is
> SETTLED: Atlas's facts were right.** Keeping how it was settled, because the lesson is
> about the map, not about the gateway:
>
> **There are TWO checkouts of the gateway on this machine.** The workspace-root
> `machine.local.md` pointed at the OLD checkout (dated 2026-09-08), which
> genuinely has no `auth/`, no `tools/`, no `/search`, no `/tiers`. Marie followed the map,
> as the paths rule says to, and so reported five real features as absent. **The live tree
> is the checkout `machine.local.md` now names** (2026-10-20); the owner gave that path when
> Atlas read it, and the map was not updated with it. `machine.local.md` now points at the
> live tree and names the old one as "do not read".
>
> 🔑 **The lesson for this desk, which is the reason this note stays:** the paths rule
> failed **not by a missing entry but by a STALE one**, and a stale map is more dangerous
> than no map, because it is followed confidently. **If something you read in a repo
> contradicts a fact in this file, suspect the path before you suspect the fact** — say so
> up the chain rather than "correcting" the fact.
> (Marie, raised 2026-10-20; settled by Atlas the same day; re-verified by Marie in the
> live tree.)

**Re-verified by Marie in the LIVE tree (the `develyst-ai` row in `machine.local.md`), branch `D1`, read-only,
2026-10-20** — nothing written, no branch switched, no git command other than reads.
⚠️ **Read from the WORKING TREE, which had 11 uncommitted files of the owner's own** (8
Bruno requests, `src/config/models.ts`, `src/demo.ts`, `src/providers/_fetch.ts`). That is
the right thing to read — it is what runs when he starts the gateway locally — but it means
**a later `git checkout` of a commit could differ.** If something below stops matching,
that is why; raise it rather than assuming the fact rotted:

- `POST /search/classify` — `src/routes/search.ts:67`, `search.post("/classify", …)`. **The
  fail-soft behaviour is real and explicit:** a classifier reply it cannot parse returns
  `{search:false, query:null, reason:"classifier_parse_failed"}` rather than throwing
  (`src/routes/search.ts:100–112`). ✅
- `POST /search` (Tavily) — `src/routes/search.ts`, mounted `app.route("/search", search)`;
  the Tavily call is `src/tools/webSearch.ts`. ✅
- `GET /tiers` — `src/index.ts:45`; the tiers are `small` / `medium` / `flagship`
  (`src/config/models.ts:23`), one model per tier per provider. ✅
- **Bearer auth and `api-keys.json` are real, and `fail-closed` is not a figure of
  speech** — `src/auth/keyStore.ts:15` reads `api-keys.json` from the gateway's working
  directory, and when it is **missing, unreadable or unparseable the gateway logs
  `all requests will be rejected (401)`** (`keyStore.ts:32`, `:58`). The middleware guards
  `/chat/*` and `/search/*` (`src/index.ts:17–18`). ✅
- 🔑 **BUT auth can be switched OFF, and the owner has said it is off for now** — so this
  desk needs **no project key to build and test today.** (owner via Atlas, 2026-10-20;
  re-verified by Marie in the live tree, `src/auth/authMiddleware.ts`.) Four properties,
  all read from the code, because each one catches somebody out:
  1. **`AUTH_ENABLED` is itself fail-closed** — only the literal `false` / `0` / `off`
     disable it (trimmed, case-insensitive, `:7–9`). **Any other value, or the variable
     being absent, leaves auth ON.** A typo cannot silently open the gateway.
  2. **It is read ONCE at start** (a module-level `const`, `:7`), unlike `api-keys.json`
     which hot-reloads. ⇒ **changing `AUTH_ENABLED` needs a gateway RESTART.** Flip it and
     nothing changes until the restart.
  3. **With auth off the request passes as `project = "anonymous"`** (`:25–28`) — it does
     **not** impersonate a real project, so the gateway's logs stay honest about which
     calls were unauthenticated.
  4. **`.env.example:9` ships `AUTH_ENABLED=true`**, so a fresh gateway install is closed
     by default and someone has to decide to open it.
  ⚠️ **The 401 failure mode still exists and is still the one to recognise — it is just not
  today's blocker:** *if the gateway runs with auth ON and this project has no key, every
  `/chat*` and `/search*` call is 401 and the pipeline answers nothing.*
  🔴 **This is the OWNER'S CALL PER ENVIRONMENT.** Auth off locally is not auth off in
  production, and nobody on this desk decides it, flips it, or assumes it — ask, and record
  the answer here for each environment before relying on it.
- ⚠️ **A 401 cannot tell you WHICH of three causes it is**, and that is deliberate in the
  gateway: the body is the same `{success:false, error:"unauthorized"}` for a missing or
  malformed `Authorization` header, for an unknown key, and (via the fail-closed key store)
  for a gateway whose `api-keys.json` is missing or corrupt (`authMiddleware.ts:19`,
  `:35–41`). ⇒ **"we got 401" is not a diagnosis.** Sober designs how the pipeline's own
  logging tells these apart; otherwise the team debugs the wrong end.
  (Marie, read-only verification 2026-10-20)
- 🔴 **Layer 3 needs a TAVILY key, which is a SEPARATE credential nobody has mentioned yet.**
  `src/tools/webSearch.ts:28–30`: with `TAVILY_API_KEY` unset the search tool returns
  `{error:"web search unavailable"}` and never throws, and `src/routes/search.ts:23–25`
  turns that into **HTTP 500 `{success:false, error:"web search unavailable"}`**. The same
  happens with `WEB_SEARCH_ENABLED=false` (`webSearch.ts:24–25`). `.env.example:16` notes
  *"empty → web search off (date/time still works)"*; the key is a free-tier one from
  tavily.com and it is **the owner's to supply**.
  🔑 **So turning auth off does NOT make layer 3 testable.** And note the asymmetry:
  **`/search/classify` still works without Tavily** (it is only an LLM call, and it is
  fail-soft), while **`/search` does not.** ⇒ a pipeline that classifies fine and then
  500s on every search is a *configuration* state, not an outage — **the code must tell
  those apart**, because the owner's layer 3 is "the BACKEND runs it".
  (Marie, read-only verification 2026-10-20 — not in ORDER 21 and not raised by anyone.)
- **Current date/time injection is real** — `src/providers/index.ts:9–12` builds a
  one-line local-time + UTC string on every call, timezone from **`AI_DATETIME_TZ`,
  default `Asia/Bangkok`**. ⇒ **do not re-send the date**, and do not prompt the model to
  guess it. ✅

**Also confirmed in the live tree (first survey, and still true):**

- Bun project, four providers (`src/providers/{openai,gemini,xai,deepseek}.ts`).
- **Fallback chain exactly `deepseek -> xai -> gemini -> openai`**
  (`src/providers/index.ts`, `FALLBACK_CHAIN`).
- `POST /chat`, `POST /chat/multi`, `GET /models`, `GET /` exist.
- **Production base URL `https://ai.develyst.online`**; local `http://localhost:3009`
  (Bruno `environments/*.bru`).
- **Response shape `{success, data:{...}}`** with `latency_ms` from the providers.
- 🔑 **The port is 3009 and there is no discrepancy** — `src/index.ts:47` codes
  `Number(process.env.PORT) || 3009`, so **3009 is the code default *and* the configured
  value**, and the Bruno `local` environment agrees. ⚠️ **The `PORT || 3002` reported
  earlier was the OLD checkout and is not a fact about this gateway** — do not record 3002
  anywhere as a default.

### The old survey, kept for provenance only

> The first survey (2026-10-20, ~22:10) was run against the OLD checkout because
> that is where the map pointed, and it found `/search/classify`, `/search`, `/tiers`,
> `api-keys.json` and date injection absent across all six refs, with `PORT || 3002`.
> **Every one of those readings was accurate about that tree and wrong about this
> product's gateway.** Nothing from it is actionable. It is kept in one paragraph because
> the next person who finds a fact "missing" should recognise the shape.



## Repos and environments

| Logical name | Owner | What it is |
|---|---|---|
| `fb-autoreply-back` | **Jason (BE)** | the whole product — Bun backend: FB webhook in, Send API out, the five-layer pipeline, Postgres |

- **Absolute paths live ONLY in the workspace-root `machine.local.md`.** Never write one
  into any file in this folder. (workspace `CLAUDE.md` -> "Paths & machines")
- ~~🔴 **`fb-autoreply-back` EXISTS AS AN EMPTY FOLDER AND IS NOT A GIT REPOSITORY.**
  Verified by Marie at desk-open: the folder is present and contains **zero files**;
  `git rev-parse --git-dir` -> *"fatal: not a git repository"*, and its parent is not one
  either. So nothing is written there until the owner has made it a repo.~~
  (Marie, read-only survey 2026-10-20, **~22:00 — SUPERSEDED, see below**)
- ✅ **CORRECTION, same day: the repo now EXISTS. The owner created and cloned it at
  22:15–22:16 on 2026-10-20, while this desk was being scaffolded.** Re-verified
  read-only by Marie at **22:17**, and these are the facts as read:
  - **a clone of `https://github.com/develyst1/fb-autoreply-back.git`** (`origin`, fetch
    and push)
  - **one commit: `80ffe34` "Initial commit"**, author **`D1 <develyst1@hotmail.com>`**
    (the owner), 2026-10-20 22:15:29 +0700
  - **contents: `.gitignore` (113 lines, Node-style) and `README.md` (one line,
    `# fb-autoreply-back`). No code, no `package.json`, no `src/`.** It is an empty
    starting point, not a project.
  - **working tree clean.**
  - **`.env` is already git-ignored** (`.gitignore` line 81), along with `.env.test` and
    `node_modules/` — so the secrets rule has somewhere to land on day one.
  🔑 **The original line is struck, not deleted** (this file's rule). Both observations
  are true of their own moment, and the first one is why the board carried a blocked row.
- **Working branch: `main`, and there is NO `develop` branch.** Verified read-only
  2026-10-20 22:17: `git branch -a` shows `* main` and `origin/HEAD -> origin/main`, and
  nothing else. 🔑 **Do not assume `develop`** — on this desk it does not exist. Whether
  work lands on `main` directly or on a branch the owner creates is **his call and is not
  yet stated**; ask before the first TASK says a branch name.
- 🔴 **It is still true that NO AGENT RUNS GIT** — no commit, no push, no branch, no tag,
  in this or any repo. The owner having made the repo changes what can be written; it does
  not hand any role git. (workspace `CLAUDE.md` rule 6)
- **Stack: Bun** (owner, 2026-10-20). **Postgres** (owner, 2026-10-20) — **the owner
  supplies the connection env himself. It is a named, EMPTY variable. Never invent one,
  never guess a host, never put a connection string in any file here.**
- **Greenfield.** Nothing exists yet, so **every invented rule becomes the product.**
  State the rule in a REQ/SPEC and have it ruled on; never let it arrive as a side effect
  of an implementation choice.

## 🔴 The test page — the owner's decision, 2026-10-20, and the conditions it rests on

**His decision:** **one of his own Facebook pages that currently has no conversations is
the test page.** He does **not** want a throwaway page created. (owner via Atlas,
2026-10-20)

**The conditions. The decision is sound only with these, so they are part of the fact:**

1. 🔴 **It is a REAL page he owns, chosen because it is QUIET — not because it is
   private.** *"Nobody talks to it"* is a fact about the **past**. The page is publicly
   reachable, so **a stranger can message it at any moment**, and mid-test the bot would
   answer them automatically **on his business's page.**
2. **The isolation mechanism is Meta's own: keep the Facebook App in DEVELOPMENT mode.** In
   that mode webhook events are delivered only for people holding a role on the app
   (admin / developer / tester), so a message from the public does not wake the bot at all.
   A real page with a real wall around it, at no cost.
   ⚠️ **This is NOT yet verified — Atlas could not check Meta's current behaviour, and
   nobody may assume it.** ⇒ **It is the team's FIRST verification task, before any
   end-to-end run:** message the page from an account with **no** app role and confirm **no
   webhook fires**; then from an account with a **tester** role and confirm one **does**.
   **Record the result here as a fact either way.** 🛑 **If it does not hold, stop and tell
   the owner before any end-to-end run** — that is a stop condition, not a finding to note
   and carry on from.
3. 🔴 **Going Live is the OWNER'S decision alone, and for safety purposes it is a one-way
   door** — from that moment the public can reach the bot. **No role proposes it, and
   nobody flips it to make a test easier.**
4. **QA footprint applies in full.** Every conversation Tanya creates on that page is **test
   data on a real surface**: declared in the TEST file's `## Test data created` and cleaned
   up, per the shared-environment rules already in her charter. And her standing rule —
   **never message a real person** — is now **load-bearing, not theoretical.**

**Environments — the hard line.**

| Environment | Who | What is allowed |
|---|---|---|
| Local (the developer's own machine) | the team | full — this is where evidence comes from |
| the LLM gateway, local (`localhost:3009`) | the team | call it; **never edit the `develyst-ai` repo** |
| the LLM gateway, production (`ai.develyst.online`) | **the human, alone** | 🚫 nothing |
| **the owner's quiet page = the TEST page** (a real page he owns) | the team, **only while the App is in DEVELOPMENT mode and that isolation has been VERIFIED** (see the section above) | test conversations, declared and cleaned up. 🛑 Isolation unverified or the App gone Live ⇒ **nothing** |
| **any other page of his, and this page once it is LIVE** | **the human, alone** | 🚫 **nothing — ever.** A message sent from here reaches a real member of the public |
| dev server / production for this product | **the human, alone** | 🚫 nothing — **neither exists yet**; when one appears it is written HERE and in `PROTOCOL.md` **before** anyone touches it |

🔴 **The absence of a technical guard is NOT permission.** This table is the only control
and it is absolute.

## Team (owner, 2026-10-20)

- **Porter** — PM / BA / PO / UX writer. The only role that talks to the owner, in Thai.
- **Sober** — SA Lead.
- **Jason** — BE, owns `fb-autoreply-back`.
- **Tanya** — Senior Tester (QA), hangs off Porter.
- **No FE.** There is no frontend. (owner, 2026-10-20)
- **QA is on this desk deliberately:** *"this thing talks to the public on the owner's own
  page, so 'it worked on my machine' is not a standard anyone should accept here."*
  (Atlas, 2026-10-20, ORDER 21)
- **Mode: MANUAL** — one session per role; the roles wake each other with the
  `nudge-session` skill, so manual no longer costs the owner a round trip per hop.
  (owner, 2026-10-20)

## Open questions for the owner — asked here by Marie at desk-open, answered here

These are **blocking**, and each has a row in `board.md`. Porter carries them to the owner
in Thai, **one decision at a time**.

1. ~~🔴 **Settle the gateway contradiction above.**~~ ✅ **SETTLED 2026-10-20 — Atlas's
   facts were right; the workspace map was pointing at an OLD checkout of the gateway.**
   Re-verified in the live tree. **Nothing is blocked by it; the whole pipeline may be
   designed.** The lesson is kept above under "ALL OF THE ABOVE IS CONFIRMED" because it is
   about the map, not the gateway. (Marie, 2026-10-20)
2. ~~🔴 **`git init` (or a clone) on `fb-autoreply-back`.**~~ ✅ **DONE by the owner
   himself at 22:15–22:16 on 2026-10-20**, while the desk was being scaffolded; re-verified
   read-only at 22:17 (see "Repos and environments"). **What is still open from it:
   whether work lands on `main` or on a branch he creates** — only `main` exists.
   (Marie, 2026-10-20)
3. 🔴 **The Postgres connection env.** Named and empty until he supplies it; nobody
   invents one. (ORDER 21, 2026-10-20)
4. ~~🔴 **A gateway project key for this desk** — hard-blocking; no key means 401 on every
   call.~~ ✅ **SETTLED 2026-10-20 — NOT BLOCKING. The owner says auth is off for now**, and
   with `AUTH_ENABLED=false` on the gateway this desk builds and tests the whole pipeline
   **with no key at all.**
   🔑 **The question was right under the facts as they stood** — the key store really is
   fail-closed and the 401 really is total; what changed is that **auth has a switch**, and
   the owner has used it. **What is still owed, and what is now merely a decision:**
   - **a decision, per environment, his:** whether auth is on where this product runs. Auth
     off locally is not auth off in production, and it **needs a gateway restart** to change.
   - **still a real failure mode:** auth ON + no key ⇒ 401 on everything, and a 401 does not
     say which of three causes it is (see the gateway section).
   - 🔴 **a NEW prerequisite that is not the project key: a TAVILY key**, without which
     `/search` — **layer 3 of his own pipeline** — returns HTTP 500 "web search
     unavailable". Free-tier from tavily.com, **his to supply.** This was on nobody's list.
   (owner via Atlas + Marie's re-verification, 2026-10-20)
5. ✅ **The test-page DECISION is made** (see "The test page" section) — ~~whether a test
   page exists~~ is settled: **a quiet page he already owns, isolated by keeping the App in
   DEVELOPMENT mode, with that isolation to be verified first.**
   🔴 **But the IDENTIFIERS are not, and the webhook cannot be started without them. Exactly
   five, all his:**
   **① the page name · ② the page ID · ③ the Facebook App ID · ④ a page access token ·
   ⑤ the webhook verify token.**
   **The decision is made; the values are not.** Nobody guesses, derives or substitutes any
   of the five, and ④ and ⑤ are secrets — git-ignored local `.env` only, never a REQ, a
   TASK, a log or pasted output. (owner via Atlas + Marie, 2026-10-20)
6. **What the bot is allowed to answer about.** `prompt-system.json` is named as the place
   the defences are documented, but its content is the owner's product decision, not the
   team's. (Marie, 2026-10-20)
