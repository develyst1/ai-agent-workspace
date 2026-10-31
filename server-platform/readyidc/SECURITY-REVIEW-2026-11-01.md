# Security review: ReadyIDC VPS (43.228.86.89), 2026-11-01

> Owner: *"อยากให้นายรีวิวแล้วรู้ทุกอย่างที่เขาเซต … ถ้าเกิดฉันซื้อเซิร์ฟเวอร์ใหม่ฉันอยากให้นายเป็นคนเซตอัพให้แต่ว่าอยากให้ได้รัดกุมแบบเนี้ย"*.
> The review was **read-only**: it reads the live box as `deploy` plus the root audit script. Nothing was changed.
> Every fix below needs the owner's go; firewall, sshd and sudoers changes are in OTTO.md's "explicit go" list.

## 1. Timeline: what was done to this box since it was bought

| When | Who | What (from `/var/log/apt/history.log` and the docs) |
|---|---|---|
| 2026-04-21 / 05-06 | ReadyIDC image | Ubuntu cloud image; `grub-pc`, `qemu-guest-agent`. Hostname `ubuntu2604` |
| 2026-10-28 04:28 | the owner's Mac AI | Rebuilt from the panel → `dist-upgrade` → `autoremove` |
| 2026-10-28 04:34 | the owner's Mac AI | `fail2ban` + `python3-systemd`; `jail.local` with the OpenSSH-10 `journalmatch` fix |
| 2026-10-28 04:37 | the owner's Mac AI | `nodejs` (NodeSource 24, pinned) + `nginx` |
| 2026-10-28 | the owner's Mac AI | `sshd_config.d/00-hardening.conf`; UFW 22/80/443; unattended-upgrades on; user `deploy` (sudo, key-only) |
| 2026-10-31 | Otto | pm2 (as deploy) + boot unit; Cloudflare Origin cert; nginx catch-all; new-app/deploy-app + narrow sudoers; CI key (forced command); ClamAV + rkhunter + daily audit; fail2ban aggressive; root's key removed |

## 2. What is already good (keep this as the baseline on any new server)

| Area | Setting | Why it matters |
|---|---|---|
| SSH | key only, no root login, no password, no keyboard-interactive (`00-hardening.conf`, first file wins) | Stops password guessing outright: the classic way cheap VPSes get taken |
| SSH | the provider's `99-custom.conf` (root + password ON) is overridden by `00-` | The provider image re-enables passwords; this is the trap |
| Users | only `root` and `deploy` have a shell; only `deploy` is in `sudo`; root has **no SSH keys** | Small surface |
| Keys | one key per machine, each with a comment; the CI key is forced to `ci-deploy`, no shell | A stolen CI key can only deploy |
| sudo | the agent never holds the password; NOPASSWD only for `new-app` (validates every argument), `nginx -t`, `nginx reload`, `security-audit` | A stolen deploy key ≠ root |
| Firewall | UFW default deny in; only 22/80/443 | |
| fail2ban | sshd jail with the OpenSSH 10 fix, aggressive mode | |
| Updates | unattended security upgrades daily | |
| Apps | each app runs as `deploy` under pm2 on `127.0.0.1` only; nginx in front; secrets only in `/srv/apps/<app>/shared/.env` (600) | No app port is reachable from outside; secrets not in git |
| TLS | Cloudflare Origin cert (key 600 root) | |
| Unknown hosts | nginx default_server → 444 / TLS rejected | Scanners hitting the IP get nothing **for unknown names** |
| Kernel (Ubuntu defaults) | ASLR 2, `kptr_restrict` 1, `dmesg_restrict` 1, unprivileged BPF off, ptrace scope 1, protected links, syncookies, no IP forward, AppArmor on | |
| Monitoring | daily audit at 20:30: logins, keys, config hashes, ports, rkhunter, ClamAV, patches → `server-audit/` | Tampering shows up within a day |

## 3. Gaps found, most serious first

