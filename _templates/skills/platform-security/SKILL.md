---
name: platform-security
description: "Load when acting as the workspace's Release & Platform role (OTTO.md) on any server the workspace runs (Linux or Windows) before any access, key, sudo/admin, install, firewall, SSH, DNS/Cloudflare, certificate or secret change, and after it for the audit. Covers SSH key lifecycle, host-key trust, sudo without holding the password, root-run installs and pinning, fail2ban self-lockout, secrets placement, Cloudflare zone-wide changes as a neighbour risk, sshd/firewall drop-in gotchas, and the audit after every change. Do NOT load for desk roles (they never touch a server), for app code, or to justify a change the owner has not asked for."
---

# platform-security — how the platform role keeps a server safe

**Server facts live in `SERVER-FACTS.md` (one section per server). This skill is the method only; it never
holds an IP, a user name of a person, or a key.** If the facts file and the live box disagree, the box is the
truth: re-read it, write the new reading into the facts file with its date, then act.

## 0. The question before every change

**"If I am wrong, what else breaks, and can I get back in?"** Two things are never risked:
1. **Your own way back in** (SSH, the panel Console, RDP). Never change sshd, the firewall, fail2ban or
   keys without a second session already open and a tested way back.
2. **The neighbours.** A shared nginx, a shared pm2, a zone-wide Cloudflare setting, a shared database:
   a change there touches every app on it. Name the blast radius in your report *before* you act.

## 1. SSH keys — one per machine, never shared

- **One key per machine or agent**, with a comment that says which (`<role>@<machine>-<date>`). Never copy
  a person's own key to another machine.
- **Passphrase:** a key an agent must use unattended may have none, **only if** all of these hold:
  it lives on one machine, its private file is readable only by that machine's user (Windows:
  `icacls <key> /inheritance:r /grant:r "<user>:R"`; Linux: `chmod 600`), it is listed in the server's
  facts with its fingerprint, and the account it reaches has **no passwordless sudo beyond a narrow,
  validated rule**. Otherwise use a passphrase and `ssh-agent`.
- **Every key added or removed goes into the facts file's access log** in the same action: comment,
  fingerprint, machine, date, who added it.
- **Revoke** = delete that key's line from `authorized_keys`, then prove it: a login with that key fails.
- **Back up** the owner's own key in his password manager; losing it means the panel Console.

## 2. Trust a host only after checking it

- Before the first connection: `ssh-keyscan -t ed25519 <host> | ssh-keygen -lf -` and compare with the
  fingerprint in the facts file. Match → pin it in `known_hosts`. No match or no recorded value → **stop
  and ask the owner**. Never answer "yes" to an unknown-host prompt.
- Client config per server: `StrictHostKeyChecking yes`, `IdentitiesOnly yes`, `PasswordAuthentication no`,
  `IdentityFile <that key>`.

## 3. sudo / admin without holding the password

- **An agent never holds, asks for, or types the owner's password,** and never asks for it in chat.
- Hand the owner one exact command for **his own terminal** (`ssh -t <alias> "sudo …"`), say what it does
  and what it changes, and read its output afterwards.
- **One sudo call does one thing.** Never bundle an install, a config change and a restart into one
  `sudo sh -c`; the owner should be able to read what he is approving.
- A passwordless sudoers rule is only for **one named script with validated arguments** (plus the web
  server's test/reload). The script is root-owned and not writable by the user it serves. Check the rule
  file with `visudo -c`. Prove it: the allowed command works with `sudo -n`, and `sudo -n ls /root` is refused.

## 4. What runs as root

- **Least privilege first.** Install language tools under the service user (for example an npm prefix in
  `$HOME`) and call them by **absolute path** in scripts and CI. Use root only for the steps that truly need
  it (`pm2 startup`, a system service, a package from the OS repo).
- **Never pipe a download into a shell as root** (`curl … | sudo sh`). Download, read it, check its
  checksum, then run it.
- **Pin versions** (`pkg@x.y.z`, an apt pin file). Record each pinned version in the facts file.
- A global package install as root runs that package's install scripts as root. If you must do it, pin
  the version and say so in the report.

## 5. Don't lock yourself out

- **Linux fail2ban:** at most **one** deliberate failed login to prove password login is off, never a loop.
  Know the ban threshold from the facts file before testing anything that can fail.
- **sshd drop-ins:** sshd keeps the **first** value it reads. A provider drop-in (for example
  `99-custom.conf`) may turn root or password login back on. A hardening file must sort **first** (`00-…`).
  After any sshd change: `sshd -t`, then `sshd -T | grep -E "permitrootlogin|passwordauthentication"`,
  then reload — with your old session still open.
- **Firewall:** add the new allow rule before you remove an old one, and never close the SSH/RDP port.
- **Windows:** the RDP and WinRM rules and the admin account are the way back in. Never change them
  without the owner present.

## 6. Secrets

- An app's secrets live **only on the server**: Linux `/srv/apps/<app>/shared/.env` mode `600`, owned by
  the service user; Windows: the app's `.env` with an ACL for the service account only.
- **Never** in git, in a build artifact, in a log, in chat, or in the facts file. Name the *file* that holds
  a secret, never its value.
- CI secrets go into the repo's secret store, set by the owner. A deploy key made for CI is used **only** by CI.

## 7. DNS, Cloudflare and certificates (neighbour risk)

- **Zone-wide settings hit every host in the zone.** Before changing an SSL mode, a wildcard record or a
  firewall rule for a zone, list every host in that zone and its origin. Prefer a **per-hostname rule**
  (Cloudflare Configuration Rules) over a zone-wide switch when only new hosts need it.
- **A wildcard record** catches every name without its own record. Before adding it, confirm every live
  host has an explicit record, and that the origin drops unknown names (`default_server` → `444`).
- Certificates: record each one's expiry in the facts file. An expired certificate on a neighbour turns
  into errors the moment a strict mode is enabled.

## 8. Audit after every change

After any change, run that server's health check from its facts file and paste the output into your report:
- Linux: `ufw status`, `fail2ban-client status sshd`, `sshd -T` (root/password login), the changed
  service's `is-active`, `nginx -t`, and login history from `journalctl -u ssh`.
- Windows: the changed service's state, `nginx -t`, `pm2 list`, the listening ports.
- Then update the facts file: what changed, when, the check output, and how to roll it back.

**Not audited = not done.**
