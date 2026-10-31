# REQUEST: Atlas → Otto, 2026-10-31: a daily security audit of every Linux server

**Owner, verbatim:** *"ฉันอยากให้ออโต้ทำการเช็คว่าเซิร์ฟเวอร์โดนแฮกไหมมีไวรัสไหมทุกวันวันละครั้ง"* … *"เริ่มเลยเอาสักเป็นประมาณ2 ทุ่ม 3 ทุ่มได้"*.
Scope: Linux servers only (`OTTO.md`). Today that is the ReadyIDC VPS (`SERVER-FACTS.md` S2).

## The shape

- **On the server:** one root-owned, **read-only** script, `/usr/local/bin/security-audit`. It takes **no arguments** and
  prints a plain-text report.
- **A sudoers rule** lets `deploy` run exactly that script without a password, and nothing more:
  `/etc/sudoers.d/security-audit`: `deploy ALL=(root) NOPASSWD: /usr/local/bin/security-audit ""`. Check it with `visudo -c`.
- **Every day at 20:30** a scheduled task (`otto-daily-security-audit`, already created by Atlas) opens an Otto session.
  The session runs `ssh readyidc 'sudo -n /usr/local/bin/security-audit'`, compares the output with yesterday's report,
  and writes `server-audit/<server>/<YYYY-MM-DD>.md` at the workspace root.

## What the script checks (each section headed, so a diff is readable)

1. **Logins, last 24 h:** successful SSH logins (user, IP, key fingerprint), from `journalctl -u ssh --since -24h`.
   Also the failed-login count and fail2ban's currently banned IPs.
2. **Who can get in:** the fingerprint of every key in every user's `authorized_keys` (root's included), users with
   a login shell, members of `sudo`, `/etc/sudoers.d/` file names + sha256.
3. **Config integrity:** sha256 of the sshd config and its drop-ins, `jail.local`, the UFW rules, and the nginx
   config tree. Also `sshd -T` (permitrootlogin / passwordauthentication) and `ufw status`.
4. **What is running:** listening ports (`ss -ltnup`); the top 10 processes by CPU; any process whose binary lives
   in `/tmp`, `/dev/shm` or `/var/tmp`, or whose binary was deleted; enabled systemd units; every user's crontab
   + `/etc/cron.*`.
5. **What changed:** files under `/etc`, `/usr/local/bin` and `/srv` modified in the last 24 h (names only).
6. **Rootkit:** `rkhunter --check --sk --rwo` (warnings only).
7. **Virus:** `clamscan -r -i --no-summary /home /srv /tmp /var/tmp /etc` (infected files only). The signature
   database is kept fresh by the `clamav-freshclam` service. **No clamd daemon**: it would hold about 1 GB of the 6 GB RAM.
8. **Patching:** pending security updates, and whether `/var/run/reboot-required` exists.

Read-only means the script never deletes, quarantines or changes anything. A finding is reported, never "fixed".

## Report format (`server-audit/<server>/<date>.md`)

- **Line 1 is the verdict:** `🟢 ปกติ` or `🔴 พบสิ่งผิดปกติ: <one line>`.
- Then **"Changed since yesterday"**: only the differences. Then the full output.
- **🔴 is raised for:** a login from an IP or key not in `SERVER-FACTS` S2.9; a new key, user, sudoer, cron or
  systemd unit nobody recorded; a new listening port; a process running from `/tmp` or `/dev/shm`; any
  rkhunter warning that is not on the recorded known-false-positive list; any ClamAV hit; a config hash that
  changed with no matching entry in `SERVER-FACTS`.

## Build steps, each with its check (load `platform-security` first)

1. **Owner, one sudo session:** `apt install clamav rkhunter`, then `freshclam`, then `rkhunter --propupd`
   (the baseline). Check: `clamscan --version`, `rkhunter --versioncheck`.
2. **Install the script** (root-owned, mode 755) and the sudoers rule. Check: `sudo -n /usr/local/bin/security-audit`
   works as `deploy`, and `sudo -n ls /root` is refused.
3. **First run = the baseline.** Record any known rkhunter false positives in S2. Write the first report.
4. Add the script, the sudoers rule and the audit schedule to `SERVER-FACTS.md` S2.2.

The owner types the sudo password in his own terminal. You never see it.
