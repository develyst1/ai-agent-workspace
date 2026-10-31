---
name: new-server-setup
description: "Load when the workspace's Release & Platform role (OTTO.md) sets up a NEW Linux server for the owner from a fresh provider image, rebuilds one, or audits an existing one against the owner's hardening baseline. It is the owner's standard recipe, learned on the first VPS (2026-10/11): key-only SSH, provider drop-in traps, a firewall that lets only Cloudflare reach the web ports, fail2ban without self-lockout, unattended updates with reboot, kernel and service trimming, the app platform (nginx catch-all, origin cert, pm2 as a user, new-app/deploy-app/ci-deploy), the daily audit, backups and the reboot proof. Use with platform-preflight and platform-security. Do NOT load for desk roles, for app code, or for Windows servers."
---

# new-server-setup — the owner's hardened Linux server, from bare image to deploy platform

The owner's history: *"เคยซื้อลีนุกซ์มาแล้วแม่งโดนแฮกทุกรอบ"*. He wants every new box set up by the platform role,
**at least as tight as the first VPS, plus its fixes**. Owner, 2026-11-01: *"ให้นายจดแล้วทำให้มันเป็นของตัวเองซะ
เพราะว่าเวลาฉันจะไปทำที่อื่นอ่ะฉันก็จะใช้นายนี่แหละ"*.

**This skill is the method only.** Each server's facts (IP, host key, keys, ports, apps) go into its own
`SERVER-FACTS.md` section the moment you learn them. The first box's scripts are the templates: `server-platform/readyidc/`.
The reasoning behind every step: `server-platform/readyidc/SECURITY-REVIEW-2026-11-01.md`.

## Before you start

- Load **platform-preflight** (six gates) and **platform-security**.
- **Ledger (gate 3):** the owner chooses the provider, the size, the domain and which apps. You confirm unanswered choices in one line.
- **Root work:** plan it as **two sittings, one reviewed script each, one password each** (gate 4). Sitting A covers steps 2–7, sitting B steps 8–11.
  - **Sitting A runs before `deploy` exists**, so the owner runs it as root: either in the panel Console, by pasting a short `curl`-free script you show him, or over the provider's first root SSH if it gives one.
  - It ends with root SSH **off**. Sitting B then runs as `deploy` via `ssh -t <alias> "sudo sh <script>"`.
- **The first box's files are templates, not drop-ins.** Replace its domain, IPs (`ignoreip`, `__SERVER__`) and host key. Give the new box its own `server-platform/<name>/` folder, handbook and SERVER-FACTS section, and its own entry in `machine.local.md` → "Otto": a new key per machine.
- Keep **two ways in** at every step: your SSH session and the provider's web Console. Never close one before the other is proven.

## The steps (each ends with its check)

1. **Fresh image, trusted host.** In the panel Console, read the host-key fingerprint (`ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub`). Write it to SERVER-FACTS. Pin it on the first connection (platform-security §2).
2. **Users and keys.**
   - Create `deploy` (group `sudo`, a long random password the **owner** keeps).
   - Put **one key per admin machine** in `/home/deploy/.ssh/authorized_keys`, each with a comment.
   - **Root gets no keys.**
   - ✔ `ssh deploy@host` works with each key.
3. **SSH lock-down.**
   - Write `/etc/ssh/sshd_config.d/00-hardening.conf`: `PermitRootLogin no`, `PasswordAuthentication no`, `KbdInteractiveAuthentication no`, `PubkeyAuthentication yes`, `AllowUsers deploy`, `MaxAuthTries 3`, `LoginGraceTime 30`, `X11Forwarding no`, `AllowTcpForwarding no`, `AllowAgentForwarding no`.
   - **Trap:** providers ship drop-ins that turn passwords back on (ReadyIDC: `99-custom.conf`). sshd keeps the **first** value read, so `00-` must stay first. **Delete or neutralise every provider drop-in** too.
   - ✔ `sshd -t`; ✔ `sshd -T | grep -E "permitrootlogin|passwordauthentication|allowusers"`; ✔ **exactly one** password attempt is refused, with your old session still open.
4. **Updates.**
   - `apt dist-upgrade`.
   - unattended-upgrades on, with `Automatic-Reboot "true"` at `03:00`. This is safe only once step 11 proves the apps come back.
   - ✔ `chronyc tracking` shows the clock is synced. The first box was not, so check.
