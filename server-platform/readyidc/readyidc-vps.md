# ReadyIDC VPS — server handbook

> Last updated: 2026-11-01 by Otto (firewall to Cloudflare only, SSH and fail2ban hardening, cold-start fixes). No passwords or private keys in this file.
> **This page is the CURRENT state.** SERVER-FACTS S2.1–S2.8 describe the starting state of 10-28/10-31; where they disagree, trust this page, then the live box.
> **Claude:** read this first, then check the live server before acting. This file can be out of date; the server is the truth.
> The full dated record (every change, check and rollback) is the workspace's `SERVER-FACTS.md` → "Server 2".
> **This file is the handbook** (owner 2026-10-31: *"คู่มือ ไม่ต้องใช้แล้ว จดไว้ที่นายนี่แหละ"*). The old Mac copy
> `~/Documents/servers/readyidc-vps.md` is retired; don't update it.

## The server

| | |
|---|---|
| Provider | ReadyIDC — https://customer.readyidc.com (Services → vpsgame149701) |
| IP | `43.228.86.89` |
| OS | Ubuntu 26.04.1 LTS, x86_64 |
| Size | 4 CPU · 6 GB RAM · 60 GB disk (no swap) |
| Login | `ssh deploy@43.228.86.89` — SSH key only |
| SSH host key | `SHA256:X44qS1jtk6HvSY3qQtPlqA2Iglwxnzd+sQRni8tag0U` (ED25519) |

## Who can get in

- **`deploy`**: the only SSH user, in group `sudo`. `sudo` asks for deploy's password (the owner's), except for the narrow rules below.
- **`root`**: SSH login is off, and root has **no keys** (the Mac key was removed 2026-10-31). Root's password, shown in the panel, works only in the panel **Console**.
- **Keys allowed** in `/home/deploy/.ssh/authorized_keys`, one per line:
  1. The owner's MacBook Air, `entronica@Mac.localdomain`. The owner's way in.
  2. The owner's Windows PC, `otto@KUYDONG-win-2026-10-31`. Otto (Claude) uses it from that PC.
  3. GitHub Actions, `github-ci@blueprint-2026-10-31`, **shared by both blueprint repos** (made before the one-key-per-repo rule). **Restricted:** it can only run `ci-deploy`, which deploys one app from stdin. It gets no shell. Its private half exists only in those two repos' GitHub secrets, so **every new repo gets its own new CI key** (skill `platform-deploy-app` §3).
- `sshd` allows **only user `deploy`** (`AllowUsers`), with no TCP, agent or X11 forwarding and `MaxAuthTries 3`.
- fail2ban never bans the admin machines (`ignoreip`: the PC `223.24.156.113` and the Mac `202.129.207.248`). **These are home IPs and change.** When an admin IP changes, update `ignoreip` in `/etc/fail2ban/jail.local` (one sudo).
- To revoke a key, delete its line (find it by the comment at the end).

## Locked out? Use the panel Console

1. ReadyIDC panel → the server → **Console**.
2. Log in as `root` with the password from the panel.
3. Fix the key or the setting.

**Rebuild** wipes the whole disk. **Cancel VPS** ends the rental. Don't press either by accident.

## Give another computer or person access (one key each)

Make a separate key for each person or machine. Never hand out your own `~/.ssh/id_ed25519`.

```bash
ssh-keygen -t ed25519 -f ~/Desktop/deploy-key-NAME -C "NAME"
```

```bash
ssh deploy@43.228.86.89 "cat >> ~/.ssh/authorized_keys" < ~/Desktop/deploy-key-NAME.pub
```

Give the person the private file **in person** (AirDrop, USB). Add the key to the list above.

## What is set up

