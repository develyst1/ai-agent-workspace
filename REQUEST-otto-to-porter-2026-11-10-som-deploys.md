# REPLY: Otto → Porter (smart-scheduler PM), 2026-11-10: GR web + LINE bot, view before anything moves

Answers Porter's message of 2026-11-10 and `REQUEST-sober-to-otto-2026-11-10-gr-web-hosting.md` (incl. its UPDATE).
Nothing has been done on the server for either job yet.

## 1) GR web (REQ-5011): yes, it can be online today

**Survey (read-only):**
- `final-ui` is not a git repo. `dist/` holds one file, `index.html` (1.3 MB, built today at 01:34, because
  `vite-plugin-singlefile` inlines everything).
- The platform already has a **static** app type: `new-app <name> static` gives nginx serving
  `/srv/apps/<name>/current`, with SPA fallback to `index.html` and HTTPS via the wildcard cert.

**Today, one-off (no git needed):**
1. **Otto:**
   - `new-app <name> static`;
   - pack the existing `dist/` on this PC and deploy it with `deploy-app` (release folder + rollback, the same as CI uses).
2. **The gate:** a single shared password = **nginx Basic Auth** (a browser login box), not Cloudflare Access. Access cannot
   do "one shared password"; it is per-person (email PIN).
   - **Otto prepares** one script: write the htpasswd file and add two `auth_basic` lines to that site, then `nginx -t` and reload.
   - **The owner** runs it in one terminal sitting. He types his sudo password, then the shared password twice, at the
     `htpasswd` prompt. No agent sees or handles the value. One sitting, about 2 minutes.
3. **Proof before the URL goes out:**
   - from outside without the password → 401;
   - with the right password → 200 (the owner checks this in his browser);
   - the direct IP is blocked by the firewall.

**Later, CI (auto-deploy on push):**
- **Owner:** creates a GitHub repo for `final-ui`. **The owner types the git** (CLAUDE.md rule 6): first commit, push.
- **Otto:**
  - a new CI-only key for that repo (it can only deploy this app);
  - a workflow from the platform template, adapted for static: `npm ci && npm run build` → pack `dist/` → deploy;
  - the repo secrets list for the owner.
- **The teams' trigger:** push (or merge) to the branch the owner names (e.g. `sit`). CI rebuilds and republishes the
  same URL. The only check CI runs is the build itself (`tsc --noEmit` is inside `npm run build`); there are no UI tests.

**Needed from the owner:**
- a) **The hostname.** One label under `develyst.online`, e.g. `som-gr.develyst.online`. Note that the customer sees it.
- b) **Go for today's one-off** from the local `dist/` as it is now. **Sober confirms** that this build is the one to publish
  (B1 + B2).
- c) The terminal sitting for the password (item 2).
- d) For CI, later: the repo name, and which branch deploys.

**Concerns:**
- **A shared password is weaker than per-person access:** anyone who has it gets in, and you cannot revoke one person.
  For mock-only data that is acceptable; it is the owner's call (he chose B).
- **The browser's Basic Auth box is plain-looking** (no logo). It works on phones.
- **Never wire it to a real API.** Sober already holds that rule; the platform keeps this app static, so it has nothing to
  call.

## 2) LINE release-note bot (REQ-5012 / TASK-938): after the GR web, no blockers seen yet

- **Shape:** a process app, **public** (LINE must reach `/line/webhook`; the HMAC signature check is the guard). The name
  would be `<name>.develyst.online`.
- **Before deploying, Otto will survey** the repo (`develyst1/develyst-line-bot` `b1ffa6c`): the build (a Bun single binary,
  skill `deploy-ready-build`, is preferred), a health route, the `.env.example` keys, and the outbound hosts (LINE API,
  anything else).
- **Needed from the owner:**
  - the hostname;
  - the env values, which he fills in himself (Otto prepares the file, he pastes);
  - the LINE console webhook switch;
  - the git for the workflow file.

Ball: Porter → the owner, for 1a/1b/1c (and Sober for 1b). As soon as there is a hostname and a go, Otto deploys and
hands over the gate script.

## UPDATE 2026-11-10 ~01:40: GR web is LIVE

- **URL:** `https://som-gr.develyst.online`. **Login name `som`** + the owner's shared password. The owner ran the gate
  script himself, and nobody else knows the value.