5. **Firewall (UFW).**
   - Default deny in. `22/tcp` from anywhere (key-only + fail2ban).
   - **80/443 only from Cloudflare's ranges** (cloudflare.com/ips-v4, /ips-v6). Template: `ufw-cloudflare-only.sh`.
   - Otherwise anyone can hit the IP directly and **bypass Cloudflare Access**. That happened on the first box.
   - ✔ Direct `curl --resolve <host>:443:<ip>` times out; through Cloudflare it works.
   - Re-check the ranges monthly.
6. **fail2ban.**
   - sshd jail with `backend = systemd`.
   - On Ubuntu 26.04 / OpenSSH 10, set `journalmatch = _SYSTEMD_UNIT=ssh.service + _COMM=sshd + _COMM=sshd-session`, or it bans nobody.
   - Mode `aggressive` only **with `ignoreip`** for the admin machines' current IPs, or keep `normal`.
   - The first box banned its own admin PC (OTTO-FAILURES OF-010). **Never probe :22 with bare TCP checks.**
   - ✔ `fail2ban-client status sshd`.
7. **Kernel and services.**
   - `/etc/sysctl.d/90-hardening.conf`: `net.ipv4.conf.all.send_redirects=0`, `net.ipv4.conf.default.send_redirects=0`, `net.ipv4.conf.all.log_martians=1`, `fs.suid_dumpable=0` (Ubuntu already sets the rest).
   - Disable what a VPS never uses: ModemManager, open-vm-tools on non-VMware hosts, multipathd, open-iscsi, snapd and lxd-installer when no snaps are needed, udisks2, apport.
   - Keep AppArmor on.
   - ✔ `sysctl -n` for each key; ✔ `systemctl is-enabled`.
8. **Web front door.**
   - nginx with `server_tokens off` only once: Ubuntu's `nginx.conf` already has it, and a second copy breaks `nginx -t`.
   - The catch-all `00-default-drop.conf`: `444` on 80, `ssl_reject_handshake` on 443.
   - The Cloudflare **Origin Certificate** in `/etc/ssl/cloudflare/` (key root 600, never via chat), and `snippets/cloudflare-origin-tls.conf`.
   - ✔ `nginx -t`; ✔ an unknown name gets nothing.
9. **App platform.**
   - pm2 **as deploy** (npm prefix `~/.local`, pinned version), `pm2 startup` → unit `pm2-<user>`, plus `pm2-logrotate`.
   - Install `new-app` (validates every argument; `--private` for back ends without a login), `deploy-app` (health check + auto-rollback, keeps current + previous) and `ci-deploy` (the CI key's forced command), with their **narrow** sudoers.
   - Templates: `server-platform/readyidc/`.
   - ✔ `sudo -n new-app --help` works and `sudo -n ls /root` is refused; ✔ a throwaway app proves deploy, then a broken deploy proves rollback. **Remove it after, and check the full `pm2 list`.**
10. **Watch it.**
    - ClamAV (no `clamd`; it needs ~1 GB RAM) and rkhunter (`--no-install-recommends`, `APT_AUTOGEN="true"`, `--propupd` baseline).
    - The read-only `security-audit` + its sudoers rule + the daily 20:30 run.
    - ✔ The first run is the baseline. Record the known false positives in SERVER-FACTS.
11. **Prove and protect.**
    - **Reboot with real apps** and prove they come back.
    - Back up off the box: every `shared/.env`, the port registry and `/etc`.
    - Add every new key, rule and service to SERVER-FACTS and the box's handbook in the same action.
12. **Cloudflare (the owner clicks; you list every host first).**
    - Proxied records; **Access** for any app without its own login.
    - SSL **Full (strict)** for this box's hostnames via a Configuration Rule, never by flipping the whole zone while other origins live in it.

## Raise every time you set up a box: SSH off the public port

The owner deferred this on 2026-11-01 but asked to hear it again: *"เอาไว้ นำเสนอ หรือ หาทางที่มันดีกว่านี้อีกมา ครั้งหน้า"*.
- Before step 5, put it to him in at most 5 lines: SSH reachable only through a private network, so port 22 is closed to the internet.
- Give **at least two options, compared:** Tailscale (+ its GitHub Action for CI), and Cloudflare Tunnel / Access for SSH (+ a service token for CI). Look for a better one too.
- Recommend one and say what CI needs. He decides.

## After the set-up

- Every app goes through `new-app` then CI (`.github/workflows/deploy-sit.yml`). Add the repo secrets **before** the first push. If the first push to a new `sit` branch shows no run, push an empty commit.
- Any database lives elsewhere: allow only this box's IP, require SSL, one user per app. **Never leave a database port open to the internet** (the old Windows box did).
- Report to the owner in about 5 short Thai lines (OTTO.md § How you report). Tables, output and reasoning go into the files.