| Item | State | Where |
|---|---|---|
| SSH | root login off, password login off, key only, `AllowUsers deploy`, no forwarding, `MaxAuthTries 3` | `/etc/ssh/sshd_config.d/00-hardening.conf` |
| Kernel / services | `/etc/sysctl.d/90-hardening.conf`; unused services disabled (ModemManager, multipathd, udisks2, apport, snapd, lxd-installer, iscsi, open-vm-tools). `qemu-guest-agent` is kept for the panel | `systemctl enable --now <unit>` to undo |
| Clock | **not NTP-synced**: the provider blocks UDP 123, and chrony refused the KVM PHC clock. The time is right via kvm-clock today. Open item | `chronyc tracking` |
| Firewall (UFW) | allow in only 22 (anywhere) and **80/443 from Cloudflare's IP ranges only** (since 2026-11-01). Hitting the IP directly gets nothing, so Cloudflare Access cannot be bypassed. Re-check the ranges monthly against cloudflare.com/ips-v4 and /ips-v6 | `sudo ufw status verbose`; script `server-platform/readyidc/ufw-cloudflare-only.sh` |
| fail2ban | sshd jail, **mode aggressive** (also bans scanners that leave before a password try). 5 tries in 10 min → 1 h ban | `/etc/fail2ban/jail.local` |
| Auto updates | security updates daily | unattended-upgrades |
| Node.js | v24 LTS (NodeSource, pinned) | |
| Nginx | 1.28. Unknown hostnames get nothing: port 80 returns `444`, port 443 rejects the TLS handshake | `/etc/nginx/sites-available/00-default-drop.conf` |
| TLS | **Cloudflare Origin Certificate** `*.develyst.online` + `develyst.online`, valid until 2041-10-27 | `/etc/ssl/cloudflare/origin.{pem,key}`; every site includes `snippets/cloudflare-origin-tls.conf` |
| pm2 | 7.1.1 installed **as deploy** at `/home/deploy/.local/bin/pm2` (call it by full path in scripts); systemd unit `pm2-deploy` starts the saved apps at boot; pm2-logrotate keeps 10 MB × 7 files | `~/.pm2/` |
| Daily security audit | `/usr/local/bin/security-audit` (read-only: logins, keys, configs, ports, rkhunter, ClamAV, patches). Runs every evening at 20:30 from the workspace; reports go to `server-audit/readyidc/<date>.md` | sudoers: `/etc/sudoers.d/security-audit` |
| Database | **none on this box.** The apps use Postgres elsewhere (connection string in each app's `.env`) | |

## The deploy platform (built 2026-10-31)

**Deploying = merge into the `sit` branch and push, from any machine.** GitHub Actions builds and tests the code, then
sends the build to the server. The server switches the app to it, checks it answers, and **switches back by itself if it
does not**.

```
push to sit → GitHub: install → tests → build → ssh deploy@43.228.86.89 <app> < app.tgz
            → server: ci-deploy → deploy-app → new release → health check → keep it, or roll back
```

| Piece | What it does |
|---|---|
| `sudo new-app <name> <static\|process> [--host x.develyst.online] [--start "cmd"] [--health /path] [--private]` | Sets up an app once: `/srv/apps/<name>/`, a port from `/srv/apps/ports.tsv` (3001 up), its pm2 config, and an nginx site with HTTPS. `--private` = no website, reachable only on `127.0.0.1` (for back ends without a login). Deploy may run it without a password. |
| `deploy-app <name> <file.tgz>` | Runs on every deploy, as deploy. Extracts into `releases/<time>/` and links `shared/.env`. Switches `current`, reloads, then checks health for 30 s. Rolls back on failure. Keeps current + 1 previous release. |
| `~/.local/bin/ci-deploy` | The only thing the GitHub key may run: it takes the app name and the file, then calls `deploy-app`. |
| Secrets | Each app's `.env` lives only at `/srv/apps/<name>/shared/.env` (mode 600), never in git. |
| Copies of every script | Workspace `server-platform/readyidc/`. |

**Apps on the box now**

| App | Port | Public? | Repo / CI |
|---|---|---|---|
| `blueprint-sit` (front, Next.js) | 3002 | `https://blueprint-sit.develyst.online`, **behind Cloudflare Access** (owner's email, one-time PIN) | `develyst1/blueprint-front`, push to `sit` → typecheck + Playwright isolation + build + deploy |
| `blueprint-back-sit` (Bun binary) | 3001 | **private** (127.0.0.1 only; it has no login) | `develyst1/blueprint-back`, push to `sit` → bun test + build + deploy |

**Adding a new app: follow the skill `platform-deploy-app`.** The workflow templates are in
`server-platform/templates/`, and each repo gets **a new CI key**. In short:
1. `ssh readyidc 'sudo -n /usr/local/bin/new-app <name> process [--private]'` (no password; `--private` when the app has no login of its own).
2. Write its `.env` to `/srv/apps/<name>/shared/.env` without printing values.
3. Public app without a login: add a Cloudflare Access app for its hostname **before** the first deploy.
4. Make a new restricted CI key for the repo. The owner adds the secrets `DEPLOY_SSH_KEY` (that key) and `DEPLOY_KNOWN_HOSTS` (the line `43.228.86.89 ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINO46McohnNqw2yzCIBgifptHr7kB3V4qIn6o6AL1xv/`) **before** the first push.
5. The owner commits the workflow and pushes to `sit`. If Actions shows nothing, he pushes an empty commit.

## Cloudflare (zone `develyst.online`)

- DNS: `A * 43.228.86.89` (proxied). Names with their own record keep pointing where they point; old sites still live on the old Windows server (`154.197.124.206`).
- SSL mode: **Full** (zone-wide, left as it was). The 10-30 brief planned "Full (strict)", but it was **not applied**: zone-wide it would hit the old Windows sites. The plan instead (review gap 11, open) is a Configuration Rule setting Full (strict) for this box's hostnames only.
- Zero Trust (Free), team `aged-fire-690b`: Access app `blueprint-sit`, policy `owner only`.

## Gotchas found on this server

- ReadyIDC's image adds `/etc/ssh/sshd_config.d/99-custom.conf`, which turns root and password login back on. **It was removed 2026-11-01**, but a panel Rebuild or password reset may bring it back. `00-hardening.conf` must stay first, because sshd keeps the first value it reads. The daily audit lists the drop-ins, so a returning `99-custom.conf` shows up there.
- fail2ban on Ubuntu 26.04: `jail.local` needs its own `journalmatch` line (OpenSSH 10 logs from `sshd-session`). Keep it.
- Ubuntu's `nginx.conf` already sets `server_tokens`; setting it again in `conf.d/` breaks `nginx -t`.
- `sudo` is `sudo-rs`. The password is remembered only inside one SSH session, so put root work in one script per sitting.
- pm2 ignores a config file unless it is named like `ecosystem.config.cjs`.
- A `.tgz` made on Windows loses the executable bit. Use `tar --mode=755` for binaries; CI builds on Linux, so it does not hit this.
- The compiled blueprint-back needs a real Postgres; `pglite:memory` crashes it.
- After a reboot, SSH takes about 1 minute.

## Health check

```bash
ssh -t deploy@43.228.86.89 'sudo ufw status; sudo fail2ban-client status sshd; sudo sshd -T | grep -E "^(permitrootlogin|passwordauthentication) "; systemctl is-active nginx pm2-deploy; ~/.local/bin/pm2 list'
```

## Not done yet

- Swap: none. Not needed at today's load (blueprint front + back ≈ 220 MB of 5.9 GB). Add 2 GB when more apps arrive.
- Front CI does not run the Playwright `states` / `required` specs (owner: enough for now).
- Back up `~/.ssh/id_ed25519` from the Mac into a password manager. Losing it means using the Console.
- **SSH off the public port** (Tailscale or Cloudflare Tunnel/Access for SSH; CI needs a way in too). The owner deferred it on 2026-11-01 and asked to hear it again, with a better option if one exists. Raise it at the next security talk or new server.