| # | Gap | Evidence | Risk | Fix (needs the owner's go) |
|---|---|---|---|---|
| **1 ✅ FIXED 2026-11-01** | **Cloudflare Access can be bypassed.** (Fixed: UFW 80/443 from Cloudflare ranges only. Direct `--resolve` now times out; through Cloudflare still 302.) Ports 80/443 accept the whole internet, so anyone who sends `Host: blueprint-sit.develyst.online` straight to `43.228.86.89` gets the app with **no login** | `curl --resolve blueprint-sit.develyst.online:443:43.228.86.89 https://…/` → **200, `<title>Blueprint</title>`**; through Cloudflare → 302 to the login | **HIGH.** Access only guards traffic that goes through Cloudflare. The front proxies to the back (no login) and to the LLM gateway | UFW: allow 80/443 **only from Cloudflare's published IP ranges** (+ refresh them monthly). Optional extra layer: Cloudflare *Authenticated Origin Pulls* (mTLS) |
| 2 | **Self-lockout risk from aggressive fail2ban** (it happened: OF-010) | This PC's IP banned on :22; 443 fine | MEDIUM (availability) | `ignoreip` for the admin machines, or back to `normal` mode. Keep the Mac as the second way in |
| 3 | Provider drop-in `99-custom.conf` (root + password **yes**) still on disk | file present | MEDIUM: one rename of `00-hardening.conf` and passwords are back | Delete it, or overwrite it with the hardened values |
| 4 | SSH extras still on: `X11Forwarding yes`; TCP/agent forwarding default yes; no `AllowUsers`; `MaxAuthTries` 6 | `sshd_config` | LOW–MEDIUM: tunnels through the box | `AllowUsers deploy`, `X11Forwarding no`, `AllowTcpForwarding no`, `AllowAgentForwarding no`, `MaxAuthTries 3`, `LoginGraceTime 30` |
| 5 | Clock **not synchronised** | `timedatectl` NTPSynchronized=no | MEDIUM: wrong log times; TLS and token checks can fail | Check chrony's sources; allow NTP out |
| 6 | Kernel security fixes wait for a manual reboot | unattended-upgrades `Automatic-Reboot` off | MEDIUM | `Automatic-Reboot "true"` at 03:00 (boot resurrect is proven), or a monthly reboot window |
| 7 | Unneeded services enabled: ModemManager, open-vm-tools (VMware tools on a KVM box), multipathd, open-iscsi, snapd, lxd-installer, udisks2, apport | `systemctl list-unit-files` | LOW: more code running as root | Disable/mask the ones a VPS never uses |
| 8 | Small sysctl gaps: `send_redirects=1`, `log_martians=0`, `suid_dumpable=2` | sysctl | LOW | `/etc/sysctl.d/90-hardening.conf` |
| 9 | No backups of what lives only on the box: `/srv/apps/*/shared/.env`, `ports.tsv`, `/etc` configs | — | MEDIUM (recovery) | Nightly encrypted copy off the box |
| 10 | The apps' **Postgres (old Windows box 154.197.124.206:5432) is open to the internet**; the DB password travels from this box over the internet | port reachable from here and from the PC | **HIGH**, but on another box | Firewall it to this box's IP + require SSL, or move the DB. The owner's call (Otto does not touch that box) |
| 11 | Zone SSL mode is `Full`, not `Full (strict)`: Cloudflare does not verify the origin cert | Cloudflare dashboard | LOW–MEDIUM | A Configuration Rule: Full (strict) for this box's hostnames |
| 12 | The sudo password is the one key to root | — | depends on its strength | Long random password in a password manager |
| 13 | The provider can run commands inside the VM (`qemu-guest-agent`) and has the panel Console | installed by the image | inherent to any VPS | Accept, or mask `qemu-guest-agent` (the panel may lose features) |

**Status 2026-11-01 00:45:**
- ✅ fixed: gaps 1, 2 (fail2ban `ignoreip`), 3 (`99-custom.conf` removed), 4 (sshd extras), 7 (services), 8 (sysctl).
- ⏳ gap 5: chrony rejected the KVM PHC refclock, the old config was restored, and the clock is still right via kvm-clock.
- Open: gaps 6, 9, 11, 12; gap 10 is the owner's.

## 4. Recipe for a new server: same as this box, plus the fixes

Order matters: get the second way in ready before closing the first.

1. **Buy / rebuild.** Note the SSH host-key fingerprint from the panel Console (`ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub`).
2. **Console as root:** create `deploy` (sudo group, long random password), put **one key per admin machine** in
   `/home/deploy/.ssh/authorized_keys`. Do not give root any keys.
3. **SSH:** write `/etc/ssh/sshd_config.d/00-hardening.conf`:
   - root off, password and keyboard-interactive off;
   - `AllowUsers deploy`, `MaxAuthTries 3`, `LoginGraceTime 30`;
   - no X11, TCP or agent forwarding.

   **Delete the provider's drop-ins** that turn passwords back on. Run `sshd -t`, then reload, **with a second session open**. Prove it: one password attempt is refused.
4. **Updates:** `apt dist-upgrade`, then unattended-upgrades with automatic reboot at 03:00. Check that chrony is synced.
5. **Firewall (UFW):** default deny in; 22 from anywhere (key-only + fail2ban); **80/443 from Cloudflare ranges only**.
6. **fail2ban:** the sshd jail with the OpenSSH-10 `journalmatch`; `ignoreip` = the admin machines; `normal` or `aggressive` mode.
7. **Kernel and services:** a sysctl hardening file (item 8); disable the unused services (item 7); keep AppArmor on.
8. **Platform:**
   - nginx with the catch-all (444 / reject handshake) and `server_tokens off`;
   - the Cloudflare Origin cert;
   - pm2 as `deploy` + the `pm2-deploy` unit;
   - `new-app` / `deploy-app` / `ci-deploy` and their sudoers (copies in `server-platform/readyidc/`).
9. **Audit:** ClamAV (no daemon) + rkhunter (`APT_AUTOGEN`) + `security-audit` + the 20:30 schedule; take the first run as the baseline.
10. **Cloudflare:** DNS records proxied; Access for any app without its own login; SSL Full (strict) for the new hostnames.
11. **Backups** (item 9), then **prove a reboot** brings every app back.

All of it in **one reviewed root script per sitting** (one password), each step with its check. That turns steps 3–9 into
about two sittings on a fresh box.

## 5. Suggested order to fix this box

1. **Gap 1, the Access bypass:** UFW 80/443 to Cloudflare ranges only. Most urgent; one root sitting.
2. Gap 2 (fail2ban `ignoreip`), 3 (delete `99-custom.conf`), 4 (sshd extras), 5 (NTP), 8 (sysctl) and 7 (services): the same sitting.
3. Gap 6 (auto-reboot), 9 (backups), 11 (strict SSL rule): next.
4. Gap 10 (the Windows box's Postgres open to the internet): the owner decides; it is not on this box.