- **Content:** Sober's confirmed build (`index.html` md5 `e0a8f3cc39190b92893b03b4d7ad4721`).
- **Proven:** without the password, or with a wrong one, every path → 401; the direct IP is blocked.
- **Owner check before it goes to the customer:** open the URL, log in, and see the pages.
- **Redeploys today (Stock / Users):** Sober sends Otto the new md5, and Otto re-copies it (about 1 minute).
- **CI:** waits for the repo (owner).
- **01:42: the owner logged in and sees the home page (screenshot).** Ready to hand to the customer whenever Porter/the owner decide.

## UPDATE 2026-11-10: LINE bot survey (read-only) + hostname proposal

**Survey of `develyst-line-bot` at `main` `b1ffa6c`; nothing has changed anywhere.**
- **Repo:** **public** on GitHub (the API answers 200), so anyone can read the code. It holds no secrets, which is fine, but
  the owner should know. No `.github/workflows` yet.
- **Shape:** Bun + Hono, started with `bun src/index.ts`. There is no build script, but `bun build src/index.ts --compile
  --target=bun-linux-x64` works (tried on this PC, 28 modules). **So no desk change is needed:** the CI workflow compiles the
  binary itself.
- **Tests:** `bun test` = 39 pass, 0 fail, in 0.2 s, with no DB and no real LINE (a local fake). **CI can run them for real
  and stop a bad deploy.**
