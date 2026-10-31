---
name: platform-deploy-app
description: "Load when the workspace's Release & Platform role (OTTO.md) must put a project's app onto the owner's Linux deploy platform for the first time (e.g. the owner says 'deploy <project>', 'เอา <repo> ขึ้น sit'), or add CI to a repo already on it. Step by step: survey the repo and the desk's docs, new-app (public or --private), the server .env, Cloudflare Access for apps with no login, a CI-only key per repo, the workflow from server-platform/templates, the repo secrets before the first push, the empty-commit trigger, and proof through the real path. Proven on blueprint-front/back (2026-10-31). Use with platform-preflight (all six gates). Do NOT load for setting up a new server (new-server-setup), for desk roles, or for writing app code."
---

# platform-deploy-app — the owner's next app onto the platform

**Method only.** The server's facts (IP, host key, ports, apps, keys) are in the server's **handbook**
(`server-platform/<server>/readyidc-vps.md` today) and `SERVER-FACTS.md`. The templates are in `server-platform/templates/`.
The proven example to copy is blueprint (front + back, 2026-10-31), recorded in SERVER-FACTS S2.9.

**Load `platform-preflight` first.** Every gate applies. These steps say where each gate bites.

## Who asks, who types git

- **Onboarding an app the first time is provisioning:** the owner asks Otto directly (OTTO.md § The chain).
- **Later releases happen by his merge to `sit`;** CI does the rest. If a desk's SA asks for a release instead, the desk's PM + QA gate applies (OTTO.md).
- **Git in a code repo is never typed by an agent on its own judgement** (CLAUDE.md rule 6). The owner types it himself (the blueprint precedent), or orders the desk's SA through the PM. You write the file and give him the exact commands.

## 0. Before anything (gates 1–3)

- **Gate 1, look first.**
  - Repo paths are in `machine.local.md`.
  - What does `package.json` build to? It should be the owner's shape: Next `output: "standalone"` + static copy, or `bun build --compile --target=bun-linux-x64` (skill `deploy-ready-build`). If it is not, the desk makes it so; **you do not edit app code.**
  - Does the repo already have `.github/workflows/`? Is it public or private?
  - What does the working local `.env` hold? **Keys and host:port only, never values.** Can the server reach that host:port?
- **Gate 2, read the desk.** Read the REQ/SPEC/TASK that made the build deploy-ready, plus the desk's `SYSTEM-FACTS.md` deploy lines. Known limits live there; for blueprint, "the binary needs Postgres, pglite crashes it". **Quote the line you rely on.** The desk is often barred from deploy work by the owner (*"เรื่องฝั่ง deployment ไม่ต้องแตะอะไรเลย"*), so the deploy side is yours, but the code is theirs.
- **Gate 3, ask in one message, as a few short questions:**
  - which branch becomes `sit`;
  - which apps are public, and does the app have its own login;
  - which database.

  **An answer covers only its question.**

## 1. Decide public or private (security, not taste)

- **No login of its own ⇒ never public.**
  - A back end: `--private` (127.0.0.1 only; only its front calls it).
  - A front: public, but **behind Cloudflare Access** (Zero Trust → Access → Applications → Self-hosted, hostname, policy = the owner's email, One-time PIN) **before** its first deploy.
- **The firewall lets only Cloudflare reach 80/443**, so Access cannot be bypassed by hitting the IP. Keep it that way.

## 2. On the server (no password needed)

```
ssh <alias> 'sudo -n /usr/local/bin/new-app <name> process [--private] [--start "./<binary>"] [--health /health]'
```

- **Name:** `<project>-sit` (front) and `<project>-back-sit` (back). The host becomes `<name>.develyst.online`, one label only.
- **`.env`:** write `/srv/apps/<name>/shared/.env` (600), **without printing values**.
  - Pipe the owner's local `.env` straight in, if he says so (blueprint: *"ก็อปไปทั้ง env เลยสิ"*).
  - Append the server-only lines: `SOURCES_DIR=/srv/apps/<name>/shared/...`, and the front's `…_API_URL=http://127.0.0.1:<back port>`.
- The port comes from `new-app`'s output and `/srv/apps/ports.tsv`. **Never guess it.**

## 3. CI key: a new one per repo

- The old CI key's private half lives **only inside GitHub**. You cannot copy it to a new repo, so **make a new key per repo**:
  - make it in a private folder on the PC (ACL that user only);
  - comment `github-ci@<repo>-<date>`;
  - append its `.pub` to `/home/deploy/.ssh/authorized_keys` as `command="/home/deploy/.local/bin/ci-deploy",restrict ssh-ed25519 …`.
- **Prove it:**
  - `ssh -i <key> deploy@<server> id` → refused ("no app id");
  - `... <name> < some.tgz` → deploys.
- Record its fingerprint in SERVER-FACTS (access log) and the handbook key list in the same action.
- `DEPLOY_KNOWN_HOSTS` = the server's line from `known_hosts` (`<ip> ssh-ed25519 AAAA…`). It is not secret.

## 4. The workflow file (the owner commits it, never you)

- Copy `server-platform/templates/deploy-sit.bun-binary.yml` or `…next-standalone.yml` to `<repo>/.github/workflows/deploy-sit.yml`.
- Replace `__APP__`, `__BINARY__` and `__SERVER__`.
- Keep a test step that the repo can really run. Gate 6: say which tests run and which do not.
- **Order for the owner:**
  1. Add **both secrets** (repo → Settings → Secrets and variables → Actions) **before** pushing.
  2. Commit, then `git push origin <branch> <branch>:sit`. You give the exact commands; the owner runs git.
  3. If Actions shows nothing for that first push, he pushes an empty commit: `git commit --allow-empty -m "ci: trigger deploy-sit"`, then push again. GitHub can miss the push that creates the branch.
- Then delete the private key files from the PC (the folder may stay busy until Explorer closes).

## 5. Prove it (gate 6)

- **The run is green.**
  - A public repo can be read via `api.github.com`, but only 60 calls an hour, so poll at most once a minute.
  - Otherwise watch the server's `current` symlink change.
- **On the box:** `/health` ok, one route that **reads the database** returns 200, the front's page and one `/_next/static` file return 200.
- **From outside:**
  - the public URL gives **302 to the Access login**;
  - `curl --resolve <host>:443:<ip>` **times out** (the firewall);
  - the owner opens it in his browser.
- **One failing case through CI** at least once per repo (a failing test stops the deploy), and a rollback proof.
- **Clean-up:** `/tmp` artifacts, `~/ci-incoming` empty, the full `pm2 list` and dump.

## 6. Write it down in the same action

- SERVER-FACTS S2.9 entry.
- Handbook: the "Apps on the box" table, the key list, and the port.
- Anything the desk should know (e.g. slow tests): tell the owner. Don't route it to the desk yourself.

## Known traps (each cost a round on blueprint)

- **`ecosystem.config.cjs`:** pm2 ignores any config not named like that.
- **Tar from Windows:** loses the exec bit, so use `--mode=755`. CI on Linux does not hit this.
- **Frozen lockfile:** `bun install --frozen-lockfile` can fail on the owner's Windows bun but passes on the Linux runner.
- **Next standalone built on Windows:** it carries Windows `sharp`. Build on Linux (CI).
- **Bun's 5 s test limit:** too short on the runner, so use `--timeout 20000`.
- **Playwright `webServer` uses `next start`:** it warns with standalone. It works, but it is not the exact server.js. That config is the desk's.