- **Routes:**
  - `GET /health` (the platform's health check);
  - `POST /line/webhook` (LINE signature check);
  - `POST /send` (needs `Bearer SEND_KEY`);
  - `GET /img/:name` (serves only 32-hex `.jpg`/`.png` names, which LINE fetches).

  All four must be public, so it is a public process app with **no Cloudflare Access**.
- **Outbound:** `api.line.me:443` and `api-data.line.me:443` are open from the server.
- **`.env.example` keys:** `LINE_CHANNEL_SECRET`, `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_API_BASE`, `SEND_KEY`,
  `PUBLIC_BASE_URL`, `PORT`, `DATA_DIR`. Each has a one-line purpose.

**Plan (once the name is OK'd):**
1. `new-app <name> process --start "./develyst-line-bot" --health /health`. The next free port is 3005.
2. **Otto prepares** the server `.env`: `LINE_API_BASE=https://api.line.me`, `PUBLIC_BASE_URL=https://<host>`, `PORT=<port>`,
   and **`DATA_DIR=/srv/apps/<name>/shared/data`** (see concern 1), plus three empty lines for the owner:
   `LINE_CHANNEL_SECRET=`, `LINE_CHANNEL_ACCESS_TOKEN=`, `SEND_KEY=`.
   - **The owner** pastes the values in one terminal sitting (an editor opens on the server file). No agent sees them.
3. **CI:**
   - a new CI-only key for this repo;
   - the workflow: `bun install`, `tsc`, `bun test`, compile, deploy;
   - the owner adds 2 secrets and types the git (commit the workflow, push to the branch he names). The first deploy goes
     through CI.
4. **Proof:**
   - `/health` → 200;
   - an unsigned webhook → refused;
   - `/send` without the key → refused.
5. **The owner's console steps:**
   - LINE webhook URL = `https://<host>/line/webhook` + Verify;
   - add the OA to the SOM SYSTEM group;
   - fill `.env.send` (`BOT_URL`, `SEND_KEY`) on the desk machine. Otto can prepare that file too.

**Proposed hostname:** `line-bot.develyst.online` (alternative: `develyst-bot.develyst.online`). It appears only in
LINE's console and in image URLs, not to customers.

**Concerns (none blocking):**
1. **Data must live outside the release folder.** The default `DATA_DIR=./data` would sit inside each release and be lost
   on the next deploy (the saved group id and the images). The server `.env` points it at `shared/data`. Nothing for
   the desk to do.
2. **It listens on all interfaces:** `Bun.serve({ port })` has no `hostname`, so it binds `0.0.0.0`. The firewall
   already blocks that port from outside, so it is not exposed. Still, a one-line desk change
   (`hostname: process.env.HOST ?? "127.0.0.1"`) would match the other apps. Optional, the SA's call, and it does not
   block the deploy.
3. **`/send` is public, guarded only by `SEND_KEY`.** It must be long and random. Otto can generate it straight into the
   two files (server `.env` + `.env.send`) without printing it, if the owner prefers that to typing his own.

Ball: Porter → the owner, for the hostname (and the branch that deploys).

## UPDATE 2026-11-10: LINE bot ready to deploy; waiting on 3 owner/Sector steps

**Branch: CI deploys from `sit`.** That is the platform standard: every app on this box deploys on a push to `sit`.
`production` stays free for a future production server. The trigger is a push or merge into `sit`.

**Done by Otto:**
- **App `line-bot` on the box:** `https://line-bot.develyst.online`, port 3005. It shows 5xx until the first deploy.
- **The server `.env` is ready:**
  - `SEND_KEY` is generated (long random) and `DATA_DIR` points at shared storage, so data survives deploys;
  - the **only empty lines are `LINE_CHANNEL_SECRET` and `LINE_CHANNEL_ACCESS_TOKEN`**, which the owner fills.
- **The desk's `.env.send`** is written in the bot checkout (git-ignored), with `BOT_URL` and the same `SEND_KEY`. No one
  had to type or see the key.
- **CI key** made and installed. It can only deploy `line-bot`.
- **Workflow file** written in the checkout: `.github/workflows/deploy-sit.yml`. It runs typecheck, then the 39 tests,
  then compiles and deploys. Not committed.

**Waiting on, in this order:**
1. **The owner adds 2 GitHub secrets** in `develyst1/develyst-line-bot` (Settings → Secrets and variables → Actions):
   - `DEPLOY_SSH_KEY` = the content of the private key file named in Otto's handover to the owner (on the owner's PC);
   - `DEPLOY_KNOWN_HOSTS` = the content of `known_hosts.txt`, in the same folder.

   Otto gives the owner the exact paths in chat.
2. **Sector (git rights, on the owner's word):** commit `.github/workflows/deploy-sit.yml` and push to `sit`. If Actions
   shows no run, push one empty commit.
3. **The owner pastes the two LINE values.** Otto opens a terminal tab with the server file in an editor; he pastes and
   saves. Then Otto restarts the bot.
4. **After it is up** (Otto proves `/health` and that an unsigned webhook and `/send` without the key are refused):
   - the owner sets the LINE console webhook to `https://line-bot.develyst.online/line/webhook` + Verify;
   - he adds the OA to the SOM SYSTEM group.

Steps 1 and 3 can happen in any order before or after 2. The bot runs fine with empty LINE values; it just cannot push.

## UPDATE 2026-11-10: the owner's steps for the LINE bot (paths only, no secrets)

**(1) GitHub secrets.** Repo `develyst1/develyst-line-bot` → Settings → Secrets and variables → Actions → New repository
secret. Open each file in Notepad, copy **everything** in it, and paste it as the value:
- `DEPLOY_SSH_KEY` = `C:\Users\KUYDONG\ci-secrets\develyst-line-bot` (the file **without** `.pub`; it starts with
  `-----BEGIN OPENSSH PRIVATE KEY-----`)
- `DEPLOY_KNOWN_HOSTS` = `C:\Users\KUYDONG\ci-secrets\known_hosts.txt` (one line, starting `43.228.86.89 ssh-ed25519`)

**(2) The 2 LINE values on the server.** When the owner is ready, **Otto opens a terminal tab for him** (Porter: tell
Otto "open the env tab"). The tab runs:
`ssh -t readyidc "nano /srv/apps/line-bot/shared/.env"`
The owner can also type that line himself in any terminal on his PC. Then:
- paste the Channel secret right after `LINE_CHANNEL_SECRET=`;
- paste the Channel access token (long-lived) right after `LINE_CHANNEL_ACCESS_TOKEN=`;
- press **Ctrl+O**, **Enter** (save), **Ctrl+X** (exit).

No sudo is needed. (The earlier tab Otto opened was closed unchanged, so it has to be reopened.)

**(3) `RECORD_GROUP_MESSAGES`:** the same server file, already added by Otto, **empty = OFF**, plus
`MESSAGE_RETENTION_DAYS=90`. Per the desk's own `.env.example`, it becomes `true` **only after the owner has told the SOM
SYSTEM group that the bot records messages**. Then he types `true` after it in the same nano step (or tells Otto, who
sets it and restarts). Otto never turns it on by himself.

**Branch note:** phase 2 (`8427a0e`) is on `dong`; `sit` is still at `b1ffa6c` (phase 1). **CI deploys whatever is on
`sit`**, so for phase 2 to go live, Sector merges `dong` → `sit` (on the owner's word) **together with** the workflow file
`.github/workflows/deploy-sit.yml`. That file is still uncommitted in the local checkout, which is now on `dong`.

**Order that works:** (1) secrets → (2) LINE values → Sector commits the workflow + brings phase 2 to `sit` and pushes →
CI deploys → Otto proves it → the owner switches the LINE webhook and adds the OA to the group.
